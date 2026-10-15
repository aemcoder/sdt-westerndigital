/**
 * product-listing — the commerce category listing: left rail (category tree, deals, facets), toolbar
 * ("N Items", sort), 4-up product tile grid, pagination. DOCUMENT-FIRST, DATA-FED (dynamics row 14):
 * the authored rows (the captured first page) render at once; then the block queries the storefront's
 * catalog search (scripts/site-config.js productSearch) for the page's category + condition and
 * replaces the grid with the live result, renders the facets named in `filters`, the sort select and
 * the pagination. URL state matches the source: `?filterBy<FacetCode>=<value>` (repeatable), `?page=N`,
 * plus `?sort=<code>` when not the default. API down → the authored tiles stay, facets stay inert.
 * Tiles link to the storefront PDP (absolute); "Compare" is the captured label only. Prices: an authored
 * tile keeps its captured price (row 12 interim); a tile only the API returned shows the catalog price.
 * Schema: stardust/eds-schema/listing.json § product-listing.
 *
 * Authoring (rows):
 *   config rows — 2 cells, key | value:
 *     categories     cat_internal, cat_hard_drives           (catalog category codes; omit for condition-only listings)
 *     condition      default | recertified | outlet           (default excludes recertified items)
 *     page-size      15
 *     sort           Most Popular                            (sort label shown in the toolbar)
 *     filters        Brand, Capacity Range, Form Factor, …   (facet group NAMES shown in the rail, in order)
 *     category-tree  <ul><li><a href>Hard Drives (HDD)</a><ul><li><a href>Internal HDD</a></li>…</ul></li></ul>   (or `none`)
 *     tree-collapsed yes                                       (rail shows "Shop by Category +" with the tree hidden)
 *     deals          <p>Shop by Deals</p><ul><li><a href>Sale</a></li>…</ul>   (collapsed on the live page)
 *   tile rows — ≥4 cells: <picture> | <p>Name</p> | <p>Capacity range</p> | <p>Starting at $x</p> | <p><a href>PDP</a></p> [| <p>BADGE</p>]
 * Authored nodes are MOVED into slots (EW1). @ew-exempt none.
 */
import siteConfig from '../../scripts/site-config.js';

const ICON_COMPARE = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><rect x="0.5" y="0.5" width="15" height="15" fill="none" stroke="#707070"/><path d="M4.58-5.339H7.355v1.2H4.58V-1H3.309V-4.143H.533v-1.2H3.309V-8.244H4.58Z" transform="translate(4 13)" fill="#555"/></svg>';
const ICON_CHEV = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path stroke="black" d="M17.818,23.015,12.7,17.875l.725-.725,4.393,4.393,4.393-4.393.725.747Z" transform="translate(-7.143 29.7) rotate(-90)"/></svg>';
const ICON_DROP = '<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" aria-hidden="true"><path d="M6.5 9.5l5 5 5-5z" fill="#000"/></svg>';
const ICON_SHOP = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="2" width="7" height="7" rx="1" fill="#000"/><rect x="2" y="11" width="7" height="7" rx="1" fill="#000"/><rect x="11" y="11" width="7" height="7" rx="1" fill="#000"/></svg>';
const ICON_FILTER = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="3" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="8.5" width="16" height="3" rx="1" fill="#000"/><rect x="2" y="14" width="16" height="3" rx="1" fill="#000"/></svg>';
const ICON_SORT = '<svg class="mob-ico" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M14 4v11l3-3 .7.7L13.5 17l-4.2-4.3.7-.7 3 3V4z" fill="#000"/><rect x="2" y="4" width="8" height="1.2" fill="#000"/><rect x="2" y="7.5" width="6.5" height="1.2" fill="#000"/><rect x="2" y="11" width="5" height="1.2" fill="#000"/></svg>';

