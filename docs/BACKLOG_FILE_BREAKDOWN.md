# BACKLOG_FILE_BREAKDOWN

Last updated: 2026-02-18

## Epic 1. Core Product Experience Stabilization

### Feature 1.1 추천/슬롯 UX 안정화

#### Task 1.1.1 추천 결과 렌더링 실패 복구 강화
- 변경/추가 파일 경로:
  - `js/app.js`
  - `index.html`
  - `css/style.css`
- 구현 요약:
  - 추천 버튼/슬롯 결과 렌더링 시 이미지 fetch 실패 및 빈 메뉴 데이터 케이스를 분기 처리한다.
  - 실패 시 사용자에게 fallback 텍스트/이미지를 명확히 노출한다.
  - 로딩 상태와 완료 상태를 분리해 중복 클릭/중복 렌더를 방지한다.
  - 스크립트 에러가 나도 핵심 CTA(추천받기, 슬롯 실행)는 동작하도록 방어 코드를 추가한다.
- Done Criteria:
  - 수동검증: 네트워크 오프라인/느린 상태에서 추천/슬롯 버튼이 에러 없이 fallback UI를 출력한다.
  - 수동검증: 20회 반복 실행 시 UI 깨짐/중복 이벤트가 재현되지 않는다.
  - 테스트: `node --check js/app.js` 통과.
- 리스크/롤백:
  - 리스크: 상태 분기 증가로 기존 애니메이션 타이밍이 달라질 수 있다.
  - 롤백: 해당 커밋 `git revert <commit_sha>`로 즉시 복구.

#### Task 1.1.2 슬롯 카테고리 필터 정확도 개선
- 변경/추가 파일 경로:
  - `js/app.js`
  - `js/translations.js`
- 구현 요약:
  - 카테고리별 메뉴 집합 구성 로직을 점검해 누락/중복 메뉴를 정리한다.
  - 다국어 라벨과 내부 메뉴 키 매핑 불일치를 수정한다.
  - 카테고리 변경 직후 슬롯 릴 재초기화 순서를 보정한다.
  - 결과 텍스트와 이미지 검색어가 일관되게 동기화되도록 보장한다.
- Done Criteria:
  - 수동검증: 12개 카테고리 각각 5회 실행 시 잘못된 카테고리 메뉴가 나오지 않는다.
  - 수동검증: 언어 변경 후에도 동일 카테고리 결과가 논리적으로 일치한다.
  - 테스트: `node --check js/app.js`, `node -c js/translations.js` 통과.
- 리스크/롤백:
  - 리스크: 메뉴 키 정리 중 기존 공유 링크/표시명이 바뀔 수 있다.
  - 롤백: 카테고리 데이터 변경 커밋만 revert.

### Feature 1.2 커뮤니티 게시판 신뢰성

#### Task 1.2.1 게시판 include 실패 대비 UI 개선
- 변경/추가 파일 경로:
  - `js/app.js`
  - `pages/bulletin.html`
  - `index.html`
- 구현 요약:
  - `pages/bulletin.html` 로드 실패 시 재시도 버튼과 에러 문구를 제공한다.
  - 초기 로딩 스켈레톤과 실패 상태를 분리해 사용자 혼란을 줄인다.
  - 게시글 작성 폼 disabled 상태를 네트워크/스토리지 상태에 따라 명확히 제어한다.
  - include 경로 변경 시 추적 가능한 로그를 남긴다.
- Done Criteria:
  - 수동검증: include 경로를 의도적으로 깨뜨려도 앱 전체가 멈추지 않고 실패 UI가 표시된다.
  - 수동검증: 재시도 버튼으로 정상 복구 가능.
  - 테스트: `node --check js/app.js` 통과.
- 리스크/롤백:
  - 리스크: 게시판 초기화 타이밍 변경으로 이벤트 중복 바인딩 가능성.
  - 롤백: include 로더 변경 커밋 revert.

#### Task 1.2.2 Firestore 실패 시 localStorage 폴백 정책 명시화
- 변경/추가 파일 경로:
  - `js/app.js`
  - `docs/ARCHITECTURE_MAP.md` (문서 동기화)
- 구현 요약:
  - Firestore 쓰기/읽기 실패 시 폴백 경로를 함수 단위로 정리한다.
  - 폴백 데이터 스키마 버전을 부여해 향후 마이그레이션 충돌을 예방한다.
  - 상대시간 포맷 계산을 공통 함수로 통합한다.
  - 사용자에게 현재 저장소 모드(Firestore/Local)를 안내한다.
