const PEXELS_API_KEY = 'QbxVLvleSjxbgjiZMi0OtIk65nhgmOi43gYXjEawILbJ3OaxeT8qHFYp';
const dinnerMenuKeys = [
    // Korean (26)
    "chicken", "porkBelly", "pigFeet", "boiledPork", "tteokbokki", "sundae", "kimbap", "bibimbap", "japchae", "kimchijjigae",
    "bulgogi", "samgyetang", "sundubu", "galbi", "naengmyeon", "dakgalbi", "budaeJjigae", "gamjatang", "seolleongtang",
    "gopchang", "kimchiBokkeum", "tteokguk", "haemulPajeon", "dwaejiGukbap", "kongnamulGukbap",
    "doenjangJjigae", "yukgaejang", "jjimdak", "janchiGuksu",
    // Japanese (21)
    "ramen", "udon", "sushi", "tonkatsu", "sushiRoll", "tempura", "curry", "katsudon", "soba", "okonomiyaki",
    "gyudon", "yakitori", "takoyaki", "onigiri", "nabeyaki",
    "karaage", "oyakodon", "unagi", "chirashi", "misoSoup", "hirekatsu", "gyukatsu",
    // Chinese (20)
    "malatang", "dumplings", "friedRice", "jjajangmyeon", "jjampong", "sweetAndSourPork", "mapoTofu", "kungPaoChicken",
    "pekingDuck", "dimSum", "hotPot", "danDanNoodles", "charSiuBao", "springRoll",
    "xiaolongbao", "yangKkochi", "congYouBing", "chowMein", "wonton", "jjajangBap",
    // Western / Italian (22)
    "pizza", "pasta", "steak", "hamburger", "sandwich", "salad", "fishAndChips", "paella", "risotto", "lasagna",
    "gnocchi", "nachos", "hotdog", "lobster", "carbonara", "bbqRibs", "chickenWings", "grilledSalmon",
    "caesarSalad", "omelet", "meatball", "gratin", "clubSandwich", "bruschetta",
    // Southeast Asian (15)
    "pho", "padThai", "greenCurry", "satay", "banhMi", "laksa", "nasiGoreng", "somTam", "rendang",
    "tomYumGoong", "massamanCurry", "bunCha", "miGoreng", "adobo", "sisig",
    // Mexican / Latin (12)
    "tacos", "burrito", "quesadilla", "enchilada", "churros", "ceviche", "empanada",
    "tamale", "pozole", "arepa", "feijoada", "guacamole",
    // Indian (12)
    "tikkaMasala", "biryani", "naan", "samosa", "butterChicken", "palakPaneer", "tandooriChicken",
    "dalMakhani", "roganJosh", "vindaloo", "dosa", "choleBhature",
    // Middle Eastern (9)
    "kebab", "falafel", "shawarma", "hummus",
    "kofta", "tabouleh", "babaGanoush", "dolma", "mansaf",
    // African (8)
    "jollofRice", "injera", "doroWot", "tagine", "couscous", "suya", "bobotie", "fufu",
    // European (10)
    "moussaka", "gyros", "ratatouille", "croquemonsieur", "schnitzel", "bratwurst", "pierogi", "borscht", "gazpacho", "poutine",
    // American (8)
    "macAndCheese", "clamChowder", "jambalaya", "gumbo", "pulledPork", "cheesesteak", "poBoy", "pancakes"
];


const blockedPexelsPhotoIds = new Set([
    5107181
]);
const recentPexelsPhotoIds = [];
const MAX_RECENT_PEXELS_IDS = 12;
const RECENT_PEXELS_STORAGE_KEY = 'recentPexelsPhotoIds';

const imageSearchOverrides = {
    bibimbap: 'bibimbap bowl korean mixed rice',
    kimchijjigae: 'kimchi stew korean spicy soup',
    bulgogi: 'bulgogi korean marinated beef',
    japchae: 'japchae glass noodles korean',
    samgyetang: 'samgyetang ginseng chicken soup',
    sundubu: 'sundubu soft tofu stew korean',
    galbi: 'galbi korean bbq ribs',
    tteokbokki: 'tteokbokki spicy rice cakes',
    naengmyeon: 'naengmyeon cold noodles korean',
    dakgalbi: 'dakgalbi spicy chicken korean',
    budaeJjigae: 'budae jjigae army stew korean',
    gamjatang: 'gamjatang pork bone soup',
    seolleongtang: 'seolleongtang ox bone soup',
    gopchang: 'gopchang grilled intestines korean',
    haemulPajeon: 'haemul pajeon seafood pancake',
    dwaejiGukbap: 'dwaeji gukbap pork rice soup',
    chicken: 'fried chicken crispy',
    porkBelly: 'samgyeopsal grilled pork belly',
    pigFeet: 'jokbal braised pig feet',
    boiledPork: 'bossam boiled pork wrap',
    sundae: 'korean blood sausage sundae',
    kimbap: 'kimbap korean seaweed rice roll',
    doenjangJjigae: 'doenjang jjigae soybean paste stew',
    yukgaejang: 'yukgaejang spicy beef soup',
    jjimdak: 'jjimdak braised chicken korean',
    janchiGuksu: 'janchi guksu banquet noodles',
    jjajangmyeon: 'jjajangmyeon black bean noodles',
    jjampong: 'jjamppong spicy seafood noodle soup',
    sweetAndSourPork: 'sweet and sour pork chinese',
    malatang: 'malatang sichuan spicy hot pot',
    mapoTofu: 'mapo tofu sichuan',
    friedRice: 'fried rice chinese',
    dumplings: 'dumplings chinese jiaozi',
    kungPaoChicken: 'kung pao chicken sichuan',
    pekingDuck: 'peking duck crispy',
    dimSum: 'dim sum assorted',
    hotPot: 'chinese hot pot',
    danDanNoodles: 'dan dan noodles sichuan',
    charSiuBao: 'char siu bao bbq pork bun',
    springRoll: 'spring rolls chinese',
    xiaolongbao: 'xiaolongbao soup dumplings',
    yangKkochi: 'yangkkochi lamb skewers',
    congYouBing: 'cong you bing scallion pancake',
    chowMein: 'chow mein stir fried noodles',
    wonton: 'wonton soup',
    jjajangBap: 'black bean sauce rice',
    sushi: 'sushi platter',
    ramen: 'ramen noodle soup bowl',
    tonkatsu: 'tonkatsu breaded pork cutlet',
    udon: 'udon noodle soup',
    tempura: 'tempura shrimp',
    curry: 'japanese curry rice',
    soba: 'soba buckwheat noodles',
    katsudon: 'katsudon pork cutlet bowl',
    okonomiyaki: 'okonomiyaki japanese pancake',
    gyudon: 'gyudon beef bowl japanese',
    yakitori: 'yakitori chicken skewers',
    takoyaki: 'takoyaki octopus balls',
    onigiri: 'onigiri rice ball',
    nabeyaki: 'nabeyaki udon hot pot',
    karaage: 'karaage japanese fried chicken',
    oyakodon: 'oyakodon chicken egg bowl',
    unagi: 'unagi grilled eel',
    chirashi: 'chirashi sushi bowl',
    misoSoup: 'miso soup bowl',
    hirekatsu: 'hirekatsu pork tenderloin cutlet',
    gyukatsu: 'gyukatsu beef cutlet',
    steak: 'steak grilled beef',
    pasta: 'pasta italian',
    pizza: 'pizza slice',
    hamburger: 'hamburger cheeseburger',
    salad: 'salad bowl',
    risotto: 'risotto italian rice',
    sandwich: 'sandwich deli',
    fishAndChips: 'fish and chips plate',
    lasagna: 'lasagna baked',
    carbonara: 'carbonara pasta creamy',
    gnocchi: 'gnocchi italian',
    lobster: 'lobster dish',
    bbqRibs: 'bbq ribs smoked',
    grilledSalmon: 'grilled salmon fillet',
    chickenWings: 'chicken wings buffalo',
    hotdog: 'hot dog',
    caesarSalad: 'caesar salad',
    omelet: 'omelet breakfast',
    meatball: 'meatballs italian',
    gratin: 'gratin baked',
    clubSandwich: 'club sandwich',
    bruschetta: 'bruschetta appetizer',
    pho: 'pho vietnamese noodle soup',
    padThai: 'pad thai noodles',
    greenCurry: 'green curry thai',
    satay: 'satay skewers',
    banhMi: 'banh mi sandwich',
    laksa: 'laksa curry noodle soup',
    nasiGoreng: 'nasi goreng fried rice',
    somTam: 'som tam papaya salad',
    rendang: 'rendang beef curry',
    tomYumGoong: 'tom yum goong shrimp soup',
    massamanCurry: 'massaman curry thai',
    bunCha: 'bun cha vietnam',
    miGoreng: 'mi goreng noodles',
    adobo: 'chicken adobo filipino',
    sisig: 'sisig pork',
    tacos: 'tacos mexican',
    burrito: 'burrito wrap',
    quesadilla: 'quesadilla cheese',
    enchilada: 'enchiladas mexican',
    churros: 'churros dessert',
    ceviche: 'ceviche seafood',
    empanada: 'empanadas',
    tamale: 'tamales',
    pozole: 'pozole soup',
    arepa: 'arepa corn cake',
    feijoada: 'feijoada brazilian stew',
    guacamole: 'guacamole dip',
    tikkaMasala: 'chicken tikka masala',
    biryani: 'biryani rice',
    naan: 'naan bread',
    samosa: 'samosa snack',
    butterChicken: 'butter chicken curry',
    palakPaneer: 'palak paneer spinach',
    tandooriChicken: 'tandoori chicken grilled',
    dalMakhani: 'dal makhani lentils',
    roganJosh: 'rogan josh curry',
    vindaloo: 'vindaloo curry',
    dosa: 'dosa crepe',
    choleBhature: 'chole bhature',
    kebab: 'kebab skewers',
    falafel: 'falafel balls',
    shawarma: 'shawarma wrap',
    hummus: 'hummus dip',
    kofta: 'kofta meatballs',
    tabouleh: 'tabbouleh salad',
    babaGanoush: 'baba ganoush dip',
    dolma: 'dolma stuffed grape leaves',
    mansaf: 'mansaf jordan',
    jollofRice: 'jollof rice',
    injera: 'injera flatbread',
    doroWot: 'doro wat ethiopian stew',
    tagine: 'tagine moroccan',
    couscous: 'couscous',
    suya: 'suya grilled beef',
    bobotie: 'bobotie south african',
    fufu: 'fufu african',
    moussaka: 'moussaka greek',
    gyros: 'gyros pita',
    ratatouille: 'ratatouille',
    croquemonsieur: 'croque monsieur sandwich',
    schnitzel: 'schnitzel breaded cutlet',
    bratwurst: 'bratwurst sausage',
    pierogi: 'pierogi dumplings',
    borscht: 'borscht beet soup',
    gazpacho: 'gazpacho cold soup',
    poutine: 'poutine fries gravy',
    macAndCheese: 'mac and cheese',
    clamChowder: 'clam chowder soup',
    jambalaya: 'jambalaya rice',
    gumbo: 'gumbo stew',
    pulledPork: 'pulled pork sandwich',
    cheesesteak: 'philly cheesesteak sandwich',
    poBoy: 'po boy sandwich',
    pancakes: 'pancakes stack'
};

function rememberPexelsId(id) {
    if (!id) return;
    recentPexelsPhotoIds.push(id);
    while (recentPexelsPhotoIds.length > MAX_RECENT_PEXELS_IDS) {
        recentPexelsPhotoIds.shift();
    }
    try {
        localStorage.setItem(RECENT_PEXELS_STORAGE_KEY, JSON.stringify(recentPexelsPhotoIds));
    } catch (error) {
        // Ignore storage write errors.
    }
}

function restoreRecentPexelsIds() {
    try {
        const raw = localStorage.getItem(RECENT_PEXELS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return;
        parsed
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id))
            .slice(-MAX_RECENT_PEXELS_IDS)
            .forEach((id) => recentPexelsPhotoIds.push(id));
    } catch (error) {
        // Ignore malformed localStorage values.
    }
}

restoreRecentPexelsIds();

function scorePhoto(photo, keywords) {
    if (!photo || !photo.alt) return 0;
    const alt = photo.alt.toLowerCase();
    let score = 0;
    keywords.forEach(word => {
        if (word && alt.includes(word)) score += 2;
    });
    return score;
}

function pickBestPexelsPhoto(photos, keywords) {
    if (!Array.isArray(photos) || photos.length === 0) return null;
    const filtered = photos.filter(p => p && !blockedPexelsPhotoIds.has(p.id) && !recentPexelsPhotoIds.includes(p.id));
    const pool = filtered.length > 0 ? filtered : photos;
    if (!keywords || keywords.length === 0) {
        return pool[Math.floor(Math.random() * pool.length)] || null;
    }
    const scored = pool
        .map(photo => ({ photo, score: scorePhoto(photo, keywords) }))
        .sort((a, b) => b.score - a.score);
    const topScore = scored[0]?.score ?? 0;
    const bestPool = scored.filter(item => item.score === topScore).map(item => item.photo);
    return bestPool[Math.floor(Math.random() * bestPool.length)] || null;
}

async function fetchPexelsImage(query, fallbackQuery) {
    try {
        const baseQuery = (query && query.trim()) ? query.trim() : (fallbackQuery || '').trim();
        if (!baseQuery) return '';
        const searchQuery = encodeURIComponent(`${baseQuery} food dish`);
        const page = 1 + Math.floor(Math.random() * 5);
        const response = await fetch(`https://api.pexels.com/v1/search?query=${searchQuery}&per_page=10&page=${page}`, {
            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
            const keywords = baseQuery
                .toLowerCase()
                .split(/\s+/)
                .filter(word => word.length >= 3);
            const photo = pickBestPexelsPhoto(data.photos, keywords);
            if (!photo) return '';
            rememberPexelsId(photo.id);
            return photo.src.large;
        }
        if (fallbackQuery && fallbackQuery.trim() && fallbackQuery.trim() !== baseQuery) {
            return await fetchPexelsImage(fallbackQuery);
        }
        return ''; // No image found from Pexels
    } catch (error) {
        console.error('Error fetching Pexels image:', error);
        return ''; // No image found from Pexels due to error
    }
}

const menuRecommendation = document.getElementById('menu-recommendation');
const menuImage = document.getElementById('menu-image');
const recommendBtn = document.getElementById('recommend-btn');
const recommendationReasonTitle = document.getElementById('recommendation-reason-title');
const recommendationReasonList = document.getElementById('recommendation-reason-list');
const alternativeOptionsTitle = document.getElementById('alternative-options-title');
const alternativeOptionsButtons = document.getElementById('alternative-options-buttons');
const recommendationReasonSection = document.getElementById('recommendation-reason');
const alternativeOptionsSection = document.getElementById('alternative-options');
const discoverSearchInput = document.getElementById('discover-search-input');
const discoverSearchClearBtn = document.getElementById('discover-search-clear-btn');
const discoverFilterSummary = document.getElementById('discover-filter-summary');
const discoverCategoryChips = Array.from(document.querySelectorAll('.discover-category-chip'));
const discoverCollectionChips = Array.from(document.querySelectorAll('.discover-collection-chip'));

const DISCOVER_FILTER_STORAGE_KEY = 'discoverFilters';
const RECENT_RECOMMENDATION_STORAGE_KEY = 'recentRecommendations';
const MAX_RECENT_RECOMMENDATIONS = 10;
const recommendationCategoryOrder = ['korean', 'chinese', 'japanese', 'western', 'southeastAsian', 'mexican', 'indian', 'middleEastern', 'african', 'european', 'american'];
const discoverCategoryTerms = {
    all: ['all', '전체', '카테고리'],
    korean: ['korean', '한식'],
    chinese: ['chinese', '중식'],
    japanese: ['japanese', '일식'],
    western: ['western', '양식'],
    southeastAsian: ['southeast asian', '동남아'],
    mexican: ['mexican', '멕시칸'],
    indian: ['indian', '인도'],
    middleEastern: ['middle east', '중동'],
    african: ['african', '아프리카'],
    european: ['european', '유럽'],
    american: ['american', '아메리칸']
};
const discoverCollectionConfig = {
    all: { ko: '전체 컬렉션', en: 'All Collections', keys: [] },
    solo: {
        ko: '혼밥',
        en: 'Solo',
        keys: ['ramen', 'kimbap', 'onigiri', 'udon', 'janchiGuksu', 'bibimbap', 'sushiRoll', 'sandwich']
    },
    diet: {
        ko: '다이어트',
        en: 'Diet',
        keys: ['salad', 'caesarSalad', 'sundubu', 'bunCha', 'pho', 'palakPaneer', 'grilledSalmon', 'omelet']
    },
    quick5: {
        ko: '5분 컷',
        en: '5-min',
        keys: ['ramen', 'kimbap', 'onigiri', 'sandwich', 'hotdog', 'pancakes', 'omelet', 'churros']
    },
    rainy: {
        ko: '비 오는 날',
        en: 'Rainy Day',
        keys: ['haemulPajeon', 'congYouBing', 'jjampong', 'kimchijjigae', 'udon', 'hotPot', 'janchiGuksu', 'ramen']
    },
    lateNight: {
        ko: '야식',
        en: 'Late Night',
        keys: ['chicken', 'pizza', 'tteokbokki', 'pigFeet', 'ramen', 'hotdog', 'tacos', 'nachos']
    },
    guest: {
        ko: '손님상',
        en: 'Guest Table',
        keys: ['steak', 'galbi', 'sushi', 'pekingDuck', 'paella', 'lasagna', 'samgyetang', 'bulgogi']
    }
};
const discoverKeywordHints = {
    kimchijjigae: ['김치', '찌개', 'soup', 'stew'],
    bibimbap: ['비빔', '밥', 'rice', 'vegetable'],
    tteokbokki: ['떡볶이', 'spicy', 'rice cake'],
    ramen: ['라면', '라멘', 'noodle', '국물'],
    sushi: ['초밥', 'sushi', 'raw fish'],
    pizza: ['피자', '치즈', '빵', 'cheese'],
    salad: ['샐러드', '채소', 'vegetable'],
    samgyetang: ['삼계탕', 'chicken soup', '보양'],
    galbi: ['갈비', 'rib', 'bbq'],
    steak: ['스테이크', 'beef'],
    chicken: ['치킨', 'fried chicken'],
    janchiGuksu: ['국수', 'noodle'],
    hotPot: ['전골', 'hot pot', 'soup'],
    udon: ['우동', 'noodle soup']
};

let discoverFilterState = {
    search: '',
    category: 'all',
    collection: 'all'
};
let discoverFilteredMenuKeys = [...dinnerMenuKeys];
let discoverStrictMatchCount = dinnerMenuKeys.length;
let discoverMenuSearchCache = new Map();
let menuCategoryByKey = new Map();
let slotMenuByKey = new Map();
let discoverPoolSignature = '';
let recentRecommendationKeys = [];
let lastRecommendedMenuKey = '';
let latestAlternativeMenuKeys = [];
let activeUserDietProfile = null;

const PROFILE_CATEGORY_HINTS = {
    korean: ['korean', '한식'],
    chinese: ['chinese', '중식'],
    japanese: ['japanese', '일식', '초밥'],
    western: ['western', '양식', '파스타', '스테이크', '샐러드'],
    southeastAsian: ['동남아', 'thai', 'vietnam', 'southeast', 'pho', '쌀국수'],
    mexican: ['mexican', '멕시칸', '타코', '또띠아'],
    indian: ['indian', '인도', '커리'],
    middleEastern: ['middle east', '중동', '케밥', 'shawarma'],
    african: ['african', '아프리카'],
    european: ['european', '유럽'],
    american: ['american', '아메리칸', '버거']
};

const PROFILE_BLOCK_HINTS = {
    '견과류': ['peanut', 'almond', 'walnut', 'cashew', '견과', '땅콩'],
    '갑각류': ['shrimp', 'prawn', 'crab', 'lobster', '새우', '게', '랍스터'],
    '유제품': ['milk', 'cheese', 'cream', 'butter', '우유', '치즈', '버터'],
    '글루텐': ['wheat', 'bread', 'flour', 'pasta', '밀', '빵', '파스타'],
    '돼지고기': ['pork', 'samgyeopsal', '돼지', '족발', '보쌈'],
    '소고기': ['beef', '소고기'],
    '해산물': ['seafood', 'fish', 'sushi', '연어', '참치', '해산물', '새우']
};

function getFeatureFlags() {
    if (window.NinanooFlags && typeof window.NinanooFlags.getAll === 'function') {
        return window.NinanooFlags.getAll();
    }
    return {
        recoWhy: true,
        freeWeeklyPlan: true,
        aiFoodEnhance: true
    };
}

function isFeatureEnabled(flagName) {
    const flags = getFeatureFlags();
    return flags[flagName] !== false;
}

function setElementVisible(el, visible) {
    if (!el) return;
    if (visible) {
        el.classList.remove('hidden');
        el.removeAttribute('hidden');
    } else {
        el.classList.add('hidden');
        el.setAttribute('hidden', 'hidden');
    }
}

function hideNavLinkByHref(href) {
    document.querySelectorAll(`a[href="${href}"]`).forEach((anchor) => {
        setElementVisible(anchor, false);
    });
}

function applyFeatureFlagUi() {
    const recoWhyOn = isFeatureEnabled('recoWhy');
    const freeWeeklyPlanOn = isFeatureEnabled('freeWeeklyPlan');
    const aiFoodEnhanceOn = isFeatureEnabled('aiFoodEnhance');

    setElementVisible(recommendationReasonSection, recoWhyOn);
    setElementVisible(alternativeOptionsSection, recoWhyOn);

    if (!freeWeeklyPlanOn) {
        setElementVisible(document.getElementById('nav-light-planner'), false);
        hideNavLinkByHref('/pages/light-meal-plan.html');
    }
    if (!aiFoodEnhanceOn) {
        setElementVisible(document.getElementById('nav-food-enhance'), false);
        hideNavLinkByHref('/pages/food-enhance.html');
    }
}

function normalizeProfileToken(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeProfileInputList(value) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => normalizeProfileToken(item))
        .filter(Boolean);
}

function getProfileCategoryPreferences(profile) {
    const tokens = normalizeProfileInputList(profile && profile.preferredCategories);
    if (!tokens.length) return [];
    const matched = Object.entries(PROFILE_CATEGORY_HINTS)
        .filter((entry) => entry[1].some((hint) => tokens.some((token) => token.includes(hint))))
        .map((entry) => entry[0]);
    return Array.from(new Set(matched));
}

function getProfileBlockTokens(profile) {
    const tokens = normalizeProfileInputList([]
        .concat(normalizeProfileInputList(profile && profile.allergies))
        .concat(normalizeProfileInputList(profile && profile.dislikedIngredients)));
    const expanded = [];
    tokens.forEach((token) => {
        expanded.push(token);
        Object.entries(PROFILE_BLOCK_HINTS).forEach(([groupKey, hints]) => {
            if (token.includes(groupKey) || hints.some((hint) => token.includes(hint))) {
                hints.forEach((hint) => expanded.push(hint));
            }
        });
    });
    return Array.from(new Set(expanded.filter(Boolean)));
}

function isMenuBlockedByProfile(menuKey, blockTokens) {
    if (!blockTokens || blockTokens.length === 0) return false;
    const texts = [
        String(menuKey || '').toLowerCase(),
        String(imageSearchOverrides[menuKey] || '').toLowerCase()
    ];
    if (typeof menuTranslations === 'object' && menuTranslations) {
        Object.keys(menuTranslations).forEach((lang) => {
            const label = menuTranslations[lang] && menuTranslations[lang][menuKey];
            if (label) texts.push(String(label).toLowerCase());
        });
    }
    const haystack = texts.join(' ');
    return blockTokens.some((token) => haystack.includes(token));
}

function getProfileAwareMenuPool(baseMenus) {
    const source = (Array.isArray(baseMenus) && baseMenus.length > 0) ? baseMenus.slice() : dinnerMenuKeys.slice();
    const profile = activeUserDietProfile;
    if (!profile) return source;

    let scoped = source.slice();
    const preferredCategories = getProfileCategoryPreferences(profile);
    if (preferredCategories.length > 0) {
        const preferredScoped = scoped.filter((key) => preferredCategories.includes(getCategoryOfMenu(key)));
        if (preferredScoped.length >= 6) scoped = preferredScoped;
    }

    const blockTokens = getProfileBlockTokens(profile);
    if (blockTokens.length > 0) {
        const safeOnly = scoped.filter((key) => !isMenuBlockedByProfile(key, blockTokens));
        if (safeOnly.length >= 8) scoped = safeOnly;
    }

    return scoped.length > 0 ? scoped : source;
}

async function refreshDietProfileContext(options) {
    if (!window.NinanooProfileStore || typeof window.NinanooProfileStore.loadEffectiveProfile !== 'function') {
        activeUserDietProfile = null;
        return;
    }
    const result = await window.NinanooProfileStore.loadEffectiveProfile({
        preferServer: !(options && options.preferCacheOnly),
        supabaseClient: sidebarSupabaseClient || null
    }).catch(() => null);
    activeUserDietProfile = result && result.profile ? result.profile : null;
    if (slotReel1) {
        buildSlotMenus();
    }
}

