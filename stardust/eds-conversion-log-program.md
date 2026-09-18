# EDS conversion log — Products menu, program-family wave (2026-09-18)

Pages: `/explore/whats-new`, `/promo`, `/promo/best-sellers`, `/business/account-benefits`, `/business/account-benefits/tiered-pricing`,
`/solutions/data-center-storage-platform`, `/products/product-portfolio`. Written by the program-wave worker; records live in
`stardust/replica/progress-program.json`, `stardust/.work/program/status.jsonl`, notes in `stardust/notes/stardust-improvements-program.md`.

## Fidelity-tier decision

These seven pages are **sibling-tier direct block authoring** (migrate `fidelity-tiers.md`): unique compositions measured from the live
section outlines at 1440 and 360 (`stardust/.work/products-menu/dumps/*.txt`), NOT prototyped archetypes — prototyping seven one-off
compositions was out of budget for a whole-menu ask. Compensation: a local harness read (aem up + `stardust/.work/program/build-harnesses.sh`,
live chrome fragments, section styles applied) against fresh live stitches at both breakpoints, three fix rounds, then the published-origin
gate. `/business/account-benefits/tiered-pricing` is tier `thin` (login wall only — the members' listing is never rendered anonymously).

## Blocks (new, David's Model + EW1–EW10; all `node --check` clean)

| block | authoring | variants | pages |
|---|---|---|---|
| `product-rail` (**API-fed**) | one row per product `picture \| name \| capacity \| price \| link [\| extra]`; head = default content | `grid-4` (265px square tiles, promo strip cell), `showcase` (+`featured-left`: featured card + 2×2), `rail` (375×600 r16 scroll rail) | whats-new (3), best-sellers (2), portfolio (1) |
| `card-grid` | one row per card `[picture] \| body`; card-as-link for `icon-tiles`/`program`/`compact` | `icon-tiles`, `program`, `icon-columns` (+`padded`, `four-up`, `icon-134/140/150/66`, `h3-24/32`, `bold`), `product-feature`, `media` (+`two/three/four-up`, `white/grey`, `r16`, `img-310/234/225`, `h3-24`, `bordered`), `compact`, `capacity-tiles` (last card dark), `icon-row`, `stats` | promo, best-sellers, account, storage, portfolio |
| `cta-band` | `[picture bg] \| copy [\| copy]` | default (photo, centered), `contained` (1108 r16 inset), `gradient`, `big` (48px statement), `split` (+`media-left` with the −26px overhanging image) | whats-new, promo, best-sellers, account (2), storage |
| `disclosures` | one cell of fine print | `surface`, `dark`, `dark-2` | promo, account, portfolio |
| `media-text` | `copy \| picture` (or `h2 \| p`) | `offset-1`, `steps` (CSS-counter numerals replace the icon-b2b-1/2/3 glyphs), `subtitle`, `intro` | account (2), portfolio |
| `faq-list` | `question \| answer` rows, all open as captured | — | account |
| `testimonial-carousel` | `[picture] \| quote \| attribution` rows | `static` (single centered quote head) | account, best-sellers |
| `tabs` | `label \| panel copy \| picture` rows; label-only rows render disabled | `dark` | storage |
| `table` | first row = header | `striped` | portfolio |
| `split-hero` | `copy \| picture` | — | storage |
| `login-wall` | rows: bg + close link · logo + h1/p/buttons · strip head · icon items | — | tiered-pricing |

Existing blocks extended (variants only): `photo-hero` (`band`, `centered` + `h1-48/w462/w739/lede-18/h400`, `cta-pair`, `darken`;
eyebrow/logo slots; consecutive buttons grouped into `.actions`), `subnav` (`business`: blue accent + right CTA from an authored `<p><a>`),
`cards` (`workload-rail`, `dark-rail cta-pair`, section style `portfolio-rail`). Reused as-is: `breadcrumb`, `buy-direct`, `faq`.

**Section modifiers** (section-metadata `style`, comma-separated → classes; scoped to my block containers, styles.css untouched):
`surface`, `pad-96`, `pad-80-96`, `pad-64-16`, `pad-72-96`, `h2-48`, `h2-36b`, `h2-34b`, `h2-mb-40`, `head-pb-48`, `head-pb-24`,
`head-mb-0`, `lede-grey`, `lede-600`, `lede-pb-48`. Mobile values measured @360 (e.g. `h2-48` → 32/35.2, head pb 32, `pad-64-16` → 40 0).

## Decisions

- **Product names are in the sidecar** (the crawl captured hydrated DOM), so grids/showcases/rails are authored SKU-level from the capture; the
  search API (`byCodes()`, base products) only FILLS empty fields — it never overwrites authored copy (a base product's image/price differ from
  the SKU the tile links to; e.g. the WD Elements 16TB tile's API image is the warranty badge).
- Client-only surfaces: promo-strip and "View Products" quick-view modals (decided-out, dynamics 14) → link/label as captured; "Talk to an
  Expert" form modal → absolute link to the live page anchor (dynamics form row, interim tier); tiered-pricing "Sign in" flyout →
  `https://www.westerndigital.com/store/login` (200); testimonial carousel without a motion capture → slide 1 at rest, dots switch, no autoplay.
- Content gaps (recorded per page in progress-program.json): HPC/Cloud tab panels (not in the DOM), members-only tiered-pricing listing.
- Live artefacts replicated, not fixed: 2 portfolio dark-rail cards without a background image, 5 "Learn More" cards without href, the
  promo card link nesting collapsed to one link.
- Inline SVG icons on the portfolio page were serialized to `media/wd/portfolio-*.svg` (pure vector, checked: no raster data URIs).
- Links: only the delivered paths (3 archetypes + listing wave + this wave) are root-relative (`stardust/.work/program/localize.mjs`);
  everything else stays absolute to the storefront.

## Gates

- `davids-model-lint` on the 7 docs: **PASS, 0 🔴** (64 🟡: LOCALIZE items since fixed; D1 on `subnav`/`breadcrumb`/`disclosures` =
  genuine widgets; D3 `login-wall` differing cell counts by design; D10 `product-rail` 6 cells and `table` 5 cells = data tables; SVG
  batch verified pure-vector).
- EW editability probe: see § EW below.
- Harness read (advisory; live stitches from 2026-09-18, settle both sides):

| page | 1440 | 360 |
|---|---|---|
| whats-new | 0.52 % Δ0 | 10.6 % Δ-101 |
| promo | 6.0 % Δ+24 | 12.9 % Δ-111 |
| best-sellers | 13.8 % Δ-99 (harness footer +49 artefact) | 12.7 % Δ-22 |
| account-benefits | 8.1 % Δ+20 | 16.2 % Δ+87 |
| tiered-pricing | 0.63 % Δ0 | 11.5 % Δ-94 |
| storage-platform | 7.0 % Δ+35 | 33.2 % Δ-282 |
| product-portfolio | 8.9 % Δ-77 | 21.9 % Δ-1097 |

Residual causes at 360 (three rounds reached): storage/portfolio card-grid stacks are 60–100 px taller per section than the live 1-up
cards (card padding/type at mobile approximated from the 1440 lift), the portfolio table wraps differently, hero photo crops differ.
The published-origin gate decides.

## EW (Experience Workspace editability probe, harness render)

| page | authored | editable | dead | duplicated | exempt |
|---|---|---|---|---|---|
| whats-new | 71 | 28 | 0 | 0 | 43 (API-fed product-rail tiles) |
| promo | 39 | 39 | 0 | 0 | 0 |
| best-sellers | 63 | 52 | 0 | 0 | 11 |
| account-benefits | 51 | 51 | 0 | 0 | 0 |
| tiered-pricing | 13 | 12 | 0 | 0 | 1 |
| storage-platform | 62 | 59 | 0 | 0 | 3 |
| product-portfolio | 215 | 150 | 0 | 0 | 65 |

0 dead, 0 duplicated on all seven documents.

## Published-origin gate (final, round 4 — live vs `main--sdt-westerndigital--aemcoder.aem.page`, settle both sides)

| page | 1440 | 360 | content-diff | verdict |
|---|---|---|---|---|
| whats-new | 0.52 % Δ+0 ✓ | 11.38 % Δ-5 | 3 justified | over-bar: 360 |
| promo | 6.01 % Δ+24 | 8.59 % Δ-9 | 2 justified | over-bar: 1440, 360 |
| best-sellers | 9.53 % Δ-39 | 10.88 % Δ-33 | 20 justified | over-bar: 1440, 360 |
| account-benefits | 7.04 % Δ-6 ✓ | 16.08 % Δ-98 (pub5, testimonial revert) | 4 justified | over-bar: 360 |
| tiered-pricing | 0.62 % Δ+0 ✓ | 7.46 % Δ-17 | 0 justified | over-bar: 360 |
| storage-platform | 4.72 % Δ-9 | 13.39 % Δ+26 | 8 justified | over-bar: 1440, 360 |
| product-portfolio | 8.83 % Δ-77 | 14.65 % Δ+111 | 26 justified | over-bar: 1440, 360 |

Bar: ≤ 10 % and |Δh| ≤ 8 px per breakpoint. Passing both criteria: whats-new 1440, account-benefits 1440, tiered-pricing 1440. Under 10 % but over the Δ bar: promo 360 (Δ-9), best-sellers 1440 (Δ-39), tiered-pricing 360 (Δ-17), storage 1440 (Δ-9), portfolio 1440 (Δ-77), promo 1440 (Δ+24). Over the bar
after the four rounds (residual causes in `progress-program.json § publishedOrigin.residuals`): every page at 360 except promo — mobile card internals
and SKU-level product image crops; promo 1440 Δ+24 (live lede wrap + two empty 16 px live cells); storage 1440 Δ-9 (1 px); portfolio 1440 Δ-77
(hero photo treatment + the listing-owned `faq` block); account-benefits 360 regressed in round 4 (testimonial track sizing) and was reverted to the round-3 values in 416a23a — re-measured 16.1 % Δ-98. Content-diff structural reds are all mapped to decided-out client-only surfaces (quick-view
modals, expert form, detail modals), live nested-link artefacts, or inventory heuristics (see per-page justification in progress-program.json).
Round 1 was discarded (parallel stitches captured half-decorated pages seconds after Code Sync); rounds 2–4 were sequential.
