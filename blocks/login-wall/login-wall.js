/**
 * login-wall — the anonymous render of a members-only page (tiered pricing): photo + 40% overlay, a white 739px card with logo,
 * h1, gate copy, Sign in / Register buttons, a rule, and a 3-up icon strip; a close ✕ links back to the parent page.
 * Authoring rows: 1) <picture> background | <p><a href=parent>Close</a></p>  2) <picture> logo | h1 p p<em><a>Sign in</a></em> p<strong><a>Register</a></strong>
 *   3) h2 + p (strip head)  4+) <picture> icon | h3 p (one per benefit). Authored nodes are MOVED into slots (EW1). @ew-exempt none.
 */
const CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" aria-hidden="true"><path d="M3 3l15 15M18 3L3 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/** consecutive buttonized paragraphs (<p class="button-wrapper">) sit side by side on the live site → one flex row */
function groupButtons(root) {
  [...root.querySelectorAll('p.button-wrapper')].forEach((p) => {
    if (p.previousElementSibling?.classList.contains('actions')) { p.previousElementSibling.append(p); return; }
    if (p.nextElementSibling?.classList.contains('button-wrapper')) { const a = document.createElement('div'); a.className = 'actions'; p.replaceWith(a); a.append(p); }
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  const bg = document.createElement('div'); bg.className = 'lw-bg';
  const card = document.createElement('div'); card.className = 'lw-card';
  const [bgRow, headRow, stripHead, ...items] = rows;
  const bgPic = bgRow?.children[0]?.querySelector('picture, img');
  if (bgPic) { const img = bgPic.tagName === 'IMG' ? bgPic : bgPic.querySelector('img'); if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); } bg.append(bgPic); }
  const closeLink = bgRow?.children[1]?.querySelector('a');
  if (closeLink) { closeLink.className = 'lw-close'; closeLink.setAttribute('aria-label', closeLink.textContent.trim() || 'Close'); closeLink.innerHTML = CLOSE; card.append(closeLink); }
  if (headRow) {
    const [logoCell, copyCell] = headRow.children;
    const logo = logoCell?.querySelector('picture, img');
    if (logo) { const l = document.createElement('div'); l.className = 'lw-logo'; l.append(logo); card.append(l); }
    if (copyCell) { copyCell.className = 'lw-copy'; groupButtons(copyCell); card.append(copyCell); }
  }
  if (stripHead) { const s = stripHead.children[0]; if (s) { s.className = 'lw-strip-head'; card.append(s); } }
  if (items.length) {
    const strip = document.createElement('div'); strip.className = 'lw-strip';
    items.forEach((r) => { const [ic, tx] = r.children; const it = document.createElement('div'); it.className = 'lw-item'; const pic = ic?.querySelector('picture, img'); if (pic) it.append(pic); if (tx) { tx.className = 'lw-item-text'; it.append(tx); } strip.append(it); });
    card.append(strip);
  }
  const wrap = document.createElement('div'); wrap.className = 'lw-wrap'; wrap.append(card);
  block.replaceChildren(bg, wrap);
}
