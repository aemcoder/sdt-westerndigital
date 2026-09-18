/**
 * product-listing — the commerce category listing: left rail (category tree, deals, facet filters), toolbar
 * ("N Items", sort), 4-up product tile grid, pagination. Fed at runtime by the storefront's public search API
 * (scripts/wd-commerce.js — dynamics row 14, client-rendered/self, 2026-09-18 amendment). Tiles link to the
 * storefront PDP (absolute); "Compare" is the captured label only (compare stays on the storefront).
 * Schema: stardust/eds-schema/listing.json § product-listing.
 *
 * Authoring (rows):
 *   config rows — 2 cells, key | value:
 *     categories     cat_internal, cat_hard_drives            (search category codes, comma list)
 *     condition      default | recertified | outlet           (the storefront's optionalCondition filter)
 *     page-size      15
 *     sort           Most Popular                            (default sort label — see SORTS)
 *     filters        Brand, Capacity Range, Form Factor, …   (facet NAMES to list, in order — live typo "Inteface" kept)
 *     category-tree  <ul><li><a href>Hard Drives (HDD)</a><ul><li><a href>Internal HDD</a></li>…</ul></li></ul>   (or `none`)
 *     tree-collapsed yes                                       (rail shows "Shop by Category +" with the tree hidden)
 *     deals          <p>Shop by Deals</p><ul><li><a href>Sale</a></li>…</ul>   (collapsed on the live page)
 *   tile rows — ≥4 cells: <picture> | <p>Name</p> | <p>Capacity range</p> | <p>Starting at $x</p> | <p><a href>PDP</a></p> [| <p>BADGE</p>]
 *     = the captured first page (content-bearing fallback, rendered until the API answers; kept if it fails).
 * URL contract (same as the live storefront): ?filterBy<Facet>=<value> (repeatable), ?page=N, ?sort=<code>.
 * Authored nodes are MOVED into slots (EW1); API tiles are runtime data (EW9). @ew-exempt none.
 */
import { search, filtersFromSearch, tileData, SORTS } from '../../scripts/wd-commerce.js';

const ICON_COMPARE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="0.5" y="0.5" width="15" height="15" fill="none" stroke="#707070"/><path d="M4.58-5.339H7.355v1.2H4.58V-1H3.309V-4.143H.533v-1.2H3.309V-8.244H4.58Z" transform="translate(4 13)" fill="#555"/></svg>';
const ICON_CHEV = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path stroke="black" d="M17.818,23.015,12.7,17.875l.725-.725,4.393,4.393,4.393-4.393.725.747Z" transform="translate(-7.143 29.7) rotate(-90)"/></svg>';
const ICON_DROP = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true"><path d="M6.5 9.5l5 5 5-5z" fill="#000"/></svg>';
const ICON_SHOP = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="2" y="11" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="11" width="7" height="7" rx="1" fill="#000"/></svg>';
const ICON_FILTER = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="8.5" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="14" width="16" height="3" rx="1" fill="#000"/></svg>';
const ICON_SORT = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M14 4v11l3-3 .7.7L13.5 17l-4.2-4.3.7-.7 3 3V4z" fill="#000"/><rect x="2" y="4" width="8" height="1.2" fill="#000"/><rect x="2" y="7.5" width="6.5" height="1.2" fill="#000"/><rect x="2" y="11" width="5" height="1.2" fill="#000"/></svg>';

const KEYS = ['categories', 'condition', 'page-size', 'sort', 'filters', 'category-tree', 'tree-collapsed', 'deals', 'featured', 'promo'];
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

