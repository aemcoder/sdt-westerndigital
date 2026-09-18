#!/usr/bin/env node
// chrome-scroll-probe.mjs — measure the live header's scroll-state machine: at each scrollY sample
// (down, then up) dump body class + computed geometry of header / promo bar / nav bar / sticky subnav.
import { chromium } from 'playwright';
import { newLiveContext, gotoLive, dismissOverlays, defaultWaitUntil } from '../diff/live-session.mjs';
const [url, width] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await newLiveContext(b, { viewport: { width: +(width || 1440), height: 900 } });
const p = await ctx.newPage(); await gotoLive(p, url, { waitUntil: defaultWaitUntil(url), settleMs: 1500 }); await dismissOverlays(p);
const sample = async (y) => { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(700);
  return p.evaluate((yy) => { const g = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { top: Math.round(r.top), h: Math.round(r.height), pos: cs.position, cssTop: cs.top, tf: cs.transform, vis: cs.visibility, disp: cs.display, z: cs.zIndex, op: cs.opacity, bg: cs.backgroundColor, ovf: cs.overflow, maxH: cs.maxHeight }; };
    return { y: yy, body: document.body.className, header: g('header.header'), promo: g('.header-promo-bar'), nav: g('.header-nav-bar, header .header-nav-bar, header section:nth-of-type(2)'), sticky: g('#sticky-nav'), subnavWrap: g('.subnav2-0, .subnav') }; }, y); };
const out = [];
for (const y of [0, 50, 100, 150, 200, 300, 400, 600, 1200]) out.push(await sample(y));
for (const y of [1000, 600, 300, 150, 100, 50, 0]) out.push(await sample(y));
console.log(JSON.stringify(out, null, 0).replace(/\},\{"y"/g, '},\n{"y"'));
await b.close();
