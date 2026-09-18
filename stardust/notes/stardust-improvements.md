# Stardust improvement notes — westerndigital.com replica run (2026-09-18)

Running log of general (non-site-specific) improvement candidates for the
stardust plugin and the `eds-new-site` skill, harvested while migrating
westerndigital.com as a same-design replica. One entry per observation:
what happened, why it matters, suggested change. Entries are appended in
the order they were discovered.

---

## N-01 — eds-new-site: push after `gh repo create --template` is rejected

- **What happened:** `gh repo create --template adobe/aem-boilerplate --clone`
  clones before GitHub's async template copy finishes. A second commit
  ("chore: cleanup repository template") landed on the remote after the
  clone, so the first `git push` of `fstab.yaml` was rejected (non-fast-forward).
- **Why it matters:** the skill's step 3 says "commit to main and push";
  without a rebase the push fails and the fail-fast rule would halt the run.
- **Suggested change:** in step 3, `git pull --rebase origin main` before
  pushing, or clone only after the commit poll in step 2 returns ≥2 commits.

## N-02 — eds-new-site: the DA folder guard cannot distinguish "absent" from "empty"

- **What happened:** `GET https://admin.da.live/list/aemcoder/<site>/` returns
  HTTP 200 with `[]` for a folder that has never existed (verified with a
  random slug). The skill's step 1 expects a 404.
- **Why it matters:** the guard as written would either always "stop and
  ask" or be skipped by habit.
- **Suggested change:** treat `200 + []` as free; only `200 + non-empty
  array` blocks.

## N-03 — extract: sitemap.xml may be served gzip-encoded without `Content-Encoding`

- **What happened:** westerndigital.com's `/sitemap.xml` body is raw gzip
  (12 KB → 117 KB), and `sitemap_index.xml` returns a 404 HTML page.
  `curl` without `--compressed` writes binary; `grep '<loc>'` finds nothing.
- **Suggested change:** the discovery step (`ia-extraction.md` and any
  crawler sitemap fetch) should sniff the gzip magic bytes (`1f 8b`) and
  decompress before parsing, regardless of headers.

## N-04 — extract: consent dismissal reports success but the banner is baked into every screenshot

- **What happened:** `crawl.mjs` logged `consent dismissed via text-match fallback ("Accept")`, yet all
  106 full-page screenshots carry the fixed-bottom "Use of Tracking Technologies" card (Relyance CMP)
  at the first viewport's bottom edge, and the captured `<header>` carries `inert=""` (the overlay's
  focus trap was still active at capture).
- **Why it matters:** the screenshot is the Phase-2.5 vision ground truth and the recreation reference;
  a baked-in banner hides ~140px of hero on every page.
- **Suggested change:** after the click, poll for the banner's disappearance (or `body:not([inert])` /
  `header:not([inert])`) before capture; when it persists, retry with the "Reject All" text match and
  record `consent.method: "text-match(Accept) — persisted"` so the report flags it.

## N-05 — extract: `crawl.mjs` covers Phases 1–2 only; Phases 3–5 (brand surface, PRODUCT/DESIGN, brand-review) are unscripted

- **What happened:** the bundled crawler writes `pages/*.json|html`, screenshots and `_crawl-log.json`.
  `_brand-extraction.json`, `PRODUCT.md`, `DESIGN.md`, `DESIGN.json` and `brand-review.html` had to be
  authored by the agent from ad-hoc probes (two project-owned instruments were written for it:
  `css-lift.mjs` and `section-dump.mjs`).
- **Why it matters:** the SKILL.md reads as if `extract` produces those files; the `--prep` summary,
  page typing and module detection are also agent-side. Every run re-derives the same aggregation.
- **Suggested change:** ship a `brand-surface.mjs` (palette/type/radii/shadows/button aggregation from
  computed styles + font-face harvest + logo chain) and a `brand-review.mjs` renderer; promote the two
  instruments above into `replica/scripts/` (css-lift is exactly § CSS lifting; section-dump is the
  offline authoring map the recreation procedure asks for).

## N-06 — extract: `--prep` page typing and module detection need a scripted first pass

- **What happened:** typing 106 pages by URL pattern + heading shape was done in a throwaway node
  script; `DESIGN.json.extensions.modules[]` was hand-written from the dumps.