/* ---- URL state ---- */
function stateFromUrl() {
  const q = new URLSearchParams(window.location.search);
  return { filters: filtersFromSearch(window.location.search), page: Math.max(1, parseInt(q.get('page') || '1', 10)), sort: q.get('sort') || '' };
}
function urlFor({ filters, page, sort }, alwaysPage = false) {
  const q = new URLSearchParams();
  const grouped = new Map();
  filters.forEach(([f, v]) => { const k = `filterBy${f.charAt(0).toUpperCase()}${f.slice(1)}`; grouped.set(k, [...(grouped.get(k) || []), v]); });
  grouped.forEach((vs, k) => q.set(k, vs.join(',')));
  if (page > 1 || alwaysPage) q.set('page', String(page));
  if (sort) q.set('sort', sort);
  // the storefront keeps these characters literal in its filter URLs (e.g. Color `Purple|800080`, Price `$50-$199.99`, `(NAS)`, `12Gb/s`)
  const s = q.toString().replace(/%20/g, '+').replace(/%7C/gi, '|').replace(/%24/g, '$').replace(/%2C/gi, ',').replace(/%28/g, '(').replace(/%29/g, ')').replace(/%2F/gi, '/');
  return `${window.location.pathname}${s ? `?${s}` : ''}`;
}

