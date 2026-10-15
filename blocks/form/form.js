/**
 * form — definition-driven intake form (dynamics row 15, stardust/dynamics reference forms.md).
 * Fields come from a definition recorded from the live form (`/data/forms/<name>.json`: order, placeholders,
 * options, live validation copy, "Other" dependents, half-width pairs); everything a reader sees around the
 * fields (heading, intro, consent, success) is authored here.
 *
 * Authoring (rows, key | value):
 *   Source       /data/forms/sales-lead.json      (link or text)
 *   Intro        <h2>…</h2><p>* Required Fields</p>
 *   Consent      <p>By clicking on "Submit", …</p>
 *   Submit       Submit
 *   Success      <p>Thank you! …</p>
 *   Image        <picture>                         (variant `media`: picture beside the form ≥ 900px)
 * Variant `topics` (contact-us): `Placeholder | Select Topic`, then one row per topic:
 *   <label> | <content: heading, intro, links> [| <source definition>]   — a topic without a source is content only.
 *   `?topic=<slug>` (or the source's `?selectedValue=<slug>`) preselects a topic.
 *
 * Intake: the definition names its family (`intake`); scripts/site-config.js maps it to an endpoint. Empty =
 * no backend connected (Document Authoring has no intake): the form still validates with the live copy,
 * refuses an empty submission, then captures the submission in this browser (sessionStorage `form-captures`)
 * and says so — the authored success copy is never shown for a capture. Owner decision: the intake endpoint.
 */
import siteConfig from '../../scripts/site-config.js';
import { toClassName } from '../../scripts/aem.js';

const CONFIG_KEYS = ['source', 'intro', 'consent', 'submit', 'success', 'image', 'placeholder'];
const GENERIC_ERROR = 'Oops! Something went wrong. Please try again later.';
const NO_BACKEND = 'No backend is connected on this site yet: your submission was captured in this browser only and was not sent to WD.';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
const cellPath = (cell) => (cell?.querySelector('a')?.getAttribute('href') || cell?.textContent || '').trim();

function readRows(block) {
  const cfg = {}; const topics = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells[0]?.textContent.trim().toLowerCase();
    if (cells.length === 2 && CONFIG_KEYS.includes(key)) cfg[key] = cells[1];
    else if (cells.length >= 2) topics.push({ label: cells[0].textContent.trim(), content: cells[1], source: cells[2] ? cellPath(cells[2]) : '' });
  });
  return { cfg, topics };
}

const definitions = new Map();
function loadDefinition(path) {
  if (!definitions.has(path)) definitions.set(path, fetch(path).then((r) => { if (!r.ok) throw new Error(`definition ${r.status}`); return r.json(); }));
  return definitions.get(path);
}

/* ---- fields ---- */
function control(f, id, labelMode) {
  let c;
  if (f.type === 'select') {
    c = el('select');
    const ph = el('option'); ph.value = ''; ph.textContent = f.placeholder || f.label; c.append(ph);
    (f.options || []).forEach(([value, label]) => { const o = el('option'); o.value = value; o.textContent = label; c.append(o); });
  } else if (f.type === 'textarea') c = el('textarea');
  else { c = el('input'); c.type = f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'text'; }
  c.id = id; c.name = f.name;
  if (f.type !== 'select' && labelMode !== 'above' && f.placeholder) c.placeholder = f.placeholder;
  if (f.required) c.required = true;
  if (f.maxlength) c.maxLength = f.maxlength;
  if (f.minlength) c.minLength = f.minlength;
  if (f.pattern) c.pattern = f.pattern;
  if (f.type === 'email') c.autocomplete = 'email';
  return c;
}

