(function () {
  "use strict";

  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";
  var DRAFT_STORAGE_KEY = "ninanooPremiumReportDraft";
  var AUTO_EMAIL_SENT_KEY_PREFIX = "ninanooPremiumReportAutoEmailSent:";
  var REPORT_PROGRESS_KEY_PREFIX = "ninanooPremiumReportProgress:";
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

  function getProgressStorageKey() {
    var keyBase = resultContext.orderId || resultContext.checkoutId || "guest";
    return REPORT_PROGRESS_KEY_PREFIX + keyBase;
  }

  function getProgressState() {
    try {
      var raw = window.localStorage.getItem(getProgressStorageKey());
      var parsed = raw ? JSON.parse(raw) : null;
      return {
        actionDone: !!(parsed && parsed.actionDone),
        daysDone: parsed && parsed.daysDone && typeof parsed.daysDone === "object" ? parsed.daysDone : {}
      };
    } catch (error) {
      return { actionDone: false, daysDone: {} };
    }
  }

  function setProgressState(next) {
    try {
      window.localStorage.setItem(getProgressStorageKey(), JSON.stringify(next || { actionDone: false, daysDone: {} }));
    } catch (error) {
      // ignore storage errors
    }
  }

  function cleanLine(line) {
    return String(line || "").replace(/^\s*[-*]\s*/, "").trim();
  }

  function parseSections(content) {
    var lines = String(content || "").split("\n");
    var sectionOrder = ["요약", "맞춤 추천", "7일 플랜", "주의사항"];
    var sectionMap = {};
    sectionOrder.forEach(function (name) { sectionMap[name] = []; });
    var current = "";

    lines.forEach(function (raw) {
      var line = String(raw || "").trim();
      if (!line) return;
      var sectionMatch = line.match(/^\[(.+)\]$/);
      if (sectionMatch) {
        current = sectionMatch[1];
        if (!sectionMap[current]) sectionMap[current] = [];
        return;
      }
      if (current) sectionMap[current].push(line);
    });

    return sectionMap;
  }

  function renderSummary(lines) {
    var items = (lines || []).map(cleanLine).filter(Boolean);
    if (!items.length) return "";
    var state = getProgressState();

    var action = "";
    var actionItem = items.find(function (line) {
      return /오늘\s*실행|오늘\s*액션/.test(line);
    });
    if (actionItem) action = actionItem;

    var itemHtml = items.map(function (line) {
      return "<li class=\"flex items-start gap-2\"><span class=\"mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400\"></span><span>" + escapeHtml(line) + "</span></li>";
    }).join("");

    var actionHtml = action
      ? "<div class=\"mt-3 rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/40 px-3 py-3 text-sm text-indigo-900 dark:text-indigo-100\">" +
          "<div class=\"flex items-center justify-between gap-3\">" +
          "<div><strong>오늘의 실행 포인트</strong><br/>" + escapeHtml(action) + "</div>" +
          "<button id=\"report-action-toggle\" type=\"button\" class=\"shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold " + (state.actionDone ? "bg-emerald-500 text-white" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100") + "\">" + (state.actionDone ? "완료됨" : "완료 체크") + "</button>" +
          "</div>" +
        "</div>"
      : "";

    return "<section class=\"rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-4 shadow-sm\"><h3 class=\"text-base font-bold text-slate-900 dark:text-slate-100\">요약</h3><ul class=\"mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200\">" + itemHtml + "</ul>" + actionHtml + "</section>";
  }

  function parseRecommendations(lines) {
    var blocks = [];
    var current = null;
    (lines || []).forEach(function (raw) {
      var line = cleanLine(raw);
      if (!line) return;
      if (/^\d+\)/.test(line)) {
        if (current) blocks.push(current);
        current = { title: line, reason: "", guide: "" };
        return;
      }
      if (!current) return;
      if (/^추천 이유\s*:/.test(line)) {
        current.reason = line.replace(/^추천 이유\s*:\s*/, "");
      } else if (/^실행 가이드\s*:/.test(line)) {
        current.guide = line.replace(/^실행 가이드\s*:\s*/, "");
      } else {
        current.title += " " + line;
      }
    });
    if (current) blocks.push(current);
    return blocks;
  }

  function renderRecommendations(lines) {
    var blocks = parseRecommendations(lines);
    if (!blocks.length) return "";
    var cards = blocks.map(function (item) {
      var reasonHtml = item.reason ? "<p class=\"mt-2 text-xs text-slate-600 dark:text-slate-300\"><strong>추천 이유</strong> " + escapeHtml(item.reason) + "</p>" : "";
      var guideHtml = item.guide ? "<p class=\"mt-1 text-xs text-emerald-700 dark:text-emerald-300\"><strong>실행 가이드</strong> " + escapeHtml(item.guide) + "</p>" : "";
      return "<article class=\"rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-3\"><p class=\"text-sm font-semibold text-slate-900 dark:text-slate-100\">" + escapeHtml(item.title) + "</p>" + reasonHtml + guideHtml + "</article>";
    }).join("");

    return "<section class=\"rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30 p-4\"><h3 class=\"text-base font-bold text-slate-900 dark:text-slate-100\">맞춤 추천</h3><div class=\"mt-3 grid gap-3\">" + cards + "</div></section>";
  }

  function parseDayPlans(lines) {
    var days = [];
    var current = null;
    (lines || []).forEach(function (raw) {
      var line = cleanLine(raw);
      if (!line) return;
      var dayMatch = line.match(/^Day([1-7])\s*:\s*(.+)$/i);
      if (dayMatch) {
        if (current) days.push(current);
        current = { day: "Day" + dayMatch[1], plan: dayMatch[2], checkpoint: "" };
        return;
      }
      if (!current) return;
      if (/^체크포인트\s*:/.test(line)) {
        current.checkpoint = line.replace(/^체크포인트\s*:\s*/, "");
      } else if (!current.checkpoint) {
        current.plan += " " + line;
      }
    });
    if (current) days.push(current);
    return days;
  }

  function renderDayPlans(lines) {
    var days = parseDayPlans(lines);
    if (!days.length) return "";
    var state = getProgressState();
    var cards = days.map(function (d) {
      var checkpoint = d.checkpoint || "오늘 계획 이행 여부를 체크하세요.";
      var checked = !!state.daysDone[d.day];
      return "<article class=\"rounded-xl border " + (checked ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-700" : "border-emerald-200 bg-white dark:bg-slate-900/40 dark:border-slate-700") + " p-3\">" +
        "<div class=\"flex items-center justify-between gap-2\">" +
        "<p class=\"text-sm font-bold text-emerald-700 dark:text-emerald-300\">" + escapeHtml(d.day) + "</p>" +
        "<label class=\"inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300\"><input class=\"report-day-check rounded border-slate-300 text-emerald-600 focus:ring-emerald-500\" type=\"checkbox\" data-day=\"" + escapeHtml(d.day) + "\" " + (checked ? "checked" : "") + ">완료</label>" +
        "</div>" +
        "<p class=\"mt-1 text-sm text-slate-800 dark:text-slate-200\">" + escapeHtml(d.plan) + "</p>" +
        "<p class=\"mt-2 text-xs text-slate-600 dark:text-slate-300\"><strong>체크포인트</strong> " + escapeHtml(checkpoint) + "</p>" +
      "</article>";
    }).join("");
    return "<section class=\"rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 p-4\"><h3 class=\"text-base font-bold text-slate-900 dark:text-slate-100\">7일 플랜</h3><div class=\"mt-3 grid gap-3 sm:grid-cols-2\">" + cards + "</div></section>";
  }

  function renderWarnings(lines) {
    var items = (lines || []).map(cleanLine).filter(Boolean);
    if (!items.length) return "";
    var list = items.map(function (line) {
      return "<li class=\"flex items-start gap-2\"><span class=\"mt-2 w-1.5 h-1.5 rounded-full bg-rose-400\"></span><span>" + escapeHtml(line) + "</span></li>";
    }).join("");
    return "<section class=\"rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 p-4\"><h3 class=\"text-base font-bold text-slate-900 dark:text-slate-100\">주의사항</h3><ul class=\"mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200\">" + list + "</ul></section>";
  }

  function buildMotivationPanel(totalDays) {
    var state = getProgressState();
    var doneCount = Object.keys(state.daysDone || {}).filter(function (k) { return state.daysDone[k]; }).length;
    var ratio = totalDays > 0 ? Math.min(100, Math.round((doneCount / totalDays) * 100)) : 0;
    return [
      "<section class=\"rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900/40 p-4\">",
      "<div class=\"flex items-start justify-between gap-3\">",
      "<div><p class=\"text-xs font-semibold text-indigo-600 dark:text-indigo-300\">이번 주 실행 대시보드</p><h3 class=\"mt-1 text-lg font-bold text-slate-900 dark:text-slate-100\">작게 시작해서 7일 루틴으로 완성하세요</h3></div>",
      "<div class=\"rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-3 py-2 text-right\"><p class=\"text-[11px] text-indigo-700 dark:text-indigo-300\">주간 진행률</p><p id=\"report-plan-score\" class=\"text-lg font-extrabold text-indigo-700 dark:text-indigo-200\">" + ratio + "%</p></div>",
      "</div>",
      "<div class=\"mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden\"><div id=\"report-plan-progress\" class=\"h-full bg-gradient-to-r from-emerald-500 to-indigo-500\" style=\"width:" + ratio + "%\"></div></div>",
      "<div class=\"mt-3 grid gap-2 sm:grid-cols-3\">",
      "<div class=\"rounded-xl border border-slate-200 dark:border-slate-700 p-3\"><p class=\"text-xs text-slate-500 dark:text-slate-300\">오늘 액션</p><p id=\"report-action-score\" class=\"mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100\">" + (state.actionDone ? "완료" : "미완료") + "</p></div>",
      "<div class=\"rounded-xl border border-slate-200 dark:border-slate-700 p-3\"><p class=\"text-xs text-slate-500 dark:text-slate-300\">완료한 Day</p><p id=\"report-days-done\" class=\"mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100\">" + doneCount + " / " + totalDays + "</p></div>",
      "<div class=\"rounded-xl border border-slate-200 dark:border-slate-700 p-3\"><p class=\"text-xs text-slate-500 dark:text-slate-300\">다음 목표</p><p class=\"mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100\">" + (doneCount < totalDays ? "Day" + (doneCount + 1) + " 체크" : "이번 주 완료") + "</p></div>",
      "</div>",
      "</section>"
    ].join("");
  }

  function bindInteractiveReportUi() {
    var actionBtn = document.getElementById("report-action-toggle");
    if (actionBtn) {
      actionBtn.addEventListener("click", function () {
        var state = getProgressState();
        state.actionDone = !state.actionDone;
        setProgressState(state);
        renderReport(resultContext.reportText, resultContext.model);
      });
    }

    var checks = document.querySelectorAll(".report-day-check");
    checks.forEach(function (check) {
      check.addEventListener("change", function (event) {
        var target = event.target;
        var day = target && target.getAttribute("data-day");
        if (!day) return;
        var state = getProgressState();
        state.daysDone[day] = !!target.checked;
        setProgressState(state);
        renderReport(resultContext.reportText, resultContext.model);
      });
    });
  }

  function buildFriendlyReportHtml(content) {
    var sections = parseSections(content);
    var summaryHtml = renderSummary(sections["요약"] || []);
    var recoHtml = renderRecommendations(sections["맞춤 추천"] || []);
    var dayPlans = parseDayPlans(sections["7일 플랜"] || []);
    var planHtml = renderDayPlans(sections["7일 플랜"] || []);
    var warnHtml = renderWarnings(sections["주의사항"] || []);
    var motivationHtml = buildMotivationPanel(dayPlans.length || 7);

    if (!summaryHtml && !recoHtml && !planHtml && !warnHtml) {
      return "<pre class=\"whitespace-pre-wrap break-words text-sm leading-relaxed font-sans\">" + escapeHtml(content) + "</pre>";
    }

    return [
      "<div class=\"mb-4 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 p-[1px]\">",
      "<div class=\"rounded-xl bg-white dark:bg-slate-900/70 px-4 py-3\">",
      "<p class=\"text-sm font-semibold text-slate-900 dark:text-slate-100\">좋은 리포트는 실행할 때 가치가 생깁니다.</p>",
      "<p class=\"mt-1 text-xs text-slate-600 dark:text-slate-300\">오늘 액션 1개부터 시작하고, 체크를 쌓아 7일 루틴을 완성해보세요.</p>",
      "</div></div>",
      "<div class=\"space-y-4\">",
      motivationHtml,
      summaryHtml,
      recoHtml,
      planHtml,
      warnHtml,
      "</div>"
    ].join("");
  }

  function renderReport(content, model) {
    var box = document.getElementById("report-content-text");
    if (!box) return;
    box.innerHTML = buildFriendlyReportHtml(content);
    resultContext.reportText = String(content || "");
    resultContext.model = String(model || "");
    bindInteractiveReportUi();
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
