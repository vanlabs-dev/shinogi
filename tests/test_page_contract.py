"""Public-pulse contract. Reads local HTML only. No network.

Holds for both states index.html is ever in: the pre-Atlas shell, and a
published Atlas edition. A test that only accepted the shell would go red
the moment the renderer did its job.
"""

import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
NOT_FOUND = (ROOT / "404.html").read_text(encoding="utf-8")

SECTION_IDS = ("network", "movers", "mining", "attention", "code-narrative")

# Exact leak strings from Atlas compose() wrapping. Do not match short
# substrings such as "key" or "Pi".
OPERATOR_TOKENS = (
    "mining.budget_band",
    "TaoStats quota",
    "192.168.0.150",
    "t.me/",
    "api.telegram.org",
    "next: pick mining.budget_band",
)

# A typeface source is the only external stylesheet the contract allows.
FONT_HOSTS = ("fonts.googleapis.com", "fonts.gstatic.com")

# Ways a browser could pull reported data. Presentation script is allowed;
# fetching a figure is not, because Atlas is the only writer.
DATA_FETCH = ("fetch(", "XMLHttpRequest", "EventSource", "new WebSocket",
              "navigator.sendBeacon", "import(")

ASOF_PUBLISHED = re.compile(r"^as of \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC "
                            r"\u00b7 block (\d+|not recorded)$")
ASOF_SHELL = "awaiting first Atlas publish"


class Page(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.h1: list[str] = []
        self.h3: list[str] = []
        self.asof: list[str] = []
        self.scripts: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.hrefs: list[str] = []
        self._capture: str | None = None
        self._buf: list[str] = []
        self._asof_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        ad = {k: (v or "") for k, v in attrs}
        if tag == "section" and ad.get("id"):
            self.ids.append(ad["id"])
        if tag in ("h1", "h3"):
            self._capture = tag
            self._buf = []
        if tag == "div" and ad.get("class") == "asof":
            self._capture = "asof"
            self._buf = []
            self._asof_depth = 1
        elif self._capture == "asof":
            self._asof_depth += 1
        if tag == "script":
            self.scripts.append(ad)
        if tag == "link":
            self.links.append(ad)
        if tag == "a" and "href" in ad:
            self.hrefs.append(ad["href"])

    def handle_endtag(self, tag: str) -> None:
        if self._capture in ("h1", "h3") and tag == self._capture:
            getattr(self, self._capture).append("".join(self._buf).strip())
            self._capture = None
            self._buf = []
        elif self._capture == "asof" and tag == "div":
            self._asof_depth -= 1
            if self._asof_depth <= 0:
                self.asof.append("".join(self._buf).strip())
                self._capture = None
                self._buf = []
                self._asof_depth = 0

    def handle_data(self, data: str) -> None:
        if self._capture is not None:
            self._buf.append(data)


def _parse(html: str) -> Page:
    page = Page()
    page.feed(html)
    page.close()
    return page


def test_section_ids_in_locked_order() -> None:
    page = _parse(INDEX)
    assert tuple(page.ids) == SECTION_IDS


def test_masthead_wordmark_and_asof() -> None:
    """The as-of line is either the pre-Atlas shell or a published
    edition, and nothing in between. A published edition states the
    compose time in UTC and either the block or that gap by name."""
    page = _parse(INDEX)
    assert page.h1 == ["SUBNT"]
    assert len(page.asof) == 1
    asof = page.asof[0]
    if asof == ASOF_SHELL:
        assert "block " not in asof
        assert "as of " not in asof
        return
    assert ASOF_PUBLISHED.match(asof), "unrecognised as-of line: %r" % asof


def test_code_narrative_has_two_h3_groups() -> None:
    page = _parse(INDEX)
    start = INDEX.find('id="code-narrative"')
    assert start != -1
    chunk = INDEX[start:]
    inner = _parse("<html><body>" + chunk)
    assert inner.h3 == ["Code", "Narrative"]


def test_no_data_is_fetched_in_the_browser() -> None:
    """Presentation script is allowed. Pulling a reported figure is not:
    the data must already be in the delivered document."""
    for token in DATA_FETCH:
        assert token not in INDEX, "page could fetch data: %r" % token
    assert "@import" not in INDEX
    for script in _parse(INDEX).scripts:
        assert "src" not in script, "no external script: %r" % script


def test_external_links_are_typeface_sources_only() -> None:
    for link in _parse(INDEX).links:
        href = link.get("href", "")
        if not href.startswith("http"):
            continue
        assert any(host in href for host in FONT_HOSTS), \
            "external link is not a typeface source: %r" % href


def test_every_figure_survives_scripting_being_off() -> None:
    """Strip every script element and the page must still carry its
    sections and its figures."""
    stripped = re.sub(r"<script\b.*?</script>", "", INDEX,
                      flags=re.S | re.I)
    page = _parse(stripped)
    assert tuple(page.ids) == SECTION_IDS
    assert page.h1 == ["SUBNT"]
    assert len(page.asof) == 1


def test_operator_tokens_absent() -> None:
    for token in OPERATOR_TOKENS:
        assert token not in INDEX
        assert token not in NOT_FOUND


def test_404_is_distinct_miss_page() -> None:
    assert NOT_FOUND != INDEX
    page = _parse(NOT_FOUND)
    assert "/" in page.hrefs
    assert "not found" in NOT_FOUND.lower() or "no such path" in NOT_FOUND.lower()
