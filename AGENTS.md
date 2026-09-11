# shinogi

A lean read on Bittensor subnets. Public page: https://shinogi.dev

Atlas (`~/src/github/vanlabs-dev/atlas`) is the worker. This repo is the
static dump it publishes. No chain calls, no keys, no backend from here.

Operator: `vaNlabs` / GitHub `vanlabs-dev`. Personal, not work.

## Standing (2026-09-02)

`index.html` on `main` is the public-pulse shell: five landmarks, named
gaps, awaiting first Atlas publish. Not an edition. Contract applied
and archived. Living spec: `openspec/specs/public-pulse/`. Change:
`openspec/changes/archive/2026-09-02-public-pulse/`. Session notes:
`docs/greenfield/public-pulse/`. Renderer stays in Atlas.

Cloudflare Pages serves `https://shinogi.dev` from `main` (HTTP 200).
`www` has no records; use the apex. Atlas has not published a real
edition.

## Publish

```
Atlas Pi (LAN only)
  6h fleet timer → render from stores → git push this repo
    → Cloudflare Pages (no build, output /) → shinogi.dev
```

Cadence is 6h, not hourly (Pages Free: 500 builds/month). An Atlas
edition must show `as of <time> · block <n>`. A failed push leaves the
last deploy live.

## Repo

| Path | Role |
|---|---|
| `index.html` | Public-pulse shell. Self-contained. Atlas overwrites on publish. |
| `404.html` | Required so Pages is not an SPA. |
| `tests/` `pytest.ini` | Local contract test. `pytest -q`. |
| `openspec/` | Living spec `specs/public-pulse/`. Archived change `changes/archive/2026-09-02-public-pulse/`. |
| `docs/greenfield/public-pulse/` | Session notes. |
| `AGENTS.md` | This file. |

Remote: `git@github.com:vanlabs-dev/shinogi.git`. Branch: `main`.
Author: `vanlabs-dev <vanlabs@pm.me>`.
Pages: Framework None, empty build, output `/`.

The Pi publishes over SSH with a **write-scoped deploy key** for this repo
alone (`~/.ssh/id_ed25519_shinogi`, fingerprint
`SHA256:X4AhCwtMCZ6qxMv89Po0fLLXrxAVH49B1T2496p52aI`, selected by a
`Host github.com` entry with `IdentitiesOnly yes`). That key reaches this
repo and nothing else: the Pi pulls Atlas anonymously over HTTPS and
cannot push to it.

A commit made here directly leaves the Pi's checkout behind origin. The
renderer fetches and fast-forwards before it writes, so that recovers on
its own; a **diverged** checkout does not, and fails the pass closed.

## v1 page

One view. No nav, no accounts, no articles.

Network, subnet movers, mining head, attention head (~10), code/narrative.
Gaps named, never estimated. Stale is per input (not a blanket 6h).
Attention rows: netuid, name, short why-phrase. Score order, skip
pure-opaque. No score number, no cue glyphs, no thesis. Code push
count is the stored 7d fact.

Off the page: wallets, keys, Telegram, Pi address, TaoStats quota,
exploit paths, `mining.budget_band`.

Compose from Atlas briefing readers (`telegram/atlas_briefing.py`). Do
not copy the LAN boards.

## Rules

- If it does not read an Atlas store or write `index.html`, it is not v1.
- Do not rebuild ingest here. No Next.js, Worker, Function, Supabase, Stripe.
- No extra Cache Rule on the custom domain.
- IntoTAO is reference only. Do not reuse that code.
- No em dashes.

## Next

Done, deployed 2026-09-11. The renderer lives in Atlas at
`shinogi/atlas_shinogi.py` under its own oneshot unit and timer
(`atlas-shinogi.timer`, every 6h at `:55` local time, after the fleet
pass), **not** the `ExecStartPost=-` on the fleet unit this section used
to suggest: publishing a public page is a different job from repo
reconciliation and must be stoppable on its own.

It republishes only when a fact on the page has moved. The as-of line
carries the compose time, which changes every pass, so the gate hashes
the document with that line normalised out.
