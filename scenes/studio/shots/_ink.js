// _ink: shared hand-drawn ink helpers for the parchment world (brand/kit/BRAND.md §3, §5).
// INK colour tokens · boil() = 8 fps deterministic jitter · inkPath() = Catmull-Rom smoothed stroke drawn as a
// filled outline with slightly uneven width · inkLoop()/inkCircle()/inkDot() for fills, rings and dots ·
// inkTalk(t, words) = 0..1 mouth signal from word timings. Depends only on core.js (rng, lerp, el, clamp01).
// Everything is a pure function of (seed, t): no Math.random, scrubbing back gives the same frame.
'use strict';

const INK = Object.assign({}, THEME_PARCHMENT);   // the video's palette (core.js, window.PALETTE)
const INK_FPS = 8;            // boil rate: lines re-draw 8 times a second
const INK_FONT = "'Patrick Hand', 'Comic Sans MS', cursive";

// Patrick Hand for hand-written labels: register it if the page has no @font-face for it yet
(() => {
  try {
    let has = false;
    document.fonts.forEach(f => { if (/patrick/i.test(f.family)) has = true; });
    if (has) return;
    const cs = document.currentScript && document.currentScript.src;
    const base = cs ? new URL('../fonts/', cs).href : 'fonts/';
    for (const [file, range] of [['patrick-hand-latin.woff2', 'U+0000-00FF, U+0131, U+2000-206F'],
                                 ['patrick-hand-latin-ext.woff2', 'U+0100-02AF, U+1E00-1EFF']]) {
      const ff = new FontFace('Patrick Hand', `url(${base}${file}) format('woff2')`, { unicodeRange: range });
      document.fonts.add(ff);
      ff.load().catch(() => {});
    }
  } catch (e) { /* no font: cursive fallback */ }
})();

// integer hash of (a, b) -> rng seed
function inkHash(a, b) {
  let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) % 2147483646 + 1;
}
const inkFrame = t => Math.floor(t * INK_FPS + 1e-6);

// [dx, dy] in [-amp, amp], constant for 1/8 s, then jumps (the "boil" of hand-drawn animation)
function boil(seed, t, amp = 2) {
  if (window.INK_STILL) return [0, 0];   // belgesel style: lines stand still (owner, 2026-10-29)
  const r = rng(inkHash(seed, inkFrame(t)));
  r();
  return [(r() * 2 - 1) * amp, (r() * 2 - 1) * amp];
}

