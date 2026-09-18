/**
 * photo-hero — photo band with copy (program hero: 400px full-bleed; press-release hero: contained 1108×300).
 * Schema: corporate-responsibility.json § hero · press-release.json § hero.
 *
 * Authoring: one row, 2 cells: <picture> | [<p><a>crumb</a></p>] <h1>title</h1> <p>lede</p>
 * Variants: `photo-hero contained` (press release: black box inside the container, image contained left).
 * Template-slotted (node slotting): the authored picture becomes the background layer, copy moves into slots.
 * Program pages: the hero image is also the LCP — eager + fetchpriority high (#100). @ew-exempt none.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  const [mediaCell, copyCell] = row.children;
  const bg = document.createElement('div');
  bg.className = 'hero-bg';
  const pic = mediaCell?.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    bg.append(pic);
  }
  const contain = document.createElement('div');
  contain.className = 'contain';
  const rowEl = document.createElement('div');
  rowEl.className = 'hero-row';
  const copy = document.createElement('div');
  copy.className = 'hero-copy';
  if (copyCell) {
    [...copyCell.children].forEach((k) => {
      if (k.tagName === 'P' && k.querySelector('a') && !copy.children.length) { const c = document.createElement('div'); c.className = 'crumb'; c.append(k); copy.append(c); }
      else if (/^H[1-6]$/.test(k.tagName)) { const h = document.createElement('div'); h.className = 'headline'; h.append(k); copy.append(h); }
      else { const l = document.createElement('div'); l.className = 'lede'; l.append(k); copy.append(l); }
    });
  }
  rowEl.append(copy);
  contain.append(rowEl);
  block.replaceChildren(bg, contain);
}
