(function () {
  "use strict";

  var STORAGE_KEY = "ninanooPremiumReportDraft";
  var PAYMENT_PATH = "/pages/payment.html";
  var currentStep = 1;
  var TOTAL_STEPS = 4;

  function sanitizeField(value, maxLen) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLen);
  }

  function sanitizeNumber(value, min, max) {
    var n = Number(value);
    if (!Number.isFinite(n)) return "";
    if (Number.isFinite(min) && n < min) return "";
    if (Number.isFinite(max) && n > max) return "";
    return String(n);
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function trackAnalytics(eventName, props) {
    if (!window.NinanooAnalytics || typeof window.NinanooAnalytics.track !== "function") return;
    window.NinanooAnalytics.track(eventName, props || {});
  }

  function parseCsvToList(value) {
    return String(value || "")
      .split(/[,\n/]/)
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
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
    return {
      report_goal: sanitizeField(byId("report-goal") && byId("report-goal").value, 100),
      report_period_weeks: sanitizeNumber(byId("report-period-weeks") && byId("report-period-weeks").value, 1, 52),
      report_height_cm: sanitizeNumber(byId("report-height-cm") && byId("report-height-cm").value, 120, 220),
      report_weight_kg: sanitizeNumber(byId("report-weight-kg") && byId("report-weight-kg").value, 35, 200),
      report_activity_level: sanitizeField(byId("report-activity-level") && byId("report-activity-level").value, 20),
      report_weekly_workouts: sanitizeNumber(byId("report-weekly-workouts") && byId("report-weekly-workouts").value, 0, 14),
      report_daily_steps: sanitizeNumber(byId("report-daily-steps") && byId("report-daily-steps").value, 0, 50000),
      report_allergies: sanitizeField(byId("report-allergies") && byId("report-allergies").value, 120),
      report_avoid_ingredients: sanitizeField(byId("report-avoid") && byId("report-avoid").value, 120),
      report_dietary_restrictions: sanitizeField(byId("report-dietary-restrictions") && byId("report-dietary-restrictions").value, 120),
      report_preferred_categories: sanitizeField(byId("report-preferred") && byId("report-preferred").value, 120),
      report_budget_level: sanitizeField(byId("report-budget-level") && byId("report-budget-level").value, 30),
      report_cooking_environment: sanitizeField(byId("report-cooking-environment") && byId("report-cooking-environment").value, 40),
      report_note: sanitizeField(byId("report-note") && byId("report-note").value, 300),
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
      ["report-period-weeks", "report_period_weeks"],
      ["report-height-cm", "report_height_cm"],
      ["report-weight-kg", "report_weight_kg"],
      ["report-activity-level", "report_activity_level"],
      ["report-weekly-workouts", "report_weekly_workouts"],
      ["report-daily-steps", "report_daily_steps"],
      ["report-allergies", "report_allergies"],
      ["report-avoid", "report_avoid_ingredients"],
      ["report-dietary-restrictions", "report_dietary_restrictions"],
      ["report-preferred", "report_preferred_categories"],
      ["report-budget-level", "report_budget_level"],
      ["report-cooking-environment", "report_cooking_environment"],
      ["report-note", "report_note"]
    ];

    map.forEach(function (item) {
      var el = byId(item[0]);
      if (el && typeof draft[item[1]] === "string") {
        el.value = draft[item[1]];
      }
    });
  }

  function applyProfileDefaults(profile) {
    var resolved = profile || {};
    var defaults = {
      "report-goal": resolved.goal || "",
      "report-allergies": Array.isArray(resolved.allergies) ? resolved.allergies.join(", ") : "",
      "report-avoid": Array.isArray(resolved.dislikedIngredients) ? resolved.dislikedIngredients.join(", ") : "",
      "report-preferred": Array.isArray(resolved.preferredCategories) ? resolved.preferredCategories.join(", ") : ""
    };

    Object.keys(defaults).forEach(function (id) {
      var el = byId(id);
      if (!el || String(el.value || "").trim()) return;
      if (defaults[id]) {
        el.value = defaults[id];
      }
    });
  }

  async function hydrateProfileDefaults(statusEl) {
    if (!window.NinanooProfileStore || typeof window.NinanooProfileStore.loadEffectiveProfile !== "function") return;
    var result = await window.NinanooProfileStore.loadEffectiveProfile({ preferServer: true }).catch(function () { return null; });
    if (!result || !result.profile) return;
    applyProfileDefaults(result.profile);
    if (statusEl) {
      setStatus(
        statusEl,
        result.mode === "user"
          ? "로그인 프로필(서버+캐시) 기본값을 반영했습니다."
          : "게스트 저장값(localStorage) 기본값을 반영했습니다.",
        false
      );
    }
  }

  async function syncProfileCacheFromDraft(draft) {
    if (!window.NinanooProfileStore || typeof window.NinanooProfileStore.loadEffectiveProfile !== "function") return;
    var partial = {
      goal: draft.report_goal || "",
      allergies: parseCsvToList(draft.report_allergies || ""),
      dislikedIngredients: parseCsvToList(draft.report_avoid_ingredients || ""),
      preferredCategories: parseCsvToList(draft.report_preferred_categories || ""),
      updatedAt: new Date().toISOString()
    };
    var resolved = await window.NinanooProfileStore.loadEffectiveProfile({ preferServer: false }).catch(function () { return null; });
    if (!resolved || resolved.mode === "guest") {
      window.NinanooProfileStore.setGuestProfile(partial);
      return;
    }
    if (resolved.userId) {
      window.NinanooProfileStore.setUserProfileCache(resolved.userId, partial, { merge: true });
    }
  }

  function calculateQualityScore(draft) {
    var score = 0;
    if (draft.report_period_weeks) score += 10;
    if (draft.report_height_cm) score += 10;
    if (draft.report_weight_kg) score += 10;
    if (draft.report_activity_level) score += 15;
    if (draft.report_weekly_workouts) score += 10;
    if (draft.report_daily_steps) score += 10;
    if (draft.report_dietary_restrictions) score += 10;
    if (draft.report_preferred_categories) score += 10;
    if (draft.report_budget_level) score += 5;
    if (draft.report_cooking_environment) score += 10;
    return Math.min(100, score);
  }

  function updateQualityScore() {
    var draft = collectDraft();
    var score = calculateQualityScore(draft);
    var label = byId("intake-quality-score");
    var bar = byId("intake-quality-bar");
    if (label) label.textContent = "권장 입력 " + score + "%";
    if (bar) bar.style.width = score + "%";
  }

  function toggleActivityFollowup(forceShow) {
    var box = byId("activity-followup-box");
    if (!box) return;
    var activity = sanitizeField(byId("report-activity-level") && byId("report-activity-level").value, 20);
    var workouts = sanitizeNumber(byId("report-weekly-workouts") && byId("report-weekly-workouts").value, 0, 14);
    var steps = sanitizeNumber(byId("report-daily-steps") && byId("report-daily-steps").value, 0, 50000);
    var shouldShow = !!forceShow || (!activity && !workouts && !steps);
    box.classList.toggle("hidden", !shouldShow);
  }

  function showStep(step) {
    var indicator = byId("intake-step-indicator");
    var prev = byId("intake-prev-step");
    var next = byId("intake-next-step");
    var submit = byId("go-payment-button");
    var sections = document.querySelectorAll(".intake-step");

    currentStep = Math.max(1, Math.min(TOTAL_STEPS, step));
    sections.forEach(function (section) {
      var isTarget = Number(section.getAttribute("data-step")) === currentStep;
      section.classList.toggle("hidden", !isTarget);
    });

    if (indicator) indicator.textContent = "Step " + currentStep + " / " + TOTAL_STEPS;
    if (prev) prev.disabled = currentStep === 1;
    if (next) next.classList.toggle("hidden", currentStep === TOTAL_STEPS);
    if (submit) submit.classList.toggle("hidden", currentStep !== TOTAL_STEPS);

    if (currentStep === 2) toggleActivityFollowup(false);
  }

  function validateStep(step, statusEl) {
    var draft = collectDraft();
    if (step === 1) {
      if (!draft.report_goal) {
        setStatus(statusEl, "목표는 필수 입력입니다.", true);
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!draft.report_activity_level && !draft.report_weekly_workouts && !draft.report_daily_steps) {
        toggleActivityFollowup(true);
        setStatus(statusEl, "활동량 정보가 부족합니다. 추가 질문(운동 횟수/걸음 수) 중 1개 이상 입력해 주세요.", true);
        return false;
      }
      return true;
    }
    return true;
  }

  function bindStepEvents(statusEl) {
    var prev = byId("intake-prev-step");
    var next = byId("intake-next-step");
    if (prev) {
      prev.addEventListener("click", function () {
        setStatus(statusEl, "", false);
        showStep(currentStep - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        if (!validateStep(currentStep, statusEl)) return;
        trackAnalytics("report_intake_step_completed", { step: currentStep });
        setStatus(statusEl, "", false);
        showStep(currentStep + 1);
      });
    }
  }

  function bindLiveQualityUpdate() {
    var fields = [
      "report-goal",
      "report-period-weeks",
      "report-height-cm",
      "report-weight-kg",
      "report-activity-level",
      "report-weekly-workouts",
      "report-daily-steps",
      "report-allergies",
      "report-avoid",
      "report-dietary-restrictions",
      "report-preferred",
      "report-budget-level",
      "report-cooking-environment",
      "report-note"
    ];
    fields.forEach(function (id) {
      var el = byId(id);
      if (!el) return;
      el.addEventListener("input", function () {
        if (id === "report-activity-level" || id === "report-weekly-workouts" || id === "report-daily-steps") {
          toggleActivityFollowup(false);
        }
        updateQualityScore();
      });
      el.addEventListener("change", function () {
        if (id === "report-activity-level" || id === "report-weekly-workouts" || id === "report-daily-steps") {
          toggleActivityFollowup(false);
        }
        updateQualityScore();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    var form = byId("report-intake-form");
    var status = byId("report-intake-status");
    var button = byId("go-payment-button");

    fillDraft();
    trackAnalytics("report_intake_viewed", { source: "report-intake-page" });
    await hydrateProfileDefaults(status);
    updateQualityScore();
    showStep(1);
    bindStepEvents(status);
    bindLiveQualityUpdate();

    if (!form || !button) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (button.disabled) return;

      if (!validateStep(currentStep, status)) return;

      var draft = collectDraft();
      if (!draft.report_goal) {
        setStatus(status, "목표는 필수 입력입니다.", true);
        return;
      }

      button.disabled = true;
      setStatus(status, "입력값 저장 후 결제 페이지로 이동합니다...", false);
      trackAnalytics("payment_started", {
        source: "report_intake_submit",
        step: currentStep
      });

      try {
        saveDraft(draft);
        syncProfileCacheFromDraft(draft).catch(function () { return null; });
        window.location.href = PAYMENT_PATH + "?from=report-intake";
      } catch (error) {
        setStatus(status, "입력값 저장에 실패했습니다. 다시 시도해 주세요.", true);
        button.disabled = false;
      }
    });
  });
})();
