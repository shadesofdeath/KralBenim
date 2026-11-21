// fh_forssmann: shots for the Stickstory Short "Werner Forssmann: the doctor who put a tube in his own heart"
// (2026-11-21). Eberswalde, Germany, 1929: the young doctor Werner Forssmann wants to reach the heart through a vein;
// his boss forbids it; the operating nurse Gerda Ditzen unlocks the instruments and offers to be the subject, but he
// straps her to the table and uses his own arm; he walks down to the X-ray room and photographs the catheter inside his
// heart; mocked, he leaves heart medicine; Nobel Prize 1956. Non-graphic on purpose: no blood, no needle, the tube enters
// under a white bandage and is drawn as a clean "see-through" line.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.person, LH.kasif, LH.label, LH.lamp,
// LH.front). Portrait 1080×1920 (Shorts).
//
// Common params: labels: [{text, x, y, at, size, color, font, card, rot, underline}] (LH.label)
//   kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} (LH.kasif)
//
// SHOTS.fh_body — a big front-view bust of the young doctor in a lab coat with a see-through chest (ribs, beating red
//   heart). P: {mode: "hook" (a gold tube slides from the bandaged left elbow up the arm vein to the heart, cue "tube"
//   start -> cue "heart" arrival, gold rings pulse) | "plan" (the bust is an anatomy chart pinned to a tiled wall; a red
//   dashed route draws itself from the elbow to the heart on cue "route"; the doctor stands in front and points),
//   labels, kasif}
// SHOTS.fh_hospital — a 1920s brick hospital with a steep roof, smoking chimney, lit windows, trees, a nurse walking
//   along the path; iron fence and hedge in front (use with set "city"). P: {labels}
// SHOTS.fh_office — the chief's office: wood panels, window, diploma; the white-haired chief behind his desk; the
//   young doctor holds out the coiled tube; on cue "no" the chief shakes his head and lifts his hand. P: {labels, kasif}
// SHOTS.fh_room — the 1920s operating room: tiled walls, round surgical lamp, checker floor.
//   P: {mode: "cabinet" (the nurse unlocks the glass instrument cabinet at cue "unlock", takes the coiled tube; at cue
//   "offer" she turns and points to her own arm) | "strap" (the nurse lies on the operating table; leather straps drop
//   over the sheet at cue "strap"; the doctor sits beside her with his own arm on a board, a tube goes in under a
//   bandage and a gold see-through line climbs his arm to his heart from cue "own"), labels, kasif}
// SHOTS.fh_stairs — a hospital stairwell: the doctor walks down the stairs holding his arm (tube dangling), the nurse
//   behind him; a door glowing at the bottom with a sign "X-RAY". P: {labels}
// SHOTS.fh_xray — an X-ray film on a lightbox: ribs, spine, collarbones, the heart's shadow and the bright catheter
//   line from the left arm into the heart. P: {mode: "plate" (big; the catheter draws in, at cue "heart" a gold ring
//   pulses round its tip) | "host" (smaller lightbox on the left, Kaşif beside it), labels, kasif}
// SHOTS.fh_mock — a lecture room: the doctor holds up his X-ray before a blackboard heart; rows of laughing experts in
//   the foreground rock with laughter; at cue "quit" a red cross strikes the blackboard heart and he hangs his head.
//   P: {labels}
// SHOTS.fh_nobel — a gold medal swinging on a blue ribbon before a curtain, a year counter rolling 1929 -> 1956 (cue
//   "years"), the old doctor (white hair, glasses) smiling at it, flowers along the stage front. P: {labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const sq = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const S = (e, d) => e.setAttribute('d', d);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const kasifOf = (parent, K, W, H, sd) => K ? window.LH.kasif(el(parent, 'g'), K, W, H, sd) : null;
  const SERIF = 'Fraunces, Georgia, serif';

  const SKIN = () => mix(INK.paperDark, INK.stain, 0.2);
  const COAT = () => INK.paperLight;
  const TILE = () => mix(INK.paperLight, INK.blue, 0.1);
  const TILE_L = () => mix(INK.paperDark, INK.blue, 0.22);
  const WALL = () => mix(INK.paperDark, INK.paperLight, 0.35);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.2);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const BRICK = () => mix(INK.red, INK.paperDark, 0.42);
  const ROOF = () => mix(INK.ink, INK.inkSoft, 0.45);
  const STEEL = () => mix(INK.blue, INK.inkSoft, 0.5);
  const NURSE = () => mix(INK.blue, INK.paperLight, 0.45);
  const LEATHER = () => mix(INK.stain, INK.ink, 0.25);
  const FILM = () => mix(INK.ink, INK.blue, 0.22);
  const BONE = () => mix(INK.paperLight, INK.blue, 0.18);
  const TUBE = () => INK.gold;
  const LEAF = () => mix(INK.green, INK.paperDark, 0.15);
  const LEAF_D = () => mix(INK.green, INK.ink, 0.3);

  // arc-length partial polyline (0..1)
  function partial(pts, p) {
    if (p <= 0) return [];
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let want = tot * Math.min(1, p); const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (want >= L[i - 1]) { out.push(pts[i]); want -= L[i - 1]; continue; }
      const q = want / L[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], q), lerp(pts[i - 1][1], pts[i][1], q)]); break;
    }
    return out;
  }
  // dashed version of a polyline (dash length d, gap g), revealed up to p
  function dashes(pts, p, d, g, sd, t, w) {
    const P = partial(pts, p); if (P.length < 2) return '';
    const out = []; let acc = 0, on = true, cur = [P[0]];
    for (let i = 1; i < P.length; i++) {
      let a = P[i - 1]; const b = P[i]; let seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      while (seg > 0) {
        const lim = (on ? d : g) - acc;
        if (seg >= lim) {
          const q = lim / seg, m = [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
          if (on) { cur.push(m); out.push(inkPath(cur, { w, seed: sd + out.length, t, amp: 0.6, taper: 0.1 })); }
          on = !on; acc = 0; cur = [m]; a = m; seg -= lim;
        } else { if (on) cur.push(b); acc += seg; seg = 0; }
      }
    }
    if (on && cur.length > 1) out.push(inkPath(cur, { w, seed: sd + 99, t, amp: 0.6, taper: 0.1 }));
    return out.join(' ');
  }
  // a classic anatomical heart, centre (x, y), size r, pulse k
  function heartPts(x, y, r) {
    const P = [[-0.55, -0.35], [-0.2, -0.62], [0.25, -0.6], [0.62, -0.32], [0.72, 0.05], [0.5, 0.45], [0.18, 0.78], [0.02, 0.86], [-0.28, 0.5], [-0.6, 0.12]];
    return P.map(q => [x + q[0] * r, y + q[1] * r]);
  }

  // ------------------------------------------------------------------ the young doctor, front-view bust
  // units: s; origin (cx, cy) = chest centre. His left arm (with the tube) is on the viewer's right.
  function bust(parent, sd) {
    const g = el(parent, 'g');
    const sleeveL = inkEl(g, COAT()), sleeveR = inkEl(g, COAT()), coat = inkEl(g, COAT()), shirt = inkEl(g, INK.paperLight), tie = inkEl(g, INK.blue);
    const armWin = inkEl(g, mix(INK.paperLight, INK.blue, 0.16)), win = inkEl(g, mix(INK.paperLight, INK.blue, 0.16)), ribs = inkEl(g, mix(INK.inkSoft, INK.blue, 0.25)), winR = inkEl(g, INK.inkSoft);
    const glow = inkEl(g, INK.gold, { 'fill-opacity': 0.35 }), heart = inkEl(g, INK.red), heartD = inkEl(g, mix(INK.red, INK.ink, 0.35)), heartL = inkEl(g);
    const vein = inkEl(g, INK.blue), route = inkEl(g, INK.red);
    const tubeO = inkEl(g), tubeI = inkEl(g, TUBE()), tip = inkEl(g, INK.gold);
    const band = inkEl(g, INK.paperLight), lines = inkEl(g);
    const neck = inkEl(g, SKIN()), head = inkEl(g, SKIN()), hair = inkEl(g, INK.ink), face = inkEl(g), hands = inkEl(g, SKIN());
    function update(t, o) {
      const s = o.s, cx = o.cx, cy = o.cy, k = sd;
      const T = (x, y) => [cx + x * s, cy + y * s], TT = a => a.map(q => T(q[0], q[1]));
      const bottom = o.bottom ?? 2000;
      // sleeves: his right arm hangs on the viewer's left, his left arm reaches out to the viewer's right
      const armR = TT([[-215, -400], [-300, -120], [-330, 220]]), armL = TT([[215, -400], [330, -90], [450, 180]]);
      S(sleeveL, inkPath(armR, { w: 118 * s, seed: k + 1, t, taper: 0.05, amp: 1 }));
      S(sleeveR, inkPath(armL, { w: 112 * s, seed: k + 2, t, taper: 0.05, amp: 1 }));
      const CP = TT([[-80, -470], [80, -470], [235, -420], [262, Math.min(bottom, 900)], [-262, Math.min(bottom, 900)], [-235, -420]]);
      S(coat, inkLoop(CP, { seed: k + 3, t, smooth: false, amp: 1 }));
      S(shirt, inkLoop(TT([[-58, -470], [58, -470], [0, -300]]), { seed: k + 4, t, smooth: false, amp: 0.6 }));
      S(tie, inkLoop(TT([[-12, -455], [12, -455], [16, -330], [0, -300], [-16, -330]]), { seed: k + 5, t, smooth: false, amp: 0.5 }));
      // see-through chest window
      const wc = T(10, -170), wrx = 205 * s, wry = 235 * s;
      S(win, inkCircle(wc[0], wc[1], wrx, k + 6, t, { ry: wry, fill: true }));
      const RB = [inkPath([T(0, -380), T(0, -40)], { w: 9 * s + 2, seed: k + 7, t, amp: 0.6 })];
      for (let i = 0; i < 6; i++) {
        const y = -350 + i * 52, wd = 150 + Math.sin((i + 1) / 7 * Math.PI) * 30;
        RB.push(inkPath([T(-8, y), T(-wd * 0.6, y - 6), T(-wd, y + 30), T(-wd * 0.95, y + 58)], { w: 7 * s + 1, seed: k + 10 + i, t, amp: 0.6 }));
        RB.push(inkPath([T(8, y), T(wd * 0.6, y - 6), T(wd, y + 30), T(wd * 0.95, y + 58)], { w: 7 * s + 1, seed: k + 20 + i, t, amp: 0.6 }));
      }
      RB.push(inkPath([T(-30, -400), T(-120, -420), T(-190, -400)], { w: 9 * s + 1, seed: k + 30, t }), inkPath([T(30, -400), T(120, -420), T(190, -400)], { w: 9 * s + 1, seed: k + 31, t }));
      S(ribs, RB.join(' '));
      S(winR, inkCircle(wc[0], wc[1], wrx, k + 32, t, { ry: wry, w: 5 }));
      // the heart (beats ~72 / min)
      const beat = Math.pow(Math.max(0, Math.sin(t * TAU * 1.2)), 6), hr = (78 + 7 * beat) * s * (1 + 0.1 * (o.hp || 0));
      const hc = T(42, -150);
      S(heart, inkLoop(heartPts(hc[0], hc[1], hr), { seed: k + 33, t, amp: 0.8 }));
      S(heartD, inkLoop([[hc[0] - 0.1 * hr, hc[1] - 0.56 * hr], [hc[0] + 0.05 * hr, hc[1] - 1.05 * hr], [hc[0] + 0.45 * hr, hc[1] - 1.12 * hr], [hc[0] + 0.62 * hr, hc[1] - 0.95 * hr], [hc[0] + 0.32 * hr, hc[1] - 0.86 * hr], [hc[0] + 0.2 * hr, hc[1] - 0.54 * hr]], { seed: k + 34, t, amp: 0.6 }));
      S(heartL, inkPath(heartPts(hc[0], hc[1], hr), { w: 6, seed: k + 35, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[hc[0] - 0.05 * hr, hc[1] - 0.3 * hr], [hc[0] + 0.2 * hr, hc[1] + 0.2 * hr], [hc[0] + 0.05 * hr, hc[1] + 0.7 * hr]], { w: 3.5, seed: k + 36, t }));
      // vein: elbow -> upper arm -> under the collarbone -> top of the heart (right atrium side)
      const V = TT([[352, -40], [305, -180], [262, -290], [190, -318], [110, -300], [40, -250], [4, -190]]);
      S(armWin, inkPath(V.slice(0, 4), { w: 46 * s, seed: k + 39, t, amp: 0.6, taper: 0 }));
      S(vein, o.vein === false ? '' : inkPath(V, { w: 9 * s + 1.5, seed: k + 40, t, amp: 0.6 }));
      S(route, o.route != null ? dashes(V, o.route, 30 * s + 6, 18 * s + 4, k + 200, t, 11 * s + 2) : '');
      // the tube: from outside (dangling below the elbow) up the vein to p
      const p = o.tube ?? -1;
      const outside = TT([[470, 230], [430, 120], [380, 40], [352, -40]]);
      if (p >= 0) {
        const inside = partial(V, p), path = outside.concat(inside.slice(1));
        S(tubeO, inkPath(path, { w: 20 * s + 3, seed: k + 41, t, amp: 0.6, taper: 0 }));
        S(tubeI, inkPath(path, { w: 10 * s + 1.5, seed: k + 42, t, amp: 0.6, taper: 0 }));
        const e = path[path.length - 1];
        S(tip, inkCircle(e[0], e[1], 12 * s + 2, k + 43, t, { fill: true }));
        const gl = o.glow || 0;
        const RG = [];
        if (gl > 0) for (let i = 0; i < 3; i++) { const ph = (t * 0.9 + i / 3) % 1; RG.push(inkCircle(hc[0], hc[1], hr * (1.1 + ph * 1.3), k + 44 + i, t, { w: (14 - ph * 10) * s * gl + 1 })); }
        S(glow, RG.join(' '));
      } else { S(tubeO, ''); S(tubeI, ''); S(tip, ''); S(glow, ''); }
      // bandage at the elbow + coat lines
      const eb = T(352, -40);
      S(band, inkLoop([[eb[0] - 70 * s, eb[1] - 30 * s], [eb[0] + 60 * s, eb[1] - 60 * s], [eb[0] + 78 * s, eb[1] + 6 * s], [eb[0] - 52 * s, eb[1] + 36 * s]], { seed: k + 50, t, smooth: false, amp: 0.6 }));
      const LN = [inkPath(CP, { w: 6, seed: k + 51, t, closed: true, smooth: false }),
        inkPath(TT([[-80, -470], [-20, -320], [0, -60]]), { w: 5, seed: k + 52, t }), inkPath(TT([[80, -470], [20, -320], [0, -60]]), { w: 5, seed: k + 53, t }),
        inkPath(armR.map((q, i) => [q[0] - 56 * s, q[1] + (i ? 0 : 20 * s)]), { w: 5, seed: k + 54, t }), inkPath(armR.map((q, i) => [q[0] + 56 * s, q[1] + (i ? 0 : 20 * s)]), { w: 5, seed: k + 55, t }),
        inkPath(armL.map((q, i) => [q[0] - 52 * s, q[1] + (i ? 4 : 30) * s]), { w: 5, seed: k + 56, t }), inkPath(armL.map((q, i) => [q[0] + 52 * s, q[1] - (i ? 4 : -30) * s]), { w: 5, seed: k + 57, t }),
        inkPath([[eb[0] - 70 * s, eb[1] - 30 * s], [eb[0] + 60 * s, eb[1] - 60 * s], [eb[0] + 78 * s, eb[1] + 6 * s], [eb[0] - 52 * s, eb[1] + 36 * s]], { w: 4, seed: k + 58, t, closed: true, smooth: false }),
        inkPath([[eb[0] - 60 * s, eb[1] - 2 * s], [eb[0] + 66 * s, eb[1] - 26 * s]], { w: 3, seed: k + 59, t })];
      // neck, head, hair, face
      S(neck, inkLoop(TT([[-42, -520], [42, -520], [48, -455], [-48, -455]]), { seed: k + 61, t, smooth: false, amp: 0.6 }));
      const hcx = T(0, -620), R = 112 * s;
      S(head, inkCircle(hcx[0], hcx[1], R, k + 62, t, { ry: R * 1.08, fill: true }));
      LN.push(inkCircle(hcx[0], hcx[1], R, k + 63, t, { ry: R * 1.08, w: 6 }), inkPath(TT([[-42, -520], [-44, -470]]), { w: 5, seed: k + 64, t }), inkPath(TT([[42, -520], [44, -470]]), { w: 5, seed: k + 65, t }));
      LN.push(inkCircle(hcx[0] - R * 1.0, hcx[1] + 8 * s, 20 * s, k + 66, t, { w: 4 }), inkCircle(hcx[0] + R * 1.0, hcx[1] + 8 * s, 20 * s, k + 67, t, { w: 4 }));
      S(hair, inkLoop(TT([[-118, -630], [-112, -700], [-60, -742], [20, -748], [96, -720], [120, -650], [100, -680], [30, -700], [-40, -690], [-96, -668]]), { seed: k + 68, t, amp: 0.8 }));
      const look = o.look || [0, 0], ey = hcx[1] - 8 * s + look[1] * s, br = o.brow ?? 0;
      const blink = ((t + 0.7) % 3.4) < 0.12;
      const F = [];
      [-1, 1].forEach((d, i) => {
        const ex = hcx[0] + d * 40 * s + look[0] * s;
        F.push(blink ? inkPath([[ex - 9 * s, ey], [ex + 9 * s, ey]], { w: 4, seed: k + 70 + i, t }) : inkDot(ex, ey, 9 * s + 1, 10 * s + 1, k + 70 + i, t));
        F.push(inkPath([[ex - 22 * s, ey - 30 * s - (d < 0 ? br : -br * 0.2) * 10 * s + (o.frown ? -d * 0 : 0)], [ex + 22 * s, ey - 30 * s - (d > 0 ? br : -br * 0.2) * 10 * s + (o.frown ? 8 * s : 0) * (d < 0 ? 1 : -1)]], { w: 6, seed: k + 72 + i, t, amp: 0.5 }));
      });
      F.push(inkPath([[hcx[0] - 6 * s, hcx[1] + 8 * s], [hcx[0] + 8 * s, hcx[1] + 36 * s], [hcx[0] - 8 * s, hcx[1] + 40 * s]], { w: 4, seed: k + 74, t, amp: 0.4 }));
      F.push(inkPath([[hcx[0] - 30 * s, hcx[1] + 66 * s], [hcx[0], hcx[1] + (o.smile ? 76 : 68) * s], [hcx[0] + 30 * s, hcx[1] + 64 * s]], { w: 5, seed: k + 75, t, amp: 0.4 }));
      S(face, F.join(' '));
      // hands
      const hR = T(-330, 250), hL = T(462, 210);
      S(hands, inkDot(hR[0], hR[1], 36 * s, 40 * s, k + 80, t) + ' ' + inkDot(hL[0], hL[1], 34 * s, 38 * s, k + 81, t));
      LN.push(inkCircle(hR[0], hR[1], 36 * s, k + 82, t, { w: 4, ry: 40 * s }), inkCircle(hL[0], hL[1], 34 * s, k + 83, t, { w: 4, ry: 38 * s }));
      S(lines, LN.join(' '));
      return { heart: hc, elbow: eb, head: hcx };
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ room pieces
  function tiledWall(parent, sd) {
    const up = inkEl(parent, WALL()), tiles = inkEl(parent, TILE()), grid = inkEl(parent, TILE_L()), trim = inkEl(parent);
    return { update(t, W, H, top, gy, o = {}) {
      const u = W / 1080;
      S(up, inkLoop(sq(-20, -20, W + 20, gy), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
      S(tiles, inkLoop(sq(-20, top, W + 20, gy), { seed: sd + 2, t, smooth: false, amp: 0.3 }));
      const G = [], st = (o.tile ?? 70) * u;
      for (let y = top + st; y < gy - 4; y += st) G.push(inkPath([[-20, y], [W + 20, y + 1]], { w: 2.2, seed: sd + 10 + Math.round(y), t, amp: 0.5 }));
      for (let x = st * 0.5; x < W; x += st) G.push(inkPath([[x, top + 4], [x + 1, gy - 4]], { w: 2.2, seed: sd + 400 + Math.round(x), t, amp: 0.5 }));
      S(grid, G.join(' '));
      S(trim, inkPath([[-20, top], [W + 20, top]], { w: 8, seed: sd + 3, t }) + ' ' + inkPath([[-20, gy], [W + 20, gy]], { w: 7, seed: sd + 4, t }));
    } };
  }
  function checkerFloor(parent, sd) {
    const base = inkEl(parent, mix(INK.paperLight, INK.paperDark, 0.4)), dark = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.35)), lines = inkEl(parent, mix(INK.inkSoft, INK.ink, 0.2));
    return { update(t, W, H, gy, o = {}) {
      const VX = (o.vx ?? 0.5) * W, VY = gy - 900;
      S(base, inkLoop(sq(-20, gy, W + 20, H + 20), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
      const D = [], L = [];
      const rows = [], n = 8;
      for (let r = 0; r <= n; r++) rows.push(gy + Math.pow(r / n, 1.6) * (H + 40 - gy));
      const px = (x, y) => VX + (x - VX) * (y - VY) / (gy - VY);
      for (let r = 0; r < n; r++) {
        const y0 = rows[r], y1 = rows[r + 1];
        for (let c = -12; c < 12; c++) {
          if ((r + c) % 2 === 0) continue;
          const xa = VX + c * 120, xb = VX + (c + 1) * 120;
          D.push(inkLoop([[px(xa, y0), y0], [px(xb, y0), y0], [px(xb, y1), y1], [px(xa, y1), y1]], { seed: sd + 20 + r * 30 + c, t, smooth: false, amp: 0.5 }));
        }
        L.push(inkPath([[-20, y0], [W + 20, y0]], { w: 2.5, seed: sd + 300 + r, t, amp: 0.4 }));
      }
      S(dark, D.join(' ')); S(lines, L.join(' '));
    } };
  }
  function boardFloor(parent, sd) {
    const base = inkEl(parent, WOOD()), lines = inkEl(parent, WOOD_D());
    return { update(t, W, H, gy) {
      S(base, inkLoop(sq(-20, gy, W + 20, H + 20), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
      const L = [];
      for (let i = -10; i <= 10; i++) L.push(inkPath([[W / 2 + i * 70, gy], [W / 2 + i * 260, H + 20]], { w: 3, seed: sd + 10 + i, t, amp: 0.6 }));
      for (let r = 1; r < 6; r++) { const y = gy + Math.pow(r / 6, 1.5) * (H - gy); L.push(inkPath([[-20, y], [W + 20, y + 2]], { w: 2, seed: sd + 40 + r, t, amp: 0.5 })); }
      S(lines, L.join(' '));
    } };
  }
  function rug(parent, sd) {
    const base = inkEl(parent, mix(INK.red, INK.paperDark, 0.35)), bord = inkEl(parent, INK.gold, { 'fill-opacity': 0.8 }), pat = inkEl(parent, mix(INK.red, INK.ink, 0.35)), lines = inkEl(parent);
    return { update(t, W, H, y0, y1, x0, x1) {
      const P = [[x0 + 120, y0], [x1 - 120, y0], [x1, y1], [x0, y1]];
      S(base, inkLoop(P, { seed: sd + 1, t, smooth: false, amp: 0.5 }));
      const I = [[x0 + 160, y0 + 30], [x1 - 160, y0 + 30], [x1 - 60, y1 - 50], [x0 + 60, y1 - 50]];
      S(bord, inkPath(I, { w: 18, seed: sd + 2, t, closed: true, smooth: false, amp: 0.5 }));
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, PT = [];
      for (let i = 0; i < 3; i++) PT.push(inkLoop([[cx - 190 + i * 190, cy - 60], [cx - 120 + i * 190, cy], [cx - 190 + i * 190, cy + 60], [cx - 260 + i * 190, cy]], { seed: sd + 10 + i, t, smooth: false, amp: 0.5 }));
      S(pat, PT.join(' '));
      S(lines, inkPath(P, { w: 5, seed: sd + 3, t, closed: true, smooth: false }));
    } };
  }
  // the round surgical lamp hanging from the ceiling
  function opLamp(parent, sd) {
    const cone = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.28 }), dish = inkEl(parent, STEEL()), rim = inkEl(parent), bulbs = inkEl(parent, INK.gold), halo = inkEl(parent, INK.gold, { 'fill-opacity': 0.3 });
    return { update(t, x, y, r, floorY, spread) {
      const sw = Math.sin(t * 0.8 + sd) * 4;
      const X = x + sw;
      S(cone, inkLoop([[X - r * 0.8, y + r * 0.3], [X + r * 0.8, y + r * 0.3], [X + spread, floorY], [X - spread, floorY]], { seed: sd + 1, t, smooth: false, amp: 1 }));
      const DP = [[X - r, y + r * 0.3], [X - r * 0.7, y - r * 0.25], [X + r * 0.7, y - r * 0.25], [X + r, y + r * 0.3]];
      S(dish, inkLoop(DP, { seed: sd + 2, t, amp: 0.8 }));
      S(rim, inkPath(DP, { w: 6, seed: sd + 3, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[x, -40], [X, y - r * 0.25]], { w: 7, seed: sd + 4, t }));
      const fl = 0.92 + 0.08 * Math.sin(t * 6 + sd);
      S(bulbs, [-0.45, 0, 0.45].map((q, i) => inkCircle(X + q * r, y + r * 0.26, r * 0.13, sd + 5 + i, t, { fill: true })).join(' '));
      halo.setAttribute('fill-opacity', (0.3 * fl).toFixed(3));
      S(halo, inkCircle(X, y + r * 0.3, r * 0.95, sd + 9, t, { ry: r * 0.3, fill: true }));
    } };
  }
  // foreground: an instrument trolley / an operating table front, cropped by the frame bottom
  function tableFront(parent, sd) {
    const sheet = inkEl(parent, INK.paperLight), fold = inkEl(parent, mix(INK.paperDark, INK.blue, 0.2)), legs = inkEl(parent, STEEL()), lines = inkEl(parent);
    return { update(t, W, H, top, x0, x1) {
      const sw = Math.sin(t * 0.7) * 6;
      const P = [[x0, top], [x1, top], [x1 + 20, top + 260], [x1 - 40 + sw, top + 300], [lerp(x0, x1, 0.5), top + 290 - sw], [x0 + 40, top + 305], [x0 - 20, top + 260]];
      S(legs, inkPath([[x0 + 60, top + 260], [x0 + 70, H + 40]], { w: 30, seed: sd + 1, t, taper: 0 }) + ' ' + inkPath([[x1 - 60, top + 260], [x1 - 70, H + 40]], { w: 30, seed: sd + 2, t, taper: 0 }) +
        ' ' + inkPath([[x0 + 70, top + 520], [x1 - 70, top + 520]], { w: 18, seed: sd + 3, t, taper: 0 }));
      S(sheet, inkLoop(P, { seed: sd + 4, t, amp: 1 }));
      const FD = []; for (let i = 1; i < 6; i++) { const x = lerp(x0, x1, i / 6); FD.push(inkPath([[x, top + 40], [x + 10 + sw * 0.5, top + 280]], { w: 4, seed: sd + 5 + i, t })); }
      S(fold, FD.join(' '));
      S(lines, inkPath(P, { w: 6, seed: sd + 12, t, closed: true, amp: 1 }) + ' ' + inkPath([[x0 - 10, top + 30], [x1 + 10, top + 30]], { w: 4, seed: sd + 13, t }));
    } };
  }
  // nurse = LH.person (blue dress) + white apron, skirt and cap
  function nurse(parent, sd) {
    const g = el(parent, 'g');
    const skirt = inkEl(g, NURSE()), skirtR = inkEl(g);
    const pg = el(g, 'g');
    const p = window.LH.person(pg, sd, { kind: 'sweater', col: NURSE(), hair: 'dark', glasses: false });
    const apron = inkEl(g, INK.paperLight), apronR = inkEl(g), bun = inkEl(g, INK.ink), cap = inkEl(g, INK.paperLight), capR = inkEl(g), capB = inkEl(g, INK.blue);
    return { update(t, x, gy, s, pose) {
      const o = p.update(t, x, gy, s, pose), fc = pose.face ?? 1;
      const hip = o.hip, sh = o.sh;
      const SK = [[hip[0] - 62 * s, hip[1] - 10 * s], [hip[0] + 62 * s, hip[1] - 10 * s], [hip[0] + 78 * s, gy - 70 * s], [hip[0] - 78 * s, gy - 70 * s]];
      if (pose.seat == null) { S(skirt, inkLoop(SK, { seed: sd + 1, t, smooth: false, amp: 1 })); S(skirtR, inkPath(SK, { w: 4.5, seed: sd + 2, t, closed: true, smooth: false })); }
      else { S(skirt, ''); S(skirtR, ''); }
      const AP = [[sh[0] - 26 * s, sh[1] + 30 * s], [sh[0] + 26 * s, sh[1] + 30 * s], [hip[0] + 52 * s, pose.seat == null ? gy - 80 * s : hip[1] + 20 * s], [hip[0] - 52 * s, pose.seat == null ? gy - 80 * s : hip[1] + 20 * s]];
      S(apron, inkLoop(AP, { seed: sd + 3, t, smooth: false, amp: 1 }));
      S(apronR, inkPath(AP, { w: 4, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkPath([[hip[0] - 56 * s, hip[1] - 30 * s], [hip[0] + 56 * s, hip[1] - 30 * s]], { w: 4, seed: sd + 5, t }));
      const hc = o.hc;
      S(bun, inkCircle(hc[0] - 52 * s * fc, hc[1] + 4 * s, 22 * s, sd + 6, t, { fill: true }));
      const CP = [[hc[0] - 50 * s, hc[1] - 34 * s], [hc[0] - 36 * s, hc[1] - 74 * s], [hc[0] + 36 * s, hc[1] - 74 * s], [hc[0] + 52 * s, hc[1] - 34 * s]];
      S(cap, inkLoop(CP, { seed: sd + 7, t, smooth: false, amp: 0.6 }));
      S(capR, inkPath(CP, { w: 4, seed: sd + 8, t, closed: true, smooth: false, amp: 0.6 }));
      S(capB, inkPath([[hc[0] - 46 * s, hc[1] - 44 * s], [hc[0] + 48 * s, hc[1] - 44 * s]], { w: 9 * s + 1, seed: sd + 9, t, taper: 0 }));
      return o;
    } };
  }
  // a coiled rubber tube (gold) at (x, y), radius r
  function coil(parent, sd) {
    const o = inkEl(parent), i = inkEl(parent, TUBE());
    return { update(t, x, y, r, tail) {
      const P = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * TAU * 2.6; P.push([x + Math.cos(a) * r * (0.7 + 0.3 * Math.sin(a * 0.5)), y + Math.sin(a) * r * 0.55]); }
      if (tail) P.push(...tail);
      S(o, inkPath(P, { w: 13, seed: sd, t, amp: 0.6, taper: 0 })); S(i, inkPath(P, { w: 6, seed: sd + 1, t, amp: 0.6, taper: 0 }));
    } };
  }

  // ------------------------------------------------------------------ SHOTS.fh_body
  SH.fh_body = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 101, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'hook';
      const wall = tiledWall(el(root, 'g'), sd + 1);
      const chart = inkEl(root, INK.paperLight), chartR = inkEl(root), pins = inkEl(root, INK.red);
      const bg = el(root, 'g');
      const B = bust(bg, sd + 10);
      const doc = mode === 'plan' ? window.LH.person(el(root, 'g'), sd + 30, { kind: 'lab', hair: 'dark', glasses: false }) : null;
      const pointer = inkEl(root, WOOD_D());
      const floor = mode === 'plan' ? checkerFloor(el(root, 'g'), sd + 40) : null;
      const cart = mode === 'plan' ? window.LH.front(el(root, 'g'), sd + 50, 'bench') : null;
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', null), hp = punch(lt, hit, 0.7);
          if (mode === 'hook') {
            wall.update(t, W, H, 0.42 * H, H + 20, { tile: 90 });
            S(chart, ''); S(chartR, ''); S(pins, ''); S(pointer, '');
            const a = atOr(cues, 'tube', 0.15), b = Math.max(a + 0.6, atOr(cues, 'heart', dur * 0.7));
            const p = progIO(lt, a, b - a);
            B.update(t, { cx: 0.47 * W + Math.sin(t * 0.9) * 10 * u, cy: 0.56 * H + Math.sin(t * 1.7) * 6 * u, s: (1.0 + 0.03 * Math.sin(t * 0.6)) * u, tube: p, glow: prog(lt, b - 0.1, 0.4), hp, brow: 0.6, look: [10, 10] });
          } else {
            const gy = 0.6 * H;
            wall.update(t, W, H, 0.3 * H, gy, { tile: 64 });
            floor.update(t, W, H, gy, { vx: 0.55 });
            const x0 = 0.4 * W, x1 = 0.96 * W, y0 = 0.15 * H, y1 = 0.56 * H;
            const CP = [[x0, y0], [x1, y0 + 6], [x1 - 4, y1], [x0 + 4, y1 - 6]];
            S(chart, inkLoop(CP, { seed: sd + 60, t, smooth: false, amp: 0.6 }));
            S(chartR, inkPath(CP, { w: 6, seed: sd + 61, t, closed: true, smooth: false }));
            S(pins, inkDot(x0 + 22 * u, y0 + 22 * u, 10 * u, 10 * u, sd + 62, t) + ' ' + inkDot(x1 - 22 * u, y0 + 26 * u, 10 * u, 10 * u, sd + 63, t));
            const r = progIO(lt, atOr(cues, 'route', 0.6), 1.6);
            const o = B.update(t, { cx: 0.66 * W, cy: 0.395 * H, s: 0.5 * u, bottom: 640, vein: true, route: r, hp });
            const tip = r > 0 ? partial([o.elbow, o.heart], 1)[0] : o.elbow;
            void tip;
            // the doctor points at the chart with a stick
            const dx = 0.2 * W, pt = [lerp(0.86 * W, 0.7 * W, r), lerp(0.42 * H, 0.33 * H, r)];
            const res = doc.update(t, dx, gy, 1.28 * u, { face: 1, armR: [dx + 190 * u, gy - 470 * u], armL: [dx - 30 * u, gy - 260 * u], look: [4, -6], brow: 0.3 });
            S(pointer, inkPath([res.hR, pt], { w: 9 * u + 2, seed: sd + 70, t }));
            cart.update(t, W, H, 0.77 * H, { x0: -0.05, x1: 1.05 });
          }
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.fh_hospital
  SH.fh_hospital = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 211, root = el(svg, 'g'), u = W / 1080;
      const smoke = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.5), { 'fill-opacity': 0.6 });
      const roof = inkEl(root, ROOF()), wall = inkEl(root, BRICK()), trim = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.4)), wins = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), lit = inkEl(root, INK.gold), door = inkEl(root, WOOD_D()), lines = inkEl(root), brick = inkEl(root, mix(INK.red, INK.ink, 0.3));
      const sign = el(root, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, fill: INK.ink, 'letter-spacing': 2 });
      const trees = inkEl(root, LEAF()), treesD = inkEl(root, LEAF_D()), trunks = inkEl(root, WOOD_D());
      const walker = nurse(el(root, 'g'), sd + 50);
      const hedge = inkEl(root, LEAF_D()), hedgeL = inkEl(root, LEAF()), fence = inkEl(root, INK.ink);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, gy = (P.ground ?? 0.6) * H;
          const x0 = 0.1 * W, x1 = 0.9 * W, yT = 0.31 * H, yR = 0.2 * H;
          // chimney smoke
          const SM = []; for (let i = 0; i < 6; i++) { const ph = (t * 0.25 + i / 6) % 1; SM.push(inkCircle(0.76 * W + ph * 120 * u + Math.sin(ph * 6 + i) * 20 * u, yR - 60 * u - ph * 260 * u, (30 + ph * 60) * u, sd + 300 + i, t, { fill: true })); }
          S(smoke, SM.join(' '));
          const RF = [[x0 - 30 * u, yT], [x0 + 90 * u, yR], [x1 - 90 * u, yR], [x1 + 30 * u, yT]];
          const CH = sq(0.73 * W, yR - 90 * u, 0.79 * W, yR + 20 * u);
          S(roof, inkLoop(RF, { seed: sd + 1, t, smooth: false, amp: 0.6 }) + ' ' + inkLoop(CH, { seed: sd + 2, t, smooth: false, amp: 0.5 }) +
            ' ' + inkLoop([[0.44 * W, yT], [0.5 * W, yR - 70 * u], [0.56 * W, yT]], { seed: sd + 3, t, smooth: false, amp: 0.5 }));
          S(wall, inkLoop(sq(x0, yT, x1, gy), { seed: sd + 4, t, smooth: false, amp: 0.5 }));
          const BR = []; for (let y = yT + 30 * u; y < gy; y += 30 * u) BR.push(inkPath([[x0, y], [x1, y]], { w: 1.6, seed: sd + 5 + Math.round(y), t, amp: 0.5 }));
          S(brick, BR.join(' '));
          S(trim, inkLoop(sq(x0 - 10 * u, yT - 6 * u, x1 + 10 * u, yT + 22 * u), { seed: sd + 6, t, smooth: false, amp: 0.4 }) + ' ' + inkLoop(sq(0.38 * W, 0.42 * H, 0.62 * W, 0.462 * H), { seed: sd + 7, t, smooth: false, amp: 0.4 }));
          sign.setAttribute('x', f1(0.5 * W)); sign.setAttribute('y', f1(0.455 * H)); sign.setAttribute('font-size', f1(46 * u)); sign.textContent = P.sign || 'HOSPITAL';
          // windows: 3 rows x 6, door in the middle
          const WN = [], LT = [], LN = [];
          const cols = [0.16, 0.26, 0.36, 0.64, 0.74, 0.84], rows = [0.35, 0.47, 0.54];
          rows.forEach((ry, r) => cols.forEach((cx, c) => {
            if (r === 1 && (c === 2 || c === 3)) return;
            const wx = cx * W, wy = ry * H, ww = 64 * u, wh = (r === 2 ? 90 : 110) * u;
            const on = hn(r * 7 + c, 3) > 0.55 && Math.sin(t * 0.7 + r * 2 + c) > -0.6;
            const R = sq(wx - ww / 2, wy, wx + ww / 2, wy + wh);
            (on ? LT : WN).push(inkLoop(R, { seed: sd + 20 + r * 10 + c, t, smooth: false, amp: 0.4 }));
            LN.push(inkPath(R, { w: 4, seed: sd + 60 + r * 10 + c, t, closed: true, smooth: false }), inkPath([[wx, wy], [wx, wy + wh]], { w: 3, seed: sd + 120 + r * 10 + c, t }), inkPath([[wx - ww / 2, wy + wh * 0.45], [wx + ww / 2, wy + wh * 0.45]], { w: 3, seed: sd + 180 + r * 10 + c, t }));
          }));
          // small gable window
          WN.push(inkCircle(0.5 * W, yT - 50 * u, 26 * u, sd + 240, t, { fill: true }));
          S(wins, WN.join(' ')); S(lit, LT.join(' '));
          const DR = [[0.44 * W, gy], [0.44 * W, 0.5 * H], [0.5 * W, 0.475 * H], [0.56 * W, 0.5 * H], [0.56 * W, gy]];
          S(door, inkLoop(DR, { seed: sd + 241, t, smooth: false, amp: 0.4 }));
          LN.push(inkPath(DR, { w: 5, seed: sd + 242, t, closed: true, smooth: false }), inkPath([[0.5 * W, 0.476 * H], [0.5 * W, gy]], { w: 4, seed: sd + 243, t }));
          LN.push(inkPath(RF, { w: 6, seed: sd + 244, t, closed: true, smooth: false }), inkPath(CH, { w: 5, seed: sd + 245, t, closed: true, smooth: false }), inkPath(sq(x0, yT, x1, gy), { w: 6, seed: sd + 246, t, closed: true, smooth: false }));
          LN.push(inkPath([[0.4 * W, gy], [0.38 * W, gy + 30 * u], [0.62 * W, gy + 30 * u], [0.6 * W, gy]], { w: 4, seed: sd + 247, t }));
          for (let i = 0; i < 14; i++) LN.push(inkPath([[x0 + 60 * u + i * 52 * u, yR + 40 * u + (i % 2) * 10 * u], [x0 + 30 * u + i * 52 * u, yT - 10 * u]], { w: 2.5, seed: sd + 250 + i, t }));
          S(lines, LN.join(' '));
          // trees either side
          const TR = [], TD = [], TK = [];
          [[0.04, 0.42, 150], [0.97, 0.44, 140]].forEach(([fx, fy, r], i) => {
            const sw = Math.sin(t * 0.9 + i * 2) * 8 * u, x = fx * W + sw, y = fy * H;
            TK.push(inkPath([[fx * W, gy + 10 * u], [x, y + 60 * u]], { w: 34 * u, seed: sd + 260 + i, t, taper: 0 }));
            TR.push(inkCircle(x, y, r * u, sd + 262 + i, t, { fill: true, ry: r * 1.25 * u }));
            TD.push(inkCircle(x + 20 * u, y + 60 * u, r * 0.7 * u, sd + 264 + i, t, { fill: true }), inkCircle(x, y, r * u, sd + 266 + i, t, { w: 5, ry: r * 1.25 * u }));
          });
          S(trunks, TK.join(' ')); S(trees, TR.join(' ')); S(treesD, TD.join(' '));
          // a nurse walks along the path in front of the building
          const wx = lerp(0.18 * W, 0.4 * W, lt / Math.max(1, dur)), step = Math.abs(Math.sin(lt * 5.5));
          walker.update(t, wx, gy + 120 * u - step * 6 * u, 0.62 * u, { face: 1, armL: [wx - 60 * u + Math.sin(lt * 5.5) * 30 * u, gy - 10 * u], armR: [wx + 60 * u - Math.sin(lt * 5.5) * 30 * u, gy - 10 * u] });
          // iron fence + hedge foreground
          const top = 0.76 * H, HD = [], HL = [], FN = [];
          for (let i = 0; i < 9; i++) { const x = (i + 0.5) / 9 * W + Math.sin(t * 1.1 + i) * 4 * u; HD.push(inkCircle(x, top + 120 * u, 110 * u, sd + 300 + i, t, { fill: true, ry: 100 * u })); HL.push(inkCircle(x - 30 * u, top + 90 * u, 50 * u, sd + 320 + i, t, { fill: true })); }
          HD.push(inkLoop(sq(-20, top + 110 * u, W + 20, H + 20), { seed: sd + 340, t, smooth: false, amp: 0.5 }));
          S(hedge, HD.join(' ')); S(hedgeL, HL.join(' '));
          for (let i = 0; i < 16; i++) { const x = (i + 0.5) / 16 * W; FN.push(inkPath([[x, top + 60 * u], [x, top - 150 * u]], { w: 8 * u + 2, seed: sd + 350 + i, t }), inkPath([[x - 10 * u, top - 140 * u], [x, top - 170 * u], [x + 10 * u, top - 140 * u]], { w: 6, seed: sd + 370 + i, t })); }
          FN.push(inkPath([[-20, top - 110 * u], [W + 20, top - 110 * u]], { w: 8, seed: sd + 390, t }), inkPath([[-20, top - 20 * u], [W + 20, top - 20 * u]], { w: 8, seed: sd + 391, t }));
          S(fence, FN.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.fh_office
  SH.fh_office = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 331, root = el(svg, 'g'), u = W / 1080;
      const wall = inkEl(root, mix(INK.paperDark, INK.green, 0.12)), panel = inkEl(root, WOOD()), panelL = inkEl(root, WOOD_D());
      const winF = inkEl(root, mix(INK.paperLight, INK.blue, 0.22)), winL = inkEl(root), dip = inkEl(root, INK.paperLight), dipL = inkEl(root), seal = inkEl(root, INK.red);
      const shelf = inkEl(root, WOOD_D()), books = [INK.blue, INK.red, INK.green, INK.gold, INK.inkSoft].map(c => inkEl(root, mix(c, INK.paperDark, 0.2))), booksL = inkEl(root);
      const floor = boardFloor(el(root, 'g'), sd + 10), carpet = rug(el(root, 'g'), sd + 20);
      const boss = window.LH.person(el(root, 'g'), sd + 30, { kind: 'lab', hair: 'white', glasses: true });
      const desk = inkEl(root, WOOD()), deskT = inkEl(root, mix(WOOD(), INK.paperLight, 0.25)), deskL = inkEl(root), papers = inkEl(root, INK.paperLight), papersL = inkEl(root), lampG = inkEl(root, INK.green), lampL = inkEl(root);
      const doc = window.LH.person(el(root, 'g'), sd + 40, { kind: 'lab', hair: 'dark', glasses: false });
      const tube = coil(root, sd + 50);
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, no = atOr(cues, 'no', dur * 0.4), gy = 0.6 * H;
          S(wall, inkLoop(sq(-20, -20, W + 20, gy), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          S(panel, inkLoop(sq(-20, 0.42 * H, W + 20, gy), { seed: sd + 2, t, smooth: false, amp: 0.3 }));
          const PL = [inkPath([[-20, 0.42 * H], [W + 20, 0.42 * H]], { w: 7, seed: sd + 3, t })];
          for (let k = 0; k < 6; k++) PL.push(inkPath(sq(k * 190 * u + 20 * u, 0.44 * H, k * 190 * u + 180 * u, gy - 20 * u), { w: 3, seed: sd + 4 + k, t, closed: true, smooth: false }));
          S(panelL, PL.join(' '));
          // window (right) and diploma (centre)
          const wx0 = 0.66 * W, wx1 = 0.94 * W, wy0 = 0.15 * H, wy1 = 0.36 * H;
          S(winF, inkLoop(sq(wx0, wy0, wx1, wy1), { seed: sd + 20, t, smooth: false, amp: 0.4 }));
          S(winL, inkPath(sq(wx0, wy0, wx1, wy1), { w: 8, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 5, seed: sd + 22, t }) + ' ' + inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 5, seed: sd + 23, t }) +
            ' ' + [0, 1].map(i => inkPath([[wx0 + 40 * u + i * 120 * u + Math.sin(t * 0.5 + i) * 20 * u, wy0 + 60 * u + i * 30 * u], [wx0 + 90 * u + i * 120 * u + Math.sin(t * 0.5 + i) * 20 * u, wy0 + 52 * u + i * 30 * u]], { w: 3, seed: sd + 24 + i, t })).join(' '));
          const dx = 0.5 * W, dy = 0.24 * H;
          S(dip, inkLoop(sq(dx - 90 * u, dy - 65 * u, dx + 90 * u, dy + 65 * u), { seed: sd + 30, t, smooth: false, amp: 0.4 }));
          S(dipL, inkPath(sq(dx - 90 * u, dy - 65 * u, dx + 90 * u, dy + 65 * u), { w: 7, seed: sd + 31, t, closed: true, smooth: false }) + ' ' + [0, 1, 2].map(i => inkPath([[dx - 60 * u, dy - 30 * u + i * 22 * u], [dx + 60 * u, dy - 30 * u + i * 22 * u]], { w: 3, seed: sd + 32 + i, t })).join(' '));
          S(seal, inkCircle(dx + 50 * u, dy + 42 * u, 14 * u, sd + 35, t, { fill: true }));
          // bookshelf (left)
          const sx0 = 0.03 * W, sx1 = 0.3 * W, BK = [[], [], [], [], []], BL = [];
          S(shelf, inkLoop(sq(sx0, 0.12 * H, sx1, 0.42 * H), { seed: sd + 40, t, smooth: false, amp: 0.4 }));
          for (let r = 0; r < 3; r++) {
            const y1 = 0.12 * H + (r + 1) * 0.1 * H - 8 * u, y0 = y1 - 0.08 * H;
            let x = sx0 + 14 * u, i = 0;
            while (x < sx1 - 40 * u) { const w = (22 + hn(r * 20 + i, 1) * 20) * u, h = (0.06 + hn(r * 20 + i, 2) * 0.02) * H; BK[(r * 3 + i) % 5].push(inkLoop(sq(x, y1 - h, x + w, y1), { seed: sd + 50 + r * 20 + i, t, smooth: false, amp: 0.3 })); BL.push(inkPath(sq(x, y1 - h, x + w, y1), { w: 2.5, seed: sd + 100 + r * 20 + i, t, closed: true, smooth: false })); x += w + 3 * u; i++; }
            BL.push(inkPath([[sx0, y1], [sx1, y1]], { w: 6, seed: sd + 160 + r, t }));
            void y0;
          }
          books.forEach((b, i) => S(b, BK[i].join(' '))); S(booksL, BL.join(' '));
          floor.update(t, W, H, gy);
          carpet.update(t, W, H, gy + 60 * u, H - 120 * u, -0.05 * W, 1.05 * W);
          // the chief behind his desk (right), shaking his head after "no"
          const shake = lt > no && lt < no + 1.4 ? Math.sin((lt - no) * 16) * 7 * (1 - (lt - no) / 1.4) : 0;
          const up = prog(lt, no, 0.3);
          const bx = 0.76 * W, seat = 0.5 * H;
          boss.update(t, bx, gy, 1.2 * u, { face: -1, seat, lean: shake - 4, armR: [lerp(bx - 120 * u, bx - 190 * u, up), lerp(0.53 * H, 0.38 * H, up)], armL: [bx - 140 * u, 0.535 * H], brow: lt > no ? -0.5 : 0.2, look: [4, 2] });
          const DK = sq(0.5 * W, 0.53 * H, 1.04 * W, gy + 200 * u);
          S(desk, inkLoop(DK, { seed: sd + 170, t, smooth: false, amp: 0.4 }));
          S(deskT, inkLoop(sq(0.48 * W, 0.515 * H, 1.06 * W, 0.545 * H), { seed: sd + 171, t, smooth: false, amp: 0.4 }));
          S(deskL, inkPath(DK, { w: 6, seed: sd + 172, t, closed: true, smooth: false }) + ' ' + inkPath(sq(0.48 * W, 0.515 * H, 1.06 * W, 0.545 * H), { w: 5, seed: sd + 173, t, closed: true, smooth: false }) +
            ' ' + inkPath(sq(0.55 * W, 0.57 * H, 0.75 * W, 0.64 * H), { w: 4, seed: sd + 174, t, closed: true, smooth: false }) + ' ' + inkDot(0.65 * W, 0.605 * H, 10 * u, 8 * u, sd + 175, t));
          S(papers, inkLoop([[0.58 * W, 0.513 * H], [0.7 * W, 0.508 * H], [0.71 * W, 0.518 * H], [0.59 * W, 0.522 * H]], { seed: sd + 176, t, smooth: false, amp: 0.4 }));
          S(papersL, inkPath([[0.58 * W, 0.513 * H], [0.7 * W, 0.508 * H], [0.71 * W, 0.518 * H], [0.59 * W, 0.522 * H]], { w: 3, seed: sd + 177, t, closed: true, smooth: false }));
          S(lampG, inkLoop([[0.9 * W, 0.44 * H], [0.98 * W, 0.44 * H], [0.96 * W, 0.47 * H], [0.92 * W, 0.47 * H]], { seed: sd + 178, t, amp: 0.4 }));
          S(lampL, inkPath([[0.94 * W, 0.47 * H], [0.94 * W, 0.513 * H]], { w: 6, seed: sd + 179, t }) + ' ' + inkPath([[0.9 * W, 0.44 * H], [0.98 * W, 0.44 * H], [0.96 * W, 0.47 * H], [0.92 * W, 0.47 * H]], { w: 4, seed: sd + 180, t, closed: true }));
          // the young doctor holds out the coiled tube
          const fx = 0.4 * W, lean = Math.sin(t * 1.6) * 2 + 4;
          const hand = [fx + 150 * u + Math.sin(t * 2) * 6 * u, gy - 330 * u];
          const r = doc.update(t, fx, gy, 1.22 * u, { face: 1, lean, armR: hand, armL: [fx + 40 * u, gy - 250 * u], brow: lt > no ? 0.9 : 0.4, look: [4, -4], mouth: lt > no ? 0.5 : 0 });
          tube.update(t, r.hR[0] + 6 * u, r.hR[1] + 26 * u, 44 * u, [[r.hR[0] + 30 * u, r.hR[1] + 70 * u], [r.hR[0] + 20 * u, r.hR[1] + 160 * u]]);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.fh_room
  SH.fh_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 451, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'cabinet';
      const wall = tiledWall(el(root, 'g'), sd + 1), floor = checkerFloor(el(root, 'g'), sd + 10);
      const lampG = el(root, 'g'), lamp = opLamp(lampG, sd + 20);
      // cabinet
      const cab = inkEl(root, STEEL()), cabIn = inkEl(root, mix(INK.paperLight, INK.blue, 0.25)), cabStuff = inkEl(root, INK.paperLight), bottles = inkEl(root, mix(INK.stain, INK.gold, 0.4)), cabL = inkEl(root), glass = inkEl(root, INK.paperLight, { 'fill-opacity': 0.35 }), doorL = inkEl(root), keyE = inkEl(root, INK.gold), shine = inkEl(root, INK.gold, { 'fill-opacity': 0.5 });
      const cabCoils = [0, 1, 2].map(i => coil(root, sd + 60 + i * 5));
      // operating table (strap)
      const table = inkEl(root, STEEL()), sheet = inkEl(root, INK.paperLight), sheetL = inkEl(root), pillow = inkEl(root, INK.paperLight), straps = inkEl(root, LEATHER()), buckles = inkEl(root, INK.gold);
      const nHead = inkEl(root, SKIN()), nHair = inkEl(root, INK.ink), nCap = inkEl(root, INK.paperLight), nCapB = inkEl(root, INK.blue), nFace = inkEl(root), nHands = inkEl(root, SKIN());
      const board = inkEl(root, WOOD()), boardL = inkEl(root), tray = inkEl(root, STEEL()), stool = inkEl(root, STEEL());
      const docG = el(root, 'g');
      const doc = window.LH.person(docG, sd + 80, { kind: 'lab', hair: 'dark', glasses: false });
      const ns = mode === 'cabinet' ? nurse(el(root, 'g'), sd + 90) : null;
      const handTube = coil(root, sd + 95);
      const tubeO = inkEl(root), tubeI = inkEl(root, TUBE()), band = inkEl(root, INK.paperLight), bandL = inkEl(root), seeO = inkEl(root, INK.gold, { 'fill-opacity': 0.25 }), see = inkEl(root, INK.gold), heart = inkEl(root, INK.red), glow = inkEl(root, INK.gold, { 'fill-opacity': 0.4 });
      const front = mode === 'cabinet' ? tableFront(el(root, 'g'), sd + 120) : window.LH.front(el(root, 'g'), sd + 130, 'bench');
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const LB = labels(root, P.labels, W, H);
      const blankAll = (...e) => e.forEach(x => S(x, ''));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, gy = (P.ground ?? 0.6) * H;
          wall.update(t, W, H, 0.3 * H, gy, { tile: 66 });
          floor.update(t, W, H, gy, { vx: 0.5 });
          if (mode === 'cabinet') {
            const unlock = atOr(cues, 'unlock', dur * 0.3), offer = atOr(cues, 'offer', dur * 0.6);
            lamp.update(t, 0.36 * W, 0.2 * H, 150 * u, gy, 280 * u);
            // glass cabinet on the right
            const c0 = 0.6 * W, c1 = 0.97 * W, cy0 = 0.17 * H, cy1 = gy;
            S(cab, inkLoop(sq(c0, cy0, c1, cy1), { seed: sd + 30, t, smooth: false, amp: 0.4 }));
            S(cabIn, inkLoop(sq(c0 + 18 * u, cy0 + 18 * u, c1 - 18 * u, cy1 - 110 * u), { seed: sd + 31, t, smooth: false, amp: 0.4 }));
            const shelves = [0.27, 0.37, 0.47].map(q => q * H), BT = [], CS = [];
            const CL = [inkPath(sq(c0, cy0, c1, cy1), { w: 7, seed: sd + 32, t, closed: true, smooth: false }), inkPath([[c0, cy1 - 100 * u], [c1, cy1 - 100 * u]], { w: 5, seed: sd + 33, t })];
            shelves.forEach((y, i) => { CL.push(inkPath([[c0 + 18 * u, y], [c1 - 18 * u, y]], { w: 6, seed: sd + 34 + i, t })); });
            // bottles on the top shelf + middle shelf, trays at the bottom
            for (let i = 0; i < 5; i++) { const x = c0 + 50 * u + i * 66 * u, y = shelves[0]; BT.push(inkLoop([[x - 20 * u, y], [x + 20 * u, y], [x + 20 * u, y - 70 * u], [x + 8 * u, y - 80 * u], [x + 8 * u, y - 100 * u], [x - 8 * u, y - 100 * u], [x - 8 * u, y - 80 * u], [x - 20 * u, y - 70 * u]], { seed: sd + 40 + i, t, smooth: false, amp: 0.4 })); }
            for (let i = 0; i < 4; i++) { const x = c0 + 60 * u + i * 80 * u, y = shelves[2]; CS.push(inkLoop(sq(x - 30 * u, y - 40 * u, x + 30 * u, y), { seed: sd + 50 + i, t, smooth: false, amp: 0.4 })); CL.push(inkPath(sq(x - 30 * u, y - 40 * u, x + 30 * u, y), { w: 3, seed: sd + 55 + i, t, closed: true, smooth: false })); }
            S(bottles, BT.join(' ')); S(cabStuff, CS.join(' '));
            BT.forEach((_, i) => { const x = c0 + 50 * u + i * 66 * u, y = shelves[0]; CL.push(inkPath([[x - 20 * u, y], [x + 20 * u, y], [x + 20 * u, y - 70 * u], [x + 8 * u, y - 80 * u], [x + 8 * u, y - 100 * u], [x - 8 * u, y - 100 * u], [x - 8 * u, y - 80 * u], [x - 20 * u, y - 70 * u]], { w: 3, seed: sd + 70 + i, t, closed: true, smooth: false })); });
            S(cabL, CL.join(' '));
            // coiled tubes on the middle shelf (the first is taken out after "unlock")
            const take = prog(lt, unlock + 0.5, 0.6);
            cabCoils.forEach((cc, i) => { if (i === 0 && take > 0.5) cc.update(t, -999, -999, 1); else cc.update(t, c0 + 70 * u + i * 100 * u, shelves[1] - 32 * u, 38 * u); });
            // the door swings open after "unlock"
            const op = progIO(lt, unlock + 0.15, 0.7), mx = (c0 + c1) / 2;
            const dR = lerp(c1 - 14 * u, c1 + 40 * u, op), dTop = cy0 + 14 * u, dBot = cy1 - 104 * u;
            const leftDoor = sq(c0 + 14 * u, dTop, mx, dBot);
            const rightDoor = [[lerp(mx, c1 - 4 * u, op), dTop + op * 20 * u], [dR, dTop - op * 10 * u], [dR, dBot + op * 10 * u], [lerp(mx, c1 - 4 * u, op), dBot - op * 20 * u]];
            S(glass, inkLoop(leftDoor, { seed: sd + 80, t, smooth: false, amp: 0.4 }) + ' ' + inkLoop(rightDoor, { seed: sd + 81, t, smooth: false, amp: 0.4 }));
            S(doorL, inkPath(leftDoor, { w: 5, seed: sd + 82, t, closed: true, smooth: false }) + ' ' + inkPath(rightDoor, { w: 5, seed: sd + 83, t, closed: true, smooth: false }));
            const kx = mx - 12 * u, ky = 0.36 * H;
            S(keyE, inkCircle(kx - 30 * u, ky, 16 * u, sd + 84, t, { w: 6 }) + ' ' + inkPath([[kx - 14 * u, ky], [kx + 10 * u, ky]], { w: 7, seed: sd + 85, t }));
            const gl = punch(lt, unlock, 0.8);
            S(shine, gl > 0.02 ? inkCircle(kx, ky, (30 + 60 * (1 - gl)) * u, sd + 86, t, { fill: true }) : '');
            // nurse: reaches for the lock, then turns to the doctor and points to her own arm
            const turned = lt > offer;
            const nx = 0.5 * W;
            const holding = take > 0.5;
            const pose = turned
              ? { face: -1, armR: [nx - 10 * u, gy - 330 * u], armL: [nx - 120 * u, gy - 290 * u], brow: 0.6, look: [2, 0], mouth: 0.4 }
              : { face: 1, armR: holding ? [nx + 70 * u, gy - 280 * u] : [kx - 20 * u + Math.sin(t * 8) * 3 * u, ky + 10 * u], armL: [nx - 30 * u, gy - 240 * u], brow: 0.1, look: [6, -2] };
            const nr = ns.update(t, nx, gy, 1.15 * u, pose);
            if (holding) { const hh = turned ? nr.hL : nr.hR; handTube.update(t, hh[0], hh[1] + 30 * u, 36 * u); } else handTube.update(t, -999, -999, 1);
            // doctor on the left, watching; raises his brows at the offer
            const fx = 0.2 * W;
            doc.update(t, fx, gy, 1.2 * u, { face: 1, lean: Math.sin(t * 1.4) * 2, armR: [fx + 60 * u, gy - 330 * u], armL: [fx + 30 * u, gy - 300 * u], brow: turned ? 1 : 0.2, look: [6, 0], mouth: turned ? 0.4 : 0 });
            front.update(t, W, H, 0.74 * H, 0.06 * W, 0.94 * W);
            blankAll(table, sheet, sheetL, pillow, straps, buckles, nHead, nHair, nCap, nCapB, nFace, nHands, board, boardL, tray, stool, tubeO, tubeI, band, bandL, seeO, see, heart, glow);
          } else {
            const strap = atOr(cues, 'strap', dur * 0.2), own = atOr(cues, 'own', dur * 0.55);
            lamp.update(t, 0.42 * W, 0.17 * H, 150 * u, 0.5 * H, 260 * u);
            // operating table with the nurse under a sheet; her head at the RIGHT end, next to the doctor
            const tx0 = -0.02 * W, tx1 = 0.56 * W, ty = 0.5 * H;
            const M = x => tx0 + tx1 - x, MP = a => a.map(q => [M(q[0]), q[1]]);
            S(table, inkLoop(sq(tx0, ty, tx1, ty + 40 * u), { seed: sd + 200, t, smooth: false, amp: 0.4 }) + ' ' + inkPath([[0.08 * W, ty + 40 * u], [0.08 * W, gy]], { w: 26 * u, seed: sd + 201, t, taper: 0 }) + ' ' + inkPath([[0.48 * W, ty + 40 * u], [0.48 * W, gy]], { w: 26 * u, seed: sd + 202, t, taper: 0 }));
            const kick = Math.max(0, Math.sin(lt * 7)) * prog(lt, strap, 0.3) * 8 * u;
            const SP = MP([[tx0 + 150 * u, ty + 6 * u], [tx0 + 150 * u, ty - 70 * u], [tx0 + 0.24 * W, ty - 95 * u], [tx0 + 0.39 * W, ty - 80 * u], [tx0 + 0.5 * W, ty - 70 * u - kick], [tx1 + 10 * u, ty - 50 * u - kick], [tx1 + 20 * u, ty + 90 * u], [tx0 + 140 * u, ty + 90 * u]]);
            S(sheet, inkLoop(SP, { seed: sd + 203, t, amp: 0.8 }));
            const PW = MP([[tx0 + 10 * u, ty], [tx0 + 160 * u, ty], [tx0 + 160 * u, ty - 50 * u], [tx0 + 10 * u, ty - 50 * u]]);
            S(pillow, inkLoop(PW, { seed: sd + 204, t, amp: 0.6 }));
            S(sheetL, inkPath(SP, { w: 5, seed: sd + 205, t, closed: true, amp: 0.8 }) + ' ' + inkPath(PW, { w: 4, seed: sd + 206, t, closed: true, amp: 0.6 }) + ' ' + inkPath(sq(tx0, ty, tx1, ty + 40 * u), { w: 5, seed: sd + 207, t, closed: true, smooth: false }));
            // straps drop over the sheet one after the other (chest strap first)
            const ST = [], BK = [];
            [[0.4, 0], [0.27, 0.35]].forEach(([fx, dl], i) => {
              const q = spring(lt, strap + dl, 0.5), x = fx * W, yTop = lerp(ty - 400 * u, ty - 96 * u, q);
              if (lt < strap + dl) return;
              ST.push(inkLoop([[x - 24 * u, yTop], [x + 24 * u, yTop], [x + 26 * u, ty + 92 * u], [x - 22 * u, ty + 92 * u]], { seed: sd + 210 + i, t, smooth: false, amp: 0.6 }));
              BK.push(inkLoop(sq(x - 22 * u, ty - 44 * u, x + 22 * u, ty - 12 * u), { seed: sd + 214 + i, t, smooth: false, amp: 0.4 }));
            });
            S(straps, ST.join(' ')); S(buckles, BK.join(' '));
            // her head on the pillow: cap, wide eyes (surprised), a hand peeking out
            const hc = [M(tx0 + 92 * u), ty - 100 * u + Math.sin(t * 3) * 2 * u];
            S(nHead, inkCircle(hc[0], hc[1], 54 * u, sd + 220, t, { fill: true }));
            S(nHair, inkLoop(MP([[M(hc[0]) - 56 * u, hc[1] + 20 * u], [M(hc[0]) - 50 * u, hc[1] - 30 * u], [M(hc[0]) - 20 * u, hc[1] - 50 * u], [M(hc[0]) - 34 * u, hc[1] - 6 * u], [M(hc[0]) - 40 * u, hc[1] + 30 * u]]), { seed: sd + 221, t, amp: 0.6 }));
            const CP = MP([[M(hc[0]) - 50 * u, hc[1] - 30 * u], [M(hc[0]) - 30 * u, hc[1] - 80 * u], [M(hc[0]) + 20 * u, hc[1] - 80 * u], [M(hc[0]) + 30 * u, hc[1] - 40 * u]]);
            S(nCap, inkLoop(CP, { seed: sd + 222, t, smooth: false, amp: 0.5 }));
            S(nCapB, inkPath(MP([[M(hc[0]) - 44 * u, hc[1] - 44 * u], [M(hc[0]) + 28 * u, hc[1] - 50 * u]]), { w: 10 * u, seed: sd + 223, t, taper: 0 }));
            const sur = prog(lt, strap, 0.3), F = [inkCircle(hc[0], hc[1], 54 * u, sd + 224, t, { w: 5 }), inkPath(CP, { w: 4, seed: sd + 225, t, closed: true, smooth: false })];
            [-1, 1].forEach((d, i) => { const ex = hc[0] - 12 * u + d * 18 * u, ey = hc[1] - 2 * u; F.push(inkDot(ex, ey, (5 + sur * 2) * u, (5 + sur * 3) * u, sd + 226 + i, t)); F.push(inkPath([[ex - 10 * u, ey - 18 * u - sur * 8 * u], [ex + 10 * u, ey - 16 * u - sur * 8 * u]], { w: 4, seed: sd + 228 + i, t })); });
            F.push(sur > 0.5 ? inkCircle(hc[0] - 14 * u, hc[1] + 26 * u, 8 * u, sd + 230, t, { w: 4 }) : inkPath([[hc[0] - 2 * u, hc[1] + 26 * u], [hc[0] - 26 * u, hc[1] + 26 * u]], { w: 4, seed: sd + 231, t }));
            const wav = Math.sin(lt * 9) * 14 * u * sur;
            const hand = [M(tx0 + 260 * u) + wav, ty - 120 * u];
            S(nHands, inkDot(hand[0], hand[1], 18 * u, 18 * u, sd + 232, t));
            F.push(inkCircle(hand[0], hand[1], 18 * u, sd + 233, t, { w: 3.5 }), inkPath([[hand[0], hand[1] + 16 * u], [M(tx0 + 250 * u), ty - 80 * u]], { w: 22 * u, seed: sd + 234, t, taper: 0 }));
            S(nFace, F.join(' '));
            // the doctor sits on a stool on the right, his own arm on a small side board
            const fx = 0.8 * W, seat = 0.505 * H;
            S(stool, inkLoop(sq(fx - 70 * u, seat, fx + 70 * u, seat + 24 * u), { seed: sd + 240, t, smooth: false, amp: 0.4 }) + ' ' + inkPath([[fx - 50 * u, seat + 24 * u], [fx - 70 * u, gy]], { w: 14 * u, seed: sd + 241, t, taper: 0 }) + ' ' + inkPath([[fx + 50 * u, seat + 24 * u], [fx + 70 * u, gy]], { w: 14 * u, seed: sd + 242, t, taper: 0 }));
            const bd = [[0.57 * W, 0.4 * H], [0.7 * W, 0.4 * H], [0.7 * W, 0.415 * H], [0.57 * W, 0.415 * H]];
            S(board, inkLoop(bd, { seed: sd + 243, t, smooth: false, amp: 0.4 }));
            S(boardL, inkPath(bd, { w: 4, seed: sd + 244, t, closed: true, smooth: false }) + ' ' + inkPath([[0.66 * W, 0.415 * H], [0.66 * W, gy]], { w: 12 * u, seed: sd + 245, t, taper: 0 }));
            S(tray, '');
            const look = lt > own ? [-2, 10] : [-4, 0];
            const r = doc.update(t, fx, gy, 1.2 * u, { face: -1, seat, lean: -6, armR: [0.6 * W, 0.395 * H], armL: [fx - 60 * u, seat - 30 * u], look, brow: lt > own ? 0.5 : 0.1 });
            // the tube: a coil on the board, into the bandage at his elbow; inside the arm a gold see-through line
            const elb = [lerp(r.sh[0], r.hR[0], 0.5), lerp(r.sh[1], r.hR[1], 0.5) + 6 * u];
            handTube.update(t, 0.6 * W, 0.4 * H - 24 * u, 34 * u, [[0.6 * W + 30 * u, 0.4 * H - 10 * u], [elb[0] - 20 * u, elb[1] + 16 * u], [elb[0], elb[1] + 4 * u]]);
            S(band, inkLoop([[elb[0] - 28 * u, elb[1] - 26 * u], [elb[0] + 28 * u, elb[1] - 32 * u], [elb[0] + 32 * u, elb[1] + 22 * u], [elb[0] - 24 * u, elb[1] + 28 * u]], { seed: sd + 250, t, smooth: false, amp: 0.4 }));
            S(bandL, inkPath([[elb[0] - 28 * u, elb[1] - 26 * u], [elb[0] + 28 * u, elb[1] - 32 * u], [elb[0] + 32 * u, elb[1] + 22 * u], [elb[0] - 24 * u, elb[1] + 28 * u]], { w: 3.5, seed: sd + 251, t, closed: true, smooth: false }));
            const hrt = [r.sh[0] - 6 * u, r.sh[1] + 84 * u];
            const path = [elb, [lerp(elb[0], r.sh[0], 0.5), lerp(elb[1], r.sh[1], 0.5) - 6 * u], [r.sh[0] - 4 * u, r.sh[1] + 10 * u], [r.sh[0] - 12 * u, r.sh[1] + 44 * u], hrt];
            const pp = progIO(lt, own, Math.max(1.2, dur - own - 0.4));
            const PP = partial(path, pp);
            S(seeO, PP.length > 1 ? inkPath(PP, { w: 28 * u, seed: sd + 252, t, amp: 0.5 }) : '');
            S(see, PP.length > 1 ? dashes(path, pp, 18 * u, 9 * u, sd + 260, t, 10 * u) : '');
            const beat = Math.pow(Math.max(0, Math.sin(t * TAU * 1.3)), 6);
            S(heart, inkLoop(heartPts(hrt[0], hrt[1], (30 + beat * 5) * u), { seed: sd + 270, t, amp: 0.5 }));
            S(glow, pp > 0.98 ? inkCircle(hrt[0], hrt[1], (48 + ((t * 1.2) % 1) * 30) * u, sd + 271, t, { w: 8 * u }) : '');
            front.update(t, W, H, 0.8 * H, { x0: -0.05, x1: 1.05 });
            blankAll(cab, cabIn, cabStuff, bottles, cabL, glass, doorL, keyE, shine);
            cabCoils.forEach(cc => cc.update(t, -999, -999, 1));
          }
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.fh_stairs
  SH.fh_stairs = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 571, root = el(svg, 'g'), u = W / 1080;
      const wall = tiledWall(el(root, 'g'), sd + 1);
      const lowFloor = checkerFloor(el(root, 'g'), sd + 10);
      const doorF = inkEl(root, WOOD()), doorGlow = inkEl(root, INK.gold, { 'fill-opacity': 0.45 }), doorLight = inkEl(root, INK.paperLight), doorL = inkEl(root), signB = inkEl(root, INK.ink), arrow = inkEl(root, INK.red);
      const signT = el(root, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, fill: INK.paperLight, 'letter-spacing': 3 });
      const steps = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.5)), stepsL = inkEl(root);
      const nG = el(root, 'g'), dG = el(root, 'g');
      const ns = nurse(nG, sd + 30);
      const doc = window.LH.person(dG, sd + 40, { kind: 'lab', hair: 'dark', glasses: false });
      const tubeO = inkEl(root), tubeI = inkEl(root, TUBE()), band = inkEl(root, INK.paperLight);
      const panel = inkEl(root, mix(INK.paperDark, INK.stain, 0.3)), panelL = inkEl(root), rail = inkEl(root, WOOD_D());
      const lampE = window.LH.lamp(el(root, 'g'), sd + 60);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const top = [0.0 * W, 0.47 * H], bot = [0.72 * W, 0.66 * H];
          wall.update(t, W, H, 0.3 * H, bot[1], { tile: 66 });
          lowFloor.update(t, W, H, bot[1], { vx: 0.85 });
          // the X-ray door at the bottom right, glowing
          const d0 = 0.76 * W, d1 = 0.98 * W, dt = 0.4 * H;
          const pulse = 0.85 + 0.15 * Math.sin(t * 3);
          doorGlow.setAttribute('fill-opacity', (0.45 * pulse).toFixed(3));
          S(doorGlow, inkCircle((d0 + d1) / 2, bot[1] - 120 * u, 230 * u, sd + 20, t, { fill: true, ry: 330 * u }));
          S(doorF, inkLoop(sq(d0, dt, d1, bot[1]), { seed: sd + 21, t, smooth: false, amp: 0.4 }));
          S(doorLight, inkLoop(sq(d0 + 30 * u, dt + 60 * u, d1 - 30 * u, dt + 180 * u), { seed: sd + 22, t, smooth: false, amp: 0.4 }));
          S(doorL, inkPath(sq(d0, dt, d1, bot[1]), { w: 6, seed: sd + 23, t, closed: true, smooth: false }) + ' ' + inkPath(sq(d0 + 30 * u, dt + 60 * u, d1 - 30 * u, dt + 180 * u), { w: 4, seed: sd + 24, t, closed: true, smooth: false }) + ' ' + inkDot(d0 + 30 * u, 0.56 * H, 10 * u, 10 * u, sd + 25, t));
          const sx = 0.8 * W, sy = 0.33 * H;
          S(signB, inkLoop(sq(sx - 140 * u, sy - 60 * u, sx + 140 * u, sy + 40 * u), { seed: sd + 26, t, smooth: false, amp: 0.5 }));
          signT.setAttribute('x', f1(sx)); signT.setAttribute('y', f1(sy + 14 * u)); signT.setAttribute('font-size', f1(66 * u)); signT.textContent = P.sign || 'X-RAY';
          const ab = Math.sin(t * 4) * 10 * u;
          S(arrow, inkPath([[sx, sy + 60 * u + ab], [sx, sy + 130 * u + ab]], { w: 14 * u, seed: sd + 27, t }) + ' ' + inkLoop([[sx - 30 * u, sy + 120 * u + ab], [sx + 30 * u, sy + 120 * u + ab], [sx, sy + 160 * u + ab]], { seed: sd + 28, t, smooth: false, amp: 0.4 }));
          lampE.update(t, 0.42 * W, 0.2 * H, 1, 0.5 * H, 200 * u);
          // stair treads from top-left to bottom-right
          const n = 11, ST = [], SL = [];
          const stepX = (bot[0] - top[0]) / n, stepY = (bot[1] - top[1]) / n;
          const nose = [];
          for (let i = 0; i < n; i++) {
            const x = top[0] + i * stepX, y = top[1] + i * stepY;
            ST.push(inkLoop([[x, y], [x + stepX, y], [x + stepX, y + stepY], [x + stepX + 40 * u, y + stepY - 30 * u], [x + 40 * u, y - 30 * u]], { seed: sd + 100 + i, t, smooth: false, amp: 0.4 }));
            SL.push(inkPath([[x + 40 * u, y - 30 * u], [x, y], [x + stepX, y], [x + stepX, y + stepY]], { w: 4, seed: sd + 120 + i, t, smooth: false }));
            nose.push([x, y]);
          }
          S(steps, ST.join(' ')); S(stepsL, SL.join(' '));
          const onStair = q => { const x = lerp(top[0], bot[0], q), i = Math.min(n - 1, Math.floor((x - top[0]) / stepX)); return [x, top[1] + (i + 1) * stepY - 12 * u]; };
          // the doctor walks down (step by step), the nurse follows
          const pr = lerp(0.38, 0.86, clamp01(lt / Math.max(1, dur)));
          const bob = Math.abs(Math.sin(lt * 5.2)) * 10 * u;
          const dp = onStair(pr), np = onStair(pr - 0.3);
          ns.update(t, np[0], np[1] - bob * 0.8, 1.0 * u, { face: 1, armL: [np[0] - 40 * u, np[1] - 230 * u], armR: [np[0] + 70 * u, np[1] - 260 * u], brow: 0.5, look: [6, 4] });
          const r = doc.update(t, dp[0], dp[1] - bob, 1.05 * u, { face: 1, lean: 4, armR: [dp[0] + 70 * u, dp[1] - 340 * u], armL: [dp[0] + 60 * u, dp[1] - 300 * u], brow: 0.3, look: [6, 6] });
          // tube dangling from his elbow under a bandage
          const elb = [lerp(r.sh[0], r.hR[0], 0.45), lerp(r.sh[1], r.hR[1], 0.45) + 4 * u];
          const sw = Math.sin(lt * 5.2) * 20 * u;
          const TP = [elb, [elb[0] + 10 * u, elb[1] + 80 * u], [elb[0] - 20 * u + sw, elb[1] + 160 * u], [elb[0] + 30 * u + sw, elb[1] + 210 * u]];
          S(tubeO, inkPath(TP, { w: 13 * u, seed: sd + 140, t, taper: 0 })); S(tubeI, inkPath(TP, { w: 6 * u, seed: sd + 141, t, taper: 0 }));
          S(band, inkCircle(elb[0], elb[1], 22 * u, sd + 142, t, { fill: true }));
          // the stair side panel in front (hides the legs) + banister, down to the frame bottom
          const PT = nose.map(q => [q[0], q[1] - 120 * u]).concat([[bot[0] + 30 * u, bot[1] - 120 * u]]);
          const PN = PT.concat([[bot[0] + 30 * u, H + 20], [-20, H + 20], [-20, PT[0][1]]]);
          S(panel, inkLoop(PN, { seed: sd + 150, t, smooth: false, amp: 0.4 }));
          const PNL = [inkPath(PT, { w: 7, seed: sd + 151, t, smooth: false }), inkPath([[bot[0] + 30 * u, bot[1] - 120 * u], [bot[0] + 30 * u, H + 20]], { w: 7, seed: sd + 152, t })];
          for (let i = 0; i < 5; i++) { const y = bot[1] + 60 * u + i * 110 * u; PNL.push(inkPath([[-20, y - (bot[0] - 0) * (stepY / stepX) * 0 ], [bot[0], y]], { w: 2.5, seed: sd + 153 + i, t })); }
          for (let c = 0; c < 3; c++) for (let rr = 0; rr < 2; rr++) {
            const px0 = 30 * u + c * 230 * u, py0 = bot[1] + 80 * u + rr * 250 * u;
            const lim = top[1] - 120 * u + (px0 + 200 * u - top[0]) * (stepY / stepX) + 30 * u;
            const y0 = Math.max(py0, lim);
            if (py0 + 200 * u - y0 > 60 * u && px0 + 200 * u < bot[0]) PNL.push(inkPath(sq(px0, y0, px0 + 200 * u, py0 + 200 * u), { w: 4, seed: sd + 170 + c * 3 + rr, t, closed: true, smooth: false }), inkPath(sq(px0 + 18 * u, y0 + 18 * u, px0 + 182 * u, py0 + 182 * u), { w: 2.5, seed: sd + 180 + c * 3 + rr, t, closed: true, smooth: false }));
          }
          S(panelL, PNL.join(' '));
          S(rail, inkPath(PT.map(q => [q[0], q[1] - 40 * u]), { w: 18 * u, seed: sd + 160, t, taper: 0 }));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ X-ray film
  function film(parent, sd) {
    const g = el(parent, 'g');
    const glowE = inkEl(g, INK.paperLight, { 'fill-opacity': 0.6 }), frame = inkEl(g, STEEL()), plate = inkEl(g, FILM()), lung = inkEl(g, mix(FILM(), INK.paperLight, 0.08));
    const bones = inkEl(g, BONE(), { 'fill-opacity': 0.75 }), heartS = inkEl(g, BONE(), { 'fill-opacity': 0.38 }), cath = inkEl(g, INK.paperLight), ring = inkEl(g, INK.gold), lines = inkEl(g);
    return { update(t, x0, y0, x1, y1, o = {}) {
      const w = x1 - x0, h = y1 - y0, X = q => x0 + q * w, Y = q => y0 + q * h;
      const fl = 0.85 + 0.15 * Math.sin(t * 2.4);
      glowE.setAttribute('fill-opacity', (0.5 * fl).toFixed(3));
      S(glowE, inkLoop(sq(x0 - 40, y0 - 40, x1 + 40, y1 + 40), { seed: sd, t, smooth: true, amp: 1 }));
      S(frame, inkLoop(sq(x0 - 22, y0 - 22, x1 + 22, y1 + 22), { seed: sd + 1, t, smooth: false, amp: 0.5 }));
      S(plate, inkLoop(sq(x0, y0, x1, y1), { seed: sd + 2, t, smooth: false, amp: 0.5 }));
      S(lung, inkCircle(X(0.32), Y(0.5), w * 0.2, sd + 3, t, { ry: h * 0.33, fill: true }) + ' ' + inkCircle(X(0.68), Y(0.5), w * 0.2, sd + 4, t, { ry: h * 0.33, fill: true }));
      const BN = [inkPath([[X(0.5), Y(0.02)], [X(0.5), Y(0.98)]], { w: w * 0.06, seed: sd + 5, t, amp: 0.6, taper: 0 })];
      for (let i = 0; i < 8; i++) {
        const y = 0.2 + i * 0.085, sp = 0.36 + Math.sin((i + 1) / 9 * Math.PI) * 0.06;
        BN.push(inkPath([[X(0.48), Y(y)], [X(0.5 - sp * 0.6), Y(y - 0.03)], [X(0.5 - sp), Y(y + 0.04)], [X(0.5 - sp * 0.9), Y(y + 0.1)]], { w: w * 0.022, seed: sd + 10 + i, t, amp: 0.5 }));
        BN.push(inkPath([[X(0.52), Y(y)], [X(0.5 + sp * 0.6), Y(y - 0.03)], [X(0.5 + sp), Y(y + 0.04)], [X(0.5 + sp * 0.9), Y(y + 0.1)]], { w: w * 0.022, seed: sd + 20 + i, t, amp: 0.5 }));
      }
      BN.push(inkPath([[X(0.46), Y(0.13)], [X(0.3), Y(0.1)], [X(0.1), Y(0.14)]], { w: w * 0.03, seed: sd + 30, t }), inkPath([[X(0.54), Y(0.13)], [X(0.7), Y(0.1)], [X(0.9), Y(0.14)]], { w: w * 0.03, seed: sd + 31, t }));
      BN.push(inkPath([[X(0.95), Y(0.12)], [X(0.99), Y(0.5)]], { w: w * 0.05, seed: sd + 32, t, taper: 0 }));     // upper arm bone (his left, viewer right)
      S(bones, BN.join(' '));
      // heart shadow: mostly to the viewer's right of the spine (his left), right atrium bulging left of the spine
      const HP = [[0.43, 0.48], [0.5, 0.44], [0.6, 0.46], [0.7, 0.55], [0.74, 0.68], [0.66, 0.8], [0.5, 0.82], [0.4, 0.78], [0.37, 0.66], [0.39, 0.56]].map(q => [X(q[0]), Y(q[1])]);
      S(heartS, inkLoop(HP, { seed: sd + 40, t, amp: 0.6 }));
      // the catheter: from the arm, under the collarbone, down beside the spine into the right atrium
      const CP = [[0.99, 0.32], [0.86, 0.22], [0.7, 0.18], [0.56, 0.2], [0.46, 0.3], [0.43, 0.45], [0.42, 0.6], [0.425, 0.68]].map(q => [X(q[0]), Y(q[1])]);
      const PP = partial(CP, o.cath ?? 1);
      S(cath, PP.length > 1 ? inkPath(PP, { w: Math.max(5, w * 0.012), seed: sd + 50, t, amp: 0.5, taper: 0 }) : '');
      const tip = PP.length ? PP[PP.length - 1] : CP[0];
      const rg = o.ring || 0, ph = (t * 1.1) % 1;
      S(ring, rg > 0 ? inkCircle(tip[0], tip[1], w * (0.05 + ph * 0.06), sd + 51, t, { w: (10 - ph * 6) * rg + 1 }) + ' ' + inkCircle(tip[0], tip[1], w * 0.045, sd + 52, t, { w: 6 * rg + 1 }) : '');
      S(lines, inkPath(sq(x0 - 22, y0 - 22, x1 + 22, y1 + 22), { w: 7, seed: sd + 53, t, closed: true, smooth: false }) + ' ' + inkPath(sq(x0, y0, x1, y1), { w: 4, seed: sd + 54, t, closed: true, smooth: false }) +
        ' ' + inkDot(x0 + 30, y0 + 30, 9, 9, sd + 55, t) + ' ' + inkDot(x1 - 30, y0 + 30, 9, 9, sd + 56, t));
      return { tip };
    } };
  }

  // ------------------------------------------------------------------ SHOTS.fh_xray
  SH.fh_xray = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 691, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'plate';
      const wall = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.32)), wallL = inkEl(root, mix(INK.inkSoft, INK.ink, 0.2));
      const floor = boardFloor(el(root, 'g'), sd + 5);
      const machine = inkEl(root, STEEL()), machineL = inkEl(root), tubeHead = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.2));
      const F = film(el(root, 'g'), sd + 10);
      const kas = kasifOf(root, P.kasif, W, H, sd);
      const front = window.LH.front(el(root, 'g'), sd + 40, 'desk');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, gy = 0.6 * H;
          S(wall, inkLoop(sq(-20, -20, W + 20, gy), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          const WL = []; for (let k = 0; k < 9; k++) WL.push(inkPath([[k * 130 * u + 30 * u, 0], [k * 130 * u + 32 * u, gy]], { w: 2, seed: sd + 2 + k, t }));
          S(wallL, WL.join(' '));
          floor.update(t, W, H, gy);
          if (mode === 'plate') {
            const heartAt = atOr(cues, 'heart', dur * 0.6);
            const c = prog(lt, atOr(cues, 'cath', 0.1), Math.max(0.6, heartAt - 0.3));
            F.update(t, 0.12 * W, 0.28 * H, 0.88 * W, 0.63 * H, { cath: c, ring: prog(lt, heartAt, 0.3) });
            S(machine, ''); S(machineL, ''); S(tubeHead, '');
          } else {
            // the 1920s X-ray stand on the right behind Kaşif, the lightbox on the left
            const mx = 0.86 * W;
            S(machine, inkPath([[mx, 0.12 * H], [mx, gy]], { w: 30 * u, seed: sd + 20, t, taper: 0 }) + ' ' + inkLoop(sq(mx - 90 * u, gy - 20 * u, mx + 90 * u, gy + 10 * u), { seed: sd + 21, t, smooth: false }));
            const sw = Math.sin(t * 0.8) * 4 * u;
            S(tubeHead, inkCircle(mx - 90 * u + sw, 0.2 * H, 70 * u, sd + 22, t, { fill: true, ry: 50 * u }));
            S(machineL, inkCircle(mx - 90 * u + sw, 0.2 * H, 70 * u, sd + 23, t, { w: 5, ry: 50 * u }) + ' ' + inkPath([[mx, 0.2 * H], [mx - 30 * u + sw, 0.2 * H]], { w: 14 * u, seed: sd + 24, t }) + ' ' + inkPath([[mx - 160 * u + sw, 0.2 * H], [mx - 230 * u, 0.15 * H], [mx - 260 * u, 0.05 * H]], { w: 6, seed: sd + 25, t }));
            F.update(t, 0.07 * W, 0.17 * H, 0.57 * W, 0.47 * H, { cath: 1, ring: 1 });
          }
          front.update(t, W, H, (P.front ?? 0.76) * H, {});
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.fh_mock
  SH.fh_mock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, root = el(svg, 'g'), u = W / 1080;
      const wall = inkEl(root, mix(INK.paperDark, INK.stain, 0.25)), wallL = inkEl(root, WOOD_D());
      const boardE = inkEl(root, mix(INK.green, INK.ink, 0.55)), boardL = inkEl(root, WOOD_D()), chalk = inkEl(root, INK.paperLight, { 'fill-opacity': 0.85 }), cross = inkEl(root, INK.red);
      const stage = inkEl(root, WOOD()), stageL = inkEl(root);
      const doc = window.LH.person(el(root, 'g'), sd + 20, { kind: 'lab', hair: 'dark', glasses: false });
      const xr = film(el(root, 'g'), sd + 30);
      const crowd = [0, 1].map(r => ({ suits: inkEl(root, mix(INK.ink, INK.inkSoft, 0.3 + r * 0.1)), heads: inkEl(root, SKIN()), hair: inkEl(root, INK.paperLight), dark: inkEl(root, INK.ink), lines: inkEl(root) }));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, quit = atOr(cues, 'quit', dur * 0.6), laugh = atOr(cues, 'laugh', 0.2), gy = 0.58 * H;
          S(wall, inkLoop(sq(-20, -20, W + 20, H + 20), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          S(wallL, inkPath([[-20, 0.5 * H], [W + 20, 0.5 * H]], { w: 8, seed: sd + 2, t }));
          // blackboard with a chalk heart and the route from the arm
          const b0 = 0.06 * W, b1 = 0.6 * W, by0 = 0.16 * H, by1 = 0.42 * H;
          S(boardE, inkLoop(sq(b0, by0, b1, by1), { seed: sd + 3, t, smooth: false, amp: 0.4 }));
          S(boardL, inkPath(sq(b0, by0, b1, by1), { w: 16 * u, seed: sd + 4, t, closed: true, smooth: false }));
          const hx = (b0 + b1) / 2, hy = (by0 + by1) / 2 + 20 * u;
          S(chalk, inkPath(heartPts(hx, hy, 120 * u), { w: 7, seed: sd + 5, t, closed: true }) + ' ' + dashes([[b0 + 30 * u, by0 + 40 * u], [hx - 80 * u, by0 + 70 * u], [hx - 30 * u, hy - 80 * u]], 1, 20 * u, 14 * u, sd + 6, t, 6) +
            ' ' + inkLoop([[hx - 40 * u, hy - 100 * u], [hx - 10 * u, hy - 78 * u], [hx - 46 * u, hy - 66 * u]], { seed: sd + 7, t, smooth: false }));
          const cq = progIO(lt, quit, 0.5);
          S(cross, cq > 0 ? inkPath(partial([[hx - 150 * u, hy - 150 * u], [hx + 150 * u, hy + 150 * u]], Math.min(1, cq * 2)), { w: 22 * u, seed: sd + 8, t }) + (cq > 0.5 ? ' ' + inkPath(partial([[hx + 150 * u, hy - 150 * u], [hx - 150 * u, hy + 150 * u]], (cq - 0.5) * 2), { w: 22 * u, seed: sd + 9, t }) : '') : '');
          // low stage
          S(stage, inkLoop(sq(-20, gy, W + 20, gy + 60 * u), { seed: sd + 10, t, smooth: false, amp: 0.4 }));
          S(stageL, inkPath([[-20, gy], [W + 20, gy]], { w: 7, seed: sd + 11, t }) + ' ' + inkPath([[-20, gy + 60 * u], [W + 20, gy + 60 * u]], { w: 5, seed: sd + 12, t }));
          // the doctor holds up his X-ray; after "quit" he lowers it and hangs his head
          const dn = progIO(lt, quit, 0.6), fx = 0.76 * W;
          const hand = [lerp(fx - 190 * u, fx - 120 * u, dn), lerp(gy - 470 * u, gy - 230 * u, dn)];
          const r = doc.update(t, fx, gy, 1.2 * u, { face: -1, lean: lerp(-2, 6, dn), armR: hand, armL: [hand[0] + 80 * u, hand[1] + 20 * u], droop: dn * 0.8, brow: lerp(0.4, 1, dn), look: [2, lerp(-6, 8, dn)] });
          void r;
          const fw = 230 * u, fh = 270 * u;
          xr.update(t, hand[0] - fw * 0.5, hand[1] - fh * 0.9, hand[0] + fw * 0.5, hand[1] + fh * 0.1, { cath: 1, ring: 0 });
          // two rows of laughing experts (backs of heads, some in profile), rocking with laughter
          const rows = [{ y: 0.7 * H, n: 5, s: 1.0 }, { y: 0.84 * H, n: 4, s: 1.35 }];
          rows.forEach((R, ri) => {
            const C = crowd[ri], SU = [], HE = [], HA = [], DK = [], LN = [];
            for (let i = 0; i < R.n; i++) {
              const ph = i * 1.7 + ri, lg = lt > laugh ? Math.abs(Math.sin(t * 9 + ph)) : 0;
              const x = (i + 0.5 + (ri ? 0.1 : -0.05)) / R.n * W, s = R.s * u, y = R.y - lg * 12 * s;
              const prof = (i + ri) % 2 ? 1 : -1;
              SU.push(inkLoop([[x - 130 * s, H + 40], [x - 120 * s, y + 90 * s], [x - 50 * s, y + 60 * s], [x + 50 * s, y + 60 * s], [x + 120 * s, y + 90 * s], [x + 130 * s, H + 40]], { seed: sd + 100 + ri * 20 + i, t, amp: 0.8 }));
              const hc = [x, y];
              HE.push(inkCircle(hc[0], hc[1], 62 * s, sd + 140 + ri * 20 + i, t, { fill: true, ry: 68 * s }));
              LN.push(inkCircle(hc[0], hc[1], 62 * s, sd + 160 + ri * 20 + i, t, { w: 5, ry: 68 * s }));
              // white hair fringe round the back (a bald crown), or dark hair
              const white = (i + ri * 2) % 3 !== 0;
              (white ? HA : DK).push(inkLoop([[hc[0] - 64 * s, hc[1] + 10 * s], [hc[0] - 58 * s, hc[1] - 30 * s], [hc[0] - 40 * s, hc[1] - 20 * s], [hc[0] + 40 * s, hc[1] - 20 * s], [hc[0] + 58 * s, hc[1] - 30 * s], [hc[0] + 64 * s, hc[1] + 10 * s], [hc[0] + 40 * s, hc[1] + 50 * s], [hc[0] - 40 * s, hc[1] + 50 * s]], { seed: sd + 180 + ri * 20 + i, t, amp: 0.6 }));
              // laughing profile: an ear and an open mouth at the side
              const ex = hc[0] + prof * 52 * s;
              LN.push(inkCircle(hc[0] - prof * 60 * s, hc[1] + 6 * s, 12 * s, sd + 200 + ri * 20 + i, t, { w: 3.5 }));
              if (lg > 0.2) DK.push(inkDot(ex + prof * 6 * s, hc[1] + 28 * s, 10 * s, (6 + lg * 6) * s, sd + 220 + ri * 20 + i, t));
              LN.push(inkPath([[ex - prof * 10 * s, hc[1] - 6 * s], [ex + prof * 4 * s, hc[1] - 12 * s]], { w: 4, seed: sd + 240 + ri * 20 + i, t }));
              // a pointing hand on some
              if ((i + ri) % 3 === 1) { const hx2 = x + 30 * s, hy2 = y - 40 * s - lg * 10 * s; LN.push(inkPath([[x + 80 * s, y + 80 * s], [hx2 + 40 * s, hy2 + 20 * s], [hx2 + 60 * s, hy2 - 60 * s]], { w: 22 * s, seed: sd + 260 + ri * 20 + i, t })); }
            }
            S(C.suits, SU.join(' ')); S(C.heads, HE.join(' ')); S(C.hair, HA.join(' ')); S(C.dark, DK.join(' ')); S(C.lines, LN.join(' '));
          });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.fh_nobel
  SH.fh_nobel = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 931, root = el(svg, 'g'), u = W / 1080;
      const curtain = inkEl(root, mix(INK.blue, INK.ink, 0.25)), folds = inkEl(root, mix(INK.blue, INK.ink, 0.5)), foldsL = inkEl(root, mix(INK.blue, INK.paperLight, 0.3));
      const spot = inkEl(root, INK.gold, { 'fill-opacity': 0.22 });
      const ribbon = inkEl(root, INK.blue), ribbonL = inkEl(root), medal = inkEl(root, INK.gold), medalD = inkEl(root, mix(INK.gold, INK.ink, 0.35)), medalL = inkEl(root), shine = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 });
      const yearBox = inkEl(root, INK.paperLight), yearL = inkEl(root);
      const year = el(root, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, fill: INK.ink });
      const old = window.LH.person(el(root, 'g'), sd + 40, { kind: 'sweater', col: mix(INK.ink, INK.inkSoft, 0.3), hair: 'white', glasses: true });
      const stage = inkEl(root, WOOD()), stageL = inkEl(root), flowers = inkEl(root, INK.red), flowers2 = inkEl(root, INK.gold), leaves = inkEl(root, LEAF_D());
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, gy = 0.62 * H;
          S(curtain, inkLoop(sq(-20, -20, W + 20, gy), { seed: sd + 1, t, smooth: false, amp: 0.3 }));
          const FD = [], FL = [];
          for (let i = 0; i < 10; i++) { const x = (i + 0.3) / 10 * W, sw = Math.sin(t * 0.9 + i) * 10 * u; FD.push(inkPath([[x, -20], [x + sw, gy * 0.5], [x - sw * 0.5, gy]], { w: 40 * u, seed: sd + 10 + i, t, taper: 0 })); FL.push(inkPath([[x + 50 * u, -20], [x + 50 * u + sw, gy * 0.5], [x + 50 * u - sw * 0.5, gy]], { w: 8 * u, seed: sd + 30 + i, t, taper: 0 })); }
          S(folds, FD.join(' ')); S(foldsL, FL.join(' '));
          // year counter 1929 -> 1956
          const ya = atOr(cues, 'years', 0.1), yp = progIO(lt, ya, 1.6);
          const yv = Math.round(lerp(P.from ?? 1929, P.to ?? 1956, yp));
          const yx = 0.64 * W, yy = 0.19 * H;
          S(yearBox, inkLoop(sq(yx - 230 * u, yy - 130 * u, yx + 230 * u, yy + 40 * u), { seed: sd + 50, t, smooth: false, amp: 0.6 }));
          S(yearL, inkPath(sq(yx - 230 * u, yy - 130 * u, yx + 230 * u, yy + 40 * u), { w: 7, seed: sd + 51, t, closed: true, smooth: false }));
          year.setAttribute('x', f1(yx)); year.setAttribute('y', f1(yy + 10 * u)); year.setAttribute('font-size', f1(150 * u));
          year.setAttribute('fill', yp >= 1 ? INK.red : INK.ink);
          year.textContent = String(yv);
          // the medal swings on its ribbon
          const sw = Math.sin(t * 1.6) * 0.06, pv = [0.5 * W, 0.27 * H], len = 0.2 * H, r = 175 * u * (1 + 0.08 * punch(lt, atOr(cues, 'hit', null), 0.8));
          const mc = [pv[0] + Math.sin(sw) * len, pv[1] + Math.cos(sw) * len];
          S(spot, inkCircle(mc[0], mc[1], 330 * u, sd + 60, t, { fill: true }));
          const RB = [[pv[0] - 50 * u, pv[1]], [pv[0] + 50 * u, pv[1]], [mc[0] + 30 * u, mc[1] - r + 10 * u], [mc[0] - 30 * u, mc[1] - r + 10 * u]];
          S(ribbon, inkLoop(RB, { seed: sd + 61, t, smooth: false, amp: 0.5 }));
          S(ribbonL, inkPath(RB, { w: 5, seed: sd + 62, t, closed: true, smooth: false }));
          S(medal, inkCircle(mc[0], mc[1], r, sd + 63, t, { fill: true }));
          // a profile relief inside the medal
          const q = (dx, dy) => [mc[0] + dx * r, mc[1] + dy * r];
          S(medalD, inkCircle(mc[0], mc[1], r * 0.82, sd + 64, t, { w: 6 }) + ' ' + inkPath([q(0.25, 0.55), q(0.18, 0.2), q(0.32, 0.02), q(0.28, -0.15), q(0.32, -0.3), q(0.12, -0.5), q(-0.15, -0.48), q(-0.3, -0.25), q(-0.28, 0.1), q(-0.12, 0.3), q(-0.2, 0.55)], { w: 8, seed: sd + 65, t }));
          S(medalL, inkCircle(mc[0], mc[1], r, sd + 66, t, { w: 7 }));
          const sh = (t * 0.35) % 1;
          S(shine, inkLoop([q(-0.8 + sh * 1.6, -0.6), q(-0.65 + sh * 1.6, -0.6), q(-0.45 + sh * 1.6, 0.6), q(-0.6 + sh * 1.6, 0.6)], { seed: sd + 67, t, smooth: false, amp: 0.5 }));
          // the old doctor looks up at it, smiling
          const ox = 0.2 * W;
          old.update(t, ox, gy, 1.3 * u, { face: 1, lean: Math.sin(t * 1.2) * 2, armR: [ox + 170 * u, gy - 470 * u], armL: [ox + 30 * u, gy - 260 * u], look: [4, -8], brow: 0.4 });
          // stage front with flowers
          S(stage, inkLoop(sq(-20, gy, W + 20, H + 20), { seed: sd + 70, t, smooth: false, amp: 0.3 }));
          const SL = [inkPath([[-20, gy], [W + 20, gy]], { w: 8, seed: sd + 71, t })]; for (let i = 1; i < 6; i++) SL.push(inkPath([[-20, gy + i * 130 * u], [W + 20, gy + i * 130 * u]], { w: 3, seed: sd + 72 + i, t }));
          S(stageL, SL.join(' '));
          const FR = [], F2 = [], LV = [];
          for (let i = 0; i < 9; i++) {
            const x = (i + 0.5) / 9 * W, y = 0.79 * H + (i % 2) * 40 * u, s2 = Math.sin(t * 1.3 + i) * 5 * u;
            LV.push(inkCircle(x + s2, y + 90 * u, 120 * u, sd + 80 + i, t, { fill: true, ry: 90 * u }));
            for (let k = 0; k < 3; k++) { const fx = x - 50 * u + k * 50 * u + s2, fy = y + (k % 2) * 30 * u; (k % 2 ? F2 : FR).push(inkCircle(fx, fy, 34 * u, sd + 100 + i * 3 + k, t, { fill: true })); }
          }
          LV.push(inkLoop(sq(-20, 0.86 * H, W + 20, H + 20), { seed: sd + 140, t, smooth: false, amp: 0.4 }));
          S(leaves, LV.join(' ')); S(flowers, FR.join(' ')); S(flowers2, F2.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
