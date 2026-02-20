(function (global) {
  "use strict";

  var ACTIVE_MODE_KEY = "ninanoo.profile.activeMode.v1";
  var GUEST_PROFILE_KEY = "ninanoo.profile.guest.v1";
  var USER_PROFILE_PREFIX = "ninanoo.profile.user.v1:";

  function safeTrim(value, maxLen) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLen || 120);
  }

  function normalizeList(value, maxItems) {
    var list = [];
    if (Array.isArray(value)) {
      list = value;
    } else if (typeof value === "string") {
      list = value.split(/[,\n/]/);
    }
    return list
      .map(function (item) { return safeTrim(item, 40); })
      .filter(Boolean)
      .slice(0, maxItems || 20);
  }

  function normalizeProfile(input) {
    var raw = input || {};
    return {
      goal: safeTrim(raw.goal, 100),
      allergies: normalizeList(raw.allergies, 20),
      dislikedIngredients: normalizeList(raw.dislikedIngredients || raw.disliked_ingredients, 20),
      preferredCategories: normalizeList(raw.preferredCategories || raw.preferred_categories, 20),
      updatedAt: safeTrim(raw.updatedAt || new Date().toISOString(), 40)
    };
  }

  function toCsv(list) {
    return Array.isArray(list) ? list.join(", ") : "";
  }

  function readJson(key) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_error) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function getUserCacheKey(userId) {
    return USER_PROFILE_PREFIX + String(userId || "").trim();
  }

  function setActiveMode(mode) {
    try {
      global.localStorage.setItem(ACTIVE_MODE_KEY, mode);
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function getActiveMode() {
    var mode = "";
    try {
      mode = String(global.localStorage.getItem(ACTIVE_MODE_KEY) || "").trim();
    } catch (_error) {
      mode = "";
    }
    return mode || "guest";
  }

  function emitProfileUpdate(detail) {
    try {
      global.dispatchEvent(new CustomEvent("ninanoo:profile-updated", { detail: detail || {} }));
    } catch (_error) {
      // Ignore event errors.
    }
  }

  function getGuestProfile() {
    return normalizeProfile(readJson(GUEST_PROFILE_KEY) || {});
  }

  function setGuestProfile(profile, options) {
    var normalized = normalizeProfile(profile || {});
    writeJson(GUEST_PROFILE_KEY, normalized);
    if (!options || options.setActive !== false) {
      setActiveMode("guest");
    }
    emitProfileUpdate({ mode: "guest", profile: normalized });
    return normalized;
  }

  function getUserProfileCache(userId) {
    var key = getUserCacheKey(userId);
    return normalizeProfile(readJson(key) || {});
  }

  function setUserProfileCache(userId, profile, options) {
    var targetUserId = String(userId || "").trim();
    if (!targetUserId) return normalizeProfile({});
    var prev = getUserProfileCache(targetUserId);
    var next = options && options.merge ? normalizeProfile({
      goal: profile && profile.goal ? profile.goal : prev.goal,
      allergies: Array.isArray(profile && profile.allergies) && profile.allergies.length ? profile.allergies : prev.allergies,
      dislikedIngredients: Array.isArray(profile && profile.dislikedIngredients) && profile.dislikedIngredients.length
        ? profile.dislikedIngredients
        : prev.dislikedIngredients,
      preferredCategories: Array.isArray(profile && profile.preferredCategories) && profile.preferredCategories.length
        ? profile.preferredCategories
        : prev.preferredCategories,
      updatedAt: new Date().toISOString()
    }) : normalizeProfile(profile || {});
    writeJson(getUserCacheKey(targetUserId), next);
    if (!options || options.setActive !== false) {
      setActiveMode("user:" + targetUserId);
    }
    emitProfileUpdate({ mode: "user", userId: targetUserId, profile: next });
    return next;
  }

  function markSignedIn(userId) {
    var targetUserId = String(userId || "").trim();
    if (!targetUserId) return;
    setActiveMode("user:" + targetUserId);
  }

  function markSignedOut() {
    setActiveMode("guest");
    emitProfileUpdate({ mode: "guest", profile: getGuestProfile() });
  }

  function getCachedActiveProfile() {
    var mode = getActiveMode();
    if (mode.indexOf("user:") === 0) {
      return getUserProfileCache(mode.slice(5));
    }
    return getGuestProfile();
  }

  function fromSupabaseRow(row) {
    return normalizeProfile({
      goal: row && row.goal,
      allergies: row && row.allergies,
      dislikedIngredients: row && row.disliked_ingredients,
      preferredCategories: row && row.preferred_categories,
      updatedAt: new Date().toISOString()
    });
  }

  async function createSupabaseClientFromRuntime() {
    if (global.__runtimeConfigReady && typeof global.__runtimeConfigReady.then === "function") {
      await global.__runtimeConfigReady.catch(function () { return null; });
    }
    if (!global.supabase || typeof global.supabase.createClient !== "function") return null;
    var url = safeTrim(global.SUPABASE_URL, 400);
    var anonKey = safeTrim(global.SUPABASE_ANON_KEY, 400);
    if (!url || !anonKey) return null;
    return global.supabase.createClient(url, anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  }

  async function resolveSessionUser(client) {
    if (!client || !client.auth) return null;
    var sessionData = await client.auth.getSession().catch(function () { return null; });
    var sessionUser = sessionData && sessionData.data && sessionData.data.session && sessionData.data.session.user;
    if (sessionUser) return sessionUser;
    var userData = await client.auth.getUser().catch(function () { return null; });
    return (userData && userData.data && userData.data.user) || null;
  }

  async function loadEffectiveProfile(options) {
    var opts = options || {};
    var profile = normalizeProfile({});
    var userId = "";
    var mode = "guest";
    var source = "guest-cache";

    var client = opts.supabaseClient || null;
    if (!client && opts.trySupabase !== false) {
      client = await createSupabaseClientFromRuntime();
    }

    var user = opts.user || null;
    if (!user && client) {
      user = await resolveSessionUser(client);
    }

    if (user && user.id) {
      userId = String(user.id);
      mode = "user";
      markSignedIn(userId);
      if (opts.preferServer !== false && client) {
        var queryRes = await client
          .from("user_profiles")
          .select("goal, allergies, disliked_ingredients, preferred_categories")
          .eq("id", userId)
          .maybeSingle()
          .catch(function () { return null; });
        if (queryRes && !queryRes.error && queryRes.data) {
          profile = fromSupabaseRow(queryRes.data);
          setUserProfileCache(userId, profile, { setActive: true });
          source = "server";
          return { mode: mode, userId: userId, source: source, profile: profile };
        }
      }

      profile = getUserProfileCache(userId);
      source = "user-cache";
      return { mode: mode, userId: userId, source: source, profile: profile };
    }

    if (opts.updateActiveMode !== false) {
      markSignedOut();
    }
    profile = getGuestProfile();
    return { mode: mode, userId: "", source: source, profile: profile };
  }

  global.NinanooProfileStore = {
    toCsv: toCsv,
    normalizeProfile: normalizeProfile,
    getGuestProfile: getGuestProfile,
    setGuestProfile: setGuestProfile,
    getUserProfileCache: getUserProfileCache,
    setUserProfileCache: setUserProfileCache,
    getCachedActiveProfile: getCachedActiveProfile,
    markSignedIn: markSignedIn,
    markSignedOut: markSignedOut,
    loadEffectiveProfile: loadEffectiveProfile
  };
})(window);
