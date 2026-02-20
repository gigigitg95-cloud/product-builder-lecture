(function (global) {
  "use strict";

  var STORAGE_KEY = "ninanoo.featureFlags.v1";
  var DEFAULT_FLAGS = {
    recoWhy: true,
    freeWeeklyPlan: true,
    aiFoodEnhance: true
  };

  function readStorageFlags() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writeStorageFlags(flags) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(flags || {}));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function normalizeFlags(input) {
    var src = input && typeof input === "object" ? input : {};
    return {
      recoWhy: src.recoWhy !== false,
      freeWeeklyPlan: src.freeWeeklyPlan !== false,
      aiFoodEnhance: src.aiFoodEnhance !== false
    };
  }

  function getRuntimeFlags() {
    var runtime = global.RUNTIME_FLAGS && typeof global.RUNTIME_FLAGS === "object" ? global.RUNTIME_FLAGS : {};
    return normalizeFlags(runtime);
  }

  function getAll() {
    var runtime = getRuntimeFlags();
    var local = readStorageFlags();
    return normalizeFlags({
      recoWhy: typeof local.recoWhy === "boolean" ? local.recoWhy : runtime.recoWhy,
      freeWeeklyPlan: typeof local.freeWeeklyPlan === "boolean" ? local.freeWeeklyPlan : runtime.freeWeeklyPlan,
      aiFoodEnhance: typeof local.aiFoodEnhance === "boolean" ? local.aiFoodEnhance : runtime.aiFoodEnhance
    });
  }

  function isEnabled(name) {
    var flags = getAll();
    return flags[name] !== false;
  }

  function setFlag(name, enabled) {
    var key = String(name || "").trim();
    if (!key || !(key in DEFAULT_FLAGS)) return getAll();
    var local = readStorageFlags();
    local[key] = !!enabled;
    writeStorageFlags(local);
    return getAll();
  }

  function reset() {
    try {
      global.localStorage.removeItem(STORAGE_KEY);
    } catch (_error) {
      // no-op
    }
    return getAll();
  }

  global.NinanooFlags = {
    key: STORAGE_KEY,
    defaults: DEFAULT_FLAGS,
    getAll: getAll,
    isEnabled: isEnabled,
    setFlag: setFlag,
    reset: reset
  };
})(window);
