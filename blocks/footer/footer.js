import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — westerndigital.com chrome, template-slotted from the /footer document.
 *
 * /footer sections (fixed contract):
 *   1. top: <p><a href="/"><picture>logo</picture></a></p> <p>Country/Region: <a href="/region-selector">United States</a></p>
 *   2–5. one section per link column: <p>Heading</p><ul><li><a>…</a></li>…</ul>
 *        (the Support column also carries <p>Online Store Support:<br>…</p>, a social <ul> of links and <p><a><picture>badge</picture></a></p>)
 *   6. legal: <ul><li><a>Privacy</a></li>…</ul><p>© 2026 …</p>
 * Social icons are fixed brand assets keyed by link host (inline SVG). Authored nodes are MOVED (EW1).
 */

const SOCIAL = {
  'instagram.com': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.9.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.9.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.9-.9-1.4-.2-.4-.4-1.1-.4-2.2-.1-1.3-.1-1.6-.1-4.8s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.9-.7 1.4-.9.4-.2 1.1-.4 2.2-.4 1.2-.1 1.6-.1 4.8-.1M12 0C8.7 0 8.3 0 7.1.1 5.8.1 4.9.3 4.1.6c-.8.3-1.5.7-2.2 1.4C1.3 2.7.9 3.4.6 4.2.3 5 .1 5.9.1 7.2 0 8.4 0 8.8 0 12s0 3.6.1 4.9c.1 1.3.3 2.2.6 2.9.3.8.7 1.5 1.4 2.2.7.7 1.4 1.1 2.2 1.4.8.3 1.7.5 2.9.6 1.2.1 1.6.1 4.9.1s3.6 0 4.9-.1c1.3-.1 2.2-.3 2.9-.6.8-.3 1.5-.7 2.2-1.4.7-.7 1.1-1.4 1.4-2.2.3-.8.5-1.7.6-2.9.1-1.2.1-1.6.1-4.9s0-3.6-.1-4.9c-.1-1.3-.3-2.2-.6-2.9-.3-.8-.7-1.5-1.4-2.2C21.3 1.3 20.6.9 19.8.6 19 .3 18.1.1 16.9.1 15.6 0 15.2 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>',
  'linkedin.com': '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" role="img" aria-hidden="true" viewBox="0 0 24 24"><path d="M4.674 6.799H.254v13.31h4.42V6.8zM2.463.19C.984.19.023 1.16.023 2.437c0 1.248.933 2.246 2.384 2.246h.028c1.507 0 2.445-.998 2.445-2.246C4.851 1.16 3.942.19 2.463.19zm14.66 6.296c-2.347 0-3.397 1.29-3.984 2.196V6.799H8.72c.058 1.248 0 13.31 0 13.31h4.42v-7.434c0-.397.03-.794.146-1.079.32-.794 1.047-1.617 2.268-1.617 1.6 0 2.239 1.22 2.239 3.007v7.123h4.42v-7.634c0-4.087-2.181-5.99-5.09-5.99z"/></svg>',
  'x.com': '<svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 22 19" fill="currentColor" aria-hidden="true"><path d="M17.3 0h3.4l-7.4 8.5L22 19h-6.8l-5.3-6.9L3.8 19H.4l7.9-9L0 0h7l4.8 6.3L17.3 0zm-1.2 17h1.9L5.9 1.9H3.9L16.1 17z"/></svg>',
  'facebook.com': '<svg width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" viewBox="0 0 24 24"><path d="M19.65.21H1.35A1.14 1.14 0 0 0 .21 1.35v18.3a1.14 1.14 0 0 0 1.14 1.14h9.85v-7.96H8.52V9.7h2.68V7.41c0-2.66 1.62-4.1 3.99-4.1 1.13 0 2.11.08 2.39.12v2.78h-1.64c-1.29 0-1.54.61-1.54 1.51V9.7h3.08l-.4 3.13h-2.68v7.96h5.25a1.14 1.14 0 0 0 1.14-1.14V1.35A1.14 1.14 0 0 0 19.65.21z"/></svg>',
  'youtube.com': '<svg width="24" height="24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" viewBox="0 0 39 30"><path d="M28.17 14.08a1.39 1.39 0 0 1-.63 1.19l-11.8 7.36a1.4 1.4 0 0 1-2.13-1.19V6.7a1.4 1.4 0 0 1 2.13-1.19l11.8 7.37a1.39 1.39 0 0 1 .63 1.2zM38.2 6.28a10.2 10.2 0 0 0-1.85-4.68A6.6 6.6 0 0 0 31.7.05C25.19 0 19.5 0 19.5 0S13.81 0 7.3.05A6.6 6.6 0 0 0 2.65 1.6 10.2 10.2 0 0 0 .8 6.28 76 76 0 0 0 0 15a76 76 0 0 0 .8 8.72 10.2 10.2 0 0 0 1.85 4.68 6.6 6.6 0 0 0 4.65 1.55c6.51.05 12.2.05 12.2.05s5.69 0 12.2-.05a6.6 6.6 0 0 0 4.65-1.55 10.2 10.2 0 0 0 1.85-4.68A76 76 0 0 0 39 15a76 76 0 0 0-.8-8.72z"/></svg>',
};