function fieldRow(f, def, uid) {
  const id = `${uid}-${toClassName(f.name)}`;
  const wrap = el('div', `form-field form-field--${f.type}${f.width === 'half' ? ' is-half' : ''}`);
  if (f.type === 'checkbox') {
    const label = el('label', 'form-check'); const c = el('input'); c.type = 'checkbox'; c.name = f.name; c.value = f.value || 'true'; c.id = id;
    label.append(c, el('span', 'form-check-box'), el('span', 'form-check-text', f.labelHtml || f.label)); wrap.append(label);
    return wrap;
  }
  const label = el('label', def.labelMode === 'above' ? 'form-label' : 'form-label sr-only', f.label); label.htmlFor = id;
  const c = control(f, id, def.labelMode);
  const err = el('p', 'form-error'); err.id = `${id}-error`; err.hidden = true; c.setAttribute('aria-describedby', err.id);
  wrap.append(label, c, err);
  if (f.help) wrap.append(el('p', 'form-help', f.help));
  if (f.other) {
    // live: picking "Other" reveals a free-text field under the select
    const o = el('input', 'form-other'); o.type = 'text'; o.name = f.other.name; o.placeholder = f.other.placeholder; o.maxLength = f.other.maxlength || 100; o.hidden = true;
    o.setAttribute('aria-label', f.other.placeholder);
    c.addEventListener('change', () => { o.hidden = c.value !== f.other.when; o.required = !o.hidden && !!f.required; if (o.hidden) o.value = ''; });
    wrap.append(o);
  }
  return wrap;
}

// the live rules, the live words: empty → field error copy; email / numbers-only / min length → the same copy
function validate(c, f) {
  const v = c.value.trim();
  if (!v) return f.required ? (f.error || 'Field cannot be empty.') : '';
  if (f.type === 'email' && !EMAIL.test(v)) return f.error || 'Enter a valid email address.';
  if (f.pattern && !new RegExp(`^(?:${f.pattern})$`).test(v)) return f.error || 'Enter a valid number';
  if (f.minlength && v.length < f.minlength) return f.error || `Enter at least ${f.minlength} characters`;
  return '';
}

function buildForm(def, ctx) {
  const uid = `form-${def.id}-${Math.random().toString(36).slice(2, 7)}`;
  const form = el('form', 'form-body'); form.noValidate = true; form.dataset.form = def.id;
  const endpoint = siteConfig().forms?.endpoints?.[def.intake] || '';
  form.dataset.intake = endpoint ? 'endpoint' : 'none';
  if (ctx.intro) form.append(el('div', 'form-intro', ctx.intro.innerHTML));
  const grid = el('div', 'form-grid');
  const byName = new Map();
  def.fields.forEach((f) => { grid.append(fieldRow(f, def, uid)); byName.set(f.name, f); });
  form.append(grid);
  // honeypot instead of the source's reCAPTCHA token (domain-bound, cannot be replayed here)
  const hp = el('div', 'form-hp'); hp.setAttribute('aria-hidden', 'true');
  hp.innerHTML = '<label>Leave empty<input type="text" name="hp_website" tabindex="-1" autocomplete="off"></label>'; form.append(hp);
  if (ctx.consent) form.append(el('div', 'form-consent', ctx.consent.innerHTML));
  const actions = el('div', 'form-actions');
  const submit = el('button', 'button primary form-submit', ctx.submitLabel || 'Submit'); submit.type = 'submit';
  actions.append(submit); form.append(actions);
  if (!endpoint) form.append(el('p', 'form-intake-note', 'Preview: no backend connected — submissions are captured in this browser only.'));
  const status = el('div', 'form-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); form.append(status);

  const show = (c, msg) => { const err = form.querySelector(`#${c.getAttribute('aria-describedby')}`); if (!err) return; err.textContent = msg; err.hidden = !msg; c.setAttribute('aria-invalid', msg ? 'true' : 'false'); };
  form.addEventListener('input', (e) => { const f = byName.get(e.target.name); if (f && e.target.getAttribute('aria-invalid') === 'true') show(e.target, validate(e.target, f)); });
  form.addEventListener('change', (e) => { const f = byName.get(e.target.name); if (f && e.target.getAttribute('aria-invalid') === 'true') show(e.target, validate(e.target, f)); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = ''; status.className = 'form-status';
    let first = null;
    [...form.elements].forEach((c) => { const f = byName.get(c.name); if (!f || f.type === 'checkbox') return; const msg = validate(c, f); show(c, msg); if (msg && !first) first = c; });
    form.querySelectorAll('.form-other:not([hidden])').forEach((o) => { if (o.required && !o.value.trim() && !first) first = o; });
    if (first) { first.focus(); return; } // empty / invalid submission refused, nothing leaves the page
    if (form.elements.hp_website?.value) return;
    const data = {};
    [...form.elements].forEach((c) => { if (!c.name || c.name === 'hp_website' || c.hidden) return; if (c.type === 'checkbox') data[c.name] = c.checked ? c.value : 'false'; else data[c.name] = c.value.trim(); });
    const payload = { form: ctx.formName || def.id, data, page: window.location.pathname, timestamp: new Date().toISOString() };
    submit.disabled = true;
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(`intake ${res.status}`);
        form.replaceChildren(el('div', 'form-success', ctx.success?.innerHTML || '<p>Thank you! We are reviewing your request and will contact you shortly.</p>'));
      } else {
        const store = JSON.parse(sessionStorage.getItem('form-captures') || '[]'); store.push(payload); sessionStorage.setItem('form-captures', JSON.stringify(store));
        form.dataset.captured = String(store.length);
        form.replaceChildren(el('div', 'form-success form-success--captured', `<p><strong>Submission captured locally.</strong></p><p>${NO_BACKEND}</p>`));
      }
    } catch {
      submit.disabled = false; status.textContent = GENERIC_ERROR; status.classList.add('is-error');
    }
  });
  return form;
}