const KEYS = ['categories', 'condition', 'page-size', 'sort', 'filters', 'category-tree', 'tree-collapsed', 'deals', 'featured', 'promo'];
// the source's sort select, in its order (value = API sort code)
const SORTS = [['relevance', 'Most Popular'], ['launchDate', 'Latest Products'], ['name-asc', 'Title A-Z'], ['name-desc', 'Title Z-A'], ['price-asc', 'Price Low-High'], ['price-desc', 'Price High-Low']];
const OPTIONS_LIMIT = 10; // live data-filteroptionslimit: values beyond it sit behind "+ More"
const ICON_X = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M1 1l10 10M11 1L1 11" stroke="#000" stroke-width="1.5"/></svg>';
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
const pdpKey = (href) => { try { return new URL(href, window.location.href).pathname.replace(/\/$/, '').toLowerCase(); } catch { return ''; } };

function tileFromCells(cells) {
  const [pic, name, cap, price, link, badge, promo] = cells;
  const a = link?.querySelector('a');
  const badgeText = badge?.textContent.trim() || '';
  const picture = pic.querySelector('picture, img');
  return {
    href: a?.getAttribute('href') || '#', nodes: { pic: picture, name, cap, price, badge },
    // kept for the live grid: an API tile that matches this PDP reuses the authored image and captured price
    copy: { pic: picture?.cloneNode(true), priceHtml: price?.innerHTML || '' },
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
    else if (t.priceHtml) p.innerHTML = t.priceHtml;
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

/* ---- live layer (row 14): URL state ⇄ catalog search ⇄ grid, facets, sort, pagination ---- */
const paramOf = (code) => `filterBy${code[0].toUpperCase()}${code.slice(1)}`; // brandName → filterByBrandName (source URL scheme)
const codeOf = (param) => param.replace(/^filterBy/, '').replace(/^./, (c) => c.toLowerCase());
const valueLabel = (name) => String(name).split('|')[0]; // colour facets carry "Purple|800080"

function readState() {
  const sp = new URLSearchParams(window.location.search);
  const filters = [];
  sp.forEach((v, k) => { if (k.startsWith('filterBy') && v) filters.push([codeOf(k), v]); });
  const sort = SORTS.some(([code]) => code === sp.get('sort')) ? sp.get('sort') : 'relevance';
  return { filters, sort, page: Math.max(1, parseInt(sp.get('page'), 10) || 1) };
}

function stateHref(state) {
  const u = new URL(window.location.href); u.hash = '';
  [...u.searchParams.keys()].filter((k) => k.startsWith('filterBy') || k === 'page' || k === 'sort').forEach((k) => u.searchParams.delete(k));
  state.filters.forEach(([code, v]) => u.searchParams.append(paramOf(code), v));
  if (state.sort !== 'relevance') u.searchParams.set('sort', state.sort);
  if (state.page > 1) u.searchParams.set('page', state.page);
  return `${u.pathname}${u.search}`;
}

// the source's query shape: query=":relevance:category:<c>…:<facet>:<value>…", customQuery = the condition clause
function apiUrl(ctx, state) {
  const base = ctx.categories.map((c) => `:category:${c}`).join('');
  const facets = state.filters.map(([code, v]) => `:${code}:${v}`).join('');
  const condition = ctx.condition === 'default' ? '*:* AND -optionalCondition_en_string_mv:*recertified*' : `*:* AND optionalCondition_en_string_mv:*${ctx.condition}*`;
  const u = new URL(ctx.search.endpoint);
  u.searchParams.set('fields', 'FULL'); u.searchParams.set('pageSize', ctx.pageSize);
  u.searchParams.set('query', base || facets ? `:relevance${base}${facets}` : '');
  u.searchParams.set('customQuery', condition); u.searchParams.set('sort', state.sort); u.searchParams.set('currentPage', state.page - 1);
  return u;
}

function tileFromProduct(p, ctx, byPdp) {
  const path = (p.pagePath || '').replace(/^\/content\/store\/[a-z]{2}-[a-z]{2}/, '');
  const authored = byPdp.get(path.toLowerCase());
  let caps = [];
  try { caps = (JSON.parse(p.refCategories || '{}')['vc-capacity']?.data || []).map((d) => d.title); } catch { /* malformed */ }
  const cap = caps.length > 1 && caps[0] !== caps[caps.length - 1] ? `${caps[0]}-${caps[caps.length - 1]}` : caps[0] || '';
  const listPrice = p.priceData; const sale = p.discountPriceData;
  let price = ''; let priceHtml = '';
  if (authored) priceHtml = authored.copy.priceHtml; // captured price (row 12 interim: no live price hydration)
  else if (listPrice?.formattedValue) {
    priceHtml = sale?.value < listPrice.value ? `Starting at <em>${listPrice.formattedValue}</em> <strong>${sale.formattedValue}</strong>` : `Starting at ${listPrice.formattedValue}`;
  }
  if (priceHtml) price = priceHtml.replace(/<[^>]+>/g, '');
  const badge = p.badgesInfo?.tagTitle || '';
  return {
    href: `${ctx.search.storefront}${path}${p.listOfSkuId?.[0] ? `?sku=${p.listOfSkuId[0]}` : ''}`,
    nodes: authored?.copy.pic ? { pic: authored.copy.pic.cloneNode(true) } : null,
    img: p.urlFileReference ? `${ctx.search.storefront}${p.urlFileReference}.wdthumb.319.319.webp` : '',
    priceHtml, badgeBlack: /bg-black/.test(p.badgesInfo?.styleClass || ''), promo: !!authored?.promo,
    text: { name: p.name || '', cap, price, badge },
  };
}

function renderPagination(host, state, totalPages, go) {
  host.replaceChildren();
  if (totalPages <= 1) return;
  const link = (page, cls, html) => { const a = el('a', cls, html); a.href = stateHref({ ...state, page }); a.addEventListener('click', (e) => { e.preventDefault(); go({ ...state, page }); }); return a; };
  const ul = el('ul');
  const prev = el('li', 'pg-prev'); const p = link(Math.max(1, state.page - 1), '', `<span class="pg-chev pg-chev--prev">${ICON_CHEV}</span><span class="pg-lbl">PREV</span>`); p.id = 'prevbtn';
  if (state.page === 1) { p.classList.add('is-disabled'); p.setAttribute('aria-disabled', 'true'); }
  prev.append(p); ul.append(prev);
  // window: first, current ±1, last — gaps as "…" (live shows dots beyond 5 pages)
  const pages = [...new Set([1, state.page - 1, state.page, state.page + 1, totalPages])].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  if (totalPages <= 5) pages.splice(0, pages.length, ...Array.from({ length: totalPages }, (_, i) => i + 1));
  pages.forEach((n, i) => {
    if (i && n - pages[i - 1] > 1) ul.append(el('li', 'pg-dots', '<span class="pg-num">…</span>'));
    const li = el('li'); const a = link(n, `pg-num${n === state.page ? ' is-current' : ''}`, `<span>${n}</span>`);
    if (n === state.page) a.setAttribute('aria-current', 'page');
    li.append(a); ul.append(li);
  });
  const next = el('li', 'pg-next'); const nx = link(Math.min(totalPages, state.page + 1), '', `<span class="pg-lbl">NEXT</span><span class="pg-chev">${ICON_CHEV}</span>`); nx.id = 'nextbtn';
  if (state.page === totalPages) { nx.classList.add('is-disabled'); nx.setAttribute('aria-disabled', 'true'); }
  next.append(nx); ul.append(next);
  const nav = el('nav'); nav.setAttribute('aria-label', 'Pagination'); nav.append(ul); host.append(nav);
}

function renderFacets(ctx, data, state, go) {
  const { facetHost, selected } = ctx.els;
  const byName = new Map((data.facets || []).map((f) => [f.name.trim().toLowerCase(), f]));
  const groups = (ctx.facetNames.length ? ctx.facetNames : (data.facets || []).filter((f) => !f.category).map((f) => f.name))
    .map((name) => ({ name, facet: byName.get(name.trim().toLowerCase()) })).filter((g) => g.facet?.values?.length);
  const isOn = (code, v) => state.filters.some(([c, x]) => c === code && x === v);
  const toggle = (code, v) => ({ ...state, page: 1, filters: isOn(code, v) ? state.filters.filter(([c, x]) => !(c === code && x === v)) : [...state.filters, [code, v]] });
  facetHost.replaceChildren();
  groups.forEach(({ name, facet }, i) => {
    const wrap = el('div', `clp-filter${i === groups.length - 1 ? ' clp-filter--last' : ''}`); wrap.dataset.facet = facet.code;
    const open = ctx.open.has(facet.code);
    const head = el('button', 'clp-filter-head', `<h3><span>${name}</span></h3>`); head.type = 'button'; head.setAttribute('aria-expanded', open ? 'true' : 'false');
    const ul = el('ul', 'clp-filter-options'); ul.hidden = !open; ul.id = `plp-facet-${facet.code.replace(/[^\w-]/g, '')}`; head.setAttribute('aria-controls', ul.id);
    facet.values.forEach((v, n) => {
      const on = isOn(facet.code, v.code);
      const li = el('li'); if (n >= OPTIONS_LIMIT) li.classList.add('is-extra');
      const a = el('a', `clp-option${on ? ' is-active' : ''}`); a.href = stateHref(toggle(facet.code, v.code));
      a.setAttribute('role', 'checkbox'); a.setAttribute('aria-checked', on ? 'true' : 'false');
      a.append(el('span', 'clp-check'), el('span', 'clp-option-label', `${valueLabel(v.name)} (${v.count})`));
      a.addEventListener('click', (e) => { e.preventDefault(); go(toggle(facet.code, v.code)); });
      li.append(a); ul.append(li);
    });
    wrap.append(head, ul);
    if (facet.values.length > OPTIONS_LIMIT) {
      const more = el('button', 'clp-more', '+ More'); more.type = 'button';
      more.addEventListener('click', () => { const all = ul.classList.toggle('show-all'); more.textContent = all ? '- Less' : '+ More'; });
      more.hidden = !open; wrap.append(more);
    }
    head.addEventListener('click', () => {
      const now = head.getAttribute('aria-expanded') !== 'true'; head.setAttribute('aria-expanded', now ? 'true' : 'false'); ul.hidden = !now;
      const more = wrap.querySelector('.clp-more'); if (more) more.hidden = !now;
      if (now) ctx.open.add(facet.code); else ctx.open.delete(facet.code);
    });
    facetHost.append(wrap);
  });
  // active filters: one chip per value (label from the facet value), then "Clear All"
  selected.replaceChildren();
  selected.hidden = !state.filters.length;
  if (!state.filters.length) return;
  const labelFor = (code, v) => { const f = (data.facets || []).find((x) => x.code === code); const hit = f?.values?.find((x) => x.code === v); return valueLabel(hit?.name || v); };
  const chips = el('div', 'clp-chips');
  state.filters.forEach(([code, v]) => {
    const chip = el('button', 'clp-selected-chip', `<span>${labelFor(code, v)}</span><span class="chip-x">${ICON_X}</span>`); chip.type = 'button'; chip.setAttribute('aria-label', `Remove filter ${labelFor(code, v)}`);
    chip.addEventListener('click', () => go({ ...state, page: 1, filters: state.filters.filter(([c, x]) => !(c === code && x === v)) }));
    chips.append(chip);
  });
  const clear = el('button', 'clp-clear', 'Clear All'); clear.type = 'button'; clear.setAttribute('aria-label', 'Reset all filters');
  clear.addEventListener('click', () => go({ ...state, page: 1, filters: [] }));
  selected.append(el('div', 'clp-selected-title', 'Filter by'), chips, clear);
}

function wireLive(block, ctx) {
  const { grid, count, select, pagination, results } = ctx.els;
  ctx.open = new Set();
  const byPdp = new Map(ctx.authored.map((t) => [pdpKey(t.href), t]));
  // the source's sort select, enabled (authored `sort` label picks the default option text)
  select.replaceChildren(...SORTS.map(([code, label]) => { const o = el('option'); o.value = code; o.textContent = code === 'relevance' ? ctx.defaultSortLabel : label; return o; }));
  let seq = 0;
  const load = async (state, { push = false, scroll = false } = {}) => {
    seq += 1; const mine = seq;
    block.classList.add('is-loading'); block.setAttribute('aria-busy', 'true');
    select.value = state.sort;
    try {
      const res = await fetch(apiUrl(ctx, state));
      if (!res.ok) throw new Error(`search ${res.status}`);
      const data = await res.json();
      if (mine !== seq) return;
      const total = data.pagination?.totalResults ?? 0;
      const pages = data.pagination?.totalPages ?? 1;
      if (state.page > pages && pages >= 1) { load({ ...state, page: pages }, { push }); return; }
      grid.replaceChildren(...(data.products || []).map((p) => renderTile(tileFromProduct(p, ctx, byPdp))));
      if (!data.products?.length) grid.append(el('p', 'clp-empty', 'No products match the selected filters.'));
      count.innerHTML = `${total} <span class="qty-label">Items</span>`;
      renderFacets(ctx, data, state, (s) => load(s, { push: true, scroll: true }));
      renderPagination(pagination, state, pages, (s) => load(s, { push: true, scroll: true }));
      block.classList.remove('is-snapshot'); block.dataset.source = 'live'; block.dataset.total = total;
      if (push && stateHref(state) !== `${window.location.pathname}${window.location.search}`) window.history.pushState({ plp: true }, '', stateHref(state));
      if (scroll && results.getBoundingClientRect().top < 0) results.scrollIntoView({ block: 'start' });
    } catch {
      if (mine === seq) block.dataset.source = 'snapshot'; // authored tiles stay; facets stay inert
    } finally {
      if (mine === seq) { block.classList.remove('is-loading'); block.removeAttribute('aria-busy'); }
    }
  };
  select.disabled = false;
  select.addEventListener('change', () => load({ ...readState(), sort: select.value, page: 1 }, { push: true }));
  window.addEventListener('popstate', () => load(readState()));
  load(readState());
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
  // live: the active filters sit at the top of the rail — "Filter by", one chip per value, "Clear All"
  const selected = el('div', 'clp-selected'); selected.hidden = true;
  filters.append(el('div', 'clp-filter-title', 'Filter by'));
  const facetHost = el('div', 'clp-facets');
  filters.append(facetHost);
  sticky.append(selected, nav, filters); rail.append(sticky);

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

  /* static first: facet group names as captured, no values — replaced by the live facets once the API answers */
  facetNames.forEach((name, i) => {
    const wrap = el('div', `clp-filter${i === facetNames.length - 1 ? ' clp-filter--last' : ''}`);
    const head = el('button', 'clp-filter-head', `<h3><span>${name}</span></h3>`); head.type = 'button'; head.setAttribute('aria-expanded', 'false'); head.disabled = true;
    wrap.append(head); facetHost.append(wrap);
  });
  block.classList.add('is-snapshot');
  block.dataset.source = 'snapshot';

  const search = siteConfig().productSearch;
  if (!search?.enabled || (!cfg.categories && !cfg.condition)) return;
  wireLive(block, {
    search,
    categories: list(cfg.categories?.textContent),
    condition: cfg.condition?.textContent.trim().toLowerCase() || 'default',
    pageSize: parseInt(cfg['page-size']?.textContent, 10) || 15,
    facetNames, defaultSortLabel, authored: fallback,
    els: { grid, count, select, facetHost, selected, pagination, results },
  });
}
