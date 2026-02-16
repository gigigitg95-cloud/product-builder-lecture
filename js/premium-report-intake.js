(function () {
  "use strict";

  var STORAGE_KEY = "ninanooPremiumReportDraft";
  var PAYMENT_PATH = "/pages/payment.html";

  function sanitizeField(value, maxLen) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLen);
  }

  function setStatus(el, message, isError) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove("text-red-500", "dark:text-red-400", "text-slate-500", "dark:text-slate-400");
    if (isError) {
      el.classList.add("text-red-500", "dark:text-red-400");
    } else {
      el.classList.add("text-slate-500", "dark:text-slate-400");
    }
  }

  function collectDraft() {
    var goal = sanitizeField(document.getElementById("report-goal") && document.getElementById("report-goal").value, 100);
    var allergies = sanitizeField(document.getElementById("report-allergies") && document.getElementById("report-allergies").value, 120);
    var avoid = sanitizeField(document.getElementById("report-avoid") && document.getElementById("report-avoid").value, 120);
    var preferred = sanitizeField(document.getElementById("report-preferred") && document.getElementById("report-preferred").value, 120);
    var note = sanitizeField(document.getElementById("report-note") && document.getElementById("report-note").value, 300);

    return {
      report_goal: goal,
      report_allergies: allergies,
      report_avoid_ingredients: avoid,
      report_preferred_categories: preferred,
      report_note: note,
      draft_saved_at: new Date().toISOString()
    };
  }

  function saveDraft(draft) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }

  function loadDraft() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function fillDraft() {
    var draft = loadDraft();
    if (!draft || typeof draft !== "object") return;

    var map = [
      ["report-goal", "report_goal"],
      ["report-allergies", "report_allergies"],
      ["report-avoid", "report_avoid_ingredients"],
      ["report-preferred", "report_preferred_categories"],
      ["report-note", "report_note"]
    ];

    map.forEach(function (item) {
      var el = document.getElementById(item[0]);
      if (el && typeof draft[item[1]] === "string") {
        el.value = draft[item[1]];
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("report-intake-form");
    var status = document.getElementById("report-intake-status");
    var button = document.getElementById("go-payment-button");

    fillDraft();
    if (!form || !button) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (button.disabled) return;

      var draft = collectDraft();
      if (!draft.report_goal) {
        setStatus(status, "목표는 필수 입력입니다.", true);
        return;
      }

      button.disabled = true;
      setStatus(status, "입력값 저장 후 결제 페이지로 이동합니다...", false);

      try {
        saveDraft(draft);
        window.location.href = PAYMENT_PATH + "?from=report-intake";
      } catch (error) {
        setStatus(status, "입력값 저장에 실패했습니다. 다시 시도해 주세요.", true);
        button.disabled = false;
      }
    });
  });
})();
