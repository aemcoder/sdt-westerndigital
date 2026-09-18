/**
 * faq — accordion (question | answer rows) inside a grey r16 box; the h2 is DEFAULT CONTENT before the block and the
 * section CSS lays head (5/12) and list (7/12) side by side. Schema: stardust/eds-schema/listing.json § faq.
 * Authoring: one row per item, 2 cells: <p>Question</p> | <p>Answer…</p>[<p>…</p>]
 * Variant `open-first`: the first item starts expanded (the captured state). Live motion: none observed
 * (replica/motion/listing.json) — toggling is instant. Authored nodes are MOVED (EW1). @ew-exempt none.
 */
const MINUS = '<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 7L16 7L16 9L0 9L0 7Z" fill="black"/></svg>';
const PLUS = '<svg class="faq-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 16L7 0L9 0L9 16L7 16Z" fill="black"/><path fill-rule="evenodd" clip-rule="evenodd" d="M0 7L16 7L16 9L0 9L0 7Z" fill="black"/></svg>';

export default function decorate(block) {
  const openFirst = block.classList.contains('open-first');
  [...block.children].forEach((row, i) => {
    row.className = 'faq-item';
    const [qCell, aCell] = row.children;
    if (!qCell) return;
    const q = document.createElement('div');
    q.className = 'faq-q';
    q.setAttribute('role', 'button');
    q.tabIndex = 0;
    const id = `faq-a-${i + 1}`;
    q.setAttribute('aria-controls', id);
    const label = document.createElement('span');
    label.className = 'faq-q-text';
    label.append(...qCell.childNodes);
    q.append(label);
    q.insertAdjacentHTML('beforeend', PLUS);
    qCell.replaceWith(q);
    if (aCell) {
      aCell.className = 'faq-a';
      aCell.id = id;
      const inner = document.createElement('div');
      inner.className = 'faq-a-inner';
      inner.append(...aCell.childNodes);
      aCell.append(inner);
    }
    const setOpen = (open) => {
      row.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      q.querySelector('svg').outerHTML = open ? MINUS : PLUS;
      if (aCell) aCell.hidden = !open;
    };
    setOpen(openFirst && i === 0);
    q.addEventListener('click', () => setOpen(q.getAttribute('aria-expanded') !== 'true'));
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(q.getAttribute('aria-expanded') !== 'true'); } });
  });
}
