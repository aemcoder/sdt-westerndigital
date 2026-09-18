/**
 * cards — the site's card rails and tile rows (one block, variant classes; David's Model D9).
 * Schema: stardust/eds-schema/home.json § mainContainWrap (7 dark cards, 5 product cards, 6 resource cards, 5 tiles).
 *
 * Variants (section head is DEFAULT CONTENT before the block — D1):
 *   cards dark-rail     rows: <picture> | <p>eyebrow</p><h3>title</h3><p><em><a>CTA</a></em></p>  → 400×600 photo cards with a bottom scrim
 *   cards product-rail  row 1 (feature): <picture> | <p>title</p><p>lede</p><p><a>Learn More</a></p>
 *                       rows 2+:         <picture> | <p><a>Product name</a></p><p>Capacity: <strong>…</strong></p><p>Starting at <strong>$…</strong></p>
 *   cards resource-rail rows: <picture> (icon) | <p>eyebrow</p><h3>title</h3><p><a>Read More</a></p>
 *   cards tiles         rows: <picture> | <p><a>Label</a></p>  → square tiles, whole tile is the link
 *   cards workload-rail rows: (empty) | <p>eyebrow</p><h3>title</h3><p>text</p><p><a>link</a></p> → 352×350 bordered cards, card-as-link, arrow (portfolio)
 *   cards dark-rail cta-pair: 450×600 cards whose CTA cell holds <p><em><a>View Products</a></em></p><p><a>Learn More</a></p>
 * Rails are horizontally scrollable tracks (live: Splide --scroll, draggable, no arrows).
 * Authored nodes are MOVED (EW1); card-as-link unwraps the inner anchor (EW6). @ew-exempt none.
 */
function el(tag, className) { const e = document.createElement(tag); if (className) e.className = className; return e; }

export default function decorate(block) {
  const rows = [...block.children];
  const variant = ['dark-rail', 'product-rail', 'resource-rail', 'tiles', 'workload-rail'].find((v) => block.classList.contains(v)) || 'dark-rail';
  const isRail = variant !== 'tiles';
  const list = el(isRail ? 'ul' : 'div', isRail ? 'rail__track' : 'tiles-row');

  rows.forEach((row, i) => {
    const [mediaCell, textCell] = row.children;
    const pic = mediaCell?.querySelector('picture, img');
    const img = pic?.tagName === 'IMG' ? pic : pic?.querySelector('img');
    const item = el(isRail ? 'li' : 'div', isRail ? '' : 'tile');
    const card = el('div', 'card');
    const body = el('div', 'card-body');
    const texts = textCell ? [...textCell.children] : [];

    if (variant === 'dark-rail' || (variant === 'product-rail' && i === 0)) {
      card.classList.add(variant === 'dark-rail' ? 'card-photo' : 'card-feature');
      if (pic) { const bg = el('div', 'card-media'); bg.append(pic); card.append(bg); }
      if (variant === 'dark-rail') card.classList.add('darken-bottom');
      const heading = texts.find((t) => /^H[1-6]$/.test(t.tagName));
      const ps = texts.filter((t) => t.tagName === 'P' && !t.querySelector('a'));
      const ctas = texts.filter((t) => t.querySelector('a'));
      const slot = (className, node) => { const w = el('div', className); w.append(node); body.append(w); };
      if (variant === 'dark-rail') {
        if (ps[0]) slot('eyebrow', ps[0]);
        if (heading) slot('title', heading);
      } else {
        if (ps[0]) slot('title', ps[0]);
        ps.slice(1).forEach((p) => body.append(p));
      }
      if (ctas.length) { const actions = el('div', `actions${variant === 'dark-rail' ? ' on-media' : ''}`); ctas.forEach((c) => actions.append(c)); body.append(actions); }
      card.append(body);
    } else if (variant === 'product-rail') {
      card.classList.add('card-product');
      const link = textCell.querySelector('a');
      const href = link?.getAttribute('href');
      const wrap = href ? el('a', 'pc-url-wrap') : el('div', 'pc-url-wrap');
      if (href) { wrap.href = href; link.replaceWith(...link.childNodes); }
      if (pic) { const m = el('div', 'pc-media'); m.append(pic); wrap.append(m); }
      texts.forEach((t, k) => { const w = el('div', k === 0 ? 'pc-title' : (k === 1 ? 'pc-capacity' : 'pc-price')); w.append(t); wrap.append(w); });
      card.append(wrap);
    } else if (variant === 'resource-rail') {
      card.classList.add('card-resource');
      if (pic) { const icon = el('div', 'icon-media'); icon.append(pic); body.append(icon); }
      const col = el('div', 'textcolumn');
      texts.filter((t) => !t.querySelector('a')).forEach((t) => col.append(t));
      body.append(col);
      const ctas = texts.filter((t) => t.querySelector('a'));
      if (ctas.length) { const actions = el('div', 'actions text-links'); ctas.forEach((c) => actions.append(c)); body.append(actions); }
      card.append(body);
    } else if (variant === 'workload-rail') {
      // bordered solution cards: eyebrow p + h3 + p, whole card is the link (EW6), arrow glyph at the bottom
      const link = textCell.querySelector('a');
      const href = link?.getAttribute('href');
      const a = el(href ? 'a' : 'div', 'card-link');
      if (href) { a.href = href; a.setAttribute('aria-label', link.getAttribute('aria-label') || link.textContent.trim()); link.closest('p')?.remove(); }
      const heading = texts.find((t) => /^H[1-6]$/.test(t.tagName));
      const ps = texts.filter((t) => t.tagName === 'P' && t.isConnected);
      const slot = (className, node) => { const w = el('div', className); w.append(node); body.append(w); };
      if (ps[0] && heading && ps[0].compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING) slot('eyebrow', ps.shift());
      if (heading) slot('title', heading);
      ps.forEach((p) => body.append(p));
      const arrow = el('div', 'card-arrow');
      arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      body.append(arrow);
      a.append(body);
      card.append(a);
    } else { // tiles
      const link = textCell.querySelector('a');
      const href = link?.getAttribute('href');
      const a = el('a', 'tile-link');
      if (href) { a.href = href; a.setAttribute('aria-label', link.getAttribute('aria-label') || link.textContent.trim()); link.replaceWith(...link.childNodes); }
      if (pic) a.append(pic);
      texts.forEach((t) => a.append(t));
      card.append(a);
    }
    if (img) img.loading = 'lazy';
    item.append(card);
    list.append(item);
  });

  if (isRail) {
    const rail = el('div', 'rail');
    rail.append(list);
    block.replaceChildren(rail);
  } else {
    block.replaceChildren(list);
  }
}
