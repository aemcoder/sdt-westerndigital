/**
 * product-listing — the commerce category listing: left rail (category tree, deals, facets), toolbar
 * ("N Items", sort), 4-up product tile grid, pagination.
 * DOCUMENT-FIRST + DATA-FED (dynamics row 14): the authored tile rows (captured first page) render at once and
 * stay as the fallback; when the page carries `categories` or `condition` the block
 * reads the storefront's product search API (CORS-open, same call the live PLP makes) for facets with counts, sort, paging and the live
 * `?filterBy<Facet>=a,b` / `?page=N` URL state (nav, home and use-case-chip links deep-link into it).
 * Authored tile text (name, capacity, price, badge) wins over API text for the products it carries; the API
 * supplies items the document does not. Price/inventory hydration stays decided-out (row 12).
 * Tiles link to the storefront PDP (absolute); "Compare" is the captured label only.
 * Schema: stardust/eds-schema/listing.json § product-listing.
 *
 * Authoring (rows):
 *   config rows — 2 cells, key | value:
 *     page-size      15
 *     sort           Most Popular                            (default sort label shown in the toolbar)
 *     filters        Brand, Capacity Range, Form Factor, …   (facet group NAMES shown in the rail without the API)
 *     category-tree  <ul><li><a href>Hard Drives (HDD)</a><ul><li><a href>Internal HDD</a></li>…</ul></li></ul>   (or `none`)
 *     tree-collapsed yes                                       (rail shows "Shop by Category +" with the tree hidden)
 *     deals          <p>Shop by Deals</p><ul><li><a href>Sale</a></li>…</ul>   (collapsed on the live page)
 *     categories     cat_internal, cat_hard_drives            (storefront category codes; absent = no category scope)
 *     condition      default | recertified | outlet           (the storefront's optionalCondition scope)
 *     facet-limit    10                                        (optional: options shown before "+ More")
 *     sort-options   relevance=Most Popular, launchDate=Latest Products, …   (optional: overrides the live labels)
 *     endpoint       https://api.westerndigital.com/wdwebservices/v2/us/products/search   (optional override)
 *   `filters` doubles as the rail order: facet groups are matched to the API facets by name.
 *   tile rows — ≥4 cells: <picture> | <p>Name</p> | <p>Capacity range</p> | <p>Starting at $x</p> | <p><a href>PDP</a></p> [| <p>BADGE</p>]
 * Authored nodes are cloned into slots (EW1). @ew-exempt none.
 */
const ICON_COMPARE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="0.5" y="0.5" width="15" height="15" fill="none" stroke="#707070"/><path d="M4.58-5.339H7.355v1.2H4.58V-1H3.309V-4.143H.533v-1.2H3.309V-8.244H4.58Z" transform="translate(4 13)" fill="#555"/></svg>';
const ICON_CHEV = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path stroke="black" d="M17.818,23.015,12.7,17.875l.725-.725,4.393,4.393,4.393-4.393.725.747Z" transform="translate(-7.143 29.7) rotate(-90)"/></svg>';
const ICON_DROP = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true"><path d="M6.5 9.5l5 5 5-5z" fill="#000"/></svg>';
const ICON_SHOP = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="2" y="11" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="11" width="7" height="7" rx="1" fill="#000"/></svg>';
const ICON_FILTER = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="8.5" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="14" width="16" height="3" rx="1" fill="#000"/></svg>';
const ICON_SORT = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M14 4v11l3-3 .7.7L13.5 17l-4.2-4.3.7-.7 3 3V4z" fill="#000"/><rect x="2" y="4" width="8" height="1.2" fill="#000"/><rect x="2" y="7.5" width="6.5" height="1.2" fill="#000"/><rect x="2" y="11" width="5" height="1.2" fill="#000"/></svg>';

