# Stardust — learnings and improvement proposals from the westerndigital.com replica run (2026-09-18)

One hands-off session: `eds-new-site` → `replica` (extract, preserve-direction, 4 prototyped archetypes, gates) →
`deploy` (29 blocks, 18 pages live) → a 15-page Products-menu wave run by three parallel workers. 42 raw notes were
gathered along the way (`stardust-improvements.md` N-01…N-35, `stardust-improvements-program.md` N-P1…N-P7). This file
is the synthesis: what the run proved, what cost the most, and what to change in the plugin — ranked by impact.

## 1. The ten learnings that mattered most

| # | learning | evidence from this run | proposal |
|---|---|---|---|
| 1 | **The harness understates; only the published origin counts — and the gap is entirely publish-pipeline markup transforms.** | Harness 0.35–1.81 % → first published round 10.5 %/11.5 % with −808 px on every page. Causes: `<li>` text p-wrapped before a nested `<ul>`, `<p><strong>` column titles, `<p><a>` buttonized, trailing `&nbsp;`/empty paragraphs stripped, intrinsic `width/height` stamped on every `<img>`. | Ship a `pipeline-normalize.mjs` (or round-trip a scratch doc through preview) before the harness read; list the transforms in every block brief; document the U+200B carrier for load-bearing trailing nbsp. (N-21, N-23, N-15) |
| 2 | **Prototyped archetypes hit the bar; direct-authored compositions plateau at 360 — exactly as the docs warn.** | Listing family (prototyped): ≤1.4 % / ≤3 %. Program family (7 pages from outlines, no prototype): 0.5–9.5 % at 1440 but 7.5–16 % at 360 after 4 published rounds. | Require the 360 section-dump to be read before the first CSS line; budget an explicit mobile-only round; a page introducing ≥3 new modules gets a mini-prototype. (N-34) |
| 3 | **The gate must settle the build side too when the build is a real site.** | Published home read 10.5 % because the hero rested on slide 1 and the lazy badge was unloaded; `--settle` on both sides → 0.86 %. | `gate.sh` settles the build when the URL is not localhost (or `GATE_BUILD_SETTLE=1`). (N-19) |
| 4 | **Measure chrome in every state, not just closed.** | The mega menu passed every gate as a narrow floating box; measured open it is a full-width panel with wide 5/12 columns, a text column and a business band. Fix took one probe and one rebuild. | `chrome-parity.mjs` opens each top-level menu and compares boxes + a crop; "open states" join the scroll morph as required outputs. (N-35, N-13) |
| 5 | **Content probes read the DOM; the gate promises visible content.** | Hidden duplicates (per-filter banner variants, modal anchors, mobile pagination copies) produced 11 of 18 reds on one page; a U+200B carrier made a heading "missing". | `content-inventory` excludes hidden/zero-rect nodes by default, pairs by href before text, strips zero-width chars. (N-28, N-22, N-14) |
| 6 | **Variance probes with guessed selectors report "no variance".** | 7 listing siblings → `deltas=0` because `.product-tile`/`.refinement` matched nothing; a 30-line class-frequency survey of the sidecar produced the real probe set. | Ship `class-survey.mjs`; make the probe fail loud on a 0-match archetype selector. (N-29) |
| 7 | **The commerce boundary is a measurement, not a policy.** | The storefront search API echoed our origin in ACAO → PLP grids, facets, sort and pagination became a client-rendered block in one afternoon; price/inventory stayed CORS-dead; rails refresh by `code_string:(a OR b)`; base-product payloads ≠ SKU captures. | `dynamics-detect` should CORS-probe every host-bound endpoint from the target origin and record the identity level (base vs SKU) of any refreshable data; "fill-only" is the safe default for authored rails. (N-P7, dynamics amendment) |
| 8 | **Parallel workers need ledger shards and a merge step.** | Two waves ran concurrently by isolating files (`progress-program.json`, `eds-conversion-log-program.md`, `media-map-program.json`); it worked but the ledgers are split by wave, and shared `styles.css` had to be frozen. | Name the shard convention in rollout's execution model, ship `merge-ledgers.mjs`, and seed a canonical section-modifier vocabulary in `styles.css` from the first archetype. (N-33, N-P2) |
| 9 | **Chrome geometry rules leak into flyouts.** | `.nav-row .contain { display:flex; height:56px }` matched the panel's own `.contain` and centred the whole menu at y=−120 — invisible until the panel existed. | Chrome CSS uses child combinators for row rules (`.nav-row > .contain`); the header brief should say so. |
| 10 | **Run-only residue must stay under `stardust/.work/`.** | `visual-diff` wrote `qa/vdiff/` at the project root; the localize script silently rewrote `nav.html`; a scratch pipeline probe page cannot be unpreviewed with the IMS token (403). | Fix visual-diff's default out dir; `localize-links` prints touched FILES; scratch probes use a dedicated folder and an unpreview path that works. (N-25, N-27, N-24) |

