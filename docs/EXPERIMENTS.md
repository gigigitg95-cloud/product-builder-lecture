# Experiments (Feature Flags)

목적: Codex CLI/브라우저 콘솔에서 빠르게 기능 실험을 on/off 하되, 사용자 UI에는 실험 배지/문구를 노출하지 않습니다.

## 플래그 소스 우선순위

1. `localStorage` override: `ninanoo.featureFlags.v1`
2. `runtime-config` 응답의 `flags` 객체
3. 기본값(default): 모두 `true` (기존 UX 유지)

## 플래그 정의

| flag | 기본값 | 제어 대상 | 목적 | 측정 지표(예시) |
|---|---|---|---|---|
| `recoWhy` | `true` | 추천 이유/대체옵션 UI (`index`) | 설명형 UI가 클릭/재추천 행동에 미치는 영향 측정 | `recommend_click` 대비 `alternative_option_click` 비율, 추천 재시도율 |
| `freeWeeklyPlan` | `true` | 무료 7일 식단 진입 링크(`index` 사이드바/모바일) | 무료 플랜 진입 유무가 프리미엄 전환에 주는 영향 측정 | `report_intake_viewed`, `payment_started` 전환율 |
| `aiFoodEnhance` | `true` | 음식 사진 보정 진입 링크(`index`, footer) | 신규 AI 기능 노출이 기존 핵심 플로우에 주는 영향 측정 | `payment_started`(food-enhance source), 재방문율 |

## 빠른 토글 방법 (브라우저 콘솔)

전체 조회:

```js
window.NinanooFlags && window.NinanooFlags.getAll()
```

단일 플래그 변경:

```js
window.NinanooFlags.setFlag('recoWhy', false)
window.NinanooFlags.setFlag('freeWeeklyPlan', false)
window.NinanooFlags.setFlag('aiFoodEnhance', false)
location.reload()
```

초기화(기본값 복귀):

```js
window.NinanooFlags.reset()
location.reload()
```

직접 JSON 편집:

```js
localStorage.setItem('ninanoo.featureFlags.v1', JSON.stringify({
  recoWhy: true,
  freeWeeklyPlan: true,
  aiFoodEnhance: true
}))
location.reload()
```

## 운영 원칙

- 실험 상태를 사용자에게 직접 노출하지 않음.
- 실험 중에도 PII 전송 금지(분석은 `docs/ANALYTICS_EVENTS.md` 규칙 준수).
- 플래그 off 시 기능 UI가 안전하게 숨겨지고, 기본 플로우는 깨지지 않아야 함.
