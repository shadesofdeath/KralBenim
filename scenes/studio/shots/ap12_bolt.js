// ap12_bolt: shots for the Stickstory Short "Apollo 12 lightning" (2026-11-14). On 14 November 1969 the Saturn V of
// Apollo 12 climbed into a rain cloud and was struck by lightning 36.5 s and 52 s after liftoff (the bolt ran down the
// exhaust plume to the pad). The fuel cells dropped off line, the caution-and-warning panel lit up, the crew lost the
// guidance platform and Mission Control's data turned to garbage. EECOM John Aaron remembered the pattern from a drill:
// "Try SCE to Aux." Alan Bean flipped the Signal Conditioning Equipment switch to AUX, the data came back, and on
// 19 November Conrad and Bean landed on the Moon. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only
// (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Parametric: any "rocket / mission control / cockpit emergency" story. Uses lh__lib.js (LH.kasif, LH.label, LH.person).
//
// Common: labels: [{text, x, y (0..1), at, size, color: ink|red|gold|blue|paper, font: "hand"|"serif", card, rot}],
//   kasif: {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false
//
// SHOTS.ap12_climb — the Saturn V climbing through low storm clouds in the rain; its flame and smoke column run down
//   to the launch pad and the red umbilical tower at the bottom left. P: {rocket: {x: 0.56, y: 0.48 (engine base),
//   s: 0.6, rot: 6}, pad: [0.22, 0.84], bolts: [{at: cue|sec, from: [x, y] (0..1, a point in the clouds),
//   hit: "top"|"mid"}], scroll: 70 (px/s the clouds and rain fall past: the climb), labels}
//   Each bolt jumps from the cloud to the rocket, the rocket's outline flares, the bolt runs on down the plume to the
//   pad; the clouds flash; the rocket shakes.
// SHOTS.ap12_clock — the press site in the rain: a big countdown clock board on the lawn counts up to `to` seconds
//   (reached at cue "n"; or marks: [{at, v}] several stops), strike: cue (a bolt hits the small rocket), a crowd of umbrellas and heads fills the bottom, the rocket climbs small into the clouds
//   top right on its smoke trail. P: {from: 30, to: 36, rocket: {x, y, s}, labels}
// SHOTS.ap12_cabin — inside the command module: the main display panel (attitude ball, gauges, switch rows, the
//   caution-and-warning light matrix, MASTER ALARM button, two small windows with rain), crew helmets in front.
//   P: {mode: "alarm"|"abort", labels, kasif}
//   alarm (cue "lit"): the lights come on in a cascade and flicker, the alarm flashes, the attitude ball tumbles,
//     the helmets jolt; abort: a big T-handle stands in front of the panel (cue "abort": it pulses red), Kaşif beside it.
// SHOTS.ap12_mc — Mission Control: a big wall screen, a console with two CRT screens, controllers in white shirts with
//   headsets. P: {mode: "room"|"aaron"|"call", garble: cue|sec (screens turn to garbage), aaron: {x, s}, other: {x, s} |
//   false, console: {x0, x1}, bubble: {x, y, w, h, at, text} (aaron: thought bubble with a small garbled screen and
//   `text` under it; call: speech balloon with `text`), labels}
// SHOTS.ap12_switch — extreme close-up of one toggle switch on a panel: "SCE" strip, NORM / AUX; a white-gloved hand
//   comes in and flips it down to AUX at cue "flip"; at cue "back" the status lamps go green. Drawn in screen
//   coordinates for the close-up given in P.view {focus: [x, y], zoom} (= the scene's camera), so it fills the frame.
//   P: {view, label, labels}
// SHOTS.ap12_moon — the lunar surface under a black sky with Earth: the lunar module lands (cue "land") in a spray of
//   dust, or stands landed with a flag and footprints. P: {mode: "land"|"end", lm: {x: 0.6, s: 1.2}, earth: {x, y, r},
//   kasif, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const fr = v => v - Math.floor(v);
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const SLAB = "'Zilla Slab', Georgia, serif", SERIF = 'Fraunces, Georgia, serif';
  const txt = (parent, a = {}) => el(parent, 'text', Object.assign({ 'text-anchor': 'middle' }, a));
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  // colours (tokens only)
  const HULL = () => INK.paperLight;
  const PANEL = () => mix(INK.paperDark, INK.inkSoft, 0.42);
  const PANEL_D = () => mix(INK.inkSoft, INK.ink, 0.35);
  const CONSOLE = () => mix(INK.blue, INK.paperDark, 0.5);
  const CRT = () => mix(INK.ink, INK.blue, 0.22);
  const CRT_TX = () => mix(INK.gold, INK.paperLight, 0.25);
  const TOWER = () => mix(INK.red, INK.ink, 0.25);
  const SMOKE = () => mix(INK.paperDark, INK.paperLight, 0.35);
  const SMOKE_D = () => mix(INK.paperDark, INK.inkSoft, 0.35);
  const FOIL = () => mix(INK.gold, INK.stain, 0.25);
  const REG = () => mix(INK.paperDark, INK.inkSoft, 0.22);

  // ------------------------------------------------------------------ a pen: ordered pool of filled paths
  function pen(parent, seed) {
    const g = el(parent, 'g'), pool = [];
    let i = 0, t = 0, k = 0;
    const get = () => { if (i >= pool.length) pool.push(el(g, 'path', { stroke: 'none' })); return pool[i++]; };
    const P = {
      g,
      begin(tt) { i = 0; t = tt; k = seed; },
      end() { for (let j = i; j < pool.length; j++) pool[j].setAttribute('d', ''); },
      raw(d, col, op = 1) { const e = get(); e.setAttribute('d', d); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op); },
      fill(pts, col, o = {}) { k += 3; P.raw(inkLoop(pts, { seed: k, t, smooth: !!o.smooth, amp: o.amp ?? 1 }), col, o.op ?? 1); },
      line(pts, w, col = INK.ink, o = {}) { k += 3; P.raw(inkPath(pts, { w, seed: k, t, closed: !!o.closed, smooth: o.smooth ?? true, amp: o.amp ?? 1, taper: o.taper }), col, o.op ?? 1); },
      shape(pts, col, o = {}) { P.fill(pts, col, o); if ((o.w ?? 5) > 0) P.line(pts, o.w ?? 5, o.line || INK.ink, { closed: true, smooth: !!o.smooth, amp: o.amp }); },
      circ(cx, cy, r, col, o = {}) { k += 3; if (col) P.raw(inkCircle(cx, cy, r, k, t, { fill: true, ry: o.ry }), col, o.op ?? 1); if ((o.w ?? 5) > 0) P.raw(inkCircle(cx, cy, r, k + 1, t, { w: o.w ?? 5, ry: o.ry }), o.line || INK.ink); },
      dot(cx, cy, rx, ry, col = INK.ink, op = 1) { k += 3; P.raw(inkDot(cx, cy, rx, ry, k, t), col, op); },
      get t() { return t; },
    };
    return P;
  }
  // a text pool (for screens, clocks)
  function texts(parent, n, attrs) {
    const T = Array.from({ length: n }, () => txt(parent, attrs));
    return {
      set(i, s, x, y, o = {}) {
        const e = T[i]; e.textContent = s; e.setAttribute('x', f1(x)); e.setAttribute('y', f1(y));
        if (o.size) e.setAttribute('font-size', o.size);
        if (o.fill) e.setAttribute('fill', o.fill);
        e.setAttribute('opacity', o.op ?? 1);
        if (o.anchor) e.setAttribute('text-anchor', o.anchor);
      },
      hide(from = 0) { for (let i = from; i < n; i++) T[i].textContent = ''; },
    };
  }

  // ------------------------------------------------------------------ Saturn V (side view), local: base y = 0, nose up
  // ~1170 units tall, 100 wide. o: {flame: 0..1, glow: 0..1 (struck: bright rim)}
  function saturn(pn, x, y, sc, rotDeg, o = {}) {
    const t = pn.t, a = rotDeg * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const T = p => [x + (p[0] * ca - p[1] * sa) * sc, y + (p[0] * sa + p[1] * ca) * sc];
    const TT = ps => ps.map(T);
    const w = v => Math.max(1.6, v * sc), B = 50;
    if (o.flame) {
      const L = 260 * o.flame * (1 + 0.08 * Math.sin(t * 31) + 0.05 * Math.sin(t * 47 + 1));
      const fl = (k, wd) => TT([[-B * wd, 36], [-B * 1.15 * wd, 36 + L * k * 0.3], [-B * 0.6 * wd, 36 + L * k * 0.75], [Math.sin(t * 23) * 6, 36 + L * k], [B * 0.6 * wd, 36 + L * k * 0.75], [B * 1.15 * wd, 36 + L * k * 0.3], [B * wd, 36]]);
      pn.fill(fl(1, 1.05), INK.gold, { smooth: true });
      pn.fill(fl(0.72, 0.8), mix(INK.red, INK.gold, 0.35), { smooth: true });
      pn.fill(fl(0.45, 0.55), INK.paperLight, { smooth: true });
    }
    if (o.glow) {
      const G = TT([[-B - 30, 40], [-B - 30, -720], [-50, -900], [-26, -1000], [0, -1160], [26, -1000], [50, -900], [B + 30, -720], [B + 30, 40]]);
      pn.fill(G, INK.gold, { op: 0.55 * o.glow, smooth: true });
      pn.line(G, w(10), INK.paperLight, { closed: true, op: o.glow });
    }
    // fins + engine bells
    [-1, 1].forEach(s => pn.shape(TT([[s * B, -12], [s * (B + 36), 34], [s * (B + 36), 12], [s * B, -96]]), HULL(), { w: w(4) }));
    [-30, -10, 10, 30].forEach(dx => pn.shape(TT([[dx - 9, 0], [dx + 9, 0], [dx + 14, 36], [dx - 14, 36]]), PANEL_D(), { w: w(3) }));
    // S-IC
    pn.shape(TT(rect(-B, -420, B, 0)), HULL(), { w: w(5) });
    pn.fill(TT(rect(-B, -250, -14, -24)), INK.ink);
    pn.fill(TT(rect(14, -420, B, -350)), INK.ink);
    pn.fill(TT(rect(-B, -420, -14, -390)), INK.ink);
    // S-II + taper + S-IVB + IU + SLA + CM + escape tower
    pn.shape(TT(rect(-B, -664, B, -420)), HULL(), { w: w(5) });
    pn.fill(TT(rect(-B, -444, B, -420)), PANEL_D());
    pn.shape(TT([[-B, -664], [B, -664], [33, -724], [-33, -724]]), HULL(), { w: w(4) });
    pn.shape(TT(rect(-33, -880, 33, -724)), HULL(), { w: w(4) });
    pn.fill(TT(rect(-33, -812, -6, -724)), INK.ink);
    pn.shape(TT(rect(-33, -894, 33, -880)), INK.paperDark, { w: w(3) });
    pn.shape(TT([[-33, -894], [33, -894], [21, -978], [-21, -978]]), HULL(), { w: w(4) });
    pn.shape(TT([[-21, -978], [21, -978], [5, -1022], [-5, -1022]]), mix(HULL(), INK.paperDark, 0.3), { w: w(4) });
    pn.line(TT([[-5, -1022], [-3, -1084]]), w(3)); pn.line(TT([[5, -1022], [3, -1084]]), w(3));
    pn.line(TT([[-5, -1030], [3, -1060], [-3, -1084]]), w(2));
    pn.shape(TT([[-5, -1084], [5, -1084], [5, -1130], [0, -1160], [-5, -1130]]), TOWER(), { w: w(3) });
    // seams
    [-140, -300, -560].forEach(yy => pn.line(TT([[-B, yy], [B, yy]]), w(2.4), INK.inkSoft));
    return { top: T([0, -1160]), mid: T([0, -560]), base: T([0, 40]), nose: T([0, -1020]), T };
  }

  // ------------------------------------------------------------------ smoke column along a path (base -> pad)
  function plume(pn, path, t, s, o = {}) {
    const N = o.n ?? 16, sp = inkSpline(path, false, 12);
    const at = u => sp[Math.min(sp.length - 1, Math.round(u * (sp.length - 1)))];
    for (let layer = 0; layer < 2; layer++) {
      for (let i = 0; i < N; i++) {
        const u = (i + 0.5) / N, p = at(u), r = (24 + u * 120) * s * (layer ? 0.75 : 1) * (1 + 0.08 * Math.sin(t * 2 + i));
        const off = (hn(i, layer + 3) - 0.5) * 40 * s * u;
        pn.circ(p[0] + off, p[1] + (layer ? -6 : 6) * s, r, layer ? SMOKE() : SMOKE_D(), { w: layer ? 0 : 3, line: INK.inkSoft });
      }
    }
  }

  // ------------------------------------------------------------------ lightning: fixed jagged shape per seed
  function boltPts(way, seed, step = 46, amp = 30) {
    const r = rng(inkHash(seed, 4242)), out = [way[0]], br = [];
    for (let j = 1; j < way.length; j++) {
      const a = way[j - 1], b = way[j], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step));
      const nx = -(b[1] - a[1]) / (L || 1), ny = (b[0] - a[0]) / (L || 1);
      for (let i = 1; i <= n; i++) {
        const q = i / n, off = i === n ? 0 : (r() - 0.5) * 2 * amp;
        const p = [lerp(a[0], b[0], q) + nx * off, lerp(a[1], b[1], q) + ny * off];
        out.push(p);
        if (r() < 0.16 && i < n) {   // a short fork
          const d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], side = r() < 0.5 ? -1 : 1, B = [p];
          for (let m = 1; m <= 3; m++) B.push([p[0] + (d[0] * 0.6 + nx * side * 0.8) * m * 40 + (r() - 0.5) * 20, p[1] + (d[1] * 0.6 + ny * side * 0.8) * m * 40 + (r() - 0.5) * 20]);
          br.push(B);
        }
      }
    }
    return { main: out, forks: br };
  }
  // strobe 0..1 after a strike at `a` (two quick flickers, then a fading afterglow that stays readable)
  const strobe = (lt, a) => {
    if (a == null || lt < a) return 0;
    const d = lt - a;
    if (d < 0.07) return 1; if (d < 0.12) return 0.15; if (d < 0.42) return 1; if (d < 0.48) return 0.3;
    return Math.max(0.55, 1 - (d - 0.48) * 0.4);
  };
  function drawBolt(pn, B, on, s = 1) {
    if (on <= 0) return;
    const wm = s * (0.55 + 0.45 * on);
    pn.line(B.main, 44 * wm, INK.paperLight, { smooth: false, op: 0.35 * on, amp: 1.5 });
    pn.line(B.main, 22 * wm, INK.gold, { smooth: false, amp: 1.5 });
    pn.line(B.main, 9 * wm, INK.paperLight, { smooth: false, amp: 1.2 });
    B.forks.forEach(F => { pn.line(F, 11 * wm, INK.gold, { smooth: false }); pn.line(F, 4 * wm, INK.paperLight, { smooth: false }); });
  }

  // ------------------------------------------------------------------ clouds + rain
  function cloud(pn, cx, cy, w, h, col, seed, light = 0) {
    const c = light ? mix(col, INK.paperLight, light) : col;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), x = cx - w / 2 + u * w, r = h * (0.38 + 0.25 * hn(seed, i) + 0.2 * Math.sin(u * Math.PI));
      pn.circ(x, cy - Math.sin(u * Math.PI) * h * 0.25, r, c, { w: 0 });
    }
    pn.fill(inkEllipsePts(cx, cy + h * 0.15, w * 0.6, h * 0.42, seed, 14), c);
    for (let i = 0; i < 3; i++) {
      const x = cx - w * 0.3 + i * w * 0.3, y = cy - h * 0.15 + hn(seed, i + 9) * h * 0.2;
      pn.line([[x - h * 0.3, y], [x - h * 0.1, y - h * 0.22], [x + h * 0.15, y - h * 0.12]], 3, mix(c, INK.ink, 0.35));
    }
  }
  function rain(pn, W, H, t, n = 70, col = null, y0 = 0, y1 = null) {
    const D = [], c = col || mix(INK.inkSoft, INK.paperLight, 0.2), Y1 = y1 ?? H;
    for (let i = 0; i < n; i++) {
      const sp = 900 + hn(i, 1) * 500, y = y0 + fr(hn(i, 2) + t * sp / (Y1 - y0 + 80)) * (Y1 - y0 + 80) - 40, x = fr(hn(i, 3) + t * 0.02) * (W + 80) - 40 + (y - y0) * 0.18;
      D.push(inkPath([[x, y], [x - 9, y + 46]], { w: 3, seed: 700 + i, t, amp: 0.4, taper: 0.5 }));
    }
    pn.raw(D.join(' '), c, 0.8);
  }

  // ------------------------------------------------------------------ helmet from behind (crew in the couches)
  function helmet(pn, x, y, r) {
    pn.shape([[x - r * 1.6, y + r * 3], [x - r * 1.5, y + r * 0.9], [x - r * 0.6, y + r * 0.55], [x + r * 0.6, y + r * 0.55], [x + r * 1.5, y + r * 0.9], [x + r * 1.6, y + r * 3]], mix(INK.paperLight, INK.paperDark, 0.25), { w: 5 });
    pn.circ(x, y + r * 0.62, r * 0.75, INK.blue, { ry: r * 0.2, w: 4 });
    pn.circ(x, y, r, INK.paperLight, { w: 6 });
    pn.fill([[x + r * 0.2, y - r * 0.95], [x + r * 0.85, y - r * 0.45], [x + r * 0.98, y + r * 0.2], [x + r * 0.7, y + r * 0.7], [x + r * 0.6, y + r * 0.1], [x + r * 0.35, y - r * 0.6]], INK.paperDark, { smooth: true });
    pn.line([[x - r * 0.98, y - r * 0.05], [x - r * 0.4, y - r * 0.2], [x + r * 0.4, y - r * 0.2], [x + r * 0.98, y - r * 0.05]], 4, INK.inkSoft);
    pn.line([[x - r * 0.55, y - r * 0.6], [x - r * 0.2, y - r * 0.82]], 9, INK.paperLight);
    pn.circ(x, y + r * 0.95, r * 0.55, mix(INK.inkSoft, INK.ink, 0.3), { ry: r * 0.14, w: 4 });
  }

  // ------------------------------------------------------------------ the CM main panel (cabin)
  function cabinPanel(pn, tx, W, H, lt, t, st) {
    // hull + panel
    pn.shape([[20, 330], [200, 250], [880, 250], [1060, 330], [1060, 1160], [20, 1160]], PANEL(), { w: 7 });
    pn.line([[20, 330], [200, 250], [880, 250], [1060, 330]], 4, INK.inkSoft);
    // windows with rain (and the flash)
    st.windows.forEach((c, i) => {
      const P = [[c[0] - 100, c[1] - 50], [c[0] + 100, c[1] - 50], [c[0] + 80, c[1] + 50], [c[0] - 80, c[1] + 50]];
      pn.shape(P, st.flash ? mix(INK.paperLight, INK.gold, 0.25 * st.flash) : mix(INK.inkSoft, INK.ink, 0.25), { w: 7 });
      for (let j = 0; j < 5; j++) { const q = fr(hn(j, i) + t * 1.4), x = c[0] - 70 + j * 32; pn.line([[x, c[1] - 40 + q * 60], [x - 6, c[1] - 10 + q * 60]], 3, INK.paperLight, { op: 0.8 }); }
    });
    // attitude ball (FDAI): tumbles when the platform is lost
    const F = st.fdai, ang = st.tumble * (Math.sin(t * 1.1) * 30 + lt * 55);
    const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = F[2];
    pn.circ(F[0], F[1], R + 26, PANEL_D(), { w: 6 });
    pn.circ(F[0], F[1], R, INK.paperLight, { w: 0 });
    const half = []; for (let i = 0; i <= 16; i++) { const q = Math.PI * i / 16; half.push([F[0] + Math.cos(q + a) * R, F[1] + Math.sin(q + a) * R]); }
    pn.fill(half, mix(INK.ink, INK.inkSoft, 0.3), { smooth: true });
    [-0.5, -0.25, 0.25, 0.5].forEach(v => { const c = [F[0] - sa * v * R, F[1] + ca * v * R], L = Math.sqrt(1 - v * v) * R * 0.9; pn.line([[c[0] - ca * L, c[1] - sa * L], [c[0] + ca * L, c[1] + sa * L]], 3, v > 0 ? INK.paperLight : INK.inkSoft); });
    pn.circ(F[0], F[1], R, null, { w: 7 });
    pn.line([[F[0] - R * 0.5, F[1]], [F[0] - R * 0.15, F[1]], [F[0], F[1] + R * 0.12], [F[0] + R * 0.15, F[1]], [F[0] + R * 0.5, F[1]]], 7, INK.gold, { smooth: false });
    // gauges
    (st.gauges || []).forEach((g, i) => {
      pn.circ(g[0], g[1], 52, INK.paperLight, { w: 5 });
      const na = (-130 + (st.wild ? 60 + Math.sin(t * (5 + i * 2.3) + i) * 70 : 40 + i * 30)) * Math.PI / 180;
      pn.line([[g[0], g[1]], [g[0] + Math.cos(na) * 42, g[1] + Math.sin(na) * 42]], 5, INK.red);
      pn.dot(g[0], g[1], 7, 7);
    });
    // switch rows
    (st.switches || []).forEach((row, j) => {
      for (let i = 0; i < row[3]; i++) {
        const x = lerp(row[0], row[1], i / Math.max(1, row[3] - 1)), y = row[2];
        pn.shape(rect(x - 18, y - 14, x + 18, y + 14), PANEL_D(), { w: 3 });
        const up = hn(i, j + 5) > 0.4 ? -1 : 1;
        pn.line([[x, y], [x + 4, y + up * 34]], 7, INK.paperLight); pn.dot(x + 4, y + up * 36, 8, 8, INK.paperLight);
      }
    });
    // caution & warning matrix
    if (st.cw) {
      const [x0, y0, cols, rows, cw, ch, gap] = st.cw;
      pn.shape(rect(x0 - 22, y0 - 22, x0 + cols * (cw + gap) - gap + 22, y0 + rows * (ch + gap) - gap + 22), PANEL_D(), { w: 5 });
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = r * cols + c, at = st.lit == null ? null : hn(i, 15) < 0.4 ? 0.1 + hn(i, 11) * 0.8 : st.lit + hn(i, 11) * 0.45;
        let on = at != null && lt >= at ? 1 : 0;
        if (on && hn(i, 12) > 0.6) on = fr(t * (2 + hn(i, 13) * 3)) < 0.55 ? 1 : 0.35;
        const x = x0 + c * (cw + gap), y = y0 + r * (ch + gap);
        const col = on ? (hn(i, 14) > 0.45 ? INK.red : INK.gold) : mix(INK.paperDark, INK.ink, 0.25);
        pn.shape(rect(x, y, x + cw, y + ch), on > 0.5 ? col : mix(col, PANEL_D(), 1 - on), { w: 3 });
        if (on > 0.5) pn.line([[x + 10, y + ch * 0.5], [x + cw - 10, y + ch * 0.5]], 4, INK.paperLight, { op: 0.8 });
      }
    }
    // master alarm
    if (st.alarm) {
      const [ax, ay] = st.alarm, blink = st.alarmOn && fr(t * 2.4) < 0.6;
      pn.shape(rect(ax - 140, ay - 70, ax + 140, ay + 70), blink ? INK.red : mix(INK.red, INK.ink, 0.55), { w: 7 });
      tx.set(0, 'MASTER', ax, ay - 8, { fill: blink ? INK.paperLight : mix(INK.paperLight, INK.ink, 0.4) });
      tx.set(1, 'ALARM', ax, ay + 48, { fill: blink ? INK.paperLight : mix(INK.paperLight, INK.ink, 0.4) });
      if (blink) [1, 2].forEach(k => { pn.line([[ax - 160 - k * 26, ay - 50], [ax - 176 - k * 26, ay], [ax - 160 - k * 26, ay + 50]], 6, INK.red); pn.line([[ax + 160 + k * 26, ay - 50], [ax + 176 + k * 26, ay], [ax + 160 + k * 26, ay + 50]], 6, INK.red); });
    } else tx.hide(0);
  }

  // ================================================================== ap12_climb
  SH.ap12_climb = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 1207;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 300), front = pen(el(root, 'g'), sd + 600);
      const lbs = labels(root, P.labels, W, H);
      const RK = Object.assign({ x: 0.56, y: 0.48, s: 0.6, rot: 6 }, P.rocket || {});
      const pad = P.pad || [0.22, 0.84];
      const scroll = P.scroll ?? 70;
      const CL = [[0.16, 0.13, 560, 220, 0.62], [0.82, 0.16, 620, 240, 0.55], [0.5, 0.06, 760, 230, 0.7], [0.08, 0.36, 420, 170, 0.45], [0.95, 0.42, 420, 160, 0.42], [0.3, 0.55, 520, 190, 0.35], [0.85, 0.66, 500, 170, 0.3]];
      const bolts = (P.bolts || []).map((b, i) => ({ b, i }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ats = bolts.map(({ b }) => atOr(cues, b.at, null));
          const sts = ats.map(a => strobe(lt, a));
          const flash = Math.max(0, ...sts.map((s, i) => (lt - ats[i] < 0.5 ? s : 0)));
          const shake = Math.max(0, ...ats.map(a => a != null && lt >= a && lt < a + 0.7 ? (1 - (lt - a) / 0.7) : 0));
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          back.begin(t); mid.begin(t); front.begin(t);
          // clouds fall past (the climb): far clouds slower
          CL.forEach((c, i) => {
            const sp = scroll * (0.5 + c[4]), y = fr(c[1] + lt * sp / (H * 1.3)) * H * 1.3 - H * 0.12;
            if (c[1] < 0.2) { cloud(back, c[0] * W, c[1] * H + lt * scroll * 0.25, c[2], c[3], mix(INK.inkSoft, INK.ink, c[4] * 0.6), sd + i, flash * 0.75); return; }
            cloud(back, c[0] * W, y, c[2], c[3], mix(INK.inkSoft, INK.paperDark, 0.6 - c[4]), sd + i, flash * 0.4);
          });
          rain(back, W, H, t, 60);
          if (ats.some(a => a != null && lt >= a && lt < a + 0.07)) back.fill(rect(-60, -60, W + 60, H + 60), INK.paperLight);
          // rocket + plume
          const rx = RK.x * W + Math.sin(lt * 40) * 6 * shake, ry = RK.y * H - lt * 6 + Math.cos(lt * 37) * 4 * shake;
          const glow = Math.max(0, ...sts.map((s, i) => lt - ats[i] < 0.9 ? s : 0));
          const base = [rx - Math.sin(RK.rot * Math.PI / 180) * 0, ry];
          const padP = [pad[0] * W, pad[1] * H];
          const path = [[base[0] - 20, base[1] + 220 * RK.s], [lerp(base[0], padP[0], 0.35), lerp(base[1], padP[1], 0.45)], [lerp(base[0], padP[0], 0.75), lerp(base[1], padP[1], 0.82)], padP];
          plume(mid, path, t, 1);
          const R = saturn(mid, rx, ry, RK.s * W / 1080, RK.rot, { flame: 1, glow });
          // bolts: cloud -> rocket, then down the plume to the pad
          bolts.forEach(({ b, i }) => {
            const on = sts[i]; if (!on) return;
            const tgt = b.hit === 'mid' ? R.mid : R.nose;
            const A = boltPts([[b.from[0] * W, b.from[1] * H], tgt], sd + 40 + i, 44, 34);
            const sp = inkSpline(path, false, 20), side = i % 2 ? 26 : -26;
            const way = [R.base]; for (let q = 1; q <= 5; q++) { const p = sp[Math.round(q / 5 * (sp.length - 1))]; way.push([p[0] + side * (1 + q * 0.4), p[1]]); }
            const Bd = boltPts(way, sd + 60 + i, 50, 30);
            drawBolt(mid, A, on, P.boltW ?? 1.6); drawBolt(mid, Bd, on, (P.boltW ?? 1.6) * 0.8);
          });
          // the pad: tower, platform, ground
          const tx0 = padP[0] - 150, gy = padP[1] + 30;
          front.shape([[-40, gy], [W * 0.62, gy], [W * 0.66, gy + 46], [-40, gy + 46]], PANEL_D(), { w: 5 });
          front.shape([[-40, gy + 46], [W * 0.66, gy + 46], [W * 0.8, gy + 90], [W + 40, gy + 110], [W + 40, H + 40], [-40, H + 40]], mix(INK.stain, INK.ink, 0.3), { w: 5 });
          for (let i = 0; i < 8; i++) { const y = gy + 70 + i * (H - gy) / 8; front.line([[-20, y], [W + 20, y + 20]], 2 + i * 0.4, mix(INK.stain, INK.ink, 0.55)); }
          const TT = [tx0 - 46, tx0 + 46], top = gy - 560;
          front.line([[TT[0], gy], [TT[0], top]], 10, TOWER()); front.line([[TT[1], gy], [TT[1], top]], 10, TOWER());
          for (let y = gy, k = 0; y > top + 10; y -= 70, k++) { front.line([[TT[0], y], [TT[1], y - 70]], 5, TOWER()); front.line([[TT[0], y - 70], [TT[1], y - 70]], 5, TOWER()); }
          front.line([[TT[0] - 10, top], [TT[1] + 10, top]], 9, TOWER());
          front.line([[tx0, top], [tx0, top - 90]], 6, INK.ink); front.dot(tx0, top - 96, 9, 9, INK.red);
          [0.3, 0.55].forEach((q, i) => front.line([[TT[1], top + (gy - top) * q], [TT[1] + 110, top + (gy - top) * q + 10]], 8, TOWER()));
          // dunes and palms far right on the ground strip
          [0.78, 0.88, 0.95].forEach((q, i) => { const x = q * W, y = gy + 96; front.line([[x, y], [x - 8, y - 120 - i * 10]], 7, INK.ink); [-1, -0.4, 0.3, 1].forEach((d, j) => front.line([[x - 8, y - 120 - i * 10], [x - 8 + d * 60, y - 100 - i * 10 + Math.sin(t * 2 + j) * 6]], 5, INK.ink)); });
          back.end(); mid.end(); front.end();
          lbs.forEach(l => l.update(lt, t, cues));
          root.setAttribute('transform', hit ? `translate(${W / 2} ${H / 2}) scale(${f1((1 + 0.04 * hit) * 1000) / 1000}) translate(${-W / 2} ${-H / 2})` : '');
        },
      };
    },
  };

  // ================================================================== ap12_clock
  SH.ap12_clock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 1301;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 300);
      const tx = texts(root, 2, { 'font-family': SLAB, 'font-weight': 700, 'font-size': 150, fill: INK.gold });
      const front = pen(el(root, 'g'), sd + 600);
      const lbs = labels(root, P.labels, W, H);
      const RK = Object.assign({ x: 0.74, y: 0.3, s: 0.2 }, P.rocket || {});
      const gy = (P.gy ?? 0.6) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); front.begin(t);
          // smoke trail from the horizon up to the climbing rocket, then the cloud deck it enters
          const rx = RK.x * W + lt * 6, ry = RK.y * H - lt * 22;
          const trail = [[W * 1.02, gy - 40], [W * 0.92, gy - 260], [rx + 20, ry + 260], [rx + 4, ry + 70]];
          plume(back, trail, t, 0.55, { n: 12 });
          const sa = P.strike ? atOr(cues, P.strike, null) : null, son = strobe(lt, sa);
          const R = saturn(back, rx, ry, RK.s, 8, { flame: 1, glow: lt - (sa ?? 0) < 0.9 ? son : 0 });
          if (son) { drawBolt(back, boltPts([[W * 0.42, H * 0.08], R.mid], sd + 77, 40, 30), son, 1.1); drawBolt(back, boltPts([R.base, [W * 0.97, gy - 60]], sd + 78, 44, 26), son, 0.8); }
          [[0.2, 0.1, 700, 220], [0.75, 0.08, 760, 230], [0.48, 0.17, 560, 160]].forEach((c, i) => cloud(back, c[0] * W + Math.sin(t * 0.3 + i) * 10, c[1] * H, c[2], c[3], mix(INK.inkSoft, INK.ink, 0.25 + i * 0.1), sd + i));
          rain(back, W, H, t, 50);
          // the countdown clock board on the lawn
          const MK = (P.marks || [{ at: 'n', v: P.to ?? 36 }]).map(m => ({ a: Math.max(0.3, atOr(cues, m.at, dur * 0.5) - (m.lead || 0)), v: m.v }));
          let ss = P.from ?? 30, pa = 0, pv = ss, n = MK[0].a;
          for (const m of MK) { if (lt >= m.a) { ss = m.v; n = m.a; pa = m.a; pv = m.v; continue; } ss = Math.round(lerp(pv, m.v, clamp01((lt - pa) / Math.max(0.3, m.a - pa)))); break; }
          const bx0 = 80, bx1 = 1000, by0 = gy - 300, by1 = gy - 110;
          [0.15, 0.85].forEach(q => mid.shape(rect(lerp(bx0, bx1, q) - 16, by1, lerp(bx0, bx1, q) + 16, gy + 8), PANEL_D(), { w: 4 }));
          mid.shape(rect(bx0, by0, bx1, by1), mix(INK.ink, INK.blue, 0.15), { w: 8 });
          mid.line([[bx0 + 14, by0 + 14], [bx1 - 14, by0 + 14]], 3, INK.inkSoft);
          const blink = lt >= n && fr((lt - n) * 2) < 0.5;
          tx.set(0, `+00:00:${String(ss).padStart(2, '0')}`, (bx0 + bx1) / 2, by1 - 42, { fill: blink ? INK.red : INK.gold, size: 150 });
          tx.hide(1);
          // crowd: rows of umbrellas and heads
          const cols = [INK.blue, INK.red, INK.inkSoft, mix(INK.gold, INK.stain, 0.3), INK.ink, mix(INK.green, INK.ink, 0.2)];
          [[gy + 160, 0.75, 9], [gy + 360, 1, 7], [gy + 600, 1.3, 5]].forEach(([y, s, n], r) => {
            for (let i = 0; i < n; i++) {
              const x = (i + 0.5 + (r % 2) * 0.4 + (hn(i, r) - 0.5) * 0.3) / n * W, bob = Math.sin(t * 2 + i * 1.7 + r) * 4 * s;
              if ((i + r) % 3 === 1) {   // a head looking up
                front.shape(rect(x - 70 * s, y + 40 * s, x + 70 * s, H + 60), cols[(i + r * 2) % 6], { w: 4 });
                front.circ(x, y + bob - 10 * s, 48 * s, mix(INK.paperDark, INK.stain, 0.2), { w: 5 });
                front.fill([[x - 46 * s, y + bob - 20 * s], [x - 30 * s, y + bob - 56 * s], [x + 30 * s, y + bob - 58 * s], [x + 46 * s, y + bob - 24 * s], [x, y + bob - 34 * s]], INK.ink);
                if (i % 2) front.line([[x + 50 * s, y + 60 * s], [x + 90 * s, y - 60 * s + bob], [x + 110 * s, y - 150 * s + bob]], 18 * s, cols[(i + r * 2) % 6]);
              } else {                   // an umbrella
                const c = cols[(i * 2 + r) % 6], R = 120 * s;
                const dome = []; for (let k = 0; k <= 12; k++) { const q = Math.PI + Math.PI * k / 12; dome.push([x + Math.cos(q) * R, y + bob + Math.sin(q) * R * 0.6]); }
                dome.push([x + R, y + bob + 6 * s]); for (let k = 5; k >= 1; k--) dome.push([x - R + k / 6 * 2 * R + R / 6, y + bob + (k % 2 ? 22 : 4) * s]);
                front.line([[x, y + bob], [x, H + 60]], 7 * s, INK.ink);
                front.shape(dome, c, { w: 5 });
                for (let k = 1; k < 4; k++) front.line([[x, y + bob - R * 0.6], [x - R + k * R / 2, y + bob + 6 * s]], 3, mix(c, INK.ink, 0.5));
                front.dot(x, y + bob - R * 0.62, 7 * s, 9 * s);
              }
            }
          });
          back.end(); mid.end(); front.end();
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ap12_cabin
  SH.ap12_cabin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 1409;
      const mode = P.mode || 'alarm';
      const pn = pen(el(root, 'g'), sd);
      const tx = texts(root, 2, { 'font-family': SLAB, 'font-weight': 700, 'font-size': 50, fill: INK.paperLight });
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, sd + 7) : null;
      const fg = pen(el(root, 'g'), sd + 500);
      const lbs = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const lit = mode === 'abort' ? -5 : atOr(cues, 'lit', 0.4);
          const jolt = mode === 'alarm' && lt < 0.6 ? (1 - lt / 0.6) : 0;
          pn.begin(t); fg.begin(t);
          const st = mode === 'abort'
            ? { windows: [[300, 330], [780, 330]], fdai: [180, 520, 90], gauges: [[790, 1010], [930, 1010]], switches: [[620, 1000, 1110, 5]], cw: [400, 420, 7, 2, 70, 46, 14], lit, alarm: null, alarmOn: true, tumble: 1, wild: true, flash: 0 }
            : { windows: [[300, 330], [780, 330]], fdai: [290, 620, 130], gauges: [[140, 900], [290, 900], [440, 900]], switches: [[110, 980, 1050, 13], [600, 980, 980, 6]], cw: [600, 610, 4, 4, 76, 50, 16], lit, alarm: [800, 470], alarmOn: lt >= 0.1, tumble: lt >= lit ? 1 : 0.2, wild: true, flash: lt < 0.25 ? 1 : 0 };
          cabinPanel(pn, tx, W, H, lt, t, st);
          if (mode === 'abort') {
            // the abort T-handle
            const ab = atOr(cues, 'abort', dur * 0.6), pulse = lt >= ab ? 0.5 + 0.5 * Math.sin((lt - ab) * 9) : 0;
            const hx = P.handle ? P.handle[0] * W : 400, hy = P.handle ? P.handle[1] * H : 864;
            const tilt = lt >= ab ? Math.sin((lt - ab) * 14) * 3 : 0;
            // housing (low, mostly under the caption band), shaft, red ABORT placard, T-grip
            pn.shape([[hx - 110, hy + 420], [hx + 110, hy + 420], [hx + 80, hy + 330], [hx - 80, hy + 330]], PANEL_D(), { w: 6, smooth: false });
            pn.shape(rect(hx - 16, hy + 20, hx + 16, hy + 340), mix(INK.paperLight, INK.paperDark, 0.45), { w: 5 });
            pn.line([[hx - 4, hy + 30], [hx - 4, hy + 330]], 4, INK.paperLight, { op: 0.8 });
            if (pulse) pn.fill(inkEllipsePts(hx, hy + 120, 210, 190, sd + 3, 12), INK.red, { op: 0.18 + 0.2 * pulse, smooth: true });
            pn.shape(rect(hx - 110, hy + 110, hx + 110, hy + 190), lt >= ab && pulse > 0.5 ? INK.red : mix(INK.red, INK.ink, 0.2), { w: 6, smooth: false });
            tx.set(0, 'ABORT', hx, hy + 168, { fill: INK.paperLight, size: 56 });
            tx.hide(1);
            const a = tilt * Math.PI / 180, G = [[-130, -22], [130, -22], [138, 24], [-138, 24]].map(q => [hx + q[0] * Math.cos(a) - q[1] * Math.sin(a), hy + 10 + q[0] * Math.sin(a) + q[1] * Math.cos(a)]);
            pn.shape(G, INK.ink, { w: 0, smooth: false });
            pn.shape(G.map((q, i) => [q[0] + (i < 2 ? 4 : -4) * 0, q[1]]), mix(INK.ink, INK.inkSoft, 0.3), { w: 5, smooth: false });
            for (let i = -3; i <= 3; i++) pn.line([[hx + i * 34, hy - 10], [hx + i * 34, hy + 30]], 3, INK.inkSoft);
            pn.circ(hx - 130, hy + 11, 24, INK.ink, { w: 4 }); pn.circ(hx + 130, hy + 11, 24, INK.ink, { w: 4 });
            // crew helmets in front
            [[170, 1640, 122], [540, 1600, 130], [910, 1640, 122]].forEach(([x, y, r], i) => helmet(fg, x, y + Math.sin(t * 1.5 + i) * 4, r));
          } else {
            const jx = Math.sin(lt * 50) * 14 * jolt;
            [[170, 1600, 122], [540, 1560, 130], [910, 1600, 122]].forEach(([x, y, r], i) => helmet(fg, x + jx * (i % 2 ? -1 : 1), y + Math.sin(t * 1.5 + i) * 4 + Math.abs(jx) * 0.5, r));
          }
          pn.end(); fg.end();
          if (kas) kas.update(lt, t, cues);
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ CRT text rows (clean digits or garbage)
  const GLYPH = '#%&@?*/<>=+$!';
  function crtRows(seed, rows, cols, garble, t, row0 = 0) {
    const out = [], fK = Math.floor(t * 8);
    for (let r = 0; r < rows; r++) {
      let s = '';
      for (let c = 0; c < cols; c++) {
        const clean = String(Math.floor(hn(seed + r * 13 + c, row0) * 10));
        const bad = garble > 0 && hn(seed + r * 7 + c * 3, fK) < garble;
        s += c === 3 ? ' ' : bad ? GLYPH[Math.floor(hn(c + r, fK + seed) * GLYPH.length)] : clean;
      }
      out.push(s);
    }
    return out;
  }
  function screen(pn, tx, ti, x0, y0, x1, y1, garble, t, seed, rows = 4) {
    pn.shape(rect(x0 - 16, y0 - 16, x1 + 16, y1 + 16), PANEL_D(), { w: 5 });
    pn.shape(rect(x0, y0, x1, y1), CRT(), { w: 4 });
    const lines = crtRows(seed, rows, 7, garble, t), lh = (y1 - y0) / (rows + 0.4);
    const fK = Math.floor(t * 8);
    lines.forEach((s, r) => {
      const jx = garble ? (hn(r + seed, fK) - 0.5) * 40 * garble : 0;
      tx.set(ti + r, s, (x0 + x1) / 2 + jx, y0 + lh * (r + 1), { fill: garble > 0.3 && r % 2 ? mix(CRT_TX(), INK.red, 0.5) : CRT_TX(), op: garble ? 0.6 + 0.4 * hn(r, fK) : 1 });
    });
    if (garble > 0) for (let i = 0; i < 6; i++) { const y = lerp(y0 + 10, y1 - 10, hn(i + seed, fK)), xa = lerp(x0, x1, hn(i, fK + 3) * 0.6); pn.line([[xa, y], [xa + (x1 - x0) * 0.4, y + 2]], 4, INK.paperLight, { op: 0.6 * garble, smooth: false }); }
    return ti + rows;
  }
  function headset(pn, hc, s, face, mouthOpen = 0) {
    const ear = [hc[0] - 12 * s * face, hc[1] + 4 * s];
    pn.line([[ear[0] - 4 * s * face, ear[1] - 16 * s], [hc[0] - 24 * s * face, hc[1] - 46 * s], [hc[0] + 4 * s * face, hc[1] - 53 * s]], 3.5, INK.ink);
    const arc = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * 0.5 + Math.PI * i / 8; arc.push([ear[0] + Math.cos(a) * 15 * s * face, ear[1] - Math.sin(a) * 17 * s]); }
    pn.line(arc, 6, INK.ink);
    pn.line([[ear[0] + 2 * s * face, ear[1] + 14 * s], [hc[0] + 6 * s * face, hc[1] + 34 * s], [hc[0] + 22 * s * face, hc[1] + 30 * s]], 2.6, INK.ink);
    pn.dot(hc[0] + 24 * s * face, hc[1] + 30 * s, 5 * s, 4 * s);
  }

  // ================================================================== ap12_mc
  SH.ap12_mc = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 1511;
      const mode = P.mode || 'room';
      const back = pen(el(root, 'g'), sd);
      const wallTx = texts(root, 1, { 'font-family': SLAB, 'font-weight': 700, 'font-size': 60, fill: CRT_TX() });
      const peopleG = el(root, 'g');
      const con = pen(el(root, 'g'), sd + 200);
      const tx = texts(root, 8, { 'font-family': SLAB, 'font-weight': 700, 'font-size': 52, fill: CRT_TX() });
      const fg = pen(el(root, 'g'), sd + 400);
      const bub = pen(el(root, 'g'), sd + 500);
      const btx = texts(root, 5, { 'font-family': SLAB, 'font-weight': 700, 'font-size': 34, fill: CRT_TX() });
      const say = texts(root, 1, { 'font-family': SERIF, 'font-weight': 900, 'font-size': 100, fill: INK.ink });
      const lbs = labels(root, P.labels, W, H);
      const LH = window.LH;
      const AA = Object.assign({ x: mode === 'room' ? 0.13 : 0.2, s: mode === 'room' ? 1.05 : 1.35 }, P.aaron || {});
      const OT = P.other === false ? null : Object.assign({ x: 0.88, s: 1.05 }, P.other || {});
      const aaron = LH.person(el(peopleG, 'g'), sd + 11, { kind: 'sweater', col: INK.paperLight, hair: 'dark', glasses: false });
      const other = OT ? LH.person(el(peopleG, 'g'), sd + 13, { kind: 'sweater', col: INK.paperLight, hair: 'white', glasses: true }) : null;
      const chairs = pen(el(peopleG, 'g'), sd + 600);
      peopleG.insertBefore(chairs.g, peopleG.firstChild);
      const heads = pen(el(peopleG, 'g'), sd + 700);
      const CN = Object.assign(mode === 'room' ? { x0: 270, x1: 810 } : { x0: 470, x1: 1060 }, P.console || {});
      const gy = (P.gy ?? 0.6) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ga = atOr(cues, P.garble ?? 'garble', mode === 'room' ? dur * 0.4 : -1);
          const garble = lt >= ga ? Math.min(1, 0.35 + (lt - ga) * 1.2) * 0.85 : 0;
          const hit = punch(lt, atOr(cues, 'hit', ga >= 0 ? ga : null), 0.6);
          back.begin(t); con.begin(t); fg.begin(t); bub.begin(t); chairs.begin(t); heads.begin(t);
          // wall screen with the trajectory plot
          back.shape(rect(70, 262, 1010, 520), CRT(), { w: 8 });
          for (let i = 1; i < 6; i++) back.line([[70 + i * 157, 270], [70 + i * 157, 512]], 2, INK.inkSoft, { op: 0.8 });
          for (let i = 1; i < 3; i++) back.line([[78, 262 + i * 86], [1002, 262 + i * 86]], 2, INK.inkSoft, { op: 0.8 });
          const tr = []; for (let i = 0; i <= 30; i++) { const x = 90 + i * 30; tr.push([x, 400 + Math.sin(i / 30 * 6.28 * 1.3 + 0.6) * 80]); }
          back.line(tr, 5, INK.gold);
          const dotx = 90 + fr(t * 0.08) * 900; back.dot(dotx, 400 + Math.sin((dotx - 90) / 900 * 6.28 * 1.3 + 0.6) * 80, 11, 11, INK.paperLight);
          if (garble > 0) for (let i = 0; i < 8; i++) { const y = lerp(280, 500, hn(i, Math.floor(t * 8))); back.line([[100 + hn(i, 3) * 400, y], [500 + hn(i, 4) * 480, y]], 4, INK.paperLight, { op: 0.5 * garble, smooth: false }); }
          wallTx.hide();
          // console
          const { x0, x1 } = CN, top = mode === 'room' ? 600 : 560;
          con.shape(rect(x0, top, x1, gy - 260), CONSOLE(), { w: 6 });
          const n = 2, gap = 30, sw = (x1 - x0 - 60 - gap * (n - 1)) / n;
          let ti = 0;
          for (let i = 0; i < n; i++) { const sx = x0 + 30 + i * (sw + gap); ti = screen(con, tx, ti, sx, top + 34, sx + sw, gy - 300, garble, t, sd + i * 17); }
          tx.hide(ti);
          con.shape([[x0 - 30, gy - 260], [x1 + 30, gy - 260], [x1 + 60, gy - 200], [x0 - 60, gy - 200]], mix(CONSOLE(), INK.paperLight, 0.3), { w: 5, smooth: false });
          for (let i = 0; i < 10; i++) { const bx = lerp(x0, x1, (i + 0.5) / 10), on = garble ? fr(t * 3 + i * 0.37) < 0.5 : i % 3 === 0; con.shape(rect(bx - 16, gy - 246, bx + 16, gy - 222), on ? (garble ? INK.red : INK.green) : PANEL_D(), { w: 2.5 }); }
          con.shape(rect(x0 - 50, gy - 200, x1 + 50, gy + 6), mix(CONSOLE(), INK.ink, 0.25), { w: 6 });
          con.line([[lerp(x0, x1, 0.5), gy - 190], [lerp(x0, x1, 0.5), gy]], 4, INK.ink);
          con.fill(rect(x0 + 40, gy - 160, x0 + 260, gy - 120), INK.ink);
          // people (seated in chairs, facing the console)
          const shock = garble > 0 ? Math.min(1, (lt - ga) * 3) : 0;
          const aS = AA.s, ax = AA.x * W, seat = gy - 150 * aS;
          chairs.shape(rect(ax - 70 * aS, seat, ax + 50 * aS, seat + 26 * aS), PANEL_D(), { w: 4 });
          chairs.shape(rect(ax - 80 * aS, seat - 190 * aS, ax - 50 * aS, seat + 10 * aS), PANEL_D(), { w: 4 });
          chairs.line([[ax - 10 * aS, seat + 26 * aS], [ax - 10 * aS, gy - 10]], 9 * aS, INK.ink);
          chairs.line([[ax - 80 * aS, gy - 4], [ax + 60 * aS, gy - 4]], 8 * aS, INK.ink);
          const call = mode === 'call', aa = mode === 'aaron';
          const lean = call ? 8 : aa ? 4 + Math.sin(t * 1.2) * 2 : -shock * 10;
          const hcGuess = [ax + (Math.sin(lean * Math.PI / 180) * 250 + 6) * aS, seat - 264 * aS];
          const pre = aaron.update(t, ax, gy, aS, { face: 1, lean, seat, brow: aa ? 0.6 : call ? 0.3 : shock, mouth: call ? 0.4 + 0.5 * Math.abs(Math.sin(t * 9)) : shock * 0.8,
            armR: call ? [hcGuess[0] + 70 * aS, hcGuess[1] + 120 * aS] : [x0 - 30, gy - 250], armL: [x0 - 60, gy - 230], look: [4, aa ? 0 : -2] });
          headset(heads, pre.hc, aS, 1);
          if (other) {
            const oS = OT.s, ox = OT.x * W, oseat = gy - 150 * oS;
            chairs.shape(rect(ox - 50 * oS, oseat, ox + 70 * oS, oseat + 26 * oS), PANEL_D(), { w: 4 });
            chairs.shape(rect(ox + 50 * oS, oseat - 190 * oS, ox + 80 * oS, oseat + 10 * oS), PANEL_D(), { w: 4 });
            chairs.line([[ox + 10 * oS, oseat + 26 * oS], [ox + 10 * oS, gy - 10]], 9 * oS, INK.ink);
            const up = shock > 0.2;
            const r = other.update(t, ox, gy, oS, { face: -1, seat: oseat, lean: -shock * 6, brow: shock, mouth: shock * 0.9,
              armR: up ? [ox - 120 * oS, oseat - 380 * oS + Math.sin(t * 6) * 10] : [x1 + 30, gy - 250], armL: up ? [ox + 60 * oS, oseat - 400 * oS] : [x1 + 60, gy - 230] });
            headset(heads, r.hc, oS, -1);
          }
          // foreground: the next console row
          fg.shape([[-40, 1330], [W + 40, 1320], [W + 40, 1380], [-40, 1390]], mix(CONSOLE(), INK.paperLight, 0.3), { w: 6, smooth: false });
          fg.shape([[-40, 1390], [W + 40, 1380], [W + 40, H + 40], [-40, H + 40]], mix(CONSOLE(), INK.ink, 0.35), { w: 6, smooth: false });
          for (let i = 0; i < 12; i++) { const bx = 50 + i * 90, on = garble ? fr(t * 2.5 + i * 0.29) < 0.5 : i % 4 === 1; fg.shape(rect(bx - 24, 1340, bx + 24, 1366), on ? (garble ? INK.red : INK.gold) : PANEL_D(), { w: 2.5 }); }
          // console front: door panels with vents
          for (let i = 0; i < 4; i++) { const x0 = -10 + i * 275; fg.shape(rect(x0 + 18, 1410, x0 + 255, H + 20), mix(CONSOLE(), INK.ink, 0.25), { w: 4, smooth: false }); for (let j = 0; j < 4; j++) fg.line([[x0 + 60, 1450 + j * 24], [x0 + 210, 1450 + j * 24]], 4, mix(CONSOLE(), INK.ink, 0.6)); }
          // papers + a binder on the console top
          fg.shape([[60, 1336], [300, 1326], [312, 1376], [70, 1388]], INK.paperLight, { w: 4, smooth: false });
          fg.shape([[110, 1320], [330, 1300], [346, 1352], [120, 1368]], mix(INK.paperLight, INK.paperDark, 0.2), { w: 4, smooth: false });
          for (let i = 0; i < 3; i++) fg.line([[140, 1322 + i * 12], [300, 1308 + i * 12]], 2.5, INK.inkSoft);
          fg.shape(rect(420, 1296, 600, 1336), INK.red, { w: 4, smooth: false });
          // the backs of two controllers in the front row (heads, white shirts, headset bands)
          [[200, 1720, 1], [900, 1750, -1]].forEach(([x, y, f], i) => {
            const sway = Math.sin(t * 1.3 + i * 2) * 4 + (garble ? Math.sin(t * 7 + i) * 3 : 0);
            fg.shape([[x - 230, H + 40], [x - 200, y + 120], [x - 60, y + 80], [x + 60, y + 80], [x + 200, y + 120], [x + 230, H + 40]], INK.paperLight, { w: 6 });
            fg.line([[x - 30, y + 84], [x, y + 160], [x + 30, y + 84]], 4, INK.inkSoft);
            fg.circ(x + sway, y, 100, mix(INK.paperDark, INK.stain, 0.2), { w: 6 });
            fg.fill([[x - 99 + sway, y + 30], [x - 96 + sway, y - 40], [x - 50 + sway, y - 94], [x + 50 + sway, y - 94], [x + 96 + sway, y - 40], [x + 99 + sway, y + 30], [x + 60 + sway, y + 74], [x - 60 + sway, y + 74]], i ? INK.inkSoft : INK.ink, { smooth: true });
            fg.line([[x - 104 + sway, y + 10], [x - 70 + sway, y - 80], [x + 70 + sway, y - 80], [x + 104 + sway, y + 10]], 6, INK.ink);
            fg.circ(x - 104 + sway, y + 20, 22, INK.ink, { w: 0 }); fg.circ(x + 104 + sway, y + 20, 22, INK.ink, { w: 0 });
          });
          fg.shape([[760, 1330], [860, 1330], [852, 1210], [768, 1210]], INK.paperLight, { w: 5 });   // a coffee mug
          fg.line([[858, 1240], [900, 1260], [856, 1300]], 6, INK.ink);
          for (let i = 0; i < 2; i++) { const q = fr(t * 0.6 + i / 2); fg.line([[790 + i * 30, 1200 - q * 70], [800 + i * 30 + Math.sin(t * 2 + i) * 10, 1160 - q * 70]], 3, INK.inkSoft); }
          // bubbles
          const B = P.bubble;
          if (B && (mode === 'aaron' || call)) {
            const ba = atOr(cues, B.at, 0.3), p = spring(lt, ba, 0.5);
            if (lt >= ba) {
              const cx = (B.x ?? 0.66) * W, cy = (B.y ?? 0.24) * H, bw = (B.w ?? 520) * p, bh = (B.h ?? 300) * p;
              if (mode === 'aaron') {
                const lumps = []; for (let i = 0; i < 20; i++) { const q = i / 20 * Math.PI * 2, r = 1 + 0.08 * Math.sin(i * 2.7 + 1); lumps.push([cx + Math.cos(q) * bw / 2 * r, cy + Math.sin(q) * bh / 2 * r]); }
                bub.shape(lumps, INK.paperLight, { w: 6, smooth: true });
                [[0.25, 0.55, 30], [0.12, 0.72, 20]].forEach(([q, h, r]) => bub.circ(lerp(pre.hc[0] + 60, cx - bw * 0.3, q * 2), lerp(pre.hc[1] - 60, cy + bh / 2, h), r * p, INK.paperLight, { w: 5 }));
                const sx0 = cx - bw * 0.3, sx1 = cx + bw * 0.3, sy0 = cy - bh * 0.32, sy1 = cy + bh * 0.08;
                bub.shape(rect(sx0, sy0, sx1, sy1), CRT(), { w: 4 });
                const L = crtRows(sd + 90, 2, 7, 0.85, t);
                L.forEach((s, r) => btx.set(r, s, cx, sy0 + (sy1 - sy0) * (r + 1) / 2.6, { size: Math.round(40 * p) || 1, fill: r ? mix(CRT_TX(), INK.red, 0.5) : CRT_TX() }));
                btx.set(2, B.text || '', cx, cy + bh * 0.34, { size: Math.round(64 * p) || 1, fill: INK.ink });
                btx.hide(3);
                say.set(0, '', 0, 0);
              } else {
                const R = [[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2], [cx + bw / 2, cy + bh / 2], [cx - bw * 0.1, cy + bh / 2], [pre.hc[0] + 80 * aS, pre.hc[1] + 10], [cx - bw * 0.3, cy + bh / 2], [cx - bw / 2, cy + bh / 2]];
                bub.shape(R, INK.paperLight, { w: 7, smooth: false });
                say.set(0, B.text || '', cx, cy + 36 * p, { size: Math.round((B.size ?? 100) * p) || 1, fill: INK.ink });
                btx.hide();
              }
            } else { btx.hide(); say.set(0, '', 0, 0); }
          } else { btx.hide(); say.set(0, '', 0, 0); }
          back.end(); con.end(); fg.end(); bub.end(); chairs.end(); heads.end();
          lbs.forEach(l => l.update(lt, t, cues));
          root.setAttribute('transform', hit ? `translate(${W / 2} ${H / 2}) scale(${f1((1 + 0.03 * hit) * 1000) / 1000}) translate(${-W / 2} ${-H / 2})` : '');
        },
      };
    },
  };

  // ================================================================== ap12_switch
  SH.ap12_switch = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const V = P.view || { focus: [W / 2, H / 2], zoom: 1 };
      const z = V.zoom || 1, A = [W / 2, (300 + 1150) / 2];
      // draw in screen coordinates: undo the close-up the camera will apply (focus -> picture-area centre)
      const root = el(ctx.svg, 'g', { transform: `translate(${f1(V.focus[0])} ${f1(V.focus[1])}) scale(${f1(1000 / z) / 1000}) translate(${f1(-A[0])} ${f1(-A[1])})` });
      const sd = seed * 1000 + 1613;
      const pn = pen(el(root, 'g'), sd);
      const tx = texts(root, 3, { 'font-family': SLAB, 'font-weight': 700, 'font-size': 70, fill: INK.ink });
      const hand = pen(el(root, 'g'), sd + 400);
      const lbs = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const fl = atOr(cues, 'flip', dur * 0.4), bk = atOr(cues, 'back', dur * 0.75);
          const q = lt < fl ? 0 : spring(lt, fl, 0.35);
          pn.begin(t); hand.begin(t);
          // panel plate (fills the frame)
          pn.shape(rect(-60, -120, W + 60, 1200), PANEL(), { w: 0 });
          pn.shape(rect(-60, 1200, W + 60, H + 80), PANEL_D(), { w: 6 });
          pn.shape(rect(150, 300, 930, 1110), mix(PANEL(), INK.paperLight, 0.18), { w: 8 });
          [[190, 340], [890, 340], [190, 1070], [890, 1070]].forEach(c => { pn.circ(c[0], c[1], 18, INK.paperDark, { w: 4 }); pn.line([[c[0] - 10, c[1] - 6], [c[0] + 10, c[1] + 6]], 4); });
          // label strip
          pn.shape(rect(330, 340, 750, 450), INK.ink, { w: 0 });
          tx.set(0, P.label || 'SCE', 540, 425, { size: 92, fill: INK.paperLight });
          // positions
          const cx = 470, cy = 700, L = 230;
          tx.set(1, 'NORM', 720, 560, { size: 74, fill: q > 0.5 ? INK.inkSoft : INK.ink });
          tx.set(2, 'AUX', 720, 880, { size: q > 0.5 ? 96 : 80, fill: q > 0.5 ? INK.red : INK.ink });
          if (q > 0.5) pn.line([[630, 900], [810, 896]], 7, INK.red);
          pn.line([[600, 540], [640, 540]], 6); pn.line([[600, 860], [640, 860]], 6);
          // the toggle: nut + lever (up = NORM, down = AUX)
          pn.circ(cx, cy, 92, PANEL_D(), { w: 6 });
          const hex = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; hex.push([cx + Math.cos(a) * 64, cy + Math.sin(a) * 64]); }
          pn.shape(hex, mix(INK.paperLight, INK.paperDark, 0.4), { w: 5 });
          const ang = lerp(-90, 90, q) * Math.PI / 180, tip = [cx + Math.cos(ang) * L, cy + Math.sin(ang) * L];
          const nx = -Math.sin(ang), ny = Math.cos(ang);
          pn.shape([[cx + nx * 26, cy + ny * 26], [tip[0] + nx * 14, tip[1] + ny * 14], [tip[0] - nx * 14, tip[1] - ny * 14], [cx - nx * 26, cy - ny * 26]], INK.paperLight, { w: 6 });
          pn.line([[cx + nx * 8, cy + ny * 8], [tip[0] + nx * 6, tip[1] + ny * 6]], 5, INK.paperDark);
          pn.circ(tip[0], tip[1], 30, INK.paperLight, { w: 6 });
          pn.dot(tip[0] - 9, tip[1] - 9, 8, 8, INK.paperDark);
          if (q > 0 && q < 1.2 && lt < fl + 0.5) [0, 1, 2].forEach(i => pn.line([[cx + 130 + i * 30, cy - 120 + i * 90], [cx + 180 + i * 30, cy - 130 + i * 90]], 6, INK.ink));
          // status lamps: red flicker, then green from the cue on
          for (let i = 0; i < 5; i++) {
            const x = 190 + i * 78, y = 1075, g = lt >= bk + i * 0.1;
            const on = g ? 1 : fr(t * 3 + i * 0.3) < 0.5;
            pn.circ(x, y, 28, g ? INK.green : (on ? INK.red : mix(INK.red, INK.ink, 0.5)), { w: 5 });
            if (g) pn.circ(x, y, 38 + Math.sin(t * 4 + i) * 3, null, { w: 3, line: INK.green });
          }
          // the gloved hand: reaches in, pushes the lever down, stays
          const reach = prog(lt, 0, Math.max(0.4, fl - 0.05));
          const ft = [tip[0] + 34, tip[1] - (q > 0 ? 34 : 10)];
          const hx = lerp(W + 300, ft[0], reach), hy = lerp(H + 200, ft[1], reach);
          const wr = [hx + 230, hy + 150];
          hand.line([wr, [wr[0] + 400, wr[1] + 500]], 220, mix(INK.paperLight, INK.paperDark, 0.3), { taper: 0 });
          hand.line([wr, [wr[0] + 400, wr[1] + 500]], 6, INK.ink, { op: 0 });
          hand.shape(inkEllipsePts(wr[0], wr[1], 112, 100, sd + 5, 12, 0.7), mix(INK.paperLight, INK.paperDark, 0.15), { w: 6, smooth: true });
          hand.shape(inkEllipsePts(hx + 120, hy + 60, 120, 82, sd + 6, 12, 0.5), INK.paperLight, { w: 6, smooth: true });
          hand.line([[hx + 70, hy + 30], [hx + 20, hy + 8], [hx, hy]], 46, INK.paperLight);
          hand.line([[hx + 70, hy + 30], [hx + 20, hy + 8], [hx, hy]], 5, INK.ink, { op: 0.9 });
          hand.circ(hx, hy, 24, INK.paperLight, { w: 5 });
          hand.line([[hx + 60, hy + 120], [hx + 10, hy + 140]], 40, INK.paperLight);
          hand.line([[wr[0] - 60, wr[1] - 70], [wr[0] + 40, wr[1] + 60]], 4, INK.inkSoft);
          pn.end(); hand.end();
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the lunar module (side view), footpads at y = 0
  function lunarModule(pn, x, y, s, o = {}) {
    const T = p => [x + p[0] * s, y + p[1] * s], TT = ps => ps.map(T), t = pn.t;
    if (o.burn) {
      const L = Math.min(220 * o.burn * (1 + 0.1 * Math.sin(t * 29)), o.floor ?? 1e9);
      pn.fill(TT([[-26, -40], [26, -40], [60, -40 + L], [0, -40 + L * 1.15], [-60, -40 + L]]), INK.paperLight, { op: 0.75, smooth: true });
      pn.fill(TT([[-16, -40], [16, -40], [26, -40 + L * 0.6], [-26, -40 + L * 0.6]]), INK.gold, { op: 0.8, smooth: true });
    }
    [-1, 1].forEach(sd => {
      pn.line(TT([[sd * 100, -150], [sd * 190, -10]]), 8 * s); pn.line(TT([[sd * 110, -78], [sd * 190, -10]]), 6 * s);
      pn.circ(...T([sd * 196, -4]), 30 * s, INK.paperDark, { ry: 10 * s, w: 4 });
    });
    pn.line(TT([[0, -70], [0, -10]]), 8 * s); pn.circ(...T([0, -4]), 30 * s, INK.paperDark, { ry: 10 * s, w: 4 });
    for (let i = 0; i < 4; i++) pn.line(TT([[-12, -64 + i * 14], [12, -64 + i * 14]]), 3 * s);
    pn.shape(TT([[-26, -70], [26, -70], [34, -36], [-34, -36]]), PANEL_D(), { w: 4 });
    pn.shape(TT([[-120, -160], [120, -160], [128, -70], [-128, -70]]), FOIL(), { w: 6 });
    for (let i = 0; i < 5; i++) pn.line(TT([[-110 + i * 50, -150], [-96 + i * 50 + 10, -80]]), 3, mix(FOIL(), INK.ink, 0.4));
    pn.shape(TT([[-100, -160], [100, -160], [108, -214], [76, -296], [-50, -306], [-104, -226]]), mix(INK.paperLight, INK.paperDark, 0.35), { w: 6 });
    pn.shape(TT([[-60, -250], [-20, -250], [-30, -214], [-70, -214]]), INK.ink, { w: 0 });
    pn.shape(TT([[-14, -170], [26, -170], [26, -216], [-14, -216]]), mix(INK.paperDark, INK.ink, 0.25), { w: 4 });
    pn.line(TT([[60, -290], [110, -350]]), 5 * s); pn.circ(...T([118, -362]), 30 * s, INK.paperLight, { w: 4 });
    [[-108, -230], [100, -220]].forEach(p => pn.shape(TT(rect(p[0] - 12, p[1] - 12, p[0] + 12, p[1] + 12)), PANEL_D(), { w: 3 }));
    return { top: T([0, -310]), T };
  }

  // ================================================================== ap12_moon
  SH.ap12_moon = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 1717;
      const mode = P.mode || 'land';
      const sky = pen(el(root, 'g'), sd), ground = pen(el(root, 'g'), sd + 200), obj = pen(el(root, 'g'), sd + 400);
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, sd + 7) : null;
      const fg = pen(el(root, 'g'), sd + 600);
      const lbs = labels(root, P.labels, W, H);
      const gy = (P.gy ?? 0.6) * H;
      const LM = Object.assign({ x: 0.6, s: 1.2 }, P.lm || {}), E = Object.assign({ x: 0.78, y: 0.2, r: 90 }, P.earth || {});
      const CR = Array.from({ length: 14 }, (_, i) => [hn(i, 1), hn(i, 2), 0.5 + hn(i, 3)]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sky.begin(t); ground.begin(t); obj.begin(t); fg.begin(t);
          // Earth
          const ex = E.x * W, ey = E.y * H, er = E.r;
          sky.circ(ex, ey, er, INK.blue, { w: 5 });
          for (let i = 0; i < 4; i++) { const a = i * 1.7 + t * 0.15, cx = ex + Math.cos(a) * er * 0.45, cy = ey + Math.sin(a * 1.3) * er * 0.4; if (Math.hypot(cx - ex, cy - ey) < er * 0.7) sky.fill(inkEllipsePts(cx, cy, er * 0.28, er * 0.18, sd + i, 9, a), INK.green, { smooth: true }); }
          sky.line([[ex - er * 0.6, ey - er * 0.3], [ex - er * 0.1, ey - er * 0.45], [ex + er * 0.4, ey - er * 0.2]], 6, INK.paperLight, { op: 0.8 });
          const term = []; for (let i = 0; i <= 16; i++) { const q = -Math.PI / 2 + Math.PI * i / 16; term.push([ex + Math.cos(q) * er, ey + Math.sin(q) * er]); } for (let i = 16; i >= 0; i--) { const q = -Math.PI / 2 + Math.PI * i / 16; term.push([ex + Math.cos(q) * er * 0.35, ey + Math.sin(q) * er]); }
          sky.fill(term, INK.ink, { op: 0.55, smooth: true });
          // far crater rim + regolith
          const rim = []; for (let i = 0; i <= 24; i++) { const x = i / 24 * (W + 80) - 40; rim.push([x, gy - 70 - Math.sin(i * 0.7 + 1) * 26 - hn(i, 5) * 14]); }
          ground.fill(rim.concat([[W + 40, gy + 40], [-40, gy + 40]]), mix(REG(), INK.paperLight, 0.3));
          ground.line(rim, 4, INK.inkSoft);
          ground.shape([[-40, gy], [W * 0.3, gy - 8], [W * 0.7, gy + 4], [W + 40, gy - 6], [W + 40, H + 40], [-40, H + 40]], REG(), { w: 5 });
          CR.forEach((c, i) => {
            const y = gy + 40 + Math.pow(c[1], 1.2) * (H - gy), sc = 0.4 + (y - gy) / (H - gy) * 1.2, x = c[0] * W, r = 70 * c[2] * sc;
            if (y > H + r) return;
            ground.circ(x, y, r, mix(REG(), INK.ink, 0.25), { ry: r * 0.32, w: 3 });
            ground.line([[x - r * 0.9, y + r * 0.1], [x, y + r * 0.34], [x + r * 0.9, y + r * 0.1]], 4, INK.paperLight, { op: 0.7 });
          });
          for (let i = 0; i < 9; i++) { const y = gy + 30 + i * (H - gy) / 9; ground.line([[-20, y], [W + 20, y + 8]], 2, INK.inkSoft, { op: 0.5 }); }
          // the lunar module
          const lx = LM.x * W, ls = LM.s;
          if (mode === 'land') {
            const la = atOr(cues, 'land', dur * 0.6), q = progIO(lt, 0, Math.max(0.5, la));
            const ly = lerp(gy - 520, gy, q), alt = 1 - q;
            if (lt < la + 0.2) {
              const dust = Math.min(1, (1 - alt) * 2.2);
              for (let i = 0; i < 12; i++) { const s = i % 2 ? 1 : -1, ph = fr(t * 2.2 + hn(i, 7)), d = 80 + ph * 420; obj.line([[lx + s * 40, gy - 6], [lx + s * d, gy - 20 - ph * 60 - hn(i, 8) * 40]], 4 + 3 * dust, mix(REG(), INK.paperLight, 0.4), { op: dust * (1 - ph) }); }
            }
            const settle = lt > la ? Math.max(0, 1 - (lt - la) / 1.5) : 0;
            if (settle) [-1, 1].forEach(s => obj.fill(inkEllipsePts(lx + s * 180, gy - 30, 220 * (1.4 - settle * 0.4), 60, sd + 30 + s, 12), mix(REG(), INK.paperLight, 0.5), { op: 0.7 * settle, smooth: true }));
            lunarModule(obj, lx, ly + (lt > la && lt < la + 0.25 ? 6 : 0), ls, { burn: lt < la ? 1 : 0, floor: (gy - ly) / ls + 40 });
          } else {
            // footprints to the host, a flag
            for (let i = 0; i < 9; i++) { const x = lerp(lx - 150, (P.kasif ? P.kasif.x : 0.3) * W + 60, i / 8), y = gy + 50 + (i % 2) * 22 + Math.sin(i) * 6; obj.dot(x, y, 16, 7, mix(REG(), INK.ink, 0.4)); }
            const fx = lx + 300 * ls * 0.8;
            obj.line([[fx, gy + 10], [fx, gy - 420]], 7);
            const wv = Math.sin(t * 1.2) * 4;
            obj.line([[fx, gy - 420], [fx + 220, gy - 420]], 5);
            obj.shape([[fx, gy - 414], [fx + 216, gy - 414 + wv], [fx + 216, gy - 280 + wv], [fx, gy - 286]], INK.paperLight, { w: 5, smooth: false });
            obj.fill(rect(fx, gy - 414, fx + 90, gy - 350), INK.blue);
            for (let i = 0; i < 4; i++) obj.fill([[fx + (i < 2 ? 90 : 0), gy - 400 + i * 32], [fx + 216, gy - 400 + i * 32 + wv], [fx + 216, gy - 386 + i * 32 + wv], [fx + (i < 2 ? 90 : 0), gy - 386 + i * 32]], INK.red);
            lunarModule(obj, lx, gy, ls, {});
          }
          // a rock or two in front
          fg.shape([[40, H + 30], [60, 1720], [130, 1650], [230, 1630], [320, 1690], [350, H + 30]], mix(REG(), INK.ink, 0.3), { w: 5, smooth: true });
          fg.line([[120, 1700], [200, 1680], [260, 1720]], 4, INK.paperLight, { op: 0.6 });
          fg.shape([[800, H + 30], [830, 1770], [920, 1720], [1040, 1730], [1110, 1800], [1120, H + 30]], mix(REG(), INK.ink, 0.25), { w: 5, smooth: true });
          sky.end(); ground.end(); obj.end(); fg.end();
          if (kas) kas.update(lt, t, cues);
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
