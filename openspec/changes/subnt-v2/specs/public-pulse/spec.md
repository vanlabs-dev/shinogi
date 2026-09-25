## MODIFIED Requirements

### Requirement: One page, and the data is baked into it

The published site SHALL serve a single page at `/`. The page SHALL have
no accounts, no article list, and no route to another view. In-page
links to the page's own sections are allowed.

Every figure the page reports SHALL be present in the delivered
document. The page SHALL NOT fetch, request, or derive any reported
figure in the browser: no `fetch`, no `XMLHttpRequest`, no
`EventSource`, no WebSocket, no dynamic import of data. Atlas is the
only writer of figures, and a reader with scripting disabled SHALL
still see every figure.

Presentation may use a self-hosted typeface and client-side script. A
script SHALL only arrange, sort, filter, reveal, or annotate content
already in the document.

#### Scenario: Root is the only view

- **WHEN** a reader opens `/`
- **THEN** one document renders the full page, and every link in it
  points to `/`, an in-page anchor, or an external source citation

#### Scenario: No data is fetched in the browser

- **WHEN** the document is loaded
- **THEN** it issues no request for reported data and every figure was
  already in the delivered HTML

#### Scenario: Readable with scripting off

- **WHEN** the page is rendered with JavaScript disabled
- **THEN** every section, figure, named gap, and per-subnet detail is
  still present and legible

#### Scenario: Script only rearranges

- **WHEN** a reader sorts or filters a subnet list
- **THEN** the rows shown are a subset or reordering of rows already in
  the document and no figure is created

### Requirement: Masthead states as-of time and block

The page SHALL open with a masthead containing the wordmark `SUBNT`,
the tagline `A lean read on Bittensor subnets`, and an as-of line.

The as-of line SHALL be `Updated <time> · block <n>`, where `<time>` and
`<n>` are the compose time and block recorded in the published data
files. In the document `<time>` is the UTC compose time in a `<time>`
element. A presentation script MAY rewrite it as the edition's age in
words (`3 hours and 11 minutes ago`) from the reader's clock, with the
compose time in the reader's timezone as its tooltip. When the block is missing from the data, the as-of line SHALL
name the gap and SHALL omit a block number. When no data files have
been published, the page SHALL state that it awaits the first Atlas
publish and SHALL NOT invent a time or block.

#### Scenario: Published data with a block

- **WHEN** the data files carry a compose time and block
- **THEN** the masthead shows `Updated` that UTC time and `block`
  followed by that number
- **AND** with scripting on, the time reads as the edition's age

#### Scenario: Published data with no block

- **WHEN** the data files carry no block
- **THEN** the as-of line names the missing block and shows no number

#### Scenario: No data published yet

- **WHEN** the build finds no data files
- **THEN** the page builds, every section names its missing input, and
  the as-of line states that the page awaits the first Atlas publish

### Requirement: Fixed section order

After the masthead, the page SHALL render these sections in this order,
each as a landmark with a stable `id`:

1. Network (`#network`)
2. Subnet movers (`#movers`)
3. Mining (`#mining`)
4. Attention (`#attention`)
5. Code / narrative (`#code-narrative`)

Every section SHALL be present on every build, including a build with
no data. A section MAY be reordered or added only by a change to this
spec.

#### Scenario: Order holds with data

- **WHEN** the page builds from published data
- **THEN** the five landmarks exist in that order

#### Scenario: Order holds without data

- **WHEN** the page builds with no data files
- **THEN** the five landmarks exist in that order, each naming its gap

### Requirement: Operator-only facts are absent

The page and every file in this repository SHALL NOT include wallet
addresses, keys or seed material, Telegram identifiers, LAN or Pi
addresses, TaoStats quota, exploit paths, mining budget band, or
atlas/operator health, watermark, or next-action lines.

#### Scenario: Off-page strings are missing from the page

- **WHEN** the built `index.html` is inspected
- **THEN** it contains none of those operator-only facts

#### Scenario: Off-page strings are missing from the data

- **WHEN** the data files are inspected
- **THEN** they contain none of those operator-only facts

## ADDED Requirements

### Requirement: The page is built from published data files

The page SHALL be generated at build time from data files that Atlas
writes into `data/`. Each data file SHALL carry a schema version, the
compose time, and the block. The build SHALL fail when a data file's
major schema version is not one the page supports, rather than render
a partial or guessed page. The page SHALL NOT compute a reported figure
from other figures; every reported figure and every section lead SHALL
come from the data files as written.

#### Scenario: Supported schema

- **WHEN** every data file carries a supported schema version
- **THEN** the build succeeds and renders their figures

#### Scenario: Unsupported schema fails the build

- **WHEN** a data file carries an unsupported major schema version
- **THEN** the build fails and the last deployed page stays live

#### Scenario: No derived figures

- **WHEN** the built page is compared to the data files
- **THEN** every number on the page appears in a data file

### Requirement: Each section answers one reader question

