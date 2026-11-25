// wc_fork — the fork that scandalised Venice (Stickstory ag-02, 2026-11-25): a Byzantine two-pronged golden table fork,
// a modern four-tined fork, a glazed dish with cut morsels, one morsel, and a candlelit table-top shot in which a hand
// holds the golden fork up (hero) or brings it down, spears a morsel and lifts it.
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic, colours only from WC.C tokens.
//
// Objects (WC.G; origin = the bottom end of the handle / the base centre, y up negative, sc 1 = natural size):
//   fork         style 'byzantine' (default: ≈ 330 px; a slender gold handle with a ball finial, two collars and a
//                baluster, a curved yoke and two long fine prongs) | 'modern' (≈ 320 px; a flat steel handle, four tines)
//                o: {metal: 'gold'|'silver' (byzantine default gold, modern silver)}
//                parts: prongs (the tips) yoke handle knob top bottom grip (where a hand holds it)
//   fork_plate   a shallow glazed dish seen a little from above ≈ 380 × 120 px, a painted ring on the rim, cut morsels
//                of roast meat lying in it. o: {morsels: n (5), col: glaze token}   parts: center rim
//   fork_morsel  one cut morsel of roast meat ≈ 46 px (origin = its centre)
//
// Shot:
//   wc_fork_lift  a table top by candlelight: a wall (wall token) behind, a cloth (floor token), the dish with its
//       morsels, a candle burning on the left (live), a warm glow; a hand in a sleeve with an embroidered cuff holds
//       the golden fork.  lift.at = -1 (hero): the fork is held up, a morsel on its prongs, swaying very slowly.
//       lift.at = s | cue: the hand brings the fork in (from lift.at - 1.3), the prongs come down onto a morsel, spear
//       it at lift.at and lift it up, turning upright (lift.dur, default 1.6).
//       params: {wall, floor, horizon (.46 Short), plate: {x, s, at (paint: s | cue | -1)}, candle: {x, s} | false,
//       fork: {s, style, x, y (where the prongs end up, 0..1), rot (degrees, end angle)}, lift: {at, dur},
//       sleeve: token (default "cloth"), shoulder: [x, y] (0..1, where the arm leaves the frame), rise (px the
//       hero fork rises over the scene, 34), steam: false, notes: [{text, x, y, ax?, ay?, at, color, size, align}]}
'use strict';

