# subnt v2 design

## Context

v1: Atlas `subnt/atlas_subnt.py` composes one HTML file from stores,
scans it for operator material, hashes facts with the as-of line
removed, and pushes `index.html` here every 6 hours when a fact moves.
Cloudflare Workers static hosting serves it with a blank build command.
The published page was 34,683 bytes on 2026-09-23.

v2 keeps the one-page idea and the data rules, and moves layout out of
Python into a frontend build.

## Goals

- One page that looks excellent on a phone first, then on desktop.
- Every figure a reader needs, no filler, no stats-terminal look.
- Fast: static HTML, almost no script, a written byte budget.
- Room for subscriber sections later without a rewrite.

## Decisions

### Astro, static output

Astro builds plain HTML, ships no JavaScript by default, and allows
small interactive pieces where needed (sorting a subnet list). It can
add server-rendered parts later, which v3 subscriptions would need.
SvelteKit static would work but carries a client runtime this page does
not need. A hand-rolled Python renderer is what v1 is and does not
support a design system well. Node 22 and npm 10 are on the Pi, so
local builds work.

### Data contract between Atlas and this repo

Atlas writes `data/` here; this repo never writes it.

```
data/
  edition.json     schema, composed_at, block, first_edition,
                   previous_composed_at
  network.json     section: lead, access, facts, gaps, series
  movers.json      section, plus per-subnet rows
  mining.json      section
  attention.json   section, grouped reasons
  code.json        section, code and narrative groups
```

Every file:

```json
{
  "schema": "subnt/1.0",
  "composed_at": "2026-09-23T06:00:00Z",
  "block": 9125891,
  "section": "network",
  "question": "What changed on the network since the last edition?",
  "lead": "...",
  "access": "public",
  "blocks": [
    {"id": "bar", "access": "public", "facts": [...], "gaps": [...]}
  ]
}
```

A fact carries its value, unit, display text, reference block or
observation date, and delta against the previous edition. Deltas, stale
decisions, leads and gap wording stay in Atlas, where v1 already
computes them, so the page only lays out what it is given.

A JSON schema file lives in both repos. Atlas tests its output against
it; this repo tests its input against it. Minor versions add optional
fields; a major bump fails the build until the page supports it.

### Where the rules live

Atlas owns facts: stores, stale bounds, deltas, the leak scan, the fact
hash gate, and access levels. This repo owns presentation: layout,
tokens, components, charts, budget and accessibility tests. The page
never computes a figure.

### Charts

Inline SVG built at build time from `series` in the data. Sparklines
for the bar and TAO, a demand-share strip across the bar universe with
the rank marked, and the lead mover's recent readings (all v1 charts).
Each has a caption stating its figures. Fewer than two points: no chart.

### Layout

Mobile first, single column at phone width. A slim sticky section bar
links to the five landmarks. Each section: question as the heading
context, a lead sentence, then 2 to 4 headline facts at large size with
delta and date, then a folded list of per-subnet rows. Tables become
stacked rows below about 640 px. Desktop widens to a two-column grid
where sections are short.

### Components

Section header, lead, stat (value, delta, date), sparkline, subnet row
with `<details>`, gap note, freshness label, subscriber placeholder,
section bar, theme tokens.

### Subscriber placeholders

A blur is only visual; the source stays readable. So a `subscriber`
block is published as a shape only: its layout and row count, with
placeholder text generated in this repo, never Atlas values. Git keeps
every commit, so one leaked figure stays public. The leak test runs in
Atlas before commit and in this repo before build.

v3 (not this change): a Worker checks the subscriber's login and fills
subscriber blocks server-side before the page is sent, from private
storage. That keeps the no-browser-fetch rule and needs its own rule
change for accounts, payments and Worker code.

### Deploy

Cloudflare builds on push: build command `npm ci && npm run build`,
output `dist/`. Atlas still pushes only when facts move, so builds run
at most every 6 hours plus manual commits.

## Risks and trade-offs

- Cloudflare build limits for this account: not verified. Fallback:
  build on the Pi and push `dist/`, keeping the blank build command.
- Branch preview URLs for this account: not verified. Fallback: local
  `astro preview` on the LAN.
- Two repos share one schema. A drift fails a build rather than
  publishing a wrong page; that is intended.
- Section leads written by templates can read flat. Keep templates
  short and review them in the mockup step.
- A byte budget may pinch the typeface. The font line is separate so
  it can be tuned without loosening the page line.

## Migration

1. Approve this change and the Atlas change `subnt-json-export`.
2. Atlas writes `data/` alongside `index.html` on a branch; v1 keeps
   publishing on `main`.
3. Build the Astro page on branch `v2`; review on preview or LAN.
4. Parity check: every v1 fact appears in v2 for three consecutive
   editions.
5. Cutover: merge `v2`, set the Cloudflare build command, switch Atlas
   to data-only publishing.
6. Remove the HTML renderer from Atlas one week after cutover.

Rollback: revert the cutover merge and restore the blank build command;
the last v1 edition returns. Atlas re-enables HTML publishing by config.

## Open questions

- Which blocks become `subscriber` later. v2 ships all `public`.
- Typeface choice. Decide in the mockup step.
- Whether the section bar stays sticky on desktop.
