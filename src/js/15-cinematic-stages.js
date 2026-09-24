// @ts-check
// Five-stage cinematic direction layered on top of the existing reveal system.
// Transform/opacity work is intentionally GPU-friendly and gated by viewport,
// input type and reduced-motion preferences.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 760px)').matches;
  const doc = document.documentElement;

  /** @param {string} selector @param {ParentNode} [root] */
  const q = (selector, root=document) => root.querySelector(selector);
  /** @param {string} selector @param {ParentNode} [root] */
  const qa = (selector, root=document) => [...root.querySelectorAll(selector)];

  /** @typedef {{el:Element, dir?:string, order?:number, depth?:string}} Target */
  /** @param {Element|null} el @param {string} dir @param {number} order @param {string} [depth] */
  const mark = (el, dir, order, depth='normal') => {
    if (!el) return;
    el.classList.add('cine-item', `cine-${dir}`);
    el.setAttribute('data-cine-order', String(order));
    el.setAttribute('data-cine-depth', depth);
    if (el instanceof HTMLElement) el.style.setProperty('--cine-order', String(order));
  };

  /** @param {Element|null} section @param {string} stage @param {(s:Element)=>void} decorate */
  const setupStage = (section, stage, decorate) => {
    if (!section) return;
    section.classList.add('cinematic-stage', `cinematic-stage--${stage}`);
    section.setAttribute('data-cinematic-stage', stage);
    decorate(section);
  };

  // 01 — ENTER. Hero runs on page load and feels like an opening title sequence.
  const hero = q('.hero');
  if (hero) {
    hero.classList.add('cinematic-stage', 'cinematic-stage--enter');
    mark(q('.status-pill', hero), 'left', 1);
    mark(q('.eyebrow', hero), 'right', 2);
    qa('.hero-title .line', hero).forEach((el, i) => mark(el, i % 2 ? 'right' : 'up', 3 + i, 'hero'));
    mark(q('.hero__lead', hero), 'up', 7);
    qa('.hero__actions .pill', hero).forEach((el, i) => mark(el, i ? 'right' : 'left', 8 + i));
    qa('.hero__metrics > div', hero).forEach((el, i) => mark(el, i % 2 ? 'down' : 'up', 10 + i));
    mark(q('.hero__credential', hero), 'scale', 13);
    hero.classList.add('cinematic-armed');
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('cinematic-in')));
  }

  // 02 — WHO YOU ARE. About + capabilities share an editorial portrait language.
  setupStage(q('#about'), 'identity', section => {
    mark(q('.section-label', section), 'left', 0);
    mark(q('.about-copy h2', section), 'left', 1, 'headline');
    qa('.about-copy p', section).forEach((el, i) => mark(el, 'up', 2 + i));
    mark(q('.about-copy .pill', section), 'scale', 4);
    mark(q('.about-portrait img', section), 'right', 1, 'image');
    mark(q('.signature', section), 'scale', 4);
    qa('.values > div', section).forEach((el, i) => mark(el, i % 2 ? 'right' : 'left', 5 + i));
    mark(q('.about-landscape__image', section), 'up', 7, 'image');
    mark(q('.about-landscape blockquote', section), 'left', 8);
  });
  setupStage(q('#capabilities'), 'identity', section => {
    mark(q('.capabilities-head h2', section), 'left', 0, 'headline');
    mark(q('.capabilities-head p', section), 'right', 1);
    qa('.capability-card', section).forEach((el, i) => mark(el, ['left','up','down','right'][i] || 'up', 2 + i));
    mark(q('.delivery-big', section), 'scale', 7);
    mark(q('.delivery-copy', section), 'left', 8);
    qa('.delivery-proof > div', section).forEach((el, i) => mark(el, 'up', 9 + i));
  });

  // 03 — WHAT YOU BUILT / PROOF. Alternating horizontal product reveals.
  setupStage(q('#projects'), 'products', section => {
    mark(q('.section-head h2', section), 'left', 0, 'headline');
    mark(q('.section-head__right', section), 'right', 1);
    qa('.project-card', section).forEach((card, i) => {
      mark(card, i % 2 ? 'right' : 'left', 2 + i, 'card');
      mark(q('.project-card__top', card), i % 2 ? 'left' : 'right', 3 + i);
      mark(q('.project-desc', card), 'up', 4 + i);
      mark(q('.project-visual', card), i % 2 ? 'left' : 'right', 5 + i, 'image');
      qa('.project-stats > div', card).forEach((el, j) => mark(el, 'up', 6 + i + j));
    });
  });
  setupStage(q('#product-proof'), 'products', section => {
    mark(q('.proof-head h2', section), 'left', 0, 'headline');
    mark(q('.proof-copy', section), 'right', 1);
    qa('.proof-card', section).forEach((el, i) => mark(el, ['left','up','right','up'][i] || 'up', 2 + i, 'card'));
  });
  setupStage(q('#demo-lab'), 'products', section => {
    mark(q('.demo-lab__head h2', section), 'left', 0, 'headline');
    mark(q('.demo-lab__head p', section), 'right', 1);
    qa('.demo-stage', section).forEach((el, i) => mark(el, i % 2 ? 'right' : 'left', 2 + i, 'card'));
  });

  // 04 — HOW YOU BUILD IT. A sequential architecture / process rhythm.
  setupStage(q('#process'), 'process', section => {
    mark(q('.process-title .section-label', section), 'left', 0);
    mark(q('.process-title h2', section), 'up', 1, 'headline');
    qa('.process-step', section).forEach((el, i) => mark(el, i % 2 ? 'right' : 'left', 2 + i, 'card'));
  });
  setupStage(q('#tech-stack'), 'process', section => {
    mark(q('.system-map__head h2', section), 'left', 0, 'headline');
    mark(q('.system-map__head p', section), 'right', 1);
    qa('.system-node', section).forEach((el, i) => mark(el, i % 2 ? 'down' : 'up', 2 + i));
    mark(q('.tech-quote', section), 'scale', 8);
  });
  setupStage(q('#atelier'), 'process', section => {
    mark(q('.atelier__intro h2', section), 'left', 0, 'headline');
    mark(q('.atelier__intro p', section), 'up', 1);
    mark(q('.atelier__cta', section), 'scale', 2);
    qa('.atelier-card', section).forEach((el, i) => mark(el, ['left','up','right'][i] || 'up', 3 + i, 'card'));
    mark(q('.atelier__seal', section), 'scale', 7);
  });

  // 05 — CONTACT. Copy arrives from the left, form from the right, signature from below.
  setupStage(q('#contact'), 'contact', section => {
    mark(q('.contact-copy .section-label', section), 'left', 0);
    mark(q('.contact-copy h2', section), 'left', 1, 'headline');
    mark(q('.contact-copy > p', section), 'up', 2);
    mark(q('.contact-quick', section), 'left', 3);
    mark(q('.contact-form', section), 'right', 2, 'card');
    qa('.contact-form label:not(.contact-hp)', section).forEach((el, i) => mark(el, 'up', 3 + i));
    mark(q('.contact-form__bottom', section), 'scale', 8);
    mark(q('.contact-signature', section), 'up', 9);
  });

  // Testimonials act as proof inside stage 03 if present.
  setupStage(q('#testimonials'), 'products', section => {
    mark(q('h2', section), 'left', 0, 'headline');
    qa('.testimonial-card', section).forEach((el, i) => mark(el, i % 2 ? 'right' : 'left', 1 + i, 'card'));
  });

  if (reduce) {
    doc.classList.add('cinematic-reduced');
    qa('.cinematic-stage').forEach(section => section.classList.add('cinematic-in'));
    return;
  }

  // Arm only after all targets are decorated so content never flashes hidden.
  qa('.cinematic-stage:not(.cinematic-stage--enter)').forEach(section => section.classList.add('cinematic-armed'));
  doc.classList.add('cinematic-ready');

  if (!('IntersectionObserver' in window)) {
    qa('.cinematic-stage').forEach(section => section.classList.add('cinematic-in'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const section = /** @type {HTMLElement} */ (entry.target);
      section.classList.add('cinematic-in');
      section.dispatchEvent(new CustomEvent('portfolio:cinematicstage', {bubbles:true, detail:{stage:section.dataset.cinematicStage || 'section'}}));
      observer.unobserve(section);
    }
  }, {
    threshold: mobile ? 0.08 : 0.14,
    rootMargin: mobile ? '0px 0px -5% 0px' : '0px 0px -10% 0px'
  });

  qa('.cinematic-stage:not(.cinematic-stage--enter)').forEach(section => observer.observe(section));
})();
