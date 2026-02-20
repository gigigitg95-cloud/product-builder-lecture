(() => {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  function readLocalFlags() {
    try {
      const raw = localStorage.getItem('ninanoo.featureFlags.v1');
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function isFlagEnabled(flagName) {
    if (window.NinanooFlags && typeof window.NinanooFlags.isEnabled === 'function') {
      return window.NinanooFlags.isEnabled(flagName);
    }
    const local = readLocalFlags();
    if (typeof local[flagName] === 'boolean') return local[flagName];
    return true;
  }

  const currentKey = (mount.dataset.footerCurrent || '').trim();
  const keyToPath = {
    index: '/index.html',
    about: '/pages/about.html',
    guide: '/pages/guide.html',
    planner: '/pages/report-intake.html',
    styler: '/pages/profile-styler.html',
    privacy: '/pages/privacy.html',
    terms: '/pages/terms.html',
    refund: '/pages/refund.html',
    auth: '/pages/auth.html',
    signup: '/pages/signup.html',
    mypage: '/pages/mypage.html',
    cookies: '/pages/cookies.html',
    contact: '/pages/contact.html',
    faq: '/pages/faq.html',
    help: '/pages/help.html'
  };

  const currentPath = keyToPath[currentKey] || window.location.pathname;

  fetch('/pages/footer.html')
    .then((response) => {
      if (!response.ok) throw new Error(`Footer load failed: ${response.status}`);
      return response.text();
    })
    .then((html) => {
      mount.innerHTML = html;
      const links = mount.querySelectorAll('a[href]');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
          link.classList.add('text-brand-purple', 'font-semibold');
          link.setAttribute('aria-current', 'page');
        }
      });
      // Apply footer translations after load
      if (typeof updateFooterTranslations === 'function') {
        updateFooterTranslations();
      }
      if (typeof applyTranslations === 'function') {
        applyTranslations();
      }

      if (!isFlagEnabled('aiFoodEnhance')) {
        const foodLink = mount.querySelector('#footer-food-enhance-link');
        const listItem = foodLink ? foodLink.closest('li') : null;
        if (listItem) {
          listItem.classList.add('hidden');
          listItem.setAttribute('hidden', 'hidden');
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
})();
