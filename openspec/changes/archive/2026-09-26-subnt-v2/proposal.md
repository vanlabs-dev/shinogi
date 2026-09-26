# subnt v2: one excellent page

## Why

subnt.dev works, but the page is a desktop-first dump of one Python
renderer's HTML. It cannot carry a design system, a strong mobile
layout, or a future split between public and subscriber sections.
The core idea stays: one focused page, as much useful information as
possible, no filler, and no stats-terminal look. v2 makes design and
speed first-class, and separates the data from the page so each can
change on its own.

## What Changes

- **BREAKING** Atlas publishes versioned JSON data files into this repo
  instead of `index.html`. This repo builds the page from them.
- **BREAKING** The page becomes an Astro static build. Cloudflare runs
  the build on push; the build command is no longer blank.
- The page stays one view at `/`. In-page section links are allowed.
  Other routes, articles and accounts stay out.
- **BREAKING** Layout becomes mobile first (was full-bleed, desktop
  first).
- Every section answers one stated reader question and opens with a
  plain sentence before its figures.
- Per-subnet detail opens in place with `<details>`, not on new pages.
- One design system: tokens, type scale, chart style, light and dark
  themes that follow the device.
- A performance budget and accessibility checks become contract tests.
- Every section carries an access level, `public` or `subscriber`. A
  subscriber section renders as a blurred placeholder with fake values;
  real subscriber figures never enter this repo. v2 ships with every
  section `public`.
- Kept from v1: data baked in, no browser fetch, readable with scripting
  off, as-of time and block, named gaps, per-input stale bounds,
  operator material off the page, 6-hour cadence, no em dashes.

## Non-goals

- Accounts, logins, payments, Stripe, or any subscriber delivery. That
  is v3 and needs its own rule change (a Worker that fills subscriber
  sections server-side).
- Custom backend, Worker code, Functions, Supabase, Next.js.
- More pages, articles, per-subnet routes.
- Loading data in the browser.
- Installable web app (PWA). Revisit after v2 ships.
- Changing ingest, stores, or what Atlas measures.
- Copying LAN board chrome or IntoTAO code.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `public-pulse`: one-page rule allows in-page links; section leads;
  mobile first; design system; performance budget; accessibility;
  access levels with subscriber placeholders; page built from published
  data files; static build and deploy.

## Impact

- This repo: Astro project, components, `data/` directory written by
  Atlas, rewritten contract tests, `AGENTS.md`, `openspec/config.yaml`.
- Cloudflare: build command set to the Astro build. Build limits and
  branch preview URLs for this account are not verified.
- Atlas (separate change, `subnt-json-export`, in the Atlas repo):
  modify `subnt-publish` to emit JSON, move the leak scan and fact-hash
  gate onto the JSON, add a schema test. The HTML renderer keeps
  publishing until cutover.
- Cutover: switch only after a parity check shows v2 carries every fact
  v1 shows. Rollback is a revert to the last v1 edition commit.
