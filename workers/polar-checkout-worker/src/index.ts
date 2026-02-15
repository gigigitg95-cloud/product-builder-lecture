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
const DEFAULT_PRODUCT_ID = "45ee4c82-2396-44bd-8249-a577755cbf9e";

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

async function handlePolarWebhook(request: Request, env: Env): Promise<Response> {
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
  const decision = shouldAutoRefund(order, env);
  if (!decision.apply) {
    return jsonResponse({ received: true, handled: true, autoRefunded: false, reason: "rule_not_matched" }, { status: 200 });
  }

  if (!order.id) {
    return jsonResponse({ received: true, handled: true, autoRefunded: false, reason: "missing_order_id" }, { status: 200 });
  }

  const refundPayload = {
    order_id: order.id,
  };

  const refundResult = await polarApiRequest(env, "/refunds/", {
    method: "POST",
    body: JSON.stringify(refundPayload),
  });

  if (!refundResult.ok) {
    return jsonResponse(
      {
        received: true,
        handled: true,
        autoRefunded: false,
        reason: decision.reason || "refund_api_failed",
        refundStatus: refundResult.status,
        detail: refundResult.data,
      },
      { status: 200 }
    );
  }

  return jsonResponse(
    {
      received: true,
      handled: true,
      autoRefunded: true,
      reason: decision.reason || "auto_refund_rule",
      refund: refundResult.data,
    },
    { status: 200 }
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

    if (request.method === "POST" && (url.pathname === "/webhooks/polar" || url.pathname === "/api/webhooks/polar")) {
      return handlePolarWebhook(request, env);
    }

    return jsonResponse({ error: "Not found" }, { status: 404, headers: corsHeaders });
  },
};
