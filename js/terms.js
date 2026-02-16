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

        document.title = t('termsPageTitle');
        setText('terms-title', t('termsTitle'));
        setText('terms-intro', t('termsIntro'));
        setText('t1-title', t('termsSection1Title'));
        setText('t1-desc', t('termsSection1Desc'));
        setText('t2-title', t('termsSection2Title'));
        setText('t2-desc', t('termsSection2Desc'));
        setText('t2-item1', t('termsSection2Item1'));
        setText('t2-item2', t('termsSection2Item2'));
        setText('t2-item3', t('termsSection2Item3'));
        setText('t2-item4', t('termsSection2Item4'));
        setText('t3-title', t('termsSection3Title'));
        setText('t3-desc', t('termsSection3Desc'));
        setText('t4-title', t('termsSection4Title'));
        setText('t4-desc', t('termsSection4Desc'));
        setText('t4-item1', t('termsSection4Item1'));
        setText('t4-item2', t('termsSection4Item2'));
        setText('t4-item3', t('termsSection4Item3'));
        setText('t4-item4', t('termsSection4Item4'));
        setText('t5-title', t('termsSection5Title'));
        setText('t5-desc', t('termsSection5Desc'));
        setText('t6-title', t('termsSection6Title'));
        setText('t6-desc', t('termsSection6Desc'));
        setText('t7-title', t('termsSection7Title'));
        setText('t7-item1', t('termsSection7Item1'));
        setText('t7-item2', t('termsSection7Item2'));
        setText('t7-item3', t('termsSection7Item3'));
        setText('t8-title', t('termsSection8Title'));
        setText('t8-desc', t('termsSection8Desc'));
        setText('t9-title', t('termsSection9Title'));
        setText('t9-desc', t('termsSection9Desc'));
        setText('t10-title', t('termsSection10Title'));
        setText('t10-desc', t('termsSection10Desc'));
        setText('t11-title', t('termsSection11Title'));
        setText('t11-desc', t('termsSection11Desc'));
        setText('t12-title', t('termsSection12Title'));
        setText('t12-desc', t('termsSection12Desc'));
        setText('last-updated-label', t('lastUpdated'));
        setHTML('back-link', `<span class="material-symbols-outlined text-lg">arrow_back</span><span>${t('backToHome')}</span>`);
    }
})();
