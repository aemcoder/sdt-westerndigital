# Dynamics parity check — https://spike-b--sdt-westerndigital--aemcoder.aem.page — 2026-10-15T16:40:32.569Z

Replayed 24 checks over 3 features · pass 21 · fail 3. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 15 × .product-listing[data-source="live"][data-total="32"] .clp-grid .tile-cell (min 15) | api.westerndigital.com:200×1 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 1 × .product-listing[data-source="live"][data-total="2"] .clp-selected-chip (min 1) | api.westerndigital.com:200×1 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 1 × .product-listing[data-source="live"][data-total="19"] (min 1) | api.westerndigital.com:200×1 www.westerndigital.com:200×9 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 1 × .clp-pagination a.pg-num.is-current[href$="page=2"] (min 1) | api.westerndigital.com:200×1 www.westerndigital.com:200×15 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 1 × .product-listing[data-source="live"] .clp-sort-select option[value="price-asc"]:checked (min 1) | api.westerndigital.com:200×1 www.westerndigital.com:200×6 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 31 × .clp-facets .clp-filter .clp-option (min 20) | api.westerndigital.com:200×1 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 1 × .product-listing[data-source="live"][data-total="21"] (min 1) | api.westerndigital.com:200×1 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | dom-count | PASS | 1 × .product-listing[data-source="live"][data-total="7"] (min 1) | api.westerndigital.com:200×1 www.westerndigital.com:200×1 |
| product-catalog — PLP grid, facets, sort, pagination (7 product-listing pages) | CR/X | interim | no-page-errors | PASS | none on 7 page(s) |  |
| forms — sales lead (contact-us / Talk to an Expert), contact topics (careers, IR, website, Pro Rewards, general), newsletter, Easy Recycle | F | scaffolded-awaiting-owner | form-flow | FAIL | empty refused: true ("Field cannot be empty.") · filled posted: false · success copy: true |  |
| forms — sales lead (contact-us / Talk to an Expert), contact topics (careers, IR, website, Pro Rewards, general), newsletter, Easy Recycle | F | scaffolded-awaiting-owner | form-flow | FAIL | empty refused: true ("Enter a valid email address.") · filled posted: false · success copy: true |  |
| forms — sales lead (contact-us / Talk to an Expert), contact topics (careers, IR, website, Pro Rewards, general), newsletter, Easy Recycle | F | scaffolded-awaiting-owner | form-flow | FAIL | empty refused: true ("Enter First Name") · filled posted: false · success copy: true |  |
| forms — sales lead (contact-us / Talk to an Expert), contact topics (careers, IR, website, Pro Rewards, general), newsletter, Easy Recycle | F | scaffolded-awaiting-owner | dom-count | PASS | 11 × .form.topics .form-topic-select option (min 11) |  |
| forms — sales lead (contact-us / Talk to an Expert), contact topics (careers, IR, website, Pro Rewards, general), newsletter, Easy Recycle | F | scaffolded-awaiting-owner | no-page-errors | PASS | none on 3 page(s) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="available"][data-value="16 TB"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="available"][data-value="8 TB"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="total"][data-value="624 TB"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="detail"][data-value="8 x 2TB in RAID 60* = 8TB Usable (8,000GB)"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-tool:not([data-calculated]) .calc-result-value[data-key="total"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="tb"][data-value="14.913"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="tb"][data-value="12768.270"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="tb"][data-value="546.009"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | dom-count | PASS | 1 × .calc-result-value[data-key="tb"][data-value="77396.705"] (min 1) |  |
| calculators — RAID capacity + CCTV/NVR surveillance storage (/tools/*) | CR | done | no-page-errors | PASS | none on 2 page(s) |  |

## Features without checks
