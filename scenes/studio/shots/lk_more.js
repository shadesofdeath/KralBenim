// lk_more: extra places for the Stickstory long "The unpickable lock" (2026-11-11), parchment ink (BRAND.md §3, §5).
// Palette tokens only (INK), lines boil at 8 Hz, pure function of (seed, lt); no Math.random. Needs tz__lib.js (TZ.Shapes)
// and mcB__lib.js (MCB.cast, MCB.labels). Common P: cast: [MCB cast entries], labels: [MCB label entries].
//
// SHOTS.lk_forge — a medieval locksmith's forge: hearth with fire, anvil with a glowing lock plate, a hammer that swings and
//   throws sparks (the smith is a cast figure behind the anvil), keys on a wall rack, an inset where ward rings multiply.
//   P: {inset: cue (inset appears, 5 ward rings fill it), smith_x: 0.62 (where the hammer pivots)}
// SHOTS.lk_thief — night break-ins. P: {mode: "store"|"close"|"dock", wire: cue (bent wire slips into the keyhole),
//   keys: cue (dock: a ring of false keys jiggles in the lock)}
//   store: a medieval storeroom door with an iron lock plate, a lantern on the ground (thief = cast figure)
//   close: close-up of the iron lock plate on the planks, the bent wire wiggling in the keyhole
//   dock:  Portsmouth Dockyard at night: brick storehouse with a big door, ships' masts behind, moon
// SHOTS.lk_club — a Victorian club room: panelling, fireplace, portrait; a critic in an armchair waves a newspaper whose
//   headline is P.headline ("16 DAYS?"); P: {headline, wave: cue}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const A = (cues, n, fb) => typeof n === 'number' ? n : (n != null && cues && cues[n] != null) ? cues[n] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const R = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const arc = (cx, cy, rx, ry, a0, a1, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const ell = (cx, cy, rx, ry, n = 20) => arc(cx, cy, rx, ry, 0, Math.PI * 2 * (1 - 1 / n), n - 1);
  const rot = (p, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return p.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  const tx = (g, s, x, y, size, o = {}) => { const e = el(g, 'text', { x, y, 'font-family': o.font || FR, 'font-weight': o.weight ?? 900, 'font-size': size,
    fill: o.fill || INK.ink, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': 'central' }); e.textContent = s; return e; };
  const K = () => ({ WD: mix(INK.stain, INK.paperDark, 0.35), WDD: mix(INK.stain, INK.ink, 0.35), WDL: mix(INK.stain, INK.paperLight, 0.5),
    IR: mix(INK.inkSoft, INK.ink, 0.25), IRL: mix(INK.inkSoft, INK.paperDark, 0.45), BRICK: mix(INK.red, INK.paperDark, 0.45), NIGHT: mix(INK.ink, INK.blue, 0.35) });
  const common = (root, P, W, H, sd) => {
    const M = window.MCB, castG = el(root, 'g'), labG = el(root, 'g');
    const cast = M.cast(castG, P.cast || [], W, H, sd + 700), labs = M.labels(labG, P.labels || [], W, H, sd + 800);
    return { update(lt, t, cues) { cast.update(lt, t, cues); labs.update(lt, t, cues); } };
  };
  const flame = (e, x, y, w, h, lt, sd, t, ph = 0) => { const f = Math.sin(lt * 9 + ph) * w * 0.25;
    e.setAttribute('d', inkLoop([[x - w, y], [x - w * 0.6 + f * 0.3, y - h * 0.5], [x + f, y - h], [x + w * 0.5 + f * 0.2, y - h * 0.45], [x + w, y]], { seed: sd, t, smooth: true })); };
  // iron lock plate with scroll ends and a keyhole (local: ±160 x ±200)
  const plate = (sh, g, k) => {
    sh.add(g, R(-160, -200, 160, 200), { fill: k.IR, stroke: INK.ink, w: 8 });
    sh.add(g, R(-130, -170, 130, 170), { stroke: k.IRL, w: 4 });
    for (const [x, y] of [[-130, -170], [130, -170], [-130, 170], [130, 170]]) sh.add(g, ell(x, y, 12, 12, 8), { fill: INK.ink });
    for (const s of [-1, 1]) for (const y of [-110, 0, 110]) sh.add(g, arc(s * 190, y, 34, 34, 0, Math.PI * 1.6, 12).map(([x, yy]) => [s < 0 ? 2 * (s * 190) - x : x, yy]), { stroke: k.IR, w: 12, closed: false, smooth: true });
    sh.add(g, ell(0, -30, 30, 30, 12), { fill: INK.ink });
    sh.add(g, [[-20, -20], [20, -20], [12, 60], [-12, 60]], { fill: INK.ink });
  };

  // ================================================================== lk_forge
  SH.lk_forge = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 301, root = el(svg, 'g'), k = K(), sh = window.TZ.Shapes(), G = H * 0.86;
    // hearth + hood
    sh.add(root, [[W * 0.03, H * 0.06], [W * 0.31, H * 0.06], [W * 0.27, H * 0.34], [W * 0.07, H * 0.34]], { fill: k.IRL, stroke: INK.ink, w: 7 });
    sh.add(root, R(W * 0.04, H * 0.34, W * 0.3, G), { fill: k.BRICK, stroke: INK.ink, w: 7 });
    for (let r = 0; r < 9; r++) for (let c = 0; c < 5; c++) { const y = H * 0.38 + r * 52; if (y > G - 20) break; const x = W * 0.05 + c * 100 + (r % 2) * 50; if (x > W * 0.27) continue; sh.add(root, [[x, y], [x + 70, y]], { stroke: mix(k.BRICK, INK.ink, 0.4), w: 3, closed: false }); }
    sh.add(root, [[W * 0.08, G - 20], [W * 0.08, H * 0.58]].concat(arc(W * 0.17, H * 0.58, W * 0.09, H * 0.1, Math.PI, Math.PI * 2, 12)).concat([[W * 0.26, G - 20]]), { fill: mix(INK.ink, INK.inkSoft, 0.3), stroke: INK.ink, w: 6 });
    const fl = [inkEl(root, INK.red), inkEl(root, INK.gold), inkEl(root, INK.paperLight)];
    // wall rack with keys + lock plates (right)
    sh.add(root, R(W * 0.74, H * 0.14, W * 0.97, H * 0.18), { fill: k.WDD, stroke: INK.ink, w: 5 });
    const keys = [0, 1, 2, 3].map(i => { const g = el(root, 'g'); sh.add(g, ell(0, 0, 26, 26, 12), { stroke: k.IR, w: 9 }); sh.add(g, R(-7, 26, 7, 190), { fill: k.IR, stroke: INK.ink, w: 3 }); sh.add(g, R(7, 140, 50, 186), { fill: k.IR, stroke: INK.ink, w: 3 }); return g; });
    // anvil on a stump, glowing plate on it
    sh.add(root, R(W * 0.43, H * 0.7, W * 0.53, G), { fill: k.WDD, stroke: INK.ink, w: 6 });
    sh.add(root, [[W * 0.37, H * 0.6], [W * 0.6, H * 0.6], [W * 0.56, H * 0.65], [W * 0.52, H * 0.65], [W * 0.52, H * 0.7], [W * 0.44, H * 0.7], [W * 0.44, H * 0.65], [W * 0.4, H * 0.65]], { fill: k.IR, stroke: INK.ink, w: 7 });
    sh.add(root, [[W * 0.37, H * 0.6], [W * 0.33, H * 0.585], [W * 0.37, H * 0.62]], { fill: k.IR, stroke: INK.ink, w: 5 });
    const hot = inkEl(root, INK.gold), hotL = inkEl(root, INK.ink);
    const ham = el(root, 'g'); sh.add(ham, R(-10, 0, 10, 230), { fill: k.WD, stroke: INK.ink, w: 5 }); sh.add(ham, R(-50, 210, 50, 270), { fill: k.IR, stroke: INK.ink, w: 6 });
    const spark = inkEl(root, INK.gold);
    // ward inset
    const ins = { f: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink), w: Array.from({ length: 5 }, () => inkEl(root, INK.ink)) };
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt; sh.update(t, lt);
      flame(fl[0], W * 0.17, G - 24, 120, 190, lt, sd + 1, t); flame(fl[1], W * 0.17, G - 24, 80, 140, lt, sd + 2, t, 1.3); flame(fl[2], W * 0.17, G - 24, 36, 70, lt, sd + 3, t, 2.1);
      keys.forEach((g, i) => g.setAttribute('transform', `translate(${f1(W * (0.78 + i * 0.05))} ${f1(H * 0.21)}) rotate(${f1(Math.sin(lt * 1.4 + i) * 5)}) scale(0.8)`));
      const cyc = (lt * 1.1) % 1, sw = cyc < 0.7 ? -70 + cyc / 0.7 * 10 : -60 + (cyc - 0.7) / 0.3 * 105;   // slow lift, fast strike
      const px = W * (P.smith_x ?? 0.62) - 40, py = H * 0.4;
      ham.setAttribute('transform', `translate(${f1(px)} ${f1(py)}) rotate(${f1(Math.min(45, sw))})`);
      const glow = 0.7 + 0.3 * Math.sin(lt * 3), pl = [[W * 0.41, H * 0.6], [W * 0.5, H * 0.6], [W * 0.5, H * 0.585], [W * 0.41, H * 0.585]];
      hot.setAttribute('fill', glow > 0.85 ? INK.gold : mix(INK.gold, INK.red, 0.4)); hot.setAttribute('d', inkLoop(pl, { seed: sd + 5, t }));
      hotL.setAttribute('d', inkPath(pl, { w: 4, seed: sd + 6, t, closed: true }));
      const hit = cyc > 0.95 || cyc < 0.15, sp = [];
      if (hit) for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.15 + i * 0.08), r = 40 + ((lt * 600 + i * 37) % 120); const x = W * 0.46 + Math.cos(a) * r, y = H * 0.58 + Math.sin(a) * r * 0.7; sp.push(inkPath([[x, y], [x + Math.cos(a) * 22, y + Math.sin(a) * 16]], { w: 5, seed: sd + 20 + i, t })); }
      spark.setAttribute('d', sp.join(' '));
      const ia = A(cues, P.inset, 0.5), cx = W * 0.84, cy = H * 0.52, r = 170 * spring(lt, ia, 0.5);
      ins.f.setAttribute('d', r > 1 ? inkLoop(ell(cx, cy, r, r, 24), { seed: sd + 30, t }) : '');
      ins.l.setAttribute('d', r > 1 ? inkPath(ell(cx, cy, r, r, 24), { w: 7, seed: sd + 31, t, closed: true }) + ' ' + inkLoop(ell(cx, cy, 14, 14, 8), { seed: sd + 32, t }) : '');
      ins.w.forEach((e, i) => { const on = lt > ia + 0.4 + i * 0.35, rr = r * (0.2 + i * 0.15);
        e.setAttribute('d', on && r > 1 ? inkPath(arc(cx, cy, rr, rr, Math.PI * (0.3 + i * 0.07), Math.PI * (1.7 - i * 0.05), 18), { w: 10, seed: sd + 40 + i, t }) : ''); });
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_thief
  SH.lk_thief = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 331, root = el(svg, 'g'), k = K(), sh = window.TZ.Shapes(), G = H * 0.86, mode = P.mode || 'store';
    const S = {};
    if (mode === 'close') {
      for (let i = 0; i < 7; i++) sh.add(root, R(i * W / 7 - 4, -20, (i + 1) * W / 7, H + 20), { fill: i % 2 ? mix(k.WD, INK.ink, 0.3) : mix(k.WD, INK.ink, 0.38), stroke: INK.ink, w: 5 });
      S.plate = el(root, 'g'); plate(sh, S.plate, k);
      S.kx = W * 0.44; S.ky = H * 0.46 - 30 * 1.6;
    } else if (mode === 'store') {
      sh.add(root, R(W * 0.08, H * 0.12, W * 0.96, G), { fill: mix(INK.inkSoft, INK.paperDark, 0.35), stroke: INK.ink, w: 7 });
      for (let r = 0; r < 12; r++) { const y = H * 0.16 + r * 58; if (y > G - 10) break; for (let c = 0; c < 9; c++) { const x = W * 0.1 + c * 200 + (r % 2) * 100; if (x > W * 0.92) break; sh.add(root, [[x, y], [x + 150, y]], { stroke: mix(INK.inkSoft, INK.ink, 0.4), w: 3, closed: false }); } }
      sh.add(root, R(W * 0.4, H * 0.22, W * 0.72, G), { fill: mix(k.WD, INK.ink, 0.25), stroke: INK.ink, w: 8 });
      for (let i = 1; i < 4; i++) sh.add(root, [[lerp(W * 0.4, W * 0.72, i / 4), H * 0.22], [lerp(W * 0.4, W * 0.72, i / 4), G]], { stroke: INK.ink, w: 4, closed: false });
      for (const y of [0.3, 0.75]) sh.add(root, R(W * 0.4, H * y, W * 0.72, H * y + 30), { fill: k.IR, stroke: INK.ink, w: 4 });
      S.plate = el(root, 'g'); plate(sh, S.plate, k);
      S.kx = W * 0.56; S.ky = H * 0.5 - 30 * 0.55;
      S.lamp = { b: inkEl(root, k.IR), f: inkEl(root, INK.gold), l: inkEl(root, INK.ink), glow: inkEl(root, INK.gold, { 'fill-opacity': 0.25 }) };
    } else {
      // dock: masts and rigging behind, moon, brick storehouse with a big door
      S.moon = { f: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink) };
      for (let i = 0; i < 3; i++) { const x = W * (0.7 + i * 0.1), h = H * (0.62 - i * 0.06);
        sh.add(root, [[x, G - 60], [x, G - 60 - h]], { stroke: INK.ink, w: 8, closed: false });
        for (let y = 0; y < 3; y++) sh.add(root, [[x - 90 + y * 20, G - 60 - h * (0.85 - y * 0.25)], [x + 90 - y * 20, G - 60 - h * (0.85 - y * 0.25)]], { stroke: INK.ink, w: 6, closed: false });
        sh.add(root, [[x, G - 60 - h], [x + 140, G - 60]], { stroke: INK.inkSoft, w: 3, closed: false }); }
      sh.add(root, [[W * 0.62, G - 60], [W * 1.02, G - 80], [W * 1.02, G - 20], [W * 0.66, G - 10]], { fill: mix(k.WDD, INK.ink, 0.3), stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.02, H * 0.16, W * 0.58, G), { fill: k.BRICK, stroke: INK.ink, w: 7 });
      sh.add(root, [[W * 0, H * 0.16], [W * 0.3, H * 0.04], [W * 0.6, H * 0.16]], { fill: mix(k.BRICK, INK.ink, 0.35), stroke: INK.ink, w: 7 });
      for (let r = 0; r < 12; r++) { const y = H * 0.2 + r * 54; if (y > G - 10) break; for (let c = 0; c < 6; c++) { const x = W * 0.04 + c * 180 + (r % 2) * 90; if (x > W * 0.54) break; sh.add(root, [[x, y], [x + 120, y]], { stroke: mix(k.BRICK, INK.ink, 0.45), w: 3, closed: false }); } }
      sh.add(root, R(W * 0.18, H * 0.3, W * 0.44, G), { fill: mix(k.WD, INK.ink, 0.3), stroke: INK.ink, w: 8 });
      sh.add(root, [[W * 0.31, H * 0.3], [W * 0.31, G]], { stroke: INK.ink, w: 5, closed: false });
      S.plate = el(root, 'g'); plate(sh, S.plate, k);
      S.kx = W * 0.31; S.ky = H * 0.55 - 30 * 0.45;
      S.keys = el(root, 'g'); sh.add(S.keys, ell(0, 70, 46, 46, 14), { stroke: INK.gold, w: 9 });
      [0, 1, 2, 3].forEach(i => { const a = (-0.5 + i * 0.35); sh.add(S.keys, rot([[-5, 110], [5, 110], [5, 210], [36, 210], [36, 236], [-5, 236]].map(([x, y]) => [x, y]), 0, 70, a), { fill: INK.gold, stroke: INK.ink, w: 3 }); });
      sh.add(S.keys, R(-6, -20, 6, 30), { fill: INK.gold, stroke: INK.ink, w: 3 });
      S.lamp = { b: inkEl(root, k.IR), f: inkEl(root, INK.gold), l: inkEl(root, INK.ink), glow: inkEl(root, INK.gold, { 'fill-opacity': 0.25 }) };
    }
    S.wire = inkEl(root, INK.red); S.wireL = inkEl(root, INK.ink);
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      const ps = mode === 'close' ? [W * 0.44, H * 0.46, 1.6] : mode === 'store' ? [W * 0.56, H * 0.5, 0.55] : [W * 0.31, H * 0.55, 0.45];
      S.plate.setAttribute('transform', `translate(${f1(ps[0])} ${f1(ps[1])}) scale(${ps[2]})`);
      sh.update(t, lt);
      if (S.moon) { const mx = W * 0.82, my = H * 0.14; S.moon.f.setAttribute('d', inkLoop(ell(mx, my, 70, 70, 16), { seed: sd + 1, t })); S.moon.l.setAttribute('d', inkPath(ell(mx, my, 70, 70, 16), { w: 5, seed: sd + 2, t, closed: true })); }
      if (S.lamp) { const lx = mode === 'store' ? W * 0.32 : W * 0.48, ly = G - 10, fl = Math.sin(lt * 8) * 5;
        S.lamp.glow.setAttribute('d', inkLoop(ell(lx, ly - 60, 170 + fl * 2, 130, 18), { seed: sd + 3, t }));
        S.lamp.b.setAttribute('d', inkLoop(R(lx - 36, ly - 110, lx + 36, ly), { seed: sd + 4, t }));
        S.lamp.f.setAttribute('d', inkLoop([[lx - 14, ly - 30], [lx + fl * 0.4, ly - 90 - Math.abs(fl)], [lx + 14, ly - 30]], { seed: sd + 5, t, smooth: true }));
        S.lamp.l.setAttribute('d', inkPath(R(lx - 36, ly - 110, lx + 36, ly), { w: 5, seed: sd + 6, t, closed: true }) + ' ' + inkPath(arc(lx, ly - 110, 30, 30, Math.PI, Math.PI * 2, 8), { w: 5, seed: sd + 7, t })); }
      if (S.light) S.light.setAttribute('d', inkLoop(ell(W * 0.5 + Math.sin(lt * 0.7) * 60, H * 0.5, 520, 380, 20), { seed: sd + 8, t }));
      if (mode !== 'dock') {
        const wa = A(cues, P.wire, 0.4), k2 = progIO(lt, wa, 1.1), wig = lt > wa + 1.1 ? Math.sin(lt * 7) * 0.12 : 0, sc = mode === 'close' ? 2.4 : 1;
        const dir = mode === 'close' ? 1 : -1;
        const base = [[0, 0], [dir * 40, 30], [dir * 120, 30], [dir * 190, 70], [dir * 260, 60]].map(([x, y]) => [S.kx + x * sc + dir * (1 - k2) * 160 * sc, S.ky + y * sc * 0.5]);
        const pts = rot(base, S.kx, S.ky, wig);
        S.wire.setAttribute('d', lt >= wa ? inkPath(pts, { w: mode === 'close' ? 16 : 8, seed: sd + 10, t }) : '');
        S.wireL.setAttribute('d', '');
      } else {
        const ka = A(cues, P.keys, 0.4), kk = spring(lt, ka, 0.6), jig = lt > ka ? Math.sin(lt * 9) * 10 : 0;
        S.keys.style.display = lt >= ka ? '' : 'none';
        S.keys.setAttribute('transform', `translate(${f1(S.kx)} ${f1(S.ky)}) rotate(${f1(jig)}) scale(${(0.8 * Math.max(0.01, kk)).toFixed(3)})`);
        S.wire.setAttribute('d', ''); S.wireL.setAttribute('d', '');
      }
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_club
  SH.lk_club = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 361, root = el(svg, 'g'), k = K(), sh = window.TZ.Shapes(), G = H * 0.86;
    for (let i = 0; i < 16; i++) sh.add(root, [[i * W / 15, H * 0.04], [i * W / 15, H * 0.5]], { stroke: mix(INK.green, INK.paperDark, 0.6), w: 10, closed: false });
    sh.add(root, R(-20, H * 0.5, W + 20, G), { fill: k.WDD, stroke: INK.ink, w: 6 });
    for (let i = 0; i < 8; i++) sh.add(root, R(i * W / 8 + 20, H * 0.55, (i + 1) * W / 8 - 20, H * 0.8), { stroke: mix(k.WDD, INK.ink, 0.4), w: 4 });
    // portrait
    sh.add(root, R(W * 0.06, H * 0.1, W * 0.2, H * 0.42), { fill: INK.gold, stroke: INK.ink, w: 6 });
    sh.add(root, R(W * 0.075, H * 0.13, W * 0.185, H * 0.39), { fill: mix(INK.inkSoft, INK.paperDark, 0.4), stroke: INK.ink, w: 4 });
    sh.add(root, ell(W * 0.13, H * 0.22, 38, 46, 14), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
    sh.add(root, [[W * 0.09, H * 0.39], [W * 0.1, H * 0.3], [W * 0.16, H * 0.3], [W * 0.17, H * 0.39]], { fill: INK.ink });
    // fireplace
    sh.add(root, R(W * 0.25, H * 0.42, W * 0.45, G), { fill: mix(INK.paperLight, INK.paperDark, 0.5), stroke: INK.ink, w: 7 });
    sh.add(root, R(W * 0.23, H * 0.4, W * 0.47, H * 0.45), { fill: k.WD, stroke: INK.ink, w: 6 });
    sh.add(root, R(W * 0.29, H * 0.55, W * 0.41, G), { fill: INK.ink });
    const fl = [inkEl(root, INK.red), inkEl(root, INK.gold)];
    // armchair (the critic sits in front of it)
    sh.add(root, [[W * 0.52, G], [W * 0.52, H * 0.46], [W * 0.56, H * 0.42], [W * 0.68, H * 0.42], [W * 0.72, H * 0.46], [W * 0.72, G]], { fill: INK.red, stroke: INK.ink, w: 7, smooth: true });
    sh.add(root, R(W * 0.5, H * 0.66, W * 0.74, H * 0.74), { fill: mix(INK.red, INK.ink, 0.25), stroke: INK.ink, w: 6 });
    const paper = el(root, 'g');
    sh.add(paper, R(-190, -130, 190, 130), { fill: INK.paperLight, stroke: INK.ink, w: 6 });
    sh.add(paper, [[0, -120], [0, 120]], { stroke: INK.inkSoft, w: 3, closed: false });
    tx(paper, P.headline || '16 DAYS?', 0, -70, 64, { fill: INK.red });
    for (let i = 0; i < 4; i++) for (const s of [-1, 1]) sh.add(paper, [[s * 20, -10 + i * 30], [s * 170, -10 + i * 30]], { stroke: INK.inkSoft, w: 4, closed: false });
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt; sh.update(t, lt);
      flame(fl[0], W * 0.35, G - 10, 70, 120, lt, sd + 1, t); flame(fl[1], W * 0.35, G - 10, 40, 80, lt, sd + 2, t, 1.1);
      const wa = A(cues, P.wave, 0.3), w = lt >= wa ? Math.sin(lt * 7) * 8 : 0;
      paper.setAttribute('transform', `translate(${f1(W * 0.62)} ${f1(H * 0.42)}) rotate(${f1(w - 4)}) scale(${(1 + 0.06 * punch(lt, wa)).toFixed(3)})`);
      com.update(lt, t, cues);
    } };
  } };
})();
