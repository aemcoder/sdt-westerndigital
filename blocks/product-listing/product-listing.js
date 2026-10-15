/**
 * product-listing — the commerce category listing as captured: left rail (category tree, deals, facet
 * group names), toolbar ("N Items", sort), 4-up product tile grid. STATIC SNAPSHOT: the tiles are the
 * captured first page (authored rows); facets, sort and pagination are inert (dynamics row 14, pending).
 * Tiles link to the storefront PDP (absolute); "Compare" is the captured label only.
 * Schema: stardust/eds-schema/listing.json § product-listing.
 *
 * Authoring (rows):
 *   config rows — 2 cells, key | value:
 *     page-size      15
 *     sort           Most Popular                            (sort label shown in the toolbar)
 *     filters        Brand, Capacity Range, Form Factor, …   (facet group NAMES shown in the rail, in order)
 *     category-tree  <ul><li><a href>Hard Drives (HDD)</a><ul><li><a href>Internal HDD</a></li>…</ul></li></ul>   (or `none`)
 *     tree-collapsed yes                                       (rail shows "Shop by Category +" with the tree hidden)
 *     deals          <p>Shop by Deals</p><ul><li><a href>Sale</a></li>…</ul>   (collapsed on the live page)
 *   tile rows — ≥4 cells: <picture> | <p>Name</p> | <p>Capacity range</p> | <p>Starting at $x</p> | <p><a href>PDP</a></p> [| <p>BADGE</p>]
 * Authored nodes are MOVED into slots (EW1). @ew-exempt none.
 */
const ICON_COMPARE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="0.5" y="0.5" width="15" height="15" fill="none" stroke="#707070"/><path d="M4.58-5.339H7.355v1.2H4.58V-1H3.309V-4.143H.533v-1.2H3.309V-8.244H4.58Z" transform="translate(4 13)" fill="#555"/></svg>';
const ICON_CHEV = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path stroke="black" d="M17.818,23.015,12.7,17.875l.725-.725,4.393,4.393,4.393-4.393.725.747Z" transform="translate(-7.143 29.7) rotate(-90)"/></svg>';
const ICON_DROP = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true"><path d="M6.5 9.5l5 5 5-5z" fill="#000"/></svg>';
const ICON_SHOP = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="2" y="11" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="11" width="7" height="7" rx="1" fill="#000"/></svg>';
const ICON_FILTER = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="8.5" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="14" width="16" height="3" rx="1" fill="#000"/></svg>';
const ICON_SORT = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M14 4v11l3-3 .7.7L13.5 17l-4.2-4.3.7-.7 3 3V4z" fill="#000"/><rect x="2" y="4" width="8" height="1.2" fill="#000"/><rect x="2" y="7.5" width="6.5" height="1.2" fill="#000"/><rect x="2" y="11" width="5" height="1.2" fill="#000"/></svg>';

const KEYS = ['page-size', 'sort', 'filters', 'category-tree', 'tree-collapsed', 'deals', 'featured', 'promo'];
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const list = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

function readConfig(block) {
  const cfg = {}; const tiles = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length === 2 ? cells[0].textContent.trim().toLowerCase() : '';
    if (cells.length === 2 && KEYS.includes(key)) cfg[key] = cells[1];
    else if (cells.length >= 4) tiles.push(cells);
  });
  return { cfg, tiles };
}

/* ---- tile (fallback from authored cells, or from API data) ---- */
function tileFromCells(cells) {
  const [pic, name, cap, price, link, badge, promo] = cells;
  const a = link?.querySelector('a');
  const badgeText = badge?.textContent.trim() || '';
  return {
    href: a?.getAttribute('href') || '#', nodes: { pic: pic.querySelector('picture, img'), name, cap, price, badge },
    badgeBlack: !!badge?.querySelector('strong'), // <p><strong>EXCLUSIVE</strong></p> = the storefront's black badge; plain text = red
    promo: /^(yes|promo|true)$/i.test(promo?.textContent.trim() || ''),
    text: { name: name?.textContent.trim() || '', cap: cap?.textContent.trim() || '', price: price?.textContent.trim() || '', badge: badgeText },
  };
}

