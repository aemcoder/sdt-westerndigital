/**
 * product-rail — authored product grids/rails refreshed from the storefront search API (dynamics row 9/14).
 * Authoring: one row per product: <picture> | <p>Name</p> | <p>capacity range</p> | <p>Starting at $x</p> | <p><a href=PDP>Name</a></p> [| extra]
 *   extra: grid-4 → promo strip <p>text</p> (optionally <picture> icon first); showcase featured → <p>★★★★★</p><p>quote</p>; rail → <p>blurb</p>
 * Variants: `grid-4` (What's New 265px square tiles) · `showcase` (best sellers: first row = featured 448px card, rows 2–5 = 2×2 grid;
 *   `featured-left` mirrors) · `rail` (portfolio: 375×600 r16 scroll rail). Head (h2/p) is DEFAULT CONTENT before the block (D1).
 * Runtime: `byCodes()` on /scripts/wd-commerce.js (base code = last PDP path segment) FILLS missing image/capacity/price/name only —
 * the capture is SKU-level while the API answers per base product, so authored copy is never overwritten (replica decision). Authored nodes are MOVED into slots (EW1); the tile link wraps the media (EW6). @ew-exempt none.
 */
function el(tag, cls) { const e = document.createElement(tag); if (cls) e.className = cls; return e; }

export default async function decorate(block) {
  const variant = ['grid-4', 'showcase', 'rail'].find((v) => block.classList.contains(v)) || 'grid-4';
  const rows = [...block.children];
  const list = el(variant === 'rail' ? 'ul' : 'div', variant === 'rail' ? 'rail__track' : 'pr-grid');
  const tiles = [];
  rows.forEach((row, i) => {
    const [picCell, nameCell, capCell, priceCell, linkCell, extraCell] = row.children;
    const link = linkCell?.querySelector('a');
    const href = link?.getAttribute('href') || '';
    const item = el(variant === 'rail' ? 'li' : 'div', 'pr-cell');
    const card = el(href ? 'a' : 'div', 'pr-card');
    if (href) { card.href = href; card.setAttribute('aria-label', link.getAttribute('aria-label') || link.textContent.trim()); }
    if (variant === 'showcase' && i === 0) { item.classList.add('pr-featured'); }
    const media = el('div', 'pr-media');
    const pic = picCell?.querySelector('picture, img');
    if (pic) { const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img'); if (img) img.loading = 'lazy'; media.append(pic); }
    card.append(media);
    const body = el('div', 'pr-body');
    const name = el('div', 'pr-name'); if (nameCell) [...nameCell.childNodes].forEach((n) => name.append(n)); body.append(name);
    if (variant === 'rail' && extraCell) { const blurb = el('div', 'pr-blurb'); [...extraCell.childNodes].forEach((n) => blurb.append(n)); body.append(blurb); }
    const meta = el('div', 'pr-meta');
    const cap = el('div', 'pr-cap'); const capText = capCell?.textContent.trim();
    if (capText) { cap.innerHTML = '<span class="pr-label">Capacity: </span>'; const s = el('strong'); [...capCell.querySelectorAll('p')].forEach((p) => p.replaceWith(...p.childNodes)); [...capCell.childNodes].forEach((n) => s.append(n)); cap.append(s); meta.append(cap); }
    const price = el('p', 'pr-price'); const priceText = priceCell?.textContent.trim();
    if (priceText) { [...priceCell.querySelectorAll('p')].forEach((p) => p.replaceWith(...p.childNodes)); [...priceCell.childNodes].forEach((n) => price.append(n)); meta.append(price); }
    body.append(meta);
    if (variant === 'showcase') {
      if (i === 0 && extraCell) { const q = el('div', 'pr-quote'); [...extraCell.childNodes].forEach((n) => q.append(n)); body.append(q); }
      if (i > 0) { const shop = el('p', 'pr-shop'); shop.textContent = 'Shop Now'; body.append(shop); }
    }
    card.append(body);
    if (variant === 'grid-4' && extraCell && extraCell.textContent.trim()) {
      const promo = el('div', 'pr-promo'); if (extraCell.querySelector('a')) promo.classList.add('pr-promo--green');
      [...extraCell.childNodes].forEach((n) => promo.append(n)); item.append(card, promo);
    } else item.append(card);
    list.append(item);
    tiles.push({ item, href, code: href.split('?')[0].split('/').filter(Boolean).pop(), media, cap, price, name });
  });
  if (variant === 'showcase') {
    // featured card + a 2×2 sub-grid (rows 2–5); `featured-left` mirrors the order
    const sub = el('div', 'pr-sub');
    [...list.children].slice(1).forEach((c) => sub.append(c));
    list.append(sub);
  }
  if (variant === 'rail') { const rail = el('div', 'rail'); rail.append(list); block.replaceChildren(rail); } else block.replaceChildren(list);

  // refresh from the storefront API (progressive: authored capture stays until the payload arrives)
  try {
    const { byCodes, tileData } = await import('../../scripts/wd-commerce.js');
    const codes = [...new Set(tiles.map((t) => t.code).filter(Boolean))];
    const products = await byCodes(codes);
    const byCode = new Map(products.map((p) => [p.code, tileData(p)]));
    tiles.forEach((t) => {
      const d = byCode.get(t.code); if (!d) return;
      // the capture is SKU-level (tile links carry ?sku=); the API answers per base product → only FILL gaps, never overwrite authored copy
      const img = t.media.querySelector('img');
      if (img && !img.getAttribute('src') && d.img) img.src = d.img;
      if (!t.cap.textContent.trim() && d.capacity && t.cap.isConnected) { const s = t.cap.querySelector('strong'); if (s) s.textContent = d.capacity; }
      if (!t.price.textContent.trim() && d.price && t.price.isConnected) t.price.textContent = d.price;
      if (!t.name.textContent.trim() && d.name) t.name.textContent = d.name;
    });
    block.dataset.api = 'live';
  } catch (e) { block.dataset.api = 'fallback'; }
}
