import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — westerndigital.com chrome, template-slotted from the /nav document.
 *
 * /nav sections (fixed contract):
 *   1. promo bar: <p>promo sentence <a>Learn More</a></p> <p><a>Shop</a> | <a>WD for Business</a></p>
 *   2. brand: <p><a href="/"><picture>logo</picture></a></p>
 *   3. nav: <ul><li>Products<ul><li><strong>Column title</strong><ul>links</ul>[<ul>second list → wide 5/12 column</ul>]</li>
 *            <li><strong>Text column title</strong><p>copy</p><p><strong|em><a>button</a></strong|em></p></li>…</ul>
 *            <p>band copy (<strong>lead</strong>)</p><p><em><a>outlined</a></em> <strong><a>filled</a></strong></p></li>…</ul>
 *   4. tools: <ul><li><a href="…">Sign in</a></li><li><a>Cart</a></li><li><a>Search</a></li></ul>
 *
 * Measured live behaviour (stardust/replica/motion/home.json, chrome-scroll-probe): body.minHeader once
 * scrollY > 0 → header pinned at top:-40px (promo bar scrolls off, nav row stays). Pages with a sub-nav
 * (program template) never pin the header — the subnav block adds body.has-subnav.
 * Authored elements are MOVED into the template (EW1); icons are fixed brand assets (inline SVG).
 */

const ICONS = {
  'sign in': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M16.1998 17.1V15.3C16.1998 14.3452 15.8205 13.4295 15.1454 12.7544C14.4703 12.0793 13.5546 11.7 12.5998 11.7H5.3998C4.44502 11.7 3.52935 12.0793 2.85422 12.7544C2.17909 13.4295 1.7998 14.3452 1.7998 15.3V17.1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.9998 8.1C10.9881 8.1 12.5998 6.48823 12.5998 4.5C12.5998 2.51177 10.9881 0.9 8.9998 0.9C7.01158 0.9 5.3998 2.51177 5.3998 4.5C5.3998 6.48823 7.01158 8.1 8.9998 8.1Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cart: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="19" viewBox="0 0 22 19" fill="none" aria-hidden="true"><path d="M9.08108 16.625C9.08108 16.9013 8.99915 17.1714 8.84564 17.4012C8.69213 17.6309 8.47393 17.81 8.21866 17.9157C7.96338 18.0215 7.68247 18.0491 7.41147 17.9952C7.14047 17.9413 6.89154 17.8082 6.69615 17.6129C6.50077 17.4175 6.36772 17.1686 6.31381 16.8975C6.2599 16.6265 6.28757 16.3456 6.39331 16.0904C6.49905 15.8351 6.67811 15.6169 6.90786 15.4634C7.13761 15.3099 7.40771 15.2279 7.68402 15.2279C8.05455 15.2279 8.40989 15.3751 8.67189 15.6371C8.93389 15.8991 9.08108 16.2545 9.08108 16.625ZM16.7649 15.2279C16.4886 15.2279 16.2185 15.3099 15.9887 15.4634C15.759 15.6169 15.5799 15.8351 15.4742 16.0904C15.3685 16.3456 15.3408 16.6265 15.3947 16.8975C15.4486 17.1686 15.5817 17.4175 15.777 17.6129C15.9724 17.8082 16.2214 17.9413 16.4924 17.9952C16.7634 18.0491 17.0443 18.0215 17.2995 17.9157C17.5548 17.81 17.773 17.6309 17.9265 17.4012C18.08 17.1714 18.162 16.9013 18.162 16.625C18.162 16.2545 18.0148 15.8991 17.7528 15.6371C17.4908 15.3751 17.1354 15.2279 16.7649 15.2279ZM20.9308 4.23832L18.692 12.2959C18.5689 12.736 18.3056 13.124 17.9421 13.401C17.5786 13.6781 17.1346 13.829 16.6776 13.8309H8.04726C7.58888 13.8307 7.14314 13.6805 6.77803 13.4034C6.41292 13.1263 6.14847 12.7373 6.02502 12.2959L2.96197 1.25735H1.39726C1.212 1.25735 1.03432 1.18375 0.903325 1.05275C0.772325 0.921755 0.69873 0.744081 0.69873 0.55882C0.69873 0.373558 0.772325 0.195885 0.903325 0.0648851C1.03432 -0.0661146 1.212 -0.139709 1.39726 -0.139709H3.49285C3.64557 -0.139739 3.79408 -0.0897196 3.91567 0.00269111C4.03725 0.0951018 4.1252 0.224811 4.16606 0.371963L4.99381 3.35294H20.2576C20.3652 3.35292 20.4715 3.37779 20.568 3.42563C20.6644 3.47346 20.7486 3.54295 20.8137 3.62867C20.8789 3.7144 20.9234 3.81403 20.9437 3.91978C20.964 4.02554 20.9596 4.13456 20.9308 4.23832ZM19.3381 4.75H5.38237L7.37405 11.9221C7.4149 12.0693 7.50285 12.199 7.62444 12.2914C7.74602 12.3838 7.89454 12.4338 8.04726 12.4338H16.6776C16.8303 12.4338 16.9788 12.3838 17.1004 12.2914C17.222 12.199 17.3099 12.0693 17.3508 11.9221L19.3381 4.75Z" fill="currentColor"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><g clip-path="url(#wd-search-clip)"><path d="M7.3125 0C3.28 0 0 3.28 0 7.3125C0 11.345 3.28 14.625 7.3125 14.625C9.0525 14.625 10.6525 14.01 11.9125 12.9875L16.35 17.425C16.5 17.575 16.6875 17.6375 16.875 17.6375C17.0625 17.6375 17.25 17.575 17.4 17.425C17.6875 17.1375 17.6875 16.6625 17.4 16.375L12.9625 11.9375C13.9875 10.6775 14.625 9.0525 14.625 7.3125C14.625 3.28 11.345 0 7.3125 0ZM7.3125 13.125C4.1075 13.125 1.5 10.5175 1.5 7.3125C1.5 4.1075 4.1075 1.5 7.3125 1.5C10.5175 1.5 13.125 4.1075 13.125 7.3125C13.125 10.5175 10.5175 13.125 7.3125 13.125Z" fill="currentColor"/></g><defs><clipPath id="wd-search-clip"><rect width="18" height="18" fill="white"/></clipPath></defs></svg>',
};

