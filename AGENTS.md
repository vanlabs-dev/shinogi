# subnt

A lean read on Bittensor subnets. Public page: https://subnt.dev

Atlas (`~/src/github/vanlabs-dev/atlas`) is the worker. This repo is the
static dump it publishes. No chain calls, no keys, no backend from here.

Operator: `vaNlabs` / GitHub `vanlabs-dev`. Personal, not work.

## Branch `v2` (in progress, change `openspec/changes/subnt-v2/`)

`main` is still v1: Atlas writes `index.html`, blank build command. The
facts below describe `main`. Branch `v2` holds the replacement:

- Astro static build (`npm ci && npm run build`, output `dist/`). One
  page at `/`, mobile first, in-page section links, detail in
  `<details>`. No client framework; one inline sort script.
- Atlas writes `data/*.json` (schema `schema/subnt-1.0.json`); this repo
  never writes `data/`. The page lays out what it is given and computes
  no figure. Unsupported major schema, a leak, mixed editions or a
  subscriber block with content fail the build.
- Access levels: every section and block is `public` or `subscriber`.
  Subscriber blocks carry a shape only; placeholder text is generated
  here. v2 ships all `public`.
- Tokens: `src/styles/tokens.json`, light and dark by device setting.
  Font: self-hosted Inter variable latin subset, `public/fonts/`.
- Tests: `npm test` (node:test; builds fixtures in `tests/fixtures/`,
  needs Chromium at `/usr/bin/chromium` for the 360 px check). The v1
  pytest contract stays until cutover.
- Off the page and out of `data/`: the same list as v1 below.
- No em dashes, in data or page.

Cutover is not done: see `tasks.md` section 5.

## Standing (2026-09-22)

**Live at `https://subnt.dev`.** Repository, publisher and domain rename
completed on 2026-09-22. HTTPS serves the published edition and unknown
paths return HTTP 404. `www` is not configured. See `docs/subnt-rename.md`
for the verified cutover record and rollback copies.

The existing public page was deployed on 2026-09-11. `index.html` is a
composed Atlas edition, republished
every six hours by `atlas-subnt.timer` on the Pi. First edition
2026-09-10 20:42 UTC. Do not hand-edit it: the renderer overwrites the
whole file on every publish.

Living spec: `openspec/specs/public-pulse/`. Changes:
`openspec/changes/archive/2026-09-02-public-pulse/`. Session notes:
`docs/greenfield/public-pulse/`. Renderer stays in Atlas at
`subnt/atlas_subnt.py`.

Cloudflare Workers static hosting deploys `main` to `https://subnt.dev`.
Build command is blank; deploy command is `npx wrangler deploy`.
The existing deployment check is named `Workers Builds: shinogi`.

**The contract was amended 2026-09-11.** It no longer bans external assets
and script outright; it bans the page **fetching data in the browser**.
A typeface source and presentation script are allowed, the page must still
read with scripting disabled, and Atlas remains the only writer. `tests/`
accepts both the pre-Atlas shell and a published edition.

## Publish

```
Atlas Pi (LAN only)
  atlas-subnt.timer, every 6h at :55 local
    → compose from stores, read-only
    → scan for operator material and any browser data fetch
    → fast-forward the checkout, then push only if a fact moved
    → Cloudflare static deployment → subnt.dev
```

Its own oneshot unit, **not** an `ExecStartPost` on the fleet timer:
publishing a public page is a different job from repo reconciliation and
must be stoppable on its own. It runs at `:55` so it lands after the fleet
pass, on **local time**, matching `atlas-fleet.timer`; a UTC schedule would
break that ordering under daylight saving.

Cadence is 6h, not hourly, and the gate
hashes the facts with the as-of line normalised out, so an edition whose
figures have not moved is not republished at all. An Atlas edition must
show `Updated <time> · block <n>`
(the page script turns the time into "3 hours and 11 minutes ago"). A failed push leaves the last deploy live.

## Repo

| Path | Role |
|---|---|
| `index.html` | Published Atlas edition. Atlas overwrites on publish. |
| `404.html` | Not-found document for unknown paths. |
| `tests/` `pytest.ini` | Local contract test. `pytest -q`. |
| `openspec/` | Living spec `specs/public-pulse/`. Archived change `changes/archive/2026-09-02-public-pulse/`. |
| `docs/greenfield/public-pulse/` | Session notes. |
| `AGENTS.md` | This file. |

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

One view. No nav, no accounts, no articles. Full-bleed, desktop first.

Network, subnet movers, mining head, attention head (~10), code/narrative.
Gaps named, never estimated. Stale is per input (not a blanket 6h).
Attention rows: netuid, name, short why-phrase. Score order, skip
pure-opaque. No score number, no cue glyphs, no thesis. Code push
count is the stored 7d fact.

Charts are inline SVG computed in Atlas from recorded series: the
emission-gate bar and TAO as sparklines, demand share across the whole bar
universe with the rank marked, and the lead mover's recent readings. A
chart introduces no figure the page does not otherwise report, and never
estimates or smooths.

Attention reasons are **derived** from the score's components and rows
sharing a reason are **grouped**. The reason uses `div_signed`, `cold`,
`econ_fresh` and `pulse_spike` when available, with category fallbacks.
Groups follow first appearance in the selected rows; each retains row order.

Off the page: wallets, keys, Telegram, Pi address, TaoStats quota,
exploit paths, `mining.budget_band`.

Compose from Atlas briefing readers (`telegram/atlas_briefing.py`). Do
not copy the LAN boards.

## Rules

- If it does not read an Atlas store or write `index.html`, it is not v1.
- Do not rebuild ingest here. No Next.js, custom Worker/backend code,
  Function, Supabase or Stripe. Workers static hosting is allowed.
- No extra Cache Rule on the custom domain.
- IntoTAO is reference only. Do not reuse that code.
- No em dashes.

## Previous deployment description

Older session notes describe Cloudflare Pages. The verified deployment uses
Workers static hosting. Those dated notes are historical; do not recreate a
Pages project or add a custom backend to match them.

## Next

Rename complete. No required cutover work remains. The migration record and
rollback copies are documented in `docs/subnt-rename.md`.
