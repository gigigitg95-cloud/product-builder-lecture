# Supabase CLI 기반 회원가입/로그인 설정

이 프로젝트의 `pages/auth.html`, `js/auth-page.js`는 Supabase Auth를 사용합니다.

## 1) Supabase CLI 초기화

```bash
npx supabase init
```

이미 `supabase/` 폴더가 존재하면 이 단계는 건너뜁니다.

## 2) Supabase 로그인 및 프로젝트 연결

```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF>
```

`<YOUR_PROJECT_REF>`는 Supabase 대시보드 프로젝트 URL의 ref 값입니다.

## 3) 마이그레이션 반영

```bash
npx supabase db push
```

반영 대상:
- `supabase/migrations/20260218090000_create_user_profiles.sql`

이 마이그레이션은 다음을 생성합니다.
- `public.user_profiles` 테이블
- 본인 데이터만 접근 가능한 RLS 정책
- `auth.users` 신규 생성 시 `user_profiles` 자동 생성 트리거

## 4) Auth Provider 설정

Supabase Dashboard -> Authentication에서 아래를 설정합니다.

1. `Email` 활성화
2. `Google` 활성화
3. URL Configuration
   - Site URL: `https://ninanoo.com`
   - Redirect URLs:
     - `http://localhost:xxxx/index.html`
     - `https://ninanoo.com/index.html`
4. Google Cloud Console OAuth Client 설정
   - Authorized JavaScript origins:
     - `https://ninanoo.com`
     - `http://localhost:xxxx`
   - Authorized redirect URIs:
     - `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`

## 5) Cloudflare Workers에서 런타임 설정 제공

프론트엔드에 키를 하드코딩하지 않고 Worker `/runtime-config`에서 내려줍니다.

Worker 환경변수 설정:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
```

이 프로젝트의 `js/runtime-config.js`는 페이지 로드 시 `https://api.ninanoo.com/runtime-config`를 호출해
`window.SUPABASE_URL`, `window.SUPABASE_ANON_KEY`를 설정합니다.

`SUPABASE_ANON_KEY`는 publishable/anon 키만 사용합니다.  
`service_role` 키는 프론트엔드/런타임 응답에 절대 포함하지 않습니다.

## 6) 로컬 확인 포인트

- 이메일 회원가입 시 인증 메일이 발송되는지
- 인증 완료 후 이메일 로그인 가능한지
- Google 로그인 후 `user_profiles` row가 생성되는지
- 로그인 후 프로필 저장/재조회가 정상 동작하는지
- Google 로그인 성공 후 `/index.html`로 복귀되는지
