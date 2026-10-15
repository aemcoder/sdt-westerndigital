/**
 * calculator — client-only capacity calculators (dynamics row 23): RAID capacity and CCTV/NVR surveillance storage.
 * The formulas are re-implemented from the source's own scripts (stardust/dynamics/client-logic/23-raid, 23-surveillance:
 * raid-capacity-calculator.js USABLE_CAPACITY / MIN_DRIVES / NESTED_RAID_TYPES, surveillance-capacity-calculator.js
 * getCompressionRatio + the submit handler) and verified with recorded input → output vectors on both origins.
 * No network. Control ids/names are the source's, so one vectors spec replays on both.
 *
 * Authoring (rows, first cell = row kind):
 *   type       raid | surveillance                                   (selects compute())
 *   intro      <h2>Build your estimate</h2><p>…</p><p><a>…</a></p>
 *   benefits   <p><strong>Benefits of using the Calculator</strong></p><ul><li>…</li></ul>        (optional)
 *   group      System Setup                                           (heading inside the form; starts a new field line)
 *   break                                                             (starts a new field line)
 *   number     name | Label | min-max | default [| tooltip]
 *   select     name | Label | <ul><li>Label = value</li>…</ul> | default value [| tooltip]
 *   choice     name | Label | <ul><li>Label = value</li>…</ul> | default value (may be empty) [| tooltip]   (pill radios)
 *   actions    Calculate storage | Reset
 *   note       raid10, raid50, raid60 | <p>*Note …</p>                (shown while one of those values is selected)
 *   explain    <h2>How does …</h2><p>…</p>
 *   results    Estimated capacity | Complete the fields and calculate to see your estimate.
 *   result     id | Label (empty = none) | initial value [| suffix]
 *   detail     id | initial text
 *   aside      rich content under the results (recommended family, CTAs)
 */
const PLACEHOLDER = '---';

/* ---- recovered logic (source: raid-capacity-calculator.js) ---- */
const NESTED_RAID_TYPES = new Set(['raid10', 'raid50', 'raid60']);
const USABLE_CAPACITY = {
  raid0: (d, c) => d * c,
  raid1: (d, c) => c,
  raid5: (d, c) => d * c - c,
  raid6: (d, c) => d * c - c * 2,
  raid10: (d, c) => (d * c) / 2,
  raid50: (d, c) => d * c - c * 2,
  raid60: (d, c) => d * c - c * 4,
  jbod: (d, c) => d * c,
  spanning: (d, c) => d * c,
};
const MIN_DRIVES = {
  raid0: 2, raid1: 2, raid5: 3, raid6: 4, raid10: 4, raid50: 6, raid60: 8, jbod: 2, spanning: 2,
};

export function computeRaid({ raidType, raidLabel, drives, capacity }) {
  const usable = USABLE_CAPACITY[raidType];
  if (!usable) return null;
  const total = drives * capacity;
  const available = usable(drives, capacity);
  return {
    resultsTotal: `${total} TB`,
    resultsAvailable: `${available} TB`,
    resultsRedundancy: `${total - available} TB`,
    resultsAvailableDetail: `${drives} x ${capacity}TB in ${raidLabel}  = ${available}TB Usable (${available},000GB)`,
  };
}

