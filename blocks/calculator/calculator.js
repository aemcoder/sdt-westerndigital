/**
 * calculator — client-compute capacity calculators (dynamics register row 23, client-compute).
 * Source: /tools/raid-capacity-calculator, /tools/surveillance-capacity-calculator
 * (`#capacity-form`, inline JS, no network).
 *
 * Contract: inputs-as-content. Labels, option lists, ranges, defaults, result labels, initial
 * result values, notes and help text are authored rows; only the formulas and constant tables
 * (RAID usable-capacity rules + minimum drives, surveillance compression ratios + colour depth)
 * live here. Without JS the rows read as a plain list of the tool's copy.
 *
 * Authoring (first cell = row kind, case-insensitive; extra/missing cells are tolerated):
 *   intro     | rich content (h2, p, links)              → top of the form card
 *   benefits  | rich content (title p + ul)              → grey box with a checkmark list
 *   group     | [heading]                                → new row of fields (sharing it equally)
 *   select    | name | label | ul "value: Label" (bold = default) | [help]
 *   number    | name | label | "min: 1" "max: 64" "step: 1" "default: 8"
 *                               ["message: …"] ["even message: …"] | [help]
 *   radio     | name | label | ul "value: Label" (bold = default) | [help]
 *   actions   | submit label | reset label
 *   note      | ["name: v1, v2"] | text                  → shown while control `name` is v1|v2
 *   explainer | rich content                             → closes the form card
 *   results   | panel heading
 *   result    | key | label | initial value | [suffix]
 *               keys: raid = total/available/detail/redundancy, surveillance = total
 *   status    | text                                     → closing line of the results panel
 *   recommend | rich content                             → grey box under the results
 *   panel     | rich content (text, buttons)             → rest of the box under the results
 * Variants: `raid`, `surveillance` (picks the logic; inferred from field names when absent).
 * Authored nodes are MOVED (EW1).
 */

const PLACEHOLDER = '---';
const INFO_SVG = '<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M8.125 0C6.51803 0 4.94714 0.476523 3.611 1.36931C2.27485 2.2621 1.23344 3.53105 0.618482 5.0157C0.00352044 6.50035 -0.157382 8.13401 0.156123 9.71011C0.469628 11.2862 1.24346 12.7339 2.37976 13.8702C3.51606 15.0065 4.9638 15.7804 6.5399 16.0939C8.11599 16.4074 9.74966 16.2465 11.2343 15.6315C12.719 15.0166 13.9879 13.9752 14.8807 12.639C15.7735 11.3029 16.25 9.73197 16.25 8.125C16.2477 5.97081 15.391 3.90551 13.8677 2.38227C12.3445 0.85903 10.2792 0.00227486 8.125 0ZM8.125 15C6.76526 15 5.43605 14.5968 4.30546 13.8414C3.17487 13.0859 2.29368 12.0122 1.77333 10.7559C1.25298 9.49971 1.11683 8.11737 1.3821 6.78375C1.64738 5.45013 2.30216 4.22513 3.26364 3.26364C4.22513 2.30216 5.45014 1.64737 6.78376 1.3821C8.11738 1.11683 9.49971 1.25298 10.756 1.77333C12.0122 2.29368 13.0859 3.17487 13.8414 4.30545C14.5968 5.43604 15 6.76525 15 8.125C14.9979 9.94773 14.2729 11.6952 12.9841 12.9841C11.6952 14.2729 9.94773 14.9979 8.125 15ZM9.375 11.875C9.375 12.0408 9.30916 12.1997 9.19195 12.3169C9.07474 12.4342 8.91576 12.5 8.75 12.5C8.41848 12.5 8.10054 12.3683 7.86612 12.1339C7.6317 11.8995 7.5 11.5815 7.5 11.25V8.125C7.33424 8.125 7.17527 8.05915 7.05806 7.94194C6.94085 7.82473 6.875 7.66576 6.875 7.5C6.875 7.33424 6.94085 7.17527 7.05806 7.05806C7.17527 6.94085 7.33424 6.875 7.5 6.875C7.83152 6.875 8.14947 7.0067 8.38389 7.24112C8.61831 7.47554 8.75 7.79348 8.75 8.125V11.25C8.91576 11.25 9.07474 11.3158 9.19195 11.4331C9.30916 11.5503 9.375 11.7092 9.375 11.875ZM6.875 4.6875C6.875 4.50208 6.92999 4.32082 7.033 4.16665C7.13601 4.01248 7.28243 3.89232 7.45374 3.82136C7.62504 3.75041 7.81354 3.73184 7.9954 3.76801C8.17726 3.80419 8.3443 3.89348 8.47542 4.02459C8.60653 4.1557 8.69582 4.32275 8.73199 4.5046C8.76816 4.68646 8.7496 4.87496 8.67864 5.04627C8.60768 5.21757 8.48752 5.36399 8.33335 5.467C8.17918 5.57002 7.99792 5.625 7.8125 5.625C7.56386 5.625 7.32541 5.52623 7.14959 5.35041C6.97378 5.1746 6.875 4.93614 6.875 4.6875Z" fill="currentColor"/></svg>';

