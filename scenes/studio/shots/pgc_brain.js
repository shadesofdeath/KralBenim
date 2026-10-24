// pgc_brain: a hand-drawn brain in profile (face to the left) in the parchment ink style (brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js; pure function of (seed, lt)). Written for ag-04-phineas-gage (chapter 4),
// parametric for any "which part of the brain" story.
//
// SHOTS.pgc_brain P: {
//   mode: "lobes" | "jobs" | "wires" | "scan"
//     lobes: brain with its lobes; `rod` draws an iron bar up through the front, `hit` floods the left frontal lobe red
//     jobs:  one undivided brain with floating "?" marks; at `proof` the lobe borders draw in and each lobe takes its
//            own tint, one after another (the "different parts, different jobs" idea)
//     wires: white-matter fibres fan out from the frontal lobe to the rest of the brain (drawn in at the start);
//            at `cut` every fibre that crosses the iron's path turns red and snaps open
//     scan:  a 2012 computer screen: grid, a skull outline, a scan bar sweeping down; at `trace` the iron's path is
//            traced as a red dashed line through the skull and the frontal lobe tints red
//   brain: {x: 0.38, y: 0.5, r: 0.33}      (centre 0..1 of W/H, r = half-height as a fraction of H)
//   rod: {at: cue|sec, dur: 0.7, ghost: false} | false   (lobes: drawn by default at "rod"; other modes: ghost)
//   red: "frontal" (lobe that turns red at `hit`) · tints: true (jobs)
//   labels: [{text, x, y (0..1 W/H), at, color: "red"|"ink"|"blue", size: 66, arrow: [x, y] (0..1 W/H), rot}]
//   note: {text: "2012", x, y, at, color, size: 130} (big Fraunces number)
//   cast: [{who: "kasif"|name, accessory, beard, x, to, start, arrive (walks x -> to), y (ground 0..1 H), scale, pose, at, then, face: "left"|"right",
//           dir, emotion, emotion0, seq: [{at, pose, dir, face, emotion}], tag}]
//   cam: {zoom: 1.06}
// }
// SHOTS.pgc_scan / SHOTS.pgc_wires: the same shot with mode "scan" / "wires" fixed.
// cues: rod, hit, proof, cut, trace + whatever labels / note / cast use.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, soft: INK.inkSoft };
  const FR = 'Fraunces, Georgia, serif';

  // ---------------------------------------------------------------- shared: cast, notes
  function makeCast(P, parent, seed, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = m.scale ?? defScale;
      const g = el(parent, 'g');
      const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 });
      let tag = null;
      if (m.tag) {
        tag = el(g, 'text', { 'font-family': INK_FONT, 'font-size': m.tag_size || 56, 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round` });
        tag.textContent = m.tag;
      }
      return { m, isK, sc, rig, tag };
    });
  }
  function poseAt(m, lt, cues) {
    let pose = m.pose || 'idle', dir = m.dir, face = m.face, emo = m.emotion0 || null, since = lt, prev = null;
    const steps = [];
    if (m.at != null) steps.push({ at: m.at, pose: m.then || 'point', dir: m.dir, face: m.face, emotion: m.emotion });
    (m.seq || []).forEach(s => steps.push(s));
    steps.map(s => Object.assign({}, s, { t: atOr(cues, s.at, 1e9) })).sort((a, b) => a.t - b.t).forEach(s => {
      if (lt >= s.t) {
        prev = { pose, dir: typeof dir === 'number' ? dir : DIRS[dir] ?? 25, since: s.t };
        pose = s.pose || pose; if (s.dir != null) dir = s.dir; if (s.face != null) face = s.face;
        emo = s.emotion || (s.pose === 'shock' ? 'surprised' : emo); since = lt - s.t;
      }
    });
    return { pose, dir: typeof dir === 'number' ? dir : DIRS[dir] ?? 25, face: face === 'left' ? -1 : 1, emo, since, prev };
  }
  function updateCast(cast, lt, t, cues, W, H, G, sd) {
    cast.forEach((c, ci) => {
      const m = c.m, s = poseAt(m, lt, cues);
      let x = (m.x ?? 0.8) * W, pose = s.pose, face = s.face;
      const y = m.y != null ? m.y * H : G;
      let ph = 0, walking = false;
      if (m.to != null) {      // walk in from x to `to` between `start` and `arrive`
        const a0 = atOr(cues, m.start, 0), a1 = atOr(cues, m.arrive, a0 + 1.4), u = sm((lt - a0) / Math.max(0.3, a1 - a0));
        const x0 = x; x = lerp(x0, m.to * W, u);
        if (lt >= a0 && lt < a1) { walking = true; pose = 'walk'; face = m.to * W > x0 ? 1 : -1; ph = Math.abs(x - x0) / (KASIF.gait('walk') * c.sc); }
      }
      const o = { x, y, face, since: s.since, dir: s.dir, text: m.text, item: m.item, emotion: s.emo, ph };
      if (s.prev && s.since < 0.32 && !walking) { o.prev = s.prev; o.mix = s.since / 0.32; }
      const r = c.rig.update(t, pose, o) || {};
      if (c.tag) {
        const hc = r.head || [0, -440], b = boil(sd + ci * 300 + 20, t, 1), sp = spring(lt, 0.15, 0.6);
        c.tag.setAttribute('opacity', clamp01(sp * 2));
        c.tag.setAttribute('transform', `translate(${f1(x + face * c.sc * hc[0] + b[0])} ${f1(y + c.sc * hc[1] - 150 * c.sc + b[1])}) rotate(-3)`);
      }
    });
  }
  function makeNote(N, parent, defSize, fraunces) {
    if (!N || !N.text) return null;
    const col = COL[N.color] || INK.ink;
    const t = el(parent, 'text', { 'font-family': fraunces ? FR : INK_FONT, 'font-weight': fraunces ? 900 : 400,
      'font-size': N.size || defSize, 'text-anchor': 'middle', fill: col,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = N.text;
    return { N, t, u: mk(parent, col), ar: mk(parent, col) };
  }
  function updateNote(n, lt, t, cues, W, H, sd, fb) {
    if (!n) return;
    const N = n.N, at = atOr(cues, N.at, fb), sp = lt >= at ? spring(lt, at, 0.6) : 0, x = (N.x ?? 0.5) * W, y = (N.y ?? 0.15) * H, b = boil(sd, t, 1.2);
    n.t.setAttribute('opacity', clamp01(sp * 2));
    n.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${N.rot ?? -3}) scale(${lerp(0.5, 1, sp).toFixed(3)})`);
    const tw = Math.min(W * 0.5, n.t.getComputedTextLength ? n.t.getComputedTextLength() : 300), pu = lt >= at ? prog(lt, at + 0.25, 0.45) : 0;
    const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
    n.u.setAttribute('d', pu > 0.01 && N.underline !== false ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 15]], O(1, { w: 6 })) : '');
    if (N.arrow && lt >= at) {
      const pa = prog(lt, at + 0.35, 0.5);
      const sx = x + (N.arrow[0] * W > x ? tw * 0.3 : -tw * 0.3), sy = y + (N.arrow[1] * H > y ? 34 : -60), ex = N.arrow[0] * W, ey = N.arrow[1] * H;
      const mx = (sx + ex) / 2, my = (sy + ey) / 2 - 50, pts = [];
      for (let i = 0; i <= 12; i++) { const u = i / 12 * pa; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey]); }
      let d = pa > 0.01 ? inkPath(pts, O(2, { w: 6 })) : '';
      if (pa > 0.95) {
        const a = Math.atan2(ey - pts[10][1], ex - pts[10][0]);
        d += ' ' + inkPath([[ex - 34 * Math.cos(a - 0.5), ey - 34 * Math.sin(a - 0.5)], [ex, ey], [ex - 34 * Math.cos(a + 0.5), ey - 34 * Math.sin(a + 0.5)]], O(3, { w: 6, smooth: false }));
      }
      n.ar.setAttribute('d', d);
    } else n.ar.setAttribute('d', '');
  }

  // ---------------------------------------------------------------- brain geometry (u, v: face to the left)
  const OUT = [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.0, -1.0], [0.5, -0.88], [0.85, -0.6], [1.0, -0.2],
    [0.98, 0.18], [0.84, 0.42], [0.62, 0.5], [0.42, 0.52], [0.22, 0.62], [-0.05, 0.7], [-0.32, 0.66], [-0.55, 0.52], [-0.78, 0.38]];
  const LOBES = {
    frontal: [[-0.98, 0.05], [-0.95, -0.35], [-0.75, -0.72], [-0.4, -0.95], [0.0, -1.0], [-0.05, -0.6], [-0.15, -0.25], [-0.22, -0.02], [-0.6, 0.14], [-0.76, 0.37]],
    parietal: [[0.0, -1.0], [0.5, -0.88], [0.7, -0.74], [0.5, -0.3], [0.3, -0.12], [-0.22, -0.02], [-0.15, -0.25], [-0.05, -0.6]],
    occipital: [[0.7, -0.74], [0.85, -0.6], [1.0, -0.2], [0.98, 0.18], [0.84, 0.42], [0.62, 0.48], [0.55, 0.1], [0.5, -0.3]],
    temporal: [[-0.6, 0.14], [-0.22, -0.02], [0.3, -0.12], [0.5, -0.3], [0.55, 0.1], [0.62, 0.48], [0.42, 0.52], [0.22, 0.62], [-0.05, 0.7], [-0.32, 0.66], [-0.55, 0.52], [-0.74, 0.37]],
  };
  const TINT = { frontal: INK.red, parietal: INK.blue, occipital: INK.green, temporal: INK.gold };
  const CEREB = [[0.42, 0.52], [0.66, 0.5], [0.86, 0.48], [0.9, 0.64], [0.72, 0.8], [0.48, 0.78], [0.34, 0.66]];
  const STEM = [[0.2, 0.62], [0.3, 0.95], [0.18, 1.08], [0.06, 0.98], [0.04, 0.7]];
  const SULCI = [[[-0.05, -0.98], [-0.05, -0.6], [-0.15, -0.25], [-0.22, -0.02]], [[-0.62, 0.14], [-0.22, -0.02], [0.3, -0.12], [0.5, -0.3]],
    [[0.7, -0.74], [0.5, -0.3], [0.55, 0.1], [0.62, 0.48]]];
  // iron path: in under the cheekbone (front-bottom), behind the eye, out through the top of the head (front of the crown)
  const ROD = [[-0.8, 1.05], [-0.22, -1.32]];

  function point2seg(p, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1], k = clamp01(((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy));
    return Math.hypot(p[0] - a[0] - k * dx, p[1] - a[1] - k * dy);
  }

  SH.pgc_brain = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'lobes', sd = seed * 1000 + 83;
      const Bc = Object.assign({ x: 0.38, y: 0.5, r: 0.33 }, P.brain || {});
      const cx = Bc.x * W, cy = Bc.y * H, R = Bc.r * H;
      const B = (u, v) => [cx + u * R * 1.25, cy + v * R];
      const BB = q => B(q[0], q[1]);
      const G = P.ground ?? 0.86 * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const r = rng((P.seed ?? 7) * 7919 + 11);

      // screen (scan mode) behind the brain
      let scr = null;
      if (mode === 'scan') {
        scr = { f: mk(world, INK.paperLight), r: mk(world), grid: mk(world, INK.inkSoft, { 'fill-opacity': 0.55 }), stand: mk(world), bar: mk(world, INK.blue, { 'fill-opacity': 0.35 }), barL: mk(world, INK.blue),
          skullF: mk(world, INK.paperLight), skull: mk(world) };
      }
      const fillF = mk(world, INK.paperLight);
      const lobeF = {};
      Object.keys(LOBES).forEach(k => { lobeF[k] = mk(world, TINT[k], { 'fill-opacity': 0 }); });
      const hatch = mk(world, INK.red, { 'fill-opacity': 0.8 });
      const cerF = mk(world, INK.paperDark), stemF = mk(world, INK.paperDark);
      const gyri = Array.from({ length: 16 }, () => {
        const a = r() * Math.PI * 2, d = 0.15 + r() * 0.55, u0 = Math.cos(a) * d * 0.95, v0 = Math.sin(a) * d * 0.7 - 0.2, pts = [];
        let ang = r() * Math.PI * 2;
        for (let k = 0; k < 5; k++) { pts.push([u0 + k * 0.07 * Math.cos(ang), v0 + k * 0.07 * Math.sin(ang) + (k % 2 ? 0.04 : -0.04)]); ang += (r() - 0.5) * 1.4; }
        return pts;
      });
      const gyrR = mk(world, INK.inkSoft), lineR = mk(world), sulR = mk(world, INK.ink);
      // fibres (wires): from the frontal lobe to the other lobes
      const fibres = [];
      if (mode === 'wires') {
        const ends = [[0.35, -0.7], [0.6, -0.55], [0.8, -0.25], [0.85, 0.15], [0.55, 0.3], [0.2, 0.45], [-0.1, 0.5], [0.15, -0.85], [0.45, -0.2], [0.7, 0.3], [-0.3, 0.45], [0.05, 0.15]];
        const starts = [[-0.75, -0.3], [-0.6, -0.6], [-0.4, -0.75], [-0.8, -0.05], [-0.55, -0.15], [-0.35, -0.45], [-0.5, -0.82], [-0.7, -0.5], [-0.25, -0.7], [-0.45, -0.3], [-0.65, -0.1], [-0.3, -0.25]];
        ends.forEach((e, i) => {
          const s0 = starts[i], c = [(s0[0] + e[0]) / 2 + (r() - 0.5) * 0.2, Math.min(s0[1], e[1]) - 0.1 - r() * 0.15], pts = [];
          for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push([(1 - u) * (1 - u) * s0[0] + 2 * u * (1 - u) * c[0] + u * u * e[0], (1 - u) * (1 - u) * s0[1] + 2 * u * (1 - u) * c[1] + u * u * e[1]]); }
          let cutK = -1, best = 1e9;
          pts.forEach((p, k) => { const dd = point2seg(p, ROD[0], ROD[1]); if (dd < best) { best = dd; cutK = k; } });
          fibres.push({ pts, cut: best < 0.13 ? Math.max(2, Math.min(14, cutK)) : -1, n1: mk(world, INK.blue), n2: mk(world, INK.blue), dl: i * 0.08 });
        });
      }
      const rodF = mk(world, INK.inkSoft), rodR = mk(world), rodG = mk(world, INK.inkSoft);
      const scanTrace = mode === 'scan' ? mk(world, INK.red) : null;
      // question marks (jobs)
      const qs = mode === 'jobs' ? [[-0.55, -0.45], [0.25, -0.6], [0.7, -0.05], [0.0, 0.35], [-0.2, -0.3]].map((q, i) => {
        const tx = el(world, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 110, 'text-anchor': 'middle', fill: INK.inkSoft });
        tx.textContent = '?'; return { q, tx, i };
      }) : [];
      const castG = el(root, 'g'), uiG = el(root, 'g');
      const cast = makeCast(P, castG, seed, 0.62);
      const labels = (P.labels || []).map(L => makeNote(L, uiG, 66, false));
      const note = makeNote(P.note, uiG, 130, true);

      const rodCfg = P.rod === false ? null : Object.assign({ ghost: mode !== 'lobes' }, typeof P.rod === 'object' ? P.rod : {});
      const redKey = P.red || 'frontal';
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', mode === 'lobes' ? dur * 0.6 : 1e9);
          const pk = Math.max(punch(lt, hitAt, 0.6), punch(lt, atOr(cues, 'cut', 1e9), 0.6), punch(lt, atOr(cues, 'proof', 1e9), 0.6), punch(lt, atOr(cues, 'trace', 1e9), 0.6));
          const zoom = (P.cam && P.cam.zoom) || 1.06;
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * pk);
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.5) * 7)} ${f1(Math.cos(lt * 0.4) * 5)}) translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          const intro = sm(prog(lt, 0, 0.6));

          if (scr) {
            const x0 = cx - R * 1.75, x1 = cx + R * 1.75, y0 = cy - R * 1.32, y1 = cy + R * 1.32;
            const box = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
            scr.f.setAttribute('d', inkLoop(box, O(90, { smooth: false })));
            scr.r.setAttribute('d', inkPath(box, O(90, { w: 8, closed: true, smooth: false })));
            let gd = '';
            for (let gx = x0 + 70; gx < x1 - 20; gx += 90) gd += ' ' + inkPath([[gx, y0 + 14], [gx, y1 - 14]], O(100 + gx | 0, { w: 2, amp: 0.8 }));
            for (let gy = y0 + 70; gy < y1 - 20; gy += 90) gd += ' ' + inkPath([[x0 + 14, gy], [x1 - 14, gy]], O(300 + gy | 0, { w: 2, amp: 0.8 }));
            scr.grid.setAttribute('d', gd);
            scr.stand.setAttribute('d', inkPath([[cx, y1], [cx, y1 + 60]], O(91, { w: 10 })) + ' ' + inkPath([[cx - 140, y1 + 64], [cx + 140, y1 + 64]], O(92, { w: 9 })));
            const by = lerp(y0 + 20, y1 - 20, (lt * 0.45) % 1);
            scr.bar.setAttribute('d', inkLoop([[x0 + 10, by - 26], [x1 - 10, by - 26], [x1 - 10, by + 4], [x0 + 10, by + 4]], O(93, { smooth: false, amp: 0.6 })));
            scr.barL.setAttribute('d', inkPath([[x0 + 10, by + 4], [x1 - 10, by + 4]], O(94, { w: 4 })));
            // skull outline around the brain: cranium, brow, eye socket, cheekbone, upper jaw
            const sk = [[-1.12, 0.1], [-1.1, -0.42], [-0.86, -0.86], [-0.42, -1.14], [0.1, -1.18], [0.62, -1.02], [1.0, -0.66], [1.16, -0.18], [1.12, 0.3], [0.9, 0.62], [0.5, 0.86],
              [0.3, 1.16], [0.0, 1.2], [-0.4, 1.18], [-0.82, 1.12], [-1.14, 0.96], [-1.2, 0.7], [-1.26, 0.5], [-1.2, 0.3]].map(BB);
            scr.skullF.setAttribute('d', inkLoop(sk, O(95)));
            scr.skull.setAttribute('d', inkPath(sk, O(95, { w: 6, closed: true })) + ' ' + inkPath([[-1.12, 0.12], [-0.94, 0.06], [-0.84, 0.2], [-0.92, 0.4], [-1.12, 0.42]].map(BB), O(96, { w: 5, closed: true })) +
              ' ' + inkPath([[-0.9, 0.58], [-0.55, 0.6], [-0.2, 0.7]].map(BB), O(97, { w: 5 })) + ' ' + inkPath([[-1.2, 0.96], [-0.9, 0.98], [-0.6, 1.0]].map(BB), O(98, { w: 4 })));
          }

          // brain body
          const scanK = mode === 'scan' ? 0.92 : 1;
          const BBs = q => B(q[0] * scanK, q[1] * scanK);
          fillF.setAttribute('d', inkLoop(OUT.map(BBs), O(1)));
          cerF.setAttribute('d', inkLoop(CEREB.map(BBs), O(3))); stemF.setAttribute('d', inkLoop(STEM.map(BBs), O(2)));
          // lobe tints
          const proofAt = atOr(cues, 'proof', 1e9), hitRed = mode === 'lobes' ? hitAt : mode === 'scan' ? atOr(cues, 'trace', 1e9) + 0.5 : mode === 'wires' ? 0 : 1e9;
          Object.keys(LOBES).forEach((k, i) => {
            let a = 0;
            if (mode === 'jobs' && P.tints !== false) a = 0.32 * sm((lt - proofAt - i * 0.35) / 0.4);
            if (k === redKey && (mode === 'lobes' || mode === 'scan' || mode === 'wires')) a = Math.max(a, (mode === 'wires' ? 0.18 : 0.38) * sm((lt - hitRed) / 0.5) * (1 + 0.3 * pk));
            if (k === redKey && P.red_always) a = Math.max(a, 0.36);
            lobeF[k].setAttribute('d', inkLoop(LOBES[k].map(BBs), O(10 + i, { amp: 1.2 })));
            lobeF[k].setAttribute('fill-opacity', f1(a * intro * 100) / 100);
          });
          // red hatch over the damaged lobe
          const hp = mode === 'lobes' ? sm((lt - hitAt) / 0.8) : (P.red_always ? 1 : 0);
          let hd = '';
          if (hp > 0.01) {
            for (let k = 0; k < 9; k++) {
              const u0 = -0.95 + k * 0.1, a = BBs([u0, 0.05 - k * 0.02]), b = BBs([u0 + 0.38, -0.8 + k * 0.05]);
              if (k / 9 < hp) hd += ' ' + inkPath([a, [lerp(a[0], b[0], 0.9), lerp(a[1], b[1], 0.9)]], O(60 + k, { w: 3.5 }));
            }
          }
          hatch.setAttribute('d', hd);
          // outlines
          const showSulci = mode !== 'jobs' ? 1 : prog(lt, proofAt, 0.8);
          lineR.setAttribute('d', inkPath(OUT.map(BBs), O(1, { w: 7, closed: true })) + ' ' + inkPath(CEREB.map(BBs), O(3, { w: 5, closed: true })) + ' ' + inkPath(STEM.map(BBs), O(2, { w: 5, closed: true })));
          sulR.setAttribute('d', showSulci > 0.01 ? SULCI.map((s, i) => {
            const n = Math.max(2, Math.round(s.length * showSulci));
            const pts = s.slice(0, n).map(BBs);
            if (showSulci < 1) { const last = s.length - 1, f = s.length * showSulci - (n - 1); if (n <= last) pts.push(BBs([lerp(s[n - 1][0], s[n][0], clamp01(f)), lerp(s[n - 1][1], s[n][1], clamp01(f))])); }
            return inkPath(pts, O(20 + i, { w: 6 }));
          }).join(' ') : '');
          gyrR.setAttribute('d', gyri.map((g, i) => inkPath(g.map(BBs), O(40 + i, { w: 3.5, amp: 1.2 }))).join(' '));

          // fibres
          const cutAt = atOr(cues, 'cut', 1e9);
          fibres.forEach((f, i) => {
            const pr = prog(lt, 0.15 + f.dl, 0.9), n = Math.max(2, Math.round(f.pts.length * pr));
            const pts = f.pts.slice(0, n).map(BBs);
            const isCut = f.cut >= 0 && lt >= cutAt, gap = isCut ? sm((lt - cutAt) / 0.4) : 0;
            const col = isCut ? INK.red : INK.blue;
            f.n1.setAttribute('fill', col); f.n2.setAttribute('fill', col);
            if (pr < 0.02) { f.n1.setAttribute('d', ''); f.n2.setAttribute('d', ''); return; }
            if (!isCut) { f.n1.setAttribute('d', inkPath(pts, O(200 + i, { w: 5 }))); f.n2.setAttribute('d', ''); return; }
            const g = Math.round(1 + gap * 2), a = f.pts.slice(0, Math.max(2, f.cut - g + 1)).map(BBs), b = f.pts.slice(Math.min(f.pts.length - 2, f.cut + g)).map(BBs);
            const sag = gap * 14;
            f.n1.setAttribute('d', inkPath(a.map((p, k) => k === a.length - 1 ? [p[0], p[1] + sag] : p), O(200 + i, { w: 5 })));
            f.n2.setAttribute('d', inkPath(b.map((p, k) => k === 0 ? [p[0], p[1] + sag] : p), O(260 + i, { w: 5 })));
          });

          // iron rod
          if (rodCfg) {
            const A = BB(ROD[0]), Bt = BB(ROD[1]);
            const rodAt = atOr(cues, rodCfg.at || 'rod', mode === 'lobes' ? 0.4 : 0), rp = rodCfg.ghost ? 1 : prog(lt, rodAt, rodCfg.dur || 0.7);
            const dx = Bt[0] - A[0], dy = Bt[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
            const hw = R * 0.045;
            if (rodCfg.ghost) {
              let d = '';
              for (let k = 0; k < 14; k++) { const a0 = k / 14, a1 = a0 + 0.045; d += ' ' + inkPath([[A[0] + dx * a0, A[1] + dy * a0], [A[0] + dx * a1, A[1] + dy * a1]], O(400 + k, { w: 6 })); }
              rodG.setAttribute('d', d); rodF.setAttribute('d', ''); rodR.setAttribute('d', '');
            } else if (rp > 0.01) {
              // the bar slides up along its path: its tip leads, the tail follows (full length ≈ 70 % of the path)
              const tip = rp, tail = Math.max(0, rp - 0.75);
              const P0 = [A[0] + dx * tail, A[1] + dy * tail], P1 = [A[0] + dx * tip, A[1] + dy * tip];
              const pt = [P1[0] + ux * hw * 3, P1[1] + uy * hw * 3];
              const poly = [[P0[0] + nx * hw, P0[1] + ny * hw], [P1[0] + nx * hw, P1[1] + ny * hw], pt, [P1[0] - nx * hw, P1[1] - ny * hw], [P0[0] - nx * hw * 1.2, P0[1] - ny * hw * 1.2]];
              rodF.setAttribute('d', inkLoop(poly, O(70, { smooth: false, amp: 1 })));
              rodR.setAttribute('d', inkPath(poly, O(70, { w: 5, closed: true, smooth: false })));
              // speed lines behind the tail
              rodG.setAttribute('d', rp < 1 ? [0, 1, 2].map(k => inkPath([[P0[0] - ux * 30 + nx * (k - 1) * 22, P0[1] - uy * 30 + ny * (k - 1) * 22], [P0[0] - ux * 120 + nx * (k - 1) * 22, P0[1] - uy * 120 + ny * (k - 1) * 22]], O(80 + k, { w: 4 }))).join(' ') : '');
            } else { rodF.setAttribute('d', ''); rodR.setAttribute('d', ''); rodG.setAttribute('d', ''); }
          }
          if (scanTrace) {
            const tr = atOr(cues, 'trace', dur * 0.5), tp = prog(lt, tr, 1.0), A = BB(ROD[0]), Bt = BB(ROD[1]);
            let d = '';
            for (let k = 0; k < 16; k++) { const a0 = k / 16, a1 = a0 + 0.04; if (a1 <= tp) d += ' ' + inkPath([[lerp(A[0], Bt[0], a0), lerp(A[1], Bt[1], a0)], [lerp(A[0], Bt[0], a1), lerp(A[1], Bt[1], a1)]], O(500 + k, { w: 9 })); }
            scanTrace.setAttribute('d', d);
          }
          // question marks: bob, fade out at proof
          qs.forEach(q => {
            const p = BB(q.q), fade = 1 - sm((lt - proofAt) / 0.4), a = sm((lt - 0.2 - q.i * 0.25) / 0.4) * fade, b = boil(sd + 600 + q.i, t, 2);
            q.tx.setAttribute('opacity', f1(a * 10) / 10);
            q.tx.setAttribute('transform', `translate(${f1(p[0] + b[0])} ${f1(p[1] + 36 + Math.sin(lt * 2 + q.i) * 10 + b[1])}) rotate(${(q.i % 2 ? 8 : -8) + Math.sin(lt * 1.6 + q.i) * 6})`);
          });
          updateCast(cast, lt, t, cues, W, H, G, sd + 9000);
          labels.forEach((n, i) => updateNote(n, lt, t, cues, W, H, sd + 7000 + i * 50, 0.4 + i * 0.5));
          updateNote(note, lt, t, cues, W, H, sd + 7900, 0.3);
        },
      };
    },
  };
  // aliases: the scan screen and the cut-wiring view as their own types (same params, mode fixed)
  const aliasBuild = mode => ctx => SH.pgc_brain.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode }) }));
  SH.pgc_scan = { kind: '2d', build: aliasBuild('scan') };
  SH.pgc_wires = { kind: '2d', build: aliasBuild('wires') };
})();
