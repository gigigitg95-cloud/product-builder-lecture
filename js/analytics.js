(function (global) {
  "use strict";

  var STORAGE_KEY = "ninanoo.analytics.queue.v1";
  var USER_KEY = "ninanoo.analytics.user.v1";
  var MAX_QUEUE = 300;
  var BLOCKED_PII_KEYS = ["email", "phone", "tel", "mobile"];

  function nowIso() {
    return new Date().toISOString();
  }

  function safeString(value, maxLen) {
    return String(value == null ? "" : value).slice(0, maxLen || 200);
  }

  function hashString(value) {
    var str = safeString(value, 500);
    var h = 2166136261;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  function readJson(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
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

  function isBlockedPiiKey(key) {
    var lower = safeString(key, 100).toLowerCase();
    return BLOCKED_PII_KEYS.some(function (token) { return lower.indexOf(token) !== -1; });
  }

  function sanitizeProps(props) {
    var src = props && typeof props === "object" ? props : {};
    var out = {};
    Object.keys(src).forEach(function (key) {
      if (isBlockedPiiKey(key)) return;
      var value = src[key];
      if (value == null) return;
      if (typeof value === "string") {
        out[key] = safeString(value, 300);
        return;
      }
      if (typeof value === "number" || typeof value === "boolean") {
        out[key] = value;
        return;
      }
      if (Array.isArray(value)) {
        out[key] = value.slice(0, 20).map(function (item) { return safeString(item, 80); });
        return;
      }
      if (typeof value === "object") {
        out[key] = "[object]";
      }
    });
    return out;
  }

  function enqueue(payload) {
    var q = readJson(STORAGE_KEY, []);
    if (!Array.isArray(q)) q = [];
    q.push(payload);
    if (q.length > MAX_QUEUE) q = q.slice(-MAX_QUEUE);
    writeJson(STORAGE_KEY, q);
  }

  function getUserState() {
    return readJson(USER_KEY, { anonymousId: "", identifiedIdHash: "", userProps: {} }) || {};
  }

  function setUserState(next) {
    writeJson(USER_KEY, next || {});
  }

  function ensureAnonymousId() {
    var state = getUserState();
    if (state.anonymousId) return state.anonymousId;
    var id = "anon_" + hashString(nowIso() + Math.random());
    state.anonymousId = id;
    setUserState(state);
    return id;
  }

  function baseEnvelope() {
    var state = getUserState();
    return {
      ts: nowIso(),
      path: global.location && global.location.pathname ? global.location.pathname : "",
      href: global.location && global.location.href ? global.location.href : "",
      anonymousId: state.anonymousId || ensureAnonymousId(),
      userIdHash: state.identifiedIdHash || ""
    };
  }

  function track(eventName, props) {
    var name = safeString(eventName, 120);
    if (!name) return;
    var payload = {
      event: name,
      props: sanitizeProps(props || {}),
      meta: baseEnvelope()
    };
    enqueue(payload);
    try {
      console.log("[analytics]", payload);
    } catch (_error) {
      // no-op
    }
  }

  function identify(userId) {
    var raw = safeString(userId, 300).trim();
    if (!raw) return "";
    var hashed = "uid_" + hashString(raw.toLowerCase());
    var state = getUserState();
    state.anonymousId = state.anonymousId || ensureAnonymousId();
    state.identifiedIdHash = hashed;
    setUserState(state);
    track("identify", { userIdHash: hashed });
    return hashed;
  }

  function setUserProps(props) {
    var state = getUserState();
    state.userProps = Object.assign({}, state.userProps || {}, sanitizeProps(props || {}));
    setUserState(state);
    track("set_user_props", state.userProps || {});
  }

  function getQueue() {
    var q = readJson(STORAGE_KEY, []);
    return Array.isArray(q) ? q : [];
  }

  function clearQueue() {
    writeJson(STORAGE_KEY, []);
  }

  global.NinanooAnalytics = {
    track: track,
    identify: identify,
    setUserProps: setUserProps,
    getQueue: getQueue,
    clearQueue: clearQueue
  };

  // Bridge existing internal analytics events to the new vendor-neutral layer.
  global.addEventListener("menurec:analytics", function (event) {
    var detail = event && event.detail ? event.detail : {};
    var name = safeString(detail.event || "", 120);
    if (!name) return;
    var props = Object.assign({}, detail);
    delete props.event;
    track(name, props);
  });
})(window);
