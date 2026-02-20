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
  FOOD_IMAGE_ENABLED?: string;
  FOOD_IMAGE_MODEL?: string;
  FOOD_IMAGE_MAX_MB?: string;
  FOOD_IMAGE_RATE_LIMIT_PER_MIN?: string;
  FOOD_IMAGE_FREE_MAX_PIXELS?: string;
  FOOD_IMAGE_PREMIUM_PRODUCT_IDS?: string;
  STYLER_ENABLED?: string;
  STYLER_MODEL?: string;
  STYLER_IMAGE_MODEL?: string;
  STYLER_MAX_MB?: string;
  STYLER_RATE_LIMIT_PER_MIN?: string;
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
type FoodEnhanceTier = "free" | "pro";
type FoodEnhancePreset = "bright" | "moody" | "detail" | "sns";
type FoodEnhanceRequest = ResendReportRequest & {
  imageBase64?: string;
  mimeType?: string;
  fileName?: string;
  preset?: FoodEnhancePreset;
  tier?: FoodEnhanceTier;
  saveOptIn?: boolean;
};
type StylerPreset = "business" | "casual" | "street" | "minimal";
type StylerRequest = {
  imageBase64?: string;
  mimeType?: string;
  fileName?: string;
  preset?: StylerPreset;
  context?: string;
};
type OutfitCard = {
  title: string;
  items: string;
  tip: string;
};

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
const OPENAI_IMAGE_EDITS_API = "https://api.openai.com/v1/images/edits";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_FOOD_IMAGE_MODEL = "gpt-image-1";
const DEFAULT_STYLER_TEXT_MODEL = "gpt-4.1-mini";
const DEFAULT_STYLER_IMAGE_MODEL = "gpt-image-1";
const MAX_FOOD_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_STYLER_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const DEFAULT_FOOD_IMAGE_RATE_LIMIT_PER_MIN = 10;
const DEFAULT_STYLER_RATE_LIMIT_PER_MIN = 8;
const DEFAULT_FOOD_IMAGE_FREE_MAX_PIXELS = 1024;
const FOOD_IMAGE_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const STYLER_ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const FOOD_IMAGE_PRESET_PROMPTS: Record<FoodEnhancePreset, string> = {
  bright:
    "Enhance this food photo to look bright, fresh, and appetizing. Improve lighting, white balance, and color vividness while keeping ingredients realistic.",
  moody:
    "Enhance this food photo with a dark moody restaurant style. Keep shadows cinematic and texture rich, but preserve natural food color.",
  detail:
    "Enhance this food photo for maximum clarity and detail. Improve sharpness and texture of ingredients without overprocessing.",
  sns:
    "Enhance this food photo for social media. Stylish tone, balanced contrast, clean highlights, and appetizing colors while preserving realism.",
};
const foodImageRateLimitStore = new Map<string, { count: number; resetAt: number }>();
const stylerRateLimitStore = new Map<string, { count: number; resetAt: number }>();

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

function isJwtLikeToken(value: string): boolean {
  const token = String(value || "").trim();
  if (!token) return false;
  return token.split(".").length === 3;
}

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildApiErrorBody(code: string, message: string, status: number, details?: unknown): Record<string, unknown> {
  return {
    ok: false,
    error: {
      code,
      message,
      status,
      details: details ?? null,
    },
  };
}

function jsonApiError(
  code: string,
  message: string,
  status: number,
  headers?: HeadersInit,
  details?: unknown
): Response {
  return jsonResponse(buildApiErrorBody(code, message, status, details), { status, headers });
}

function normalizeFoodPreset(value: unknown): FoodEnhancePreset {
  const preset = String(value || "").trim().toLowerCase();
  if (preset === "moody") return "moody";
  if (preset === "detail") return "detail";
  if (preset === "sns") return "sns";
  return "bright";
}

function normalizeFoodTier(value: unknown): FoodEnhanceTier {
  return String(value || "").trim().toLowerCase() === "pro" ? "pro" : "free";
}

