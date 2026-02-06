const PEXELS_API_KEY = 'QbxVLvleSjxbgjiZMi0OtIk65nhgmOi43gYXjEawILbJ3OaxeT8qHFYp';
const dinnerMenuKeys = [
    "chicken", "pizza", "porkBelly", "pigFeet", "boiledPork", "tteokbokki", "sundae", "kimbap", "ramen", "udon",
    "sushi", "tonkatsu", "pasta", "steak", "hamburger", "sandwich", "salad", "tacos", "pho", "malatang",
    "bibimbap", "japchae", "kimchijjigae", "sushiRoll", "tempura", "curry", "burrito", "fishAndChips", "paella", "dumplings",
    "friedRice", "jjajangmyeon", "jjampong", "sweetAndSourPork"
];

// Roulette menu items with categories
const rouletteMenus = {
    korean: [
        { key: 'bibimbap', ko: '비빔밥', en: 'Bibimbap' },
        { key: 'kimchijjigae', ko: '김치찌개', en: 'Kimchi Stew' },
        { key: 'bulgogi', ko: '불고기', en: 'Bulgogi' },
        { key: 'japchae', ko: '잡채', en: 'Japchae' },
        { key: 'samgyetang', ko: '삼계탕', en: 'Ginseng Chicken' },
        { key: 'sundubu', ko: '순두부찌개', en: 'Soft Tofu Stew' },
        { key: 'galbi', ko: '갈비', en: 'Korean BBQ Ribs' },
        { key: 'tteokbokki', ko: '떡볶이', en: 'Tteokbokki' }
    ],
    chinese: [
        { key: 'jjajangmyeon', ko: '짜장면', en: 'Jjajangmyeon' },
        { key: 'jjampong', ko: '짬뽕', en: 'Spicy Seafood Noodle' },
        { key: 'sweetAndSourPork', ko: '탕수육', en: 'Sweet & Sour Pork' },
        { key: 'malatang', ko: '마라탕', en: 'Malatang' },
        { key: 'mapa', ko: '마파두부', en: 'Mapo Tofu' },
        { key: 'friedRice', ko: '볶음밥', en: 'Fried Rice' },
        { key: 'dumplings', ko: '만두', en: 'Dumplings' },
        { key: 'jambong', ko: '간짜장', en: 'Dry Jjajang' }
    ],
    japanese: [
        { key: 'sushi', ko: '초밥', en: 'Sushi' },
        { key: 'ramen', ko: '라멘', en: 'Ramen' },
        { key: 'tonkatsu', ko: '돈카츠', en: 'Tonkatsu' },
        { key: 'udon', ko: '우동', en: 'Udon' },
        { key: 'tempura', ko: '텐푸라', en: 'Tempura' },
        { key: 'curry', ko: '카레', en: 'Japanese Curry' },
        { key: 'soba', ko: '소바', en: 'Soba' },
        { key: 'katsudon', ko: '카츠동', en: 'Katsudon' }
    ],
    western: [
        { key: 'steak', ko: '스테이크', en: 'Steak' },
        { key: 'pasta', ko: '파스타', en: 'Pasta' },
        { key: 'pizza', ko: '피자', en: 'Pizza' },
        { key: 'hamburger', ko: '햄버거', en: 'Hamburger' },
        { key: 'salad', ko: '샐러드', en: 'Salad' },
        { key: 'risotto', ko: '리조또', en: 'Risotto' },
        { key: 'sandwich', ko: '샌드위치', en: 'Sandwich' },
        { key: 'fishAndChips', ko: '피쉬앤칩스', en: 'Fish & Chips' }
    ]
};

// Roulette colors
const rouletteColors = [
    '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
    '#8b5cf6', '#ef4444', '#22c55e', '#3b82f6',
    '#f97316', '#06b6d4', '#84cc16', '#a855f7'
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

    // Update bulletin board translations
    if (typeof updateBulletinTranslations === 'function') {
        updateBulletinTranslations();
    }

    // Update roulette translations
    if (typeof updateRouletteTranslations === 'function') {
        updateRouletteTranslations();
    }

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

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "productai-8845e.firebaseapp.com",
    projectId: "productai-8845e",
    storageBucket: "productai-8845e.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:xxxxxxxxxxxxxxxx"
};

// Initialize Firebase
let db;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (e) {
    console.log('Firebase initialization skipped or failed:', e);
}

// Bulletin Board functionality
const bulletinForm = document.getElementById('bulletin-form');
const bulletinNickname = document.getElementById('bulletin-nickname');
const bulletinMessage = document.getElementById('bulletin-message');
const bulletinPosts = document.getElementById('bulletin-posts');
const bulletinLoading = document.getElementById('bulletin-loading');
const bulletinSubmit = document.getElementById('bulletin-submit');