/* ---------- RAID logic (source inline script, verbatim rules) ---------- */
const RAID_USABLE = {
  raid0: (drives, capacity) => drives * capacity,
  raid1: (drives, capacity) => capacity,
  raid5: (drives, capacity) => drives * capacity - capacity,
  raid6: (drives, capacity) => drives * capacity - capacity * 2,
  raid10: (drives, capacity) => (drives * capacity) / 2,
  raid50: (drives, capacity) => drives * capacity - capacity * 2,
  raid60: (drives, capacity) => drives * capacity - capacity * 4,
  jbod: (drives, capacity) => drives * capacity,
  spanning: (drives, capacity) => drives * capacity,
};
const RAID_MIN_DRIVES = {
  raid0: 2, raid1: 2, raid5: 3, raid6: 4, raid10: 4, raid50: 6, raid60: 8, jbod: 2, spanning: 2,
};
const RAID_NESTED = new Set(['raid10', 'raid50', 'raid60']);
const RAID_EVEN_MESSAGE = 'Drive count must be an even number for this RAID type.';

/* ---------- Surveillance logic (source inline script, verbatim table) ---------- */
const SURV_RATIOS = {
  mpeg: { high: 16, medium: 25, low: 31 },
  h264: {
    high: { high: 98, medium: 102, low: 105 },
    medium: { high: 160, medium: 173, low: 181 },
    low: { high: 220, medium: 242, low: 260 },
  },
  h265: {
    high: { high: 260, medium: 272, low: 282 },
    medium: { high: 480, medium: 510, low: 536 },
    low: { high: 620, medium: 670, low: 710 },
  },
  h265plus: {
    high: { high: 335, medium: 351, low: 364 },
    medium: { high: 590, medium: 621, low: 643 },
    low: { high: 776, medium: 834, low: 833 },
  },
};
/** colour depth switches to 30 bit above 8 294 399 px (4K and up), else 16 bit */
const SURV_DEEP_COLOUR_ABOVE = 8294399;

function compressionRatio(codec, quality, activity) {
  const codecRatios = SURV_RATIOS[codec];
  if (!codecRatios) return 1; // no codec chosen → ratio 1 (source behaviour, kept for parity)
  const q = codecRatios[quality];
  if (typeof q === 'number') return q;
  return (q && q[activity]) || 1;
}

/* ---------- helpers ---------- */
let instance = 0;

const el = (tag, className, html) => {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (html) e.innerHTML = html;
  return e;
};
const text = (cell) => (cell ? cell.textContent.replace(/\s+/g, ' ').trim() : '');
const hasContent = (cell) => !!cell && (text(cell) !== '' || !!cell.querySelector('img, picture'));
const moveChildren = (from, to) => { if (from) to.append(...from.childNodes); return to; };

/** "value: Label" list items (or paragraphs); a bold item is the default */
function parseOptions(cell) {
  if (!cell) return [];
  let items = [...cell.querySelectorAll('li')];
  if (!items.length) items = [...cell.querySelectorAll('p')];
  if (!items.length) items = text(cell).split(/\n|;/).map((t) => ({ textContent: t, querySelector: () => null }));
  return items.map((li) => {
    const raw = li.textContent.replace(/\s+/g, ' ').trim();
    const isDefault = !!li.querySelector('strong, b');
    const m = raw.match(/^([^:]+?)\s*:\s*(.+)$/);
    if (!m) return { value: raw, label: raw, isDefault };
    return { value: m[1].trim(), label: m[2].trim(), isDefault };
  }).filter((o) => o.label);
}

