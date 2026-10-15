/**
 * split-band — alternating 50/50 photo + text bands (program template; corporate-responsibility has 8).
 * Schema: stardust/eds-schema/corporate-responsibility.json § mainContainWrap (band ×8).
 *
 * Authoring rows — 2 cells: <picture> | <p>EYEBROW</p><h3>title</h3><p>body…</p><ul>…</ul><p><strong><a>Learn More</a></strong></p>
 *   Alternation is structural: even rows image-left, odd rows image-right (live md:order-2) — index-based (#61).
 *   Row 1 is top-aligned, the rest vertically centred (measured live). A <p><a href="….pdf"> renders as the
 *   site's download link (icon + underline) — attribute-based, no class on the authored anchor (EW2).
 * Variant `promo-tiles` (weekly-sale): 2-up grid of 546×300 grey cards, copy left / image right at every index (no
 *   alternation), optional <p>★★★★★</p> opener kept as the eyebrow, outlined CTA. Same authoring rows.
 * Authored nodes are MOVED (EW1). @ew-exempt none.
 */
const DOWNLOAD = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" aria-hidden="true"><path d="M480-336 288-528l51-51 105 105v-286h72v286l105-105 51 51-192 192ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>';

export default function decorate(block) {
  [...block.children].forEach((row, i) => {
    row.classList.add('band');
    if (i === 0) row.classList.add('band-top');
    if (i % 2 === 1) row.classList.add('band-reverse');
    const [mediaCell, textCell] = row.children;
    if (mediaCell) {
      mediaCell.classList.add('band-media');
      const img = mediaCell.querySelector('img');
      if (img) img.loading = i === 0 ? 'eager' : 'lazy';
    }
    if (textCell) {
      textCell.classList.add('band-text');
      const body = document.createElement('div');
      body.className = 'band-body';
      const kids = [...textCell.children];
      const first = kids[0];
      const hasEyebrow = !!(first && first.tagName === 'P' && !first.querySelector('a')); // eyebrow only when the band opens with a plain <p>
      if (hasEyebrow) { const eyebrow = document.createElement('div'); eyebrow.className = 'eyebrow'; eyebrow.append(first); body.append(eyebrow); }
      const col = document.createElement('div');
      col.className = 'textcolumn';
      const actions = document.createElement('div');
      actions.className = 'actions';
      kids.slice(hasEyebrow ? 1 : 0).forEach((k) => {
        if (/^H[1-6]$/.test(k.tagName)) { const t = document.createElement('div'); t.className = 'title'; t.append(k); body.append(t); }
        else if (k.tagName === 'P' && k.querySelector('a')) {
          const a = k.querySelector('a');
          if (/\.pdf(\?|$)/i.test(a.getAttribute('href') || '')) { k.classList.add('download-wrap'); a.insertAdjacentHTML('afterbegin', DOWNLOAD); }
          actions.append(k);
        } else col.append(k);
      });
      if (col.children.length) body.append(col);
      if (actions.children.length) body.append(actions);
      textCell.append(body);
    }
  });
}