function wrap(className, ...nodes) {
  const div = document.createElement('div');
  div.className = className;
  nodes.filter(Boolean).forEach((n) => div.append(n));
  return div;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const sections = [];
  while (fragment.firstElementChild) sections.push(fragment.firstElementChild);
  const top = sections[0];
  const legal = sections[sections.length - 1];
  const cols = sections.slice(1, -1);

  const main = document.createElement('div');
  main.className = 'footer-main';
  const mainWrap = wrap('contain');

  // top row: logo + region
  const topRow = wrap('footer-top');
  if (top) {
    const ps = [...top.querySelectorAll('p')];
    const logoP = ps.find((p) => p.querySelector('picture, img'));
    const regionP = ps.find((p) => p !== logoP);
    if (logoP) topRow.append(wrap('footer-logo', logoP));
    if (regionP) topRow.append(wrap('footer-region', regionP));
  }
  mainWrap.append(topRow);

  // link columns
  const colsRow = wrap('footer-cols');
  cols.forEach((section) => {
    const col = wrap('footer-col');
    const inner = wrap('footer-col-inner');
    [...section.children].forEach((child) => {
      if (child.tagName === 'UL' && [...child.querySelectorAll('a')].some((a) => Object.keys(SOCIAL).some((h) => a.href.includes(h)))) {
        // social list → icon row (link text stays as the accessible label)
        child.classList.add('footer-social');
        child.querySelectorAll('a').forEach((a) => {
          const host = Object.keys(SOCIAL).find((h) => a.href.includes(h));
          a.setAttribute('aria-label', a.textContent.trim());
          const label = document.createElement('span');
          label.className = 'footer-social-label';
          while (a.firstChild) label.append(a.firstChild);
          a.append(label);
          if (host) { a.insertAdjacentHTML('afterbegin', SOCIAL[host]); a.classList.add(`social-${host.split('.')[0]}`); }
        });
        inner.append(wrap('fc-block', child));
      } else if (child.tagName === 'P' && child.querySelector('picture, img')) {
        child.classList.add('footer-badge');
        inner.append(wrap('fc-block', child));
      } else if (child.tagName === 'P' && inner.children.length > 0) {
        inner.append(wrap('fc-block', child));
      } else {
        inner.append(child);
      }
    });
    col.append(inner);
    colsRow.append(col);
  });
  mainWrap.append(colsRow);
  main.append(mainWrap);

  const legalEl = document.createElement('div');
  legalEl.className = 'footer-legal';
  const legalWrap = wrap('contain');
  if (legal) while (legal.firstElementChild) legalWrap.append(legal.firstElementChild);
  legalEl.append(legalWrap);

  block.append(main, legalEl);
}
