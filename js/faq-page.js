(() => {
    const languageAliasMap = {
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
        it: 'Italian',
        nl: 'Dutch',
        pl: 'Polish',
        tr: 'Turkish'
    };

    const faqItems = [
        { category: 'accuracy', q: 'faqItem01Q', a: 'faqItem01A' },
        { category: 'accuracy', q: 'faqItem02Q', a: 'faqItem02A' },
        { category: 'accuracy', q: 'faqItem03Q', a: 'faqItem03A' },
        { category: 'accuracy', q: 'faqItem04Q', a: 'faqItem04A' },
        { category: 'health', q: 'faqItem05Q', a: 'faqItem05A' },
        { category: 'health', q: 'faqItem06Q', a: 'faqItem06A' },
        { category: 'health', q: 'faqItem07Q', a: 'faqItem07A' },
        { category: 'health', q: 'faqItem08Q', a: 'faqItem08A' },
        { category: 'share', q: 'faqItem09Q', a: 'faqItem09A' },
        { category: 'share', q: 'faqItem10Q', a: 'faqItem10A' },
        { category: 'share', q: 'faqItem11Q', a: 'faqItem11A' },
        { category: 'share', q: 'faqItem12Q', a: 'faqItem12A' },
        { category: 'premium', q: 'faqItem13Q', a: 'faqItem13A' },
        { category: 'premium', q: 'faqItem14Q', a: 'faqItem14A' },
        { category: 'premium', q: 'faqItem15Q', a: 'faqItem15A' },
        { category: 'premium', q: 'faqItem16Q', a: 'faqItem16A' },
        { category: 'account', q: 'faqItem17Q', a: 'faqItem17A' },
        { category: 'account', q: 'faqItem18Q', a: 'faqItem18A' },
        { category: 'account', q: 'faqItem19Q', a: 'faqItem19A' },
        { category: 'account', q: 'faqItem20Q', a: 'faqItem20A' }
    ];

    const footerData = {
        English: {
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
        Korean: {
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
        }
    };

    const categoryStorageKey = 'faqCategoryFilter';
    let currentLanguage = 'English';
    let activeCategory = localStorage.getItem(categoryStorageKey) || 'all';
    let lastRenderedCategory = null;

    function resolveLanguage() {
        const params = new URLSearchParams(window.location.search);
        const langParam = (params.get('lang') || '').trim();
        const saved = (localStorage.getItem('selectedLanguage') || '').trim();

        const candidates = [langParam, languageAliasMap[langParam.toLowerCase()], saved, 'English'];
        for (const candidate of candidates) {
            if (candidate && translations[candidate]) return candidate;
        }
        return 'English';
    }

    function getTranslation(key) {
        const lang = translations[currentLanguage] || translations.English;
        return lang[key] || translations.English[key] || key;
    }

    function applyBasicTranslations() {
        const i18nNodes = document.querySelectorAll('[data-i18n]');
        i18nNodes.forEach((node) => {
            const key = node.dataset.i18n;
            if (!key) return;
            const value = getTranslation(key);
            if (value.includes('<') && value.includes('>')) node.innerHTML = value;
            else node.textContent = value;
        });
        document.documentElement.lang = currentLanguage === 'Korean' ? 'ko' : 'en';
        document.title = getTranslation('faqMetaTitle');
    }

    function buildFaqCard(item, index) {
        const details = document.createElement('details');
        details.className = 'bg-white dark:bg-brand-cardDark rounded-2xl border border-slate-100 dark:border-slate-700 p-5';
        if (index === 0) details.open = true;

        const summary = document.createElement('summary');
        summary.className = 'font-bold text-slate-900 dark:text-white cursor-pointer';
        summary.textContent = getTranslation(item.q);
        details.appendChild(summary);

        const answer = document.createElement('p');
        answer.className = 'mt-3 text-slate-600 dark:text-slate-300';
        answer.textContent = getTranslation(item.a);
        details.appendChild(answer);
        return details;
    }

    function renderFaqItems(force = false) {
        if (!force && lastRenderedCategory === activeCategory) return;
        const container = document.getElementById('faq-items');
        if (!container) return;

        const filtered = activeCategory === 'all'
            ? faqItems
            : faqItems.filter((item) => item.category === activeCategory);

        const fragment = document.createDocumentFragment();
        filtered.forEach((item, index) => fragment.appendChild(buildFaqCard(item, index)));
        container.replaceChildren(fragment);
        lastRenderedCategory = activeCategory;
    }

    function updateCategoryButtons() {
        const buttons = document.querySelectorAll('.faq-category-btn');
        buttons.forEach((button) => {
            const category = button.dataset.category;
            const isActive = category === activeCategory;
            button.setAttribute('aria-pressed', String(isActive));
            button.setAttribute('aria-selected', String(isActive));
            button.setAttribute('role', 'tab');
            button.classList.toggle('bg-brand-purple', isActive);
            button.classList.toggle('text-white', isActive);
            button.classList.toggle('border-brand-purple', isActive);
        });
    }

    function bindCategoryEvents() {
        const nav = document.getElementById('faq-category-nav');
        if (!nav) return;
        nav.addEventListener('click', (event) => {
            const target = event.target.closest('.faq-category-btn');
            if (!target) return;
            const next = target.dataset.category || 'all';
            if (next === activeCategory) return;
            activeCategory = next;
            localStorage.setItem(categoryStorageKey, activeCategory);
            updateCategoryButtons();
            renderFaqItems(true);
        });
    }

    function updateFooterTranslations() {
        const lang = footerData[currentLanguage] || footerData.English;
        const mappings = [
            ['footer-tagline', 'tagline', true],
            ['footer-service-title', 'serviceTitle'],
            ['footer-home-link', 'homeLink'],
            ['about-link', 'aboutLink'],
            ['guide-link', 'guideLink'],
            ['footer-planner-link', 'plannerLink'],
            ['footer-slot-link', 'slotLink'],
            ['footer-support-title', 'supportTitle'],
            ['footer-help-link', 'helpLink'],
            ['footer-contact-link', 'contactLink'],
            ['footer-account-link', 'accountLink'],
            ['footer-faq-link', 'faqLink'],
            ['footer-legal-title', 'legalTitle'],
            ['privacy-link', 'privacyLink'],
            ['terms-link', 'termsLink'],
            ['refund-link', 'refundLink'],
            ['footer-cookies-link', 'cookiesLink']
        ];

        mappings.forEach(([id, key, isHtml]) => {
            const node = document.getElementById(id);
            if (!node) return;
            if (isHtml) node.innerHTML = lang[key];
            else node.textContent = lang[key];
        });

        const footerCopy = document.getElementById('footer-copy');
        if (footerCopy) footerCopy.textContent = getTranslation('footer');
        const footerLang = document.getElementById('footer-lang');
        if (footerLang) footerLang.textContent = currentLanguage;
    }

    function applyTranslations() {
        applyBasicTranslations();
        updateCategoryButtons();
        renderFaqItems(true);
        updateFooterTranslations();
    }

    document.addEventListener('DOMContentLoaded', () => {
        currentLanguage = resolveLanguage();
        localStorage.setItem('selectedLanguage', currentLanguage);
        bindCategoryEvents();
        applyTranslations();
    });

    window.applyTranslations = applyTranslations;
    window.updateFooterTranslations = updateFooterTranslations;
})();
