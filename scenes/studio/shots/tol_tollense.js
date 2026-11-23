// tol_tollense: shots for the Stickstory Short "Tollense Valley: Europe's oldest known battlefield" (2026-11-23).
// NE Germany, c. 1250 BC: in 1996 an amateur archaeologist sees an upper-arm bone in the bank of the Tollense River
// with a flint arrowhead stuck in it; excavations find skulls with healed/unhealed holes, wooden clubs (one like a
// bat, one like a croquet mallet), bronze and flint arrowheads and the remains of about 150 people; researchers think
// thousands fought at a wooden causeway over the river, and some arrowhead types come from 300+ miles south (Bavaria /
// Moravia, Antiquity 2024). Non-graphic on purpose: no blood, bones are clean finds, the fight is silhouettes + arrows.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.person, LH.kasif, LH.label) and
// sb__lib.js (SB.warrior, SB.arrow, SB.dust, SB.grass). Portrait 1080×1920 (Shorts).
//
// Common params: labels: [{text, x, y, at, size, color, font, card, rot, underline}] (LH.label)
//   kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, item, text, seq: [{at, pose, dir, face, emotion}]}
//
// SHOTS.tol_bank — the reedy bank of the Tollense River: mud bank, slow water down to the frame bottom, cattails.
//   P: {mode: "hook" (close: a big upper-arm bone juts out of the mud bank, a flint arrowhead stuck in it; gold ring
//   on cue "bone"; on cue "war" a pale ghost army of spears and round shields rises along the horizon) |
//   "walk" (wide: a man in a green jacket walks along the bank, stops at cue "spot" and bends to point at a small
//   bone in the mud; gold ring) | "host" (wide bank with a red dig flag; the narrator stands centre),
//   ground: 0.52 | 0.6 (top of the bank, 0..1 H), water: (waterline 0..1 H), bone: {x, y} (hook), labels, kasif}
// SHOTS.tol_bone — close-up of the bone lying in wet mud, the flint arrowhead lodged in its shaft; a magnifying glass
//   slides over the arrowhead on cue "lens", gold ring on cue "hit". P: {labels}
// SHOTS.tol_dig — the excavation by the river. P: {mode: "trench" (a string-gridded pit, two archaeologists kneel and
//   brush, bones surface one by one from cue "dig", spoil heap + shovel + bucket in front) | "finds" (close on the
//   pit floor: a skull with a hole on cue "skulls", a bat-like club and a mallet-like club on cue "clubs", bronze
//   arrowheads, then a counter card rolls 0 -> P.count, landing on cue "count") | "dig" (trench until cue "finds", then
//   cuts to the finds view), count: 150, count_label: "PEOPLE", labels}
// SHOTS.tol_valley — the valley 3,250 years ago seen from the near bank: the river flows across the frame, a wooden
//   causeway on posts runs from the near bank to the far bank. P: {mode: "then" (two travellers walk the causeway,
//   a year counter rolls 2026 AD -> 1250 BC on cue "years") | "clash" (blue-shield warriors hold the near bank, red-
//   shield warriors pour down the causeway, arrows arc over, dust; on cue "crowd" rows of spears rise on the far
//   hills) | "today" (the empty valley now: only rotted post stumps of the causeway stick out of the water; a pale
//   ghost army rises on the far bank from cue "ghost" and fades again), from: 2026, to: -1250, labels}
// SHOTS.tol_map — full-frame old map of Central Europe (Baltic coast to the Adriatic): rivers, Alps, labels; on cue
//   "route" red dashed routes run from Bavaria and Moravia north to the Tollense, an arrowhead travelling at their
//   tips; crossed swords at the Tollense pulse on arrival. P: {labels}
// cues: the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const S = (e, d) => e.setAttribute('d', d);
  const SERIF = 'Fraunces, Georgia, serif';
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const kasifOf = (parent, K, W, H, sd) => K ? window.LH.kasif(el(parent, 'g'), K, W, H, sd) : null;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const D2R = Math.PI / 180;

  const MUD = () => mix(INK.stain, INK.paperDark, 0.35);
  const MUD_D = () => mix(INK.stain, INK.ink, 0.3);
  const MUD_W = () => mix(INK.stain, INK.blue, 0.25);
  const WATER = () => mix(INK.blue, INK.paperLight, 0.55);
  const WATER_D = () => mix(INK.blue, INK.paperLight, 0.3);
  const BONE = () => mix(INK.paperLight, INK.stain, 0.22);
  const BONE_D = () => mix(INK.paperDark, INK.stain, 0.35);
  const FLINT = () => mix(INK.inkSoft, INK.blue, 0.2);
  const FLINT_L = () => mix(INK.inkSoft, INK.paperLight, 0.45);
  const BRONZE = () => mix(INK.gold, INK.stain, 0.35);
  const WOOD = () => mix(mix(INK.gold, INK.red, 0.3), INK.inkSoft, 0.35);      // brown wood from palette tokens
  const WOOD_D = () => mix(mix(INK.gold, INK.red, 0.3), INK.ink, 0.5);
  const REED = () => mix(INK.green, INK.paperDark, 0.2);
  const REED_D = () => mix(INK.green, INK.ink, 0.35);
  const CATTAIL = () => mix(INK.stain, INK.ink, 0.45);
  const GRASS = () => mix(INK.green, INK.paperDark, 0.3);

  // ------------------------------------------------------------------ helpers
  const tf = (pts, x, y, s, rot) => { const c = Math.cos(rot), n = Math.sin(rot); return pts.map(q => [x + (q[0] * c - q[1] * n) * s, y + (q[0] * n + q[1] * c) * s]); };
  // water: wavy top edge at y0 down to the bottom; returns fill + ripple paths
  function water(t, W, H, y0, sd, o = {}) {
    const top = [];
    for (let x = -40; x <= W + 40; x += 60) top.push([x, y0 + Math.sin(x * 0.012 + t * 1.2) * 5]);
    const fill = inkLoop(top.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd, t, amp: 1, smooth: false });
    const R = [], flow = o.flow ?? 40;
    const rows = o.rows ?? 7;
    for (let r = 0; r < rows; r++) {
      const y = y0 + 40 + r * ((H - y0 - 40) / rows), n = 4 + (r % 2);
      for (let i = 0; i < n; i++) {
        const span = W / n, x = ((i * span + hn(r, i) * span + t * flow * (0.6 + r * 0.12)) % (W + 300)) - 150, len = 60 + hn(i, r) * 90 + r * 10;
        R.push(inkPath([[x, y], [x + len * 0.5, y - 5], [x + len, y]], { w: 3 + r * 0.5, seed: sd + r * 20 + i, t, amp: 0.6 }));
      }
    }
    return { fill, ripples: R.join(' ') };
  }
  // cattail reeds: list [{x, y (base), h, n, s}] -> [dark leaves, light leaves, heads]
  function reeds(list, t, sd) {
    const D = [], L = [], C = [];
    list.forEach((q, i) => {
      const n = q.n ?? 6, s = q.s ?? 1;
      for (let k = 0; k < n; k++) {
        const fr = n > 1 ? k / (n - 1) - 0.5 : 0, hh = q.h * (0.65 + hn(i * 7 + k, sd) * 0.45);
        const sway = Math.sin(t * 1.3 + i * 1.7 + k * 0.8) * 16 * s + fr * 60 * s;
        const b = [q.x + fr * 50 * s, q.y], tip = [b[0] + sway + fr * 40 * s, b[1] - hh];
        const mid = [lerp(b[0], tip[0], 0.45) + fr * 10 * s, lerp(b[1], tip[1], 0.5)];
        const leaf = k % 3 === 1;
        const path = inkPath([b, mid, tip], { w: (leaf ? 13 : 7) * s, seed: sd + i * 31 + k, t, amp: 0.8, taper: leaf ? 0.8 : 0.3 });
        (k % 2 ? L : D).push(path);
        if (!leaf && k % 2 === 0) {
          const hx = lerp(mid[0], tip[0], 0.72), hy = lerp(mid[1], tip[1], 0.72), a = Math.atan2(tip[1] - mid[1], tip[0] - mid[0]);
          C.push(inkLoop(tf([[-34, -9], [34, -9], [38, 0], [34, 9], [-34, 9], [-38, 0]], hx, hy, s, a), { seed: sd + i * 31 + k + 500, t, amp: 0.6 }));
        }
      }
    });
    return [D.join(' '), L.join(' '), C.join(' ')];
  }
  function reedSet(parent, sd) {
    const d = inkEl(parent, REED_D()), l = inkEl(parent, REED()), c = inkEl(parent, CATTAIL());
    return { update(t, list) { const [a, b, h] = reeds(list, t, sd); S(d, a); S(l, b); S(c, h); } };
  }
  // the humerus, local units (length 1 along +x; proximal head at -x)
  const BONE_PTS = [[-0.5, -0.02], [-0.485, -0.085], [-0.44, -0.12], [-0.38, -0.115], [-0.34, -0.075], [-0.28, -0.05], [-0.1, -0.04], [0.1, -0.038], [0.28, -0.045],
    [0.38, -0.07], [0.44, -0.09], [0.49, -0.075], [0.505, -0.03], [0.5, 0.02], [0.475, 0.06], [0.445, 0.045], [0.415, 0.07], [0.37, 0.055], [0.3, 0.04], [0.1, 0.036],
    [-0.1, 0.037], [-0.3, 0.045], [-0.38, 0.07], [-0.45, 0.075], [-0.495, 0.035]];
  function bone(parent, sd) {
    const sh = inkEl(parent, MUD_D(), { 'fill-opacity': 0.35 }), f = inkEl(parent, BONE()), dk = inkEl(parent, BONE_D()), r = inkEl(parent), ah = arrowhead(parent, sd + 50);
    return {
      // o: {x, y (centre), L, rot (deg), arrow: 0..1 (shown), at: 0.62 (fraction along from the head), shadow}
      update(t, o) {
        const rot = (o.rot || 0) * D2R, P = tf(BONE_PTS, o.x, o.y, o.L, rot);
        S(sh, o.shadow === false ? '' : inkLoop(tf(BONE_PTS, o.x + 10, o.y + 16, o.L, rot), { seed: sd, t, amp: 1 }));
        S(f, inkLoop(P, { seed: sd + 1, t, amp: 0.8 }));
        S(dk, inkLoop(tf([[-0.3, 0.02], [0.3, 0.018], [0.3, 0.034], [-0.3, 0.038]], o.x, o.y, o.L, rot), { seed: sd + 2, t, amp: 0.5 }) + ' ' +
          inkLoop(tf([[-0.46, -0.06], [-0.4, -0.085], [-0.37, -0.05], [-0.42, -0.03]], o.x, o.y, o.L, rot), { seed: sd + 3, t, amp: 0.4 }));
        S(r, inkPath(P, { w: Math.max(4, o.L * 0.009), seed: sd + 4, t, closed: true, amp: 0.8 }) + ' ' +
          inkPath(tf([[0.39, 0.0], [0.45, 0.01]], o.x, o.y, o.L, rot), { w: 3, seed: sd + 5, t }));
        const fa = o.at ?? 0.62, ax = -0.5 + fa, tip = tf([[ax, -0.012]], o.x, o.y, o.L, rot)[0];
        ah.update(t, { x: tip[0], y: tip[1], s: o.L * (o.ascale ?? 0.2), rot: (o.rot || 0) + 118, p: o.arrow ?? 1, kind: 'flint' });
        return { tip, P };
      },
    };
  }
  // arrowhead, tip at (x, y), pointing along rot (deg); s = length px; kind flint|bronze
  function arrowhead(parent, sd) {
    const f = inkEl(parent, FLINT()), fl = inkEl(parent, FLINT_L()), r = inkEl(parent);
    return {
      update(t, o) {
        if (!(o.p > 0)) { S(f, ''); S(fl, ''); S(r, ''); return; }
        const br = o.kind === 'bronze';
        f.setAttribute('fill', br ? BRONZE() : FLINT()); fl.setAttribute('fill', br ? mix(INK.gold, INK.paperLight, 0.4) : FLINT_L());
        const sc = o.s * lerp(0.4, 1, o.p), a = o.rot * D2R;
        const base = br
          ? [[0, 0], [-0.55, -0.24], [-0.72, -0.22], [-0.66, -0.08], [-1.0, -0.05], [-1.0, 0.05], [-0.66, 0.08], [-0.72, 0.22], [-0.55, 0.24]]
          : [[0, 0], [-0.3, -0.2], [-0.62, -0.3], [-0.7, -0.2], [-0.66, -0.06], [-0.8, -0.02], [-0.8, 0.02], [-0.66, 0.06], [-0.7, 0.2], [-0.62, 0.3], [-0.3, 0.2]];
        const P = tf(base, o.x, o.y, sc, a);
        S(f, inkLoop(P, { seed: sd, t, amp: 0.5, smooth: false }));
        S(fl, br ? inkLoop(tf([[-0.08, -0.02], [-0.5, -0.14], [-0.5, -0.04]], o.x, o.y, sc, a), { seed: sd + 1, t, amp: 0.4, smooth: false })
          : inkLoop(tf([[-0.12, -0.04], [-0.36, -0.15], [-0.5, -0.08], [-0.3, -0.02]], o.x, o.y, sc, a), { seed: sd + 1, t, amp: 0.4, smooth: false }) + ' ' +
            inkLoop(tf([[-0.4, 0.06], [-0.6, 0.18], [-0.62, 0.08]], o.x, o.y, sc, a), { seed: sd + 2, t, amp: 0.4, smooth: false }));
        const facets = br ? [inkPath(tf([[-0.05, 0], [-0.7, 0]], o.x, o.y, sc, a), { w: 3, seed: sd + 3, t, amp: 0.4 })]
          : [0, 1, 2].map(k => inkPath(tf([[-0.18 - k * 0.16, -0.12 - k * 0.04], [-0.24 - k * 0.16, 0.0], [-0.18 - k * 0.16, 0.12 + k * 0.04]], o.x, o.y, sc, a), { w: 2.5, seed: sd + 4 + k, t, amp: 0.4 }));
        S(r, inkPath(P, { w: Math.max(3, sc * 0.03), seed: sd + 9, t, closed: true, amp: 0.5, smooth: false }) + ' ' + facets.join(' '));
      },
    };
  }
  // a skull, front view, centre (x, y), radius R; hole on the upper right (healed-looking ring, no blood)
  function skull(parent, sd) {
    const f = inkEl(parent, BONE()), sh = inkEl(parent, BONE_D()), dk = inkEl(parent, INK.ink), r = inkEl(parent);
    return {
      update(t, o) {
        if (!(o.p > 0)) { [f, sh, dk, r].forEach(e => S(e, '')); return; }
        const R = o.R * lerp(0.3, 1, o.p), x = o.x, y = o.y, rot = (o.rot || 0) * D2R;
        const T = a => tf(a, x, y, R, rot);
        const out = T([[-0.95, -0.15], [-0.85, -0.65], [-0.45, -0.98], [0.05, -1.05], [0.5, -0.95], [0.88, -0.6], [0.96, -0.12], [0.85, 0.3], [0.6, 0.5], [0.52, 0.9], [0.2, 1.0], [-0.2, 1.0], [-0.52, 0.9], [-0.6, 0.5], [-0.85, 0.3]]);
        S(f, inkLoop(out, { seed: sd, t, amp: 0.8 }));
        S(sh, inkLoop(T([[0.55, -0.85], [0.85, -0.5], [0.9, -0.1], [0.75, 0.3], [0.62, -0.2]]), { seed: sd + 1, t, amp: 0.5 }));
        S(dk, inkLoop(T([[-0.62, 0.0], [-0.5, -0.2], [-0.2, -0.18], [-0.14, 0.06], [-0.32, 0.2], [-0.56, 0.16]]), { seed: sd + 2, t, amp: 0.4 }) + ' ' +
          inkLoop(T([[0.62, 0.0], [0.5, -0.2], [0.2, -0.18], [0.14, 0.06], [0.32, 0.2], [0.56, 0.16]]), { seed: sd + 3, t, amp: 0.4 }) + ' ' +
          inkLoop(T([[0, 0.24], [0.1, 0.45], [-0.1, 0.45]]), { seed: sd + 4, t, amp: 0.3, smooth: false }) + ' ' +
          inkLoop(T([[0.28, -0.72], [0.42, -0.78], [0.5, -0.66], [0.4, -0.56], [0.3, -0.6]]), { seed: sd + 5, t, amp: 0.3 }));
        const teeth = [-0.32, -0.16, 0, 0.16, 0.32].map((q, k) => inkPath(T([[q, 0.66], [q, 0.86]]), { w: 3, seed: sd + 10 + k, t, amp: 0.3 }));
        S(r, inkPath(out, { w: Math.max(4, R * 0.04), seed: sd + 6, t, closed: true, amp: 0.8 }) + ' ' + inkPath(T([[-0.42, 0.66], [0.42, 0.66]]), { w: 3, seed: sd + 7, t }) + ' ' +
          inkPath(T([[0.5, -0.6], [0.62, -0.5], [0.7, -0.52]]), { w: 2.5, seed: sd + 8, t }) + ' ' + inkPath(T([[0.3, -0.78], [0.22, -0.9]]), { w: 2.5, seed: sd + 9, t }) + ' ' + teeth.join(' '));
      },
    };
  }
  // wooden club: kind "bat" (tapering ash club) | "mallet" (sloe-wood hammer); handle end at (x, y), rot deg, L px
  function club(parent, sd, kind) {
    const f = inkEl(parent, WOOD()), g = inkEl(parent, WOOD_D()), r = inkEl(parent);
    return {
      update(t, o) {
        if (!(o.p > 0)) { [f, g, r].forEach(e => S(e, '')); return; }
        const L = o.L * lerp(0.4, 1, o.p), a = (o.rot || 0) * D2R;
        const pts = kind === 'mallet'
          ? [[0, -0.03], [0.72, -0.03], [0.72, -0.17], [1.0, -0.17], [1.0, 0.17], [0.72, 0.17], [0.72, 0.03], [0, 0.03]]
          : [[0, -0.028], [0.3, -0.03], [0.6, -0.055], [0.9, -0.075], [1.0, -0.06], [1.02, 0], [1.0, 0.06], [0.9, 0.075], [0.6, 0.055], [0.3, 0.03], [0, 0.028]];
        const P = tf(pts, o.x, o.y, L, a);
        S(f, inkLoop(P, { seed: sd, t, amp: 0.7, smooth: kind !== 'mallet' }));
        const gr = kind === 'mallet' ? [[[0.76, -0.1], [0.96, -0.11]], [[0.76, 0.0], [0.96, 0.01]], [[0.76, 0.1], [0.96, 0.1]]] : [[[0.35, -0.01], [0.95, -0.03]], [[0.5, 0.02], [0.92, 0.04]]];
        S(g, gr.map((q, k) => inkPath(tf(q, o.x, o.y, L, a), { w: 3, seed: sd + 2 + k, t, amp: 0.5 })).join(' '));
        S(r, inkPath(P, { w: 5, seed: sd + 1, t, closed: true, amp: 0.7, smooth: kind !== 'mallet' }));
      },
    };
  }
  // gold pulsing ring
  function ring(parent, sd) {
    const e = inkEl(parent, INK.gold);
    return { update(t, x, y, R, on) { S(e, on > 0 ? inkCircle(x, y, R * (1 + 0.08 * Math.sin(t * 6)), sd, t, { w: 9 }) + ' ' + (on > 0.5 ? inkCircle(x, y, R * (1.25 + 0.3 * ((t * 1.2) % 1)), sd + 1, t, { w: 4 }) : '') : ''); } };
  }
  // ghost army on the horizon: rows of heads, spears and round shields (fill-opacity, no group opacity)
  function ghosts(parent, sd) {
    const e = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0 });
    return {
      update(t, W, y0, p, o = {}) {
        if (p <= 0) { S(e, ''); return; }
        e.setAttribute('fill-opacity', ((o.alpha ?? 0.5) * p).toFixed(3));
        const n = o.n ?? 22, sc = o.s ?? 1, out = [];
        for (let i = 0; i < n; i++) {
          const x = (i + 0.5 + (hn(i, sd) - 0.5) * 0.5) / n * W, rise = (1 - p) * 120 * sc, y = y0 + rise + hn(i, 3) * 14 * sc, bob = Math.sin(t * 2 + i) * 3;
          out.push(inkDot(x, y - 92 * sc + bob, 17 * sc, 17 * sc, sd + i, t));
          out.push(inkPath([[x, y - 74 * sc + bob], [x, y + 20]], { w: 16 * sc, seed: sd + 100 + i, t, amp: 0.5 }));
          const sx = x + (i % 2 ? 22 : -22) * sc;
          out.push(inkPath([[sx, y + 30], [sx + 4 * sc, y - 210 * sc + bob]], { w: 5 * sc, seed: sd + 200 + i, t, amp: 0.5 }));
          out.push(inkLoop([[sx - 8 * sc, y - 200 * sc + bob], [sx + 4 * sc, y - 238 * sc + bob], [sx + 14 * sc, y - 200 * sc + bob]], { seed: sd + 300 + i, t, amp: 0.4, smooth: false }));
          if (i % 2 === 0) out.push(inkDot(x + 16 * sc, y - 40 * sc + bob, 30 * sc, 32 * sc, sd + 400 + i, t));
        }
        S(e, out.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ tol_bank
  SH.tol_bank = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 311, root = el(svg, 'g'), mode = P.mode || 'hook';
      const gy = (P.ground ?? (mode === 'hook' ? 0.52 : 0.6)) * H;
      const gh = ghosts(root, sd + 900);
      const farW = inkEl(root, WATER()), farR = inkEl(root, WATER_D());
      const bank = inkEl(root, MUD()), bankT = inkEl(root, MUD_D()), bankL = inkEl(root), grassE = inkEl(root, GRASS());
      const flag = inkEl(root, INK.red), flagL = inkEl(root);
      const backReeds = reedSet(el(root, 'g'), sd + 10);
      const bn = bone(el(root, 'g'), sd + 40);
      const lump = inkEl(root, mix(INK.stain, INK.inkSoft, 0.45)), lumpL = inkEl(root);
      const rg = ring(root, sd + 60);
      const pG = el(root, 'g');
      const man = mode === 'walk' ? window.LH.person(pG, sd + 70, { kind: 'sweater', col: mix(INK.green, INK.inkSoft, 0.35), hair: 'dark', glasses: false }) : null;
      const K = kasifOf(root, P.kasif, W, H, sd + 80);
      const wE = inkEl(root, WATER()), wR = inkEl(root, WATER_D());
      const frontReeds = reedSet(el(root, 'g'), sd + 90);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // ghost army behind the bank on cue "war"
          const wa = atOr(cues, 'war', null);
          gh.update(t, W, gy - 40, wa == null ? 0 : prog(lt, wa, 1.2), { n: P.ghosts?.n ?? 18, s: P.ghosts?.s ?? 0.9, alpha: P.ghosts?.alpha ?? 0.5 });
          // bank: top edge at gy, mud down to the water line
          const wl = P.water != null ? P.water * H : mode === 'hook' ? 0.8 * H : gy + 0.07 * H;
          const top = []; for (let x = -40; x <= W + 40; x += 90) top.push([x, gy + Math.sin(x * 0.01 + 1.3) * 10 + (mode === 'hook' ? (x / W) * 30 : 0)]);
          S(bank, inkLoop(top.concat([[W + 40, wl + 30], [-40, wl + 30]]), { seed: sd + 1, t, amp: 1, smooth: false }));
          const TX = [];
          for (let i = 0; i < 16; i++) { const y = lerp(gy + 30, wl, hn(i, 1)), x = hn(i, 2) * W; TX.push(inkPath([[x, y], [x + 60 + hn(i, 4) * 80, y + 6]], { w: 4, seed: sd + 100 + i, t, amp: 0.6 })); }
          S(bankT, TX.join(' '));
          S(bankL, inkPath(top, { w: 6, seed: sd + 2, t, amp: 1 }));
          const GR = []; for (let i = 0; i < 26; i++) { const x = (i + hn(i, 5)) / 26 * W, y = gy + Math.sin(x * 0.01 + 1.3) * 10 + (mode === 'hook' ? (x / W) * 30 : 0) + 4; GR.push(inkPath([[x, y], [x + 8 + Math.sin(t * 1.4 + i) * 6, y - 36 - hn(i, 6) * 30]], { w: 6, seed: sd + 200 + i, t, amp: 0.5, taper: 0.8 })); }
          S(grassE, GR.join(' '));
          // the bone
          if (mode === 'hook') {
            const bx = (P.bone?.x ?? 0.6) * W, by = (P.bone?.y ?? 0.655) * H;
            const r = bn.update(t, { x: bx, y: by, L: P.bone?.L ?? 600, rot: -16, arrow: 1, at: 0.63, ascale: 0.22 });
            // mud lump burying the head end
            const kL = (P.bone?.L ?? 600) / 600 * (P.bone?.lump ?? 1), lp = [[-380, 10], [-330, -70], [-240, -44], [-180, 30], [-220, 90], [-340, 92]].map(q => [bx + q[0] * kL, by + q[1] * kL]);
            if (P.bone?.lump === 0) { S(lump, ''); S(lumpL, ''); } else { S(lump, inkLoop(lp, { seed: sd + 3, t, amp: 1 })); S(lumpL, inkPath(lp.slice(0, 4), { w: 5, seed: sd + 4, t, amp: 1 })); }
            const ba = atOr(cues, 'bone', 0.6);
            rg.update(t, r.tip[0] - 20, r.tip[1] - 40, 120, lt >= ba ? 1 : 0);
          } else if (mode === 'walk') {
            const bx = (P.bone?.x ?? 0.7) * W, by = gy + (P.bone?.dy ?? 0.035) * H, BL = P.bone?.L ?? 220;
            const r = bn.update(t, { x: bx, y: by, L: BL, rot: -12, arrow: 1, at: 0.63, ascale: 0.24, shadow: false });
            const kb = BL / 220, lp = [[-140, 6], [-118, -24], [-76, -18], [-56, 14], [-100, 30]].map(q => [bx + q[0] * kb, by + q[1] * kb]);
            S(lump, inkLoop(lp, { seed: sd + 3, t, amp: 0.8 })); S(lumpL, inkPath(lp.slice(0, 4), { w: 4, seed: sd + 4, t, amp: 0.8 }));
            const sp = atOr(cues, 'spot', dur * 0.5);
            rg.update(t, bx + 10, by - 20, 120 * Math.max(1, kb * 0.8), lt >= sp ? 1 : 0);
            // the man walks along the bank, stops and bends to point
            const stopAt = Math.min(sp, dur * 0.6), u = clamp01(lt / Math.max(0.5, stopAt));
            const mg = (P.man?.y ?? (gy / H)) * H, x = lerp((P.man?.x0 ?? 0.14) * W, (P.man?.x ?? 0.47) * W, EASE_IO(u)), walking = u < 1, bob = walking ? Math.abs(Math.sin(lt * 6)) * 8 : 0;
            const bend = walking ? 4 : lerp(4, 24, prog(lt, stopAt, 0.5));
            const pt = prog(lt, stopAt + 0.2, 0.4);
            man.update(t, x, mg + 6 - bob, P.man?.s ?? 1.05, { face: 1, lean: bend, armR: walking ? [x + 40 + Math.sin(lt * 6) * 50, mg - 230] : [lerp(x + 60, bx - 60, pt), lerp(mg - 260, by - 120, pt)], armL: [x - 40 - Math.sin(lt * 6) * 50, mg - 230], brow: walking ? 0 : 0.8, look: walking ? [0, 0] : [4, 10] });
          } else {
            bn.update(t, { x: -999, y: -999, L: 1, arrow: 0 }); S(lump, ''); S(lumpL, ''); rg.update(t, 0, 0, 0, 0);
            // a red dig flag on a stake
            const fx = 0.82 * W, fy = gy + 30, w = Math.sin(t * 3) * 10;
            S(flagL, inkPath([[fx, fy], [fx + 4, fy - 330]], { w: 9, seed: sd + 5, t }));
            S(flag, inkLoop([[fx + 4, fy - 330], [fx + 130, fy - 300 + w], [fx + 4, fy - 250]], { seed: sd + 6, t, amp: 0.8 }));
          }
          // reeds behind the waterline
          backReeds.update(t, mode === 'hook' ? [{ x: 1000, y: wl + 30, h: 420, n: 7 }] : [{ x: 60, y: wl + 20, h: 300, n: 6, s: 0.8 }, { x: 960, y: wl + 20, h: 320, n: 6, s: 0.8 }]);
          // water to the frame bottom
          const wv = water(t, W, H, wl, sd + 7, { flow: 36 });
          S(wE, wv.fill); S(wR, wv.ripples);
          // front reeds in the corners (lower area)
          frontReeds.update(t, mode === 'hook'
            ? [{ x: 70, y: H + 30, h: 720, n: 8, s: 1.3 }, { x: 1020, y: H + 30, h: 560, n: 6, s: 1.2 }]
            : [{ x: 40, y: H + 30, h: 640, n: 8, s: 1.2 }, { x: 560, y: H + 40, h: 300, n: 4, s: 0.9 }, { x: 1050, y: H + 30, h: 600, n: 7, s: 1.2 }]);
          if (K) K.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ tol_bone (close-up in the mud)
  SH.tol_bone = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 521, root = el(svg, 'g');
      const mud = inkEl(root, MUD()), mudT = inkEl(root, MUD_D()), peb = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.3)), pebL = inkEl(root), roots = inkEl(root, WOOD_D());
      const puddle = inkEl(root, WATER(), { 'fill-opacity': 0.8 }), puddleR = inkEl(root, WATER_D());
      const bn = bone(el(root, 'g'), sd + 30);
      const rg = ring(root, sd + 60);
      const lensF = inkEl(root, INK.paperLight, { 'fill-opacity': 0.22 }), lensR = inkEl(root, WOOD_D()), lensH = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 }), lensRim = inkEl(root);
      const wE = inkEl(root, WATER()), wR = inkEl(root, WATER_D());
      const fr = reedSet(el(root, 'g'), sd + 80);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          S(mud, inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd, t, amp: 0.5, smooth: false }));
          const TX = [], PB = [], PL = [];
          for (let i = 0; i < 40; i++) { const x = hn(i, 1) * W, y = 120 + hn(i, 2) * (0.7 * H); TX.push(inkPath([[x, y], [x + 50 + hn(i, 3) * 120, y + 8 - hn(i, 4) * 16]], { w: 4 + hn(i, 5) * 3, seed: sd + 100 + i, t, amp: 0.6 })); }
          for (let i = 0; i < 14; i++) { const x = hn(i, 7) * W, y = 200 + hn(i, 8) * (0.62 * H), r = 14 + hn(i, 9) * 26; PB.push(inkDot(x, y, r, r * 0.7, sd + 200 + i, t)); PL.push(inkCircle(x, y, r, sd + 220 + i, t, { w: 3, ry: r * 0.7 })); }
          S(mudT, TX.join(' ')); S(peb, PB.join(' ')); S(pebL, PL.join(' '));
          S(roots, inkPath([[W + 20, 330], [880, 360], [800, 420], [760, 470]], { w: 9, seed: sd + 5, t, taper: 0.8 }) + ' ' + inkPath([[-20, 1080], [120, 1050], [200, 1000]], { w: 8, seed: sd + 6, t, taper: 0.8 }));
          S(puddle, inkCircle(260, 600, 120, sd + 7, t, { fill: true, ry: 46 })); S(puddleR, inkPath([[190, 592], [240, 588]], { w: 3, seed: sd + 8, t }) + ' ' + inkPath([[270, 612], [330, 608]], { w: 3, seed: sd + 9, t }));
          // the bone, big and diagonal; slow breathing drift
          const dr = Math.sin(lt * 0.6) * 6;
          const r = bn.update(t, { x: 540, y: 900 + dr, L: 940, rot: -22, arrow: 1, at: 0.66, ascale: 0.2 });
          const hit = atOr(cues, 'hit', dur * 0.55);
          rg.update(t, r.tip[0] - 30, r.tip[1] - 70, 150, lt >= hit ? 1 : 0);
          // magnifying glass slides in over the arrowhead
          const la = atOr(cues, 'lens', 0.3), lp = progIO(lt, la, 1.0);
          const cx = lerp(W + 260, r.tip[0] - 40, lp), cy = lerp(r.tip[1] - 320, r.tip[1] - 90, lp), R = 180;
          S(lensF, inkCircle(cx, cy, R, sd + 10, t, { fill: true }));
          S(lensH, inkLoop([[cx - R * 0.6, cy - R * 0.35], [cx - R * 0.35, cy - R * 0.62], [cx - R * 0.25, cy - R * 0.55], [cx - R * 0.5, cy - R * 0.28]], { seed: sd + 11, t, amp: 0.5 }));
          S(lensRim, inkCircle(cx, cy, R, sd + 12, t, { w: 16 }) + ' ' + inkCircle(cx, cy, R - 12, sd + 13, t, { w: 3 }));
          S(lensR, inkPath([[cx + R * 0.68, cy + R * 0.68], [cx + R * 1.6, cy + R * 1.65]], { w: 40, seed: sd + 14, t, taper: 0 }));
          // water edge + reeds in the lower area
          const wv = water(t, W, H, (P.water ?? 0.77) * H, sd + 15, { flow: 30, rows: 6 });
          S(wE, wv.fill); S(wR, wv.ripples);
          fr.update(t, P.reeds || [{ x: 60, y: H + 30, h: 520, n: 7, s: 1.2 }, { x: 1030, y: H + 30, h: 460, n: 6, s: 1.1 }]);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ tol_dig
  SH.tol_dig = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 733, root = el(svg, 'g'), mode0 = P.mode || 'trench';
      const pit = inkEl(root, MUD_D()), pitF = inkEl(root, MUD()), pitT = inkEl(root, mix(INK.stain, INK.ink, 0.2)), pitL = inkEl(root), grid = inkEl(root, INK.paperLight), pegs = inkEl(root, WOOD());
      const findsG = el(root, 'g');
      const smallBones = [0, 1, 2, 3, 4, 5].map(i => bone(el(findsG, 'g'), sd + 100 + i * 20));
      const sk = skull(findsG, sd + 300), sk2 = skull(findsG, sd + 320);
      const cb = club(findsG, sd + 340, 'bat'), cm = club(findsG, sd + 360, 'mallet');
      const ahs = [0, 1, 2].map(i => arrowhead(findsG, sd + 380 + i * 10));
      const rg = ring(root, sd + 400);
      const pG = el(root, 'g');
      const digA = mode0 !== 'finds' ? window.LH.person(el(pG, 'g'), sd + 410, { kind: 'sweater', col: mix(INK.red, INK.paperDark, 0.3), hair: 'dark', glasses: false }) : null;
      const digB = mode0 !== 'finds' ? window.LH.person(el(pG, 'g'), sd + 420, { kind: 'sweater', col: mix(INK.blue, INK.paperDark, 0.2), hair: 'white', glasses: true }) : null;
      const brushes = inkEl(root, WOOD_D()), dustE = inkEl(root, INK.paperDark, { 'fill-opacity': 0.7 });
      const heap = inkEl(root, MUD()), heapT = inkEl(root, MUD_D()), heapL = inkEl(root), shovel = inkEl(root, WOOD()), blade = inkEl(root, mix(INK.inkSoft, INK.blue, 0.3)), shovelL = inkEl(root);
      const bucket = inkEl(root, mix(INK.red, INK.paperDark, 0.2)), bucketL = inkEl(root), trowel = inkEl(root, mix(INK.inkSoft, INK.blue, 0.3)), trowelH = inkEl(root, WOOD()), trowelL = inkEl(root);
      const tagF = inkEl(root, INK.paperLight), tagL = inkEl(root);
      const tagT = el(root, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, 'font-size': 46, fill: INK.ink });
      const grassG = window.SB.grass(el(root, 'g'), sd + 500, mode0 !== 'finds' ? [{ x: 60, y: H + 20, s: 1.4, n: 6 }, { x: 330, y: H + 10, s: 1.0, n: 5 }, { x: 1010, y: H + 20, s: 1.4, n: 6 }] : [{ x: 40, y: H + 20, s: 1.2, n: 5 }, { x: 1040, y: H + 20, s: 1.2, n: 5 }]);
      // counter card
      const cardG = el(root, 'g'), card = inkEl(cardG, INK.paperLight), cardR = inkEl(cardG);
      const cnt = el(cardG, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, 'font-size': 150, fill: INK.red });
      const cntL = el(cardG, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, 'font-size': 60, fill: INK.ink, 'letter-spacing': 4 });
      cntL.textContent = P.count_label || 'PEOPLE';
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const mode = mode0 === 'dig' ? (lt < atOr(cues, 'finds', dur * 0.35) ? 'trench' : 'finds') : mode0;
          pG.style.display = mode === 'trench' ? '' : 'none';
          if (mode === 'trench') {
            // pit trapezoid: back edge y 0.53H, front edge y 0.8H
            const bY = 0.53 * H, fY = 0.8 * H, bx0 = 0.1 * W, bx1 = 0.9 * W, fx0 = -0.02 * W, fx1 = 1.02 * W, depth = 70;
            const PT = [[bx0, bY], [bx1, bY], [fx1, fY], [fx0, fY]];
            S(pit, inkLoop(PT, { seed: sd + 1, t, amp: 0.8, smooth: false }));
            S(pitF, inkLoop([[bx0 + 10, bY + depth], [bx1 - 10, bY + depth], [fx1 - 20, fY], [fx0 + 20, fY]], { seed: sd + 2, t, amp: 0.8, smooth: false }));
            const TX = []; for (let i = 0; i < 22; i++) { const v = hn(i, 1), y = lerp(bY + depth + 20, fY - 20, v), x = lerp(lerp(bx0, fx0, v), lerp(bx1, fx1, v), hn(i, 2)); TX.push(inkPath([[x, y], [x + 50 + hn(i, 3) * 60, y + 4]], { w: 3.5, seed: sd + 20 + i, t, amp: 0.5 })); }
            S(pitT, TX.join(' '));
            S(pitL, inkPath(PT, { w: 6, seed: sd + 3, t, closed: true, smooth: false, amp: 0.8 }) + ' ' + inkPath([[bx0 + 10, bY + depth], [bx1 - 10, bY + depth]], { w: 4, seed: sd + 4, t, amp: 0.6 }));
            // string grid
            const G = [];
            for (let k = 1; k < 4; k++) { const u = k / 4; G.push(inkPath([[lerp(bx0, bx1, u), bY + depth], [lerp(fx0, fx1, u), fY]], { w: 2.5, seed: sd + 40 + k, t, amp: 0.5 })); }
            for (let k = 1; k < 3; k++) { const v = k / 3, y = lerp(bY + depth, fY, v); G.push(inkPath([[lerp(bx0, fx0, v) + 10, y], [lerp(bx1, fx1, v) - 10, y]], { w: 2.5, seed: sd + 50 + k, t, amp: 0.5 })); }
            S(grid, G.join(' '));
            S(pegs, [0, 0.25, 0.5, 0.75, 1].map((u, k) => inkLoop([[lerp(bx0, bx1, u) - 7, bY - 40], [lerp(bx0, bx1, u) + 7, bY - 40], [lerp(bx0, bx1, u) + 5, bY + 8], [lerp(bx0, bx1, u) - 5, bY + 8]], { seed: sd + 60 + k, t, amp: 0.4, smooth: false })).join(' '));
            // bones surface one by one
            const da = atOr(cues, 'dig', 0.3);
            const SP = [[0.24, 0.63, -8], [0.5, 0.6, 14], [0.74, 0.65, -20], [0.34, 0.73, 22], [0.62, 0.74, -4], [0.86, 0.73, 10]];
            smallBones.forEach((b, i) => { const p = spring(lt, da + i * 0.22, 0.5); b.update(t, { x: SP[i][0] * W, y: SP[i][1] * H, L: p > 0 ? 150 + (i % 3) * 30 : 1, rot: SP[i][2], arrow: i === 1 ? p : 0, ascale: 0.3, shadow: false }); });
            sk.update(t, { x: 0.16 * W, y: 0.69 * H, R: 52, p: spring(lt, da + 0.5, 0.5), rot: -10 });
            sk2.update(t, { p: 0 }); cb.update(t, { p: 0 }); cm.update(t, { p: 0 }); ahs.forEach(a => a.update(t, { p: 0 }));
            rg.update(t, 0, 0, 0, 0);
            // two archaeologists kneel at the back edge and brush
            const br = Math.sin(lt * 7);
            const a = digA.update(t, 0.3 * W, bY + 10, 0.85, { face: 1, seat: bY - 60, lean: 30, armR: [0.3 * W + 150 + br * 30, bY + 50], armL: [0.3 * W + 110, bY + 20], brow: 0.3, look: [4, 10] });
            const b = digB.update(t, 0.7 * W, bY + 10, 0.85, { face: -1, seat: bY - 60, lean: 26, armR: [0.7 * W - 150 - br * 26, bY + 56], armL: [0.7 * W - 100, bY + 24], brow: 0.4, look: [4, 10] });
            S(brushes, inkPath([a.hR, [a.hR[0] + 44, a.hR[1] + 30]], { w: 9, seed: sd + 70, t }) + ' ' + inkPath([b.hR, [b.hR[0] - 44, b.hR[1] + 30]], { w: 9, seed: sd + 71, t }));
            const DU = []; for (let i = 0; i < 6; i++) { const ph = (lt * 1.6 + i / 6) % 1; DU.push(inkDot(a.hR[0] + 50 + ph * 40, a.hR[1] + 30 - ph * 60, 10 + ph * 14, 8 + ph * 10, sd + 80 + i, t)); DU.push(inkDot(b.hR[0] - 50 - ph * 40, b.hR[1] + 30 - ph * 60, 10 + ph * 14, 8 + ph * 10, sd + 90 + i, t)); }
            S(dustE, DU.join(' '));
            // spoil heap, shovel and bucket in front (lower area)
            const HP = [[-40, H + 40], [-40, 0.84 * H], [140, 0.8 * H], [380, 0.835 * H], [600, 0.86 * H], [820, 0.83 * H], [1000, 0.81 * H], [W + 40, 0.83 * H], [W + 40, H + 40]];
            S(heap, inkLoop(HP, { seed: sd + 5, t, amp: 1 })); S(heapL, inkPath(HP.slice(1, 8), { w: 6, seed: sd + 6, t, amp: 1 }));
            const HT = []; for (let i = 0; i < 18; i++) { const x = hn(i, 11) * W, y = 0.86 * H + hn(i, 12) * 0.12 * H; HT.push(inkPath([[x, y], [x + 40 + hn(i, 13) * 70, y + 5]], { w: 4, seed: sd + 120 + i, t, amp: 0.5 })); }
            S(heapT, HT.join(' '));
            const sx = 0.22 * W, sy = 0.86 * H;
            S(shovel, inkPath([[sx, sy], [sx - 40, sy - 380]], { w: 18, seed: sd + 7, t, taper: 0 }) + ' ' + inkPath([[sx - 70, sy - 390], [sx - 10, sy - 380]], { w: 14, seed: sd + 8, t, taper: 0 }));
            const BL = [[sx - 50, sy - 10], [sx + 50, sy - 6], [sx + 44, sy + 90], [sx, sy + 130], [sx - 44, sy + 86]];
            S(blade, inkLoop(BL, { seed: sd + 9, t, amp: 0.6 })); S(shovelL, inkPath(BL, { w: 5, seed: sd + 10, t, closed: true, amp: 0.6 }));
            const kx = 0.8 * W, ky = 0.88 * H, BK = [[kx - 90, ky - 150], [kx + 90, ky - 150], [kx + 70, ky + 20], [kx - 70, ky + 20]];
            S(bucket, inkLoop(BK, { seed: sd + 11, t, amp: 0.6, smooth: false }));
            S(bucketL, inkPath(BK, { w: 6, seed: sd + 12, t, closed: true, amp: 0.6, smooth: false }) + ' ' + inkPath([[kx - 90, ky - 150], [kx - 40, ky - 230], [kx + 40, ky - 230], [kx + 90, ky - 150]], { w: 5, seed: sd + 13, t }));
            [trowel, trowelH, trowelL, tagF, tagL].forEach(e => S(e, '')); tagT.textContent = '';
            cardG.setAttribute('transform', 'scale(0)');
          } else {
            // close on the pit floor: mud fills the frame, string grid, finds appear
            S(pit, inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 1, t, amp: 0.5, smooth: false }));
            S(pitF, '');
            const TX = []; for (let i = 0; i < 36; i++) { const x = hn(i, 1) * W, y = 140 + hn(i, 2) * (H - 140); TX.push(inkPath([[x, y], [x + 60 + hn(i, 3) * 90, y + 6]], { w: 4, seed: sd + 20 + i, t, amp: 0.5 })); }
            pitT.setAttribute('fill', MUD()); S(pitT, TX.join(' ')); S(pitL, '');
            S(grid, [inkPath([[0.5 * W, -20], [0.5 * W + 10, H + 20]], { w: 3, seed: sd + 40, t, amp: 0.5 }), inkPath([[-20, 0.42 * H], [W + 20, 0.42 * H - 10]], { w: 3, seed: sd + 41, t, amp: 0.5 }), inkPath([[-20, 0.77 * H], [W + 20, 0.77 * H + 8]], { w: 3, seed: sd + 42, t, amp: 0.5 })].join(' '));
            S(pegs, '');
            const sa = atOr(cues, 'skulls', 0.3), ca = atOr(cues, 'clubs', sa + 0.9), na = atOr(cues, 'count', ca + 1.0);
            const drift = Math.sin(lt * 0.7) * 5;
            sk.update(t, { x: 0.3 * W, y: 0.27 * H + drift, R: 135, p: spring(lt, sa, 0.55), rot: -8 });
            sk2.update(t, { x: 0.76 * W, y: 0.3 * H - drift, R: 95, p: spring(lt, sa + 0.25, 0.55), rot: 12 });
            cb.update(t, { x: 0.08 * W, y: 0.47 * H, L: 620, rot: -6, p: spring(lt, ca, 0.55) });
            cm.update(t, { x: 0.12 * W, y: 0.55 * H + drift, L: 460, rot: 4, p: spring(lt, ca + 0.25, 0.55) });
            ahs.forEach((a, i) => a.update(t, { x: [0.74, 0.86, 0.8][i] * W, y: [0.45, 0.5, 0.56][i] * H, s: 110, rot: [-70, -100, -84][i], p: spring(lt, ca + 0.5 + i * 0.15, 0.5), kind: i === 1 ? 'flint' : 'bronze' }));
            smallBones.forEach((b, i) => { if (i > 1) { b.update(t, { x: -999, y: -999, L: 1, arrow: 0 }); return; } const p = spring(lt, sa + 0.4 + i * 0.3, 0.5); b.update(t, { x: [0.3, 0.72][i] * W, y: [0.84, 0.88][i] * H, L: p > 0 ? 360 : 1, rot: [8, -12][i], arrow: 0, shadow: false }); });
            rg.update(t, 0.3 * W + 48, 0.27 * H - 80 + drift, 62, lt >= sa + 0.3 ? 1 : 0);
            // trowel + find tag in the lower area
            const tx = 0.62 * W, ty = 0.95 * H;
            S(trowel, inkLoop([[tx, ty], [tx + 190, ty - 60], [tx + 230, ty - 20], [tx + 50, ty + 40]], { seed: sd + 14, t, amp: 0.6, smooth: false }));
            S(trowelH, inkPath([[tx - 20, ty + 10], [tx - 180, ty + 60]], { w: 34, seed: sd + 15, t, taper: 0 }));
            S(trowelL, inkPath([[tx, ty], [tx + 190, ty - 60], [tx + 230, ty - 20], [tx + 50, ty + 40]], { w: 4, seed: sd + 16, t, closed: true, smooth: false }));
            const gx = 0.17 * W, gy2 = 0.93 * H, TG = [[gx - 110, gy2 - 60], [gx + 110, gy2 - 64], [gx + 112, gy2 + 34], [gx - 108, gy2 + 38]];
            S(tagF, inkLoop(TG, { seed: sd + 17, t, amp: 0.6, smooth: false })); S(tagL, inkPath(TG, { w: 4, seed: sd + 18, t, closed: true, smooth: false }));
            tagT.setAttribute('x', f1(gx)); tagT.setAttribute('y', f1(gy2 + 10)); tagT.textContent = P.tag || 'FIND 1996';
            [brushes, dustE, heap, heapT, heapL, shovel, blade, shovelL, bucket, bucketL].forEach(e => S(e, ''));
            // counter card rolls up
            const n0 = na - 0.55, cp = spring(lt, n0, 0.4);
            if (lt < n0) cardG.setAttribute('transform', 'scale(0)');
            else {
              const cx = 0.58 * W, cy = 0.76 * H, n = Math.round((P.count ?? 150) * progIO(lt, n0, 0.55));
              cardG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(-3 + Math.sin(t * 2) * 1)}) scale(${f1(cp * 1000) / 1000})`);
              const CB = [[-250, -170], [250, -176], [256, 120], [-246, 126]];
              S(card, inkLoop(CB, { seed: sd + 19, t, amp: 0.8, smooth: false })); S(cardR, inkPath(CB, { w: 6, seed: sd + 20, t, closed: true, smooth: false }));
              cnt.setAttribute('x', 0); cnt.setAttribute('y', 6); cnt.textContent = (P.prefix ?? '≈') + n;
              cntL.setAttribute('x', 0); cntL.setAttribute('y', 92);
            }
          }
          grassG.update(t);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ tol_valley (the causeway, c. 1250 BC)
  SH.tol_valley = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 947, root = el(svg, 'g'), mode = P.mode || 'then';
      const fy = 0.5 * H, ny = (P.near ?? 0.74) * H;                 // far bank / near bank
      const gh = ghosts(root, sd + 10);
      const farBank = inkEl(root, GRASS()), farL = inkEl(root);
      const riv = inkEl(root, WATER()), rivR = inkEl(root, WATER_D());
      const posts = inkEl(root, WOOD_D()), deck = inkEl(root, WOOD()), deckL = inkEl(root);
      const nearBank = inkEl(root, mix(INK.green, INK.paperDark, 0.45)), nearL = inkEl(root), nearT = inkEl(root, GRASS());
      const dust = window.SB.dust(el(root, 'g'), sd + 160);
      const warG = el(root, 'g');
      const arrowsG = el(root, 'g'), arrows = [0, 1, 2, 3, 4, 5].map(i => window.SB.arrow(arrowsG, sd + 100 + i * 7));
      // cast
      const mk = (K, i) => window.SB.warrior(warG, Object.assign({ helmet: false, sway: 1 }, K), sd + 200 + i * 13);
      let cast = [];
      if (mode === 'then') {
        cast = [mk({ x: 0.48, y: 0.535, scale: 0.26, face: 'left', pose: 'walk', shield: false, move: { at: 0, to: 0.5, dur: 6 } }, 0),
          mk({ x: 0.52, y: 0.57, scale: 0.3, face: 'left', pose: 'walk', shield: false, spear: true, spear_rot: -6, move: { at: 0.2, to: 0.5, dur: 6 } }, 1)];
      } else if (mode === 'clash') {
        const B = (x, y, s, i, o = {}) => mk(Object.assign({ x, y, scale: s, face: 'right', side: 'eng', shield: 'round', spear: true, pose: 'idle', emotion: 'angry' }, o), i);
        const R = (x, y, s, i, o = {}) => mk(Object.assign({ x, y, scale: s, face: 'left', side: 'nor', shield: 'round', spear: true, pose: 'idle', emotion: 'angry' }, o), i);
        cast = [
          R(0.5, 0.56, 0.24, 10, { move: { at: 0, to: 0.49, dur: 3, run: true } }), R(0.47, 0.6, 0.28, 11, { move: { at: 0.2, to: 0.48, dur: 3, run: true } }),
          R(0.55, 0.63, 0.32, 12, { move: { at: 0.1, to: 0.53, dur: 3, run: true } }), R(0.5, 0.68, 0.38, 13, { stagger: 'hit' }),
          B(0.08, 0.86, 0.62, 20, { move: { at: 0, to: 0.18, dur: 2.5, run: true } }), B(0.3, 0.8, 0.54, 21, { seq: [{ at: 'hit', pose: 'point', dir: 40, face: 'right' }] }),
          B(0.82, 0.84, 0.6, 22, { face: 'left', move: { at: 0.1, to: 0.72, dur: 2.5, run: true } }),
        ];
      }
      const ys = el(root, 'g'), yCard = inkEl(ys, INK.paperLight), yCardR = inkEl(ys);
      const yT = el(ys, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, 'font-size': 110, fill: INK.ink });
      const fr = reedSet(el(root, 'g'), sd + 300);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // far bank and the hills crowd
          const ca = atOr(cues, 'crowd', null);
          const ga = atOr(cues, 'ghost', 0.4);
          gh.update(t, W, fy - 20, mode === 'clash' && ca != null ? prog(lt, ca, 1.0) : mode === 'today' ? prog(lt, ga, 1.0) * (1 - 0.85 * prog(lt, atOr(cues, 'fade', ga + 2), 1.2)) : 0, { n: 26, s: 0.55, alpha: P.ghost_alpha ?? 0.5 });
          const FB = []; for (let x = -40; x <= W + 40; x += 90) FB.push([x, fy + Math.sin(x * 0.008) * 8]);
          S(farBank, inkLoop(FB.concat([[W + 40, fy + 60], [-40, fy + 60]]), { seed: sd + 1, t, amp: 1, smooth: false }));
          S(farL, inkPath(FB, { w: 5, seed: sd + 2, t, amp: 1 }));
          // river band
          const top = []; for (let x = -40; x <= W + 40; x += 60) top.push([x, fy + 50 + Math.sin(x * 0.01 + t) * 4]);
          const bot = []; for (let x = W + 40; x >= -40; x -= 60) bot.push([x, ny + 20 + Math.sin(x * 0.009 + 2) * 10]);
          S(riv, inkLoop(top.concat(bot), { seed: sd + 3, t, amp: 0.8, smooth: false }));
          const RR = []; for (let r = 0; r < 5; r++) { const y = lerp(fy + 80, ny, r / 5); for (let i = 0; i < 5; i++) { const x = ((i * 240 + hn(r, i) * 200 + t * (30 + r * 10)) % (W + 300)) - 150, L = 40 + r * 20; RR.push(inkPath([[x, y], [x + L / 2, y - 4], [x + L, y]], { w: 2.5 + r * 0.6, seed: sd + 20 + r * 7 + i, t, amp: 0.5 })); } }
          S(rivR, RR.join(' '));
          // causeway in perspective: far (narrow) at fy+40, near (wide) at ny+60
          const cx = 0.5 * W, fw = 70, nw = 300, yA = fy + 40, yB = ny + 70;
          const DK = [[cx - fw, yA], [cx + fw, yA], [cx + nw, yB], [cx - nw, yB]];
          const today = mode === 'today';
          S(deck, today ? '' : inkLoop(DK, { seed: sd + 4, t, amp: 0.6, smooth: false }));
          const PL = [inkPath(DK, { w: 5, seed: sd + 5, t, closed: true, smooth: false, amp: 0.6 })];
          for (let k = 1; k < 14; k++) { const v = Math.pow(k / 14, 1.5), y = lerp(yA, yB, v), hw = lerp(fw, nw, v); PL.push(inkPath([[cx - hw, y], [cx + hw, y]], { w: 2 + v * 3, seed: sd + 40 + k, t, amp: 0.4 })); }
          S(deckL, today ? '' : PL.join(' '));
          const PS = []; for (let k = 0; k <= 7; k++) { const v = Math.pow(k / 7, 1.4), y = lerp(yA, yB, v), hw = lerp(fw, nw, v) + 8, h = lerp(30, 110, v) * (today ? 0.5 : 1), w = lerp(6, 18, v); for (const sgn of [-1, 1]) PS.push(inkPath([[cx + sgn * hw, y - h * (today ? 0.05 : 0.5)], [cx + sgn * hw, y + h * 0.6]], { w, seed: sd + 60 + k * 2 + (sgn > 0), t, taper: 0, amp: 0.5 })); }
          // today: big rotted stumps standing out of the water in the foreground
          if (today) (P.stumps || []).forEach((q, k) => {
            const x = q[0] * W, y = q[1] * H, h = q[2] ?? 140, w = q[3] ?? 34, lean = Math.sin(k * 2.1) * 8, bob = Math.sin(t * 1.4 + k) * 2;
            PS.push(inkLoop([[x - w, y + bob], [x - w * 0.9 + lean * 0.5, y - h * 0.7], [x - w * 0.4 + lean, y - h], [x + w * 0.1 + lean, y - h * 0.82], [x + w * 0.5 + lean, y - h * 0.96], [x + w * 0.95, y - h * 0.6], [x + w, y + bob]], { seed: sd + 600 + k, t, amp: 0.8, smooth: false }));
            PS.push(inkPath([[x - w * 1.5, y + 6 + bob], [x - w * 0.5, y + 2 + bob]], { w: 4, seed: sd + 620 + k, t }), inkPath([[x + w * 0.5, y + 3 + bob], [x + w * 1.6, y + 7 + bob]], { w: 4, seed: sd + 640 + k, t }));
          });
          S(posts, PS.join(' '));
          // near bank down to the frame bottom
          const NB = []; for (let x = -40; x <= W + 40; x += 90) NB.push([x, ny + 40 + Math.sin(x * 0.012 + 0.7) * 14 + (Math.abs(x - cx) < nw + 40 ? 30 : 0)]);
          S(nearBank, inkLoop(NB.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 6, t, amp: 1, smooth: false }));
          S(nearL, inkPath(NB, { w: 6, seed: sd + 7, t, amp: 1 }));
          const NT = []; for (let i = 0; i < 30; i++) { const x = hn(i, 1) * W, y = ny + 120 + hn(i, 2) * (H - ny - 120); NT.push(inkPath([[x, y], [x + 6 + Math.sin(t * 1.5 + i) * 5, y - 30 - hn(i, 3) * 26]], { w: 6, seed: sd + 80 + i, t, taper: 0.8, amp: 0.5 })); }
          S(nearT, NT.join(' '));
          // cast + arrows + dust
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (mode === 'clash') {
            arrows.forEach((a, i) => {
              const per = 1.6, ph = ((lt + i * 0.37) % per) / per, from = [[0.9, 0.5], [0.15, 0.82], [0.85, 0.48], [0.1, 0.84], [0.95, 0.52], [0.2, 0.8]][i], to = [[0.3, 0.8], [0.5, 0.62], [0.12, 0.88], [0.56, 0.6], [0.36, 0.86], [0.46, 0.66]][i];
              a.update(t, [from[0] * W, from[1] * H], [to[0] * W, to[1] * H], lt > 0.3 ? ph : 0, 260);
            });
            dust.update(t, { x: 0.45 * W, y: ny + 60, w: 520, h: 200, p: prog(lt, 0.4, 2) });
          } else { arrows.forEach(a => a.update(t, [0, 0], [0, 0], 0)); dust.update(t, { x: 0, y: 0, w: 1, h: 1, p: 0 }); }
          // year counter (then)
          if (mode === 'then') {
            const ya = atOr(cues, 'years', 0.3), yp = progIO(lt, ya, 1.6), v = Math.round(lerp(P.from ?? 2026, P.to ?? -1250, yp));
            const s = spring(lt, Math.max(0, ya - 0.4), 0.5);
            ys.setAttribute('transform', `translate(${f1(0.64 * W)} ${f1(0.2 * H)}) rotate(${f1(-3 + Math.sin(t * 2))}) scale(${f1(s * 1000) / 1000})`);
            const CB = [[-300, -110], [300, -116], [306, 50], [-296, 56]];
            S(yCard, inkLoop(CB, { seed: sd + 8, t, amp: 0.8, smooth: false })); S(yCardR, inkPath(CB, { w: 6, seed: sd + 9, t, closed: true, smooth: false }));
            yT.setAttribute('x', 0); yT.setAttribute('y', 18); yT.textContent = v > 0 ? `${v} AD` : v === 0 ? '1 BC' : `${-v} BC`;
            yT.setAttribute('fill', yp >= 1 ? INK.red : INK.ink);
          } else ys.setAttribute('transform', 'scale(0)');
          fr.update(t, [{ x: 50, y: H + 30, h: 640, n: 8, s: 1.25 }, { x: 1040, y: H + 30, h: 600, n: 7, s: 1.2 }]);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ tol_map (Central Europe, full frame)
  SH.tol_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 163, root = el(svg, 'g');
      // lon/lat -> px: lat 57 at the top, 37.5 at the bottom; lon centre 12.5
      const ky = H / 19.5, kx = ky * Math.cos(52 * D2R);
      const X = q => [W / 2 + (q[0] - 12.5) * kx, (57 - q[1]) * ky];
      const SEA = inkEl(root, mix(INK.paperLight, INK.blue, 0.18));
      const waves = inkEl(root, mix(INK.blue, INK.paperLight, 0.35));
      const landE = inkEl(root, INK.paperDark), landL = inkEl(root, INK.inkSoft);
      const rivE = inkEl(root, mix(INK.blue, INK.inkSoft, 0.3));
      const mtnF = inkEl(root, INK.paper), mtnL = inkEl(root);
      const grat = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.35 });
      const routeE = inkEl(root, INK.red);
      const ahs = [arrowhead(root, sd + 300), arrowhead(root, sd + 320)];
      const sw = inkEl(root, INK.ink), swR = inkEl(root, INK.red), rg = ring(root, sd + 340);
      const T = (txt, size, fill, extra = {}) => { const e = el(root, 'text', Object.assign({ 'text-anchor': 'middle', 'font-family': INK_FONT, 'font-size': size, fill, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` }, extra)); e.textContent = txt; return e; };
      const NAMES = [
        { t: 'Baltic Sea', q: [17.6, 55.6], s: 54, c: INK.inkSoft },
        { t: 'ALPS', q: [10.2, 46.2], s: 50, c: INK.inkSoft },
        { t: 'Mediterranean', q: [10.0, 39.6], s: 50, c: INK.inkSoft },
      ].map(n => ({ n, e: T(n.t, n.s, n.c) }));
      const big = [
        { t: 'TOLLENSE', q: [13.3, 52.75], s: 64, c: INK.red, at: 0.2 }, { t: 'BAVARIA', q: [10.6, 48.9], s: 58, c: INK.ink, at: 0.5 }, { t: 'MORAVIA', q: [17.0, 49.75], s: 58, c: INK.ink, at: 0.7 },
      ].map(n => ({ n, e: T(n.t, n.s, n.c, { 'font-family': SERIF, 'font-weight': 900 }) }));
      const L = (a) => a.map(X);
      const LAND = [
        [[3.0, 51.2], [4.5, 52.5], [5.0, 53.4], [7.0, 53.6], [8.5, 53.9], [9.0, 54.8], [8.2, 55.5], [8.1, 56.6], [8.6, 57.2], [10.5, 57.8], [10.3, 56.5], [10.9, 56.3], [9.9, 55.2], [10.7, 54.4],
          [11.0, 54.0], [12.2, 54.2], [13.4, 54.6], [14.2, 53.9], [15.5, 54.2], [17.0, 54.6], [18.5, 54.8], [19.5, 54.4], [21.0, 55.0], [23.0, 55.2], [23.0, 41.0], [19.6, 41.6],
          [18.5, 42.5], [16.0, 43.5], [14.5, 45.2], [13.7, 45.7], [12.3, 45.4], [12.4, 44.2], [13.9, 42.6], [16.0, 41.4], [18.5, 40.1], [17.0, 39.0], [16.5, 38.0], [15.6, 38.0],
          [15.8, 40.0], [14.2, 40.8], [12.4, 41.7], [10.5, 43.0], [8.9, 44.4], [7.5, 43.8], [6.8, 43.2], [4.0, 43.5], [2.0, 43.2], [2.0, 51.2]],
        [[11.9, 57.8], [12.5, 56.2], [12.9, 55.4], [14.2, 55.4], [14.6, 56.2], [16.5, 56.3], [16.6, 57.8]],
        [[11.0, 55.3], [12.6, 55.6], [12.3, 56.1], [11.0, 55.9]],
        [[9.2, 43.0], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]], [[8.2, 41.2], [9.8, 41.0], [9.6, 39.1], [8.4, 38.9]], [[12.4, 38.1], [15.6, 38.2], [15.1, 36.7], [12.6, 37.6]],
      ];
      const RIV = [[[8.5, 48.0], [10.0, 48.7], [12.1, 49.0], [13.5, 48.6], [16.4, 48.2], [18.0, 47.7], [19.0, 47.4], [19.0, 45.6], [21.0, 44.8]],
        [[14.2, 50.6], [12.2, 51.8], [10.8, 53.2], [9.0, 53.9]], [[17.6, 50.1], [15.8, 51.6], [14.6, 52.6], [14.3, 53.6]], [[13.2, 53.55], [13.4, 53.85], [13.6, 54.0]]];
      const MT = [[6.8, 46.4], [8.2, 46.7], [9.6, 46.6], [11.0, 47.0], [12.4, 47.1], [13.8, 47.2], [15.0, 47.4]];
      const RT = [[[11.4, 48.7], [11.0, 50.2], [12.0, 51.6], [12.9, 52.8], [13.3, 53.5]], [[16.8, 49.3], [16.0, 50.6], [14.6, 52.0], [13.6, 53.1], [13.35, 53.5]]];
      const LB = labels(root, P.labels, W, H);
      const dashOn = (pts, p, t, s0) => {
        const out = []; const n = pts.length - 1, upto = p * n;
        const dense = []; for (let i = 0; i < n; i++) for (let k = 0; k < 10; k++) { const u = k / 10; dense.push([lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]); }
        dense.push(pts[n]);
        const m = Math.floor(p * (dense.length - 1));
        for (let i = 0; i < m; i += 2) out.push(inkPath([dense[i], dense[Math.min(m, i + 1)]], { w: 9, seed: s0 + i, t, amp: 0.5 }));
        const tip = dense[Math.max(0, m)], nx = dense[Math.min(dense.length - 1, m + 1)];
        return { d: out.join(' '), tip, ang: Math.atan2(nx[1] - tip[1], nx[0] - tip[0]) / D2R, upto };
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          S(SEA, inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd, t, amp: 0.5, smooth: false }));
          const WV = []; [[6, 56.2], [16, 56.8], [19.5, 55.8], [4.5, 54.3], [9, 40.5], [11.5, 39], [6, 41], [17.5, 41.8], [14, 39.6]].forEach((q, i) => { const p = X(q), dx = Math.sin(t * 1.2 + i) * 6; WV.push(inkPath([[p[0] - 40 + dx, p[1]], [p[0] - 20 + dx, p[1] - 8], [p[0] + dx, p[1]], [p[0] + 20 + dx, p[1] - 8], [p[0] + 40 + dx, p[1]]], { w: 3, seed: sd + 10 + i, t, amp: 0.5 })); });
          S(waves, WV.join(' '));
          S(landE, LAND.map((a, i) => inkLoop(L(a), { seed: sd + 20 + i, t, amp: 1, smooth: false })).join(' '));
          S(landL, LAND.map((a, i) => inkPath(L(a), { w: 4, seed: sd + 40 + i, t, closed: true, amp: 1, smooth: false })).join(' '));
          S(rivE, RIV.map((a, i) => inkPath(L(a), { w: i === 3 ? 6 : 5, seed: sd + 60 + i, t, amp: 0.8 })).join(' '));
          const MF = [], ML = [];
          MT.forEach((q, i) => { const p = X(q), s = 62 + (i % 2) * 18, tri = [[p[0] - s, p[1] + s * 0.5], [p[0], p[1] - s * 0.7], [p[0] + s, p[1] + s * 0.5]]; MF.push(inkLoop(tri, { seed: sd + 80 + i, t, amp: 0.8, smooth: false })); ML.push(inkPath(tri, { w: 5, seed: sd + 90 + i, t, amp: 0.8 }), inkPath([[p[0] - s * 0.25, p[1] - s * 0.3], [p[0], p[1] - s * 0.05], [p[0] + s * 0.2, p[1] - s * 0.35]], { w: 3, seed: sd + 100 + i, t })); });
          S(mtnF, MF.join(' ')); S(mtnL, ML.join(' '));
          const GR = []; for (let k = 1; k < 6; k++) { const x = k / 6 * W; for (let y = 300; y < H; y += 60) GR.push(inkDot(x, y, 2.5, 2.5, sd + 120 + k * 50 + y, t)); }
          S(grat, GR.join(' '));
          NAMES.forEach(({ n, e }) => { const p = X(n.q); e.setAttribute('x', f1(p[0])); e.setAttribute('y', f1(p[1])); });
          big.forEach(({ n, e }) => {
            const p = X(n.q), at = atOr(cues, n.at, n.at), s = spring(lt, at, 0.5);
            e.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1])}) scale(${f1(s * 1000) / 1000})`); e.setAttribute('x', 0); e.setAttribute('y', 0);
          });
          // routes with travelling arrowheads
          const ra = atOr(cues, 'route', 0.9), rp = progIO(lt, ra, 2.2);
          let D = '';
          RT.forEach((r, i) => {
            const o = dashOn(L(r), clamp01(rp - i * 0.08) / (1 - i * 0.08) || 0, t, sd + 200 + i * 60);
            D += o.d + ' ';
            const pp = clamp01((rp - i * 0.08) / (1 - i * 0.08));
            ahs[i].update(t, { x: o.tip[0], y: o.tip[1], s: 78, rot: o.ang, p: pp > 0 && pp < 1 ? 1 : 0, kind: i ? 'flint' : 'bronze' });
          });
          S(routeE, D);
          // crossed swords at the Tollense
          const tp = X([13.3, 53.6]), arr = lt >= ra + 2.2, pk = 1 + 0.15 * punch(lt, ra + 2.2, 0.6);
          const sA = [[-46, -46], [46, 46]], sB = [[46, -46], [-46, 46]];
          const mkS = (q, k) => inkPath(q.map(v => [tp[0] + v[0] * pk, tp[1] + v[1] * pk]), { w: 10, seed: sd + 360 + k, t, amp: 0.5 });
          S(sw, mkS(sA, 0) + ' ' + mkS(sB, 1));
          S(swR, inkPath([[tp[0] - 30 * pk, tp[1] + 10], [tp[0] - 10, tp[1] + 30 * pk]], { w: 8, seed: sd + 370, t }) + ' ' + inkPath([[tp[0] + 30 * pk, tp[1] + 10], [tp[0] + 10, tp[1] + 30 * pk]], { w: 8, seed: sd + 371, t }));
          rg.update(t, tp[0], tp[1], 80, arr ? 1 : 0);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
