/**
 * tabs — Block Collection pattern: one row per tab: <p>Label</p> | panel copy (<h3> + <p>) | [<picture>].
 * Variant `dark` (storage platforms "AI, HPC, and Cloud"): white active tab with a 3px underline, #c4c4c4 inactive.
 * A tab whose panel cells are empty is rendered as a disabled control (the live page loads those panels client-side — content not captured).
 * Authored nodes are MOVED into the tab list / panels (EW1). @ew-exempt none.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const list = document.createElement('div');
  list.className = 'tabs-list';
  list.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'tabs-panels';
  const id = `tabs-${Math.random().toString(36).slice(2, 7)}`;
  rows.forEach((row, i) => {
    const [labelCell, copyCell, picCell] = row.children;
    const hasPanel = (copyCell && copyCell.textContent.trim()) || (picCell && picCell.querySelector('picture, img'));
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'tabs-tab'; btn.id = `${id}-tab-${i}`; btn.setAttribute('role', 'tab');
    [...labelCell.querySelectorAll('p')].forEach((p) => p.replaceWith(...p.childNodes));
    [...labelCell.childNodes].forEach((n) => btn.append(n));
    const panel = document.createElement('div');
    panel.className = 'tabs-panel'; panel.id = `${id}-panel-${i}`; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', btn.id);
    if (copyCell) { copyCell.className = 'tabs-copy'; panel.append(copyCell); }
    if (picCell && picCell.querySelector('picture, img')) { picCell.className = 'tabs-media'; const img = picCell.querySelector('img'); if (img) img.loading = 'lazy'; panel.append(picCell); }
    if (!hasPanel) { btn.setAttribute('aria-disabled', 'true'); btn.disabled = true; }
    btn.setAttribute('aria-controls', panel.id);
    const select = () => {
      list.querySelectorAll('.tabs-tab').forEach((b) => { b.setAttribute('aria-selected', String(b === btn)); b.classList.toggle('is-active', b === btn); });
      panels.querySelectorAll('.tabs-panel').forEach((p) => { p.hidden = p !== panel; });
    };
    btn.addEventListener('click', select);
    list.append(btn); panels.append(panel);
    if (i === 0) { btn.classList.add('is-active'); btn.setAttribute('aria-selected', 'true'); } else { panel.hidden = true; btn.setAttribute('aria-selected', 'false'); }
  });
  block.replaceChildren(list, panels);
}
