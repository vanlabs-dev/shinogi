import tokens from "./tokens.json" with { type: "json" };

function vars(obj, prefix) {
  return Object.entries(obj).map(([k, v]) => `--${prefix}${k}:${v};`).join("");
}

// Light is the base; dark follows the device setting.
export function tokenCss() {
  const shared =
    vars(tokens.size, "size-") + vars(tokens.space, "space-") +
    vars(tokens.radius, "radius-") + vars(tokens.chart, "chart-") +
    vars(tokens.layout, "layout-") + `--font-sans:${tokens.font.sans};`;
  return (
    `:root{color-scheme:light dark;${shared}${vars(tokens.color.light, "c-")}}` +
    `@media (prefers-color-scheme:dark){:root{${vars(tokens.color.dark, "c-")}}}`
  );
}

export default tokens;