// Get bulletin translations
function getBulletinTranslation(key) {
    const t = translations[currentLanguage] || translations['English'];
    const bulletinTranslations = {
        'English': {
            title: 'Community Board',
            desc: 'What did you eat today? Share your food stories with others!',
            nicknamePlaceholder: 'Nickname',
            messagePlaceholder: 'Enter your message...',
            submit: 'Post',
            loading: 'Loading posts...',
            empty: 'No posts yet. Be the first to share!',
            justNow: 'Just now',
            minutesAgo: 'minutes ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago'
        },
        'Korean': {
            title: '커뮤니티 게시판',
            desc: '오늘 뭐 먹었나요? 다른 사용자들과 음식 이야기를 나눠보세요!',
            nicknamePlaceholder: '닉네임',
            messagePlaceholder: '메시지를 입력하세요...',
            submit: '게시',
            loading: '게시물을 불러오는 중...',
            empty: '아직 게시물이 없습니다. 첫 번째로 공유해보세요!',
            justNow: '방금 전',
            minutesAgo: '분 전',
            hoursAgo: '시간 전',
            daysAgo: '일 전'
        },
        'Japanese': {
            title: 'コミュニティ掲示板',
            desc: '今日は何を食べましたか？他のユーザーと食べ物の話を共有しましょう！',
            nicknamePlaceholder: 'ニックネーム',
            messagePlaceholder: 'メッセージを入力...',
            submit: '投稿',
            loading: '投稿を読み込み中...',
            empty: 'まだ投稿がありません。最初に共有してください！',
            justNow: 'たった今',
            minutesAgo: '分前',
            hoursAgo: '時間前',
            daysAgo: '日前'
        },
        'Mandarin Chinese': {
            title: '社区留言板',
            desc: '今天吃了什么？与其他用户分享您的美食故事！',
            nicknamePlaceholder: '昵称',
            messagePlaceholder: '输入您的消息...',
            submit: '发布',
            loading: '加载帖子中...',
            empty: '还没有帖子。成为第一个分享的人！',
            justNow: '刚刚',
            minutesAgo: '分钟前',
            hoursAgo: '小时前',
            daysAgo: '天前'
        },
        'Spanish': {
            title: 'Tablón Comunitario',
            desc: '¿Qué comiste hoy? ¡Comparte tus historias de comida con otros!',
            nicknamePlaceholder: 'Apodo',
            messagePlaceholder: 'Escribe tu mensaje...',
            submit: 'Publicar',
            loading: 'Cargando publicaciones...',
            empty: 'Aún no hay publicaciones. ¡Sé el primero en compartir!',
            justNow: 'Justo ahora',
            minutesAgo: 'minutos atrás',
            hoursAgo: 'horas atrás',
            daysAgo: 'días atrás'
        }
    };

    const langData = bulletinTranslations[currentLanguage] || bulletinTranslations['English'];
    return langData[key] || bulletinTranslations['English'][key];
}

// Format time ago
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return getBulletinTranslation('justNow');
    if (minutes < 60) return `${minutes} ${getBulletinTranslation('minutesAgo')}`;
    if (hours < 24) return `${hours} ${getBulletinTranslation('hoursAgo')}`;
    return `${days} ${getBulletinTranslation('daysAgo')}`;
}

