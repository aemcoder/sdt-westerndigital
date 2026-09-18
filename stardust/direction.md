---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-09-18T07:05:11Z
  againstInput: https://www.westerndigital.com/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.westerndigital.com/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-18T07:05:11Z). Provenance: verbatim `--prep` promotion
(full-prep branch; the descriptive synthesis was authored by replica from the crawl + css-lift
probes because crawl.mjs alone does not emit PRODUCT/DESIGN — see notes/stardust-improvements.md N-05).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(0 entries — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

## Hands-off activation

Activated 2026-09-18T07:05:11Z by the user's instruction "proceed without asking for my input".
state.json.handsOff = true. Every interactive gate auto-resolves per the master skill
§ Hands-off mode; quality gates run unchanged.

Named assumptions:
- Volume caps: 106 pages crawled of 508 sitemap URLs + nav-discovered families
  (hands-off default 100 overall / 20 per template, +6 for header/footer-linked pages).
- Archetype set for this run: home (landing), press release (article), corporate
  responsibility (program) — see stardust/replica/migration-plan.md § Archetype choice.
- Dynamics owner decisions ship the interim tier (dynamic-features.md § Decision batch).
- Consent banner (Relyance) is dropped at migration and re-added by a CMP at deploy.
