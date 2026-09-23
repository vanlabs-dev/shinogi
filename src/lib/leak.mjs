// Operator-only material. Shared by the build (fails closed) and the
// contract tests. Exact strings from the v1 contract plus patterns for
// addresses and identifiers that must never reach a public file.
export const OPERATOR_TOKENS = [
  "mining.budget_band",
  "budget_band",
  "TaoStats quota",
  "TAOSTATS_API_KEY",
  "192.168.0.150",
  "t.me/",
  "api.telegram.org",
  "next: pick mining.budget_band",
  "rent_band",
  "watermark",
];

export const OPERATOR_PATTERNS = [
  // SS58 address (wallet or hotkey).
  [/\b5[1-9A-HJ-NP-Za-km-z]{47}\b/, "SS58 address"],
  // Private IPv4.
  [/\b(?:10|127)\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, "private IPv4"],
  [/\b192\.168\.\d{1,3}\.\d{1,3}\b/, "private IPv4"],
  [/\b172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}\b/, "private IPv4"],
  // Seed material and private keys.
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key"],
  [/\b0x[0-9a-fA-F]{64}\b/, "32-byte hex secret"],
  // Telegram bot token.
  [/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/, "Telegram bot token"],
  // Atlas operator lines.
  [/^next: /m, "operator next-action line"],
];

export function leaks(text) {
  const hits = [];
  for (const t of OPERATOR_TOKENS) if (text.includes(t)) hits.push(JSON.stringify(t));
  for (const [re, name] of OPERATOR_PATTERNS) if (re.test(text)) hits.push(name);
  return hits;
}
