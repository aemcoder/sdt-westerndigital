/**
 * photo-hero — photo band with copy (program hero: 400px full-bleed; press-release hero: contained 1108×300).
 * Schema: corporate-responsibility.json § hero · press-release.json § hero.
 *
 * Authoring: one row, 2 cells: <picture> | [<p><a>crumb</a></p>] <h1>title</h1> <p>lede</p>
 * Variants: `photo-hero contained` (press release: black box inside the container, image contained left);
 *   Products-menu: `band` (300h left copy), `centered` (+ `h1-48`, `w462`, `w739`, `lede-18`, `h400`; an eyebrow <p> and a <p><picture> logo slot before the h1), `cta-pair` (600h, two buttons).
 * Template-slotted (node slotting): the authored picture becomes the background layer, copy moves into slots.
 * Program pages: the hero image is also the LCP — eager + fetchpriority high (#100). @ew-exempt none.
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
  if (copyCell) groupButtons(copyCell);
  if (copyCell) {
    [...copyCell.children].forEach((k) => {
      if (k.tagName === 'P' && k.querySelector('picture, img') && !copy.querySelector('.headline')) { const l = document.createElement('div'); l.className = 'logo'; l.append(k); copy.append(l); }
      else if (k.tagName === 'P' && !k.querySelector('a') && !copy.querySelector('.headline') && block.classList.contains('centered')) { const e = document.createElement('div'); e.className = 'eyebrow'; e.append(k); copy.append(e); }
      else if (k.tagName === 'P' && k.querySelector('a') && !copy.children.length && !block.classList.contains('centered') && !block.classList.contains('cta-pair')) { const c = document.createElement('div'); c.className = 'crumb'; c.append(k); copy.append(c); }
      else if (/^H[1-6]$/.test(k.tagName)) { const h = document.createElement('div'); h.className = 'headline'; h.append(k); copy.append(h); }
      else { const l = document.createElement('div'); l.className = 'lede'; l.append(k); copy.append(l); }
    });
  }
  rowEl.append(copy);
  contain.append(rowEl);
  block.replaceChildren(bg, contain);
}
