/**
 * columns — Block Collection pattern (D11) with two site variants.
 * Schema: stardust/eds-schema/home.json § business (2 media cards) · press-release.json § body (main | aside).
 *
 *   columns media-cards     one row, one cell per card: <picture> <h3>title</h3> <p>body</p>   → 50/50 media cards (home "Businesses")
 *   columns press-release   one row, two cells: [dateline <p> + article body] | [<h2>Press Contacts</h2> + <p>s] → 75/25 with a sticky aside
 * Authored nodes stay in place inside their cell wrappers (EW1 — nothing rebuilt). @ew-exempt none.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const cols = rows[0] ? rows[0].children.length : 0;
  block.classList.add(`columns-${cols}-cols`);
  rows.forEach((row) => {
    row.classList.add('columns-row');
    [...row.children].forEach((cell, i) => {
      cell.classList.add('columns-col');
      const pic = cell.querySelector('picture, img');
      if (block.classList.contains('media-cards')) {
        const card = document.createElement('div');
        card.className = 'media-card';
        if (pic) { const m = document.createElement('div'); m.className = 'media'; m.append(pic.closest('p') || pic); card.append(m); }
        const text = document.createElement('div');
        text.className = 'media-card-text';
        while (cell.firstChild) text.append(cell.firstChild);
        card.append(text);
        cell.append(card);
      } else if (block.classList.contains('press-release')) {
        cell.classList.add(i === 0 ? 'pr-main' : 'pr-aside');
        if (i === 0) {
          const first = cell.querySelector('p');
          if (first) { const head = document.createElement('div'); head.className = 'press-release-header'; first.replaceWith(head); head.append(first); }
          const col = document.createElement('div');
          col.className = 'textcolumn';
          [...cell.children].filter((c) => !c.classList.contains('press-release-header')).forEach((c) => col.append(c));
          cell.append(col);
        }
      }
    });
  });
}
