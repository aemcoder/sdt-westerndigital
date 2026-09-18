<!-- stardust provenance: skill=stardust:replica · writtenAt=2026-09-18T07:15:00Z · againstInput "migrate https://www.westerndigital.com/ to EDS as a same-design replica; full plan for the whole site, 3 pages to final fidelity in this run" · readArtifacts: stardust/state.json, stardust/current/_crawl-log.json, stardust/current/pages/*.json, stardust/replica/lift/*.json, stardust/dynamic-features.md, /tmp sitemap analysis (508 URLs) -->

# westerndigital.com → AEM Edge Delivery — same-design replica migration plan

**Flow:** `replica` → `migrate` (siblings) → `deploy` (archetypes) / `rollout` (site). No `prepare-migration`
step exists in this flow (replica subsumes it in preserve mode). Design, IA and content are frozen at the
captured current state; the inconsistency register is empty (pure replica).

**Target:** `aemcoder/sdt-westerndigital` (private GitHub repo, `adobe/aem-boilerplate`), content on
da.live `aemcoder/sdt-westerndigital`, preview `https://main--sdt-westerndigital--aemcoder.aem.page/`,
live `https://main--sdt-westerndigital--aemcoder.aem.live/`.

## 1. Inventory

| source | count | notes |
|---|---|---|
| `sitemap.xml` (gzip body, no index) | 508 | 373 under `/company/newsroom` (354 press releases, 16 events, media kit, brand assets) |
| nav-discovered, not in sitemap | ~40 | `/solutions/*` (14), `/support/*` (12), `/products/*` categories (9), `/store/*`, `/tools/*`, `/promo/*` |
| product detail pages (PDP) | unknown, hundreds | commerce-rendered; not in the sitemap; one guessed URL 404ed. Discovered only by rendering PLPs (client-side grids) |
| crawled this run (live, Playwright) | 106 | 100 overall / 20 per template hands-off caps + header/footer-linked pages |
| junk / fragments filtered | 10 | `cta-banner-*`, `solutions-block*`, `bottom-section-in-ref`, `documents/pdf`, `document-landing-page`, `/account*` |

## 2. Template families (page types) and what each becomes

Types are LLM-inferred from URL + content shape (`state.json.pages[].type`); counts are the full-site
estimate (sitemap + nav), with the crawled sample in parentheses.

| type | family | est. pages (crawled) | representative | EDS rendering |
|---|---|---|---|---|
| landing | home | 1 (1) | `/` | **archetype** (this run) |
| article | press release + event detail | 370 (23) | `/company/newsroom/press-releases/2026/2026-09-15-…` | **archetype** (this run); 369 siblings via `migrate` sibling tier + press-release importer |
| program | corporate / solutions / careers / partners / programs / brand / explore / business marketing pages | ~110 (47) | `/company/corporate-responsibility` | **archetype** (this run); siblings cloned with variant classes per `sibling-variance.mjs` |
| static | legal, privacy-center, support policy/FAQ, governance | ~45 (14) | `/legal/privacy-statement` | rollout wave 3: default-content prose pages (D1), one `legal` section style — no new archetype prototype needed beyond a variance probe against the program archetype's text band |
| listing | newsroom hub, events hub, documents hub, publications | 5 (4) | `/company/newsroom` | rollout wave 2: `cards` + index-backed rail (document-first), needs `helix-query.yaml` |
| listing (commerce) | PLP / category / weekly-sale / recertified / portfolio | 9+ (9) | `/products/hdd/internal-hdd` | **decided-out this phase** (client-rendered from SFCC APIs); links stay absolute to the storefront |
| program (commerce) | PDP | hundreds (2 guessed, rendered as 200 marketing shells) | `/products/internal-drives/wd-blue-desktop-sata-hdd` | decided-out with PLPs until the commerce decision |
| form | contact, find-a-store, data-center platform enquiry, partner/recycle forms | ~8 (4) | `/company/contact-us` | rollout wave 3: program clone + `form` block, submission scaffolded (owner endpoint) |
| unique | calculators, product compare, store landing | 4 (4) | `/tools/raid-capacity-calculator` | wave 4: `calculator` block (client-only compute, never flattened); compare + store decided-out |

## 3. Archetype choice (this run)

Three pages go to final fidelity now: the home page plus the two most representative template families.

1. **Home** `/` — landing. Required by the brief; carries every signature module (hero carousel, tabs+tiles, three card rails, split band, tile row) and the shared chrome.
2. **Press release** `/company/newsroom/press-releases/2026/2026-09-15-wd-outlines-a-new-path-to-economically-scalable-storage-infrastructure` — **article**. Reason: the largest family by far (370 of 508 sitemap URLs, 73%); one gated archetype unlocks the whole newsroom through the sibling importer. The chosen page is the most recent release and exercises the full template (dateline spans, bullet lists, bold WHAT/WHO/WHEN block, boilerplate with link, legal paragraph, sticky Press Contacts aside).
3. **Corporate Responsibility** `/company/corporate-responsibility` — **program**. Reason: the second-largest family (~110 marketing/corporate pages) and the one where authors do most work; the page carries every module the family uses (photo hero, sub-nav tabs, breadcrumb, 7 alternating split image/text bands, dark CTA band), so its blocks cover solutions, careers, innovation, partners and programs pages with variant classes only. The product listing family was not chosen because it is commerce-rendered (host-bound APIs, decided-out this phase) — a static replica of an empty grid would pass no honest gate.

## 4. Phases

### Phase 1 — Extract (done)
`extract --prep --dynamics` equivalent: 106/107 pages live (1 guessed PDP 404), page typing, module
candidates in `DESIGN.json.extensions.modules[]`, brand surface, PRODUCT/DESIGN descriptive files,
brand-review.html, fonts (Roboto, open license) + logos + favicon.

### Phase 2 — Preserve direction (done)
Verbatim promotion of `current/PRODUCT.md`, `DESIGN.md`, `DESIGN.json` to the project root;
`stardust/direction.md` (preserve mode, hands-off assumptions); empty inconsistency register;
dynamics Phases 1–3 → `stardust/dynamic-features.md` (23 rows, all with dispositions) + plan.

### Phase 3 — Recreate (this run: 3 archetypes)
Clean semantic HTML/CSS prototypes under `stardust/prototypes/`: shared `canon.css` (tokens, chrome,
buttons, cards) + per-archetype CSS; content verbatim from the captured JSON/DOM; values from the CSS
lifts (`stardust/replica/lift/`), geometry from the DOM dumps (`stardust/replica/dump/`), screenshots
as ground truth. Fonts self-hosted from the site's own Roboto woff2.

### Phase 4 — Source-fidelity gate (this run: 3 archetypes × 1440 + 360)
content-diff 0 🔴, visual-diff justified, pixel ≤ 10 %, |Δh| ≤ 8 px, chrome crops ≤ 2 %, ≤ 3 iterations
per breakpoint; motion-observe per archetype; ledger in `stardust/replica/progress.json`.
Known permanent residuals to expect: the Genesys chat launcher (65×65 fixed iframe, masked), hero
carousel autoplay (frozen at t=0), campaign promo text drift.

### Phase 5 — Deliver the 3 archetypes (this run)
`deploy`: blocks (template-slotted for fixed compositions, reconstructive for card rails), `/nav` +
`/footer` documents, `styles/styles.css` foundation, content pages → DA Source API → preview → live.
Final gate re-run against the **published origin** per archetype and breakpoint.

### Phase 6 — Rollout waves (after review)

| wave | scope | mechanism | gates |
|---|---|---|---|
| W1 | 369 press releases + 16 events | `migrate` sibling tier: press-release importer over the rendered-DOM sidecars (`pages/<slug>.html` — crawl the remaining ~350 first with `--pages`), content-count acceptance per page, `deploy-batch.mjs` | variance probe once (`sibling-variance.mjs` on 8 releases), content-count, delivery-lint, `.plain.html` asserts |
| W2 | newsroom hub, events hub, documents hub, publications; `/search` results | `helix-query.yaml`, index-backed `cards`, document-first rows | dynamics parity rows 2, listings |
| W3 | ~110 program pages + ~45 static + ~8 form pages | sibling clones of the program archetype; variant classes from the variance probe (hero compact / no-subnav / text-only); `form` block scaffold | variance probe per sub-family, content-count, chrome crop gate once per sub-family |
| W4 | calculators (2), region selector, modals, resource center | `calculator` block, sheet sync, `modal` block | dynamics parity |
| W5 | redirects (`stardust/redirects.tsv`: `/en-us/*` → `/*`, trailing-slash, `.html`), robots/sitemap, 404 page, hreflang (en-us + x-default) | rollout Phase C/D | qa sweep |
| Decided-out (register) | PLP/PDP/compare/weekly-sale/store/account/cart | links absolute to `www.westerndigital.com` | owner decision batch |

### Phase 7 — QA
`qa` read-only sweep against the live origin: routing, fidelity vs capture, template conformance,
rendering, SEO metadata, links, a11y, perf budgets; `dynamics-check.mjs` parity replay.

## 5. Volume, effort and sequencing

| item | count | unit | estimate |
|---|---|---|---|
| archetypes (this run) | 3 | prototype + gate + blocks + deploy | 1 run |
| press-release siblings | 369 | importer + batch | 1 wave, importer-bound; ~1 h batch at concurrency 4 |
| program/static/form siblings | ~165 | clone + variance variants | 2–3 waves by sub-family |
| listings + search | 5 + 1 | blocks + index | 1 wave |
| dynamics owner decisions | 5 batches | see `dynamic-features.md § Decision batch` | blocks W3/W4 wiring only |

Remaining crawl: ~400 pages not yet captured (mostly press releases). Run `crawl.mjs --pages` in
batches of 100 (concurrency 4, ~6 min per 100) before W1; the importer reads the rendered-DOM
sidecars offline.

## 6. Risks and open decisions

- **Commerce boundary** — the biggest open decision; until resolved the migrated site is corporate +
  newsroom + solutions with the catalog linked out.
- **Cookie consent / tags** — none load on the new host until ids are supplied; the source's footer
  "Cookie Preferences" link becomes inert.
- **Locales** — 60+ hreflang alternates; this plan covers `en-us` only.
- **Content drift** — press releases are added weekly; W1 should be re-run incrementally
  (crawl `--refresh` on new sitemap entries).
- **Fonts** — Roboto is Apache-2.0; self-hosted, no licensing alert needed.
- **Instrument residuals** — chat launcher iframe and autoplaying hero are permanent pixel residuals,
  logged per gate.

## 7. Artifacts

`stardust/state.json` · `stardust/status.jsonl` · `stardust/journal.md` · `stardust/direction.md` ·
`stardust/replica/{inconsistency-register.md,progress.json,motion/,gates/,lift/,dump/}` ·
`stardust/prototypes/` · `stardust/dynamic-features.md` (+plan) · `stardust/eds-conversion-log.md` ·
`stardust/notes/stardust-improvements.md` (general stardust improvement candidates, per the user's request).

## 7. Wave W1b — the Products menu (user request, 2026-09-18)

**Owner decision recorded:** the user asked to migrate every page linked under the header's first-level
**Products** menu. This re-opens the commerce boundary for **product listing pages only**: the commerce
search API (`api.westerndigital.com/wdwebservices/v2/us/products/search`) answers cross-origin from the
`aem.live`/`aem.page` origins (verified in-browser), so PLP grids, facets, sort and pagination become a
**client-rendered block fed by that API** — no backend on the new host. Price/inventory
(`/store/cart/guest/products/priceAndInventory`) and `productreference.en-us.json` stay CORS-dead on the new
origin; the search API and the per-product endpoint (`/products/<code>?fields=FULL`) carry price, images and
capacity instead. PDPs, cart, account, compare and sign-in remain on the storefront (links absolute).

### Inventory (26 menu links → 15 distinct pages + 11 filter states)

| column | link | page | family | route |
|---|---|---|---|---|
| By Category | Product Portfolio | `/products/product-portfolio` | marketing landing (13 sections) | sibling of home/program modules + `product-rail` API-fed |
| By Category | Internal HDDs | `/products/hdd/internal-hdd` | **listing archetype** | prototype + gate (this wave) |
| By Category | External HDDs, Data Center Storage, Accessories | `/products/hdd/external-hdd`, `/products/data-center-storage`, `/products/accessories` | listing | siblings of the listing archetype (variance-budgeted) |
| By Use | Storage Platforms | `/solutions/data-center-storage-platform` | program + form | program sibling, `form` scaffold |
| By Use / By Capacity | 11 × `/products/hdd?filterBy…` | one page `/products/hdd` | listing | one sibling; the block reads `filterBy<Facet>=<value>` → `:<facet>:<value>`, the hero h1 templates "Hard Drives for {use case}" / "{range} Hard Drives" (measured on all 11 states, same CTA + image) |
| Featured | What's New, Most Popular, Promotions | `/explore/whats-new`, `/promo/best-sellers`, `/promo` | program (product rails) | program siblings + `product-rail` API-fed |
| Featured | Limited-Time Offers, Certified Refurbished, Final Production | `/products/weekly-sale`, `/products/recertified`, `/products/final-production` | listing (variants) | siblings; recertified/final-production use `customQuery=optionalCondition:*recertified*` / `*outlet*` |
| Featured | See All Benefits, Tiered Pricing | `/business/account-benefits`, `/business/account-benefits/tiered-pricing` | program / thin (login-gated copy) | program sibling / thin |
| Featured | Sign Up Now | `/store/business/registration` | storefront account | **stays on the storefront** (absolute link) |

### Steps
1. Listing archetype `/products/hdd/internal-hdd`: replica Phase 3–4 (prototype on the canon, gate 1440/360), then blocks: `category-banner`, `chips`, `product-listing` (API), `faq`, `resource-cards`, `buy-direct`, `split-band` reuse; deliver + published-origin gate.
2. Listing siblings (7 pages incl. `/products/hdd`): variance probe → variant classes → content generated from the sidecars → deliver → content-count + pixel gate per page.
3. Program siblings (6) + product portfolio: composition map (`stardust/.work/products-menu/composition-*.md`) → blocks reused, `product-rail` (API-fed, authored by product code) added → deliver → gates.
4. Nav document: Products links relocalised to the new origin as pages go live; `Sign Up Now` stays absolute.
5. Dynamics rows 12/14 updated: `product-catalog` → **client-rendered / self** for PLPs (search API), decided-out for PDP/cart/compare; `cart-hydration` unchanged.
