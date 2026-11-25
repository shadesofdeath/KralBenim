// wc_hittin — topic objects and a shot for "Hıttin 1187" (videos/2026-11-25/01-hittin-1187.json).
// Same contract as the other WC.G generators: local coordinates, y negative up, origin = base centre, painted in order.
// hittin_horns  the Horns of Hattin: a long, low hill of an old volcano with two rocky peaks and a saddle between
//               them, dry grass and dry-brush texture on its flanks. sc 1 ≈ 900 × 200 px.
//               o: {w: width ×, h: height ×, col: hill token (default "ground"), dark: shade token (default "stoneDark")}
//               parts: left right saddle foot
// matara        a leather waterskin (tulum) lying on the ground, empty and slack: crumpled bag, stitched seam, the tied
//               neck raised and open, a loose cord. sc 1 ≈ 260 px long. o: {col: leather token (default "wood")}
//               parts: neck body strap stitch
// levant_castle a crusader-era Levant fortress in dark basalt (Tiberias): flat-topped square towers, low curtain wall,
//               pointed gate, pale limestone courses, on a rocky rise. sc 1 ≈ 560 × 270 px. o: {col, band}  parts: tower gate wall
// testi         a clay water jug, upright or tipped over and empty (o.tipped) with a dry stain from its mouth; crack.
//               sc 1 ≈ 250 px tall. o: {tipped, col, crack}  parts: mouth neck body handle crack foot
// cracked_ground sun-cracked dry earth for the fg layer (absolute size, origin bottom centre). o: {w, h, ground}
// tent_interior inside a campaign tent: canvas panels, sag, centre pole (absolute size, origin = floor line). o: {w, h, col, stripe}
// candle_halo   a soft warm halo of candlelight. o: {r}
// fallen_banner a banner pole fallen on the ground, its red cloth (pale cross) slumped beside it. sc 1 ≈ 240 px. o: {color}
// wc_hittin_horns  a wc_scene (sky, land, items, notes as in wc_scene) with the Horns painted big at horns.x and a low
//               sheet of smoke rolling slowly across the plain in front of them (live, from smoke_at), the smoke drifting
//               up the flanks. params: wc_scene params + {horns: {x, s, dy, at, paint}, smoke_at (s | cue, default 0),
//               smoke_y (0..1, default the horizon), smoke_a (.45)}
'use strict';
(() => {
  const C = WC.C, { mk, washShape, inkLine, mixc, along, qcurve, rnd, seg, ss, timeOf } = WC;
  const circ = (cx, cy, rx, ry = rx, n = 22) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const tok = (v, fb) => (v && C[v]) ? C[v] : fb;

  // dry-brush texture: loose bristled strokes inside a box, following a direction (the watercolour "flying white")
  const dryBrush = (S, x0, y0, x1, y1, col, n, o = {}) => {
    for (let i = 0; i < n; i++) {
      const x = rnd(x0, x1), y = rnd(y0, y1), len = rnd(.25, .55) * (x1 - x0), ang = (o.ang ?? 0) + rnd(-.12, .12);
      const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
      S.push(mk(qcurve(x, y, Math.min(ex, x1), Math.max(y0, Math.min(ey, y1)), rnd(-6, 6), 8), rnd(o.w0 ?? 6, o.w1 ?? 14), col, { prof: 'leaf', nb: 6, a: rnd(o.a0 ?? .12, o.a1 ?? .26), rough: .45 }));
    }
  };

  // ------------------------------------------------------------------ hittin_horns
  WC.G.hittin_horns = (sc, o = {}) => {
    const S = [], W = 900 * sc * (o.w ?? 1), Hh = 200 * sc * (o.h ?? 1);
    const hill = tok(o.col, C.ground), dark = tok(o.dark, C.stoneDark), ink = C.ink;
    // a broad, low basalt ridge with two rounded crowns (the left lower) and a shallow saddle
    const prof = x => {
      const l = Math.exp(-Math.pow((x + .17) / .16, 2)) * .62, r = Math.exp(-Math.pow((x - .17) / .17, 2)) * .8;
      const body = Math.max(0, 1 - Math.pow(x / .5, 2)) * .55;
      return Math.max(body, l + body * .5, r + body * .5);
    };
    const n = 54, top = [];
    for (let i = 0; i <= n; i++) { const xf = -.5 + i / n; top.push([xf * W, -prof(xf) * Hh + rnd(-3, 3) * sc]); }
    const outline = top.concat([[W * .5, 0], [-W * .5, 0]]);
    S.push(washShape(outline, mixc(hill, C.paper, .1), .6, 3, 3 * sc));
    S.push(washShape(outline, mixc(dark, hill, .6), .22, 2, 4 * sc));          // a second, darker glaze over the whole ridge
    const shadeR = top.filter(([x]) => x > W * .17).concat([[W * .5, 0], [W * .4, -Hh * .08], [W * .3, -Hh * .3], [W * .22, -Hh * .6]]);
    S.push(washShape(shadeR, mixc(dark, hill, .35), .38, 3, 3 * sc));
    S.push(washShape(top.filter(([x]) => x < -W * .17).concat([[-W * .25, -Hh * .25], [-W * .4, -Hh * .05]]), mixc(C.skyWarm, hill, .5), .28, 2, 2 * sc));
    // dry brush along the slopes, then streaks down the gullies, then a few dry grass ticks
    dryBrush(S, -W * .42, -Hh * .55, W * .42, -Hh * .05, mixc(dark, hill, .45), 22, { w0: 8 * sc, w1: 18 * sc });
    for (let i = 0; i < 12; i++) {
      const xf = rnd(-.4, .4), y0 = -prof(xf) * Hh + 8 * sc, len = rnd(.3, .6) * -y0;
      S.push(mk(qcurve(xf * W, y0, xf * W + rnd(-24, 24) * sc, y0 + len, rnd(-8, 8) * sc, 8), rnd(5, 10) * sc, mixc(dark, hill, .55), { prof: 'tip', nb: 5, a: rnd(.15, .26), rough: .45 }));
    }
    for (let i = 0; i < 34; i++) {
      const xf = rnd(-.48, .48), yb = -prof(xf) * Hh * rnd(0, .75), len = rnd(8, 16) * sc;
      S.push(mk(qcurve(xf * W, yb, xf * W + rnd(-4, 4) * sc, yb - len, rnd(-3, 3) * sc, 4), rnd(1.4, 2.2) * sc, mixc(C.clothC, C.wood, rnd(0, .4)), { prof: 'tip', nb: 0, a: rnd(.4, .7) }));
    }
    S.push(...inkLine(top, 2 * sc, ink, { step: 3, a: .55 }));
    const pk = xf => [xf * W, -prof(xf) * Hh];
    return { S, top: pk(.17), parts: { left: pk(-.17), right: pk(.17), saddle: pk(0), foot: [0, 0] } };
  };

  // ------------------------------------------------------------------ matara
  // a leather waterskin (tulum) lying on the ground, empty and slack: a crumpled bag, its tied neck raised and open
  WC.G.matara = (sc, o = {}) => {
    const S = [], L = 260 * sc, h = 105 * sc, leather = tok(o.col, C.wood), ink = C.ink;
    // the bag: a slack, lumpy lens, flat where it lies, the right end lifting toward the neck
    const top = [], bot = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, x = -L / 2 + t * L * .86;
      const bulge = Math.pow(Math.sin(Math.PI * Math.min(1, t * .92 + .04)), .6) * h * (1 - .3 * t), dent = 1 + .05 * Math.sin(t * 9) + rnd(-.015, .015);
      top.push([x, -bulge * dent - t * t * h * .35]);
      bot.push([x, -t * t * h * .25 + rnd(-2, 2) * sc]);
    }
    const nb0 = top[16], nb1 = bot[16];
    const neckTip = [L * .5, -h * .95], neckL = [L * .47, -h * 1.08], neckR = [L * .53, -h * .8];
    const body = top.concat([neckL, neckR], bot.slice().reverse());
    // ground shadow, then the bag in two washes (a warm body, a darker belly pooled at the bottom edge)
    S.push(mk(along([[-L * .55, 3 * sc], [0, 7 * sc], [L * .5, 4 * sc]], 10), 20 * sc, mixc(C.ground, ink, .4), { prof: 'leaf', nb: 0, a: .28 }));
    S.push(washShape(body, mixc(leather, C.clothC, .5), .75, 3, 3 * sc));
    S.push(washShape(bot.map(([x, y]) => [x, y]).concat(top.slice().reverse().map(([x, y], k) => [x, y * .45])), mixc(leather, ink, .25), .4, 3, 3 * sc));
    dryBrush(S, -L * .42, -h * .9, L * .3, -h * .15, mixc(leather, ink, .35), 10, { w0: 6 * sc, w1: 12 * sc, a0: .15, a1: .3 });
    // creases of the slack leather (the skin is empty: it folds on itself), and a pale sheen on the upper fold
    for (let k = 0; k < 6; k++) {
      const x = -L * .35 + k * L * .12 + rnd(-8, 8) * sc, y = -h * rnd(.2, .45);
      S.push(mk(qcurve(x, y - h * .35, x + rnd(10, 26) * sc, y + h * .1, rnd(-14, 14) * sc, 6), 2.2 * sc, mixc(leather, ink, .6), { prof: 'tip', nb: 0, a: .6 }));
    }
    S.push(mk(along([[-L * .38, -h * .62], [-L * .1, -h * .86], [L * .15, -h * .8]], 8), 10 * sc, C.paperLight, { prof: 'leaf', nb: 3, a: .45 }));
    // a stitched seam along the back
    const seam = top.slice(1, 15).map(([x, y]) => [x, y + 9 * sc]);
    S.push(...inkLine(seam, 1.2 * sc, mixc(leather, ink, .5), { step: 1, a: .5 }));
    for (let i = 0; i < seam.length; i++) { const [x, y] = seam[i]; S.push(mk([[x - 3 * sc, y - 5 * sc], [x + 3 * sc, y + 5 * sc]], 1.6 * sc, C.paperLight, { prof: 'even', nb: 0, a: .7 })); }
    // the neck: tied with a cord, the mouth open and dark (no water in it)
    S.push(washShape([nb0, neckL, neckR, nb1], mixc(leather, ink, .15), .85, 2, 1));
    S.push(washShape(circ(neckTip[0] + 4 * sc, neckTip[1] - 4 * sc, 11 * sc, 17 * sc, 14), ink, .85, 2, .5));
    S.push(mk(along([[L * .4, -h * .78], [L * .44, -h * .66], [L * .47, -h * .7]], 6), 4 * sc, mixc(C.clothC, ink, .3), { prof: 'even', nb: 2, a: .9 }));
    S.push(mk(along([[L * .44, -h * .66], [L * .5, -h * .4], [L * .62, -h * .15], [L * .7, -2 * sc]], 10), 2.6 * sc, mixc(C.clothC, ink, .3), { prof: 'tip', nb: 0, a: .8 }));
    // the ink: a broken contour
    S.push(...inkLine(top.concat([neckL]), 2 * sc, ink, { step: 2, a: .75 }));
    S.push(...inkLine([neckR].concat(bot.slice().reverse()), 1.8 * sc, ink, { step: 3, a: .6 }));
    return { S, top: neckL, parts: { neck: neckTip, body: [-L * .1, -h * .5], strap: [L * .62, -h * .15], stitch: seam[5], cork: neckTip } };
  };

  // ------------------------------------------------------------------ levant_castle
  // a crusader-era Levant fortress in dark basalt: flat-topped square towers, a low curtain wall with small square
  // merlons, a pointed gate, pale courses of limestone through the black stone, on a rocky rise. sc 1 ≈ 560 × 270 px.
  // o: {col: stone token (default a basalt mix of stoneDark and ink), band: course token (default "stone")}
  WC.G.levant_castle = (sc, o = {}) => {
    const S = [], ink = C.ink, W = 560 * sc;
    const basalt = o.col ? tok(o.col, C.stoneDark) : mixc(C.stoneDark, C.paper, .12), band = tok(o.band, C.stone);
    // the rise it stands on
    const rise = []; for (let i = 0; i <= 12; i++) { const t = i / 12, x = -W * .62 + t * W * 1.24; rise.push([x, -Math.sin(Math.PI * t) * 34 * sc + rnd(-4, 4) * sc]); }
    S.push(washShape(rise.concat([[W * .62, 0], [-W * .62, 0]]), mixc(C.ground, basalt, .25), .6, 3, 3 * sc));
    const gy = -30 * sc;
    const block = (x0, x1, y1, base = gy) => [[x0, base], [x0, y1], [x1, y1], [x1, base]];
    const merlons = (x0, x1, y, mw = 14 * sc, mh = 14 * sc) => { for (let x = x0 + mw * .3; x < x1 - mw * .6; x += mw * 1.9) S.push(washShape(block(x, x + mw, y - mh, y + 1), basalt, .9, 1, .3)); };
    const wallTop = gy - 120 * sc;
    const towers = [[-W * .46, -W * .28, gy - 175 * sc], [-W * .09, W * .1, gy - 215 * sc], [W * .29, W * .46, gy - 165 * sc]];
    // curtain wall, then the towers over it
    S.push(washShape(block(-W * .42, W * .42, wallTop), mixc(basalt, C.paper, .25), .8, 3, 1.5 * sc));
    merlons(-W * .42, W * .42, wallTop);
    for (const [x0, x1, y1] of towers) {
      S.push(washShape(block(x0, x1, y1), basalt, .85, 3, 1.5 * sc));
      S.push(washShape(block(x0 + (x1 - x0) * .55, x1, y1), mixc(basalt, ink, .3), .35, 2, 1));   // the shaded side
      merlons(x0, x1, y1, 16 * sc, 16 * sc);
      for (const yy of [y1 + (gy - y1) * .35, y1 + (gy - y1) * .62]) S.push(mk([[(x0 + x1) / 2, yy - 14 * sc], [(x0 + x1) / 2, yy + 14 * sc]], 5 * sc, ink, { prof: 'even', nb: 0, a: .8 }));
    }
    // light on the sun side of each tower and along the wall top (a pale glaze), a cool shadow pooled at the foot
    for (const [x0, x1, y1] of towers) S.push(washShape(block(x0, x0 + (x1 - x0) * .45, y1 + 10 * sc, gy - 20 * sc), mixc(C.stone, C.paperLight, .4), .32, 2, 2 * sc));
    S.push(washShape(block(-W * .42, W * .42, wallTop + 26 * sc, wallTop + 6 * sc), mixc(C.stone, C.paperLight, .3), .3, 2, 2 * sc));
    S.push(washShape(block(-W * .44, W * .44, gy - 22 * sc, gy + 2 * sc), mixc(basalt, ink, .35), .3, 2, 3 * sc));
    // pale limestone courses running through the basalt (dry brush), then dark dry-brush texture
    for (const f of [.3, .55, .8]) {
      const y = gy + (wallTop - gy) * f;
      S.push(mk(along([[-W * .42, y], [W * .42, y + rnd(-2, 2) * sc]], 14), 7 * sc, band, { prof: 'even', nb: 5, a: .38, rough: .5 }));
    }
    for (const [x0, x1, y1] of towers) S.push(mk(along([[x0, y1 + (gy - y1) * .2], [x1, y1 + (gy - y1) * .2]], 6), 7 * sc, band, { prof: 'even', nb: 4, a: .4, rough: .5 }));
    dryBrush(S, -W * .44, wallTop, W * .44, gy, mixc(basalt, ink, .3), 18, { w0: 6 * sc, w1: 12 * sc, a0: .15, a1: .3 });
    dryBrush(S, -W * .44, wallTop, W * .44, gy, mixc(C.stone, C.paperLight, .3), 12, { w0: 5 * sc, w1: 10 * sc, a0: .15, a1: .28 });
    // the gate: a pointed arch, dark
    const gx = W * .19, gw = 32 * sc, gh = 70 * sc;
    const arch = [[gx - gw, gy], [gx - gw, gy - gh * .6], [gx, gy - gh], [gx + gw, gy - gh * .6], [gx + gw, gy]];
    S.push(washShape(arch, mixc(ink, basalt, .2), .9, 2, .5));
    S.push(...inkLine(arch, 2 * sc, ink, { step: 1, a: .8 }));
    // ink edges, broken
    for (const [x0, x1, y1] of towers) S.push(...inkLine([[x0, gy], [x0, y1], [x1, y1], [x1, gy]], 2 * sc, ink, { step: 2, a: .6 }));
    S.push(...inkLine([[-W * .42, wallTop], [W * .42, wallTop]], 1.6 * sc, ink, { step: 3, a: .5 }));
    return { S, top: [0, towers[1][2]], parts: { tower: [(towers[1][0] + towers[1][1]) / 2, towers[1][2]], gate: [gx, gy - gh * .5], wall: [0, wallTop] } };
  };

  // ------------------------------------------------------------------ fallen_banner
  // a banner pole fallen across the ground, the red cloth slumped beside it. sc 1 ≈ 240 px long.  o: {color: token (default "red")}
  WC.G.fallen_banner = (sc, o = {}) => {
    const S = [], L = 240 * sc, ink = C.ink, cloth = tok(o.color, C.red);
    const a = [-L * .5, -4 * sc], b = [L * .5, -46 * sc];
    S.push(mk(along([[-L * .5, 2 * sc], [L * .5, 2 * sc]], 8), 16 * sc, mixc(C.ground, ink, .35), { prof: 'leaf', nb: 0, a: .25 }));
    const pole = mk([a, b], 7 * sc, C.wood, { prof: 'even', nb: 2, a: .95 });
    S.push(pole, WC.edgeOf(pole, 1, 1.4 * sc, ink, .7));
    // the cloth hangs from the raised end and crumples on the ground
    const cl = [[L * .46, -44 * sc], [L * .2, -36 * sc], [L * .05, -18 * sc], [L * .0, -2 * sc], [L * .3, 0], [L * .42, -10 * sc], [L * .5, -30 * sc]];
    S.push(washShape(cl, cloth, .82, 3, 2 * sc));
    S.push(washShape([[L * .3, -32 * sc], [L * .12, -22 * sc], [L * .1, -4 * sc], [L * .3, -2 * sc]], mixc(cloth, ink, .3), .4, 2, 1.5 * sc));
    for (let k = 0; k < 4; k++) S.push(mk(qcurve(L * (.42 - k * .08), -38 * sc + k * 4 * sc, L * (.32 - k * .07), -4 * sc, rnd(-5, 5) * sc, 5), 2 * sc, mixc(cloth, ink, .5), { prof: 'tip', nb: 0, a: .55 }));
    S.push(...inkLine(cl.concat([cl[0]]), 1.6 * sc, ink, { step: 1, a: .6 }));
    // a small pale cross on the cloth
    S.push(mk([[L * .22, -26 * sc], [L * .3, -16 * sc]], 4 * sc, C.paperLight, { prof: 'even', nb: 0, a: .85 }));
    S.push(mk([[L * .3, -27 * sc], [L * .22, -15 * sc]], 4 * sc, C.paperLight, { prof: 'even', nb: 0, a: .85 }));
    S.push(washShape(circ(b[0], b[1], 6 * sc), C.gold, .9, 1, 0));
    return { S, top: [L * .3, -46 * sc], parts: { cloth: [L * .25, -20 * sc], pole: [0, -25 * sc] } };
  };

  // ------------------------------------------------------------------ testi
  // a clay water jug: a round belly, a narrow neck with a flared lip, one loop handle, a crack. Upright (origin = base
  // centre, ≈ 250 px tall at sc 1) or tipped over on its side (o.tipped: mouth to the right, touching the ground), with a
  // single dry stain running out of the empty mouth. o: {tipped: true, col: clay token (default "roof"), crack: true}
  WC.G.testi = (sc, o = {}) => {
    const S = [], ink = C.ink, clay = mixc(tok(o.col, C.roof), C.clothC, .35);
    const Hh = 250 * sc, R = 88 * sc;
    // upright profile, y up negative: foot, belly, shoulder, neck, lip
    const half = [[30, 0], [62, -14], [86, -60], [88, -100], [76, -140], [46, -170], [26, -186], [24, -214], [34, -236], [38, -246]].map(([x, y]) => [x * sc, y * sc]);
    const outline = half.concat(half.slice().reverse().map(([x, y]) => [-x, y]));
    const handle = [[22 * sc, -205 * sc], [62 * sc, -222 * sc], [92 * sc, -196 * sc], [92 * sc, -150 * sc], [74 * sc, -132 * sc]];
    const tipped = !!o.tipped, ang = tipped ? Math.PI / 2 * .92 : 0;
    // tipped: rotate about the belly centre so the mouth points right and a little down, then set the lowest point on y 0
    const cx0 = 0, cy0 = -100 * sc, ca = Math.cos(ang), sa = Math.sin(ang);
    let T = ([x, y]) => [cx0 + (x - cx0) * ca - (y - cy0) * sa, cy0 + (x - cx0) * sa + (y - cy0) * ca];
    let lift = 0;
    if (tipped) { lift = Math.max(...outline.map(p => T(p)[1])); }
    const P = p => { const q = T(p); return [q[0], q[1] - lift]; };
    const body = outline.map(P);
    if (tipped) {   // the dry stain on the ground out of the mouth, and the shadow under the belly
      const m = P([0, -246 * sc]);
      S.push(washShape([[m[0] - 6 * sc, -2 * sc], [m[0] + 60 * sc, -4 * sc], [m[0] + 150 * sc, 0], [m[0] + 160 * sc, 6 * sc], [m[0] + 50 * sc, 8 * sc], [m[0] - 6 * sc, 6 * sc]], mixc(C.ground, C.wood, .35), .42, 3, 3 * sc));
      S.push(mk(along([[m[0] + 4 * sc, 2 * sc], [m[0] + 90 * sc, 2 * sc], [m[0] + 150 * sc, 3 * sc]], 8), 3 * sc, mixc(C.wood, ink, .2), { prof: 'tip', nb: 0, a: .45 }));
    }
    S.push(mk(along([[-R * 1.2, 3 * sc], [0, 8 * sc], [R * 1.6, 4 * sc]], 10), 22 * sc, mixc(C.ground, ink, .4), { prof: 'leaf', nb: 0, a: .28 }));
    // the handle behind the near side
    S.push(mk(along(handle.map(P), 14), 13 * sc, mixc(clay, ink, .15), { prof: 'even', nb: 3, a: .95 }));
    S.push(...inkLine(handle.map(P), 1.8 * sc, ink, { step: 2, a: .6 }));
    // body washes: clay, a shaded side, a pale highlight (paper), dry brush
    S.push(washShape(body, clay, .82, 3, 2 * sc));
    const shade = half.map(([x, y]) => [x, y]).concat(half.slice().reverse().map(([x, y]) => [x * .25, y])).map(P);
    S.push(washShape(shade, mixc(clay, ink, .3), .4, 3, 2 * sc));
    S.push(mk(along([[-60 * sc, -130 * sc], [-70 * sc, -95 * sc], [-58 * sc, -55 * sc]].map(P), 8), 16 * sc, C.paperLight, { prof: 'leaf', nb: 3, a: .5 }));
    for (let i = 0; i < 9; i++) {
      const y = -rnd(20, 170) * sc, w = (88 - Math.abs(y / sc + 100) * .4) * sc;
      S.push(mk(along([[-w * .9, y], [w * .9, y + rnd(-4, 4) * sc]].map(P), 8), rnd(5, 9) * sc, mixc(clay, ink, .3), { prof: 'leaf', nb: 6, a: rnd(.12, .22), rough: .45 }));
    }
    // a band of incised lines on the shoulder, the dark empty mouth, the crack
    for (const yy of [-150, -158]) S.push(...inkLine([[-70 * sc, yy * sc], [-30 * sc, (yy + 4) * sc], [30 * sc, (yy + 4) * sc], [70 * sc, yy * sc]].map(P), 1.2 * sc, mixc(clay, ink, .6), { step: 1, a: .5 }));
    const mouth = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2; return [Math.cos(a) * 34 * sc, -244 * sc + Math.sin(a) * 9 * sc]; }).map(P);
    S.push(washShape(mouth, mixc(ink, C.wood, .2), .9, 2, .3));
    if (o.crack !== false) S.push(...inkLine([[20 * sc, -175 * sc], [34 * sc, -140 * sc], [26 * sc, -118 * sc], [44 * sc, -88 * sc], [38 * sc, -64 * sc]].map(P), 2 * sc, ink, { step: 1, a: .8 }));
    S.push(...inkLine(body.concat([body[0]]), 2.2 * sc, ink, { step: 2, a: .75 }));
    return { S, top: P([0, -246 * sc]), parts: { mouth: P([0, -246 * sc]), neck: P([0, -205 * sc]), body: P([0, -100 * sc]), handle: P([92 * sc, -175 * sc]), crack: P([34 * sc, -120 * sc]), foot: P([0, 0]) } };
  };

  // ------------------------------------------------------------------ cracked_ground
  // sun-cracked dry earth for the fg layer: polygon cells whose size grows toward the viewer, dark crack lines, pale
  // curled edges. Absolute size (ignores sc): origin = bottom centre. o: {w (1200), h (760), ground: token}
  WC.G.cracked_ground = (sc, o = {}) => {
    const S = [], w = o.w ?? 1200, h = o.h ?? 760, g0 = tok(o.ground, C.ground), ink = C.ink;
    for (let i = 0; i < 4; i++) {
      const y0 = -h + i * h * .25 - 20, pts = [];
      for (let x = -w / 2 - 20; x <= w / 2 + 20; x += 60) pts.push([x, y0 + rnd(-10, 10)]);
      pts.push([w / 2 + 20, 20], [-w / 2 - 20, 20]);
      S.push(washShape(pts, mixc(g0, C.wood, .06 + i * .07), .2 + i * .05, 3, 8));
    }
    // irregular cells: jagged crack lines wandering across the ground (long ones roughly along the rows, short ones
    // branching across), getting wider and further apart toward the viewer
    const jag = (x0, y0, x1, y1, n, j) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t + rnd(-j, j), y0 + (y1 - y0) * t + rnd(-j, j)]); } return pts; };
    let y = -h + 40;
    const rows = [];
    for (let r = 0; y < -10; r++) { rows.push([y, r]); y += 26 + r * 11; }
    for (const [yy, r] of rows) {
      const wdt = 1 + r * .35, a = .22 + Math.min(.45, r * .06), col = mixc(g0, ink, .5);
      // a long wandering crack across, in 2–3 pieces
      let x = -w / 2 - 30;
      while (x < w / 2) {
        const len = rnd(160, 380) + r * 40, x1 = x + len;
        S.push(mk(jag(x, yy + rnd(-8, 8), x1, yy + rnd(-14, 14), 6, 4 + r), wdt, col, { prof: 'tip', nb: 0, a }));
        x = x1 + rnd(-20, 30);
      }
      // short branching cracks down to the next row, at irregular spacing and angles
      const nx = Math.round(5 + r * .3);
      for (let k = 0; k < nx * 2; k++) {
        const bx = rnd(-w / 2, w / 2), down = 26 + r * 11;
        S.push(mk(jag(bx, yy, bx + rnd(-down * .7, down * .7), yy + down * rnd(.7, 1.05), 3, 2 + r * .6), wdt * .9, col, { prof: 'tip', nb: 0, a: a * .9 }));
        if (r > 3 && rnd() < .5) S.push(mk(qcurve(bx + 6, yy + 6, bx + rnd(30, 70), yy + rnd(4, 14), rnd(-3, 3), 4), 2 + r * .35, C.paperLight, { prof: 'leaf', nb: 0, a: .22 }));
      }
    }
    return { S };
  };

  // ------------------------------------------------------------------ tent_interior
  // inside a big campaign tent at night: canvas panels with seams falling from a ridge, the centre pole, the canvas
  // sagging between guy points, a warm glow on it. Absolute size: origin = bottom centre (the floor line).
  // o: {w (1240), h (1100), col: canvas token (default "clothC"), stripe: token (default "cloth")}
  WC.G.tent_interior = (sc, o = {}) => {
    const S = [], w = o.w ?? 1240, h = o.h ?? 1100, can = mixc(tok(o.col, C.clothC), C.paper, .3), str = o.stripe ? tok(o.stripe, C.cloth) : mixc(can, C.stoneDark, .35), ink = C.ink;
    const ridge = [0, -h];
    // panels: from the ridge down to the floor, alternating canvas and faded stripe, each a wash with a darker fold
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x0 = -w / 2 + i * w / n, x1 = x0 + w / n;
      const top0 = [ridge[0] + (x0) * .08, -h + Math.abs(x0) * .18], top1 = [ridge[0] + (x1) * .08, -h + Math.abs(x1) * .18];
      const col = i % 2 ? mixc(str, can, .5) : can;
      S.push(washShape([top0, top1, [x1, 0], [x0, 0]], col, .62, 3, 4));
      S.push(mk(along([[x0 + 6, -h * .9 + Math.abs(x0) * .16], [x0 + 10, -h * .45], [x0 + 4, -6]], 12), 22, mixc(col, ink, .3), { prof: 'leaf', nb: 6, a: .22, rough: .45 }));
    }
    // the sag (catenary folds) near the top, dark at the ridge
    for (let k = 0; k < 4; k++) S.push(mk(qcurve(-w / 2, -h * (.72 - k * .05), w / 2, -h * (.72 - k * .05), h * .06, 20), 6, mixc(can, ink, .35), { prof: 'leaf', nb: 4, a: .18 }));
    S.push(washShape([[-w / 2, -h - 40], [w / 2, -h - 40], [w / 2, -h * .8], [0, -h * .97], [-w / 2, -h * .8]], mixc(C.night, can, .3), .6, 3, 4));
    // the centre pole
    const pole = mk([[w * .08, 6], [w * .06, -h * .97]], 22, C.wood, { prof: 'even', nb: 3, a: .95 });
    S.push(pole, WC.edgeOf(pole, 1, 2.4, ink, .8), WC.edgeOf(pole, -1, 1.4, C.paperLight, .5));
    // night: the canvas is darker away from the light
    S.push(washShape([[-w / 2, -h], [-w * .2, -h], [-w * .3, 0], [-w / 2, 0]], C.night, .22, 2, 6));
    return { S };
  };

  // ------------------------------------------------------------------ candle_halo
  // a soft warm halo of candlelight: concentric pale-gold washes. o: {r (px at sc 1, 220)}
  WC.G.candle_halo = (sc, o = {}) => {
    const S = [], r = (o.r ?? 220) * sc;
    for (const [k, a] of [[1, .14], [.72, .18], [.46, .24]]) S.push(washShape(circ(0, 0, r * k, r * k * .9, 26), mixc(C.gold, C.paperLight, .35), a, 3, 6 * sc));
    return { S };
  };

  // ------------------------------------------------------------------ wc_hittin_horns
  SHOTS.wc_hittin_horns = { kind: '2d', build(ctx) {
    const P = ctx.P || {}, { W, H } = ctx;
    const portrait = H > W;
    const hs = P.horns || {};
    // the hill is the first main item of an ordinary wc_scene; its notes are drawn here, over the smoke
    const item = { g: 'hittin_horns', x: hs.x ?? .5, s: hs.s ?? 1, o: hs.o || {}, at: hs.at ?? .1, paint: hs.paint ?? 1.4, dy: hs.dy ?? 0, sway: false, layer: 'main' };
    const s = WC.scene(Object.assign({}, ctx, { P: Object.assign({}, P, { items: [item].concat(P.items || []), notes: [], mist: undefined }) }));
    const hx = item.x * W;
    // the smoke sheet: puffs on a slow conveyor, wrapped across the frame (deterministic)
    const puffs = WC.withSeed(ctx.seed * 31 + 3, () => Array.from({ length: 22 }, (_, i) => ({ u: i / 22 + rnd(-.015, .015), dy: rnd(-1, 1), r: rnd(.7, 1.3), ph: rnd(0, 6.28), pts: WC.blobPts(0, 0, 1.8, .7, 18, .18) })));
    return { update(lt, dur, cues) {
      cues = cues || {};
      s.update(lt, dur, cues);
      const X = s.X;
      // smoke rolling across the plain from the left, rising a little up the flanks
      const sa = timeOf(P.smoke_at, cues, 0), k = ss(seg(lt, sa, sa + 1.6));
      if (k > 0) {
        const y0 = (P.smoke_y ?? s.gy / H) * H, A = (P.smoke_a ?? .45) * k;
        for (const [i, p] of puffs.entries()) {
          const u = ((p.u + lt * .022) % 1 + 1) % 1, x = -W * .2 + u * W * 1.4;
          const lift = Math.max(0, 1 - Math.abs(x - hx) / (W * .6)) * H * .04;
          const y = y0 - lift + p.dy * H * .018 + Math.sin(lt * .6 + p.ph) * 6;
          const rr = H * .06 * p.r * (1 + .12 * Math.sin(lt * .4 + p.ph));
          X.save(); X.globalAlpha = A * (.32 + .12 * Math.sin(p.ph));
          X.fillStyle = i % 3 ? C.smoke : mixc(C.smoke, C.paper, .4);
          X.beginPath(); const pts = p.pts;
          X.moveTo(x + pts[0][0] * rr, y + pts[0][1] * rr); for (const q of pts) X.lineTo(x + q[0] * rr, y + q[1] * rr); X.closePath(); X.fill(); X.restore();
        }
      }
      for (const n of (P.notes || [])) {
        const nt = timeOf(n.at, cues, 1.2);
        if (n.ax != null) WC.note(X, lt, nt, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size: n.size || (portrait ? 50 : 44), col: n.color === 'red' ? C.red : C.ink, bend: n.bend });
        else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, nt, nt + 1), { size: n.size || (portrait ? 54 : 46), align: n.align || 'center', col: n.color === 'red' ? C.red : C.ink });
      }
      if (P.mist != null) { const m0 = timeOf(P.mist, cues, dur - 1.2); WC.mist(X, W, H, seg(lt, m0, m0 + 1.6)); }
    } };
  } };
})();