function renderTile(t) {
  const cell = el('div', 'tile-cell');
  const tile = el('div', 'product-tile');
  const link = el('a', 'tile-link'); link.href = t.href;
  const top = el('div', 'tile-top');
  const media = el('div', 'tile-media'); const inner = el('div', 'tile-media-inner');
  if (t.nodes?.pic) { const img = t.nodes.pic.tagName === 'IMG' ? t.nodes.pic : t.nodes.pic.querySelector('img'); if (img) { img.loading = 'lazy'; if (!img.alt) img.alt = t.text.name; } inner.append(t.nodes.pic); }
  else if (t.img) { const img = el('img'); img.src = t.img; img.alt = t.text.name; img.width = 126; img.height = 126; img.loading = 'lazy'; inner.append(img); }
  media.append(inner);
  const badgeText = t.text.badge || (t.stock === 'outlet' ? 'FINAL PRODUCTION' : '');
  if (badgeText) media.append(el('div', `tile-badge${t.badgeBlack ? ' tile-badge--black' : ''}`, badgeText));
  top.append(media);
  const h2 = el('h2', 'tile-name'); if (t.nodes?.name) h2.append(...t.nodes.name.childNodes); else h2.textContent = t.text.name; top.append(h2);
  const meta = el('div', 'tile-meta');
  if (t.text.cap) { const c = el('div', 'tile-cap'); c.append('Capacity: '); const s = el('strong'); if (t.nodes?.cap) s.append(...t.nodes.cap.childNodes); else s.textContent = t.text.cap; c.append(s); meta.append(c); }
  if (t.text.price) {
    const p = el('p', 'tile-price');
    if (t.nodes?.price) p.append(...t.nodes.price.childNodes);
    else if (t.strike) p.append('Starting at ', el('em', '', t.strike), ' ', el('strong', '', t.text.price.replace(/^Starting at /, '')));
    else p.textContent = t.text.price;
    if (p.querySelector('em')) p.classList.add('tile-price--strike'); // authored as <p>Starting at <em>$old</em> <strong>$new</strong></p>
    meta.append(p);
  }
  link.append(top, meta);
  const compare = el('button', 'tile-compare', `${ICON_COMPARE}<span>Compare</span>`); compare.type = 'button'; compare.setAttribute('aria-disabled', 'true'); compare.title = 'Compare products on westerndigital.com';
  tile.append(link, compare);
  // the storefront's "below the button" promotion box (extended warranty) — authored once per page (config row `promo`), shown on flagged tiles
  if (t.promo && PROMO.template) { const box = el('div', 'tile-promo'); box.append(...[...PROMO.template.childNodes].map((n) => n.cloneNode(true))); tile.append(box); }
  cell.append(tile);
  return cell;
}
const PROMO = { template: null };

