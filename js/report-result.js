(function () {
  "use strict";

  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";
  var DRAFT_STORAGE_KEY = "ninanooPremiumReportDraft";
  var AUTO_EMAIL_SENT_KEY_PREFIX = "ninanooPremiumReportAutoEmailSent:";
  var REPORT_PROGRESS_KEY_PREFIX = "ninanooPremiumReportProgress:";
  var FLOW_STEPS = [
    { key: "checking", label: "결제확인중" },
    { key: "generating", label: "생성중" },
    { key: "preview", label: "미리보기" },
    { key: "done", label: "완료" },
    { key: "failed", label: "실패/재시도" }
  ];
  var DAY_KEYS = ["Day1", "Day2", "Day3", "Day4", "Day5", "Day6", "Day7"];
  var resultContext = {
    orderId: "",
    checkoutId: "",
    customerEmail: "",
    reportText: "",
    model: ""
  };

  function trackAnalytics(eventName, props) {
    if (!window.NinanooAnalytics || typeof window.NinanooAnalytics.track !== "function") return;
    window.NinanooAnalytics.track(eventName, props || {});
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

  function endpointFor(pathSuffix) {
    return resolveApiEndpoint().replace(/\/create-checkout$/, pathSuffix);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanLine(line) {
    return String(line || "").replace(/^\s*[-*]\s*/, "").trim();
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

  function renderFlowStateChips(activeState) {
    var box = document.getElementById("report-flow-states");
    if (!box) return;
    var activeIdx = FLOW_STEPS.findIndex(function (step) { return step.key === activeState; });
    box.innerHTML = FLOW_STEPS.map(function (step, idx) {
      var isActive = step.key === activeState;
      var isPassed = activeIdx >= 0 && idx < activeIdx;
      var cls = "rounded-full border px-2 py-1";
      if (isActive) {
        cls += " border-indigo-300 bg-indigo-100 text-indigo-800 dark:border-indigo-600 dark:bg-indigo-900/60 dark:text-indigo-100";
      } else if (isPassed) {
        cls += " border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-100";
      } else {
        cls += " border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300";
      }
      return "<span class=\"" + cls + "\">" + escapeHtml(step.label) + "</span>";
    }).join("");
  }

  function toggleNextActions(show) {
    var panel = document.getElementById("report-next-actions");
    if (!panel) return;
    panel.classList.toggle("hidden", !show);
  }

  function setFlowState(stage, text, options) {
    var opts = options || {};
    var title = document.getElementById("result-title");
    var subtitle = document.getElementById("result-subtitle");
    var progressText = document.getElementById("report-progress-text");
    var progressBar = document.getElementById("report-progress-bar");

    if (progressText) progressText.textContent = text || "";

    var width = "20%";
    if (stage === "checking") width = "20%";
    if (stage === "generating") width = "55%";
    if (stage === "preview") width = "80%";
    if (stage === "done") width = "100%";
    if (stage === "failed") width = "100%";

    if (progressBar) {
      progressBar.style.width = width;
      progressBar.classList.remove("from-sky-500", "to-indigo-500", "from-amber-500", "to-orange-500", "from-rose-500", "to-amber-500", "from-emerald-500", "to-teal-500");
      if (stage === "failed") {
        progressBar.classList.add("from-rose-500", "to-amber-500");
      } else if (stage === "done") {
        progressBar.classList.add("from-emerald-500", "to-teal-500");
      } else if (stage === "preview") {
        progressBar.classList.add("from-amber-500", "to-orange-500");
      } else {
        progressBar.classList.add("from-sky-500", "to-indigo-500");
      }
    }

    if (title) {
      title.textContent = stage === "done" ? "프리미엄 리포트 결과" : "리포트 결과를 불러오는 중입니다";
    }

    if (subtitle) {
      if (stage === "done") {
        subtitle.textContent = "결제 완료 기준으로 생성된 리포트입니다. 이메일로도 동일 내용이 발송됩니다.";
      } else if (stage === "preview") {
        subtitle.textContent = "핵심 내용을 먼저 확인할 수 있는 미리보기 상태입니다.";
      } else if (stage === "failed") {
        subtitle.textContent = "아래 안내에 따라 재시도하거나 문의를 진행해 주세요.";
      } else {
        subtitle.textContent = "결제 정보를 확인한 뒤 맞춤 리포트를 표시합니다.";
      }
    }

    renderFlowStateChips(stage);
    toggleNextActions(!!opts.showNextActions || stage === "failed");
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

  function getProgressStorageKey() {
    var keyBase = resultContext.orderId || resultContext.checkoutId || "guest";
    return REPORT_PROGRESS_KEY_PREFIX + keyBase;
  }

  function defaultDayChecks() {
    var map = {};
    DAY_KEYS.forEach(function (day) { map[day] = false; });
    return map;
  }

  function defaultActionChecks() {
    return { "0": false, "1": false, "2": false };
  }

  function normalizeProgressState(parsed) {
    var daysDone = parsed && parsed.daysDone && typeof parsed.daysDone === "object" ? parsed.daysDone : {};
    var dayChecks = parsed && parsed.dayChecks && typeof parsed.dayChecks === "object" ? parsed.dayChecks : {};
    var actionsDone = parsed && parsed.actionsDone && typeof parsed.actionsDone === "object" ? parsed.actionsDone : {};
    var actions = parsed && parsed.actions && typeof parsed.actions === "object" ? parsed.actions : {};

    var normalizedDays = defaultDayChecks();
    DAY_KEYS.forEach(function (day) {
      normalizedDays[day] = !!(dayChecks[day] || daysDone[day]);
    });

    var normalizedActions = defaultActionChecks();
    ["0", "1", "2"].forEach(function (key) {
      normalizedActions[key] = !!(actions[key] || actionsDone[key] || (key === "0" && parsed && parsed.actionDone));
    });

    return {
      dayChecks: normalizedDays,
      actions: normalizedActions
    };
  }

  function getProgressState() {
    try {
      var raw = window.localStorage.getItem(getProgressStorageKey());
      var parsed = raw ? JSON.parse(raw) : null;
      return normalizeProgressState(parsed);
    } catch (error) {
      return normalizeProgressState(null);
    }
  }

  function setProgressState(next) {
    try {
      var payload = normalizeProgressState(next || {});
      window.localStorage.setItem(getProgressStorageKey(), JSON.stringify(payload));
    } catch (error) {
      // ignore storage errors
    }
  }

  function calculateStreak(dayChecks) {
    var streak = 0;
    DAY_KEYS.forEach(function (day) {
      if (dayChecks[day] && streak === DAY_KEYS.indexOf(day)) {
        streak += 1;
      }
    });
    return streak;
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

  function deriveTodayActions(content, sections) {
    var actions = [];
    var summaryLines = (sections["요약"] || []).map(cleanLine).filter(Boolean);
    summaryLines.forEach(function (line) {
      if (/오늘\s*실행|오늘\s*액션|오늘/.test(line) && actions.length < 3) {
        actions.push(line.replace(/^오늘\s*실행\s*액션\s*:\s*/, "").trim());
      }
    });

    var recoBlocks = parseRecommendations(sections["맞춤 추천"] || []);
    recoBlocks.forEach(function (block) {
      if (actions.length >= 3) return;
      if (block && block.guide) actions.push(block.guide);
    });

    var fallbackPool = [
      "아침 식사 전에 물 1컵을 먼저 마시기",
      "점심은 단백질 1개 + 채소 2가지로 구성하기",
      "저녁 식사 후 10분 걷기 실행하기"
    ];

    fallbackPool.forEach(function (item) {
      if (actions.length < 3) actions.push(item);
    });

    return actions.slice(0, 3);
  }

  function renderSummary(lines) {
    var items = (lines || []).map(cleanLine).filter(Boolean);
    if (!items.length) return "";
    var itemHtml = items.map(function (line) {
      return "<li class=\"flex items-start gap-2\"><span class=\"mt-2 w-1.5 h-1.5 rounded-full bg-indigo-400\"></span><span>" + escapeHtml(line) + "</span></li>";
    }).join("");
    return "<section class=\"rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-4 shadow-sm\"><h3 class=\"text-base font-bold text-slate-900 dark:text-slate-100\">요약</h3><ul class=\"mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200\">" + itemHtml + "</ul></section>";
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
    var cards = days.map(function (d) {
      var checkpoint = d.checkpoint || "오늘 계획 이행 여부를 체크하세요.";
      return "<article class=\"rounded-xl border border-emerald-200 bg-white dark:bg-slate-900/40 dark:border-slate-700 p-3\">" +
        "<p class=\"text-sm font-bold text-emerald-700 dark:text-emerald-300\">" + escapeHtml(d.day) + "</p>" +
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

  function buildExecutionDashboard(content, sections) {
    var state = getProgressState();
    var dayChecks = state.dayChecks || defaultDayChecks();
    var actionChecks = state.actions || defaultActionChecks();
    var actions = deriveTodayActions(content, sections);

    var doneCount = DAY_KEYS.filter(function (day) { return !!dayChecks[day]; }).length;
    var ratio = Math.min(100, Math.round((doneCount / DAY_KEYS.length) * 100));
    var streak = calculateStreak(dayChecks);

    var actionCards = actions.map(function (action, idx) {
      var key = String(idx);
      var checked = !!actionChecks[key];
      return "<label class=\"rounded-xl border " + (checked ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40") + " p-3 text-sm text-slate-800 dark:text-slate-200\">" +
        "<span class=\"flex items-start gap-2\">" +
        "<input type=\"checkbox\" class=\"report-action-check mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500\" data-action-index=\"" + key + "\" " + (checked ? "checked" : "") + ">" +
        "<span>" + escapeHtml(action) + "</span>" +
        "</span></label>";
    }).join("");

    var dayChecksHtml = DAY_KEYS.map(function (day) {
      var checked = !!dayChecks[day];
      return "<label class=\"inline-flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs " + (checked ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200" : "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200") + "\">" +
        "<input class=\"report-day-check rounded border-slate-300 text-emerald-600 focus:ring-emerald-500\" type=\"checkbox\" data-day=\"" + day + "\" " + (checked ? "checked" : "") + ">" +
        escapeHtml(day) + "</label>";
    }).join("");

    var actionDoneCount = ["0", "1", "2"].filter(function (key) { return !!actionChecks[key]; }).length;

    return [
      "<section class=\"rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900/40 p-4\">",
      "<div class=\"flex items-start justify-between gap-3\">",
      "<div><p class=\"text-xs font-semibold text-indigo-600 dark:text-indigo-300\">실행 대시보드</p><h3 class=\"mt-1 text-lg font-bold text-slate-900 dark:text-slate-100\">읽고 끝내지 말고 오늘 바로 실행하세요</h3></div>",
      "<div class=\"rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-3 py-2 text-right\"><p class=\"text-[11px] text-indigo-700 dark:text-indigo-300\">주간 진행률</p><p class=\"text-lg font-extrabold text-indigo-700 dark:text-indigo-200\">" + ratio + "%</p></div>",
      "</div>",
      "<div class=\"mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden\"><div class=\"h-full bg-gradient-to-r from-emerald-500 to-indigo-500\" style=\"width:" + ratio + "%\"></div></div>",
      "<div class=\"mt-3 grid gap-2 sm:grid-cols-3\">",
      "<div class=\"rounded-xl border border-slate-200 dark:border-slate-700 p-3\"><p class=\"text-xs text-slate-500 dark:text-slate-300\">연속 달성 streak</p><p class=\"mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100\">" + streak + "일</p></div>",
      "<div class=\"rounded-xl border border-slate-200 dark:border-slate-700 p-3\"><p class=\"text-xs text-slate-500 dark:text-slate-300\">완료한 Day</p><p class=\"mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100\">" + doneCount + " / 7</p></div>",
      "<div class=\"rounded-xl border border-slate-200 dark:border-slate-700 p-3\"><p class=\"text-xs text-slate-500 dark:text-slate-300\">오늘 액션</p><p class=\"mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100\">" + actionDoneCount + " / 3 완료</p></div>",
      "</div>",
      "<div class=\"mt-4\"><p class=\"text-xs font-semibold text-slate-600 dark:text-slate-300\">Day1 ~ Day7 체크리스트</p><div class=\"mt-2 flex flex-wrap gap-2\">" + dayChecksHtml + "</div></div>",
      "<div class=\"mt-4\"><p class=\"text-xs font-semibold text-slate-600 dark:text-slate-300\">오늘의 액션 3개</p><div class=\"mt-2 grid gap-2\">" + actionCards + "</div></div>",
      "</section>"
    ].join("");
  }

  function evaluateReportQuality(content, model) {
    var normalized = String(content || "").trim();
    var missing = [];
    if (!/\[요약\]/.test(normalized)) missing.push("요약");
    if (!/\[맞춤 추천\]/.test(normalized)) missing.push("맞춤 추천");
    if (!/\[7일 플랜\]/.test(normalized)) missing.push("7일 플랜");
    if (!/\[주의사항\]/.test(normalized)) missing.push("주의사항");

    var reasonCount = (normalized.match(/추천 이유\s*:/g) || []).length;
    var checkpointCount = (normalized.match(/체크포인트\s*:/g) || []).length;
    var guideCount = (normalized.match(/실행 가이드\s*:/g) || []).length;

    if (reasonCount < 3) missing.push("이유(추천 이유)");
    if (checkpointCount < 3) missing.push("체크포인트");
    if (guideCount < 3) missing.push("대체식/실행 가이드");

    var seen = {};
    var dedupedMissing = missing.filter(function (item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });

    return {
      isFallbackModel: /^fallback:/.test(String(model || "")),
      missing: dedupedMissing
    };
  }

  function renderQualityBadges(content, model) {
    var box = document.getElementById("report-quality-badges");
    if (!box) return;
    var quality = evaluateReportQuality(content, model);

    var badges = [];
    if (quality.isFallbackModel) {
      badges.push("<span class=\"inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200\">Fallback 리포트</span>");
    }

    if (quality.missing.length > 0) {
      badges.push("<span class=\"inline-flex items-center rounded-full border border-rose-300 bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-800 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200\">품질 경고: " + escapeHtml(quality.missing.join(", ")) + " 누락 가능</span>");
    } else {
      badges.push("<span class=\"inline-flex items-center rounded-full border border-emerald-300 bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200\">품질 체크 통과</span>");
    }

    box.innerHTML = badges.join("");
  }

  function bindInteractiveReportUi() {
    var dayChecks = document.querySelectorAll(".report-day-check");
    dayChecks.forEach(function (check) {
      check.addEventListener("change", function (event) {
        var target = event.target;
        var day = target && target.getAttribute("data-day");
        if (!day) return;
        var state = getProgressState();
        state.dayChecks[day] = !!target.checked;
        setProgressState(state);
        renderReport(resultContext.reportText, resultContext.model);
      });
    });

    var actionChecks = document.querySelectorAll(".report-action-check");
    actionChecks.forEach(function (check) {
      check.addEventListener("change", function (event) {
        var target = event.target;
        var idx = target && target.getAttribute("data-action-index");
        if (idx == null) return;
        var state = getProgressState();
        state.actions[String(idx)] = !!target.checked;
        setProgressState(state);
        renderReport(resultContext.reportText, resultContext.model);
      });
    });
  }

  function buildFriendlyReportHtml(content) {
    var sections = parseSections(content);
    var dashboardHtml = buildExecutionDashboard(content, sections);
    var summaryHtml = renderSummary(sections["요약"] || []);
    var recoHtml = renderRecommendations(sections["맞춤 추천"] || []);
    var planHtml = renderDayPlans(sections["7일 플랜"] || []);
    var warnHtml = renderWarnings(sections["주의사항"] || []);

    if (!summaryHtml && !recoHtml && !planHtml && !warnHtml) {
      return [
        dashboardHtml,
        "<pre class=\"mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed font-sans\">" + escapeHtml(content) + "</pre>"
      ].join("");
    }

    return [
      "<div class=\"mb-4 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 p-[1px]\">",
      "<div class=\"rounded-xl bg-white dark:bg-slate-900/70 px-4 py-3\">",
      "<p class=\"text-sm font-semibold text-slate-900 dark:text-slate-100\">좋은 리포트는 실행할 때 가치가 생깁니다.</p>",
      "<p class=\"mt-1 text-xs text-slate-600 dark:text-slate-300\">오늘 액션 3개부터 시작하고, Day1~Day7 체크를 쌓아 루틴을 완성하세요.</p>",
      "</div></div>",
      "<div class=\"space-y-4\">",
      dashboardHtml,
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
    renderQualityBadges(resultContext.reportText, resultContext.model);
    bindInteractiveReportUi();
  }

  function renderFallbackPreview() {
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
      "[맞춤 추천]",
      "1) 단백질 1 + 채소 2 + 탄수화물 1 기본 공식을 유지",
      "- 추천 이유: 식사 구조를 고정하면 실행 난이도를 크게 낮출 수 있습니다.",
      "- 실행 가이드: 오늘 한 끼부터 식판 구성을 미리 정해두세요.",
      "",
      "[7일 플랜]",
      "- Day1: 아침 단백질 고정",
      "  체크포인트: 냉장고에 단백질 식재료를 먼저 배치",
      "",
      "[주의사항]",
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

  function setActionStatus(message, isError) {
    var status = document.getElementById("result-action-status");
    if (!status) return;
    status.textContent = message;
    status.classList.remove("text-red-500", "dark:text-red-300", "text-emerald-600", "dark:text-emerald-300", "text-slate-500", "dark:text-slate-400");
    if (isError) {
      status.classList.add("text-red-500", "dark:text-red-300");
    } else if (message) {
      status.classList.add("text-emerald-600", "dark:text-emerald-300");
    } else {
      status.classList.add("text-slate-500", "dark:text-slate-400");
    }
  }

  function setButtonBusy(button, labelId, busy, busyText, idleText) {
    if (!button) return;
    var label = labelId ? document.getElementById(labelId) : null;
    if (busy) {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      if (label) label.textContent = busyText;
      return;
    }
    button.disabled = false;
    button.setAttribute("aria-busy", "false");
    if (label) label.textContent = idleText;
  }

  async function requestImmediateEmailSend() {
    var keyBase = resultContext.orderId || resultContext.checkoutId || "";
    if (!keyBase) return;

    var sentKey = getAutoEmailSentKey();
    if (window.sessionStorage.getItem(sentKey) === "1") return;
    window.sessionStorage.setItem(sentKey, "1");

    try {
      var data = await requestResend();
      trackAnalytics("report_resent", {
        source: "report_result_auto",
        queued: !!(data && data.queued)
      });
      if (data && data.queued) {
        setActionStatus("리포트가 결제 이메일로 발송되었습니다.", false);
        return;
      }
      window.sessionStorage.removeItem(sentKey);
      setActionStatus("이메일 발송 요청 실패: " + ((data && data.reason) || "unknown"), true);
    } catch (error) {
      trackAnalytics("report_resent", {
        source: "report_result_auto",
        queued: false,
        reason: (error && error.message) || "request_failed"
      });
      window.sessionStorage.removeItem(sentKey);
      setActionStatus((error && error.message) || "이메일 발송 요청 중 오류가 발생했습니다.", true);
    }
  }

  async function runFlow() {
    var params = new URLSearchParams(window.location.search);
    var payment = params.get("payment");
    resultContext.checkoutId = String(params.get("checkout_id") || "");
    resultContext.orderId = String(params.get("order_id") || "");
    trackAnalytics("report_result_viewed", {
      payment: payment || "",
      hasCheckoutId: !!resultContext.checkoutId,
      hasOrderId: !!resultContext.orderId
    });

    if (payment === "return") {
      setFlowState("failed", "결제가 완료되지 않았습니다. 결제 화면으로 돌아가 다시 시도해 주세요.", { showNextActions: true });
      renderReport("결제가 취소되었거나 중단되었습니다.\n\n다시 결제를 진행해 주세요.", "fallback:payment_return");
      return;
    }

    if (!resultContext.checkoutId && !resultContext.orderId) {
      setFlowState("failed", "결제 식별자가 없어 결과를 불러올 수 없습니다.", { showNextActions: true });
      renderReport("checkout_id 또는 order_id가 필요합니다.", "fallback:missing_identifier");
      return;
    }

    try {
      setFlowState("checking", "결제 상태를 확인 중입니다...");
      var statusResult = await fetchPaymentStatus();
      setHints();

      var paid = statusResult.status === "paid" || statusResult.status === "succeeded" || statusResult.status === "confirmed";
      if (paid) {
        trackAnalytics("payment_success", {
          source: "report_result_status",
          status: statusResult.status,
          type: statusResult.type || "unknown"
        });
      }
      if (!paid) {
        setFlowState("failed", "결제 상태가 완료가 아닙니다: " + statusResult.status, { showNextActions: true });
        renderReport("결제 상태: " + statusResult.status + "\n결제가 완료되면 리포트가 생성됩니다.", "fallback:order_not_paid");
        return;
      }

      setFlowState("generating", "결제 확인 완료. 리포트 결과를 생성 중입니다...");
      var preview = await fetchPremiumReportPreview();
      if (preview.ok && preview.report) {
        if (preview.customerEmail) resultContext.customerEmail = String(preview.customerEmail);
        setHints();

        var reportContent = String(preview.report || "");
        var reportModel = String(preview.model || "");
        renderReport(reportContent, reportModel);
        trackAnalytics("report_generated_completed", {
          source: "report_result_preview",
          model: reportModel
        });

        var quality = evaluateReportQuality(reportContent, reportModel);
        if (quality.isFallbackModel || quality.missing.length > 0) {
          setFlowState("preview", "리포트 품질 검증 경고가 있어 미리보기 상태로 표시합니다. 이메일 재전송 또는 재시도를 진행해 주세요.");
        } else {
          setFlowState("done", "리포트 생성이 완료되었습니다. 아래에서 바로 확인할 수 있습니다.");
        }
      } else {
        renderFallbackPreview();
        setFlowState("preview", "리포트 생성이 지연되고 있어 fallback 미리보기를 먼저 표시합니다.");
      }

      await requestImmediateEmailSend();
    } catch (error) {
      renderFallbackPreview();
      setFlowState("failed", "리포트 조회 중 오류가 발생했습니다. 아래 미리보기를 참고해 주세요.", { showNextActions: true });
      setActionStatus((error && error.message) || "리포트 조회 오류", true);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var shareBtn = document.getElementById("result-share-btn");
    var saveBtn = document.getElementById("result-save-btn");
    var resendBtn = document.getElementById("result-resend-btn");
    var retryBtn = document.getElementById("result-retry-btn");

    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        setButtonBusy(shareBtn, "result-share-btn-label", true, "공유 중...", "공유하기");
        shareReport()
          .then(function () {
            setActionStatus("리포트 공유가 완료되었습니다.", false);
          })
          .catch(function () {
            setActionStatus("공유에 실패했습니다.", true);
          })
          .finally(function () {
            setButtonBusy(shareBtn, "result-share-btn-label", false, "공유 중...", "공유하기");
          });
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        setButtonBusy(saveBtn, "result-save-btn-label", true, "PDF 저장 중...", "저장하기");
        saveReportAsPdf()
          .then(function () {
            trackAnalytics("report_pdf_saved", { success: true });
            setActionStatus("리포트 PDF 저장이 완료되었습니다.", false);
          })
          .catch(function (error) {
            trackAnalytics("report_pdf_saved", {
              success: false,
              reason: (error && error.message) || "save_failed"
            });
            var reason = (error && error.message) || "PDF 저장에 실패했습니다.";
            setActionStatus(reason + " 다운로드 권한/팝업 차단을 확인하고 다시 시도해 주세요.", true);
          })
          .finally(function () {
            setButtonBusy(saveBtn, "result-save-btn-label", false, "PDF 저장 중...", "저장하기");
          });
      });
    }

    if (resendBtn) {
      resendBtn.addEventListener("click", function () {
        setButtonBusy(resendBtn, "result-resend-btn-label", true, "재전송 요청 중...", "이메일로 보내기");
        setActionStatus("이메일 발송 요청 중입니다...", false);
        requestResend()
          .then(function (data) {
            trackAnalytics("report_resent", {
              source: "report_result_manual",
              queued: !!(data && data.queued)
            });
            if (data && data.queued) {
              setActionStatus("이메일 발송 요청이 접수되었습니다. 받은함/스팸함을 확인해 주세요.", false);
            } else {
              setActionStatus("이메일 발송 요청 실패: " + ((data && data.reason) || "unknown"), true);
            }
          })
          .catch(function (error) {
            trackAnalytics("report_resent", {
              source: "report_result_manual",
              queued: false,
              reason: (error && error.message) || "request_failed"
            });
            setActionStatus((error && error.message) || "이메일 발송 요청 중 오류가 발생했습니다.", true);
          })
          .finally(function () {
            setButtonBusy(resendBtn, "result-resend-btn-label", false, "재전송 요청 중...", "이메일로 보내기");
          });
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener("click", function () {
        setActionStatus("상태를 다시 조회합니다...", false);
        runFlow();
      });
    }

    runFlow();
  });
})();
