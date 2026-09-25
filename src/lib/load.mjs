// Build-time loader for the data Atlas publishes into data/.
// This file reads and validates. It never computes a figure: every value
// the page shows is taken from the files as written.
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { leaks } from "./leak.mjs";

export const SUPPORTED_MAJOR = 1;

// Contract order. File name per section.
export const SECTIONS = [
  { id: "network", file: "network", title: "Network",
    question: "What changed on the network since the last edition?" },
  { id: "movers", file: "movers", title: "Subnet movers",
    question: "Which subnets moved, and which crossed the bar?" },
  { id: "mining", file: "mining", title: "Mining",
    question: "Where is mining worth a look now?" },
  { id: "attention", file: "attention", title: "Attention",
    question: "Which subnets deserve a closer read, and why?" },
  { id: "code-narrative", file: "code", title: "Code / narrative",
    question: "Where is code shipping, and what is being adopted?" },
];

const KNOWN = new Set(["edition", ...SECTIONS.map((s) => s.file)]);

export class DataError extends Error {}

function schemaPath() {
  return path.resolve(process.cwd(), "schema", "subnt-1.0.json");
}

let _validate;
function validator() {
  if (!_validate) {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    _validate = ajv.compile(JSON.parse(fs.readFileSync(schemaPath(), "utf8")));
  }
  return _validate;
}

export function majorOf(schema) {
  const m = /^subnt\/(\d+)\.\d+$/.exec(String(schema ?? ""));
  return m ? Number(m[1]) : null;
}

// Returns { empty, edition, sections: { [id]: doc | null } }.
// Throws DataError on anything that would make the page wrong: an
// unsupported major version, a schema failure, a leak, a subscriber
// block carrying content, or files from different editions.
export function loadData(dir) {
  const out = { empty: true, edition: null, sections: {} };
  for (const s of SECTIONS) out.sections[s.id] = null;
  if (!fs.existsSync(dir)) return out;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  if (files.length === 0) return out;

  const validate = validator();
  const docs = {};
  for (const f of files) {
    const name = f.slice(0, -5);
    if (!KNOWN.has(name)) throw new DataError(`data/${f}: unexpected data file`);
    const raw = fs.readFileSync(path.join(dir, f), "utf8");

    const hits = leaks(raw);
    if (hits.length) throw new DataError(`data/${f}: operator material: ${hits.join(", ")}`);

    let doc;
    try { doc = JSON.parse(raw); }
    catch (e) { throw new DataError(`data/${f}: not JSON (${e.message})`); }

    const major = majorOf(doc.schema);
    if (major !== SUPPORTED_MAJOR) {
      throw new DataError(`data/${f}: schema ${JSON.stringify(doc.schema)} is not supported; ` +
        `this page supports subnt/${SUPPORTED_MAJOR}.x`);
    }
    if (!validate(doc)) {
      const why = validate.errors.slice(0, 5)
        .map((e) => `${e.instancePath || "/"} ${e.message}`).join("; ");
      throw new DataError(`data/${f}: schema check failed: ${why}`);
    }
    docs[name] = doc;
  }

  if (!docs.edition) throw new DataError("data/edition.json is missing");
  const ed = docs.edition;
  for (const s of SECTIONS) {
    const doc = docs[s.file];
    if (!doc) continue;
    if (doc.kind !== "section" || doc.section !== s.id) {
      throw new DataError(`data/${s.file}.json: carries section ${JSON.stringify(doc.section)}, expected ${s.id}`);
    }
    if (doc.composed_at !== ed.composed_at || doc.block !== ed.block) {
      throw new DataError(`data/${s.file}.json: from a different edition than edition.json`);
    }
    if (doc.access === "subscriber" && doc.blocks.some((b) => b.access !== "subscriber")) {
      throw new DataError(`data/${s.file}.json: subscriber section holds a public block`);
    }
    out.sections[s.id] = doc;
  }
  out.edition = ed;
  out.empty = false;
  return out;
}

// "2026-09-23T07:48:53Z" -> "2026-09-23 07:48 UTC". Reformats the recorded
// string; no clock is read.
export function asofTime(iso) {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  return m ? `${m[1]} ${m[2]} UTC` : null;
}

// { iso, time, block } for the masthead, or null before the first publish.
// The page script rewrites the time as "N hours and M minutes ago"; with
// scripting off the recorded UTC time stays.
export function asofLine(data) {
  if (data.empty) return null;
  const b = data.edition.block;
  return {
    iso: data.edition.composed_at,
    time: asofTime(data.edition.composed_at),
    block: b == null ? "not recorded" : String(b),
  };
}
