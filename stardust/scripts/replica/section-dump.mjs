#!/usr/bin/env node
/**
 * section-dump.mjs — project-owned instrument for replica Phase 3 (recreation).
 *
 * Dumps a compact, depth-limited OUTLINE of the live page's visible DOM under a
 * content root: for each element that is "structural" (a section-like box) or
 * "content" (heading / text / link / image / button), one line with tag, classes,
 * rect [x y w h], key computed styles (bg, color, font, padding, radius, position,
 * display/flex/grid, background-image layers), and text. This is the authoring
 * map for a clean recreation: section order, counts, geometry, exact type and
 * exact colours — read offline instead of re-probing the live site per selector.
 *
 * Usage: node stardust/scripts/replica/section-dump.mjs <url> --width 1440 --main .mainContainWrap --out file.json [--depth 12] [--headed]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { newLiveContext, gotoLive, dismissOverlays, launchStealthHeaded, defaultWaitUntil } from '../diff/live-session.mjs';

function parseArgs(argv) {
  const o = { width: 1440, main: 'main', headed: false, out: null, depth: 60, chrome: true };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (!o.url && !a.startsWith('--')) o.url = a;
    else if (a === '--width') o.width = Number(rest[i += 1]);
    else if (a === '--out') o.out = rest[i += 1];
    else if (a === '--main') o.main = rest[i += 1];
    else if (a === '--depth') o.depth = Number(rest[i += 1]);
    else if (a === '--headed') o.headed = true;
    else if (a === '--no-chrome') o.chrome = false;
  }
  if (!o.url) { console.error('usage: section-dump.mjs <url> --width N --main <sel> --out file.json'); process.exit(2); }
  return o;
}

async function settle(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize().height;
  for (let y = 0; y < h; y += vh) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(250); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}

const DUMP = ({ mainSel, depth, chrome }) => {
  const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();
  const sy = window.scrollY;
  const vis = (el) => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const CONTENT = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'A', 'BUTTON', 'IMG', 'PICTURE', 'SVG', 'LI', 'SPAN', 'STRONG', 'EM', 'LABEL', 'INPUT', 'SELECT', 'IFRAME', 'VIDEO', 'TIME', 'SMALL', 'B', 'I', 'TD', 'TH']);
  const ownText = (el) => norm([...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' '));
  const style = (el, cs) => {
    const o = {};
    if (cs.backgroundColor && !/rgba\([^)]*,\s*0\)$/.test(cs.backgroundColor)) o.bg = cs.backgroundColor;
    if (cs.backgroundImage !== 'none') o.bgi = cs.backgroundImage.slice(0, 260) + (cs.backgroundSize !== 'auto' ? ` / ${cs.backgroundSize} ${cs.backgroundPosition}` : '');
    if (cs.position !== 'static') o.pos = cs.position;
    if (['flex', 'grid', 'inline-flex', 'inline-grid'].includes(cs.display)) { o.disp = cs.display; o.flow = cs.display.includes('grid') ? `cols:${cs.gridTemplateColumns.slice(0, 80)} gap:${cs.gap}` : `dir:${cs.flexDirection} wrap:${cs.flexWrap} jc:${cs.justifyContent} ai:${cs.alignItems} gap:${cs.gap}`; }
    else if (cs.display !== 'block' && cs.display !== 'inline') o.disp = cs.display;
    if (cs.padding !== '0px') o.pad = cs.padding;
    if (cs.margin !== '0px') o.mar = cs.margin;
    if (cs.borderTopLeftRadius !== '0px') o.rad = cs.borderTopLeftRadius;
    if (cs.borderTopWidth !== '0px' || cs.borderBottomWidth !== '0px') o.border = `${cs.borderTopWidth}/${cs.borderBottomWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`;
    if (cs.maxWidth !== 'none') o.maxw = cs.maxWidth;
    if (cs.overflow !== 'visible') o.ovf = cs.overflow;
    if (cs.transform !== 'none') o.tf = cs.transform.slice(0, 60);
    if (cs.objectFit !== 'fill') o.fit = cs.objectFit;
    if (cs.textAlign !== 'start' && cs.textAlign !== 'left') o.ta = cs.textAlign;
    return o;
  };
  const font = (cs) => `${cs.fontFamily.split(',')[0].replace(/"/g, '')} ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight}${cs.letterSpacing !== 'normal' ? ' ls:' + cs.letterSpacing : ''}${cs.textTransform !== 'none' ? ' ' + cs.textTransform : ''}${cs.textDecorationLine !== 'none' ? ' ' + cs.textDecorationLine : ''} ${cs.color}`;
  const R = (el) => { const r = el.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top + sy), Math.round(r.width), Math.round(r.height)]; };
  let count = 0;
  const walk = (el, d) => {
    if (count > 4000) return null;
    if (!vis(el)) return null;
    const cs = getComputedStyle(el);
    const tag = el.tagName;
    const node = { t: tag.toLowerCase(), c: norm(el.getAttribute('class') || '').slice(0, 110) || undefined, id: el.id || undefined, r: R(el) };
    const s = style(el, cs); if (Object.keys(s).length) node.s = s;
    count += 1;
    if (tag === 'IMG') { node.src = (el.currentSrc || el.src || el.getAttribute('data-src') || '').slice(0, 220); node.alt = el.alt; node.nat = [el.naturalWidth, el.naturalHeight]; if (el.srcset) node.srcset = el.srcset.slice(0, 160); return node; }
    if (tag === 'SVG') { node.svg = el.outerHTML.length; node.vb = el.getAttribute('viewBox'); node.aria = el.getAttribute('aria-label') || undefined; return node; }
    if (tag === 'IFRAME' || tag === 'VIDEO') { node.src = (el.src || el.getAttribute('data-src') || '').slice(0, 200); return node; }
    if (tag === 'INPUT' || tag === 'SELECT') { node.type = el.type; node.ph = el.placeholder; node.name = el.name; return node; }
    if (/^H[1-6]$/.test(tag) || tag === 'P' || tag === 'LI' || tag === 'A' || tag === 'BUTTON' || tag === 'LABEL' || tag === 'SPAN' || tag === 'STRONG' || tag === 'EM' || tag === 'TIME' || tag === 'SMALL' || tag === 'TD' || tag === 'TH') {
      node.f = font(cs);
      const txt = norm(el.textContent);
      if (tag === 'A') { node.href = el.getAttribute('href'); node.aria = el.getAttribute('aria-label') || undefined; }
      // leaf-ish: text carriers with only inline children are emitted with full text and inner html hint
      const hasBlockKids = [...el.children].some((k) => !CONTENT.has(k.tagName) || /^H[1-6]$|^P$|^LI$/.test(k.tagName) && k !== el);
      if (!hasBlockKids) { node.text = txt.slice(0, 400); if (el.children.length) node.inner = [...el.children].map((k) => `${k.tagName.toLowerCase()}${k.className ? '.' + norm(k.className).split(' ')[0] : ''}${k.tagName === 'IMG' ? '[' + (k.currentSrc || k.src).slice(-60) + ']' : k.tagName === 'SVG' ? '[svg]' : ''}`).join(' '); return node; }
      const ot = ownText(el); if (ot) node.text = ot.slice(0, 200);
    }
    if (d >= depth) { node.trunc = true; node.text = norm(el.textContent).slice(0, 200); return node; }
    const kids = []; for (const k of el.children) { const kn = walk(k, d + 1); if (kn) kids.push(kn); }
    // collapse pure wrappers (one child, no style of its own, same-ish rect)
    if (kids.length) node.k = kids;
    // collapse pure wrappers: one child, no own style/text/id, same rect (±2px) → return the child, remembering the wrapper class chain
    if (kids.length === 1 && !node.s && !node.text && !node.id) {
      const k = kids[0]; const same = Math.abs(k.r[0] - node.r[0]) <= 2 && Math.abs(k.r[1] - node.r[1]) <= 2 && Math.abs(k.r[2] - node.r[2]) <= 2 && Math.abs(k.r[3] - node.r[3]) <= 2;
      if (same) { k.via = [node.c || node.t, ...(k.via || [])].slice(0, 6); return k; }
    }
    return node;
  };
  const root = document.querySelector(mainSel) || document.querySelector('main') || document.body;
  const out = { url: location.href, width: innerWidth, docH: document.documentElement.scrollHeight, root: { sel: mainSel, tag: root.tagName.toLowerCase(), cls: norm(root.className), r: R(root) }, count: 0 };
  out.main = walk(root, 0);
  if (chrome) {
    const h = document.querySelector('header'); const f = document.querySelector('footer');
    out.header = h ? walk(h, 0) : null; out.footer = f ? walk(f, 0) : null;
  }
  out.count = count;
  // fixed / sticky elements anywhere
  out.fixed = [...document.querySelectorAll('body *')].filter((e) => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && vis(e); }).slice(0, 20).map((e) => ({ t: e.tagName.toLowerCase(), c: norm(e.className).slice(0, 80), pos: getComputedStyle(e).position, r: R(e), z: getComputedStyle(e).zIndex }));
  return out;
};

async function main() {
  const o = parseArgs(process.argv);
  const browser = o.headed ? await launchStealthHeaded(chromium) : await chromium.launch({ headless: true });
  const ctx = await newLiveContext(browser, { viewport: { width: o.width, height: 900 } });
  const page = await ctx.newPage();
  await gotoLive(page, o.url, { waitUntil: defaultWaitUntil(o.url), settleMs: 1500 });
  await dismissOverlays(page);
  await settle(page);
  await dismissOverlays(page, { lateWindowMs: 500 });
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(DUMP, { mainSel: o.main, depth: o.depth, chrome: o.chrome });
  data.dumpedAt = new Date().toISOString();
  await browser.close();
  const json = JSON.stringify(data);
  if (o.out) { mkdirSync(path.dirname(o.out), { recursive: true }); writeFileSync(o.out, json); console.log(`section-dump: wrote ${o.out} (${data.count} nodes, docH ${data.docH}, ${Math.round(json.length / 1024)} KB)`); }
  else console.log(json);
}
main().catch((e) => { console.error('section-dump error:', e.message); process.exit(1); });
