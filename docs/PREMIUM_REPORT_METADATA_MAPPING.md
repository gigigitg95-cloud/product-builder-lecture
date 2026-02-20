# Premium Report Metadata Mapping

## Overview
`report-intake` 입력값은 `sessionStorage`(`ninanooPremiumReportDraft`)에 저장된 뒤, 결제 시 `create-checkout` 요청의 `metadata`로 전달됩니다.

## Mapping Table

| Form ID | Draft Key (`sessionStorage`) | Polar Checkout Metadata Key | Type/Limit | Required | Notes |
|---|---|---|---|---|---|
| `report-goal` | `report_goal` | `report_goal` | string / 100 | Yes (minimum) | 핵심 목표 |
| `report-period-weeks` | `report_period_weeks` | `report_period_weeks` | number-string / 10 | Recommended | 목표 기간(주) |
| `report-height-cm` | `report_height_cm` | `report_height_cm` | number-string / 10 | Recommended | 키 |
| `report-weight-kg` | `report_weight_kg` | `report_weight_kg` | number-string / 10 | Recommended | 체중 |
| `report-activity-level` | `report_activity_level` | `report_activity_level` | string / 20 | Recommended | 활동량 레벨 |
| `report-weekly-workouts` | `report_weekly_workouts` | `report_weekly_workouts` | number-string / 10 | Conditional | 활동량 부족 시 추가 질문 |
| `report-daily-steps` | `report_daily_steps` | `report_daily_steps` | number-string / 10 | Conditional | 활동량 부족 시 추가 질문 |
| `report-allergies` | `report_allergies` | `report_allergies` | string / 120 | Optional | 알레르기 |
| `report-avoid` | `report_avoid_ingredients` | `report_avoid_ingredients` | string / 120 | Optional | 기피 재료 |
| `report-dietary-restrictions` | `report_dietary_restrictions` | `report_dietary_restrictions` | string / 120 | Recommended | 식이 제한 |
| `report-preferred` | `report_preferred_categories` | `report_preferred_categories` | string / 120 | Optional | 선호 카테고리 |
| `report-budget-level` | `report_budget_level` | `report_budget_level` | string / 30 | Recommended | 예산 수준 |
| `report-cooking-environment` | `report_cooking_environment` | `report_cooking_environment` | string / 40 | Recommended | 조리 환경 |
| `report-note` | `report_note` | `report_note` | string / 300 | Optional | 추가 요청 |

## Code References
- Intake draft save: `js/premium-report-intake.js`
- Metadata resolve + checkout request: `js/polar-worker-checkout.js`

## Backward Compatibility
- 기존 키(`report_goal`, `report_allergies`, `report_avoid_ingredients`, `report_preferred_categories`, `report_note`)는 그대로 유지됩니다.
- 신규 키는 비어 있으면 metadata에서 자동 제거되어 기존 결제/웹훅/리포트 생성 구조를 깨지 않습니다.