function normalizeDiscoverText(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function readDiscoverFilterState() {
    try {
        const raw = localStorage.getItem(DISCOVER_FILTER_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!parsed || typeof parsed !== 'object') return;
        if (typeof parsed.search === 'string') discoverFilterState.search = parsed.search.slice(0, 80);
        if (typeof parsed.category === 'string' && parsed.category in discoverCategoryTerms) {
            discoverFilterState.category = parsed.category;
        }
        if (typeof parsed.collection === 'string' && parsed.collection in discoverCollectionConfig) {
            discoverFilterState.collection = parsed.collection;
        }
    } catch (error) {
        // Ignore malformed localStorage value.
    }
}

function persistDiscoverFilterState() {
    localStorage.setItem(DISCOVER_FILTER_STORAGE_KEY, JSON.stringify(discoverFilterState));
}

function getDiscoverCopy() {
    if (currentLanguage === 'Korean') {
        return {
            title: 'Discover 탐색',
            searchPlaceholder: '메뉴명, 재료, 카테고리 검색',
            clear: '지우기',
            categoryLabel: '카테고리',
            collectionLabel: '컬렉션',
            allCollection: '전체 컬렉션',
            summary: (matched, total) => `${matched}개 매치 · 추천 풀 ${total}개`
        };
    }
    return {
        title: 'Discover',
        searchPlaceholder: 'Search menu, ingredient, category',
        clear: 'Clear',
        categoryLabel: 'Category',
        collectionLabel: 'Collection',
        allCollection: 'All Collections',
        summary: (matched, total) => `${matched} matches · pool ${total}`
    };
}

function getCollectionLabel(collectionId) {
    const config = discoverCollectionConfig[collectionId];
    if (!config) return collectionId;
    if (currentLanguage === 'Korean') return config.ko;
    return config.en;
}

function getCategoryOfMenu(key) {
    return menuCategoryByKey.get(key) || 'all';
}

function buildDiscoverMenuSearchText(key) {
    const cache = discoverMenuSearchCache.get(key);
    if (cache) return cache;

    const parts = [key, getCategoryOfMenu(key)];
    Object.values(discoverCategoryTerms).forEach((terms) => terms.forEach((term) => parts.push(term)));

    if (typeof menuTranslations === 'object' && menuTranslations) {
        Object.values(menuTranslations).forEach((langData) => {
            if (langData && langData[key]) parts.push(langData[key]);
        });
    }
    if (discoverKeywordHints[key]) {
        discoverKeywordHints[key].forEach((hint) => parts.push(hint));
    }
    Object.entries(discoverCollectionConfig).forEach(([collectionId, config]) => {
        if (config.keys.includes(key)) {
            parts.push(collectionId, config.ko, config.en);
        }
    });

    const built = normalizeDiscoverText(parts.join(' '));
    discoverMenuSearchCache.set(key, built);
    return built;
}

function isCollectionMatched(key, collectionId) {
    if (collectionId === 'all') return true;
    const config = discoverCollectionConfig[collectionId];
    return !!config && config.keys.includes(key);
}

function isCategoryMatched(key, category) {
    if (category === 'all') return true;
    return getCategoryOfMenu(key) === category;
}

function isSearchMatched(key, normalizedSearch) {
    if (!normalizedSearch) return true;
    return buildDiscoverMenuSearchText(key).includes(normalizedSearch);
}

function resolveDiscoverMenuPool() {
    const normalizedSearch = normalizeDiscoverText(discoverFilterState.search);
    const category = discoverFilterState.category;
    const collection = discoverFilterState.collection;

    const strict = dinnerMenuKeys.filter((key) =>
        isCategoryMatched(key, category) &&
        isCollectionMatched(key, collection) &&
        isSearchMatched(key, normalizedSearch)
    );
    if (strict.length > 0) {
        return { keys: strict, strictCount: strict.length };
    }

    const relaxedNoSearch = dinnerMenuKeys.filter((key) =>
        isCategoryMatched(key, category) && isCollectionMatched(key, collection)
    );
    if (relaxedNoSearch.length > 0) {
        return { keys: relaxedNoSearch, strictCount: 0 };
    }

    const relaxedCategoryOnly = dinnerMenuKeys.filter((key) => isCategoryMatched(key, category));
    if (relaxedCategoryOnly.length > 0) {
        return { keys: relaxedCategoryOnly, strictCount: 0 };
    }

    return { keys: [...dinnerMenuKeys], strictCount: 0 };
}

function setDiscoverChipActive(button, isActive) {
    if (!button) return;
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    button.classList.toggle('border-primary', isActive);
    button.classList.toggle('bg-primary/10', isActive);
    button.classList.toggle('text-primary', isActive);
    button.classList.toggle('border-gray-200', !isActive);
    button.classList.toggle('dark:border-gray-700', !isActive);
    button.classList.toggle('bg-white', !isActive);
    button.classList.toggle('dark:bg-gray-800', !isActive);
    button.classList.toggle('text-gray-600', !isActive);
    button.classList.toggle('dark:text-gray-300', !isActive);
}

function syncDiscoverControlUI() {
    const copy = getDiscoverCopy();
    const title = document.getElementById('discover-controls-title');
    if (title) title.textContent = copy.title;
    const categoryTitle = document.getElementById('discover-category-title');
    if (categoryTitle) categoryTitle.textContent = copy.categoryLabel;
    const collectionTitle = document.getElementById('discover-collection-title');
    if (collectionTitle) collectionTitle.textContent = copy.collectionLabel;
    if (discoverSearchInput) {
        discoverSearchInput.placeholder = copy.searchPlaceholder;
        discoverSearchInput.setAttribute('aria-label', copy.searchPlaceholder);
        if (discoverSearchInput.value !== discoverFilterState.search) {
            discoverSearchInput.value = discoverFilterState.search;
        }
    }
    if (discoverSearchClearBtn) {
        discoverSearchClearBtn.textContent = copy.clear;
        discoverSearchClearBtn.classList.toggle('hidden', !discoverFilterState.search);
    }

    discoverCategoryChips.forEach((button) => {
        const category = button.dataset.category || 'all';
        button.textContent = getSlotTranslation(category);
        setDiscoverChipActive(button, category === discoverFilterState.category);
    });
    discoverCollectionChips.forEach((button) => {
        const collectionId = button.dataset.collection || 'all';
        button.textContent = collectionId === 'all' ? copy.allCollection : getCollectionLabel(collectionId);
        setDiscoverChipActive(button, collectionId === discoverFilterState.collection);
    });
}

function syncSlotCategoryUI() {
    document.querySelectorAll('.category-btn').forEach((button) => {
        const isActive = button.dataset.category === discoverFilterState.category;
        button.classList.toggle('active', isActive);
    });
}

function updateDiscoverSummary() {
    const copy = getDiscoverCopy();
    if (discoverFilterSummary) {
        discoverFilterSummary.textContent = copy.summary(discoverStrictMatchCount, discoverFilteredMenuKeys.length);
    }
}

function applyDiscoverFilters(options = {}) {
    const { persist = false, syncInput = true, syncSlot = true, rerenderSlot = true } = options;
    const resolved = resolveDiscoverMenuPool();
    discoverFilteredMenuKeys = resolved.keys;
    discoverStrictMatchCount = resolved.strictCount;
    currentCategory = discoverFilterState.category;
    const nextSignature = `${currentCategory}|${discoverFilteredMenuKeys.join(',')}`;

    if (persist) {
        persistDiscoverFilterState();
    }
    syncDiscoverControlUI();
    if (!syncInput && discoverSearchInput) {
        discoverSearchInput.value = discoverFilterState.search;
    }
    if (syncSlot) {
        syncSlotCategoryUI();
    }
    if (rerenderSlot && nextSignature !== discoverPoolSignature && typeof buildSlotMenus === 'function') {
        buildSlotMenus();
        if (slotResult) slotResult.classList.remove('visible');
    }
    discoverPoolSignature = nextSignature;
    updateDiscoverSummary();
}

function bindDiscoverControls() {
    if (discoverSearchInput) {
        discoverSearchInput.addEventListener('input', (event) => {
            const next = String(event.target?.value || '').slice(0, 80);
            if (next === discoverFilterState.search) return;
            discoverFilterState.search = next;
            applyDiscoverFilters({ persist: true, syncInput: false, syncSlot: true, rerenderSlot: true });
        });
        discoverSearchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && discoverFilterState.search) {
                event.preventDefault();
                discoverFilterState.search = '';
                applyDiscoverFilters({ persist: true, syncInput: true, syncSlot: true, rerenderSlot: true });
            }
        });
    }
    if (discoverSearchClearBtn) {
        discoverSearchClearBtn.addEventListener('click', () => {
            if (!discoverFilterState.search) return;
            discoverFilterState.search = '';
            applyDiscoverFilters({ persist: true, syncInput: true, syncSlot: true, rerenderSlot: true });
            discoverSearchInput?.focus();
        });
    }

    discoverCategoryChips.forEach((button) => {
        button.addEventListener('click', () => {
            const nextCategory = button.dataset.category || 'all';
            if (nextCategory === discoverFilterState.category) return;
            discoverFilterState.category = nextCategory;
            applyDiscoverFilters({ persist: true, syncInput: true, syncSlot: true, rerenderSlot: true });
        });
    });
    discoverCollectionChips.forEach((button) => {
        button.addEventListener('click', () => {
            const nextCollection = button.dataset.collection || 'all';
            if (nextCollection === discoverFilterState.collection) return;
            discoverFilterState.collection = nextCollection;
            applyDiscoverFilters({ persist: true, syncInput: true, syncSlot: true, rerenderSlot: true });
        });
    });
}

function initDiscoverExperience() {
    readDiscoverFilterState();
    bindDiscoverControls();
    applyDiscoverFilters({ persist: false, syncInput: true, syncSlot: true, rerenderSlot: false });
}

function emitPreparedAnalyticsEvent(eventName, payload = {}) {
    const event = {
        event: eventName,
        timestamp: Date.now(),
        language: currentLanguage,
        ...payload
    };
    window.__menurecAnalyticsQueue = window.__menurecAnalyticsQueue || [];
    window.__menurecAnalyticsQueue.push(event);
    document.dispatchEvent(new CustomEvent('menurec:analytics', { detail: event }));
    if (window.NinanooAnalytics && typeof window.NinanooAnalytics.track === 'function') {
        window.NinanooAnalytics.track(eventName, payload);
    }
}

function getRecommendationUiCopy() {
    if (currentLanguage === 'Korean') {
        return {
            reasonTitle: '추천 이유',
            alternativeTitle: '대체 옵션',
            reasonPlaceholder: [
                '추천을 받으면 이유를 보여드려요.',
                '상황, 시간대, 카테고리를 반영합니다.',
                '최근 추천 중복은 자동으로 줄입니다.'
            ],
            alternativeFallback: '다른 추천 받기'
        };
    }
    return {
        reasonTitle: 'Why this menu',
        alternativeTitle: 'Alternative options',
        reasonPlaceholder: [
            'Reason details appear after recommendation.',
            'Context uses category, time, and active filters.',
            'Recent duplicate recommendations are minimized.'
        ],
        alternativeFallback: 'Try another'
    };
}

function restoreRecentRecommendationKeys() {
    try {
        const raw = localStorage.getItem(RECENT_RECOMMENDATION_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return;
        recentRecommendationKeys = parsed
            .map((item) => String(item || '').trim())
            .filter((item) => !!item)
            .slice(-MAX_RECENT_RECOMMENDATIONS);
    } catch (error) {
        recentRecommendationKeys = [];
    }
}

function persistRecentRecommendationKeys() {
    try {
        localStorage.setItem(RECENT_RECOMMENDATION_STORAGE_KEY, JSON.stringify(recentRecommendationKeys));
    } catch (error) {
        // Ignore storage write errors.
    }
}

function rememberRecommendationKey(menuKey) {
    const value = String(menuKey || '').trim();
    if (!value) return;
    recentRecommendationKeys = recentRecommendationKeys.filter((item) => item !== value);
    recentRecommendationKeys.push(value);
    if (recentRecommendationKeys.length > MAX_RECENT_RECOMMENDATIONS) {
        recentRecommendationKeys = recentRecommendationKeys.slice(-MAX_RECENT_RECOMMENDATIONS);
    }
    persistRecentRecommendationKeys();
}

function pickRandomMenuKey(sourceMenus, options = {}) {
    const {
        excludeKeys = [],
        avoidRecent = true
    } = options;
    const normalizedSource = (Array.isArray(sourceMenus) && sourceMenus.length > 0) ? sourceMenus : dinnerMenuKeys;
    const excludeSet = new Set(excludeKeys.filter(Boolean));
    const recentSet = new Set(recentRecommendationKeys);

    let pool = normalizedSource.filter((key) => !excludeSet.has(key));
    if (pool.length === 0) pool = [...normalizedSource];
    if (avoidRecent) {
        const dedupedPool = pool.filter((key) => !recentSet.has(key));
        if (dedupedPool.length > 0) pool = dedupedPool;
    }
    if (pool.length === 0) return '';
    return pool[Math.floor(Math.random() * pool.length)];
}

function getNeighborCategories(category) {
    const idx = recommendationCategoryOrder.indexOf(category);
    if (idx === -1) return [];
    const neighbors = [];
    if (idx > 0) neighbors.push(recommendationCategoryOrder[idx - 1]);
    if (idx < recommendationCategoryOrder.length - 1) neighbors.push(recommendationCategoryOrder[idx + 1]);
    return neighbors;
}

function buildAlternativeMenuKeys(primaryKey, sourceMenus) {
    const scoped = (Array.isArray(sourceMenus) && sourceMenus.length > 0) ? sourceMenus : dinnerMenuKeys;
    const primaryCategory = getCategoryOfMenu(primaryKey);
    const excludeKeys = new Set([primaryKey]);
    const recentSet = new Set(recentRecommendationKeys);
    const picked = [];

    const appendFrom = (list, maxToAdd = Infinity) => {
        let added = 0;
        for (const key of list) {
            if (picked.length >= 3) break;
            if (added >= maxToAdd) break;
            if (!key || excludeKeys.has(key) || picked.includes(key) || recentSet.has(key)) continue;
            picked.push(key);
            added += 1;
        }
    };

    const sameCategory = scoped.filter((key) => getCategoryOfMenu(key) === primaryCategory);
    const neighbors = getNeighborCategories(primaryCategory);
    const neighborCategory = scoped.filter((key) => neighbors.includes(getCategoryOfMenu(key)));

    appendFrom(sameCategory, 2);
    appendFrom(neighborCategory, 1);
    appendFrom(sameCategory);
    appendFrom(neighborCategory);
    appendFrom(scoped);

    return picked.slice(0, 3);
}

function getCalorieHint(menuKey, category) {
    const lighterMenus = new Set(['salad', 'caesarSalad', 'pho', 'sundubu', 'bunCha', 'onigiri', 'kimbap', 'omelet']);
    const richerMenus = new Set(['pizza', 'chicken', 'porkBelly', 'bbqRibs', 'budaeJjigae', 'gamjatang', 'nachos', 'hamburger']);
    if (lighterMenus.has(menuKey)) {
        return currentLanguage === 'Korean'
            ? '가벼운 칼로리 밸런스를 고려했습니다.'
            : 'Calorie balance leans lighter for this pick.';
    }
    if (richerMenus.has(menuKey)) {
        return currentLanguage === 'Korean'
            ? '든든한 포만감이 필요한 상황을 반영했습니다.'
            : 'This option was favored for a more filling meal.';
    }
    if (category === 'korean' || category === 'japanese') {
        return currentLanguage === 'Korean'
            ? '국물/밥류 중심의 안정적인 선택을 우선했습니다.'
            : 'A balanced staple-style meal profile was prioritized.';
    }
    return currentLanguage === 'Korean'
        ? '카테고리 다양성과 칼로리 편차를 함께 고려했습니다.'
        : 'Category diversity and calorie spread were both considered.';
}

function buildRecommendationReasonLines(menuKey, sourceMenus) {
    const category = getCategoryOfMenu(menuKey);
    const categoryLabel = getSlotTranslation(category);
    const collectionLabel = getCollectionLabel(discoverFilterState.collection);
    const now = new Date();
    const hour = now.getHours();
    const recentAvoided = !recentRecommendationKeys.includes(menuKey);

    let timeContext = currentLanguage === 'Korean' ? '일반 식사 시간대' : 'general mealtime';
    if (hour >= 21 || hour < 4) {
        timeContext = currentLanguage === 'Korean' ? '야식 시간대' : 'late-night window';
    } else if (hour >= 11 && hour <= 14) {
        timeContext = currentLanguage === 'Korean' ? '점심 시간대' : 'lunch window';
    } else if (hour >= 17 && hour <= 20) {
        timeContext = currentLanguage === 'Korean' ? '저녁 시간대' : 'dinner window';
    }

    const line1 = currentLanguage === 'Korean'
        ? `${categoryLabel} 카테고리 기준으로 현재 추천 풀(${sourceMenus.length}개)에서 선택했습니다.`
        : `Picked from the current ${categoryLabel}-scoped pool (${sourceMenus.length} candidates).`;
    const line2 = discoverFilterState.collection !== 'all'
        ? (currentLanguage === 'Korean'
            ? `${collectionLabel} 컬렉션과 ${timeContext} 맥락을 함께 반영했습니다.`
            : `${collectionLabel} collection + ${timeContext} context were both applied.`)
        : (currentLanguage === 'Korean'
            ? `${timeContext}에 맞는 메뉴 성격을 우선 반영했습니다.`
            : `Menu profile was tuned for the ${timeContext}.`);
    const line3 = currentLanguage === 'Korean'
        ? `${recentAvoided ? '최근 추천과 중복을 피했고' : '최근 기록을 참고했고'}, ${getCalorieHint(menuKey, category)}`
        : `${recentAvoided ? 'Recent duplicates were avoided' : 'Recent history was considered'}, and ${getCalorieHint(menuKey, category)}`;
    const lines = [line1, line2, line3];
    if (activeUserDietProfile) {
        const profileLine = currentLanguage === 'Korean'
            ? '프로필(목표/알레르기/기피/선호) 기반 필터를 함께 반영했습니다.'
            : 'Profile filters (goal/allergy/dislikes/preference) were also applied.';
        lines.push(profileLine);
    }
    return lines;
}

function renderRecommendationInsights(reasonLines, alternativeKeys) {
    if (!isFeatureEnabled('recoWhy')) {
        latestAlternativeMenuKeys = [];
        return;
    }
    const copy = getRecommendationUiCopy();
    if (recommendationReasonTitle) recommendationReasonTitle.textContent = copy.reasonTitle;
    if (alternativeOptionsTitle) alternativeOptionsTitle.textContent = copy.alternativeTitle;

    if (recommendationReasonList) {
        recommendationReasonList.innerHTML = '';
        (reasonLines || []).forEach((line) => {
            const item = document.createElement('li');
            item.textContent = line;
            recommendationReasonList.appendChild(item);
        });
    }

    latestAlternativeMenuKeys = Array.isArray(alternativeKeys) ? alternativeKeys.slice(0, 3) : [];
    if (alternativeOptionsButtons) {
        alternativeOptionsButtons.innerHTML = '';
        latestAlternativeMenuKeys.forEach((menuKey) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
            button.dataset.menuKey = menuKey;
            button.textContent = getMenuTranslation(menuKey);
            button.addEventListener('click', () => {
                emitPreparedAnalyticsEvent('alternative_option_click', {
                    selectedMenuKey: menuKey,
                    baseMenuKey: lastRecommendedMenuKey,
                    poolSize: discoverFilteredMenuKeys.length
                });
                recommendMenuByKey(menuKey, { source: 'alternative' });
            });
            alternativeOptionsButtons.appendChild(button);
        });
    }
}

function updateRecommendationInsightTranslations() {
    if (!isFeatureEnabled('recoWhy')) return;
    const copy = getRecommendationUiCopy();
    if (recommendationReasonTitle) recommendationReasonTitle.textContent = copy.reasonTitle;
    if (alternativeOptionsTitle) alternativeOptionsTitle.textContent = copy.alternativeTitle;
    if (latestAlternativeMenuKeys.length > 0 && alternativeOptionsButtons) {
        const buttons = Array.from(alternativeOptionsButtons.querySelectorAll('button[data-menu-key]'));
        buttons.forEach((button) => {
            const menuKey = button.dataset.menuKey;
            if (menuKey) button.textContent = getMenuTranslation(menuKey);
        });
    }
    if (lastRecommendedMenuKey) {
        const sourceMenus = getProfileAwareMenuPool(discoverFilteredMenuKeys.length > 0 ? discoverFilteredMenuKeys : dinnerMenuKeys);
        const reasonLines = buildRecommendationReasonLines(lastRecommendedMenuKey, sourceMenus);
        if (recommendationReasonList) {
            recommendationReasonList.innerHTML = '';
            reasonLines.forEach((line) => {
                const item = document.createElement('li');
                item.textContent = line;
                recommendationReasonList.appendChild(item);
            });
        }
    } else if (recommendationReasonList) {
        recommendationReasonList.innerHTML = '';
        copy.reasonPlaceholder.forEach((line) => {
            const item = document.createElement('li');
            item.textContent = line;
            recommendationReasonList.appendChild(item);
        });
    }
}

function finalizeRecommendationButtonState(buttonText) {
    recommendBtn.disabled = false;
    recommendBtn.innerHTML = `<span class="btn-icon">🎲</span><span class="btn-text">${buttonText}</span>`;
}

async function recommendMenuByKey(menuKey, options = {}) {
    const { source = 'primary', trackInteraction = false } = options;
    const sourceMenus = getProfileAwareMenuPool(discoverFilteredMenuKeys.length > 0 ? discoverFilteredMenuKeys : dinnerMenuKeys);
    const t = translations[currentLanguage] || translations['English'];
    const wasReroll = menuRecommendation.dataset.hasRecommendation === 'true';
    const safeMenuKey = menuKey || pickRandomMenuKey(sourceMenus);
    if (!safeMenuKey) return;

    const menuText = getMenuTranslation(safeMenuKey);
    menuRecommendation.style.opacity = '0';
    setTimeout(() => {
        menuRecommendation.textContent = menuText;
        menuRecommendation.dataset.hasRecommendation = 'true';
        menuRecommendation.style.opacity = '1';
    }, 200);

    recommendBtn.disabled = true;
    recommendBtn.innerHTML = `<span class="btn-icon">⏳</span><span class="btn-text">${t.loadingImage}</span>`;
    menuImage.style.opacity = '0.5';

    const englishMenuText = (menuTranslations['English'] && menuTranslations['English'][safeMenuKey]) ? menuTranslations['English'][safeMenuKey] : menuText;
    const searchTerm = imageSearchOverrides[safeMenuKey] || englishMenuText;
    const imageUrl = await fetchPexelsImage(searchTerm, englishMenuText);

    if (isFeatureEnabled('recoWhy')) {
        const reasonLines = buildRecommendationReasonLines(safeMenuKey, sourceMenus);
        const alternativeKeys = buildAlternativeMenuKeys(safeMenuKey, sourceMenus);
        renderRecommendationInsights(reasonLines, alternativeKeys);
    }
    rememberRecommendationKey(safeMenuKey);
    lastRecommendedMenuKey = safeMenuKey;

    if (trackInteraction) {
        emitPreparedAnalyticsEvent('recommend_click', {
            source,
            menuKey: safeMenuKey,
            reroll: wasReroll,
            poolSize: sourceMenus.length
        });
    }

    if (!imageUrl) {
        menuImage.src = '';
        menuImage.alt = `${menuText} - ${t.imageAlt || 'recommended menu photo'}`;
        menuImage.style.opacity = '1';
        finalizeRecommendationButtonState(t.getAnother);
        return;
    }

    const img = new Image();
    img.onload = () => {
        menuImage.src = imageUrl;
        menuImage.alt = `${menuText} - ${t.imageAlt || 'recommended menu photo'}`;
        menuImage.style.opacity = '1';
        finalizeRecommendationButtonState(t.getAnother);
    };
    img.onerror = () => {
        console.error('Error loading image for:', safeMenuKey);
        menuImage.src = '';
        menuImage.style.opacity = '1';
        finalizeRecommendationButtonState(t.getAnother);
    };
    img.src = imageUrl;
}

restoreRecentRecommendationKeys();

// Language Selector
const languageBtn = document.getElementById('language-btn');
const languageSelector = document.querySelector('.language-selector');
const languageDropdown = document.getElementById('language-dropdown');
const languageSearch = document.getElementById('language-search');
const languageList = document.getElementById('language-list');
const selectedLanguageEl = document.getElementById('selected-language');

const DEFAULT_LANGUAGE = 'English';
// Use a synchronous boot language to minimize first-paint flicker.
const bootSavedLanguage = localStorage.getItem('selectedLanguage');
const bootLocale = (navigator.language || '').toLowerCase();
let currentLanguage = (
    bootSavedLanguage && translations[bootSavedLanguage]
        ? bootSavedLanguage
        : (bootLocale.startsWith('ko') ? 'Korean' : DEFAULT_LANGUAGE)
);
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

function updateLanguageUI(language, countryCode, explicitFlag) {
    const iconSpan = languageBtn.querySelector('.icon');
    const flag = explicitFlag || (countryCode && countryFlags[countryCode] ? countryFlags[countryCode] : '\u{1F310}');
    if (iconSpan) iconSpan.textContent = flag;
    selectedLanguageEl.textContent = language;
    const mobileLabel = document.getElementById('mobile-selected-language');
    if (mobileLabel) mobileLabel.textContent = language;
}

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
        zh: 'Mandarin Chinese',
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
        return { language: savedLang, countryCode: null, unsupportedLanguage: null };
    }

    let detectedLanguage = null;
    let countryCode = null;
    let unsupportedLanguage = null;

    const ipCountryCode = await getCountryCodeFromIP();
    if (typeof CountryLanguageService !== 'undefined' && ipCountryCode) {
        const languages = CountryLanguageService.getLanguagesByCode(ipCountryCode);
        if (languages) {
            detectedLanguage = languages.find(lang => translations[lang]) || null;
            if (!detectedLanguage && languages.length > 0) {
                unsupportedLanguage = languages[0];
            }
            countryCode = ipCountryCode;
        }
    }

    if (!detectedLanguage && typeof CountryLanguageService !== 'undefined') {
        const localeCountryCode = getCountryCodeFromLocale();
        if (localeCountryCode) {
            const languages = CountryLanguageService.getLanguagesByCode(localeCountryCode);
            if (languages) {
                detectedLanguage = languages.find(lang => translations[lang]) || null;
                if (!detectedLanguage && languages.length > 0) {
                    unsupportedLanguage = languages[0];
                }
                countryCode = countryCode || localeCountryCode;
            }
        }
    }

    if (!detectedLanguage) {
        const localeLanguage = getLanguageFromLocale();
        if (localeLanguage && translations[localeLanguage]) {
            detectedLanguage = localeLanguage;
        } else if (localeLanguage) {
            unsupportedLanguage = localeLanguage;
        }
    }

    return { language: detectedLanguage || DEFAULT_LANGUAGE, countryCode, unsupportedLanguage };
}

// Initialize language selector
async function initLanguageSelector() {
    if (typeof CountryLanguageService !== 'undefined') {
        allCountries = CountryLanguageService.getAllCountries();
        renderLanguageList(allCountries);
        // Expose for mobile language panel
        window._allCountries = allCountries;
        window._countryFlags = countryFlags;
        window._translations = translations;
    }

    // Mobile language search
    const mobileSearch = document.getElementById('mobile-language-search');
    if (mobileSearch) {
        mobileSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allCountries.filter(c =>
                c.country.toLowerCase().includes(term) ||
                c.languages.some(l => l.toLowerCase().includes(term)) ||
                c.code.toLowerCase().includes(term)
            );
            if (typeof renderMobileLanguageList === 'function') {
                renderMobileLanguageList(filtered);
            }
        });
    }

    const resolved = await resolveInitialLanguage();
    currentLanguage = resolved.language;
    updateLanguageUI(resolved.language, resolved.countryCode);
    if (!localStorage.getItem('selectedLanguage')) {
        localStorage.setItem('selectedLanguage', resolved.language);
    }
    applyTranslations();
    if (resolved.unsupportedLanguage) {
        const t = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
        const template = t.languageNotSupported || 'Sorry, {language} is not supported yet. Showing English.';
        const message = template.replace('{language}', resolved.unsupportedLanguage);
        showNotification(message, '\u{1F310}');
    }
}

