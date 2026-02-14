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
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };
        const setHTML = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = value;
        };

        document.title = t('privacyPageTitle');
        setText('privacy-title', t('privacyTitle'));
        setText('privacy-intro', t('privacyIntro'));
        setText('s1-title', t('privacySection1Title'));
        setText('s1-desc', t('privacySection1Desc'));
        setHTML('s1-item1', t('privacySection1Item1'));
        setHTML('s1-item2', t('privacySection1Item2'));
        setText('s2-title', t('privacySection2Title'));
        setText('s2-desc', t('privacySection2Desc'));
        setText('s2-item1', t('privacySection2Item1'));
        setText('s2-item2', t('privacySection2Item2'));
        setText('s2-item3', t('privacySection2Item3'));
        setText('s3-title', t('privacySection3Title'));
        setText('s3-desc', t('privacySection3Desc'));
        setText('s4-title', t('privacySection4Title'));
        setText('s4-desc', t('privacySection4Desc'));
        setText('s4-item1', t('privacySection4Item1'));
        setText('s4-item2', t('privacySection4Item2'));
        setText('s5-title', t('privacySection5Title'));
        setText('s5-desc', t('privacySection5Desc'));
        setText('s6-title', t('privacySection6Title'));
        setHTML('s6-desc', t('privacySection6Desc'));
        setText('s7-title', t('privacySection7Title'));
        setText('s7-desc', t('privacySection7Desc'));
        setText('s7-item1', t('privacySection7Item1'));
        setText('s7-item2', t('privacySection7Item2'));
        setText('s7-item3', t('privacySection7Item3'));
        setText('s7-item4', t('privacySection7Item4'));
        setText('s8-title', t('privacySection8Title'));
        setText('s8-desc', t('privacySection8Desc'));
        setText('s9-title', t('privacySection9Title'));
        setText('s9-desc', t('privacySection9Desc'));
        setText('last-updated-label', t('lastUpdated'));
        setHTML('back-link', `<span class="material-symbols-outlined text-lg">arrow_back</span><span>${t('backToHome')}</span>`);
    }
})();
