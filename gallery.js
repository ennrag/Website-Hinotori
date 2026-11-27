/* ============================================================
   BILDER VERWALTEN
   1. Bild (jpg) in den Ordner images/galerie/ legen
   2. Dateiname unten bei der passenden Kategorie eintragen.
      Optional mit Bildunterschrift: 'datei.jpg | Text'
   ============================================================ */
const ALBUMS = {
  training: { label: 'Training', files: [
    'IMG-20191106-WA0010.jpg | Pratzentraining im Dojo',
    'IMG-20191112-WA0006.jpeg | Aufwärmen vor dem Training',
    'IMG-20191026-WA0022.jpg | Schwarzgurte im Hinotori-Dojo',
    'IMG-20191026-WA0023.jpg | Gruppenbild im Dojo',
  ]},
  kinder:   { label: 'Kindertraining', files: [
    // 'kinder-01.jpg | Kindertraining am Freitag',
  ]},
  turniere: { label: 'Turniere', files: [
    'IMG-20191110-WA0013.jpg | Mit Pokalen vom Turnier, November 2019',
    'IMG-20191110-WA0017.jpg | Siegerfoto nach dem Turnier, November 2019',
  ]},
  events:   { label: 'Events', files: [
    // 'event-01.jpg | Vereinsanlass',
  ]},
};

(() => {
  const $ = s => document.querySelector(s);
  const grid = $('#gallery'), filters = $('#filters'), count = $('#count'), empty = $('#empty');
  const lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbNum = $('#lb-num');
  let current = 'alle', shown = [], idx = 0, opener = null;

  // Bilder aufbauen
  const items = Object.entries(ALBUMS).flatMap(([cat, a]) => a.files.map(f => {
    const [file, cap = ''] = f.split('|').map(s => s.trim());
    return { cat, label: a.label, src: `images/galerie/${file}`, cap };
  }));
  items.forEach(it => {
    const fig = document.createElement('figure');
    fig.className = 'shot'; fig.dataset.cat = it.cat;
    fig.innerHTML = `<button type="button" aria-label="Bild vergrössern${it.cap ? ': ' + it.cap : ''}">
      <img loading="lazy" decoding="async" src="${it.src}" alt="${it.cap || it.label}">
      <span class="tag-cat">${it.label}</span></button>${it.cap ? `<figcaption>${it.cap}</figcaption>` : ''}`;
    const img = fig.querySelector('img');
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => { fig.remove(); it.broken = true; update(); });
    fig.querySelector('button').addEventListener('click', e => open(fig, e.currentTarget));
    it.el = fig; grid.append(fig);
  });

  // Filter-Chips
  const cats = [['alle', 'Alle'], ...Object.entries(ALBUMS).filter(([c]) => items.some(i => i.cat === c)).map(([c, a]) => [c, a.label])];
  filters.innerHTML = cats.map(([c, l]) => `<button type="button" class="chip" data-cat="${c}" aria-pressed="${c === current}">${l}</button>`).join('');
  filters.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    current = b.dataset.cat;
    filters.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    update(true);
  });
  if (cats.length < 3) filters.hidden = true;

  function update(animate) {
    const live = items.filter(i => !i.broken);
    shown = live.filter(i => current === 'alle' || i.cat === current);
    live.forEach(i => { i.el.hidden = !shown.includes(i); });
    shown.forEach((i, n) => {
      if (animate) { i.el.classList.remove('in'); i.el.style.transitionDelay = Math.min(n, 10) * 50 + 'ms'; requestAnimationFrame(() => i.el.classList.add('in')); }
    });
    count.textContent = shown.length ? `${shown.length} ${shown.length === 1 ? 'Bild' : 'Bilder'}` : '';
    empty.hidden = live.length > 0;
  }

  // Einblenden beim Scrollen
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: .1 });
  items.forEach(i => { i.el.classList.add('reveal'); io.observe(i.el); });
  update();

  // Lightbox
  function show(n) {
    idx = (n + shown.length) % shown.length;
    const it = shown[idx];
    lbImg.classList.remove('in');
    lbImg.onload = () => lbImg.classList.add('in');
    lbImg.src = it.src; lbImg.alt = it.cap || it.label;
    lbCap.textContent = it.cap || it.label;
    lbNum.textContent = `${idx + 1} / ${shown.length}`;
    const nx = new Image(); nx.src = shown[(idx + 1) % shown.length].src;
    document.querySelectorAll('.lb-prev,.lb-next').forEach(b => b.hidden = shown.length < 2);
  }
  function open(fig, btn) {
    opener = btn; idx = shown.findIndex(i => i.el === fig);
    show(idx); lb.showModal(); document.documentElement.style.overflow = 'hidden';
  }
  lb.addEventListener('close', () => { document.documentElement.style.overflow = ''; opener && opener.focus(); });
  $('.lb-close').onclick = () => lb.close();
  $('.lb-prev').onclick = () => show(idx - 1);
  $('.lb-next').onclick = () => show(idx + 1);
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let sx = null;
  lb.addEventListener('pointerdown', e => sx = e.clientX);
  lb.addEventListener('pointerup', e => {
    if (sx !== null && Math.abs(e.clientX - sx) > 50) show(idx + (e.clientX < sx ? 1 : -1));
    sx = null;
  });
})();