/**
 * calculator — client-only compute tools (dynamics row 23, pattern client-compute): RAID capacity and surveillance
 * (CCTV/NVR) storage. No network: controls come from a definition recorded from the live tool
 * (`/data/calculators/<id>.json`: names, values, defaults, ranges, options, validation copy, results labels),
 * the arithmetic is ported verbatim from the live inline script, the prose is authored here.
 * Behaviour as live: results change only on submit ("Calculate storage" / Enter); any control change shows "---";
 * invalid ranges are refused with the live messages (set explicitly, so every browser shows the same words).
 *
 * Authoring (rows, key | value):
 *   Source          /data/calculators/raid.json
 *   Hero            <h1>…</h1><p>…</p>                      (centered above the tool)
 *   Intro           <h2>Build your estimate</h2><p>…</p><p><a>…</a></p>
 *   Benefits        <p><strong>Benefits of using the Calculator</strong></p><ul><li>…</li></ul>
 *   Note <key>      <p>*Note that …</p>                     (shown while a selection maps to <key>, e.g. `Note nested`)
 *   Tip <field>     <p>…</p> | <ul>…</ul>                   (info tooltip next to the field label)
 *   How it works    <h2>…</h2><p>…</p>
 *   Results note    Complete the fields and calculate to see your estimate.
 *   Recommendation  <p><strong>Recommended drive family</strong></p><p>…</p><p><a>CTA</a></p>…
 * Variant `gradient`: the surveillance results ground (purple gradient instead of solid #130C2B).
 */
import { toClassName } from '../../scripts/aem.js';

const EMPTY = '---';
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const ICON_INFO = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" aria-hidden="true"><circle cx="8.5" cy="8.5" r="7.75" fill="none" stroke="#000" stroke-width="1.2"/><path d="M8.5 7.4v5" stroke="#000" stroke-width="1.4"/><circle cx="8.5" cy="4.9" r=".9"/></svg>';

/* ---- the live arithmetic, verbatim ---- */
const USABLE = {
  raid0: (d, c) => d * c,
  raid1: (d, c) => c, // live: one drive usable whatever the count
  raid5: (d, c) => d * c - c,
  raid6: (d, c) => d * c - 2 * c,
  raid10: (d, c) => (d * c) / 2,
  raid50: (d, c) => d * c - 2 * c, // two RAID 5 subsets
  raid60: (d, c) => d * c - 4 * c, // two RAID 6 subsets
  jbod: (d, c) => d * c,
  spanning: (d, c) => d * c,
};
const LOGIC = {
  raid(v, def, form) {
    const type = v['raid-type']; const d = Number(v.quantity); const c = Number(v.capacity);
    const label = form.elements['raid-type'].selectedOptions[0]?.textContent || type;
    const total = d * c; const avail = (USABLE[type] || USABLE.raid0)(d, c);
    return { total: `${total} TB`, available: `${avail} TB`, redundancy: `${total - avail} TB`, detail: `${d} x ${c}TB in ${label} = ${avail}TB Usable (${avail},000GB)` };
  },
  surveillance(v, def) {
    const resolution = Number(v.resolution);
    const colorDepth = resolution > 8294399 ? 30 : 16; // 8MP (4K) and above
    const byCodec = def.ratios[v.codec];
    let ratio = 1; // live: no codec selected (the default) → ratio 1
    if (byCodec) ratio = typeof byCodec[v.quality] === 'number' ? byCodec[v.quality] : (byCodec[v.quality]?.[v.activity] || 1);
    const bandwidth = (resolution * colorDepth * Number(v.fps) * Number(v.number_of_cameras)) / ratio; // bits per second
    const bytes = (bandwidth / 8) * 86400 * Number(v.days_to_store) * (Number(v.hours_per_day) / 24);
    return { tb: (bytes / 1e12).toFixed(3) };
  },
};

/* RAID drive-count rules follow the selected level (live validateQuantity) */
function applyRules(form, def) {
  const q = form.elements.quantity; const type = form.elements['raid-type']?.value;
  if (!q || !def.rules) return;
  q.min = def.rules.minDrives[type] ?? 2;
  q.step = def.rules.even.includes(type) ? 2 : 1;
}

function rangeMessage(c, f, def) {
  c.setCustomValidity('');
  if (c.value === '') return ''; // live: number fields are not required (empty counts as 0)
  const n = Number(c.value); const min = Number(c.min); const max = Number(c.max);
  let msg = '';
  if (n < min || n > max || !Number.isInteger(n)) msg = f.message || (n < min ? def.messages.min.replace('{min}', min) : def.messages.max.replace('{max}', max));
  else if (def.rules?.even.includes(c.form.elements['raid-type']?.value) && n % 2) msg = def.messages.even;
  c.setCustomValidity(msg);
  return msg;
}

