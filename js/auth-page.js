(function () {
  "use strict";

  let supabaseClient = null;
  let currentUser = null;
  const LOGIN_TRACK_KEY_PREFIX = "ninanoo.analytics.loginTracked:";

  function readOAuthErrorFromUrl() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const err = params.get("error") || params.get("error_code");
      const desc = params.get("error_description");
      if (!err && !desc) return "";
      return [err, desc].filter(Boolean).join(": ");
    } catch {
      return "";
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setVisible(id, visible) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !visible);
  }

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function getSupabaseConfig() {
    const urlFromGlobal = typeof window.SUPABASE_URL === "string" ? window.SUPABASE_URL.trim() : "";
    const keyFromGlobal = typeof window.SUPABASE_ANON_KEY === "string" ? window.SUPABASE_ANON_KEY.trim() : "";

    return {
      url: urlFromGlobal,
      anonKey: keyFromGlobal,
    };
  }

  function trackAnalytics(eventName, props) {
    if (!window.NinanooAnalytics || typeof window.NinanooAnalytics.track !== "function") return;
    window.NinanooAnalytics.track(eventName, props || {});
  }

  function trackLoginSuccessOnce(user, method) {
    const uid = String(user?.id || "").trim();
    if (!uid) return;
    const key = LOGIN_TRACK_KEY_PREFIX + uid;
    if (window.sessionStorage.getItem(key) === "1") return;
    window.sessionStorage.setItem(key, "1");
    const userIdHash = window.NinanooAnalytics && typeof window.NinanooAnalytics.identify === "function"
      ? window.NinanooAnalytics.identify(uid)
      : "";
    trackAnalytics("login_success", { method: method || "supabase", userIdHash: userIdHash });
  }

  function updateUI(user) {
    const signedIn = !!user;
    if (!signedIn) {
      setText("auth-page-status", "이메일 또는 Google로 로그인하세요.");
      setVisible("auth-page-signin-actions", true);
      setVisible("auth-page-signout-btn", false);
      setVisible("auth-page-mypage-link", false);
      return;
    }

    const displayName = user.user_metadata?.full_name || user.email || user.id;
    setText("auth-page-status", `로그인됨: ${displayName}`);
    setVisible("auth-page-signin-actions", false);
    setVisible("auth-page-signout-btn", true);
    setVisible("auth-page-mypage-link", true);
  }

  async function signInWithEmail() {
    if (!supabaseClient) return;

    const email = getInputValue("auth-page-email");
    const password = getInputValue("auth-page-password");
    if (!email || !password) {
      setText("auth-page-status", "이메일과 비밀번호를 입력하세요.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign-in failed", error);
      setText("auth-page-status", `로그인 실패: ${error.message}`);
      return;
    }
    trackLoginSuccessOnce(data?.user || null, "email_password");
    window.location.href = "/index.html";
  }

  async function signInWithGoogle() {
    if (!supabaseClient) return;

    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/pages/auth.html`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      console.error("Google sign-in failed", error);
      setText("auth-page-status", `Google 로그인 실패: ${error.message}`);
    }
  }

  async function signOut() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Sign-out failed", error);
      setText("auth-page-status", "로그아웃 중 오류가 발생했습니다.");
    }
  }

  function bindEvents() {
    document.getElementById("auth-page-signin-btn")?.addEventListener("click", signInWithEmail);
    document.getElementById("auth-page-google-btn")?.addEventListener("click", signInWithGoogle);
    document.getElementById("auth-page-signout-btn")?.addEventListener("click", signOut);
  }

  function initSupabase() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setText("auth-page-status", "Supabase SDK를 불러오지 못했습니다.");
      return false;
    }

    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      setText("auth-page-status", "Supabase 설정이 비어 있습니다.");
      return false;
    }

    supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    return true;
  }

  async function syncUserState(user) {
    currentUser = user || null;
    updateUI(currentUser);
    if (currentUser) {
      trackLoginSuccessOnce(currentUser, currentUser?.app_metadata?.provider || "oauth");
      window.location.href = "/index.html";
    }
  }

  async function initAuthPage() {
    if (window.__runtimeConfigReady && typeof window.__runtimeConfigReady.then === "function") {
      await window.__runtimeConfigReady.catch(() => null);
    }

    bindEvents();
    updateUI(null);
    const oauthError = readOAuthErrorFromUrl();
    if (oauthError) {
      setText("auth-page-status", `Google 로그인 실패: ${oauthError}`);
    }
    if (!initSupabase()) return;

    const { data } = await supabaseClient.auth.getUser();
    await syncUserState(data?.user || null);

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await syncUserState(session?.user || null);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initAuthPage().catch((error) => {
      console.error("Failed to initialize auth page", error);
      setText("auth-page-status", "인증 페이지 초기화 중 오류가 발생했습니다.");
    });
  });
})();
