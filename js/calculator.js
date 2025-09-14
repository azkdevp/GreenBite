// js/calculator.js
(function () {
  const $id = (id) => document.getElementById(id);

  // Mifflin–St Jeor BMR
  const bmrCalc = (gender, kg, cm, age) => {
    const base = 10 * kg + 6.25 * cm - 5 * age;
    return Math.round(gender === "male" ? base + 5 : base - 161);
  };

  const animateNumber = (el, value, suffix = "", ms = 900) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { el.textContent = `${value}${suffix}`; return; }

    const start = 0, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      const n = Math.round(start + (value - start) * p);
      el.textContent = `${n}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const bmiClass = (bmi) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25)   return "Normal weight";
    if (bmi < 30)   return "Overweight";
    return "Obesity";
  };

  const form = $id("calcForm");
  const wrap = document.querySelector(".cn-wrap");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const age    = +$id("age").value;
    const sex    = $id("gender").value;
    const height = +$id("height").value; // cm
    const weight = +$id("weight").value; // kg
    const act    = +$id("activity").value;

    if (!age || !height || !weight || !act) return;

    // Calculations
    const bmr  = bmrCalc(sex, weight, height, age);
    const tdee = Math.round(bmr * act);

    // BMI
    const hM  = height / 100;
    const bmi = +(weight / (hM * hM)).toFixed(1);

    // Reveal result cards
    ["cardMeta","cardMacros","cardGoals"].forEach(id => $id(id).hidden = false);

    // Switch layout from intro-center to two-column
    wrap && wrap.classList.remove("cn-center");

    // Metabolic card
    animateNumber($id("bmrVal"),  bmr,  " calories/day");
    animateNumber($id("tdeeVal"), tdee, " calories/day");
    $id("bmiVal").textContent  = bmi.toString();
    $id("bmiNote").textContent = bmiClass(bmi);

    // Macro split 50/20/30
    const carbK = tdee * 0.50, protK = tdee * 0.20, fatK = tdee * 0.30;
    const carbG = Math.round(carbK / 4);
    const protG = Math.round(protK / 4);
    const fatG  = Math.round(fatK / 9);

    $id("carbG").textContent = `${carbG}g`;
    $id("protG").textContent = `${protG}g`;
    $id("fatG").textContent  = `${fatG}g`;

    // Bars (widths reflect % of calories)
    $id("carbBar").style.width = "50%";
    $id("protBar").style.width = "20%";
    $id("fatBar").style.width  = "30%";

    // Common goals (±500 kcal; guard lower bound)
    const loss = Math.max(1200, tdee - 500);
    const gain = tdee + 500;
    $id("lossCal").textContent  = `${loss} cal/day`;
    $id("maintCal").textContent = `${tdee} cal/day`;
    $id("gainCal").textContent  = `${gain} cal/day`;

    // Move focus for a11y + scroll into view on mobile
    $id("cardMeta").setAttribute("tabindex","-1");
    $id("cardMeta").focus({ preventScroll: true });
    $id("cardMeta").scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();
