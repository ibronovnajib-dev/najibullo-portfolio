export {};
// Performance-first Three.js hero layer.
// The library is lazy-loaded only on capable desktop devices. Mobile,
// reduced-motion and failed network imports fall back to the existing canvas particles.
const canvas = document.getElementById('hero-three');
const hero = document.querySelector('.hero');
const canRun = canvas && hero && matchMedia('(min-width: 901px)').matches && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canRun) {
  let visible = true;
  const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.02 });
  visibility.observe(hero);

  try {
    // @ts-ignore - pinned browser ESM URL is intentionally loaded at runtime.
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.35));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 30);
    camera.position.set(0, 0, 5.2);

    const group = new THREE.Group();
    group.position.set(1.55, 0.12, 0);
    scene.add(group);

    const geometry = new THREE.IcosahedronGeometry(1.25, 1);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0xd9ad70, transparent: true, opacity: 0.19 })
    );
    group.add(wire);

    const pointsCount = 260;
    const positions = new Float32Array(pointsCount * 3);
    for (let i = 0; i < pointsCount; i++) {
      const r = 1.5 + Math.random() * 1.45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i*3+1] = r * Math.cos(phi) * 0.72;
      positions[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: 0xefc989, size: 0.018, transparent: true, opacity: 0.55, sizeAttenuation: true }));
    group.add(points);

    let px = 0, py = 0, tx = 0, ty = 0, last = 0;
    const pointer = e => {
      const rect = hero.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 0.22;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 0.16;
    };
    hero.addEventListener('pointermove', pointer, { passive: true });

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    };
    resize();
    addEventListener('resize', resize, { passive: true });

    const loop = now => {
      requestAnimationFrame(loop);
      if (!visible || document.hidden || now - last < 16.4) return; // ~60fps cap
      last = now;
      px += (tx - px) * 0.045;
      py += (ty - py) * 0.045;
      group.rotation.y += 0.0017;
      group.rotation.x += 0.00065;
      group.rotation.y += px * 0.002;
      group.rotation.x += py * 0.002;
      points.rotation.y -= 0.0008;
      renderer.render(scene, camera);
    };
    document.body.classList.add('has-three');
    requestAnimationFrame(loop);
  } catch (error) {
    // Intentional silent fallback: the existing lightweight canvas particles remain visible.
    document.body.classList.remove('has-three');
  }
}
