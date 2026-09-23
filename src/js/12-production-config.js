// Production configuration: verified social links, domain email and conversion events.
// Empty GitHub/LinkedIn/domain-email values stay hidden rather than publishing invented profiles.
(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const social = cfg.social || {};
  document.querySelectorAll('[data-profile-age]').forEach(el => { el.textContent = String(cfg.profile?.age ?? 16); });
  document.querySelectorAll('[data-social]').forEach(node => {
    const a = /** @type {HTMLAnchorElement} */ (node);
    const key = a.dataset.social;
    const url = social[key];
    if (url) {
      a.href = url;
      a.hidden = false;
    } else {
      a.hidden = true;
      a.removeAttribute('href');
    }
  });
  document.querySelectorAll('[data-contact]').forEach(node => {
    const a = /** @type {HTMLAnchorElement} */ (node);
    const key = a.dataset.contact;
    const url = cfg.contact?.[key];
    if (url) { a.href = url; a.hidden = false; }
    else { a.hidden = true; a.removeAttribute('href'); }
  });
  document.querySelectorAll('[data-site-url]').forEach(node => {
    const a = /** @type {HTMLAnchorElement} */ (node);
    const url = cfg.siteUrl || location.origin;
    a.href = url;
    try { a.textContent = new URL(url).host; } catch { a.textContent = url; }
  });

  if (cfg.contact?.domainEmail) {
    document.querySelectorAll('a[href^="mailto:ibronovnajib@gmail.com"]').forEach(node => {
      const a = /** @type {HTMLAnchorElement} */ (node);
      a.href = `mailto:${cfg.contact.domainEmail}`;
    });
  }

  document.addEventListener('click', e => {
    const target = e.target instanceof Element ? e.target : null;
    const link = /** @type {HTMLElement|null} */ (target?.closest('a,button') || null);
    if (!link || !window.trackPortfolioEvent) return;
    if (link.matches('[href*="Najibullo-CV.pdf"]')) window.trackPortfolioEvent('resume_download');
    else if (link.classList.contains('case-trigger')) window.trackPortfolioEvent('case_study_open', {product:link.dataset.case || ''});
    else if (link.classList.contains('external-launch')) window.trackPortfolioEvent('product_visit', {url:link instanceof HTMLAnchorElement ? link.href : ''});
    else if (link.closest('.contact-quick')) window.trackPortfolioEvent('contact_click', {channel:(link.textContent || '').trim()});
  });
})();

