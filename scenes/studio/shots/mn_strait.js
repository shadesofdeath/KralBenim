// mn_strait: the Battle of Myeongnyang (1597): Joseon panokseon warships vs a Japanese fleet in a narrow tidal
// strait, parchment ink style (theme "parchment", brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via _ink.js;
// pure function of (seed, lt), no Math.random, palette tokens only). Written for
// videos/2026-11-14/ag-02-myeongnyang-13-ships; parametric for any oared East Asian sea battle, strait, tide or letter.
// Needs mcB__lib.js (MCB.cast for Kaşif, MCB.labels).
//
// Ships: kind "joseon" = panokseon (flat hull, walled upper deck with gun ports, roofed command pavilion, two battened
//   sails, oars, blue pennant; flag: "yi" = bigger command flag) · kind "japan" = sekibune/atakebune (slim pointed hull,
//   plank-shield box with loopholes, big: turret on top, one paneled square sail, tall narrow red banners) ·
//   lite: true = simplified far silhouette.
//
// SHOTS.mn_sea — side view of a sea / strait: far fleet wall, a diagonal line of ships, single ships that bob, burn,
//   drift with the current, collide (splinters) and sink (clipped at the waterline), tide streaks that reverse on a cue,
//   whirlpools, cliffs on the sides, a rocky headland for the cast, a near wave band to the frame bottom.
//   P: {water: 0.44 (top of the drawn sea, 0..1 H), front: 0.66 (top of the near wave band),
//       wall: {kind: "japan", rows: [40, 45, 48] (ships per row, far first), y0: 0.445, dy: 0.022, s0: 0.11, ds: 0.05,
//              x0: -0.05, x1: 1.05, face: 1, adv: 0 (px/s forward drift)} | false,
//       line: {kind: "joseon", n: 13, from: [x, y, s], to: [x, y, s], face: -1, flag0: "yi"} | false,
//       ships: [{kind, x, y (waterline 0..1 H), s: 0.5, face: 1, big, flag, lite, soft, roll: 1,
//                burn: cue|s, sink: cue|s (sinks over 2.2 s), drift: {at: cue|s, dx: -0.2 (0..1 W), rot: -10, dur: 2.2},
//                spin: {at, x, y (whirl centre 0..1), dur: 3} (circles into a whirlpool and goes under)}],
//       crash: [{x, y, at, size: 1}] (splinter burst + smoke puff), whirl: [{x, y, r: 110, at, spin: 1}],
//       tide: {y0: 0.5, y1: 0.64, n: 9, dir: 1, flip: cue|s, speed: 260} | false,
//       cliffs: {left: 0.2 (edge x at the waterline), right: 0.82, top: 0.3} | false,
//       head: {side: "left", top: 0.6 (ground y), edge: 0.46 (x where the headland drops)} | false,
//       glow: true (night: fires light up gold), cast: [MCB cast], labels: [MCB labels],
//       counter: {x, y, to, at, dur: 1.2, prefix, suffix, size: 200, color: "red"}}
//   cues: names used by the params (burn, sink, flip, at ...).
//
// SHOTS.mn_deck — Joseon figures (stick cast, no hat for Kaşif rules: they wear period headgear drawn here):
//   jeonrip = officer's wide-brimmed felt hat with a red tassel, soldier = small-brimmed felt hat, band = headband.
//   mode "march": a column of soldiers with spears walks along a dirt road (one of them is P.yi), road foreground.
//   mode "deck": one figure big behind the battlement wall of a panokseon, the open sea behind (optional far ships and a
//   whirlpool swallowing a ship), command flag in hand.
//   P: {mode, ground: 0.6, figs: [{x, y, s: 0.75, hat: "soldier"|"jeonrip"|"band", beard, pose: "walk", face: 1,
//       speed: 70 (px/s, walk), spear: true, flag: true, seq: [{at, pose, dir, face, emotion}], emotion, dir}],
//       ships: [mn_sea ships], whirl: [...], rail: 0.66 (deck mode: top of the wall), labels, cast}
//
// SHOTS.mn_letter — a low writing table under a lamp: mode "order": a royal scroll unrolls (rods), its text writes
//   itself, a red square seal stamps on cue `seal`. mode "reply": a sheet of paper, a sleeve + hand with a brush that
//   writes the lines stroke by stroke (the brush tip follows the writing), an ink stone, a flickering oil lamp.
//   P: {mode, lines: ["FIGHT ON", "LAND"], red: [1] (indices of lines in red), size: 120, at: 0.2 (start writing),
//       dur: 1.8 (writing time), seal: cue|s, table: 0.6 (y of the table's back edge), labels}
//
// SHOTS.mn_map — full-frame old chart of a narrow strait (use "set": false): two coasts, a channel that narrows to a
//   neck, tide streamlines flowing through it (they speed up in the neck), whirlpools, a line of blue ship marks
//   blocking one end, a red mass of ship marks pouring in from the other, compass rose, width marks at the neck.
//   P: {neck: [0.55, 0.42], a: [0.92, 0.66] (mouth where the red fleet enters), b: [0.18, 0.2] (mouth the blue line
//       blocks), wide: 320, narrow: 70, red: 40, blue: 13, enter: cue|s, flow: 1, width_at: cue|s, cast, labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const circ = (cx, cy, r, n = 12, ry) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * TAU) * r, cy + Math.sin(i / n * TAU) * (ry ?? r)]);
  let CLIPN = 0;

  // one <path> per colour, filled in painter's order
  const LAYERS = ['wash', 'dark', 'rock', 'stain', 'light', 'soft', 'red', 'blue', 'green', 'gold', 'ink', 'top'];
  function layerSet(parent, extra = {}) {
    const C = { wash: INK.paperDark, dark: INK.paperDark, rock: INK.inkSoft, stain: INK.stain, light: INK.paperLight, soft: INK.inkSoft, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, ink: INK.ink, top: INK.paperLight };
    const g = el(parent, 'g'), E = {}, B = {};
    LAYERS.forEach(k => { E[k] = inkEl(g, C[k], extra[k] || (k === 'wash' ? { 'fill-opacity': 0.5 } : k === 'rock' ? { 'fill-opacity': 0.6 } : k === 'stain' ? { 'fill-opacity': 0.55 } : {})); B[k] = ''; });
    return { g, add(k, d) { if (d) B[k] += d + ' '; }, flush() { LAYERS.forEach(k => { E[k].setAttribute('d', B[k]); B[k] = ''; }); } };
  }

  // ---------------------------------------------------------------- ships
  // o: {x, y (waterline px), s, face, roll (deg), soft, lite, flag, big, oar (phase)}
  function frame(o) {
    const s = o.s ?? 0.5, f = o.face ?? 1, rot = (o.roll ?? 0) * Math.PI / 180, cr = Math.cos(rot), sr = Math.sin(rot);
    const Q = (u, v) => { u *= f; return [o.x + (u * cr - v * sr) * s, o.y + (u * sr + v * cr) * s]; };
    return { s, f, Q, QQ: a => a.map(p => Q(p[0], p[1])), w: k => Math.max(2.2, k * Math.min(1.3, s * 1.6 + 0.2)) };
  }
  function drawJoseon(L, sd, t, o) {
    const { Q, QQ, w, s } = frame(o), ink = o.soft ? 'soft' : 'ink', lite = !!o.lite;
    const A = { amp: lite ? 0.8 : 1.2, t };
    // oars (behind the hull)
    if (!lite) for (let k = 0; k < 7; k++) {
      const u = -170 + k * 52, ph = Math.sin(t * 3.2 + k * 0.5 + (o.oar ?? 0)) * 18;
      L.add('soft', inkPath(QQ([[u, -50], [u - 30 + ph, 40]]), { seed: sd + 300 + k, t, w: w(4), amp: 0.8 }));
    }
    // hull: flat bottom, raised bow and stern
    const hull = QQ([[-262, -88], [-210, -64], [0, -58], [200, -64], [270, -96], [262, -52], [214, 6], [-200, 10], [-250, -36]]);
    L.add('dark', inkLoop(hull, Object.assign({ seed: sd + 1, smooth: false }, A)));
    L.add(ink, inkPath(hull, Object.assign({ seed: sd + 1, w: w(6), closed: true, smooth: false }, A)));
    if (!lite) [[-30], [-12]].forEach(([v], i) => L.add('soft', inkPath(QQ([[-236, v - 6], [0, v], [236, v - 8]]), { seed: sd + 5 + i, t, w: w(3) })));
    // walled upper deck (the panokseon's second storey) with gun ports
    const box = QQ([[-222, -58], [-226, -150], [222, -150], [218, -58]]);
    L.add('light', inkLoop(box, Object.assign({ seed: sd + 10, smooth: false }, A)));
    L.add(ink, inkPath(box, Object.assign({ seed: sd + 10, w: w(5), closed: true, smooth: false }, A)));
    L.add(ink, inkPath(QQ([[-232, -150], [232, -152]]), { seed: sd + 11, t, w: w(7) }));
    if (!lite) {
      for (let k = 0; k < 8; k++) { const u = -180 + k * 52; L.add(ink, inkLoop(QQ([[u - 11, -112], [u + 11, -112], [u + 11, -92], [u - 11, -92]]), { seed: sd + 20 + k, t, amp: 0.6, smooth: false })); }
      for (let k = 0; k < 9; k++) { const u = -200 + k * 50; L.add('soft', inkPath(QQ([[u, -146], [u + 1, -128]]), { seed: sd + 40 + k, t, w: w(2.5), amp: 0.6 })); }
    }
    // command pavilion with an up-curved roof
    const px0 = -40, px1 = 70;
    [px0 + 6, px1 - 6].forEach((u, i) => L.add(ink, inkPath(QQ([[u, -150], [u, -212]]), { seed: sd + 50 + i, t, w: w(5) })));
    const roof = QQ([[px0 - 46, -206], [px0 - 20, -216], [(px0 + px1) / 2, -252], [px1 + 20, -216], [px1 + 46, -206], [px1 + 30, -222], [(px0 + px1) / 2, -266], [px0 - 30, -222]]);
    L.add('dark', inkLoop(roof, Object.assign({ seed: sd + 55 }, A)));
    L.add(ink, inkPath(roof, Object.assign({ seed: sd + 55, w: w(5), closed: true }, A)));
    // two masts with battened sails
    [[-140, 430, 1], [150, 380, 0.85]].forEach(([u, h, k], m) => {
      L.add(ink, inkPath(QQ([[u, -150], [u + 3, -150 - h]]), { seed: sd + 60 + m, t, w: w(6) }));
      const hw = 86 * k, top = -150 - h + 30, bot = -150 - h * 0.42, bil = Math.sin(t * 1.1 + sd + m) * 5;
      const sl = QQ([[u - hw * 0.8, top], [u + hw * 0.8, top + 6], [u + hw + 6 + bil, bot], [u - hw + bil, bot - 4]]);
      L.add('dark', inkLoop(sl, Object.assign({ seed: sd + 65 + m, smooth: false }, A)));
      L.add(ink, inkPath(sl, Object.assign({ seed: sd + 65 + m, w: w(4), closed: true, smooth: false }, A)));
      if (!lite) for (let b = 1; b < 5; b++) { const v = lerp(top, bot, b / 5), e = lerp(0.8, 1, b / 5); L.add(ink, inkPath(QQ([[u - hw * e + 4, v], [u + hw * e + 4, v + 2]]), { seed: sd + 70 + m * 8 + b, t, w: w(3) })); }
    });
    // pennant / command flag at the stern
    const fl = (o.flag === 'yi' ? 1.8 : 1) * (o.pen ?? 1), wv = Math.sin(t * 3 + sd) * 7;
    const fp = QQ([[-246, -96], [-250, -96 - 230 * fl]]);
    L.add(ink, inkPath(fp, { seed: sd + 90, t, w: w(4) }));
    const fy = -96 - 230 * fl;
    const flag = QQ([[-250, fy], [-250 - 110 * fl, fy + 14 + wv], [-250 - 104 * fl, fy + 70 * fl + wv], [-250, fy + 64 * fl]]);
    L.add('blue', inkLoop(flag, { seed: sd + 91, t, amp: 0.8, smooth: false }));
    if (o.flag === 'yi') L.add('red', inkPath(QQ([[-262, fy + 30 * fl], [-250 - 88 * fl, fy + 42 * fl + wv]]), { seed: sd + 92, t, w: w(9) }));
    L.add(ink, inkPath(flag, { seed: sd + 91, t, w: w(3.5), closed: true, amp: 0.8, smooth: false }));
    return { deck: Q(0, -150), top: Q(-140, -560), bow: Q(270, -96), stern: Q(-262, -88) };
  }
  function drawJapan(L, sd, t, o) {
    const { Q, QQ, w } = frame(o), ink = o.soft ? 'soft' : 'ink', lite = !!o.lite;
    const A = { amp: lite ? 0.7 : 1.2, t };
    if (!lite) for (let k = 0; k < 8; k++) {
      const u = -190 + k * 50, ph = Math.sin(t * 3.6 + k * 0.6 + (o.oar ?? 0)) * 16;
      L.add('soft', inkPath(QQ([[u, -40], [u - 28 + ph, 34]]), { seed: sd + 300 + k, t, w: w(3.5), amp: 0.8 }));
    }
    // slim hull with a pointed bow
    const hull = lite ? QQ([[-270, -48], [300, -62], [220, 6], [-236, 6]])
                      : QQ([[-274, -50], [-140, -42], [150, -42], [312, -74], [290, -34], [226, 6], [-232, 8], [-270, -20]]);
    L.add(o.heavy ? 'rock' : 'dark', inkLoop(hull, Object.assign({ seed: sd + 1, smooth: false }, A)));
    L.add(ink, inkPath(hull, Object.assign({ seed: sd + 1, w: w(6), closed: true, smooth: false }, A)));
    // plank-shield box with loopholes
    const box = QQ([[-236, -44], [-238, -128], [206, -128], [210, -44]]);
    L.add('light', inkLoop(box, Object.assign({ seed: sd + 10, smooth: false }, A)));
    L.add(ink, inkPath(box, Object.assign({ seed: sd + 10, w: w(5), closed: true, smooth: false }, A)));
    if (!lite) {
      for (let k = 0; k < 14; k++) { const u = -210 + k * 30; L.add('soft', inkPath(QQ([[u, -124], [u + 1, -48]]), { seed: sd + 20 + k, t, w: w(2.5), amp: 0.6 })); }
      for (let k = 0; k < 7; k++) { const u = -190 + k * 62; L.add(ink, inkDot(...Q(u, -96), 5 * o.s + 1.5, 5 * o.s + 1.5, sd + 40 + k, t)); }
    }
    // turret (atakebune)
    if (o.big && !lite) {
      const tw = QQ([[-90, -128], [-86, -206], [70, -206], [74, -128]]);
      L.add('light', inkLoop(tw, Object.assign({ seed: sd + 45, smooth: false }, A)));
      L.add(ink, inkPath(tw, Object.assign({ seed: sd + 45, w: w(5), closed: true, smooth: false }, A)));
      const rf = QQ([[-120, -200], [-8, -246], [104, -200], [84, -214], [-8, -232], [-100, -214]]);
      L.add('dark', inkLoop(rf, Object.assign({ seed: sd + 46 }, A)));
      L.add(ink, inkPath(rf, Object.assign({ seed: sd + 46, w: w(5), closed: true }, A)));
    }
    // one mast, paneled square sail
    const mu = 40, mh = o.big ? 420 : 360;
    L.add(ink, inkPath(QQ([[mu, -128], [mu + 3, -128 - mh]]), { seed: sd + 50, t, w: w(6) }));
    const top = -128 - mh + 20, bot = o.big ? -222 : -168, hw = 92, bil = Math.sin(t * 1.2 + sd) * 6;
    const sl = QQ([[mu - hw, top], [mu + hw, top], [mu + hw + 4 + bil, bot], [mu - hw + 2 + bil, bot]]);
    L.add('light', inkLoop(sl, Object.assign({ seed: sd + 55, smooth: false }, A)));
    L.add(ink, inkPath(QQ([[mu - hw - 14, top], [mu + hw + 14, top]]), { seed: sd + 54, t, w: w(6) }));
    L.add(ink, inkPath(sl, Object.assign({ seed: sd + 55, w: w(4), closed: true, smooth: false }, A)));
    if (!lite) for (let b = 1; b < 5; b++) { const u = mu - hw + b * hw * 2 / 5; L.add('soft', inkPath(QQ([[u, top + 4], [u + bil * 0.6, bot - 4]]), { seed: sd + 60 + b, t, w: w(3) })); }
    // tall narrow banners at the stern
    const nb = lite ? 1 : 3;
    for (let k = 0; k < nb; k++) {
      const u = -226 + k * 34, h = 250 + k * 14, wv = Math.sin(t * 2.6 + k + sd) * 5;
      L.add(ink, inkPath(QQ([[u, -128], [u + 2, -128 - h]]), { seed: sd + 70 + k, t, w: w(3.5) }));
      L.add(ink, inkPath(QQ([[u - 2, -128 - h + 4], [u - 34, -128 - h + 6]]), { seed: sd + 74 + k, t, w: w(3) }));
      const bn = QQ([[u - 2, -128 - h + 8], [u - 32 + wv, -128 - h + 10], [u - 30 + wv, -150], [u - 2, -150]]);
      L.add('red', inkLoop(bn, { seed: sd + 78 + k, t, amp: 0.7, smooth: false }));
    }
    return { deck: Q(0, -128), top: Q(mu, -128 - mh), bow: Q(312, -74), stern: Q(-274, -50) };
  }
  const drawShip = (L, sd, t, o) => (o.kind === 'japan' ? drawJapan : drawJoseon)(L, sd, t, o);

  // fire on a deck (flames gold + red, smoke soft); k = size px, p = 0..1 growth
  function drawFire(L, sd, t, x, y, k, p, glow) {
    if (p <= 0.01) return;
    if (glow) L.add('stain', inkLoop(circ(x, y - k * 0.3, k * 1.25 * p, 14, k * 0.8 * p), { seed: sd, t, amp: 3 }));
    for (let j = 0; j < 5; j++) {
      const ph = (t * 1.6 + j * 0.37) % 1, fx = x + (j - 2) * k * 0.22, hh = k * (0.9 + 0.5 * Math.sin(t * 7 + j * 2)) * p;
      const fl = [[fx - k * 0.16, y], [fx - k * 0.08, y - hh * 0.5], [fx + Math.sin(t * 9 + j) * k * 0.08, y - hh], [fx + k * 0.1, y - hh * 0.45], [fx + k * 0.16, y]];
      L.add(j % 2 ? 'red' : 'gold', inkLoop(fl, { seed: sd + 10 + j, t, amp: 2 }));
      const sy = y - hh - ph * k * 2.4, sr = k * (0.25 + ph * 0.6) * p;
      L.add('soft', inkPath(circ(fx + ph * k * 0.6, sy, sr, 10, sr * 0.8), { seed: sd + 20 + j, t, w: 4, closed: true, amp: 2 }));
    }
  }
  // splinter burst + smoke at (x, y), q = seconds since impact
  function drawCrash(L, sd, t, x, y, k, q) {
    if (q < 0 || q > 2.6) return;
    const r = rng(sd + 5);
    const fl = Math.exp(-q * 5);
    if (q < 0.25) L.add('gold', inkLoop(circ(x, y, k * (0.4 + q * 2), 12, k * (0.3 + q * 1.4)), { seed: sd, t, amp: 3 }));
    for (let j = 0; j < 12; j++) {
      const a = -Math.PI * (0.1 + r() * 0.8), v = k * (1.2 + r() * 1.6), len = k * (0.12 + r() * 0.16), sp = r() * 6;
      const px = x + Math.cos(a) * v * q, py = y + Math.sin(a) * v * q + 260 * q * q;
      const ang = sp * q + a;
      L.add('ink', inkPath([[px - Math.cos(ang) * len, py - Math.sin(ang) * len], [px + Math.cos(ang) * len, py + Math.sin(ang) * len]], { seed: sd + 10 + j, t, w: 6 }));
    }
    for (let j = 0; j < 4; j++) {
      const rr = k * (0.3 + q * 0.5) * (1 - j * 0.1), sx = x + (j - 1.5) * k * 0.3, sy = y - k * 0.3 - q * k * 0.5 * (1 + j * 0.3);
      L.add('soft', inkPath(circ(sx, sy, rr, 10, rr * 0.75), { seed: sd + 40 + j, t, w: 4, closed: true, amp: 2 }));
    }
    if (fl > 0.05) L.add('red', inkPath([[x - k * 0.5, y], [x + k * 0.5, y - 4]], { seed: sd + 60, t, w: 8 * fl }));
  }
  // whirlpool spiral (flattened by perspective), spins with t
  function drawWhirl(L, sd, t, x, y, r, p, spin = 1) {
    if (p <= 0.01) return;
    for (let arm = 0; arm < 3; arm++) {
      const pts = [];
      for (let k = 0; k <= 26; k++) {
        const u = k / 26, a = arm * TAU / 3 + u * TAU * 1.3 - t * 2.2 * spin, rr = r * p * (1 - u * 0.88);
        pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.34]);
      }
      L.add(arm ? 'soft' : 'ink', inkPath(pts, { seed: sd + arm, t, w: 5 - arm, amp: 1 }));
    }
    L.add('dark', inkLoop(circ(x, y, r * 0.2 * p, 10, r * 0.07 * p), { seed: sd + 9, t, amp: 1 }));
  }
  // near wave band from y0 to the bottom of the frame
  function drawFront(L, sd, t, W, H, y0, o = {}) {
    const pts = [];
    for (let x = -40; x <= W + 40; x += 36) pts.push([x, y0 + Math.sin(x * 0.011 + t * 1.5) * 12 + Math.sin(x * 0.027 - t * 2.1) * 6]);
    L.add('wash', inkLoop(pts.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
    L.add('ink', inkPath(pts, { seed: sd + 2, t, w: 6 }));
    const rows = 9, sp = o.dir ?? 1;
    for (let r = 0; r < rows; r++) {
      const yy = y0 + 46 + r * (H - y0) / rows, k = r / rows, n = 5 - Math.floor(k * 2);
      for (let c = 0; c < n; c++) {
        const len = 90 + k * 110, xx = (((c / n) * (W + 320) + (r % 2) * 90 + t * (24 + k * 30) * sp) % (W + 320) + W + 320) % (W + 320) - 160;
        const cu = 12 + k * 14;
        L.add(r % 3 === 2 ? 'ink' : 'soft', inkPath([[xx, yy], [xx + len * 0.35, yy - cu], [xx + len * 0.65, yy - cu * 0.6], [xx + len, yy + 4]], { seed: sd + 20 + r * 9 + c, t, w: 3.5 + k * 3 }));
      }
    }
  }
  // cliff wall from the frame edge; side -1 = left, +1 = right; edge = x at the waterline (px), top = y px
  function drawCliff(L, sd, t, W, H, side, edge, top, wl, slope = 0.16) {
    const r = rng(sd + 3), X = side < 0 ? -40 : W + 40, pts = [[X, H + 40], [X, top - 60]];
    const n = 9;
    for (let k = 0; k <= n; k++) {
      const u = k / n, y = lerp(top, wl + 60, u), x = lerp(side < 0 ? edge - W * slope : edge + W * slope, edge, Math.pow(u, 0.7)) + (r() - 0.5) * 40;
      pts.push([x, y]);
    }
    pts.push([edge + side * 30, H + 40]);
    L.add('rock', inkLoop(pts, { seed: sd + 1, t, amp: 1.2, smooth: false }));
    L.add('ink', inkPath(pts.slice(1, -1), { seed: sd + 2, t, w: 7, smooth: false }));
    for (let k = 0; k < 10; k++) {
      const u = (k + 0.5) / 10, y = lerp(top + 30, wl + 40, u), xe = lerp(side < 0 ? edge - W * slope : edge + W * slope, edge, Math.pow(u, 0.7));
      const x1 = xe - side * (30 + r() * 30), x0 = x1 - side * (60 + r() * 90);
      L.add('ink', inkPath([[x0, y], [x1, y + 20 + r() * 20]], { seed: sd + 10 + k, t, w: 4 }));
    }
    // foam where the cliff meets the water
    for (let k = 0; k < 3; k++) { const fx = edge + side * (10 + k * 26), fy = wl + 30 + Math.sin(t * 3 + k) * 6;
      L.add('top', inkLoop(circ(fx, fy, 26 - k * 5, 8, 9), { seed: sd + 30 + k, t, amp: 1.5 })); L.add('soft', inkPath(circ(fx, fy, 26 - k * 5, 8, 9), { seed: sd + 30 + k, t, w: 3, closed: true, amp: 1.5 })); }
  }
  // rocky headland the cast stands on (top = ground y px); spans from the side to `edge`
  function drawHead(L, sd, t, W, H, side, edge, top) {
    const X = side < 0 ? -40 : W + 40, r = rng(sd + 7);
    const pts = [[X, H + 40], [X, top - 6]];
    for (let k = 1; k < 6; k++) pts.push([lerp(X, edge, k / 6), top + (r() - 0.5) * 14]);
    pts.push([edge, top + 10], [edge + side * 60, top + 140], [edge + side * 40, top + 300], [edge + side * 110, H + 40]);
    L.add('dark', inkLoop(pts, { seed: sd + 1, t, amp: 1, smooth: false }));
    L.add('ink', inkPath(pts.slice(1, -1), { seed: sd + 2, t, w: 7, smooth: false }));
    for (let k = 0; k < 14; k++) { const x = lerp(X, edge, (k % 7 + 0.5) / 7.5), y = top + 60 + Math.floor(k / 7) * 160 + r() * 80;
      L.add('soft', inkPath([[x - 50, y], [x + 40, y + 18]], { seed: sd + 10 + k, t, w: 4 })); }
    // grass tufts on top
    for (let k = 0; k < 7; k++) { const x = lerp(X, edge, (k + 0.5) / 7.5), y = top + 2, sw = Math.sin(t * 1.8 + k) * 5;
      L.add('ink', inkPath([[x - 10, y], [x - 16 + sw, y - 34]], { seed: sd + 40 + k, t, w: 3.5 }));
      L.add('ink', inkPath([[x, y], [x + 4 + sw, y - 44]], { seed: sd + 50 + k, t, w: 3.5 }));
      L.add('ink', inkPath([[x + 10, y], [x + 22 + sw, y - 30]], { seed: sd + 60 + k, t, w: 3.5 })); }
  }

  // ships list (each its own clipped group so a sinking ship goes under its waterline)
  function shipSet(parent, list, W, H, sd0) {
    return (list || []).map((s, i) => {
      const g = el(parent, 'g'), id = 'mnclip' + (++CLIPN);
      const cp = el(g, 'clipPath', { id, clipPathUnits: 'userSpaceOnUse' });
      const rect = el(cp, 'rect', { x: -2000, y: -2000, width: W + 4000, height: 2000 });
      const inner = el(g, 'g', { 'clip-path': `url(#${id})` });
      return { s: Object.assign({ i }, s), L: layerSet(inner), fx: layerSet(g), rect, sd: sd0 + i * 400 };
    });
  }
  function updateShips(items, lt, t, cues, W, H, glow) {
    items.slice().sort((a, b) => (a.s.y ?? 0.56) - (b.s.y ?? 0.56)).forEach(({ s, L, fx, rect, sd }) => {
      let x = s.x * W, y = (s.y ?? 0.56) * H, roll = Math.sin(t * 0.9 + s.i) * 1.6 * (s.roll ?? 1), sc = s.s ?? 0.5;
      const bob = Math.sin(t * 1.3 + s.i * 1.7) * 4 * Math.min(1, sc * 2);
      const wl = y + 6;
      if (s.drift) {
        const a = atOr(cues, s.drift.at, 0.5), d = s.drift.dur ?? 2.2, p = progIO(lt, a, d);
        x += (s.drift.dx ?? -0.2) * W * p; roll += (s.drift.rot ?? -10) * Math.sin(Math.min(1, p) * Math.PI * 0.9);
        y += (s.drift.dy ?? 0) * H * p;
      }
      if (s.spin) {
        const a = atOr(cues, s.spin.at, 0.4), d = s.spin.dur ?? 3, p = clamp01((lt - a) / d);
        if (p > 0) {
          const cx = s.spin.x * W, cy = s.spin.y * H, r0 = Math.hypot(x - cx, (y - cy) / 0.34);
          const a0 = Math.atan2((y - cy) / 0.34, x - cx), ang = a0 + p * p * TAU * 1.2, rr = r0 * (1 - p * 0.85);
          x = cx + Math.cos(ang) * rr; y = cy + Math.sin(ang) * rr * 0.34; roll += 18 * Math.sin(ang * 1.3) * p;
          sc *= 1 - p * 0.3;
        }
      }
      let sink = 0;
      const sa = atOr(cues, s.sink, null);
      if (sa != null) sink = progIO(lt, sa, 2.2);
      if (s.spin) { const a = atOr(cues, s.spin.at, 0.4), d = s.spin.dur ?? 3; sink = Math.max(sink, progIO(lt, a + d * 0.55, d * 0.6)); }
      const yy = y + bob + sink * 520 * sc;
      roll += sink * 24 * (s.face ?? 1);
      rect.setAttribute('height', f1(2000 + y + 8 + bob * 0.5));
      const A = drawShip(L, sd, t, { kind: s.kind, x, y: yy, s: sc, face: s.face ?? 1, roll, soft: s.soft, lite: s.lite, flag: s.flag, big: s.big, oar: s.i });
      const ba = atOr(cues, s.burn, null);
      if (ba != null && lt >= ba && sink < 0.8) {
        const pf = clamp01((lt - ba) / 0.8) * (1 - sink);
        drawFire(fx, sd + 200, t, A.deck[0], A.deck[1], 150 * sc + 30, pf, glow);
        drawFire(fx, sd + 230, t, (A.deck[0] + A.stern[0]) / 2, A.deck[1] + 10, 110 * sc + 24, clamp01(pf * 1.3 - 0.3), glow);
      }
      if (sink > 0.02 && sink < 1) {
        for (let j = 0; j < 4; j++) { const ph = (t * 1.4 + j * 0.27) % 1; fx.add('soft', inkPath(circ(x + (j - 1.5) * 60 * sc, wl - ph * 90, 8 + ph * 14, 8), { seed: sd + 260 + j, t, w: 3, closed: true })); }
        fx.add('soft', inkPath(circ(x, wl, 220 * sc * (0.6 + sink * 0.5), 14, 20 + 20 * sc), { seed: sd + 270, t, w: 4, closed: true, amp: 2 }));
      }
      L.flush(); fx.flush();
    });
  }

  // big counting number
  function makeCounter(parent, o) {
    if (!o) return null;
    const g = el(parent, 'g');
    const tx = el(g, 'text', { x: 0, y: 0, 'font-family': MCB.FR, 'font-weight': 900, 'font-size': o.size ?? 200, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: MCB.COL[o.color || 'red'] || INK.red, stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' });
    return {
      update(lt, t, cues, W, H) {
        const a = atOr(cues, o.at, 0.3);
        if (lt < a) { g.style.display = 'none'; return; }
        g.style.display = '';
        const p = prog(lt, a, o.dur ?? 1.2), v = Math.round((o.from ?? 0) + ((o.to ?? 0) - (o.from ?? 0)) * p);
        tx.textContent = (o.prefix || '') + v + (o.suffix || '');
        const b = boil(77, t, 1.2), sp = spring(lt, a, 0.5), pk = punch(lt, a + (o.dur ?? 1.2), 0.6);
        g.setAttribute('transform', `translate(${f1(o.x * W + b[0])} ${f1(o.y * H + b[1])}) rotate(${o.rot ?? -4}) scale(${(Math.max(0.01, sp) * (1 + 0.1 * pk)).toFixed(3)})`);
      },
    };
  }

  // ---------------------------------------------------------------- mn_sea
  SH.mn_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000 + 31;
      const root = el(svg, 'g');
      const back = layerSet(root), wallL = layerSet(root), lineL = layerSet(root), mid = layerSet(root);
      const shipsG = el(root, 'g');
      const items = shipSet(shipsG, P.ships, W, H, sd0 + 3000);
      const fx = layerSet(root), front = layerSet(root), side = layerSet(root);
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = MCB.cast(castG, P.cast, W, H, sd0 + 700), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      const counter = makeCounter(labG, P.counter);
      // fleet wall layout (fixed)
      const wall = [];
      if (P.wall) {
        const w = P.wall, r = rng(sd0 + 11), rows = w.rows || [40, 45, 48];
        rows.forEach((n, ri) => {
          for (let k = 0; k < n; k++) {
            const u = (k + 0.5 + (r() - 0.5) * 0.6) / n;
            wall.push({ x: lerp(w.x0 ?? -0.05, w.x1 ?? 1.05, u), y: (w.y0 ?? 0.445) + ri * (w.dy ?? 0.022) + (r() - 0.5) * 0.006,
              s: (w.s0 ?? 0.11) + ri * (w.ds ?? 0.05), big: r() < 0.15, face: w.face ?? 1, ri, k });
          }
        });
      }
      const line = [];
      if (P.line) {
        const l = P.line, n = l.n ?? 13, a = l.from || [0.2, 0.62, 0.6], b = l.to || [0.86, 0.5, 0.2];
        for (let k = 0; k < n; k++) { const u = n > 1 ? k / (n - 1) : 0, e = Math.pow(u, l.pow ?? 0.75);
          line.push({ x: lerp(a[0], b[0], e), y: lerp(a[1], b[1], e) + (k % 2 ? (l.stagger ?? 0) : 0), s: lerp(a[2], b[2], e), k }); }
        line.reverse();          // far first
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const wy = (P.water ?? 0.44) * H;
          // far water hatch
          for (let r = 0; r < 12; r++) {
            const yy = wy + 12 + r * r * 4.2 + r * 14, k = r / 12;
            for (let c = 0; c < 4; c++) {
              const len = 40 + k * 70, xx = (((c / 4) * (W + 200) + r * 67 + t * (8 + k * 14)) % (W + 200)) - 100;
              back.add('soft', inkPath([[xx, yy], [xx + len * 0.5, yy - 3 - k * 4], [xx + len, yy]], { seed: sd + 20 + r * 5 + c, t, w: 2.2 + k * 1.5, amp: 0.8 }));
            }
          }
          back.flush();
          // fleet wall
          if (P.wall) {
            const adv = (P.wall.adv ?? 0) * lt;
            wall.forEach((m, i) => {
              const x = m.x * W + adv * (m.face) + Math.sin(t * 0.7 + i) * 3, y = m.y * H + Math.sin(t * 1.1 + i * 0.7) * 2 + adv * 0.04 * m.ri;
              drawJapan(wallL, sd + 5000 + i * 13, t, { x, y, s: m.s, face: m.face, lite: true, soft: m.ri === 0 && !P.wall.dark, heavy: !!P.wall.dark, big: m.big, roll: Math.sin(t + i) * 1.2 });
            });
          }
          wallL.flush();
          // tide streaks
          if (P.tide) {
            const td = P.tide, n = td.n ?? 9, fl = atOr(cues, td.flip, null), v = (td.speed ?? 260) * (td.dir ?? 1);
            const D = fl == null || lt < fl ? v * lt : v * fl - v * (lt - fl) * 1.15;
            const dirNow = fl == null ? (td.dir ?? 1) : lerp(td.dir ?? 1, -(td.dir ?? 1), progIO(lt, fl, 0.5));
            const r = rng(sd + 41);
            for (let k = 0; k < n; k++) {
              const y = lerp(td.y0 ?? 0.5, td.y1 ?? 0.64, (k + 0.5) / n) * H, sp = 0.7 + r() * 0.6, ph = r();
              const len = 120 + r() * 100, span = W + 400;
              const x = ((ph * span + D * sp) % span + span) % span - 200;
              const dx = len * Math.sign(dirNow || 1) * Math.max(0.25, Math.abs(dirNow));
              mid.add('soft', inkPath([[x - dx, y + 4], [x - dx * 0.5, y - 6], [x, y]], { seed: sd + 60 + k, t, w: 4.5 }));
              const hs = 22 * Math.sign(dirNow || 1);
              mid.add('ink', inkPath([[x - hs, y - 14], [x, y], [x - hs, y + 14]], { seed: sd + 80 + k, t, w: 4, smooth: false, amp: 0.8 }));
            }
          }
          (P.whirl || []).forEach((wh, i) => drawWhirl(mid, sd + 100 + i * 10, t, wh.x * W, wh.y * H, wh.r ?? 110, prog(lt, atOr(cues, wh.at, 0), 1), wh.spin ?? 1));
          // ship line (fixed small ships)
          line.forEach(m => drawJoseon(lineL, sd + 7000 + m.k * 31, t, { x: m.x * W + (P.line.vx ?? 0) * lt * (1 + m.s), y: m.y * H + Math.sin(t * 1.2 + m.k) * 3, s: m.s, face: P.line.face ?? -1,
            lite: m.s < 0.26, pen: P.line.pen, flag: m.k === 0 ? (P.line.flag0 ?? 'yi') : null, roll: Math.sin(t * 0.9 + m.k) * 1.3, oar: m.k }));
          mid.flush(); lineL.flush();
          updateShips(items, lt, t, cues, W, H, P.glow);
          (P.crash || []).forEach((c, i) => drawCrash(fx, sd + 1200 + i * 50, t, c.x * W, c.y * H, 160 * (c.size ?? 1), lt - atOr(cues, c.at, 1)));
          fx.flush();
          drawFront(front, sd + 1400, t, W, H, (P.front ?? 0.66) * H, { dir: P.tide && P.tide.dir ? P.tide.dir : 1 });
          front.flush();
          if (P.cliffs) {
            const c = P.cliffs, wl = (P.front ?? 0.66) * H;
            if (c.left != null) drawCliff(side, sd + 1600, t, W, H, -1, c.left * W, (c.top ?? 0.3) * H, wl, c.slope ?? 0.16);
            if (c.right != null) drawCliff(side, sd + 1700, t, W, H, 1, c.right * W, (c.top_r ?? c.top ?? 0.3) * H, wl, c.slope ?? 0.16);
          }
          if (P.head) { const h = P.head; drawHead(side, sd + 1800, t, W, H, h.side === 'right' ? 1 : -1, (h.edge ?? 0.46) * W, (h.top ?? 0.6) * H); }
          side.flush();
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
          if (counter) counter.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ---------------------------------------------------------------- Joseon headgear (stage px; head centre hc, scale s, face f)
  function drawHat(L, sd, t, kind, hx, hy, s, f) {
    const Q = (u, v) => [hx + u * s * f, hy + v * s];
    const QQ = a => a.map(p => Q(p[0], p[1]));
    const w = k => Math.max(2.5, k * s);
    if (kind === 'jeonrip') {
      // wide flat brim + domed crown + red tassel on top + chin cords
      const brim = inkEllipsePts(...Q(4, -62), 140 * s, 24 * s, sd, 16, -0.05 * f);
      L.add('ink', inkLoop(brim, { seed: sd, t, amp: 1 }));
      const crown = QQ([[-58, -62], [-62, -104], [-38, -140], [0, -150], [38, -140], [62, -104], [58, -62]]);
      L.add('ink', inkLoop(crown, { seed: sd + 1, t, amp: 1 }));
      L.add('gold', inkPath(QQ([[-58, -72], [0, -80], [58, -72]]), { seed: sd + 2, t, w: w(7) }));
      const sw = Math.sin(t * 2.4 + sd) * 8;
      L.add('red', inkLoop(QQ([[-6, -148], [-26 + sw, -166], [-34 + sw, -212], [-6 + sw * 0.5, -188], [14 + sw, -216], [16, -166], [6, -148]]), { seed: sd + 3, t, amp: 1.2 }));
    } else if (kind === 'soldier') {
      const brim = inkEllipsePts(...Q(2, -44), 104 * s, 18 * s, sd, 14, -0.05 * f);
      L.add('ink', inkLoop(brim, { seed: sd, t, amp: 1 }));
      const crown = QQ([[-56, -44], [-56, -84], [-30, -114], [10, -116], [44, -100], [56, -70], [56, -44]]);
      L.add('soft', inkLoop(crown, { seed: sd + 1, t, amp: 1 }));
      L.add('ink', inkPath(crown, { seed: sd + 1, t, w: w(5), closed: true }));
      L.add('red', inkPath(QQ([[-54, -56], [0, -62], [54, -56]]), { seed: sd + 2, t, w: w(6) }));
    } else if (kind === 'band') {
      L.add('light', inkPath(QQ([[-70, -34], [0, -46], [70, -34]]), { seed: sd, t, w: w(16) }));
      L.add('ink', inkPath(QQ([[-70, -26], [0, -38], [70, -26]]), { seed: sd + 1, t, w: w(4) }));
    }
  }
  // a minimal cast of period figures with headgear (KASIF rig without the narrator's hat)
  function figSet(parent, list, W, H, sd0) {
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    const items = (list || []).map((m, i) => {
      const g = el(parent, 'g');
      const rig = KASIF.create(g, { scale: m.s ?? 0.75, hat: false, beard: m.beard || null, seed: sd0 + i * 13 + 7 });
      return { m, rig, prop: layerSet(parent), hat: layerSet(parent), i };
    });
    return {
      update(lt, t, cues) {
        items.forEach(({ m, rig, prop, hat, i }) => {
          const sc = m.s ?? 0.75, segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, face: m.face, emotion: m.emotion }];
          (m.seq || []).forEach(q => { const a = atOr(cues, q.at, null); if (a != null) segs.push(Object.assign({}, q, { at: a })); });
          segs.sort((a, b) => a.at - b.at);
          let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
          const s = segs[si], pv = si > 0 ? segs[si - 1] : null, since = lt - Math.max(0, s.at);
          const face = MCB.faceOf(s.face ?? m.face, 1), pose = s.pose || 'idle';
          let x = m.x * W, ph = 0;
          if (pose === 'walk' || m.speed) { const d = (m.speed ?? 70) * lt; x += d * face; ph = d / (gait * sc); }
          const o = { x, y: H * (m.y ?? 0.6), face, since, ph, dir: MCB.dirOf(s.dir ?? 10), emotion: s.emotion || m.emotion || null, mouth: 0 };
          if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: MCB.dirOf(pv.dir ?? 10) }; o.mix = since / 0.32; }
          const R = rig.update(t, pose, o);
          const hx = x + face * sc * R.head[0], hy = o.y + sc * R.head[1];
          const hand = R.hands[1], wx = x + face * sc * hand[0], wy = o.y + sc * hand[1];
          if (m.spear) {   // long spear held upright in the front hand
            prop.add('ink', inkPath([[wx + face * 4, wy + 120 * sc], [wx + face * 14, wy - 430 * sc]], { seed: sd0 + i * 5 + 1, t, w: Math.max(3, 7 * sc) }));
            prop.add('soft', inkLoop([[wx + face * 6, wy - 430 * sc], [wx + face * 30, wy - 520 * sc], [wx + face * 26, wy - 428 * sc]], { seed: sd0 + i * 5 + 2, t, amp: 1 }));
            prop.add('red', inkPath([[wx + face * 12, wy - 420 * sc], [wx + face * (2 + Math.sin(t * 4 + i) * 6), wy - 380 * sc]], { seed: sd0 + i * 5 + 3, t, w: Math.max(3, 9 * sc) }));
          }
          if (m.flag) {    // command flag on a pole
            const top = [wx + face * 20 * sc, wy - 470 * sc], wv = Math.sin(t * 3 + i) * 12 * sc;
            prop.add('ink', inkPath([[wx, wy + 90 * sc], top], { seed: sd0 + i * 5 + 1, t, w: Math.max(3, 7 * sc) }));
            const fl = [top, [top[0] + face * 200 * sc, top[1] + 20 * sc + wv], [top[0] + face * 190 * sc, top[1] + 150 * sc + wv], [top[0], top[1] + 130 * sc]];
            prop.add('blue', inkLoop(fl, { seed: sd0 + i * 5 + 2, t, amp: 1, smooth: false }));
            prop.add('red', inkPath([[top[0] + face * 8 * sc, top[1] + 66 * sc], [top[0] + face * 186 * sc, top[1] + 84 * sc + wv]], { seed: sd0 + i * 5 + 3, t, w: Math.max(4, 16 * sc) }));
            prop.add('ink', inkPath(fl, { seed: sd0 + i * 5 + 2, t, w: Math.max(3, 5 * sc), closed: true, amp: 1, smooth: false }));
          }
          prop.flush();
          const hs = m.hat_to ? atOr(cues, m.hat_to.at, null) : null, swap = hs != null && lt >= hs;
          const hp = swap ? spring(lt, hs, 0.5) : 1;
          drawHat(hat, sd0 + i * 7 + 90, t, swap ? m.hat_to.hat : (m.hat || 'soldier'), hx, hy - (swap ? (1 - hp) * 120 * sc : 0), sc * (swap ? Math.max(0.2, hp) : 1), face);
          hat.flush();
        });
      },
    };
  }

  // ---------------------------------------------------------------- mn_deck
  SH.mn_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000 + 57, mode = P.mode || 'march';
      const root = el(svg, 'g');
      const back = layerSet(root);
      const items = shipSet(el(root, 'g'), P.ships, W, H, sd0 + 3000);
      const midL = layerSet(root);
      const figG = el(root, 'g');
      const figs = figSet(figG, P.figs, W, H, sd0 + 500);
      const front = layerSet(root);
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = MCB.cast(castG, P.cast, W, H, sd0 + 700), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      const outG = el(root, 'g'), labelsOut = P.labels_out ? MCB.labels(outG, P.labels_out.list, W, H, sd0 + 900) : null;
      const gy = (P.ground ?? 0.6) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          if (mode === 'deck') {
            // sea hatch behind the rail
            const wy = (P.water ?? 0.5) * H;
            for (let r = 0; r < 10; r++) { const yy = wy + 14 + r * r * 5 + r * 16, k = r / 10;
              for (let c = 0; c < 4; c++) { const len = 50 + k * 80, xx = (((c / 4) * (W + 200) + r * 71 + t * (10 + k * 18)) % (W + 200)) - 100;
                back.add('soft', inkPath([[xx, yy], [xx + len * 0.5, yy - 4 - k * 4], [xx + len, yy]], { seed: sd + 20 + r * 5 + c, t, w: 2.4 + k * 1.6, amp: 0.8 })); } }
            (P.whirl || []).forEach((wh, i) => drawWhirl(back, sd + 100 + i * 10, t, wh.x * W, wh.y * H, wh.r ?? 120, prog(lt, atOr(cues, wh.at, 0), 1), wh.spin ?? 1));
            if (P.streaks) for (let k = 0; k < 8; k++) {
              const y = wy + 40 + k * 26, sp = 140 + k * 30, span = W + 300, x = ((k * 211 + lt * sp) % span + span) % span - 150;
              back.add('blue', inkPath([[x - 110, y + 3], [x - 50, y - 5], [x, y]], { seed: sd + 140 + k, t, w: 4 }));
            }
            back.flush();
            updateShips(items, lt, t, cues, W, H, false);
            midL.flush();
            figs.update(lt, t, cues);
            // battlement wall of the flagship (planks, gun ports, a drum) from the rail to the frame bottom
            const ry = (P.rail ?? 0.66) * H;
            const wallP = [[-40, ry], [W + 40, ry - 10], [W + 40, H + 40], [-40, H + 40]];
            if (P.banner) {   // the admiral's big command banner on deck, snapping in the wind
              const bx = P.banner.x * W, top = ry - (P.banner.h ?? 0.5) * H;
              midL.add('ink', inkPath([[bx, ry + 20], [bx + 4, top]], { seed: sd + 280, t, w: 10 }));
              const bw = P.banner.w ?? 330, bh = P.banner.fh ?? 200, pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([bx + 4 - u * bw, top + 10 + Math.sin(t * 6 - u * 5) * bh * 0.13 * u]); }
              for (let k = 8; k >= 0; k--) { const u = k / 8; pts.push([bx + 4 - u * bw, top + 10 + bh + Math.sin(t * 6 - u * 5 + 0.4) * bh * 0.13 * u]); }
              midL.add('blue', inkLoop(pts, { seed: sd + 281, t, amp: 1, smooth: false }));
              midL.add('red', inkPath(pts.slice(0, 9).map(p => [p[0], p[1] + bh / 2]), { seed: sd + 282, t, w: bh * 0.11 }));
              midL.add('ink', inkPath(pts, { seed: sd + 283, t, w: 5, closed: true, smooth: false }));
              midL.flush();
            }
            front.add('dark', inkLoop(wallP, { seed: sd + 300, t, amp: 1, smooth: false }));
            front.add('stain', inkLoop(wallP, { seed: sd + 300, t, amp: 1, smooth: false }));
            front.add('ink', inkPath([[-40, ry - 18], [W + 40, ry - 28]], { seed: sd + 301, t, w: 16 }));
            front.add('ink', inkPath([[-40, ry + 8], [W + 40, ry - 2]], { seed: sd + 302, t, w: 5 }));
            for (let k = 0; k < 9; k++) { const x = (k + 0.5) / 9 * W; front.add('soft', inkPath([[x, ry + 10], [x + 4, H + 20]], { seed: sd + 310 + k, t, w: 6 })); }
            for (let r = 0; r < 4; r++) front.add('soft', inkPath([[-40, ry + 160 + r * 150], [W + 40, ry + 150 + r * 150]], { seed: sd + 330 + r, t, w: 3.5 }));
            for (let k = 0; k < 3; k++) { const x = (k + 0.5) / 3 * W, y = ry + 280; const sq = [[x - 46, y - 40], [x + 46, y - 42], [x + 46, y + 40], [x - 46, y + 42]];
              front.add('dark', inkLoop(sq, { seed: sd + 350 + k, t, smooth: false })); front.add('ink', inkPath(sq, { seed: sd + 350 + k, t, w: 6, closed: true, smooth: false }));
              // a cannon muzzle peeks out
              front.add('ink', inkDot(x, y + 2, 22, 20, sd + 360 + k, t)); }
            front.flush();
          } else {
            // march: road + roadside grass, the column walks along it
            const ry0 = gy - 8;
            const road = [[-40, ry0], [W + 40, ry0 + 6], [W + 40, ry0 + 150], [-40, ry0 + 160]];
            back.add('stain', inkLoop(road, { seed: sd + 10, t, amp: 1, smooth: false }));
            back.flush();
            figs.update(lt, t, cues);
            // foreground: verge with tall grass and stones down to the frame bottom
            const vy = gy + 170;
            const verge = [[-40, vy]]; for (let x = 0; x <= W + 40; x += 60) verge.push([x, vy + Math.sin(x * 0.02) * 10]);
            verge.push([W + 40, H + 40], [-40, H + 40]);
            front.add('dark', inkLoop(verge, { seed: sd + 20, t, amp: 1, smooth: false }));
            front.add('ink', inkPath(verge.slice(0, -2), { seed: sd + 21, t, w: 6 }));
            const r = rng(sd + 22);
            for (let k = 0; k < 26; k++) { const x = r() * W, y = vy + 30 + r() * (H - vy - 60), hh = 60 + r() * 90, sw = Math.sin(t * 1.6 + k) * 8;
              front.add(k % 3 ? 'soft' : 'ink', inkPath([[x, y], [x + sw + 6, y - hh]], { seed: sd + 30 + k, t, w: 4 }));
              front.add(k % 3 ? 'soft' : 'ink', inkPath([[x + 10, y], [x + 26 + sw, y - hh * 0.7]], { seed: sd + 60 + k, t, w: 3.5 })); }
            for (let k = 0; k < 6; k++) { const x = (k + 0.3 + r() * 0.4) / 6 * W, y = vy + 120 + r() * 360, rr = 28 + r() * 30;
              front.add('stain', inkLoop(circ(x, y, rr * 1.4, 9, rr * 0.5), { seed: sd + 90 + k, t, amp: 1 }));
              front.add('ink', inkPath(circ(x, y, rr * 1.4, 9, rr * 0.5), { seed: sd + 90 + k, t, w: 5, closed: true, amp: 1 })); }
            front.flush();
          }
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
          if (labelsOut) {
            const oa = atOr(cues, P.labels_out.at, null), q = oa == null ? 0 : prog(lt, oa, 0.4);
            outG.style.display = q >= 1 ? 'none' : '';
            if (q < 1) { labelsOut.update(lt, t, cues); outG.setAttribute('opacity', (1 - q).toFixed(3)); }
          }
        },
      };
    },
  };

  // ---------------------------------------------------------------- mn_letter
  SH.mn_letter = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000 + 83, mode = P.mode || 'reply';
      const root = el(svg, 'g');
      const table = layerSet(root), paper = layerSet(root);
      const txtG = el(root, 'g');
      const lines = P.lines || ['I STILL HAVE', '12 SHIPS'], red = P.red || [], size = P.size ?? 120;
      const ty = (P.table ?? 0.6) * H;
      // sheet / scroll geometry
      const sx0 = W * 0.12, sx1 = W * 0.88, sy0 = H * (P.sheet_top ?? 0.26), sy1 = ty + H * 0.03;
      const lineY = lines.map((_, i) => sy0 + (sy1 - sy0) * ((P.line0 ?? 0.24) + i * (P.gap ?? 0.24)));
      const clips = lines.map((L, i) => {
        const id = 'mnclip' + (++CLIPN);
        const cp = el(txtG, 'clipPath', { id, clipPathUnits: 'userSpaceOnUse' });
        const rect = el(cp, 'rect', { x: 0, y: lineY[i] - size, width: 0, height: size * 2 });
        const tx = el(txtG, 'text', { x: W / 2, y: lineY[i], 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: red.includes(i) ? INK.red : INK.ink, 'clip-path': `url(#${id})` });
        tx.textContent = L;
        let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * L.length * 0.45; }
        return { rect, tx, w };
      });
      const sealG = el(root, 'g'), seal = layerSet(sealG), sealT = el(sealG, 'g');
      const sealTx = el(sealT, 'text', { x: 0, y: 4, 'font-family': MCB.FR, 'font-weight': 900, 'font-size': 46, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.paperLight });
      sealTx.textContent = P.seal_text || 'KING';
      const handL = layerSet(root), handF = layerSet(root), fg = layerSet(root);
      // correction: strike a word of one line and write the new one above it on a cue
      const fx0 = P.fix ? (() => {
        const f = P.fix, i = f.line ?? 1, L = lines[i] || '';
        const meas = el(txtG, 'text', { 'font-family': INK_FONT, 'font-size': size, x: -9999, y: -9999 });
        const pre = L.slice(0, L.indexOf(f.word)); meas.textContent = pre || ' ';
        let wp = 0, ww = 0; try { wp = pre ? meas.getComputedTextLength() : 0; meas.textContent = f.word; ww = meas.getComputedTextLength(); } catch (e) { ww = size * 0.9; }
        meas.remove();
        const g = el(root, 'g'), tx = el(g, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': f.size ?? size * 0.95, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red });
        tx.textContent = f.text;
        const strike = inkEl(root, INK.red), ring = inkEl(root, INK.red); root.appendChild(g);
        return { f, i, wp, ww, g, strike, ring };
      })() : null;
      const labG = el(root, 'g'), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      const total = clips.reduce((a, c) => a + c.w, 0) || 1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          // table top (perspective) + front edge down to the frame bottom
          const top = [[-40, ty], [W + 40, ty - 8], [W + 40, H * 0.8], [-40, H * 0.8 + 10]];
          table.add('stain', inkLoop(top, { seed: sd + 1, t, amp: 1, smooth: false }));
          table.add('ink', inkPath([[-40, ty], [W + 40, ty - 8]], { seed: sd + 2, t, w: 6 }));
          for (let k = 0; k < 6; k++) table.add('soft', inkPath([[-40, ty + 60 + k * 70], [W + 40, ty + 50 + k * 72]], { seed: sd + 3 + k, t, w: 3 }));
          const edge = [[-40, H * 0.8 + 10], [W + 40, H * 0.8], [W + 40, H + 40], [-40, H + 40]];
          table.add('dark', inkLoop(edge, { seed: sd + 12, t, amp: 1, smooth: false }));
          table.add('ink', inkPath([[-40, H * 0.8 + 10], [W + 40, H * 0.8]], { seed: sd + 13, t, w: 10 }));
          for (let k = 0; k < 3; k++) table.add('soft', inkPath([[-40, H * 0.85 + k * 80], [W + 40, H * 0.85 + k * 80 - 6]], { seed: sd + 14 + k, t, w: 4 }));
          // oil lamp on the right (flame flickers), ink stone on the left
          const lx = W * 0.86, ly = ty + H * 0.1;
          const lamp = [[lx - 60, ly], [lx - 40, ly - 40], [lx + 40, ly - 40], [lx + 60, ly]];
          table.add('dark', inkLoop(lamp, { seed: sd + 20, t, smooth: false })); table.add('ink', inkPath(lamp, { seed: sd + 20, t, w: 5, closed: true, smooth: false }));
          table.add('ink', inkPath([[lx, ly - 40], [lx, ly - 140]], { seed: sd + 21, t, w: 8 }));
          const fh = 70 + Math.sin(t * 11) * 10 + Math.sin(t * 17) * 6, fw = Math.sin(t * 7) * 8;
          table.add('stain', inkLoop(circ(lx, ly - 190, 120, 14, 110), { seed: sd + 22, t, amp: 3 }));
          table.add('gold', inkLoop([[lx - 18, ly - 140], [lx - 10 + fw, ly - 140 - fh * 0.6], [lx + fw * 1.5, ly - 140 - fh], [lx + 12 + fw, ly - 140 - fh * 0.5], [lx + 18, ly - 140]], { seed: sd + 23, t, amp: 1.5 }));
          table.add('red', inkLoop([[lx - 7, ly - 142], [lx + fw * 0.7, ly - 140 - fh * 0.5], [lx + 7, ly - 142]], { seed: sd + 24, t, amp: 1 }));
          const sx = W * 0.1, sy = ty + H * 0.11;
          const stone = [[sx - 70, sy - 24], [sx + 70, sy - 30], [sx + 76, sy + 30], [sx - 74, sy + 34]];
          table.add('ink', inkLoop(stone, { seed: sd + 25, t, smooth: false }));
          table.add('soft', inkLoop(circ(sx + 10, sy, 34, 10, 14), { seed: sd + 26, t }));
          table.flush();
          // paper / scroll
          const wa = atOr(cues, P.at, 0.2), wd = P.dur ?? 1.8;
          let open = 1;
          if (mode === 'order') open = progIO(lt, 0, 0.9);
          const by1 = lerp(sy0 + 60, sy1, open);
          const sheet = [[sx0, sy0], [sx1, sy0 - 6], [sx1 + 6, by1], [sx0 - 4, by1 + 4]];
          paper.add('light', inkLoop(sheet, { seed: sd + 30, t, amp: 1, smooth: false }));
          paper.add('ink', inkPath(sheet, { seed: sd + 30, t, w: 5, closed: true, smooth: false }));
          for (let k = 1; k < 4; k++) paper.add('soft', inkPath([[sx0 + 20, lerp(sy0, by1, k / 4)], [sx1 - 20, lerp(sy0, by1, k / 4) - 4]], { seed: sd + 31 + k, t, w: 1.8, amp: 0.6 }));
          if (mode === 'order') {
            [[sy0 - 10], [by1 + 10]].forEach(([y], i) => {
              const rod = [[sx0 - 50, y - 22], [sx1 + 50, y - 26], [sx1 + 50, y + 20], [sx0 - 50, y + 24]];
              paper.add('red', inkLoop(rod, { seed: sd + 40 + i, t, smooth: false }));
              paper.add('ink', inkPath(rod, { seed: sd + 40 + i, t, w: 5, closed: true, smooth: false }));
              [sx0 - 64, sx1 + 64].forEach((x, j) => paper.add('gold', inkLoop(circ(x, y, 26, 10), { seed: sd + 44 + i * 2 + j, t })));
            });
          }
          paper.flush();
          // writing reveal
          let done = 0;
          const pw = prog(lt, wa, wd) * total;
          let tip = null;
          clips.forEach((c, i) => {
            const vis = clamp01((pw - done) / c.w);
            const x0 = W / 2 - c.w / 2;
            c.rect.setAttribute('x', f1(x0 - 10)); c.rect.setAttribute('width', f1((c.w + 20) * vis));
            if (vis > 0 && vis < 1) tip = [x0 + c.w * vis, lineY[i] + Math.sin(lt * 26) * size * 0.18];
            if (vis >= 1 && i === clips.length - 1 && !tip) tip = [x0 + c.w + 30, lineY[i] + 20];
            const b = boil(sd + 50 + i, t, 1);
            c.tx.setAttribute('transform', `translate(${f1(b[0])} ${f1(b[1])})`);
            done += c.w;
          });
          if (!tip) tip = [W / 2 - clips[0].w / 2 - 30, lineY[0]];
          // after writing, the brush is lifted and parked below the text
          const endW = wa + wd, park = progIO(lt, endW + 0.15, 0.6);
          if (park > 0) { const last = clips.length - 1, px = W * 0.5, py = lineY[last] + size * 1.25;
            tip = [lerp(tip[0], px, park), lerp(tip[1], py, park) - Math.sin(park * Math.PI) * 60]; }
          if (fx0) {
            const fa = atOr(cues, fx0.f.at, null), c = clips[fx0.i];
            const x0 = W / 2 - c.w / 2 + fx0.wp, y = lineY[fx0.i];
            const sp = fa != null ? prog(lt, fa, 0.3) : 0;
            if (fx0.f.over) {   // paper patch + red ring over the old word, the new one written on it
              const np0 = fa != null ? spring(lt, fa, 0.45) : 0, pw2 = (fx0.ww + 40) / 2 * np0, ph2 = size * 0.62 * np0;
              const bx2 = x0 + fx0.ww / 2, box = [[bx2 - pw2, y - ph2], [bx2 + pw2, y - ph2 - 4], [bx2 + pw2 + 4, y + ph2], [bx2 - pw2 - 2, y + ph2 + 2]];
              fx0.strike.setAttribute('d', np0 > 0.01 ? inkLoop(box, { seed: sd + 90, t, amp: 1, smooth: false }) : '');
              fx0.strike.setAttribute('fill', INK.paperLight);
              fx0.ring.setAttribute('d', np0 > 0.01 ? inkPath(box, { w: 8, seed: sd + 92, t, amp: 1, closed: true, smooth: false }) : '');
            } else
            fx0.strike.setAttribute('d', sp > 0.01 ? inkPath([[x0 - 8, y + 8], [x0 - 8 + (fx0.ww + 16) * sp, y - 10]], { w: 12, seed: sd + 90, t, amp: 1 }) : '');
            const np = fa != null ? spring(lt, fa + 0.2, 0.5) : 0;
            fx0.g.style.display = np > 0.01 ? '' : 'none';
            const b = boil(sd + 91, t, 1.2);
            fx0.g.setAttribute('transform', `translate(${f1(x0 + fx0.ww / 2 + b[0])} ${f1(y - (fx0.f.over ? 0 : size * 0.95) + b[1])}) rotate(${fx0.f.over ? -3 : -6}) scale(${Math.max(0.01, np).toFixed(3)})`);
            if (fa != null && lt >= fa) { const q = progIO(lt, fa - 0.05, 0.35); tip = [lerp(tip[0], x0 + fx0.ww + 30, q * (1 - prog(lt, fa + 0.7, 0.5))), lerp(tip[1], y - size * 0.7, q * (1 - prog(lt, fa + 0.7, 0.5)))]; }
          }
          // seal
          const sa = atOr(cues, P.seal, null);
          if (sa != null && lt >= sa) {
            sealG.style.display = '';
            const p = clamp01((lt - sa) / 0.25), sc = lerp(1.9, 1, p) * (1 + 0.08 * punch(lt, sa + 0.25, 0.6));
            const cx = W * (P.seal_x ?? 0.7), cy = sy0 + (sy1 - sy0) * (P.seal_y ?? 0.7);
            const sq = [[-95, -95], [95, -99], [99, 95], [-97, 97]], k0 = P.seal_scale ?? 1;
            seal.add('red', inkLoop(sq, { seed: sd + 60, t, amp: 1.2, smooth: false }));
            seal.add('light', inkPath([[-76, -76], [78, -78], [80, 76], [-78, 78]], { seed: sd + 61, t, w: 5, closed: true, smooth: false }));
            seal.flush();
            sealG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(-6) scale(${(sc * k0).toFixed(3)})`);
            
          } else sealG.style.display = 'none';
          // hand + brush (reply mode)
          if (mode === 'reply') {
            const [bx, by] = tip;
            const hx = bx + 80, hy = by + 120;
            // arm in a sleeve from the right edge to the hand
            const ex = W + 140, ey = hy + 330, ax = ex - hx, ay = ey - hy, al = Math.hypot(ax, ay), nx = -ay / al, ny = ax / al;
            const sl = [[hx + 30 + nx * 46, hy + ny * 46], [ex + nx * 80, ey + ny * 80], [ex - nx * 80, ey - ny * 80], [hx + 30 - nx * 46, hy - ny * 46]];
            handL.add('light', inkLoop(sl, { seed: sd + 70, t, amp: 1.2, smooth: false }));
            handL.add('ink', inkPath(sl, { seed: sd + 71, t, w: 6, closed: true, smooth: false }));
            const cf = [[hx + 30 + nx * 50, hy + ny * 50], [hx + 30 + ax * 0.12 + nx * 54, hy + ay * 0.12 + ny * 54], [hx + 30 + ax * 0.12 - nx * 54, hy + ay * 0.12 - ny * 54], [hx + 30 - nx * 50, hy - ny * 50]];
            handL.add('blue', inkLoop(cf, { seed: sd + 72, t, amp: 1, smooth: false }));
            // brush shaft + hair tip (behind the fingers)
            handL.add('ink', inkPath([[bx + 8, by + 30], [hx + 14, hy + 20]], { seed: sd + 74, t, w: 12 }));
            handL.add('gold', inkPath([[bx + 14, by + 44], [bx + 24, by + 62]], { seed: sd + 75, t, w: 14 }));
            handL.add('ink', inkLoop([[bx, by - 4], [bx - 2, by + 22], [bx + 12, by + 40], [bx + 18, by + 18]], { seed: sd + 76, t, amp: 0.8 }));
            // hand: palm + knuckles curled round the brush, thumb on top
            const palm = [[hx - 30, hy - 26], [hx + 20, hy - 40], [hx + 62, hy - 14], [hx + 66, hy + 34], [hx + 30, hy + 56], [hx - 22, hy + 44], [hx - 40, hy + 10]];
            handF.add('light', inkLoop(palm, { seed: sd + 77, t, amp: 1 }));
            handF.add('ink', inkPath(palm, { seed: sd + 77, t, w: 6, closed: true, amp: 1 }));
            for (let k = 0; k < 3; k++) handF.add('ink', inkPath([[hx - 26 + k * 6, hy - 6 + k * 18], [hx - 4 + k * 4, hy + 2 + k * 18], [hx + 12 + k * 2, hy - 4 + k * 18]], { seed: sd + 78 + k, t, w: 4 }));
            const th = [[hx + 10, hy - 34], [hx - 22, hy - 44], [hx - 40, hy - 30], [hx - 20, hy - 18]];
            handF.add('light', inkLoop(th, { seed: sd + 82, t, amp: 0.8 }));
            handF.add('ink', inkPath(th, { seed: sd + 82, t, w: 5, closed: true, amp: 0.8 }));
            handL.flush(); handF.flush();
          } else {
            handL.flush(); handF.flush();
          }
          // foreground lip of the table already fills the bottom; a few drips of light
          fg.flush();
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ---------------------------------------------------------------- mn_map
  SH.mn_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000 + 97;
      const root = el(svg, 'g');
      const base = layerSet(root), flowL = layerSet(root), marks = layerSet(root), deco = layerSet(root);
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = MCB.cast(castG, P.cast, W, H, sd0 + 700), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      const A = (P.a || [0.92, 0.7]).map((v, i) => v * (i ? H : W)), B = (P.b || [0.2, 0.24]).map((v, i) => v * (i ? H : W));
      const N = (P.neck || [0.56, 0.44]).map((v, i) => v * (i ? H : W));
      const wide = P.wide ?? 300, narrow = P.narrow ?? 70;
      // channel centre line: B -> N -> A, quadratic-ish through the neck
      const C = u => { // u 0..1 from B to A
        if (u < 0.5) { const k = u / 0.5; return [lerp(B[0], N[0], k), lerp(B[1], N[1], k) + Math.sin(k * Math.PI) * 30]; }
        const k = (u - 0.5) / 0.5; return [lerp(N[0], A[0], k), lerp(N[1], A[1], k) - Math.sin(k * Math.PI) * 40];
      };
      const halfW = u => lerp(narrow / 2, wide / 2, Math.pow(Math.abs(u - 0.5) * 2, 1.4));
      const norm = u => { const a = C(Math.max(0, u - 0.01)), b = C(Math.min(1, u + 0.01)); const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
      const bank = sgn => { const pts = []; for (let k = -2; k <= 42; k++) { const u = k / 40; const c = C(clamp01(u)), n = norm(clamp01(u)), hw = halfW(clamp01(u)) * (u < 0 || u > 1 ? 1.6 : 1);
        const ext = u < 0 ? -(0 - u) * 900 : u > 1 ? (u - 1) * 900 : 0; const dir = [C(1)[0] - C(0)[0], C(1)[1] - C(0)[1]], dl = Math.hypot(...dir);
        pts.push([c[0] + n[0] * hw * sgn + dir[0] / dl * ext, c[1] + n[1] * hw * sgn + dir[1] / dl * ext]); } return pts; };
      const r0 = rng(sd0 + 3);
      const wob = pts => pts.map((p, i) => [p[0] + Math.sin(i * 1.7) * 10, p[1] + Math.cos(i * 1.3) * 10]);
      const bankL = wob(bank(1)), bankR = wob(bank(-1));
      const fleetR = Array.from({ length: P.red ?? 40 }, () => [r0(), r0() - 0.5, r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          // whole sheet = land (wash), the channel cut out as water (paper light)
          base.add('dark', inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd, t, amp: 0, smooth: false }));
          base.add('light', inkLoop(bankL.concat(bankR.slice().reverse()), { seed: sd + 10, t, amp: 1.2, smooth: false }));
          [bankL, bankR].forEach((bk, i) => {
            base.add('ink', inkPath(bk, { seed: sd + 20 + i, t, w: 6 }));
            // inner coastline echo
            base.add('soft', inkPath(bk.map((p, j) => { const u = clamp01((j - 2) / 40), n = norm(u), s = i ? -1 : 1; return [p[0] + n[0] * 26 * s, p[1] + n[1] * 26 * s]; }), { seed: sd + 22 + i, t, w: 3 }));
          });
          // land stipple + hill marks
          const r = rng(sd + 30);
          for (let k = 0; k < 26; k++) {
            const u = r(), side = k % 2 ? 1 : -1, c = C(u), n = norm(u), off = halfW(u) + 70 + r() * 260;
            const x = c[0] + n[0] * off * side, y = c[1] + n[1] * off * side;
            if (x < 30 || x > W - 30 || y < 300 || y > H - 30) continue;
            base.add('soft', inkPath([[x - 34, y + 10], [x - 6, y - 22], [x + 22, y + 10]], { seed: sd + 40 + k, t, w: 4, smooth: false }));
          }
          base.flush();
          // tide streamlines along the channel (faster in the neck)
          const flow = P.flow ?? 1, nS = 9;
          for (let k = 0; k < nS; k++) {
            const lane = (k / (nS - 1) - 0.5) * 1.5;
            const ph = ((t * 0.16 * flow + k * 0.137) % 1 + 1) % 1;
            for (let seg = 0; seg < 3; seg++) {
              const u0 = 1 - ((ph + seg / 3) % 1);       // from A (red side) to B (blue side)
              const pts = [];
              for (let j = 0; j < 6; j++) { const u = clamp01(u0 - j * 0.018 * (1 + (1 - Math.abs(u0 - 0.5) * 2) * 1.6)); const c = C(u), n = norm(u), hw = halfW(u);
                pts.push([c[0] + n[0] * hw * lane * 0.6, c[1] + n[1] * hw * lane * 0.6]); }
              flowL.add(k % 2 ? 'blue' : 'soft', inkPath(pts.reverse(), { seed: sd + 60 + k * 3 + seg, t, w: 5 }));
            }
          }
          // whirlpools at the neck
          const wa = prog(lt, atOr(cues, P.whirl_at, 0.2), 1);
          [[-0.25, 0.9], [0.3, 0.7]].forEach(([o, s], i) => { const u = 0.5 + o * 0.12, c = C(u); drawWhirl(flowL, sd + 90 + i * 10, t, c[0], c[1], 60 * s, wa, i ? -1 : 1); });
          flowL.flush();
          // blue line blocking mouth B
          const nb = P.blue ?? 13, nB = norm(0.12), cB = C(0.12), hwB = halfW(0.12);
          for (let k = 0; k < nb; k++) {
            const l = (k / (nb - 1) - 0.5) * 1.7, x = cB[0] + nB[0] * hwB * l, y = cB[1] + nB[1] * hwB * l + Math.sin(t * 2 + k) * 2;
            marks.add('blue', inkLoop([[x - 18, y - 6], [x + 18, y - 6], [x + 12, y + 8], [x - 12, y + 8]], { seed: sd + 120 + k, t, amp: 0.6, smooth: false }));
            marks.add('ink', inkPath([[x, y - 6], [x, y - 30]], { seed: sd + 140 + k, t, w: 3 }));
          }
          // red fleet pouring in from A
          const ea = atOr(cues, P.enter, 0), adv = prog(lt, ea, Math.max(1.5, dur - ea));
          fleetR.forEach((f, k) => {
            const u = clamp01(1.08 - f[0] * 0.3 - adv * 0.32), c = C(Math.min(1, u)), n = norm(Math.min(1, u)), hw = halfW(Math.min(1, u));
            const ext = u >= 1 ? 0 : 0;
            const x = c[0] + n[0] * hw * f[1] * 1.6 + ext, y = c[1] + n[1] * hw * f[1] * 1.6 + f[2] * 30;
            if (y > H + 20) return;
            marks.add('red', inkLoop([[x - 15, y - 5], [x + 15, y - 5], [x + 10, y + 7], [x - 10, y + 7]], { seed: sd + 200 + k, t, amp: 0.6, smooth: false }));
          });
          marks.flush();
          // compass rose top-right, width marks at the neck
          const cx = W * 0.84, cy = H * 0.2, cr = 70;
          deco.add('ink', inkPath(circ(cx, cy, cr, 14), { seed: sd + 300, t, w: 4, closed: true }));
          deco.add('red', inkLoop([[cx, cy - cr - 30], [cx + 16, cy], [cx, cy + 14], [cx - 16, cy]], { seed: sd + 301, t, smooth: false }));
          deco.add('ink', inkPath([[cx - cr - 20, cy], [cx + cr + 20, cy]], { seed: sd + 302, t, w: 3 }));
          const wp = prog(lt, atOr(cues, P.width_at, 0.4), 0.6);
          if (wp > 0) {
            const n = norm(0.5), hw = halfW(0.5) + 18;
            const a = [N[0] + n[0] * hw, N[1] + n[1] * hw], b = [N[0] - n[0] * hw, N[1] - n[1] * hw];
            const m = [lerp(N[0], a[0], wp), lerp(N[1], a[1], wp)], m2 = [lerp(N[0], b[0], wp), lerp(N[1], b[1], wp)];
            deco.add('red', inkPath([m2, m], { seed: sd + 310, t, w: 7 }));
            [m, m2].forEach((p, i) => deco.add('red', inkPath([[p[0] - n[1] * 26, p[1] + n[0] * 26], [p[0] + n[1] * 26, p[1] - n[0] * 26]], { seed: sd + 311 + i, t, w: 7 })));
          }
          deco.flush();
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
