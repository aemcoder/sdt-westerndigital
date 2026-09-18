/**
 * table — Block Collection `table`: first row = header (variant `no-header` opts out). Variant `striped` (portfolio "How To Choose"):
 * odd body rows #f9f9f9, uppercase 16/24 700 head with a #dadada rule, 14/21 cells, first column left-aligned links.
 * Authored cell nodes are MOVED into <th>/<td> (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');
  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell) => {
      const td = document.createElement(header && i === 0 ? 'th' : 'td');
      if (header && i === 0) td.setAttribute('scope', 'col');
      [...cell.querySelectorAll('p')].forEach((p) => p.replaceWith(...p.childNodes));
      [...cell.childNodes].forEach((n) => td.append(n));
      tr.append(td);
    });
    (header && i === 0 ? thead : tbody).append(tr);
  });
  if (thead.children.length) table.append(thead);
  table.append(tbody);
  block.replaceChildren(table);
}
