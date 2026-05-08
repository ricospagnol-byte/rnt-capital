(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const groups = new Map();
  els.forEach(el => {
    const parent = el.parentElement;
    if (parent && parent.classList.contains('reveal-stagger')) {
      const arr = groups.get(parent) || [];
      el.style.setProperty('--i', arr.length);
      arr.push(el);
      groups.set(parent, arr);
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();
