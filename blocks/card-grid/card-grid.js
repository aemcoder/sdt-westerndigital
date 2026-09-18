/**
 * card-grid — static card layouts of the Products-menu pages (one block, variant classes; David's Model D9).
 * Authoring: one row per card, 1–2 cells: [<picture>] | body (<p>/<h3>/<h4>/<ul>/<p><a>…</a></p>). Card-as-link (EW6) when the body's
 * only link should cover the card (`icon-tiles`, `program`, `compact`); otherwise links stay inline.
 * Variants (measured): `icon-tiles` (5-up 171px icon links), `program` (2-up white r20 bottom-aligned, arrow), `icon-columns`
 *   (icon + h3 + p [+ link] n-up; size modifiers `icon-64|134|140|150|66`, `h3-20|24|32`, `bold`, `four-up`), `product-feature`
 *   (2×2 grey r20, contain image, outline button), `media` (image card: `two-up|three-up|four-up|five-up`, `white|grey`, `bordered`,
 *   `img-310|234|225|150`), `capacity-tiles` (4-up bordered, big range, checklist, last card `dark`), `icon-row` (2-up horizontal
 *   icon | text), `stats` (3-up white bordered). Section head (h2/p) = DEFAULT CONTENT (D1). Authored nodes are MOVED (EW1).
 * @ew-exempt none.
 */
const ARROW = '<svg class="cg-arrow" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const LINKED = ['icon-tiles', 'program', 'compact'];

export default function decorate(block) {
  const variant = ['icon-tiles', 'program', 'icon-columns', 'product-feature', 'media', 'capacity-tiles', 'icon-row', 'stats', 'compact'].find((v) => block.classList.contains(v)) || 'media';
  const grid = document.createElement('div');
  grid.className = 'cg-grid';
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const picCell = cells.length > 1 && cells[0].querySelector('picture, img') ? cells[0] : null;
    const bodyCell = picCell ? cells[1] : cells[0];
    const cell = document.createElement('div');
    cell.className = 'cg-cell';
    const links = bodyCell ? [...bodyCell.querySelectorAll('a')] : [];
    const cover = LINKED.includes(variant) && links.length === 1;
    const card = document.createElement(cover ? 'a' : 'div');
    card.className = 'cg-card';
    if (cover) {
      const a = links[0];
      card.href = a.getAttribute('href');
      card.setAttribute('aria-label', a.getAttribute('aria-label') || a.textContent.trim());
      a.replaceWith(...a.childNodes);
    }
    if (picCell) {
      const media = document.createElement('div');
      media.className = 'cg-media';
      const pic = picCell.querySelector('picture, img');
      const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
      if (img) img.loading = 'lazy';
      media.append(pic);
      card.append(media);
    }
    const body = document.createElement('div');
    body.className = 'cg-body';
    if (bodyCell) {
      [...bodyCell.children].forEach((k) => {
        if (k.tagName === 'P' && k.querySelector('a') && !cover) k.classList.add('cg-cta');
        body.append(k);
      });
    }
    if (variant === 'program') { const h = body.querySelector('h3'); if (h) h.insertAdjacentHTML('beforeend', ARROW); }
    if (variant === 'capacity-tiles' && i === block.children.length - 1) card.classList.add('dark');
    if (variant === 'icon-tiles' && cover) card.insertAdjacentHTML('beforeend', '');
    card.append(body);
    cell.append(card);
    grid.append(cell);
  });
  block.replaceChildren(grid);
}
