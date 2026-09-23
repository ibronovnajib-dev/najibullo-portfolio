// Live Tajikistan local time — a small, honest "this is a real person, live
// right now" signal in the hero status pill. Ticks on a minute-aligned
// interval rather than every second, since only the minute digit is shown.
(() => {
  const el = document.getElementById('local-clock');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dushanbe', hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => { try { el.textContent = fmt.format(new Date()); } catch { el.textContent = ''; } };
  tick();
  const msToNextMinute = 60000 - (Date.now() % 60000);
  setTimeout(() => { tick(); setInterval(tick, 60000); }, msToNextMinute);
})();

