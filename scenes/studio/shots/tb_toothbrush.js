// tb_toothbrush: shots for the Stickstory Short "William Addis: the toothbrush born in prison" (2026-11-21).
// Around 1770 William Addis was jailed in Newgate for causing a riot (Spitalfields). People cleaned their teeth with a
// rag and soot (or crushed shell). The legend: he saved a small bone from a meal, drilled holes in it, got bristles from
// a guard, tied them in tufts and pushed them through. After his release (c. 1780) he made and sold them; the firm
// (Addis, today Wisdom Toothbrushes) still makes toothbrushes.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.person, LH.kasif, LH.label).
// Portrait 1080×1920 layout (Shorts).
//
// Common P: labels: [{text, x, y, at, size, color, font, card, rot, underline}] (LH.label)
//           kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//
// SHOTS.tb_cell — a stone prison cell: barred window with a moonlight shaft, a barred door, a table with a candle and a
//   wooden bowl, Addis on a stool; flagstone floor with straw and a chain to the frame bottom.
//   P: {mode: "hook" (Addis holds the finished bone toothbrush up to the candle; a rat runs across the floor; the brush
//   flashes at cue "hit") | "guard" (the barred door on the right, a guard behind it reaches through the bars with a
//   bundle of bristles that passes to Addis at cue "give")}
// SHOTS.tb_street — a Georgian London street over the "city" set, cobbles to the bottom.
//   P: {mode: "riot" (angry crowd pumping fists in front of brick houses, a window cracks at cue "hit", front-row heads
//   bob at the bottom; Addis in the middle with a red neckerchief) | "gate" (the windowless rusticated front of Newgate
//   Prison with carved fetters over the gate; two guards walk Addis into the dark gateway, the iron grille drops at
//   cue "slam"), gate_text}
// SHOTS.tb_soot — a Georgian washroom: washstand with basin, jug and a jar of soot, a small mirror; the host scrubs his
//   teeth with a sooty rag (soot smudge grows, soot crumbs fall). P: {kasif, labels}
// SHOTS.tb_bone — close-up on the cell table: P: {mode: "drill" (from cue "save" the bone rises out of the bowl into
//   two hands (saved: true = already in the hands); from cue "drill" (drill: false = never) an awl twists tiny holes into its head one by one, bone dust) | "tufts" (bristle tufts
//   go into the holes one by one from cue "tie"; at cue "done" the finished brush gleams)}
// SHOTS.tb_shop — Addis's shop c. 1780: shelves of bone toothbrushes in jars, a hanging sign, the counter to the frame
//   bottom; a customer pays (coin at cue "pay"), Addis hands over a brush. P: {sign, labels}
// SHOTS.tb_bath — a bathroom today: tiled wall, mirror, sink, a glass with modern toothbrushes, the cabinet to the frame
//   bottom, dripping tap. P: {old: cue (the old bone brush springs up beside the glass), kasif (host in front of the
//   sink; brush: cue until which he brushes his teeth), labels}
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
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));

  const STONE = () => mix(INK.inkSoft, INK.paperDark, 0.55);
  const STONE_L = () => mix(INK.paperDark, INK.paperLight, 0.25);
  const STONE_D = () => mix(INK.inkSoft, INK.ink, 0.3);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.4);
  const BONE = () => mix(INK.paperLight, INK.stain, 0.18);
  const BONE_D = () => mix(INK.paperDark, INK.stain, 0.45);
  const BRISTLE = () => mix(INK.ink, INK.stain, 0.35);
  const SKIN = () => mix(INK.paperDark, INK.stain, 0.2);
  const IRON = () => mix(INK.ink, INK.inkSoft, 0.25);
  const BRICK = () => mix(INK.red, INK.paperDark, 0.5);
  const TILE = () => mix(INK.paperLight, INK.blue, 0.12);

  // ------------------------------------------------------------------ the bone toothbrush (buckets)
  // local units: length ~620 along x (head at -x), half thickness ~44 at the head. o: {holes: 0..10, tufts: 0..10,
  // knob: true (a knobbly bone end at +x), gleam: 0..1}
  const HOLES = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) HOLES.push([-262 + i * 40, j ? 15 : -15]);
  function brushB() { return { bone: [], shade: [], line: [], hole: [], tuft: [], tuftL: [], gleam: [] }; }
  function brushEls(parent) {
    const E = { shade: inkEl(parent, BONE_D()), bone: inkEl(parent, BONE()), line: inkEl(parent), hole: inkEl(parent, INK.ink), tuft: inkEl(parent, BRISTLE()), tuftL: inkEl(parent, INK.ink), gleam: inkEl(parent, INK.gold, { 'fill-opacity': 0.5 }) };
    return { set(B) { Object.keys(E).forEach(k => E[k].setAttribute('d', B[k].join(' '))); } };
  }
  function brush(B, sd, t, x, y, s, rot, o = {}) {
    const c = Math.cos(rot), si = Math.sin(rot);
    const T = p => [x + (p[0] * c - p[1] * si) * s, y + (p[0] * si + p[1] * c) * s], TT = q => q.map(T);
    const amp = Math.min(1.2, 0.3 + s * 0.8), w = Math.max(2, 7 * s + 0.8);
    const outline = [[-300, -8], [-292, -36], [-250, -46], [-120, -40], [-60, -24], [180, -20], [250, -24]];
    const lower = [[250, 24], [180, 20], [-60, 24], [-120, 40], [-250, 46], [-292, 36], [-300, 8]];
    let shape;
    if (o.knob !== false) shape = outline.concat([[268, -52], [312, -48], [326, -16], [306, 0], [326, 18], [312, 50], [268, 52]], lower);
    else shape = outline.concat([[292, -16], [296, 16]], lower);
    B.shade.push(inkLoop(TT(shape.map(p => [p[0] + 6, p[1] + 10])), { seed: sd + 1, t, amp }));
    B.bone.push(inkLoop(TT(shape), { seed: sd + 2, t, amp }));
    B.line.push(inkPath(TT(shape), { w, seed: sd + 3, t, closed: true, amp }));
    B.line.push(inkPath(TT([[-40, 6], [160, 4]]), { w: w * 0.45, seed: sd + 4, t, amp }));
    const nh = Math.min(10, Math.floor(o.holes ?? 10)), ntf = Math.min(10, o.tufts ?? 0);
    for (let i = 0; i < nh; i++) { const p = T(HOLES[i]); B.hole.push(inkDot(p[0], p[1], 7.5 * s + 0.6, 7.5 * s + 0.6, sd + 10 + i, t)); }
    for (let i = 0; i < 10; i++) {
      const k = clamp01(ntf - i);
      if (k <= 0) continue;
      const h = HOLES[i], len = 92 * k, tf = [];
      for (let b = -3; b <= 3; b++) tf.push(inkPath(TT([[h[0] + b * 1.5, h[1]], [h[0] + b * 4.5, h[1] - len]]), { w: Math.max(1.2, 3.2 * s), seed: sd + 30 + i * 8 + b, t, amp: 0.4, taper: 0.5 }));
      B.tuft.push(inkLoop(TT([[h[0] - 6, h[1]], [h[0] - 14, h[1] - len], [h[0] + 14, h[1] - len], [h[0] + 6, h[1]]]), { seed: sd + 100 + i, t, smooth: false, amp: 0.4 }));
      B.tuftL.push(...tf);
    }
    if (o.gleam > 0.02) { const g = T([-200, -30 - 60 * (o.tufts > 0 ? 1 : 0)]); B.gleam.push(inkCircle(g[0], g[1], 120 * s * o.gleam + 4, sd + 200, t, { fill: true, n: 10 })); }
  }

  // ------------------------------------------------------------------ candle with flame and glow
  function candle(parent, sd) {
    const g = el(parent, 'g');
    const glow = inkEl(g, INK.gold, { 'fill-opacity': 0.22 }), glow2 = inkEl(g, INK.gold, { 'fill-opacity': 0.25 }), wax = inkEl(g, INK.paperLight), drip = inkEl(g, BONE_D()), flame = inkEl(g, INK.gold), core = inkEl(g, INK.red), lines = inkEl(g);
    return {
      update(t, x, y, s, k = 1) {
        const fl = 1 + 0.12 * Math.sin(t * 11 + sd) + 0.06 * Math.sin(t * 23);
        glow.setAttribute('d', inkCircle(x, y - 150 * s, 300 * s * fl, sd + 1, t, { fill: true, n: 14 }));
        glow2.setAttribute('d', inkCircle(x, y - 150 * s, 120 * s * fl, sd + 2, t, { fill: true, n: 12 }));
        const wb = sq(x - 22 * s, y - 110 * s, x + 22 * s, y);
        wax.setAttribute('d', inkLoop(wb, { seed: sd + 3, t, smooth: false, amp: 0.6 }));
        drip.setAttribute('d', inkLoop([[x - 22 * s, y - 110 * s], [x - 8 * s, y - 112 * s], [x - 10 * s, y - 70 * s], [x - 22 * s, y - 80 * s]], { seed: sd + 4, t, amp: 0.5 }));
        const sw = Math.sin(t * 5 + sd) * 6 * s, fh = 62 * s * fl;
        const fp = [[x - 11 * s, y - 118 * s], [x - 13 * s, y - 136 * s], [x + sw, y - 118 * s - fh], [x + 13 * s, y - 136 * s], [x + 11 * s, y - 118 * s]];
        flame.setAttribute('d', inkLoop(fp, { seed: sd + 5, t, amp: 0.6 }));
        core.setAttribute('d', inkDot(x + sw * 0.3, y - 130 * s, 5 * s, 10 * s, sd + 6, t));
        lines.setAttribute('d', inkPath(wb, { w: 5 * s, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath(fp, { w: 3.5 * s, seed: sd + 8, t, closed: true, amp: 0.6 }) +
          ' ' + inkPath([[x - 60 * s, y], [x + 60 * s, y], [x + 50 * s, y + 12 * s], [x - 50 * s, y + 12 * s]], { w: 5 * s, seed: sd + 9, t, closed: true, smooth: false }));
      },
    };
  }
  // wooden bowl (side view)
  function bowlPath(x, y, r) { const P = [[x - r, y - r * 0.35]]; for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10; P.push([x - Math.cos(a) * r, y - r * 0.35 + Math.sin(a) * r * 0.75]); } return P; }

  // stone block wall: rows of irregular blocks with deep joints
  function stoneWall(F, FL, L, sd, t, x0, y0, x1, y1, bw, bh, u, rustic = false) {
    let r = 0;
    for (let y = y0; y < y1; y += bh, r++) {
      const yb = Math.min(y1, y + bh);
      let x = x0 - (r % 2) * bw * 0.5, c = 0;
      while (x < x1) {
        const w = bw * (0.75 + 0.5 * hn(r, c));
        const g = rustic ? 12 * u : 4 * u;
        const pts = rustic ? [[x + g + 10 * u, y + g], [x + w - g - 10 * u, y + g], [x + w - g, y + g + 10 * u], [x + w - g, yb - g - 10 * u], [x + w - g - 10 * u, yb - g], [x + g + 10 * u, yb - g], [x + g, yb - g - 10 * u], [x + g, y + g + 10 * u]] : sq(x + g, y + g, x + w - g, yb - g);
        (hn(c, r + 9) > 0.55 ? FL : F).push(inkLoop(pts, { seed: sd + r * 31 + c, t, smooth: false, amp: 0.7 }));
        L.push(inkPath(pts, { w: rustic ? 6 : 3, seed: sd + 500 + r * 31 + c, t, closed: true, smooth: false, amp: 0.7 }));
        if (rustic) { L.push(inkPath([[x + g + 16 * u, yb - g - 14 * u], [x + w - g - 16 * u, yb - g - 14 * u]], { w: 3, seed: sd + 900 + r * 31 + c, t, amp: 0.5 })); for (let k = 0; k < 3; k++) { const px = x + g + (0.2 + 0.3 * k + 0.1 * hn(c, k)) * (w - 2 * g), py = y + g + (0.3 + 0.4 * hn(r, k)) * (bh - 2 * g); L.push(inkDot(px, py, 3 * u, 3 * u, sd + 1300 + r * 31 + c * 3 + k, t)); } }
        x += w; c++;
      }
    }
  }
  // flagstone floor from gy to the bottom in rough perspective
  function flagFloor(L, sd, t, W, H, gy, u, vx) {
    const rows = 7;
    for (let k = 0; k <= rows; k++) { const y = gy + Math.pow(k / rows, 1.5) * (H + 40 - gy); L.push(inkPath([[-20, y], [W + 20, y + (k % 2 ? 4 : -4)]], { w: 3 + k * 0.6, seed: sd + k, t })); }
    for (let k = -8; k <= 8; k++) L.push(inkPath([[vx + k * 120 * u, gy], [vx + k * 420 * u, H + 40]], { w: 3.5, seed: sd + 40 + k, t }));
  }
  // straw tufts and a chain with a shackle on the floor
  function floorBits(S, C, sd, t, W, H, u, list) {
    list.forEach((q, i) => {
      const x = q[0] * W, y = q[1] * H, n = 7;
      for (let b = 0; b < n; b++) { const a = -0.9 + 1.8 * b / (n - 1) + Math.sin(t * 0.8 + i) * 0.04; S.push(inkPath([[x, y], [x + Math.sin(a) * 70 * u, y - Math.cos(a) * 44 * u - 8 * u]], { w: 3.5, seed: sd + i * 10 + b, t, amp: 0.6 })); }
    });
    // chain from the wall ring down to a shackle
    const pts = []; for (let i = 0; i <= 9; i++) pts.push([lerp(0.06 * W, 0.42 * W, i / 9), lerp(0.84 * H, 0.9 * H, i / 9) + Math.sin(i * 0.9) * 14 * u]);
    pts.forEach((p, i) => C.push(inkCircle(p[0], p[1], 20 * u, sd + 200 + i, t, { w: 6, ry: (i % 2 ? 11 : 20) * u })));
    C.push(inkCircle(0.47 * W, 0.9 * H, 46 * u, sd + 230, t, { w: 11, ry: 30 * u }));
  }
  // a scurrying rat (side view), facing dir
  function rat(F, L, sd, t, x, y, s, dir) {
    const T = p => [x + p[0] * s * dir, y + p[1] * s], TT = q => q.map(T), bob = Math.sin(t * 30) * 4;
    const body = TT([[-70, -10], [-40, -50 + bob], [30, -54 + bob], [80, -30], [100, -16], [70, -4], [-60, 0]]);
    F.push(inkLoop(body, { seed: sd + 1, t, amp: 0.8 }));
    L.push(inkPath(body, { w: 4, seed: sd + 2, t, closed: true, amp: 0.8 }), inkPath(TT([[-66, -8], [-130, -24], [-190, -6 + Math.sin(t * 12) * 12]]), { w: 4, seed: sd + 3, t }));
    L.push(inkDot(...T([62, -30]), 5 * s + 1, 5 * s + 1, sd + 4, t), inkCircle(...T([40, -50]), 12 * s, sd + 5, t, { w: 3 }));
    const lp = Math.sin(t * 30);
    L.push(inkPath(TT([[-30, -6], [-30 + lp * 18, 4]]), { w: 4, seed: sd + 6, t }), inkPath(TT([[40, -6], [40 - lp * 18, 4]]), { w: 4, seed: sd + 7, t }));
  }
  // iron bars (vertical + two cross bars), rivets
  function bars(L, D, sd, t, x0, y0, x1, y1, n, u, w = 16) {
    for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); L.push(inkPath([[x, y0], [x, y1]], { w: w * u, seed: sd + i, t, amp: 0.6, taper: 0 })); }
    [0.12, 0.6].forEach((q, k) => { const y = lerp(y0, y1, q); L.push(inkPath([[x0 - 10 * u, y], [x1 + 10 * u, y]], { w: w * 1.1 * u, seed: sd + 40 + k, t, amp: 0.6, taper: 0 })); for (let i = 0; i <= n; i++) D.push(inkDot(lerp(x0, x1, i / n), y, 8 * u, 8 * u, sd + 60 + k * 20 + i, t)); });
  }

  // ------------------------------------------------------------------ SHOTS.tb_cell
  SH.tb_cell = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 113, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'hook';
      const GY = (P.ground ?? 0.64) * H;
      const wallF = inkEl(root, STONE()), wallFL = inkEl(root, STONE_L()), wallL = inkEl(root, STONE_D());
      const winF = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), moon = inkEl(root, INK.paperLight), winBars = inkEl(root, IRON()), winRiv = inkEl(root, INK.ink);
      const shaft = inkEl(root, INK.paperLight, { 'fill-opacity': 0.22 }), motes = inkEl(root, INK.paperLight, { 'fill-opacity': 0.8 });
      const floorF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4)), floorL = inkEl(root, STONE_D());
      const straw = inkEl(root, INK.gold), chain = inkEl(root, IRON());
      const ratF = inkEl(root, mix(INK.inkSoft, INK.ink, 0.2)), ratL = inkEl(root);
      const doorDark = inkEl(root, mix(INK.ink, INK.inkSoft, 0.35));
      const guardG = el(root, 'g');
      const guard = mode === 'guard' ? window.LH.person(guardG, sd + 70, { kind: 'sweater', col: mix(INK.blue, INK.ink, 0.45), hair: 'dark', glasses: false }) : null;
      const keys = inkEl(root, INK.gold), keysL = inkEl(root);
      const doorBars = inkEl(root, IRON()), doorRiv = inkEl(root, INK.ink);
      const tableF = inkEl(root, WOOD()), tableD = inkEl(root, WOOD_D()), tableL = inkEl(root);
      const bowlF = inkEl(root, WOOD_D()), bowlL = inkEl(root), crumbs = inkEl(root, BONE());
      const cnd = candle(el(root, 'g'), sd + 300);
      const stoolF = inkEl(root, WOOD_D()), stoolL = inkEl(root);
      const addis = window.LH.person(el(root, 'g'), sd + 40, { kind: 'sweater', col: mix(INK.stain, INK.inkSoft, 0.45), hair: 'dark', glasses: false });
      const bundleF = inkEl(root, BRISTLE()), bundleL = inkEl(root), bundleT = inkEl(root, INK.red);
      const BR = brushEls(el(root, 'g'));
      const fistF = inkEl(root, SKIN()), fistL = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), hp = punch(lt, hit, 0.8);
          blank(fistF, fistL);
          // back wall of stone blocks
          const F = [], FL = [], L = [];
          stoneWall(F, FL, L, sd + 1000, t, -20, -20, W + 20, GY, 210 * u, 120 * u, u);
          wallF.setAttribute('d', F.join(' ')); wallFL.setAttribute('d', FL.join(' ')); wallL.setAttribute('d', L.join(' '));
          // barred window high on the wall + moon + light shaft
          const guardMode = mode === 'guard';
          const wx = (guardMode ? 0.3 : 0.7) * W, wy = 0.14 * H, ww = 230 * u, wh = 190 * u;
          winF.setAttribute('d', inkLoop(sq(wx - ww / 2, wy, wx + ww / 2, wy + wh), { seed: sd + 2, t, smooth: false, amp: 0.5 }));
          moon.setAttribute('d', inkCircle(wx + 40 * u, wy + 70 * u, 40 * u, sd + 3, t, { fill: true }));
          const WB = [], WR = [];
          bars(WB, WR, sd + 4, t, wx - ww / 2, wy, wx + ww / 2, wy + wh, 4, u, 14);
          WB.push(inkPath(sq(wx - ww / 2, wy, wx + ww / 2, wy + wh), { w: 10, seed: sd + 5, t, closed: true, smooth: false }));
          winBars.setAttribute('d', WB.join(' ')); winRiv.setAttribute('d', WR.join(' '));
          const sdx = guardMode ? 1 : -1;
          shaft.setAttribute('d', inkLoop([[wx - ww / 2, wy + wh], [wx + ww / 2, wy + wh], [wx + ww / 2 + sdx * 330 * u, GY + 60 * u], [wx - ww / 2 + sdx * 330 * u, GY + 60 * u]].map((p, i) => i === 1 || i === 2 ? p : p), { seed: sd + 6, t, smooth: false, amp: 0.5 }));
          const MT = []; for (let i = 0; i < 14; i++) { const ph = (t * 0.06 + hn(i, 1)) % 1, q = hn(i, 2); MT.push(inkDot(lerp(wx - ww / 2, wx + ww / 2, q) + sdx * ph * 330 * u + Math.sin(t + i) * 10 * u, lerp(wy + wh, GY, ph), 3.5 * u, 3.5 * u, sd + 20 + i, t)); }
          motes.setAttribute('d', MT.join(' '));
          // floor
          floorF.setAttribute('d', inkLoop(sq(-20, GY, W + 20, H + 20), { seed: sd + 7, t, smooth: false, amp: 0.4 }));
          const FLn = [inkPath([[-20, GY], [W + 20, GY]], { w: 6, seed: sd + 8, t })];
          flagFloor(FLn, sd + 50, t, W, H, GY, u, 0.5 * W);
          floorL.setAttribute('d', FLn.join(' '));
          const S = [], CH = [];
          floorBits(S, CH, sd + 600, t, W, H, u, [[0.2, 0.74], [0.62, 0.8], [0.86, 0.72], [0.74, 0.94], [0.12, 0.96]]);
          straw.setAttribute('d', S.join(' ')); chain.setAttribute('d', CH.join(' '));
          // rat (hook): runs right to left across the floor
          const RF = [], RL = [];
          if (!guardMode) { const ph = clamp01((lt - 0.3) / 3.2); if (ph > 0 && ph < 1) rat(RF, RL, sd + 700, t, lerp(W + 200 * u, -200 * u, ph), 0.79 * H, 1.1 * u, -1); }
          ratF.setAttribute('d', RF.join(' ')); ratL.setAttribute('d', RL.join(' '));
          // barred cell door: left (hook) or right (guard)
          const dx0 = guardMode ? 0.62 * W : -0.02 * W, dx1 = guardMode ? 1.02 * W : 0.2 * W, dy0 = 0.2 * H;
          doorDark.setAttribute('d', inkLoop(sq(dx0, dy0, dx1, GY), { seed: sd + 9, t, smooth: false, amp: 0.5 }));
          // guard behind the bars
          let gHand = null;
          if (guard) {
            const give = atOr(cues, 'give', dur * 0.45);
            const reach = progIO(lt, 0.1, 0.8), back = progIO(lt, give + 0.2, 0.6);
            const tgt = [lerp(0.78 * W, 0.56 * W, reach - back * 0.6), lerp(0.5 * H, 0.42 * H, reach)];
            const o = guard.update(t, 0.84 * W, GY, 1.25 * u, { face: -1, lean: 6 * reach, armR: tgt, armL: [0.9 * W, 0.52 * H], look: [4, 6], brow: -0.3 });
            gHand = o.hR;
            const kc = [0.88 * W, GY - 250 * u];
            keysL.setAttribute('d', inkCircle(kc[0], kc[1], 26 * u, sd + 80, t, { w: 6 }) + ' ' + [0, 1, 2].map(i => inkPath([[kc[0] - 14 * u + i * 14 * u, kc[1] + 22 * u], [kc[0] - 18 * u + i * 16 * u + Math.sin(t * 3 + i) * 4 * u, kc[1] + 74 * u]], { w: 7, seed: sd + 81 + i, t })).join(' '));
            keys.setAttribute('d', [0, 1, 2].map(i => inkDot(kc[0] - 18 * u + i * 16 * u, kc[1] + 76 * u, 9 * u, 7 * u, sd + 85 + i, t)).join(' '));
          } else blank(keys, keysL);
          const DB = [], DR = [];
          bars(DB, DR, sd + 90, t, dx0 + 30 * u, dy0, dx1 - 30 * u, GY, guardMode ? 5 : 2, u, 18);
          DB.push(inkPath(sq(dx0, dy0, dx1, GY + 6 * u), { w: 14, seed: sd + 98, t, closed: true, smooth: false }));
          doorBars.setAttribute('d', DB.join(' ')); doorRiv.setAttribute('d', DR.join(' '));
          // table with candle + bowl
          const tx0 = guardMode ? 0.0 * W : 0.24 * W, tx1 = guardMode ? 0.4 * W : 0.66 * W, TY = 0.52 * H;
          tableF.setAttribute('d', inkLoop(sq(tx0, TY, tx1, TY + 36 * u), { seed: sd + 10, t, smooth: false, amp: 0.5 }));
          tableD.setAttribute('d', inkPath([[tx0 + 40 * u, TY + 36 * u], [tx0 + 46 * u, GY + 30 * u]], { w: 30 * u, seed: sd + 11, t, taper: 0 }) + ' ' + inkPath([[tx1 - 40 * u, TY + 36 * u], [tx1 - 46 * u, GY + 30 * u]], { w: 30 * u, seed: sd + 12, t, taper: 0 }));
          tableL.setAttribute('d', inkPath(sq(tx0, TY, tx1, TY + 36 * u), { w: 6, seed: sd + 13, t, closed: true, smooth: false }));
          const bx = lerp(tx0, tx1, guardMode ? 0.62 : 0.12), bp = bowlPath(bx, TY - 4 * u, 70 * u);
          bowlF.setAttribute('d', inkLoop(bp, { seed: sd + 14, t, amp: 0.6 }));
          bowlL.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 15, t, closed: true, amp: 0.6 }));
          crumbs.setAttribute('d', [0, 1, 2].map(i => inkDot(bx - 70 * u + i * 60 * u, TY - 6 * u, 10 * u, 5 * u, sd + 16 + i, t)).join(' '));
          cnd.update(t, lerp(tx0, tx1, guardMode ? 0.25 : 0.45), TY, 1.2 * u);
          // Addis on a stool
          const ax = guardMode ? 0.44 * W : 0.78 * W, face = guardMode ? 1 : -1, sc = 1.25 * u;
          stoolF.setAttribute('d', inkLoop(sq(ax - 70 * u, GY - 200 * u, ax + 70 * u, GY - 176 * u), { seed: sd + 17, t, smooth: false, amp: 0.5 }));
          stoolL.setAttribute('d', inkPath(sq(ax - 70 * u, GY - 200 * u, ax + 70 * u, GY - 176 * u), { w: 5, seed: sd + 18, t, closed: true, smooth: false }) + ' ' +
            inkPath([[ax - 56 * u, GY - 176 * u], [ax - 70 * u, GY]], { w: 8, seed: sd + 19, t }) + ' ' + inkPath([[ax + 56 * u, GY - 176 * u], [ax + 70 * u, GY]], { w: 8, seed: sd + 20, t }));
          const B = brushB();
          let pose;
          if (!guardMode) {
            const lift = progIO(lt, 0.05, 0.9);
            const hand = [lerp(0.66 * W, 0.69 * W, lift), lerp(0.5 * H, 0.43 * H, lift) + Math.sin(t * 1.3) * 6 * u];
            pose = { face, lean: 8, armL: hand, armR: [0.66 * W, 0.52 * H], look: [10, -8 * lift], brow: 0.3 + 0.6 * hp, mouth: 0.4 * hp };
            const o = addis.update(t, ax, GY, sc, Object.assign({ seat: GY - 200 * u }, pose));
            const br = -0.4 + Math.sin(t * 0.9) * 0.04, bs = 0.52 * u;
            // the fist grips the handle at local x = +150: place the brush so that point sits in the hand
            brush(B, sd + 800, t, o.hL[0] - Math.cos(br) * 150 * bs, o.hL[1] - Math.sin(br) * 150 * bs, bs, br, { holes: 10, tufts: 10, gleam: 0.35 + 0.8 * hp });
            fistF.setAttribute('d', inkDot(o.hL[0], o.hL[1], 26 * u, 22 * u, sd + 830, t)); fistL.setAttribute('d', inkCircle(o.hL[0], o.hL[1], 26 * u, sd + 831, t, { w: 4.5, ry: 22 * u }) + ' ' + inkPath([[o.hL[0] - 14 * u, o.hL[1] - 8 * u], [o.hL[0] + 14 * u, o.hL[1] - 10 * u]], { w: 3, seed: sd + 832, t }));
            blank(bundleF, bundleL, bundleT);
          } else {
            const give = atOr(cues, 'give', dur * 0.45), took = progIO(lt, give, 0.6);
            const handA = [lerp(0.5 * W, 0.56 * W, progIO(lt, give - 0.6, 0.6)), lerp(0.47 * H, 0.42 * H, progIO(lt, give - 0.6, 0.6))];
            const handB = [lerp(handA[0], 0.38 * W, progIO(lt, give + 0.2, 0.7)), lerp(handA[1], 0.5 * H, progIO(lt, give + 0.2, 0.7))];
            pose = { face, lean: 10, armR: lt < give + 0.2 ? handA : handB, armL: [0.3 * W, 0.53 * H], look: [8, -4], brow: 0.2 + 0.8 * clamp01(took * 2), mouth: 0 };
            const o = addis.update(t, ax, GY, sc, Object.assign({ seat: GY - 200 * u }, pose));
            const hp2 = gHand && lt < give ? gHand : o.hR;
            const bxy = lt < give ? [lerp(gHand[0], o.hR[0], 0), gHand[1]] : [lerp(gHand[0], o.hR[0], took), lerp(gHand[1], o.hR[1], took)];
            void hp2;
            const bpts = [[-60, -10], [-40, -26], [60, -30], [80, -14], [64, 10], [-50, 12]].map(p => [bxy[0] + p[0] * u * 1.2, bxy[1] - 30 * u + p[1] * u * 1.2]);
            bundleF.setAttribute('d', inkLoop(bpts, { seed: sd + 900, t, amp: 0.8 }));
            const BL = [inkPath(bpts, { w: 4, seed: sd + 901, t, closed: true, amp: 0.8 })];
            for (let i = 0; i < 9; i++) BL.push(inkPath([[bxy[0] - 70 * u + i * 4 * u, bxy[1] - 34 * u + i * 2 * u], [bxy[0] + 90 * u - i * 3 * u, bxy[1] - 40 * u + i * 6 * u]], { w: 2.5, seed: sd + 902 + i, t, amp: 0.6 }));
            bundleL.setAttribute('d', BL.join(' '));
            bundleT.setAttribute('d', inkPath([[bxy[0], bxy[1] - 60 * u], [bxy[0] + 6 * u, bxy[1] - 4 * u]], { w: 9, seed: sd + 920, t }));
          }
          BR.set(B);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ simple crowd figure (stick body, coat, fists)
  function crowdFig(B, sd, t, x, gy, s, o) {
    const pump = o.pump ?? 0, face = o.face ?? 1, bob = Math.abs(Math.sin(t * 5 + sd)) * 10 * s * pump;
    const hip = [x, gy - 190 * s - bob], neck = [x + 6 * s * face, hip[1] - 210 * s], hc = [neck[0] + 8 * s * face, neck[1] - 56 * s];
    B.legs.push(inkPath([hip, [x - 18 * s, gy - 90 * s], [x - 28 * s, gy]], { w: 26 * s + 4, seed: sd + 1, t, taper: 0 }), inkPath([hip, [x + 18 * s, gy - 90 * s], [x + 28 * s, gy]], { w: 26 * s + 4, seed: sd + 2, t, taper: 0 }));
    const cp = [[neck[0] - 48 * s, neck[1] + 14 * s], [neck[0] + 48 * s, neck[1] + 14 * s], [hip[0] + 62 * s, hip[1] + 40 * s], [hip[0] - 62 * s, hip[1] + 40 * s]];
    (B.coat[o.col] || (B.coat[o.col] = [])).push(inkLoop(cp, { seed: sd + 3, t, smooth: false, amp: 1 }));
    B.lines.push(inkPath(cp, { w: 4.5, seed: sd + 4, t, closed: true, smooth: false }));
    const sh = [neck[0] + 30 * s * face, neck[1] + 26 * s], up = 0.5 + 0.5 * Math.sin(t * 6 + sd * 1.7);
    const fist = [sh[0] + 30 * s * face, sh[1] - (120 + 80 * up * pump) * s];
    const elb = [sh[0] + 60 * s * face, sh[1] - 40 * s];
    B.arms.push(inkPath([sh, elb, fist], { w: 22 * s, seed: sd + 5, t, taper: 0.1 }));
    const sh2 = [neck[0] - 30 * s * face, neck[1] + 26 * s];
    B.arms.push(inkPath([sh2, [sh2[0] - 30 * s * face, sh2[1] + 90 * s], [sh2[0] - 20 * s * face, sh2[1] + 170 * s]], { w: 22 * s, seed: sd + 6, t, taper: 0.1 }));
    B.skin.push(inkDot(fist[0], fist[1], 17 * s, 17 * s, sd + 7, t), inkCircle(hc[0], hc[1], 50 * s, sd + 8, t, { fill: true }));
    B.lines.push(inkCircle(hc[0], hc[1], 50 * s, sd + 9, t, { w: 5 }), inkCircle(fist[0], fist[1], 17 * s, sd + 10, t, { w: 3.5 }));
    B.hair.push(inkLoop([[-50, -4], [-44, -36], [-10, -56], [34, -46], [46, -26], [4, -36], [-30, -12]].map(q => [hc[0] + q[0] * s * face, hc[1] + q[1] * s]), { seed: sd + 11, t, amp: 0.8 }));
    // angry face: brows down to the middle, open mouth
    B.lines.push(inkPath([[hc[0] + 6 * s * face, hc[1] - 20 * s], [hc[0] + 30 * s * face, hc[1] - 12 * s]], { w: 4, seed: sd + 12, t }));
    B.lines.push(inkDot(hc[0] + 22 * s * face, hc[1] - 2 * s, 5 * s + 1, 5 * s + 1, sd + 13, t), inkCircle(hc[0] + 26 * s * face, hc[1] + 24 * s, (6 + 4 * up * pump) * s, sd + 14, t, { w: 3.5 }));
    if (o.scarf) B.red.push(inkLoop([[neck[0] - 30 * s, neck[1] + 4 * s], [neck[0] + 30 * s, neck[1] + 4 * s], [neck[0] + 10 * s * face, neck[1] + 70 * s], [neck[0] - 4 * s * face, neck[1] + 40 * s]], { seed: sd + 15, t, amp: 0.8 }));
    return { hc };
  }
  function crowdEls(parent, cols) {
    const g = el(parent, 'g');
    const E = { legs: inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)) }; const coatE = {};
    cols.forEach(c => { coatE[c] = inkEl(g, c); });
    E.arms = inkEl(g, mix(INK.inkSoft, INK.ink, 0.3)); E.skin = inkEl(g, SKIN()); E.hair = inkEl(g, INK.ink); E.red = inkEl(g, INK.red); E.lines = inkEl(g);
    const B = { coat: {}, legs: [], arms: [], skin: [], hair: [], red: [], lines: [] };
    return { B, reset() { B.coat = {}; ['legs', 'arms', 'skin', 'hair', 'red', 'lines'].forEach(k => { B[k] = []; }); },
      flush() { Object.keys(coatE).forEach(c => coatE[c].setAttribute('d', (B.coat[c] || []).join(' '))); ['legs', 'arms', 'skin', 'hair', 'red', 'lines'].forEach(k => E[k].setAttribute('d', B[k].join(' '))); } };
  }

  // ------------------------------------------------------------------ SHOTS.tb_street
  SH.tb_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 401, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'riot';
      const GY = (P.ground ?? 0.6) * H;
      const houseF = inkEl(root, BRICK()), houseD = inkEl(root, mix(INK.red, INK.ink, 0.35)), joint = inkEl(root, mix(INK.inkSoft, INK.ink, 0.45)), stoneF = inkEl(root, STONE_L()), winF = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), winDk = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), houseL = inkEl(root);
      const gateMouth = inkEl(root, mix(INK.ink, INK.inkSoft, 0.15)), fetters = inkEl(root, IRON());
      const lintel = inkEl(root, STONE_L()), lintelL = inkEl(root);
      const gateText = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 58 * u, fill: INK.ink, 'letter-spacing': 3 * u });
      const cobF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.45)), cobS = inkEl(root, STONE_L()), cobL = inkEl(root, STONE_D());
      const cols = [mix(INK.blue, INK.ink, 0.4), mix(INK.green, INK.ink, 0.4), mix(INK.stain, INK.ink, 0.35), mix(INK.inkSoft, INK.paperDark, 0.2)];
      const crowd = crowdEls(root, cols);
      const walkers = mode === 'gate' ? [0, 1, 2].map(i => window.LH.person(el(root, 'g'), sd + 60 + i * 9, { kind: 'sweater', col: i === 1 ? mix(INK.stain, INK.inkSoft, 0.45) : mix(INK.blue, INK.ink, 0.45), hair: 'dark', glasses: false })) : [];
      const scarf = inkEl(root, INK.red), scarfL = inkEl(root);
      const grille = inkEl(root, IRON()), grilleR = inkEl(root, INK.ink);
      const crack = inkEl(root), shards = inkEl(root, mix(INK.blue, INK.paperLight, 0.3));
      const front = crowdEls(root, cols);
      const lampF = inkEl(root, IRON()), lampG = inkEl(root, INK.gold, { 'fill-opacity': 0.5 });
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), hp = punch(lt, hit, 0.7);
          const HF = [], HD = [], SF = [], WF = [], WD = [], HL = [];
          if (mode === 'riot') {
            // three Georgian brick house fronts
            [[-0.04, 0.36, 0.16], [0.36, 0.68, 0.1], [0.68, 1.04, 0.19]].forEach(([a, b, top], i) => {
              const x0 = a * W, x1 = b * W, y0 = top * H;
              HF.push(inkLoop(sq(x0, y0, x1, GY), { seed: sd + 10 + i, t, smooth: false, amp: 0.5 }));
              HL.push(inkPath(sq(x0, y0, x1, GY), { w: 6, seed: sd + 14 + i, t, closed: true, smooth: false }));
              SF.push(inkLoop(sq(x0 - 6 * u, y0 - 30 * u, x1 + 6 * u, y0), { seed: sd + 18 + i, t, smooth: false, amp: 0.4 }));
              for (let r = 0; r < 18; r++) { const y = y0 + r * 36 * u; if (y > GY) break; HD.push(inkPath([[x0, y], [x1, y]], { w: 1.8, seed: sd + 30 + i * 20 + r, t, amp: 0.4 })); }
              // sash windows in two rows
              for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
                const wx = lerp(x0, x1, 0.28 + c * 0.44), wy = y0 + (90 + r * 230) * u, ww = 100 * u, wh = 160 * u;
                const broken = i === 1 && r === 1 && c === 0;
                (broken && lt > hit ? WD : WF).push(inkLoop(sq(wx - ww / 2, wy, wx + ww / 2, wy + wh), { seed: sd + 100 + i * 9 + r * 3 + c, t, smooth: false, amp: 0.4 }));
                SF.push(inkLoop(sq(wx - ww / 2 - 8 * u, wy + wh, wx + ww / 2 + 8 * u, wy + wh + 14 * u), { seed: sd + 140 + i * 9 + r * 3 + c, t, smooth: false, amp: 0.4 }));
                HL.push(inkPath(sq(wx - ww / 2, wy, wx + ww / 2, wy + wh), { w: 5, seed: sd + 160 + i * 9 + r * 3 + c, t, closed: true, smooth: false }), inkPath([[wx, wy], [wx, wy + wh]], { w: 3, seed: sd + 180 + i * 9 + r, t }), inkPath([[wx - ww / 2, wy + wh / 2], [wx + ww / 2, wy + wh / 2]], { w: 3, seed: sd + 190 + i * 9 + c, t }));
              }
              // door
              const dxm = lerp(x0, x1, 0.5);
              WD.push(inkLoop([[dxm - 50 * u, GY], [dxm - 50 * u, GY - 170 * u], [dxm, GY - 210 * u], [dxm + 50 * u, GY - 170 * u], [dxm + 50 * u, GY]], { seed: sd + 200 + i, t, amp: 0.5 }));
            });
            blank(gateMouth, fetters, joint, lintel, lintelL); gateText.textContent = '';
            // the cracked window (house 1, lower left)
            const cx = lerp(0.36 * W, 0.68 * W, 0.28), cy = 0.1 * H + (320 + 80) * u;
            if (lt > hit) {
              const CR = []; for (let k = 0; k < 7; k++) { const a = k / 7 * TAU + 0.3; CR.push(inkPath([[cx, cy], [cx + Math.cos(a) * 34 * u, cy + Math.sin(a) * 40 * u], [cx + Math.cos(a + 0.2) * 70 * u, cy + Math.sin(a + 0.2) * 80 * u]], { w: 3.5, seed: sd + 220 + k, t })); }
              crack.setAttribute('d', CR.join(' '));
              const SH2 = []; for (let k = 0; k < 6; k++) { const a = lt - hit, x = cx + (hn(k, 1) - 0.5) * 120 * u + a * 80 * u * (hn(k, 2) - 0.5), y = cy + 40 * u + a * a * 900 * u; if (y < GY) SH2.push(inkLoop([[x, y], [x + 18 * u, y + 6 * u], [x + 6 * u, y + 24 * u]], { seed: sd + 240 + k, t, smooth: false, amp: 0.4 })); }
              shards.setAttribute('d', SH2.join(' '));
            } else blank(crack, shards);
          } else {
            // Newgate: windowless rusticated stone front with carved fetters over the gate
            const y0 = 0.1 * H, gx0 = 0.33 * W, gx1 = 0.67 * W, gtop = 0.3 * H;
            const F = [], FL = [], L = [];
            stoneWall(F, FL, L, sd + 1000, t, -20, y0, W + 20, GY, 330 * u, 128 * u, u, true);
            stoneF.setAttribute('d', F.join(' ') + ' ' + FL.join(' '));
            joint.setAttribute('d', inkLoop(sq(-20, y0, W + 20, GY), { seed: sd + 299, t, smooth: false, amp: 0.3 }));
            HL.push(...L);
            SF.length = 0; HF.length = 0;
            HF.push(inkLoop(sq(-20, y0 - 50 * u, W + 20, y0), { seed: sd + 300, t, smooth: false, amp: 0.4 }));
            HL.push(inkPath([[-20, y0], [W + 20, y0]], { w: 7, seed: sd + 301, t }));
            const arch = [[gx0, GY], [gx0, gtop + 120 * u], [lerp(gx0, gx1, 0.15), gtop + 40 * u], [lerp(gx0, gx1, 0.5), gtop], [lerp(gx0, gx1, 0.85), gtop + 40 * u], [gx1, gtop + 120 * u], [gx1, GY]];
            gateMouth.setAttribute('d', inkLoop(arch, { seed: sd + 302, t, amp: 0.5 }));
            HL.push(inkPath(arch, { w: 10, seed: sd + 303, t }));
            // voussoirs around the arch
            for (let k = 0; k < 9; k++) { const a = Math.PI * (k + 0.5) / 9, r0 = (gx1 - gx0) / 2, cxm = (gx0 + gx1) / 2, cym = gtop + r0 * 0.55; HL.push(inkPath([[cxm - Math.cos(a) * r0 * 1.02, cym - Math.sin(a) * r0 * 0.6], [cxm - Math.cos(a) * r0 * 1.25, cym - Math.sin(a) * r0 * 0.85]], { w: 5, seed: sd + 310 + k, t })); }
            // fetters carved above the gate
            const FT = [], fy = gtop - 80 * u;
            for (let k = 0; k < 9; k++) { const x = lerp(0.3 * W, 0.7 * W, k / 8), y = fy + Math.sin(k / 8 * Math.PI) * 40 * u; FT.push(inkCircle(x, y, 18 * u, sd + 330 + k, t, { w: 7, ry: (k % 2 ? 10 : 18) * u })); }
            FT.push(inkCircle(0.28 * W, fy + 30 * u, 34 * u, sd + 345, t, { w: 10 }), inkCircle(0.72 * W, fy + 30 * u, 34 * u, sd + 346, t, { w: 10 }));
            fetters.setAttribute('d', FT.join(' '));
            const ly = y0 + 182 * u, lp = sq(0.3 * W, ly - 64 * u, 0.7 * W, ly + 34 * u);
            lintel.setAttribute('d', inkLoop(lp, { seed: sd + 350, t, smooth: false, amp: 0.4 }));
            lintelL.setAttribute('d', inkPath(lp, { w: 8, seed: sd + 351, t, closed: true, smooth: false }));
            gateText.setAttribute('x', f1(0.5 * W)); gateText.setAttribute('y', f1(ly + 4 * u)); gateText.textContent = P.gate_text || 'NEWGATE';
          }
          houseF.setAttribute('d', HF.join(' '));
          houseD.setAttribute('d', HD.join(' ')); if (mode === 'riot') stoneF.setAttribute('d', SF.join(' '));
          winF.setAttribute('d', WF.join(' ')); winDk.setAttribute('d', WD.join(' ')); houseL.setAttribute('d', HL.join(' '));
          // cobbles to the bottom
          cobF.setAttribute('d', inkLoop(sq(-20, GY, W + 20, H + 20), { seed: sd + 400, t, smooth: false, amp: 0.4 }));
          const CS = [], CL = [inkPath([[-20, GY], [W + 20, GY]], { w: 6, seed: sd + 401, t })];
          for (let r = 0; r < 9; r++) {
            const y = GY + Math.pow((r + 0.5) / 9, 1.4) * (H - GY), rh = (24 + r * 10) * u, rw = (60 + r * 22) * u;
            for (let c = -1; c < W / rw + 1; c++) { const x = c * rw + (r % 2) * rw * 0.5; if (hn(c, r) > 0.4) CS.push(inkCircle(x, y, rw * 0.42, sd + 420 + r * 40 + c, t, { fill: true, ry: rh * 0.45, n: 9 })); CL.push(inkCircle(x, y, rw * 0.42, sd + 820 + r * 40 + c, t, { w: 2.5 + r * 0.3, ry: rh * 0.45, n: 9 })); }
          }
          cobS.setAttribute('d', CS.join(' ')); cobL.setAttribute('d', CL.join(' '));
          // people
          crowd.reset(); front.reset();
          if (mode === 'riot') {
            const pump = 0.6 + 0.4 * clamp01(lt / 0.6);
            [[0.1, 1.0, 1], [0.28, 0.95, 1], [0.7, 0.95, -1], [0.88, 1.0, -1], [0.18, 1.1, 1], [0.8, 1.1, -1]].forEach((q, i) => crowdFig(crowd.B, sd + 1200 + i * 30, t, q[0] * W, GY + 40 * u + (q[1] - 0.95) * 600 * u, q[1] * 1.0 * u, { pump, face: q[2], col: cols[i % 4] }));
            crowdFig(crowd.B, sd + 1500, t, 0.5 * W, GY + 140 * u, 1.3 * u, { pump: 1, face: 1, col: mix(INK.stain, INK.inkSoft, 0.45), scarf: true });
            // front row of heads and shoulders, bobbing, filling the frame bottom
            blank(grille, grilleR);
          }
          if (mode === 'riot' || P.crowd) {
            for (let i = 0; i < 6; i++) crowdFig(front.B, sd + 1600 + i * 30, t, (i + 0.5) / 6 * W + (i % 2 ? 30 : -30) * u, H + 330 * u, 1.5 * u, { pump: 0.8, face: i % 2 ? -1 : 1, col: cols[(i + 1) % 4] });
          }
          blank(scarf, scarfL);
          if (mode === 'gate') {
            // two guards walk Addis into the gate; the grille drops at "slam"
            const slam = atOr(cues, 'slam', dur * 0.75), wk = progIO(lt, 0, Math.max(0.6, slam - 0.25));
            walkers.forEach((p, i) => {
              const x = lerp((0.68 + i * 0.13) * W, (0.4 + i * 0.1) * W, wk), s = lerp(1.15, 0.92, wk) * u, gy = lerp(GY + 120 * u, GY - 6 * u, wk);
              const ph = t * 4 + i;
              const po = p.update(t, x, gy, s, { face: -1, lean: 4, armL: i === 1 ? [x - 80 * s, gy - 260 * s] : null, armR: i === 1 ? [x - 90 * s, gy - 250 * s] : (i === 0 ? null : [x - 120 * s, gy - 330 * s]), look: [6, 2], brow: i === 1 ? 0.7 : -0.3, droop: i === 1 ? 0.2 : 0 });
              void ph;
              if (i === 1) { const n = po.neck, sp = [[n[0] - 34 * s / u * u, n[1] + 6 * s], [n[0] + 34 * s, n[1] + 6 * s], [n[0] - 6 * s, n[1] + 80 * s], [n[0] - 20 * s, n[1] + 40 * s]]; scarf.setAttribute('d', inkLoop(sp, { seed: sd + 1690, t, amp: 0.8 })); scarfL.setAttribute('d', inkPath(sp, { w: 4, seed: sd + 1691, t, closed: true, amp: 0.8 })); }
            });
            const gd = progIO(lt, slam, 0.3), gx0 = 0.33 * W + 14 * u, gx1 = 0.67 * W - 14 * u, gtop = 0.3 * H, gyb = lerp(gtop, GY, gd);
            const G = [], R = [];
            if (gd > 0.01) {
              for (let k = 0; k <= 7; k++) { const x = lerp(gx0, gx1, k / 7); G.push(inkPath([[x, gtop], [x, gyb]], { w: 16 * u, seed: sd + 1700 + k, t, taper: 0 })); }
              for (let k = 1; k <= 5; k++) { const y = lerp(gtop, GY, k / 6); if (y < gyb) { G.push(inkPath([[gx0, y], [gx1, y]], { w: 14 * u, seed: sd + 1720 + k, t, taper: 0 })); for (let j = 0; j <= 7; j++) R.push(inkDot(lerp(gx0, gx1, j / 7), y, 8 * u, 8 * u, sd + 1740 + k * 8 + j, t)); } }
              for (let k = 0; k <= 7; k++) R.push(inkLoop([[lerp(gx0, gx1, k / 7) - 10 * u, gyb], [lerp(gx0, gx1, k / 7) + 10 * u, gyb], [lerp(gx0, gx1, k / 7), gyb + 26 * u]], { seed: sd + 1800 + k, t, smooth: false, amp: 0.4 }));
            }
            grille.setAttribute('d', G.join(' ')); grilleR.setAttribute('d', R.join(' '));
            // a street lamp cropped at the right edge (foreground)
          }
          crowd.flush(); front.flush();
          if (mode === 'gate') {
            const lx = 0.92 * W;
            lampF.setAttribute('d', inkPath([[lx, H + 40], [lx, 0.52 * H]], { w: 26 * u, seed: sd + 1900, t, taper: 0 }) + ' ' + inkLoop([[lx - 50 * u, 0.52 * H], [lx + 50 * u, 0.52 * H], [lx + 34 * u, 0.44 * H], [lx - 34 * u, 0.44 * H]], { seed: sd + 1901, t, smooth: false }));
            lampG.setAttribute('d', inkCircle(lx, 0.48 * H, (60 + 6 * Math.sin(t * 7)) * u, sd + 1902, t, { fill: true }));
          } else blank(lampF, lampG);
          void hp;
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tb_soot
  SH.tb_soot = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 557, root = el(svg, 'g'), u = W / 1080;
      const GY = (P.ground ?? 0.62) * H;
      const wall = inkEl(root, mix(INK.paperDark, INK.green, 0.14)), wallL = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35)), dado = inkEl(root, WOOD()), dadoL = inkEl(root);
      const mirF = inkEl(root, mix(INK.paperLight, INK.blue, 0.25)), mirL = inkEl(root, WOOD_D()), mirR = inkEl(root);
      const floorF = inkEl(root, WOOD()), floorL = inkEl(root, WOOD_D());
      const standF = inkEl(root, WOOD_D()), standT = inkEl(root, WOOD()), standL = inkEl(root);
      const basin = inkEl(root, INK.paperLight), jug = inkEl(root, mix(INK.blue, INK.paperLight, 0.5)), jarF = inkEl(root, mix(INK.ink, INK.inkSoft, 0.15)), jarSoot = inkEl(root, INK.ink), objL = inkEl(root);
      const jarTxt = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 46 * u, fill: INK.paperLight, 'letter-spacing': 2 * u });
      const kas = kasifOf(root, P.kasif || { x: 0.36, y: 0.62, scale: 1.3, pose: 'think', face: 'right', emotion: 'worried' }, W, H, sd);
      const smudge = inkEl(root, INK.ink, { 'fill-opacity': 0.75 }), ragF = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.3)), ragS = inkEl(root, INK.ink, { 'fill-opacity': 0.8 }), ragL = inkEl(root), crumbs = inkEl(root, INK.ink);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.7), hp = punch(lt, hit, 0.8);
          wall.setAttribute('d', inkLoop(sq(-20, -20, W + 20, GY), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          const WLn = []; for (let k = 0; k < 9; k++) WLn.push(inkPath([[k * 130 * u + 40 * u, 0], [k * 130 * u + 40 * u, 0.42 * H]], { w: 2, seed: sd + 2 + k, t, amp: 0.5 }));
          wallL.setAttribute('d', WLn.join(' '));
          dado.setAttribute('d', inkLoop(sq(-20, 0.42 * H, W + 20, GY), { seed: sd + 20, t, smooth: false, amp: 0.4 }));
          const DL = [inkPath([[-20, 0.42 * H], [W + 20, 0.42 * H]], { w: 7, seed: sd + 21, t })]; for (let k = 0; k < 6; k++) DL.push(inkPath(sq(k * 190 * u + 20 * u, 0.45 * H, k * 190 * u + 170 * u, GY - 30 * u), { w: 3, seed: sd + 22 + k, t, closed: true, smooth: false }));
          dadoL.setAttribute('d', DL.join(' '));
          // small mirror on the wall (right)
          const mx = 0.6 * W, my = 0.24 * H;
          mirF.setAttribute('d', inkCircle(mx, my, 90 * u, sd + 31, t, { fill: true, ry: 114 * u }));
          mirL.setAttribute('d', inkCircle(mx, my, 90 * u, sd + 30, t, { w: 22 * u, ry: 114 * u }));
          mirR.setAttribute('d', inkCircle(mx, my, 100 * u, sd + 32, t, { w: 6, ry: 125 * u }) + ' ' + inkPath([[mx - 40 * u, my - 60 * u], [mx + 10 * u, my - 90 * u]], { w: 5, seed: sd + 33, t }) + ' ' + inkPath([[mx, my - 150 * u], [mx, my - 200 * u]], { w: 4, seed: sd + 34, t }));
          // floorboards to the bottom
          floorF.setAttribute('d', inkLoop(sq(-20, GY, W + 20, H + 20), { seed: sd + 40, t, smooth: false, amp: 0.4 }));
          const FB = []; for (let k = 0; k < 10; k++) { const y = GY + Math.pow(k / 9, 1.4) * (H - GY); FB.push(inkPath([[-20, y], [W + 20, y + 3]], { w: 3 + k * 0.5, seed: sd + 41 + k, t })); }
          for (let k = -6; k <= 6; k++) FB.push(inkPath([[0.4 * W + k * 160 * u, GY], [0.4 * W + k * 420 * u, H + 20]], { w: 3, seed: sd + 60 + k, t }));
          floorL.setAttribute('d', FB.join(' '));
          // washstand on the right with basin, jug and the soot jar
          const sx0 = 0.56 * W, sx1 = 1.04 * W, st = 0.5 * H;
          standT.setAttribute('d', inkLoop(sq(sx0, st, sx1, st + 34 * u), { seed: sd + 70, t, smooth: false, amp: 0.4 }));
          standF.setAttribute('d', inkLoop(sq(sx0 + 20 * u, st + 34 * u, sx1, H * 0.86), { seed: sd + 71, t, smooth: false, amp: 0.4 }));
          const OL = [inkPath(sq(sx0, st, sx1, st + 34 * u), { w: 6, seed: sd + 72, t, closed: true, smooth: false }), inkPath(sq(sx0 + 20 * u, st + 34 * u, sx1, H * 0.86), { w: 6, seed: sd + 73, t, closed: true, smooth: false }),
            inkPath(sq(sx0 + 60 * u, st + 90 * u, sx1 - 40 * u, st + 260 * u), { w: 4, seed: sd + 74, t, closed: true, smooth: false }), inkDot(lerp(sx0, sx1, 0.5), st + 175 * u, 12 * u, 12 * u, sd + 75, t)];
          const bp = bowlPath(0.92 * W, st - 2 * u, 110 * u);
          basin.setAttribute('d', inkLoop(bp, { seed: sd + 76, t, amp: 0.5 }));
          OL.push(inkPath(bp, { w: 5, seed: sd + 77, t, closed: true, amp: 0.5 }));
          const jp = [[0.82 * W, st - 70 * u], [0.86 * W, st - 70 * u], [0.9 * W, st - 150 * u], [0.92 * W, st - 260 * u], [0.86 * W, st - 290 * u], [0.8 * W, st - 260 * u], [0.79 * W, st - 150 * u]];
          jug.setAttribute('d', inkLoop(jp, { seed: sd + 78, t, amp: 0.5 }));
          OL.push(inkPath(jp, { w: 5, seed: sd + 79, t, closed: true, amp: 0.5 }), inkPath([[0.91 * W, st - 240 * u], [0.97 * W, st - 220 * u], [0.92 * W, st - 160 * u]], { w: 7, seed: sd + 80, t }));
          // soot jar (front, readable label)
          const jx = 0.62 * W, jw = 80 * u, jh = 170 * u, jk = 1 + 0.1 * hp;
          const jar = [[jx - jw * jk, st], [jx + jw * jk, st], [jx + jw * 1.05 * jk, st - jh * jk], [jx - jw * 1.05 * jk, st - jh * jk]];
          jarF.setAttribute('d', inkLoop(jar, { seed: sd + 81, t, smooth: false, amp: 0.5 }));
          jarSoot.setAttribute('d', inkCircle(jx, st - jh * jk, jw * 1.05 * jk, sd + 82, t, { fill: true, ry: 22 * u }) + ' ' + inkCircle(jx, st - jh * jk - 18 * u, jw * 0.7, sd + 83, t, { fill: true, ry: 26 * u }));
          OL.push(inkPath(jar, { w: 6, seed: sd + 84, t, closed: true, smooth: false }));
          jarTxt.setAttribute('x', f1(jx)); jarTxt.setAttribute('y', f1(st - jh * 0.4)); jarTxt.setAttribute('font-size', f1(46 * u * jk)); jarTxt.textContent = P.jar || 'SOOT';
          objL.setAttribute('d', OL.join(' '));
          standL.setAttribute('d', '');
          // the host scrubs his teeth with a sooty rag
          const o = kas ? kas.update(lt, t, cues) : null;
          if (o) {
            const K = P.kasif || { x: 0.36, y: 0.62, scale: 1.3, face: 'right' };
            const fc = K.face === 'left' || K.face === -1 ? -1 : 1, s = (K.scale ?? 1.3), ox = (K.x ?? 0.36) * W, oy = (K.y ?? 0.62) * H;
            const S2 = p => [ox + p[0] * s * fc, oy + p[1] * s];
            const hc = S2(o.head), hands = o.hands.map(S2);
            const mouth = [hc[0] + 12 * s * fc, hc[1] + 34 * s];
            const hand = hands.reduce((a, b) => Math.hypot(b[0] - mouth[0], b[1] - mouth[1]) < Math.hypot(a[0] - mouth[0], a[1] - mouth[1]) ? b : a);
            const scrub = Math.sin(t * 16) * 14 * u;
            const rc = [lerp(hand[0], mouth[0], 0.25) + scrub + 30 * u * fc, lerp(hand[1], mouth[1], 0.25) + 10 * u];
            const sm = clamp01(0.3 + lt / Math.max(1, dur * 0.8));
            smudge.setAttribute('d', inkCircle(mouth[0] - 6 * u * fc, mouth[1] + 2 * u, (18 + 22 * sm) * u * s / 1.3, sd + 90, t, { fill: true, ry: (10 + 10 * sm) * u * s / 1.3 }));
            const flap = Math.sin(t * 16 + 1) * 8;
            const rp = [[-46, -22], [30, -26], [50, -6], [56, 60 + flap], [30, 96 + flap], [10, 40], [-40, 18]].map(q => [rc[0] + q[0] * u * s / 1.3 * fc, rc[1] + q[1] * u * s / 1.3]);
            ragF.setAttribute('d', inkLoop(rp, { seed: sd + 91, t, amp: 0.8 }));
            ragS.setAttribute('d', [0, 1, 2].map(i => inkPath([[rc[0] + (-30 + i * 22) * u * fc, rc[1] - 14 * u + i * 4 * u], [rc[0] + (-10 + i * 24) * u * fc, rc[1] + (20 + i * 22) * u]], { w: 9 * u, seed: sd + 92 + i, t })).join(' '));
            ragL.setAttribute('d', inkPath(rp, { w: 4.5, seed: sd + 96, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[rc[0] + 40 * u, rc[1] + 20 * u], [rc[0] + 60 * u, rc[1] + 60 * u + scrub * 0.5]], { w: 5, seed: sd + 97, t }));
            const CR = []; for (let i = 0; i < 8; i++) { const ph = (t * 0.9 + i / 8) % 1; CR.push(inkDot(rc[0] + (hn(i, 3) - 0.5) * 80 * u, rc[1] + 30 * u + ph * 420 * u, 6 * u, 6 * u, sd + 100 + i, t)); }
            crumbs.setAttribute('d', CR.join(' '));
          } else blank(smudge, ragF, ragS, ragL, crumbs);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ a big hand (mitten with thumb), wrist -> palm direction
  function bigHand(B, sd, t, wx, wy, px, py, s, sleeveCol) {
    const dx = px - wx, dy = py - wy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const P2 = (a, b) => [px + ux * a * s + nx * b * s, py + uy * a * s + ny * b * s];
    (B.sleeve[sleeveCol] || (B.sleeve[sleeveCol] = [])).push(inkLoop([[wx + nx * 80 * s, wy + ny * 80 * s], [wx - nx * 80 * s, wy - ny * 80 * s], P2(-70, -62), P2(-70, 62)], { seed: sd + 1, t, smooth: false, amp: 1 }));
    B.lines.push(inkPath([P2(-70, -62), P2(-70, 62)], { w: 7 * s + 2, seed: sd + 2, t }), inkPath([[wx + nx * 80 * s, wy + ny * 80 * s], P2(-70, 62)], { w: 5, seed: sd + 3, t }), inkPath([[wx - nx * 80 * s, wy - ny * 80 * s], P2(-70, -62)], { w: 5, seed: sd + 4, t }));
    const palm = [P2(-64, -52), P2(10, -58), P2(62, -40), P2(78, 0), P2(62, 40), P2(10, 54), P2(-64, 50)];
    B.skin.push(inkLoop(palm, { seed: sd + 5, t, amp: 0.8 }));
    B.lines.push(inkPath(palm, { w: 6 * s + 1, seed: sd + 6, t, closed: true, amp: 0.8 }));
    const th = [P2(-20, -50), P2(30, -96), P2(56, -86), P2(30, -40)];
    B.skin.push(inkLoop(th, { seed: sd + 7, t, amp: 0.8 })); B.lines.push(inkPath(th, { w: 5 * s + 1, seed: sd + 8, t, closed: true, amp: 0.8 }));
    for (let k = 0; k < 3; k++) B.lines.push(inkPath([P2(40, -24 + k * 22), P2(72, -22 + k * 20)], { w: 3, seed: sd + 9 + k, t }));
  }
  function handEls(parent, cols) {
    const g = el(parent, 'g'), sl = {}; cols.forEach(c => { sl[c] = inkEl(g, c); });
    const skin = inkEl(g, SKIN()), lines = inkEl(g);
    const B = { sleeve: {}, skin: [], lines: [] };
    return { B, reset() { B.sleeve = {}; B.skin = []; B.lines = []; }, flush() { Object.keys(sl).forEach(c => sl[c].setAttribute('d', (B.sleeve[c] || []).join(' '))); skin.setAttribute('d', B.skin.join(' ')); lines.setAttribute('d', B.lines.join(' ')); } };
  }

  // ------------------------------------------------------------------ SHOTS.tb_bone
  SH.tb_bone = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 661, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'drill';
      const TOP = (P.top ?? 0.22) * H;
      const wallF = inkEl(root, STONE()), wallFL = inkEl(root, STONE_L()), wallL = inkEl(root, STONE_D());
      const tableF = inkEl(root, WOOD()), tableD = inkEl(root, WOOD_D()), tableL = inkEl(root);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.16 });
      const cnd = candle(el(root, 'g'), sd + 50);
      const bowlF = inkEl(root, WOOD_D()), bowlL = inkEl(root), bowlIn = inkEl(root, mix(INK.stain, INK.ink, 0.55));
      const pileF = inkEl(root, BRISTLE()), pileL = inkEl(root, INK.ink), thread = inkEl(root, INK.red);
      const BR = brushEls(el(root, 'g'));
      const dust = inkEl(root, INK.paperLight);
      const edgeF = inkEl(root, WOOD_D()), edgeL = inkEl(root);
      const sleeveCols = [mix(INK.stain, INK.inkSoft, 0.45)];
      const hands = handEls(root, sleeveCols);
      const awlF = inkEl(root, WOOD_D()), awlM = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.3)), awlL = inkEl(root);
      const tuftF = inkEl(root, BRISTLE()), tuftL = inkEl(root, INK.ink);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, done = atOr(cues, 'done', dur * 0.85), hp = punch(lt, done, 0.9);
          // stone wall strip behind, table top filling the rest
          const F = [], FL = [], L = [];
          stoneWall(F, FL, L, sd + 1000, t, -20, -20, W + 20, TOP, 220 * u, 110 * u, u);
          wallF.setAttribute('d', F.join(' ')); wallFL.setAttribute('d', FL.join(' ')); wallL.setAttribute('d', L.join(' '));
          tableF.setAttribute('d', inkLoop(sq(-20, TOP, W + 20, H + 20), { seed: sd + 1, t, smooth: false, amp: 0.4 }));
          const TD = [], TL = [inkPath([[-20, TOP], [W + 20, TOP]], { w: 8, seed: sd + 2, t })];
          for (let k = 1; k < 9; k++) { const y = TOP + Math.pow(k / 9, 1.25) * (H - TOP); TL.push(inkPath([[-20, y], [W + 20, y + 6]], { w: 4 + k * 0.4, seed: sd + 3 + k, t })); }
          for (let k = 0; k < 26; k++) { const y = TOP + hn(k, 1) * (H - TOP), x = hn(k, 2) * W; TD.push(inkPath([[x, y], [x + (90 + 120 * hn(k, 3)) * u, y + 4 * u]], { w: 2.5, seed: sd + 20 + k, t })); }
          tableD.setAttribute('d', TD.join(' ')); tableL.setAttribute('d', TL.join(' '));
          glow.setAttribute('d', inkCircle(0.86 * W, TOP + 40 * u, 420 * u, sd + 60, t, { fill: true }));
          cnd.update(t, 0.88 * W, TOP + 120 * u, 1.5 * u);
          // bowl (drill mode: the bone starts in it)
          const bx = 0.26 * W, by = 0.8 * H;
          const bp = bowlPath(bx, by, 220 * u);
          const B = brushB(), HB = hands; HB.reset();
          const TF = [], TFL = [], PF = [], PL = [], TH = [];
          let awl = null;
          const DU = [];
          if (mode === 'drill') {
            bowlF.setAttribute('d', inkLoop(bp, { seed: sd + 70, t, amp: 0.6 }));
            bowlIn.setAttribute('d', inkCircle(bx, by - 77 * u, 208 * u, sd + 71, t, { fill: true, ry: 40 * u }));
            bowlL.setAttribute('d', inkPath(bp, { w: 7, seed: sd + 72, t, closed: true, amp: 0.6 }));
            const save = P.saved ? -2 : (P.save_at ?? atOr(cues, 'save', dur * 0.2)), drill = P.drill === false ? 1e9 : P.saved ? atOr(cues, 'drill', 0.3) : atOr(cues, 'drill', dur * 0.55);
            const up = progIO(lt, save, P.save_at != null ? 0.4 : 0.9);
            const x = lerp(bx + 40 * u, 0.5 * W, up), y = lerp(by - 130 * u, 0.4 * H, up), s = lerp(0.8, 1.25, up) * u, rot = lerp(0.35, 0, up);
            const nh = lt < drill ? 0 : Math.min(10, Math.floor((lt - drill) / 0.2) + 1);
            brush(B, sd + 300, t, x, y, s, rot, { holes: nh, tufts: 0 });
            // left hand holds the knobby end
            const hin = P.save_at != null ? progIO(lt, save, 0.3) : progIO(lt, save + 0.1, 0.6);
            bigHand(HB.B, sd + 400, t, lerp(1.4 * W, W + 160 * u, hin), y + 80 * u, lerp(1.3 * W, x + 200 * s, hin), y + 8 * u, 1.3 * u, sleeveCols[0]);
            // the awl twisting into the current hole
            if (lt > drill - 0.5) {
              const ain = progIO(lt, drill - 0.5, 0.5), hi = Math.max(0, Math.min(9, nh - 1));
              const tip = [x + HOLES[hi][0] * s, y + HOLES[hi][1] * s];
              const tw = Math.sin(t * 30) * 0.15;
              const dirx = -0.55 + tw, diry = 1;
              const dl = Math.hypot(dirx, diry);
              const ux = dirx / dl, uy = diry / dl, base = [tip[0] + ux * 120 * u, tip[1] + uy * 120 * u], end = [tip[0] + ux * 330 * u, tip[1] + uy * 330 * u];
              const off = (1 - ain) * 700 * u;
              awl = { tip: [tip[0], tip[1] + off], base: [base[0], base[1] + off], end: [end[0], end[1] + off], ux, uy };
              bigHand(HB.B, sd + 420, t, awl.end[0] - 200 * u, H + 200 * u, awl.end[0] - 10 * u, awl.end[1] - 30 * u, 1.35 * u, sleeveCols[0]);
              if (ain > 0.99) for (let i = 0; i < 10; i++) { const ph = (t * 1.6 + i / 10) % 1, a = hn(i, 5) * TAU; DU.push(inkDot(tip[0] + Math.cos(a) * ph * 90 * u, tip[1] + Math.sin(a) * ph * 60 * u + ph * ph * 60 * u, 5 * u, 5 * u, sd + 500 + i, t)); }
            }
            blank(pileF, pileL, thread);
          } else {
            blank(bowlF, bowlIn, bowlL);
            const tie = atOr(cues, 'tie', dur * 0.2);
            const x = 0.42 * W, y = 0.42 * H, s = 1.25 * u;
            const ntf = lt < tie ? 0 : Math.min(10, (lt - tie) / 0.28);
            brush(B, sd + 300, t, x, y, s, 0, { holes: 10, tufts: ntf, gleam: 0.9 * hp + (lt > done ? 0.15 : 0) });
            bigHand(HB.B, sd + 400, t, W + 160 * u, y + 80 * u, x + 200 * s, y + 8 * u, 1.3 * u, sleeveCols[0]);
            // a pile of loose bristles + red thread on the table
            for (let i = 0; i < 18; i++) { const a = -0.3 + hn(i, 7) * 0.6, px = 0.1 * W + hn(i, 8) * 220 * u, py = 0.76 * H + hn(i, 9) * 110 * u; PL.push(inkPath([[px, py], [px + Math.cos(a) * 150 * u, py + Math.sin(a) * 150 * u]], { w: 3, seed: sd + 600 + i, t, amp: 0.5 })); }
            PF.push(inkCircle(0.26 * W, 0.8 * H, 190 * u, sd + 640, t, { fill: true, ry: 70 * u }));
            TH.push(inkPath([[0.52 * W, 0.84 * H], [0.64 * W, 0.78 * H], [0.78 * W, 0.86 * H], [0.9 * W, 0.8 * H]], { w: 7, seed: sd + 650, t }), inkCircle(0.9 * W, 0.8 * H, 46 * u, sd + 651, t, { w: 9 }));
            // the next tuft in the right hand, travelling to its hole
            const k = Math.floor(ntf), f = ntf - k;
            if (lt >= tie - 0.6 && k < 10) {
              const h = HOLES[k], dst = [x + h[0] * s, y + (h[1] - 110) * s];
              const src = [0.3 * W, 0.74 * H];
              const p = lt < tie ? progIO(lt, tie - 0.6, 0.6) : clamp01(f * 1.6);
              const cpos = [lerp(src[0], dst[0], p), lerp(src[1], dst[1], p) - Math.sin(p * Math.PI) * 60 * u];
              const tp = [[-14, 0], [-22, -100], [22, -100], [14, 0]].map(q => [cpos[0] + q[0] * s, cpos[1] + 100 * s + q[1] * s]);
              TF.push(inkLoop(tp, { seed: sd + 700 + k, t, smooth: false, amp: 0.5 }));
              for (let b = -3; b <= 3; b++) TFL.push(inkPath([[cpos[0] + b * 2 * s, cpos[1] + 100 * s], [cpos[0] + b * 6 * s, cpos[1]]], { w: 3.2 * s, seed: sd + 720 + b, t, amp: 0.4 }));
              bigHand(HB.B, sd + 420, t, cpos[0] - 160 * u, H + 200 * u, cpos[0] - 20 * u, cpos[1] + 130 * s, 1.2 * u, sleeveCols[0]);
            }
            pileF.setAttribute('d', PF.join(' ')); pileL.setAttribute('d', PL.join(' ')); thread.setAttribute('d', TH.join(' '));
          }
          BR.set(B);
          dust.setAttribute('d', DU.join(' '));
          const EY = 0.9 * H;
          edgeF.setAttribute('d', inkLoop(sq(-20, EY, W + 20, H + 20), { seed: sd + 950, t, smooth: false, amp: 0.4 }));
          edgeL.setAttribute('d', [inkPath([[-20, EY], [W + 20, EY - 4]], { w: 8, seed: sd + 951, t }), inkPath([[-20, EY + 40 * u], [W + 20, EY + 38 * u]], { w: 3, seed: sd + 952, t })].concat([0, 1, 2, 3, 4].map(k => inkPath([[k * 240 * u + 40 * u, EY + 70 * u], [k * 240 * u + 190 * u, EY + 76 * u]], { w: 2.5, seed: sd + 953 + k, t }))).join(' '));
          if (awl) {
            const { tip, base, end, ux, uy } = awl, nx = -uy, ny = ux;
            awlM.setAttribute('d', inkLoop([[tip[0], tip[1]], [base[0] + nx * 9 * u, base[1] + ny * 9 * u], [base[0] - nx * 9 * u, base[1] - ny * 9 * u]], { seed: sd + 800, t, smooth: false, amp: 0.4 }));
            const hd = [[base[0] + nx * 34 * u, base[1] + ny * 34 * u], [end[0] + nx * 40 * u, end[1] + ny * 40 * u], [end[0] - nx * 40 * u, end[1] - ny * 40 * u], [base[0] - nx * 34 * u, base[1] - ny * 34 * u]];
            awlF.setAttribute('d', inkLoop(hd, { seed: sd + 801, t, amp: 0.6 }));
            const AL = [inkPath(hd, { w: 6, seed: sd + 802, t, closed: true, amp: 0.6 }), inkPath([tip, base], { w: 4, seed: sd + 803, t })];
            const rotp = (t * 5) % 1;
            for (let k = 0; k < 3; k++) { const q = (k / 3 + rotp) % 1, mid = [lerp(base[0], end[0], 0.2 + 0.6 * q), lerp(base[1], end[1], 0.2 + 0.6 * q)]; AL.push(inkPath([[mid[0] + nx * 34 * u, mid[1] + ny * 34 * u], [mid[0] - nx * 34 * u, mid[1] - ny * 34 * u]], { w: 3, seed: sd + 804 + k, t })); }
            awlL.setAttribute('d', AL.join(' '));
          } else blank(awlF, awlM, awlL);
          tuftF.setAttribute('d', TF.join(' ')); tuftL.setAttribute('d', TFL.join(' '));
          hands.flush();
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tb_shop
  SH.tb_shop = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 773, root = el(svg, 'g'), u = W / 1080;
      const CT = (P.counter ?? 0.6) * H;
      const wall = inkEl(root, mix(INK.paperDark, INK.gold, 0.12)), wallL = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35));
      const shelfF = inkEl(root, WOOD()), shelfL = inkEl(root), jarF = inkEl(root, mix(INK.blue, INK.paperLight, 0.55)), jarL = inkEl(root);
      const BRs = brushEls(el(root, 'g'));
      const signF = inkEl(root, INK.ink), signR = inkEl(root, INK.gold), signL = inkEl(root);
      const signT = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 68 * u, fill: INK.gold, 'letter-spacing': 4 * u });
      const addis = window.LH.person(el(root, 'g'), sd + 40, { kind: 'sweater', col: mix(INK.green, INK.ink, 0.35), hair: 'dark', glasses: false });
      const apron = inkEl(root, INK.paperLight), apronL = inkEl(root);
      const cust = window.LH.person(el(root, 'g'), sd + 60, { kind: 'sweater', col: mix(INK.red, INK.ink, 0.3), hair: 'dark', glasses: false });
      const ctrTop = inkEl(root, mix(WOOD(), INK.paperLight, 0.2)), ctrF = inkEl(root, WOOD()), ctrL = inkEl(root), ctrD = inkEl(root, WOOD_D());
      const tray = inkEl(root, WOOD_D()), trayL = inkEl(root);
      const BRt = brushEls(el(root, 'g'));
      const coins = inkEl(root, INK.gold), coinsL = inkEl(root);
      const BRh = brushEls(el(root, 'g'));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pay = atOr(cues, 'pay', dur * 0.55), hit = atOr(cues, 'hit', dur * 0.5), hp = punch(lt, hit, 0.7);
          wall.setAttribute('d', inkLoop(sq(-20, -20, W + 20, CT), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          const WLn = []; for (let k = 0; k < 9; k++) WLn.push(inkPath([[k * 130 * u + 60 * u, 0], [k * 130 * u + 60 * u, CT]], { w: 2, seed: sd + 2 + k, t, amp: 0.5 }));
          wallL.setAttribute('d', WLn.join(' '));
          // shelves with jars full of bone toothbrushes
          const SF = [], SL = [], JF = [], JL = [], B = brushB();
          [0.24, 0.38].forEach((fy, r) => {
            const y = fy * H;
            SF.push(inkLoop(sq(-20, y, W + 20, y + 26 * u), { seed: sd + 20 + r, t, smooth: false, amp: 0.4 }));
            SL.push(inkPath(sq(-20, y, W + 20, y + 26 * u), { w: 5, seed: sd + 22 + r, t, closed: true, smooth: false }));
            for (let c = 0; c < 6; c++) {
              const jx = (c + 0.5 + (r % 2) * 0.3) / 6.3 * W, jw = 52 * u, jh = 96 * u;
              const jp = [[jx - jw, y], [jx + jw, y], [jx + jw * 1.1, y - jh], [jx - jw * 1.1, y - jh]];
              for (let b = 0; b < 4; b++) brush(B, sd + 100 + r * 40 + c * 5 + b, t, jx + (b - 1.5) * 22 * u, y - jh - 40 * u + Math.sin(t * 0.8 + b + c) * 2 * u, 0.24 * u, -Math.PI / 2 + (b - 1.5) * 0.18, { holes: 10, tufts: 10, knob: false });
              JF.push(inkLoop(jp, { seed: sd + 300 + r * 10 + c, t, smooth: false, amp: 0.4 }));
              JL.push(inkPath(jp, { w: 4.5, seed: sd + 320 + r * 10 + c, t, closed: true, smooth: false }));
            }
          });
          shelfF.setAttribute('d', SF.join(' ')); shelfL.setAttribute('d', SL.join(' ')); jarF.setAttribute('d', JF.join(' ')); jarL.setAttribute('d', JL.join(' '));
          BRs.set(B);
          // hanging sign
          const sw = Math.sin(t * 1.2) * 0.03, scx = 0.72 * W, scy = 0.09 * H, swd = 245 * u, shg = 84 * u;
          const rot = (p) => { const dx = p[0] - scx, dy = p[1] - (scy - 60 * u); return [scx + dx * Math.cos(sw) - dy * Math.sin(sw), scy - 60 * u + dx * Math.sin(sw) + dy * Math.cos(sw)]; };
          const sp = sq(scx - swd, scy - shg / 2, scx + swd, scy + shg / 2).map(rot);
          signF.setAttribute('d', inkLoop(sp, { seed: sd + 40, t, smooth: false, amp: 0.4 }));
          signR.setAttribute('d', inkPath(sq(scx - swd + 14 * u, scy - shg / 2 + 12 * u, scx + swd - 14 * u, scy + shg / 2 - 12 * u).map(rot), { w: 3, seed: sd + 41, t, closed: true, smooth: false }));
          signL.setAttribute('d', inkPath(sp, { w: 6, seed: sd + 42, t, closed: true, smooth: false }) + ' ' + inkPath([[scx - swd * 0.7, -20], rot([scx - swd * 0.7, scy - shg / 2])], { w: 4, seed: sd + 43, t }) + ' ' + inkPath([[scx + swd * 0.7, -20], rot([scx + swd * 0.7, scy - shg / 2])], { w: 4, seed: sd + 44, t }));
          signT.setAttribute('transform', `translate(${f1(scx)} ${f1(scy + 26 * u)}) rotate(${f1(sw * 57.3)})`);
          signT.textContent = P.sign || 'W. ADDIS';
          // Addis behind the counter hands over a brush; the customer pays
          const give = progIO(lt, pay + 0.1, 0.7);
          const ax = 0.66 * W, au = 1.2 * u;
          const o = addis.update(t, ax, CT + 160 * u, au, { face: -1, lean: 6 + 6 * give, armR: [lerp(0.6 * W, 0.46 * W, give), lerp(CT - 40 * u, CT - 130 * u, give)], armL: [0.74 * W, CT - 20 * u], look: [6, 6], brow: 0.3, mouth: 0.3 * Math.max(0, Math.sin(t * 6)) });
          const ap = [[o.sh[0] - 40 * u, o.sh[1] + 90 * u], [o.sh[0] + 40 * u, o.sh[1] + 90 * u], [o.sh[0] + 60 * u, CT + 20 * u], [o.sh[0] - 60 * u, CT + 20 * u]];
          apron.setAttribute('d', inkLoop(ap, { seed: sd + 50, t, smooth: false, amp: 0.6 }));
          apronL.setAttribute('d', inkPath(ap, { w: 4, seed: sd + 51, t, closed: true, smooth: false, amp: 0.6 }));
          const Bh = brushB();
          brush(Bh, sd + 520, t, o.hR[0] - 40 * u, o.hR[1] - 20 * u, 0.42 * u, -0.3, { holes: 10, tufts: 10, knob: false, gleam: 0.6 * hp });
          BRh.set(Bh);
          const cx = 0.24 * W, cuu = 1.35 * u, reach = progIO(lt, pay - 0.5, 0.5);
          const oc = cust.update(t, cx, CT + 420 * u, cuu, { face: 1, lean: 4 + 8 * reach, armR: [lerp(0.3 * W, 0.42 * W, reach), lerp(CT + 60 * u, CT - 60 * u, reach)], armL: [0.18 * W, CT + 120 * u], look: [6, 0], brow: 0.5 * give });
          void oc;
          // counter to the frame bottom
          ctrTop.setAttribute('d', inkLoop(sq(-20, CT, W + 20, CT + 44 * u), { seed: sd + 60, t, smooth: false, amp: 0.4 }));
          ctrF.setAttribute('d', inkLoop(sq(-20, CT + 44 * u, W + 20, H + 20), { seed: sd + 61, t, smooth: false, amp: 0.4 }));
          const CL = [inkPath(sq(-20, CT, W + 20, CT + 44 * u), { w: 6, seed: sd + 62, t, closed: true, smooth: false })], CD = [];
          for (let k = 0; k < 4; k++) { const x0 = k * 280 * u + 30 * u; CL.push(inkPath(sq(x0, CT + 100 * u, x0 + 230 * u, 0.94 * H), { w: 4, seed: sd + 63 + k, t, closed: true, smooth: false })); CD.push(inkLoop(sq(x0 + 26 * u, CT + 126 * u, x0 + 204 * u, 0.92 * H), { seed: sd + 70 + k, t, smooth: false, amp: 0.4 })); }
          ctrL.setAttribute('d', CL.join(' ')); ctrD.setAttribute('d', CD.join(' '));
          // tray of brushes on the counter
          const tp = [[0.58 * W, CT + 8 * u], [0.98 * W, CT + 8 * u], [0.96 * W, CT - 30 * u], [0.6 * W, CT - 30 * u]];
          tray.setAttribute('d', inkLoop(tp, { seed: sd + 80, t, smooth: false, amp: 0.4 }));
          trayL.setAttribute('d', inkPath(tp, { w: 5, seed: sd + 81, t, closed: true, smooth: false }));
          const Bt = brushB();
          for (let b = 0; b < 4; b++) brush(Bt, sd + 600 + b * 7, t, 0.78 * W, CT - 26 * u - b * 16 * u, 0.5 * u, 0.04 * (b - 1.5), { holes: 10, tufts: 10, knob: false });
          BRt.set(Bt);
          // coins land on the counter from "pay" and stack
          const CN = [], CNL = [];
          const nC = lt < pay ? 0 : Math.min(5, Math.floor((lt - pay) / 0.18) + 1);
          for (let k = 0; k < nC; k++) { const fall = progIO(lt, pay + k * 0.18, 0.25), y = lerp(CT - 160 * u, CT - 10 * u - k * 14 * u, fall); CN.push(inkCircle(0.44 * W, y, 34 * u, sd + 700 + k, t, { fill: true, ry: 12 * u })); CNL.push(inkCircle(0.44 * W, y, 34 * u, sd + 710 + k, t, { w: 4, ry: 12 * u })); }
          coins.setAttribute('d', CN.join(' ')); coinsL.setAttribute('d', CNL.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ modern toothbrush (upright in a glass)
  function modernBrush(B, sd, t, x, y, s, rot, col) {
    const c = Math.cos(rot), si = Math.sin(rot);
    const T = p => [x + (p[0] * c - p[1] * si) * s, y + (p[0] * si + p[1] * c) * s], TT = q => q.map(T);
    const hd = [[-14, 0], [-18, -300], [-12, -330], [12, -330], [18, -300], [14, 0]];
    (B.col[col] || (B.col[col] = [])).push(inkLoop(TT(hd), { seed: sd + 1, t, amp: 0.6 }));
    B.line.push(inkPath(TT(hd), { w: 5 * s + 1, seed: sd + 2, t, closed: true, amp: 0.6 }));
    const br = [[18, -250], [64, -256], [66, -330], [18, -326]];
    B.white.push(inkLoop(TT(br), { seed: sd + 3, t, smooth: false, amp: 0.5 }));
    B.line.push(inkPath(TT(br), { w: 4 * s + 1, seed: sd + 4, t, closed: true, smooth: false, amp: 0.5 }));
    for (let k = 0; k < 4; k++) B.line.push(inkPath(TT([[22, -260 - k * 18], [62, -262 - k * 18]]), { w: 2.5, seed: sd + 5 + k, t, amp: 0.4 }));
  }

  // ------------------------------------------------------------------ SHOTS.tb_bath
  SH.tb_bath = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 887, root = el(svg, 'g'), u = W / 1080;
      const CT = (P.counter ?? 0.56) * H;
      const tiles = inkEl(root, TILE()), tileL = inkEl(root, mix(INK.blue, INK.paperDark, 0.45));
      const mirF = inkEl(root, mix(INK.paperLight, INK.blue, 0.3)), mirS = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 }), mirL = inkEl(root);
      const lampG = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), lampF = inkEl(root, INK.paperLight), lampL = inkEl(root);
      const kasG = el(root, 'g');
      const cabF = inkEl(root, INK.paperLight), cabD = inkEl(root, mix(INK.paperDark, INK.blue, 0.15)), cabL = inkEl(root), knobs = inkEl(root, IRON());
      const floorF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.4)), floorL = inkEl(root, STONE_D());
      const topF = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.25)), sinkF = inkEl(root, INK.paperLight), sinkIn = inkEl(root, mix(INK.paperDark, INK.blue, 0.2)), tapF = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.3)), drop = inkEl(root, INK.blue), topL = inkEl(root);
      const glassB = inkEl(root, mix(INK.blue, INK.paperLight, 0.65), { 'fill-opacity': 0.85 });
      const cols = [INK.blue, INK.red, INK.green];
      const mbG = el(root, 'g'), mbE = {}; cols.forEach(c => { mbE[c] = inkEl(mbG, c); }); const mbW = inkEl(mbG, INK.paperLight), mbL = inkEl(mbG);
      const glassL = inkEl(root), glassS = inkEl(root, INK.paperLight, { 'fill-opacity': 0.6 });
      const standF = inkEl(root, WOOD_D()), standL = inkEl(root);
      const BRo = brushEls(el(root, 'g'));
      const K = P.kasif || null;
      const kas = kasifOf(kasG, K, W, H, sd);
      const kBrush = { col: {}, white: [], line: [] };
      const kbG = el(root, 'g'), kbE = inkEl(kbG, INK.blue), kbW = inkEl(kbG, INK.paperLight), kbL = inkEl(kbG), foam = inkEl(root, INK.paperLight), foamL = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // tiled wall
          tiles.setAttribute('d', inkLoop(sq(-20, -20, W + 20, CT), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          const TL = [], ts = 120 * u; for (let k = 1; k * ts < CT; k++) TL.push(inkPath([[-20, k * ts], [W + 20, k * ts]], { w: 2.5, seed: sd + 2 + k, t, amp: 0.4 }));
          for (let k = 0; k * ts < W + ts; k++) TL.push(inkPath([[k * ts, -20], [k * ts, CT]], { w: 2.5, seed: sd + 30 + k, t, amp: 0.4 }));
          tileL.setAttribute('d', TL.join(' '));
          // mirror + lamp
          const m0 = 0.12 * W, m1 = 0.88 * W, my0 = 0.13 * H, my1 = 0.44 * H;
          mirF.setAttribute('d', inkLoop(sq(m0, my0, m1, my1), { seed: sd + 50, t, smooth: false, amp: 0.4 }));
          const sh = (t * 0.08) % 1;
          mirS.setAttribute('d', inkLoop([[lerp(m0, m1, sh * 0.6), my0 + 10 * u], [lerp(m0, m1, sh * 0.6) + 90 * u, my0 + 10 * u], [lerp(m0, m1, sh * 0.6) - 60 * u, my1 - 10 * u], [lerp(m0, m1, sh * 0.6) - 150 * u, my1 - 10 * u]], { seed: sd + 51, t, smooth: false, amp: 0.4 }));
          mirL.setAttribute('d', inkPath(sq(m0, my0, m1, my1), { w: 9, seed: sd + 52, t, closed: true, smooth: false }));
          lampG.setAttribute('d', inkCircle(0.7 * W, 0.09 * H, 180 * u, sd + 53, t, { fill: true, ry: 80 * u }));
          lampF.setAttribute('d', inkLoop(sq(0.56 * W, 0.08 * H, 0.84 * W, 0.11 * H), { seed: sd + 54, t, smooth: false, amp: 0.4 }));
          lampL.setAttribute('d', inkPath(sq(0.56 * W, 0.08 * H, 0.84 * W, 0.11 * H), { w: 5, seed: sd + 55, t, closed: true, smooth: false }));
          // cabinet + floor to the bottom
          cabF.setAttribute('d', inkLoop(sq(0.02 * W, CT + 40 * u, 0.98 * W, 0.9 * H), { seed: sd + 60, t, smooth: false, amp: 0.4 }));
          const CD = [], CL = [inkPath(sq(0.02 * W, CT + 40 * u, 0.98 * W, 0.9 * H), { w: 6, seed: sd + 61, t, closed: true, smooth: false })], KN = [];
          [[0.05, 0.49], [0.51, 0.95]].forEach(([a, b], i) => { CD.push(inkLoop(sq(a * W + 20 * u, CT + 80 * u, b * W - 20 * u, 0.87 * H), { seed: sd + 62 + i, t, smooth: false, amp: 0.4 })); CL.push(inkPath(sq(a * W, CT + 60 * u, b * W, 0.89 * H), { w: 4, seed: sd + 64 + i, t, closed: true, smooth: false })); KN.push(inkDot(i ? a * W + 40 * u : b * W - 40 * u, CT + 220 * u, 14 * u, 14 * u, sd + 66 + i, t)); });
          cabD.setAttribute('d', CD.join(' ')); cabL.setAttribute('d', CL.join(' ')); knobs.setAttribute('d', KN.join(' '));
          floorF.setAttribute('d', inkLoop(sq(-20, 0.9 * H, W + 20, H + 20), { seed: sd + 67, t, smooth: false, amp: 0.4 }));
          floorL.setAttribute('d', [0, 1, 2, 3].map(k => inkPath([[-20, 0.9 * H + k * 50 * u], [W + 20, 0.9 * H + k * 50 * u]], { w: 3, seed: sd + 68 + k, t })).join(' '));
          // the host (in front of the cabinet, behind the counter top edge is not needed: he stands in front)
          if (kas) {
            const o = kas.update(lt, t, cues);
            const fc = K.face === 'left' || K.face === -1 ? -1 : 1, s = (K.scale ?? 1.2), ox = (K.x ?? 0.5) * W, oy = (K.y ?? 0.8) * H;
            const S2 = p => [ox + p[0] * s * fc, oy + p[1] * s];
            const until = atOr(cues, K.brush, -1);
            kBrush.col = {}; kBrush.white = []; kBrush.line = [];
            if (lt < until) {
              const hc = S2(o.head), hands = o.hands.map(S2), mouth = [hc[0] + 14 * s * fc, hc[1] + 36 * s];
              const hand = hands.reduce((a, b) => Math.hypot(b[0] - mouth[0], b[1] - mouth[1]) < Math.hypot(a[0] - mouth[0], a[1] - mouth[1]) ? b : a);
              const scrub = Math.sin(t * 16) * 10 * u;
              modernBrush(kBrush, sd + 900, t, hand[0] + scrub, hand[1] + 40 * u, 0.7 * u, -1.25 * fc, INK.blue);
              foam.setAttribute('d', [0, 1, 2, 3].map(i => inkCircle(mouth[0] + (i - 1.5) * 16 * u, mouth[1] + Math.sin(t * 9 + i) * 4 * u, 14 * u, sd + 920 + i, t, { fill: true })).join(' '));
              foamL.setAttribute('d', [0, 1, 2, 3].map(i => inkCircle(mouth[0] + (i - 1.5) * 16 * u, mouth[1] + Math.sin(t * 9 + i) * 4 * u, 14 * u, sd + 930 + i, t, { w: 3 })).join(' '));
            } else blank(foam, foamL);
            kbE.setAttribute('d', (kBrush.col[INK.blue] || []).join(' ')); kbW.setAttribute('d', kBrush.white.join(' ')); kbL.setAttribute('d', kBrush.line.join(' '));
          } else blank(kbE, kbW, kbL, foam, foamL);
          // counter top with sink, tap, glass of brushes
          topF.setAttribute('d', inkLoop(sq(-20, CT, W + 20, CT + 44 * u), { seed: sd + 70, t, smooth: false, amp: 0.4 }));
          const TLn = [inkPath(sq(-20, CT, W + 20, CT + 44 * u), { w: 6, seed: sd + 71, t, closed: true, smooth: false })];
          const sx = 0.54 * W;
          sinkF.setAttribute('d', inkCircle(sx, CT + 6 * u, 165 * u, sd + 72, t, { fill: true, ry: 30 * u }));
          sinkIn.setAttribute('d', inkCircle(sx, CT + 8 * u, 130 * u, sd + 73, t, { fill: true, ry: 20 * u }));
          TLn.push(inkCircle(sx, CT + 6 * u, 165 * u, sd + 74, t, { w: 5, ry: 30 * u }));
          const tp = [[sx - 22 * u, CT - 4 * u], [sx + 22 * u, CT - 4 * u], [sx + 22 * u, CT - 120 * u], [sx + 120 * u, CT - 120 * u], [sx + 120 * u, CT - 80 * u], [sx + 96 * u, CT - 80 * u], [sx + 96 * u, CT - 96 * u], [sx - 22 * u, CT - 96 * u]];
          tapF.setAttribute('d', inkLoop(tp, { seed: sd + 75, t, smooth: false, amp: 0.4 }));
          TLn.push(inkPath(tp, { w: 5, seed: sd + 76, t, closed: true, smooth: false }));
          const dp = (t * 1.2) % 1;
          drop.setAttribute('d', inkDot(sx + 108 * u, CT - 74 * u + dp * dp * 90 * u, 9 * u, 13 * u, sd + 77, t));
          topL.setAttribute('d', TLn.join(' '));
          // glass with modern brushes
          const gx = (P.glass_x ?? 0.76) * W, gw = 74 * u, gh = 190 * u;
          const gp = [[gx - gw * 0.85, CT], [gx + gw * 0.85, CT], [gx + gw, CT - gh], [gx - gw, CT - gh]];
          glassB.setAttribute('d', inkLoop(gp, { seed: sd + 80, t, smooth: false, amp: 0.4 }));
          const MB = { col: {}, white: [], line: [] };
          [[-0.18, INK.blue], [0.02, INK.red], [0.2, INK.green]].forEach(([r, c], i) => modernBrush(MB, sd + 100 + i * 10, t, gx + (i - 1) * 26 * u, CT - 30 * u, 1.05 * u, r + Math.sin(t * 0.7 + i) * 0.015, c));
          cols.forEach(c => mbE[c].setAttribute('d', (MB.col[c] || []).join(' '))); mbW.setAttribute('d', MB.white.join(' ')); mbL.setAttribute('d', MB.line.join(' '));
          glassL.setAttribute('d', inkPath(gp, { w: 5, seed: sd + 81, t, closed: true, smooth: false }));
          glassS.setAttribute('d', inkLoop([[gx - gw * 0.6, CT - 20 * u], [gx - gw * 0.45, CT - 20 * u], [gx - gw * 0.55, CT - gh + 20 * u], [gx - gw * 0.72, CT - gh + 20 * u]], { seed: sd + 82, t, smooth: false, amp: 0.3 }));
          // the old bone brush springs up beside the glass on a little stand
          const B = brushB();
          const oc = atOr(cues, P.old, null);
          if (oc != null && lt > oc - 0.05) {
            const sp = spring(lt, oc, 0.6), ox = (P.old_x ?? 0.3) * W, gr = progIO(lt, atOr(cues, 'hit', 1e9), 0.6), oy = CT - 120 * u - gr * 150 * u;
            standF.setAttribute('d', inkLoop(sq(ox - 150 * u, CT - 30 * u, ox + 150 * u, CT), { seed: sd + 90, t, smooth: false, amp: 0.4 }) + ' ' + inkLoop([[ox - 110 * u, oy + 50 * u], [ox - 90 * u, oy + 50 * u], [ox - 80 * u, CT - 30 * u], [ox - 120 * u, CT - 30 * u]], { seed: sd + 91, t, smooth: false }) + ' ' + inkLoop([[ox + 90 * u, oy + 50 * u], [ox + 110 * u, oy + 50 * u], [ox + 120 * u, CT - 30 * u], [ox + 80 * u, CT - 30 * u]], { seed: sd + 92, t, smooth: false }));
            standL.setAttribute('d', inkPath(sq(ox - 150 * u, CT - 30 * u, ox + 150 * u, CT), { w: 5, seed: sd + 93, t, closed: true, smooth: false }));
            brush(B, sd + 950, t, ox, oy + (1 - sp) * 100 * u, 0.48 * u * Math.max(0.05, sp) * (1 + 0.6 * gr), -0.12 * gr, { holes: 10, tufts: 10, gleam: 0.25 + 0.6 * punch(lt, oc, 0.9) + 0.6 * gr });
          } else blank(standF, standL);
          BRo.set(B);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
