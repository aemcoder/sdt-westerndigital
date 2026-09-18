/**
 * testimonial-carousel — customer quotes. Authoring: one row per slide: <p>quote</p> | <p><strong>- Name, Company.</strong></p>
 * (optional first cell <picture> quote icon). Variant `static`: a single centered quote head (eyebrow p, ★ p, italic h3) — no controls.
 * Live: a Splide loop with 2 pagination dots; no motion capture for this page → slide 1 at rest, dots switch on click, no autoplay
 * (replica: implement only observed behaviour). Authored nodes are MOVED (EW1); clones are not created. @ew-exempt none.
 */
export default function decorate(block) {
  if (block.classList.contains('static')) {
    const cell = block.querySelector(':scope > div > div');
    if (cell) { cell.className = 'tc-static'; block.replaceChildren(cell); }
    return;
  }
  const track = document.createElement('div');
  track.className = 'tc-track';
  const slides = [...block.children].map((row, i) => {
    const cells = [...row.children];
    const slide = document.createElement('div');
    slide.className = `tc-slide${i === 0 ? ' is-active' : ''}`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-label', `${i + 1} of ${block.children.length}`);
    const pic = cells[0]?.querySelector('picture, img');
    const icon = document.createElement('div'); icon.className = 'tc-icon';
    if (pic) icon.append(pic);
    const body = document.createElement('div'); body.className = 'tc-body';
    const copyCells = pic ? cells.slice(1) : cells;
    copyCells.forEach((c, k) => { const w = document.createElement('div'); w.className = k === 0 ? 'tc-quote' : 'tc-attr'; [...c.childNodes].forEach((n) => w.append(n)); body.append(w); });
    slide.append(icon, body);
    track.append(slide);
    return slide;
  });
  const dots = document.createElement('div');
  dots.className = 'tc-dots';
  dots.setAttribute('role', 'tablist');
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = `tc-dot${i === 0 ? ' is-active' : ''}`; b.setAttribute('aria-label', `Go to slide ${i + 1}`); b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { slides.forEach((x, k) => x.classList.toggle('is-active', k === i)); dots.querySelectorAll('.tc-dot').forEach((d, k) => d.classList.toggle('is-active', k === i)); });
    dots.append(b);
  });
  block.replaceChildren(track, dots);
}
