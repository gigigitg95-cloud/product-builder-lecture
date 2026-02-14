(() => {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  const currentKey = (mount.dataset.footerCurrent || '').trim();
  const keyToPath = {
    index: '/index.html',
    about: '/pages/about.html',
    guide: '/pages/guide.html',
    privacy: '/pages/privacy.html',
    terms: '/pages/terms.html',
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
    })
    .catch((error) => {
      console.error(error);
    });
})();
