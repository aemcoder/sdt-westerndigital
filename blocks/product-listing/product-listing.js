/**
 * product-listing — the commerce category listing: left rail (category tree, deals, facets), toolbar
 * ("N Items", sort), 4-up product tile grid, pagination. Document-first: the authored tile rows are the
 * captured first page and render at once. With a `query` row the block is DATA-FED (dynamics row 14):
 * it calls the storefront's public product-search API (CORS-open) with the source page's own query, and
 * facets / sort / pagination run exactly as on the source (toggle queries come from the API response,
 * URL state `?filterBy<Code>=v1,v2&page=N`). Without `query` (or when the API fails) it stays the static
 * snapshot. Tiles link to the storefront PDP (absolute); "Compare" is the captured label only.
 * Schema: stardust/eds-schema/listing.json § product-listing.
 *
 * Authoring (rows):
 *   config rows — 2 cells, key | value:
 *     query          :relevance:category:cat_internal&customQuery=*:*+AND+-optionalCondition_en_string_mv:*recertified*
 *                    (the source CLP component's customQuery, verbatim; optional — absent = static snapshot)
 *     facets         brandName, vvc-capacity, device_List, …  (facet codes in rail order; optional — else matched on `filters` names)
 *     filter-limit   10                                       (values shown before "+ More")
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

const KEYS = ['page-size', 'sort', 'filters', 'category-tree', 'tree-collapsed', 'deals', 'featured', 'promo', 'query', 'facets', 'filter-limit'];

/* storefront contract (source: clp-vue StoreCategoryBanner + the CLP dialog config on every en-us listing) */
const API = 'https://api.westerndigital.com/wdwebservices/v2/us/products/search';
const STOREFRONT = 'https://www.westerndigital.com';
const SORTS = [['relevance', 'Most Popular'], ['launchDate', 'Latest Products'], ['name-asc', 'Title A-Z'], ['name-desc', 'Title Z-A'], ['price-asc', 'Price Low-High'], ['price-desc', 'Price High-Low']];
const URL_ORDER = ['brandName', 'useCases', 'device_List', 'vvc-capacity', 'capacityValues', 'color_List', 'type', 'priceRange'];
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

  /* static: facet group names as captured, no values — replaced by the live facets once the API answers */
  facetNames.forEach((name, i) => {
    const wrap = el('div', `clp-filter${i === facetNames.length - 1 ? ' clp-filter--last' : ''}`);
    const head = el('button', 'clp-filter-head', `<h3><span>${name}</span></h3>`); head.type = 'button'; head.setAttribute('aria-expanded', 'false'); head.disabled = true;
    wrap.append(head); facetHost.append(wrap);
  });
  block.classList.add('is-snapshot');

  const query = cfg.query?.textContent.trim();
  if (query) {
    wire(block, {
      query,
      pageSize: parseInt(cfg['page-size']?.textContent, 10) || 15,
      limit: parseInt(cfg['filter-limit']?.textContent, 10) || 10,
      facetCodes: list(cfg.facets?.textContent),
      facetNames,
      ui: { select, count, grid, pagination, facetHost, selected, results },
    });
  }
}

/* ---- data-fed listing (row 14): the source CLP's state machine over the public search API ---- */
const tail = (q) => (q.includes('&') ? q.slice(q.indexOf('&')) : '');
const head = (q) => (q.includes('&') ? q.slice(0, q.indexOf('&')) : q);
const cap1 = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const valueLabel = (code, v) => `${code === 'color_List' ? v.name.split('|')[0] : v.name} (${v.count})`;

function tileFromProduct(p) {
  const caps = (p.categories || []).filter((c) => /^vvc-capacity-/.test(c.code)).sort((a, b) => a.sequence - b.sequence);
  const cap = caps.length ? `${caps[0].name}${caps.length > 1 ? `-${caps[caps.length - 1].name}` : ''}`.replace(/\s+/g, '') : '';
  const price = p.priceData?.formattedValue; const deal = p.discountPriceData;
  const strike = price && deal && deal.value < p.priceData.value ? price : '';
  const img = p.mediaLinks?.multiMedia?.productImages?.[0];
  const sku = p.listOfSkuId?.[0];
  const path = (p.pagePath || '').replace(/^\/content\/store\/en-us/, '');
  return {
    href: `${STOREFRONT}${path}${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`,
    img: img ? `${STOREFRONT}${img}.wdthumb.319.319.webp` : '',
    strike,
    badgeBlack: /bg-black/.test(p.badgesInfo?.styleClass || ''),
    text: { name: p.name || '', cap, price: price ? `Starting at ${strike ? deal.formattedValue : price}` : '', badge: p.badgesInfo?.tagTitle || '' },
  };
}

