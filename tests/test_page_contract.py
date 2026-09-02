"""Public-pulse shell contract. Reads local HTML only. No network."""

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


def test_masthead_wordmark_and_awaiting_asof() -> None:
    page = _parse(INDEX)
    assert page.h1 == ["SHINOGI"]
    assert page.asof == ["awaiting first Atlas publish"]
    asof = page.asof[0]
    assert "block " not in asof
    assert "as of " not in asof


def test_code_narrative_has_two_h3_groups() -> None:
    page = _parse(INDEX)
    start = INDEX.find('id="code-narrative"')
    assert start != -1
    chunk = INDEX[start:]
    inner = _parse("<html><body>" + chunk)
    assert inner.h3 == ["Code", "Narrative"]


def test_no_script_and_no_external_assets() -> None:
    page = _parse(INDEX)
    assert page.scripts == []
    assert "fetch(" not in INDEX
    assert "XMLHttpRequest" not in INDEX
    for link in page.links:
        rel = link.get("rel", "").lower()
        assert rel not in ("stylesheet", "preconnect")
        href = link.get("href", "")
        assert not href.startswith("http")
    assert "@import" not in INDEX


def test_operator_tokens_absent() -> None:
    for token in OPERATOR_TOKENS:
        assert token not in INDEX
        assert token not in NOT_FOUND


def test_404_is_distinct_miss_page() -> None:
    assert NOT_FOUND != INDEX
    page = _parse(NOT_FOUND)
    assert "/" in page.hrefs
    assert "not found" in NOT_FOUND.lower() or "no such path" in NOT_FOUND.lower()
