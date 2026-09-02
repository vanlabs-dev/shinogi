## 1. Page shell

- [x] 1.1 Replace `index.html` main with the five section landmarks in order (`#network` `#movers` `#mining` `#attention` `#code-narrative`), keeping the current dark mono chrome, wordmark, tagline, and footer
- [x] 1.2 Set the masthead as-of line to awaiting first Atlas publish with no invented time or block
- [x] 1.3 Give each section a named gap body (not silent empty). Put Code and Narrative as two `h3` groups inside `#code-narrative`
- [x] 1.4 Confirm `404.html` still serves a miss page with a link to `/` and is not a copy of `index.html`
- [x] 1.5 Keep the document self-contained: no external CSS, font, or script

## 2. Contract test

- [x] 2.1 Add `tests/test_page_contract.py` that reads `index.html` and `404.html` with no network
- [x] 2.2 Assert section ids appear in the locked order, masthead has SHINOGI and the awaiting as-of line, `#code-narrative` contains two `h3` groups (Code, Narrative), and there is no script that fetches
- [x] 2.3 Assert these exact operator tokens are absent: Telegram identifiers, LAN host addresses, TaoStats quota, `mining.budget_band`, exploit paths. Do not match short substrings such as `key` or `Pi`
- [x] 2.4 Assert `404.html` is a distinct miss page and links to `/`
- [x] 2.5 Run the test (`pytest -q` from the repo root)

## 3. Docs

- [x] 3.1 Update `AGENTS.md` standing: the page is the public-pulse shell, not the two-paragraph placeholder; next action is Atlas renderer on the fleet unit
