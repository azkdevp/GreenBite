/* ========= GreenBite — Contact & FAQ (contact.js) ========= */
(() => {
  // run only on this page
  const form = document.getElementById("cs-form-323-2320");
  const faqRoot = document.getElementById("faq-1466");
  if (!form && !faqRoot) return;

  /* -------------------- Helpers -------------------- */
  const $ = (s, r=document) => r.querySelector(s);
  const create = (tag, cls) => { const el = document.createElement(tag); if (cls) el.className = cls; return el; };

  function getField(nameSel){
    // supports your exact names (note: Message has capital M)
    return form?.querySelector(nameSel);
  }

  /* -------------------- Validation -------------------- */
  const nameEl = getField('input[name="name"]');
  const emailEl = getField('input[name="email"]');
  const phoneEl = getField('input[name="phone"]'); // optional for brief, but your HTML has required
  const msgEl  = getField('textarea[name="Message"]');

  function showError(input, message){
    if (!input) return;
    clearError(input);
    input.classList.add('cs-invalid');
    const hint = create('small', 'cs-error');
    hint.textContent = message;
    input.insertAdjacentElement('afterend', hint);
  }
  function clearError(input){
    if (!input) return;
    input.classList.remove('cs-invalid');
    const sib = input.nextElementSibling;
    if (sib && sib.classList.contains('cs-error')) sib.remove();
  }

  function validName(v){ return typeof v === 'string' && v.trim().length >= 2; }
  function validEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || ''); }
  function validPhone(v){
    // loose check: digits, spaces, +, -, parentheses; at least 7 digits
    const digits = (v || '').replace(/\D/g,'');
    return digits.length >= 7;
  }
  function validMessage(v){ return typeof v === 'string' && v.trim().length >= 10; }

  function validate(){
    let ok = true;
    const n = nameEl?.value || '';
    const e = emailEl?.value || '';
    const p = phoneEl?.value || '';
    const m = msgEl?.value || '';

    // Name
    if (!validName(n)) { showError(nameEl, 'Please enter your name (min 2 characters).'); ok = false; } else { clearError(nameEl); }
    // Email
    if (!validEmail(e)) { showError(emailEl, 'Please enter a valid email.'); ok = false; } else { clearError(emailEl); }
    // Phone (your HTML marks required; if you remove required, this will still accept empty)
    if (phoneEl && phoneEl.hasAttribute('required')) {
      if (!validPhone(p)) { showError(phoneEl, 'Please enter a valid phone number.'); ok = false; } else { clearError(phoneEl); }
    } else if (p && !validPhone(p)) {
      showError(phoneEl, 'Please enter a valid phone number.'); ok = false;
    } else { clearError(phoneEl); }
    // Message
    if (!validMessage(m)) { showError(msgEl, 'Please write at least 10 characters.'); ok = false; } else { clearError(msgEl); }

    return ok;
  }

  // live-clear errors
  [nameEl, emailEl, phoneEl, msgEl].forEach(inp => {
    inp?.addEventListener('input', () => clearError(inp));
  });

  /* -------------------- localStorage -------------------- */
  const KEY = 'gb_feedback';
  function readList(){
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }
  function writeList(list){
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e){}
  }
  // prefill from last feedback (nice UX)
  (() => {
    const list = readList();
    const last = list[list.length - 1];
    if (last) {
      if (nameEl && !nameEl.value) nameEl.value = last.name || '';
      if (emailEl && !emailEl.value) emailEl.value = last.email || '';
    }
  })();

  /* -------------------- Submit -------------------- */
  if (form) {
    // add a lightweight status area
    const status = create('p', 'cs-status');
    status.setAttribute('role','status');
    form.appendChild(status);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.textContent = '';

      if (!validate()) {
        status.textContent = 'Please fix the highlighted fields.';
        status.classList.remove('success');
        status.classList.add('error');
        return;
      }

      const payload = {
        name: nameEl?.value.trim(),
        email: emailEl?.value.trim(),
        phone: phoneEl?.value.trim(),
        message: msgEl?.value.trim(),
        ts: new Date().toISOString()
      };

      const list = readList();
      list.push(payload);
      writeList(list);

      // friendly confirmation (keeps the page; matches the brief)
      status.textContent = 'Thanks! Your message has been sent.';
      status.classList.remove('error');
      status.classList.add('success');

      form.reset();
      // keep convenience: remember name/email for next time
      try {
        const memo = { name: payload.name, email: payload.email };
        localStorage.setItem('gb_feedback_last', JSON.stringify(memo));
      } catch(e){}
    });
  }

  /* -------------------- FAQ Accordion (accessible) -------------------- */
  if (faqRoot) {
    const items = Array.from(faqRoot.querySelectorAll('.cs-faq-item'));
    items.forEach((li, idx) => {
      const btn = li.querySelector('button.cs-button');
      const p   = li.querySelector('.cs-item-p');
      if (!btn || !p) return;

      // ARIA wiring
      const cid = `faq-panel-${idx+1}`;
      btn.setAttribute('aria-controls', cid);
      btn.setAttribute('aria-expanded', li.classList.contains('active') ? 'true' : 'false');
      p.id = cid;
      p.hidden = !li.classList.contains('active');

      // click toggle (only one open at a time for neatness)
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        items.forEach(other => {
          const ob = other.querySelector('button.cs-button');
          const op = other.querySelector('.cs-item-p');
          if (ob && op) {
            ob.setAttribute('aria-expanded','false');
            op.hidden = true;
            other.classList.remove('active');
          }
        });
        if (!isOpen) {
          btn.setAttribute('aria-expanded','true');
          p.hidden = false;
          li.classList.add('active');
        }
      });

      // keyboard: Up/Down to move focus between questions
      btn.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const kv = e.key === 'ArrowDown' ? 1 : -1;
        const next = items[(idx + kv + items.length) % items.length]?.querySelector('button.cs-button');
        next?.focus();
      });
    });
  }
})();
