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

