// Expert motion direction — restrained luxury, transform/opacity first
(() => {
  /** @param {string} s @param {ParentNode} [p] */
  const q = (s, p=document) => p.querySelector(s);
  /** @param {string} s @param {ParentNode} [p] */
  const qa = (s, p=document) => [...p.querySelectorAll(s)];
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const coarse = matchMedia('(pointer:coarse)').matches;
  const root = document.documentElement;
  const hero = /** @type {HTMLElement|null} */ (q('.hero'));
  const process = /** @type {HTMLElement|null} */ (q('.process'));
  const portrait = /** @type {HTMLElement|null} */ (q('.about-portrait'));
  const landscape = /** @type {HTMLElement|null} */ (q('.about-landscape'));
  const contact = /** @type {HTMLElement|null} */ (q('.contact'));
  const railItems = /** @type {HTMLElement[]} */ (qa('.section-rail [data-rail]'));
  let px = 0, py = 0, heroProgress = 0;

  const applyHero = () => {
    if (!hero || reduce || !fine) return;
    root.style.setProperty('--hero-media-x', `${(px * 2.2).toFixed(2)}px`);
    root.style.setProperty('--hero-media-y', `${(py * 1.5).toFixed(2)}px`);
    root.style.setProperty('--hero-img-x', `${(px * 9).toFixed(2)}px`);
    root.style.setProperty('--hero-img-y', `${(py * 6 + heroProgress * 8).toFixed(2)}px`);
    root.style.setProperty('--hero-scale', (1.058 + heroProgress * .028).toFixed(4));
    root.style.setProperty('--hero-sun-x', `${(-px * 13).toFixed(2)}px`);
    root.style.setProperty('--hero-sun-y', `${(-py * 10).toFixed(2)}px`);
    root.style.setProperty('--hero-sun-scale', (1 + heroProgress * .14).toFixed(3));
    root.style.setProperty('--hero-sun-opacity', (0.9 - heroProgress * .34).toFixed(3));
    root.style.setProperty('--hero-content-x', `${(-px * 1.8).toFixed(2)}px`);
    root.style.setProperty('--hero-content-y', `${(-py * 1.2 - heroProgress * 12).toFixed(2)}px`);
  };

  if (fine && !reduce) {
    addEventListener('pointermove', e => {
      root.style.setProperty('--spot-x', `${e.clientX}px`);
      root.style.setProperty('--spot-y', `${e.clientY}px`);
      if (hero) {
        const r = hero.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight && e.clientY >= r.top && e.clientY <= r.bottom) {
          px = clamp((e.clientX-r.left)/r.width,0,1)-.5;
          py = clamp((e.clientY-r.top)/r.height,0,1)-.5;
        } else { px *= .72; py *= .72; }
        applyHero();
      }
    }, {passive:true});

    contact?.addEventListener('pointermove', e => {
      const pointer = /** @type {PointerEvent} */ (e);
      const r = contact.getBoundingClientRect();
      const x = clamp((pointer.clientX-r.left)/r.width,0,1)*100;
      const y = clamp((pointer.clientY-r.top)/r.height,0,1)*100;
      contact.style.setProperty('--contact-x', `${x.toFixed(1)}%`);
      contact.style.setProperty('--contact-y', `${y.toFixed(1)}%`);
    }, {passive:true});
  }

  // Once-only art-directed entrances per section.
  const motionSections = qa('.motion-section');
  if ('IntersectionObserver' in window && !reduce) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-active');
        if (entry.target.matches('.process')) qa('.process-step', entry.target).forEach(el => el.classList.add('motion-seen'));
        sectionObserver.unobserve(entry.target);
      });
    }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});
    motionSections.forEach(s => sectionObserver.observe(s));
  } else motionSections.forEach(s => s.classList.add('motion-active'));

  const railTargets = ['top','projects','about','process','contact']
    .map(id => document.getElementById(id)).filter(Boolean);
  const setRail = id => railItems.forEach(el => el.classList.toggle('active', el.dataset.rail === id));
  if ('IntersectionObserver' in window) {
    const railObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (visible) setRail(visible.target.id);
    }, {rootMargin:'-38% 0px -48% 0px', threshold:[0,.1,.25,.5,.75]});
    railTargets.forEach(s => railObserver.observe(s));
  }
  setRail('top');

  let raf = 0;
  const updateScrollMotion = () => {
    raf = 0;
    if (hero) {
      const r = hero.getBoundingClientRect();
      heroProgress = clamp((-r.top) / Math.max(1, r.height * .82));
      applyHero();
    }
    if (process) {
      const r = process.getBoundingClientRect();
      const start = innerHeight * .78;
      const end = innerHeight * .18;
      const p = clamp((start-r.top) / Math.max(1, r.height + start-end));
      process.style.setProperty('--process-progress', `${(p*100).toFixed(2)}%`);
    }
    // Skip the extra per-frame getBoundingClientRect work for the portrait/landscape
    // depth effect on touch devices: the offset is barely visible at phone viewport
    // sizes, but the reflow cost on every scroll frame is real and adds jank on
    // cheaper Android hardware. Desktop/pointer-fine keeps the full effect.
    if (!reduce && !coarse) {
      if (portrait) {
        const r = portrait.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const d = ((r.top+r.height/2)-innerHeight/2)/innerHeight;
          portrait.style.setProperty('--portrait-y', `${(-d*18).toFixed(2)}px`);
        }
      }
      if (landscape) {
        const r = landscape.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const d = ((r.top+r.height/2)-innerHeight/2)/innerHeight;
          landscape.style.setProperty('--landscape-y', `${(-d*22).toFixed(2)}px`);
        }
      }
    }
  };
  const requestScrollMotion = () => { if (!raf) raf = requestAnimationFrame(updateScrollMotion); };
  addEventListener('scroll', requestScrollMotion, {passive:true});
  addEventListener('resize', requestScrollMotion, {passive:true});
  updateScrollMotion();

  // Refined press response; no bounce, no gaming feel.
  qa('.pill,.case-link,.live-link').forEach(el => {
    el.addEventListener('pointerdown', () => el.classList.add('is-pressed'));
    const clear = () => el.classList.remove('is-pressed');
    el.addEventListener('pointerup', clear); el.addEventListener('pointercancel', clear); el.addEventListener('pointerleave', clear);
  });
})();

