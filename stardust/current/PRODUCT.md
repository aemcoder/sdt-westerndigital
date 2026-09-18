<!-- stardust:provenance
writtenBy: stardust:replica (extract --prep Phase 4, descriptive)
writtenAt: 2026-09-18T07:05:00Z
againstInput: https://www.westerndigital.com/
readArtifacts:
  - stardust/current/pages/*.json (106 pages)
  - stardust/current/_brand-extraction.json
  - stardust/current/_crawl-log.json
  - stardust/current/assets/screenshots/*.png (vision check: index, press release, corporate-responsibility)
synthesized: none — every statement below is read off the captured site; inferred sections are marked
-->

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences read the captured copy directly:

- **Data-center and enterprise buyers** — the home hero ("Built for Scale — The enduring role of HDDs in the AI era"), the Solutions tree (data center, AI storage infrastructure, cloud, HPC) and the Ultrastar/WD Gold product cards speak to infrastructure architects and procurement.
- **Consumers, prosumers and creators** — Shop by Category tiles (NAS, Surveillance, External Drives), WD Red / WD Blue / G-DRIVE product cards, the store, gaming and creative-professional solution pages.
- **Business and channel buyers** — "WD for Business" utility link, Business Account Benefits, Pro Rewards, Line of Credit, Distributors & Resellers, partner programs.

Secondary readers: press and investors (354 press releases, Newsroom, Investors), job seekers (Careers), and compliance/legal readers (Legal, Privacy Center, Corporate Responsibility).

## Product Purpose

westerndigital.com is the corporate + commerce site of Western Digital Corporation (Nasdaq: WDC), a hard-drive company. It presents the HDD portfolio (internal, external, data-center drives and platforms), sells direct through an embedded Salesforce-Commerce-Cloud storefront (`/store/*`, cart, price/inventory APIs), publishes corporate news, and documents the company (leadership, sustainability, innovation, careers, legal).

Success as the site expresses it: "See All Products", "Shop", and "Learn More" — move visitors from a category or solution into a product, and keep corporate stakeholders informed.

## Positioning

"Flash for the moment—HDDs for a lifetime." The site's claim is that hard drives remain the economic foundation of AI-era data storage ("AI compute ends—but data keeps compounding"). Proof points carried on the pages: TIME World's Most Sustainable Companies 2026, Ethisphere World's Most Ethical Companies 2026 (footer badge), S&P Dow Jones Best-in-Class Index (utility bar), CERN / Wasabi / Dropbox case studies.

## Operating Context

- Source CMS: Adobe Experience Manager classic (`/content/dam/store/en-us/...` assets, `aem-Grid`, `responsive-columns-flexbox`, `.wdthumb.3000.3000.webp` renditions) fronted by Akamai (mPulse RUM present).
- Commerce: SFCC storefront under `/store/`; product listing pages are client-rendered from `/bin/wd/cache/commerce/*.json` and `/store/cart/*` APIs.
- Global: 60+ locale alternates via hreflang; this capture is `en-us`.
- Third-party runtime: Adobe Launch tag manager, New Relic, Akamai mPulse, Genesys PureCloud live chat, Bazaarvoice reviews (product pages), YouTube embeds, Relyance consent.

## Capabilities and Constraints

Captured functionality (see `stardust/dynamic-features.md` for dispositions):

- Site search (JS-submitted, `q` field) in the header on 105/106 pages.
- Mega-menu navigation (Products / Solutions / Support / Company) with account, cart and search icons.
- Cart/price/inventory hydration on every page (`/store/cart/getCart`) — commerce state is session-bound.
- Region selector fed by `regiondetail.xlsx.exceltojson.json`.
- Modals (`wd-modal-btn`), YouTube video players, live-chat launcher.
- Forms: contact, partner registration, recycle program, channel promotion, newsletter sign-up.
- Tools: RAID and surveillance capacity calculators (client-side compute).

Constraints observed: content-heavy pages routinely exceed 1 MB of HTML; the utility bar and consent banner appear on every page; product catalog pages cannot render without the commerce APIs.

## Brand Commitments

- **Register:** `brand` (marketing/corporate landing surfaces dominate; the storefront is the one product-register area).
- **Name and mark:** "WD" wordmark with the rainbow-stripe glyph (`stardust/current/assets/logo.svg`); "Western Digital" in legal copy and the mobile logo.
- **Observed personality:** monochrome, engineered, confident. Black and white with one grey surface; Roboto throughout; square-ish photography tiles; short imperative CTAs ("Learn More", "See All Products", "Get the Full Story").
- **Observed anti-references (what the site never does):** no colour accents beyond the link blue, no drop shadows, no decorative illustration, no script or display faces.

## Evidence on Hand

- 106 live-rendered page captures: `stardust/current/pages/<slug>.json` + `<slug>.html` (settled DOM) + `stardust/current/assets/screenshots/<slug>.png`.
- Brand surface: `stardust/current/_brand-extraction.json`; computed-style lifts of the three archetypes at 1440 and 360: `stardust/replica/lift/*.json`.
- Fonts: Roboto 300/400/500/700 latin woff2 from the site's own static host — `stardust/current/assets/fonts/` (Apache 2.0, self-hostable).
- Logo SVGs (`logo.svg`, `logo-mobile.svg`) and favicon (`favicon.ico`).
- Dynamic-surface evidence: `stardust/current/_dynamics.json`, `dynamic-features.generated.md`.
- Absent (do not fabricate): product-detail pages (not in the sitemap; the one guessed URL 404ed), the checkout flow, authenticated account pages, localized variants.

## Product Principles

_provenance: inferred — read off the captured IA and copy, not stated by the site._

1. Products are reached through use-case and category, not spec sheets first.
2. Every page carries the full commerce chrome (utility bar, mega-menu, cart) even when it is corporate content.
3. Corporate credibility (sustainability, ethics, investor news) is surfaced on the home page, not buried.
4. Copy is short and declarative; imagery does the persuading.

## Accessibility & Inclusion

Observed: skip-to-content button (`.skipBTN`), `aria-label`s on icon links, `role="img"` SVGs, alt text on most product imagery (decorative header logo has `alt=""`). No product-specific standard is stated on the site.