- Done Criteria:
  - 수동검증: Firestore 차단 시 글 작성/조회가 localStorage로 동작한다.
  - 수동검증: 모드 안내 문구가 화면에 표시된다.
  - 테스트: `node --check js/app.js` 통과.
- 리스크/롤백:
  - 리스크: localStorage 데이터 형식 변경으로 기존 데이터 일부 미표시 가능.
  - 롤백: 스키마 버전 적용 커밋 revert 후 구버전 파서 복원.

## Epic 2. Auth & Account Lifecycle Hardening

### Feature 2.1 로그인/회원가입 플로우 안정화

#### Task 2.1.1 OAuth 오류 관측성 강화
- 변경/추가 파일 경로:
  - `js/auth-page.js`
  - `pages/auth.html`
  - `js/runtime-config.js`
- 구현 요약:
  - OAuth redirect 오류(`error`, `error_description`)를 상태 영역에 표준 포맷으로 노출한다.
  - 런타임 config 미로드 시 재시도와 사용자 안내를 분리한다.
  - 로그인 성공 후 이동 규칙을 단일 함수로 통합한다.
  - 브라우저별 popup/redirect 차이를 핸들링하는 fallback 경로를 추가한다.
- Done Criteria:
  - 수동검증: Google 로그인 성공 시 `/index.html` 복귀 및 세션 유지.
  - 수동검증: Redirect URL 오설정 시 오류 문구가 즉시 보인다.
  - 테스트: `node --check js/auth-page.js`, `node --check js/runtime-config.js` 통과.
- 리스크/롤백:
  - 리스크: 리다이렉트 경로 변경으로 기존 북마크/링크 플로우 영향.
  - 롤백: auth-page redirect 변경 커밋 revert.

#### Task 2.1.2 회원가입 상태 메시지/중복가입 UX 개선
- 변경/추가 파일 경로:
  - `js/signup-page.js`
  - `pages/signup.html`
- 구현 요약:
  - 이메일 인증 발송 여부/중복가입 판단 메시지를 명확히 분리한다.
  - 비밀번호 확인 불일치, 약한 비밀번호, 서버 오류를 구체적으로 안내한다.
  - submit 버튼 중복 클릭 방지와 로딩 상태를 추가한다.
  - 인증 완료 후 다음 행동(로그인 이동)을 명확히 제시한다.
- Done Criteria:
  - 수동검증: 정상 가입, 중복 이메일, 비밀번호 불일치 3케이스 메시지 확인.
  - 수동검증: 버튼 연타 시 중복 요청 미발생.
  - 테스트: `node --check js/signup-page.js` 통과.
- 리스크/롤백:
  - 리스크: 상태 메시지 분기 추가로 특정 Supabase 에러코드 누락 가능.
  - 롤백: 메시지/분기 변경 커밋 revert.

### Feature 2.2 회원 탈퇴/보안 경로 정리

#### Task 2.2.1 Worker delete-account 관리자 권한 경로 고정
- 변경/추가 파일 경로:
  - `workers/polar-checkout-worker/src/index.ts`
  - `workers/polar-checkout-worker/wrangler.toml`
  - `docs/cloudflare-workers-polar-setup.md`
- 구현 요약:
  - delete-account 엔드포인트의 관리자 호출 헤더 전략을 키 타입(JWT vs `sb_secret_*`) 기준으로 고정한다.
  - 서비스 롤 키 오입력(publishable/anon) 진단 메시지를 유지하고 로그 포맷을 정규화한다.
  - CORS preflight(`authorization`) 정책이 회귀되지 않도록 회귀 체크를 추가한다.
  - 운영 Runbook 문서에 시크릿 재등록/배포 절차를 동기화한다.
- Done Criteria:
  - 수동검증: 로그인 사용자의 탈퇴 요청이 200으로 완료.
  - 수동검증: 잘못된 서비스 롤 키 설정 시 500 진단 메시지 확인.
  - 테스트: `npm --prefix workers/polar-checkout-worker run check` 통과.
- 리스크/롤백:
  - 리스크: 헤더 분기 실수 시 `not_admin`/`bad_jwt` 재발.
  - 롤백: 해당 워커 커밋 revert 후 직전 안정 버전 재배포.

#### Task 2.2.2 마이페이지 계정관리 상태 동기화 개선
- 변경/추가 파일 경로:
  - `js/mypage.js`
  - `pages/mypage.html`
  - `index.html`
  - `js/app.js`
- 구현 요약:
  - 로그인/로그아웃/탈퇴 직후 사이드바/마이페이지 상태를 즉시 반영한다.
  - `@아이디` 표시와 로그인/마이페이지 CTA 토글을 단일 기준(session user)으로 통합한다.
  - 탈퇴 진행 중 UI 잠금 및 결과 상태 메시지를 개선한다.
  - 캐시버스터 버전 갱신 규칙을 문서화한다.
