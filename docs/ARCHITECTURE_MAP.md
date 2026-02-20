# ARCHITECTURE_MAP

Last scanned: 2026-02-18  
Scope: `index.html`, `404.html`, `pages/*.html`, `js/*`, `css/*`, `workers/polar-checkout-worker/*`, `firebase.json`

## 1) Page Routing Map

| File | URL | Role | JS/CSS (observed) | Major DOM ids/classes |
|---|---|---|---|---|
| `index.html` | `/` | 메인 앱(추천/슬롯/커뮤니티/사이드바/인증 CTA) | JS: `js/app.js`, `js/polar-worker-checkout.js`, `js/runtime-config.js`, `js/footer-loader.js`, `js/countryLanguageService.js`, `js/translations.js`, analytics scripts. CSS: `css/style.css` | `#sidebar`, `#nav-recommendation`, `#nav-bulletin`, `#sidebar-auth-link`, `#sidebar-signout-btn`, `#mobile-sidebar`, `#mobile-sidebar-auth-link`, `#language-btn`, `#theme-toggle-btn`, `#game-container`, `#bulletin-container` |
| `404.html` | `/404` (rewrite fallback) | 에러 페이지 | JS: `js/404.js`. CSS: `css/style.css`, `css/404.css` | `#error-title`, `#error-desc`, `#home-link`, `#about-link` |
| `pages/about.html` | `/pages/about.html` | 소개 페이지 | JS: `js/footer-loader.js` (+ tailwind CDN). CSS: inline/Tailwind (no local css include) | `#site-footer` |
| `pages/auth.html` | `/pages/auth.html` | 로그인(이메일/Google) | JS: `js/runtime-config.js`, `js/auth-page.js`, `js/footer-loader.js`, Supabase CDN | `#auth-page-email`, `#auth-page-password`, `#auth-page-signin-btn`, `#auth-page-google-btn`, `#auth-page-status`, `#auth-page-signout-btn`, `#auth-page-mypage-link` |
| `pages/signup.html` | `/pages/signup.html` | 회원가입(이메일) | JS: `js/runtime-config.js`, `js/signup-page.js`, `js/footer-loader.js`, Supabase CDN | `#signup-page-email`, `#signup-page-password`, `#signup-page-password-confirm`, `#signup-page-submit-btn`, `#signup-page-status` |
| `pages/mypage.html` | `/pages/mypage.html` | 회원정보/프로필/비밀번호 재설정/회원탈퇴 | JS: `js/runtime-config.js`, `js/mypage.js`, `js/footer-loader.js`, Supabase CDN | `#mypage-status`, `#mypage-member-id`, `#mypage-profile-form`, `#mypage-save-btn`, `#mypage-reset-password-btn`, `#mypage-delete-account-btn` |
| `pages/report-intake.html` | `/pages/report-intake.html` | 프리미엄 리포트 입력 | JS: `js/premium-report-intake.js`, `js/footer-loader.js` | `#report-intake-form`, `#report-goal`, `#report-allergies`, `#report-avoid`, `#report-preferred`, `#report-note`, `#go-payment-button`, `#report-intake-status` |
| `pages/payment.html` | `/pages/payment.html` | 결제/결제상태/리포트 전달 상태 | JS: `js/polar-worker-checkout.js`, `js/footer-loader.js`, analytics | `#polar-pay-button`, `#polar-pay-status`, `#premium-report-summary`, `#payment-result-panel`, `#report-delivery-panel`, `#report-resend-btn` |
| `pages/report-result.html` | `/pages/report-result.html` | 리포트 결과/공유/PDF/재전송 | JS: `js/report-result.js`, `js/footer-loader.js`, `html2canvas`, `jspdf`, analytics | `#result-title`, `#report-progress-text`, `#report-content-text`, `#result-share-btn`, `#result-save-btn`, `#result-resend-btn`, `#result-action-status` |
| `pages/contact.html` | `/pages/contact.html` | 제휴 문의 + 결제 진입 버튼 | JS: `js/contact-polar-checkout.js`, `js/footer-loader.js`, analytics | `#contact-polar-pay-button`, `#contact-polar-pay-status`, `#manager-name`, `#email`, `#message`, `#policy-compliance` |
| `pages/guide.html` | `/pages/guide.html` | 메뉴 가이드 | JS: `js/footer-loader.js`, analytics, `js/ld/guide.json` | `#situation`, `#seasonal`, `#health`, `#budget`, `#world`, `#etiquette` |
| `pages/privacy.html` | `/pages/privacy.html` | 개인정보처리방침 | JS: `js/privacy.js`, `js/countryLanguageService.js`, `js/translations.js`, `js/footer-loader.js`, analytics, `js/ld/privacy.json` | `#policy-content`, `#privacy-title`, `#s1-title`, `#s2-title` |
| `pages/terms.html` | `/pages/terms.html` | 이용약관 | JS: `js/terms.js`, `js/countryLanguageService.js`, `js/translations.js`, `js/footer-loader.js`, analytics, `js/ld/terms.json` | `#policy-content`, `#terms-title`, `#t1-title`, `#t2-title` |
| `pages/refund.html` | `/pages/refund.html` | 환불정책 | JS: `js/footer-loader.js`, analytics, `js/ld/refund.json` | `#site-footer` |
| `pages/faq.html` | `/pages/faq.html` | FAQ 정적 페이지 | JS: `js/footer-loader.js`, analytics | `#site-footer` |
| `pages/help.html` | `/pages/help.html` | 도움말 정적 페이지 | JS: `js/footer-loader.js` | `#site-footer` |
| `pages/cookies.html` | `/pages/cookies.html` | 쿠키 정책 | JS: `js/footer-loader.js`, analytics | `#site-footer` |
| `pages/bulletin.html` | (included fragment; direct URL reachable but not standalone full shell) | 커뮤니티 게시판 include 템플릿 | JS 없음(메인 `js/app.js`가 이벤트/로딩 담당) | `#bulletin-form`, `#bulletin-nickname`, `#bulletin-message`, `#bulletin-submit`, `#bulletin-posts` |
| `pages/footer.html` | (included fragment) | 공통 footer include 템플릿 | JS 없음(메인 `js/footer-loader.js`가 로드) | `#footer-home-link`, `#footer-planner-link`, `#footer-account-link`, `#privacy-link`, `#terms-link` |

