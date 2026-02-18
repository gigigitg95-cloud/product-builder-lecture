(function () {
  "use strict";

  let supabaseClient = null;

  function setStatus(text) {
    const el = document.getElementById("signup-page-status");
    if (el) el.textContent = text;
  }

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function getSupabaseConfig() {
    return {
      url: String(window.SUPABASE_URL || "").trim(),
      anonKey: String(window.SUPABASE_ANON_KEY || "").trim(),
    };
  }

  async function signUpWithEmail() {
    if (!supabaseClient) return;
    const email = getInputValue("signup-page-email");
    const password = getInputValue("signup-page-password");
    const passwordConfirm = getInputValue("signup-page-password-confirm");

    if (!email || !password || !passwordConfirm) {
      setStatus("이메일과 비밀번호를 모두 입력하세요.");
      return;
    }
    if (password !== passwordConfirm) {
      setStatus("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/pages/auth.html` },
    });

    if (error) {
      console.error("Sign-up failed", error);
      setStatus(`회원가입 실패: ${error.message}`);
      return;
    }

    const identities = Array.isArray(data?.user?.identities) ? data.user.identities : [];
    if (data?.user && identities.length === 0) {
      setStatus("이미 가입된 이메일입니다. 로그인 페이지에서 로그인하거나 비밀번호 재설정을 이용하세요.");
      return;
    }

    if (!data.session) {
      setStatus("회원가입 완료. 인증 이메일을 발송했습니다. 메일함/스팸함에서 확인 후 인증을 완료하세요.");
      return;
    }

    window.location.href = "/pages/mypage.html";
  }

  function initSupabase() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setStatus("Supabase SDK를 불러오지 못했습니다.");
      return false;
    }
    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      setStatus("Supabase 설정이 비어 있습니다.");
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

  function bindEvents() {
    document.getElementById("signup-page-submit-btn")?.addEventListener("click", signUpWithEmail);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (window.__runtimeConfigReady && typeof window.__runtimeConfigReady.then === "function") {
      await window.__runtimeConfigReady.catch(() => null);
    }
    bindEvents();
    initSupabase();
  });
})();
