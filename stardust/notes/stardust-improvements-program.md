# Stardust improvement notes — program-family wave (N-P1…)

## N-P1 — deploy: a composition map that says "names are client-rendered" should be checked against the sidecar, not the outline
- **What happened:** the composition agent read empty `div.font-bold` in the section-dump outline and concluded product names were client-rendered; the crawl sidecar (hydrated DOM) had every name. The outline truncates/omits text of hydrated nodes.
- **Suggested change:** composition/variance briefs should cite the sidecar `.html` for content presence; the outline is geometry evidence only.

## N-P2 — deploy: section styles need a block-scoped fallback when styles.css is frozen
- **What happened:** the live pages use ~15 section-level paddings/type-heads; with styles.css owned elsewhere, the only legal place was block CSS keyed on section-metadata classes (`main .section.pad-96:is(.card-grid-container, …)`), duplicated per block file.
- **Suggested change:** deploy should ship a canonical "section modifier" vocabulary (pad-*, h2-*, head-pb-*) in styles.css from the first archetype so later waves don't invent per-block copies.

## N-P3 — harness: `build-harness.mjs` output keeps `<img>` bare while the pipeline emits `<p><picture>` — media-cell detection must not rely on either
- **What happened:** `cell.querySelector('picture, img') && !cell.querySelector('p:not(:has(picture))')` classified image cells as copy in the harness (bare `<img>` inside `<p>`); the robust test is `has image && textContent.trim() === ''`.
- **Suggested change:** document the two shapes in deploy § Harness and recommend the text-empty test in block briefs.

## N-P4 — replica gate: side-by-side crops beat diff PNGs for attributing hot bands
- **What happened:** `sbs.mjs` (live | build crop at 0.45 scale) let every hot band be attributed in one look; the red diff image only says where.
- **Suggested change:** ship a `sbs-crop.mjs` next to `crop-compare.mjs`.

## N-P5 — deploy: consecutive buttonized paragraphs stack; live sites put paired CTAs side by side
- **What happened:** `<p><strong><a>` + `<p><em><a>` become two `p.button-wrapper` blocks → stacked (+66 px on every CTA band) until the block grouped them into a flex `.actions` row.
- **Suggested change:** a shared `groupButtons()` helper in `/scripts/` (or in aem.js decorateButtons) so blocks don't re-implement it.

## N-P6 — deploy: `[hidden]` loses to a block's `display:flex` rule
- **What happened:** `.tabs-panel { display:flex }` overrode the `hidden` attribute → all three tab panels rendered (+956 px).
- **Suggested change:** the block checklist should include `[hidden] { display:none }` for any element the block toggles with the attribute.

## N-P7 — commerce API: base-product payloads vs SKU-level captures
- **What happened:** `byCodes()` returns the base product; the live tiles link `?sku=` variants with their own image/price/capacity. Refreshing overwrote authored copy with wrong data until the block was limited to filling gaps.
- **Suggested change:** the dynamics contract for API-refreshed rails should state the identity level (base vs SKU) and default to fill-only.
