# Analytics QA Checklist

목적: `js/analytics.js` 공통 계측 레이어가 prod/local 모두에서 에러 없이 동작하고, 이벤트명/props가 `docs/ANALYTICS_EVENTS.md`와 일치하는지 확인합니다.

## 1) 빠른 스모크 체크(명령)

```bash
scripts/analytics-smoke-check.sh
```

스테이징 도메인:

```bash
SITE_URL=https://staging.ninanoo.com scripts/analytics-smoke-check.sh
```

## 2) 브라우저 콘솔 기본 확인

1. 대상 페이지 진입 (`/`, `/pages/report-intake.html`, `/pages/payment.html`, `/pages/report-result.html`)
2. DevTools Console에서 실행:

```js
window.NinanooAnalytics
JSON.parse(localStorage.getItem('ninanoo.analytics.queue.v1') || '[]').slice(-5)
JSON.parse(localStorage.getItem('ninanoo.analytics.user.v1') || '{}')
```

3. 수동 핑:

```js
window.NinanooAnalytics.track('qa_ping', { source: 'manual_check' })
```

4. queue 증가 확인:

```js
JSON.parse(localStorage.getItem('ninanoo.analytics.queue.v1') || '[]').slice(-3)
```

## 3) 핵심 플로우별 이벤트 확인

1. 추천/슬롯/공유
- `recommend_click`
- `alternative_option_click`
- `share_click`
- `slot_spin_started`
- `slot_result_shared`

2. report-intake -> 결제
- `report_intake_viewed`
- `report_intake_step_completed`
- `payment_started`

3. 결제 상태/리포트
- `payment_success`
- `report_generated_completed`
- `report_resent`
- `report_pdf_saved`

4. 인증
- `login_success`
- `signup_success`

## 4) PII 차단 확인

1. 아래 테스트 실행:

```js
window.NinanooAnalytics.track('pii_test', { email: 'test@example.com', phone: '010-0000-0000', ok: true })
```

2. queue 마지막 이벤트의 `props`에 `email/phone` 키가 없는지 확인:

```js
JSON.parse(localStorage.getItem('ninanoo.analytics.queue.v1') || '[]').slice(-1)
```

## 5) identify 해시 확인

1. 실행:

```js
window.NinanooAnalytics.identify('user-raw-id-123')
```

2. user state 확인:

```js
JSON.parse(localStorage.getItem('ninanoo.analytics.user.v1') || '{}')
```

3. `userIdHash`가 원문이 아닌 해시 형태(`uid_...`)인지 확인

## 6) 문서/코드 정합성 확인

1. `docs/ANALYTICS_EVENTS.md` 이벤트명 목록 확인
2. 실제 queue 이벤트명과 1:1 일치하는지 확인
3. 새 이벤트 추가 시 문서 먼저 갱신 후 코드 반영
