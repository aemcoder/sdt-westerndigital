/**
 * form — definition-driven web forms (dynamics row 15): the contact-us topic switcher and single forms
 * ("Talk to an Expert"). Fields, validators and error copy are recorded from the live forms into
 * /data/forms/<name>.json (code bus, `_provenance`); the validators re-implement the source's formbase.js
 * (validateEmpty / validateEmail / validateOnlyNumbers / validateSelection / validateMinFieldLength).
 * Submission goes to the endpoint named in scripts/site-config.js; with none (the interim state) the
 * submission is captured in this browser only and the visitor is told no backend is connected.
 *
 * Authoring (rows):
 *   source   /data/forms/looking-to-purchase.json            (single form)
 *   topics   Select Topic                                     (topic switcher; placeholder label)
 *   topic    Label | /data/forms/contact-careers.json         (a topic that opens a form)
 *   topic    Label | <p>…</p><p><a>…</a></p>                  (a topic that shows authored content)
 *   topic    Label | /data/forms/x.json | <p>…</p>           (authored lead content above that topic's form)
 *   anchor   talk-to-an-expert                                (optional id, so in-page "#…" links land on the form)
 * The lead text above the switcher is default content of the section.
 */
import siteConfig from '../../scripts/site-config.js';

const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const text = (cell) => cell?.textContent.trim() || '';
const CAPTURE_KEY = 'wd-form-captures';
const NO_BACKEND = 'This preview is not connected to a form backend yet. Your request was saved in this browser only and has not been sent to Western Digital.';

/* source: Form-suit/form/formbase.js */
const EMAIL = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
const RULES = {
  empty: (c) => c.value.trim() !== '',
  email: (c) => EMAIL.test(c.value) && c.value.length <= 128,
  onlyNumbers: (c) => /^-?\d+\.?\d*$/.test(c.value),
  requiredSelection: (c) => c.value !== '-1',
  minFieldLength: (c) => c.value.trim().length >= Number(c.dataset.minLength || 0),
};

function fieldValid(control, field) {
  if (control.closest('[hidden]')) return true;
  if (field.showWhen && !field.validate) return control.value.trim() !== '';
  return (field.validate || []).every((r) => !RULES[r] || RULES[r](control));
}

function renderField(field, idPrefix) {
  const id = `${idPrefix}-${field.name}`;
  const wrap = el('div', `form-field form-field--${field.type}`);
  wrap.dataset.name = field.name;
  let control;
  if (field.type === 'select') {
    control = el('select');
    const ph = el('option'); ph.value = field.placeholderValue ?? ''; ph.textContent = field.label; control.append(ph);
    (field.options || []).forEach((o) => { const op = el('option'); op.value = o; op.textContent = o; control.append(op); });
  } else if (field.type === 'textarea') {
    control = el('textarea'); control.rows = 6; control.placeholder = field.label;
  } else if (field.type === 'checkbox') {
    control = el('input'); control.type = 'checkbox'; control.value = 'true';
    const label = el('label', 'form-check'); label.htmlFor = id;
    const copy = el('span', '', field.label.replace("WD's Privacy Statement", `WD's <a href="${field.privacyHref || 'https://www.westerndigital.com/legal/privacy-statement'}"><strong>Privacy Statement</strong></a>`));
    control.id = id; control.name = field.name; label.append(control, copy); wrap.append(label);
    return { wrap, control };
  } else {
    control = el('input'); control.type = field.type === 'tel' ? 'tel' : (field.type === 'email' ? 'email' : 'text'); control.placeholder = field.label;
    if (field.type === 'email') control.autocomplete = 'email';
  }
  control.id = id; control.name = field.name;
  control.setAttribute('aria-label', field.label.replace(/^\*/, ''));
  if (field.maxlength) control.maxLength = field.maxlength;
  if (field.minLength) control.dataset.minLength = field.minLength;
  if (field.required) control.setAttribute('aria-required', 'true');
  const err = el('p', 'form-error'); err.id = `${id}-error`; err.textContent = field.error || 'Field cannot be empty.'; err.hidden = true;
  control.setAttribute('aria-describedby', err.id);
  wrap.append(control, err);
  if (field.showWhen) wrap.hidden = true;
  return { wrap, control };
}

function setError(entry, bad) {
  entry.err.hidden = !bad; entry.wrap.classList.toggle('is-invalid', bad);
  entry.control.setAttribute('aria-invalid', bad ? 'true' : 'false');
}

async function deliver(def, data) {
  const cfg = siteConfig?.forms || {};
  const endpoint = cfg.endpoints?.[def.name] || cfg.endpoint || '';
  const payload = { form: def.name, data, page: window.location.pathname, timestamp: new Date().toISOString() };
  if (!endpoint) {
    const all = JSON.parse(localStorage.getItem(CAPTURE_KEY) || '[]'); all.push(payload);
    localStorage.setItem(CAPTURE_KEY, JSON.stringify(all.slice(-20)));
    return { ok: true, local: true };
  }
  const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return { ok: res.ok, local: false };
}