const KEYS = ['page-size', 'sort', 'filters', 'category-tree', 'tree-collapsed', 'deals', 'featured', 'promo', 'categories', 'condition', 'facet-limit', 'sort-options', 'endpoint'];
const ENDPOINT = 'https://api.westerndigital.com/wdwebservices/v2/us/products/search';
const STORE = 'https://www.westerndigital.com';
const SORTS = 'relevance=Most Popular, launchDate=Latest Products, name-asc=Title A-Z, name-desc=Title Z-A, price-asc=Price Low-High, price-desc=Price High-Low';
// `condition` row → the storefront's customQuery (read from the live PLPs' data-customquery)
const conditionQuery = (c) => (!c || c === 'default' ? '*:* AND -optionalCondition_en_string_mv:*recertified*' : `*:* AND optionalCondition_en_string_mv:*${c}*`);
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

const PROMO = { template: null };
const kids = (n) => [...n.childNodes].map((c) => c.cloneNode(true)); // authored nodes are cloned: a tile re-renders on every state change
const inline = (cell) => kids(cell.children.length === 1 && cell.firstElementChild.tagName === 'P' ? cell.firstElementChild : cell); // a cell's lone <p> is unwrapped

function renderTile(t) {
  const cell = el('div', 'tile-cell');
  const tile = el('div', 'product-tile');
  const link = el('a', 'tile-link'); link.href = t.href;
  const top = el('div', 'tile-top');
  const media = el('div', 'tile-media'); const inner = el('div', 'tile-media-inner');
  if (t.nodes?.pic) { const pic = t.nodes.pic.cloneNode(true); const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img'); if (img) { img.loading = 'lazy'; if (!img.alt) img.alt = t.text.name; } inner.append(pic); }
  else if (t.img) { const img = el('img'); img.src = t.img; img.alt = t.text.name; img.width = 319; img.height = 319; img.loading = 'lazy'; inner.append(img); }
  media.append(inner);
  if (t.text.badge) media.append(el('div', `tile-badge${t.badgeBlack ? ' tile-badge--black' : ''}`, t.text.badge));
  top.append(media);
  const h2 = el('h2', 'tile-name'); if (t.nodes?.name) h2.append(...inline(t.nodes.name)); else h2.textContent = t.text.name; top.append(h2);
  const meta = el('div', 'tile-meta');
  if (t.text.cap) { const c = el('div', 'tile-cap'); c.append('Capacity: '); const s = el('strong'); if (t.nodes?.cap) s.append(...inline(t.nodes.cap)); else s.textContent = t.text.cap; c.append(s); meta.append(c); }
  if (t.text.price) {
    const p = el('p', 'tile-price');
    if (t.nodes?.price) p.append(...inline(t.nodes.price));
    else if (t.strike) { const old = el('em'); old.textContent = t.strike; const now = el('strong'); now.textContent = t.text.price; p.append('Starting at ', old, ' ', now); }
    else p.textContent = `Starting at ${t.text.price}`;
    if (p.querySelector('em')) p.classList.add('tile-price--strike'); // authored as <p>Starting at <em>$old</em> <strong>$new</strong></p>
    meta.append(p);
  }
  link.append(top, meta);
  const compare = el('button', 'tile-compare', `${ICON_COMPARE}<span>Compare</span>`); compare.type = 'button'; compare.setAttribute('aria-disabled', 'true'); compare.title = 'Compare products on westerndigital.com';
  tile.append(link, compare);
  // the storefront's "below the button" promotion box (extended warranty) — authored once per page (config row `promo`), shown on flagged tiles
  if (t.promo && PROMO.template) { const box = el('div', 'tile-promo'); box.append(...kids(PROMO.template)); tile.append(box); }
  cell.append(tile);
  return cell;
}

/* ---- API product → tile model (the live PLP's own mapping, read from its rendered tiles) ---- */
const pdpPath = (href) => { try { return new URL(href, STORE).pathname.replace(/\/$/, ''); } catch { return ''; } };
function tileFromProduct(prod) {
  const path = (prod.pagePath || '').replace(/^\/content\/store\/en-us/, '');
  const sku = prod.listOfSkuId?.[0];
  let cap = '';
  try { const caps = JSON.parse(prod.refCategories || '{}')['vc-capacity']?.data || []; if (caps.length) cap = caps.length > 1 ? `${caps[0].title}-${caps[caps.length - 1].title}` : caps[0].title; } catch { /* malformed refCategories: no capacity line */ }
  const base = prod.priceData; const sale = prod.discountPriceData;
  const strike = base && sale && sale.value < base.value ? base.formattedValue : '';
  const badge = prod.badgesInfo?.tagTitle || '';
  return {
    href: `${STORE}${path}${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`,
    img: prod.urlFileReference ? `${STORE}${prod.urlFileReference}.wdthumb.319.319.webp` : '',
    badgeBlack: /bg-black/.test(prod.badgesInfo?.styleClass || ''),
    strike,
    text: {
      name: prod.name || '', cap, price: (sale || base)?.formattedValue || '', badge,
    },
  };
}

/* ---- campaign tile (slot 3 of every grid page): host-bound feed, served as a code-bus snapshot ---- */
/* eslint-disable no-underscore-dangle -- `_path` / `_provenance` are the feed's own field names */
const CAMPAIGNS = '/data/products/clp-campaigns.json';
let campaignReq;
async function campaignTile() {
  campaignReq = campaignReq || fetch(`${window.hlx?.codeBasePath || ''}${CAMPAIGNS}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const json = await campaignReq;
  const here = `/content/store/en-us${window.location.pathname}`;
  const c = (json?.items || [])
    .filter((x) => x.applicableToAllPages || (x.urlApplicablePages || []).some((u) => here.startsWith(u._path)))
    .sort((a, b) => (b.attCampaignPriority || 0) - (a.attCampaignPriority || 0))[0];
  if (!c) return null;
  const cell = el('div', 'tile-cell tile-cell--campaign'); cell.dataset.snapshot = json._provenance?.snapshotAt || '';
  const a = el('a', 'campaign-tile'); a.href = `${STORE}${(c.campaignUrl?._path || '').replace(/^\/content\/store\/en-us/, '')}`; a.setAttribute('aria-label', c.title || '');
  if (c.image?._path) { const img = el('img'); img.src = `${STORE}${c.image._path}.wdthumb.500.500.webp`; img.alt = c.title || ''; img.loading = 'lazy'; a.append(img); }
  const copy = el('div', 'campaign-copy'); const h = el('h2'); h.textContent = c.title || ''; copy.append(h);
  if (c.subTitle) { const sub = el('p'); sub.append(...c.subTitle.split(/<br\s*\/?>/i).flatMap((line, i) => (i ? [el('br'), line] : [line]))); copy.append(sub); }
  a.append(copy); cell.append(a);
  return cell;
}
const placeCampaign = async (grid) => {
  const tile = await campaignTile();
  grid.querySelector('.tile-cell--campaign')?.remove();
  if (tile && grid.children.length) grid.insertBefore(tile, grid.children[2] || null);
};

/* eslint-enable no-underscore-dangle */

/* ---- data-fed state: URL ⇄ API ⇄ rail/grid/pagination ---- */
const paramFor = (id) => `filterBy${id.charAt(0).toUpperCase()}${id.slice(1)}`;
const idFor = (param) => `${param.charAt(8).toLowerCase()}${param.slice(9)}`;
const splitValues = (v) => v.split(/,(?!\d{3}(?:\D|$))/).map((x) => x.trim()).filter(Boolean); // "$1,000-$100,000" keeps its thousands comma
const facetLabel = (v) => v.replace(/\|[0-9A-F]{6}$/i, ''); // colour values carry "|HEX"

function readState(url = new URL(window.location.href)) {
  const filters = new Map();
  url.searchParams.forEach((value, key) => { if (key.startsWith('filterBy') && key.length > 8) filters.set(idFor(key), splitValues(value)); });
  const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
  return { filters, page };
}

function stateUrl(state) {
  const url = new URL(window.location.href);
  [...url.searchParams.keys()].filter((k) => k.startsWith('filterBy') || k === 'page').forEach((k) => url.searchParams.delete(k));
  state.filters.forEach((values, id) => { if (values.length) url.searchParams.set(paramFor(id), values.join(',')); });
  if (state.page > 1) url.searchParams.set('page', state.page);
  return `${url.pathname}${url.search.replace(/%2C/gi, ',').replace(/%7C/gi, '|')}`;
}

function apiUrl(api, state, sort) {
  let q = api.base || ':relevance';
  state.filters.forEach((values, id) => values.forEach((v) => { q += `:${id}:${v}`; }));
  const enc = (v) => encodeURIComponent(v).replace(/%20/g, '+').replace(/%3A/gi, ':').replace(/%2A/gi, '*');
  return `${api.endpoint}?fields=FULL&pageSize=${api.pageSize}&query=${enc(q)}&customQuery=${enc(api.custom)}&sort=${encodeURIComponent(sort)}&currentPage=${state.page - 1}`;
}

function renderPagination(host, { currentPage, totalPages }, state, go) {
  host.replaceChildren();
  if (!totalPages || totalPages < 2) return;
  const page = currentPage + 1;
  const ul = el('ul');
  const link = (n, cls, label) => {
    const a = el('a', cls); a.href = stateUrl({ ...state, page: n }); a.dataset.page = n;
    if (label) a.append(label);
    a.addEventListener('click', (e) => { e.preventDefault(); if (!a.classList.contains('is-disabled')) go(n); });
    return a;
  };
  const prev = el('li', 'pg-prev'); const pa = link(Math.max(1, page - 1), page === 1 ? 'is-disabled' : '');
  pa.append(el('span', 'pg-chev pg-chev--prev', ICON_CHEV), el('span', 'pg-lbl', 'PREV')); if (page === 1) pa.setAttribute('aria-disabled', 'true'); prev.append(pa); ul.append(prev);
  const nums = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages));
  let last = 0;
  [...nums].sort((a, b) => a - b).forEach((n) => {
    if (n - last > 1) ul.append(el('li', 'pg-dots', '<span class="pg-num">…</span>'));
    const li = el('li'); const a = link(n, `pg-num${n === page ? ' is-current' : ''}`, String(n)); if (n === page) a.setAttribute('aria-current', 'page'); a.setAttribute('aria-label', `Page ${n}`);
    li.append(a); ul.append(li); last = n;
  });
  const next = el('li', 'pg-next'); const na = link(Math.min(totalPages, page + 1), page === totalPages ? 'is-disabled' : '');
  na.append(el('span', 'pg-lbl', 'NEXT'), el('span', 'pg-chev', ICON_CHEV)); if (page === totalPages) na.setAttribute('aria-disabled', 'true'); next.append(na); ul.append(next);
  const nav = el('nav'); nav.setAttribute('aria-label', 'Pagination'); nav.append(ul);
  host.append(nav);
}

function renderFacets(host, facets, api, state, toggle) {
  const open = new Set([...host.querySelectorAll('.clp-filter-head[aria-expanded="true"]')].map((h) => h.dataset.facet));
  state.filters.forEach((v, id) => { if (v.length) open.add(id); });
  const byCode = new Map(facets.map((f) => [f.code, f]));
  const byName = new Map(facets.map((f) => [f.name.toLowerCase(), f.code]));
  const order = api.facetNames.length ? api.facetNames.map((n) => byName.get(n.toLowerCase())).filter(Boolean) : facets.map((f) => f.code);
  host.replaceChildren();
  order.forEach((id, i) => {
    const f = byCode.get(id);
    const wrap = el('div', `clp-filter${i === order.length - 1 ? ' clp-filter--last' : ''}`);
    const head = el('button', 'clp-filter-head'); head.type = 'button'; head.dataset.facet = id;
    const h3 = el('h3'); const span = el('span'); span.textContent = f.name; h3.append(span); head.append(h3);
    const ul = el('ul', 'clp-filter-options'); ul.id = `plp-facet-${id.replace(/[^\w-]/g, '_')}`;
    head.setAttribute('aria-controls', ul.id);
    const isOpen = open.has(id); head.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); ul.hidden = !isOpen;
    head.addEventListener('click', () => { const o = head.getAttribute('aria-expanded') === 'true'; head.setAttribute('aria-expanded', o ? 'false' : 'true'); ul.hidden = o; });
    const chosen = state.filters.get(id) || [];
    (f.values || []).forEach((v, n) => {
      const li = el('li', 'clp-option'); if (n >= api.limit) { li.classList.add('is-extra'); li.hidden = true; }
      const isOn = chosen.includes(v.code) || v.selected;
      const next = new Map(state.filters); next.set(id, isOn ? chosen.filter((x) => x !== v.code) : [...chosen, v.code]);
      const a = el('a', `clp-check${isOn ? ' is-active' : ''}`); a.href = stateUrl({ filters: next, page: 1 });
      a.setAttribute('role', 'checkbox'); a.setAttribute('aria-checked', isOn ? 'true' : 'false');
      const box = el('span', 'clp-box'); box.setAttribute('aria-hidden', 'true');
      const lbl = el('span', 'clp-check-label'); lbl.textContent = `${facetLabel(v.name || v.code)} (${v.count})`;
      a.append(box, lbl);
      a.addEventListener('click', (e) => { e.preventDefault(); toggle(id, v.code); });
      li.append(a); ul.append(li);
    });
    if ((f.values || []).length > api.limit) {
      const more = el('li', 'clp-more'); const btn = el('button', 'clp-more-btn', '+ More'); btn.type = 'button';
      btn.addEventListener('click', () => { const showing = btn.textContent.startsWith('-'); ul.querySelectorAll('.is-extra').forEach((x) => { x.hidden = showing; }); btn.textContent = showing ? '+ More' : '- Less'; });
      more.append(btn); ul.append(more);
    }
    wrap.append(head, ul); host.append(wrap);
  });
}

function renderChips(host, state, facets, toggle, clear) {
  host.replaceChildren();
  const names = new Map(facets.flatMap((f) => (f.values || []).map((v) => [`${f.code}|${v.code}`, v.name])));
  state.filters.forEach((values, id) => values.forEach((v) => {
    const chip = el('button', 'clp-selected-chip'); chip.type = 'button'; chip.setAttribute('aria-label', `Remove filter ${facetLabel(names.get(`${id}|${v}`) || v)}`);
    const t = el('span'); t.textContent = facetLabel(names.get(`${id}|${v}`) || v); chip.append(t, el('span', 'clp-chip-x', '×'));
    chip.addEventListener('click', () => toggle(id, v)); host.append(chip);
  }));
  const any = [...state.filters.values()].some((v) => v.length);
  if (any) { const c = el('button', 'clp-clear', 'Clear All'); c.type = 'button'; c.setAttribute('aria-label', 'Reset all filters'); c.addEventListener('click', clear); host.append(c); }
  host.hidden = !any;
}

function initDataFed(block, ctx) {
  const {
    api, sortOptions, byPath, fallback, grid, count, pagination, selected, facetHost, results,
  } = ctx;
  const select = block.querySelector('.clp-sort-select');
  select.replaceChildren(...sortOptions.map(([code, label]) => { const o = el('option'); o.value = code; o.textContent = label; return o; }));
  select.disabled = false;
  let sort = sortOptions[0][0];
  let state = readState();
  let seq = 0;

  const load = async ({ push = false, scroll = false } = {}) => {
    seq += 1; const mine = seq;
    block.classList.add('is-loading'); block.setAttribute('aria-busy', 'true');
    try {
      const resp = await fetch(apiUrl(api, state, sort), { credentials: 'omit' });
      if (!resp.ok) throw new Error(`product search ${resp.status}`);
      const json = await resp.json();
      if (mine !== seq) return;
      const pg = json.pagination || {};
      if (state.page > 1 && pg.totalPages && state.page > pg.totalPages) { state = { ...state, page: pg.totalPages }; load({ push }); return; }
      const items = (json.products || []).map((prod) => {
        const fromApi = tileFromProduct(prod);
        const authored = byPath.get(pdpPath(fromApi.href));
        return authored ? { ...authored, href: authored.href } : fromApi; // document-first: authored text wins
      });
      grid.replaceChildren(...items.map(renderTile));
      if (!items.length) grid.append(el('p', 'clp-empty', 'No products match the selected filters.'));
      else placeCampaign(grid);
      count.innerHTML = `${pg.totalResults ?? items.length} <span class="qty-label">Items</span>`;
      const facets = json.facets || [];
      const toggle = (id, code) => {
        const cur = state.filters.get(id) || []; const filters = new Map(state.filters);
        filters.set(id, cur.includes(code) ? cur.filter((x) => x !== code) : [...cur, code]);
        if (!filters.get(id).length) filters.delete(id);
        state = { filters, page: 1 }; load({ push: true });
      };
      const clear = () => { state = { filters: new Map(), page: 1 }; load({ push: true }); };
      renderFacets(facetHost, facets, api, state, toggle);
      renderChips(selected, state, facets, toggle, clear);
      renderPagination(pagination, pg, state, (n) => { state = { ...state, page: n }; load({ push: true, scroll: true }); });
      block.classList.remove('is-snapshot'); block.classList.add('is-live');
      block.dataset.total = pg.totalResults ?? '';
      if (push) window.history.pushState({ plp: true }, '', stateUrl(state));
      if (scroll) results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      // the API is gone (CORS locked, outage): the authored first page stays, facets stay inert
      if (mine === seq) { block.classList.add('is-snapshot'); block.dataset.apiError = e.message; if (!grid.children.length) fallback.forEach((t) => grid.append(renderTile(t))); }
    } finally {
      if (mine === seq) { block.classList.remove('is-loading'); block.removeAttribute('aria-busy'); }
    }
  };

  select.addEventListener('change', () => { sort = select.value; state = { ...state, page: 1 }; load({ push: true }); });
  window.addEventListener('popstate', () => { state = readState(); load(); });
  load();
}

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
  const close = el('button', 'clp-rail-close', '<span aria-hidden="true">×</span>'); close.type = 'button'; close.setAttribute('aria-label', 'Close filters');
  sticky.append(close, nav, filters); rail.append(sticky);

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
  if (fallback.length) { count.innerHTML = `${fallback.length} <span class="qty-label">Items</span>`; placeCampaign(grid); }
  block.replaceChildren(body);

  const toggleRail = (btn) => {
    const open = rail.classList.toggle('is-open'); [shopBtn, filterBtn].forEach((b) => b.setAttribute('aria-expanded', open ? 'true' : 'false'));
    if (open) close.focus(); else if (btn) btn.focus();
  };
  close.addEventListener('click', () => toggleRail(filterBtn));
  rail.addEventListener('keydown', (e) => { if (e.key === 'Escape' && rail.classList.contains('is-open')) toggleRail(filterBtn); });
  shopBtn.addEventListener('click', () => toggleRail(shopBtn));
  filterBtn.addEventListener('click', () => toggleRail(filterBtn));

  /* static first: facet group names as captured, inert until the API answers */
  const renderStaticFacets = () => facetNames.forEach((name, i) => {
    const wrap = el('div', `clp-filter${i === facetNames.length - 1 ? ' clp-filter--last' : ''}`);
    const head = el('button', 'clp-filter-head'); head.type = 'button'; head.setAttribute('aria-expanded', 'false'); head.disabled = true;
    const h3 = el('h3'); const span = el('span'); span.textContent = name; h3.append(span); head.append(h3);
    wrap.append(head); facetHost.append(wrap);
  });
  renderStaticFacets();
  block.classList.add('is-snapshot');

  /* then wire: the storefront search API drives facets, sort, paging (needs `categories` or `condition`) */
  if (!cfg.categories && !cfg.condition) return;
  const cats = list(cfg.categories?.textContent);
  const api = {
    endpoint: cfg.endpoint?.textContent.trim() || ENDPOINT,
    base: cats.length ? `:relevance${cats.map((c) => `:category:${c}`).join('')}` : '',
    custom: conditionQuery(cfg.condition?.textContent.trim().toLowerCase()),
    pageSize: Number(cfg['page-size']?.textContent.trim()) || 15,
    facetNames,
    limit: Number(cfg['facet-limit']?.textContent.trim()) || 10,
  };
  const sortOptions = list(cfg['sort-options']?.textContent || SORTS).map((x) => { const [code, ...label] = x.split('='); return [code.trim(), (label.join('=') || code).trim()]; });
  if (!sortOptions.length) sortOptions.push(['relevance', defaultSortLabel]);
  const byPath = new Map(fallback.map((t) => [pdpPath(t.href), t]));
  initDataFed(block, {
    api, sortOptions, byPath, fallback, grid, count, pagination, selected, facetHost, results,
  });
}
