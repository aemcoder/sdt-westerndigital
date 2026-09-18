/**
 * split-hero — black hero: copy (h1 66 500, p 20/30, white button) | product picture (storage platforms).
 * Authoring: one row, two cells: copy | <picture>. Authored nodes stay in their cells (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.className = 'sh-row';
  const [copy, media] = row.children;
  if (copy) copy.className = 'sh-copy';
  if (media) { media.className = 'sh-media'; const img = media.querySelector('img'); if (img) { img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); } }
}
