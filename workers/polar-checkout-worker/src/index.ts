import { Webhook } from "standardwebhooks";

interface Env {
  POLAR_OAT_TOKEN: string;
  POLAR_WEBHOOK_SECRET: string;
  POLAR_MODE?: string;
  DEFAULT_PRODUCT_ID?: string;
  ALLOWED_ORIGINS?: string;
  ALLOWED_HOSTS?: string;
  AUTO_REFUND_ENABLED?: string;
  AUTO_REFUND_PRODUCT_IDS?: string;
  AUTO_REFUND_EMAIL_DOMAIN_DENYLIST?: string;
  RESEND_API_KEY?: string;
  REPORT_EMAIL_FROM?: string;
  REPORT_EMAIL_REPLY_TO?: string;
  REPORT_EMAIL_SUBJECT_PREFIX?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  PREMIUM_REPORT_ENABLED?: string;
  PREMIUM_REPORT_PRODUCT_IDS?: string;
  PREMIUM_REPORT_MAX_TOKENS?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

type CheckoutRequest = {
  productId?: string;
  successUrl?: string;
  returnUrl?: string;
  externalCustomerId?: string;
  metadata?: Record<string, string>;
};

type WebhookPayload = {
  type?: string;
  data?: Record<string, unknown>;
};

type WorkerExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

type ResendReportRequest = {
  orderId?: string;
  order_id?: string;
  checkoutId?: string;
  checkout_id?: string;
};

type PremiumReportPreviewRequest = ResendReportRequest;
type DeleteAccountRequest = { confirm?: boolean };

type PolarOrder = {
  id?: string;
  status?: string;
  subscription_id?: string | null;
  customer_email?: string | null;
  metadata?: Record<string, unknown>;
  items?: Array<{
    product_id?: string;
    product?: { id?: string };
  }>;
};

const POLAR_API_PROD = "https://api.polar.sh/v1";
const POLAR_API_SANDBOX = "https://sandbox-api.polar.sh/v1";
const DEFAULT_PRODUCT_ID = "09ed8b9c-c328-4962-a12f-69923155d3c6";
const RESEND_EMAIL_API = "https://api.resend.com/emails";
const OPENAI_RESPONSES_API = "https://api.openai.com/v1/responses";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

// 프롬프트를 직접 수정하려면 아래 2개 상수를 편집하세요.
const PREMIUM_REPORT_SYSTEM_PROMPT =
  "You are a Korean premium nutrition-planning assistant for paying customers. Write in Korean only, with a practical professional diet-coach tone (not bloggy). Deliver a high-value, actionable, personalized 7-day meal-plan report. Safety: no diagnosis, no treatment claims, no extreme dieting (very low calories, fasting, detox), and no supplement/medication guidance. If pregnancy, eating disorder history, chronic disease, or concerning symptoms are possible, include a brief 'consult a clinician' note. Personalization: strictly respect allergies/avoid-ingredients and preferences; prefer Korean foods and realistic convenience options. If user data is insufficient, still provide a usable plan, but explicitly state key assumptions and include a short list of minimum follow-up questions to optimize.";

function buildPremiumReportUserPrompt(order: PolarOrder, profile: PremiumProfile): string {
  return [
    "아래 결제 주문/개인화 정보 기준으로 **유료 고객이 만족할 만한** 한국어 프리미엄 식단 리포트를 작성해줘.",
    "문체: 영양사/코치의 실무형 코칭(간결하지만 구체적, 숫자 포함). 광고/감성/블로그 톤 금지.",
    "",
    "핵심 원칙(반드시 준수):",
    "- 알레르기/기피 재료는 절대 추천하지 말 것(유사 성분/가공식품 라벨 주의까지 언급)",
    "- 의료행위(진단/치료) 단정 금지, 위험 신호가 있으면 '의료진 상담'을 권고",
    "- 과도한 제한식/단식/디톡스/극단 저칼로리 금지",
    "- 모호한 표현 대신 실행 가능한 지시(분량/횟수/타이밍/대체안)로 작성",
    "",
    "데이터가 부족해도 반드시 플랜을 제공하되, **중요 가정(예: 목표 칼로리 범위/활동량/체중 변동 목표 등)**을 명시하고, 리포트 안에 '추가로 답하면 더 정밀해지는 질문'을 포함해줘.",
    "",
    "출력 형식(섹션 제목/개수 엄수):",
    "1) [요약]: 정확히 4줄. (현재 상태) / (핵심 목표) / (실행 우선순위 3개) / (오늘 실행 액션 1개)",
    "2) [맞춤 추천]: 정확히 5개. 각 항목은 아래 3줄 형식 고정.",
    "   - n) 추천 내용 1줄",
    "   - 추천 이유: 근거 1줄",
    "   - 실행 가이드: 분량/횟수/타이밍 중 최소 1개 숫자 포함 1줄",
    "   *5번째 항목은 '추가로 알려주면 더 정밀해지는 질문(최대 8개)'으로 구성해.",
    "3) [7일 플랜]: Day1~Day7 모두 작성.",
    "   - 각 Day는 '식단/행동 계획' 1줄 + '체크포인트:' 1줄로 구성.",
    "   - '식단/행동 계획' 1줄 안에 아침/점심/저녁/간식(선택)을 **짧게** 넣고, 각 끼니에 분량(예: g, 공기, 컵, 개수) 또는 손바닥/주먹 기준 중 1개는 반드시 포함.",
    "   - 외식/편의점 대안도 최소 2일은 포함.",
    "4) [주의사항]: 정확히 2줄. (알레르기/기피 재료 회피) + (의료 안전/개인차/상담 권고) 포함.",
    "",
    `order_id: ${order.id || ""}`,
    `customer_email: ${normalizeEmail(order.customer_email)}`,
    `order_status: ${String(order.status || "")}`,
    `products: ${extractOrderProductIds(order).join(", ")}`,
    "",
    "[개인화 정보]",
    buildPremiumProfileSummary(profile),
    "",
    `raw_metadata: ${safeStringify(order.metadata || {})}`,
  ].join("\n");
}

type WebhookReport = {
  eventType: string;
  mode: string;
  orderId?: string | null;
  customerEmail?: string | null;
  reason?: string;
  autoRefunded: boolean;
  refundStatus?: number;
  detail?: unknown;
  refund?: unknown;
};

type PremiumReportQueueResult = {
  queued: boolean;
  reason?: string;
};

type PremiumProfile = {
  goal: string;
  allergies: string;
  avoidIngredients: string;
  preferredCategories: string;
  note: string;
};

function splitCsv(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isTruthy(value?: string): boolean {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init?.headers || {}),
    },
  });
}

function resolveCorsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowedOrigins = splitCsv(env.ALLOWED_ORIGINS);
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] || "https://ninanoo.com";

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
    "access-control-max-age": "86400",
    vary: "origin",
  };
}

function isOriginAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return true;
  const allowedOrigins = splitCsv(env.ALLOWED_ORIGINS);
  if (allowedOrigins.length === 0) return true;
  return allowedOrigins.includes(origin);
}

function isHostAllowed(hostname: string, env: Env): boolean {
  const allowedHosts = splitCsv(env.ALLOWED_HOSTS).map((host) => host.toLowerCase());
  if (allowedHosts.length === 0) return true;
  return allowedHosts.includes(hostname.toLowerCase());
}

function getPolarApiBase(env: Env): string {
  const mode = String(env.POLAR_MODE || "sandbox").toLowerCase();
  return mode === "production" ? POLAR_API_PROD : POLAR_API_SANDBOX;
}

function safeStringify(value: unknown, maxLength = 4000): string {
  if (value === undefined) return "";
  const asText = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  if (!asText) return "";
  if (asText.length <= maxLength) return asText;
  return `${asText.slice(0, maxLength)}\n...(truncated)`;
}

function normalizeEmail(value?: string | null): string {
  return String(value || "").trim();
}

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildReportEmail(report: WebhookReport, env: Env): { subject: string; text: string } {
  const statusText = report.autoRefunded ? "SUCCESS" : "FAILED_OR_SKIPPED";
  const prefix = String(env.REPORT_EMAIL_SUBJECT_PREFIX || "[ninanoo]").trim() || "[ninanoo]";
  const subject = `${prefix} auto-refund report ${statusText} (${report.eventType})`;
  const lines = [
    `generated_at: ${new Date().toISOString()}`,
    `mode: ${report.mode}`,
    `event_type: ${report.eventType}`,
    `auto_refunded: ${report.autoRefunded}`,
    `reason: ${report.reason || ""}`,
    `order_id: ${report.orderId || ""}`,
    `customer_email: ${report.customerEmail || ""}`,
    `refund_status: ${report.refundStatus ?? ""}`,
    "",
    "[detail]",
    safeStringify(report.detail),
    "",
    "[refund]",
    safeStringify(report.refund),
  ];
  return { subject, text: lines.join("\n") };
}

function getPremiumReportProductIds(env: Env): string[] {
  return splitCsv(env.PREMIUM_REPORT_PRODUCT_IDS || env.DEFAULT_PRODUCT_ID || DEFAULT_PRODUCT_ID);
}

function shouldGeneratePremiumReport(order: PolarOrder, env: Env): { apply: boolean; reason?: string } {
  if (!isTruthy(env.PREMIUM_REPORT_ENABLED || "true")) {
    return { apply: false, reason: "premium_report_disabled" };
  }
  if (!order?.id) {
    return { apply: false, reason: "missing_order_id" };
  }
  if (!normalizeEmail(order.customer_email)) {
    return { apply: false, reason: "missing_customer_email" };
  }
  const products = getPremiumReportProductIds(env);
  const orderProductIds = extractOrderProductIds(order);
  if (products.length > 0 && !orderProductIds.some((id) => products.includes(id))) {
    return { apply: false, reason: "product_not_eligible" };
  }
  if (String(order.status || "").toLowerCase().includes("refund")) {
    return { apply: false, reason: "order_refunded" };
  }
  return { apply: true };
}

function extractOpenAIOutputText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const record = data as Record<string, unknown>;
  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }
  const output = Array.isArray(record.output) ? record.output : [];
  const lines: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as Array<Record<string, unknown>>)
      : [];
    for (const part of content) {
      if (typeof part?.text === "string" && part.text.trim()) {
        lines.push(part.text.trim());
      }
    }
  }
  return lines.join("\n").trim();
}

