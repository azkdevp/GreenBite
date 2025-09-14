// ========= Mobile Navigation Toggle =========
(function () {
  const header = document.getElementById('cs-navigation');
  if (!header) return; // safety check

  const toggle = header.querySelector('.cs-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    header.classList.toggle('cs-active');
    document.body.classList.toggle('cs-open');
  });

  // Close menu when clicking a link (mobile)
  header.querySelectorAll('.cs-li-link').forEach(a => {
    a.addEventListener('click', () => {
      header.classList.remove('cs-active');
      document.body.classList.remove('cs-open');
    });
  });
})();
