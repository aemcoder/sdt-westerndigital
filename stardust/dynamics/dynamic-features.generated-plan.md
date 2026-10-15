<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-18T07:01:14.740Z · input stardust/current/_dynamics.json (3 pages, 25 findings) · target probe https://main--sdt-westerndigital--aemcoder.aem.live -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-consent-app-relyance-ai | A | unknown third-party host consent.app.relyance.ai | 3/3 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-unknown-third-party-host-api-cdn-usw2-pure-cloud | A | unknown third-party host api-cdn.usw2.pure.cloud | 3/3 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-unknown-third-party-host-api-usw2-pure-cloud | A | unknown third-party host api.usw2.pure.cloud | 3/3 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 4 | a-first-party-api-get-store-cart-getcart | A | first-party API GET /store/cart/getCart | 3/3 (reach 105/106) | data-fed | needs-backend | pending | decided-out | none (session-bound off-origin) | **dead on target (404)** |
| 5 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 3/3 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 6 | a-cms-app-settings-object-utag-data | A | CMS / app settings object utag_data | 3/3 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 7 | a-first-party-api-get-store-cart-guest-products-priceandinve | A | first-party API GET /store/cart/guest/products/priceAndInventory | 1/3 (reach 19/106) | data-fed | needs-backend | pending | decided-out | none (session-bound off-origin) | **dead on target (404)** |
| 8 | d-first-party-data-file-get-content-dam-store-en-us-assets-s | D | first-party data file GET /content/dam/store/en-us/assets/sys/region-details/regiondetail.xlsx.exceltojson.json | 3/3 (reach 105/106) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 9 | d-first-party-data-file-get-bin-wd-cache-commerce-productref | D | first-party data file GET /bin/wd/cache/commerce/productreference.en-us.json | 3/3 (reach 105/106) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 10 | d-first-party-data-file-get-chatbot-locales-en-us-translatio | D | first-party data file GET /chatbot/locales/en-us/translation.json | 3/3 (reach 102/106) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | d-first-party-data-file-get-bin-wd-cache-commerce-customprom | D | first-party data file GET /bin/wd/cache/commerce/custompromotions.en-us.json | 1/3 (reach 20/106) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 12 | i18n-locale-variants-x-default-en-en-us-en-ca-en-ie-en-se-en | I18N | locale variants x-default,en,en-US,en-CA,en-IE,en-SE,en-BE,en-AT,en-PT,en-HU,en-DK,en-RO,en-FI,en-HR,en-SK,en-BG,en-BY,en-SI,en-NO,en-GB,en-AE,en-KZ,en-KW,en-ZA,en-UA,en-IL,en-MY,en-PH,en-VN,en-EE,en-LV,en-LT,en-AU,en-NZ,en-SG,en-IN,en-BD,de,de-AT,fr,fr-CA,cs,es-ES,el,it,nl,pl,ja,es,es-MX,es-AR,es-PE,es-CL,es-CO,es-EC,pt,zh,zh-TW,ko,th,id,ru,ar,ar-AE,ar-EG,ar-QA,ar-DZ,tr | 2/3 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 13 | i18n-locale-variants-x-default-en-en-us-en-ca-en-ie-en-se-en | I18N | locale variants x-default,en,en-US,en-CA,en-IE,en-SE,en-BE,en-AT,en-PT,en-HU,en-DK,en-RO,en-FI,en-HR,en-SK,en-BG,en-BY,en-SI,en-NO,en-GB,en-AE,en-KZ,en-KW,en-ZA,en-UA,en-IL,en-MY,en-PH,en-VN,en-EE,en-LV,en-LT,en-AU,en-NZ,en-SG,en-IN,en-BD,de,de-AT,fr,fr-CA,cs,es-ES,el,it,nl,pl,es,es-MX,es-AR,es-PE,es-CL,es-CO,es-EC,pt,ko,th,id,ru,ar,ar-AE,ar-EG,ar-QA,ar-DZ,tr | 1/3 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 14 | m-modal-trigger-wd-modal-btn-chrome-only-target-outside-dom- | M | modal trigger wd-modal-btn (chrome only) → target outside DOM at capture | 1/3 (reach 224/106) | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 15 | s-site-search-form-js-submitted | S | site search form → (JS-submitted) | 3/3 (reach 105/106) | index-backed | self | pending | search-index-backed | results page scope (second corpora stay out) |  |
| 16 | t-rum-akamai-mpulse | T | RUM: Akamai mPulse | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 17 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 18 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 19 | t-chat-live-chat-widget | T | chat: live chat widget | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 20 | t-rum-new-relic | T | RUM: New Relic | 3/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 21 | t-social-proof-reviews-widget | T | social proof: reviews widget | 1/3 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 22 | v-video-youtube | V | video: YouTube | 3/3 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 23 | x-sign-in-account-links | X | sign-in / account links | 3/3 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 24 | x-commerce-signals-cart-true-prices-0 | X | commerce signals (cart: true, prices: 0) | 2/3 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 25 | x-commerce-signals-cart-true-prices-4 | X | commerce signals (cart: true, prices: 4) | 1/3 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 9 row(s) — read-settings, sheet-sync, chrome-interaction, search-index-backed, media-as-url.
- **One owner decision batch:** 13 row(s) — inspect the XHR, add a vendor row · none (session-bound off-origin) · scope of the locale trees · which tags run on the new host; property ids.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 6 of 6 probed API paths — the off-origin data work.

## Phases

- **tags** — 6
- **detect** — 5
- **register** — 5
- **data** — 4
- **locale wave** — 2
- **interactive** — 1
- **search** — 1
- **media** — 1
