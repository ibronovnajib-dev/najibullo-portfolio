(() => {
  const q = (s, p=document) => p.querySelector(s);
  const qa = (s, p=document) => [...p.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader: short on first visit, skipped for returning visits in this session.
  const pre = q('.preloader');
  const count = q('.preloader__count');
  let seenThisSession = false;
  try { seenThisSession = sessionStorage.getItem('portfolio-seen') === '1'; } catch {}
  if (pre && !reduce && !seenThisSession) {
    const start = performance.now();
    const duration = 560;
    const tick = (now) => {
      const progress = Math.min(100, Math.round(((now - start) / duration) * 100));
      if (count) count.textContent = String(progress).padStart(2,'0');
      if (progress < 100) requestAnimationFrame(tick);
      else {
        pre.classList.add('done');
        try { sessionStorage.setItem('portfolio-seen','1'); } catch {}
      }
    };
    requestAnimationFrame(tick);
  } else if (pre) pre.classList.add('done');

  // Intersection reveals
  const revealEls = qa('.reveal-up,.reveal-fade,.reveal-scale,.reveal-card');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, {threshold:.12, rootMargin:'0px 0px -4% 0px'});
    revealEls.forEach(el => io.observe(el));
    // Safety net: content must never stay invisible. If an element sits in a layout
    // the observer never fires for (zero-height ancestor, late-loading webfont shifting
    // layout, a thrown error elsewhere that stops other init code), force it visible
    // after a short grace period rather than leaving it permanently at opacity:0.
    setTimeout(() => revealEls.forEach(el => el.classList.add('is-visible')), 2500);
  } else revealEls.forEach(el => el.classList.add('is-visible'));

  // nav + scroll progress + contact parallax
  const nav = q('.site-nav');
  const prog = q('.scroll-progress i');
  const contactBg = q('.contact__bg');
  let lastY = 0, ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      nav?.classList.toggle('scrolled', y > 40);
      if (y > 300 && y > lastY + 6) nav?.classList.add('hidden');
      if (y < lastY - 6) nav?.classList.remove('hidden');
      lastY = y;
      const max = document.documentElement.scrollHeight - innerHeight;
      if (prog) prog.style.width = (max ? y/max*100 : 0) + '%';
      if (contactBg && !reduce) {
        const rect = q('.contact').getBoundingClientRect();
        if (rect.top < innerHeight && rect.bottom > 0) {
          const n = (innerHeight - rect.top) / (innerHeight + rect.height);
          contactBg.style.transform = `scale(1.05) translate3d(0,${(n-.5)*24}px,0)`;
        }
      }
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // active nav
  const sections = ['top','about','projects','process','contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = qa('.desktop-nav a');
  if ('IntersectionObserver' in window) {
    const nio = new IntersectionObserver(es => {
      es.forEach(e => { if(e.isIntersecting){ navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#'+e.target.id)); } });
    }, {rootMargin:'-42% 0px -48%'});
    sections.forEach(s=>nio.observe(s));
  }

  // mobile menu — dialog-like focus management for keyboard/screen-reader users.
  const menu = q('.mobile-menu'); const menuBtn = q('.menu-button'); const close = q('.mobile-menu__top button');
  let menuReturnFocus = null;
  const menuBackground = () => ['main','.footer','.mobile-action-bar'].map(sel=>document.querySelector(sel)).filter(Boolean);
  const setMenu = (open) => {
    if (!menu) return;
    if (open) menuReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    menu.classList.toggle('open', open); document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', String(!open)); menuBtn?.setAttribute('aria-expanded', String(open));
    menuBackground().forEach(el => { if (open) el.setAttribute('inert',''); else el.removeAttribute('inert'); });
    if (open) requestAnimationFrame(()=>close?.focus());
    else menuReturnFocus?.focus?.({preventScroll:true});
  };
  menuBtn?.addEventListener('click',()=>setMenu(true)); close?.addEventListener('click',()=>setMenu(false)); qa('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  addEventListener('keydown',e=>{
    if (!menu?.classList.contains('open')) return;
    if(e.key==='Escape'){e.preventDefault();setMenu(false);return;}
    if(e.key!=='Tab') return;
    const focusables=qa('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',menu).filter(el=>!el.closest('[hidden]'));
    if(!focusables.length) return;
    const first=focusables[0],last=focusables[focusables.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });

  // counters
  qa('.counter').forEach(el => {
    const target = +el.dataset.target || 0;
    let ran = false;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || ran) return; ran = true;
      if (reduce) { el.textContent = target; return; }
      const t0 = performance.now();
      const step = t => { const p = Math.min(1,(t-t0)/900); el.textContent = Math.round(target*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(step); };
      requestAnimationFrame(step); io.disconnect();
    }); io.observe(el);
  });

  // cursor + magnetic buttons
  const dot=q('.cursor-dot'), ring=q('.cursor-ring');
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.body.classList.add('has-cursor'); let mx=0,my=0,rx=0,ry=0;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(dot){dot.style.left=mx+'px';dot.style.top=my+'px'}});
    const animate=()=>{rx+=(mx-rx)*.16;ry+=(my-ry)*.16;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px'}requestAnimationFrame(animate)};animate();
    qa('a,button,[data-tilt]').forEach(el=>{el.addEventListener('mouseenter',()=>ring?.classList.add('is-link'));el.addEventListener('mouseleave',()=>ring?.classList.remove('is-link'))});
    qa('.magnetic').forEach(el=>{
      el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.09}px,${y*.12}px)`});
      el.addEventListener('mouseleave',()=>el.style.transform='');
    });
  }

  // project tilt + local gold glow
  qa('[data-tilt]').forEach(card => {
    const glow = q('.card-glow', card);
    card.addEventListener('mousemove', e => {
      if (reduce || matchMedia('(pointer:coarse)').matches) return;
      const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      card.style.setProperty('--rx', `${(-y*2.2).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x*2.8).toFixed(2)}deg`);
      if(glow){glow.style.left=(e.clientX-r.left)+'px';glow.style.top=(e.clientY-r.top)+'px'}
    });
    card.addEventListener('mouseleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg')});
  });


})();

// Premium source-backed case studies + route transition
(() => {
  const q = (s, p=document) => p.querySelector(s);
  const qa = (s, p=document) => [...p.querySelectorAll(s)];
  const modal = q('#case-modal');
  const panel = q('.case-modal__panel', modal || document);
  const title = q('#case-title');
  const kicker = q('#case-kicker');
  const route = q('.route-transition');
  const views = modal ? qa('[data-case-view]', modal) : [];
  let lastFocus = null;
  let activeCase = null;
  const pageLayers = () => ['.site-nav','main','.footer','.mobile-action-bar'].map(sel=>document.querySelector(sel)).filter(Boolean);
  const setPageInert = (on) => pageLayers().forEach(el=>{ if(on) el.setAttribute('inert',''); else el.removeAttribute('inert'); });

  const transitionPulse = (label='PRODUCT') => {
    if (!route) return;
    const span = q('span', route);
    if (span) span.textContent = `NAJIBULLO / ${label.toUpperCase()}`;
    route.classList.add('active');
    window.setTimeout(() => route.classList.remove('active'), 680);
  };

  const caseMeta = {
    ustohona: { title: 'Ustohona.tj', kickerKey: 'case.ust.kicker' },
    tajlife: { title: 'TajLife.tj', kickerKey: 'case.taj.kicker' }
  };
  const tr = (key) => window.PortfolioI18n?.t(key) || key;

  const openCase = (name, {updateHistory=true}={}) => {
    if (!modal || !caseMeta[name]) return;
    lastFocus = document.activeElement;
    activeCase = name;
    transitionPulse(name);
    views.forEach(v => { v.hidden = v.dataset.caseView !== name; });
    title.textContent = caseMeta[name].title;
    kicker.textContent = tr(caseMeta[name].kickerKey);
    window.setTimeout(() => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('case-open');
      setPageInert(true);
      panel.scrollTop = 0;
      panel.focus({preventScroll:true});
    }, 210);
    if (updateHistory && location.hash !== `#case-${name}`) history.pushState({case:name}, '', `#case-${name}`);
  };

  const closeCase = ({fromPop=false}={}) => {
    if (!modal || !modal.classList.contains('open')) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('case-open');
    setPageInert(false);
    const prior = lastFocus;
    activeCase = null;
    if (prior && typeof prior.focus === 'function') prior.focus({preventScroll:true});
    if (!fromPop && location.hash.startsWith('#case-')) history.pushState({}, '', '#projects');
  };

  qa('.case-trigger').forEach(btn => btn.addEventListener('click', () => openCase(btn.dataset.case)));
  qa('[data-case-close]').forEach(btn => btn.addEventListener('click', () => closeCase()));

  document.addEventListener('keydown', e => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); closeCase(); return; }
    if (e.key !== 'Tab') return;
    const focusables = qa('a[href],button:not([disabled]),input:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])', panel)
      .filter(el => !el.closest('[hidden]'));
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  qa('.external-launch').forEach(link => link.addEventListener('click', () => {
    const name = link.href.includes('ustohona') ? 'USTOHONA.TJ' : link.href.includes('tajlife') ? 'TAJLIFE.TJ' : 'LIVE PRODUCT';
    transitionPulse(name);
  }));

  document.addEventListener('portfolio:languagechange', () => {
    if (activeCase && caseMeta[activeCase]) {
      title.textContent = caseMeta[activeCase].title;
      kicker.textContent = tr(caseMeta[activeCase].kickerKey);
    } else {
      title.textContent = tr('case.titleDefault');
      kicker.textContent = tr('case.label');
    }
  });

  addEventListener('popstate', () => {
    const m = location.hash.match(/^#case-(ustohona|tajlife)$/);
    if (m) openCase(m[1], {updateHistory:false});
    else if (modal?.classList.contains('open')) closeCase({fromPop:true});
  });

  const initial = location.hash.match(/^#case-(ustohona|tajlife)$/);
  if (initial) openCase(initial[1], {updateHistory:false});
})();


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

