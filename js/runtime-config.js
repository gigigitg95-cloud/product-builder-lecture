(function (global) {
  "use strict";

  function resolveRuntimeConfigApiUrl() {
    if (typeof global.RUNTIME_CONFIG_API_URL === "string" && global.RUNTIME_CONFIG_API_URL.trim()) {
      return global.RUNTIME_CONFIG_API_URL.trim();
    }

    var host = String(global.location && global.location.hostname ? global.location.hostname : "");
    if (host === "ninanoo.com" || host === "www.ninanoo.com") {
      return "https://api.ninanoo.com/runtime-config";
    }
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8787/runtime-config";
    }
    return "/api/runtime-config";
  }

  async function loadRuntimeConfig() {
    try {
      var apiUrl = resolveRuntimeConfigApiUrl();
      var response = await fetch(apiUrl, {
        method: "GET",
        headers: { "content-type": "application/json" },
      });
      if (!response.ok) throw new Error("runtime config fetch failed: " + response.status);

      var data = await response.json();
      global.SUPABASE_URL = String(data && data.supabaseUrl ? data.supabaseUrl : "").trim();
      global.SUPABASE_ANON_KEY = String(data && data.supabaseAnonKey ? data.supabaseAnonKey : "").trim();
    } catch (error) {
      console.error("Failed to load runtime config", error);
      global.SUPABASE_URL = String(global.SUPABASE_URL || "").trim();
      global.SUPABASE_ANON_KEY = String(global.SUPABASE_ANON_KEY || "").trim();
    }
  }

  global.__runtimeConfigReady = loadRuntimeConfig();
})(window);
