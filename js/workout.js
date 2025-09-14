/* eslint-env browser */
(function () {
  'use strict';

  // ---------------- Data ----------------
  const WG_DATA = {
    arms: [
      { n: "Push-ups (diamond)", eq: "none" },
      { n: "Bench dips", eq: "none" },
      { n: "DB curls", eq: "dumbbells" },
      { n: "DB triceps kickback", eq: "dumbbells" },
      { n: "Band biceps curl", eq: "bands" },
      { n: "Band triceps pressdown", eq: "bands" }
    ],
    legs: [
      { n: "Bodyweight squats", eq: "none" },
      { n: "Reverse lunges", eq: "none" },
      { n: "DB goblet squat", eq: "dumbbells" },
      { n: "DB Romanian deadlift", eq: "dumbbells" },
      { n: "Band monster walk", eq: "bands" },
      { n: "Band squat", eq: "bands" }
    ],
    chest: [
      { n: "Push-ups", eq: "none" },
      { n: "Incline push-ups", eq: "none" },
      { n: "DB floor press", eq: "dumbbells" },
      { n: "DB fly (floor)", eq: "dumbbells" },
      { n: "Band chest press", eq: "bands" },
      { n: "Band fly", eq: "bands" }
    ],
    back: [
      { n: "Superman hold", eq: "none" },
      { n: "Prone Y-raise", eq: "none" },
      { n: "DB row", eq: "dumbbells" },
      { n: "DB pull-over", eq: "dumbbells" },
      { n: "Band row", eq: "bands" },
      { n: "Band pull-apart", eq: "bands" }
    ],
    shoulders: [
      { n: "Pike push-ups", eq: "none" },
      { n: "Plank shoulder taps", eq: "none" },
      { n: "DB shoulder press", eq: "dumbbells" },
      { n: "DB lateral raise", eq: "dumbbells" },
      { n: "Band overhead press", eq: "bands" },
      { n: "Band lateral raise", eq: "bands" }
    ],
    core: [
      { n: "Forearm plank", eq: "none" },
      { n: "Dead bug", eq: "none" },
      { n: "DB Russian twists", eq: "dumbbells" },
      { n: "DB hollow hold", eq: "dumbbells" },
      { n: "Band woodchop", eq: "bands" },
      { n: "Band pallof press", eq: "bands" }
    ]
  };

  function poolFor(body) {
    if (body === 'full') {
      return Object.keys(WG_DATA).reduce((acc, k) => acc.concat(WG_DATA[k]), []);
    }
    return WG_DATA[body] || [];
  }

  // ---------------- Helpers ----------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function choice(arr, n) {
    const copy = arr.slice();
    const out = [];
    while (out.length < Math.min(n, copy.length)) {
      const i = Math.floor(Math.random() * copy.length);
      out.push(copy.splice(i, 1)[0]);
    }
    return out;
  }

  // tiny beep
  function beep(ms = 180, freq = 880) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => { osc.stop(); ctx.close(); }, ms);
    } catch (e) {}
  }

  // ---------------- Card + Timer ----------------
  function renderCard(ex, seconds) {
    const el = document.createElement('div');
    el.className = 'wg-ex wg-card';
    el.innerHTML = `
      <div class="wg-head">
        <div class="wg-name">${ex.n}</div>
        <span class="wg-tag">${ex.eq}</span>
      </div>
      <div class="wg-meta">Work: <strong>${seconds}s</strong> • Sets: <strong>3</strong> • Rest: <strong>20s</strong></div>

      <div class="wg-timer">
        <div class="wg-time" data-left="${seconds}">${seconds}s</div>
        <div class="wg-bar"><div class="wg-fill"></div></div>
      </div>

      <div class="wg-actions">
        <button class="wg-btn start" type="button">Start</button>
        <button class="wg-btn pause" type="button">Pause</button>
        <button class="wg-btn reset" type="button">Reset</button>
      </div>
    `;

    const timeEl  = $('.wg-time', el);
    const fillEl  = $('.wg-fill', el);
    const startBt = $('.start', el);
    const pauseBt = $('.pause', el);
    const resetBt = $('.reset', el);

    const total = seconds;
    let left = seconds;
    let id = null;

    function draw() {
      timeEl.textContent = `${left}s`;
      fillEl.style.width = `${((total - left) / total) * 100}%`;
    }
    function tick() {
      left = Math.max(0, left - 1);
      draw();
      if (left === 0) { clearInterval(id); id = null; beep(); }
    }

    startBt.addEventListener('click', () => {
      if (id) return;
      if (left <= 0) left = total;
      draw();
      id = setInterval(tick, 1000);
    });
    pauseBt.addEventListener('click', () => { if (id) { clearInterval(id); id = null; } });
    resetBt.addEventListener('click', () => { left = total; draw(); if (id) { clearInterval(id); id = null; } });

    draw();
    return el;
  }

  // ---------------- Init ----------------
  function init() {
    const form     = $('#wg-form');
    const results  = $('#wg-results');
    const startAll = $('#wg-start-all'); // optional in your UI
    if (!form || !results) return;

    // optional inputs in your simplified UI
    const countEl = $('#wg-count');
    const secsEl  = $('#wg-secs');

    const getCount = () => countEl ? parseInt(countEl.value, 10) : 5;   // default 5
    const getSecs  = () => secsEl  ? parseInt(secsEl.value, 10)  : 30;  // default 30

    // helpers to toggle empty/grid modes for the right column
    function showGrid() {
      results.classList.remove('wg-empty', 'wg-card');
      results.classList.add('wg-grid');
      results.innerHTML = '';
    }
    function showEmpty(message) {
      results.classList.remove('wg-grid');
      results.classList.add('wg-card', 'wg-empty');
      results.innerHTML = `
        <div class="wg-empty-inner">
          <svg class="wg-empty-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 10h4v4H3v-4zm14 0h4v4h-4v-4zM7 11h10v2H7v-2z" fill="currentColor"/>
          </svg>
          <p>${message}</p>
        </div>`;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const body  = $('#wg-body').value;
      const equip = $('#wg-equip').value;
      const count = getCount();
      const secs  = getSecs();

      const pool = poolFor(body).filter(ex =>
        (equip === 'none' ? ex.eq === 'none' : (ex.eq === 'none' || ex.eq === equip))
      );
      const picks = choice(pool, count);

      if (!picks.length) {
        showEmpty('No exercises match that combo. Try a different body part/equipment.');
        return;
      }

      showGrid();
      picks.forEach(ex => results.appendChild(renderCard(ex, secs)));
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    if (startAll) {
      startAll.addEventListener('click', () => {
        $$('.wg-ex .start', results).forEach(btn => btn.click());
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
