(function () {
  "use strict";

  // From polar.txt: create checkout sessions with "products" array.
  var PRODUCT_ID = "09ed8b9c-c328-4962-a12f-69923155d3c6";
  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";
  var DRAFT_STORAGE_KEY = "ninanooPremiumReportDraft";
  var FOOD_ENHANCE_DRAFT_KEY = "ninanooFoodEnhanceDraft";
  var FLOW_FOOD_ENHANCE = "food-enhance";
  var latestPaymentResult = {
    title: "",
    message: "",
    meta: ""
  };
  var latestPaymentContext = {
    orderId: "",
    checkoutId: "",
    customerEmail: "",
    status: ""
  };

  function trackAnalytics(eventName, props) {
    if (!window.NinanooAnalytics || typeof window.NinanooAnalytics.track !== "function") return;
    window.NinanooAnalytics.track(eventName, props || {});
  }

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("text-red-500", !!isError);
    el.classList.toggle("dark:text-red-400", !!isError);
    if (isError) {
      el.classList.remove("text-gray-500", "dark:text-gray-400");
    } else {
      el.classList.add("text-gray-500", "dark:text-gray-400");
    }
  }

  function resolveApiEndpoint() {
    if (typeof window.POLAR_CHECKOUT_API_URL === "string" && window.POLAR_CHECKOUT_API_URL.trim()) {
      return window.POLAR_CHECKOUT_API_URL.trim();
    }
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8787/create-checkout";
    }
    if (host.indexOf("cloudworkstations.dev") !== -1 && host.indexOf("8080-") === 0) {
      return "https://" + host.replace(/^8080-/, "8787-") + "/create-checkout";
    }
    return DEFAULT_API_ENDPOINT;
  }

  function sanitizeField(value, maxLen) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLen);
  }

  function loadPremiumReportDraft() {
    try {
      var raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function loadFoodEnhanceDraft() {
    try {
      var raw = window.sessionStorage.getItem(FOOD_ENHANCE_DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function getFlowType() {
    try {
      var search = new URLSearchParams(window.location.search);
      return String(search.get("from") || "").trim().toLowerCase();
    } catch (error) {
      return "";
    }
  }

  function resolvePremiumReportMetadata(flowType) {
    if (flowType === FLOW_FOOD_ENHANCE) {
      var enhanceDraft = loadFoodEnhanceDraft() || {};
      var foodPreset = sanitizeField(enhanceDraft.preset, 20) || "bright";
      return {
        report_goal: "AI 음식 사진 보정 Pro",
        report_note: "source=food-enhance preset=" + foodPreset,
        feature_type: "food_image_enhance",
        food_image_preset: foodPreset
      };
    }
    var draft = loadPremiumReportDraft();
    var metadata = {
      report_goal: sanitizeField(draft && draft.report_goal, 100),
      report_period_weeks: sanitizeField(draft && draft.report_period_weeks, 10),
      report_height_cm: sanitizeField(draft && draft.report_height_cm, 10),
      report_weight_kg: sanitizeField(draft && draft.report_weight_kg, 10),
      report_activity_level: sanitizeField(draft && draft.report_activity_level, 20),
      report_weekly_workouts: sanitizeField(draft && draft.report_weekly_workouts, 10),
      report_daily_steps: sanitizeField(draft && draft.report_daily_steps, 10),
      report_allergies: sanitizeField(draft && draft.report_allergies, 120),
      report_avoid_ingredients: sanitizeField(draft && draft.report_avoid_ingredients, 120),
      report_dietary_restrictions: sanitizeField(draft && draft.report_dietary_restrictions, 120),
      report_preferred_categories: sanitizeField(draft && draft.report_preferred_categories, 120),
      report_budget_level: sanitizeField(draft && draft.report_budget_level, 30),
      report_cooking_environment: sanitizeField(draft && draft.report_cooking_environment, 40),
      report_note: sanitizeField(draft && draft.report_note, 300)
    };

    Object.keys(metadata).forEach(function (key) {
      if (!metadata[key]) delete metadata[key];
    });

    return metadata;
  }

  function renderPremiumReportSummary(metadata, flowType) {
    var summary = document.getElementById("premium-report-summary");
    if (!summary) return;
    if (flowType === FLOW_FOOD_ENHANCE) {
      summary.innerHTML =
        "<p><span class=\"font-semibold text-slate-900 dark:text-white\">결제 대상:</span> 음식 사진 보정 Pro</p>" +
        "<p><span class=\"font-semibold text-slate-900 dark:text-white\">혜택:</span> 고해상도 보정 + 워터마크 제거</p>" +
        "<p><span class=\"font-semibold text-slate-900 dark:text-white\">연결:</span> 결제 완료 시 음식 사진 보정 페이지로 자동 복귀</p>" +
        "<p class=\"text-xs text-slate-500 dark:text-slate-400 mt-1\">결제 후 checkout_id가 자동 전달되어 Pro 검증에 사용됩니다.</p>";
      return;
    }
    var goal = metadata.report_goal || "";
    if (!goal) {
      summary.innerHTML =
        "<p class=\"text-rose-600 dark:text-rose-300 font-semibold\">입력된 리포트 정보가 없습니다.</p>" +
        "<p class=\"text-slate-600 dark:text-slate-300\">먼저 정보 입력 페이지에서 내용을 작성해 주세요.</p>";
      return;
    }

    var items = [
      ["목표", metadata.report_goal],
      ["목표 기간(주)", metadata.report_period_weeks || "미입력"],
      ["키/체중", (metadata.report_height_cm || "미입력") + "cm / " + (metadata.report_weight_kg || "미입력") + "kg"],
      ["활동량", metadata.report_activity_level || "미입력"],
      ["주당 운동/걸음 수", (metadata.report_weekly_workouts || "미입력") + "회 / " + (metadata.report_daily_steps || "미입력") + "보"],
      ["알레르기", metadata.report_allergies || "없음/미입력"],
      ["기피 재료", metadata.report_avoid_ingredients || "없음/미입력"],
      ["식이 제한", metadata.report_dietary_restrictions || "미입력"],
      ["선호 카테고리", metadata.report_preferred_categories || "미입력"],
      ["예산/조리환경", (metadata.report_budget_level || "미입력") + " / " + (metadata.report_cooking_environment || "미입력")],
      ["추가 요청", metadata.report_note || "없음"]
    ];

    summary.innerHTML = items
      .map(function (item) {
        return (
          "<p><span class=\"font-semibold text-slate-900 dark:text-white\">" +
          item[0] +
          ":</span> " +
          item[1] +
          "</p>"
        );
      })
      .join("");
  }

  async function requestCheckoutUrl(apiEndpoint, metadata, flowType) {
    var currentUrl = window.location.origin + window.location.pathname;
    var successUrl = window.location.origin + "/pages/report-result.html?payment=success&checkout_id={CHECKOUT_ID}";
    var returnUrl = currentUrl + "?payment=return";
    if (flowType === FLOW_FOOD_ENHANCE) {
      successUrl = window.location.origin + "/pages/food-enhance.html?payment=success&checkout_id={CHECKOUT_ID}";
      returnUrl = window.location.origin + "/pages/food-enhance.html?payment=return";
    }
    var response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: PRODUCT_ID,
        successUrl: successUrl,
        returnUrl: returnUrl,
        metadata: metadata
      })
    });

    var data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      var detail = data && (data.error || data.message || data.detail);
      throw new Error(detail || ("Checkout API request failed (" + response.status + ")"));
    }

    if (!data || typeof data.url !== "string" || !data.url) {
      throw new Error("Checkout URL not returned.");
    }

    return data.url;
  }

  function resolveStatusApiEndpoint() {
    var checkoutApi = resolveApiEndpoint();
    return checkoutApi.replace(/\/create-checkout$/, "/payment-status");
  }

  function resolveResendApiEndpoint() {
    var checkoutApi = resolveApiEndpoint();
    return checkoutApi.replace(/\/create-checkout$/, "/resend-report");
  }

  function resolveReportPreviewApiEndpoint() {
    var checkoutApi = resolveApiEndpoint();
    return checkoutApi.replace(/\/create-checkout$/, "/premium-report-preview");
  }

  async function requestPaymentStatus(params) {
    var statusEndpoint = resolveStatusApiEndpoint();
    var url = new URL(statusEndpoint);
    if (params.orderId) {
      url.searchParams.set("order_id", params.orderId);
    } else if (params.checkoutId) {
      url.searchParams.set("checkout_id", params.checkoutId);
    } else {
      throw new Error("No order_id or checkout_id");
    }

    var response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    var data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      var detail = data && (data.error || data.message || data.detail);
      throw new Error(detail || ("Status API request failed (" + response.status + ")"));
    }
    return data;
  }

  async function requestReportResend(params) {
    var resendEndpoint = resolveResendApiEndpoint();
    var body = {};
    if (params.orderId) body.orderId = params.orderId;
    if (params.checkoutId) body.checkoutId = params.checkoutId;

    var response = await fetch(resendEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    var data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      var detail = data && (data.error || data.message || data.detail);
      throw new Error(detail || ("Resend API request failed (" + response.status + ")"));
    }
    return data || {};
  }

  async function requestPremiumReportPreview(params) {
    var previewEndpoint = resolveReportPreviewApiEndpoint();
    var body = {};
    if (params.orderId) body.orderId = params.orderId;
    if (params.checkoutId) body.checkoutId = params.checkoutId;

    var response = await fetch(previewEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    var data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      var detail = data && (data.error || data.message || data.detail);
      throw new Error(detail || ("Premium report preview API request failed (" + response.status + ")"));
    }
    return data || {};
  }

  function maskEmail(value) {
    var email = String(value || "").trim();
    if (!email || email.indexOf("@") === -1) return "";
    var parts = email.split("@");
    var local = parts[0];
    var domain = parts.slice(1).join("@");
    if (local.length <= 2) return local.charAt(0) + "*@" + domain;
    return local.slice(0, 2) + "***@" + domain;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderImmediatePreview(metadata) {
    var preview = document.getElementById("report-preview-box");
    if (!preview) return;
    var goal = metadata.report_goal || "";
    if (!goal) {
      preview.innerHTML =
        "<p class=\"font-semibold text-slate-800 dark:text-slate-100\">즉시 미리보기</p>" +
        "<p class=\"mt-1\">입력 정보가 없어 미리보기를 표시할 수 없습니다. 최종 리포트는 결제 이메일로 발송됩니다.</p>";
      return;
    }

    var allergies = metadata.report_allergies || "없음/미입력";
    var avoid = metadata.report_avoid_ingredients || "없음/미입력";
    var preferred = metadata.report_preferred_categories || "미입력";
    var period = metadata.report_period_weeks || "미입력";
    var activity = metadata.report_activity_level || "미입력";
    var dietary = metadata.report_dietary_restrictions || "미입력";
    var note = metadata.report_note || "없음";
    var todayTip = preferred !== "미입력" ? preferred : "담백한 단백질 + 채소";

    preview.innerHTML =
      "<p class=\"font-semibold text-slate-800 dark:text-slate-100\">즉시 미리보기</p>" +
      "<p class=\"mt-1\">- 목표: " + escapeHtml(goal) + "</p>" +
      "<p>- 목표 기간(주): " + escapeHtml(period) + "</p>" +
      "<p>- 활동량: " + escapeHtml(activity) + "</p>" +
      "<p>- 식이 제한: " + escapeHtml(dietary) + "</p>" +
      "<p>- 오늘 추천: " + escapeHtml(todayTip) + " 중심으로 1끼 구성</p>" +
      "<p>- 알레르기: " + escapeHtml(allergies) + "</p>" +
      "<p>- 기피 재료: " + escapeHtml(avoid) + "</p>" +
      "<p>- 추가 요청: " + escapeHtml(note) + "</p>" +
      "<p class=\"mt-2 text-slate-500 dark:text-slate-400\">상세 7일 플랜은 이메일 본문에서 확인할 수 있습니다.</p>";
  }

  function renderPreviewContent(content, model) {
    var preview = document.getElementById("report-preview-box");
    if (!preview) return;
    var safeText = escapeHtml(content || "");
    var modelLine = model ? "<p class=\"mb-2 text-[11px] text-slate-500 dark:text-slate-400\">생성 모델: " + escapeHtml(model) + "</p>" : "";
    preview.innerHTML =
      "<p class=\"font-semibold text-slate-800 dark:text-slate-100\">리포트 결과</p>" +
      modelLine +
      "<pre class=\"mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed font-sans\">" + safeText + "</pre>";
  }

  async function loadAndRenderPremiumReport() {
    var orderId = latestPaymentContext.orderId;
    var checkoutId = latestPaymentContext.checkoutId;
    if (!orderId && !checkoutId) return;

    try {
      var response = await requestPremiumReportPreview({
        orderId: orderId,
        checkoutId: checkoutId
      });
      if (response && response.ok && response.report) {
        trackAnalytics("report_generated_completed", {
          source: "payment_page",
          model: String(response.model || "")
        });
        renderPreviewContent(String(response.report || ""), String(response.model || ""));
        renderReportDeliveryState({
          show: true,
          stage: "queued",
          orderId: latestPaymentContext.orderId,
          checkoutId: latestPaymentContext.checkoutId,
          customerEmail: latestPaymentContext.customerEmail
        });
      }
    } catch (error) {
      // Keep immediate preview on failure.
    }
  }

  function renderReportDeliveryState(options) {
    var panel = document.getElementById("report-delivery-panel");
    var progressText = document.getElementById("report-progress-text");
    var progressBar = document.getElementById("report-progress-bar");
    var emailHint = document.getElementById("report-email-hint");
    var orderHint = document.getElementById("report-order-hint");
    var resendButton = document.getElementById("report-resend-btn");
    if (!panel || !progressText || !progressBar || !emailHint || !orderHint || !resendButton) return;

    if (!options || !options.show) {
      panel.classList.add("hidden");
      return;
    }

    panel.classList.remove("hidden");
    if (options.stage === "checking") {
      progressText.textContent = "결제 확인 중입니다. 잠시만 기다려 주세요.";
      progressBar.style.width = "25%";
    } else if (options.stage === "generating") {
      progressText.textContent = "결제 확인 완료. 프리미엄 리포트를 생성해 이메일로 발송 중입니다 (약 1~3분).";
      progressBar.style.width = "70%";
    } else if (options.stage === "queued") {
      progressText.textContent = "리포트 발송이 접수되었습니다. 이메일을 확인해 주세요.";
      progressBar.style.width = "100%";
    } else {
      progressText.textContent = "리포트 처리 상태를 확인해 주세요.";
      progressBar.style.width = "40%";
    }

    var masked = maskEmail(options.customerEmail);
    emailHint.textContent = masked
      ? "발송 이메일: " + masked
      : "결제 시 입력한 이메일 주소로 리포트가 발송됩니다.";
    var orderLine = [];
    if (options.orderId) orderLine.push("order_id: " + options.orderId);
    if (options.checkoutId) orderLine.push("checkout_id: " + options.checkoutId);
    orderHint.textContent = orderLine.join(" / ");

    var canResend = !!(options.orderId || options.checkoutId);
    resendButton.disabled = !canResend;
  }

  function renderPaymentResult(message, isError) {
    var panel = document.getElementById("payment-result-panel");
    var text = document.getElementById("payment-result-text");
    var title = document.getElementById("payment-result-title");
    var badge = document.getElementById("payment-result-badge");
    var meta = document.getElementById("payment-result-meta");
    if (!panel || !text) return;

    panel.classList.remove("hidden");
    panel.classList.toggle("border-red-300", !!isError);
    panel.classList.toggle("dark:border-red-700", !!isError);
    text.classList.remove("text-red-600", "dark:text-red-300", "text-slate-600", "dark:text-slate-300");
    text.classList.add(isError ? "text-red-600" : "text-slate-600");
    if (document.documentElement.classList.contains("dark")) {
      text.classList.add(isError ? "dark:text-red-300" : "dark:text-slate-300");
    }
    if (title) title.textContent = isError ? "결제 확인이 필요합니다" : "결제가 완료되었습니다";
    if (badge) {
      badge.textContent = isError ? "오류" : "완료";
      badge.classList.remove(
        "bg-emerald-100",
        "text-emerald-700",
        "dark:bg-emerald-900/40",
        "dark:text-emerald-300",
        "bg-rose-100",
        "text-rose-700",
        "dark:bg-rose-900/40",
        "dark:text-rose-300"
      );
      if (isError) {
        badge.classList.add("bg-rose-100", "text-rose-700", "dark:bg-rose-900/40", "dark:text-rose-300");
      } else {
        badge.classList.add("bg-emerald-100", "text-emerald-700", "dark:bg-emerald-900/40", "dark:text-emerald-300");
      }
    }
    if (meta) {
      if (isError) {
        meta.textContent = "문제가 계속되면 문의 페이지를 이용해 주세요.";
      } else {
        meta.textContent = "결과 리포트는 결제 시 입력한 이메일로 전송됩니다.";
      }
    }
    text.textContent = message;
    latestPaymentResult.title = title ? title.textContent : (isError ? "결제 확인 필요" : "결제 완료");
    latestPaymentResult.message = message || "";
    latestPaymentResult.meta = meta ? meta.textContent || "" : "";
  }

  function getSharePayload() {
    var lines = [latestPaymentResult.title, latestPaymentResult.message, latestPaymentResult.meta]
      .filter(Boolean);
    var text = lines.join("\n");
    return {
      title: "ninanoo 결제/리포트 결과",
      text: text || "결제 결과를 확인했습니다.",
      url: window.location.origin + window.location.pathname
    };
  }

  function savePaymentResultAsFile() {
    var payload = getSharePayload();
    var content = [
      "ninanoo 결제/리포트 결과",
      "generated_at: " + new Date().toISOString(),
      "",
      payload.text,
      "",
      "url: " + payload.url
    ].join("\n");
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ninanoo-report-result-" + new Date().toISOString().slice(0, 10) + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  async function sharePaymentResult() {
    var payload = getSharePayload();
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText(payload.text + "\n" + payload.url);
  }

  function toUserFacingOrderMessage(orderStatus, orderId) {
    var normalized = String(orderStatus || "").toLowerCase();
    if (normalized === "paid") {
      return "결제가 정상적으로 완료되었습니다. 이용해 주셔서 감사합니다.";
    }
    if (normalized === "pending") {
      return "결제 승인 처리 중입니다. 잠시 후 다시 확인해 주세요.";
    }
    if (normalized.indexOf("refund") !== -1) {
      return "결제 건이 환불 상태입니다. 상세 내역은 이메일을 확인해 주세요.";
    }
    var idHint = orderId ? " (주문번호: " + orderId + ")" : "";
    return "결제 상태를 확인했습니다: " + normalized + idHint;
  }

  function toUserFacingCheckoutMessage(checkoutStatus, checkoutId) {
    var normalized = String(checkoutStatus || "").toLowerCase();
    if (normalized === "succeeded" || normalized === "confirmed") {
      return "결제가 정상적으로 완료되었습니다. 결과 리포트 메일을 확인해 주세요.";
    }
    if (normalized === "processing" || normalized === "pending") {
      return "결제 확인 중입니다. 잠시 후 자동으로 반영됩니다.";
    }
    if (normalized === "expired") {
      return "결제 시간이 만료되었습니다. 다시 결제를 진행해 주세요.";
    }
    var idHint = checkoutId ? " (checkout_id: " + checkoutId + ")" : "";
    return "결제 상태를 확인했습니다: " + normalized + idHint;
  }

  async function checkReturnPaymentStatus() {
    var search = new URLSearchParams(window.location.search);
    var paymentState = search.get("payment");
    var checkoutId = search.get("checkout_id");
    var orderId = search.get("order_id");

    if (!paymentState && !checkoutId && !orderId) return;

    if (paymentState === "return") {
      renderPaymentResult("결제가 완료되지 않았습니다. 결제 화면에서 취소했거나 중단된 경우 다시 시도해 주세요.", true);
      clearPaymentQueryParams();
      return;
    }

    if (!checkoutId && !orderId) {
      renderPaymentResult("결제 결과를 확인할 식별자(checkout_id/order_id)가 없습니다.", true);
      clearPaymentQueryParams();
      return;
    }

    renderPaymentResult("결제 결과를 확인하는 중입니다. 잠시만 기다려 주세요...", false);
    renderReportDeliveryState({ show: true, stage: "checking" });
    try {
      var result = await requestPaymentStatus({
        orderId: orderId,
        checkoutId: checkoutId
      });

      if (result.order) {
        var orderStatus = String(result.order.status || "unknown");
        latestPaymentContext.orderId = String(result.order.id || orderId || "");
        latestPaymentContext.checkoutId = String(checkoutId || "");
        latestPaymentContext.customerEmail = String(result.order.customer_email || "");
        latestPaymentContext.status = orderStatus;
        renderPaymentResult(
          toUserFacingOrderMessage(orderStatus, result.order.id || orderId || ""),
          orderStatus !== "paid"
        );
        renderImmediatePreview(resolvePremiumReportMetadata());
        renderReportDeliveryState({
          show: true,
          stage: orderStatus === "paid" ? "generating" : "other",
          orderId: latestPaymentContext.orderId,
          checkoutId: latestPaymentContext.checkoutId,
          customerEmail: latestPaymentContext.customerEmail
        });
        if (orderStatus === "paid") {
          trackAnalytics("payment_success", {
            source: "payment_status",
            type: "order",
            status: orderStatus
          });
          loadAndRenderPremiumReport();
        }
        clearPaymentQueryParams();
        return;
      }

      if (result.checkout) {
        var checkoutStatus = String(result.checkout.status || "unknown");
        var isSuccess = checkoutStatus === "succeeded" || checkoutStatus === "confirmed";
        latestPaymentContext.orderId = String(
          result.checkout.order_id ||
            (result.checkout.order && (result.checkout.order.id || result.checkout.order)) ||
            orderId ||
            ""
        );
        latestPaymentContext.checkoutId = String(result.checkout.id || checkoutId || "");
        latestPaymentContext.customerEmail = String(
          result.checkout.customer_email ||
            (result.checkout.customer && result.checkout.customer.email) ||
            ""
        );
        latestPaymentContext.status = checkoutStatus;
        renderPaymentResult(
          toUserFacingCheckoutMessage(checkoutStatus, result.checkout.id || checkoutId || ""),
          !isSuccess
        );
        renderImmediatePreview(resolvePremiumReportMetadata());
        renderReportDeliveryState({
          show: true,
          stage: isSuccess ? "generating" : "other",
          orderId: latestPaymentContext.orderId,
          checkoutId: latestPaymentContext.checkoutId,
          customerEmail: latestPaymentContext.customerEmail
        });
        if (isSuccess) {
          trackAnalytics("payment_success", {
            source: "payment_status",
            type: "checkout",
            status: checkoutStatus
          });
          loadAndRenderPremiumReport();
        }
        clearPaymentQueryParams();
        return;
      }

      renderPaymentResult("결제 상태 응답 형식을 확인할 수 없습니다.", true);
      renderReportDeliveryState({ show: false });
      clearPaymentQueryParams();
    } catch (error) {
      renderPaymentResult(error && error.message ? error.message : "결제 상태 확인 중 오류가 발생했습니다.", true);
      renderReportDeliveryState({ show: false });
      clearPaymentQueryParams();
    }
  }

  function clearPaymentQueryParams() {
    try {
      var current = new URL(window.location.href);
      current.searchParams.delete("payment");
      current.searchParams.delete("checkout_id");
      current.searchParams.delete("order_id");
      window.history.replaceState({}, "", current.pathname + (current.search ? "?" + current.searchParams.toString() : "") + current.hash);
    } catch (error) {
      // no-op
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("polar-pay-button");
    var status = document.getElementById("polar-pay-status");
    var shareButton = document.getElementById("payment-result-share-btn");
    var saveButton = document.getElementById("payment-result-save-btn");
    var resendButton = document.getElementById("report-resend-btn");
    var resendStatus = document.getElementById("report-resend-status");
    var flowType = getFlowType();
    var metadata = resolvePremiumReportMetadata(flowType);
    trackAnalytics("payment_page_viewed", { flowType: flowType || "premium-report" });
    checkReturnPaymentStatus();
    if (shareButton) {
      shareButton.addEventListener("click", function () {
        sharePaymentResult().catch(function () {
          setStatus(status, "공유에 실패했습니다. 잠시 후 다시 시도해 주세요.", true);
        });
      });
    }
    if (saveButton) {
      saveButton.addEventListener("click", function () {
        try {
          savePaymentResultAsFile();
        } catch (error) {
          setStatus(status, "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", true);
        }
      });
    }
    if (resendButton) {
      resendButton.addEventListener("click", function () {
        if (resendButton.disabled) return;
        resendButton.disabled = true;
        if (resendStatus) {
          resendStatus.textContent = "재전송 요청 중...";
          resendStatus.classList.remove("text-red-500", "dark:text-red-300");
        }
        requestReportResend({
          orderId: latestPaymentContext.orderId,
          checkoutId: latestPaymentContext.checkoutId
        })
          .then(function (data) {
            trackAnalytics("report_resent", {
              source: "payment_page",
              queued: !!(data && data.queued)
            });
            if (resendStatus) {
              var ok = !!data.queued;
              resendStatus.textContent = ok
                ? "재전송 요청이 접수되었습니다. 이메일을 확인해 주세요."
                : "재전송 요청이 접수되지 않았습니다: " + (data.reason || "unknown");
              if (!ok) resendStatus.classList.add("text-red-500", "dark:text-red-300");
            }
            renderReportDeliveryState({
              show: true,
              stage: "queued",
              orderId: latestPaymentContext.orderId,
              checkoutId: latestPaymentContext.checkoutId,
              customerEmail: latestPaymentContext.customerEmail
            });
          })
          .catch(function (error) {
            trackAnalytics("report_resent", {
              source: "payment_page",
              queued: false,
              reason: (error && error.message) || "request_failed"
            });
            if (resendStatus) {
              resendStatus.textContent = (error && error.message) || "재전송 요청 중 오류가 발생했습니다.";
              resendStatus.classList.add("text-red-500", "dark:text-red-300");
            }
          })
          .finally(function () {
            resendButton.disabled = false;
          });
      });
    }
    if (!button) return;
    renderPremiumReportSummary(metadata, flowType);

    if (!metadata.report_goal && flowType !== FLOW_FOOD_ENHANCE) {
      button.disabled = true;
      setStatus(status, "입력 정보가 없어 결제를 진행할 수 없습니다. 정보 입력 페이지에서 먼저 작성해 주세요.", true);
      return;
    }

    button.addEventListener("click", async function () {
      if (button.disabled) return;
      button.disabled = true;
      setStatus(status, "결제 세션을 준비하는 중입니다...", false);
      trackAnalytics("payment_started", {
        source: "payment_page_button",
        flowType: flowType || "premium-report"
      });

      try {
        var checkoutUrl = await requestCheckoutUrl(resolveApiEndpoint(), metadata, flowType);
        window.location.href = checkoutUrl;
      } catch (error) {
        var endpoint = resolveApiEndpoint();
        var message = error && error.message ? error.message : "결제 준비 중 오류가 발생했습니다.";
        if (message === "Failed to fetch") {
          message = "결제 API 연결 실패: " + endpoint + " (도메인/DNS/Worker 배포 상태를 확인하세요)";
        }
        setStatus(status, message, true);
        button.disabled = false;
      }
    });
  });
})();
