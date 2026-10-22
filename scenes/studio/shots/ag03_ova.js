// ag03_ova: the Malazgirt plain seen from the side, in the parchment ink style (brand/kit/BRAND.md §3, §5): far
// rolling hills with extinct volcano cones, a grassy ground line, distant tent camps (Byzantine red / Seljuk blue
// pennants), big pavilion tents, campfires, sun (moving), or night (hatched sky, stars, crescent moon), ink horses with
// riders (period figures with one accessory, a flag, a bow or a lance; they gallop along cue-bound moves, turn round,
// look back), standing figures (Kaşif rigs: robe, spear, sword that can drop, bow the head), dust clouds, arrows across
// the sky, a crown on the ground, a big riderless horse whose tail gets tied on a cue, hand-written labels, a red
// ring, a speech bubble and the narrator (Kaşif / fez, can sweat). No real portraits.
// P: {time: "day"|"evening"|"night", ground: 0.86 (y of the ground line, 0..1 H), horizon: 0.6, hills: true,
//     volcano: true | [{x, h}], sun: {x, y, to: [x, y], at, dur} | false, moon: {x, y} (night),
//     camps: [{side: "byz"|"sel", x0, x1, y: 0.6, n: 8, scale: 0.5, fires: false}], tents: [{x, side, scale: 1, y}],
//     fires: [{x, y, scale}], dust: {at, x0, x1, y, n: 7}, arrows: {at, n: 12, dur: 1.6, dir: 1},
//     riders: [{who, side, accessory, beard, robe, x, y, scale: 0.72, face: 1|-1, n: 1, gap: 0.11, flag: "white"|"red"|
//       "blue", weapon: "bow"|"lance", armor: true, pose, dir, emotion, seq: [{at, pose, dir, emotion, look: true}],
//       moves: [{at, x, dur: 2, face}], appear: cue}],
//     cast: [{who, accessory, beard, robe: "white", x, y, scale: 0.72, face, pose, dir, emotion, seq: [...],
//       moves: [{at, x, dur}], spear: true, raise: cue (spear goes up), sword: true, drop: cue, bow: cue, appear: cue}],
//     horse: {x, y, scale: 1.1, face: 1, knot: cue} (riderless horse, tail tied on the cue),
//     crown: {x, y, at} (crown lying on the ground), ring: {x, y, r: 120, at} (red ring),
//     label: {text, x, y, at, size: 64, color: "ink"|"red"}, note: {...same}, bubble: {text, x, y, at, size: 56},
//     kasif: {x: 0.12, y, scale: 0.8, face: 1, pose, dir, emotion, seq, sweat: cue} | false,
//     cam: {zoom: 1.05, focus: [0.5, 0.6]}, shake: cue}
// cues: whatever names the moves/seq/labels use (hit = camera punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft, white: INK.paperLight, gold: INK.gold, green: INK.green };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);
  const rad = d => d * Math.PI / 180;
  const HSC = 1.45;       // horses are drawn bigger than the big-headed cartoon riders
  const CROWN = [[-56, -50], [-62, -104], [-34, -78], [-14, -118], [6, -80], [30, -120], [46, -80], [66, -106], [60, -50]];

  // pose segments for a rig: base pose then seq entries at their cues
  function segs(K, cues, lt) {
    const L = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
    (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) L.push(Object.assign({}, s, { at: a })); });
    L.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < L.length; j++) if (lt >= L[j].at) i = j;
    const s = L[i], pv = i > 0 ? L[i - 1] : null, since = lt - Math.max(0, s.at);
    const o = { since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : (K.emotion || null)), mouth: 0, seg: s };
    if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
    return { pose: s.pose || 'idle', o };
  }
  // x / face along cue-bound moves
  function track(m, lt, cues, W) {
    let x = m.x * W, face = faceOf(m.face ?? 1), moving = 0, dist = 0;
    (m.moves || []).forEach((v, i) => {
      const a = atOr(cues, v.at, 0.3 + i * 2), d = v.dur ?? 2, p = progIO(lt, a, d);
      if (v.face != null) { const nf = faceOf(v.face); face = lerp(face, nf, progIO(lt, a, 0.35)); }
      if (v.x != null) { const nx = lerp(x, v.x * W, p); dist += Math.abs(nx - x); x = nx; if (lt > a && lt < a + d) moving = 1; }
    });
    return { x, face, moving, dist };
  }

  // one ink horse (facing right in local units, ground y = 0): fill + outline path strings
  function horse(X, Y, s, face, ph, moving, t, sd, opt = {}) {
    const bob = moving ? -Math.abs(Math.sin(ph * Math.PI * 2)) * 10 : Math.sin(t * 2.2) * 1.5;
    const T = (x, y) => [X + x * s * face, Y + (y + (y < -150 ? bob : 0)) * s];
    const Tp = pts => pts.map(p => T(p[0], p[1]));
    const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
    const w = 6.5 * s;
    const body = Tp([[-150, -215], [-122, -262], [-20, -270], [92, -262], [146, -238], [150, -200], [120, -166], [20, -158], [-90, -160], [-146, -182]]);
    const neck = Tp([[96, -252], [126, -322], [158, -380], [196, -380], [182, -332], [158, -232]]);
    const head = Tp([[158, -380], [182, -400], [206, -392], [252, -340], [248, -318], [226, -314], [190, -336], [166, -346]]);
    const ear = Tp([[178, -396], [184, -428], [198, -396]]);
    let fill = inkLoop(body, O(1)) + ' ' + inkLoop(neck, O(2)) + ' ' + inkLoop(head, O(3));
    let ring = inkPath(body, O(4, { closed: true, w })) + ' ' + inkPath(neck.slice(0, 3).concat(neck.slice(3)), O(5, { w: w * 0.9 })) + ' ' + inkPath(head, O(6, { closed: true, w: w * 0.9 })) + ' ' + inkPath(ear, O(7, { w: w * 0.8 }));
    const eye = T(204, -372); ring += ' ' + inkDot(eye[0], eye[1], 5 * s, 5 * s, sd + 8, t);
    const nos = T(240, -328); ring += ' ' + inkDot(nos[0], nos[1], 3.5 * s, 3.5 * s, sd + 9, t);
    // mane
    for (let q = 0; q < 6; q++) {
      const u = q / 5, mx = lerp(170, 104, u), my = lerp(-388, -262, u), fl = moving ? Math.sin(t * 9 + q) * 8 : Math.sin(t * 2 + q) * 3;
      ring += ' ' + inkPath([T(mx, my), T(mx - 30 + fl, my + 14)], O(10 + q, { w: w * 0.6 }));
    }
    // armour (caparison with scale hatching)
    if (opt.armor) {
      const cap = Tp([[-140, -250], [-20, -262], [100, -254], [128, -226], [118, -176], [20, -166], [-100, -168], [-146, -196]]);
      fill += ' ';
      opt.capF = inkLoop(cap, O(20));
      for (let q = 0; q < 5; q++) ring += ' ' + inkPath([T(-120 + q * 52, -240), T(-108 + q * 52, -214), T(-120 + q * 52, -186)], O(21 + q, { w: w * 0.45 }));
      ring += ' ' + inkPath(cap, O(27, { closed: true, w: w * 0.7 }));
    }
    // legs
    const L = [[112, -172, 0, 1], [82, -168, 0.18, 1], [-106, -172, 0.5, -1], [-132, -176, 0.68, -1]];
    L.forEach((l, k) => {
      const sw = moving ? Math.sin((ph + l[2]) * Math.PI * 2) : 0;
      const a1 = rad(sw * 34 * l[3]), bend = rad((moving ? Math.max(0, -Math.cos((ph + l[2]) * Math.PI * 2)) * 50 : 4) * -l[3]);
      const hip = [l[0], l[1] + bob / s * 0];
      const knee = [hip[0] + Math.sin(a1) * 86, hip[1] + Math.cos(a1) * 86];
      const foot = [knee[0] + Math.sin(a1 + bend) * 86, Math.min(0, knee[1] + Math.cos(a1 + bend) * 86)];
      ring += ' ' + inkPath([T(hip[0], hip[1] + 10), T(knee[0], knee[1]), T(foot[0], foot[1])], O(30 + k, { w: w * 0.95 }));
      const hf = T(foot[0] + 6, foot[1] - 4); ring += ' ' + inkDot(hf[0], hf[1], 10 * s, 7 * s, sd + 40 + k, t);
    });
    // tail (swishing) or tied in a knot
    const kn = opt.knot || 0;
    if (kn < 0.5) {
      const sw = moving ? Math.sin(t * 8) * 18 : Math.sin(t * 2.4) * 10;
      ring += ' ' + inkPath(Tp([[-146, -238], [-178, -232], [-198 + sw * 0.3, -190], [-206 + sw, -140], [-198 + sw * 1.4, -100]]), O(50, { w: w * 1.6, taper: 0.6 }));
      ring += ' ' + inkPath(Tp([[-150, -230], [-186, -214], [-200 + sw, -150], [-188 + sw * 1.3, -110]]), O(51, { w: w * 0.8, taper: 0.6 }));
    } else {
      const k2 = (kn - 0.5) * 2;
      ring += ' ' + inkPath(Tp([[-146, -238], [-176, -236], [-192, -222]]), O(52, { w: w * 1.6 }));
      const c = T(-196, -206);
      ring += ' ' + inkPath(inkEllipsePts(c[0], c[1], 16 * s * (0.6 + 0.4 * k2), 14 * s, sd + 53, 9), O(53, { closed: true, w: w * 1.3 }));
      ring += ' ' + inkPath(Tp([[-198, -192], [-194, -172], [-186, -160]]), O(54, { w: w * 1.2, taper: 0.6 }));
      fill += ' ' + inkLoop(inkEllipsePts(c[0], c[1], 16 * s, 14 * s, sd + 53, 9), O(55));
    }
    return { fill, ring, cap: opt.capF || '' };
  }

  SH.ag03_ova = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, r = rng(seed * 19 + 7);
      const root = el(svg, 'g'), cam = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const night = P.time === 'night', evening = P.time === 'evening';
      const gy = H * (P.ground ?? 0.86), hy = H * (P.horizon ?? 0.6);

      // ---------------------------------------------------------------- back layers
      const sky = el(cam, 'g');
      const skyR = mk(sky, INK.inkSoft, { 'fill-opacity': 0.5 });
      const sunF = mk(sky, INK.gold), sunR = mk(sky, INK.ink);
      const moonF = mk(sky, INK.paperLight), moonR = mk(sky);
      const hillF = mk(cam, INK.paperDark, { 'fill-opacity': 0.75 }), hillR = mk(cam, INK.inkSoft);
      const campG = el(cam, 'g');
      const campF = mk(campG, INK.paperLight), campR = mk(campG, INK.inkSoft), campPr = mk(campG, INK.red), campPb = mk(campG, INK.blue);
      const groundF = mk(cam, INK.paperDark, { 'fill-opacity': 0.35 }), groundR = mk(cam), grassR = mk(cam, INK.inkSoft), grassG = mk(cam, INK.gold);
      const tentG = el(cam, 'g'), tentF = mk(tentG, INK.paperLight), tentR = mk(tentG), tentPr = mk(tentG, INK.red), tentPb = mk(tentG, INK.blue);
      const fireG = el(cam, 'g'), fireR = mk(fireG, INK.red), fireY = mk(fireG, INK.gold), fireW = mk(fireG);
      const dustF = mk(cam, INK.paperDark), dustR = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });
      const arrowR = mk(cam);

      const stars = []; for (let i = 0; i < 26; i++) stars.push([r() * W, 40 + r() * (hy - 180), 6 + r() * 6]);
      const hatch = []; for (let i = 0; i < 70; i++) hatch.push([r() * W, 20 + r() * (hy - 140), 40 + r() * 70]);
      const ridge = []; for (let i = 0; i <= 16; i++) ridge.push([i / 16 * (W + 200) - 100, hy - 30 - Math.sin(i * 1.3 + seed) * 26 - Math.sin(i * 0.5) * 22 - r() * 16]);
      const vols = P.volcano === false ? [] : (Array.isArray(P.volcano) ? P.volcano : [{ x: 0.76, h: 170 }, { x: 0.9, h: 120 }]);
      const grass = []; for (let i = 0; i < 46; i++) grass.push([r() * W, gy + 6 + r() * (H - gy - 10), r()]);
      const campTents = [];
      (P.camps || []).forEach((C, ci) => {
        const n = C.n ?? 8, s = C.scale ?? 0.5, y = H * (C.y ?? (P.horizon ?? 0.6) + 0.02);
        for (let i = 0; i < n; i++) campTents.push({ x: W * lerp(C.x0, C.x1, n > 1 ? i / (n - 1) : 0.5) + (r() - 0.5) * 30, y: y + (i % 2) * 14 * s, s: s * (0.85 + r() * 0.3), side: C.side, flag: i % 2 === 0, k: ci * 50 + i, fire: C.fires && i % 2 === 1 });
      });
      const fires = (P.fires || []).map(f => ({ x: f.x * W, y: (f.y ?? (P.ground ?? 0.86)) * H, s: f.scale ?? 1 }));
      campTents.forEach(c => { if (c.fire) fires.push({ x: c.x + 40 * c.s, y: c.y + 6, s: c.s * 0.8 }); });

      // ---------------------------------------------------------------- figures
      const figs = el(cam, 'g');
      const S0 = P.scale || 0.72;
      const mkRig = (parent, m, k, isK) => {
        const wrap = el(parent, 'g');
        const rig = KASIF.create(el(wrap, 'g'), { scale: 1, hat: !!isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + k * 13 + 3 });
        return { wrap, rig };
      };
      // big riderless horse
      const BH = P.horse || null;
      const bhG = BH ? el(figs, 'g') : null, bhF = BH ? mk(bhG, INK.paperLight) : null, bhR = BH ? mk(bhG) : null;
      // standing cast
      const cast = (P.cast || []).map((m, i) => {
        const g = el(figs, 'g'), robe = m.robe ? { f: mk(g, INK.paperLight), r: mk(g) } : null;
        const o = Object.assign({ m, g, robe, spearR: m.spear ? mk(g) : null, swordR: m.sword ? mk(g) : null }, mkRig(g, m, 100 + i, (m.who || 'x') === 'kasif'));
        return o;
      });
      // riders (each copy: rig behind, horse in front, rider leg + gear on top)
      const riders = [];
      (P.riders || []).forEach((m, i) => {
        const n = m.n ?? 1;
        for (let k = n - 1; k >= 0; k--) {
          const g = el(figs, 'g');
          const R = mkRig(g, m, 200 + i * 10 + k, false);
          for (let q = 0; q < 10; q++) if (R.rig.node.children[q]) R.rig.node.children[q].style.display = 'none';   // shadow, seat, legs, feet
          const hf = mk(g, INK.paperLight), cap = mk(g, m.side === 'byz' ? INK.red : INK.blue, { 'fill-opacity': 0.85 }), hr = mk(g), leg = mk(g), gear = mk(g), flagF = mk(g, COL[m.flag] || INK.paperLight);
          riders.push({ m, i, k, g, R, hf, cap, hr, leg, gear, flagF });
        }
      });

      // ---------------------------------------------------------------- front: crown, labels, narrator
      const front = el(root, 'g');
      const crownF = P.crown ? mk(cam, INK.gold) : null, crownR = P.crown ? mk(cam) : null;
      const ringR = P.ring ? mk(front, INK.red) : null;
      const txt = (o, def, col) => {
        const t = el(front, 'text', { 'font-family': INK_FONT, 'font-size': o.size || def, 'text-anchor': 'middle', fill: COL[o.color] || col,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = o.text; return t;
      };
      const L = P.label || null, labT = L ? txt(L, 64, INK.ink) : null;
      const N = P.note || null, noteT = N ? txt(N, 60, INK.red) : null;
      const B = P.bubble || null, bubG = B ? el(front, 'g') : null;
      const bubF = B ? mk(bubG, INK.paperLight) : null, bubR = B ? mk(bubG) : null;
      let bubT = null, bubW = 0;
      if (B) { bubT = el(bubG, 'text', { 'font-family': INK_FONT, 'font-size': B.size || 60, 'text-anchor': 'middle', fill: COL[B.color] || INK.red }); bubT.textContent = B.text; }
      const K = P.kasif === false ? null : Object.assign({ x: 0.12, scale: 0.8, face: 1, pose: 'idle' }, P.kasif || {});
      const kas = K ? mkRig(front, K, 999, true) : null;
      const sweatR = K && K.sweat != null ? mk(front, INK.blue) : null;

      let lastStep = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fc = Cm.focus || [0.5, 0.6], fx = fc[0] * W, fy = fc[1] * H;
          const sa = atOr(cues, P.shake, null), sk = sa != null && lt >= sa ? Math.exp(-(lt - sa) * 4) * 12 : 0;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.35) * 5 + sk * Math.sin(lt * 57))} ${f1(fy + Math.cos(lt * 0.27) * 4 + sk * Math.cos(lt * 43))}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          // static layers re-drawn at the boil rate
          if (redraw || lt < 0.05) {
            let sk2 = '';
            if (night) {
              hatch.forEach((h, i) => { sk2 += inkPath([[h[0], h[1]], [h[0] + h[2], h[1] - h[2] * 0.35]], O(10 + i, { w: 2.5, amp: 0.8 })) + ' '; });
              stars.forEach((s, i) => { sk2 += inkPath([[s[0] - s[2], s[1]], [s[0] + s[2], s[1]]], O(100 + i, { w: 3 })) + ' ' + inkPath([[s[0], s[1] - s[2]], [s[0], s[1] + s[2]]], O(140 + i, { w: 3 })) + ' '; });
            } else if (evening) {
              hatch.slice(0, 30).forEach((h, i) => { sk2 += inkPath([[h[0], hy - 60 - i * 9], [h[0] + h[2] * 1.6, hy - 62 - i * 9]], O(10 + i, { w: 2.5, amp: 0.8 })) + ' '; });
            }
            skyR.setAttribute('d', sk2);
            // hills + volcanoes
            const hp = ridge.slice();
            vols.forEach(v => { const x = v.x * W, h = v.h ?? 150; hp.push([x - h * 1.5, hy - 40], [x - h * 0.3, hy - 40 - h], [x + h * 0.3, hy - 44 - h], [x + h * 1.5, hy - 40]); });
            const rp = ridge.concat([[W + 100, gy], [-100, gy]]);
            let hf = inkLoop(rp, O(200));
            let hr = inkPath(ridge, O(201, { w: 4 }));
            vols.forEach((v, i) => {
              const x = v.x * W, h = v.h ?? 150, cone = [[x - h * 1.6, hy - 20], [x - h * 0.32, hy - 40 - h], [x - h * 0.1, hy - 30 - h], [x + h * 0.12, hy - 34 - h], [x + h * 0.32, hy - 42 - h], [x + h * 1.6, hy - 20]];
              hf += ' ' + inkLoop(cone.concat([[x + h * 1.6, hy + 10], [x - h * 1.6, hy + 10]]), O(210 + i, { smooth: false }));
              hr += ' ' + inkPath(cone, O(220 + i, { w: 4, smooth: false })) + ' ' + inkPath([[x - h * 0.2, hy - 26 - h], [x - h * 0.45, hy - h * 0.4]], O(230 + i, { w: 2.5 })) + ' ' + inkPath([[x + h * 0.2, hy - 30 - h], [x + h * 0.5, hy - h * 0.35]], O(240 + i, { w: 2.5 }));
            });
            hillF.setAttribute('d', hf); hillR.setAttribute('d', hr);
            // ground
            groundF.setAttribute('d', inkLoop([[-60, gy], [W + 60, gy - 6], [W + 60, H + 40], [-60, H + 40]], O(300, { smooth: false })));
            groundR.setAttribute('d', inkPath([[-40, gy + 2], [W * 0.3, gy - 4], [W * 0.62, gy + 4], [W + 40, gy - 4]], O(301, { w: 5 })));
            let gr = '', gg = '';
            grass.forEach((g, i) => {
              const sw = Math.sin(t * 1.5 + i) * 3, s2 = inkPath([[g[0], g[1]], [g[0] + 4 + sw, g[1] - 18 - g[2] * 10]], O(400 + i, { w: 3, amp: 0.8 })) + ' ' + inkPath([[g[0] + 8, g[1]], [g[0] + 16 + sw, g[1] - 14]], O(460 + i, { w: 2.5, amp: 0.8 })) + ' ';
              if (i % 3 === 0) gg += s2; else gr += s2;
            });
            grassR.setAttribute('d', gr); grassG.setAttribute('d', gg);
            // far camps
            let cf = '', cr = '', cpr = '', cpb = '';
            campTents.forEach(c => {
              const s = c.s, x = c.x, y = c.y, wv = Math.sin(t * 5 + c.k) * 6 * s;
              const tent = [[x - 70 * s, y], [x - 50 * s, y - 50 * s], [x, y - 92 * s], [x + 50 * s, y - 50 * s], [x + 70 * s, y]];
              cf += inkLoop(tent, O(500 + c.k, { smooth: false })) + ' ';
              cr += inkPath(tent, O(560 + c.k, { w: 3.5, smooth: false })) + ' ' + inkPath([[x, y], [x, y - 40 * s]], O(620 + c.k, { w: 2.5 })) + ' ';
              if (c.flag) {
                cr += inkPath([[x, y - 92 * s], [x, y - 150 * s]], O(680 + c.k, { w: 3 })) + ' ';
                const fl = inkLoop([[x, y - 150 * s], [x + 44 * s, y - 140 * s + wv], [x, y - 126 * s]], O(740 + c.k));
                if (c.side === 'byz') cpr += fl + ' '; else cpb += fl + ' ';
              }
            });
            campF.setAttribute('d', cf); campR.setAttribute('d', cr); campPr.setAttribute('d', cpr); campPb.setAttribute('d', cpb);
            // near pavilion tents
            let tf = '', tr = '', tpr = '', tpb = '';
            (P.tents || []).forEach((T, i) => {
              const s = T.scale ?? 1, x = T.x * W, y = (T.y ?? (P.ground ?? 0.86)) * H, wv = Math.sin(t * 4 + i) * 10 * s;
              const body = [[x - 150 * s, y], [x - 140 * s, y - 170 * s], [x + 140 * s, y - 170 * s], [x + 150 * s, y]];
              const roof = [[x - 170 * s, y - 160 * s], [x, y - 330 * s], [x + 170 * s, y - 160 * s]];
              tf += inkLoop(body, O(800 + i, { smooth: false })) + ' ' + inkLoop(roof, O(810 + i, { smooth: false })) + ' ';
              tr += inkPath(body, O(820 + i, { w: 6, smooth: false })) + ' ' + inkPath(roof.concat([roof[0]]), O(830 + i, { w: 6, smooth: false })) + ' ' +
                inkPath([[x - 40 * s, y], [x - 6 * s, y - 120 * s], [x + 30 * s, y]], O(840 + i, { w: 5 })) + ' ' + inkPath([[x, y - 330 * s], [x, y - 420 * s]], O(850 + i, { w: 5 })) + ' ' +
                [0, 1, 2].map(q => inkPath([[x - 160 * s + q * 4, y - 166 * s + q * 20], [x + 160 * s - q * 4, y - 166 * s + q * 20]], O(860 + i * 3 + q, { w: 2.5 }))).join(' ') + ' ';
              const fl = inkLoop([[x, y - 420 * s], [x + 90 * s, y - 404 * s + wv], [x + 70 * s, y - 386 * s], [x + 94 * s, y - 368 * s + wv * 0.6], [x, y - 360 * s]], O(870 + i));
              if (T.side === 'sel') tpb += fl + ' '; else tpr += fl + ' ';
            });
            tentF.setAttribute('d', tf); tentR.setAttribute('d', tr); tentPr.setAttribute('d', tpr); tentPb.setAttribute('d', tpb);
          }

          // sun / moon (sun moves continuously)
          if (P.sun !== false && !night && (P.sun || evening)) {
            const S = P.sun || { x: 0.8, y: 0.45 };
            const a = atOr(cues, S.at, 0), p = S.to ? progIO(lt, a, S.dur ?? Math.max(1, dur - a)) : 0;
            const x = W * lerp(S.x, S.to ? S.to[0] : S.x, p), y = H * lerp(S.y, S.to ? S.to[1] : S.y, p), R = (S.r ?? (evening ? 90 : 60));
            sunF.setAttribute('d', inkLoop(inkEllipsePts(x, y, R, R, sd + 900, 14), O(900)));
            let rr = inkPath(inkEllipsePts(x, y, R, R, sd + 900, 14), O(901, { closed: true, w: 4 }));
            for (let q = 0; q < 10; q++) { const aa = q / 10 * Math.PI * 2 + t * 0.2; rr += ' ' + inkPath([[x + Math.cos(aa) * (R + 16), y + Math.sin(aa) * (R + 16)], [x + Math.cos(aa) * (R + 40 + Math.sin(t * 3 + q) * 6), y + Math.sin(aa) * (R + 40 + Math.sin(t * 3 + q) * 6)]], O(910 + q, { w: 4 })); }
            sunR.setAttribute('d', rr);
          }
          if (night) {
            const M = P.moon || { x: 0.8, y: 0.2 }, x = M.x * W + Math.sin(lt * 0.2) * 6, y = M.y * H, R = M.r ?? 62;
            const pts = []; for (let q = 0; q <= 14; q++) { const aa = rad(-120 + q / 14 * 240); pts.push([x + Math.cos(aa + Math.PI) * R, y + Math.sin(aa + Math.PI) * R]); }
            for (let q = 14; q >= 0; q--) { const aa = rad(-100 + q / 14 * 200); pts.push([x - R * 0.42 + Math.cos(aa + Math.PI) * R * 0.78, y + Math.sin(aa + Math.PI) * R * 0.86]); }
            moonF.setAttribute('d', inkLoop(pts, O(950)));
            moonR.setAttribute('d', inkPath(pts, O(951, { closed: true, w: 4 })));
          }

          // fires (flicker every frame)
          let fr = '', fy2 = '', fw = '';
          fires.forEach((f, i) => {
            const s = f.s, x = f.x, y = f.y, fl = Math.sin(t * 13 + i * 2) * 6 * s, fl2 = Math.cos(t * 17 + i) * 5 * s;
            const outer = [[x - 26 * s, y], [x - 20 * s, y - 34 * s], [x - 6 * s + fl2, y - 70 * s + fl], [x + 4 * s, y - 44 * s], [x + 14 * s + fl, y - 62 * s - fl2], [x + 26 * s, y]];
            const inner = [[x - 12 * s, y], [x - 4 * s + fl2 * 0.5, y - 36 * s + fl * 0.6], [x + 12 * s, y]];
            fr += inkLoop(outer, O(1000 + i, { amp: 1 })) + ' '; fy2 += inkLoop(inner, O(1040 + i, { amp: 0.8 })) + ' ';
            fw += inkPath([[x - 34 * s, y + 6 * s], [x + 34 * s, y - 4 * s]], O(1080 + i, { w: 5 * s })) + ' ' + inkPath([[x - 30 * s, y - 4 * s], [x + 30 * s, y + 8 * s]], O(1120 + i, { w: 5 * s })) + ' ';
          });
          fireR.setAttribute('d', fr); fireY.setAttribute('d', fy2); fireW.setAttribute('d', fw);

          // dust clouds
          if (P.dust) {
            const D = P.dust, a = atOr(cues, D.at, 0), n = D.n ?? 7;
            let df = '', dr = '';
            for (let q = 0; q < n; q++) {
              const u = ((lt - a) / 2.6 + q / n) % 1, on = lt >= a;
              if (!on) continue;
              const x = W * lerp(D.x0 ?? 0.3, D.x1 ?? 0.8, (q + 0.5) / n) + Math.sin(q * 3 + lt) * 20, y = H * (D.y ?? (P.ground ?? 0.86)) - u * 140, R = 30 + u * 60;
              const pts = inkEllipsePts(x, y, R, R * 0.7, sd + 1200 + q, 10);
              df += inkLoop(pts, O(1200 + q)) + ' '; dr += inkPath(pts.slice(0, 7), O(1240 + q, { w: 2.5 })) + ' ';
            }
            dustF.setAttribute('d', df); dustF.setAttribute('fill-opacity', 0.55); dustR.setAttribute('d', dr);
          }
          // arrows across the sky
          if (P.arrows) {
            const A = P.arrows, a = atOr(cues, A.at, 0.5), n = A.n ?? 12, fl = A.dur ?? 1.6, dir = A.dir ?? 1, rr = rng(sd + 1300);
            let ad = '';
            for (let q = 0; q < n * 2; q++) {
              const st = a + (q % n) * 0.12 + Math.floor(q / n) * 1.4 + rr() * 0.1, p = (lt - st) / fl;
              const x0 = W * (dir > 0 ? -0.05 + rr() * 0.2 : 1.05 - rr() * 0.2), y0 = H * (0.42 + rr() * 0.2), span = W * (0.7 + rr() * 0.3) * dir;
              if (p < 0 || p > 1) continue;
              const X = q2 => [x0 + span * q2, y0 - Math.sin(Math.PI * q2) * 180];
              const p1 = X(p), p2 = X(Math.max(0, p - 0.04)), an = Math.atan2(p1[1] - p2[1], p1[0] - p2[0]);
              ad += inkPath([[p1[0] - Math.cos(an) * 40, p1[1] - Math.sin(an) * 40], p1], O(1300 + q, { w: 3.5, amp: 0.6 })) + ' ' +
                inkPath([[p1[0] - Math.cos(an - 0.6) * 12, p1[1] - Math.sin(an - 0.6) * 12], p1, [p1[0] - Math.cos(an + 0.6) * 12, p1[1] - Math.sin(an + 0.6) * 12]], O(1400 + q, { w: 3, smooth: false, amp: 0.5 })) + ' ';
            }
            arrowR.setAttribute('d', ad);
          }

          // big riderless horse
          if (BH) {
            const s = BH.scale ?? 1.1, ka = BH.knot != null ? atOr(cues, BH.knot, null) : null, kp = ka != null && lt >= ka ? prog(lt, ka, 0.6) : 0;
            const h = horse(BH.x * W, (BH.y ?? (P.ground ?? 0.86)) * H, s, faceOf(BH.face ?? 1), 0, 0, t, sd + 1500, { knot: kp });
            bhF.setAttribute('d', h.fill); bhR.setAttribute('d', h.ring);
            bhG.setAttribute('transform', kp > 0 && kp < 1 ? `translate(0 ${f1(-6 * Math.sin(kp * Math.PI))})` : '');
          }

          // standing cast
          cast.forEach((c, i) => {
            const m = c.m, ap = m.appear != null ? atOr(cues, m.appear, 0.5) : null, sp = ap == null ? 1 : (lt >= ap ? spring(lt, ap, 0.6) : 0);
            c.g.style.display = sp <= 0.001 ? 'none' : '';
            if (sp <= 0.001) return;
            const tr = track(m, lt, cues, W), s = (m.scale || S0) * sp, y = (m.y ?? (P.ground ?? 0.86)) * H;
            const sg = segs(m, cues, lt);
            let pose = sg.pose; const o = sg.o;
            if (tr.moving) { pose = 'walk'; o.ph = tr.dist / (KASIF.gait('walk') * s); delete o.prev; }
            o.x = tr.x; o.y = y; o.scale = s; o.face = faceOf(sg.o.seg.face ?? tr.face);
            c.rig.update(t, pose, o);
            const ba = m.bow != null ? atOr(cues, m.bow, null) : null, bp = ba != null && lt >= ba ? progIO(lt, ba, 0.6) : 0;
            c.wrap.setAttribute('transform', bp > 0 ? `rotate(${f1(bp * 14 * o.face)} ${f1(tr.x)} ${f1(y)})` : '');
            const fx2 = o.face, T = (x2, y2) => [tr.x + x2 * s * fx2, y + y2 * s];
            if (c.robe) {
              const rb = [T(-46, -318), T(46, -318), T(96, -36), T(-90, -36)];
              c.robe.f.setAttribute('d', inkLoop(rb, O(1600 + i * 5, { smooth: false })));
              c.robe.r.setAttribute('d', inkPath(rb, O(1601 + i * 5, { closed: true, w: 5 * s, smooth: false })) + ' ' + inkPath([T(0, -300), T(4, -40)], O(1602 + i * 5, { w: 3 * s })));
            }
            if (c.spearR) {
              const ra = m.raise != null ? atOr(cues, m.raise, null) : null, rp = ra != null && lt >= ra ? spring(lt, ra, 0.5) : 0;
              const lift = rp * 120;
              c.spearR.setAttribute('d', inkPath([T(70, -20 - lift), T(74, -640 - lift)], O(1620 + i, { w: 6 * s })) + ' ' + inkLoop([T(60, -640 - lift), T(74, -700 - lift), T(88, -640 - lift)], O(1640 + i, { smooth: false })));
            }
            if (c.swordR) {
              const da = m.drop != null ? atOr(cues, m.drop, null) : null, dp = da != null && lt >= da ? prog(lt, da, 0.5) : 0;
              const sw = Math.sin(t * 6 + i) * 8 * (1 - dp);
              const a0 = T(lerp(120, -70, dp), lerp(-310 + sw, -6, dp)), a1 = T(lerp(250, -250, dp), lerp(-400 + sw, -14, dp));
              c.swordR.setAttribute('d', inkPath([a0, a1], O(1660 + i, { w: 7 * s })) + ' ' + inkPath([T(lerp(132, -88, dp), lerp(-300 + sw, -30, dp)), T(lerp(108, -86, dp), lerp(-330 + sw, 16, dp))], O(1680 + i, { w: 6 * s })));
            }
          });

          // riders
          riders.forEach(R => {
            const m = R.m, ap = m.appear != null ? atOr(cues, m.appear, 0.5) : null, sp = ap == null ? 1 : (lt >= ap ? spring(lt, ap, 0.6) : 0);
            R.g.style.display = sp <= 0.001 ? 'none' : '';
            if (sp <= 0.001) return;
            const tr = track(m, lt, cues, W), s = (m.scale || S0) * (1 - 0.07 * (R.k % 2)) * sp, hs = s * HSC;
            const face = tr.face, fs = face >= 0 ? 1 : -1;
            const x = tr.x - fs * (m.gap ?? 0.11) * W * R.k, y = (m.y ?? (P.ground ?? 0.86)) * H - (R.k % 2) * 22;
            const ph = tr.moving ? (t * 2.3 + R.k * 0.37) : 0;
            const h = horse(x, y, hs, face, ph, tr.moving, t, sd + 2000 + R.i * 100 + R.k * 10, { armor: !!m.armor });
            R.hf.setAttribute('d', h.fill); R.hr.setAttribute('d', h.ring); R.cap.setAttribute('d', h.cap);
            const bob = tr.moving ? -Math.abs(Math.sin(ph * Math.PI * 2)) * 10 : 0;
            const sg = segs(m, cues, lt), o = sg.o;
            const look = sg.o.seg.look ? -1 : 1;
            o.x = x - 40 * hs * face; o.y = y + (-262 + bob) * hs + 184 * s; o.scale = s; o.face = face * look;
            R.R.rig.update(t, sg.pose, o);
            const T = (x2, y2) => [x + x2 * hs * face, y + (y2 + bob) * hs];
            R.leg.setAttribute('d', inkPath([T(-40, -262), T(4, -214), T(-6, -160)], O(2500 + R.i * 10 + R.k, { w: 7 * s })) + ' ' + inkDot(T(0, -156)[0], T(0, -156)[1], 11 * s, 7 * s, sd + 2600 + R.k, t));
            let gear = '', fl = '';
            if (m.flag) {
              const wv = Math.sin(t * 6 + R.k) * 10 * s, top = -262 - (400 * s) / hs - 150;
              gear += inkPath([T(-104, -236), T(-100, top)], O(2700 + R.k, { w: 5 * s }));
              const flag = [T(-100, top), T(-224, top + 12 + wv / hs), T(-210, top + 52), T(-228, top + 90 + wv / hs), T(-100, top + 84)];
              fl = inkLoop(flag, O(2710 + R.k)); gear += ' ' + inkPath(flag, O(2720 + R.k, { closed: true, w: 4 * s }));
            }
            if (m.weapon === 'bow') {
              const c = T(60, -262 - 90 * s / hs), pts = []; for (let q = 0; q <= 8; q++) { const aa = rad(-70 + q / 8 * 140); pts.push([c[0] + Math.cos(aa) * 60 * s * face, c[1] + Math.sin(aa) * 60 * s]); }
              gear += ' ' + inkPath(pts, O(2730 + R.k, { w: 5 * s })) + ' ' + inkPath([pts[0], pts[8]], O(2740 + R.k, { w: 2 * s }));
            }
            if (m.weapon === 'lance') gear += ' ' + inkPath([T(-60, -280), T(290, -360)], O(2750 + R.k, { w: 6 * s })) + ' ' + inkLoop([T(280, -372), T(330, -366), T(284, -348)], O(2760 + R.k, { smooth: false }));
            R.gear.setAttribute('d', gear); R.flagF.setAttribute('d', fl);
          });

          // crown lying on the ground
          if (P.crown) {
            const Cw = P.crown, a = atOr(cues, Cw.at, 0), p = lt >= a ? spring(lt, a, 0.6) : 0, s = 0.75, x = Cw.x * W, y = (Cw.y ?? (P.ground ?? 0.86)) * H + 10;
            const pts = CROWN.map(q => { const rr = rotP2(q[0] * s, (q[1] + 50) * s, 0.35); return [x + rr[0], y + rr[1] - (1 - p) * 80]; });
            crownF.setAttribute('d', p > 0 ? inkLoop(pts, O(2800, { smooth: false })) : '');
            crownR.setAttribute('d', p > 0 ? inkPath(pts, O(2801, { closed: true, w: 5, smooth: false })) : '');
          }
          if (ringR) {
            const Rg = P.ring, a = atOr(cues, Rg.at, 0.5), p = lt >= a ? prog(lt, a, 0.7) : 0, R0 = Rg.r ?? 120;
            const pts = inkEllipsePts(Rg.x * W, Rg.y * H, R0, R0 * 0.85, sd + 2900, 18), keep = Math.max(2, Math.round(pts.length * p));
            ringR.setAttribute('d', p > 0.02 ? inkPath(p > 0.98 ? pts.concat([pts[0]]) : pts.slice(0, keep + 1), O(2900, { w: 8 * (1 + 0.3 * punch(lt, a + 0.7, 0.5)) })) : '');
          }
          const showT = (node, o2, fb, k) => {
            const a = atOr(cues, o2.at, fb), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 70 + k, t, 1.4);
            node.setAttribute('opacity', clamp01(p * 2));
            node.setAttribute('transform', `translate(${f1(W * (o2.x ?? 0.5) + b[0])} ${f1(H * (o2.y ?? 0.15) + b[1])}) rotate(${o2.rot ?? -3}) scale(${lerp(0.5, 1, p).toFixed(3)})`);
          };
          if (labT) showT(labT, L, 0.3, 0);
          if (noteT) showT(noteT, N, dur * 0.6, 1);
          if (B) {
            const a = atOr(cues, B.at, dur * 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0, pk = punch(lt, a, 0.5);
            if (!bubW) { try { bubW = bubT.getComputedTextLength(); } catch (e) { bubW = 0; } if (!bubW) bubW = B.text.length * 28; }
            const bx = W * B.x, by = H * B.y, fs = parseFloat(bubT.getAttribute('font-size'));
            if (redraw || !bubF.getAttribute('d')) {
              const x0 = bx - bubW / 2 - 34, x1 = bx + bubW / 2 + 34, y0 = by - fs * 0.95, y1 = by + fs * 0.4;
              const tl = B.tail || [0, 1];
              const sh = [[x0 + 20, y0], [x1 - 20, y0], [x1, y0 + 20], [x1, y1 - 16], [x1 - 20, y1], [bx + 40, y1], [bx + tl[0] * 60 + 10, y1 + 60 * tl[1]], [bx + 6, y1], [x0 + 20, y1], [x0, y1 - 16], [x0, y0 + 20]];
              bubF.setAttribute('d', inkLoop(sh, O(2950, { smooth: false })));
              bubR.setAttribute('d', inkPath(sh, O(2951, { closed: true, w: 5, smooth: false })));
              bubT.setAttribute('x', f1(bx)); bubT.setAttribute('y', f1(by));
            }
            bubG.setAttribute('opacity', clamp01(p * 2.5));
            bubG.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) rotate(-2) scale(${(Math.max(0.001, lerp(0.4, 1, p)) * (1 + 0.08 * pk)).toFixed(3)}) translate(${f1(-bx)} ${f1(-by)})`);
          }

          // narrator
          if (kas) {
            const sg = segs(K, cues, lt), o = sg.o, kx = K.x * W, ky = (K.y ?? (P.ground ?? 0.86) + 0.04) * H;
            const tr = track(K, lt, cues, W);
            let pose = sg.pose;
            o.x = K.moves ? tr.x : kx; o.y = ky; o.scale = K.scale; o.face = faceOf(sg.o.seg.face ?? K.face);
            if (tr.moving) { pose = 'walk'; o.ph = tr.dist / (KASIF.gait('walk') * K.scale); delete o.prev; }
            kas.rig.update(t, pose, o);
            if (sweatR) {
              const a = atOr(cues, K.sweat, dur * 0.5);
              let d = '';
              if (lt >= a) for (let q = 0; q < 3; q++) {
                const u = ((lt - a) * 1.2 + q / 3) % 1, x = o.x + (q - 1) * 60 * K.scale + o.face * 30 * K.scale, y = ky - 560 * K.scale + u * 120 * K.scale;
                d += inkLoop([[x, y - 18], [x + 9, y + 2], [x, y + 10], [x - 9, y + 2]], O(3000 + q, { amp: 0.6 })) + ' ';
              }
              sweatR.setAttribute('d', d);
            }
          }
        },
      };
    },
  };
  const rotP2 = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
})();