- Done Criteria:
  - 수동검증: 로그인 직후 사이드바가 `마이페이지 + @아이디 + 로그아웃`으로 전환.
  - 수동검증: 로그아웃 직후 `로그인`으로 복귀.
  - 수동검증: 탈퇴 성공 후 세션 종료 및 메인 이동.
  - 테스트: `node --check js/mypage.js`, `node --check js/app.js` 통과.
- 리스크/롤백:
  - 리스크: 다중 탭 상태에서 표시 불일치 가능.
  - 롤백: sidebar auth 관련 커밋 revert.

## Epic 3. Premium Report Pipeline Quality

### Feature 3.1 입력 -> 결제 -> 결과 연동 품질

#### Task 3.1.1 리포트 입력 draft 스키마 버전화
- 변경/추가 파일 경로:
  - `js/premium-report-intake.js`
  - `pages/report-intake.html`
  - `js/polar-worker-checkout.js`
- 구현 요약:
  - sessionStorage draft에 버전 필드를 추가하고 파싱 호환 로직을 넣는다.
  - 필수/선택 필드 validation 메시지를 세분화한다.
  - payment 페이지 요약 카드가 누락 데이터일 때 명확한 가이드를 표시한다.
  - 잘못된 draft 포맷에서도 결제 플로우가 중단되지 않도록 방어한다.
- Done Criteria:
  - 수동검증: 신규 입력/기존 draft/깨진 draft 3케이스에서 결제 진입 가능.
  - 수동검증: 요약 카드가 필드 상태를 정확히 반영.
  - 테스트: `node --check js/premium-report-intake.js`, `node --check js/polar-worker-checkout.js` 통과.
- 리스크/롤백:
  - 리스크: draft 파서 변경으로 기존 사용자 draft 유실 가능.
  - 롤백: draft schema 변경 커밋 revert.

#### Task 3.1.2 결제 상태 폴링/표시 일관성 개선
- 변경/추가 파일 경로:
  - `js/polar-worker-checkout.js`
  - `pages/payment.html`
  - `workers/polar-checkout-worker/src/index.ts`
- 구현 요약:
  - `order_id`/`checkout_id` fallback 우선순위를 코드와 응답 스키마에 맞춰 정리한다.
  - 진행바 상태(`checking/generating/queued/other`)를 표준화한다.
  - 실패 응답 메시지를 사용자용/개발자용으로 분리한다.
  - 재전송 버튼 enable 조건을 명확히 하여 오작동을 줄인다.
- Done Criteria:
  - 수동검증: 결제 성공/보류/실패 상태별 UI 메시지와 진행바가 기대대로 표시.
  - 수동검증: 재전송 가능 시점 이전에는 버튼 disabled.
  - 테스트: `node --check js/polar-worker-checkout.js`, Worker `npm run check` 통과.
- 리스크/롤백:
  - 리스크: 상태 매핑 실수 시 잘못된 성공 표시 가능.
  - 롤백: 결제 상태 매핑 변경 커밋 revert.

### Feature 3.2 결과 리포트 사용성/내구성

#### Task 3.2.1 report-result 렌더/행동대시보드 회귀 테스트 보강
- 변경/추가 파일 경로:
  - `js/report-result.js`
  - `pages/report-result.html`
  - `docs/dom-contract.json`
  - `scripts/check-dom-contract.js`
- 구현 요약:
  - 결과 페이지 핵심 DOM id를 계약으로 고정해 리그레션을 조기 검출한다.
  - 실행 대시보드(오늘 액션/Day 체크) localStorage 키 충돌을 방지한다.
  - 리포트 파싱 실패 시 fallback 렌더가 항상 노출되도록 보장한다.
  - 공유/PDF/재전송 버튼의 실패 메시지를 공통화한다.
- Done Criteria:
  - 수동검증: 정상 리포트/깨진 리포트/빈 리포트 모두 화면 깨짐 없이 표시.
  - 수동검증: 체크 상태 새로고침 후 유지.
  - 테스트: `node --check js/report-result.js`, `node scripts/check-dom-contract.js` 통과.
- 리스크/롤백:
  - 리스크: DOM 계약 강화로 기존 페이지 마크업 변경 시 빌드/검증 실패 증가.
  - 롤백: 계약 강화 커밋 revert 또는 검사 완화.

#### Task 3.2.2 (새 파일) 결과 페이지 E2E 수동테스트 시나리오 문서화
- 변경/추가 파일 경로:
  - `docs/report-result-manual-test.md` (새 파일)
