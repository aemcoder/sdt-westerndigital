#!/usr/bin/env node
/**
 * css-lift.mjs — project-owned instrument for replica Phase 3 (§ CSS lifting).
 *
 * Lifts EXACT values from a live page's computed styles at one viewport width:
 *   - @font-face declarations reachable from document.styleSheets (family, src, weight, style, display)
 *   - body text-rendering group (text-rendering, -webkit-font-smoothing, font-synthesis, font-kerning)
 *   - palette frequency (background-color / color / border-color of visible elements, weighted by count)
 *   - type ramp per tag (h1..h6, p, li, a, button, small, label): family / size / weight / lh / ls / transform
 *   - border-radius and box-shadow frequency
 *   - button specs (button, [role=button], a[class*=btn], a[class*=button], input[type=submit])
 *   - container candidates: centered boxes whose width < viewport, grouped by width
 *   - section anchors: top-level children of the content root with [y, height], bg, class, first heading
 *   - header / footer rects, position, background
 *   - background-image layer lists on elements carrying a photo (gradient scrims!)
 *
 * Usage: node stardust/scripts/replica/css-lift.mjs <url> --width 1440 --out <file.json> [--main <sel>] [--headed]
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { newLiveContext, gotoLive, dismissOverlays, launchStealthHeaded, defaultWaitUntil } from '../diff/live-session.mjs';

function parseArgs(argv) {
  const o = { width: 1440, main: null, headed: false, out: null, settle: true };
  const rest = argv.slice(2);
  for (let i = 0; i < rest.length; i += 1) {
    const a = rest[i];
    if (!o.url && !a.startsWith('--')) o.url = a;
    else if (a === '--width') o.width = Number(rest[i += 1]);
    else if (a === '--out') o.out = rest[i += 1];
    else if (a === '--main') o.main = rest[i += 1];
    else if (a === '--headed') o.headed = true;
    else if (a === '--no-settle') o.settle = false;
  }
  if (!o.url) { console.error('usage: css-lift.mjs <url> --width N --out file.json'); process.exit(2); }
  return o;
}

async function settle(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewportSize().height;
  for (let y = 0; y < h; y += vh) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(250); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}

const LIFT = (mainSel) => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const norm = (c) => c && c.replace(/\s+/g, ' ').trim();
  const isColor = (c) => c && !/rgba\([^)]*,\s*0\)$/.test(c) && c !== 'transparent';
  const inc = (m, k, w = 1) => { if (!k) return; m[k] = (m[k] || 0) + w; };
  const top = (m, n = 12) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([value, count]) => ({ value, count }));

  const out = { url: location.href, width: innerWidth, docHeight: document.documentElement.scrollHeight };
  // fonts
  out.fontFaces = [];
  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const r of rules) {
      if (r instanceof CSSFontFaceRule) {
        const s = r.style;
        out.fontFaces.push({ family: s.getPropertyValue('font-family'), src: s.getPropertyValue('src').slice(0, 300), weight: s.getPropertyValue('font-weight'), style: s.getPropertyValue('font-style'), display: s.getPropertyValue('font-display'), sheet: ss.href });
      }
    }
  }
  out.fontsLoaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`);
  const bcs = getComputedStyle(document.body);
  out.textRendering = { textRendering: bcs.textRendering, webkitFontSmoothing: bcs.webkitFontSmoothing, fontSynthesis: bcs.fontSynthesis, fontKerning: bcs.fontKerning, fontFamily: bcs.fontFamily, fontSize: bcs.fontSize, lineHeight: bcs.lineHeight, color: bcs.color, background: bcs.backgroundColor };
  // palette + radii + shadows
  const bg = {}, fg = {}, bd = {}, radii = {}, shadows = {}, families = {};
  const all = [...document.querAll ? [] : document.querySelectorAll('body *')].filter(vis);
  for (const el of all.slice(0, 6000)) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (isColor(cs.backgroundColor)) inc(bg, norm(cs.backgroundColor), 1);
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) inc(fg, norm(cs.color), 1);
    if (cs.borderTopWidth !== '0px' && isColor(cs.borderTopColor)) inc(bd, norm(cs.borderTopColor), 1);
    if (cs.borderTopLeftRadius !== '0px') inc(radii, cs.borderTopLeftRadius, 1);
    if (cs.boxShadow !== 'none') inc(shadows, norm(cs.boxShadow), 1);
    inc(families, cs.fontFamily, 1);
    void r;
  }
  out.palette = { background: top(bg), text: top(fg), border: top(bd) };
  out.radii = top(radii); out.shadows = top(shadows, 8); out.families = top(families, 8);
  // type ramp
  const ramp = {};
  for (const tag of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'a', 'button', 'small', 'label', 'span']) {
    const m = {};
    for (const el of [...document.querySelectorAll(tag)].filter(vis).slice(0, 400)) {
      const cs = getComputedStyle(el);
      const key = `${cs.fontFamily.split(',')[0].replace(/"/g, '')} | ${cs.fontSize} | ${cs.fontWeight} | ${cs.lineHeight} | ${cs.letterSpacing} | ${cs.textTransform} | ${norm(cs.color)}`;
      inc(m, key, 1);
    }
    ramp[tag] = top(m, 6);
  }
  out.typeRamp = ramp;
  // buttons
  const btns = [...document.querySelectorAll('button, [role=button], a[class*="btn" i], a[class*="button" i], input[type=submit]')].filter(vis).slice(0, 200);
  const bm = {};
  for (const b of btns) {
    const cs = getComputedStyle(b); const r = b.getBoundingClientRect();
    const key = JSON.stringify({ bg: norm(cs.backgroundColor), color: norm(cs.color), border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${norm(cs.borderTopColor)}`, radius: cs.borderTopLeftRadius, padding: cs.padding, font: `${cs.fontFamily.split(',')[0]} ${cs.fontSize}/${cs.lineHeight} ${cs.fontWeight}`, ls: cs.letterSpacing, tt: cs.textTransform, h: Math.round(r.height), cls: (b.className || '').toString().slice(0, 80) });
    inc(bm, key, 1);
  }
  out.buttons = top(bm, 12).map((e) => ({ ...JSON.parse(e.value), count: e.count }));
  // containers
  const cm = {};
  for (const el of all.slice(0, 6000)) {
    const r = el.getBoundingClientRect();
    if (r.width < innerWidth - 40 && r.width > 600 && Math.abs((r.left + r.width / 2) - innerWidth / 2) < 3) {
      const cs = getComputedStyle(el);
      inc(cm, `${Math.round(r.width)} | max-width:${cs.maxWidth} | padding:${cs.paddingLeft}/${cs.paddingRight} | .${(el.className || '').toString().split(' ')[0]}`, 1);
    }
  }
  out.containers = top(cm, 10);
  // header / footer
  const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { y: Math.round(r.top + scrollY), h: Math.round(r.height), position: cs.position, bg: norm(cs.backgroundColor), tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 120) }; };
  out.header = rect(document.querySelector('header, [role=banner]'));
  out.footer = rect(document.querySelector('footer, [role=contentinfo]'));
  // sections
  const root = (mainSel && document.querySelector(mainSel)) || document.querySelector('main') || document.body;
  out.contentRoot = { sel: mainSel, tag: root.tagName.toLowerCase(), cls: (root.className || '').toString().slice(0, 120), id: root.id };
  out.sections = [...root.children].filter(vis).map((el) => {
    const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const h = el.querySelector('h1,h2,h3,h4');
    return { y: Math.round(r.top + scrollY), h: Math.round(r.height), tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 100), id: el.id, bg: norm(cs.backgroundColor), pad: `${cs.paddingTop}/${cs.paddingBottom}`, heading: h ? `${h.tagName.toLowerCase()}: ${h.textContent.trim().slice(0, 60)}` : null, imgs: el.querySelectorAll('img').length };
  });
  // photo layers with gradient scrims
  out.photoLayers = [];
  for (const el of all.slice(0, 6000)) {
    const cs = getComputedStyle(el);
    if (cs.backgroundImage && cs.backgroundImage !== 'none' && /url\(/.test(cs.backgroundImage)) {
      const r = el.getBoundingClientRect();
      if (r.width > 300) out.photoLayers.push({ cls: (el.className || '').toString().slice(0, 80), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height), image: cs.backgroundImage.slice(0, 400), size: cs.backgroundSize, pos: cs.backgroundPosition });
    }
    if (out.photoLayers.length > 40) break;
  }
  return out;
};

async function main() {
  const o = parseArgs(process.argv);
  const browser = o.headed ? await launchStealthHeaded(chromium) : await chromium.launch({ headless: true });
  const ctx = await newLiveContext(browser, { viewport: { width: o.width, height: 900 } });
  const page = await ctx.newPage();
  await gotoLive(page, o.url, { waitUntil: defaultWaitUntil(o.url), settleMs: 1500 });
  await dismissOverlays(page);
  if (o.settle) await settle(page);
  await dismissOverlays(page, { lateWindowMs: 500 });
  await page.evaluate(() => document.fonts.ready);
  const data = await page.evaluate(LIFT, o.main);
  data.liftedAt = new Date().toISOString();
  await browser.close();
  const json = JSON.stringify(data, null, 1);
  if (o.out) { mkdirSync(path.dirname(o.out), { recursive: true }); writeFileSync(o.out, json); console.log(`css-lift: wrote ${o.out} (${data.sections.length} sections, ${data.fontFaces.length} font-faces, docH ${data.docHeight})`); }
  else console.log(json);
}
main().catch((e) => { console.error('css-lift error:', e.message); process.exit(1); });
