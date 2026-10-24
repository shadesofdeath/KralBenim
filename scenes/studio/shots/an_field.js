// an_field: a battle plain seen from the side, in the parchment ink style (brand/kit/BRAND.md §3, §5): far ridge,
// dawn / day / evening sun with turning rays, birds, grass ticks, two army lines of small ink soldier pictograms
// (rows in depth, spears swaying, coloured tunics, waving banners), an optional big sultan standard (tuğ: gold ball,
// horse-tail strands, double-tailed flag), optional war elephants (caparison, tower with canopy and pennant, flapping
// ears, swinging trunk that rises on a cue, tusks, stepping legs), dust clouds where the lines meet, a red ring,
// hand-written labels and the narrator (Kaşif) in front. Made for Ankara 1402 (scenes 0 and 22), parametric.
//
// P: {time: "dawn"|"day"|"evening" ("dawn"), horizon: 0.52 (y of the far ridge, 0..1 H), hills: true,
//     sun: {x: 0.5, y: 0.47, r: 70} | false (default: low at dawn/evening, high by day), birds: 3,
//     left:  {color: "blue", x0: 0.03, x1: 0.42, y: 0.8 (front row feet, 0..1 H), rows: 3, n: 14 (per row),
//             scale: 1, helmet: "cone"|"turban"|"cap" (cone), spears: true, banners: 3 (0 = none), banner: true (alias),
//             advance: cue (default "meet"), step: 40 (px the line walks forward), dur: 0.9} | false,
//     right: {...same, color: "red", x0: 0.58, x1: 0.97, helmet: "turban"} | false,
//       (each line faces the other: left looks right, right looks left; a line walks toward the centre on advance)
//     standard: {side: "left"|"right", x: 0.24, y (base, default = back row of that side), h: 1 (height scale),
//                color (default = that side's colour), at: cue (springs up; omit = there from the start)} | false,
//     elephants: {side: "right", n: 3, x: 0.72, y: 0.82 (feet), gap: 0.1 (W, next one further back), scale: 1,
//                 color: "red" (caparison/canopy/pennant), at: cue (walk in from `from` x; omit = there),
//                 from: x0 (0..1, start x for `at`), advance: cue (walk forward by `step` px, default 140),
//                 dur: 2.2, raise: cue (trunks go up), items: [{x, y, scale}] (explicit placement)} | false,
//     ring: {x, y, r: 110, at, color: "red"} (hand-drawn ring, e.g. round the sultan's standard),
//     dust: cue | {at, x0: 0.4, x1: 0.6, y: front row, n: 7} (default: at "meet" if that cue exists),
//     labels: [{text, x, y, at, color: "ink"|"red"|"blue"|"gold", size: 60, rot: -3}],
//     kasif: {x: 0.12, y: 0.95, scale: 0.8, face: 1, pose: "look", dir, emotion, seq: [{at, pose, dir, face, emotion}],
//             moves: [{at, x, dur}]} | false,
//     cam: {zoom: 1.06, focus: [0.5, 0.6]}, shake: cue}
// cues: meet (both lines step forward + dust), hit (camera punch), plus any names used above (advance, raise, at...).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft, white: INK.paperLight, gold: INK.gold, green: INK.green };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);
  const TAU = Math.PI * 2;

  // pose segments for a rig: base pose then seq entries at their cues
  function segs(K, cues, lt) {
    const L = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
    (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) L.push(Object.assign({}, s, { at: a })); });
    L.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < L.length; j++) if (lt >= L[j].at) i = j;
    const s = L[i], pv = i > 0 ? L[i - 1] : null, since = lt - Math.max(0, s.at);
    const o = { since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : (K.emotion || null)), mouth: 0, seg: s };
    if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
    return { pose: s.pose || 'idle', o };
  }
  function track(m, lt, cues, W) {
    let x = m.x * W, moving = 0, dist = 0;
    (m.moves || []).forEach((v, i) => {
      const a = atOr(cues, v.at, 0.3 + i * 2), d = v.dur ?? 0.6, p = progIO(lt, a, d);
      if (v.x != null) { const nx = lerp(x, v.x * W, p); dist += Math.abs(nx - x); x = nx; if (lt > a && lt < a + d) moving = 1; }
    });
    return { x, moving, dist };
  }

  // ---------------------------------------------------------------- one soldier pictogram (feet at X, Y)
  // returns path strings: tunic (army colour), light (head/helmet fill), ink (outline strokes), spear tips
  function soldier(X, Y, s, f, o) {
    const { t, sd, ph, moving, helmet, spear } = o;
    const bob = moving ? -Math.abs(Math.sin(ph * Math.PI)) * 5 : Math.sin(t * 2 + sd) * 1.2;
    const T = (x, y) => [X + x * s * f, Y + (y + (y < -30 ? bob : 0)) * s];
    const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 0.9, taper: 0.15 }, x);
    const w = 4.2 * s;
    const sw = moving ? Math.sin(ph * Math.PI) * 13 : 0;
    let ink = inkPath([T(0, -40), T(-sw - 6, -18), T(-sw - 9, 0)], O(1, { w })) + ' ' + inkPath([T(0, -40), T(sw + 6, -18), T(sw + 9, 0)], O(2, { w }));
    const tun = [T(-14, -80), T(14, -80), T(19, -34), T(-19, -34)];
    const tunic = inkLoop(tun, O(3, { smooth: false }));
    ink += ' ' + inkPath(tun, O(4, { w: w * 0.8, closed: true, smooth: false }));
    const hc = T(0, -97);
    const head = inkEllipsePts(hc[0], hc[1], 14 * s, 14 * s, sd + 5, 9);
    let light = inkLoop(head, O(5));
    ink += ' ' + inkPath(head, O(6, { w: w * 0.85, closed: true }));
    let tip = '';
    if (helmet === 'turban') {
      const tb = inkEllipsePts(hc[0], hc[1] - 11 * s, 17 * s, 10 * s, sd + 7, 9);
      light += ' ' + inkLoop(tb, O(7));
      ink += ' ' + inkPath(tb, O(8, { w: w * 0.8, closed: true })) + ' ' + inkPath([T(-12, -110), T(10, -104)], O(9, { w: w * 0.5 }));
    } else if (helmet === 'cap') {
      const cp = [T(-15, -100), T(-12, -116), T(0, -122), T(12, -116), T(15, -100)];
      ink += ' ' + inkPath(cp, O(8, { w: w * 0.9 }));
    } else {
      const cn = [T(-16, -101), T(0, -134), T(16, -101)];
      light += ' ' + inkLoop(cn, O(7, { smooth: false }));
      ink += ' ' + inkPath(cn.concat([cn[0]]), O(8, { w: w * 0.8, smooth: false }));
    }
    // arm + spear (sways)
    const sa = Math.sin(t * 1.5 + sd * 0.7) * 4 + (moving ? Math.sin(ph * Math.PI * 2) * 3 : 0);
    ink += ' ' + inkPath([T(0, -72), T(10, -62), T(18, -54)], O(10, { w: w * 0.9 }));
    if (spear) {
      const top = T(22 + sa, -178), bot = T(17, -10);
      ink += ' ' + inkPath([bot, top], O(11, { w: w * 0.75, taper: 0 }));
      const a = Math.atan2(top[1] - bot[1], top[0] - bot[0]), L = 15 * s, Wd = 6 * s;
      const p0 = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L], p1 = [top[0] - Math.sin(a) * Wd, top[1] + Math.cos(a) * Wd], p2 = [top[0] + Math.sin(a) * Wd, top[1] - Math.cos(a) * Wd];
      tip = inkLoop([p0, p1, p2], O(12, { smooth: false, amp: 0.5 }));
    }
    return { tunic, light, ink, tip };
  }

  // ---------------------------------------------------------------- one war elephant (feet at X, Y), facing f
  function elephant(X, Y, s, f, o) {
    const { t, sd, ph, moving, raise } = o;
    const bob = moving ? -Math.abs(Math.sin(ph * Math.PI * 2)) * 7 : Math.sin(t * 1.6 + sd) * 2.2;
    const sway = (moving ? Math.sin(ph * TAU) * 0.035 : 0) + Math.sin(t * 1.3 + sd) * 0.02;
    const T = (x, y) => [X + x * s * f, Y + (y + (y < -60 ? bob : 0)) * s];
    const R = (x, y) => {          // tower points sway round the back
      const cx = 0, cy = -255, dx = x - cx, dy = y - cy, c = Math.cos(sway), sn = Math.sin(sway);
      return T(cx + dx * c - dy * sn, cy + dx * sn + dy * c);
    };
    const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.3 }, x);
    const w = 6 * s;
    const out = { legInk: '', legLight: '', legFar: '', body: '', ring: '', cloth: '', light: '', canopy: '', trunkInk: '', trunkLight: '', head: '', tusk: '' };
    // legs: far pair darker, near pair light (all drawn before the body)
    const legs = [[70, 0.5, 1], [-100, 0, 1], [100, 0, 0], [-72, 0.5, 0]];
    legs.forEach((l, k) => {
      const p = ph + l[1] + (l[2] ? 0.25 : 0), sw = moving ? Math.sin(p * TAU) * 20 : 0, lift = moving ? Math.max(0, Math.sin(p * TAU)) * 16 : 0;
      const pts = [T(l[0], -150), T(l[0] + sw * 0.4, -70), T(l[0] + sw, -lift - 8)];
      const ik = inkPath(pts, O(10 + k, { w: 46 * s, taper: 0, amp: 1 })), il = inkPath(pts, O(10 + k, { w: 34 * s, taper: 0, amp: 1 }));
      out.legInk += ik + ' ';
      if (l[2]) out.legFar += il + ' '; else out.legLight += il + ' ';
      const ft = T(l[0] + sw, -lift - 4);
      out.ring += inkPath([[ft[0] - 15 * s, ft[1]], [ft[0] + 15 * s, ft[1]]], O(20 + k, { w: w * 0.6 })) + ' ';
    });
    // tail
    const tsw = Math.sin(t * 2.6 + sd) * 10;
    out.ring += inkPath([T(-136, -205), T(-152, -170), T(-156 + tsw * 0.5, -130)], O(30, { w: w * 0.8 })) + ' ';
    const tt = T(-156 + tsw * 0.5, -124); out.ring += inkDot(tt[0], tt[1], 7 * s, 10 * s, sd + 31, t) + ' ';
    // body
    const bp = inkEllipsePts(X, Y - 178 * s, 142 * s, 82 * s, sd + 40, 14).map(q => [q[0], q[1] + bob * s]);
    out.body = inkLoop(bp, O(41));
    out.ring += inkPath(bp, O(42, { w, closed: true })) + ' ';
    // caparison
    const cl = [T(-108, -246), T(78, -246), T(88, -148), T(-118, -148)];
    out.cloth = inkLoop(cl, O(43, { smooth: false }));
    out.ring += inkPath(cl, O(44, { w: w * 0.7, closed: true, smooth: false })) + ' ';
    for (let q = 0; q < 9; q++) { const x = lerp(-110, 84, q / 8); out.ring += inkPath([T(x, -150), T(x - 2, -132)], O(45 + q, { w: w * 0.5 })) + ' '; }
    for (let q = 0; q < 3; q++) out.ring += inkPath([T(-96 + q * 66, -232), T(-70 + q * 66, -165)], O(55 + q, { w: w * 0.4 })) + ' ';
    // tower (howdah) with canopy and pennant
    const box = [R(-72, -250), R(52, -250), R(52, -318), R(-72, -318)];
    out.light += inkLoop(box, O(60, { smooth: false })) + ' ';
    out.ring += inkPath(box, O(61, { w: w * 0.8, closed: true, smooth: false })) + ' ';
    for (let q = 0; q < 4; q++) { const x = -64 + q * 36; out.ring += inkPath([R(x, -318), R(x, -334), R(x + 16, -334), R(x + 16, -318)], O(62 + q, { w: w * 0.6, smooth: false })) + ' '; }
    out.ring += inkPath([R(-50, -300), R(-50, -268)], O(67, { w: w * 0.5 })) + ' ' + inkPath([R(30, -300), R(30, -268)], O(68, { w: w * 0.5 })) + ' ';
    const can = [R(-84, -334), R(-10, -386), R(64, -334)];
    out.canopy += inkLoop(can, O(69, { smooth: false })) + ' ';
    out.ring += inkPath(can.concat([can[0]]), O(70, { w: w * 0.8, smooth: false })) + ' ';
    const pole0 = R(-10, -386), pole1 = R(-10, -446);
    out.ring += inkPath([pole0, pole1], O(71, { w: w * 0.7, taper: 0 })) + ' ';
    const wv = Math.sin(t * 6 + sd) * 7;
    const pn = [pole1, [pole1[0] - f * 70 * s, pole1[1] + (8 + wv) * s], [pole1[0] - f * 4 * s, pole1[1] + 26 * s]];
    out.canopy += inkLoop(pn, O(72, { smooth: false })) + ' ';
    out.ring += inkPath(pn.concat([pn[0]]), O(73, { w: w * 0.55, smooth: false })) + ' ';
    // trunk (idle swing -> raised on cue)
    const swg = Math.sin(t * 1.9 + sd) * 1, rp = raise;
    const idle = [[150, -205], [178, -168], [184 + swg * 6, -118], [178 + swg * 12, -66], [190 + swg * 16, -34]];
    const up = [[150, -205], [186, -222], [214, -258], [236 + swg * 4, -290], [262 + swg * 6, -282]];
    const tr = idle.map((p, i) => T(lerp(p[0], up[i][0], rp), lerp(p[1], up[i][1], rp)));
    out.trunkInk = inkPath(tr, O(80, { w: 40 * s, taper: 0.5, amp: 1 }));
    out.trunkLight = inkPath(tr, O(80, { w: 28 * s, taper: 0.5, amp: 1 }));
    // head
    const hp = inkEllipsePts(X + 122 * s * f, Y + (-208 + bob) * s, 58 * s, 62 * s, sd + 81, 12);
    out.head = inkLoop(hp, O(82));
    out.ring += '';
    out.headRing = inkPath(hp, O(83, { w, closed: true }));
    // ear (flaps)
    const fl = 0.5 + 0.5 * Math.sin(t * (moving ? 5 : 3) + sd);
    const ear = [[120, -258], [80, -262], [54, -230], [56, -186], [78, -152], [116, -164]].map(p => T(120 + (p[0] - 120) * (1 - 0.32 * fl), p[1]));
    out.ear = inkLoop(ear, O(84));
    out.earRing = inkPath(ear, O(85, { w: w * 0.9, closed: true })) + ' ' + inkPath([T(92, -236), T(80, -206), T(94, -180)].map((p, i) => i === 1 ? [lerp(p[0], X + 120 * s * f, 0.32 * fl), p[1]] : p), O(86, { w: w * 0.45 }));
    const ey = T(156, -228);
    out.eye = inkDot(ey[0], ey[1], 5.5 * s, 6 * s, sd + 87, t) + ' ' + inkPath([T(146, -244), T(166, -240)], O(88, { w: w * 0.5 }));
    const tk = [T(146, -170), T(174, -158), T(200, -170)];
    out.tuskInk = inkPath(tk, O(89, { w: 15 * s, taper: 0.6 }));
    out.tusk = inkPath(tk, O(89, { w: 8 * s, taper: 0.6 }));
    return out;
  }

  SH.an_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 977, r = rng(seed * 23 + 11);
      const U = Math.min(W, H) / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const time = P.time || 'dawn';
      const hy = H * (P.horizon ?? 0.52);

      // back layers
      const sky = mk(cam, INK.inkSoft, { 'fill-opacity': 0.5 });
      const sunF = mk(cam, INK.gold), sunR = mk(cam);
      const birdR = mk(cam, INK.inkSoft);
      const hillF = mk(cam, INK.paperDark, { 'fill-opacity': 0.75 }), hillR = mk(cam, INK.inkSoft);
      const groundF = mk(cam, INK.paperDark, { 'fill-opacity': 0.32 }), groundR = mk(cam), grassR = mk(cam, INK.inkSoft), grassG = mk(cam, INK.gold);
      const ridge = []; for (let i = 0; i <= 18; i++) ridge.push([i / 18 * (W + 240) - 120, hy - Math.sin(i * 1.1 + seed) * 22 * U - Math.sin(i * 0.45) * 26 * U - r() * 14 * U]);
      const ridge2 = []; for (let i = 0; i <= 12; i++) ridge2.push([i / 12 * (W + 240) - 120, hy + 34 * U - Math.sin(i * 0.9 + 2) * 16 * U - r() * 10 * U]);
      const grass = []; for (let i = 0; i < 60; i++) grass.push([r() * W, hy + 60 * U + r() * (H - hy - 60 * U), r()]);
      const birds = []; for (let i = 0; i < (P.birds ?? 3); i++) birds.push([r() * W * 0.7 + W * 0.15, H * (0.12 + r() * 0.16), 0.8 + r() * 0.5, 18 + r() * 14]);

      // army lines
      const SIDES = [];
      const mkSide = (key, dflt) => {
        const S = P[key];
        if (S === false || (S == null && key === 'right' && P.left === false)) return;
        const L = Object.assign({}, dflt, S || {});
        const g = el(cam, 'g');
        const back = { tunic: mk(g, COL[L.color] || INK.blue, { 'fill-opacity': 0.8 }), light: mk(g, INK.paperLight), ink: mk(g, INK.inkSoft), tip: mk(g, INK.inkSoft) };
        const bannerG = el(g, 'g'), banF = mk(bannerG, COL[L.color] || INK.blue), banR = mk(bannerG);
        const front = { tunic: mk(g, COL[L.color] || INK.blue), light: mk(g, INK.paperLight), ink: mk(g), tip: mk(g) };
        const rows = L.rows ?? 3, n = L.n ?? 14, s0 = (L.scale ?? 1) * U;
        const men = [];
        for (let rr = rows - 1; rr >= 0; rr--) {
          const sc = s0 * (1 - 0.13 * rr), y = H * (L.y ?? 0.8) - rr * 46 * s0;
          for (let i = 0; i < n; i++) {
            const u = n > 1 ? i / (n - 1) : 0.5, jit = (r() - 0.5) * 0.25;
            const x = W * lerp(L.x0, L.x1, clamp01(u + (rr % 2 ? 0.5 / Math.max(1, n - 1) : 0) + jit / Math.max(1, n - 1)));
            men.push({ x, y: y + (r() - 0.5) * 6 * sc, s: sc * (0.94 + r() * 0.1), rr, k: rr * 100 + i });
          }
        }
        const nb = L.banners ?? (L.banner === false ? 0 : 3), bans = [];
        for (let i = 0; i < nb; i++) bans.push({ x: W * lerp(L.x0, L.x1, (i + 0.5) / nb), y: H * (L.y ?? 0.8) - (rows - 1) * 46 * s0 - 4, k: i });
        SIDES.push({ key, L, dir: key === 'left' ? 1 : -1, back, front, banF, banR, men, bans, s0 });
      };
      mkSide('left', { color: 'blue', x0: 0.03, x1: 0.42, helmet: 'cone', spears: true });
      mkSide('right', { color: 'red', x0: 0.58, x1: 0.97, helmet: 'turban', spears: true });

      // standard (tuğ + flag)
      const ST = P.standard || null;
      const stG = ST ? el(cam, 'g') : null;
      const stF = ST ? mk(stG, COL[ST.color] || COL[(P[ST.side || 'left'] || {}).color] || (ST.side === 'right' ? INK.red : INK.blue)) : null;
      const stGold = ST ? mk(stG, INK.gold) : null, stR = ST ? mk(stG) : null;

      // elephants (sorted back to front)
      const E = P.elephants || null;
      const eles = [];
      if (E) {
        const side = E.side || 'right', face = side === 'right' ? -1 : 1, n = E.n ?? 3;
        const items = E.items || Array.from({ length: n }, (_, k) => ({ x: (E.x ?? 0.72) + k * (E.gap ?? 0.1) * (-face), y: (E.y ?? 0.82) - (k % 2) * 0.03, scale: (E.scale ?? 1) * (1 - 0.06 * (k % 2)) }));
        items.map((it, k) => Object.assign({ k }, it)).sort((a, b) => a.y - b.y).forEach(it => {
          const g = el(cam, 'g'), c = COL[E.color] || INK.red;
          const L2 = {
            legInk: mk(g), legFar: mk(g, INK.paperDark), legLight: mk(g, INK.paperLight),
            body: mk(g, INK.paperLight), cloth: mk(g, c), light: mk(g, INK.paperLight), canopy: mk(g, c), ring: mk(g),
            trunkInk: mk(g), trunkLight: mk(g, INK.paperLight), head: mk(g, INK.paperLight), headRing: mk(g),
            ear: mk(g, INK.paperLight), earRing: mk(g), tuskInk: mk(g), tusk: mk(g, INK.paperLight), eye: mk(g),
          };
          eles.push({ it, g, L: L2, face });
        });
      }
      const dustF = mk(cam, INK.paperDark), dustR = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });

      // front: ring, labels, narrator
      const front = el(root, 'g');
      const RG = P.ring || null, ringR = RG ? mk(cam, COL[RG.color] || INK.red) : null;
      const labels = (P.labels || []).map(L => {
        const tx = el(front, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 60, 'text-anchor': 'middle', fill: COL[L.color] || INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        tx.textContent = L.text; return { L, t: tx };
      });
      const K = P.kasif === false ? null : Object.assign({ x: 0.12, y: 0.95, scale: 0.8, face: 1, pose: 'look' }, P.kasif || {});
      const kas = K ? KASIF.create(el(front, 'g'), { scale: 1, hat: true, seed: sd + 5 }) : null;

      let lastStep = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const meet = atOr(cues, 'meet', null);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          const fc = Cm.focus || [0.5, 0.6], fx = fc[0] * W, fy = fc[1] * H;
          const sa = atOr(cues, P.shake, null), sk = sa != null && lt >= sa ? Math.exp(-(lt - sa) * 4) * 12 * U : 0;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.35) * 5 + sk * Math.sin(lt * 57))} ${f1(fy + Math.cos(lt * 0.27) * 4 + sk * Math.cos(lt * 43))}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          // ---- static layers at the boil rate
          if (redraw || lt < 0.05) {
            let sk2 = '';
            if (time === 'dawn' || time === 'evening') {
              for (let i = 0; i < 16; i++) { const y = hy - 40 * U - i * 22 * U, x = W * ((i * 0.37 + 0.1) % 0.8); sk2 += inkPath([[x, y], [x + (180 + (i % 3) * 90) * U, y - 3]], O(10 + i, { w: 2.5, amp: 0.8 })) + ' '; }
            }
            sky.setAttribute('d', sk2);
            hillF.setAttribute('d', inkLoop(ridge.concat([[W + 120, hy + 120 * U], [-120, hy + 120 * U]]), O(100)) + ' ' + inkLoop(ridge2.concat([[W + 120, hy + 140 * U], [-120, hy + 140 * U]]), O(101)));
            hillR.setAttribute('d', inkPath(ridge, O(102, { w: 4 })) + ' ' + inkPath(ridge2, O(103, { w: 3 })));
            const gy = hy + 70 * U;
            groundF.setAttribute('d', inkLoop([[-60, gy], [W + 60, gy - 6], [W + 60, H + 40], [-60, H + 40]], O(104, { smooth: false })));
            groundR.setAttribute('d', inkPath([[-40, gy + 2], [W * 0.3, gy - 4], [W * 0.62, gy + 4], [W + 40, gy - 4]], O(105, { w: 4 })));
            let gr = '', gg = '';
            grass.forEach((q, i) => {
              const sw = Math.sin(t * 1.5 + i) * 3, s2 = inkPath([[q[0], q[1]], [q[0] + 4 + sw, q[1] - (16 + q[2] * 10) * U]], O(200 + i, { w: 3, amp: 0.8 })) + ' ' + inkPath([[q[0] + 8, q[1]], [q[0] + 15 + sw, q[1] - 13 * U]], O(270 + i, { w: 2.5, amp: 0.8 })) + ' ';
              if (i % 3 === 0) gg += s2; else gr += s2;
            });
            grassR.setAttribute('d', gr); grassG.setAttribute('d', gg);
          }

          // ---- sun with turning rays
          if (P.sun !== false) {
            const S = Object.assign(time === 'day' ? { x: 0.62, y: 0.16, r: 62 } : { x: 0.5, y: (P.horizon ?? 0.52) - 0.04, r: 78 }, P.sun || {});
            const x = S.x * W, y = S.y * H - (time === 'dawn' ? lt * 3 * U : 0), Rr = (S.r ?? 70) * U;
            const pts = inkEllipsePts(x, y, Rr, Rr, sd + 900, 14);
            sunF.setAttribute('d', inkLoop(pts, O(900)));
            let rr = inkPath(pts, O(901, { closed: true, w: 4 }));
            for (let q = 0; q < 12; q++) { const a = q / 12 * TAU + t * 0.15, l = Rr + (34 + Math.sin(t * 3 + q) * 7) * U; rr += ' ' + inkPath([[x + Math.cos(a) * (Rr + 14 * U), y + Math.sin(a) * (Rr + 14 * U)], [x + Math.cos(a) * l, y + Math.sin(a) * l]], O(910 + q, { w: 4 })); }
            sunR.setAttribute('d', rr);
          }
          // ---- birds drifting
          birdR.setAttribute('d', birds.map((b, i) => {
            const x = b[0] + lt * b[3] * U, y = b[1] + Math.sin(lt * 1.1 + i * 2) * 8, fl = Math.sin(lt * 5 + i * 2.3) * 9 * b[2] * U, w = 24 * b[2] * U;
            return inkPath([[x - w, y - fl], [x - w * 0.45, y - 6 * U - fl * 0.3], [x, y], [x + w * 0.45, y - 6 * U - fl * 0.3], [x + w, y - fl]], O(950 + i, { w: 3.5, amp: 0.5 }));
          }).join(' '));

          // ---- army lines
          SIDES.forEach((S, si) => {
            const L = S.L, a = atOr(cues, L.advance ?? 'meet', null), d = L.dur ?? 0.9;
            const p = a != null ? progIO(lt, a, d) : 0, moving = a != null && lt > a && lt < a + d;
            const dx = S.dir * (L.step ?? 40) * U * p;
            const acc = { back: { tunic: '', light: '', ink: '', tip: '' }, front: { tunic: '', light: '', ink: '', tip: '' } };
            S.men.forEach(m => {
              const o = soldier(m.x + dx, m.y, m.s, S.dir, { t, sd: sd + 3000 + si * 1500 + m.k * 7, ph: t * 2.4 + m.k * 0.13, moving, helmet: L.helmet, spear: L.spears !== false });
              const A = m.rr ? acc.back : acc.front;
              A.tunic += o.tunic + ' '; A.light += o.light + ' '; A.ink += o.ink + ' '; A.tip += o.tip + ' ';
            });
            ['back', 'front'].forEach(k => { const E2 = S[k], A = acc[k]; E2.tunic.setAttribute('d', A.tunic); E2.light.setAttribute('d', A.light); E2.ink.setAttribute('d', A.ink); E2.tip.setAttribute('d', A.tip); });
            let bf = '', br = '';
            S.bans.forEach(b => {
              const x = b.x + dx, y = b.y, s = S.s0 * 0.9, top = y - 250 * s, wv = Math.sin(t * 5 + b.k * 1.7) * 9 * s, fd = S.dir;
              br += inkPath([[x, y], [x, top]], O(1000 + si * 20 + b.k, { w: 5 * s, taper: 0 })) + ' ';
              const fl = [[x, top], [x + fd * 80 * s, top + 8 * s + wv], [x + fd * 64 * s, top + 30 * s], [x + fd * 84 * s, top + 52 * s + wv * 0.6], [x, top + 50 * s]];
              bf += inkLoop(fl, O(1010 + si * 20 + b.k)) + ' ';
              br += inkPath(fl, O(1015 + si * 20 + b.k, { closed: true, w: 3.5 * s })) + ' ';
            });
            S.banF.setAttribute('d', bf); S.banR.setAttribute('d', br);
          });

          // ---- sultan's standard
          if (ST) {
            const side = SIDES.find(S => S.key === (ST.side || 'left'));
            const L = side ? side.L : {}, a = side ? atOr(cues, L.advance ?? 'meet', null) : null;
            const dx = side && a != null ? side.dir * (L.step ?? 40) * U * progIO(lt, a, L.dur ?? 0.9) : 0;
            const ap = ST.at != null ? atOr(cues, ST.at, 0.3) : null, sp = ap == null ? 1 : (lt >= ap ? spring(lt, ap, 0.6) : 0);
            const s = (ST.h ?? 1) * U * sp, x = ST.x * W + dx;
            const y = ST.y != null ? ST.y * H : (side ? H * (L.y ?? 0.8) - ((L.rows ?? 3) - 1) * 46 * side.s0 : H * 0.7);
            const top = y - 400 * s, fd = side ? side.dir : 1, wv = Math.sin(t * 4.5) * 12 * s;
            if (sp <= 0.001) { stF.setAttribute('d', ''); stGold.setAttribute('d', ''); stR.setAttribute('d', ''); }
            else {
              let rr = inkPath([[x, y + 10 * s], [x, top]], O(1100, { w: 8 * s, taper: 0 }));
              const ball = inkEllipsePts(x, top - 14 * s, 15 * s, 15 * s, sd + 1101, 9);
              stGold.setAttribute('d', inkLoop(ball, O(1101)) + ' ' + inkLoop([[x - 10 * s, top - 26 * s], [x, top - 58 * s], [x + 10 * s, top - 26 * s]], O(1102, { smooth: false })));
              rr += ' ' + inkPath(ball, O(1103, { closed: true, w: 4 * s }));
              for (let q = 0; q < 7; q++) {          // horse-tail strands
                const u = q / 6 - 0.5, sw = Math.sin(t * 3 + q) * 8 * s;
                rr += ' ' + inkPath([[x + u * 14 * s, top + 4 * s], [x + u * 34 * s + sw * 0.5, top + 50 * s], [x + u * 44 * s + sw, top + 96 * s]], O(1110 + q, { w: 3.5 * s }));
              }
              const fy0 = top + 110 * s;
              const fl = [[x, fy0], [x + fd * 150 * s, fy0 + 12 * s + wv], [x + fd * 120 * s, fy0 + 52 * s], [x + fd * 156 * s, fy0 + 96 * s + wv * 0.7], [x, fy0 + 92 * s]];
              stF.setAttribute('d', inkLoop(fl, O(1120)));
              rr += ' ' + inkPath(fl, O(1121, { closed: true, w: 5 * s }));
              stR.setAttribute('d', rr);
            }
          }

          // ---- elephants
          if (E) {
            const ia = E.at != null ? atOr(cues, E.at, 0) : null, aa = E.advance != null ? atOr(cues, E.advance, null) : null;
            const ra = E.raise != null ? atOr(cues, E.raise, null) : null, rp = ra != null && lt >= ra ? spring(lt, ra, 0.7) : 0;
            const dd = E.dur ?? 2.2;
            eles.forEach((e, i) => {
              const it = e.it, s = (it.scale ?? E.scale ?? 1) * U;
              let x = it.x * W, moving = 0;
              if (ia != null) {
                const x0 = (E.from ?? (e.face < 0 ? 1.25 : -0.25)) * W + (it.x - (E.x ?? 0.72)) * W;
                const p = progIO(lt, ia + i * 0.15, dd); x = lerp(x0, x, p); if (lt > ia && lt < ia + i * 0.15 + dd) moving = 1;
              }
              if (aa != null) {
                const p = progIO(lt, aa + i * 0.12, dd); x += e.face * (E.step ?? 140) * U * p; if (lt > aa + i * 0.12 && lt < aa + i * 0.12 + dd) moving = 1;
              }
              const o = elephant(x, it.y * H, s, e.face, { t, sd: sd + 5000 + it.k * 200, ph: t * 0.9 + it.k * 0.3, moving, raise: rp });
              Object.keys(e.L).forEach(k => e.L[k].setAttribute('d', o[k] || ''));
            });
          }

          // ---- dust where the lines meet
          const D = P.dust != null ? (typeof P.dust === 'object' ? P.dust : { at: P.dust }) : (meet != null ? { at: 'meet' } : null);
          if (D) {
            const a = atOr(cues, D.at, null), n = D.n ?? 7;
            let df = '', dr = '';
            if (a != null && lt >= a) for (let q = 0; q < n; q++) {
              const u = ((lt - a) / 2.6 + q / n) % 1, gy = H * (D.y ?? ((P.left || {}).y ?? 0.8));
              const x = W * lerp(D.x0 ?? 0.4, D.x1 ?? 0.6, (q + 0.5) / n) + Math.sin(q * 3 + lt) * 20, y = gy - u * 150 * U, Rr = (30 + u * 60) * U * Math.min(1, (lt - a) * 2);
              const pts = inkEllipsePts(x, y, Rr, Rr * 0.7, sd + 1200 + q, 10);
              df += inkLoop(pts, O(1200 + q)) + ' '; dr += inkPath(pts.slice(0, 7), O(1240 + q, { w: 2.5 })) + ' ';
            }
            dustF.setAttribute('d', df); dustF.setAttribute('fill-opacity', 0.6); dustR.setAttribute('d', dr);
          }

          // ---- ring
          if (ringR) {
            const a = atOr(cues, RG.at, 0.5), p = lt >= a ? prog(lt, a, 0.7) : 0, R0 = (RG.r ?? 110) * U;
            const pts = inkEllipsePts(RG.x * W, RG.y * H, R0, R0 * 0.9, sd + 2900, 18), keep = Math.max(2, Math.round(pts.length * p));
            ringR.setAttribute('d', p > 0.02 ? inkPath(p > 0.98 ? pts.concat([pts[0]]) : pts.slice(0, keep + 1), O(2900, { w: 8 * U * (1 + 0.3 * punch(lt, a + 0.7, 0.5)) })) : '');
          }

          // ---- labels
          labels.forEach((o, i) => {
            const L = o.L, a = atOr(cues, L.at, 0.3 + i * 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 70 + i, t, 1.4);
            o.t.setAttribute('opacity', clamp01(p * 2));
            o.t.setAttribute('transform', `translate(${f1(W * L.x + b[0])} ${f1(H * L.y + b[1])}) rotate(${L.rot ?? -3}) scale(${lerp(0.5, 1, p).toFixed(3)})`);
          });

          // ---- narrator
          if (kas) {
            const sg = segs(K, cues, lt), o = sg.o, tr = track(K, lt, cues, W);
            let pose = sg.pose;
            o.x = tr.x; o.y = (K.y ?? 0.95) * H; o.scale = (K.scale ?? 0.8) * U; o.face = faceOf(sg.o.seg.face ?? K.face);
            if (tr.moving) { pose = 'walk'; o.ph = tr.dist / (KASIF.gait('walk') * o.scale); delete o.prev; }
            kas.update(t, pose, o);
          }
        },
      };
    },
  };
})();