Notes:
- 대부분 페이지는 로컬 CSS 파일 대신 Tailwind CDN + inline style 사용.
- `firebase.json` rewrite 정책상, 명시된 경로 외 다수는 `/404.html`로 라우팅될 수 있음.

## 2) Core User Flows (5)

### A. 추천 플로우
1. User opens `index.html`.
2. `js/app.js`가 언어/테마/메뉴 데이터/이미지(Pexels) 초기화.
3. 추천 버튼/로직으로 메뉴 선택, 이미지 fetch(`fetchPexelsImage`) 및 결과 렌더.
4. 공유 UI(Web Share/클립보드)로 결과 공유.

### B. 슬롯머신 플로우
1. `index.html` 슬롯 탭/카테고리 버튼 조작.
2. `js/app.js`에서 슬롯 릴 데이터(`buildSlotMenus`) 구성 및 애니메이션 실행.
3. 당첨 메뉴 확정 후 메뉴명/이미지/카테고리 반영.

### C. 커뮤니티 플로우
1. `index.html`에서 게시판 패널 활성화.
2. `js/app.js`가 `pages/bulletin.html` include를 동적 로드(`loadBulletinInclude`).
3. 게시글 작성/조회는 Firestore 우선, 실패 시 localStorage 폴백.
4. 실시간 목록 업데이트/상대시간 표시.

### D. 로그인/가입 플로우
1. `pages/auth.html` + `js/runtime-config.js`가 Worker `/runtime-config`에서 Supabase URL/anon key 수신.
2. `js/auth-page.js`에서 이메일 로그인(`signInWithPassword`) 또는 Google OAuth(`signInWithOAuth`).
3. 회원가입은 `pages/signup.html` + `js/signup-page.js`에서 이메일 가입 처리.
4. 로그인 상태는 `index.html`의 `js/app.js` 사이드바 CTA(`로그인`↔`마이페이지`/`로그아웃`)에 동기화.

### E. 식단리포트 플로우 (report-intake -> payment -> report-result)
1. `pages/report-intake.html`에서 입력 후 `js/premium-report-intake.js`가 draft를 sessionStorage 저장.
2. `pages/payment.html`에서 `js/polar-worker-checkout.js`가 Worker `/create-checkout` 호출 후 Polar checkout 이동.
3. 결제 후 `checkout_id/order_id` 기반으로 Worker `/payment-status` 조회.
4. Worker `/premium-report-preview`, `/resend-report`로 리포트 미리보기/재발송 처리.
5. `pages/report-result.html` + `js/report-result.js`에서 리포트 렌더링, 공유, PDF 저장, 재전송.

## 3) External Dependencies & Secret/Key Management