function extractStringMetadata(metadata: Record<string, unknown> | undefined, key: string, maxLen: number): string {
  return String(metadata?.[key] || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function extractPremiumProfile(order: PolarOrder): PremiumProfile {
  const metadata = (order.metadata || {}) as Record<string, unknown>;
  return {
    goal: extractStringMetadata(metadata, "report_goal", 100),
    allergies: extractStringMetadata(metadata, "report_allergies", 120),
    avoidIngredients: extractStringMetadata(metadata, "report_avoid_ingredients", 120),
    preferredCategories: extractStringMetadata(metadata, "report_preferred_categories", 120),
    note: extractStringMetadata(metadata, "report_note", 300),
  };
}

function buildPremiumProfileSummary(profile: PremiumProfile): string {
  const lines = [
    `- 목표: ${profile.goal || "미입력"}`,
    `- 알레르기: ${profile.allergies || "없음/미입력"}`,
    `- 기피 재료: ${profile.avoidIngredients || "없음/미입력"}`,
    `- 선호 카테고리: ${profile.preferredCategories || "미입력"}`,
    `- 추가 요청: ${profile.note || "없음"}`,
  ];
  return lines.join("\n");
}

function splitProfileKeywords(value: string): string[] {
  return String(value || "")
    .split(/[,\n/|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildPreferredSummary(profile: PremiumProfile): string {
  const preferred = splitProfileKeywords(profile.preferredCategories);
  return preferred.length > 0 ? preferred.slice(0, 3).join(", ") : "균형식";
}

function buildGoalAction(goal: string): string {
  const normalizedGoal = String(goal || "").toLowerCase();
  if (/(감량|다이어트|체중\s*감량)/.test(normalizedGoal)) {
    return "오늘 저녁부터 밥 양을 평소의 2/3로 줄이고 채소 반찬 1가지를 추가하세요.";
  }
  if (/(증량|벌크|근육|체중\s*증가)/.test(normalizedGoal)) {
    return "오늘부터 매 끼니 단백질 식품 1개(달걀/두부/닭가슴살 등)를 고정 추가하세요.";
  }
  if (/(혈당|당|당뇨)/.test(normalizedGoal)) {
    return "오늘부터 음료는 무가당으로 바꾸고 식사 후 10분 걷기를 바로 시작하세요.";
  }
  return "오늘부터 하루 3끼 중 2끼는 단백질+채소를 먼저 먹는 순서로 식사하세요.";
}

function buildFallbackPremiumReport(order: PolarOrder): string {
  const email = normalizeEmail(order.customer_email) || "고객";
  const profile = extractPremiumProfile(order);
  const preferredSummary = buildPreferredSummary(profile);
  const safetyKeywords = [...splitProfileKeywords(profile.allergies), ...splitProfileKeywords(profile.avoidIngredients)];
  const safetyNote = safetyKeywords.length > 0 ? safetyKeywords.slice(0, 6).join(", ") : "없음/미입력";
  const todayAction = buildGoalAction(profile.goal);
  const dayPlans = [
    {
      day: "Day1",
      plan: "아침(달걀/두부 + 과일), 점심(단백질 1 + 채소 2 + 탄수화물 1), 저녁(국물 적은 단백질+채소 중심)",
      checkpoint: "저녁 과식을 막기 위해 오후 간식(견과/요거트 중 1개)을 사전 준비",
    },
    {
      day: "Day2",
      plan: "전날과 동일한 틀 유지 + 저녁 탄수화물은 점심의 1/2 분량으로 조정",
      checkpoint: "하루 수분 6~8컵 달성 여부 체크",
    },
    {
      day: "Day3",
      plan: `선호 카테고리(${preferredSummary}) 중 1개를 점심에 반영하고 저녁은 담백 메뉴로 마감`,
      checkpoint: "식사 후 포만감/허기 시간을 기록해 다음 날 양 조절 근거 확보",
    },
    {
      day: "Day4",
      plan: "아침 단백질 고정 + 점심은 채소 비중 확대 + 저녁은 가공식품 최소화",
      checkpoint: "야식 충동이 있으면 물 1컵 후 10분 대기 규칙 적용",
    },
    {
      day: "Day5",
      plan: "외식/배달 1회 허용하되 메인 메뉴 1개 + 채소 사이드 1개를 함께 주문",
      checkpoint: "소스/드레싱은 절반만 사용",
    },
    {
      day: "Day6",
      plan: "주말 식단 흔들림 방지를 위해 집에서 2끼 직접 구성(단백질+채소 기준)",
      checkpoint: "다음 주 자주 먹을 재료 5개를 장보기 리스트로 정리",
    },
    {
      day: "Day7",
      plan: "이번 주 식단에서 유지 가능한 메뉴 3개를 확정하고 다음 주 반복 계획 수립",
      checkpoint: "체중/컨디션/소화상태 중 1가지를 기준 지표로 선택",
    },
  ];

  const lines = [
    "프리미엄 메뉴 리포트",
    "",
    "[요약]",
    `- 고객 이메일: ${email}`,
    `- 주문번호: ${order.id || "-"}`,
    `- 핵심 목표: ${profile.goal || "미입력(체중/건강 목표를 1문장으로 설정 권장)"}`,
    `- 오늘 실행 액션: ${todayAction}`,
    "",
    "[맞춤 추천]",
    `1) 한 끼 기본 공식을 고정하세요: 단백질 1 + 채소 2 + 탄수화물 1`,
    "- 추천 이유: 식사 구성을 표준화하면 칼로리 계산 없이도 과식을 줄이고 영양 불균형을 예방할 수 있습니다.",
    "- 실행 가이드: 매 끼니 단백질 1손바닥 + 채소 2주먹 + 탄수화물 1주먹 비율로 7일 유지",
    `2) 알레르기/기피 재료(${safetyNote})는 구매 단계부터 완전 제외하세요.`,
    "- 추천 이유: 조리 단계보다 구매 단계에서 차단해야 교차오염/실수 가능성을 줄일 수 있습니다.",
    "- 실행 가이드: 장보기 앱/메모에 금지 재료를 고정 기록하고 제품 라벨을 매회 10초 확인",
    `3) 선호 카테고리(${preferredSummary})를 주 3회 이내로 배치해 식단 이탈을 줄이세요.`,
    "- 추천 이유: 선호 메뉴를 계획적으로 넣으면 지속성이 높아지고 폭식 보상 패턴을 예방할 수 있습니다.",
    "- 실행 가이드: 주간 식단표에 선호 메뉴를 Day2, Day4, Day6 점심 슬롯으로 미리 배치",
    "4) 간식은 무작정 제한하지 말고 단백질/식이섬유 간식 1회를 고정하세요.",
    "- 추천 이유: 공복 시간을 줄이면 다음 끼니 과식 가능성이 낮아집니다.",
    "- 실행 가이드: 오후 3~5시 사이 간식 1회(그릭요거트/삶은달걀/견과류 중 택1)만 허용",
    "5) 주 1회는 장보기/전처리(씻기, 소분, 냉장보관) 시간을 예약하세요.",
    "- 추천 이유: 실행 장벽을 낮추면 좋은 식단이 의지보다 시스템으로 유지됩니다.",
    "- 실행 가이드: 일요일 40분을 고정해 채소 손질과 단백질 식재료 소분을 완료",
    "",
    "[7일 플랜]",
  ];
  for (const dayPlan of dayPlans) {
    lines.push(`- ${dayPlan.day}: ${dayPlan.plan}`);
    lines.push(`  체크포인트: ${dayPlan.checkpoint}`);
  }
  lines.push("");
  lines.push("[주의사항]");
  lines.push("- 본 리포트는 일반적인 식단 가이드입니다. 기존 질환/복용약이 있으면 의료진 또는 영양 전문가와 함께 조정하세요.");
  lines.push("- 알레르기 성분은 원재료명/제조공정 문구까지 확인하고, 외식 시 동일 조리도구 사용 여부를 먼저 문의하세요.");
  return lines.join("\n");
}

function isPremiumReportQualityAcceptable(content: string): boolean {
  const normalized = String(content || "").trim();
  if (!normalized) return false;
  if (normalized.length < 650) return false;

  const requiredSections = ["[요약]", "[맞춤 추천]", "[7일 플랜]", "[주의사항]"];
  if (requiredSections.some((section) => !normalized.includes(section))) return false;

  const dayMatches = normalized.match(/Day[1-7]/g) || [];
  const uniqueDays = new Set(dayMatches);
  if (uniqueDays.size < 7) return false;

  const reasonCount = (normalized.match(/추천 이유:/g) || []).length;
  if (reasonCount < 5) return false;

  const executionGuideCount = (normalized.match(/실행 가이드:/g) || []).length;
  if (executionGuideCount < 5) return false;

  const checkpointCount = (normalized.match(/체크포인트:/g) || []).length;
  if (checkpointCount < 7) return false;

  return true;
}

async function generatePremiumReport(order: PolarOrder, env: Env): Promise<{ content: string; model: string }> {
  const apiKey = String(env.OPENAI_API_KEY || "").trim();
  const model = String(env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL;
  const profile = extractPremiumProfile(order);
  if (!apiKey) {
    return { content: buildFallbackPremiumReport(order), model: "fallback:no_openai_key" };
  }

  const userMessage = buildPremiumReportUserPrompt(order, profile);

  const maxOutputTokensRaw = Number.parseInt(String(env.PREMIUM_REPORT_MAX_TOKENS || "1200"), 10);
  const maxOutputTokens = Number.isFinite(maxOutputTokensRaw) && maxOutputTokensRaw > 0 ? maxOutputTokensRaw : 1200;

  const response = await fetch(OPENAI_RESPONSES_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_output_tokens: maxOutputTokens,
      input: [
        {
          role: "system",
          content: PREMIUM_REPORT_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`openai_generate_failed status=${response.status} body=${errorText}`);
  }

  const data = (await response.json().catch(() => null)) as unknown;
  const rawContent = extractOpenAIOutputText(data);
  const content = isPremiumReportQualityAcceptable(rawContent) ? rawContent.trim() : buildFallbackPremiumReport(order);
  if (!content) {
    throw new Error("openai_generate_failed empty_output_text");
  }
  return { content, model };
}

async function sendPremiumReportEmail(
  order: PolarOrder,
  premiumReport: { content: string; model: string },
  recipientEmail: string,
  env: Env
): Promise<void> {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.REPORT_EMAIL_FROM || "").trim();
  const replyTo = String(env.REPORT_EMAIL_REPLY_TO || "").trim();
  const subjectPrefix = String(env.REPORT_EMAIL_SUBJECT_PREFIX || "[ninanoo]").trim() || "[ninanoo]";
  if (!apiKey || !from || !recipientEmail) return;

  const subject = `${subjectPrefix} 프리미엄 메뉴 리포트`;
  const text = [
    "결제가 정상적으로 확인되어 프리미엄 리포트를 발송드립니다.",
    "",
    `주문번호: ${order.id || "-"}`,
    `생성모델: ${premiumReport.model}`,
    "",
    premiumReport.content,
    "",
    "안내: 본 메일은 결제 시 입력하신 이메일 주소 기준으로 발송됩니다.",
  ].join("\n");

  const payload: Record<string, unknown> = {
    from,
    to: [recipientEmail],
    subject,
    text,
  };
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch(RESEND_EMAIL_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`premium_email_send_failed status=${response.status} body=${errorBody}`);
  }
}

function queuePremiumReportEmail(
  ctx: WorkerExecutionContext,
  order: PolarOrder,
  env: Env
): PremiumReportQueueResult {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.REPORT_EMAIL_FROM || "").trim();
  const recipientEmail = normalizeEmail(order.customer_email);
  if (!apiKey || !from) {
    return { queued: false, reason: "report_email_not_configured" };
  }
  if (!recipientEmail) {
    return { queued: false, reason: "missing_customer_email" };
  }
  if (!isPlausibleEmail(recipientEmail)) {
    return { queued: false, reason: "invalid_customer_email" };
  }

  const decision = shouldGeneratePremiumReport(order, env);
  if (!decision.apply) {
    return { queued: false, reason: decision.reason || "premium_report_skipped" };
  }

  ctx.waitUntil(
    (async () => {
      let premiumReport: { content: string; model: string };
      try {
        premiumReport = await generatePremiumReport(order, env);
      } catch (error) {
        console.error("premium_report_generate_failed", {
          message: error instanceof Error ? error.message : String(error),
          orderId: order.id || null,
        });
        premiumReport = { content: buildFallbackPremiumReport(order), model: "fallback:generation_failed" };
      }

      await sendPremiumReportEmail(order, premiumReport, recipientEmail, env);
    })().catch((error) => {
      console.error("premium_report_delivery_failed", {
        message: error instanceof Error ? error.message : String(error),
        orderId: order.id || null,
        recipientEmail,
      });
    })
  );
  return { queued: true };
}

async function sendWebhookReportEmail(report: WebhookReport, recipientEmail: string, env: Env): Promise<void> {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.REPORT_EMAIL_FROM || "").trim();
  const replyTo = String(env.REPORT_EMAIL_REPLY_TO || "").trim();
  if (!apiKey || !from || !recipientEmail) return;

  const email = buildReportEmail(report, env);
  const payload: Record<string, unknown> = {
    from,
    to: [recipientEmail],
    subject: email.subject,
    text: email.text,
  };
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch(RESEND_EMAIL_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`resend_send_failed status=${response.status} body=${errorBody}`);
  }
}

function queueWebhookReportEmail(
  ctx: WorkerExecutionContext,
  report: WebhookReport,
  recipientEmailRaw: string | null | undefined,
  env: Env
): { queued: boolean; reason?: string } {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  const from = String(env.REPORT_EMAIL_FROM || "").trim();
  const recipientEmail = normalizeEmail(recipientEmailRaw);
  if (!apiKey || !from) {
    return { queued: false, reason: "report_email_not_configured" };
  }
  if (!recipientEmail) {
    return { queued: false, reason: "missing_customer_email" };
  }
  if (!isPlausibleEmail(recipientEmail)) {
    return { queued: false, reason: "invalid_customer_email" };
  }

  ctx.waitUntil(
    sendWebhookReportEmail(report, recipientEmail, env).catch((error) => {
      console.error("report_email_send_failed", {
        message: error instanceof Error ? error.message : String(error),
        eventType: report.eventType,
        orderId: report.orderId || null,
        recipientEmail,
      });
    })
  );

  return { queued: true };
}

async function polarApiRequest(
  env: Env,
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const response = await fetch(`${getPolarApiBase(env)}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.POLAR_OAT_TOKEN}`,
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

function extractOrderProductIds(order: PolarOrder): string[] {
  const ids = new Set<string>();
  const items = Array.isArray(order.items) ? order.items : [];
  for (const item of items) {
    if (item?.product_id) ids.add(item.product_id);
    if (item?.product?.id) ids.add(item.product.id);
  }
  return Array.from(ids);
}

function shouldAutoRefund(order: PolarOrder, env: Env): { apply: boolean; reason?: string } {
  if (!isTruthy(env.AUTO_REFUND_ENABLED)) {
    return { apply: false };
  }

  if (!order?.id) {
    return { apply: false };
  }

  if (order.subscription_id) {
    return { apply: false };
  }

  if (order.status && String(order.status).toLowerCase().includes("refund")) {
    return { apply: false };
  }

  const allowedProducts = splitCsv(env.AUTO_REFUND_PRODUCT_IDS || DEFAULT_PRODUCT_ID);
  const orderProductIds = extractOrderProductIds(order);
  if (allowedProducts.length > 0 && !orderProductIds.some((id) => allowedProducts.includes(id))) {
    return { apply: false };
  }

  const metadataFlag = order.metadata?.auto_refund;
  const metadataEnabled = metadataFlag === true || String(metadataFlag || "").toLowerCase() === "true";
  if (metadataEnabled) {
    return { apply: true, reason: "metadata.auto_refund=true" };
  }

  const denyDomains = splitCsv(env.AUTO_REFUND_EMAIL_DOMAIN_DENYLIST).map((value) => value.toLowerCase());
  const email = String(order.customer_email || "");
  const domain = email.includes("@") ? email.split("@").pop()?.toLowerCase() : "";
  if (domain && denyDomains.includes(domain)) {
    return { apply: true, reason: `denylist:${domain}` };
  }

  return { apply: false };
}

async function createCheckout(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }

  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403, headers: corsHeaders });
  }

  if (!env.POLAR_OAT_TOKEN) {
    return jsonResponse({ error: "Server misconfigured: missing POLAR_OAT_TOKEN" }, { status: 500, headers: corsHeaders });
  }

  let body: CheckoutRequest = {};
  try {
    body = (await request.json()) as CheckoutRequest;
  } catch {
    // allow empty JSON body
  }

  const productId = body.productId || env.DEFAULT_PRODUCT_ID || DEFAULT_PRODUCT_ID;
  if (!productId) {
    return jsonResponse({ error: "productId is required" }, { status: 400, headers: corsHeaders });
  }

  const payload: Record<string, unknown> = {
    products: [productId],
  };

  if (body.successUrl) payload.success_url = body.successUrl;
  if (body.returnUrl) payload.return_url = body.returnUrl;
  if (body.externalCustomerId) payload.external_customer_id = body.externalCustomerId;
  if (body.metadata && typeof body.metadata === "object") payload.metadata = body.metadata;

  const polar = await polarApiRequest(env, "/checkouts/", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!polar.ok) {
    return jsonResponse(
      {
        error: "Failed to create checkout session",
        status: polar.status,
        detail: polar.data,
      },
      {
        status: 502,
        headers: corsHeaders,
      }
    );
  }

  const result = polar.data as { url?: string; id?: string } | null;
  if (!result || typeof result.url !== "string") {
    return jsonResponse({ error: "Polar did not return checkout URL" }, { status: 502, headers: corsHeaders });
  }

  return jsonResponse(
    {
      url: result.url,
      checkoutId: result.id || null,
      mode: String(env.POLAR_MODE || "sandbox").toLowerCase(),
    },
    { status: 200, headers: corsHeaders }
  );
}

