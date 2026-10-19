// piri: the Piri Reis world map (1513) as a hand-drawn fragment on gazelle skin, parchment theme (brand/kit/BRAND.md).
// Every line boils (shots/_ink.js, 8 Hz). Map coordinates are [u, v] in 0..1 of the skin's box
// (u: west -> east, v: north -> south). Layout tuned for 16:9 (long videos), works in 9:16 too.
//
// SHOTS.pirimap P: {
//   mode: "map" (default) | "loupe" | "sources" | "torn",
//   side: "center" | "left" (room for Kaşif on the right; automatic when kasif is set),
//   draw: true (coasts are drawn in at the start, cue "draw", over draw_dur s) | false (already drawn),
//   unroll: true (the skin unrolls from the left at the start),
//   cam: {focus: [u, v], zoom: 1.08}  slow push-in over the scene,
//   highlight: {coast: "america"|"bend"|"africa"|"caribbean", color: "red"|"gold"|"blue", at: cue}  thick coloured re-draw,
//   ghost: {at: cue}  dashed red line: where the South American coast would run without the skin's edge,
//   labels: [{u, v, text, at, size, color, font: "hand"|"title", cross: cue, rot}],
//   marks: [{u, v, r, at, color}]  hand-drawn circles,  arrows: [{from: [u, v], to: [u, v], at, color, bend}],
//   loupe: {focus: [u, v], zoom: 2.4, r: 190, at: cue (arrives), from: [u, v], label, label_at},
//   sources: {n: 20, tags: {"12": {text: "Kolomb", color: "red"}}, at: cue (last card lands), merge: cue, label: "≈ 20 kaynak"},
//   torn: {at: cue, keep: "Bugüne kalan", lost: "Kayıp"},
//   kasif: {x: 0.84, y: 0.8 (ground, 0..1 of H), scale: 1, pose: "idle", at: cue, then: "point", dir, emotion, face: -1,
//           seq: [{at, pose, dir, emotion}]}
// }
// cues: draw, hit (generic accent), and whatever the labels/marks/arrows/loupe/sources/kasif reference.
'use strict';