// Render language list
function renderLanguageList(countries) {
    languageList.innerHTML = '';

    countries.forEach(country => {
        const flag = countryFlags[country.code] || '\u{1F310}';
        // Find the first supported language for this country
        const supportedLang = country.languages.find(lang => translations[lang]);
        if (!supportedLang) return; // Skip countries with no supported language

        const item = document.createElement('div');
        item.className = 'language-item';

        item.innerHTML = `
            <span class="flag">${flag}</span>
            <span class="country-name">${country.country}</span>
            <span class="lang-code">${country.code}</span>
        `;

        item.addEventListener('click', () => {
            selectLanguage(country.country, supportedLang, flag);
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

function setSidebarNavLabel(id, label, iconName) {
    const item = document.getElementById(id);
    if (!item || !label) return;

    let icon = item.querySelector('.material-icons-outlined');
    if (!icon && iconName) {
        icon = document.createElement('span');
        icon.className = 'material-icons-outlined text-[20px]';
        icon.textContent = iconName;
        item.prepend(icon);
    } else if (icon && iconName && !icon.textContent.trim()) {
        icon.textContent = iconName;
    }

    let text = item.querySelector('.sidebar-text');
    if (!text) {
        text = document.createElement('span');
        text.className = 'sidebar-text whitespace-nowrap text-sm font-medium';
        item.appendChild(text);
    }
    text.textContent = label;
}

// Apply translations to all UI elements
function applyTranslations() {
    const t = translations[currentLanguage] || translations['English'];

    // Generic i18n pass for all nodes tagged with data-i18n.
    const i18nNodes = document.querySelectorAll('[data-i18n]');
    i18nNodes.forEach((node) => {
        const key = node.dataset.i18n;
        if (!key) return;
        const value = getTranslation(key);
        if (!value) return;
        if (value.includes('<') && value.includes('>')) {
            node.innerHTML = value;
        } else {
            node.textContent = value;
        }
    });

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
    const slotMachineLabel = t.slotMachine || (currentLanguage === 'Korean' ? '슬롯머신' : 'Slot Machine');
    setSidebarNavLabel('nav-recommendation', slotMachineLabel, 'casino');
    setSidebarNavLabel('nav-recommend', t.navRecommendation || t.todayRecommendation, 'recommend');
    setSidebarNavLabel('nav-bulletin', t.navBulletin, 'forum');
    const plannerLabel = currentLanguage === 'Korean' ? '식단 짜기' : 'Meal Planner';
    setSidebarNavLabel('nav-planner', plannerLabel, 'restaurant_menu');
    setSidebarNavLabel('nav-contact', t.navContact, 'mail');
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
    updateRecommendationInsightTranslations();

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
    const footer = document.getElementById('footer-copy');
    if (footer) footer.textContent = t.footer;

    // Update footer links
    const aboutLink = document.getElementById('about-link');
    const privacyLink = document.getElementById('privacy-link');
    const termsLink = document.getElementById('terms-link');
    if (aboutLink) {
        aboutLink.textContent = getPageTranslation(currentLanguage, 'aboutTitle');
        aboutLink.href = `/pages/about.html?lang=${currentLanguage}`;
    }
    if (privacyLink) {
        privacyLink.textContent = getPageTranslation(currentLanguage, 'privacyTitle');
        privacyLink.href = `/pages/privacy.html?lang=${currentLanguage}`;
    }
    if (termsLink) {
        termsLink.textContent = getPageTranslation(currentLanguage, 'termsTitle');
        termsLink.href = `/pages/terms.html?lang=${currentLanguage}`;
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

    // Update Popular Menu Top 10 Section
    const popularTitle = document.getElementById('popular-title');
    if (popularTitle) popularTitle.textContent = getTranslation('popularMenuTitle');

    const popularSection = popularTitle ? popularTitle.closest('section') : null;
    const popularDesc = popularSection?.querySelector('p[data-i18n="popularMenuDesc"]');
    if (popularDesc) popularDesc.textContent = getTranslation('popularMenuDesc');

    const popularMenuInfos = popularSection?.querySelectorAll('.popular-menu-info') || [];
    popularMenuInfos.forEach((info) => {
        const menuHeading = info.querySelector('h3[data-menu-key]');
        if (menuHeading) {
            menuHeading.textContent = getMenuTranslation(menuHeading.dataset.menuKey);
        }

        const desc = info.querySelector('p[data-i18n]');
        if (desc) {
            desc.textContent = getTranslation(desc.dataset.i18n);
        }
    });

    // Update Delivery Menu Category Guide
    const deliveryTitle = document.getElementById('delivery-title');
    if (deliveryTitle) deliveryTitle.textContent = getTranslation('deliveryGuideTitle');

    const deliverySection = deliveryTitle ? deliveryTitle.closest('section') : null;
    const deliveryDesc = deliverySection?.querySelector('p[data-i18n="deliveryGuideDesc"]');
    if (deliveryDesc) deliveryDesc.textContent = getTranslation('deliveryGuideDesc');

    const deliveryNameNodes = deliverySection?.querySelectorAll('h3[data-i18n^="deliveryCat"][data-i18n$="Name"]') || [];
    deliveryNameNodes.forEach((nameNode) => {
        if (nameNode.dataset.i18n) {
            nameNode.textContent = getTranslation(nameNode.dataset.i18n);
        }

        const card = nameNode.closest('.bg-gray-50');
        const desc = card?.querySelector('p[data-i18n^="deliveryCat"][data-i18n$="Desc"]');
        if (desc?.dataset.i18n) {
            desc.textContent = getTranslation(desc.dataset.i18n);
        }

        const tags = card?.querySelectorAll('.delivery-menu-tag[data-menu-key]') || [];
        tags.forEach((tag) => {
            tag.textContent = getMenuTranslation(tag.dataset.menuKey);
        });
    });

    // Update Meal Time Guide: Lunch vs Dinner
    const mealTimeTitle = document.getElementById('meal-time-title');
    const mealDefaults = {
        mealTimeTitle: '점심 메뉴 vs 저녁 메뉴 선택 가이드',
        mealTimeDesc: '같은 음식이라도 점심과 저녁에 먹을 때 느낌이 다릅니다. 시간대에 맞는 메뉴를 선택해보세요.',
        mealLunchTitle: '점심 메뉴 추천',
        mealLunchDesc: '점심에는 오후 업무 효율을 위해 너무 무겁지 않으면서도 에너지를 보충할 수 있는 메뉴가 좋습니다. 소화가 잘 되고 빠르게 먹을 수 있는 메뉴를 선택하세요.',
        mealLunchItem1: '<strong>백반/한정식:</strong> 균형 잡힌 영양소를 한 번에 섭취할 수 있는 가성비 메뉴',
        mealLunchItem2: '<strong>국밥/국수:</strong> 빠르게 먹을 수 있고 속이 편한 국물 요리',
        mealLunchItem3: '<strong>비빔밥/덮밥:</strong> 채소와 단백질을 함께 섭취할 수 있는 건강 메뉴',
        mealLunchItem4: '<strong>샌드위치/샐러드:</strong> 가볍게 먹고 싶을 때 적합한 간편식',
        mealLunchItem5: '<strong>돈카츠/우동:</strong> 적당한 양으로 든든한 점심 해결',
        mealDinnerTitle: '저녁 메뉴 추천',
        mealDinnerDesc: '저녁에는 하루의 피로를 풀 수 있는 든든하고 맛있는 메뉴가 좋습니다. 가족이나 친구와 함께 여유롭게 즐길 수 있는 메뉴를 선택하세요.',
        mealDinnerItem1: '<strong>삼겹살/갈비:</strong> 가족 또는 친구와 함께 구워 먹는 고기 요리',
        mealDinnerItem2: '<strong>찌개/전골:</strong> 추운 날 몸을 따뜻하게 해주는 국물 요리',
        mealDinnerItem3: '<strong>치킨/피자:</strong> 편안하게 TV 보면서 즐기는 배달 메뉴',
        mealDinnerItem4: '<strong>파스타/스테이크:</strong> 분위기 있는 데이트에 적합한 양식',
        mealDinnerItem5: '<strong>회/초밥:</strong> 신선한 해산물로 특별한 저녁을 즐기는 메뉴',
        mealTip1: '점심 메뉴를 선택할 때는 <strong>식사 시간</strong>을 고려하는 것이 중요합니다. 보통 직장인의 점심시간은 1시간 내외이므로, 주문 후 빠르게 나오는 메뉴가 좋습니다. 반면 저녁에는 시간 여유가 있으므로 조리 시간이 긴 메뉴도 충분히 즐길 수 있습니다.',
        mealTip2: '<strong>다이어트 중이라면</strong> 점심은 가볍게, 저녁은 더 가볍게 먹는 것이 좋습니다. 점심에 탄수화물과 단백질을 충분히 섭취하고, 저녁에는 채소 위주의 가벼운 식사를 하면 건강한 식단 관리가 가능합니다.'
    };
    const getMealText = (key) => getTranslation(key) || mealDefaults[key] || '';
    if (mealTimeTitle) {
        mealTimeTitle.textContent = getMealText('mealTimeTitle');
    }
    const mealTimeSection = mealTimeTitle ? mealTimeTitle.closest('section') : null;
    if (mealTimeSection) {
        const sectionDesc = mealTimeSection.querySelector('.p-6 > p.text-sm');
        if (sectionDesc) sectionDesc.textContent = getMealText('mealTimeDesc');

        const cardsWrap = mealTimeSection.querySelector('.grid');
        const cards = cardsWrap ? Array.from(cardsWrap.children) : [];

        const lunchCard = cards[0];
        if (lunchCard) {
            const lunchTitle = lunchCard.querySelector('h3');
            if (lunchTitle) lunchTitle.textContent = getMealText('mealLunchTitle');
            const lunchDesc = lunchCard.querySelector('p.mb-3');
            if (lunchDesc) lunchDesc.textContent = getMealText('mealLunchDesc');
            const lunchItems = lunchCard.querySelectorAll('ul li span:last-child');
            const lunchKeys = ['mealLunchItem1', 'mealLunchItem2', 'mealLunchItem3', 'mealLunchItem4', 'mealLunchItem5'];
            lunchItems.forEach((item, idx) => {
                const key = lunchKeys[idx];
                if (key) item.innerHTML = getMealText(key);
            });
        }

        const dinnerCard = cards[1];
        if (dinnerCard) {
            const dinnerTitle = dinnerCard.querySelector('h3');
            if (dinnerTitle) dinnerTitle.textContent = getMealText('mealDinnerTitle');
            const dinnerDesc = dinnerCard.querySelector('p.mb-3');
            if (dinnerDesc) dinnerDesc.textContent = getMealText('mealDinnerDesc');
            const dinnerItems = dinnerCard.querySelectorAll('ul li span:last-child');
            const dinnerKeys = ['mealDinnerItem1', 'mealDinnerItem2', 'mealDinnerItem3', 'mealDinnerItem4', 'mealDinnerItem5'];
            dinnerItems.forEach((item, idx) => {
                const key = dinnerKeys[idx];
                if (key) item.innerHTML = getMealText(key);
            });
        }

        const tips = mealTimeSection.querySelectorAll('.mt-5 p');
        if (tips[0]) tips[0].innerHTML = getMealText('mealTip1');
        if (tips[1]) tips[1].innerHTML = getMealText('mealTip2');
    }

    syncDiscoverControlUI();
    updateDiscoverSummary();

    if (typeof updateAuthUI === 'function') {
        updateAuthUI(currentAuthUser);
    }
}

// Select language
function selectLanguage(country, language, flag) {
    currentLanguage = language;

    // Save to localStorage for sub-pages
    localStorage.setItem('selectedLanguage', language);

    // Update the language bar to show flag and language name immediately
    updateLanguageUI(language, null, flag);

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
recommendBtn?.addEventListener('click', async () => {
    const sourceMenus = getProfileAwareMenuPool(discoverFilteredMenuKeys.length > 0 ? discoverFilteredMenuKeys : dinnerMenuKeys);
    const recommendedMenuKey = pickRandomMenuKey(sourceMenus, { avoidRecent: true });
    await recommendMenuByKey(recommendedMenuKey, { source: 'primary', trackInteraction: true });
});

function applyThemeState(isDark, options = {}) {
    const { persist = true, notify = false } = options;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    // Legacy styles still use body.light-mode as "light theme" indicator.
    document.body.classList.toggle('light-mode', !isDark);

    document.querySelectorAll('.theme-toggle-switch').forEach((btn) => {
        btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        btn.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
    });

    if (persist) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    if (notify) {
        const t = translations[currentLanguage] || translations['English'];
        showNotification(isDark ? t.darkMode : t.lightMode, isDark ? '\u{1F319}' : '\u2600\uFE0F');
    }
}

// Sync theme state once on load (head script may set .dark before paint).
applyThemeState(document.documentElement.classList.contains('dark'), { persist: false, notify: false });

function toggleThemeMode(event) {
    if (event) event.preventDefault();
    const nextIsDark = !document.documentElement.classList.contains('dark');
    applyThemeState(nextIsDark, { persist: true, notify: true });
}

// Expose for inline handlers (desktop/mobile sidebar)
window.toggleThemeMode = toggleThemeMode;

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
let auth;
let currentAuthUser = null;
let authUiInitialized = false;
const KAKAO_OIDC_PROVIDER_ID = 'oidc.kakao';
try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        if (firebase.auth) {
            auth = firebase.auth();
        }
    }
} catch (e) {
    console.log('Firebase initialization skipped or failed:', e);
}

function parseCsvInput(value) {
    if (!value) return [];
    return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function getAuthUiCopy() {
    if (currentLanguage === 'Korean') {
        return {
            signedOut: '로그인하면 맞춤 리포트 이력을 저장할 수 있습니다.',
            signedInPrefix: '로그인됨',
            googleButton: 'Google 로그인',
            kakaoButton: 'Kakao 로그인',
            signOutButton: '로그아웃',
            saveProfile: '프로필 저장',
            saveSuccess: '프로필이 저장되었습니다.',
            saveFail: '프로필 저장 중 오류가 발생했습니다.',
            loginFail: '로그인에 실패했습니다.',
            needConfig: 'Kakao OIDC 설정이 필요합니다.'
        };
    }
    return {
        signedOut: 'Sign in to save your personalized report history.',
        signedInPrefix: 'Signed in',
        googleButton: 'Sign in with Google',
        kakaoButton: 'Sign in with Kakao',
        signOutButton: 'Sign out',
        saveProfile: 'Save Profile',
        saveSuccess: 'Profile saved.',
        saveFail: 'Failed to save profile.',
        loginFail: 'Failed to sign in.',
        needConfig: 'Kakao OIDC setup is required.'
    };
}

function setAuthTextContent(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setAuthValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

function fillAuthProfileForm(profile) {
    setAuthValue('profile-goal', profile?.goal || '');
    setAuthValue('profile-allergies', Array.isArray(profile?.allergies) ? profile.allergies.join(', ') : '');
    setAuthValue('profile-dislikes', Array.isArray(profile?.dislikedIngredients) ? profile.dislikedIngredients.join(', ') : '');
    setAuthValue('profile-preferred-categories', Array.isArray(profile?.preferredCategories) ? profile.preferredCategories.join(', ') : '');
}

function updateAuthUI(user) {
    const copy = getAuthUiCopy();
    const signedIn = !!user;
    const signedInActions = document.getElementById('auth-signin-actions');
    const signOutBtn = document.getElementById('auth-signout-btn');
    const profileForm = document.getElementById('auth-profile-form');
    const mobileSignedInActions = document.getElementById('mobile-auth-signin-actions');
    const mobileSignOutBtn = document.getElementById('mobile-auth-signout-btn');

    const displayName = user?.displayName || user?.email || user?.uid || '';
    const statusText = signedIn
        ? `${copy.signedInPrefix}: ${displayName}`
        : copy.signedOut;

    setAuthTextContent('auth-status-text', statusText);
    setAuthTextContent('mobile-auth-status-text', statusText);
    setAuthTextContent('auth-google-btn', copy.googleButton);
    setAuthTextContent('auth-kakao-btn', copy.kakaoButton);
    setAuthTextContent('mobile-auth-google-btn', copy.googleButton);
    setAuthTextContent('mobile-auth-kakao-btn', copy.kakaoButton);
    setAuthTextContent('auth-signout-btn', copy.signOutButton);
    setAuthTextContent('mobile-auth-signout-btn', copy.signOutButton);
    setAuthTextContent('profile-save-btn', copy.saveProfile);

    if (signedInActions) signedInActions.classList.toggle('hidden', signedIn);
    if (mobileSignedInActions) mobileSignedInActions.classList.toggle('hidden', signedIn);
    if (signOutBtn) signOutBtn.classList.toggle('hidden', !signedIn);
    if (mobileSignOutBtn) mobileSignOutBtn.classList.toggle('hidden', !signedIn);
    if (profileForm) profileForm.classList.toggle('hidden', !signedIn);
}

async function upsertMemberProfile(user, providerId) {
    if (!db || !user?.uid) return;
    const userRef = db.collection('users').doc(user.uid);
    const snapshot = await userRef.get().catch(() => null);
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const basePayload = {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        providerId: providerId || user.providerData?.[0]?.providerId || 'password',
        updatedAt: now,
        lastLoginAt: now
    };

    if (!snapshot || !snapshot.exists) {
        const initialPayload = {
            ...basePayload,
            createdAt: now,
            goal: '',
            allergies: [],
            dislikedIngredients: [],
            preferredCategories: []
        };
        await userRef.set(initialPayload, { merge: true });
        fillAuthProfileForm(initialPayload);
        return;
    }

    await userRef.set(basePayload, { merge: true });
    const existing = snapshot.data() || {};
    fillAuthProfileForm(existing);
}

async function saveCurrentUserProfile() {
    if (!db || !currentAuthUser) return;
    const copy = getAuthUiCopy();
    const userRef = db.collection('users').doc(currentAuthUser.uid);
    const payload = {
        goal: document.getElementById('profile-goal')?.value || '',
        allergies: parseCsvInput(document.getElementById('profile-allergies')?.value),
        dislikedIngredients: parseCsvInput(document.getElementById('profile-dislikes')?.value),
        preferredCategories: parseCsvInput(document.getElementById('profile-preferred-categories')?.value),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    try {
        await userRef.set(payload, { merge: true });
        if (typeof showNotification === 'function') {
            showNotification(copy.saveSuccess, '\u2705');
        }
    } catch (error) {
        console.error('Failed to save profile', error);
        if (typeof showNotification === 'function') {
            showNotification(copy.saveFail, '\u26A0\uFE0F');
        }
    }
}

function shouldUseRedirect(error) {
    const code = error?.code || '';
    return code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' || code === 'auth/operation-not-supported-in-this-environment';
}

async function signInWithGoogle() {
    if (!auth) return;
    const copy = getAuthUiCopy();
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        if (shouldUseRedirect(error)) {
            await auth.signInWithRedirect(provider);
            return;
        }
        console.error('Google sign-in failed', error);
        if (typeof showNotification === 'function') {
            showNotification(copy.loginFail, '\u26A0\uFE0F');
        }
    }
}

async function signInWithKakao() {
    if (!auth) return;
    const copy = getAuthUiCopy();
    if (!KAKAO_OIDC_PROVIDER_ID) {
        if (typeof showNotification === 'function') {
            showNotification(copy.needConfig, '\u26A0\uFE0F');
        }
        return;
    }
    const provider = new firebase.auth.OAuthProvider(KAKAO_OIDC_PROVIDER_ID);
    provider.setCustomParameters({ prompt: 'login' });
    try {
        await auth.signInWithPopup(provider);
    } catch (error) {
        if (shouldUseRedirect(error)) {
            await auth.signInWithRedirect(provider);
            return;
        }
        console.error('Kakao sign-in failed', error);
        if (typeof showNotification === 'function') {
            showNotification(copy.loginFail, '\u26A0\uFE0F');
        }
    }
}

async function signOutMember() {
    if (!auth) return;
    await auth.signOut().catch((error) => {
        console.error('Sign-out failed', error);
    });
}

function bindAuthUIEvents() {
    if (authUiInitialized) return;
    authUiInitialized = true;

    const onGoogle = () => signInWithGoogle();
    const onKakao = () => signInWithKakao();
    const onSignOut = () => signOutMember();
    const onSaveProfile = () => saveCurrentUserProfile();

    document.getElementById('auth-google-btn')?.addEventListener('click', onGoogle);
    document.getElementById('mobile-auth-google-btn')?.addEventListener('click', onGoogle);
    document.getElementById('auth-kakao-btn')?.addEventListener('click', onKakao);
    document.getElementById('mobile-auth-kakao-btn')?.addEventListener('click', onKakao);
    document.getElementById('auth-signout-btn')?.addEventListener('click', onSignOut);
    document.getElementById('mobile-auth-signout-btn')?.addEventListener('click', onSignOut);
    document.getElementById('profile-save-btn')?.addEventListener('click', onSaveProfile);
}

function initMemberAuth() {
    bindAuthUIEvents();
    updateAuthUI(null);
    if (!auth) return;

    auth.onAuthStateChanged(async (user) => {
        currentAuthUser = user || null;
        updateAuthUI(user || null);
        if (!user) {
            fillAuthProfileForm(null);
            return;
        }
        emitPreparedAnalyticsEvent('login_success', {
            method: user.providerData?.[0]?.providerId || 'firebase',
            userIdHash: (window.NinanooAnalytics && typeof window.NinanooAnalytics.identify === 'function')
                ? window.NinanooAnalytics.identify(user.uid || '')
                : ''
        });
        const providerId = user.providerData?.[0]?.providerId || '';
        await upsertMemberProfile(user, providerId).catch((error) => {
            console.error('Failed to upsert member profile', error);
        });
    });
}

let sidebarSupabaseClient = null;
let sidebarSupabaseUser = null;
let sidebarAuthUiInitialized = false;

function getSupabaseClientConfig() {
    const url = String(window.SUPABASE_URL || '').trim();
    const anonKey = String(window.SUPABASE_ANON_KEY || '').trim();

    return { url, anonKey };
}

function getSidebarAuthCopy() {
    if (currentLanguage === 'Korean') {
        return { login: '로그인', mypage: '마이페이지', signOut: '로그아웃' };
    }
    return { login: 'Log In', mypage: 'My Page', signOut: 'Sign Out' };
}

function getSidebarMemberId(user) {
    const email = String(user?.email || '').trim();
    if (email && email.includes('@')) return email.split('@')[0];
    if (email) return email;
    return String(user?.id || '').slice(0, 8);
}

function updateSidebarAuthCta(user = sidebarSupabaseUser) {
    const desktopLink = document.getElementById('sidebar-auth-link');
    const desktopLabel = document.getElementById('sidebar-auth-label');
    const desktopIcon = document.getElementById('sidebar-auth-icon');
    const desktopUserId = document.getElementById('sidebar-auth-userid');
    const desktopSignOutBtn = document.getElementById('sidebar-signout-btn');
    const desktopSignOutLabel = desktopSignOutBtn?.querySelector('.sidebar-text');
    const mobileLink = document.getElementById('mobile-sidebar-auth-link');
    const mobileLabel = document.getElementById('mobile-sidebar-auth-label');
    const mobileIcon = document.getElementById('mobile-sidebar-auth-icon');
    const mobileUserId = document.getElementById('mobile-sidebar-auth-userid');
    const mobileSignOutBtn = document.getElementById('mobile-sidebar-signout-btn');
    const mobileSignOutLabel = document.getElementById('mobile-sidebar-signout-label');

    const copy = getSidebarAuthCopy();
    const signedIn = !!user;
    const label = signedIn ? copy.mypage : copy.login;
    const memberId = signedIn ? getSidebarMemberId(user) : '';
    const href = signedIn ? '/pages/mypage.html' : '/pages/auth.html';
    const title = signedIn ? copy.mypage : copy.login;
    const icon = signedIn ? 'person' : 'login';

    if (desktopLink) {
        desktopLink.href = href;
        desktopLink.title = title;
    }
    if (mobileLink) mobileLink.href = href;
    if (desktopLabel) desktopLabel.textContent = label;
    if (mobileLabel) mobileLabel.textContent = label;
    if (desktopIcon) desktopIcon.textContent = icon;
    if (mobileIcon) mobileIcon.textContent = icon;
    if (desktopUserId) {
        desktopUserId.textContent = memberId ? '@' + memberId : '';
        desktopUserId.classList.toggle('hidden', !memberId);
    }
    if (mobileUserId) {
        mobileUserId.textContent = memberId ? '@' + memberId : '';
        mobileUserId.classList.toggle('hidden', !memberId);
    }
    if (desktopSignOutLabel) desktopSignOutLabel.textContent = copy.signOut;
    if (mobileSignOutLabel) mobileSignOutLabel.textContent = copy.signOut;
    if (desktopSignOutBtn) desktopSignOutBtn.classList.toggle('hidden', !signedIn);
    if (mobileSignOutBtn) mobileSignOutBtn.classList.toggle('hidden', !signedIn);
}

async function signOutSidebarMember() {
    if (!sidebarSupabaseClient) return;
    const { error } = await sidebarSupabaseClient.auth.signOut();
    if (error) {
        console.error('Sidebar sign-out failed', error);
        return;
    }

    sidebarSupabaseUser = null;
    if (window.NinanooProfileStore) {
        window.NinanooProfileStore.markSignedOut();
    }
    await refreshDietProfileContext({ preferCacheOnly: true }).catch(() => null);
    updateSidebarAuthCta(null);

    const mobileSidebar = document.getElementById('mobile-sidebar');
    if (mobileSidebar) mobileSidebar.style.display = 'none';
}

function bindSidebarAuthEvents() {
    if (sidebarAuthUiInitialized) return;
    sidebarAuthUiInitialized = true;

    const onSignOut = (event) => {
        event.preventDefault();
        signOutSidebarMember().catch((error) => {
            console.error('Sidebar sign-out failed', error);
        });
    };

    document.getElementById('sidebar-signout-btn')?.addEventListener('click', onSignOut);
    document.getElementById('mobile-sidebar-signout-btn')?.addEventListener('click', onSignOut);
}

async function initSidebarAuth() {
    bindSidebarAuthEvents();

    if (window.__runtimeConfigReady && typeof window.__runtimeConfigReady.then === 'function') {
        await window.__runtimeConfigReady.catch(() => null);
    }

    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        updateSidebarAuthCta(null);
        return;
    }

    const { url, anonKey } = getSupabaseClientConfig();
    if (!url || !anonKey) {
        updateSidebarAuthCta(null);
        return;
    }

    sidebarSupabaseClient = window.supabase.createClient(url, anonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });

    const syncSidebarAuthState = async () => {
        const { data: sessionData } = await sidebarSupabaseClient.auth.getSession();
        const sessionUser = sessionData?.session?.user || null;
        if (sessionUser) {
            sidebarSupabaseUser = sessionUser;
            if (window.NinanooProfileStore) {
                window.NinanooProfileStore.markSignedIn(sessionUser.id);
            }
            updateSidebarAuthCta(sidebarSupabaseUser);
            await refreshDietProfileContext().catch(() => null);
            return;
        }

        const { data: userData } = await sidebarSupabaseClient.auth.getUser();
        sidebarSupabaseUser = userData?.user || null;
        if (sidebarSupabaseUser && window.NinanooProfileStore) {
            window.NinanooProfileStore.markSignedIn(sidebarSupabaseUser.id);
        }
        if (!sidebarSupabaseUser && window.NinanooProfileStore) {
            window.NinanooProfileStore.markSignedOut();
        }
        updateSidebarAuthCta(sidebarSupabaseUser);
        await refreshDietProfileContext({ preferCacheOnly: !sidebarSupabaseUser }).catch(() => null);
    };

    await syncSidebarAuthState();

    sidebarSupabaseClient.auth.onAuthStateChange((_event, session) => {
        sidebarSupabaseUser = session?.user || null;
        if (sidebarSupabaseUser && window.NinanooProfileStore) {
            window.NinanooProfileStore.markSignedIn(sidebarSupabaseUser.id);
        }
        if (!sidebarSupabaseUser && window.NinanooProfileStore) {
            window.NinanooProfileStore.markSignedOut();
        }
        updateSidebarAuthCta(sidebarSupabaseUser);
        refreshDietProfileContext({ preferCacheOnly: !sidebarSupabaseUser }).catch(() => null);
    });

    window.addEventListener('focus', () => {
        syncSidebarAuthState().catch(() => null);
    });

    window.addEventListener('ninanoo:profile-updated', () => {
        refreshDietProfileContext({ preferCacheOnly: true }).catch(() => null);
    });
}

// Bulletin Board functionality
let bulletinForm = null;
let bulletinNickname = null;
let bulletinMessage = null;
let bulletinPosts = null;
let bulletinLoading = null;
let bulletinSubmit = null;
let bulletinFormStatus = null;
let bulletinSort = null;
let bulletinTagMenu = null;
let bulletinTagRegion = null;
let bulletinTagPrice = null;
let bulletinTagDifficulty = null;
let bulletinReportModal = null;
let bulletinReportReason = null;
let bulletinReportFeedback = null;
let bulletinReportSubmit = null;
let bulletinReportCancel = null;
let bulletinPendingReportPostId = '';
let bulletinInitialized = false;
let bulletinPostCache = [];

const BULLETIN_STORAGE_KEY = 'bulletinPosts';
const BULLETIN_CLIENT_ID_KEY = 'bulletinClientId';
const BULLETIN_POST_HISTORY_PREFIX = 'bulletinPostHistory:';
const BULLETIN_LIKED_PREFIX = 'bulletinLiked:';
const BULLETIN_POST_WINDOW_MS = 5 * 60 * 1000;
const BULLETIN_POST_LIMIT_IN_WINDOW = 3;
const BULLETIN_POST_COOLDOWN_MS = 45 * 1000;

// Get bulletin translations
function getBulletinTranslation(key) {
    const bulletinTranslations = {
        'English': {
            title: 'Community Board',
            desc: 'What did you eat today? Share your food stories with others!',
            formTitle: 'Write a Post',
            nicknameLabel: 'Nickname',
            nicknamePlaceholder: 'Nickname',
            messageLabel: 'Message',
            messagePlaceholder: 'Enter your message...',
            submit: 'Post',
            loading: 'Loading posts...',
            empty: 'No posts yet. Be the first to share!',
            recentTitle: 'Recent Posts',
            realtime: 'Real-time updates',
            sortLabel: 'Sort',
            sortLatest: 'Latest',
            sortPopular: 'Popular (Likes)',
            sortComments: 'Most comments',
            tagMenuLabel: 'Menu Tag',
            tagRegionLabel: 'Region Tag',
            tagPriceLabel: 'Price Tag',
            tagDifficultyLabel: 'Difficulty Tag',
            reportTitle: 'Report Post',
            reportReasonLabel: 'Reason',
            reportCancel: 'Cancel',
            reportSubmit: 'Report',
            like: 'Like',
            liked: 'Liked',
            report: 'Report',
            reportQueued: 'Report submitted. Thank you.',
            reportFailed: 'Failed to submit report. Try again.',
            postLimited: 'Posting is temporarily limited. Please wait.',
            justNow: 'Just now',
            minutesAgo: 'minutes ago',
            hoursAgo: 'hours ago',
            daysAgo: 'days ago'
        },
        'Korean': {
            title: '커뮤니티 게시판',
            desc: '오늘 뭐 먹었나요? 다른 사용자들과 음식 이야기를 나눠보세요!',
            formTitle: '게시글 작성하기',
            nicknameLabel: '닉네임',
            nicknamePlaceholder: '닉네임',
            messageLabel: '메시지',
            messagePlaceholder: '메시지를 입력하세요...',
            submit: '게시',
            loading: '게시물을 불러오는 중...',
            empty: '아직 게시물이 없습니다. 첫 번째로 공유해보세요!',
            recentTitle: '최근 게시글',
            realtime: '실시간 업데이트 중',
            sortLabel: '정렬',
            sortLatest: '최신',
            sortPopular: '인기(좋아요)',
            sortComments: '댓글수',
            tagMenuLabel: '메뉴 태그',
            tagRegionLabel: '지역 태그',
            tagPriceLabel: '가격대 태그',
            tagDifficultyLabel: '난이도 태그',
            reportTitle: '게시글 신고',
            reportReasonLabel: '사유 선택',
            reportCancel: '취소',
            reportSubmit: '신고',
            like: '좋아요',
            liked: '좋아요 완료',
            report: '신고',
            reportQueued: '신고가 접수되었습니다. 감사합니다.',
            reportFailed: '신고 접수에 실패했습니다. 다시 시도해 주세요.',
            postLimited: '연속 작성이 제한되었습니다. 잠시 후 다시 시도해 주세요.',
            justNow: '방금 전',
            minutesAgo: '분 전',
            hoursAgo: '시간 전',
            daysAgo: '일 전'
        },
        'Japanese': {
            title: 'コミュニティ掲示板',
            desc: '今日は何を食べましたか？他のユーザーと食べ物の話を共有しましょう！',
            formTitle: '投稿を書く',
            nicknameLabel: 'ニックネーム',
            nicknamePlaceholder: 'ニックネーム',
            messageLabel: 'メッセージ',
            messagePlaceholder: 'メッセージを入力...',
            submit: '投稿',
            loading: '投稿を読み込み中...',
            empty: 'まだ投稿がありません。最初に共有してください！',
            recentTitle: '最近の投稿',
            realtime: 'リアルタイム更新中',
            justNow: 'たった今',
            minutesAgo: '分前',
            hoursAgo: '時間前',
            daysAgo: '日前'
        },
        'Mandarin Chinese': {
            title: '社区留言板',
            desc: '今天吃了什么？与其他用户分享您的美食故事！',
            formTitle: '撰写帖子',
            nicknameLabel: '昵称',
            nicknamePlaceholder: '昵称',
            messageLabel: '消息',
            messagePlaceholder: '输入您的消息...',
            submit: '发布',
            loading: '加载帖子中...',
            empty: '还没有帖子。成为第一个分享的人！',
            recentTitle: '最近帖子',
            realtime: '实时更新中',
            justNow: '刚刚',
            minutesAgo: '分钟前',
            hoursAgo: '小时前',
            daysAgo: '天前'
        },
        'Spanish': {
            title: 'Tablón Comunitario',
            desc: '¿Qué comiste hoy? ¡Comparte tus historias de comida con otros!',
            formTitle: 'Escribir una publicación',
            nicknameLabel: 'Apodo',
            nicknamePlaceholder: 'Apodo',
            messageLabel: 'Mensaje',
            messagePlaceholder: 'Escribe tu mensaje...',
            submit: 'Publicar',
            loading: 'Cargando publicaciones...',
            empty: 'Aún no hay publicaciones. ¡Sé el primero en compartir!',
            recentTitle: 'Publicaciones recientes',
            realtime: 'Actualizaciones en tiempo real',
            justNow: 'Justo ahora',
            minutesAgo: 'minutos atrás',
            hoursAgo: 'horas atrás',
            daysAgo: 'días atrás'
        }
    };

    const langData = bulletinTranslations[currentLanguage] || bulletinTranslations['English'];
    return langData[key] || bulletinTranslations['English'][key];
}

function getBulletinClientId() {
    let clientId = localStorage.getItem(BULLETIN_CLIENT_ID_KEY);
    if (!clientId) {
        clientId = `b_${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem(BULLETIN_CLIENT_ID_KEY, clientId);
    }
    return clientId;
}

function normalizeBulletinPost(raw, fallbackId) {
    const tags = raw && typeof raw.tags === 'object' && raw.tags ? raw.tags : {};
    return {
        id: String(raw?.id || fallbackId || ''),
        nickname: String(raw?.nickname || '').trim().slice(0, 20) || '익명',
        message: String(raw?.message || '').trim().slice(0, 200),
        timestamp: Number(raw?.timestamp || Date.now()),
        tags: {
            menu: String(tags.menu || '기타').slice(0, 20),
            region: String(tags.region || '기타').slice(0, 20),
            price: String(tags.price || '보통').slice(0, 20),
            difficulty: String(tags.difficulty || '보통').slice(0, 20)
        },
        likeCount: Number.isFinite(Number(raw?.likeCount)) ? Number(raw.likeCount) : 0,
        reportCount: Number.isFinite(Number(raw?.reportCount)) ? Number(raw.reportCount) : 0,
        commentCount: Number.isFinite(Number(raw?.commentCount)) ? Number(raw.commentCount) : 0,
        clientId: String(raw?.clientId || '').slice(0, 40)
    };
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

function getCurrentSortMode() {
    return (bulletinSort && bulletinSort.value) ? bulletinSort.value : 'latest';
}

function sortBulletinPosts(posts, mode) {
    const next = [...posts];
    if (mode === 'popular') {
        next.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0) || (b.timestamp || 0) - (a.timestamp || 0));
        return next;
    }
    if (mode === 'comments') {
        next.sort((a, b) => (b.commentCount || 0) - (a.commentCount || 0) || (b.timestamp || 0) - (a.timestamp || 0));
        return next;
    }
    next.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return next;
}

function renderBulletinPostList(posts) {
    if (!bulletinPosts) return;
    bulletinPosts.innerHTML = '';
    if (!posts.length) {
        bulletinPosts.innerHTML = `<div class="bulletin-empty text-center text-sm text-gray-500 dark:text-gray-400 py-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">${getBulletinTranslation('empty')}</div>`;
        return;
    }
    const sorted = sortBulletinPosts(posts, getCurrentSortMode());
    sorted.slice(0, 50).forEach(post => bulletinPosts.appendChild(renderPost(post)));
}

function setBulletinFormStatus(message, isError) {
    if (!bulletinFormStatus) return;
    bulletinFormStatus.textContent = message || '';
    bulletinFormStatus.classList.remove('text-red-500', 'dark:text-red-300', 'text-emerald-600', 'dark:text-emerald-300', 'text-gray-500', 'dark:text-gray-400');
    if (!message) {
        bulletinFormStatus.classList.add('text-gray-500', 'dark:text-gray-400');
    } else if (isError) {
        bulletinFormStatus.classList.add('text-red-500', 'dark:text-red-300');
    } else {
        bulletinFormStatus.classList.add('text-emerald-600', 'dark:text-emerald-300');
    }
}

// Render a single post
function renderPost(post) {
    const avatars = ['🍔', '🍜', '🥘', '🍕', '🥗', '🍣', '🌮', '🍩'];
    const nickname = String(post.nickname || '').trim();
    const hashBase = nickname || 'user';
    const hash = Array.from(hashBase).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const avatar = avatars[hash % avatars.length];
    const isLiked = localStorage.getItem(BULLETIN_LIKED_PREFIX + post.id) === '1';
    const tagHtml = [post.tags.menu, post.tags.region, post.tags.price, post.tags.difficulty]
        .filter(Boolean)
        .map((tag) => `<span class="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 px-2 py-0.5 text-[11px] font-semibold">#${escapeHtml(tag)}</span>`)
        .join(' ');

    const postEl = document.createElement('div');
    postEl.className = 'bulletin-post bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700 transition-colors';
    postEl.innerHTML = `
        <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/35 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-lg border border-purple-100 dark:border-purple-700/40">
                    ${avatar}
                </div>
                <div>
                    <div class="bulletin-post-nickname font-bold text-gray-900 dark:text-gray-100">${escapeHtml(post.nickname)}</div>
                    <div class="bulletin-post-time text-xs text-gray-500 dark:text-gray-400">${formatTimeAgo(post.timestamp)}</div>
                </div>
            </div>
        </div>
        <div class="bulletin-post-message text-gray-700 dark:text-gray-200 leading-relaxed pl-[52px]">${escapeHtml(post.message)}</div>
        <div class="mt-3 pl-[52px] flex flex-wrap gap-1.5">${tagHtml}</div>
        <div class="mt-3 pl-[52px] flex items-center gap-2 text-xs">
            <button type="button" data-action="like" data-post-id="${escapeHtml(post.id)}" class="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 ${isLiked ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300' : 'border-gray-300 text-gray-700 dark:text-gray-200'}">
                <span class="material-icons-outlined text-sm">thumb_up</span>
                <span>${isLiked ? getBulletinTranslation('liked') : getBulletinTranslation('like')} (${post.likeCount || 0})</span>
            </button>
            <button type="button" data-action="report" data-post-id="${escapeHtml(post.id)}" class="inline-flex items-center gap-1 rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 px-2.5 py-1.5">
                <span class="material-icons-outlined text-sm">flag</span>
                <span>${getBulletinTranslation('report')}</span>
            </button>
            <span class="text-gray-500 dark:text-gray-400">댓글 ${(post.commentCount || 0)} · 신고 ${(post.reportCount || 0)}</span>
        </div>
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
        const posts = [];
        snapshot.forEach(doc => {
            posts.push(normalizeBulletinPost({ id: doc.id, ...doc.data() }, doc.id));
        });
        bulletinPostCache = posts;
        renderBulletinPostList(bulletinPostCache);
    } catch (error) {
        console.error('Error loading posts:', error);
        loadPostsFromLocalStorage();
    }
}

// Fallback: Load posts from localStorage
function loadPostsFromLocalStorage() {
    const raw = JSON.parse(localStorage.getItem(BULLETIN_STORAGE_KEY) || '[]');
    bulletinPostCache = raw.map((post, idx) => normalizeBulletinPost(post, post?.id || `local-${idx}`));
    renderBulletinPostList(bulletinPostCache);
}

function getBulletinTagSelection() {
    return {
        menu: bulletinTagMenu ? bulletinTagMenu.value : '기타',
        region: bulletinTagRegion ? bulletinTagRegion.value : '기타',
        price: bulletinTagPrice ? bulletinTagPrice.value : '보통',
        difficulty: bulletinTagDifficulty ? bulletinTagDifficulty.value : '보통'
    };
}

function checkPostingLimit(clientId) {
    const key = BULLETIN_POST_HISTORY_PREFIX + clientId;
    const now = Date.now();
    const historyRaw = JSON.parse(localStorage.getItem(key) || '[]');
    const history = historyRaw.filter(ts => Number(ts) > now - BULLETIN_POST_WINDOW_MS);
    const last = history.length ? Number(history[history.length - 1]) : 0;
    if (last && now - last < BULLETIN_POST_COOLDOWN_MS) {
        return { ok: false, message: getBulletinTranslation('postLimited') };
    }
    if (history.length >= BULLETIN_POST_LIMIT_IN_WINDOW) {
        return { ok: false, message: getBulletinTranslation('postLimited') };
    }
    return { ok: true, historyKey: key, history };
}

function markPostingHistory(limitResult) {
    if (!limitResult || !limitResult.historyKey) return;
    const next = [...(limitResult.history || []), Date.now()];
    localStorage.setItem(limitResult.historyKey, JSON.stringify(next.slice(-10)));
}

// Save post
async function savePost(nickname, message, tags) {
    const clientId = getBulletinClientId();
    const limitResult = checkPostingLimit(clientId);
    if (!limitResult.ok) {
        return { ok: false, message: limitResult.message };
    }

    const post = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        nickname: nickname.trim(),
        message: message.trim(),
        timestamp: Date.now(),
        tags: tags || getBulletinTagSelection(),
        likeCount: 0,
        reportCount: 0,
        commentCount: 0,
        clientId: clientId
    };

    if (db) {
        try {
            const ref = await db.collection('bulletin').add(post);
            post.id = ref.id;
            markPostingHistory(limitResult);
            return { ok: true, post };
        } catch (error) {
            console.error('Error saving to Firestore:', error);
        }
    }

    // Fallback to localStorage
    const posts = JSON.parse(localStorage.getItem(BULLETIN_STORAGE_KEY) || '[]');
    posts.unshift(post);
    localStorage.setItem(BULLETIN_STORAGE_KEY, JSON.stringify(posts.slice(0, 100)));
    markPostingHistory(limitResult);
    return { ok: true, post };
}

async function handleLike(postId) {
    if (!postId) return;
    const likedKey = BULLETIN_LIKED_PREFIX + postId;
    if (localStorage.getItem(likedKey) === '1') return;
    localStorage.setItem(likedKey, '1');

    if (db) {
        try {
            await db.collection('bulletin').doc(postId).update({
                likeCount: firebase.firestore.FieldValue.increment(1)
            });
            await loadPosts();
            return;
        } catch (error) {
            console.error('Error like update:', error);
        }
    }

    const posts = JSON.parse(localStorage.getItem(BULLETIN_STORAGE_KEY) || '[]');
    const next = posts.map(post => {
        if (String(post.id || '') !== String(postId)) return post;
        return { ...post, likeCount: (Number(post.likeCount) || 0) + 1 };
    });
    localStorage.setItem(BULLETIN_STORAGE_KEY, JSON.stringify(next.slice(0, 100)));
    loadPostsFromLocalStorage();
}

function openReportModal(postId) {
    bulletinPendingReportPostId = String(postId || '');
    if (!bulletinReportModal) return;
    bulletinReportModal.classList.remove('hidden');
    if (bulletinReportFeedback) bulletinReportFeedback.textContent = '';
}

function closeReportModal() {
    bulletinPendingReportPostId = '';
    if (!bulletinReportModal) return;
    bulletinReportModal.classList.add('hidden');
}

async function handleReport(postId, reason) {
    const selectedReason = String(reason || 'other');
    if (!postId) return { ok: false };
    if (db) {
        try {
            await Promise.all([
                db.collection('bulletin').doc(postId).update({
                    reportCount: firebase.firestore.FieldValue.increment(1)
                }),
                db.collection('bulletinReports').add({
                    postId,
                    reason: selectedReason,
                    timestamp: Date.now(),
                    clientId: getBulletinClientId()
                })
            ]);
            await loadPosts();
            return { ok: true };
        } catch (error) {
            console.error('Error report update:', error);
        }
    }

    const posts = JSON.parse(localStorage.getItem(BULLETIN_STORAGE_KEY) || '[]');
    const next = posts.map(post => {
        if (String(post.id || '') !== String(postId)) return post;
        return { ...post, reportCount: (Number(post.reportCount) || 0) + 1 };
    });
    localStorage.setItem(BULLETIN_STORAGE_KEY, JSON.stringify(next.slice(0, 100)));
    loadPostsFromLocalStorage();
    return { ok: true };
}

// Handle form submission
function initBulletinBoard() {
    if (bulletinInitialized) return;

    bulletinForm = document.getElementById('bulletin-form');
    bulletinNickname = document.getElementById('bulletin-nickname');
    bulletinMessage = document.getElementById('bulletin-message');
    bulletinPosts = document.getElementById('bulletin-posts');
    bulletinLoading = document.getElementById('bulletin-loading');
    bulletinSubmit = document.getElementById('bulletin-submit');
    bulletinFormStatus = document.getElementById('bulletin-form-status');
    bulletinSort = document.getElementById('bulletin-sort');
    bulletinTagMenu = document.getElementById('bulletin-tag-menu');
    bulletinTagRegion = document.getElementById('bulletin-tag-region');
    bulletinTagPrice = document.getElementById('bulletin-tag-price');
    bulletinTagDifficulty = document.getElementById('bulletin-tag-difficulty');
    bulletinReportModal = document.getElementById('bulletin-report-modal');
    bulletinReportReason = document.getElementById('bulletin-report-reason');
    bulletinReportFeedback = document.getElementById('bulletin-report-feedback');
    bulletinReportSubmit = document.getElementById('bulletin-report-submit');
    bulletinReportCancel = document.getElementById('bulletin-report-cancel');

    if (!bulletinForm || !bulletinPosts) return;
    bulletinInitialized = true;

    bulletinForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nickname = bulletinNickname.value.trim();
        const message = bulletinMessage.value.trim();
        const tags = getBulletinTagSelection();

        if (!nickname || !message) return;

        bulletinSubmit.disabled = true;

        const result = await savePost(nickname, message, tags);

        if (result.ok) {
            bulletinMessage.value = '';
            localStorage.setItem('bulletinNickname', nickname);
            await loadPosts();
            setBulletinFormStatus('', false);
        } else if (result.message) {
            setBulletinFormStatus(result.message, true);
        }

        bulletinSubmit.disabled = false;
    });

    if (bulletinSort) {
        bulletinSort.addEventListener('change', () => {
            renderBulletinPostList(bulletinPostCache);
        });
    }

    bulletinPosts.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.getAttribute('data-action');
        const postId = button.getAttribute('data-post-id');
        if (action === 'like') {
            handleLike(postId);
        } else if (action === 'report') {
            openReportModal(postId);
        }
    });

    if (bulletinReportCancel) {
        bulletinReportCancel.addEventListener('click', closeReportModal);
    }
    if (bulletinReportModal) {
        bulletinReportModal.addEventListener('click', (event) => {
            if (event.target === bulletinReportModal) closeReportModal();
        });
    }
    if (bulletinReportSubmit) {
        bulletinReportSubmit.addEventListener('click', async () => {
            const reason = bulletinReportReason ? bulletinReportReason.value : 'other';
            const result = await handleReport(bulletinPendingReportPostId, reason);
            if (bulletinReportFeedback) {
                bulletinReportFeedback.textContent = result.ok
                    ? getBulletinTranslation('reportQueued')
                    : getBulletinTranslation('reportFailed');
            }
            if (result.ok) {
                setTimeout(closeReportModal, 700);
            }
        });
    }

    // Restore saved nickname
    const savedNickname = localStorage.getItem('bulletinNickname');
    if (savedNickname && bulletinNickname) {
        bulletinNickname.value = savedNickname;
    }

    loadPosts();
    updateBulletinTranslations();
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
    if (bulletinFormStatus && !bulletinFormStatus.textContent) {
        setBulletinFormStatus('', false);
    }
    const tagMenuLabel = document.getElementById('bulletin-tag-menu-label');
    if (tagMenuLabel) tagMenuLabel.textContent = getBulletinTranslation('tagMenuLabel');
    const tagRegionLabel = document.getElementById('bulletin-tag-region-label');
    if (tagRegionLabel) tagRegionLabel.textContent = getBulletinTranslation('tagRegionLabel');
    const tagPriceLabel = document.getElementById('bulletin-tag-price-label');
    if (tagPriceLabel) tagPriceLabel.textContent = getBulletinTranslation('tagPriceLabel');
    const tagDifficultyLabel = document.getElementById('bulletin-tag-difficulty-label');
    if (tagDifficultyLabel) tagDifficultyLabel.textContent = getBulletinTranslation('tagDifficultyLabel');
    const sortLabel = document.getElementById('bulletin-sort-label');
    if (sortLabel) sortLabel.textContent = getBulletinTranslation('sortLabel');
    const reportTitle = document.getElementById('bulletin-report-title');
    if (reportTitle) reportTitle.textContent = getBulletinTranslation('reportTitle');
    const reportReasonLabel = document.getElementById('bulletin-report-reason-label');
    if (reportReasonLabel) reportReasonLabel.textContent = getBulletinTranslation('reportReasonLabel');
    if (bulletinReportCancel) bulletinReportCancel.textContent = getBulletinTranslation('reportCancel');
    if (bulletinReportSubmit) bulletinReportSubmit.textContent = getBulletinTranslation('reportSubmit');
    if (bulletinSort) {
        const latest = bulletinSort.querySelector('option[value="latest"]');
        const popular = bulletinSort.querySelector('option[value="popular"]');
        const comments = bulletinSort.querySelector('option[value="comments"]');
        if (latest) latest.textContent = getBulletinTranslation('sortLatest');
        if (popular) popular.textContent = getBulletinTranslation('sortPopular');
        if (comments) comments.textContent = getBulletinTranslation('sortComments');
    }

    const formTitle = document.getElementById('bulletin-form-title');
    if (formTitle) formTitle.textContent = getBulletinTranslation('formTitle');
    const nicknameLabel = document.getElementById('bulletin-nickname-label');
    if (nicknameLabel) nicknameLabel.textContent = getBulletinTranslation('nicknameLabel');
    const messageLabel = document.getElementById('bulletin-message-label');
    if (messageLabel) messageLabel.textContent = getBulletinTranslation('messageLabel');
    const recentTitle = document.getElementById('bulletin-recent-title');
    if (recentTitle) recentTitle.textContent = getBulletinTranslation('recentTitle');
    const realtime = document.getElementById('bulletin-realtime');
    if (realtime) realtime.textContent = getBulletinTranslation('realtime');

    // Refresh posts to update time format
    const emptyEl = bulletinPosts?.querySelector('.bulletin-empty');
    if (emptyEl) {
        emptyEl.textContent = getBulletinTranslation('empty');
    }
    renderBulletinPostList(bulletinPostCache);
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
        { key: 'tteokbokki', ko: '떡볶이', en: 'Tteokbokki', emoji: '🌶️' },
        { key: 'naengmyeon', ko: '냉면', en: 'Cold Noodles', emoji: '🍜' },
        { key: 'dakgalbi', ko: '닭갈비', en: 'Spicy Chicken', emoji: '🐔' },
        { key: 'budaeJjigae', ko: '부대찌개', en: 'Army Stew', emoji: '🍲' },
        { key: 'gamjatang', ko: '감자탕', en: 'Pork Bone Soup', emoji: '🥘' },
        { key: 'seolleongtang', ko: '설렁탕', en: 'Ox Bone Soup', emoji: '🍲' },
        { key: 'gopchang', ko: '곱창', en: 'Grilled Intestines', emoji: '🔥' },
        { key: 'haemulPajeon', ko: '해물파전', en: 'Seafood Pancake', emoji: '🥞' },
        { key: 'dwaejiGukbap', ko: '돼지국밥', en: 'Pork Rice Soup', emoji: '🍲' },
        { key: 'chicken', ko: '치킨', en: 'Fried Chicken', emoji: '🍗' },
        { key: 'porkBelly', ko: '삼겹살', en: 'Grilled Pork Belly', emoji: '🥓' },
        { key: 'pigFeet', ko: '족발', en: 'Braised Pig Feet', emoji: '🦶' },
        { key: 'boiledPork', ko: '보쌈', en: 'Boiled Pork', emoji: '🥬' },
        { key: 'sundae', ko: '순대', en: 'Korean Blood Sausage', emoji: '🌭' },
        { key: 'kimbap', ko: '김밥', en: 'Kimbap', emoji: '🍙' },
        { key: 'doenjangJjigae', ko: '된장찌개', en: 'Soybean Paste Stew', emoji: '🥘' },
        { key: 'yukgaejang', ko: '육개장', en: 'Spicy Beef Soup', emoji: '🍲' },
        { key: 'jjimdak', ko: '찜닭', en: 'Braised Chicken', emoji: '🐔' },
        { key: 'janchiGuksu', ko: '잔치국수', en: 'Banquet Noodles', emoji: '🍜' }
    ],
    chinese: [
        { key: 'jjajangmyeon', ko: '짜장면', en: 'Jjajangmyeon', emoji: '🍝' },
        { key: 'jjampong', ko: '짬뽕', en: 'Spicy Seafood Noodle', emoji: '🍜' },
        { key: 'sweetAndSourPork', ko: '탕수육', en: 'Sweet & Sour Pork', emoji: '🐷' },
        { key: 'malatang', ko: '마라탕', en: 'Malatang', emoji: '🌶️' },
        { key: 'mapoTofu', ko: '마파두부', en: 'Mapo Tofu', emoji: '🫕' },
        { key: 'friedRice', ko: '볶음밥', en: 'Fried Rice', emoji: '🍛' },
        { key: 'dumplings', ko: '만두', en: 'Dumplings', emoji: '🥟' },
        { key: 'kungPaoChicken', ko: '궁보계정', en: 'Kung Pao Chicken', emoji: '🍗' },
        { key: 'pekingDuck', ko: '북경오리', en: 'Peking Duck', emoji: '🦆' },
        { key: 'dimSum', ko: '딤섬', en: 'Dim Sum', emoji: '🥟' },
        { key: 'hotPot', ko: '훠궈', en: 'Hot Pot', emoji: '🫕' },
        { key: 'danDanNoodles', ko: '단단면', en: 'Dan Dan Noodles', emoji: '🍜' },
        { key: 'charSiuBao', ko: '차슈빵', en: 'Char Siu Bao', emoji: '🥟' },
        { key: 'springRoll', ko: '춘권', en: 'Spring Roll', emoji: '🥡' },
        { key: 'xiaolongbao', ko: '샤오롱바오', en: 'Soup Dumplings', emoji: '🥟' },
        { key: 'yangKkochi', ko: '양꼬치', en: 'Lamb Skewers', emoji: '🍢' },
        { key: 'congYouBing', ko: '총유빙', en: 'Scallion Pancake', emoji: '🥞' },
        { key: 'chowMein', ko: '차오미엔', en: 'Chow Mein', emoji: '🍜' },
        { key: 'wonton', ko: '완탕', en: 'Wonton', emoji: '🥟' },
        { key: 'jjajangBap', ko: '짜장밥', en: 'Black Bean Rice', emoji: '🍛' }
    ],
    japanese: [
        { key: 'sushi', ko: '초밥', en: 'Sushi', emoji: '🍣' },
        { key: 'ramen', ko: '라멘', en: 'Ramen', emoji: '🍜' },
        { key: 'tonkatsu', ko: '돈카츠', en: 'Tonkatsu', emoji: '🍗' },
        { key: 'udon', ko: '우동', en: 'Udon', emoji: '🍲' },
        { key: 'tempura', ko: '텐푸라', en: 'Tempura', emoji: '🍤' },
        { key: 'curry', ko: '카레', en: 'Japanese Curry', emoji: '🍛' },
        { key: 'soba', ko: '소바', en: 'Soba', emoji: '🥢' },
        { key: 'katsudon', ko: '카츠동', en: 'Katsudon', emoji: '🍱' },
        { key: 'okonomiyaki', ko: '오코노미야키', en: 'Okonomiyaki', emoji: '🥞' },
        { key: 'gyudon', ko: '규동', en: 'Gyudon', emoji: '🍚' },
        { key: 'yakitori', ko: '야키토리', en: 'Yakitori', emoji: '🍢' },
        { key: 'takoyaki', ko: '타코야키', en: 'Takoyaki', emoji: '🐙' },
        { key: 'onigiri', ko: '오니기리', en: 'Onigiri', emoji: '🍙' },
        { key: 'nabeyaki', ko: '나베', en: 'Nabeyaki', emoji: '🍲' },
        { key: 'karaage', ko: '가라아게', en: 'Karaage', emoji: '🍗' },
        { key: 'oyakodon', ko: '오야코동', en: 'Oyakodon', emoji: '🍚' },
        { key: 'unagi', ko: '우나기', en: 'Grilled Eel', emoji: '🐟' },
        { key: 'chirashi', ko: '치라시', en: 'Chirashi', emoji: '🍣' },
        { key: 'misoSoup', ko: '미소시루', en: 'Miso Soup', emoji: '🥣' },
        { key: 'hirekatsu', ko: '히레카츠', en: 'Hirekatsu', emoji: '🍖' },
        { key: 'gyukatsu', ko: '규카츠', en: 'Gyukatsu', emoji: '🥩' }
    ],
    western: [
        { key: 'steak', ko: '스테이크', en: 'Steak', emoji: '🥩' },
        { key: 'pasta', ko: '파스타', en: 'Pasta', emoji: '🍝' },
        { key: 'pizza', ko: '피자', en: 'Pizza', emoji: '🍕' },
        { key: 'hamburger', ko: '햄버거', en: 'Hamburger', emoji: '🍔' },
        { key: 'salad', ko: '샐러드', en: 'Salad', emoji: '🥗' },
        { key: 'risotto', ko: '리조또', en: 'Risotto', emoji: '🍚' },
        { key: 'sandwich', ko: '샌드위치', en: 'Sandwich', emoji: '🥪' },
        { key: 'fishAndChips', ko: '피쉬앤칩스', en: 'Fish & Chips', emoji: '🐟' },
        { key: 'lasagna', ko: '라자냐', en: 'Lasagna', emoji: '🍝' },
        { key: 'carbonara', ko: '까르보나라', en: 'Carbonara', emoji: '🍝' },
        { key: 'gnocchi', ko: '뇨끼', en: 'Gnocchi', emoji: '🥔' },
        { key: 'lobster', ko: '랍스터', en: 'Lobster', emoji: '🦞' },
        { key: 'bbqRibs', ko: 'BBQ 립', en: 'BBQ Ribs', emoji: '🍖' },
        { key: 'grilledSalmon', ko: '연어 스테이크', en: 'Grilled Salmon', emoji: '🐟' },
        { key: 'chickenWings', ko: '치킨윙', en: 'Chicken Wings', emoji: '🍗' },
        { key: 'hotdog', ko: '핫도그', en: 'Hot Dog', emoji: '🌭' },
        { key: 'caesarSalad', ko: '시저샐러드', en: 'Caesar Salad', emoji: '🥗' },
        { key: 'omelet', ko: '오믈렛', en: 'Omelet', emoji: '🥚' },
        { key: 'meatball', ko: '미트볼', en: 'Meatball', emoji: '🧆' },
        { key: 'gratin', ko: '그라탕', en: 'Gratin', emoji: '🧀' },
        { key: 'clubSandwich', ko: '클럽샌드위치', en: 'Club Sandwich', emoji: '🥪' },
        { key: 'bruschetta', ko: '브루스케타', en: 'Bruschetta', emoji: '🍞' }
    ],
    southeastAsian: [
        { key: 'pho', ko: '쌀국수', en: 'Pho', emoji: '🍜' },
        { key: 'padThai', ko: '팟타이', en: 'Pad Thai', emoji: '🍜' },
        { key: 'greenCurry', ko: '그린커리', en: 'Green Curry', emoji: '🍛' },
        { key: 'satay', ko: '사테', en: 'Satay', emoji: '🍢' },
        { key: 'banhMi', ko: '반미', en: 'Banh Mi', emoji: '🥖' },
        { key: 'laksa', ko: '락사', en: 'Laksa', emoji: '🍜' },
        { key: 'nasiGoreng', ko: '나시고렝', en: 'Nasi Goreng', emoji: '🍛' },
        { key: 'somTam', ko: '솜탐', en: 'Som Tam', emoji: '🥗' },
        { key: 'rendang', ko: '렌당', en: 'Rendang', emoji: '🍖' },
        { key: 'tomYumGoong', ko: '똠양꿍', en: 'Tom Yum Goong', emoji: '🦐' },
        { key: 'massamanCurry', ko: '마싸만커리', en: 'Massaman Curry', emoji: '🍛' },
        { key: 'bunCha', ko: '분짜', en: 'Bun Cha', emoji: '🍖' },
        { key: 'miGoreng', ko: '미고렝', en: 'Mi Goreng', emoji: '🍜' },
        { key: 'adobo', ko: '아도보', en: 'Chicken Adobo', emoji: '🍗' },
        { key: 'sisig', ko: '시식', en: 'Sisig', emoji: '🔥' }
    ],
    mexican: [
        { key: 'tacos', ko: '타코', en: 'Tacos', emoji: '🌮' },
        { key: 'burrito', ko: '부리또', en: 'Burrito', emoji: '🌯' },
        { key: 'quesadilla', ko: '케사디야', en: 'Quesadilla', emoji: '🧀' },
        { key: 'enchilada', ko: '엔칠라다', en: 'Enchilada', emoji: '🌶️' },
        { key: 'nachos', ko: '나초', en: 'Nachos', emoji: '🧀' },
        { key: 'churros', ko: '츄러스', en: 'Churros', emoji: '🍩' },
        { key: 'ceviche', ko: '세비체', en: 'Ceviche', emoji: '🐟' },
        { key: 'empanada', ko: '엠파나다', en: 'Empanada', emoji: '🥟' },
        { key: 'tamale', ko: '타말레', en: 'Tamale', emoji: '🫔' },
        { key: 'pozole', ko: '포졸레', en: 'Pozole', emoji: '🍲' },
        { key: 'arepa', ko: '아레파', en: 'Arepa', emoji: '🫓' },
        { key: 'feijoada', ko: '페이조아다', en: 'Feijoada', emoji: '🫘' }
    ],
    indian: [
        { key: 'tikkaMasala', ko: '티카마살라', en: 'Tikka Masala', emoji: '🍛' },
        { key: 'biryani', ko: '비리야니', en: 'Biryani', emoji: '🍚' },
        { key: 'naan', ko: '난', en: 'Naan', emoji: '🫓' },
        { key: 'samosa', ko: '사모사', en: 'Samosa', emoji: '🥟' },
        { key: 'butterChicken', ko: '버터치킨', en: 'Butter Chicken', emoji: '🍗' },
        { key: 'palakPaneer', ko: '팔락파니르', en: 'Palak Paneer', emoji: '🥬' },
        { key: 'tandooriChicken', ko: '탄두리치킨', en: 'Tandoori Chicken', emoji: '🍗' },
        { key: 'dalMakhani', ko: '달마카니', en: 'Dal Makhani', emoji: '🥘' },
        { key: 'roganJosh', ko: '로간조시', en: 'Rogan Josh', emoji: '🍖' },
        { key: 'vindaloo', ko: '빈달루', en: 'Vindaloo', emoji: '🌶️' },
        { key: 'dosa', ko: '도사', en: 'Dosa', emoji: '🥞' },
        { key: 'choleBhature', ko: '초레바투레', en: 'Chole Bhature', emoji: '🫓' }
    ],
    middleEastern: [
        { key: 'kebab', ko: '케밥', en: 'Kebab', emoji: '🥙' },
        { key: 'falafel', ko: '팔라펠', en: 'Falafel', emoji: '🧆' },
        { key: 'shawarma', ko: '샤와르마', en: 'Shawarma', emoji: '🥙' },
        { key: 'hummus', ko: '후무스', en: 'Hummus', emoji: '🫘' },
        { key: 'kofta', ko: '코프타', en: 'Kofta', emoji: '🍖' },
        { key: 'tabouleh', ko: '타불레', en: 'Tabouleh', emoji: '🥗' },
        { key: 'babaGanoush', ko: '바바가누쉬', en: 'Baba Ganoush', emoji: '🍆' },
        { key: 'dolma', ko: '돌마', en: 'Dolma', emoji: '🥬' },
        { key: 'mansaf', ko: '만사프', en: 'Mansaf', emoji: '🍚' }
    ],
    african: [
        { key: 'jollofRice', ko: '졸로프라이스', en: 'Jollof Rice', emoji: '🍚' },
        { key: 'injera', ko: '인제라', en: 'Injera', emoji: '🫓' },
        { key: 'doroWot', ko: '도로왓', en: 'Doro Wot', emoji: '🍗' },
        { key: 'tagine', ko: '타진', en: 'Tagine', emoji: '🥘' },
        { key: 'couscous', ko: '쿠스쿠스', en: 'Couscous', emoji: '🍚' },
        { key: 'suya', ko: '수야', en: 'Suya', emoji: '🍢' },
        { key: 'bobotie', ko: '보보티', en: 'Bobotie', emoji: '🥧' },
        { key: 'fufu', ko: '푸푸', en: 'Fufu', emoji: '🍚' }
    ],
    european: [
        { key: 'moussaka', ko: '무사카', en: 'Moussaka', emoji: '🍆' },
        { key: 'gyros', ko: '기로스', en: 'Gyros', emoji: '🥙' },
        { key: 'ratatouille', ko: '라따뚜이', en: 'Ratatouille', emoji: '🍆' },
        { key: 'croquemonsieur', ko: '크로크무슈', en: 'Croque Monsieur', emoji: '🥪' },
        { key: 'schnitzel', ko: '슈니첼', en: 'Schnitzel', emoji: '🍖' },
        { key: 'bratwurst', ko: '브라트부르스트', en: 'Bratwurst', emoji: '🌭' },
        { key: 'pierogi', ko: '피에로기', en: 'Pierogi', emoji: '🥟' },
        { key: 'borscht', ko: '보르시치', en: 'Borscht', emoji: '🍲' },
        { key: 'gazpacho', ko: '가스파초', en: 'Gazpacho', emoji: '🥣' },
        { key: 'poutine', ko: '푸틴', en: 'Poutine', emoji: '🍟' }
    ],
    american: [
        { key: 'macAndCheese', ko: '맥앤치즈', en: 'Mac & Cheese', emoji: '🧀' },
        { key: 'clamChowder', ko: '클램차우더', en: 'Clam Chowder', emoji: '🥣' },
        { key: 'jambalaya', ko: '잠발라야', en: 'Jambalaya', emoji: '🍛' },
        { key: 'gumbo', ko: '검보', en: 'Gumbo', emoji: '🍲' },
        { key: 'pulledPork', ko: '풀드포크', en: 'Pulled Pork', emoji: '🍖' },
        { key: 'cheesesteak', ko: '치즈스테이크', en: 'Philly Cheesesteak', emoji: '🥪' },
        { key: 'poBoy', ko: '포보이', en: "Po' Boy", emoji: '🥖' },
        { key: 'pancakes', ko: '팬케이크', en: 'Pancakes', emoji: '🥞' }
    ]
};

function initMenuCategoryMap() {
    menuCategoryByKey = new Map();
    slotMenuByKey = new Map();
    Object.entries(slotMenuEmojis).forEach(([category, menus]) => {
        menus.forEach((menu) => {
            if (menu?.key) {
                menuCategoryByKey.set(menu.key, category);
                slotMenuByKey.set(menu.key, menu);
            }
        });
    });

    const overrides = {
        sushiRoll: 'japanese',
        paella: 'western',
        nachos: 'mexican'
    };
    Object.entries(overrides).forEach(([key, category]) => {
        menuCategoryByKey.set(key, category);
    });
}

initMenuCategoryMap();

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
let lastWinningMenu = null;
let lastSlotSpinAt = 0;
const SLOT_SPIN_MIN_INTERVAL_MS = 350;
const SLOT_SPIN_ARM_TIMEOUT_MS = 1500;
let isSlotSpinArmed = false;
let slotSpinArmTimeoutId = null;
let slotSpinToken = 0;
let lastSlotPreviewSignature = '';

function resetSlotReelState(reel) {
    if (!reel) return;
    reel.classList.remove('spinning', 'stopping');
    reel.style.transition = 'none';
    reel.style.animation = 'none';
    reel.style.transform = 'translateY(0)';
}

function isSlotTabVisible() {
    const slotTab = document.getElementById('tab-slot');
    return !!slotTab && !slotTab.classList.contains('hidden');
}

function clearSlotSpinArm() {
    isSlotSpinArmed = false;
    if (slotSpinArmTimeoutId) {
        clearTimeout(slotSpinArmTimeoutId);
        slotSpinArmTimeoutId = null;
    }
}

function armSlotSpin() {
    isSlotSpinArmed = true;
    if (slotSpinArmTimeoutId) clearTimeout(slotSpinArmTimeoutId);
    slotSpinArmTimeoutId = setTimeout(() => {
        clearSlotSpinArm();
    }, SLOT_SPIN_ARM_TIMEOUT_MS);
}

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
            southeastAsian: 'SE Asian',
            mexican: 'Mexican',
            indian: 'Indian',
            middleEastern: 'Middle East',
            african: 'African',
            european: 'European',
            american: 'American',
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
            southeastAsian: '동남아',
            mexican: '멕시칸',
            indian: '인도',
            middleEastern: '중동',
            african: '아프리카',
            european: '유럽',
            american: '아메리칸',
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
            southeastAsian: '東南アジア',
            mexican: 'メキシカン',
            indian: 'インド',
            middleEastern: '中東',
            african: 'アフリカ',
            european: 'ヨーロッパ',
            american: 'アメリカン',
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
            southeastAsian: '东南亚',
            mexican: '墨西哥',
            indian: '印度',
            middleEastern: '中东',
            african: '非洲',
            european: '欧洲',
            american: '美式',
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
            southeastAsian: 'Sudeste Asiático',
            mexican: 'Mexicana',
            indian: 'India',
            middleEastern: 'Medio Oriente',
            african: 'Africana',
            european: 'Europea',
            american: 'Americana',
            start: 'START',
            result: 'El menú de hoy es',
            jackpot: '¡JACKPOT!'
        },
        'French': {
            title: 'Machine à Sous Menu',
            desc: 'Tirez le levier pour décider votre repas !',
            all: 'Tout',
            korean: 'Coréen',
            chinese: 'Chinois',
            japanese: 'Japonais',
            western: 'Occidental',
            southeastAsian: 'Asie du Sud-Est',
            mexican: 'Mexicain',
            indian: 'Indien',
            middleEastern: 'Moyen-Orient',
            african: 'Africain',
            european: 'Européen',
            american: 'Américain',
            start: 'START',
            result: "Le menu d'aujourd'hui est",
            jackpot: 'JACKPOT !'
        },
        'German': {
            title: 'Menü-Spielautomat',
            desc: 'Ziehe den Hebel um dein Essen zu bestimmen!',
            all: 'Alle',
            korean: 'Koreanisch',
            chinese: 'Chinesisch',
            japanese: 'Japanisch',
            western: 'Westlich',
            southeastAsian: 'Südostasien',
            mexican: 'Mexikanisch',
            indian: 'Indisch',
            middleEastern: 'Nahost',
            african: 'Afrikanisch',
            european: 'Europäisch',
            american: 'Amerikanisch',
            start: 'START',
            result: 'Das heutige Menü ist',
            jackpot: 'JACKPOT!'
        },
        'Portuguese': {
            title: 'Caça-Níqueis de Menu',
            desc: 'Puxe a alavanca para decidir sua refeição!',
            all: 'Todos',
            korean: 'Coreana',
            chinese: 'Chinesa',
            japanese: 'Japonesa',
            western: 'Ocidental',
            southeastAsian: 'Sudeste Asiático',
            mexican: 'Mexicana',
            indian: 'Indiana',
            middleEastern: 'Oriente Médio',
            african: 'Africana',
            european: 'Europeia',
            american: 'Americana',
            start: 'START',
            result: 'O menu de hoje é',
            jackpot: 'JACKPOT!'
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
    const profileScopedKeys = getProfileAwareMenuPool(discoverFilteredMenuKeys);
    const activeKeys = new Set(profileScopedKeys);
    const allMenus = Object.values(slotMenuEmojis).flat();
    const scopedMenus = currentCategory === 'all'
        ? allMenus
        : [...(slotMenuEmojis[currentCategory] || [])];
    const MIN_SLOT_POOL_SIZE = 3;

    const narrowed = scopedMenus.filter((menu) => activeKeys.has(menu.key));
    if (narrowed.length >= MIN_SLOT_POOL_SIZE) {
        currentSlotMenus = narrowed;
        renderSlotReels();
        return;
    }

    // Fallback order: scoped -> all filtered -> all menus.
    const allFilteredMenus = allMenus.filter((menu) => activeKeys.has(menu.key));
    if (allFilteredMenus.length >= MIN_SLOT_POOL_SIZE) {
        currentSlotMenus = allFilteredMenus;
        renderSlotReels();
        return;
    }

    if (scopedMenus.length >= MIN_SLOT_POOL_SIZE) {
        currentSlotMenus = scopedMenus;
        renderSlotReels();
        return;
    }

    if (currentCategory === 'all') {
        currentSlotMenus = allMenus;
    } else {
        currentSlotMenus = [...(slotMenuEmojis[currentCategory] || [])];
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

function pickRandomMenu(excludeMenu) {
    if (currentSlotMenus.length === 0) return null;
    if (currentSlotMenus.length === 1) return currentSlotMenus[0];
    let candidate = null;
    do {
        candidate = currentSlotMenus[Math.floor(Math.random() * currentSlotMenus.length)];
    } while (excludeMenu && candidate.key === excludeMenu.key);
    return candidate;
}

// Render slot reel items
function renderSlotReels() {
    if (isSlotSpinning) return;
    if (currentSlotMenus.length === 0) return;
    const previewSignature = `${currentCategory}|${currentSlotMenus.map((menu) => menu.key).join(',')}`;
    if (!isSlotSpinning && previewSignature === lastSlotPreviewSignature) {
        refreshSlotReelLabels();
        return;
    }
    lastSlotPreviewSignature = previewSignature;
    [slotReel1, slotReel2, slotReel3].forEach(reel => {
        if (!reel) return;
        reel.innerHTML = '';
        resetSlotReelState(reel);
    });
    [slotReel1, slotReel2, slotReel3].forEach((reel, reelIndex) => {
        if (!reel) return;
        // Keep preview deterministic so repeated rerenders never look like auto-spin.
        for (let i = 0; i < 3; i++) {
            const menu = currentSlotMenus[(reelIndex + i) % currentSlotMenus.length];
            const item = document.createElement('div');
            item.className = 'slot-item';
            item.dataset.menuKey = menu.key;
            item.innerHTML = `<span class="slot-emoji">${menu.emoji}</span><span class="slot-name">${getSlotMenuName(menu)}</span>`;
            item.dataset.index = i;
            reel.appendChild(item);
        }
    });
}

function refreshSlotReelLabels() {
    [slotReel1, slotReel2, slotReel3].forEach((reel) => {
        if (!reel) return;
        const items = reel.querySelectorAll('.slot-item[data-menu-key]');
        items.forEach((item) => {
            const menuKey = item.dataset.menuKey;
            if (!menuKey) return;
            const menu = slotMenuByKey.get(menuKey);
            if (!menu) return;
            item.innerHTML = `<span class="slot-emoji">${menu.emoji}</span><span class="slot-name">${getSlotMenuName(menu)}</span>`;
        });
    });
}

function setSlotReelMenus(reel, menus) {
    if (!reel) return;
    reel.innerHTML = '';
    (menus || []).forEach((menu, index) => {
        if (!menu) return;
        const item = document.createElement('div');
        item.className = 'slot-item';
        item.dataset.menuKey = menu.key;
        item.dataset.index = String(index);
        item.innerHTML = `<span class="slot-emoji">${menu.emoji}</span><span class="slot-name">${getSlotMenuName(menu)}</span>`;
        reel.appendChild(item);
    });
}

// Spin slot machine
function spinSlotMachine(triggerEvent) {
    if (isSlotSpinning || currentSlotMenus.length === 0) return;
    if (!isSlotTabVisible()) return;
    if (triggerEvent && triggerEvent.isTrusted === false) return;
    const now = Date.now();
    if (now - lastSlotSpinAt < SLOT_SPIN_MIN_INTERVAL_MS) return;
    lastSlotSpinAt = now;
    const currentSpinToken = ++slotSpinToken;
    emitPreparedAnalyticsEvent('slot_spin_started', {
        category: currentCategory,
        poolSize: currentSlotMenus.length
    });

    isSlotSpinning = true;
    slotLeverBtn.disabled = true;
    if (slotResult) slotResult.classList.remove('visible');

    const reels = [slotReel1, slotReel2, slotReel3];

    // Pick ONE winning food - all 3 reels land on the same item
    const winningIndex = Math.floor(Math.random() * currentSlotMenus.length);
    const winningMenu = currentSlotMenus[winningIndex];
    const spinDurations = [2200, 2900, 3600];
    const totalDuration = spinDurations[spinDurations.length - 1] + 180;

    reels.forEach((reel, reelIndex) => {
        if (!reel) return;

        resetSlotReelState(reel);
        const stripLoopCount = 18 + (reelIndex * 4);
        const stripMenus = [];
        for (let i = 0; i < stripLoopCount; i += 1) {
            stripMenus.push(currentSlotMenus[(i + reelIndex) % currentSlotMenus.length]);
        }

        const prevMenu = pickRandomMenu(winningMenu);
        let nextMenu = pickRandomMenu(winningMenu);
        if (nextMenu && prevMenu && nextMenu.key === prevMenu.key) {
            nextMenu = pickRandomMenu(prevMenu);
        }
        const finalMenus = [prevMenu, winningMenu, nextMenu];
        const allMenus = stripMenus.concat(finalMenus);
        setSlotReelMenus(reel, allMenus);

        const sampleItem = reel.querySelector('.slot-item');
        const itemHeight = sampleItem ? sampleItem.getBoundingClientRect().height : 60;
        const safeItemHeight = itemHeight > 0 ? itemHeight : 60;
        const spinDistance = Math.max(0, (allMenus.length - 3) * safeItemHeight);
        reel.style.transition = 'none';
        reel.style.transform = 'translateY(0)';
        reel.offsetHeight;

        const durationMs = spinDurations[reelIndex] || spinDurations[spinDurations.length - 1];
        const startSpin = () => {
            if (!isSlotSpinning || currentSpinToken !== slotSpinToken) return;
            reel.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 0.84, 0.24, 1)`;
            reel.style.transform = `translateY(-${spinDistance}px)`;
        };
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => requestAnimationFrame(startSpin));
        } else {
            setTimeout(startSpin, 16);
        }

        setTimeout(() => {
            if (!isSlotSpinning || currentSpinToken !== slotSpinToken) return;
            setSlotReelMenus(reel, finalMenus);
            resetSlotReelState(reel);
        }, durationMs + 40);
    });

    // Show result after all reels stop
    setTimeout(async () => {
        if (!isSlotSpinning || currentSpinToken !== slotSpinToken) return;
        isSlotSpinning = false;
        slotLeverBtn.disabled = false;
        reels.forEach((reel) => {
            resetSlotReelState(reel);
            const items = reel ? reel.querySelectorAll('.slot-item[data-index]') : [];
            items.forEach((item, index) => {
                item.dataset.index = String(index);
            });
        });

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
            const searchTerm = imageSearchOverrides[winningMenu.key] || winningMenu.en;
            const imageUrl = await fetchPexelsImage(searchTerm, winningMenu.en);
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

    const categories = ['all', 'korean', 'chinese', 'japanese', 'western', 'southeastAsian', 'mexican', 'indian', 'middleEastern', 'african', 'european', 'american'];
    categoryBtns.forEach((btn, index) => {
        if (categories[index]) {
            btn.textContent = getSlotTranslation(categories[index]);
        }
    });

    if (!isSlotSpinning) {
        refreshSlotReelLabels();
    }
}

// Alias for backward compatibility with applyTranslations
function updateRouletteTranslations() {
    updateSlotTranslations();
    updateSituationTranslations();
    updateSeasonalTranslations();
    updateHomeCookingTranslations();
    updateBreakfastTranslations();
    updateCalorieTranslations();
    updateMenuInfoTranslations();
    updateFaqTranslations();
    updateCategoriesGuideTranslations();
    updateFooterTranslations();
    updateSidebarTranslations();
    updateGameTabTranslations();
    updateShareTranslations();
}

// Category filter click handler
if (categoryFilter) {
    categoryFilter.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button || isSlotSpinning) return;
        const nextCategory = button.dataset.category || 'all';
        if (nextCategory === discoverFilterState.category) return;
        discoverFilterState.category = nextCategory;
        applyDiscoverFilters({ persist: true, syncInput: true, syncSlot: true, rerenderSlot: true });
        if (slotResultName) slotResultName.textContent = '';
    });
}