async function getRuntimeConfig(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const corsHeaders: HeadersInit = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
  };

  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403, headers: corsHeaders });
  }

  const supabaseUrl = String(env.SUPABASE_URL || "").trim();
  const supabaseAnonKey = String(env.SUPABASE_ANON_KEY || "").trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonResponse(
      { error: "Server misconfigured: missing SUPABASE_URL or SUPABASE_ANON_KEY" },
      { status: 500, headers: corsHeaders }
    );
  }

  return jsonResponse(
    {
      supabaseUrl,
      supabaseAnonKey,
    },
    { status: 200, headers: corsHeaders }
  );
}

async function deleteAccount(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403, headers: corsHeaders });
  }

  const supabaseUrl = String(env.SUPABASE_URL || "").trim();
  const supabaseAnonKey = String(env.SUPABASE_ANON_KEY || "").trim();
  const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse(
      { error: "Server misconfigured: missing SUPABASE_URL/SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500, headers: corsHeaders }
    );
  }

  let body: DeleteAccountRequest = {};
  try {
    body = (await request.json()) as DeleteAccountRequest;
  } catch {
    body = {};
  }
  if (!body.confirm) {
    return jsonResponse({ error: "confirm is required" }, { status: 400, headers: corsHeaders });
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return jsonResponse({ error: "Missing bearer token" }, { status: 401, headers: corsHeaders });
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      authorization: `Bearer ${token}`,
    },
  });
  if (!userRes.ok) {
    const detail = await userRes.text().catch(() => "");
    return jsonResponse({ error: "Invalid session token", detail }, { status: 401, headers: corsHeaders });
  }

  const userData = (await userRes.json().catch(() => null)) as { id?: string } | null;
  const userId = String(userData?.id || "").trim();
  if (!userId) {
    return jsonResponse({ error: "Unable to resolve user id" }, { status: 400, headers: corsHeaders });
  }

  const profileDeleteRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: "return=minimal",
    },
  });
  if (!profileDeleteRes.ok) {
    const detail = await profileDeleteRes.text().catch(() => "");
    return jsonResponse({ error: "Failed to delete user profile", detail }, { status: 502, headers: corsHeaders });
  }

  const authDeleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
    },
  });
  if (!authDeleteRes.ok) {
    const detail = await authDeleteRes.text().catch(() => "");
    return jsonResponse({ error: "Failed to delete auth user", detail }, { status: 502, headers: corsHeaders });
  }

  return jsonResponse({ success: true }, { status: 200, headers: corsHeaders });
}

