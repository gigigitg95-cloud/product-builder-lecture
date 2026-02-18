(function () {
  "use strict";

  let supabaseClient = null;
  let currentUser = null;

  function parseCsvInput(value) {
    if (!value) return [];
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
  }

  function setVisible(id, visible) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !visible);
  }

  function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function fillProfileForm(data) {
    setValue("auth-page-goal", data?.goal || "");
    setValue("auth-page-allergies", Array.isArray(data?.allergies) ? data.allergies.join(", ") : "");
    setValue("auth-page-dislikes", Array.isArray(data?.disliked_ingredients) ? data.disliked_ingredients.join(", ") : "");
    setValue("auth-page-categories", Array.isArray(data?.preferred_categories) ? data.preferred_categories.join(", ") : "");
  }

  function getSupabaseConfig() {
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
    const publishableKeyMeta = document.querySelector('meta[name="supabase-publishable-key"]');

    const urlFromMeta = urlMeta ? String(urlMeta.content || "").trim() : "";
    const keyFromMeta = keyMeta ? String(keyMeta.content || "").trim() : "";
    const keyFromPublishableMeta = publishableKeyMeta ? String(publishableKeyMeta.content || "").trim() : "";
    const urlFromGlobal = typeof window.SUPABASE_URL === "string" ? window.SUPABASE_URL.trim() : "";
    const keyFromGlobal = typeof window.SUPABASE_ANON_KEY === "string" ? window.SUPABASE_ANON_KEY.trim() : "";

    return {
      url: urlFromGlobal || urlFromMeta,
      anonKey: keyFromGlobal || keyFromMeta || keyFromPublishableMeta,
    };
  }

  function updateUI(user) {
    const signedIn = !!user;
    if (!signedIn) {
      setText("auth-page-status", "이메일 또는 Google로 로그인하세요.");
      setVisible("auth-page-signin-actions", true);
      setVisible("auth-page-signout-btn", false);
      setVisible("auth-page-profile-form", false);
      fillProfileForm(null);
      return;
    }

    const displayName = user.user_metadata?.full_name || user.email || user.id;
    setText("auth-page-status", `로그인됨: ${displayName}`);
    setVisible("auth-page-signin-actions", false);
    setVisible("auth-page-signout-btn", true);
    setVisible("auth-page-profile-form", true);
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
      setText("auth-page-status", "프로필을 불러오지 못했습니다.");
      return;
    }
    fillProfileForm(data || null);
  }

  async function saveProfile() {
    if (!supabaseClient || !currentUser) return;

    const payload = {
      id: currentUser.id,
      email: currentUser.email || null,
      goal: getInputValue("auth-page-goal"),
      allergies: parseCsvInput(getInputValue("auth-page-allergies")),
      disliked_ingredients: parseCsvInput(getInputValue("auth-page-dislikes")),
      preferred_categories: parseCsvInput(getInputValue("auth-page-categories")),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseClient.from("user_profiles").upsert(payload, { onConflict: "id" });

    if (error) {
      console.error("Failed to save profile", error);
      setText("auth-page-status", "프로필 저장 중 오류가 발생했습니다.");
      return;
    }

    setText("auth-page-status", "프로필이 저장되었습니다.");
  }

  async function signUpWithEmail() {
    if (!supabaseClient) return;
    const email = getInputValue("auth-page-email");
    const password = getInputValue("auth-page-password");

    if (!email || !password) {
      setText("auth-page-status", "이메일과 비밀번호를 입력하세요.");
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/pages/auth.html` },
    });

    if (error) {
      console.error("Sign-up failed", error);
      setText("auth-page-status", `회원가입 실패: ${error.message}`);
      return;
    }

    if (!data.session) {
      setText("auth-page-status", "회원가입 완료. 이메일 인증 링크를 확인한 뒤 로그인하세요.");
      return;
    }

    setText("auth-page-status", "회원가입 및 로그인 완료.");
  }

  async function signInWithEmail() {
    if (!supabaseClient) return;
    const email = getInputValue("auth-page-email");
    const password = getInputValue("auth-page-password");

    if (!email || !password) {
      setText("auth-page-status", "이메일과 비밀번호를 입력하세요.");
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Sign-in failed", error);
      setText("auth-page-status", `로그인 실패: ${error.message}`);
    }
  }

  async function signInWithGoogle() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/pages/auth.html` },
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
    document.getElementById("auth-page-signup-btn")?.addEventListener("click", signUpWithEmail);
    document.getElementById("auth-page-signin-btn")?.addEventListener("click", signInWithEmail);
    document.getElementById("auth-page-google-btn")?.addEventListener("click", signInWithGoogle);
    document.getElementById("auth-page-signout-btn")?.addEventListener("click", signOut);
    document.getElementById("auth-page-save-btn")?.addEventListener("click", saveProfile);
  }

  async function syncUserState(user) {
    currentUser = user || null;
    updateUI(currentUser);
    if (!currentUser) return;
    await ensureProfileRow(currentUser);
    await loadProfile(currentUser);
  }

  function initSupabase() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setText("auth-page-status", "Supabase SDK를 불러오지 못했습니다.");
      return false;
    }

    const config = getSupabaseConfig();
    if (!config.url || !config.anonKey) {
      setText("auth-page-status", "Supabase 설정이 비어 있습니다. auth 페이지의 meta 태그 또는 전역 변수에 설정하세요.");
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

  async function initAuthPage() {
    bindEvents();
    updateUI(null);

    if (!initSupabase()) return;

    const { data, error } = await supabaseClient.auth.getUser();
    if (error) {
      console.error("Failed to get user", error);
    }
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
