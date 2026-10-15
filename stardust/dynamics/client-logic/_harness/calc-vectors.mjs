// node calc-vectors.mjs spec.json <url> out.json label — client-logic vectors table format; outputs read as .value / innerText / validationMessage
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
const [specFile, url, out, label] = process.argv.slice(2);
const spec = JSON.parse(readFileSync(specFile, 'utf8'));
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' });
await ctx.route(/pure\.cloud|wd-chat|chatbot/, (r) => r.abort()); // the chat widget steals focus (wd-chat-frame) — environment adjustment, recorded
const p = await ctx.newPage(); const rows = [];
for (const [i, row] of spec.rows.entries()) {
  const r = { i, input: row, output: {} };
  try {
    await p.goto(url, { waitUntil: 'load', timeout: 90000 }).catch(() => {});
    await p.waitForSelector('#capacity-form button[type=submit]', { timeout: 30000 }); await p.waitForTimeout(label === 'source' ? 4000 : 800);
    await p.evaluate(() => document.querySelectorAll('[id*=relyance]').forEach((e) => e.remove()));
    for (const [k, v] of Object.entries(row)) {
      const sel = spec.inputs[k];
      if (spec.radio?.includes(k)) { await p.evaluate(([n, val]) => { const r = document.querySelector(`#capacity-form input[name="${n}"][value="${val}"]`); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, [k, String(v)]); continue; }
      const loc = p.locator(sel).first();
      if (await loc.evaluate((e) => e.tagName) === 'SELECT') await loc.selectOption(String(v));
      else { await loc.evaluate((e, val) => { e.value = val; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, String(v)); }
    }
    await p.evaluate(() => { const f = document.getElementById('capacity-form'); f.requestSubmit(f.querySelector('button[type=submit]')); }); await p.waitForTimeout(300);
    r.output = await p.evaluate((outs) => {
      const o = {};
      for (const [k, sel] of Object.entries(outs)) { const e = document.querySelector(sel); o[k] = e ? ('value' in e && e.tagName === 'INPUT' ? e.value : e.innerText).replace(/\s+/g, ' ').trim() : null; }
      const bad = document.querySelector('#capacity-form :invalid'); o.invalid = bad ? `${bad.name}: ${bad.validationMessage}` : '';
      return o;
    }, spec.outputs);
  } catch (e) { r.error = String(e.message || e).slice(0, 200); }
  rows.push(r); console.error(`[${label}] ${i + 1}/${spec.rows.length} ${JSON.stringify(row)} → ${JSON.stringify(r.output)}`);
}
writeFileSync(out, JSON.stringify({ _provenance: { writtenBy: 'stardust:dynamics client-logic vectors (value-reading variant)', writtenAt: new Date().toISOString(), url, label }, rows }, null, 1));
await b.close();
