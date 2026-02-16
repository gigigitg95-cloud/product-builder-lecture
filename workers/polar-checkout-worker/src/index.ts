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
    "access-control-allow-headers": "content-type",
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

function buildFallbackPremiumReport(order: PolarOrder): string {
  const email = normalizeEmail(order.customer_email) || "고객";
  const profile = extractPremiumProfile(order);
  return [
    "프리미엄 메뉴 리포트",
    "",
    "[요약]",
    `- 고객 이메일: ${email}`,
    `주문번호: ${order.id || "-"}`,
    `- 목표: ${profile.goal || "미입력"}`,
    `- 선호 카테고리: ${profile.preferredCategories || "미입력"}`,
    "",
    "[맞춤 추천]",
    "1) 단백질 중심 메인 + 채소 반찬 2가지 구성을 기본으로 시작하세요.",
    "2) 기피 재료/알레르기는 반드시 제외한 재료로 대체하세요.",
    "3) 선호 카테고리를 주 3회 이상 반영해 식단 지속성을 높이세요.",
    "",
    "[7일 플랜]",
    "- Day1-2: 담백한 메뉴로 시작해 식단 적응",
    "- Day3-4: 선호 카테고리 메뉴를 포함해 만족도 확보",
    "- Day5: 외식/배달 1회 허용, 양 조절 중심",
    "- Day6: 단백질/채소 비중 강화",
    "- Day7: 다음 주 식단을 위한 재료 사전 준비",
    "",
    "[주의사항]",
    "- 알레르기 정보가 있다면 해당 성분 교차오염 가능성까지 확인하세요.",
  ].join("\n");
}

function ensureStructuredPremiumReport(content: string, order: PolarOrder): string {
  const trimmed = String(content || "").trim();
  if (!trimmed) return buildFallbackPremiumReport(order);

  const requiredSections = ["[요약]", "[맞춤 추천]", "[7일 플랜]", "[주의사항]"];
  const missing = requiredSections.some((section) => !trimmed.includes(section));
  if (missing) {
    return buildFallbackPremiumReport(order);
  }
  return trimmed;
}

async function generatePremiumReport(order: PolarOrder, env: Env): Promise<{ content: string; model: string }> {
  const apiKey = String(env.OPENAI_API_KEY || "").trim();
  const model = String(env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL).trim() || DEFAULT_OPENAI_MODEL;
  const profile = extractPremiumProfile(order);
  if (!apiKey) {
    return { content: buildFallbackPremiumReport(order), model: "fallback:no_openai_key" };
  }

  const userMessage = [
    "아래 결제 주문/개인화 정보 기준으로 한국어 프리미엄 식단 리포트를 작성해줘.",
    "반드시 아래 섹션 제목을 그대로 사용해 출력:",
    "1) [요약] (3~4줄, 현재 상태 + 핵심 목표 + 오늘 바로 실행할 1개 액션 포함)",
    "2) [맞춤 추천] (5개, 각 항목에 '추천 이유:' 1줄 포함)",
    "3) [7일 플랜] (Day1~Day7 형태, 매일 1줄 식단/행동 계획 + 1줄 체크포인트)",
    "4) [주의사항] (1~2줄)",
    "출력은 과장 없는 실용적인 문장으로 작성하고, 알레르기/기피 재료를 절대 추천하지 마.",
    "가격/의학적 치료 효능/과장된 확신 표현은 금지하고, 실행 가능한 분량으로 간결하게 써.",
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

  const maxOutputTokensRaw = Number.parseInt(String(env.PREMIUM_REPORT_MAX_TOKENS || "900"), 10);
  const maxOutputTokens = Number.isFinite(maxOutputTokensRaw) && maxOutputTokensRaw > 0 ? maxOutputTokensRaw : 900;

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
          content:
            "You are a Korean nutrition and meal-planning assistant for paid customers. Keep recommendations specific, safe, and easy to execute.",
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
  const content = ensureStructuredPremiumReport(extractOpenAIOutputText(data), order);
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
      return { reason: "order_id_not_found_from_checkout" };
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

    if (request.method === "POST" && (url.pathname === "/create-checkout" || url.pathname === "/api/create-checkout")) {
      return createCheckout(request, env);
    }

    if (request.method === "GET" && (url.pathname === "/payment-status" || url.pathname === "/api/payment-status")) {
      return getPaymentStatus(request, env);
    }

    if (request.method === "POST" && (url.pathname === "/resend-report" || url.pathname === "/api/resend-report")) {
      return resendPremiumReport(request, env, ctx);
    }

    if (request.method === "POST" && (url.pathname === "/webhooks/polar" || url.pathname === "/api/webhooks/polar")) {
      return handlePolarWebhook(request, env, ctx);
    }

    return jsonResponse({ error: "Not found" }, { status: 404, headers: corsHeaders });
  },
};
