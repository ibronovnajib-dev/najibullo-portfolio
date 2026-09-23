// @ts-check
(() => {
  const root = document.documentElement;
  const getPreferred = () => {
    try { const saved = localStorage.getItem('portfolio-theme'); if (saved === 'dark' || saved === 'light') return saved; } catch {}
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };
  /** @param {'dark'|'light'} theme @param {boolean} persist */
  const apply = (theme, persist=true) => {
    root.dataset.theme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach(btn => btn.setAttribute('aria-pressed', String(theme === 'light')));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#efe8dc' : '#0b0a09');
    if (persist) { try { localStorage.setItem('portfolio-theme', theme); } catch {} }
    window.trackPortfolioEvent?.('theme_change', {theme});
  };
  apply(/** @type {'dark'|'light'} */ (getPreferred()), false);
  document.addEventListener('click', e => {
    const target = /** @type {Element|null} */ (e.target instanceof Element ? e.target : null);
    if (!target?.closest('[data-theme-toggle]')) return;
    apply(root.dataset.theme === 'light' ? 'dark' : 'light');
  });
})();

(() => {
  const modal = /** @type {HTMLElement|null} */ (document.getElementById('command-palette'));
  const panel = /** @type {HTMLElement|null} */ (modal?.querySelector('.command-palette__panel') || null);
  const input = /** @type {HTMLInputElement|null} */ (document.getElementById('command-search'));
  const list = /** @type {HTMLElement|null} */ (document.getElementById('command-list'));
  if (!modal || !panel || !input || !list) return;
  const allButtons = () => Array.from(list.querySelectorAll('[data-command-target]')).filter(b => !/** @type {HTMLElement} */(b).hidden);
  let selected = 0; let previousFocus = /** @type {HTMLElement|null} */ (null);
  const backgroundLayers = () => ['.site-nav','main','.footer','.mobile-action-bar'].map(sel=>document.querySelector(sel)).filter(Boolean);
  const setBackgroundInert = (on) => backgroundLayers().forEach(el=>{ if(on) el.setAttribute('inert',''); else el.removeAttribute('inert'); });
  const sync = () => allButtons().forEach((b,i)=>b.classList.toggle('is-selected',i===selected));
  const open = () => {
    document.querySelector('.mobile-menu.open .mobile-menu__top button')?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
    previousFocus=document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); setBackgroundInert(true);
    input.value=''; selected=0; allButtons().forEach(b=>/** @type {HTMLElement} */(b).hidden=false); sync();
    requestAnimationFrame(()=>input.focus()); window.trackPortfolioEvent?.('command_palette_open');
  };
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); setBackgroundInert(false); previousFocus?.focus({preventScroll:true}); };
  /** @param {Element} btn */
  const run = btn => { const selector=/** @type {HTMLElement} */(btn).dataset.commandTarget; if(!selector)return; const target=document.querySelector(selector); close(); target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); };
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==='k') { e.preventDefault(); modal.classList.contains('open')?close():open(); return; }
    if (!modal.classList.contains('open')) return;
    if (e.key==='Escape') { e.preventDefault(); close(); return; }
    if(e.key==='Tab'){
      const focusables=Array.from(panel.querySelectorAll('input,button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')).filter(el=>/** @type {HTMLElement} */(el).offsetParent!==null);
      if(focusables.length){const first=/** @type {HTMLElement} */(focusables[0]);const last=/** @type {HTMLElement} */(focusables[focusables.length-1]);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
      return;
    }
    const buttons=allButtons(); if(!buttons.length) return;
    if(e.key==='ArrowDown'){e.preventDefault();selected=(selected+1)%buttons.length;sync();buttons[selected].scrollIntoView({block:'nearest'});}
    if(e.key==='ArrowUp'){e.preventDefault();selected=(selected-1+buttons.length)%buttons.length;sync();buttons[selected].scrollIntoView({block:'nearest'});}
    if(e.key==='Enter'){e.preventDefault();run(buttons[selected]);}
  });
  document.querySelectorAll('[data-command-open]').forEach(el=>el.addEventListener('click',open));
  modal.querySelectorAll('[data-command-close]').forEach(el=>el.addEventListener('click',close));
  list.addEventListener('click',e=>{const target=e.target instanceof Element?e.target:null;const btn=target?.closest('[data-command-target]');if(btn)run(btn);});
  input.addEventListener('input',()=>{ const q=input.value.trim().toLowerCase(); Array.from(list.querySelectorAll('[data-command-target]')).forEach(btn=>{/** @type {HTMLElement} */(btn).hidden=Boolean(q&&!btn.textContent?.toLowerCase().includes(q));}); selected=0;sync(); });
})();

