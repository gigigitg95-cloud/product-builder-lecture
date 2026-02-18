(function (global) {
  "use strict";

  function resolveRuntimeConfigApiUrls() {
    var urls = [];
    var seen = Object.create(null);

    function add(url) {
      if (!url || seen[url]) return;
      seen[url] = true;
      urls.push(url);
    }

    if (typeof global.RUNTIME_CONFIG_API_URL === "string" && global.RUNTIME_CONFIG_API_URL.trim()) {
      add(global.RUNTIME_CONFIG_API_URL.trim());
    }

    var host = String(global.location && global.location.hostname ? global.location.hostname : "");
    if (host === "localhost" || host === "127.0.0.1") {
      add("http://127.0.0.1:8787/runtime-config");
    }

    add("/api/runtime-config");
    add("https://api.ninanoo.com/runtime-config");
    return urls;
  }

  async function loadRuntimeConfig() {
    var urls = resolveRuntimeConfigApiUrls();
    var lastError = null;

    for (var i = 0; i < urls.length; i += 1) {
      var apiUrl = urls[i];
      try {
        var response = await fetch(apiUrl, { method: "GET" });
        if (!response.ok) throw new Error("runtime config fetch failed: " + response.status);
        var data = await response.json();
        var url = String(data && data.supabaseUrl ? data.supabaseUrl : "").trim();
        var key = String(data && data.supabaseAnonKey ? data.supabaseAnonKey : "").trim();
        if (!url || !key) throw new Error("runtime config payload is empty");

        global.SUPABASE_URL = url;
        global.SUPABASE_ANON_KEY = key;
        return;
      } catch (error) {
        lastError = error;
      }
    }

    console.error("Failed to load runtime config", lastError);
    global.SUPABASE_URL = String(global.SUPABASE_URL || "").trim();
    global.SUPABASE_ANON_KEY = String(global.SUPABASE_ANON_KEY || "").trim();
  }

  global.__runtimeConfigReady = loadRuntimeConfig();
})(window);
