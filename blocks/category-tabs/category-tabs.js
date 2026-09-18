/**
 * category-tabs — home "Shop by Category / Solutions / Industries" tab view with photo tiles.
 * Schema: stardust/eds-schema/home.json § mainContainWrap (tab ×3, tile ×5 + hidden panels).
 *
 * Authoring rows: a ONE-cell row <p>Tab label</p> opens a tab; the two-cell rows that follow belong to it —
 *   <picture> | <p><a>tile label</a></p> is a tile, an empty first cell | <p><em><a>See All Products</a></em></p> is the tab's CTA.
 *   One authored label per tab (editable); a tab with only a CTA row renders a panel with just the CTA.
 * The section head (h1) is DEFAULT CONTENT before the block (D1).
 * Live: first tab active; panels of the other tabs hidden (content parity: hidden DOM kept — recreation-procedure § Granularity parity).
 * @ew-exempt none.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const tabs = new Map();
  let current = null;
  rows.forEach((row) => {
    if (row.children.length === 1) {
      const labelCell = row.children[0];
      const label = labelCell.textContent.trim();
      current = { labelCell, tiles: [], ctas: [] };
      tabs.set(label || `tab-${tabs.size + 1}`, current);
      return;
    }
    if (!current) return;
    const [mediaCell, textCell] = row.children;
    const pic = mediaCell?.querySelector('picture, img');
    const link = textCell?.querySelector('a');
    if (pic && link) current.tiles.push({ pic, text: textCell });
    else if (link) current.ctas.push(textCell);
  });

  const tabview = document.createElement('div');
  tabview.className = 'tabview';
  const tablist = document.createElement('div');
  tablist.className = 'tabs';
  tablist.setAttribute('role', 'tablist');
  const panels = [];
  [...tabs.entries()].forEach(([label, tab], i) => {
    const t = document.createElement('div');
    t.className = `tab${i === 0 ? ' active' : ''}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.id = `tab-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    // move the authored label element (a <p>) into the button label slot
    const labelEl = tab.labelCell.querySelector('p') || tab.labelCell.firstElementChild;
    if (labelEl) btn.append(labelEl); else btn.textContent = label;
    t.append(btn);
    tablist.append(t);

    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', btn.id);
    if (i !== 0) panel.hidden = true;
    const inner = document.createElement('div');
    inner.className = 'tab-panel-inner';
    if (tab.tiles.length) {
      const tiles = document.createElement('div');
      tiles.className = 'tiles';
      tab.tiles.forEach(({ pic, text }) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const a = text.querySelector('a');
        const href = a.getAttribute('href');
        const card = document.createElement('a');
        card.href = href;
        card.setAttribute('aria-label', a.getAttribute('aria-label') || a.textContent.trim());
        a.replaceWith(...a.childNodes); // EW6 — unwrap the inner anchor, the paragraph stays editable
        card.append(pic, ...[...text.children]);
        tile.append(card);
        tiles.append(tile);
      });
      inner.append(tiles);
    }
    tab.ctas.forEach((cell) => { const w = document.createElement('div'); w.className = 'actions'; [...cell.children].forEach((p) => w.append(p)); inner.append(w); });
    panel.append(inner);
    panels.push(panel);
    btn.addEventListener('click', () => {
      tablist.querySelectorAll('.tab').forEach((x, k) => { x.classList.toggle('active', k === i); x.querySelector('button').setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      panels.forEach((p, k) => { p.hidden = k !== i; });
    });
  });
  tabview.append(tablist, ...panels);
  block.replaceChildren(tabview);
}
