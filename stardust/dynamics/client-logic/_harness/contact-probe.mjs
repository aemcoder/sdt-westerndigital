// probe contact-us topics: visible fields + empty-submit errors. ALL non-GET requests are aborted (never submits to production).
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
const url = process.argv[2]; const out = process.argv[3];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' });
const blocked = [];
await ctx.route('**/*', (route) => { const r = route.request(); if (r.method() !== 'GET') { blocked.push(`${r.method()} ${r.url()}`); return route.abort(); } return route.continue(); });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {}); await p.waitForTimeout(3000);
const read = () => p.evaluate(() => {
  const vis = (e) => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length) && getComputedStyle(e).visibility !== 'hidden';
  const forms = [...document.querySelectorAll('form')].filter((f) => vis(f) && !f.closest('header, footer, nav') && f.name !== 'searchForm');
  return forms.map((f) => ({
    name: f.getAttribute('name') || f.id, action: f.getAttribute('action'), onsubmit: f.getAttribute('onsubmit'),
    heading: (f.closest('section, .webform, [class*=form]')?.querySelector('h2, h3, p.heading4, .heading4')?.textContent || '').trim(),
    fields: [...f.querySelectorAll('input, select, textarea')].filter((c) => c.type !== 'hidden' && vis(c) || (c.type === 'checkbox' && vis(c.parentElement))).map((c) => ({
      tag: c.tagName.toLowerCase(), type: c.type, name: c.name, id: c.id, placeholder: c.placeholder, required: c.required || c.getAttribute('aria-required') === 'true', maxlength: c.maxLength > 0 ? c.maxLength : undefined, pattern: c.pattern || undefined,
      label: (c.labels?.[0]?.textContent || c.closest('label')?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 400),
      options: c.tagName === 'SELECT' ? [...c.options].map((o) => o.textContent.trim()) : undefined,
    })),
    hidden: Object.fromEntries([...f.querySelectorAll('input[type=hidden]')].map((h) => [h.name, h.value.slice(0, 200)])),
    submit: [...f.querySelectorAll('button, input[type=submit]')].filter(vis).map((x) => (x.textContent || x.value).trim()),
    texts: [...f.querySelectorAll('p, span, a')].filter((e) => vis(e) && e.children.length === 0 && e.textContent.trim().length > 25).map((e) => e.textContent.replace(/\s+/g, ' ').trim()).slice(0, 8),
  }));
});
const errs = () => p.evaluate(() => [...document.querySelectorAll('.error, .errorMsg, .error-message, [class*=error], .invalid-feedback, [role=alert]')].filter((e) => (e.offsetWidth || e.offsetHeight) && e.textContent.trim()).map((e) => e.textContent.replace(/\s+/g, ' ').trim()).filter((t, i, a) => a.indexOf(t) === i).slice(0, 30));
const result = { url, initial: await read(), topics: [] };
const sel = p.locator('#editorial-list-dropdown');
if (await sel.count()) {
  const opts = await sel.evaluate((s) => [...s.options].map((o) => ({ value: o.value, label: o.textContent.trim() })));
  for (const o of opts.slice(1)) {
    await p.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {}); await p.waitForSelector('#editorial-list-dropdown'); await p.waitForTimeout(2000);
    const before = p.url();
    await sel.selectOption(o.value).catch(() => {}); await p.waitForTimeout(1500);
    const t = { topic: o.label, value: o.value, navigatedTo: p.url() !== before ? p.url() : null, forms: await read(), info: await p.evaluate(() => [...document.querySelectorAll('#editorial-list-dropdown ~ *, .contact-us-topic, [class*=topic]')].filter((e) => e.offsetHeight).map((e) => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 300)).slice(0, 4)) };
    const f = t.forms[0];
    if (f) { await p.locator(`form[name="${f.name}"] button[type=submit], form[name="${f.name}"] input[type=submit], form#${f.name} button[type=submit]`).first().click({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(1000); t.emptySubmitErrors = await errs(); }
    result.topics.push(t); console.error(o.label, '→', t.navigatedTo || `${t.forms.length} forms, ${f?.fields.length || 0} fields, ${t.emptySubmitErrors?.length || 0} errors`);
  }
} else {
  const f = result.initial[0];
  if (f) { await p.locator(`form[name="${f.name}"] button[type=submit], form#${f.name} button[type=submit]`).first().click({ timeout: 5000 }).catch(() => {}); await p.waitForTimeout(1000); result.emptySubmitErrors = await errs(); }
}
result.blockedNonGet = blocked;
writeFileSync(out, JSON.stringify(result, null, 1)); console.error('blocked non-GET', blocked.length);
await b.close();
