// gears: ancient bronze gear-work in parchment ink (brand/kit/BRAND.md §5), made for the Antikythera mechanism.
//   mode "lump"    — a corroded bronze lump (paper-dark, hatching, green verdigris, cracks) with a faint gear fossil
//                    inside; on cue "reveal" a magnifying lens slides over it and shows the gear crisp and turning.
//                    Optional museum table under it (table: true).
//   mode "machine" — open wooden case with a meshing gear train (correct speed ratios) driven by a turning crank;
//                    sun pointer on the big wheel (cue "sun"), moon ball with its phase on the small fast gear (cue "moon").
//   mode "eclipse" — the front dial: zodiac ring, sun pointer, the moon travelling round with its phase; on cue
//                    "eclipse" the (new) moon covers the sun: dark disc, gold corona, punch. Gears turn behind the dial.
// P: {mode: "lump"|"machine"|"eclipse", table: false, size: 1, x: 0.5, y: 0.37 (lump centre, 0..1 W/H),
//     lens: {x: 0.55, y: 0.36} (lump: lens rest point, 0..1 W/H),
//     label: {text, x: 0.5, y: 0.2, at, size: 84, color: "ink"|"red"},
//     cast: [{who: "kasif"|name, accessory, beard, x: 0.8, y: 0.6 (ground, 0..1 H), scale: 0.62, pose: "idle", at,
//             then: "shock", face: "left"|"right", dir: "up"|"down"|deg, emotion}],
//     zoom: 1.08 (slow push-in), focus: [0.5, 0.4],
//     machine: drive: 0 (cast index whose hand works the crank lever), box: [x, y, w, h] (case), shift: [dx, dy] (gear train), sun_r: 54, moon_r: 52, moon_on: 2 (gear index),
//     eclipse/dial: travel: 1.6 (radians the moon covers before the eclipse cue)}
// SHOTS.dial = gears with mode "eclipse" (the front dial as its own shot type).
// cues: reveal (lump lens), sun, moon (machine), eclipse, label "at", cast "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };

  // gear outline: pitch radius r, n teeth, module m (tooth height ~ 2.2 m), rotation a
  function gearPts(cx, cy, r, n, a, m) {
    const ro = r + m, rr = r - 1.2 * m, pts = [];
    for (let i = 0; i < n; i++) {
      const b = a + i / n * Math.PI * 2, s = Math.PI * 2 / n;
      const P = (rad, ang) => [cx + Math.cos(ang) * rad, cy + Math.sin(ang) * rad];
      pts.push(P(rr, b), P(rr, b + s * 0.12), P(ro, b + s * 0.25), P(ro, b + s * 0.5), P(rr, b + s * 0.63));
    }
    return pts;
  }
  const circ = (cx, cy, r, n = 28) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

  // draws one gear into {fill, ink, soft} path strings
  function gearD(G, a, t, sd, k = 1) {
    const { x, y, r, n, m } = G;
    const pts = gearPts(x, y, r, n, a, m);
    let fill = inkLoop(pts, { seed: sd, t, amp: 1.2 * k, smooth: false });
    let ink = inkPath(pts, { seed: sd, t, closed: true, w: 5 * k, amp: 1.2 * k, smooth: false });
    const hole = r * 0.72;
    if (r > 60) {   // rim + 4 spokes + hub
      ink += ' ' + inkPath(circ(x, y, hole, 24), { seed: sd + 1, t, closed: true, w: 4 * k, amp: 1 });
      for (let s = 0; s < 4; s++) {
        const b = a + s * Math.PI / 2 + 0.3, c = Math.cos(b), si = Math.sin(b), o = r * 0.07;
        for (const sg of [-1, 1]) ink += ' ' + inkPath([[x + c * r * 0.2 - si * o * sg, y + si * r * 0.2 + c * o * sg], [x + c * hole - si * o * sg, y + si * hole + c * o * sg]], { seed: sd + 3 + s * 2 + (sg + 1), t, w: 3.5 * k, amp: 0.8 });
      }
    }
    ink += ' ' + inkPath(circ(x, y, Math.max(10, r * 0.16), 14), { seed: sd + 20, t, closed: true, w: 4 * k, amp: 0.8 });
    return { fill, ink, holeD: r > 60 ? hole : 0 };
  }

  // moon ball with phase: e = elongation from the sun (0 = new, PI = full)
  function moonD(cx, cy, r, e) {
    e = ((e % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const waxing = e < Math.PI, c = Math.cos(e), rx = Math.abs(c) * r, sx = waxing ? 1 : -1;
    // lit half on the side facing the sun-direction (right while waxing, left while waning)
    const top = `${f1(cx)} ${f1(cy - r)}`, bot = `${f1(cx)} ${f1(cy + r)}`;
    const outer = `M${top} A${f1(r)} ${f1(r)} 0 0 ${sx > 0 ? 1 : 0} ${bot}`;
    // terminator: bulges toward the lit side when gibbous (c < 0), toward the dark side when crescent
    const sweep = (c > 0) === (sx > 0) ? 1 : 0;
    return outer + ` A${f1(Math.max(0.5, rx))} ${f1(r)} 0 0 ${sweep} ${top} Z`;
  }

  SH.gears = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, mode = P.mode || 'lump', sd0 = seed * 1000;
      const cam = el(svg, 'g');
      const back = el(cam, 'g'), mid = el(cam, 'g'), front = el(cam, 'g');
      const mk = (g, fill, extra = {}) => inkEl(g, fill, extra);
      const S = {};      // scene objects

      if (mode === 'lump') {
        const sz = P.size ?? 1, cx = (P.x ?? 0.5) * W, cy = (P.y ?? (portrait ? 0.37 : 0.48)) * H, rx = (portrait ? 330 : 300) * sz, ry = (portrait ? 270 : 240) * sz;
        const r = rng(seed * 31 + 7), pts = [];
        for (let i = 0; i < 20; i++) {
          const a = i / 20 * Math.PI * 2, k = 1 + (r() * 2 - 1) * 0.11 + (i % 5 === 2 ? -0.1 : 0);
          pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
        }
        S.lump = { cx, cy, rx, ry, pts };
        if (P.table) {
          const ty = cy + ry * 0.95;
          S.table = { ty, top: mk(back, INK.paperLight), ink: mk(back), legs: [[cx - rx * 1.25, ty], [cx + rx * 1.25, ty]] };
        }
        S.shadow = mk(back, INK.inkSoft, { 'fill-opacity': 0.22 });
        S.fill = mk(mid, INK.paperDark);
        // clip everything inside the lump
        const cid = 'lumpclip' + seed;
        const cp = el(defs, 'clipPath', { id: cid });
        S.clipPath = el(cp, 'path', { d: inkLoop(pts, { seed: sd0 + 1, t: 0, amp: 0 }) });
        const inner = el(mid, 'g', { 'clip-path': `url(#${cid})` });
        S.hatch = mk(inner, INK.inkSoft, { 'fill-opacity': 0.55 });
        S.verd = mk(inner, INK.green, { 'fill-opacity': 0.32 });
        S.fossil = mk(inner, INK.inkSoft, { 'fill-opacity': 0.75 });
        S.fossilFill = mk(inner, INK.gold, { 'fill-opacity': 0.22 });
        S.cracks = mk(inner);
        S.outline = mk(mid);
        S.gear = { x: cx - rx * 0.12, y: cy + ry * 0.04, r: Math.min(rx, ry) * 0.62, n: 44, m: 9 };
        S.gear2 = { x: 0, y: 0, r: S.gear.r * 0.36, n: 16, m: 9 };
        const hs = []; const rh = rng(seed * 17 + 3);
        for (let i = 0; i < 26; i++) { const x = cx - rx + rh() * rx * 2, y = cy - ry + rh() * ry * 2, L = 30 + rh() * 50; hs.push([[x, y], [x + L, y - L * 0.6]]); }
        S.hs = hs;
        const vs = []; for (let i = 0; i < 6; i++) { const a = rh() * 6.28, d = 0.45 + rh() * 0.45; vs.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 26 + rh() * 40]); }
        S.vs = vs;
        S.crackL = [[[cx - rx * 0.9, cy - ry * 0.2], [cx - rx * 0.55, cy - ry * 0.05], [cx - rx * 0.4, cy - ry * 0.3], [cx - rx * 0.1, cy - ry * 0.25]],
          [[cx + rx * 0.2, cy + ry * 0.85], [cx + rx * 0.3, cy + ry * 0.5], [cx + rx * 0.6, cy + ry * 0.45]],
          [[cx + rx * 0.5, cy - ry * 0.85], [cx + rx * 0.45, cy - ry * 0.5], [cx + rx * 0.75, cy - ry * 0.3]]];
        // lens
        const lid = 'lensclip' + seed;
        const lc = el(defs, 'clipPath', { id: lid });
        S.lensCircle = el(lc, 'circle', { cx: 0, cy: 0, r: 1 });
        S.lensG = el(front, 'g');
        S.lensBg = mk(S.lensG, INK.paperLight);
        const lin = el(S.lensG, 'g', { 'clip-path': `url(#${lid})` });
        S.lgFill = mk(lin, INK.gold, { 'fill-opacity': 0.55 });
        S.lgInk = mk(lin);
        S.lensRing = mk(S.lensG);
        S.handle = mk(S.lensG, INK.hat);
        S.handleInk = mk(S.lensG);
        S.glint = mk(S.lensG, INK.paperLight);
      }

      if (mode === 'machine') {
        const m = 7, ox = 0, oy = portrait ? 0 : -60;
        const G0 = { x: 330 + ox, y: 610 + oy, n: 56, m }; G0.r = m * G0.n / 2;
        const place = (A, n, ang) => { const r = m * n / 2, d = A.r + r, a = ang * Math.PI / 180; return { x: A.x + Math.cos(a) * d, y: A.y + Math.sin(a) * d, n, m, r, A, ang: a }; };
        const G1 = place(G0, 20, -15), G2 = place(G1, 40, 50), G3 = place(G2, 16, -40);
        S.gs = [G0, G1, G2, G3];
        if (!portrait) S.gs.forEach(G => { G.x += 380; });
        if (P.shift) S.gs.forEach(G => { G.x += P.shift[0]; G.y += P.shift[1]; });
        S.box = P.box || (portrait ? [80, 300, 920, 760] : [560, 140, 960, 760]);
        S.boxFill = mk(back, INK.paperLight); S.boxInk = mk(back); S.boxGrain = mk(back, INK.inkSoft, { 'fill-opacity': 0.6 });
        S.gF = S.gs.map(() => mk(mid, INK.gold, { 'fill-opacity': 0.5 }));
        S.gI = S.gs.map(() => mk(mid));
        S.crank = mk(front); S.knob = mk(front, INK.hat); S.knobInk = mk(front);
        S.sunRod = mk(front); S.sunF = mk(front, INK.gold); S.sunI = mk(front);
        S.moonRod = mk(front); S.moonBg = mk(front, INK.inkSoft); S.moonLit = mk(front, INK.paperLight); S.moonI = mk(front);
        S.motion = mk(front, INK.inkSoft, { 'fill-opacity': 0.8 });
      }

      if (mode === 'eclipse') {
        const cx = portrait ? 590 : W * 0.56, cy = portrait ? 690 : H * 0.47, R = portrait ? 310 : 290;
        S.d = { cx, cy, R };
        S.bg = [{ x: cx - R * 1.05, y: cy - R * 0.85, r: 120, n: 30, m: 8 }, { x: cx + R * 0.95, y: cy + R * 0.9, r: 100, n: 25, m: 8 }];
        S.bgF = S.bg.map(() => mk(back, INK.gold, { 'fill-opacity': 0.4 }));
        S.bgI = S.bg.map(() => mk(back));
        S.plate = mk(mid, INK.paperLight); S.plateInk = mk(mid); S.ticks = mk(mid, INK.inkSoft);
        S.band = mk(mid, INK.paperDark, { 'fill-opacity': 0.55 });
        S.glyph = mk(mid, INK.inkSoft, { 'fill-opacity': 0.9 });
        S.corona = mk(front, INK.gold);
        S.sunRod = mk(front); S.sunF = mk(front, INK.gold); S.sunI = mk(front);
        S.moonRod = mk(front); S.moonBg = mk(front, INK.inkSoft); S.moonLit = mk(front, INK.paperLight); S.moonI = mk(front);
        S.hub = mk(front, INK.hat); S.hubI = mk(front);
      }

      // label
      let label = null;
      if (P.label && P.label.text) {
        const L = P.label, size = L.size || (portrait ? 84 : 66);
        const g = el(front, 'g');
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: L.color === 'red' ? INK.red : INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        tx.textContent = L.text;
        label = { L, g, tx, u: mk(g, L.color === 'red' ? INK.red : INK.ink), size };
      }
      // cast
      const castG = el(cam, 'g');            // inside the camera: the cast moves with the push-in (crank hand stays on its knob)
      const cast = (P.cast || []).map((c, i) => {
        const isK = (c.who || 'kasif') === 'kasif';
        const rig = KASIF.create(el(castG, 'g'), { scale: c.scale ?? (portrait ? 0.62 : 0.55), hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: seed + i * 7 + 3 });
        return { c, rig };
      });

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const z = lerp(1, P.zoom ?? 1.08, progIO(lt, 0, Math.max(1, dur)));
          const [fx, fy] = (P.focus || [0.5, portrait ? 0.38 : 0.48]);
          const pin = spring(lt, 0, 0.7);
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5 + (1 - pin) * 40)}) translate(${f1(fx * W)} ${f1(fy * H)}) scale(${z.toFixed(4)}) translate(${f1(-fx * W)} ${f1(-fy * H)})`);

          if (mode === 'lump') {
            const L = S.lump, rv = atOr(cues, 'reveal', dur * 0.35), pr = spring(lt, rv, 0.8), hit = punch(lt, rv);
            const bob = Math.sin(t * 1.3) * 6, tilt = Math.sin(t * 0.7) * 1.5;
            mid.setAttribute('transform', `translate(0 ${f1(bob)}) rotate(${f1(tilt)} ${f1(L.cx)} ${f1(L.cy)}) translate(${f1(L.cx)} ${f1(L.cy)}) scale(${(1 + hit * 0.06).toFixed(4)}) translate(${f1(-L.cx)} ${f1(-L.cy)})`);
            if (S.table) {
              const T = S.table, x0 = L.cx - L.rx * (P.table_w ?? 1.45), x1 = L.cx + L.rx * (P.table_w ?? 1.45), ty = T.ty, th = 40;
              const top = [[x0, ty], [x1, ty], [x1 + 20, ty + th], [x0 - 20, ty + th]], legH = P.table_h ?? 190;
              T.top.setAttribute('d', inkLoop(top, { seed: sd + 90, t, smooth: false }));
              let d = inkPath(top, { seed: sd + 90, t, closed: true, w: 5, smooth: false });
              for (const xx of [x0 + 30, x1 - 30]) d += ' ' + inkPath([[xx, ty + th], [xx + (xx < L.cx ? -14 : 14), ty + th + legH]], { seed: sd + 91 + xx, t, w: 7 });
              T.ink.setAttribute('d', d);
            }
            S.shadow.setAttribute('d', inkLoop(inkEllipsePts(L.cx + 10, L.cy + L.ry * 0.95, L.rx * 0.9, 34, seed, 12), { seed: sd + 2, t, amp: 1 }));
            S.fill.setAttribute('d', inkLoop(L.pts, { seed: sd + 1, t, amp: 2 }));
            S.outline.setAttribute('d', inkPath(L.pts, { seed: sd + 1, t, closed: true, w: 7, amp: 2 }));
            S.hatch.setAttribute('d', S.hs.map((h, i) => inkPath(h, { seed: sd + 100 + i, t, w: 3, amp: 1 })).join(' '));
            S.verd.setAttribute('d', S.vs.map(([x, y, rr], i) => inkLoop(inkEllipsePts(x, y, rr, rr * 0.7, seed + i, 9, i, 0.2), { seed: sd + 140 + i, t, amp: 1.5 })).join(' '));
            const G = S.gear, ga = t * 0.25;
            const fg = gearD(G, ga, t, sd + 200, 0.8);
            S.fossil.setAttribute('d', fg.ink);
            S.fossilFill.setAttribute('d', fg.fill);
            S.cracks.setAttribute('d', S.crackL.map((c, i) => inkPath(c, { seed: sd + 160 + i, t, w: 5, amp: 1.5 })).join(' '));
            // lens: slides in from the lower right on "reveal", then circles slowly over the gear
            const lr = Math.min(L.rx, L.ry) * 0.62;
            const rest = P.lens ? [P.lens.x * W, P.lens.y * H] : [G.x + lr * 0.35, G.y - lr * 0.15];
            const lx = lerp(W + lr * 1.6, rest[0] + Math.sin(t * 0.8) * 22, pr), ly = lerp(L.cy + L.ry * 1.6, rest[1] + Math.cos(t * 0.7) * 16, pr);
            S.lensG.style.display = lt < rv - 0.01 ? 'none' : '';
            if (lt >= rv - 0.01) {
              S.lensCircle.setAttribute('cx', f1(lx)); S.lensCircle.setAttribute('cy', f1(ly)); S.lensCircle.setAttribute('r', f1(lr));
              S.lensBg.setAttribute('d', inkLoop(circ(lx, ly, lr, 26), { seed: sd + 300, t, amp: 1 }));
              const spin = t * 0.9 + (lt - rv) * 0.6;
              // magnified gear: same gear 1.25x around the lens centre so it reads as "inside" the lump
              // magnified gear train inside the glass: teeth clearly visible, a second gear meshing at the edge
              const mm = Math.max(7, lr * 0.05);
              const MG = { x: lx - lr * 0.22, y: ly - lr * 0.12, n: 30, m: mm }; MG.r = mm * MG.n / 2;
              const a2 = Math.PI * 0.3, n2 = 14, r2 = mm * n2 / 2;
              const G2 = { x: MG.x + Math.cos(a2) * (MG.r + r2), y: MG.y + Math.sin(a2) * (MG.r + r2), r: r2, n: n2, m: mm };
              const g1 = gearD(MG, spin, t, sd + 320, 1.1);
              const g2 = gearD(G2, a2 + Math.PI - (spin - a2) * MG.n / n2 + Math.PI / n2, t, sd + 360, 1.1);
              S.lgFill.setAttribute('d', g1.fill + ' ' + g2.fill);
              S.lgInk.setAttribute('d', g1.ink + ' ' + g2.ink);
              S.lensRing.setAttribute('d', inkPath(circ(lx, ly, lr, 26), { seed: sd + 300, t, closed: true, w: 14, amp: 1.2 }));
              const ha = Math.PI * 0.28, h0 = [lx + Math.cos(ha) * (lr + 6), ly + Math.sin(ha) * (lr + 6)], h1 = [lx + Math.cos(ha) * (lr + 200), ly + Math.sin(ha) * (lr + 200)];
              const nx = -Math.sin(ha) * 22, ny = Math.cos(ha) * 22;
              const hq = [[h0[0] + nx, h0[1] + ny], [h1[0] + nx, h1[1] + ny], [h1[0] - nx, h1[1] - ny], [h0[0] - nx, h0[1] - ny]];
              S.handle.setAttribute('d', inkLoop(hq, { seed: sd + 380, t, smooth: false }));
              S.handleInk.setAttribute('d', inkPath(hq, { seed: sd + 380, t, closed: true, w: 5, smooth: false }));
              S.glint.setAttribute('d', inkPath([[lx - lr * 0.62, ly - lr * 0.2], [lx - lr * 0.5, ly - lr * 0.5], [lx - lr * 0.2, ly - lr * 0.64]], { seed: sd + 390, t, w: 10, amp: 0.8 }));
            }
          }

          if (mode === 'machine') {
            const [bx, by, bw, bh] = S.box;
            const box = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]];
            S.boxFill.setAttribute('d', inkLoop(box, { seed: sd + 10, t, smooth: false }));
            let bi = inkPath(box, { seed: sd + 10, t, closed: true, w: 7, smooth: false }) + ' ' + inkPath([[bx + 22, by + 22], [bx + bw - 22, by + 22], [bx + bw - 22, by + bh - 22], [bx + 22, by + bh - 22]], { seed: sd + 11, t, closed: true, w: 3, smooth: false });
            S.boxInk.setAttribute('d', bi);
            let gr = ''; for (let i = 0; i < 7; i++) { const y = by + 60 + i * (bh - 120) / 6; gr += inkPath([[bx + 40, y], [bx + bw * 0.3, y + 6], [bx + bw * 0.6, y - 4], [bx + bw - 40, y + 3]], { seed: sd + 20 + i, t, w: 2, amp: 1 }) + ' '; }
            S.boxGrain.setAttribute('d', gr);
            // drive: crank turns G0, the train follows with the right ratios
            const w0 = 0.55, a0 = t * w0 + lt * 0.1;
            const ang = [a0];
            for (let i = 1; i < S.gs.length; i++) {
              const G = S.gs[i], A = G.A, aA = ang[i - 1];
              ang.push(G.ang + Math.PI - (aA - G.ang) * A.n / G.n + Math.PI / G.n);
            }
            S.gs.forEach((G, i) => { const d = gearD(G, ang[i], t, sd + 400 + i * 50); S.gF[i].setAttribute('d', d.fill); S.gI[i].setAttribute('d', d.ink); });
            const G0 = S.gs[0], ca = -a0 * 1.0, cl = G0.r * 0.95;
            S.crankAt = ce => {
              S.crank.setAttribute('d', inkPath([[G0.x, G0.y], ce], { seed: sd + 600, t, w: 16, amp: 1 }));
              S.knob.setAttribute('d', inkLoop(circ(ce[0], ce[1], 30, 12), { seed: sd + 601, t, amp: 1 }));
              S.knobInk.setAttribute('d', inkPath(circ(ce[0], ce[1], 30, 12), { seed: sd + 601, t, closed: true, w: 5, amp: 1 }));
            };
            if (P.drive == null) S.crankAt([G0.x + Math.cos(ca + Math.PI) * cl, G0.y + Math.sin(ca + Math.PI) * cl]);
            let mo = ''; for (let k = 1; k <= 3; k++) { const aa = ca + Math.PI - k * 0.22, rr = cl + 46; mo += inkPath([[G0.x + Math.cos(aa) * rr, G0.y + Math.sin(aa) * rr], [G0.x + Math.cos(aa - 0.14) * rr, G0.y + Math.sin(aa - 0.14) * rr]], { seed: sd + 610 + k, t, w: 5, amp: 0.8 }) + ' '; }
            S.motion.setAttribute('d', mo);
            // sun pointer on G0, moon on G3
            const sa = atOr(cues, 'sun', dur * 0.3), ps = spring(lt, sa, 0.6), hs = punch(lt, sa);
            if (lt >= sa) {
              const r0 = G0.r * 0.55 * ps, sx = G0.x + Math.cos(a0 * 0.5 - 1.2) * r0, sy = G0.y + Math.sin(a0 * 0.5 - 1.2) * r0, R = (P.sun_r ?? 54) * (1 + hs * 0.25) * ps;
              S.sunRod.setAttribute('d', inkPath([[G0.x, G0.y], [sx, sy]], { seed: sd + 620, t, w: 9, amp: 0.8 }));
              S.sunF.setAttribute('d', inkLoop(circ(sx, sy, R, 16), { seed: sd + 621, t, amp: 1 }));
              let si = inkPath(circ(sx, sy, R, 16), { seed: sd + 621, t, closed: true, w: 5, amp: 1 });
              for (let k = 0; k < 10; k++) { const b = k / 10 * 6.283 + t * 0.6; si += ' ' + inkPath([[sx + Math.cos(b) * (R + 10), sy + Math.sin(b) * (R + 10)], [sx + Math.cos(b) * (R + 28), sy + Math.sin(b) * (R + 28)]], { seed: sd + 630 + k, t, w: 5, amp: 0.8 }); }
              S.sunI.setAttribute('d', si);
            } else { S.sunRod.setAttribute('d', ''); S.sunF.setAttribute('d', ''); S.sunI.setAttribute('d', ''); }
            const ma = atOr(cues, 'moon', dur * 0.55), pm = spring(lt, ma, 0.6), hm = punch(lt, ma);
            if (lt >= ma) {
              const mi = P.moon_on ?? 2, G3 = S.gs[mi], r3 = G3.r * 0.58 * pm, aa = ang[mi] * 0.6 - 0.8;
              const mx = G3.x + Math.cos(aa) * r3, my = G3.y + Math.sin(aa) * r3, R = (P.moon_r ?? 52) * (1 + hm * 0.3) * pm;
              S.moonRod.setAttribute('d', inkPath([[G3.x, G3.y], [mx, my]], { seed: sd + 650, t, w: 8, amp: 0.8 }));
              S.moonBg.setAttribute('d', inkLoop(circ(mx, my, R, 14), { seed: sd + 651, t, amp: 0.8 }));
              S.moonLit.setAttribute('d', moonD(mx, my, R, t * 0.9 + 1.2));
              S.moonI.setAttribute('d', inkPath(circ(mx, my, R, 14), { seed: sd + 651, t, closed: true, w: 5, amp: 0.8 }));
            } else { S.moonRod.setAttribute('d', ''); S.moonBg.setAttribute('d', ''); S.moonLit.setAttribute('d', ''); S.moonI.setAttribute('d', ''); }
          }

          if (mode === 'eclipse') {
            const { cx, cy, R } = S.d;
            S.bg.forEach((G, i) => { const d = gearD(G, t * (i ? -0.5 : 0.42), t, sd + 700 + i * 40); S.bgF[i].setAttribute('d', d.fill); S.bgI[i].setAttribute('d', d.ink); });
            const plate = circ(cx, cy, R, 40), inner = circ(cx, cy, R * 0.78, 36);
            S.plate.setAttribute('d', inkLoop(plate, { seed: sd + 800, t, amp: 1.5 }));
            S.band.setAttribute('d', inkLoop(plate, { seed: sd + 800, t, amp: 1.5 }) + ' ' + inkLoop(inner.slice().reverse(), { seed: sd + 801, t, amp: 1.2 }));
            S.plateInk.setAttribute('d', inkPath(plate, { seed: sd + 800, t, closed: true, w: 8, amp: 1.5 }) + ' ' + inkPath(inner, { seed: sd + 801, t, closed: true, w: 4, amp: 1.2 }) + ' ' + inkPath(circ(cx, cy, R * 0.92, 36), { seed: sd + 802, t, closed: true, w: 2.5, amp: 1 }));
            let tk = '', gl = '';
            for (let k = 0; k < 72; k++) { const a = k / 72 * 6.2832, l = k % 6 === 0 ? 0.8 : 0.86; tk += inkPath([[cx + Math.cos(a) * R * l, cy + Math.sin(a) * R * l], [cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92]], { seed: sd + 810 + k, t, w: k % 6 === 0 ? 4 : 2.5, amp: 0.6 }) + ' '; }
            for (let k = 0; k < 12; k++) { const a = (k + 0.5) / 12 * 6.2832, gx = cx + Math.cos(a) * R * 0.96, gy = cy + Math.sin(a) * R * 0.96; gl += inkDot(gx, gy, 9, 9, seed + k, t) + ' '; }
            S.ticks.setAttribute('d', tk); S.glyph.setAttribute('d', gl);
            // sun fixed (upper right), moon travels toward it and covers it on "eclipse"
            const ea = atOr(cues, 'eclipse', dur * 0.6), sunA = -Math.PI * 0.32, rr = R * 0.62;
            const travel = P.travel ?? 1.6;                                  // radians the moon still has to go before the eclipse
            const u = clamp01(lt / Math.max(0.3, ea));
            const moonA = lt < ea ? sunA - travel * (1 - EASE_IO(u)) : sunA;
            const sx = cx + Math.cos(sunA) * rr, sy = cy + Math.sin(sunA) * rr, mx = cx + Math.cos(moonA) * rr * 0.98, my = cy + Math.sin(moonA) * rr * 0.98;
            const after = lt >= ea, hit = punch(lt, ea, 0.8), Rs = 58 * (1 + hit * 0.18);
            S.sunRod.setAttribute('d', inkPath([[cx, cy], [cx + Math.cos(sunA) * (rr - Rs), cy + Math.sin(sunA) * (rr - Rs)]], { seed: sd + 900, t, w: 9, amp: 0.8 }));
            S.sunF.setAttribute('fill', INK.gold);
            S.sunF.setAttribute('d', inkLoop(circ(sx, sy, Rs, 18), { seed: sd + 901, t, amp: 1 }));
            let si = inkPath(circ(sx, sy, Rs, 18), { seed: sd + 901, t, closed: true, w: 5, amp: 1 });
            if (!after) for (let k = 0; k < 12; k++) { const b = k / 12 * 6.283 + t * 0.5; si += ' ' + inkPath([[sx + Math.cos(b) * (Rs + 10), sy + Math.sin(b) * (Rs + 10)], [sx + Math.cos(b) * (Rs + 30), sy + Math.sin(b) * (Rs + 30)]], { seed: sd + 910 + k, t, w: 5, amp: 0.8 }); }
            S.sunI.setAttribute('d', si);
            // corona after the eclipse: long gold flames around the dark disc
            if (after) {
              const pc = spring(lt, ea, 0.7); let co = '';
              for (let k = 0; k < 18; k++) { const b = k / 18 * 6.283 + Math.sin(t * 2 + k) * 0.05, L = (Rs + 14 + (k % 2 ? 44 : 70) * pc); co += inkPath([[sx + Math.cos(b - 0.08) * (Rs + 4), sy + Math.sin(b - 0.08) * (Rs + 4)], [sx + Math.cos(b) * L, sy + Math.sin(b) * L], [sx + Math.cos(b + 0.08) * (Rs + 4), sy + Math.sin(b + 0.08) * (Rs + 4)]], { seed: sd + 940 + k, t, w: 7, amp: 1, smooth: false }) + ' '; }
              S.corona.setAttribute('d', co);
            } else S.corona.setAttribute('d', '');
            const Rm = after ? Rs * 0.96 : 50;
            S.moonRod.setAttribute('d', after ? '' : inkPath([[cx, cy], [cx + Math.cos(moonA) * (rr * 0.98 - Rm), cy + Math.sin(moonA) * (rr * 0.98 - Rm)]], { seed: sd + 960, t, w: 7, amp: 0.8 }));
            S.moonBg.setAttribute('fill', after ? INK.ink : INK.inkSoft);
            S.moonBg.setAttribute('d', inkLoop(circ(mx, my, Rm, 16), { seed: sd + 961, t, amp: 0.8 }));
            S.moonLit.setAttribute('d', after ? '' : moonD(mx, my, Rm, moonA - sunA));
            S.moonI.setAttribute('d', inkPath(circ(mx, my, Rm, 16), { seed: sd + 961, t, closed: true, w: 5, amp: 0.8 }));
            S.hub.setAttribute('d', inkLoop(circ(cx, cy, 26, 10), { seed: sd + 980, t, amp: 0.8 }));
            S.hubI.setAttribute('d', inkPath(circ(cx, cy, 26, 10), { seed: sd + 980, t, closed: true, w: 5, amp: 0.8 }));
            mid.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${(1 + hit * 0.05).toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
            front.setAttribute('transform', mid.getAttribute('transform'));
          }

          if (label) {
            const L = label.L, at = atOr(cues, L.at, dur * 0.5), p = spring(lt, at, 0.6);
            const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.2) * H;
            label.g.style.display = lt < at ? 'none' : '';
            label.tx.setAttribute('x', x); label.tx.setAttribute('y', y);
            const tw = label.tx.getComputedTextLength ? label.tx.getComputedTextLength() : 300;
            label.u.setAttribute('d', inkPath([[x - tw / 2, y + 18], [x + tw / 2, y + 12]], { seed: sd + 990, t, w: 6 }));
            label.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(-3)}) scale(${lerp(0.6, 1, p).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
          }
          cast.forEach(({ c, rig }, ci) => {
            const at = atOr(cues, c.at, null), x = (c.x ?? 0.8) * W, y = (c.y ?? (portrait ? 0.6 : 0.9)) * H;
            if (mode === 'machine' && P.drive === ci) {      // this member works the crank lever: hand on the knob
              const dir = (c.dir_base ?? 62) + Math.sin(t * 2.4) * 18, s = (c.scale ?? 0.62) * 1, face = c.face === 'left' ? -1 : 1;
              const out = rig.update(t, 'point', { x, y, face, since: 1, dir, emotion: c.emotion || 'happy' });
              if (out && out.hands) { const h = out.hands[1]; S.crankAt([x + face * s * h[0], y + s * h[1]]); }
              return;
            }
            const after = at != null && lt >= at, pose = after ? (c.then || 'shock') : (c.pose || 'idle');
            const since = after ? lt - at : lt, dir = typeof c.dir === 'number' ? c.dir : DIRS[c.dir] ?? 20;
            const emo = after ? (c.emotion || (pose === 'shock' ? 'surprised' : null)) : (c.emotion0 || null);
            const o = { x, y, face: c.face === 'left' ? -1 : 1, since, dir, emotion: emo, text: c.text, item: c.item };
            if (after && since < 0.32) { o.prev = { pose: c.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
            rig.update(t, pose, o);
          });
        },
      };
    },
  };
  // dial: the front dial with the eclipse (same drawing as gears mode "eclipse", its own shot name)
  SH.dial = { kind: '2d', build(ctx) { return SH.gears.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: 'eclipse' }) })); } };
})();
