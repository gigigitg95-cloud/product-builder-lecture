const dinnerMenus = [
    { korean: "치킨", english: "fried chicken", image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80" },
    { korean: "피자", english: "pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80" },
    { korean: "삼겹살", english: "grilled pork belly", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" },
    { korean: "족발", english: "braised pig feet", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80" },
    { korean: "보쌈", english: "boiled pork", image: "https://images.unsplash.com/photo-1623855244776-8b14e97cdadb?w=800&q=80" },
    { korean: "떡볶이", english: "tteokbokki", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80" },
    { korean: "순대", english: "korean blood sausage", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80" },
    { korean: "김밥", english: "kimbap", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80" },
    { korean: "라면", english: "ramen", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80" },
    { korean: "우동", english: "udon", image: "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&q=80" },
    { korean: "초밥", english: "sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80" },
    { korean: "돈까스", english: "tonkatsu", image: "https://images.unsplash.com/photo-1604908815879-59402bb7e71f?w=800&q=80" },
    { korean: "파스타", english: "pasta", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80" },
    { korean: "스테이크", english: "steak", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80" },
    { korean: "햄버거", english: "hamburger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" },
    { korean: "샌드위치", english: "sandwich", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80" },
    { korean: "샐러드", english: "salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
    { korean: "타코", english: "tacos", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80" },
    { korean: "쌀국수", english: "pho", image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800&q=80" },
    { korean: "마라탕", english: "malatang", image: "https://images.unsplash.com/photo-1569943228011-e779f4b447e6?w=800&q=80" }
];

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

let currentLanguage = 'English';
let allCountries = [];

// Country code to flag emoji mapping
const countryFlags = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'NZ': '🇳🇿',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'PT': '🇵🇹',
    'BR': '🇧🇷', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴',
    'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳', 'TH': '🇹🇭',
    'VN': '🇻🇳', 'PH': '🇵🇭', 'ID': '🇮🇩', 'MY': '🇲🇾', 'SG': '🇸🇬',
    'RU': '🇷🇺', 'PL': '🇵🇱', 'UA': '🇺🇦', 'TR': '🇹🇷', 'GR': '🇬🇷',
    'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪',
    'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'IS': '🇮🇸', 'IE': '🇮🇪',
    'IL': '🇮🇱', 'SA': '🇸🇦', 'AE': '🇦🇪', 'EG': '🇪🇬', 'ZA': '🇿🇦',
    'NG': '🇳🇬', 'KE': '🇰🇪', 'ET': '🇪🇹', 'MA': '🇲🇦', 'DZ': '🇩🇿',
    'AF': '🇦🇫', 'PK': '🇵🇰', 'BD': '🇧🇩', 'LK': '🇱🇰', 'NP': '🇳🇵',
    'MM': '🇲🇲', 'KH': '🇰🇭', 'LA': '🇱🇦', 'TW': '🇹🇼', 'HK': '🇭🇰',
    'IR': '🇮🇷', 'IQ': '🇮🇶', 'SY': '🇸🇾', 'JO': '🇯🇴', 'LB': '🇱🇧',
    'KW': '🇰🇼', 'QA': '🇶🇦', 'AL': '🇦🇱', 'BG': '🇧🇬', 'HR': '🇭🇷',
    'CZ': '🇨🇿', 'HU': '🇭🇺', 'RO': '🇷🇴', 'RS': '🇷🇸', 'SK': '🇸🇰',
    'SI': '🇸🇮', 'EE': '🇪🇪', 'LV': '🇱🇻', 'LT': '🇱🇹', 'CU': '🇨🇺',
    'PE': '🇵🇪', 'VE': '🇻🇪', 'UY': '🇺🇾', 'UZ': '🇺🇿', 'KZ': '🇰🇿',
    'MN': '🇲🇳', 'YE': '🇾🇪', 'ZW': '🇿🇼', 'LU': '🇱🇺'
};

// Initialize language selector
function initLanguageSelector() {
    if (typeof CountryLanguageService !== 'undefined') {
        allCountries = CountryLanguageService.getAllCountries();
        renderLanguageList(allCountries);
    }
}

// Render language list
function renderLanguageList(countries) {
    languageList.innerHTML = '';

    countries.forEach(country => {
        const item = document.createElement('div');
        item.className = 'language-item';

        const flag = countryFlags[country.code] || '🌐';
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

// Select language
function selectLanguage(country, language, flag) {
    currentLanguage = language;
    selectedLanguageEl.textContent = country;
    languageSelector.classList.remove('active');

    // Show notification
    showNotification(`Selected: ${country} - ${language}`, flag);
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
    const randomIndex = Math.floor(Math.random() * dinnerMenus.length);
    const recommendedMenu = dinnerMenus[randomIndex];

    // Update menu text with animation
    menuRecommendation.style.opacity = '0';
    setTimeout(() => {
        menuRecommendation.textContent = recommendedMenu.korean;
        menuRecommendation.style.opacity = '1';
    }, 200);

    // Show loading state
    recommendBtn.disabled = true;
    recommendBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Loading image...</span>';
    menuImage.style.opacity = '0.5';

    // Preload image to avoid flashing
    const img = new Image();
    img.onload = () => {
        menuImage.src = recommendedMenu.image;
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = '<span class="btn-icon">🎲</span><span class="btn-text">Get Another</span>';
    };
    img.onerror = () => {
        console.error('Error loading image for:', recommendedMenu.korean);
        menuImage.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
        menuImage.style.opacity = '1';
        recommendBtn.disabled = false;
        recommendBtn.innerHTML = '<span class="btn-icon">🎲</span><span class="btn-text">Get Another</span>';
    };
    img.src = recommendedMenu.image;
});

// Theme Toggle
document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const mode = document.body.classList.contains('light-mode') ? 'Light' : 'Dark';
    showNotification(`${mode} mode activated`, document.body.classList.contains('light-mode') ? '☀️' : '🌙');
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
