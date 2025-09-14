// tiny helpers (reusable) //
const $ = (sel, root = document) => root.querySelector(sel);
const create = (tag, className) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
};

// ----- Newsletter: store email in localStorage -----
(function setupNewsletter() {
  const form = $('#cta-1394 .cs-form');
  const emailInput = $('#cta-1394 #cs-email-1394');
  if (!form || !emailInput) return; // not on this page

  // lightweight status message
  const status = create('p', 'gb-status');
  status.setAttribute('role', 'status');
  status.style.margin = '0.5rem 0 0';
  status.style.fontSize = '0.9rem';
  status.style.color = '#1a1a1a';
  form.appendChild(status);

  // restore last email (if any)
  try {
    const saved = JSON.parse(localStorage.getItem('gb_subscribers') || '[]');
    if (saved.length > 0 && !emailInput.value) {
      emailInput.value = saved[saved.length - 1];
    }
  } catch (_) {}

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    // very simple validation
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      status.textContent = 'Please enter a valid email address.';
      status.style.color = '#ff4747';
      emailInput.focus();
      return;
    }

    // save to localStorage (simple array, unique-ish)
    let list = [];
    try { list = JSON.parse(localStorage.getItem('gb_subscribers') || '[]'); } catch (_) {}
    if (!list.includes(email)) list.push(email);
    localStorage.setItem('gb_subscribers', JSON.stringify(list));

    status.textContent = 'Thanks for subscribing! 🎉';
    status.style.color = '#60b91a';
    form.reset();
  });
})();

// ----- Daily Health Tip (changes by date) -----
(function dailyTip() {
  // tips aligned with the brief’s “featured content: health tips of the day”
  const tips = [
    'Drink a glass of water right after you wake up.',
    'Add a fist of veggies to your next meal.',
    'Stand up and stretch for 60 seconds every hour.',
    'Aim for a 10-minute brisk walk today.',
    'Swap one sugary drink for water or tea.',
    'Do 3 rounds: 10 squats, 10 pushups (knees ok), 20-sec plank.',
    'Try 3 minutes of slow breathing before bed.'
  ];

  // pick by calendar date so the same tip shows for the whole day
  const todayIdx = new Date().getDate() % tips.length;
  const tipText = `Tip of the day: ${tips[todayIdx]}`;

  // Insert unobtrusively under the Services intro paragraph
  const host = $('#services-448 .cs-content');
  if (!host) return;

  const tipEl = create('p', 'gb-tip');
  tipEl.textContent = tipText;
  tipEl.style.margin = '0.5rem 0 0';
  tipEl.style.fontSize = '0.95rem';
  tipEl.style.color = '#4e4b66';
  tipEl.style.fontStyle = 'italic';
  host.appendChild(tipEl);
})();
