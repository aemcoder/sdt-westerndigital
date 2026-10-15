// usage: node plp-vectors.mjs spec.json <source|target> out.json
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [specFile, label, out] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specFile, 'utf8'));
const ORIGIN = label === 'source' ? 'https://www.westerndigital.com' : 'https://spike-c--sdt-westerndigital--aemcoder.aem.page/spike-c';
const S = label === 'source'
  ? { ready: '#cardList .productListItem h2', count: '#productQuantity', tile: '#cardList .productListItem', name: 'h2', cap: '.capacity-col strong', price: 'p.text-xs', facets: '.clp-filters-item .filterHeader span', pager: '.clp-pagination-wrap ul', sort: 'select.sortDropDown' }
  : { ready: '.product-listing.is-live', count: '.clp-count', tile: '.clp-grid .tile-cell', name: '.tile-name', cap: '.tile-cap strong', price: '.tile-price', facets: '.clp-filter-head span', pager: '.clp-pagination ul', sort: '.clp-sort-select' };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' });
const rows = [];
for (const [i, row] of spec.rows.entries()) {
  const p = await ctx.newPage(); const r = { i, input: row, output: {} };
  try {
    await p.goto(`${ORIGIN}${row.path}${row.qs || ''}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForSelector(S.ready, { timeout: 45000 }); await p.waitForTimeout(2500);
    if (row.sort) { await p.selectOption(S.sort, row.sort); await p.waitForTimeout(4000); }
    const o = await p.evaluate((s) => {
      const vis = (e) => e && e.offsetParent !== null;
      const tiles = [...document.querySelectorAll(s.tile)].filter(vis).map((t) => ({ name: t.querySelector(s.name)?.textContent.replace(/\s+/g, ' ').trim() || '', cap: t.querySelector(s.cap)?.textContent.replace(/\s+/g, ' ').trim() || '', price: t.querySelector(s.price)?.textContent.replace(/\s+/g, ' ').trim() || '' })).filter((t) => t.name && !/^Limited Time Offer$/.test(t.name));
      const pagerEl = document.querySelector(s.pager);
      return { count: (document.querySelector(s.count)?.textContent.match(/\d+/) || [''])[0], names: tiles.map((t) => t.name).join(' | '), facets: [...document.querySelectorAll(s.facets)].map((e) => e.textContent.replace(/\s+/g, ' ').trim()).join(' | '), pager: vis(pagerEl) ? pagerEl.innerText.replace(/\s+/g, ' ').trim() : '', caps: tiles.map((t) => t.cap).join(' | '), prices: tiles.map((t) => t.price).join(' | ') };
    }, S);
    r.output = o;
  } catch (e) { r.error = String(e.message || e).slice(0, 200); }
  rows.push(r); console.error(`[${label}] ${i + 1}/${spec.rows.length} ${row.path}${row.qs || ''}${row.sort ? ` sort=${row.sort}` : ''} → ${r.output.count} items ${r.error || ''}`);
  await p.close();
}
writeFileSync(out, JSON.stringify({ _provenance: { writtenBy: 'spike-c plp-vectors (client-logic vectors table format)', writtenAt: new Date().toISOString(), origin: ORIGIN, label }, rows }, null, 1));
await b.close();
