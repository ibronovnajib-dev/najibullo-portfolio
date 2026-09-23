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

