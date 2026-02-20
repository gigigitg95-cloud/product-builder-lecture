(function () {
  "use strict";

  var DAYS = 7;
  var SUMMARY_TEXT = {
    diet: "다이어트 중심으로 가벼운 구성(단백질 우선)으로 생성했습니다.",
    maintain: "유지 목적의 균형 식단으로 생성했습니다.",
    gain: "증량 목적의 에너지 보강 식단으로 생성했습니다."
  };

  var MEAL_CATALOG = {
    breakfast: [
      { name: "그릭요거트 볼", goals: ["diet", "maintain"], ingredients: ["그릭요거트", "블루베리", "그래놀라"], note: "단백질과 섬유질 균형" },
      { name: "오트밀 + 바나나", goals: ["diet", "maintain", "gain"], ingredients: ["오트밀", "우유", "바나나"], note: "포만감 유지" },
      { name: "달걀 스크램블 토스트", goals: ["maintain", "gain"], ingredients: ["달걀", "통밀빵", "토마토"], note: "아침 에너지 보강" },
      { name: "두부 샐러드", goals: ["diet"], ingredients: ["두부", "양상추", "올리브오일"], note: "저칼로리 단백질" },
      { name: "땅콩버터 바나나 샌드", goals: ["gain"], ingredients: ["통밀빵", "땅콩버터", "바나나"], note: "탄수/지방 보강" },
      { name: "아보카도 계란 랩", goals: ["maintain", "gain"], ingredients: ["또띠아", "아보카도", "달걀"], note: "균형잡힌 지방 공급" }
    ],
    lunch: [
      { name: "닭가슴살 샐러드", goals: ["diet", "maintain"], ingredients: ["닭가슴살", "양상추", "방울토마토"], note: "가벼운 점심" },
      { name: "현미 비빔볼", goals: ["diet", "maintain"], ingredients: ["현미밥", "시금치", "버섯", "계란"], note: "균형 영양" },
      { name: "불고기 덮밥", goals: ["maintain", "gain"], ingredients: ["소고기", "양파", "쌀밥"], note: "활동량 높은 날 추천" },
      { name: "연어 포케", goals: ["diet", "maintain"], ingredients: ["연어", "현미밥", "오이", "아보카도"], note: "오메가3 보강" },
      { name: "치킨 파스타", goals: ["gain"], ingredients: ["파스타면", "닭가슴살", "브로콜리"], note: "탄수/단백질 동시 보강" },
      { name: "두부 버섯덮밥", goals: ["diet", "maintain"], ingredients: ["두부", "버섯", "현미밥"], note: "식물성 단백질 선택" }
    ],
    dinner: [
      { name: "두부 김치볶음 + 밥", goals: ["diet", "maintain"], ingredients: ["두부", "김치", "쌀밥"], note: "저녁 부담 완화" },
      { name: "연어 스테이크 + 채소", goals: ["diet", "maintain"], ingredients: ["연어", "아스파라거스", "올리브오일"], note: "고단백 저녁" },
      { name: "소고기 야채볶음", goals: ["maintain", "gain"], ingredients: ["소고기", "파프리카", "양파"], note: "단백질 중심 저녁" },
      { name: "닭다리살 구이 + 고구마", goals: ["maintain", "gain"], ingredients: ["닭다리살", "고구마", "샐러드채소"], note: "포만감 높은 구성" },
      { name: "참치 샐러드 랩", goals: ["diet"], ingredients: ["참치", "또띠아", "양상추"], note: "간단하고 가벼운 저녁" },
      { name: "크림 리조또 + 닭가슴살", goals: ["gain"], ingredients: ["쌀", "우유", "닭가슴살", "버섯"], note: "열량 보강" }
    ]
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setStatus(message, isError) {
    var status = byId("light-plan-status");
    if (!status) return;
    status.textContent = message || "";
    status.classList.remove("text-red-500", "dark:text-red-400", "text-slate-500", "dark:text-slate-400");
    if (isError) {
      status.classList.add("text-red-500", "dark:text-red-400");
    } else {
      status.classList.add("text-slate-500", "dark:text-slate-400");
    }
  }

  function normalizeAllergies(input) {
    return String(input || "")
      .split(/[,\n/]/)
      .map(function (v) { return v.trim().toLowerCase(); })
      .filter(Boolean);
  }

  function parseCsvToList(value) {
    return String(value || "")
      .split(/[,\n/]/)
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function mapProfileGoalToLightGoal(goal) {
    var text = String(goal || "").toLowerCase();
    if (!text) return "maintain";
    if (text.indexOf("감량") !== -1 || text.indexOf("다이어트") !== -1 || text.indexOf("diet") !== -1 || text.indexOf("cut") !== -1) {
      return "diet";
    }
    if (text.indexOf("증량") !== -1 || text.indexOf("근육") !== -1 || text.indexOf("벌크") !== -1 || text.indexOf("gain") !== -1 || text.indexOf("bulk") !== -1) {
      return "gain";
    }
    return "maintain";
  }

  function mapLightGoalToProfileGoal(goal) {
    if (goal === "diet") return "다이어트";
    if (goal === "gain") return "증량";
    return "유지";
  }

  function applyProfileDefaults(profile) {
    var goalInput = byId("light-goal");
    var allergyInput = byId("light-allergies");
    if (goalInput && profile && profile.goal) {
      goalInput.value = mapProfileGoalToLightGoal(profile && profile.goal);
    }
    if (allergyInput && !String(allergyInput.value || "").trim() && profile && Array.isArray(profile.allergies) && profile.allergies.length) {
      allergyInput.value = profile.allergies.join(", ");
    }
  }

  async function hydrateProfileDefaults() {
    if (!window.NinanooProfileStore || typeof window.NinanooProfileStore.loadEffectiveProfile !== "function") return;
    var resolved = await window.NinanooProfileStore.loadEffectiveProfile({ preferServer: true }).catch(function () { return null; });
    if (!resolved || !resolved.profile) return;
    applyProfileDefaults(resolved.profile);
    if (resolved.mode === "user") {
      setStatus("로그인 프로필(서버+캐시) 기본값을 반영했습니다.", false);
    } else {
      setStatus("게스트 저장값(localStorage) 기본값을 반영했습니다.", false);
    }
  }

  async function syncProfileCacheFromLightForm(goalValue, allergyValue) {
    if (!window.NinanooProfileStore || typeof window.NinanooProfileStore.loadEffectiveProfile !== "function") return;
    var partial = {
      goal: mapLightGoalToProfileGoal(goalValue || "maintain"),
      allergies: parseCsvToList(allergyValue || ""),
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

  function isAllergySafe(meal, allergyTokens) {
    if (!allergyTokens.length) return true;
    var haystack = [meal.name].concat(meal.ingredients || []).join(" ").toLowerCase();
    return !allergyTokens.some(function (token) { return haystack.indexOf(token) !== -1; });
  }

  function pickMeal(pool, usedNames, fallbackPool) {
    var available = pool.filter(function (meal) { return !usedNames.has(meal.name); });
    var source = available.length > 0 ? available : pool;
    if (!source.length) source = fallbackPool || [];
    if (!source.length) return null;
    var selected = source[Math.floor(Math.random() * source.length)];
    usedNames.add(selected.name);
    return selected;
  }

  function createDayPlan(goal, mealsPerDay, allergyTokens) {
    var usedNames = new Set();
    var dayPlans = [];

    for (var i = 0; i < DAYS; i += 1) {
      var breakfastPool = MEAL_CATALOG.breakfast.filter(function (meal) {
        return meal.goals.indexOf(goal) !== -1 && isAllergySafe(meal, allergyTokens);
      });
      var lunchPool = MEAL_CATALOG.lunch.filter(function (meal) {
        return meal.goals.indexOf(goal) !== -1 && isAllergySafe(meal, allergyTokens);
      });
      var dinnerPool = MEAL_CATALOG.dinner.filter(function (meal) {
        return meal.goals.indexOf(goal) !== -1 && isAllergySafe(meal, allergyTokens);
      });

      var breakfast = mealsPerDay === 3
        ? pickMeal(breakfastPool, usedNames, MEAL_CATALOG.breakfast)
        : { name: "건너뜀(2식 설정)", ingredients: [], note: "2식 기준으로 점심/저녁에 집중" };
      var lunch = pickMeal(lunchPool, usedNames, MEAL_CATALOG.lunch);
      var dinner = pickMeal(dinnerPool, usedNames, MEAL_CATALOG.dinner);

      if (!lunch || !dinner || !breakfast) {
        return null;
      }

      dayPlans.push({
        day: i + 1,
        breakfast: breakfast,
        lunch: lunch,
        dinner: dinner,
        note: (i % 2 === 0) ? "균형 위주 구성" : "포만감/지속력 위주 구성"
      });
    }

    return dayPlans;
  }

  function renderDays(dayPlans) {
    var grid = byId("light-days-grid");
    if (!grid) return;
    grid.innerHTML = "";

    dayPlans.forEach(function (day) {
      var card = document.createElement("article");
      card.className = "rounded-2xl border border-slate-200 dark:border-indigo-700 bg-slate-50 dark:bg-indigo-950/50 p-4";
      card.innerHTML = [
        '<h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">Day ' + day.day + '</h3>',
        '<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">' + day.note + '</p>',
        '<ul class="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-200">',
        '<li><strong>아침:</strong> ' + day.breakfast.name + '</li>',
        '<li><strong>점심:</strong> ' + day.lunch.name + '</li>',
        '<li><strong>저녁:</strong> ' + day.dinner.name + '</li>',
        "</ul>"
      ].join("");
      grid.appendChild(card);
    });
  }

  function buildShoppingList(dayPlans) {
    var grouped = {
      단백질: new Set(),
      탄수화물: new Set(),
      "채소/과일": new Set(),
      기타: new Set()
    };

    function classify(item) {
      var value = String(item || "");
      if (/닭|소고기|연어|참치|두부|달걀/.test(value)) return "단백질";
      if (/밥|파스타|고구마|빵|또띠아|오트밀|그래놀라/.test(value)) return "탄수화물";
      if (/토마토|양파|양상추|브로콜리|아보카도|오이|버섯|시금치|바나나|블루베리|김치|파프리카|아스파라거스/.test(value)) return "채소/과일";
      return "기타";
    }

    dayPlans.forEach(function (day) {
      [day.breakfast, day.lunch, day.dinner].forEach(function (meal) {
        (meal.ingredients || []).forEach(function (ingredient) {
          grouped[classify(ingredient)].add(ingredient);
        });
      });
    });

    return grouped;
  }

  function renderShoppingList(grouped) {
    var grid = byId("light-shopping-grid");
    if (!grid) return;
    grid.innerHTML = "";

    Object.keys(grouped).forEach(function (category) {
      var items = Array.from(grouped[category]);
      if (!items.length) return;
      var card = document.createElement("section");
      card.className = "rounded-2xl border border-slate-200 dark:border-indigo-700 bg-slate-50 dark:bg-indigo-950/50 p-4";
      var list = items.map(function (item) {
        return '<li class="text-sm text-slate-700 dark:text-slate-200">' + item + "</li>";
      }).join("");
      card.innerHTML = '<h3 class="text-sm font-bold text-slate-800 dark:text-slate-100">' + category + '</h3><ul class="mt-2 space-y-1">' + list + "</ul>";
      grid.appendChild(card);
    });
  }

  function runLightPlanGeneration(event) {
    event.preventDefault();
    var start = performance.now();

    var goal = byId("light-goal").value || "maintain";
    var meals = Number(byId("light-meals").value || "3");
    var allergyInputValue = byId("light-allergies").value;
    var allergyTokens = normalizeAllergies(allergyInputValue);
    var plans = createDayPlan(goal, meals, allergyTokens);

    if (!plans) {
      setStatus("알레르기 조건이 너무 많아 생성에 실패했습니다. 알레르기 키워드를 줄여 다시 시도해 주세요.", true);
      return;
    }

    renderDays(plans);
    renderShoppingList(buildShoppingList(plans));

    byId("light-plan-result").classList.remove("hidden");
    byId("light-shopping-result").classList.remove("hidden");
    byId("light-upsell").classList.remove("hidden");

    var elapsed = Math.max(1, Math.round(performance.now() - start));
    byId("light-plan-summary").textContent = (SUMMARY_TEXT[goal] || SUMMARY_TEXT.maintain) + " 생성 시간: " + elapsed + "ms";
    setStatus("무료 라이트 식단 생성이 완료되었습니다.", false);
    syncProfileCacheFromLightForm(goal, allergyInputValue).catch(function () { return null; });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    var form = byId("light-plan-form");
    if (!form) return;
    await hydrateProfileDefaults();
    form.addEventListener("submit", runLightPlanGeneration);
  });
})();