// Button ripple — quiet, tactile confirmation on primary/secondary CTAs.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('pointerdown', e => {
      const pointer = /** @type {PointerEvent} */ (e);
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 1.15;
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = `${d}px`;
      span.style.left = `${pointer.clientX - r.left - d / 2}px`;
      span.style.top = `${pointer.clientY - r.top - d / 2}px`;
      btn.appendChild(span);
      span.addEventListener('animationend', () => span.remove());
    });
  });
})();

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

// Ambient hero particles — a handful of soft champagne-gold motes drifting
// upward behind the portrait, subtly parallaxed by the pointer. Purely
// decorative, so it is skipped entirely for reduced-motion and paused
// whenever the hero is off-screen or the tab is hidden to stay cheap.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById('hero-particles'));
  const hero = /** @type {HTMLElement|null} */ (document.querySelector('.hero'));
  if (!canvas || !hero || reduce) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const coarse = matchMedia('(pointer:coarse)').matches;
  const COUNT = coarse ? 16 : 30;
  let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  let particles = [];
  let px = 0, py = 0, raf = 0, active = false;

  const resize = () => {
    const r = hero.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const makeParticle = () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.6 + Math.random() * 1.7,
    speed: 0.10 + Math.random() * 0.22,
    drift: (Math.random() - 0.5) * 0.18,
    alpha: 0.10 + Math.random() * 0.24,
    twinklePhase: Math.random() * Math.PI * 2
  });

  const seed = () => { particles = Array.from({ length: COUNT }, makeParticle); };

  const tick = (t) => {
    if (!active) return;
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift + px * 0.12;
      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
      if (p.x < -6) p.x = w + 6; else if (p.x > w + 6) p.x = -6;
      const twinkle = 0.65 + 0.35 * Math.sin(t / 900 + p.twinklePhase);
      ctx.beginPath();
      ctx.arc(p.x, p.y + py * 6, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,196,138,${(p.alpha * twinkle).toFixed(3)})`;
      ctx.fill();
    });
    raf = requestAnimationFrame(tick);
  };

  const start = () => { if (active) return; active = true; raf = requestAnimationFrame(tick); };
  const stop = () => { active = false; if (raf) cancelAnimationFrame(raf); raf = 0; };

  resize(); seed();
  addEventListener('resize', () => { resize(); }, { passive: true });

  if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
    addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      px = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width - 0.5));
      py = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height - 0.5));
    }, { passive: true });
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !document.hidden) start(); else stop();
  }, { threshold: 0 });
  io.observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (hero.getBoundingClientRect().bottom > 0) start();
  });
})();

// Contact form — validates locally, submits through a configured form endpoint,
// and only falls back to mailto when the network provider is unavailable.
(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const CONTACT_EMAIL = cfg.contact?.domainEmail || cfg.contact?.email || 'ibronovnajib@gmail.com';
  const FORM_ENDPOINT = cfg.contact?.formEndpoint || '';
  const form = /** @type {HTMLFormElement|null} */ (document.getElementById('contact-form'));
  const email = /** @type {HTMLInputElement|null} */ (document.getElementById('contact-email'));
  const name = /** @type {HTMLInputElement|null} */ (document.getElementById('contact-name'));
  const project = /** @type {HTMLSelectElement|null} */ (document.getElementById('contact-project'));
  const message = /** @type {HTMLTextAreaElement|null} */ (document.getElementById('contact-message'));
  const status = /** @type {HTMLElement|null} */ (document.getElementById('contact-form-status'));
  /** @type {HTMLButtonElement|null} */
  const submitButton = form?.querySelector('button[type="submit"]') || null;
  if (!form || !email || !name || !project || !message || !status) return;
  const t = (key, fallback) => window.PortfolioI18n?.t ? window.PortfolioI18n.t(key) : fallback;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const setStatus = (msg, kind='') => { status.textContent = msg; status.classList.toggle('is-error', kind === 'error'); status.classList.toggle('is-success', kind === 'success'); };
  const mailFallback = ({n,em,msg}) => {
    const subject = encodeURIComponent(`Project inquiry — ${project.value}`);
    const host = (()=>{ try{return new URL(cfg.siteUrl || location.origin).host}catch{return location.host} })();
    const body = encodeURIComponent(`Hi Najibullo,\n\nName: ${n}\nEmail: ${em}\nProject: ${project.value}\n\n${msg}\n\nSent from ${host} portfolio.`);
    location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const n = name.value.trim(), em = email.value.trim(), msg = message.value.trim();
    if (n.length < 2) { form.classList.add('has-error'); name.focus(); setStatus(t('contact.form.invalidName','Please enter your name.'),'error'); return; }
    if (!EMAIL_RE.test(em)) { form.classList.add('has-error'); email.focus(); setStatus(t('contact.form.invalid','Please enter a valid email address.'),'error'); return; }
    if (msg.length < 8) { form.classList.add('has-error'); message.focus(); setStatus(t('contact.form.invalidMessage','Please add a short project message.'),'error'); return; }
    const honey = /** @type {HTMLInputElement|null} */ (form.querySelector('input[name="_honey"]'));
    if (honey?.value) return;
    form.classList.remove('has-error');
    setStatus(t('contact.form.opening','Sending your message securely…'));
    submitButton?.setAttribute('aria-busy','true');
    if (submitButton) submitButton.disabled = true;
    const payload = {
      name:n, email:em, project:project.value, message:msg,
      _subject:`Portfolio inquiry — ${project.value}`,
      _template:'table',
      _url:cfg.siteUrl || location.href
    };
    try {
      if (!FORM_ENDPOINT) throw new Error('No contact endpoint configured');
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 10000);
      const res = await fetch(FORM_ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload),
        signal:controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) throw new Error(`Contact endpoint returned ${res.status}`);
      const data = await res.json().catch(()=>({success:true}));
      if (data && data.success === false) throw new Error(data.message || 'Contact endpoint rejected submission');
      form.reset();
      setStatus(t('contact.form.sent','Message sent. I’ll reply to the email you provided.'),'success');
      window.trackPortfolioEvent?.('contact_submit', {project:project.value, provider:cfg.contact?.formProvider || 'configured'});
    } catch (err) {
      setStatus(t('contact.form.sendError','The form service is unavailable. Opening your email app as a fallback…'),'error');
      window.trackPortfolioEvent?.('contact_submit_fallback', {project:project.value});
      setTimeout(()=>mailFallback({n,em,msg}),450);
    } finally {
      submitButton?.removeAttribute('aria-busy');
      if (submitButton) submitButton.disabled = false;
    }
  });
  [name,email,message].forEach(el=>el.addEventListener('input',()=>{ if(form.classList.contains('has-error')){form.classList.remove('has-error');setStatus('');} }));
})();

// Live Tajikistan local time — a small, honest "this is a real person, live
// right now" signal in the hero status pill. Ticks on a minute-aligned
// interval rather than every second, since only the minute digit is shown.
(() => {
  const el = document.getElementById('local-clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => { try { el.textContent = fmt.format(new Date()); } catch { el.textContent = ''; } };
  tick();
  const msToNextMinute = 60000 - (Date.now() % 60000);
  setTimeout(() => { tick(); setInterval(tick, 60000); }, msToNextMinute);
})();

// Back-to-top — appears once the visitor has scrolled past the hero, so the
// long single-page layout stays easy to navigate without relying only on
// the header nav (which itself hides on scroll-down).
(() => {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { btn.classList.toggle('is-visible', scrollY > innerHeight * .8); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  btn.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    const target = document.getElementById('top');
    const focusTarget = /** @type {HTMLElement|null} */ (target?.querySelector('a,button') || null);
    focusTarget?.focus({ preventScroll: true });
  });
})();

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

// VIP Project Concierge — a focused conversion flow rather than a generic contact form.
(() => {
  const modal = /** @type {HTMLElement|null} */ (document.getElementById('project-concierge'));
  if (!modal) return;
  const panel = /** @type {HTMLElement|null} */ (modal.querySelector('.concierge__panel'));
  const form = /** @type {HTMLFormElement|null} */ (modal.querySelector('#concierge-form'));
  const next = /** @type {HTMLButtonElement|null} */ (modal.querySelector('[data-concierge-next]'));
  const back = /** @type {HTMLButtonElement|null} */ (modal.querySelector('[data-concierge-back]'));
  const status = /** @type {HTMLElement|null} */ (modal.querySelector('#concierge-status'));
  const progress = /** @type {HTMLElement|null} */ (modal.querySelector('.concierge__progress i'));
  const steps = /** @type {HTMLElement[]} */ ([...modal.querySelectorAll('[data-concierge-step]')]);
  let current = 1;
  let returnFocus = null;
  const cfg = window.PORTFOLIO_CONFIG || {};
  const formEndpoint = cfg.contact?.formEndpoint || '';
  const conciergeBackground = () => ['.site-nav','main','.footer','.mobile-action-bar'].map(sel=>document.querySelector(sel)).filter(Boolean);
  const setConciergeInert = (on) => conciergeBackground().forEach(el=>{ if(on) el.setAttribute('inert',''); else el.removeAttribute('inert'); });
  const t = key => window.PortfolioI18n?.t?.(key) || key;

  const setStep = n => {
    current = Math.max(1, Math.min(3, n));
    steps.forEach(step => {
      const on = Number(step.dataset.conciergeStep) === current;
      step.hidden = !on;
      step.classList.toggle('is-active', on);
    });
    if (progress) progress.style.transform = `scaleX(${current === 1 ? .166 : current === 2 ? .5 : .834})`;
    if (back) back.hidden = current === 1;
    if (next) next.innerHTML = `${current === 3 ? t('concierge.send') : t('concierge.next')} <span>→</span>`;
    if (status) status.textContent = '';
    panel?.scrollTo({top:0, behavior:'smooth'});
  };

  const open = trigger => {
    returnFocus = trigger instanceof HTMLElement ? trigger : (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('concierge-lock');
    setConciergeInert(true);
    setStep(1);
    setTimeout(() => panel?.focus(), 40);
    window.trackPortfolioEvent?.('project_concierge_open');
  };
  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('concierge-lock');
    setConciergeInert(false);
    returnFocus?.focus?.({preventScroll:true});
  };

  document.querySelectorAll('[data-concierge-open]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault(); open(el);
  }));
  modal.querySelectorAll('[data-concierge-close]').forEach(el => el.addEventListener('click', close));
  back?.addEventListener('click', () => setStep(current - 1));
  form?.addEventListener('submit', e => e.preventDefault());

  const selected = name => /** @type {HTMLInputElement|null} */ (form.querySelector(`input[name="${name}"]:checked`))?.value || '';
  const emailField = /** @type {HTMLInputElement|null} */ (form.elements.namedItem('email'));
  const noteField = /** @type {HTMLTextAreaElement|null} */ (form.elements.namedItem('note'));
  const validateCurrent = () => {
    if (current === 1 && !selected('product')) { status.textContent = t('concierge.select'); return false; }
    if (current === 2 && !selected('stage')) { status.textContent = t('concierge.select'); return false; }
    if (current === 3) {
      if (!selected('timeline')) { status.textContent = t('concierge.select'); return false; }
      const email = emailField?.value.trim() || '';
      if (!/^\S+@\S+\.\S+$/.test(email)) { status.textContent = t('concierge.invalidEmail'); emailField?.focus(); return false; }
    }
    return true;
  };

  next?.addEventListener('click', async () => {
    if (!validateCurrent()) return;
    if (current < 3) { setStep(current + 1); return; }
    const email = emailField?.value.trim() || '';
    const note = noteField?.value.trim() || '';
    const product = selected('product');
    const stage = selected('stage');
    const timeline = selected('timeline');
    const to = cfg.contact?.domainEmail || cfg.contact?.email || 'ibronovnajib@gmail.com';
    const subject = `Project brief — ${product}`;
    const body = [
      'Hi Najibullo,', '',
      `Product: ${product}`,
      `Stage: ${stage}`,
      `Timeline: ${timeline}`,
      `My email: ${email}`,
      note ? `Idea: ${note}` : '', '',
      'Sent from the private project concierge.'
    ].filter(Boolean).join('\n');
    status.textContent = t('concierge.sending');
    next.setAttribute('aria-busy','true');
    next.disabled = true;
    const payload = {name:'Project Concierge', email, product, stage, timeline, message:note || 'No extra note provided.', _subject:subject, _template:'table', _url:cfg.siteUrl || location.href};
    try {
      if (!formEndpoint) throw new Error('No form endpoint configured');
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 10000);
      const res = await fetch(formEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      clearTimeout(timeout);
      if(!res.ok) throw new Error(`Form endpoint returned ${res.status}`);
      const data = await res.json().catch(()=>({success:true}));
      if(data && data.success===false) throw new Error(data.message||'Submission rejected');
      status.textContent = t('concierge.sent');
      form.reset();
      setStep(1);
      status.textContent = t('concierge.sent');
      window.trackPortfolioEvent?.('project_concierge_submit',{product,stage,timeline,provider:cfg.contact?.formProvider||'configured'});
    } catch {
      status.textContent = t('concierge.sendError');
      window.trackPortfolioEvent?.('project_concierge_fallback',{product,stage,timeline});
      setTimeout(()=>{location.href=`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;},500);
    } finally {
      next.removeAttribute('aria-busy');
      next.disabled = false;
    }
  });

  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      const focusables = /** @type {HTMLElement[]} */ ([...modal.querySelectorAll('button:not([hidden]),input:not([disabled]),textarea,a[href]')]).filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  document.addEventListener('portfolio:languagechange', () => setStep(current));
})();

// Atelier light field — slow local lighting, only on fine pointers.
(() => {
  const section = document.getElementById('atelier');
  if (!section || matchMedia('(pointer:coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let raf = 0;
  let point = null;
  section.addEventListener('pointermove', e => {
    point = {x:e.clientX, y:e.clientY};
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!point) return;
      const r = section.getBoundingClientRect();
      section.style.setProperty('--atelier-x', `${((point.x-r.left)/r.width*100).toFixed(1)}%`);
      section.style.setProperty('--atelier-y', `${((point.y-r.top)/r.height*100).toFixed(1)}%`);
    });
  }, {passive:true});
})();
