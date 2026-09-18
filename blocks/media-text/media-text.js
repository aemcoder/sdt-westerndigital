/**
 * media-text — two-column copy | picture rows (account benefits "Trusted Partnership" / "Request a Quote", portfolio intro).
 * Authoring: one row, two cells in reading order: copy | <picture>  (or <picture> | copy, or h2 | p for `intro`).
 * Variants: `intro` (h2 5/12 · p 7/12), `steps` (an <ol> in the copy renders as numbered 24px steps), `offset-1`/`offset-2` (copy indent).
 * Authored nodes stay in their cells (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.className = 'mt-row';
  [...row.children].forEach((cell) => {
    cell.className = cell.querySelector('picture, img') && !cell.textContent.trim() ? 'mt-col mt-media' : 'mt-col mt-copy';
    const img = cell.querySelector('img'); if (img) img.loading = 'lazy';
  });
}