const isDesktop = window.matchMedia('(min-width: 768px)');

function iconFor(label) {
  const key = label.trim().toLowerCase();
  if (key.includes('cart')) return ICONS.cart;
  if (key.includes('search')) return ICONS.search;
  return ICONS['sign in'];
}

function toggleMenu(nav, force) {
  const expanded = force !== undefined ? !force : nav.getAttribute('aria-expanded') === 'true';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = expanded || isDesktop.matches ? '' : 'hidden';
  const burger = nav.querySelector('.nav-hamburger button');
  if (burger) burger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
}

function closeAllDrops(nav, except) {
  nav.querySelectorAll('.nav-sections > ul > li').forEach((li) => {
    if (li !== except) li.setAttribute('aria-expanded', 'false');
  });
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.className = 'header-inner';
  const sections = [];
  while (fragment.firstElementChild) sections.push(fragment.removeChild(fragment.firstElementChild));
  sections.forEach((section) => {
    section.querySelectorAll(':scope > .default-content-wrapper').forEach((w) => w.replaceWith(...w.childNodes));
  });
  const [promo, brand, links, tools] = sections;

  // 1. promo bar — 40px, dark ground; the two authored <p>s move into text / links slots
  const promoBar = document.createElement('div');
  promoBar.className = 'nav-promo';
  const promoWrap = document.createElement('div');
  promoWrap.className = 'contain';
  if (promo) {
    const ps = [...promo.querySelectorAll('p')];
    const text = document.createElement('div');
    text.className = 'nav-promo-text';
    if (ps[0]) text.append(ps[0]);
    const right = document.createElement('div');
    right.className = 'nav-promo-links';
    ps.slice(1).forEach((p) => right.append(p));
    promoWrap.append(text, right);
  }
  promoBar.append(promoWrap);

  // 2. nav row — hamburger, brand, sections, tools
  const row = document.createElement('div');
  row.className = 'nav-row';
  const rowWrap = document.createElement('div');
  rowWrap.className = 'contain';

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Main Menu" aria-expanded="false"><span class="nav-hamburger-icon"><span></span><span></span><span></span></span></button>';
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  const brandEl = document.createElement('div');
  brandEl.className = 'nav-brand';
  if (brand) {
    const pic = brand.querySelector('picture, img');
    const link = brand.querySelector('a');
    if (link && pic) {
      // authored <a><picture> — keep the anchor, drop stray text
      link.replaceChildren(pic);
      brandEl.append(link);
    } else if (pic) brandEl.append(pic);
    const img = brandEl.querySelector('img');
    if (img) { img.setAttribute('alt', img.getAttribute('alt') || 'Western Digital'); img.loading = 'eager'; }
  }

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (links) {
    const ul = links.querySelector('ul');
    if (ul) {
      navSections.append(ul);
      ul.querySelectorAll(':scope > li').forEach((li) => {
        const sub = li.querySelector(':scope > ul');
        // the label is the li's own text node(s) — wrap in a button-like trigger without rebuilding text
        const label = document.createElement('span');
        label.className = 'nav-drop-label';
        // the label is the li's own text node(s); the publish pipeline wraps that text in a <p> when the li
        // also holds a nested <ul> (published-origin regime, not seen in the harness) — move the nodes either way
        for (const n of [...li.childNodes]) {
          if (n.nodeType === 1 && n.tagName === 'UL') break; // everything after the columns list is the band
          if (n.nodeType === 3) label.append(n);
          else if (n.nodeType === 1 && n.tagName === 'P') { label.append(...n.childNodes); n.remove(); }
        }
        li.prepend(label);
        if (sub) {
          li.classList.add('nav-drop');
          li.setAttribute('aria-expanded', 'false');
          li.tabIndex = 0;
          // panel = full-width flyout (measured live: absolute under the 56px row, white, 1px #e6e6e6 bottom rule):
          // .contain > ul.nav-mega (columns row) + optional .nav-band from the li's trailing <p>s
          const panel = document.createElement('div');
          panel.className = 'nav-panel';
          const wrap = document.createElement('div');
          wrap.className = 'contain';
          sub.classList.add('nav-mega');
          sub.querySelectorAll(':scope > li').forEach((col) => {
            col.classList.add('nav-col');
            col.querySelectorAll(':scope > p').forEach((pEl) => { if (pEl.querySelector('strong') && pEl.textContent.trim() === pEl.querySelector('strong').textContent.trim() && !pEl.querySelector('a')) pEl.replaceWith(...pEl.childNodes); });
            const lists = [...col.querySelectorAll(':scope > ul')];
            if (lists.length > 1) {
              // live: 5/12 column with the links split across two lists
              col.classList.add('wide');
              const group = document.createElement('div');
              group.className = 'nav-col-lists';
              lists[0].before(group);
              lists.forEach((l) => group.append(l));
            } else if (!lists.length) {
              // live: text column ("Need help from an expert?") — title, copy, one button
              col.classList.add('wide', 'text-col');
            }
            col.querySelectorAll(':scope > p > :is(em, strong) > a').forEach((a) => {
              a.classList.add('button', a.parentElement.tagName === 'STRONG' ? 'primary' : 'secondary');
              a.parentElement.replaceWith(a);
              a.parentElement.classList.add('button-wrapper');
            });
          });
          wrap.append(sub);
          panel.append(wrap);
          const bandPs = [...li.children].filter((c) => c.tagName === 'P');
          if (bandPs.length) {
            const band = document.createElement('div');
            band.className = 'nav-band';
            const bw = document.createElement('div');
            bw.className = 'contain';
            const text = document.createElement('div');
            text.className = 'nav-band-text';
            text.append(bandPs[0]);
            bw.append(text);
            const actionPs = bandPs.slice(1).filter((pEl) => pEl.querySelector('a'));
            if (actionPs.length) {
              const actions = document.createElement('div');
              actions.className = 'nav-band-actions';
              actionPs.forEach((pEl) => {
                pEl.querySelectorAll(':scope > :is(em, strong) > a').forEach((a) => {
                  a.classList.add('button', a.parentElement.tagName === 'STRONG' ? 'primary' : 'secondary');
                  a.parentElement.replaceWith(a);
                });
                pEl.classList.add('button-wrapper');
                actions.append(pEl);
              });
              bw.append(actions);
              band.classList.add(actions.querySelectorAll('a').length === 1 ? 'single' : 'pair');
            } else {
              band.classList.add('text-only');
              bandPs.slice(1).forEach((pEl) => text.append(pEl));
            }
            band.append(bw);
            panel.append(band);
          }
          li.append(panel);
          const open = (state) => { closeAllDrops(ul, li); li.setAttribute('aria-expanded', state ? 'true' : 'false'); };
          label.addEventListener('click', () => open(li.getAttribute('aria-expanded') !== 'true'));
          li.addEventListener('mouseenter', () => { if (isDesktop.matches) open(true); });
          li.addEventListener('mouseleave', () => { if (isDesktop.matches) open(false); });
          li.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(li.getAttribute('aria-expanded') !== 'true'); } if (e.key === 'Escape') open(false); });
        }
      });
    }
  }

  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  if (tools) {
    tools.querySelectorAll('a').forEach((a) => {
      const label = a.textContent;
      a.setAttribute('aria-label', label.trim());
      const span = document.createElement('span');
      span.className = 'nav-tool-label';
      while (a.firstChild) span.append(a.firstChild);
      a.append(span);
      a.insertAdjacentHTML('afterbegin', iconFor(label));
      a.classList.add(`nav-tool-${label.trim().toLowerCase().split(/\s+/)[0]}`);
      navTools.append(a);
    });
  }

  rowWrap.append(hamburger, brandEl, navSections, navTools);
  row.append(rowWrap);
  nav.append(promoBar, row);
  block.append(nav);

  // scroll-state machine (measured live): body.minHeader when scrollY > 0, unless a sub-nav owns the pin
  const onScroll = () => {
    if (document.body.classList.contains('has-subnav')) return;
    document.body.classList.toggle('minHeader', (window.scrollY || 0) > 0);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  isDesktop.addEventListener('change', () => toggleMenu(nav, false));
}