(() => {
  const C = WC.C, { rnd, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eio } = WC;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ small painting kit (own copy, same recipes)
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
  const tok = (v, fb) => (v ? WC.col(v) : fb);
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
  const add = (S, s) => (S.push(s), s);
  const wsh = (S, pts, c, a = .5, passes = 3, jit = 1.2) => add(S, washShape(pts, c, a, passes, jit));
  const brush = (S, pts, w, c, o = {}) => add(S, mk(pts, w, c, o));
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
  const inkC = (S, pts, w, o) => ink(S, pts.concat([pts[0]]), w, o);
  const dot = (S, x, y, r, c = C.ink, a = .85) => { const s = mk([[x - r * .5, y], [x, y - r * .1], [x + r * .5, y]], r * 1.8, c, { prof: 'leaf', nb: 0, a, rough: .2 }); s.fine = true; S.push(s); return s; };
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
  // generator wrapper: optional ground shadow, scale, scaled parts (origin kept where the generator put it)
  function def(name, fn) {
    WC.G[name] = (sc = 1, o = {}) => {
      const r = fn(o) || {}, S = r.S || [];
      let pre = [];
      if (o.shadow !== false && r.sh && S.length) {
        const sc_ = mixc(C.stoneDark, C.night, .3), [cx, cy, rx, ry] = r.sh;
        pre = [washShape(WC.blobPts(cx, cy, rx * 1.1, ry * 1.5, 30, .1), sc_, .12, 3, 3), washShape(WC.blobPts(cx + rx * .05, cy, rx * .8, ry * .7, 26, .08), sc_, .2, 3, 2)];
      }
      const all = pre.concat(S);
      scaleList(all, sc);
      const out = { S: all, parts: {} };
      if (r.parts) for (const k in r.parts) out.parts[k] = [r.parts[k][0] * sc, r.parts[k][1] * sc];
      return out;
    };
  }
  // a tapered bar from (x0, y0) to (x1, y1), widths w0 → w1: a polygon
  function bar(x0, y0, x1, y1, w0, w1, n = 6) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, a = [], b = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + dx * t, y = y0 + dy * t, w = (w0 + (w1 - w0) * t) / 2; a.push([x + nx * w, y + ny * w]); b.push([x - nx * w, y - ny * w]); }
    return a.concat(b.reverse());
  }
  // paint a metal piece: wash, a darker side, a paper-light glint, ink on the shadow edge
  function metalPiece(S, poly, base, o = {}) {
    wsh(S, poly, base, o.a ?? .72, 3, .5);
    const n = poly.length / 2 | 0, right = poly.slice(n), left = poly.slice(0, n);
    if (o.shade !== false) brush(S, along(right, 8), o.sw ?? 3, dark(base, .35), { prof: 'leaf', nb: 2, a: .5 });
    if (o.glint !== false) brush(S, along(left, 8).slice(1, -1), o.gw ?? 2.2, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
    ink(S, right, o.iw ?? 1.4, { a: .75, gaps: 0 });
    ink(S, left, (o.iw ?? 1.4) * .7, { a: .45, gaps: 0 });
  }
  const METAL = {
    gold: () => mixc(C.gold, C.clothC, .32),
    silver: () => mixc(C.far, C.paperLight, .25),
  };

  // ================================================================ fork
  def('fork', o => {
    const S = [], parts = {}, st = o.style || 'byzantine';
    if (st === 'modern') {
      const m = (METAL[o.metal] || METAL.silver)(), L = 320;
      // flat handle widening to a rounded end, a narrow neck, a broad head, four tines
      const hd = [[-7, -150], [-15, -70], [-19, -16], [-14, -2], [0, 2], [14, -2], [19, -16], [15, -70], [7, -150]];
      metalPiece(S, hd, m, { sw: 5, gw: 4 });
      brush(S, [[-6, -24], [-9, -80], [-4, -140]], 4, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
      const head = [[-7, -150], [-24, -196], [-26, -222], [26, -222], [24, -196], [7, -150]];
      wsh(S, head, m, .72, 3, .5); ink(S, head.slice(3), 1.4, { a: .7, gaps: 0 }); ink(S, head.slice(0, 3), 1, { a: .45, gaps: 0 });
      brush(S, [[-4, -160], [-14, -200]], 3, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
      for (let k = 0; k < 4; k++) {
        const x = -19.5 + k * 13, T = bar(x, -220, x * 1.02, -L, 9, 5, 6);
        metalPiece(S, T, m, { sw: 2, gw: 1.4, iw: 1.1 });
      }
      Object.assign(parts, { prongs: [0, -L], yoke: [0, -200], handle: [8, -80], knob: [0, -8], top: [0, -L], bottom: [0, 0], grip: [0, -60] });
      return { S, parts };
    }
    const g = (METAL[o.metal] || METAL.gold)(), gd = dark(g, .3);
    // ball finial
    const knob = ell(0, -12, 11, 12, 0, TAU, 24);
    wsh(S, knob, g, .75, 3, .4); brush(S, ell(-3, -15, 5, 6, PI * .8, PI * 1.6, 8), 3, C.paperLight, { prof: 'leaf', nb: 0, a: .7 }); inkC(S, knob, 1.3, { a: .7, gaps: 0 });
    // slender shaft in three lengths with collars and a baluster between them
    metalPiece(S, bar(0, -22, 0, -96, 12, 10), g, { sw: 4, gw: 3 });
    const balu = [[-5, -96], [-11, -112], [-13, -126], [-9, -140], [-4.6, -148], [4.6, -148], [9, -140], [13, -126], [11, -112], [5, -96]];
    metalPiece(S, balu, g, { sw: 3.5, gw: 2.6 });
    metalPiece(S, bar(0, -148, 0, -206, 9.5, 8.5), g, { sw: 3.5, gw: 2.6 });
    for (const y of [-24, -96, -148, -206]) {
      const R = ell(0, y, 10.5, 3.8, 0, TAU, 14);
      wsh(S, R, gd, .7, 2, .2); ink(S, R.slice(0, 8), 1, { a: .6, gaps: 0 });
    }
    // fine engraved spiral on the lower shaft
    for (let k = 0; k < 6; k++) { const y = -32 - k * 11; ink(S, [[-4, y + 3], [4, y - 3]], .8, { a: .45, gaps: 0, col: gd }); }
    // the curved yoke (a shallow U) joining the shaft to the two prongs
    const yk = [[-4, -206], [-14, -213], [-21, -227], [-24, -241], [-15, -243], [-10, -233], [0, -228], [10, -233], [15, -243], [24, -241], [21, -227], [14, -213], [4, -206]];
    metalPiece(S, yk, g, { sw: 3, gw: 2.4 });
    // two long fine prongs, tapering to points
    for (const sd of [-1, 1]) {
      const P = bar(sd * 19.5, -238, sd * 17, -332, 8.5, 1.6, 8);
      metalPiece(S, P, g, { sw: 2.2, gw: 1.6, iw: 1.1 });
    }
    dot(S, 0, -234, 2.4, gd, .7);
    brush(S, [[-2.5, -30], [-2, -94]], 2.6, C.paperLight, { prof: 'leaf', nb: 2, a: .6 });          // light running down the handle
    brush(S, [[-2, -152], [-1.8, -202]], 2.2, C.paperLight, { prof: 'leaf', nb: 1, a: .55 });
    Object.assign(parts, { prongs: [0, -330], yoke: [16, -232], handle: [8, -125], knob: [10, -12], top: [0, -332], bottom: [0, 0], grip: [0, -70] });
    return { S, parts };
  });

  // ================================================================ morsel
  function morselStrokes(S, cx, cy, r) {
    const meat = mixc(C.wood, C.fire, .28), sear = dark(C.wood, .3), B = WC.blobPts(cx, cy, r * 1.05, r * .72, 18, .2);
    wsh(S, B, meat, .85, 3, r * .05); wsh(S, WC.blobPts(cx, cy, r * .9, r * .6, 16, .2), meat, .4, 2, r * .04);
    wsh(S, WC.blobPts(cx + r * .2, cy + r * .2, r * .7, r * .4, 14, .2), sear, .35, 2, r * .03);
    brush(S, qcurve(cx - r * .6, cy - r * .3, cx + r * .2, cy - r * .5, -r * .1, 5), r * .22, mixc(meat, C.gold, .4), { prof: 'leaf', nb: 0, a: .55 });
    for (let k = 0; k < 2; k++) brush(S, qcurve(cx - r * .5 + k * r * .5, cy + r * .1, cx - r * .1 + k * r * .5, cy - r * .2, 2, 4), 2, sear, { prof: 'tip', nb: 0, a: .55 });
    ink(S, B.slice(4, 14), 1.1, { a: .6, gaps: 0 });
  }
  def('fork_morsel', () => { const S = []; morselStrokes(S, 0, 0, 24); return { S, parts: { center: [0, 0] } }; });

  // ================================================================ dish
  def('fork_plate', o => {
    const S = [], glaze = tok(o.col, mixc(C.paperLight, C.stone, .35)), ring = mixc(C.clothB, C.paper, .25);
    const rx = 190, ry = 58, cy = -ry - 8;
    // foot ring and body
    wsh(S, ell(0, cy + 14, rx * .62, ry * .55, 0, PI, 20).concat(ell(0, cy + 2, rx * .62, ry * .45, PI, 0, 20)), dark(glaze, .25), .5, 2, .6);
    const outer = ell(0, cy, rx, ry, 0, TAU, 64), inner = ell(0, cy + 4, rx * .72, ry * .66, 0, TAU, 56);
    wsh(S, outer, glaze, .62, 3, .8);
    wsh(S, ell(0, cy + 3, rx, ry, .1, PI - .1, 30).concat(ell(0, cy + 1, rx * .9, ry * .8, PI - .2, .2, 26)), dark(glaze, .18), .35, 2, .5);
    // the painted ring on the rim and a few strokes of a leaf scroll
    brush(S, ell(0, cy + 2, rx * .86, ry * .82, 0, TAU, 64), 5, ring, { prof: 'even', nb: 2, a: .55 });
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + .2, x = Math.cos(a) * rx * .93, y = cy + 2 + Math.sin(a) * ry * .9; brush(S, qcurve(x - 7, y, x + 7, y, -3, 4), 3, ring, { prof: 'leaf', nb: 0, a: .5 }); }
    // the well of the dish: a little darker, its far edge in shadow
    wsh(S, inner, dark(glaze, .08), .45, 2, .5);
    brush(S, ell(0, cy + 4, rx * .72, ry * .66, PI * 1.05, PI * 1.95, 20), 6, dark(glaze, .3), { prof: 'leaf', nb: 2, a: .35 });
    brush(S, ell(0, cy, rx * .95, ry * .92, PI * 1.1, PI * 1.45, 10), 5, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
    ink(S, ell(0, cy, rx, ry, -.1, PI + .1, 40), 1.8, { a: .75 });
    ink(S, ell(0, cy, rx, ry, PI + .1, TAU - .1, 30), 1.1, { a: .45 });
    // morsels lying in the dish
    const n = o.morsels ?? 5, spots = [[-70, 0], [-20, -12], [32, 6], [78, -6], [-44, 22], [10, 26]];
    for (let k = 0; k < Math.min(n, spots.length); k++) morselStrokes(S, spots[k][0], cy + 6 + spots[k][1], 21 + (k % 3) * 2);
    return { S, parts: { center: [0, cy + 4], rim: [rx * .9, cy] }, sh: [10, -2, rx * .9, 10] };
  });

  // ================================================================ the hand and sleeve (baked once): hand at the origin, sleeve along +x
  // watercolour helpers for the sleeve and hand: a pooled darker edge, granulating patches inside a shape
  const insideP = (P, x, y) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi) r = !r; } return r; };
  function pool(S, P, c, w = 3, a = .24) { const L = polyLen(P); if (L < 10) return; S.push(mk(along(P, Math.max(6, Math.min(60, Math.round(L / 9)))), w, c, { prof: 'even', nb: 0, a, rough: .55 })); }
  function patches(S, P, c, n = 3, a = .12, rk = .2) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const R = Math.min(x1 - x0, y1 - y0) * rk;
    for (let k = 0, tries = 0; k < n && tries < 60; tries++) {
      const x = rnd(x0, x1), y = rnd(y0, y1); if (!insideP(P, x, y)) continue;
      const B = WC.blobPts(x, y, R * rnd(.7, 1.4), R * rnd(.4, .8), 18, .25); if (!B.every(([u, v]) => insideP(P, u, v))) continue;
      k++; wsh(S, B, c, a, 2, R * .05);
    }
  }
  function armSprite(sc, seed, sleeveTok) {
    return WC.withSeed(seed, () => {
      const S = [], cl = tok(sleeveTok, C.cloth), sk = mixc(C.skin, C.wood, .1), gd = METAL.gold();
      // sleeve: a pale first wash, a second smaller wash, granulating patches, folds in dry brush, a paper-white light
      // along the top, the colour pooling dark along the shadow edge
      const sleeve = [[34, -30], [200, -50], [520, -56], [760, -60], [760, 70], [520, 66], [200, 52], [34, 28]];
      wsh(S, sleeve, lite(cl, .25), .5, 3, 3.5);
      wsh(S, [[60, -14], [220, -30], [520, -34], [760, -36], [760, 66], [520, 60], [200, 46], [60, 24]], cl, .45, 3, 3);
      patches(S, sleeve, dark(cl, .15), 7, .16, .3);
      for (let k = 0; k < 9; k++) { const x = 70 + k * 75 + rnd(-15, 15); brush(S, qcurve(x, rnd(-44, -24), x + rnd(30, 60), rnd(30, 56), rnd(-14, 14), 7), rnd(7, 13), dark(cl, .32), { prof: 'leaf', nb: 7, a: .3 }); }
      for (let k = 0; k < 3; k++) brush(S, qcurve(70 + k * 30, -26 + k * 3, 760, -46 + k * 6, rnd(-8, 8), 14), rnd(5, 9), C.paperLight, { prof: 'leaf', nb: 6, a: .42 });
      brush(S, [[60, 26], [300, 44], [760, 56]], 18, dark(cl, .35), { prof: 'leaf', nb: 8, a: .32 });
      pool(S, sleeve.slice(4), dark(cl, .45), 4, .35);
      ink(S, sleeve.slice(4), 1.3, { a: .4 });
      // the embroidered gold cuff with pearls: wash, darker band, glints, a little ink
      const cuff = [[26, -32], [62, -36], [66, 34], [28, 30]];
      wsh(S, cuff, lite(gd, .15), .6, 3, 1.2); wsh(S, [[46, -34], [62, -36], [66, 34], [48, 32]], dark(gd, .2), .4, 2, .8);
      brush(S, [[32, -26], [34, 24]], 4, C.paperLight, { prof: 'leaf', nb: 2, a: .5 });
      pool(S, cuff.concat([cuff[0]]), dark(gd, .45), 2.2, .4);
      for (let k = 0; k < 4; k++) dot(S, 45, -22 + k * 16, 3.4, lite(C.paperLight, .5), .9);
      // the hand, closed round the handle: light skin wash, a shadow wash under the fingers, knuckle lights
      const hand = WC.blobPts(4, 2, 34, 26, 22, .16);
      wsh(S, hand, lite(sk, .1), .62, 3, 1.6);
      wsh(S, WC.blobPts(8, 6, 28, 20, 20, .2), sk, .4, 2, 1.4);
      wsh(S, WC.blobPts(14, 14, 22, 12, 16, .25), dark(sk, .3), .36, 2, 1.2);
      for (let k = 0; k < 4; k++) {
        const y = -16 + k * 10;
        brush(S, qcurve(18, y, -24, y + 3, -6, 8), 9, mixc(sk, C.fire, .08), { prof: 'leaf', nb: 4, a: .42 });
        brush(S, qcurve(-6, y - 2, -22, y + 1, -2, 5), 3, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });
        pool(S, qcurve(18, y + 4.5, -24, y + 7.5, -6, 8), dark(sk, .45), 1.6, .38);
        wsh(S, qcurve(18, y + 3, -22, y + 6, -6, 8).concat(qcurve(-22, y + 8.5, 18, y + 5.5, 6, 8)), dark(sk, .3), .3, 2, .4);   // crease shadow
      }
      brush(S, qcurve(14, -20, -16, -30, -6, 6), 10, sk, { prof: 'leaf', nb: 3, a: .5 });
      dot(S, 32, -6, 3.5, dark(gd, .1), .9);                                  // a ring on one finger
      pool(S, hand.slice(0, Math.floor(hand.length * .6)), dark(sk, .5), 2, .4);
      scaleList(S, sc);
      const g = { S }; g.spr = WC.sprite(S); return g;
    });
  }
  // a paper underlay in the shape of a sprite (the washes are translucent: the wall must not show through the gold)
  const SOLID = new WeakMap();
  function solidOf(g) {
    if (SOLID.has(g)) return SOLID.get(g);
    const sp = g.spr, w = sp.cv.width, h = sp.cv.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const src = sp.cv.getContext('2d').getImageData(0, 0, w, h).data;
    let cur = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) cur[i] = src[i * 4 + 3] > 120 ? 1 : 0;
    for (let pass = 0; pass < 2; pass++) {
      const nx = new Uint8Array(w * h);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) { const i = y * w + x; nx[i] = cur[i] && cur[i - 1] && cur[i + 1] && cur[i - w] && cur[i + w] ? 1 : 0; }
      cur = nx;
    }
    const c = cv.getContext('2d'), img = c.createImageData(w, h), rgb = WC.rgba(C.paperLight, 1).match(/\d+/g).map(Number);
    for (let i = 0; i < w * h; i++) if (cur[i]) { img.data[i * 4] = rgb[0]; img.data[i * 4 + 1] = rgb[1]; img.data[i * 4 + 2] = rgb[2]; img.data[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0);
    const out = { cv, x0: sp.x0, y0: sp.y0 };
    SOLID.set(g, out);
    return out;
  }
  function drawSolid(X, g, x, y, a, rot = 0) {
    if (a <= 0) return;
    const b = solidOf(g);
    X.save(); X.translate(x, y); if (rot) X.rotate(rot); X.globalAlpha = clamp(a); X.drawImage(b.cv, b.x0, b.y0); X.restore();
  }
  const notes = (X, W, H, lt, cues, list, portrait) => {
    for (const n of list || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || (portrait ? 52 : 44), col = n.color === 'red' ? C.red : C.ink;
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col, align: n.align });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
    }
  };

  // ================================================================ shot
  SHOTS.wc_fork_lift = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const gy = H * (P.horizon ?? (portrait ? .46 : .58)), zoom = portrait ? 1.45 : 1;
      const Pp = P.plate || {}, Pf = P.fork || {}, Pc = P.candle === false ? null : (P.candle || {});
      const px = (Pp.x ?? .5) * W, psc = Math.round((Pp.s ?? 1.15) * zoom * 100) / 100;
      const plate = WC.make('fork_plate', psc, { morsels: Pp.morsels ?? 4 }, seed + 3);
      const py = Math.min(H * .66, gy + (H - gy) * .42);
      const fsc = Math.round((Pf.s ?? 1.25) * zoom * 100) / 100;
      const fork = WC.make('fork', fsc, { shadow: false, style: Pf.style || 'byzantine' }, seed + 5);
      const morsel = WC.make('fork_morsel', psc, {}, seed + 7);
      const arm = armSprite(fsc * .95, seed * 17 + 3, P.sleeve);
      const candle = Pc ? WC.make('candle', Math.round((Pc.s ?? .75) * zoom * 100) / 100, { holder: true }, seed + 9) : null;
      const cx = (Pc && Pc.x != null ? Pc.x : .16) * W, cyy = gy + (H - gy) * .16;
      // the backdrop, with a warm candle glow baked into it
      const back = WC.withSeed(seed * 31 + 5, () => {
        const cv = WC.backdrop(W, H, gy, { land: 'interior', sky: 'none', wall: P.wall || 'stoneDark', floor: P.floor || 'cloth' });
        const c = cv.getContext('2d'), gx = Pc ? cx + W * .12 : W * .5, gyy = gy - H * .08, r = W * .75;
        const g = c.createRadialGradient(gx, gyy, 0, gx, gyy, r);
        g.addColorStop(0, WC.rgba(C.gold, .32)); g.addColorStop(.45, WC.rgba(C.skyWarm, .16)); g.addColorStop(1, WC.rgba(C.skyWarm, 0));
        c.fillStyle = g; c.fillRect(0, 0, W, H);
        return cv;
      });
      // geometry: grip (hand) position + fork angle. Local fork frame: prongs up (-y); grip at parts.grip.
      const gripL = fork.parts.grip, tipL = fork.parts.prongs, reach = gripL[1] - tipL[1];   // grip → tips distance
      const attach = reach - 26 * fsc;                                                     // morsel centre: just below the tips
      const mOn = [px + 38 * psc, py + plate.parts.center[1] + 4 * psc];                   // the morsel lying in the dish
      const endTip = [(Pf.x ?? .48) * W, (Pf.y ?? .34) * H], endA = (Pf.rot ?? -14) * PI / 180;
      const gripFor = (tip, a) => [tip[0] - Math.sin(a) * attach, tip[1] + Math.cos(a) * attach];
      const a0 = -.8 * PI, g0 = gripFor(mOn, a0), g1 = gripFor(endTip, endA);
      const shoulder = P.shoulder ? [P.shoulder[0] * W, P.shoulder[1] * H] : [W * 1.3, H * .92];
      const La = P.lift || {}, hero = La.at === -1 || La.at == null;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          if (candle) {
            WC.drawObj(X, candle, cx, cyy, 1);
            if (candle.live) { X.save(); X.translate(cx, cyy); candle.live(X, lt, {}); X.restore(); }
          }
          const pa = Pp.at ?? -1, pt = WC.timeOf(pa, cues, 0), pp = pa === -1 ? 1 : seg(lt, pt, pt + 1.1);
          drawSolid(X, plate, px, py, ss(seg(pp, .4, .8)));
          WC.drawObj(X, plate, px, py, pp);
          if (P.steam !== false && pp >= 1) for (let i = 0; i < 2; i++) WC.smoke(X, px + (i ? 50 : -60) * psc, py + plate.parts.center[1], H * .2, lt + 3 + i * 1.7, i + 4, .16, .5);
          let grip, a, carried;
          if (hero) {
            const sw = Math.sin(lt * 1.1) * .05, rise = (P.rise ?? 34) * eio(seg(lt, 0, Math.max(1, dur)));
            a = endA + sw; grip = [g1[0] + Math.sin(lt * .7) * 8, g1[1] + 20 - rise + Math.sin(lt * .9 + 1) * 5]; carried = true;
          } else {
            const t0 = WC.timeOf(La.at, cues, 1.2), d = La.dur ?? 1.6;
            const fin = eio(seg(lt, t0 - 1.3, t0)), up = eio(seg(lt, t0 + .25, t0 + .25 + d));
            const gIn = [WC.mix(shoulder[0] - 200, g0[0], fin), WC.mix(shoulder[1] - 300, g0[1], fin)];
            grip = [WC.mix(gIn[0], g1[0], up), WC.mix(gIn[1], g1[1], up) - Math.sin(PI * up) * 60];
            a = WC.mix(a0 + (1 - fin) * .5, endA, up) + (up >= 1 ? Math.sin((lt - t0) * .9) * .02 : 0);
            carried = lt >= t0;
            if (!carried) WC.drawObj(X, morsel, mOn[0], mOn[1], pp);
          }
          // fork, then the morsel on its prongs, then the hand over the handle
          X.save(); X.translate(grip[0], grip[1]); X.rotate(a);
          X.translate(-gripL[0], -gripL[1]);
          drawSolid(X, fork, 0, 0, 1);
          WC.drawObj(X, fork, 0, 0, 1);
          X.restore();
          if (carried) {
            const mx = grip[0] + Math.sin(a) * attach, my = grip[1] - Math.cos(a) * attach;
            drawSolid(X, morsel, mx, my, 1, a); WC.drawObj(X, morsel, mx, my, 1, { rot: a });
          }
          const aa = Math.atan2(shoulder[1] - grip[1], shoulder[0] - grip[0]);
          drawSolid(X, arm, grip[0], grip[1], 1, aa);
          X.save(); X.translate(grip[0], grip[1]); X.rotate(aa); X.drawImage(arm.spr.cv, arm.spr.x0, arm.spr.y0); X.restore();
          notes(X, W, H, lt, cues, P.notes, portrait);
        },
      };
    },
  };
})();
