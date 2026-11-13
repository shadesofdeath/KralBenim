// bmb_beetle: shots for the Stickstory Short "Bombardier beetle" (2026-11-13): the bombardier beetle mixes two
// chemicals in a hard reaction chamber in its abdomen and fires a boiling spray in rapid pulses; in a 2018 study
// (Sugiura & Sato, Biology Letters) Japanese toads that swallowed Pheropsophus jessoensis threw 43 % of them back up
// alive, after 12 to 107 minutes. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every
// line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Parametric: any "small animal vs predator" story. Uses lh__lib.js (LH: kasif, label, front).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}],
//   lens: true (a magnifying glass in his front hand)}; L = label {text, x, y, at, size, color, font, card, rot}
//   gy: ground line 0..1 H (0.6); front: top of the foreground grass 0..1 H (0.615) | false
//   beetle: {x (0..1), s (scale, ~300 px long at 1), face: 1|-1}; toad: {x, s (~360 px long at 1), face}
//
// SHOTS.bmb_toad — a big toad on the ground. P: {mode: "hook"|"feed"|"gag"|"end", gy, front, toad, beetle, labels,
//   tank: false (a glass terrarium around the toad), tweezers: false (feed: a hand with tweezers lowers the beetle)}
//   hook: the toad's mouth opens (cue "open"), the beetle crawls out onto the ground puffing steam;
//   feed: the beetle is lowered on tweezers, the tongue flicks at cue "gulp", the throat bulges;
//   gag: the toad heaves (cue "gag"), the beetle flies out in an arc and lands on its feet;
//   end: the toad sits dizzy, the beetle walks off proudly (from x to `to`).
// SHOTS.bmb_beetle — the beetle up close on the ground. P: {mode: "meet"|"fire"|"end", gy, front, beetle, kasif: K,
//   ant: {x, s} (fire: an ant attacks from the right and is blasted back at cue "fire"), target: cue (meet: a red ring
//   round the abdomen tip), labels}
// SHOTS.bmb_cut — cut-away drawings. P: {mode: "beetle"|"belly", gy, front, beetle | toad, labels}
//   beetle: the giant beetle with a window on its abdomen: two tanks (gold, blue) drip into a hard red chamber at
//     cue "mix", the chamber pulses and steam blasts from the tip at cue "blast";
//   belly: the toad with an x-ray window on its belly: the swallowed beetle fires puffs inside (from cue "fire"),
//     the toad twitches and squints at every pulse.
// SHOTS.bmb_clock — a big stopwatch standing in the grass beside a bloated toad: the minute counter runs from 0 to
//   `minutes` (reached at cue "end"), then the toad spits the beetle out. P: {gy, front, toad, watch: [x, y, r],
//   minutes: 107, unit: "MIN", labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const sm = v => v * v * (3 - 2 * v);
  const fr = v => v - Math.floor(v);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const SERIF = 'Fraunces, Georgia, serif';
  // colours (tokens only)
  const SHELL = () => mix(INK.ink, INK.blue, 0.18);
  const SHELL_HI = () => mix(INK.ink, INK.paperLight, 0.35);
  const ORANGE = () => mix(INK.gold, INK.red, 0.35);
  const SPOT = () => mix(INK.gold, INK.paperLight, 0.15);
  const TOAD = () => mix(mix(INK.stain, INK.green, 0.35), INK.gold, 0.2);
  const TOAD_D = () => mix(TOAD(), INK.ink, 0.35);
  const BELLY = () => mix(INK.paperLight, INK.gold, 0.25);
  const MOUTH = () => mix(INK.red, INK.ink, 0.45);
  const STEAM = () => INK.paperLight;
  const ANT = () => mix(INK.ink, INK.red, 0.25);

  // ------------------------------------------------------------------ the bombardier beetle (side view)
  // local units: face +x, ground y = 0, ~300 long. Black wing cases with two pale spots, orange head and neck shield,
  // long beaded antennae, six jointed legs. The abdomen tip (spray nozzle) is at about (-150, -44).
  // st: {face, walk: phase (cycles) | null, rot (deg), dy, xray: 0..1 (draws the shell lighter so a window reads)}
  const B_SHELL = [[-150, -46], [-146, -82], [-120, -110], [-60, -124], [0, -118], [40, -100], [52, -64], [44, -36], [-20, -30], [-90, -30], [-134, -34]];
  const B_NECK = [[38, -98], [62, -104], [86, -92], [92, -62], [80, -40], [48, -36]];
  const B_HEAD = [[84, -84], [104, -92], [124, -82], [132, -62], [122, -44], [96, -40], [86, -56]];
  function beetle(parent, seed) {
    const g = el(parent, 'g');
    const shadow = inkEl(g, INK.ink, { 'fill-opacity': 0.16 });
    const legsFar = inkEl(g, mix(INK.ink, INK.inkSoft, 0.4));
    const shell = inkEl(g, SHELL()), shellHi = inkEl(g, SHELL_HI(), { 'fill-opacity': 0.5 }), spots = inkEl(g, SPOT());
    const neck = inkEl(g, ORANGE()), head = inkEl(g, ORANGE()), outl = inkEl(g), seams = inkEl(g, mix(INK.ink, INK.paperLight, 0.2));
    const eye = inkEl(g, INK.ink), shine = inkEl(g, INK.paperLight);
    const legs = inkEl(g, INK.ink), ant = inkEl(g, INK.ink), jaws = inkEl(g, INK.ink);
    function update(t, x, y, s, st = {}) {
      if (st.hide) { blank(shadow, legsFar, shell, shellHi, spots, neck, head, outl, seams, eye, shine, legs, ant, jaws); return null; }
      const f = st.face ?? 1, a = (st.rot || 0) * Math.PI / 180 * f, ca = Math.cos(a), sa = Math.sin(a), dy = st.dy || 0;
      const T = p => { const X = p[0] * f, Y = p[1]; return [x + (X * ca - Y * sa) * s, y + dy + (X * sa + Y * ca) * s]; };
      const TT = pts => pts.map(T);
      const k = seed * 41, w = v => Math.max(1.6, v * s), amp = Math.min(1.8, 0.5 + s * 0.7);
      shadow.setAttribute('d', st.noShadow ? '' : inkLoop(inkEllipsePts(x, y + 4, 170 * s, 16 * s, k, 10), { seed: k + 1, t, amp: 0.5 }));
      // legs: three pairs, tripod gait when walking
      const ph = st.walk;
      const LEG = (hip, knee, foot, i) => {
        let ft = foot.slice();
        if (ph != null) { const q = fr(ph + (i % 2) * 0.5); const sw = q < 0.5 ? Math.sin(q * 2 * Math.PI) : 0; ft = [foot[0] + (q < 0.5 ? lerp(-18, 18, q * 2) : lerp(18, -18, (q - 0.5) * 2)), foot[1] - sw * 16]; }
        return [hip, [knee[0] + (ft[0] - foot[0]) * 0.5, knee[1] + (ft[1] - foot[1]) * 0.3], ft];
      };
      const NEAR = [LEG([50, -44], [86, -26], [108, 0], 0), LEG([0, -36], [10, -20], [-4, 0], 1), LEG([-60, -36], [-96, -22], [-124, 0], 2)];
      const FAR = [LEG([56, -48], [96, -34], [126, -2], 1), LEG([6, -40], [26, -24], [30, -2], 2), LEG([-54, -40], [-70, -26], [-90, -2], 0)];
      legsFar.setAttribute('d', FAR.map((L, i) => inkPath(TT(L), { w: w(4.2), seed: k + 10 + i, t, amp })).join(' '));
      legs.setAttribute('d', NEAR.map((L, i) => inkPath(TT(L), { w: w(5.4), seed: k + 20 + i, t, amp })).join(' ') + ' ' +
        NEAR.map((L, i) => inkPath(TT([L[2], [L[2][0] + 10, L[2][1] + 1]]), { w: w(4), seed: k + 26 + i, t, amp: 0.4 })).join(' '));
      shell.setAttribute('fill', st.xray ? mix(SHELL(), INK.paperDark, st.xray * 0.45) : SHELL());
      shell.setAttribute('d', inkLoop(TT(B_SHELL), { seed: k + 2, t, amp }));
      shellHi.setAttribute('d', inkLoop(TT([[-120, -104], [-60, -116], [-4, -110], [-30, -100], [-90, -96]]), { seed: k + 3, t, amp }));
      spots.setAttribute('d', st.xray > 0.5 ? '' : [inkLoop(TT(inkEllipsePts(-92, -76, 20, 14, k + 4, 8, 0.2)), { seed: k + 4, t, amp }), inkLoop(TT(inkEllipsePts(-14, -78, 18, 13, k + 5, 8, -0.2)), { seed: k + 5, t, amp })].join(' '));
      neck.setAttribute('d', inkLoop(TT(B_NECK), { seed: k + 6, t, amp }));
      head.setAttribute('d', inkLoop(TT(B_HEAD), { seed: k + 7, t, amp }));
      outl.setAttribute('d', [B_SHELL, B_NECK, B_HEAD].map((p, i) => inkPath(TT(p), { w: w(4.4), seed: k + 30 + i, t, closed: true, amp })).join(' '));
      seams.setAttribute('d', st.xray > 0.5 ? '' : inkPath(TT([[-146, -70], [-90, -64], [-20, -62], [40, -70]]), { w: w(2.6), seed: k + 35, t, amp }));
      eye.setAttribute('d', inkDot(...T([112, -70]), 9 * s, 9 * s, k + 40, t));
      shine.setAttribute('d', inkDot(...T([114, -73]), 2.6 * s, 2.6 * s, k + 41, t, 0.3));
      // antennae: beaded, waving
      const wv = Math.sin(t * 2.6 + seed) * 8, wv2 = Math.sin(t * 2.1 + seed + 1) * 8;
      const A1 = [[118, -86], [150, -120 + wv], [184, -142 + wv * 1.5], [220, -150 + wv * 2]], A2 = [[112, -88], [130, -130 + wv2], [146, -170 + wv2], [158, -204 + wv2 * 1.4]];
      const AN = [inkPath(TT(A1), { w: w(3.2), seed: k + 42, t, amp }), inkPath(TT(A2), { w: w(3), seed: k + 43, t, amp })];
      [A1, A2].forEach((A, j) => { for (let i = 1; i < 6; i++) { const q = i / 6, sp = inkSpline(A, false); const p = sp[Math.round(q * (sp.length - 1))]; AN.push(inkDot(...T(p), 3.6 * s, 3.6 * s, k + 50 + j * 10 + i, t, 0.3)); } });
      ant.setAttribute('d', AN.join(' '));
      jaws.setAttribute('d', inkPath(TT([[128, -52], [142, -46], [140, -36]]), { w: w(3.6), seed: k + 60, t, amp }));
      return { tip: T([-152, -44]), tipDir: [Math.cos(Math.PI + a) * f, Math.sin(Math.PI + a) * f * (f < 0 ? -1 : 1)], T };
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ spray: pulsed boiling jet + steam
  // update(t, o): o {x, y (nozzle), ang (rad, direction of the jet), len, s, on 0..1, rate (visible pulses / s, 10)}
  function spray(parent, seed) {
    const g = el(parent, 'g');
    const faint = inkEl(g, STEAM(), { 'fill-opacity': 0.42 }), mid = inkEl(g, STEAM(), { 'fill-opacity': 0.7 }), rings = inkEl(g, INK.inkSoft);
    const jet = inkEl(g, INK.gold), hot = inkEl(g, INK.red), drops = inkEl(g, INK.gold);
    function update(t, o) {
      if (!o || !o.on) { blank(faint, mid, rings, jet, hot, drops); return; }
      const k = seed * 13, s = o.s ?? 1, len = (o.len ?? 360) * o.on, d = [Math.cos(o.ang), Math.sin(o.ang)], n = [-d[1], d[0]];
      const at = (u, side = 0) => [o.x + d[0] * u * len + n[0] * side, o.y + d[1] * u * len + n[1] * side];
      const F = [], M = [], R = [], D = [];
      const N = 9;
      for (let j = 0; j < N; j++) {
        const q = fr(t * (o.speed ?? 1.4) + j / N), u = 0.12 + q * 0.95, r = (14 + q * 52) * s * (o.puff ?? 1) * Math.min(1, o.on * 1.5);
        const c = at(u, Math.sin(j * 2.3 + t * 3) * 22 * s * q);
        (q > 0.55 ? F : M).push(inkLoop(inkEllipsePts(c[0], c[1], r, r * 0.82, k + j, 9, j, 0.14), { seed: k + 20 + j, t, amp: 1.2 }));
        if (q > 0.35 && q < 0.8) R.push(inkPath(inkEllipsePts(c[0], c[1], r * 0.8, r * 0.66, k + 40 + j, 7, j, 0.2).slice(0, 5), { w: 2.6 * s + 0.6, seed: k + 50 + j, t, amp: 0.8 }));
      }
      if (o.noJet) { faint.setAttribute('d', F.join(' ')); mid.setAttribute('d', M.join(' ')); rings.setAttribute('d', R.join(' ')); blank(jet, hot, drops); return; }
      // the jet flickers: a new pulse every 1/rate s, each pulse a short bright slug racing out
      const rate = o.rate ?? 10, P = t * rate, pq = fr(P);
      const J = [], H = [];
      if (o.stream) {   // one continuous tapered stream from the nozzle, pulses ride on it
        const th = (o.thick ?? 1) * 7 * s, NS = 10, up = [], dn = [];
        for (let i = 0; i <= NS; i++) { const u = i / NS * 0.85, wv = Math.sin(u * 14 - t * 30) * 0.18 + 1, ww = th * (0.55 + u * 0.9) * wv; up.push(at(u, -ww)); dn.unshift(at(u, ww)); }
        J.push(inkLoop(up.concat(dn), { seed: k + 60, t, amp: 0.6 }));
        const hu = [], hd = []; for (let i = 0; i <= 6; i++) { const u = i / 6 * 0.45, ww = th * 0.3 * (1 - u); hu.push(at(u, -ww)); hd.unshift(at(u, ww)); }
        H.push(inkLoop(hu.concat(hd), { seed: k + 61, t, amp: 0.4 }));
      }
      for (let i = 0; i < 4; i++) {
        const u0 = (pq + i) / 4 * 0.75, u1 = u0 + 0.11;
        const w0 = (16 - i * 2.6) * s * (o.thick ?? 1);
        J.push(inkLoop([at(u0, -w0 * 0.5), at(u1, -w0 * 0.3), at(u1 + 0.02, 0), at(u1, w0 * 0.3), at(u0, w0 * 0.5)], { seed: k + 70 + i, t, amp: 0.8 }));
        if (i < 2) H.push(inkLoop([at(u0 + 0.02, -w0 * 0.22), at(u1 - 0.02, 0), at(u0 + 0.02, w0 * 0.22)], { seed: k + 80 + i, t, amp: 0.5 }));
      }
      for (let i = 0; i < 10; i++) { const q = fr(t * 2.2 + i * 0.137), c = at(0.1 + q * 0.9, (hn(i) - 0.5) * 120 * s * q); D.push(inkDot(c[0], c[1], (4 + hn(i + 9) * 4) * s, (4 + hn(i + 9) * 4) * s, k + 90 + i, t, 0.4)); }
      faint.setAttribute('d', F.join(' ')); mid.setAttribute('d', M.join(' ')); rings.setAttribute('d', R.join(' '));
      jet.setAttribute('d', J.join(' ')); hot.setAttribute('d', H.join(' ')); drops.setAttribute('d', D.join(' '));
    }
    return { g, update };
  }
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

  // ------------------------------------------------------------------ the toad (side view, sitting)
  // local units: face +x, ground y = 0, ~360 long, ~200 tall. Warty olive-brown skin, gold eye with a horizontal pupil,
  // a fat gland behind the eye, folded hind leg, pale belly. st: {face, open 0..1 (mouth), tongue: [x, y] stage px |
  // null, tk 0..1, gulp 0..1 (throat bulge), heave 0..1 (squash, eyes shut), squint 0..1, dizzy 0..1, bloat 0..1, dy}
  // -> {mouth: [x, y] stage px (inside the mouth), belly: [x, y], T}
  const WARTS = Array.from({ length: 22 }, (_, i) => [lerp(-150, 110, hn(i, 1)), lerp(-180, -60, hn(i, 2)), 5 + hn(i, 3) * 7]);
  function toad(parent, seed) {
    const g = el(parent, 'g');
    const shadow = inkEl(g, INK.ink, { 'fill-opacity': 0.16 });
    const legFar = inkEl(g, TOAD_D());
    const body = inkEl(g, TOAD()), belly = inkEl(g, BELLY()), warts = inkEl(g, TOAD_D()), gland = inkEl(g, mix(TOAD(), INK.stain, 0.4));
    const mouthF = inkEl(g, MOUTH()), tongue = inkEl(g, mix(INK.red, INK.paperLight, 0.2));
    const leg = inkEl(g, TOAD()), outl = inkEl(g);
    const eyeF = inkEl(g, INK.gold), pupil = inkEl(g, INK.ink), lid = inkEl(g, TOAD()), lidR = inkEl(g), shine = inkEl(g, INK.paperLight);
    const extra = inkEl(g, INK.ink);
    function update(t, x, y, s, st = {}) {
      const f = st.face ?? 1, k = seed * 59, amp = Math.min(1.8, 0.6 + s * 0.6), w = v => Math.max(1.8, v * s);
      const heave = st.heave || 0, bloat = st.bloat || 0, open = st.open || 0, gulp = st.gulp || 0;
      const br = Math.sin(t * 2.4 + seed) * 0.02;
      const sy = 1 + br - heave * 0.16 + bloat * 0.06, sx = 1 + heave * 0.08 + bloat * 0.1;
      const T = p => [x + p[0] * f * s * (p[0] < 60 ? sx : 1), y + (st.dy || 0) + p[1] * s * (p[1] < 0 ? sy : 1)];
      const TT = pts => pts.map(T);
      const jaw = open * 70, thr = gulp * 28 + bloat * 10;
      // body outline: rear, back, head, snout, upper lip, (mouth) lower lip, chin, throat, belly
      const BODY = [[-170, -4], [-178, -60], [-150, -124], [-90, -170], [-10, -186], [60, -178], [110, -160], [150, -128], [178, -98],
        [176, -86 + jaw * 0.25], [160, -66 + jaw], [120, -46 + jaw * 0.6 + thr * 0.3], [70, -26 + thr * 0.6], [20, -10 + thr * 0.3], [-60, -2], [-130, 0]];
      body.setAttribute('d', inkLoop(TT(BODY), { seed: k + 1, t, amp }));
      outl.setAttribute('d', inkPath(TT(BODY), { w: w(5), seed: k + 2, t, closed: true, amp }));
      belly.setAttribute('d', inkLoop(TT([[150, -70 + jaw * 0.9], [118, -48 + jaw * 0.6 + thr * 0.3], [70, -28 + thr * 0.6], [20, -12 + thr * 0.3], [-60, -4], [-40, -26], [30, -36], [100, -58]]), { seed: k + 3, t, amp }));
      const WT = WARTS.map((q, i) => inkDot(...T([q[0], q[1]]), q[2] * s, q[2] * s * 0.8, k + 10 + i, t, 0.4));
      warts.setAttribute('d', WT.join(' '));
      gland.setAttribute('d', inkLoop(TT(inkEllipsePts(40, -158, 46, 16, k + 40, 10, 0.12)), { seed: k + 41, t, amp }));
      // mouth: a dark wedge between the lips when open
      if (open > 0.02) {
        const M = [[176, -92], [130, -88], [70, -86], [110, -80 + jaw * 0.35], [150, -76 + jaw * 0.75], [168, -78 + jaw * 0.9]];
        mouthF.setAttribute('d', inkLoop(TT(M), { seed: k + 5, t, amp: 0.8 }));
      } else mouthF.setAttribute('d', '');
      const lip = inkPath(TT([[176, -90], [130, -86], [80, -84], [56, -90]]), { w: w(4), seed: k + 6, t, amp });
      // tongue toward a stage point
      if (st.tongue && st.tk > 0) {
        const a = T([150, -78]), b = st.tongue, c = [lerp(a[0], b[0], st.tk), lerp(a[1], b[1], st.tk)];
        const n = [-(c[1] - a[1]), c[0] - a[0]], L = Math.hypot(...n) || 1, ww = 14 * s;
        tongue.setAttribute('d', inkLoop([[a[0] + n[0] / L * ww, a[1] + n[1] / L * ww], [c[0] + n[0] / L * ww * 1.3, c[1] + n[1] / L * ww * 1.3], [c[0] + (c[0] - a[0]) / L * 0.0, c[1]], [c[0] - n[0] / L * ww * 1.3, c[1] - n[1] / L * ww * 1.3], [a[0] - n[0] / L * ww, a[1] - n[1] / L * ww]], { seed: k + 7, t, amp: 0.8 }));
      } else tongue.setAttribute('d', '');
      // legs: hind leg folded (thigh + foot forward along the ground), front leg with toes
      const thigh = inkEllipsePts(-110, -58, 66, 44, k + 50, 12, -0.3);
      const foot = [[-150, -6], [-90, -4], [-20, -2], [10, 0], [-20, 6], [-100, 6]];
      const fl = [[94, -60], [104, -30], [120, -2], [150, 2], [128, 6], [100, 4]];
      leg.setAttribute('d', [inkLoop(TT(thigh), { seed: k + 51, t, amp }), inkLoop(TT(foot), { seed: k + 52, t, amp }), inkLoop(TT(fl), { seed: k + 53, t, amp })].join(' '));
      legFar.setAttribute('d', inkLoop(TT([[70, -50], [86, -24], [100, -2], [124, 0], [96, 4], [64, -20]]), { seed: k + 54, t, amp }));
      const LR = [inkPath(TT(thigh), { w: w(4.4), seed: k + 55, t, closed: true, amp }), inkPath(TT(foot), { w: w(4), seed: k + 56, t, closed: true, amp }), inkPath(TT(fl), { w: w(4), seed: k + 57, t, closed: true, amp }), lip];
      for (let i = 0; i < 3; i++) LR.push(inkPath(TT([[130 + i * 12, 2], [146 + i * 14, 6]]), { w: w(3), seed: k + 60 + i, t, amp: 0.5 }));
      shadow.setAttribute('d', inkLoop(inkEllipsePts(x + 10 * f * s, y + 6, 200 * s, 20 * s, k + 70, 10), { seed: k + 71, t, amp: 0.5 }));
      // eye: big, bulging on top of the head
      const ec = T([96, -178]), er = 30 * s * (1 + (st.dizzy ? 0.05 * Math.sin(t * 5) : 0));
      eyeF.setAttribute('d', inkCircle(ec[0], ec[1], er, k + 80, t, { fill: true }));
      const blink = fr(t / 3.1 + seed * 0.3) < 0.04 ? 1 : 0;
      const shut = Math.max(heave, st.squint || 0, blink);
      if (st.dizzy) {
        const sp = []; for (let i = 0; i <= 14; i++) { const q = i / 14 * Math.PI * 4 + t * 4, r = er * 0.75 * i / 14; sp.push([ec[0] + Math.cos(q) * r, ec[1] + Math.sin(q) * r]); }
        pupil.setAttribute('d', inkPath(sp, { w: w(3.4), seed: k + 81, t, amp: 0.4 }));
      } else pupil.setAttribute('d', inkLoop(inkEllipsePts(ec[0] + 4 * s * f, ec[1] + 2 * s, er * 0.55, er * 0.28, k + 82, 10), { seed: k + 83, t, amp: 0.5 }));
      if (shut > 0.02) {
        const ly = ec[1] - er + 2 * er * shut;
        const LP = []; for (let i = 0; i < 32; i++) { const q = i / 32 * Math.PI * 2; LP.push([ec[0] + Math.cos(q) * er * 1.04, Math.min(ly, ec[1] + Math.sin(q) * er * 1.04)]); }
        lid.setAttribute('d', inkLoop(LP, { seed: k + 84, t, amp: 0.4, smooth: false }));
        const hw = Math.sqrt(Math.max(0, er * er - (ly - ec[1]) * (ly - ec[1])));
        lidR.setAttribute('d', hw > 2 ? inkPath([[ec[0] - hw, ly], [ec[0], ly + er * 0.06], [ec[0] + hw, ly]], { w: w(4), seed: k + 85, t, amp: 0.6 }) : '');
      } else blank(lid, lidR);
      LR.push(inkCircle(ec[0], ec[1], er, k + 86, t, { w: w(4.4) }));
      outl.setAttribute('d', outl.getAttribute('d') + ' ' + LR.join(' '));
      shine.setAttribute('d', shut > 0.6 ? '' : inkDot(ec[0] - 10 * s, ec[1] - 10 * s, 5 * s, 5 * s, k + 87, t, 0.3));
      // nostril + cheek
      extra.setAttribute('d', inkDot(...T([168, -112]), 4 * s, 3 * s, k + 88, t, 0.3));
      return { mouth: T([140, -82 + jaw * 0.4]), lip: T([176, -88 + jaw * 0.5]), belly: T([-10, -90]), T };
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ an ant (side view), ~180 long
  function ant(parent, seed) {
    const g = el(parent, 'g');
    const legs = inkEl(g, INK.ink), bodyF = inkEl(g, ANT()), outl = inkEl(g), eye = inkEl(g, INK.paperLight);
    function update(t, x, y, s, st = {}) {
      const f = st.face ?? -1, k = seed * 17, a = (st.rot || 0) * Math.PI / 180 * f, ca = Math.cos(a), sa = Math.sin(a);
      const T = p => { const X = p[0] * f, Y = p[1]; return [x + (X * ca - Y * sa) * s, y + (X * sa + Y * ca) * s]; };
      const TT = pts => pts.map(T), amp = 1;
      const gst = inkEllipsePts(-70, -50, 46, 32, k, 10, 0.2), th = inkEllipsePts(0, -54, 34, 16, k + 1, 8, -0.1), hd = inkEllipsePts(54, -62, 24, 20, k + 2, 8);
      bodyF.setAttribute('d', [gst, th, hd].map((p, i) => inkLoop(TT(p), { seed: k + 3 + i, t, amp })).join(' '));
      outl.setAttribute('d', [gst, th, hd].map((p, i) => inkPath(TT(p), { w: 3.6 * s, seed: k + 6 + i, t, closed: true, amp })).join(' ') + ' ' +
        inkPath(TT([[66, -76], [92, -110], [118, -104]]), { w: 3 * s, seed: k + 9, t }) + ' ' + inkPath(TT([[70, -48], [86, -40], [84, -30]]), { w: 3.4 * s, seed: k + 10, t }));
      const ph = st.walk ?? 0, LG = [];
      for (let i = 0; i < 3; i++) { const sw = Math.sin((ph + i * 0.33) * Math.PI * 2) * 12; LG.push(inkPath(TT([[-10 + i * 14, -48], [-20 + i * 30 + sw, -80], [-40 + i * 40 + sw * 1.5, 0]]), { w: 3.4 * s, seed: k + 12 + i, t })); }
      if (st.legsUp) LG.length = 0, [0, 1, 2].forEach(i => LG.push(inkPath(TT([[-10 + i * 14, -48], [-6 + i * 20, -100], [10 + i * 24, -130 + Math.sin(t * 12 + i) * 10]]), { w: 3.4 * s, seed: k + 12 + i, t })));
      legs.setAttribute('d', LG.join(' '));
      eye.setAttribute('d', inkDot(...T([62, -68]), 4 * s, 4 * s, k + 20, t, 0.3));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ magnifying glass
  function lens(parent, seed) {
    const g = el(parent, 'g');
    const glass = inkEl(g, INK.paperLight, { 'fill-opacity': 0.25 }), rim = inkEl(g), handle = inkEl(g, mix(INK.stain, INK.ink, 0.35)), hR = inkEl(g), gl = inkEl(g, INK.paperLight, { 'fill-opacity': 0.8 });
    function update(t, hx, hy, cx, cy, r) {
      glass.setAttribute('d', inkCircle(cx, cy, r, seed, t, { fill: true }));
      rim.setAttribute('d', inkCircle(cx, cy, r, seed + 1, t, { w: 9 }));
      const d = [cx - hx, cy - hy], L = Math.hypot(...d) || 1, e = [cx - d[0] / L * r, cy - d[1] / L * r], n = [-d[1] / L * 9, d[0] / L * 9];
      const H = [[hx + n[0], hy + n[1]], [e[0] + n[0] * 0.8, e[1] + n[1] * 0.8], [e[0] - n[0] * 0.8, e[1] - n[1] * 0.8], [hx - n[0], hy - n[1]]];
      handle.setAttribute('d', inkLoop(H, { seed: seed + 2, t, smooth: false, amp: 0.8 }));
      hR.setAttribute('d', inkPath(H, { w: 4, seed: seed + 3, t, closed: true, smooth: false, amp: 0.8 }));
      gl.setAttribute('d', inkPath([[cx - r * 0.55, cy - r * 0.2], [cx - r * 0.4, cy - r * 0.5], [cx - r * 0.12, cy - r * 0.62]], { w: 7, seed: seed + 4, t, amp: 0.6 }));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ glass terrarium (back wall + floor; front rim drawn later)
  function tank(back, front, seed) {
    const wallB = inkEl(back, mix(INK.paperLight, INK.blue, 0.12), { 'fill-opacity': 0.55 }), wallR = inkEl(back, INK.inkSoft), soil = inkEl(back, mix(INK.stain, INK.ink, 0.25)), moss = inkEl(back, mix(INK.green, INK.ink, 0.2));
    const glass = inkEl(front, INK.paperLight, { 'fill-opacity': 0.18 }), rim = inkEl(front), glint = inkEl(front, INK.paperLight, { 'fill-opacity': 0.75 });
    function update(t, x0, x1, top, gy, bottom) {
      const k = seed * 7;
      const back = [[x0 + 50, top - 40], [x1 - 50, top - 40], [x1 - 50, gy - 40], [x0 + 50, gy - 40]];
      wallB.setAttribute('d', inkLoop(back, { seed: k, t, smooth: false, amp: 0.8 }));
      wallR.setAttribute('d', inkPath(back, { w: 3, seed: k + 1, t, closed: true, smooth: false }) + ' ' + inkPath([[x0, top], [x0 + 50, top - 40]], { w: 3, seed: k + 2, t }) + ' ' + inkPath([[x1, top], [x1 - 50, top - 40]], { w: 3, seed: k + 3, t }));
      soil.setAttribute('d', inkLoop([[x0, gy], [x0 + 50, gy - 40], [x1 - 50, gy - 40], [x1, gy], [x1, bottom], [x0, bottom]], { seed: k + 4, t, smooth: false, amp: 0.8 }));
      const MS = []; for (let i = 0; i < 9; i++) { const xx = lerp(x0 + 40, x1 - 40, hn(i, 5)), yy = gy - 20 + hn(i, 6) * 40; MS.push(inkLoop(inkEllipsePts(xx, yy, 34, 12, k + 10 + i, 8), { seed: k + 20 + i, t, amp: 0.6 })); }
      moss.setAttribute('d', MS.join(' '));
      const fr = [[x0, top], [x1, top], [x1, bottom], [x0, bottom]];
      glass.setAttribute('d', inkLoop(fr, { seed: k + 30, t, smooth: false, amp: 0.6 }));
      rim.setAttribute('d', inkPath(fr, { w: 6, seed: k + 31, t, closed: true, smooth: false }) + ' ' + inkPath([[x0, gy], [x1, gy]], { w: 3, seed: k + 32, t }));
      glint.setAttribute('d', inkPath([[x0 + 40, top + 60], [x0 + 110, top + 20]], { w: 7, seed: k + 33, t }) + ' ' + inkPath([[x0 + 40, top + 130], [x0 + 170, top + 40]], { w: 4, seed: k + 34, t }));
    }
    return { update };
  }

  // common frame: shadows, foreground grass, labels
  function common(ctx, root) {
    const { P, W, H, seed } = ctx;
    const L = window.LH, sd = seed * 1000 + 977;
    return {
      L, sd, u: W / 1080, gy: (P.gy ?? 0.6) * H,
      fr: () => P.front === false ? null : L.front(el(root, 'g'), sd + 60, P.frontKind || 'grass'),
    };
  }

  // ================================================================== bmb_toad
  SH.bmb_toad = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g');
      const C = common(ctx, root), { L, sd, u, gy } = C;
      const mode = P.mode || 'hook';
      const TB = el(root, 'g');
      const TF0 = el(root, 'g');
      const bug = beetle(el(root, 'g'), sd + 11), bugFront = mode === 'feed' || mode === 'gag';
      const td = toad(el(root, 'g'), sd + 21);
      const puffB = spray(el(root, 'g'), sd + 31);
      const tw = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.3)), twR = inkEl(root), hand = inkEl(root, INK.paperLight), handR = inkEl(root);
      const motion = inkEl(root, INK.inkSoft);
      const TF = el(root, 'g');
      const tk = P.tank ? tank(TB, TF, sd + 5) : null;
      const fg = C.fr();
      const lbs = labels(root, P.labels, W, H);
      const TO = Object.assign({ x: 0.42, s: 1.5, face: 1 }, P.toad || {}), BE = Object.assign({ x: 0.8, s: 0.55, face: 1 }, P.beetle || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const tx = TO.x * W, ts = TO.s * u, tf = TO.face, bs = BE.s * u;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          if (tk) tk.update(t, (P.tank.x0 ?? 0.06) * W, (P.tank.x1 ?? 0.94) * W, (P.tank.top ?? 0.3) * H, gy, (P.tank.bottom ? P.tank.bottom * H : gy + 120 * u));
          let st = { face: tf }, b = null, bst = { face: BE.face }, sprayO = null;
          let TW = null, MO = [];
          if (mode === 'hook') {
            const o = atOr(cues, 'open', 0.5), op = prog(lt, o, 0.4);
            st.open = op * 0.9; st.squint = op * 0.6; st.heave = 0.25 * op * (0.5 + 0.5 * Math.sin(t * 6));
            const r = td.update(t, tx, gy, ts, st);
            // the beetle crawls out of the mouth, then down onto the ground
            const q = clamp01((lt - o - 0.2) / 1.6), lip = r.lip;
            const bx = lerp(r.mouth[0], lip[0] + 160 * u * tf, sm(q)), by = q < 0.6 ? lerp(r.mouth[1] + 8 * u, lip[1] + 10 * u, sm(q / 0.6)) : lerp(lip[1] + 10 * u, gy, sm((q - 0.6) / 0.4));
            b = bug.update(t, bx, by, bs, { face: tf, walk: lt * 2.4, rot: q < 0.6 ? -8 : lerp(-8, 0, (q - 0.6) / 0.4), noShadow: q < 0.9 });
            sprayO = { x: r.lip[0] - 20 * u * tf, y: r.lip[1] - 30 * u, ang: -Math.PI / 2 + 0.35 * tf, len: 220 * u, s: 0.7 * u, on: op * 0.5 * (1 - q * 0.6), speed: 0.7, noJet: true };
          } else if (mode === 'feed') {
            const gp = atOr(cues, 'gulp', dur * 0.55);
            const tg = [tx + (BE.dx ?? 420) * u * tf, gy - (BE.dy ?? 380) * u];
            const flick = lt < gp ? 0 : Math.sin(clamp01((lt - gp) / 0.36) * Math.PI);
            st.open = lt < gp ? prog(lt, gp - 0.5, 0.3) * 0.25 : 0.6 * flick;
            st.tongue = tg; st.tk = flick; st.gulp = lt > gp + 0.3 ? Math.sin(clamp01((lt - gp - 0.3) / 0.8) * Math.PI) : 0;
            const r = td.update(t, tx, gy, ts, st);
            const down = prog(lt, 0, gp * 0.9);
            const by = lerp(gy - 640 * u, tg[1], down) + Math.sin(t * 6) * 4 * u;
            if (lt < gp + 0.18) {
              b = bug.update(t, tg[0], by + 30 * u, bs, { face: -tf, walk: lt * 3, noShadow: true, rot: 10 });
              TW = [tg[0] + 20 * u, by - 30 * u];
            } else bug.update(t, 0, 0, 1, { hide: true });
            if (lt >= gp + 0.18) TW = [tg[0] + 20 * u, gy - 640 * u + (lt - gp) * 60 * u];
          } else if (mode === 'gag') {
            const gg = atOr(cues, 'gag', dur * 0.3), q = clamp01((lt - gg) / 1.1);
            const pre = lt < gg ? Math.sin(t * 9) * 0.5 + 0.5 : 0;
            st.heave = lt < gg ? 0.35 + 0.35 * pre : Math.max(0, 1 - (lt - gg) / 0.6) * 0.8;
            st.open = lt < gg ? 0.1 : Math.max(0.15, 1 - q) * 0.95;
            st.squint = 0.9; st.dy = lt < gg ? -pre * 8 * u : 0;
            const r = td.update(t, tx, gy, ts, st);
            if (lt < gg) { bug.update(t, 0, 0, 1, { hide: true }); }
            else {
              const p0 = r.mouth, p1 = [tx + (BE.land ?? 0.85) * W - tx, gy];
              const x = lerp(p0[0], p1[0], q), y = lerp(p0[1], p1[1], q) - Math.sin(q * Math.PI) * 300 * u;
              const after = lt - gg - 1.1;
              b = bug.update(t, after > 0 ? p1[0] + after * 50 * u * tf : x, y, bs, { face: tf, rot: q < 1 ? q * 720 : 0, walk: after > 0.4 ? lt * 2.6 : null, noShadow: q < 0.95 });
              if (q < 1) for (let i = 1; i < 4; i++) { const qq = Math.max(0, q - i * 0.07); MO.push(inkPath([[lerp(p0[0], p1[0], qq) , lerp(p0[1], p1[1], qq) - Math.sin(qq * Math.PI) * 300 * u], [lerp(p0[0], p1[0], qq + 0.04), lerp(p0[1], p1[1], qq + 0.04) - Math.sin((qq + 0.04) * Math.PI) * 300 * u]], { w: 5, seed: sd + 300 + i, t })); }
              if (after > 0 && after < 0.6) MO.push(...[0, 1, 2].map(i => inkPath([[p1[0] - 40 * u + i * 40 * u, gy - 70 * u], [p1[0] - 60 * u + i * 60 * u, gy - 110 * u]], { w: 4, seed: sd + 320 + i, t })));
            }
          } else {   // end
            st.dizzy = 1; st.heave = 0.15; st.open = 0.12;
            td.update(t, tx, gy + 0, ts, st);
            const x0 = BE.x * W, x1 = (BE.to ?? 0.95) * W, q = clamp01(lt / Math.max(1, dur));
            b = bug.update(t, lerp(x0, x1, q), gy, bs, { face: x1 >= x0 ? 1 : -1, walk: lt * 2.4 });
            // dizzy stars over the toad's head
            const hc = [tx + 96 * ts * tf, gy - 260 * ts];
            for (let i = 0; i < 3; i++) { const a = t * 2.2 + i * 2.1, c = [hc[0] + Math.cos(a) * 90 * u, hc[1] + Math.sin(a) * 24 * u]; MO.push(inkPath([[c[0] - 16 * u, c[1]], [c[0] + 16 * u, c[1]]], { w: 5, seed: sd + 330 + i, t }), inkPath([[c[0], c[1] - 16 * u], [c[0], c[1] + 16 * u]], { w: 5, seed: sd + 333 + i, t })); }
          }
          puffB.update(t, sprayO);
          if (TW) {
            const hx = TW[0] + 30 * u, hy = TW[1] - 300 * u;
            const TWP = [[TW[0] - 6 * u, TW[1]], [hx - 14 * u, hy], [hx + 14 * u, hy], [TW[0] + 6 * u, TW[1]]];
            tw.setAttribute('d', inkLoop(TWP, { seed: sd + 400, t, smooth: false, amp: 0.6 }));
            twR.setAttribute('d', inkPath(TWP, { w: 4, seed: sd + 401, t, closed: true, smooth: false }));
            const HP = inkEllipsePts(hx, hy - 60 * u, 60 * u, 80 * u, sd + 402, 10, 0.3);
            hand.setAttribute('d', inkLoop(HP, { seed: sd + 403, t, amp: 1 }) + ' ' + inkLoop([[hx - 50 * u, hy - 120 * u], [hx + 40 * u, hy - 120 * u], [hx + 70 * u, -40], [hx - 80 * u, -40]], { seed: sd + 404, t, smooth: false, amp: 1 }));
            handR.setAttribute('d', inkPath(HP, { w: 5, seed: sd + 405, t, closed: true }) + ' ' + inkPath([[hx - 50 * u, hy - 120 * u], [hx - 80 * u, -40]], { w: 5, seed: sd + 406, t }) + ' ' + inkPath([[hx + 40 * u, hy - 120 * u], [hx + 70 * u, -40]], { w: 5, seed: sd + 407, t }));
          } else blank(tw, twR, hand, handR);
          motion.setAttribute('d', MO.join(' '));
          if (fg) fg.update(t, W, H, (P.front ?? 0.615) * H);
          lbs.forEach(l => l.update(lt, t, cues));
          root.setAttribute('transform', hit ? `translate(${f1(W / 2)} ${f1(gy)}) scale(${f1((1 + 0.05 * hit) * 1000) / 1000}) translate(${f1(-W / 2)} ${f1(-gy)})` : '');
        },
      };
    },
  };

  // ================================================================== bmb_beetle
  SH.bmb_beetle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g');
      const C = common(ctx, root), { L, sd, u, gy } = C;
      const mode = P.mode || 'meet';
      const K = P.kasif || null;
      const kas = K ? L.kasif(el(root, 'g'), K, W, H, sd + 3) : null;
      const bug = beetle(el(root, 'g'), sd + 11);
      const sp = spray(el(root, 'g'), sd + 31);
      const AN = P.ant ? ant(el(root, 'g'), sd + 41) : null;
      const ring = inkEl(root, INK.red), heat = inkEl(root, INK.red);
      const ln = K && K.lens ? lens(el(root, 'g'), sd + 51) : null;
      const fg = C.fr();
      const lbs = labels(root, P.labels, W, H);
      const BE = Object.assign({ x: 0.62, s: 1.4, face: 1 }, P.beetle || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let kr = null;
          if (kas) kr = kas.update(lt, t, cues);
          const bx0 = BE.x * W, bs = BE.s * u * (1 + 0.06 * hit);
          let bx = bx0, walk = null, rot = 0;
          if (mode === 'meet' || mode === 'end') { const q = prog(lt, 0, 1.4); bx = lerp(bx0 + (BE.from ?? 0.25) * W * BE.face * -1, bx0, q); walk = q < 1 ? lt * 2.6 : null; }
          let fire = 0, fat = atOr(cues, 'fire', dur * 0.3);
          if (mode === 'fire') { rot = -lerp(0, BE.tilt ?? 10, prog(lt, fat - 0.3, 0.3)); fire = lt >= fat ? Math.min(1, (lt - fat) / 0.25) : 0; }
          if (mode === 'end') { const pf = atOr(cues, 'puff', dur * 0.7); fire = lt >= pf ? Math.max(0, 1 - (lt - pf) / 1.2) * 0.7 : 0; }
          const b = bug.update(t, bx, gy, bs, { face: BE.face, walk, rot, dy: mode === 'fire' && fire ? Math.sin(t * 40) * 2 * u : 0 });
          sp.update(t, fire ? { x: b.tip[0], y: b.tip[1], ang: Math.atan2(b.tipDir[1], b.tipDir[0]) + (BE.aim ?? -0.12) * BE.face, len: (P.len ?? 520) * u, s: bs / u * 0.75, on: fire, rate: 12, speed: 1.8, thick: P.thick ?? 1, puff: P.puff ?? 1, stream: !!P.stream } : null);
          // heat shimmer lines over the jet
          if (mode === 'fire' && fire) {
            const HS = []; for (let i = 0; i < 3; i++) { const x = b.tip[0] - BE.face * (160 + i * 120) * u, y = b.tip[1] - 120 * u - Math.sin(t * 3 + i) * 10 * u; HS.push(inkPath([[x, y], [x - 12 * u, y - 30 * u], [x + 10 * u, y - 60 * u], [x - 8 * u, y - 90 * u]], { w: 4, seed: sd + 200 + i, t })); }
            heat.setAttribute('d', HS.join(' '));
          } else heat.setAttribute('d', '');
          // the target ring round the abdomen tip
          const ta = atOr(cues, P.target, null);
          if (ta != null && lt >= ta) {
            const r = (60 + 10 * Math.sin(t * 5)) * u * spring(lt, ta, 0.5);
            ring.setAttribute('d', inkCircle(b.tip[0], b.tip[1], r, sd + 210, t, { w: 7 }) + ' ' + inkPath([[b.tip[0] - BE.face * r * 0.7, b.tip[1] - r * 0.7], [b.tip[0] - BE.face * r * 1.8, b.tip[1] - r * 1.8]], { w: 7, seed: sd + 211, t }));
          } else ring.setAttribute('d', '');
          if (AN) {
            const ax = (P.ant.x ?? 0.15) * W, as = (P.ant.s ?? 1) * u;
            if (!fire) AN.update(t, lerp(ax + 120 * u * BE.face * -1, ax, prog(lt, 0, fat)), gy, as, { face: BE.face, walk: lt * 2.5 });
            else { const q = prog(lt, fat, 0.8); AN.update(t, ax - BE.face * q * (P.ant.fly ?? 260) * u, gy - Math.sin(q * Math.PI) * (P.ant.up ?? 160) * u, as, { face: BE.face, rot: q * 180, legsUp: true }); }
          }
          if (ln) {
            const lr = (K.lensR ?? 110) * u, cx = (K.lensAt ? K.lensAt[0] : 0.6) * W + Math.sin(t * 1.3) * 8 * u, cy = (K.lensAt ? K.lensAt[1] : 0.5) * H + Math.cos(t * 1.1) * 6 * u;
            const hd = K.lensHandle || [-0.7, 0.7], hl = Math.hypot(hd[0], hd[1]) || 1;
            ln.update(t, cx + hd[0] / hl * lr * 2.3, cy + hd[1] / hl * lr * 2.3, cx, cy, lr);
          }
          if (fg) fg.update(t, W, H, (P.front ?? 0.615) * H);
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== bmb_cut
  SH.bmb_cut = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed, defs } = ctx;
      const root = el(ctx.svg, 'g');
      const C = common(ctx, root), { L, sd, u, gy } = C;
      const mode = P.mode || 'beetle';
      const bug = mode === 'beetle' ? beetle(el(root, 'g'), sd + 11) : null;
      const td = mode === 'belly' ? toad(el(root, 'g'), sd + 21) : null;
      const cid = 'bmbclip' + seed + '_' + Math.round(sd);
      const cp = el(defs || ctx.svg, 'clipPath', { id: cid }), cpE = el(cp, 'path');
      const winBg = inkEl(root, mix(INK.paperLight, INK.red, 0.08));
      const inner = el(root, 'g', { 'clip-path': `url(#${cid})` });
      // beetle inside: tanks, tube, chamber, drops
      const tankA = inkEl(inner, INK.gold), tankB = inkEl(inner, mix(INK.blue, INK.paperLight, 0.35)), tubes = inkEl(inner, mix(INK.paperDark, INK.inkSoft, 0.3));
      const cham = inkEl(inner, mix(INK.red, INK.paperLight, 0.25)), chamGlow = inkEl(inner, INK.gold), drops = inkEl(inner, INK.gold), dropsB = inkEl(inner, INK.blue), innerR = inkEl(inner);
      const ib = mode === 'belly' ? beetle(el(inner, 'g'), sd + 71) : null;
      const isp = mode === 'belly' ? spray(el(inner, 'g'), sd + 81) : null;
      const winR = inkEl(root);
      const out = spray(el(root, 'g'), sd + 31);
      const twitch = inkEl(root, INK.inkSoft);
      const fg = C.fr();
      const lbs = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          if (mode === 'beetle') {
            const BE = Object.assign({ x: 0.5, s: 3.2, face: 1 }, P.beetle || {}), bs = BE.s * u, f = BE.face;
            const mx = atOr(cues, 'mix', dur * 0.3), bl = atOr(cues, 'blast', dur * 0.75);
            const blast = lt >= bl ? Math.min(1, (lt - bl) / 0.25) : 0;
            const b = bug.update(t, BE.x * W, gy, bs, { face: f, xray: 1, dy: blast ? Math.sin(t * 40) * 2 * u : 0 });
            const T = b.T;
            // window over the abdomen
            const WIN = [[-142, -50], [-140, -88], [-110, -112], [-40, -118], [20, -108], [34, -70], [20, -40], [-60, -36], [-120, -38]];
            const wp = WIN.map(T);
            const d = inkLoop(wp, { seed: sd + 500, t, amp: 0.8 });
            cpE.setAttribute('d', d); winBg.setAttribute('d', d);
            const R = [];
            // two tanks (reservoirs) up front, a tube to the chamber at the rear
            const tA = inkEllipsePts(-10, -92, 26, 16, sd + 510, 10), tB = inkEllipsePts(-10, -58, 26, 15, sd + 511, 10);
            const lvl = 1 - 0.25 * prog(lt, mx, dur - mx);
            tankA.setAttribute('d', inkLoop(tA.map(T), { seed: sd + 512, t, amp: 0.8 }));
            tankB.setAttribute('d', inkLoop(tB.map(T), { seed: sd + 513, t, amp: 0.8 }));
            R.push(inkPath(tA.map(T), { w: 5, seed: sd + 514, t, closed: true }), inkPath(tB.map(T), { w: 5, seed: sd + 515, t, closed: true }));
            const tubeA = [[-36, -92], [-70, -84], [-96, -70]], tubeB = [[-36, -58], [-70, -60], [-96, -66]];
            tubes.setAttribute('d', [tubeA, tubeB].map((p, i) => inkPath(p.map(T), { w: 10 * bs / 3.2 / u * u, seed: sd + 520 + i, t })).join(' '));
            // chamber: thick hard wall, glows and swells when the mix arrives
            const glow = lt >= mx + 0.6 ? 0.6 + 0.4 * Math.sin(t * 22) : 0;
            const cr = 1 + 0.08 * glow;
            const CH = inkEllipsePts(-118, -66, 22 * cr, 18 * cr, sd + 530, 10);
            cham.setAttribute('d', inkLoop(CH.map(T), { seed: sd + 531, t, amp: 0.8 }));
            chamGlow.setAttribute('d', glow ? inkLoop(inkEllipsePts(-118, -66, 12 * glow, 10 * glow, sd + 532, 8).map(T), { seed: sd + 533, t, amp: 0.8 }) : '');
            R.push(inkPath(CH.map(T), { w: 11, seed: sd + 534, t, closed: true }));
            R.push(inkPath([[-138, -60], [-150, -46]].map(T), { w: 9, seed: sd + 535, t }));
            // drops racing down the tubes from cue "mix"
            const DA = [], DB = [];
            if (lt >= mx) for (let i = 0; i < 5; i++) {
              const q = fr((lt - mx) * 1.2 + i / 5);
              [[tubeA, DA], [tubeB, DB]].forEach(([tb, arr]) => { const spn = inkSpline(tb, false), p = spn[Math.min(spn.length - 1, Math.floor(q * spn.length))]; arr.push(inkDot(...T(p), 9 * u * bs / (3.2 * u), 7 * u * bs / (3.2 * u), sd + 540 + i, t, 0.5)); });
            }
            drops.setAttribute('d', DA.join(' ')); dropsB.setAttribute('d', DB.join(' '));
            innerR.setAttribute('d', R.join(' '));
            winR.setAttribute('d', inkPath(wp, { w: 6, seed: sd + 550, t, closed: true, amp: 0.8 }) + ' ' + inkPath(wp, { w: 2.4, seed: sd + 551, t, closed: true, amp: 2.4 }));
            out.update(t, blast ? { x: b.tip[0], y: b.tip[1], ang: Math.PI * (f > 0 ? 1 : 0) - 0.2 * f, len: 520 * u, s: 1.1 * u, on: blast, rate: 12, speed: 1.8 } : null);
            twitch.setAttribute('d', '');
          } else {   // belly
            const TO = Object.assign({ x: 0.5, s: 2.4, face: 1 }, P.toad || {}), ts = TO.s * u;
            const fa = atOr(cues, 'fire', 0.3), empty = !!P.empty;
            const pulse = !empty && lt >= fa ? Math.pow(Math.max(0, Math.sin((lt - fa) * Math.PI * 2.2)), 6) : 0;
            const r = td.update(t, TO.x * W, gy, ts, empty ? { face: TO.face, squint: 0.55, bloat: 0.45 + 0.05 * Math.sin(t * 2), open: 0 } : { face: TO.face, squint: 0.3 + 0.7 * pulse, heave: 0.2 * pulse, bloat: 0.4, open: 0.04 + 0.1 * pulse, dy: -pulse * 10 * u });
            const T = r.T;
            const WIN = inkEllipsePts(-20, -96, 105, 62, sd + 600, 14);
            const wp = WIN.map(T), d = inkLoop(wp, { seed: sd + 601, t, amp: 0.8 });
            cpE.setAttribute('d', d); winBg.setAttribute('d', d);
            winBg.setAttribute('fill', mix(INK.paperLight, INK.red, 0.2));
            const c = T([-10, -92]), bs = 0.42 * ts;
            const bb = ib.update(t, c[0] + 40 * bs, c[1] + 40 * bs, bs, { face: -TO.face, rot: -14 + Math.sin(t * 3) * 6, noShadow: true, walk: lt * 1.5 });
            isp.update(t, !empty && lt >= fa ? { x: bb.tip[0], y: bb.tip[1], ang: Math.atan2(bb.tipDir[1], bb.tipDir[0]), len: 300 * u, s: 0.7 * u, on: 0.4 + 0.6 * pulse, rate: 12, speed: 1.6 } : null);
            blank(tankA, tankB, tubes, cham, chamGlow, drops, dropsB);
            innerR.setAttribute('d', empty ? '' : [0, 1, 2].map(i => inkPath(inkEllipsePts(c[0], c[1] + 10 * u, (60 + i * 50) * u * (0.8 + 0.4 * pulse), (40 + i * 30) * u, sd + 610 + i, 10).slice(2, 9), { w: 3, seed: sd + 615 + i, t })).join(' '));
            winR.setAttribute('d', inkPath(wp, { w: 6, seed: sd + 620, t, closed: true, amp: 0.8 }));
            // twitch marks round the toad on every pulse
            if (pulse > 0.2) { const hc = T([20, -120]), TW = []; for (let i = 0; i < 4; i++) { const a = -2.6 + i * 0.5, r0 = 300 * ts / 2.4; TW.push(inkPath([[hc[0] + Math.cos(a) * r0, hc[1] + Math.sin(a) * r0], [hc[0] + Math.cos(a) * (r0 + 60 * u), hc[1] + Math.sin(a) * (r0 + 60 * u)]], { w: 6, seed: sd + 630 + i, t })); } twitch.setAttribute('d', TW.join(' ')); }
            else twitch.setAttribute('d', '');
            out.update(t, null);
          }
          if (fg) fg.update(t, W, H, (P.front ?? 0.615) * H);
          lbs.forEach(l => l.update(lt, t, cues));
          root.setAttribute('transform', hit ? `translate(${f1(W / 2)} ${f1(gy)}) scale(${f1((1 + 0.04 * hit) * 1000) / 1000}) translate(${f1(-W / 2)} ${f1(-gy)})` : '');
        },
      };
    },
  };

  // ================================================================== bmb_clock
  SH.bmb_clock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g');
      const C = common(ctx, root), { L, sd, u, gy } = C;
      const post = inkEl(root, mix(INK.stain, INK.ink, 0.35)), postR = inkEl(root);
      const face = inkEl(root, INK.paperLight), rim = inkEl(root), ticks = inkEl(root), wedge = inkEl(root, INK.red, { 'fill-opacity': 0.35 }), hand = inkEl(root, INK.red), crown = inkEl(root, INK.inkSoft), crownR = inkEl(root);
      const num = el(root, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, fill: INK.ink });
      const unit = el(root, 'text', { 'text-anchor': 'middle', 'font-family': INK_FONT, fill: INK.inkSoft });
      const bug = beetle(el(root, 'g'), sd + 11);
      const td = toad(el(root, 'g'), sd + 21);
      const motion = inkEl(root, INK.inkSoft);
      const fg = C.fr();
      const lbs = labels(root, P.labels, W, H);
      const TO = Object.assign({ x: 0.66, s: 1.35, face: -1 }, P.toad || {});
      const WP = P.watch || [0.3, 0.33, 210];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const end = atOr(cues, 'end', dur * 0.75), mins = P.minutes ?? 107;
          const q = clamp01(lt / Math.max(0.5, end)), val = Math.round(mins * Math.pow(sm(q), 0.9));
          const hit = punch(lt, end, 0.7);
          const x = WP[0] * W, y = WP[1] * H, r = WP[2] * u * (1 + 0.06 * hit);
          const k = sd + 700;
          post.setAttribute('d', inkLoop([[x - 16 * u, y + r], [x + 16 * u, y + r], [x + 20 * u, gy + 30 * u], [x - 20 * u, gy + 30 * u]], { seed: k, t, smooth: false }));
          postR.setAttribute('d', inkPath([[x - 16 * u, y + r], [x + 16 * u, y + r], [x + 20 * u, gy + 30 * u], [x - 20 * u, gy + 30 * u]], { w: 5, seed: k + 1, t, closed: true, smooth: false }));
          face.setAttribute('d', inkCircle(x, y, r, k + 2, t, { fill: true }));
          rim.setAttribute('d', inkCircle(x, y, r, k + 3, t, { w: 12 }) + ' ' + inkCircle(x, y, r * 0.9, k + 4, t, { w: 3 }));
          const TK = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; TK.push(inkPath([[x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78], [x + Math.sin(a) * r * 0.88, y - Math.cos(a) * r * 0.88]], { w: i % 3 ? 3 : 6, seed: k + 10 + i, t, amp: 0.4 })); }
          ticks.setAttribute('d', TK.join(' '));
          // the sweep hand goes round once per "minute"-tick burst; the red wedge fills the elapsed fraction of 2 hours
          const frac = val / 120, ha = frac * Math.PI * 2;
          const WG = [[x, y]]; for (let i = 0; i <= 24; i++) { const a = ha * i / 24; WG.push([x + Math.sin(a) * r * 0.76, y - Math.cos(a) * r * 0.76]); }
          wedge.setAttribute('d', frac > 0.01 ? inkLoop(WG, { seed: k + 30, t, smooth: false, amp: 0.6 }) : '');
          hand.setAttribute('d', inkPath([[x, y], [x + Math.sin(ha) * r * 0.8, y - Math.cos(ha) * r * 0.8]], { w: 9, seed: k + 31, t, amp: 0.4 }) + ' ' + inkDot(x, y, 14 * u, 14 * u, k + 32, t));
          const cy = y - r - 26 * u, CR = [[x - 30 * u, cy - 20 * u], [x + 30 * u, cy - 20 * u], [x + 26 * u, cy + 18 * u], [x - 26 * u, cy + 18 * u]];
          crown.setAttribute('d', inkLoop(CR, { seed: k + 33, t, smooth: false }) + ' ' + inkLoop([[x - 50 * u, cy - 44 * u], [x + 50 * u, cy - 44 * u], [x + 50 * u, cy - 22 * u], [x - 50 * u, cy - 22 * u]], { seed: k + 34, t, smooth: false }));
          crownR.setAttribute('d', inkPath(CR, { w: 5, seed: k + 35, t, closed: true, smooth: false }));
          num.setAttribute('x', f1(x)); num.setAttribute('y', f1(y + r * 0.2)); num.setAttribute('font-size', f1(r * 0.62));
          num.setAttribute('fill', lt >= end ? INK.red : INK.ink);
          num.textContent = String(val);
          unit.setAttribute('x', f1(x)); unit.setAttribute('y', f1(y + r * 0.52)); unit.setAttribute('font-size', f1(Math.max(44 * u, r * 0.26)));
          unit.textContent = P.unit || 'MIN';
          // the toad: bloated and uneasy, then it spits the beetle out at "end"
          const tx = TO.x * W, ts = TO.s * u, tf = TO.face;
          const qq = clamp01((lt - end) / 1.0);
          const wob = Math.pow(Math.max(0, Math.sin(t * 4.4)), 8);
          const r2 = td.update(t, tx, gy, ts, { face: tf, bloat: lt < end ? 0.6 : 0.6 * (1 - qq), squint: lt < end ? 0.4 + 0.5 * wob : 0.9, heave: lt < end ? 0.3 * wob : Math.max(0, 0.9 - qq), open: lt < end ? 0.05 : Math.max(0.1, 1 - qq) * 0.9, dy: -wob * 6 * u });
          const MO = [];
          if (lt < end) { bug.update(t, 0, 0, 1, { hide: true }); const hc = r2.T([0, -200]); for (let i = 0; i < 3; i++) { if (wob > 0.3) MO.push(inkPath([[hc[0] - 60 * u + i * 60 * u, hc[1] - 40 * u], [hc[0] - 70 * u + i * 70 * u, hc[1] - 80 * u]], { w: 5, seed: sd + 800 + i, t })); } }
          else {
            const p0 = r2.mouth, p1 = [lerp(tx, x, 0.45), gy];
            const bx = lerp(p0[0], p1[0], qq), by = lerp(p0[1], p1[1], qq) - Math.sin(qq * Math.PI) * 220 * u;
            bug.update(t, qq < 1 ? bx : p1[0] + (lt - end - 1) * 40 * u * tf, by, 0.5 * u, { face: tf, rot: qq < 1 ? qq * 540 : 0, walk: qq >= 1 ? lt * 2.6 : null, noShadow: qq < 0.95 });
          }
          motion.setAttribute('d', MO.join(' '));
          if (fg) fg.update(t, W, H, (P.front ?? 0.615) * H);
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
