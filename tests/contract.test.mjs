// subnt v2 page contract. Builds the page from fixture data into temp
// directories and checks the built output. No network.
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { leaks } from "../src/lib/leak.mjs";
import tokens from "../src/styles/tokens.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIX = path.join(ROOT, "tests", "fixtures");
const TMP = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), "subnt-test-"));
const SECTION_IDS = ["network", "movers", "mining", "attention", "code-narrative"];
const ASOF = /^Updated \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC \u00b7 block (\d+|not recorded)$/;
const DATA_FETCH = ["fetch(", "XMLHttpRequest", "EventSource", "WebSocket",
  "navigator.sendBeacon", "import(", "@import"];
const BUDGET = { html: 120 * 1024, js: 15 * 1024, font: 60 * 1024 };

function build(name, dataDir) {
  const out = path.join(TMP, name);
  const r = spawnSync("npx", ["astro", "build", "--silent"], {
    cwd: ROOT, encoding: "utf8",
    env: { ...process.env, SUBNT_DATA: dataDir, SUBNT_OUT: out, ASTRO_TELEMETRY_DISABLED: "1" },
  });
  return { ok: r.status === 0, out, log: (r.stdout || "") + (r.stderr || "") };
}

function copyFixture(name, mutate) {
  const dir = path.join(TMP, "data-" + name);
  fs.cpSync(path.join(FIX, "sample"), dir, { recursive: true });
  if (mutate) mutate(dir);
  return dir;
}

function edit(dir, file, fn) {
  const p = path.join(dir, file);
  const doc = JSON.parse(fs.readFileSync(p, "utf8"));
  fn(doc);
  fs.writeFileSync(p, JSON.stringify(doc));
}

const read = (out, f = "index.html") => fs.readFileSync(path.join(out, f), "utf8");
const stripScripts = (h) => h.replace(/<script\b[\s\S]*?<\/script>/gi, "");
const text = (h) => stripScripts(h)
  .replace(/<style\b[\s\S]*?<\/style>/gi, "")
  .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const ids = (h) => [...h.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1]);
const tagText = (h, re) => [...h.matchAll(re)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());

const B = {};
before(() => {
  B.sample = build("sample", path.join(FIX, "sample"));
  B.mover = build("mover", path.join(FIX, "mover-subscriber"));
  B.empty = build("empty", path.join(TMP, "no-such-data"));
  for (const [k, b] of Object.entries(B)) assert.ok(b.ok, `${k} build failed:\n${b.log}`);
});

// 4.1 Ported v1 contract

test("five landmarks in contract order, with and without data", () => {
  for (const b of Object.values(B)) assert.deepEqual(ids(read(b.out)), SECTION_IDS);
});

test("masthead: wordmark, tagline, updated line", () => {
  for (const b of [B.sample, B.mover]) {
    const h = read(b.out);
    assert.deepEqual(tagText(h, /<h1\b[^>]*>([\s\S]*?)<\/h1>/g), ["SUBNT"]);
    assert.ok(h.includes("A lean read on Bittensor subnets"));
    const asof = tagText(h, /<div class="asof"[^>]*>([\s\S]*?)<\/div>/g);
    assert.equal(asof.length, 1);
    assert.match(asof[0], ASOF);
    assert.match(h, /<time datetime="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z" data-ago>/);
  }
});

test("as-of line names a missing block and shows no number", () => {
  const dir = copyFixture("noblock", (d) => {
    for (const f of fs.readdirSync(d)) edit(d, f, (doc) => { doc.block = null; });
  });
  const b = build("noblock", dir);
  assert.ok(b.ok, b.log);
  const asof = tagText(read(b.out), /<div class="asof"[^>]*>([\s\S]*?)<\/div>/g)[0];
  assert.match(asof, /block not recorded$/);
});

test("no data: page builds, awaits first publish, every section names its gap", () => {
  const h = read(B.empty.out);
  const asof = tagText(h, /<div class="asof"[^>]*>([\s\S]*?)<\/div>/g)[0];
  assert.equal(asof, "awaiting first Atlas publish");
  assert.ok(!/Updated \d/.test(h) && !/block \d/.test(h) && !/<time\b/.test(h));
  const leads = tagText(h, /<p class="lead"[^>]*>([\s\S]*?)<\/p>/g);
  assert.equal(leads.length, 5);
  for (const l of leads) assert.match(l, /^Missing /);
  assert.ok(!/<dl class="stats"/.test(h), "no figures follow a gap lead");
});

test("no data is fetched in the browser; no external script", () => {
  for (const b of Object.values(B)) {
    const h = read(b.out);
    for (const t of DATA_FETCH) assert.ok(!h.includes(t), `page could fetch data: ${t}`);
    for (const m of h.matchAll(/<script\b([^>]*)>/g)) assert.ok(!/\bsrc=/.test(m[1]), "external script");
  }
});

