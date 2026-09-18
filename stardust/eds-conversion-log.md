<!-- stardust provenance: skill=stardust:deploy · writtenAt=2026-09-18T11:40:00Z · againstInput: the three gated replica prototypes (stardust/prototypes/*-proposed.html) · readArtifacts: stardust/eds-schema/*.json, stardust/runtime-contract.json, stardust/dynamic-features.md -->
# EDS conversion log — westerndigital.com replica (3 archetypes)

## Runtime contract
`stardust/runtime-contract.json`: vanilla aem-boilerplate main — `p.button-wrapper`, buttonization formatted-only, `wrapTextNodes`, empty-section collapse. `scripts/aem.js` untouched; `scripts/scripts.js` untouched (no auto-blocks needed for these three pages).

## Foundation
- `styles/styles.css` rebranded from the gated canon (`stardust/prototypes/canon.css`): tokens, Roboto stack + metric-matched `roboto-fallback`, 16/24 body, site heading ramp, the `.contain` steps as `--maxw` (100 / 992 / 1140 / 1464), `--nav-height` 91 / 97, button system (1px border, 6px radius, 12px 32px; inverted on `.dark` / `.on-media`), `main .section:empty { display:none }`, Experience Workspace edit-mode repaint. Structural layer (body gate, header reservation, section scaffold) kept.
- `styles/fonts.css`: the site's own Roboto 300/400/500/700 woff2 (Apache-2.0) with the live `local()` preference. `fonts/`: 4 files. `favicon.ico`: the site's icon.
- Section styles (closed set, default-content sections only): `dark` (black CTA band), `surface` (grey card-rail ground), `business` (centered head + CTA around the media-cards block), `contained-hero`, `press-release-body`.

## Block inventory (names locked before code — D1/D9/D11)

| block | tier | pages | authoring shape | notes |
|---|---|---|---|---|
| `header` | template-slotted | all | `/nav`: promo · brand · nested nav list (top → `<strong>` column title → links) · tools list | scroll state cloned from measurement (`body.minHeader` → `top:-40px`; `body.has-subnav` → never pins); mega menu on hover/click; mobile full-screen panel |
| `footer` | template-slotted | all | `/footer`: top (logo + region) · 4 column sections (`<p>` heading + `<ul>`; Support adds support `<p>`, social `<ul>`, badge `<p>`) · legal | AEM floated-grid BFCs mirrored (`flow-root` blocks); social icons by link host; live-height parity 763 / 2176 |
| `hero-carousel` | template-slotted | home | slide rows `picture \| p p p<strong><a>`; tab rows `p \| p` | Splide loop state machine: 2+2 presentational clones (no text — #100), click/keyboard on progress items, 5 s autoplay, reduced-motion pause; rests on slide 2 like the capture |
| `category-tabs` | reconstructive | home | one-cell row opens a tab; `picture \| p<a>` tiles; `∅ \| p<em><a>` CTA | section head (`h1`) is default content |
| `cards` | reconstructive | home | variants `dark-rail`, `product-rail`, `resource-rail`, `tiles` — one row per card | rails scroll horizontally (live Splide --scroll, no arrows); card-as-link unwraps the inner anchor (EW6) |
| `columns` | reconstructive (Block Collection) | home, press release | `media-cards`: one row, one card per cell; `press-release`: one row, body \| aside | dateline = first `<p>` of the body cell |
| `split-band` | reconstructive | corporate | one row per band `picture \| p h3 p… ul p<strong><a>` | alternation and top-alignment index-based (#61); `.pdf` link → download icon (attribute-based) |
| `photo-hero` | template-slotted | corporate, press release | one row `picture \| [p<a>] h1 p`; variant `contained` | hero image eager + fetchpriority high |
| `subnav` | reconstructive | corporate | `<ul>` of links | `sticky-stuck` state machine (fixed at scrollY ≥ offset, flush-left items); mobile dropdown; adds `body.has-subnav` |
| `breadcrumb` | reconstructive (Block Collection) | corporate | `<ul>` trail | chevron = site vector |
| default content + `dark` | — | corporate CTA band | `h3 p p<strong><a>` | D1 |

## Decisions and deliberate deviations
- **Hidden commerce quick-view modals** (4 product descriptions with 6 inline links + “Shop Now”, guarantee/warranty lines) are NOT authored: dynamics row 14 (catalog) / 12 (cart) — decided-out; the prototype mirrors them hidden only for live content parity. `block-roundtrip` reports these as 10 🔴 on `category-tabs` (they sit in that section of the prototype) — recorded here as the decision.
- **Hero clone slides carry no text** (deploy #100 / EW4): `block-roundtrip` reports 4 MISSING CTA against the prototype's textual clones — expected; the visible 4 CTAs round-trip.
- **Press-release dateline**: two live `<span>`s authored as one `<p>` (one editable unit) — 🟡 EXTRA/MISSING BODY pair, same text.
- **Sub-nav and breadcrumb as blocks** (lint 🟡 D1): genuine widgets — the sub-nav owns the measured fixed-state machine and the breadcrumb is a Block Collection pattern.
- **Press-release body list items wrap `<p>`** (lint 🟡 D5): mirrors the AEM richtext byte pattern the pixel gate depends on (li>p margins).
- **Internal links**: `localize-links.mjs --source-host www.westerndigital.com` localized the 3 migrated targets (`/`, `/company/corporate-responsibility`, the press release); every other link stays absolute to the source host (not migrated in this run — the plan's W1–W5 waves localize them as they ship). `--check` passes.
- **Consent / tags / chat**: not loaded (dynamics rows 16–20); “Cookie Preferences” footer link kept as authored text (`#`).
- **Images**: rehosted to DA `media/wd/<basename>` (49 assets + 2 logo SVGs, all pure-vector SVGs ≤ 4 KB) — upload pending the DA token refresh (see status.jsonl `blocked`).

## Gates
- `davids-model-lint content/` — PASS, 0 🔴 (6 🟡 justified above).
- `block-roundtrip` — press release ✓ closed; corporate ✓ closed (after the harness URL fix); home: `cards` ✓, `columns` ✓, `hero-carousel` 4 🔴 (clone text, deliberate), `category-tabs` 10 🔴 (quick-view, deliberate). EW gate: 0 dead, 0 duplicated on all pages.
- Token-completeness (`var(--x)` in blocks vs `:root`) — see § Verification below.
- Published-origin gate (source-fidelity, 1440 + 360) — pending DA delivery.

## Verification (pre-DA)
- Token completeness: every `var(--x)` in `blocks/**/*.css` resolves in `styles/styles.css` `:root` except the two block-local runtime properties `--active` (hero track index, set inline by JS, fallback 0) and `--wd-count` (progress grid columns, set inline) — intentional, not foundation tokens.
- Fixed-asset grep (`localhost`, `aem.page/img`) — empty. SVG assets pure-vector (0 `<image>`, 0 data URIs), 0.7–4 KB.
- `node --check` on every block — clean. `eslint` not run: the boilerplate's devDependencies are not installed in this checkout (a real `npm i` would prune the `--no-save` Playwright the gates depend on); run `npm i && npm run lint` in CI.
- Local QA harness (`aem up` + `qa-gate.mjs`) deferred to the published-origin gate: the deployed computed-style guard supersedes it and the harness needs the content on DA.

## Harness pre-delivery read (aem dev server + `build-harnesses.sh`, live chrome fragments, section styles applied by index)
Advisory numbers — the published-origin gate is the one that counts. EDS harness vs the cached live captures:

| page | 1440 | 360 |
|---|---|---|
| home | 0.83 % · Δ0 | 1.64 % · Δ0 |
| press release | 0.35 % · Δ0 | 1.18 % · Δ-1 |
| corporate responsibility | 1.22 % · Δ-5 | 1.81 % · Δ-5 |

Defects the harness caught before delivery (all fixed in code):
- header/footer `while (fragment.firstElementChild) sections.push(…)` never removed the child → infinite push (`Invalid array length`); the fragment loader also wraps each section's prose in `.default-content-wrapper`, so both chrome blocks unwrap it before slotting.
- `columns media-cards`: `wrapTextNodes` (#104) folds the media-led cell into one `<p>` — the block expands it back.
- stickiness must live on the `<header>` host element (a sticky child cannot stick inside a 97px parent); `body.minHeader header { top:-40px }`, `body.has-subnav header { position: relative }`.
- card scrim `::before` must sit above the media layer (`z-index`), rail heads span the viewport at 360 (`:not(:has(.cards.tiles))`), footer social margins needed higher specificity than the `footer .footer ul` reset, badge/logo images are block-level.
- Harness-only artefacts (not defects): `section-metadata` blocks stay in the DOM on the harness (48px phantom wrapper each) — the pipeline removes them server-side; the harness script strips them and applies the style classes by section index.

## Published-origin gate (live vs `main--sdt-westerndigital--aemcoder.aem.page`, the only number that counts)

Delivered after the `DA_TOKEN` refresh: 49 images + 2 logo SVGs to `media/wd/`, 5 documents (nav, footer, 3 pages) PUT → preview → live; `.plain.html` verified per page.

| archetype | 1440 | 360 | content-diff |
|---|---|---|---|
| home | 0.86 % Δ0 | 1.67 % Δ0 | 14 🔴, all mapped: 3 second copies of hero CTAs (textless clones, § Decisions) + 11 inline links inside decided-out commerce quick-view copy |
| press release | 0.34 % Δ0 | 1.18 % Δ-1 | 0 🔴 |
| corporate responsibility | 1.27 % Δ-5 | 1.87 % Δ-5 | 0 🔴 |

**The harness understated, as the gate doc warns.** The first published run read 10.5 %/11.5 % (home), 4.9 %/3.9 % (press release) with a constant −808 px height delta, and the corporate round aborted on the identity marker (`Western Digital` is not in the raw HTML — the `<title>` says `WD`). Every cause was a publish-pipeline transformation the `aem up --html-folder` harness never applied:

1. **`<li>` text wrapped in `<p>`** when the item carries a nested `<ul>` → nav labels sat 20 px low (`header.js` moved only text nodes). Column titles arrive as `<p><strong>`. Fixed by moving the `<p>` children into the label / unwrapping (nodes move, EW1).
2. **Intrinsic `width`/`height` stamped on every `<img>`** → the lazy Ethisphere badge rendered 100×876 until load: `footer.css` had `max-width:100px` without `height:auto` (the boilerplate only resets `main img`). Fixed.
3. **`<p><a>` buttonized** → category tile labels became `inline-flex` in a 24 px line box (+4 px per tile row, −13 px at 360). Fixed with `display:block` on the tile `<p>`.
4. **Trailing `&nbsp;` before a closing tag and `&nbsp;`-only paragraphs are stripped** — the source's `Report.&nbsp;` wrapped one line earlier on live (24 px cascade → 16.7 % on corporate). A zero-width space (U+200B) after the nbsp survives the pipeline and restores the wrap; 5 carriers on corporate, none in headings (content-inventory does not strip U+200B and flagged the heading as missing). Empty spacer paragraphs are dropped by the pipeline; none were needed on the three pages.
5. **Mobile Sign-in icon** showed at 360: the `a:any-link` flex rule out-specified the hide. Fixed.
6. **Build-side settle:** the published origin is a real lazy/autoplay site — `gate.sh` captures the build without `--settle`, so the hero rested on slide 1 vs live's slide 2. Both sides captured with `--settle` for the recorded numbers.

Evidence: `stardust/replica/gates/<slug>-<w>/published.png`, `diff-published3.png` (home, press release), `diff-published5.png` (corporate), `gate-published*.txt`, `content-diff-published*.txt`.

## Listing archetype (`/products/hdd/internal-hdd`) — conversion, 2026-09-18

Prototype gate 0.85 % / 2.22 % (stardust/prototypes/listing-proposed.html). Blocks (names locked; EW1–EW10; `stardust/eds-schema/listing.json`):

| block | tier | authoring shape | notes |
|---|---|---|---|
| `category-banner` | template-slotted | one row `picture \| h1 p p<a>`; variant `templated` | picture → background layer; mobile hides the bg (capture-state); `templated` swaps the h1 from `?filterBy…` ("Hard Drives for {use case}" / "{range}  Hard Drives") |
| `category-shortcuts` | reconstructive | one row per card `picture \| p<strong><a>Title</a></strong> p` | card-as-link (EW6); 84px icon on the grey tile |
| `use-case-chips` | reconstructive | one row `p \| ul>li>a` | nowrap chip row; label shrinks to its longest word at 360 (measured) |
| `product-listing` | **API-fed** (dynamics row 14 → client-rendered/self) | config rows `key \| value` (`categories`, `condition`, `page-size`, `sort`, `filters`, `category-tree`, `deals`) + tile rows `picture \| name \| capacity \| price \| link [\| badge]` (the captured page 1 = content-bearing fallback) | `scripts/wd-commerce.js` search API; URL contract `?filterBy<Facet>=<value>&page=N&sort=code` (same as the storefront); facets, count, pagination, sort rendered from the payload; tiles link absolute to the storefront PDP; Compare = captured label (aria-disabled); mobile Shop/Filter buttons toggle the rail |
| `split-band use-case` (variant) | reconstructive | rows `picture \| h3 p ul… p<em><a>Shop…</a></em> p<a>Learn More</a>` on section style `light` | 992px centred rows, 300px r16 photos, outlined CTA + blue link; **fixed a latent split-band bug**: a band opening with a heading (no eyebrow) left the heading outside `.band-body` |
| `resource-cards` | reconstructive | one row per card, one cell `h3 p p<a>`; h2 head = default content (D1) | grey r16 cards 3-up |
| `faq open-first` | reconstructive | rows `p question \| answer` ; h2 head = default content | the section is the grey box (5/12 head · 7/12 list); first item open (captured state); no motion observed → instant toggle; the 3 hidden per-use-case FAQ variants of the live page are NOT authored (capture-state duplicates; block-roundtrip "4 prototype sections vs 1 block" is this decision) |
| `buy-direct` | reconstructive | one row per item `picture \| h3 p [p<a>]`; h2 + footnote = default content | grey strip, 4 items space-evenly |

Decisions: breadcrumb reused (own block, same section as `product-listing`); `.section.light` (#f9f9f9) appended to styles.css; page assets rehosted (11 new media/wd entries: banner, 3 shortcut icons, 3 band photos, 4 SVG icons — pure vector, 2.4–8.6 KB); product tile images stay absolute (commerce assets); Sign-in/cart/PDP/compare stay on the storefront.

Gates: `davids-model-lint` PASS 0 🔴 (5 🟡: breadcrumb block as before; `product-listing` mixed 2/5/6-cell rows = config + data table by design; `resource-cards` genuine widget; SVG batch verified). `block-roundtrip --ew`: static blocks ✓ closed, EW 87/87 editable, 0 dead; `product-listing` EW 73/73 editable but its round-trip cannot run in that harness (block imports `/scripts/wd-commerce.js`; the harness inlines JS — N-26) → verified on the dev-server harness instead: API live, 15 tiles, "30 Items", 9 facets, 2 pages, 0 console errors. Harness read vs cached live captures: **1440 1.34 % Δ-1 · 360 2.94 % Δ-1** (one hot band: 3rd band photo crop at 360).

`localize-links` (whole tree) also rewrote `content/nav.html` (Products → Internal HDDs now relative) — nav must be re-delivered with the page (N-27).

**Published-origin gate (listing):** delivered (11 media 201; page PUT 201 → preview/live 200; nav re-PUT → 200/200). live vs `aem.page/products/hdd/internal-hdd`, settle both sides: **1440 1.35 % Δ-1 · 360 2.95 % Δ-1**; API grid live on the published origin (15 tiles, "30 Items", 9 facets, 2 pages, 0 console errors; `?filterByUseCaseName=Gaming` → 2 tiles, 7 facets). content-diff 14 🔴: 6 = hidden per-use-case FAQ variants (decision above); 2 = "Shop by Category"/"Shop by Deals" are `href="#"` accordion triggers on live vs headings here; 1 = live mobile duplicate pagination link; 5 fixed in `product-listing.js` (facet VALUE = storefront query token, e.g. Color `Purple|800080`; pagination links always `?page=N`) — re-run after push.