export default function decorate(block) {
  const { cfg, tiles } = readConfig(block);
  const defaultSortLabel = cfg.sort?.textContent.trim() || 'Most Popular';
  const facetNames = list(cfg.filters?.textContent);
  if (cfg.promo) { const tpl = el('div', 'tile-promo-template'); tpl.hidden = true; tpl.append(...cfg.promo.childNodes); const more = tpl.querySelector('a'); if (more && !more.getAttribute('href')) more.removeAttribute('href'); PROMO.template = tpl; block.append(tpl); }

  /* rail */
  const body = el('div', 'clp-body');
  const rail = el('aside', 'clp-rail'); rail.id = 'plp-rail';
  const sticky = el('div', 'clp-rail-sticky');
  const nav = el('div', 'clp-nav');
  if (cfg['category-tree']) {
    const item = el('div', 'clp-nav-item');
    const catHead = el('h3', 'clp-rail-head', '<span>Shop by Category</span>'); item.append(catHead);
    const tree = cfg['category-tree'].querySelector('ul');
    // live: "−" when the tree is open; `tree-collapsed: yes` (accessories, recertified, final-production) keeps the authored tree hidden behind "+"
    const collapsed = !tree || /^(yes|true)$/i.test(cfg['tree-collapsed']?.textContent.trim() || '');
    catHead.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (tree) {
      catHead.tabIndex = 0; catHead.setAttribute('role', 'button');
      catHead.addEventListener('click', () => { const open = catHead.getAttribute('aria-expanded') === 'true'; catHead.setAttribute('aria-expanded', open ? 'false' : 'true'); tree.hidden = open; });
    } // value "none" = the header alone (accessories, recertified, final-production)
    if (tree) {
      tree.classList.add('clp-cat-tree');
      tree.hidden = collapsed;
      tree.querySelectorAll('a').forEach((a) => { try { if (new URL(a.href).pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '')) a.classList.add('is-current'); } catch { /* relative */ } });
      item.append(tree);
    }
    nav.append(item);
  }
  if (cfg.deals) {
    const item = el('div', 'clp-nav-item clp-nav-item--last');
    const heading = cfg.deals.querySelector('p');
    const head = el('h3', 'clp-rail-head'); const span = el('span'); if (heading) span.append(...heading.childNodes); else span.textContent = 'Shop by Deals'; head.append(span); item.append(head);
    const ul = cfg.deals.querySelector('ul');
    if (ul) { ul.classList.add('clp-cat-tree', 'clp-deals'); ul.hidden = true; item.append(ul); }
    head.tabIndex = 0; head.setAttribute('role', 'button'); head.setAttribute('aria-expanded', 'false');
    head.addEventListener('click', () => { const open = head.getAttribute('aria-expanded') === 'true'; head.setAttribute('aria-expanded', open ? 'false' : 'true'); if (ul) ul.hidden = open; });
    nav.append(item);
  }
  if (cfg.featured) {
    // "Shop by Featured" (recertified / final-production): always expanded, the current page's link underlined blue
    const item = el('div', 'clp-nav-item clp-nav-item--last');
    const heading = cfg.featured.querySelector('p');
    const head = el('h3', 'clp-rail-head'); const span = el('span'); if (heading) span.append(...heading.childNodes); else span.textContent = 'Shop by Featured'; head.append(span); head.setAttribute('aria-expanded', 'true'); item.append(head);
    const ul = cfg.featured.querySelector('ul');
    if (ul) { ul.classList.add('clp-featured'); ul.querySelectorAll('a').forEach((a) => { try { if (new URL(a.href).pathname.replace(/\/$/, '') === window.location.pathname.replace(/\/$/, '')) a.classList.add('is-current'); } catch { /* relative */ } }); item.append(ul); }
    nav.append(item);
  }
  const filters = el('div', 'clp-filters');
  const selected = el('div', 'clp-selected'); selected.hidden = true;
  filters.append(el('div', 'clp-filter-title', 'Filter by'), selected);
  const facetHost = el('div', 'clp-facets');
  filters.append(facetHost);
  sticky.append(nav, filters); rail.append(sticky);

  /* results */
  const results = el('div', 'clp-results');
  const toolbar = el('div', 'clp-toolbar');
  const qty = el('div', 'clp-qty'); const count = el('div', 'clp-count'); count.id = 'productQuantity'; qty.append(count);
  const tools = el('div', 'clp-tools');
  const shopBtn = el('button', 'clp-mob-btn clp-mob-shop', `${ICON_SHOP}<span class="mob-lbl">Shop</span><span class="mob-drop">${ICON_DROP}</span>`); shopBtn.type = 'button'; shopBtn.setAttribute('aria-controls', 'plp-rail'); shopBtn.setAttribute('aria-expanded', 'false');
  const filterBtn = el('button', 'clp-mob-btn clp-mob-filter', `${ICON_FILTER}<span class="mob-lbl">Filter</span><span class="mob-drop">${ICON_DROP}</span>`); filterBtn.type = 'button'; filterBtn.setAttribute('aria-controls', 'plp-rail'); filterBtn.setAttribute('aria-expanded', 'false');
  const sortWrap = el('div', 'clp-sort');
  sortWrap.append(el('div', 'clp-sort-mob', `${ICON_SORT}<span class="mob-lbl">Sort</span><span class="mob-drop">${ICON_DROP}</span>`), el('div', 'clp-sort-label', 'Sort by :'));
  const select = el('select', 'clp-sort-select'); select.setAttribute('aria-label', 'Sort by');
  { const o = el('option'); o.textContent = defaultSortLabel; o.selected = true; select.append(o); select.disabled = true; }
  sortWrap.append(select, el('div', 'clp-sort-chevron', ICON_DROP));
  tools.append(shopBtn, filterBtn, sortWrap); toolbar.append(qty, tools);
  const grid = el('div', 'clp-grid'); grid.id = 'cardList';
  const pagination = el('div', 'clp-pagination');
  results.append(toolbar, grid, pagination, el('div', 'clp-reco'));
  body.append(rail, results);

  /* fallback: the authored captured tiles, rendered at once (content-bearing without the API) */
  const fallback = tiles.map(tileFromCells);
  fallback.forEach((t) => grid.append(renderTile(t)));
  if (fallback.length) count.innerHTML = `${fallback.length} <span class="qty-label">Items</span>`;
  block.replaceChildren(body);

  const toggleRail = (btn) => { const open = rail.classList.toggle('is-open'); [shopBtn, filterBtn].forEach((b) => b.setAttribute('aria-expanded', open ? 'true' : 'false')); if (btn) btn.focus(); };
  shopBtn.addEventListener('click', () => toggleRail(shopBtn));
  filterBtn.addEventListener('click', () => toggleRail(filterBtn));

  /* static: facet group names as captured, no values (row 14 pending) */
  facetNames.forEach((name, i) => {
    const wrap = el('div', `clp-filter${i === facetNames.length - 1 ? ' clp-filter--last' : ''}`);
    const head = el('button', 'clp-filter-head', `<h3><span>${name}</span></h3>`); head.type = 'button'; head.setAttribute('aria-expanded', 'false'); head.disabled = true;
    wrap.append(head); facetHost.append(wrap);
  });
  block.classList.add('is-snapshot');
}
