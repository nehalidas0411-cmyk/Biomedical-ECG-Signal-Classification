/* ══════════════════════════════════════════
   Main JS — Nav, animations, counters
   ══════════════════════════════════════════ */

// ── Mobile nav ────────────────────────────
const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// ── Navbar scroll shadow ──────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.5)' : 'none';
});

// ── Fade-in on scroll ─────────────────────
const fadeEls = document.querySelectorAll('.fade-in');
const fadeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); fadeObs.unobserve(e.target); }
  });
}, { threshold: 0.08 });
fadeEls.forEach(el => fadeObs.observe(el));

// ── Counter animation ─────────────────────
function animateCounter(el, target, duration, decimals) {
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease     = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * ease).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toFixed(decimals);
  }
  requestAnimationFrame(update);
}

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
document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

// ── Smooth scroll — FIXED ─────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href   = a.getAttribute('href');
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