function labelFor(f, id, tips) {
  const head = el('div', 'calc-label');
  const lab = el(f.type === 'radio' ? 'p' : 'label', '', f.label); if (f.type !== 'radio') lab.htmlFor = id; else lab.id = `${id}-label`;
  head.append(lab);
  const tip = tips[toClassName(f.tip || '')];
  if (tip) {
    const btn = el('button', 'calc-tip-trigger', ICON_INFO); btn.type = 'button'; btn.setAttribute('aria-label', `Open ${f.label} tooltip`); btn.setAttribute('aria-expanded', 'false');
    const box = el('div', 'calc-tip', tip.innerHTML); box.id = `${id}-tip`; box.setAttribute('role', 'tooltip'); box.hidden = true; btn.setAttribute('aria-controls', box.id);
    const set = (open) => { box.hidden = !open; btn.setAttribute('aria-expanded', open ? 'true' : 'false'); };
    btn.addEventListener('click', () => set(box.hidden));
    btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    btn.addEventListener('focusout', (e) => { if (!box.contains(e.relatedTarget)) set(false); });
    head.append(btn, box);
  }
  return head;
}

function control(f, id) {
  if (f.type === 'radio') {
    const group = el('div', 'calc-pills'); group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-labelledby', `${id}-label`);
    f.options.forEach(([value, text]) => {
      const pill = el('label', 'calc-pill'); const r = el('input'); r.type = 'radio'; r.name = f.name; r.value = value; r.defaultChecked = value === f.default; r.setAttribute('aria-label', `${f.label}: ${text}`);
      pill.append(r, el('span', '', text)); group.append(pill);
    });
    return group;
  }
  let c;
  if (f.type === 'select') { c = el('select'); f.options.forEach(([value, text]) => { const o = el('option'); o.value = value; o.textContent = text; o.defaultSelected = value === String(f.default); c.append(o); }); } else {
    c = el('input'); c.type = 'number'; c.inputMode = 'numeric'; c.min = f.min; c.max = f.max; c.step = f.step || 1; c.defaultValue = f.default;
    c.addEventListener('keydown', (e) => { if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) e.preventDefault(); });
  }
  c.id = id; c.name = f.name;
  return c;
}

