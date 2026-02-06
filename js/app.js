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
    const recommendationTitle = document.getElementById('recommendation-title');
    if (recommendationTitle) recommendationTitle.textContent = t.todayRecommendation;
    const contactTitle = document.getElementById('contact-title');
    if (contactTitle) contactTitle.textContent = t.partnershipTitle;

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
    if (tipCards.length >= 4) {
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
    if (steps.length >= 3) {
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

// ============ SLOT MACHINE FUNCTIONALITY ============

// Slot machine menu items with emojis
const slotMenuEmojis = {
    korean: [
        { key: 'bibimbap', ko: '비빔밥', en: 'Bibimbap', emoji: '🍚' },
        { key: 'kimchijjigae', ko: '김치찌개', en: 'Kimchi Stew', emoji: '🍲' },
        { key: 'bulgogi', ko: '불고기', en: 'Bulgogi', emoji: '🥩' },
        { key: 'japchae', ko: '잡채', en: 'Japchae', emoji: '🍜' },
        { key: 'samgyetang', ko: '삼계탕', en: 'Ginseng Chicken', emoji: '🐔' },
        { key: 'sundubu', ko: '순두부찌개', en: 'Soft Tofu Stew', emoji: '🥘' },
        { key: 'galbi', ko: '갈비', en: 'Korean BBQ Ribs', emoji: '🍖' },
        { key: 'tteokbokki', ko: '떡볶이', en: 'Tteokbokki', emoji: '🌶️' }
    ],
    chinese: [
        { key: 'jjajangmyeon', ko: '짜장면', en: 'Jjajangmyeon', emoji: '🍝' },
        { key: 'jjampong', ko: '짬뽕', en: 'Spicy Seafood Noodle', emoji: '🍜' },
        { key: 'sweetAndSourPork', ko: '탕수육', en: 'Sweet & Sour Pork', emoji: '🐷' },
        { key: 'malatang', ko: '마라탕', en: 'Malatang', emoji: '🌶️' },
        { key: 'mapa', ko: '마파두부', en: 'Mapo Tofu', emoji: '🫕' },
        { key: 'friedRice', ko: '볶음밥', en: 'Fried Rice', emoji: '🍛' },
        { key: 'dumplings', ko: '만두', en: 'Dumplings', emoji: '🥟' },
        { key: 'jambong', ko: '간짜장', en: 'Dry Jjajang', emoji: '🥡' }
    ],
    japanese: [
        { key: 'sushi', ko: '초밥', en: 'Sushi', emoji: '🍣' },
        { key: 'ramen', ko: '라멘', en: 'Ramen', emoji: '🍜' },
        { key: 'tonkatsu', ko: '돈카츠', en: 'Tonkatsu', emoji: '🍗' },
        { key: 'udon', ko: '우동', en: 'Udon', emoji: '🍲' },
        { key: 'tempura', ko: '텐푸라', en: 'Tempura', emoji: '🍤' },
        { key: 'curry', ko: '카레', en: 'Japanese Curry', emoji: '🍛' },
        { key: 'soba', ko: '소바', en: 'Soba', emoji: '🥢' },
        { key: 'katsudon', ko: '카츠동', en: 'Katsudon', emoji: '🍱' }
    ],
    western: [
        { key: 'steak', ko: '스테이크', en: 'Steak', emoji: '🥩' },
        { key: 'pasta', ko: '파스타', en: 'Pasta', emoji: '🍝' },
        { key: 'pizza', ko: '피자', en: 'Pizza', emoji: '🍕' },
        { key: 'hamburger', ko: '햄버거', en: 'Hamburger', emoji: '🍔' },
        { key: 'salad', ko: '샐러드', en: 'Salad', emoji: '🥗' },
        { key: 'risotto', ko: '리조또', en: 'Risotto', emoji: '🍚' },
        { key: 'sandwich', ko: '샌드위치', en: 'Sandwich', emoji: '🥪' },
        { key: 'fishAndChips', ko: '피쉬앤칩스', en: 'Fish & Chips', emoji: '🐟' }
    ]
};

const slotReel1 = document.getElementById('slot-reel-1');
const slotReel2 = document.getElementById('slot-reel-2');
const slotReel3 = document.getElementById('slot-reel-3');
const slotLeverBtn = document.getElementById('slot-lever-btn');
const slotResult = document.getElementById('slot-result');
const slotResultCard = document.getElementById('slot-result-card');
const slotResultImage = document.getElementById('slot-result-image');
const slotResultEmoji = document.getElementById('slot-result-emoji');
const slotResultName = document.getElementById('slot-result-name');
const categoryFilter = document.getElementById('category-filter');

let currentCategory = 'all';
let currentSlotMenus = [];
let isSlotSpinning = false;
let spinIntervals = [null, null, null];
let lastWinningMenu = null;

// Get slot translation
function getSlotTranslation(key) {
    const slotTranslations = {
        'English': {
            title: 'Menu Slot Machine',
            desc: 'Pull the lever to decide your meal!',
            all: 'All',
            korean: 'Korean',
            chinese: 'Chinese',
            japanese: 'Japanese',
            western: 'Western',
            start: 'START',
            result: "Today's menu is",
            jackpot: 'JACKPOT!'
        },
        'Korean': {
            title: '메뉴 슬롯머신',
            desc: '슬롯머신을 돌려서 오늘의 메뉴를 정해보세요!',
            all: '전체',
            korean: '한식',
            chinese: '중식',
            japanese: '일식',
            western: '양식',
            start: 'START',
            result: '오늘의 메뉴는',
            jackpot: '잭팟!'
        },
        'Japanese': {
            title: 'メニュースロット',
            desc: 'スロットを回して今日のメニューを決めよう！',
            all: '全て',
            korean: '韓国料理',
            chinese: '中華',
            japanese: '和食',
            western: '洋食',
            start: 'START',
            result: '今日のメニューは',
            jackpot: 'ジャックポット！'
        },
        'Mandarin Chinese': {
            title: '菜单老虎机',
            desc: '拉动拉杆来决定今天吃什么！',
            all: '全部',
            korean: '韩餐',
            chinese: '中餐',
            japanese: '日料',
            western: '西餐',
            start: 'START',
            result: '今天的菜单是',
            jackpot: '大奖！'
        },
        'Spanish': {
            title: 'Tragamonedas de Menú',
            desc: '¡Tira de la palanca para decidir tu comida!',
            all: 'Todo',
            korean: 'Coreana',
            chinese: 'China',
            japanese: 'Japonesa',
            western: 'Occidental',
            start: 'START',
            result: 'El menú de hoy es',
            jackpot: '¡JACKPOT!'
        }
    };
    const langData = slotTranslations[currentLanguage] || slotTranslations['English'];
    return langData[key] || slotTranslations['English'][key];
}

// Get menu name for slot
function getSlotMenuName(menu) {
    if (currentLanguage === 'Korean') return menu.ko;
    return menu.en;
}

// Build slot menus based on category
function buildSlotMenus() {
    if (currentCategory === 'all') {
        currentSlotMenus = [
            ...slotMenuEmojis.korean,
            ...slotMenuEmojis.chinese,
            ...slotMenuEmojis.japanese,
            ...slotMenuEmojis.western
        ];
    } else {
        currentSlotMenus = [...slotMenuEmojis[currentCategory]];
    }
    renderSlotReels();
}

// Shuffle array
function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Render slot reel items
function renderSlotReels() {
    if (currentSlotMenus.length === 0) return;
    [slotReel1, slotReel2, slotReel3].forEach(reel => {
        if (!reel) return;
        reel.innerHTML = '';
        reel.style.transform = 'translateY(0)';

        // Create 3 visible items (center one is selected)
        const shuffled = shuffleArray(currentSlotMenus);
        for (let i = 0; i < 3; i++) {
            const menu = shuffled[i % shuffled.length];
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.innerHTML = `<span class="slot-emoji">${menu.emoji}</span><span class="slot-name">${getSlotMenuName(menu)}</span>`;
            item.dataset.index = i;
            reel.appendChild(item);
        }
    });
}

// Spin slot machine
function spinSlotMachine() {
    if (isSlotSpinning || currentSlotMenus.length === 0) return;

    isSlotSpinning = true;
    slotLeverBtn.disabled = true;
    slotResult.classList.remove('visible');

    const reels = [slotReel1, slotReel2, slotReel3];

    // Pick ONE winning food - all 3 reels land on the same item
    const winningIndex = Math.floor(Math.random() * currentSlotMenus.length);
    const winningMenu = currentSlotMenus[winningIndex];

    reels.forEach((reel, reelIndex) => {
        if (!reel) return;

        reel.innerHTML = '';
        reel.classList.remove('stopping');

        const totalItems = 20 + reelIndex * 5;
        for (let i = 0; i < totalItems; i++) {
            const menu = currentSlotMenus[i % currentSlotMenus.length];
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.innerHTML = `<span class="slot-emoji">${menu.emoji}</span><span class="slot-name">${getSlotMenuName(menu)}</span>`;
            reel.appendChild(item);
        }

        // All reels land on the same winning item
        const prevIndex = (winningIndex - 1 + currentSlotMenus.length) % currentSlotMenus.length;
        const nextIndex = (winningIndex + 1) % currentSlotMenus.length;

        [currentSlotMenus[prevIndex], winningMenu, currentSlotMenus[nextIndex]].forEach(menu => {
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.innerHTML = `<span class="slot-emoji">${menu.emoji}</span><span class="slot-name">${getSlotMenuName(menu)}</span>`;
            reel.appendChild(item);
        });

        const itemHeight = 60;
        const targetOffset = (totalItems) * itemHeight;

        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
        reel.offsetHeight;

        setTimeout(() => {
            reel.classList.add('stopping');
            reel.style.transition = `transform ${1.5 + reelIndex * 0.5}s cubic-bezier(0.2, 0.8, 0.3, 1.02)`;
            reel.style.transform = `translateY(-${targetOffset}px)`;
        }, 100);
    });

    // Show result after all reels stop
    const totalDuration = 1500 + 2 * 500 + 800;
    setTimeout(async () => {
        isSlotSpinning = false;
        slotLeverBtn.disabled = false;

        // Jackpot effect since all 3 match
        document.querySelector('.slot-frame')?.classList.add('slot-jackpot');
        setTimeout(() => document.querySelector('.slot-frame')?.classList.remove('slot-jackpot'), 1500);

        // Show result card with food image
        if (slotResultEmoji) slotResultEmoji.textContent = winningMenu.emoji;
        if (slotResultName) slotResultName.textContent = `${getSlotTranslation('result')} ${getSlotMenuName(winningMenu)}!`;

        // Fetch and show food image
        if (slotResultImage) {
            slotResultImage.src = '';
            slotResultImage.alt = getSlotMenuName(winningMenu);
            const imageUrl = await fetchPexelsImage(winningMenu.key);
            slotResultImage.src = imageUrl;
        }

        lastWinningMenu = winningMenu;
        slotResult.classList.add('visible');
        updateShareTranslations();
    }, totalDuration);
}

// Update slot translations
function updateSlotTranslations() {
    const titleEl = document.getElementById('slot-title');
    const descEl = document.getElementById('slot-desc');
    const leverText = document.getElementById('slot-lever-text');
    const categoryBtns = document.querySelectorAll('.category-btn');

    if (titleEl) titleEl.textContent = getSlotTranslation('title');
    if (descEl) descEl.textContent = getSlotTranslation('desc');
    if (leverText) leverText.textContent = getSlotTranslation('start');

    const categories = ['all', 'korean', 'chinese', 'japanese', 'western'];
    categoryBtns.forEach((btn, index) => {
        if (categories[index]) {
            btn.textContent = getSlotTranslation(categories[index]);
        }
    });

    renderSlotReels();
}

// Alias for backward compatibility with applyTranslations
function updateRouletteTranslations() {
    updateSlotTranslations();
    updateSituationTranslations();
    updateSeasonalTranslations();
    updateShareTranslations();
}

// Category filter click handler
if (categoryFilter) {
    categoryFilter.addEventListener('click', (e) => {
        if (e.target.classList.contains('category-btn') && !isSlotSpinning) {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            buildSlotMenus();
            slotResult.classList.remove('visible');
            slotResultName.textContent = '';
        }
    });
}

// Slot lever click handler
if (slotLeverBtn) {
    slotLeverBtn.addEventListener('click', spinSlotMachine);
}

// ============ SHARE BUTTONS ============

function getShareTranslation(key) {
    const shareTranslations = {
        'English': { shareTitle: 'Share your result!', shareText: "Tonight's dinner is", copied: 'Link copied!', shareNative: 'Share' },
        'Korean': { shareTitle: '결과를 공유하세요!', shareText: '오늘 저녁 메뉴는', copied: '링크가 복사되었습니다!', shareNative: '공유하기' },
        'Japanese': { shareTitle: '結果をシェアしよう！', shareText: '今夜の夕食は', copied: 'リンクをコピーしました！', shareNative: 'シェア' },
        'Mandarin Chinese': { shareTitle: '分享你的结果！', shareText: '今晚的晚餐是', copied: '链接已复制！', shareNative: '分享' },
        'Spanish': { shareTitle: '\u00A1Comparte tu resultado!', shareText: 'La cena de esta noche es', copied: '\u00A1Enlace copiado!', shareNative: 'Compartir' },
        'French': { shareTitle: 'Partagez votre r\u00E9sultat !', shareText: 'Le d\u00EEner de ce soir est', copied: 'Lien copi\u00E9 !', shareNative: 'Partager' },
        'German': { shareTitle: 'Teile dein Ergebnis!', shareText: 'Das Abendessen heute ist', copied: 'Link kopiert!', shareNative: 'Teilen' },
        'Portuguese': { shareTitle: 'Compartilhe seu resultado!', shareText: 'O jantar de hoje \u00E9', copied: 'Link copiado!', shareNative: 'Compartilhar' },
        'Italian': { shareTitle: 'Condividi il tuo risultato!', shareText: 'La cena di stasera \u00E8', copied: 'Link copiato!', shareNative: 'Condividi' },
        'Russian': { shareTitle: 'Поделитесь результатом!', shareText: 'Сегодня на ужин', copied: 'Ссылка скопирована!', shareNative: 'Поделиться' },
        'Arabic': { shareTitle: 'شارك نتيجتك!', shareText: 'عشاء الليلة هو', copied: 'تم نسخ الرابط!', shareNative: 'مشاركة' },
        'Thai': { shareTitle: 'แชร์ผลลัพธ์ของคุณ!', shareText: 'อาหารเย็นวันนี้คือ', copied: 'คัดลอกลิงก์แล้ว!', shareNative: 'แชร์' },
        'Vietnamese': { shareTitle: 'Chia s\u1EBB k\u1EBFt qu\u1EA3 c\u1EE7a b\u1EA1n!', shareText: 'B\u1EEFa t\u1ED1i h\u00F4m nay l\u00E0', copied: '\u0110\u00E3 sao ch\u00E9p li\u00EAn k\u1EBFt!', shareNative: 'Chia s\u1EBB' },
        'Indonesian': { shareTitle: 'Bagikan hasilmu!', shareText: 'Makan malam hari ini adalah', copied: 'Tautan disalin!', shareNative: 'Bagikan' },
        'Hindi': { shareTitle: 'अपना परिणाम साझा करें!', shareText: 'आज का डिनर है', copied: 'लिंक कॉपी हो गया!', shareNative: 'शेयर' },
        'Dutch': { shareTitle: 'Deel je resultaat!', shareText: 'Het avondeten vanavond is', copied: 'Link gekopieerd!', shareNative: 'Delen' },
        'Polish': { shareTitle: 'Podziel si\u0119 wynikiem!', shareText: 'Dzisiejsza kolacja to', copied: 'Link skopiowany!', shareNative: 'Udost\u0119pnij' },
        'Turkish': { shareTitle: 'Sonucunu payla\u015F!', shareText: 'Bu ak\u015Fam yeme\u011Fi', copied: 'Ba\u011Flant\u0131 kopyaland\u0131!', shareNative: 'Payla\u015F' }
    };
    const langData = shareTranslations[currentLanguage] || shareTranslations['English'];
    return langData[key] || shareTranslations['English'][key];
}

function buildShareMessage() {
    if (!lastWinningMenu) return { text: '', url: '', fullText: '' };
    const menuName = getSlotMenuName(lastWinningMenu);
    const emoji = lastWinningMenu.emoji;
    const shareText = getShareTranslation('shareText');
    const siteUrl = 'https://product-builder-lecture-8pr.pages.dev/';
    const text = `${emoji} ${shareText} ${menuName}!`;
    return { text, url: siteUrl, fullText: `${text}\n${siteUrl}` };
}

function shareToTwitter() {
    const { text, url } = buildShareMessage();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
}

function shareToFacebook() {
    const { text, url } = buildShareMessage();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
}

function shareToWhatsApp() {
    const { fullText } = buildShareMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
}

function shareToTelegram() {
    const { text, url } = buildShareMessage();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
}

function shareToLine() {
    const { fullText } = buildShareMessage();
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
}

function shareToKakao() {
    const { text, url } = buildShareMessage();
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
}

async function copyShareLink() {
    const { fullText } = buildShareMessage();
    try {
        await navigator.clipboard.writeText(fullText);
        showShareToast(getShareTranslation('copied'));
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = fullText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showShareToast(getShareTranslation('copied'));
    }
}

async function shareNative() {
    const { text, url } = buildShareMessage();
    if (navigator.share) {
        try {
            await navigator.share({ title: getShareTranslation('shareText'), text, url });
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Share failed:', err);
        }
    }
}

function showShareToast(message) {
    const existing = document.querySelector('.share-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function updateShareTranslations() {
    const titleEl = document.getElementById('share-title');
    if (titleEl) titleEl.textContent = getShareTranslation('shareTitle');
    const nativeBtn = document.getElementById('share-native-btn');
    if (nativeBtn) {
        const span = nativeBtn.querySelector('span');
        if (span) span.textContent = getShareTranslation('shareNative');
    }
}

function initShareButtons() {
    const nativeBtn = document.getElementById('share-native-btn');
    if (nativeBtn && navigator.share) {
        nativeBtn.classList.add('visible');
        nativeBtn.addEventListener('click', shareNative);
    }
    document.getElementById('share-twitter-btn')?.addEventListener('click', shareToTwitter);
    document.getElementById('share-facebook-btn')?.addEventListener('click', shareToFacebook);
    document.getElementById('share-whatsapp-btn')?.addEventListener('click', shareToWhatsApp);
    document.getElementById('share-telegram-btn')?.addEventListener('click', shareToTelegram);
    document.getElementById('share-line-btn')?.addEventListener('click', shareToLine);
    document.getElementById('share-kakao-btn')?.addEventListener('click', shareToKakao);
    document.getElementById('share-copy-btn')?.addEventListener('click', copyShareLink);
}

// ============ SITUATION-BASED RECOMMENDATIONS ============

const situationData = {
    'English': {
        title: 'Situation-Based Recommendations',
        desc: 'What situation are you in? We\'ll recommend the perfect menu!',
        solo: { title: 'Solo Dining', menus: ['Ramen', 'Kimbap', 'Rice Bowl', 'Noodles'] },
        family: { title: 'Family Dinner', menus: ['Pork Belly', 'Braised Ribs', 'Stew', 'Bulgogi'] },
        friends: { title: 'Friends Gathering', menus: ['Chicken', 'Pizza', 'Pork Feet', 'Tteokbokki'] },
        office: { title: 'Office Party', menus: ['BBQ Grill', 'Seafood Stew', 'Shabu-shabu', 'Ribs'] },
        date: { title: 'Date Night', menus: ['Pasta', 'Steak', 'Sushi', 'Risotto'] },
        quick: { title: 'Quick Meal', menus: ['Sandwich', 'Kimbap', 'Cup Noodle', 'Toast'] },
        diet: { title: 'Diet', menus: ['Salad', 'Chicken Breast', 'Poke', 'Konjac'] },
        drinking: { title: 'Bar Snacks', menus: ['Chicken', 'Tripe', 'Sashimi', 'Pancake'] }
    },
    'Korean': {
        title: '상황별 메뉴 추천',
        desc: '어떤 상황인가요? 딱 맞는 메뉴를 추천해드려요!',
        solo: { title: '혼밥', menus: ['라멘', '김밥', '덮밥', '국수'] },
        family: { title: '가족 식사', menus: ['삼겹살', '갈비찜', '찌개', '불고기'] },
        friends: { title: '친구 모임', menus: ['치킨', '피자', '족발', '떡볶이'] },
        office: { title: '회식', menus: ['고기구이', '해물탕', '샤브샤브', '갈비'] },
        date: { title: '데이트', menus: ['파스타', '스테이크', '초밥', '리조또'] },
        quick: { title: '간편식', menus: ['샌드위치', '김밥', '컵라면', '토스트'] },
        diet: { title: '다이어트', menus: ['샐러드', '닭가슴살', '포케', '곤약'] },
        drinking: { title: '술안주', menus: ['치킨', '곱창', '회', '전'] }
    },
    'Japanese': {
        title: 'シーン別おすすめ',
        desc: 'どんなシチュエーションですか？ぴったりのメニューをおすすめします！',
        solo: { title: 'ひとりご飯', menus: ['ラーメン', 'キンパ', '丼物', 'そば'] },
        family: { title: '家族の食事', menus: ['サムギョプサル', '煮込み', 'チゲ', 'プルコギ'] },
        friends: { title: '友達の集まり', menus: ['チキン', 'ピザ', '豚足', 'トッポッキ'] },
        office: { title: '会食', menus: ['焼肉', '海鮮鍋', 'しゃぶしゃぶ', 'カルビ'] },
        date: { title: 'デート', menus: ['パスタ', 'ステーキ', '寿司', 'リゾット'] },
        quick: { title: '軽食', menus: ['サンドイッチ', 'キンパ', 'カップ麺', 'トースト'] },
        diet: { title: 'ダイエット', menus: ['サラダ', 'チキンブレスト', 'ポケ', 'こんにゃく'] },
        drinking: { title: 'おつまみ', menus: ['チキン', 'ホルモン', '刺身', 'チヂミ'] }
    },
    'Mandarin Chinese': {
        title: '场景推荐',
        desc: '您在什么场景下用餐？推荐最合适的菜单！',
        solo: { title: '独食', menus: ['拉面', '紫菜包饭', '盖饭', '面条'] },
        family: { title: '家庭聚餐', menus: ['五花肉', '炖排骨', '汤锅', '烤肉'] },
        friends: { title: '朋友聚会', menus: ['炸鸡', '披萨', '猪蹄', '辣炒年糕'] },
        office: { title: '公司聚餐', menus: ['烤肉', '海鲜锅', '涮锅', '排骨'] },
        date: { title: '约会', menus: ['意面', '牛排', '寿司', '烩饭'] },
        quick: { title: '简餐', menus: ['三明治', '紫菜包饭', '杯面', '吐司'] },
        diet: { title: '减肥餐', menus: ['沙拉', '鸡胸肉', '波奇', '魔芋'] },
        drinking: { title: '下酒菜', menus: ['炸鸡', '大肠', '生鱼片', '煎饼'] }
    }
};

function updateSituationTranslations() {
    const lang = situationData[currentLanguage] || situationData['English'];
    const titleEl = document.getElementById('situation-title');
    const descEl = document.getElementById('situation-desc');

    if (titleEl) titleEl.textContent = lang.title;
    if (descEl) descEl.textContent = lang.desc;

    const situations = ['solo', 'family', 'friends', 'office', 'date', 'quick', 'diet', 'drinking'];
    const cards = document.querySelectorAll('.situation-card');

    cards.forEach((card, index) => {
        const situationKey = situations[index];
        if (!situationKey || !lang[situationKey]) return;

        const titleSpan = card.querySelector('.situation-card-title');
        if (titleSpan) titleSpan.textContent = lang[situationKey].title;

        const tags = card.querySelectorAll('.situation-menu-tag');
        tags.forEach((tag, tagIndex) => {
            if (lang[situationKey].menus[tagIndex]) {
                tag.textContent = lang[situationKey].menus[tagIndex];
            }
        });
    });
}

// ============ SEASONAL RECOMMENDATIONS ============

const seasonalData = {
    'English': {
        title: 'Seasonal / Weather Menu',
        desc: 'Find the perfect menu for today\'s weather!',
        hot: { title: 'Hot Weather', menus: ['Cold Noodles', 'Bean Noodles', 'Raw Fish Bowl', 'Shaved Ice', 'Salad', 'Cold Soba', 'Ice Cream', 'Fruit Punch'] },
        cold: { title: 'Cold Weather', menus: ['Dumpling Soup', 'Rice Cake Soup', 'Kimchi Stew', 'Sundae Soup', 'Shabu-shabu', 'Soybean Stew', 'Army Stew', 'Pork Bone Stew'] },
        rainy: { title: 'Rainy Day', menus: ['Green Onion Pancake', 'Kalguksu', 'Sujebi', 'Ramen', 'Jeon', 'Seafood Pancake', 'Kimchi Pancake', 'Rice Wine'] },
        hangover: { title: 'Hangover Cure', menus: ['Bone Soup', 'Bean Sprout Soup', 'Dried Pollack Soup', 'Ramen', 'Rice Soup', 'Blood Sausage Soup', 'Cabbage Stew', 'Dried Pollack Hangover Soup'] }
    },
    'Korean': {
        title: '계절/날씨별 메뉴',
        desc: '오늘 날씨에 딱 맞는 메뉴를 찾아보세요!',
        hot: { title: '더울 때', menus: ['냉면', '콩국수', '물회', '빙수', '샐러드', '냉모밀', '아이스크림', '과일화채'] },
        cold: { title: '추울 때', menus: ['만둣국', '떡국', '김치찌개', '순대국', '샤브샤브', '된장찌개', '부대찌개', '감자탕'] },
        rainy: { title: '비 올 때', menus: ['파전', '칼국수', '수제비', '라면', '부침개', '해물전', '김치전', '동동주'] },
        hangover: { title: '해장', menus: ['뼈해장국', '콩나물국밥', '북어국', '라면', '국밥', '선지국', '우거지탕', '황태해장국'] }
    },
    'Japanese': {
        title: '季節・天気別メニュー',
        desc: '今日の天気にぴったりのメニューを見つけましょう！',
        hot: { title: '暑い日', menus: ['冷麺', '豆乳麺', '海鮮丼', 'かき氷', 'サラダ', '冷やしそば', 'アイスクリーム', 'フルーツポンチ'] },
        cold: { title: '寒い日', menus: ['餃子スープ', '雑煮', 'キムチチゲ', 'スンデスープ', 'しゃぶしゃぶ', '味噌チゲ', 'プデチゲ', 'カムジャタン'] },
        rainy: { title: '雨の日', menus: ['チヂミ', 'カルグクス', 'スジェビ', 'ラーメン', '煎餅', '海鮮チヂミ', 'キムチチヂミ', 'マッコリ'] },
        hangover: { title: '二日酔い', menus: ['骨スープ', 'もやしスープ', '干しダラスープ', 'ラーメン', 'クッパ', 'ソンジグク', 'ウゴジタン', '干しスケトウダラスープ'] }
    },
    'Mandarin Chinese': {
        title: '季节/天气菜单',
        desc: '找到适合今天天气的完美菜单！',
        hot: { title: '热天', menus: ['冷面', '豆浆面', '生鱼饭', '刨冰', '沙拉', '冷荞麦面', '冰淇淋', '水果宾治'] },
        cold: { title: '冷天', menus: ['饺子汤', '年糕汤', '泡菜锅', '米肠汤', '涮锅', '大酱汤', '部队锅', '土豆汤'] },
        rainy: { title: '下雨天', menus: ['葱饼', '刀削面', '面疙瘩', '拉面', '煎饼', '海鲜饼', '泡菜饼', '米酒'] },
        hangover: { title: '解酒', menus: ['骨汤', '豆芽汤', '明太鱼汤', '拉面', '汤饭', '血肠汤', '大白菜汤', '黄太鱼解酒汤'] }
    }
};

function updateSeasonalTranslations() {
    const lang = seasonalData[currentLanguage] || seasonalData['English'];
    const titleEl = document.getElementById('seasonal-title');
    const descEl = document.getElementById('seasonal-desc');

    if (titleEl) titleEl.textContent = lang.title;
    if (descEl) descEl.textContent = lang.desc;

    const seasons = ['hot', 'cold', 'rainy', 'hangover'];
    const cards = document.querySelectorAll('.seasonal-card');

    cards.forEach((card, index) => {
        const seasonKey = seasons[index];
        if (!seasonKey || !lang[seasonKey]) return;

        const titleSpan = card.querySelector('.seasonal-card-title');
        if (titleSpan) titleSpan.textContent = lang[seasonKey].title;

        const listItems = card.querySelectorAll('.seasonal-menu-list li');
        listItems.forEach((li, liIndex) => {
            if (lang[seasonKey].menus[liIndex]) {
                li.textContent = lang[seasonKey].menus[liIndex];
            }
        });
    });
}

// Initialize slot machine data first (must run before initLanguageSelector
// because applyTranslations calls renderSlotReels which needs currentSlotMenus)
if (slotReel1) {
    buildSlotMenus();
}

// Initialize language selector (calls applyTranslations → renderSlotReels)
initLanguageSelector();

// Update slot/situation/seasonal translations
if (slotReel1) {
    updateSlotTranslations();
    updateSituationTranslations();
    updateSeasonalTranslations();
}

// Initialize share buttons
initShareButtons();

// Initialize bulletin board
if (bulletinPosts) {
    loadPosts();
    updateBulletinTranslations();
}
