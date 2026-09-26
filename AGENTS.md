# subnt

A lean read on Bittensor subnets. Public page: https://subnt.dev

Atlas (`~/src/github/vanlabs-dev/atlas`) is the worker. This repo is the
page it publishes into. No chain calls, no keys, no backend from here.

Operator: `vaNlabs` / GitHub `vanlabs-dev`. Personal, not work.

## Standing (2026-09-26)

**Live at `https://subnt.dev`, v2 on `main`.** An Astro static build lays
out the data files Atlas publishes into `data/`. Unknown paths return
HTTP 404. `www` is not configured. The rename record and rollback copies
are in `docs/subnt-rename.md`.

- Build: `npm ci && npm run build`, output `dist/`. One page at `/`,
  mobile first, in-page section links, detail in `<details>`. No client
  framework; one inline script turns the edition time into an age.
- Data: Atlas writes `data/*.json` (schema `schema/subnt-1.0.json`).
  This repo never writes `data/`. The page lays out what it is given and
  computes no figure. An unsupported major schema, a leak, mixed editions
  or a subscriber block with content fail the build.
- Access levels: every section and block is `public` or `subscriber`.
  Subscriber blocks carry a shape only; placeholder text is generated
  here. Everything ships `public`.
- Tokens: `src/styles/tokens.json`, light and dark by device setting.
  Font: self-hosted Inter variable latin subset, `public/fonts/`.
- Tests: `npm test` (node:test; builds fixtures in `tests/fixtures/`,
  needs Chromium at `/usr/bin/chromium` for the 360 px check, skipped
  when absent).
- Hosting: Cloudflare Workers static hosting builds `main`. The build
  command and `dist/` are pinned in `wrangler.jsonc`, with
  `public/404.html` as the not-found page. No Worker script.

The contract bans the page **fetching data in the browser**. A typeface
source and presentation script are allowed, the page must still read
with scripting disabled, and Atlas remains the only writer of data.

## Publish

```
Atlas Pi (LAN only)
  atlas-subnt.timer, every 6h at :55 local
    → compose data/*.json from stores, read-only
    → scan for operator material; validate against the schema
    → fast-forward the checkout, then push only if a fact moved
    → Cloudflare build → subnt.dev
```

Renderer: Atlas `subnt/atlas_subnt.py`; its README is `subnt/README.md`
in Atlas. All page wording lives there, not here. To publish by hand on
the Pi: `systemctl --user start atlas-subnt.service`.

Its own oneshot unit, not an `ExecStartPost` on the fleet timer:
publishing a public page is a different job from repo reconciliation and
must be stoppable on its own. It runs at `:55` on **local time** so it
lands after `atlas-fleet.timer`; a UTC schedule would break that ordering
under daylight saving.

The gate hashes the facts with the as-of fields normalised out, so an
edition whose figures have not moved is not republished. A failed push
leaves the last deploy live.

## Repo

| Path | Role |
|---|---|
| `src/` | Astro page, components, loader (`src/lib/load.mjs`), tokens. |
| `data/` | Published Atlas edition. Atlas overwrites on publish. |
| `schema/` | Data contract `subnt-1.0.json`. |
| `public/` | `404.html`, fonts. |
| `tests/` | `contract.test.mjs` and fixtures. |
| `openspec/` | Living spec `specs/public-pulse/`. Archived changes in `changes/archive/`. |
| `docs/` | Rename record; `greenfield/public-pulse/` session notes. |

Remote: `git@github.com:vanlabs-dev/subnt.git`. Branch: `main`.
Author: `vanlabs-dev <vanlabs@pm.me>`.

The Pi publishes over SSH with a **write-scoped deploy key** for this repo
alone (`~/.ssh/id_ed25519_subnt`, fingerprint
`SHA256:X4AhCwtMCZ6qxMv89Po0fLLXrxAVH49B1T2496p52aI`, selected by a
`Host github.com` entry with `IdentitiesOnly yes`). That key reaches this
repo and nothing else: the Pi pulls Atlas anonymously over HTTPS and
cannot push to it.

A commit made here directly leaves the Pi's checkout behind origin. The
renderer fetches and fast-forwards before it writes, so that recovers on
its own; a **diverged** checkout does not, and fails the pass closed.

## The page

One view. No nav, no accounts, no articles.

Sections: network, subnet movers, mining, attention, code/narrative.
Gaps named, never estimated. Stale is per input.

- Headline: the lead mover, or when none, the soft emission gate ("top
  N by demand share; emission falls off below the bar"). The gate is
  soft (`s^h / (s^h + theta^h)`): never say subnets below the bar get
  nothing.
- Network: bar as a percentage of demand share with rank and count
  above, TAO, stake, runtime spec with `PR #n (branch)`. No new accounts,
  no side-change count.
- Movers: threshold movers; the five non-immune subnets closest to
  deregistration by prune rank, with names; subnets near the cut, with
  names. No ownership-contested list.
- Mining: largest earnable pool for a new independent miner, top ten,
  and a note that hardware cost and requirements are not counted.
- Attention: at most ten rows in score order, grouped by derived reason.
  Emission-off-miner rows show the chain-reconciled owner-UID burn share
  or are dropped. Rows fresh on the branch pulse alone are dropped.

Charts are inline SVG from recorded series. A chart introduces no figure
the page does not otherwise report, and never estimates or smooths.

Off the page: wallets, keys, Telegram, Pi address, TaoStats quota,
exploit paths, `mining.budget_band`.

## Rules

- Do not rebuild ingest here. No Next.js, custom Worker/backend code,
  Function, Supabase or Stripe. Workers static hosting is allowed.
- No extra Cache Rule on the custom domain.
- IntoTAO is reference only. Do not reuse that code.
- No em dashes, in data or page.

## Previous direction

- v1: Atlas wrote a whole `index.html` and the build command was blank.
  Replaced by the v2 data files and Astro build. Do not reintroduce an
  Atlas-rendered HTML page.
- Older session notes describe Cloudflare Pages. The deployment uses
  Workers static hosting; do not recreate a Pages project.
