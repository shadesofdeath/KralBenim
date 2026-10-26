// phobos: Mars and its falling moon Phobos in the parchment ink style (brand/kit/BRAND.md §3, §5), made for the
// Stickstory Short "Phobos is falling" (2026-10-26, JAXA MMX news) but parametric: any Mars / small-moon / probe story.
// Every line boils at 8 Hz (_ink.js), palette tokens only (INK), everything a pure function of (seed, lt).
// Uses td__lib.js (window.TD: stars, label, figure) for the star field, pop-in labels and the narrator.
//
// Shared params (all shots): kasif: {x, y (ground, 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir,
//   face, emotion}]} | false · labels: [{text, x, y, at, size, color, font: "hand"|"serif", box, rot}] · stars: 18 ·
//   cam: {zoom: 1.06, fx: 0.5, fy: 0.45} (slow push-in) · cues: hit (punch of the whole frame) + every "at" name.
//
// SHOTS.phobos_space — Mars in space with Phobos on its orbit. P: {
//   mode: "fall" | "close" | "laps" | "ring",
//   mars: {x: 0.6, y: 0.44, r: 250, spin: 0.03}, orbit: {rx: 380, ry: 110, tilt: -12},
//   phobos: {s: 46 (half-length px), speed: 0.08 (laps per second)},
//   // fall : dashed red inward spiral (spiral: {turns: 1.6, from: 1.25, to: 0.78} of the orbit size) that Phobos rides
//   //        inward; at "drop" (cue) it jolts lower and red speed dashes flash
//   // close: orbit cinches tighter at "tight" (cue) and a red bracket Mars surface -> Phobos with
//   //        bracket: {text: "6,000 km", at} appears
//   // laps : Phobos races round (speed ~1.4) with a motion trail; counter: {x: 0.5, y: 0.2, label: "LAP", max: 3}
//   // ring : at "crash" (cue) a red dashed fall-line from Phobos to the surface with a burst; at "ring" (cue)
//   //        Phobos shatters and its pieces spread along the orbit into a debris ring
// }
// SHOTS.phobos_launch — a rocket (core + two side boosters, flag) on a coastal pad next to a lattice tower; at
//   "go" (cue) engines light, smoke billows, the rocket lifts off; at "to" (cue) a small Mars + Phobos appears in
//   the sky (target: {x: 0.8, y: 0.2, r: 56}) and a dashed red trajectory arcs from the rocket's nose to it.
//   P: {rocket: {x: 0.42, s: 0.85, rise: 360}, ground: 0.58, sea: {from: 0.62}, flag: true, go, to, target,
//       clouds: [[x, y, w], ...], smoke_max: px (cap on sideways smoke spread), arc_lift: 120}
// SHOTS.phobos_sky — standing on Mars: dusty ground, rocks, stars; Phobos rises out of the western horizon and
//   climbs an arc (path: [[0.1, 0.53], [0.3, 0.2], [0.62, 0.17]], speed: 1 = whole arc over the scene); big
//   compass letters W (left) and E (right); at "west" (cue) the W turns red and punches.
//   P: {horizon: 0.52, path, from: 0.0, to: 0.85, west, compass: true}
// SHOTS.phobos_sink — Phobos above the curved Martian surface; at "century" a "100 YEARS" label, at "sinks" Phobos
//   drops (ghost outline of where it was + red arrow), at "feet" a 6-foot ruler next to the narrator lights up.
//   P: {phobos: {x: 0.36, y: 0.33, s: 150, drop: 70}, ruler: {x: 0.66, h: 0.86 (of the narrator's height), text: "6 FT",
//       fill_at: cue (default "feet"), fill_dur: 0.45, label_at: cue (default fill_at)},
//       century, sinks, feet}
// SHOTS.phobos_rock — Phobos close up (lumpy potato, Stickney crater, long grooves). P: {
//   mode: "crack" | "scoop",
//   // crack: Mars at the left edge; at "pull" (cue) red tidal arrows stretch the moon; at "crack" (cue) the grooves
//   //        split open in red, branch and flecks fly off; phobos: {x: 0.6, y: 0.37, s: 300, rot: -14}
//   // scoop: standing on Phobos (grey ground, craters) under a huge Mars (mars: {x: 0.58, y: 0.31, r: 330}); a
//   //        lander (lander: {x: 0.25}) scoops the ground at "scoop" (cue); the narrator lifts a rock at "rock"
//   //        (cue) with a gold glint; at "loom" (cue) Mars swells and the ground shakes
// }
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, n, fb) => typeof n === 'number' ? n : (n != null && cues && cues[n] != null) ? cues[n] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const ell = (cx, cy, rx, ry, n = 16, rot = 0) => {
    const c = Math.cos(rot), s = Math.sin(rot), out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return out;
  };
  let clipN = 0;

  // ------------------------------------------------------------------ Mars
  function mars(parent, defs, sd) {
    const id = 'phm' + (sd % 100000) + '_' + (clipN++);
    const cp = el(defs || parent, 'clipPath', { id }), cc = el(cp, 'circle');
    const g = el(parent, 'g');
    const base = inkEl(g, INK.paperLight), rust = inkEl(g, INK.red, { 'fill-opacity': 0.4 });
    const inner = el(g, 'g', { 'clip-path': `url(#${id})` });
    const marks = inkEl(inner, INK.inkSoft, { 'fill-opacity': 0.32 }), canyon = inkEl(inner, INK.ink, { 'fill-opacity': 0.55 });
    const craters = inkEl(inner, INK.inkSoft), cap = inkEl(inner, INK.paperLight), hatch = inkEl(inner, INK.inkSoft);
    const ring = inkEl(g);
    const r0 = rng(sd + 17), blobs = [], crs = [];
    for (let i = 0; i < 7; i++) blobs.push({ u: r0(), v: lerp(-0.55, 0.6, r0()), a: lerp(0.14, 0.3, r0()), b: lerp(0.07, 0.16, r0()) });
    for (let i = 0; i < 9; i++) crs.push({ u: r0(), v: lerp(-0.7, 0.75, r0()), r: lerp(0.03, 0.07, r0()) });
    return {
      update(t, cx, cy, r, o = {}) {
        const spin = o.spin ?? 0.03;
        cc.setAttribute('cx', f1(cx)); cc.setAttribute('cy', f1(cy)); cc.setAttribute('r', f1(r));
        const p = ell(cx, cy, r, r, Math.max(16, Math.min(40, Math.round(r / 12))));
        const disc = inkLoop(p, { seed: sd + 1, t, amp: 1.4 });
        base.setAttribute('d', disc); rust.setAttribute('d', disc);
        ring.setAttribute('d', inkPath(p, { w: cl(r * 0.028, 4, 8), seed: sd + 2, t, closed: true, amp: 1.4 }));
        const lon = u => ((u + t * spin) % 1 + 1) % 1 * 2.4 - 1.2;
        let md = '';
        blobs.forEach((b, i) => {
          const u = lon(b.u); if (Math.abs(u) > 1.15) return;
          const sq = Math.sqrt(Math.max(0.05, 1 - u * u)), x = cx + u * r, y = cy + b.v * r;
          const q = ell(x, y, b.a * r * sq, b.b * r, 10).map(([px, py], k) => [px + Math.sin(k * 1.7 + i) * b.a * r * 0.16 * sq, py + Math.cos(k * 2.3 + i) * b.b * r * 0.22]);
          md += inkLoop(q, { seed: sd + 30 + i, t, amp: 1.1 }) + ' ';
        });
        marks.setAttribute('d', md);
        const cu = lon(0.35);
        let cd = '';
        if (Math.abs(cu) < 0.95) {
          const sq = Math.sqrt(Math.max(0.05, 1 - cu * cu)), pts = [];
          for (let k = 0; k <= 6; k++) { const f = k / 6; pts.push([cx + (cu - 0.32 * sq + f * 0.64 * sq) * r, cy + (0.04 + Math.sin(f * 3) * 0.035) * r]); }
          cd = inkPath(pts, { w: cl(r * 0.03, 3, 9), seed: sd + 50, t, amp: 0.9, taper: 0.6 });
        }
        canyon.setAttribute('d', cd);
        let crd = '';
        if (r > 90) crs.forEach((c, i) => {
          const u = lon(c.u); if (Math.abs(u) > 0.92) return;
          const sq = Math.sqrt(Math.max(0.05, 1 - u * u));
          crd += inkPath(ell(cx + u * r, cy + c.v * r, c.r * r * sq, c.r * r, 9), { w: cl(r * 0.01, 2, 3.5), seed: sd + 60 + i, t, closed: true, amp: 0.7 }) + ' ';
        });
        craters.setAttribute('d', crd);
        cap.setAttribute('d', inkLoop(ell(cx, cy - r * 0.95, r * 0.36, r * 0.12, 12), { seed: sd + 70, t, amp: 1 }));
        let hd = '';
        for (let k = 0; k < 11; k++) {            // night-side hatching on the right limb
          const a = -0.95 + k * 0.19, x0 = cx + Math.cos(a) * r * 0.8, y0 = cy + Math.sin(a) * r * 0.8;
          hd += inkPath([[x0, y0], [x0 + r * 0.3, y0 - r * 0.12]], { w: cl(r * 0.012, 2.4, 4), seed: sd + 80 + k, t, amp: 0.8 }) + ' ';
        }
        hatch.setAttribute('d', hd);
      },
    };
  }

  // ------------------------------------------------------------------ Phobos (lumpy potato moon)
  function phobos(parent, sd) {
    const g = el(parent, 'g');
    const fill = inkEl(g, INK.paperDark), dust = inkEl(g, INK.stain, { 'fill-opacity': 0.35 }), shade = inkEl(g, INK.inkSoft);
    const grooves = inkEl(g, INK.inkSoft), cracks = inkEl(g, INK.red), craterF = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.25 });
    const craters = inkEl(g), outline = inkEl(g);
    const r0 = rng(sd + 3), n = 16, ph1 = r0() * 6, ph2 = r0() * 6, shape = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, k = 1 + 0.08 * Math.sin(2 * a + ph1) + 0.06 * Math.sin(3 * a + ph2) + (r0() - 0.5) * 0.05;
      shape.push([Math.cos(a) * k, Math.sin(a) * 0.74 * k]);
    }
    const CR = [[-0.52, 0.03, 0.27], [0.28, -0.3, 0.09], [0.47, 0.22, 0.075], [0.06, 0.32, 0.065], [0.64, -0.08, 0.055], [-0.12, -0.42, 0.06], [0.2, 0.05, 0.05]];
    const GR = [-0.4, -0.25, -0.1, 0.06, 0.2, 0.34].map((y, k) => ({ y, x0: -0.2 + (k % 2) * 0.08, wob: r0() * 6 }));
    const HT = []; for (let k = 0; k < 9; k++) HT.push([lerp(0.15, 0.7, r0()), lerp(0.12, 0.42, r0())]);
    return {
      node: g,
      // o: {crack: 0..1, shake: px, stretch: 1}
      update(t, x, y, s, rot = 0, o = {}) {
        const ra = rot * Math.PI / 180, c = Math.cos(ra), si = Math.sin(ra), st = o.stretch ?? 1, sh = o.shake || 0;
        const bx = sh ? Math.sin(t * 61) * sh : 0, by = sh ? Math.cos(t * 47) * sh : 0;
        const W_ = ([lx, ly]) => { lx *= st; ly /= Math.sqrt(st); return [x + bx + s * (lx * c - ly * si), y + by + s * (lx * si + ly * c)]; };
        const pts = shape.map(W_);
        const big = s > 70, ow = cl(s * 0.035, 3.5, 8), gw = cl(s * 0.014, 2.2, 5);
        fill.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 1.2 }));
        outline.setAttribute('d', inkPath(pts, { w: ow, seed: sd + 2, t, closed: true, amp: 1.2 }));
        dust.setAttribute('d', inkLoop([[-0.7, -0.2], [-0.2, -0.5], [0.5, -0.45], [0.2, -0.15]].map(W_), { seed: sd + 4, t, amp: 1 }));
        let cd = '', cf = '';
        CR.forEach(([cx, cy, cr], i) => {
          if (!big && i > 0) return;
          const cp = ell(cx, cy, cr, cr * 0.85, 10).map(W_);
          cd += inkPath(cp, { w: ow * (i ? 0.55 : 0.8), seed: sd + 10 + i, t, closed: true, amp: 0.8 }) + ' ';
          cf += inkLoop(ell(cx + cr * 0.15, cy + cr * 0.15, cr * 0.75, cr * 0.6, 8).map(W_), { seed: sd + 20 + i, t, amp: 0.7 }) + ' ';
        });
        craters.setAttribute('d', cd); craterF.setAttribute('d', cf);
        let gd = '', kd = '';
        const crack = clamp01(o.crack || 0);
        if (big) GR.forEach((G, k) => {
          const hw = Math.sqrt(Math.max(0, 0.78 - (G.y / 0.66) ** 2));
          const xa = Math.max(G.x0, -hw), xb = hw * 0.95;
          if (xb - xa < 0.15) return;
          const line = []; for (let j = 0; j <= 6; j++) { const f = j / 6, lx = lerp(xa, xb, f); line.push([lx, G.y + Math.sin(f * 3 + G.wob) * 0.025 + f * 0.04]); }
          gd += inkPath(line.map(W_), { w: gw, seed: sd + 30 + k, t, amp: 0.7, taper: 0.5 }) + ' ';
          if (crack > 0.01) {
            const m = Math.max(2, Math.round(6 * crack)), part = line.slice(0, m + 1);
            kd += inkPath(part.map(W_), { w: gw * 2.4, seed: sd + 40 + k, t, amp: 1.2, taper: 0.4 }) + ' ';
            if (crack > 0.5) {                     // little side branches
              const q = line[3], b = (k % 2 ? 1 : -1) * 0.09 * (crack - 0.5) * 2;
              kd += inkPath([q, [q[0] + 0.05, q[1] + b], [q[0] + 0.12, q[1] + b * 1.5]].map(W_), { w: gw * 1.6, seed: sd + 50 + k, t, amp: 1, taper: 0.5 }) + ' ';
            }
          }
        });
        grooves.setAttribute('d', gd); cracks.setAttribute('d', kd);
        let hd = '';
        if (big) HT.forEach(([hx, hy], k) => { hd += inkPath([[hx, hy], [hx + 0.1, hy - 0.06]].map(W_), { w: gw * 0.9, seed: sd + 60 + k, t, amp: 0.7 }) + ' '; });
        shade.setAttribute('d', hd);
      },
    };
  }

  // ------------------------------------------------------------------ small helpers
  function common(ctx, defaults) {
    const { P, W, H, svg, seed } = ctx;
    const TD = window.TD, sd = seed * 1000 + 613;
    const root = el(svg, 'g'), cam = el(root, 'g');
    const stars = P.stars === 0 || defaults.stars === 0 && P.stars == null ? null : TD.stars(cam, sd + 1, W, H, P.stars ?? defaults.stars ?? 18, 0.15, 0.58);
    return { TD, sd, root, cam, stars };
  }
  function finish(ctx, K, root, sd, kdef) {
    const { P, W, H } = ctx, TD = window.TD;
    const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 300 + i));
    const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign(kdef, P.kasif), sd + 200) : null;
    return { labels, kas };
  }
  function camT(cam, lt, dur, cues, W, H, P, d = {}) {
    const C = Object.assign({ zoom: 1.06, fx: 0.5, fy: 0.45 }, d, P.cam || {});
    const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
    const z = lerp(1, C.zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit) * (C.extra || 1);
    const fx = W * C.fx, fy = H * C.fy, sx = C.shake || 0;
    cam.setAttribute('transform', `translate(${f1(fx + sx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  // dashed ellipse split into back (upper) / front (lower) halves; returns [back, front] path strings
  function dashedOrbit(cx, cy, rx, ry, tilt, sd, t, opts = {}) {
    const n = opts.n ?? 30, tr = tilt * Math.PI / 180, ph = opts.phase ?? 0, w = opts.w ?? 4.5;
    const P2 = a => { const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(tr) - y * Math.sin(tr), cy + x * Math.sin(tr) + y * Math.cos(tr)]; };
    let b = '', f = '';
    for (let k = 0; k < n; k++) {
      const a0 = k / n * Math.PI * 2 + ph, a1 = a0 + Math.PI * 2 / n * 0.55;
      const d = inkPath([P2(a0), P2((a0 + a1) / 2), P2(a1)], { w, seed: sd + k, t, amp: 0.8 }) + ' ';
      if (Math.sin(a0) < 0) b += d; else f += d;
    }
    return [b, f];
  }
  const orbitPt = (cx, cy, rx, ry, tilt, a) => {
    const tr = tilt * Math.PI / 180, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
    return [cx + x * Math.cos(tr) - y * Math.sin(tr), cy + x * Math.sin(tr) + y * Math.cos(tr)];
  };
  function burst(parent, sd) {
    const gold = inkEl(parent, INK.gold), red = inkEl(parent, INK.red);
    return {
      update(t, x, y, r, p) {
        if (p <= 0.01 || p >= 0.999) { gold.setAttribute('d', ''); red.setAttribute('d', ''); return; }
        const R = r * (0.4 + 0.8 * p), pts = [], pi = [];
        for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + 0.2, rr = k % 2 ? R * 0.45 : R; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); pi.push([x + Math.cos(a) * rr * 0.5, y + Math.sin(a) * rr * 0.5]); }
        const fade = 1 - p;
        gold.setAttribute('d', fade > 0.05 ? inkLoop(pts, { seed: sd + 1, t, smooth: false }) : '');
        red.setAttribute('d', fade > 0.05 ? inkLoop(pi, { seed: sd + 2, t, smooth: false }) : '');
      },
    };
  }

  // ================================================================== phobos_space
  SH.phobos_space = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const mode = P.mode || 'fall';
      const { sd, root, cam, stars } = common(ctx, { stars: 18 });
      const M = Object.assign({ x: 0.6, y: 0.44, r: 250, spin: 0.03 }, P.mars || {});
      const O = Object.assign({ rx: 380, ry: 110, tilt: -12 }, P.orbit || {});
      const PH = Object.assign({ s: 46, speed: mode === 'laps' ? 1.4 : 0.08, a0: 0.9 }, P.phobos || {});
      const back = el(cam, 'g'), orbB = inkEl(back, mode === 'fall' ? INK.red : INK.inkSoft), phB = phobos(back, sd + 5);
      const debB = inkEl(back, INK.paperDark), debBR = inkEl(back);
      const mr = mars(cam, defs, sd + 7);
      const front = el(cam, 'g'), trail = inkEl(front, INK.gold), orbF = inkEl(front, mode === 'fall' ? INK.red : INK.inkSoft);
      const fallLine = inkEl(front, INK.red), bst = burst(front, sd + 9);
      const phF = phobos(front, sd + 5), debF = inkEl(front, INK.paperDark), debFR = inkEl(front), dashes = inkEl(front, INK.red);
      const bracket = inkEl(front, INK.red);
      const BR = P.bracket ? Object.assign({ text: '6,000 km', at: 'tight', size: 66 }, P.bracket) : null;
      const brT = BR ? el(front, 'text', { 'font-family': INK_FONT, 'font-size': BR.size, fill: INK.red, 'text-anchor': 'middle' }) : null;
      if (brT) brT.textContent = BR.text;
      const CN = mode === 'laps' ? Object.assign({ x: 0.5, y: 0.2, label: 'LAP', max: 3, size: 140 }, P.counter || {}) : null;
      const cnT = CN ? el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': CN.size, 'text-anchor': 'middle', fill: INK.ink }) : null;
      const r1 = rng(sd + 11), deb = Array.from({ length: 80 }, (_, j) => ({ da: (r1() - 0.5) * 0.4, sp: lerp(0.8, 6.2, r1()) * (j % 2 ? -1 : 1), dr: (r1() - 0.5) * 0.1, sz: lerp(6, 16, r1()) }));
      const { labels, kas } = finish(ctx, null, root, sd, { x: 0.17, y: 0.6, scale: 0.9, pose: 'shock', face: 'right' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const drop = atOr(cues, P.drop ?? 'drop', null), crashA = atOr(cues, P.crash ?? 'crash', null), ringA = atOr(cues, P.ring ?? 'ring', null);
          const tightA = atOr(cues, P.tight ?? 'tight', null);
          let shake = 0;
          if (drop != null && lt >= drop && lt < drop + 0.4) shake = Math.sin(lt * 80) * 7 * (1 - (lt - drop) / 0.4);
          if (ringA != null && lt >= ringA && lt < ringA + 0.45) shake = Math.sin(lt * 80) * 9 * (1 - (lt - ringA) / 0.45);
          camT(cam, lt, dur, cues, W, H, P, { fy: M.y, shake });
          if (stars) stars.update(t);
          const cx = M.x * W, cy = M.y * H;
          // orbit size (close: cinches at "tight")
          let k = 1;
          if (mode === 'close') k = lerp(1.18, 1, tightA == null ? 1 : (lt >= tightA ? spring(lt, tightA, 0.7) : 0));
          const rx = O.rx * k, ry = O.ry * k;
          // Phobos angle + where it is
          let a = PH.a0 + lt * PH.speed * Math.PI * 2, pos, spiralK = 1;
          if (mode === 'fall') {
            const SP = Object.assign({ turns: 1.6, from: 1.28, to: 0.8 }, P.spiral || {});
            const u = clamp01(0.55 + lt / Math.max(4, dur * 3)) + (drop != null && lt >= drop ? 0.12 * spring(lt, drop, 0.5) : 0);
            spiralK = lerp(SP.from, SP.to, Math.min(1.1, u));
            a = PH.a0 + SP.turns * Math.PI * 2 * u;
            pos = orbitPt(cx, cy, rx * spiralK, ry * spiralK, O.tilt, a);
            // spiral: dashed red line from the outer start to slightly inside the current point
            let b = '', f = '';
            const N = 70;
            for (let j = 0; j < N; j++) {
              const u0 = j / N * 1.1, u1 = u0 + 0.55 / N * 1.1;
              const pp = uu => { const kk = lerp(SP.from, SP.to, uu); return orbitPt(cx, cy, rx * kk, ry * kk, O.tilt, PH.a0 + SP.turns * Math.PI * 2 * uu); };
              const d = inkPath([pp(u0), pp((u0 + u1) / 2), pp(u1)], { w: 5, seed: sd + 100 + j, t, amp: 0.7 }) + ' ';
              const aa = PH.a0 + SP.turns * Math.PI * 2 * u0;
              if (Math.sin(aa) < 0) b += d; else f += d;
            }
            orbB.setAttribute('d', b); orbF.setAttribute('d', f);
          } else {
            pos = orbitPt(cx, cy, rx, ry, O.tilt, a);
            const [b, f] = dashedOrbit(cx, cy, rx, ry, O.tilt, sd + 100, t, { phase: lt * 0.2 });
            orbB.setAttribute('d', ringA != null && lt >= ringA ? '' : b); orbF.setAttribute('d', ringA != null && lt >= ringA ? '' : f);
          }
          const behind = Math.sin(a) < 0;
          const depthS = lerp(0.88, 1.08, (Math.sin(a) + 1) / 2);
          const shattered = ringA != null && lt >= ringA;
          // crash line (ring mode): red dashed fall to the surface + burst
          if (mode === 'ring' && crashA != null && lt >= crashA) {
            const p = prog(lt, crashA, 0.35), sx = cx - M.r * 0.55, sy = cy + M.r * 0.83;
            const from = [pos[0], pos[1] + PH.s * 0.6];
            let d = '';
            for (let j = 0; j < 8; j++) {
              const u0 = j / 8 * p, u1 = u0 + 0.6 / 8 * p;
              const q = uu => [lerp(from[0], sx, uu) + Math.sin(uu * 3) * 40, lerp(from[1], sy, uu)];
              d += inkPath([q(u0), q((u0 + u1) / 2), q(u1)], { w: 6, seed: sd + 140 + j, t, amp: 0.8 }) + ' ';
            }
            fallLine.setAttribute('d', d);
            bst.update(t, sx, sy, 70, p >= 1 ? clamp01((lt - crashA - 0.35) / 0.8) : 0);
          } else { fallLine.setAttribute('d', ''); bst.update(t, 0, 0, 0, 0); }
          mr.update(t, cx, cy, M.r, { spin: M.spin });
          const s = PH.s * depthS * (mode === 'ring' && crashA != null && lt >= crashA && !shattered ? 1 + 0.08 * punch(lt, crashA, 0.5) : 1);
          const rot = -20 + lt * 25;
          phB.node.style.display = behind && !shattered ? '' : 'none';
          phF.node.style.display = !behind && !shattered ? '' : 'none';
          if (!shattered) (behind ? phB : phF).update(t, pos[0], pos[1], s, rot, { shake: drop != null && lt >= drop && lt < drop + 0.4 ? 4 : 0 });
          // debris ring
          let dbB = '', dbF = '', dbBR = '', dbFR = '';
          if (shattered) {
            const e = lt - ringA;
            deb.forEach((q, j) => {
              const aa = a + q.da + q.sp * (1 - Math.exp(-e * 1.6)) * 1.1 + q.sp * e * 0.12, kk = 1 + q.dr * Math.min(1, e * 2);
              const p = orbitPt(cx, cy, rx * kk, ry * kk, O.tilt, aa), sz = q.sz * lerp(0.9, 1.1, (Math.sin(aa) + 1) / 2);
              const blob = inkLoop(ell(p[0], p[1], sz, sz * 0.75, 7, j), { seed: sd + 400 + j, t, amp: 0.9 });
              const rr = inkPath(ell(p[0], p[1], sz, sz * 0.75, 7, j), { w: 2.6, seed: sd + 500 + j, t, closed: true, amp: 0.9 });
              if (Math.sin(aa) < 0) { dbB += blob + ' '; dbBR += rr + ' '; } else { dbF += blob + ' '; dbFR += rr + ' '; }
            });
          }
          debB.setAttribute('d', dbB); debBR.setAttribute('d', dbBR); debF.setAttribute('d', dbF); debFR.setAttribute('d', dbFR);
          // fall: red speed dashes over Phobos pointing at Mars after "drop"
          let dd = '';
          if (mode === 'fall' && drop != null && lt >= drop) {
            const vx = cx - pos[0], vy = cy - pos[1], L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
            const ap = prog(lt, drop, 0.35);
            [-1, 0, 1].forEach((o, j) => {
              const ox = -uy * o * 26, oy = ux * o * 26, st = PH.s * 1.15 + j * 6;
              const A = [pos[0] - ux * (st + 52 * ap) + ox, pos[1] - uy * (st + 52 * ap) + oy], B = [pos[0] - ux * st + ox, pos[1] - uy * st + oy];
              dd += inkPath([A, B], { w: 7, seed: sd + 160 + j, t, amp: 1 }) + ' ';
            });
            // arrow head towards Mars
            const tip = [pos[0] + ux * (PH.s * 1.5 + 50 * ap), pos[1] + uy * (PH.s * 1.5 + 50 * ap)];
            const b0 = [tip[0] - ux * 34 - uy * 22, tip[1] - uy * 34 + ux * 22], b1 = [tip[0] - ux * 34 + uy * 22, tip[1] - uy * 34 - ux * 22];
            dd += inkPath([b0, tip, b1], { w: 8, seed: sd + 170, t, amp: 1, smooth: false }) + ' ';
            dd += inkPath([[pos[0] + ux * PH.s * 1.1, pos[1] + uy * PH.s * 1.1], tip], { w: 8, seed: sd + 171, t, amp: 1 });
          }
          dashes.setAttribute('d', dd);
          // laps: gold motion trail
          let td = '';
          if (mode === 'laps') {
            for (let j = 1; j <= 6; j++) {
              const a0 = a - j * 0.13, a1 = a - (j - 1) * 0.13 - 0.03;
              const p0 = orbitPt(cx, cy, rx, ry, O.tilt, a0), p1 = orbitPt(cx, cy, rx, ry, O.tilt, a1);
              if (Math.sin(a0) < 0 && Math.sin(a1) < 0) continue;
              td += inkPath([p0, p1], { w: Math.max(3, 16 - j * 2), seed: sd + 180 + j, t, amp: 0.8 }) + ' ';
            }
          }
          trail.setAttribute('d', td);
          // close: bracket from the surface to Phobos
          if (BR) {
            const ba = atOr(cues, BR.at, null), bp = ba == null ? 1 : (lt >= ba ? prog(lt, ba, 0.4) : 0);
            const vx = pos[0] - cx, vy = pos[1] - cy, L = Math.hypot(vx, vy) || 1, ux = vx / L, uy = vy / L;
            const A = [cx + ux * (M.r + 8), cy + uy * (M.r + 8)], B = [pos[0] - ux * PH.s * 0.95, pos[1] - uy * PH.s * 0.95];
            const nx = -uy * 18, ny = ux * 18, Bp = [lerp(A[0], B[0], bp), lerp(A[1], B[1], bp)];
            bracket.setAttribute('d', bp > 0.02 ? inkPath([A, Bp], { w: 6, seed: sd + 190, t, amp: 0.8 }) + ' ' + inkPath([[A[0] - nx, A[1] - ny], [A[0] + nx, A[1] + ny]], { w: 6, seed: sd + 191, t }) + (bp > 0.95 ? ' ' + inkPath([[B[0] - nx, B[1] - ny], [B[0] + nx, B[1] + ny]], { w: 6, seed: sd + 192, t }) : '') : '');
            const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], bb = boil(sd + 193, t, 1.2);
            brT.setAttribute('x', f1(m[0] + (BR.dx ?? 0) + bb[0])); brT.setAttribute('y', f1(m[1] + (BR.dy ?? 90) + bb[1]));
            brT.setAttribute('opacity', bp > 0.9 ? 1 : 0);
          }
          if (CN) {
            const laps = Math.min(CN.max, Math.floor((a - PH.a0) / (Math.PI * 2)) + 1);
            const txt = `${CN.label} ${laps}`;
            if (cnT.textContent !== txt) cnT.textContent = txt;
            const lapT = PH.a0 + (laps - 1) * Math.PI * 2, since = (a - lapT) / (PH.speed * Math.PI * 2);
            const pk = laps > 1 && since < 0.5 ? Math.exp(-since * 7) : 0, b = boil(sd + 210, t, 1.2);
            cnT.setAttribute('x', f1(CN.x * W + b[0])); cnT.setAttribute('y', f1(CN.y * H + b[1]));
            cnT.setAttribute('fill', laps >= CN.max ? INK.red : INK.ink);
            cnT.setAttribute('transform', `translate(${f1(CN.x * W)} ${f1(CN.y * H)}) scale(${(1 + 0.14 * pk).toFixed(3)}) translate(${f1(-CN.x * W)} ${f1(-CN.y * H)})`);
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== phobos_launch
  SH.phobos_launch = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const { sd, root, cam } = common(ctx, { stars: 0 });
      const GY = (P.ground ?? 0.58) * H, R = Object.assign({ x: 0.42, s: 0.85, rise: 360 }, P.rocket || {});
      const SEA = Object.assign({ from: 0.62 }, P.sea || {}), TG = Object.assign({ x: 0.8, y: 0.2, r: 56 }, P.target || {});
      const sky = inkEl(cam, INK.inkSoft), cloudsF = inkEl(cam, INK.paperLight), cloudsR = inkEl(cam, INK.inkSoft);
      const tgtG = el(cam, 'g'), mr = mars(tgtG, defs, sd + 3), ph = phobos(tgtG, sd + 4), traj = inkEl(cam, INK.red);
      const seaF = inkEl(cam, INK.blue, { 'fill-opacity': 0.16 }), seaW = inkEl(cam, INK.blue), land = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), landR = inkEl(cam);
      const tower = inkEl(cam);
      const smokeB = inkEl(cam, INK.paperLight), smokeBR = inkEl(cam, INK.inkSoft);
      const rg = el(cam, 'g');
      const flameR = inkEl(rg, INK.red), flameG = inkEl(rg, INK.gold);
      const body = inkEl(rg, INK.paperLight), bodyR = inkEl(rg), detail = inkEl(rg, INK.inkSoft), flagF = inkEl(rg, INK.paperLight), flagD = inkEl(rg, INK.red), flagR = inkEl(rg);
      const smokeF = inkEl(cam, INK.paperLight), smokeFR = inkEl(cam, INK.inkSoft), pad = inkEl(cam, INK.paperDark), padR = inkEl(cam);
      const r0 = rng(sd + 9), puffs = Array.from({ length: 20 }, (_, i) => ({ side: i % 2 ? 1 : -1, sp: lerp(70, 230, r0()), up: lerp(10, 110, r0()), r: lerp(38, 70, r0()), d: r0() * 0.6, front: i % 3 === 0 }));
      const { labels, kas } = finish(ctx, null, root, sd, { x: 0.82, y: 0.6, scale: 0.72, pose: 'wave', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const go = atOr(cues, P.go ?? 'go', 0.5), to = atOr(cues, P.to ?? 'to', null);
          const u = Math.max(0, lt - go), lit = lt >= go - 0.25;
          const shake = lit ? Math.sin(lt * 70) * (u < 1.2 ? 4 : 2) : 0;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.45, shake, zoom: 1.05 });
          // sky: a few far clouds + horizon haze lines
          let cf = '', cr = '';
          (P.clouds || [[0.18, 0.2, 110], [0.55, 0.13, 80], [0.3, 0.36, 70]]).forEach(([x, y, w], i) => {
            const X = x * W + Math.sin(t * 0.3 + i) * 12 + t * 8, Y = y * H, pts = [[X - w, Y + 18], [X - w * 0.6, Y - 14], [X - w * 0.1, Y - 34], [X + w * 0.45, Y - 20], [X + w, Y + 14]];
            cf += inkLoop(pts, { seed: sd + 20 + i, t }) + ' ';
            cr += inkPath(pts, { w: 4, seed: sd + 30 + i, t, closed: true }) + ' ';
          });
          cloudsF.setAttribute('d', cf); cloudsR.setAttribute('d', cr);
          sky.setAttribute('d', '');
          // target: Mars + Phobos in the sky, dashed trajectory from the nose
          const tp = to == null ? 0 : (lt >= to ? spring(lt, to, 0.6) : 0);
          tgtG.style.display = tp > 0.02 ? '' : 'none';
          if (tp > 0.02) {
            const mrR = TG.r * lerp(0.4, 1, tp);
            mr.update(t, TG.x * W, TG.y * H, mrR, { spin: 0.05 });
            const pa = t * 2.2;
            ph.update(t, TG.x * W + Math.cos(pa) * mrR * 1.75, TG.y * H + Math.sin(pa) * mrR * 0.5, 16 * tp, pa * 40);
          }
          const rise = Math.min(R.rise, 70 * u + 55 * u * u), rx = R.x * W, by = GY - rise, s = R.s;
          const nose = [rx, by - 668 * s];
          let tj = '';
          if (to != null && lt >= to) {
            const p = prog(lt, to + 0.1, 0.8), A = nose, B = [TG.x * W - TG.r * 1.2, TG.y * H + TG.r * 0.9], C = [lerp(A[0], B[0], 0.25), Math.min(A[1], B[1]) - (P.arc_lift ?? 120)];
            for (let j = 0; j < 12; j++) {
              const u0 = j / 12 * p, u1 = u0 + 0.55 / 12 * p;
              const q = v => [(1 - v) * (1 - v) * A[0] + 2 * v * (1 - v) * C[0] + v * v * B[0], (1 - v) * (1 - v) * A[1] + 2 * v * (1 - v) * C[1] + v * v * B[1]];
              tj += inkPath([q(u0), q((u0 + u1) / 2), q(u1)], { w: 6, seed: sd + 40 + j, t, amp: 0.8 }) + ' ';
            }
          }
          traj.setAttribute('d', tj);
          // sea + land
          const sx = SEA.from * W;
          seaF.setAttribute('d', inkLoop([[sx, GY + 10], [W + 20, GY + 10], [W + 20, H * 0.82], [sx - 80, H * 0.82]], { seed: sd + 50, t, smooth: false }));
          let wd = '';
          for (let j = 0; j < 7; j++) {
            const y = GY + 40 + j * 46, x0 = sx - 20 + ((j * 53 + t * 30) % 120);
            wd += inkPath([[x0, y], [x0 + 40, y - 10], [x0 + 80, y]], { w: 4, seed: sd + 60 + j, t, amp: 0.8 }) + ' ';
          }
          seaW.setAttribute('d', wd);
          land.setAttribute('d', inkLoop([[-20, GY], [sx + 30, GY], [sx - 60, H * 0.82], [-20, H * 0.82]], { seed: sd + 70, t, smooth: false }));
          landR.setAttribute('d', inkPath([[-20, GY], [sx + 20, GY], [sx - 40, GY + 120], [sx - 70, H * 0.82]], { w: 6, seed: sd + 71, t }));
          // launch tower (lattice)
          const tx0 = rx - 210 * s, tx1 = rx - 150 * s, top = GY - 720 * s;
          let tw = inkPath([[tx0, GY], [tx0, top]], { w: 6, seed: sd + 80, t }) + ' ' + inkPath([[tx1, GY], [tx1, top]], { w: 6, seed: sd + 81, t });
          for (let j = 0; j < 9; j++) {
            const y0 = GY - j * 80 * s, y1 = y0 - 80 * s;
            tw += ' ' + inkPath([[tx0, y0], [tx1, y1]], { w: 3.5, seed: sd + 90 + j, t }) + ' ' + inkPath([[tx0, y1], [tx1, y1]], { w: 3.5, seed: sd + 100 + j, t });
          }
          tw += ' ' + inkPath([[tx1, top + 40 * s], [rx - 50 * s, top + 40 * s]], { w: 6, seed: sd + 110, t });
          tower.setAttribute('d', tw);
          // pad
          const padPts = [[rx - 190 * s, GY], [rx + 190 * s, GY], [rx + 170 * s, GY + 34], [rx - 170 * s, GY + 34]];
          pad.setAttribute('d', inkLoop(padPts, { seed: sd + 120, t, smooth: false }));
          padR.setAttribute('d', inkPath(padPts, { w: 5, seed: sd + 121, t, closed: true, smooth: false }));
          // rocket
          const L = (x, y) => [rx + x * s, by + y * s];
          const core = [L(-42, -10), L(-42, -520), L(-30, -600), L(0, -668), L(30, -600), L(42, -520), L(42, -10)];
          const bL = [L(-50, -10), L(-50, -230), L(-67, -268), L(-84, -230), L(-84, -10)];
          const bRt = [L(50, -10), L(50, -230), L(67, -268), L(84, -230), L(84, -10)];
          const loops = [core, bL, bRt].map((q, i) => inkLoop(q, { seed: sd + 130 + i, t, smooth: false, amp: 1 })).join(' ');
          body.setAttribute('d', loops);
          bodyR.setAttribute('d', [core, bL, bRt].map((q, i) => inkPath(q, { w: 5, seed: sd + 140 + i, t, closed: true, smooth: false, amp: 1 })).join(' '));
          detail.setAttribute('d', [inkPath([L(-42, -520), L(42, -520)], { w: 4, seed: sd + 150, t }), inkPath([L(-42, -300), L(42, -300)], { w: 3.5, seed: sd + 151, t }),
            inkPath([L(-30, -10), L(-36, 14), L(36, 14), L(30, -10)], { w: 5, seed: sd + 152, t, smooth: false })].join(' '));
          if (P.flag !== false) {
            const fp = [L(-24, -430), L(24, -430), L(24, -398), L(-24, -398)];
            flagF.setAttribute('d', inkLoop(fp, { seed: sd + 160, t, smooth: false, amp: 0.6 }));
            flagR.setAttribute('d', inkPath(fp, { w: 3, seed: sd + 161, t, closed: true, smooth: false, amp: 0.6 }));
            const c = L(0, -414); flagD.setAttribute('d', inkDot(c[0], c[1], 9 * s, 9 * s, sd + 162, t, 0.4));
          }
          // flames
          let fr = '', fg = '';
          if (lit) {
            const ig = clamp01((lt - (go - 0.25)) / 0.3);
            [[0, 1.25], [-67, 0.9], [67, 0.9]].forEach(([x, k], i) => {
              const len = (150 + 40 * Math.sin(t * 40 + i * 2)) * k * ig, wd = (x ? 18 : 30) * k;
              const pts = [L(x - wd, 14), L(x - wd * 0.5, 14 + len * 0.5), L(x, 14 + len), L(x + wd * 0.5, 14 + len * 0.5), L(x + wd, 14)];
              fr += inkLoop(pts, { seed: sd + 170 + i, t, amp: 2.5 }) + ' ';
              const pi = [L(x - wd * 0.5, 14), L(x, 14 + len * 0.6), L(x + wd * 0.5, 14)];
              fg += inkLoop(pi, { seed: sd + 180 + i, t, amp: 2 }) + ' ';
            });
          }
          flameR.setAttribute('d', fr); flameG.setAttribute('d', fg);
          // smoke puffs billowing sideways from the pad
          let sb = '', sbr = '', sf = '', sfr = '';
          if (lit) puffs.forEach((q, i) => {
            const e = Math.max(0, lt - go + 0.15 - q.d); if (e <= 0) return;
            const x = rx + q.side * Math.min(P.smoke_max ?? 9999, 40 + q.sp * Math.sqrt(e) * 1.4), y = GY - 10 - q.up * Math.min(1, e), r = q.r * Math.min(1.4, 0.3 + e * 0.9);
            const pts = []; for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2, rr = r * (1 + 0.16 * Math.abs(Math.sin(a * 3 + i))); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.78]); }
            const lp = inkLoop(pts, { seed: sd + 200 + i, t, amp: 1.5 }), rp = inkPath(pts, { w: 4, seed: sd + 230 + i, t, closed: true, amp: 1.5 });
            if (q.front) { sf += lp + ' '; sfr += rp + ' '; } else { sb += lp + ' '; sbr += rp + ' '; }
          });
          smokeB.setAttribute('d', sb); smokeBR.setAttribute('d', sbr); smokeF.setAttribute('d', sf); smokeFR.setAttribute('d', sfr);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== phobos_sky
  SH.phobos_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam, stars } = common(ctx, { stars: 22 });
      const HZ = (P.horizon ?? 0.52) * H;
      const path = (P.path || [[0.1, 0.56], [0.24, 0.2], [0.62, 0.17]]).map(([x, y]) => [x * W, y * H]);
      const trail = inkEl(cam, INK.inkSoft), ph = phobos(cam, sd + 4);
      const hills = inkEl(cam, INK.paperDark), hillsR = inkEl(cam, INK.inkSoft), ground = inkEl(cam, INK.red, { 'fill-opacity': 0.22 }), groundR = inkEl(cam);
      const hatch = inkEl(cam, INK.inkSoft), rocksF = inkEl(cam, INK.paperDark), rocksR = inkEl(cam);
      const FR = 'Fraunces, Georgia, serif';
      const wT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 150, 'text-anchor': 'middle', fill: INK.ink }); wT.textContent = 'W';
      const eT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.inkSoft }); eT.textContent = 'E';
      const arrow = inkEl(root, INK.red);
      const r0 = rng(sd + 7), rocks = Array.from({ length: 9 }, () => ({ x: r0(), y: lerp(0.06, 0.5, r0()), r: lerp(14, 46, r0()) }));
      const { labels, kas } = finish(ctx, null, root, sd, { x: 0.62, y: 0.6, scale: 0.85, pose: 'look', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.5, zoom: 1.05 });
          if (stars) stars.update(t);
          const west = atOr(cues, P.west ?? 'west', null);
          // Phobos along a quadratic arc (rises out of the western horizon)
          const u = lerp(P.from ?? 0, P.to ?? 0.85, clamp01((lt + 0.15) / Math.max(1.2, dur)));
          const q = v => [(1 - v) * (1 - v) * path[0][0] + 2 * v * (1 - v) * path[1][0] + v * v * path[2][0], (1 - v) * (1 - v) * path[0][1] + 2 * v * (1 - v) * path[1][1] + v * v * path[2][1]];
          const p = q(u);
          let td = '';
          for (let j = 0; j < 14; j++) {
            const u0 = j / 14 * u, u1 = u0 + 0.5 / 14 * u;
            td += inkPath([q(u0), q((u0 + u1) / 2), q(u1)], { w: 5, seed: sd + 20 + j, t, amp: 0.7 }) + ' ';
          }
          trail.setAttribute('d', td);
          ph.update(t, p[0], p[1], P.s ?? 64, -15 + lt * 10);
          // far hills + ground (drawn after Phobos, so it hides behind the horizon)
          const hp = [[-30, HZ + 6], [0.12 * W, HZ - 40], [0.3 * W, HZ - 14], [0.48 * W, HZ - 62], [0.66 * W, HZ - 20], [0.84 * W, HZ - 48], [W + 30, HZ - 10], [W + 30, HZ + 30], [-30, HZ + 30]];
          hills.setAttribute('d', inkLoop(hp, { seed: sd + 40, t, amp: 1.2 }));
          hillsR.setAttribute('d', inkPath(hp.slice(0, 7), { w: 4, seed: sd + 41, t }));
          const gp = [[-30, HZ + 4], [W + 30, HZ + 4], [W + 30, H + 20], [-30, H + 20]];
          ground.setAttribute('d', inkLoop(gp, { seed: sd + 42, t, smooth: false }));
          groundR.setAttribute('d', inkPath([[-30, HZ + 4], [0.4 * W, HZ + 10], [W + 30, HZ]], { w: 6, seed: sd + 43, t }));
          let hd = '';
          for (let j = 0; j < 16; j++) {
            const x = (j * 137) % W, y = HZ + 60 + ((j * 71) % 380);
            hd += inkPath([[x, y], [x + 60, y - 8]], { w: 3.5, seed: sd + 50 + j, t, amp: 0.8 }) + ' ';
          }
          hatch.setAttribute('d', hd);
          let rf = '', rr = '';
          rocks.forEach((k, j) => {
            const x = k.x * W, y = HZ + k.y * (H * 0.3), pts = [[x - k.r, y], [x - k.r * 0.6, y - k.r * 0.7], [x + k.r * 0.3, y - k.r * 0.8], [x + k.r, y - k.r * 0.2], [x + k.r * 0.9, y]];
            rf += inkLoop(pts, { seed: sd + 70 + j, t }) + ' ';
            rr += inkPath(pts, { w: 4, seed: sd + 80 + j, t, closed: true }) + ' ';
          });
          rocksF.setAttribute('d', rf); rocksR.setAttribute('d', rr);
          // compass letters
          if (P.compass !== false) {
            const wk = west == null ? 0 : (lt >= west ? 1 : 0), pk = punch(lt, west, 0.6), b = boil(sd + 90, t, 1.2), b2 = boil(sd + 91, t, 1.2);
            const wx = (P.w_x ?? 0.17) * W, wy = HZ + 170;
            wT.setAttribute('fill', wk ? INK.red : INK.ink);
            wT.setAttribute('transform', `translate(${f1(wx + b[0])} ${f1(wy + b[1])}) scale(${(1 + 0.18 * pk).toFixed(3)})`);
            eT.setAttribute('transform', `translate(${f1(0.86 * W + b2[0])} ${f1(HZ + 160 + b2[1])})`);
            // little red up-arrow over the W after the cue
            const ap = west == null ? 0 : (lt >= west ? prog(lt, west, 0.35) : 0);
            arrow.setAttribute('d', ap > 0.02 ? inkPath([[wx, HZ + 30], [wx, HZ + 30 - 90 * ap]], { w: 9, seed: sd + 92, t }) + ' ' + inkPath([[wx - 26, HZ + 30 - 90 * ap + 28], [wx, HZ + 30 - 90 * ap], [wx + 26, HZ + 30 - 90 * ap + 28]], { w: 9, seed: sd + 93, t, smooth: false }) : '');
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== phobos_sink
  SH.phobos_sink = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const { sd, root, cam, stars } = common(ctx, { stars: 16 });
      const PH = Object.assign({ x: 0.36, y: 0.33, s: 150, drop: 80 }, P.phobos || {});
      const RU = Object.assign({ x: 0.64, text: '6 FT', h: 0.95 }, P.ruler || {});
      const surfB = inkEl(cam, INK.paperLight), surfF = inkEl(cam, INK.red, { 'fill-opacity': 0.3 }), surfR = inkEl(cam), surfH = inkEl(cam, INK.inkSoft);
      const orbit = inkEl(cam, INK.inkSoft), ghost = inkEl(cam, INK.inkSoft), arrow = inkEl(cam, INK.red);
      const ph = phobos(cam, sd + 4);
      const ruler = inkEl(root, INK.paperLight), rulerR = inkEl(root), ticks = inkEl(root), rulerHi = inkEl(root, INK.red, { 'fill-opacity': 0.35 });
      const rT = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red }); rT.textContent = RU.text;
      const { labels, kas } = finish(ctx, null, root, sd, { x: 0.82, y: 0.6, scale: 0.78, pose: 'think', face: 'left' });
      const KS = (P.kasif && P.kasif.scale) || 0.78, KY = ((P.kasif && P.kasif.y) || 0.6) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.4, zoom: 1.05 });
          if (stars) stars.update(t);
          const sinks = atOr(cues, P.sinks ?? 'sinks', null), feet = atOr(cues, P.feet ?? 'feet', null);
          // big curved Mars surface at the bottom
          const Rr = 2600, cx = W * 0.5, cy = H * 0.6 + Rr - 10;
          const arc = []; for (let j = 0; j <= 24; j++) { const a = -Math.PI / 2 + (j / 24 - 0.5) * 0.62; arc.push([cx + Math.cos(a) * Rr, cy + Math.sin(a) * Rr]); }
          const surf = arc.concat([[W + 40, H + 40], [-40, H + 40]]);
          surfB.setAttribute('d', inkLoop(surf, { seed: sd + 10, t, smooth: false }));
          surfF.setAttribute('d', inkLoop(surf, { seed: sd + 10, t, smooth: false }));
          surfR.setAttribute('d', inkPath(arc, { w: 7, seed: sd + 11, t }));
          let hd = '';
          for (let j = 0; j < 12; j++) { const x = 40 + j * 88, y = H * 0.6 + 70 + (j % 3) * 60; hd += inkPath([[x, y], [x + 50, y - 6]], { w: 3.5, seed: sd + 20 + j, t, amp: 0.8 }) + ' '; }
          surfH.setAttribute('d', hd);
          // Phobos: drift along its (flattened) orbit line, drop on "sinks"
          const dp = sinks == null ? 0 : (lt >= sinks ? spring(lt, sinks, 0.7) : 0);
          const x = PH.x * W + Math.sin(lt * 0.9) * 18, y0 = PH.y * H, y = y0 + PH.drop * dp;
          let od = '';
          for (let j = 0; j < 14; j++) { const x0 = j * 82 - ((lt * 40) % 82); od += inkPath([[x0, y0 + Math.sin(j) * 2], [x0 + 46, y0]], { w: 4, seed: sd + 40 + j, t, amp: 0.7 }) + ' '; }
          orbit.setAttribute('d', od);
          ph.update(t, x, y, PH.s, -12 + Math.sin(lt * 0.8) * 4, { shake: sinks != null && lt >= sinks && lt < sinks + 0.35 ? 3 : 0 });
          // ghost outline + arrow after the drop
          if (dp > 0.05) {
            const g = ell(x, y0, PH.s, PH.s * 0.74, 16, -0.2);
            let gd = '';
            for (let j = 0; j < 16; j += 2) gd += inkPath([g[j], g[(j + 1) % 16]], { w: 4, seed: sd + 60 + j, t, amp: 0.7 }) + ' ';
            ghost.setAttribute('d', gd);
            const ax = x + PH.s * 1.25, a0 = y0 - 10, a1 = y0 - 10 + PH.drop * dp + 26;
            arrow.setAttribute('d', inkPath([[ax, a0], [ax, a1]], { w: 9, seed: sd + 70, t }) + ' ' + inkPath([[ax - 24, a1 - 28], [ax, a1], [ax + 24, a1 - 28]], { w: 9, seed: sd + 71, t, smooth: false }));
          } else { ghost.setAttribute('d', ''); arrow.setAttribute('d', ''); }
          // 6-foot ruler next to the narrator (as tall as he is)
          const hgt = 540 * KS * RU.h, rx = RU.x * W, rb = KY, rtp = rb - hgt;
          const fa = atOr(cues, RU.fill_at, feet), fp = fa == null ? 0 : (lt >= fa ? prog(lt, fa, RU.fill_dur ?? 0.45) : 0), la = atOr(cues, RU.label_at, fa), pk = punch(lt, la, 0.6);
          const rp = [[rx - 26, rb], [rx + 26, rb], [rx + 26, rtp], [rx - 26, rtp]];
          ruler.setAttribute('d', inkLoop(rp, { seed: sd + 80, t, smooth: false }));
          rulerR.setAttribute('d', inkPath(rp, { w: 5, seed: sd + 81, t, closed: true, smooth: false }));
          rulerHi.setAttribute('d', fp > 0.02 ? inkLoop([[rx - 26, rb], [rx + 26, rb], [rx + 26, rb - hgt * fp], [rx - 26, rb - hgt * fp]], { seed: sd + 82, t, smooth: false }) : '');
          let tk = '';
          for (let j = 1; j < 12; j++) { const yy = rb - hgt * j / 12, w = j % 2 ? 14 : 26; tk += inkPath([[rx - 26, yy], [rx - 26 + w, yy]], { w: 3.5, seed: sd + 90 + j, t, amp: 0.6 }) + ' '; }
          ticks.setAttribute('d', tk);
          const b = boil(sd + 99, t, 1.2), ti = la != null && lt >= la ? 1 : 0;
          rT.setAttribute('opacity', ti);
          rT.setAttribute('transform', `translate(${f1(rx + b[0])} ${f1(rtp - 30 + b[1])}) scale(${(1 + 0.15 * pk).toFixed(3)})`);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== phobos_rock
  SH.phobos_rock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const mode = P.mode || 'crack';
      const { sd, root, cam, stars } = common(ctx, { stars: mode === 'crack' ? 16 : 12 });
      const M = Object.assign(mode === 'crack' ? { x: -0.14, y: 0.4, r: 360, spin: 0.02 } : { x: 0.58, y: 0.31, r: 330, spin: 0.02 }, P.mars || {});
      const PH = Object.assign({ x: 0.6, y: 0.37, s: 300, rot: -14 }, P.phobos || {});
      const LD = Object.assign({ x: 0.25, s: 0.9 }, P.lander || {});
      const mr = mars(cam, defs, sd + 3);
      const arrows = inkEl(cam, INK.red), ph = mode === 'crack' ? phobos(cam, sd + 4) : null, flecks = inkEl(cam, INK.inkSoft);
      // scoop mode: Phobos ground, lander, rock
      const gF = inkEl(cam, INK.paperDark), gR = inkEl(cam), gC = inkEl(cam, INK.inkSoft), gH = inkEl(cam, INK.inkSoft);
      const lg = el(cam, 'g'), legs = inkEl(lg), panel = inkEl(lg, INK.blue, { 'fill-opacity': 0.35 }), panelR = inkEl(lg), boxF = inkEl(lg, INK.gold, { 'fill-opacity': 0.55 }), boxR = inkEl(lg), arm = inkEl(lg), dustF = inkEl(cam, INK.stain, { 'fill-opacity': 0.5 }), dustR = inkEl(cam, INK.inkSoft);
      const { labels, kas } = finish(ctx, null, root, sd, mode === 'crack' ? { x: 0.84, y: 0.6, scale: 0.68, pose: 'point', face: 'left', dir: 30 } : { x: 0.72, y: 0.6, scale: 0.8, pose: 'idle', face: 'left' });
      const rockF = inkEl(root, INK.paperDark), rockR = inkEl(root), glint = inkEl(root, INK.gold);
      const r0 = rng(sd + 5), fl = Array.from({ length: 14 }, () => ({ a: r0() * Math.PI * 2, sp: lerp(80, 220, r0()), r: lerp(5, 12, r0()) }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const loom = atOr(cues, P.loom ?? 'loom', null), lp = loom == null ? 0 : (lt >= loom ? spring(lt, loom, 0.8) : 0);
          const shakeA = mode === 'crack' ? atOr(cues, P.crack ?? 'crack', null) : loom;
          const shake = shakeA != null && lt >= shakeA && lt < shakeA + 0.45 ? Math.sin(lt * 80) * 7 * (1 - (lt - shakeA) / 0.45) : 0;
          camT(cam, lt, dur, cues, W, H, P, { fy: mode === 'crack' ? 0.4 : 0.45, shake, zoom: 1.06 });
          if (stars) stars.update(t);
          mr.update(t, M.x * W, M.y * H, M.r * (1 + 0.1 * lp), { spin: M.spin });
          if (mode === 'crack') {
            const pull = atOr(cues, P.pull ?? 'pull', null), crack = atOr(cues, P.crack ?? 'crack', null);
            const pp = pull == null ? 0 : (lt >= pull ? prog(lt, pull, 0.5) : 0), cp = crack == null ? 0 : (lt >= crack ? prog(lt, crack, 0.7) : 0);
            const stretch = 1 + 0.05 * pp + 0.012 * Math.sin(lt * 5) * pp;
            const x = PH.x * W, y = PH.y * H + Math.sin(lt * 0.8) * 8;
            ph.update(t, x, y, PH.s, PH.rot + Math.sin(lt * 0.6) * 2, { crack: cp, stretch, shake: crack != null && lt >= crack && lt < crack + 0.4 ? 5 : 0 });
            // tidal arrows: near end pulled towards Mars, far end away (stretch)
            let ad = '';
            if (pp > 0.02) {
              const ra = PH.rot * Math.PI / 180, ux = Math.cos(ra), uy = Math.sin(ra);
              const wob = Math.sin(lt * 6) * 8;
              [[-1, 1.18], [1, 1.12]].forEach(([sgn, k], i) => {
                const bx = x + sgn * ux * PH.s * k, by = y + sgn * uy * PH.s * k, L = (110 + wob) * pp;
                const tip = [bx + sgn * ux * L, by + sgn * uy * L];
                ad += inkPath([[bx, by], tip], { w: 12, seed: sd + 30 + i, t }) + ' ';
                ad += inkPath([[tip[0] - sgn * ux * 38 - uy * 28, tip[1] - sgn * uy * 38 + ux * 28], tip, [tip[0] - sgn * ux * 38 + uy * 28, tip[1] - sgn * uy * 38 - ux * 28]], { w: 12, seed: sd + 40 + i, t, smooth: false }) + ' ';
              });
            }
            arrows.setAttribute('d', ad);
            let fd = '';
            if (cp > 0.01) fl.forEach((q, i) => {
              const e = lt - crack, px = x + Math.cos(q.a) * (PH.s * 0.7 + q.sp * e), py = y + Math.sin(q.a) * (PH.s * 0.5 + q.sp * e * 0.8);
              fd += inkDot(px, py, q.r, q.r * 0.8, sd + 60 + i, t) + ' ';
            });
            flecks.setAttribute('d', fd);
            [gF, gR, gC, gH, legs, panel, panelR, boxF, boxR, arm, dustF, dustR, rockF, rockR, glint].forEach(p => p.setAttribute('d', ''));
          } else {
            // ground of Phobos: a big gently curved horizon
            const GY = 0.6 * H - 30, Rr = 1500, cx = W * 0.45, cy = GY + Rr;
            const arc = []; for (let j = 0; j <= 24; j++) { const a = -Math.PI / 2 + (j / 24 - 0.5) * 0.95; arc.push([cx + Math.cos(a) * Rr, cy + Math.sin(a) * Rr]); }
            gF.setAttribute('d', inkLoop(arc.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 70, t, smooth: false }));
            gR.setAttribute('d', inkPath(arc, { w: 7, seed: sd + 71, t }));
            let cd = '';
            [[0.12, 0.66, 60], [0.5, 0.7, 44], [0.86, 0.68, 36], [0.34, 0.76, 80]].forEach(([u, v, r], j) => { cd += inkPath(ell(u * W, v * H, r, r * 0.3, 12), { w: 4.5, seed: sd + 72 + j, t, closed: true }) + ' '; });
            gC.setAttribute('d', cd);
            let hd = ''; for (let j = 0; j < 10; j++) { const x = 30 + j * 104, y = GY + 90 + (j % 3) * 45; hd += inkPath([[x, y], [x + 50, y - 6]], { w: 3.5, seed: sd + 80 + j, t, amp: 0.8 }) + ' '; }
            gH.setAttribute('d', hd);
            // lander on four legs with a sampling arm
            const lx = LD.x * W, s = LD.s, ly = GY + 6;
            const L = (x, y) => [lx + x * s, ly + y * s];
            legs.setAttribute('d', [inkPath([L(-60, -150), L(-110, 0)], { w: 6, seed: sd + 90, t }), inkPath([L(60, -150), L(110, 0)], { w: 6, seed: sd + 91, t }),
              inkPath([L(-20, -140), L(-40, 0)], { w: 5, seed: sd + 92, t }), inkPath([L(20, -140), L(40, 0)], { w: 5, seed: sd + 93, t }),
              inkDot(...L(-110, 0), 18 * s, 7 * s, sd + 94, t), inkDot(...L(110, 0), 18 * s, 7 * s, sd + 95, t)].join(' '));
            const bx = [L(-75, -150), L(75, -150), L(75, -270), L(-75, -270)];
            boxF.setAttribute('d', inkLoop(bx, { seed: sd + 96, t, smooth: false }));
            const pl = [L(-80, -235), L(-220, -255), L(-220, -195), L(-80, -185)], pr = [L(80, -235), L(220, -255), L(220, -195), L(80, -185)];
            panel.setAttribute('d', inkLoop(pl, { seed: sd + 97, t, smooth: false }) + ' ' + inkLoop(pr, { seed: sd + 98, t, smooth: false }));
            panelR.setAttribute('d', [pl, pr].map((q, i) => inkPath(q, { w: 4.5, seed: sd + 99 + i, t, closed: true, smooth: false })).join(' ') + ' ' +
              inkPath([L(-150, -245), L(-150, -190)], { w: 3, seed: sd + 101, t }) + ' ' + inkPath([L(150, -245), L(150, -190)], { w: 3, seed: sd + 102, t }));
            boxR.setAttribute('d', inkPath(bx, { w: 6, seed: sd + 103, t, closed: true, smooth: false }) + ' ' + inkPath([L(0, -270), L(10, -320)], { w: 5, seed: sd + 104, t }) + ' ' + inkPath(ell(...L(18, -335), 34 * s, 14 * s, 10, -0.4), { w: 4.5, seed: sd + 105, t, closed: true }));
            // arm: shoulder -> elbow -> scoop, dips at "scoop"
            const sc = atOr(cues, P.scoop ?? 'scoop', null), sp = sc == null ? 0.5 + 0.5 * Math.sin(lt * 2) : (lt >= sc ? Math.sin(Math.min(Math.PI, (lt - sc) * 3)) : 0.3 + 0.2 * Math.sin(lt * 2.5));
            const sh = L(75, -170), el1 = L(150 + 10 * sp, -120 + 20 * sp), tip = L(175 + 15 * sp, -10 + 12 * sp);
            arm.setAttribute('d', inkPath([sh, el1, tip], { w: 6, seed: sd + 106, t, smooth: false }) + ' ' + inkPath([[tip[0] - 22, tip[1] - 6], [tip[0] - 10, tip[1] + 14], [tip[0] + 16, tip[1] + 12], [tip[0] + 24, tip[1] - 8]], { w: 6, seed: sd + 107, t }));
            let dd = '', dr = '';
            if (sc != null && lt >= sc) {
              const e = lt - sc;
              for (let j = 0; j < 5; j++) {
                const px = tip[0] + (j - 2) * 30 * Math.min(1.5, e * 2), py = tip[1] + 6 - 50 * Math.min(1, e * 2) * (1 - Math.abs(j - 2) * 0.25), r = 9 + 6 * Math.min(1, e);
                if (e > 1.4) continue;
                const q = ell(px, py, r, r * 0.8, 9, j);
                dd += inkLoop(q, { seed: sd + 110 + j, t }) + ' '; dr += inkPath(q, { w: 3, seed: sd + 120 + j, t, closed: true }) + ' ';
              }
            }
            dustF.setAttribute('d', dd); dustR.setAttribute('d', dr);
            // the souvenir rock in the narrator's raised hand
            const ra = atOr(cues, P.rock ?? 'rock', null), rp = ra == null ? 0 : (lt >= ra ? spring(lt, ra, 0.5) : 0);
            if (kas) {
              const hk = kas.update(lt, t, cues, W, H);
              const hh = hk && hk.hand && hk.hand2 ? (hk.hand2[1] < hk.hand[1] ? hk.hand2 : hk.hand) : hk && hk.hand;
              if (rp > 0.02 && hh) {
                const r = 40 * rp, hd = hk.head || [hh[0], hh[1] + 100], vx = hh[0] - hd[0], vy = hh[1] - hd[1], vl = Math.hypot(vx, vy) || 1, cx2 = hh[0] + vx / vl * r * 1.1, cy2 = hh[1] + vy / vl * r * 1.1 - r * 0.3;
                const q = [[cx2 - r, cy2 + r * 0.4], [cx2 - r * 0.8, cy2 - r * 0.5], [cx2, cy2 - r * 0.9], [cx2 + r, cy2 - r * 0.3], [cx2 + r * 0.8, cy2 + r * 0.6], [cx2, cy2 + r * 0.8]];
                rockF.setAttribute('d', inkLoop(q, { seed: sd + 130, t })); rockR.setAttribute('d', inkPath(q, { w: 5, seed: sd + 131, t, closed: true }));
                const gl = 0.5 + 0.5 * Math.sin(lt * 9), G = 26 * gl * rp, gx = cx2 + r * 1.1, gy = cy2 - r * 1.1, st = [];
                for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, rr = k % 2 ? G * 0.3 : G; st.push([gx + Math.cos(a) * rr, gy + Math.sin(a) * rr]); }
                glint.setAttribute('d', G > 2 ? inkLoop(st, { seed: sd + 132, t, smooth: false, amp: 0.6 }) : '');
              } else { rockF.setAttribute('d', ''); rockR.setAttribute('d', ''); glint.setAttribute('d', ''); }
            }
            arrows.setAttribute('d', ''); flecks.setAttribute('d', '');
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas && mode === 'crack') kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
