// wc_phaistos — the Phaistos Disc (Stickstory ag-02, 2026-11-24): the fired clay disc with its spiral of stamped
// signs, one stamped sign, a stamp, and three shots. Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9).
// Deterministic (WC.rnd inside WC.make / WC.withSeed), colours only from WC.C tokens. The sign shapes are invented,
// only inspired by the real sign families (plumed head, fish, bird, ship, rosette, shield, walker, branch); they are
// not replicas.
//
// Objects (WC.G; origin = base centre, y up negative, sc 1 = natural size):
//   phaistos_disc   the disc ≈ 300 px across: pale fired clay, an incised spiral running from the rim to the centre,
//                   word dividers, signs stamped between the turns, five dots at the start.
//                   o: tilt (1 = seen face on; .35–.6 = lying on a table, its thickness shows), side 'A'|'B' (another
//                   sequence of signs), turns (4.2), r (radius ×)          parts: center rim sign edge
//   phaistos_sign   one stamped sign on a small patch of clay. o: sign 'head'|'fish'|'bird'|'ship'|'rosette'|
//                   'shield'|'walker'|'branch'                             parts: sign
//   phaistos_stamp  a small wooden stamp with a round knob, seen from the side, ≈ 230 px tall.  parts: face knob
//
// Shots:
//   wc_phaistos_disc   the disc alone. params: {mode: "hero" (face on, big, over a warm bloom, turning very slowly)
//       | "museum" (upright on a stand in a glass case, a dark room, a pool of light, dust drifting in it),
//       at (when it paints in: s | cue | -1 = already painted, default -1), paint (s), turn (degrees over the scene,
//       default 5), y (centre 0..1), size (×), side, notes: [{text, x, y, ax?, ay?, at, color, size, align}]}
//   wc_phaistos_signs  close-up on the clay: the rim and two turns of the spiral fill the frame; big signs stamped
//       in one by one. params: {signs: [{sign, at, label}], others: [sign names already there, lower turn],
//       labels on the paper above the rim with pen lines}
//   wc_phaistos_stamp  the disc lying on a table, close: a hand brings a stamp down, presses it into the clay
//       (cue/at "press"), lifts it, and the new sign is there next to the ones already pressed.
//       params: {sign (the new one, default "head"), done: [names already pressed], press: s | cue,
//                notes: [{text, x, y, ax?, ay?, at, color, size}]}
'use strict';

