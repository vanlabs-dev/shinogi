## Purpose

Defines the public subnt.dev page as one self-contained HTML pulse of
the Bittensor network, composed from recorded store facts, with named
gaps and no operator-only material.

## ADDED Requirements

### Requirement: One self-contained public view

The published site SHALL serve a single page at `/` as self-contained
HTML (no external stylesheet, script, or font). The page SHALL have no
navigation, accounts, or article list. The page SHALL NOT fetch data in
the browser.

#### Scenario: Root is the only view

- **WHEN** a reader opens `/`
- **THEN** one document renders the full pulse and no in-page nav to
  other views is present

#### Scenario: No client fetch

- **WHEN** the document is loaded
- **THEN** it contains no script that requests a network resource

### Requirement: Masthead states as-of time and block

The page SHALL open with a masthead containing the wordmark `SUBNT`,
the tagline `A lean read on Bittensor subnets`, and an as-of line.

When an Atlas edition has been published, the as-of line SHALL be
`as of <time> · block <n>`, where `<time>` is the compose time in UTC
and `<n>` is the newest recorded chain block from the panel snapshot.
When that block is missing, the as-of line SHALL name the gap and
SHALL omit a block number.

Before any Atlas edition, the as-of line SHALL state that the page
awaits the first Atlas publish and SHALL NOT invent a time or block.

#### Scenario: Published edition with a block

- **WHEN** Atlas has published and a panel snapshot block exists
- **THEN** the masthead shows `as of` a UTC timestamp and `block`
  followed by that number

#### Scenario: Published edition with no block

- **WHEN** Atlas has published and no panel snapshot block is recorded
- **THEN** the as-of line names the missing block and does not show a
  fabricated number

#### Scenario: Pre-Atlas shell

- **WHEN** Atlas has not published
- **THEN** the as-of line states that the page awaits the first Atlas
  publish

### Requirement: Fixed section order

After the masthead, the page SHALL render these sections in this order,
each as a landmark with a stable `id`:

1. Network (`#network`)
2. Subnet movers (`#movers`)
3. Mining (`#mining`)
4. Attention (`#attention`)
5. Code / narrative (`#code-narrative`)

Every section SHALL be present on every edition, including the
pre-Atlas shell.

#### Scenario: Order on the pre-Atlas shell

- **WHEN** the current `index.html` is served
- **THEN** the five section landmarks exist in that order

#### Scenario: Order on an Atlas edition

- **WHEN** Atlas overwrites `index.html` with a composed edition
- **THEN** the same five landmarks remain in the same order

### Requirement: Network section content

The network section SHALL state, when recorded: the live runtime spec
and matching release subject; root-settable parameter changes in the
window; the current bar (theta, rank, above-bar count) and its delta
versus the previous subnt edition; side-change count in the window;
TAO/USD, total staked TAO, subnet share of stake, and new accounts,
each with the vitals date.

#### Scenario: Vitals carry their date

- **WHEN** network vitals are shown
- **THEN** the line includes the observation date

#### Scenario: Spec with release subject

- **WHEN** a runtime spec is recorded and a matching release subject
  exists
- **THEN** the section states both

### Requirement: Subnet movers section content

The movers section SHALL rank alpha-price movers and demand-share
movers from panel snapshots in the window (since the previous publish,
or the six hours before compose when there is no previous publish).
Each mover line SHALL name the netuid, state from and to values, and
cite the reference blocks. The section SHALL list high dereg-risk
netuids and contested or takeover-eligible netuids when recorded, and
SHALL summarise hovering subnets as a count with netuids. When no
mover crosses its threshold, the section SHALL say so.

#### Scenario: Price mover cites both ends

- **WHEN** a price mover is listed
- **THEN** the line states the from and to values with their blocks

#### Scenario: No movers in the window

- **WHEN** no price or share mover crosses its threshold
- **THEN** the section states that there were no movers

### Requirement: Mining head section content

The mining section SHALL state the board head (netuid and recorded
name), and the ranked, cut, and observed counts. When a previous
edition exists, it SHALL name netuids that entered or left the top
ten, or state that the top ten is unchanged. It SHALL NOT state the
mining budget band, rent, or hardware rung.

#### Scenario: Head is named

- **WHEN** a ranked mining head exists
- **THEN** the section states its netuid and recorded name

#### Scenario: Top-ten membership change