async function mountForm(host, source, ctx) {
  try { host.replaceChildren(buildForm(await loadDefinition(source), ctx)); } catch { host.replaceChildren(el('p', 'form-status is-error', GENERIC_ERROR)); }
}

export default async function decorate(block) {
  const { cfg, topics } = readRows(block);
  const ctx = { consent: cfg.consent, success: cfg.success, submitLabel: cfg.submit?.textContent.trim() };
  if (block.classList.contains('topics') && topics.length) {
    const select = el('select', 'form-topic-select'); select.setAttribute('aria-label', cfg.placeholder?.textContent.trim() || 'Select Topic');
    const ph = el('option'); ph.value = ''; ph.textContent = cfg.placeholder?.textContent.trim() || 'Select Topic'; select.append(ph);
    const panels = el('div', 'form-topic-panels');
    const items = topics.map((t) => {
      const slug = toClassName(t.label); const o = el('option'); o.value = slug; o.textContent = t.label; select.append(o);
      const panel = el('div', 'form-topic-panel'); panel.dataset.topic = slug; panel.hidden = true;
      return { ...t, slug, panel, mounted: false };
    });
    panels.append(...items.map((i) => i.panel));
    const open = (slug) => {
      items.forEach((i) => {
        i.panel.hidden = i.slug !== slug;
        if (i.slug !== slug || i.mounted) return;
        i.mounted = true;
        if (i.source) { const host = el('div', 'form-host'); i.panel.append(host); mountForm(host, i.source, { ...ctx, intro: i.content, formName: `contact-us-${i.slug}` }); } else i.panel.append(el('div', 'form-topic-content', i.content.innerHTML));
      });
    };
    select.addEventListener('change', () => open(select.value));
    block.replaceChildren(...(cfg.intro ? [el('div', 'form-topic-intro', cfg.intro.innerHTML)] : []), select, panels);
    const want = new URLSearchParams(window.location.search); const q = want.get('topic') || want.get('selectedValue');
    const hit = q && items.find((i) => i.slug === q || i.slug.startsWith(`${q}-`));
    if (hit) { select.value = hit.slug; open(hit.slug); }
    return;
  }
  const source = cellPath(cfg.source);
  const media = cfg.image?.querySelector('picture, img');
  const host = el('div', 'form-host');
  block.replaceChildren(host);
  if (media) { const fig = el('div', 'form-media'); fig.append(media); block.append(fig); }
  if (source) await mountForm(host, source, { ...ctx, intro: cfg.intro });
}
