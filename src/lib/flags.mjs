// Subnet lists that Atlas writes as notes ("Label: SN6, SN27, SN42.").
// This reads the note text as written. It creates no figure: a list
// becomes chips, and each listed subnet carries the list's short tag
// wherever it appears in a row on the page.
const LIST = /^(.+?):\s*(SN\d+(?:,\s*SN\d+)*)\.?$/;

// Short tags for lists the page knows. A list with no match still
// renders as chips; its subnets just carry no row tag.
const TAGS = [
  [/deregistration/i, "dereg"],
  [/ownership|takeover/i, "owner"],
];

export function noteList(text) {
  const m = LIST.exec(text);
  if (!m) return null;
  return { label: m[1], ids: m[2].split(/,\s*/).map((s) => Number(s.slice(2))) };
}

// netuid -> [{ tag, label }] from every public note on the page.
export function flagMap(sections) {
  const map = new Map();
  for (const doc of Object.values(sections)) {
    if (!doc || doc.access !== "public") continue;
    for (const b of doc.blocks) {
      if (b.access !== "public") continue;
      for (const t of b.notes ?? []) {
        const list = noteList(t);
        const tag = list && TAGS.find(([re]) => re.test(list.label))?.[1];
        if (!tag) continue;
        for (const n of list.ids) {
          if (!map.has(n)) map.set(n, []);
          map.get(n).push({ tag, label: list.label });
        }
      }
    }
  }
  return map;
}