/* ---- recovered logic (source: surveillance-capacity-calculator.js) ---- */
const RATIOS = {
  mpeg: { high: 16, medium: 25, low: 31 },
  h264: { high: { high: 98, medium: 102, low: 105 }, medium: { high: 160, medium: 173, low: 181 }, low: { high: 220, medium: 242, low: 260 } },
  h265: { high: { high: 260, medium: 272, low: 282 }, medium: { high: 480, medium: 510, low: 536 }, low: { high: 620, medium: 670, low: 710 } },
  h265plus: { high: { high: 335, medium: 351, low: 364 }, medium: { high: 590, medium: 621, low: 643 }, low: { high: 776, medium: 834, low: 833 } },
};
function compressionRatio(codec, quality, activity) {
  const byCodec = RATIOS[codec];
  if (!byCodec) return 1; // source: no format chosen → ratio 1 (uncompressed estimate)
  const byQuality = byCodec[quality];
  if (typeof byQuality === 'number') return byQuality;
  return (byQuality && byQuality[activity]) || 1;
}
export function computeSurveillance(v) {
  const resolution = Number(v.resolution);
  const colorDepth = resolution > 8294399 ? 30 : 16;
  const bandwidth = (resolution * colorDepth * Number(v.fps) * Number(v.number_of_cameras)) / compressionRatio(v.codec, v.quality, v.activity);
  const totalBytes = (bandwidth / 8) * 86400 * Number(v.days_to_store) * (Number(v.hours_per_day) / 24);
  return { required_total_disk_space: (totalBytes / 1e12).toFixed(3) };
}

/* ---- DOM ---- */
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const text = (cell) => cell?.textContent.trim() || '';
const ICON_INFO = '<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" aria-hidden="true"><circle cx="8.5" cy="8.5" r="7.75" fill="none" stroke="#000" stroke-width="1.2"/><rect x="7.9" y="7" width="1.2" height="5.2" fill="#000"/><rect x="7.9" y="4.6" width="1.2" height="1.3" fill="#000"/></svg>';

function options(cell) {
  return [...(cell?.querySelectorAll('li') || [])].map((li) => {
    const [label, value] = li.textContent.split('=').map((s) => s.trim());
    return { label, value: value ?? label };
  });
}

function labelWithTip(name, label, tipCell, forId) {
  const head = el('div', 'calc-label');
  const lab = el(forId ? 'label' : 'p', 'calc-label-text'); lab.textContent = label; if (forId) lab.htmlFor = forId;
  head.append(lab);
  if (tipCell && tipCell.textContent.trim()) {
    const btn = el('button', 'calc-tip-btn', ICON_INFO); btn.type = 'button';
    btn.setAttribute('aria-label', `Open ${label.toLowerCase()} tooltip`); btn.setAttribute('aria-expanded', 'false');
    const tip = el('div', 'calc-tip'); tip.id = `tip-${name}`; tip.hidden = true; tip.setAttribute('role', 'tooltip');
    tip.append(...tipCell.childNodes); btn.setAttribute('aria-describedby', tip.id);
    const show = (on) => { tip.hidden = !on; btn.setAttribute('aria-expanded', on ? 'true' : 'false'); };
    btn.addEventListener('click', () => show(tip.hidden));
    btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') show(false); });
    btn.addEventListener('focusout', (e) => { if (!btn.contains(e.relatedTarget) && !tip.contains(e.relatedTarget)) show(false); });
    const wrap = el('div', 'calc-tip-wrap'); wrap.append(btn, tip); head.append(wrap);
  }
  return head;
}

function numberField(cells) {
  const [, nameC, labelC, rangeC, defC, tipC] = cells;
  const name = text(nameC); const [min, max] = text(rangeC).split(/\s*[-–]\s*/);
  const wrap = el('div', 'calc-field calc-field--number');
  const input = el('input'); input.type = 'number'; input.name = name; input.id = name; input.step = '1';
  if (min) input.min = min; if (max) input.max = max; input.value = text(defC); input.defaultValue = text(defC);
  input.addEventListener('keydown', (e) => { if (['.', ',', 'e', 'E', '-', '+'].includes(e.key)) e.preventDefault(); });
  wrap.append(labelWithTip(name, text(labelC), tipC, name), input);
  return wrap;
}

function selectField(cells) {
  const [, nameC, labelC, optC, defC, tipC] = cells;
  const name = text(nameC); const def = text(defC);
  const wrap = el('div', 'calc-field calc-field--select');
  const select = el('select'); select.name = name; select.id = name;
  options(optC).forEach((o) => { const op = el('option'); op.value = o.value; op.textContent = o.label; if (o.value === def) { op.selected = true; op.defaultSelected = true; } select.append(op); });
  wrap.append(labelWithTip(name, text(labelC), tipC, name), select);
  return wrap;
}