function buildTool(def, rows) {
  const uid = `calc-${def.id}`;
  const tool = el('div', 'calc-tool');
  const card = el('div', 'calc-card');
  if (rows.intro) card.append(el('div', 'calc-intro', rows.intro.innerHTML));
  if (rows.benefits) card.append(el('div', 'calc-benefits', rows.benefits.innerHTML));
  const form = el('form', 'calc-form'); form.noValidate = false; form.id = `${uid}-form`;
  form.append(el('p', 'calc-setup-title', def.setupTitle));
  let row = null; let group = null;
  def.fields.forEach((f) => {
    if (f.section) { form.append(el('p', 'calc-section-title', f.section)); row = null; group = null; }
    const id = `${uid}-${toClassName(f.name)}`;
    const wrap = el('div', `calc-field calc-field--${f.type}`);
    wrap.append(labelFor(f, id, rows.tips), control(f, id));
    if (f.group && f.group === group) { row.append(wrap); return; }
    row = el('div', `calc-row${f.noWrap ? ' no-wrap' : ''}`); group = f.group || null; row.append(wrap); form.append(row);
  });
  const notes = el('div', 'calc-notes');
  Object.entries(rows.notes).forEach(([key, cell]) => { const n = el('div', 'calc-note', cell.innerHTML); n.dataset.note = key; n.hidden = true; notes.append(n); });
  const actions = el('div', 'calc-actions');
  const submit = el('button', 'calc-submit', def.submit); submit.type = 'submit';
  const reset = el('button', 'calc-reset', def.reset); reset.type = 'reset';
  actions.append(submit, reset); form.append(actions);
  card.append(form, notes);
  if (rows.how) card.append(el('div', 'calc-how', rows.how.innerHTML));

  /* results */
  const side = el('div', 'calc-side');
  const panel = el('div', 'calc-results'); panel.setAttribute('aria-live', 'polite');
  panel.append(el('p', 'calc-eyebrow', def.results.eyebrow));
  const out = {};
  def.results.items.forEach((it) => {
    const item = el('div', `calc-result${it.size === 'l' ? ' is-large' : ''}${it.detail ? ' is-detail' : ''}${it.rule ? ' has-rule' : ''}`);
    if (it.label) item.append(el('p', 'calc-result-label', it.label));
    const v = el('output', 'calc-result-value'); v.setAttribute('for', form.id); v.dataset.key = it.key; v.textContent = def.initial?.[it.key] ?? EMPTY;
    out[it.key] = v;
    const line = el('p', 'calc-result-line'); line.append(v); if (it.unit) line.append(el('span', 'calc-unit', it.unit));
    item.append(line); panel.append(item);
  });
  if (rows.resultsNote) panel.append(el('p', 'calc-results-note', rows.resultsNote.innerHTML));
  side.append(panel);
  if (rows.recommendation) {
    // the grey "Recommended drive family" box = the title paragraph + the paragraph after it; CTAs follow outside it
    const reco = el('div', 'calc-reco', rows.recommendation.innerHTML);
    const [title, text] = reco.children;
    if (title && text && !text.classList.contains('button-wrapper')) { const box = el('div', 'calc-box'); title.before(box); box.append(title, text); }
    side.append(reco);
  }
  tool.append(card, side);

  /* behaviour */
  const showNote = () => { const sel = def.fields.find((f) => f.notes); const key = sel ? sel.notes[form.elements[sel.name].value] : null; notes.querySelectorAll('.calc-note').forEach((n) => { n.hidden = n.dataset.note !== key; }); };
  const clear = () => Object.entries(out).forEach(([k, v]) => { v.textContent = def.results.items.find((i) => i.key === k)?.detail ? '' : EMPTY; });
  const numbers = () => def.fields.filter((f) => f.type === 'number').map((f) => [form.elements[f.name], f]);
  form.addEventListener('change', (e) => {
    clear(); applyRules(form, def); showNote();
    const f = def.fields.find((x) => x.name === e.target.name);
    if (f?.type === 'number') { if (rangeMessage(e.target, f, def)) e.target.reportValidity(); } else numbers().forEach(([c, nf]) => rangeMessage(c, nf, def));
  });
  form.addEventListener('input', (e) => { if (e.target.type === 'number') e.target.setCustomValidity(''); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = numbers().find(([c, f]) => rangeMessage(c, f, def));
    if (bad) { bad[0].reportValidity(); return; }
    const values = Object.fromEntries(def.fields.map((f) => [f.name, f.type === 'radio' ? form.querySelector(`[name="${f.name}"]:checked`)?.value || '' : form.elements[f.name].value]));
    const res = LOGIC[def.logic](values, def, form);
    Object.entries(res).forEach(([k, v]) => { if (out[k]) { out[k].textContent = v; out[k].dataset.value = v; } });
    tool.dataset.calculated = String(Number(tool.dataset.calculated || 0) + 1);
  });
  form.addEventListener('reset', () => setTimeout(() => { clear(); applyRules(form, def); showNote(); numbers().forEach(([c]) => c.setCustomValidity('')); }));
  applyRules(form, def); showNote();
  // shareable / replayable state: field values in the URL prefill the form and calculate once (parity check hook);
  // without parameters the tool opens exactly as live (defaults + the authored initial result)
  const sp = new URLSearchParams(window.location.search);
  if (def.fields.some((f) => sp.has(f.name))) {
    def.fields.forEach((f) => {
      if (!sp.has(f.name)) return;
      if (f.type === 'radio') form.querySelectorAll(`[name="${f.name}"]`).forEach((r) => { r.checked = r.value === sp.get(f.name); });
      else form.elements[f.name].value = sp.get(f.name);
    });
    clear(); applyRules(form, def); showNote();
    requestAnimationFrame(() => form.requestSubmit(submit));
  }
  return tool;
}

export default async function decorate(block) {
  const rows = { notes: {}, tips: {} };
  let source = '';
  [...block.children].forEach((r) => {
    const [k, v] = [...r.children]; if (!v) return;
    const key = k.textContent.trim().toLowerCase();
    if (key === 'source') source = (v.querySelector('a')?.getAttribute('href') || v.textContent).trim();
    else if (key.startsWith('note ')) rows.notes[toClassName(key.slice(5))] = v;
    else if (key.startsWith('tip ')) rows.tips[toClassName(key.slice(4))] = v;
    else rows[{ hero: 'hero', intro: 'intro', benefits: 'benefits', 'how it works': 'how', 'results note': 'resultsNote', recommendation: 'recommendation' }[key] || key] = v;
  });
  const hero = rows.hero ? el('div', 'calc-hero', rows.hero.innerHTML) : null;
  block.replaceChildren(...(hero ? [hero] : []));
  try {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`definition ${res.status}`);
    block.append(buildTool(await res.json(), rows));
  } catch {
    block.append(el('p', 'calc-error', 'The calculator could not be loaded. Please refresh the page.'));
  }
}
