(function () {
  "use strict";

  let supabaseClient = null;
  let currentUser = null;
  const DELETE_CONFIRM_TEXT = "회원 탈퇴";

  function resolveAccountApiUrl(path) {
    var normalizedPath = path.startsWith("/") ? path : "/" + path;
    if (typeof window.POLAR_CHECKOUT_API_URL === "string" && window.POLAR_CHECKOUT_API_URL.trim()) {
      return window.POLAR_CHECKOUT_API_URL.trim().replace(/\/$/, "") + normalizedPath;
    }
    var host = String(window.location.hostname || "");
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8787" + normalizedPath;
    }
    return "https://api.ninanoo.com" + normalizedPath;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setVisible(id, visible) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !visible);
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
  }

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function parseCsvInput(value) {
    if (!value) return [];
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getSupabaseConfig() {
    return {
      url: String(window.SUPABASE_URL || "").trim(),
      anonKey: String(window.SUPABASE_ANON_KEY || "").trim(),
    };
  }

  function fillProfileForm(data) {
    setValue("mypage-goal", data?.goal || "");
    setValue("mypage-allergies", Array.isArray(data?.allergies) ? data.allergies.join(", ") : "");
    setValue("mypage-dislikes", Array.isArray(data?.disliked_ingredients) ? data.disliked_ingredients.join(", ") : "");
    setValue("mypage-categories", Array.isArray(data?.preferred_categories) ? data.preferred_categories.join(", ") : "");
  }

  function getMemberId(user) {
    const email = user?.email || "";
    if (!email) return "";
    return email.split("@")[0] || email;
  }

  function formatDateTime(iso) {
    if (!iso) return "-";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("ko-KR");
  }

  function renderAccountInfo(user) {
    const provider = user?.app_metadata?.provider || user?.identities?.[0]?.provider || "-";
    setText("mypage-email", `이메일: ${user?.email || "-"}`);
    setText("mypage-provider", `로그인 방식: ${provider}`);
    setText("mypage-created-at", `가입일: ${formatDateTime(user?.created_at)}`);
  }

  async function ensureProfileRow(user) {
    if (!supabaseClient || !user?.id) return;
    const payload = {
      id: user.id,
      email: user.email || null,
      updated_at: new Date().toISOString(),
    };
    await supabaseClient.from("user_profiles").upsert(payload, { onConflict: "id" });
  }

  async function loadProfile(user) {
    if (!supabaseClient || !user?.id) return;
    const { data, error } = await supabaseClient
      .from("user_profiles")
      .select("goal, allergies, disliked_ingredients, preferred_categories")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.error("Failed to load profile", error);
      setText("mypage-status", "프로필을 불러오지 못했습니다.");
      return;
    }
    fillProfileForm(data || null);
  }

  async function saveProfile() {
    if (!supabaseClient || !currentUser) return;
    const payload = {
      id: currentUser.id,
      email: currentUser.email || null,
      goal: getInputValue("mypage-goal"),
      allergies: parseCsvInput(getInputValue("mypage-allergies")),
      disliked_ingredients: parseCsvInput(getInputValue("mypage-dislikes")),
      preferred_categories: parseCsvInput(getInputValue("mypage-categories")),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseClient.from("user_profiles").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("Failed to save profile", error);
      setText("mypage-status", "프로필 저장 중 오류가 발생했습니다.");
      return;
    }
    setText("mypage-status", "프로필이 저장되었습니다.");
  }

  async function signOut() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      console.error("Sign-out failed", error);
      setText("mypage-status", "로그아웃 중 오류가 발생했습니다.");
      return;
    }
    window.location.href = "/pages/auth.html";
  }

  async function sendPasswordResetEmail() {
    if (!supabaseClient || !currentUser?.email) return;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(currentUser.email, {
      redirectTo: `${window.location.origin}/pages/auth.html`,
    });
    if (error) {
      console.error("Failed to send reset email", error);
      setText("mypage-status", `비밀번호 재설정 메일 발송 실패: ${error.message}`);
      return;
    }
    setText("mypage-status", "비밀번호 재설정 메일을 발송했습니다.");
  }

  async function deleteAccount() {
    if (!supabaseClient || !currentUser) return;
    const confirmText = getInputValue("mypage-delete-confirm");
    if (confirmText !== DELETE_CONFIRM_TEXT) {
      setText("mypage-status", "입력값이 일치하지 않습니다. '회원 탈퇴'를 정확히 입력하세요.");
      return;
    }

    const { data: sessionData } = await supabaseClient.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) {
      setText("mypage-status", "세션이 만료되었습니다. 다시 로그인 후 시도하세요.");
      return;
    }

    const response = await fetch(resolveAccountApiUrl("/delete-account"), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ confirm: true }),
    }).catch(() => null);

    if (!response || !response.ok) {
      let detail = "";
      try {
        const payload = response ? await response.json() : null;
        detail = payload?.error || "";
      } catch {
        detail = "";
      }
      setText("mypage-status", `회원 탈퇴 실패${detail ? `: ${detail}` : ""}`);
      return;
    }

    await supabaseClient.auth.signOut().catch(() => null);
    setText("mypage-status", "회원 탈퇴가 완료되었습니다.");
    window.location.href = "/index.html";
  }

  function renderSignedOut() {
    setText("mypage-status", "로그인이 필요합니다.");
    setText("mypage-member-id", "");
    setVisible("mypage-profile-form", false);
    setVisible("mypage-account-info", false);
    setVisible("mypage-password-reset", false);
    setVisible("mypage-delete-account", false);
    setVisible("mypage-login-link", true);
    fillProfileForm(null);
  }

  function renderSignedIn(user) {
    const memberId = getMemberId(user);
    setText("mypage-status", "회원 정보를 확인하고 수정할 수 있습니다.");
    setText("mypage-member-id", `회원 아이디: ${memberId}`);
    setVisible("mypage-profile-form", true);
    setVisible("mypage-account-info", true);
    setVisible("mypage-password-reset", true);
    setVisible("mypage-delete-account", true);
    setVisible("mypage-login-link", false);
    renderAccountInfo(user);
  }

  async function syncUserState(user) {
    currentUser = user || null;
    if (!currentUser) {
      renderSignedOut();
      return;
    }
    renderSignedIn(currentUser);
    await ensureProfileRow(currentUser);
    await loadProfile(currentUser);
  }

  function initSupabase() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setText("mypage-status", "Supabase SDK를 불러오지 못했습니다.");
      return false;
    }
    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      setText("mypage-status", "Supabase 설정이 비어 있습니다.");
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
    document.getElementById("mypage-save-btn")?.addEventListener("click", saveProfile);
    document.getElementById("mypage-signout-btn")?.addEventListener("click", signOut);
    document.getElementById("mypage-reset-password-btn")?.addEventListener("click", sendPasswordResetEmail);
    document.getElementById("mypage-delete-account-btn")?.addEventListener("click", deleteAccount);
  }

  async function initMyPage() {
    if (window.__runtimeConfigReady && typeof window.__runtimeConfigReady.then === "function") {
      await window.__runtimeConfigReady.catch(() => null);
    }

    bindEvents();
    if (!initSupabase()) return;

    const { data } = await supabaseClient.auth.getUser();
    await syncUserState(data?.user || null);

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      await syncUserState(session?.user || null);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initMyPage().catch((error) => {
      console.error("Failed to initialize mypage", error);
      setText("mypage-status", "마이페이지 초기화 중 오류가 발생했습니다.");
    });
  });
})();