- **WHEN** a previous edition exists and the top ten changed
- **THEN** the section names each entered and left netuid

### Requirement: Attention head section content

The attention section SHALL list at most ten subnets, ordered by the
fleet attention score descending, and SHALL omit subnets whose
attention signal is unpaired emission opacity. Each row SHALL state
netuid, recorded name, and a short public reason from this set:
fresh, divergence, emission, abandon, opaque, quiet. The section
SHALL NOT show the numeric score, direction-cue glyphs, or a board
thesis sentence. When a recorded name is missing, the row SHALL name
that gap and SHALL NOT invent a name. When no rows remain, the
section SHALL name that gap.

#### Scenario: Ten or fewer rows

- **WHEN** attention facts exist
- **THEN** the section lists at most ten rows that are not unpaired
  emission opacity, each with netuid, name, and a short public
  why-phrase, and no score number

#### Scenario: No attention facts

- **WHEN** attention facts are missing, or every row is unpaired
  emission opacity
- **THEN** the section names the gap and lists no invented rows

### Requirement: Code and narrative section content

The code group SHALL state how many of the tracked subnets pushed in
the last seven days (the stored seven-day fact, not a six-hour
count), list material incentive-code changes (`high`) with netuid,
one-line verdict, and commit, state the count of `med` verdicts, and
list repository re-points. The narrative group SHALL list
model-identifier adoptions and cluster events in the window and SHALL
exclude dependency-kind terms.

#### Scenario: Dependency terms excluded

- **WHEN** the narrative group is composed
- **THEN** only model-identifier terms and cluster events appear

#### Scenario: High verdict listed

- **WHEN** a `high` incentive-code verdict exists in the window
- **THEN** the code group names the netuid, the one-line verdict, and
  the commit

#### Scenario: Push count is seven-day

- **WHEN** the code group is composed
- **THEN** the push count is the seven-day stored fact, not a
  six-hour window count

### Requirement: Missing and stale inputs are named

A section whose inputs are absent SHALL name the missing input and
SHALL remain on the page. Stale bounds are per input, not a blanket
six hours. The emission-gate bar uses a twenty-six hour stale bound
(the briefing default). Network vitals are shown with their
observation date and SHALL NOT be named stale only because that date
is older than six hours. Panel movers use the window since the
previous subnt publish, or the six hours before compose when there
is no previous publish. An input older than its own bound SHALL be
named stale and SHALL NOT be presented as current. The page SHALL
NOT estimate, interpolate, or carry a prior value forward as current.

#### Scenario: Empty section keeps its landmark

- **WHEN** a section has no current facts
- **THEN** the landmark is still present and the body names the gap

#### Scenario: Stale value is not shown as current

- **WHEN** a section's newest input is older than its own stale bound
- **THEN** the section names the age or staleness and does not show
  the old figure as current

#### Scenario: Vitals are dated, not six-hour-stale

- **WHEN** the latest network vitals row is older than six hours and
  has an observation date
- **THEN** the network section shows those figures with that date and
  does not name them stale for age alone

### Requirement: Operator-only facts are absent

The page SHALL NOT include wallet addresses, keys or seed material,
Telegram identifiers, LAN or Pi addresses, TaoStats quota, exploit
paths, mining budget band, or atlas/operator health, watermark, or
next-action lines.

#### Scenario: Off-page strings are missing

- **WHEN** the published `index.html` is inspected
- **THEN** it contains none of those operator-only facts

### Requirement: Editions and deltas

When a previous subnt publish exists, each figure that has a prior
value SHALL show its change since that publish. Deltas SHALL NOT use
the Telegram briefing watermark. When no previous publish exists, the
page SHALL state that it is the first edition and SHALL show no
figure deltas.

#### Scenario: First Atlas edition

- **WHEN** Atlas publishes and no previous subnt edition exists
- **THEN** the page states that it is the first edition and shows
  current values without figure deltas

#### Scenario: Later edition compares to last publish

- **WHEN** a previous subnt publish exists
- **THEN** figure deltas compare to that publish, not to Telegram

### Requirement: Unknown paths are not an SPA

A path other than `/` SHALL be served as a not-found page, not as
`index.html`.

#### Scenario: Miss page

- **WHEN** a reader opens a path that is not `/`
- **THEN** the response is the not-found document and a link back to
  `/`
