// wc__lib: the watercolor (suluboya) kit, "theme": "watercolor" (docs/SULUBOYA.md). Every Düşün Bakalım and
// Stickstory video since 2026-11-23 is painted with it: translucent brush strokes with dry-brush "flying white" on
// warm paper, things paint themselves in stroke by stroke (structure before detail), hand-written notes with pen
// leader lines, nothing drawn as a flat vector outline.
//
// The stroke engine (mk/drawS/drawList/sprite/clump/edgeOf) and the plant shapes are adapted from the Watercolor
// Brush style of Lemo-Opuscar (styles/watercolor/demo/engine.js + plants.js), MIT License,
// Copyright (c) 2026 SecondFirst Pty Ltd, trading as LemoLab, https://github.com/lemomo-ai/lemo-opuscar
//
// API (everything deterministic: generators run inside WC.withSeed, never Math.random):
//   strokes   WC.mk(pts, w, col, o) · WC.drawS(c, s, p) · WC.drawList(c, S, p) · WC.sprite(S) · WC.clump(S, ...)
//             WC.edgeOf(s, side, w, col) · WC.qcurve(x0,y0,x1,y1,bend,n) · WC.qctrl(...) · WC.polar(x,y,a,len,bend,n)
//   washes    WC.wash(c, pts, fill, a, passes, jit) · WC.blob(c, x, y, rx, ry, col, a) · WC.band(c, x0, x1, y, h, col, a)
//   paper     WC.paper() baked paper canvas · WC.mist(c, W, H, p, o) paper washes the picture away (p 0..1)
//   notes     WC.hand(c, txt, x, y, p, o) · WC.leader(c, x0, y0, x1, y1, p, bend) · WC.note(c, lt, t0, ax, ay, lx, ly, txt, o)
//             WC.serif(c, txt, x, y, p, o) big serif title painted in left to right
//   live bits WC.flame(c, x, y, h, lt, i) · WC.smoke(c, x, y, h, lt, i, a) · WC.rain(c, W, H, lt, a) · WC.snow(...) · WC.birds(...)
//   objects   WC.G.<name>(sc, o) -> {S: strokes, sway?, live?(c, lt, item), top?, parts?}  local coords, origin = base centre,
//             y negative upward, sc 1 = natural size (tree ~330 px, person ~170 px, house ~220 px). WC.make(name, sc, o, seed)
//             builds one (cached sprite). Other files add generators: WC.G.tower = (sc, o) => ({S: [...]}).
//   frame     WC.canvas(ctx) -> 2D context of a full-stage canvas in the shot · WC.C colour tokens (palette)
//   scene     WC.scene(ctx) -> {update(lt, dur, cues)}: the composer behind SHOTS.wc_scene (params in its header)
'use strict';

