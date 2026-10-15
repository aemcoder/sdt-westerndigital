/* stardust:replica — scroll-state chrome, cloned from the live state machine (chrome-scroll-probe.mjs, 2026-09-18):
   - pages without a sub-nav: body.minHeader once scrollY > 0 (measured: off at 0, on at 50) → header sticky top -40px (promo bar scrolls off, nav row stays)
   - program pages (sub-nav present): header is never pinned (top: auto); #sticky-nav becomes position:fixed top:0 once scrollY >= its natural offset (97). */
(function () {
  var sub = document.getElementById('sticky-nav');
  var subTop = sub ? sub.parentElement.getBoundingClientRect().top + window.scrollY : 0;
  if (sub) document.body.classList.add('has-subnav');
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (sub) sub.classList.toggle('sticky-stuck', y >= subTop); /* live class name (motion-observe: classMutations added sticky-stuck at y≥97) */
    else document.body.classList.toggle('minHeader', y > 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* hero carousel — observed live (motion-observe home-widgets.json): progress items are role=button; clicking one sets
   is-active on the item and moves the Splide track (transform transition on ul.splide__list); autoplay advances slides
   with the progress fill's width transitioning (0.2s linear ticks). Implemented as the same state machine: one track,
   translateX by index, fill width driven over the autoplay interval; paused under prefers-reduced-motion. */
(function () {
  var track = document.querySelector('.hero-track'); if (!track) return;
  var items = Array.prototype.slice.call(document.querySelectorAll('.wd-progress-item'));
  var slides = Array.prototype.slice.call(track.children).filter(function (li) { return !li.classList.contains('splide__slide--clone'); });
  var clonesBefore = Array.prototype.indexOf.call(track.children, slides[0]);
  var active = items.findIndex(function (i) { return i.classList.contains('is-active'); }); if (active < 0) active = 0;
  var INTERVAL = 5000, started = 0, timer = null, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i, animate) {
    active = (i + slides.length) % slides.length;
    track.style.transition = animate ? 'transform 0.6s ease' : 'none';
    track.style.setProperty('--active', clonesBefore + active);
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === active); });
    items.forEach(function (it, k) { it.classList.toggle('is-active', k === active); it.setAttribute('aria-current', k === active ? 'true' : 'false'); var f = it.querySelector('.wd-progress-fill'); if (f) { f.style.transition = 'none'; f.style.width = k === active ? '0%' : '0%'; } });
    started = performance.now();
  }
  function tick(now) {
    if (!reduce && !document.hidden) {
      var p = Math.min(1, (now - started) / INTERVAL); var f = items[active] && items[active].querySelector('.wd-progress-fill');
      if (f) { f.style.transition = 'width 0.2s linear'; f.style.width = (p * 100) + '%'; }
      if (p >= 1) show(active + 1, true);
    }
    timer = requestAnimationFrame(tick);
  }
  items.forEach(function (it, k) { it.addEventListener('click', function () { show(k, true); }); it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(k, true); } }); });
  if (!reduce) { started = performance.now(); timer = requestAnimationFrame(tick); }
})();
