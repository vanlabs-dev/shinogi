# public-pulse

Session 1 brainstorm. Approved 2026-09-01.

## Goal

Lock v1 of subnt.dev as a public pulse: one self-contained HTML read of
the Bittensor network, composed from Atlas store facts, published by Atlas
into this repo.

## Success signals

- One view shows, in order: masthead (`as of <time> · block <n>`), network,
  subnet movers, mining head, attention head (~10), code/narrative.
- Every missing or stale input is named. Nothing is estimated or carried
  forward as current.
- Operator-only facts are absent.
- A reader who never sees Telegram or the LAN board can still take the pulse.
- Atlas can fill this contract from stores without this repo calling the
  chain.
- Empty and stale states are specified, so a first publish is valid with
  gaps.

## Constraints / non-goals

Locked from `AGENTS.md`:

- This repo is the dump. Atlas renders and `git push`es. No chain calls,
  keys, or backend here.
- One view. No nav, no accounts, no articles.
- Off the page: wallets, keys, Telegram, Pi address, TaoStats quota,
  exploit paths, `mining.budget_band`, the atlas/operator section.
- Compose from Atlas briefing readers (`telegram/atlas_briefing.py`). Do
  not copy the LAN boards.
- Cadence 6h. Pages Free budget. Hash-change push.
- If it does not read an Atlas store or write `index.html`, it is not v1.
- No Next.js, Worker, Function, Supabase, Stripe. IntoTAO is reference
  only. No em dashes.

This greenfield owns the page contract only (section order, on/off-page
list, empty/gap states, HTML shape). The renderer stays in Atlas, on the
fleet unit.

## Options considered

- **A. Briefing wrap.** HTML-dress `compose()`. Fast. Voice and truncation
  stay Telegram-shaped. Rejected: the public page is not an operator
  message.
- **B. Public pulse.** Same store facts and gap rule as the briefing
  section builders. Compose an HTML document, not a Telegram edition. No
  truncation, no atlas section, no next-action. Chosen.
- **C. Heads-first.** Mining and attention dominate. Rejected: too close
  to the LAN board, which this page must not copy.

Scope options: page contract here / renderer later in Atlas (chosen), vs
naming Atlas renderer tasks in this change (deferred; those land in Atlas).

## Chosen direction

**B. Public pulse**, contract in this repo.

Reuse the briefing section builders' facts (network, movers, mining,
code, narrative) and the same gap rule. Render them as a public HTML
document in the current placeholder chrome (dark, mono, masthead).

Section order on the page (AGENTS.md, not Telegram order):

1. Masthead: `SUBNT` · tagline · `as of <time> · block <n>`
2. Network
3. Subnet movers
4. Mining head
5. Attention head (~10)
6. Code / narrative

Attention head is a new public strip, not a briefing section and not the
LAN dashboard. Source: fleet attention facts (`score_subnet` and friends).
Show about ten rows. Reuse facts, not board chrome.

Deltas, when shown, are against the previous subnt publish (6h
hash-change), not against the Telegram briefing watermark. First publish
states that it is the first edition.

Atlas writes `index.html` from stores and pushes this repo when the hash
changes. This change does not implement that renderer.

## Open questions

Resolved in Session 2 (see `02-approval.md`):

- Attention rows: netuid, name, dominant reason. No score number, no
  cue glyphs. Ordered by fleet score.
- Masthead `block <n>`: newest `panel_snapshot.block_number`.
- First page: section shells with named gaps.

Atlas renderer remains a later change, where the stores live.
