(function () {
  "use strict";

  var PRODUCT_ID = "09ed8b9c-c328-4962-a12f-69923155d3c6";
  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("text-red-500", !!isError);
    el.classList.toggle("dark:text-red-400", !!isError);
    if (isError) {
      el.classList.remove("text-slate-500", "dark:text-slate-400");
    } else {
      el.classList.add("text-slate-500", "dark:text-slate-400");
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
    var successUrl = window.location.origin + "/pages/payment.html?payment=success&checkout_id={CHECKOUT_ID}";
    var returnUrl = window.location.origin + "/pages/payment.html?payment=return";

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

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("contact-polar-pay-button");
    var status = document.getElementById("contact-polar-pay-status");
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
