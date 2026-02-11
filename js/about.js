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
        const sub = (translations[lang] || translations['English']).subtitle;

        document.title = t('aboutPageTitle');
        document.getElementById('page-title').textContent = '\u{1F37D}\u{FE0F} ' + t('aboutTitle');
        document.getElementById('page-subtitle').textContent = sub;
        document.getElementById('back-link').textContent = t('backToHome');

        document.getElementById('about-intro-title').textContent = t('aboutIntroTitle');
        document.getElementById('about-intro-p1').textContent = t('aboutIntroP1');
        document.getElementById('about-intro-p2').textContent = t('aboutIntroP2');
        document.getElementById('about-intro-p3').textContent = t('aboutIntroP3');
        document.getElementById('about-features-title').textContent = t('aboutFeaturesTitle');
        document.getElementById('about-f1-title').textContent = t('aboutFeature1Title');
        document.getElementById('about-f1-desc').textContent = t('aboutFeature1Desc');
        document.getElementById('about-f2-title').textContent = t('aboutFeature2Title');
        document.getElementById('about-f2-desc').textContent = t('aboutFeature2Desc');
        document.getElementById('about-f3-title').textContent = t('aboutFeature3Title');
        document.getElementById('about-f3-desc').textContent = t('aboutFeature3Desc');
        document.getElementById('about-f4-title').textContent = t('aboutFeature4Title');
        document.getElementById('about-f4-desc').textContent = t('aboutFeature4Desc');
        document.getElementById('about-stats-title').textContent = t('aboutStatsTitle');
        document.getElementById('stat-menus').textContent = t('aboutStatMenus');
        document.getElementById('stat-languages').textContent = t('aboutStatLanguages');
        document.getElementById('stat-countries').textContent = t('aboutStatCountries');
        document.getElementById('stat-free').textContent = t('aboutStatFree');
        document.getElementById('about-menu-list-title').textContent = t('aboutMenuListTitle');
        document.getElementById('about-menu-list-desc').textContent = t('aboutMenuListDesc');
        document.getElementById('menu-korean-title').textContent = t('aboutMenuKorean');
        document.getElementById('menu-korean-items').textContent = t('aboutMenuKoreanItems');
        document.getElementById('menu-japanese-title').textContent = t('aboutMenuJapaneseItems') ? t('aboutMenuJapanese') : '';
        document.getElementById('menu-japanese-items').textContent = t('aboutMenuJapaneseItems');
        document.getElementById('menu-western-title').textContent = t('aboutMenuWestern');
        document.getElementById('menu-western-items').textContent = t('aboutMenuWesternItems');
        document.getElementById('menu-other-title').textContent = t('aboutMenuOther');
        document.getElementById('menu-other-items').textContent = t('aboutMenuOtherItems');
        document.getElementById('about-howto-title').textContent = t('aboutHowToTitle');
        document.getElementById('about-step1').innerHTML = t('aboutStep1');
        document.getElementById('about-step2').innerHTML = t('aboutStep2');
        document.getElementById('about-step3').innerHTML = t('aboutStep3');
        document.getElementById('about-tip').innerHTML = t('aboutTip');
        document.getElementById('about-contact-title').textContent = t('aboutContactTitle');
        document.getElementById('about-contact-p1').textContent = t('aboutContactP1');
        document.getElementById('about-contact-p2').textContent = t('aboutContactP2');
    }
})();
