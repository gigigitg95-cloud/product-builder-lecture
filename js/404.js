(function() {
    var translations = {
        Korean: { title: '페이지를 찾을 수 없습니다', desc: '요청하신 페이지가 존재하지 않거나 이동되었습니다. 아래 링크를 통해 원하시는 페이지로 이동해 주세요.', home: '\u{1F3E0} 홈으로 가기', about: '\u2139\uFE0F 서비스 소개' },
        English: { title: 'Page Not Found', desc: 'The page you are looking for does not exist or has been moved. Please use the links below to navigate.', home: '\u{1F3E0} Go Home', about: '\u2139\uFE0F About Us' },
        Japanese: { title: 'ページが見つかりません', desc: 'お探しのページは存在しないか、移動された可能性があります。以下のリンクからお進みください。', home: '\u{1F3E0} ホームへ', about: '\u2139\uFE0F サービス紹介' },
        Chinese: { title: '页面未找到', desc: '您访问的页面不存在或已被移动。请使用以下链接导航。', home: '\u{1F3E0} 返回首页', about: '\u2139\uFE0F 关于我们' },
        Spanish: { title: 'Página no encontrada', desc: 'La página que busca no existe o ha sido movida. Use los enlaces a continuación.', home: '\u{1F3E0} Ir al inicio', about: '\u2139\uFE0F Sobre nosotros' }
    };
    var lang = localStorage.getItem('selectedLanguage') || 'English';
    var t = translations[lang] || translations['English'];
    document.getElementById('error-title').textContent = t.title;
    document.getElementById('error-desc').textContent = t.desc;
    document.getElementById('home-link').innerHTML = t.home;
    document.getElementById('about-link').innerHTML = t.about;
})();