// Slot lever click handler
if (slotLeverBtn) {
    slotLeverBtn.addEventListener('pointerdown', armSlotSpin);
    slotLeverBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            armSlotSpin();
        }
    });
    slotLeverBtn.addEventListener('click', (event) => {
        if (event.isTrusted && !isSlotSpinArmed) return;
        clearSlotSpinArm();
        spinSlotMachine(event);
    });
}

// Sidebar panel navigation
const sideNavButtons = document.querySelectorAll('.side-nav-btn');
const panels = document.querySelectorAll('.panel');

function setActivePanel(panelId, pushState = true) {
    const hasPanel = Array.from(panels).some(panel => panel.id === `panel-${panelId}`);
    const targetId = hasPanel ? panelId : 'bulletin';

    sideNavButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.panel === targetId);
    });
    panels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `panel-${targetId}`);
    });

    if (pushState) {
        history.replaceState(null, '', `#${targetId}`);
    }
}

if (sideNavButtons.length && panels.length) {
    sideNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActivePanel(btn.dataset.panel);
            localStorage.setItem('lastPanel', btn.dataset.panel);
        });
    });

    const storedPanel = localStorage.getItem('lastPanel');
    const initialPanel = window.location.hash?.replace('#', '') || storedPanel || 'bulletin';
    setActivePanel(initialPanel, true);

    window.addEventListener('hashchange', () => {
        const latestStoredPanel = localStorage.getItem('lastPanel');
        const hashPanel = window.location.hash?.replace('#', '') || latestStoredPanel || 'bulletin';
        setActivePanel(hashPanel, false);
    });
}

