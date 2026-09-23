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

