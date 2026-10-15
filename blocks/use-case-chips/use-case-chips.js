/**
 * use-case-chips — "Shop by Use Case:" label + outlined chip links (commerce listing).
 * Schema: stardust/eds-schema/listing.json § use-case-chips.
 * Authoring: one row, 2 cells: <p>Shop by Use Case:</p> | <ul><li><a href="…?filterByUseCaseName=…">Data Center</a></li>…</ul>
 * Authored nodes stay in their cells (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.className = 'chips-row';
  const [label, list] = row.children;
  if (label) label.className = 'chips-label';
  if (list) {
    list.className = 'chips-list';
    list.querySelectorAll('a').forEach((a) => { a.classList.add('chip'); if (!a.getAttribute('aria-label')) a.setAttribute('aria-label', a.textContent.trim()); });
  }
}