function cleanBase64Payload(input: unknown): string {
  const raw = String(input || "").trim();
  if (!raw) return "";
  const dataUrlMatch = raw.match(/^data:([a-zA-Z0-9/+.-]+);base64,(.+)$/);
  return dataUrlMatch ? dataUrlMatch[2].trim() : raw;
}

function decodeBase64ToBytes(input: string): Uint8Array {
  const normalized = String(input || "").replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getFoodImageRateLimit(env: Env): number {
  const raw = Number.parseInt(String(env.FOOD_IMAGE_RATE_LIMIT_PER_MIN || DEFAULT_FOOD_IMAGE_RATE_LIMIT_PER_MIN), 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_FOOD_IMAGE_RATE_LIMIT_PER_MIN;
  return raw;
}

function getFoodImageMaxBytes(env: Env): number {
  const rawMb = Number.parseInt(String(env.FOOD_IMAGE_MAX_MB || ""), 10);
  if (!Number.isFinite(rawMb) || rawMb <= 0) return MAX_FOOD_IMAGE_SIZE_BYTES;
  return rawMb * 1024 * 1024;
}

function getFoodImageFreeMaxPixels(env: Env): number {
  const raw = Number.parseInt(String(env.FOOD_IMAGE_FREE_MAX_PIXELS || DEFAULT_FOOD_IMAGE_FREE_MAX_PIXELS), 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_FOOD_IMAGE_FREE_MAX_PIXELS;
  return raw;
}

function consumeFoodImageRateLimit(
  request: Request,
  env: Env
): { ok: boolean; limit: number; remaining: number; resetSec: number } {
  const now = Date.now();
  const minuteMs = 60_000;
  const limit = getFoodImageRateLimit(env);
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "anonymous";
  const key = `${ip}:food-image`;
  const current = foodImageRateLimitStore.get(key);
  if (!current || now >= current.resetAt) {
    const entry = { count: 1, resetAt: now + minuteMs };
    foodImageRateLimitStore.set(key, entry);
    return { ok: true, limit, remaining: Math.max(0, limit - 1), resetSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  if (current.count >= limit) {
    return { ok: false, limit, remaining: 0, resetSec: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  foodImageRateLimitStore.set(key, current);
  return { ok: true, limit, remaining: Math.max(0, limit - current.count), resetSec: Math.ceil((current.resetAt - now) / 1000) };
}

function getPremiumFoodImageProductIds(env: Env): string[] {
  return splitCsv(env.FOOD_IMAGE_PREMIUM_PRODUCT_IDS || env.PREMIUM_REPORT_PRODUCT_IDS || env.DEFAULT_PRODUCT_ID || DEFAULT_PRODUCT_ID);
}

async function resolveFoodImageTier(
  body: FoodEnhanceRequest,
  env: Env
): Promise<{ tier: FoodEnhanceTier; orderId: string; checkoutId: string; reason?: string }> {
  const requestedTier = normalizeFoodTier(body.tier);
  const orderId = String(body.orderId || body.order_id || "").trim();
  const checkoutId = String(body.checkoutId || body.checkout_id || "").trim();
  if (requestedTier !== "pro") {
    return { tier: "free", orderId, checkoutId };
  }
  if (!env.POLAR_OAT_TOKEN) {
    return { tier: "free", orderId, checkoutId, reason: "missing_polar_token" };
  }
  const resolved = await resolveOrderForResend(body, env);
  if (!resolved.order) {
    return { tier: "free", orderId, checkoutId, reason: resolved.reason || "order_not_found" };
  }
  const status = String(resolved.order.status || "").toLowerCase();
  if (status !== "paid" && status !== "confirmed" && status !== "succeeded") {
    return { tier: "free", orderId: String(resolved.order.id || orderId), checkoutId, reason: "order_not_paid" };
  }
  const allowedProducts = getPremiumFoodImageProductIds(env);
  const purchased = extractOrderProductIds(resolved.order);
  if (allowedProducts.length > 0 && !purchased.some((id) => allowedProducts.includes(id))) {
    return { tier: "free", orderId: String(resolved.order.id || orderId), checkoutId, reason: "product_not_eligible" };
  }
  return { tier: "pro", orderId: String(resolved.order.id || orderId), checkoutId };
}

async function requestFoodImageEnhanceToOpenAI(params: {
  env: Env;
  bytes: Uint8Array;
  mimeType: string;
  fileName: string;
  preset: FoodEnhancePreset;
  tier: FoodEnhanceTier;
}): Promise<{ imageBase64: string; model: string }> {
  const apiKey = String(params.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("openai_key_missing");
  }
  const model = String(params.env.FOOD_IMAGE_MODEL || DEFAULT_FOOD_IMAGE_MODEL).trim() || DEFAULT_FOOD_IMAGE_MODEL;
  const imageBytes = new Uint8Array(params.bytes.byteLength);
  imageBytes.set(params.bytes);
  const imageBlob = new Blob([imageBytes], { type: params.mimeType });
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", FOOD_IMAGE_PRESET_PROMPTS[params.preset]);
  form.append("size", params.tier === "pro" ? "1536x1536" : "1024x1024");
  form.append("quality", params.tier === "pro" ? "high" : "medium");
  form.append("response_format", "b64_json");
  form.append("image", imageBlob, params.fileName || "food-upload.png");

  const response = await fetch(OPENAI_IMAGE_EDITS_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const data = (await response.json().catch(() => null)) as { data?: Array<{ b64_json?: string }>; error?: { message?: string } } | null;
  if (!response.ok) {
    const detail = data?.error?.message || `openai_image_edit_failed status=${response.status}`;
    throw new Error(detail);
  }
  const imageBase64 = String(data?.data?.[0]?.b64_json || "").trim();
  if (!imageBase64) {
    throw new Error("openai_image_edit_empty_output");
  }
  return { imageBase64, model };
}

async function handleFoodImageEnhance(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonApiError("forbidden_origin", "Origin not allowed", 403, corsHeaders);
  }
  if (!isHostAllowed(url.hostname, env)) {
    return jsonApiError("forbidden_host", "Host not allowed", 403, corsHeaders);
  }
  if (!isTruthy(env.FOOD_IMAGE_ENABLED || "true")) {
    return jsonApiError("feature_disabled", "Food image enhance is disabled", 503, corsHeaders);
  }

  const limiter = consumeFoodImageRateLimit(request, env);
  if (!limiter.ok) {
    return jsonApiError(
      "rate_limited",
      "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
      429,
      {
        ...corsHeaders,
        "retry-after": String(limiter.resetSec),
      },
      { limit: limiter.limit, remaining: limiter.remaining, resetSec: limiter.resetSec }
    );
  }

  let body: FoodEnhanceRequest = {};
  try {
    body = (await request.json()) as FoodEnhanceRequest;
  } catch {
    return jsonApiError("invalid_json", "Invalid JSON body", 400, corsHeaders);
  }

  const preset = normalizeFoodPreset(body.preset);
  const mimeType = String(body.mimeType || "").trim().toLowerCase();
  if (!FOOD_IMAGE_ALLOWED_MIME_TYPES.includes(mimeType)) {
    return jsonApiError(
      "unsupported_mime_type",
      "지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 업로드할 수 있습니다.",
      415,
      corsHeaders,
      { allowed: FOOD_IMAGE_ALLOWED_MIME_TYPES }
    );
  }

  const imageBase64Payload = cleanBase64Payload(body.imageBase64);
  if (!imageBase64Payload) {
    return jsonApiError("missing_image", "imageBase64 is required", 400, corsHeaders);
  }

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64ToBytes(imageBase64Payload);
  } catch {
    return jsonApiError("invalid_base64", "이미지 인코딩 형식을 확인해 주세요.", 400, corsHeaders);
  }

  const maxBytes = getFoodImageMaxBytes(env);
  if (bytes.byteLength > maxBytes) {
    return jsonApiError(
      "file_too_large",
      `파일 크기 제한을 초과했습니다. 최대 ${Math.floor(maxBytes / (1024 * 1024))}MB까지 지원합니다.`,
      413,
      corsHeaders,
      { maxBytes, receivedBytes: bytes.byteLength }
    );
  }

  const tierInfo = await resolveFoodImageTier(body, env);
  const tier = tierInfo.tier;

  let result: { imageBase64: string; model: string };
  try {
    result = await requestFoodImageEnhanceToOpenAI({
      env,
      bytes,
      mimeType,
      fileName: String(body.fileName || "food-upload"),
      preset,
      tier,
    });
  } catch (error) {
    console.error("food_image_enhance_failed", {
      message: error instanceof Error ? error.message : String(error),
      preset,
      tier,
      size: bytes.byteLength,
    });
    return jsonApiError(
      "enhance_failed",
      "이미지 보정에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      502,
      corsHeaders,
      { reason: error instanceof Error ? error.message : String(error) }
    );
  }

  return jsonResponse(
    {
      ok: true,
      tier,
      tierReason: tierInfo.reason || null,
      orderId: tierInfo.orderId || null,
      checkoutId: tierInfo.checkoutId || null,
      preset,
      model: result.model,
      mimeType: "image/png",
      imageBase64: result.imageBase64,
      watermarkRequired: tier !== "pro",
      maxRenderPixels: tier === "pro" ? null : getFoodImageFreeMaxPixels(env),
      stored: false,
      rateLimit: {
        limit: limiter.limit,
        remaining: limiter.remaining,
        resetSec: limiter.resetSec,
      },
      error: null,
    },
    { status: 200, headers: corsHeaders }
  );
}

function normalizeStylerPreset(value: unknown): StylerPreset {
  const preset = String(value || "").trim().toLowerCase();
  if (preset === "casual") return "casual";
  if (preset === "street") return "street";
  if (preset === "minimal") return "minimal";
  return "business";
}

function getStylerRateLimit(env: Env): number {
  const raw = Number.parseInt(String(env.STYLER_RATE_LIMIT_PER_MIN || DEFAULT_STYLER_RATE_LIMIT_PER_MIN), 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_STYLER_RATE_LIMIT_PER_MIN;
  return raw;
}

function getStylerMaxBytes(env: Env): number {
  const rawMb = Number.parseInt(String(env.STYLER_MAX_MB || ""), 10);
  if (!Number.isFinite(rawMb) || rawMb <= 0) return MAX_STYLER_IMAGE_SIZE_BYTES;
  return rawMb * 1024 * 1024;
}

function consumeStylerRateLimit(
  request: Request,
  env: Env
): { ok: boolean; limit: number; remaining: number; resetSec: number } {
  const now = Date.now();
  const minuteMs = 60_000;
  const limit = getStylerRateLimit(env);
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "anonymous";
  const key = `${ip}:styler`;
  const current = stylerRateLimitStore.get(key);
  if (!current || now >= current.resetAt) {
    const entry = { count: 1, resetAt: now + minuteMs };
    stylerRateLimitStore.set(key, entry);
    return { ok: true, limit, remaining: Math.max(0, limit - 1), resetSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  if (current.count >= limit) {
    return { ok: false, limit, remaining: 0, resetSec: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  stylerRateLimitStore.set(key, current);
  return { ok: true, limit, remaining: Math.max(0, limit - current.count), resetSec: Math.ceil((current.resetAt - now) / 1000) };
}

function sanitizeStylerContext(value: unknown): string {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240);
}

function hasSexualContextHint(value: string): boolean {
  return /(sexy|sexual|erotic|fetish|lingerie|19금|노출|성적|야한)/i.test(String(value || ""));
}

function hasMinorHint(value: string): boolean {
  return /(미성년|고등학생|중학생|초등학생|teen|teenager|under\s?18|minor)/i.test(String(value || ""));
}

function getStylerPresetPrompt(preset: StylerPreset): string {
  if (preset === "casual") {
    return "Natural casual profile style: clean light, balanced skin tone, relaxed but polished mood.";
  }
  if (preset === "street") {
    return "Street style profile look: modern contrast, urban color accents, confident but non-aggressive vibe.";
  }
  if (preset === "minimal") {
    return "Minimal profile style: neutral tones, tidy composition, subtle contrast and clean background feel.";
  }
  return "Business profile style: professional, clear, trustworthy color tone and clean portrait finish.";
}

function getStylerFallbackCards(preset: StylerPreset): OutfitCard[] {
  const common = [
    { title: "코디 1", items: "상의 1 + 하의 1 + 신발 1", tip: "톤은 2가지 이내로 제한해 통일감을 만드세요." },
    { title: "코디 2", items: "가벼운 아우터 + 기본 이너 + 단색 팬츠", tip: "사진에선 로고보다 실루엣이 더 잘 보입니다." },
    { title: "코디 3", items: "질감이 다른 소재 2개 조합", tip: "매트/광택 소재를 섞으면 입체감이 좋아집니다." },
    { title: "코디 4", items: "포인트 컬러 1개 + 나머지 뉴트럴", tip: "포인트 컬러는 가방/신발 같은 작은 면적에 두세요." },
    { title: "코디 5", items: "기본 액세서리 1~2개", tip: "액세서리는 과하지 않게 한 포인트만 추천합니다." },
  ];
  if (preset === "business") {
    common[0] = { title: "비즈니스 1", items: "셔츠/블라우스 + 슬랙스 + 로퍼", tip: "명도 대비를 주면 얼굴이 또렷해집니다." };
  } else if (preset === "street") {
    common[0] = { title: "스트릿 1", items: "오버핏 상의 + 와이드 팬츠 + 스니커즈", tip: "상하 비율은 1:1 또는 4:6이 안정적입니다." };
  } else if (preset === "minimal") {
    common[0] = { title: "미니멀 1", items: "무지 상의 + 스트레이트 팬츠 + 심플 슈즈", tip: "패턴을 줄이고 질감으로 차이를 만드세요." };
  } else {
    common[0] = { title: "캐주얼 1", items: "니트/스웨트 + 데님/치노 + 스니커즈", tip: "채도 낮은 색으로 부담 없는 인상을 만드세요." };
  }
  return common;
}

function parseOutfitCardsFromText(raw: string): OutfitCard[] {
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!Array.isArray(parsed)) return [];
  const cards: OutfitCard[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const title = String(record.title || "").trim();
    const items = String(record.items || "").trim();
    const tip = String(record.tip || "").trim();
    if (!title || !items || !tip) continue;
    cards.push({ title: title.slice(0, 40), items: items.slice(0, 120), tip: tip.slice(0, 120) });
    if (cards.length >= 5) break;
  }
  return cards;
}

async function requestStylerRecommendations(params: {
  env: Env;
  preset: StylerPreset;
  context: string;
}): Promise<{ cards: OutfitCard[]; model: string }> {
  const apiKey = String(params.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return { cards: getStylerFallbackCards(params.preset), model: "fallback:no_openai_key" };
  }
  const model = String(params.env.STYLER_MODEL || DEFAULT_STYLER_TEXT_MODEL).trim() || DEFAULT_STYLER_TEXT_MODEL;
  const systemPrompt = [
    "You are a safe global fashion assistant.",
    "Never evaluate body shape, attractiveness, race, or age appearance.",
    "No sexual context. No explicit content.",
    "If minor is suspected, provide only general age-appropriate neutral outfit guidance.",
    "Output Korean only.",
    "Return ONLY JSON array with exactly 5 items.",
    'Each item shape: {"title":"...","items":"...","tip":"..."}',
  ].join(" ");
  const userPrompt = [
    `스타일 프리셋: ${params.preset}`,
    `추가 컨텍스트: ${params.context || "없음"}`,
    "프로필 사진 스타일링과 함께 제안할 코디 추천 5개를 JSON 배열로 만들어줘.",
    "체형/외모 평가 문구 금지, 성적 맥락 금지.",
    "아이템은 글로벌 사용자에게 무난한 표현으로 작성.",
  ].join("\n");

  const response = await fetch(OPENAI_RESPONSES_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 600,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    return { cards: getStylerFallbackCards(params.preset), model: "fallback:styler_text_request_failed" };
  }
  const data = (await response.json().catch(() => null)) as unknown;
  const outputText = extractOpenAIOutputText(data);
  const cards = parseOutfitCardsFromText(outputText);
  if (cards.length < 5) {
    return { cards: getStylerFallbackCards(params.preset), model: "fallback:styler_text_parse_failed" };
  }
  return { cards, model };
}

async function requestStylerImageEnhance(params: {
  env: Env;
  bytes: Uint8Array;
  mimeType: string;
  fileName: string;
  preset: StylerPreset;
}): Promise<{ imageBase64: string; model: string }> {
  const apiKey = String(params.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) throw new Error("openai_key_missing");
  const model = String(params.env.STYLER_IMAGE_MODEL || DEFAULT_STYLER_IMAGE_MODEL).trim() || DEFAULT_STYLER_IMAGE_MODEL;
  const imageBytes = new Uint8Array(params.bytes.byteLength);
  imageBytes.set(params.bytes);
  const imageBlob = new Blob([imageBytes], { type: params.mimeType });
  const prompt = [
    "Edit this profile photo with a tasteful style grade.",
    getStylerPresetPrompt(params.preset),
    "Do not alter body shape, age appearance, race, or facial identity.",
    "No sexualized transformation. Keep natural realism.",
    "Portrait-friendly color and contrast only.",
  ].join(" ");

  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("size", "1024x1024");
  form.append("quality", "high");
  form.append("response_format", "b64_json");
  form.append("image", imageBlob, params.fileName || "styler-upload.png");

  const response = await fetch(OPENAI_IMAGE_EDITS_API, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const data = (await response.json().catch(() => null)) as { data?: Array<{ b64_json?: string }>; error?: { message?: string } } | null;
  if (!response.ok) {
    const detail = data?.error?.message || `openai_styler_image_failed status=${response.status}`;
    throw new Error(detail);
  }
  const imageBase64 = String(data?.data?.[0]?.b64_json || "").trim();
  if (!imageBase64) throw new Error("openai_styler_image_empty_output");
  return { imageBase64, model };
}

async function handleProfileStyler(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const corsHeaders = resolveCorsHeaders(origin, env);

  if (!isOriginAllowed(origin, env)) {
    return jsonApiError("forbidden_origin", "Origin not allowed", 403, corsHeaders);
  }
  if (!isHostAllowed(url.hostname, env)) {
    return jsonApiError("forbidden_host", "Host not allowed", 403, corsHeaders);
  }
  if (!isTruthy(env.STYLER_ENABLED || "true")) {
    return jsonApiError("feature_disabled", "Styler feature is disabled", 503, corsHeaders);
  }

  const limiter = consumeStylerRateLimit(request, env);
  if (!limiter.ok) {
    return jsonApiError(
      "rate_limited",
      "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
      429,
      { ...corsHeaders, "retry-after": String(limiter.resetSec) },
      { limit: limiter.limit, remaining: limiter.remaining, resetSec: limiter.resetSec }
    );
  }

  let body: StylerRequest = {};
  try {
    body = (await request.json()) as StylerRequest;
  } catch {
    return jsonApiError("invalid_json", "Invalid JSON body", 400, corsHeaders);
  }

  const preset = normalizeStylerPreset(body.preset);
  const context = sanitizeStylerContext(body.context);
  if (hasSexualContextHint(context)) {
    return jsonApiError(
      "policy_blocked",
      "성적 맥락 요청은 지원하지 않습니다. 프로필/코디 목적의 안전한 요청으로 다시 시도해 주세요.",
      400,
      corsHeaders
    );
  }
  if (hasMinorHint(context)) {
    return jsonResponse(
      {
        ok: true,
        advisoryOnly: true,
        advisory:
          "미성년자 의심 맥락에서는 외모 평가/성적 스타일링 없이 일반적이고 안전한 코디 가이드만 제공합니다.",
        preset,
        cards: getStylerFallbackCards(preset),
        imageBase64: null,
        imageModel: null,
        textModel: "policy:minor_safe_fallback",
        rateLimit: { limit: limiter.limit, remaining: limiter.remaining, resetSec: limiter.resetSec },
      },
      { status: 200, headers: corsHeaders }
    );
  }

  const mimeType = String(body.mimeType || "").trim().toLowerCase();
  if (!STYLER_ALLOWED_MIME_TYPES.includes(mimeType)) {
    return jsonApiError(
      "unsupported_mime_type",
      "지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 업로드할 수 있습니다.",
      415,
      corsHeaders,
      { allowed: STYLER_ALLOWED_MIME_TYPES }
    );
  }

  const payload = cleanBase64Payload(body.imageBase64);
  if (!payload) {
    return jsonApiError("missing_image", "imageBase64 is required", 400, corsHeaders);
  }

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64ToBytes(payload);
  } catch {
    return jsonApiError("invalid_base64", "이미지 인코딩 형식을 확인해 주세요.", 400, corsHeaders);
  }

  const maxBytes = getStylerMaxBytes(env);
  if (bytes.byteLength > maxBytes) {
    return jsonApiError(
      "file_too_large",
      `파일 크기 제한을 초과했습니다. 최대 ${Math.floor(maxBytes / (1024 * 1024))}MB까지 지원합니다.`,
      413,
      corsHeaders,
      { maxBytes, receivedBytes: bytes.byteLength }
    );
  }

  const [imageResult, textResult] = await Promise.all([
    requestStylerImageEnhance({
      env,
      bytes,
      mimeType,
      fileName: String(body.fileName || "styler-upload"),
      preset,
    }).catch((error) => {
      console.error("styler_image_failed", { message: error instanceof Error ? error.message : String(error) });
      return null;
    }),
    requestStylerRecommendations({ env, preset, context }),
  ]);

  if (!imageResult) {
    return jsonApiError(
      "enhance_failed",
      "프로필 사진 스타일 보정에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      502,
      corsHeaders
    );
  }

  return jsonResponse(
    {
      ok: true,
      advisoryOnly: false,
      advisory: null,
      preset,
      cards: textResult.cards,
      imageBase64: imageResult.imageBase64,
      imageMimeType: "image/png",
      imageModel: imageResult.model,
      textModel: textResult.model,
      stored: false,
      rateLimit: { limit: limiter.limit, remaining: limiter.remaining, resetSec: limiter.resetSec },
    },
    { status: 200, headers: corsHeaders }
  );
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
  if (serviceRoleKey === supabaseAnonKey || serviceRoleKey.startsWith("sb_publishable_")) {
    return jsonResponse(
      { error: "Server misconfigured: SUPABASE_SERVICE_ROLE_KEY must be a service role (secret) key, not publishable/anon key" },
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

  const adminHeaders: Record<string, string> = {
    apikey: serviceRoleKey,
    "content-type": "application/json",
  };
  // Legacy JWT service_role keys can be used as Bearer tokens.
  // New sb_secret_* keys are provided via apikey and must not be parsed as JWT.
  if (isJwtLikeToken(serviceRoleKey)) {
    adminHeaders.authorization = `Bearer ${serviceRoleKey}`;
  }

  const authDeleteRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  if (!authDeleteRes.ok) {
    const detail = await authDeleteRes.text().catch(() => "");
    return jsonResponse({ error: "Failed to delete auth user", detail }, { status: 502, headers: corsHeaders });
  }

  // user_profiles has FK (id -> auth.users.id) with ON DELETE CASCADE.
  // Best-effort cleanup for non-cascading edge cases only.
  const profileDeleteHeaders: Record<string, string> = {
    apikey: serviceRoleKey,
    prefer: "return=minimal",
  };
  if (isJwtLikeToken(serviceRoleKey)) {
    profileDeleteHeaders.authorization = `Bearer ${serviceRoleKey}`;
  }

  await fetch(`${supabaseUrl}/rest/v1/user_profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: profileDeleteHeaders,
  }).catch(() => null);

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

    if (
      request.method === "POST" &&
      (url.pathname === "/image/food-enhance" || url.pathname === "/api/image/food-enhance")
    ) {
      return handleFoodImageEnhance(request, env);
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/ai/styler" || url.pathname === "/api/ai/styler")
    ) {
      return handleProfileStyler(request, env);
    }

    if (request.method === "POST" && (url.pathname === "/webhooks/polar" || url.pathname === "/api/webhooks/polar")) {
      return handlePolarWebhook(request, env, ctx);
    }

    return jsonResponse({ error: "Not found" }, { status: 404, headers: corsHeaders });
  },
};
