# dynamics row harness (spike-c)

Replay from the repo root after `npm i -D playwright --no-save`:

- `node stardust/dynamics/client-logic/_harness/calc-vectors.mjs <spec> <url> <out> <source|target>` — row 23 vectors (client-logic table format, outputs read as `.value` / `innerText` / `validationMessage`).
  Inputs are set programmatically (`value` + `input` + `change`, then `requestSubmit`) on BOTH origins: on the source the Genesys chat iframe (`wd-chat-frame`) steals keyboard focus in automation, so typed input never reaches the field — an environment limit, not a calculator defect.
- `node stardust/dynamics/client-logic/_harness/plp-vectors.mjs <spec> <source|target> <out>` — row 14 listing states (URL `filterBy…`/`page`, sort).
- `contact-probe.mjs` — row 15 contact topics; every non-GET request is aborted, nothing is ever submitted to the production servlets.

Diff with `client-logic.mjs diff --expected table.source.json --actual table.target.json`.