- **Suggested change:** a `prep-type.mjs` that emits a draft `type` per page from URL segments +
  heading/CTA/media counts, and a heading/CTA-sequence repeat detector for module candidates
  (the signal priority already specified in `prep-mode.md § 3`).

## N-07 — replica: content root discovery is manual on AEM-classic sites

- **What happened:** westerndigital.com has no `<main>`; the content root is `section.mainContainWrap`
  (header + footer are siblings). `anchor.mjs`/`content-diff` default to `main`; `--main body` is banned.
- **Suggested change:** a one-shot "content-root finder" (largest visible box between `header` and
  `footer` that contains the `h1`, excluding chrome) printed by css-lift/anchor with a ⚠ when `main`
  is absent — saves one blind gate run per site.

## N-08 — dynamics-detect: the fixed chat-launcher iframe is a pixel-gate residual the gate should mask automatically

- **What happened:** a 65×65 `position:fixed` iframe (Genesys chat) sits bottom-right on every page and
  repeats at every stitched seam; the replica prototype does not (and must not) load it.
- **Suggested change:** stitch-shot/pixel-compare could read `_dynamics.json` rows of class T/chat and
  auto-emit a `--mask` for fixed third-party launchers, printed on the verdict line.

## N-09 — eds-new-site vs boilerplate AGENTS.md: contradictory guidance on `fstab.yaml`

- **What happened:** the boilerplate's AGENTS.md says `fstab.yaml` is retired (config lives at
  tools.aem.live), while `eds-new-site` step 3 commits it so Code Sync auto-creates the config entry —
  which worked (config.json showed the da.live content source).
- **Suggested change:** note in the skill that the file is only the bootstrap signal and may be deleted
  after the config entry exists, so future agents don't "fix" it away.

## N-10 — artifact-map/gitignore: rendered-DOM sidecars balloon the repo

- **What happened:** `crawl.mjs` saves `pages/<slug>.html` (settled DOM) next to every JSON; on an
  AEM-classic + SFCC site each is ~1.2 MB, so 106 pages = ~127 MB of text that
  `reference/stardust.gitignore` does not exclude. The first phase commit would have added 1.3 M lines.
- **Suggested change:** add `current/pages/*.html` to the gitignore template (they are regenerable
  captures like screenshots) or have the crawler write them gzipped.

## N-11 — replica: section-dump truncates text at 400 chars, and a truncated string is indistinguishable from a full one

- **What happened:** the authoring map (my `section-dump.mjs`, but the same holds for `pages/<slug>.json` body fields) cut a 600-char paragraph at 400 chars; the prototype shipped an invented ending and the pixel gate caught it as a one-line wrap difference two rounds later.
- **Suggested change:** any capture field that truncates must carry an explicit `…[truncated N]` marker, and the recreation procedure should say: long text is copied from the rendered-DOM sidecar (`pages/<slug>.html`) raw innerHTML, never from a JSON/dump summary — including `&nbsp;` entities (recreation-procedure § Granularity parity already says the bytes are load-bearing).

## N-12 — replica: a live capture of an autoplaying hero is nondeterministic; the doc should name the policy explicitly

- **What happened:** stitch-shot's live capture rested on slide 2 (autoplay advanced during the 3 s wait + settle); the dump/crawl showed slide 1. The prototype now rests on slide 2 to match. A future capture may show slide 3.
- **Suggested change:** stitch-shot could record `t0State` (active slide index per carousel) in a sidecar so the gate can assert the prototype matches THAT capture, or offer `--freeze-carousels` that forces index 0 before capture on both sides.

## N-13 — chrome-parity: scroll-state chrome needs a measured timeline before the first pixel round

- **What happened:** the live header's scroll behavior differs per template (home/PR: `body.minHeader` → sticky `top:-40px`; program: header `top:auto` never pins, sub-nav `sticky-stuck` fixed). motion-observe's `headerTimeline` samples at 1200px steps and reports `height`/`transform` — both unchanged here — so it missed the morph; a small probe of computed `top` and the sub-nav position at fine steps (0/50/100/150/…) found it in one hit.
- **Suggested change:** add computed `top`, body class list and any `position:fixed/sticky` element under `main` to `headerTimeline`, with dense sampling in 0–200px.

## N-14 — content-inventory: inline `<style>` text and hidden commerce strings dominate the 🟡 list