/** "key: value" lines → { min, max, step, default, message, evenmessage } */
function parseSpec(cell) {
  const spec = {};
  if (!cell) return spec;
  let lines = [...cell.querySelectorAll('p, li')].map((p) => p.textContent);
  if (!lines.length) lines = cell.textContent.split(/\n|;|,(?=\s*[a-z -]+:)/i);
  lines.forEach((line) => {
    const m = line.trim().match(/^([a-z -]+?)\s*:\s*(.+)$/i);
    if (m) spec[m[1].toLowerCase().replace(/[^a-z]/g, '')] = m[2].trim();
  });
  return spec;
}

function buildHelp(helpCell, id, label) {
  if (!hasContent(helpCell)) return null;
  const btn = el('button', 'calc-help-btn', INFO_SVG);
  btn.type = 'button';
  btn.setAttribute('aria-label', `Open ${label.toLowerCase()} tooltip`);
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', `${id}-help`);
  const tip = el('div', 'calc-help');
  tip.id = `${id}-help`;
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  moveChildren(helpCell, tip);
  const set = (open) => { tip.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(tip.hidden));
  btn.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  btn.addEventListener('focusout', (e) => { if (!tip.contains(e.relatedTarget)) set(false); });
  return { btn, tip };
}

function blockKeys(input, keys) {
  input.addEventListener('keydown', (e) => { if (keys.includes(e.key)) e.preventDefault(); });
}

function buildField(kind, cells, uid) {
  const [, nameCell, labelCell, specCell, helpCell] = cells;
  const name = text(nameCell).replace(/\s+/g, '-');
  if (!name) return null;
  const id = `${uid}-${name}`;
  const label = text(labelCell) || name;
  const help = buildHelp(helpCell, id, label);

  if (kind === 'radio') {
    const fs = el('fieldset', 'calc-field calc-field-radio');
    const legend = el('legend', 'calc-label');
    legend.textContent = label;
    if (help) legend.append(help.btn);
    fs.append(legend);
    if (help) fs.append(help.tip);
    const pills = el('div', 'calc-pills');
    parseOptions(specCell).forEach((o, i) => {
      const pill = el('label', 'calc-pill');
      const input = el('input');
      input.type = 'radio';
      input.name = name;
      input.value = o.value;
      input.id = `${id}-${i}`;
      input.defaultChecked = o.isDefault;
      const span = el('span');
      span.textContent = o.label;
      pill.append(input, span);
      pills.append(pill);
    });
    fs.append(pills);
    return fs;
  }

  const wrap = el('div', `calc-field calc-field-${kind}`);
  const head = el('div', 'calc-head');
  const lab = el('label', 'calc-label');
  lab.htmlFor = id;
  lab.textContent = label;
  head.append(lab);
  if (help) head.append(help.btn);
  wrap.append(head);
  if (help) wrap.append(help.tip);

  let control;
  if (kind === 'select') {
    control = el('select', 'calc-control');
    const options = parseOptions(specCell);
    options.forEach((o) => {
      const opt = el('option');
      opt.value = o.value;
      opt.textContent = o.label;
      opt.defaultSelected = o.isDefault;
      control.append(opt);
    });
  } else {
    const spec = parseSpec(specCell);
    control = el('input', 'calc-control');
    control.type = 'number';
    control.inputMode = 'numeric';
    ['min', 'max', 'step'].forEach((k) => { if (spec[k] !== undefined) control.setAttribute(k, spec[k]); });
    if (!spec.step) control.step = '1';
    if (spec.default !== undefined) control.defaultValue = spec.default;
    if (spec.message) {
      control.addEventListener('invalid', () => control.setCustomValidity(spec.message));
      control.addEventListener('input', () => control.setCustomValidity(''));
    }
    if (spec.evenmessage) control.dataset.evenMessage = spec.evenmessage;
    blockKeys(control, ['.', ',', 'e', 'E']);
  }
  control.id = id;
  control.name = name;
  wrap.append(control);
  return wrap;
}