SHOTS.pirimap = {
  kind: '2d',
  build(ctx) {
    const { P, W, H, svg, defs, seed } = ctx;
    const portrait = H > W;
    const FR = 'Fraunces, Georgia, serif';
    const COL = { red: INK.red, gold: INK.gold, blue: INK.blue, green: INK.green, ink: INK.ink, soft: INK.inkSoft };
    const mode = P.mode || 'map';
    const K = P.kasif || null;
    const side = P.side || (K ? 'left' : 'center');
    const tc = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);

    // ---------------------------------------------------------------- skin box
    let bw, bh, bx, by;
    if (portrait) { bw = 940; bh = 660; bx = 70; by = 380; }
    else if (mode === 'torn') { bw = 500; bh = 350; bx = 210; by = 330; }
    else { bh = side === 'left' ? 600 : 620; bw = bh * 1.45; by = side === 'left' ? 245 : 228; bx = side === 'left' ? 230 : (W - bw) / 2; }
    if (P.box) ({ x: bx, y: by, w: bw, h: bh } = Object.assign({ x: bx, y: by, w: bw, h: bh }, P.box));
    const X = u => bx + u * bw, Y = v => by + v * bh, U = q => [X(q[0]), Y(q[1])];

    // densify a polyline (px) so long edges boil and partial reveals are smooth
    function dense(pts, step = 22) {
      const out = [];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
        for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]);
      }
      out.push(pts[pts.length - 1]);
      return out;
    }
    function prefix(pts, f) {                    // first f (0..1) of a dense polyline, by point count
      if (f >= 1) return pts;
      const n = Math.max(2, Math.floor(pts.length * f) + 1);
      return pts.slice(0, Math.min(pts.length, n));
    }

    // ---------------------------------------------------------------- geometry (u, v)
    const SKIN = [[0.02, 0.03], [0.14, -0.012], [0.3, 0.008], [0.48, -0.016], [0.64, 0.01], [0.8, -0.012], [0.95, 0.02],
      [1.0, 0.09], [0.965, 0.17], [1.012, 0.27], [0.958, 0.38], [1.018, 0.5], [0.962, 0.6], [1.006, 0.71], [0.97, 0.82], [0.99, 0.95],
      [0.84, 1.012], [0.66, 0.988], [0.48, 1.016], [0.3, 0.99], [0.14, 1.014], [0.02, 0.975], [-0.016, 0.8], [0.01, 0.62],
      [-0.018, 0.42], [0.008, 0.24], [-0.012, 0.1]];
    const AMERICA = [[-0.1, 0.2], [0.06, 0.205], [0.18, 0.22], [0.25, 0.25], [0.3, 0.29], [0.35, 0.34], [0.39, 0.39], [0.41, 0.44],
      [0.39, 0.49], [0.36, 0.55], [0.34, 0.61], [0.33, 0.67], [0.32, 0.73], [0.33, 0.78]];
    const BEND = [[0.33, 0.78], [0.36, 0.82], [0.42, 0.84], [0.5, 0.845], [0.58, 0.855], [0.66, 0.865], [0.74, 0.875], [0.82, 0.885], [0.9, 0.9], [1.08, 0.91]];
    const GHOST = [[0.33, 0.78], [0.322, 0.86], [0.314, 0.94], [0.306, 1.03]];
    const AFRICA = [[0.84, -0.08], [0.83, 0.03], [0.86, 0.07], [0.85, 0.12], [0.87, 0.15], [0.85, 0.19], [0.83, 0.25], [0.81, 0.31], [0.79, 0.37],
      [0.78, 0.43], [0.79, 0.48], [0.82, 0.53], [0.86, 0.56], [0.91, 0.59], [0.94, 0.65], [0.96, 0.73], [1.12, 0.78]];
    const blob = (cx, cy, rx, ry, k, n = 9) => inkEllipsePts(cx, cy, rx, ry, seed * 17 + k, n, 0, 0.16);
    const CARIB = [blob(0.25, 0.1, 0.075, 0.032, 1, 11), blob(0.1, 0.11, 0.026, 0.085, 2, 11), blob(0.17, 0.055, 0.016, 0.014, 3),
      blob(0.32, 0.145, 0.018, 0.012, 4), blob(0.36, 0.085, 0.012, 0.01, 5), blob(0.19, 0.165, 0.014, 0.012, 6), blob(0.4, 0.12, 0.01, 0.009, 7)];
    const ISLES = [blob(0.585, 0.08, 0.012, 0.01, 8), blob(0.615, 0.105, 0.009, 0.008, 9), blob(0.775, 0.27, 0.011, 0.009, 10),
      blob(0.755, 0.29, 0.008, 0.007, 11), blob(0.7, 0.44, 0.01, 0.008, 12), blob(0.72, 0.462, 0.008, 0.007, 13)];
    const ROSES = [[0.56, 0.3, 0.065], [0.6, 0.58, 0.05]];
    const SHIPS = [[0.5, 0.17, 1], [0.53, 0.46, -1], [0.47, 0.67, 1]];
    const NOTES = [[0.13, 0.42], [0.15, 0.76], [0.93, 0.36]];

    // ---------------------------------------------------------------- DOM
    const world = el(svg, 'g');
    const cid = 'piriskin' + seed, uid = 'piricontent' + seed, rid = 'piriunroll' + seed;
    const skinPx = SKIN.map(U);
    const clip = el(defs, 'clipPath', { id: cid });
    el(clip, 'path', { d: inkLoop(skinPx, { seed: 1, t: 0, amp: 0 }) });
    const unClip = el(defs, 'clipPath', { id: rid });
    const unRect = el(unClip, 'rect', { x: bx - 60, y: by - 80, width: bw + 140, height: bh + 160 });

    const ghostG = el(world, 'g');                       // torn: the lost two thirds
    const skinShadow = inkEl(world, INK.ink, { opacity: 0.16 });
    const outerSkin = el(world, 'g', { 'clip-path': `url(#${rid})` });
    const skin = el(outerSkin, 'g', { id: uid });        // everything the loupe magnifies
    const skinFill = inkEl(skin, INK.paperLight);
    const content = el(skin, 'g', { 'clip-path': `url(#${cid})` });
    const stains = [[0.3, 0.6, 0.16, 0.1], [0.78, 0.2, 0.1, 0.13], [0.12, 0.88, 0.09, 0.06]].map((s, k) =>
      el(content, 'path', { d: inkLoop(blob(...s, 30 + k, 12).map(U), { seed: 40 + k, t: 0, amp: 0 }), fill: INK.stain, opacity: 0.16 }));
    const rhumbG = el(content, 'g', { opacity: 0.55 });
    const rhumbs = [];
    ROSES.forEach(([u, v], ri) => { for (let k = 0; k < 16; k++) rhumbs.push({ ri, a: k / 16 * Math.PI * 2, node: inkEl(rhumbG, k % 4 ? INK.inkSoft : INK.red) }); });
    const landA = inkEl(content, INK.paperDark), landB = inkEl(content, INK.paperDark);
    const coastA = inkEl(content), coastB = inkEl(content), coastBend = inkEl(content);
    const isleF = inkEl(content, INK.paperDark), isleR = inkEl(content);
    const roseF = inkEl(content, INK.paperLight), roseR = inkEl(content), rosePts = inkEl(content, INK.red);
    const shipF = inkEl(content, INK.paperLight), shipR = inkEl(content);
    const notes = inkEl(content, INK.inkSoft, { opacity: 0.75 });
    const snake = inkEl(content, INK.green);
    const hiNode = inkEl(content), ghostNode = el(world, 'path', { fill: 'none', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '18 14' });
    const skinRing = inkEl(skin), skinBand = inkEl(skin, INK.inkSoft, { opacity: 0.45 });
    const roll = inkEl(world, INK.paperDark), rollR = inkEl(world);
    const overG = el(world, 'g');                        // marks, arrows, labels (on top, not clipped)
    const loupeG = el(svg, 'g'), srcG = el(svg, 'g'), kasG = el(svg, 'g');

    const A = dense(AMERICA.map(U)), B = dense(BEND.map(U)), AF = dense(AFRICA.map(U)), GH = dense(GHOST.map(U));
    const AB = A.concat(B.slice(1));
    const landPolyA = AB.concat([U([1.12, 1.3]), U([-0.12, 1.3]), U([-0.12, 0.2])]);
    const landPolyB = AF.concat([U([1.12, -0.1])]);
    const hiPts = { america: A, bend: B, africa: AF, caribbean: null };

    // ---------------------------------------------------------------- overlays
    const textNode = (parent, s, x, y, size, font, fill) => {
      const t = el(parent, 'text', { x, y, 'font-size': size, 'font-family': font === 'title' ? FR : INK_FONT, 'font-weight': font === 'title' ? 900 : 400,
        'text-anchor': 'middle', fill, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: ${font === 'title' ? 14 : 12}px; stroke-linejoin: round` });
      t.textContent = s;
      return t;
    };
    const labels = (P.labels || []).map((L, k) => {
      const g = el(overG, 'g'), [x, y] = U([L.u, L.v]), col = COL[L.color] || (L.font === 'title' ? INK.ink : INK.red);
      const size = L.size || (L.font === 'title' ? 74 : 56);
      const t = textNode(g, L.text, x, y, size, L.font, col);
      const w = t.getComputedTextLength ? t.getComputedTextLength() : size * L.text.length * 0.5;
      return { L, g, x, y, w, size, under: inkEl(g, col), cross: L.cross ? [inkEl(g, INK.red), inkEl(g, INK.red)] : null, k };
    });
    const marks = (P.marks || []).map((M, k) => ({ M, node: inkEl(overG, COL[M.color] || INK.red), k }));
    const arrows = (P.arrows || []).map((Ar, k) => ({ Ar, node: inkEl(overG, COL[Ar.color] || INK.red), head: inkEl(overG, COL[Ar.color] || INK.red), k }));

    // loupe: a magnifier that shows the skin (via <use>) zoomed around its focus
    let loupe = null;
    if (mode === 'loupe') {
      const Lp = Object.assign({ focus: [0.25, 0.12], zoom: 2.4, r: portrait ? 210 : 190 }, P.loupe || {});
      const lc = 'piriloupe' + seed, lcl = el(defs, 'clipPath', { id: lc }), lcirc = el(lcl, 'circle', { r: Lp.r });
      const shadow = inkEl(loupeG, INK.ink, { opacity: 0.18 });
      const glassBg = el(loupeG, 'circle', { r: Lp.r, fill: INK.paperLight });
      const inner = el(loupeG, 'g', { 'clip-path': `url(#${lc})` });
      const use = el(inner, 'use', { href: '#' + uid });
      const shine = inkEl(loupeG, INK.paperLight, { opacity: 0.55 });
      const rim = inkEl(loupeG), rim2 = inkEl(loupeG, INK.hat), handle = inkEl(loupeG, INK.hatBand), handleR = inkEl(loupeG);
      let lab = null;
      if (Lp.label) { lab = el(loupeG, 'g'); lab.t = textNode(lab, Lp.label, 0, 0, Lp.label_size || 76, 'title', INK.red); }
      loupe = { Lp, lcirc, glassBg, use, shadow, shine, rim, rim2, handle, handleR, lab };
    }

    // sources: a grid of small charts that pop in, then fly into the skin
    let src = null;
    if (mode === 'sources') {
      const S0 = Object.assign({ n: 20, tags: {}, label: '≈ 20 kaynak' }, P.sources || {});
      const cols = portrait ? 4 : 5, rows = Math.ceil(S0.n / cols);
      const cw = portrait ? 200 : 170, ch = portrait ? 132 : 112, gx = portrait ? 30 : 34, gy = portrait ? 30 : 28;
      const gw = cols * cw + (cols - 1) * gx, x0 = (K ? (W * 0.82 - gw) / 2 + 20 : (W - gw) / 2), y0 = portrait ? 420 : 300;
      const cards = [];
      for (let k = 0; k < S0.n; k++) {
        const r = rng(seed * 97 + k * 13), c = k % cols, rw = Math.floor(k / cols);
        const cx = x0 + c * (cw + gx) + cw / 2, cy = y0 + rw * (ch + gy) + ch / 2;
        const g = el(srcG, 'g'), tag = S0.tags[k] || S0.tags[String(k)];
        const box = [[-cw / 2, -ch / 2], [cw / 2, -ch / 2 - 3], [cw / 2 + 2, ch / 2], [-cw / 2 + 2, ch / 2 + 2]];
        const coast = []; let yy = -ch / 2 + 10, xx = -cw * (0.1 + r() * 0.3);
        for (let i = 0; i < 6; i++) { coast.push([xx, yy]); yy += ch / 6.5; xx += (r() - 0.5) * cw * 0.32; }
        const kind = k % 3;
        cards.push({ g, cx, cy, box, coast, kind, tag, rot: (r() - 0.5) * 8, f: inkEl(g, INK.paperLight), ring: inkEl(g, tag ? (COL[tag.color] || INK.red) : INK.ink),
          line: inkEl(g, INK.inkSoft), extra: inkEl(g, INK.inkSoft, { opacity: 0.6 }), lab: tag ? textNode(g, tag.text, 0, 18, 54, 'title', COL[tag.color] || INK.red) : null, k });
      }
      cards.filter(c => c.tag).forEach(c => srcG.appendChild(c.g));   // tagged cards on top
      const cnt = textNode(srcG, '', K ? W * 0.41 : W / 2, y0 - 46, portrait ? 92 : 80, 'title', INK.ink);
      src = { S0, cards, cnt, cw, ch };
    }

    // Kaşif (optional): a narrator next to the map, poses switch on cues
    let kas = null;
    if (K && typeof KASIF !== 'undefined') {
      const sc = K.scale ?? (portrait ? 1.1 : 0.95);
      kas = { rig: KASIF.create(kasG, { scale: sc, seed: seed * 3 + 1 }), sc };
    }
    const dirAng = d => typeof d === 'number' ? d : { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 }[d] ?? 12;
    const dirFace = d => typeof d !== 'string' ? null : /left/.test(d) ? -1 : /right/.test(d) ? 1 : null;

    // ---------------------------------------------------------------- per-frame drawing
    const ink = (pts, k, w, t, extra) => inkPath(pts, Object.assign({ w, seed: seed * 1000 + k, t, amp: 1.6 }, extra));
    function drawShip(x, y, s, dir, t, k) {
      const bob = Math.sin(t * 1.6 + k) * 3, rk = Math.sin(t * 1.2 + k * 2) * 3;
      const T = q => { const a = rk * Math.PI / 180, qx = q[0] * dir * s, qy = q[1] * s; return [x + qx * Math.cos(a) - qy * Math.sin(a), y + bob + qx * Math.sin(a) + qy * Math.cos(a)]; };
      const hull = [[-34, -8], [34, -10], [24, 6], [-24, 6]].map(T), sail = [[2, -12], [2, -52], [26, -16]].map(T), sail2 = [[-4, -12], [-4, -44], [-22, -14]].map(T);
      return { f: [inkLoop(hull, { seed: seed + k * 3, t, smooth: false }), inkLoop(sail, { seed: seed + k * 3 + 1, t, smooth: false }), inkLoop(sail2, { seed: seed + k * 3 + 2, t, smooth: false })].join(' '),
        r: [ink(hull, 300 + k * 5, 3.5, t, { closed: true, smooth: false }), ink(sail, 301 + k * 5, 3, t, { closed: true, smooth: false }), ink(sail2, 302 + k * 5, 3, t, { closed: true, smooth: false }),
          ink([T([-1, -8]), T([-1, -56])], 303 + k * 5, 3, t)].join(' ') };
    }

    return {
      update(lt, dur, cues, env = {}) {
        const t = env.t ?? lt;
        // camera: drift + slow push towards the focus
        const cam = P.cam || {}, fz = cam.focus || [0.5, 0.5], zz = lerp(1, cam.zoom ?? (mode === 'torn' ? 1.03 : 1.05), progIO(lt, 0, Math.max(1, dur)));
        const [fx, fy] = U(fz);
        world.setAttribute('transform', `translate(${inkF1(Math.sin(t * 0.31) * 7)} ${inkF1(Math.cos(t * 0.23) * 5)}) translate(${inkF1(fx)} ${inkF1(fy)}) scale(${zz.toFixed(4)}) translate(${inkF1(-fx)} ${inkF1(-fy)})`);

        // skin appears: sources -> only after merge; unroll -> clip grows from the left
        let skinA = 1, unr = 1;
        if (mode === 'sources') {
          const mt = tc((P.sources || {}).merge, cues, null);
          skinA = mt == null ? 0 : spring(lt, mt + 0.25, 0.7);
        } else skinA = clamp01(spring(lt, 0, 0.6) * 2);
        if (P.unroll) unr = progIO(lt, 0.05, 0.9);
        const sc0 = mode === 'sources' ? lerp(0.6, 1, skinA) : lerp(0.94, 1, clamp01(spring(lt, 0, 0.7)));
        outerSkin.setAttribute('opacity', clamp01(skinA * 1.5));
        outerSkin.setAttribute('transform', `translate(${inkF1(bx + bw / 2)} ${inkF1(by + bh / 2)}) scale(${sc0.toFixed(4)}) translate(${inkF1(-bx - bw / 2)} ${inkF1(-by - bh / 2)})`);
        unRect.setAttribute('width', inkF1((bw + 140) * unr));
        const rx = bx - 60 + (bw + 140) * unr;
        if (P.unroll && unr < 0.995) {
          const rp = inkEllipsePts(Math.min(rx, bx + bw), by + bh / 2, 26, bh * 0.53, seed + 5, 14);
          roll.setAttribute('d', inkLoop(rp, { seed: seed + 5, t })); rollR.setAttribute('d', ink(rp, 5, 5, t, { closed: true }));
          roll.style.opacity = rollR.style.opacity = 1;
        } else roll.style.opacity = rollR.style.opacity = 0;
        skinShadow.setAttribute('d', skinA > 0.01 ? inkLoop(skinPx.map(q => [q[0] + 10, q[1] + 13]), { seed: seed + 2, t, amp: 1 }) : '');
        skinShadow.setAttribute('opacity', 0.16 * clamp01(skinA) * unr);

        skinFill.setAttribute('d', inkLoop(skinPx, { seed: seed + 3, t, amp: 1.4 }));
        skinRing.setAttribute('d', ink(skinPx, 3, 5.5, t, { closed: true, amp: 1.4 }));
        const band = SKIN.map(q => U([0.5 + (q[0] - 0.5) * 0.965, 0.5 + (q[1] - 0.5) * 0.955]));
        skinBand.setAttribute('d', ink(band, 4, 2.5, t, { closed: true, amp: 1.2 }));

        // drawing progress of the map content
        const d0 = P.draw === false || mode === 'sources' ? -10 : tc(P.draw_at || 'draw', cues, P.unroll ? 0.35 : 0.15);
        const dd = P.draw_dur || 2.2;
        const fA = mode === 'sources' ? 1 : prog(lt, d0, dd), fB = prog(lt, d0 + dd * 0.15, dd * 0.9);
        const fR = prog(lt, d0 + dd * 0.35, dd * 0.6), fI = prog(lt, d0 + dd * 0.55, dd * 0.5), fS = prog(lt, d0 + dd * 0.7, dd * 0.5);
        rhumbs.forEach(r => {
          const [u, v] = ROSES[r.ri], c = U([u, v]), L = bw * 1.25 * fR;
          r.node.setAttribute('d', fR > 0.01 ? ink([c, [c[0] + Math.cos(r.a) * L, c[1] + Math.sin(r.a) * L]], 50 + r.ri * 20 + Math.round(r.a * 10), 2.4, t, { amp: 1, taper: 0 }) : '');
        });
        landA.setAttribute('d', inkLoop(landPolyA, { seed: seed + 7, t, amp: 1.2 })); landA.style.opacity = 0.75 * prog(lt, d0 + dd * 0.6, 0.6);
        landB.setAttribute('d', inkLoop(landPolyB, { seed: seed + 8, t, amp: 1.2 })); landB.style.opacity = 0.75 * prog(lt, d0 + dd * 0.7, 0.6);
        const pa = prefix(A, fA), pb = prefix(B, prog(lt, d0 + dd * 0.55, dd * 0.45));
        coastA.setAttribute('d', fA > 0.01 ? ink(pa, 10, 6, t) : '');
        coastBend.setAttribute('d', pb.length > 1 && lt > d0 + dd * 0.55 ? ink(pb, 11, 6, t) : '');
        coastB.setAttribute('d', fB > 0.01 ? ink(prefix(AF, fB), 12, 6, t) : '');
        const isl = CARIB.concat(ISLES).map(b => b.map(U));
        isleF.setAttribute('d', fI > 0.01 ? isl.map((p, k) => inkLoop(p, { seed: seed + 60 + k, t, amp: 1 })).join(' ') : ''); isleF.style.opacity = fI;
        isleR.setAttribute('d', fI > 0.01 ? isl.map((p, k) => ink(p, 60 + k, 3.5, t, { closed: true, amp: 1 })).join(' ') : ''); isleR.style.opacity = fI;
        // wind roses
        let rf = '', rr = '', rp2 = '';
        ROSES.forEach(([u, v, R], k) => {
          const c = U([u, v]), rad = R * bw * fR;
          if (rad < 2) return;
          const circ = inkEllipsePts(c[0], c[1], rad * 0.55, rad * 0.55, seed + 80 + k, 14);
          rf += inkLoop(circ, { seed: seed + 80 + k, t, amp: 0.8 }) + ' '; rr += ink(circ, 80 + k, 3, t, { closed: true, amp: 0.8 }) + ' ';
          for (let q = 0; q < 8; q++) {
            const a = q * Math.PI / 4 + Math.sin(t * 0.4 + k) * 0.03, L = q % 2 ? rad * 0.7 : rad, wd = rad * 0.13;
            const tip = [c[0] + Math.cos(a) * L, c[1] + Math.sin(a) * L], l = [c[0] + Math.cos(a - 1.57) * wd, c[1] + Math.sin(a - 1.57) * wd], r2 = [c[0] + Math.cos(a + 1.57) * wd, c[1] + Math.sin(a + 1.57) * wd];
            if (q % 2 === 0) rp2 += inkLoop([l, tip, r2, c], { seed: seed + 90 + q, t, amp: 0.6, smooth: false }) + ' ';
            rr += ink([l, tip, r2], 90 + k * 8 + q, 2.5, t, { amp: 0.6, smooth: false }) + ' ';
          }
        });
        roseF.setAttribute('d', rf); roseR.setAttribute('d', rr); rosePts.setAttribute('d', rp2);
        // ships, notes, snake
        let sf = '', sr = '';
        SHIPS.forEach(([u, v, dir], k) => { if (fS < 0.05) return; const s = drawShip(X(u), Y(v), (portrait ? 1.2 : 1.05) * lerp(0.4, 1, fS), dir, t, k); sf += s.f + ' '; sr += s.r + ' '; });
        shipF.setAttribute('d', sf); shipR.setAttribute('d', sr);
        let nd = '';
        NOTES.forEach(([u, v], k) => {
          const f = prog(lt, d0 + dd * 0.75 + k * 0.12, 0.4); if (f < 0.02) return;
          for (let i = 0; i < 3; i++) { const x0 = X(u) - 44, y0 = Y(v) + i * 15, wl = (70 - i * 14 - (k % 2) * 10) * f; nd += ink([[x0, y0], [x0 + wl * 0.5, y0 - 3 + Math.sin(i + k) * 2], [x0 + wl, y0 + 1]], 120 + k * 4 + i, 3, t, { amp: 0.8 }) + ' '; }
        });
        notes.setAttribute('d', nd);
        const sn = []; for (let i = 0; i <= 10; i++) sn.push([X(0.5) + i * 9, Y(0.94) + Math.sin(i * 1.2 + t * 2) * 6]);
        snake.setAttribute('d', fS > 0.3 ? ink(sn, 140, 7, t, { amp: 0.6, taper: 0.6 }) + ' ' + inkDot(sn[10][0] + 6, sn[10][1], 8, 6, seed + 141, t) : '');

        // highlight / ghost
        const H0 = P.highlight;
        if (H0) {
          const pts = H0.coast === 'caribbean' ? null : hiPts[H0.coast || 'bend'];
          const f = prog(lt, tc(H0.at, cues, 0.5), H0.dur || 1.2);
          const col = COL[H0.color] || INK.red;
          hiNode.setAttribute('fill', col);
          if (pts) hiNode.setAttribute('d', f > 0.01 ? ink(prefix(pts, f), 150, 12, t, { amp: 1.4 }) : '');
          else hiNode.setAttribute('d', f > 0.01 ? CARIB.map(b => b.map(U)).map((p, k) => ink(p, 150 + k, 7, t, { closed: true })).join(' ') : '');
          hiNode.style.opacity = H0.coast === 'caribbean' ? f : 1;
        }
        if (P.ghost) {
          const f = prog(lt, tc(P.ghost.at, cues, 0.8), 1.0), gp = inkJitter(prefix(GH, f), seed + 160, t, 1.5);
          ghostNode.setAttribute('stroke', INK.red);
          ghostNode.setAttribute('d', f > 0.01 ? 'M' + gp.map(q => `${inkF1(q[0])} ${inkF1(q[1])}`).join(' L') : '');
          ghostNode.setAttribute('stroke-dashoffset', inkF1(-t * 12));
        }

        // torn: the lost part of the world map, dashed, to the east
        if (mode === 'torn') {
          const T0 = P.torn || {}, f = prog(lt, 0.4, 1.6), hit = tc(T0.at, cues, 1.6);
          let gd = '';
          const gx0 = bx + bw * 0.98, gx1 = bx + bw * 3.05, top = [], bot = [];
          for (let i = 0; i <= 12; i++) { const x = lerp(gx0, gx1, i / 12 * f); top.push([x, by + Math.sin(i * 1.7) * 8]); bot.push([x, by + bh + Math.cos(i * 1.3) * 8]); }
          const out = top.concat(f > 0.98 ? [[gx1, by + bh / 2]] : []).concat(bot.reverse());
          const jp = inkJitter(out, seed + 170, t, 1.5);
          gd = 'M' + jp.map(q => `${inkF1(q[0])} ${inkF1(q[1])}`).join(' L');
          if (!ghostG.p) { ghostG.p = el(ghostG, 'path', { fill: rgba(INK.paperDark, 0.25), stroke: INK.inkSoft, 'stroke-width': 5, 'stroke-dasharray': '20 16', 'stroke-linecap': 'round' });
            ghostG.l1 = textNode(ghostG, T0.lost || 'Kayıp', lerp(gx0, gx1, 0.5), by + bh / 2 + 30, 96, 'title', INK.inkSoft);
            ghostG.l2 = textNode(ghostG, T0.keep || 'Bugüne kalan', bx + bw / 2, by + bh + 84, 62, 'hand', INK.red);
            ghostG.l3 = textNode(ghostG, T0.share || '1 / 3', bx + bw / 2, by - 34, 88, 'title', INK.red);
            ghostG.br = inkEl(ghostG, INK.red); }
          ghostG.p.setAttribute('d', gd); ghostG.p.setAttribute('stroke-dashoffset', inkF1(-t * 10));
          ghostG.l1.setAttribute('opacity', prog(lt, 1.4, 0.6));
          const ph = spring(lt, hit, 0.6), pk = punch(lt, hit, 0.6);
          for (const n of [ghostG.l2, ghostG.l3]) { n.setAttribute('opacity', clamp01(ph * 2)); }
          ghostG.l3.setAttribute('transform', `translate(${inkF1(bx + bw / 2)} ${inkF1(by - 34)}) scale(${(lerp(0.5, 1, ph) * (1 + 0.15 * pk)).toFixed(3)}) translate(${inkF1(-bx - bw / 2)} ${inkF1(-by + 34)})`);
          ghostG.br.setAttribute('d', ph > 0.05 ? ink([[bx + 6, by - 8], [bx + 6, by - 22], [bx + bw * 0.97 * ph, by - 22], [bx + bw * 0.97 * ph, by - 8]], 180, 5, t, { smooth: false }) : '');
        }

        // generic overlays
        labels.forEach(l => {
          const at = tc(l.L.at, cues, 0.6 + l.k * 0.4), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5), b = boil(seed + 200 + l.k, t, 1);
          l.g.setAttribute('opacity', clamp01(p * 2));
          l.g.setAttribute('transform', `translate(${inkF1(l.x + b[0])} ${inkF1(l.y + b[1])}) rotate(${l.L.rot ?? -2}) scale(${(lerp(0.6, 1, p) * (1 + 0.1 * pk)).toFixed(3)}) translate(${inkF1(-l.x)} ${inkF1(-l.y)})`);
          const u = prog(lt, at + 0.2, 0.4), y = l.y + l.size * 0.2;
          l.under.setAttribute('d', u > 0.01 ? ink([[l.x - l.w / 2, y], [l.x - l.w / 2 + l.w * u, y - 4]], 210 + l.k, 5, t) : '');
          if (l.cross) {
            const ct = tc(l.L.cross, cues, null), c = ct == null ? 0 : prog(lt, ct, 0.35), c2 = ct == null ? 0 : prog(lt, ct + 0.2, 0.35);
            const hw = l.w / 2 + 16, hh = l.size * 0.55, cy = l.y - l.size * 0.3;
            l.cross[0].setAttribute('d', c > 0.01 ? ink([[l.x - hw, cy - hh], [lerp(l.x - hw, l.x + hw, c), lerp(cy - hh, cy + hh, c)]], 220 + l.k, 11, t) : '');
            l.cross[1].setAttribute('d', c2 > 0.01 ? ink([[l.x + hw, cy - hh], [lerp(l.x + hw, l.x - hw, c2), lerp(cy - hh, cy + hh, c2)]], 230 + l.k, 11, t) : '');
          }
        });
        marks.forEach(m => {
          const at = tc(m.M.at, cues, 0.8), f = prog(lt, at, 0.5), [x, y] = U([m.M.u, m.M.v]), r = (m.M.r || 0.06) * bw;
          const pts = []; for (let i = 0; i <= 18; i++) { const a = -2.2 + i / 18 * Math.PI * 2.15 * f; pts.push([x + Math.cos(a) * r * (1 + 0.05 * Math.sin(i)), y + Math.sin(a) * r * 0.82]); }
          m.node.setAttribute('d', f > 0.02 ? ink(pts, 240 + m.k, 7, t) : '');
        });
        arrows.forEach(a => {
          const at = tc(a.Ar.at, cues, 1), f = prog(lt, at, 0.6), p0 = U(a.Ar.from), p1 = U(a.Ar.to), bend = a.Ar.bend ?? 0.25;
          const mx = (p0[0] + p1[0]) / 2 - (p1[1] - p0[1]) * bend, my = (p0[1] + p1[1]) / 2 + (p1[0] - p0[0]) * bend;
          const pts = []; for (let i = 0; i <= 14; i++) { const u = i / 14 * f; pts.push([(1 - u) * (1 - u) * p0[0] + 2 * u * (1 - u) * mx + u * u * p1[0], (1 - u) * (1 - u) * p0[1] + 2 * u * (1 - u) * my + u * u * p1[1]]); }
          a.node.setAttribute('d', f > 0.02 ? ink(pts, 250 + a.k, 7, t) : '');
          if (f > 0.95) {
            const e = pts[pts.length - 1], q = pts[pts.length - 3], ang = Math.atan2(e[1] - q[1], e[0] - q[0]);
            a.head.setAttribute('d', ink([[e[0] - 34 * Math.cos(ang - 0.5), e[1] - 34 * Math.sin(ang - 0.5)], e, [e[0] - 34 * Math.cos(ang + 0.5), e[1] - 34 * Math.sin(ang + 0.5)]], 260 + a.k, 7, t, { smooth: false }));
          } else a.head.setAttribute('d', '');
        });

        // loupe
        if (loupe) {
          const { Lp } = loupe, at = tc(Lp.at, cues, Math.min(1.6, dur * 0.4)), from = Lp.from || [Lp.focus[0] + 0.35, Lp.focus[1] + 0.45];
          const m = progIO(lt, 0.2, Math.max(0.4, at - 0.2)), u = lerp(from[0], Lp.focus[0], m), v = lerp(from[1], Lp.focus[1], m);
          const wob = [Math.sin(t * 1.3) * 0.006, Math.cos(t * 1.1) * 0.005];
          const F = U([u + wob[0], v + wob[1]]);
          // the glass sits up-right of the focus point it magnifies? No: centred on it, like holding it over the chart
          const C0 = [F[0], F[1]], R = Lp.r, z = lerp(1.3, Lp.zoom, m) * (1 + 0.04 * punch(lt, at, 0.6));
          const vis = clamp01(spring(lt, 0.1, 0.6) * 2);
          loupeG.setAttribute('opacity', vis);
          loupeG.setAttribute('transform', world.getAttribute('transform'));
          loupe.lcirc.setAttribute('cx', inkF1(C0[0])); loupe.lcirc.setAttribute('cy', inkF1(C0[1]));
          loupe.glassBg.setAttribute('cx', inkF1(C0[0])); loupe.glassBg.setAttribute('cy', inkF1(C0[1]));
          loupe.use.setAttribute('transform', `translate(${inkF1(C0[0])} ${inkF1(C0[1])}) scale(${z.toFixed(3)}) translate(${inkF1(-F[0])} ${inkF1(-F[1])})`);
          const ring = inkEllipsePts(C0[0], C0[1], R, R, seed + 300, 22);
          loupe.shadow.setAttribute('d', inkLoop(ring.map(q => [q[0] + 12, q[1] + 16]), { seed: seed + 301, t, amp: 1 }));
          loupe.rim2.setAttribute('d', ink(ring, 302, 22, t, { closed: true, amp: 1 }));
          loupe.rim.setAttribute('d', ink(inkEllipsePts(C0[0], C0[1], R + 12, R + 12, seed + 303, 22), 303, 5, t, { closed: true, amp: 1 }) + ' ' + ink(inkEllipsePts(C0[0], C0[1], R - 11, R - 11, seed + 304, 22), 304, 4, t, { closed: true, amp: 1 }));
          const ha = Math.PI * 0.25, h0 = [C0[0] + Math.cos(ha) * (R + 12), C0[1] + Math.sin(ha) * (R + 12)], h1 = [h0[0] + Math.cos(ha) * 150, h0[1] + Math.sin(ha) * 150];
          const hw = 20, nx = -Math.sin(ha) * hw, ny = Math.cos(ha) * hw;
          const hp = [[h0[0] + nx, h0[1] + ny], [h1[0] + nx, h1[1] + ny], [h1[0] - nx, h1[1] - ny], [h0[0] - nx, h0[1] - ny]];
          loupe.handle.setAttribute('d', inkLoop(hp, { seed: seed + 305, t, smooth: false }));
          loupe.handleR.setAttribute('d', ink(hp, 305, 5, t, { closed: true, smooth: false }));
          loupe.shine.setAttribute('d', ink([[C0[0] - R * 0.62, C0[1] - R * 0.18], [C0[0] - R * 0.5, C0[1] - R * 0.5], [C0[0] - R * 0.2, C0[1] - R * 0.64]], 306, 10, t));
          if (loupe.lab) {
            const la = tc(Lp.label_at, cues, at + 0.2), p = spring(lt, la, 0.6);
            const lx = C0[0] + (Lp.label_dx ?? 0), ly = C0[1] + (Lp.label_dy ?? -(R + 46));
            loupe.lab.setAttribute('opacity', clamp01(p * 2));
            loupe.lab.setAttribute('transform', `translate(${inkF1(lx)} ${inkF1(ly)}) rotate(-3) scale(${lerp(0.6, 1, p).toFixed(3)})`);
          }
        }

        // sources
        if (src) {
          const { S0, cards, cnt, cw, ch } = src;
          const last = tc(S0.at, cues, Math.max(1, dur * 0.6)), mt = tc(S0.merge, cues, null), span = Math.max(0.5, last - 0.25);
          let shown = 0;
          cards.forEach(c => {
            const at = 0.2 + c.k / (cards.length - 1) * span, p = spring(lt, at, 0.5);
            if (lt >= at) shown++;
            let x = c.cx, y = c.cy, s = lerp(0.3, 1, p), a = clamp01(p * 3), rot = c.rot * (1 - 0.3 * p);
            if (mt != null) {
              const m = progIO(lt, mt + c.k * 0.02, 0.6);
              x = lerp(c.cx, bx + bw / 2, m); y = lerp(c.cy, by + bh / 2, m); s *= lerp(1, 0.25, m); a *= 1 - prog(lt, mt + 0.35 + c.k * 0.02, 0.3); rot += m * 30;
            }
            const b = boil(seed + 400 + c.k, t, 0.8);
            c.g.setAttribute('opacity', a);
            c.g.setAttribute('transform', `translate(${inkF1(x + b[0])} ${inkF1(y + b[1])}) rotate(${inkF1(rot)}) scale(${s.toFixed(3)})`);
            const bt = c.box.map(q => [q[0], q[1]]);
            c.f.setAttribute('d', inkLoop(bt, { seed: seed + 410 + c.k, t, smooth: false, amp: 1 }));
            c.ring.setAttribute('d', ink(bt, 410 + c.k, c.tag ? 7 : 4, t, { closed: true, smooth: false, amp: 1 }));
            c.line.setAttribute('d', ink(c.coast, 420 + c.k, 3.5, t, { amp: 1 }));
            const cx2 = cw * 0.22, cy2 = 0;
            c.extra.setAttribute('d', c.kind === 0 ? ink(inkEllipsePts(cx2, cy2, cw * 0.2, ch * 0.3, seed + c.k, 10), 430 + c.k, 2.5, t, { closed: true, amp: 0.8 })
              : c.kind === 1 ? [0, 1, 2, 3].map(q => ink([[cx2, cy2], [cx2 + Math.cos(q * 0.8) * cw * 0.35, cy2 + Math.sin(q * 0.8 - 1) * ch * 0.4]], 440 + c.k * 4 + q, 2, t, { amp: 0.6 })).join(' ')
              : ink([[cx2 - 26, -18], [cx2 + 20, -20]], 450 + c.k, 3, t) + ' ' + ink([[cx2 - 26, 0], [cx2 + 26, -2]], 451 + c.k, 3, t) + ' ' + ink([[cx2 - 26, 18], [cx2 + 10, 17]], 452 + c.k, 3, t));
          });
          const done = lt >= last + 0.1;
          const txt = done ? S0.label : `${shown}`;
          if (cnt.textContent !== txt) cnt.textContent = txt;
          const pc = punch(lt, last + 0.1, 0.6), cb = boil(seed + 499, t, 1);
          cnt.setAttribute('opacity', shown ? (mt != null ? 1 - prog(lt, mt, 0.4) : 1) : 0);
          cnt.setAttribute('transform', `translate(${inkF1(cb[0])} ${inkF1(cb[1])})`);
          cnt.setAttribute('font-size', (portrait ? 92 : 80) * (1 + 0.12 * pc));
        }

        // Kaşif
        if (kas) {
          const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, emotion: K.emotion }];
          if (K.at != null) segs.push({ at: tc(K.at, cues, 1), pose: K.then || 'point', dir: K.dir, emotion: K.emotion });
          for (const s of K.seq || []) segs.push(Object.assign({}, s, { at: tc(s.at, cues, 0) }));
          segs.sort((a, b) => a.at - b.at);
          let k = 0; while (k + 1 < segs.length && lt >= segs[k + 1].at) k++;
          const it = segs[k], pv = segs[k - 1], since = lt - it.at;
          const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null);
          const df = dirFace(it.dir), face = K.face ?? (df != null ? df : -1);
          const opts = { x: (K.x ?? (portrait ? 0.78 : 0.86)) * W, y: (K.y ?? (portrait ? 0.95 : 0.8)) * H, face, since: Math.max(0, since), dir: dirAng(it.dir),
            mouth: K.talk === false ? 0 : inkTalk(t, words), emotion: it.emotion || K.emotion };
          if (pv && since < 0.32) { opts.prev = { pose: pv.pose, since: it.at - Math.max(0, pv.at), dir: dirAng(pv.dir), emotion: pv.emotion || K.emotion }; opts.mix = since / 0.32; }
          const ap = clamp01(spring(lt, 0, 0.5) * 2);
          kasG.setAttribute('opacity', ap);
          kasG.setAttribute('transform', `translate(0 ${inkF1((1 - ap) * 40)})`);
          kas.rig.update(t, it.pose, opts);
        }
      },
    };
  },
};