(() => {
  const lab = /** @type {HTMLElement|null} */ (document.getElementById('demo-lab')); if(!lab) return;
  const tabs=Array.from(lab.querySelectorAll('[data-demo-tab]')); const panels=Array.from(lab.querySelectorAll('[data-demo-panel]'));
  /** @param {string} name */
  const setTab=name=>{tabs.forEach(b=>{const on=/** @type {HTMLElement} */(b).dataset.demoTab===name;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',String(on));});panels.forEach(p=>{const on=/** @type {HTMLElement} */(p).dataset.demoPanel===name;/** @type {HTMLElement} */(p).hidden=!on;p.classList.toggle('is-active',on);});window.trackPortfolioEvent?.('demo_tab',{name});};
  tabs.forEach(b=>b.addEventListener('click',()=>setTab(/** @type {HTMLElement} */(b).dataset.demoTab||'')));
  let service=''; const serviceBtns=Array.from(lab.querySelectorAll('[data-demo-service]'));
  serviceBtns.forEach(b=>b.addEventListener('click',()=>{service=/** @type {HTMLElement} */(b).dataset.demoService||'';serviceBtns.forEach(x=>x.classList.toggle('is-active',x===b));const m=/** @type {HTMLElement|null} */(lab.querySelector('[data-demo-message]'));if(m)m.textContent=`${service} — ready to simulate.`;}));
  lab.querySelector('.demo-run')?.addEventListener('click',()=>{ const msg=/** @type {HTMLElement|null} */(lab.querySelector('[data-demo-message]')); const sk=/** @type {HTMLElement|null} */(lab.querySelector('.demo-skeleton')); const steps=Array.from(lab.querySelectorAll('.demo-result li')); if(!msg||!sk)return; if(!service){msg.textContent=window.PortfolioI18n?.t('demo.choose')||'Choose a service first.';return;} sk.hidden=false;steps.forEach((x,i)=>x.classList.toggle('is-done',i===0));msg.textContent=window.PortfolioI18n?.t('demo.loading')||'Building the simulated flow…'; let i=1;const timer=setInterval(()=>{if(i<steps.length){steps[i].classList.add('is-done');i++;return;}clearInterval(timer);sk.hidden=true;msg.textContent=(window.PortfolioI18n?.t('demo.complete')||'Simulation complete: category → request → offers → direct contact.').replace('{{service}}',service);window.trackPortfolioEvent?.('demo_complete',{product:'ustohona',service});},260); });
  const search=/** @type {HTMLInputElement|null} */(lab.querySelector('[data-demo-search]')); const cloud=/** @type {HTMLElement|null} */(lab.querySelector('[data-demo-cloud]')); search?.addEventListener('input',()=>{if(!cloud)return;const q=search.value.trim().toLowerCase();Array.from(cloud.querySelectorAll('button')).forEach(b=>b.hidden=Boolean(q&&!b.textContent?.toLowerCase().includes(q)));});
})();

(() => { if (!('IntersectionObserver' in window)) return; const obs=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('is-visible',e.isIntersecting)),{threshold:.08,rootMargin:'-4% 0px -8%'}); document.querySelectorAll('main>.motion-section').forEach(s=>obs.observe(s)); })();
