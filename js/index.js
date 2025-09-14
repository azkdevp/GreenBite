/* ========= GreenBite – Home (index) only =========
   - Auto-rotating hero slogans
   Keeps your existing headline; no CSS edits required.
*/
(function rotatingHero() {
  const title = document.querySelector('#hero-1946 .cs-title');
  if (!title) return;

  // start with your existing headline plus a few simple, brand-consistent lines
  const slogans = [
    title.textContent.trim(), // "Eat Well. Train Smart. Feel Better."
    'Small steps. Big change.',
    'Healthy food. Simple moves. Clear mind.',
    'Consistency over intensity.',
    'Fuel right. Move daily. Breathe deeply.'
  ];

  let i = 0;
  // light fade using inline styles (no CSS changes)
  title.style.transition = 'opacity .35s ease';

  setInterval(() => {
    title.style.opacity = '0';
    setTimeout(() => {
      i = (i + 1) % slogans.length;
      title.textContent = slogans[i];
      title.style.opacity = '1';
    }, 350);
  }, 4000);
})();