(() => {
  const C = WC.C, { rnd, pick, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eo, eio } = WC;
  const PI = Math.PI, TAU = PI * 2;

  const clay = () => mixc(C.ground, C.roof, .26);
  const clayLite = () => mixc(clay(), C.paperLight, .38);
  const clayDark = () => mixc(clay(), C.wood, .5);
  const dent = () => mixc(clay(), C.ink, .58);
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 48) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  // ------------------------------------------------------------ the signs (unit box ≈ 1 tall, centred on 0,0)
  // each is a list of polylines; a polyline of one point is a dot
  const arc = (cx, cy, rx, ry, a0, a1, n = 10) => ell(cx, cy, rx, ry, a0, a1, n);
  const GL = {
    head: () => {
      const L = [arc(.02, .02, .22, .28, -1.25, 3.9, 16)];                       // skull + face, open at the neck
      L.push([[-.12, .28], [-.14, .46]], [[.13, .27], [.1, .46]]);              // neck
      L.push([[.27, .02], [.33, .07], [.25, .12]]);                             // nose
      L.push([[.1, -.04]]);                                                     // eye
      for (let k = 0; k < 7; k++) { const a = -2.75 + k * .24, x = .02 + Math.cos(a) * .24, y = .02 + Math.sin(a) * .3; L.push([[x, y], [x + Math.cos(a) * .2, y + Math.sin(a) * .2]]); }  // the crest
      return L;
    },
    fish: () => [
      qcurve(-.36, 0, .36, 0, -.2, 10), qcurve(-.36, 0, .36, 0, .17, 10),
      [[-.36, 0], [-.52, -.2], [-.46, 0], [-.52, .2], [-.36, 0]],
      [[.2, -.04]], [[-.02, -.14], [-.1, -.27]], [[0, .13], [-.08, .24]],
    ],
    bird: () => [
      qcurve(-.42, .14, .2, -.06, -.12, 10), qcurve(-.3, .12, .2, -.02, .16, 10),
      arc(.28, -.12, .09, .08, 0, TAU, 10), [[.36, -.13], [.48, -.1]],
      qcurve(-.04, -.06, -.26, -.38, .1, 8), [[-.04, .14], [-.08, .3]], [[.06, .12], [.06, .3]],
    ],
    ship: () => [
      qcurve(-.46, -.12, .44, -.3, .32, 14), [[-.46, -.12], [-.5, -.3]], [[.44, -.3], [.5, -.44]],
      qcurve(-.36, -.02, .34, -.12, .05, 8),
      [[-.2, .08], [-.24, .3]], [[0, .09], [-.04, .31]], [[.2, .03], [.16, .26]],
      [[-.1, -.1], [-.1, -.42]],
    ],
    rosette: () => {
      const L = [arc(0, 0, .08, .08, 0, TAU, 8)];
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; L.push(arc(Math.cos(a) * .26, Math.sin(a) * .26, .11, .11, 0, TAU, 9)); }
      return L;
    },
    shield: () => {
      const L = [arc(0, 0, .34, .34, 0, TAU, 18)];
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; L.push([[Math.cos(a) * .19, Math.sin(a) * .19]]); }
      L.push([[0, 0]]);
      return L;
    },
    walker: () => [
      arc(.04, -.34, .09, .1, 0, TAU, 10), [[.02, -.24], [-.02, .1]], [[-.02, .1], [-.2, .44]], [[-.02, .1], [.18, .42]],
      [[.01, -.14], [-.2, .02]], [[.01, -.14], [.22, -.02]],
    ],
    branch: () => {
      const L = [qcurve(0, .46, .02, -.46, .05, 10)];
      for (let k = 0; k < 4; k++) { const y = .3 - k * .22; L.push(qcurve(.01, y, -.24, y - .14, .03, 5), qcurve(.01, y - .06, .24, y - .2, -.03, 5)); }
      return L;
    },
  };
  const NAMES = Object.keys(GL);
  const WEIGHT = ['head', 'head', 'head', 'fish', 'bird', 'ship', 'rosette', 'shield', 'shield', 'walker', 'branch', 'rosette', 'head', 'fish'];

  // stamp one sign into the strokes S: centre (cx, cy), size, rotation, vertical squash (tilt); a dark impressed
  // stroke and a thin pale rim on its lower side (light from the top-left)
  function stampSign(S, name, cx, cy, size, rot = 0, tilt = 1, o = {}) {
    const c = Math.cos(rot), s = Math.sin(rot), T = ([x, y]) => [cx + (x * c - y * s) * size, cy + (x * s + y * c) * size * tilt];
    const w = Math.max(1, size * (o.w ?? .075)), dk = o.col || dent();
    for (const pl of GL[name]()) {
      if (pl.length === 1) {
        const [x, y] = T(pl[0]);
        S.push(mk([[x - w * .5, y], [x + w * .5, y + .2]], w * 1.5, dk, { prof: 'even', nb: 0, a: .85, rough: .1 }));
        continue;
      }
      const P = along(pl.map(T), Math.max(4, Math.min(16, pl.length + 3)));
      S.push(mk(P, w, dk, { prof: 'even', nb: 0, a: .8, rough: .25 }));
      if (o.hi !== false && size > 26) S.push(mk(P.map(([x, y]) => [x + w * .35, y + w * .55]), w * .45, C.paperLight, { prof: 'even', nb: 0, a: .38, rough: .3 }));
    }
  }

  // ------------------------------------------------------------ the disc
  WC.G.phaistos_disc = (sc, o = {}) => {
    const S = [], R = 150 * sc * (o.r ?? 1), tilt = o.tilt ?? 1, th = tilt < .98 ? 16 * sc : 0;
    const cy = -R * tilt - th, wob = rnd(0, 9);
    const rad = a => R * (1 + (WC.vnoise(wob + a * 1.3) - .5) * .045);
    const P = (r, a) => [Math.cos(a) * r, cy + Math.sin(a) * r * tilt];
    const outline = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; outline.push(P(rad(a), a)); }
    // thickness: the lower half of the rim dropped by th
    if (th) {
      const lower = []; for (let i = 0; i <= 32; i++) { const a = i / 32 * PI; const [x, y] = P(rad(a), a); lower.push([x, y + th]); }
      const upper = []; for (let i = 32; i >= 0; i--) { const a = i / 32 * PI; upper.push(P(rad(a), a)); }
      S.push(washShape(lower.concat(upper), clayDark(), .8, 3, 1));
      S.push(...WC.inkLine(lower, 2.2 * Math.sqrt(sc), C.ink, { step: 3, a: .7 }));
    }
    // body: clay washes, a lighter top-left, a darker lower-right, a few blooms
    S.push(washShape(outline, clay(), .9, 3, 1.5 * sc));
    S.push(washShape(ell(-R * .2, cy - R * .22 * tilt, R * .62, R * .52 * tilt, 0, TAU, 30), clayLite(), .32, 2, 2));
    S.push(washShape(ell(R * .26, cy + R * .3 * tilt, R * .6, R * .45 * tilt, 0, TAU, 30).map(([x, y]) => [clamp(x, -R * .95, R * .95), y]), clayDark(), .16, 2, 2));
    for (let k = 0; k < 7; k++) { const a = rnd(0, TAU), r = rnd(.1, .75) * R; S.push(washShape(WC.blobPts(Math.cos(a) * r, cy + Math.sin(a) * r * tilt, R * rnd(.06, .14), R * rnd(.04, .1) * tilt, 16, .3), rnd() < .5 ? clayDark() : clayLite(), .14, 2, 1)); }
    // rim: a soft darker ring just inside the edge, then the loose ink edge
    const ring = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU; ring.push(P(rad(a) * .965, a)); }
    S.push(mk(along(ring, 80), Math.max(2, R * .035), clayDark(), { prof: 'even', nb: 0, a: .35, rough: .4 }));
    S.push(...WC.inkLine(outline, 2.6 * Math.sqrt(sc), C.ink, { step: 3, a: .8 }));
    // the spiral groove (clockwise, from the rim inward), then the signs in the band between its turns
    const turns = o.turns ?? 4.2, r0 = R * .9, r1 = R * .14, b = (r0 - r1) / turns, a0 = o.a0 ?? (o.side === 'B' ? .9 : -2.2);
    const rg = th2 => r0 - b * th2 / TAU;
    const gw = Math.max(1.2, b * .07), groove = [];
    for (let t = 0; t <= turns * TAU; t += .06) groove.push(P(rg(t), a0 + t));
    for (let i = 0; i < groove.length - 1; i += 30) S.push(mk(along(groove.slice(i, Math.min(groove.length, i + 31)), 24), gw, dent(), { prof: 'even', nb: 0, a: .7, rough: .3 }));
    // five dots at the start
    for (let k = 0; k < 5; k++) { const [x, y] = P(r0 - b * .5 + (k - 2) * b * .14, a0 - .05); S.push(mk([[x - gw, y], [x + gw, y]], gw * 2.2, dent(), { prof: 'even', nb: 0, a: .85, rough: .1 })); }
    // signs: walk along the middle of the band; a divider every 2–5 signs
    const size = b * .6, gap = b * .78;
    let t = .25, inWord = 0, wordLen = 2 + Math.floor(rnd(0, 4)), first = null;
    const seq = o.side === 'B' ? 7 : 3;
    while (!o.blank && t < turns * TAU - .4) {
      const r = rg(t) - b * .5; if (r < r1 + b * .3) break;
      const a = a0 + t, [x, y] = P(r, a);
      if (inWord >= wordLen) {
        const [xa, ya] = P(rg(t), a), [xb, yb] = P(rg(t) - b, a);
        S.push(mk([[xa, ya], [xb, yb]], gw, dent(), { prof: 'even', nb: 0, a: .7, rough: .2 }));
        inWord = 0; wordLen = 2 + Math.floor(rnd(0, 4)); t += gap * .45 / r; continue;
      }
      const nm = WEIGHT[(Math.floor(rnd(0, 997)) + seq) % WEIGHT.length];
      stampSign(S, nm, x, y, size, a + PI / 2, tilt);
      if (!first) first = [x, y];
      inWord++; t += gap / r;
    }
    return { S, parts: { center: [0, cy], rim: P(R, -PI / 2), sign: first || [0, cy], edge: [R, cy + th] } };
  };

  WC.G.phaistos_sign = (sc, o = {}) => {
    const S = [], R = 110 * sc, cy = -R;
    const patch = WC.blobPts(0, cy, R, R * .92, 30, .1);
    S.push(washShape(patch, clay(), .85, 3, 2));
    S.push(washShape(WC.blobPts(-R * .2, cy - R * .2, R * .6, R * .5, 20, .2), clayLite(), .3, 2, 2));
    S.push(...WC.inkLine(patch.concat([patch[0]]), 2.4 * Math.sqrt(sc), C.ink, { step: 3, a: .7 }));
    stampSign(S, o.sign || 'head', 0, cy, R * 1.25, 0, 1, { w: .065 });
    return { S, parts: { sign: [0, cy] } };
  };

  // phaistos_pair — the stamped sign on its clay patch and, beside it, the ghost of a second disc that has never been
  // found: a dashed ink outline over a faint wash, an empty spiral. o: {sign}     parts: sign ghost
  WC.G.phaistos_pair = (sc, o = {}) => {
    const S = [], R = 110 * sc, gx = R * 1.45, sx = -R * 1.25, cy = -R;
    const patch = WC.blobPts(sx, cy, R, R * .92, 30, .1);
    S.push(washShape(patch, clay(), .85, 3, 2));
    S.push(washShape(WC.blobPts(sx - R * .2, cy - R * .2, R * .6, R * .5, 20, .2), clayLite(), .3, 2, 2));
    S.push(...WC.inkLine(patch.concat([patch[0]]), 2.4 * Math.sqrt(sc), C.ink, { step: 3, a: .7 }));
    stampSign(S, o.sign || 'head', sx, cy, R * 1.25, 0, 1, { w: .065 });
    S.push(washShape(ell(gx, cy, R * 1.02, R * 1.02, 0, TAU, 40), mixc(clay(), C.paper, .65), .22, 2, 1));
    for (let k = 0; k < 22; k++) { const a = k / 22 * TAU; S.push(mk(along(ell(gx, cy, R, R, a, a + TAU / 22 * .55, 5), 5), 2.4 * Math.sqrt(sc), C.inkSoft, { prof: 'even', nb: 0, a: .7, rough: .2 })); }
    const sp = []; for (let t = 0; t <= 2.2 * TAU; t += .12) { const r = R * (.82 - .3 * t / TAU); sp.push([gx + Math.cos(t - 1.6) * r, cy + Math.sin(t - 1.6) * r]); }
    for (let i = 0; i < sp.length - 1; i += 3) S.push(mk([sp[i], sp[Math.min(sp.length - 1, i + 1)]], 1.8 * Math.sqrt(sc), C.inkSoft, { prof: 'even', nb: 0, a: .4, rough: .2 }));
    return { S, parts: { sign: [sx, cy], ghost: [gx, cy] } };
  };

  WC.G.phaistos_stamp = (sc, o = {}) => {
    const S = [], w = 150 * sc, h = 130 * sc, wood = mixc(C.wood, C.paperLight, .3);
    const block = [[-w / 2, 0], [-w * .44, -h], [w * .44, -h], [w / 2, 0]];
    S.push(washShape(block, wood, .9, 3, 1));
    S.push(washShape([[w * .12, 0], [w * .1, -h], [w * .44, -h], [w / 2, 0]], mixc(C.wood, C.ink, .2), .35, 2, 1));
    for (let k = 0; k < 4; k++) { const x = rnd(-.35, .3) * w; S.push(mk(qcurve(x, -h * .05, x + rnd(-4, 4) * sc, -h * .95, rnd(-3, 3), 6), 1.6 * sc, C.wood, { prof: 'even', nb: 0, a: .45 })); }
    S.push(...WC.inkLine([...block, block[0]], 2.4 * sc, C.ink, { step: 1, a: .85 }));
    // neck and knob
    const neck = [[-w * .12, -h], [-w * .1, -h - 40 * sc], [w * .1, -h - 40 * sc], [w * .12, -h]];
    S.push(washShape(neck, wood, .9, 2, 1));
    const knob = ell(0, -h - 78 * sc, 46 * sc, 42 * sc, 0, TAU, 28);
    S.push(washShape(knob, wood, .9, 3, 1));
    S.push(washShape(ell(14 * sc, -h - 70 * sc, 26 * sc, 26 * sc, 0, TAU, 18), mixc(C.wood, C.ink, .25), .3, 2, 1));
    S.push(...WC.inkLine(knob, 2.2 * sc, C.ink, { step: 3, a: .8 }), ...WC.inkLine(neck, 2 * sc, C.ink, { step: 1, a: .7 }));
    return { S, parts: { face: [0, 0], knob: [0, -h - 78 * sc] } };
  };

  // ------------------------------------------------------------ shared bits
  const paperBack = (W, H) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); const pp = WC.paper(); if (pp) c.drawImage(pp, 0, 0); else { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); } return [cv, c]; };
  function notes(X, lt, cues, P, W, H, portrait) {
    for (const n of P.notes || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || (portrait ? 54 : 44), col = n.color === 'red' ? C.red : C.ink;
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
    }
  }
  function shadowEll(c, x, y, rx, ry, a) {
    c.save(); c.translate(x, y); c.scale(1, ry / rx);
    const g = c.createRadialGradient(0, 0, rx * .2, 0, 0, rx); g.addColorStop(0, WC.rgba(C.ink, a)); g.addColorStop(1, WC.rgba(C.ink, 0));
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore();
  }

  // ------------------------------------------------------------ wc_phaistos_disc
  SHOTS.wc_phaistos_disc = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx), mode = P.mode || 'hero';
      const museum = mode === 'museum';
      const R = (museum ? (portrait ? 250 : 200) : (portrait ? 410 : 330)) * (P.size ?? 1);
      const cx = W * (P.x ?? .5), cy = H * (P.y ?? (museum ? (portrait ? .33 : .33) : (portrait ? .385 : .45)));
      const disc = WC.make('phaistos_disc', Math.round(R / 150 * 100) / 100, { side: P.side || 'A' }, 3 + (P.side === 'B' ? 5 : 0));
      const [back, c] = paperBack(W, H);
      let plinthTop = 0;
      WC.withSeed(seed * 17 + 5, () => {
        if (!museum) {
          WC.blob(c, cx - R * .1, cy - R * .05, R * 1.35, R * 1.2, C.skyWarm, .28);
          WC.blob(c, cx + R * .35, cy + R * .55, R * .9, R * .5, C.sky, .2);
          WC.granulate(c, cx - R * 1.4, cy - R * 1.3, cx + R * 1.4, cy + R * 1.3, C.skyWarm, .35, .1);
          // the table under it, down to the bottom of the frame
          const ty = cy + R * .55;
          WC.wash(c, [[-20, ty], [W + 20, ty - 8], [W + 20, H + 20], [-20, H + 20]], mixc(C.wood, C.paper, .5), .5, 3, 3);
          WC.blooms(c, -20, ty, W + 20, H, mixc(C.wood, C.paper, .5), 6, .16);
          WC.drawS(c, WC.mk(qcurve(-10, ty, W + 10, ty - 8, 0, 20), 4, C.ink, { prof: 'even', nb: 4, a: .6 }));
          // a long soft shadow falling forward and right across the table, the grain of the wood, a darker front edge
          for (let k = 0; k < 7; k++) { const f = k / 6; shadowEll(c, cx + R * (.1 + f * .75), cy + R * (1.02 + f * .95), R * (.95 - f * .35), R * (.16 + f * .05), .16 * (1 - f * .7)); }
          for (let i = 0; i < 16; i++) { const y = ty + 30 + Math.pow(rnd(), 1.2) * (H - ty - 40), x = rnd(-80, W * .8); WC.drawS(c, WC.mk(qcurve(x, y, x + rnd(160, 420), y + rnd(-3, 3), rnd(-4, 4), 10), rnd(2, 4), C.wood, { prof: 'leaf', nb: 0, a: .22 })); }
          WC.band(c, -40, W + 40, H * .93, H * .07, mixc(C.wood, C.ink, .15), .35);
          shadowEll(c, cx + R * .08, cy + R * .99, R * .95, R * .12, .38);
          shadowEll(c, cx + R * .1, cy + R * .12, R * 1.08, R * 1.06, .14);
        } else {
          const gy = H * (portrait ? .62 : .72);
          c.drawImage(WC.backdrop(W, H, gy, { land: 'interior', sky: 'none', wall: P.wall || 'stoneDark', floor: P.floor || 'wood' }), 0, 0);
          // darker corners: the room around the case
          const v = c.createRadialGradient(cx, cy, R * .8, cx, cy, Math.max(W, H) * .75);
          v.addColorStop(0, WC.rgba(C.night, 0)); v.addColorStop(1, WC.rgba(C.night, .55));
          c.fillStyle = v; c.fillRect(0, 0, W, H);
          // plinth
          plinthTop = portrait ? H * .585 : cy + R * 1.5;
          const pw = R * 1.7;
          WC.wash(c, [[cx - pw / 2, plinthTop], [cx + pw / 2, plinthTop], [cx + pw / 2, H + 20], [cx - pw / 2, H + 20]], mixc(C.stone, C.paper, .45), .85, 3, 2);
          WC.wash(c, [[cx + pw * .18, plinthTop], [cx + pw / 2, plinthTop], [cx + pw / 2, H + 20], [cx + pw * .18, H + 20]], C.stoneDark, .16, 2, 2);
          for (const s of WC.inkLine([[cx - pw / 2, H + 10], [cx - pw / 2, plinthTop], [cx + pw / 2, plinthTop], [cx + pw / 2, H + 10]], 2.4, C.ink, { step: 1, a: .7 })) WC.drawS(c, s);
          // stand
          WC.wash(c, [[cx - R * .3, plinthTop], [cx - R * .3, plinthTop - 24], [cx - R * .06, plinthTop - 40], [cx - R * .05, cy + R * .9], [cx + R * .05, cy + R * .9], [cx + R * .06, plinthTop - 40], [cx + R * .3, plinthTop - 24], [cx + R * .3, plinthTop]], mixc(C.inkSoft, C.stoneDark, .4), .85, 2, 1);
          // glass case
          const gx0 = cx - R * 1.3, gx1 = cx + R * 1.3, gy0 = cy - R * 1.45;
          WC.wash(c, [[gx0, gy0], [gx1, gy0], [gx1, plinthTop], [gx0, plinthTop]], C.sky, .1, 2, 1);
          for (const s of WC.inkLine([[gx0, plinthTop], [gx0, gy0], [gx1, gy0], [gx1, plinthTop]], 2, C.paperLight, { step: 1, a: .5 })) WC.drawS(c, s);
          WC.drawS(c, WC.mk(qcurve(gx0 + R * .2, gy0 + R * .3, gx0 + R * .9, gy0 + R * 1.4, 0, 8), R * .12, C.paperLight, { prof: 'leaf', nb: 0, a: .12 }));
        }
      });
      const turn = (P.turn ?? (museum ? 0 : 5)) * PI / 180;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          if (museum) {    // the pool of light from above, slowly breathing, dust in it
            const br = .8 + .2 * Math.sin(lt * .9);
            const g = X.createRadialGradient(cx, cy - R * .2, R * .3, cx, cy, R * 2.1);
            g.addColorStop(0, WC.rgba(C.paperLight, .38 * br)); g.addColorStop(1, WC.rgba(C.paperLight, 0));
            X.fillStyle = g; X.beginPath(); X.moveTo(cx - R * .5, 0); X.lineTo(cx + R * .5, 0); X.lineTo(cx + R * 1.9, plinthTop + 30); X.lineTo(cx - R * 1.9, plinthTop + 30); X.closePath(); X.fill();
            X.fillStyle = WC.rgba(C.paperLight, .55);
            for (let i = 0; i < 26; i++) {
              const ph = (WC.hash(i * 3.3) + lt * (.03 + WC.hash(i) * .03)) % 1, y = ph * (plinthTop - 40), half = R * .5 + y / plinthTop * R * 1.3;
              const x = cx + (WC.hash(i * 7.1) - .5) * 2 * half + Math.sin(lt * .7 + i) * 10;
              X.globalAlpha = Math.sin(PI * ph) * .8; X.beginPath(); X.arc(x, y, 1.6 + WC.hash(i + 2) * 2.2, 0, TAU); X.fill();
            }
            X.globalAlpha = 1;
          }
          const t0 = P.at === -1 || P.at == null ? -9 : WC.timeOf(P.at, cues, .15), pd = P.paint ?? 1.4;
          const p = t0 < -5 ? 1 : seg(lt, t0, t0 + pd);
          X.save(); X.translate(cx, cy); X.rotate(-turn / 2 + turn * eio(lt / Math.max(1, dur)));
          WC.drawObj(X, disc, 0, R, p);
          X.restore();
          notes(X, lt, cues, P, W, H, portrait);
        },
      };
    },
  };

  // ------------------------------------------------------------ wc_phaistos_signs: close on the clay
  SHOTS.wc_phaistos_signs = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      // a huge disc: its centre far below the frame, so the rim arcs across the top and two turns cross the frame
      const R = portrait ? 1500 : 1900, ccx = W * .5, ccy = portrait ? H * .17 + R : H * .1 + R;
      const b = portrait ? 360 : 330, rA = R * .93, rB = rA - b, rC = rB - b;
      const [back, c] = paperBack(W, H);
      const signs = (P.signs || [{ sign: 'head' }, { sign: 'fish' }, { sign: 'ship' }]);
      const span = portrait ? .52 : .55;                 // radians of arc the band shows
      const pos = (r, k, n) => { const a = -PI / 2 + (k - (n - 1) / 2) / Math.max(1, n - 1) * span * (n > 1 ? 1 : 0); return [ccx + Math.cos(a) * r, ccy + Math.sin(a) * r, a]; };
      const sz = b * .62, olds = [];
      WC.withSeed(seed * 23 + 9, () => {
        shadowEll(c, ccx + 20, ccy - R + 30, W * .9, 60, .18);
        const out = ell(ccx, ccy, R, R, PI * 1.05, PI * 1.95, 90);
        const body = out.concat([[W + 40, H + 40], [-40, H + 40]]);
        WC.wash(c, body, clay(), .85, 3, 2);
        WC.blooms(c, -20, ccy - R, W + 20, H, clay(), 12, .2);
        WC.granulate(c, -20, ccy - R, W + 20, H, clay(), .9, .14);
        WC.wash(c, ell(ccx - W * .2, ccy - R + b * .6, W * .55, b * .5, 0, TAU, 30), clayLite(), .2, 2, 3);
        WC.drawS(c, mk(along(ell(ccx, ccy, R * .985, R * .985, PI * 1.05, PI * 1.95, 60), 80), 26, clayDark(), { prof: 'even', nb: 5, a: .3, rough: .4 }));
        for (const s of WC.inkLine(out, 3.2, C.ink, { step: 3, a: .85 })) WC.drawS(c, s);
        for (const r of (portrait ? [rA, rB] : [rA, rB, rC])) WC.drawS(c, mk(along(ell(ccx, ccy, r, r, PI * 1.05, PI * 1.95, 60), 90), 9, dent(), { prof: 'even', nb: 0, a: .75, rough: .3 }));
        // word dividers in the top band, between the hero signs
        for (const k of [-.5, signs.length - .5]) { const [, , a] = pos(rA, k, signs.length); WC.drawS(c, mk([[ccx + Math.cos(a) * rA, ccy + Math.sin(a) * rA], [ccx + Math.cos(a) * rB, ccy + Math.sin(a) * rB]], 8, dent(), { prof: 'even', nb: 0, a: .75 })); }
        // the lower turn is already full of signs (context, smaller)
        const others = P.others || ['rosette', 'walker', 'shield', 'head', 'branch', 'bird', 'head'];
        const r2 = rB - b * .5, st = sz * .62 * 1.45 / r2;
        others.forEach((nm, k) => { const a = -PI / 2 + (k - (others.length - 1) / 2) * st, S = []; stampSign(S, nm, 0, 0, sz * .62, a + PI / 2, 1); olds.push({ x: ccx + Math.cos(a) * r2, y: ccy + Math.sin(a) * r2, S, spr: WC.sprite(S), k }); });
      });
      const hero = signs.map((sg, k) => {
        const [x, y, a] = pos(rA - b * .5, k, signs.length), S = [];
        WC.withSeed(seed * 31 + k * 7, () => stampSign(S, sg.sign, 0, 0, sz, a + PI / 2, 1));
        return { x, y, S, spr: WC.sprite(S), at: sg.at, label: sg.label, k };
      });
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          // the lower turn fills itself, sign after sign, while the line opens ("tiny pictures spiral across it")
          for (const h of olds) {
            const t0 = .05 + h.k * .2, p = seg(lt, t0, t0 + .45);
            if (p <= 0) continue;
            X.save(); X.translate(h.x, h.y);
            if (p >= 1) X.drawImage(h.spr.cv, h.spr.x0, h.spr.y0); else WC.drawList(X, h.S, p);
            X.restore();
          }
          for (const h of hero) {
            const t0 = WC.timeOf(h.at, cues, .3 + h.k * .7), p = seg(lt, t0, t0 + .6);
            if (p <= 0) continue;
            X.save(); X.translate(h.x, h.y);
            if (p >= 1) X.drawImage(h.spr.cv, h.spr.x0, h.spr.y0); else WC.drawList(X, h.S, p);
            X.restore();
            if (h.label) {
              const lx = h.x + (h.k - (hero.length - 1) / 2) * 30, ly = portrait ? H * .105 + (h.k % 2) * 64 : H * .06;
              // a quick pen label: line and word done within half a second of the cue
              const size = portrait ? 56 : 42;
              X.save(); X.font = `600 ${size}px ${WC.HANDF}`; const tw = X.measureText(h.label).width; X.restore();
              const lx0 = clamp(lx - tw / 2, 40, W - 40 - tw);
              WC.leader(X, lx0 + tw / 2, ly + size * .6, h.x, h.y - sz * .5, seg(lt, t0, t0 + .25), 14);
              WC.hand(X, h.label, lx0, ly, seg(lt, t0 + .05, t0 + .45), { size });
            }
          }
        },
      };
    },
  };

  // ------------------------------------------------------------ wc_phaistos_stamp: the stamp goes in
  // a carved round wooden stamp held in a right hand (sleeve cuff, fingers, thumb), two baked poses:
  // 'face' (tilted to show its carved face: the sign in relief, mirrored) and 'press' (upright, seen from above)
  function handStamp(r, hb, sign, face) {
    const S = [], wood = mixc(C.wood, C.paperLight, .32), woodD = mixc(C.wood, C.ink, .22), skin = C.skin, skinD = mixc(C.skin, C.wood, .38);
    const sleeve = mixc(C.clothB, C.paperLight, .3), sleeveD = mixc(C.clothB, C.ink, .15);
    const wsh = (pts, col, a = .85, n = 3) => S.push(washShape(pts, col, a, n, 1.2));
    const edge = (pts, w = 2.2, a = .75) => S.push(...WC.inkLine(pts, w, C.ink, { step: 2, a }));
    const stroke = (pts, w, col, a = .9) => S.push(mk(pts, w, col, { prof: 'even', nb: 0, a, rough: .18 }));
    const hy = face ? -r * .85 - hb * .35 : -hb;          // where the hand grips (top of the stamp)
    // sleeve and cuff, coming in from the right edge of the frame
    const arm = [[r * 1.9, hy - r * .95], [r * 9, hy - r * 2.6], [r * 9, hy + r * 1.3], [r * 2.2, hy + r * .55]];
    wsh(arm, sleeve, .9);
    for (let k = 0; k < 5; k++) { const x = r * (3 + k * 1.2); stroke(qcurve(x, hy - r * (1.1 + k * .28), x + r * .3, hy + r * (.6 + k * .12), r * .2, 8), 5, sleeveD, .35); }
    stroke(along([[r * 1.9, hy - r * .95], [r * 9, hy - r * 2.6]], 16), 5, sleeveD, .55);
    stroke(along([[r * 2.2, hy + r * .55], [r * 9, hy + r * 1.3]], 16), 7, sleeveD, .5);
    const cuff = [[r * 1.75, hy - r * 1.0], [r * 2.45, hy - r * 1.18], [r * 2.75, hy + r * .7], [r * 2.05, hy + r * .62]];
    wsh(cuff, mixc(C.paperLight, C.stone, .35), .9); edge(cuff.concat([cuff[0]]), 2, .6);
    // the stamp
    if (face) {
      const fr = r * .85, top = -fr - hb * .35;
      wsh([[-r, 0], [-r * .98, top + fr * .3], [r * .98, top + fr * .3], [r, 0]], woodD, .85);       // the side above the face
      wsh(ell(0, top + fr * .3, r * .98, r * .3, PI, TAU, 24).concat([[r, 0], [-r, 0]]), wood, .5);
      const fc = ell(0, 0, r, fr, 0, TAU, 40);
      wsh(fc, wood, .95); wsh(ell(-r * .2, -fr * .25, r * .6, fr * .5, 0, TAU, 24), mixc(wood, C.paperLight, .3), .3, 2);
      edge(fc, 2.6, .85);
      for (let k = 0; k < 3; k++) stroke(along(ell(0, 0, r * (.45 + k * .17), fr * (.45 + k * .17), rnd(0, 3), rnd(3.5, 5.5), 14), 14), 1.4, woodD, .25);
      const R2 = []; stampSign(R2, sign, 0, 0, r * 1.45, 0, fr / r, { col: mixc(C.wood, C.ink, .45), w: .085 });
      for (const q of R2) { q.pts = q.pts.map(([x, y]) => [-x, y]); q.nx = q.nx.map(v => -v); S.push(q); }       // carved in relief, mirrored
    } else {
      const ry = r * .45;
      const body = [[-r, -hb], ...ell(0, 0, r, ry, PI, 0, 24).reverse().map(([x, y]) => [x, y]).slice(0, 0), [r, -hb], [r, 0], ...ell(0, 0, r, ry, 0, PI, 24).slice(1), [-r, 0]];
      wsh(body, wood, .92);
      wsh([[r * .35, -hb], [r, -hb], [r, 0], ...ell(0, 0, r, ry, 0, PI * .38, 10).slice(1), [r * .35, ry * .9]], woodD, .35, 2);
      for (let k = 0; k < 5; k++) { const x = rnd(-.8, .6) * r; stroke(qcurve(x, -hb * .95, x + rnd(-3, 3), ry * .6, rnd(-3, 3), 8), 1.5, woodD, .3); }
      const topE = ell(0, -hb, r, ry, 0, TAU, 36);
      wsh(topE, mixc(wood, C.paperLight, .25), .9);
      edge([[-r, -hb], [-r, 0], ...ell(0, 0, r, ry, PI, 0, 24).reverse()]); edge([[r, 0], [r, -hb]]); edge(topE, 2, .7);
      const kb = ell(0, -hb - r * .55, r * .42, r * .38, 0, TAU, 24);
      wsh([[-r * .16, -hb], [-r * .14, -hb - r * .4], [r * .14, -hb - r * .4], [r * .16, -hb]], wood, .9);
      wsh(kb, wood, .92); wsh(ell(r * .12, -hb - r * .5, r * .2, r * .18, 0, TAU, 14), woodD, .35, 2); edge(kb, 2, .75);
    }
    // the hand: back of the hand from the cuff to the knuckles, four fingers wrapped round the stamp, the thumb
    const kx = face ? r * .75 : r * .62, gy0 = face ? hy + r * .05 : -hb * .82, gy1 = face ? hy + r * .55 : -hb * .12;
    const back = [[r * 1.85, hy - r * .9], [r * 2.15, hy + r * .55], [kx + r * .25, gy1 + r * .15], [kx - r * .05, gy0 - r * .25], [r * 1.2, hy - r * 1.05]];
    wsh(back, skin, .92); wsh(back.slice(1, 4), skinD, .3, 2); edge(back.concat([back[0]]), 1.8, .55);
    for (let f = 0; f < 4; f++) {
      const y = mixN(gy0, gy1, f / 3), x1 = face ? kx - r * .55 : -r * .55 + f * r * .08;
      const pts = qcurve(kx + r * .2, y, x1, y + r * .1, face ? -r * .12 : r * .14, 10);
      stroke(pts, r * .26, skin, .95); S.push(WC.edgeOf(mk(pts, r * .26, skin), 1, 1.6, C.ink, .55)); S.push(WC.edgeOf(mk(pts, r * .26, skin), -1, 1.2, skinD, .5));
      const e = pts[pts.length - 1]; stroke([[e[0] + r * .06, e[1] - r * .02], [e[0] + r * .015, e[1] + r * .02]], r * .1, mixc(C.paperLight, C.skin, .5), .6);   // a nail
      stroke(qcurve(pts[4][0], pts[4][1] - r * .1, pts[4][0] - r * .03, pts[4][1] + r * .1, 2, 4), 1.2, skinD, .55);   // knuckle crease
    }
    const th = qcurve(r * 1.25, hy - r * .85, face ? -r * .35 : -r * .25, (face ? hy - r * .25 : -hb - r * .15), -r * .25, 10);
    stroke(th, r * .27, skin, .95); S.push(WC.edgeOf(mk(th, r * .27, skin), -1, 1.6, C.ink, .55));
    return S;
  }
  const mixN = WC.mix;

  SHOTS.wc_phaistos_stamp = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const tilt = .45, R = portrait ? 720 : 760, dcx = W * .5, dcy = H * (portrait ? .4 : .56);
      const turns = 2.6, a0 = -1.0, r0 = R * .9, bw = (r0 - R * .14) / turns;
      const disc = WC.make('phaistos_disc', Math.round(R / 150 * 100) / 100, { tilt, turns, a0, blank: true }, 11);
      const [back, c] = paperBack(W, H);
      // the outer band of the spiral at angle a (radians, clockwise from +x): centre of the band
      const bandAt = a => { const t = ((a - a0) % TAU + TAU) % TAU, r = r0 - bw * t / TAU - bw * .5; return [dcx + Math.cos(a) * r, dcy + Math.sin(a) * r * tilt]; };
      const ssz = bw * .66, step = .3, aNew = -PI / 2 + .3;
      const [sx, sy] = bandAt(aNew);
      const sr = ssz * .6, shb = ssz * .8;
      WC.withSeed(seed * 41 + 3, () => {
        WC.blob(c, W * .5, H * .1, W * .7, H * .12, C.skyWarm, .22);
        const ty = H * (portrait ? .17 : .2);
        WC.wash(c, [[-20, ty], [W + 20, ty - 10], [W + 20, H + 20], [-20, H + 20]], mixc(C.wood, C.paper, .45), .55, 3, 3);
        WC.blooms(c, -20, ty, W + 20, H, mixc(C.wood, C.paper, .45), 8, .16);
        WC.granulate(c, -20, ty, W + 20, H, C.wood, .5, .1);
        for (let i = 0; i < 18; i++) { const y = ty + 20 + rnd() * (H - ty), x = rnd(-80, W * .8); WC.drawS(c, WC.mk(qcurve(x, y, x + rnd(160, 420), y + rnd(-3, 3), rnd(-4, 4), 10), rnd(2, 4), C.wood, { prof: 'leaf', nb: 0, a: .2 })); }
        WC.drawS(c, WC.mk(qcurve(-10, ty, W + 10, ty - 10, 0, 20), 4, C.ink, { prof: 'even', nb: 4, a: .6 }));
        shadowEll(c, dcx + 30, dcy + 30, R * 1.05, R * tilt * 1.1, .22);
        WC.drawObj(c, disc, dcx, dcy + R * tilt + 16 * R / 150);
        // signs already pressed, along the outer band before the new one
        const S = [];
        (P.done || ['shield', 'fish', 'rosette', 'bird']).forEach((nm, k) => { const a = aNew - (k + 1) * step, [x, y] = bandAt(a); stampSign(S, nm, x, y, ssz, a + PI / 2, tilt); });
        for (const s of S) WC.drawItem(c, s, 1);
      });
      const sign = P.sign || 'head';
      const newS = []; WC.withSeed(seed * 43 + 1, () => stampSign(newS, sign, 0, 0, ssz, aNew + PI / 2, tilt));
      const newSpr = WC.sprite(newS);
      const SA = WC.withSeed(seed * 47 + 2, () => handStamp(sr, shb, sign, true)), sprA = WC.sprite(SA);
      const SB = WC.withSeed(seed * 47 + 2, () => handStamp(sr, shb, sign, false)), sprB = WC.sprite(SB);
      const put = (spr, x, y, a) => { if (a <= 0) return; X.save(); X.globalAlpha = a; X.drawImage(spr.cv, x + spr.x0, y + spr.y0); X.restore(); };
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          const tp = WC.timeOf(P.press, cues, 1.8);
          const sw = ss(seg(lt, tp - 1.15, tp - .8));                  // turn from showing the face to pressing
          const down = ss(seg(lt, tp - .8, tp)), up = ss(seg(lt, tp + .4, tp + 1.4));
          const hoverY = sy - sr * .45 - H * .14, hoverX = sx - sr * .2;
          const fx = mixN(mixN(hoverX, sx, down), sx + W * .08, up), fy = mixN(mixN(hoverY, sy, down), sy - H * .13, up) + (lt > tp && lt < tp + .4 ? 3 : 0);
          if (lt >= tp + .05) { X.save(); X.translate(sx, sy); X.globalAlpha = ss(seg(lt, tp + .05, tp + .45)); X.drawImage(newSpr.cv, newSpr.x0, newSpr.y0); X.restore(); }
          const k = clamp((fy - hoverY) / (sy - hoverY));
          shadowEll(X, fx + sr * .25, sy + sr * .15, sr * (1.6 - .5 * k), sr * (.5 - .15 * k), .1 + .22 * k);
          const pin = seg(lt, 0, .8);
          if (pin < 1) { X.save(); X.translate(fx, fy); WC.drawList(X, SA, pin); X.restore(); }
          else put(sprA, fx, fy + Math.sin(lt * 1.6) * 3 * (1 - sw), 1 - sw);
          put(sprB, fx, fy, pin >= 1 ? sw : 0);
          notes(X, lt, cues, P, W, H, portrait);
        },
      };
    },
  };
})();