- **What happened:** ~70 of 77 home findings were `<style>` blocks (AEM per-section background CSS) and hidden compare-tray/quick-view strings classified as body text on the live side.
- **Suggested change:** exclude `style`/`script`/`template` text from the inventory (D15 already forbids it in the build), and label hidden-DOM findings separately so the reviewer sees "hidden parity" vs "visible copy" at a glance.

## N-15 — deploy: `build-harness.mjs` leaves `section-metadata` blocks in the DOM and drops their styles

- **What happened:** on the harness every styled section carried a 48px phantom `section-metadata` wrapper (the runtime tried to load a `section-metadata` block and 404ed) and none of the `style` classes (`surface`, `dark`, …) were applied — section heights were +48 and grounds white. The pipeline does both transforms server-side.
- **Suggested change:** have `build-harness.mjs` emulate the pipeline: strip the `section-metadata` block and add its `style` value as classes on the section div (other keys as `data-*`). A 20-line post-process; without it the harness pixel read is meaningless for styled sections.

## N-16 — deploy: the chrome briefs should state that `loadFragment` decorates the fragment

- **What happened:** the `/nav` and `/footer` documents arrive with each section's prose wrapped in `.default-content-wrapper`; a template-slotted header/footer that iterates `section.children` sees one DIV per section and slots nothing. Recorded in two blocks in one run.
- **Suggested change:** Step 6 of the deploy skill: "unwrap `:scope > .default-content-wrapper` before reading a fragment section", plus a note that `while (frag.firstElementChild) arr.push(frag.firstElementChild)` never terminates (the child must be removed).

## N-17 — deploy: sticky/fixed chrome must be applied to the `<header>` host, not the block

- **What happened:** `header .header { position: sticky }` cannot stick — the host `<header>` is only `--nav-height` tall, so the sticky child has no scroll range; the scroll-state morph (`body.minHeader`) silently did nothing on the EDS page while the prototype (a body-level `header.header`) worked. Found only by the harness pixel read (seam repeats missing).
- **Suggested change:** in Step 6 / the header brief: "position the `<header>` element itself (styles.css) for sticky chrome; the block paints the inside".

## N-18 — deploy: `npm run lint` is unavailable in a run that relies on a `--no-save` Playwright

- **What happened:** the boilerplate's `eslint` needs devDependencies (`@babel/core`) that a real `npm i` would install — but that `npm i` prunes the `--no-save` Playwright every gate depends on (extract SKILL.md § Setup already warns). So lint never runs in a stardust deploy run.
- **Suggested change:** install Playwright as a real devDependency in the project (or into `stardust/.work/node_modules` with `NODE_PATH`), so `npm i` is safe and lint can run in the loop.
## N-19 — replica gate.sh: the build side is captured without `--settle`, which is wrong for the published-origin regime

- **What happened:** the first published-origin round read 10.5 % on the home page: the live capture (settled) rested on hero slide 2 and had the lazy footer badge loaded; the build capture (no settle, 1.2 s wait) showed slide 1 and the unloaded badge. Re-capturing the build with `--settle` was the difference between 10.5 % and 0.86 %.
- **Suggested change:** `gate.sh` should settle the build side whenever the build URL is not a localhost prototype (or take `GATE_BUILD_SETTLE=1`); the published-origin section of `source-fidelity-gate.md` should say so — the published page is a real lazy/autoplay site, not a static prototype.

## N-20 — replica gate.sh: the identity marker advice ("brand name") fails on client-rendered chrome

- **What happened:** `--marker "Western Digital"` aborted the corporate round (exit 4): the brand string lives only in the nav fragment (client-rendered) and the `<title>` says "WD". The default slug marker would have passed.
- **Suggested change:** check the marker against `.plain.html` (or the served HTML + the nav fragment) for published origins, and advise the slug default first — the brand-name advice is for stale-server collisions on localhost.

## N-21 — deploy: the local harness never applies the publish pipeline's markup normalisation — the published-origin gap was entirely pipeline transforms

- **What happened:** `aem up --html-folder` served the authored HTML verbatim, so the harness read (0.35–1.81 %) missed four transforms the DA → pipeline path applies: (a) an `<li>` whose text is followed by a nested `<ul>` gets its text wrapped in `<p>`; (b) `<strong>` column titles arrive as `<p><strong>`; (c) `<p><a>` becomes a buttonized `p.button-wrapper` (inline-flex); (d) trailing `&nbsp;` before a closing tag and `&nbsp;`/`<br>`-only paragraphs are stripped (a U+200B after the nbsp survives and keeps the nbsp — and the live line wrap). Cost: one full published round plus five fixes.
- **Suggested change:** `build-harnesses.sh` / deploy § Harness should round-trip the content through the real pipeline before the harness read — preview a scratch document per page and fetch its `.plain.html` — or ship a `pipeline-normalize.mjs` that applies (a)–(d) locally. deploy's block briefs should list (a)–(c) as "markup you will receive", and the content-preservation rules should name (d) with the carrier technique.

