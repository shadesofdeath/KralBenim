// emu: the Great Emu War (Western Australia, 1932) in the parchment ink style (brand/kit/BRAND.md §5; every line
// boils at 8 Hz via _ink.js). A wheat field under a wide sky, a flock of running emus with long backward-kneed legs
// (gait cycles, bobbing bodies, pumping necks), a soldier in a slouch hat behind a tripod Lewis gun, a 1930s truck
// with a mounted gun bouncing over the field, dust trails, jams, misses, and optional cast (Kaşif, farmers, soldiers).
//
// SHOTS.emu P: {
//   mode: "field"|"charge"|"scatter"|"truck",
//     field   — emus wander and peck in the wheat (some stalks flattened)
//     charge  — the flock runs right -> left across the field towards the gun
//     scatter — the flock runs in one clump, then on cue "scatter" splits into 3-4 small groups fleeing in all directions
//     truck   — camera rides along a truck with a mounted gun; the field scrolls, the emus pull away ahead of it
//   n: 14,                     // emus in the flock
//   size: 1,                   // emu size multiplier
//   speed: 1,                  // flock speed multiplier
//   gun: {x: 0.17, scale: 1, soldier: true} | false   // tripod Lewis gun at the left foreground (charge/scatter)
//   fire: true,                // gun fires (muzzle flash, tracers, dust puffs where the bullets miss) from cue "fire"
//   jam: true,                 // on cue "jam" the gun stops with a smoke puff and a big red "?" over the gunner
//   question: "cueName",       // (any mode) a big "?" pops over the gunner at this cue
//   truck: {x: 0.3, scale: 1}, // truck mode: truck position on screen
//   trampled: 0.3,             // field mode: fraction of flattened wheat tufts
//   cast: [{who: "kasif"|name, accessory: "slouch", x: 0.8, y (0..1 H ground, default the field front), scale,
//           pose: "idle", at: cue|seconds, then: "shock", to (walk/run target x), face: "left"|"right", dir, emotion, text}],
//   label: {text, x: 0.5, y: 0.2, at, size},
//   spread: [0, 1],            // field mode: emus wander only inside this x range (0..1 W), e.g. to keep them off Kaşif
//   words: {lines: ["Düşman", "kuşlar"], highlight: ["kuşlar"], y: 0.17, size: 190}   // giant Fraunces words that slam
//                              // in one by one (cues w0, w1, ...); the highlighted word sits in a red box
//   peek: {at: "w1", x: 0.36, size: 1.15, face: "right"}   // one big emu pops up out of the wheat on the cue
//   cam: {zoom: 1.05, focus: [0.5, 0.55]}
// }
// cues: fire, scatter, jam, hit (flock/gun punch), question, cast/label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);

  // two-bone IK; joint on the side of hint
  function ik(a, b, l1, l2, hint) {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    const mx = l1 + l2 - 0.5;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    d = Math.max(d, Math.abs(l1 - l2) + 1, 1);
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const j1 = [a[0] + Math.cos(base + al) * l1, a[1] + Math.sin(base + al) * l1];
    const j2 = [a[0] + Math.cos(base - al) * l1, a[1] + Math.sin(base - al) * l1];
    const dd = j => (j[0] - hint[0]) ** 2 + (j[1] - hint[1]) ** 2;
    return dd(j1) <= dd(j2) ? j1 : j2;
  }
  // foot of a gait cycle: stance (glued, slides back) then swing (arc forward)
  function gaitFoot(p, half, lift, f) {
    p = ((p % 1) + 1) % 1;
    if (p < f) return [half * (1 - 2 * p / f), 0];
    const s = (p - f) / (1 - f);
    return [-half + 2 * half * sm(s), -Math.sin(Math.PI * s) * lift];
  }
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; };

  // ---------------------------------------------------------------- one emu (local units, facing +x, ground y = 0)
  // body ~ 230 wide, head top ~ -390. state: {gait: "run"|"walk"|"stand", ph, peck (0..1), t, seed, w (line scale)}
  const BODY = [[98, -24], [72, -52], [22, -64], [-40, -60], [-92, -42], [-114, -10], [-122, 26], [-102, 16], [-98, 40], [-78, 26], [-68, 50],
    [-50, 30], [-36, 54], [-18, 34], [0, 52], [18, 32], [38, 46], [56, 26], [80, 20], [100, 2]];
  const FEATH = [[[-80, -20], [-58, -2], [-40, 16]], [[-46, -36], [-24, -16], [-8, 8]], [[-6, -40], [14, -22], [24, 2]], [[-96, 2], [-82, 20]], [[34, -34], [50, -16]]];
  function makeEmu(parent, seed) {
    const g = el(parent, 'g');
    return { g, seed, under: mk(g), fill: mk(g, INK.inkSoft), eyeW: mk(g, INK.paperLight), ink: mk(g) };
  }
  function drawEmu(E, st) {
    const { t } = st, sd = E.seed * 100, w = st.w || 1;
    const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.8 }, x);
    const run = st.gait === 'run', walk = st.gait === 'walk';
    const ph = st.ph || 0;
    const bob = run ? -Math.abs(Math.sin(2 * Math.PI * ph)) * 16 : walk ? -Math.abs(Math.sin(2 * Math.PI * ph)) * 6 : Math.sin(t * 2 + E.seed) * 2;
    const tilt = run ? -0.12 : -0.04;
    const c = [0, -268 + bob];
    const B = q => { const r = rotP([q[0] * 0.86, q[1] * 0.9], tilt); return [c[0] + r[0], c[1] + r[1]]; };
    // legs
    const hip = B([14, 30]);
    const hs = run ? 92 : walk ? 52 : 0, lift = run ? 80 : 34, fr = run ? 0.38 : 0.6;
    const legs = [0, 1].map(j => {
      const fq = (run || walk) ? gaitFoot(ph + j * 0.5, hs, lift, fr) : [j ? -26 : 22, 0];
      const foot = [hip[0] + 12 + fq[0], fq[1]];
      const knee = ik(hip, foot, 124, 132, [hip[0] - 90, (hip[1] + foot[1]) / 2]);
      const toeA = run && fq[1] < -8 ? 0.7 : 0;           // toes curl while swinging
      const toes = [[34, 0], [28, -10], [-14, -2]].map(q => { const r = rotP(q, toeA); return [foot[0] + r[0], foot[1] + r[1]]; });
      return { foot, knee, toes };
    });
    const legD = (L, k) => inkPath([hip, L.knee, L.foot], O(k, { w: 11 * w, taper: 0.15 })) + ' ' +
      L.toes.map((q, i) => inkPath([L.foot, q], O(k + 3 + i, { w: 6 * w, amp: 1 }))).join(' ');
    // neck + head
    const base = B([70, -40]);
    let head;
    const pk = clamp01(st.peck || 0);
    if (run) head = [148 + Math.sin(2 * Math.PI * ph * 2) * 12, -462 + bob + Math.cos(2 * Math.PI * ph * 2) * 8];
    else head = [112 + Math.sin(t * 1.3 + E.seed) * 4, -500 + Math.sin(t * 1.7 + E.seed) * 4];
    head = [lerp(head[0], 200, pk), lerp(head[1], -34, pk)];
    const mid = [lerp(base[0], head[0], 0.5) + (run ? 22 : 10) * (1 - pk) + 40 * pk, lerp(base[1], head[1], 0.5) - 30 * pk];
    const neck = [base, mid, head];
    const ha = pk * 1.05 + (run ? 0.12 : 0);                     // head level when up, nose down when pecking
    const hp = q => { const r = rotP(q, ha); return [head[0] + r[0], head[1] + r[1]]; };
    const hd = inkEllipsePts(0, 0, 28, 20, sd + 9, 10).map(hp);
    const beak = [hp([18, -8]), hp([58, 2]), hp([18, 10])];
    const eye = hp([4, -6]);
    // under layer: far leg + neck outline (a thick ink stroke the neck fill sits on)
    E.under.setAttribute('d', legD(legs[1], 10) + ' ' + inkPath(neck, O(20, { w: 32 * Math.max(0.8, w * 0.9), taper: 0.05, amp: 1.2 })));
    const body = BODY.map(B);
    E.fill.setAttribute('d', inkLoop(body, O(30)) + ' ' + inkPath(neck, O(20, { w: 21, taper: 0.05, amp: 1.2 })) + ' ' + inkLoop(hd, O(40, { amp: 1 })));
    E.eyeW.setAttribute('d', inkDot(eye[0], eye[1], 8, 8, sd + 50, t));
    E.ink.setAttribute('d', inkPath(body, O(30, { w: 6 * w, closed: true })) + ' ' +
      FEATH.map((f, i) => inkPath(f.map(B), O(60 + i, { w: 3.5 * w, amp: 1.2 }))).join(' ') + ' ' +
      inkPath(hd, O(40, { w: 5 * w, closed: true, amp: 1 })) + ' ' + inkLoop(beak, O(45, { amp: 0.8, smooth: false })) + ' ' +
      inkDot(eye[0] + 2, eye[1], 4, 4, sd + 51, t) + ' ' + legD(legs[0], 70));
  }

  // ---------------------------------------------------------------- Lewis gun on a tripod (local units, muzzle at +x)
  // origin = ground under the tripod; barrel at y ≈ -215. Returns {fill paths, ink path, muzzle}
  const GUN = {
    stock: [[-138, -196], [-62, -210], [-62, -234], [-128, -238]],
    recv: [[-62, -240], [30, -242], [30, -204], [-62, -204]],
    shroud: [[30, -248], [204, -244], [204, -206], [30, -202]],
    grip: [[-40, -204], [-30, -170], [-14, -172], [-20, -204]],
  };
  const MUZ = [262, -228];
  function gunPaths(t, sd, shake) {
    const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
    const s = q => [q[0], q[1] + shake];
    const P = pts => pts.map(s);
    const pan = inkEllipsePts(-12, -256 + shake, 56, 13, sd + 7, 12);
    let fin = '';
    for (let x = 50; x < 200; x += 22) fin += inkPath([s([x, -246]), s([x, -206])], O(100 + x, { w: 3, amp: 0.8 })) + ' ';
    const fillDark = inkLoop(P(GUN.recv), O(1, { smooth: false })) + ' ' + inkLoop(P(GUN.shroud), O(2, { smooth: false })) + ' ' + inkLoop(pan, O(7));
    const fillLight = inkLoop(P(GUN.stock), O(3, { smooth: false })) + ' ' + inkLoop(P(GUN.grip), O(4, { smooth: false }));
    const ink = [GUN.stock, GUN.recv, GUN.shroud, GUN.grip].map((q, i) => inkPath(P(q), O(i + 1, { w: 5, closed: true, smooth: false }))).join(' ') + ' ' +
      inkPath(pan, O(7, { w: 4.5, closed: true })) + ' ' + inkPath([s([204, -228]), s([MUZ[0], MUZ[1]])], O(8, { w: 11 })) + ' ' + fin +
      inkPath([s([-6, -204]), [-96, 0]], O(9, { w: 7 })) + ' ' + inkPath([s([-6, -204]), [84, 0]], O(10, { w: 7 })) + ' ' + inkPath([s([-6, -204]), [-8, 0]], O(11, { w: 7 }));
    return { fillDark, fillLight, ink, muzzle: [MUZ[0], MUZ[1] + shake] };
  }

  // ---------------------------------------------------------------- 1930s truck (local units, facing +x, ground y = 0)
  const TRUCK = {
    bed: [[-300, -150], [70, -150], [70, -108], [-300, -108]],
    rails: [[-300, -150], [-300, -196], [-110, -196]],
    cab: [[70, -108], [70, -292], [168, -296], [184, -206], [262, -198], [286, -150], [286, -108]],
    win: [[90, -272], [150, -274], [162, -214], [90, -214]],
    guardR: [[-262, -108], [-246, -146], [-176, -160], [-106, -146], [-90, -108]],
    guardF: [[130, -108], [150, -150], [210, -162], [262, -146], [276, -108]],
  };
  const WHEELS = [[-176, -58], [206, -58]], WR = 58;

  SH.emu = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const mode = P.mode || 'field';
      const G = portrait ? 1120 : 900, HY = portrait ? 700 : 470;          // field front / horizon
      const K = portrait ? 1 : 0.8;
      const sd = seed * 1000;
      const root = el(svg, 'g'), world = el(root, 'g');
      const r = rng(seed * 17 + 5);
      // ---------- background layers
      const skyG = el(world, 'g');
      const sunF = mk(skyG, INK.paperLight), sunR = mk(skyG, INK.inkSoft), cloudF = mk(skyG, INK.paperLight), cloudR = mk(skyG, INK.inkSoft);
      const farF = mk(world, INK.paperDark, { 'fill-opacity': 0.55 }), farR = mk(world, INK.inkSoft);
      const treeF = mk(world, INK.green, { 'fill-opacity': 0.85 }), treeR = mk(world, INK.inkSoft);
      const fieldF = mk(world, INK.paperDark, { 'fill-opacity': 0.35 }), fieldR = mk(world);
      const fenceR = mk(world, INK.inkSoft);
      const wheatS = mk(world, INK.inkSoft), wheatE = mk(world, INK.gold), wheatR = mk(world, INK.ink, { 'fill-opacity': 0.75 });
      const dustBack = Array.from({ length: 10 }, () => mk(world, INK.paperDark, { 'fill-opacity': 0 }));
      const dustBackR = Array.from({ length: 10 }, () => mk(world, INK.inkSoft, { 'fill-opacity': 0 }));
      const flockG = el(world, 'g');
      const actorG = el(world, 'g');
      const fxG = el(world, 'g');
      const frontS = mk(world, INK.inkSoft), frontE = mk(world, INK.gold), frontR = mk(world);
      const uiG = el(root, 'g');
      // giant words (Fraunces) + optional red highlight box, and the big emu that pops out of the wheat
      let words = null, peek = null;
      if (P.words && P.words.lines) {
        const Wd = P.words, fs = (Wd.size ?? 190) * K, hl = (Wd.highlight || []).map(w => w.toLocaleLowerCase(LOCALE));
        words = Wd.lines.map((line, i) => {
          const g = el(uiG, 'g'), isH = hl.includes(String(line).toLocaleLowerCase(LOCALE));
          const box = isH ? mk(g, INK.red) : null, boxR = isH ? mk(g) : null;
          const t = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': fs, 'text-anchor': 'middle',
            fill: isH ? INK.paperLight : INK.ink, 'fill-opacity': 0 });
          t.textContent = line;
          return { g, t, box, boxR, isH, i, y: (Wd.y ?? 0.17) * H + i * fs * 1.12 + fs * 0.75, fs };
        });
      }

      // clouds, far hills, trees
      const clouds = Array.from({ length: 3 }, (_, i) => ({ x: W * (0.15 + i * 0.36) + r() * 80, y: (portrait ? 330 : 120) + r() * (portrait ? 170 : 90), s: (0.8 + r() * 0.5) * K, v: 6 + r() * 8 }));
      const farPts = []; for (let x = -80; x <= W + 80; x += 80) farPts.push([x, HY - 22 - Math.max(0, Math.sin(x * 0.006 + seed)) * 46 - Math.sin(x * 0.021) * 8]);
      const trees = Array.from({ length: 3 }, (_, i) => ({ x: W * (0.12 + i * 0.36 + r() * 0.12), s: (0.7 + r() * 0.5) * K }));
      // wheat tufts: rows from the horizon to the front; depth d 0 (far) .. 1 (front)
      const tufts = [];
      for (let row = 0; row < 9; row++) {
        const d = row / 8, y = lerp(HY + 20, G + 6, Math.pow(d, 1.15)), step = lerp(70, 150, d) * K;
        for (let x = -60 + r() * step; x < W + 260; x += step * (0.8 + r() * 0.4)) tufts.push({ x, y: y + (r() * 2 - 1) * 10, d, s: lerp(0.35, 1, d) * K, flat: r() < (mode === 'field' ? (P.trampled ?? 0.3) : 0), ph: r() * 6 });
      }
      const fronts = [];
      const fBands = portrait ? [[G + 46, G + 50], [1365, 1375], [1440, 1450]] : [[G + 60, G + 70]];
      for (const [y0] of fBands) if (!(mode === 'truck' && y0 < G + 100)) for (let x = -40 + r() * 90; x < W + 260; x += (110 + r() * 80) * K) fronts.push({ x, y: y0 + r() * 8, s: (y0 > 1300 ? 0.85 : 1.25) * K, ph: r() * 6 });
      const fencePosts = []; for (let x = -40; x < W + 300; x += 150 * K) fencePosts.push(x);

      // ---------- flock
      const n = P.n ?? (mode === 'truck' ? 9 : mode === 'words' ? 0 : 14), size = (P.size ?? 1) * K, spd = P.speed ?? 1;
      const emus = Array.from({ length: n }, (_, i) => {
        const e = makeEmu(flockG, seed * 50 + i + 1);
        const d0 = mode === 'scatter' ? 0.3 + r() * 0.35 : mode === 'charge' ? 0.12 + r() * 0.5 : 0.2 + r() * 0.8;
        return Object.assign(e, { i, d0, x0: r(), ox: (r() * 2 - 1), od: (r() * 2 - 1), v: 0.85 + r() * 0.3, gph: r(), peckP: 2.2 + r() * 1.4, peckO: r() * 3, vx: (r() < 0.5 ? -1 : 1) * (14 + r() * 30) });
      });
      // scatter groups: [dx px/s, depth/s]
      const GROUPS = [[-560, -0.16], [520, -0.2], [-420, 0.14], [470, 0.1]];
      if (P.peek) peek = Object.assign(makeEmu(flockG, seed * 50 + 99), { Pk: P.peek });

      // ---------- gun + soldier
      let gun = null;
      if ((mode === 'charge' || mode === 'scatter') && P.gun !== false) {
        const Gc = typeof P.gun === 'object' ? P.gun : {};
        const g = el(actorG, 'g'), gs = (Gc.scale ?? 1) * 0.95 * K;
        let soldier = null;
        if (Gc.soldier !== false && typeof KASIF !== 'undefined') soldier = KASIF.create(el(g, 'g'), { scale: gs * 0.78, hat: false, accessory: 'slouch', seed: seed + 31 });
        const gg = el(g, 'g');
        gun = { Gc, g, gg, gs, soldier, x: (Gc.x ?? 0.17) * W, y: Gc.y != null ? Gc.y * H : G + 10,
          fillLight: mk(gg, INK.paperDark), fillDark: mk(gg, INK.inkSoft), ink: mk(gg), flashF: mk(gg, INK.gold), flashR: mk(gg) };
      }
      // ---------- truck
      let truck = null;
      if (mode === 'truck') {
        const Tc = typeof P.truck === 'object' ? P.truck : {};
        const g = el(actorG, 'g'), ts = (Tc.scale ?? 1) * K;
        const body = el(g, 'g');
        const T = { g, body, ts, x: (Tc.x ?? 0.3) * W, y: G + 6 };
        T.bedF = mk(body, INK.paperDark); T.cabF = mk(body, INK.paperLight); T.winF = mk(body, INK.paper); T.ink = mk(body);
        T.gunner = typeof KASIF !== 'undefined' ? KASIF.create(el(body, 'g'), { scale: 0.62, hat: false, accessory: 'slouch', seed: seed + 41 }) : null;
        T.gg = el(body, 'g'); T.gFillL = mk(T.gg, INK.paperDark); T.gFillD = mk(T.gg, INK.inkSoft); T.gInk = mk(T.gg); T.flashF = mk(T.gg, INK.gold); T.flashR = mk(T.gg);
        T.wheelF = mk(g, INK.inkSoft); T.wheelR = mk(g); T.hub = mk(g, INK.paperLight);
        truck = T;
      }
      // dust puffs, smoke, tracers, "?"
      const puffs = Array.from({ length: 8 }, () => ({ f: mk(fxG, INK.paperDark, { 'fill-opacity': 0 }), r: mk(fxG, INK.inkSoft, { 'fill-opacity': 0 }) }));
      const tracer = mk(fxG, INK.ink);
      const smoke = Array.from({ length: 4 }, () => ({ f: mk(fxG, INK.paperLight, { 'fill-opacity': 0 }), r: mk(fxG, INK.inkSoft, { 'fill-opacity': 0 }) }));
      const qT = el(uiG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 190 * K, 'text-anchor': 'middle', fill: INK.red,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round`, 'fill-opacity': 0 });
      qT.textContent = '?';

      // ---------- cast (Kaşif, farmers, soldiers)
      const cast = (P.cast || []).map((m, i) => {
        const isK = (m.who || 'kasif') === 'kasif';
        const sc = (m.scale ?? (portrait ? 0.66 : 0.56)) * (isK ? 1 : 1);
        return { m, isK, sc, rig: typeof KASIF !== 'undefined' ? KASIF.create(el(actorG, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) : null };
      });
      // label
      let label = null;
      if (P.label && P.label.text) {
        const t = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': P.label.size || (portrait ? 76 : 62), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
        t.textContent = P.label.text;
        label = { L: P.label, t, u: mk(uiG) };
      }

      const depthY = d => lerp(HY + 40, G, d);
      const depthS = d => lerp(0.36, 0.84, d);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          // camera: drift + slow push-in
          const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, Cm.zoom ?? 1.05, u);
          const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.55) * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5 + pk * 6)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // scrolling (truck mode): ground features slide left with depth parallax
          const vt = mode === 'truck' ? 520 * K : 0;
          const scr = (x, d, span) => { if (!vt) return x; const s = lerp(0.25, 1, d); return ((x - lt * vt * s) % span + span) % span - 120; };
          // sky
          const sx = W * 0.8, sy = portrait ? 470 : 150, sR = 70 * K;
          sunF.setAttribute('d', inkCircle(sx, sy, sR, sd + 1, t, { fill: true }));
          let sr = inkCircle(sx, sy, sR, sd + 1, t, { w: 4 });
          for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.15, r0 = sR + 18, r1 = sR + 40 + (i % 2) * 14; sr += ' ' + inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], O(2 + i, { w: 4, amp: 1 })); }
          sunR.setAttribute('d', sr);
          let cf = '', cr = '';
          clouds.forEach((c, i) => {
            const x = ((c.x + lt * (c.v + vt * 0.04)) % (W + 400)) - (vt ? 200 : 0), y = c.y, R = 44 * c.s;
            const bumps = [[x - 3 * R, y], [x - 2.4 * R, y - 0.9 * R], [x - 1.2 * R, y - 1.5 * R], [x, y - 1.8 * R], [x + 1.2 * R, y - 1.4 * R], [x + 2.3 * R, y - 0.9 * R], [x + 2.9 * R, y]];
            cf += inkLoop(bumps.concat([[x, y + 6]]), O(20 + i, { amp: 1.2 })) + ' ';
            cr += inkPath(bumps, O(24 + i, { w: 3.5, amp: 1.2 })) + ' ' + inkPath([[x - 3.2 * R, y + 4], [x + 3.1 * R, y + 2]], O(28 + i, { w: 2.5, amp: 1 })) + ' ';
          });
          cloudF.setAttribute('d', cf); cloudR.setAttribute('d', cr);
          // far hills + horizon
          const fp = farPts.map(q => [vt ? ((q[0] - lt * vt * 0.08) % (W + 160) + W + 160) % (W + 160) - 80 : q[0], q[1]]).sort((a, b) => a[0] - b[0]);
          farF.setAttribute('d', inkLoop([...fp, [W + 80, HY + 10], [-80, HY + 10]], O(40, { amp: 1, smooth: false })));
          farR.setAttribute('d', inkPath(fp, O(41, { w: 3.5, amp: 1 })) + ' ' + inkPath([[-80, HY + 6], [W + 80, HY + 4]], O(42, { w: 4 })));
          // gum trees on the horizon
          let tf = '', tr = '';
          trees.forEach((tq, i) => {
            const x = vt ? ((tq.x - lt * vt * 0.15) % (W + 300) + W + 300) % (W + 300) - 150 : tq.x, y = HY + 8, s = tq.s, sway = Math.sin(t * 0.9 + i) * 3;
            tr += inkPath([[x, y], [x + 4, y - 120 * s], [x - 26 * s, y - 170 * s]], O(50 + i, { w: 6 })) + ' ' + inkPath([[x + 4, y - 120 * s], [x + 34 * s, y - 182 * s]], O(54 + i, { w: 5 })) + ' ';
            const crown = [[x - 90 * s + sway, y - 170 * s], [x - 70 * s + sway, y - 230 * s], [x - 10 * s + sway, y - 262 * s], [x + 50 * s + sway, y - 240 * s], [x + 86 * s + sway, y - 196 * s], [x + 50 * s, y - 160 * s], [x - 40 * s, y - 150 * s]];
            tf += inkLoop(crown, O(58 + i)) + ' '; tr += inkPath(crown, O(58 + i, { w: 4.5, closed: true })) + ' ';
          });
          treeF.setAttribute('d', tf); treeR.setAttribute('d', tr);
          // field band
          fieldF.setAttribute('d', inkLoop([[-80, HY + 6], [W + 80, HY + 4], [W + 80, G + 40], [-80, G + 42]], O(70, { amp: 0, smooth: false })));
          fieldR.setAttribute('d', inkPath([[-80, G + 40], [W * 0.5, G + 34], [W + 80, G + 42]], O(71, { w: 5 })));
          // fence just below the horizon
          const fy0 = HY + 70 * K;
          let fr = '';
          fencePosts.forEach((x0, i) => { const x = scr(x0, 0.3, W + 300); fr += inkPath([[x, fy0], [x + 2, fy0 - 70 * K]], O(80 + i, { w: 5 })) + ' '; });
          fr += inkPath([[-80, fy0 - 50 * K], [W + 80, fy0 - 52 * K]], O(98, { w: 2.5, amp: 1.2 })) + ' ' + inkPath([[-80, fy0 - 26 * K], [W + 80, fy0 - 24 * K]], O(99, { w: 2.5, amp: 1.2 }));
          fenceR.setAttribute('d', fr);
          // wheat tufts (stalks ink-soft, ears gold, gold ears outlined)
          const tuftD = (list, k0, big) => {
            let ds = '', de = '', dr = '';
            list.forEach((q, i) => {
              const x = scr(q.x, q.d ?? 1, W + 380), y = q.y, s = q.s, h = (big ? 150 : 110) * s;
              for (let j = -1; j <= 1; j++) {
                const sw = Math.sin(t * 1.6 + q.ph + j) * 7 * s, bx = x + j * 14 * s;
                let tip;
                if (q.flat) tip = [bx + (60 + j * 10) * s, y - 12 * s];
                else tip = [bx + j * 18 * s + sw, y - h * (1 - Math.abs(j) * 0.18)];
                ds += inkPath([[bx, y], [lerp(bx, tip[0], 0.5) - (q.flat ? 0 : 4 * s), lerp(y, tip[1], 0.55)], tip], O(k0 + i * 3 + j + 1, { w: Math.max(2.5, 4.5 * s), amp: 0.8 })) + ' ';
                const ang = q.flat ? 0.15 : Math.atan2(tip[1] - y, tip[0] - bx);
                const ear = inkEllipsePts(0, 0, 22 * s, 7.5 * s, k0 + i * 3 + j, 8).map(p => { const rr = rotP(p, ang); return [tip[0] + rr[0] + Math.cos(ang) * 16 * s, tip[1] + rr[1] + Math.sin(ang) * 16 * s]; });
                de += inkLoop(ear, O(k0 + 500 + i * 3 + j, { amp: 0.6 })) + ' ';
                if (s > 0.6) dr += inkPath(ear, O(k0 + 500 + i * 3 + j, { w: 2.5, closed: true, amp: 0.6 })) + ' ';
              }
            });
            return [ds, de, dr];
          };
          const [ws, we, wr] = tuftD(tufts, 1000, false);
          wheatS.setAttribute('d', ws); wheatE.setAttribute('d', we); wheatR.setAttribute('d', wr);
          const [fs, fe, frr] = tuftD(fronts, 3000, true);
          frontS.setAttribute('d', fs); frontE.setAttribute('d', fe); frontR.setAttribute('d', frr);

          // ---------- flock motion
          const fireAt = P.fire === false ? null : atOr(cues, 'fire', 0.25);
          const jamAt = (P.jam && mode !== 'truck') ? atOr(cues, 'jam', Math.max(1.2, dur * 0.65)) : null;
          const scAt = mode === 'scatter' ? atOr(cues, 'scatter', Math.max(0.6, dur * 0.3)) : null;
          const states = emus.map(e => {
            let x, d = e.d0, face = 1, gait = 'run', ph = 0, peck = 0;
            if (mode === 'field') {
              const sp = P.spread || [-0.05, 1.05];
              x = lerp(sp[0], sp[1], e.x0) * W + e.vx * lt;
              face = e.vx > 0 ? 1 : -1; gait = 'walk';
              const pt = (lt + e.peckO) % e.peckP;
              peck = sm((pt - 0.2) / 0.35) * (1 - sm((pt - 1.1) / 0.35));
              if (peck > 0.05) gait = 'stand';
              ph = Math.abs(e.vx * lt) / (2 * 52 * depthS(d) * size / 0.6);
            } else if (mode === 'charge') {
              // slow approach until the hit cue (the flock stays right of minX), then full speed
              const v = 300 * spd * e.v * K, hA = hitAt ?? dur * 0.4, minX = (P.min_x ?? 0.45) * W;
              const x0 = W * (0.66 + e.x0 * 0.6), vPre = Math.max(0, Math.min(v, (x0 - minX) / Math.max(0.3, hA)));
              x = x0 - vPre * Math.min(lt, hA) - v * Math.max(0, lt - hA); face = -1; ph = lt * 2.1 * e.v + e.gph;
            } else if (mode === 'scatter') {
              const vc = -70 * spd * K, cx = W * 0.7;
              x = cx + e.ox * 140 * K + vc * lt; d = clamp01(e.d0 + e.od * 0.06);
              face = -1; ph = lt * 2.1 * e.v + e.gph;
              if (lt > scAt) {
                const gq = GROUPS[e.i % GROUPS.length], tau = lt - scAt;
                const ramp = tau > 0.45 ? tau - 0.225 : tau * tau / 0.9;
                const k = (0.85 + 0.3 * e.v) * spd;
                x += gq[0] * K * ramp * k; d = Math.max(0.02, Math.min(1, d + gq[1] * ramp * k));
                const vx = vc + gq[0] * K * Math.min(1, tau / 0.45) * k;
                face = vx >= 0 ? 1 : -1; ph = lt * (2.1 + 0.6 * Math.min(1, tau / 0.45)) * e.v + e.gph;
              }
            } else {   // truck: emus ahead pull away (screen speed = emu speed - truck speed)
              const tq = truck ? truck.x : W * 0.3;
              x = tq + 330 * K + e.x0 * W * 0.4 + (30 + e.v * 40) * K * lt + (hitAt != null && lt > hitAt ? (lt - hitAt) ** 2 * 160 * K : 0);
              d = 0.35 + e.d0 * 0.5; face = 1; ph = lt * 2.3 * e.v + e.gph;
            }
            return { e, x, d, face, gait, ph, peck, y: depthY(d), s: depthS(d) * size };
          });
          states.slice().sort((a, b) => a.d - b.d).forEach(st => flockG.appendChild(st.e.g));
          states.forEach(st => {
            const vis = st.x > -260 && st.x < W + 260;
            st.e.g.style.display = vis ? '' : 'none';
            if (!vis) return;
            const s = st.s * (1 + pk * 0.04);
            st.e.g.setAttribute('transform', `translate(${f1(st.x)} ${f1(st.y)}) scale(${(st.face * s).toFixed(4)} ${s.toFixed(4)})`);
            drawEmu(st.e, { t, gait: st.gait, ph: st.ph, peck: st.peck, w: Math.min(1.6, 1 / Math.sqrt(s)) });
          });
          // dust behind running emus (in the back layer, one puff per near emu)
          const runners = mode === 'field' ? [] : states.filter(st => st.x > -100 && st.x < W + 100).sort((a, b) => b.d - a.d).slice(0, 10);
          dustBack.forEach((e, i) => {
            const st = runners[i];
            if (!st) { e.setAttribute('fill-opacity', 0); dustBackR[i].setAttribute('fill-opacity', 0); return; }
            let dd = '', dr = '';
            for (let k = 0; k < 3; k++) {
              const ph = (t * 1.6 + k / 3 + i * 0.37) % 1, R = (14 + ph * 34) * st.s, x = st.x - st.face * (70 + ph * 140) * st.s, y = st.y - (6 + ph * 40) * st.s;
              const pts = inkEllipsePts(x, y, R * 1.3, R, sd + 900 + i * 5 + k, 9);
              dd += inkLoop(pts, O(900 + i * 5 + k, { amp: 1 })) + ' ';
              dr += inkPath(pts, O(900 + i * 5 + k, { w: 2.5, closed: true, amp: 1 })) + ' ';
            }
            e.setAttribute('d', dd); e.setAttribute('fill-opacity', 0.6);
            dustBackR[i].setAttribute('d', dr); dustBackR[i].setAttribute('fill-opacity', 0.55);
          });

          // ---------- gun
          const firing = fireAt != null && lt >= fireAt && (jamAt == null || lt < jamAt);
          let muzzleW = null, gunnerHead = null;
          if (gun) {
            const shake = firing ? Math.sin(t * 70) * 3 : 0;
            const gp = gunPaths(t, sd + 5000, shake);
            gun.gg.setAttribute('transform', `translate(${f1(gun.x)} ${f1(gun.y)}) scale(${gun.gs.toFixed(4)})`);
            gun.fillLight.setAttribute('d', gp.fillLight); gun.fillDark.setAttribute('d', gp.fillDark); gun.ink.setAttribute('d', gp.ink);
            const fl = firing && Math.floor(t * 14) % 2 === 0;
            const fp = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, rr = i % 2 ? 26 : 62; fp.push([gp.muzzle[0] + 40 + Math.cos(a) * rr * 1.2, gp.muzzle[1] + Math.sin(a) * rr * 0.8]); }
            gun.flashF.setAttribute('d', fl ? inkLoop(fp, O(5100, { smooth: false, amp: 3 })) : '');
            gun.flashR.setAttribute('d', fl ? inkPath(fp, O(5100, { w: 4, closed: true, smooth: false, amp: 3 })) : '');
            muzzleW = [gun.x + gp.muzzle[0] * gun.gs, gun.y + gp.muzzle[1] * gun.gs];
            if (gun.soldier) {
              const jammed = jamAt != null && lt >= jamAt, since = jammed ? lt - jamAt : lt;
              const o = { x: gun.x - 128 * gun.gs, y: gun.y, face: 1, since, emotion: jammed ? 'surprised' : 'angry' };
              if (jammed && since < 0.32) { o.prev = { pose: 'idle', since: jamAt }; o.mix = since / 0.32; }
              gun.soldier.update(t, jammed ? 'shrug' : 'idle', o);
              gunnerHead = [o.x, gun.y - 560 * gun.gs * 0.78];
            }
          }
          // ---------- truck
          if (truck) {
            const T = truck, ts = T.ts, bounce = Math.sin(t * 17) * 5 + Math.sin(t * 7.3 + 1) * 6 + Math.abs(Math.sin(t * 3.1)) * -8, tilt = Math.sin(t * 5.3) * 1.2;
            T.g.setAttribute('transform', `translate(${f1(T.x)} ${f1(T.y)}) scale(${ts.toFixed(4)})`);
            T.body.setAttribute('transform', `translate(0 ${f1(bounce)}) rotate(${f1(tilt)} 0 -110)`);
            const Ot = (k, x) => O(6000 + k, x);
            T.bedF.setAttribute('d', inkLoop(TRUCK.bed, Ot(1, { smooth: false })));
            T.cabF.setAttribute('d', inkLoop(TRUCK.cab, Ot(2, { smooth: false })));
            T.winF.setAttribute('d', inkLoop(TRUCK.win, Ot(3, { smooth: false })));
            let ti = ['bed', 'cab', 'win'].map((k, i) => inkPath(TRUCK[k], Ot(i + 1, { w: 6, closed: true, smooth: false }))).join(' ') + ' ' +
              inkPath(TRUCK.rails, Ot(4, { w: 6, smooth: false })) + ' ' + inkPath(TRUCK.guardR, Ot(5, { w: 6 })) + ' ' + inkPath(TRUCK.guardF, Ot(6, { w: 6 })) + ' ' +
              inkPath([[184, -206], [190, -150]], Ot(7, { w: 3.5 })) + ' ' + inkPath([[220, -190], [250, -184]], Ot(8, { w: 3 })) + ' ' + inkPath([[220, -176], [250, -170]], Ot(9, { w: 3 })) + ' ' +
              inkDot(282, -170, 12, 14, sd + 6010, t) + ' ' + inkPath([[-110, -150], [-110, -250]], Ot(11, { w: 10 }));
            for (let x = -280; x < -120; x += 40) ti += ' ' + inkPath([[x, -150], [x, -196]], Ot(20 + x, { w: 3.5 }));
            T.ink.setAttribute('d', ti);
            // pedestal gun pointing forward over the cab
            T.gg.setAttribute('transform', `translate(-110 -40) rotate(${f1(-6 + Math.sin(t * 9) * 3)} 0 -215)`);
            const tFire = fireAt != null && lt >= fireAt;
            const gp = gunPaths(t, sd + 7000, tFire ? Math.sin(t * 70) * 3 : 0);
            T.gFillL.setAttribute('d', gp.fillLight); T.gFillD.setAttribute('d', gp.fillDark);
            T.gInk.setAttribute('d', gp.ink);
            const fl = tFire && Math.floor(t * 12) % 3 === 0;
            const fp = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, rr = i % 2 ? 24 : 56; fp.push([gp.muzzle[0] + 36 + Math.cos(a) * rr * 1.2, gp.muzzle[1] + Math.sin(a) * rr * 0.8]); }
            T.flashF.setAttribute('d', fl ? inkLoop(fp, O(6100, { smooth: false, amp: 3 })) : '');
            T.flashR.setAttribute('d', fl ? inkPath(fp, O(6100, { w: 4, closed: true, smooth: false, amp: 3 })) : '');
            if (T.gunner) {
              const qa = atOr(cues, P.question, null), after = qa != null && lt >= qa, since = after ? lt - qa : lt;
              const o = { x: -250, y: -150, face: 1, since, emotion: after ? 'worried' : 'angry' };
              if (after && since < 0.32) { o.prev = { pose: 'idle', since: qa }; o.mix = since / 0.32; }
              T.gunner.update(t, after ? 'shrug' : 'idle', o);
              gunnerHead = [T.x + (-250) * ts, T.y + (-150 - 560 * 0.62 + bounce) * ts];
            }
            // wheels: spin with the ground speed
            let wf = '', wr = '', wh = '';
            WHEELS.forEach((c, i) => {
              wf += inkCircle(c[0], c[1], WR, sd + 6200 + i, t, { fill: true }) + ' ';
              wr += inkCircle(c[0], c[1], WR, sd + 6200 + i, t, { w: 7 }) + ' ';
              const a0 = lt * vt / (WR * ts);
              for (let k = 0; k < 5; k++) { const a = a0 + k / 5 * Math.PI * 2; wr += inkPath([[c[0], c[1]], [c[0] + Math.cos(a) * WR * 0.8, c[1] + Math.sin(a) * WR * 0.8]], O(6220 + i * 10 + k, { w: 4, amp: 0.8 })) + ' '; }
              wh += inkDot(c[0], c[1], 16, 16, sd + 6240 + i, t) + ' ';
            });
            T.wheelF.setAttribute('d', wf); T.wheelR.setAttribute('d', wr); T.hub.setAttribute('d', wh);
            muzzleW = null;
            // big dust cloud behind the truck
          }
          // ---------- tracers + dust puffs where the bullets land (misses)
          let trD = '';
          if (firing && muzzleW && gun) {
            for (let k = 0; k < 4; k++) {
              const a = ((t * 6 + k / 4) % 1), x = muzzleW[0] + 60 + a * W * 0.9, y = muzzleW[1] - 20 + a * (60 + 40 * Math.sin(k * 2.1 + Math.floor(t * 6)));
              trD += inkPath([[x, y], [x + 46, y + 2]], O(7000 + k, { w: 5, amp: 0.5 })) + ' ';
            }
          }
          tracer.setAttribute('d', trD);
          puffs.forEach((pf, k) => {
            let src = null;
            if (truck) {      // continuous dust trail behind the rear wheel
              const ph = (t * 1.4 + k / puffs.length) % 1;
              src = { x: truck.x + (-240 - ph * 380) * truck.ts, y: truck.y - (20 + ph * 120) * truck.ts, R: (30 + ph * 70) * truck.ts, a: 0.75 * (1 - ph) };
            } else if (fireAt != null && lt >= fireAt) {
              const period = 0.16, N = puffs.length, gi = Math.floor((lt - fireAt) / period), g = gi - (((gi - k) % N) + N) % N;
              const bt = fireAt + g * period, age = lt - bt;
              if (g >= 0 && age < 0.9 && (jamAt == null || bt < jamAt)) {
                const rq = rng(inkHash(seed + 77, Math.round(bt * 100))); rq();
                const tgt = states[Math.floor(rq() * states.length)];
                const x = tgt.x + (rq() * 2 - 1) * 120 * tgt.s - tgt.face * 60 * tgt.s, y = tgt.y + 4;
                const ag = age / 0.9;
                src = { x, y: y - ag * 50 * tgt.s, R: (16 + ag * 46) * tgt.s * 1.3, a: 0.8 * (1 - ag) };
              }
            }
            if (!src || src.a <= 0.01) { pf.f.setAttribute('fill-opacity', 0); pf.r.setAttribute('fill-opacity', 0); return; }
            const pts = inkEllipsePts(src.x, src.y, src.R * 1.25, src.R, sd + 7100 + k, 10);
            pf.f.setAttribute('d', inkLoop(pts, O(7100 + k, { amp: 1.2 }))); pf.f.setAttribute('fill-opacity', f1(src.a * 10) / 10);
            pf.r.setAttribute('d', inkPath(pts, O(7100 + k, { w: 3, closed: true, amp: 1.2 }))); pf.r.setAttribute('fill-opacity', f1(src.a * 10) / 10);
          });
          // ---------- jam: smoke puff from the receiver
          const smokeOn = gun && jamAt != null && lt >= jamAt;
          smoke.forEach((sm2, k) => {
            if (!smokeOn) { sm2.f.setAttribute('fill-opacity', 0); sm2.r.setAttribute('fill-opacity', 0); return; }
            const age = lt - jamAt - k * 0.12, ag = clamp01(age / 1.8);
            if (age < 0) { sm2.f.setAttribute('fill-opacity', 0); sm2.r.setAttribute('fill-opacity', 0); return; }
            const cx = gun.x + (40 + k * 30) * gun.gs, cy = gun.y + (-260 - ag * 220 - k * 30) * gun.gs, R = (40 + sm(age / 0.4) * 50 + ag * 40 + k * 8) * gun.gs;
            const pts = inkEllipsePts(cx + Math.sin(t * 2 + k) * 10, cy, R, R * 0.85, sd + 7200 + k, 11);
            const a = 1 - ag * 0.8;
            sm2.f.setAttribute('d', inkLoop(pts, O(7200 + k, { amp: 1.5 }))); sm2.f.setAttribute('fill-opacity', f1(a * 10) / 10);
            sm2.r.setAttribute('d', inkPath(pts, O(7200 + k, { w: 4, closed: true, amp: 1.5 }))); sm2.r.setAttribute('fill-opacity', f1(a * 10) / 10);
          });
          // ---------- "?" over the gunner
          const qAt = jamAt != null ? jamAt + 0.15 : atOr(cues, P.question, null);
          if (qAt != null && lt >= qAt && gunnerHead) {
            const sp = spring(lt, qAt, 0.7), b = boil(sd + 7300, t, 2);
            qT.setAttribute('fill-opacity', 1);
            qT.setAttribute('transform', `translate(${f1(gunnerHead[0] + 30 * K + b[0])} ${f1(gunnerHead[1] - 40 * K + b[1])}) rotate(${f1(Math.sin(t * 3) * 8)}) scale(${lerp(0.2, 1, sp).toFixed(3)})`);
          } else qT.setAttribute('fill-opacity', 0);

          // ---------- words + peek
          if (words) words.forEach(w => {
            const at = atOr(cues, 'w' + w.i, 0.2 + w.i * 0.5), sp = spring(lt, at, 0.55), on = lt >= at;
            w.t.setAttribute('fill-opacity', on ? 1 : 0);
            if (w.box) {
              const tw = w.t.getComputedTextLength ? w.t.getComputedTextLength() : w.fs * 3, bx = [[-tw / 2 - 34, -w.fs * 0.78], [tw / 2 + 34, -w.fs * 0.82], [tw / 2 + 38, w.fs * 0.24], [-tw / 2 - 30, w.fs * 0.28]];
              w.box.setAttribute('d', on ? inkLoop(bx, O(8100 + w.i, { smooth: false, amp: 1.5 })) : '');
              w.boxR.setAttribute('d', on ? inkPath(bx, O(8100 + w.i, { w: 6, closed: true, smooth: false, amp: 1.5 })) : '');
            }
            const b = boil(sd + 8200 + w.i, t, 1.2), k = lerp(1.7, 1, sp) * (1 + 0.05 * punch(lt, at, 0.5));
            w.g.setAttribute('transform', `translate(${f1(W / 2 + b[0])} ${f1(w.y + b[1])}) rotate(${w.isH ? -3 : 0}) scale(${k.toFixed(3)})`);
          });
          if (peek) {
            const Pk = peek.Pk, at = atOr(cues, Pk.at, 0.6), sp = spring(lt, at, 0.7), s2 = (Pk.size ?? 1.15) * K;
            const vis = lt >= at - 0.01;
            peek.g.style.display = vis ? '' : 'none';
            if (vis) {
              const x = (Pk.x ?? 0.36) * W, y = G + 50 + (1 - Math.min(1, sp)) * 620 * K, face = Pk.face === 'left' ? -1 : 1;
              peek.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${(face * s2).toFixed(4)} ${s2.toFixed(4)})`);
              drawEmu(peek, { t, gait: 'stand', ph: 0, peck: 0, w: 1 });
            }
          }
          // ---------- cast
          cast.forEach(c => {
            if (!c.rig) return;
            const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
            const pose = after ? (m.then || 'point') : (m.pose || 'idle');
            const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
            let x = (m.x ?? 0.8) * W;
            if (moving && !after) x = lerp(x, m.to * W, clamp01(lt / Math.max(0.3, at ?? dur)));
            else if (m.to != null) x = m.to * W;
            const y = m.y != null ? m.y * H : G + 30;
            const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
            const o = { x, y, face: m.face === 'left' ? -1 : 1, since, dir, text: m.text, emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
            if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
            if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir, ph: o.ph }; o.mix = since / 0.32; }
            c.rig.update(t, pose, o);
          });
          // ---------- label
          if (label) {
            const Lb = label.L, at = atOr(cues, Lb.at, 0.2), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? (portrait ? 0.2 : 0.16)) * H, b = boil(sd + 8000, t, 1);
            label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
            label.t.setAttribute('fill-opacity', clamp01(sp * 2));
            const tw = Math.min(W * 0.85, label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300), pu = prog(lt, at + 0.25, 0.5);
            label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 16]], O(8001, { w: 6 })) : '');
          }
        },
      };
    },
  };
})();
