# public-pulse

Session 3 outside-voice review. 2026-09-02.

Read: `01-brainstorm.md`, `02-approval.md`, `openspec/changes/public-pulse/`
(all four artifacts), `index.html`, `404.html`, Atlas
`telegram/atlas_briefing.py` and `fleet/atlas_fleet_dashboard.py`
(`score_subnet`, `build_thesis`).

## Verdict

The shell, landmark ids, off-page list, and "renderer stays in Atlas" split
are sound. Apply in this repo should stay that small.

Three spec bugs would have mis-composed the first Atlas edition. All
three accepted as A and folded. Do not apply in this session.

## Critical (resolved)

### 1. Blanket 6h stale bound vs store cadence

Spec: any input older than six hours is stale and must not be shown as
current.

Atlas does not work that way. `network_vitals` is a once-per-day row (shown
with its date). The briefing bar uses `stale_hours` default 26. A 6h blanket
will mark vitals (and often the bar) stale on every 6h publish.

6h is the publish cadence, not the freshness of every store.

- A (recommended): per-input stale. Bar follows briefing `stale_hours`.
  Vitals stay dated, not 6h-stale. Panel movers use the publish window.
- B: keep blanket 6h. The public page will usually say those lines are stale.

Status: accepted A (2026-09-02). Folded into spec, design, proposal.

### 2. Attention "dominant reason" is not one fact

`score_subnet` returns `why` as a token (`fresh`, `divergence`, `emission`,
`abandon`, `opaque`, `quiet`) plus cue glyphs. The LAN board then writes a
`build_thesis` sentence. The spec says "dominant reason" and does not pick.

Thesis is board chrome. Glyphs are already off the page. Tokens need a
public phrase or the row is jargon.

The list shape is also unstated. The board is not "top 10 by score": it
tiers by threshold and drops `pure_opaque`. A raw top-10 will show rows the
board hides.

- A (recommended): order by score, at most ten, skip `pure_opaque`. Reason
  is a short public phrase from `why` only. No thesis, no score, no glyphs.
- B: copy the board head (tiers, min score, thesis sentence). Rejects the
  "not the LAN board" rule.

Status: accepted A (2026-09-02). Folded into spec, design, proposal.

### 3. Code "pushed in the window" is not a store fact

Spec: count of tracked subnets that pushed in the window (6h on this page).

Briefing line is `N of M tracked subnets pushed in 7d` from `metric_activity.c7`
on the latest pass. There is no 6h push count.

- A (recommended): spec the stored fact (7d count, as briefing).
- B: require a 6h push count. New Atlas metric. Not v1.

Status: accepted A (2026-09-02). Folded into spec, design, proposal.

## Accepted (no spec change)

- Shell now, not a wait. Empty landmarks with named gaps are a valid page.
- Landmark ids are the Atlas join. Keep them.
- One file, inline CSS, no script. Keep current chrome.
- Code and narrative share `#code-narrative`.
- Deltas vs previous subnt publish, not the Telegram watermark.
- This apply does not implement Atlas. Most SHALL clauses are the cross-repo
  contract. The local test only has to lock the shell (ids, awaiting as-of,
  no fetch, no operator strings, 404). Session 4 archive freezes the
  contract; it does not ship a live pulse.
- `404.html` is already the miss page. Task 1.4 is confirm, not rewrite.
- pytest in this repo is the verify hook. Keep it small (stdlib HTML parse,
  no extra deps). Ban exact operator tokens, not substrings like `key` or
  `Pi` (those false-positive).

## Non-blocking

- Attention ties at rank 10: take the first ten after the existing score
  sort. Do not add a tie-break.
- Do not wrap `compose()` and HTML-dress it. Option A was rejected. A wrap
  would leak `mining.budget_band` / rent / TaoStats quota / atlas lines.

Folded with (1)-(3): shell vs edition naming; missing recorded name;
contract test asserts two `h3` groups.

## Over-engineering check

No extra page, no JS, no Atlas renderer here. Do not add more than the
shell HTML plus a small contract test. The content requirements are the
Atlas contract, not work for this apply.

## Next

Session 3 complete. Findings (1)(2)(3) accepted as A and folded.
Fresh session for Session 4 apply: `/greenfield continue public-pulse`
