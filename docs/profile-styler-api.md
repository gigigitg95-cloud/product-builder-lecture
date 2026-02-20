# Profile Styler API (`/api/ai/styler`)

프로필 사진 스타일 보정 + 코디 추천(5개 카드) API 스펙입니다.

- Path: `POST /api/ai/styler` (또는 `POST /ai/styler`)
- Auth: 없음
- 기본 정책: 업로드 이미지는 서버에 저장하지 않음 (`stored: false`)

## 1) 요청 스키마

```json
{
  "imageBase64": "data:image/png;base64,... 또는 raw base64",
  "mimeType": "image/png | image/jpeg | image/webp",
  "fileName": "optional",
  "preset": "business | casual | street | minimal",
  "context": "optional free text, max 240 chars"
}
```

제약:
- 허용 포맷: `image/jpeg`, `image/png`, `image/webp`
- 파일 크기 제한: 환경변수 `STYLER_MAX_MB` (기본 8MB)
- Rate limit: 환경변수 `STYLER_RATE_LIMIT_PER_MIN` (기본 분당 8회, IP 기준 in-memory)

## 2) 성공 응답

```json
{
  "ok": true,
  "advisoryOnly": false,
  "advisory": null,
  "preset": "business",
  "cards": [
    { "title": "추천 1", "items": "상의/하의/신발 조합", "tip": "스타일 팁" }
  ],
  "imageBase64": "<png base64>",
  "imageMimeType": "image/png",
  "imageModel": "gpt-image-1",
  "textModel": "gpt-4.1-mini",
  "stored": false,
  "rateLimit": { "limit": 8, "remaining": 7, "resetSec": 55 }
}
```

`advisoryOnly=true` 케이스:
- 미성년자 의심 키워드가 포함된 경우
- 이미지 보정은 생략하고 안전한 일반 코디 가이드만 반환

## 3) 에러 응답 표준

모든 에러는 아래 형식:

```json
{
  "ok": false,
  "error": {
    "code": "string",
    "message": "human readable",
    "status": 400,
    "details": {}
  }
}
```

주요 `error.code`:
- `invalid_json`
- `missing_image`
- `invalid_base64`
- `unsupported_mime_type`
- `file_too_large`
- `rate_limited`
- `policy_blocked` (성적 맥락 요청)
- `feature_disabled`
- `forbidden_origin`
- `forbidden_host`
- `enhance_failed`

## 4) 안전 가드레일

- 체형/외모/매력 평가 금지
- 성적 맥락 금지
- 미성년자 의심 시 안전 가이드 모드로 제한
- 글로벌 확장 대응을 위해 문화권 독립적인 일반 코디 표현 우선

## 5) 환경변수

- `STYLER_ENABLED` (`true`/`false`, 기본 `true`)
- `STYLER_MODEL` (텍스트 추천 모델, 기본 `gpt-4.1-mini`)
- `STYLER_IMAGE_MODEL` (이미지 보정 모델, 기본 `gpt-image-1`)
- `STYLER_MAX_MB` (기본 8)
- `STYLER_RATE_LIMIT_PER_MIN` (기본 8)
- `OPENAI_API_KEY` (필수)

## 6) cURL 예시

```bash
curl -X POST "https://api.ninanoo.com/api/ai/styler" \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAA...",
    "mimeType": "image/png",
    "fileName": "profile.png",
    "preset": "minimal",
    "context": "해외 취업 프로필용"
  }'
```