## N-22 — diff content-inventory: `norm()` does not strip zero-width characters

- **What happened:** a heading carrying a trailing U+200B (pipeline carrier, N-21 d) was reported as `MISSING HEADING` + `EXTRA` — a false structural red.
- **Suggested change:** strip `​‌‍﻿` in `norm()` (they are invisible and never load-bearing for pairing).

## N-23 — deploy foundation: `height:auto` is only reset on `main img`; pipeline-stamped intrinsic sizes distort lazy chrome images

- **What happened:** the pipeline stamps `width="1280" height="876"` on every `<img>`; the boilerplate resets `height:auto` only under `main`, so the lazy footer badge rendered 100×876 (its `max-width` applied, its `height` attribute did not) and pushed the page 808 px — on every archetype.
- **Suggested change:** the deploy foundation checklist should add `header img, footer img { height: auto; }` (or reset `img` globally), and the chrome briefs should say lazy images outside `main` need it.

## N-24 — deploy: `admin.hlx.page` DELETE (unpreview/unpublish) returns 403 with the DA IMS token that POST accepts

- **What happened:** a scratch document used to probe the pipeline could be deleted from DA (204) but not removed from the preview origin (403 on `DELETE /preview/...` and `/live/...`), so it lingers at `/stardust-nbsp-test` on aem.page.
- **Suggested change:** deploy's "scratch probe" advice should use a dedicated `stardust-scratch/` folder and tell the operator to unpublish via the da.live UI / sidekick, or avoid previewing scratch docs at all when the token cannot unpreview.

## N-25 — diff visual-diff writes `qa/vdiff` at the PROJECT ROOT (write-boundary bug)

- **What happened:** after the published-origin content/visual probes a `qa/vdiff/` folder appeared at the repo root (untracked). The master skill's write boundary reserves the root `qa/` for the EDS project; stardust run residue belongs under `stardust/.work/<skill>/`.
- **Suggested change:** visual-diff's default output dir → `stardust/.work/diff/vdiff/` (or honour `--out`), and add `qa/vdiff` to the residue list the skills reap.

## N-26 — deploy block-roundtrip: the harness inlines block JS and cannot resolve `import` — API-fed blocks are unverifiable there

- **What happened:** `product-listing` (imports `/scripts/wd-commerce.js`, the cross-block client AGENTS.md mandates under `/scripts/`) and `category-banner` (imported the param parser) both reported "block JS failed to install"; the raw rows then false-diffed as 43 structural reds (facet options and pagination that the API renders at runtime). Inlining the 6-line parser fixed category-banner; the API client cannot be inlined per block without duplicating it.
- **Suggested change:** run block JS as real ES modules in the round-trip harness (serve the repo root with a dev server and load the page, like the deploy harness does) and let a block declare `@runtime-data` sections (API-fed) that the round-trip skips instead of red-flagging; keep the static blocks' round-trip as is.

## N-27 — deploy: `localize-links.mjs` is whole-tree by design — a new page re-touches already-delivered docs

- **What happened:** localizing the listing page also rewrote `content/nav.html` (the Products menu link to the new page became relative), so the nav document needs re-delivery — easy to miss when the operator's mental model is "I only added one page".
- **Suggested change:** the script should print the list of FILES it modified (not only link targets) and deploy's per-page brief should say "re-PUT every file localize-links touched".

## N-28 — diff content-inventory pairs CTAs by TEXT only — hidden duplicate anchors read as MISSING on the visible copy

- **What happened:** every live promo box carries a visible modal trigger ("Learn More", href null) AND a hidden anchor to the same label; the storefront also hides a per-filter banner variant set and mobile pagination duplicates. `diffInventories` matches by normalised text, so the build's single visible link pairs with the first live copy and every hidden duplicate becomes a 🔴 MISSING CTA — 11 of 18 reds on one page were this class, and a matching visible href does not help (href is not compared).
- **Suggested change:** exclude `display:none` / `[hidden]` / zero-rect nodes from the SOURCE inventory by default (`--include-hidden` to opt back in), and prefer href-equal pairs before text-only fallback. Same root cause as N-22's zero-width case: the classifier's inventory is DOM-wide, the gate's promise is "visible content".

