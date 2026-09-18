/**
 * subnav — program-template tab row under the header (Overview · People · Supply Chain …).
 * Authoring: one row, one cell: <ul><li><a href>Overview</a></li>…</ul>. The active item is the link whose
 * href matches the current path. Measured live behaviour (chrome-scroll-probe, motion-observe): the header
 * never pins on these pages (body.has-subnav → header top:auto) and #sticky-nav gains `sticky-stuck`
 * (position:fixed top:0, items flush-left at x=80) once scrollY ≥ its natural offset. Mobile: a dropdown
 * showing the active item only (50px row, chevron). The authored <ul> is MOVED (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const ul = block.querySelector('ul');
  if (!ul) return;
  document.body.classList.add('has-subnav');
  const head = document.createElement('div');
  head.className = 'sticky-head';
  head.id = 'sticky-nav';
  const inner = document.createElement('div');
  inner.className = 'inner-wrap';
  const here = window.location.pathname.replace(/\/$/, '');
  ul.querySelectorAll('li').forEach((li) => {
    li.classList.add('item');
    const a = li.querySelector('a');
    let path = null;
    try { path = new URL(a?.getAttribute('href') || '', window.location.href).pathname.replace(/\/$/, ''); } catch (e) { path = (a?.getAttribute('href') || '').replace(/\/$/, ''); }
    if (a && path === here) { li.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });
  if (!ul.querySelector('.item.active')) ul.querySelector('li')?.classList.add('active');
  inner.append(ul);
  head.append(inner);
  block.replaceChildren(head);
  // mobile dropdown: the active item is shown; tapping it reveals the rest
  head.addEventListener('click', (e) => {
    if (window.matchMedia('(min-width: 768px)').matches) return;
    if (e.target.closest('a') && !e.target.closest('.item.active')) return;
    e.preventDefault();
    head.classList.toggle('open');
  });
  const top = () => head.parentElement.getBoundingClientRect().top + window.scrollY;
  let stuckAt = top();
  const onScroll = () => { head.classList.toggle('sticky-stuck', (window.scrollY || 0) >= stuckAt); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { head.classList.remove('sticky-stuck'); stuckAt = top(); onScroll(); });
  onScroll();
}