// Catmull-Rom through pts (closed or open), adaptive sampling by segment length
function inkSpline(pts, closed, step = 9) {
  const n = pts.length;
  if (n < 2) return pts.slice();
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const out = [], segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    const k = Math.max(1, Math.min(14, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step)));
    for (let j = 0; j < k; j++) {
      const s = j / k, s2 = s * s, s3 = s2 * s;
      const f = c => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * s + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * s2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * s3);
      out.push([f(0), f(1)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
// straight segments, sampled (polygons with sharp corners)
function inkLinear(pts, closed, step = 14) {
  const n = pts.length, out = [], segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
// jitter control points with the boil (each point its own seed)
function inkJitter(pts, seed, t, amp) {
  if (!amp) return pts;
  return pts.map((p, i) => { const b = boil(seed * 31 + i, t, amp); return [p[0] + b[0], p[1] + b[1]]; });
}
const inkF1 = v => Math.round(v * 10) / 10;

// Filled-outline ink stroke. opts: {w: 6, seed: 1, t: 0, amp: 1.8, closed: false, smooth: true,
// vary: 0.18 (width wobble), taper: 0.3 (thinner ends of open strokes)} -> SVG path d (fill it with ink)
function inkPath(points, opts = {}) {
  const w = opts.w ?? 6, seed = opts.seed ?? 1, t = opts.t ?? 0, closed = !!opts.closed;
  const vary = opts.vary ?? 0.18, taper = opts.taper ?? 0.3;
  const jp = inkJitter(points, seed, t, opts.amp ?? 1.8);
  const s = opts.smooth === false ? inkLinear(jp, closed) : inkSpline(jp, closed);
  const n = s.length;
  if (n < 2) return '';
  // smooth width noise along the stroke (4 knots that re-roll with the boil)
  const r = rng(inkHash(seed + 7777, window.INK_STILL ? 0 : inkFrame(t)));
  const knots = [r(), r(), r(), r(), r()].map(v => 1 + vary * (v * 2 - 1));
  const width = i => {
    const u = i / (n - 1), x = u * 4, k = Math.min(3, Math.floor(x)), f = x - k;
    let m = lerp(knots[k], knots[k + 1], f * f * (3 - 2 * f));
    if (!closed) m *= lerp(1 - taper, 1, Math.min(1, Math.min(u, 1 - u) / 0.12));
    return w * m / 2;
  };
  const L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = s[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = s[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const ln = Math.hypot(tx, ty) || 1; tx /= ln; ty /= ln;
    const h = width(i);
    L.push([s[i][0] - ty * h, s[i][1] + tx * h]);
    R.push([s[i][0] + ty * h, s[i][1] - tx * h]);
  }
  const seq = a => a.map(p => inkF1(p[0]) + ' ' + inkF1(p[1])).join(' L');
  if (closed) {   // ring: outer loop + inner loop reversed (nonzero fill leaves the hole)
    return 'M' + seq(L) + ' Z M' + seq(R.slice().reverse()) + ' Z';
  }
  const he = width(n - 1), hs = width(0);
  return 'M' + seq(L) + ` A${inkF1(he)} ${inkF1(he)} 0 0 0 ` + inkF1(R[n - 1][0]) + ' ' + inkF1(R[n - 1][1]) +
         ' L' + seq(R.slice().reverse()) + ` A${inkF1(hs)} ${inkF1(hs)} 0 0 0 ` + inkF1(L[0][0]) + ' ' + inkF1(L[0][1]) + ' Z';
}
// jittered smooth closed shape (for fills under an inkPath ring)
function inkLoop(points, opts = {}) {
  const jp = inkJitter(points, opts.seed ?? 1, opts.t ?? 0, opts.amp ?? 1.8);
  const s = opts.smooth === false ? inkLinear(jp, true) : inkSpline(jp, true);
  return 'M' + s.map(p => inkF1(p[0]) + ' ' + inkF1(p[1])).join(' L') + ' Z';
}
// points of a slightly irregular ellipse (the irregularity is fixed per seed: the shape is "drawn" once)
function inkEllipsePts(cx, cy, rx, ry, seed = 1, n = 12, rot = 0, wob = 0.03) {
  const r = rng(inkHash(seed, 99991)), c = Math.cos(rot), s = Math.sin(rot), pts = [];
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, k = 1 + (r() * 2 - 1) * wob;
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  return pts;
}
// ink ring around a circle; opts.fill = true returns the filled disc path instead
function inkCircle(cx, cy, r, seed = 1, t = 0, opts = {}) {
  const pts = inkEllipsePts(cx, cy, r, opts.ry ?? r, seed, opts.n ?? Math.max(8, Math.min(18, Math.round(r / 6))), opts.rot || 0);
  const o = Object.assign({ seed, t, closed: true, w: 6 }, opts);
  return opts.fill ? inkLoop(pts, o) : inkPath(pts, o);
}
// small filled blob (eyes, hands, dots)
function inkDot(cx, cy, rx, ry, seed = 1, t = 0, amp = 0.8) {
  return inkLoop(inkEllipsePts(cx, cy, rx, ry ?? rx, seed, 8, 0, 0.06), { seed, t, amp });
}

// narration mouth signal 0..1 at time t from word timings [{t, end?, text}] sorted by t
// (each spoken word opens and closes the mouth once). Self-contained: no engine globals needed.
function inkTalk(t, Wd) {
  if (!Wd || !Wd.length) return 0;
  let lo = 0, hi = Wd.length - 1;
  if (t < Wd[0].t) return 0;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (Wd[m].t <= t) lo = m; else hi = m - 1; }
  const w = Wd[lo], nt = Wd[lo + 1] ? Wd[lo + 1].t : w.t + 0.4;
  const d = Math.max(0.08, Math.min(0.45, nt - w.t, w.end != null ? w.end - w.t + 0.05 : 9));
  return t < w.t + d ? Math.sin((t - w.t) / d * Math.PI) : 0;
}

// path element factory used by ink drawings: filled, no stroke
const inkEl = (parent, fill = INK.ink, extra = {}) => el(parent, 'path', Object.assign({ fill, stroke: 'none' }, extra));
