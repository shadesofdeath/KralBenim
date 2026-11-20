// ht_holland: shots for the Stickstory Short "Holland Tunnel: the tunnel that should have poisoned every driver"
// (2026-11-20). The Holland Tunnel under the Hudson (opened 13 Nov 1927, about 1.6 miles): car exhaust (carbon
// monoxide) would fill a sealed tube; the US Bureau of Mines built a test tunnel in its experimental mine at Bruceton
// near Pittsburgh and tested volunteers' blood; the answer was four ventilation buildings with 84 fans that can
// replace the air every 90 seconds (fresh air from a duct under the road, foul air out through the ceiling).
// Chief engineer Clifford Holland died in October 1924 at 41.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif, LH.label, LH.person, LH.lamp,
// LH.calendar, LH.front). Portrait 1080×1920 layout (Shorts).
//
// Common: labels: [{text, x, y, at, size, color, font, card, rot, underline}] (LH.label)
//   kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} (LH.kasif)
//
// SHOTS.ht_tube — inside the tiled tunnel tube in one-point perspective: roadway, catwalk, wall lamps, 1920s cars
//   driving away with tail lights; exhaust puffs pile up from cue "fume" (thicker and darker after cue "hit").
//   P: {haze: 0..1 start, kasif, labels}
// SHOTS.ht_river — the Hudson in cross-section: New Jersey bank left, Manhattan skyline right, water, riverbed, rock.
//   P: {mode: "plan" (crowded ferries puff smoke on the surface; on cue "road" a dashed tube draws itself under the
//   river) | "fumes" (the tube is full of little cars, exhaust clouds fill it from cue "fume") | "air" (ventilation
//   buildings on both banks with turning fans; fresh-air arrows run down, along the duct under the road, up through
//   the road; foul air up into the ceiling duct and out of the towers; a stopwatch runs to 90 at cue "clock"),
//   labels}
// SHOTS.ht_mine — the Bureau of Mines test tunnel inside a timbered mine gallery, mine-cart rails in the foreground.
//   P: {mode: "enter" (a 1920s car idles in the concrete test tunnel, exhaust drifts; three volunteers walk in from
//   cue "walk") | "blood" (close: a seated volunteer, a doctor in a lab coat holds up a blood sample that fills red at
//   cue "blood"; a gauge needle rises), labels}
// SHOTS.ht_fan — inside a ventilation building: one huge centrifugal fan (scroll housing, spinning bladed wheel, motor)
//   and a row of more fans behind it; a counter runs 1 → 84 to cue "count". P: {labels}
// SHOTS.ht_desk — Clifford Holland at his drafting table with the tunnel drawing, a hanging lamp and a 1924 calendar;
//   from cue "dim" the lamp slowly goes out. P: {labels}
// SHOTS.ht_tower — the New York ventilation building today beside the tunnel portal: brick tower with louvres
//   breathing air puffs, cars driving into the portal, street and kerb in front. P: {kasif, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const sq = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const kasifOf = (parent, K, W, H, sd) => K ? window.LH.kasif(el(parent, 'g'), K, W, H, sd) : null;
  const smooth01 = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  const TILE = () => mix(INK.paperLight, INK.blue, 0.08);
  const TILE_D = () => mix(INK.paperDark, INK.blue, 0.15);
  const ROAD = () => mix(INK.inkSoft, INK.paperDark, 0.45);
  const ROAD_D = () => mix(INK.inkSoft, INK.ink, 0.25);
  const FUME = () => mix(INK.inkSoft, INK.paperDark, 0.25);
  const FUME_D = () => mix(INK.inkSoft, INK.ink, 0.35);
  const WATER = () => mix(INK.blue, INK.paperLight, 0.5);
  const WATER_D = () => mix(INK.blue, INK.paperLight, 0.25);
  const SILT = () => mix(INK.stain, INK.paperDark, 0.45);
  const ROCK = () => mix(INK.inkSoft, INK.paperDark, 0.55);
  const BRICK = () => mix(INK.red, INK.paperDark, 0.45);
  const BRICK_D = () => mix(INK.red, INK.ink, 0.25);
  const STEEL = () => mix(INK.blue, INK.inkSoft, 0.55);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.2);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const CAR_COLS = () => [mix(INK.ink, INK.inkSoft, 0.3), mix(INK.blue, INK.ink, 0.35), mix(INK.green, INK.ink, 0.35), mix(INK.red, INK.ink, 0.35)];

  // ------------------------------------------------------------------ a 1920s car, side view (face 1 = right), ground y
  // ~300 units long; returns the exhaust pipe point. Draws into a shared bucket set {body: {col: []}, dark, lines, gold, red}
  function carSide(B, sd, t, x, y, s, face, col, ph = 0) {
    const T = p => [x + p[0] * s * face, y + p[1] * s], TT = q => q.map(T);
    const amp = Math.min(1.2, 0.4 + s);
    (B.body[col] || (B.body[col] = [])).push(
      inkLoop(TT([[-150, -34], [150, -34], [150, -78], [138, -96], [40, -100], [30, -168], [-96, -172], [-110, -96], [-150, -92]]), { seed: sd + 1, t, smooth: false, amp }));
    B.light.push(inkLoop(TT([[-80, -104], [-10, -104], [-10, -156], [-80, -156]]), { seed: sd + 2, t, smooth: false, amp }), inkLoop(TT([[2, -104], [26, -104], [20, -156], [2, -156]]), { seed: sd + 3, t, smooth: false, amp }));
    const w = Math.max(2.4, 5 * s + 1);
    B.lines.push(inkPath(TT([[-150, -34], [150, -34], [150, -78], [138, -96], [40, -100], [30, -168], [-96, -172], [-110, -96], [-150, -92]]), { w, seed: sd + 4, t, closed: true, smooth: false, amp }));
    B.lines.push(inkPath(TT([[-176, -30], [-130, -70], [-60, -66]]), { w: w * 0.8, seed: sd + 5, t, amp }), inkPath(TT([[60, -66], [130, -70], [176, -30]]), { w: w * 0.8, seed: sd + 6, t, amp }));
    [-96, 96].forEach((wx, i) => {
      const c = T([wx, -34]);
      B.dark.push(inkCircle(c[0], c[1], 36 * s, sd + 10 + i, t, { fill: true }));
      B.light.push(inkCircle(c[0], c[1], 18 * s, sd + 12 + i, t, { fill: true }));
      for (let k = 0; k < 3; k++) { const a = ph * TAU + k * TAU / 3; B.lines.push(inkPath([[c[0] + Math.cos(a) * 6 * s, c[1] + Math.sin(a) * 6 * s], [c[0] + Math.cos(a) * 28 * s, c[1] + Math.sin(a) * 28 * s]], { w: w * 0.5, seed: sd + 14 + i * 3 + k, t, amp: 0.3 })); }
    });
    B.gold.push(inkCircle(...T([146, -88]), 9 * s + 1, sd + 20, t, { fill: true }));
    B.red.push(inkCircle(...T([-150, -80]), 7 * s + 1, sd + 21, t, { fill: true }));
    return T([-158, -36]);
  }
  // rear view of a 1920s car (for the tunnel perspective): ~360 wide, ~330 tall, ground y
  function carRear(B, sd, t, x, y, s, col, glow = 1) {
    const T = p => [x + p[0] * s, y + p[1] * s], TT = q => q.map(T), amp = Math.min(1.2, 0.3 + s * 0.8), w = Math.max(2, 6 * s);
    B.dark.push(inkLoop(TT([[-170, 0], [-120, 0], [-120, -70], [-170, -70]]), { seed: sd + 1, t, smooth: false, amp }), inkLoop(TT([[120, 0], [170, 0], [170, -70], [120, -70]]), { seed: sd + 2, t, smooth: false, amp }));
    const body = [[-180, -50], [180, -50], [178, -160], [130, -176], [120, -320], [-120, -320], [-130, -176], [-178, -160]];
    (B.body[col] || (B.body[col] = [])).push(inkLoop(TT(body), { seed: sd + 3, t, smooth: false, amp }));
    B.light.push(inkLoop(TT([[-80, -210], [80, -210], [76, -290], [-76, -290]]), { seed: sd + 4, t, smooth: false, amp }));
    B.lines.push(inkPath(TT(body), { w, seed: sd + 5, t, closed: true, smooth: false, amp }), inkPath(TT([[-178, -160], [178, -160]]), { w: w * 0.7, seed: sd + 6, t, amp }));
    B.dark.push(inkCircle(...T([0, -112]), 50 * s, sd + 7, t, { fill: true }));      // spare tyre
    B.light.push(inkCircle(...T([0, -112]), 24 * s, sd + 8, t, { fill: true }));
    B.red.push(inkCircle(...T([-150, -128]), 15 * s + 1, sd + 9, t, { fill: true }), inkCircle(...T([150, -128]), 15 * s + 1, sd + 10, t, { fill: true }));
    if (glow > 0) B.redGlow.push(inkCircle(...T([-150, -128]), 40 * s + 2, sd + 11, t, { fill: true }), inkCircle(...T([150, -128]), 40 * s + 2, sd + 12, t, { fill: true }));
    return T([-120, -40]);
  }
  function carBuckets(parent) {
    const g = el(parent, 'g'), cols = CAR_COLS();
    const E = { redGlow: inkEl(g, INK.red, { 'fill-opacity': 0.3 }), dark: inkEl(g, INK.ink) };
    const bodyEl = {}; cols.forEach(c => { bodyEl[c] = inkEl(g, c); });
    E.light = inkEl(g, mix(INK.paperLight, INK.blue, 0.15)); E.lines = inkEl(g); E.gold = inkEl(g, INK.gold); E.red = inkEl(g, INK.red);
    const B = { body: {}, redGlow: [], dark: [], light: [], lines: [], gold: [], red: [] };
    return {
      B, cols,
      reset() { B.body = {}; ['redGlow', 'dark', 'light', 'lines', 'gold', 'red'].forEach(k => { B[k] = []; }); },
      flush() {
        Object.keys(bodyEl).forEach(c => bodyEl[c].setAttribute('d', (B.body[c] || []).join(' ')));
        ['redGlow', 'dark', 'light', 'lines', 'gold', 'red'].forEach(k => E[k].setAttribute('d', B[k].join(' ')));
      },
    };
  }
  // exhaust puffs: two layers (soft + dark core) with their own opacity
  function fumes(parent, op = 0.45) {
    const soft = inkEl(parent, FUME(), { 'fill-opacity': op }), core = inkEl(parent, FUME_D(), { 'fill-opacity': op * 0.7 }), rim = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0.6 });
    return { soft, core, rim, set(S, C, R) { soft.setAttribute('d', S.join(' ')); core.setAttribute('d', C.join(' ')); rim.setAttribute('d', (R || []).join(' ')); } };
  }
  // a stopwatch: face, ticks, a sweep hand at fraction a (0..1), big number inside
  function stopwatch(parent, sd) {
    const g = el(parent, 'g');
    const face = inkEl(g, INK.paperLight), sweep = inkEl(g, INK.gold, { 'fill-opacity': 0.55 }), lines = inkEl(g), hand = inkEl(g, INK.red);
    const num = el(g, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, fill: INK.ink });
    return {
      update(t, x, y, r, a, text) {
        face.setAttribute('d', inkCircle(x, y, r, sd + 1, t, { fill: true }));
        const SW = [[x, y]]; for (let i = 0; i <= 24; i++) { const q = -Math.PI / 2 + a * TAU * i / 24; SW.push([x + Math.cos(q) * r * 0.86, y + Math.sin(q) * r * 0.86]); }
        sweep.setAttribute('d', a > 0.01 ? inkLoop(SW, { seed: sd + 2, t, smooth: false, amp: 0.5 }) : '');
        const L = [inkCircle(x, y, r, sd + 3, t, { w: 8 }), inkPath([[x - 22, y - r - 4], [x + 22, y - r - 4]], { w: 12, seed: sd + 4, t }), inkPath([[x, y - r], [x, y - r - 20]], { w: 10, seed: sd + 5, t })];
        for (let i = 0; i < 12; i++) { const q = i / 12 * TAU; L.push(inkPath([[x + Math.sin(q) * r * 0.78, y - Math.cos(q) * r * 0.78], [x + Math.sin(q) * r * 0.9, y - Math.cos(q) * r * 0.9]], { w: 4, seed: sd + 6 + i, t, amp: 0.4 })); }
        lines.setAttribute('d', L.join(' '));
        const q = -Math.PI / 2 + a * TAU;
        hand.setAttribute('d', inkPath([[x, y], [x + Math.cos(q) * r * 0.8, y + Math.sin(q) * r * 0.8]], { w: 7, seed: sd + 30, t, amp: 0.4 }) + ' ' + inkDot(x, y, 9, 9, sd + 31, t));
        num.setAttribute('x', f1(x)); num.setAttribute('y', f1(y + r * 0.62)); num.setAttribute('font-size', f1(r * 0.42));
        num.textContent = text || '';
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.ht_tube
  SH.ht_tube = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 311, root = el(svg, 'g'), u = W / 1080;
      const VX = 0.52 * W, VY = 0.4 * H;
      const XW = 1000 * u, YC = -620 * u, YF = 700 * u, CAT = 150 * u, CATX = -760 * u;
      const pr = (X, Y, z) => [VX + X / z, VY + Y / z];
      const ceil = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25)), wallL = inkEl(root, TILE()), wallR = inkEl(root, TILE()), floor = inkEl(root, ROAD()), cat = inkEl(root, TILE_D());
      const far = inkEl(root, mix(INK.inkSoft, INK.ink, 0.2)), lampsG = inkEl(root, INK.gold, { 'fill-opacity': 0.35 }), lamps = inkEl(root, INK.gold);
      const tiles = inkEl(root, TILE_D()), lines = inkEl(root), lane = inkEl(root, INK.paperLight);
      const cars = carBuckets(root), fm = fumes(root, P.op ?? 0.42);
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const LB = labels(root, P.labels, W, H);
      const CARS = P.cars || [[-300, 2.0, 0.9], [300, 3.4, 0.7], [-300, 6.5, 0.6], [300, 9, 0.55], [-300, 14, 0.5], [300, 20, 0.5]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), fu = atOr(cues, 'fume', 0), hp = punch(lt, hit, 0.7);
          const zN = 0.55, zF = 40;
          const Q = (X, Y, z0, z1) => [pr(X, Y, z0), pr(X, Y, z1)];
          // surfaces
          ceil.setAttribute('d', inkLoop([pr(-XW, YC, zN), pr(XW, YC, zN), pr(XW, YC, zF), pr(-XW, YC, zF)], { seed: sd + 1, t, smooth: false, amp: 0.5 }));
          wallL.setAttribute('d', inkLoop([pr(-XW, YC, zN), pr(-XW, YC, zF), pr(-XW, YF - CAT, zF), pr(-XW, YF - CAT, zN)], { seed: sd + 2, t, smooth: false, amp: 0.5 }));
          wallR.setAttribute('d', inkLoop([pr(XW, YC, zN), pr(XW, YC, zF), pr(XW, YF, zF), pr(XW, YF, zN)], { seed: sd + 3, t, smooth: false, amp: 0.5 }));
          floor.setAttribute('d', inkLoop([pr(CATX, YF, zN), pr(XW, YF, zN), pr(XW, YF, zF), pr(CATX, YF, zF)], { seed: sd + 4, t, smooth: false, amp: 0.5 }));
          cat.setAttribute('d', inkLoop([pr(-XW, YF - CAT, zN), pr(CATX, YF - CAT, zN), pr(CATX, YF - CAT, zF), pr(-XW, YF - CAT, zF)], { seed: sd + 5, t, smooth: false, amp: 0.5 }) + ' ' +
            inkLoop([pr(CATX, YF - CAT, zN), pr(CATX, YF, zN), pr(CATX, YF, zF), pr(CATX, YF - CAT, zF)], { seed: sd + 6, t, smooth: false, amp: 0.5 }));
          far.setAttribute('d', inkLoop([pr(-XW, YC, zF), pr(XW, YC, zF), pr(XW, YF, zF), pr(-XW, YF, zF)], { seed: sd + 7, t, smooth: false, amp: 0.3 }));
          // tile courses + segment joints + lamps
          const TL = [], LN = [], LP = [], LG = [];
          for (let k = 1; k < 9; k++) { const Y = lerp(YC, YF, k / 9); TL.push(inkPath(Q(XW, Y, zN, zF), { w: 2.5, seed: sd + 20 + k, t, amp: 0.5 })); if (Y < YF - CAT) TL.push(inkPath(Q(-XW, Y, zN, zF), { w: 2.5, seed: sd + 40 + k, t, amp: 0.5 })); }
          const off = (t * 0.6) % 1;
          for (let k = 0; k < 14; k++) {
            const z = zN * Math.pow(1.38, k + off);
            if (z > zF) break;
            const wv = Math.max(1.5, 5 / Math.sqrt(z));
            LN.push(inkPath([pr(-XW, YF - CAT, z), pr(-XW, YC, z), pr(XW, YC, z), pr(XW, YF, z)], { w: wv, seed: sd + 60 + k, t, smooth: false, amp: 0.6 }));
            const lr = Math.max(3, 34 * u / z);
            LP.push(inkCircle(...pr(XW - 20 * u, YC + 70 * u, z), lr, sd + 80 + k, t, { fill: true }), inkCircle(...pr(-XW + 20 * u, YC + 70 * u, z), lr, sd + 100 + k, t, { fill: true }));
            LG.push(inkCircle(...pr(XW - 20 * u, YC + 70 * u, z), lr * 2.6, sd + 120 + k, t, { fill: true }), inkCircle(...pr(-XW + 20 * u, YC + 70 * u, z), lr * 2.6, sd + 140 + k, t, { fill: true }));
            const ls = pr(0, YF, z), le = pr(0, YF, z * 1.14);
            lane.setAttribute('d', '');
            if (k % 1 === 0) LN.push(inkPath([ls, le], { w: Math.max(2, 16 * u / z), seed: sd + 160 + k, t, amp: 0.3 }));
          }
          LN.push(inkPath(Q(CATX, YF - CAT, zN, zF), { w: 5, seed: sd + 180, t }), inkPath(Q(CATX, YF, zN, zF), { w: 4, seed: sd + 181, t }), inkPath(Q(XW, YF, zN, zF), { w: 5, seed: sd + 182, t }));
          LN.push(inkPath(Q(-XW, YC, zN, zF), { w: 5, seed: sd + 183, t }), inkPath(Q(XW, YC, zN, zF), { w: 5, seed: sd + 184, t }));
          // catwalk railing
          for (let k = 0; k < 10; k++) { const z = zN * Math.pow(1.45, k + (t * 0.6 % 1)); if (z > zF) break; LN.push(inkPath([pr(CATX + 30 * u, YF - CAT, z), pr(CATX + 30 * u, YF - CAT - 220 * u, z)], { w: Math.max(1.5, 4 / Math.sqrt(z)), seed: sd + 190 + k, t })); }
          LN.push(inkPath(Q(CATX + 30 * u, YF - CAT - 220 * u, zN, zF), { w: 4, seed: sd + 199, t }));
          tiles.setAttribute('d', TL.join(' '));
          lines.setAttribute('d', LN.join(' '));
          lamps.setAttribute('d', LP.join(' ')); lampsG.setAttribute('d', LG.join(' '));
          // cars driving away + exhaust puffs behind them
          cars.reset();
          const S = [], C = [], R = [];
          const dens = clamp01((P.haze ?? 0.25) + (P.grow ?? 0.25) * progIO(lt, fu, 2.5) + (P.thick ?? 0.35) * progIO(lt, hit, 1.0));
          const sorted = CARS.map((c, i) => ({ X: c[0] * u, z: c[1] + lt * c[2] * 0.5 * (1 + c[1] * 0.08), i })).sort((a, b) => b.z - a.z);
          sorted.forEach(c => {
            if (c.z > zF * 0.7) return;
            const p = pr(c.X, YF, c.z), s = u / c.z;
            const ex = carRear(cars.B, sd + 300 + c.i * 30, t, p[0], p[1] + Math.sin(t * 9 + c.i) * 1.5, s, cars.cols[c.i % cars.cols.length]);
            for (let k = 0; k < 4; k++) {
              const age = ((t * 0.9 + k * 0.25 + c.i * 0.13) % 1);
              const r = (30 + age * 110) * s * (0.6 + dens);
              S.push(inkCircle(ex[0] - age * 60 * s + Math.sin(t + k) * 10 * s, ex[1] - age * 120 * s, r, sd + 500 + c.i * 10 + k, t, { fill: true, n: 10 }));
            }
          });
          // the haze: big puffs hanging under the ceiling and rolling toward the camera
          const NB = Math.round(6 + dens * 16);
          for (let i = 0; i < NB; i++) {
            const zz = lerp(zN * 1.4, 12, hn(i, 3)) , ph = (t * 0.05 + hn(i, 5)) % 1;
            const z = Math.max(zN * 1.2, zz * (1 - ph * 0.4));
            const X = lerp(-XW * 0.9, XW * 0.9, hn(i, 7)) + Math.sin(t * 0.4 + i) * 60 * u, Y = lerp(YC + 80 * u, YF - 260 * u, hn(i, 9) * (0.4 + dens * 0.6));
            const p = pr(X, Y, z), r = (220 + 160 * hn(i, 11)) * u / z * (0.6 + dens * 0.7);
            (i % 3 ? S : C).push(inkCircle(p[0], p[1], r, sd + 600 + i, t, { fill: true, n: 12, ry: r * 0.7 }));
            if (i % 4 === 0) R.push(inkPath([[p[0] - r * 0.6, p[1] - r * 0.2], [p[0], p[1] - r * 0.55], [p[0] + r * 0.6, p[1] - r * 0.25]], { w: 3, seed: sd + 700 + i, t, amp: 0.8 }));
          }
          fm.soft.setAttribute('fill-opacity', f1(0.28 + dens * 0.3 + hp * 0.1));
          fm.core.setAttribute('fill-opacity', f1(0.12 + dens * 0.3));
          fm.set(S, C, R);
          cars.flush();
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ river cross-section helpers
  function skyline(B, sd, t, x0, x1, base, u, tall) {
    const r = rng(sd), BL = [];
    let x = x0;
    while (x < x1) {
      const w = (50 + r() * 70) * u, h = (tall ? 120 + r() * 300 : 30 + r() * 70) * u;
      const top = base - h;
      B.fill.push(inkLoop(sq(x, top, x + w - 6 * u, base), { seed: sd + Math.round(x), t, smooth: false, amp: 0.6 }));
      BL.push(inkPath([[x, base], [x, top], [x + w - 6 * u, top], [x + w - 6 * u, base]], { w: 3.5, seed: sd + 900 + Math.round(x), t, smooth: false, amp: 0.6 }));
      if (tall && h > 260 * u) BL.push(inkPath([[x + w / 2 - 3 * u, top], [x + w / 2 - 3 * u, top - 40 * u]], { w: 4, seed: sd + 1900 + Math.round(x), t }));
      for (let wy = top + 20 * u; wy < base - 16 * u; wy += 34 * u) for (let wx = x + 12 * u; wx < x + w - 22 * u; wx += 24 * u) if (hn(wx, wy) > 0.45) B.win.push(inkLoop(sq(wx, wy, wx + 9 * u, wy + 14 * u), { seed: sd + Math.round(wx * 3 + wy), t, smooth: false, amp: 0.3 }));
      x += w;
    }
    B.lines.push(...BL);
  }
  function ferry(B, sd, t, x, y, s, face) {
    const T = p => [x + p[0] * s * face, y + p[1] * s], TT = q => q.map(T);
    B.hull.push(inkLoop(TT([[-170, -10], [170, -10], [140, 34], [-140, 34]]), { seed: sd + 1, t, smooth: false, amp: 0.8 }));
    B.cabin.push(inkLoop(TT([[-120, -10], [110, -10], [110, -66], [-120, -66]]), { seed: sd + 2, t, smooth: false, amp: 0.8 }));
    B.dark.push(inkLoop(TT([[-30, -66], [6, -66], [6, -150], [-30, -150]]), { seed: sd + 3, t, smooth: false, amp: 0.8 }));
    B.lines.push(inkPath(TT([[-170, -10], [170, -10], [140, 34], [-140, 34]]), { w: 4, seed: sd + 4, t, closed: true, smooth: false }), inkPath(TT([[-120, -10], [-120, -66], [110, -66], [110, -10]]), { w: 3.5, seed: sd + 5, t, smooth: false }));
    for (let i = 0; i < 6; i++) B.win.push(inkLoop(TT(sq(-100 + i * 34, -52, -82 + i * 34, -30)), { seed: sd + 10 + i, t, smooth: false, amp: 0.3 }));
    return T([-12, -150]);
  }

  // ------------------------------------------------------------------ SHOTS.ht_river
  SH.ht_river = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 523, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'plan';
      const WS = (P.water ?? 0.25) * H, BED = (P.bed ?? 0.44) * H, TY = (P.tube ?? 0.525) * H, TR = 82 * u;
      const BX0 = 0.17 * W, BX1 = 0.83 * W;      // banks: river between them
      const sky = { fill: [], win: [], lines: [] };
      const cityFill = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.55)), cityWin = inkEl(root, mix(INK.paperLight, INK.gold, 0.3)), cityLn = inkEl(root, INK.inkSoft);
      const land = inkEl(root, mix(INK.stain, INK.paperDark, 0.4)), water = inkEl(root, WATER()), waves = inkEl(root, WATER_D()), silt = inkEl(root, SILT()), rock = inkEl(root, ROCK()), strata = inkEl(root, mix(INK.stain, INK.ink, 0.3)), pebbles = inkEl(root, mix(INK.stain, INK.paperLight, 0.35));
      const boulF = inkEl(root, mix(INK.inkSoft, INK.ink, 0.15)), boulL = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.25)), boulR = inkEl(root);
      const tubeF = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.3)), ductF = inkEl(root, mix(INK.blue, INK.paperLight, 0.6)), ductT = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4)), road = inkEl(root, ROAD_D());
      const towersG = el(root, 'g'), tw = inkEl(towersG, BRICK()), twD = inkEl(towersG, BRICK_D()), twL = inkEl(towersG), fanF = inkEl(towersG, INK.paperLight), fanL = inkEl(towersG);
      const cars = carBuckets(root), fm = fumes(root, 0.5);
      const shipB = { hull: [], cabin: [], dark: [], lines: [], win: [] };
      const shipE = { hull: inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), cabin: inkEl(root, INK.paperLight), dark: inkEl(root, INK.red), win: inkEl(root, mix(INK.blue, INK.paperLight, 0.3)), lines: inkEl(root) };
      const smoke = fumes(root, 0.5);
      const dash = inkEl(root, INK.red), lines = inkEl(root);
      const arrF = inkEl(root, INK.blue), arrB = inkEl(root, INK.red);
      const sw = mode === 'air' ? stopwatch(el(root, 'g'), sd + 800) : null;
      const LB = labels(root, P.labels, W, H);
      const r0 = rng(sd + 3), PB = Array.from({ length: 70 }, () => ({ x: r0(), y: r0(), r: lerp(5, 15, r0()) }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), hp = punch(lt, hit, 0.7);
          // skylines: New Jersey low (left), Manhattan tall (right)
          sky.fill = []; sky.win = []; sky.lines = [];
          skyline(sky, sd + 10, t, -20, BX0 + 40 * u, WS - 40 * u, u, false);
          skyline(sky, sd + 30, t, BX1 - 40 * u, W + 20, WS - 40 * u, u, true);
          cityFill.setAttribute('d', sky.fill.join(' ')); cityWin.setAttribute('d', sky.win.join(' ')); cityLn.setAttribute('d', sky.lines.join(' '));
          // banks (piers / land) down to the riverbed
          const L1 = [[-20, WS - 40 * u], [BX0 + 30 * u, WS - 40 * u], [BX0, BED], [-20, BED]], L2 = [[W + 20, WS - 40 * u], [BX1 - 30 * u, WS - 40 * u], [BX1, BED], [W + 20, BED]];
          land.setAttribute('d', inkLoop(L1, { seed: sd + 50, t, smooth: false, amp: 0.6 }) + ' ' + inkLoop(L2, { seed: sd + 51, t, smooth: false, amp: 0.6 }));
          // water with moving waves
          const WT = []; for (let i = 0; i <= 14; i++) WT.push([lerp(BX0 + 20 * u, BX1 - 20 * u, i / 14), WS + Math.sin(i * 1.3 + t * 2) * 6 * u]);
          water.setAttribute('d', inkLoop(WT.concat([[BX1, BED + 10 * u], [BX0, BED + 10 * u]]), { seed: sd + 52, t, smooth: false, amp: 0.6 }));
          const WV = []; for (let k = 0; k < 5; k++) for (let i = 0; i < 5; i++) { const x = lerp(BX0 + 60 * u, BX1 - 60 * u, (i + 0.5 * (k % 2) + (t * 0.05) % 1) / 5), y = WS + (50 + k * 50) * u; if (x < BX1 - 40 * u) WV.push(inkPath([[x - 26 * u, y], [x, y - 8 * u], [x + 26 * u, y]], { w: 4, seed: sd + 60 + k * 5 + i, t })); }
          waves.setAttribute('d', WV.join(' '));
          // riverbed silt, then rock to the bottom
          const BT = []; for (let i = 0; i <= 12; i++) BT.push([i / 12 * (W + 40) - 20, BED + Math.sin(i * 1.7) * 8 * u]);
          silt.setAttribute('d', inkLoop(BT.concat([[W + 20, H + 20], [-20, H + 20]]), { seed: sd + 70, t, smooth: false, amp: 0.6 }));
          const RK = []; for (let i = 0; i <= 12; i++) RK.push([i / 12 * (W + 40) - 20, 0.72 * H + Math.sin(i * 2.1) * 26 * u]);
          rock.setAttribute('d', inkLoop(RK.concat([[W + 20, H + 20], [-20, H + 20]]), { seed: sd + 71, t, smooth: false, amp: 0.6 }));
          const SL = []; for (let k = 0; k < 8; k++) { const yy = 0.74 * H + k * 0.034 * H; SL.push(inkPath(Array.from({ length: 9 }, (_, i) => [i / 8 * (W + 40) - 20, yy + Math.sin(i * 1.4 + k) * 12 * u]), { w: 5 * u + 2, seed: sd + 80 + k, t })); }
          strata.setAttribute('d', SL.join(' '));
          pebbles.setAttribute('d', PB.map((q, i) => inkCircle(q.x * W, BED + 30 * u + q.y * (0.72 * H - BED - 40 * u), q.r * u, sd + 100 + i, t, { fill: true, n: 6 })).join(' ') + ' ' +
            PB.slice(0, 30).map((q, i) => inkCircle(q.y * W, 0.75 * H + q.x * 0.24 * H, q.r * 1.6 * u, sd + 200 + i, t, { fill: true, n: 7 })).join(' '));
          // foreground bedrock: big dark boulders with lit tops, the frame bottom is never empty
          const BF = [], BLt = [], BRr = [];
          for (let i = 0; i < 9; i++) {
            const bx = (i - 0.3 + 0.4 * hn(i, 21)) / 7.6 * W, by = 0.79 * H + (i % 2) * 0.08 * H + hn(i, 22) * 0.04 * H, br = (120 + 70 * hn(i, 23)) * u;
            const pts = [[bx - br, by + br * 0.5], [bx - br * 0.8, by - br * 0.35], [bx - br * 0.2, by - br * 0.62], [bx + br * 0.6, by - br * 0.45], [bx + br, by + br * 0.1], [bx + br * 0.7, by + br * 0.7], [bx - br * 0.5, by + br * 0.75]];
            BF.push(inkLoop(pts, { seed: sd + 2000 + i, t, amp: 0.8 }));
            BLt.push(inkLoop([pts[1], pts[2], pts[3], [bx + br * 0.3, by - br * 0.2], [bx - br * 0.5, by - br * 0.1]], { seed: sd + 2020 + i, t, amp: 0.8 }));
            BRr.push(inkPath(pts, { w: 6, seed: sd + 2040 + i, t, closed: true }));
            for (let k = 0; k < 3; k++) BRr.push(inkPath([[bx - br * 0.4 + k * br * 0.3, by + br * 0.1], [bx - br * 0.2 + k * br * 0.3, by + br * 0.55]], { w: 3, seed: sd + 2060 + i * 3 + k, t }));
          }
          boulF.setAttribute('d', BF.join(' ')); boulL.setAttribute('d', BLt.join(' ')); boulR.setAttribute('d', BRr.join(' '));
          const LN = [inkPath(WT, { w: 6, seed: sd + 300, t }), inkPath(BT, { w: 6, seed: sd + 301, t }), inkPath(RK, { w: 5, seed: sd + 302, t })];
          LN.push(inkPath(L1.slice(1, 3), { w: 5, seed: sd + 303, t }), inkPath(L2.slice(1, 3), { w: 5, seed: sd + 304, t }));
          // the tube: from a shaft on each bank down under the riverbed
          const TX0 = 0.06 * W, TX1 = 0.94 * W;
          const top = TY - TR, bot = TY + TR;
          const tubeOn = mode !== 'plan';
          const draw = mode === 'plan' ? progIO(lt, atOr(cues, 'road', dur * 0.45), 1.6) : 1;
          // shaft paths
          const centre = [[TX0, WS - 60 * u], [TX0, TY - 60 * u], [TX0 + 60 * u, TY], [TX1 - 60 * u, TY], [TX1, TY - 60 * u], [TX1, WS - 60 * u]];
          if (tubeOn) {
            tubeF.setAttribute('d', inkLoop(sq(TX0 + 40 * u, top, TX1 - 40 * u, bot), { seed: sd + 310, t, smooth: false, amp: 0.6 }));
            ductF.setAttribute('d', inkLoop(sq(TX0 + 40 * u, bot - 38 * u, TX1 - 40 * u, bot), { seed: sd + 311, t, smooth: false, amp: 0.5 }));
            ductT.setAttribute('d', inkLoop(sq(TX0 + 40 * u, top, TX1 - 40 * u, top + 30 * u), { seed: sd + 312, t, smooth: false, amp: 0.5 }));
            road.setAttribute('d', inkLoop(sq(TX0 + 40 * u, bot - 46 * u, TX1 - 40 * u, bot - 38 * u), { seed: sd + 313, t, smooth: false, amp: 0.3 }));
            LN.push(inkPath(sq(TX0 + 40 * u, top, TX1 - 40 * u, bot), { w: 7, seed: sd + 314, t, closed: true, smooth: false }));
            for (let k = 1; k < 16; k++) { const x = lerp(TX0 + 40 * u, TX1 - 40 * u, k / 16); LN.push(inkPath([[x, top], [x, top + 30 * u]], { w: 2.5, seed: sd + 320 + k, t }), inkPath([[x, bot - 38 * u], [x, bot]], { w: 2.5, seed: sd + 340 + k, t })); }
            dash.setAttribute('d', '');
          } else {
            [tubeF, ductF, ductT, road].forEach(e => e.setAttribute('d', ''));
            // dashed planned tube drawing itself left to right
            const D = [], segs = 40;
            for (let i = 0; i < segs; i++) {
              if (i / segs > draw) break;
              const a = i / segs, b = Math.min(draw, (i + 1) / segs);
              const xa = lerp(TX0 + 40 * u, TX1 - 40 * u, a), xb = lerp(TX0 + 40 * u, TX1 - 40 * u, b);
              D.push(inkPath([[xa, top], [xb, top]], { w: 14, seed: sd + 360 + i, t }), inkPath([[xa, bot], [xb, bot]], { w: 14, seed: sd + 400 + i, t }));
            }
            if (draw > 0.02) { const xe = lerp(TX0 + 40 * u, TX1 - 40 * u, draw); tubeF.setAttribute('d', inkLoop(sq(TX0 + 40 * u, top + 4, xe, bot - 4), { seed: sd + 450, t, smooth: false, amp: 0.4 })); D.push(inkPath([[TX0 + 40 * u, top], [TX0 + 40 * u, bot]], { w: 14, seed: sd + 451, t })); if (draw > 0.98) D.push(inkPath([[TX1 - 40 * u, top], [TX1 - 40 * u, bot]], { w: 14, seed: sd + 452, t })); }
            dash.setAttribute('d', D.join(' '));
          }
          // towers + fans (air mode)
          if (mode === 'air') {
            const TWL = [], TWF = [], TWD = [], FF = [], FL = [];
            [[0.02 * W, 0.2 * W], [0.8 * W, 0.98 * W]].forEach(([a, b], i) => {
              const ttop = 0.07 * H, base = WS - 40 * u;
              TWF.push(inkLoop(sq(a, ttop, b, base), { seed: sd + 450 + i, t, smooth: false, amp: 0.6 }));
              TWL.push(inkPath(sq(a, ttop, b, base), { w: 6, seed: sd + 452 + i, t, closed: true, smooth: false }));
              for (let k = 1; k < 9; k++) TWL.push(inkPath([[a, ttop + k * (base - ttop) / 9], [b, ttop + k * (base - ttop) / 9]], { w: 2, seed: sd + 460 + i * 10 + k, t }));
              TWD.push(inkLoop(sq(a + 20 * u, ttop - 40 * u, b - 20 * u, ttop), { seed: sd + 480 + i, t, smooth: false, amp: 0.5 }));
              // shaft down to the tube
              TWD.push(inkLoop(sq((a + b) / 2 - 34 * u, base, (a + b) / 2 + 34 * u, TY), { seed: sd + 482 + i, t, smooth: false, amp: 0.4 }));
              const fx = (a + b) / 2, fy = ttop + (base - ttop) * 0.55, fr = 58 * u;
              FF.push(inkCircle(fx, fy, fr, sd + 490 + i, t, { fill: true }));
              FL.push(inkCircle(fx, fy, fr, sd + 492 + i, t, { w: 6 }));
              const sp = t * 7 * (i ? -1 : 1);
              for (let k = 0; k < 6; k++) { const q = sp + k * TAU / 6; FL.push(inkLoop([[fx, fy], [fx + Math.cos(q) * fr * 0.9, fy + Math.sin(q) * fr * 0.9], [fx + Math.cos(q + 0.5) * fr * 0.8, fy + Math.sin(q + 0.5) * fr * 0.8]], { seed: sd + 494 + k + i * 6, t, smooth: false, amp: 0.3 })); }
            });
            tw.setAttribute('d', TWF.join(' ')); twD.setAttribute('d', TWD.join(' ')); twL.setAttribute('d', TWL.join(' ')); fanF.setAttribute('d', FF.join(' ')); fanL.setAttribute('d', FL.join(' '));
            // arrows: fresh (blue) down left shaft, along the bottom duct, up through the road; foul (red) up into the top duct and out the right tower
            const AF = [], AB = [], ph = (t * 0.7) % 1;
            const arrow = (arr, a, b, k, sz) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L; arr.push(inkPath([a, b], { w: 16 * u, seed: sd + 600 + k, t }), inkLoop([[b[0] + ux * sz, b[1] + uy * sz], [b[0] - uy * sz * 0.7, b[1] + ux * sz * 0.7], [b[0] + uy * sz * 0.7, b[1] - ux * sz * 0.7]], { seed: sd + 700 + k, t, smooth: false, amp: 0.4 })); };
            const lx = 0.11 * W, rx = 0.89 * W;
            for (let k = 0; k < 3; k++) { const y0 = lerp(0.12 * H, TY - 40 * u, (k + ph) / 3); arrow(AF, [lx, y0], [lx, y0 + 40 * u], k, 34 * u); }
            for (let k = 0; k < 7; k++) { const x0 = lerp(0.16 * W, 0.84 * W, (k + ph) / 7); arrow(AF, [x0, bot - 19 * u], [x0 + 44 * u, bot - 19 * u], 10 + k, 26 * u); }
            for (let k = 0; k < 6; k++) { const x0 = lerp(0.2 * W, 0.8 * W, k / 5), yy = lerp(bot - 46 * u, top + 34 * u, (ph + k * 0.17) % 1); arrow(k % 2 ? AB : AF, [x0, yy + 30 * u], [x0, yy], 20 + k, 24 * u); }
            for (let k = 0; k < 7; k++) { const x0 = lerp(0.16 * W, 0.84 * W, (k + ph) / 7); arrow(AB, [x0, top + 15 * u], [x0 + 44 * u, top + 15 * u], 30 + k, 26 * u); }
            for (let k = 0; k < 3; k++) { const y0 = lerp(TY - 40 * u, 0.12 * H, (k + ph) / 3); arrow(AB, [rx, y0], [rx, y0 - 40 * u], 40 + k, 34 * u); }
            const go = clamp01(lin(lt, 0.1, 0.6));
            arrF.setAttribute('fill-opacity', f1(go)); arrB.setAttribute('fill-opacity', f1(go));
            arrF.setAttribute('d', AF.join(' ')); arrB.setAttribute('d', AB.join(' '));
            // puffs out of the right tower top
            const S = [], C = [];
            for (let k = 0; k < 6; k++) { const a = (t * 0.5 + k / 6) % 1; S.push(inkCircle(0.89 * W - a * 120 * u, 0.06 * H - a * 160 * u, (24 + a * 50) * u, sd + 720 + k, t, { fill: true, n: 9 })); }
            smoke.set(S, C);
            const ca = atOr(cues, 'clock', dur * 0.8), sec = Math.min(90, Math.round(90 * progIO(lt, 0.2, Math.max(0.6, ca - 0.2))));
            sw.update(t, 0.5 * W, 0.17 * H, 120 * u * (1 + 0.1 * punch(lt, ca, 0.7)), sec / 90, String(sec));
          } else { [tw, twD, twL, fanF, fanL, arrF, arrB].forEach(e => e.setAttribute('d', '')); }
          // ferries (plan) / cars inside the tube (fumes, air)
          shipB.hull = []; shipB.cabin = []; shipB.dark = []; shipB.lines = []; shipB.win = [];
          cars.reset();
          const SS = [], SC = [], SR = [];
          if (mode === 'plan') {
            const FR = P.ferries || [[0.3, 1, 0.7], [0.55, -1, 0.75], [0.72, 1, 0.65], [0.44, 1, 0.55]];
            FR.forEach((f, i) => {
              const x = (f[0] + Math.sin(t * 0.25 + i) * 0.03) * W, y = WS + 8 * u + Math.sin(t * 2 + i) * 4 * u + (i === 3 ? -40 * u : 0);
              const st = ferry(shipB, sd + 1000 + i * 30, t, x, y, f[2] * u, f[1]);
              for (let k = 0; k < 4; k++) { const a = (t * 0.6 + k / 4 + i * 0.2) % 1; SS.push(inkCircle(st[0] - a * 90 * u * f[1], st[1] - a * 150 * u, (14 + a * 40) * u, sd + 1200 + i * 10 + k, t, { fill: true, n: 9 })); }
            });
          } else {
            const n = 9, sp = mode === 'air' ? 0.09 : 0.06;
            for (let i = 0; i < n; i++) {
              const ph = ((i + 0.3 * hn(i, 2)) / n + lt * sp) % 1, x = lerp(TX0 + 70 * u, TX1 - 40 * u, ph);
              const ex = carSide(cars.B, sd + 1300 + i * 40, t, x, bot - 46 * u, 0.3 * u, 1, cars.cols[i % 4], -lt * 2 - i);
              if (mode === 'fumes') {
                const fu = atOr(cues, 'fume', dur * 0.2);
                for (let k = 0; k < 3; k++) { const a = (t * 0.8 + k / 3 + i * 0.1) % 1; SS.push(inkCircle(ex[0] - a * 50 * u, ex[1] - a * 30 * u, (6 + a * 18) * u, sd + 1500 + i * 5 + k, t, { fill: true, n: 8 })); }
                const dens = progIO(lt, Math.min(fu, 0.4), 2.4);
                for (let k = 0; k < 14; k++) {
                  const x2 = lerp(TX0 + 60 * u, TX1 - 60 * u, (k + 0.5) / 14) + Math.sin(t * 0.7 + k) * 20 * u, r = (34 + 26 * hn(k, 4)) * u * dens;
                  if (r > 2) (k % 2 ? SS : SC).push(inkCircle(x2, TY - 20 * u + Math.sin(t + k * 2) * 10 * u, r, sd + 1600 + k, t, { fill: true, n: 10 }));
                }
              }
            }
          }
          ['hull', 'cabin', 'dark', 'win', 'lines'].forEach(k => shipE[k].setAttribute('d', shipB[k].join(' ')));
          if (mode !== 'air') smoke.set(mode === 'plan' ? SS : [], [], []);
          fm.set(mode === 'fumes' ? SS : [], mode === 'fumes' ? SC : [], SR);
          fm.soft.setAttribute('fill-opacity', f1(0.7 + 0.2 * hp)); fm.core.setAttribute('fill-opacity', f1(0.65 + 0.2 * hp));
          cars.flush();
          lines.setAttribute('d', LN.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ht_mine
  SH.ht_mine = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 733, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'enter';
      const close = mode === 'blood';
      const VX = 0.5 * W, VY = 0.42 * H, GY = 0.69 * H;
      const rockF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.5)), rockD = inkEl(root, mix(INK.inkSoft, INK.ink, 0.15)), floor = inkEl(root, mix(INK.stain, INK.paperDark, 0.35));
      const timber = inkEl(root, WOOD()), timberD = inkEl(root, WOOD_D());
      const tun = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.45)), tunD = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2));
      const lampG = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), lampC = inkEl(root, INK.gold);
      const cars = carBuckets(root), fm = fumes(root, 0.45);
      const sign = [inkEl(root, INK.paperLight), inkEl(root)];
      const signT = el(root, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, 'font-size': 48 * u, fill: INK.ink });
      const people = [0, 1, 2].map(i => window.LH.person(el(root, 'g'), sd + 20 + i * 5, { kind: 'sweater', col: [mix(INK.blue, INK.paperLight, 0.3), mix(INK.green, INK.paperLight, 0.35), mix(INK.inkSoft, INK.paperLight, 0.25)][i], hair: 'dark', glasses: i === 1 }));
      const doc = close ? window.LH.person(el(root, 'g'), sd + 60, { kind: 'lab', hair: 'white', glasses: true }) : null;
      const stool = inkEl(root, WOOD_D());
      const vial = [inkEl(root, INK.paperLight), inkEl(root, INK.red), inkEl(root)];
      const gauge = [inkEl(root, INK.paperLight), inkEl(root, INK.red, { 'fill-opacity': 0.5 }), inkEl(root), inkEl(root, INK.red)];
      const gT = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 52 * u, fill: INK.ink });
      const rails = inkEl(root, STEEL()), sleepers = inkEl(root, WOOD_D()), lines = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), hp = punch(lt, hit, 0.7);
          // rock walls and floor
          rockF.setAttribute('d', inkLoop(sq(-20, -20, W + 20, GY + 10 * u), { seed: sd + 1, t, smooth: false, amp: 0.4 }));
          const RD = []; for (let i = 0; i < 40; i++) { const x = hn(i, 1) * W, y = hn(i, 2) * GY; RD.push(inkLoop([[x, y], [x + 60 * u, y + 10 * u], [x + 40 * u, y + 46 * u], [x - 10 * u, y + 30 * u]], { seed: sd + 10 + i, t, amp: 1 })); }
          rockD.setAttribute('d', RD.join(' '));
          floor.setAttribute('d', inkLoop(sq(-20, GY, W + 20, H + 20), { seed: sd + 2, t, smooth: false, amp: 0.4 }));
          // timber sets receding (posts + cap) in front of the rock, framing the gallery
          const TM = [], TD = [], LN = [];
          const pr = (X, Y, z) => [VX + X / z, VY + Y / z];
          const XW = 620 * u, YT = -560 * u, YB = (GY - VY);
          for (let k = 5; k >= 0; k--) {
            const z = 0.85 * Math.pow(1.5, k), ww = 46 * u / z;
            const a = pr(-XW, YT, z), b = pr(XW, YT, z), c = pr(XW, YB, z), d = pr(-XW, YB, z);
            if (close && k < 1) continue;
            TM.push(inkLoop(sq(a[0] - ww, a[1], a[0] + ww, d[1]), { seed: sd + 100 + k, t, smooth: false, amp: 0.6 }), inkLoop(sq(b[0] - ww, b[1], b[0] + ww, c[1]), { seed: sd + 110 + k, t, smooth: false, amp: 0.6 }), inkLoop(sq(a[0] - ww * 1.6, a[1] - ww * 1.4, b[0] + ww * 1.6, a[1] + ww * 0.6), { seed: sd + 120 + k, t, smooth: false, amp: 0.6 }));
            LN.push(inkPath([[a[0] - ww * 1.6, a[1] + ww * 0.6], [b[0] + ww * 1.6, a[1] + ww * 0.6]], { w: Math.max(2, 5 / Math.sqrt(z)), seed: sd + 130 + k, t }));
            LN.push(inkPath([[a[0] + ww, a[1] + ww], [a[0] + ww, d[1]]], { w: Math.max(2, 4 / Math.sqrt(z)), seed: sd + 140 + k, t }), inkPath([[b[0] - ww, b[1] + ww], [b[0] - ww, c[1]]], { w: Math.max(2, 4 / Math.sqrt(z)), seed: sd + 150 + k, t }));
            TD.push(inkPath([[a[0] - ww * 0.3, a[1] + 40 * u / z], [a[0] - ww * 0.3, d[1] - 20 * u / z]], { w: ww * 0.5, seed: sd + 160 + k, t }));
            // hanging miner's lamp on each cap
            const lp = [(a[0] + b[0]) / 2 + (k % 2 ? 1 : -1) * 120 * u / z, a[1] + 70 * u / z], lr = 16 * u / z + 2;
            const fl = 0.85 + 0.15 * Math.sin(t * 6 + k);
            TD.push(inkPath([[lp[0], a[1] + ww * 0.6], [lp[0], lp[1] - lr]], { w: 2.5, seed: sd + 170 + k, t }));
            LN.push(inkCircle(lp[0], lp[1], lr * 1.1, sd + 180 + k, t, { w: 3 }));
            lampC.setAttribute('fill-opacity', f1(fl));
          }
          const LPc = [], LPg = [];
          for (let k = 5; k >= 0; k--) { const z = 0.85 * Math.pow(1.5, k), a = pr(-XW, YT, z), b = pr(XW, YT, z), lp = [(a[0] + b[0]) / 2 + (k % 2 ? 1 : -1) * 120 * u / z, a[1] + 70 * u / z], lr = 16 * u / z + 2; if (close && k < 1) continue; LPc.push(inkCircle(lp[0], lp[1], lr, sd + 190 + k, t, { fill: true })); LPg.push(inkCircle(lp[0], lp[1], lr * 3.2, sd + 200 + k, t, { fill: true })); }
          lampC.setAttribute('d', LPc.join(' ')); lampG.setAttribute('d', LPg.join(' '));
          timber.setAttribute('d', TM.join(' ')); timberD.setAttribute('d', TD.join(' '));
          // the concrete test tunnel mouth at the end of the gallery, a car idling inside
          const cx = close ? 0.84 * W : 0.5 * W, cy = close ? 0.45 * H : 0.53 * H, R = (close ? 165 : 260) * u;
          tun.setAttribute('d', inkCircle(cx, cy, R, sd + 300, t, { fill: true }));
          tunD.setAttribute('d', inkCircle(cx, cy + 10 * u, R * 0.8, sd + 301, t, { fill: true }));
          LN.push(inkCircle(cx, cy, R, sd + 302, t, { w: 7 }), inkCircle(cx, cy + 10 * u, R * 0.8, sd + 303, t, { w: 4 }));
          cars.reset();
          const S = [], C = [];
          const cs = (close ? 0.75 : 0.95) * u, shake = Math.sin(t * 30) * 2 * u;
          const ex = carSide(cars.B, sd + 400, t, cx + 20 * u, cy + R * 0.62 + shake, cs, -1, cars.cols[1], 0);
          // exhaust: heavy at the tail, rolling out of the tunnel mouth
          const exP = [cx + 20 * u + 158 * cs, cy + R * 0.62 - 36 * cs];
          for (let k = 0; k < 9; k++) { const a = (t * 0.45 + k / 9) % 1; const r = (18 + a * 110) * u; (k % 3 ? S : C).push(inkCircle(exP[0] + a * 230 * u, exP[1] - a * 300 * u + Math.sin(t + k) * 14 * u, r, sd + 420 + k, t, { fill: true, n: 10 })); }
          fm.set(S, C, []);
          // sign over the tunnel
          if (!close) {
            const sx = cx, sy = cy - R - 70 * u, sw2 = 300 * u, sh = 74 * u;
            sign[0].setAttribute('d', inkLoop(sq(sx - sw2 / 2, sy - sh / 2, sx + sw2 / 2, sy + sh / 2), { seed: sd + 450, t, smooth: false, amp: 0.8 }));
            sign[1].setAttribute('d', inkPath(sq(sx - sw2 / 2, sy - sh / 2, sx + sw2 / 2, sy + sh / 2), { w: 5, seed: sd + 451, t, closed: true, smooth: false }) + ' ' + inkPath([[sx - sw2 * 0.3, sy - sh / 2], [sx - sw2 * 0.3, sy - sh / 2 - 60 * u]], { w: 4, seed: sd + 452, t }) + ' ' + inkPath([[sx + sw2 * 0.3, sy - sh / 2], [sx + sw2 * 0.3, sy - sh / 2 - 60 * u]], { w: 4, seed: sd + 453, t }));
            signT.setAttribute('x', f1(sx)); signT.setAttribute('y', f1(sy + 16 * u)); signT.textContent = P.sign || 'TEST TUNNEL';
          } else { sign.forEach(e => e.setAttribute('d', '')); signT.textContent = ''; }
          // rails and sleepers in the foreground down to the frame bottom
          const RL = [], SP = [];
          const rp = (X, z) => [VX + X / z, GY + (H * 0.62) / z - H * 0.0];
          for (let k = 0; k < 9; k++) { const z = 0.55 + k * 0.45 + ((t * 0) % 1); const a = [VX - 380 * u / z, GY + 300 * u / z], b = [VX + 380 * u / z, GY + 300 * u / z]; if (a[1] < GY + 10 * u) break; SP.push(inkLoop([[a[0], a[1] - 18 * u / z], [b[0], b[1] - 18 * u / z], [b[0], b[1] + 18 * u / z], [a[0], a[1] + 18 * u / z]], { seed: sd + 500 + k, t, smooth: false, amp: 0.6 })); }
          [-240, 240].forEach((X, i) => { RL.push(inkPath([[VX + X * u / 0.5, GY + 300 * u / 0.5], [VX + X * u / 6, GY + 300 * u / 6]], { w: 14 * u, seed: sd + 540 + i, t, taper: 0.1 })); });
          sleepers.setAttribute('d', SP.join(' ')); rails.setAttribute('d', RL.join(' '));
          void rp;
          // people
          const ps = (close ? 1.25 : 0.95) * u;
          if (!close) {
            const wa = atOr(cues, 'walk', dur * 0.3);
            people.forEach((pp, i) => {
              const a = progIO(lt, wa + i * 0.25, 1.8), x = lerp(W + 140 * u + i * 160 * u, (0.12 + i * 0.13) * W + 120 * u, a) ;
              const bob = Math.abs(Math.sin(t * 7 + i)) * 8 * u * (a > 0 && a < 1 ? 1 : 0);
              pp.update(t, x, GY + (60 + i * 30 + (P.walk_dy ?? 0)) * u - bob, ps * (1 - i * 0.08), { face: 1, lean: 4, look: [2, -2], brow: 0.4 });
            });
            [doc].forEach(() => {});
            stool.setAttribute('d', ''); vial.forEach(e => e.setAttribute('d', '')); gauge.forEach(e => e.setAttribute('d', '')); gT.textContent = '';
          } else {
            const bl = atOr(cues, 'blood', dur * 0.4), fill = progIO(lt, bl - 0.7, 1.0);
            // seated volunteer (left), doctor standing (centre) holding the vial up
            const sx = 0.22 * W, seatY = GY + 40 * u;
            stool.setAttribute('d', inkLoop(sq(sx - 80 * u, seatY, sx + 80 * u, seatY + 24 * u), { seed: sd + 600, t, smooth: false, amp: 0.6 }) + ' ' + inkPath([[sx - 60 * u, seatY + 20 * u], [sx - 70 * u, GY + 230 * u]], { w: 14 * u, seed: sd + 601, t }) + ' ' + inkPath([[sx + 60 * u, seatY + 20 * u], [sx + 70 * u, GY + 230 * u]], { w: 14 * u, seed: sd + 602, t }));
            people[0].update(t, sx, GY + 230 * u, ps, { face: 1, seat: seatY, look: [4, -4], brow: 0.6, armR: [sx + 150 * u, seatY - 160 * u] });
            people[1].update(t, -999, -999, 0.01, {}); people[2].update(t, -999, -999, 0.01, {});
            const dx = 0.52 * W, dy = GY + 260 * u;
            const lift = progIO(lt, 0.05, 0.7);
            const hand = [dx - 150 * u, lerp(dy - 560 * u, dy - 760 * u, lift)];
            const o = doc.update(t, dx, dy, ps, { face: -1, armR: hand, armL: [sx + 170 * u, seatY - 150 * u], look: [-4, -8 * lift], brow: 0.2 + 0.6 * lift });
            const vh = 200 * u, vw = 56 * u, vx = o.hR[0], vy = o.hR[1] - vh * 0.75;
            const vp = sq(vx - vw / 2, vy, vx + vw / 2, vy + vh);
            vial[0].setAttribute('d', inkLoop(vp, { seed: sd + 610, t, smooth: false, amp: 0.4 }));
            vial[1].setAttribute('d', fill > 0.02 ? inkLoop(sq(vx - vw / 2 + 4, vy + vh * (1 - 0.8 * fill), vx + vw / 2 - 4, vy + vh - 4), { seed: sd + 611, t, smooth: false, amp: 0.3 }) : '');
            vial[2].setAttribute('d', inkPath(vp, { w: 5, seed: sd + 612, t, closed: true, smooth: false }) + ' ' + inkPath([[vx - vw / 2 - 8 * u, vy], [vx + vw / 2 + 8 * u, vy]], { w: 9, seed: sd + 613, t }));
            // gauge on the wall: needle climbs with the fumes
            const gx = 0.8 * W, gy = 0.2 * H, gr = 110 * u * (1 + 0.08 * hp);
            const needle = lerp(-2.4, -0.3, progIO(lt, 0.2, dur * 0.8)) + Math.sin(t * 5) * 0.03;
            gauge[0].setAttribute('d', inkCircle(gx, gy, gr, sd + 620, t, { fill: true }));
            const ZN = [[gx, gy]]; for (let i = 0; i <= 10; i++) { const q = lerp(-0.9, -0.15, i / 10); ZN.push([gx + Math.cos(q) * gr * 0.88, gy + Math.sin(q) * gr * 0.88]); }
            gauge[1].setAttribute('d', inkLoop(ZN, { seed: sd + 621, t, smooth: false, amp: 0.3 }));
            const GL = [inkCircle(gx, gy, gr, sd + 622, t, { w: 7 })]; for (let i = 0; i <= 8; i++) { const q = lerp(-2.6, -0.15, i / 8); GL.push(inkPath([[gx + Math.cos(q) * gr * 0.74, gy + Math.sin(q) * gr * 0.74], [gx + Math.cos(q) * gr * 0.9, gy + Math.sin(q) * gr * 0.9]], { w: 4, seed: sd + 630 + i, t, amp: 0.3 })); }
            GL.push(inkPath([[gx, gy], [gx, gy + gr + 120 * u]], { w: 5, seed: sd + 640, t }));   // pipe down the wall
            gauge[2].setAttribute('d', GL.join(' '));
            gauge[3].setAttribute('d', inkPath([[gx, gy], [gx + Math.cos(needle) * gr * 0.8, gy + Math.sin(needle) * gr * 0.8]], { w: 8, seed: sd + 641, t, amp: 0.3 }) + ' ' + inkDot(gx, gy, 10 * u, 10 * u, sd + 642, t));
            gT.setAttribute('x', f1(gx)); gT.setAttribute('y', f1(gy + gr * 0.62)); gT.textContent = 'CO';
          }
          lines.setAttribute('d', LN.join(' '));
          cars.flush();
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ht_fan
  SH.ht_fan = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 877, root = el(svg, 'g'), u = W / 1080;
      const wall = inkEl(root, BRICK()), wallD = inkEl(root, BRICK_D()), win = inkEl(root, mix(INK.paperLight, INK.blue, 0.2)), winL = inkEl(root);
      const floorF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4)), grate = inkEl(root, mix(INK.inkSoft, INK.ink, 0.3));
      const backF = inkEl(root, mix(STEEL(), INK.paperLight, 0.35)), backL = inkEl(root, INK.inkSoft);
      const house = inkEl(root, STEEL()), houseD = inkEl(root, mix(STEEL(), INK.ink, 0.35)), wheel = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.3)), blades = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2));
      const motor = inkEl(root, mix(INK.green, INK.ink, 0.3)), rivets = inkEl(root, mix(INK.paperLight, INK.gold, 0.3)), lines = inkEl(root), wind = inkEl(root, INK.blue, { 'fill-opacity': 0.8 });
      const num = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, fill: INK.red, stroke: INK.paperLight, 'stroke-width': 16 * u, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, cnt = atOr(cues, 'count', dur * 0.7), hp = punch(lt, cnt, 0.7);
          const GY = 0.62 * H;
          wall.setAttribute('d', inkLoop(sq(-20, -20, W + 20, GY), { seed: sd + 1, t, smooth: false, amp: 0.4 }));
          const BR = []; for (let r = 0; r < 26; r++) { const y = r * 46 * u; if (y > GY) break; BR.push(inkPath([[-20, y], [W + 20, y]], { w: 2, seed: sd + 10 + r, t, amp: 0.6 })); for (let c = 0; c < 9; c++) { const x = (c + (r % 2) * 0.5) * 130 * u; BR.push(inkPath([[x, y], [x, y + 46 * u]], { w: 2, seed: sd + 40 + r * 10 + c, t, amp: 0.4 })); } }
          wallD.setAttribute('d', BR.join(' '));
          // tall arched windows
          const WN = [], WL = [];
          (P.windows || [0.14, 0.86]).forEach((fx, i) => { const x = fx * W, pts = [[x - 70 * u, 0.36 * H], [x - 70 * u, 0.14 * H], [x, 0.09 * H], [x + 70 * u, 0.14 * H], [x + 70 * u, 0.36 * H]]; WN.push(inkLoop(pts, { seed: sd + 200 + i, t, amp: 0.6 })); WL.push(inkPath(pts, { w: 6, seed: sd + 202 + i, t, closed: true }), inkPath([[x, 0.1 * H], [x, 0.36 * H]], { w: 3, seed: sd + 204 + i, t }), inkPath([[x - 70 * u, 0.25 * H], [x + 70 * u, 0.25 * H]], { w: 3, seed: sd + 206 + i, t })); });
          win.setAttribute('d', WN.join(' ')); winL.setAttribute('d', WL.join(' '));
          // a row of more fan housings receding behind
          const BF = [], BL = [];
          for (let k = 0; k < 5; k++) {
            const s = 0.42 - k * 0.06, x = (0.86 - k * 0.11) * W, y = GY - 20 * u * (1 - k * 0.15);
            const r = 300 * s * u;
            BF.push(inkCircle(x, y - r * 1.1, r, sd + 300 + k, t, { fill: true }), inkLoop(sq(x - r, y - r * 1.1, x + r * 0.2, y), { seed: sd + 310 + k, t, smooth: false, amp: 0.5 }));
            BL.push(inkCircle(x, y - r * 1.1, r, sd + 320 + k, t, { w: 4 }), inkCircle(x, y - r * 1.1, r * 0.4, sd + 330 + k, t, { w: 3 }));
            const sp = t * (6 + k);
            for (let b = 0; b < 8; b++) { const q = sp + b * TAU / 8; BL.push(inkPath([[x + Math.cos(q) * r * 0.42, y - r * 1.1 + Math.sin(q) * r * 0.42], [x + Math.cos(q + 0.3) * r * 0.82, y - r * 1.1 + Math.sin(q + 0.3) * r * 0.82]], { w: 3, seed: sd + 340 + k * 8 + b, t, amp: 0.4 })); }
          }
          backF.setAttribute('d', BF.join(' ')); backL.setAttribute('d', BL.join(' '));
          // floor + grating to the bottom
          floorF.setAttribute('d', inkLoop(sq(-20, GY, W + 20, H + 20), { seed: sd + 2, t, smooth: false, amp: 0.4 }));
          const GR = []; for (let k = 0; k < 14; k++) { const y = GY + Math.pow(k / 13, 1.4) * (H - GY); GR.push(inkPath([[-20, y], [W + 20, y]], { w: 3 + k * 0.4, seed: sd + 400 + k, t })); }
          for (let k = -10; k <= 10; k++) GR.push(inkPath([[0.4 * W + k * 40 * u, GY], [0.4 * W + k * 190 * u, H + 20]], { w: 3, seed: sd + 430 + k, t }));
          grate.setAttribute('d', GR.join(' '));
          // the big centrifugal fan (scroll housing, outlet up-right), close and big
          const cx = 0.4 * W, cy = 0.47 * H, R = 300 * u * (1 + 0.03 * hp);
          const SC = []; for (let i = 0; i <= 26; i++) { const q = -Math.PI / 2 + i / 26 * TAU * 0.95, rr = R * (0.78 + 0.22 * i / 26); SC.push([cx + Math.cos(q) * rr, cy + Math.sin(q) * rr]); }
          const scroll = SC.concat([[cx + R * 1.0, cy - R * 1.32], [cx + R * 0.02, cy - R * 1.32]]);
          house.setAttribute('d', inkLoop(scroll, { seed: sd + 500, t, smooth: false, amp: 0.6 }));
          houseD.setAttribute('d', inkLoop(sq(cx - R * 0.95, cy + R * 0.7, cx + R * 0.95, GY + 60 * u), { seed: sd + 501, t, smooth: false, amp: 0.5 }));
          wheel.setAttribute('d', inkCircle(cx, cy, R * 0.62, sd + 502, t, { fill: true }));
          const BLD = [], sp = t * 5;
          for (let b = 0; b < 16; b++) { const q = sp + b * TAU / 16; BLD.push(inkLoop([[cx + Math.cos(q) * R * 0.22, cy + Math.sin(q) * R * 0.22], [cx + Math.cos(q + 0.32) * R * 0.6, cy + Math.sin(q + 0.32) * R * 0.6], [cx + Math.cos(q + 0.42) * R * 0.6, cy + Math.sin(q + 0.42) * R * 0.6], [cx + Math.cos(q + 0.06) * R * 0.22, cy + Math.sin(q + 0.06) * R * 0.22]], { seed: sd + 510 + b, t, smooth: false, amp: 0.3 })); }
          BLD.push(inkCircle(cx, cy, R * 0.18, sd + 530, t, { fill: true }));
          blades.setAttribute('d', BLD.join(' '));
          const RV = []; for (let i = 0; i < 20; i++) { const p = SC[Math.min(SC.length - 1, i + 3)]; RV.push(inkDot(p[0] + (cx - p[0]) * 0.06, p[1] + (cy - p[1]) * 0.06, 6 * u, 6 * u, sd + 540 + i, t)); }
          rivets.setAttribute('d', RV.join(' '));
          // motor on the right with a belt
          const mx = cx + R * 1.15, my = cy + R * 0.55;
          motor.setAttribute('d', inkLoop(sq(mx - 90 * u, my - 80 * u, mx + 90 * u, my + 80 * u), { seed: sd + 560, t, amp: 0.6 }));
          const LN = [inkPath(scroll, { w: 9, seed: sd + 570, t, closed: true, smooth: false }), inkCircle(cx, cy, R * 0.62, sd + 571, t, { w: 6 }), inkPath(sq(cx - R * 0.95, cy + R * 0.7, cx + R * 0.95, GY + 60 * u), { w: 6, seed: sd + 572, t, closed: true, smooth: false }),
            inkPath(sq(mx - 90 * u, my - 80 * u, mx + 90 * u, my + 80 * u), { w: 6, seed: sd + 573, t, closed: true }), inkPath([[cx, cy - R * 0.18], [mx, my - 40 * u]], { w: 5, seed: sd + 574, t }), inkPath([[cx, cy + R * 0.18], [mx, my + 40 * u]], { w: 5, seed: sd + 575, t })];
          for (let k = 0; k < 4; k++) LN.push(inkPath([[mx - 70 * u, my - 50 * u + k * 34 * u], [mx + 70 * u, my - 50 * u + k * 34 * u]], { w: 3, seed: sd + 576 + k, t }));
          lines.setAttribute('d', LN.join(' '));
          // air whooshing out of the outlet
          const WD = []; for (let k = 0; k < 5; k++) { const a = (t * 1.1 + k / 5) % 1, x0 = cx + R * (0.1 + 0.18 * k), y0 = cy - R * 1.36 - a * 260 * u; WD.push(inkPath([[x0, y0 + 60 * u], [x0 + Math.sin(a * 6) * 16 * u, y0]], { w: 8 * u, seed: sd + 590 + k, t })); }
          wind.setAttribute('d', WD.join(' '));
          // counter 1 -> 84
          const n = Math.max(1, Math.round(84 * progIO(lt, 0.15, Math.max(0.5, cnt - 0.15))));
          num.textContent = String(n);
          num.setAttribute('x', f1((P.num_x ?? 0.5) * W)); num.setAttribute('y', f1((P.num_y ?? 0.865) * H)); num.setAttribute('font-size', f1(230 * u * (1 + 0.12 * hp)));
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ht_desk
  SH.ht_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 941, root = el(svg, 'g'), u = W / 1080;
      const wallP = inkEl(root, mix(INK.paperDark, INK.green, 0.12)), wainsc = inkEl(root, WOOD()), wainL = inkEl(root);
      const winF = inkEl(root, mix(INK.paperLight, INK.blue, 0.2)), winL = inkEl(root), skyl = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.4));
      const cal = window.LH.calendar(el(root, 'g'), sd + 10);
      const holland = window.LH.person(el(root, 'g'), sd + 20, { kind: 'sweater', col: mix(INK.ink, INK.inkSoft, 0.35), hair: 'dark', glasses: false });
      const table = inkEl(root, WOOD()), tableD = inkEl(root, WOOD_D()), sheet = inkEl(root, mix(INK.blue, INK.paperLight, 0.55)), sheetL = inkEl(root, INK.paperLight), tableL = inkEl(root);
      const lamp = window.LH.lamp(el(root, 'g'), sd + 40);
      const front = window.LH.front(el(root, 'g'), sd + 50, 'desk');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, dim = atOr(cues, 'dim', dur * 0.75);
          const GY = (P.table ?? 0.6) * H;
          wallP.setAttribute('d', inkLoop(sq(-20, -20, W + 20, H + 20), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          wainsc.setAttribute('d', inkLoop(sq(-20, 0.5 * H, W + 20, H + 20), { seed: sd + 2, t, smooth: false, amp: 0.4 }));
          const WL = [inkPath([[-20, 0.5 * H], [W + 20, 0.5 * H]], { w: 7, seed: sd + 3, t })]; for (let k = 0; k < 6; k++) WL.push(inkPath([[k * 200 * u + 40 * u, 0.52 * H], [k * 200 * u + 40 * u, H]], { w: 3, seed: sd + 4 + k, t }));
          wainL.setAttribute('d', WL.join(' '));
          // window with the Hudson and a far shore
          const wx0 = 0.56 * W, wx1 = 0.94 * W, wy0 = 0.1 * H, wy1 = 0.36 * H;
          winF.setAttribute('d', inkLoop(sq(wx0, wy0, wx1, wy1), { seed: sd + 20, t, smooth: false, amp: 0.4 }));
          const SK = []; let x = wx0 + 10 * u; let i = 0; while (x < wx1 - 30 * u) { const w = (30 + hn(i, 1) * 40) * u, h = (30 + hn(i, 2) * 120) * u; SK.push(inkLoop(sq(x, wy1 - 60 * u - h, x + w - 4 * u, wy1 - 60 * u), { seed: sd + 30 + i, t, smooth: false, amp: 0.4 })); x += w; i++; }
          skyl.setAttribute('d', SK.join(' '));
          winL.setAttribute('d', inkPath(sq(wx0, wy0, wx1, wy1), { w: 8, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 5, seed: sd + 22, t }) + ' ' + inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 5, seed: sd + 23, t }) +
            ' ' + [0, 1, 2].map(k => inkPath([[wx0 + 30 * u + k * 90 * u + (t * 6 % 90) * u, wy1 - 40 * u], [wx0 + 60 * u + k * 90 * u + (t * 6 % 90) * u, wy1 - 46 * u]], { w: 3, seed: sd + 24 + k, t })).join(' '));
          cal.update(t, 0.2 * W, 0.2 * H, 190 * u, 220 * u, '1924', 0);
          // Holland leaning over the drafting table, pencil in hand
          const tx = 0.55 * W, ty = GY;
          const tilt = [[tx - 330 * u, ty + 10 * u], [tx + 340 * u, ty - 70 * u], [tx + 360 * u, ty + 30 * u], [tx - 320 * u, ty + 90 * u]];
          const drawX = tx - 40 * u + Math.sin(t * 2.2) * 70 * u, drawY = ty - 4 * u + Math.cos(t * 2.2) * 10 * u;
          const o = holland.update(t, 0.22 * W, ty + 360 * u, 1.3 * u, { face: 1, lean: 16, armR: [drawX, drawY], armL: [tx - 200 * u, ty + 30 * u], look: [6, 10], brow: lt > dim ? -0.4 : 0.2 });
          void o;
          table.setAttribute('d', inkLoop(tilt, { seed: sd + 60, t, smooth: false, amp: 0.4 }));
          sheet.setAttribute('d', inkLoop([[tx - 270 * u, ty + 12 * u], [tx + 280 * u, ty - 56 * u], [tx + 296 * u, ty + 20 * u], [tx - 256 * u, ty + 78 * u]], { seed: sd + 61, t, smooth: false, amp: 0.4 }));
          // the tunnel drawing on the blueprint: two parallel tubes with a ventilation stack at each end
          const B = (fx, fy) => [lerp(tx - 250 * u, tx + 270 * u, fx) , lerp(ty + 64 * u, ty - 40 * u, fx) + (fy - 0.5) * 70 * u];
          const BP = [inkPath([B(0.05, 0.3), B(0.95, 0.3)], { w: 3, seed: sd + 62, t }), inkPath([B(0.05, 0.6), B(0.95, 0.6)], { w: 3, seed: sd + 63, t }), inkPath([B(0.1, 0.3), B(0.1, -0.2)], { w: 3, seed: sd + 64, t }), inkPath([B(0.9, 0.3), B(0.9, -0.2)], { w: 3, seed: sd + 65, t })];
          const drawn = progIO(lt, 0.1, dur * 0.6); BP.push(inkPath([B(0.05, 0.45), B(lerp(0.05, 0.95, drawn), 0.45)], { w: 3, seed: sd + 66, t }));
          sheetL.setAttribute('d', BP.join(' '));
          tableD.setAttribute('d', inkPath([[tx - 260 * u, ty + 80 * u], [tx - 280 * u, H * 0.84]], { w: 26 * u, seed: sd + 67, t }) + ' ' + inkPath([[tx + 330 * u, ty + 30 * u], [tx + 350 * u, H * 0.84]], { w: 26 * u, seed: sd + 68, t }));
          tableL.setAttribute('d', inkPath(tilt, { w: 7, seed: sd + 69, t, closed: true, smooth: false }) + ' ' + inkPath([[drawX - 4 * u, drawY - 30 * u], [drawX + 6 * u, drawY]], { w: 6, seed: sd + 70, t }));
          // the lamp over the table goes out slowly from "dim"
          const k = 1 - progIO(lt, dim, 0.7);
          lamp.update(t, tx + 40 * u, ty - 0.2 * H, k, ty, 260 * u);
          front.update(t, W, H, (P.front ?? 0.82) * H, {});
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ht_tower
  SH.ht_tower = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 997, root = el(svg, 'g'), u = W / 1080;
      const GY = (P.ground ?? 0.6) * H;
      const tower = inkEl(root, BRICK()), towerD = inkEl(root, BRICK_D()), stone = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.4)), louv = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), towerL = inkEl(root);
      const portal = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.5)), mouth = inkEl(root, mix(INK.ink, INK.inkSoft, 0.15)), portalL = inkEl(root);
      const street = inkEl(root, ROAD()), kerb = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.35)), stripes = inkEl(root, INK.paperLight), streetL = inkEl(root);
      const fm = fumes(root, 0.5);
      const cars = carBuckets(root);
      const plaqueT = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 36 * u, fill: INK.ink, 'letter-spacing': 1 * u });
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), hp = punch(lt, hit, 0.7);
          // tower: tall brick block with stone trim and louvred bands
          const x0 = 0.42 * W, x1 = 0.98 * W, y0 = 0.08 * H;
          tower.setAttribute('d', inkLoop(sq(x0, y0, x1, GY), { seed: sd + 1, t, smooth: false, amp: 0.5 }));
          const BD = [], LV = [], ST = [];
          for (let r = 0; r < 40; r++) { const y = y0 + r * 28 * u; if (y > GY) break; BD.push(inkPath([[x0, y], [x1, y]], { w: 1.8, seed: sd + 10 + r, t, amp: 0.5 })); }
          for (let b = 0; b < 3; b++) {
            const ly = y0 + (0.16 + b * 0.24) * (GY - y0), lh = 110 * u;
            for (let c = 0; c < 4; c++) { const lx = x0 + 40 * u + c * ((x1 - x0 - 80 * u) / 4), lw = (x1 - x0 - 80 * u) / 4 - 24 * u; LV.push(inkLoop(sq(lx, ly, lx + lw, ly + lh), { seed: sd + 100 + b * 10 + c, t, smooth: false, amp: 0.5 })); for (let k = 1; k < 5; k++) BD.push(inkPath([[lx, ly + k * lh / 5], [lx + lw, ly + k * lh / 5 - 8 * u]], { w: 3, seed: sd + 200 + b * 40 + c * 5 + k, t })); }
            ST.push(inkLoop(sq(x0 - 10 * u, ly - 26 * u, x1 + 10 * u, ly - 8 * u), { seed: sd + 300 + b, t, smooth: false, amp: 0.4 }));
          }
          ST.push(inkLoop(sq(x0 - 20 * u, y0 - 30 * u, x1 + 20 * u, y0 + 10 * u), { seed: sd + 310, t, smooth: false, amp: 0.4 }));
          towerD.setAttribute('d', BD.join(' ')); louv.setAttribute('d', LV.join(' ')); stone.setAttribute('d', ST.join(' '));
          towerL.setAttribute('d', inkPath(sq(x0, y0, x1, GY), { w: 7, seed: sd + 2, t, closed: true, smooth: false }));
          // the air it breathes: puffs from the louvres, drifting up-left
          const S = [], C = [];
          for (let b = 0; b < 3; b++) for (let k = 0; k < 4; k++) { const a = (t * 0.35 + k / 4 + b * 0.13) % 1, ly = y0 + (0.16 + b * 0.24) * (GY - y0) + 50 * u; S.push(inkCircle(x0 - a * 200 * u, ly - a * 140 * u, (20 + a * 60) * u * (1 + 0.2 * hp), sd + 400 + b * 10 + k, t, { fill: true, n: 9 })); }
          for (let k = 0; k < 5; k++) { const a = (t * 0.3 + k / 5) % 1; C.push(inkCircle(0.7 * W - a * 80 * u, y0 - 40 * u - a * 160 * u, (30 + a * 70) * u, sd + 450 + k, t, { fill: true, n: 9 })); }
          fm.soft.setAttribute('fill-opacity', '0.45'); fm.core.setAttribute('fill-opacity', '0.3');
          fm.set(S, C, []);
          // the portal at the foot (left of the tower)
          const px0 = 0.02 * W, px1 = 0.46 * W, py0 = GY - 330 * u;
          portal.setAttribute('d', inkLoop(sq(px0, py0, px1, GY), { seed: sd + 500, t, smooth: false, amp: 0.4 }));
          const mp = [[px0 + 40 * u, GY], [px0 + 40 * u, py0 + 130 * u], [(px0 + px1) / 2, py0 + 60 * u], [px1 - 40 * u, py0 + 130 * u], [px1 - 40 * u, GY]];
          mouth.setAttribute('d', inkLoop(mp, { seed: sd + 501, t, amp: 0.5 }));
          portalL.setAttribute('d', inkPath(sq(px0, py0, px1, GY), { w: 6, seed: sd + 502, t, closed: true, smooth: false }) + ' ' + inkPath(mp, { w: 6, seed: sd + 503, t }));
          plaqueT.setAttribute('x', f1((px0 + px1) / 2)); plaqueT.setAttribute('y', f1(py0 + 46 * u)); plaqueT.textContent = P.plaque || 'HOLLAND TUNNEL';
          // street + kerb + crossing stripes to the bottom
          street.setAttribute('d', inkLoop(sq(-20, GY, W + 20, H + 20), { seed: sd + 600, t, smooth: false, amp: 0.4 }));
          kerb.setAttribute('d', inkLoop(sq(-20, 0.83 * H, W + 20, 0.87 * H), { seed: sd + 601, t, smooth: false, amp: 0.4 }) + ' ' + inkLoop(sq(-20, 0.87 * H, W + 20, H + 20), { seed: sd + 602, t, smooth: false, amp: 0.4 }));
          const SP = []; for (let k = 0; k < 8; k++) { const x = k * 150 * u + 20 * u; SP.push(inkLoop([[x, 0.69 * H], [x + 70 * u, 0.69 * H], [x + 80 * u, 0.73 * H], [x + 10 * u, 0.73 * H]], { seed: sd + 610 + k, t, smooth: false, amp: 0.4 })); }
          stripes.setAttribute('d', SP.join(' '));
          const SLn = [inkPath([[-20, GY], [W + 20, GY]], { w: 6, seed: sd + 620, t }), inkPath([[-20, 0.83 * H], [W + 20, 0.83 * H]], { w: 6, seed: sd + 621, t }), inkPath([[-20, 0.87 * H], [W + 20, 0.87 * H]], { w: 5, seed: sd + 622, t })];
          for (let k = 0; k < 7; k++) SLn.push(inkPath([[k * 170 * u, 0.9 * H], [k * 170 * u + 60 * u, 0.98 * H]], { w: 3, seed: sd + 630 + k, t }));
          streetL.setAttribute('d', SLn.join(' '));
          // cars driving left into the portal
          cars.reset();
          for (let i = 0; i < 3; i++) {
            const ph = (lt * 0.16 + i / 3) % 1, x = lerp(W + 200 * u, (px0 + px1) / 2, ph);
            if (x < px1 - 40 * u && ph > 0.97) continue;
            carSide(cars.B, sd + 700 + i * 40, t, x, GY + 120 * u, 0.85 * u, -1, cars.cols[i % 4], lt * 2 + i);
          }
          cars.flush();
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
