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
