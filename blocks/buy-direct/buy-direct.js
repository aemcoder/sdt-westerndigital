/**
 * buy-direct — "Buy Direct from WD" strip: 4 icon items (icon, title, text, optional link) on the grey ground; the h2 and
 * the footnote are DEFAULT CONTENT around the block (D1). Schema: stardust/eds-schema/listing.json § buy-direct.
 * Authoring: one row per item, 2 cells: <picture> (76px icon) | <h3>Title</h3><p>text</p>[<p><a href>Shop Now</a></p>]
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
      [...textCell.children].forEach((k) => {
        if (/^H[1-6]$/.test(k.tagName)) { const t = document.createElement('div'); t.className = 'buy-title'; k.replaceWith(t); t.append(k); }
        else if (k.tagName === 'P' && k.querySelector('a')) k.classList.add('buy-cta');
      });
    }
    row.append(r);
  });
  block.append(row);
}
