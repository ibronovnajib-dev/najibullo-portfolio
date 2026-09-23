// Toast + copy-on-click for email links — clicking still opens the visitor's
// mail app as normal (mailto: is untouched), but the address is also copied
// to the clipboard as a convenience, confirmed with a small transient toast.
(() => {
  let toastEl = null;
  let hideTimer = null;
  const showToast = (msg) => {
    if (!msg) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(() => toastEl.classList.add('is-visible'));
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  };

  const t = (key, fallback) => window.PortfolioI18n?.t ? window.PortfolioI18n.t(key) : fallback;

  document.querySelectorAll('a[href^="mailto:"]').forEach(node => {
    const link = /** @type {HTMLAnchorElement} */ (node);
    link.addEventListener('click', () => {
      const email = link.href.replace(/^mailto:/, '').split('?')[0];
      if (!email || !navigator.clipboard?.writeText) return;
      navigator.clipboard.writeText(decodeURIComponent(email)).then(() => {
        showToast(t('toast.emailCopied', 'Email copied to clipboard'));
      }).catch(() => {});
    });
  });
})();

