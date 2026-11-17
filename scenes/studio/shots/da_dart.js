// da_dart: NASA's DART asteroid impact (26 Sept 2022) and ESA's Hera follow-up, in the parchment ink style
// (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz (_ink.js), palette tokens only (INK), everything a pure
// function of (seed, lt). Made for Stickstory "ag-03-dart-asteroid" (2026-11-17) but parametric: any small-body /
// planetary-defence / spacecraft story. Uses td__lib.js (window.TD: stars, earth, label, figure) at build time.
//
// Shared params (every shot): labels: [{text, x, y, at, size, color, font: "hand"|"serif", box, rot, strike}] ·
//   kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false ·
//   cam: {zoom: 1.05, fx: 0.5, fy: 0.45} (slow push over the shot) · stars: n (space shots) · cues: hit + every "at".
//
// SHOTS.da_craft  — the DART spacecraft (box, two long roll-out solar arrays, dish, camera tube) cruising through space
//   with speed streaks. P: {craft: {x: 0.42, y: 0.47, s: 1, rot: -4, drift: 14 (px/s to the right)}, streaks: true,
//   pair: {x: 0.9, y: 0.42, s: 1, at} | false (two far dots ahead: Didymos + Dimorphos), cube: true (LICIACube on the
//   side), release: cue|null (the cube separates and drifts back), tag: {at} (red ring + arrow on the camera)}
// SHOTS.da_draco  — the view through DART's camera: a viewfinder (corner brackets, crosshair, red REC dot).
//   P: {mode: "dots" (one dot splits in two on "split") | "lock" (crosshair glides to the small dot, red target box on
//   "lock") | "grow" (the moonlet swells from r0 to r1 and fills the frame) | "surface" (full frame of boulders, slow
//   push) | "freeze" (the last frame arrives line by line from the top and stops at `cut` of the height on "freeze"; the
//   rest is static), r0: 70, r1: 520, cut: 0.55, stamp: "DRACO"}
// SHOTS.da_room   — mission control: big wall screen, consoles in front, a team of figures; on "cheer" they throw up
//   their arms. P: {screen: "rock"|"lost"|"pair"|"hera"|"wow", team: [{x, scale, pose, face, accessory, beard, seq}] (default
//   4 people), cheer: cue|null, ground: 0.86, wow: {text, at} (speech burst over team[0])}
// SHOTS.da_binary — Didymos (spinning-top shape with an equatorial ridge) and its moonlet Dimorphos on a dashed orbit.
//   P: {didy: {x: 0.5, y: 0.5, r: 210}, orbit: {rx: 520, ry: 120, tilt: -8}, moon: {s: 46, speed: 0.05, a0: 0.4},
//   shrink: {at, to: 0.84} (orbit tightens, red arrows), pyramid: {at, x, y, h} (Great Pyramid for scale),
//   question: {at} (red "?" over the moon), tag: {text, at, size} (name label riding with the moon)}
// SHOTS.da_light  — light curve on graph paper: brightness vs time drawn by a moving pen, dips where the moon passes
//   in front (a mini eclipse icon over each deep dip). P: {period: 360 (px between deep dips), draw: {at: 0.1, dur: 3},
//   bracket: {text, at, i: 0} (period bracket between two deep dips), goal: {text, at} (thin red dashed line just
//   left of a dip), shift: {at, k: 0.8} (red curve with a shorter period)}
// SHOTS.da_impact — the moonlet and the blast. P: {mode: "plume" (ejecta cone spraying from the impact point; optional
//   cube fly-by) | "tail" (far view: the pair with a long comet-like debris tail growing to the right) | "push" (push
//   arrows: small blue "DART", big red "rubble" on "rubble", ejecta spraying the other way), rock: {x, y, r},
//   cube: {at} | false, rubble: cue}
// SHOTS.da_sky    — a ground scene with a falling space rock. P: {mode: "dino" (sauropods + cycads, the rock dives to
//   the horizon, flash dome on "hit") | "city" (apartment blocks, a bright streak with a smoke trail, flash on "flash",
//   windows crack and shards fall on "glass"), ground: 0.82, rock: {from: [1.1, -0.05], to: [0.62, 0.8], at: 0.2, dur: 2.4}}
// SHOTS.da_nudge  — why a small push early is enough: an asteroid on a dashed collision course to Earth; on "nudge" a
//   tiny red arrow and a new red path that bends away; the gap at Earth opens. P: {earth: {x: 0.82, y: 0.52, r: 150},
//   rock: {x: 0.1, y: 0.5}, nudge: cue, gap: {text, at}}
// SHOTS.da_hera   — ESA's Hera (box, two square solar wings, dish). P: {mode: "fly" | "arrive" (big Didymos with boulders,
//   craters and grooves, camera frustum from Hera) | "measure" (laser to Dimorphos, cubesats drift out on "cubes",
//   red "?" crater on "crater"), hera: {x, y, s, rot}, didy: {x, y, r}, moon: {x, y, s}}
// SHOTS.da_rubble — Dimorphos as a rubble pile. P: {mode: "pile" (cut-away: boulders pop in and pack the outline) |
//   "reshape" (on "reshape" the round moonlet squashes wider and flatter, old outline left as a dashed ghost),
//   x: 0.5, y: 0.5, r: 300}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, n, fb) => typeof n === 'number' ? n : (n != null && cues && cues[n] != null) ? cues[n] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const ell = (cx, cy, rx, ry, n = 16, rot = 0) => {
    const c = Math.cos(rot), s = Math.sin(rot), out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return out;
  };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const xf = (x, y, s, rot) => { const c = Math.cos(rot), si = Math.sin(rot); return ([px, py]) => [x + s * (px * c - py * si), y + s * (px * si + py * c)]; };

  // ------------------------------------------------------------------ common scaffolding
  function common(ctx, starsN) {
    const { P, W, H, svg, seed } = ctx;
    const TD = window.TD, sd = seed * 1000 + 377;
    const root = el(svg, 'g'), cam = el(root, 'g');
    const n = P.stars ?? starsN ?? 0;
    const stars = n > 0 ? TD.stars(cam, sd + 1, W, H, n, 0.04, 0.96) : null;
    return { TD, sd, root, cam, stars };
  }
  function finish(ctx, root, sd, kdef) {
    const { P, W, H } = ctx, TD = window.TD;
    const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 300 + i));
    const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({}, kdef, P.kasif), sd + 200) : null;
    return {
      update(lt, t, cues) {
        labels.forEach(l => l && l.update(lt, t, cues));
        if (kas) kas.update(lt, t, cues, W, H);
      },
    };
  }
  function camT(cam, lt, dur, cues, W, H, P, d = {}) {
    const C = Object.assign({ zoom: 1.05, fx: 0.5, fy: 0.45 }, d, P.cam || {});
    const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
    const z = lerp(1, C.zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
    const fx = W * C.fx, fy = H * C.fy, sx = C.shake || 0, sy = C.shakeY || 0;
    cam.setAttribute('transform', `translate(${f1(fx + sx)} ${f1(fy + sy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }

  // ------------------------------------------------------------------ rock (asteroid / moonlet)
  // shape: "lumpy" | "top" (spinning top with a pointed equator). update(t, x, y, r, o) o: {sx, sy, rot, boulders (count
  // drawn), shade: true, ridge: false, grooves: 0, craters: 0}
  function rock(parent, sd, shape = 'lumpy') {
    const g = el(parent, 'g');
    const fill = inkEl(g, INK.paperDark), shade = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.32 });
    const bF = inkEl(g, INK.paperLight), bS = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.4 }), bR = inkEl(g, INK.ink);
    const extra = inkEl(g, INK.inkSoft), outline = inkEl(g);
    const r0 = rng(sd + 5), n = 22, shp = [];
    const p1 = r0() * 6, p2 = r0() * 6;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      let k;
      if (shape === 'top') { const c = Math.abs(Math.cos(a)); k = 0.86 + 0.16 * Math.pow(c, 3) + 0.02 * Math.sin(5 * a + p1); }
      else k = 1 + 0.07 * Math.sin(2 * a + p1) + 0.05 * Math.sin(3 * a + p2) + (r0() - 0.5) * 0.06;
      shp.push([Math.cos(a) * k, Math.sin(a) * k * (shape === 'top' ? 0.9 : 0.88)]);
    }
    // boulders: rejection sampling inside the unit disc, big first
    const B = [];
    for (let tries = 0; tries < 900 && B.length < 70; tries++) {
      const rr = B.length < 8 ? lerp(0.1, 0.17, r0()) : B.length < 26 ? lerp(0.055, 0.1, r0()) : lerp(0.03, 0.055, r0());
      const a = r0() * Math.PI * 2, d = Math.sqrt(r0()) * (0.86 - rr);
      const u = Math.cos(a) * d, v = Math.sin(a) * d * 0.86;
      if (B.some(b => Math.hypot(b.u - u, b.v - v) < (b.r + rr) * 0.95)) continue;
      const pts = []; for (let k = 0; k < 7; k++) { const aa = k / 7 * Math.PI * 2 + r0() * 0.4; const kk = 0.8 + r0() * 0.3; pts.push([Math.cos(aa) * kk, Math.sin(aa) * kk * 0.82]); }
      B.push({ u, v, r: rr, pts });
    }
    const grooves = []; for (let k = 0; k < 6; k++) grooves.push({ y: lerp(-0.55, 0.5, k / 5) + (r0() - 0.5) * 0.08, a: r0() * 0.3 - 0.15, l: lerp(0.35, 0.7, r0()) });
    const craters = []; for (let k = 0; k < 6; k++) craters.push({ u: lerp(-0.6, 0.6, r0()), v: lerp(-0.55, 0.55, r0()), r: lerp(0.07, 0.14, r0()) });
    return {
      node: g,
      update(t, x, y, r, o = {}) {
        if (r < 1) { [fill, shade, bF, bS, bR, extra, outline].forEach(p => p.setAttribute('d', '')); return; }
        const sx = o.sx ?? 1, sy = o.sy ?? 1, rot = (o.rot ?? 0) * Math.PI / 180;
        const c = Math.cos(rot), si = Math.sin(rot);
        const M = ([u, v]) => { const px = u * r * sx, py = v * r * sy; return [x + px * c - py * si, y + px * si + py * c]; };
        const pts = shp.map(M), amp = cl(r * 0.006, 0.6, 1.6);
        fill.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp }));
        outline.setAttribute('d', inkPath(pts, { w: cl(r * 0.03, 3.5, 8), seed: sd + 2, t, closed: true, amp }));
        // shadow crescent on the lower right
        if (o.shade !== false) {
          const outer = [], inner = [];
          for (let k = 0; k <= 10; k++) { const a = -1.1 + k / 10 * 2.9; outer.push([Math.cos(a) * 0.95, Math.sin(a) * 0.84]); inner.unshift([Math.cos(a) * 0.62 - 0.16, Math.sin(a) * 0.55 - 0.12]); }
          shade.setAttribute('d', inkLoop(outer.concat(inner).map(M), { seed: sd + 3, t, amp }));
        } else shade.setAttribute('d', '');
        const nb = Math.min(B.length, o.boulders ?? 40);
        let df = '', ds = '', dr = '';
        for (let i = 0; i < nb; i++) {
          const b = B[i], br = b.r * r * Math.min(sx, sy);
          if (br < 3) continue;
          const pop = o.pop ? clamp01(o.pop(i)) : 1;
          if (pop <= 0.01) continue;
          const cx = b.u, cy = b.v, rr = b.r * lerp(0.3, 1, pop);
          const bp = b.pts.map(([u, v]) => M([cx + u * rr, cy + v * rr]));
          const lp = inkLoop(bp, { seed: sd + 20 + i, t, amp: amp * 0.7 });
          df += lp + ' ';
          ds += inkLoop(b.pts.slice(1, 5).map(([u, v]) => M([cx + u * rr * 0.9 + rr * 0.08, cy + v * rr * 0.9 + rr * 0.1])), { seed: sd + 120 + i, t, amp: amp * 0.6 }) + ' ';
          dr += inkPath(bp, { w: cl(br * 0.09, 2.2, 5.5), seed: sd + 220 + i, t, closed: true, amp: amp * 0.7 }) + ' ';
        }
        bF.setAttribute('d', df); bS.setAttribute('d', ds); bR.setAttribute('d', dr);
        let ex = '';
        if (o.ridge) ex += inkPath([[-0.98, 0.02], [-0.5, 0.1], [0, 0.12], [0.5, 0.1], [0.98, 0.02]].map(M), { w: cl(r * 0.016, 2.5, 6), seed: sd + 400, t, amp }) + ' ';
        const ng = o.grooves || 0;
        for (let k = 0; k < Math.min(ng, grooves.length); k++) {
          const G = grooves[k], x0 = -G.l / 2 + G.a, x1 = G.l / 2 + G.a;
          ex += inkPath([[x0, G.y], [(x0 + x1) / 2, G.y - 0.04], [x1, G.y + 0.02]].map(M), { w: cl(r * 0.01, 2, 4), seed: sd + 410 + k, t, amp }) + ' ';
        }
        const nc = o.craters || 0;
        for (let k = 0; k < Math.min(nc, craters.length); k++) {
          const C = craters[k];
          ex += inkPath(ell(C.u, C.v, C.r, C.r * 0.7, 10).map(M), { w: cl(r * 0.01, 2, 4.5), seed: sd + 430 + k, t, closed: true, amp }) + ' ';
        }
        extra.setAttribute('d', ex);
      },
    };
  }

  // ------------------------------------------------------------------ DART spacecraft (local: box 110 px, camera points +x)
  function craft(parent, sd) {
    const g = el(parent, 'g');
    const boom = inkEl(g), arrF = inkEl(g, INK.blue, { 'fill-opacity': 0.28 }), arrG = inkEl(g, INK.inkSoft), arrR = inkEl(g);
    const dishF = inkEl(g, INK.paperLight), dishR = inkEl(g);
    const boxF = inkEl(g, INK.paperLight), boxD = inkEl(g, INK.inkSoft), boxR = inkEl(g);
    const camF = inkEl(g, INK.paperDark), camR = inkEl(g), lens = inkEl(g, INK.ink);
    const cubeF = inkEl(g, INK.gold, { 'fill-opacity': 0.55 }), cubeR = inkEl(g);
    return {
      node: g,
      // returns world points {cam: [x, y], cube: [x, y]}
      update(t, x, y, s, rot = 0, o = {}) {
        const R = rot * Math.PI / 180, M = xf(x, y, s, R), S = k => sd * 30 + k;
        const w = cl(5.5 * s, 2.5, 8);
        boom.setAttribute('d', inkPath([[0, -55], [0, -95]].map(M), { w, seed: S(1), t }) + ' ' + inkPath([[0, 55], [0, 95]].map(M), { w, seed: S(2), t }));
        let af = '', ag = '', ar = '';
        for (const sgn of [-1, 1]) {
          const y0 = sgn * 95, y1 = sgn * (o.arr ?? 400), A = rect(-42, Math.min(y0, y1), 42, Math.max(y0, y1)).map(M);
          af += inkLoop(A, { seed: S(3 + sgn), t, smooth: false }) + ' ';
          ar += inkPath(A, { w, seed: S(6 + sgn), t, closed: true, smooth: false }) + ' ';
          for (let k = 1; k < 8; k++) { const yy = y0 + (y1 - y0) * k / 8; ag += inkPath([[-42, yy], [42, yy]].map(M), { w: w * 0.5, seed: S(10 + k + sgn * 20), t, amp: 0.6 }) + ' '; }
          ag += inkPath([[0, y0], [0, y1]].map(M), { w: w * 0.5, seed: S(50 + sgn), t, amp: 0.6 }) + ' ';
        }
        arrF.setAttribute('d', af); arrG.setAttribute('d', ag); arrR.setAttribute('d', ar);
        const dish = ell(-92, -8, 16, 46, 12).map(M);
        dishF.setAttribute('d', inkLoop(dish, { seed: S(60), t }));
        dishR.setAttribute('d', inkPath(dish, { w, seed: S(61), t, closed: true }) + ' ' + inkPath([[-92, -8], [-130, -8]].map(M), { w: w * 0.7, seed: S(62), t }) + ' ' + inkPath([[-76, -8], [-55, -8]].map(M), { w: w * 0.8, seed: S(63), t }));
        const box = rect(-55, -55, 55, 55).map(M);
        boxF.setAttribute('d', inkLoop(box, { seed: S(64), t, smooth: false }));
        boxR.setAttribute('d', inkPath(box, { w: w * 1.1, seed: S(65), t, closed: true, smooth: false }));
        boxD.setAttribute('d', inkPath([[-55, -18], [55, -18]].map(M), { w: w * 0.55, seed: S(66), t }) + ' ' + inkPath([[-20, -55], [-20, 55]].map(M), { w: w * 0.55, seed: S(67), t }) + ' ' + inkPath([[20, 18], [44, 18], [44, 42]].map(M), { w: w * 0.55, seed: S(68), t, smooth: false }));
        const camb = rect(55, -24, 118, 24).map(M);
        camF.setAttribute('d', inkLoop(camb, { seed: S(70), t, smooth: false }));
        camR.setAttribute('d', inkPath(camb, { w, seed: S(71), t, closed: true, smooth: false }));
        const L = M([120, 0]);
        lens.setAttribute('d', inkDot(L[0], L[1], 11 * s, 16 * s, S(72), t));
        const c = o.cube, cp = c ? M([c.dx ?? -30, c.dy ?? 82]) : null;
        if (c) {
          const cs = 0.9 * s, CM = xf(cp[0], cp[1], cs, R + (c.spin || 0));
          const cb = rect(-20, -20, 20, 20).map(CM), wl = rect(-56, -9, -20, 9).map(CM), wr = rect(20, -9, 56, 9).map(CM);
          cubeF.setAttribute('d', inkLoop(cb, { seed: S(80), t, smooth: false }) + ' ' + inkLoop(wl, { seed: S(81), t, smooth: false }) + ' ' + inkLoop(wr, { seed: S(82), t, smooth: false }));
          cubeR.setAttribute('d', [cb, wl, wr].map((q, k) => inkPath(q, { w: w * 0.8, seed: S(83 + k), t, closed: true, smooth: false })).join(' '));
        } else { cubeF.setAttribute('d', ''); cubeR.setAttribute('d', ''); }
        return { cam: L, cube: cp };
      },
    };
  }

  // ------------------------------------------------------------------ Hera (box, two square wings of 3 panels, dish)
  function hera(parent, sd) {
    const g = el(parent, 'g');
    const arm = inkEl(g), wF = inkEl(g, INK.blue, { 'fill-opacity': 0.3 }), wG = inkEl(g, INK.inkSoft), wR = inkEl(g);
    const boxF = inkEl(g, INK.gold, { 'fill-opacity': 0.5 }), boxD = inkEl(g, INK.inkSoft), boxR = inkEl(g);
    const dishF = inkEl(g, INK.paperLight), dishR = inkEl(g), lens = inkEl(g, INK.ink);
    return {
      update(t, x, y, s, rot = 0) {
        const M = xf(x, y, s, rot * Math.PI / 180), S = k => sd * 30 + k, w = cl(5.5 * s, 2.5, 8);
        arm.setAttribute('d', inkPath([[-75, 0], [-110, 0]].map(M), { w, seed: S(1), t }) + ' ' + inkPath([[75, 0], [110, 0]].map(M), { w, seed: S(2), t }));
        let f = '', gg = '', r = '';
        for (const sgn of [-1, 1]) {
          for (let k = 0; k < 3; k++) {
            const x0 = sgn * (110 + k * 106), x1 = sgn * (110 + k * 106 + 100), Q = rect(Math.min(x0, x1), -62, Math.max(x0, x1), 62).map(M);
            f += inkLoop(Q, { seed: S(5 + k + sgn * 10), t, smooth: false }) + ' ';
            r += inkPath(Q, { w, seed: S(30 + k + sgn * 10), t, closed: true, smooth: false }) + ' ';
            const xm = (x0 + x1) / 2;
            gg += inkPath([[xm, -62], [xm, 62]].map(M), { w: w * 0.45, seed: S(50 + k + sgn * 10), t, amp: 0.6 }) + ' ' + inkPath([[x0, 0], [x1, 0]].map(M), { w: w * 0.45, seed: S(70 + k + sgn * 10), t, amp: 0.6 }) + ' ';
          }
        }
        wF.setAttribute('d', f); wG.setAttribute('d', gg); wR.setAttribute('d', r);
        const box = rect(-75, -62, 75, 62).map(M);
        boxF.setAttribute('d', inkLoop(box, { seed: S(90), t, smooth: false }));
        boxR.setAttribute('d', inkPath(box, { w: w * 1.1, seed: S(91), t, closed: true, smooth: false }));
        boxD.setAttribute('d', inkPath([[-75, -10], [75, -10]].map(M), { w: w * 0.5, seed: S(92), t }) + ' ' + inkPath([[25, -62], [25, 62]].map(M), { w: w * 0.5, seed: S(93), t }));
        const dish = ell(0, -100, 62, 16, 14).map(M);
        dishF.setAttribute('d', inkLoop(dish, { seed: S(94), t }));
        dishR.setAttribute('d', inkPath(dish, { w, seed: S(95), t, closed: true }) + ' ' + inkPath([[0, -62], [0, -96]].map(M), { w, seed: S(96), t }));
        const L = M([0, 70]);
        lens.setAttribute('d', inkDot(L[0], L[1], 12 * s, 9 * s, S(97), t));
        return { lens: L };
      },
    };
  }
  function cubesat(parent, sd) {
    const f = inkEl(parent, INK.gold, { 'fill-opacity': 0.55 }), r = inkEl(parent);
    return {
      update(t, x, y, s, rot = 0) {
        const M = xf(x, y, s, rot * Math.PI / 180);
        const cb = rect(-18, -18, 18, 18).map(M), wl = rect(-52, -8, -18, 8).map(M), wr = rect(18, -8, 52, 8).map(M);
        f.setAttribute('d', [cb, wl, wr].map((q, k) => inkLoop(q, { seed: sd + k, t, smooth: false })).join(' '));
        r.setAttribute('d', [cb, wl, wr].map((q, k) => inkPath(q, { w: cl(4 * s, 2.5, 6), seed: sd + 10 + k, t, closed: true, smooth: false })).join(' '));
      },
    };
  }

  // dashed ellipse, split into back (upper) and front (lower) halves
  function dashedOrbit(cx, cy, rx, ry, tilt, sd, t, w = 4.5, n = 34) {
    const tr = tilt * Math.PI / 180;
    const Pt = a => { const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(tr) - y * Math.sin(tr), cy + x * Math.sin(tr) + y * Math.cos(tr)]; };
    let b = '', f = '';
    for (let k = 0; k < n; k++) {
      const a0 = k / n * Math.PI * 2, a1 = a0 + Math.PI * 2 / n * 0.55;
      const d = inkPath([Pt(a0), Pt((a0 + a1) / 2), Pt(a1)], { w, seed: sd + k, t, amp: 0.8 }) + ' ';
      if (Math.sin(a0) < 0) b += d; else f += d;
    }
    return [b, f, Pt];
  }
  function arrowD(A, B, w, sd, t, head = 1) {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, hs = Math.min(L * 0.4, 26 + w * 2.4) * head;
    return inkPath([A, B], { w, seed: sd, t }) + ' ' + inkPath([[B[0] - ux * hs - uy * hs * 0.6, B[1] - uy * hs + ux * hs * 0.6], B, [B[0] - ux * hs + uy * hs * 0.6, B[1] - uy * hs - ux * hs * 0.6]], { w, seed: sd + 1, t, smooth: false });
  }

  // ================================================================== da_craft
  SH.da_craft = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam, stars } = common(ctx, 26);
      const C = Object.assign({ x: 0.42, y: 0.47, s: 1, rot: -4, drift: 14 }, P.craft || {});
      const streak = inkEl(cam, INK.inkSoft), pairG = el(cam, 'g'), pA = rock(pairG, sd + 7, 'top'), pB = rock(pairG, sd + 8);
      const trail = inkEl(cam, INK.red), cr = craft(cam, sd + 3), tag = inkEl(cam, INK.red);
      const fin = finish(ctx, root, sd, { x: 0.84, y: 0.86, scale: 0.7, pose: 'point', face: 'left' });
      const r0 = rng(sd + 11), lines = Array.from({ length: 22 }, () => ({ y: r0(), l: lerp(80, 260, r0()), sp: lerp(700, 1400, r0()), ph: r0() }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fx: C.x, fy: C.y });
          if (stars) stars.update(t * 3);
          let sl = '';
          if (P.streaks !== false) lines.forEach((q, i) => {
            const x = W + 300 - ((q.ph * (W + 600) + lt * q.sp) % (W + 600)), y = q.y * H;
            sl += inkPath([[x, y], [x + q.l, y]], { w: 3.4, seed: sd + 500 + i, t, amp: 0.6, taper: 0.5 }) + ' ';
          });
          streak.setAttribute('d', sl);
          const pr = P.pair === false ? null : Object.assign({ x: 0.9, y: 0.42, s: 1 }, P.pair || {});
          const pp = pr ? (pr.at == null ? 1 : (lt >= atOr(cues, pr.at, 0) ? spring(lt, atOr(cues, pr.at, 0), 0.6) : 0)) : 0;
          const ps = (pr ? pr.s : 1) * (1 + lt * 0.02);
          pA.update(t, pr ? pr.x * W : 0, pr ? pr.y * H : 0, pp * 34 * ps, { boulders: 0, shade: true, rot: t * 30 });
          pB.update(t, pr ? pr.x * W + 64 * ps : 0, pr ? pr.y * H - 30 * ps : 0, pp * 11 * ps, { boulders: 0 });
          const bob = Math.sin(lt * 1.3) * 6, x = C.x * W + lt * C.drift, y = C.y * H + bob;
          const rel = P.release == null ? null : atOr(cues, P.release, null);
          let cube = P.cube === false ? null : { dx: -30, dy: 82 };
          let tr = '';
          if (cube && rel != null && lt >= rel) {
            const u = lt - rel, back = 60 * u + 40 * u * u;
            cube = { dx: -30 - back / (C.s * 0.95), dy: 82 + back * 0.35 / C.s, spin: u * 0.6 };
            for (let k = 0; k < 6; k++) { const f = (k + 0.5) / 6; tr += inkDot(x + (-30 - back * f) * C.s, y + (82 + back * 0.35 * f) * C.s, 4, 4, sd + 600 + k, t) + ' '; }
          }
          trail.setAttribute('d', tr);
          const pts = cr.update(t, x, y, C.s, C.rot + Math.sin(lt * 0.8) * 1.5, { cube, arr: C.arr });
          if (P.tag) {
            const a = atOr(cues, P.tag.at, 0.3), p = lt >= a ? spring(lt, a, 0.5) : 0;
            tag.setAttribute('d', p > 0.02 ? inkCircle(pts.cam[0], pts.cam[1], 46 * C.s * p, sd + 700, t, { w: 6 }) : '');
          }
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_draco (viewfinder)
  SH.da_draco = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const { sd, root, cam } = common(ctx, 0);
      const mode = P.mode || 'grow';
      const fr = Object.assign({ x0: 0.24, y0: 0.13, x1: 0.76, y1: 0.8 }, P.frame || {});
      const X0 = fr.x0 * W, Y0 = fr.y0 * H, X1 = fr.x1 * W, Y1 = fr.y1 * H, CX = (X0 + X1) / 2, CY = (Y0 + Y1) / 2;
      const id = 'dadr' + (sd % 100000);
      const cp = el(defs || root, 'clipPath', { id }), cr_ = el(cp, 'rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 });
      const id2 = id + 'c', cp2 = el(defs || root, 'clipPath', { id: id2 }), cr2 = el(cp2, 'rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0 });
      const back = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.5 });
      const scan = inkEl(cam, INK.inkSoft);
      const img = el(cam, 'g', { 'clip-path': `url(#${id})` });
      const imgIn = el(img, 'g', { 'clip-path': `url(#${id2})` });
      const big = rock(imgIn, sd + 3, 'top'), small = rock(imgIn, sd + 4), field = [];
      if (mode === 'surface' || mode === 'freeze') for (let k = 0; k < 5; k++) field.push(rock(imgIn, sd + 20 + k));
      const noise = inkEl(img, INK.inkSoft), lostBar = inkEl(img, INK.paperDark, { 'fill-opacity': 0.7 });
      const brk = inkEl(cam), cross = inkEl(cam, INK.ink), box = inkEl(cam, INK.red), rec = inkEl(cam, INK.red);
      const stamp = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 50, fill: INK.inkSoft, x: X0 + 34, y: Y1 - 26 });
      stamp.textContent = P.stamp ?? 'DRACO';
      const fin = finish(ctx, root, sd, { x: 0.88, y: 0.9, scale: 0.62, pose: 'point', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.03, fx: 0.5, fy: 0.47 });
          const fb = rect(X0, Y0, X1, Y1);
          back.setAttribute('d', inkLoop(fb, { seed: sd + 1, t, smooth: false, amp: 0.6 }));
          let sc = '';
          for (let k = 0; k < 16; k++) { const y = Y0 + (k + 0.5) / 16 * (Y1 - Y0); sc += inkPath([[X0 + 8, y], [X1 - 8, y]], { w: 1.6, seed: sd + 40 + k, t, amp: 0.4 }) + ' '; }
          scan.setAttribute('d', sc);
          // corner brackets
          const L = 70; let b = '';
          for (const [x, y, sx, sy] of [[X0, Y0, 1, 1], [X1, Y0, -1, 1], [X1, Y1, -1, -1], [X0, Y1, 1, -1]]) b += inkPath([[x, y + sy * L], [x, y], [x + sx * L, y]], { w: 8, seed: sd + 50 + x + y, t, smooth: false }) + ' ';
          b += inkPath(fb, { w: 3, seed: sd + 60, t, closed: true, smooth: false, amp: 0.6 });
          brk.setAttribute('d', b);
          rec.setAttribute('d', Math.floor(lt * 1.6) % 2 === 0 ? inkDot(X1 - 52, Y0 + 50, 15, 15, sd + 61, t) : '');
          let cx = CX, cy = CY, bx = '';
          big.update(t, 0, 0, 0); small.update(t, 0, 0, 0); field.forEach(f => f.update(t, 0, 0, 0));
          noise.setAttribute('d', ''); lostBar.setAttribute('d', '');
          if (mode === 'dots' || mode === 'lock') {
            const sp = mode === 'dots' ? prog(lt, atOr(cues, P.split ?? 'split', dur * 0.5), 1.2) : 1;
            const drift = 1 + lt * 0.03;
            const A = [CX - 90 * sp * drift, CY + 10 * sp], Bp = [CX + 170 * sp * drift, CY - 70 * sp];
            big.update(t, A[0], A[1], lerp(44, 50, sp) * drift, { boulders: 0, rot: t * 20 });
            small.update(t, Bp[0], Bp[1], lerp(0, 18, sp) * drift, { boulders: 0, shade: false });
            if (mode === 'lock') {
              const lk = atOr(cues, P.lock ?? 'lock', dur * 0.45), u = prog(lt, 0.2, Math.max(0.4, lk - 0.2));
              cx = lerp(CX, Bp[0], u); cy = lerp(CY, Bp[1], u);
              if (lt >= lk) { const p = spring(lt, lk, 0.5), s = lerp(110, 44, p); bx = inkPath(rect(Bp[0] - s, Bp[1] - s, Bp[0] + s, Bp[1] + s), { w: 7, seed: sd + 70, t, closed: true, smooth: false }); }
            }
          } else if (mode === 'grow') {
            const r0 = P.r0 ?? 70, r1 = P.r1 ?? 520, u = clamp01(lt / Math.max(1, dur));
            const r = r0 * Math.pow(r1 / r0, u);
            small.update(t, CX + 10, CY + 10, r, { boulders: Math.round(lerp(6, 60, u)), rot: -10 });
          } else {
            // surface / freeze: a field of big rocks filling the frame
            const z = 1 + lt * 0.04;
            const spots = [[0.2, 0.25, 0.32], [0.72, 0.3, 0.36], [0.42, 0.72, 0.4], [0.9, 0.82, 0.3], [0.06, 0.86, 0.28]];
            small.update(t, CX, CY, (X1 - X0) * 0.62 * z, { boulders: 70, shade: false, rot: 8 });
            field.forEach((f, k) => { const s = spots[k]; f.update(t, CX + (lerp(X0, X1, s[0]) - CX) * z, CY + (lerp(Y0, Y1, s[1]) - CY) * z, (X1 - X0) * s[2] * 0.5 * z, { boulders: 22, rot: k * 40 }); });
            if (mode === 'freeze') {
              const fz = atOr(cues, P.freeze ?? 'freeze', dur * 0.6), cut = P.cut ?? 0.55;
              const arr = clamp01(lt / Math.max(0.3, fz)) * cut, hh = (Y1 - Y0) * arr;
              cr2.setAttribute('height', f1(Math.max(0, hh)));
              let nz = '';
              const y0 = Y0 + hh;
              for (let k = 0; k < 26; k++) { const y = y0 + 10 + k * ((Y1 - y0) / 26); const fr2 = inkFrame(t); nz += inkPath([[X0 + ((k * 37 + fr2 * 53) % 120), y], [X1 - ((k * 23 + fr2 * 31) % 140), y]], { w: 2.4, seed: sd + 800 + k, t, amp: 1.2 }) + ' '; }
              noise.setAttribute('d', nz);
              lostBar.setAttribute('d', inkLoop(rect(X0, y0, X1, Y1), { seed: sd + 801, t, smooth: false, amp: 0.4 }));
            }
          }
          if (mode !== 'freeze') cr2.setAttribute('height', f1(Y1 - Y0));
          const g = 26, ln = 60;
          cross.setAttribute('d', [[[cx - g - ln, cy], [cx - g, cy]], [[cx + g, cy], [cx + g + ln, cy]], [[cx, cy - g - ln], [cx, cy - g]], [[cx, cy + g], [cx, cy + g + ln]]].map((q, k) => inkPath(q, { w: 4, seed: sd + 90 + k, t })).join(' '));
          box.setAttribute('d', bx);
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_room (mission control)
  SH.da_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { TD, sd, root, cam } = common(ctx, 0);
      const GY = (P.ground ?? 0.86) * H;
      const SX0 = W * 0.27, SX1 = W * 0.73, SY0 = H * 0.12, SY1 = H * 0.5;
      const scrB = inkEl(cam, INK.paperLight), scrF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.45 }), scrR = inkEl(cam), scrIn = el(cam, 'g');
      const sRock = rock(scrIn, sd + 5), sA = rock(scrIn, sd + 6, 'top'), sB = rock(scrIn, sd + 7);
      const lost = el(cam, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red, x: (SX0 + SX1) / 2, y: (SY0 + SY1) / 2 + 32 });
      lost.textContent = P.lost_text || 'NO SIGNAL';
      const desks = inkEl(cam, INK.paperDark), desksR = inkEl(cam), monF = inkEl(cam, INK.paperLight), monR = inkEl(cam), glow = inkEl(cam, INK.blue, { 'fill-opacity': 0.3 });
      const teamG = el(cam, 'g');
      const team = (P.team || [
        { x: 0.14, scale: 0.78, face: 'right', pose: 'idle' }, { x: 0.33, scale: 0.74, face: 'right', pose: 'idle', beard: 'short' },
        { x: 0.67, scale: 0.76, face: 'left', pose: 'idle' }, { x: 0.86, scale: 0.8, face: 'left', pose: 'idle', beard: 'grey' },
      ]).map((m, i) => {
        const cheer = P.cheer == null ? null : P.cheer;
        const seq = m.seq || (cheer != null ? [{ at: cheer, pose: i % 2 ? 'wave' : 'shock', emotion: 'happy' }] : []);
        return TD.figure(teamG, Object.assign({ y: P.ground ?? 0.86, hat: false, emotion: 'neutral', dir: 'up' }, m, { seq }), sd + 40 + i * 9);
      });
      const front = inkEl(cam, INK.paperDark), frontR = inkEl(cam);
      const fin = finish(ctx, root, sd, { x: 0.5, y: 0.86, scale: 0.8, pose: 'point', face: 'right' });
      const wowL = P.wow ? TD.label(root, Object.assign({ x: (P.team && P.team[0] ? P.team[0].x : 0.14) + 0.06, y: 0.55, size: 110, color: 'red', font: 'serif', rot: -6 }, P.wow), W, H, sd + 900) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.05, fy: 0.5 });
          const sb = rect(SX0, SY0, SX1, SY1);
          scrB.setAttribute('d', inkLoop(sb, { seed: sd + 1, t, smooth: false })); scrF.setAttribute('d', inkLoop(sb, { seed: sd + 1, t, smooth: false }));
          scrR.setAttribute('d', inkPath(sb, { w: 8, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[(SX0 + SX1) / 2, SY1], [(SX0 + SX1) / 2, SY1 + 40]], { w: 7, seed: sd + 3, t }));
          const scr = P.screen || 'rock', mx = (SX0 + SX1) / 2, my = (SY0 + SY1) / 2;
          sRock.update(t, 0, 0, 0); sA.update(t, 0, 0, 0); sB.update(t, 0, 0, 0);
          lost.style.display = 'none';
          if (scr === 'rock') sRock.update(t, mx, my, lerp(60, 150, clamp01(lt / Math.max(1, dur))), { boulders: 24, rot: 10 });
          else if (scr === 'pair') { sA.update(t, mx - 60, my + 10, 110, { boulders: 10, ridge: true, rot: t * 4 }); sB.update(t, mx + 150, my - 70, 30, { boulders: 4 }); }
          else if (scr === 'hera') { sA.update(t, mx, my + 20, 150, { boulders: 30, ridge: true, craters: 4, grooves: 3, rot: 6 }); }
          else if (scr === 'lost') {
            const cut = atOr(cues, P.cut ?? 'cut', 0);
            if (lt < cut) sRock.update(t, mx, my, 160, { boulders: 30 });
            else { lost.style.display = ''; lost.setAttribute('opacity', (Math.floor(lt * 2) % 2 ? 0.75 : 1).toFixed(2)); }
          }
          // consoles: a long desk with monitors across the middle ground
          const dy = GY - 150;
          let dk = '', dr = '', mf = '', mr = '', gl = '';
          for (const [x0, x1] of [[0.02, 0.46], [0.54, 0.98]]) {
            const D = rect(x0 * W, dy, x1 * W, dy + 40);
            dk += inkLoop(D, { seed: sd + 10 + x0 * 100, t, smooth: false }) + ' ';
            dr += inkPath(D, { w: 6, seed: sd + 12 + x0 * 100, t, closed: true, smooth: false }) + ' ';
            for (let k = 0; k < 3; k++) {
              const cx = lerp(x0 * W + 90, x1 * W - 90, k / 2), M = rect(cx - 70, dy - 96, cx + 70, dy - 8);
              mf += inkLoop(M, { seed: sd + 20 + k + x0 * 50, t, smooth: false }) + ' ';
              mr += inkPath(M, { w: 5, seed: sd + 24 + k + x0 * 50, t, closed: true, smooth: false }) + ' ' + inkPath([[cx, dy - 8], [cx, dy]], { w: 5, seed: sd + 28 + k, t }) + ' ';
              const fl = 0.5 + 0.5 * Math.sin(t * 2 + k * 1.7 + x0 * 9);
              gl += inkLoop(rect(cx - 56, dy - 84, cx - 56 + 112 * (0.4 + 0.5 * fl), dy - 64), { seed: sd + 30 + k, t, smooth: false, amp: 0.4 }) + ' ' + inkLoop(rect(cx - 56, dy - 52, cx + 30, dy - 36), { seed: sd + 34 + k, t, smooth: false, amp: 0.4 }) + ' ';
            }
          }
          desks.setAttribute('d', dk); desksR.setAttribute('d', dr); monF.setAttribute('d', mf); monR.setAttribute('d', mr); glow.setAttribute('d', gl);
          team.forEach(f => f.update(lt, t, cues, W, H));
          // foreground console edge (keeps the bottom of the frame full)
          const F = [[-20, H * 0.93], [W + 20, H * 0.93], [W + 20, H + 20], [-20, H + 20]];
          front.setAttribute('d', inkLoop(F, { seed: sd + 50, t, smooth: false }));
          frontR.setAttribute('d', inkPath([[-20, H * 0.93], [W + 20, H * 0.93]], { w: 7, seed: sd + 51, t }));
          if (wowL) wowL.update(lt, t, cues);
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_binary
  SH.da_binary = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { TD, sd, root, cam, stars } = common(ctx, 24);
      const D = Object.assign({ x: 0.5, y: 0.5, r: 210 }, P.didy || {}), O = Object.assign({ rx: 520, ry: 120, tilt: -8 }, P.orbit || {});
      const Mo = Object.assign({ s: 46, speed: 0.05, a0: 0.4 }, P.moon || {});
      const orbB = inkEl(cam, INK.inkSoft), moonBG = el(cam, 'g'), moonB = rock(moonBG, sd + 4);
      const didy = rock(cam, sd + 3, 'top');
      const orbF = inkEl(cam, INK.inkSoft), moonFG = el(cam, 'g'), moonF = rock(moonFG, sd + 5);
      const arrows = inkEl(cam, INK.red), pyrF = inkEl(cam, INK.gold, { 'fill-opacity': 0.4 }), pyrR = inkEl(cam), pyrH = inkEl(cam, INK.inkSoft), q = inkEl(cam, INK.red);
      const tagO = P.tag ? Object.assign({ size: 64, color: 'ink', rot: -3 }, P.tag, { x: 0, y: 0 }) : null, tagL = tagO ? TD.label(cam, tagO, 1, 1, sd + 950) : null;
      const pyrO = P.pyramid && P.pyramid.text ? { text: P.pyramid.text, at: P.pyramid.at, size: P.pyramid.size || 54, rot: -2, x: 0, y: 0 } : null, pyrL = pyrO ? TD.label(cam, pyrO, 1, 1, sd + 960) : null;
      const fin = finish(ctx, root, sd, { x: 0.86, y: 0.88, scale: 0.66, pose: 'point', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fx: D.x, fy: D.y });
          if (stars) stars.update(t);
          const sh = P.shrink ? atOr(cues, P.shrink.at, null) : null, sk = sh == null ? 1 : lerp(1, P.shrink.to ?? 0.84, prog(lt, sh, 1.2));
          const cx = D.x * W, cy = D.y * H, rx = O.rx * sk, ry = O.ry * sk;
          const [ob, of, Pt] = dashedOrbit(cx, cy, rx, ry, O.tilt, sd + 100, t, 4.5);
          orbB.setAttribute('d', ob); orbF.setAttribute('d', of);
          const a = Mo.a0 + lt * Mo.speed * Math.PI * 2 * (sh != null && lt > sh ? 1.25 : 1);
          const mp = Pt(a), behind = Math.sin(a) < 0;
          didy.update(t, cx, cy, D.r, { boulders: 16, ridge: true, rot: Math.sin(t * 0.5) * 2 });
          const ms = Mo.s * (behind ? 0.94 : 1.04);
          moonB.update(t, mp[0], mp[1], behind ? ms : 0, { boulders: 6, rot: a * 30 });
          moonF.update(t, mp[0], mp[1], behind ? 0 : ms, { boulders: 6, rot: a * 30 });
          let ar = '';
          if (sh != null && lt >= sh) {
            const p = spring(lt, sh, 0.6);
            for (const ang of [0.2, Math.PI + 0.2]) { const o0 = Pt(ang), dx = cx - o0[0], dy = cy - o0[1], L = Math.hypot(dx, dy); const A = [o0[0] + dx / L * 30, o0[1] + dy / L * 30], B = [o0[0] + dx / L * (30 + 110 * p), o0[1] + dy / L * (30 + 110 * p)]; ar += arrowD(A, B, 8, sd + 200 + Math.round(ang * 10), t) + ' '; }
          }
          arrows.setAttribute('d', ar);
          if (P.pyramid) {
            const pa = atOr(cues, P.pyramid.at, 0.3), p = lt >= pa ? spring(lt, pa, 0.6) : 0, h = (P.pyramid.h ?? Mo.s * 2) * p;
            const px = (P.pyramid.x ?? 0.8) * W, py = (P.pyramid.y ?? 0.7) * H;
            const tri = [[px - h * 0.8, py], [px, py - h], [px + h * 0.8, py]];
            pyrF.setAttribute('d', p > 0.02 ? inkLoop(tri, { seed: sd + 300, t, smooth: false }) : '');
            pyrR.setAttribute('d', p > 0.02 ? inkPath(tri, { w: 6, seed: sd + 301, t, closed: true, smooth: false }) + ' ' + inkPath([[px - h * 1.1, py], [px + h * 1.1, py]], { w: 5, seed: sd + 302, t }) : '');
            let hh = ''; if (p > 0.5) for (let k = 1; k < 5; k++) { const yy = py - h * k / 5, xx = h * 0.8 * (1 - k / 5); hh += inkPath([[px - xx, yy], [px + xx, yy]], { w: 2.6, seed: sd + 310 + k, t }) + ' '; }
            pyrH.setAttribute('d', hh);
            if (pyrL) { pyrO.x = px; pyrO.y = py + 56; pyrL.update(lt, t, cues); }
          }
          if (tagL) { tagO.x = mp[0] + (P.tag.dx ?? 0); tagO.y = mp[1] + (P.tag.dy ?? -Mo.s - 50); tagL.update(lt, t, cues); }
          if (P.question) {
            const qa = atOr(cues, P.question.at, null), p = qa != null && lt >= qa ? spring(lt, qa, 0.5) : 0;
            const qx = mp[0], qy = mp[1] - Mo.s - 70;
            q.setAttribute('d', p > 0.02 ? inkPath([[qx - 22, qy - 30], [qx - 18, qy - 56], [qx + 6, qy - 64], [qx + 26, qy - 48], [qx + 18, qy - 22], [qx, qy - 8], [qx, qy + 12]].map(([x, y]) => [qx + (x - qx) * p, qy + (y - qy) * p]), { w: 11, seed: sd + 400, t }) + ' ' + inkDot(qx, qy + 38 * p, 9 * p, 9 * p, sd + 401, t) : '');
          }
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_light (light curve)
  SH.da_light = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { TD, sd, root, cam } = common(ctx, 0);
      const X0 = W * 0.1, X1 = W * (P.x1 ?? 0.92), Y0 = H * 0.2, Y1 = H * 0.8, base = lerp(Y0, Y1, 0.42), deep = 190, shallow = 90;
      const per = P.period ?? 360;
      const grid = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.45 }), axes = inkEl(cam);
      const yl = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 54, fill: INK.inkSoft, 'text-anchor': 'middle', transform: `translate(${f1(X0 - 46)} ${f1((Y0 + Y1) / 2)}) rotate(-90)` });
      yl.textContent = P.ylabel || 'brightness';
      const xl = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 54, fill: INK.inkSoft, 'text-anchor': 'end', x: X1, y: Y1 + 62 });
      xl.textContent = P.xlabel || 'time →';
      const curve = inkEl(cam, INK.ink), curve2 = inkEl(cam, INK.red), pen = inkEl(cam, INK.ink), icons = el(cam, 'g');
      const iconP = [0, 1, 2, 3, 4].map(k => ({ a: inkEl(icons, INK.paperDark), ar: inkEl(icons), b: inkEl(icons, INK.inkSoft) }));
      const brk = inkEl(cam, INK.red), goal = inkEl(cam, INK.red);
      const brkO = P.bracket ? Object.assign({ size: 64, color: 'red', rot: -2 }, P.bracket, { x: 0, y: 0 }) : null, brkL = brkO ? TD.label(cam, brkO, 1, 1, sd + 960) : null;
      const goalO = P.goal ? Object.assign({ size: 54, color: 'red', rot: -3 }, P.goal, { x: 0, y: 0 }) : null, goalL = goalO ? TD.label(cam, goalO, 1, 1, sd + 970) : null;
      const fin = finish(ctx, root, sd, { x: 0.9, y: 0.94, scale: 0.55, pose: 'point', face: 'left' });
      const x0c = X0 + 120;
      const yAt = (x, p, off = 0) => {
        // deep dip every p px (moon in front), shallow dip half way (moon behind)
        const u = ((x - x0c + off) / p) % 1, uu = u < 0 ? u + 1 : u;
        const dd = (c, w, d) => d * Math.exp(-Math.pow((uu - c) / w, 2));
        return base + dd(0.25, 0.045, deep) + dd(0.75, 0.04, shallow) + Math.sin(x * 0.05) * 3;
      };
      const pathFor = (xa, xb, p, off) => { const pts = []; for (let x = xa; x <= xb; x += 6) pts.push([x, yAt(x, p, off)]); return pts; };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.04, fy: 0.5 });
          let gd = '';
          for (let k = 0; k <= 12; k++) { const x = lerp(X0, X1, k / 12); gd += inkPath([[x, Y0], [x, Y1]], { w: 1.6, seed: sd + 10 + k, t, amp: 0.4 }) + ' '; }
          for (let k = 0; k <= 6; k++) { const y = lerp(Y0, Y1, k / 6); gd += inkPath([[X0, y], [X1, y]], { w: 1.6, seed: sd + 30 + k, t, amp: 0.4 }) + ' '; }
          grid.setAttribute('d', gd);
          axes.setAttribute('d', inkPath([[X0, Y0 - 20], [X0, Y1], [X1 + 20, Y1]], { w: 7, seed: sd + 50, t, smooth: false }));
          const dr = Object.assign({ at: 0.1, dur: 3 }, P.draw || {}), da = atOr(cues, dr.at, 0.1), u = prog(lt, da, dr.dur);
          const xe = lerp(x0c - 100, X1, u);
          const pts = pathFor(X0 + 4, xe, per, 0);
          curve.setAttribute('d', pts.length > 1 ? inkPath(pts, { w: 7, seed: sd + 60, t, amp: 0.8 }) : '');
          const tip = pts[pts.length - 1] || [X0, base];
          pen.setAttribute('d', u > 0 && u < 1 ? inkDot(tip[0], tip[1], 13, 13, sd + 61, t) : '');
          // eclipse icons over each deep dip already drawn
          iconP.forEach((ic, k) => {
            const xd = x0c + per * (0.25 + k), on = xd < xe && xd < X1 - 20;
            const p = on ? clamp01((xe - xd) / 80) : 0;
            if (p <= 0.01) { ic.a.setAttribute('d', ''); ic.ar.setAttribute('d', ''); ic.b.setAttribute('d', ''); return; }
            const iy = Y0 - 10 + 40, r = 34 * sm(p);
            const A = ell(xd, iy + 26, r, r * 0.9, 12);
            ic.a.setAttribute('d', inkLoop(A, { seed: sd + 70 + k, t }));
            ic.ar.setAttribute('d', inkPath(A, { w: 4, seed: sd + 80 + k, t, closed: true }));
            ic.b.setAttribute('d', inkDot(xd + 6, iy + 30, r * 0.36, r * 0.34, sd + 90 + k, t));
          });
          if (P.bracket) {
            const ba = atOr(cues, P.bracket.at, 0.5), p = lt >= ba ? prog(lt, ba, 0.5) : 0, i = P.bracket.i ?? 0;
            const xa = x0c + per * (0.25 + i), xb = xa + per * p, yb = base + deep + 50;
            brk.setAttribute('d', p > 0.02 ? inkPath([[xa, yb - 22], [xa, yb], [xb, yb], [xb, yb - 22]], { w: 6, seed: sd + 100, t, smooth: false }) : '');
            if (brkL) { brkO.x = xa + per / 2; brkO.y = yb + 58; brkL.update(lt, t, cues); }
          }
          if (P.goal) {
            const ga = atOr(cues, P.goal.at, 0.5), p = lt >= ga ? prog(lt, ga, 0.4) : 0, i = P.goal.i ?? 1;
            const xd = x0c + per * (0.25 + i) - 14;
            goal.setAttribute('d', p > 0.02 ? [0, 1, 2, 3, 4, 5, 6].map(k => inkPath([[xd, base - 60 + k * 44 * p], [xd, base - 60 + k * 44 * p + 24 * p]], { w: 4.5, seed: sd + 110 + k, t })).join(' ') : '');
            if (goalL) { goalO.x = xd - 10; goalO.y = base - 110; goalL.update(lt, t, cues); }
          }
          if (P.shift) {
            const sa = atOr(cues, P.shift.at, null), p = sa != null && lt >= sa ? prog(lt, sa, 1.6) : 0;
            const pk = per * (P.shift.k ?? 0.8);
            const p2 = pathFor(X0 + 4, lerp(X0 + 4, X1, p), pk, 0).map(([x, y]) => [x, y + 14]);
            curve2.setAttribute('d', p2.length > 1 && p > 0.01 ? inkPath(p2, { w: 6, seed: sd + 120, t, amp: 0.8 }) : '');
          }
          fin.update(lt, t, cues);
        },
      };
    },
  };
  // ================================================================== da_impact
  SH.da_impact = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam, stars } = common(ctx, 22);
      const mode = P.mode || 'plume';
      const R = Object.assign(mode === 'tail' ? { x: 0.2, y: 0.42, r: 46 } : { x: 0.36, y: 0.5, r: 230 }, P.rock || {});
      const tailF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), tailL = inkEl(cam, INK.inkSoft);
      const big = mode === 'tail' ? rock(cam, sd + 4, 'top') : null;
      const moon = rock(cam, sd + 3);
      const cone = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.75 }), coneR = inkEl(cam, INK.inkSoft), flash = inkEl(cam, INK.gold, { 'fill-opacity': 0.8 }), dust = inkEl(cam, INK.inkSoft), dustG = inkEl(cam, INK.gold), chunksF = inkEl(cam, INK.paperDark), chunksR = inkEl(cam);
      const arr = inkEl(cam, INK.blue), arr2 = inkEl(cam, INK.red);
      const cube = P.cube ? cubesat(cam, sd + 9) : null;
      const fin = finish(ctx, root, sd, { x: 0.86, y: 0.88, scale: 0.64, pose: 'shock', face: 'left' });
      const r0 = rng(sd + 12);
      const parts = Array.from({ length: 150 }, () => ({ a: (r0() - 0.5) * 0.9, sp: lerp(120, 520, r0()), d: r0() * 6, s: lerp(3, 9, r0()), gold: r0() < 0.25 }));
      const chunks = Array.from({ length: 10 }, () => ({ a: (r0() - 0.5) * 0.8, sp: lerp(60, 170, r0()), d: r0() * 4, s: lerp(12, 26, r0()), spin: (r0() - 0.5) * 3 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fx: R.x + 0.1, fy: R.y });
          if (stars) stars.update(t);
          const cx = R.x * W, cy = R.y * H, r = R.r;
          if (mode === 'tail') {
            big.update(t, cx, cy, r * 1.2, { boulders: 0, ridge: true });
            moon.update(t, cx + r * 1.9, cy - r * 0.9, r * 0.36, { boulders: 0 });
            const g = clamp01(0.35 + lt / Math.max(1, dur) * 0.75), Lx = (W * 0.98 - cx) * g;
            const up = [], dn = [];
            for (let k = 0; k <= 20; k++) { const u = k / 20, x = cx + r * 1.4 + Lx * u, w = lerp(r * 0.7, r * 2.6, Math.sqrt(u)), yc = cy - 20 + u * u * 60; up.push([x, yc - w]); dn.unshift([x, yc + w * 0.7]); }
            tailF.setAttribute('d', inkLoop(up.concat(dn), { seed: sd + 20, t, amp: 1.5 }));
            let tl = '';
            for (let k = 0; k < 9; k++) { const off = (k - 4) / 4; const pts = []; for (let j = 0; j <= 12; j++) { const u = j / 12, x = cx + r * 1.6 + Lx * u, w = lerp(r * 0.5, r * 2.2, Math.sqrt(u)); pts.push([x, cy - 20 + u * u * 60 + off * w * 0.8]); } tl += inkPath(pts, { w: 2.6, seed: sd + 30 + k, t, amp: 1, taper: 0.7 }) + ' '; }
            tailL.setAttribute('d', tl);
            fin.update(lt, t, cues);
            return;
          }
          moon.update(t, cx, cy, r, { boulders: 46, rot: 4 });
          // impact point on the right limb; ejecta fly to the right (back towards where DART came from)
          const ix = cx + r * 0.86, iy = cy - r * 0.18, dirA = mode === 'push' ? -0.05 : -0.12;
          const fl = mode === 'plume' ? 0.35 + 0.25 * Math.sin(lt * 5) : 0;
          if (mode === 'plume' || mode === 'push') {
            const Lc = mode === 'plume' ? 760 : 560, sp = mode === 'plume' ? 0.42 : 0.34, wob = Math.sin(lt * 2) * 0.02;
            const C = [[ix, iy], [ix + Math.cos(dirA - sp + wob) * Lc, iy + Math.sin(dirA - sp + wob) * Lc], [ix + Math.cos(dirA) * Lc * 1.08, iy + Math.sin(dirA) * Lc * 1.08 + 20], [ix + Math.cos(dirA + sp - wob) * Lc, iy + Math.sin(dirA + sp - wob) * Lc]];
            cone.setAttribute('d', inkLoop(C, { seed: sd + 44, t, amp: 2 }));
            let cr2 = '';
            for (let k = 0; k < 7; k++) { const a = dirA - sp * 0.85 + k / 6 * sp * 1.7, l0 = 60 + ((lt * 160 + k * 90) % 300); cr2 += inkPath([[ix + Math.cos(a) * l0, iy + Math.sin(a) * l0], [ix + Math.cos(a) * (l0 + 140), iy + Math.sin(a) * (l0 + 140)]], { w: 3, seed: sd + 45 + k, t, taper: 0.5 }) + ' '; }
            coneR.setAttribute('d', cr2);
          } else { cone.setAttribute('d', ''); coneR.setAttribute('d', ''); }
          flash.setAttribute('d', fl > 0.02 ? inkLoop(ell(ix, iy, 120 * fl + 30, 90 * fl + 24, 14), { seed: sd + 40, t }) : '');
          let dd = '', dg = '';
          parts.forEach((q, i) => {
            const age = ((lt + q.d) % 6), d = q.sp * age * (mode === 'push' ? 0.9 : 1), a = dirA + q.a * 0.9;
            const x = ix + Math.cos(a) * d, y = iy + Math.sin(a) * d + 6 * age * age;
            if (x > W + 30 || y > H + 30) return;
            const s = q.s * (1 + age * 0.08);
            if (q.gold) dg += inkDot(x, y, s, s, sd + 50 + i, t) + ' '; else dd += inkDot(x, y, s, s * 0.8, sd + 50 + i, t) + ' ';
          });
          dust.setAttribute('d', dd); dustG.setAttribute('d', dg);
          let cf = '', cr = '';
          chunks.forEach((c, i) => {
            const age = ((lt + c.d) % 5), d = c.sp * age, a = dirA + c.a, x = ix + Math.cos(a) * d, y = iy + Math.sin(a) * d;
            const q = ell(x, y, c.s, c.s * 0.75, 7, age * c.spin);
            cf += inkLoop(q, { seed: sd + 200 + i, t }) + ' '; cr += inkPath(q, { w: 3.5, seed: sd + 220 + i, t, closed: true }) + ' ';
          });
          chunksF.setAttribute('d', cf); chunksR.setAttribute('d', cr);
          if (mode === 'push') {
            const y1 = cy + r + 70 > H * 0.84 ? cy - r - 60 : cy + r + 70;
            const a1 = atOr(cues, P.dart ?? 'dart', 0.3), a2 = atOr(cues, P.rubble ?? 'rubble', dur * 0.5);
            const p1 = lt >= a1 ? prog(lt, a1, 0.5) : 0, p2 = lt >= a2 ? prog(lt, a2, 0.7) : 0;
            const xs = cx - r - 30;
            arr.setAttribute('d', p1 > 0.02 ? arrowD([xs, cy - 50], [xs - 160 * p1, cy - 50], 12, sd + 300, t) : '');
            arr2.setAttribute('d', p2 > 0.02 ? arrowD([xs, cy + 50], [xs - 420 * p2, cy + 50], 18, sd + 310, t) : '');
            void y1;
          } else { arr.setAttribute('d', ''); arr2.setAttribute('d', ''); }
          if (cube) {
            const ca = atOr(cues, P.cube.at, 0), u = clamp01((lt - ca) / Math.max(1, dur - ca));
            if (lt < ca) cube.update(t, -999, -999, 0.01);
            else cube.update(t, lerp(W * 0.05, W * 0.95, u), H * 0.16 + Math.sin(u * 3) * 20, 1.2, u * 120);
          }
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_sky (ground scene with a falling rock)
  SH.da_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam } = common(ctx, 0);
      const mode = P.mode || 'city', GY = (P.ground ?? 0.82) * H;
      const RK = Object.assign(mode === 'dino' ? { from: [1.12, -0.08], to: [0.66, 0.8], at: 0.1, dur: 2.6 } : { from: [-0.1, 0.06], to: [0.78, 0.3], at: 0.1, dur: 3.2 }, P.rock || {});
      const glowF = inkEl(cam, INK.gold, { 'fill-opacity': 0.35 }), rays = inkEl(cam, INK.gold);
      const smokeF = inkEl(cam, INK.paperLight), smokeR = inkEl(cam, INK.inkSoft);
      const fireR = inkEl(cam, INK.red), fireG = inkEl(cam, INK.gold), fb = rock(cam, sd + 4);
      const dome = inkEl(cam, INK.gold, { 'fill-opacity': 0.7 }), domeR = inkEl(cam, INK.red);
      const bgF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.75 }), bgR = inkEl(cam), win = inkEl(cam, INK.gold, { 'fill-opacity': 0.55 }), winR = inkEl(cam, INK.inkSoft), cracks = inkEl(cam, INK.red), shards = inkEl(cam, INK.paperLight), shardsR = inkEl(cam);
      const fin = finish(ctx, root, sd, { x: 0.12, y: 0.86, scale: 0.7, pose: 'shock', face: 'right' });
      const r0 = rng(sd + 15);
      const blocks = mode === 'city' ? (P.blocks || [[0.04, 0.2, 0.36], [0.24, 0.42, 0.5], [0.46, 0.6, 0.3], [0.64, 0.86, 0.44], [0.88, 1.02, 0.34]]) : [];
      const sh = Array.from({ length: 26 }, () => ({ x: r0(), y: r0(), sp: lerp(160, 420, r0()), d: r0() * 0.5, s: lerp(10, 20, r0()), sp2: (r0() - 0.5) * 6 }));
      const dinos = mode === 'dino' ? (P.dinos || [[0.16, 1], [0.36, 0.7]]) : [];
      const cyc = mode === 'dino' ? (P.trees || [0.06, 0.5, 0.86]) : [];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ha = atOr(cues, P.hit ?? P.flash ?? (mode === 'dino' ? 'hit' : 'flash'), RK.at + RK.dur);
          const shk = lt > ha && lt < ha + 0.8 ? Math.sin(lt * 70) * 6 * (1 - (lt - ha) / 0.8) : 0;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.05, fy: 0.55, shake: shk });
          const u = clamp01((lt - RK.at) / RK.dur), A = [RK.from[0] * W, RK.from[1] * H], B = [RK.to[0] * W, RK.to[1] * H];
          const pos = [lerp(A[0], B[0], u), lerp(A[1], B[1], u)], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
          const flying = mode === 'city' ? lt >= RK.at : (lt >= RK.at && lt < ha);
          // smoke trail (stays in the sky)
          let sf = '', sr = '';
          if (lt >= RK.at) {
            const n = 30;
            for (let k = 0; k < n; k++) {
              const f = k / n; if (f > u - 0.02) break;
              const px = lerp(A[0], B[0], f), py = lerp(A[1], B[1], f), age = (u - f) * RK.dur, rr = 26 + age * 16 + Math.sin(k * 2.7) * 7;
              const q = ell(px - uy * Math.sin(k * 1.3) * 10, py + ux * Math.sin(k * 1.3) * 10 + age * 6, rr, rr * 0.82, 11).map(([a, b], j) => [a + Math.sin(j * 2.1 + k) * rr * 0.12, b + Math.cos(j * 1.7 + k) * rr * 0.1]);
              sf += inkLoop(q, { seed: sd + 40 + k, t }) + ' ';
              if (k % 2 === 0) sr += inkPath(q.slice(5, 11), { w: 2.6, seed: sd + 90 + k, t }) + ' ';
            }
          }
          smokeF.setAttribute('d', sf); smokeR.setAttribute('d', sr);
          if (flying && u < 1.001) {
            const s = mode === 'dino' ? 54 : 26;
            fb.update(t, pos[0], pos[1], s, { boulders: 0, rot: lt * 80 });
            const tailP = (k, w) => [[pos[0] - uy * w, pos[1] + ux * w], [pos[0] - ux * s * k, pos[1] - uy * s * k], [pos[0] + uy * w, pos[1] - ux * w]];
            fireR.setAttribute('d', inkLoop(tailP(5 + Math.sin(t * 20), s * 1.05), { seed: sd + 80, t, smooth: false }));
            fireG.setAttribute('d', inkLoop(tailP(3.2, s * 0.7), { seed: sd + 81, t, smooth: false }));
          } else { fb.update(t, 0, 0, 0); fireR.setAttribute('d', ''); fireG.setAttribute('d', ''); }
          // glow / flash
          const fp = lt >= ha ? Math.exp(-(lt - ha) * 1.4) : 0;
          if (mode === 'city') {
            const gp = flying ? 0.35 + 0.65 * fp : 0;
            glowF.setAttribute('d', gp > 0.02 ? inkLoop(ell(pos[0], pos[1], 140 + 260 * fp, 110 + 200 * fp, 16), { seed: sd + 90, t }) : '');
            let rd = '';
            if (fp > 0.05) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; rd += inkPath([[pos[0] + Math.cos(a) * 120, pos[1] + Math.sin(a) * 100], [pos[0] + Math.cos(a) * (200 + 300 * fp), pos[1] + Math.sin(a) * (160 + 240 * fp)]], { w: 6, seed: sd + 100 + k, t, taper: 0.5 }) + ' '; }
            rays.setAttribute('d', rd);
            dome.setAttribute('d', ''); domeR.setAttribute('d', '');
          } else {
            glowF.setAttribute('d', '');
            rays.setAttribute('d', '');
            const dp = lt >= ha ? prog(lt, ha, 1.6) : 0;
            if (dp > 0.01) {
              const R1 = lerp(40, 420, dp), pts = [];
              for (let k = 0; k <= 16; k++) { const a = Math.PI + k / 16 * Math.PI; pts.push([B[0] + Math.cos(a) * R1, GY + Math.sin(a) * R1 * 0.8]); }
              dome.setAttribute('d', inkLoop(pts, { seed: sd + 110, t, smooth: false }));
              domeR.setAttribute('d', inkPath(pts, { w: 8, seed: sd + 111, t }) + ' ' + inkPath(pts.map(([x, y]) => [B[0] + (x - B[0]) * 1.25, GY + (y - GY) * 1.25]), { w: 5, seed: sd + 112, t }));
            } else { dome.setAttribute('d', ''); domeR.setAttribute('d', ''); }
          }
          // ground props
          let bf = '', br = '', wf = '', wr = '', ck = '', shf = '', shr = '';
          const gl = mode === 'city' ? atOr(cues, P.glass ?? 'glass', null) : null;
          blocks.forEach(([x0, x1, h], i) => {
            const X0 = x0 * W, X1 = x1 * W, Y0 = GY - h * H, Q = rect(X0, Y0, X1, GY + 4);
            bf += inkLoop(Q, { seed: sd + 200 + i, t, smooth: false }) + ' ';
            br += inkPath(Q, { w: 6, seed: sd + 210 + i, t, closed: true, smooth: false }) + ' ';
            const cols = Math.max(2, Math.round((X1 - X0) / 70)), rows = Math.max(2, Math.round(h * H / 80));
            for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
              const wx = lerp(X0 + 22, X1 - 52, cols > 1 ? c / (cols - 1) : 0.5), wy = Y0 + 26 + r * ((GY - Y0 - 60) / rows), Wn = rect(wx, wy, wx + 30, wy + 40);
              const k = i * 100 + c * 10 + r;
              wf += inkLoop(Wn, { seed: sd + 300 + k, t, smooth: false, amp: 0.5 }) + ' ';
              wr += inkPath(Wn, { w: 2.6, seed: sd + 400 + k, t, closed: true, smooth: false, amp: 0.5 }) + ' ';
              if (gl != null && lt >= gl + ((c + r) % 4) * 0.08) ck += inkPath([[wx + 4, wy + 6], [wx + 16, wy + 20], [wx + 10, wy + 32], [wx + 26, wy + 38]], { w: 3, seed: sd + 500 + k, t, smooth: false }) + ' ' + inkPath([[wx + 16, wy + 20], [wx + 28, wy + 12]], { w: 2.6, seed: sd + 600 + k, t, smooth: false }) + ' ';
            }
          });
          if (gl != null && lt >= gl) sh.forEach((q, i) => {
            const age = ((lt - gl - q.d) % 2.4); if (age < 0) return;
            const bi = blocks[i % blocks.length], x = lerp(bi[0] * W, bi[1] * W, q.x), y = GY - bi[2] * H * (0.3 + q.y * 0.6) + q.sp * age + 300 * age * age;
            if (y > GY) return;
            const tri = [[0, -q.s], [q.s * 0.8, q.s * 0.6], [-q.s * 0.6, q.s * 0.5]].map(([a, b]) => { const c = Math.cos(age * q.sp2), s = Math.sin(age * q.sp2); return [x + a * c - b * s, y + a * s + b * c]; });
            shf += inkLoop(tri, { seed: sd + 700 + i, t, smooth: false }) + ' '; shr += inkPath(tri, { w: 2.6, seed: sd + 730 + i, t, closed: true, smooth: false }) + ' ';
          });
          // dinosaurs (sauropods) + cycads
          dinos.forEach(([x, s], i) => {
            const X = x * W, M = ([a, b]) => [X + a * s, GY + b * s];
            const sw = Math.sin(lt * 1.5 + i) * 6;
            const body = ell(0, -150, 130, 62, 14).map(M);
            bf += inkLoop(body, { seed: sd + 800 + i, t }) + ' '; br += inkPath(body, { w: 6, seed: sd + 810 + i, t, closed: true }) + ' ';
            br += inkPath([[100, -170], [170, -260], [200, -340 + sw], [236, -352 + sw]].map(M), { w: 26 * s, seed: sd + 820 + i, t, taper: 0.3 }) + ' ';
            bf += inkLoop(ell(240, -352 + sw, 34, 20, 10).map(M), { seed: sd + 825 + i, t }) + ' ';
            br += inkPath([[-120, -150], [-220, -120], [-320, -60]].map(M), { w: 22 * s, seed: sd + 830 + i, t, taper: 0.1 }) + ' ';
            for (const lx of [-80, -40, 50, 90]) br += inkPath([[lx, -120], [lx + Math.sin(lt * 2 + lx) * 4, 0]].map(M), { w: 18 * s, seed: sd + 840 + i + lx, t }) + ' ';
          });
          cyc.forEach((x, i) => {
            const X = x * W;
            br += inkPath([[X, GY], [X + 6, GY - 160]], { w: 14, seed: sd + 900 + i, t }) + ' ';
            for (let k = 0; k < 7; k++) { const a = -Math.PI + k / 6 * Math.PI + Math.sin(lt + k) * 0.05; br += inkPath([[X + 6, GY - 160], [X + 6 + Math.cos(a) * 70, GY - 160 + Math.sin(a) * 50 - 10], [X + 6 + Math.cos(a) * 120, GY - 160 + Math.sin(a) * 30 + 20]], { w: 6, seed: sd + 910 + i * 10 + k, t, taper: 0.4 }) + ' '; }
          });
          bgF.setAttribute('d', bf); bgR.setAttribute('d', br); win.setAttribute('d', wf); winR.setAttribute('d', wr); cracks.setAttribute('d', ck); shards.setAttribute('d', shf); shardsR.setAttribute('d', shr);
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_nudge
  // coloured Earth: blue ocean disc, green land blobs (clipped), dashed atmosphere ring, ink outline
  let eClip = 0;
  function earthC(parent, defs, sd) {
    const id = 'daearth' + (sd % 100000) + '_' + (eClip++);
    const cp = el(defs || parent, 'clipPath', { id }), cc = el(cp, 'circle');
    const g = el(parent, 'g'), base = inkEl(g, INK.paperLight), sea = inkEl(g, INK.blue, { 'fill-opacity': 0.55 });
    const land = el(g, 'g', { 'clip-path': `url(#${id})` }), landF = inkEl(land, INK.green, { 'fill-opacity': 0.9 }), landR = inkEl(land, INK.ink), atm = inkEl(g, INK.blue), ring = inkEl(g);
    const r0 = rng(sd + 11), blobs = [];
    for (let i = 0; i < 6; i++) blobs.push({ u: r0(), v: lerp(-0.6, 0.6, r0()), a: lerp(0.2, 0.34, r0()), b: lerp(0.12, 0.24, r0()) });
    return {
      update(t, cx, cy, r) {
        cc.setAttribute('cx', f1(cx)); cc.setAttribute('cy', f1(cy)); cc.setAttribute('r', f1(r));
        const p = ell(cx, cy, r, r, 28), d = inkLoop(p, { seed: sd + 1, t, amp: 1.2 });
        base.setAttribute('d', d); sea.setAttribute('d', d);
        ring.setAttribute('d', inkPath(p, { w: 7, seed: sd + 2, t, closed: true, amp: 1.2 }));
        let ad = '';
        for (let k = 0; k < 20; k++) { const a0 = k / 20 * Math.PI * 2 + t * 0.05, a1 = a0 + 0.16; ad += inkPath([[cx + Math.cos(a0) * (r + 20), cy + Math.sin(a0) * (r + 20)], [cx + Math.cos(a1) * (r + 20), cy + Math.sin(a1) * (r + 20)]], { w: 4, seed: sd + 30 + k, t, amp: 0.8 }) + ' '; }
        atm.setAttribute('d', ad);
        let lf = '', lr = '';
        blobs.forEach((b, i) => {
          const u = ((b.u + t * 0.02) % 1) * 2.6 - 1.3, x = cx + u * r, y = cy + b.v * r;
          const q = ell(x, y, b.a * r, b.b * r, 10).map(([px, py], k) => [px + Math.sin(k * 1.7 + i) * b.a * r * 0.2, py + Math.cos(k * 2.3 + i) * b.b * r * 0.22]);
          lf += inkLoop(q, { seed: sd + 50 + i, t, amp: 1 }) + ' ';
          lr += inkPath(q, { w: 3.5, seed: sd + 60 + i, t, closed: true, amp: 1 }) + ' ';
        });
        landF.setAttribute('d', lf); landR.setAttribute('d', lr);
      },
    };
  }
  SH.da_nudge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const { TD, sd, root, cam, stars } = common(ctx, 20);
      const E = Object.assign({ x: 0.72, y: 0.6, r: 140 }, P.earth || {}), R0 = Object.assign({ x: 0.08, y: 0.6 }, P.rock || {});
      const earth = earthC(cam, defs, sd + 3);
      const oldP = inkEl(cam, INK.inkSoft), newP = inkEl(cam, INK.red), push = inkEl(cam, INK.red), gap = inkEl(cam, INK.red), guide = inkEl(cam, INK.inkSoft);
      const rk = rock(cam, sd + 5);
      const gapO = P.gap && P.gap.text ? Object.assign({ size: 72, color: 'red', font: 'serif', rot: -3 }, P.gap, { x: 0, y: 0 }) : null, gapL = gapO ? TD.label(cam, gapO, 1, 1, sd + 980) : null;
      const fin = finish(ctx, root, sd, { x: 0.5, y: 0.9, scale: 0.6, pose: 'point', face: 'right' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.03 });
          if (stars) stars.update(t);
          const ex = E.x * W, ey = E.y * H, sx = R0.x * W, sy = R0.y * H, xEnd = W * 1.04;
          earth.update(t, ex, ey, E.r);
          // the old course: straight at Earth's centre
          const yOld = x => lerp(sy, ey, (x - sx) / (ex - sx));
          let od = '';
          const xo = ex - E.r - 6;
          for (let k = 0; k < 24; k++) { const a = k / 24, b = a + 0.55 / 24; od += inkPath([[lerp(sx, xo, a), yOld(lerp(sx, xo, a))], [lerp(sx, xo, b), yOld(lerp(sx, xo, b))]], { w: 5, seed: sd + 10 + k, t }) + ' '; }
          oldP.setAttribute('d', od);
          const na = atOr(cues, P.nudge ?? 'nudge', dur * 0.3), p = lt >= na ? prog(lt, na, 2.2) : 0;
          const miss = E.r * (P.miss ?? 2.3);
          const yNew = x => { const f = (x - sx) / (ex - sx); return yOld(x) - miss * f * f; };
          const xe = lerp(sx, xEnd, p), pts = [];
          for (let x = sx; x <= xe; x += 24) pts.push([x, yNew(x)]);
          newP.setAttribute('d', pts.length > 1 ? inkPath(pts, { w: 7, seed: sd + 50, t }) : '');
          push.setAttribute('d', lt >= na ? arrowD([sx, sy + 70], [sx, sy + 70 - 110 * spring(lt, na, 0.5)], 9, sd + 60, t) : '');
          const rx = lt < na ? sx + lt * 6 : xe, rp = [rx, lt < na ? yOld(rx) : yNew(rx)];
          rk.update(t, rp[0], rp[1], 36, { boulders: 4, rot: lt * 40 });
          // the gap: a red double-headed bracket right of Earth, from its top to the new path
          const ga = atOr(cues, P.gap ? P.gap.at : null, null), gp = ga != null && lt >= ga && p > 0.6 ? prog(lt, ga, 0.5) : 0;
          if (gp > 0.02) {
            const bx = ex + E.r + 50, y0 = ey - E.r, y1 = yNew(bx) + 14, ym = lerp(y0, y1, gp);
            gap.setAttribute('d', inkPath([[bx - 20, y0], [bx + 20, y0]], { w: 6, seed: sd + 70, t }) + ' ' + inkPath([[bx, y0], [bx, ym]], { w: 6, seed: sd + 71, t }) + ' ' + (gp > 0.95 ? inkPath([[bx - 20, y1], [bx + 20, y1]], { w: 6, seed: sd + 72, t }) : ''));
            let gd = ''; for (let k = 0; k < 4; k++) { const a = k / 4, b = a + 0.12; gd += inkPath([[lerp(ex, bx - 24, a), y0], [lerp(ex, bx - 24, b), y0]], { w: 3, seed: sd + 74 + k, t }) + ' '; }
            guide.setAttribute('d', gd);
            if (gapL) { gapO.x = Math.min(bx + 150 + (P.gap.dx ?? 0), W - 140); gapO.y = (y0 + y1) / 2 + (P.gap.dy ?? 0); gapL.update(lt, t, cues); }
          } else { gap.setAttribute('d', ''); guide.setAttribute('d', ''); if (gapL) { gapO.x = -9999; gapL.update(lt, t, cues); } }
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_hera
  SH.da_hera = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam, stars } = common(ctx, 24);
      const mode = P.mode || 'fly';
      const HE = Object.assign(mode === 'fly' ? { x: 0.42, y: 0.48, s: 0.9, rot: -6 } : { x: 0.2, y: 0.36, s: 0.55, rot: 8 }, P.hera || {});
      const DD = Object.assign(mode === 'arrive' ? { x: 0.68, y: 0.56, r: 330 } : mode === 'measure' ? { x: 0.9, y: 0.2, r: 150 } : { x: 0.9, y: 0.42, r: 30 }, P.didy || {});
      const MO = Object.assign(mode === 'measure' ? { x: 0.64, y: 0.56, s: 210 } : mode === 'arrive' ? { x: 0.4, y: 0.2, s: 56 } : { x: 0.95, y: 0.35, s: 10 }, P.moon || {});
      const beam = inkEl(cam, INK.gold, { 'fill-opacity': 0.18 }), beamR = inkEl(cam, INK.gold);
      const dd = rock(cam, sd + 3, 'top'), mo = rock(cam, sd + 4), laser = inkEl(cam, INK.red), crat = inkEl(cam, INK.red);
      const he = hera(cam, sd + 5), c1 = cubesat(cam, sd + 6), c2 = cubesat(cam, sd + 7), streak = inkEl(cam, INK.inkSoft);
      const fin = finish(ctx, root, sd, { x: 0.12, y: 0.9, scale: 0.6, pose: 'point', face: 'right' });
      const r0 = rng(sd + 11), lines = Array.from({ length: 14 }, () => ({ y: r0(), l: lerp(80, 220, r0()), sp: lerp(500, 1000, r0()), ph: r0() }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.05, fx: mode === 'fly' ? HE.x : 0.55 });
          if (stars) stars.update(mode === 'fly' ? t * 3 : t);
          let sl = '';
          if (mode === 'fly') lines.forEach((q, i) => { const x = W + 300 - ((q.ph * (W + 600) + lt * q.sp) % (W + 600)), y = q.y * H; sl += inkPath([[x, y], [x + q.l, y]], { w: 3, seed: sd + 500 + i, t, amp: 0.6, taper: 0.5 }) + ' '; });
          streak.setAttribute('d', sl);
          const grow = mode === 'fly' ? 1 + lt * 0.03 : 1;
          dd.update(t, DD.x * W, DD.y * H, DD.r * grow, { boulders: mode === 'arrive' ? 50 : 10, ridge: true, craters: mode === 'arrive' ? 5 : 0, grooves: mode === 'arrive' ? 5 : 0, rot: t * 3 });
          mo.update(t, MO.x * W, MO.y * H, MO.s * grow, { boulders: mode === 'measure' ? 40 : 6, rot: 10 });
          const hx = HE.x * W + (mode === 'fly' ? lt * 12 : Math.sin(lt * 0.6) * 10), hy = HE.y * H + Math.sin(lt * 1.1) * 8;
          const hp = he.update(t, hx, hy, HE.s, HE.rot + Math.sin(lt * 0.7) * 1.5);
          if (mode === 'arrive') {
            const pul = 0.5 + 0.5 * Math.sin(lt * 3), T1 = [DD.x * W - DD.r * 0.7, DD.y * H - DD.r * 0.55], T2 = [DD.x * W - DD.r * 0.55, DD.y * H + DD.r * 0.65];
            const tri = [hp.lens, T1, T2];
            beam.setAttribute('d', inkLoop(tri, { seed: sd + 20, t, smooth: false }));
            beamR.setAttribute('d', [0, 1].map(k => { let d = ''; const T = k ? T2 : T1; for (let j = 0; j < 10; j++) { const a = j / 10, b = a + 0.05; d += inkPath([[lerp(hp.lens[0], T[0], a), lerp(hp.lens[1], T[1], a)], [lerp(hp.lens[0], T[0], b), lerp(hp.lens[1], T[1], b)]], { w: 3 + pul, seed: sd + 30 + j + k * 20, t }) + ' '; } return d; }).join(' '));
          } else { beam.setAttribute('d', ''); beamR.setAttribute('d', ''); }
          if (mode === 'measure') {
            const la = atOr(cues, P.laser ?? 'laser', 0.4), on = lt >= la && Math.floor(lt * 3) % 3 !== 2;
            const T = [MO.x * W - MO.s * 0.82, MO.y * H - MO.s * 0.1];
            let ld = ''; if (on) for (let j = 0; j < 14; j++) { const a = j / 14, b = a + 0.045; ld += inkPath([[lerp(hp.lens[0], T[0], a), lerp(hp.lens[1], T[1], a)], [lerp(hp.lens[0], T[0], b), lerp(hp.lens[1], T[1], b)]], { w: 5, seed: sd + 60 + j, t }) + ' '; }
            laser.setAttribute('d', ld);
            const ca = atOr(cues, P.crater ?? 'crater', null), cp = ca != null && lt >= ca ? spring(lt, ca, 0.6) : 0;
            crat.setAttribute('d', cp > 0.02 ? inkPath(ell(MO.x * W - MO.s * 0.25, MO.y * H - MO.s * 0.05, MO.s * 0.32 * cp, MO.s * 0.22 * cp, 14), { w: 7, seed: sd + 80, t, closed: true }) : '');
            const cu = atOr(cues, P.cubes ?? 'cubes', null), u = cu != null && lt >= cu ? lt - cu : -1;
            if (u >= 0) { c1.update(t, hx + 60 + u * 70, hy + 60 + u * 40, 0.9, u * 40); c2.update(t, hx + 30 + u * 50, hy - 50 - u * 30, 0.9, -u * 50); }
            else { c1.update(t, -999, -999, 0.01); c2.update(t, -999, -999, 0.01); }
          } else { laser.setAttribute('d', ''); crat.setAttribute('d', ''); c1.update(t, -999, -999, 0.01); c2.update(t, -999, -999, 0.01); }
          fin.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== da_rubble
  SH.da_rubble = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam, stars } = common(ctx, 16);
      const mode = P.mode || 'pile', X = (P.x ?? 0.5) * W, Y = (P.y ?? 0.5) * H, R = P.r ?? 300;
      const ghost = inkEl(cam, INK.inkSoft), mo = rock(cam, sd + 3), fistF = inkEl(cam, INK.paperLight), fistR = inkEl(cam);
      const fin = finish(ctx, root, sd, { x: 0.86, y: 0.9, scale: 0.66, pose: 'point', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { zoom: 1.05, fx: P.x ?? 0.5, fy: P.y ?? 0.5 });
          if (stars) stars.update(t);
          if (mode === 'pile') {
            const pa = atOr(cues, P.pile ?? 'pile', 0.2);
            mo.update(t, X, Y, R, { boulders: 70, shade: false, rot: 0, pop: i => (lt - pa - i * 0.03) / 0.35 });
            ghost.setAttribute('d', '');
            fistF.setAttribute('d', ''); fistR.setAttribute('d', '');
          } else {
            const ra = atOr(cues, P.reshape ?? 'reshape', dur * 0.4), p = lt >= ra ? spring(lt, ra, 1.2) : 0;
            const sx = lerp(1, 1.22, p), sy = lerp(1, 0.8, p);
            mo.update(t, X, Y, R, { boulders: 46, sx, sy, rot: 0 });
            let gd = '';
            if (p > 0.05) { const g = ell(X, Y, R * 1.0, R * 0.88, 34); for (let k = 0; k < 34; k += 2) gd += inkPath([g[k], g[(k + 1) % 34]], { w: 4.5, seed: sd + 40 + k, t }) + ' '; }
            ghost.setAttribute('d', gd);
            // a simple ink fist pressing in from the right before the squash
            const fx = X + R * 1.22 + 40 + (1 - p) * 220 - Math.max(0, Math.sin(Math.min(1, (lt - ra + 0.6) / 0.6) * Math.PI)) * 30 * (lt < ra ? 1 : 0), fy = Y;
            // fist seen from the side, knuckles to the left: four finger bumps, a thumb on top, a sleeve to the right
            const F = [[fx + 30, fy - 92], [fx - 4, fy - 84], [fx - 18, fy - 56], [fx - 6, fy - 40], [fx - 22, fy - 16], [fx - 8, fy + 4], [fx - 22, fy + 28], [fx - 6, fy + 48], [fx - 16, fy + 72], [fx + 10, fy + 92], [fx + 80, fy + 98], [fx + 150, fy + 74], [fx + 160, fy - 60], [fx + 110, fy - 96]];
            const SL = [[fx + 150, fy - 70], [fx + 420, fy - 70], [fx + 420, fy + 84], [fx + 150, fy + 84]];
            fistF.setAttribute('d', inkLoop(SL, { seed: sd + 59, t, smooth: false }) + ' ' + inkLoop(F, { seed: sd + 60, t }));
            let fr = inkPath(F, { w: 6, seed: sd + 61, t, closed: true }) + ' ';
            for (let k = 0; k < 3; k++) fr += inkPath([[fx - 8, fy - 46 + k * 46], [fx + 40, fy - 42 + k * 44]], { w: 4, seed: sd + 62 + k, t }) + ' ';
            fr += inkPath([[fx + 40, fy - 88], [fx + 20, fy - 40], [fx + 90, fy - 34]], { w: 5, seed: sd + 66, t }) + ' ';
            fr += inkPath(SL, { w: 6, seed: sd + 70, t, closed: true, smooth: false }) + ' ' + inkPath([[fx + 190, fy - 70], [fx + 190, fy + 84]], { w: 5, seed: sd + 71, t });
            fistR.setAttribute('d', fr);
          }
          fin.update(lt, t, cues);
        },
      };
    },
  };
})();