const WC = (() => {
  const C = THEME_PARCHMENT;

  // ------------------------------------------------------------ random + easing
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  let RNG = mulberry(20260924);
  const rnd = (a = 0, b = 1) => a + (b - a) * RNG();
  const pick = a => a[Math.floor(RNG() * a.length)];
  function withSeed(seed, fn) { const keep = RNG; RNG = mulberry(seed); try { return fn(); } finally { RNG = keep; } }
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const mixN = (a, b, t) => a + (b - a) * t;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ss = t => { t = clamp(t); return t * t * (3 - 2 * t); };
  const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const eo = t => 1 - Math.pow(1 - clamp(t), 3);
  const ei = t => Math.pow(clamp(t), 2.2);
  const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
  const vnoise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return mixN(hash(i), hash(i + 1), u); };
  const fbm = x => vnoise(x) * .55 + vnoise(x * 2.1 + 17) * .3 + vnoise(x * 4.3 + 41) * .15;
  const fade2 = (t, a, b, fi = .5, fo = .5) => ss(seg(t, a, a + fi)) * (1 - ss(seg(t, b - fo, b)));

  // ------------------------------------------------------------ colour
  const _rgb = {};
  const rgbOf = h => _rgb[h] || (_rgb[h] = hex2rgb(h));
  // token name or hex; a non-string (e.g. flag: true) means the accent, nothing means ink
  const col = v => typeof v !== 'string' ? (v === true ? C.red : C.ink) : (v[0] !== '#' && C[v]) ? C[v] : (v || C.ink);
  const mixc = (a, b, t) => { const A = rgbOf(col(a)), B = rgbOf(col(b)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const rgbaC = (h, a) => { const c = rgbOf(col(h)); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`; };
  // a few close shades of one pigment (leaf clumps, crowds): ±k lighter/darker
  const shades = (h, k = .12, n = 4) => Array.from({ length: n }, (_, i) => mixc(h, i % 2 ? C.paperLight : C.ink, k * (0.4 + i / n)));

  // ------------------------------------------------------------ brush strokes
  function qcurve(x0, y0, x1, y1, bend = 0, n = 12) {
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    const cx = mx - dy / L * bend, cy = my + dx / L * bend, out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]); }
    return out;
  }
  function qctrl(x0, y0, cx, cy, x1, y1, n = 12) {
    const out = [];
    for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * x0 + 2 * u * t * cx + t * t * x1, u * u * y0 + 2 * u * t * cy + t * t * y1]); }
    return out;
  }
  const polar = (x, y, a, len, bend = 0, n = 8) => qcurve(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len, bend, n);
  // a polyline through points, resampled to n points (for strokes along hand-placed paths)
  function along(pts, n = 16) {
    const d = [0];
    for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = d[d.length - 1] || 1, out = [];
    for (let k = 0; k <= n; k++) {
      const s = L * k / n; let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const f = (s - d[i - 1]) / ((d[i] - d[i - 1]) || 1);
      out.push([mixN(pts[i - 1][0], pts[i][0], f), mixN(pts[i - 1][1], pts[i][1], f)]);
    }
    return out;
  }

  // one stroke: centreline + width profile + dry-brush bristles (flying white)
  // o: prof 'brush'|'leaf'|'even'|'tip'|'trunk', rough (±width noise), nb (bristles), a (opacity), rib (body opacity)
  function mk(pts, w, colour, o = {}) {
    const n = pts.length, ws = [], nx = [], ny = [];
    const seed = rnd(0, 1000), rough = o.rough ?? .22, prof = o.prof || 'brush';
    for (let i = 0; i < n; i++) {
      const s = i / (n - 1); let f;
      if (prof === 'leaf') f = Math.pow(Math.sin(Math.PI * (s * .94 + .03)), .7);
      else if (prof === 'even') f = Math.min(1, s / .06 + .35) * Math.min(1, (1 - s) / .08 + .4);
      else if (prof === 'tip') f = Math.pow(1 - s * .92, .85) * Math.min(1, s / .05 + .6);
      else if (prof === 'trunk') f = (1 - s * .62) * (1 + Math.max(0, .06 - s) * 9);
      else f = Math.min(1, s / .1 + .3) * Math.pow(1 - s * .85, .6);
      ws.push(Math.max(.5, w * f * (1 + rough * (vnoise(seed + i * .9) * 2 - 1))));
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      nx.push(-dy / L); ny.push(dx / L);
    }
    const nb = o.nb ?? (w >= 6 ? Math.min(9, Math.max(3, Math.round(w / 3.2))) : 0);
    let br = null;
    if (nb > 0) {
      br = [];
      for (let j = 0; j < nb; j++) {
        const dash = []; for (let k = 0; k < 6; k++) dash.push(k % 2 ? rnd(1, w * .5 + 3) : rnd(18, 90));
        br.push({ off: rnd(-.46, .46), bw: Math.max(.7, w / nb * rnd(.6, 1.3)), a: rnd(.3, .85), end: rnd(.72, 1), dash });
      }
    }
    return { pts, ws, nx, ny, col: col(colour), a: o.a ?? .92, rib: o.rib ?? (nb ? .62 : .92), br };
  }

  function drawS(c, s, p = 1, colour = null, am = 1) {
    if (p <= 0) return;
    const P = s.pts, n = P.length, m = (n - 1) * clamp(p), k = Math.floor(m), f = m - k, cc = colour || s.col;
    const cnt = f > .001 && k < n - 1 ? k + 2 : k + 1;
    const X = i => i <= k ? P[i][0] : mixN(P[k][0], P[k + 1][0], f), Y = i => i <= k ? P[i][1] : mixN(P[k][1], P[k + 1][1], f);
    c.beginPath();
    for (let i = 0; i < cnt; i++) { const j = Math.min(i, n - 1), hw = s.ws[j] / 2 * (p < 1 && i === cnt - 1 ? .5 : 1); const x = X(i) + s.nx[j] * hw, y = Y(i) + s.ny[j] * hw; i ? c.lineTo(x, y) : c.moveTo(x, y); }
    for (let i = cnt - 1; i >= 0; i--) { const j = Math.min(i, n - 1), hw = s.ws[j] / 2 * (p < 1 && i === cnt - 1 ? .5 : 1); c.lineTo(X(i) - s.nx[j] * hw, Y(i) - s.ny[j] * hw); }
    c.closePath(); c.fillStyle = rgbaC(cc, s.a * s.rib * am); c.fill();
    if (s.br) {
      c.lineCap = 'round'; c.lineJoin = 'round';
      for (const b of s.br) {
        const e = Math.min(m, (n - 1) * b.end), kk = Math.floor(e); if (kk < 1) continue;
        c.beginPath();
        for (let i = 0; i <= kk; i++) { const hw = s.ws[i] * b.off, x = P[i][0] + s.nx[i] * hw, y = P[i][1] + s.ny[i] * hw; i ? c.lineTo(x, y) : c.moveTo(x, y); }
        c.setLineDash(b.dash); c.lineWidth = b.bw; c.strokeStyle = rgbaC(cc, s.a * b.a * am); c.stroke();
      }
      c.setLineDash([]);
    }
  }

  // a list of strokes painted in, in order (structure first): p in [0, 1]. Fill polygons ({poly}) fade in.
  function drawList(c, L, p = 1, colour = null, am = 1) {
    const N = L.length; if (!N) return;
    if (p >= 1) { for (const s of L) drawItem(c, s, 1, colour, am); return; }
    const dur = Math.min(.5, Math.max(.12, 4 / N));
    for (let j = 0; j < N; j++) { const t0 = j / N * (1 - dur); drawItem(c, L[j], (p - t0) / dur, colour, am); }
  }
  function drawItem(c, s, p, colour, am) {
    if (s.poly) { if (p > 0) washFill(c, s, clamp(p) * am); return; }
    drawS(c, s, p, colour, am);
  }
  // a wash polygon that can live inside a stroke list: {poly, fill, a, passes, jit, seed}
  function washShape(pts, fill, a = .5, passes = 3, jit = 3) {
    const js = []; for (let p = 0; p < passes; p++) js.push(pts.map((q, i) => i % 2 === 0 ? [q[0] + rnd(-jit, jit), q[1] + rnd(-jit, jit)] : q));
    return { poly: js, fill: col(fill), a, pts };
  }
  function washFill(c, s, am = 1) {
    for (const ring of s.poly) {
      c.beginPath(); ring.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
      c.fillStyle = rgbaC(s.fill, s.a / s.poly.length * 1.6 * am); c.fill();
    }
  }

  function bbox(L, pad = 6) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of L) {
      if (s.poly) { for (const [x, y] of s.pts) { x0 = Math.min(x0, x - 8); y0 = Math.min(y0, y - 8); x1 = Math.max(x1, x + 8); y1 = Math.max(y1, y + 8); } continue; }
      for (let i = 0; i < s.pts.length; i++) { const [x, y] = s.pts[i], w = s.ws[i]; x0 = Math.min(x0, x - w); y0 = Math.min(y0, y - w); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + w); }
    }
    if (x0 > x1) return [0, 0, 1, 1];
    return [Math.floor(x0 - pad), Math.floor(y0 - pad), Math.ceil(x1 + pad), Math.ceil(y1 + pad)];
  }
  function sprite(L, colour = null) {
    const [x0, y0, x1, y1] = bbox(L), cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.min(4096, x1 - x0)); cv.height = Math.max(1, Math.min(4096, y1 - y0));
    const c = cv.getContext('2d'); c.translate(-x0, -y0);
    for (const s of L) drawItem(c, s, 1, colour, 1);
    return { cv, x0, y0, x1, y1 };
  }

  // leaf clump: a cluster of dabbed leaves
  function clump(S, cx, cy, r, n, cols, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = rnd(0, Math.PI * 2), rr = r * Math.sqrt(rnd());
      const x = cx + Math.cos(a) * rr * (o.sx ?? 1.25), y = cy + Math.sin(a) * rr * (o.sy ?? .8);
      const d = o.dir !== undefined ? o.dir + rnd(-(o.spread ?? .6), o.spread ?? .6) : rnd(0, Math.PI * 2);
      const len = rnd(o.l0 ?? 10, o.l1 ?? 22), w = rnd(o.w0 ?? 6, o.w1 ?? 12);
      S.push(mk(qcurve(x, y, x + Math.cos(d) * len, y + Math.sin(d) * len, rnd(-3, 3), 5), w, pick(cols), { prof: 'leaf', nb: w > 9 ? 3 : 0, a: rnd(o.a0 ?? .72, o.a1 ?? .95), rough: .3 }));
    }
  }
  // ink line along one side of a stroke (the light/shadow edge of a trunk, a wall, a hull)
  function edgeOf(s, side, w, colour, a = .85) {
    const pts = s.pts.map((p, i) => [p[0] + s.nx[i] * s.ws[i] * .47 * side, p[1] + s.ny[i] * s.ws[i] * .47 * side]);
    return mk(pts, w, colour, { prof: 'even', nb: 0, a, rough: .35 });
  }
  // an ink outline that follows a polygon as a few loose brush lines (not a vector outline: breaks, varies)
  function inkLine(pts, w = 2.4, colour = C.ink, o = {}) {
    const L = [], step = o.step ?? 3;
    for (let i = 0; i < pts.length - 1; i += step) {
      const part = pts.slice(i, Math.min(pts.length, i + step + 1)); if (part.length < 2) continue;
      L.push(mk(along(part, Math.max(4, part.length * 3)), w * rnd(.8, 1.2), colour, { prof: 'even', nb: o.nb ?? 0, a: o.a ?? .85, rough: .35 }));
    }
    return L;
  }

  // ------------------------------------------------------------ washes (direct painting on a context)
  function wash(c, pts, fill, a = .5, passes = 3, jit = 5) {
    for (let p = 0; p < passes; p++) {
      c.beginPath(); pts.forEach(([x, y], i) => { const yy = y + (i % 3 === 0 ? rnd(-jit, jit) : 0); i ? c.lineTo(x, yy) : c.moveTo(x, yy); });
      c.closePath(); c.globalAlpha = a / passes * 1.6; c.fillStyle = typeof fill === 'string' ? col(fill) : fill; c.fill();
    }
    c.globalAlpha = 1;
  }
  // a soft irregular round wash (a cloud, a pool of shadow, a sun)
  function blobPts(x, y, rx, ry, n = 28, j = .12) {
    const ph = rnd(0, 6.28), out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (vnoise(ph + i * .7) - .5) * 2 * j; out.push([x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]); }
    return out;
  }
  const blob = (c, x, y, rx, ry, fill, a = .5) => wash(c, blobPts(x, y, rx, ry, 36, .18), fill, a, 3, 2);
  // a wide pale streak with soft ends (no hard bristle lines): a gradient-filled lens shape
  function softBand(c, x0, x1, y, h, fill, a = .12) {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, rgbaC(fill, 0)); g.addColorStop(.25, rgbaC(fill, a)); g.addColorStop(.75, rgbaC(fill, a)); g.addColorStop(1, rgbaC(fill, 0));
    const pts = []; const n = 24, ph = rnd(0, 9);
    for (let i = 0; i <= n; i++) { const t = i / n; pts.push([mixN(x0, x1, t), y - h / 2 * Math.sin(Math.PI * t) * (.7 + vnoise(ph + i * .5) * .6)]); }
    for (let i = n; i >= 0; i--) { const t = i / n; pts.push([mixN(x0, x1, t), y + h / 2 * Math.sin(Math.PI * t) * (.5 + vnoise(ph + 7 + i * .5) * .5)]); }
    wash(c, pts, g, 1, 2, 3);
  }
  // a storm / rain cloud: overlapping soft blobs, darker and denser at the bottom
  function cloudMass(c, x, y, w, fill, a = .5) {
    for (let i = 0; i < 7; i++) {
      const bx = x + rnd(-w * .45, w * .45), by = y + rnd(-w * .06, w * .08), rx = rnd(w * .16, w * .3), ry = rx * rnd(.35, .55);
      const g = c.createRadialGradient(bx, by + ry * .3, ry * .2, bx, by, rx);
      g.addColorStop(0, rgbaC(fill, a * .55)); g.addColorStop(.7, rgbaC(fill, a * .35)); g.addColorStop(1, rgbaC(fill, 0));
      c.save(); c.translate(bx, by); c.scale(1, ry / rx); c.translate(-bx, -by);
      c.beginPath(); c.arc(bx, by, rx, 0, 7); c.fillStyle = g; c.fill(); c.restore();
    }
  }
  // a horizontal brush band (sky streak, water line, road)
  function band(c, x0, x1, y, h, fill, a = .3) {
    const s = mk(qcurve(x0, y, x1, y + rnd(-h * .2, h * .2), rnd(-h * .4, h * .4), 18), h, fill, { prof: 'leaf', nb: Math.round(clamp(h / 5, 3, 9)), a });
    drawS(c, s);
    return s;
  }

  // ------------------------------------------------------------ paper, mist
  const paper = () => (typeof WATERCOLOR !== 'undefined' && WATERCOLOR.paper) || null;
  // the picture washes back to paper from the bottom up (p 0..1); o.from 'bottom'|'top'|'left'
  function mist(c, W, H, p, o = {}) {
    const pp = paper(); if (!pp || p <= 0) return;
    const k = eio(p);
    for (const [lift, a] of [[H * .11, .55], [0, 1]]) {
      c.save(); c.beginPath();
      if (o.from === 'left') {
        const edge = -W * .15 + k * W * 1.35 - lift;
        c.moveTo(-10, -10);
        for (let y = -10; y <= H + 40; y += 40) c.lineTo(edge + (vnoise(y * .006 + lift) - .5) * W * .12, y);
        c.lineTo(-10, H + 10);
      } else {
        const top = H * 1.09 - k * H * 1.3 - lift;
        c.moveTo(-10, H + 20);
        for (let x = -10; x <= W + 40; x += 40) c.lineTo(x, top + (vnoise(x * .006 + lift) - .5) * H * .15);
        c.lineTo(W + 10, H + 20);
      }
      c.closePath(); c.clip(); c.globalAlpha = a; c.drawImage(pp, 0, 0); c.restore();
    }
  }

  // ------------------------------------------------------------ notes and type
  const HANDF = 'Caveat, "Patrick Hand", cursive', SERIF = '"Cormorant Garamond", Lora, Georgia, serif';
  // hand-written note, revealed left to right like writing, over a paper-coloured halo
  function hand(c, txt, x, y, p, o = {}) {
    if (p <= 0) return;
    c.save(); c.font = `${o.w || 600} ${o.size || 40}px ${HANDF}`; c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
    const w = c.measureText(txt).width, x0 = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    c.beginPath(); c.rect(x0 - 8, y - (o.size || 40) * 1.4, (w + 16) * eo(p), (o.size || 40) * 2.8); c.clip();
    c.shadowColor = rgbaC(C.paperLight, .95); c.shadowBlur = 12;
    c.fillStyle = rgbaC(o.col || C.ink, o.a ?? .92); c.fillText(txt, x, y); c.fillText(txt, x, y);
    c.restore();
    return w;
  }
  function leader(c, x0, y0, x1, y1, p, bend = 20, a = .8) {
    if (p <= 0) return;
    const pts = qcurve(x0, y0, x1, y1, bend, 16), m = Math.max(1, Math.round(16 * clamp(p)));
    c.beginPath(); for (let i = 0; i <= m; i++) i ? c.lineTo(pts[i][0], pts[i][1]) : c.moveTo(pts[i][0], pts[i][1]);
    c.strokeStyle = rgbaC(C.ink, a); c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke();
    if (p >= 1) { c.beginPath(); c.arc(x1, y1, 4, 0, 7); c.fillStyle = rgbaC(C.ink, a); c.fill(); }
  }
  // label at (lx, ly) with a leader line to the anchor (ax, ay), appearing from t0 (scene seconds)
  function note(c, lt, t0, ax, ay, lx, ly, txt, o = {}) {
    if (lt < t0) return;
    const size = o.size || 40;
    c.save(); c.font = `${o.w || 600} ${size}px ${HANDF}`;
    const w = c.measureText(txt).width; c.restore();
    const right = ax < lx;                          // the leader starts at the label's near side
    const sx = o.align === 'center' ? lx + w / 2 * (right ? -1 : 1) * 0 : (right ? lx - 10 : lx + w + 10);
    leader(c, o.align === 'center' ? lx : sx, ly + (o.align === 'center' ? size * .6 : 0), ax, ay, seg(lt, t0, t0 + .6), o.bend ?? 18);
    hand(c, txt, lx, ly, seg(lt, t0 + .3, t0 + 1.3), o);
  }
  // a big serif line revealed left to right (titles, chapter cards, numbers)
  function serif(c, txt, x, y, p, o = {}) {
    if (p <= 0) return 0;
    const size = o.size || 110;
    c.save(); c.font = `${o.italic ? 'italic ' : ''}${o.w || 600} ${size}px ${SERIF}`; c.textAlign = o.align || 'center'; c.textBaseline = 'alphabetic';
    if (o.spacing) c.letterSpacing = o.spacing + 'px';
    const w = c.measureText(txt).width, x0 = c.textAlign === 'center' ? x - w / 2 : c.textAlign === 'right' ? x - w : x;
    c.beginPath(); c.rect(x0 - 20, y - size * 1.2, (w + 40) * eio(p), size * 1.6); c.clip();
    c.shadowColor = rgbaC(C.paperLight, .9); c.shadowBlur = o.halo ?? 10;
    c.fillStyle = rgbaC(o.col || C.ink, o.a ?? 1); c.fillText(txt, x, y);
    c.restore();
    return w;
  }
  const font = (size, w = 600, fam = 'serif', italic = false) => `${italic ? 'italic ' : ''}${w} ${size}px ${fam === 'hand' ? HANDF : SERIF}`;

  // ------------------------------------------------------------ live elements (drawn every frame)
  function flame(c, X, Y, h, lt, i = 0) {
    if (h < 2) return;
    withSeed(300 + i, () => {
      for (const [cc, wf, hf, a] of [[C.fire, 1, 1, .78], [mixc(C.fire, C.gold, .5), .62, .78, .85], [C.gold, .3, .5, .9]]) {
        const pts = []; for (let k = 0; k <= 8; k++) { const s = k / 8, y = -h * hf * s; pts.push([X + Math.sin(s * 3 + lt * 9 + i) * h * .16 * s + Math.sin(lt * 17 + i * 3) * 2 * s, Y + y]); }
        drawS(c, mk(pts, h * .34 * wf, cc, { prof: 'tip', nb: 0, a }));
      }
    });
  }
  // a column of smoke: soft blobs rising and drifting, deterministic in lt
  function smoke(c, X, Y, h, lt, i = 0, a = .35, drift = 1) {
    for (let k = 0; k < 9; k++) {
      const ph = ((lt * .18 + k / 9 + hash(i * 7 + k) * .1) % 1), y = Y - ph * h, x = X + Math.sin(ph * 3 + i) * h * .08 + ph * ph * h * .35 * drift;
      const r = h * (.08 + ph * .22), al = a * Math.sin(Math.PI * ph);
      if (al <= .01) continue;
      for (const [dx, dy, k, q] of [[0, 0, 1.25, .55], [r * .35, -r * .2, .85, .4], [-r * .3, r * .1, .7, .35]]) {
        const g = c.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r * k);
        g.addColorStop(0, rgbaC(C.smoke, al * q)); g.addColorStop(.6, rgbaC(C.smoke, al * q * .6)); g.addColorStop(1, rgbaC(C.smoke, 0));
        c.fillStyle = g; c.beginPath(); c.arc(x + dx, y + dy, r * k, 0, 7); c.fill();
      }
    }
  }
  function rain(c, W, H, lt, a = .5, slant = 6) {
    c.strokeStyle = rgbaC(C.waterDeep, .3 * a); c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath();
    const N = Math.round(200 * W * H / (1920 * 1080) * clamp(a, .2, 1.5));
    for (let i = 0; i < N; i++) {
      const x = ((hash(i) * (W + 300) - lt * 120) % (W + 300) + W + 300) % (W + 300) - 150;
      const y = ((hash(i + .37) * (H + 150) + lt * (900 + hash(i + 2) * 300)) % (H + 150)) - 100;
      c.moveTo(x, y); c.lineTo(x - slant, y + 26 + hash(i + 5) * 14);
    }
    c.stroke();
  }
  function snow(c, W, H, lt, a = .8) {
    c.fillStyle = rgbaC(C.paperLight, .9 * a);
    const N = Math.round(160 * W * H / (1920 * 1080));
    for (let i = 0; i < N; i++) {
      const x = ((hash(i) * W + Math.sin(lt * .8 + i) * 30 - lt * 20) % W + W) % W, y = ((hash(i + .5) * (H + 60) + lt * (40 + hash(i + 3) * 50)) % (H + 60)) - 30;
      c.beginPath(); c.arc(x, y, 2 + hash(i + 9) * 3, 0, 7); c.fill();
    }
    c.strokeStyle = rgbaC(C.inkSoft, .25 * a); c.lineWidth = 1;
  }
  // a small flock: ink "v" marks drifting across
  function birds(c, x0, y0, n, lt, o = {}) {
    c.strokeStyle = rgbaC(C.ink, .75); c.lineCap = 'round'; c.lineJoin = 'round';
    for (let i = 0; i < n; i++) {
      const x = x0 + (o.dx ?? 40) * lt + hash(i * 3.1) * (o.spread ?? 260) - (o.spread ?? 260) / 2, y = y0 + hash(i * 5.7) * (o.spreadY ?? 90) + Math.sin(lt * 1.3 + i) * 5;
      const s = (o.size ?? 12) * (.7 + hash(i) * .5), f = Math.sin(lt * 7 + i * 1.7) * .45;
      c.lineWidth = Math.max(1.4, s * .16);
      c.beginPath(); c.moveTo(x - s, y - s * (.35 + f)); c.quadraticCurveTo(x - s * .4, y - s * .1, x, y); c.quadraticCurveTo(x + s * .4, y - s * .1, x + s, y - s * (.35 + f)); c.stroke();
    }
  }

  // ------------------------------------------------------------ objects
  const G = {};
  const cache = new Map();
  // build one object (deterministic) and its sprite; cached by name + scale + options + seed
  function make(name, sc = 1, o = {}, seed = 1) {
    const gen = G[name];
    if (!gen) throw new Error('watercolor: unknown object "' + name + '" (WC.G)');
    const key = name + '|' + sc + '|' + JSON.stringify(o) + '|' + seed;
    if (cache.has(key)) return cache.get(key);
    const g = withSeed(seed * 7919 + name.length * 131 + Math.round(sc * 97), () => gen(sc, o));
    g.S = g.S || [];
    g.spr = sprite(g.S);
    cache.set(key, g);
    return g;
  }
  // draw an object: p < 1 paints it in stroke by stroke, then its cached sprite; sk = horizontal sway skew
  function drawObj(c, g, x, y, p = 1, o = {}) {
    if (p <= 0) return;
    c.save();
    c.translate(x, y);
    if (o.rot) c.rotate(o.rot);
    c.transform(o.flip ? -1 : 1, 0, o.sk || 0, 1, 0, 0);
    if (o.s && o.s !== 1) c.scale(o.s, o.s);
    c.globalAlpha = o.a ?? 1;
    if (p >= 1) c.drawImage(g.spr.cv, g.spr.x0, g.spr.y0);
    else drawList(c, g.S, p);
    c.restore();
  }

  // ---- nature (ported from the demo's plants and adapted): tree, cypress, pine, palm, shrub, grass, reeds, rock, cloud
  // tree — broad-leaved tree (oak, plane, olive-like crown). o: {h: height ×, leaf: token, bark: colour, bare: true (winter / burnt)}
  G.tree = (sc, o = {}) => {
    const woody = [], leaves = [], tips = [];
    const Hh = rnd(300, 390) * sc * (o.h ?? 1), lean = rnd(-.1, .1), tx = lean * Hh * .55, ty = -Hh * rnd(.42, .52);
    const trunkPts = qcurve(0, 0, tx, ty, rnd(-14, 14) * sc, 12), tw = rnd(16, 22) * sc;
    const bark = o.bark || mixc(C.wood, C.paperLight, .35);
    const trunk = mk(trunkPts, tw, bark, { prof: 'trunk', nb: 0, a: 1, rib: 1, rough: .12 });
    woody.push(trunk, edgeOf(trunk, 1, 2.6 * sc, C.ink), edgeOf(trunk, -1, 1.4 * sc, C.inkSoft, .7));
    function limb(x, y, ang, len, w, depth) {
      const pts = polar(x, y, ang, len, rnd(-.28, .28) * len, 8);
      const s = mk(pts, w, bark, { prof: 'tip', nb: 0, a: 1, rib: 1 });
      woody.push(s, edgeOf(s, 1, Math.max(1.1, w * .16), C.ink, .8));
      const e = pts[pts.length - 1];
      if (depth <= 0 || len < 26 * sc) { tips.push(e); return; }
      const nk = rnd() < .4 ? 3 : 2;
      for (let k = 0; k < nk; k++) limb(e[0], e[1], ang + (k - (nk - 1) / 2) * .6 + rnd(-.3, .3), len * rnd(.6, .78), w * .62, depth - 1);
    }
    const nl = rnd() < .5 ? 3 : 2;
    for (let k = 0; k < nl; k++) limb(tx, ty, -Math.PI / 2 + (k - (nl - 1) / 2) * .62 + rnd(-.2, .2), Hh * rnd(.26, .34), tw * .6, 2);
    const cols = o.cols || shades(o.leaf || C.leaf, .18);
    const bare = o.bare;
    if (!bare) for (const [x, y] of tips) clump(leaves, x, y + 4 * sc, rnd(30, 44) * sc, Math.round(18 * Math.min(1.2, sc + .3)), cols,
      { dir: Math.PI / 2, spread: .7, l0: 10 * sc, l1: 22 * sc, w0: 5 * sc, w1: 9 * sc, sx: 1.25, sy: .8 });
    return { S: woody.concat(leaves), sway: .006, top: [tx, -Hh] };
  };
  // cypress — Mediterranean cypress, slim dark column (cemeteries, mosques, Ottoman gardens). o: {h, leaf}
  G.cypress = (sc, o = {}) => {
    const S = [], h = rnd(300, 380) * sc * (o.h ?? 1), w = rnd(34, 44) * sc;
    S.push(mk(qcurve(0, 0, 0, -h * .2, 2, 4), 7 * sc, C.wood, { prof: 'even', nb: 0 }));
    const cols = shades(o.leaf || C.leafDark, .15);
    for (let i = 0; i < 46 * Math.min(1.3, sc + .2); i++) {
      const t = rnd(.06, 1), y = -h * t, half = w * Math.sin(Math.PI * Math.min(1, t * 1.05 + .02)) * (1 - t * .55);
      const x = rnd(-half, half);
      S.push(mk(polar(x, y, -Math.PI / 2 + rnd(-.35, .35), rnd(16, 34) * sc, rnd(-3, 3), 5), rnd(7, 12) * sc, pick(cols), { prof: 'leaf', nb: 0, a: rnd(.7, .92) }));
    }
    return { S, sway: .004, top: [0, -h] };
  };
  // pine — conifer / fir, tiered branches. o: {h, leaf}
  G.pine = (sc, o = {}) => {
    const S = [], h = rnd(260, 340) * sc * (o.h ?? 1);
    S.push(mk(qcurve(0, 0, 0, -h, rnd(-4, 4), 10), 8 * sc, C.wood, { prof: 'tip', nb: 0 }));
    const cols = shades(o.leaf || C.leafDark, .14);
    for (let k = 0; k < 9; k++) {
      const t = .2 + k / 9 * .78, y = -h * t, len = (1 - t) * 120 * sc + 18 * sc;
      for (const side of [-1, 1]) {
        const pts = qcurve(0, y, side * len, y + rnd(6, 16) * sc, side * rnd(4, 10), 6);
        S.push(mk(pts, rnd(14, 20) * sc * (1 - t * .5), pick(cols), { prof: 'leaf', nb: 4, a: rnd(.7, .9) }));
      }
    }
    return { S, sway: .004, top: [0, -h] };
  };
  // palm — date palm, curved trunk and drooping fronds. o: {h, leaf}
  G.palm = (sc, o = {}) => {
    const S = [], h = rnd(250, 320) * sc * (o.h ?? 1), tx = rnd(-40, 40) * sc;
    const tr = mk(qcurve(0, 0, tx, -h, rnd(-30, 30) * sc, 14), 11 * sc, mixc(C.wood, C.paperLight, .25), { prof: 'tip', nb: 3, a: .95 });
    S.push(tr, edgeOf(tr, 1, 1.8 * sc, C.ink, .7));
    for (let i = 1; i < 12; i++) { const [x, y] = tr.pts[i]; S.push(mk(qcurve(x - 6 * sc, y, x + 6 * sc, y + 2, 2, 3), 2 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .6 })); }
    const cols = shades(o.leaf || C.leaf, .16);
    for (let f = 0; f < 9; f++) {
      const a = -Math.PI / 2 + (f / 8 - .5) * 3.4 + rnd(-.15, .15), len = rnd(110, 150) * sc;
      const pts = qcurve(tx, -h, tx + Math.cos(a) * len, -h + Math.sin(a) * len * .55 + len * .35, -Math.sign(Math.cos(a) || 1) * len * .25, 10);
      S.push(mk(pts, 3 * sc, C.leafDark, { prof: 'tip', nb: 0, a: .8 }));
      for (let i = 2; i < pts.length; i++) {
        const [x, y] = pts[i], d = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
        for (const s of [-1, 1]) S.push(mk(polar(x, y, d + s * 1.1 + .5, rnd(18, 30) * sc * (1 - i / 14), 2, 3), rnd(4, 6) * sc, pick(cols), { prof: 'leaf', nb: 0, a: .8 }));
      }
    }
    return { S, sway: .008, top: [tx, -h] };
  };
  // shrub — low bush. o: {leaf, cols}
  G.shrub = (sc, o = {}) => {
    const S = [], h = rnd(60, 120) * sc;
    for (let i = 0; i < 3; i++) S.push(mk(polar(rnd(-10, 10), 0, -Math.PI / 2 + rnd(-.5, .5), h * .8, rnd(-8, 8), 5), 3 * sc, C.wood, { prof: 'tip', nb: 0 }));
    clump(S, 0, -h * .55, h * .55, 24, o.cols || shades(o.leaf || C.leaf, .2), { l0: 10 * sc, l1: 20 * sc, w0: 8 * sc, w1: 14 * sc, sx: 1.4, sy: .8 });
    return { S, sway: .01 };
  };
  // grass — tuft of grass or dry straw (fg layer). o: {n, leaf, cols}
  G.grass = (sc, o = {}) => {
    const S = [], n = o.n ?? 14, cols = o.cols || shades(o.leaf || C.clothC, .15);
    for (let i = 0; i < n; i++) {
      const side = rnd(-1, 1), ang = -Math.PI / 2 + side * .95, len = rnd(28, 58) * sc;
      S.push(mk(polar(side * 6 * sc, 0, ang, len, side * len * .25, 6), rnd(2, 3.4) * sc, pick(cols), { prof: 'tip', nb: 0, a: rnd(.7, .92) }));
    }
    return { S, sway: .03 };
  };
  // reeds — reeds / bulrushes at a river bank. o: {leaf}
  G.reeds = (sc, o = {}) => {
    const S = [], cols = shades(o.leaf || C.leaf, .15);
    for (let i = 0; i < 16; i++) {
      const x = rnd(-40, 40) * sc, len = rnd(90, 170) * sc;
      S.push(mk(qcurve(x, 0, x + rnd(-20, 20) * sc, -len, rnd(-10, 10) * sc, 8), rnd(2.5, 4) * sc, pick(cols), { prof: 'tip', nb: 0, a: .85 }));
      if (rnd() < .3) S.push(mk(qcurve(x, -len * .8, x + 2, -len, 1, 4), 6 * sc, C.wood, { prof: 'leaf', nb: 0 }));
    }
    return { S, sway: .025 };
  };
  // rock — boulder with a shadowed side. o: {w, col}
  G.rock = (sc, o = {}) => {
    const S = [], w = rnd(70, 120) * sc * (o.w ?? 1), h = w * rnd(.45, .7), base = o.col || C.stone;
    const pts = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([Math.cos(a) * w / 2 * rnd(.9, 1.05), Math.sin(a) * h * rnd(.75, 1.05)]); }
    S.push(washShape(pts.concat([[w / 2, 0], [-w / 2, 0]]), base, .75, 3, 3));
    S.push(washShape(pts.slice(5).concat([[w / 2, 0], [w * .05, 0]]), mixc(base, C.ink, .3), .4, 2, 2));
    S.push(...inkLine(pts, 2.2 * sc, C.ink, { step: 4, a: .7 }));
    return { S };
  };
  // cloud — long soft cloud streak (the backdrop adds them; use as an item to place one). o: {w, col}
  G.cloud = (sc, o = {}) => {
    const S = [], w = rnd(280, 520) * sc * (o.w ?? 1), cc = o.col || mixc(C.far, C.paper, .3);
    for (let i = 0; i < 5; i++) { const y = rnd(-18, 18) * sc, x = rnd(-w * .2, w * .2); S.push(mk(qcurve(x - w / 2, y, x + w / 2, y + rnd(-8, 8), rnd(-14, 14) * sc, 14), rnd(18, 34) * sc, cc, { prof: 'leaf', nb: 7, a: rnd(.2, .32) })); }
    return { S };
  };

  // ------------------------------------------------------------ frame helpers
  // a full-stage canvas inside the shot's element (the engine moves/fades the element: camera + transitions)
  function canvas(ctx) {
    const cv = document.createElement('canvas'); cv.width = ctx.W; cv.height = ctx.H;
    cv.style.cssText = `position:absolute;left:0;top:0;width:${ctx.W}px;height:${ctx.H}px`;
    ctx.root.appendChild(cv);
    const X = cv.getContext('2d');
    X.cv = cv;
    X.clear = () => { X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.shadowBlur = 0; X.clearRect(0, 0, ctx.W, ctx.H); };
    return X;
  }
  // a time value in a scene: number (s), cue name, or {cue, d} (cue + offset)
  const timeOf = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : typeof v === 'string' ? cue(cues, v, fb)
    : (v && v.cue ? cue(cues, v.cue, fb) + (v.d || 0) : fb);

  // ------------------------------------------------------------ backdrops (sky + land), baked once per scene
  function ridge(x, amp, f0, seed, sharp = 0) {
    const n = fbm(x / f0 + seed) * .75 + fbm(x / (f0 * .3) + seed + 9) * .35;
    return -amp * (sharp ? Math.pow(Math.abs(Math.sin(x / f0 * 2.2 + seed) * .6 + n * .7), 1.4) * 1.3 : n);
  }
  function ridgeWash(c, W, H, gy, amp, f0, seed, fill, a, sharp = 0) {
    const pts = []; for (let x = -20; x <= W + 20; x += 12) pts.push([x, gy + ridge(x, amp, f0, seed, sharp)]);
    pts.push([W + 20, H + 20], [-20, H + 20]);
    wash(c, pts, fill, a, 3, 4);
    return pts;
  }
  function skyWash(c, W, H, gy, kind, P) {
    if (kind === 'none') return;
    const night = kind === 'night', storm = kind === 'storm', warm = kind === 'dawn' || kind === 'dusk';
    const top = night ? C.night : storm ? mixc(C.smoke, C.night, .3) : warm ? mixc(C.skyWarm, C.paper, .5) : C.paper;
    const low = night ? mixc(C.night, C.sky, .45) : storm ? mixc(C.smoke, C.sky, .5) : warm ? C.skyWarm : C.sky;
    const g = c.createLinearGradient(0, 0, 0, gy);
    g.addColorStop(0, rgbaC(top, night ? .92 : storm ? .7 : warm ? .4 : 0));
    g.addColorStop(night ? .7 : 1, rgbaC(low, night ? .85 : .85));
    if (night) g.addColorStop(1, rgbaC(low, .6));
    c.fillStyle = g; c.fillRect(0, 0, W, gy + 6);
    // a few wide, pale brush streaks across the sky (watercolour unevenness, never stripes)
    const nb = night ? 3 : 2;
    for (let i = 0; i < nb; i++) softBand(c, rnd(-200, W * .2), rnd(W * .7, W + 200), rnd(gy * .2, gy * .8), rnd(60, 120), night ? C.night : storm ? C.smoke : warm ? C.skyWarm : C.sky, night ? .22 : .12);
    if (storm) for (let i = 0; i < 5; i++) cloudMass(c, rnd(-W * .1, W * 1.1), rnd(gy * .08, gy * .45), rnd(W * .25, W * .45), mixc(C.smoke, C.ink, .2), .5);
    if (night) {
      c.fillStyle = rgbaC(C.paperLight, .9);
      for (let i = 0; i < 70 * W / 1920; i++) { const x = rnd(0, W), y = rnd(0, gy * .7); c.beginPath(); c.arc(x, y, rnd(1, 2.6), 0, 7); c.fill(); }
    }
    if (kind === 'fog') for (let i = 0; i < 5; i++) band(c, -100, W + 100, rnd(gy * .4, gy), rnd(60, 120), C.paperLight, .35);
  }
  function sunMoon(c, W, H, gy, kind, P) {
    const s = P.sun;
    if (s === false) return;
    const night = kind === 'night';
    if (!(s || night || kind === 'dawn' || kind === 'dusk')) return;
    const x = (s && s.x != null ? s.x : .74) * W, y = (s && s.y != null ? s.y : (night ? .16 : kind === 'day' ? .18 : .5)) * gy, r = (s && s.r) || 62;
    if (night) {     // the moon is unpainted paper with a soft halo
      const hg = c.createRadialGradient(x, y, r * .8, x, y, r * 3.2); hg.addColorStop(0, rgbaC(C.paperLight, .35)); hg.addColorStop(1, rgbaC(C.paperLight, 0));
      c.fillStyle = hg; c.fillRect(x - r * 3.3, y - r * 3.3, r * 6.6, r * 6.6);
      c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip(); const pp = paper(); if (pp) c.drawImage(pp, 0, 0); else { c.fillStyle = C.paperLight; c.fill(); } c.restore();
      blob(c, x - r * .25, y - r * .1, r * .3, r * .22, C.paperDark, .25);
      return;
    }
    c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = rgbaC(C.red, .78); c.fill();
    for (let i = 0; i < 7; i++) { const yy = -r * .8 + i * r * .26, hw = Math.sqrt(Math.max(0, r * r - yy * yy)); drawS(c, mk(qcurve(x - hw + 4, y + yy, x + hw - 4, y + yy + rnd(-2, 2), 0, 8), r * .1, mixc(C.red, C.ink, .15), { prof: 'even', nb: 3, a: .35 })); }
    c.restore();
  }
  function groundTex(c, W, H, gy, kind) {
    const area = (H - gy) * W / (1920 * 300);
    if (kind === 'sea') return;
    const n = Math.round(110 * area);
    for (let i = 0; i < n; i++) {
      const x = rnd(-20, W), y = gy + 14 + Math.pow(rnd(), 1.3) * (H - gy - 10);
      const k = (y - gy) / (H - gy);
      if (kind === 'desert') drawS(c, mk(qcurve(x, y, x + rnd(80, 220) * (1 + k), y + rnd(-6, 6), rnd(-10, 10), 10), rnd(2, 3.5) * (1 + k), mixc(C.ground, C.red, .3), { prof: 'leaf', nb: 0, a: .4 }));
      else if (kind === 'snow') drawS(c, mk(qcurve(x, y, x + rnd(60, 160) * (1 + k), y + rnd(-4, 4), rnd(-6, 6), 8), rnd(3, 6) * (1 + k), C.far, { prof: 'leaf', nb: 0, a: .3 }));
      else if (kind === 'interior') drawS(c, mk(qcurve(x, y, x + rnd(100, 260), y, 0, 6), rnd(1.5, 2.5), C.stoneDark, { prof: 'even', nb: 0, a: .25 }));
      else if (kind === 'city') { if (rnd() < .6) drawS(c, mk(qcurve(x, y, x + rnd(30, 70) * (1 + k), y + rnd(-2, 2), 0, 4), rnd(2, 3), C.stoneDark, { prof: 'even', nb: 0, a: .3 })); }
      else for (let q = 0; q < 3; q++) drawS(c, mk(polar(x + q * 5, y, -Math.PI / 2 + rnd(-.45, .45), rnd(10, 24) * (1 + k * 1.4), 2, 4), 2 * (1 + k), pick(shades(C.leaf, .2)), { prof: 'tip', nb: 0, a: .55 }));
    }
  }
  function landWash(c, W, H, gy, kind, P) {
    const seed = rnd(0, 50);
    const fadeBottom = (y0, a = .45) => { const v = c.createLinearGradient(0, y0, 0, H); v.addColorStop(0, rgbaC(C.paper, 0)); v.addColorStop(1, rgbaC(C.paper, a)); c.fillStyle = v; c.fillRect(0, y0, W, H - y0); };
    if (kind === 'none') return;
    if (kind === 'interior') {
      const wall = P.wall ? col(P.wall) : mixc(C.stone, C.paper, .35);
      wash(c, [[-20, -20], [W + 20, -20], [W + 20, gy], [-20, gy]], wall, .55, 3, 3);
      const sh = c.createLinearGradient(0, 0, 0, gy); sh.addColorStop(0, rgbaC(C.stoneDark, .25)); sh.addColorStop(1, rgbaC(C.stoneDark, 0)); c.fillStyle = sh; c.fillRect(0, 0, W, gy);
      wash(c, [[-20, gy], [W + 20, gy], [W + 20, H + 20], [-20, H + 20]], P.floor ? col(P.floor) : mixc(C.wood, C.paper, .45), .6, 3, 2);
      drawS(c, mk(qcurve(-10, gy, W + 10, gy + rnd(-2, 2), 0, 24), 5, C.ink, { prof: 'even', nb: 5, a: .8, rough: .3 }));
      groundTex(c, W, H, gy, 'interior'); fadeBottom(gy + (H - gy) * .5, .3);
      return;
    }
    const sea = kind === 'sea', coast = kind === 'coast';
    if (kind === 'mountains' || kind === 'snow') {
      const pts = ridgeWash(c, W, H, gy - 40, Math.min(W, H) * .28 * (P.amp ?? 1), W * .2, seed, kind === 'snow' ? mixc(C.far, C.paper, .3) : C.far, .55, 1);
      if (kind === 'snow' || P.snowcaps) for (let i = 0; i < pts.length - 2; i += 3) { const [x, y] = pts[i]; if (y < gy - 220) drawS(c, mk(qcurve(x, y + 4, x + rnd(20, 50), y + rnd(20, 60), 4, 5), rnd(6, 10), C.paperLight, { prof: 'leaf', nb: 0, a: .7 })); }
    } else if (!sea) ridgeWash(c, W, H, gy - 50, (kind === 'plain' ? 18 : kind === 'desert' ? 50 : 70) * (P.amp ?? 1), 700, seed, kind === 'desert' ? mixc(C.skyWarm, C.far, .4) : C.far, .5);
    if (sea || coast) {
      // the sea (all of the lower frame, or the side P.coast names: default right) and, on a coast, a curved shore
      const right = P.coast !== 'left', shore = [];
      for (let y = gy; y <= H + 20; y += 20) {
        const k = (y - gy) / (H - gy), x = W * (.6 - .22 * k) + Math.sin(y * .012 + seed) * 24;
        shore.push([right ? x : W - x, y]);
      }
      const seaPoly = !coast ? [[-20, gy], [W + 20, gy], [W + 20, H + 20], [-20, H + 20]]
        : right ? [...shore, [W + 20, H + 20], [W + 20, gy]] : [...shore, [-20, H + 20], [-20, gy]];
      const landPoly = right ? [[-20, gy], ...shore, [-20, H + 20]] : [[W + 20, gy], ...shore, [W + 20, H + 20]];
      const clipTo = (poly) => { c.beginPath(); poly.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); };
      c.save(); clipTo(seaPoly);
      const pp = paper(); if (pp) c.drawImage(pp, 0, 0);
      const g = c.createLinearGradient(0, gy, 0, H); g.addColorStop(0, rgbaC(C.water, .6)); g.addColorStop(1, rgbaC(C.waterDeep, .62));
      c.fillStyle = g; c.fillRect(-20, gy, W + 40, H - gy + 20);
      for (let i = 0; i < 26 * (H - gy) / 400; i++) { const y = gy + 6 + Math.pow(rnd(), 1.4) * (H - gy); const k = (y - gy) / (H - gy); band(c, rnd(-100, W), rnd(0, W + 100), y, (4 + k * 10), pick([C.water, C.waterDeep, C.paperLight]), .2 + k * .1); }
      c.restore();
      drawS(c, mk(qcurve(-10, gy, W + 10, gy + rnd(-2, 2), 0, 24), 3, C.waterDeep, { prof: 'even', nb: 3, a: .6, rough: .3 }));
      if (sea) return;
      wash(c, landPoly, C.ground, .62, 3, 3);
      drawS(c, mk(along(shore, 24), 7, mixc(C.ground, C.paperLight, .5), { prof: 'even', nb: 4, a: .7 }));   // wet sand line
      c.save(); clipTo(landPoly); groundTex(c, W, H, gy, 'grass'); c.restore();
      return;
    }
    ridgeWash(c, W, H, gy - 14, (kind === 'plain' || kind === 'city' ? 8 : kind === 'desert' ? 26 : 28) * (P.amp ?? 1), 420, seed + 3, kind === 'desert' ? mixc(C.ground, C.skyWarm, .4) : kind === 'snow' ? mixc(C.sky, C.paper, .4) : C.mid, .5);
    const gcol = kind === 'desert' ? mixc(C.ground, C.skyWarm, .3) : kind === 'snow' ? mixc(C.sky, C.paperLight, .55) : kind === 'city' ? mixc(C.stone, C.paper, .3) : C.ground;
    const pts = []; for (let x = -20; x <= W + 20; x += 20) pts.push([x, gy + 2 + Math.sin(x / 300 + seed) * 3]);
    pts.push([W + 20, H + 20], [-20, H + 20]);
    wash(c, pts, gcol, .55, 3, 3);
    if (kind === 'river') {
      const rp = []; for (let y = gy; y <= H + 30; y += 15) { const k = (y - gy) / (H - gy); rp.push([W * (.5 + Math.sin(k * 3 + seed) * .18) - (20 + k * 160), y]); }
      const rr = rp.map(([x, y]) => [x + 40 + (y - gy) / (H - gy) * 320, y]).reverse();
      wash(c, rp.concat(rr), C.water, .6, 3, 2);
    }
    groundTex(c, W, H, gy, kind);
    fadeBottom(gy + (H - gy) * .55, .35);
  }
  function backdrop(W, H, gy, P) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const kind = P.sky || 'day';
    const pp = paper(); if (pp) c.drawImage(pp, 0, 0); else { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); }
    skyWash(c, W, H, gy, P.land === 'interior' ? 'none' : kind, P);
    if (P.land !== 'interior') sunMoon(c, W, H, gy, kind, P);
    if (P.clouds !== false && P.land !== 'interior' && kind !== 'night' && kind !== 'none') {
      const n = P.clouds ?? (kind === 'storm' ? 0 : 2);
      for (let i = 0; i < n; i++) { const g = make('cloud', rnd(.7, 1.2), {}, i + 3); drawObj(c, g, rnd(W * .1, W * .9), rnd(gy * .15, gy * .5)); }
    }
    landWash(c, W, H, gy, P.land || 'hills', P);
    return cv;
  }

  // ------------------------------------------------------------ the composer (SHOTS.wc_scene)
  const LAYERS = { far: { sc: .42, a: .6, dy: -58 }, mid: { sc: .68, a: .85, dy: -24 }, main: { sc: 1, a: 1, dy: 0 }, fg: { sc: 1.7, a: 1, dy: 0 } };
  function scene(ctx) {
    const { W, H, P, seed } = ctx;
    const portrait = H > W;
    const X = canvas(ctx);
    const gy = H * (P.horizon ?? (P.land === 'interior' ? (portrait ? .62 : .72) : portrait ? .6 : .7));
    const back = withSeed(seed * 101 + 7, () => backdrop(W, H, gy, P));
    const fgY = portrait ? H * .93 : H + 30;
    const zoom = P.scale ?? (portrait ? 1.45 : 1);     // a phone frame needs a bigger subject
    const items = (P.items || []).map((it, k) => {
      const L = LAYERS[it.layer || 'main'] || LAYERS.main;
      const g = make(it.g, Math.round((it.s ?? 1) * L.sc * zoom * 100) / 100, it.o || {}, (it.seed ?? k + 1) + seed * 13);
      const x = (it.x ?? .5) * W, y = it.y != null ? it.y * H : (it.layer === 'fg' ? fgY : gy + L.dy * (portrait ? 1.2 : 1)) + (it.dy ?? 0);
      return Object.assign({}, it, { obj: g, L, x, y, k, ph: hash(k + seed) * 6.28 });
    }).sort((a, b) => (a.layer === 'fg') - (b.layer === 'fg') || ['far', 'mid', 'main', 'fg'].indexOf(a.layer || 'main') - ['far', 'mid', 'main', 'fg'].indexOf(b.layer || 'main') || a.y - b.y);
    const notes = P.notes || [];
    const marks = P.land === 'sea' || P.land === 'coast' ? withSeed(seed + 55, () => Array.from({ length: 40 }, () => ({ x: rnd(0, W), y: gy + 10 + Math.pow(rnd(), 1.5) * (H - gy), w: rnd(30, 90), ph: rnd(0, 6.28) }))) : [];
    const paintIn = P.paint === true ? 1.2 : 0;     // P.paint: the backdrop paints itself in (brush-edge reveal) first

    function update(lt, dur, cues) {
      X.clear();
      // backdrop (optionally painted in along a wavy brush edge)
      const rv = paintIn ? eio(seg(lt, 0, paintIn)) : 1;
      if (rv >= 1) X.drawImage(back, 0, 0);
      else if (rv > 0) {
        X.save(); X.beginPath(); const R = mixN(-150, W + 150, rv); X.moveTo(-10, -10);
        for (let y = -10; y <= H + 40; y += 40) X.lineTo(R + (vnoise(y * .02) - .5) * 160, y);
        X.lineTo(-10, H + 10); X.closePath(); X.clip(); X.drawImage(back, 0, 0); X.restore();
      }
      // water shimmer
      for (const m of marks) { const a = .25 * (.5 + .5 * Math.sin(lt * 1.6 + m.ph)); X.strokeStyle = rgbaC(C.paperLight, a); X.lineWidth = 3; X.lineCap = 'round'; X.beginPath(); const dx = Math.sin(lt * .7 + m.ph) * 14; X.moveTo(m.x + dx, m.y); X.lineTo(m.x + dx + m.w, m.y + 1); X.stroke(); }
      // smoke behind objects
      for (const [i, s] of (P.smoke || []).entries()) { const t0 = timeOf(s.at, cues, 0); if (lt > t0) smoke(X, s.x * W, (s.y ?? gy / H) * H, s.h ?? H * .4, lt - t0 + 2, i, (s.a ?? .4) * ss(seg(lt, t0, t0 + 1)), s.drift ?? 1); }
      // objects
      for (const it of items) {
        const t0 = timeOf(it.at, cues, paintIn + .15 + clamp(it.x / W, 0, 1) * .7);
        const pd = it.paint ?? (it.obj.S.length > 80 ? 1.3 : .9);
        it.t1 = it.at === -1 ? 0 : t0 + pd;            // scene time the object is fully painted (live effects start from it)
        const p = it.at === -1 ? 1 : seg(lt, t0, t0 + pd);
        if (p <= 0) continue;
        let x = it.x, y = it.y;
        if (it.move) {
          const m0 = timeOf(it.move.at, cues, 0), md = it.move.dur ?? Math.max(1, dur - m0);
          const q = it.move.ease === false ? seg(lt, m0, m0 + md) : eio(seg(lt, m0, m0 + md));
          if (it.move.to) { x = mixN(it.x, it.move.to[0] * W, q); if (it.move.to[1] != null) y = mixN(it.y, it.move.to[1] * H, q); }
        }
        const swayA = it.sway === false ? 0 : (it.sway ?? it.obj.sway ?? 0);
        const sk = swayA ? swayA * Math.sin(lt * 1.15 + it.ph) + swayA * .4 * Math.sin(lt * 2.7 + it.ph * 2) : 0;
        const bob = it.bob || (it.bob !== false && (P.land === 'sea' || P.land === 'coast') && it.y >= gy - 4 && it.layer !== 'fg') ? 1 : 0;
        const by = bob ? Math.sin(lt * 1.3 + it.ph) * 4 : 0, rot = bob ? Math.sin(lt * 1.1 + it.ph) * .012 : (it.rot || 0);
        drawObj(X, it.obj, x, y + by, p, { flip: it.flip, sk, rot, a: (it.a ?? 1) * it.L.a });
        // live parts (flags, smoke, flames, glow) fade in over the last third of the painting-in, never pop in
        if (it.obj.live && p >= .7) { X.save(); X.translate(x, y + by); if (it.flip) X.scale(-1, 1); X.globalAlpha = ss((p - .7) / .3); it.obj.live(X, lt, it); X.restore(); }
      }
      // fire in front
      for (const [i, f] of (P.fire || []).entries()) {
        const t0 = timeOf(f.at, cues, 0), k = ss(seg(lt, t0, t0 + .8));
        if (k > 0) flame(X, f.x * W, (f.y ?? gy / H) * H, (f.h ?? 90) * k * (.85 + .15 * Math.sin(lt * 8 + i)), lt, i);
      }
      if (P.birds) birds(X, (P.birds.x ?? .2) * W, (P.birds.y ?? .2) * H, P.birds.n ?? 6, lt, P.birds);
      if (P.weather === 'rain' || P.weather === 'storm') rain(X, W, H, lt, P.weather === 'storm' ? 1.2 : .6);
      if (P.weather === 'snow') snow(X, W, H, lt);
      if (P.weather === 'fog') for (let i = 0; i < 3; i++) { const y = gy - H * .12 + i * H * .08; X.save(); X.globalAlpha = .4; const g = X.createLinearGradient(0, y - 60, 0, y + 60); g.addColorStop(0, rgbaC(C.paperLight, 0)); g.addColorStop(.5, rgbaC(C.paperLight, .7)); g.addColorStop(1, rgbaC(C.paperLight, 0)); X.fillStyle = g; X.fillRect(-50 + Math.sin(lt * .2 + i) * 60, y - 60, W + 100, 120); X.restore(); }
      // notes: {text, at, x, y (label, 0..1), ax, ay (what it points at, 0..1), size}
      for (const n of notes) {
        const t0 = timeOf(n.at, cues, 1.2);
        if (n.ax != null) note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size: n.size || (portrait ? 50 : 44), col: n.color === 'red' ? C.red : C.ink, bend: n.bend });
        else hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size: n.size || (portrait ? 54 : 46), align: n.align || 'center', col: n.color === 'red' ? C.red : C.ink });
      }
      // the scene washes away into paper (P.mist: start time or cue)
      if (P.mist != null) { const m0 = timeOf(P.mist, cues, dur - 1.2); mist(X, W, H, seg(lt, m0, m0 + 1.6)); }
    }
    return { update, X, gy, back, items };
  }

  return {
    C, G, rnd, pick, withSeed, clamp, mix: mixN, seg, ss, eio, eo, ei, hash, vnoise, fbm, fade2,
    col, mixc, rgba: rgbaC, shades,
    qcurve, qctrl, polar, along, mk, drawS, drawList, drawItem, washShape, washFill, bbox, sprite, clump, edgeOf, inkLine,
    wash, blob, blobPts, band, softBand, cloudMass, paper, mist, hand, leader, note, serif, font, HANDF, SERIF,
    flame, smoke, rain, snow, birds, make, drawObj, canvas, timeOf, backdrop, ridge, scene, LAYERS,
  };
})();

// wc_scene — the general painted scene: a sky, a land, objects painting themselves in, notes, weather.
// params:
//   sky: "day"|"dawn"|"dusk"|"night"|"storm"|"fog"|"none"      sun: {x, y (0..1 of the sky), r} | false
//   land: "hills"|"mountains"|"plain"|"desert"|"sea"|"coast"|"snow"|"river"|"city"|"interior"|"none"
//   horizon: 0..1 (ground line, default .70 wide / .60 vertical) · amp: ridge height × · coast: "left"|"right" (where the sea is: default right)
//   snowcaps: true · wall / floor: colour token for "interior" · clouds: n | false · paint: true (backdrop paints itself in)
//   items: [{g: "<WC.G name>", x: 0..1, y?: 0..1 (default: on the layer's ground), layer: "far"|"mid"|"main"|"fg",
//            s: scale, o: {generator options}, flip, at: seconds|cue|-1 (already painted), paint: seconds,
//            move: {to: [x, y?], at, dur, ease}, sway: false|amount, bob: true|false, a: alpha, seed}]
//   notes: [{text, at, x, y, ax?, ay? (leader target), size, color: "red", align}]
//   fire: [{x, y?, h, at}] · smoke: [{x, y?, h, at, a, drift}] · birds: {x, y, n, dx} · weather: "rain"|"storm"|"snow"|"fog"
//   mist: seconds|cue (the picture washes back to paper)
SHOTS.wc_scene = {
  kind: '2d',
  build(ctx) {
    const s = WC.scene(ctx);
    return { update: (lt, dur, cues) => s.update(lt, dur, cues || {}) };
  },
};
