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


