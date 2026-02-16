(function () {
  "use strict";

  // From polar.txt: create checkout sessions with "products" array.
  var PRODUCT_ID = "09ed8b9c-c328-4962-a12f-69923155d3c6";
  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";

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

  async function requestCheckoutUrl(apiEndpoint) {
    var currentUrl = window.location.origin + window.location.pathname;
    var successUrl = window.location.origin + "/?payment=success&checkout_id={CHECKOUT_ID}";
    var returnUrl = currentUrl + "?payment=return";
    var response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        productId: PRODUCT_ID,
        successUrl: successUrl,
        returnUrl: returnUrl
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
    try {
      var result = await requestPaymentStatus({
        orderId: orderId,
        checkoutId: checkoutId
      });

      if (result.order) {
        var orderStatus = String(result.order.status || "unknown");
        renderPaymentResult(
          toUserFacingOrderMessage(orderStatus, result.order.id || orderId || ""),
          orderStatus !== "paid"
        );
        clearPaymentQueryParams();
        return;
      }

      if (result.checkout) {
        var checkoutStatus = String(result.checkout.status || "unknown");
        var isSuccess = checkoutStatus === "succeeded" || checkoutStatus === "confirmed";
        renderPaymentResult(
          toUserFacingCheckoutMessage(checkoutStatus, result.checkout.id || checkoutId || ""),
          !isSuccess
        );
        clearPaymentQueryParams();
        return;
      }

      renderPaymentResult("결제 상태 응답 형식을 확인할 수 없습니다.", true);
      clearPaymentQueryParams();
    } catch (error) {
      renderPaymentResult(error && error.message ? error.message : "결제 상태 확인 중 오류가 발생했습니다.", true);
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
    checkReturnPaymentStatus();
    if (!button) return;

    button.addEventListener("click", async function () {
      if (button.disabled) return;
      button.disabled = true;
      setStatus(status, "결제 세션을 준비하는 중입니다...", false);

      try {
        var checkoutUrl = await requestCheckoutUrl(resolveApiEndpoint());
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