function choiceField(cells) {
  const [, nameC, labelC, optC, defC, tipC] = cells;
  const name = text(nameC); const def = text(defC);
  const wrap = el('fieldset', 'calc-field calc-field--choice');
  const legend = el('legend', 'calc-legend'); legend.append(labelWithTip(name, text(labelC), tipC)); wrap.append(legend);
  const group = el('div', 'calc-pills');
  options(optC).forEach((o) => {
    const id = `${name}_${o.value}`;
    const pill = el('div', 'calc-pill');
    const lab = el('label'); lab.htmlFor = id; lab.textContent = o.label;
    const input = el('input'); input.type = 'radio'; input.name = name; input.value = o.value; input.id = id;
    if (o.value === def) { input.checked = true; input.defaultChecked = true; }
    pill.append(lab, input); group.append(pill);
  });
  wrap.append(group);
  return wrap;
}

export default function decorate(block) {
  const rows = [...block.children].map((r) => [...r.children]);
  const kind = (r) => text(r[0]).toLowerCase();
  const type = text(rows.find((r) => kind(r) === 'type')?.[1]).toLowerCase() || 'raid';
  block.classList.add(`calculator--${type}`);

  const main = el('div', 'calc-main');
  const side = el('div', 'calc-side');
  const form = el('form'); form.id = 'capacity-form'; form.noValidate = false;
  const notes = el('div', 'calc-notes');
  const panel = el('div', 'calc-results'); panel.id = 'results';
  const outputs = {}; const initial = {};
  let fieldRow = null;

  rows.forEach((r) => {
    const k = kind(r);
    if (k === 'intro') { const d = el('div', 'calc-intro'); d.append(...r[1].childNodes); main.append(d); } else if (k === 'benefits') { const d = el('div', 'calc-benefits'); d.append(...r[1].childNodes); main.append(d); } else if (k === 'group') {
      const h = el('h3', 'calc-group'); h.textContent = text(r[1]); form.append(h); fieldRow = null;
    } else if (k === 'break') {
      fieldRow = null;
    } else if (['number', 'select', 'choice'].includes(k)) {
      if (!fieldRow) { fieldRow = el('div', 'calc-row'); form.append(fieldRow); }
      fieldRow.append(k === 'number' ? numberField(r) : k === 'select' ? selectField(r) : choiceField(r));
    } else if (k === 'actions') {
      const bar = el('div', 'calc-actions');
      const go = el('button', 'calc-submit'); go.type = 'submit'; go.textContent = text(r[1]) || 'Calculate';
      const reset = el('button', 'calc-reset'); reset.type = 'reset'; reset.textContent = text(r[2]) || 'Reset';
      bar.append(go, reset); form.append(bar);
    } else if (k === 'note') {
      const p = el('div', 'calc-note'); p.dataset.values = text(r[1]); p.hidden = true; p.append(...r[2].childNodes); notes.append(p);
    } else if (k === 'explain') { const d = el('div', 'calc-explain'); d.append(...r[1].childNodes); main.append(d); } else if (k === 'results') {
      panel.append(el('p', 'calc-results-head', '')); panel.lastChild.textContent = text(r[1]);
      if (r[2]) { const n = el('p', 'calc-results-note'); n.textContent = text(r[2]); panel.dataset.note = 'yes'; panel.append(n); }
    } else if (k === 'result') {
      const id = text(r[1]); const label = text(r[2]);
      const item = el('div', 'calc-result');
      if (label) { const l = el('label', 'calc-result-label'); l.htmlFor = id; l.textContent = label; item.append(l); }
      const line = el('p', 'calc-result-line');
      const out = el('input'); out.type = 'text'; out.id = id; out.name = id; out.readOnly = true; out.value = text(r[3]); out.tabIndex = -1;
      line.append(out);
      if (text(r[4])) line.append(el('span', 'calc-result-suffix', text(r[4])));
      item.append(line);
      const note = panel.querySelector('.calc-results-note'); if (note) panel.insertBefore(item, note); else panel.append(item);
      outputs[id] = out; initial[id] = out.value;
    } else if (k === 'detail') {
      const id = text(r[1]); const d = el('p', 'calc-result-detail'); d.id = id; d.textContent = text(r[2]);
      const items = panel.querySelectorAll('.calc-result'); if (items.length) items[items.length - 1].append(d); else panel.append(d);
      outputs[id] = d;
    } else if (k === 'aside') {
      const d = el('div', 'calc-aside'); d.append(...r[1].childNodes);
      // "Recommended drive family": the h3 and its paragraph sit in a grey bordered box on the live page
      d.querySelectorAll('h3').forEach((h) => { const box = el('div', 'calc-box'); const next = h.nextElementSibling; h.before(box); box.append(h); if (next && next.tagName === 'P') box.append(next); });
      side.append(d);
    }
  });

  // form sits between intro/benefits and the explanation
  const explain = main.querySelector('.calc-explain');
  if (explain) main.insertBefore(form, explain); else main.append(form);
  form.after(notes);
  side.prepend(panel);
  const layout = el('div', 'calc-layout'); layout.append(main, side);
  block.replaceChildren(layout);

  const setOut = (vals) => Object.entries(vals).forEach(([id, v]) => { const o = outputs[id]; if (!o) return; if (o.tagName === 'INPUT') o.value = v; else o.textContent = v; });
  const clear = () => setOut(Object.fromEntries(Object.keys(outputs).map((id) => [id, outputs[id].tagName === 'INPUT' ? PLACEHOLDER : ''])));

  /* RAID: min drives / even-quantity rule, nested & JBOD disclosures (source validateQuantity / updateDisclosures) */
  const raidSel = form.querySelector('#raid-type'); const qty = form.querySelector('#quantity');
  const validateQuantity = (showError) => {
    if (!raidSel || !qty) return true;
    const t = raidSel.value; qty.min = MIN_DRIVES[t] ?? 2;
    if (NESTED_RAID_TYPES.has(t)) {
      qty.step = 2;
      if (showError && Number(qty.value) % 2 !== 0) { qty.setCustomValidity('Drive count must be an even number for this RAID type.'); qty.reportValidity(); return false; }
    } else qty.step = 1;
    qty.setCustomValidity(''); return true;
  };
  const updateNotes = (value) => notes.querySelectorAll('.calc-note').forEach((n) => { n.hidden = !n.dataset.values.split(',').map((s) => s.trim()).includes(value); });
  validateQuantity(false);

  /* surveillance: the live range messages (oninvalid → "Input number between min and max") */
  form.querySelectorAll('input[type=number]').forEach((inp) => {
    if (type !== 'surveillance') return;
    inp.addEventListener('invalid', () => { if (inp.validity.rangeUnderflow || inp.validity.rangeOverflow || inp.validity.badInput || inp.validity.stepMismatch) inp.setCustomValidity(`Input number between ${inp.min} and ${inp.max}`); });
    inp.addEventListener('input', () => inp.setCustomValidity(''));
  });

  form.addEventListener('change', (e) => {
    clear();
    if (raidSel) { updateNotes(raidSel.value); validateQuantity(e.target === qty); }
  });
  form.addEventListener('reset', () => {
    clear(); updateNotes('');
    setTimeout(() => validateQuantity(false));
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let res = null;
    if (type === 'raid') {
      if (!validateQuantity(true)) return;
      res = computeRaid({ raidType: raidSel.value, raidLabel: raidSel.options[raidSel.selectedIndex].text, drives: Number(qty.value), capacity: Number(form.querySelector('#capacity').value) });
    } else {
      res = computeSurveillance(Object.fromEntries(new FormData(form).entries()));
    }
    if (!res) return;
    setOut(res);
    const first = Object.values(outputs).find((o) => o.tagName === 'INPUT'); if (first) first.focus();
  });
  block.dataset.initial = JSON.stringify(initial);
}
