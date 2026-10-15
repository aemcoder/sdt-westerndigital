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
| `calculator` block (RAID / surveillance) — **done 2026-10-15 on `spike-a`** (25/25 known IO = source; pages `/spike-a/tools/*`, promotion to `/tools/*` is a content step) | 23 | none |
| forms: definition-driven `form` block (`data/forms/*.json`), local capture with a "no backend connected" notice, endpoint config in `scripts/site-config.js` — **scaffolded 2026-10-15 on `spike-a`**; wire when endpoint named; find-a-store filter (15b) still to build from a `data/wtb/` snapshot | 15 | intake endpoint |
| PLP facets / sort / paging / `filterBy…` state on `product-listing` — **done 2026-10-15 on `spike-a`** (search API, existing `categories`/`condition` rows; campaign tile snapshot) | 14 | none to ship (production: keep API CORS open to the new host; campaign feed same-origin) |
| tags/CMP/chat via `scripts/delayed.js` once ids arrive | 16–20 | ids |
| locale trees | 22 | scope |

## Phase C — verification

`stardust/dynamics/parity.json` written at rollout with one replayable check per row of status ≠ decided-out;
`dynamics-check.mjs --origin https://main--sdt-westerndigital--aemcoder.aem.live` → `stardust/qa/dynamics-report.md`.

Rows 14, 15, 23 verified 2026-10-15 on https://spike-a--sdt-westerndigital--aemcoder.aem.page: `dynamics-check` 14/14 (`stardust/qa/dynamics-report.md`); form submission replay on the preview pending the user's go-ahead.
