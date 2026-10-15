/**
 * form — definition-driven intake forms (stardust dynamics row 15, reference/forms.md).
 *
 * Authoring (key | value rows, keys case-insensitive):
 *   Source      | /data/forms/<id>.json  definition recorded from the live form
 *   Action      | https://…              optional endpoint (else scripts/site-config.js decides)
 *   Success     | rich text              optional copy shown after a 2xx from the endpoint
 *   Intro       | rich text              optional copy above the form (heading, lead, logo)
 *   Image       | picture                optional media column beside the form
 *   Id          | talk-to-an-expert      `modal` variant: links to #<id> open the form in a dialog
 *   Placeholder | Select Topic           `topics` variant: label of the chooser's empty option
 * Variant `topics` (contact-us chooser): every other row is  label | content | [value];  content is
 *   a definition path (renders that form) or rich text (moved as-is). `?selectedValue=<value>`
 *   preselects a topic, as on the source.
 * Without a Source row, the other rows are field rows:  Label | type | options (a, b) | required.
 *
 * Behaviour: placeholder-option selects, choice groups, required marks, live validation wording,
 * "Other" dependents, empty submission refused, honeypot (`website`) instead of the source's
 * reCAPTCHA, JSON post { data, page, timestamp }. With no endpoint the submission is captured in
 * localStorage and the visitor is told that no backend is connected — never a fake success.
 * Authored nodes are MOVED (EW1). @ew-exempt none.
 */
import siteConfig from '../../scripts/site-config.js';

const CAPTURE_KEY = 'wd-form-captures';
const KEYS = ['source', 'action', 'success', 'intro', 'image', 'id', 'placeholder'];
const AUTOCOMPLETE = { email: 'email', firstName: 'given-name', lastName: 'family-name' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCAL_TITLE = 'Captured locally — no backend connected';
const LOCAL_TEXT = 'This form is not connected to a backend yet, so your request was NOT sent to WD. '
  + 'Your entries were saved in this browser only.';

const slug = (s) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'className') e.className = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v);
  });
  kids.flat().forEach((k) => { if (k !== null && k !== undefined) e.append(k); });
  return e;
};

/** read a cell as a path: a link's pathname or its text */
function cellPath(cell) {
  const a = cell?.querySelector('a');
  if (a) {
    try {
      const u = new URL(a.href);
      return u.origin === window.location.origin ? u.pathname : a.href;
    } catch { /* fall back to the text */ }
  }
  return (cell?.textContent || '').trim();
}

async function loadDefinition(path) {
  const url = path.startsWith('/') ? `${window.hlx?.codeBasePath || ''}${path}` : path;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`form definition ${path}: ${resp.status}`);
  return resp.json();
}

function resolveEndpoint(action, id) {
  const cfg = siteConfig?.forms || {};
  const map = cfg.endpoints || {};
  return action || map[id] || map[window.location.pathname] || cfg.endpoint || '';
}

/* ---------- rendering ---------- */

function controlFor(field, cid) {
  const common = {
    id: cid,
    name: field.name,
    required: field.required || undefined,
    'aria-describedby': `${cid}-error`,
  };
  if (field.type === 'select') {
    const s = el('select', { ...common, className: 'form-control' });
    const prompt = field.prompt || { value: '', label: field.label };
    s.append(el('option', { value: prompt.value }, prompt.label));
    (field.options || []).forEach((o) => s.append(el('option', { value: o.value }, o.label)));
    if (field.default) s.value = field.default;
    s.dataset.empty = prompt.value;
    return s;
  }
  if (field.type === 'textarea') {
    return el('textarea', {
      ...common, className: 'form-control', placeholder: field.placeholder, maxlength: field.maxlength, minlength: field.minlength, rows: 7,
    });
  }
  if (field.type === 'checkbox' || field.type === 'radio') {
    return el('input', {
      ...common, type: field.type, value: field.value || 'true', className: 'form-check',
    });
  }
  const inputType = { email: 'email', tel: 'tel' }[field.type] || 'text';
  return el('input', {
    ...common,
    type: inputType,
    className: 'form-control',
    placeholder: field.placeholder,
    maxlength: field.maxlength,
    minlength: field.minlength,
    pattern: field.pattern,
    inputmode: field.pattern && /^\[0-9\]/.test(field.pattern) ? 'numeric' : undefined,
    autocomplete: AUTOCOMPLETE[field.name.replace(/^emailTemplate-/, '')],
  });
}