// ============ SHARE BUTTONS ============

function getShareTranslation(key) {
    const shareTranslations = {
        'English': { shareTitle: 'Share your result!', shareText: "Today's menu is", copied: 'Link copied!', shareNative: 'Share' },
        'Korean': { shareTitle: '결과를 공유하세요!', shareText: '오늘의 메뉴는', copied: '링크가 복사되었습니다!', shareNative: '공유하기' },
        'Japanese': { shareTitle: '結果をシェアしよう！', shareText: '今日のメニューは', copied: 'リンクをコピーしました！', shareNative: 'シェア' },
        'Mandarin Chinese': { shareTitle: '分享你的结果！', shareText: '今天的菜单是', copied: '链接已复制！', shareNative: '分享' },
        'Spanish': { shareTitle: '\u00A1Comparte tu resultado!', shareText: 'El men\u00FA de hoy es', copied: '\u00A1Enlace copiado!', shareNative: 'Compartir' },
        'French': { shareTitle: 'Partagez votre r\u00E9sultat !', shareText: 'Le menu du jour est', copied: 'Lien copi\u00E9 !', shareNative: 'Partager' },
        'German': { shareTitle: 'Teile dein Ergebnis!', shareText: 'Das heutige Men\u00FC ist', copied: 'Link kopiert!', shareNative: 'Teilen' },
        'Portuguese': { shareTitle: 'Compartilhe seu resultado!', shareText: 'O menu de hoje \u00E9', copied: 'Link copiado!', shareNative: 'Compartilhar' },
        'Italian': { shareTitle: 'Condividi il tuo risultato!', shareText: 'Il men\u00F9 di oggi \u00E8', copied: 'Link copiato!', shareNative: 'Condividi' },
        'Russian': { shareTitle: '\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u0435\u0441\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C!', shareText: '\u0421\u0435\u0433\u043E\u0434\u043D\u044F\u0448\u043D\u0435\u0435 \u043C\u0435\u043D\u044E', copied: '\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430!', shareNative: '\u041F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F' },
        'Arabic': { shareTitle: '\u0634\u0627\u0631\u0643 \u0646\u062A\u064A\u062C\u062A\u0643!', shareText: '\u0645\u0646\u064A\u0648 \u0627\u0644\u064A\u0648\u0645 \u0647\u0648', copied: '\u062A\u0645 \u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637!', shareNative: '\u0645\u0634\u0627\u0631\u0643\u0629' },
        'Thai': { shareTitle: '\u0E41\u0E0A\u0E23\u0E4C\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13!', shareText: '\u0E40\u0E21\u0E19\u0E39\u0E27\u0E31\u0E19\u0E19\u0E35\u0E49\u0E04\u0E37\u0E2D', copied: '\u0E04\u0E31\u0E14\u0E25\u0E2D\u0E01\u0E25\u0E34\u0E07\u0E01\u0E4C\u0E41\u0E25\u0E49\u0E27!', shareNative: '\u0E41\u0E0A\u0E23\u0E4C' },
        'Vietnamese': { shareTitle: 'Chia s\u1EBB k\u1EBFt qu\u1EA3 c\u1EE7a b\u1EA1n!', shareText: 'Th\u1EF1c \u0111\u01A1n h\u00F4m nay l\u00E0', copied: '\u0110\u00E3 sao ch\u00E9p li\u00EAn k\u1EBFt!', shareNative: 'Chia s\u1EBB' },
        'Indonesian': { shareTitle: 'Bagikan hasilmu!', shareText: 'Menu hari ini adalah', copied: 'Tautan disalin!', shareNative: 'Bagikan' },
        'Hindi': { shareTitle: '\u0905\u092A\u0928\u093E \u092A\u0930\u093F\u0923\u093E\u092E \u0938\u093E\u091D\u093E \u0915\u0930\u0947\u0902!', shareText: '\u0906\u091C \u0915\u093E \u092E\u0947\u0928\u0942 \u0939\u0948', copied: '\u0932\u093F\u0902\u0915 \u0915\u0949\u092A\u0940 \u0939\u094B \u0917\u092F\u093E!', shareNative: '\u0936\u0947\u092F\u0930' },
        'Dutch': { shareTitle: 'Deel je resultaat!', shareText: 'Het menu van vandaag is', copied: 'Link gekopieerd!', shareNative: 'Delen' },
        'Polish': { shareTitle: 'Podziel si\u0119 wynikiem!', shareText: 'Dzisiejsze menu to', copied: 'Link skopiowany!', shareNative: 'Udost\u0119pnij' },
        'Turkish': { shareTitle: 'Sonucunu payla\u015F!', shareText: 'Bug\u00FCn\u00FCn men\u00FCs\u00FC', copied: 'Ba\u011Flant\u0131 kopyaland\u0131!', shareNative: 'Payla\u015F' }
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
    emitPreparedAnalyticsEvent('share_click', { channel: 'twitter', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'twitter' });
    const { text, url } = buildShareMessage();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
}

function shareToFacebook() {
    emitPreparedAnalyticsEvent('share_click', { channel: 'facebook', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'facebook' });
    const { text, url } = buildShareMessage();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
}

function shareToWhatsApp() {
    emitPreparedAnalyticsEvent('share_click', { channel: 'whatsapp', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'whatsapp' });
    const { fullText } = buildShareMessage();
    window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
}

function shareToTelegram() {
    emitPreparedAnalyticsEvent('share_click', { channel: 'telegram', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'telegram' });
    const { text, url } = buildShareMessage();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
}

function shareToLine() {
    emitPreparedAnalyticsEvent('share_click', { channel: 'line', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'line' });
    const { fullText } = buildShareMessage();
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullText)}`, '_blank', 'width=550,height=420');
}

function shareToKakao() {
    emitPreparedAnalyticsEvent('share_click', { channel: 'kakao', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'kakao' });
    const { text, url } = buildShareMessage();
    window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=550,height=420');
}

async function copyShareLink() {
    emitPreparedAnalyticsEvent('share_click', { channel: 'copy', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'copy' });
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
    emitPreparedAnalyticsEvent('share_click', { channel: 'native', source: 'slot' });
    emitPreparedAnalyticsEvent('slot_result_shared', { channel: 'native' });
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
        solo: { title: 'Solo Dining', menus: ['Ramen', 'Kimbap', 'Rice Bowl', 'Noodles', 'Udon', 'Bibimbap', 'Curry Rice', 'Onigiri'] },
        family: { title: 'Family Dinner', menus: ['Pork Belly', 'Braised Ribs', 'Stew', 'Bulgogi', 'Chicken Stew', 'Soybean Stew', 'Shabu-shabu', 'Bossam'] },
        friends: { title: 'Friends Gathering', menus: ['Chicken', 'Pizza', 'Pork Feet', 'Tteokbokki', 'Malatang', 'Sundae', 'Chicken Feet', 'Pasta'] },
        office: { title: 'Office Party', menus: ['BBQ Grill', 'Seafood Stew', 'Shabu-shabu', 'Ribs', 'Sashimi', 'Braised Monkfish', 'Stir-fried Octopus', 'Skewers'] },
        date: { title: 'Date Night', menus: ['Pasta', 'Steak', 'Sushi', 'Risotto', 'Paella', 'Lamb Chops', 'Course Meal', 'Wine Pairing'] },
        quick: { title: 'Quick Meal', menus: ['Sandwich', 'Kimbap', 'Cup Noodle', 'Toast', 'Bagel', 'Cereal', 'Dumplings', 'Salad Wrap'] },
        diet: { title: 'Diet', menus: ['Salad', 'Chicken Breast', 'Poke', 'Konjac', 'Tofu Bowl', 'Salmon Salad', 'Greek Yogurt', 'Egg Whites'] },
        drinking: { title: 'Bar Snacks', menus: ['Chicken', 'Tripe', 'Sashimi', 'Pancake', 'Braised Seafood', 'Noodles', 'Fish Cake Soup', 'Jokbal'] }
    },
    'Korean': {
        title: '상황별 메뉴 추천',
        desc: '어떤 상황인가요? 딱 맞는 메뉴를 추천해드려요!',
        solo: { title: '혼밥', menus: ['라멘', '김밥', '덮밥', '국수', '우동', '비빔밥', '카레라이스', '주먹밥'] },
        family: { title: '가족 식사', menus: ['삼겹살', '갈비찜', '찌개', '불고기', '찜닭', '된장찌개', '샤브샤브', '보쌈'] },
        friends: { title: '친구 모임', menus: ['치킨', '피자', '족발', '떡볶이', '마라탕', '순대', '닭발', '파스타'] },
        office: { title: '회식', menus: ['고기구이', '해물탕', '샤브샤브', '갈비', '회', '아구찜', '낙지볶음', '꼬치구이'] },
        date: { title: '데이트', menus: ['파스타', '스테이크', '초밥', '리조또', '빠에야', '양갈비', '코스요리', '와인페어링'] },
        quick: { title: '간편식', menus: ['샌드위치', '김밥', '컵라면', '토스트', '베이글', '시리얼', '만두', '샐러드랩'] },
        diet: { title: '다이어트', menus: ['샐러드', '닭가슴살', '포케', '곤약', '두부볼', '연어샐러드', '그릭요거트', '에그화이트'] },
        drinking: { title: '술안주', menus: ['치킨', '곱창', '회', '전', '해물찜', '국물떡볶이', '오뎅탕', '족발'] }
    },
    'Japanese': {
        title: 'シーン別おすすめ',
        desc: 'どんなシチュエーションですか？ぴったりのメニューをおすすめします！',
        solo: { title: 'ひとりご飯', menus: ['ラーメン', 'キンパ', '丼物', 'そば', 'うどん', 'ビビンバ', 'カレーライス', 'おにぎり'] },
        family: { title: '家族の食事', menus: ['サムギョプサル', '煮込み', 'チゲ', 'プルコギ', 'タッカルビ', '味噌チゲ', 'しゃぶしゃぶ', 'ポッサム'] },
        friends: { title: '友達の集まり', menus: ['チキン', 'ピザ', '豚足', 'トッポッキ', 'マーラータン', 'スンデ', '鶏足', 'パスタ'] },
        office: { title: '会食', menus: ['焼肉', '海鮮鍋', 'しゃぶしゃぶ', 'カルビ', '刺身', 'あんこう蒸し', 'タコ炒め', '串焼き'] },
        date: { title: 'デート', menus: ['パスタ', 'ステーキ', '寿司', 'リゾット', 'パエリア', 'ラムチョップ', 'コース料理', 'ワインペアリング'] },
        quick: { title: '軽食', menus: ['サンドイッチ', 'キンパ', 'カップ麺', 'トースト', 'ベーグル', 'シリアル', '餃子', 'サラダラップ'] },
        diet: { title: 'ダイエット', menus: ['サラダ', 'チキンブレスト', 'ポケ', 'こんにゃく', '豆腐ボウル', 'サーモンサラダ', 'ギリシャヨーグルト', '卵白'] },
        drinking: { title: 'おつまみ', menus: ['チキン', 'ホルモン', '刺身', 'チヂミ', '海鮮蒸し', 'スープトッポッキ', 'おでん鍋', '豚足'] }
    },
    'Mandarin Chinese': {
        title: '场景推荐',
        desc: '您在什么场景下用餐？推荐最合适的菜单！',
        solo: { title: '独食', menus: ['拉面', '紫菜包饭', '盖饭', '面条', '乌冬面', '拌饭', '咖喱饭', '饭团'] },
        family: { title: '家庭聚餐', menus: ['五花肉', '炖排骨', '汤锅', '烤肉', '炖鸡', '大酱汤', '涮锅', '菜包肉'] },
        friends: { title: '朋友聚会', menus: ['炸鸡', '披萨', '猪蹄', '辣炒年糕', '麻辣烫', '米肠', '辣鸡爪', '意面'] },
        office: { title: '公司聚餐', menus: ['烤肉', '海鲜锅', '涮锅', '排骨', '刺身', '安康鱼蒸', '炒章鱼', '串烧'] },
        date: { title: '约会', menus: ['意面', '牛排', '寿司', '烩饭', '海鲜饭', '羊排', '套餐料理', '红酒搭配'] },
        quick: { title: '简餐', menus: ['三明治', '紫菜包饭', '杯面', '吐司', '贝果', '麦片', '饺子', '沙拉卷'] },
        diet: { title: '减肥餐', menus: ['沙拉', '鸡胸肉', '波奇', '魔芋', '豆腐碗', '三文鱼沙拉', '希腊酸奶', '蛋白'] },
        drinking: { title: '下酒菜', menus: ['炸鸡', '大肠', '生鱼片', '煎饼', '海鲜蒸', '汤年糕', '鱼饼汤', '猪蹄'] }
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

        const titleNode = card.querySelector('h3');
        if (titleNode) titleNode.textContent = lang[seasonKey].title;

        const listItems = card.querySelectorAll('li');
        listItems.forEach((li, liIndex) => {
            if (lang[seasonKey].menus[liIndex]) {
                const marker = li.querySelector('span');
                if (marker) {
                    // Preserve the bullet marker and only replace menu text.
                    li.innerHTML = `${marker.outerHTML}${lang[seasonKey].menus[liIndex]}`;
                } else {
                    li.textContent = lang[seasonKey].menus[liIndex];
                }
            }
        });
    });
}

// ============ HOME COOKING RECOMMENDATIONS ============

const homeCookingData = {
    'English': {
        title: 'Home Cooking Recommendations',
        desc: 'Cook at home instead of eating out or ordering delivery. Here are easy home-cooked meals even beginners can make.',
        items: [
            { title: 'Egg Fried Rice', desc: 'A super simple dish you can whip up with leftover rice and eggs. Add leftover veggies for extra nutrition! Season with soy sauce or oyster sauce for restaurant-quality flavor. About 10 minutes to cook.' },
            { title: 'Doenjang Jjigae', desc: 'A classic Korean soup made with basic ingredients like tofu, potatoes, zucchini, and onions. Add 2 tablespoons of doenjang and half a tablespoon of gochujang for rich flavor. A hearty meal with a bowl of rice.' },
            { title: 'Aglio e Olio', desc: 'A simple pasta you can make with just garlic, olive oil, and peperoncino. Prepare the sauce while boiling the noodles and it\'s done in 15 minutes. The key is adding a bit of pasta water to emulsify.' },
            { title: 'Tuna Mayo Rice Bowl', desc: 'A super easy dish ready in 5 minutes with canned tuna, mayo, and a bit of soy sauce. Top rice with tuna mayo, sprinkle seaweed flakes and sesame seeds, and done! Surprisingly addictive.' },
            { title: 'Ramen + Egg + Rice', desc: 'Korea\'s #1 late-night snack or quick meal. Add an egg to ramen and mix in rice for a meal more satisfying than any fancy dish. Add green onions and kimchi for extra flavor.' },
            { title: 'Bulgogi', desc: 'A signature Korean dish made by marinating beef in soy sauce, sugar, pear juice, and garlic, then stir-frying. Add onions, mushrooms, and carrots for a balanced meal. Kids love the sweet flavor.' }
        ]
    },
    'Korean': {
        title: '집밥 요리 추천',
        desc: '외식이나 배달 대신 집에서 직접 요리해보세요. 초보자도 쉽게 만들 수 있는 집밥 메뉴를 소개합니다.',
        items: [
            { title: '계란볶음밥', desc: '찬밥과 계란만 있으면 뚝딱 만들 수 있는 초간단 메뉴. 냉장고에 남은 채소를 넣으면 영양도 UP! 간장이나 굴소스로 간을 하면 식당 못지않은 맛을 낼 수 있습니다. 조리 시간 약 10분.' },
            { title: '된장찌개', desc: '두부, 감자, 호박, 양파 등 기본 재료로 만드는 한국의 대표 국물 요리. 된장 2큰술과 고추장 반 큰술을 넣으면 깊은 맛이 납니다. 밥 한 공기와 함께 먹으면 든든한 한 끼 완성입니다.' },
            { title: '알리오올리오', desc: '마늘, 올리브 오일, 페퍼론치노만 있으면 만들 수 있는 심플한 파스타. 면을 삶는 동안 소스를 준비하면 15분 안에 완성됩니다. 면수를 약간 넣어 유화시키는 것이 맛의 핵심 포인트입니다.' },
            { title: '참치마요 덮밥', desc: '참치캔과 마요네즈, 간장 약간만 있으면 5분 만에 완성되는 초간단 메뉴. 밥 위에 참치마요를 올리고 김가루, 깨를 뿌리면 끝! 의외로 맛있어서 자꾸 만들게 되는 중독성 있는 메뉴입니다.' },
            { title: '라면 + 계란 + 밥', desc: '한국인의 야식 or 간편식 1위. 라면에 계란을 넣고 밥을 말아 먹으면 그 어떤 고급 요리보다 만족스러운 한 끼가 됩니다. 파, 김치를 곁들이면 더욱 풍미가 살아납니다.' },
            { title: '불고기', desc: '소고기를 간장, 설탕, 배즙, 마늘로 양념해 재워두었다가 볶으면 완성되는 한식 대표 메뉴. 양파, 버섯, 당근을 함께 볶으면 채소까지 골고루 섭취할 수 있습니다. 아이들도 좋아하는 달콤한 맛입니다.' }
        ]
    },
    'Japanese': {
        title: 'おうちごはんおすすめ',
        desc: '外食やデリバリーの代わりに自炊してみましょう。初心者でも簡単に作れるメニューを紹介します。',
        items: [
            { title: '卵チャーハン', desc: '残りご飯と卵があればパパッと作れる超簡単メニュー。冷蔵庫の残り野菜を入れれば栄養もアップ！醤油やオイスターソースで味付けすればお店顔負けの味に。調理時間約10分。' },
            { title: 'テンジャンチゲ', desc: '豆腐、じゃがいも、ズッキーニ、玉ねぎなど基本材料で作る韓国の代表的なスープ料理。テンジャン大さじ2とコチュジャン大さじ半分で深い味わいに。ご飯と一緒にどうぞ。' },
            { title: 'アーリオ・オーリオ', desc: 'にんにく、オリーブオイル、ペペロンチーノだけで作れるシンプルパスタ。麺を茹でている間にソースを準備すれば15分で完成。茹で汁を少し加えて乳化させるのがポイント。' },
            { title: 'ツナマヨ丼', desc: 'ツナ缶とマヨネーズ、醤油少々で5分で完成の超簡単メニュー。ご飯の上にツナマヨを乗せて海苔とごまを振るだけ！意外とクセになるおいしさです。' },
            { title: 'ラーメン＋卵＋ご飯', desc: '韓国人の夜食・軽食第1位。ラーメンに卵を入れてご飯を混ぜれば、どんな高級料理より満足な一食に。ねぎやキムチを添えるとさらに風味アップ。' },
            { title: 'プルコギ', desc: '牛肉を醤油、砂糖、梨汁、にんにくで味付けして漬け込み、炒めるだけの韓国代表メニュー。玉ねぎ、きのこ、にんじんと一緒に炒めれば野菜もバランスよく摂れます。' }
        ]
    },
    'Mandarin Chinese': {
        title: '家常菜推荐',
        desc: '不用外食或叫外卖，在家自己做饭吧。介绍初学者也能轻松制作的家常菜。',
        items: [
            { title: '蛋炒饭', desc: '只要有剩饭和鸡蛋就能快速做出的超简单菜品。放入冰箱里剩余的蔬菜营养更丰富！用酱油或蚝油调味，味道不输餐厅。烹饪时间约10分钟。' },
            { title: '大酱汤', desc: '用豆腐、土豆、南瓜、洋葱等基本食材制作的韩国代表汤品。加入2大勺大酱和半大勺辣酱，味道醇厚。配一碗米饭就是丰盛的一餐。' },
            { title: '蒜香意面', desc: '只需大蒜、橄榄油和辣椒就能做的简单意面。煮面的同时准备酱料，15分钟内完成。加入少许面汤乳化是美味的关键。' },
            { title: '金枪鱼蛋黄酱盖饭', desc: '金枪鱼罐头、蛋黄酱和少许酱油，5分钟就能完成的超简单菜品。在米饭上放金枪鱼蛋黄酱，撒上海苔和芝麻就完成了！令人上瘾的美味。' },
            { title: '泡面+鸡蛋+米饭', desc: '韩国人的夜宵/简餐第一名。在泡面里加鸡蛋，拌入米饭，比任何高级料理都让人满足。加入葱和泡菜风味更佳。' },
            { title: '烤肉', desc: '将牛肉用酱油、糖、梨汁、大蒜腌制后炒制的韩式代表菜。加入洋葱、蘑菇、胡萝卜一起炒，蔬菜营养均衡摄入。孩子们也喜欢的甜味。' }
        ]
    }
};

function updateHomeCookingTranslations() {
    const lang = homeCookingData[currentLanguage] || homeCookingData['English'];
    const titleEl = document.getElementById('home-cooking-title');
    const descEl = document.getElementById('home-cooking-desc');

    if (titleEl) titleEl.textContent = lang.title;
    if (descEl) descEl.textContent = lang.desc;

    const cards = document.querySelectorAll('.home-cooking-card');
    cards.forEach((card, index) => {
        if (!lang.items[index]) return;
        const h3 = card.querySelector('h3');
        if (h3) h3.textContent = lang.items[index].title;
        const p = card.querySelector('p');
        if (p) p.textContent = lang.items[index].desc;
    });
}

// ============ BREAKFAST RECOMMENDATIONS ============

const breakfastData = {
    'English': {
        title: 'Breakfast Menu Recommendations',
        desc: 'Eat healthy even on busy mornings! Here are simple yet nutritious breakfast menus.',
        cards: [
            {
                title: 'Korean Breakfast',
                desc: 'A traditional Korean breakfast consists of rice, soup, and side dishes. It\'s easy to prepare and nutritionally balanced.',
                menus: ['Seaweed Soup + Rice + Fried Egg', 'Bean Sprout Soup Rice (easy on stomach, good for hangovers)', 'Kimchi Fried Rice + Fried Egg', 'Porridge (abalone, pumpkin, vegetable, etc.)', 'Toast + Egg Roll + Milk']
            },
            {
                title: 'Western Breakfast',
                desc: 'Western breakfast is based on bread and coffee with various combinations. Great for quick and easy mornings.',
                menus: ['Toast + Scrambled Eggs + Bacon', 'Cereal + Milk + Fruit', 'Oatmeal + Nuts + Honey', 'Pancakes + Maple Syrup', 'Greek Yogurt + Granola + Blueberries']
            },
            {
                title: 'Quick Breakfast',
                desc: 'Menus that take 1-5 minutes for time-pressed mornings. Short prep time but enough for an energy boost.',
                menus: ['Banana + Milk (quickest nutrition)', 'Bread + Jam + Coffee', 'Energy Bar + Juice', '2 Boiled Eggs + Fruit', 'Reheat yesterday\'s leftovers']
            }
        ],
        tipTitle: 'Importance of Breakfast:',
        tipText: 'Skipping breakfast leads to poor concentration in the morning and overeating at lunch. Even a simple breakfast habit can make or break your daily condition. Experts recommend a balanced breakfast with carbs, protein, and fruit.'
    },
    'Korean': {
        title: '아침 메뉴 추천',
        desc: '바쁜 아침에도 건강하게! 간편하면서도 영양 가득한 아침 메뉴를 소개합니다.',
        cards: [
            {
                title: '한식 아침',
                desc: '전통적인 한식 아침은 밥, 국, 반찬으로 구성됩니다. 간단하게 준비하면서도 영양 균형이 좋은 것이 장점입니다.',
                menus: ['미역국 + 흰 쌀밥 + 계란 프라이', '콩나물국밥 (속이 편하고 해장에도 좋음)', '김치볶음밥 + 계란 후라이', '죽 (전복죽, 호박죽, 야채죽 등)', '토스트 + 계란말이 + 우유']
            },
            {
                title: '양식 아침',
                desc: '서양식 아침은 빵과 커피를 기본으로 다양한 조합이 가능합니다. 바쁜 아침에 간편하게 즐길 수 있는 것이 장점입니다.',
                menus: ['토스트 + 스크램블 에그 + 베이컨', '시리얼 + 우유 + 과일', '오트밀 + 견과류 + 꿀', '팬케이크 + 메이플 시럽', '그릭 요거트 + 그래놀라 + 블루베리']
            },
            {
                title: '초간편 아침',
                desc: '시간이 없는 아침을 위한 1분~5분 완성 메뉴입니다. 준비 시간은 짧지만 에너지 보충에는 충분합니다.',
                menus: ['바나나 + 우유 (가장 빠른 영양 보충)', '식빵 + 잼 + 커피', '에너지바 + 주스', '삶은 달걀 2개 + 과일', '전날 남은 음식 데워 먹기']
            }
        ],
        tipTitle: '아침 식사의 중요성:',
        tipText: '아침을 거르면 오전 집중력이 떨어지고 점심에 과식하게 되는 악순환이 반복됩니다. 간단하더라도 아침을 챙겨 먹는 습관이 하루의 컨디션을 좌우합니다. 전문가들은 탄수화물, 단백질, 과일을 균형 있게 포함한 아침 식사를 권장합니다.'
    },
    'Japanese': {
        title: '朝食メニューおすすめ',
        desc: '忙しい朝でも健康的に！簡単で栄養たっぷりの朝食メニューを紹介します。',
        cards: [
            {
                title: '和食の朝ごはん',
                desc: '伝統的な和食の朝ごはんはご飯、味噌汁、おかずで構成されます。簡単に準備でき、栄養バランスが良いのが魅力です。',
                menus: ['わかめスープ + ご飯 + 目玉焼き', 'もやしクッパ（胃に優しく二日酔いにも効く）', 'キムチチャーハン + 目玉焼き', 'お粥（アワビ粥、カボチャ粥、野菜粥など）', 'トースト + 卵焼き + 牛乳']
            },
            {
                title: '洋食の朝ごはん',
                desc: '洋食の朝ごはんはパンとコーヒーをベースに様々な組み合わせが可能です。忙しい朝に手軽に楽しめるのが魅力です。',
                menus: ['トースト + スクランブルエッグ + ベーコン', 'シリアル + 牛乳 + フルーツ', 'オートミール + ナッツ + はちみつ', 'パンケーキ + メープルシロップ', 'ギリシャヨーグルト + グラノーラ + ブルーベリー']
            },
            {
                title: '超簡単朝ごはん',
                desc: '時間がない朝のための1分～5分で完成するメニューです。準備時間は短いですがエネルギー補充には十分です。',
                menus: ['バナナ + 牛乳（最速の栄養補給）', '食パン + ジャム + コーヒー', 'エナジーバー + ジュース', 'ゆで卵2個 + フルーツ', '前日の残り物を温めて食べる']
            }
        ],
        tipTitle: '朝食の重要性：',
        tipText: '朝食を抜くと午前中の集中力が低下し、昼食で食べ過ぎる悪循環が繰り返されます。簡単でも朝食を食べる習慣が一日のコンディションを左右します。専門家は炭水化物、タンパク質、果物をバランスよく含む朝食を推奨しています。'
    },
    'Mandarin Chinese': {
        title: '早餐菜单推荐',
        desc: '忙碌的早晨也要健康！介绍简单又营养丰富的早餐菜单。',
        cards: [
            {
                title: '中式早餐',
                desc: '传统中式早餐由米饭、汤和小菜组成。简单准备的同时营养均衡是其优点。',
                menus: ['海带汤 + 白米饭 + 煎蛋', '豆芽汤饭（养胃，解酒也好）', '泡菜炒饭 + 煎蛋', '粥（鲍鱼粥、南瓜粥、蔬菜粥等）', '吐司 + 鸡蛋卷 + 牛奶']
            },
            {
                title: '西式早餐',
                desc: '西式早餐以面包和咖啡为基础，可以有多种搭配。适合忙碌早晨的便捷选择。',
                menus: ['吐司 + 炒蛋 + 培根', '麦片 + 牛奶 + 水果', '燕麦 + 坚果 + 蜂蜜', '煎饼 + 枫糖浆', '希腊酸奶 + 格兰诺拉 + 蓝莓']
            },
            {
                title: '超快速早餐',
                desc: '为没有时间的早晨准备的1分钟~5分钟速成菜单。准备时间短但足以补充能量。',
                menus: ['香蕉 + 牛奶（最快的营养补充）', '面包 + 果酱 + 咖啡', '能量棒 + 果汁', '2个水煮蛋 + 水果', '加热前一天的剩菜']
            }
        ],
        tipTitle: '早餐的重要性：',
        tipText: '不吃早餐会导致上午注意力下降，午餐暴饮暴食的恶性循环。即使简单也要养成吃早餐的习惯，这决定了一天的状态。专家建议早餐均衡搭配碳水化合物、蛋白质和水果。'
    }
};

function updateBreakfastTranslations() {
    const lang = breakfastData[currentLanguage] || breakfastData['English'];
    const titleEl = document.getElementById('breakfast-title');
    const descEl = document.getElementById('breakfast-desc');
    const tipTitleEl = document.getElementById('breakfast-tip-title');
    const tipTextEl = document.getElementById('breakfast-tip-text');

    if (titleEl) titleEl.textContent = lang.title;
    if (descEl) descEl.textContent = lang.desc;
    if (tipTitleEl) tipTitleEl.textContent = lang.tipTitle;
    if (tipTextEl) tipTextEl.textContent = lang.tipText;

    const cards = document.querySelectorAll('.breakfast-card');
    cards.forEach((card, index) => {
        if (!lang.cards[index]) return;
        const h3 = card.querySelector('h3');
        if (h3) h3.textContent = lang.cards[index].title;
        const p = card.querySelector('p');
        if (p) p.textContent = lang.cards[index].desc;
        const items = card.querySelectorAll('li');
        items.forEach((li, liIndex) => {
            if (lang.cards[index].menus[liIndex]) {
                const marker = li.querySelector('span');
                if (marker) {
                    li.innerHTML = `${marker.outerHTML}${lang.cards[index].menus[liIndex]}`;
                } else {
                    li.textContent = lang.cards[index].menus[liIndex];
                }
            }
        });
    });
}

// ============ CALORIE GUIDE ============

const calorieData = {
    'English': {
        title: 'Menu Calorie Guide',
        desc: 'Knowing the approximate calories per menu helps with healthy diet management. (Per serving)',
        headers: ['Menu', 'Calories (kcal)', 'Category', 'Notes'],
        rows: [
            { menu: 'Salad (with dressing)', cal: '200~350', cat: 'Low-cal', catClass: 'green', note: 'Recommended for dieting, add protein' },
            { menu: 'Bibimbap', cal: '500~600', cat: 'Medium', catClass: 'amber', note: 'Rich in vegetables, balanced nutrition' },
            { menu: 'Kimchi Stew + Rice', cal: '450~550', cat: 'Medium', catClass: 'amber', note: 'Watch sodium, rich in protein' },
            { menu: 'Tonkatsu', cal: '700~900', cat: 'High-cal', catClass: 'red', note: 'Fried dish, very filling' },
            { menu: 'Pork Belly (1 serving)', cal: '500~700', cat: 'Medium', catClass: 'amber', note: 'Eat with lettuce wraps for balance' },
            { menu: 'Chicken (half)', cal: '600~800', cat: 'High-cal', catClass: 'red', note: 'Fried slightly higher than seasoned' },
            { menu: 'Jajangmyeon', cal: '650~750', cat: 'Medium', catClass: 'amber', note: 'Carb-heavy, may lack vegetables' },
            { menu: 'Ramen', cal: '500~700', cat: 'Medium', catClass: 'amber', note: 'High sodium, adjust by broth amount' },
            { menu: 'Pasta (cream)', cal: '700~900', cat: 'High-cal', catClass: 'red', note: 'Oil pasta is lower in calories' },
            { menu: 'Cold Noodles', cal: '400~500', cat: 'Low-cal', catClass: 'green', note: 'Cool summer dish, spicy version is higher' },
            { menu: 'Chicken Breast Salad', cal: '250~400', cat: 'Low-cal', catClass: 'green', note: 'High protein, low fat, ideal for diet' },
            { menu: 'Tteokbokki', cal: '400~550', cat: 'Medium', catClass: 'amber', note: 'High carbs, increases with fried additions' }
        ],
        tip1prefix: 'The calorie information above is approximate per serving. Actual calories may vary depending on cooking method, ingredient amounts, and sauces. ',
        tip1bold: 'Recommended daily calories for healthy adults: ~2,500kcal for men, ~2,000kcal for women',
        tip1suffix: ', varying by activity level.',
        tip2: 'For dieting, aim for 500-600kcal per meal. Rather than just cutting calories, balancing nutrients like protein, fiber, and vitamins is more important.'
    },
    'Korean': {
        title: '주요 메뉴 칼로리 가이드',
        desc: '메뉴별 대략적인 칼로리를 알아두면 건강한 식단 관리에 도움이 됩니다. (1인분 기준)',
        headers: ['메뉴', '칼로리 (kcal)', '분류', '특징'],
        rows: [
            { menu: '샐러드 (드레싱 포함)', cal: '200~350', cat: '저칼로리', catClass: 'green', note: '다이어트 시 추천, 단백질 추가 권장' },
            { menu: '비빔밥', cal: '500~600', cat: '중간', catClass: 'amber', note: '채소 풍부, 균형 잡힌 영양' },
            { menu: '김치찌개 + 밥', cal: '450~550', cat: '중간', catClass: 'amber', note: '나트륨 주의, 단백질 풍부' },
            { menu: '돈카츠', cal: '700~900', cat: '고칼로리', catClass: 'red', note: '튀김 요리, 포만감 높음' },
            { menu: '삼겹살 1인분', cal: '500~700', cat: '중간', catClass: 'amber', note: '쌈채소와 함께 먹으면 균형 UP' },
            { menu: '치킨 반마리', cal: '600~800', cat: '고칼로리', catClass: 'red', note: '양념보다 후라이드가 약간 높음' },
            { menu: '짜장면', cal: '650~750', cat: '중간', catClass: 'amber', note: '탄수화물 위주, 채소 부족할 수 있음' },
            { menu: '라멘', cal: '500~700', cat: '중간', catClass: 'amber', note: '나트륨 높음, 국물 양으로 조절' },
            { menu: '파스타 (크림)', cal: '700~900', cat: '고칼로리', catClass: 'red', note: '오일 파스타가 더 낮은 칼로리' },
            { menu: '냉면', cal: '400~500', cat: '저칼로리', catClass: 'green', note: '여름 시원한 메뉴, 비빔냉면이 더 높음' },
            { menu: '닭가슴살 샐러드', cal: '250~400', cat: '저칼로리', catClass: 'green', note: '고단백 저지방, 다이어트 최적' },
            { menu: '떡볶이', cal: '400~550', cat: '중간', catClass: 'amber', note: '탄수화물 높음, 튀김 사리 추가 시 증가' }
        ],
        tip1prefix: '위 칼로리 정보는 일반적인 1인분 기준의 대략적인 수치입니다. 실제 칼로리는 조리 방법, 재료 양, 소스 등에 따라 달라질 수 있습니다. ',
        tip1bold: '건강한 성인의 하루 권장 칼로리는 남성 약 2,500kcal, 여성 약 2,000kcal',
        tip1suffix: '이며, 활동량에 따라 차이가 있습니다.',
        tip2: '다이어트를 위해서는 한 끼에 500~600kcal 이내로 섭취하는 것이 좋으며, 단순히 칼로리만 줄이기보다는 단백질, 식이섬유, 비타민 등 영양소의 균형을 맞추는 것이 더 중요합니다.'
    },
    'Japanese': {
        title: 'メニュー別カロリーガイド',
        desc: 'メニューごとの大まかなカロリーを知っておくと、健康的な食事管理に役立ちます。（1人前基準）',
        headers: ['メニュー', 'カロリー (kcal)', '分類', '特徴'],
        rows: [
            { menu: 'サラダ（ドレッシング込み）', cal: '200~350', cat: '低カロリー', catClass: 'green', note: 'ダイエットにおすすめ、タンパク質追加推奨' },
            { menu: 'ビビンバ', cal: '500~600', cat: '中間', catClass: 'amber', note: '野菜豊富、バランスの取れた栄養' },
            { menu: 'キムチチゲ + ご飯', cal: '450~550', cat: '中間', catClass: 'amber', note: '塩分注意、タンパク質豊富' },
            { menu: 'トンカツ', cal: '700~900', cat: '高カロリー', catClass: 'red', note: '揚げ物、満腹感が高い' },
            { menu: 'サムギョプサル1人前', cal: '500~700', cat: '中間', catClass: 'amber', note: 'サンチュと食べるとバランスUP' },
            { menu: 'チキン半分', cal: '600~800', cat: '高カロリー', catClass: 'red', note: '味付けよりフライドがやや高い' },
            { menu: 'ジャージャー麺', cal: '650~750', cat: '中間', catClass: 'amber', note: '炭水化物中心、野菜不足の可能性' },
            { menu: 'ラーメン', cal: '500~700', cat: '中間', catClass: 'amber', note: '塩分高め、スープの量で調節' },
            { menu: 'パスタ（クリーム）', cal: '700~900', cat: '高カロリー', catClass: 'red', note: 'オイルパスタの方が低カロリー' },
            { menu: '冷麺', cal: '400~500', cat: '低カロリー', catClass: 'green', note: '夏の涼しいメニュー、ビビン冷麺の方が高い' },
            { menu: 'チキンブレストサラダ', cal: '250~400', cat: '低カロリー', catClass: 'green', note: '高タンパク低脂肪、ダイエット最適' },
            { menu: 'トッポッキ', cal: '400~550', cat: '中間', catClass: 'amber', note: '炭水化物高め、天ぷら追加で増加' }
        ],
        tip1prefix: '上記のカロリー情報は一般的な1人前基準の概算です。実際のカロリーは調理方法、材料の量、ソースなどにより異なります。',
        tip1bold: '健康な成人の1日推奨カロリーは男性約2,500kcal、女性約2,000kcal',
        tip1suffix: 'で、活動量により差があります。',
        tip2: 'ダイエットのためには1食500～600kcal以内に抑えるのが良く、単にカロリーを減らすだけでなく、タンパク質、食物繊維、ビタミンなど栄養素のバランスを取ることがより重要です。'
    },
    'Mandarin Chinese': {
        title: '菜单卡路里指南',
        desc: '了解每道菜的大致卡路里有助于健康饮食管理。（每份基准）',
        headers: ['菜单', '卡路里 (kcal)', '分类', '特点'],
        rows: [
            { menu: '沙拉（含酱汁）', cal: '200~350', cat: '低卡', catClass: 'green', note: '减肥推荐，建议加蛋白质' },
            { menu: '拌饭', cal: '500~600', cat: '中等', catClass: 'amber', note: '蔬菜丰富，营养均衡' },
            { menu: '泡菜锅 + 米饭', cal: '450~550', cat: '中等', catClass: 'amber', note: '注意钠含量，蛋白质丰富' },
            { menu: '炸猪排', cal: '700~900', cat: '高卡', catClass: 'red', note: '油炸食品，饱腹感强' },
            { menu: '五花肉1人份', cal: '500~700', cat: '中等', catClass: 'amber', note: '搭配生菜吃更均衡' },
            { menu: '炸鸡半只', cal: '600~800', cat: '高卡', catClass: 'red', note: '原味比调味卡路里略高' },
            { menu: '炸酱面', cal: '650~750', cat: '中等', catClass: 'amber', note: '碳水为主，可能缺乏蔬菜' },
            { menu: '拉面', cal: '500~700', cat: '中等', catClass: 'amber', note: '钠含量高，可通过汤量调节' },
            { menu: '意面（奶油）', cal: '700~900', cat: '高卡', catClass: 'red', note: '油基意面卡路里更低' },
            { menu: '冷面', cal: '400~500', cat: '低卡', catClass: 'green', note: '夏季清爽菜品，拌冷面更高' },
            { menu: '鸡胸肉沙拉', cal: '250~400', cat: '低卡', catClass: 'green', note: '高蛋白低脂肪，减肥最佳' },
            { menu: '辣炒年糕', cal: '400~550', cat: '中等', catClass: 'amber', note: '碳水高，加油炸会增加' }
        ],
        tip1prefix: '以上卡路里信息是一般每份的大致数值。实际卡路里会因烹饪方法、食材量和酱料不同而有所差异。',
        tip1bold: '健康成年人每日推荐卡路里：男性约2,500kcal，女性约2,000kcal',
        tip1suffix: '，根据活动量有所不同。',
        tip2: '减肥建议每餐控制在500~600kcal以内，与其单纯减少卡路里，不如均衡摄取蛋白质、膳食纤维、维生素等营养素更为重要。'
    }
};

function updateCalorieTranslations() {
    const lang = calorieData[currentLanguage] || calorieData['English'];
    const titleEl = document.getElementById('calorie-title');
    const descEl = document.getElementById('calorie-desc');

    if (titleEl) titleEl.textContent = lang.title;
    if (descEl) descEl.textContent = lang.desc;

    // Update table headers
    const ths = document.querySelectorAll('.calorie-th');
    ths.forEach((th, i) => {
        if (lang.headers[i]) th.textContent = lang.headers[i];
    });

    // Update table rows
    const table = document.getElementById('calorie-table');
    if (table) {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, i) => {
            if (!lang.rows[i]) return;
            const tds = row.querySelectorAll('td');
            if (tds[0]) tds[0].textContent = lang.rows[i].menu;
            if (tds[1]) tds[1].textContent = lang.rows[i].cal;
            if (tds[2]) {
                const colorMap = { green: 'green', amber: 'amber', red: 'red' };
                const c = colorMap[lang.rows[i].catClass] || 'amber';
                const darkC = c === 'red' ? 'red' : c;
                tds[2].innerHTML = `<span class="text-xs px-2.5 py-1 bg-${c}-500/10 text-${c === 'red' ? 'red-500' : c + '-600'} dark:text-${darkC}-400 rounded-full font-medium">${lang.rows[i].cat}</span>`;
            }
            if (tds[3]) tds[3].textContent = lang.rows[i].note;
        });
    }

    // Update tips
    const tip1El = document.getElementById('calorie-tip1');
    const tip1BoldEl = document.getElementById('calorie-tip1-bold');
    const tip2El = document.getElementById('calorie-tip2');

    if (tip1El && tip1BoldEl) {
        tip1El.innerHTML = `${lang.tip1prefix}<strong id="calorie-tip1-bold">${lang.tip1bold}</strong>${lang.tip1suffix}`;
    }
    if (tip2El) tip2El.textContent = lang.tip2;
}

// ============ MENU INFO SECTION ============

const menuInfoData = {
    'English': {
        title: 'What is Menu Recommendation?',
        p1: '<strong>Menu Recommendation Service</strong> is a free web application created to solve the daily dilemma of "What should I eat today?" You can get a random recommendation from <strong>over 200 menus</strong> including Korean, Japanese, Chinese, and Western cuisine, with a fun slot machine-style interface.',
        p2: 'This service supports <strong>18 languages</strong> and is used by users in over 70 countries worldwide. It offers <strong>situation-based menu recommendations</strong> for solo dining, family meals, friend gatherings, office parties, and dates, as well as <strong>seasonal/weather-based menu recommendations</strong> for hot days, cold days, rainy days, and hangovers.',
        p3: 'You can use it directly in your web browser without signing up or installing an app, and it\'s available 24/7 for free. You can also share food stories with other users on the community board.'
    },
    'Korean': {
        title: '메뉴 추천이란?',
        p1: '<strong>메뉴 추천 서비스</strong>는 매일 반복되는 "오늘 뭐 먹지?"라는 고민을 해결하기 위해 만들어진 무료 웹 애플리케이션입니다. 한식, 일식, 중식, 양식을 포함한 <strong>200가지 이상의 메뉴</strong> 중 하나를 랜덤으로 추천받을 수 있으며, 슬롯머신 방식의 재미있는 인터페이스를 제공합니다.',
        p2: '이 서비스는 <strong>18개 언어</strong>를 지원하여 전 세계 70개국 이상의 사용자가 이용하고 있습니다. 혼밥, 가족 식사, 친구 모임, 회식, 데이트 등 <strong>상황별 메뉴 추천</strong>과 더울 때, 추울 때, 비 올 때, 해장 등 <strong>계절/날씨별 메뉴 추천</strong> 기능도 제공합니다.',
        p3: '회원가입이나 앱 설치 없이 웹 브라우저에서 바로 사용할 수 있으며, 24시간 무료로 이용 가능합니다. 커뮤니티 게시판에서 다른 사용자들과 음식 이야기를 나눌 수도 있습니다.'
    },
    'Japanese': {
        title: 'メニュー推薦とは？',
        p1: '<strong>メニュー推薦サービス</strong>は、毎日繰り返される「今日何食べよう？」という悩みを解決するために作られた無料ウェブアプリケーションです。韓食、和食、中華、洋食を含む<strong>200種類以上のメニュー</strong>からランダムにおすすめを受けることができ、スロットマシン方式の楽しいインターフェースを提供します。',
        p2: 'このサービスは<strong>18言語</strong>に対応し、世界70カ国以上のユーザーが利用しています。一人ご飯、家族の食事、友達の集まり、会食、デートなどの<strong>シーン別メニューおすすめ</strong>と、暑い日、寒い日、雨の日、二日酔いなどの<strong>季節・天気別メニューおすすめ</strong>機能も提供しています。',
        p3: '会員登録やアプリのインストールなしにウェブブラウザで直接利用でき、24時間無料で使えます。コミュニティ掲示板で他のユーザーと食べ物の話を共有することもできます。'
    },
    'Mandarin Chinese': {
        title: '什么是菜单推荐？',
        p1: '<strong>菜单推荐服务</strong>是一款为解决每天"今天吃什么？"的烦恼而创建的免费网络应用程序。可以从包括韩餐、日餐、中餐、西餐在内的<strong>200多种菜单</strong>中随机获得推荐，并提供有趣的老虎机式界面。',
        p2: '该服务支持<strong>18种语言</strong>，全球70多个国家的用户正在使用。提供独食、家庭聚餐、朋友聚会、公司聚餐、约会等<strong>场景推荐</strong>，以及热天、冷天、雨天、解酒等<strong>季节/天气菜单推荐</strong>功能。',
        p3: '无需注册或安装应用，直接在网页浏览器中使用，24小时免费。还可以在社区留言板与其他用户分享美食故事。'
    }
};

function updateMenuInfoTranslations() {
    const lang = menuInfoData[currentLanguage] || menuInfoData['English'];
    const titleEl = document.getElementById('info-title');
    const p1 = document.getElementById('info-p1');
    const p2 = document.getElementById('info-p2');
    const p3 = document.getElementById('info-p3');

    if (titleEl) titleEl.textContent = lang.title;
    if (p1) p1.innerHTML = lang.p1;
    if (p2) p2.innerHTML = lang.p2;
    if (p3) p3.innerHTML = lang.p3;
}

// ============ FAQ SECTION ============

const faqData = {
    'English': {
        title: 'Frequently Asked Questions',
        items: [
            { q: 'What should I eat today? How do I get menu recommendations?', a: 'Click the "Get Menu Recommendation" button to get a random recommendation from over 200 menus including chicken, pizza, pork belly, steak, pasta, and more. You can also use the fun slot machine feature or filter by category to get recommendations for specific types of food.' },
            { q: 'What menus can I get recommended?', a: 'You can get recommendations from over 200 menus including Korean (bibimbap, japchae, kimchi stew, tteokbokki, pork belly, bulgogi, etc.), Japanese (sushi, tonkatsu, udon, ramen, etc.), Western (steak, pasta, hamburger, pizza, etc.), Chinese (jajangmyeon, jjamppong, malatang, etc.), Southeast Asian (pad thai, pho, nasi goreng, etc.), Mexican (tacos, burritos, etc.), Indian (curry, tandoori, etc.), and Middle Eastern (kebab, falafel, etc.).' },
            { q: 'Is the menu recommendation free?', a: 'Yes, the menu recommendation service is completely free and can be used directly in your web browser without signing up or installing an app. It\'s available 24/7 with no usage limits and supports 18 languages for worldwide use.' },
            { q: 'What should I eat on a rainy day?', a: 'On rainy days, warm traditional foods like green onion pancake, kalguksu, sujebi, jeon, seafood pancake, and kimchi pancake are popular. Pairing with makgeolli or dongdongju adds to the rainy day ambiance. Check the "Seasonal/Weather Menu" section above for more weather-appropriate menus.' },
            { q: 'What menu is recommended for solo dining?', a: 'For solo dining, menus that are easy to order per serving like ramen, kimbap, rice bowls, noodles, and sandwiches are great. Choose menus that are convenient to eat while providing various nutrients. Check the solo dining category in "Situation-Based Recommendations" above for more suggestions.' },
            { q: 'Recommend a menu for dieting', a: 'For dieting, we recommend low-calorie, high-protein menus like salad, chicken breast, poke, and konjac. Reducing carbs and focusing on vegetables and protein makes for healthy meals. Check the diet category in "Situation-Based Recommendations" for more ideas.' },
            { q: 'What languages does this service support?', a: 'We support 18 languages including Korean, English, Japanese, Chinese, Spanish, French, German, Portuguese, Italian, Russian, Arabic, Hindi, Thai, Vietnamese, Indonesian, Turkish, Polish, and Dutch. Select your preferred language from the language button at the top to change all menu names and the entire interface.' },
            { q: 'Any tips for choosing a menu?', a: 'Consider delivery time and cooking time. On cold days, warm soup dishes are great; on hot days, cool salads or cold noodles are ideal. The right menu depends on who you\'re dining with, and for a balanced diet, choose menus with vegetables and protein. Use our "Situation-Based Recommendations" and "Seasonal/Weather Menu" features for easier decisions.' }
        ]
    },
    'Korean': {
        title: '자주 묻는 질문',
        items: [
            { q: '오늘 뭐 먹지? 메뉴 추천은 어떻게 받나요?', a: '메뉴 추천 서비스에서 \'메뉴 추천받기\' 버튼을 클릭하면 치킨, 피자, 삼겹살, 스테이크, 파스타 등 200가지 이상의 메뉴 중 하나를 랜덤으로 추천받을 수 있습니다. 슬롯머신 방식으로도 재미있게 메뉴를 선택할 수 있으며, 카테고리별로 필터링하여 원하는 종류의 음식만 추천받을 수도 있습니다.' },
            { q: '어떤 메뉴를 추천받을 수 있나요?', a: '한식(비빔밥, 잡채, 김치찌개, 떡볶이, 삼겹살, 불고기 등), 일식(초밥, 돈카츠, 우동, 라멘 등), 양식(스테이크, 파스타, 햄버거, 피자 등), 중식(짜장면, 짬뽕, 마라탕 등), 동남아(팟타이, 쌀국수, 나시고렝 등), 멕시칸(타코, 부리또 등), 인도(커리, 탄두리 등), 중동(케밥, 팔라펠 등) 총 200가지 이상의 메뉴를 추천받을 수 있습니다.' },
            { q: '메뉴 추천은 무료인가요?', a: '네, 메뉴 추천 서비스는 완전히 무료이며, 회원가입이나 앱 설치 없이 웹 브라우저에서 바로 이용 가능합니다. 24시간 언제든지 횟수 제한 없이 무료로 사용할 수 있으며, 18개 언어를 지원하여 전 세계 어디서든 사용할 수 있습니다.' },
            { q: '비 오는 날 뭐 먹지?', a: '비 오는 날에는 파전, 칼국수, 수제비, 부침개, 해물전, 김치전 같은 따뜻한 전통 음식이 인기입니다. 막걸리나 동동주와 함께 먹으면 비 오는 날의 운치를 더할 수 있습니다. 위의 \'계절/날씨별 메뉴\' 섹션에서 날씨에 맞는 다양한 메뉴를 확인해보세요.' },
            { q: '혼밥할 때 추천 메뉴는?', a: '혼자 먹을 때는 라멘, 김밥, 덮밥, 국수, 샌드위치 같은 1인분 단위로 주문하기 쉬운 메뉴가 좋습니다. 간편하게 먹을 수 있으면서도 다양한 영양소를 섭취할 수 있는 메뉴를 선택하세요. 위의 \'상황별 메뉴 추천\'에서 혼밥 카테고리를 참고하시면 더 많은 추천을 받을 수 있습니다.' },
            { q: '다이어트 중 메뉴 추천해주세요', a: '다이어트 중이라면 샐러드, 닭가슴살, 포케, 곤약 같은 저칼로리 고단백 메뉴를 추천합니다. 탄수화물을 줄이고 채소와 단백질 중심으로 식단을 구성하면 건강한 식사가 가능합니다. \'상황별 메뉴 추천\'의 다이어트 카테고리에서 더 많은 아이디어를 확인하세요.' },
            { q: '이 서비스는 어떤 언어를 지원하나요?', a: '한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 포르투갈어, 이탈리아어, 러시아어, 아랍어, 힌디어, 태국어, 베트남어, 인도네시아어, 터키어, 폴란드어, 네덜란드어 등 총 18개 언어를 지원합니다. 상단의 언어 선택 버튼에서 원하는 언어를 선택하면 메뉴명과 전체 인터페이스가 해당 언어로 변경됩니다.' },
            { q: '메뉴 고를 때 팁이 있나요?', a: '배달 시간과 조리 시간을 고려하세요. 추운 날에는 따뜻한 국물 요리, 더운 날에는 시원한 샐러드나 냉면이 좋습니다. 함께 식사하는 사람에 따라 적합한 메뉴가 다르며, 균형 잡힌 식단을 위해 채소와 단백질이 포함된 메뉴를 선택하세요. 우리 서비스의 \'상황별 메뉴 추천\'과 \'계절/날씨별 메뉴\' 기능을 활용하면 더 쉽게 결정할 수 있습니다.' }
        ]
    },
    'Japanese': {
        title: 'よくある質問',
        items: [
            { q: '今日何食べよう？メニュー推薦はどうやって受けるの？', a: '「メニューを推薦してもらう」ボタンをクリックすると、チキン、ピザ、サムギョプサル、ステーキ、パスタなど200種類以上のメニューからランダムに推薦を受けられます。スロットマシン方式でも楽しくメニューを選べ、カテゴリ別にフィルタリングして好きな種類の食べ物だけ推薦を受けることもできます。' },
            { q: 'どんなメニューを推薦してもらえますか？', a: '韓食（ビビンバ、チャプチェ、キムチチゲ、トッポッキ、サムギョプサル、プルコギなど）、和食（寿司、トンカツ、うどん、ラーメンなど）、洋食（ステーキ、パスタ、ハンバーガー、ピザなど）、中華（ジャージャー麺、チャンポン、マーラータンなど）、東南アジア（パッタイ、フォー、ナシゴレンなど）、メキシカン（タコス、ブリトーなど）、インド（カレー、タンドリーなど）、中東（ケバブ、ファラフェルなど）計200種類以上のメニューを推薦してもらえます。' },
            { q: 'メニュー推薦は無料ですか？', a: 'はい、メニュー推薦サービスは完全無料で、会員登録やアプリのインストールなしにウェブブラウザで直接利用可能です。24時間いつでも回数制限なく無料で使え、18言語に対応して世界中どこでも使えます。' },
            { q: '雨の日は何食べよう？', a: '雨の日にはチヂミ、カルグクス、スジェビ、煎餅、海鮮チヂミ、キムチチヂミなどの温かい伝統料理が人気です。マッコリやトンドンジュと一緒に食べると雨の日の趣が増します。上の「季節・天気別メニュー」セクションで天気に合った様々なメニューをチェックしてみてください。' },
            { q: 'ひとりご飯のおすすめメニューは？', a: 'ひとりで食べる時はラーメン、キンパ、丼物、麺類、サンドイッチなど1人前単位で注文しやすいメニューがおすすめです。手軽に食べられながらも栄養バランスの良いメニューを選びましょう。上の「シーン別おすすめ」のひとりご飯カテゴリを参考にすれば、もっと多くの推薦を受けられます。' },
            { q: 'ダイエット中のおすすめメニューは？', a: 'ダイエット中ならサラダ、チキンブレスト、ポケ、こんにゃくなどの低カロリー高タンパクメニューがおすすめです。炭水化物を減らし、野菜とタンパク質中心の食事にすれば健康的な食事ができます。「シーン別おすすめ」のダイエットカテゴリでもっとアイデアを確認してください。' },
            { q: 'このサービスはどの言語に対応していますか？', a: '韓国語、英語、日本語、中国語、スペイン語、フランス語、ドイツ語、ポルトガル語、イタリア語、ロシア語、アラビア語、ヒンディー語、タイ語、ベトナム語、インドネシア語、トルコ語、ポーランド語、オランダ語の計18言語に対応しています。上部の言語選択ボタンから言語を選択すると、メニュー名とインターフェース全体が変更されます。' },
            { q: 'メニュー選びのコツはありますか？', a: 'デリバリー時間と調理時間を考慮してください。寒い日は温かいスープ料理、暑い日は涼しいサラダや冷麺がおすすめです。一緒に食事する人によって適したメニューが異なり、バランスの良い食事のために野菜とタンパク質を含むメニューを選びましょう。「シーン別おすすめ」と「季節・天気別メニュー」機能を活用すれば、より簡単に決められます。' }
        ]
    },
    'Mandarin Chinese': {
        title: '常见问题',
        items: [
            { q: '今天吃什么？怎么获得菜单推荐？', a: '点击"获取菜单推荐"按钮，即可从炸鸡、披萨、五花肉、牛排、意面等200多种菜单中随机获得推荐。也可以用有趣的老虎机方式选择菜单，或按类别筛选获取特定类型的推荐。' },
            { q: '可以推荐哪些菜单？', a: '可以从韩餐（拌饭、杂菜、泡菜锅、辣炒年糕、五花肉、烤肉等）、日餐（寿司、炸猪排、乌冬面、拉面等）、西餐（牛排、意面、汉堡、披萨等）、中餐（炸酱面、海鲜面、麻辣烫等）、东南亚（泰式炒面、河粉、炒饭等）、墨西哥（玉米饼、卷饼等）、印度（咖喱、坦都里等）、中东（烤肉串、法拉费等）共200多种菜单中获得推荐。' },
            { q: '菜单推荐免费吗？', a: '是的，菜单推荐服务完全免费，无需注册或安装应用，直接在网页浏览器中使用。24小时随时无限次免费使用，支持18种语言，全球任何地方都可使用。' },
            { q: '下雨天吃什么？', a: '下雨天，葱饼、刀削面、面疙瘩、煎饼、海鲜饼、泡菜饼等温暖的传统食品很受欢迎。搭配米酒一起享用，更增添雨天的情趣。请查看上方"季节/天气菜单"部分，了解更多适合天气的菜单。' },
            { q: '一个人吃饭推荐什么？', a: '一个人吃饭时，拉面、紫菜包饭、盖饭、面条、三明治等按份点单方便的菜品是不错的选择。选择方便食用且营养丰富的菜单。请参考上方"场景推荐"中的独食类别获取更多建议。' },
            { q: '减肥期间推荐什么菜单？', a: '减肥期间推荐沙拉、鸡胸肉、波奇、魔芋等低卡高蛋白菜单。减少碳水化合物，以蔬菜和蛋白质为主的饮食有助于健康饮食。在"场景推荐"的减肥类别中查看更多创意。' },
            { q: '这个服务支持哪些语言？', a: '支持韩语、英语、日语、中文、西班牙语、法语、德语、葡萄牙语、意大利语、俄语、阿拉伯语、印地语、泰语、越南语、印尼语、土耳其语、波兰语、荷兰语共18种语言。在顶部的语言选择按钮中选择语言，菜单名称和整个界面将更改为该语言。' },
            { q: '选菜单有什么技巧吗？', a: '请考虑配送时间和烹饪时间。冷天适合温暖的汤类，热天适合清凉的沙拉或冷面。根据一起用餐的人选择合适的菜单，为了均衡饮食，选择含有蔬菜和蛋白质的菜单。利用我们的"场景推荐"和"季节/天气菜单"功能可以更容易做出决定。' }
        ]
    }
};

function updateFaqTranslations() {
    const lang = faqData[currentLanguage] || faqData['English'];
    const titleEl = document.getElementById('faq-title');
    if (titleEl) titleEl.textContent = lang.title;

    const items = document.querySelectorAll('.faq-item');
    items.forEach((item, index) => {
        if (!lang.items[index]) return;
        const qSpan = item.querySelector('summary span:first-child');
        if (qSpan) qSpan.textContent = lang.items[index].q;
        const aP = item.querySelector('div p');
        if (aP) aP.textContent = lang.items[index].a;
    });
}

// ============ MENU CATEGORIES GUIDE ============

const categoriesGuideData = {
    'English': {
        title: 'Menu Category Guide',
        desc: 'Explore diverse food cultures from around the world. Here are representative menus and features of each category.',
        cards: [
            { title: 'Korean Food', desc: 'Korean traditional cuisine features fermented foods and diverse side dishes. The deep flavors based on fermented seasonings like kimchi, doenjang, and gochujang are captivating. Representative dishes include bibimbap, bulgogi, braised ribs, and pork belly. It uses healthy ingredients and provides rich vegetable intake.' },
            { title: 'Japanese Food', desc: 'Japanese cuisine is characterized by bringing out the natural flavors of fresh ingredients. Popular dishes include sushi, sashimi, ramen, udon, tonkatsu, and tempura. It values seasonality and is loved worldwide for its clean, light flavors. Ramen in particular has unique regional styles, adding to its diversity.' },
            { title: 'Western Food', desc: 'Western cuisine offers diverse menus including steak, pasta, pizza, hamburgers, risotto, and salads. Rich flavors using olive oil, cheese, and butter are characteristic, ranging from casual dining to fine dining experiences.' },
            { title: 'Chinese Food', desc: 'Chinese cuisine has very diverse regional characteristics. Sichuan, Cantonese, Shanghai, and Beijing styles each have unique flavors and cooking methods. Popular Chinese dishes include jajangmyeon, jjamppong, malatang, sweet and sour pork, and kung pao chicken. Strong wok heat and diverse spice usage are characteristic.' },
            { title: 'Southeast Asian Food', desc: 'Southeast Asian cuisines from Thailand, Vietnam, Indonesia feature abundant use of spices and herbs. Representative dishes include pad thai, pho, nasi goreng, bun cha, and tom yum goong. The complex sweet-sour-spicy flavors are captivating. Ingredients like coconut milk, lime, and cilantro add unique flavors.' },
            { title: 'Other World Cuisines', desc: 'Explore Mexican tacos and burritos, Indian curry and tandoori chicken, Middle Eastern kebabs and falafel, and more. Each country\'s unique cooking methods, rooted in history and culture, offer new taste experiences. Try new foods by selecting various categories in our menu recommendation service.' }
        ]
    },
    'Korean': {
        title: '메뉴 카테고리 가이드',
        desc: '전 세계 다양한 음식 문화를 탐험해보세요. 각 카테고리별 대표 메뉴와 특징을 소개합니다.',
        cards: [
            { title: '한식 (Korean Food)', desc: '한국의 전통 음식은 발효 식품과 다양한 반찬이 특징입니다. 김치, 된장, 고추장 등 발효 양념을 기반으로 한 깊은 맛이 매력적이며, 비빔밥, 불고기, 갈비찜, 삼겹살 등이 대표 메뉴입니다. 건강에 좋은 식재료를 사용하며, 채소를 풍부하게 섭취할 수 있는 것이 장점입니다.' },
            { title: '일식 (Japanese Food)', desc: '일본 음식은 신선한 재료의 맛을 살리는 것이 특징입니다. 초밥, 사시미, 라멘, 우동, 돈카츠, 덴푸라 등이 인기 메뉴입니다. 계절감을 중시하며, 깔끔하고 담백한 맛으로 전 세계적으로 사랑받고 있습니다. 특히 라멘은 지역마다 독특한 스타일이 있어 그 다양성이 매력적입니다.' },
            { title: '양식 (Western Food)', desc: '서양 음식은 스테이크, 파스타, 피자, 햄버거, 리조또, 샐러드 등 다양한 메뉴가 있습니다. 올리브 오일, 치즈, 버터 등을 활용한 풍부한 맛이 특징이며, 가볍게 즐기는 캐주얼 다이닝부터 격식 있는 파인 다이닝까지 다양한 스타일로 즐길 수 있습니다.' },
            { title: '중식 (Chinese Food)', desc: '중국 음식은 지역별로 매우 다양한 특색을 가지고 있습니다. 사천, 광동, 상하이, 북경 스타일 등 각각 독특한 맛과 조리법이 있으며, 짜장면, 짬뽕, 마라탕, 탕수육, 깐풍기 등이 한국에서 인기 있는 중식 메뉴입니다. 강한 불 맛과 다양한 향신료 사용이 특징입니다.' },
            { title: '동남아 음식 (Southeast Asian)', desc: '태국, 베트남, 인도네시아 등 동남아시아 음식은 향신료와 허브를 풍부하게 사용하는 것이 특징입니다. 팟타이, 쌀국수(포), 나시고렝, 분짜, 똠양꿍 등이 대표 메뉴이며, 새콤달콤매콤한 복합적인 맛이 매력적입니다. 코코넛 밀크, 라임, 고수 등의 재료가 독특한 풍미를 더합니다.' },
            { title: '기타 세계 음식', desc: '멕시칸 음식의 타코와 부리또, 인도의 커리와 탄두리 치킨, 중동의 케밥과 팔라펠 등 전 세계 다양한 음식 문화를 탐험해보세요. 각 나라의 역사와 문화가 담긴 고유한 요리법은 새로운 맛의 경험을 선사합니다. 메뉴 추천 서비스에서 다양한 카테고리를 선택하여 새로운 음식에 도전해보세요.' }
        ]
    },
    'Japanese': {
        title: 'メニューカテゴリガイド',
        desc: '世界各国の多様な食文化を探検してみましょう。カテゴリ別の代表メニューと特徴を紹介します。',
        cards: [
            { title: '韓食 (Korean Food)', desc: '韓国の伝統料理は発酵食品と多様なおかずが特徴です。キムチ、テンジャン、コチュジャンなどの発酵調味料による深い味わいが魅力で、ビビンバ、プルコギ、カルビチム、サムギョプサルなどが代表メニューです。健康的な食材を使い、野菜を豊富に摂取できるのが長所です。' },
            { title: '和食 (Japanese Food)', desc: '日本料理は新鮮な食材の味を活かすのが特徴です。寿司、刺身、ラーメン、うどん、トンカツ、天ぷらなどが人気メニューです。季節感を重視し、さっぱりとした味わいで世界中から愛されています。特にラーメンは地域ごとに独特のスタイルがあり、その多様性が魅力です。' },
            { title: '洋食 (Western Food)', desc: '洋食はステーキ、パスタ、ピザ、ハンバーガー、リゾット、サラダなど多様なメニューがあります。オリーブオイル、チーズ、バターを活用した豊かな味わいが特徴で、カジュアルダイニングからファインダイニングまで様々なスタイルで楽しめます。' },
            { title: '中華 (Chinese Food)', desc: '中国料理は地域ごとに非常に多様な特色を持っています。四川、広東、上海、北京スタイルなどそれぞれ独特の味と調理法があり、ジャージャー麺、チャンポン、マーラータン、酢豚、カンプンギなどが人気の中華メニューです。強い火力と多様な香辛料の使用が特徴です。' },
            { title: '東南アジア料理 (Southeast Asian)', desc: 'タイ、ベトナム、インドネシアなど東南アジアの料理はスパイスとハーブを豊富に使うのが特徴です。パッタイ、フォー、ナシゴレン、ブンチャ、トムヤムクンなどが代表メニューで、甘酸っぱくて辛い複合的な味が魅力です。ココナッツミルク、ライム、パクチーなどが独特の風味を加えます。' },
            { title: 'その他の世界料理', desc: 'メキシカンのタコスとブリトー、インドのカレーとタンドリーチキン、中東のケバブとファラフェルなど、世界各国の多様な食文化を探検してみましょう。各国の歴史と文化が詰まった独自の調理法は新しい味の体験を提供します。メニュー推薦サービスで様々なカテゴリを選んで新しい料理に挑戦してみてください。' }
        ]
    },
    'Mandarin Chinese': {
        title: '菜单类别指南',
        desc: '探索世界各地多样的饮食文化。介绍各类别的代表菜单和特点。',
        cards: [
            { title: '韩餐 (Korean Food)', desc: '韩国传统饮食以发酵食品和丰富的小菜为特色。以泡菜、大酱、辣酱等发酵调料为基础的深厚风味令人着迷，拌饭、烤肉、炖排骨、五花肉等是代表菜品。使用健康食材，能丰富摄取蔬菜是其优点。' },
            { title: '日餐 (Japanese Food)', desc: '日本料理的特点是发挥新鲜食材的原味。寿司、刺身、拉面、乌冬面、炸猪排、天妇罗等是人气菜品。注重季节感，以清爽淡雅的口味在全世界广受喜爱。尤其拉面各地有独特风格，多样性令人着迷。' },
            { title: '西餐 (Western Food)', desc: '西餐有牛排、意面、披萨、汉堡、烩饭、沙拉等多样菜品。以橄榄油、奶酪、黄油打造的丰富口味为特色，从休闲餐饮到高档餐厅，可享受多种风格。' },
            { title: '中餐 (Chinese Food)', desc: '中国菜各地区有非常多样的特色。四川、广东、上海、北京风格各有独特的口味和烹饪方法，炸酱面、海鲜面、麻辣烫、糖醋肉、宫保鸡丁等是热门中餐菜品。猛火烹饪和多样香料使用是其特点。' },
            { title: '东南亚菜 (Southeast Asian)', desc: '泰国、越南、印尼等东南亚菜肴的特点是大量使用香料和草本。泰式炒面、河粉、炒饭、烤肉粉、冬荫功等是代表菜品，酸甜辣的复合口味令人着迷。椰奶、青柠、香菜等食材增添独特风味。' },
            { title: '其他世界美食', desc: '探索墨西哥的玉米饼和卷饼、印度的咖喱和坦都里鸡、中东的烤肉串和法拉费等世界各地多样的饮食文化。蕴含各国历史和文化的独特烹饪方法带来全新的味觉体验。在菜单推荐服务中选择各种类别，挑战新的美食吧。' }
        ]
    }
};

function updateCategoriesGuideTranslations() {
    const lang = categoriesGuideData[currentLanguage] || categoriesGuideData['English'];
    const titleEl = document.getElementById('categories-guide-title');
    const descEl = document.getElementById('categories-guide-desc');

    if (titleEl) titleEl.textContent = lang.title;
    if (descEl) descEl.textContent = lang.desc;

    const cards = document.querySelectorAll('.category-guide-card');
    cards.forEach((card, index) => {
        if (!lang.cards[index]) return;
        const h3 = card.querySelector('h3');
        if (h3) h3.textContent = lang.cards[index].title;
        const p = card.querySelector('p');
        if (p) p.textContent = lang.cards[index].desc;
    });
}

// ============ SIDEBAR TRANSLATIONS ============

const sidebarData = {
    'English': {
        slot: 'Slot Machine', recommend: "Today's Pick", bulletin: 'Community Board',
        discover: 'Discover', situation: 'By Situation', seasonal: 'Seasonal / Weather',
        popular: 'Popular Top 10', delivery: 'Delivery Guide',
        tools: 'Tools', calorie: 'Calorie Guide', faq: 'FAQ', planner: 'Meal Planner', lightPlanner: 'Free 7-Day Plan (Light)', contact: 'Partnership', authLogin: 'Log In'
    },
    'Korean': {
        slot: '슬롯머신', recommend: '오늘의 추천 메뉴', bulletin: '커뮤니티 게시판',
        discover: 'Discover', situation: '상황별 추천', seasonal: '계절/날씨별 메뉴',
        popular: '인기 메뉴 Top 10', delivery: '배달 메뉴 가이드',
        tools: 'Tools', calorie: '칼로리 가이드', faq: '자주 묻는 질문', planner: '식단 짜기', lightPlanner: '무료 7일 식단(라이트)', contact: '제휴 문의', authLogin: '로그인'
    },
    'Japanese': {
        slot: 'スロットマシン', recommend: '今日のおすすめ', bulletin: 'コミュニティ掲示板',
        discover: 'Discover', situation: 'シーン別おすすめ', seasonal: '季節・天気別メニュー',
        popular: '人気メニューTop 10', delivery: 'デリバリーガイド',
        tools: 'Tools', calorie: 'カロリーガイド', faq: 'よくある質問', planner: '食事プラン', lightPlanner: '無料7日プラン（ライト）', contact: '提携お問い合わせ', authLogin: 'ログイン'
    },
    'Mandarin Chinese': {
        slot: '老虎机', recommend: '今日推荐', bulletin: '社区留言板',
        discover: 'Discover', situation: '场景推荐', seasonal: '季节/天气菜单',
        popular: '热门菜单 Top 10', delivery: '外卖指南',
        tools: 'Tools', calorie: '卡路里指南', faq: '常见问题', planner: '饮食计划', lightPlanner: '免费7天计划（轻量）', contact: '合作咨询', authLogin: '登录'
    }
};

function updateSidebarTranslations() {
    const lang = sidebarData[currentLanguage] || sidebarData['English'];
    const keys = ['slot', 'recommend', 'bulletin', 'discover', 'situation', 'seasonal', 'popular', 'delivery', 'tools', 'calorie', 'faq', 'planner', 'lightPlanner', 'contact'];
    keys.forEach(key => {
        const normalizedKey = key === 'lightPlanner' ? 'light-planner' : key;
        const desktop = document.getElementById('sidebar-' + normalizedKey);
        if (desktop) desktop.textContent = lang[key];
        const mobile = document.getElementById('mobile-sidebar-' + normalizedKey);
        if (mobile) mobile.textContent = lang[key];
    });
    if (!sidebarSupabaseUser) {
        const desktopAuthLabel = document.getElementById('sidebar-auth-label');
        const mobileAuthLabel = document.getElementById('mobile-sidebar-auth-label');
        if (desktopAuthLabel) desktopAuthLabel.textContent = lang.authLogin || 'Log In';
        if (mobileAuthLabel) mobileAuthLabel.textContent = lang.authLogin || 'Log In';
    } else {
        updateSidebarAuthCta(sidebarSupabaseUser);
    }
}

// ============ GAME TAB TRANSLATIONS ============

const gameTabData = {
    'English': { slot: 'Slot Machine', recommend: "Today's Pick" },
    'Korean': { slot: '슬롯머신', recommend: '오늘의 추천 메뉴' },
    'Japanese': { slot: 'スロットマシン', recommend: '今日のおすすめメニュー' },
    'Mandarin Chinese': { slot: '老虎机', recommend: '今日推荐菜单' }
};

function updateGameTabTranslations() {
    const lang = gameTabData[currentLanguage] || gameTabData['English'];
    const slotBtn = document.getElementById('tab-btn-slot');
    if (slotBtn) slotBtn.textContent = lang.slot;
    const recBtn = document.getElementById('tab-btn-recommend');
    if (recBtn) recBtn.textContent = lang.recommend;
}

// ============ FOOTER TRANSLATIONS ============

const footerData = {
    'English': {
        tagline: 'Making your daily meal decisions<br/>more fun and delicious.',
        serviceTitle: 'Service',
        homeLink: 'Home',
        aboutLink: 'About Us',
        guideLink: 'User Guide',
        plannerLink: 'Meal Planner',
        slotLink: 'Slot Machine',
        supportTitle: 'Support',
        helpLink: 'Help Center',
        contactLink: 'Partnership',
        accountLink: 'Sign In / Register',
        faqLink: 'FAQ',
        legalTitle: 'Legal',
        privacyLink: 'Privacy Policy',
        termsLink: 'Terms of Service',
        refundLink: 'Refund Policy',
        cookiesLink: 'Cookie Policy'
    },
    'Korean': {
        tagline: '매일 반복되는 결정의 순간을<br/>더 즐겁고 맛있게 만들어 드립니다.',
        serviceTitle: '서비스',
        homeLink: '홈으로',
        aboutLink: '브랜드 소개',
        guideLink: '이용 가이드',
        plannerLink: '식단 짜기',
        slotLink: '슬롯 머신',
        supportTitle: '고객 지원',
        helpLink: '도움말 센터',
        contactLink: '제휴 문의',
        accountLink: '회원가입/로그인',
        faqLink: 'FAQ',
        legalTitle: '법적 고지',
        privacyLink: '개인정보처리방침',
        termsLink: '이용약관',
        refundLink: '환불 정책',
        cookiesLink: '쿠키 정책'
    },
    'Japanese': {
        tagline: '毎日繰り返される食事の決断を<br/>もっと楽しく美味しくします。',
        serviceTitle: 'サービス',
        homeLink: 'ホーム',
        aboutLink: 'ブランド紹介',
        guideLink: 'ご利用ガイド',
        plannerLink: '食事プラン',
        slotLink: 'スロットマシン',
        supportTitle: 'サポート',
        helpLink: 'ヘルプセンター',
        contactLink: '提携お問い合わせ',
        accountLink: '会員登録 / ログイン',
        faqLink: 'FAQ',
        legalTitle: '法的情報',
        privacyLink: 'プライバシーポリシー',
        termsLink: '利用規約',
        refundLink: '返金ポリシー',
        cookiesLink: 'クッキーポリシー'
    },
    'Mandarin Chinese': {
        tagline: '让每天重复的用餐决定<br/>变得更有趣、更美味。',
        serviceTitle: '服务',
        homeLink: '首页',
        aboutLink: '品牌介绍',
        guideLink: '使用指南',
        plannerLink: '饮食计划',
        slotLink: '老虎机',
        supportTitle: '客户支持',
        helpLink: '帮助中心',
        contactLink: '合作咨询',
        accountLink: '注册 / 登录',
        faqLink: 'FAQ',
        legalTitle: '法律声明',
        privacyLink: '隐私政策',
        termsLink: '服务条款',
        refundLink: '退款政策',
        cookiesLink: 'Cookie政策'
    }
};

function updateFooterTranslations() {
    const lang = footerData[currentLanguage] || footerData['English'];

    const tagline = document.getElementById('footer-tagline');
    if (tagline) tagline.innerHTML = lang.tagline;

    const serviceTitle = document.getElementById('footer-service-title');
    if (serviceTitle) serviceTitle.textContent = lang.serviceTitle;

    const homeLink = document.getElementById('footer-home-link');
    if (homeLink) homeLink.textContent = lang.homeLink;

    const guideLink = document.getElementById('guide-link');
    if (guideLink) guideLink.textContent = lang.guideLink;

    const plannerLink = document.getElementById('footer-planner-link');
    if (plannerLink) plannerLink.textContent = lang.plannerLink;

    const slotLink = document.getElementById('footer-slot-link');
    if (slotLink) slotLink.textContent = lang.slotLink;

    const supportTitle = document.getElementById('footer-support-title');
    if (supportTitle) supportTitle.textContent = lang.supportTitle;

    const helpLink = document.getElementById('footer-help-link');
    if (helpLink) helpLink.textContent = lang.helpLink;

    const contactLink = document.getElementById('footer-contact-link');
    if (contactLink) contactLink.textContent = lang.contactLink;

    const accountLink = document.getElementById('footer-account-link');
    if (accountLink) accountLink.textContent = lang.accountLink;

    const faqLink = document.getElementById('footer-faq-link');
    if (faqLink) faqLink.textContent = lang.faqLink;

    const legalTitle = document.getElementById('footer-legal-title');
    if (legalTitle) legalTitle.textContent = lang.legalTitle;

    const refundLink = document.getElementById('refund-link');
    if (refundLink) refundLink.textContent = lang.refundLink;

    const cookiesLink = document.getElementById('footer-cookies-link');
    if (cookiesLink) cookiesLink.textContent = lang.cookiesLink;
}

async function loadBulletinInclude() {
    const container = document.getElementById('bulletin-container');
    if (!container) return;
    const includePath = container.dataset.include || 'pages/bulletin.html';

    try {
        const response = await fetch(includePath, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Failed to load ${includePath}`);
        container.innerHTML = await response.text();
        initBulletinBoard();
        updateBulletinTranslations();
    } catch (error) {
        console.error('Bulletin include load error:', error);
        container.innerHTML = '<p class="bulletin-loading">게시판을 불러오지 못했습니다.</p>';
    }
}

// Initialize in sequence to avoid first-paint language/theme text flicker.
(async () => {
    applyFeatureFlagUi();
    initDiscoverExperience();

    // Must run before initLanguageSelector because applyTranslations calls renderSlotReels.
    if (slotReel1) {
        buildSlotMenus();
    }

    // applyTranslations runs inside initLanguageSelector after language resolution.
    await initLanguageSelector();

    initMemberAuth();
    await initSidebarAuth();
    await refreshDietProfileContext({ preferCacheOnly: false });
    initShareButtons();
    await loadBulletinInclude();
})();