| Dependency | Where used | Key/Secret | Management location |
|---|---|---|---|
| Pexels API | `js/app.js` | `PEXELS_API_KEY` | **Hardcoded in frontend** (`js/app.js`) |
| Firebase / Firestore | `js/app.js` (community board) | `firebaseConfig` fields (`apiKey`, etc.) | **Hardcoded in frontend** (`js/app.js`, 일부 값 마스킹됨) |
| Supabase Auth/Data | `js/auth-page.js`, `js/signup-page.js`, `js/mypage.js`, `js/app.js` | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Worker runtime-config API -> Worker env vars (`workers/polar-checkout-worker/src/index.ts`, `wrangler.toml`에는 값 미노출) |
| Supabase service role | Worker delete-account path | `SUPABASE_SERVICE_ROLE_KEY` | **Cloudflare Worker Secret** (not in repo plaintext) |
| Formspree | `pages/contact.html` | endpoint `https://formspree.io/f/xojlpazr` | Hardcoded endpoint in HTML (no separate key in repo) |
| ipapi | `js/app.js`, `js/privacy.js`, `js/terms.js` | none | Public endpoint call (`https://ipapi.co/json/`) |
| Polar API | Worker `src/index.ts`, frontend checkout scripts | `POLAR_OAT_TOKEN`, `POLAR_WEBHOOK_SECRET`, product id | Token/secrets: Worker Secret. Product/mode/etc: `wrangler.toml` `[vars]` + JS constants |
| OpenAI API | Worker `src/index.ts` premium report generation | `OPENAI_API_KEY`, `OPENAI_MODEL` | API key: Worker Secret. Model: `wrangler.toml` var |
| Resend API | Worker `src/index.ts` email send/resend | `RESEND_API_KEY`, sender vars | API key: Worker Secret. sender/subject vars: `wrangler.toml` |
| Cloudflare Worker | `workers/polar-checkout-worker` | route/env/secrets | code: repo, vars: `wrangler.toml`, secrets: Wrangler Secret Store |
| Google Analytics | `index.html` and multiple pages + `js/analytics/gtag.js` | `G-KR2HW49NF0` | Hardcoded measurement id |
| Microsoft Clarity | `js/analytics/clarity.js` | `vcn4lfwfx8` | Hardcoded project id |
| Google AdSense | `index.html`, `pages/guide.html` | `ca-pub-7066264300961815` | Hardcoded publisher id |
| Supabase JS SDK CDN | auth/signup/mypage/index | none | CDN include in HTML |
| html2canvas / jsPDF | `pages/report-result.html` | none | CDN include in HTML |

Security note:
- Frontend hardcoded key가 존재: `js/app.js`의 `PEXELS_API_KEY`, Firebase config.
- Worker 민감값은 env/secret 전제로 구현됨.

## 4) Analytics / SEO / Performance Status (File-based)

### Analytics
- `js/analytics/gtag.js`: GA 초기화 (`G-KR2HW49NF0`).
- `js/analytics/clarity.js`: Clarity 초기화 (`vcn4lfwfx8`).
- 여러 HTML에서 gtag loader + 위 스크립트 공통 include.

### SEO
- 메타/OG/canonical은 각 페이지별 수동 정의(예: `index.html`, `pages/contact.html`, `pages/privacy.html`, `pages/terms.html`).
- JSON-LD는 `js/ld/*.json` 파일을 `<script type="application/ld+json" src="...">` 방식으로 include.
- `robots.txt`, `sitemap.xml` 존재.
- `firebase.json`: clean URL + redirects/rewrites + 보안 헤더 설정.

### Performance / Caching / Bundle
- 번들링 없음(plain HTML + vanilla JS + CDN scripts).
- `firebase.json` 캐시 정책:
  - `**/*.{js,css}`: `max-age=604800`
  - 이미지: `max-age=2592000`
  - sitemap/robots: `max-age=86400`
- 주요 JS는 query version 캐시버스터 사용(예: `...?v=20260218d`).
- Tailwind CDN 사용으로 초기 네트워크 의존 증가.

## Unknowns / TODO

- `(unknown)` Firebase 실제 production config 값(현재 `js/app.js`는 일부 마스킹 문자열 포함).  
  TODO: 운영용 Firebase config source-of-truth 문서화 필요.
- `(unknown)` Supabase env vars(`SUPABASE_URL`, `SUPABASE_ANON_KEY`)의 배포별 실제 값 history.  
  TODO: Worker secret/vars 관리 정책(runbook) 별도 문서화 권장.
- `(unknown)` 일부 페이지(`pages/bulletin.html`, `pages/footer.html`)는 include fragment로 사용되며 직접 라우트 정책이 명시적 문서 없음.  
  TODO: fragment 직접 접근 허용 여부를 라우팅 정책에 명시.
