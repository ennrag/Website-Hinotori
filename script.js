(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const header = $('.site-header'), btn = $('.menu-btn'), nav = $('#nav'), hero = $('.hero');

  // Mobile-Menü
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', e => {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
  });

  // Heutigen Trainingstag markieren
  const li = $(`#week li[data-day="${new Date().getDay()}"]`);
  if (li) { li.classList.add('today'); li.setAttribute('aria-label', 'Heute'); }
  const yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  // Feine Linie unter dem Header, sobald gescrollt wird
  const onScroll = () => header.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Aktiver Menüpunkt
  const links = $$('.nav a[href^="#"]:not(.btn)');
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const t = $(a.getAttribute('href')); if (t) spy.observe(t); });

  // Back to top button
  const backToTopBtn = document.createElement('button');
  backToTopBtn.innerHTML = '↑';
  backToTopBtn.setAttribute('aria-label', 'Zurück nach oben');
  backToTopBtn.style.cssText = 'position:fixed;right:1.5rem;bottom:1.5rem;width:50px;height:50px;border-radius:50%;background:var(--red);color:#fff;border:none;font-size:1.5rem;cursor:pointer;opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;z-index:100;box-shadow:0 4px 12px rgba(0,0,0,.25);align-items:center;justify-content:center;';
  document.body.appendChild(backToTopBtn);

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopBtn.style.opacity = '1';
      backToTopBtn.style.visibility = 'visible';
    } else {
      backToTopBtn.style.opacity = '0';
      backToTopBtn.style.visibility = 'hidden';
    }
  });

  // ===== Ruhiges Einblenden mit GSAP =====
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power2.out', duration: 0.8 });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const heroItems = '.hero-emblem, .hero h1, .hero .lead, .hero blockquote, .hero .actions, .hero .facts';
  const mm = gsap.matchMedia();

  mm.add({ motion: '(prefers-reduced-motion: no-preference)', still: '(prefers-reduced-motion: reduce)' }, ctx => {
    if (ctx.conditions.still) { gsap.set(heroItems, { autoAlpha: 1 }); return; }

    // Hero: Inhalte erscheinen nacheinander
    if (hero) gsap.fromTo(heroItems, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.08, delay: 0.1 });

    // Inhalte blenden beim Scrollen leicht von unten ein
    const items = $$('.section h2, .welcome-box > *, .prose, .values, .muted, .team li, .week li, .rows li, .affiliation-box, .emblem-row figure, .ngu-text > *, .bring, .cta p, .cta .btn, address, #bilder .btn');
    gsap.set(items, { autoAlpha: 0, y: 16 });
    ScrollTrigger.batch(items, {
      start: 'top 92%',
      once: true,
      onEnter: batch => gsap.to(batch, { autoAlpha: 1, y: 0, stagger: 0.06, overwrite: true })
    });
  });

  // Positionen neu berechnen, sobald Bilder und Schriften geladen sind
  addEventListener('load', () => ScrollTrigger.refresh());
})();
