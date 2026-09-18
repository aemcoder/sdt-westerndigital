/**
 * category-shortcuts — the 3 category cards under a commerce listing hero (white r16 cards on #f9f9f9).
 * Schema: stardust/eds-schema/listing.json § category-shortcuts.
 *
 * Authoring: one row per card, 2 cells: <picture> (84px icon) | <p><strong><a href>Title</a></strong></p><p>Subtitle</p>
 * The whole card is the link on the live site — card-as-link unwraps the inner anchor (EW6); nodes are MOVED (EW1).
 * @ew-exempt none.
 */
export default function decorate(block) {
  const row = document.createElement('div');
  row.className = 'shortcuts-row';
  [...block.children].forEach((r) => {
    const [mediaCell, textCell] = r.children;
    const link = textCell?.querySelector('a');
    const href = link?.getAttribute('href');
    const card = document.createElement(href ? 'a' : 'div');
    card.className = 'shortcut';
    if (href) {
      card.href = href;
      const sub = textCell.querySelector('p:nth-of-type(2)');
      card.setAttribute('aria-label', `View ${link.textContent.trim()} Products${sub ? `: ${sub.textContent.trim()}` : ''}`);
      link.replaceWith(...link.childNodes);
    }
    const pic = mediaCell?.querySelector('picture, img');
    if (pic) { const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img'); if (img) img.loading = 'lazy'; card.append(pic); }
    if (textCell) {
      textCell.className = 'shortcut-text';
      textCell.querySelectorAll('p.button-wrapper').forEach((p) => { p.className = ''; });
      textCell.querySelectorAll('.button').forEach((b) => b.classList.remove('button', 'primary', 'secondary'));
      card.append(textCell);
    }
    const cell = document.createElement('div');
    cell.className = 'shortcut-cell';
    cell.append(card);
    row.append(cell);
    r.remove();
  });
  block.append(row);
}