function renderField(field, formId, labelsAbove) {
  const cid = `${formId}-${slug(field.name)}`;
  const wrap = el('div', { className: `form-field form-${field.type} form-w-${field.width || 'full'}`, 'data-name': field.name });
  const control = controlFor(field, cid);
  if (field.type === 'checkbox') {
    const label = el('label', { className: 'form-check-label', for: cid });
    label.innerHTML = field.labelHtml || field.label;
    wrap.append(control, label);
  } else if (field.type === 'radio-group' || field.type === 'checkbox-group') {
    const type = field.type.split('-')[0];
    const set = el('fieldset', { className: 'form-choices' }, el('legend', {}, field.label));
    (field.options || []).forEach((o, i) => {
      const id = `${cid}-${i}`;
      set.append(el('div', { className: 'form-choice' }, el('input', {
        type, id, name: field.name, value: o.value, required: (field.required && type === 'radio') || undefined,
      }), el('label', { for: id }, o.label)));
    });
    wrap.append(set);
  } else {
    const label = el('label', { for: cid, className: labelsAbove ? 'form-label' : 'form-label form-sr' }, field.label);
    if (field.required && labelsAbove) label.dataset.required = '';
    wrap.append(label, control);
  }
  wrap.append(el('p', { className: 'form-field-error', id: `${cid}-error` }));
  if (field.other) {
    const ocid = `${cid}-other`;
    const other = el('div', { className: 'form-other', hidden: true }, el('label', { className: 'form-label form-sr', for: ocid }, field.other.label || field.label), el('input', {
      type: 'text', id: ocid, className: 'form-control', placeholder: field.other.placeholder || undefined, maxlength: field.other.maxlength, 'aria-describedby': `${ocid}-error`, 'data-other-of': field.name,
    }), el('p', { className: 'form-field-error', id: `${ocid}-error` }));
    wrap.append(other);
    control.addEventListener('change', () => {
      const on = control.value === field.other.value;
      other.hidden = !on;
      const input = other.querySelector('input');
      input.required = !!(on && field.other.required);
      if (!on) { input.value = ''; input.setCustomValidity(''); other.classList.remove('is-invalid'); }
    });
  }
  if (field.helpHtml) wrap.append(el('p', { className: 'form-help', html: field.helpHtml }));
  return wrap;
}

/* ---------- validation (live wording from the definition) ---------- */

function messageFor(control, field) {
  const v = (control.value || '').trim();
  if (control.type === 'checkbox') return control.required && !control.checked ? field.message || control.validationMessage : '';
  const empty = !v || (control.tagName === 'SELECT' && v === control.dataset.empty);
  if (empty) return control.required ? (field.message || control.validationMessage || ' ') : '';
  if (control.type === 'email' && !EMAIL.test(v)) return field.message;
  if (control.pattern && !new RegExp(`^(?:${control.pattern})$`).test(v)) return field.message;
  if (control.minLength > 0 && v.length < control.minLength) return field.message || `${control.minLength}+`;
  return '';
}

function validateControl(control, field) {
  const holder = control.closest('.form-other') || control.closest('.form-field');
  const err = holder.querySelector(':scope > .form-field-error');
  const msg = control.closest('.form-other')?.hidden ? '' : messageFor(control, field);
  control.setCustomValidity(msg ? msg.trim() || 'invalid' : '');
  control.toggleAttribute('aria-invalid', !!msg);
  holder.classList.toggle('is-invalid', !!msg);
  if (err) err.textContent = msg ? msg.trim() : '';
  return !msg;
}

function fieldControls(form, fields) {
  const out = [];
  fields.forEach((f) => {
    const wrap = form.querySelector(`.form-field[data-name="${CSS.escape(f.name)}"]`);
    if (!wrap) return;
    const main = wrap.querySelector(':scope > select, :scope > input, :scope > textarea');
    if (main) out.push([main, f]);
    const other = wrap.querySelector('.form-other input');
    if (other) out.push([other, { ...f.other, name: f.name }]);
  });
  return out;
}

function collect(form, def, fields) {
  const data = {};
  fields.forEach((f) => {
    if (f.type === 'checkbox') { data[f.name] = form.elements[f.name]?.checked ? (f.value || 'true') : 'false'; return; }
    if (f.type === 'checkbox-group') { data[f.name] = [...form.querySelectorAll(`[name="${CSS.escape(f.name)}"]:checked`)].map((c) => c.value); return; }
    const c = form.elements[f.name];
    if (!c) return;
    let v = c.value;
    if (f.type === 'select' && v === c.dataset?.empty) v = '';
    if (f.other && v === f.other.value) v = form.querySelector(`[data-other-of="${CSS.escape(f.name)}"]`).value.trim() || v;
    data[f.name] = typeof v === 'string' ? v.trim() : v;
  });
  Object.entries(def.hidden || {}).forEach(([k, v]) => { data[k] = String(v).replace(/\{([^}]+)\}/g, (m, n) => data[n] ?? ''); });
  return data;
}

