# Analytics Events (Vendor-Neutral)

이 문서는 `js/analytics.js` 기반 공통 이벤트 계측 표준입니다.  
기본 동작: `console.log` + `localStorage` queue 저장.

## 공통 규칙

- API:
  - `window.NinanooAnalytics.track(eventName, props)`
  - `window.NinanooAnalytics.identify(userId)` (해시 저장)
  - `window.NinanooAnalytics.setUserProps(props)`
- PII 금지:
  - 이메일/전화번호 원문 전송 금지
  - `identify`는 내부 해시(`userIdHash`)만 저장
  - `props`에서 `email`, `phone`, `tel`, `mobile` 키는 제거
- 공통 메타:
  - `ts`, `path`, `href`, `anonymousId`, `userIdHash`

## 이벤트 스키마

| eventName | when | props (standard) |
|---|---|---|
| `recommend_click` | 추천 버튼 클릭 | `source`, `menuKey`, `reroll`, `poolSize` |
| `alternative_option_click` | 대체옵션 클릭 | `selectedMenuKey`, `baseMenuKey`, `poolSize` |
| `share_click` | 공유 버튼 클릭 | `channel`, `source` |
| `slot_spin_started` | 슬롯 시작 | `category`, `poolSize` |
| `slot_result_shared` | 슬롯 결과 공유 | `channel` |
| `report_intake_viewed` | report-intake 진입 | `source` |
| `report_intake_step_completed` | intake 스텝 완료(next) | `step` |
| `payment_started` | 결제 시작 버튼 클릭 | `source`, `flowType`, `step` |
| `payment_success` | 결제 성공 상태 확인 | `source`, `type`, `status` |
| `report_generated_completed` | 리포트 생성/미리보기 완료 | `source`, `model` |
| `report_resent` | 리포트 재전송 요청 결과 | `source`, `queued`, `reason` |
| `report_pdf_saved` | PDF 저장 결과 | `success`, `reason` |
| `login_success` | 로그인 성공 | `method`, `userIdHash` |
| `signup_success` | 회원가입 성공 | `method`, `userIdHash`, `emailVerificationRequired` |
| `identify` | identify 호출 시 | `userIdHash` |
| `set_user_props` | setUserProps 호출 시 | 사용자 속성(PII 제거) |

## 구현 파일

- 레이어: `js/analytics.js`
- 추천/슬롯/공유: `js/app.js`
- report-intake: `js/premium-report-intake.js`
- 결제/상태/재전송: `js/polar-worker-checkout.js`
- report-result/PDF/재전송: `js/report-result.js`
- 로그인/회원가입: `js/auth-page.js`, `js/signup-page.js`
