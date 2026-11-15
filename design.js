/* Zyberlane XR presentation layer.
   Progressive enhancement only; playback/orientation code lives in app.js. */
(() => {
  'use strict';
  const root = document.documentElement;
  const theater = document.getElementById('theater');
  const reveals = Array.from(document.querySelectorAll('[data-reveal]'));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let revealObserver = null;

  function revealEverything() {
    reveals.forEach(el => el.classList.add('is-visible'));
  }
  function setupReveals() {
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
    if (prefersReduced.matches || !('IntersectionObserver' in window)) {
      root.classList.remove('has-js');
      revealEverything();
      return;
    }
    root.classList.add('has-js');
    revealObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    for (const el of reveals) {
      const delay = el.dataset.delay;
      if (delay && /^\d+$/.test(delay)) el.style.setProperty('--reveal-delay', delay);
      if (!el.classList.contains('is-visible')) revealObserver.observe(el);
    }
  }
  setupReveals();
  if (prefersReduced.addEventListener) {
    prefersReduced.addEventListener('change', setupReveals);
  } else if (prefersReduced.addListener) {
    prefersReduced.addListener(setupReveals);
  }

  // Native fullscreen and CSS fallback must escape the normal stage card
  // overflow/entrance-transform without moving the actual WebGL canvas.
  function syncExpandedLayout() {
    if (!theater) return;
    const expanded =
      theater.classList.contains('fullscreen-simulated') ||
      theater.classList.contains('vr-active') ||
      document.fullscreenElement === theater;
    root.classList.toggle('xr-expanded', expanded);
  }
  if (theater) {
    const observer = new MutationObserver(syncExpandedLayout);
    observer.observe(theater, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('fullscreenchange', syncExpandedLayout);
    document.addEventListener('webkitfullscreenchange', syncExpandedLayout);
    syncExpandedLayout();
  }

  // Pauses pure-decoration marquee work when hidden. The immersive WebGL
  // renderer already independently stops drawing in hidden documents.
  document.addEventListener('visibilitychange', () => {
    root.classList.toggle('xr-page-hidden', document.hidden);
  });
})();