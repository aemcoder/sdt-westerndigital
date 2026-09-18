/**
 * resource-cards — "Helpful Resources": 3 grey r16 cards (h3 + p + "Read More" link). The h2 head is DEFAULT CONTENT
 * before the block (D1). Schema: stardust/eds-schema/listing.json § resources.
 * Authoring: one row per card, one cell: <h3>Title</h3><p>text</p><p><a href>Read More</a></p>
 * Authored nodes stay in their cell (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const row = document.createElement('div');
  row.className = 'res-row';
  [...block.children].forEach((r) => {
    const cell = r.firstElementChild;
    if (!cell) return;
    cell.className = 'res-card';
    const cta = [...cell.children].filter((k) => k.tagName === 'P' && k.querySelector('a'));
    cta.forEach((p) => p.classList.add('res-cta'));
    const wrap = document.createElement('div');
    wrap.className = 'res-cell';
    wrap.append(cell);
    row.append(wrap);
    r.remove();
  });
  block.append(row);
}
