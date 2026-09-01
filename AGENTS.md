# shinogi

A lean read on Bittensor subnets. Public page at [shinogi.dev](https://shinogi.dev).
Read this before changing anything.

## What this is

One public URL. One page. Summarized subnet and network state, composed
from Atlas stores and published as static HTML.

Atlas (`~/src/github/vanlabs-dev/atlas`) is the worker: fleet clones,
livedata, gate poll, mining triage, briefing composers. This repo is the
published dump. It does not fetch chain data, hold keys, or run a backend.

Operator: `vaNlabs` / GitHub `vanlabs-dev`. Personal, not work.

## Standing (2026-09-01)

Placeholder `index.html` and `404.html` are in this repo on `main`.
`404.html` exists so Pages does not treat the site as an SPA.

GitHub: `vanlabs-dev/shinogi` (public). Description matches the tagline.
Zone `shinogi.dev` is registered on Cloudflare. Pages may still need to
be pointed at this repo (same settings as below). Do not claim the domain
is live until that attach is confirmed.

Atlas does not yet render or push a real edition. The page still says
`as of: awaiting first Atlas publish`.

## How it goes live

```
Atlas Pi (LAN only, no inbound)
  6h fleet timer
    render page from stores (not built yet)
    git push this repo
      → Cloudflare Pages (no build command, output /)
      → https://shinogi.dev
```

Publish cadence is the 6h fleet pass, not hourly. Cloudflare Pages Free
allows 500 builds/month. Hourly would exceed that. The HTML still reads
the latest hourly `panel_snapshot` at render time; the page is then at
most six hours old.

If a push fails, the previous deployment stays live. The page must show
`as of <time> · block <n>` so a stuck publish is visible.

Do not tunnel the Pi. Do not move nameservers off Cloudflare.

## This repo

| Path | Role |
|---|---|
| `index.html` | The read. Self-contained. No external assets. |
| `404.html` | Unknown paths. Do not delete (SPA fallback). |
| `AGENTS.md` | This file. Session briefing. |

Remote: `git@github.com:vanlabs-dev/shinogi.git` (public).
Branch: `main`. Git author: `vanlabs-dev <vanlabs@pm.me>`.

Pages settings: Framework None, build command empty, output `/`.

## Page content (when Atlas writes it)

Single view, no nav, no accounts, no article factory.

- Network: spec, emission bar, rank, above-bar count, TAO/USD, staked
- Subnets: price/share movers, dereg, contested, hovering count
- Mining: ranked/cut counts, head, entries/exits
- Attention: head tier only (~10 rows)
- Code / narrative: 7d pushes, high econ-code verdicts, re-points, model-id adoptions
- Gaps named. Never estimated.

Keep off the page: wallets, keys, Telegram, Pi address, TaoStats quota,
exploit paths, `mining.budget_band`.

Reuse Atlas briefing section composers (`telegram/atlas_briefing.py`).
They already read stores read-only and omit or mark stale. Do not copy
the LAN boards wholesale; summarize.

## Rules

- Lean. If a piece does not read an Atlas store or write `index.html`,
  it is not v1.
- Atlas stays the kernel. Do not rebuild ingest on this host.
- No Next.js, no Worker, no Pages Function, no Supabase, no Stripe.
- No extra Cloudflare Cache Rule on the custom domain (can serve stale
  after a deploy).
- IntoTAO (`~/src/github/vanlabs-dev/intotao-references`) is reference
  only. Do not reuse that code, brand, or ops plane.
- No em dashes in anything we author.

## Next

1. Cloudflare Pages: connect `vanlabs-dev/shinogi`, empty build, output
   `/`, custom domain `shinogi.dev`.
2. Atlas change: compose HTML from stores on the fleet unit, copy into a
   Pi clone of this repo, commit, push when the content hash changes.
   Fail-isolated (`ExecStartPost=-…`), same pattern as the Telegram scan.

Do not start the Atlas work from this repo. The composer has to run
where the stores are.

## Abandoned names

`btorbis` / `btorbis.dev` and `btsitrep` / `btsitrep.dev` were dropped.
The product is shinogi.
