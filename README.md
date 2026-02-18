# 오늘 뭐 먹지? - 메뉴 추천 서비스

> 매일 반복되는 메뉴 고민을 해결하는 무료 웹 애플리케이션

**Live**: [ninanoo.com](https://ninanoo.com/)

---

## 서비스 개요

"오늘 뭐 먹지?"는 결정 피로(Decision Fatigue)를 줄여주는 메뉴 추천 서비스입니다. 버튼 하나로 200가지 이상의 메뉴 중 하나를 랜덤 추천받을 수 있으며, 슬롯머신 방식의 인터랙티브 UI, 상황별/계절별 추천, 커뮤니티 게시판 등 다양한 기능을 제공합니다. 18개 언어를 지원하여 전 세계 70개국 이상에서 이용 가능합니다.

---

## 주요 기능

### 1. 랜덤 메뉴 추천
- "메뉴 추천받기" 버튼 클릭으로 200가지 이상의 메뉴 중 하나를 무작위 추천
- 추천된 메뉴와 함께 Pexels API 기반 고화질 음식 이미지 표시
- 페이드 애니메이션으로 부드러운 전환 효과

### 2. 슬롯머신 메뉴 선택
- 3개 릴이 동시에 회전하는 슬롯머신 인터페이스
- **12개 카테고리 필터**: 전체, 한식, 중식, 일식, 양식, 동남아, 멕시칸, 인도, 중동, 아프리카, 유럽, 아메리칸
- 카테고리별 필터링으로 원하는 음식 종류만 선택 가능
- 잭팟 시각 효과 및 결과 공유 기능

### 3. 200가지 이상의 메뉴 데이터베이스

| 카테고리 | 메뉴 수 | 대표 메뉴 |
|---------|---------|----------|
| 한식 | 29 | 김치찌개, 삼겹살, 비빔밥, 불고기, 떡볶이, 갈비, 삼계탕, 냉면 |
| 일식 | 22 | 초밥, 라멘, 우동, 돈카츠, 규동, 야키토리, 타코야키, 오니기리 |
| 중식 | 20 | 짜장면, 짬뽕, 마라탕, 탕수육, 딤섬, 훠궈, 샤오롱바오 |
| 양식 | 24 | 스테이크, 파스타, 피자, 햄버거, 리조또, 라자냐, 바비큐립 |
| 동남아 | 15 | 쌀국수, 팟타이, 나시고렝, 똠양꿍, 렌당, 반미, 락사 |
| 멕시칸 | 12 | 타코, 부리또, 케사디아, 엔칠라다, 세비체, 엠파나다 |
| 인도 | 12 | 티카마살라, 비리야니, 버터치킨, 탄두리치킨, 난, 사모사 |
| 중동 | 9 | 케밥, 팔라펠, 샤와르마, 후무스, 돌마, 만사프 |
| 아프리카 | 8 | 졸로프라이스, 인제라, 도로왓, 타진, 쿠스쿠스 |
| 유럽 | 10 | 무사카, 기로스, 슈니첼, 브라트부르스트, 피에로기, 보르시치 |
| 아메리칸 | 8 | 맥앤치즈, 클램차우더, 잠발라야, 검보, 풀드포크 |

### 4. 상황별 메뉴 추천
8가지 상황에 맞는 맞춤 메뉴를 제안합니다:
- **혼밥**: 라멘, 김밥, 덮밥, 국수
- **가족 식사**: 삼겹살, 갈비찜, 찌개, 불고기
- **친구 모임**: 치킨, 피자, 족발, 떡볶이
- **회식**: 고기구이, 해물탕, 샤브샤브, 갈비
- **데이트**: 파스타, 스테이크, 초밥, 리조또
- **간편식**: 샌드위치, 김밥, 컵라면, 토스트
- **다이어트**: 샐러드, 닭가슴살, 포케, 곤약
- **술안주**: 치킨, 곱창, 회, 전

### 5. 계절/날씨별 메뉴 추천
4가지 날씨 상황에 맞는 메뉴를 추천합니다:
- **더울 때**: 냉면, 콩국수, 물회, 빙수, 샐러드, 냉모밀
- **추울 때**: 만둣국, 떡국, 김치찌개, 순대국, 샤브샤브, 감자탕
- **비 올 때**: 파전, 칼국수, 수제비, 라면, 부침개, 해물전
- **해장**: 뼈해장국, 콩나물국밥, 북어국, 선지국, 황태해장국

### 6. 인기 메뉴 Top 10
한국인이 가장 많이 찾는 인기 메뉴 순위를 상세 설명과 함께 제공.
- 다국어 UI/메뉴 번역 지원

### 7. 배달 메뉴 카테고리 가이드
배달 주문 시 참고할 수 있는 카테고리별 (중식, 치킨, 패스트푸드, 분식, 찜/탕/찌개, 카페/디저트) 메뉴 가이드를 제공.
- 다국어 UI/메뉴 번역 지원

### 8. 점심 vs 저녁 메뉴 가이드
시간대에 따른 메뉴 선택 가이드:
- **점심**: 백반, 국밥, 비빔밥, 샌드위치, 돈카츠 등 빠르고 가벼운 메뉴
- **저녁**: 삼겹살, 찌개, 치킨, 파스타, 회 등 여유롭게 즐기는 메뉴

### 9. 집밥 요리 추천
초보자도 만들 수 있는 간단한 집밥 레시피 6종 (계란볶음밥, 된장찌개, 알리오올리오, 참치마요 덮밥, 라면, 불고기)을 조리 팁과 함께 소개.

### 10. 아침 메뉴 추천
한식 아침, 양식 아침, 초간편 아침 3가지 카테고리로 건강한 아침 식사 메뉴를 추천.

### 11. 메뉴 칼로리 가이드
주요 메뉴 12종의 대략적인 칼로리 정보를 저칼로리/중간/고칼로리로 분류하여 테이블 형태로 제공.

### 12. 음식 선택 팁
4가지 핵심 팁 제공:
- 시간 고려 (배달 시간, 조리 시간)
- 날씨에 맞는 메뉴 선택
- 함께하는 사람에 따른 메뉴 선택
- 건강을 고려한 메뉴 선택

### 13. 커뮤니티 게시판
- 사용자 간 음식 이야기, 맛집 추천, 요리 팁 공유
- Firebase Firestore 기반 실시간 게시판
- 오프라인 시 localStorage 폴백
- 닉네임 저장, 상대 시간 표시 (방금 전, N분 전 등)

### 14. SNS 공유 기능
추천받은 메뉴를 다양한 플랫폼으로 공유:
- **Web Share API** (네이티브 공유)
- **Twitter/X**, **Facebook**, **WhatsApp**, **Telegram**, **LINE**, **KakaoTalk**
- **링크 복사** (클립보드)

### 15. 다크/라이트 테마
- 눈의 피로를 줄이는 다크 모드 / 라이트 모드 전환
- CSS 변수 기반 부드러운 테마 전환 애니메이션
- 테마 설정 localStorage에 저장

### 16. 제휴 문의
- Formspree 기반 이메일 문의 양식
- 광고, 제휴, 기타 문의 지원

### 17. Polar 결제 및 프리미엄 리포트 전달
- 제휴 문의 페이지에서 버튼 클릭 시 즉시 Polar 결제 세션 생성 후 checkout으로 이동
- 메인 사이드바에서 `식단 짜기` 버튼으로 리포트 입력 페이지(`report-intake`) 진입
- 결제 전 개인화 입력(목표/알레르기/기피 재료/선호 카테고리/추가 요청) 수집
- 입력 데이터를 checkout `metadata`로 전달하여 리포트 생성 프롬프트에 반영
- 결제 완료 후 결제 결과 패널에서 상태 확인 + `공유하기`/`저장하기` 지원
- 결제 직후 `리포트 생성 진행 상태`와 `즉시 미리보기`를 화면에 제공
- 이메일 미수신 대응을 위해 `리포트 재전송` 버튼으로 재발송 요청 가능
- 리포트 결과 페이지에서 `저장하기`를 PDF 다운로드로 지원
- 리포트 결과 로드 직후 결제 이메일로 리포트 즉시 발송 요청(중복 발송 방지) 지원
- 결제 성공 시 전용 결과 페이지(`report-result`)에서 OpenAI 리포트 본문을 즉시 확인 가능
- 리포트 결과 페이지를 실행 중심 대시보드 UI로 개편(오늘 액션 완료 체크, Day별 체크, 주간 진행률 시각화)
- 공통 푸터 `서비스` 섹션에서 `식단 짜기` 링크로 리포트 입력/결제/결과 플로우를 바로 진입 가능
- `order_id` 누락 checkout도 `checkout_id` fallback 처리로 리포트 조회/재전송 가능
- 결과 리포트는 Polar 결제 시 입력한 이메일(`order.customer_email`)로 전송
- OpenAI 리포트 생성 시 전문가 상담 리포트 톤으로 프롬프트를 고도화하고, 품질 기준(섹션/Day1~Day7/추천 이유/실행 가이드/체크포인트) 미달 시 고급 fallback 리포트로 자동 대체
- Cloudflare Worker 기반 결제 API/웹훅/조건부 자동환불/프리미엄 리포트 생성/재전송 구조 지원

### 18. 회원가입/로그인 (Supabase Auth)
- 사이드바 하단(언어 선택 상단) 로그인 버튼 제공, 로그인 상태에서는 `마이페이지` 버튼으로 전환
- 로그인 페이지(`auth`)와 회원가입 페이지(`signup`)를 분리해 가입/로그인 흐름 분리
- 로그인 페이지에서 이메일/Google 로그인 지원, 로그인 성공 시 메인페이지로 복귀
- 회원가입 페이지는 이메일 회원가입 전용으로 운영
- Google OAuth는 Supabase Auth + Google Cloud Console Redirect URI(`...supabase.co/auth/v1/callback`) 기준으로 운영
- 사용자별 프로필(목표/알레르기/기피 재료/선호 카테고리) 저장/조회 지원
- 마이페이지에서 내 정보 확인, 비밀번호 재설정 메일 발송, 회원 탈퇴 지원
- Supabase RLS 정책으로 본인 프로필만 접근 가능
- Supabase URL/키는 HTML 하드코딩 대신 Cloudflare Worker `/runtime-config`를 통해 런타임 주입
- 운영 시 민감/임시 텍스트 파일은 저장소에 두지 않고 Worker Secret/환경변수로 관리

---

## 다국어 지원 (18개 언어)

| 언어 | 코드 | 언어 | 코드 |
|-----|------|-----|------|
| 한국어 | ko | 이탈리아어 | it |
| 영어 | en | 러시아어 | ru |
| 일본어 | ja | 아랍어 | ar |
| 중국어 | zh | 힌디어 | hi |
| 스페인어 | es | 태국어 | th |
| 프랑스어 | fr | 베트남어 | vi |
| 독일어 | de | 인도네시아어 | id |
| 포르투갈어 | pt | 터키어 | tr |
| 네덜란드어 | nl | 폴란드어 | pl |

**자동 언어 감지 순서:**
1. localStorage 저장된 언어
2. IP 기반 국가 감지 (ipapi.co) → CountryLanguageService 매핑
3. 브라우저 locale 기반 감지
4. 기본값: English

---

## 페이지 구성

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/` | 메뉴 추천, 슬롯머신, 상황별/계절별 추천, 인기메뉴, 배달가이드, 칼로리 가이드, FAQ |
| 소개 | `/pages/about.html` | 서비스 소개, 주요 기능, 서비스 현황, 메뉴 목록, 이용 방법 |
| 음식 가이드 | `/pages/guide.html` | 상황별/계절별/건강목표별/예산별/세계음식/에티켓 가이드 |
| 개인정보처리방침 | `/pages/privacy.html` | 개인정보 수집 및 이용 안내 |
| 이용약관 | `/pages/terms.html` | 서비스 이용 약관 |
| 제휴 문의 | `/pages/contact.html` | 제휴 문의 접수 및 결제 화면 진입 |
| 리포트 입력 | `/pages/report-intake.html` | 결제 전 개인화 정보 입력 |
| 결제 | `/pages/payment.html` | 입력 정보 확인, Polar Checkout 진입, 결제 결과/공유/저장 |
| 로그인 | `/pages/auth.html` | 이메일/Google 로그인, 회원가입 페이지 이동 |
| 회원가입 | `/pages/signup.html` | 이메일 회원가입 전용 페이지 |
| 마이페이지 | `/pages/mypage.html` | 내 정보/프로필 저장/비밀번호 재설정/회원 탈퇴 |
| 리포트 결과 | `/pages/report-result.html` | 결제 완료 후 OpenAI 리포트 즉시 확인/공유/저장/재전송 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | HTML5, CSS3, Vanilla JavaScript (빌드 도구 없음) |
| Hosting | Firebase Hosting |
| API Worker | Cloudflare Workers (Checkout / Webhook / Payment Status) |
| Database | Firebase Firestore (커뮤니티 게시판), Supabase Postgres/Auth (회원 인증/프로필) |
| 이미지 API | Pexels API |
| 언어 감지 | ipapi.co (IP Geolocation) |
| 문의 양식 | Formspree |
| 폰트 | Google Fonts (Inter) |

---

## 외부 서비스 연동

| 서비스 | 용도 |
|--------|------|
| Google Analytics (G-KR2HW49NF0) | 방문자 분석 |
| Google AdSense (ca-pub-7066264300961815) | 광고 수익화 |
| Microsoft Clarity (vcn4lfwfx8) | 사용자 행동 분석 (히트맵, 세션 리플레이) |
| Pexels API | 음식 이미지 제공 |
| Firebase Firestore | 커뮤니티 게시판 데이터 저장 |
| Supabase Auth/Data API | 회원가입/로그인 및 사용자 프로필 저장 |
| Formspree | 제휴 문의 이메일 전송 |
| Polar API | 결제 세션 생성, 결제/환불 이벤트 처리 |
| Resend API | 결제 결과 및 프리미엄 리포트 이메일 발송 |
| OpenAI API | 결제/입력 metadata 기반 프리미엄 리포트 생성 |
| Cloudflare Workers | 결제 API 게이트웨이, 웹훅 검증, 조건부 자동환불, 리포트 생성/발송 |

---

## SEO 최적화

- Open Graph / Twitter Card 메타 태그
- JSON-LD 구조화 데이터 (WebSite, WebApplication, Organization, FAQPage, HowTo, BreadcrumbList, Article)
- 시맨틱 HTML5 + ARIA 접근성 속성
- robots.txt / sitemap.xml
- 네이버 SEO 메타 태그
- hreflang 다국어 태그
- 캐노니컬 URL

---

## 호스팅 설정 (firebase.json)

- Clean URL (`.html` 확장자 불필요)
- 보안 헤더: `X-Content-Type-Options`, `X-Frame-Options`, `HSTS`, `Referrer-Policy`
- 캐싱: HTML(즉시 갱신), JS/CSS(7일), 이미지(30일), sitemap/robots(24시간)

---

## 프로젝트 구조

```
├── index.html               # 메인 페이지(사이드바 식단 짜기 진입 포함)
├── 404.html                 # 404 에러 페이지
├── pages
│   ├── about.html               # 서비스 소개
│   ├── auth.html                # Supabase 기반 로그인 페이지
│   ├── bulletin.html            # 커뮤니티 게시판 include
│   ├── contact.html             # 제휴 문의 페이지
│   ├── cookies.html             # 쿠키 정책
│   ├── faq.html                 # 자주 묻는 질문
│   ├── footer.html              # 공통 Footer 템플릿
│   ├── guide.html               # 음식 가이드
│   ├── help.html                # 도움말 센터
│   ├── mypage.html              # 내 정보/프로필/비밀번호 재설정/회원 탈퇴 페이지
│   ├── payment.html             # Polar 결제 화면
│   ├── privacy.html             # 개인정보처리방침
│   ├── refund.html              # 환불 정책
│   ├── report-intake.html       # 결제 전 프리미엄 리포트 입력
│   ├── report-result.html       # 결제 후 프리미엄 리포트 결과 확인
│   ├── signup.html              # Supabase 기반 회원가입 페이지
│   └── terms.html               # 이용약관
├── css
│   ├── 404.css                  # 404 페이지 스타일
│   ├── guide.css                # 가이드 페이지 스타일
│   ├── privacy.css              # 개인정보처리방침 스타일
│   ├── style.css                # 공통 스타일 (메인/공통 컴포넌트)
│   └── terms.css                # 이용약관 스타일
├── js
│   ├── analytics
│   │   ├── clarity.js               # Microsoft Clarity 초기화
│   │   └── gtag.js                  # Google Analytics 초기화
│   ├── ld
│   │   ├── about.json               # 소개 페이지 구조화 데이터
│   │   ├── guide.json               # 가이드 페이지 구조화 데이터
│   │   ├── index.json               # 메인 페이지 구조화 데이터
│   │   ├── privacy.json             # 개인정보처리방침 구조화 데이터
│   │   ├── refund.json
│   │   └── terms.json               # 이용약관 구조화 데이터
│   ├── 404.js                   # 404 페이지 스크립트
│   ├── app.js                   # 메인 앱 로직 (추천/슬롯/공유/게시판/테마)
│   ├── auth-page.js             # 로그인 페이지 로직(이메일/Google 로그인, 성공 시 메인 이동)
│   ├── contact-polar-checkout.js # 제휴 문의 페이지 즉시 Polar checkout 연동
│   ├── countryLanguageService.js # 국가-언어 매핑 서비스
│   ├── footer-loader.js         # 공통 Footer 로더
│   ├── footer-tailwind-safelist.js # Footer 동적 클래스 safelist
│   ├── mypage.js                # 마이페이지 프로필 저장/내정보/비밀번호 재설정/회원 탈퇴 로직
│   ├── polar-worker-checkout.js # 결제 버튼/결제결과/진행상태/리포트 재전송 연동
│   ├── premium-report-intake.js # 리포트 입력 저장/결제 페이지 전달
│   ├── privacy.js               # 개인정보처리방침 스크립트
│   ├── report-result.js         # 결제 후 리포트 결과(공유/PDF 저장/이메일 발송 + 실행 대시보드/체크 UI) 로직
│   ├── runtime-config.js        # Worker 런타임 설정(SUPABASE_URL/ANON_KEY) 로더
│   ├── signup-page.js           # 회원가입 페이지 로직(이메일 가입 전용)
│   ├── terms.js                 # 이용약관 스크립트
│   └── translations.js          # 18개 언어 번역 데이터
├── workers
│   └── polar-checkout-worker
│       ├── src
│       │   └── index.ts                 # checkout/status/webhook + preview/resend/runtime-config/delete-account API
│       ├── .gitignore               # Worker 로컬 산출물 제외
│       ├── package-lock.json        # Worker 잠금 파일
│       ├── package.json             # Worker 의존성/스크립트
│       ├── tsconfig.json            # Worker 타입스크립트 설정
│       └── wrangler.toml            # Worker 라우트/변수 설정(프리미엄 리포트 모델/토큰 변수 + 런타임 설정 포함)
├── docs
│   ├── cloudflare-workers-polar-setup.md # Workers/Polar 결제 설정 가이드
│   ├── dom-contract.json        # DOM 계약 정의 파일
│   └── supabase-auth-setup.md
├── scripts
│   ├── check-dom-contract.js    # DOM 계약 검증 스크립트
│   ├── inject-jsonld.js         # 빌드 시 JSON-LD inline 주입 (npm run build)
│   ├── update-readme.js         # README 구조 동기화 + 업데이트 기록 동일 날짜 병합/접기형(details) 변환
│   └── validate-readme-for-commit.js # README 커밋/푸시 게이트 검증(접기형 업데이트 기록 포함)
├── firebase.json            # Firebase Hosting 설정
├── package.json             # Worker 의존성/스크립트
└── README.md
```

---

## 커밋/푸시 운영 규칙

- 커밋/푸시 요청을 받으면 `README.md`를 먼저 갱신.
- `업데이트 기록` 섹션에 당일 날짜(`YYYY-MM-DD`)로 변경 요약을 먼저 작성.
- `프로젝트 구조` 섹션은 기존 양식을 유지한 채 최신 구조로 업데이트.
- `주요 기능` 섹션은 변경된 기능 기준으로 최신 상태를 반영.
- 위 항목이 충족되지 않으면 `pre-commit`/`pre-push` 훅에서 실패 처리되어 커밋/푸시가 중단.

---

## 업데이트 기록

<details>
<summary><strong>2026-02-18</strong> - Supabase 회원가입/로그인 구현 + 사이드바 로그인/마이페이지 연동</summary>

**요약**
- `pages/auth.html`을 Supabase Auth 기반 화면으로 개편하고 이메일 회원가입/로그인 + Google OAuth 버튼을 추가.
- `js/auth-page.js`를 Supabase 클라이언트 로직으로 교체해 세션 처리와 프로필 저장/조회 기능을 연동.
- `supabase/migrations/20260218090000_create_user_profiles.sql`에 `user_profiles` 테이블, RLS 정책, 신규 유저 프로필 자동 생성 트리거를 추가.
- `docs/supabase-auth-setup.md`에 `supabase link`, `supabase db push` 포함 배포 절차를 문서화.
- `index.html`, `js/app.js`에 사이드바 로그인 CTA를 추가해 로그인 전에는 `로그인`, 로그인 후에는 `회원 아이디 -> 마이페이지`로 전환되도록 반영.
- `pages/signup.html`, `js/signup-page.js`를 추가해 회원가입 전용 페이지를 분리하고, `pages/mypage.html`, `js/mypage.js`를 추가해 회원 정보 확인/수정 페이지를 구현.
- 로그인 페이지 성공 후 메인페이지 이동으로 로그인 완료 흐름을 단순화하고, 사이드바 로그인 상태 버튼 라벨을 `마이페이지`로 고정.
- 회원가입 페이지에서 소셜 가입 버튼을 제거하고 이메일 가입 전용 흐름으로 정리.
- Supabase URL/키 하드코딩 메타를 제거하고 `js/runtime-config.js` + Worker `/runtime-config` 응답으로 런타임 주입 구조로 전환.
- Worker 환경변수(`SUPABASE_URL`, `SUPABASE_ANON_KEY`)와 문서(`supabase-auth-setup`, `cloudflare-workers-polar-setup`)를 동기화.
- 마이페이지에 `내 정보` 섹션(이메일/로그인 방식/가입일), `비밀번호 재설정` 메일 발송, `회원 탈퇴` 기능을 추가.
- Worker `POST /delete-account` API를 추가해 토큰 검증 후 `user_profiles` 및 Supabase Auth 유저 삭제를 지원.

</details>

<details>
<summary><strong>2026-02-17</strong> - 리포트 결과 PDF 저장 + 즉시 이메일 발송 외 2건</summary>

#### 리포트 결과 PDF 저장 + 즉시 이메일 발송

**요약**
- `pages/report-result.html`에 PDF 생성을 위한 라이브러리(`html2canvas`, `jsPDF`)를 추가.
- `js/report-result.js`의 `저장하기`를 TXT가 아닌 PDF 다운로드로 전환.
- 리포트 결과 로드 후 결제 이메일로 즉시 발송 요청을 자동 1회 수행하도록 개선.
- 결과 화면 발송 버튼 문구를 `이메일로 보내기`로 정리하고 상태 메시지를 이메일 발송 기준으로 통일.

#### 프리미엄 식단 리포트 전문성 강화

**요약**
- `workers/polar-checkout-worker/src/index.ts`의 OpenAI 프롬프트를 전문가 상담 리포트 톤으로 강화.
- `[요약]/[맞춤 추천]/[7일 플랜]/[주의사항]` 섹션별 출력 규칙을 엄격화하고 `실행 가이드`를 의무화.
- 생성 결과의 품질 검증(분량/섹션/Day1~Day7/추천 이유/체크포인트/실행 가이드) 로직을 추가.
- OpenAI 응답 품질이 기준 미달일 때 제공되는 fallback 리포트를 실무형 7일 계획 형태로 고도화.

#### 리포트 결과 페이지 실행 대시보드 UX 개편

**요약**
- `js/report-result.js`를 실행 중심 UI로 재구성해 단순 텍스트 나열 대신 요약/추천/7일 플랜/주의사항을 카드형으로 표시.
- 오늘 액션 완료 토글, Day별 체크박스, 주간 진행률(%) 카드/바를 추가해 사용자 동기와 이행률을 시각화.
- 체크 상태를 로컬 스토리지에 저장해 새로고침 후에도 사용자가 진행 현황을 이어서 관리 가능하도록 개선.
- `pages/report-result.html`의 레이아웃 폭을 확장하고 스크립트 캐시 버전을 갱신해 최신 UI를 즉시 반영.

</details>

<details>
<summary><strong>2026-02-16</strong> - checkout_id fallback 처리 보강 외 6건</summary>

#### checkout_id fallback 처리 보강

**요약**
- 일부 checkout 응답에서 `order_id`가 비어 있는 케이스를 처리하도록 Worker를 보강.
- `premium-report-preview`/`resend-report`가 `checkout_id`만으로도 fallback order를 구성해 정상 동작하도록 수정.

#### 결제 후 전용 리포트 결과 페이지 추가

**요약**
- 결제 성공 시 `pages/report-result.html`로 이동해 OpenAI 리포트 본문을 즉시 확인할 수 있는 전용 결과 페이지를 추가.
- 결과 페이지에서 `공유하기`/`저장하기`/`리포트 재전송`을 한 화면에서 제공.
- Worker에 `POST /premium-report-preview` API를 추가해 결제건 기준 리포트 미리보기 조회를 지원.

#### 결제 직후 리포트 진행상태/미리보기/재전송

**요약**
- 결제 완료 직후 사용자에게 `리포트 생성 진행 상태`(진행바/안내 문구)를 즉시 표시하도록 결제 결과 UI를 확장.
- 결제 전에 입력한 개인화 정보를 기반으로 `즉시 미리보기`를 결제 완료 화면에서 바로 제공.
- `리포트 재전송` 버튼을 추가하고 Worker에 `/resend-report` API를 구현해 주문 기준 재발송 요청을 지원.

#### 사이드바 식단 짜기 진입 + 리포트 입력 안내 강화

**요약**
- 메인 페이지 사이드바(데스크톱/모바일)에 `식단 짜기` 진입 버튼을 추가.
- `report-intake` 페이지 상단 복귀 링크를 메인으로 조정하고 Polar 허용 범위 고지 문구를 추가.
- Worker 설정/문서에 프리미엄 리포트 관련 환경 변수(`OPENAI_MODEL`, `PREMIUM_REPORT_MAX_TOKENS` 등) 안내를 정리.

#### 제휴문의 즉시 Polar 결제 연결

**요약**
- 제휴 문의 페이지의 결제 버튼이 중간 입력 페이지를 거치지 않고 즉시 Polar checkout 세션을 생성하도록 변경.
- 결제 성공/취소 복귀는 기존 결제 결과 확인이 가능한 `pages/payment.html`로 유지.
- 전용 클라이언트 스크립트(`js/contact-polar-checkout.js`)를 추가해 에러 메시지/이동 흐름을 분리 관리.

#### 결제 전 입력 플로우 + 결제 결과 공유/저장

**요약**
- 결제 전용 입력 페이지(`/pages/report-intake.html`)를 추가하고 개인화 입력값을 `sessionStorage`로 전달하는 2단계 흐름(입력 → 결제)을 도입.
- 결제 API 요청 시 입력값을 Polar checkout `metadata`로 전달하도록 클라이언트 로직을 확장.
- Worker에서 `metadata + 주문정보` 기반으로 OpenAI 프롬프트를 구성해 `[요약]/[맞춤 추천]/[7일 플랜]/[주의사항]` 템플릿 리포트 생성 강화.
- 결제 결과 화면(`payment`)에 `공유하기`/`저장하기` 버튼을 추가해 결제 완료 상태를 사용자 친화적으로 재사용 가능하게 개선.

**적용 내용**
- `pages/contact.html`: 결제 CTA를 입력 시작 페이지(`/pages/report-intake.html`)로 변경
- `pages/report-intake.html`, `js/premium-report-intake.js`: 결제 전 입력/검증/저장/이동 신규 추가
- `pages/payment.html`, `js/polar-worker-checkout.js`:
  - 입력값 요약 표시
  - 입력 누락 시 결제 차단
  - 성공/취소 리다이렉트 처리
  - 결제 결과 `공유하기`/`저장하기` 버튼 동작 추가
- `workers/polar-checkout-worker/src/index.ts`:
  - metadata 파싱/정규화
  - OpenAI 프롬프트 및 fallback 리포트 고도화
  - 결제 이메일 기준 리포트 발송 흐름 유지

#### 자동환불 이메일 리포트

**요약**
- Polar 웹훅 자동환불 처리 후 Resend API를 통해 결과 리포트 이메일 발송 기능 추가.
- 이용약관 및 결제 페이지에 이메일 미수신 환불 불가 안내 문구 추가.
- Cloudflare Workers 설정 문서에 Resend 관련 시크릿/환경변수 가이드 추가.

</details>

<details>
<summary><strong>2026-02-15</strong> - 전체 섹션 다국어 번역 지원 외 1건</summary>

#### 전체 섹션 다국어 번역 지원

**요약**
- 언어 변경 시 한국어로 고정되던 모든 섹션에 다국어 번역(영어/한국어/일본어/중국어)을 적용했.
- 기존 번역 로직이 HTML 요소를 찾지 못하던 문제(클래스/ID 누락)를 수정.
- README 자동 동기화 스크립트가 파일 구조를 중복 생성하던 문제를 수정.

**번역 추가된 섹션**

| 섹션 | 수정 유형 | 설명 |
|------|----------|------|
| 헤더 부제목 | 클래스 추가 | `subtitle` 클래스 추가로 기존 번역 로직 연결 |
| 게임 탭 버튼 | 신규 | 슬롯머신/오늘의 추천 메뉴 탭 번역 추가 |
| 상황별 추천 | 클래스 추가 | `situation-card-title` 클래스 추가로 기존 번역 로직 연결 |
| 집밥요리 추천 | 신규 | 6개 카드 제목/설명 번역 데이터 및 함수 추가 |
| 아침 메뉴 추천 | 신규 | 3개 카드 + 팁 영역 번역 데이터 및 함수 추가 |
| 칼로리 가이드 | 신규 | 테이블 헤더/설명/팁 번역 데이터 및 함수 추가 |
| 음식 선택 팁 | 클래스 추가 | `tip-card` 클래스 추가로 기존 번역 로직 연결 |
| 메뉴 추천이란 | 신규 | 3개 문단 번역 데이터 및 함수 추가 |
| FAQ | 신규 | 8개 질문/답변 번역 데이터 및 함수 추가 |
| 카테고리 가이드 | 신규 | 6개 카드 번역 데이터 및 함수 추가 |
| How to Use | 클래스 추가 | `step-content` 클래스 추가로 기존 번역 로직 연결 |
| 사이드바 | 신규 | 데스크톱/모바일 사이드바 12개 항목 번역 추가 |
| 푸터 | 신규 | 13개 텍스트 요소 번역 추가 + 비동기 로드 후 번역 적용 |
| 게시판 | 확장 | 폼 제목/라벨/최근글 제목/실시간 텍스트 5개 번역 추가 |

**적용 패턴**
- 패턴 A (클래스/ID 누락): HTML 요소에 기존 JS가 찾는 클래스/ID 추가 → 기존 번역 로직 자동 연결
- 패턴 B (번역 미존재): 번역 데이터 객체(4개 언어) + 업데이트 함수 신규 생성 → `updateRouletteTranslations()`에서 호출

**`update-readme.js` 수정**
- 기존 "프로젝트 구조" 섹션의 코드 블록을 직접 업데이트하도록 변경 (설명 주석 유지)
- 자동 동기화 블록에서 중복 "파일 구조(요약)" 제거, "변경 파일" 섹션만 유지

**파일 단위 변경 포인트**
- `index.html`: 번역 대상 요소에 클래스/ID 추가 (subtitle, situation-card-title, home-cooking-card, breakfast-card, calorie-th, tip-card, step-content, faq-item, category-guide-card, tab-btn-slot, tab-btn-recommend 등)
- `js/app.js`: 10개 번역 데이터 객체 + 10개 업데이트 함수 추가 (~+930줄)
- `js/translations.js`: 게시판 관련 번역 키 확장
- `js/footer-loader.js`: 비동기 로드 후 `updateFooterTranslations()` 호출 추가
- `pages/footer.html`: 번역 대상 요소에 ID 추가 (10개)
- `pages/bulletin.html`: 번역 대상 요소에 ID 추가 (5개)
- `scripts/update-readme.js`: 기존 프로젝트 구조 업데이트 방식으로 리팩토링

#### Polar 결제/Workers 연동

**요약**
- Polar Sandbox 기준 결제 플로우를 `Product ID: 45ee4c82-2396-44bd-8249-a577755cbf9e`로 연결.
- 제휴 문의 페이지에서 결제 화면으로 진입할 수 있도록 UX를 추가.
- Cloudflare Worker 기반 결제 API, 결제 상태 조회, 웹훅 검증 및 조건부 자동환불 구조를 도입.

**적용 내용**
- 결제 화면 추가: `pages/payment.html`
  - 결제 버튼 클릭 시 Worker API(`/create-checkout`) 호출 후 Polar checkout URL로 이동
  - 결제 결과 패널 표시(결제 화면 자체 확인 UI)
- 제휴 문의 페이지 진입 버튼 추가: `pages/contact.html`
  - “결제 화면으로 이동” CTA 추가
- 결제 클라이언트 스크립트 추가: `js/polar-worker-checkout.js`
  - 기본 Product ID 고정
  - 로컬/Cloud Workstations 환경에서 개발용 엔드포인트 자동 분기
  - 네트워크 실패 시 원인 파악 가능한 오류 메시지 출력
  - 결제 성공 시 메인 페이지(`/?payment=success&checkout_id={CHECKOUT_ID}`)로 리다이렉트
- Worker 프로젝트 추가: `workers/polar-checkout-worker/`
  - `POST /create-checkout`: Checkout Session 생성
  - `GET /payment-status?order_id=...|checkout_id=...`: 결제 상태 조회
  - `POST /webhooks/polar`: Polar webhook 서명 검증 + `order.paid` 조건부 자동환불
  - 자동환불 변수: `AUTO_REFUND_ENABLED`, `AUTO_REFUND_PRODUCT_IDS`, `AUTO_REFUND_EMAIL_DOMAIN_DENYLIST`
- 운영 문서 추가: `docs/cloudflare-workers-polar-setup.md`
  - DNS/Route 설정, 시크릿 등록, 로컬 테스트, 웹훅 이벤트 구독 절차 정리
- 메인 페이지 결제 결과 팝업 추가: `index.html`
  - 결제 완료 후 복귀 시 상태 확인 팝업 노출

**운영 메모**
- `index.html`에서는 결제 버튼을 노출하지 않도록 유지
- 자동환불 기본값은 현재 `true`로 설정되어 있으므로, 운영 정책에 맞게 `wrangler.toml`에서 조정 필요
- Polar 토큰은 코드/문서에 직접 저장하지 않고 Wrangler Secret으로만 관리

</details>

<details>
<summary><strong>2026-02-14</strong> - 안정화/일관성 패치</summary>

**요약**
- 공통 Footer 로딩 구조를 메인/서브 페이지에 통일 적용하고, 다크모드 색상 불일치 문제를 해소.
- 사이드바 아이콘/텍스트가 초기 로딩 시 잠깐 깨지거나 사라지는 문제(FOUC/초기화 순서/텍스트 덮어쓰기)를 수정.
- 언어/테마/슬롯 버튼의 초기 상태 깜빡임(영어→한국어, SPIN→시작, 토글 아이콘/노브 불일치)을 최소화.

**핵심 이슈와 원인**

| 구분 | 증상 | 근본 원인 |
|------|------|-----------|
| Footer 렌더링 | `index.html`에서 Footer 스타일 일부 깨짐 | 공통 Footer(`pages/footer.html`)가 사용하는 `brand-*` 색상/`Material Symbols`/그라디언트 클래스가 메인 페이지 설정과 부분 불일치 |
| 사이드바 메뉴 아이콘 | `오늘의 추천 메뉴`, `커뮤니티 게시판` 아이콘이 잠깐 보였다가 사라짐 | 번역 적용 시 버튼 전체 `textContent` 갱신으로 아이콘 노드(`<span>`)까지 삭제 |
| 언어 표시 깜빡임 | 언어 표시가 `English`로 잠깐 보였다가 `Korean`으로 전환 | 초기 언어 결정이 비동기(`initLanguageSelector`) 이후 적용되어 첫 페인트와 상태 반영 시점 불일치 |
| 테마 토글 깜빡임 | 라이트/다크 토글 노브 위치/아이콘이 잠깐 어긋남 | 초기 렌더 시 `aria-pressed`/아이콘 표시 규칙 동기화 부족 |
| 슬롯 버튼 텍스트 깜빡임 | `SPIN`이 잠깐 보였다가 `시작`으로 변경 | 초기 HTML 기본값과 번역 적용 시점 차이 |

**적용한 변경 상세**

1. Footer 공통화 및 메인 페이지 정합성 보정
- `index.html`에 공통 Footer 전용 리소스 정합성 보강
  - `Material Symbols Outlined` 폰트 로드 추가
  - `brand.dark`, `brand.cardDark` 등 Footer 의존 색상 토큰 정비
  - `.accent-gradient-text` 스타일 추가
- 메인 하단 Footer를 공통 마운트 방식으로 통일
  - `#site-footer` + `js/footer-loader.js` 구조 기준 유지

2. 사이드바 번역 로직 안전화 (아이콘 보존)
- `js/app.js`의 번역 적용 경로에서 버튼 전체 텍스트 치환을 제거
- `setSidebarNavLabel(id, label, iconName)` 유틸을 도입해:
  - `.sidebar-text`만 갱신
  - 아이콘 노드가 없으면 자동 복구
  - 아이콘 텍스트가 비어 있으면 아이콘 이름 재주입
- 적용 대상: `nav-recommendation`, `nav-recommend`, `nav-bulletin`, `nav-contact`

3. 초기화 순서 개선 (초기 깜빡임 최소화)
- `js/app.js` 초기 진입 시 동기 부트 언어값 도입
  - 우선순위: `localStorage.selectedLanguage` → 브라우저 locale 기반(`ko*`면 Korean) → 기본값 English
- 초기 부팅 시퀀스 직렬화
  - `buildSlotMenus()` 선실행
  - `await initLanguageSelector()` 완료 후 후속 초기화 진행
  - 번역/라벨 적용 타이밍을 첫 렌더 상태와 최대한 일치

4. 테마 토글 상태 동기화
- `index.html`에 `aria-pressed` 기반 아이콘/노브 표시 CSS 보강
  - 다크 상태에서 아이콘/노브가 즉시 일치하도록 규칙 추가
- 테마 적용 시 `.theme-toggle-switch` 전체에 `aria-pressed`, `aria-label` 일괄 동기화

5. 캐시 영향 완화 (구버전 스크립트 잔존 대응)
- `index.html`의 주요 스크립트에 버전 쿼리스트링 부여
  - `countryLanguageService.js`, `translations.js`, `footer-loader.js`, `app.js`
  - 브라우저 캐시로 구 로직이 재실행되는 케이스를 완화

6. 다크모드 색상 일관성 통일 (Footer 기준)
- `index.html`, `pages/about.html`, `pages/contact.html`의 브랜드 다크 팔레트를
  - `dark: #1f2937`
  - `cardDark: #374151`
  로 통일
- 결과적으로 공통 Footer(`pages/footer.html`)의 다크 색상 톤이 다른 `pages/*.html`과 시각적으로 일치

**파일 단위 변경 포인트**
- `index.html`
  - Footer 관련 폰트/토큰/스타일 정합성 추가
  - 언어/테마/슬롯 버튼 초기 표시값 보정
  - 스크립트 캐시 버전 파라미터 추가
- `js/app.js`
  - 사이드바 라벨 안전 갱신 유틸 도입
  - 번역 적용 시 아이콘 보존 로직 적용
  - 언어 부트값/초기화 순서 직렬화
  - 테마 토글 접근성 상태 동기화 강화
- `pages/about.html`, `pages/contact.html`
  - 브랜드 다크 팔레트(`brand.dark`, `brand.cardDark`) 통일

**검증/확인 기준**
- 사이드바 `오늘의 추천 메뉴`, `커뮤니티 게시판`, `제휴 문의` 아이콘 유지 여부
- 초기 로딩 시 언어 라벨/슬롯 버튼/테마 토글 깜빡임 감소 여부
- 공통 Footer 다크모드 색상 톤이 메인/서브 페이지에서 동일한지 확인

</details>

<details>
<summary><strong>2026-02-13</strong> - 리팩토링 진행</summary>

**원칙**
- 콘텐츠/기능 100% 유지, 스타일 단계적 전환
- SEO/AdSense 관련 메타/콘텐츠/정책 준수 영역 유지

**진행 결과**

| 단계 | 변경 영역 | 핵심 변경 |
|------|----------|-----------|
| Step 1 | Head/기본 설정 | Poppins+Inter 폰트 구성, Material Icons 도입, Tailwind `darkMode: "class"` 정비 |
| Step 2 | Sidebar | 접이식 사이드바, 섹션형 내비게이션, 모바일 토글, 언어 드롭다운 UI 개선 |
| Step 3 | 헤더/슬롯머신 + 추천/커뮤니티 | 히어로/카드 스타일 개편, 중첩 `<main>` 구조 정리, 패널 디자인 일관화 |
| Step 4 | 상황별/계절별 | 카드/그리드/태그 스타일 개편, 8개 상황 + 4개 계절 데이터 유지 |
| Step 5 | 인기 메뉴 Top 10 + 배달 가이드 | 섹션 카드/리스트 디자인 개선, 정보 구조 유지 |
| Step 6 | 점심·저녁/집밥/아침/칼로리 | 시각 체계/카드 스타일 재정비, 메뉴/칼로리 데이터 유지 |
| Step 7 | 음식 선택 팁/서비스 소개/카테고리 가이드 | 정보형 카드 레이아웃 개선, 설명 콘텐츠 유지 |
| Step 8 | How to Use + FAQ | 2/3 + 1/3 그리드 레이아웃, FAQ 아코디언 인터랙션 정리 |
| Step 9 | Footer + 다크모드 마무리 | 푸터 시맨틱 구조 개선, FOUC 방지/테마 저장/아이콘 전환 로직 정리 |

</details>

<details>
<summary><strong>2026-02-11</strong> - 구조/SEO/빌드 정리</summary>

- `code.html` 제외 HTML을 `pages/`로 이동하고 기존 경로를 301 리다이렉트로 연결
- `canonical`, `og:url`, `sitemap.xml`을 `/pages/` 경로 기준으로 정리
- JSON-LD 관리 방식을 `js/ld/*.json` + `npm run build`(`scripts/inject-jsonld.js`)로 통일


<!-- README:AUTO-START -->
### 자동 동기화

#### 변경 파일(커밋 스테이징 기준)
```text
M	README.md
D	polar.txt
```

<!-- README:AUTO-END -->

</details>