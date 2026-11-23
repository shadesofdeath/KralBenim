// wc_tulipmania — Tulip Mania, the Dutch Republic 1636–37 (Stickstory ag-05, 2026-11-23): the flamed tulip, its bulb,
// a paper contract, a Dutch canal house, and two shots (a painted price curve, a winter garden cut open).
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic, colours only from WC.C tokens.
//
// Objects (WC.G; origin = base centre on the ground, y up negative, sc 1 = natural size):
//   tulip           ≈ 305 px tall. o: style 'broken' (default: white petals feathered and flamed with red, the
//                   Semper Augustus look) | 'plain' (one colour: o.color token, default "red"), h: stem height ×,
//                   lean: radians (the stem bends), leaves: 2 | 3      parts: flower petal flame base stem leaf
//   tulip_bulb      ≈ 250 px tall with its roots. o: sprout true|false, peel true|false (the papery tunic torn open
//                   to show the white flesh)                          parts: tip tunic flesh roots plate
//   tulip_contract  a promissory note ≈ 300 px tall: writing, a little red tulip sketch, a signature, a red wax
//                   seal. o: color (seal token)                        parts: sketch seal sign text
//   canal_house     a tall, narrow Dutch brick house ≈ 300 px tall (white window frames, a hoist beam).
//                   o: gable 'step' (default) | 'bell' | 'neck', floors 3–5 (4), w: width ×, col: brick token,
//                   lit: true (warm windows), door: token              parts: top door window gable
//
// Shots:
//   wc_tulipmania_chart  a hand-painted price curve on the paper: tulip prices climb (phase "rise": the line paints
//       itself up to the peak, a small flamed tulip riding its tip) or climb and crash (phase "crash": the rise is
//       there, on the cue "crash" the line plunges in red and the tulip tumbles down it).
//       params: {phase: "rise"|"crash", title, from: "Nov 1636", peak: "Feb 1637", note: {text, at} (by the peak),
//                after: {text, at} (above the peak, red, pen line to the fall), at}   cues: crash (the plunge)
//   wc_tulipmania_soil   a winter garden cut open: snow falling on the bed, marker sticks, bulbs asleep in the soil
//       with their roots; on the cue "paper" a promissory note paints itself in above the snow and dashed lines tie it
//       to the bulbs. params: {n: bulbs (3), under: {text, at} (note by the bulbs), paper: time|cue (default cue
//       "paper"), note: {text} (by the contract)}
//   wc_tulipmania_canal  a Dutch canal: things standing on a brick quay, mirrored and shimmering in the water below.
//       params: {sky, sun, clouds, horizon (the quay line, default .6 Short / .66 long), weather: "rain", birds,
//                items: [{g, o, x, s, layer: "back" (a row of houses set back, smaller) | main, at (s | cue | -1), flip,
//                         dy, sway: false, a, solid: false (no paper underlay)}], notes: [{text, x, y, ax?, ay?, at, color, size}]}
//   wc_tulipmania_still  a still life indoors (wall, floor, window, table, vase, tulip), each main object on a solid
//       paper underlay. params: {wall, floor, horizon, items: [{g, o, x, y, s, at, solid: false}], notes}
'use strict';

