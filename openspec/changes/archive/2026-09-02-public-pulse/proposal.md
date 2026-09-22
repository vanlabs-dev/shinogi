# Public pulse page contract

## Why

subnt.dev is a live placeholder. Atlas has no contract for what to write
into `index.html`. The public read must be specified here so a first
publish is valid with gaps, and so Atlas can compose from stores without
copying the Telegram briefing or the LAN boards.

## What Changes

- Specify the published HTML: one view, fixed section order, store facts
  only, named gaps, no estimates.
- Replace the placeholder `index.html` with pre-Atlas section shells
  (every section present, each naming its missing input). The shell is
  not an edition. Atlas later overwrites this file when it renders.
- Keep `404.html` as a non-SPA miss page.
- Record deltas against the previous subnt publish (6h hash-change),
  not the Telegram briefing watermark. First edition states that it is
  first.

Locked from brainstorm (Session 1, 2026-09-01):

- Order: masthead, network, subnet movers, mining head, attention head
  (~10), code/narrative.
- Attention rows: netuid, recorded name, short public why-phrase.
  Ordered by fleet `score_subnet`, skip `pure_opaque`. Score number,
  cue glyphs, and board thesis stay off the page.
- Stale is per input (bar: briefing `stale_hours`; vitals: dated;
  movers: publish window). Code push count is the stored 7d fact.
- Masthead `block <n>`: latest `panel_snapshot.block_number`. If none,
  name the gap and omit the number.
- Chrome: keep the current dark mono masthead. Self-contained HTML.
  No JS fetch.

## Non-goals

- Atlas renderer, fleet timer, `git push`, or `ExecStartPost`.
- Chain calls, keys, wallets, backend, Worker, Function, Next.js.
- Telegram voice, truncation, next-action, atlas/operator section.
- Copying LAN board chrome (mining board, attention dashboard).
- Showing `mining.budget_band`, TaoStats quota, Pi address, exploit
  paths.

## Capabilities

### New Capabilities

- `public-pulse`: the published page contract (sections, facts, gaps,
  off-page list, first-edition and stale states).

### Modified Capabilities

- None. This repo has no prior specs.

## Impact

- `index.html` becomes the pre-Atlas shell.
- `AGENTS.md` standing and next-action after apply.
- Atlas follow-up (separate change, where the stores live): read
  briefing section builders and `score_subnet`, write `index.html`,
  push on hash change.