async function getPaymentStatus(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!env.POLAR_OAT_TOKEN) {
    return jsonResponse({ error: "Server misconfigured: missing POLAR_OAT_TOKEN" }, { status: 500, headers: corsHeaders });
  }

  const orderId = url.searchParams.get("order_id") || url.searchParams.get("orderId");
  const checkoutId = url.searchParams.get("checkout_id") || url.searchParams.get("checkoutId");
  if (!orderId && !checkoutId) {
    return jsonResponse({ error: "order_id or checkout_id is required" }, { status: 400, headers: corsHeaders });
  }

  const targetPath = orderId
    ? `/orders/${encodeURIComponent(orderId)}`
    : `/checkouts/${encodeURIComponent(String(checkoutId))}`;
  const polar = await polarApiRequest(env, targetPath);
  if (!polar.ok) {
    return jsonResponse(
      {
        error: orderId ? "Failed to fetch order status" : "Failed to fetch checkout status",
        status: polar.status,
        detail: polar.data,
      },
      { status: 502, headers: corsHeaders }
    );
  }

  return jsonResponse(orderId ? { order: polar.data } : { checkout: polar.data }, { status: 200, headers: corsHeaders });
}

function extractCheckoutOrderId(checkoutData: unknown): string {
  if (!checkoutData || typeof checkoutData !== "object") return "";
  const record = checkoutData as Record<string, unknown>;
  if (typeof record.order_id === "string") return record.order_id;
  if (typeof record.order === "string") return record.order;
  if (record.order && typeof record.order === "object") {
    const orderRecord = record.order as Record<string, unknown>;
    if (typeof orderRecord.id === "string") return orderRecord.id;
  }
  return "";
}

