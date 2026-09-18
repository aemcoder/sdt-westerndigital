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
