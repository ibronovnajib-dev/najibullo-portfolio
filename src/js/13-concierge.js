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

