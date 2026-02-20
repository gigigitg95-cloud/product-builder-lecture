(function () {
  "use strict";

  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";
  var ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  var MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
  var state = {
    file: null,
    preset: "business",
    resultDataUrl: "",
    cards: [],
    busy: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function resolveApiEndpoint() {
    if (typeof window.POLAR_CHECKOUT_API_URL === "string" && window.POLAR_CHECKOUT_API_URL.trim()) {
      return window.POLAR_CHECKOUT_API_URL.trim();
    }
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "http://127.0.0.1:8787/create-checkout";
    if (host.indexOf("cloudworkstations.dev") !== -1 && host.indexOf("8080-") === 0) {
      return "https://" + host.replace(/^8080-/, "8787-") + "/create-checkout";
    }
    return DEFAULT_API_ENDPOINT;
  }

  function endpointFor(path) {
    return resolveApiEndpoint().replace(/\/create-checkout$/, path);
  }

  function setStatus(message, isError) {
    var el = byId("styler-status");
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("text-red-500", "dark:text-red-300", "text-emerald-600", "dark:text-emerald-300", "text-slate-500", "dark:text-slate-400");
    if (!message) {
      el.classList.add("text-slate-500", "dark:text-slate-400");
    } else if (isError) {
      el.classList.add("text-red-500", "dark:text-red-300");
    } else {
      el.classList.add("text-emerald-600", "dark:text-emerald-300");
    }
  }

  function setBusy(busy) {
    state.busy = !!busy;
    var btn = byId("styler-run-btn");
    var label = byId("styler-run-btn-label");
    if (btn) btn.disabled = !!busy;
    if (label) label.textContent = busy ? "처리 중..." : "스타일링 시작";
  }

  function updatePresetButtons() {
    var buttons = document.querySelectorAll(".styler-preset-btn");
    buttons.forEach(function (button) {
      var active = button.getAttribute("data-preset") === state.preset;
      button.classList.remove("border-indigo-300", "bg-indigo-50", "text-indigo-800", "border-slate-300", "bg-white", "dark:bg-slate-800");
      if (active) {
        button.classList.add("border-indigo-300", "bg-indigo-50", "text-indigo-800");
      } else {
        button.classList.add("border-slate-300", "bg-white", "dark:bg-slate-800");
      }
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(new Error("file_read_failed")); };
      reader.readAsDataURL(file);
    });
  }

  function renderCards() {
    var container = byId("styler-cards");
    if (!container) return;
    if (!state.cards.length) {
      container.innerHTML = "<p class=\"text-xs text-slate-500 dark:text-slate-400\">코디 추천 결과가 여기에 표시됩니다.</p>";
      return;
    }
    container.innerHTML = state.cards.map(function (card, idx) {
      return (
        "<article class=\"rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-3\">" +
        "<p class=\"text-xs font-bold text-indigo-700 dark:text-indigo-300\">추천 " + (idx + 1) + " - " + escapeHtml(card.title) + "</p>" +
        "<p class=\"mt-1 text-sm text-slate-800 dark:text-slate-100\">" + escapeHtml(card.items) + "</p>" +
        "<p class=\"mt-1 text-xs text-slate-600 dark:text-slate-300\">" + escapeHtml(card.tip) + "</p>" +
        "</article>"
      );
    }).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function updateResultState() {
    var result = byId("styler-result-preview");
    var downloadBtn = byId("styler-download-btn");
    var shareBtn = byId("styler-share-btn");
    if (result) result.src = state.resultDataUrl || "";
    if (downloadBtn) downloadBtn.disabled = !state.resultDataUrl;
    if (shareBtn) shareBtn.disabled = !state.resultDataUrl;
    renderCards();
  }

  async function requestStyler(payload) {
    var response = await fetch(endpointFor("/api/ai/styler"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    var data;
    try {
      data = await response.json();
    } catch (_error) {
      data = null;
    }
    if (!response.ok || (data && data.ok === false)) {
      var err = new Error((data && data.error && data.error.message) || "요청에 실패했습니다.");
      err.statusCode = response.status;
      throw err;
    }
    return data || {};
  }

  function dataUrlToBlob(dataUrl) {
    var parts = String(dataUrl || "").split(",");
    var header = parts[0] || "";
    var base64 = parts[1] || "";
    var mimeMatch = header.match(/data:([^;]+);base64/);
    var mime = mimeMatch ? mimeMatch[1] : "image/png";
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  }

  async function runStyler() {
    if (state.busy) return;
    if (!state.file) {
      setStatus("사진을 먼저 업로드해 주세요.", true);
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(state.file.type)) {
      setStatus("지원 포맷이 아닙니다. JPG/PNG/WEBP만 가능합니다.", true);
      return;
    }
    if (state.file.size > MAX_UPLOAD_BYTES) {
      setStatus("파일이 너무 큽니다. 8MB 이하로 업로드해 주세요.", true);
      return;
    }

    setBusy(true);
    setStatus("프로필 스타일링과 코디 추천을 생성 중입니다...", false);
    try {
      var sourceDataUrl = await readFileAsDataUrl(state.file);
      var context = String((byId("styler-context") && byId("styler-context").value) || "").trim();
      var result = await requestStyler({
        imageBase64: sourceDataUrl,
        mimeType: state.file.type,
        fileName: state.file.name,
        preset: state.preset,
        context: context
      });

      state.cards = Array.isArray(result.cards) ? result.cards.slice(0, 5) : [];
      if (result.imageBase64) {
        state.resultDataUrl = "data:image/png;base64," + String(result.imageBase64);
      } else {
        state.resultDataUrl = "";
      }
      updateResultState();

      if (result.advisoryOnly) {
        setStatus(String(result.advisory || "안전 가이드 모드로 코디 추천만 제공합니다."), false);
      } else {
        setStatus("스타일링 결과가 준비되었습니다.", false);
      }
    } catch (error) {
      var msg = (error && error.message) || "스타일링 요청 중 오류가 발생했습니다.";
      if (error && error.statusCode === 413) msg = "파일이 너무 큽니다. 더 작은 파일로 다시 시도해 주세요.";
      if (error && error.statusCode === 415) msg = "지원하지 않는 포맷입니다. JPG/PNG/WEBP를 사용해 주세요.";
      if (error && error.statusCode === 429) msg = "요청이 많습니다(429). 잠시 후 재시도해 주세요.";
      setStatus(msg, true);
    } finally {
      setBusy(false);
    }
  }

  async function downloadResult() {
    if (!state.resultDataUrl) return;
    var a = document.createElement("a");
    a.href = state.resultDataUrl;
    a.download = "ninanoo-profile-styler-" + new Date().toISOString().slice(0, 10) + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus("결과 이미지를 다운로드했습니다.", false);
  }

  async function shareResult() {
    if (!state.resultDataUrl) return;
    var file = new File([dataUrlToBlob(state.resultDataUrl)], "ninanoo-profile-styler.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "MenuRec Profile Styler",
        text: "프로필 스타일링 결과",
        files: [file]
      });
      setStatus("공유가 완료되었습니다.", false);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setStatus("공유 링크를 복사했습니다.", false);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = byId("styler-image-input");
    var originalPreview = byId("styler-original-preview");
    var runBtn = byId("styler-run-btn");
    var retryBtn = byId("styler-retry-btn");
    var downloadBtn = byId("styler-download-btn");
    var shareBtn = byId("styler-share-btn");
    var presetButtons = document.querySelectorAll(".styler-preset-btn");

    if (input) {
      input.addEventListener("change", function (event) {
        var file = event.target && event.target.files ? event.target.files[0] : null;
        state.file = file || null;
        state.resultDataUrl = "";
        state.cards = [];
        updateResultState();
        if (!file) {
          if (originalPreview) originalPreview.src = "";
          return;
        }
        readFileAsDataUrl(file).then(function (src) {
          if (originalPreview) originalPreview.src = src;
          setStatus("사진 업로드가 완료되었습니다. 스타일링을 시작해 주세요.", false);
        }).catch(function () {
          setStatus("이미지 읽기에 실패했습니다.", true);
        });
      });
    }

    presetButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.preset = button.getAttribute("data-preset") || "business";
        updatePresetButtons();
      });
    });

    if (runBtn) runBtn.addEventListener("click", runStyler);
    if (retryBtn) retryBtn.addEventListener("click", runStyler);
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        downloadResult().catch(function () { setStatus("다운로드에 실패했습니다.", true); });
      });
    }
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareResult().catch(function () { setStatus("공유에 실패했습니다.", true); });
      });
    }

    updatePresetButtons();
    updateResultState();
  });
})();
