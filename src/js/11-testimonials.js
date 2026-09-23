// Verified testimonials — loaded from assets/testimonials.json.
// The section stays hidden while the verified array is empty. This guarantees
// the public portfolio never displays placeholder or invented praise.
(() => {
  const section = document.getElementById('testimonials');
  const track = document.getElementById('testimonials-track');
  if (!section || !track) return;
  let items = [];

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const initials = (name) => (name || '?').trim().split(/\s+/).slice(0,2).map(w => w[0]?.toUpperCase() || '').join('');
  const pick = (value, lang) => typeof value === 'object' && value ? (value[lang] || value.en || Object.values(value)[0] || '') : (value || '');

  const render = () => {
    const lang = document.documentElement.lang || 'en';
    if (!items.length) {
      const title = esc(window.PortfolioI18n?.t?.('testimonials.emptyTitle') || 'Verified proof only.');
      const text = esc(window.PortfolioI18n?.t?.('testimonials.emptyText') || 'No invented testimonials are shown. Use the live products, real screens and GitHub profile as evidence.');
      const github = esc(window.PORTFOLIO_CONFIG?.social?.github || 'https://github.com/ibronovnajib-dev');
      track.innerHTML = `<article class="testimonial-card testimonial-card--proof" role="listitem"><span class="testimonial-card__quote" aria-hidden="true">✓</span><p class="testimonial-card__text"><strong>${title}</strong><br>${text}</p><div class="testimonial-card__role"><a href="${github}" rel="noopener" target="_blank">GitHub ↗</a> · <a href="https://ustohona.tj" rel="noopener" target="_blank">Ustohona.tj ↗</a> · <a href="https://tajlife.tj" rel="noopener" target="_blank">TajLife.tj ↗</a></div></article>`;
      section.hidden = false;
      return;
    }
    track.innerHTML = items.map(item => {
      const rating = Number(item.rating) || 0;
      const stars = rating ? `<div class="testimonial-card__stars" aria-label="${Math.max(1,Math.min(5,rating))}/5">${'★'.repeat(Math.max(0,Math.min(5,rating)))}${'☆'.repeat(5-Math.max(0,Math.min(5,rating)))}</div>` : '';
      const roleText = esc(pick(item.role, lang));
      const role = item.link ? `<div class="testimonial-card__role"><a href="${esc(item.link)}" rel="noopener" target="_blank">${roleText}</a></div>` : (roleText ? `<div class="testimonial-card__role">${roleText}</div>` : '');
      return `<article class="testimonial-card" role="listitem"><span aria-hidden="true" class="testimonial-card__quote">”</span>${stars}<p class="testimonial-card__text">${esc(pick(item.quote, lang))}</p><div class="testimonial-card__person"><span class="testimonial-card__avatar" aria-hidden="true">${esc(initials(item.name))}</span><div><div class="testimonial-card__name">${esc(item.name)}</div>${role}</div></div></article>`;
    }).join('');
    section.hidden = false;
  };

  fetch('./assets/testimonials.json', {cache:'no-store'})
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => { items = Array.isArray(data?.verified) ? data.verified.filter(x => x && x.name && x.quote) : []; render(); })
    .catch(() => { items = []; render(); });
  document.addEventListener('portfolio:languagechange', render);
})();


