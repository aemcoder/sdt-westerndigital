/**
 * buy-direct — "Buy Direct from WD" strip: 4 icon items (icon, title, text, optional link) on the grey ground; the h2 and
 * the footnote are DEFAULT CONTENT around the block (D1). Schema: stardust/eds-schema/listing.json § buy-direct.
 * Authoring: one row per item, 2 cells: <picture> (76px icon) | <h3>Title</h3><p>text</p>[<p><a href>Shop Now</a></p>]
 * Variant `benefits` (recertified "Choose Recertified" strip): 3 columns, 96px icons, <p><strong> titles 20/22 500, no links;
 * the strip title is a default-content <p> (20/22 500, centred) — the live title is not a heading.
 * Authored nodes stay in their cells (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const row = document.createElement('div');
  row.className = 'buy-row';
  [...block.children].forEach((r, i) => {
    const [mediaCell, textCell] = r.children;
    r.className = `buy-item${i === 0 ? ' buy-item--first' : ''}`;
    if (mediaCell) { mediaCell.className = 'buy-img'; const img = mediaCell.querySelector('img'); if (img) { img.loading = 'lazy'; if (!img.alt) img.alt = ''; } }
    if (textCell) {
      textCell.className = 'buy-text';
      [...textCell.children].forEach((k, j) => {
        if (/^H[1-6]$/.test(k.tagName)) { const t = document.createElement('div'); t.className = 'buy-title'; k.replaceWith(t); t.append(k); }
        // `benefits` variant (Choose Recertified): the live titles are <p class="heading6">, authored as <p><strong>Title</strong></p>
        else if (j === 0 && k.tagName === 'P' && k.children.length === 1 && k.firstElementChild.tagName === 'STRONG') { const t = document.createElement('div'); t.className = 'buy-title'; k.replaceWith(t); t.append(k); }
        else if (k.tagName === 'P' && k.querySelector('a')) k.classList.add('buy-cta');
      });
    }
    row.append(r);
  });
  block.append(row);
}
