// Chart geometry. Straight segments between recorded points: no
// smoothing, no interpolation, no extra point. Fewer than two points
// returns null and the page draws no chart.

export function line(points, w = 320, h = 64, pad = 6) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const lo = Math.min(...points);
  const hi = Math.max(...points);
  const span = hi - lo || 1;
  const step = (w - pad * 2) / (points.length - 1);
  const xy = points.map((v, i) => [
    pad + i * step,
    hi === lo ? h / 2 : pad + (h - pad * 2) * (1 - (v - lo) / span),
  ]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const [lx, ly] = xy[xy.length - 1];
  return { w, h, d, last: { x: lx.toFixed(1), y: ly.toFixed(1) } };
}

export function strip(points, { log = false, mark = null, highlight = [] } = {}, w = 640, h = 160) {
  if (!Array.isArray(points) || points.length < 2) return null;
  const pos = points.filter((v) => v > 0);
  if (pos.length === 0) return null;
  const f = log ? (v) => Math.log10(v) : (v) => v;
  const lo = log ? f(Math.min(...pos)) : 0;
  const hi = f(Math.max(...pos));
  const span = hi - lo || 1;
  const bw = w / points.length;
  const hl = new Set(highlight);
  const bars = points.map((v, i) => {
    // A zero share has no log; it is drawn as a 3-unit stub in its own
    // class so it stays visible and is never given an invented height.
    const t = v > 0 ? (f(v) - lo) / span : 0;
    const bh = v > 0 ? Math.max(3, t * (h - 3)) : 3;
    return {
      x: (i * bw).toFixed(2), y: (h - bh).toFixed(2),
      w: Math.max(0.5, bw * 0.9).toFixed(2), h: bh.toFixed(2),
      cls: v <= 0 ? "zero" : hl.has(i) ? "hi" : mark != null && i < mark ? "above" : "below",
    };
  });
  const markX = mark != null && mark < points.length ? ((mark + 0.95) * bw).toFixed(2) : null;
  return { w, h, bars, markX };
}
