# Dynamics parity check — https://spike-c--sdt-westerndigital--aemcoder.aem.page — 2026-10-15T16:54:29.057Z

Replayed 12 checks over 3 features · pass 11 · fail 1. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| product listing pages: facets, sort, pagination (7 PLPs) | CR/A | done | dom-count | PASS | 15 × .product-listing.is-live .clp-grid .tile-cell (min 15) | api.westerndigital.com:200×1 www.westerndigital.com:200×10 |
| product listing pages: facets, sort, pagination (7 PLPs) | CR/A | done | dom-count | PASS | 1 × .product-listing.is-live .clp-filter-value input[value="WD_BLACK"]:checked (min 1) | api.westerndigital.com:200×1 |
| product listing pages: facets, sort, pagination (7 PLPs) | CR/A | done | dom-count | PASS | 1 × .product-listing.is-live .clp-pagination a.pg-num[aria-current="page"] (min 1) | api.westerndigital.com:200×1 www.westerndigital.com:200×11 |
| product listing pages: facets, sort, pagination (7 PLPs) | CR/A | done | dom-count | PASS | 7 × .product-listing.is-live .clp-grid .tile-cell (min 5) | api.westerndigital.com:200×1 www.westerndigital.com:200×6 |
| product listing pages: facets, sort, pagination (7 PLPs) | CR/A | done | fetch-json | PASS | 200 · 8 rows · keys type,breadcrumbs,currentQuery,facets,freeTextSearch,pagination,products,sorts |  |
| product listing pages: facets, sort, pagination (7 PLPs) | CR/A | done | no-page-errors | PASS | none on 4 page(s) |  |
| contact-us topic forms (6) + Talk to an Expert (data-center-storage-platform) | F | scaffolded-awaiting-owner | form-flow | FAIL | empty refused: true ("Field cannot be empty.") · filled posted: false · success copy: false |  |
| contact-us topic forms (6) + Talk to an Expert (data-center-storage-platform) | F | scaffolded-awaiting-owner | dom-count | PASS | 11 × #form-topic option (min 11) |  |
| contact-us topic forms (6) + Talk to an Expert (data-center-storage-platform) | F | scaffolded-awaiting-owner | no-page-errors | PASS | none on 2 page(s) |  |
| RAID capacity + CCTV/NVR surveillance storage calculators | CR/F | done | dom-count | PASS | 9 × .calculator--raid #capacity-form #raid-type option (min 9) |  |
| RAID capacity + CCTV/NVR surveillance storage calculators | CR/F | done | dom-count | PASS | 4 × .calculator--surveillance #capacity-form input[name=codec] (min 4) |  |
| RAID capacity + CCTV/NVR surveillance storage calculators | CR/F | done | no-page-errors | PASS | none on 2 page(s) |  |

## Features without checks
