
// ---------- tiny helpers ----------
const mf$  = (s, r=document) => r.querySelector(s);
const mf$$ = (s, r=document) => Array.from(r.querySelectorAll(s));

// Run all logic ONLY if the section exists (prevents null errors on other pages)
const MF_ROOT = mf$("#mindfulness-901");
if (MF_ROOT) {
  // ---- small beep (unlocked on first user click) ----
  let MF_AC = null;
  function ensureAC() {
    if (MF_AC) return MF_AC;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    MF_AC = new AC();
    return MF_AC;
  }
  // unlock audio on any button click inside the section
  MF_ROOT.addEventListener("click", () => { try { ensureAC(); } catch(e){} }, { once:true });

  function mfBeep(ms=160, freq=880){
    const ctx = ensureAC();
    if (!ctx) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.value = 0.2;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      setTimeout(() => { try { o.stop(); } catch(e){} }, ms);
    } catch(e) {}
  }

  // ---------- localStorage progress ----------
  const MF_KEY = "gb_mind_sessions";
  function readProg(){
    try { return JSON.parse(localStorage.getItem(MF_KEY) || '{"done":0,"last":null,"streak":0}'); }
    catch { return { done:0, last:null, streak:0 }; }
  }
  function writeProg(p){ try { localStorage.setItem(MF_KEY, JSON.stringify(p)); } catch(e){} }
  function bumpProgress(){
    const p = readProg();
    p.done += 1;
    const today = new Date(); today.setHours(0,0,0,0);
    const last = p.last ? new Date(p.last) : null;
    if (last) {
      const diffDays = Math.round((today - last)/(1000*60*60*24));
      p.streak = diffDays === 1 ? p.streak + 1 : (diffDays === 0 ? p.streak : 1);
    } else { p.streak = 1; }
    p.last = today.toISOString();
    writeProg(p);
    const doneEl = mf$("#mf-done"), streakEl = mf$("#mf-streak");
    if (doneEl)  doneEl.textContent  = p.done;
    if (streakEl)streakEl.textContent= p.streak;
  }
  // initial sync
  (() => {
    const p = readProg();
    const doneEl = mf$("#mf-done"), streakEl = mf$("#mf-streak");
    if (doneEl)  doneEl.textContent  = p.done;
    if (streakEl)streakEl.textContent= p.streak;
  })();

  // ================ Breathing Coach ================
  (() => {
    const startBtn = mf$("#mf-breath-start");
    const stopBtn  = mf$("#mf-breath-stop");
    const phaseEl  = mf$("#mf-phase");
    const orb      = mf$("#mindfulness-901 .mf-orb");
    const patternSel = mf$("#mf-pattern");
    if (!startBtn || !stopBtn || !phaseEl || !orb || !patternSel) return; // guard

    let timer = null, stage = 0, plan = [4,4,6]; // inhale, hold, exhale

    function setPattern(val){
      const parts = (val || "4-4-6").split("-").map(n => parseInt(n,10) || 4);
      plan = [parts[0], parts[1], parts[2]];
    }
    setPattern(patternSel.value || "4-4-6");
    patternSel.addEventListener("change", () => setPattern(patternSel.value));

    function setState(name, secs, scale){
      phaseEl.textContent = name;
      // CSS custom props must be strings
      orb.style.setProperty("--dur", String(secs)+"s");
      orb.style.setProperty("--scale", String(scale));
    }

    function run(){
      const [inh, hold, exh] = plan;
      if (stage === 0) { setState("Inhale", inh, 1.0); stage = 1; timer = setTimeout(run, inh*1000); mfBeep(80,740); return; }
      if (stage === 1) { setState("Hold",   hold, 1.0); stage = 2; timer = setTimeout(run, hold*1000); return; }
      // stage 2
      setState("Exhale", exh, 0.6); stage = 0; timer = setTimeout(run, exh*1000);
    }

    startBtn.addEventListener("click", () => { if (timer) return; stage = 0; run(); });
    stopBtn.addEventListener("click",  () => { if (timer) clearTimeout(timer); timer = null; phaseEl.textContent = "Ready"; orb.style.setProperty("--scale","1"); });
  })();

  // ================ Timer (Pomodoro / Meditation) ================
  (() => {
    const tabs   = mf$$("#mindfulness-901 .mf-tab");
    const panes  = mf$$("#mindfulness-901 [data-pane]");
    const timeEl = mf$("#mf-time");
    const fillEl = mf$("#mf-fill");
    const focusIn = mf$("#mf-focus"), breakIn = mf$("#mf-break"), cyclesIn = mf$("#mf-cycles");
    const medIn   = mf$("#mf-med-min");
    const startBtn = mf$("#mf-start"), pauseBtn = mf$("#mf-pause"), resetBtn = mf$("#mf-reset");
    if (!timeEl || !fillEl || !startBtn || !pauseBtn || !resetBtn) return; // guard

    let mode = "pomo", total = 0, left = 0, running = false, id = null, curCycle = 1, onBreak = false;

    tabs.forEach(b => b.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      mode = b.dataset.tab === "med" ? "med" : "pomo";
      panes.forEach(p => p.hidden = (p.dataset.pane !== mode));
      stopTimer(true);
      preset();
    }));

    function preset(){
      if (mode === "pomo") {
        const f = Math.max(1, parseInt(focusIn?.value ?? "25", 10));
        total = f * 60; curCycle = 1; onBreak = false;
      } else {
        total = Math.max(1, parseInt(medIn?.value ?? "10", 10)) * 60;
      }
      left = total; draw();
    }
    function draw(){
      const m = Math.floor(left/60), s = left%60;
      timeEl.textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
      fillEl.style.width = total ? `${((total-left)/total)*100}%` : "0%";
    }
    function tick(){
      if (!running) return;
      left = Math.max(0, left-1);
      draw();
      if (left === 0) {
        mfBeep(220, 660);
        bumpProgress();
        if (mode === "pomo") {
          if (!onBreak) {
            onBreak = true;
            total = Math.max(1, parseInt(breakIn?.value ?? "5", 10)) * 60; left = total;
          } else {
            onBreak = false; curCycle++;
            const cycles = Math.max(1, parseInt(cyclesIn?.value ?? "4", 10));
            if (curCycle > cycles) { stopTimer(true); return; }
            total = Math.max(1, parseInt(focusIn?.value ?? "25", 10)) * 60; left = total;
          }
          draw();
        } else {
          stopTimer(true);
        }
      }
    }
    function startTimer(){ if (running) return; if (left <= 0) preset(); running = true; id = setInterval(tick, 1000); }
    function pauseTimer(){ if (!running) return; running = false; clearInterval(id); id = null; }
    function stopTimer(reset=false){ pauseTimer(); if (reset) preset(); }

    startBtn.addEventListener("click", startTimer);
    pauseBtn.addEventListener("click", pauseTimer);
    resetBtn.addEventListener("click", () => stopTimer(true));

    [focusIn, breakIn, cyclesIn, medIn].forEach(inp => inp && inp.addEventListener("input", preset));

    preset();
  })();

  // ================ Ambient Sounds ================
  (() => {
    const buttons = mf$$("#mindfulness-901 .mf-chip");
    const vol = mf$("#mf-volume");
    if (!vol || !buttons.length) return;

    // swap to your local assets if needed
    const sounds = {
      rain:   new Audio("sounds/rain.mp3"),
      waves:  new Audio("sounds/waves.mp3"),
      forest: new Audio("sounds/forest.mp3")
    };
    Object.values(sounds).forEach(a => { a.loop = true; a.volume = parseFloat(vol.value || "0.4"); a.preload = "auto"; });

    let current = null;
    function play(key){
      if (current && current !== key) sounds[current].pause();
      if (current === key) {
        sounds[current].pause(); current = null;
        buttons.forEach(b => b.classList.remove("active"));
        return;
      }
      current = key;
      sounds[key].currentTime = 0;
      sounds[key].play().catch(()=>{}); // ignore autoplay block
      buttons.forEach(b => b.classList.toggle("active", b.dataset.sound === key));
    }
    buttons.forEach(b => b.addEventListener("click", () => play(b.dataset.sound)));
    vol.addEventListener("input", () => {
      const v = parseFloat(vol.value || "0.4");
      Object.values(sounds).forEach(a => a.volume = v);
    });
  })();
}

