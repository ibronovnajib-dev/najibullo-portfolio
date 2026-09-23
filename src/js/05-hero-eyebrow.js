// Signature detail — the hero eyebrow line decodes into place rather than
// simply fading in. Cheap (one small element, short-lived rAF loop), and it
// re-runs on language switch so the effect is not a one-time novelty.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.querySelector('.eyebrow[data-i18n]');
  if (!el || reduce) return;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ×•∆◆'.split('');
  let running = false;
  const scramble = (finalText, duration = 620) => {
    if (!finalText || running) return;
    running = true;
    const len = finalText.length;
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / duration);
      let out = '';
      for (let i = 0; i < len; i++) {
        const ch = finalText[i];
        if (ch === ' ') { out += ' '; continue; }
        const charDone = (p * len - i) / 2.4 >= 1;
        out += charDone ? ch : glyphs[(Math.random() * glyphs.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
      else { el.textContent = finalText; running = false; }
    };
    requestAnimationFrame(step);
  };
  const original = el.textContent.trim();
  setTimeout(() => scramble(original), 380);
  document.addEventListener('portfolio:languagechange', e => {
    const next = window.PortfolioI18n?.t ? window.PortfolioI18n.t('hero.eyebrow') : el.textContent.trim();
    setTimeout(() => scramble((next || el.textContent).trim()), 40);
  });
})();

