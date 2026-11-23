// wc_catalhoyuk — Çatalhöyük (Neolithic, Konya plain, c. 7400–5600 BC): a town of flat-roofed mudbrick houses built
// wall against wall, with no streets and no doors in the walls. People walked over the roofs and climbed down a ladder
// through a hatch in the roof (the same hole let the oven smoke out and the light in); the dead lay under the plastered
// floors and platforms of the houses. Written for videos/2026-11-23/03-catalhoyuk.json (docs/SULUBOYA.md §9).
//
// objects (WC.G; in a wc_scene item or a wc_specimen):
//   catal_house  one house seen from outside: hand-plastered mudbrick walls with no door and no window, a thick earthen
//                roof slab (beam ends showing) seen a little from above, a hatch in the roof with a ladder standing out of
//                it. o: {w, h (×), ladder: true|false, n: houses wall to wall (the middle one has the ladder),
//                smoke: true (smoke rising from the hatch), climber: true (a woman with a basket climbing up out of the
//                hatch, live), walker: true (someone walking along the first roof, live)}
//   catal_town   a cluster of such houses stepping up a mound (höyük), three rows wall to wall, roofs at different
//                heights, hatches and ladders. o: {rows (3), smoke: n (threads of smoke, live), walkers: n (people
//                walking slowly over the front roofs, live), w (×), person (walker scale), glow: true (night: moonlit
//                walls, firelight glowing up out of every hatch)}
// shots:
//   wc_catalhoyuk_plan   the town from above as an excavation plan: rooms wall to wall paint in from the middle, each with
//                        its roof hatch and ladder; a hand note at a cue. params: {note: {text, at, color, x, y}, smoke}
//   wc_catalhoyuk_house  one house cut open: the room, the platform, the oven under the roof hatch, a shaft of light, a
//                        woman climbing down the ladder. params: {at (when she starts down: s | cue), smoke: true}
//   wc_catalhoyuk_grave  close section at the floor: the plastered platform and floor, the earth under it; a crouched
//                        burial paints in at a cue. params: {at (burial: s | cue), night: true (dark room, embers,
//                        an adult and a child asleep on the platform, the burial right under them), note: {text, at}}
//   wc_catalhoyuk_mound  the mound in section: a row of houses, people walking over the roofs, burials under every floor,
//                        older houses under them. params: {at (burials: s | cue), notes: [{text, at, x, y, ax, ay, color}]}
// Colours only from WC.C tokens; deterministic (WC.withSeed / WC.rnd, no Math.random).
'use strict';

