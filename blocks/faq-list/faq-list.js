/**
 * faq-list — narrow centered FAQ (account benefits): question | answer rows, every item OPEN as captured; title 20/22 700, −/+ icon.
 * Authoring: one row per item, two cells: <p>Question</p> | <p>Answer…</p>. Head h2 = DEFAULT CONTENT before the block (D1).
 * Toggle is instant (no motion observed on the live page). Authored nodes are MOVED (EW1). @ew-exempt none.
 */
const ICON = '<svg class="fl-icon" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><rect y="4" width="11" height="3" fill="currentColor"/><rect class="fl-v" x="4" width="3" height="11" fill="currentColor"/></svg>';
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'fl-item is-open';
    const [q, a] = row.children;
    if (!q) return;
    q.className = 'fl-q'; q.setAttribute('role', 'button'); q.tabIndex = 0; q.setAttribute('aria-expanded', 'true');
    q.insertAdjacentHTML('beforeend', ICON);
    if (a) a.className = 'fl-a';
    const toggle = () => { const open = row.classList.toggle('is-open'); q.setAttribute('aria-expanded', String(open)); };
    q.addEventListener('click', toggle);
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });
}
