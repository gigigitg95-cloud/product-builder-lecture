(function () {
  "use strict";

  // From polar.txt: create checkout sessions with "products" array.
  var PRODUCT_ID = "45ee4c82-2396-44bd-8249-a577755cbf9e";
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
    if (!panel || !text) return;

    panel.classList.remove("hidden");
    panel.classList.toggle("border-red-300", !!isError);
    panel.classList.toggle("dark:border-red-700", !!isError);
    text.classList.toggle("text-red-600", !!isError);
    text.classList.toggle("dark:text-red-300", !!isError);
    if (isError) {
      text.classList.remove("text-slate-600", "dark:text-slate-300");
    } else {
      text.classList.add("text-slate-600", "dark:text-slate-300");
    }
    text.textContent = message;
  }

  async function checkReturnPaymentStatus() {
    var search = new URLSearchParams(window.location.search);
    var paymentState = search.get("payment");
    var checkoutId = search.get("checkout_id");
    var orderId = search.get("order_id");

    if (!paymentState && !checkoutId && !orderId) return;

    if (paymentState === "return") {
      renderPaymentResult("결제가 완료되지 않았거나 결제 화면에서 돌아왔습니다. 다시 시도할 수 있습니다.", false);
      clearPaymentQueryParams();
      return;
    }

    if (!checkoutId && !orderId) {
      renderPaymentResult("결제 결과를 확인할 식별자(checkout_id/order_id)가 없습니다.", true);
      clearPaymentQueryParams();
      return;
    }

    renderPaymentResult("결제 결과를 확인하는 중입니다...", false);
    try {
      var result = await requestPaymentStatus({
        orderId: orderId,
        checkoutId: checkoutId
      });

      if (result.order) {
        var orderStatus = String(result.order.status || "unknown");
        renderPaymentResult("결제 상태: " + orderStatus + " (order_id: " + (result.order.id || orderId || "-") + ")", orderStatus !== "paid");
        clearPaymentQueryParams();
        return;
      }

      if (result.checkout) {
        var checkoutStatus = String(result.checkout.status || "unknown");
        var isSuccess = checkoutStatus === "succeeded" || checkoutStatus === "confirmed";
        renderPaymentResult("체크아웃 상태: " + checkoutStatus + " (checkout_id: " + (result.checkout.id || checkoutId || "-") + ")", !isSuccess);
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
