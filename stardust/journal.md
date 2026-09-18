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
## 2026-09-18T10:40:00Z — Phase 3–4: three archetypes recreated and gated at 1440 and 360

**Prompt:** (continuation of the same run) recreate the archetypes, run the source-fidelity gate, then deploy.

**Decisions:**
- Content root `.mainContainWrap` on both sides; prototypes built from `src/` + shared chrome partials by `stardust/.work/proto/build.mjs` (cumulative canon: `canon.css` + `canon.js` + per-archetype CSS).
- Hero at rest on slide 2 with the live `.darken-left` scrim: the live capture's autoplay state; Splide clones mirrored (8 `li`) so content-diff pairs every CTA.
- Chrome scroll state cloned from measurement: `body.minHeader` (scrollY>0 → header `top:-40px`) on pages without a sub-nav; program pages never pin the header and their sub-nav gains `sticky-stuck` (fixed, items flush-left at x=80).
- Fluid container model encoded: `.contain` 100% / 992 / 1140 / 1464 steps; the 1920 box check matched live exactly (doc 6396).
- AEM richtext bytes are load-bearing: 16 `&nbsp;` entities incl. a trailing one changed a wrap; mirrored verbatim. Footer margins mirror AEM's floated-grid BFCs (`display: flow-root` wrappers).
- Motion: only measured behaviors implemented (minHeader, sticky-stuck, hero progress-item state machine + 5s autoplay, draggable rails); measured-dead hovers left out.
- Corporate 1440 ran 5 iterations (documented over-cap): one no-op re-verify and two rounds fixing content-fidelity defects the gate exposed (400-char dump truncation).

**Artifacts touched:**
- `stardust/prototypes/{canon.css,canon.js,home.css,press-release.css,corporate-responsibility.css,partials/,src/,*-proposed.html}` — created
- `stardust/replica/{progress.json,gates/*,motion/*.json,lift/,dump/,outline/}` — created
- `stardust/scripts/replica/{css-lift,section-dump,dump-outline,chrome-scroll-probe}.mjs` — project instruments
- `stardust/eds-schema/*.json` — created; `stardust/state.json` (3 pages approved, hands-off) — updated

**Findings worth flagging:**
- Live header is `position: sticky; top: auto` on program pages (inert stickiness) — a probe of computed `top`, not `position`, is what reveals chrome behavior.
- The capture-time `inert` attribute on the header (consent focus trap) and the baked-in banner confirm the crawler's consent dismissal did not take effect.

**Open questions:** none blocking; owner decisions listed in `stardust/dynamic-features.md § Decision batch`.

**Next:** Phase 5 — deploy the three archetypes to EDS (blocks, nav/footer docs, DA upload, published-origin gate).

---
## 2026-09-18T11:50:00Z — Phase 5: EDS conversion done; DA delivery blocked on the expired token

**Prompt:** (continuation) deploy the three gated archetypes to EDS.

**Decisions:**
- Block inventory locked (see `stardust/eds-conversion-log.md`): header, footer, hero-carousel, category-tabs, cards ×4 variants, columns ×2 variants, split-band, photo-hero, subnav, breadcrumb; corporate CTA band as default content with the `dark` section style.
- Hidden commerce quick-view content and hero clone text deliberately not authored (decided-out / #100) — recorded as gate deviations, not accidents.
- Images rehosted to DA `media/wd/<basename>` (49 + 2 logo SVGs) — upload script ready, blocked on the token.
- Code pushed to `main`; Code Sync serves the blocks. Pre-delivery harness read: 0.35–1.81 % vs live at both breakpoints.

**Artifacts touched:**
- `styles/styles.css`, `styles/fonts.css`, `fonts/`, `favicon.ico`, `blocks/*` (10 blocks), `content/**` (5 docs) — created/updated
- `stardust/runtime-contract.json`, `stardust/eds-conversion-log.md`, `stardust/eds-schema/*.json` — created
- `stardust/.work/deploy/{gen-content.mjs,upload-media.sh,deliver.sh,build-harnesses.sh,media-map.json}` — run scripts
- `stardust/replica/progress.json` (edsHarness + publishedOrigin.pending), `stardust/status.jsonl` (blocked line) — updated

**Findings worth flagging:** N-15…N-18 in `stardust/notes/stardust-improvements.md` (harness section-metadata phantom, fragment wrappers, sticky host, lint vs `--no-save` Playwright).

**Open questions:** none new — the DA token refresh is the one external dependency.

**Next:** refresh `DA_TOKEN`, run `stardust/.work/deploy/deliver.sh`, then the published-origin gate per archetype and breakpoint; then user review before any rollout wave.

---