## 2. Proposals by skill

### replica
- Prototype every archetype (kept the bar); when breadth forces direct authoring, read 360 outlines first and budget the mobile round (N-34).
- `gate.sh`: settle the build side off-localhost (N-19); marker default = slug, checked against `.plain.html` for published origins (N-20); recommend on-disk bash for parallel gate loops (N-32); side-by-side crops next to diff PNGs (N-P4).
- Chrome: open-state parity (N-35), measured scroll timeline before the first pixel round (N-13), sticky on the `<header>` host (N-17).
- Capture policy: autoplay heroes and lazy chrome need the settle pass and an explicit rest-state policy (N-12); mobile hero assets are separate authored images, so the lift should record background images per breakpoint (N-31); fixed chat launchers are a known residual the gate could mask (N-08).
- Sibling variance: class survey before probes, fail loud on 0 matches (N-29); the sidecar, not the outline, is the content-presence evidence (N-P1, N-11).

### deploy
- Pipeline transforms in every brief + a normalize/round-trip step before the harness (N-21, N-15, N-P3); `height:auto` on chrome images (N-23); section gaps on padding, never margins (N-30); `[hidden] { display:none }` in any toggling block (N-P6); paired CTAs grouped into one row (N-P5); `loadFragment` decorates the fragment (N-16).
- Round-trip harness runs block JS as real ES modules and lets API-fed blocks declare runtime-data sections (N-26).
- Tooling: Playwright as a real devDependency so lint can run (N-18); `localize-links` reports touched files (N-27); scratch probes and unpreview path (N-24).
- Section-modifier vocabulary in `styles.css` from wave one (N-P2).

### diff
- Visible-only inventory, href-first pairing, zero-width stripping (N-28, N-22); inline `<style>` text and hidden commerce strings out of the 🟡 list (N-14); output under `stardust/.work/diff/` (N-25).

### dynamics
- CORS-probe host-bound endpoints from the target origin at triage time; record identity level and default to fill-only refresh (N-P7, § Amendment in `dynamic-features.md`).

### extract / eds-new-site
- Gzip sitemaps without `Content-Encoding` (N-03); consent dismissal verified by pixels, not by return code (N-04); scripted brand surface and page typing for `--prep` (N-05, N-06); content-root discovery for AEM-classic sites (N-07); sidecar size vs the gitignore (N-10).
- `eds-new-site`: pull --rebase after the template clone (N-01); DA folder guard "absent" vs "empty" (N-02); reconcile the fstab guidance with the boilerplate AGENTS.md (N-09).

### stardust (orchestration)
- Ledger shards + merge (N-33); a hands-off run should record the fidelity tier decision when it drops below archetype (done here in the plan and journal); the tracking GitHub issue pattern (one comment per wave) worked well and could be a rollout Phase H output.

## 3. What worked and should be kept
- Values lifted from the source CSS + section-dump geometry converged in 1–2 iterations per breakpoint on every prototyped page.
- Fail-loud instruments (identity assertion, blank-render guard) caught real mistakes cheaply; the one silent failure class was "selector matched nothing" (N-29).
- The published-origin gate as the only number that counts: every regression this session was caught there, not by the harness.
- Per-wave workers with file isolation: three waves in one afternoon with a single integrator doing commits and pushes.

## 4. Index of raw notes
`stardust/notes/stardust-improvements.md` — N-01…N-35 · `stardust/notes/stardust-improvements-program.md` — N-P1…N-P7 ·
evidence under `stardust/replica/gates/*/`, `stardust/eds-conversion-log.md`, `stardust/eds-conversion-log-program.md`, `stardust/journal.md`.
