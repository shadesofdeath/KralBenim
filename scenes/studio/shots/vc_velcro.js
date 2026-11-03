// vc_velcro: shots for the Stickstory Short "Velcro" (2026-11-03): in the Swiss Alps George de Mestral came home from
// a walk with his dog covered in burdock burrs; under a microscope he saw tiny hooks that caught every loop of fur and
// thread; he copied them (hooks on one strip, loops on the other); cotton wore out, nylon held; he named it Velcro
// (velours + crochet, "velvet hook"). Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*),
// every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Parametric: any
// "nature inspired an invention" story (burr, hooks, strips, a shoe strap). Uses lh__lib.js (LH: dog, person, kasif,
// label, lamp, front) lazily at build time.
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   gy: ground line 0..1 H · peaks: true (far snowy Alps above the horizon, hy 0..1 H) · grass: 0.68 (front top 0..1 H)
//
// SHOTS.vc_field — an Alpine meadow: far snowy peaks, burdock plants, tall grass in front. P: {mode: "hook"|"pluck"|"end",
//   kasif: K, dog: {x, s, burrs: 9, face}, burr: {r: 95, at} (hook: a giant burr held up in Kaşif's front hand;
//   pluck: burrs stuck on his legs fly off one by one from cue "off"), plants: [x, ...], labels, gy, hy}
// SHOTS.vc_walk  — mode "home": a chalet on the right, George (hatless, sweater) at its door; his dog runs in from the
//   left past burdock plants, picking up burrs at each one, and sits in front of him; George's hand goes to his head.
//   mode "dog": close-up of the sitting dog; burrs pop onto its coat one by one from cue "burrs" (worried brows).
//   P: {mode, gy, hy, name: "George de Mestral" (hand label over his head, cue "name"), labels, plants: [x, ...]}
// SHOTS.vc_scope — mode "desk": George sits at a desk, leaning into a brass-and-ink microscope; a magnified bubble
//   (upper right, dashed lines to the eyepiece) shows the burr turning, its spikes ending in hooks; at "hooks" a red
//   ring circles one hook. mode "zoom": full-frame view through the eyepiece: hooks hang from the burr's skin at the
//   top, loops of fur and thread rise from the bottom; at "grab" the hooks drop and catch the loops, then tug.
//   P: {mode, gy (desk top), bubble: [x, y, r], labels}
// SHOTS.vc_strip — mode "copy": two long fabric strips on a workbench wall: hooks along the top strip (cue "hooks"),
//   loops along the bottom strip (cue "loops"); at "press" they close together, then pull apart with rip marks.
//   mode "test": two rigs hang from a beam, each a strip pair holding an iron weight: the cotton pair frays and drops
//   its weight at "cotton" (red cross), the nylon pair holds and swings at "nylon" (green tick). P: {mode, gy, labels}
// SHOTS.vc_name  — two pinned cards "VELOURS" / "CROCHET" with hand notes "velvet" / "hook"; at "named" the tails
//   drop away and VEL + CRO slide together into "VELCRO" in a red box. P: {words: ["VEL", "OURS", "CRO", "CHET"],
//   notes: ["velvet", "hook"], gy}
// SHOTS.vc_shoe  — close-up of a child's sneaker with two hook-and-loop straps on a wooden floor; at "rip" the straps
//   peel up with jagged rip marks and a hand-written "RIIIP!"; at "weed" a burr pops in above with a dashed arrow down
//   to the strap. P: {gy, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const SERIF = 'Fraunces, Georgia, serif';
  const BURR = () => mix(INK.stain, INK.green, 0.35);
  const BURR_D = () => mix(INK.stain, INK.ink, 0.35);
  const FLOWER = () => mix(INK.red, INK.blue, 0.35);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.3);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const NYLON = () => mix(INK.blue, INK.paperLight, 0.35);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));

  // ------------------------------------------------------------------ a burdock burr: a ball of hooked spikes
  // -> {core (filled ball), spikes (ink strokes)} path strings
  function burr(cx, cy, r, sd, t, o = {}) {
    const n = o.n ?? Math.max(10, Math.min(26, Math.round(r / 4))), rot = o.rot || 0, w = Math.max(2.2, r * (o.w ?? 0.05));
    const core = inkLoop(inkEllipsePts(cx, cy, r * 0.62, r * 0.6, sd, 12, 0, 0.06), { seed: sd, t, amp: 0.6 });
    const S = [inkCircle(cx, cy, r * 0.62, sd + 1, t, { w: Math.max(2.5, r * 0.04), ry: r * 0.6 })];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + rot + hn(sd, i) * 0.2, c = Math.cos(a), s = Math.sin(a);
      const l = r * (1.05 + hn(sd + 3, i) * 0.12);
      const p0 = [cx + c * r * 0.55, cy + s * r * 0.55], p1 = [cx + c * l, cy + s * l];
      const hk = r * 0.13, p2 = [p1[0] - s * hk + c * hk * 0.3, p1[1] + c * hk + s * hk * 0.3], p3 = [p2[0] - c * hk * 0.8, p2[1] - s * hk * 0.8];
      S.push(inkPath([p0, p1, p2, p3], { w, seed: sd + 10 + i, t, amp: Math.min(1.2, r * 0.02), taper: 0.4 }));
    }
    if (o.dots !== false && r > 40) for (let i = 0; i < 7; i++) { const a = hn(sd + 5, i) * 6.28, d = hn(sd + 6, i) * r * 0.4; S.push(inkDot(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r * 0.03 + 1, r * 0.03 + 1, sd + 40 + i, t)); }
    return { core, spikes: S.join(' ') };
  }
  function burrEls(parent) { return { c: inkEl(parent, BURR()), s: inkEl(parent, INK.ink) }; }
  const setBurrs = (B, list) => { B.c.setAttribute('d', list.map(b => b.core).join(' ')); B.s.setAttribute('d', list.map(b => b.spikes).join(' ')); };

  // ------------------------------------------------------------------ far Alps: pale peaks with snow caps
  function peaks(parent, sd) {
    const rockF = inkEl(parent, mix(INK.paperLight, INK.blue, 0.3)), snowF = inkEl(parent, INK.paperLight), lines = inkEl(parent, mix(INK.inkSoft, INK.blue, 0.3));
    const PK = [[0.08, 0.2, 0.26], [0.3, 0.34, 0.2], [0.55, 0.16, 0.28], [0.8, 0.3, 0.22], [1.02, 0.22, 0.2]];
    return {
      update(t, W, hy, top) {
        const R = [], S = [], L = [];
        PK.forEach(([px, ph, pw], i) => {
          const x = px * W, base = hy, tip = lerp(top, hy, ph), w = pw * W;
          const pts = [[x - w, base + 10], [x - w * 0.35, lerp(tip, base, 0.45)], [x - w * 0.1, tip + 18], [x, tip], [x + w * 0.2, tip + 30], [x + w * 0.5, lerp(tip, base, 0.5)], [x + w, base + 10]];
          R.push(inkLoop(pts, { seed: sd + i, t, amp: 0.8, smooth: false }));
          const sy = lerp(tip, base, 0.3);
          const sn = [[x - w * 0.27, sy], [x - w * 0.1, tip + 18], [x, tip], [x + w * 0.2, tip + 30], [x + w * 0.3, sy + 8], [x + w * 0.16, sy - 14], [x + w * 0.05, sy + 12], [x - w * 0.08, sy - 10]];
          S.push(inkLoop(sn, { seed: sd + 20 + i, t, amp: 0.6, smooth: false }));
          L.push(inkPath(pts.slice(1, 6), { w: 3.5, seed: sd + 40 + i, t, smooth: false, amp: 0.8 }));
          L.push(inkPath([[x, tip + 10], [x + w * 0.05, lerp(tip, base, 0.55)]], { w: 2.5, seed: sd + 60 + i, t }));
        });
        rockF.setAttribute('d', R.join(' ')); snowF.setAttribute('d', S.join(' ')); lines.setAttribute('d', L.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ burdock plant: stalk, heart leaves, burr heads
  function burdock(parent, sd) {
    const stem = inkEl(parent, mix(INK.green, INK.ink, 0.3)), leaf = inkEl(parent, mix(INK.green, INK.paperLight, 0.15)), leafR = inkEl(parent), fl = inkEl(parent, FLOWER());
    const B = burrEls(parent);
    return {
      update(t, x, gy, s, k = 0) {
        const sw = Math.sin(t * 1.3 + sd) * 8 * s, top = [x + sw, gy - 330 * s];
        stem.setAttribute('d', inkPath([[x, gy], [x + sw * 0.4, gy - 170 * s], top], { w: 9 * s, seed: sd, t }) + ' ' +
          inkPath([[x + sw * 0.4, gy - 200 * s], [x + 70 * s + sw, gy - 290 * s]], { w: 6 * s, seed: sd + 1, t }) + ' ' +
          inkPath([[x + sw * 0.3, gy - 160 * s], [x - 70 * s + sw, gy - 260 * s]], { w: 6 * s, seed: sd + 2, t }));
        const LV = [], LR = [];
        [[-1, 0.05, 1], [1, 0.12, 0.9], [-1, 0.32, 0.7]].forEach(([d, h, sc], i) => {
          const bx = x, by = gy - h * 330 * s, l = 150 * s * sc, ww = 70 * s * sc, a = Math.sin(t * 1.1 + i + sd) * 0.06;
          const tip = [bx + d * l * Math.cos(0.35 + a), by - l * Math.sin(0.35 + a)];
          const pts = [[bx, by], [lerp(bx, tip[0], 0.3) + d * 10 * s, by - ww * 0.9], [lerp(bx, tip[0], 0.75), tip[1] - ww * 0.4], tip, [lerp(bx, tip[0], 0.7), tip[1] + ww * 0.5], [lerp(bx, tip[0], 0.3), by + ww * 0.2]];
          LV.push(inkLoop(pts, { seed: sd + 10 + i, t, amp: 0.8 }));
          LR.push(inkPath(pts, { w: 4, seed: sd + 20 + i, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[bx, by], tip], { w: 2.5, seed: sd + 30 + i, t }));
        });
        leaf.setAttribute('d', LV.join(' ')); leafR.setAttribute('d', LR.join(' '));
        const heads = [top, [x + 70 * s + sw, gy - 290 * s], [x - 70 * s + sw, gy - 260 * s], [x + 28 * s + sw, gy - 360 * s]];
        const BL = [], F = [];
        heads.forEach((h, i) => { if (i >= heads.length - k) return; BL.push(burr(h[0], h[1], 20 * s, sd + 50 + i * 9, t, { n: 12 })); F.push(inkLoop([[h[0] - 10 * s, h[1] - 16 * s], [h[0], h[1] - 34 * s], [h[0] + 10 * s, h[1] - 16 * s]], { seed: sd + 90 + i, t, amp: 0.6 })); });
        setBurrs(B, BL); fl.setAttribute('d', F.join(' '));
      },
    };
  }

  // burrs stuck on a dog (offsets in dog units round its body centre and head)
  const DOG_BODY = [[-70, -30], [0, -46], [58, -22], [-24, 12], [40, 22], [-96, 4], [82, -44], [-40, -52], [14, -6], [70, 10]];
  const DOG_HEAD = [[-24, -26], [14, -40], [-36, 10]];
  function dogBurrs(res, s, face, n, sd, t, rs = 15, pop = null) {
    const L = [], all = DOG_BODY.map(q => [res.body, q]).concat(DOG_HEAD.map(q => [res.head, q]));
    for (let i = 0; i < Math.min(n, all.length); i++) {
      const [c, q] = all[i], k = pop ? pop(i) : 1;
      if (k <= 0.01) continue;
      L.push(burr(c[0] + face * q[0] * s, c[1] + q[1] * s, rs * s * k, sd + i * 13, t, { n: 10 }));
    }
    return L;
  }

  // shock ticks round a head
  function ticks(cx, cy, sc, sd, t) {
    return [[-1, -0.9], [0, -1.2], [1, -0.9]].map(([u, v], i) => inkPath([[cx + u * 80 * sc, cy + v * 80 * sc], [cx + u * 115 * sc, cy + v * 112 * sc]], { w: 6 * sc, seed: sd + i, t, amp: 0.4 })).join(' ');
  }

  // ------------------------------------------------------------------ SHOTS.vc_field
  SH.vc_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 311, u = W / 1080, mode = P.mode || 'hook';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.62) * H, hy = (P.hy ?? 0.52) * H;
      const pk = P.peaks === false ? null : peaks(el(root, 'g'), sd + 1);
      const plantsX = P.plants || (mode === 'hook' ? [0.06, 0.93] : mode === 'pluck' ? [0.12, 0.88] : [0.9]);
      const plants = plantsX.map((x, i) => ({ x, p: burdock(el(root, 'g'), sd + 100 + i * 50) }));
      const D = Object.assign(mode === 'hook' ? { x: 0.25, s: 0.95, burrs: 9, face: 1 } : mode === 'pluck' ? { x: 0.24, s: 0.8, burrs: 4, face: 1, pose: 'lie' } : { x: 0.68, s: 1.0, burrs: 1, face: -1 }, P.dog || {});
      const dg = D === false || P.dog === false ? null : L.dog(el(root, 'g'), sd + 10);
      const dogB = burrEls(root);
      const K = Object.assign(mode === 'hook' ? { x: 0.66, y: 0.64, scale: 1.25, pose: 'point', dir: 62, face: 'left', emotion: 'surprised' }
        : mode === 'pluck' ? { x: 0.6, y: 0.64, scale: 1.25, pose: 'point', dir: 'down', face: 'left', emotion: 'angry' }
          : { x: 0.36, y: 0.64, scale: 1.25, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif || {});
      const kas = P.kasif === false ? null : L.kasif(el(root, 'g'), K, W, H, seed);
      const big = burrEls(root), legB = burrEls(root), flyB = burrEls(root);
      const tk = inkEl(root), gpC = inkEl(root, INK.paperLight), gpI = inkEl(root);
      const blF = inkEl(root, NYLON()), blR = inkEl(root, mix(INK.blue, INK.ink, 0.3)), stF = inkEl(root, mix(INK.red, INK.inkSoft, 0.15)), stR = inkEl(root), arr = inkEl(root, INK.red);
      const grass = L.front(el(root, 'g'), sd + 30, 'grass');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          if (pk) pk.update(t, W, hy, 0.3 * H);
          plants.forEach((q, i) => q.p.update(t, q.x * W, gy + 30 * u, 1.05 * u, mode === 'pluck' && i === 0 ? 0 : 0));
          if (dg) {
            const s = D.s * u, face = D.face ?? 1;
            const st = D.pose === 'lie' ? { pose: 'lie', face, sway: 0.5 } : { pose: 'sit', face, wag: mode === 'end' ? 1 : 0.4, brow: mode === 'hook' ? 1 : undefined, ear: 0.1 * Math.sin(t * 2) };
            const res = dg.update(t, D.x * W, gy + 20 * u, s, st);
            setBurrs(dogB, dogBurrs(res, s, face, D.burrs ?? 0, sd + 400, t));
          }
          let r = null;
          if (kas) r = kas.update(lt, t, cues);
          const kx = K.x * W, ky = K.y * H, ks = (K.scale ?? 1) * u, kf = K.face === 'left' ? -1 : 1;
          const G = (q) => [kx + kf * ks * q[0], ky + ks * q[1]];
          if (mode === 'hook' && r) {
            const B = P.burr || {}, at = atOr(cues, B.at, 0), p = spring(lt, at, 0.6), hit = punch(lt, atOr(cues, 'hit', null), 0.7);
            const rr = (B.r ?? 95) * u * p * (1 + 0.12 * hit);
            const h0 = G(r.hands[0]), h1 = G(r.hands[1]), hd = G(r.head);
            tk.setAttribute('d', lt > 0.15 ? ticks(hd[0], hd[1] - 20 * ks, ks, sd + 600, t) : '');
            if (P.strap) {
              // burr in the hand towards the dog (left), a Velcro strap hanging from the other; dashed arrow burr -> strap
              const hb = h0[0] < h1[0] ? h0 : h1, hs = h0[0] < h1[0] ? h1 : h0;
              const bc = [hb[0] - rr * 1.5, hb[1] + rr * 0.1];
              setBurrs(big, rr > 2 ? [burr(bc[0], bc[1], rr, sd + 500, t, { rot: t * 0.25 })] : []);
              const sp = spring(lt, at + 0.15, 0.6), sw = 34 * u * (P.strap.w ?? 1), sl = 260 * u * (P.strap.l ?? 1) * sp, sx = hs[0] + 62 * u, sy = hs[1] + 46 * u;
              const swing = Math.sin(t * 2.2) * 0.06, dx = Math.sin(swing) * sl, top = [sx, sy], bot = [sx + dx, sy + sl];
              const band = [[top[0] - sw, top[1]], [top[0] + sw, top[1]], [bot[0] + sw, bot[1]], [bot[0] - sw, bot[1]]];
              stF.setAttribute('d', sp > 0.05 ? inkLoop(band, { seed: sd + 520, t, smooth: false }) : '');
              const SL = sp > 0.05 ? [inkPath(band, { w: 5, seed: sd + 521, t, closed: true, smooth: false }), inkCircle(sx, sy - 6 * u, 24 * u, sd + 522, t, { w: 5 })] : [];
              SL.push(inkPath([hs, [sx, sy - 30 * u]], { w: 6, seed: sd + 523, t }));
              if (sp > 0.3) for (let j = 0; j < 8; j++) { const f = 0.12 + j * 0.105, q = [lerp(top[0], bot[0], f) + sw, lerp(top[1], bot[1], f)]; SL.push(inkPath([q, [q[0] + 22 * u, q[1] - 3 * u], [q[0] + 30 * u, q[1] + 10 * u], [q[0] + 20 * u, q[1] + 18 * u]], { w: 6, seed: sd + 530 + j, t, amp: 0.4 })); }
              // the blue loop strip: stuck to the bottom of the red one, its top half peeled away to the right
              const peel = 0.26 + 0.04 * Math.sin(t * 2.4), bA = [bot[0] + sw * 2 + 4 * u, bot[1]], ang = -Math.PI / 2 + peel, bl = sl * 0.8;
              const bT = [bA[0] + Math.cos(ang) * bl, bA[1] + Math.sin(ang) * bl];
              const nx2 = Math.cos(ang + Math.PI / 2) * sw, ny2 = Math.sin(ang + Math.PI / 2) * sw;
              const bBand = [[bA[0] - nx2, bA[1] - ny2], [bT[0] - nx2, bT[1] - ny2], [bT[0] + nx2, bT[1] + ny2], [bA[0] + nx2, bA[1] + ny2]];
              blF.setAttribute('d', sp > 0.3 ? inkLoop(bBand, { seed: sd + 524, t, smooth: false }) : '');
              const BL = sp > 0.3 ? [inkPath(bBand, { w: 5, seed: sd + 525, t, closed: true, smooth: false })] : [];
              if (sp > 0.3) for (let j = 0; j < 7; j++) { const f = 0.12 + j * 0.12, q = [lerp(bA[0], bT[0], f) + nx2 * 1.15, lerp(bA[1], bT[1], f) + ny2 * 1.15]; BL.push(inkPath(inkEllipsePts(q[0] - 8 * u, q[1], 12 * u, 9 * u, sd + 560 + j, 8), { w: 4.5, seed: sd + 570 + j, t, closed: true, amp: 0.4 })); }
              blR.setAttribute('d', BL.join(' '));
              stR.setAttribute('d', SL.join(' '));
              // bold dashed arc over the head, red arrowhead at the strap
              const ap = progIO(lt, at + 0.35, 0.6), a0 = [bc[0] + rr * 0.55, bc[1] + rr * 1.05], a2 = [sx - sw - 14 * u, sy + 150 * u], a1 = [(a0[0] + a2[0]) / 2, Math.max(a0[1], a2[1]) + 170 * u];
              const Q = f => [(1 - f) * (1 - f) * a0[0] + 2 * f * (1 - f) * a1[0] + f * f * a2[0], (1 - f) * (1 - f) * a0[1] + 2 * f * (1 - f) * a1[1] + f * f * a2[1]];
              const AR = [];
              for (let j = 0; j < 9; j++) { const f0 = j / 9, f1v = (j + 0.55) / 9; if (f0 > ap) break; AR.push(inkPath([Q(f0), Q(Math.min(f1v, ap))], { w: 11 * u, seed: sd + 540 + j, t, taper: 0.1 })); }
              if (ap > 0.95) { const e = Q(1), b = Q(0.9), an = Math.atan2(e[1] - b[1], e[0] - b[0]), L2 = 44 * u; AR.push(inkLoop([e, [e[0] - Math.cos(an - 0.5) * L2, e[1] - Math.sin(an - 0.5) * L2], [e[0] - Math.cos(an + 0.5) * L2, e[1] - Math.sin(an + 0.5) * L2]], { seed: sd + 560, t, smooth: false, amp: 0.5 })); }
              arr.setAttribute('d', AR.join(' '));
            } else {
              const off = B.off || [0.75, -0.55];
              setBurrs(big, rr > 2 ? [burr(h1[0] + kf * rr * off[0], h1[1] + rr * off[1], rr, sd + 500, t, { rot: t * 0.25 })] : []);
            }
            if (K.pose !== 'shock') {
            // gasp: a round "O" mouth over the fixed line mouth, wide eyes
            const F = (a, b) => [hd[0] + kf * a * ks, hd[1] + b * ks], q = spring(lt, 0.1, 0.4), pul = 1 + 0.08 * Math.sin(lt * 7);
            gpC.setAttribute('d', inkLoop(inkEllipsePts(...F(15, 35), 26 * ks, 14 * ks, sd + 650, 10), { seed: sd + 650, t, amp: 0.3 }));
            const m = F(15, 40);
            gpI.setAttribute('d', inkPath(inkEllipsePts(m[0], m[1], 10 * ks * q * pul, 15 * ks * q * pul, sd + 651, 10), { w: 5 * ks, seed: sd + 651, t, closed: true, amp: 0.3 }) + ' ' +
              [-1, 1].map(e => inkCircle(...F(17 + e * 22, 2), 9 * ks, sd + 652 + e, t, { w: 3.5 * ks, amp: 0.3 })).join(' '));
            }
          } else { blankBurr(big); gpC.setAttribute('d', ''); gpI.setAttribute('d', ''); }
          if (mode === 'pluck' && r) {
            // burrs on his trouser legs; from "off" they leave one by one, the front hand flicks each away
            const off = atOr(cues, 'off', dur * 0.3), n = 5, br = (P.burrR ?? 16) * u, legs = P.burrR ? [[-34, -60], [34, -130], [-30, -200], [40, -260], [-10, -330]] : [[-14, -120], [18, -70], [-20, -40], [24, -150], [6, -100]];
            const LS = [], FL = [];
            legs.forEach((q, i) => {
              const ti = off + i * 0.3, base = G(q);
              if (lt < ti) LS.push(burr(base[0], base[1], br, sd + 700 + i * 11, t, { n: 10 }));
              else if (lt < ti + 1.3) {
                const f = (lt - ti) / 1.3, dx = (i % 2 ? 1 : -1) * (180 + i * 40) * u * f, dy = -520 * u * f + 900 * u * f * f;
                FL.push(burr(base[0] + dx, base[1] + dy, br, sd + 700 + i * 11, t, { n: 10, rot: f * 6 }));
              }
            });
            const hnd = G(r.hands[1]);
            if (lt < off + n * 0.32) FL.push(burr(hnd[0], hnd[1] + 6 * u, 15 * u, sd + 790, t, { n: 10 }));
            setBurrs(legB, LS); setBurrs(flyB, FL);
            tk.setAttribute('d', '');
          } else if (mode !== 'hook') { blankBurr(legB); blankBurr(flyB); tk.setAttribute('d', ''); }
          grass.update(t, W, H, (P.grass ?? 0.68) * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
  function blankBurr(B) { B.c.setAttribute('d', ''); B.s.setAttribute('d', ''); }

  // ------------------------------------------------------------------ chalet
  function chalet(parent, sd) {
    const wall = inkEl(parent, mix(INK.paperLight, INK.stain, 0.25)), roof = inkEl(parent, WOOD_D()), win = inkEl(parent, mix(INK.gold, INK.paperLight, 0.4)), door = inkEl(parent, WOOD()), lines = inkEl(parent), smoke = inkEl(parent, mix(INK.paperDark, INK.inkSoft, 0.2), { 'fill-opacity': 0.6 });
    return {
      update(t, x, gy, w, h) {
        const wp = rect(x - w / 2, gy - h, x + w / 2, gy);
        wall.setAttribute('d', inkLoop(wp, { seed: sd, t, smooth: false }));
        const rp = [[x - w * 0.68, gy - h + 10], [x, gy - h - w * 0.42], [x + w * 0.68, gy - h + 10], [x + w * 0.6, gy - h + 40], [x, gy - h - w * 0.3], [x - w * 0.6, gy - h + 40]];
        roof.setAttribute('d', inkLoop(rp, { seed: sd + 1, t, smooth: false }));
        const wn = rect(x + w * 0.12, gy - h * 0.72, x + w * 0.38, gy - h * 0.45), dr = rect(x - w * 0.36, gy - h * 0.62, x - w * 0.08, gy);
        win.setAttribute('d', inkLoop(wn, { seed: sd + 2, t, smooth: false }));
        door.setAttribute('d', inkLoop(dr, { seed: sd + 3, t, smooth: false }));
        const Ls = [inkPath(wp, { w: 6, seed: sd + 4, t, closed: true, smooth: false }), inkPath(rp, { w: 6, seed: sd + 5, t, closed: true, smooth: false }),
          inkPath(wn, { w: 4.5, seed: sd + 6, t, closed: true, smooth: false }), inkPath(dr, { w: 4.5, seed: sd + 7, t, closed: true, smooth: false }),
          inkPath([[x + w * 0.25, gy - h * 0.72], [x + w * 0.25, gy - h * 0.45]], { w: 3, seed: sd + 8, t }), inkPath([[x + w * 0.12, gy - h * 0.585], [x + w * 0.38, gy - h * 0.585]], { w: 3, seed: sd + 9, t })];
        for (let i = 1; i < 6; i++) Ls.push(inkPath([[x - w / 2 + 4, gy - h + i * h / 6], [x - w * 0.38, gy - h + i * h / 6]], { w: 2.5, seed: sd + 10 + i, t }), inkPath([[x + w * 0.4, gy - h + i * h / 6], [x + w / 2 - 4, gy - h + i * h / 6]], { w: 2.5, seed: sd + 20 + i, t }));
        Ls.push(inkDot(x - w * 0.13, gy - h * 0.3, 7, 7, sd + 30, t));
        const ch = [x + w * 0.3, gy - h - w * 0.2];
        Ls.push(inkPath(rect(ch[0] - 22, ch[1] - 70, ch[0] + 22, ch[1] + 30), { w: 5, seed: sd + 31, t, closed: true, smooth: false }));
        lines.setAttribute('d', Ls.join(' '));
        const SM = []; for (let i = 0; i < 4; i++) { const f = (t * 0.35 + i / 4) % 1; SM.push(inkCircle(ch[0] + Math.sin(f * 6 + i) * 30 + f * 80, ch[1] - 90 - f * 260, 18 + f * 40, sd + 40 + i, t, { fill: true })); }
        smoke.setAttribute('d', SM.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.vc_walk
  SH.vc_walk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 521, u = W / 1080, mode = P.mode || 'home';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.62) * H, hy = (P.hy ?? 0.5) * H;
      const pk = peaks(el(root, 'g'), sd + 1);
      const ch = mode === 'home' ? chalet(el(root, 'g'), sd + 5) : null;
      const plantsX = P.plants || (mode === 'home' ? [0.12, 0.34] : [0.86]);
      const plants = plantsX.map((x, i) => ({ x, p: burdock(el(root, 'g'), sd + 100 + i * 50) }));
      const geo = mode === 'home' ? L.person(el(root, 'g'), sd + 40, { kind: 'sweater', hair: 'dark', glasses: false, col: mix(INK.red, INK.inkSoft, 0.35) }) : null;
      const dg = L.dog(el(root, 'g'), sd + 10);
      const dogB = burrEls(root);
      const name = mode === 'home' && P.name !== false ? L.label(el(root, 'g'), { text: P.name || 'George de Mestral', x: 0.68, y: 0.235, at: P.nameAt ?? 'name', size: 64, color: 'ink', rot: -3 }, W, H) : null;
      const grass = L.front(el(root, 'g'), sd + 30, 'grass');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          pk.update(t, W, hy, 0.29 * H);
          if (ch) ch.update(t, 0.8 * W, gy + 10 * u, 380 * u, 330 * u);
          plants.forEach(q => q.p.update(t, q.x * W, gy + 40 * u, (mode === 'dog' ? 1.4 : 1.0) * u));
          if (mode === 'home') {
            const arrive = atOr(cues, 'arrive', dur * 0.55), x0 = -0.15 * W, x1 = 0.5 * W;
            let x, st, n;
            if (lt < arrive) { const f = clamp01(lt / arrive); x = lerp(x0, x1, f); st = { pose: 'run', ph: lt * 2.4, face: 1, ear: 0.4 }; }
            else { x = x1; st = { pose: 'sit', prev: 'run', mix: (lt - arrive) / 0.3, face: 1, wag: 1, brow: 0.6 }; }
            n = 0; plantsX.forEach(px => { if (x > px * W) n += 4; });
            const s = 0.85 * u, res = dg.update(t, x, gy + 30 * u, s, st);
            setBurrs(dogB, dogBurrs(res, s, 1, n, sd + 400, t, 15, i => clamp01(((x - plantsX[Math.min(plantsX.length - 1, Math.floor(i / 4))] * W) / (80 * u)))));
            const gx = 0.72 * W, gs = 1.05 * u, see = lt > arrive;
            const hand = see ? [gx + 70 * gs, gy - 420 * gs + Math.sin(t * 3) * 6] : [gx - 40 * gs, gy - 220 * gs];
            geo.update(t, gx, gy + 20 * u, gs, { face: -1, lean: see ? -4 : 2, armR: hand, armL: [gx + 30 * gs, gy - 210 * gs], look: [6, 12], brow: see ? 1 : 0.2, mouth: see ? 0.8 : 0 });
          } else {
            const pop = atOr(cues, 'burrs', 0.3), s = 1.45 * u, face = 1;
            const res = dg.update(t, 0.42 * W, gy + 30 * u, s, { pose: 'sit', face, wag: 0.3, brow: 1, smile: -0.4, ear: 0.15 * Math.sin(t * 2) });
            setBurrs(dogB, dogBurrs(res, s, face, 13, sd + 400, t, 14, i => spring(lt, pop + i * 0.17, 0.4)));
          }
          if (name) name.update(lt, t, cues);
          grass.update(t, W, H, (P.grass ?? 0.7) * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ microscope (side view, eyepiece up-left)
  function microscope(parent, sd) {
    const body = inkEl(parent, mix(INK.inkSoft, INK.blue, 0.25)), brass = inkEl(parent, mix(INK.gold, INK.stain, 0.3)), lines = inkEl(parent), glass = inkEl(parent, mix(INK.paperLight, INK.blue, 0.2));
    const B = burrEls(parent);
    return {
      update(t, x, y, s, k = 0) {   // x, y: middle of the base on the desk top
        const S = (a, b) => [x + a * s, y + b * s];
        const base = [S(-120, 0), S(120, 0), S(100, -36), S(-100, -36)];
        const arm = [S(60, -36), S(90, -36), S(100, -200), S(60, -330), S(20, -330), S(58, -200)];
        const tube = [S(-30, -380), S(30, -380), S(10, -170), S(-46, -170)].map(p => p);
        const rot = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };
        const c0 = S(0, -270), A = -0.32;
        const tb = tube.map(p => rot(p, c0, A)), ep = rect(...S(-22, -440), ...S(22, -380)).map(p => rot(p, c0, A));
        const stage = rect(...S(-110, -150), ...S(70, -132));
        body.setAttribute('d', [base, arm].map((pp, i) => inkLoop(pp, { seed: sd + i, t, smooth: false, amp: 0.8 })).join(' ') + ' ' + inkLoop(tb, { seed: sd + 3, t, smooth: false, amp: 0.8 }));
        brass.setAttribute('d', inkLoop(ep, { seed: sd + 4, t, smooth: false, amp: 0.6 }) + ' ' + inkLoop(stage, { seed: sd + 5, t, smooth: false, amp: 0.6 }) + ' ' + inkCircle(...S(80, -230), 22 * s, sd + 6, t, { fill: true }));
        glass.setAttribute('d', inkLoop(rect(...S(-80, -146), ...S(10, -138)), { seed: sd + 7, t, smooth: false, amp: 0.4 }) + ' ' + inkCircle(...S(-30, -80), 26 * s, sd + 8, t, { fill: true, ry: 12 * s }));
        lines.setAttribute('d', [base, arm, tb, ep, stage].map((pp, i) => inkPath(pp, { w: 5, seed: sd + 10 + i, t, closed: true, smooth: false })).join(' ') + ' ' +
          inkCircle(...S(80, -230), 22 * s, sd + 16, t, { w: 4 }) + ' ' + inkPath([S(40, -132), S(40, -36)], { w: 8 * s, seed: sd + 17, t }) + ' ' +
          inkCircle(...S(-30, -80), 26 * s, sd + 18, t, { w: 4, ry: 12 * s }) + ' ' + inkPath([S(-30, -92), S(20, -100)], { w: 4, seed: sd + 19, t }));
        const ob = rot(S(-18, -170), c0, A);
        setBurrs(B, [burr(x - 35 * s, y - 158 * s, 12 * s, sd + 30, t, { n: 10 })]);
        return { eye: rot(S(0, -440), c0, A), obj: ob };
      },
    };
  }

  // a fabric strip with hooks (dir 1 = hooks below) or loops (dir -1 = loops above); returns path strings
  function stripD(x0, x1, y, h, sd, t, kind, dir, open = 0, o = {}) {
    const band = rect(x0, y - h / 2, x1, y + h / 2), n = Math.round((x1 - x0) / (o.gap ?? 44));
    const E = [], F = [];
    const edge = y + dir * h / 2;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i + 0.5) * (x1 - x0) / n, sw = Math.sin(t * 3 + i) * 2;
      if (kind === 'hook') {
        const l = (o.len ?? 42) * (1 - open * 0.7), c = (o.len ?? 42) * 0.32;
        const fray = o.fray || 0;
        const p = [[x, edge], [x + sw * 0.3, edge + dir * l], [x + c * 0.9 * (1 - fray), edge + dir * (l + c * 0.6 * (1 - fray))], [x + c * (1 + fray), edge + dir * (l - c * 0.3 + fray * c)]];
        E.push(inkPath(p, { w: o.w ?? 4.5, seed: sd + i, t, amp: 0.4, taper: 0.3 }));
        if (fray > 0.2) for (let j = 0; j < 3; j++) E.push(inkPath([[x + c, edge + dir * l], [x + c + (hn(sd + i, j) - 0.5) * 40 * fray, edge + dir * (l + 10 + hn(sd + j, i) * 30 * fray)]], { w: 2, seed: sd + 200 + i * 3 + j, t, amp: 0.6 }));
      } else {
        const l = (o.len ?? 40) * (1 + Math.sin(t * 2.4 + i * 1.7) * 0.08 + open * 0.3), wd = (o.loopW ?? 26);
        E.push(inkPath(inkEllipsePts(x + sw, edge + dir * l * 0.55, wd / 2, l * 0.55, sd + i, 10), { w: o.w ?? 3.5, seed: sd + i, t, closed: true, amp: 0.4 }));
      }
    }
    for (let i = 1; i < 14; i++) F.push(inkPath([[lerp(x0, x1, i / 14) - 12, y - h * 0.3], [lerp(x0, x1, i / 14) + 12, y + h * 0.3]], { w: 2, seed: sd + 400 + i, t, amp: 0.4 }));
    return { band: inkLoop(band, { seed: sd + 500, t, smooth: false, amp: 0.8 }), rim: inkPath(band, { w: 5, seed: sd + 501, t, closed: true, smooth: false }) + ' ' + F.join(' '), teeth: E.join(' ') };
  }

  // workbench / desk front down to the frame bottom
  function bench(parent, sd) {
    const top = inkEl(parent, WOOD()), front = inkEl(parent, WOOD_D()), lines = inkEl(parent);
    return {
      update(t, W, H, y) {
        top.setAttribute('d', inkLoop([[-40, y], [W + 40, y - 6], [W + 40, y + 40], [-40, y + 46]], { seed: sd, t, smooth: false, amp: 0.6 }));
        front.setAttribute('d', inkLoop([[-40, y + 44], [W + 40, y + 38], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 1, t, smooth: false, amp: 0.6 }));
        const Ls = [inkPath([[-40, y], [W + 40, y - 6]], { w: 6, seed: sd + 2, t }), inkPath([[-40, y + 44], [W + 40, y + 38]], { w: 6, seed: sd + 3, t })];
        for (let i = 0; i < 8; i++) { const yy = y + 90 + i * (H - y) / 8; Ls.push(inkPath([[-20, yy], [W * 0.35, yy + 8 * Math.sin(i)], [W * 0.7, yy - 6], [W + 20, yy + 4]], { w: 2.5, seed: sd + 10 + i, t, taper: 0.6 })); }
        [0.33, 0.66].forEach((q, i) => { const x = q * W, yy = y + 140; Ls.push(inkPath(rect(x - 120, yy, x + 120, yy + 160), { w: 4, seed: sd + 30 + i, t, closed: true, smooth: false }), inkPath([[x - 40, yy + 60], [x + 40, yy + 60]], { w: 8, seed: sd + 40 + i, t })); });
        lines.setAttribute('d', Ls.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.vc_scope
  SH.vc_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 733, u = W / 1080, mode = P.mode || 'desk';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.62) * H;
      if (mode === 'desk') {
        const lamp = L.lamp(el(root, 'g'), sd + 1);
        const geo = L.person(el(root, 'g'), sd + 40, { kind: 'sweater', hair: 'dark', glasses: false, col: mix(INK.red, INK.inkSoft, 0.35) });
        const desk = bench(el(root, 'g'), sd + 60);
        const ms = microscope(el(root, 'g'), sd + 80);
        const dash = inkEl(root, INK.inkSoft);
        const bub = inkEl(root, INK.paperLight), bubR = inkEl(root);
        const bg = el(root, 'g'), BB = burrEls(bg);
        const ring = inkEl(root, INK.red);
        const LB = labels(root, P.labels, W, H);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt;
            lamp.update(t, 0.5 * W, 0.12 * H, 1, gy, 260 * u);
            const mx = 0.55 * W, s = 1.25 * u;
            const gx = 0.27 * W, gs = 1.15 * u;
            const look = atOr(cues, 'look', 0.2);
            const lean = lerp(8, 30, progIO(lt, look, 0.8));
            const M = ms.update(t, mx, gy, s);
            const fk = Math.sin(t * 2) * 6 * u;
            geo.update(t, gx, gy + 260 * u, gs, { face: 1, seat: gy + 40 * u, lean, armR: [mx + 80 * s + 20 * u, gy - 230 * s + fk], armL: [mx - 40 * u, gy - 20 * u], look: [4, 6], brow: lt > atOr(cues, 'hooks', dur * 0.6) ? 1 : 0.3 });
            desk.update(t, W, H, gy);
            ms.update(t, mx, gy, s);
            // the magnified view
            const B = P.bubble || [0.64, 0.27, 250], bx = B[0] * W, by = B[1] * H, br = B[2] * u * spring(lt, look + 0.2, 0.6);
            if (br > 4) {
              dash.setAttribute('d', [-1, 1].map((d, i) => { const a = [M.eye[0], M.eye[1]], b = [bx + d * br * 0.7, by + br * 0.72]; const D = []; for (let j = 0; j < 9; j++) { const f0 = j / 9, f1v = (j + 0.5) / 9; D.push(inkPath([[lerp(a[0], b[0], f0), lerp(a[1], b[1], f0)], [lerp(a[0], b[0], f1v), lerp(a[1], b[1], f1v)]], { w: 3, seed: sd + 100 + i * 10 + j, t })); } return D.join(' '); }).join(' '));
              bub.setAttribute('d', inkCircle(bx, by, br, sd + 120, t, { fill: true }));
              bubR.setAttribute('d', inkCircle(bx, by, br, sd + 121, t, { w: 9 }) + ' ' + inkCircle(bx, by, br - 16 * u, sd + 122, t, { w: 3 }));
              setBurrs(BB, [burr(bx, by, br * 0.62, sd + 130, t, { rot: t * 0.3, w: 0.045, n: 18 })]);
              const hk = atOr(cues, 'hooks', dur * 0.6);
              if (lt > hk) {
                const a = t * 0.3 + 0.1 + hn(sd + 130, 0) * 0.2, rr = br * 0.62 * 1.1;
                ring.setAttribute('d', inkCircle(bx + Math.cos(a) * rr, by + Math.sin(a) * rr, 46 * u * spring(lt, hk, 0.5), sd + 140, t, { w: 7 }));
              } else ring.setAttribute('d', '');
            } else { dash.setAttribute('d', ''); bub.setAttribute('d', ''); bubR.setAttribute('d', ''); blankBurr(BB); ring.setAttribute('d', ''); }
            LB.forEach(l => l.update(lt, t, cues));
          },
        };
      }
      // zoom: the eyepiece view
      const dark = inkEl(root, mix(INK.ink, INK.inkSoft, 0.35));
      const view = inkEl(root, mix(INK.paperLight, INK.gold, 0.12));
      const skin = inkEl(root, BURR()), skinR = inkEl(root);
      const hooks = inkEl(root, INK.ink), loops = inkEl(root, mix(INK.blue, INK.ink, 0.25)), fur = inkEl(root, mix(INK.stain, INK.ink, 0.2));
      const rim = inkEl(root), glint = inkEl(root, INK.paperLight, { 'fill-opacity': 0.5 });
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const cx = 0.5 * W, cy = (P.cy ?? 0.4) * H, R = (P.r ?? 520) * u;
          const outer = [[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]];
          const circ = inkEllipsePts(cx, cy, R, R, sd + 1, 28);
          dark.setAttribute('d', inkLoop(outer, { seed: sd, t, smooth: false, amp: 0 }) + ' ' + inkLoop(circ.slice().reverse(), { seed: sd + 2, t, amp: 0.6 }));
          dark.setAttribute('fill-rule', 'evenodd');
          view.setAttribute('d', inkLoop(circ, { seed: sd + 2, t, amp: 0.6 }));
          // burr skin across the top of the view
          const sy = cy - R * 0.5, SK = [];
          for (let i = 0; i <= 12; i++) SK.push([cx - R * 1.1 + i * R * 2.2 / 12, sy + Math.sin(i * 1.3) * 14 * u]);
          const skinP = SK.concat([[cx + R * 1.1, cy - R * 1.2], [cx - R * 1.1, cy - R * 1.2]]);
          skin.setAttribute('d', inkLoop(skinP, { seed: sd + 3, t, amp: 1 }));
          skinR.setAttribute('d', inkPath(SK, { w: 7, seed: sd + 4, t }));
          // hooks drop and grab at "grab", then tug
          const grab = atOr(cues, 'grab', dur * 0.35), d = progIO(lt, grab, 0.5), tug = lt > grab + 0.6 ? Math.max(0, Math.sin((lt - grab - 0.6) * 4)) * 30 * u : 0;
          const HK = [], LP = [], FU = [], n = 7;
          for (let i = 0; i < n; i++) {
            const x = cx - R * 0.78 + i * R * 1.56 / (n - 1), top = sy + Math.sin(i * 1.3 * 12 / 12) * 6 * u;
            const len = lerp(110, 270, d) * u - tug, c = 46 * u;
            const tip = [x, top + len];
            HK.push(inkPath([[x, top - 10 * u], tip, [x + c * 0.9, tip[1] + c * 0.6], [x + c * 1.2, tip[1] - c * 0.25]], { w: 13 * u, seed: sd + 10 + i, t, amp: 0.8, taper: 0.35 }));
            // a loop under each hook: rises from the fur below, caught at the hook bend
            const ly = cy + R * 0.62, lx = x + c * 0.55, lt0 = tip[1] + c * 0.45;
            const lh = lerp(ly - (cy + R * 0.02), ly - lt0, d) - tug * 0.0;
            LP.push(inkPath(inkEllipsePts(lx, ly - lh * 0.5, 34 * u, lh * 0.5, sd + 30 + i, 14), { w: 9 * u, seed: sd + 30 + i, t, closed: true, amp: 0.8 }));
          }
          for (let i = 0; i < 26; i++) { const x = cx - R + i * 2 * R / 25, y0 = cy + R * 0.62, sw = Math.sin(t * 1.8 + i) * 12 * u; FU.push(inkPath([[x, cy + R * 1.1], [x + sw * 0.5, y0 + 60 * u], [x + sw + 20 * u, y0 - (60 + hn(sd, i) * 80) * u]], { w: 8 * u, seed: sd + 60 + i, t, amp: 0.8, taper: 0.5 })); }
          hooks.setAttribute('d', HK.join(' ')); loops.setAttribute('d', LP.join(' ')); fur.setAttribute('d', FU.join(' '));
          rim.setAttribute('d', inkPath(circ, { w: 14, seed: sd + 5, t, closed: true, amp: 0.6 }) + ' ' + inkCircle(cx, cy, R + 40 * u, sd + 6, t, { w: 4 }));
          glint.setAttribute('d', inkLoop([[cx - R * 0.75, cy - R * 0.2], [cx - R * 0.6, cy - R * 0.62], [cx - R * 0.5, cy - R * 0.58], [cx - R * 0.66, cy - R * 0.16]], { seed: sd + 7, t, amp: 0.6 }));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.vc_strip
  SH.vc_strip = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 911, u = W / 1080, mode = P.mode || 'copy';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.66) * H;
      const desk = bench(el(root, 'g'), sd + 1);
      const mk = () => ({ band: inkEl(root, mode === 'test' ? INK.paperLight : INK.paperLight), rim: inkEl(root), teeth: inkEl(root) });
      if (mode === 'copy') {
        const topF = inkEl(root, mix(WOOD(), INK.paperLight, 0.35)), topR = inkEl(root, WOOD_D());
        const A = mk(), B = mk();
        B.band.setAttribute('fill', NYLON());
        const rips = inkEl(root, INK.red);
        const ref = burrEls(root), arrow = inkEl(root, INK.inkSoft);
        const LB = labels(root, P.labels, W, H);
        root.insertBefore(topR, root.firstChild); root.insertBefore(topF, root.firstChild);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt;
            // a workbench seen from the front-above: the worktop runs from P.surf down to the front edge at gy
            const sf = (P.surf ?? 0.3) * H;
            topF.setAttribute('d', inkLoop([[-40, sf], [W + 40, sf - 8], [W + 40, gy + 4], [-40, gy + 4]], { seed: sd + 100, t, smooth: false, amp: 0.6 }));
            const GR = [inkPath([[-40, sf], [W + 40, sf - 8]], { w: 6, seed: sd + 101, t })];
            for (let i = 0; i < 7; i++) { const y = lerp(sf + 40 * u, gy - 20 * u, i / 6); GR.push(inkPath([[-20, y], [W * 0.3, y + 6 * Math.sin(i)], [W * 0.66, y - 5], [W + 20, y + 3]], { w: 2.2, seed: sd + 102 + i, t, taper: 0.7 })); }
            topR.setAttribute('d', GR.join(' '));
            desk.update(t, W, H, gy);
            const hk = atOr(cues, 'hooks', 0.3), lp = atOr(cues, 'loops', dur * 0.55), pr = atOr(cues, 'press', dur * 0.78);
            const ap = spring(lt, hk - 0.2, 0.6), bp = spring(lt, lp - 0.2, 0.6);
            const cyc = lt > pr ? ((lt - pr) % 1.6) / 1.6 : -1;
            const close = cyc < 0 ? 0 : cyc < 0.35 ? progIO(cyc, 0, 0.35) : cyc < 0.6 ? 1 : 1 - progIO(cyc, 0.6, 0.3);
            const h = 180 * u, yA = (P.ya ?? 0.43) * H + close * 52 * u - (1 - ap) * 500 * u, yB = (P.yb ?? 0.565) * H + (1 - bp) * 700 * u;
            const x0 = 0.06 * W, x1 = 0.94 * W;
            const a = stripD(x0, x1, yA, h, sd + 10, t, 'hook', 1, 0, { len: 78 * u, gap: 66 * u, w: 7 });
            const b = stripD(x0, x1, yB, h, sd + 20, t, 'loop', -1, close, { len: 70 * u, gap: 50 * u, loopW: 40 * u, w: 6 });
            [[A, a, ap], [B, b, bp]].forEach(([E, d, p]) => { E.band.setAttribute('d', p > 0.02 ? d.band : ''); E.rim.setAttribute('d', p > 0.02 ? d.rim : ''); E.teeth.setAttribute('d', p > 0.02 ? d.teeth : ''); });
            A.teeth.setAttribute('fill', lt > hk && lt < hk + 1.2 ? INK.red : INK.ink);
            B.teeth.setAttribute('fill', lt > lp && lt < lp + 1.2 ? INK.red : mix(INK.blue, INK.ink, 0.3));
            const R = [];
            if (cyc > 0.6 && cyc < 0.95) for (let i = 0; i < 6; i++) { const x = lerp(x0, x1, (i + 0.5) / 6), y = (yA + yB) / 2; R.push(inkPath([[x - 34, y - 40], [x - 10, y - 10], [x - 30, y], [x - 4, y + 34]], { w: 7, seed: sd + 60 + i, t })); }
            rips.setAttribute('d', R.join(' '));
            setBurrs(ref, [burr(0.5 * W, sf + 70 * u, 50 * u, sd + 80, t, { rot: t * 0.3 })]);
            arrow.setAttribute('d', '');
            LB.forEach(l => l.update(lt, t, cues));
          },
        };
      }
      // test: two rigs hang from a beam
      const beam = inkEl(root, WOOD_D()), beamR = inkEl(root), ropes = inkEl(root);
      const rigs = [0, 1].map(() => ({ A: mk(), B: mk(), wt: inkEl(root, mix(INK.inkSoft, INK.ink, 0.3)), wtR: inkEl(root), fuzz: inkEl(root) }));
      rigs[1].A.band.setAttribute('fill', NYLON()); rigs[1].B.band.setAttribute('fill', NYLON());
      const marks = inkEl(root, INK.red), tick = inkEl(root, INK.green);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const by = 0.25 * H;
          const bp = rect(-40, by - 26 * u, W + 40, by + 26 * u);
          beam.setAttribute('d', inkLoop(bp, { seed: sd + 2, t, smooth: false }));
          beamR.setAttribute('d', inkPath(bp, { w: 6, seed: sd + 3, t, closed: true, smooth: false }));
          desk.update(t, W, H, gy);
          const cot = atOr(cues, 'cotton', dur * 0.2), nyl = atOr(cues, 'nylon', dur * 0.6);
          const RP = [];
          rigs.forEach((R, i) => {
            const cx = (i ? 0.7 : 0.3) * W, sw = Math.sin(t * 2.2 + i) * (i ? 0.05 : 0.03);
            const fall = i === 0 ? progIO(lt, cot + 0.5, 0.45) : 0, fray = i === 0 ? clamp01((lt - cot) / 0.5) : 0;
            const top = by + 26 * u, h = 90 * u, len = 300 * u;
            // vertical strips drawn as horizontal strips in a rotated group would need transforms; draw them as vertical rects
            const ya = top + 40 * u, yb = ya + len * 0.55 + fray * 30 * u + fall * 0;
            const piv = [cx, top];
            const rot = q => { const dx = q[0] - piv[0], dy = q[1] - piv[1], c = Math.cos(sw), s = Math.sin(sw); return [piv[0] + dx * c - dy * s, piv[1] + dx * s + dy * c]; };
            const ra = rect(cx - h / 2, ya - 30 * u, cx + h / 2, ya + len * 0.6).map(rot);
            const dropY = fall * (gy - 120 * u - (yb + len * 0.6)) ;
            const rb = rect(cx - h / 2, yb + dropY, cx + h / 2, yb + len * 0.6 + dropY).map(rot);
            R.A.band.setAttribute('d', inkLoop(ra, { seed: sd + 20 + i, t, smooth: false }));
            R.A.rim.setAttribute('d', inkPath(ra, { w: 5, seed: sd + 22 + i, t, closed: true, smooth: false }));
            R.B.band.setAttribute('d', inkLoop(rb, { seed: sd + 24 + i, t, smooth: false }));
            R.B.rim.setAttribute('d', inkPath(rb, { w: 5, seed: sd + 26 + i, t, closed: true, smooth: false }));
            const T = []; for (let j = 0; j < 6; j++) { const y = yb + 14 * u + j * 26 * u + dropY; T.push(inkPath([rot([cx - h * 0.4, y]), rot([cx + h * 0.4, y + 6 * u])], { w: 3, seed: sd + 40 + i * 10 + j, t })); }
            R.A.teeth.setAttribute('d', T.join(' ')); R.B.teeth.setAttribute('d', '');
            RP.push(inkPath([[cx, by], rot([cx, ya - 30 * u])], { w: 5, seed: sd + 30 + i, t }));
            const wy = yb + len * 0.6 + dropY, wb = rect(cx - 70 * u, wy + 40 * u, cx + 70 * u, wy + 160 * u).map(rot);
            const wbAdj = fall > 0.99 ? wb.map(q => [q[0], Math.min(q[1], gy + 10 * u)]) : wb;
            R.wt.setAttribute('d', inkLoop(wbAdj, { seed: sd + 50 + i, t, smooth: false }));
            R.wtR.setAttribute('d', inkPath(wbAdj, { w: 5, seed: sd + 52 + i, t, closed: true, smooth: false }) + ' ' + inkPath([rot([cx, wy]), rot([cx - 30 * u, wy + 40 * u])], { w: 4, seed: sd + 54 + i, t }) + ' ' + inkPath([rot([cx, wy]), rot([cx + 30 * u, wy + 40 * u])], { w: 4, seed: sd + 56 + i, t }) + ' ' + inkCircle(...rot([cx, wy - 6 * u]), 12 * u, sd + 58 + i, t, { w: 4 }));
            const F = [];
            if (i === 0 && fray > 0) for (let j = 0; j < 14; j++) { const x = cx - h / 2 + hn(sd, j) * h, y = yb + len * 0.1 + hn(sd + 1, j) * len * 0.4; F.push(inkPath([[x, y], [x + (hn(sd + 2, j) - 0.5) * 70 * u * fray, y + (hn(sd + 3, j) - 0.3) * 60 * u * fray]], { w: 3, seed: sd + 60 + j, t, amp: 0.8 })); }
            R.fuzz.setAttribute('d', F.join(' '));
          });
          ropes.setAttribute('d', RP.join(' '));
          const x0 = 0.3 * W, xm = 0.18 * H + 0.3 * H, sx = spring(lt, cot + 0.3, 0.5), sc = spring(lt, nyl, 0.5);
          const xs = 110 * u * sx;
          marks.setAttribute('d', sx > 0.02 ? inkPath([[x0 - xs, xm - xs], [x0 + xs, xm + xs]], { w: 16 * u, seed: sd + 70, t }) + ' ' + inkPath([[x0 + xs, xm - xs], [x0 - xs, xm + xs]], { w: 16 * u, seed: sd + 71, t }) : '');
          const x1 = 0.7 * W, ts = 100 * u * sc;
          tick.setAttribute('d', sc > 0.02 ? inkPath([[x1 - ts, xm], [x1 - ts * 0.3, xm + ts * 0.7], [x1 + ts, xm - ts * 0.8]], { w: 18 * u, seed: sd + 72, t }) : '');
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.vc_name
  SH.vc_name = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 151, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.7) * H;
      const desk = bench(el(root, 'g'), sd + 1);
      // a big pinboard in front of the wall (frame + cork) holds everything
      const brd = inkEl(root, mix(INK.stain, INK.paperLight, 0.45)), brdR = inkEl(root, WOOD_D()), brdL = inkEl(root);
      const box = inkEl(root, INK.red), boxR = inkEl(root);
      const cards = inkEl(root, INK.paperLight), cardsR = inkEl(root), pins = inkEl(root, INK.red), arrows = inkEl(root, INK.ink);
      const T = (sz, fill) => L.txt(root, { 'font-family': SERIF, 'font-weight': 900, 'font-size': sz, fill });
      const big = (P.size ?? 150) * u, sm = (P.cardSize ?? 76) * u;
      const name = T(big, INK.paperLight); name.textContent = P.name || 'VELCRO';
      const words = (P.words || ['VELOURS', 'CROCHET']).map(w => { const e = T(sm, INK.ink); e.textContent = w; return e; });
      const NA = P.noteAt || ['velvet', 'hook'];
      const notes = (P.notes || ['velvet', 'hook']).map((n, i) => L.label(el(root, 'g'), { text: n, x: i ? 0.73 : 0.27, y: 0.565, at: NA[i] ?? 1 + i, size: P.noteSize ?? 80, color: 'red', rot: i ? 3 : -3, underline: true }, W, H));
      const strip = burrEls(root);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          desk.update(t, W, H, gy);
          const b0 = 0.155 * H, b1 = 0.625 * H, bp = rect(0.03 * W, b0, 0.97 * W, b1);
          brd.setAttribute('d', inkLoop(bp, { seed: sd + 2, t, smooth: false }));
          brdR.setAttribute('d', inkPath(bp, { w: 26 * u, seed: sd + 3, t, closed: true, smooth: false }));
          const SP = []; for (let i = 0; i < 40; i++) SP.push(inkDot(lerp(0.06, 0.94, hn(sd, i)) * W, lerp(b0 + 30, b1 - 30, hn(sd + 1, i)), 3, 3, sd + 10 + i, t));
          brdL.setAttribute('d', SP.join(' '));
          // VELCRO in a red box (pops at "velcro")
          const nm = atOr(cues, 'velcro', 0.3), p = spring(lt, nm - 0.25, 0.5), hit = punch(lt, nm, 0.7);
          const cx = 0.5 * W, fy = 0.28 * H, bw = big * 2.55 * p * (1 + 0.06 * hit), bh = big * 0.72 * p;
          const bx = rect(cx - bw, fy - bh * 1.15, cx + bw, fy + bh * 0.5);
          box.setAttribute('d', p > 0.02 ? inkLoop(bx, { seed: sd + 20, t, smooth: false }) : '');
          boxR.setAttribute('d', p > 0.02 ? inkPath(bx, { w: 6, seed: sd + 21, t, closed: true, smooth: false }) : '');
          name.setAttribute('x', f1(cx)); name.setAttribute('y', f1(fy)); name.setAttribute('font-size', f1(big * p * (1 + 0.06 * hit)));
          // VEL -> VELOURS (left card), CRO -> CROCHET (right card), each on its cue
          const C = [], CR = [], PN = [], AR = [];
          [0, 1].forEach(i => {
            const at = atOr(cues, NA[i], 1 + i), q = spring(lt, at - 0.2, 0.5), x = (i ? 0.73 : 0.27) * W, y = 0.45 * H;
            if (q < 0.02) { words[i].setAttribute('font-size', 0); return; }
            const w2 = 0.215 * W * q, h2 = sm * 0.85 * q;
            const cp = rect(x - w2, y - h2 * 1.2, x + w2, y + h2 * 0.6);
            C.push(inkLoop(cp, { seed: sd + 30 + i, t, smooth: false })); CR.push(inkPath(cp, { w: 5, seed: sd + 32 + i, t, closed: true, smooth: false }));
            PN.push(inkCircle(x, y - h2 * 1.2, 13 * u, sd + 34 + i, t, { fill: true }));
            words[i].setAttribute('x', f1(x)); words[i].setAttribute('y', f1(y)); words[i].setAttribute('font-size', f1(sm * q));
            const a0 = [cx + (i ? 0.55 : -0.55) * big * 1.4, fy + bh * 0.6 + 10 * u], a1 = [x + (i ? -0.08 : 0.08) * W, y - h2 * 1.2 - 14 * u], ap = progIO(lt, at - 0.3, 0.4);
            const e = [lerp(a0[0], a1[0], ap), lerp(a0[1], a1[1], ap)];
            AR.push(inkPath([a0, e], { w: 8 * u, seed: sd + 40 + i, t }));
            if (ap > 0.9) { const an = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]), L2 = 30 * u; AR.push(inkLoop([e, [e[0] - Math.cos(an - 0.5) * L2, e[1] - Math.sin(an - 0.5) * L2], [e[0] - Math.cos(an + 0.5) * L2, e[1] - Math.sin(an + 0.5) * L2]], { seed: sd + 44 + i, t, smooth: false, amp: 0.5 })); }
          });
          cards.setAttribute('d', C.join(' ')); cardsR.setAttribute('d', CR.join(' ')); pins.setAttribute('d', PN.join(' ')); arrows.setAttribute('d', AR.join(' '));
          notes.forEach(n => n.update(lt + 0.45, t, cues));   // fully grown by the time its word is spoken
          setBurrs(strip, [burr(0.82 * W, gy - 40 * u, 44 * u, sd + 50, t, { rot: t * 0.4 })]);
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.vc_shoe
  SH.vc_shoe = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 411, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.62) * H;
      const floor = inkEl(root, WOOD()), floorL = inkEl(root);
      const shadow = inkEl(root, INK.ink, { 'fill-opacity': 0.15 });
      const sole = inkEl(root, INK.paperLight), upper = inkEl(root, mix(INK.blue, INK.paperLight, 0.25)), toe = inkEl(root, INK.paperLight), lines = inkEl(root);
      const straps = [0, 1].map(() => ({ f: inkEl(root, mix(INK.red, INK.inkSoft, 0.15)), r: inkEl(root), hk: inkEl(root) }));
      const rips = inkEl(root, INK.red), arrow = inkEl(root, INK.red);
      const B = burrEls(root);
      const rip = L.label(el(root, 'g'), { text: P.ripText || 'RIIIP!', x: P.ripX ?? 0.3, y: P.ripY ?? 0.24, at: P.ripAt ?? 'rip', size: 96, color: 'red', font: 'serif', rot: -8, underline: false }, W, H);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const fp = [[-40, gy], [W + 40, gy - 8], [W + 40, H + 40], [-40, H + 40]];
          floor.setAttribute('d', inkLoop(fp, { seed: sd, t, smooth: false, amp: 0.6 }));
          const FL = [inkPath([[-40, gy], [W + 40, gy - 8]], { w: 6, seed: sd + 1, t })];
          for (let i = 1; i < 9; i++) { const y = gy + Math.pow(i / 9, 1.4) * (H - gy); FL.push(inkPath([[-40, y], [W + 40, y - 6]], { w: 3, seed: sd + 2 + i, t })); }
          for (let i = 0; i < 9; i++) { const x = (i - 1) * 160 * u + (i % 2) * 70 * u; FL.push(inkPath([[x, gy + 20], [x - (x - W / 2) * 0.6, H + 20]], { w: 2.5, seed: sd + 20 + i, t })); }
          floorL.setAttribute('d', FL.join(' '));
          // the shoe (toe to the left), size ~880 px
          const x0 = 0.08 * W, x1 = 0.92 * W, sy = gy + 10 * u, S = (a, b) => [lerp(x0, x1, a), sy - b * u];
          shadow.setAttribute('d', inkCircle(0.5 * W, sy + 14 * u, 0.46 * W, sd + 30, t, { ry: 26 * u, fill: true }));
          const so = [S(0, 10), S(0.02, 60), S(0.98, 60), S(1, 20), S(0.97, 0), S(0.04, 0)];
          const up = [S(0.02, 60), S(0.05, 170), S(0.2, 250), S(0.45, 300), S(0.62, 440), S(0.86, 460), S(0.96, 420), S(0.99, 200), S(0.98, 60)];
          const tc = [S(0.02, 60), S(0.04, 150), S(0.14, 200), S(0.24, 150), S(0.24, 60)];
          sole.setAttribute('d', inkLoop(so, { seed: sd + 31, t, smooth: false }));
          upper.setAttribute('d', inkLoop(up, { seed: sd + 32, t }));
          toe.setAttribute('d', inkLoop(tc, { seed: sd + 33, t }));
          const LS = [inkPath(so, { w: 6, seed: sd + 34, t, closed: true, smooth: false }), inkPath(up, { w: 6, seed: sd + 35, t, closed: true }), inkPath(tc, { w: 5, seed: sd + 36, t, closed: true })];
          for (let i = 0; i < 14; i++) { const a = 0.05 + i * 0.065; LS.push(inkPath([S(a, 4), S(a + 0.02, 22)], { w: 4, seed: sd + 40 + i, t })); }
          LS.push(inkPath([S(0.62, 440), S(0.7, 400), S(0.86, 410)], { w: 4, seed: sd + 60, t }));
          lines.setAttribute('d', LS.join(' '));
          // two straps hinged on the far side (top edge of the tongue) and closing down over the foot
          const ripAt = atOr(cues, 'rip', dur * 0.25), R = [];
          straps.forEach((st, i) => {
            const open = progIO(lt, ripAt + i * 0.35, 0.35) * (1 - 0.15 * Math.sin(Math.max(0, lt - ripAt - 1) * 2));
            const hx = lerp(0.42, 0.6, i), hinge = S(hx + 0.02, 330 + i * 70), endC = S(hx - 0.12, 150 + i * 40);
            const a0 = Math.atan2(endC[1] - hinge[1], endC[0] - hinge[0]), len = Math.hypot(endC[0] - hinge[0], endC[1] - hinge[1]);
            const a = a0 + open * 1.35, end = [hinge[0] + Math.cos(a) * len, hinge[1] + Math.sin(a) * len];
            const nx = -Math.sin(a) * 34 * u, ny = Math.cos(a) * 34 * u;
            const band = [[hinge[0] - nx, hinge[1] - ny], [end[0] - nx, end[1] - ny], [end[0] + nx, end[1] + ny], [hinge[0] + nx, hinge[1] + ny]];
            st.f.setAttribute('d', inkLoop(band, { seed: sd + 70 + i, t, smooth: false }));
            st.r.setAttribute('d', inkPath(band, { w: 5, seed: sd + 72 + i, t, closed: true, smooth: false }) + ' ' + inkCircle(end[0], end[1], 22 * u, sd + 74 + i, t, { w: 4 }));
            const HK = []; if (open > 0.2) for (let j = 0; j < 7; j++) { const f = 0.3 + j * 0.09, p = [lerp(hinge[0], end[0], f), lerp(hinge[1], end[1], f)]; HK.push(inkPath([[p[0] + nx * 0.8, p[1] + ny * 0.8], [p[0] + nx * 1.4, p[1] + ny * 1.4], [p[0] + nx * 1.5 + 8, p[1] + ny * 1.5 - 4]], { w: 3, seed: sd + 80 + j + i * 10, t })); }
            st.hk.setAttribute('d', HK.join(' '));
            if (lt > ripAt + i * 0.35 && lt < ripAt + i * 0.35 + 0.8) for (let j = 0; j < 4; j++) { const p = [lerp(hinge[0], endC[0], 0.4 + j * 0.15), lerp(hinge[1], endC[1], 0.4 + j * 0.15)]; R.push(inkPath([[p[0] - 40 * u, p[1] - 50 * u], [p[0] - 20 * u, p[1] - 70 * u], [p[0] - 46 * u, p[1] - 90 * u], [p[0] - 24 * u, p[1] - 116 * u]], { w: 5, seed: sd + 100 + j + i * 10, t })); }
          });
          rips.setAttribute('d', R.join(' '));
          rip.update(lt, t, cues);
          const wd = atOr(cues, 'weed', dur * 0.6), wp = spring(lt, wd, 0.6), hit = punch(lt, wd, 0.7);
          const bc = [(P.burrAt || [0.66, 0.29])[0] * W, (P.burrAt || [0.66, 0.29])[1] * H];
          setBurrs(B, wp > 0.02 ? [burr(bc[0], bc[1], 90 * u * wp * (1 + 0.1 * hit), sd + 120, t, { rot: t * 0.4 })] : []);
          const tgt = [(P.arrowTo || [0.44, 0.39])[0] * W, (P.arrowTo || [0.44, 0.39])[1] * H], ap2 = progIO(lt, wd + 0.2, 0.4);
          const a0 = [bc[0] - 70 * u, bc[1] + 70 * u], e2 = [lerp(a0[0], tgt[0], ap2), lerp(a0[1], tgt[1], ap2)], an2 = Math.atan2(tgt[1] - a0[1], tgt[0] - a0[0]), L3 = 46 * u;
          arrow.setAttribute('d', ap2 > 0.02 ? inkPath([a0, e2], { w: 12 * u, seed: sd + 130, t }) + (ap2 > 0.9 ? ' ' + inkLoop([e2, [e2[0] - Math.cos(an2 - 0.5) * L3, e2[1] - Math.sin(an2 - 0.5) * L3], [e2[0] - Math.cos(an2 + 0.5) * L3, e2[1] - Math.sin(an2 + 0.5) * L3]], { seed: sd + 131, t, smooth: false, amp: 0.5 }) : '') : '');
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
