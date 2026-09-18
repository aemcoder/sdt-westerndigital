/**
 * cta-band — full-bleed call-to-action bands with an authored background picture (the section styles `bg-image` / `contained` /
 * `gradient` of the live site, expressed as a block so styles.css stays untouched).
 * Authoring: one row: [<picture> background] | copy (<h2>/<h3>/<p>/<p><strong><a>…</a></strong></p> …) [| second copy cell]
 * Variants: default (centered copy on the photo), `contained` (1108px r16 band inside the container), `gradient` (blue gradient,
 *   no picture), `split` (two copy cells side by side; `media-left` when the first copy cell is a picture that overhangs the band).
 * Authored nodes are MOVED into slots (EW1). @ew-exempt none.
 */

/** consecutive buttonized paragraphs (<p class="button-wrapper">) sit side by side on the live site → one flex row */
function groupButtons(root) {
  [...root.querySelectorAll('p.button-wrapper')].forEach((p) => {
    if (p.previousElementSibling?.classList.contains('actions')) { p.previousElementSibling.append(p); return; }
    if (p.nextElementSibling?.classList.contains('button-wrapper')) { const a = document.createElement('div'); a.className = 'actions'; p.replaceWith(a); a.append(p); }
  });
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const cells = [...row.children];
  const bg = document.createElement('div');
  bg.className = 'band-bg';
  let copyCells = cells;
  if (cells[0]?.querySelector('picture, img') && (cells.length > 1) && !block.classList.contains('media-left')) {
    const pic = cells[0].querySelector('picture, img');
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img) img.loading = 'lazy';
    bg.append(pic);
    copyCells = cells.slice(1);
  } else if (block.classList.contains('media-left') && cells.length > 2) {
    const pic = cells[0].querySelector('picture, img');
    if (pic) bg.append(pic);
    copyCells = cells.slice(1);
  }
  const contain = document.createElement('div');
  contain.className = 'band-contain';
  const inner = document.createElement('div');
  inner.className = 'band-row';
  copyCells.forEach((c, i) => {
    const col = document.createElement('div');
    col.className = `band-col band-col-${i + 1}`;
    if (c.querySelector('picture, img') && !c.textContent.trim()) col.classList.add('band-media');
    [...c.childNodes].forEach((n) => col.append(n));
    inner.append(col);
  });
  contain.append(inner);
  groupButtons(inner);
  block.replaceChildren(bg, contain);
}
