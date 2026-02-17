(function () {
  "use strict";

  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";
  var DRAFT_STORAGE_KEY = "ninanooPremiumReportDraft";
  var AUTO_EMAIL_SENT_KEY_PREFIX = "ninanooPremiumReportAutoEmailSent:";
  var resultContext = {
    orderId: "",
    checkoutId: "",
    customerEmail: "",
    reportText: "",
    model: ""
  };

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

  function endpointFor(pathSuffix) {
    return resolveApiEndpoint().replace(/\/create-checkout$/, pathSuffix);
  }

  function setProgress(stage, text) {
    var title = document.getElementById("result-title");
    var subtitle = document.getElementById("result-subtitle");
    var progressText = document.getElementById("report-progress-text");
    var progressBar = document.getElementById("report-progress-bar");
    if (progressText) progressText.textContent = text;

    var width = "25%";
    if (stage === "paid") width = "50%";
    if (stage === "generating") width = "75%";
    if (stage === "done") width = "100%";
    if (progressBar) progressBar.style.width = width;

    if (title) {
      title.textContent = stage === "done" ? "프리미엄 리포트 결과" : "리포트 결과를 불러오는 중입니다";
    }
    if (subtitle) {
      subtitle.textContent = stage === "done"
        ? "결제 완료 기준으로 생성된 리포트입니다. 이메일로도 동일 내용이 발송됩니다."
        : "결제 정보를 확인한 뒤 맞춤 리포트를 표시합니다.";
    }
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

  function setHints() {
    var emailHint = document.getElementById("report-email-hint");
    var orderHint = document.getElementById("report-order-hint");
    if (emailHint) {
      var masked = maskEmail(resultContext.customerEmail);
      emailHint.textContent = masked ? "발송 이메일: " + masked : "결제 이메일로 리포트가 발송됩니다.";
    }
    if (orderHint) {
      var lines = [];
      if (resultContext.orderId) lines.push("order_id: " + resultContext.orderId);
      if (resultContext.checkoutId) lines.push("checkout_id: " + resultContext.checkoutId);
      orderHint.textContent = lines.join(" / ");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderReport(content, model) {
    var box = document.getElementById("report-content-text");
    if (!box) return;
    box.innerHTML = "<pre class=\"whitespace-pre-wrap break-words text-sm leading-relaxed font-sans\">" + escapeHtml(content) + "</pre>";
    resultContext.reportText = String(content || "");
    resultContext.model = String(model || "");
  }

  function renderFallbackPreview() {
    var box = document.getElementById("report-content-text");
    if (!box) return;
    var draft = null;
    try {
      var raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
      draft = raw ? JSON.parse(raw) : null;
    } catch (error) {
      draft = null;
    }

    var lines = [
      "리포트 생성이 지연되어 기본 미리보기를 먼저 표시합니다.",
      "",
      "[요약]",
      "- 목표: " + ((draft && draft.report_goal) || "미입력"),
      "- 선호 카테고리: " + ((draft && draft.report_preferred_categories) || "미입력"),
      "",
      "[안내]",
      "- 상세 리포트는 이메일로 순차 발송됩니다.",
      "- 하단 '이메일로 보내기' 버튼으로 재요청할 수 있습니다."
    ];
    renderReport(lines.join("\n"), "fallback:preview");
  }

  async function requestJson(url, method, body) {
    var response = await fetch(url, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json"
      },
      body: body ? JSON.stringify(body) : undefined
    });
    var data;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }
    if (!response.ok) {
      var detail = data && (data.error || data.message || data.detail);
      throw new Error(detail || ("Request failed (" + response.status + ")"));
    }
    return data || {};
  }

  async function fetchPaymentStatus() {
    var statusUrl = new URL(endpointFor("/payment-status"));
    if (resultContext.orderId) {
      statusUrl.searchParams.set("order_id", resultContext.orderId);
    } else if (resultContext.checkoutId) {
      statusUrl.searchParams.set("checkout_id", resultContext.checkoutId);
    } else {
      throw new Error("order_id or checkout_id is required");
    }

    var data = await requestJson(statusUrl.toString(), "GET");
    if (data.order) {
      resultContext.orderId = String(data.order.id || resultContext.orderId || "");
      resultContext.customerEmail = String(data.order.customer_email || "");
      return { type: "order", status: String(data.order.status || "unknown").toLowerCase() };
    }

    if (data.checkout) {
      resultContext.checkoutId = String(data.checkout.id || resultContext.checkoutId || "");
      resultContext.orderId = String(
        data.checkout.order_id ||
        (data.checkout.order && (data.checkout.order.id || data.checkout.order)) ||
        resultContext.orderId ||
        ""
      );
      resultContext.customerEmail = String(
        data.checkout.customer_email ||
        (data.checkout.customer && data.checkout.customer.email) ||
        ""
      );
      return { type: "checkout", status: String(data.checkout.status || "unknown").toLowerCase() };
    }

    throw new Error("결제 상태 응답 형식을 확인할 수 없습니다.");
  }

  async function fetchPremiumReportPreview() {
    return requestJson(endpointFor("/premium-report-preview"), "POST", {
      orderId: resultContext.orderId,
      checkoutId: resultContext.checkoutId
    });
  }

  async function requestResend() {
    return requestJson(endpointFor("/resend-report"), "POST", {
      orderId: resultContext.orderId,
      checkoutId: resultContext.checkoutId
    });
  }

  async function shareReport() {
    var text = resultContext.reportText || "리포트 결과를 확인했습니다.";
    var payload = {
      title: "ninanoo 프리미엄 리포트",
      text: text,
      url: window.location.href
    };
    if (navigator.share) {
      await navigator.share(payload);
      return;
    }
    await navigator.clipboard.writeText(text + "\n" + payload.url);
  }

  async function saveReportAsPdf() {
    if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
      throw new Error("PDF 라이브러리를 불러오지 못했습니다.");
    }
    var reportBox = document.getElementById("report-content-box");
    if (!reportBox) {
      throw new Error("리포트 영역을 찾을 수 없습니다.");
    }

    var canvas = await window.html2canvas(reportBox, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff"
    });
    var imageData = canvas.toDataURL("image/png");
    var pdf = new window.jspdf.jsPDF("p", "pt", "a4");

    var pageWidth = pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.getHeight();
    var margin = 24;
    var printableWidth = pageWidth - (margin * 2);
    var printableHeight = pageHeight - (margin * 2);
    var imageHeight = (canvas.height * printableWidth) / canvas.width;
    var offsetY = 0;

    pdf.addImage(imageData, "PNG", margin, margin - offsetY, printableWidth, imageHeight, undefined, "FAST");
    while ((imageHeight - offsetY) > printableHeight) {
      offsetY += printableHeight;
      pdf.addPage();
      pdf.addImage(imageData, "PNG", margin, margin - offsetY, printableWidth, imageHeight, undefined, "FAST");
    }

    var filename = "ninanoo-premium-report-" + new Date().toISOString().slice(0, 10) + ".pdf";
    pdf.save(filename);
  }

  function getAutoEmailSentKey() {
    var keyBase = resultContext.orderId || resultContext.checkoutId || "";
    return AUTO_EMAIL_SENT_KEY_PREFIX + keyBase;
  }

  async function requestImmediateEmailSend() {
    var keyBase = resultContext.orderId || resultContext.checkoutId || "";
    if (!keyBase) return;

    var sentKey = getAutoEmailSentKey();
    if (window.sessionStorage.getItem(sentKey) === "1") return;
    window.sessionStorage.setItem(sentKey, "1");

    try {
      var data = await requestResend();
      if (data && data.queued) {
        setActionStatus("리포트가 결제 이메일로 발송되었습니다.", false);
        return;
      }
      window.sessionStorage.removeItem(sentKey);
      setActionStatus("이메일 발송 요청 실패: " + ((data && data.reason) || "unknown"), true);
    } catch (error) {
      window.sessionStorage.removeItem(sentKey);
      setActionStatus((error && error.message) || "이메일 발송 요청 중 오류가 발생했습니다.", true);
    }
  }

  function setActionStatus(message, isError) {
    var status = document.getElementById("result-action-status");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("text-red-500", "dark:text-red-300", "text-slate-500", "dark:text-slate-400");
    if (isError) {
      status.classList.add("text-red-500", "dark:text-red-300");
    } else {
      status.classList.add("text-slate-500", "dark:text-slate-400");
    }
  }

  async function init() {
    var params = new URLSearchParams(window.location.search);
    var payment = params.get("payment");
    resultContext.checkoutId = String(params.get("checkout_id") || "");
    resultContext.orderId = String(params.get("order_id") || "");

    if (payment === "return") {
      setProgress("checking", "결제가 완료되지 않았습니다. 결제 화면으로 돌아가 다시 시도해 주세요.");
      renderReport("결제가 취소되었거나 중단되었습니다.\n\n다시 결제를 진행해 주세요.", "");
      return;
    }

    if (!resultContext.checkoutId && !resultContext.orderId) {
      setProgress("checking", "결제 식별자가 없어 결과를 불러올 수 없습니다.");
      renderReport("checkout_id 또는 order_id가 필요합니다.", "");
      return;
    }

    try {
      setProgress("checking", "결제 상태를 확인 중입니다...");
      var statusResult = await fetchPaymentStatus();
      setHints();

      var paid = statusResult.status === "paid" || statusResult.status === "succeeded" || statusResult.status === "confirmed";
      if (!paid) {
        setProgress("checking", "결제 상태가 완료가 아닙니다: " + statusResult.status);
        renderReport("결제 상태: " + statusResult.status + "\n결제가 완료되면 리포트가 생성됩니다.", "");
        return;
      }

      setProgress("generating", "결제 확인 완료. 리포트 결과를 생성 중입니다...");
      var preview = await fetchPremiumReportPreview();
      if (preview.ok && preview.report) {
        if (preview.customerEmail) resultContext.customerEmail = String(preview.customerEmail);
        setHints();
        renderReport(String(preview.report || ""), String(preview.model || ""));
        setProgress("done", "리포트 생성이 완료되었습니다. 아래에서 바로 확인할 수 있습니다.");
      } else {
        renderFallbackPreview();
        setProgress("generating", "리포트 생성이 지연되고 있어 미리보기를 먼저 표시합니다.");
      }
      await requestImmediateEmailSend();
    } catch (error) {
      renderFallbackPreview();
      setProgress("checking", "리포트 조회 중 오류가 발생했습니다. 아래 미리보기를 참고해 주세요.");
      setActionStatus((error && error.message) || "리포트 조회 오류", true);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var shareBtn = document.getElementById("result-share-btn");
    var saveBtn = document.getElementById("result-save-btn");
    var resendBtn = document.getElementById("result-resend-btn");

    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareReport()
          .then(function () {
            setActionStatus("리포트 공유가 완료되었습니다.", false);
          })
          .catch(function () {
            setActionStatus("공유에 실패했습니다.", true);
          });
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        saveReportAsPdf()
          .then(function () {
            setActionStatus("리포트 PDF 저장이 완료되었습니다.", false);
          })
          .catch(function (error) {
            setActionStatus((error && error.message) || "PDF 저장에 실패했습니다.", true);
          });
      });
    }

    if (resendBtn) {
      resendBtn.addEventListener("click", function () {
        if (resendBtn.disabled) return;
        resendBtn.disabled = true;
        setActionStatus("이메일 발송 요청 중...", false);
        requestResend()
          .then(function (data) {
            if (data && data.queued) {
              setActionStatus("이메일 발송 요청이 접수되었습니다. 받은함을 확인해 주세요.", false);
            } else {
              setActionStatus("이메일 발송 요청 실패: " + ((data && data.reason) || "unknown"), true);
            }
          })
          .catch(function (error) {
            setActionStatus((error && error.message) || "이메일 발송 요청 중 오류가 발생했습니다.", true);
          })
          .finally(function () {
            resendBtn.disabled = false;
          });
      });
    }

    init();
  });
})();