function capture(entry) {
  try {
    const all = JSON.parse(window.localStorage.getItem(CAPTURE_KEY) || '[]');
    all.push(entry);
    window.localStorage.setItem(CAPTURE_KEY, JSON.stringify(all.slice(-50)));
    return all.length;
  } catch { return 0; }
}

function showResult(panel, form, node) {
  const result = panel.querySelector('.form-result');
  result.replaceChildren(...node);
  result.hidden = false;
  form.hidden = true;
  panel.querySelectorAll(':scope > .form-head').forEach((h) => { h.hidden = true; });
  result.focus({ preventScroll: true });
  result.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function successNodes(def, successEl) {
  if (successEl) return [...successEl.cloneNode(true).childNodes];
  const s = def.success || {};
  return [s.title ? el('h2', {}, s.title) : null, s.text ? el('p', {}, s.text) : null, s.footer ? el('p', { className: 'form-result-footer' }, s.footer) : null].filter(Boolean);
}

/** builds the panel (head + form + result) for one definition */
export function buildForm(def, { action = '', successEl = null } = {}) {
  const formId = `form-${def.id || 'form'}`;
  const fields = (def.sections || []).flatMap((s) => s.fields || []);
  const panel = el('div', { className: 'form-panel', 'data-form': def.id });
  const head = el('div', { className: 'form-head' });
  if (def.title) head.append(el(`h${def.titleLevel || 2}`, { className: 'form-title' }, def.title));
  (def.intro || []).forEach((h) => head.insertAdjacentHTML('beforeend', h));
  if (def.requiredNote) head.append(el('p', { className: 'form-required-note' }, def.requiredNote));
  if (head.childElementCount) panel.append(head);

  const form = el('form', {
    id: formId, className: `form-form${def.labels === 'above' ? ' labels-above' : ''}`, novalidate: true, 'data-form-name': def.hidden?.formName,
  });
  (def.sections || []).forEach((s) => {
    const group = el('div', { className: 'form-section' });
    if (s.title) group.append(el('h3', { className: 'form-section-title' }, s.title));
    (s.fields || []).forEach((f) => group.append(renderField(f, formId, def.labels === 'above')));
    form.append(group);
  });
  form.append(el('div', { className: 'form-hp', 'aria-hidden': 'true' }, el('label', { for: `${formId}-website` }, 'Website'), el('input', {
    type: 'text', id: `${formId}-website`, name: 'website', tabindex: '-1', autocomplete: 'off',
  })));
  (def.notes || []).forEach((h) => form.insertAdjacentHTML('beforeend', `<div class="form-note">${h}</div>`));
  const submit = el('button', { type: 'submit', className: `form-submit${def.submitStyle === 'block' ? ' block' : ''}` }, def.submitLabel || 'Submit');
  form.append(el('div', { className: 'form-actions' }, submit));
  const status = el('p', { className: 'form-status', role: 'status', 'aria-live': 'polite' });
  form.append(status);
  panel.append(form, el('div', {
    className: 'form-result', hidden: true, tabindex: '-1', role: 'status',
  }));

  const pairs = () => fieldControls(form, fields);
  let tried = false;
  form.addEventListener('input', (e) => {
    if (!tried) return;
    const pair = pairs().find(([c]) => c === e.target);
    if (pair) validateControl(...pair);
  });
  form.addEventListener('change', (e) => {
    if (!tried) return;
    const pair = pairs().find(([c]) => c === e.target);
    if (pair) validateControl(...pair);
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    tried = true;
    status.textContent = '';
    if (form.elements.website?.value) return; // honeypot: bots fill it, people never see it
    const results = pairs().map(([c, f]) => [c, validateControl(c, f)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) { firstBad[0].focus(); return; }
    const data = collect(form, def, fields);
    const payload = { data, page: window.location.pathname, timestamp: new Date().toISOString() };
    const endpoint = resolveEndpoint(action, def.id);
    if (!endpoint) {
      capture({ form: def.id, ...payload });
      form.dispatchEvent(new CustomEvent('form:captured', { bubbles: true, detail: payload }));
      showResult(panel, form, [el('h2', {}, LOCAL_TITLE), el('p', {}, LOCAL_TEXT)]);
      return;
    }
    submit.disabled = true;
    try {
      const resp = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error(String(resp.status));
      showResult(panel, form, successNodes(def, successEl));
    } catch {
      status.textContent = def.error || 'Something went wrong.';
      status.classList.add('is-error');
    } finally {
      submit.disabled = false;
    }
  });
  return panel;
}

/* ---------- block modes ---------- */

function readRows(block) {
  const cfg = { topics: [], fieldRows: [] };
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = (cells[0]?.textContent || '').trim().toLowerCase();
    if (KEYS.includes(key)) [, cfg[key]] = cells;
    else if (cells.length) cfg.topics.push(cells);
  });
  return cfg;
}