- 구현 요약:
  - 결제 완료 후 결과 조회, 재전송, 공유, PDF 저장의 수동 테스트 체크리스트를 정리한다.
  - 실패 케이스(미확인 결제, 잘못된 `checkout_id`, API 5xx) 대응 절차를 포함한다.
  - QA가 재현 가능한 데이터 준비 절차(쿼리파라미터/테스트 계정)를 표준화한다.
  - 운영 배포 후 smoke test 순서를 명시한다.
- Done Criteria:
  - 수동검증: 문서만으로 신규 작업자가 1회 complete run 가능.
  - 수동검증: 최소 10개 케이스(성공/실패/경계) 체크리스트 포함.
- 리스크/롤백:
  - 리스크: 문서가 코드와 빠르게 불일치할 수 있음.
  - 롤백: 문서 커밋 revert 또는 deprecated 표기 후 재작성.

## Epic 4. Platform, SEO, and Operability

### Feature 4.1 SEO/메타 일관성

#### Task 4.1.1 canonical/OG 도메인 정규화
- 변경/추가 파일 경로:
  - `index.html`
  - `pages/about.html`
  - `pages/contact.html`
  - `pages/guide.html`
  - `pages/privacy.html`
  - `pages/terms.html`
  - `pages/refund.html`
  - `pages/faq.html`
  - `pages/cookies.html`
  - `pages/help.html`
  - `pages/report-intake.html`
  - `pages/report-result.html`
  - `pages/auth.html`
  - `pages/signup.html`
  - `pages/mypage.html`
- 구현 요약:
  - canonical/og:url이 `ninanoo.com` 기준으로 일관되게 설정되어 있는지 점검하고 통일한다.
  - staging/domain 잔존 URL을 제거한다.
  - 메타 description 중복/누락을 정리한다.
  - 페이지 타이틀 규칙을 통일한다.
- Done Criteria:
  - 수동검증: 각 페이지 소스에서 canonical/og:url 도메인이 통일됨.
  - 수동검증: 주요 페이지 10개 이상에서 title/description 누락 없음.
  - 테스트: 정적 grep 검사(`rg "canonical|og:url"`)로 예외 목록 0건.
- 리스크/롤백:
  - 리스크: 잘못된 canonical로 SEO 인덱싱 신호 혼선 가능.
  - 롤백: 메타 변경 커밋 revert.

### Feature 4.2 운영 가시성 및 설정 관리

#### Task 4.2.1 Worker 운영 상태/런타임 설정 점검 엔드포인트 보강
- 변경/추가 파일 경로:
  - `workers/polar-checkout-worker/src/index.ts`
  - `docs/cloudflare-workers-polar-setup.md`
- 구현 요약:
  - `/health`, `/runtime-config` 응답 포맷을 운영 점검 관점에서 표준화한다.
  - 민감정보 노출 없이 설정 상태만 확인 가능한 진단 필드를 추가한다.
  - 오류 응답의 추적 가능성(에러 코드, 힌트)을 강화한다.
  - 운영 가이드 문서에 확인 명령(`curl`)과 기대 응답 예시를 업데이트한다.
- Done Criteria:
  - 수동검증: `curl -i https://api.ninanoo.com/health` 정상.
  - 수동검증: `runtime-config`가 필요한 필드만 반환.
  - 테스트: Worker `npm --prefix workers/polar-checkout-worker run check` 통과.
- 리스크/롤백:
  - 리스크: 응답 스키마 변경으로 프론트 런타임 로더 영향 가능.
  - 롤백: endpoint 스키마 변경 커밋 revert.

#### Task 4.2.2 (새 파일) Secret/Env 운영 Runbook 작성
- 변경/추가 파일 경로:
  - `docs/secret-env-runbook.md` (새 파일)
  - `workers/polar-checkout-worker/wrangler.toml`
- 구현 요약:
  - 어떤 값이 `[vars]`이고 어떤 값이 `wrangler secret`인지 목록화한다.
  - Supabase/Polar/OpenAI/Resend 키 교체 절차를 단계별로 명시한다.
  - 배포 전후 검증 커맨드와 실패 시 복구 절차를 표준화한다.
  - 키 노출 방지 규칙(로그/스크린샷/커밋 금지)을 문서화한다.
- Done Criteria:
  - 수동검증: runbook만 보고 신규 작업자가 시크릿 교체 + 배포 + 검증 수행 가능.
  - 수동검증: `wrangler.toml`의 vars와 문서 표가 일치.
- 리스크/롤백:
  - 리스크: 문서 최신화 누락 시 잘못된 절차 전파.
  - 롤백: 문서 커밋 revert 후 최신 상태로 재작성.
