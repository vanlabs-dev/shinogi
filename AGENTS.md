# shinogi

A lean read on Bittensor subnets. Public page: https://shinogi.dev

Atlas (`~/src/github/vanlabs-dev/atlas`) is the worker. This repo is the
static dump it publishes. No chain calls, no keys, no backend from here.

Operator: `vaNlabs` / GitHub `vanlabs-dev`. Personal, not work.

## Standing (2026-09-01)

Placeholder `index.html` is on `main`. Cloudflare Pages serves
`https://shinogi.dev` (HTTP 200). `www` has no records; use the apex.

Atlas has not published a real edition yet.

## Publish

```
Atlas Pi (LAN only)
  6h fleet timer → render from stores → git push this repo
    → Cloudflare Pages (no build, output /) → shinogi.dev
```

Cadence is 6h, not hourly (Pages Free: 500 builds/month). The page must
show `as of <time> · block <n>`. A failed push leaves the last deploy live.

## Repo

| Path | Role |
|---|---|
| `index.html` | The page. Self-contained. |
| `404.html` | Required so Pages is not an SPA. |
| `AGENTS.md` | This file. |

Remote: `git@github.com:vanlabs-dev/shinogi.git`. Branch: `main`.
Author: `vanlabs-dev <vanlabs@pm.me>`.
Pages: Framework None, empty build, output `/`.

## v1 page

One view. No nav, no accounts, no articles.

Network, subnet movers, mining head, attention head (~10), code/narrative.
Gaps named, never estimated.

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

Atlas: render on the fleet unit, push this repo when the hash changes
(`ExecStartPost=-…`). Run that where the stores are, not from here.
