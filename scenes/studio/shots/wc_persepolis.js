// wc_persepolis — topic objects and a shot for "Persepolis yangını" (videos/2026-11-26/01-persepolis-yangini.json).
// Same contract as the other WC.G generators: local coordinates, y negative up, origin = base centre, painted in order.
// persian_column  one tall, slender Achaemenid column (Apadana type): a bell base, a fluted shaft, a floral bell and a
//                 volute block, the double-bull capital (two kneeling bull foreparts back to back, heads outward) with a
//                 cedar beam resting in the saddle between their necks. sc 1 ≈ 470 px tall, shaft ≈ 34 px wide.
//                 o: {h: shaft height ×, beam: true|false (default true), broken: 0.15–0.9 (a broken shaft, no capital),
//                 col: stone token, burnt: true (soot on the stone, charred beam)}   parts: capital beam base shaft top
// bull_capital    the double-bull capital alone (a plate subject). sc 1 ≈ 300 px wide. o: {beam, burnt, col}
//                 parts: head (the right bull's head), horn, saddle, beam, curls, base
// apadana         the audience hall on its terrace: a stone platform with a double stair and a relief band, a row of
//                 persian columns, cedar beams across their capitals (roof: false = no beams). sc 1 ≈ 760 px wide.
//                 o: {n: columns (6), roof: true|false, ruined: true (few columns standing, broken shafts, rubble, no
//                 beams), burnt: true, col}   parts: cols (x of each column top) terrace stair
// curtain         a heavy hanging textile between two columns, swaying very slowly. sc 1 ≈ 170 × 330 px. o: {color}
// wc_persepolis_fire  the palace at night, burning. params:
//   mode: "hall" (the Apadana on its terrace seen from below, fire between the columns, beams burning, embers and
//         smoke rising; default) | "throw" (inside the hall: a man with a torch on the left; on throw (s | cue) the
//         torch flies in an arc into a curtain between two columns and the fire climbs it) | "beams" (close, looking
//         up: one bull capital fills the frame, the cedar beams on it burning, embers falling)
//   at (hall: when the hall paints in, -1 = already painted, default -1) · fire_at (s | cue, default 0) ·
//   throw (s | cue, mode throw, default 1) · s (× size) · x (0..1) · sky ("night"|"dusk", default night) ·
//   notes: [{text, x, y, ax?, ay?, at, color, size, align}]
'use strict';
(() => {
  const C = WC.C, { mk, washShape, inkLine, mixc, along, qcurve, rnd, seg, ss, eio, timeOf, hash, clamp } = WC;
  const tok = (v, fb) => (v && C[v]) ? C[v] : fb;
  const circ = (cx, cy, rx, ry = rx, n = 20) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  // move a stroke list (strokes and wash polygons) by dx, dy, optionally mirrored about x = 0
  const shiftS = (S, dx, dy, flip = false) => {
    const f = flip ? -1 : 1;
    for (const s of S) {
      if (s.poly) { s.poly = s.poly.map(r => r.map(([x, y]) => [x * f + dx, y + dy])); s.pts = s.pts.map(([x, y]) => [x * f + dx, y + dy]); }
      else { s.pts = s.pts.map(([x, y]) => [x * f + dx, y + dy]); if (flip) s.nx = s.nx.map(v => -v); }
    }
    return S;
  };
  const stoneOf = o => mixc(tok(o.col, C.stone), C.paperLight, .18);

  // ------------------------------------------------------------------ one bull forepart (facing right)
  // origin = the saddle (centre of the capital, top of the volute block), u = half the capital width
  function bull(S, u, stone, o) {
    const ink = C.ink, sh = mixc(stone, C.stoneDark, .55), dk = mixc(stone, C.stoneDark, .75), P = pts => pts.map(([x, y]) => [x * u, y * u]);
    // the kneeling forepart: neck and chest, low and long, the back running into the saddle
    const body = P([[.04, 0], [.04, -.56], [.16, -.72], [.44, -.78], [.68, -.72], [.82, -.52], [.8, -.22], [.68, 0]]);
    const head = P([[.58, -.8], [.84, -.9], [1.08, -.82], [1.24, -.6], [1.28, -.42], [1.18, -.32], [1.0, -.34], [.86, -.44], [.7, -.58]]);
    S.push(washShape(body, stone, .8, 3, u * .02));
    S.push(washShape(P([[.46, -.76], [.68, -.72], [.82, -.52], [.8, -.22], [.68, 0], [.46, 0], [.58, -.4]]), sh, .38, 2, u * .02));
    S.push(washShape(P([[.06, -.2], [.5, -.1], [.76, -.26], [.78, -.04], [.06, 0]]), dk, .28, 2, u * .02));
    // dry brush across the stone (carved texture)
    for (let i = 0; i < 6; i++) { const y = -rnd(.1, .7) * u, x0 = rnd(.08, .3) * u; S.push(mk(qcurve(x0, y, x0 + rnd(.3, .45) * u, y + rnd(-.04, .04) * u, rnd(-.02, .02) * u, 8), rnd(.04, .07) * u, sh, { prof: 'leaf', nb: 5, a: rnd(.14, .26), rough: .45 })); }
    S.push(washShape(head, mixc(stone, C.paperLight, .12), .9, 3, u * .015));
    S.push(washShape(P([[.96, -.48], [1.0, -.34], [1.18, -.32], [1.28, -.42], [1.22, -.6], [1.08, -.58]]), dk, .45, 2, u * .01));
    // stylised curls: a band down the chest and a fringe on the brow
    for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) S.push(washShape(circ((.6 + k * .09 - r * .03) * u, (-.6 + r * .13) * u, .034 * u, .03 * u, 9), sh, .5, 2, u * .006));
    for (let k = 0; k < 4; k++) S.push(washShape(circ((.74 + k * .07) * u, (-.86 + k * .015) * u, .028 * u, .024 * u, 8), sh, .55, 2, u * .005));
    // folded foreleg, hoof forward under the chest
    S.push(mk(along(P([[.64, -.14], [.72, .04], [1.0, .06]]), 10), .12 * u, mixc(stone, C.stoneDark, .3), { prof: 'even', nb: 3, a: .92 }));
    S.push(...inkLine(P([[.64, -.14], [.72, .04], [1.0, .06]]), .018 * u, ink, { step: 1, a: .5 }));
    // horn: thick at the root, up and then forward; ear sideways-back; eye, nostril, mouth line
    S.push(mk(WC.qctrl(.76 * u, -.86 * u, .78 * u, -1.16 * u, 1.06 * u, -1.12 * u, 14), .14 * u, mixc(stone, C.stoneDark, .35), { prof: 'tip', nb: 3, a: .97 }));
    S.push(mk(WC.qctrl(.78 * u, -.88 * u, .8 * u, -1.14 * u, 1.04 * u, -1.12 * u, 14), .025 * u, ink, { prof: 'tip', nb: 0, a: .7 }));
    S.push(mk(qcurve(.68 * u, -.76 * u, .5 * u, -.7 * u, .04 * u, 6), .09 * u, dk, { prof: 'leaf', nb: 0, a: .8 }));
    S.push(washShape(circ(.98 * u, -.7 * u, .036 * u, .03 * u, 8), ink, .9, 1, 0));
    S.push(washShape(circ(1.22 * u, -.4 * u, .03 * u, .024 * u, 8), ink, .75, 1, 0));
    S.push(mk(qcurve(1.04 * u, -.36 * u, 1.2 * u, -.34 * u, .01 * u, 5), .015 * u, ink, { prof: 'tip', nb: 0, a: .55 }));
    if (o.burnt) S.push(washShape(P([[.1, -.5], [.3, -.76], [.6, -.8], [.9, -.88], [.6, -.6], [.3, -.3]]), mixc(C.ink, C.wood, .3), .3, 2, u * .03));
    S.push(...inkLine(body.slice(1, 7), .02 * u, ink, { step: 2, a: .55 }));
    S.push(...inkLine(head.concat([head[0]]), .018 * u, ink, { step: 2, a: .65 }));
  }

  // the capital: volute block (two pairs of scrolls) + the two bulls + the beam. origin = bottom of the block
  function capital(S, u, stone, o) {
    const ink = C.ink, sh = mixc(stone, C.stoneDark, .5), bh = .55 * u;
    // the vertical volute block: a tall slab with paired scrolls at both sides
    S.push(washShape([[-.34 * u, 0], [-.34 * u, -bh], [.34 * u, -bh], [.34 * u, 0]], stone, .85, 3, u * .015));
    S.push(washShape([[.08 * u, 0], [.08 * u, -bh], [.34 * u, -bh], [.34 * u, 0]], sh, .3, 2, u * .01));
    for (const sx of [-1, 1]) for (const yy of [-.14, -.4]) {
      const pts = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 1.7, r = .1 * u * (1 - i / 20); pts.push([sx * (.3 * u + Math.cos(a) * r * sx), yy * u + Math.sin(a) * r]); }
      S.push(mk(pts, .03 * u, mixc(stone, C.stoneDark, .6), { prof: 'even', nb: 0, a: .75 }));
    }
    for (let k = -2; k <= 2; k++) S.push(mk([[k * .09 * u, -.04 * u], [k * .09 * u, -bh + .04 * u]], .02 * u, sh, { prof: 'even', nb: 0, a: .45 }));
    S.push(...inkLine([[-.34 * u, 0], [-.34 * u, -bh], [.34 * u, -bh], [.34 * u, 0]], .02 * u, ink, { step: 1, a: .55 }));
    // the bulls, back to back, on the block
    const B1 = []; bull(B1, u, stone, o); shiftS(B1, 0, -bh); S.push(...B1);
    const B2 = []; bull(B2, u, stone, o); shiftS(B2, 0, -bh, true); S.push(...B2);
    // the cedar beam in the saddle, running toward the viewer (its end face) and a long beam across (o.beam)
    const sy = -bh - .74 * u;
    if (o.beam !== false) {
      const wood = o.burnt ? mixc(C.wood, C.ink, .45) : C.wood;
      S.push(washShape([[-.2 * u, sy + .06 * u], [-.2 * u, sy - .3 * u], [.2 * u, sy - .3 * u], [.2 * u, sy + .06 * u]], wood, .92, 3, u * .01));
      S.push(washShape(circ(0, sy - .12 * u, .12 * u, .12 * u, 14), mixc(wood, C.clothC, .35), .6, 2, u * .01));
      for (const r of [.04, .08]) S.push(mk(circ(0, sy - .12 * u, r * u, r * u, 14).concat([[r * u, sy - .12 * u]]), .012 * u, mixc(wood, ink, .4), { prof: 'even', nb: 0, a: .6 }));
      S.push(...inkLine([[-.2 * u, sy + .06 * u], [-.2 * u, sy - .3 * u], [.2 * u, sy - .3 * u], [.2 * u, sy + .06 * u]], .02 * u, ink, { step: 1, a: .7 }));
    }
    return { saddle: [0, sy], head: [1.05 * u, -bh - .6 * u], horn: [.95 * u, -bh - 1.1 * u], curls: [.62 * u, -bh - .5 * u], beam: [0, sy - .12 * u], top: -bh - 1.16 * u };
  }

  // ------------------------------------------------------------------ persian_column
  WC.G.persian_column = (sc, o = {}) => {
    const S = [], ink = C.ink, stone = stoneOf(o), sh = mixc(stone, C.stoneDark, .5);
    const w = 34 * sc, Hs = 330 * sc * (o.h ?? 1), u = 62 * sc;
    const broken = o.broken ? clamp(o.broken, .1, .95) : 0;
    // bell base (a reversed lotus) and torus
    const bb = [[-w * 1.5, 0], [-w * 1.35, -10 * sc], [-w * .9, -26 * sc], [-w * .62, -34 * sc], [w * .62, -34 * sc], [w * .9, -26 * sc], [w * 1.35, -10 * sc], [w * 1.5, 0]];
    S.push(washShape(bb, stone, .85, 3, 1.5 * sc));
    S.push(washShape(bb.slice(4).concat([[0, 0]]), sh, .35, 2, 1.5 * sc));
    for (let k = -3; k <= 3; k++) S.push(mk(qcurve(k * w * .2, -32 * sc, k * w * .45, -2 * sc, 0, 5), 1.6 * sc, sh, { prof: 'tip', nb: 0, a: .5 }));
    S.push(mk(along([[-w * .7, -38 * sc], [w * .7, -38 * sc]], 6), 9 * sc, mixc(stone, C.stoneDark, .2), { prof: 'even', nb: 3, a: .9 }));
    // the fluted shaft (tapering a little), broken at the top if o.broken
    const top = -38 * sc - Hs * (broken || 1);
    const shaft = [[-w * .5, -40 * sc], [-w * .44, top], [w * .44, top + (broken ? 10 * sc : 0)], [w * .5, -40 * sc]];
    if (broken) shaft.splice(2, 0, [-w * .1, top - 12 * sc], [w * .15, top + 4 * sc]);
    S.push(washShape(shaft, stone, .82, 3, 1.2 * sc));
    S.push(washShape([[w * .1, -40 * sc], [w * .1, top + 4 * sc], [w * .44, top + 6 * sc], [w * .5, -40 * sc]], sh, .38, 2, 1));
    for (let k = -3; k <= 3; k++) { const x = k * w * .13; S.push(mk(along([[x, -44 * sc], [x * .9, top + 6 * sc]], 12), 1.4 * sc, mixc(stone, C.stoneDark, .65), { prof: 'even', nb: 0, a: .35, rough: .3 })); }
    for (let i = 0; i < 5; i++) { const y = rnd(top, -60 * sc); S.push(mk([[-w * .45, y], [w * .45, y + rnd(-2, 2) * sc]], rnd(5, 9) * sc, sh, { prof: 'leaf', nb: 4, a: rnd(.1, .2), rough: .5 })); }
    if (o.burnt) S.push(washShape([[-w * .5, top + Hs * .35], [-w * .44, top], [w * .44, top], [w * .5, top + Hs * .2]], mixc(C.ink, C.wood, .3), .3, 2, 2 * sc));
    S.push(...inkLine([[w * .5, -40 * sc], [w * .44, top]], 1.8 * sc, ink, { step: 1, a: .55 }));
    S.push(...inkLine([[-w * .5, -40 * sc], [-w * .44, top]], 1.4 * sc, ink, { step: 1, a: .35 }));
    if (broken) return { S, top: [0, top - 12 * sc], parts: { top: [0, top], shaft: [0, top * .5], base: [0, -20 * sc] } };
    // floral bell under the capital (an inverted palm bell with drooping leaves)
    const fb = top, fh = 46 * sc;
    const bell = [[-w * .44, fb], [-w * .9, fb - fh * .6], [-w * 1.15, fb - fh], [w * 1.15, fb - fh], [w * .9, fb - fh * .6], [w * .44, fb]];
    S.push(washShape(bell, stone, .85, 3, 1.2 * sc));
    for (let k = -4; k <= 4; k++) S.push(mk(qcurve(k * w * .1, fb - 2 * sc, k * w * .28, fb - fh + 4 * sc, 0, 5), 2 * sc, sh, { prof: 'tip', nb: 0, a: .5 }));
    for (let k = -5; k <= 5; k++) S.push(mk(qcurve(k * w * .21, fb - fh, k * w * .25, fb - fh + 12 * sc, 3 * sc, 4), 5 * sc, sh, { prof: 'leaf', nb: 0, a: .5 }));
    S.push(...inkLine(bell, 1.6 * sc, ink, { step: 2, a: .5 }));
    const CS = []; const cp = capital(CS, u, stone, o); shiftS(CS, 0, fb - fh); S.push(...CS);
    const sy = fb - fh + cp.saddle[1];
    return { S, top: [0, fb - fh + cp.top], parts: { capital: [0, fb - fh - 40 * sc], beam: [0, sy - 8 * sc], base: [0, -20 * sc], shaft: [0, (top - 40 * sc) / 2], top: [0, fb - fh + cp.top] }, beamY: sy };
  };

  // ------------------------------------------------------------------ bull_capital
  WC.G.bull_capital = (sc, o = {}) => {
    const S = [], stone = stoneOf(o), u = 150 * sc;
    // a short stub of the floral bell under it, so it reads as the head of a column
    const sh = mixc(stone, C.stoneDark, .5);
    S.push(washShape([[-.26 * u, .35 * u], [-.4 * u, 0], [.4 * u, 0], [.26 * u, .35 * u]], stone, .8, 3, 2 * sc));
    for (let k = -4; k <= 4; k++) S.push(mk(qcurve(k * .05 * u, .34 * u, k * .095 * u, .02 * u, 0, 5), 2.4 * sc, sh, { prof: 'tip', nb: 0, a: .5 }));
    const p = capital(S, u, stone, o);
    shiftS(S, 0, -.35 * u);
    const m = ([x, y]) => [x, y - .35 * u];
    return { S, top: [0, p.top - .35 * u], parts: { head: m(p.head), horn: m(p.horn), saddle: m(p.saddle), beam: m(p.beam), curls: m(p.curls), base: [0, 0], center: m([0, -.6 * u]) } };
  };

  // ------------------------------------------------------------------ apadana
  WC.G.apadana = (sc, o = {}) => {
    const S = [], ink = C.ink, stone = stoneOf(o), sh = mixc(stone, C.stoneDark, .45), n = Math.max(2, Math.round(o.n ?? 6));
    const W = 760 * sc, th = 80 * sc, pitch = W * .86 / (n - 1);
    // the terrace: a long platform of dressed blocks, a relief band, a double stair in the middle
    const terr = [[-W * .55, 0], [-W * .55, -th], [W * .55, -th], [W * .55, 0]];
    S.push(washShape(terr, stone, .75, 3, 2 * sc));
    S.push(washShape([[-W * .55, -th * .3], [W * .55, -th * .3], [W * .55, 0], [-W * .55, 0]], sh, .3, 2, 2 * sc));
    for (const f of [.33, .66]) S.push(mk(along([[-W * .55, -th * f], [W * .55, -th * f]], 20), 2 * sc, sh, { prof: 'even', nb: 0, a: .45 }));
    for (let i = 0; i < 18; i++) { const x = -W * .53 + i * W * .062 + rnd(-4, 4) * sc; S.push(mk([[x, -th * .34], [x, -th * .64]], 2 * sc, sh, { prof: 'even', nb: 0, a: .4 })); }
    // a procession in the relief band: small upright figures
    for (let i = 0; i < 26; i++) { const x = -W * .5 + i * W * .04; if (Math.abs(x) < W * .1) continue; S.push(mk([[x, -th * .7], [x + 2 * sc, -th * .95]], 4 * sc, mixc(stone, C.stoneDark, .7), { prof: 'leaf', nb: 0, a: .45 })); }
    const st = [[-W * .1, 0], [-W * .05, -th], [W * .05, -th], [W * .1, 0]];
    S.push(washShape(st, mixc(stone, C.paperLight, .3), .7, 2, 1.5 * sc));
    for (let k = 1; k < 7; k++) { const y = -th * k / 7; S.push(mk([[-W * (.1 - .05 * k / 7), y], [W * (.1 - .05 * k / 7), y]], 1.6 * sc, sh, { prof: 'even', nb: 0, a: .6 })); }
    S.push(...inkLine(terr, 2 * sc, ink, { step: 1, a: .5 }));
    // the columns on top
    const cols = [];
    let beamY = null;
    const keep = o.ruined ? [0, 2, 3, n - 1] : null;
    for (let i = 0; i < n; i++) {
      const x = -W * .43 + i * pitch;
      if (o.ruined && !keep.includes(i)) {
        if (i % 2) { const cs = WC.G.persian_column(sc * .95, { broken: .12 + hash(i) * .2, col: o.col }).S; shiftS(cs, x, -th); S.push(...cs); }
        continue;
      }
      const opt = o.ruined ? { broken: i === 2 ? .7 : undefined, beam: false, col: o.col, burnt: o.burnt, h: 1 } : { beam: true, col: o.col, burnt: o.burnt };
      if (o.ruined && i === 2) opt.broken = .55;
      const g = WC.G.persian_column(sc * .95, opt);
      shiftS(g.S, x, -th); S.push(...g.S);
      cols.push([x, -th + g.top[1]]);
      if (g.beamY != null) beamY = -th + g.beamY;
    }
    // rubble on the ruined terrace
    if (o.ruined) for (let i = 0; i < 9; i++) { const x = rnd(-.5, .5) * W; S.push(washShape(WC.blobPts(x, -th - 6 * sc, rnd(10, 22) * sc, rnd(6, 10) * sc, 10, .3), mixc(stone, C.stoneDark, .3), .7, 2, 1)); }
    // the cedar beams across the capitals (and the roof's dark edge above)
    if (o.roof !== false && !o.ruined && beamY != null) {
      const wood = o.burnt ? mixc(C.wood, C.ink, .35) : C.wood;
      S.push(mk(along([[-W * .5, beamY - 14 * sc], [W * .5, beamY - 14 * sc]], 24), 22 * sc, wood, { prof: 'even', nb: 6, a: .92, rough: .25 }));
      S.push(mk(along([[-W * .52, beamY - 40 * sc], [W * .52, beamY - 40 * sc]], 24), 26 * sc, mixc(wood, C.ink, .3), { prof: 'even', nb: 6, a: .9, rough: .25 }));
      S.push(...inkLine([[-W * .52, beamY - 54 * sc], [W * .52, beamY - 54 * sc]], 2 * sc, ink, { step: 2, a: .6 }));
    }
    return { S, top: [0, (beamY ?? -th - 400 * sc) - 54 * sc], parts: { cols, terrace: [0, -th], stair: [0, -th * .5], beam: [0, (beamY ?? 0) - 14 * sc] }, cols, beamY };
  };

  // ------------------------------------------------------------------ curtain
  WC.G.curtain = (sc, o = {}) => {
    const S = [], cl = tok(o.color, C.cloth), w = 170 * sc, h = 330 * sc, ink = C.ink;
    const sh = [[-w / 2, -h], [w / 2, -h], [w * .46, -h * .35], [w * .55, 0], [-w * .5, 0], [-w * .42, -h * .4]];
    S.push(washShape(sh, cl, .8, 3, 2 * sc));
    for (let k = 0; k < 6; k++) { const x = -w * .4 + k * w * .16; S.push(mk(qcurve(x, -h + 6 * sc, x + rnd(-6, 6) * sc, -4 * sc, rnd(-8, 8) * sc, 10), 9 * sc, mixc(cl, ink, .35), { prof: 'leaf', nb: 4, a: .35 })); }
    S.push(mk(along([[-w * .55, -h], [w * .55, -h]], 8), 8 * sc, C.gold, { prof: 'even', nb: 2, a: .85 }));
    for (let k = 0; k < 9; k++) { const x = -w * .45 + k * w * .11; S.push(mk([[x, -6 * sc], [x, 8 * sc]], 3 * sc, C.gold, { prof: 'tip', nb: 0, a: .8 })); }
    S.push(...inkLine(sh.concat([sh[0]]), 1.6 * sc, ink, { step: 2, a: .5 }));
    return { S, sway: .012, top: [0, -h], parts: { center: [0, -h * .5], hem: [0, -h * .1] } };
  };

  // ------------------------------------------------------------------ toast_woman
  // a woman in a long dress, both arms raised, a gold goblet held up in her front hand (a toast). sc 1 = person size.
  // o: {cols (person colour tokens), face 'right'|'left'}   parts: cup head
  WC.G.toast_woman = (sc, o = {}) => {
    const p = WC.G.person(sc, { pose: 'point', dress: 'woman', scarf: false, cols: o.cols || { cloth: 'clothC' }, face: o.face || 'right' });
    const Hh = -p.top[1] / 1.005, dir = o.face === 'left' ? -1 : 1;
    const hand = [.34 * Hh * dir, -.81 * Hh];
    const cup = WC.G.cup(sc * .11, { style: 'goblet', shadow: false });
    const cs = cup.S;
    // the goblet's foot sits in the hand
    shiftS(cs, hand[0], hand[1] + 3 * sc);
    const S = p.S.concat(cs);
    return { S, live: p.live, top: [hand[0], hand[1] - 45 * sc], parts: { cup: [hand[0], hand[1] - 20 * sc], head: [p.top[0], p.top[1] + 14 * sc] } };
  };

  // ------------------------------------------------------------------ hall_wash
  // lamplight on a dark hall wall: big soft warm blooms and darker pools, dry-brush streaks. Absolute size
  // (ignores sc), origin = bottom centre. o: {w (1300), h (1200), warm: token (gold), dark: token (night)}
  WC.G.hall_wash = (sc, o = {}) => {
    const S = [], w = o.w ?? 1300, h = o.h ?? 1200, warm = tok(o.warm, C.gold), dark = tok(o.dark, C.night);
    for (let i = 0; i < 5; i++) S.push(washShape(WC.blobPts(rnd(-w * .45, w * .45), -rnd(h * .2, h * .9), rnd(220, 380), rnd(160, 300), 24, .22), dark, .22, 3, 8));
    for (const [x, y, r] of [[-.3, .45, 300], [.25, .55, 360], [0, .3, 260]]) { S.push(washShape(WC.blobPts(x * w, -y * h, r, r * .8, 26, .18), mixc(warm, C.paperLight, .3), .2, 3, 8)); S.push(washShape(WC.blobPts(x * w, -y * h, r * .55, r * .45, 22, .16), mixc(warm, C.fire, .25), .16, 3, 6)); }
    for (let i = 0; i < 14; i++) { const x = rnd(-w / 2, w / 2), y = -rnd(0, h); S.push(mk(qcurve(x, y, x + rnd(160, 340), y + rnd(-20, 20), rnd(-20, 20), 10), rnd(30, 60), i % 2 ? dark : mixc(warm, C.clothC, .4), { prof: 'leaf', nb: 7, a: rnd(.08, .16), rough: .5 })); }
    return { S, sway: 0 };
  };

  // ------------------------------------------------------------------ feast_table
  // the foreground of a banquet: a long low table under a dark red cloth, bowls, bread, grapes, a jug, a goblet
  // tipped over and spilt wine. Absolute size (ignores sc): origin = bottom centre. o: {w (1240), h (300), cloth}
  WC.G.feast_table = (sc, o = {}) => {
    const S = [], w = o.w ?? 1240, h = o.h ?? 300, ink = C.ink, cl = tok(o.cloth, C.cloth), top = -h;
    S.push(washShape([[-w / 2, top + 30], [w / 2, top + 30], [w / 2 + 20, 20], [-w / 2 - 20, 20]], mixc(cl, ink, .25), .85, 3, 4));
    for (let k = 0; k < 12; k++) { const x = -w * .48 + k * w * .087; S.push(mk(qcurve(x, top + 40, x + rnd(-10, 10), 10, rnd(-10, 10), 10), 18, mixc(cl, ink, .45), { prof: 'leaf', nb: 4, a: .3 })); }
    S.push(washShape([[-w / 2 - 10, top], [w / 2 + 10, top], [w / 2 + 10, top + 40], [-w / 2 - 10, top + 40]], mixc(cl, C.gold, .15), .85, 3, 3));
    S.push(mk(along([[-w / 2, top + 40], [w / 2, top + 40]], 20), 6, C.gold, { prof: 'even', nb: 2, a: .7 }));
    // bowls of fruit and bread along the top
    const items = [[-.38, 'bowl'], [-.16, 'bread'], [.08, 'grapes'], [.3, 'bowl'], [.42, 'bread']];
    for (const [f, kind] of items) {
      const x = f * w, y = top + 8;
      if (kind === 'bowl') { S.push(washShape([[x - 60, y - 18], [x + 60, y - 18], [x + 40, y + 6], [x - 40, y + 6]], mixc(C.roof, C.clothC, .3), .9, 2, 2)); for (let i = 0; i < 5; i++) S.push(washShape(circ(x - 36 + i * 18, y - 26 - (i % 2) * 8, 13, 12, 10), i % 2 ? C.gold : mixc(C.red, C.fire, .3), .85, 2, 1)); }
      if (kind === 'bread') S.push(washShape(WC.blobPts(x, y - 14, 46, 18, 16, .12), mixc(C.clothC, C.wood, .3), .9, 2, 2));
      if (kind === 'grapes') for (let i = 0; i < 12; i++) S.push(washShape(circ(x + (i % 4) * 14 - 20 + (i > 7 ? 7 : 0), y - 12 - Math.floor(i / 4) * 12, 9, 9, 8), mixc(C.night, C.cloth, .4), .9, 1, 0));
    }
    // a spilt goblet and a dark wine stain
    S.push(washShape(WC.blobPts(-w * .02, top + 18, 80, 12, 16, .25), mixc(C.cloth, C.night, .35), .7, 2, 2));
    const gob = WC.G.cup(.42, { style: 'goblet', shadow: false });
    const rot = -1.45, cs = Math.cos(rot), sn = Math.sin(rot);
    for (const s of gob.S) { const r = ([x, y]) => [x * cs - y * sn - w * .07, x * sn + y * cs + top + 4]; if (s.poly) { s.poly = s.poly.map(q => q.map(r)); s.pts = s.pts.map(r); } else { s.pts = s.pts.map(r); const nx = s.nx, ny = s.ny; s.nx = nx.map((v, i) => v * cs - ny[i] * sn); s.ny = nx.map((v, i) => v * sn + ny[i] * cs); } }
    S.push(...gob.S);
    S.push(...inkLine([[-w / 2 - 10, top], [w / 2 + 10, top]], 2, ink, { step: 2, a: .5 }));
    return { S };
  };

  // ------------------------------------------------------------------ live helpers
  const glowAt = (X, x, y, r, a, col = C.fire) => {
    if (a <= 0) return;
    const g = X.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, WC.rgba(col, a)); g.addColorStop(.5, WC.rgba(col, a * .45)); g.addColorStop(1, WC.rgba(col, 0));
    X.fillStyle = g; X.beginPath(); X.arc(x, y, r, 0, 7); X.fill();
  };
  // embers: small sparks rising (dir -1) or falling (dir 1) in a box, deterministic in lt
  const embers = (X, x0, x1, y0, y1, lt, n, a, dir = -1, seed = 0) => {
    for (let i = 0; i < n; i++) {
      const sp = .08 + hash(i * 3.7 + seed) * .12, ph = ((hash(i * 1.3 + seed) + lt * sp) % 1);
      const y = dir < 0 ? y1 - ph * (y1 - y0) : y0 + ph * (y1 - y0);
      const x = x0 + hash(i * 9.1 + seed) * (x1 - x0) + Math.sin(lt * 1.1 + i) * 18 + ph * 40;
      const al = a * Math.sin(Math.PI * ph);
      if (al <= .02) continue;
      X.fillStyle = WC.rgba(i % 3 ? C.gold : C.fire, al);
      X.beginPath(); X.arc(x, y, 2.2 + hash(i + seed) * 2.8, 0, 7); X.fill();
    }
  };
  // a painted flame: three translucent washes (fire, orange, gold core) with jittered wet edges, one dry-brush
  // stroke up its middle; deterministic per (i, lt)
  const pflame = (X, x, y, h, lt, i = 0, k = 1) => {
    if (h < 4) return;
    WC.withSeed(900 + i * 7, () => {
      const w = h * (.26 + .22 * hash(i * 1.31)), lean = (hash(i * 2.93) - .5) * .7, wob = .08 + .1 * hash(i * 4.1), sp = 3 + 2.5 * hash(i * 5.7);
      const tongue = (x0, hh, ww, ph) => {
        for (const [cc, wf, hf, a] of [[C.fire, 1, 1, .32], [mixc(C.fire, C.gold, .45), .7, .78, .38], [mixc(C.gold, C.paperLight, .2), .38, .5, .46]]) {
          const L = [], R = [];
          for (let k2 = 0; k2 <= 10; k2++) {
            const s2 = k2 / 10, yy = y - hh * hf * s2, half = ww * wf * Math.pow(Math.sin(Math.PI * Math.min(1, s2 * .85 + .15)), .9) * (1 - s2 * .55);
            const xo = (Math.sin(s2 * sp + lt * 3.6 + ph) * wob + lean * .3) * hh * s2;
            L.push([x0 + xo - half, yy]); R.push([x0 + xo + half * (.8 + .4 * hash(i + k2)), yy]);
          }
          WC.wash(X, L.concat(R.reverse()), cc, a * k, 2, hh * .03);
        }
      };
      tongue(x, h, w, i * 1.7);
      if (hash(i * 7.7) > .35) tongue(x + w * (hash(i * 3.3) > .5 ? .7 : -.7), h * (.4 + .3 * hash(i * 8.1)), w * .6, i * 2.3 + 1);
      const cpts = []; for (let k2 = 0; k2 <= 8; k2++) { const s2 = k2 / 8; cpts.push([x + Math.sin(s2 * 3 + lt * 4.2 + i * 1.7) * h * .13 * s2, y - h * .85 * s2]); }
      WC.drawS(X, mk(cpts, w * .5, C.fire, { prof: 'tip', nb: 5, a: .3 * k, rough: .4 }), 1);
    });
  };
  const drawNotes = (X, lt, cues, notes, W, H, portrait) => {
    for (const n of (notes || [])) {
      const nt = timeOf(n.at, cues, 1.2);
      if (n.ax != null) WC.note(X, lt, nt, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size: n.size || (portrait ? 54 : 44), col: n.color === 'red' ? C.red : C.ink, bend: n.bend });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, nt, nt + 1), { size: n.size || (portrait ? 58 : 46), align: n.align || 'center', col: n.color === 'red' ? C.red : C.ink });
    }
  };

  // ------------------------------------------------------------------ wc_persepolis_fire
  SHOTS.wc_persepolis_fire = { kind: '2d', build(ctx) {
    const P = ctx.P || {}, { W, H } = ctx, portrait = H > W, mode = P.mode || 'hall';
    const X = WC.canvas(ctx);
    const sky = P.sky || 'night';
    const k0 = portrait ? 1.45 : 1;

    if (mode === 'beams') {
      // close, looking up into the roof: three great cedar beams across the frame (the middle one broken and sagging),
      // the planks above them, fire running along them, embers falling, smoke rolling under the roof
      const back = WC.withSeed(ctx.seed * 7 + 1, () => {
        const cv = WC.backdrop(W, H, H * .985, { sky: 'none', land: 'interior', wall: 'night', floor: 'stoneDark', horizon: .985 });
        const c = cv.getContext('2d');
        for (let i = 0; i < 7; i++) WC.wash(c, WC.blobPts(WC.rnd(0, W), WC.rnd(0, H * .7), WC.rnd(200, 420), WC.rnd(140, 260), 24, .2), i % 2 ? C.night : mixc(C.night, C.fire, .25), .22, 3, 8);
        for (let i = 0; i < 9; i++) WC.wash(c, WC.blobPts(WC.rnd(0, W), WC.rnd(H * .62, H), WC.rnd(220, 420), WC.rnd(100, 200), 24, .22), i % 3 ? C.smoke : mixc(C.fire, C.smoke, .5), .24, 3, 8);
        return cv;
      });
      const bw = portrait ? 120 : 84;
      const beams = WC.withSeed(ctx.seed + 3, () => {
        const L = [], wood = mixc(C.wood, C.ink, .25), wd = mixc(C.wood, C.ink, .55);
        // the planks of the roof above (dark, far)
        for (let k = 0; k < 9; k++) { const y = H * .04 + k * 34; L.push(mk(along([[-60, y], [W + 60, y + WC.rnd(-6, 6)]], 20), 30, mixc(wd, C.night, .3), { prof: 'even', nb: 6, a: .55, rough: .3 })); }
        const beam = (pts, w) => { const st = mk(along(pts, 30), w, wood, { prof: 'even', nb: 9, a: .95, rough: .18 }); L.push(st, WC.edgeOf(st, 1, w * .3, wd, .7), WC.edgeOf(st, -1, w * .08, mixc(C.fire, C.gold, .3), .55)); for (let g = 0; g < 5; g++) L.push(mk(along(pts.map(([x, y]) => [x, y + (g - 2) * w * .14]), 30), 2.4, wd, { prof: 'even', nb: 0, a: .45, rough: .5 })); };
        beam([[-60, H * .2], [W + 60, H * .15]], bw);
        beam([[-60, H * .36], [W * .5, H * .44], [W + 60, H * .35]], bw * .95);            // cracked, sagging in the middle
        beam([[-60, H * .58], [W + 60, H * .55]], bw * 1.05);
        // the crack: a dark split with a glowing core
        L.push(mk(qcurve(W * .47, H * .42, W * .53, H * .46, 8, 6), 10, C.ink, { prof: 'tip', nb: 0, a: .85 }));
        return L;
      });
      const rows = [[H * .19, -.06], [H * .39, 0], [H * .58, -.04]];
      return { update(lt, dur, cues) {
        cues = cues || {};
        X.clear(); X.drawImage(back, 0, 0);
        const f0 = timeOf(P.fire_at, cues, 0), k = ss(seg(lt, f0, f0 + 1.2));
        glowAt(X, W * .5, H * .4, W * 1.1, .4 * (.6 + .4 * k) * (1 + .05 * Math.sin(lt * 3)));
        WC.smoke(X, W * .2, H * .2, H * .25, lt, 1, .55, 1.2);
        WC.smoke(X, W * .7, H * .18, H * .22, lt, 2, .45, -1);
        for (const st of beams) WC.drawS(X, st, 1);
        for (const [r, [y0, sl]] of rows.entries()) for (let j = 0; j < 12; j++) {
          const x = W * (-.02 + j * .092) + (hash(j + r * 9) - .5) * 70, y = y0 + sl * (x - W / 2) * .2 - bw * (.2 + .25 * hash(j * 5 + r));
          const big = r === 1 && Math.abs(x - W * .5) < W * .2 ? 1.6 : 1;
          const hh = (portrait ? 240 : 160) * big * (.3 + .7 * Math.pow(hash(j * 3 + r), 1.4)) * (.5 + .5 * k) * (1 + .18 * Math.sin(lt * 1.3 + j * 1.7 + r));
          pflame(X, x, y, hh, lt, r * 10 + j, .5 + .5 * k);
        }
        WC.smoke(X, W * .35, H * .95, H * .3, lt, 3, .4, .5);
        WC.smoke(X, W * .8, H * .98, H * .28, lt, 4, .35, -.4);
        embers(X, 0, W, H * .55, H * .98, lt, 70, .95, 1, 7);
        drawNotes(X, lt, cues, P.notes, W, H, portrait);
      } };
    }

    if (mode === 'toast') {
      // a gold goblet on the banquet table in front, the burning Apadana far behind it in the night
      const gy = H * (portrait ? .5 : .62);
      const back = WC.withSeed(ctx.seed * 7 + 4, () => {
        const cv = WC.backdrop(W, H, gy, { sky: 'night', land: 'plain', sun: false, clouds: false, horizon: gy / H, amp: .4 });
        const c = cv.getContext('2d');
        for (let i = 0; i < 6; i++) WC.wash(c, WC.blobPts(WC.rnd(0, W), WC.rnd(0, gy), WC.rnd(220, 420), WC.rnd(120, 220), 24, .2), i % 3 ? C.night : mixc(C.night, C.cloth, .35), .25, 3, 8);
        return cv;
      });
      const hall = WC.make('apadana', Math.round((portrait ? .92 : .8) * 100) / 100, { n: 5, burnt: true }, 2);
      const hx = W * .5, hy = gy + 10;
      const cols = hall.cols.map(([x, y]) => [hx + x, hy + y]), by = hy + (hall.beamY ?? -300);
      const cupS = Math.round((P.s ?? 1) * (portrait ? 2.3 : 1.6) * 100) / 100;
      const cup = WC.make('cup', cupS, { style: 'goblet' }, 9);
      const cupUnder = WC.sprite(cup.S, C.paperLight);   // a solid paper underlay: the goblet is not see-through
      const table = WC.make('feast_table', 1, { w: W * 1.2, h: H * (portrait ? .34 : .3), cloth: 'cloth' }, 7);
      const cupX = W * (P.x ?? .5), tableY = H * (portrait ? 1.0 : 1.02), cupY = tableY - H * (portrait ? .34 : .3) + 6;
      return { update(lt, dur, cues) {
        cues = cues || {};
        X.clear(); X.drawImage(back, 0, 0);
        const f0 = timeOf(P.fire_at, cues, 0), k = ss(seg(lt, f0, f0 + 1.2)), fl = 1 + .06 * Math.sin(lt * 3.1);
        glowAt(X, hx, by, W * .75, .5 * k * fl);
        WC.smoke(X, hx - W * .15, by - 40, H * .4, lt, 1, .5 * k, .7);
        WC.smoke(X, hx + W * .15, by - 60, H * .42, lt, 2, .45 * k, .9);
        WC.drawObj(X, hall, hx, hy, 1);
        for (let i = 0; i < cols.length - 1; i++) {
          const x0 = cols[i][0], x1 = cols[i + 1][0];
          for (let j = 0; j < 3; j++) pflame(X, x0 + (x1 - x0) * (.25 + j * .25), hy - 72, (portrait ? 230 : 160) * (.6 + .4 * hash(i * 3 + j)) * (1 + .15 * Math.sin(lt * 1.6 + i + j)), lt, i * 3 + j, k);
        }
        for (let j = 0; j < 10; j++) pflame(X, hx - W * .44 + j * W * .098, by - 24, (portrait ? 130 : 90) * (.6 + .4 * hash(j * 2.7)), lt, j + 40, k);
        embers(X, 0, W, H * .02, by, lt, 40, .9 * k, -1, 1);
        // the table and the goblet in front, lit warm from behind
        WC.drawObj(X, table, W * .5, tableY, 1);
        glowAt(X, cupX, cupY - H * .14, W * .3, .18 * k, C.gold);
        X.save(); X.translate(cupX, cupY); X.rotate(.01 * Math.sin(lt * .8)); X.drawImage(cupUnder.cv, cupUnder.x0, cupUnder.y0); X.restore();
        WC.drawObj(X, cup, cupX, cupY, 1, { rot: .01 * Math.sin(lt * .8) });
        drawNotes(X, lt, cues, P.notes, W, H, portrait);
      } };
    }

    if (mode === 'throw') {
      // inside the hall at night: columns, a curtain between two of them, a man throwing a torch into it
      const gy = H * (portrait ? .6 : .72);
      const back = WC.withSeed(ctx.seed * 7 + 2, () => {
        const cv = WC.backdrop(W, H, gy, { sky: 'none', land: 'interior', wall: 'night', floor: 'stoneDark', horizon: gy / H });
        const c = cv.getContext('2d'), hw = WC.G.hall_wash(1, { w: W * 1.1, h: gy });
        c.save(); c.translate(W / 2, gy); WC.drawList(c, hw.S, 1); c.restore();
        return cv;
      });
      const colS = (portrait ? 1.6 : 1.15) * (P.s ?? 1);
      const col = WC.make('persian_column', Math.round(colS * 100) / 100, { beam: true }, 3);
      const colFar = WC.make('persian_column', Math.round(colS * .62 * 100) / 100, { beam: true }, 4);
      const table = WC.make('feast_table', 1, { w: W * 1.15, h: H * .3 }, 7);
      const cur = WC.make('curtain', Math.round(colS * 1.05 * 100) / 100, { color: 'cloth' }, 6);
      const man = WC.make('person', Math.round(k0 * 1.9 * 100) / 100, { pose: 'raise', dress: 'robe', cape: 'cloth', headgear: 'bare', beard: true, cols: { cloth: 'clothC' }, face: 'right' }, 8);
      const cxA = W * .52, cxB = W * .97, curX = W * .745, manX = W * .19;
      const curTop = gy + cur.top[1];
      const hand = [manX + man.top[1] * -.09, gy + man.top[1] * 1.11];    // the raised front hand (≈ .09 H forward, 1.135 H up)
      const hit = [curX - 10, gy - (gy - curTop) * .45];
      const torchS = WC.withSeed(ctx.seed + 9, () => [mk([[0, 0], [0, -70 * k0]], 11 * k0, C.wood, { prof: 'even', nb: 3, a: .95 })]);
      return { update(lt, dur, cues) {
        cues = cues || {};
        X.clear(); X.drawImage(back, 0, 0);
        const t0 = timeOf(P.throw, cues, 1), fl = .9, q = seg(lt, t0, t0 + fl);
        const fk = ss(seg(lt, t0 + fl, t0 + fl + 1.4));
        glowAt(X, manX, hand[1], W * .35, .2 * (1 - fk * .5));
        if (fk > 0) glowAt(X, curX, hit[1], W * .8, .38 * fk * (1 + .05 * Math.sin(lt * 4)));
        WC.drawObj(X, colFar, W * .08, gy - 30, 1, { a: .55 });
        WC.drawObj(X, colFar, W * .36, gy - 30, 1, { a: .55 });
        WC.drawObj(X, col, cxA, gy, 1);
        WC.drawObj(X, col, cxB, gy, 1);
        const sk = .012 * Math.sin(lt * 1.1);
        WC.drawObj(X, cur, curX, gy, 1, { sk });
        if (fk > 0) X.save(), X.globalAlpha = .55 * fk, X.fillStyle = WC.rgba(C.ink, .5), X.fillRect(curX - 90 * colS, curTop + (gy - curTop) * (1 - fk * .8), 180 * colS, (gy - curTop) * fk * .8), X.restore();
        WC.drawObj(X, man, manX, gy, 1);
        WC.drawObj(X, table, W * .5, H * .96, 1);
        // the torch: in the hand, then flying in an arc, then lying in the fire
        let tx, ty, rot;
        if (q <= 0) { tx = hand[0]; ty = hand[1] + 10; rot = .2; }
        else { const e = eio(q); tx = WC.mix(hand[0], hit[0], e); ty = WC.mix(hand[1], hit[1], e) - Math.sin(Math.PI * e) * H * .14; rot = .2 + e * 2.6; }
        if (q < 1) {
          X.save(); X.translate(tx, ty); X.rotate(rot); for (const s of torchS) WC.drawS(X, s, 1); X.restore();
          pflame(X, tx + Math.sin(rot) * 70 * k0, ty - Math.cos(rot) * 70 * k0, 80 * k0, lt, 2); glowAt(X, tx, ty - 60, 160, .35);
        }
        // the fire climbing the curtain
        if (fk > 0) {
          for (let i = 0; i < 6; i++) {
            const fx = curX - 80 * colS + i * 32 * colS, hh = (gy - curTop) * (.25 + .55 * fk) * (.7 + .3 * hash(i * 3.1)) * (1 + .15 * Math.sin(lt * 2 + i));
            pflame(X, fx, hit[1] + (gy - hit[1]) * .5, hh, lt, i + 4);
          }
          WC.smoke(X, curX, curTop + 40, H * .35, lt, 3, .4 * fk, .4);
          embers(X, curX - 200, curX + 200, curTop - 200, hit[1], lt, 26, .8 * fk, -1, 3);
        }
        drawNotes(X, lt, cues, P.notes, W, H, portrait);
      } };
    }

    // hall: the Apadana on its terrace at night, burning
    const gy = H * (P.horizon ?? (portrait ? .62 : .74));
    const back = WC.withSeed(ctx.seed * 7 + 3, () => {
      const cv = WC.backdrop(W, H, gy, { sky, land: 'plain', sun: false, clouds: false, horizon: gy / H, amp: .5 });
      // night: soft blooms of night pigment and a smoky red over sky and land (baked once), not a flat glaze
      const c = cv.getContext('2d');
      for (let i = 0; i < 8; i++) WC.wash(c, WC.blobPts(WC.rnd(0, W), WC.rnd(0, H * .55), WC.rnd(220, 440), WC.rnd(120, 240), 24, .2), i % 3 ? C.night : mixc(C.night, C.cloth, .35), .26, 3, 8);
      for (let i = 0; i < 4; i++) WC.wash(c, WC.blobPts(WC.rnd(0, W), WC.rnd(gy, H), WC.rnd(260, 480), WC.rnd(80, 160), 24, .2), mixc(C.night, C.ground, .4), .3, 3, 8);
      return cv;
    });
    const aS = (P.s ?? 1) * (portrait ? 1.32 : 1.25);
    const hall = WC.make('apadana', Math.round(aS * 100) / 100, { n: P.n ?? 5, burnt: true }, 2);
    const hx = (P.x ?? .5) * W, hy = gy + (portrait ? 40 : 20);
    const fgRocks = WC.make('rock', Math.round(k0 * 1.4 * 100) / 100, {}, 11), fgGrass = WC.make('grass', Math.round(k0 * 1.6 * 100) / 100, {}, 12);
    const cols = hall.cols.map(([x, y]) => [hx + x, hy + y]);
    const by = hy + (hall.beamY ?? -300);
    const at = P.at ?? -1, pd = 1.4;
    return { update(lt, dur, cues) {
      cues = cues || {};
      X.clear(); X.drawImage(back, 0, 0);
      const f0 = timeOf(P.fire_at, cues, 0), k = ss(seg(lt, f0, f0 + 1.2));
      const flick = 1 + .06 * Math.sin(lt * 3.1) + .04 * Math.sin(lt * 7.3);
      glowAt(X, hx, by, W * (portrait ? .85 : .6), .42 * k * flick);
      WC.smoke(X, hx - W * .18, by - 40, H * .45, lt, 1, .5 * k, .7);
      WC.smoke(X, hx + W * .12, by - 60, H * .5, lt, 2, .45 * k, .9);
      const p = at === -1 ? 1 : seg(lt, timeOf(at, cues, 0), timeOf(at, cues, 0) + pd);
      WC.drawObj(X, hall, hx, hy, p);
      if (k > 0) {
        // a wall of fire between the columns, standing on the terrace, and fire along the burning beams
        const ty = hy - 80 * aS;
        for (let i = 0; i < cols.length - 1; i++) {
          const x0 = cols[i][0], x1 = cols[i + 1][0];
          for (let j = 0; j < 4; j++) {
            const fx = x0 + (x1 - x0) * (.2 + j * .2), hh = (portrait ? 330 : 220) * k * (.55 + .45 * hash(i * 4 + j)) * (1 + .15 * Math.sin(lt * 1.6 + i * 2.1 + j));
            pflame(X, fx, ty, hh, lt, i * 4 + j);
          }
          glowAt(X, (x0 + x1) / 2, ty - 120, 260, .3 * k);
        }
        for (let j = 0; j < 14; j++) { const fx = hx - W * .48 + j * W * .074, hh = (portrait ? 200 : 140) * k * (.6 + .4 * hash(j * 2.7)) * (1 + .2 * Math.sin(lt * 2 + j)); pflame(X, fx, by - 30, hh, lt, j + 30); }
        embers(X, hx - W * .5, hx + W * .5, H * .02, by, lt, 60, .95 * k, -1, 1);
      }
      // firelight on the ground in front of the terrace
      glowAt(X, hx, hy + 60, W * .75, .28 * k * flick);
      // the foreground: dark rocks and grass under the subtitles
      WC.drawObj(X, fgRocks, W * .14, H * .93, 1, { a: 1 });
      WC.drawObj(X, fgGrass, W * .8, H * .93, 1, { sk: .02 * Math.sin(lt * 1.2) });
      WC.drawObj(X, fgGrass, W * .4, H * .96, 1, { sk: .02 * Math.sin(lt * 1.4 + 1) });
      drawNotes(X, lt, cues, P.notes, W, H, portrait);
    } };
  } };
})();
