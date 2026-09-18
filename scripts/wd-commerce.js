/**
 * wd-commerce.js — read-only client for the storefront's public commerce search API.
 * Shared by product-listing / product-rail blocks (cross-block code lives in /scripts/ — AGENTS.md).
 *
 * Verified 2026-09-18 from the aem.page origin: `api.westerndigital.com/wdwebservices/v2/us/products/search`
 * and `/products/<code>` answer cross-origin (ACAO echoes the origin). `/store/cart/.../priceAndInventory` and
 * `/bin/wd/cache/commerce/*.json` do NOT — price, image and capacity are read from the search/product payloads.
 * The catalog itself (PDP, cart, compare, account) stays on the storefront; every product link is absolute.
 */
export const STORE = 'https://www.westerndigital.com';
const API = 'https://api.westerndigital.com/wdwebservices/v2/us';

// live sort labels (captured) → API sort codes
export const SORTS = [
  ['Most Popular', 'relevance'], ['Latest Products', 'launchDate'], ['Title A-Z', 'name-asc'],
  ['Title Z-A', 'name-desc'], ['Price Low-High', 'price-asc'], ['Price High-Low', 'price-desc'],
];

// the live PLP excludes recertified stock unless the page is the recertified/outlet listing
export const CONDITIONS = {
  default: '*:* AND -optionalCondition_en_string_mv:*recertified*',
  recertified: '*:* AND optionalCondition_en_string_mv:*recertified*',
  outlet: '*:* AND optionalCondition_en_string_mv:*outlet*',
};

/** `?filterByUseCaseName=Gaming&filterByVvc-capacity=21+TB+-+50+TB` → [[useCaseName, Gaming], [vvc-capacity, 21 TB - 50 TB]] */
export function filtersFromSearch(search = window.location.search) {
  const out = [];
  new URLSearchParams(search).forEach((v, k) => {
    if (!k.startsWith('filterBy') || !v) return;
    const code = k.slice('filterBy'.length);
    const facet = code.charAt(0).toLowerCase() + code.slice(1);
    // the storefront joins several values of one facet with commas (`filterByVvc-capacity=21+TB+-+50+TB,51+TB+-+100+TB`)
    v.split(',').map((x) => x.trim()).filter(Boolean).forEach((x) => out.push([facet, x]));
  });
  return out;
}

/** Build the `query` string the storefront sends: `:relevance:category:cat_x:facet:value…` */
export function buildQuery({ sort = 'relevance', categories = [], filters = [] }) {
  let q = `:${sort}`;
  categories.forEach((c) => { q += `:category:${c}`; });
  filters.forEach(([f, v]) => { q += `:${f}:${v}`; });
  return q;
}

export async function search({ sort = 'relevance', categories = [], filters = [], condition = 'default', page = 0, pageSize = 15, fields = 'FULL', signal } = {}) {
  const params = new URLSearchParams({ fields, pageSize: String(pageSize), sort, currentPage: String(page) });
  // encode the query the way the storefront does (spaces as `+`, colon-separated)
  params.set('query', categories.length || filters.length ? buildQuery({ sort, categories, filters }) : '');
  if (condition && CONDITIONS[condition]) params.set('customQuery', CONDITIONS[condition]);
  const url = `${API}/products/search?${params.toString().replace(/%20/g, '+')}`;
  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`search ${resp.status}`);
  return resp.json();
}

export async function product(code, { fields = 'FULL', signal } = {}) {
  const resp = await fetch(`${API}/products/${encodeURIComponent(code)}?fields=${fields}`, { signal });
  if (!resp.ok) throw new Error(`product ${code} ${resp.status}`);
  return resp.json();
}

/** "4TB-26TB" from the variant category list the storefront renders under each tile */
export function capacityRange(p) {
  try {
    const ref = typeof p.refCategories === 'string' ? JSON.parse(p.refCategories) : p.refCategories;
    const data = ref?.['vc-capacity']?.data || [];
    if (!data.length) return '';
    const title = (d) => d.attTitle || d.title;
    return data.length === 1 ? title(data[0]) : `${title(data[0])}-${title(data[data.length - 1])}`;
  } catch { return ''; }
}

/** thumbnail URL as served on the live tiles (`.wdthumb.319.319.webp` variant of the DAM asset) */
export function tileImage(p, size = 319) {
  const src = p.urlFileReference || p.mediaLinks?.multiMedia?.productImages?.[0] || '';
  if (!src) return '';
  const abs = src.startsWith('http') ? src : STORE + src;
  return /\.wdthumb\./.test(abs) ? abs : `${abs}.wdthumb.${size}.${size}.webp`;
}

/** absolute PDP link exactly as the live tile links it: /products/<family>/<code>?sku=<first sku> */
export function productLink(p) {
  const path = (p.pagePath || '').replace(/^\/content\/store\/en-us/, '') || `/products/${p.code}`;
  const sku = p.listOfSkuId?.[0];
  return `${STORE}${path}${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`;
}

export function startingPrice(p) {
  const v = p.priceData?.formattedValue || p.price?.formattedValue;
  return v ? `Starting at ${v}` : '';
}

/** normalise a tile from either the search payload or the per-product payload */
export function tileData(p) {
  return { code: p.code, name: p.name, href: productLink(p), img: tileImage(p), capacity: capacityRange(p), price: startingPrice(p), stock: p.stock?.stockLevelStatus };
}

/** authored rails: fetch specific products by code in one call (Solr filter on the storefront index) */
export async function byCodes(codes, { signal } = {}) {
  if (!codes.length) return [];
  const params = new URLSearchParams({ fields: 'FULL', pageSize: String(codes.length), query: ':relevance', customQuery: `code_string:(${codes.join(' OR ')})` });
  const resp = await fetch(`${API}/products/search?${params}`, { signal });
  if (!resp.ok) throw new Error(`byCodes ${resp.status}`);
  const { products = [] } = await resp.json();
  const order = new Map(codes.map((c, i) => [c, i]));
  return products.sort((a, b) => (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99));
}
