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

