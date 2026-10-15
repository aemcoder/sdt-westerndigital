# Dynamics parity check — https://spike-a--sdt-westerndigital--aemcoder.aem.page — 2026-10-15T17:14:47.040Z

Replayed 14 checks over 3 features · pass 14 · fail 0. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| product listing pages: grid, facets, sort, pagination, filterBy URL state (product-listing, data-fed) | CR/X | done | search-query | PASS | 4 results (source 4) · first: wd purple pro video analytics hard drive · matches the source | www.westerndigital.com:200×3 api.westerndigital.com:200×1 |
| product listing pages: grid, facets, sort, pagination, filterBy URL state (product-listing, data-fed) | CR/X | done | search-query | PASS | 6 results (source 6) · first: wd red pro nas hard drive · matches the source | www.westerndigital.com:200×5 api.westerndigital.com:200×1 |
| product listing pages: grid, facets, sort, pagination, filterBy URL state (product-listing, data-fed) | CR/X | done | dom-count | PASS | 1 × .product-listing.is-live .pg-num.is-current[data-page="2"] (min 1) | www.westerndigital.com:200×16 api.westerndigital.com:200×1 |
| product listing pages: grid, facets, sort, pagination, filterBy URL state (product-listing, data-fed) | CR/X | done | dom-count | PASS | 38 × .product-listing.is-live .clp-filter-options .clp-check (min 10) | www.westerndigital.com:200×1 api.westerndigital.com:200×1 |
| product listing pages: grid, facets, sort, pagination, filterBy URL state (product-listing, data-fed) | CR/X | done | no-page-errors | PASS | none on 7 page(s) |  |
| intake forms: contact-us topics (6 forms), Talk to an Expert modal, newsletter (form block, definition-driven) | F | scaffolded-awaiting-owner | dom-count | PASS | 11 × .form-topic-select option (min 11) |  |
| intake forms: contact-us topics (6 forms), Talk to an Expert modal, newsletter (form block, definition-driven) | F | scaffolded-awaiting-owner | dom-count | PASS | 2 × a[href='#talk-to-an-expert'] (min 2) |  |
| intake forms: contact-us topics (6 forms), Talk to an Expert modal, newsletter (form block, definition-driven) | F | scaffolded-awaiting-owner | dom-count | PASS | 1 × form [name='email'] (min 1) |  |
| intake forms: contact-us topics (6 forms), Talk to an Expert modal, newsletter (form block, definition-driven) | F | scaffolded-awaiting-owner | no-page-errors | PASS | none on 3 page(s) |  |
| RAID / surveillance capacity calculators | CR | done | dom-count | PASS | 9 × .calculator.raid form select[name="raid-type"] option (min 9) |  |
| RAID / surveillance capacity calculators | CR | done | dom-count | PASS | 4 × .calculator.raid output[data-result] (min 4) |  |
| RAID / surveillance capacity calculators | CR | done | dom-count | PASS | 4 × .calculator.surveillance form input[name="codec"] (min 4) |  |
| RAID / surveillance capacity calculators | CR | done | dom-count | PASS | 13 × .calculator.surveillance select[name="resolution"] option (min 13) |  |
| RAID / surveillance capacity calculators | CR | done | no-page-errors | PASS | none on 2 page(s) |  |

## Features without checks
