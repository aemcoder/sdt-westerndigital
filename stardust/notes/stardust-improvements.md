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
