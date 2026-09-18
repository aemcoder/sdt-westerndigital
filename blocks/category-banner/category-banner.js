/**
 * category-banner — commerce listing hero: photo band (260px at ≥768) with h1 + lede + underlined link.
 * Schema: stardust/eds-schema/listing.json § hero.
 *
 * Authoring: one row, 2 cells: <picture> | <h1>Title</h1> <p>lede</p> <p><a>Learn About …</a></p>
 *   or 3 cells: <picture desktop> | <picture mobile> | copy — the live listing siblings paint a distinct mobile banner below 768px
 * Variants: `category-banner templated` — on /products/hdd?filterBy<Facet>=<value> the live page swaps the h1
 *   to "Hard Drives for {use case}" or "{capacity range}  Hard Drives" (measured on all 11 menu filter states);
 *   the authored h1 is the unfiltered title and stays in place (text swapped at runtime, never rebuilt — EW9 runtime data).
 * Variants (siblings, composition-listing.md): `inset` — copy column padded 64px on every side (text at x=230: /products/hdd,
 *   final-production); `wide` — full-width copy column (final-production); `static` — no column padding, copy max-width 350px,
 *   title authored as <p><strong> (recertified, final-production: the live title is not a heading); `promo` — centred sale hero,
 *   h1 66/72.6 500 + 20/30 subtitle (weekly-sale); `mobile-bg` — keep the photo below 768px where the live page paints it.
 * Capture-state: the archetype's live page paints no hero image below 768px (replica progress.json) — CSS hides the bg on mobile.
 * Template-slotted: the authored picture becomes the background layer, copy moves into a slot (EW1). @ew-exempt none.
 */
// `?filterBy<Facet>=<value>` → [[facet, value]] (same contract as scripts/wd-commerce.js filtersFromSearch; inlined so the
// block has no module import — deploy's round-trip harness inlines block JS and cannot resolve imports)
function filtersFromSearch(search = window.location.search) {
  const out = [];
  new URLSearchParams(search).forEach((v, k) => {
    if (!k.startsWith('filterBy') || !v) return;
    const code = k.slice('filterBy'.length);
    out.push([code.charAt(0).toLowerCase() + code.slice(1), v]);
  });
  return out;
}

export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  // 2 cells: picture | copy — 3 cells: desktop picture | mobile picture | copy (the live siblings paint a separate mobile asset)
  const cells = [...row.children];
  const copyCell = cells[cells.length - 1];
  const mediaCell = cells.length > 1 ? cells[0] : null;
  const mobileCell = cells.length > 2 ? cells[1] : null;
  const bg = document.createElement('div');
  bg.className = 'banner-bg';
  const pic = mediaCell?.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    bg.append(pic);
  }
  const mobilePic = mobileCell?.querySelector('picture, img');
  if (mobilePic) { const wrap = document.createElement('div'); wrap.className = 'banner-bg-mobile'; wrap.append(mobilePic); bg.append(wrap); block.classList.add('has-mobile-bg'); }
  const contain = document.createElement('div');
  contain.className = 'contain';
  const copy = document.createElement('div');
  copy.className = 'banner-copy';
  if (copyCell) {
    [...copyCell.children].forEach((k, i) => {
      if (k.tagName === 'P' && k.querySelector('a') && k.textContent.trim() === k.querySelector('a').textContent.trim()) k.classList.add('banner-cta');
      // `static` variant (recertified / final-production): the live title is a <p class="heading1">, authored as <p><strong>Title</strong></p>
      else if (i === 0 && k.tagName === 'P' && k.children.length === 1 && k.firstElementChild.tagName === 'STRONG') k.classList.add('banner-title');
      copy.append(k);
    });
  }
  contain.append(copy);
  block.replaceChildren(bg, contain);

  if (block.classList.contains('templated')) {
    const h1 = copy.querySelector('h1');
    const [first] = filtersFromSearch();
    if (h1 && first) {
      const [facet, value] = first;
      if (facet === 'useCaseName') h1.textContent = `Hard Drives for ${value}`;
      else if (/capacity/i.test(facet)) h1.textContent = `${value}  Hard Drives`;
    }
  }
}
