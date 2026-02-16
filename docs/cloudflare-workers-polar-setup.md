# Cloudflare Workers 결제 API 설정 가이드 (ninanoo.com)

## 1) 프로젝트 구조

```text
workers/
  polar-checkout-worker/
    package.json
    tsconfig.json
    wrangler.toml
    src/
      index.ts
```

## 2) Polar 토큰 권한(Scopes)

현재 Worker 기능 기준 최소 권장:

- `checkouts:write` (체크아웃 생성)
- `orders:read` (결제 성공 확인 API)
- `refunds:write` (자동 환불)
- `refunds:read` (환불 결과 확인)

## 3) 로컬 준비

```bash
cd workers/polar-checkout-worker
npm install
npx wrangler login
```

## 4) 시크릿 등록

토큰은 파일에 쓰지 말고 Wrangler Secret으로만 등록하세요.

```bash
cd workers/polar-checkout-worker
npx wrangler secret put POLAR_OAT_TOKEN
npx wrangler secret put POLAR_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OPENAI_API_KEY
```

- `POLAR_OAT_TOKEN`: Polar Organization Access Token
- `POLAR_WEBHOOK_SECRET`: Polar Webhook Secret (`polar_whs_...`)
- `RESEND_API_KEY`: Resend API Key (`re_...`)
- `OPENAI_API_KEY`: OpenAI API Key (`sk-...`)

## 5) 환경값 확인 (`wrangler.toml`)

기본값(이미 설정됨):

- `POLAR_MODE = "production"`
- `DEFAULT_PRODUCT_ID = "09ed8b9c-c328-4962-a12f-69923155d3c6"`
- `ALLOWED_ORIGINS = "https://ninanoo.com,https://www.ninanoo.com,...localhost..."`
- `ALLOWED_HOSTS = "api.ninanoo.com,localhost,127.0.0.1"`
- `AUTO_REFUND_ENABLED = "false"`
- `AUTO_REFUND_PRODUCT_IDS = "09ed8b9c-c328-4962-a12f-69923155d3c6"`
- `AUTO_REFUND_EMAIL_DOMAIN_DENYLIST = ""`
- `REPORT_EMAIL_FROM = "Ninanoo Report <no-reply@ninanoo.com>"`
- `REPORT_EMAIL_REPLY_TO = ""` (선택)
- `REPORT_EMAIL_SUBJECT_PREFIX = "[ninanoo]"`
- `PREMIUM_REPORT_ENABLED = "true"`
- `PREMIUM_REPORT_PRODUCT_IDS = "09ed8b9c-c328-4962-a12f-69923155d3c6"`
- `OPENAI_MODEL = "gpt-4.1-mini"`
- `PREMIUM_REPORT_MAX_TOKENS = "900"`
- `routes.pattern = "api.ninanoo.com/*"`

## 6) 로컬 테스트 (배포 전)

터미널 1 (Worker API):

```bash
cd workers/polar-checkout-worker
npx wrangler dev --port 8787
```

터미널 2 (정적 사이트):

```bash
cd /home/user/productbuilderw1
python3 -m http.server 8000
```

브라우저에서:

- `http://127.0.0.1:8000/pages/payment.html`

`payment.html` 결제 버튼은 로컬 환경에서 자동으로 `http://127.0.0.1:8787/create-checkout`을 호출합니다.

## 7) 배포

```bash
cd workers/polar-checkout-worker
npx wrangler deploy
```

## 8) 도메인/라우트 설정 순서 (ninanoo.com)

1. Cloudflare Dashboard > `ninanoo.com` 존 확인
2. Workers & Pages > `ninanoo-polar-checkout` 워커 배포 확인
3. Worker Routes 확인
   - `api.ninanoo.com/*` -> `ninanoo-polar-checkout`
4. DNS에서 `api.ninanoo.com` 레코드가 프록시(orange cloud) 상태인지 확인
5. 헬스체크
   - `https://api.ninanoo.com/health`

## 9) 엔드포인트 목록

- `POST /create-checkout`: 결제 세션 생성
- `GET /payment-status?order_id=<ORDER_ID>`: 결제 상태 확인
- `POST /webhooks/polar`: Polar webhook 수신 + 조건부 자동환불

## 10) Polar Webhook 설정

Polar Dashboard > Developers > Webhooks:

- URL: `https://api.ninanoo.com/webhooks/polar`
- 이벤트 구독:
  - `order.paid` (자동 환불 트리거)
  - `order.updated` (상태 추적용)
  - `order.refunded` (환불 결과 추적용)

## 11) API 사용 샘플

### checkout 생성

```bash
curl -X POST "https://api.ninanoo.com/create-checkout" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "09ed8b9c-c328-4962-a12f-69923155d3c6",
    "successUrl": "https://ninanoo.com/pages/payment.html#payment-success",
    "returnUrl": "https://ninanoo.com/pages/payment.html"
  }'
```

### 결제 상태 조회

```bash
curl "https://api.ninanoo.com/payment-status?order_id=order_xxx"
```

## 12) 자동환불 규칙

자동환불은 `order.paid` 웹훅 수신 시 아래 조건을 확인해 실행합니다.

1. `AUTO_REFUND_ENABLED=true`
2. 주문 상품이 `AUTO_REFUND_PRODUCT_IDS`에 포함
3. 추가 조건 중 하나 만족
   - `order.metadata.auto_refund=true`
   - 결제 이메일 도메인이 `AUTO_REFUND_EMAIL_DOMAIN_DENYLIST`에 포함

주의: 결제 "실패"는 원칙적으로 청구가 되지 않아 환불 대상이 아닙니다.
자동환불은 "결제 성공 후 정책상 즉시 취소" 시나리오에 사용합니다.

## 13) 운영 전환

- `wrangler.toml`의 `POLAR_MODE`를 `production`으로 변경
- production 토큰/웹훅 시크릿 재등록:

```bash
npx wrangler secret put POLAR_OAT_TOKEN
npx wrangler secret put POLAR_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```

## 14) 결제 후 프리미엄 리포트 이메일 자동 발송

`/webhooks/polar`에서 `order.paid` 이벤트를 처리하면, 환불 대상이 아닌 주문에 대해 OpenAI로 프리미엄 리포트를 생성해 Resend로 발송합니다.

- 수신자: Polar 결제 단계에서 고객이 입력한 이메일(`order.customer_email`)
- 발송 조건: `RESEND_API_KEY`, `REPORT_EMAIL_FROM`, `OPENAI_API_KEY`가 설정되고, 결제 이메일 형식이 유효한 경우
- 참고: `REPORT_EMAIL_FROM`의 도메인(`ninanoo.com`)은 Resend에서 Verified Domain으로 인증되어 있어야 합니다.
- 실패 처리: OpenAI 생성 실패 시 fallback 리포트로 대체하고, 이메일 발송 실패가 있어도 웹훅 응답은 정상(`200`) 유지
- 응답 필드:
  - `premiumReportQueued`: 백그라운드 발송 큐 등록 여부
  - `premiumReportReason`: 큐 등록 실패 사유(예: `report_email_not_configured`, `missing_customer_email`, `invalid_customer_email`, `product_not_eligible`)
