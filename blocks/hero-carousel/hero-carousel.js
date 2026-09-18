/**
 * hero-carousel — home hero (Splide loop recreated: 750px full-bleed photo slides, progress-bar tabs).
 * Schema: stardust/eds-schema/home.json § mainContainWrap (hero-slide ×4, wd-progress-item ×4).
 *
 * Authoring rows (positional by SHAPE, not index):
 *   slide rows — 2 cells: <picture> | <p>headline</p> <p>lede</p> <p><strong><a>CTA</a></strong></p>
 *   tab rows   — 2 cells, no picture: <p>tab title</p> | <p>tab description</p>
 * Template-slotted (node slotting, EW1): authored elements are MOVED into the slide/tab templates.
 * Live behaviour (stardust/replica/motion/home.json): progress items are role=button; click → is-active on
 * the item and the track moves; autoplay every 5 s with the fill width transitioning; starts on slide 1 like live. Clones are presentational (no text, stripInstrumentation — EW4).
 * @ew-exempt none — every authored text is moved.
 */
function stripInstrumentation(el) {
  el.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => { n.removeAttribute('data-prose-index'); n.removeAttribute('data-image-index'); });
  el.removeAttribute('data-prose-index');
  return el;
}

function bgFrom(picture) {
  const img = picture.querySelector('img');
  const src = img?.currentSrc || img?.src || '';
  return src;
}

export default function decorate(block) {
  const rows = [...block.children];
  const slideRows = rows.filter((r) => r.querySelector('picture, img'));
  const tabRows = rows.filter((r) => !r.querySelector('picture, img'));

  const track = document.createElement('ul');
  track.className = 'hero-track';
  const slides = slideRows.map((row, i) => {
    const [mediaCell, copyCell] = row.children;
    const li = document.createElement('li');
    li.className = 'hero-slide';
    if (i === 1) li.classList.add('darken-left'); // measured scrim on slide 2 (site .darken-left)
    const bg = document.createElement('div');
    bg.className = 'hero-bg';
    const pic = mediaCell.querySelector('picture, img');
    if (pic) {
      const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
      if (img) { img.loading = i === 0 ? 'eager' : 'lazy'; if (i === 0) img.setAttribute('fetchpriority', 'high'); }
      bg.append(pic); // authored picture is the background layer
    }
    const contain = document.createElement('div');
    contain.className = 'contain';
    const rowEl = document.createElement('div');
    rowEl.className = 'hero-row';
    const copy = document.createElement('div');
    copy.className = 'hero-copy';
    const ps = [...copyCell.querySelectorAll('p, h1, h2, h3')];
    const ctas = ps.filter((p) => p.querySelector('a'));
    const text = ps.filter((p) => !p.querySelector('a'));
    const slot = (className, node) => { const w = document.createElement('div'); w.className = className; w.append(node); copy.append(w); };
    if (text[0]) slot('headline', text[0]);
    if (text[1]) slot('lede', text[1]);
    text.slice(2).forEach((p) => copy.append(p));
    if (ctas.length) { const actions = document.createElement('div'); actions.className = 'actions on-media'; ctas.forEach((p) => actions.append(p)); copy.append(actions); }
    rowEl.append(copy);
    contain.append(rowEl);
    li.append(bg, contain);
    void bgFrom;
    return li;
  });

  // Splide loop geometry: 2 clones before, 2 after (presentational)
  const n = slides.length;
  const before = [slides[n - 2], slides[n - 1]].filter(Boolean).map((s) => stripInstrumentation(s.cloneNode(true)));
  const after = [slides[0], slides[1]].filter(Boolean).map((s) => stripInstrumentation(s.cloneNode(true)));
  [...before, ...after].forEach((c) => { c.classList.add('hero-clone'); c.setAttribute('aria-hidden', 'true'); c.querySelectorAll('a').forEach((a) => { a.removeAttribute('href'); a.setAttribute('tabindex', '-1'); }); c.querySelectorAll('p, h1, h2, h3, h4').forEach((t) => { t.textContent = ''; }); c.querySelectorAll('img').forEach((im) => { im.alt = ''; im.loading = 'lazy'; }); });
  before.forEach((c) => track.append(c));
  slides.forEach((s) => track.append(s));
  after.forEach((c) => track.append(c));
  const clonesBefore = before.length;

  const progress = document.createElement('div');
  progress.className = 'hero-progress';
  progress.style.setProperty('--wd-count', String(tabRows.length || n));
  const bars = document.createElement('div');
  bars.className = 'wd-bars contain';
  const items = tabRows.map((row) => {
    const [titleCell, descCell] = row.children;
    const item = document.createElement('div');
    item.className = 'wd-progress-item';
    item.setAttribute('role', 'button');
    item.tabIndex = 0;
    item.innerHTML = '<span class="wd-progress-track"><span class="wd-progress-fill"></span></span>';
    const label = document.createElement('div');
    label.className = 'wd-item-label';
    const t = titleCell?.querySelector('p, h3, h4') || titleCell?.firstElementChild;
    const d = descCell?.querySelector('p') || descCell?.firstElementChild;
    if (t) { const w = document.createElement('div'); w.className = 'wd-item-title'; w.append(t); label.append(w); }
    if (d) { const w = document.createElement('div'); w.className = 'wd-item-desc'; w.append(d); label.append(w); }
    item.append(label);
    bars.append(item);
    return item;
  });
  progress.append(bars);

  block.replaceChildren(track, progress);

  // state machine
  let active = 0; // live: slide 1 at load, autoplay reaches slide 2 by ~5 s (the gate capture state)
  const INTERVAL = 5000;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let started = 0;
  function show(i, animate) {
    active = (i + n) % n;
    track.style.transition = animate ? 'transform 0.6s ease' : 'none';
    track.style.setProperty('--active', String(clonesBefore + active));
    slides.forEach((s, k) => s.classList.toggle('is-active', k === active));
    items.forEach((it, k) => { it.classList.toggle('is-active', k === active); it.setAttribute('aria-current', k === active ? 'true' : 'false'); const f = it.querySelector('.wd-progress-fill'); if (f) { f.style.transition = 'none'; f.style.width = '0%'; } });
    started = performance.now();
  }
  function tick(now) {
    if (!reduce && !document.hidden) {
      const p = Math.min(1, (now - started) / INTERVAL);
      const f = items[active]?.querySelector('.wd-progress-fill');
      if (f) { f.style.transition = 'width 0.2s linear'; f.style.width = `${p * 100}%`; }
      if (p >= 1) show(active + 1, true);
    }
    requestAnimationFrame(tick);
  }
  items.forEach((it, k) => {
    it.addEventListener('click', () => show(k, true));
    it.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(k, true); } });
  });
  show(active, false);
  if (!reduce) requestAnimationFrame(tick);
}