(() => {
  const C = WC.C;
  const { G, rnd, pick, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eio } = WC;

  // ------------------------------------------------------------ colours (pamuk / any paper set)
  const MUD = () => mixc(mixc(C.ground, C.stoneDark, .38), C.roof, .14);
  const ROOF = () => mixc(MUD(), C.paper, .28);
  const PLASTER = () => mixc(C.paperLight, C.stone, .2);
  const SOIL = () => mixc(C.ground, C.stoneDark, .48);
  const DARK = () => mixc(C.ink, C.wood, .35);
  const BONE = () => mixc(C.paperLight, C.stone, .35);
  const WOOD = () => mixc(C.wood, C.ink, .15);

  // ------------------------------------------------------------ painting helpers (stroke lists)
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  function sub(pts, n = 3) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  function dims(pts) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return [x0, y0, x1, y1];
  }
  function wash(S, pts, colour, a = .8, o = {}) {
    const [x0, y0, x1, y1] = dims(pts), m = Math.min(x1 - x0, y1 - y0);
    const mis = o.mis ?? Math.min(3, m * .04), dx = rnd(-mis, mis), dy = rnd(-mis, mis);
    S.push(washShape((o.n === 0 ? pts : sub(pts, o.n ?? 3)).map(([x, y]) => [x + dx, y + dy]), colour, a, o.passes ?? 3, o.jit ?? Math.min(2.6, .6 + m * .04)));
  }
  function spans(P, y) {
    const xs = [];
    for (let i = 0; i < P.length; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
    }
    xs.sort((a, b) => a - b);
    const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
    return out;
  }
  // dry-brush strokes across a polygon (rows; dir 'v' = columns)
  function rows(S, pts, colour, o = {}) {
    const v = o.dir === 'v', P = v ? pts.map(([x, y]) => [y, x]) : pts;
    let y0 = 1e9, y1 = -1e9; for (const p of P) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const gap = o.gap ?? 12, w = o.w ?? gap * 1.2, ins = o.inset ?? 2;
    for (let y = y0 + gap * .5; y < y1 - gap * .15; y += gap * rnd(.85, 1.15)) {
      for (const [a, b] of spans(P, y)) {
        let xa = a + ins, xb = b - ins;
        if (o.broken) { const L = xb - xa; xa += rnd(0, L * o.broken); xb -= rnd(0, L * o.broken); }
        if (xb - xa < Math.max(2, w * .5)) continue;
        const pp = qcurve(xa, y, xb, y + rnd(-.15, .15) * w, rnd(-.2, .2) * w, Math.max(4, Math.min(16, Math.round((xb - xa) / 14))));
        S.push(mk(v ? pp.map(([x, yy]) => [yy, x]) : pp, w, colour, { prof: 'even', nb: o.nb ?? 0, a: (o.a ?? .3) * rnd(.75, 1.15), rough: .3 }));
      }
    }
  }
  // a painted surface: a wash, then a few dry-brush passes in the same pigment
  function face(S, pts, colour, o = {}) {
    wash(S, pts, colour, o.a ?? .7, o);
    const [x0, y0, x1, y1] = dims(pts), span = o.dir === 'v' ? x1 - x0 : y1 - y0;
    if (o.tex === false || Math.min(x1 - x0, y1 - y0) < 14) return;
    const gap = o.gap ?? Math.max(7, Math.min(16, span / 6));
    rows(S, pts, o.tcol || mixc(colour, C.stoneDark, .2), { dir: o.dir, gap, w: gap * 1.3, a: o.ta ?? .16, nb: Math.round(Math.max(3, Math.min(7, gap / 2.5))), broken: .1 });
  }
  function line(S, x0, y0, x1, y1, w, colour = C.ink, a = .8, o = {}) {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < .5) return;
    S.push(mk(qcurve(x0, y0, x1, y1, o.bend ?? rnd(-1, 1) * Math.min(2, L * .015), Math.max(3, Math.min(14, Math.round(L / 9)))), w, colour,
      { prof: o.prof || 'even', nb: o.nb ?? 0, a, rough: o.rough ?? .3 }));
  }
  function pen(S, pts, w = 2, a = .8, colour = C.ink, closed = false, skip = 0) {
    const n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      if (skip && rnd() < skip) continue;
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n], L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) continue;
      const ux = (x1 - x0) / L, uy = (y1 - y0) / L, e0 = rnd(-1.5, 2.5), e1 = rnd(-1.5, 2.5);
      line(S, x0 - ux * e0, y0 - uy * e0, x1 + ux * e1, y1 + uy * e1, w * rnd(.85, 1.15), colour, a);
    }
  }
  // a broken dry-brush line along a polyline (an edge painted, not drawn): pieces with gaps, bristles
  function dry(S, pts, w, colour, a = .5) {
    const P = along(pts, Math.max(6, Math.round(pts.reduce((s, p, i) => s + (i ? Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0) / 18)));
    let i = 0;
    while (i < P.length - 1) {
      const n = Math.min(P.length - 1 - i, 2 + Math.floor(rnd(0, 4)));
      if (rnd() < .82) S.push(mk(P.slice(i, i + n + 1), w * rnd(.7, 1.2), colour, { prof: 'brush', nb: 3, a: a * rnd(.7, 1.1), rough: .4 }));
      i += n;
    }
  }
  function stains(S, x0, y0, x1, y1, colour, n = 3, a = .1) {
    for (let i = 0; i < n; i++) {
      const rx = rnd(.1, .26) * (x1 - x0), ry = rnd(.1, .26) * (y1 - y0);
      S.push(washShape(WC.blobPts(rnd(x0 + rx, x1 - rx), rnd(y0 + ry, y1 - ry), rx, ry, 14, .3), colour, a, 2, 2));
    }
  }
  // a hand-made rectangle: every edge subdivided and nudged, so walls bulge and lean a little
  function rough(x0, y0, x1, y1, j = 4, n = 5) {
    const out = [], corners = [[x0 + rnd(-j, j) * .6, y0 + rnd(-j, j) * .5], [x1 + rnd(-j, j) * .6, y0 + rnd(-j, j) * .5], [x1 + rnd(-j, j) * .4, y1], [x0 + rnd(-j, j) * .4, y1]];
    for (let e = 0; e < 4; e++) {
      const a = corners[e], b = corners[(e + 1) % 4], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, bow = rnd(-j, j) * .7;
      for (let k = 0; k < n; k++) { const f = k / n, off = Math.sin(Math.PI * f) * bow + (k ? rnd(-j, j) * .35 : 0); out.push([a[0] + dx * f - dy / L * off, a[1] + dy * f + dx / L * off]); }
    }
    return out;
  }
  // a thin plaster crack: a short zigzag of ink
  function crack(S, x, y, len, a = .35) {
    const pts = [[x, y]]; let cx = x, cy = y;
    for (let i = 0; i < 4; i++) { cx += rnd(-5, 5); cy += len / 4; pts.push([cx, cy]); }
    pen(S, pts, 1.1, a, mixc(C.ink, C.stoneDark, .3));
  }
  function scaleL(S, k) {
    if (k === 1) return S;
    const f = ([x, y]) => [x * k, y * k];
    for (const s of S) {
      s.pts = s.pts.map(f);
      if (s.poly) { s.poly = s.poly.map(r => r.map(f)); continue; }
      s.ws = s.ws.map(w => Math.max(.55, w * k));
      if (s.br) for (const b of s.br) { b.bw = Math.max(.45, b.bw * k); b.dash = b.dash.map(d => Math.max(.5, d * k)); }
    }
    return S;
  }
  // a ladder of two rails from (x0, y0) (foot) to (x1, y1) (top), rails `gap` apart (horizontal), rungs every `step`
  function ladder(S, x0, y0, x1, y1, gap = 26, w = 4.5, step = 34) {
    const wood = WOOD(), L = Math.hypot(x1 - x0, y1 - y0);
    line(S, x0 - gap / 2, y0, x1 - gap / 2, y1, w, wood, .92, { bend: rnd(-1.5, 1.5) });
    line(S, x0 + gap / 2, y0, x1 + gap / 2, y1, w, wood, .92, { bend: rnd(-1.5, 1.5) });
    const n = Math.max(2, Math.floor(L / step));
    for (let i = 1; i <= n; i++) {
      const f = (i - .4) / n, x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f;
      line(S, x - gap / 2, y + rnd(-1, 1), x + gap / 2, y + rnd(-1, 1), w * .75, wood, .85, { bend: rnd(-1, 1) });
    }
    line(S, x0 + gap / 2 + w * .4, y0, x1 + gap / 2 + w * .4, y1, 1.3, C.ink, .45, { bend: 0 });
  }

  // ------------------------------------------------------------ one house from outside (local coords, origin = base centre)
  // returns its roof-top quad and hatch for people and smoke. The roof top is seen a little from above (D).
  const D = [30, -40];
  const MUDS = () => [MUD(), mixc(MUD(), C.paperLight, .14), mixc(MUD(), C.skyWarm, .22), mixc(MUD(), C.stone, .3), mixc(MUD(), C.stoneDark, .12)];
  // add another generator's strokes, moved to (dx, dy)
  function put(S, L, dx, dy) {
    for (const s of L) {
      s.pts = s.pts.map(([x, y]) => [x + dx, y + dy]);
      if (s.poly) s.poly = s.poly.map(r => r.map(([x, y]) => [x + dx, y + dy]));
      S.push(s);
    }
  }
  // a gently bowed edge from a to b (k: bulge, + to the left of the direction of travel)
  function bowed(a, b, k, n = 6) {
    const out = [], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    for (let i = 0; i <= n; i++) { const f = i / n, u = Math.sin(Math.PI * f) * k + (i && i < n ? rnd(-1, 1) : 0); out.push([a[0] + dx * f - dy / L * u, a[1] + dy * f + dx / L * u]); }
    return out;
  }
  function houseAt(S, bx, by, W, H, o = {}) {
    const x0 = bx - W / 2, x1 = bx + W / 2, y0 = by, top = by - H;
    const mud = o.col || pick(MUDS()), side = mixc(mud, C.ink, .3), slab = mixc(mud, C.stoneDark, .32);
    // the walls lean and bulge a little (hand-built mudbrick under mud plaster)
    const TL = [x0 + rnd(-6, 6), top + rnd(-4, 5)], TR = [x1 + rnd(-6, 6), top + rnd(-4, 5)], BL = [x0 + rnd(-2, 2), y0], BR = [x1 + rnd(-2, 2), y0];
    const ff = [...bowed(BL, TL, -rnd(2, 5)), ...bowed(TL, TR, rnd(-2, 3)).slice(1), ...bowed(TR, BR, -rnd(2, 5)).slice(1), ...bowed(BR, BL, 0, 3).slice(1, -1)];
    const sf = [TR, [TR[0] + D[0], TR[1] + D[1] + rnd(-2, 3)], [BR[0] + D[0], BR[1] + D[1]], BR];
    // side face first (the next house to the right covers it when it is as tall); an opaque ground under each wash
    S.push(washShape(sf, mixc(side, C.paper, .3), 1, 1, 0));
    face(S, sf, side, { a: .82, dir: 'v', gap: 8, ta: .22 });
    S.push(washShape(ff, mixc(mud, C.paper, .4), 1, 1, 0));
    face(S, ff, mud, { a: .8 });
    // light from the left; a darker pooled wash along the foot of the wall; streaks, plaster patches, a crack
    wash(S, box(x0 + 2, top + 8, x0 + W * .3, y0 - 2), mixc(mud, C.paperLight, .55), .15, { n: 2 });
    wash(S, bowed([x0, y0 - H * .27], [x1, y0 - H * .24], rnd(-3, 3), 5).concat([[x1, y0], [x0, y0]]), mixc(mud, C.stoneDark, .6), .26, { n: 0, jit: 3 });
    wash(S, box(x0, y0 - H * .1, x1, y0), mixc(mud, C.stoneDark, .7), .18, { n: 2 });
    for (let i = 0; i < Math.max(1, Math.round(W / 55)); i++) { const x = rnd(x0 + 12, x1 - 12); line(S, x, top + 14, x + rnd(-2, 2), top + rnd(.3, .7) * H, rnd(4, 7), mixc(mud, C.stoneDark, .45), .12, { prof: 'tip' }); }
    rows(S, box(x0, top + 16, x1, y0 - 3), mixc(mud, C.ink, .18), { gap: 11, w: 2, a: .13, broken: .6, nb: 0 });
    for (let i = 0; i < (W > 130 ? 2 : 1); i++) S.push(washShape(WC.blobPts(rnd(x0 + 20, x1 - 20), rnd(top + 30, y0 - 30), rnd(9, 16), rnd(6, 10), 12, .35), mixc(mud, C.paperLight, .28), .16, 2, 1.5));
    if (rnd() < .6) crack(S, rnd(x0 + 20, x1 - 20), top + rnd(16, 30), rnd(18, 34));
    // the flat earthen roof (a terrace people walk on)
    const rf = [[TL[0] - 4, TL[1] - 3], [TR[0] + 4, TR[1] - 3], [TR[0] + 4 + D[0], TR[1] - 3 + D[1]], [TL[0] - 4 + D[0], TL[1] - 3 + D[1]]];
    S.push(washShape(rf, mixc(mud, C.paperLight, .5), 1, 1, 0));
    wash(S, rf, mixc(mud, C.paperLight, .38), .7, { n: 2 });
    rows(S, rf, mixc(mud, C.stoneDark, .2), { gap: 8, w: 3, a: .12, broken: .35, nb: 0 });
    // the roof slab's front: a thick earthen band overhanging the wall, rounded ends, timber beam ends showing
    const ov = rnd(6, 10), bt = 13, s0 = [TL[0] - ov, TL[1] - 3], s1 = [TR[0] + ov, TR[1] - 3];
    const band = [...bowed(s0, s1, rnd(-1.5, 1.5), 6), [s1[0] - 2, s1[1] + bt], ...bowed([s1[0] - 3, s1[1] + bt], [s0[0] + 3, s0[1] + bt], rnd(-1.5, 1.5), 6).slice(1), [s0[0] + 2, s0[1] + bt]];
    S.push(washShape(band, mixc(slab, C.paper, .25), 1, 1, 0));
    wash(S, band, slab, .78, { n: 0, jit: 1.2 });
    for (const [ex, ey, sg] of [[s0[0], s0[1], 1], [s1[0], s1[1], -1]]) for (let k = 0; k < 3; k++) S.push(mk(qcurve(ex + sg * rnd(0, 3), ey + k * 4 + rnd(-1, 1), ex + sg * rnd(4, 9), ey + k * 4 + 4, 0, 3), rnd(3, 5), slab, { prof: 'tip', nb: 2, a: .6 }));
    for (let x = s0[0] + rnd(16, 40); x < s1[0] - 14; x += rnd(50, 85)) { const f = (x - s0[0]) / (s1[0] - s0[0]), r = rnd(2.4, 4.2); S.push(washShape(WC.blobPts(x, WC.mix(s0[1], s1[1], f) + bt * .55 + rnd(-2, 2), r, r * .85, 8, .2), mixc(C.wood, mud, .35), .55, 1, .3)); }
    dry(S, [[s0[0] + 2, s0[1] + bt + 1], [s1[0] - 2, s1[1] + bt + 1]], 3.4, mixc(mud, C.ink, .45), .45);
    dry(S, [[s0[0] + 4, s0[1] + 1], [s1[0] - 4, s1[1] + 1]], 2.4, mixc(C.paperLight, mud, .3), .5);
    // the hatch: a dark opening in the roof, and (often) the top of the ladder standing out of it
    const hu = o.hu ?? .6, hw = Math.min(52, W * .3);
    const hp = (u, v) => [WC.mix(TL[0], TR[0], u) + v * D[0], WC.mix(TL[1], TR[1], u) - 3 + v * D[1]];
    const hx0 = hu - hw / W / 2, hx1 = hu + hw / W / 2;
    const hatch = [hp(hx0, .34), hp(hx1, .34), hp(hx1, .74), hp(hx0, .74)];
    wash(S, hatch, DARK(), .94, { n: 1, jit: .8 });
    wash(S, [hp(hx0, .34), hp(hx1, .34), hp(hx1, .5), hp(hx0, .5)], C.ink, .4, { n: 1, jit: .5 });
    dry(S, [hatch[3], hatch[0], hatch[1]], 1.8, C.ink, .55);
    const hc = hp(hu, .54);
    if (o.ladder) ladder(S, hc[0] - 4, hc[1] + 4, hc[0] + 9, hc[1] - 66, 18, 3.6, 21);
    // a storage jar on some roofs
    if (o.jar) { const q = hp(hu < .5 ? .8 : .18, .45), j = G.jar(.12, { lid: rnd() < .6 }); put(S, j.S, q[0], q[1]); }
    // a few painted edges: the shaded corner, the foot
    dry(S, [TR, BR], 2, C.ink, .4);
    dry(S, [[x0 - 2, y0], [x1, y0]], 2.4, mixc(C.ink, mud, .3), .45);
    if (o.night) { wash(S, ff, C.night, .34, { n: 1 }); wash(S, sf, C.night, .5, { n: 1 }); wash(S, rf, C.night, .2, { n: 1 }); wash(S, band, C.night, .3, { n: 0 }); }
    return { roof: rf, hatch: hc, lip: hp(hu, .34)[1], top: Math.min(TL[1], TR[1]) - 3, x0, x1 };
  }

  // one house, or a small block of n houses wall to wall (the middle one with the ladder)
  G.catal_house = (sc, o = {}) => {
    const S = [], n = o.n ?? 1, W0 = 200 * (o.w ?? 1), H0 = 122 * (o.h ?? 1);
    const ws = [], hs = [];
    for (let i = 0; i < n; i++) { ws.push(n === 1 ? W0 : W0 * [.82, 1, .9, .86][i % 4]); hs.push(n === 1 ? H0 : H0 * [.84, 1, .76, .92][i % 4]); }
    const tw = ws.reduce((a, b) => a + b, 0), mid = Math.floor(n / 2);
    wash(S, [[-tw / 2 - 16, 4], [-tw / 2, -2], [tw / 2 + D[0], -2 + D[1] * .3], [tw / 2 + D[0] + 22, 4], [tw / 2, 10], [-tw / 2 - 4, 9]], mixc(C.stoneDark, C.ink, .3), .22, { n: 2, jit: 2 });
    let x = -tw / 2, h = null, first = null;
    for (let i = 0; i < n; i++) {
      const r = houseAt(S, x + ws[i] / 2, 0, ws[i], hs[i], { ladder: i === mid ? o.ladder !== false && !o.climber : false, hu: i === mid ? .58 : i === 0 ? .8 : .45, jar: n > 1 && i === n - 1, col: n === 1 ? MUD() : undefined });
      if (i === mid) h = r;
      if (i === 0) first = r;
      x += ws[i];
    }
    scaleL(S, sc);
    const hx = h.hatch[0] * sc, hy = h.hatch[1] * sc;
    const out = { S, top: [0, (h.top + D[1]) * sc], parts: { hatch: [hx, hy], ladder: [hx + 6 * sc, hy - 56 * sc], roof: [(h.x0 + 30) * sc, (h.top + D[1] * .5) * sc], wall: [(h.x0 + 40) * sc, -hs[mid] * .5 * sc] } };
    const climb = o.climber ? WC.make('person', Math.round(sc * .6 * 100) / 100, { pose: 'carry', dress: 'woman', load: 'basket', face: 'right', cols: { cloth: 'clothB' } }, 33) : null;
    const walk = o.walker && n > 1 ? WC.make('person', Math.round(sc * .5 * 100) / 100, { pose: 'walk', dress: 'peasant', headgear: 'bare', face: 'right' }, 22) : null;
    const lip = h.lip * sc, ry0 = (first.top + D[1] * .2) * sc;
    let LAD = null;
    if (climb) { LAD = []; ladder(LAD, h.hatch[0] - 8, h.hatch[1] + 40, h.hatch[0] + 8, h.hatch[1] - 78, 28, 4, 22); scaleL(LAD, sc); }
    if (o.smoke || climb || walk) out.live = (c, lt) => {
      if (o.smoke) WC.smoke(c, hx + 8 * sc, hy - 20 * sc, 200 * sc, lt + 2, 3, .3, .6);
      if (climb) {      // she climbs up out of the hole beside the ladder: below the hatch's front lip stays inside the house
        const f = eio(seg(lt, 0, 3.4)), fy = hy + (46 - 42 * f) * sc;
        c.save(); c.beginPath(); c.rect(-4000, -4000, 8000, lip + 4000); c.clip();
        WC.drawList(c, LAD, 1);
        WC.drawObj(c, climb, hx + 20 * sc, fy, 1);
        c.restore();
      }
      if (walk) WC.drawObj(c, walk, (first.x0 + 46 + clamp(lt / 3) * (first.x1 - first.x0) * .22) * sc, ry0, 1);
    };
    return out;
  };

  // the town: rows of houses stepping up a mound, back rows higher and narrower
  G.catal_town = (sc, o = {}) => {
    const S = [], nr = o.rows ?? 3, Wt = 760 * (o.w ?? 1), roofs = [], hatches = [];
    const R = Wt * .45 + 120, peak = 260;
    const moundCol = o.glow ? mixc(mixc(C.ground, C.stoneDark, .3), C.night, .55) : mixc(C.ground, C.stoneDark, .3);
    if (o.glow) wash(S, box(-900, -90, 900, 760), C.night, .5, { n: 2, jit: 2 });   // night: the plain in shadow
    // the mound (höyük): a broad earthen hill the houses climb, its slope painted in dry strokes, tufts of grass
    const prof = [];
    for (let i = 0; i <= 40; i++) { const x = -R + 2 * R * i / 40, k = 1 - (x / R) * (x / R); prof.push([x, -peak * Math.pow(Math.max(0, k), .75) * (1 + (WC.vnoise(i * .7 + 3) - .5) * .12)]); }
    const mound = prof.concat([[R, 16], [-R, 16]]);
    wash(S, [[-R - 40, -10], [R + 40, -10], [R + 300, 70], [R + 120, 150], [-R - 120, 150], [-R - 300, 70]], moundCol, .32, { n: 2, jit: 4 });
    wash(S, mound, moundCol, .72, { n: 0, jit: 3 });
    rows(S, mound, mixc(moundCol, C.stoneDark, .3), { gap: 12, w: 4, a: .18, broken: .3, nb: 0 });
    for (let i = 0; i < 26; i++) { const x = rnd(-R * .95, R * .95), y = prof[Math.round((x + R) / (2 * R) * 40)][1] * rnd(.1, .95); S.push(mk(WC.polar(x, y, -Math.PI / 2 + rnd(-.5, .5), rnd(8, 16), 2, 4), 2, pick(WC.shades(o.glow ? C.leafDark : C.leaf, .2)), { prof: 'tip', nb: 0, a: .55 })); }
    for (let r = nr - 1; r >= 0; r--) {
      const rw = Wt * (.8 - r * .14), ox = r * D[0] * .9 - 16, oy = -60 - r * 82;
      let x = ox - rw / 2;
      const row = [];
      while (x < ox + rw / 2 - 60) {
        const w = Math.min(rnd(118, 176), ox + rw / 2 - x), h = rnd(92, 146) - r * 6;
        row.push({ x: x + w / 2, w, h });
        x += w;
      }
      for (const b of row) {
        const lad = rnd() < .42, ho = houseAt(S, b.x, oy, b.w, b.h, { ladder: lad, hu: rnd(.3, .7), jar: rnd() < .12, night: !!o.glow });
        if (r === 0) roofs.push({ x0: ho.x0, x1: ho.x1, y: ho.top + D[1] * .2, xc: b.x, lad, hx: ho.hatch[0], hw: Math.min(52, b.w * .3) });
        hatches.push(ho.hatch);
      }
    }
    scaleL(S, sc);
    const out = { S, top: [0, -(150 + (nr - 1) * 82 + 60) * sc] };
    const nSmoke = o.smoke ?? 0, nWalk = o.walkers ?? 0;
    const smokeAt = hatches.filter((_, i) => i % 3 === 1).slice(0, nSmoke);
    // walkers: on the widest front roofs without a ladder, in front of the hatch, a slow walk along the roof
    const fr = roofs.slice().sort((a, b) => (a.lad - b.lad) || (b.x1 - b.x0) - (a.x1 - a.x0)).slice(0, nWalk).sort((a, b) => a.xc - b.xc);
    const walk = fr.map((rf, i) => ({ rf, dir: i % 2 ? -1 : 1,
      o: i % 2 ? { pose: 'carry', dress: 'woman', load: 'basket', face: 'left' } : { pose: 'walk', dress: 'peasant', headgear: 'bare', face: 'right' }, seed: 40 + i }));
    const ps = o.person ?? .5;
    const glow = o.glow ? hatches : [];
    if (smokeAt.length || walk.length || glow.length) out.live = (c, lt) => {
      // night: firelight from the rooms below glowing up out of the hatches
      glow.forEach(([hx, hy], i) => {
        const fk = .8 + .2 * Math.sin(lt * 2.3 + i * 1.7) * Math.sin(lt * 1.1 + i), x = hx * sc, y = (hy + 2) * sc, r = 46 * sc;
        const g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, WC.rgba(C.gold, .55 * fk)); g.addColorStop(.35, WC.rgba(C.fire, .25 * fk)); g.addColorStop(1, WC.rgba(C.fire, 0));
        c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
      });
      smokeAt.forEach(([hx, hy], i) => WC.smoke(c, (hx + 8) * sc, (hy - 16) * sc, 200 * sc, lt + i * 1.7, 5 + i, .26, .7));
      for (const w of walk) {
        const g = WC.make('person', Math.round(sc * ps * 100) / 100, w.o, w.seed);
        const L0 = [w.rf.x0 + 16, w.rf.hx - w.rf.hw / 2 - 18], L1 = [w.rf.hx + w.rf.hw / 2 + 2, w.rf.x1 - 8];
        const sgm = (L0[1] - L0[0]) >= (L1[1] - L1[0]) ? L0 : L1, f = clamp(lt / 5);
        const x = WC.mix(sgm[0], sgm[1], w.dir > 0 ? .15 + .7 * f : .85 - .7 * f) + D[0] * .2;
        WC.drawObj(c, g, x * sc, w.rf.y * sc, 1);
      }
    };
    return out;
  };

  // ------------------------------------------------------------ shared shot plumbing
  const mkCanvas = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; };
  function paperFill(c, W, H) { const pp = WC.paper(); if (pp) c.drawImage(pp, 0, 0); else { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); } }
  // a layer: strokes painted in from t0 over dur, then the cached sprite
  function layer(S) { return { S, spr: S.length ? WC.sprite(S) : null }; }
  function drawLayer(X, L, p, a = 1) {
    if (!L.spr || p <= 0) return;
    X.save(); X.globalAlpha = a;
    if (p >= 1) X.drawImage(L.spr.cv, L.spr.x0, L.spr.y0); else WC.drawList(X, L.S, p);
    X.restore();
  }
  // a stage of 1080 × 1920 design units fitted into the frame (Shorts: 1:1)
  function stage(ctx) {
    const { W, H } = ctx, k = Math.min(W / 1080, H / 1920);
    return { k, ox: (W - 1080 * k) / 2, oy: (H - 1920 * k) / 2 };
  }

  // a crouched burial lying on its side (head to the left, knees drawn up), at (x, y) = the pelvis, scale s:
  // fine pale bones with soft edges (quiet, an excavation drawing), the pit a darker soil wash
  function burial(S, x, y, s = 1, o = {}) {
    const bone = BONE(), shade = mixc(BONE(), C.stoneDark, .3), edge = mixc(C.inkSoft, C.stoneDark, .35);
    if (o.pit !== false) {
      const pit = WC.blobPts(x - 58 * s, y + 4 * s, 128 * s, 62 * s, 22, .14);
      wash(S, pit, mixc(SOIL(), C.ink, .28), .5, { n: 0, jit: 3 });
      dry(S, pit.concat([pit[0]]), 1.6 * Math.max(1, s * .6), mixc(SOIL(), C.ink, .45), .35);
    }
    const P = (dx, dy) => [x + dx * s, y + dy * s];
    const b = (pts, w, a = .82) => { const st = mk(along(pts.map(q => P(q[0], q[1])), 10), w * s, bone, { prof: 'even', nb: 2, a, rough: .25 }); S.push(st, WC.edgeOf(st, 1, 1 * s, edge, .4)); };
    const knob = (dx, dy, rx, ry = rx * .8, c = bone, a = .82) => S.push(washShape(WC.blobPts(x + dx * s, y + dy * s, rx * s, ry * s, 10, .12), c, a, 2, .5));
    // the spine: a chain of small vertebrae from the pelvis up to the neck
    for (const [vx, vy] of along([[0, -8], [-30, -24], [-62, -31], [-92, -27], [-106, -22]], 15)) { knob(vx, vy, 3.6, 2.8); S.push(washShape(WC.blobPts(x + vx * s, y + (vy + 2.2) * s, 2.8 * s, 1.1 * s, 8, .1), shade, .45, 1, .3)); }
    // ribs: thin arcs curving down from the spine
    for (let i = 0; i < 5; i++) { const cx = -46 - i * 11; b([[cx, -28], [cx - 3, -12], [cx + 5, 3]], 2.2, .72); }
    // pelvis
    knob(2, -8, 12, 9); knob(6, -4, 5.5, 4.5, shade, .6);
    // legs drawn up to the chest: thigh forward, shin folded back, the foot
    b([[4, -2], [-20, 12], [-44, 26]], 5); knob(-46, 27, 4.6);
    b([[-46, 28], [-24, 36], [-4, 40]], 3.8); b([[-46, 31], [-24, 40], [-6, 44]], 2, .6);
    b([[-4, 41], [6, 44], [15, 44]], 2.6, .72);
    // the arm: upper arm down to the elbow, forearm to the hand near the face
    b([[-96, -22], [-95, -8], [-92, 6]], 4); knob(-92, 7, 3.2);
    b([[-92, 7], [-104, 4], [-114, 0]], 3);
    for (let i = 0; i < 4; i++) b([[-115, -1 + i * 1.4], [-121, -4 + i * 2.2]], 1.3, .65);
    // the skull in profile, small, face turned down toward the knees (no features: a quiet shape)
    const cr = WC.blobPts(x - 116 * s, y - 29 * s, 12 * s, 10 * s, 16, .06);
    S.push(washShape(cr, bone, .85, 2, .5));
    knob(-123, -21, 6.3, 5.6, bone, .8);
    S.push(washShape(WC.blobPts(x - 114 * s, y - 33 * s, 6 * s, 4 * s, 10, .1), mixc(C.paperLight, bone, .3), .45, 1, .3));
    dry(S, cr.slice(0, 11), 1.1 * s, edge, .4);
    line(S, x - 128 * s, y - 17 * s, x - 117 * s, y - 15 * s, .9 * s, edge, .4);
  }

  // one house in section (stage units): walls lx..rx (inner faces), roof slab, floor; returns the parts
  // o: {roofTop, slab, floor, hatch: [x0, x1], platform: [x0, x1, h], oven: x (centre) | false, wall}
  function sectionHouse(S, lx, rx, o) {
    const rt = o.roofTop, rb = rt + o.slab, fl = o.floor, wt = o.wall ?? 46;
    const mud = MUD(), [h0, h1] = o.hatch;
    // the room: plastered walls in half light (only the hatch lets light in), patches and cracks in the plaster
    face(S, rough(lx, rb, rx, fl, 3), mixc(PLASTER(), C.stone, .25), { a: .75, tex: false });
    for (const f of [.16, .32, .5]) wash(S, rough(lx, rb, rx, rb + (fl - rb) * f, 4), mixc(C.stoneDark, C.wood, .3), .1, { n: 1 });
    stains(S, lx + 10, rb + 20, rx - 10, fl - 20, mixc(PLASTER(), C.stoneDark, .3), 4, .1);
    stains(S, lx + 10, rb + 20, rx - 10, fl - 20, C.paperLight, 2, .2);
    for (let i = 0; i < 2; i++) crack(S, rnd(lx + 40, rx - 40), rb + rnd(20, 60), rnd(30, 60), .28);
    wash(S, rough(lx, rb, lx + 40, fl, 3), mixc(C.stoneDark, C.ink, .2), .18, { n: 1 });
    wash(S, rough(rx - 40, rb, rx, fl, 3), mixc(C.stoneDark, C.ink, .2), .18, { n: 1 });
    // the floor: a plaster line, renewed again and again (thin layers)
    for (let i = 0; i < 3; i++) line(S, lx, fl + i * 4, rx, fl + i * 4 + rnd(-1, 1), 3, i ? mixc(PLASTER(), C.stone, .4) : PLASTER(), .9 - i * .2, { bend: rnd(-3, 3) });
    dry(S, [[lx, fl - 1], [rx, fl - 1]], 2.2, C.ink, .45);
    // platform (seki): white plastered, raised, its front corner rounded
    if (o.platform) {
      const [p0, p1, ph] = o.platform, t = fl - ph;
      const pts = [[p0, fl], [p0, t + rnd(-2, 2)], [p1 - 14, t + rnd(-2, 2)], [p1 - 5, t + 3], [p1 - 1, t + 12], [p1, fl]];
      face(S, sub(pts, 2), PLASTER(), { a: .9, tex: false });
      wash(S, [[p0, t], [p1 - 14, t], [p1 - 10, t + 9], [p0, t + 10]], C.paperLight, .75, { n: 1 });
      wash(S, [[p1 - 12, t + 2], [p1 - 1, t + 12], [p1, fl], [p1 - 12, fl]], mixc(C.stone, C.stoneDark, .3), .42, { n: 1 });
      dry(S, [[p0, t], [p1 - 14, t], [p1 - 4, t + 4], [p1, t + 14], [p1, fl]], 2, C.ink, .5);
    }
    // oven: a clay dome against the right wall, under the hatch, its mouth to the room
    if (o.oven) {
      const ox = o.oven, ow = 62, oh = 98, ob = fl;
      const dome = []; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI; dome.push([ox + Math.cos(a) * ow * rnd(.97, 1.03), ob + Math.sin(a) * oh * rnd(.97, 1.03)]); }
      face(S, dome, mixc(MUD(), C.roof, .25), { a: .86, tex: false });
      wash(S, dome.slice(8).concat([[ox + ow, ob]]), mixc(MUD(), C.ink, .35), .35, { n: 0 });
      const mouth = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; mouth.push([ox - 22 + Math.cos(a) * 22, ob + Math.sin(a) * 34]); }
      wash(S, mouth, C.ink, .8, { n: 0, jit: .5 });
      dry(S, dome, 2, C.ink, .55);
      o.ovenAt = [ox - 22, ob - 14];
    }
    // the roof slab in section: earth over reeds over timber beams (beam ends as dark dots), the hatch a gap in it
    const slab = (a, b) => {
      if (b - a < 4) return;
      face(S, rough(a, rt, b, rb, 3), mixc(mud, C.stoneDark, .2), { a: .85, gap: 7 });
      line(S, a, rb - 8, b, rb - 8, 6, mixc(C.clothC, C.wood, .35), .5, { bend: rnd(-2, 2) });
      for (let x = a + 16; x < b - 8; x += rnd(26, 34)) S.push(washShape(WC.blobPts(x, rb - 16 + rnd(-2, 2), 7, 6, 10, .15), mixc(C.wood, C.ink, .4), .78, 2, .6));
      dry(S, [[a, rt], [b, rt]], 2.6, C.ink, .55); dry(S, [[a, rb], [b, rb]], 1.8, C.ink, .4);
    };
    slab(lx - wt, h0); slab(h1, rx + wt);
    // the walls in section (mudbrick, shared with the neighbours)
    for (const [a, b] of [[lx - wt, lx], [rx, rx + wt]]) {
      face(S, rough(a, rt, b, fl + 8, 3, 8), mud, { a: .88, gap: 9 });
      rows(S, box(a, rt + 6, b, fl), mixc(mud, C.ink, .25), { gap: 13, w: 2, a: .32, nb: 0, broken: .15 });
      dry(S, [[a, rt], [a + rnd(-2, 2), (rt + fl) / 2], [a, fl + 8]], 2, C.ink, .45); dry(S, [[b, rt], [b + rnd(-2, 2), (rt + fl) / 2], [b, fl + 8]], 2, C.ink, .45);
    }
    return { rt, rb, fl };
  }
  // earth under the floors: strata, pebbles
  function soil(S, y0, y1, x0 = -20, x1 = 1100) {
    wash(S, box(x0, y0, x1, y1), SOIL(), .62, { n: 4, jit: 3 });
    for (let i = 0; i < 7; i++) { const y = y0 + (y1 - y0) * (i + rnd(.2, .8)) / 7; line(S, x0, y, x1, y + rnd(-6, 6), rnd(6, 14), pick([MUD(), mixc(SOIL(), C.ink, .15), mixc(C.ground, C.paper, .2)]), .22, { bend: rnd(-8, 8) }); }
    for (let i = 0; i < 26; i++) { const x = rnd(x0, x1), y = rnd(y0 + 10, y1); S.push(washShape(WC.blobPts(x, y, rnd(3, 8), rnd(2, 6), 8, .2), mixc(C.stoneDark, C.ink, .2), .45, 1, .5)); }
  }
  function skyWash(c, y1, kind = 'day') {
    const g = c.createLinearGradient(0, 0, 0, y1);
    const top = kind === 'dusk' ? mixc(C.skyWarm, C.paper, .5) : C.paper, low = kind === 'dusk' ? C.skyWarm : C.sky;
    g.addColorStop(0, WC.rgba(top, kind === 'dusk' ? .35 : 0)); g.addColorStop(1, WC.rgba(low, .8));
    c.fillStyle = g; c.fillRect(0, 0, 1080, y1);
    WC.softBand(c, -100, 900, y1 * .35, 80, kind === 'dusk' ? C.skyWarm : C.sky, .12);
  }

  // ------------------------------------------------------------ wc_catalhoyuk_house: one house cut open, a woman climbing down
  SHOTS.wc_catalhoyuk_house = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), st = stage(ctx);
      const HX = [700, 832];     // the hatch
      const g = WC.withSeed(seed * 31 + 5, () => {
        const back = mkCanvas(W, H), b = back.getContext('2d');
        paperFill(b, W, H); b.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
        skyWash(b, 420, 'day');
        const B = [];
        soil(B, 1010, 1960);
        // the neighbours, cut too: darker rooms beyond the shared walls
        wash(B, rough(-20, 455, 112, 1030, 4), mixc(DARK(), C.wood, .3), .55, { n: 1 });
        face(B, rough(-20, 418, 112, 466, 3), mixc(MUD(), C.stoneDark, .2), { a: .85, gap: 7 }); dry(B, [[-20, 418], [112, 418]], 2.4, C.ink, .55);
        wash(B, rough(968, 410, 1100, 1000, 4), mixc(DARK(), C.wood, .3), .55, { n: 1 });
        face(B, rough(968, 362, 1100, 412, 3), mixc(MUD(), C.stoneDark, .2), { a: .85, gap: 7 }); dry(B, [[968, 362], [1100, 362]], 2.4, C.ink, .55);
        WC.drawList(b, B, 1);
        const A = [], o = { roofTop: 398, slab: 58, floor: 1010, hatch: HX, platform: [200, 520, 66], oven: 852, wall: 48 };
        sectionHouse(A, 160, 920, o);
        // a red-ochre geometric panel on the plaster above the platform
        const R = [];
        for (let i = 0; i < 4; i++) { const x = 250 + i * 62; pen(R, [[x, 760 + rnd(-3, 3)], [x + 31, 700 + rnd(-3, 3)], [x + 62, 760 + rnd(-3, 3)]], 6, .5, mixc(C.red, C.roof, .3)); }
        line(R, 246, 776, 500, 776, 5, mixc(C.red, C.roof, .3), .45, { bend: 2 }); line(R, 246, 688, 500, 688, 5, mixc(C.red, C.roof, .3), .45, { bend: -2 });
        // the ladder: from the floor up through the hatch into the light
        const L = []; ladder(L, 650, 1010, 760, 322, 52, 7, 60);
        return { back, A: layer(A), R: layer(R), L: layer(L), oven: o.ovenAt };
      });
      const woman = WC.make('person', 1.3, { pose: 'raise', dress: 'woman', face: 'front', headgear: 'bare', scarf: false }, seed + 3);
      return {
        update(lt, dur, cues) {
          X.clear(); X.drawImage(g.back, 0, 0);
          X.save(); X.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
          drawLayer(X, g.A, seg(lt, 0, 1.2));
          // light shaft from the hatch onto the floor, dust in it (live)
          const la = ss(seg(lt, .6, 1.6));
          if (la > 0) {
            X.save(); X.globalAlpha = la;
            const gr = X.createLinearGradient(0, 456, 0, 1010); gr.addColorStop(0, WC.rgba(C.paperLight, .7)); gr.addColorStop(1, WC.rgba(C.paperLight, .18));
            X.beginPath(); X.moveTo(HX[0] + 2, 456); X.lineTo(HX[1] - 2, 456); X.lineTo(650, 1010); X.lineTo(470, 1010); X.closePath(); X.fillStyle = gr; X.fill();
            X.fillStyle = WC.rgba(C.paperLight, .7);
            for (let i = 0; i < 26; i++) { const f = (WC.hash(i * 3.3) + lt * .03) % 1, y = 470 + f * 520, x = WC.mix(766, 560, f) + (WC.hash(i * 7.1) - .5) * 120 + Math.sin(lt * .6 + i) * 6; X.beginPath(); X.arc(x, y, 1.6 + WC.hash(i) * 1.6, 0, 7); X.fill(); }
            X.restore();
          }
          drawLayer(X, g.R, seg(lt, .9, 1.8));
          // oven embers; its smoke rises straight up and out of the hatch above it
          if (lt > 1) {
            const k = ss(seg(lt, 1, 1.8));
            X.save(); X.globalAlpha = k;
            const [ex, ey] = g.oven, gl = X.createRadialGradient(ex, ey, 2, ex, ey, 70); gl.addColorStop(0, WC.rgba(C.fire, .55)); gl.addColorStop(1, WC.rgba(C.fire, 0));
            X.fillStyle = gl; X.fillRect(ex - 80, ey - 80, 160, 160);
            WC.flame(X, ex, ey + 12, 22 + Math.sin(lt * 5) * 3, lt, 1);
            X.restore();
            if (P.smoke !== false) { WC.smoke(X, 806, 900, 470, lt + 1, 7, .2 * k, .15); WC.smoke(X, 790, 470, 520, lt + 3, 2, .32 * k, .5); }
          }
          drawLayer(X, g.L, seg(lt, .5, 1.3));
          // the woman coming down the ladder: feet from just under the hatch to half way down
          const t0 = WC.timeOf(P.at, cues, .7), q = eio(seg(lt, t0, t0 + Math.max(2.2, dur - t0 - .2)));
          if (lt > t0 - .4) {
            const fy = WC.mix(600, 900, q), fx = 650 + 110 * (1010 - fy) / 688 - 4;
            X.save(); X.beginPath(); X.rect(0, 456, 1080, 1500); X.rect(HX[0] + 2, 0, HX[1] - HX[0] - 4, 456); X.clip();
            WC.drawObj(X, woman, fx, fy, ss(seg(lt, t0 - .4, t0 + .4)));
            X.restore();
          }
          X.restore();
        },
      };
    },
  };

  // ------------------------------------------------------------ wc_catalhoyuk_grave: under the plastered platform
  SHOTS.wc_catalhoyuk_grave = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), st = stage(ctx), night = !!P.night;
      // day: the burial is the subject; night: the sleepers on the platform and the burial right under them
      const fl = night ? 790 : 760, pl = night ? [20, 820, 90] : [30, 700, 92];
      const bur = night ? [650, 980, 2.0] : [560, 935, 2.3];
      const HX = [760, 900], SL = [40, 130];   // the roof hatch and the roof slab at the top of the frame
      const g = WC.withSeed(seed * 37 + 11, () => {
        const back = mkCanvas(W, H), b = back.getContext('2d');
        paperFill(b, W, H); b.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
        // the sky seen through the hatch
        if (night) { b.fillStyle = WC.rgba(C.night, .95); b.fillRect(HX[0], 0, HX[1] - HX[0], SL[1]); }
        else { b.fillStyle = WC.rgba(C.sky, .8); b.fillRect(HX[0], 0, HX[1] - HX[0], SL[1]); }
        const B = [];
        soil(B, fl + 10, 1960);
        // the room: back wall in half light, plaster patches, a crack, a red-ochre panel
        face(B, rough(-20, SL[1], 1100, fl, 4), mixc(PLASTER(), C.stone, .28), { a: .8, tex: false });
        wash(B, rough(-20, SL[1], 1100, SL[1] + 200, 5), mixc(C.stoneDark, C.wood, .3), .26, { n: 1 });
        rows(B, box(-20, SL[1] + 10, 1100, fl - 10), mixc(PLASTER(), C.stoneDark, .2), { gap: 22, w: 26, a: .09, nb: 5, broken: .2 });
        stains(B, 0, SL[1] + 40, 1080, fl - 40, mixc(PLASTER(), C.stoneDark, .3), 5, .09);
        crack(B, 640, SL[1] + 60, 70, .3); crack(B, 180, SL[1] + 120, 50, .25);
        const py = night ? 300 : 330;
        for (let i = 0; i < 5; i++) { const x = 110 + i * 92; pen(B, [[x, py + 86 + rnd(-3, 3)], [x + 46, py + rnd(-3, 3)], [x + 92, py + 86 + rnd(-3, 3)]], 8, .45, mixc(C.red, C.roof, .3)); }
        line(B, 104, py + 110, 572, py + 110, 7, mixc(C.red, C.roof, .3), .4, { bend: 3 }); line(B, 104, py - 18, 572, py - 18, 7, mixc(C.red, C.roof, .3), .4, { bend: -3 });
        // the roof slab with its beams, the hatch a gap in it
        for (const [a, c2] of [[-20, HX[0]], [HX[1], 1100]]) {
          face(B, rough(a, SL[0], c2, SL[1], 3), mixc(MUD(), C.stoneDark, .25), { a: .88, gap: 8 });
          line(B, a, SL[1] - 10, c2, SL[1] - 10, 7, mixc(C.clothC, C.wood, .35), .5, { bend: rnd(-2, 2) });
          for (let x = a + 18; x < c2 - 10; x += rnd(30, 38)) B.push(washShape(WC.blobPts(x, SL[1] - 20, 8, 7, 10, .15), mixc(C.wood, C.ink, .4), .78, 2, .6));
          dry(B, [[a, SL[1]], [c2, SL[1]]], 2, C.ink, .45);
        }
        if (night) for (const [sx, sy] of [[790, 40], [860, 92], [830, 18]]) { B.push(washShape(WC.blobPts(sx, sy, 2.4, 2.4, 8, .1), C.paperLight, .9, 1, .2)); }
        WC.drawList(b, B, 1);
        const A = [];
        // platform and floor with their layers of plaster
        const t = fl - pl[2];
        face(A, sub([[pl[0], fl], [pl[0], t + rnd(-2, 2)], [pl[1] - 16, t + rnd(-2, 2)], [pl[1] - 5, t + 4], [pl[1] - 1, t + 14], [pl[1], fl]], 2), PLASTER(), { a: .92, tex: false });
        wash(A, [[pl[0], t], [pl[1] - 16, t], [pl[1] - 10, t + 11], [pl[0], t + 12]], C.paperLight, .8, { n: 1 });
        wash(A, [[pl[1] - 14, t + 2], [pl[1] - 1, t + 14], [pl[1], fl], [pl[1] - 14, fl]], mixc(C.stone, C.stoneDark, .3), .45, { n: 1 });
        dry(A, [[pl[0] - 30, t], [pl[1] - 16, t], [pl[1] - 4, t + 5], [pl[1], t + 16], [pl[1], fl]], 2.4, C.ink, .5);
        for (let i = 0; i < 5; i++) line(A, -20, fl + i * 5, 1100, fl + i * 5 + rnd(-1, 1), 3.4, i % 2 ? mixc(PLASTER(), C.stone, .45) : PLASTER(), .92 - i * .1, { bend: rnd(-3, 3) });
        dry(A, [[-20, fl - 1], [1100, fl - 1]], 2.4, C.ink, .5);
        // the ladder from the floor up to the hatch, and the oven's foot at the right edge
        ladder(A, 900, fl, 838, SL[0] - 30, 50, 6.5, 58);
        const dome = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI * .55; dome.push([1070 + Math.cos(a) * 120, fl + Math.sin(a) * 190]); }
        dome.push([1100, fl - 190], [1100, fl]);
        face(A, dome, mixc(MUD(), C.roof, .25), { a: .85, tex: false });
        const mouth = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; mouth.push([996 + Math.cos(a) * 30, fl + Math.sin(a) * 50]); }
        wash(A, mouth, C.ink, .8, { n: 0, jit: .5 });
        // the burial in its pit under the platform
        const U = []; burial(U, bur[0], bur[1], bur[2]);
        // sleepers' blankets (night): low wool humps over the bodies, the heads left out
        const Z = [];
        if (night) {
          const hump = (x0, x1, h) => { const q = [[x0, t]]; for (let i = 0; i <= 14; i++) { const f = i / 14; q.push([WC.mix(x0, x1, f), t - h * Math.pow(Math.sin(Math.PI * Math.min(1, f * 1.12)), .55) * (f < .3 ? .78 : 1) + rnd(-2, 2)]); } q.push([x1, t]); return q; };
          for (const bl of [hump(330, 800, 90), hump(96, 342, 64).map(([x, y]) => [438 - x, y])]) {
            wash(Z, bl, mixc(C.wood, C.clothC, .45), .88, { n: 1 });
            rows(Z, bl, mixc(C.wood, C.ink, .25), { gap: 12, w: 5, a: .25, nb: 0, broken: .2 });
            for (let i = 0; i < 5; i++) { const x = WC.mix(bl[2][0], bl[bl.length - 3][0], (i + .5) / 5); line(Z, x, t - 4, x + rnd(-8, 8), t - rnd(30, 60), 2.2, mixc(C.wood, C.ink, .35), .3, { prof: 'tip' }); }
            dry(Z, bl.slice(1, -1), 2, mixc(C.wood, C.ink, .4), .5);
          }
        }
        return { back, A: layer(A), U: layer(U), Z: layer(Z), oven: [996, fl - 20], t };
      });
      const sleepers = night ? [WC.make('person', 3.2, { pose: 'lie', dress: 'peasant', headgear: 'bare', face: 'left' }, seed + 5), WC.make('person', 2.8, { pose: 'lie', dress: 'child', headgear: 'bare', face: 'right' }, seed + 9)] : [];
      return {
        update(lt, dur, cues) {
          X.clear(); X.drawImage(g.back, 0, 0);
          X.save(); X.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
          drawLayer(X, g.A, seg(lt, 0, 1.1));
          if (!night) {   // daylight from the hatch onto the floor
            const la = ss(seg(lt, .4, 1.4));
            if (la > 0) { X.save(); X.globalAlpha = la; const gr = X.createLinearGradient(0, 130, 0, fl); gr.addColorStop(0, WC.rgba(C.paperLight, .6)); gr.addColorStop(1, WC.rgba(C.paperLight, .12)); X.beginPath(); X.moveTo(762, 130); X.lineTo(898, 130); X.lineTo(700, fl); X.lineTo(520, fl); X.closePath(); X.fillStyle = gr; X.fill(); X.restore(); }
          }
          // the burial: painted in at the cue (day) or there already, brightening at the cue (night)
          const tb = WC.timeOf(P.at, cues, 1.2);
          if (night) drawLayer(X, g.U, 1, WC.mix(.7, 1, ss(seg(lt, tb, tb + 1))));
          else drawLayer(X, g.U, seg(lt, tb, tb + 1.4));
          if (night) {
            // the room is dark: a night wash, darker high up; the earth below stays readable
            const ng = X.createLinearGradient(0, 0, 0, g.t + 90); ng.addColorStop(0, WC.rgba(C.night, .8)); ng.addColorStop(1, WC.rgba(C.night, .48));
            X.fillStyle = ng; X.fillRect(-20, -20, 1120, g.t + 90 + 22);
            const ns = X.createLinearGradient(0, g.t + 90, 0, 1920); ns.addColorStop(0, WC.rgba(C.night, .16)); ns.addColorStop(1, WC.rgba(C.night, .42));
            X.fillStyle = ns; X.fillRect(-20, g.t + 92, 1120, 1830);
            // embers in the oven, their warm light reaching across the room to the sleepers
            const [ex, ey] = g.oven, fk = .85 + .15 * Math.sin(lt * 3.1) * Math.sin(lt * 1.7 + 1);
            const gl = X.createRadialGradient(ex, ey, 4, ex - 140, ey - 40, 760); gl.addColorStop(0, WC.rgba(C.fire, .5 * fk)); gl.addColorStop(.35, WC.rgba(C.skyWarm, .26 * fk)); gl.addColorStop(1, WC.rgba(C.skyWarm, 0));
            X.fillStyle = gl; X.fillRect(0, 100, 1080, 1000);
            WC.flame(X, ex, ey + 18, 26 * fk, lt, 2);
            // the sleepers (breathing very slowly), the blankets over them
            const br = Math.sin(lt * 1.2) * 2;
            WC.drawObj(X, sleepers[0], 600, g.t - 2 + br * .4, 1);
            WC.drawObj(X, sleepers[1], 210, g.t - 2 - br * .3, 1);
            X.save(); X.translate(0, -br * .5); drawLayer(X, g.Z, 1); X.restore();
          }
          X.restore();
          // a hand note on the plaster floor
          if (P.note) {
            const t0 = WC.timeOf(P.note.at, cues, .9);
            WC.note(X, lt, t0, (st.ox + 860 * st.k), st.oy + (fl + 6) * st.k, st.ox + 760 * st.k, st.oy + 1062 * st.k, P.note.text, { size: 50 * st.k, col: P.note.color === 'red' ? C.red : C.ink });
          }
        },
      };
    },
  };

  // ------------------------------------------------------------ wc_catalhoyuk_mound: the mound in section
  SHOTS.wc_catalhoyuk_mound = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), st = stage(ctx);
      // three houses side by side (inner faces), their roofs at different heights
      const HS = [
        { lx: 96, rx: 360, rt: 392, fl: 760, hatch: [246, 312] },
        { lx: 392, rx: 668, rt: 348, fl: 740, hatch: [552, 618] },
        { lx: 700, rx: 982, rt: 420, fl: 780, hatch: [800, 866] },
      ];
      const g = WC.withSeed(seed * 41 + 3, () => {
        const back = mkCanvas(W, H), b = back.getContext('2d');
        paperFill(b, W, H); b.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
        skyWash(b, 470, P.sky || 'dusk');
        // the mound's profile: the earth falls away at both ends
        const B = [];
        const prof = [[-20, 720], [16, 600], [44, 470], [64, 420], [1014, 450], [1036, 520], [1066, 640], [1100, 720], [1100, 1960], [-20, 1960]];
        wash(B, sub(prof, 2), SOIL(), .62, { n: 0, jit: 4 });
        soil(B, 790, 1960, -20, 1100);
        // older houses below: broken wall stubs, rubble fill, an older floor
        for (const x of [56, 372, 660, 990]) { face(B, [[x, 1000], [x + 36, 990 + rnd(0, 20)], [x + 36 + rnd(-3, 3), 1132], [x + rnd(-3, 3), 1132]], MUD(), { a: .7, gap: 9 }); dry(B, [[x, 998], [x + 36, 992]], 1.6, C.ink, .4); }
        for (let i = 0; i < 2; i++) line(B, -20, 1132 + i * 4, 1100, 1132 + i * 4, 3, mixc(PLASTER(), C.stone, .4), .7 - i * .2, { bend: rnd(-4, 4) });
        WC.drawList(b, B, 1);
        const A = [];
        for (const h of HS) {
          const o = { roofTop: h.rt, slab: 46, floor: h.fl, hatch: h.hatch, platform: [h.lx + 8, h.lx + 132, 40], oven: false, wall: 32 };
          sectionHouse(A, h.lx, h.rx, o);
          wash(A, rough(h.lx, h.rt + 46, h.rx, h.fl, 3), mixc(DARK(), C.wood, .3), .2, { n: 1 });
          ladder(A, h.hatch[0] + 4, h.fl, (h.hatch[0] + h.hatch[1]) / 2 + 12, h.rt - 64, 30, 5, 40);
        }
        // the burials, one under each floor, and older ones lower down
        const U = [];
        burial(U, 300, HS[0].fl + 112, 1.05); burial(U, 600, HS[1].fl + 104, 1.05); burial(U, 930, HS[2].fl + 112, 1.0);
        const U2 = []; burial(U2, 290, 1086, .62); burial(U2, 870, 1092, .58);
        return { back, A: layer(A), U: layer(U), U2: layer(U2) };
      });
      const walkers = [
        { h: HS[0], x0: 112, x1: 236, o: { pose: 'walk', dress: 'peasant', headgear: 'bare' }, seed: 11 },
        { h: HS[1], x0: 540, x1: 420, o: { pose: 'carry', dress: 'woman', load: 'basket', face: 'left' }, seed: 12 },
        { h: HS[2], x0: 884, x1: 962, o: { pose: 'walk', dress: 'peasant', headgear: 'bare', face: 'right' }, seed: 13 },
      ].map(w => Object.assign(w, { g: WC.make('person', .82, w.o, seed + w.seed) }));
      const notes = P.notes || [];
      return {
        update(lt, dur, cues) {
          X.clear(); X.drawImage(g.back, 0, 0);
          X.save(); X.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
          drawLayer(X, g.A, seg(lt, 0, 1.2));
          // smoke from two hatches
          const sk = ss(seg(lt, 1, 2));
          if (sk > 0) { WC.smoke(X, 290, HS[0].rt - 4, 300, lt + 2, 4, .24 * sk, .6); WC.smoke(X, 842, HS[2].rt - 4, 260, lt + 5, 6, .22 * sk, .6); WC.smoke(X, 585, HS[1].rt - 4, 240, lt + 3.5, 8, .18 * sk, .5); }
          // people walking over the roofs
          for (const w of walkers) {
            const a = ss(seg(lt, .7, 1.4)); if (a <= 0) continue;
            const x = WC.mix(w.x0, w.x1, clamp(lt / (Math.max(3, dur) + 1.5)));   // still walking while the hook replays this shot
            WC.drawObj(X, w.g, x, w.h.rt + 2, 1, { a });
          }
          // burials under the floors at the cue
          const tb = WC.timeOf(P.at, cues, 1.6);
          drawLayer(X, g.U, seg(lt, tb, tb + 1.4));
          drawLayer(X, g.U2, seg(lt, tb + .6, tb + 2), .7);
          X.restore();
          for (const n of notes) {
            const t0 = WC.timeOf(n.at, cues, 1.2), T = (u, v) => [st.ox + u * 1080 * st.k, st.oy + v * 1920 * st.k];
            const [lx, ly] = T(n.x, n.y), [ax, ay] = T(n.ax, n.ay);
            WC.note(X, lt, t0, ax, ay, lx, ly, n.text, { size: (n.size || 52) * st.k, col: n.color === 'red' ? C.red : C.ink });
          }
        },
      };
    },
  };

  // ------------------------------------------------------------ wc_catalhoyuk_plan: the town from above, as a dig plan
  SHOTS.wc_catalhoyuk_plan = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), st = stage(ctx);
      const CY = 860;    // centre of the excavated area (the plan runs on under the subtitles, fading out)
      const g = WC.withSeed(seed * 43 + 7, () => {
        const back = mkCanvas(W, H), b = back.getContext('2d');
        paperFill(b, W, H); b.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
        // the ground around the town: a pale earth wash with a ragged edge, grass at the rim
        const B = [];
        wash(B, WC.blobPts(540, CY + 60, 600, 860, 48, .1), mixc(C.ground, C.paper, .35), .5, { n: 0, jit: 4 });
        for (let i = 0; i < 80; i++) { const a = rnd(0, 6.28), x = 540 + Math.cos(a) * rnd(500, 640), y = CY + 60 + Math.sin(a) * rnd(760, 900); B.push(mk(WC.polar(x, y, -Math.PI / 2 + rnd(-.5, .5), rnd(10, 22), 2, 4), 2.2, pick(WC.shades(C.leaf, .2)), { prof: 'tip', nb: 0, a: .5 })); }
        WC.drawList(b, B, 1);
        // cells: rows of rooms of different sizes, wall against wall, rows offset, corners nudged, the outline ragged
        const cells = [];
        let y = 240;
        while (y < 1780) {
          const rh = rnd(112, 168);
          let x = 70 + rnd(-40, 30);
          while (x < 1010) {
            const w = rnd(112, 196);
            const cx = x + w / 2, cy = y + rh / 2, d = Math.hypot((cx - 540) / 480, (cy - CY) / 760);
            const j = () => rnd(-9, 9);
            if (d < 1.02 + rnd(-.12, .08)) cells.push({ q: [[x + j(), y + j()], [x + w + j(), y + j()], [x + w + j(), y + rh + j()], [x + j(), y + rh + j()]], x0: x, y0: y, x1: x + w, y1: y + rh, d, yard: rnd() < .07 });
            x += w + rnd(-4, 4);
          }
          y += rh + rnd(-4, 4);
        }
        cells.sort((a, b2) => a.d - b2.d);
        const L = cells.map(c => {
          const S = [], wallW = 15, wcol = MUD(), [p0, p1, p2, p3] = c.q;
          const inset = c.q.map(([x, y2]) => [WC.mix(x, (c.x0 + c.x1) / 2, .07), WC.mix(y2, (c.y0 + c.y1) / 2, .09)]);
          let hatch = null;
          if (c.yard) {
            wash(S, inset, mixc(C.ground, C.stoneDark, .35), .55, { n: 2 });
            for (let i = 0; i < 14; i++) S.push(washShape(WC.blobPts(rnd(c.x0 + 14, c.x1 - 14), rnd(c.y0 + 14, c.y1 - 14), rnd(2, 5), rnd(2, 4), 8, .2), C.stoneDark, .5, 1, .5));
          } else {
            // the roof: a pale earth wash; the hatch near the south wall, a ladder leaning out of it
            face(S, inset, mixc(ROOF(), pick([C.paper, C.skyWarm, C.stone]), .15), { a: .7, gap: 9 });
            const hx = WC.mix(c.x0, c.x1, rnd(.3, .62)), hy = c.y1 - 42, hw = 36, hh = 26;
            wash(S, [[hx - hw / 2, hy - hh / 2], [hx + hw / 2, hy - hh / 2 + rnd(-2, 2)], [hx + hw / 2, hy + hh / 2], [hx - hw / 2, hy + hh / 2]], DARK(), .9, { n: 1, jit: .6 });
            const a = rnd(-.9, -.4), dx = Math.cos(a), dy = Math.sin(a), len = 52;
            const bx = hx + 2, by = hy + 2, ex = bx + dx * len, ey = by + dy * len, nx = -dy * 8, ny = dx * 8;
            line(S, bx - nx, by - ny, ex - nx, ey - ny, 3.4, WOOD(), .92, { bend: 0 }); line(S, bx + nx, by + ny, ex + nx, ey + ny, 3.4, WOOD(), .92, { bend: 0 });
            for (let k = 1; k <= 4; k++) { const f = k / 5; line(S, bx - nx + dx * len * f, by - ny + dy * len * f, bx + nx + dx * len * f, by + ny + dy * len * f, 2.4, WOOD(), .85, { bend: 0 }); }
            hatch = [hx, hy];
          }
          // the four walls as thick mud strokes, a broken ink edge inside
          const P4 = [p0, p1, p2, p3];
          for (let i = 0; i < 4; i++) { const [a2, b2] = [P4[i], P4[(i + 1) % 4]]; line(S, a2[0], a2[1], b2[0], b2[1], wallW * rnd(.85, 1.15), wcol, .85, { bend: rnd(-3, 3), nb: 3, prof: 'brush' }); }
          dry(S, inset.concat([inset[0]]), 1.5, C.ink, .45);
          const fade = clamp(1.35 - c.d * .5, .4, 1);
          return Object.assign(layer(S), { d: c.d, c, hatch, a: fade * (c.y0 > 1150 ? .8 : 1) });
        });
        // the note's anchor: the right wall of the most central room (a wall shared with the next one)
        const mid = cells[0];
        return { back, L, anchor: [(mid.q[1][0] + mid.q[2][0]) / 2, (mid.q[1][1] + mid.q[2][1]) / 2] };
      });
      const N = g.L.length;
      return {
        update(lt, dur, cues) {
          X.clear(); X.drawImage(g.back, 0, 0);
          X.save(); X.setTransform(st.k, 0, 0, st.k, st.ox, st.oy);
          // the town grows from the middle outward (all painted by ~2 s)
          g.L.forEach((L, i) => { const t0 = .1 + i / N * 1.6; drawLayer(X, L, seg(lt, t0, t0 + .6), L.a); });
          // smoke rising from a few hatches (seen from above: soft puffs drifting)
          if (P.smoke !== false) g.L.filter((L, i) => L.hatch && i % 5 === 2 && L.c.y0 < 1100).slice(0, 5).forEach((L, i) => {
            const k = ss(seg(lt, 1.2 + i * .2, 2.2 + i * .2)); if (k > 0) WC.smoke(X, L.hatch[0], L.hatch[1], 110, lt + i * 1.3, 20 + i, .3 * k, 1.2);
          });
          // a soft paper veil behind the subtitles
          const vg = X.createLinearGradient(0, 1130, 0, 1360); vg.addColorStop(0, WC.rgba(C.paperLight, 0)); vg.addColorStop(.3, WC.rgba(C.paperLight, .55)); vg.addColorStop(.7, WC.rgba(C.paperLight, .55)); vg.addColorStop(1, WC.rgba(C.paperLight, 0));
          X.fillStyle = vg; X.fillRect(0, 1130, 1080, 230);
          X.restore();
          if (P.note) {
            const t0 = WC.timeOf(P.note.at, cues, 1.6), [ax, ay] = g.anchor;
            WC.note(X, lt, t0, st.ox + ax * st.k, st.oy + ay * st.k, st.ox + (P.note.x ?? .56) * 1080 * st.k, st.oy + (P.note.y ?? .07) * 1920 * st.k, P.note.text, { size: 58 * st.k, col: P.note.color === 'red' ? C.red : C.ink });
          }
        },
      };
    },
  };
})();
