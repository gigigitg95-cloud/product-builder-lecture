# FILE_OWNERSHIP

Last scanned: 2026-02-18

목적: 기능 단위로 “어떤 파일을 건드려야 하는지”를 빠르게 찾기 위한 소유 맵.

## 추천 (랜덤 메뉴)
- `index.html`
- `css/style.css`
- `js/app.js`
- `js/translations.js`
- `js/countryLanguageService.js`

## 슬롯머신
- `index.html`
- `css/style.css`
- `js/app.js`
- `js/translations.js`

## 커뮤니티 (게시판)
- `index.html`
- `pages/bulletin.html`
- `js/app.js`
- `firestore.rules`

## 결제 (Polar checkout / status)
- `pages/contact.html`
- `pages/payment.html`
- `js/contact-polar-checkout.js`
- `js/polar-worker-checkout.js`
- `workers/polar-checkout-worker/src/index.ts`
- `workers/polar-checkout-worker/wrangler.toml`
- `docs/cloudflare-workers-polar-setup.md`

## 리포트 (입력/생성/결과/재전송)
- `pages/report-intake.html`
- `pages/payment.html`
- `pages/report-result.html`
- `js/premium-report-intake.js`
- `js/polar-worker-checkout.js`
- `js/report-result.js`
- `workers/polar-checkout-worker/src/index.ts`

## 인증 (로그인/회원가입/마이페이지/사이드바 인증 상태)
- `pages/auth.html`
- `pages/signup.html`
- `pages/mypage.html`
- `index.html`
- `js/auth-page.js`
- `js/signup-page.js`
- `js/mypage.js`
- `js/runtime-config.js`
- `js/app.js`
- `supabase/migrations/20260218090000_create_user_profiles.sql`
- `workers/polar-checkout-worker/src/index.ts`
- `workers/polar-checkout-worker/wrangler.toml`
- `docs/supabase-auth-setup.md`

## i18n (다국어/언어 감지/번역 반영)
- `js/translations.js`
- `js/countryLanguageService.js`
- `js/app.js`
- `js/privacy.js`
- `js/terms.js`
- `pages/privacy.html`
- `pages/terms.html`
- `pages/footer.html`

## Theme (다크/라이트)
- `index.html`
- `pages/about.html`
- `pages/auth.html`
- `pages/contact.html`
- `pages/cookies.html`
- `pages/faq.html`
- `pages/guide.html`
- `pages/help.html`
- `pages/mypage.html`
- `pages/payment.html`
- `pages/privacy.html`
- `pages/refund.html`
- `pages/report-intake.html`
- `pages/report-result.html`
- `pages/signup.html`
- `pages/terms.html`
- `css/style.css`
- `js/app.js`

## Share (공유/저장)
- `index.html`
- `pages/payment.html`
- `pages/report-result.html`
- `js/app.js`
- `js/polar-worker-checkout.js`
- `js/report-result.js`

## 공통 레이아웃/네비/footer
- `pages/footer.html`
- `js/footer-loader.js`
- `js/footer-tailwind-safelist.js`
- `index.html`

## SEO / 분석 / 메타
- `index.html`
- `pages/about.html`
- `pages/contact.html`
- `pages/cookies.html`
- `pages/faq.html`
- `pages/guide.html`
- `pages/privacy.html`
- `pages/refund.html`
- `pages/report-result.html`
- `pages/terms.html`
- `js/analytics/gtag.js`
- `js/analytics/clarity.js`
- `js/ld/about.json`
- `js/ld/guide.json`
- `js/ld/index.json`
- `js/ld/privacy.json`
- `js/ld/refund.json`
- `js/ld/terms.json`
- `robots.txt`
- `sitemap.xml`

## 라우팅/호스팅/캐시
- `firebase.json`
- `_headers`
- `_redirects`
- `404.html`

## Unknown / TODO
- `(unknown)` 기능별 코드 오너(person/team) 메타데이터는 repo 내 명시 파일 없음.  
  TODO: `CODEOWNERS` 또는 별도 owner map 도입 필요.
- `(unknown)` include fragment(`pages/bulletin.html`, `pages/footer.html`)의 운영 라우팅 정책 문서 부재.  
  TODO: direct access 정책(허용/비허용) 명문화.
