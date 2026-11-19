// tc_terracotta: shots for the Stickstory Short "Kids' fingerprints are hidden in the Terracotta Army" (2026-11-19):
// Qin Shi Huang, China's first emperor, had thousands of life-size clay soldiers made to guard his tomb (buried
// 210-209 BC); farmers digging a well found them in 1974; the paint curls and flakes within minutes of meeting air;
// a 2026 fingerprint study (Journal of Cultural Heritage) estimates ~22 % of the prints came from children under 15.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif, LH.label, LH.person).
//
// Common: labels: [{text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}] (LH.label)
//   kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} (LH.kasif)
//
// SHOTS.tc_head — one clay warrior seen big (head + armoured chest, the body runs off the frame bottom) in front of rows
//   of warriors in the pit; a fingerprint on his cheek. P: {x (0..1), y (head centre 0..1 H), s (scale, 2.4),
//   mode: "hook" (the print draws itself and glows) | "lens" (a magnifying glass slides in over the print on cue "lens"),
//   print: [lx, ly] (warrior units), crowd: {y0, y1, rows}, traces: 0..1 (paint traces left), labels}
// SHOTS.tc_emperor — Qin Shi Huang on his throne (mianguan crown with bead strings), pointing; incense smoke from two
//   bronze vessels; on cue "soldiers" a row of small clay soldiers springs up on the dais steps. P: {s, labels}
// SHOTS.tc_army — rows of clay warriors in perspective. P: {mode: "mound" (the burial mound on the horizon, rows rise
//   out of the ground one by one) | "pit" (earthen partition walls of Pit 1, dust in light shafts), vp: [x, y],
//   rows, cols, near: y (front row feet, 0..1 H), far, kasif, labels}
// SHOTS.tc_well — a dry field and the earth below it in cross-section with buried warriors.
//   P: {mode: "buried" (earth layers build up while a year counter runs from 210 BC to 1974 at cue "y"; farmers walk in)
//   | "dig" (a well shaft; a farmer digs, earth flies up, on cue "hit" the spade strikes a clay head), gy, labels}
// SHOTS.tc_paint — one full warrior on a plinth. P: {mode: "reveal" (colour is painted on top-down from cue "paint")
//   | "flake" (from cue "flake" the paint curls and falls off in chips, stopwatch runs), x, s, kasif, labels}
// SHOTS.tc_workshop — a Qin workshop: an unfinished warrior, a man, a woman and a child shaping it; on cue "kid" the
//   child's fingerprint lights up and a row of five prints (one red) appears. P: {labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const ellP = (cx, cy, rx, ry, n = 16, a0 = 0, a1 = TAU) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * (a1 - a0); o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const CLAY = () => mix(mix(INK.stain, INK.red, 0.3), INK.paperDark, 0.22);
  const CLAY_L = () => mix(CLAY(), INK.paperLight, 0.35);
  const CLAY_D = () => mix(CLAY(), INK.ink, 0.32);
  const EARTH = () => mix(INK.stain, INK.paperDark, 0.35);
  const EARTH_D = () => mix(INK.stain, INK.ink, 0.28);
  const SKIN = () => mix(INK.paperLight, INK.red, 0.22);
  const LOW = () => mix(INK.inkSoft, INK.paperDark, 0.35);
  const sq = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // ------------------------------------------------------------------ warrior geometry (front view, feet at 0,0; ~800 units)
  const G = {
    base: sq(-120, 0, 120, -34),
    legs: [[-64, -34], [64, -34], [60, -214], [-60, -214]],
    skirt: [[-98, -404], [98, -404], [122, -196], [-122, -196]],
    armor: [[-106, -592], [106, -592], [100, -372], [0, -356], [-100, -372]],
    sleeveL: [[-104, -594], [-146, -570], [-162, -470], [-150, -372], [-112, -372], [-112, -470]],
    sleeveR: [[104, -594], [146, -570], [168, -480], [136, -420], [96, -430], [116, -500]],
    neck: [[-30, -588], [30, -588], [26, -632], [-26, -632]],
    scarf: [[-46, -580], [46, -580], [40, -610], [-40, -610]],
    head: ellP(0, -694, 60, 74, 18),
    hair: [[-60, -700], [-58, -738], [-34, -766], [0, -772], [34, -766], [58, -738], [60, -700], [40, -728], [0, -738], [-40, -728]],
    knot: ellP(30, -786, 24, 22, 12),
    handL: [-131, -356], handR: [100, -420],
  };
  const PAINT = () => ({ legs: INK.blue, skirt: INK.red, sleeveL: INK.green, sleeveR: INK.green, armor: mix(INK.ink, INK.inkSoft, 0.3), neck: SKIN(), head: SKIN(), scarf: INK.gold });

  // Full warrior at a fixed place (x, y feet, s px per unit): clay body, optional paint layer made of cells clipped to
  // each part (so it can be painted on or flake off), detail lines, falling paint chips.
  function warrior(root, defs, sd, x, y, s, o = {}) {
    const T = p => [x + p[0] * s, y + p[1] * s], TT = pts => pts.map(T);
    const g = el(root, 'g');
    const under = inkEl(g), clay = inkEl(g, CLAY()), clayL = inkEl(g, CLAY_L()), hands = inkEl(g, CLAY());
    const paintG = el(g, 'g'), parts = {}, PC = PAINT();
    const usePaint = !!o.paint;
    const r0 = rng(sd + 5);
    if (usePaint) {
      Object.keys(PC).forEach((k, i) => {
        const id = `tcclip${sd}_${i}`, cp = el(defs, 'clipPath', { id });
        el(cp, 'path', { d: inkLoop(TT(G[k]), { seed: sd + 400 + i, t: 0, amp: 0 }) });
        const gg = el(paintG, 'g', { 'clip-path': `url(#${id})` }), p = inkEl(gg, PC[k]);
        const xs = G[k].map(q => q[0]), ys = G[k].map(q => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const c = 26, cells = [];
        for (let cy = y0 - 4; cy < y1 + 4; cy += c) for (let cx = x0 - 4; cx < x1 + 4; cx += c) {
          const thr = r0(), j = () => (r0() - 0.5) * 8;
          const q = [[cx + j(), cy + j()], [cx + c + 6 + j(), cy + j()], [cx + c + 6 + j(), cy + c + 6 + j()], [cx + j(), cy + c + 6 + j()]];
          cells.push({ d: 'M' + TT(q).map(v => f1(v[0]) + ' ' + f1(v[1])).join(' L') + ' Z', cx: x + (cx + c / 2) * s, cy: y + (cy + c / 2) * s, yf: (cy - y0) / Math.max(1, y1 - y0), thr, sp: r0() });
        }
        parts[k] = { p, cells, col: PC[k], chips: null };
      });
      Object.keys(parts).forEach(k => { parts[k].chips = inkEl(g, parts[k].col); });
    }
    const hair = inkEl(g, CLAY_D()), plates = inkEl(g, mix(CLAY_D(), INK.ink, 0.2)), rivets = inkEl(g, CLAY_D()), lines = inkEl(g), slot = el(g, 'g'), face = inkEl(g), curls = inkEl(g, INK.paperLight);
    const lw = 6 * Math.pow(s, 0.55);
    return {
      // st: {reveal: 0..1 | null, flipAt: cell -> time (flake), lt, painted: bool}
      update(t, st = {}) {
        const P = (pts, k, ex = {}) => inkPath(TT(pts), Object.assign({ w: lw, seed: sd + k, t, amp: 1.1 }, ex));
        const Lp = (pts, k) => inkLoop(TT(pts), { seed: sd + k, t, amp: 0.9 });
        under.setAttribute('d', '');
        clay.setAttribute('d', ['base', 'legs', 'skirt', 'sleeveL', 'sleeveR', 'armor', 'neck'].map((k, i) => Lp(G[k], 10 + i)).join(' ') + ' ' + Lp(G.head, 20));
        clayL.setAttribute('d', Lp(G.scarf, 21) + ' ' + inkDot(...T([-62, -694]), 12 * s, 18 * s, sd + 22, t) + ' ' + inkDot(...T([62, -694]), 12 * s, 18 * s, sd + 23, t));
        hands.setAttribute('d', inkCircle(...T(G.handL), 24 * s, sd + 24, t, { fill: true }) + ' ' + inkCircle(...T(G.handR), 24 * s, sd + 25, t, { fill: true }));
        // paint cells
        const CU = [];
        if (usePaint) {
          const lt = st.lt ?? 0;
          Object.keys(parts).forEach(k => {
            const pa = parts[k], D = [], CH = [];
            pa.cells.forEach((c, i) => {
              let on = true;
              if (st.reveal != null) on = st.reveal > c.yf * 0.8 + c.thr * 0.2;
              if (st.flipAt) {
                const tf = st.flipAt(c);
                if (tf != null && lt >= tf) {
                  on = false;
                  const age = lt - tf;
                  if (age < 1.5) {   // a chip curling and falling
                    const fx = c.cx + Math.sin(c.sp * 9 + age * 3) * 30 * s + (c.sp - 0.5) * 120 * s * age, fy = c.cy + 900 * age * age * Math.min(1.6, s);
                    const a = age * (4 + c.sp * 5) + c.sp * 6, r = 15 * s * (1 - age * 0.25), ca = Math.cos(a), sa = Math.sin(a);
                    CH.push(inkLoop([[-1, -0.5], [1, -0.7], [0.8, 0.6], [-0.9, 0.4]].map(q => [fx + (q[0] * ca - q[1] * sa * 0.5) * r, fy + (q[0] * sa + q[1] * ca * 0.5) * r]), { seed: sd + 900 + i, t, amp: 0.4 }));
                  }
                } else if (tf != null && lt > tf - 0.45) CU.push(inkPath([[c.cx - 10 * s, c.cy + 6 * s], [c.cx, c.cy - 6 * s], [c.cx + 11 * s, c.cy + 4 * s]], { w: 3.5, seed: sd + 700 + i, t, amp: 0.4 }));
              }
              if (on) D.push(c.d);
            });
            pa.p.setAttribute('d', D.join(' '));
            pa.chips.setAttribute('d', CH.join(' '));
          });
        }
        curls.setAttribute('d', CU.join(' '));
        const painted = usePaint && (st.reveal == null || st.reveal > 0.6) && !st.flipAt;
        hair.setAttribute('d', Lp(G.hair, 30) + ' ' + Lp(G.knot, 31));
        hair.setAttribute('fill', usePaint && (st.reveal == null || st.reveal > 0.15) ? INK.ink : CLAY_D());
        // armour plates: rows of little lamellae, rivets at the corners
        const PL = [], RV = [];
        for (let r = 0; r < 6; r++) {
          const yy = -574 + r * 36;
          PL.push(P([[-98 + r * 0.6, yy + 30], [98 - r * 0.6, yy + 30]], 40 + r, { w: lw * 0.6 }));
          for (let c = -2; c <= 2; c++) {
            const xx = c * 38 + (r % 2 ? 19 : 0);
            if (Math.abs(xx) > 92) continue;
            PL.push(P([[xx, yy + 2], [xx, yy + 28]], 50 + r * 10 + c, { w: lw * 0.45 }));
            RV.push(inkCircle(...T([xx + 10, yy + 14]), 4.5 * s, sd + 120 + r * 10 + c, t, { fill: true }));
          }
        }
        plates.setAttribute('d', PL.join(' '));
        rivets.setAttribute('d', RV.join(' '));
        rivets.setAttribute('fill', painted || st.flipAt ? INK.red : CLAY_D());
        const LN = [];
        ['base', 'legs', 'skirt', 'sleeveL', 'sleeveR', 'armor', 'neck', 'scarf'].forEach((k, i) => LN.push(P(G[k], 200 + i, { closed: true })));
        LN.push(P(G.head, 210, { closed: true }), P(G.hair, 211, { closed: true, w: lw * 0.7 }), P(G.knot, 212, { closed: true, w: lw * 0.7 }));
        LN.push(P([[0, -40], [0, -200]], 213, { w: lw * 0.7 }), P([[-60, -150], [60, -150]], 214, { w: lw * 0.5 }), P([[-120, -12], [120, -12]], 215, { w: lw * 0.5 }));
        LN.push(P([[-100, -300], [100, -300]], 216, { w: lw * 0.5 }));
        LN.push(inkCircle(...T(G.handL), 24 * s, sd + 217, t, { w: lw * 0.8 }), inkCircle(...T(G.handR), 24 * s, sd + 218, t, { w: lw * 0.8 }));
        LN.push(P([[-60, -720], [-20, -728], [20, -728], [60, -720]], 219, { w: lw * 0.6 }));   // headband
        lines.setAttribute('d', LN.join(' '));
        // calm face: almond eyes, brows, nose, moustache with turned-up ends, a small tuft under the lip
        const F = [
          P([[-38, -702], [-24, -710], [-10, -702], [-24, -697]], 300, { w: lw * 0.8, closed: true }), P([[10, -702], [24, -710], [38, -702], [24, -697]], 301, { w: lw * 0.8, closed: true }),
          inkDot(...T([-24, -703]), 5 * s, 5 * s, sd + 308, t), inkDot(...T([24, -703]), 5 * s, 5 * s, sd + 309, t),
          P([[-44, -722], [-12, -728]], 302, { w: lw * 0.9 }), P([[12, -728], [44, -722]], 303, { w: lw * 0.9 }),
          P([[0, -700], [-5, -672], [7, -668]], 304, { w: lw * 0.7 }),
          P([[-36, -648], [-26, -660], [-8, -656], [0, -652], [8, -656], [26, -660], [36, -648]], 305, { w: lw * 1.0 }),
          P([[-14, -638], [14, -638]], 306, { w: lw * 0.7 }), inkDot(...T([0, -624]), 8 * s, 7 * s, sd + 307, t),
        ];
        face.setAttribute('d', F.join(' '));
      },
      T, slot,
    };
  }

  // simplified warrior for crowds, drawn into shared per-row elements: {under, clay, dark, lines}
  function liteRow(parent) {
    return { under: inkEl(parent), clay: inkEl(parent, CLAY()), dark: inkEl(parent, CLAY_D()), lines: inkEl(parent), A: { under: [], clay: [], dark: [], lines: [] } };
  }
  function lite(R, sd, t, x, y, s, rot = 0, o = {}) {
    const c = Math.cos(rot), sn = Math.sin(rot), T = p => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s], TT = q => q.map(T);
    const w = Math.max(2.2, 3 + 3.4 * s), amp = Math.min(1, 0.5 + s);
    const Lp = (q, k) => inkLoop(TT(q), { seed: sd + k, t, amp });
    const P = (q, k, ex = {}) => inkPath(TT(q), Object.assign({ w, seed: sd + k, t, amp }, ex));
    const half = o.half;   // only the upper body (crowds cut by a wall or the frame)
    R.A.under.push(inkPath(TT([[-136, -560], [-152, -470], G.handL]), { w: 62 * s, seed: sd + 1, t, taper: 0, amp }) + ' ' + inkPath(TT([[136, -560], [152, -470], [130, -372]]), { w: 62 * s, seed: sd + 2, t, taper: 0, amp }));
    R.A.clay.push(...(half ? [] : [Lp(G.base, 3), Lp(G.legs, 4)]), Lp(G.skirt, 5), Lp(G.head, 6), Lp(G.neck, 7));
    R.A.clay.push(inkPath(TT([[-136, -560], [-152, -470], G.handL]), { w: 46 * s, seed: sd + 8, t, taper: 0, amp }) + ' ' + inkPath(TT([[136, -560], [152, -470], [130, -372]]), { w: 46 * s, seed: sd + 9, t, taper: 0, amp }));
    R.A.dark.push(Lp(G.armor, 10), Lp(G.hair, 11), Lp(G.knot, 12));
    R.A.lines.push(...(half ? [] : [P(G.base, 13, { closed: true })]), P(G.skirt, 14, { closed: true }), P(G.armor, 15, { closed: true }), P(G.head, 16, { closed: true }));
    if (s > 0.45) {
      R.A.lines.push(P([[-94, -520], [94, -520]], 17, { w: w * 0.5 }), P([[-94, -450], [94, -450]], 18, { w: w * 0.5 }));
      R.A.lines.push(P([[-36, -706], [-12, -704]], 19, { w: w * 0.8 }), P([[12, -704], [36, -706]], 20, { w: w * 0.8 }), P([[-30, -652], [0, -658], [30, -652]], 21, { w: w * 0.7 }));
    }
    if (o.head) return { head: T([0, -694]), top: T([0, -800]) };
    return null;
  }
  const flushRow = R => { Object.keys(R.A).forEach(k => { R[k].setAttribute('d', R.A[k].join(' ')); R.A[k] = []; }); };

  // ------------------------------------------------------------------ fingerprint (whorl), absolute coords
  function fprint(parent, sd, col) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0 }), rid = inkEl(parent, col || mix(CLAY_D(), INK.ink, 0.55));
    return {
      update(t, x, y, r, k = 1, gl = 0, rot = 0, rw = 1) {
        glow.setAttribute('fill-opacity', f1(0.4 + clamp01(gl) * 0.6));
        glow.setAttribute('d', gl > 0.02 ? inkCircle(x, y, r * 1.18, sd + 1, t, { w: Math.max(4, r * 0.09) * rw, ry: r * 1.32, n: 18 }) : '');
        const N = 9, shown = k * N, D = [], c = Math.cos(rot), sn = Math.sin(rot), R = (px, py) => [x + px * c - py * sn, y + px * sn + py * c];
        for (let i = 0; i < N; i++) {
          if (i >= shown) break;
          const f = clamp01(shown - i), ri = r * (i + 1) / (N + 0.5), pts = [];
          if (i < 6) {   // whorl rings with a gap
            const a0 = -Math.PI / 2 + hn(sd + i, 1) * 2.4, a1 = a0 + TAU * 0.86 * f, n = 8 + i * 3;
            for (let j = 0; j <= n; j++) { const a = lerp(a0, a1, j / n); pts.push(R(Math.cos(a) * ri * 0.8 + i * 0.8, Math.sin(a) * ri * 1.05)); }
          } else {        // outer loops: arches open at the bottom
            const n = 16;
            for (let j = 0; j <= n * f; j++) { const a = lerp(Math.PI * 0.95, Math.PI * 2.05, j / n); pts.push(R(Math.cos(a) * ri * 0.82, Math.sin(a) * ri * 1.08 + (Math.sin(a) > 0 ? Math.sin(a) * ri * 0.4 : 0))); }
          }
          if (pts.length > 1) D.push(inkPath(pts, { w: Math.max(2.5, r * 0.07), seed: sd + 10 + i, t, amp: 0.6, taper: 0.5 }));
        }
        rid.setAttribute('d', D.join(' '));
      },
    };
  }

  // dust motes drifting in a light shaft
  function dust(parent, sd, n) {
    const e = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.8 }), r0 = rng(sd), Q = Array.from({ length: n }, () => ({ x: r0(), y: r0(), r: lerp(3, 8, r0()), sp: lerp(0.01, 0.03, r0()), ph: r0() * 6 }));
    return { update(t, W, H, y0 = 0, y1 = 1) { e.setAttribute('d', Q.map((q, i) => { const yy = lerp(y0, y1, (q.y + t * q.sp) % 1) * H, xx = (q.x + Math.sin(t * 0.5 + q.ph) * 0.02) * W; return inkCircle(xx, yy, q.r * W / 1080, sd + 10 + i, t, { fill: true, n: 6 }); }).join(' ')); } };
  }

  // soft drifting clouds (opaque paper-blue puffs with an ink-soft rim)
  function clouds(parent, sd, list) {
    const f = inkEl(parent, mix(INK.paperLight, INK.blue, 0.1)), l = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.35));
    return {
      update(t, W, H) {
        const F = [], Lq = [], u = W / 1080;
        list.forEach((c, i) => {
          const x = c[0] * W + Math.sin(t * 0.15 + i) * 30 * u + t * 12 * u, y = c[1] * H, k = c[2] * u, pts = [];
          for (let j = 0; j <= 12; j++) { const a = Math.PI + j / 12 * Math.PI, bump = 1 + 0.22 * Math.sin(j * 2.3 + i); pts.push([x + Math.cos(a) * 170 * k * bump, y + Math.sin(a) * 70 * k * bump]); }
          pts.push([x + 175 * k, y + 22 * k], [x - 175 * k, y + 22 * k]);
          F.push(inkLoop(pts, { seed: sd + i * 3, t, amp: 1 })); Lq.push(inkPath(pts, { w: 4, seed: sd + i * 3 + 1, t, closed: true, amp: 1 }));
        });
        f.setAttribute('d', F.join(' ')); l.setAttribute('d', Lq.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.tc_head
  SH.tc_head = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000 + 131, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'hook';
      const s = (P.s ?? 2.4) * u, hx = (P.x ?? 0.6) * W, hy = (P.y ?? 0.34) * H, fy = hy + 694 * s;
      const CR = Object.assign({ y0: 0.4, y1: 0.56, rows: 3 }, P.crowd || {});
      const rows = Array.from({ length: CR.rows }, () => liteRow(el(root, 'g')));
      const ds = dust(el(root, 'g'), sd + 3, 70);
      const wr = warrior(root, defs, sd + 50, hx, fy, s, { paint: (P.traces ?? 0) > 0 });
      const PR = P.print || [36, -676], PRr = P.printR ?? 27;
            const fp = fprint(el(wr.slot, 'g'), sd + 80), ripples = inkEl(root, INK.gold), glints = inkEl(root, INK.gold);
      // magnifying glass (lens mode)
      const LG = el(root, 'g'), lHandle = inkEl(LG, mix(INK.stain, INK.ink, 0.3)), lGlass = inkEl(LG, INK.paperLight, { 'fill-opacity': 0.35 }), lClay = inkEl(LG, CLAY_L());
      const fpBig = fprint(LG, sd + 81, mix(CLAY_D(), INK.ink, 0.35)), lRing = inkEl(LG), lShine = inkEl(LG, INK.paperLight);
      const KG = el(root, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(root, P.labels, W, H);
      const trace = P.traces ?? 0;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null));
          rows.forEach((R, r) => {
            const f = CR.rows > 1 ? r / (CR.rows - 1) : 0, yy = lerp(CR.y0, CR.y1, f) * H, sc = lerp(0.26, 0.44, f) * u, n = Math.round(lerp(9, 6, f));
            for (let i = 0; i < n; i++) { const xx = (i + 0.5 + (r % 2) * 0.4) / n * W * 1.06 - W * 0.03; lite(R, sd + 200 + r * 40 + i, t, xx, yy, sc, 0, { half: false }); }
            flushRow(R);
          });
          ds.update(t * 3, W, H, 0.05, 0.95);
          wr.update(t, trace > 0 ? { lt: 99, flipAt: c => (c.thr < trace ? 0 : null) } : {});
          const pp = wr.T(PR), k = mode === 'hook' ? progIO(lt, 0.05, 1.6) : 1, gl = mode === 'hook' ? 0.5 + 0.3 * Math.sin(t * 4) + 0.4 * hit : 0.25 + 0.15 * Math.sin(t * 3);
          fp.update(t, pp[0], pp[1], PRr * s * (1 + 0.08 * hit), k, gl, 0.2);
          ripples.setAttribute('d', '');
          const GL = []; if (mode === 'hook') for (let i = 0; i < 4; i++) { const a = t * 1.6 + i * TAU / 4, rr = PRr * s * 1.55, gx = pp[0] + Math.cos(a) * rr, gy = pp[1] + Math.sin(a) * rr * 1.15, q = 12 * u * (0.6 + 0.4 * Math.sin(t * 5 + i)); GL.push(inkPath([[gx - q, gy], [gx + q, gy]], { w: 5, seed: sd + 86 + i, t }) + ' ' + inkPath([[gx, gy - q], [gx, gy + q]], { w: 5, seed: sd + 87 + i, t })); }
          glints.setAttribute('d', GL.join(' '));
          if (mode === 'lens') {
            const la = atOr(cues, 'lens', 0.15), m = spring(lt, la, 0.9), R = 150 * u;
            const cx = lerp(W + 260 * u, pp[0] - 20 * u, m), cy = lerp(pp[1] + 420 * u, pp[1] + 10 * u, m) + Math.sin(t * 1.3) * 10 * u;
            lHandle.setAttribute('d', inkPath([[cx + R * 0.7, cy + R * 0.7], [cx + R * 2.4, cy + R * 2.9]], { w: 46 * u, seed: sd + 90, t, taper: 0 }));
            lClay.setAttribute('d', inkCircle(cx, cy, R * 0.96, sd + 91, t, { fill: true }));
            fpBig.update(t, cx, cy, R * 0.78, 1, 0.2 + 0.15 * Math.sin(t * 3), 0.2);
            lGlass.setAttribute('d', inkCircle(cx, cy, R * 0.96, sd + 92, t, { fill: true }));
            lRing.setAttribute('d', inkCircle(cx, cy, R, sd + 93, t, { w: 22 * u }) + ' ' + inkPath([[cx + R * 0.7, cy + R * 0.7], [cx + R * 2.4, cy + R * 2.9]], { w: 6, seed: sd + 94, t }));
            lShine.setAttribute('d', inkPath(ellP(cx, cy, R * 0.72, R * 0.72, 8, -2.6, -1.7), { w: 10 * u, seed: sd + 95, t }));
          } else [lHandle, lGlass, lClay, lRing, lShine].forEach(e => e.setAttribute('d', '')), fpBig.update(t, 0, 0, 0, 0, 0);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tc_emperor
  SH.tc_emperor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 241, root = el(svg, 'g'), u = W / 1080;
      const ps = (P.s ?? 1.75) * u, ex = (P.x ?? 0.42) * W, seat = (P.seat ?? 0.56) * H, floor = seat + 196 * ps;
      const screen = inkEl(root, mix(INK.paperDark, INK.stain, 0.25)), screenB = inkEl(root, INK.red), screenL = inkEl(root), sunD = inkEl(root, INK.gold), sunL = inkEl(root);
      const throne = inkEl(root, mix(INK.red, INK.ink, 0.35)), throneL = inkEl(root);
      const emp = window.LH.person(el(root, 'g'), sd + 11, { kind: 'sweater', col: mix(INK.ink, INK.inkSoft, 0.3), hair: 'dark', glasses: false });
      const robe = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), robeT = inkEl(root, INK.red), robeL = inkEl(root);
      const crown = inkEl(root, INK.ink), beads = inkEl(root, INK.gold), beadL = inkEl(root, INK.ink);
      const steps = inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), stepsD = inkEl(root, mix(INK.stain, INK.ink, 0.15)), stepL = inkEl(root), carpet = inkEl(root, mix(INK.red, INK.paperDark, 0.15));
      const ding = inkEl(root, mix(INK.green, INK.stain, 0.45)), dingL = inkEl(root), smoke = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.55 });
      const minis = liteRow(el(root, 'g'));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null)), so = atOr(cues, 'soldiers', dur * 0.6), pt = atOr(cues, 'order', dur * 0.3);
          // carved screen behind the throne with a gold sun disc
          const SC = sq(0.08 * W, 0.1 * H, 0.92 * W, floor - 40 * u);
          screen.setAttribute('d', inkLoop(SC, { seed: sd + 1, t, smooth: false, amp: 1 }));
          screenB.setAttribute('d', inkPath(SC, { w: 34 * u, seed: sd + 2, t, closed: true, smooth: false }));
          const sx = 0.78 * W, sy = 0.24 * H, sr = 110 * u;
          sunD.setAttribute('d', inkCircle(sx, sy, sr, sd + 3, t, { fill: true }));
          const SP = []; for (let i = 0; i < 4; i++) SP.push(inkPath(ellP(sx, sy, sr * (0.25 + i * 0.18), sr * (0.25 + i * 0.18), 10, t * 0.3 + i, t * 0.3 + i + 4.5), { w: 4, seed: sd + 4 + i, t }));
          sunL.setAttribute('d', inkCircle(sx, sy, sr, sd + 9, t, { w: 6 }) + ' ' + SP.join(' ') + ' ' + inkPath(SC.map(p => [lerp(p[0], W / 2, 0.06), lerp(p[1], (SC[0][1] + SC[2][1]) / 2, 0.06)]), { w: 4, seed: sd + 10, t, closed: true, smooth: false }));
          // throne: tall back + seat block
          const TB = [[ex - 230 * u, seat + 10 * u], [ex + 150 * u, seat + 10 * u], [ex + 150 * u, seat - 520 * u], [ex + 40 * u, seat - 560 * u], [ex - 120 * u, seat - 560 * u], [ex - 230 * u, seat - 520 * u]];
          const TS = sq(ex - 250 * u, seat - 10 * u, ex + 220 * u, floor);
          throne.setAttribute('d', inkLoop(TB, { seed: sd + 11, t, smooth: false }) + ' ' + inkLoop(TS, { seed: sd + 12, t, smooth: false }));
          throneL.setAttribute('d', inkPath(TB, { w: 6, seed: sd + 13, t, closed: true, smooth: false }) + ' ' + inkPath(TS, { w: 6, seed: sd + 14, t, closed: true, smooth: false }) + ' ' + inkPath([[ex - 200 * u, seat - 480 * u], [ex + 120 * u, seat - 480 * u]], { w: 4, seed: sd + 15, t }));
          // the emperor, seated, facing right; points forward from cue "order"
          const pa = progIO(lt, pt, 0.5);
          const o = emp.update(t, ex, floor, ps, { face: 1, seat, lean: 4, brow: -0.4, look: [6, 0], mouth: 0,
            armR: [lerp(ex + 150 * ps, ex + 330 * ps, pa), lerp(seat - 40 * ps, seat - 250 * ps, pa) + Math.sin(t * 1.5) * 4], armL: [ex + 70 * ps, seat - 10 * ps] });
          // long robe over the lap and legs, red trim
          const RB = [[ex - 60 * ps, seat - 60 * ps], [ex + 120 * ps, seat - 40 * ps], [ex + 150 * ps, floor - 4 * u], [ex - 70 * ps, floor - 4 * u]];
          robe.setAttribute('d', inkLoop(RB, { seed: sd + 20, t, amp: 1 }));
          robeT.setAttribute('d', inkPath([[ex - 70 * ps, floor - 18 * ps], [ex + 150 * ps, floor - 18 * ps]], { w: 20 * ps, seed: sd + 21, t, taper: 0 }) + ' ' + inkPath([[o.sh[0] - 10 * ps, o.sh[1] + 10 * ps], [ex + 60 * ps, seat - 50 * ps]], { w: 14 * ps, seed: sd + 22, t, taper: 0 }));
          robeL.setAttribute('d', inkPath(RB, { w: 5, seed: sd + 23, t, closed: true }));
          // mianguan: a flat board on a cap, strings of beads hanging at the front and back
          const hc = o.hc, cb = [[hc[0] - 92 * ps, hc[1] - 66 * ps], [hc[0] + 98 * ps, hc[1] - 76 * ps], [hc[0] + 98 * ps, hc[1] - 62 * ps], [hc[0] - 92 * ps, hc[1] - 52 * ps]];
          const cap = [[hc[0] - 40 * ps, hc[1] - 30 * ps], [hc[0] - 34 * ps, hc[1] - 64 * ps], [hc[0] + 34 * ps, hc[1] - 68 * ps], [hc[0] + 42 * ps, hc[1] - 34 * ps]];
          crown.setAttribute('d', inkLoop(cb, { seed: sd + 30, t, smooth: false }) + ' ' + inkLoop(cap, { seed: sd + 31, t, smooth: false }));
          const BD = [], BL = [];
          [[hc[0] + 96 * ps, hc[1] - 70 * ps], [hc[0] + 80 * ps, hc[1] - 68 * ps], [hc[0] + 64 * ps, hc[1] - 67 * ps], [hc[0] - 90 * ps, hc[1] - 58 * ps], [hc[0] - 74 * ps, hc[1] - 60 * ps]].forEach((a, i) => {
            const sw = Math.sin(t * 2 + i) * 4 * ps, L = 70 * ps;
            BL.push(inkPath([a, [a[0] + sw, a[1] + L]], { w: 2.5, seed: sd + 40 + i, t, amp: 0.4 }));
            for (let j = 1; j <= 5; j++) BD.push(inkCircle(a[0] + sw * j / 5, a[1] + L * j / 5, 4.5 * ps, sd + 50 + i * 6 + j, t, { fill: true, n: 6 }));
          });
          beads.setAttribute('d', BD.join(' ')); beadL.setAttribute('d', BL.join(' '));
          // dais steps in the foreground with a red runner
          const ST = [], SD = [], SL = [];
          for (let i = 0; i < 4; i++) {
            const y0 = floor + i * 150 * u, y1 = y0 + 150 * u, x0 = lerp(0.06, -0.06, i / 3) * W, x1 = W - x0;
            ST.push(inkLoop(sq(x0, y0, x1, y0 + 40 * u), { seed: sd + 60 + i, t, smooth: false })); SD.push(inkLoop(sq(x0, y0 + 40 * u, x1, y1), { seed: sd + 64 + i, t, smooth: false }));
            SL.push(inkPath(sq(x0, y0, x1, y1), { w: 5, seed: sd + 68 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[x0, y0 + 40 * u], [x1, y0 + 40 * u]], { w: 3, seed: sd + 72 + i, t }));
          }
          steps.setAttribute('d', ST.join(' ')); stepsD.setAttribute('d', SD.join(' ')); stepL.setAttribute('d', SL.join(' '));
          carpet.setAttribute('d', inkLoop([[0.42 * W, floor], [0.62 * W, floor], [0.7 * W, H + 20], [0.34 * W, H + 20]], { seed: sd + 76, t, smooth: false }));
          // two bronze ding vessels with incense smoke
          const DG = [], DL = [], SM = [];
          [0.12, 0.88].forEach((fx, i) => {
            const cx = fx * W, by = floor + 420 * u, r = 95 * u;
            const bowl = [[cx - r, by - 150 * u], [cx + r, by - 150 * u], [cx + r * 0.8, by - 40 * u], [cx - r * 0.8, by - 40 * u]];
            DG.push(inkLoop(bowl, { seed: sd + 80 + i, t }));
            DL.push(inkPath(bowl, { w: 6, seed: sd + 82 + i, t, closed: true }), inkPath([[cx - r * 0.6, by - 40 * u], [cx - r * 0.7, by + 40 * u]], { w: 14 * u, seed: sd + 84 + i, t }), inkPath([[cx + r * 0.6, by - 40 * u], [cx + r * 0.7, by + 40 * u]], { w: 14 * u, seed: sd + 86 + i, t }), inkPath([[cx, by - 40 * u], [cx, by + 40 * u]], { w: 14 * u, seed: sd + 88 + i, t }));
            DL.push(inkPath(ellP(cx - r * 0.75, by - 168 * u, 22 * u, 26 * u, 8, Math.PI, TAU), { w: 7, seed: sd + 90 + i, t }), inkPath(ellP(cx + r * 0.75, by - 168 * u, 22 * u, 26 * u, 8, Math.PI, TAU), { w: 7, seed: sd + 92 + i, t }));
            for (let k = 0; k < 3; k++) { const ph = (t * 0.25 + k / 3 + i * 0.17) % 1; SM.push(inkPath(Array.from({ length: 8 }, (_, j) => [cx + Math.sin(j * 0.9 + t * 1.4 + k * 2) * (14 + j * 5) * u, by - 170 * u - ph * 260 * u - j * 36 * u]), { w: 22 * u * (1 - ph) + 4, seed: sd + 100 + i * 5 + k, t, taper: 0.9 })); }
          });
          ding.setAttribute('d', DG.join(' ')); dingL.setAttribute('d', DL.join(' ')); smoke.setAttribute('d', SM.join(' '));
          // the order: little clay soldiers spring up along the steps, one after another
          for (let i = 0; i < 7; i++) {
            const a = spring(lt, so + i * 0.09, 0.55); if (lt < so + i * 0.09) continue;
            const xx = lerp(0.26, 0.74, i / 6) * W, yy = floor + (i % 2 ? 330 : 470) * u;
            lite(minis, sd + 300 + i * 30, t, xx, yy, 0.36 * u * a * (1 + 0.06 * hit), 0);
          }
          flushRow(minis);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tc_army
  SH.tc_army = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 353, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'pit';
      const VP = [(P.vp ?? [0.5, mode === 'pit' ? 0.33 : 0.45])[0] * W, (P.vp ?? [0.5, mode === 'pit' ? 0.33 : 0.45])[1] * H];
      const NR = P.rows ?? 6, NC = P.cols ?? 5, yNear = (P.near ?? 1.04) * H, yFar = (P.far ?? (mode === 'pit' ? 0.42 : 0.54)) * H;
      const hangar = mode === 'pit' ? [inkEl(root, mix(INK.paperLight, INK.stain, 0.3)), inkEl(root, EARTH()), inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.15)), inkEl(root)] : null;
      const cl = mode === 'mound' ? clouds(el(root, 'g'), sd + 600, P.clouds || [[0.5, 0.15, 1.1], [0.12, 0.24, 0.7], [0.86, 0.1, 0.8]]) : null;
      const mound = mode === 'mound' ? [inkEl(root, EARTH()), inkEl(root, EARTH_D()), inkEl(root, mix(INK.green, INK.ink, 0.25)), inkEl(root)] : null;
      const birds = mode === 'mound' ? inkEl(root, INK.ink) : null;
      const walls = mode === 'pit' ? [inkEl(root, EARTH()), inkEl(root, EARTH_D()), inkEl(root)] : null;
      const rows = Array.from({ length: NR }, () => liteRow(el(root, 'g')));
      const wallTops = mode === 'pit' ? [inkEl(root, EARTH()), inkEl(root)] : null;
      const walk = mode === 'pit' ? [inkEl(root, mix(EARTH(), INK.paperLight, 0.2)), inkEl(root, EARTH_D()), inkEl(root)] : null;
      const ds = dust(el(root, 'g'), sd + 5, 34), beams = mode === 'pit' ? inkEl(root, INK.paperLight, { 'fill-opacity': 0.22 }) : null;
      const KG = el(root, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(root, P.labels, W, H);
      const depth = f => Math.pow(f, 1.7);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null)), rise = atOr(cues, 'rise', 0);
          if (mound) {
            // a stepped earth pyramid (three tiers, sunlit fronts, shaded sides) with trees on top
            cl.update(t, W, H);
            const mx = VP[0], my = yFar - 10 * u, mw = 520 * u, th = 100 * u, FR = [], SD = [], LN = [];
            for (let k = 0; k < 3; k++) {
              const w0 = mw * (1 - k * 0.27), w1 = mw * (1 - (k + 1) * 0.27) + 40 * u, y0 = my - k * th, y1 = y0 - th;
              const front = [[mx - w0 * 0.82, y0], [mx + w0 * 0.82, y0], [mx + w1 * 0.82, y1], [mx - w1 * 0.82, y1]];
              FR.push(inkLoop(front, { seed: sd + 1 + k, t, smooth: false }));
              SD.push(inkLoop([[mx - w0, y0], [mx - w0 * 0.82, y0], [mx - w1 * 0.82, y1], [mx - w1, y1 + 14 * u]], { seed: sd + 4 + k, t, smooth: false }), inkLoop([[mx + w0, y0], [mx + w0 * 0.82, y0], [mx + w1 * 0.82, y1], [mx + w1, y1 + 14 * u]], { seed: sd + 7 + k, t, smooth: false }));
              LN.push(inkPath([[mx - w0, y0], [mx - w1, y1 + 14 * u], [mx + w1, y1 + 14 * u], [mx + w0, y0]], { w: 6, seed: sd + 10 + k, t, smooth: false }), inkPath([[mx - w0 * 0.82, y0], [mx - w1 * 0.82, y1]], { w: 3, seed: sd + 13 + k, t }), inkPath([[mx + w0 * 0.82, y0], [mx + w1 * 0.82, y1]], { w: 3, seed: sd + 16 + k, t }));
            }
            mound[0].setAttribute('d', FR.join(' ')); mound[1].setAttribute('d', SD.join(' '));
            const topY = my - 3 * th, topW = (mw * (1 - 3 * 0.27) + 40 * u), TR = [];
            for (let i = 0; i < 7; i++) { const xx = mx + (i / 6 - 0.5) * topW * 1.6, sw = Math.sin(t * 1.2 + i) * 3 * u; TR.push(inkPath([[xx, topY + 6 * u], [xx + sw, topY - 30 * u]], { w: 8 * u, seed: sd + 20 + i, t }), inkCircle(xx + sw, topY - 52 * u, (26 + (i % 3) * 6) * u, sd + 40 + i, t, { fill: true })); }
            mound[2].setAttribute('d', TR.join(' '));
            mound[3].setAttribute('d', LN.join(' '));
            const BB = []; for (let i = 0; i < 4; i++) { const ph = (t * 0.06 + i * 0.23) % 1, bx = lerp(-0.1, 1.1, ph) * W, by = (0.16 + i * 0.03) * H + Math.sin(t + i) * 10 * u, fl = Math.sin(t * 9 + i) * 12 * u; BB.push(inkPath([[bx - 26 * u, by - fl], [bx, by], [bx + 26 * u, by - fl]], { w: 4.5, seed: sd + 30 + i, t })); }
            birds.setAttribute('d', BB.join(' '));
          }
          const rowY = f => lerp(yFar, yNear, depth(f)), rowS = f => lerp(0.12, 0.9, depth(f)) * u;
          if (hangar) {   // Pit 1's hangar: an arched roof of trusses running back to the vanishing point, earth below
            hangar[0].setAttribute('d', inkLoop(sq(-20, -20, W + 20, yFar + 10 * u), { seed: sd + 700, t, smooth: false, amp: 0.5 }));
            hangar[1].setAttribute('d', inkLoop(sq(-20, yFar - 30 * u, W + 20, H + 20), { seed: sd + 701, t, smooth: false, amp: 0.5 }));
            const AR = [], RL = [], tops = [];
            for (let k = 0; k < 7; k++) {
              const f = Math.pow(k / 6, 0.8), hw = lerp(W * 0.95, W * 0.16, f), yb = lerp(yFar + 120 * u, yFar - 20 * u, f), cy = yb, ry = lerp(0.62 * H, 0.1 * H, f);
              const pts = []; for (let j = 0; j <= 16; j++) { const a = Math.PI + j / 16 * Math.PI; pts.push([VP[0] + Math.cos(a) * hw, cy + Math.sin(a) * ry]); }
              AR.push(inkPath(pts, { w: lerp(16, 4, f) * u, seed: sd + 710 + k, t, amp: 1 }));
              tops.push(pts);
            }
            for (let j = 2; j <= 14; j += 3) RL.push(inkPath(tops.map(p => p[j]), { w: 4 * u, seed: sd + 730 + j, t }));
            hangar[2].setAttribute('d', AR.join(' ')); hangar[3].setAttribute('d', RL.join(' ') + ' ' + inkPath([[-20, yFar - 30 * u], [W + 20, yFar - 30 * u]], { w: 5, seed: sd + 740, t }));
          }
          const spacing = 330;
          if (walls) {   // earthen partition walls between the corridors, running back to the vanishing point
            const WF = [], WD = [], WL = [], TT = [], TL = [];
            for (let c = -NC; c <= NC; c++) {
              if (c % 2 === 0) continue;
              const xo = c * 0.5 * spacing, near = [VP[0] + xo * rowS(1.08), rowY(1.08)], far = [VP[0] + xo * rowS(0), rowY(0)];
              const hN = 560 * rowS(1.08), hF = 560 * rowS(0), wN = 40 * rowS(1.08), wF = 40 * rowS(0);
              const top = [[far[0] - wF, far[1] - hF], [far[0] + wF, far[1] - hF], [near[0] + wN, near[1] - hN], [near[0] - wN, near[1] - hN]];
              const side = [[far[0] + (c < 0 ? wF : -wF), far[1] - hF], [far[0] + (c < 0 ? wF : -wF), far[1]], [near[0] + (c < 0 ? wN : -wN), near[1]], [near[0] + (c < 0 ? wN : -wN), near[1] - hN]];
              WD.push(inkLoop(side, { seed: sd + 100 + c, t, smooth: false }));
              WL.push(inkPath(side, { w: 5, seed: sd + 120 + c, t, closed: true, smooth: false }));
              for (let k = 1; k < 5; k++) WL.push(inkPath([L2(side[0], side[1], k / 5), L2(side[3], side[2], k / 5)], { w: 2.5, seed: sd + 140 + c * 6 + k, t, amp: 1 }));
              TT.push(inkLoop(top, { seed: sd + 160 + c, t, smooth: false })); TL.push(inkPath(top, { w: 5, seed: sd + 180 + c, t, closed: true, smooth: false }));
            }
            walls[0].setAttribute('d', ''); walls[1].setAttribute('d', WD.join(' ')); walls[2].setAttribute('d', WL.join(' '));
            wallTops[0].setAttribute('d', TT.join(' ')); wallTops[1].setAttribute('d', TL.join(' '));
          }
          rows.forEach((R, r) => {
            const f = NR > 1 ? r / (NR - 1) : 0, yy = rowY(f), sc = rowS(f);
            const order = NR - 1 - r, ra = mode === 'mound' ? spring(lt, rise + order * 0.16, 0.6) : 1;
            if (ra <= 0.001 && mode === 'mound') { flushRow(R); return; }
            const n = mode === 'pit' ? NC : NC + 2;
            for (let i = 0; i < n; i++) {
              const c = (i - (n - 1) / 2) * (mode === 'pit' ? 1 : 0.62), xx = VP[0] + c * spacing * sc * (mode === 'pit' ? 1 : 1.6);
              if (xx < -200 * sc || xx > W + 200 * sc) continue;
              lite(R, sd + 400 + r * 40 + i, t, xx, yy + (1 - ra) * 700 * sc, sc * (1 + 0.04 * hit), 0);
            }
            flushRow(R);
          });
          if (walk) {   // the earth walkway in front of the first rank
            const top = (P.walk ?? 0.76) * H, WK = [[-20, top + 20 * u], [W + 20, top - 10 * u], [W + 20, H + 20], [-20, H + 20]];
            walk[0].setAttribute('d', inkLoop(WK, { seed: sd + 750, t, smooth: false }));
            const ST = []; for (let i = 0; i < 26; i++) ST.push(inkCircle(hn(i, 4) * W, top + 40 * u + hn(i, 6) * (H - top - 60 * u), lerp(6, 16, hn(i, 8)) * u, sd + 760 + i, t, { fill: true, n: 6 }));
            for (let k = 1; k < 4; k++) ST.push(inkPath([[-20, top + k * 110 * u], [W + 20, top + k * 110 * u - 8 * u]], { w: 6 * u, seed: sd + 790 + k, t }));
            walk[1].setAttribute('d', ST.join(' '));
            walk[2].setAttribute('d', inkPath(WK.slice(0, 2), { w: 7, seed: sd + 795, t }));
          }
          if (beams) { const BM = []; for (let i = 0; i < 3; i++) { const x0 = (0.2 + i * 0.3 + Math.sin(t * 0.2 + i) * 0.02) * W; BM.push(inkLoop([[x0 - 40 * u, 0], [x0 + 40 * u, 0], [x0 + 220 * u, H * 0.75], [x0 + 60 * u, H * 0.75]], { seed: sd + 60 + i, t, smooth: false, amp: 0.5 })); } beams.setAttribute('d', BM.join(' ')); }
          ds.update(t, W, H, 0.1, 0.9);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
  const L2 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];

  // ------------------------------------------------------------------ a spade
  function spade(parent, sd) {
    const sh = inkEl(parent, mix(INK.stain, INK.ink, 0.25)), bl = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.3)), ln = inkEl(parent);
    return {
      update(t, a, b, s) {   // a = top of the handle, b = tip of the blade
        const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(...d) || 1, ux = d[0] / L, uy = d[1] / L, nx = -uy, ny = ux;
        const j = [b[0] - ux * 110 * s, b[1] - uy * 110 * s];
        sh.setAttribute('d', inkPath([a, j], { w: 14 * s, seed: sd + 1, t, taper: 0 }));
        const B = [[j[0] + nx * 40 * s, j[1] + ny * 40 * s], [j[0] - nx * 40 * s, j[1] - ny * 40 * s], [b[0] - nx * 30 * s, b[1] - ny * 30 * s], [b[0] + nx * 30 * s, b[1] + ny * 30 * s]];
        bl.setAttribute('d', inkLoop(B, { seed: sd + 2, t, smooth: false }));
        ln.setAttribute('d', inkPath(B, { w: 5, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath([[a[0] - nx * 26 * s, a[1] - ny * 26 * s], [a[0] + nx * 26 * s, a[1] + ny * 26 * s]], { w: 10 * s, seed: sd + 4, t }));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.tc_well
  SH.tc_well = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 467, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'buried';
      const gy = (P.gy ?? 0.5) * H;
      const cl = clouds(el(root, 'g'), sd + 600, P.clouds || [[0.82, 0.13, 0.9], [0.2, 0.06, 0.65]]);
      const tree = [inkEl(root, mix(INK.stain, INK.ink, 0.3)), inkEl(root, mix(INK.green, INK.paperDark, 0.2)), inkEl(root, INK.red), inkEl(root)];
      const soil = inkEl(root, EARTH()), strata = inkEl(root, EARTH_D()), pebbles = inkEl(root, mix(INK.stain, INK.paperLight, 0.3)), soilL = inkEl(root);
      const shaft = mode === 'dig' ? [inkEl(root, mix(EARTH_D(), INK.ink, 0.25)), inkEl(root)] : null;
      const buried = liteRow(el(root, 'g'));
      const headG = el(root, 'g'), headR = liteRow(headG);
      const tufts = inkEl(root, mix(INK.gold, INK.stain, 0.3));
      const farmers = (mode === 'dig' ? [0, 1, 2] : [0, 1, 2]).map(i => window.LH.person(el(root, 'g'), sd + 20 + i * 3, { kind: 'sweater', col: [mix(INK.blue, INK.paperLight, 0.3), mix(INK.inkSoft, INK.paperLight, 0.2), mix(INK.green, INK.paperLight, 0.35)][i], hair: 'dark', glasses: false }));
      const spades = [0, 1, 2].map(i => spade(el(root, 'g'), sd + 60 + i * 5));
      const clods = inkEl(root, EARTH_D()), star = inkEl(root, INK.gold), starL = inkEl(root, INK.red);
      const yr = el(root, 'text', { 'text-anchor': 'middle', 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 140 * u, 'letter-spacing': 10 * u, fill: INK.ink, stroke: INK.paperLight, 'stroke-width': 14 * u, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      const LB = labels(root, P.labels, W, H);
      const r0 = rng(sd + 3), PB = Array.from({ length: 60 }, () => ({ x: r0(), y: r0(), r: lerp(5, 14, r0()) }));
      const BW = P.buried || [[0.18, 0.86, 0.5, -1.3], [0.42, 0.95, 0.55, 0.1], [0.7, 0.88, 0.5, 1.4], [0.9, 0.99, 0.5, 0.15]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.7), hp = punch(lt, hit, 0.7), yc = atOr(cues, 'y', dur * 0.75);
          cl.update(t, W, H);
          // a persimmon tree on the field
          const tx = 0.86 * W, ty = gy;
          tree[0].setAttribute('d', inkPath([[tx, ty], [tx - 6 * u, ty - 160 * u], [tx - 40 * u, ty - 230 * u]], { w: 26 * u, seed: sd + 1, t, taper: 0.5 }) + ' ' + inkPath([[tx - 4 * u, ty - 150 * u], [tx + 50 * u, ty - 220 * u]], { w: 16 * u, seed: sd + 2, t }));
          const cr = []; for (let i = 0; i < 6; i++) cr.push(inkCircle(tx + (i % 3 - 1) * 70 * u + Math.sin(t * 0.8 + i) * 3, ty - 250 * u - Math.floor(i / 3) * 60 * u, 70 * u, sd + 4 + i, t, { fill: true }));
          tree[1].setAttribute('d', cr.join(' '));
          tree[2].setAttribute('d', [0, 1, 2, 3, 4].map(i => inkCircle(tx + (i - 2) * 50 * u, ty - 230 * u - (i % 2) * 70 * u, 11 * u, sd + 12 + i, t, { fill: true })).join(' '));
          tree[3].setAttribute('d', inkPath(cr.length ? ellP(tx, ty - 280 * u, 170 * u, 110 * u, 14) : [], { w: 5, seed: sd + 18, t, closed: true }));
          // the earth in cross-section below the field line
          const top = []; for (let i = 0; i <= 12; i++) top.push([i / 12 * (W + 40) - 20, gy + Math.sin(i * 1.7) * 6 * u]);
          soil.setAttribute('d', inkLoop(top.concat([[W + 20, H + 20], [-20, H + 20]]), { seed: sd + 20, t, smooth: false }));
          const nl = mode === 'buried' ? Math.round(lerp(2, 9, progIO(lt, 0, Math.max(0.5, yc)))) : 9, SL = [];
          for (let k = 0; k < nl; k++) { const yy = gy + 70 * u + k * ((H - gy) / 9); SL.push(inkPath(Array.from({ length: 10 }, (_, i) => [i / 9 * (W + 40) - 20, yy + Math.sin(i * 1.3 + k) * 14 * u]), { w: 10 * u, seed: sd + 30 + k, t, taper: 0.1 })); }
          strata.setAttribute('d', SL.join(' '));
          pebbles.setAttribute('d', PB.map((q, i) => inkCircle(q.x * W, gy + 40 * u + q.y * (H - gy), q.r * u, sd + 50 + i, t, { fill: true, n: 6 })).join(' '));
          soilL.setAttribute('d', inkPath(top, { w: 7, seed: sd + 21, t }));
          // buried warriors, some toppled
          BW.forEach((b, i) => lite(buried, sd + 200 + i * 40, t, b[0] * W, b[1] * H, b[2] * u, b[3], { half: false }));
          flushRow(buried);
          // field tufts (dry wheat stubble) along the surface
          const TF = []; for (let i = 0; i < 22; i++) { const xx = (i + 0.3 * hn(i, 2)) / 22 * W, sw = Math.sin(t * 1.5 + i) * 6 * u; TF.push(inkPath([[xx, gy + 4 * u], [xx + sw, gy - 46 * u]], { w: 6, seed: sd + 90 + i, t }) + ' ' + inkPath([[xx + 8 * u, gy + 4 * u], [xx + 16 * u + sw, gy - 34 * u]], { w: 5, seed: sd + 120 + i, t })); }
          tufts.setAttribute('d', TF.join(' '));
          const ps = 1.05 * u;
          if (mode === 'buried') {
            const yv = Math.round(lerp(-210, 1974, progIO(lt, 0.05, Math.max(0.4, yc - 0.05))));
            yr.textContent = yv < 0 ? `${-yv} BC` : yv < 1974 ? `AD ${yv}` : '1974';
            yr.setAttribute('x', f1(0.5 * W)); yr.setAttribute('y', f1(0.25 * H)); yr.setAttribute('fill', yv >= 1974 ? INK.red : INK.ink);
            yr.setAttribute('transform', `rotate(${f1(-3 + Math.sin(t) * 0.6)} ${f1(0.5 * W)} ${f1(0.25 * H)})`);
            farmers.forEach((fm, i) => {
              const a = progIO(lt, yc - 0.2 + i * 0.15, 0.9), x = lerp(W + 200 * u, (0.24 + i * 0.2) * W, a), bob = Math.abs(Math.sin(t * 7 + i)) * 8 * u * (a < 1 ? 1 : 0);
              const o = fm.update(t, x, gy - bob, ps, { face: -1, lean: 3, look: [2, 6] });
              spades[i].update(t, [o.sh[0] - 40 * ps, o.sh[1] - 120 * ps], [o.sh[0] - 70 * ps, gy - 10 * u], u);
            });
            [clods, star, starL].forEach(e => e.setAttribute('d', ''));
            headR.under.setAttribute('d', ''); flushRow(headR);
            if (shaft) shaft.forEach(e => e.setAttribute('d', ''));
          } else {
            yr.textContent = '';
            const sx0 = 0.4 * W, sx1 = 0.66 * W, sb = (P.bottom ?? 0.76) * H;
            shaft[0].setAttribute('d', inkLoop(sq(sx0, gy, sx1, sb), { seed: sd + 140, t, smooth: false }));
            shaft[1].setAttribute('d', inkPath([[sx0, gy], [sx0, sb], [sx1, sb], [sx1, gy]], { w: 7, seed: sd + 141, t, smooth: false }));
            // the clay head poking out of the shaft's floor
            const hx = 0.6 * W, hy = sb + 70 * u;
            lite(headR, sd + 500, t, hx, hy + 520 * 0.55 * u, 0.55 * u * (1 + 0.05 * hp), 0.25, { half: true });
            flushRow(headR);
            // digger in the shaft: spade goes up and down until it strikes the head
            const ph = lt < hit ? (lt * 1.5) % 1 : 1, lift = lt < hit ? Math.sin(ph * TAU) * 0.5 + 0.5 : 0;
            const dx = 0.5 * W, o = farmers[0].update(t, dx, sb, ps, { face: 1, lean: 14 + lift * 8, look: [4, 10], brow: lt > hit ? 1 : 0, mouth: lt > hit ? 0.8 : 0,
              armR: [dx + 110 * ps, sb - 260 * ps - lift * 120 * ps], armL: [dx + 60 * ps, sb - 180 * ps - lift * 120 * ps] });
            const tip = [hx - 40 * u, sb - 10 * u - lift * 150 * u];
            spades[0].update(t, [dx + 70 * ps, sb - 330 * ps - lift * 140 * ps], tip, u);
            // two at the rim, looking down
            [[0.22, 1], [0.84, -1]].forEach((q, i) => {
              const oo = farmers[i + 1].update(t, q[0] * W, gy, ps, { face: q[1], lean: 22 + Math.sin(t * 1.2 + i) * 3, look: [4, 14], brow: lt > hit ? 1 : 0, mouth: lt > hit ? 0.7 : 0 });
              spades[i + 1].update(t, [oo.sh[0] - q[1] * 50 * ps, oo.sh[1] - 100 * ps], [oo.sh[0] - q[1] * 90 * ps, gy - 8 * u], u);
            });
            // earth flying out of the shaft while digging
            const CL = []; if (lt < hit + 0.3) for (let i = 0; i < 10; i++) { const f = (lt * 0.9 + i / 10) % 1, cx = lerp(dx, dx + (i % 2 ? 1 : -1) * (200 + i * 20) * u, f), cy = sb - 200 * u - Math.sin(f * Math.PI) * (gy < sb ? (sb - gy + 160 * u) : 400 * u) + f * 200 * u; CL.push(inkCircle(cx, cy, (10 + (i % 3) * 5) * u, sd + 300 + i, t, { fill: true, n: 6 })); }
            clods.setAttribute('d', CL.join(' '));
            const k = lt >= hit ? clamp01(1 - (lt - hit) / 1.2) : 0, ST = [];
            if (k > 0) for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3, r1 = 40 * u + (1 - k) * 60 * u, r2 = r1 + 70 * u * k; ST.push(inkPath([[tip[0] + Math.cos(a) * r1, tip[1] + Math.sin(a) * r1], [tip[0] + Math.cos(a) * r2, tip[1] + Math.sin(a) * r2]], { w: 10 * u * k + 2, seed: sd + 320 + i, t })); }
            star.setAttribute('d', ST.join(' ')); starL.setAttribute('d', '');
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ stopwatch
  function stopwatch(parent, sd) {
    const face = inkEl(parent, INK.paperLight), ring = inkEl(parent), hand = inkEl(parent, INK.red), sweep = inkEl(parent, INK.red, { 'fill-opacity': 0.25 });
    return {
      update(t, x, y, r, a) {   // a in turns
        face.setAttribute('d', inkCircle(x, y, r, sd + 1, t, { fill: true }));
        const Tk = []; for (let i = 0; i < 12; i++) { const b = i / 12 * TAU; Tk.push(inkPath([[x + Math.cos(b) * r * 0.78, y + Math.sin(b) * r * 0.78], [x + Math.cos(b) * r * 0.92, y + Math.sin(b) * r * 0.92]], { w: 4, seed: sd + 10 + i, t })); }
        ring.setAttribute('d', inkCircle(x, y, r, sd + 2, t, { w: 9 }) + ' ' + Tk.join(' ') + ' ' + inkPath([[x, y - r], [x, y - r - 24]], { w: 14, seed: sd + 3, t, taper: 0 }) + ' ' + inkCircle(x, y - r - 34, 14, sd + 4, t, { w: 6 }));
        const b = -Math.PI / 2 + a * TAU;
        hand.setAttribute('d', inkPath([[x, y], [x + Math.cos(b) * r * 0.8, y + Math.sin(b) * r * 0.8]], { w: 7, seed: sd + 5, t }) + ' ' + inkCircle(x, y, 9, sd + 6, t, { fill: true }));
        const n = Math.max(2, Math.round((a % 1) * 24)), SW = [[x, y]]; for (let i = 0; i <= n; i++) { const c = -Math.PI / 2 + (a % 1) * TAU * i / n; SW.push([x + Math.cos(c) * r * 0.74, y + Math.sin(c) * r * 0.74]); }
        sweep.setAttribute('d', a > 0.01 ? inkLoop(SW, { seed: sd + 7, t, amp: 0.4, smooth: false }) : '');
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.tc_paint
  SH.tc_paint = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000 + 571, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'reveal';
      const s = (P.s ?? 1.62) * u, x = (P.x ?? 0.5) * W, fy = (P.y ?? 0.98) * H;
      const wall = [inkEl(root, mix(INK.paperDark, INK.blue, 0.12)), inkEl(root, mix(INK.paperDark, INK.ink, 0.12)), inkEl(root)];
      const plinth = [inkEl(root, mix(INK.stain, INK.paperDark, 0.15)), inkEl(root)];
      const air = mode === 'flake' ? inkEl(root, mix(INK.blue, INK.paperLight, 0.35)) : null;
      const wr = warrior(root, defs, sd + 50, x, fy - 60 * u, s, { paint: true });
      const brush = mode === 'reveal' ? [inkEl(root, mix(INK.stain, INK.ink, 0.25)), inkEl(root, INK.red), inkEl(root)] : null;
      const glint = inkEl(root, INK.paperLight);
      const sw = mode === 'flake' ? stopwatch(el(root, 'g'), sd + 80) : null;
      const KG = el(root, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pc = atOr(cues, 'paint', 0.1), fc = atOr(cues, 'flake', 0.3);
          {   // a museum display wall (panels and a lit frame) behind the figure, down to the floor line
            const wb = (P.wall ?? 0.78) * H, WP = sq(-20, -20, W + 20, wb), PN = [], LN = [];
            wall[0].setAttribute('d', inkLoop(WP, { seed: sd + 3, t, smooth: false, amp: 0.5 }));
            for (let i = 0; i < 5; i++) { const x0 = (i / 5) * W + 18 * u, x1 = ((i + 1) / 5) * W - 18 * u; PN.push(inkLoop(sq(x0, 0.16 * H, x1, wb - 50 * u), { seed: sd + 4 + i, t, smooth: false, amp: 0.6 })); LN.push(inkPath(sq(x0, 0.16 * H, x1, wb - 50 * u), { w: 3, seed: sd + 10 + i, t, closed: true, smooth: false })); }
            wall[1].setAttribute('d', PN.join(' '));
            wall[2].setAttribute('d', LN.join(' ') + ' ' + inkPath([[-20, wb], [W + 20, wb]], { w: 6, seed: sd + 16, t }) + ' ' + inkPath([[-20, 0.14 * H], [W + 20, 0.14 * H]], { w: 5, seed: sd + 17, t }));
          }
          plinth[0].setAttribute('d', inkLoop(sq(x - 260 * u, fy - 70 * u, x + 260 * u, H + 20), { seed: sd + 1, t, smooth: false }));
          plinth[1].setAttribute('d', inkPath(sq(x - 260 * u, fy - 70 * u, x + 260 * u, H + 20), { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
          if (mode === 'reveal') {
            const rv = clamp01((lt - pc) / Math.max(0.8, dur - pc - 0.4));
            wr.update(t, { reveal: rv * 1.02 });
            // a big brush sweeps down the figure, just ahead of the paint
            const by = lerp(fy - 820 * s, fy - 60 * u, rv), bx = x + Math.sin(t * 6) * 120 * s;
            const tipP = [bx, by], hand = [bx + 160 * u, by - 260 * u];
            if (rv < 1) {
              brush[0].setAttribute('d', inkPath([hand, [bx + 40 * u, by - 70 * u]], { w: 20 * u, seed: sd + 10, t, taper: 0 }));
              brush[1].setAttribute('d', inkLoop([[bx + 50 * u, by - 80 * u], [bx + 24 * u, by - 70 * u], tipP, [bx + 10 * u, by - 40 * u], [bx + 54 * u, by - 56 * u]], { seed: sd + 11, t }));
              brush[2].setAttribute('d', inkPath([[bx + 50 * u, by - 80 * u], [bx + 24 * u, by - 70 * u], tipP, [bx + 10 * u, by - 40 * u], [bx + 54 * u, by - 56 * u]], { w: 4, seed: sd + 12, t, closed: true }));
            } else brush.forEach(e => e.setAttribute('d', ''));
            const GL = []; if (rv > 0.3) for (let i = 0; i < 7; i++) { const k = Math.max(0, Math.sin(t * 2.5 + i * 1.9)); if (k < 0.3) continue; const gx = x + (hn(i, 3) - 0.5) * 220 * s, gy = fy - lerp(120, 760, hn(i, 5)) * s, r = 22 * u * k; GL.push(inkPath([[gx - r, gy], [gx + r, gy]], { w: 5, seed: sd + 20 + i, t }) + ' ' + inkPath([[gx, gy - r], [gx, gy + r]], { w: 5, seed: sd + 30 + i, t })); }
            glint.setAttribute('d', GL.join(' '));
          } else {
            const D = Math.max(1, dur - fc - 0.3);
            wr.update(t, { lt, flipAt: c => (c.thr > 0.88 ? null : fc + (c.thr * 0.75 + c.yf * 0.25) * D) });
            // air flowing over the figure
            const AR = []; for (let i = 0; i < 6; i++) { const f = (t * 0.35 + i / 6) % 1, ay = fy - lerp(200, 800, hn(i, 9)) * s; AR.push(inkPath(Array.from({ length: 7 }, (_, j) => [lerp(-0.1, 1.1, f) * W - j * 30 * u, ay + Math.sin(j * 1.2 + t * 3 + i) * 12 * u]), { w: 6 * Math.sin(f * Math.PI) + 1, seed: sd + 40 + i, t, taper: 0.8 })); }
            air.setAttribute('d', lt > fc - 0.5 ? AR.join(' ') : '');
            sw.update(t, 0.82 * W, 0.2 * H, 92 * u, Math.max(0, lt - fc + 0.2) * 1.4);
            glint.setAttribute('d', '');
          }
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tc_workshop
  SH.tc_workshop = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000 + 683, root = el(svg, 'g'), u = W / 1080;
      const floor = (P.floor ?? 0.94) * H, s = (P.s ?? 1.3) * u, wx = (P.x ?? 0.4) * W, back = (P.back ?? 0.66) * H;
      const kiln = [inkEl(root, EARTH()), inkEl(root, mix(INK.red, INK.gold, 0.4)), inkEl(root), inkEl(root, INK.inkSoft, { 'fill-opacity': 0.5 })];
      const stand = [inkEl(root, mix(INK.stain, INK.ink, 0.2)), inkEl(root)];
      const wr = warrior(root, defs, sd + 50, wx, floor - 40 * u, s, { paint: false });
      const fp = fprint(el(wr.slot, 'g'), sd + 80, INK.red);
      const man = window.LH.person(el(root, 'g'), sd + 11, { kind: 'sweater', col: mix(INK.blue, INK.paperLight, 0.35), hair: 'dark', glasses: false });
      const woman = window.LH.person(el(root, 'g'), sd + 13, { kind: 'sweater', col: mix(INK.red, INK.paperLight, 0.4), hair: 'dark', glasses: false });
      const bunW = inkEl(root, INK.ink), lump = inkEl(root, CLAY()), lumpL = inkEl(root);
      const child = window.LH.person(el(root, 'g'), sd + 15, { kind: 'sweater', col: mix(INK.green, INK.paperLight, 0.3), hair: 'dark', glasses: false });
      const bunC = inkEl(root, INK.ink);
      const rowG = el(root, 'g'), prints = [0, 1, 2, 3, 4].map(i => fprint(rowG, sd + 90 + i, i === 4 ? INK.red : INK.ink));
      const cards = inkEl(rowG, INK.paperLight), cardsL = inkEl(rowG);
      rowG.insertBefore(cards, rowG.firstChild); rowG.insertBefore(cardsL, cards.nextSibling);
      const bench = [inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), inkEl(root, mix(INK.stain, INK.ink, 0.2)), inkEl(root, CLAY()), inkEl(root)];
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, kd = atOr(cues, 'kid', dur * 0.6), hit = punch(lt, kd, 0.8), rw = atOr(cues, 'row', kd);
          // kiln in the back right with a glowing mouth and smoke
          const KX = 0.8 * W, KB = back, KY = KB - 420 * u, K = [[KX - 150 * u, KB], [KX - 120 * u, KY], [KX - 40 * u, KY - 110 * u], [KX + 40 * u, KY - 110 * u], [KX + 120 * u, KY], [KX + 150 * u, KB]];
          kiln[0].setAttribute('d', inkLoop(K, { seed: sd + 1, t }));
          kiln[1].setAttribute('d', inkLoop(ellP(KX, KB - 120 * u, 64 * u * (1 + 0.06 * Math.sin(t * 7)), 72 * u, 10, Math.PI, TAU).concat([[KX + 64 * u, KB - 20 * u], [KX - 64 * u, KB - 20 * u]]), { seed: sd + 2, t }));
          kiln[2].setAttribute('d', inkPath(K, { w: 6, seed: sd + 3, t, closed: true }));
          kiln[3].setAttribute('d', [0, 1, 2].map(k => { const ph = (t * 0.3 + k / 3) % 1; return inkPath(Array.from({ length: 7 }, (_, j) => [KX + Math.sin(j + t * 1.5 + k) * (10 + j * 6) * u, KY - 120 * u - ph * 180 * u - j * 30 * u]), { w: 18 * u * (1 - ph) + 3, seed: sd + 4 + k, t, taper: 0.9 }); }).join(' '));
          const SD = sq(wx - 210 * u, floor - 40 * u, wx + 210 * u, floor + 24 * u);
          stand[0].setAttribute('d', inkLoop(SD, { seed: sd + 8, t, smooth: false })); stand[1].setAttribute('d', inkPath(SD, { w: 6, seed: sd + 9, t, closed: true, smooth: false }));
          wr.update(t, {});
          const fy = floor - 40 * u;
          // the child's thumbprint on the robe hem: big, red, glowing from cue "kid"
          const pressX = wx + 86 * s, pressY = fy - 214 * s, push = Math.max(0, Math.sin(t * 2.4)) * 16 * u;
          const pk = lt > kd - 0.25 ? progIO(lt, kd - 0.25, 0.7) : 0.3;
          fp.update(t, pressX - 84 * u, pressY - 40 * u, 78 * u * (1 + 0.1 * hit), pk, lt > kd ? 0.6 + 0.3 * Math.sin(t * 4) + hit : 0, 0.25, 2.2);
          // adults at the edges: the man smooths the armour, the woman carries a lump of clay
          const mps = 1.55 * u, mgy = floor - 20 * u;
          man.update(t, 0.12 * W, mgy, mps, { face: 1, lean: 6, look: [6, 4], armR: [wx - 190 * s, fy - 470 * s + Math.sin(t * 3) * 26 * u], armL: [wx - 196 * s, fy - 400 * s + Math.sin(t * 3 + 1) * 16 * u] });
          const wgy = floor - 20 * u, wps = 1.45 * u, wxx = 0.9 * W;
          const lx = wxx - 130 * wps, ly = wgy - 330 * wps + Math.sin(t * 2) * 6 * u;
          const ow = woman.update(t, wxx, wgy, wps, { face: -1, lean: 4, look: [6, 8], armR: [lx - 20 * u, ly], armL: [lx + 26 * u, ly + 20 * u] });
          bunW.setAttribute('d', inkCircle(ow.hc[0] + 36 * wps, ow.hc[1] - 36 * wps, 22 * wps, sd + 10, t, { fill: true }));
          lump.setAttribute('d', inkLoop(ellP(lx, ly - 30 * u, 70 * u, 46 * u, 12), { seed: sd + 11, t }));
          lumpL.setAttribute('d', inkPath(ellP(lx, ly - 30 * u, 70 * u, 46 * u, 12), { w: 5, seed: sd + 12, t, closed: true }) + ' ' + inkPath([[lx - 30 * u, ly - 44 * u], [lx + 10 * u, ly - 50 * u]], { w: 3, seed: sd + 13, t }));
          // the child, big in front, pressing a thumb into the hem
          const cps = (P.child ?? 1.85) * u, cgy = (P.childGy ?? 1.18) * H, cx = (P.childX ?? 0.68) * W;
          const oc = child.update(t, cx, cgy, cps, { face: -1, lean: 12, look: [8, 6], brow: lt > kd ? 0.7 : 0.2, mouth: lt > kd ? 0.5 : 0, armR: [pressX + 18 * u - push, pressY + 10 * u], armL: [pressX + 70 * u, pressY + 70 * u] });
          bunC.setAttribute('d', inkCircle(oc.hc[0] + 30 * cps, oc.hc[1] - 44 * cps, 20 * cps, sd + 14, t, { fill: true }));
          // five prints in a row, the last one red (one in five)
          const ry = (P.rowY ?? 0.32) * H, CD = [], CL = [];
          prints.forEach((p, i) => {
            const at = rw + 0.05 + i * 0.12, a = lt > at ? spring(lt, at, 0.5) : 0, px = 0.5 * W + (i - 2) * 170 * u, r = 46 * u * a;
            p.update(t, px, ry, r, 1, i === 4 && lt > at + 0.4 ? 0.6 + 0.3 * Math.sin(t * 4) : 0, 0.2);
            if (a > 0.02) { const c = sq(px - 66 * u * a, ry - 76 * u * a, px + 66 * u * a, ry + 76 * u * a); CD.push(inkLoop(c, { seed: sd + 200 + i, t, smooth: false })); CL.push(inkPath(c, { w: i === 4 ? 7 : 4, seed: sd + 210 + i, t, closed: true, smooth: false })); }
          });
          cards.setAttribute('d', CD.join(' ')); cardsL.setAttribute('d', CL.join(' '));
          // low workbench edge at the frame bottom with clay lumps
          const BT = (P.bench ?? 0.965) * H, B = sq(-20, BT, W + 20, H + 20), LMS = [[0.08, 50], [0.3, 40], [0.92, 54]];
          bench[0].setAttribute('d', inkLoop(B, { seed: sd + 20, t, smooth: false }));
          bench[1].setAttribute('d', '');
          bench[2].setAttribute('d', LMS.map((q, i) => inkLoop(ellP(q[0] * W, BT - q[1] * 0.5 * u, q[1] * 1.6 * u, q[1] * u, 10, Math.PI * 0.95, TAU * 1.02).concat([[q[0] * W + q[1] * 1.6 * u, BT + 6 * u], [q[0] * W - q[1] * 1.6 * u, BT + 6 * u]]), { seed: sd + 30 + i, t })).join(' '));
          bench[3].setAttribute('d', inkPath([[-20, BT], [W + 20, BT - 6 * u]], { w: 8, seed: sd + 40, t }) + ' ' + LMS.map((q, i) => inkPath(ellP(q[0] * W, BT - q[1] * 0.5 * u, q[1] * 1.6 * u, q[1] * u, 10, Math.PI * 0.95, TAU * 1.02), { w: 5, seed: sd + 41 + i, t })).join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