function fieldRowsDefinition(rows) {
  return {
    id: 'form',
    sections: [{
      title: '',
      fields: rows.map(([label, type, options, required]) => {
        const t = slug(type?.textContent) || 'text';
        const opts = (options?.textContent || '').split(',').map((o) => o.trim()).filter(Boolean).map((o) => ({ value: o, label: o }));
        return {
          name: slug(label.textContent).replace(/-/g, '_'), label: label.textContent.trim(), type: t, options: opts, required: /^(required|yes|true)$/i.test((required?.textContent || '').trim()),
        };
      }),
    }],
    labels: 'above',
    submitLabel: 'Submit',
  };
}

function moveChildren(cell) {
  const frag = document.createDocumentFragment();
  if (cell) [...cell.childNodes].forEach((n) => frag.append(n));
  return frag;
}

async function decorateTopics(block, cfg) {
  const action = cellPath(cfg.action);
  const wrap = el('div', { className: 'form-topics' });
  if (cfg.intro) wrap.append(el('div', { className: 'form-intro' }, moveChildren(cfg.intro)));
  const selectId = `form-topic-${Math.random().toString(36).slice(2, 7)}`;
  const select = el('select', { className: 'form-topic-select', id: selectId, 'aria-label': (cfg.placeholder?.textContent || 'Select Topic').trim() });
  select.append(el('option', { value: '' }, (cfg.placeholder?.textContent || 'Select Topic').trim()));
  const panels = el('div', { className: 'form-topic-panels' });
  const topics = cfg.topics.map(([labelCell, contentCell, valueCell]) => {
    const label = labelCell.textContent.trim();
    const value = (valueCell?.textContent || '').trim() || slug(label);
    const path = cellPath(contentCell);
    const isDef = /\.json$/i.test(path);
    const panel = el('div', { className: 'form-topic-panel', id: `${selectId}-${value}`, hidden: true });
    if (!isDef) panel.append(el('div', { className: 'form-topic-copy' }, moveChildren(contentCell)));
    select.append(el('option', { value }, label));
    panels.append(panel);
    return {
      value, panel, path: isDef ? path : '', loaded: !isDef,
    };
  });
  const show = async (value) => {
    topics.forEach((t) => { t.panel.hidden = t.value !== value; });
    const t = topics.find((x) => x.value === value);
    if (t && !t.loaded) {
      t.loaded = true;
      try {
        t.panel.append(buildForm(await loadDefinition(t.path), { action, successEl: cfg.success }));
      } catch (err) {
        t.loaded = false;
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }
  };
  select.addEventListener('change', () => show(select.value));
  wrap.append(el('div', { className: 'form-topic-chooser' }, select), panels);
  block.replaceChildren(wrap);
  const pre = new URLSearchParams(window.location.search).get('selectedValue');
  if (pre && topics.some((t) => t.value === pre)) {
    select.value = pre;
    await show(pre);
  }
}

function decorateModal(block, panel, id) {
  const close = el('button', { type: 'button', className: 'form-dialog-close', 'aria-label': 'close' });
  const dialog = el('dialog', { className: 'form-dialog', id, 'aria-label': panel.querySelector('.form-title')?.textContent || 'Form' }, close, el('div', { className: 'form-dialog-body' }, panel));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  block.replaceChildren(dialog);
  const open = () => { if (!dialog.open) dialog.showModal(); };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    let match = href === `#${id}`;
    if (!match) {
      try { const u = new URL(a.href); match = u.hash === `#${id}` && u.pathname === window.location.pathname && u.origin === window.location.origin; } catch { /* ignore */ }
    }
    if (match) { e.preventDefault(); open(); }
  });
  if (window.location.hash === `#${id}`) open();
}

export default async function decorate(block) {
  const cfg = readRows(block);
  if (block.classList.contains('topics')) { await decorateTopics(block, cfg); return; }
  const action = cellPath(cfg.action);
  let def;
  const source = cellPath(cfg.source);
  if (source) {
    try { def = await loadDefinition(source); } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      block.replaceChildren();
      return;
    }
  } else def = fieldRowsDefinition(cfg.topics);
  const panel = buildForm(def, { action, successEl: cfg.success });
  if (cfg.intro) panel.prepend(el('div', { className: 'form-intro' }, moveChildren(cfg.intro)));
  if (block.classList.contains('modal')) {
    decorateModal(block, panel, (cfg.id?.textContent || def.id).trim());
    return;
  }
  const image = cfg.image?.querySelector('picture, img');
  if (image) {
    block.classList.add('has-media');
    block.replaceChildren(el('div', { className: 'form-main' }, panel), el('div', { className: 'form-media' }, image));
  } else block.replaceChildren(panel);
}
