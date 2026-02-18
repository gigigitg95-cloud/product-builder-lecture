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

## 5) 프론트엔드 설정값 입력

`pages/auth.html`의 meta 태그에 값을 입력합니다.

```html
<meta name="supabase-url" content="https://YOUR_PROJECT_REF.supabase.co"/>
<meta name="supabase-anon-key" content="YOUR_SUPABASE_ANON_KEY"/>
```

또는 페이지 로드 전에 전역 변수로 주입해도 됩니다.

```html
<script>
  window.SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co";
  window.SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
</script>
```

## 6) 로컬 확인 포인트

- 이메일 회원가입 시 인증 메일이 발송되는지
- 인증 완료 후 이메일 로그인 가능한지
- Google 로그인 후 `user_profiles` row가 생성되는지
- 로그인 후 프로필 저장/재조회가 정상 동작하는지
- Google 로그인 성공 후 `/index.html`로 복귀되는지