test("4.4 no third-party request: every src/href is local or an anchor", () => {
  for (const b of Object.values(B)) {
    for (const f of ["index.html", "404.html"]) {
      const h = read(b.out, f);
      for (const m of h.matchAll(/\b(?:src|href|srcset|action|poster)="([^"]*)"/g)) {
        assert.ok(/^(\/|#)/.test(m[1]), `${f}: non-local reference ${m[1]}`);
      }
      assert.ok(!/url\(\s*['"]?(?:https?:)?\/\//.test(h), `${f}: external url() in CSS`);
    }
  }
});

test("links point to / or an in-page anchor that exists", () => {
  const h = read(B.sample.out);
  for (const m of h.matchAll(/<a\b[^>]*href="([^"]*)"/g)) {
    const href = m[1];
    assert.ok(href === "/" || href.startsWith("#"), href);
    if (href.startsWith("#")) assert.ok(h.includes(`id="${href.slice(1)}"`), href);
  }
});

test("readable with scripting off: sections, figures, gaps, detail remain", () => {
  for (const b of [B.sample, B.mover]) {
    const h = read(b.out);
    const s = stripScripts(h);
    assert.deepEqual(ids(s), SECTION_IDS);
    assert.equal(text(s).replace(/\s+/g, " "), text(h).replace(/\s+/g, " "));
  }
  // Detail is in the document, inside native disclosure.
  const m = read(B.mover.out);
  assert.ok(/<details[^>]*>\s*<summary[^>]*>[\s\S]*?SN9[\s\S]*?<\/summary>\s*<dl class="detail/.test(m));
});

test("operator material absent from the page, 404, and every data file", () => {
  for (const b of Object.values(B)) {
    for (const f of ["index.html", "404.html"]) assert.deepEqual(leaks(read(b.out, f)), [], f);
  }
  for (const d of ["sample", "mover-subscriber"]) {
    for (const f of fs.readdirSync(path.join(FIX, d))) {
      assert.deepEqual(leaks(fs.readFileSync(path.join(FIX, d, f), "utf8")), [], `${d}/${f}`);
    }
  }
});

test("a leak in data fails the build", () => {
  const dir = copyFixture("leak", (d) => edit(d, "mining.json", (doc) => {
    doc.blocks[0].notes.push("Set mining.budget_band first.");
  }));
  const b = build("leak", dir);
  assert.equal(b.ok, false);
  assert.match(b.log, /operator material/);
});

test("404 is a distinct miss page linking to /", () => {
  const nf = read(B.sample.out, "404.html");
  assert.notEqual(nf, read(B.sample.out));
  assert.ok(nf.includes('href="/"'));
  assert.match(nf.toLowerCase(), /not found|no such path/);
});

test("no em dashes in the built page", () => {
  for (const b of Object.values(B)) assert.ok(!read(b.out).includes("\u2014"));
});

// Schema

test("unsupported major schema version fails the build", () => {
  const dir = copyFixture("major", (d) => edit(d, "network.json", (doc) => { doc.schema = "subnt/2.0"; }));
  const b = build("major", dir);
  assert.equal(b.ok, false);
  assert.match(b.log, /not supported/);
});

test("a newer minor version still builds", () => {
  const dir = copyFixture("minor", (d) => {
    for (const f of fs.readdirSync(d)) edit(d, f, (doc) => { doc.schema = "subnt/1.3"; });
  });
  assert.ok(build("minor", dir).ok);
});

test("files from different editions fail the build", () => {
  const dir = copyFixture("mixed", (d) => edit(d, "code.json", (doc) => { doc.block -= 1; }));
  const b = build("mixed", dir);
  assert.equal(b.ok, false);
  assert.match(b.log, /different edition/);
});

// 4.2 No derived figures

test("every number on the page appears in a data file", () => {
  for (const [b, d] of [[B.sample, "sample"], [B.mover, "mover-subscriber"]]) {
    const data = fs.readdirSync(path.join(FIX, d))
      .map((f) => fs.readFileSync(path.join(FIX, d, f), "utf8")).join("\n");
    const nums = new Set(text(read(b.out)).match(/\d[\d,]*(?:\.\d+)?/g) || []);
    const missing = [...nums].filter((n) => !data.includes(n));
    assert.deepEqual(missing, [], `${d}: numbers not in data`);
  }
});

// 4.3 Budget

test("byte budget: html, js, font", () => {
  const out = B.sample.out;
  const html = fs.statSync(path.join(out, "index.html")).size;
  assert.ok(html <= BUDGET.html, `index.html ${html} B exceeds ${BUDGET.html} B`);
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
  const files = walk(out);
  const inline = [...read(out).matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .reduce((n, m) => n + Buffer.byteLength(m[1]), 0);
  const js = inline + files.filter((f) => f.endsWith(".js")).reduce((n, f) => n + fs.statSync(f).size, 0);
  assert.ok(js <= BUDGET.js, `JavaScript ${js} B exceeds ${BUDGET.js} B`);
  const fonts = files.filter((f) => /\.(woff2?|ttf|otf)$/.test(f));
  assert.equal(fonts.length, 1, "one self-hosted font file");
  const fb = fs.statSync(fonts[0]).size;
  assert.ok(fb <= BUDGET.font, `font ${fb} B exceeds ${BUDGET.font} B`);
  assert.ok(read(out).includes("font-display:swap"));
});

test("reduced motion disables animation and transition", () => {
  const rm = (read(B.sample.out).match(/prefers-reduced-motion:reduce\)\{([\s\S]*?\})\}/) || [])[1] || "";
  assert.match(rm, /animation:none!important/);
  assert.match(rm, /transition:none!important/);
});

// 4.5 Subscriber leak

test("subscriber block renders a labelled, blurred placeholder with no recorded figure", () => {
  const h = read(B.mover.out);
  const start = h.indexOf('id="mining"');
  const sec = h.slice(start, h.indexOf("</section>", start));
  assert.ok(sec.includes('aria-label="Subscriber section"'));
  assert.ok(sec.includes("Subscriber section: Mining board"));
  assert.ok(sec.includes('class="blur"'));
  const shape = sec.replace(/<p class="lead"[\s\S]*?<\/p>/, "");
  assert.ok(!/\d/.test(text(shape.replace(/\sdata-astro-cid-\w+/g, ""))), "placeholder carries a digit");
});

test("a subscriber block carrying content fails the build", () => {
  const dir = copyFixture("subleak", (d) => edit(d, "mining.json", (doc) => {
    doc.blocks[0] = { ...doc.blocks[0], access: "subscriber", shape: { facts: 2, rows: 10, series: 0 } };
  }));
  const b = build("subleak", dir);
  assert.equal(b.ok, false);
  assert.match(b.log, /schema check failed/);
});

test("v2 fixture ships every block public and no placeholder", () => {
  for (const f of fs.readdirSync(path.join(FIX, "sample"))) {
    const doc = JSON.parse(fs.readFileSync(path.join(FIX, "sample", f), "utf8"));
    if (doc.kind !== "section") continue;
    assert.equal(doc.access, "public");
    for (const b of doc.blocks) assert.equal(b.access, "public");
  }
  assert.ok(!read(B.sample.out).includes("Subscriber section"));
});

// 4.6 Accessibility

test("one h1 and headings never skip a level", () => {
  for (const b of Object.values(B)) {
    const levels = [...read(b.out).matchAll(/<h([1-6])\b/g)].map((m) => +m[1]);
    assert.equal(levels.filter((l) => l === 1).length, 1);
    assert.equal(levels[0], 1);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `h${levels[i - 1]} -> h${levels[i]}`);
  }
});

test("every chart has a caption stating its figures", () => {
  const h = read(B.mover.out);
  const figs = [...h.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map((m) => m[0]);
  assert.ok(figs.length >= 4);
  for (const f of figs) {
    assert.ok(/<svg[^>]*aria-hidden="true"/.test(f));
    const cap = tagText(f, /<figcaption[^>]*>([\s\S]*?)<\/figcaption>/g)[0] || "";
    assert.match(cap, /\d/, "caption states figures");
  }
});

function lum(hex) {
  const c = hex.replace("#", "").match(/../g).map((x) => parseInt(x, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
test("token colour pairs meet WCAG AA (4.5:1) in both themes", () => {
  for (const theme of ["light", "dark"]) {
    for (const [fg, bg] of tokens.contrast_pairs) {
      const a = lum(tokens.color[theme][fg]); const b = lum(tokens.color[theme][bg]);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      assert.ok(ratio >= 4.5, `${theme} ${fg} on ${bg}: ${ratio.toFixed(2)}`);
    }
  }
});

test("component styles use tokens, not raw colours", () => {
  const dir = path.join(ROOT, "src", "components");
  for (const f of fs.readdirSync(dir)) {
    const css = (fs.readFileSync(path.join(dir, f), "utf8").match(/<style>([\s\S]*?)<\/style>/) || [])[1] || "";
    assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(css), `${f} has a raw colour`);
  }
});

// 4.7 360 px, headless browser

test("no horizontal overflow at 360 px; touch targets at least 44 px", async (t) => {
  const exe = ["/usr/bin/chromium", "/usr/bin/chromium-browser", process.env.CHROME_PATH].find((p) => p && fs.existsSync(p));
  if (!exe) return t.skip("no Chromium on this machine");
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({ executablePath: exe, headless: true, args: ["--no-sandbox"] });
  try {
    for (const b of [B.sample, B.mover, B.empty]) {
      for (const width of [360, 1280]) {
        const page = await browser.newPage();
        await page.setViewport({ width, height: 800 });
        await page.goto("file://" + path.join(b.out, "index.html"));
        const r = await page.evaluate(() => {
          document.querySelectorAll("details").forEach((d) => { d.open = true; });
          const doc = document.documentElement;
          const small = [...document.querySelectorAll("a, summary, button:not([hidden] *)")]
            .filter((e) => e.offsetParent !== null)
            .map((e) => [e.textContent.trim().slice(0, 30), e.getBoundingClientRect().height])
            .filter(([, h]) => h < 44);
          return { sw: doc.scrollWidth, cw: doc.clientWidth, small };
        });
        assert.ok(r.sw <= r.cw, `${path.basename(b.out)} @${width}: scrollWidth ${r.sw} > ${r.cw}`);
        assert.deepEqual(r.small, [], `targets under 44 px @${width}`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
