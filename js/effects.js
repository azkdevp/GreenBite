/* GreenBite motion + parallax (vanilla, a11y-friendly)
   - Scroll reveal via data-animate
   - Parallax via data-parallax, data-speed (0.1–0.6 good range)
*/

(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // -------- Scroll Reveal --------
  if (!prefersReduced) {
    const revealEls = document.querySelectorAll('[data-animate]');
    // Start hidden
    revealEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = initialTransform(el.dataset.animate);
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      el.style.willChange = 'opacity, transform';
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        requestAnimationFrame(() => {
          target.style.opacity = '1';
          target.style.transform = 'none';
          target.classList.add('in-view');
        });
        io.unobserve(target); // reveal once
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

    revealEls.forEach(el => io.observe(el));

    function initialTransform(type) {
      switch ((type || '').toLowerCase()) {
        case 'fade-up': return 'translateY(16px)';
        case 'fade-down': return 'translateY(-16px)';
        case 'fade-left': return 'translateX(-16px)';
        case 'fade-right': return 'translateX(16px)';
        case 'zoom-in': return 'scale(.96)';
        default: return 'translateY(16px)';
      }
    }
  }

  // -------- Parallax --------
  // Use data-parallax on a wrapper; optional data-speed (0.1–0.6)
  const pxEls = document.querySelectorAll('[data-parallax]');
  if (pxEls.length && !prefersReduced) {
    const onScroll = () => {
      const vh = window.innerHeight || 1;
      pxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < vh;
        if (!visible) return;
        const speed = clamp(parseFloat(el.dataset.speed) || 0.25, 0.05, 0.8);
        // progress from 0 (enter) to 1 (leave)
        const progress = clamp(1 - (rect.bottom / (vh + rect.height)), 0, 1);
        const offset = Math.round((progress - 0.5) * 100 * speed); // px translate
        el.style.transform = `translateY(${offset}px)`;
      });
    };
    const rafScroll = () => {
      pending = false;
      onScroll();
    };
    let pending = false;
    window.addEventListener('scroll', () => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(rafScroll);
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    // init
    pxEls.forEach(el => {
      el.style.willChange = 'transform';
      el.style.transition = 'transform .2s ease-out'; // subtle smoothing
    });
    onScroll();
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
})();
