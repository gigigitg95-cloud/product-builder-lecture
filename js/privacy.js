const DEFAULT_LANGUAGE = 'English';

function getCountryCodeFromLocale() {
    const locale = (navigator.language || '').trim();
    if (!locale) return null;
    const match = locale.match(/-([A-Za-z]{2})/);
    return match ? match[1].toUpperCase() : null;
}

function getLanguageFromLocale() {
    const locale = (navigator.language || '').trim();
    if (!locale) return null;
    const langCode = locale.split('-')[0].toLowerCase();
    const languageMap = {
        en: 'English',
        ko: 'Korean',
        ja: 'Japanese',
        zh: 'Chinese',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        pt: 'Portuguese',
        ru: 'Russian',
        ar: 'Arabic',
        th: 'Thai',
        vi: 'Vietnamese',
        id: 'Indonesian',
        hi: 'Hindi',
        it: 'Italian'
    };
    return languageMap[langCode] || null;
}

async function getCountryCodeFromIP() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) return null;
        const data = await response.json();
        if (!data || !data.country) return null;
        return String(data.country).toUpperCase();
    } catch (error) {
        return null;
    }
}

async function resolveInitialLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }

    let detectedLanguage = null;

    const ipCountryCode = await getCountryCodeFromIP();
    if (typeof CountryLanguageService !== 'undefined' && ipCountryCode) {
        const languages = CountryLanguageService.getLanguagesByCountryCode(ipCountryCode);
        if (languages) {
            detectedLanguage = languages.find(lang => translations[lang]) || null;
        }
    }

    if (!detectedLanguage && typeof CountryLanguageService !== 'undefined') {
        const localeCountryCode = getCountryCodeFromLocale();
        if (localeCountryCode) {
            const languages = CountryLanguageService.getLanguagesByCountryCode(localeCountryCode);
            if (languages) {
                detectedLanguage = languages.find(lang => translations[lang]) || null;
            }
        }
    }

    if (!detectedLanguage) {
        const localeLanguage = getLanguageFromLocale();
        if (localeLanguage && translations[localeLanguage]) {
            detectedLanguage = localeLanguage;
        }
    }

    return detectedLanguage || DEFAULT_LANGUAGE;
}

(async () => {
    const lang = await resolveInitialLanguage();
    if (!localStorage.getItem('selectedLanguage')) {
        localStorage.setItem('selectedLanguage', lang);
    }
    if (lang !== 'Korean' && typeof getPageTranslation === 'function') {
        const t = key => getPageTranslation(lang, key);
        document.title = t('privacyPageTitle');
        document.getElementById('privacy-title').textContent = t('privacyTitle');
        document.getElementById('privacy-intro').textContent = t('privacyIntro');
        document.getElementById('s1-title').textContent = t('privacySection1Title');
        document.getElementById('s1-desc').textContent = t('privacySection1Desc');
        document.getElementById('s1-item1').innerHTML = t('privacySection1Item1');
        document.getElementById('s1-item2').innerHTML = t('privacySection1Item2');
        document.getElementById('s2-title').textContent = t('privacySection2Title');
        document.getElementById('s2-desc').textContent = t('privacySection2Desc');
        document.getElementById('s2-item1').textContent = t('privacySection2Item1');
        document.getElementById('s2-item2').textContent = t('privacySection2Item2');
        document.getElementById('s2-item3').textContent = t('privacySection2Item3');
        document.getElementById('s3-title').textContent = t('privacySection3Title');
        document.getElementById('s3-desc').textContent = t('privacySection3Desc');
        document.getElementById('s4-title').textContent = t('privacySection4Title');
        document.getElementById('s4-desc').textContent = t('privacySection4Desc');
        document.getElementById('s4-item1').textContent = t('privacySection4Item1');
        document.getElementById('s4-item2').textContent = t('privacySection4Item2');
        document.getElementById('s5-title').textContent = t('privacySection5Title');
        document.getElementById('s5-desc').textContent = t('privacySection5Desc');
        document.getElementById('s6-title').textContent = t('privacySection6Title');
        document.getElementById('s6-desc').innerHTML = t('privacySection6Desc');
        document.getElementById('s7-title').textContent = t('privacySection7Title');
        document.getElementById('s7-desc').textContent = t('privacySection7Desc');
        document.getElementById('s7-item1').textContent = t('privacySection7Item1');
        document.getElementById('s7-item2').textContent = t('privacySection7Item2');
        document.getElementById('s7-item3').textContent = t('privacySection7Item3');
        document.getElementById('s7-item4').textContent = t('privacySection7Item4');
        document.getElementById('s8-title').textContent = t('privacySection8Title');
        document.getElementById('s8-desc').textContent = t('privacySection8Desc');
        document.getElementById('s9-title').textContent = t('privacySection9Title');
        document.getElementById('s9-desc').textContent = t('privacySection9Desc');
        document.getElementById('last-updated-label').textContent = t('lastUpdated');
        document.getElementById('back-link').textContent = t('backToHome');
    }
})();
