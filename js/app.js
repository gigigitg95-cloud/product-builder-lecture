const PEXELS_API_KEY = 'QbxVLvleSjxbgjiZMi0OtIk65nhgmOi43gYXjEawILbJ3OaxeT8qHFYp';
const dinnerMenuKeys = [
    "chicken", "pizza", "porkBelly", "pigFeet", "boiledPork", "tteokbokki", "sundae", "kimbap", "ramen", "udon",
    "sushi", "tonkatsu", "pasta", "steak", "hamburger", "sandwich", "salad", "tacos", "pho", "malatang",
    "bibimbap", "japchae", "kimchijjigae", "sushiRoll", "tempura", "curry", "burrito", "fishAndChips", "paella", "dumplings",
    "friedRice", "jjajangmyeon", "jjampong", "sweetAndSourPork"
];

async function fetchPexelsImage(query) {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${query}+food&per_page=1`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            return data.photos[0].src.large;
        } else {
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'; // Fallback image
        }
    } catch (error) {
        console.error('Error fetching Pexels image:', error);
        return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'; // Fallback image
    }
}

const menuRecommendation = document.getElementById('menu-recommendation');
const menuImage = document.getElementById('menu-image');
const recommendBtn = document.getElementById('recommend-btn');

// Language Selector
const languageBtn = document.getElementById('language-btn');
const languageSelector = document.querySelector('.language-selector');
const languageDropdown = document.getElementById('language-dropdown');
const languageSearch = document.getElementById('language-search');
const languageList = document.getElementById('language-list');
const selectedLanguageEl = document.getElementById('selected-language');

// Restore language from localStorage or default to Korean
let currentLanguage = localStorage.getItem('selectedLanguage') || 'Korean';
let allCountries = [];

// Country code to flag emoji mapping
const countryFlags = {
    'US': '\u{1F1FA}\u{1F1F8}', 'GB': '\u{1F1EC}\u{1F1E7}', 'CA': '\u{1F1E8}\u{1F1E6}', 'AU': '\u{1F1E6}\u{1F1FA}', 'NZ': '\u{1F1F3}\u{1F1FF}',
    'DE': '\u{1F1E9}\u{1F1EA}', 'FR': '\u{1F1EB}\u{1F1F7}', 'ES': '\u{1F1EA}\u{1F1F8}', 'IT': '\u{1F1EE}\u{1F1F9}', 'PT': '\u{1F1F5}\u{1F1F9}',
    'BR': '\u{1F1E7}\u{1F1F7}', 'MX': '\u{1F1F2}\u{1F1FD}', 'AR': '\u{1F1E6}\u{1F1F7}', 'CL': '\u{1F1E8}\u{1F1F1}', 'CO': '\u{1F1E8}\u{1F1F4}',
    'JP': '\u{1F1EF}\u{1F1F5}', 'KR': '\u{1F1F0}\u{1F1F7}', 'CN': '\u{1F1E8}\u{1F1F3}', 'IN': '\u{1F1EE}\u{1F1F3}', 'TH': '\u{1F1F9}\u{1F1ED}',
    'VN': '\u{1F1FB}\u{1F1F3}', 'PH': '\u{1F1F5}\u{1F1ED}', 'ID': '\u{1F1EE}\u{1F1E9}', 'MY': '\u{1F1F2}\u{1F1FE}', 'SG': '\u{1F1F8}\u{1F1EC}',
    'RU': '\u{1F1F7}\u{1F1FA}', 'PL': '\u{1F1F5}\u{1F1F1}', 'UA': '\u{1F1FA}\u{1F1E6}', 'TR': '\u{1F1F9}\u{1F1F7}', 'GR': '\u{1F1EC}\u{1F1F7}',
    'NL': '\u{1F1F3}\u{1F1F1}', 'BE': '\u{1F1E7}\u{1F1EA}', 'CH': '\u{1F1E8}\u{1F1ED}', 'AT': '\u{1F1E6}\u{1F1F9}', 'SE': '\u{1F1F8}\u{1F1EA}',
    'NO': '\u{1F1F3}\u{1F1F4}', 'DK': '\u{1F1E9}\u{1F1F0}', 'FI': '\u{1F1EB}\u{1F1EE}', 'IS': '\u{1F1EE}\u{1F1F8}', 'IE': '\u{1F1EE}\u{1F1EA}',
    'IL': '\u{1F1EE}\u{1F1F1}', 'SA': '\u{1F1F8}\u{1F1E6}', 'AE': '\u{1F1E6}\u{1F1EA}', 'EG': '\u{1F1EA}\u{1F1EC}', 'ZA': '\u{1F1FF}\u{1F1E6}',
    'NG': '\u{1F1F3}\u{1F1EC}', 'KE': '\u{1F1F0}\u{1F1EA}', 'ET': '\u{1F1EA}\u{1F1F9}', 'MA': '\u{1F1F2}\u{1F1E6}', 'DZ': '\u{1F1E9}\u{1F1FF}',
    'AF': '\u{1F1E6}\u{1F1EB}', 'PK': '\u{1F1F5}\u{1F1F0}', 'BD': '\u{1F1E7}\u{1F1E9}', 'LK': '\u{1F1F1}\u{1F1F0}', 'NP': '\u{1F1F3}\u{1F1F5}',
    'MM': '\u{1F1F2}\u{1F1F2}', 'KH': '\u{1F1F0}\u{1F1ED}', 'LA': '\u{1F1F1}\u{1F1E6}', 'TW': '\u{1F1F9}\u{1F1FC}', 'HK': '\u{1F1ED}\u{1F1F0}',
    'IR': '\u{1F1EE}\u{1F1F7}', 'IQ': '\u{1F1EE}\u{1F1F6}', 'SY': '\u{1F1F8}\u{1F1FE}', 'JO': '\u{1F1EF}\u{1F1F4}', 'LB': '\u{1F1F1}\u{1F1E7}',
    'KW': '\u{1F1F0}\u{1F1FC}', 'QA': '\u{1F1F6}\u{1F1E6}', 'AL': '\u{1F1E6}\u{1F1F1}', 'BG': '\u{1F1E7}\u{1F1EC}', 'HR': '\u{1F1ED}\u{1F1F7}',
    'CZ': '\u{1F1E8}\u{1F1FF}', 'HU': '\u{1F1ED}\u{1F1FA}',
    'RO': '\u{1F1F7}\u{1F1F4}', 'RS': '\u{1F1F7}\u{1F1F8}', 'SK': '\u{1F1F8}\u{1F1F0}', 'SI': '\u{1F1F8}\u{1F1EE}', 'EE': '\u{1F1EA}\u{1F1EA}', 'LV': '\u{1F1F1}\u{1F1FB}', 'LT': '\u{1F1F1}\u{1F1F9}', 'CU': '\u{1F1E8}\u{1F1FA}',
    'PE': '\u{1F1F5}\u{1F1EA}', 'VE': '\u{1F1FB}\u{1F1EA}', 'UY': '\u{1F1FA}\u{1F1FE}', 'UZ': '\u{1F1FA}\u{1F1FF}', 'KZ': '\u{1F1F0}\u{1F1FF}',
    'MN': '\u{1F1F2}\u{1F1F3}', 'YE': '\u{1F1FE}\u{1F1EA}', 'ZW': '\u{1F1FF}\u{1F1FC}', 'LU': '\u{1F1F1}\u{1F1FA}'
};

// Initialize language selector
function initLanguageSelector() {
    if (typeof CountryLanguageService !== 'undefined') {
        allCountries = CountryLanguageService.getAllCountries();
        renderLanguageList(allCountries);
    }

    // Restore saved language on load
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
        selectedLanguageEl.textContent = savedLang;
    }
    applyTranslations();
}

// Render language list
function renderLanguageList(countries) {
    languageList.innerHTML = '';

    countries.forEach(country => {
        const item = document.createElement('div');
        item.className = 'language-item';

        const flag = countryFlags[country.code] || '\u{1F310}';
        const mainLanguage = country.languages[0];

        item.innerHTML = `
            <span class="flag">${flag}</span>
            <span class="country-name">${country.country}</span>
            <span class="lang-code">${country.code}</span>
        `;

        item.addEventListener('click', () => {
            selectLanguage(country.country, mainLanguage, flag);
        });

        languageList.appendChild(item);
    });
}

// Get translation for current language (fallback to English)
function getTranslation(key) {
    const lang = translations[currentLanguage] || translations['English'];
    return lang[key] || translations['English'][key];
}

// Get menu name translation
function getMenuTranslation(menuKey) {
    const lang = menuTranslations[currentLanguage] || menuTranslations['English'];
    return lang[menuKey] || menuTranslations['English'][menuKey];
}

// Apply translations to all UI elements
function applyTranslations() {
    const t = translations[currentLanguage] || translations['English'];

    // Update page title
    document.title = t.title;

    // Update header
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) {
        headerTitle.textContent = t.title;
    }

    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t.subtitle;

    // Update recommendation section
    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles[0]) sectionTitles[0].textContent = t.todayRecommendation;
    if (sectionTitles[1]) sectionTitles[1].textContent = t.partnershipTitle;

    // Update menu recommendation placeholder
    const menuRec = document.getElementById('menu-recommendation');
    if (menuRec && menuRec.textContent === 'Click the button below!' ||
        menuRec && !menuRec.dataset.hasRecommendation) {
        menuRec.textContent = t.clickButton;
    }

    // Update recommend button
    const btnText = recommendBtn.querySelector('.btn-text');
    if (btnText) {
        if (btnText.textContent.includes('Loading') || btnText.textContent.includes('로딩') ||
            btnText.textContent.includes('読み込み') || btnText.textContent.includes('加载')) {
            btnText.textContent = t.loadingImage;
        } else if (btnText.textContent.includes('Another') || btnText.textContent.includes('다른') ||
                   btnText.textContent.includes('別') || btnText.textContent.includes('换')) {
            btnText.textContent = t.getAnother;
        } else {
            btnText.textContent = t.getRecommendation;
        }
    }

    // Update contact section
    const contactDesc = document.querySelector('.contact-desc');
    if (contactDesc) contactDesc.textContent = t.partnershipDesc;

    // Update form labels and placeholders
    const labelTexts = document.querySelectorAll('.label-text');
    if (labelTexts[0]) labelTexts[0].textContent = t.email;
    if (labelTexts[1]) labelTexts[1].textContent = t.message;

    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) emailInput.placeholder = t.emailPlaceholder;

    const messageTextarea = document.querySelector('textarea[name="message"]');
    if (messageTextarea) messageTextarea.placeholder = t.messagePlaceholder;

    // Update submit button
    const submitBtn = document.querySelector('.submit-btn span');
    if (submitBtn) submitBtn.textContent = t.sendMessage;

    // Update footer
    const footer = document.querySelector('footer p');
    if (footer) footer.textContent = t.footer;

    // Update footer links
    const aboutLink = document.getElementById('about-link');
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    if (aboutLink) {
        aboutLink.textContent = getPageTranslation(currentLanguage, 'aboutTitle');
        aboutLink.href = `about.html?lang=${currentLanguage}`;
    }
    if (privacyLink) {
        privacyLink.textContent = getPageTranslation(currentLanguage, 'privacyTitle');
        privacyLink.href = `privacy.html?lang=${currentLanguage}`;
    }
    if (termsLink) {
        termsLink.textContent = getPageTranslation(currentLanguage, 'termsTitle');
        termsLink.href = `terms.html?lang=${currentLanguage}`;
    }

    // Update search placeholder
    const searchInput = document.getElementById('language-search');
    if (searchInput) searchInput.placeholder = t.searchLanguages;

    // Update Food Tips Section
    const foodTipsTitle = document.getElementById('food-tips-title');
    if (foodTipsTitle) foodTipsTitle.textContent = t.foodTipsTitle;

    const tipCards = document.querySelectorAll('.tip-card');
    if (tipCards.length > 0) {
        tipCards[0].querySelector('h3').textContent = t.foodTip1Title;
        tipCards[0].querySelector('p').textContent = t.foodTip1Desc;
        tipCards[1].querySelector('h3').textContent = t.foodTip2Title;
        tipCards[1].querySelector('p').textContent = t.foodTip2Desc;
        tipCards[2].querySelector('h3').textContent = t.foodTip3Title;
        tipCards[2].querySelector('p').textContent = t.foodTip3Desc;
        tipCards[3].querySelector('h3').textContent = t.foodTip4Title;
        tipCards[3].querySelector('p').textContent = t.foodTip4Desc;
    }

    // Update How to Use Section
    const howToUseTitle = document.getElementById('how-to-use-title');
    if (howToUseTitle) howToUseTitle.textContent = t.howToUseTitle;

    const steps = document.querySelectorAll('.step-content');
    if (steps.length > 0) {
        steps[0].querySelector('h3').textContent = t.howToUseStep1Title;
        steps[0].querySelector('p').textContent = t.howToUseStep1Desc;
        steps[1].querySelector('h3').textContent = t.howToUseStep2Title;
        steps[1].querySelector('p').textContent = t.howToUseStep2Desc;
        steps[2].querySelector('h3').textContent = t.howToUseStep3Title;
        steps[2].querySelector('p').textContent = t.howToUseStep3Desc;
    }
}

// Select language
function selectLanguage(country, language, flag) {
    currentLanguage = language;

    // Save to localStorage for sub-pages
    localStorage.setItem('selectedLanguage', language);

    // Update the language bar to show flag and language name immediately
    const iconSpan = languageBtn.querySelector('.icon');
    iconSpan.textContent = flag;
    selectedLanguageEl.textContent = language;

    languageSelector.classList.remove('active');

    // Apply translations to the entire page
    applyTranslations();

    // Show notification
    const t = translations[currentLanguage] || translations['English'];
    showNotification(`${t.selected}: ${country} - ${language}`, flag);
}

// Show notification
function showNotification(message, flag) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--control-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 16px 24px;
        box-shadow: 0 8px 30px var(--shadow-color);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-color);
        font-size: 0.95rem;
    `;
    notification.innerHTML = `<span style="font-size: 1.3rem;">${flag}</span><span>${message}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Toggle language dropdown
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageSelector.classList.toggle('active');
    if (languageSelector.classList.contains('active')) {
        languageSearch.focus();
    }
});

// Search languages
languageSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allCountries.filter(country =>
        country.country.toLowerCase().includes(searchTerm) ||
        country.languages.some(lang => lang.toLowerCase().includes(searchTerm)) ||
        country.code.toLowerCase().includes(searchTerm)
    );
    renderLanguageList(filtered);
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!languageSelector.contains(e.target)) {
        languageSelector.classList.remove('active');
    }
});

// Prevent dropdown from closing when clicking inside
languageDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Menu Recommendation
document.getElementById('recommend-btn').addEventListener('click', async () => {
    const randomIndex = Math.floor(Math.random() * dinnerMenuKeys.length);
    const recommendedMenuKey = dinnerMenuKeys[randomIndex];
    const t = translations[currentLanguage] || translations['English'];

    // Display menu name based on selected language
    const menuText = getMenuTranslation(recommendedMenuKey);

    // Update menu text with animation
    menuRecommendation.style.opacity = '0';
    setTimeout(() => {
        menuRecommendation.textContent = menuText;
        menuRecommendation.dataset.hasRecommendation = 'true';
        menuRecommendation.style.opacity = '1';
    }, 200);

    // Show loading state
    recommendBtn.disabled = true;
    recommendBtn.innerHTML = `<span class="btn-icon">⏳</span><span class="btn-text">${t.loadingImage}</span>`;
    menuImage.style.opacity = '0.5';

    const imageUrl = await fetchPexelsImage(recommendedMenuKey);

    // Preload image to avoid flashing
    const img = new Image();
    img.onload = () => {
        menuImage.src = imageUrl;
        menuImage.alt = menuText + ' - ' + (t.imageAlt || 'recommended menu photo');
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = `<span class="btn-icon">🎲</span><span class="btn-text">${t.getAnother}</span>`;
    };
    img.onerror = () => {
        console.error('Error loading image for:', recommendedMenuKey);
        menuImage.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = `<span class="btn-icon">🎲</span><span class="btn-text">${t.getAnother}</span>`;
    };
    img.src = imageUrl;
});

// Theme Toggle
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const t = translations[currentLanguage] || translations['English'];
    const isLight = document.body.classList.contains('light-mode');
    showNotification(isLight ? t.lightMode : t.darkMode, isLight ? '\u2600\uFE0F' : '\u{1F319}');
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize
initLanguageSelector();
