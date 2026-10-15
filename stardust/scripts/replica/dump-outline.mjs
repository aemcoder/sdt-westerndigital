#!/usr/bin/env node
// dump-outline.mjs — print a section-dump JSON as an indented text outline (authoring map).
// usage: node dump-outline.mjs <dump.json> [--part main|header|footer] [--skip-clones]
import { readFileSync } from 'node:fs';
const [file, ...rest] = process.argv.slice(2);
const part = rest.includes('--part') ? rest[rest.indexOf('--part') + 1] : 'main';
const skipClones = rest.includes('--skip-clones');
const d = JSON.parse(readFileSync(file));
const out = [];
function line(n, depth) {
  if (skipClones && /splide__slide--clone/.test(n.c || '')) return;
  const ind = '  '.repeat(depth);
  const s = n.s ? Object.entries(n.s).map(([k, v]) => `${k}=${v}`).join(' ') : '';
  const via = n.via ? ` «${n.via.join('>')}»` : '';
  let extra = '';
  if (n.src) extra += ` src=${n.src}${n.alt !== undefined ? ` alt="${n.alt}"` : ''}${n.nat ? ` nat=${n.nat.join('x')}` : ''}`;
  if (n.svg) extra += ` svg(${n.svg}b vb=${n.vb}${n.aria ? ' aria=' + n.aria : ''})`;
  if (n.href !== undefined) extra += ` href=${n.href}`;
  if (n.aria && !n.svg) extra += ` aria="${n.aria}"`;
  if (n.f) extra += ` f[${n.f}]`;
  if (n.text) extra += ` "${n.text}"`;
  if (n.inner) extra += ` inner(${n.inner})`;
  if (n.trunc) extra += ' …TRUNC';
  out.push(`${ind}${n.t}${n.c ? '.' + n.c.split(' ').slice(0, 4).join('.') : ''}${n.id ? '#' + n.id : ''}${via} [${n.r.join(' ')}]${s ? ' {' + s + '}' : ''}${extra}`);
  for (const k of n.k || []) line(k, depth + 1);
}
const root = part === 'main' ? d.main : d[part];
out.push(`# ${d.url} @${d.width} docH=${d.docH} part=${part}`);
if (root) line(root, 0);
if (part === 'main' && d.fixed) out.push('# fixed/sticky: ' + JSON.stringify(d.fixed));
console.log(out.join('\n'));
