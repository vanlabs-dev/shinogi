## Context

See `proposal.md` for why. Live site is the two-paragraph placeholder in
`index.html` (dark mono chrome, Cloudflare Pages, no build). Atlas
renders later, on the fleet unit, and overwrites this file. This change
ships the contract HTML Atlas must keep: five section landmarks, named
gaps, no operator facts. The shell is not an edition.

Constraints: no chain calls, no JS fetch, no extra assets, no em dashes.
Reuse briefing facts, not LAN board chrome.

## Goals / Non-Goals

**Goals:**

- Replace the placeholder with a spec-compliant pre-Atlas shell.
- Freeze landmark `id`s so Atlas and a local contract test share them.
- Keep current chrome (tokens, wordmark, tagline, footer).

**Non-Goals:**

- Composing from stores (Atlas).
- Push cadence, hash skip, systemd.
- Visual redesign or a second page.

## Decisions

1. **Shell now, not a wait.**
   Alternative: leave the placeholder until Atlas publishes.
   Chosen: empty landmarks with named gaps are a valid page and give
   Atlas a target. Pre-Atlas copy is `awaiting first Atlas publish`,
   not a fake edition.

2. **Landmark ids are the join.**
   `#network` `#movers` `#mining` `#attention` `#code-narrative`.
   Atlas MUST keep these ids. Alternative: class names or heading text
   only. Ids survive copy edits.

3. **One file, inline CSS, no script.**
   Alternative: a tiny JS hydrate. Rejected: the dump is static.

4. **Attention is a short list, not the board.**
   At most ten, score order, skip `pure_opaque`. Each row: netuid,
   name, short public phrase from `why` (fresh, divergence, emission,
   abandon, opaque, quiet). No score, no cue glyphs, no thesis, no
   DEV/PX. Missing name: name the gap; do not invent one.

5. **Code and narrative share one landmark.**
   Two `<h3>` groups inside `#code-narrative`. Matches the locked
   one-slot order without a sixth landmark.

6. **Contract test in this repo.**
   A local test reads `index.html` and `404.html` (section order, no
   script fetch, no operator strings, 404 is not `index.html`). No
   network. Atlas owns store-backed render tests.

7. **Block number is Atlas-side.**
   Newest `panel_snapshot.block_number`. The shell omits a number.
   Alternative: vitals date only. Rejected: AGENTS.md already requires
   `block <n>`.

8. **Stale is per input.**
   Six hours is publish cadence, not every store's freshness. Bar
   uses briefing `stale_hours` (default 26). Vitals stay dated. Panel
   movers use the publish window.

9. **Code push count is seven-day.**
   Reuse `metric_activity.c7`. Do not invent a six-hour push count.

10. **The shell is not an edition.**
    Pre-Atlas page: awaiting copy, named gaps. First edition is the
    first Atlas publish.

## Risks / Trade-offs

- [Atlas drops an id] → Mitigation: spec + contract test; Atlas change
  must keep the landmarks.
- [Shell mistaken for a live edition] → Mitigation: awaiting copy, no
  invented time or block.
- [A delayed panel is older than the publish window] → Mitigation:
  name that input stale; do not reuse the last figure. Vitals stay
  dated. The bar uses the briefing bound, not six hours.

## Migration Plan

1. Apply writes the shell `index.html` and the contract test.
2. Push to `main`. Pages serves the shell. Last placeholder is gone.
3. Rollback: revert `index.html` on `main`.
4. Later, Atlas overwrites `index.html` when the hash changes. A failed
   Atlas push leaves this shell (or the last good edition) live.

## Open Questions

None that change this contract. Atlas renderer tasks belong in Atlas.