function buildOrderFallbackFromCheckout(checkoutData: unknown, checkoutId: string): PolarOrder | null {
  if (!checkoutData || typeof checkoutData !== "object") return null;
  const record = checkoutData as Record<string, unknown>;
  const products = Array.isArray(record.products) ? (record.products as Array<unknown>) : [];
  const items = products
    .map((item) => {
      if (typeof item === "string") {
        return { product_id: item };
      }
      if (item && typeof item === "object") {
        const productRecord = item as Record<string, unknown>;
        const productId =
          (typeof productRecord.product_id === "string" && productRecord.product_id) ||
          (typeof productRecord.id === "string" && productRecord.id) ||
          (productRecord.product &&
          typeof productRecord.product === "object" &&
          typeof (productRecord.product as Record<string, unknown>).id === "string"
            ? ((productRecord.product as Record<string, unknown>).id as string)
            : "");
        if (productId) {
          return { product_id: productId };
        }
      }
      return null;
    })
    .filter(Boolean) as Array<{ product_id?: string }>;

  return {
    id: checkoutId || (typeof record.id === "string" ? record.id : ""),
    status: typeof record.status === "string" ? record.status : "succeeded",
    customer_email:
      (typeof record.customer_email === "string" && record.customer_email) ||
      (record.customer &&
      typeof record.customer === "object" &&
      typeof (record.customer as Record<string, unknown>).email === "string"
        ? ((record.customer as Record<string, unknown>).email as string)
        : "") ||
      null,
    metadata: (record.metadata && typeof record.metadata === "object"
      ? (record.metadata as Record<string, unknown>)
      : {}) as Record<string, unknown>,
    items,
  };
}