function buildResult(cells, uid, fallbackLabel) {
  const [, keyCell, labelCell, valueCell, suffixCell] = cells;
  const key = text(keyCell).toLowerCase() || 'total';
  const wrap = el('div', `calc-result calc-result-${key}`);
  const out = el('output', 'calc-output');
  out.id = `${uid}-result-${key}`;
  out.dataset.result = key;
  out.setAttribute('aria-live', 'polite');
  out.tabIndex = -1;
  out.textContent = text(valueCell);
  if (hasContent(labelCell)) {
    const lab = el('label', 'calc-result-label');
    lab.htmlFor = out.id;
    lab.textContent = text(labelCell);
    wrap.append(lab);
  } else if (key !== 'detail' && fallbackLabel) {
    out.setAttribute('aria-label', fallbackLabel);
  }
  const line = el('p', 'calc-result-value');
  line.append(out);
  if (hasContent(suffixCell)) {
    const sfx = el('span', 'calc-result-suffix');
    sfx.textContent = text(suffixCell);
    line.append(sfx);
  }
  wrap.append(line);
  return wrap;
}

/* ---------- logic wiring ---------- */
function wireRaid(form, setResults, clearResults) {
  const type = form.elements['raid-type'];
  const qty = form.elements.quantity;
  const cap = form.elements.capacity;
  if (!type || !qty || !cap) return null;
  const evenMessage = qty.dataset.evenMessage || RAID_EVEN_MESSAGE;
  blockKeys(qty, ['-', '+']);

  const validate = (showError) => {
    const t = type.value;
    const n = Number(qty.value);
    qty.min = RAID_MIN_DRIVES[t] ?? 2;
    if (RAID_NESTED.has(t)) {
      qty.step = 2;
      if (showError && n % 2 !== 0) {
        qty.setCustomValidity(evenMessage);
        qty.reportValidity();
        return false;
      }
    } else {
      qty.step = 1;
    }
    qty.setCustomValidity('');
    return true;
  };
  qty.addEventListener('change', () => validate(true));
  type.addEventListener('change', () => validate(false));
  validate(false);

  return {
    reset: () => validate(false),
    submit: () => {
      if (!validate(true)) return;
      const t = type.value;
      const calc = RAID_USABLE[t];
      if (!calc) return;
      const drives = Number(qty.value);
      const capacity = Number(cap.value);
      const label = type.options[type.selectedIndex].text;
      const total = drives * capacity;
      const available = calc(drives, capacity);
      setResults({
        total: `${total} TB`,
        available: `${available} TB`,
        redundancy: `${total - available} TB`,
        detail: `${drives} x ${capacity}TB in ${label}  = ${available}TB Usable (${available},000GB)`,
      });
    },
    clear: clearResults,
  };
}

function wireSurveillance(form, setResults) {
  return {
    submit: () => {
      const data = new FormData(form);
      const resolution = Number(data.get('resolution'));
      const fps = Number(data.get('fps'));
      const cameras = Number(data.get('number_of_cameras'));
      const days = Number(data.get('days_to_store'));
      const hours = Number(data.get('hours_per_day')) / 24;
      const colourDepth = resolution > SURV_DEEP_COLOUR_ABOVE ? 30 : 16;
      const ratio = compressionRatio(data.get('codec'), data.get('quality'), data.get('activity'));
      const bandwidth = (resolution * colourDepth * fps * cameras) / ratio;
      const totalBytes = (bandwidth / 8) * 86400 * days * hours;
      setResults({ total: (totalBytes / 1e12).toFixed(3) });
    },
  };
}

