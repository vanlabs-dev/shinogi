## 1. Rules and docs

- [x] 1.1 Update `AGENTS.md`: v2 one page, mobile first, Astro static build, data written by Atlas into `data/`, access levels, keep the off-page list and no em dashes
- [x] 1.2 Update `openspec/config.yaml` context and apply guidance to match (build command, `data/` ownership, no browser fetch, no Worker code)
- [x] 1.3 Add the JSON schema `schema/subnt-1.0.json` matching `design.md`

## 2. Design

- [x] 2.1 Make 2 or 3 throwaway mockups at 360 px and 1280 px with real sample data; pick one (2026-09-26: Board with Briefing, stat tiles with sparks, section leads, note lists as chips and row tags)
- [x] 2.2 Choose the typeface and subset it; confirm it fits the font budget
- [x] 2.3 Write design tokens (colour, type scale, spacing, radius, chart style) for light and dark; check AA contrast

## 3. Page build

- [x] 3.1 Scaffold Astro with static output on branch `v2`; commit lockfile
- [x] 3.2 Load and validate `data/*.json` against the schema at build; fail on unsupported major version; build a gap page when `data/` is empty
- [x] 3.3 Build components: section header, lead, stat, sparkline, subnet row with `<details>`, gap note, freshness label, subscriber placeholder, section bar
- [x] 3.4 Compose the five sections in contract order from the data
- [x] 3.5 Add optional sort and filter for subnet lists that only reorders rows in the document
- [x] 3.6 Keep `404.html` as a distinct miss page linking to `/`

## 4. Contract tests

- [x] 4.1 Port v1 tests to the build output: landmarks and order, masthead, as-of line, no browser fetch, readable with scripts stripped, operator strings absent, 404
- [x] 4.2 Every number on the page appears in a data file
- [x] 4.3 Byte budget test for HTML, JS, and font
- [x] 4.4 No third-party request in the built output
- [x] 4.5 Subscriber leak test on `data/` and the built page
- [x] 4.6 Accessibility checks: one `h1`, heading order, chart text equivalents, contrast from tokens
- [x] 4.7 No horizontal overflow at 360 px (headless browser)

## 5. Cutover

- [ ] 5.1 Confirm Cloudflare build limits and preview URLs for the account; pick build-on-Cloudflare or build-on-Pi
- [ ] 5.2 Parity check across three consecutive editions: every v1 fact appears in v2
- [ ] 5.3 Merge `v2`, set the build command, and confirm subnt.dev serves the v2 page and unknown paths return 404
- [ ] 5.4 Record the cutover and rollback steps in `docs/`

Atlas work (JSON export, leak scan on JSON, schema test, removing the HTML renderer) belongs to the Atlas change `subnt-json-export`, not this repo.
