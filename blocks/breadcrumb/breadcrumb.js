/**
 * breadcrumb — "Home › Company › Corporate Responsibility" (Block Collection pattern name).
 * Authoring: one row, one cell: <ul><li><a href="/en-us">Home</a></li><li><a href="/company">Company</a></li><li>Corporate Responsibility</li></ul>
 * The chevron is a fixed brand vector (site SVG #Group_24215). The authored <ul> is MOVED (EW1). @ew-exempt none.
 */
const CHEVRON = '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" aria-hidden="true"><path d="M0 0h21v21H0z" fill="none"/><path d="M8.3 6.2l4.3 4.3-4.3 4.3-1-1 3.3-3.3-3.3-3.3z" fill="#6a6a6a"/></svg>';

export default function decorate(block) {
  const ul = block.querySelector('ul');
  if (!ul) return;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.className = 'trail';
  const items = [...ul.children];
  items.forEach((li, i) => {
    if (i < items.length - 1) li.insertAdjacentHTML('beforeend', CHEVRON);
    else li.classList.add('current');
  });
  nav.append(ul);
  block.replaceChildren(nav);
}