export default function decorate(block) {
  instance += 1;
  const uid = `calc${instance}`;
  const main = el('div', 'calc-main');
  const form = el('form', 'calc-form');
  form.setAttribute('aria-label', 'Calculator');
  const groups = [];
  let group = null;
  const notes = el('div', 'calc-notes');
  const aside = el('div', 'calc-aside');
  const results = el('div', 'calc-results');
  const panel = el('div', 'calc-panel');
  let actions = null;
  let resultsTitle = '';
  let explainer = null;
  const intro = [];

  const newGroup = (heading) => {
    group = el('div', 'calc-group');
    if (heading) {
      const h = el('p', 'calc-group-title');
      h.textContent = heading;
      group.append(h);
    }
    group.append(el('div', 'calc-fields'));
    groups.push(group);
    form.append(group);
    return group;
  };

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const kind = text(cells[0]).toLowerCase();
    const body = cells[1];
    switch (kind) {
      case 'intro': {
        if (hasContent(body)) intro.push(moveChildren(body, el('div', 'calc-intro')));
        break;
      }
      case 'benefits': {
        if (hasContent(body)) intro.push(moveChildren(body, el('div', 'calc-benefits')));
        break;
      }
      case 'group':
        newGroup(text(body));
        break;
      case 'select':
      case 'number':
      case 'radio': {
        const field = buildField(kind, cells, uid);
        if (field) (group || newGroup('')).querySelector('.calc-fields').append(field);
        break;
      }
      case 'actions': {
        actions = el('div', 'calc-actions');
        const submit = el('button', 'calc-submit');
        submit.type = 'submit';
        submit.textContent = text(cells[1]) || 'Calculate storage';
        const reset = el('button', 'calc-reset');
        reset.type = 'reset';
        reset.textContent = text(cells[2]) || 'Reset';
        actions.append(submit, reset);
        break;
      }
      case 'note': {
        const content = cells.length > 2 ? cells[2] : body;
        if (!hasContent(content)) break;
        const note = moveChildren(content, el('div', 'calc-note'));
        const cond = cells.length > 2 ? text(body) : '';
        const m = cond.match(/^([^:]+):\s*(.+)$/);
        if (m) {
          note.dataset.when = m[1].trim();
          note.dataset.values = m[2].split(',').map((v) => v.trim()).join(',');
        }
        notes.append(note);
        break;
      }
      case 'explainer':
        if (hasContent(body)) explainer = moveChildren(body, el('div', 'calc-explainer'));
        break;
      case 'results': {
        resultsTitle = text(body);
        if (resultsTitle) {
          const t = el('p', 'calc-results-title');
          t.textContent = resultsTitle;
          results.append(t);
        }
        break;
      }
      case 'result':
        results.append(buildResult(cells, uid, resultsTitle));
        break;
      case 'status':
        if (hasContent(body)) results.append(moveChildren(body, el('div', 'calc-status')));
        break;
      case 'recommend':
        if (hasContent(body)) panel.append(moveChildren(body, el('div', 'calc-recommend')));
        break;
      case 'panel':
        if (hasContent(body)) panel.append(moveChildren(body, el('div', 'calc-panel-body')));
        break;
      default:
        // unknown row: keep its content in the form card rather than dropping it
        if (cells.some(hasContent)) intro.push(moveChildren(cells[cells.length - 1], el('div', 'calc-extra')));
    }
  });

  groups.forEach((g) => {
    const n = g.querySelector('.calc-fields').children.length;
    g.style.setProperty('--calc-cols', Math.max(n, 1));
  });
  form.append(actions || (() => {
    const a = el('div', 'calc-actions');
    a.innerHTML = '<button type="submit" class="calc-submit">Calculate storage</button><button type="reset" class="calc-reset">Reset</button>';
    return a;
  })());

  main.append(...intro, form);
  if (notes.children.length) main.append(notes);
  if (explainer) main.append(explainer);
  if (results.children.length) aside.append(results);
  if (panel.children.length) aside.append(panel);
  block.replaceChildren(main, aside);

  /* ---------- behaviour ---------- */
  const outputs = [...results.querySelectorAll('output')];
  const setResults = (values) => {
    outputs.forEach((o) => {
      const v = values[o.dataset.result];
      if (v !== undefined) o.textContent = v;
    });
    const first = outputs.find((o) => o.dataset.result !== 'detail');
    if (first) first.focus();
  };
  const clearResults = () => {
    outputs.forEach((o) => { o.textContent = o.dataset.result === 'detail' ? '' : PLACEHOLDER; });
  };
  const updateNotes = () => {
    notes.querySelectorAll('.calc-note[data-when]').forEach((n) => {
      const ctl = form.elements[n.dataset.when];
      const value = ctl ? ctl.value : '';
      n.hidden = !n.dataset.values.split(',').includes(value);
    });
  };

  const isRaid = block.classList.contains('raid')
    || (!block.classList.contains('surveillance') && !!form.elements['raid-type']);
  const logic = isRaid
    ? wireRaid(form, setResults, clearResults)
    : wireSurveillance(form, setResults);

  form.addEventListener('change', () => { clearResults(); updateNotes(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (logic) logic.submit();
  });
  form.addEventListener('reset', () => {
    setTimeout(() => {
      clearResults();
      if (logic && logic.reset) logic.reset();
      updateNotes();
    });
  });
  updateNotes();
}
