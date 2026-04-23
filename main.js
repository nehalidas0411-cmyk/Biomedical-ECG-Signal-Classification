/* ══════════════════════════════════════════
   Main JS — Nav, animations, counters
   ══════════════════════════════════════════ */

// ── Mobile nav ────────────────────────────
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ── Navbar scroll shadow ──────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 20
    ? '0 4px 24px rgba(0,0,0,0.5)' : 'none';
});

// ── Fade-in on scroll ─────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      fadeObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
fadeEls.forEach(el => fadeObs.observe(el));

// ── Counter animation ─────────────────────
function animateCounter(el, target, duration, decimals) {
  const start     = performance.now();
  const startVal  = 0;
  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    const current  = startVal + (target - startVal) * ease;
    el.textContent = current.toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toFixed(decimals);
  }
  requestAnimationFrame(update);
}

const statEls = document.querySelectorAll('[data-target]');
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const target   = parseFloat(e.target.dataset.target);
      const decimals = target % 1 !== 0 ? 2 : 0;
      animateCounter(e.target, target, 1800, decimals);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
statEls.forEach(el => counterObs.observe(el));

// ── Smooth anchor scroll ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
