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
```

- `POLAR_OAT_TOKEN`: Polar Organization Access Token
- `POLAR_WEBHOOK_SECRET`: Polar Webhook Secret (`polar_whs_...`)

## 5) 환경값 확인 (`wrangler.toml`)

기본값(이미 설정됨):

- `POLAR_MODE = "sandbox"`
- `DEFAULT_PRODUCT_ID = "45ee4c82-2396-44bd-8249-a577755cbf9e"`
- `ALLOWED_ORIGINS = "https://ninanoo.com,https://www.ninanoo.com,...localhost..."`
- `ALLOWED_HOSTS = "api.ninanoo.com,localhost,127.0.0.1"`
- `AUTO_REFUND_ENABLED = "false"`
- `AUTO_REFUND_PRODUCT_IDS = "45ee4c82-2396-44bd-8249-a577755cbf9e"`
- `AUTO_REFUND_EMAIL_DOMAIN_DENYLIST = ""`
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
    "productId": "45ee4c82-2396-44bd-8249-a577755cbf9e",
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
npx wrangler deploy
```
