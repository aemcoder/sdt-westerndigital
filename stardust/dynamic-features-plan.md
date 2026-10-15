<!-- stardust provenance: skill=stardust:replica (dynamics Phase 3 plan) · writtenAt=2026-09-18T07:10:00Z · from stardust/dynamic-features.md -->
# Dynamic features — plan

Rows reference `stardust/dynamic-features.md`. Every phase ends with a flow verified on the published
origin at 1440 and 360, a `parity.json` row, a journal entry and a commit.

## Phase A — archetype run (this run)

| deliverable | rows | authoring contract | verification |
|---|---|---|---|
| `header` block: mega-menu + hamburger, search overlay submitting to `/search?q=` | 1, 2 | `/nav` doc: section 1 promo bar (text + link + Shop / WD for Business), section 2 brand logo, section 3 four nav items each with nested `<ul>` columns, section 4 tools (account, cart, search) | motion-observe replay: hover/click opens the same panel as live; search submit navigates |
| `hero-carousel` block (home) | 3 | one row per slide: picture · eyebrow-less headline (`<h2>`, first slide `<h1>`-free — the page h1 is the category headline) · lede · CTA; progress-bar tabs from slide titles + descriptions authored as `<strong>title</strong> desc` rows | slide count = authored; autoplay t=0 frozen under the gate |
| `cards` block variants `dark-rail`, `product-rail`, `resource-rail` + scroll-based rail driver | 4 | one row per card | rail scrolls, controls hide when content fits (Swiper-lock semantics) |
| `category-tabs` block | 5 | tab rows: `<strong>Tab</strong>` head row then tile rows | tab switch changes visible tiles |
| YouTube auto-block | 7 | bare URL paragraph | plays on published origin |
| interim commerce / account / promo text | 9–13 | absolute links, static text | links resolve 200 on the source host |
| chat / tags / CMP not loaded | 16–20 | — | published page has zero third-party requests except fonts/media |

## Phase B — rollout waves

| deliverable | rows | owner decision |
|---|---|---|
| `helix-query.yaml` + newsroom hub + spotlights rail (document-first) | listings contract | none |
| `/search` results page reading `query-index.json` | 2 | corpus scope (interim: migrated pages) |
| `modal` block from `#modal` link markers; resource-center | 6 | none |
| `region-selector` page from synced sheet (`sync-sheets.mjs`) | 8 | none |
| `calculator` block (RAID / surveillance) | 23 | none |
| forms: `form` block with disabled submit + notice; wire when endpoint named | 15 | intake endpoint |
| tags/CMP/chat via `scripts/delayed.js` once ids arrive | 16–20 | ids |
| locale trees | 22 | scope |

## Phase C — verification

`stardust/dynamics/parity.json` written at rollout with one replayable check per row of status ≠ decided-out;
`dynamics-check.mjs --origin https://main--sdt-westerndigital--aemcoder.aem.live` → `stardust/qa/dynamics-report.md`.

## Phase D — spike-b: rows 14, 15, 23 (2026-10-15, hands-off)

| deliverable | rows | authoring contract | verification (spike-b preview, 1440 + 360) | owner decision |
|---|---|---|---|---|
| `product-listing` live layer: grid, facets, chips, sort, pagination, URL state; `scripts/site-config.js` productSearch | 14 | existing PLP docs: `categories` + `condition` rows, authored tiles (document-first), `filters` = facet groups in order | register-14: totals equal the source on 7 PLPs (32/32/21/22/21/7, WD_BLACK 2, Data Center 19); page 2, sort, chips; 0 page errors | commerce datasource on the new host |
| `form` block + `/data/forms/{sales-lead,contact-email,contact-investor,contact-loyalty,newsletter,recycle}.json` | 15 | `Source`/`Intro`/`Consent`/`Submit`/`Success` rows; variant `topics` (topic rows: label · content · [definition]); variant `media` | register-15: empty submission refused with the live words; local capture + notice; form-flow "filled posted" fails until an endpoint exists | intake endpoint per family |
| `calculator` block + `/data/calculators/{raid,surveillance}.json` | 23 | `Source`/`Hero`/`Intro`/`Benefits`/`Note <key>`/`Tip <field>`/`How it works`/`Results note`/`Recommendation`; variant `gradient` | register-23: 17 live vectors + 6 refusals replayed; URL prefill hook for replay | none |

Content (DA, new documents only): `/spike-b/company/contact-us`, `/spike-b/company/programs/communications-registration`,
`/spike-b/company/programs/easy-recycle`, `/spike-b/tools/raid-capacity-calculator`, `/spike-b/tools/surveillance-capacity-calculator`,
media under `/spike-b/media/`. No existing DA document modified or published.