// Render a single post
function renderPost(post) {
    const postEl = document.createElement('div');
    postEl.className = 'bulletin-post';
    postEl.innerHTML = `
        <div class="bulletin-post-header">
            <span class="bulletin-post-nickname">${escapeHtml(post.nickname)}</span>
            <span class="bulletin-post-time">${formatTimeAgo(post.timestamp)}</span>
        </div>
        <div class="bulletin-post-message">${escapeHtml(post.message)}</div>
    `;
    return postEl;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load posts from Firestore
async function loadPosts() {
    if (!db) {
        // Fallback to localStorage if Firebase is not available
        loadPostsFromLocalStorage();
        return;
    }

    try {
        const snapshot = await db.collection('bulletin')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        bulletinPosts.innerHTML = '';

        if (snapshot.empty) {
            bulletinPosts.innerHTML = `<div class="bulletin-empty">${getBulletinTranslation('empty')}</div>`;
            return;
        }

        snapshot.forEach(doc => {
            const post = doc.data();
            bulletinPosts.appendChild(renderPost(post));
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        loadPostsFromLocalStorage();
    }
}

// Fallback: Load posts from localStorage
function loadPostsFromLocalStorage() {
    const posts = JSON.parse(localStorage.getItem('bulletinPosts') || '[]');
    bulletinPosts.innerHTML = '';

    if (posts.length === 0) {
        bulletinPosts.innerHTML = `<div class="bulletin-empty">${getBulletinTranslation('empty')}</div>`;
        return;
    }

    posts.sort((a, b) => b.timestamp - a.timestamp);
    posts.slice(0, 50).forEach(post => {
        bulletinPosts.appendChild(renderPost(post));
    });
}

// Save post
async function savePost(nickname, message) {
    const post = {
        nickname: nickname.trim(),
        message: message.trim(),
        timestamp: Date.now()
    };

    if (db) {
        try {
            await db.collection('bulletin').add(post);
            return true;
        } catch (error) {
            console.error('Error saving to Firestore:', error);
        }
    }

    // Fallback to localStorage
    const posts = JSON.parse(localStorage.getItem('bulletinPosts') || '[]');
    posts.unshift(post);
    localStorage.setItem('bulletinPosts', JSON.stringify(posts.slice(0, 100)));
    return true;
}

// Handle form submission
if (bulletinForm) {
    bulletinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nickname = bulletinNickname.value.trim();
        const message = bulletinMessage.value.trim();

        if (!nickname || !message) return;

        bulletinSubmit.disabled = true;

        const success = await savePost(nickname, message);

        if (success) {
            bulletinMessage.value = '';
            localStorage.setItem('bulletinNickname', nickname);
            await loadPosts();
        }

        bulletinSubmit.disabled = false;
    });

    // Restore saved nickname
    const savedNickname = localStorage.getItem('bulletinNickname');
    if (savedNickname && bulletinNickname) {
        bulletinNickname.value = savedNickname;
    }
}

// Update bulletin board translations
function updateBulletinTranslations() {
    const titleEl = document.getElementById('bulletin-title');
    const descEl = document.getElementById('bulletin-desc');

    if (titleEl) titleEl.textContent = getBulletinTranslation('title');
    if (descEl) descEl.textContent = getBulletinTranslation('desc');
    if (bulletinNickname) bulletinNickname.placeholder = getBulletinTranslation('nicknamePlaceholder');
    if (bulletinMessage) bulletinMessage.placeholder = getBulletinTranslation('messagePlaceholder');
    if (bulletinSubmit) bulletinSubmit.querySelector('span').textContent = getBulletinTranslation('submit');
    if (bulletinLoading) bulletinLoading.textContent = getBulletinTranslation('loading');

    // Refresh posts to update time format
    const emptyEl = bulletinPosts?.querySelector('.bulletin-empty');
    if (emptyEl) {
        emptyEl.textContent = getBulletinTranslation('empty');
    }
}

// ============ ROULETTE FUNCTIONALITY ============

const rouletteWheel = document.getElementById('roulette-wheel');
const rouletteSpinBtn = document.getElementById('roulette-spin-btn');
const rouletteResult = document.getElementById('roulette-result');
const rouletteResultText = document.getElementById('roulette-result-text');
const categoryFilter = document.getElementById('category-filter');

let currentCategory = 'all';
let currentRouletteMenus = [];
let isSpinning = false;
let currentRotation = 0;

// Get roulette translation
function getRouletteTranslation(key) {
    const translations = {
        'English': {
            title: 'Menu Roulette',
            desc: 'Spin the wheel to decide your meal!',
            all: 'All',
            korean: 'Korean',
            chinese: 'Chinese',
            japanese: 'Japanese',
            western: 'Western',
            spin: 'SPIN',
            result: 'Today\'s menu is'
        },
        'Korean': {
            title: '메뉴 룰렛',
            desc: '룰렛을 돌려서 오늘의 메뉴를 정해보세요!',
            all: '전체',
            korean: '한식',
            chinese: '중식',
            japanese: '일식',
            western: '양식',
            spin: 'SPIN',
            result: '오늘의 메뉴는'
        },
        'Japanese': {
            title: 'メニュールーレット',
            desc: 'ルーレットを回して今日のメニューを決めよう！',
            all: '全て',
            korean: '韓国料理',
            chinese: '中華',
            japanese: '和食',
            western: '洋食',
            spin: 'SPIN',
            result: '今日のメニューは'
        },
        'Mandarin Chinese': {
            title: '菜单转盘',
            desc: '转动轮盘来决定今天吃什么！',
            all: '全部',
            korean: '韩餐',
            chinese: '中餐',
            japanese: '日料',
            western: '西餐',
            spin: 'SPIN',
            result: '今天的菜单是'
        }
    };
    const langData = translations[currentLanguage] || translations['English'];
    return langData[key] || translations['English'][key];
}

// Get menu name based on language
function getRouletteMenuName(menu) {
    if (currentLanguage === 'Korean') return menu.ko;
    return menu.en;
}

// Build wheel menus based on category
function buildWheelMenus() {
    if (currentCategory === 'all') {
        currentRouletteMenus = [
            ...rouletteMenus.korean.slice(0, 3),
            ...rouletteMenus.chinese.slice(0, 3),
            ...rouletteMenus.japanese.slice(0, 3),
            ...rouletteMenus.western.slice(0, 3)
        ];
    } else {
        currentRouletteMenus = [...rouletteMenus[currentCategory]];
    }
    renderWheel();
}

// Render the wheel segments
function renderWheel() {
    if (!rouletteWheel) return;

    rouletteWheel.innerHTML = '';
    const segmentCount = currentRouletteMenus.length;
    const segmentAngle = 360 / segmentCount;

    currentRouletteMenus.forEach((menu, index) => {
        const segment = document.createElement('div');
        segment.className = 'roulette-segment';
        segment.style.transform = `rotate(${index * segmentAngle - 90}deg) skewY(${-(90 - segmentAngle)}deg)`;
        segment.style.backgroundColor = rouletteColors[index % rouletteColors.length];

        const content = document.createElement('span');
        content.className = 'roulette-segment-content';
        content.style.transform = `skewY(${90 - segmentAngle}deg) rotate(${segmentAngle / 2}deg)`;
        content.textContent = getRouletteMenuName(menu);

        segment.appendChild(content);
        rouletteWheel.appendChild(segment);
    });
}

// Spin the wheel
function spinWheel() {
    if (isSpinning || !rouletteWheel) return;

    isSpinning = true;
    rouletteSpinBtn.disabled = true;
    rouletteResultText.textContent = '';
    rouletteResult.style.opacity = '0';

    const segmentCount = currentRouletteMenus.length;
    const segmentAngle = 360 / segmentCount;

    // Random number of full rotations (5-8) plus random segment
    const fullRotations = 5 + Math.floor(Math.random() * 4);
    const randomSegment = Math.floor(Math.random() * segmentCount);
    const extraAngle = randomSegment * segmentAngle + segmentAngle / 2;

    const totalRotation = currentRotation + (fullRotations * 360) + extraAngle;
    currentRotation = totalRotation;

    rouletteWheel.classList.add('spinning');
    rouletteWheel.style.transform = `rotate(${totalRotation}deg)`;

    // Show result after spin
    setTimeout(() => {
        isSpinning = false;
        rouletteSpinBtn.disabled = false;
        rouletteWheel.classList.remove('spinning');

        // Calculate which segment is at the top
        const normalizedRotation = totalRotation % 360;
        const winningIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % segmentCount;
        const winningMenu = currentRouletteMenus[winningIndex];

        rouletteResultText.textContent = `${getRouletteTranslation('result')} ${getRouletteMenuName(winningMenu)}!`;
        rouletteResult.style.opacity = '1';
    }, 4000);
}

// Update roulette translations
function updateRouletteTranslations() {
    const titleEl = document.getElementById('roulette-title');
    const descEl = document.getElementById('roulette-desc');
    const categoryBtns = document.querySelectorAll('.category-btn');

    if (titleEl) titleEl.textContent = getRouletteTranslation('title');
    if (descEl) descEl.textContent = getRouletteTranslation('desc');
    if (rouletteSpinBtn) rouletteSpinBtn.querySelector('span').textContent = getRouletteTranslation('spin');

    const categories = ['all', 'korean', 'chinese', 'japanese', 'western'];
    categoryBtns.forEach((btn, index) => {
        if (categories[index]) {
            btn.textContent = getRouletteTranslation(categories[index]);
        }
    });

    // Re-render wheel with new language
    renderWheel();
}

// Category filter click handler
if (categoryFilter) {
    categoryFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn') && !isSpinning) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            buildWheelMenus();
            rouletteResultText.textContent = '';
            rouletteResult.style.opacity = '0';
        }
    });
}

// Spin button click handler
if (rouletteSpinBtn) {
    rouletteSpinBtn.addEventListener('click', spinWheel);
}

// Initialize
initLanguageSelector();

// Initialize roulette
if (rouletteWheel) {
    buildWheelMenus();
    updateRouletteTranslations();
}

// Initialize bulletin board
if (bulletinPosts) {
    loadPosts();
    updateBulletinTranslations();
}
