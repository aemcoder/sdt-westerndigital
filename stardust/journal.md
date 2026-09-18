# Journal — westerndigital.com replica (EDS migration)

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## 2026-09-18T07:15:00Z — Repo created; extract --prep --dynamics; preserve-mode direction; plan

**Prompt:** Migrate westerndigital.com to EDS with stardust as a same-design replica; create a new
private EDS repo with the personal `eds-new-site` skill; define the full-site migration plan; migrate
only 3 pages (home + 2 archetypes) to final fidelity in this run; proceed without asking; keep a notes
file of general stardust improvements.

**Decisions:**
- Flow: `replica` → `deploy` for the 3 archetypes; `migrate`/`rollout` for the rest (plan only). No `prepare-migration`.
- Repo `aemcoder/sdt-westerndigital` (private, `sdt-` Stardust prefix), fstab → da.live, Code Sync installation 96863683, boilerplate starter content published.
- Hands-off mode activated by the user's instruction; caps 100/20 → roster of 106 pages.
- Archetypes: home (landing), press release 2026-09-15 (article, 73% of sitemap), corporate responsibility (program, ~110 pages). Product listing rejected: commerce-rendered, decided-out.
- Content root for all gates: `.mainContainWrap` (adopted on the prototypes).
- Fonts: the site's own Roboto woff2 (Apache 2.0), self-hosted.
- Empty inconsistency register (pure replica).
- Dynamics: 23 curated rows; commerce/account/catalog decided-out this phase; tags/CMP/chat not loaded until ids arrive.

**Artifacts touched:**
- `fstab.yaml`, `.gitignore` (stardust block), `.hlxignore` — updated
- `stardust/state.json`, `status.jsonl`, `direction.md`, `journal.md` — created
- `stardust/current/` (106 page JSON + HTML sidecars, screenshots, fonts, logos, favicon, `_crawl-log.json`, `_brand-extraction.json`, `PRODUCT.md`, `DESIGN.md`, `DESIGN.json`, `brand-review.html`, `_dynamics.json`) — created
- `PRODUCT.md`, `DESIGN.md`, `DESIGN.json` (root) — promoted verbatim
- `stardust/replica/{inconsistency-register.md,migration-plan.md,lift/,dump/}` — created
- `stardust/dynamic-features.md`, `dynamic-features-plan.md`, `stardust/dynamics/` — created
- `stardust/scripts/{crawl.mjs,replica/,diff/,deploy/,dynamics/}` + project instruments `css-lift.mjs`, `section-dump.mjs` — copied/created
- `stardust/notes/stardust-improvements.md` — created

**Findings worth flagging:**
- `crawl.mjs` writes no brand surface / PRODUCT / DESIGN — the `--prep` synthesis is agent work; two project instruments (css-lift, section-dump) filled the gap and doubled as the Phase-3 CSS lift.
- The sitemap body is raw gzip; `sitemap_index.xml` is a 404 page. Product URLs are absent from the sitemap entirely.
- The consent banner survives the crawler's text-match "Accept" click and is baked into every crawl screenshot.
- `eds-new-site`: push after template clone is rejected without a rebase; DA list returns 200 `[]` for absent folders.

**Open questions:**
- Commerce boundary, form intake endpoint, tags/CMP ids, locale scope — recorded as the dynamics decision batch (interim tiers ship).

**Next:** Phase 3 — author the three prototypes (shared canon + per-archetype CSS) from the dumps/lifts, then the source-fidelity gate at 1440 and 360.

---
