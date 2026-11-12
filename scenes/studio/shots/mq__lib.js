// mq__lib: shared drawing helpers for the mq_* shots (mosquito magnets: the Rockefeller University nylon-stocking
// study, Cell 2022). Not a shot type. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*),
// every line boils at 8 Hz via _ink.js, everything is a pure function of (seed, t); no Math.random.
// window.MQ = {
//   mosquito(parent, seed, kind) -> {update(t, x, y, s, o)}: a hand-drawn mosquito in side view, head at +x when
//     face = 1. ~230 units long incl. proboscis, legs reach ~+95 below the thorax. kind: "aedes" (dark, white abdomen
//     bands + white lyre on the thorax), "tiger" (dark, one bold white stripe down the back), "culex" (plain brown).
//     o: {face: 1|-1, ang: deg (nose down > 0), land: false (legs spread to the ground, wings folded), buzz: true}
//   swarm(parent, n, seed, kind) -> {update(t, cx, cy, rx, ry, s, o)}: n mosquitoes orbiting a centre on figure-eight
//     paths. o: {arrive: 0..1 (fly in from `from`), from: [x, y], count: n (how many are visible), ring: false (orbit an
//     ellipse of radii rx/ry round the centre instead of filling it)}
//   stocking(parent, seed) -> {update(t, x, y, L, w, ang, o)}: a sheer nylon stocking hanging from its top hem at
//     (x, y), length L, width w, swing angle ang (deg). o: {flip: false (toe to the left), sheer: 0.5}
//   wisp(parent, seed, col) -> {update(t, pts, k)}: rising odour wisps: wavy gold lines from pts [[x, y, len], ...]
//     (k = 0..1 grow)
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const D = Math.PI / 180;

  // ------------------------------------------------------------------ mosquito
  function mosquito(parent, seed, kind = 'aedes') {
    const g = el(parent, 'g');
    const body = kind === 'culex' ? mix(INK.stain, INK.ink, 0.45) : mix(INK.ink, INK.inkSoft, 0.15);
    const legsFar = inkEl(g, mix(INK.ink, INK.inkSoft, 0.5)), wingB = inkEl(g, INK.paperLight, { 'fill-opacity': 0.5 }), wingBR = inkEl(g, INK.inkSoft);
    const legs = inkEl(g, INK.ink);
    const abd = inkEl(g, body), thx = inkEl(g, body), head = inkEl(g, body), outl = inkEl(g), marks = inkEl(g, INK.paperLight), eye = inkEl(g, INK.ink);
    const prob = inkEl(g, INK.ink), ant = inkEl(g, INK.ink);
    const wingF = inkEl(g, INK.paperLight, { 'fill-opacity': 0.55 }), wingFR = inkEl(g, INK.inkSoft);
    function update(t, x, y, s, o = {}) {
      if (o.hide) { [legsFar, wingB, wingBR, legs, abd, thx, head, outl, marks, eye, prob, ant, wingF, wingFR].forEach(e => e.setAttribute('d', '')); return; }
      const f = o.face ?? 1, a = (o.ang || 0) * D * f, ca = Math.cos(a), sa = Math.sin(a), land = !!o.land;
      const T = (p) => { const X = p[0] * f, Y = p[1]; return [x + (X * ca - Y * sa) * s, y + (X * sa + Y * ca) * s]; };
      const TT = pts => pts.map(T);
      const k = seed * 37, w = (v) => Math.max(1.6, v * s), amp = Math.min(1.6, 0.4 + s * 1.2);
      // abdomen (slightly drooping), thorax hump, head
      const ab = inkEllipsePts(-72, 10, 58, 13, k + 1, 12, 0.16, 0.04);
      abd.setAttribute('d', inkLoop(TT(ab), { seed: k + 2, t, amp }));
      const th = inkEllipsePts(0, -2, 27, 22, k + 3, 10, -0.2, 0.05);
      thx.setAttribute('d', inkLoop(TT(th), { seed: k + 4, t, amp }));
      const hd = inkEllipsePts(34, 5, 13, 12, k + 5, 8, 0, 0.04);
      head.setAttribute('d', inkLoop(TT(hd), { seed: k + 6, t, amp }));
      outl.setAttribute('d', [ab, th, hd].map((p, i) => inkPath(TT(p), { w: w(3.2), seed: k + 7 + i, t, closed: true, amp })).join(' '));
      const M = [];
      if (kind === 'aedes') {
        for (let i = 0; i < 5; i++) { const xx = -36 - i * 16, yy = 4 + i * 2.6; M.push(inkPath(TT([[xx, yy - 11], [xx - 3, yy + 12]]), { w: w(4.2), seed: k + 20 + i, t, amp: amp * 0.6 })); }
        M.push(inkPath(TT([[-14, -14], [-2, -20], [12, -14]]), { w: w(3.2), seed: k + 26, t, amp: amp * 0.6 }));
        M.push(inkPath(TT([[-10, -6], [0, -11], [10, -6]]), { w: w(2.6), seed: k + 27, t, amp: amp * 0.6 }));
      } else if (kind === 'tiger') {
        M.push(inkPath(TT([[-22, -14], [0, -21], [22, -10], [38, -4]]), { w: w(6), seed: k + 26, t, amp: amp * 0.6 }));
        for (let i = 0; i < 4; i++) { const xx = -44 - i * 18, yy = 5 + i * 3; M.push(inkPath(TT([[xx, yy - 10], [xx - 2, yy + 11]]), { w: w(3), seed: k + 20 + i, t, amp: amp * 0.6 })); }
      }
      marks.setAttribute('d', M.join(' '));
      eye.setAttribute('d', inkLoop(TT(inkEllipsePts(37, 3, 7, 8, k + 30, 8)), { seed: k + 31, t, amp: amp * 0.5 }));
      prob.setAttribute('d', inkPath(TT([[44, 10], [74, 22], [104, 36]]), { w: w(3.4), seed: k + 32, t, amp, taper: 0.5 }));
      const AN = [inkPath(TT([[42, -2], [58, -22], [70, -34]]), { w: w(2.6), seed: k + 33, t, amp }), inkPath(TT([[44, 2], [66, -8], [82, -14]]), { w: w(2.4), seed: k + 34, t, amp })];
      for (let i = 1; i < 4; i++) { const q = i / 4, p = [lerp(42, 70, q), lerp(-2, -34, q)]; AN.push(inkPath(TT([[p[0] - 6, p[1] - 4], [p[0] + 6, p[1] + 4]]), { w: w(1.8), seed: k + 35 + i, t, amp: 0 })); }
      ant.setAttribute('d', AN.join(' '));
      // wings: buzz between two angles every frame (reads as a blur of beating wings)
      const fr = Math.floor(t * 30 + seed * 0.37) % 2;
      const wa = land ? -6 : (o.buzz === false ? -22 : (fr ? -40 : -8));
      const wing = (base, ang, len, wd) => {
        const d = [-Math.cos(ang * D), Math.sin(ang * D)], nr = [d[1], -d[0]], P = [];
        for (let i = 0; i <= 9; i++) { const u = i / 9, ww = Math.sin(Math.pow(u, 0.8) * Math.PI) * wd; P.push([base[0] + d[0] * u * len + nr[0] * ww, base[1] + d[1] * u * len + nr[1] * ww]); }
        for (let i = 9; i >= 0; i--) { const u = i / 9, ww = Math.sin(Math.pow(u, 0.8) * Math.PI) * wd * 0.45; P.push([base[0] + d[0] * u * len - nr[0] * ww, base[1] + d[1] * u * len - nr[1] * ww]); }
        return { P: TT(P), vein: TT([base, [base[0] + d[0] * len * 0.95, base[1] + d[1] * len * 0.95]]) };
      };
      const wf = wing([-6, -16], wa, 104, 17), wb = wing([-2, -18], wa - 14, 96, 14);
      wingB.setAttribute('d', inkLoop(wb.P, { seed: k + 40, t, amp })); wingBR.setAttribute('d', inkPath(wb.P, { w: w(2), seed: k + 41, t, closed: true, amp }));
      wingF.setAttribute('d', inkLoop(wf.P, { seed: k + 42, t, amp })); wingFR.setAttribute('d', inkPath(wf.P, { w: w(2.4), seed: k + 43, t, closed: true, amp }) + ' ' + inkPath(wf.vein, { w: w(1.6), seed: k + 44, t, amp }));
      // legs: long, thin, two joints; dangling while flying, splayed when landed
      const sw = land ? 0 : Math.sin(t * 3 + seed) * 6;
      const LG = land
        ? [[[12, 16], [52, -10], [92, 70]], [[2, 18], [10, -20], [8, 72]], [[-8, 16], [-46, -16], [-96, 70]]]
        : [[[12, 16], [48, 34 + sw], [80, 96 + sw]], [[2, 18], [8, 52], [6 + sw, 110]], [[-8, 16], [-40, 40 - sw], [-86, 98 - sw]]];
      legs.setAttribute('d', LG.map((L, i) => inkPath(TT(L), { w: w(2.8), seed: k + 50 + i, t, amp, taper: 0.4 })).join(' '));
      legsFar.setAttribute('d', LG.map((L, i) => inkPath(TT(L.map((p, j) => j ? [p[0] + 12, p[1] - 6] : p)), { w: w(2.2), seed: k + 60 + i, t, amp, taper: 0.4 })).join(' '));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ swarm
  function swarm(parent, n, seed, kind = 'aedes') {
    const r = rng(inkHash(seed, 4242)), M = [], Q = [];
    for (let i = 0; i < n; i++) {
      M.push(mosquito(parent, seed * 10 + i, Array.isArray(kind) ? kind[i % kind.length] : kind));
      Q.push({ w: 0.9 + r() * 0.9, ph: r() * Math.PI * 2, ph2: r() * Math.PI * 2, rx: 0.45 + r() * 0.55, ry: 0.4 + r() * 0.6, sz: 0.8 + r() * 0.35, lag: r() * 0.4 });
    }
    function update(t, cx, cy, rx, ry, s, o = {}) {
      const cnt = o.count ?? n;
      M.forEach((m, i) => {
        if (i >= cnt) { m.update(t, 0, 0, s, { hide: true }); return; }
        const q = Q[i], a = t * q.w + q.ph;
        let x, y, vx;
        if (o.ring) { const rr = 0.85 + 0.3 * q.rx; x = cx + Math.cos(a) * rx * rr; y = cy + Math.sin(a) * ry * rr + Math.sin(a * 3 + q.ph2) * ry * 0.12; vx = -Math.sin(a); }
        else { x = cx + Math.sin(a) * rx * q.rx; y = cy + Math.sin(2 * a + q.ph2) * ry * q.ry * 0.7 + Math.cos(a * 0.7) * ry * 0.25; vx = Math.cos(a); }
        const ar = o.arrive == null ? 1 : clamp01((o.arrive - q.lag * 0.5) / 0.6);
        if (ar < 1 && o.from) { const e = ar * ar * (3 - 2 * ar); x = lerp(o.from[0], x, e); y = lerp(o.from[1], y, e) - Math.sin(e * Math.PI) * 60; }
        m.update(t, x, y, s * q.sz, { face: ar < 1 && o.from ? (o.from[0] < cx ? 1 : -1) : (vx >= 0 ? 1 : -1), ang: Math.sin(a * 2) * 10 });
      });
    }
    return { update };
  }

  // ------------------------------------------------------------------ nylon stocking
  function stocking(parent, seed) {
    const g = el(parent, 'g');
    const nyl = mix(INK.stain, INK.ink, 0.3);
    const fill = inkEl(g, nyl, { 'fill-opacity': 0.5 }), mesh = inkEl(g, mix(nyl, INK.ink, 0.4)), outl = inkEl(g), band = inkEl(g, mix(nyl, INK.ink, 0.35));
    function update(t, x, y, L, w, ang = 0, o = {}) {
      const fl = o.flip ? -1 : 1, a = ang * D, c = Math.cos(a), s = Math.sin(a), k = seed * 13;
      const T = p => [x + (p[0] * fl * c - p[1] * s), y + (p[0] * fl * s + p[1] * c)];
      const S = [[-0.5, 0], [-0.46, 0.4], [-0.42, 0.74], [-0.5, 0.88], [-0.32, 1.0], [0.4, 1.03], [0.98, 0.99], [1.08, 0.9], [0.86, 0.83], [0.42, 0.78], [0.44, 0.4], [0.5, 0]].map(p => T([p[0] * w, p[1] * L]));
      fill.setAttribute('d', inkLoop(S, { seed: k + 1, t, amp: 1 }));
      outl.setAttribute('d', inkPath(S, { w: 4, seed: k + 2, t, closed: true, amp: 1 }));
      const ME = [];
      for (let i = 1; i < 9; i++) { const v = i / 9 * 0.76; ME.push(inkPath([T([-0.46 * w, v * L]), T([0.44 * w, (v + 0.03) * L])], { w: 2, seed: k + 10 + i, t, amp: 0.6 })); }
      for (let i = 0; i < 5; i++) { const u = -0.38 + i * 0.19; ME.push(inkPath([T([u * w, 0.06 * L]), T([(u + 0.04) * w, 0.74 * L])], { w: 1.6, seed: k + 30 + i, t, amp: 0.6 })); }
      ME.push(inkPath([T([-0.3 * w, 0.92 * L]), T([0.9 * w, 0.92 * L])], { w: 2, seed: k + 40, t, amp: 0.6 }));
      mesh.setAttribute('d', ME.join(' '));
      band.setAttribute('d', inkLoop([T([-0.52 * w, -0.02 * L]), T([0.52 * w, -0.02 * L]), T([0.51 * w, 0.07 * L]), T([-0.5 * w, 0.07 * L])], { seed: k + 50, t, amp: 0.8, smooth: false }));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ odour wisps
  function wisp(parent, seed, col) {
    const p = inkEl(parent, col || INK.gold);
    function update(t, pts, k = 1) {
      p.setAttribute('d', k <= 0 ? '' : pts.map((q, i) => {
        const len = q[2] * k, P = [];
        for (let j = 0; j <= 8; j++) { const u = j / 8; P.push([q[0] + Math.sin(u * 7 + t * 2.4 + i * 1.7) * 18 * u + Math.sin(t * 0.8 + i) * 10 * u, q[1] - u * len]); }
        return inkPath(P, { w: q[3] || 5, seed: seed + i * 7, t, amp: 1, taper: 0.6 });
      }).join(' '));
    }
    return { update };
  }

  // ------------------------------------------------------------------ plain lab bench (foreground, no objects)
  function bench(parent, seed) {
    const g = el(parent, 'g');
    const wood = mix(INK.stain, INK.paperDark, 0.25), woodD = mix(INK.stain, INK.ink, 0.35);
    const topF = inkEl(g, mix(wood, INK.paperLight, 0.25)), frontF = inkEl(g, wood), frontR = inkEl(g), grain = inkEl(g, woodD), knobs = inkEl(g, INK.ink);
    function update(t, W, H, top) {
      const k = seed * 9, u = W / 1080, th = 40 * u, x0 = -30, x1 = W + 30;
      const slab = [[x0, top], [x1, top], [x1, top + th], [x0, top + th]];
      topF.setAttribute('d', inkLoop(slab, { seed: k + 1, t, smooth: false, amp: 1 }));
      frontF.setAttribute('d', inkLoop([[x0, top + th], [x1, top + th], [x1, H + 40], [x0, H + 40]], { seed: k + 2, t, smooth: false, amp: 1 }));
      const FR = [inkPath(slab, { w: 6, seed: k + 3, t, closed: true, smooth: false })], KN = [], GR = [];
      for (let i = 1; i < 3; i++) FR.push(inkPath([[W * i / 3, top + th], [W * i / 3, H + 40]], { w: 5, seed: k + 6 + i, t }));
      FR.push(inkPath([[x0, top + th + 220 * u], [x1, top + th + 220 * u]], { w: 4, seed: k + 12, t }));
      for (let i = 0; i < 3; i++) { const xx = W * (i + 0.5) / 3; KN.push(inkDot(xx, top + th + 110 * u, 26 * u, 10 * u, k + 14 + i, t), inkDot(xx, top + th + 380 * u, 26 * u, 10 * u, k + 18 + i, t)); }
      const r = rng(inkHash(seed, 5));
      for (let i = 0; i < 9; i++) { const y = top + th + 30 * u + r() * (H - top - th - 60 * u), xa = r() * W * 0.7; GR.push(inkPath([[xa, y], [xa + 120 * u + r() * 200 * u, y + 2]], { w: 2.2, seed: k + 30 + i, t })); }
      frontR.setAttribute('d', FR.join(' ')); knobs.setAttribute('d', KN.join(' ')); grain.setAttribute('d', GR.join(' '));
    }
    return { g, update };
  }

  window.MQ = { f1, mosquito, swarm, stocking, wisp, bench };
})();
