/* ========= GreenBite Recipes (recipes.js) =========
   - Cards + search/filter
   - Accessible modal (focus trap + return focus)
   - Empty state message
   - Hash deep-linking (#recipe-id)
*/
(function () {
  // ---------- Data ----------
  const RECIPES = [
    {
      id: "oats-bowl",
      name: "Peanut Butter Banana Oats",
      category: ["breakfast", "vegetarian"],
      image: "img/recipe_1.jpg",
      description: "Creamy oats topped with banana & PB for long-lasting energy.",
      ingredients: ["1/2 cup rolled oats","1 cup milk (or plant milk)","1 banana, sliced","1 tbsp peanut butter","1 tsp honey (optional)","Pinch of cinnamon","Pinch of salt"],
      steps: [
        "Add oats, milk, salt to a small pot and simmer 3–5 minutes, stirring.",
        "Pour into a bowl and top with banana slices.",
        "Drizzle peanut butter and honey, finish with cinnamon."
      ],
      nutrition: { Calories: 380, Protein: "12 g", Carbs: "57 g", Fat: "12 g", Fiber: "7 g" }
    },
    {
      id: "chickpea-salad",
      name: "Mediterranean Chickpea Salad",
      category: ["lunch", "vegetarian"],
      image: "img/recipe_2.jpg",
      description: "High-protein bowl with cucumbers, tomatoes, olive oil & lemon.",
      ingredients: ["1 can chickpeas, rinsed","1 cup cucumber, diced","1 cup tomato, diced","2 tbsp red onion, thinly sliced","2 tbsp olive oil","1 tbsp lemon juice","Salt & pepper","Parsley (optional)"],
      steps: [
        "Combine chickpeas, cucumber, tomato, onion in a bowl.",
        "Whisk olive oil, lemon, salt & pepper; toss with salad.",
        "Top with parsley and serve."
      ],
      nutrition: { Calories: 420, Protein: "15 g", Carbs: "45 g", Fat: "18 g", Fiber: "12 g" }
    },
    {
      id: "stirfry-chicken",
      name: "Quick Chicken Veggie Stir-Fry",
      category: ["dinner"],
      image: "img/recipe_3.jpg",
      description: "Lean chicken with colorful veggies in a 10-minute sauce.",
      ingredients: ["200 g chicken breast, sliced","2 cups mixed veggies (broccoli, carrots, peppers)","1 tbsp oil","2 tbsp soy sauce","1 tsp honey","1 tsp garlic, minced","1 tsp corn starch + 2 tbsp water"],
      steps: [
        "Stir-fry chicken in oil until no longer pink; remove.",
        "Stir-fry veggies 3–4 minutes.",
        "Return chicken; add soy, honey, garlic, then slurry; toss until glossy."
      ],
      nutrition: { Calories: 350, Protein: "34 g", Carbs: "22 g", Fat: "12 g", Fiber: "5 g" }
    },
    {
      id: "tuna-wrap",
      name: "High-Protein Tuna Wrap",
      category: ["lunch"],
      image: "img/recipe_4.jpg",
      description: "Tuna, Greek yogurt, crunchy veggies in a whole-grain wrap.",
      ingredients: ["1 can tuna (in water), drained","2 tbsp Greek yogurt","1 tsp mustard","1/4 cup diced cucumber & carrot","1 whole-grain tortilla","Salt & pepper"],
      steps: [
        "Mix tuna, yogurt, mustard, salt & pepper.",
        "Add diced veggies; spread on tortilla; roll tightly.",
        "Slice and serve."
      ],
      nutrition: { Calories: 320, Protein: "28 g", Carbs: "30 g", Fat: "10 g", Fiber: "6 g" }
    },
    {
      id: "yogurt-parfait",
      name: "Berry Yogurt Parfait",
      category: ["snack", "vegetarian"],
      image: "img/recipe_5.jpg",
      description: "Layers of yogurt, berries and oats for a quick sweet bite.",
      ingredients: ["1/2 cup Greek yogurt","1/2 cup mixed berries","2 tbsp quick oats or granola","1 tsp honey (optional)"],
      steps: ["Layer yogurt, berries and oats in a glass.","Drizzle honey and enjoy."],
      nutrition: { Calories: 200, Protein: "12 g", Carbs: "28 g", Fat: "3 g", Fiber: "3 g" }
    },
    {
      id: "veggie-curry",
      name: "One-Pot Veggie Curry",
      category: ["dinner", "vegetarian"],
      image: "img/recipe_6.jpg",
      description: "Coconut-based curry with mixed vegetables and spices.",
      ingredients: ["1 tbsp oil","1 onion, chopped","2 cups mixed vegetables","1 tbsp curry powder","1 cup coconut milk","1/2 cup water","Salt to taste"],
      steps: [
        "Sauté onion in oil; add curry powder.",
        "Add vegetables; cook 2–3 minutes.",
        "Pour coconut milk + water; simmer 8–10 minutes; season."
      ],
      nutrition: { Calories: 300, Protein: "6 g", Carbs: "18 g", Fat: "22 g", Fiber: "5 g" }
    }
  ];

  // ---------- Elements ----------
  const listEl = document.getElementById("recipe-list");
  const searchEl = document.getElementById("recipe-search");
  const filterBtns = document.querySelectorAll('#collection-1602 .cs-button-group [data-filter]');
  const dialog = document.getElementById("recipe-dialog");
  const dialogBody = document.getElementById("recipe-body");
  const titleEl = document.getElementById("recipe-title");

  let state = { query: "", filter: "all" };
  let lastOpener = null; // for focus return

  // ---------- Templates ----------
  const eyeSVG = () => `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" width="20" height="20">
      <path fill="currentColor"
        d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12
           a5 5 0 1 1 0-10a5 5 0 0 1 0 10zm0-2.5a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z"/>
    </svg>`;

  const chipHTML = (cats) => cats.map(c => `<span class="gb-chip">${c}</span>`).join(" ");

  const cardHTML = (r) => `
    <div class="cs-item" data-name="${r.name.toLowerCase()}" data-cat="${r.category.join(" ")}" data-animate="fade-up">
      <a href="#${r.id}" class="cs-link" data-id="${r.id}" aria-label="Open ${r.name}">
        <div class="cs-picture-group">
          <picture class="cs-picture">
            <img src="${r.image}" alt="${r.name}" loading="lazy" decoding="async" style="object-fit:cover;">
          </picture>
        </div>
        <div class="cs-details">
          ${chipHTML(r.category)}
          <h3 class="cs-name">${r.name}</h3>
          <p class="cs-item-text" style="margin:0;">${r.description}</p>
          <div class="cs-actions" style="margin-top:1rem; align-items:center;">
            <span class="cs-category" aria-hidden="true"></span>
            <button class="gb-view-btn" data-id="${r.id}" aria-label="View recipe">
              ${eyeSVG()} <span>View Recipe</span>
            </button>
          </div>
        </div>
      </a>
    </div>
  `;

  const emptyHTML = (q, f) => `
    <div class="gb-empty" role="status" aria-live="polite" style="padding:1rem; border:1px dashed #dad9e3; border-radius:.75rem;">
      No recipes found${q ? ` for “${escapeHTML(q)}”` : ""}${f && f!=="all" ? ` in ${f}` : ""}. Try a different search or filter.
    </div>
  `;

  // ---------- Utils ----------
  function escapeHTML(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  function renderList() {
    if (!listEl) return;
    const q = state.query.trim().toLowerCase();
    const f = state.filter;

    const filtered = RECIPES.filter(r => {
      const matchText = r.name.toLowerCase().includes(q);
      const matchFilter = (f === "all") || r.category.includes(f);
      return matchText && matchFilter;
    });

    listEl.innerHTML = filtered.length ? filtered.map(cardHTML).join("") : emptyHTML(state.query, state.filter);
  }

  function nutritionTable(nut) {
    const rows = Object.entries(nut)
      .map(([k,v]) => `<tr><th class="gb-ntk">${k}</th><td class="gb-ntv">${v}</td></tr>`)
      .join("");
    return `
      <table class="gb-nutrition">
        <thead>
          <tr><th colspan="2" class="gb-nt-head">Nutrition (per serving)</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function openModal(recipe, openerEl) {
    if (!dialog) return;
    lastOpener = openerEl || null;

    titleEl.textContent = recipe.name;
    dialogBody.innerHTML = `
      <div class="gb-modal-grid">
        <img src="${recipe.image}" alt="${recipe.name}" class="gb-modal-img">
        <p class="gb-modal-desc">${recipe.description}</p>

        <div class="gb-modal-two">
          <div>
            <h4 class="gb-h4">Ingredients</h4>
            <ul class="gb-ul">
              ${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}
            </ul>
          </div>
          <div>
            <h4 class="gb-h4">Steps</h4>
            <ol class="gb-ol">
              ${recipe.steps.map(s => `<li>${s}</li>`).join("")}
            </ol>
          </div>
        </div>

        ${nutritionTable(recipe.nutrition)}
      </div>
    `;

    // show modal + focus trap
    if (dialog.showModal) {
      dialog.showModal();
    } else {
      // basic fallback if <dialog> not supported
      dialog.setAttribute('open','');
    }

    // focus management
    const focusables = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusables[0], last = focusables[focusables.length - 1];
    (first || dialog).focus({ preventScroll: true });

    function trap(e){
      if (e.key !== 'Tab') return;
      if (!focusables.length) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    dialog.addEventListener('keydown', trap);

    // close on backdrop click
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!inside) closeModal();
    }, { once: true });

    // close handler for the built-in close button
    dialog.querySelector('button[value="close"]')?.addEventListener('click', closeModal, { once: true });

    // Esc closes natively; return focus on 'close' event
    dialog.addEventListener('close', returnFocus, { once: true });
  }

  function closeModal(){
    if (!dialog) return;
    if (dialog.open && dialog.close) dialog.close(); else dialog.removeAttribute('open');
    returnFocus();
  }

  function returnFocus(){
    if (lastOpener) {
      lastOpener.focus({ preventScroll: true });
      lastOpener = null;
    }
  }

  function openById(id, opener) {
    const recipe = RECIPES.find(r => r.id === id);
    if (recipe) openModal(recipe, opener || listEl?.querySelector(`[data-id="${id}"]`));
  }

  // ---------- Events ----------
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("cs-active"));
      btn.classList.add("cs-active");
      state.filter = btn.getAttribute("data-filter");
      renderList();
    });
  });

  searchEl?.addEventListener("input", () => {
    state.query = searchEl.value || "";
    renderList();
  });

  listEl?.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-id]");
    if (!opener) return;
    e.preventDefault();
    const id = opener.getAttribute("data-id");
    // update hash (deep link)
    history.replaceState(null, "", `#${id}`);
    openById(id, opener);
  });

  // Hash deep-link on load
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) openById(id);
  });

  // ---------- Init ----------
  renderList();

  // reveal any deep link right away
  const initialId = location.hash.replace('#','');
  if (initialId) openById(initialId);
})();