(() => {
  const C = WC.C, { rnd, pick, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eo, eio } = WC;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ small painting kit (own copy, same recipes)
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
  const tok = (v, fb) => (v ? WC.col(v) : fb);
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  function spline(P, closed = false, per = 6) {
    const n = P.length, out = [], g = i => closed ? P[((i % n) + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0, m = closed ? n : n - 1; i < m; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(closed ? out[0].slice() : P[n - 1].slice());
    return out;
  }
  const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
  const inside = (P, x, y) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi) r = !r; } return r; };
  const add = (S, s) => (S.push(s), s);
  const wsh = (S, pts, c, a = .5, passes = 3, jit = 1.2) => add(S, washShape(pts, c, a, passes, jit));
  const brush = (S, pts, w, c, o = {}) => add(S, mk(pts, w, c, o));
  // a loose ink line along pts, broken in a place or two
  function ink(S, pts, w = 2.2, o = {}) {
    const L = polyLen(pts); if (L < 2) return;
    const n = Math.max(3, Math.min(70, Math.round(L / 6))), P = along(pts, n);
    const gaps = o.gaps ?? (L > 170 ? (rnd() < .5 ? 1 : 2) : L > 80 && rnd() < .45 ? 1 : 0);
    const cuts = []; for (let g = 0; g < gaps; g++) cuts.push(Math.floor(rnd(.2, .8) * n));
    cuts.sort((a, b) => a - b); cuts.push(n);
    let st = 0;
    for (const e of cuts) {
      if (e - st >= 2) { const s = mk(P.slice(st, e + 1), w * rnd(.85, 1.15), o.col || C.ink, { prof: 'even', nb: 0, a: o.a ?? .85, rough: .32 }); s.fine = true; S.push(s); }
      st = e + 1;
    }
  }
  function pool(S, P, c, w = 3, a = .24) { const L = polyLen(P); if (L < 10) return; S.push(mk(along(P, Math.max(6, Math.min(60, Math.round(L / 9)))), w, c, { prof: 'even', nb: 0, a, rough: .55 })); }
  function patches(S, P, c, n = 3, a = .12, rk = .2) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const R = Math.min(x1 - x0, y1 - y0) * rk;
    for (let k = 0, tries = 0; k < n && tries < 40; tries++) {
      const x = rnd(x0, x1), y = rnd(y0, y1); if (!inside(P, x, y)) continue;
      const B = WC.blobPts(x, y, R * rnd(.6, 1.2), R * rnd(.4, .8), 18, .25); if (!B.every(([u, v]) => inside(P, u, v))) continue;
      k++; wsh(S, B, c, a, 2, R * .04);
    }
  }
  function line(S, x0, y0, x1, y1, w, c = C.ink, a = .8) {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < .5) return;
    S.push(mk(qcurve(x0, y0, x1, y1, rnd(-1, 1) * Math.min(2, L * .015), Math.max(3, Math.min(14, Math.round(L / 9)))), w, c, { prof: 'even', nb: 0, a, rough: .3 }));
  }
  // parallel dry strokes across a polygon (bricks, soil strata)
  function rows(S, poly, c, o = {}) {
    let y0 = 1e9, y1 = -1e9; for (const p of poly) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const gap = o.gap ?? 10;
    for (let y = y0 + gap * .5; y < y1 - gap * .2; y += gap * rnd(.85, 1.15)) {
      const xs = [];
      for (let i = 0; i < poly.length; i++) { const [ax, ay] = poly[i], [bx, by] = poly[(i + 1) % poly.length]; if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) / (by - ay) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let j = 0; j + 1 < xs.length; j += 2) {
        let xa = xs[j] + 2, xb = xs[j + 1] - 2;
        if (o.broken) { const L = xb - xa; xa += rnd(0, L * o.broken); xb -= rnd(0, L * o.broken); }
        if (xb - xa < 6) continue;
        S.push(mk(qcurve(xa, y, xb, y + rnd(-1, 1), rnd(-2, 2), Math.max(4, Math.round((xb - xa) / 14))), o.w ?? gap * 1.1, Array.isArray(c) ? pick(c) : c, { prof: 'even', nb: o.nb ?? 3, a: (o.a ?? .2) * rnd(.75, 1.15), rough: .35 }));
      }
    }
  }
  function xform(S, a, dx, dy, parts) {
    const c = Math.cos(a), s = Math.sin(a), R = ([x, y]) => [x * c - y * s + dx, x * s + y * c + dy];
    for (const q of S) {
      if (q.poly) { q.poly = q.poly.map(r => r.map(R)); q.pts = q.pts.map(R); continue; }
      q.pts = q.pts.map(R);
      if (a) { const nx = q.nx.map((v, i) => v * c - q.ny[i] * s), ny = q.nx.map((v, i) => v * s + q.ny[i] * c); q.nx = nx; q.ny = ny; }
    }
    if (parts) for (const k in parts) parts[k] = R(parts[k]);
  }
  function scaleList(S, sc) {
    if (sc === 1) return;
    const kf = Math.pow(sc, .62), M = ([x, y]) => [x * sc, y * sc];
    for (const s of S) {
      if (s.poly) { s.poly = s.poly.map(r => r.map(M)); s.pts = s.pts.map(M); continue; }
      const k = s.fine ? kf : sc;
      s.pts = s.pts.map(M); s.ws = s.ws.map(w => Math.max(.5, w * k));
      if (s.br) for (const b of s.br) { b.bw = Math.max(.6, b.bw * k); b.dash = b.dash.map(d => d * sc); }
    }
  }
  // register a generator: painted at sc 1, seated on y = 0, a soft cast shadow under it (o.shadow: false removes it)
  function def(name, fn) {
    WC.G[name] = (sc = 1, o = {}) => {
      const r = fn(o) || {}, S = r.S || [];
      let yb = -1e9;
      for (const q of S) { if (q.poly) { for (const p of q.pts) yb = Math.max(yb, p[1]); } else for (let i = 0; i < q.pts.length; i++) yb = Math.max(yb, q.pts[i][1] + q.ws[i] * .4); }
      const lift = yb > -1e8 && Math.abs(yb) > .5 ? -yb : 0;
      if (lift) { xform(S, 0, 0, lift, r.parts); if (r.top) r.top = [r.top[0], r.top[1] + lift]; }
      let pre = [];
      if (o.shadow !== false && r.sh !== false && S.length) {
        const b = WC.bbox(S, 0), w = b[2] - b[0], sc_ = mixc(C.stoneDark, C.night, .3);
        const [cx, rx, ry] = r.sh || [(b[0] + b[2]) / 2 + w * .05, w * .5, Math.max(5, Math.min(16, w * .055))];
        pre = [washShape(WC.blobPts(cx, -1, rx * 1.1, ry * 1.5, 30, .1), sc_, .12, 3, 3), washShape(WC.blobPts(cx + rx * .05, -1, rx * .8, ry * .7, 26, .08), sc_, .2, 3, 2)];
      }
      const all = pre.concat(S);
      scaleList(all, sc);
      const sp = p => p && [p[0] * sc, p[1] * sc];
      const out = { S: all, sway: r.sway, top: sp(r.top), parts: {} };
      if (r.parts) for (const k in r.parts) out.parts[k] = sp(r.parts[k]);
      return out;
    };
  }

  // ================================================================ tulip
  // a petal in its own frame: base (0, 0), tip (0, -h); returns the closed outline
  function petalShape(w, h, round = .5) {
    const half = spline([[0, 0], [w * .26, -h * .06], [w * .46, -h * .3], [w * .5, -h * .58], [w * .42, -h * .84], [w * .2 * (1 + round), -h * .97], [0, -h]], false, 5);
    return half.concat(half.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
  }
  const halfW = (w, h, y) => { const f = clamp(-y / h); return w * (f < .58 ? .26 + (.5 - .26) * Math.sin(f / .58 * PI / 2) : .5 - .3 * Math.pow((f - .58) / .42, 1.6)); };
  def('tulip', o => {
    const S = [], parts = {}, broken = (o.style || 'broken') !== 'plain';
    const lean = o.lean ?? .06, sh = 200 * (o.h ?? 1);
    const leafC = mixc(C.leaf, C.far, .28), leafD = dark(leafC, .3);
    // leaves: broad, glaucous, from the base, one curling outward
    const leaves = o.leaves ?? 2;
    const LV = [[-1, 158, .92, 46], [1, 118, .55, 40], [-1, 92, .2, 30]].slice(0, leaves);
    for (const [sd, len, spread, wd] of LV) {
      const tipx = sd * len * Math.sin(spread) * .62, tipy = -len * Math.cos(spread * .5);
      const mid = qcurve(sd * 4, -4, tipx, tipy, -sd * len * .22, 14);
      const N = mid.map((p, i) => { const a = mid[Math.max(0, i - 1)], b = mid[Math.min(mid.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; });
      const wAt = i => wd * .5 * Math.pow(Math.sin(PI * (i / (mid.length - 1)) * .96 + .04), .8);
      const A = mid.map((p, i) => [p[0] + N[i][0] * wAt(i), p[1] + N[i][1] * wAt(i)]), B = mid.map((p, i) => [p[0] - N[i][0] * wAt(i), p[1] - N[i][1] * wAt(i)]);
      const shape = A.concat(B.slice().reverse());
      wsh(S, shape, leafC, .62, 3, .8);
      wsh(S, (sd > 0 ? A : B).concat(mid.slice().reverse()), leafD, .32, 2, .5);
      brush(S, mid.slice(1, -2), 2.2, lite(leafC, .5), { prof: 'tip', nb: 0, a: .55 });
      ink(S, sd > 0 ? A : B, 1.5, { a: .7 }); ink(S, sd > 0 ? B : A, 1, { a: .4 });
      if (sd < 0 && !parts.leaf) parts.leaf = mid[Math.floor(mid.length * .55)];
    }
    // stem
    const fx = Math.sin(lean) * sh, fy = -sh;
    const stemP = qcurve(0, 0, fx, fy, -lean * sh * .4 + 6, 14);
    const stem = brush(S, stemP, 8.5, mixc(C.leaf, C.green, .4), { prof: 'even', nb: 0, a: .95, rough: .1 });
    S.push(WC.edgeOf(stem, 1, 1.6, C.ink, .6));
    brush(S, stemP.slice(2, -2).map(([x, y]) => [x - 1.8, y]), 2, lite(C.leaf, .5), { prof: 'leaf', nb: 0, a: .45 });
    parts.stem = stemP[6]; parts.base = [0, -4];
    // the flower: back petals (shadowed inside of the cup), two side petals, the front petal last
    const H = 112, Wd = 58, fyB = fy + 6;
    const pBase = broken ? mixc(C.paperLight, C.paper, .25) : tok(o.color, C.red);
    const flameC = broken ? mixc(C.red, C.cloth, .2) : dark(pBase, .3);
    const flameD = broken ? dark(C.red, .3) : dark(pBase, .5);
    const P = [
      { x: -9, t: -.1, w: Wd * .82, h: H * .97, back: true },
      { x: 10, t: .1, w: Wd * .82, h: H * .95, back: true },
      { x: -19, t: -.22, w: Wd * .92, h: H * .93 },
      { x: 20, t: .22, w: Wd * .92, h: H * .92 },
      { x: 0, t: .02, w: Wd, h: H },
    ];
    // a curved flame tongue in petal space: from (x0, f0) up to (x1, f1) (f = fraction of the height)
    const tongue = (L, T, p, x0, f0, x1, f1, w, c, a) => brush(L, qcurve(x0, -p.h * f0, x1, -p.h * f1, rnd(-.06, .06) * p.w, 8).map(T), w, c, { prof: 'tip', nb: w > 6 ? 3 : 0, a });
    for (const [k, p] of P.entries()) {
      const L = [], c = Math.cos(p.t), s = Math.sin(p.t), ox = fx + p.x * .9, oy = fyB - (p.back ? 4 : 0);
      const T = ([x, y]) => [ox + x * c - y * s, oy + x * s + y * c];
      const shp = petalShape(p.w, p.h).map(T);
      const shade = p.back ? .26 : k === 2 ? .04 : k === 3 ? .14 : 0;
      wsh(L, shp, p.back ? dark(pBase, broken ? .18 : .28) : pBase, broken ? 1.5 : .9, 3, .8);
      // light from the upper left: the right side of every petal in a cool shadow wash
      const rightHalf = petalShape(p.w, p.h).filter(([x]) => x >= -p.w * .05).map(([x, y]) => [Math.max(x, p.w * .06), y]).map(T);
      wsh(L, rightHalf, broken ? mixc(C.far, C.skyWarm, .3) : dark(pBase, .3), broken ? .14 + shade : .3 + shade, 2, .5);
      if (broken && !p.back) {
        // the Semper Augustus look: a broad crimson flame rising up the middle of the petal and splitting into
        // tongues, and a feathered red rim licking in from the edges (reads as red-and-white even when small)
        wsh(L, petalShape(p.w * .5, p.h * .16).map(T), mixc(C.blue, C.paperLight, .6), .22, 2, .4);
        const sw = Math.sin(k * 2.3) * p.w * .03, j = () => rnd(-.025, .025) * p.w;
        const fl = spline([[0, -p.h * .06], [p.w * .1 + j(), -p.h * .24], [p.w * .17 + j(), -p.h * .44], [p.w * .12, -p.h * .58], [p.w * .23 + sw, -p.h * .8],
          [p.w * .07, -p.h * .66], [sw, -p.h * .93], [-p.w * .08, -p.h * .66], [-p.w * .22 + sw, -p.h * .78], [-p.w * .13, -p.h * .57], [-p.w * .17 + j(), -p.h * .42], [-p.w * .1 + j(), -p.h * .24]], true, 4);
        wsh(L, fl.map(T), flameC, .9, 3, .6);
        tongue(L, T, p, 0, .1, sw * .5, .74, p.w * .09, flameD, .62);
        for (const sd of [-1, 1]) tongue(L, T, p, sd * p.w * .06, .3, sd * p.w * .14, .62, p.w * .045, flameD, .5);
        // the feathered rim: a red band along the upper edges, ragged on its inner side
        const outl = petalShape(p.w, p.h), rim = outl.filter(([, y]) => y < -p.h * .5);
        const inner = rim.slice().reverse().map(([x, y], i) => { const d = (i % 2 ? .16 : .26) + rnd(-.05, .05); return [x * (1 - d * 1.6), y + p.h * d * .35]; });
        wsh(L, rim.concat(inner).map(T), flameC, .72, 2, .5);
      } else if (broken) {
        tongue(L, T, p, 0, .3, 0, .9, p.w * .12, dark(flameC, .15), .55);
      } else {
        for (let i = 0; i < 4; i++) { const v = -.3 + i * .2; brush(L, [[v * p.w, -p.h * .1], [v * p.w * 1.1, -p.h * .5], [v * p.w * .7, -p.h * .88]].map(T), p.w * .14, dark(pBase, .18), { prof: 'leaf', nb: 3, a: .3 }); }
      }
      // light lifted along the left of the front petals
      if (!p.back) brush(L, [[-p.w * .24, -p.h * .22], [-p.w * .3, -p.h * .5], [-p.w * .2, -p.h * .8]].map(T), p.w * .1, C.paperLight, { prof: 'leaf', nb: 0, a: broken ? .5 : .4 });
      pool(L, shp, dark(pBase, .2), 2.2, broken ? .16 : .22);
      ink(L, shp.slice(0, Math.floor(shp.length * .55)), 1.7, { a: .78 });
      ink(L, shp.slice(Math.floor(shp.length * .5)), 1.3, { a: .55 });
      S.push(...L);
      if (k === 4) { parts.flower = T([0, -p.h * .55]); parts.petal = T([-p.w * .28, -p.h * .45]); parts.flame = T([0, -p.h * .7]); }
    }
    return { S, parts, sway: .012, top: [fx, fy - H] };
  });

  // ================================================================ tulip bulb
  def('tulip_bulb', o => {
    const S = [], parts = {};
    const tunic = mixc(mixc(C.wood, C.skyWarm, .38), C.clothC, .2), flesh = mixc(C.paperLight, C.clothC, .18);
    const half = spline([[0, 0], [44, -6], [74, -38], [78, -84], [60, -130], [30, -168], [8, -192], [0, -200]], false, 6);
    const sil = half.concat(half.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
    // roots first (behind), then the body
    const rootC = mixc(C.ground, C.stoneDark, .35);
    for (let k = 0; k < 16; k++) {
      const x = rnd(-26, 26), len = rnd(26, 58), a = PI / 2 + x / 60 + rnd(-.35, .35);
      brush(S, WC.polar(x, 2, a, len, rnd(-8, 8), 6), rnd(1.6, 2.8), pick([rootC, dark(rootC, .2), lite(rootC, .3)]), { prof: 'tip', nb: 0, a: .8 });
    }
    wsh(S, ell(0, 0, 30, 8), dark(tunic, .3), .55, 2, .6);
    wsh(S, sil, tunic, .7, 3, 1);
    patches(S, sil, dark(tunic, .12), 3, .14, .22);
    if (o.peel !== false) {   // the tunic torn away on the lower left: the white, faintly green flesh
      const pe = spline([[-70, -40], [-62, -92], [-34, -128], [-10, -112], [-22, -84], [-6, -52], [-26, -22], [-52, -14]], true, 4);
      wsh(S, pe, flesh, .85, 3, .6);
      wsh(S, pe.filter(([x]) => x > -40), mixc(flesh, C.leaf, .25), .22, 2, .4);
      brush(S, qcurve(-60, -48, -30, -118, -10, 8), 3, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
      ink(S, pe, 1.2, { a: .7, gaps: 1 });
      for (let i = 0; i < 6; i++) { const q = pe[Math.floor(rnd(0, pe.length - 1))]; brush(S, WC.polar(q[0], q[1], rnd(0, TAU), rnd(5, 11), 2, 3), 1.4, dark(tunic, .35), { prof: 'tip', nb: 0, a: .7 }); }
      parts.flesh = [-38, -80];
    }
    // veins of the papery tunic, following the form
    for (let k = 0; k < 11; k++) {
      const v = -.85 + 1.7 * k / 10, pts = half.map(([x, y]) => [x * v, y]).slice(1, -1);
      if (o.peel !== false && v < -.1 && v > -.95) { brush(S, pts.slice(Math.floor(pts.length * .62)), 1.6, dark(tunic, .3), { prof: 'leaf', nb: 0, a: .4 }); continue; }
      brush(S, pts, 1.6, dark(tunic, .3), { prof: 'leaf', nb: 0, a: .42 });
    }
    // shadow side, lifted light, ink
    wsh(S, half.map(([x, y]) => [x, y]).concat(half.slice().reverse().map(([x, y]) => [x * .2, y])), dark(tunic, .35), .38, 2, .6);
    brush(S, qcurve(-50, -112, -18, -170, -6, 8), 5, lite(tunic, .6), { prof: 'leaf', nb: 0, a: .55 });
    ink(S, half, 2); ink(S, half.map(([x, y]) => [-x, y]), 1.3, { a: .55 });
    brush(S, qcurve(0, -200, 3, -214, 2, 4), 3, dark(tunic, .3), { prof: 'tip', nb: 0, a: .85 });
    if (o.sprout) {
      const sp = qcurve(2, -196, 8, -238, -6, 8);
      brush(S, sp, 9, mixc(C.leaf, C.paperLight, .2), { prof: 'tip', nb: 0, a: .9 });
      ink(S, sp, 1, { a: .6, gaps: 0 });
      parts.tip = [8, -236];
    } else parts.tip = [2, -210];
    Object.assign(parts, { tunic: [44, -110], roots: [0, 40], plate: [0, 0] });
    return { S, parts, sh: false };
  });

  // ================================================================ promissory note
  function scribble(S, x0, x1, y, o = {}) {
    let x = x0;
    while (x < x1 - 12) {
      const wl = Math.min(x1 - x, rnd(18, 52)), pts = [];
      for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([x + wl * u, y + Math.sin(u * PI * rnd(3, 5) + x) * rnd(1.5, 3.2) - (i % 3 === 1 ? rnd(0, 3) : 0)]); }
      const s = mk(pts, o.w ?? 1.5, o.col || C.ink, { prof: 'even', nb: 0, a: o.a ?? .72, rough: .4 }); s.fine = true; S.push(s);
      x += wl + rnd(7, 13);
    }
  }
  def('tulip_contract', o => {
    const S = [], parts = {}, w = 220, h = 290, x0 = -w / 2, y0 = -h;
    const pa = mixc(C.paperLight, C.stain, .3);
    const sheet = [[x0, y0 + 3], [-x0, y0], [-x0 + 3, -2], [x0 + 1, 0]];
    wsh(S, sheet, pa, .78, 3, 1.4);
    patches(S, sheet, dark(pa, .08), 3, .12, .2);
    wsh(S, [[-x0 - 26, y0], [-x0, y0], [-x0 + 3, -2], [-x0 - 22, -2]], dark(pa, .14), .3, 2, .5);
    // heading line, a flourish, lines of writing
    scribble(S, x0 + 34, -x0 - 40, y0 + 36, { w: 2.2, a: .85 });
    brush(S, qcurve(x0 + 40, y0 + 52, -x0 - 50, y0 + 50, -4, 10), 1.6, C.ink, { prof: 'tip', nb: 0, a: .6 });
    for (let i = 0; i < 7; i++) scribble(S, x0 + 22 + (i === 0 ? 20 : 0), (i === 3 || i === 6) ? x0 + 120 : -x0 - (i < 3 ? 86 : 22), y0 + 82 + i * 22);
    // a small red tulip sketched in the margin (top right)
    const tx = -x0 - 50, ty = y0 + 140;
    brush(S, qcurve(tx, ty, tx + 2, ty - 48, -4, 6), 2.4, C.leaf, { prof: 'even', nb: 0, a: .85 });
    brush(S, qcurve(tx, ty - 4, tx - 16, ty - 30, 4, 5), 6, C.leaf, { prof: 'leaf', nb: 0, a: .7 });
    for (const [dx, a] of [[-8, -.25], [8, .25], [0, 0]]) brush(S, WC.polar(tx + 2 + dx * .7, ty - 44, -PI / 2 + a, 26, a * 6, 5), 13, dx ? mixc(C.red, C.paperLight, .2) : C.red, { prof: 'leaf', nb: 0, a: .8 });
    ink(S, [[tx - 12, ty - 46], [tx - 10, ty - 66], [tx + 2, ty - 58], [tx + 12, ty - 68], [tx + 14, ty - 46]], 1.2, { a: .7, gaps: 0 });
    parts.sketch = [tx + 2, ty - 56];
    // signature and the red wax seal
    const sg = []; for (let i = 0; i <= 16; i++) { const u = i / 16; sg.push([20 + u * 70, -54 + Math.sin(u * 12) * 7 - u * 8]); }
    brush(S, sg, 2.2, C.ink, { prof: 'tip', nb: 0, a: .85 });
    brush(S, qcurve(18, -38, 98, -44, 4, 8), 1.6, C.ink, { prof: 'tip', nb: 0, a: .6 });
    parts.sign = [60, -56];
    const sealC = tok(o.color, C.red), sx = x0 + 52, sy = -50;
    wsh(S, spline([[sx - 24, sy - 4], [sx - 16, sy - 21], [sx + 4, sy - 26], [sx + 22, sy - 13], [sx + 24, sy + 9], [sx + 7, sy + 24], [sx - 15, sy + 20], [sx - 26, sy + 9]], true, 3), sealC, .88, 3, 1);
    wsh(S, ell(sx + 3, sy + 3, 15, 15, -.5, PI * .8, 12).concat(ell(sx, sy, 13, 13, PI * .8, -.5, 12)), dark(sealC, .35), .4, 2, .3);
    ink(S, ell(sx, sy, 13, 13, 0, TAU, 20), 1, { col: dark(sealC, .55), a: .7, gaps: 0 });
    brush(S, ell(sx, sy, 6, 6, 0, PI * 1.6, 10), 1.6, dark(sealC, .55), { prof: 'even', nb: 0, a: .7 });
    parts.seal = [sx, sy]; parts.text = [x0 + 70, y0 + 120];
    ink(S, sheet.concat([sheet[0]]), 1.8, { a: .8 });
    return { S, parts };
  });

  // ================================================================ Dutch canal house
  def('canal_house', o => {
    const S = [], parts = {}, w = 118 * (o.w ?? 1), n = clamp(Math.round(o.floors ?? 4), 3, 5), gab = o.gable || 'step';
    const brick = tok(o.col, pick([mixc(C.roof, C.stoneDark, .3), mixc(C.roof, C.wood, .45), mixc(C.cloth, C.stoneDark, .25), mixc(C.roof, C.skyWarm, .25)]));
    const stoneW = mixc(C.paperLight, C.stone, .35), frame = mixc(C.paperLight, C.paper, .3), lit = o.lit;
    const x0 = -w / 2, x1 = w / 2, gH = 62, fH = 50, bh = gH + (n - 1) * fH, gh = 92, D = [13, -6];
    // the gable outline from the left eave over the top to the right eave
    let top;
    if (gab === 'step') {
      const st = 3, sw = w * .13, sh = gh * .2, L = [[x0, -bh]];
      for (let i = 0; i < st; i++) { const yy = -bh - sh * (i + 1); L.push([x0 + sw * i, yy], [x0 + sw * (i + 1), yy]); }
      const capY = -bh - gh; L.push([x0 + sw * st, capY]);
      top = L.concat(L.slice().reverse().map(([x, y]) => [-x, y]));
    } else {
      const neck = gab === 'neck', nw = w * (neck ? .3 : .34);
      const half = spline([[x0, -bh], [x0 + w * .08, -bh - gh * .12], [-nw - w * .06, -bh - gh * .3], [-nw, -bh - gh * .5], [-nw, -bh - gh * .82], [-nw * .5, -bh - gh * (neck ? .92 : 1)], [0, -bh - gh * (neck ? .96 : 1.04)]], false, 4);
      top = half.concat(half.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
    }
    const facade = [[x0, 0], ...top, [x1, 0]];
    // contact shadow, the narrow side wall in shade
    wsh(S, [[x0 - 10, 3], [x0, -2], [x1 + D[0], -2], [x1 + D[0] + 16, 3], [x1, 8], [x0 - 4, 7]], mixc(C.stoneDark, C.ink, .3), .2, 2, 2);
    wsh(S, [[x1, 0], [x1 + D[0], D[1]], [x1 + D[0], -bh + D[1]], [x1, -bh]], dark(brick, .35), .78, 2, .6);
    // facade wash, variegation, brick courses
    wsh(S, facade, brick, .74, 3, 1.2);
    patches(S, facade, pick([C.skyWarm, C.stoneDark, C.clothC]), 3, .12, .22);
    rows(S, facade, [dark(brick, .2), dark(brick, .1), lite(brick, .15)], { gap: 7, w: 2.4, a: .22, broken: .3, nb: 0 });
    wsh(S, facade.filter(([x]) => x > w * .18).concat([[w * .18, 0]]), dark(brick, .25), .16, 2, .6);
    // white stone: string courses, the gable copings, a cap stone
    for (let i = 1; i < n; i++) { const y = -gH - (i - 1) * fH; line(S, x0 + 1, y + 2, x1 - 1, y + 2, 3.2, stoneW, .85); }
    for (let i = 0; i < top.length - 1; i++) { const [ax, ay] = top[i], [bx, by] = top[i + 1]; if (Math.abs(by - ay) < 1) line(S, ax - 3, ay, bx + 3, by, 4.2, stoneW, .9); }
    // windows: tall, white-framed, small panes; the ground floor a door and a big window
    const nw = w > 105 ? 3 : 2, ww = w * (nw === 3 ? .19 : .26), wh = fH * .62;
    const glass = lit ? mixc(C.gold, C.fire, .2) : mixc(C.ink, C.waterDeep, .32);
    const win = (cx, yb, ww_, wh_) => {
      wsh(S, [[cx - ww_ / 2, yb], [cx + ww_ / 2, yb], [cx + ww_ / 2, yb - wh_], [cx - ww_ / 2, yb - wh_]], glass, lit ? .8 : .62, 2, .5);
      if (lit) wsh(S, [[cx - ww_ * .3, yb - 2], [cx + ww_ * .3, yb - 2], [cx + ww_ * .3, yb - wh_ * .6], [cx - ww_ * .3, yb - wh_ * .6]], mixc(C.gold, C.paperLight, .4), .5, 1, .3);
      for (const [a, b, c2, d] of [[cx - ww_ / 2, yb, cx - ww_ / 2, yb - wh_], [cx + ww_ / 2, yb, cx + ww_ / 2, yb - wh_], [cx - ww_ / 2 - 1, yb - wh_, cx + ww_ / 2 + 1, yb - wh_], [cx, yb, cx, yb - wh_], [cx - ww_ / 2, yb - wh_ * .5, cx + ww_ / 2, yb - wh_ * .5]]) line(S, a, b, c2, d, 2.6, frame, .95);
      line(S, cx - ww_ / 2 - 3, yb + 1.5, cx + ww_ / 2 + 3, yb + 1.5, 2.4, stoneW, .8);
      ink(S, [[cx - ww_ / 2, yb], [cx - ww_ / 2, yb - wh_], [cx + ww_ / 2, yb - wh_]], 1, { a: .45, gaps: 0 });
    };
    for (let f = 1; f < n; f++) {
      const yb = -gH - (f - 1) * fH - fH * .2;
      for (let i = 0; i < nw; i++) win(x0 + w * (i + .5) / nw, yb, ww, wh * (f === n - 1 ? .9 : 1));
    }
    // the gable: one window and the hoist beam
    const gyb = -bh - gh * .18;
    win(0, gyb, ww * .9, gh * .36);
    line(S, 0, -bh - gh * .7, 10, -bh - gh * .7 + 2, 5, mixc(C.wood, C.ink, .4), .9);
    line(S, 0, -bh - gh * .7, 0, -bh - gh * .62, 3, mixc(C.wood, C.ink, .4), .8);
    ink(S, [[9, -bh - gh * .7 + 3], [9, -bh - gh * .55]], 1, { a: .7, gaps: 0 });
    // ground floor: door with a fanlight and two steps, a big window
    const dX = x0 + w * (nw === 3 ? .22 : .28), dW = w * .2, dH = gH * .74, doorC = tok(o.door, mixc(C.leafDark, C.ink, .2));
    wsh(S, [[dX - dW / 2, -4], [dX + dW / 2, -4], [dX + dW / 2, -dH], [dX - dW / 2, -dH]], doorC, .85, 2, .5);
    wsh(S, ell(dX, -dH, dW / 2, dW * .35, PI, TAU, 10), glass, .7, 2, .3);
    line(S, dX - dW / 2 - 2, -dH, dX + dW / 2 + 2, -dH, 2.6, frame, .9);
    line(S, dX - dW / 2 - 5, -2, dX + dW / 2 + 5, -2, 4, stoneW, .9);
    win(x0 + w * (nw === 3 ? .66 : .72), -gH * .26, w * .34, gH * .5);
    parts.door = [dX, -dH * .5]; parts.window = [0, -gH - fH * .5]; parts.gable = [0, -bh - gh * .5];
    // ink: the outline of the facade (left edge firmer, light from the left)
    ink(S, [[x0, 0], ...top.slice(0, Math.ceil(top.length / 2))], 2, { a: .8 });
    ink(S, [...top.slice(Math.floor(top.length / 2)), [x1, 0]], 1.6, { a: .65 });
    ink(S, [[x1 + D[0], D[1]], [x1 + D[0], -bh + D[1]], [x1, -bh]], 1.2, { a: .45, gaps: 0 });
    return { S, parts, top: [0, -bh - gh], sh: false };
  });

  // a solid paper underlay in the shape of an object's painted sprite: the washes are translucent, so without it the
  // houses behind a figure show through his coat (alpha thresholded and grown by 2 px, faint cast shadows left out)
  const SOLID = new WeakMap();
  function solidOf(g) {
    if (SOLID.has(g)) return SOLID.get(g);
    const sp = g.spr, w = sp.cv.width, h = sp.cv.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const src = sp.cv.getContext('2d').getImageData(0, 0, w, h).data;
    let cur = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) cur[i] = src[i * 4 + 3] > 105 ? 1 : 0;
    for (let pass = 0; pass < 2; pass++) {
      const nx = new Uint8Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let v = 0;
        for (let dy = -1; dy <= 1 && !v; dy++) {
          const yy = y + dy; if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) { const xx = x + dx; if (xx >= 0 && xx < w && cur[yy * w + xx]) { v = 1; break; } }
        }
        nx[y * w + x] = v;
      }
      cur = nx;
    }
    const c = cv.getContext('2d'), img = c.createImageData(w, h), rgb = WC.rgba(C.paper, 1).match(/\d+/g).map(Number);
    for (let i = 0; i < w * h; i++) if (cur[i]) { img.data[i * 4] = rgb[0]; img.data[i * 4 + 1] = rgb[1]; img.data[i * 4 + 2] = rgb[2]; img.data[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0);
    const out = { cv, x0: sp.x0, y0: sp.y0 };
    SOLID.set(g, out);
    return out;
  }
  function drawSolid(X, g, x, y, a, o = {}) {
    if (a <= 0) return;
    const b = solidOf(g);
    X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot); X.transform(o.flip ? -1 : 1, 0, o.sk || 0, 1, 0, 0);
    X.globalAlpha = clamp(a); X.drawImage(b.cv, b.x0, b.y0); X.restore();
  }
  // a bed of planted tulips in perspective (baked once): three rows, smaller and paler towards the back
  function tulipBed(c, W, H, y0, seed) {
    WC.withSeed(seed * 7 + 41, () => {
      const soil = mixc(C.wood, C.ground, .45);
      WC.wash(c, [[-20, y0 + 30], [W + 20, y0 + 20], [W + 20, H + 20], [-20, H + 20]], soil, .5, 3, 4);
      for (let i = 0; i < 40; i++) {
        const x = rnd(-10, W), y = y0 + 40 + Math.pow(rnd(), .8) * (H - y0);
        WC.drawS(c, mk(qcurve(x, y, x + rnd(60, 160), y + rnd(-3, 3), rnd(-5, 5), 6), rnd(4, 9), pick([soil, dark(soil, .2), lite(soil, .2)]), { prof: 'leaf', nb: 3, a: .25 }));
      }
      const kinds = [{ style: 'broken' }, { style: 'plain', color: 'red' }, { style: 'plain', color: 'clothC' }, { style: 'plain', color: 'gold' }];
      [[y0 + 90, .28, .55, 13], [y0 + 250, .4, .78, 9], [y0 + 470, .58, 1, 6]].forEach(([y, sc, a, n], r) => {
        for (let i = 0; i < n; i++) {
          const g = WC.make('tulip', sc, Object.assign({ shadow: false, lean: Math.round(rnd(-.12, .12) * 100) / 100 }, kinds[(i + r) % kinds.length]), 50 + r * 13 + i);
          WC.drawObj(c, g, (i + .5 + (r % 2 ? .25 : -.1)) / n * W + rnd(-10, 10), y + rnd(-8, 8), 1, { a });
        }
      });
    });
  }

  // ================================================================ shots
  const paperBase = (X, W, H) => { const pp = WC.paper(); if (pp) X.drawImage(pp, 0, 0); else { X.fillStyle = C.paper; X.fillRect(0, 0, W, H); } };

  // ---- the price curve (schematic: a slow start, a near-vertical climb into early February 1637, then the fall)
  SHOTS.wc_tulipmania_chart = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx), crash = P.phase === 'crash';
      const bx0 = portrait ? 130 : 420, bx1 = portrait ? W - 110 : W - 360, by0 = portrait ? 330 : 200, by1 = portrait ? 1075 : 800;
      const S2 = (u, v) => [bx0 + u * (bx1 - bx0), by1 - v * (by1 - by0)];
      const PK = .7;
      const riseUV = [];
      for (let i = 0; i <= 44; i++) { const u = i / 44 * PK, f = u / PK; riseUV.push([u, .05 + .87 * Math.pow(f, 3.4) + .012 * Math.sin(f * 21 + 1) * (1 - f)]); }
      const fallUV = [[PK, riseUV[44][1]], [PK + .025, .7], [PK + .05, .4], [PK + .08, .2], [PK + .12, .11], [PK + .2, .08], [PK + .3, .07]];
      const rise = riseUV.map(([u, v]) => S2(u, v)), fall = fallUV.map(([u, v]) => S2(u, v));
      const peak = rise[rise.length - 1];
      const L = WC.withSeed(seed * 17 + 5, () => {
        const back = document.createElement('canvas'); back.width = W; back.height = H;
        const c = back.getContext('2d'); paperBase(c, W, H);
        // a pale bloom behind the chart and faint pencil guide lines
        WC.blob(c, (bx0 + bx1) / 2, (by0 + by1) / 2, (bx1 - bx0) * .62, (by1 - by0) * .58, mixc(C.skyWarm, C.paper, .45), .32);
        for (let i = 1; i <= 4; i++) { const y = by1 - (by1 - by0) * i / 4.4; WC.drawS(c, mk(qcurve(bx0 + 6, y, bx1, y + rnd(-2, 2), 0, 12), 1.4, C.inkSoft, { prof: 'even', nb: 0, a: .18, rough: .4 })); }
        // axes: two brush strokes
        WC.drawS(c, mk(qcurve(bx0, by0 - 40, bx0 + 2, by1 + 4, rnd(-3, 3), 16), 5, C.ink, { prof: 'even', nb: 3, a: .85, rough: .25 }));
        WC.drawS(c, mk(qcurve(bx0 - 6, by1, bx1 + 30, by1 + rnd(-3, 3), rnd(-3, 3), 18), 5, C.ink, { prof: 'even', nb: 3, a: .85, rough: .25 }));
        WC.drawS(c, mk(WC.polar(bx1 + 30, by1, PI * .83, 18, 0, 3), 4, C.ink, { prof: 'tip', nb: 0, a: .8 }));
        WC.drawS(c, mk(WC.polar(bx1 + 30, by1, -PI * .83, 18, 0, 3), 4, C.ink, { prof: 'tip', nb: 0, a: .8 }));
        WC.drawS(c, mk(WC.polar(bx0, by0 - 40, PI * .67, 18, 0, 3), 4, C.ink, { prof: 'tip', nb: 0, a: .8 }));
        WC.drawS(c, mk(WC.polar(bx0, by0 - 40, PI * .33, 18, 0, 3), 4, C.ink, { prof: 'tip', nb: 0, a: .8 }));
        // a tulip bed along the bottom of the frame (under the subtitle band): soil and rows of planted tulips
        if (portrait) tulipBed(c, W, H, H * .705, seed);
        // the area under the rise: a gold wash (baked, revealed with the line)
        const area = document.createElement('canvas'); area.width = W; area.height = H;
        const ac = area.getContext('2d');
        WC.wash(ac, rise.concat([[peak[0], by1], [bx0, by1]]), mixc(C.gold, C.skyWarm, .4), .34, 3, 3);
        for (let i = 0; i < 9; i++) { const u = rnd(.05, PK - .02), x = S2(u, 0)[0]; const top = rise[Math.round(u / PK * 44)][1]; WC.drawS(ac, mk(qcurve(x, by1 - 4, x + rnd(-6, 6), top + 14, rnd(-6, 6), 8), rnd(10, 22), mixc(C.gold, C.clothC, .4), { prof: 'leaf', nb: 4, a: .18 })); }
        const farea = document.createElement('canvas'); farea.width = W; farea.height = H;
        WC.wash(farea.getContext('2d'), fall.concat([[fall[fall.length - 1][0], by1], [peak[0], by1]]), mixc(C.red, C.paper, .55), .22, 3, 3);
        return {
          back, area, farea,
          line: mk(along(rise, 60), portrait ? 11 : 9, C.ink, { prof: 'even', nb: 4, a: .92, rough: .2 }),
          fline: mk(along(fall, 30), portrait ? 12 : 10, C.red, { prof: 'even', nb: 4, a: .95, rough: .2 }),
        };
      });
      const tul = WC.make('tulip', portrait ? .52 : .42, { shadow: false }, seed + 3);
      const fsz = portrait ? 52 : 44;
      const ptAt = (pts, p) => { const q = clamp(p) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(q)), f = q - i; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f]; };
      const R60 = along(rise, 60), F30 = along(fall, 30);
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(L.back, 0, 0);
          const t0 = WC.timeOf(P.at, cues, .25);
          // title and axis labels
          if (P.title) WC.serif(X, P.title, bx0 + 50, portrait ? by0 + 40 : 120, seg(lt, t0, t0 + 1), { size: portrait ? 80 : 70, align: 'left' });
          const lab = (txt, u, t) => { if (txt) WC.hand(X, txt, S2(u, 0)[0], by1 + fsz * .95, seg(lt, t, t + .8), { size: fsz, align: 'center', col: C.inkSoft }); };
          lab(P.from, .06, t0 + .3);
          lab(P.peak, PK, crash ? t0 + .3 : t0 + 1.2);
          // the rise
          // (the line is resampled by length: a steady brush along it climbs faster and faster up the steep part)
          const p = crash ? eo(seg(lt, t0, t0 + .9)) : WC.ss(seg(lt, t0 + .1, Math.max(t0 + 1.5, dur - .35)));
          if (p > 0) {
            const tip = ptAt(R60, p);
            X.save(); X.beginPath(); X.rect(0, 0, tip[0] + 2, H); X.clip(); X.drawImage(L.area, 0, 0); X.restore();
            WC.drawS(X, L.line, p);
          }
          // the fall
          const tc = crash ? WC.timeOf('crash', cues, dur * .45) : 1e9, q = eio(seg(lt, tc, tc + .6));
          if (q > 0) {
            const tip = ptAt(F30, q);
            X.save(); X.beginPath(); X.rect(peak[0] - 2, 0, tip[0] - peak[0] + 4, H); X.clip(); X.drawImage(L.farea, 0, 0); X.restore();
            WC.drawS(X, L.fline, q);
          }
          // the riding tulip: up the curve, then down the fall, tipping over
          if (p > .02) {
            let pos, rot = 0;
            if (q > 0) { const qq = .78 * eio(seg(lt, tc + .05, tc + .95)); pos = ptAt(F30, qq); rot = .95 * ss(seg(lt, tc, tc + 1.1)); }
            else pos = ptAt(R60, p);
            const bob = q > 0 ? 0 : Math.sin(lt * 2.2) * 3;
            WC.drawObj(X, tul, pos[0], pos[1] - 6 + bob, ss(seg(lt, t0 + .1, t0 + .9)), { rot: rot + Math.sin(lt * 1.6) * .03 });
          }
          // notes
          // notes: by the peak (label to its left), and by the fall (label to its right, red)
          const tw = txt => { X.save(); X.font = WC.font(fsz, 600, 'hand'); const w = X.measureText(txt).width; X.restore(); return w; };
          if (P.note && P.note.text) {
            const tn = WC.timeOf(P.note.at, cues, crash ? t0 + .9 : dur - 1.4);
            const lx = P.note.x != null ? P.note.x * W : peak[0] - 50 - tw(P.note.text), ly = P.note.y != null ? P.note.y * H : peak[1] + (portrait ? 40 : 30);
            WC.note(X, lt, tn, peak[0] - 12, peak[1] + 4, lx, ly, P.note.text, { size: fsz });
          }
          if (P.after && P.after.text && q > 0) {
            // the label sits above the peak (the space under the title), its pen line down to the top of the fall
            const ta = WC.timeOf(P.after.at, cues, tc + .7), w = tw(P.after.text);
            const lx = P.after.x != null ? P.after.x * W : clamp(peak[0] - w * .6, 40, W - 40 - w), ly = P.after.y != null ? P.after.y * H : peak[1] - (portrait ? 120 : 80);
            WC.note(X, lt, ta, peak[0] + 16, peak[1] + 34, lx, ly, P.after.text, { size: fsz, col: C.red, align: 'left' });
          }
        },
      };
    },
  };

  // ---- the winter garden cut open: bulbs asleep in the soil, a promissory note above the snow
  SHOTS.wc_tulipmania_soil = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const gy = H * (portrait ? .44 : .46), n = P.n ?? 3;
      const xs = Array.from({ length: n }, (_, i) => W * (n === 1 ? .5 : .2 + .6 * i / (n - 1)));
      const bsc = portrait ? 1.05 : .95, bb = portrait ? gy + 320 : gy + 460;   // the bulbs' root tips (above the subtitles)
      const L = WC.withSeed(seed * 23 + 9, () => {
        const back = document.createElement('canvas'); back.width = W; back.height = H;
        const c = back.getContext('2d'); paperBase(c, W, H);
        // a cold winter sky
        const g = c.createLinearGradient(0, 0, 0, gy);
        g.addColorStop(0, WC.rgba(mixc(C.sky, C.far, .4), .55)); g.addColorStop(1, WC.rgba(mixc(C.sky, C.paperLight, .3), .4));
        c.fillStyle = g; c.fillRect(0, 0, W, gy + 4);
        WC.softBand(c, -100, W * .8, gy * .35, 90, C.far, .14);
        // a far row of bare trees and a low fence along the garden
        for (let i = 0; i < 5; i++) { const t = WC.make('tree', rnd(.38, .52), { bare: true }, i + 11); WC.drawObj(c, t, W * (.06 + i * .22 + rnd(-.04, .04)), gy - 34, 1, { a: .38 }); }
        for (let x = -10; x < W + 20; x += portrait ? 64 : 80) WC.drawS(c, mk(qcurve(x, gy - 12, x + rnd(-2, 2), gy - 62, 0, 4), 5, mixc(C.wood, C.paper, .3), { prof: 'even', nb: 0, a: .55 }));
        WC.drawS(c, mk(qcurve(-10, gy - 48, W + 10, gy - 46, 4, 20), 4, mixc(C.wood, C.paper, .3), { prof: 'even', nb: 2, a: .5 }));
        // soil: three strata, darker with depth, small stones, a few root hairs
        const topS = mixc(C.wood, C.ground, .45), midS = mixc(C.wood, C.stoneDark, .3), lowS = dark(C.wood, .2);
        const ridge = (y0, amp) => { const pts = []; for (let x = -20; x <= W + 20; x += 20) pts.push([x, y0 + Math.sin(x / 140 + y0) * amp + rnd(-3, 3)]); return pts; };
        WC.wash(c, ridge(gy, 4).concat([[W + 20, H + 20], [-20, H + 20]]), topS, .62, 3, 3);
        WC.wash(c, ridge(gy + (portrait ? 260 : 200), 14).concat([[W + 20, H + 20], [-20, H + 20]]), midS, .38, 3, 3);
        WC.wash(c, ridge(gy + (portrait ? 760 : 470), 18).concat([[W + 20, H + 20], [-20, H + 20]]), lowS, .3, 3, 3);
        for (let i = 0; i < (portrait ? 110 : 90); i++) { const x = rnd(-10, W), y = gy + 30 + Math.pow(rnd(), .9) * (H - gy); WC.drawS(c, mk(qcurve(x, y, x + rnd(40, 140), y + rnd(-4, 4), rnd(-6, 6), 6), rnd(3, 7), pick([topS, midS, dark(topS, .2), lite(topS, .25)]), { prof: 'leaf', nb: 2, a: .22 })); }
        for (let i = 0; i < 26; i++) { const x = rnd(0, W), y = gy + 60 + rnd() * (H - gy - 60); WC.blob(c, x, y, rnd(6, 16), rnd(4, 10), pick([C.stone, C.stoneDark, mixc(C.stone, C.paper, .3)]), .5); }
        // the bed of snow on top: paper left white, a cool shadow under its lip
        const snowTop = ridge(gy - 26, 6), snowBot = ridge(gy + 8, 4).reverse();
        WC.wash(c, snowTop.concat(snowBot), C.paperLight, .95, 3, 2);
        WC.drawS(c, mk(along(snowBot.slice().reverse(), 40), 9, mixc(C.far, C.night, .2), { prof: 'even', nb: 4, a: .32 }));
        WC.drawS(c, mk(along(snowTop, 40), 2.4, C.inkSoft, { prof: 'even', nb: 0, a: .4 }));
        // the cut face of the soil: an ink edge under the snow
        WC.drawS(c, mk(along(ridge(gy + 10, 3), 40), 3.2, C.ink, { prof: 'even', nb: 2, a: .6 }));
        return back;
      });
      const bulbs = xs.map((x, i) => WC.make('tulip_bulb', bsc * (i === 1 ? 1.08 : 1), { sprout: true, peel: false }, seed + i * 7));
      const stick = WC.withSeed(seed + 41, () => { const S = []; S.push(mk(qcurve(0, 0, 1, -110, 0, 6), 7, mixc(C.wood, C.paper, .2), { prof: 'even', nb: 0, a: .9 })); S.push(washShape([[-34, -110], [34, -112], [34, -78], [-34, -76]], mixc(C.paperLight, C.stain, .3), .9, 2, .6)); S.push(mk(qcurve(-22, -94, 22, -95, 2, 5), 2, C.ink, { prof: 'even', nb: 0, a: .6 })); return { S, spr: WC.sprite(S) }; });
      const psc = portrait ? 1.45 : 1.05, paperG = WC.make('tulip_contract', psc, { shadow: false }, seed + 5);
      const fsz = portrait ? 52 : 44;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(L, 0, 0);
          // light snow falling above the ground
          X.save(); X.beginPath(); X.rect(0, 0, W, gy - 20); X.clip(); WC.snow(X, W, H, lt, .55); X.restore();
          // marker sticks, then the bulbs painting themselves in, one after another
          xs.forEach((x, i) => {
            WC.drawObj(X, stick, x + 34, gy - 8, seg(lt, .1 + i * .15, .7 + i * .15), { rot: (i - 1) * .05 });
            const b = bulbs[i], br = Math.sin(lt * .9 + i * 2) * .012;
            WC.drawObj(X, b, x, bb, seg(lt, .25 + i * .3, 1.35 + i * .3), { rot: br });
          });
          if (P.under && P.under.text) {
            const tu = WC.timeOf(P.under.at, cues, 1.4), bx = xs[0];
            WC.note(X, lt, tu, bx + 40 * bsc, bb - 150 * bsc, bx + 150 * bsc, gy + (portrait ? 92 : 70), P.under.text, { size: fsz });
          }
          // the promissory note: painted in above the snow on the cue, dashed lines down to the bulbs
          const tp = WC.timeOf(P.paper, cues, WC.timeOf('paper', cues, dur * .5)), pp = seg(lt, tp - .15, tp + .75);
          if (pp > 0) {
            const px = W * .5, py = portrait ? gy - 120 : gy - 90, sway = Math.sin(lt * 1.1) * .03;
            const lk = ss(seg(lt, tp + .4, tp + 1.2));
            if (lk > 0) {
              X.save(); X.setLineDash([10, 12]); X.lineWidth = 2.4; X.strokeStyle = WC.rgba(C.red, .65 * lk); X.lineCap = 'round';
              for (const x of xs) { X.beginPath(); X.moveTo(px + (x - px) * .2, py - 20); X.quadraticCurveTo((px + x) / 2, py + 60, x, bb - 270 * bsc); X.stroke(); }
              X.restore();
            }
            WC.drawObj(X, paperG, px, py, pp, { rot: -.06 + sway });
            if (P.note && P.note.text) WC.note(X, lt, tp + .5, px + 104 * psc, py - 236 * psc, px + 122 * psc, py - 318 * psc, P.note.text, { size: fsz + 4, col: C.red, w: 700 });
          }
        },
      };
    },
  };

  // ---- a Dutch canal: things standing on a brick quay, mirrored in the water below (the reflection shimmers)
  SHOTS.wc_tulipmania_canal = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const qy = H * (P.horizon ?? (portrait ? .6 : .66)), qh = portrait ? 54 : 40, wy = qy + qh;
      const zoom = P.scale ?? (portrait ? 1.45 : 1);
      const sky = P.sky || 'dusk';
      const L = WC.withSeed(seed * 29 + 3, () => {
        const back = WC.backdrop(W, H, qy, { sky, land: 'none', sun: P.sun ?? false, clouds: P.clouds });
        const c = back.getContext('2d');
        // the quay: a brick face with a stone coping, a few mooring posts
        const brick = mixc(C.roof, C.stoneDark, .45), coping = mixc(C.stone, C.paperLight, .2);
        WC.wash(c, [[-20, qy - 4], [W + 20, qy - 4], [W + 20, wy], [-20, wy]], brick, .78, 3, 2);
        for (let y = qy + 12; y < wy - 2; y += 9) for (let x = -10 + (y % 18 ? 0 : 14); x < W; x += 28) WC.drawS(c, mk([[x, y], [x + 22, y + rnd(-1, 1)]], 2.2, dark(brick, .25), { prof: 'even', nb: 0, a: .3 }));
        WC.wash(c, [[-20, qy - 8], [W + 20, qy - 8], [W + 20, qy + 8], [-20, qy + 8]], coping, .85, 3, 1);
        WC.drawS(c, mk(qcurve(-10, qy - 8, W + 10, qy - 8, 0, 24), 2.6, C.ink, { prof: 'even', nb: 0, a: .6 }));
        WC.drawS(c, mk(qcurve(-10, qy + 9, W + 10, qy + 9, 0, 24), 1.6, C.ink, { prof: 'even', nb: 0, a: .4 }));
        // the street on the quay (a thin band of cobbles between the houses and the edge)
        // the water: the sky's colour, deepening downwards; a dark band in the quay's shadow
        const pp = WC.paper();
        c.save(); c.beginPath(); c.rect(0, wy, W, H - wy); c.clip(); if (pp) c.drawImage(pp, 0, 0);
        const g = c.createLinearGradient(0, wy, 0, H);
        const top = sky === 'storm' ? mixc(C.water, C.smoke, .4) : sky === 'night' ? mixc(C.waterDeep, C.night, .4) : sky === 'dusk' || sky === 'dawn' ? mixc(C.water, C.skyWarm, .35) : C.water;
        g.addColorStop(0, WC.rgba(top, .62)); g.addColorStop(1, WC.rgba(C.waterDeep, .66));
        c.fillStyle = g; c.fillRect(0, wy, W, H - wy);
        WC.band(c, -40, W + 40, wy + 10, 22, dark(C.waterDeep, .3), .35);
        for (let i = 0; i < 22; i++) { const y = wy + 30 + Math.pow(rnd(), 1.3) * (H - wy); WC.band(c, rnd(-100, W), rnd(0, W + 100), y, 4 + (y - wy) / (H - wy) * 9, pick([C.water, C.waterDeep, C.paperLight]), .16); }
        c.restore();
        return back;
      });
      const items = (P.items || []).map((it, k) => {
        const back = it.layer === 'back', sc = Math.round((it.s ?? 1) * (back ? .7 : 1) * zoom * 100) / 100;
        return Object.assign({}, it, { back, obj: WC.make(it.g, sc, it.o || {}, (it.seed ?? k + 1) + seed * 13), x: (it.x ?? .5) * W, y: qy - (back ? (portrait ? 14 : 10) : -2) + (it.dy ?? 0), ph: WC.hash(k + seed) * 6.28 });
      }).sort((a, b) => (b.back - a.back) || a.y - b.y);
      let refl = null;
      const marks = WC.withSeed(seed + 77, () => Array.from({ length: 34 }, () => ({ x: rnd(0, W), y: wy + 16 + Math.pow(rnd(), 1.4) * (H - wy - 16), w: rnd(30, 110), ph: rnd(0, 6.28) })));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(L, 0, 0);
          const prog = it => { if (it.at === -1) return 1; const t0 = WC.timeOf(it.at, cues, .15 + clamp(it.x / W) * .6 + (it.back ? 0 : .4)); return seg(lt, t0, t0 + (it.paint ?? 1.1)); };
          // reflections first (in the water, flipped about the water line, faint); once everything is painted the
          // mirrored picture is baked and drawn in thin strips that ripple sideways
          const done = items.every(it => prog(it) >= 1);
          const mirror = (c, lt_) => {
            for (const it of items) {
              const p = prog(it); if (p <= 0) continue;
              c.save(); c.translate(0, 2 * wy); c.scale(1, -1);
              WC.drawObj(c, it.obj, it.x, it.y, p, { flip: it.flip, a: it.back ? .2 : .26 });
              c.restore();
            }
          };
          if (done) {
            if (!refl) { refl = document.createElement('canvas'); refl.width = W; refl.height = H; mirror(refl.getContext('2d'), lt); }
            for (let y = wy; y < H; y += 8) {
              const k = (y - wy) / (H - wy), dx = Math.sin(y * .045 + lt * 2.1) * (2 + k * 9) + Math.sin(y * .013 - lt * 1.3) * 3;
              X.drawImage(refl, 0, y, W, 8, dx, y, W, 8);
            }
          } else { X.save(); X.beginPath(); X.rect(0, wy, W, H - wy); X.clip(); mirror(X, lt); X.restore(); }
          // water shimmer over the reflections
          for (const m of marks) { const a = .3 * (.5 + .5 * Math.sin(lt * 1.6 + m.ph)); X.strokeStyle = WC.rgba(C.paperLight, a); X.lineWidth = 3; X.lineCap = 'round'; X.beginPath(); const dx = Math.sin(lt * .7 + m.ph) * 14; X.moveTo(m.x + dx, m.y); X.lineTo(m.x + dx + m.w, m.y + 1); X.stroke(); }
          // the things on the quay
          for (const it of items) {
            const p = prog(it); if (p <= 0) continue;
            const sw = it.sway === false ? 0 : (it.obj.sway || 0), sk = sw ? sw * Math.sin(lt * 1.15 + it.ph) : 0;
            if (!it.back && it.solid !== false) drawSolid(X, it.obj, it.x, it.y, ss(seg(p, .45, .85)), { flip: it.flip, sk });
            WC.drawObj(X, it.obj, it.x, it.y, p, { flip: it.flip, sk, a: it.a ?? 1 });
          }
          if (P.birds) WC.birds(X, (P.birds.x ?? .2) * W, (P.birds.y ?? .2) * H, P.birds.n ?? 5, lt, P.birds);
          if (P.weather === 'rain') WC.rain(X, W, H, lt, .9);
          for (const n of P.notes || []) {
            const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || (portrait ? 52 : 44), col = n.color === 'red' ? C.red : C.ink;
            if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col });
            else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
          }
        },
      };
    },
  };

  // ---- a Dutch still life indoors: wall, floor, a window, a table, a vase with a tulip; every main object gets a
  // solid paper underlay so the wall never shows through the vase or the petals
  SHOTS.wc_tulipmania_still = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const gy = H * (P.horizon ?? (portrait ? .6 : .7)), zoom = P.scale ?? (portrait ? 1.45 : 1);
      const back = WC.withSeed(seed * 31 + 7, () => WC.backdrop(W, H, gy, { land: 'interior', wall: P.wall, floor: P.floor, sky: 'none' }));
      const items = (P.items || []).map((it, k) => Object.assign({}, it, {
        obj: WC.make(it.g, Math.round((it.s ?? 1) * zoom * 100) / 100, it.o || {}, (it.seed ?? k + 1) + seed * 13),
        x: (it.x ?? .5) * W, y: it.y != null ? it.y * H : gy, ph: WC.hash(k + seed) * 6.28,
      })).sort((a, b) => a.y - b.y);
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          for (const it of items) {
            const t0 = it.at === -1 ? -9 : WC.timeOf(it.at, cues, .15 + clamp(it.x / W) * .5), pd = it.paint ?? 1.1;
            it.t1 = t0 + pd;
            const p = it.at === -1 ? 1 : seg(lt, t0, t0 + pd);
            if (p <= 0) continue;
            const sw = it.sway === false ? 0 : (it.obj.sway || 0), sk = sw ? sw * Math.sin(lt * 1.15 + it.ph) : 0;
            if (it.solid !== false) drawSolid(X, it.obj, it.x, it.y, ss(seg(p, .45, .85)), { flip: it.flip, sk });
            WC.drawObj(X, it.obj, it.x, it.y, p, { flip: it.flip, sk });
            if (it.obj.live && p >= .7) { X.save(); X.translate(it.x, it.y); X.globalAlpha = ss((p - .7) / .3); it.obj.live(X, lt, it); X.restore(); }
          }
          for (const n of P.notes || []) {
            const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || (portrait ? 52 : 44), col = n.color === 'red' ? C.red : C.ink;
            if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col });
            else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
          }
        },
      };
    },
  };
})();