export function buildForm(def, idPrefix) {
  const host = el('div', 'form-panel');
  if (def.title) host.append(el('h2', 'form-title')); if (def.title) host.lastChild.textContent = def.title;
  (def.intro || []).forEach((t) => { const p = el('p', 'form-intro'); p.textContent = t; host.append(p); });
  host.append(el('p', 'form-required', def.requiredNote || '* Required Fields'));
  const form = el('form'); form.noValidate = true; form.dataset.form = def.name;
  const grid = el('div', 'form-grid');
  const entries = def.fields.map((f) => {
    const { wrap, control } = renderField(f, idPrefix);
    grid.append(wrap);
    return { field: f, wrap, control, err: wrap.querySelector('.form-error') };
  });
  // dependent fields follow their controlling option (e.g. Product Category → Other)
  entries.filter((e) => e.field.showWhen).forEach((dep) => {
    const ctl = form.querySelector(`[name="${dep.field.showWhen.field}"]`) || grid.querySelector(`[name="${dep.field.showWhen.field}"]`);
    ctl?.addEventListener('change', () => { dep.wrap.hidden = ctl.value !== dep.field.showWhen.value; if (dep.wrap.hidden) { dep.control.value = ''; setError(dep, false); } });
  });
  // honeypot instead of the source's reCAPTCHA (vendor key cannot be replayed off-origin)
  const hp = el('div', 'form-hp'); hp.setAttribute('aria-hidden', 'true');
  hp.innerHTML = '<label>Leave this field empty<input type="text" name="hp_website" tabindex="-1" autocomplete="off"></label>';
  form.append(grid, hp);
  if (def.consent) form.append(el('p', 'form-consent', def.consent.replace(/WD Privacy Statement\.$/, 'WD <a href="https://www.westerndigital.com/legal/privacy-statement"><strong>Privacy Statement</strong></a>.')));
  const actions = el('div', 'form-actions');
  const submit = el('button', 'form-submit'); submit.type = 'submit'; submit.textContent = def.submitLabel || 'Submit';
  actions.append(submit); form.append(actions);
  const status = el('div', 'form-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  form.append(status);
  host.append(form);

  const check = (e) => { const bad = !(e.field.validate || e.field.showWhen) ? false : !fieldValid(e.control, e.field); setError(e, bad); return !bad; };
  entries.forEach((e) => {
    if (e.field.validate || e.field.showWhen) e.control.addEventListener('blur', () => { if (e.control.value || e.wrap.classList.contains('is-invalid')) check(e); });
  });

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    status.className = 'form-status'; status.textContent = '';
    const results = entries.map(check);
    if (results.includes(false)) { entries[results.indexOf(false)].control.focus(); return; }
    if (form.querySelector('[name="hp_website"]').value) return;
    const data = {};
    entries.filter((e) => !e.wrap.hidden).forEach((e) => { data[e.field.name] = e.field.type === 'checkbox' ? e.control.checked : e.control.value.trim(); });
    submit.disabled = true;
    try {
      const r = await deliver(def, data);
      if (!r.ok) throw new Error('endpoint');
      status.classList.add(r.local ? 'is-local' : 'is-sent');
      status.textContent = r.local ? NO_BACKEND : 'Thank you. Your request has been submitted.';
      if (!r.local) form.reset();
    } catch {
      status.classList.add('is-error'); status.textContent = def.errorMessage || 'Oops! Something went wrong. Please try again later.';
    } finally { submit.disabled = false; }
  });
  return host;
}

async function loadDef(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json();
}

export default async function decorate(block) {
  const rows = [...block.children].map((r) => [...r.children]);
  const kind = (r) => text(r[0]).toLowerCase();
  const source = rows.find((r) => kind(r) === 'source');
  const topicsRow = rows.find((r) => kind(r) === 'topics');
  const topics = rows.filter((r) => kind(r) === 'topic');
  const anchor = text(rows.find((r) => kind(r) === 'anchor')?.[1]);
  if (anchor) block.id = anchor;
  block.replaceChildren();

  if (source) {
    try { block.append(buildForm(await loadDef(text(source[1])), 'f')); } catch (e) { block.append(el('p', 'form-status is-error', 'This form is unavailable.')); }
    return;
  }
  if (!topics.length) return;

  const selWrap = el('div', 'form-topic');
  const select = el('select'); select.id = 'form-topic'; select.setAttribute('aria-label', text(topicsRow?.[1]) || 'Select Topic');
  const ph = el('option'); ph.value = ''; ph.textContent = text(topicsRow?.[1]) || 'Select Topic'; select.append(ph);
  selWrap.append(select); block.append(selWrap);
  const panels = el('div', 'form-topics');
  topics.forEach((r, i) => {
    const label = text(r[1]); const op = el('option'); op.value = String(i); op.textContent = label; select.append(op);
    const panel = el('div', 'form-topic-panel'); panel.hidden = true; panel.dataset.topic = label;
    const src = text(r[2]);
    if (/^\/[^\s]*\.json$/.test(src)) {
      panel.dataset.source = src;
      if (r[3] && r[3].textContent.trim()) { const lead = el('div', 'form-lead'); lead.append(...r[3].childNodes); panel.append(lead); }
    } else { panel.classList.add('is-content'); panel.append(...r[2].childNodes); }
    panels.append(panel);
  });
  block.append(panels);
  select.addEventListener('change', async () => {
    [...panels.children].forEach((p) => { p.hidden = true; });
    const panel = panels.children[Number(select.value)];
    if (!panel) return;
    panel.hidden = false;
    if (panel.dataset.source && !panel.dataset.loaded) {
      panel.dataset.loaded = 'true';
      try { panel.append(buildForm(await loadDef(panel.dataset.source), `t${select.value}`)); } catch (e) { panel.append(el('p', 'form-status is-error', 'This form is unavailable.')); }
    }
  });
}