async function resolveOrderForResend(body: ResendReportRequest, env: Env): Promise<{ order?: PolarOrder; reason?: string }> {
  const rawOrderId = String(body.orderId || body.order_id || "").trim();
  const rawCheckoutId = String(body.checkoutId || body.checkout_id || "").trim();
  let orderId = rawOrderId;

  if (!orderId && rawCheckoutId) {
    const checkout = await polarApiRequest(env, `/checkouts/${encodeURIComponent(rawCheckoutId)}`);
    if (!checkout.ok) {
      return { reason: "checkout_lookup_failed" };
    }
    orderId = extractCheckoutOrderId(checkout.data);
    if (!orderId) {
      const fallbackOrder = buildOrderFallbackFromCheckout(checkout.data, rawCheckoutId);
      if (!fallbackOrder) {
        return { reason: "order_id_not_found_from_checkout" };
      }
      return { order: fallbackOrder };
    }
  }

  if (!orderId) {
    return { reason: "missing_order_or_checkout_id" };
  }

  const orderResponse = await polarApiRequest(env, `/orders/${encodeURIComponent(orderId)}`);
  if (!orderResponse.ok) {
    return { reason: "order_lookup_failed" };
  }

  return { order: (orderResponse.data || {}) as PolarOrder };
}

async function resendPremiumReport(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!env.POLAR_OAT_TOKEN) {
    return jsonResponse({ error: "Server misconfigured: missing POLAR_OAT_TOKEN" }, { status: 500, headers: corsHeaders });
  }

  let body: ResendReportRequest = {};
  try {
    body = (await request.json()) as ResendReportRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const resolved = await resolveOrderForResend(body, env);
  if (!resolved.order) {
    return jsonResponse(
      {
        queued: false,
        reason: resolved.reason || "order_not_found",
      },
      { status: 200, headers: corsHeaders }
    );
  }

  const queued = queuePremiumReportEmail(ctx, resolved.order, env);
  return jsonResponse(
    {
      queued: queued.queued,
      reason: queued.reason || null,
      orderId: resolved.order.id || null,
      customerEmail: normalizeEmail(resolved.order.customer_email || ""),
    },
    { status: 200, headers: corsHeaders }
  );
}

