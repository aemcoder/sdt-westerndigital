/**
 * disclosures — fine-print strip (p + ol) with its own ground: variants `surface` (#f2f3f3), `dark` (#000), `dark-2` (#1f1f1f).
 * Authoring: one row, one cell: <p><strong>Disclosures</strong></p><ol><li>…</li></ol> (or numbered <p>s). Nodes stay in place (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div');
  if (!cell) return;
  cell.className = 'disc-body';
  block.replaceChildren(cell);
}