/* the source's pagination window (updatePagination + showPaginationDots), page index 0-based */
function pageWindow(cur, total) {
  let dotsStart = cur + 1 > 4 && total !== 6; let dotsEnd = cur + 4 < total;
  if (total === 5) { dotsStart = false; dotsEnd = false; }
  let range = [2, 4];
  if (total === 5 || total === 4) range = [2, 4];
  else if (cur + 1 < 4 && cur + 4 !== total) range = [2, total > 4 ? 4 : total];
  else if (cur + 1 === 4 && cur + 4 !== total) range = [2, cur + 1 === total ? total : 5];
  else if (cur + 1 > 4 && cur + 4 < total) range = [cur, cur + 2];
  else if (cur + 1 > 4 && cur + 4 === total) range = [cur, total - 1];
  else if (cur + 4 > total) range = [total - 4, total - 1];
  else if (cur + 4 === total) range = [2, total - 1];
  return { dotsStart, dotsEnd, range };
}

function wire(block, opts) {
  const { ui, pageSize, limit } = opts;
  const state = { query: opts.query, sort: 'relevance', page: 0, open: new Set(), more: new Set(), facets: [], selected: [] };

  /* URL → state (getFiltersFromURL): filterBy<Code>=v1,v2 appended to the page query; page=N */
  const raw = window.location.search.slice(1).split('&').filter(Boolean);
  let extra = '';
  raw.filter((kv) => kv.startsWith('filterBy')).forEach((kv) => {
    const [k, v = ''] = kv.split('=');
    const name = k.replace('filterBy', ''); const code = name.charAt(0).toLowerCase() + name.slice(1);
    v.split(',').filter(Boolean).forEach((x) => { extra += `:${code}:${x.replace('|', '%7C')}`; });
  });
  if (extra) state.query = head(opts.query) ? `${head(opts.query)}${extra}${tail(opts.query)}` : `:${state.sort}${extra}${tail(opts.query)}`;
  const pg = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
  if (pg > 0) state.page = pg - 1;

  /* sort: the six storefront options, live (price sorts shown — the en-us catalog is purchasable) */
  ui.select.replaceChildren(...SORTS.map(([v, label]) => { const o = el('option', '', label); o.value = v; return o; }));
  ui.select.value = state.sort; ui.select.disabled = false;
  ui.select.addEventListener('change', () => { state.sort = ui.select.value; state.page = 0; run(); });

  function pushUrl() {
    const params = {};
    state.facets.forEach((f) => { const on = f.values.filter((v) => v.selected).map((v) => v.code); if (on.length) params[f.code] = on.join(','); });
    const keys = [...URL_ORDER.filter((k) => k in params), ...Object.keys(params).filter((k) => !URL_ORDER.includes(k))];
    const qs = new URLSearchParams(); keys.forEach((k) => qs.set(`filterBy${cap1(k)}`, params[k]));
    const s = qs.toString() ? `?${decodeURIComponent(qs.toString())}` : '';
    const page = state.page > 0 ? `${s ? '&' : '?'}page=${state.page + 1}` : '';
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${s}${page}`);
  }

  function filterTo(q) { state.query = `${q}${tail(opts.query)}`; state.page = 0; run(); }

  function renderFacets() {
    ui.facetHost.replaceChildren();
    state.facets.forEach((f, i) => {
      const wrap = el('div', `clp-filter${i === state.facets.length - 1 ? ' clp-filter--last' : ''}`);
      const isOpen = state.open.has(f.code);
      const btn = el('button', 'clp-filter-head', `<h3><span></span></h3>`); btn.type = 'button'; btn.querySelector('span').textContent = f.name;
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const ul = el('ul', 'clp-filter-options'); ul.hidden = !isOpen;
      const showAll = state.more.has(f.code);
      f.values.forEach((v, j) => {
        const li = el('li', 'clp-filter-value'); if (j >= limit && !showAll) li.hidden = true;
        const label = el('label'); const cb = el('input'); cb.type = 'checkbox'; cb.name = f.code; cb.value = v.name; cb.checked = !!v.selected;
        cb.addEventListener('change', () => { state.open.add(f.code); filterTo(v.query.query.value); });
        label.append(cb, el('span', '', '')); label.lastChild.textContent = valueLabel(f.code, v); li.append(label); ul.append(li);
      });
      if (f.values.length > limit) {
        const more = el('li', 'clp-filter-more'); const b = el('button', '', showAll ? '- Less' : '+ More'); b.type = 'button';
        b.addEventListener('click', () => { if (state.more.has(f.code)) state.more.delete(f.code); else state.more.add(f.code); renderFacets(); });
        more.append(b); ul.append(more);
      }
      btn.addEventListener('click', () => { if (state.open.has(f.code)) state.open.delete(f.code); else state.open.add(f.code); btn.setAttribute('aria-expanded', state.open.has(f.code) ? 'true' : 'false'); ul.hidden = !state.open.has(f.code); });
      wrap.append(btn, ul); ui.facetHost.append(wrap);
    });
    /* selected chips (the source's mobile "selected filters" bar) + Clear All */
    ui.selected.replaceChildren();
    state.selected.forEach((v) => {
      const chip = el('button', 'clp-selected-chip'); chip.type = 'button'; chip.setAttribute('aria-label', `Remove filter ${v.name.split('|')[0]}`);
      chip.textContent = `${v.name.split('|')[0]} ×`; chip.addEventListener('click', () => filterTo(v.query.query.value)); ui.selected.append(chip);
    });
    if (state.selected.length) { const clear = el('button', 'clp-clear', 'Clear All'); clear.type = 'button'; clear.addEventListener('click', () => { state.query = opts.query; state.page = 0; run(); }); ui.selected.append(clear); }
    ui.selected.hidden = !state.selected.length;
  }

  function renderPager(total) {
    ui.pagination.replaceChildren();
    if (total <= 1) return;
    const cur = state.page; const { dotsStart, dotsEnd, range } = pageWindow(cur, total);
    const ul = el('ul');
    const link = (n, label, cls) => {
      const a = el('a', cls); a.href = `${window.location.pathname}?page=${n + 1}`; a.innerHTML = label;
      a.addEventListener('click', (e) => { e.preventDefault(); if (n < 0 || n >= total || n === state.page) return; state.page = n; run(true); });
      return a;
    };
    const num = (n) => { const li = el('li'); const a = link(n, `${n + 1}`, `pg-num${n === cur ? ' is-current' : ''}`); if (n === cur) a.setAttribute('aria-current', 'page'); li.append(a); return li; };
    const prev = el('li', 'pg-prev'); const pa = link(cur - 1, `<span class="pg-chev pg-chev--prev">${ICON_CHEV}</span><span class="pg-lbl">PREV</span>`, cur === 0 ? 'is-disabled' : ''); pa.setAttribute('aria-label', 'Previous page'); prev.append(pa); ul.append(prev);
    ul.append(num(0));
    if (dotsStart) ul.append(el('li', 'pg-dots', '<span>...</span>'));
    for (let i = Math.max(2, range[0]); i <= range[1]; i += 1) if (i - 1 < total && i - 1 > 0 && !(total > 4 && i === total)) ul.append(num(i - 1));
    if (dotsEnd) ul.append(el('li', 'pg-dots', '<span>...</span>'));
    if (total > 4) ul.append(num(total - 1));
    const next = el('li', 'pg-next'); const na = link(cur + 1, `<span class="pg-lbl">NEXT</span><span class="pg-chev">${ICON_CHEV}</span>`, cur === total - 1 ? 'is-disabled' : ''); na.setAttribute('aria-label', 'Next page'); next.append(na); ul.append(next);
    ui.pagination.append(ul);
  }

  let seq = 0;
  async function run(scroll) {
    seq += 1; const mine = seq;
    block.classList.add('is-loading');
    const url = `${API}?fields=FULL&pageSize=${pageSize}&query=${state.query}&sort=${state.sort}&currentPage=${state.page}`;
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`search ${res.status}`);
      const data = await res.json();
      if (mine !== seq) return;
      if (data.pagination?.totalResults && state.page >= data.pagination.totalPages) { state.page = 0; run(); return; }
      const byCode = new Map((data.facets || []).map((f) => [f.code, f]));
      const byName = new Map((data.facets || []).map((f) => [f.name, f]));
      state.facets = (opts.facetCodes.length ? opts.facetCodes.map((c) => byCode.get(c)) : opts.facetNames.map((n) => byName.get(n))).filter(Boolean);
      state.selected = state.facets.flatMap((f) => f.values.filter((v) => v.selected));
      const products = data.products || [];
      ui.grid.replaceChildren(...(products.length ? products.map((p) => renderTile(tileFromProduct(p))) : [el('div', 'clp-empty', 'No Records Found.')]));
      ui.count.innerHTML = `${data.pagination?.totalResults || 0} <span class="qty-label">Items</span>`;
      renderFacets(); renderPager(data.pagination?.totalPages || 0); pushUrl();
      block.classList.remove('is-snapshot'); block.classList.add('is-live');
      block.dataset.source = 'api.westerndigital.com product search';
      if (scroll) ui.results.scrollIntoView({ block: 'start' });
    } catch (e) {
      // degrade to the authored snapshot (static first): tiles, count and inert facets stay as authored
      block.dataset.sourceError = String(e.message || e);
    } finally { if (mine === seq) block.classList.remove('is-loading'); }
  }
  run();
}