## N-29 — replica sibling-variance probe: default probes miss commerce templates; the class vocabulary must be harvested first

- **What happened:** the probe with guessed selectors (`.product-tile`, `.refinement`) reported "deltas=0" for 7 siblings that in fact varied in hero shape, rail tree, tile badges/promo/strike price and section count — the selectors matched nothing, so nothing varied. A 30-line class-frequency survey of the sidecar (`productListItem`, `clp-filters-item`, `green-promo`…) produced the real probe set in one pass.
- **Suggested change:** ship a `class-survey.mjs` step before the probe (top class names by frequency under the content root, filtered by intent keywords) and make the probe fail loud when a `--probe` selector matches 0 nodes on the archetype.

## N-30 — deploy: section `margin-bottom` collapses with the next section's first-child margin — use padding for measured gaps

- **What happened:** the live "Choose Recertified" strip has `margin-bottom:16px` inside a wrapper; authored as a section margin it collapsed with the breadcrumb's `margin-top:24px` and the listing sat 16px high. Padding on the section reproduces the live gap.
- **Suggested change:** the block/section CSS checklist should say: measured inter-section gaps go on padding (or a wrapper), never on section margins, because EDS sections are siblings whose margins collapse.

## N-31 — deploy: mobile hero assets are a separate authored image, not a crop

- **What happened:** the archetype's live page painted no mobile banner, so the block hid the image below 768px; every sibling paints a DIFFERENT mobile asset (`*-mobile-banner.jpg`, 840px thumbs). The 360 gate opened at 28–41% in the first band until a second picture cell was added to the banner model.
- **Suggested change:** the CSS-lift / section-dump should record background-image URLs per breakpoint and flag when they differ, so the block model gets a mobile media slot up front.

## N-32 — zsh: functions defined in the interactive shell and run in `( … ) &` subshells lost PATH for `head/sed/awk` in this harness

- **What happened:** two gate rounds printed `command not found: head` from inside backgrounded shell functions (the same pattern had worked minutes earlier); moving the loop body to an on-disk `#!/bin/bash` script fixed it. Cost: one wasted gate round (16 captures).
- **Suggested change:** the gate docs should recommend on-disk bash scripts (`stardust/.work/deploy/*.sh`) for any multi-page parallel gate loop rather than shell functions in the agent's interactive shell.

> Program-family wave notes N-P1…N-P7 live in `stardust/notes/stardust-improvements-program.md` (written by the parallel worker to avoid concurrent edits of this file — a hands-off multi-worker run needs a per-worker notes shard + a merge step; see N-33 below).

## N-33 — stardust: parallel workers need per-worker ledger shards and a merge step

- **What happened:** two workers delivered two page families concurrently. To avoid clobbering `progress.json`, `eds-conversion-log.md`, `status.jsonl`, `media-map.json` and the notes file, the second worker wrote sibling files (`progress-program.json`, `eds-conversion-log-program.md`, `media-map-program.json`, `stardust-improvements-program.md`). It worked, but the ledgers are now split by wave rather than by page type, and `status.jsonl` was appended by both (append-only, so safe).
- **Suggested change:** rollout's execution-model section should name the shard convention (`<ledger>.<wave>.json`) and ship a `merge-ledgers.mjs`; `update-coverage.mjs` already exists for coverage — extend it to progress/notes.

## N-34 — replica: direct block authoring of unique compositions plateaus at 360 as the docs predict

- **What happened:** the 7 program-family pages (no prototype, authored from section-dump outlines) closed at 0.5–9.5 % at 1440 but 7.5–17 % at 360 after 4 published rounds; the listing pages, which had a prototyped archetype, closed at ≤3 % on both breakpoints. The mobile gap came from values approximated from the 1440 lift in the first pass even though 360 outlines existed.
- **Suggested change:** when a "sibling" carries new modules, require the 360 section-dump to be read BEFORE the first CSS is written (a checklist item in the fan-out brief), and budget a mobile-only fix round explicitly. Consider a "mini-archetype" prototype for any page introducing ≥3 new modules.