export default function decorate(block) {
  const { cfg, tiles } = readConfig(block);
  const categories = list(cfg.categories?.textContent);
  const condition = (cfg.condition?.textContent.trim() || 'default').toLowerCase();
  const pageSize = parseInt(cfg['page-size']?.textContent.trim() || '15', 10);
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
  SORTS.forEach(([label, code]) => { const o = el('option'); o.value = code; o.textContent = label; if (label === defaultSortLabel) o.selected = true; select.append(o); });
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

  /* ---- runtime: the search API ---- */
  let state = stateFromUrl();
  let controller = null;
  const defaultSortCode = (SORTS.find(([l]) => l === defaultSortLabel) || SORTS[0])[1];

  const navigate = (next, push = true) => {
    state = { ...state, ...next };
    if (push) window.history.pushState(null, '', urlFor(state));
    load(); // eslint-disable-line no-use-before-define
  };

  const renderFacets = (facets) => {
    facetHost.replaceChildren();
    const wanted = facetNames.length ? facetNames : facets.map((f) => f.name);
    const items = wanted.map((name) => facets.find((f) => f.name === name)).filter(Boolean);
    items.forEach((f, i) => {
      const wrap = el('div', `clp-filter${i === items.length - 1 ? ' clp-filter--last' : ''}`);
      const head = el('button', 'clp-filter-head', `<h3><span>${f.name}</span></h3>`); head.type = 'button'; head.setAttribute('aria-expanded', 'false');
      const ul = el('ul', 'clp-filter-options'); ul.hidden = true;
      f.values.forEach((v) => {
        // the filter VALUE is the storefront's query token (e.g. Color "Purple|800080"), read off the facet's own query string
        const token = (() => { const q = v.query?.query?.value || ''; const i = q.indexOf(`:${f.code}:`); return i >= 0 ? decodeURIComponent(q.slice(i + f.code.length + 2).split(':')[0].replace(/\+/g, ' ')) : v.name; })();
        const li = el('li'); const a = el('a'); const active = state.filters.some(([c, val]) => c === f.code && val === token);
        const nextFilters = active ? state.filters.filter(([c, val]) => !(c === f.code && val === token)) : [...state.filters, [f.code, token]];
        a.href = urlFor({ ...state, filters: nextFilters, page: 1 }); a.textContent = `${v.name.split('|')[0]} (${v.count})`; // Color values arrive as `Name|hex`; the live rail shows the name if (active) a.classList.add('is-active');
        a.addEventListener('click', (e) => { e.preventDefault(); navigate({ filters: nextFilters, page: 1 }); });
        li.append(a); ul.append(li);
      });
      head.addEventListener('click', () => { const open = head.getAttribute('aria-expanded') === 'true'; head.setAttribute('aria-expanded', open ? 'false' : 'true'); ul.hidden = open; });
      wrap.append(head, ul); facetHost.append(wrap);
    });
    /* selected chips */
    selected.replaceChildren();
    if (state.filters.length) {
      selected.hidden = false;
      selected.append(el('div', 'clp-selected-title', 'Filter by'));
      const chips = el('div', 'clp-selected-chips');
      state.filters.forEach(([c, v]) => { const b = el('button', 'clp-selected-chip', `${v} <span aria-hidden="true">×</span>`); b.type = 'button'; b.setAttribute('aria-label', `Remove filter ${v}`); b.addEventListener('click', () => navigate({ filters: state.filters.filter(([cc, vv]) => !(cc === c && vv === v)), page: 1 })); chips.append(b); });
      const clear = el('button', 'clp-clear', 'Clear All'); clear.type = 'button'; clear.setAttribute('aria-label', 'Reset all filters'); clear.addEventListener('click', () => navigate({ filters: [], page: 1 }));
      selected.append(chips, clear);
    } else selected.hidden = true;
  };

  const renderPagination = (pg) => {
    pagination.replaceChildren();
    if (!pg || pg.totalPages <= 1) return;
    const ul = el('ul'); const cur = pg.currentPage + 1;
    const pageLink = (n, cls, html) => { const a = el('a', cls, html); a.href = urlFor({ ...state, page: n }, true); a.addEventListener('click', (e) => { e.preventDefault(); navigate({ page: n }); results.scrollIntoView({ block: 'start' }); }); return a; };
    const prev = el('li', 'pg-prev'); prev.append(pageLink(Math.max(1, cur - 1), cur === 1 ? 'is-disabled' : '', `<span class="pg-chev pg-chev--prev">${ICON_CHEV}</span><span class="pg-lbl">PREV</span>`)); ul.append(prev);
    for (let n = 1; n <= pg.totalPages; n += 1) {
      const li = el('li');
      if (n === cur) { const curEl = el('span', 'pg-num is-current', `<span>${n}</span>`); curEl.setAttribute('aria-current', 'page'); li.append(curEl); } // live: the active page is a plain number, not a link
      else li.append(pageLink(n, 'pg-num', `<span>${n}</span>`));
      ul.append(li);
    }
    const next = el('li', 'pg-next'); next.append(pageLink(Math.min(pg.totalPages, cur + 1), cur === pg.totalPages ? 'is-disabled' : '', `<span class="pg-lbl">NEXT</span><span class="pg-chev">${ICON_CHEV}</span>`)); ul.append(next);
    pagination.append(ul);
  };

  async function load() {
    if (controller) controller.abort();
    controller = new AbortController();
    block.classList.add('is-loading');
    try {
      const sort = state.sort || defaultSortCode;
      const data = await search({ sort, categories, filters: state.filters, condition, page: state.page - 1, pageSize, signal: controller.signal });
      const items = (data.products || []).map((p) => {
        const t = tileData(p);
        const badge = p.badgesInfo?.tagTitle || (/\/outlet\//.test(p.pagePath || p.url || '') ? 'FINAL PRODUCTION' : '');
        const was = p.priceData?.value; const now = p.discountPriceData?.value;
        const strike = was && now && now < was ? p.priceData.formattedValue : '';
        const price = strike ? `Starting at ${p.discountPriceData.formattedValue}` : t.price;
        return { href: t.href, img: t.img, stock: p.stock?.stockLevelStatus, badgeBlack: /bg-black/.test(p.badgesInfo?.styleClass || ''), strike, promo: !!p.attBelowAddToCartButtonPromo, text: { name: t.name, cap: t.capacity, price, badge } };
      });
      grid.replaceChildren(...items.map(renderTile));
      count.innerHTML = `${data.pagination?.totalResults ?? items.length} <span class="qty-label">Items</span>`;
      select.value = sort;
      renderFacets(data.facets || []);
      renderPagination(data.pagination);
      block.classList.add('is-live');
    } catch (e) {
      if (e.name !== 'AbortError') block.classList.add('is-fallback'); // authored tiles stay
    } finally { block.classList.remove('is-loading'); }
  }

  select.addEventListener('change', () => navigate({ sort: select.value === defaultSortCode ? '' : select.value, page: 1 }));
  window.addEventListener('popstate', () => { state = stateFromUrl(); load(); });
  if (categories.length || condition !== 'default') load();
  else renderFacets([]);
}
