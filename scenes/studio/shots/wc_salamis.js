// wc_salamis — topic objects and a shot for "Salamis: tek bir yalan" (videos/2026-11-28/01-salamis-mesaji.json).
// Same contract as the other WC.G generators: local coordinates, y negative up, origin = centre of the waterline /
// base centre, the stroke list paints in in order, `live` is a pure function of lt (no Math.random).
// trireme       a Greek-era trireme, bow (and its bronze ram at the waterline) toward +x, sc 1 ≈ 380 px long: a long low
//               hull, a painted eye at the bow, an outrigger box with three banks of oars, the stern curling up into
//               the aphlaston, a light deck with a row of shields (greek) or tall-capped marines (persian).
//               o: {side: 'greek' (red band, round shields) | 'persian' (Phoenician-built: dark hull, blue and gold band,
//               marines in tall caps), sail: 'none' (default, mast down for battle) | 'full' (square sail) | 'furled',
//               row: true (the oars sweep in unison, live), damage: true (a stove-in side, broken oars, a list),
//               oars: n per bank (default 20)}   parts: ram eye stern mast deck
// skiff         a small dark boat at night, sc 1 ≈ 210 px long: a hooded rower pulling two oars (live) and a cloaked
//               man sitting in the bow; a small hooded lamp on a short pole at the stern; live: the oars, the lamp's
//               flame, its warm glow and its broken reflection on the water under the boat.
//               o: {lamp: true|false, rower: true, passenger: true, row: true (oars move, default true)}
//               parts: lamp passenger rower
// xerxes        the Great King seated on a high-backed throne with lion feet and a footstool, side view facing +x: a
//               long purple-red robe with a gold hem, a square beard, a tall fluted crown, a gold sceptre; a servant
//               behind him holds a parasol over him. sc 1 ≈ 300 px tall. o: {parasol: true|false}
//               parts: head crown hand throne parasol
// wc_salamis_night  a wc_scene (same params) at night over dark water: after the backdrop is baked, the sea is glazed
//               with the night pigment (deeper toward the bottom) and a moon path is laid on it; everything else is
//               wc_scene (items, notes, move ...). params: wc_scene params + {veil: 0..1 (how dark the sea, .55),
//               path: x 0..1 of the moon path | false}
'use strict';
(() => {
  const C = WC.C, { mk, washShape, inkLine, mixc, along, qcurve, qctrl, rnd, pick, clamp, hash } = WC;
  const PI = Math.PI;
  const circ = (cx, cy, rx, ry = rx, n = 18) => Array.from({ length: n }, (_, i) => { const a = i / n * PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const rotS = (S, a) => {
    const c = Math.cos(a), s = Math.sin(a), R = ([x, y]) => [x * c - y * s, x * s + y * c];
    for (const t of S) {
      if (t.poly) { t.poly = t.poly.map(r => r.map(R)); t.pts = t.pts.map(R); }
      else { t.pts = t.pts.map(R); const nn = t.nx.map((v, i) => R([v, t.ny[i]])); t.nx = nn.map(p => p[0]); t.ny = nn.map(p => p[1]); }
    }
    return S;
  };
  const shiftS = (S, dx, dy) => {
    for (const s of S) {
      if (s.poly) { s.poly = s.poly.map(r => r.map(([x, y]) => [x + dx, y + dy])); s.pts = s.pts.map(([x, y]) => [x + dx, y + dy]); }
      else s.pts = s.pts.map(([x, y]) => [x + dx, y + dy]);
    }
    return S;
  };
  const glow = (c, x, y, r, a, col = C.gold) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, WC.rgba(col, a)); g.addColorStop(.45, WC.rgba(col, a * .4)); g.addColorStop(1, WC.rgba(col, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  };

  // ------------------------------------------------------------------ trireme
  WC.G.trireme = (sc, o = {}) => {
    const S = [], u = sc, per = o.side === 'persian';
    const hull = per ? mixc(C.wood, C.ink, .45) : mixc(C.wood, C.ink, .22), dark = mixc(hull, C.ink, .45);
    const band = per ? C.blue : C.red, ink = C.ink;
    const P = pts => pts.map(([x, y]) => [x * u, y * u]);
    const top = x => -(24 + 10 * Math.pow(Math.max(0, x / 160), 2) + 4 * Math.pow(Math.max(0, -x / 150), 2));
    const sheer = (x0, x1, d = 0, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return [x * u, (top(x) + d) * u]; });
    // dry-brush texture: a few broken strokes of a darker / lighter tone along the hull
    const tex = (x0, x1, y0, y1, col, nn, a0 = .14, a1 = .3) => { for (let i = 0; i < nn; i++) { const y = rnd(y0, y1), xa = rnd(x0, x1 - 60); S.push(mk(qcurve(xa * u, y * u, (xa + rnd(50, 140)) * u, (y + rnd(-2, 2)) * u, rnd(-2, 2) * u, 10), rnd(3, 7) * u, col, { prof: 'leaf', nb: 5, a: rnd(a0, a1), rough: .55 })); } };
    // deck first (the outrigger and the hull are painted over its lower half): marines and a row of shields
    S.push(mk(sheer(-128, 140, -17, 14), 2 * u, mixc(C.wood, C.paperLight, .2), { prof: 'even', nb: 0, a: .7 }));
    for (let x = -120; x <= 130; x += 25) S.push(mk(P([[x, top(x) - 9], [x, top(x) - 17]]), 1.2 * u, ink, { prof: 'even', nb: 0, a: .4 }));
    const bronze = mixc(C.gold, C.wood, .55), shTone = [bronze, mixc(C.ink, C.wood, .35)];
    for (let x = -96; x <= 116; x += 15) {
      const y = top(x) - 16 + rnd(-1.5, 1.5);
      S.push(washShape(circ(x * u, (y - 12) * u, 3.2 * u, 3.4 * u, 8), mixc(C.skin, C.wood, .3), .7, 1, .2));
      if (per) S.push(washShape(P([[x - 3, y - 14], [x - 2.5, y - 23], [x + 2.5, y - 23], [x + 3, y - 14]]), mixc(C.clothB, C.ink, .35), .65, 1, .2));
      else S.push(washShape(P([[x - 3.5, y - 14], [x, y - 20], [x + 3.5, y - 14]]), bronze, .7, 1, .2));
      if (rnd() < .35) S.push(mk(P([[x + 4, y], [x + 6, y - 34]]), 1 * u, ink, { prof: 'tip', nb: 0, a: .5 }));
      if (!per || rnd() < .4) {
        const r = rnd(6.5, 8), c0 = shTone[Math.floor(rnd(0, 2))];
        S.push(washShape(circ(x * u, y * u, r * u, r * u, 14).map(([a, b]) => [a + rnd(-.6, .6) * u, b + rnd(-.6, .6) * u]), c0, rnd(.45, .65), 2, .5 * u));
        S.push(mk(qcurve((x - r * .7) * u, (y + r * .5) * u, (x + r * .7) * u, (y + r * .5) * u, r * .3 * u, 6), 1.2 * u, mixc(c0, ink, .45), { prof: 'tip', nb: 0, a: .45 }));
      }
    }
    // hull: low and long, a straight stem down to a short ram, the stern rising
    const H = [...sheer(-150, 160, 0, 22), ...P([[170, -16], [176, -6], [172, 8], [140, 12], [-110, 12], [-150, 2]])];
    S.push(washShape(H, hull, .8, 3, 1.8 * u));
    S.push(washShape(H.map(([x, y]) => [x + rnd(-2, 2) * u, y + rnd(-1.5, 1.5) * u]), mixc(hull, C.paperLight, .15), .25, 2, 2 * u));
    S.push(washShape([...sheer(-140, 150, 10, 14), ...P([[166, -4], [172, 8], [140, 12], [-110, 12], [-146, 4]])], dark, .45, 2, 1.5 * u));
    tex(-140, 160, -20, 8, mixc(hull, C.ink, .35), 10);
    tex(-130, 150, -22, -10, mixc(hull, C.paperLight, .35), 5, .1, .2);
    for (const d of [5, 13]) S.push(mk(sheer(-146, 158, d, 16), 1 * u, ink, { prof: 'even', nb: 0, a: .22, rough: .4 }));
    S.push(mk(sheer(-146, 160, 2.5, 18), 3.6 * u, band, { prof: 'brush', nb: 4, a: .6, rough: .4 }));
    if (per) S.push(mk(sheer(-120, 150, 7.5, 16), 2 * u, bronze, { prof: 'leaf', nb: 3, a: .55 }));
    S.push(...inkLine(H.slice(0, 26), 1.4 * u, ink, { step: 3, a: .6 }));
    // the ram: short, dark bronze, just at the waterline
    const ramC = mixc(C.wood, C.gold, .3), ram = P([[166, -9], [188, -4], [192, 1], [187, 6], [168, 8]]);
    S.push(washShape(ram, mixc(ramC, C.ink, .35), .85, 3, .5 * u));
    S.push(mk(P([[176, -6], [176, 6]]), 1.3 * u, mixc(ramC, ink, .6), { prof: 'even', nb: 0, a: .6 }));
    S.push(...inkLine(ram, 1 * u, ink, { step: 2, a: .55 }));
    // stem post above the bow
    S.push(mk(P([[158, -34], [163, -42], [168, -45]]), 3.6 * u, hull, { prof: 'tip', nb: 2, a: .9 }));
    // the eye: a small painted almond
    const eye = [[128, -18], [133, -21.5], [139, -21.5], [143, -18], [139, -15.5], [133, -15.5]];
    S.push(washShape(P(eye), mixc(C.paperLight, C.stain, .2), .85, 2, .2 * u));
    S.push(washShape(circ(136 * u, -18.5 * u, 2 * u, 2 * u, 8), ink, .85, 1, 0));
    S.push(mk(qcurve(127 * u, -19 * u, 144 * u, -19 * u, -5 * u, 6), .9 * u, ink, { prof: 'tip', nb: 0, a: .55 }));
    // the stern: a slender aphlaston curling up and forward
    const aph = qctrl(-148 * u, -26 * u, -184 * u, -56 * u, -166 * u, -94 * u, 12).concat(qctrl(-166 * u, -94 * u, -156 * u, -106 * u, -150 * u, -92 * u, 6).slice(1));
    S.push(mk(aph, 5.5 * u, hull, { prof: 'tip', nb: 3, a: .9 }));
    S.push(mk(aph.map(([x, y]) => [x + 1.5 * u, y + 1 * u]), 1 * u, ink, { prof: 'tip', nb: 0, a: .55 }));
    for (let k = 0; k < 3; k++) S.push(mk(qcurve(-150 * u, (-92 + k * 4) * u, (-134 - k * 5) * u, (-102 + k * 8) * u, 2 * u, 5), 1.4 * u, hull, { prof: 'tip', nb: 0, a: .75 }));
    // the steering oar
    S.push(mk(P([[-132, -30], [-158, 14]]), 2.6 * u, dark, { prof: 'even', nb: 0, a: .85 }));
    S.push(washShape(P([[-152, 2], [-162, 4], [-166, 22], [-156, 20]]), dark, .7, 2, .4));
    // the outrigger box the top bank works from
    const ob = [...sheer(-118, 136, -9, 14), ...sheer(-118, 136, -1, 14).reverse()];
    S.push(washShape(ob, mixc(hull, C.paperLight, .2), .75, 3, .8 * u));
    tex(-110, 130, -32, -26, mixc(hull, C.ink, .3), 4, .12, .22);
    S.push(mk(sheer(-120, 138, -9, 14), 2.2 * u, mixc(C.wood, C.paperLight, .3), { prof: 'leaf', nb: 3, a: .75 }));
    S.push(...inkLine(sheer(-120, 138, -9, 14), 1 * u, ink, { step: 3, a: .45 }));
    // oars: three banks, ports staggered
    const n = o.oars ?? 20, oars = [];
    for (let b = 0; b < 3; b++) for (let i = 0; i < n; i++) {
      const x = -106 + (228 * (i + b * .33)) / n, y = top(x) + [-1, 5, 10][b];
      oars.push({ x: x * u, y: y * u, b, i });
    }
    const oarC = mixc(C.wood, C.ink, .5);
    if (!o.row) for (const q of oars) {
      if (o.damage && (q.i + q.b) % 3 === 0) continue;
      const broken = o.damage && (q.i % 3 === 1);
      const L = (broken ? 16 : 46) * u;
      S.push(mk(qcurve(q.x, q.y, q.x - L * .5 + (broken ? rnd(-6, 6) * u : 0), q.y + L * .9, 0, 4), 1.4 * u, oarC, { prof: 'even', nb: 0, a: .7 }));
    }
    // mast and sail
    const mx = 14;
    if (o.sail === 'full' || o.sail === 'furled') {
      S.push(mk(P([[mx, -34], [mx + 2, -210]]), 4.4 * u, mixc(C.wood, C.ink, .25), { prof: 'tip', nb: 0, a: .95 }));
      if (o.sail === 'full') {
        const sail = P([[mx - 78, -196], [mx + 80, -196], [mx + 90, -112], [mx + 50, -96], [mx - 40, -96], [mx - 82, -110]]);
        S.push(washShape(sail, mixc(C.paperLight, C.clothC, .28), .9, 3, 1.2 * u));
        S.push(washShape(P([[mx + 10, -196], [mx + 80, -196], [mx + 90, -112], [mx + 50, -96], [mx + 10, -96]]), mixc(C.clothC, C.stoneDark, .35), .3, 2, 1));
        for (let k = -3; k <= 3; k++) S.push(mk(P([[mx + k * 22, -194], [mx + k * 24, -100]]), 1.2 * u, mixc(C.clothC, C.ink, .35), { prof: 'even', nb: 0, a: .35 }));
        S.push(...inkLine(sail.concat([sail[0]]), 1.2 * u, ink, { step: 2, a: .55 }));
      }
      const yard = o.sail === 'full' ? -198 : -150;
      S.push(mk(qcurve((mx - 90) * u, yard * u, (mx + 92) * u, yard * u, 6 * u, 10), 3.4 * u, mixc(C.wood, C.ink, .3), { prof: 'even', nb: 0, a: .95 }));
      if (o.sail === 'furled') S.push(mk(qcurve((mx - 84) * u, (yard + 6) * u, (mx + 86) * u, (yard + 6) * u, 6 * u, 10), 8 * u, mixc(C.paperLight, C.clothC, .3), { prof: 'leaf', nb: 4, a: .9 }));
      S.push(mk(qcurve(mx * u, -206 * u, 160 * u, -40 * u, -8 * u, 10), .9 * u, ink, { prof: 'even', nb: 0, a: .45 }));
      S.push(mk(qcurve(mx * u, -206 * u, -140 * u, -40 * u, 8 * u, 10), .9 * u, ink, { prof: 'even', nb: 0, a: .45 }));
    }
    // damage: a stove-in side, splinters
    if (o.damage) {
      const hole = P([[-44, -22], [-10, -30], [22, -26], [40, -10], [30, 6], [-20, 8], [-46, -4]]);
      S.push(washShape(hole, mixc(C.ink, C.wood, .25), .85, 3, 2.5 * u));
      S.push(washShape(hole.map(([x, y]) => [x * .6, y * .7]), C.ink, .5, 2, 1.5 * u));
      S.push(...inkLine(hole.concat([hole[0]]), 1.4 * u, ink, { step: 2, a: .6 }));
      for (let k = 0; k < 9; k++) { const x = -40 + k * 9; S.push(mk(P([[x, -14], [x + rnd(-14, 14), -30 - rnd(4, 16)]]), 2.2 * u, mixc(C.wood, C.paperLight, .25), { prof: 'tip', nb: 0, a: .9 })); }
      rotS(S, -(o.list ?? .07));
    }
    // foam at the waterline
    S.push(mk(P([[-150, 3], [-60, 4], [40, 3], [150, 4], [190, 2]]), 3 * u, C.paperLight, { prof: 'leaf', nb: 4, a: .55 }));
    const live = o.row ? (c, lt) => {
      c.save(); c.lineCap = 'round'; c.strokeStyle = WC.rgba(oarC, .6); c.lineWidth = 1.3 * u;
      const ph = lt * 2.1, sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph));
      c.beginPath();
      for (const q of oars) {
        const L = 48 * u, a = .95 + sw * .38, tx = q.x - Math.cos(a) * L * .62, ty = q.y + Math.sin(a) * L - lift * 7 * u;
        c.moveTo(q.x, q.y); c.lineTo(tx, ty);
      }
      c.stroke();
      // splashes where the blades dip
      c.fillStyle = WC.rgba(C.paperLight, .45 * (1 - lift));
      for (const q of oars) if (q.b === 0 && q.i % 2 === 0) { const x = q.x - 30 * u + sw * 10 * u; c.beginPath(); c.ellipse(x, 8 * u, 9 * u, 2.4 * u, 0, 0, 7); c.fill(); }
      c.restore();
    } : null;
    return { S, live, top: [mx * u, -210 * u], parts: { ram: [190 * u, 0], eye: [136 * u, -18 * u], stern: [-170 * u, -104 * u], mast: [mx * u, -150 * u], deck: [0, -45 * u], center: [0, -40 * u] } };
  };

  // ------------------------------------------------------------------ skiff
  WC.G.skiff = (sc, o = {}) => {
    const S = [], u = sc, ink = C.ink;
    const P = pts => pts.map(([x, y]) => [x * u, y * u]);
    const hc = mixc(C.wood, C.ink, .35), dark = mixc(C.wood, C.ink, .6);
    const top = x => -(16 + 12 * Math.pow(x / 105, 2));
    const sheer = (x0, x1, d = 0, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return [x * u, (top(x) + d) * u]; });
    const H = [...sheer(-104, 106, 0, 16), ...P([[110, -10], [92, 6], [-86, 6], [-106, -8]])];
    S.push(washShape([...sheer(-98, 100, 0, 12), ...sheer(-98, 100, 0, 12).reverse().map(([x, y]) => [x, y - 5 * u * (1 - Math.pow(x / (100 * u), 2))])], dark, .8, 2, .4));
    const parts = {};
    // the people first (the near side of the hull is painted over their legs)
    const fig = (x, y, po, deep) => {
      const F = WC.G.person(sc * .78, po).S; shiftS(F, x * u, y * u); S.push(...F);
      // a second, darker glaze over the cloth and a dry-brush pooled edge (two layers, not one flat fill)
      for (const t of F) if (t.poly && t.pts.length > 5 && t.fill !== C.skin) {
        const g = t.pts.map(([a, b]) => [a + rnd(-1.5, 1.5) * u, b + rnd(-1.5, 1.5) * u]);
        S.push(washShape(g.filter((_, i) => i % 2 === 0 || rnd() < .5), mixc(deep, C.ink, .3), .22, 2, 1.2 * u));
        S.push(...inkLine(t.pts.concat([t.pts[0]]), 2.2 * u, mixc(deep, C.ink, .45), { step: 3, a: .3, nb: 3 }));
      }
    };
    if (o.rower !== false) { fig(-8, -10, { pose: 'row', dress: 'robe', hold: o.row === false ? 'oar' : 'none', headgear: 'hood', face: 'left', beard: false, cols: { cloth: 'night', clothB: 'night', hat: 'night' } }, C.night); parts.rower = [-8 * u, -60 * u]; }
    if (o.passenger !== false) { fig(58, -10, { pose: 'sit', seat: 'ground', dress: 'robe', headgear: 'hood', face: 'right', beard: true, cols: { cloth: 'clothB', clothB: 'night', hat: 'clothB' } }, C.clothB); parts.passenger = [58 * u, -70 * u]; }
    S.push(washShape(H, hc, .9, 3, .8 * u));
    S.push(washShape([...sheer(-96, 98, 8, 12), [90 * u, 6 * u], [-84 * u, 6 * u]], dark, .45, 2, .6));
    for (let i = 0; i < 9; i++) { const y = rnd(-14, 2), x0 = rnd(-96, 10); S.push(mk(P([[x0, y], [x0 + rnd(60, 110), y + rnd(-2, 2)]]), rnd(4, 7) * u, mixc(hc, i % 3 ? C.ink : C.paperLight, .3), { prof: 'leaf', nb: 5, a: rnd(.12, .25), rough: .55 })); }
    // dry brush folds over the cloaks (the figures are washes; this breaks them up like a real brush)
    const fold = (x0, x1, y0, y1, col, nn) => { for (let i = 0; i < nn; i++) { const x = rnd(x0, x1), y = rnd(y0, y1); S.push(mk(qcurve(x * u, y * u, (x + rnd(-6, 10)) * u, (y + rnd(14, 30)) * u, rnd(-4, 4) * u, 6), rnd(3, 6) * u, col, { prof: 'leaf', nb: 4, a: rnd(.15, .3), rough: .6 })); } };
    S.push(mk(sheer(-104, 106, 1.5, 14), 2.6 * u, mixc(C.wood, C.paperLight, .25), { prof: 'even', nb: 0, a: .85 }));
    S.push(...inkLine(sheer(-106, 108, 0, 14), 1.3 * u, ink, { step: 3, a: .75 }));
    // the lamp: a short pole at the stern, a small hooded clay lamp hanging from its crook
    const lampP = [-92 * u, -78 * u];
    if (o.lamp !== false) {
      S.push(mk(P([[-96, -22], [-98, -96]]), 2.6 * u, dark, { prof: 'even', nb: 0, a: .95 }));
      S.push(mk(qcurve(-98 * u, -96 * u, -88 * u, -92 * u, -3 * u, 5), 2 * u, dark, { prof: 'tip', nb: 0, a: .9 }));
      S.push(mk(P([[-89, -92], [-90, -86]]), .9 * u, ink, { prof: 'even', nb: 0, a: .7 }));
      S.push(washShape(P([[-98, -72], [-97, -82], [-90, -88], [-84, -82], [-83, -72]]), mixc(C.roof, C.wood, .3), .95, 2, .2));
      S.push(washShape(P([[-95, -79], [-90, -84], [-86, -79], [-90, -74]]), mixc(C.gold, C.paperLight, .3), .9, 1, 0));
      parts.lamp = lampP;
    }
    const oarC = mixc(C.wood, C.ink, .55);
    const rowing = o.rower !== false && o.row !== false;
    const live = (c, lt) => {
      if (rowing) {         // the oar pivots on the gunwale: blade sweeps aft in the water, lifts, swings forward
        const ph = lt * 1.5, sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph)), lock = [-58 * u, -22 * u], h0 = [-13 * u, -63 * u];
        const v = [lock[0] - h0[0], lock[1] - h0[1]], r = Math.hypot(v[0], v[1]), a0 = Math.atan2(v[1], v[0]) + sw * .16 - lift * .12;
        const d = [Math.cos(a0), Math.sin(a0)], hand = [lock[0] - d[0] * r, lock[1] - d[1] * r], blade = [lock[0] + d[0] * 62 * u, lock[1] + d[1] * 62 * u];
        c.save(); c.lineCap = 'round'; c.strokeStyle = WC.rgba(oarC, .9); c.lineWidth = 2.6 * u;
        c.beginPath(); c.moveTo(hand[0], hand[1]); c.lineTo(blade[0], blade[1]); c.stroke();
        c.fillStyle = WC.rgba(oarC, .85); c.beginPath(); c.ellipse(blade[0], blade[1], 9 * u, 3 * u, Math.atan2(d[1], d[0]), 0, 7); c.fill();
        if (blade[1] > 2 * u) { c.fillStyle = WC.rgba(C.paperLight, .4); c.beginPath(); c.ellipse(blade[0], 6 * u, 16 * u, 2.6 * u, 0, 0, 7); c.fill(); }
        c.restore();
      }
      // the lamp: glow, flame and its broken reflection on the water
      if (o.lamp !== false) {
        const fl = .85 + .1 * Math.sin(lt * 5.3) + .05 * Math.sin(lt * 11.7);
        glow(c, lampP[0], lampP[1], 200 * u * fl, .5, C.gold);
        glow(c, lampP[0] + 70 * u, lampP[1] + 10 * u, 120 * u, .2 * fl, mixc(C.gold, C.fire, .3));
        glow(c, lampP[0], lampP[1], 40 * u, .55, mixc(C.gold, C.paperLight, .4));
        WC.flame(c, lampP[0], lampP[1] + 2 * u, 9 * u * fl, lt, 5);
        c.save(); c.lineCap = 'round';
        for (let k = 0; k < 14; k++) {
          const y = (10 + k * 13) * u, w = (30 - k * 1.4) * u * (.8 + .3 * Math.sin(lt * 1.7 + k * 1.3)), x = lampP[0] + Math.sin(lt * 2.1 + k * .9) * (5 + k) * u;
          c.strokeStyle = WC.rgba(mixc(C.gold, C.paperLight, .3), .5 * (1 - k / 15)); c.lineWidth = Math.max(.8, 3.2 - k * .17) * u;
          c.beginPath(); c.moveTo(x - w / 2, y); c.lineTo(x + w / 2, y); c.stroke();
        }
        c.restore();
      }
    };
    return { S, live, top: [0, -96 * u], parts };
  };

  // ------------------------------------------------------------------ xerxes
  WC.G.xerxes = (sc, o = {}) => {
    const S = [], u = sc, ink = C.ink;
    const P = pts => pts.map(([x, y]) => [x * u, y * u]);
    const gold = mixc(C.gold, C.wood, .3), wood = mixc(C.wood, C.ink, .15);
    const robe = mixc(C.cloth, C.night, .35), robeD = mixc(robe, C.ink, .35);
    // o.rock: a high outcrop under the throne and the servant (opaque: a paper underlay, then the stone washes)
    if (o.rock) {
      const R = P([[-200, 14], [-170, -2], [-120, -10], [-70, -2], [-20, -8], [40, -4], [90, -12], [130, 0], [165, 30], [190, 70], [215, 140], [250, 260], [-250, 260], [-235, 170], [-225, 80]]);
      S.push(washShape(R, C.paper, 1, 1, 0));
      S.push(washShape(R, mixc(C.stone, C.stoneDark, .35), .9, 3, 3 * u));
      S.push(washShape(P([[40, -4], [130, -2], [180, 20], [230, 120], [260, 260], [60, 260], [80, 100]]), C.stoneDark, .45, 3, 3 * u));
      S.push(washShape(P([[-240, 140], [-100, 120], [40, 160], [200, 150], [260, 260], [-250, 260]]), mixc(C.stoneDark, C.ink, .2), .35, 2, 4 * u));
      for (let i = 0; i < 12; i++) { const x = rnd(-200, 200), y = rnd(10, 230); S.push(mk(qcurve(x * u, y * u, (x + rnd(30, 90)) * u, (y + rnd(-10, 20)) * u, rnd(-8, 8) * u, 8), rnd(4, 9) * u, mixc(C.stoneDark, C.ink, .3), { prof: 'leaf', nb: 5, a: rnd(.15, .32), rough: .6 })); }
      S.push(...inkLine(R.slice(0, 12), 2 * u, ink, { step: 2, a: .55 }));
      for (let i = 0; i < 5; i++) { const x = rnd(-180, 180); S.push(mk(qcurve(x * u, rnd(10, 40) * u, (x + rnd(-20, 20)) * u, rnd(120, 220) * u, rnd(-10, 10) * u, 8), rnd(1.2, 2) * u, mixc(C.stoneDark, C.ink, .5), { prof: 'tip', nb: 0, a: .4 })); }
    }
    // parasol bearer behind, a parasol over the king
    if (o.parasol !== false) {
      const B = WC.G.person(sc * .95, { pose: 'stand', dress: 'robe', face: 'right', beard: true, cols: { cloth: 'clothC', clothB: 'stoneDark' } }).S;
      shiftS(B, -70 * u, 0); S.push(...B);
      S.push(mk(P([[-48, -120], [-34, -270]]), 2.6 * u, wood, { prof: 'even', nb: 0, a: .95 }));
      const can = P([[-118, -246], [-90, -272], [-34, -284], [22, -276], [54, -250], [30, -252], [-34, -258], [-96, -248]]);
      S.push(washShape(can, mixc(C.gold, C.cloth, .25), .9, 3, 1));
      for (let k = -3; k <= 3; k++) S.push(mk(P([[-34, -282], [-34 + k * 26, -250]]), 1.2 * u, mixc(C.cloth, C.ink, .3), { prof: 'even', nb: 0, a: .45 }));
      for (let x = -112; x <= 50; x += 14) S.push(mk(P([[x, -250], [x + 1, -238]]), 2.4 * u, C.red, { prof: 'tip', nb: 0, a: .8 }));
      S.push(...inkLine(can.slice(0, 6), 1.2 * u, ink, { step: 2, a: .6 }));
    }
    // throne: high back, seat, lion legs, footstool
    S.push(washShape(P([[-48, -64], [-52, -196], [-36, -204], [-30, -64]]), wood, .9, 3, .6));
    S.push(mk(P([[-50, -200], [-46, -214]]), 6 * u, gold, { prof: 'tip', nb: 0, a: .9 }));
    S.push(washShape(P([[-50, -70], [44, -70], [44, -58], [-50, -58]]), gold, .92, 2, .4));
    for (const x of [-42, 34]) {
      S.push(washShape(P([[x - 6, -58], [x + 6, -58], [x + 5, -14], [x + 12, -6], [x + 12, 0], [x - 8, 0], [x - 6, -14]]), gold, .9, 2, .3));
      for (let k = 0; k < 3; k++) S.push(mk(P([[x - 4 + k * 6, -3], [x - 3 + k * 6, 1]]), 1.6 * u, ink, { prof: 'even', nb: 0, a: .6 }));
    }
    S.push(...inkLine(P([[-52, -196], [-48, -64], [44, -64], [44, -58]]), 1.3 * u, ink, { step: 1, a: .55 }));
    for (let i = 0; i < 4; i++) S.push(mk(P([[-48 + rnd(-2, 2), -70], [-50 + rnd(-2, 2), -190]]), rnd(3, 6) * u, mixc(wood, C.ink, .3), { prof: 'leaf', nb: 4, a: .3, rough: .5 }));
    S.push(washShape(P([[50, -22], [98, -22], [96, -10], [52, -10]]), gold, .9, 2, .3));
    S.push(mk(P([[54, -10], [54, 0]]), 3 * u, gold, { prof: 'even', nb: 0 })); S.push(mk(P([[92, -10], [92, 0]]), 3 * u, gold, { prof: 'even', nb: 0 }));
    // the king: robe from the shoulders over the lap and down to the feet
    const body = P([[-30, -66], [-34, -120], [-24, -150], [-4, -156], [10, -144], [14, -118], [8, -84], [52, -78], [64, -60], [72, -22], [86, -24], [92, -26], [92, -22], [58, -20], [44, -58], [-30, -58]]);
    S.push(washShape(body, mixc(robe, C.paperLight, .2), .6, 2, 1.2 * u));
    S.push(washShape(body.map(([x, y]) => [x + rnd(-2, 2) * u, y + rnd(-2, 2) * u]), robe, .75, 3, 1));
    S.push(washShape(P([[4, -84], [52, -78], [64, -60], [72, -22], [58, -20], [44, -58], [8, -66]]), robeD, .4, 2, .5));
    S.push(mk(P([[58, -22], [74, -22]]), 4 * u, gold, { prof: 'even', nb: 0, a: .85 }));
    S.push(...inkLine(body.concat([body[0]]), 3.4 * u, robeD, { step: 2, a: .45, nb: 3 }));
    S.push(...inkLine(body.slice(0, 13), 1.2 * u, ink, { step: 2, a: .45 }));
    // the arm forward, holding the sceptre upright
    S.push(washShape(P([[-10, -142], [2, -146], [16, -118], [38, -110], [38, -99], [10, -104], [-4, -128]]), robe, .85, 3, .6));
    S.push(...inkLine(P([[10, -104], [38, -99]]), 1.4 * u, robeD, { step: 1, a: .5 }));
    S.push(washShape(circ(40 * u, -105 * u, 5.5 * u, 5 * u, 10), C.skin, .9, 1, 0));
    S.push(mk(P([[44, -40], [40, -176]]), 3.4 * u, gold, { prof: 'even', nb: 0, a: .95 }));
    S.push(washShape(circ(40 * u, -180 * u, 6 * u, 6 * u, 10), gold, .95, 1, 0));
    // head: face, hair, a curled beard in rows of dabs, the tall fluted crown widening upward (kidaris)
    S.push(washShape(P([[-6, -160], [-2, -178], [10, -184], [20, -176], [22, -166], [18, -158], [6, -154]]), C.skin, .9, 3, .4));
    S.push(washShape(P([[8, -170], [20, -174], [22, -164], [12, -160]]), mixc(C.skin, C.wood, .35), .35, 2, .3));
    const hairC = mixc(C.ink, C.wood, .3);
    S.push(washShape(P([[-12, -178], [-16, -158], [-10, -146], [0, -148], [-2, -172]]), hairC, .7, 3, .5));
    S.push(washShape(P([[2, -160], [21, -162], [22, -146], [18, -134], [8, -128], [0, -134], [-2, -148]]), hairC, .55, 3, .6));
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) S.push(washShape(circ((3 + k * 5 + (r % 2) * 2) * u, (-156 + r * 6.5) * u, 2.6 * u, 2.4 * u, 8), mixc(hairC, C.ink, .3), .55, 2, .2 * u));
    for (let k = 0; k < 3; k++) S.push(washShape(circ((-12 + k * 2) * u, (-170 + k * 8) * u, 3 * u, 3 * u, 8), mixc(hairC, C.ink, .3), .5, 2, .2 * u));
    S.push(washShape(circ(15 * u, -172 * u, 1.6 * u, 1.2 * u, 8), ink, .85, 1, 0));
    const crown = P([[-8, -180], [-12, -214], [-6, -219], [8, -221], [20, -217], [22, -212], [19, -180]]);
    S.push(washShape(crown, gold, .8, 3, .6 * u));
    S.push(washShape(P([[6, -181], [8, -219], [20, -217], [22, -212], [19, -181]]), mixc(gold, C.wood, .45), .4, 2, .4 * u));
    S.push(washShape(P([[-8, -183], [19, -183], [19, -178], [-8, -178]]), mixc(gold, C.red, .3), .6, 2, .3 * u));
    for (let k = 0; k < 5; k++) S.push(mk(P([[-6 + k * 6, -184], [-9 + k * 7, -216]]), 2 * u, mixc(gold, C.wood, .5), { prof: 'leaf', nb: 3, a: .35, rough: .5 }));
    for (let k = 0; k < 6; k++) S.push(washShape(circ((-9 + k * 5.6) * u, (-220 + Math.abs(k - 2.5) * .6) * u, 2.6 * u, 3.4 * u, 8), gold, .7, 2, .2 * u));
    S.push(...inkLine(crown.concat([crown[0]]), 1.6 * u, mixc(gold, C.ink, .55), { step: 2, a: .5 }));
    // watercolour finish: soft blooms in the robe, dry brush on the canopy and the throne, pooled dark edges
    for (let i = 0; i < 4; i++) S.push(washShape(WC.blobPts(rnd(-20, 40) * u, rnd(-140, -50) * u, rnd(12, 22) * u, rnd(10, 18) * u, 18, .3), robeD, .2, 2, 1));
    if (o.parasol !== false) for (let i = 0; i < 6; i++) { const x = rnd(-110, 20); S.push(mk(qcurve(x * u, (-262 + rnd(-6, 6)) * u, (x + rnd(30, 60)) * u, (-258 + rnd(-6, 6)) * u, 2 * u, 8), rnd(3, 6) * u, mixc(C.gold, C.wood, .4), { prof: 'leaf', nb: 4, a: rnd(.18, .32), rough: .6 })); }
    for (let i = 0; i < 4; i++) { const x = rnd(-46, 40); S.push(mk(qcurve(x * u, -66 * u, (x + rnd(-4, 4)) * u, -4 * u, 2 * u, 8), rnd(3, 5) * u, mixc(gold, C.wood, .5), { prof: 'leaf', nb: 4, a: rnd(.15, .3), rough: .6 })); }
    S.push(...inkLine(P([[-30, -66], [-34, -120], [-24, -150]]), 3 * u, robeD, { step: 1, a: .35 }));
    return { S, top: [0, -284 * u], parts: { head: [8 * u, -166 * u], crown: [5 * u, -210 * u], hand: [40 * u, -105 * u], throne: [-40 * u, -120 * u], parasol: [-34 * u, -270 * u], center: [0, -130 * u] } };
  };

  // ------------------------------------------------------------------ wc_salamis_night
  SHOTS.wc_salamis_night = {
    kind: '2d',
    build(ctx) {
      const P = ctx.P, s = WC.scene(ctx), { W, H } = ctx, gy = s.gy, b = s.back.getContext('2d');
      const veil = P.veil ?? .55;
      // glaze the water (sea or the sea side of a coast) with the night pigment
      WC.withSeed(ctx.seed * 31 + 5, () => {
        b.save();
        if (P.land === 'coast') {
          const right = P.coast !== 'left';
          b.beginPath();
          for (let y = gy; y <= H + 20; y += 20) { const k = (y - gy) / (H - gy), x = W * (.6 - .22 * k); b.lineTo(right ? x : W - x, y); }
          if (right) { b.lineTo(W + 20, H + 20); b.lineTo(W + 20, gy); } else { b.lineTo(-20, H + 20); b.lineTo(-20, gy); }
          b.closePath(); b.clip();
        }
        const g = b.createLinearGradient(0, gy, 0, H);
        g.addColorStop(0, WC.rgba(C.night, veil * .75)); g.addColorStop(1, WC.rgba(mixc(C.night, C.ink, .3), veil));
        b.fillStyle = g; b.fillRect(-20, gy, W + 40, H - gy + 20);
        b.restore();
        // the land on a coast goes dark too, softer
        if (P.land === 'coast') {
          const g2 = b.createLinearGradient(0, gy - 200, 0, H);
          g2.addColorStop(0, WC.rgba(C.night, veil * .35)); g2.addColorStop(1, WC.rgba(C.night, veil * .6));
          b.fillStyle = g2; b.fillRect(-20, gy - 200, W + 40, H - gy + 220);
        }
        // P.sky_veil: a deeper night glaze over the sky (darker at the top), keeping the moon's halo readable
        if (P.sky_veil) {
          const g3 = b.createLinearGradient(0, 0, 0, gy);
          g3.addColorStop(0, WC.rgba(mixc(C.night, C.ink, .35), P.sky_veil)); g3.addColorStop(1, WC.rgba(C.night, P.sky_veil * .45));
          b.fillStyle = g3; b.fillRect(-20, -20, W + 40, gy + 22);
          if (P.sun) { const mx = P.sun.x * W, my = (P.sun.y ?? .16) * gy, r = P.sun.r || 50; const hg = b.createRadialGradient(mx, my, r * .9, mx, my, r * 3); hg.addColorStop(0, WC.rgba(C.paperLight, .3)); hg.addColorStop(1, WC.rgba(C.paperLight, 0)); b.fillStyle = hg; b.fillRect(mx - r * 3, my - r * 3, r * 6, r * 6); b.save(); b.beginPath(); b.arc(mx, my, r, 0, 7); b.fillStyle = WC.rgba(C.paperLight, .85); b.fill(); b.restore(); }
        }
        // a dark far shore (an island ridge) on the horizon: P.ridge = {x0, x1 (0..1), amp (px)}
        if (P.ridge) {
          const R = P.ridge, x0 = (R.x0 ?? 0) * W, x1 = (R.x1 ?? .7) * W, amp = R.amp ?? 90, pts = [];
          for (let x = x0; x <= x1; x += 10) { const e = Math.min(1, (x - x0) / 160, (x1 - x) / 160); pts.push([x, gy + 2 + WC.ridge(x, amp, 520, 7) * e]); }
          pts.push([x1, gy + 4], [x0, gy + 4]);
          WC.wash(b, pts, mixc(C.night, C.ink, .3), .8, 3, 2);
          WC.wash(b, pts.map(([x, y]) => [x, y + (gy - y) * .4]), mixc(C.night, C.ink, .5), .5, 2, 2);
        }
        // a moon path on the water
        if (P.path !== false) {
          const px = (P.path ?? .3) * W;
          for (let i = 0; i < 26; i++) {
            const y = gy + 8 + Math.pow(i / 26, 1.3) * (H - gy) * .7, w = 30 + i * 9 + rnd(-10, 10);
            WC.drawS(b, mk(qcurve(px - w / 2 + rnd(-20, 20), y, px + w / 2 + rnd(-20, 20), y + rnd(-2, 2), rnd(-3, 3), 6), 3 + i * .15, C.paperLight, { prof: 'leaf', nb: 0, a: .4 - i * .012 }));
          }
        }
      });
      return { update: (lt, dur, cues) => s.update(lt, dur, cues || {}) };
    },
  };
  // ------------------------------------------------------------------ wc_salamis_message
  // the spoken message as a note on a centred, aged sheet: two big hand-written lines, a small italic line under them
  // saying where it comes from. params: {lines: [..], sub, at (s | cue: when the writing starts, .3), y (centre 0..1, .34)}
  SHOTS.wc_salamis_message = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), cx = W / 2, cy = (P.y ?? .34) * H;
      const sw = Math.min(900, W * .84), sh = 560, x0 = cx - sw / 2, y0 = cy - sh / 2;
      const S = WC.withSeed(seed * 53 + 3, () => {
        const L = [], edge = [], st = 30;
        for (let x = 0; x <= sw; x += st) edge.push([x0 + x, y0 + rnd(-4, 4)]);
        for (let y = st; y <= sh; y += st) edge.push([x0 + sw + rnd(-4, 4), y0 + y]);
        for (let x = sw - st; x >= 0; x -= st) edge.push([x0 + x, y0 + sh + rnd(-4, 4)]);
        for (let y = sh - st; y > 0; y -= st) edge.push([x0 + rnd(-4, 4), y0 + y]);
        L.push(washShape(edge.map(([x, y]) => [x + 12, y + 16]), mixc(C.ink, C.paperDark, .6), .14, 3, 6));
        L.push(washShape(edge, mixc(C.paperLight, C.stain, .22), .92, 3, 3));
        L.push(...inkLine(edge.concat([edge[0]]), 8, mixc(C.stain, C.wood, .3), { step: 3, a: .28 }));
        for (let i = 0; i < 6; i++) { const r = rnd(40, 110); L.push(washShape(WC.blobPts(rnd(x0 + r, x0 + sw - r), rnd(y0 + r * .7, y0 + sh - r * .7), r, r * rnd(.5, .8), 22, .3), C.stain, rnd(.05, .11), 2, 3)); }
        for (let i = 0; i < 10; i++) { const y = rnd(y0 + 20, y0 + sh - 20), xa = rnd(x0, x0 + sw - 200); L.push(mk(qcurve(xa, y, xa + rnd(120, 300), y + rnd(-3, 3), 0, 10), rnd(6, 12), C.stain, { prof: 'leaf', nb: 6, a: rnd(.08, .16), rough: .6 })); }
        return L;
      });
      const lines = P.lines || [];
      return {
        update(lt, dur, cues) {
          X.clear();
          const pp = WC.paper(); if (pp) X.drawImage(pp, 0, 0); else { X.fillStyle = C.paper; X.fillRect(0, 0, W, H); }
          X.save(); X.translate(cx, cy); X.rotate(-.012 + .004 * Math.sin(lt * .5)); X.translate(-cx, -cy);
          WC.drawList(X, S, WC.eio(WC.seg(lt, 0, .7)));
          const t0 = WC.timeOf(P.at, cues || {}, .3), per = Math.max(.6, Math.min(1.1, (dur - t0 - .6) / (lines.length + .6)));
          lines.forEach((ln, i) => WC.hand(X, ln, cx, y0 + 190 + i * 130, WC.seg(lt, t0 + i * per, t0 + (i + 1) * per), { size: 100, align: 'center', col: i === 0 ? C.ink : C.red }));
          if (P.sub) WC.hand(X, P.sub, cx, y0 + sh - 70, WC.seg(lt, t0 + .3, t0 + 1.2), { size: 44, align: 'center', col: C.inkSoft });
          X.restore();
        },
      };
    },
  };
})();