Each section SHALL declare the reader question it answers and SHALL
open with a lead sentence that answers it in plain words, followed by
the figures that support it. The lead SHALL be written by Atlas from
recorded facts and delivered in the data file. When the section's
inputs are missing, the lead SHALL name the gap. Figures that do not
support the section's question SHALL NOT be shown in that section.

| Section | Question |
|---|---|
| Network | What changed on the network since the last edition? |
| Subnet movers | Which subnets moved, and which crossed the bar? |
| Mining | Where is mining worth a look now? |
| Attention | Which subnets deserve a closer read, and why? |
| Code / narrative | Where is code shipping, and what is being adopted? |

#### Scenario: Lead comes first

- **WHEN** a section renders with facts
- **THEN** its first content is the lead sentence, followed by figures

#### Scenario: Lead names a gap

- **WHEN** a section's inputs are missing
- **THEN** its lead names the missing input and no figures follow

### Requirement: Detail opens in place

Per-subnet and per-item detail SHALL open in place using native
disclosure (`<details>`/`<summary>`) and SHALL NOT link to another
route. Collapsed detail SHALL be present in the delivered document.

#### Scenario: Detail without script

- **WHEN** scripting is off and a reader opens a subnet row
- **THEN** its detail expands in place and shows its figures

### Requirement: Mobile-first layout

The page SHALL be designed for a narrow screen first and SHALL enhance
for wider screens. At a 360 px viewport the page SHALL have no
horizontal page scroll, tables SHALL render as stacked rows or cards,
and charts SHALL fit the viewport width. A sticky in-page section bar
MAY link to the five sections.

#### Scenario: Narrow viewport

- **WHEN** the page renders at 360 px wide
- **THEN** the document width does not exceed the viewport and every
  figure is readable without zoom

#### Scenario: Wide viewport

- **WHEN** the page renders at 1280 px wide
- **THEN** the same sections and figures appear, arranged for the
  wider screen

### Requirement: One design system

Colour, type scale, spacing, radius, and chart style SHALL be defined
once as design tokens and used by every component. The page SHALL
provide light and dark themes that follow the device setting. Charts
SHALL be inline SVG generated at build time from data-file series and
SHALL NOT introduce a figure the page does not otherwise report, nor
estimate, interpolate, or smooth a value.

#### Scenario: Theme follows the device

- **WHEN** the device prefers a dark or light colour scheme
- **THEN** the page renders in the matching theme

#### Scenario: No stray values

- **WHEN** component styles are inspected
- **THEN** colours and spacing come from the tokens

### Requirement: Performance budget

The built page SHALL meet this budget, enforced by a test on the build
output:

- `index.html`, with inlined critical CSS: at most 120 KB uncompressed.
- JavaScript shipped to the browser: at most 15 KB uncompressed in
  total, and none required to read the page.
- Typeface: one self-hosted, subset, variable font file of at most
  60 KB, loaded with `font-display: swap`.
- No third-party request of any kind.

Motion SHALL be limited to state changes and SHALL be disabled when the
device requests reduced motion.

#### Scenario: Budget exceeded

- **WHEN** a build output exceeds any budget line
- **THEN** the contract test fails and names the line exceeded

#### Scenario: Reduced motion

- **WHEN** the device requests reduced motion
- **THEN** no animation or transition runs

### Requirement: Accessible by default

The page SHALL meet WCAG 2.2 AA for colour contrast in both themes,
SHALL use one `h1` and ordered headings, SHALL give every chart a text
equivalent that states the same figures, and SHALL give touch targets
at least 44 by 44 CSS px.

#### Scenario: Chart has a text equivalent

- **WHEN** a chart renders
- **THEN** an accessible label or caption states the figures it shows

### Requirement: Sections carry an access level

Every section and every sub-block that can be gated SHALL carry an
access level of `public` or `subscriber` in the data files. A
`subscriber` block SHALL render in the same layout as its public form,
filled with placeholder values that are not recorded facts, visually
blurred, and labelled `Subscriber section` for assistive technology
and for readers with styles off. The page SHALL stay one complete view
for every reader.

Real figures for a `subscriber` block SHALL NOT appear in the data
files, the built page, or any commit to this repository. v2 SHALL
publish every block as `public`.

#### Scenario: Subscriber block for a public reader

- **WHEN** a block is marked `subscriber`
- **THEN** the page shows its placeholder, blurred and labelled, and
  the document contains no recorded figure for it

#### Scenario: Leak check

- **WHEN** a data file carries a recorded figure inside a block marked
  `subscriber`
- **THEN** the contract test fails and the build does not deploy

#### Scenario: v2 ships public

- **WHEN** v2 is first deployed
- **THEN** every block is `public` and no placeholder renders

### Requirement: Build and deploy are static

Cloudflare Workers static hosting SHALL build the page with the Astro
build command on push to `main` and deploy only the static output. No
server-side code SHALL run to serve the page. A failed build SHALL
leave the last deployed page live.

#### Scenario: Data push triggers a build

- **WHEN** Atlas pushes changed data files to `main`
- **THEN** Cloudflare builds and deploys the static page

#### Scenario: Failed build

- **WHEN** the build or contract test fails
- **THEN** nothing new deploys and the previous page stays live
