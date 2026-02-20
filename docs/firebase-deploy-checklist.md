# Firebase Deploy Checklist (Ninanoo)

배포 업데이트가 필요할 때 아래 순서대로 실행하면 됩니다.  
기본 원칙: `사전 검증 -> 규칙 -> (선택) 인덱스 -> 호스팅 -> 스모크 체크`.

## 1) 원클릭 체크 스크립트

```bash
scripts/deploy-checklist.sh
```

Firebase만 빠르게 배포할 때:

```bash
scripts/firebase-deploy-only.sh
```

프로필 자동반영(게스트/로그인) 스모크 체크:

```bash
scripts/profile-sync-smoke-check.sh
```

옵션:

```bash
# 검증만 실행
scripts/deploy-checklist.sh --check-only

# Firebase만 배포 (Worker 제외)
scripts/deploy-checklist.sh --firebase-only

# Worker만 배포 (Firebase 제외)
scripts/deploy-checklist.sh --worker-only

# Firestore 인덱스까지 같이 배포
scripts/deploy-checklist.sh --with-indexes

# Firebase 전용 스크립트에서 인덱스 포함
scripts/firebase-deploy-only.sh --with-indexes
```

프로젝트 변경:

```bash
FIREBASE_PROJECT=your-project-id scripts/deploy-checklist.sh --firebase-only
```

## 2) 수동 배포 순서 (명령 복붙용)

### A. 사전 검증

```bash
firebase --version
firebase projects:list --json
git status --short
npm run build
node scripts/check-dom-contract.js
npm --prefix workers/polar-checkout-worker run check
```

### B. Worker 배포 (필요 시)

```bash
npm --prefix workers/polar-checkout-worker run deploy
```

### C. Firebase 배포

```bash
# 1) Firestore Rules
firebase deploy --only firestore:rules --project productai-8845e

# 2) Firestore Indexes (indexes 설정이 있을 때만)
firebase deploy --only firestore:indexes --project productai-8845e

# 3) Hosting
firebase deploy --only hosting --project productai-8845e
```

## 3) 배포 후 스모크 체크

```bash
curl -i https://api.ninanoo.com/health
curl -I https://ninanoo.com/
scripts/profile-sync-smoke-check.sh
scripts/analytics-smoke-check.sh
```

프로필 동기화 상세 브라우저 시나리오:

```bash
docs/profile-sync-qa-checklist.md
docs/analytics-qa-checklist.md
```

## 4) 실패 시 빠른 대응

1. `firestore:rules` 실패: 규칙 문법/필드 제약 확인 후 재배포
2. `hosting` 실패: `firebase.json` rewrites/headers 확인 후 재배포
3. API 5xx: Worker 최근 배포/시크릿 변경 여부 확인
4. 429/권한 오류: Firebase/Worker rate limit 및 인증 설정 재확인

## 5) 참고

- Worker 시크릿 변경:

```bash
cd workers/polar-checkout-worker
npx wrangler secret put <SECRET_NAME>
```

- Firebase 프리뷰 채널:

```bash
firebase hosting:channel:deploy preview --project productai-8845e
```
