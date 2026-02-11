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
        document.title = t('termsPageTitle');
        document.getElementById('terms-title').textContent = t('termsTitle');
        document.getElementById('terms-intro').textContent = t('termsIntro');
        document.getElementById('t1-title').textContent = t('termsSection1Title');
        document.getElementById('t1-desc').textContent = t('termsSection1Desc');
        document.getElementById('t2-title').textContent = t('termsSection2Title');
        document.getElementById('t2-desc').textContent = t('termsSection2Desc');
        document.getElementById('t2-item1').textContent = t('termsSection2Item1');
        document.getElementById('t2-item2').textContent = t('termsSection2Item2');
        document.getElementById('t2-item3').textContent = t('termsSection2Item3');
        document.getElementById('t2-item4').textContent = t('termsSection2Item4');
        document.getElementById('t3-title').textContent = t('termsSection3Title');
        document.getElementById('t3-desc').textContent = t('termsSection3Desc');
        document.getElementById('t4-title').textContent = t('termsSection4Title');
        document.getElementById('t4-desc').textContent = t('termsSection4Desc');
        document.getElementById('t4-item1').textContent = t('termsSection4Item1');
        document.getElementById('t4-item2').textContent = t('termsSection4Item2');
        document.getElementById('t4-item3').textContent = t('termsSection4Item3');
        document.getElementById('t4-item4').textContent = t('termsSection4Item4');
        document.getElementById('t5-title').textContent = t('termsSection5Title');
        document.getElementById('t5-desc').textContent = t('termsSection5Desc');
        document.getElementById('t6-title').textContent = t('termsSection6Title');
        document.getElementById('t6-desc').textContent = t('termsSection6Desc');
        document.getElementById('t7-title').textContent = t('termsSection7Title');
        document.getElementById('t7-item1').textContent = t('termsSection7Item1');
        document.getElementById('t7-item2').textContent = t('termsSection7Item2');
        document.getElementById('t7-item3').textContent = t('termsSection7Item3');
        document.getElementById('t8-title').textContent = t('termsSection8Title');
        document.getElementById('t8-desc').textContent = t('termsSection8Desc');
        document.getElementById('t9-title').textContent = t('termsSection9Title');
        document.getElementById('t9-desc').textContent = t('termsSection9Desc');
        document.getElementById('t10-title').textContent = t('termsSection10Title');
        document.getElementById('t10-desc').textContent = t('termsSection10Desc');
        document.getElementById('last-updated-label').textContent = t('lastUpdated');
        document.getElementById('back-link').textContent = t('backToHome');
    }
})();
