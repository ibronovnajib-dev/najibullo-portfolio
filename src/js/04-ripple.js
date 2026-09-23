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

