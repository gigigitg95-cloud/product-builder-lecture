(function () {
  "use strict";

  var DEFAULT_API_ENDPOINT = "https://api.ninanoo.com/create-checkout";
  var FOOD_ENHANCE_DRAFT_KEY = "ninanooFoodEnhanceDraft";
  var REPORT_DRAFT_KEY = "ninanooPremiumReportDraft";
  var MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
  var ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
  var state = {
    file: null,
    preset: "bright",
    resultDataUrl: "",
    resultTier: "free",
    watermarkRequired: true,
    maxRenderPixels: 1024,
    processing: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function resolveApiEndpoint() {
    if (typeof window.POLAR_CHECKOUT_API_URL === "string" && window.POLAR_CHECKOUT_API_URL.trim()) {
      return window.POLAR_CHECKOUT_API_URL.trim();
    }
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8787/create-checkout";
    }
    if (host.indexOf("cloudworkstations.dev") !== -1 && host.indexOf("8080-") === 0) {
      return "https://" + host.replace(/^8080-/, "8787-") + "/create-checkout";
    }
    return DEFAULT_API_ENDPOINT;
  }

  function endpointFor(pathSuffix) {
    return resolveApiEndpoint().replace(/\/create-checkout$/, pathSuffix);
  }

  function setStatus(message, isError) {
    var el = byId("food-enhance-status");
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("text-red-500", "dark:text-red-300", "text-emerald-600", "dark:text-emerald-300", "text-slate-500", "dark:text-slate-400");
    if (!message) {
      el.classList.add("text-slate-500", "dark:text-slate-400");
      return;
    }
    if (isError) {
      el.classList.add("text-red-500", "dark:text-red-300");
    } else {
      el.classList.add("text-emerald-600", "dark:text-emerald-300");
    }
  }

  function setBusy(busy) {
    state.processing = !!busy;
    var btn = byId("food-enhance-btn");
    var label = byId("food-enhance-btn-label");
    if (btn) btn.disabled = !!busy;
    if (label) label.textContent = busy ? "처리 중..." : "AI 보정 시작";
  }

  function getSelectedTier() {
    var checked = document.querySelector("input[name='food-tier']:checked");
    return checked && checked.value === "pro" ? "pro" : "free";
  }

  function toggleProFields() {
    var box = byId("food-pro-fields");
    if (!box) return;
    box.classList.toggle("hidden", getSelectedTier() !== "pro");
  }

  function persistFoodEnhanceDraft() {
    var payload = {
      source: "food-enhance",
      preset: state.preset,
      requestedTier: getSelectedTier(),
      createdAt: new Date().toISOString()
    };
    try {
      window.sessionStorage.setItem(FOOD_ENHANCE_DRAFT_KEY, JSON.stringify(payload));
      // payment 페이지의 기존 계약을 깨지 않기 위한 최소 필드
      window.sessionStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify({
        report_goal: "AI 음식 사진 보정 Pro",
        report_note: "source=food-enhance preset=" + state.preset
      }));
    } catch (_error) {
      // ignore storage errors
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(new Error("file_read_failed")); };
      reader.readAsDataURL(file);
    });
  }

  function updatePresetButtons() {
    var buttons = document.querySelectorAll(".food-preset-btn");
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

  async function drawWatermarkAndResize(dataUrl, watermarkText, maxPixels) {
    var img = new Image();
    img.decoding = "async";
    img.src = dataUrl;
    await img.decode();

    var width = img.naturalWidth || img.width;
    var height = img.naturalHeight || img.height;
    var limit = Number(maxPixels || 0);
    if (limit > 0 && (width > limit || height > limit)) {
      var ratio = Math.min(limit / width, limit / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas_not_supported");
    ctx.drawImage(img, 0, 0, width, height);

    if (watermarkText) {
      var size = Math.max(14, Math.round(Math.min(width, height) * 0.04));
      ctx.font = "700 " + size + "px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillText(watermarkText, width - 12, height - 12);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(watermarkText, width - 14, height - 14);
    }

    return canvas.toDataURL("image/png");
  }

  function parseApiError(data, fallback) {
    if (data && data.error && data.error.message) return String(data.error.message);
    return fallback;
  }

  async function requestEnhance(payload) {
    var response = await fetch(endpointFor("/api/image/food-enhance"), {
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
      var err = new Error(parseApiError(data, "이미지 보정 요청에 실패했습니다."));
      err.statusCode = response.status;
      err.apiPayload = data;
      throw err;
    }
    return data || {};
  }

  function updateResultUi() {
    var preview = byId("food-result-preview");
    var meta = byId("food-result-meta");
    var downloadBtn = byId("food-download-btn");
    var shareBtn = byId("food-share-btn");

    if (preview) preview.src = state.resultDataUrl || "";
    if (downloadBtn) downloadBtn.disabled = !state.resultDataUrl;
    if (shareBtn) shareBtn.disabled = !state.resultDataUrl;
    if (meta) {
      if (!state.resultDataUrl) {
        meta.textContent = "";
      } else {
        meta.textContent =
          "모드: " + (state.resultTier === "pro" ? "유료" : "무료") +
          (state.watermarkRequired ? " / 워터마크 적용" : " / 워터마크 없음");
      }
    }
  }

  function applyPostPaymentContextFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var payment = params.get("payment");
    var checkoutId = String(params.get("checkout_id") || "").trim();
    var orderId = String(params.get("order_id") || "").trim();
    if (!payment && !checkoutId && !orderId) return;

    if (payment === "success") {
      var tierPro = document.querySelector("input[name='food-tier'][value='pro']");
      if (tierPro) tierPro.checked = true;
      toggleProFields();
      if (checkoutId && byId("food-checkout-id")) byId("food-checkout-id").value = checkoutId;
      if (orderId && byId("food-order-id")) byId("food-order-id").value = orderId;
      setProActivationBadge(true, "Pro 활성: 결제 확인 완료");
      setStatus("결제가 완료되었습니다. Pro 모드로 보정을 진행해 보세요.", false);
    } else if (payment === "return") {
      setProActivationBadge(false, "");
      setStatus("결제가 취소되었거나 중단되었습니다. 필요하면 다시 결제를 진행해 주세요.", true);
    }
  }

  function setProActivationBadge(active, text) {
    var badge = byId("food-pro-activation-badge");
    var label = byId("food-pro-activation-text");
    if (!badge) return;
    badge.classList.toggle("hidden", !active);
    if (label && text) label.textContent = text;
  }

  function dataUrlToBlob(dataUrl) {
    var parts = String(dataUrl || "").split(",");
    var header = parts[0] || "";
    var base64 = parts[1] || "";
    var mimeMatch = header.match(/data:([^;]+);base64/);
    var mime = mimeMatch ? mimeMatch[1] : "image/png";
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  }

  async function downloadResult() {
    if (!state.resultDataUrl) return;
    var a = document.createElement("a");
    a.href = state.resultDataUrl;
    a.download = "ninanoo-food-enhance-" + new Date().toISOString().slice(0, 10) + ".png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setStatus("보정 이미지를 다운로드했습니다.", false);
  }

  async function shareResult() {
    if (!state.resultDataUrl) return;
    var file = new File([dataUrlToBlob(state.resultDataUrl)], "ninanoo-food-enhance.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "MenuRec 음식 사진 보정",
        text: "AI 음식 사진 보정 결과",
        files: [file]
      });
      setStatus("공유가 완료되었습니다.", false);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setStatus("공유 링크를 복사했습니다.", false);
  }

  async function runEnhance() {
    if (state.processing) return;
    if (!state.file) {
      setStatus("이미지를 먼저 업로드해 주세요.", true);
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(state.file.type)) {
      setStatus("지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 가능합니다.", true);
      return;
    }
    if (state.file.size > MAX_UPLOAD_BYTES) {
      setStatus("파일이 너무 큽니다. 8MB 이하 이미지를 업로드해 주세요.", true);
      return;
    }

    setBusy(true);
    setStatus("이미지를 보정하고 있습니다...", false);
    try {
      var sourceDataUrl = await readFileAsDataUrl(state.file);
      var tier = getSelectedTier();
      var payload = {
        imageBase64: sourceDataUrl,
        mimeType: state.file.type,
        fileName: state.file.name,
        preset: state.preset,
        tier: tier,
        orderId: String((byId("food-order-id") && byId("food-order-id").value) || "").trim(),
        checkoutId: String((byId("food-checkout-id") && byId("food-checkout-id").value) || "").trim(),
        saveOptIn: false
      };
      var result = await requestEnhance(payload);
      var rawDataUrl = "data:image/png;base64," + String(result.imageBase64 || "");
      var watermarkRequired = !!result.watermarkRequired;
      var maxPixels = Number(result.maxRenderPixels || 0);
      var processedDataUrl = rawDataUrl;
      if (watermarkRequired || maxPixels > 0) {
        processedDataUrl = await drawWatermarkAndResize(
          rawDataUrl,
          watermarkRequired ? "NINANOO FREE PREVIEW" : "",
          maxPixels > 0 ? maxPixels : 0
        );
      }
      state.resultDataUrl = processedDataUrl;
      state.resultTier = String(result.tier || "free") === "pro" ? "pro" : "free";
      state.watermarkRequired = watermarkRequired;
      state.maxRenderPixels = maxPixels > 0 ? maxPixels : 0;
      updateResultUi();

      if (result.tier === "pro") {
        setStatus("고해상도 보정이 완료되었습니다.", false);
      } else if (tier === "pro") {
        setStatus("유료 자격이 확인되지 않아 무료 모드(워터마크/저해상도)로 처리되었습니다.", false);
      } else {
        setStatus("무료 모드 보정이 완료되었습니다.", false);
      }
    } catch (error) {
      var message = (error && error.message) || "이미지 보정 중 오류가 발생했습니다.";
      if (error && error.statusCode === 429) {
        message = "요청이 많습니다(429). 잠시 후 다시 시도해 주세요.";
      } else if (error && error.statusCode === 413) {
        message = "파일이 너무 큽니다. 더 작은 파일로 다시 시도해 주세요.";
      } else if (error && error.statusCode === 415) {
        message = "지원 포맷이 아닙니다. JPG/PNG/WEBP 파일만 업로드해 주세요.";
      }
      setStatus(message, true);
    } finally {
      setBusy(false);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var input = byId("food-image-input");
    var originalPreview = byId("food-original-preview");
    var enhanceBtn = byId("food-enhance-btn");
    var downloadBtn = byId("food-download-btn");
    var shareBtn = byId("food-share-btn");
    var presetButtons = document.querySelectorAll(".food-preset-btn");
    var tierRadios = document.querySelectorAll("input[name='food-tier']");
    var goProPaymentBtn = byId("food-go-pro-payment-btn");

    if (input) {
      input.addEventListener("change", function (event) {
        var file = event.target && event.target.files ? event.target.files[0] : null;
        state.file = file || null;
        state.resultDataUrl = "";
        updateResultUi();
        if (!file) {
          if (originalPreview) originalPreview.src = "";
          return;
        }
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          setStatus("지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 가능합니다.", true);
          return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          setStatus("파일이 너무 큽니다. 8MB 이하 이미지를 업로드해 주세요.", true);
          return;
        }
        readFileAsDataUrl(file)
          .then(function (dataUrl) {
            if (originalPreview) originalPreview.src = dataUrl;
            setStatus("이미지 업로드가 완료되었습니다. 프리셋을 선택 후 보정을 시작하세요.", false);
          })
          .catch(function () {
            setStatus("이미지를 읽지 못했습니다.", true);
          });
      });
    }

    presetButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        state.preset = button.getAttribute("data-preset") || "bright";
        updatePresetButtons();
      });
    });

    tierRadios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        toggleProFields();
        if (getSelectedTier() !== "pro") {
          setProActivationBadge(false, "");
        }
      });
    });

    if (enhanceBtn) {
      enhanceBtn.addEventListener("click", runEnhance);
    }
    if (goProPaymentBtn) {
      goProPaymentBtn.addEventListener("click", function () {
        persistFoodEnhanceDraft();
      });
    }
    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        downloadResult().catch(function () {
          setStatus("다운로드에 실패했습니다.", true);
        });
      });
    }
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        shareResult().catch(function () {
          setStatus("공유에 실패했습니다.", true);
        });
      });
    }

    updatePresetButtons();
    toggleProFields();
    updateResultUi();
    applyPostPaymentContextFromQuery();
  });
})();
