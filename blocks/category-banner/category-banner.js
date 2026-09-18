/**
 * category-banner — commerce listing hero: photo band (260px at ≥768) with h1 + lede + underlined link.
 * Schema: stardust/eds-schema/listing.json § hero.
 *
 * Authoring: one row, 2 cells: <picture> | <h1>Title</h1> <p>lede</p> <p><a>Learn About …</a></p>
 * Variants: `category-banner templated` — on /products/hdd?filterBy<Facet>=<value> the live page swaps the h1
 *   to "Hard Drives for {use case}" or "{capacity range}  Hard Drives" (measured on all 11 menu filter states);
 *   the authored h1 is the unfiltered title and stays in place (text swapped at runtime, never rebuilt — EW9 runtime data).
 * Capture-state: the live page paints no hero image below 768px (replica progress.json) — CSS hides the bg on mobile.
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
  const [mediaCell, copyCell] = row.children;
  const bg = document.createElement('div');
  bg.className = 'banner-bg';
  const pic = mediaCell?.querySelector('picture, img');
  if (pic) {
    const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
    if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); }
    bg.append(pic);
  }
  const contain = document.createElement('div');
  contain.className = 'contain';
  const copy = document.createElement('div');
  copy.className = 'banner-copy';
  if (copyCell) {
    [...copyCell.children].forEach((k) => {
      if (k.tagName === 'P' && k.querySelector('a') && k.textContent.trim() === k.querySelector('a').textContent.trim()) k.classList.add('banner-cta');
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
