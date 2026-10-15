<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-15T16:26:58.499Z · input stardust/current/dynamics-b/_dynamics.json (8 pages, 35 findings) · target probe https://spike-b--sdt-westerndigital--aemcoder.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-unknown-third-party-host-consent-app-relyance-ai | A | unknown third-party host consent.app.relyance.ai | 7/8 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 2 | a-unknown-third-party-host-api-cdn-usw2-pure-cloud | A | unknown third-party host api-cdn.usw2.pure.cloud | 7/8 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 3 | a-unknown-third-party-host-api-usw2-pure-cloud | A | unknown third-party host api.usw2.pure.cloud | 7/8 | static-snapshot | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 4 | a-first-party-api-get-store-cart-getcart | A | first-party API GET /store/cart/getCart | 7/8 | data-fed | needs-backend | pending | decided-out | none (session-bound off-origin) | **dead on target (404)** |
| 5 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 7/8 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 6 | a-cms-app-settings-object-utag-data | A | CMS / app settings object utag_data | 7/8 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 7 | a-first-party-api-get-graphql-execute-json-wd-clpcampaignend | A | first-party API GET /graphql/execute.json/wd/clpcampaignendpoint;group1=all;group2=undefined;group3=undefined;group4=undefined;group5=undefined;group6=undefined;group7=undefined;group8=undefined;group9=undefined;group10=undefined;group11=undefined;brand1=all;channel=B2C;locale=/content/dam/store/cf/en-us | 2/8 | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 8 | a-first-party-api-get-store-cart-guest-products-priceandinve | A | first-party API GET /store/cart/guest/products/priceAndInventory | 2/8 | data-fed | needs-backend | pending | decided-out | none (session-bound off-origin) | **dead on target (404)** |
| 9 | a-first-party-api-get-graphql-execute-json-wd-wtbendpoint | A | first-party API GET /graphql/execute.json/wd/wtbendpoint | 1/8 | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 10 | d-first-party-data-file-get-content-dam-store-en-us-assets-s | D | first-party data file GET /content/dam/store/en-us/assets/sys/region-details/regiondetail.xlsx.exceltojson.json | 7/8 | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | d-first-party-data-file-get-chatbot-locales-en-us-translatio | D | first-party data file GET /chatbot/locales/en-us/translation.json | 7/8 | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 12 | d-first-party-data-file-get-bin-wd-cache-commerce-productref | D | first-party data file GET /bin/wd/cache/commerce/productreference.en-us.json | 7/8 | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 13 | d-first-party-data-file-get-bin-wd-cache-commerce-customprom | D | first-party data file GET /bin/wd/cache/commerce/custompromotions.en-us.json | 2/8 | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 14 | d-first-party-data-file-get-content-dam-g-tech-en-us-portal- | D | first-party data file GET /content/dam/g-tech/en-us/portal-assets/data-excel/country.xlsx.exceltojson.json | 2/8 | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 15 | f-form-select-wtb-region-dropdown-select-wtb-country-dropdow | F | form "select:wtb-region-dropdown+select:wtb-country-dropdown" → no action (JS-wired) (17 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 16 | f-form-capacity-form-no-action-js-wired-3-fields | F | form "capacity-form" → no action (JS-wired) (3 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 17 | f-form-capacity-form-no-action-js-wired-15-fields | F | form "capacity-form" → no action (JS-wired) (15 fields) | 1/8 | rebuild-native | needs-backend | pending | forms | production endpoint; interim capture ships now |  |
| 18 | i18n-locale-variants-x-default-en-en-us-en-ca-en-ie-en-se-en | I18N | locale variants x-default,en,en-US,en-CA,en-IE,en-SE,en-BE,en-AT,en-PT,en-HU,en-DK,en-RO,en-FI,en-HR,en-SK,en-BG,en-BY,en-SI,en-NO,en-GB,en-AE,en-KZ,en-KW,en-ZA,en-UA,en-IL,en-MY,en-PH,en-VN,en-EE,en-LV,en-LT,en-AU,en-NZ,en-SG,en-IN,en-BD,de,de-AT,fr,fr-CA,cs,es-ES,el,it,nl,pl,ja,es,es-MX,es-AR,es-PE,es-CL,es-CO,es-EC,pt,zh,zh-TW,ko,th,id,ru,ar,ar-AE,ar-EG,ar-QA,ar-DZ,tr | 5/8 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 19 | i18n-locale-variants-x-default-en-en-ca-en-ie-en-se-en-be-en | I18N | locale variants x-default,en,en-CA,en-IE,en-SE,en-BE,en-AT,en-PT,en-HU,en-DK,en-RO,en-FI,en-HR,en-SK,en-BG,en-BY,en-SI,en-NO,en-GB,en-AE,en-KZ,en-KW,en-ZA,en-UA,en-IL,en-MY,en-PH,en-VN,en-EE,en-LV,en-LT,en-AU,en-NZ,en-SG,en-IN,en-BD,ja,es,es-MX,es-AR,es-PE,es-CL,es-CO,es-EC,pt,zh,zh-TW,ko,th,id,ru,ar,ar-AE,ar-EG,ar-QA,ar-DZ,tr | 1/8 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 20 | i18n-locale-variants-x-default-en-en-us-en-ca-en-ie-en-se-en | I18N | locale variants x-default,en,en-US,en-CA,en-IE,en-SE,en-BE,en-AT,en-PT,en-HU,en-DK,en-RO,en-FI,en-HR,en-SK,en-BG,en-BY,en-SI,en-NO,en-GB,en-AE,en-KZ,en-KW,en-ZA,en-UA,en-IL,en-MY,en-PH,en-VN,en-EE,en-LV,en-LT,en-AU,en-NZ,en-SG,en-IN,en-BD,pt | 1/8 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 21 | m-modal-trigger-section-link-overlay-chrome-only-target-outs | M | modal trigger section-link-overlay (chrome only) → target outside DOM at capture | 7/8 | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 22 | m-modal-trigger-wd-modal-btn-chrome-only-target-outside-dom- | M | modal trigger wd-modal-btn (chrome only) → target outside DOM at capture | 2/8 | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 23 | m-modal-trigger-wd-modal-btn-chrome-only-div-content | M | modal trigger wd-modal-btn (chrome only) → div:content | 1/8 | rebuild-native | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 24 | s-site-search-form-js-submitted | S | site search form → (JS-submitted) | 7/8 | index-backed | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 25 | s-first-party-api-get-wdwebservices-v2-us-products-search | S | first-party API GET /wdwebservices/v2/us/products/search | 2/8 | data-fed | needs-business-decision | pending | off-origin-data | datasource ownership / same-origin routing on production | **dead on target (404)** |
| 26 | t-tag-manager-adobe-launch | T | tag manager: Adobe Launch | 7/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | t-rum-akamai-mpulse | T | RUM: Akamai mPulse | 7/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 28 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 7/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 29 | t-chat-live-chat-widget | T | chat: live chat widget | 7/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 30 | t-rum-new-relic | T | RUM: New Relic | 7/8 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 31 | v-video-youtube | V | video: YouTube | 7/8 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 32 | x-sign-in-account-links | X | sign-in / account links | 7/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 33 | x-commerce-signals-cart-true-prices-0 | X | commerce signals (cart: true, prices: 0) | 5/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 34 | x-commerce-signals-cart-true-prices-13 | X | commerce signals (cart: true, prices: 13) | 1/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |
| 35 | x-commerce-signals-cart-true-prices-16 | X | commerce signals (cart: true, prices: 16) | 1/8 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 12 row(s) — read-settings, sheet-sync, chrome-interaction, search-index-backed, media-as-url.
- **One owner decision batch:** 19 row(s) — inspect the XHR, add a vendor row · none (session-bound off-origin) · which tier for the target host; consumer on the migrated pages? · production endpoint; interim capture ships now · scope of the locale trees · datasource ownership / same-origin routing on production.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 10 of 10 probed API paths — the off-origin data work.

## Phases

- **register** — 6
- **detect** — 5
- **data** — 5
- **tags** — 5
- **off-origin data** — 3
- **forms** — 3
- **locale wave** — 3
- **interactive** — 3
- **search** — 1
- **media** — 1