async function getPremiumReportPreview(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonResponse({ error: "Origin not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403, headers: corsHeaders });
  }
  if (!env.POLAR_OAT_TOKEN) {
    return jsonResponse({ error: "Server misconfigured: missing POLAR_OAT_TOKEN" }, { status: 500, headers: corsHeaders });
  }

  let body: PremiumReportPreviewRequest = {};
  try {
    body = (await request.json()) as PremiumReportPreviewRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const resolved = await resolveOrderForResend(body, env);
  if (!resolved.order) {
    return jsonResponse(
      {
        ok: false,
        reason: resolved.reason || "order_not_found",
      },
      { status: 200, headers: corsHeaders }
    );
  }

  const order = resolved.order;
  const status = String(order.status || "").toLowerCase();
  if (status !== "paid" && status !== "confirmed" && status !== "succeeded") {
    return jsonResponse(
      {
        ok: false,
        reason: "order_not_paid",
        orderId: order.id || null,
        orderStatus: order.status || null,
      },
      { status: 200, headers: corsHeaders }
    );
  }

  let premiumReport: { content: string; model: string };
  try {
    premiumReport = await generatePremiumReport(order, env);
  } catch (error) {
    console.error("premium_report_preview_generate_failed", {
      message: error instanceof Error ? error.message : String(error),
      orderId: order.id || null,
    });
    premiumReport = { content: buildFallbackPremiumReport(order), model: "fallback:preview_generation_failed" };
  }

  return jsonResponse(
    {
      ok: true,
      orderId: order.id || null,
      customerEmail: normalizeEmail(order.customer_email || ""),
      model: premiumReport.model,
      report: premiumReport.content,
    },
    { status: 200, headers: corsHeaders }
  );
}

async function handlePolarWebhook(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  if (!isHostAllowed(url.hostname, env)) {
    return jsonResponse({ error: "Host not allowed" }, { status: 403 });
  }

  if (!env.POLAR_WEBHOOK_SECRET) {
    return jsonResponse({ error: "Server misconfigured: missing POLAR_WEBHOOK_SECRET" }, { status: 500 });
  }
  if (!env.POLAR_OAT_TOKEN) {
    return jsonResponse({ error: "Server misconfigured: missing POLAR_OAT_TOKEN" }, { status: 500 });
  }

  const body = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") || "",
    "webhook-signature": request.headers.get("webhook-signature") || "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
  };

  let payload: WebhookPayload;
  try {
    const base64Secret = btoa(env.POLAR_WEBHOOK_SECRET.trim());
    const wh = new Webhook(base64Secret);
    payload = wh.verify(body, headers) as WebhookPayload;
  } catch (error) {
    return jsonResponse(
      {
        error: "Invalid signature",
        message: error instanceof Error ? error.message : "webhook verification failed",
      },
      { status: 403 }
    );
  }

  const eventType = String(payload.type || "");
  if (eventType !== "order.paid") {
    return jsonResponse({ received: true, handled: false, type: eventType }, { status: 200 });
  }

  const order = (payload.data || {}) as unknown as PolarOrder;
  const baseReport: Omit<WebhookReport, "autoRefunded"> = {
    eventType,
    mode: String(env.POLAR_MODE || "sandbox").toLowerCase(),
    orderId: order.id || null,
    customerEmail: order.customer_email || null,
  };
  const decision = shouldAutoRefund(order, env);
  if (!decision.apply) {
    const premiumReport = queuePremiumReportEmail(ctx, order, env);
    return jsonResponse(
      {
        received: true,
        handled: true,
        autoRefunded: false,
        reason: "rule_not_matched",
        premiumReportQueued: premiumReport.queued,
        premiumReportReason: premiumReport.reason || null,
      },
      { status: 200 }
    );
  }

  if (!order.id) {
    const report = queueWebhookReportEmail(
      ctx,
      {
        ...baseReport,
        autoRefunded: false,
        reason: "missing_order_id",
      },
      order.customer_email,
      env
    );
    return jsonResponse(
      {
        received: true,
        handled: true,
        autoRefunded: false,
        reason: "missing_order_id",
        reportEmailQueued: report.queued,
        reportEmailReason: report.reason || null,
      },
      { status: 200 }
    );
  }

  const refundPayload = {
    order_id: order.id,
  };

  const refundResult = await polarApiRequest(env, "/refunds/", {
    method: "POST",
    body: JSON.stringify(refundPayload),
  });

  if (!refundResult.ok) {
    const report = queueWebhookReportEmail(
      ctx,
      {
        ...baseReport,
        autoRefunded: false,
        reason: decision.reason || "refund_api_failed",
        refundStatus: refundResult.status,
        detail: refundResult.data,
      },
      order.customer_email,
      env
    );
    return jsonResponse(
      {
        received: true,
        handled: true,
        autoRefunded: false,
        reason: decision.reason || "refund_api_failed",
        refundStatus: refundResult.status,
        detail: refundResult.data,
        reportEmailQueued: report.queued,
        reportEmailReason: report.reason || null,
      },
      { status: 200 }
    );
  }

  const report = queueWebhookReportEmail(
    ctx,
    {
      ...baseReport,
      autoRefunded: true,
      reason: decision.reason || "auto_refund_rule",
      refund: refundResult.data,
    },
    order.customer_email,
    env
  );
  return jsonResponse(
    {
      received: true,
      handled: true,
      autoRefunded: true,
      reason: decision.reason || "auto_refund_rule",
      refund: refundResult.data,
      reportEmailQueued: report.queued,
      reportEmailReason: report.reason || null,
    },
    { status: 200 }
  );
}

export default {
  async fetch(request: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const corsHeaders = resolveCorsHeaders(origin, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse(
        {
          ok: true,
          service: "ninanoo-polar-checkout-worker",
          mode: String(env.POLAR_MODE || "sandbox").toLowerCase(),
        },
        { status: 200, headers: corsHeaders }
      );
    }

    if (request.method === "GET" && (url.pathname === "/runtime-config" || url.pathname === "/api/runtime-config")) {
      return getRuntimeConfig(request, env);
    }

    if (request.method === "POST" && (url.pathname === "/create-checkout" || url.pathname === "/api/create-checkout")) {
      return createCheckout(request, env);
    }

    if (request.method === "GET" && (url.pathname === "/payment-status" || url.pathname === "/api/payment-status")) {
      return getPaymentStatus(request, env);
    }

    if (request.method === "POST" && (url.pathname === "/resend-report" || url.pathname === "/api/resend-report")) {
      return resendPremiumReport(request, env, ctx);
    }

    if (request.method === "POST" && (url.pathname === "/delete-account" || url.pathname === "/api/delete-account")) {
      return deleteAccount(request, env);
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/premium-report-preview" || url.pathname === "/api/premium-report-preview")
    ) {
      return getPremiumReportPreview(request, env);
    }

    if (request.method === "POST" && (url.pathname === "/webhooks/polar" || url.pathname === "/api/webhooks/polar")) {
      return handlePolarWebhook(request, env, ctx);
    }

    return jsonResponse({ error: "Not found" }, { status: 404, headers: corsHeaders });
  },
};
