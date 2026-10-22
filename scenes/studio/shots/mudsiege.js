// mudsiege: a siege march in bad weather, in the parchment ink style (brand/kit/BRAND.md §3, §5; every line boils
// at 8 Hz via _ink.js, everything is a pure function of (seed, lt), no Math.random). Written for
// 03-viyana-kusatmasi-1529 (Kanuni's 1529 Vienna campaign: rain, mud, heavy guns left behind), but parametric.
//
// SHOTS.mudsiege — side view of a muddy road: far hills with an optional walled city (crenellated wall, round
//   towers, a tall gothic spire), an optional flooding river that rises and spills over its banks, a muddy field
//   with wheel ruts and puddles (rain rings), a big bronze siege cannon on a spoked two-wheel carriage that rolls in
//   and then sinks into the mud (tilts, splash), a distant column of small marching figures, period cast members
//   (hatless, KASIF rig with an accessory) and Kaşif, slanted ink rain or drifting snow, hand-written label.
//   P: {
//     ground: 0.57,               // 0..1 of H: the line the cast and the cannon stand on (portrait default 0.57)
//     horizon: 0.36,              // far hill line
//     rain: true | "cue" | false, // slanted rain strokes (from the cue: grows heavier), heavy: 1 (density 0.3..1.5)
//     snow: false | true | "cue", // drifting flakes (paper-light dots, ink-soft rims)
//     city: {x: 0.78, scale: 1, at} | false,      // far walls + towers + spire (Vienna)
//     river: {x0: 0, x1: 0.42, rise: "cue"} | false, // flooding river in the mid plane, spills over on `rise`
//     mud: "cue" | null,          // ruts and puddles darken / spread from this cue (default: already muddy)
//     cannon: {x: 0.42, to: 0.42, scale: 1, sink: "cue" | seconds, depth: 0.32 (of the wheel radius x 2), tilt: -9,
//              face: 1|-1, sunk: 0 (already sunk at the start, 0..1)} | false,
//              fire: "cue" (light gun: recoil, smoke puff, a ball that bounces off the wall and drops into the mud),
//     wall: {x: 0.64, h: 560, at} | false,       // near city wall standing on the ground line, running off the right edge
//     column: {n: 7, y: 0.4, scale: 0.26, dir: 1|-1, speed: 22 (px/s), accessory: "turban"} | false,
//     cast: [{who: "kasif"|name, accessory, beard, x, to, y, scale, pose, at, then, dir, face: "left"|"right",
//             emotion, then_emotion, text, item}],
//     label: {text, x: 0.5, y: 0.2, at, size: 84, color: "ink"|"red"},
//     cam: {zoom: 1.06, focus: [0.5, 0.55]}
//   }
//   cues: whatever the params reference (sink, rise, mud, label.at, cast at)
//
// SHOTS.siegetunnel — cross-section of a siege mine: surface strip with the city wall (right) and the besiegers'
//   side (left: tent, figures), below it the earth (hatching, stones). An attackers' tunnel is dug from the left
//   towards the foundations (a tiny turbaned digger with a pick and a gold lamp at its head); on `counter` the
//   defenders' counter-tunnel is dug down from under the wall towards it (helmeted digger); on `meet` they meet
//   with a red burst. Handwritten labels on both tunnels.
//   P: {ground: 0.42 (surface line, 0..1 of H), dig: cue|seconds (attack tunnel starts), counter: cue, meet: cue,
//       labels: {left: "lağım", right: "karşı lağım"}, cast: [...as above, standing on the surface],
//       cam: {zoom, focus}}
//   cues: dig, counter, meet, cast/label cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const around = (x, y, tf) => `translate(${f1(x)} ${f1(y)}) ${tf} translate(${f1(-x)} ${f1(-y)})`;
  const COL = c => ({ red: INK.red, gold: INK.gold, blue: INK.blue, soft: INK.inkSoft }[c] || INK.ink);

  // ---- shared: cast of KASIF rigs standing on a ground line
  function makeCast(parent, list, seed, baseScale) {
    if (typeof KASIF === 'undefined') return [];
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const rig = KASIF.create(el(parent, 'g'), { scale: baseScale * (m.scale || 1), hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + i * 7 + (isK ? 0 : 11) });
      return { m, rig, isK, s: baseScale * (m.scale || 1) };
    });
  }
  function updateCast(cast, lt, dur, cues, t, W, gy) {
    cast.forEach(c => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || m.pose || 'idle') : (m.pose || 'idle');
      const x0 = (m.x ?? 0.5) * W;
      let x = x0;
      if (m.to != null) {
        if (m.pose === 'walk' || m.pose === 'run') {
          const end = at != null ? at : dur;
          x = lerp(x0, m.to * W, clamp01(lt / Math.max(0.3, end)));
        } else x = m.to * W;
      }
      const since = after ? lt - at : lt;
      const dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : m.face === 'right' ? 1 : (typeof m.face === 'number' ? m.face : 1);
      const emo = after ? (m.then_emotion || m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.pre_emotion || null);
      const y = m.y != null ? m.y * (gy.H) : gy(x);
      const o = { x, y, face, since, dir, emotion: emo, text: m.text, item: m.item };
      if (pose === 'walk' || pose === 'run') o.ph = (x - x0) / (KASIF.gait(pose) * c.s) + (m.to == null ? t * 0.9 : 0);
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
    });
  }
  function makeLabel(root, L, portrait) {
    if (!L || !L.text) return null;
    const t = el(root, 'text', { 'font-family': INK_FONT, 'font-size': L.size || (portrait ? 84 : 66), 'text-anchor': 'middle', fill: COL(L.color),
      style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = L.text;
    return { L, t, u: inkEl(root, COL(L.color)) };
  }
  function updateLabel(lb, lt, cues, t, W, H, portrait, sd) {
    if (!lb) return;
    const L = lb.L, at = atOr(cues, L.at, 0.2), sp = spring(lt, at, 0.6), x = (L.x ?? 0.5) * W, y = (L.y ?? (portrait ? 0.2 : 0.16)) * H, b = boil(sd + 800, t, 1.2);
    lb.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
    lb.t.style.opacity = clamp01(sp * 2);
    const tw = lb.t.getComputedTextLength ? Math.min(W * 0.8, lb.t.getComputedTextLength()) : 300, pu = prog(lt, at + 0.25, 0.5);
    lb.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 16]], { seed: sd + 801, t, w: 6 }) : '');
  }

  // ---------------------------------------------------------------- mudsiege
  SH.mudsiege = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const GY = (P.ground ?? (portrait ? 0.57 : 0.8)) * H, HZ = (P.horizon ?? (portrait ? 0.36 : 0.5)) * H;
      const gyf = () => GY; gyf.H = H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const io = (k, t, extra) => Object.assign({ seed: sd + k, t, amp: 1.6 }, extra);
      // layers (back to front)
      const farF = mk(world, INK.paperDark), farL = mk(world, INK.inkSoft);
      const cityG = el(world, 'g'), cityF = mk(cityG, INK.paperDark), cityL = mk(cityG, INK.inkSoft), cityW = mk(cityG, INK.inkSoft);
      const colG = el(world, 'g');
      const fieldF = mk(world, INK.paperDark), fieldL = mk(world), ruts = mk(world, INK.inkSoft);
      const riverF = mk(world, INK.paperLight), riverL = mk(world, INK.inkSoft), riverW = mk(world, INK.inkSoft);
      const puddleF = mk(world, INK.paperLight), puddleL = mk(world, INK.inkSoft), rings = mk(world, INK.inkSoft);
      const nwF = mk(world, INK.paperLight), nwL = mk(world), nwB = mk(world, INK.inkSoft), nwChip = mk(world, INK.inkSoft);
      const canG = el(world, 'g');
      const smokeF = mk(world, INK.paperLight), smokeL = mk(world, INK.inkSoft), ballE = mk(world), ballT = mk(world, INK.inkSoft);
      const castBack = el(world, 'g');
      const frontF = mk(world, INK.paperDark), frontL = mk(world), frontH = mk(world, INK.inkSoft), splash = mk(world, INK.inkSoft), splashF = mk(world, INK.paperDark);
      const frontPud = mk(world, INK.paperLight), frontPudL = mk(world, INK.inkSoft);
      const rainE = el(root, 'path', { fill: 'none', stroke: INK.inkSoft, 'stroke-width': 4, 'stroke-linecap': 'round' });
      const snowF = mk(root, INK.paperLight), snowL = mk(root, INK.inkSoft);
      // static scatter
      const r = rng(seed * 31 + 7);
      const farPts = []; for (let x = -60; x <= W + 60; x += 80) farPts.push([x, HZ + Math.sin(x * 0.006 + seed) * 26 + Math.sin(x * 0.017) * 10]);
      const farY = x => { let k = 0; while (k < farPts.length - 2 && farPts[k + 1][0] < x) k++; const a = farPts[k], b = farPts[k + 1]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); };
      const drops = Array.from({ length: 210 }, () => ({ x: r() * (W + 400) - 200, y: r(), v: 0.75 + r() * 0.5, l: 34 + r() * 30 }));
      const flakes = Array.from({ length: 70 }, () => ({ x: r() * W, y: r(), v: 0.6 + r() * 0.6, s: 6 + r() * 7, ph: r() * 6.28 }));
      const safe = y => !portrait || y < 1160 || y > 1330;
      const puds = [];
      for (let i = 0; i < 7; i++) { const x = (0.08 + i * 0.14 + r() * 0.05) * W, y = lerp(HZ + 40, GY - 18, 0.35 + r() * 0.6); puds.push({ x, y, rx: 50 + r() * 60, ry: 10 + r() * 6 }); }
      const fpuds = [];
      for (let i = 0; i < 5; i++) { const x = (0.1 + i * 0.2 + r() * 0.06) * W, y = portrait ? (i % 2 ? 1370 + r() * 70 : 1120 + r() * 25) : GY + 40 + r() * (H - GY - 80); if (safe(y)) fpuds.push({ x, y, rx: 70 + r() * 60, ry: 14 + r() * 6 }); }
      const hatch = [];
      for (let y = GY + 44; y < H; y += 36) for (let x = r() * 50; x < W; x += 70 + r() * 50) if (safe(y) && safe(y + 14)) hatch.push([[x, y + 10], [x + 30, y - 4]]);
      // column of small marching figures (period soldiers)
      const C = P.column ? Object.assign({ n: 7, y: (portrait ? 0.41 : 0.56), scale: portrait ? 0.24 : 0.2, dir: 1, speed: 22, accessory: 'turban' }, P.column) : null;
      const column = C && typeof KASIF !== 'undefined' ? Array.from({ length: C.n }, (_, i) => ({ i, rig: KASIF.create(el(colG, 'g'), { scale: C.scale, hat: false, accessory: i % 3 === 2 ? 'helmet' : C.accessory, seed: seed + 300 + i }) })) : [];
      const banners = C ? mk(colG, INK.red) : null, poles = C ? mk(colG) : null;
      // cannon
      const CN = P.cannon ? Object.assign({ x: 0.42, scale: 1, depth: 0.32, tilt: -9, face: 1 }, P.cannon) : null;
      const can = CN ? { wheelF: mk(canG, INK.paperLight), trailF: mk(canG, INK.paperDark), trail: mk(canG), barF: mk(canG, INK.gold), bar: mk(canG), barHi: mk(canG, INK.paperLight), wheel: mk(canG), spokes: mk(canG) } : null;
      const cast = makeCast(castBack, P.cast, seed, portrait ? 0.82 : 0.62);
      const label = makeLabel(root, P.label, portrait);
      // city geometry (far plane): wall with crenels, round towers, gothic spire
      const CI = P.city ? Object.assign({ x: portrait ? 0.76 : 0.78, scale: 1 }, P.city) : null;
      let cityPts = null, cityWin = [];
      if (CI) {
        const s = CI.scale * (portrait ? 1 : 0.9), cx = CI.x * W, by = farY(cx) + 6, ww = 300 * s, wh = 70 * s;
        const pts = [[cx - ww, by]];
        // left round tower
        pts.push([cx - ww, by - wh * 1.5], [cx - ww + 14 * s, by - wh * 1.5], [cx - ww + 14 * s, by - wh * 1.7], [cx - ww + 30 * s, by - wh * 1.7], [cx - ww + 30 * s, by - wh * 1.5], [cx - ww + 46 * s, by - wh * 1.5], [cx - ww + 46 * s, by - wh]);
        // crenellated wall to the spire
        let x = cx - ww + 46 * s;
        while (x < cx - 40 * s) { pts.push([x, by - wh - 14 * s], [x + 14 * s, by - wh - 14 * s], [x + 14 * s, by - wh], [x + 26 * s, by - wh]); x += 26 * s; }
        // spire (St. Stephen's-like): tall tower with a needle top
        pts.push([cx - 40 * s, by - wh - 60 * s], [cx - 30 * s, by - wh - 150 * s], [cx - 12 * s, by - wh - 170 * s], [cx, by - wh - 260 * s], [cx + 12 * s, by - wh - 170 * s], [cx + 30 * s, by - wh - 150 * s], [cx + 40 * s, by - wh - 60 * s], [cx + 40 * s, by - wh]);
        x = cx + 40 * s;
        while (x < cx + ww - 46 * s) { pts.push([x, by - wh], [x + 12 * s, by - wh], [x + 12 * s, by - wh - 14 * s], [x + 26 * s, by - wh - 14 * s]); x += 26 * s; }
        pts.push([cx + ww - 46 * s, by - wh], [cx + ww - 46 * s, by - wh * 1.5], [cx + ww - 30 * s, by - wh * 1.5], [cx + ww - 30 * s, by - wh * 1.7], [cx + ww - 14 * s, by - wh * 1.7], [cx + ww - 14 * s, by - wh * 1.5], [cx + ww, by - wh * 1.5], [cx + ww, by]);
        cityPts = pts;
        cityWin = [[cx - 6 * s, by - wh - 110 * s], [cx - ww + 22 * s, by - wh * 1.25], [cx + ww - 22 * s, by - wh * 1.25]];
      }
      const RV = P.river ? Object.assign({ x0: 0, x1: portrait ? 0.46 : 0.4 }, P.river) : null;
      // near city wall (standing on the ground line, running off the right edge)
      const NW = P.wall ? Object.assign({ x: 0.64, h: portrait ? 560 : 420 }, P.wall) : null;
      let nwPts = null, nwBricks = [];
      if (NW) {
        const x0 = NW.x * W, top = GY - NW.h;
        nwPts = [[x0, GY + 20], [x0 + 16, top + 30]];
        for (let x = x0 + 16; x < W + 40; x += 64) nwPts.push([x, top], [x + 34, top], [x + 34, top + 30], [x + 64, top + 30]);
        nwPts.push([W + 80, top + 30], [W + 80, GY + 20]);
        for (let y = top + 80, row = 0; y < GY - 10; y += 56, row++) for (let x = x0 + 40 + (row % 2) * 40; x < W; x += 92) nwBricks.push([[x, y], [x + 56, y + 2]]);
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // camera: slow push-in + shake on sink
          const sinkAt = CN ? atOr(cues, CN.sink, null) : null, shk = punch(lt, sinkAt, 0.7);
          const cz = lerp(1, (P.cam && P.cam.zoom) || 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fx = ((P.cam && P.cam.focus) || [0.5, 0.55])[0] * W, fy = ((P.cam && P.cam.focus) || [0.5, 0.55])[1] * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(t * 0.33) * 6 + Math.sin(t * 61) * 10 * shk)} ${f1(Math.cos(t * 0.27) * 5 + Math.cos(t * 53) * 8 * shk)}) ${around(fx, fy, `scale(${(cz).toFixed(4)})`)}`);
          // far hills
          farF.setAttribute('d', inkLoop([...farPts, [W + 60, GY], [-60, GY]], io(1, t, { amp: 1, smooth: false })));
          farL.setAttribute('d', inkPath(farPts, io(2, t, { w: 4 })));
          // city
          if (CI) {
            const p = spring(lt, atOr(cues, CI.at, 0), 0.7);
            cityG.setAttribute('transform', `translate(0 ${f1((1 - p) * 40)})`);
            cityF.setAttribute('d', inkLoop(cityPts, io(10, t, { smooth: false, amp: 1 })));
            cityL.setAttribute('d', inkPath(cityPts, io(11, t, { w: 3.5, smooth: false, amp: 1, closed: true })));
            cityW.setAttribute('d', cityWin.map((q, i) => inkDot(q[0], q[1], 5, 9, sd + 12 + i, t)).join(' '));
          }
          // marching column
          if (C && column.length) {
            const cy = C.y * H, gap = 1.6 * 540 * C.scale * 0.5, span = C.n * gap;
            let bd = '', pd = '';
            column.forEach(c => {
              const raw = (c.i * gap + t * C.speed) % (span + 200);
              const x = C.dir > 0 ? raw - 100 : W + 100 - raw;
              const xx = C.dir > 0 ? x : x;
              const trudge = Math.sin(t * 2.2 + c.i) * 2;
              c.rig.update(t, 'walk', { x: xx, y: cy + trudge, face: C.dir, ph: t * C.speed / (KASIF.gait('walk') * C.scale) + c.i * 0.3, since: lt });
              if (c.i % 3 === 0) {
                const top = [xx - 18 * C.dir, cy - 620 * C.scale], bot = [xx - 18 * C.dir, cy - 250 * C.scale], wv = Math.sin(t * 3 + c.i) * 8;
                pd += inkPath([bot, top], io(40 + c.i, t, { w: 4 })) + ' ';
                bd += inkLoop([top, [top[0] - 70 * C.dir * C.scale * 4 / 4, top[1] + 14 + wv], [top[0] - 60 * C.dir, top[1] + 46 + wv], [top[0], top[1] + 50]], io(60 + c.i, t, { amp: 1 })) + ' ';
              }
            });
            banners.setAttribute('d', bd); poles.setAttribute('d', pd);
          }
          // field + ruts
          const mudAt = atOr(cues, P.mud, null), mudP = mudAt == null ? 1 : progIO(lt, mudAt, 1.0);
          fieldF.setAttribute('d', inkLoop([[-60, HZ + 30], [W + 60, HZ + 30], [W + 60, GY + 20], [-60, GY + 20]], io(20, t, { smooth: false, amp: 0 })));
          let rd = '';
          for (let k = 0; k < 4; k++) {
            const y = lerp(HZ + 60, GY - 10, k / 3);
            const pts = []; for (let x = -40; x <= W + 40; x += 90) pts.push([x, y + Math.sin(x * 0.01 + k * 2) * 6]);
            rd += inkPath(pts, io(25 + k, t, { w: 2.5 + 3 * mudP + k * 0.6 })) + ' ';
          }
          ruts.setAttribute('d', rd);
          // river
          if (RV) {
            const riseAt = atOr(cues, RV.rise, null), rise = riseAt == null ? 1 : progIO(lt, riseAt, 1.2);
            // a winding river from the far hills (narrow) to the front left (wide); on `rise` it swells over its banks
            const C0 = u => [lerp(RV.x1 * W, RV.x0 * W + 60, u) + Math.sin(u * 4.2 + 0.6) * 60, lerp(HZ + 22, GY - 26, u)];
            const hw = u => lerp(12, 80, u) * lerp(1, 2.1, rise) + Math.sin(u * 13 + t * 2) * 3 * rise;
            const left = [], right = [];
            for (let i = 0; i <= 16; i++) { const u = i / 16, c = C0(u), w = hw(u); left.push([c[0] - w * 1.5, c[1]]); right.unshift([c[0] + w * 1.5, c[1]]); }
            const poly = [...left, ...right];
            riverF.setAttribute('d', inkLoop(poly, io(30, t, { amp: 1 })));
            riverL.setAttribute('d', inkPath(left, io(31, t, { w: 4 })) + ' ' + inkPath(right, io(33, t, { w: 4 })));
            let wd = '';
            for (let k = 0; k < 7; k++) {
              const u = ((k / 7) + t * 0.18) % 1, c = C0(u), ww = hw(u) * 0.8;
              const pts = []; for (let i = 0; i <= 6; i++) pts.push([c[0] - ww + i * ww / 3, c[1] + Math.sin(i * 1.6 + t * 4) * 4]);
              wd += inkPath(pts, io(40 + k, t, { w: 3, amp: 0.8 })) + ' ';
            }
            riverW.setAttribute('d', wd);
          }
          // puddles + rain rings
          const rainAt = P.rain === false ? null : atOr(cues, typeof P.rain === 'string' ? P.rain : null, 0);
          const rainK = rainAt == null ? 0 : (typeof P.rain === 'string' ? lerp(0.35, 1, prog(lt, rainAt, 0.8)) : 1) * (P.heavy ?? 1);
          let pf = '', pl = '', rg = '';
          puds.forEach((q, i) => {
            const g = lerp(0.6, 1.25, mudP);
            const pts = inkEllipsePts(q.x, q.y, q.rx * g, q.ry * g, sd + 70 + i, 12);
            pf += inkLoop(pts, io(70 + i, t, { amp: 0.8 })) + ' ';
            pl += inkPath(pts, io(70 + i, t, { w: 3, closed: true, amp: 0.8 })) + ' ';
            if (rainK > 0) for (let j = 0; j < 2; j++) {
              const ph = (t * 1.4 + i * 0.37 + j * 0.5) % 1, cx = q.x + (j ? 0.35 : -0.3) * q.rx * g, rr = 6 + ph * 22;
              if (ph < 0.8) rg += inkPath(inkEllipsePts(cx, q.y, rr, rr * 0.28, sd + 90 + i * 2 + j, 10), io(90 + i * 2 + j, t, { w: 2.5, closed: true, amp: 0.5 })) + ' ';
            }
          });
          puddleF.setAttribute('d', pf); puddleL.setAttribute('d', pl); rings.setAttribute('d', rg);
          // cannon
          let muzzle = null;
          if (CN) {
            const s = CN.scale * (portrait ? 1 : 0.8), face = CN.face;
            const sinkP = sinkAt == null ? (CN.sunk ?? 0) : Math.max(CN.sunk ?? 0, progIO(lt, sinkAt, 1.1));
            const rollEnd = sinkAt ?? dur;
            const fireAt = atOr(cues, CN.fire, null), rec = punch(lt, fireAt, 0.5);
            const x = lerp((CN.x) * W, (CN.to ?? CN.x) * W, clamp01(lt / Math.max(0.3, rollEnd))) - rec * 26 * CN.face;
            const R = 110 * s, depth = (CN.depth ?? 0.32) * 2 * R * sinkP;
            const wobble = sinkAt != null && lt < sinkAt ? Math.sin(t * 7) * 1.2 : 0;
            const tilt = (CN.tilt ?? -9) * sinkP * face + wobble;
            const wc = [x, GY - R + depth];
            canG.setAttribute('transform', around(wc[0], wc[1], `rotate(${f1(tilt)})`));
            const L = (p) => [wc[0] + p[0] * s * face, wc[1] + p[1] * s];
            muzzle = L([336, -110]);
            // trail (wooden carriage cheek running back to the ground)
            const trail = [[-20, -62], [60, -84], [-330, 100], [-362, 98], [-384, 72], [-60, -8]].map(L);
            can.trailF.setAttribute('d', inkLoop(trail, io(100, t, { smooth: false, amp: 1 })));
            can.trail.setAttribute('d', inkPath(trail, io(101, t, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([L([-200, 30]), L([-150, 40])], io(102, t, { w: 3.5 })));
            // barrel: long tapering bronze tube, muzzle ring, cascabel knob
            const bar = [[-230, -110], [-210, -150], [-120, -158], [300, -132], [330, -136], [330, -84], [300, -88], [-120, -66], [-210, -70]].map(L);
            can.barF.setAttribute('d', inkLoop(bar, io(110, t, { smooth: false, amp: 1 })) + ' ' + inkDot(...L([-252, -110]), 26 * s, 26 * s, sd + 111, t));
            can.bar.setAttribute('d', inkPath(bar, io(112, t, { w: 6, closed: true, smooth: false })) + ' ' +
              [-120, 40, 200, 300].map((bx, i) => inkPath([L([bx, -158 + (bx + 120) * 0.06]), L([bx, -66 - (bx + 120) * 0.05])], io(113 + i, t, { w: 4 }))).join(' ') + ' ' +
              inkCircle(...L([-252, -110]), 26 * s, sd + 118, t, { w: 4 }));
            can.barHi.setAttribute('d', inkPath([L([-100, -140]), L([280, -122])], io(119, t, { w: 5, amp: 0.8 })));
            // wheel: rim, hub, 8 spokes; spins while rolling
            const roll = (x - CN.x * W) / R;
            can.wheelF.setAttribute('d', inkCircle(wc[0], wc[1], R, sd + 120, t, { fill: true }));
            can.wheel.setAttribute('d', inkCircle(wc[0], wc[1], R, sd + 120, t, { w: 9 }) + ' ' + inkCircle(wc[0], wc[1], R * 0.84, sd + 121, t, { w: 3.5 }) + ' ' + inkDot(wc[0], wc[1], 18 * s, 18 * s, sd + 122, t));
            let sp = '';
            for (let k = 0; k < 8; k++) { const a = roll * face + k * Math.PI / 4; sp += inkPath([[wc[0] + Math.cos(a) * 16 * s, wc[1] + Math.sin(a) * 16 * s], [wc[0] + Math.cos(a) * R * 0.86, wc[1] + Math.sin(a) * R * 0.86]], io(130 + k, t, { w: 5 })) + ' '; }
            can.spokes.setAttribute('d', sp);
            // mud splash on the sink
            const sp2 = sinkAt != null ? prog(lt, sinkAt, 0.9) : 0;
            let sd2 = '', sf = '';
            if (sinkAt != null && lt >= sinkAt && sp2 < 1) {
              for (let k = 0; k < 7; k++) {
                const a = -Math.PI * (0.15 + 0.7 * k / 6), d = 40 + sp2 * (120 + k * 14), up = Math.sin(sp2 * Math.PI) * 60;
                const bx = x + Math.cos(a) * d, by = GY + Math.sin(a) * d * 0.5 - up * 0.5 + sp2 * sp2 * 120;
                const rr = 14 * (1 - sp2 * 0.6);
                sf += inkDot(bx, by, rr, rr * 0.8, sd + 140 + k, t) + ' ';
              }
            }
            if (sinkP > 0.02) {
              // mud piled up against the sunk wheel
              const m = []; for (let i = 0; i <= 8; i++) { const u = i / 8; m.push([x - R * 1.5 + u * R * 3, GY + 8 - Math.sin(u * Math.PI) * 26 * sinkP + Math.sin(u * 9 + seed) * 4]); }
              sd2 = inkLoop([...m, [x + R * 1.5, GY + 40], [x - R * 1.5, GY + 40]], io(150, t, { amp: 1 }));
              splashF.setAttribute('d', sd2);
              splash.setAttribute('d', inkPath(m, io(151, t, { w: 5 })) + ' ' + sf);
            } else { splashF.setAttribute('d', ''); splash.setAttribute('d', sf); }
          }
          // near wall
          if (NW) {
            const p = spring(lt, atOr(cues, NW.at, 0), 0.6);
            const tf = `translate(${f1((1 - p) * 120)} 0)`;
            [nwF, nwL, nwB, nwChip].forEach(e => e.setAttribute('transform', tf));
            nwF.setAttribute('d', inkLoop(nwPts, io(170, t, { smooth: false, amp: 1 })));
            nwL.setAttribute('d', inkPath(nwPts, io(171, t, { w: 6, smooth: false, closed: true })));
            nwB.setAttribute('d', nwBricks.map((q, i) => inkPath(q, io(500 + i, t, { w: 3, amp: 0.8 }))).join(' '));
          }
          // light gun: smoke puff + a ball that bounces off the wall
          if (CN && muzzle) {
            const fireAt = atOr(cues, CN.fire, null);
            if (fireAt != null && lt >= fireAt) {
              const u = lt - fireAt;
              let sf = '', sl = '';
              for (let k = 0; k < 4; k++) {
                const g = clamp01((u - k * 0.06) / 1.2); if (g <= 0 || g >= 1) continue;
                const rr = (18 + 60 * Math.sqrt(g)) * (1 - g * 0.5), cx = muzzle[0] + (20 + k * 26) * CN.face * Math.sqrt(g) + Math.sin(k * 2) * 10, cy = muzzle[1] - 50 * g - k * 10;
                sf += inkCircle(cx, cy, rr, sd + 600 + k, t, { fill: true }) + ' '; sl += inkCircle(cx, cy, rr, sd + 600 + k, t, { w: 3.5 }) + ' ';
              }
              smokeF.setAttribute('d', sf); smokeL.setAttribute('d', sl);
              const wx = NW ? NW.x * W + 10 : W * 0.8, yi = muzzle[1] - 30, fl = 0.45;
              let bx, by;
              if (u < fl) { const v = u / fl; bx = lerp(muzzle[0], wx - 18, v); by = lerp(muzzle[1], yi, v) - Math.sin(Math.PI * v) * 50; }
              else { const v = clamp01((u - fl) / 0.9); bx = wx - 18 - v * 170; by = lerp(yi, GY - 6, v * v) - Math.sin(Math.PI * v) * 60; if (u > fl + 0.9) bx -= Math.min(40, (u - fl - 0.9) * 30); }
              const br = 15 * (CN.scale || 1) * (portrait ? 1.4 : 1.1);
              ballE.setAttribute('d', inkDot(bx, by, br, br, sd + 610, t));
              const hit = punch(lt, fireAt + fl, 0.6);
              ballT.setAttribute('d', u < fl ? inkPath([[bx - 50 * CN.face, by + 4], [bx - 16 * CN.face, by]], io(611, t, { w: 3 })) :
                (hit > 0.02 ? [0, 1, 2, 3, 4].map(k => { const a = Math.PI * (0.6 + k * 0.2); return inkPath([[wx - 10 + Math.cos(a) * 20, yi + Math.sin(a) * 20], [wx - 10 + Math.cos(a) * (20 + 40 * hit), yi + Math.sin(a) * (20 + 40 * hit)]], io(620 + k, t, { w: 4 })); }).join(' ') : ''));
              if (NW) nwChip.setAttribute('d', inkPath([[wx + 4, yi - 12], [wx + 14, yi], [wx + 6, yi + 10]], io(630, t, { w: 3 })));
            } else { smokeF.setAttribute('d', ''); smokeL.setAttribute('d', ''); ballE.setAttribute('d', ''); ballT.setAttribute('d', ''); }
          }
          // cast
          updateCast(cast, lt, dur, cues, t, W, gyf);
          // front mud band (over the feet and the sunk wheel)
          const fe = []; for (let x = -60; x <= W + 60; x += 60) fe.push([x, GY + 14 + Math.sin(x * 0.02 + seed) * 5]);
          frontF.setAttribute('d', inkLoop([...fe, [W + 60, H + 40], [-60, H + 40]], io(160, t, { amp: 0.8 })));
          frontL.setAttribute('d', inkPath(fe, io(161, t, { w: 6 })));
          frontH.setAttribute('d', hatch.map((q, i) => inkPath(q, io(200 + i, t, { w: 3, amp: 1 }))).join(' '));
          let fp = '', fl = '';
          fpuds.forEach((q, i) => { const pts = inkEllipsePts(q.x, q.y, q.rx * lerp(0.7, 1.2, mudP), q.ry, sd + 180 + i, 12); fp += inkLoop(pts, io(180 + i, t, { amp: 0.8 })) + ' '; fl += inkPath(pts, io(180 + i, t, { w: 3, closed: true, amp: 0.8 })) + ' '; });
          frontPud.setAttribute('d', fp); frontPudL.setAttribute('d', fl);
          // rain: slanted strokes, falling continuously
          if (rainK > 0) {
            const n = Math.round(drops.length * Math.min(1, rainK / 1.5) * 1.0), span = H + 200;
            let d = '';
            for (let i = 0; i < n; i++) {
              const q = drops[i], y = ((q.y * span + t * 1500 * q.v) % span) - 100, x = q.x - y * 0.25 + Math.sin(i) * 3;
              if (portrait && y > 1150 && y < 1330) continue;
              d += `M${f1(x)} ${f1(y)}l${f1(-q.l * 0.25)} ${f1(q.l)}`;
            }
            rainE.setAttribute('d', d);
            rainE.setAttribute('stroke-opacity', (0.85 * Math.min(1, rainK)).toFixed(2));
            rainE.setAttribute('stroke-width', (3.5 + 1.5 * Math.min(1, rainK)).toFixed(1));
          } else rainE.setAttribute('d', '');
          // snow
          const snowAt = P.snow ? atOr(cues, typeof P.snow === 'string' ? P.snow : null, 0) : null;
          if (snowAt != null) {
            const k = prog(lt, snowAt, 1.0), n = Math.round(flakes.length * k);
            let sf = '', sl = '';
            for (let i = 0; i < n; i++) {
              const q = flakes[i], y = ((q.y * (H + 100) + t * 120 * q.v) % (H + 100)) - 50, x = q.x + Math.sin(t * 0.9 + q.ph) * 30;
              if (portrait && y > 1150 && y < 1330) continue;
              sf += inkDot(x, y, q.s, q.s, sd + 400 + i, t) + ' ';
              sl += inkCircle(x, y, q.s, sd + 400 + i, t, { w: 2 }) + ' ';
            }
            snowF.setAttribute('d', sf); snowL.setAttribute('d', sl);
          }
          updateLabel(label, lt, cues, t, W, H, portrait, sd);
        },
      };
    },
  };

  // ---------------------------------------------------------------- siegetunnel
  SH.siegetunnel = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const GY = (P.ground ?? (portrait ? 0.42 : 0.4)) * H;
      const BOT = portrait ? 1150 : H - 120;
      const gyf = () => GY; gyf.H = H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const io = (k, t, extra) => Object.assign({ seed: sd + k, t, amp: 1.6 }, extra);
      const earthF = mk(world, INK.paperDark), earthH = mk(world, INK.inkSoft), stones = mk(world, INK.inkSoft), stonesF = mk(world, INK.paper);
      const wallF = mk(world, INK.paperLight), wallL = mk(world), wallB = mk(world, INK.inkSoft), found = mk(world, INK.inkSoft);
      const tentF = mk(world, INK.paperLight), tentL = mk(world), flag = mk(world, INK.red);
      const tunF = mk(world, INK.paper), tunL = mk(world), props = mk(world, INK.inkSoft);
      const tun2F = mk(world, INK.paper), tun2L = mk(world);
      const lampF = mk(world, INK.gold), lampL = mk(world);
      const digG = el(world, 'g'), dig2G = el(world, 'g');
      const burstF = mk(world, INK.red), burstL = mk(world);
      const gl = mk(world);
      const castG = el(world, 'g');
      const lab1 = el(root, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 64 : 54, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      const lab2 = el(root, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 64 : 54, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      const LB = Object.assign({ left: 'lağım', right: 'karşı lağım' }, P.labels || {});
      lab1.textContent = LB.left || ''; lab2.textContent = LB.right || '';
      const diggerS = portrait ? 0.3 : 0.24;
      const digger = typeof KASIF !== 'undefined' ? KASIF.create(digG, { scale: diggerS, hat: false, accessory: 'turban', seed: seed + 91 }) : null;
      const digger2 = typeof KASIF !== 'undefined' ? KASIF.create(dig2G, { scale: diggerS, hat: false, accessory: 'helmet', seed: seed + 97 }) : null;
      const pick = mk(digG), pick2 = mk(dig2G);
      const cast = makeCast(castG, P.cast, seed, portrait ? 0.6 : 0.5);
      // geometry
      const r = rng(seed * 13 + 5);
      const wallX0 = W * (portrait ? 0.6 : 0.62), wallX1 = W * (portrait ? 0.86 : 0.78), wallTop = GY - (portrait ? 330 : 300);
      const wall = [[wallX0, GY + 60], [wallX0, wallTop + 40]];
      for (let x = wallX0; x < wallX1 - 10; x += 44) wall.push([x, wallTop], [x + 24, wallTop], [x + 24, wallTop + 22], [x + 44, wallTop + 22]);
      wall.push([wallX1, wallTop + 22], [wallX1 + 80, GY - 60], [wallX1 + 80, GY + 60]);
      const bricks = [];
      for (let y = wallTop + 70; y < GY - 10; y += 50) for (let x = wallX0 + ((y / 50) % 2) * 30 + 20; x < wallX1 - 30; x += 70) bricks.push([[x, y], [x + 40, y]]);
      const st = Array.from({ length: 22 }, () => [r() * W, lerp(GY + 70, BOT - 20, r()), 10 + r() * 14]);
      const hatchSegs = [];
      for (let y = GY + 40; y < H; y += 34) for (let x = r() * 40; x < W; x += 60 + r() * 40) if (!portrait || y < 1150 || y > 1335) hatchSegs.push([[x, y + 10], [x + 26, y - 6]]);
      // tunnel paths (centre lines)
      const tunY = lerp(GY, BOT, 0.55);
      const T1 = [[W * 0.12, GY + 10], [W * 0.18, tunY - 60], [W * 0.3, tunY], [W * 0.5, tunY + 6], [W * 0.66, tunY - 4]];
      const T2 = [[wallX0 + 40, GY + 60], [wallX0 + 30, tunY - 140], [W * 0.7, tunY - 40], [W * 0.67, tunY - 6]];
      const dense = pts => { const out = []; for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 10; k++) out.push([lerp(pts[i][0], pts[i + 1][0], k / 10), lerp(pts[i][1], pts[i + 1][1], k / 10)]); out.push(pts[pts.length - 1]); return out; };
      const D1 = dense(T1), D2 = dense(T2);
      const tube = (D, n, wd) => {    // outline polygon around the first n points of D
        if (n < 2) return null;
        const pts = D.slice(0, n), up = [], dn = [];
        pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + Math.PI / 2; up.push([p[0] + Math.cos(ang) * wd, p[1] + Math.sin(ang) * wd]); dn.unshift([p[0] - Math.cos(ang) * wd, p[1] - Math.sin(ang) * wd]); });
        return up.concat(dn);
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const meetAt = atOr(cues, P.meet, null), pk = punch(lt, meetAt, 0.7);
          const cz = lerp(1, (P.cam && P.cam.zoom) || 1.05, progIO(lt, 0, Math.max(1, dur)));
          const fc = (P.cam && P.cam.focus) || [0.55, 0.5];
          world.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6 + Math.sin(t * 57) * 8 * pk)} ${f1(Math.cos(t * 0.25) * 5)}) ${around(fc[0] * W, fc[1] * H, `scale(${cz.toFixed(4)})`)}`);
          earthF.setAttribute('d', inkLoop([[-60, GY], [W + 60, GY], [W + 60, H + 40], [-60, H + 40]], io(1, t, { smooth: false, amp: 0 })));
          earthH.setAttribute('d', hatchSegs.map((q, i) => inkPath(q, io(300 + i, t, { w: 3, amp: 1 }))).join(' '));
          stonesF.setAttribute('d', st.map((q, i) => inkLoop(inkEllipsePts(q[0], q[1], q[2], q[2] * 0.7, sd + 20 + i, 8), io(20 + i, t, { amp: 0.8 }))).join(' '));
          stones.setAttribute('d', st.map((q, i) => inkPath(inkEllipsePts(q[0], q[1], q[2], q[2] * 0.7, sd + 20 + i, 8), io(20 + i, t, { w: 3, closed: true, amp: 0.8 }))).join(' '));
          // wall + foundations
          wallF.setAttribute('d', inkLoop(wall, io(50, t, { smooth: false, amp: 1 })));
          wallL.setAttribute('d', inkPath(wall, io(51, t, { w: 6, smooth: false, closed: true })) + ' ' + inkPath([[-60, GY], [W + 60, GY]], io(52, t, { w: 6 })));
          wallB.setAttribute('d', bricks.map((q, i) => inkPath(q, io(60 + i, t, { w: 3, amp: 0.8 }))).join(' '));
          found.setAttribute('d', inkPath([[wallX0 - 10, GY + 60], [wallX1 + 90, GY + 60]], io(55, t, { w: 4 })));
          // tent on the besiegers' side
          const tx = W * (portrait ? 0.1 : 0.12), tent = [[tx - 80, GY], [tx, GY - 150], [tx + 80, GY]];
          tentF.setAttribute('d', inkLoop(tent, io(70, t, { smooth: false, amp: 1 })));
          tentL.setAttribute('d', inkPath(tent, io(71, t, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[tx, GY - 150], [tx, GY - 210]], io(72, t, { w: 4 })));
          const fw = Math.sin(t * 4) * 6;
          flag.setAttribute('d', inkLoop([[tx, GY - 210], [tx + 54, GY - 200 + fw], [tx, GY - 182]], io(73, t, { amp: 0.8 })));
          // attack tunnel grows from `dig`
          const digAt = atOr(cues, P.dig, 0.1), counterAt = atOr(cues, P.counter, null);
          const meetT = meetAt ?? (counterAt != null ? counterAt + 1.6 : dur * 0.85);
          const p1 = clamp01((lt - digAt) / Math.max(0.5, meetT - digAt)) * 0.97 + (lt >= meetT ? 0.03 : 0);
          const n1 = Math.max(2, Math.round(D1.length * p1));
          const tw = portrait ? 38 : 32;
          const o1 = tube(D1, n1, tw);
          tunF.setAttribute('d', o1 ? inkLoop(o1, io(80, t, { amp: 1 })) : '');
          tunL.setAttribute('d', o1 ? inkPath(o1, io(81, t, { w: 5, closed: true })) : '');
          let pr = '';
          for (let i = 12; i < n1 - 4; i += 10) { const p = D1[i]; pr += inkPath([[p[0], p[1] - tw + 4], [p[0], p[1] + tw - 4]], io(85 + i, t, { w: 4 })) + ' '; }
          props.setAttribute('d', pr);
          const head = D1[n1 - 1], prev = D1[Math.max(0, n1 - 6)], hdir = Math.sign(head[0] - prev[0]) || 1;
          if (digger) {
            const sw = Math.sin(t * 9);
            digger.update(t, 'point', { dir: -20 + sw * 45, x: head[0] - 26 * hdir, y: head[1] + tw - 4, face: hdir, since: lt, emotion: lt >= meetT ? 'surprised' : null });
            const hx = head[0] - 26 * hdir + 40 * hdir, hy = head[1] + tw - 4 - 300 * diggerS;
            const a = (-40 + sw * 50) * Math.PI / 180 * hdir;
            const tip = [hx + Math.cos(a) * 70 * hdir, hy + Math.sin(a) * 70];
            pick.setAttribute('d', inkPath([[hx, hy], tip], io(95, t, { w: 5 })) + ' ' + inkPath([[tip[0] - 18, tip[1] + 14], tip, [tip[0] + 18, tip[1] - 6]], io(96, t, { w: 5 })));
            const lp = [head[0] - 70 * hdir, head[1] + tw - 30];
            const glow = 1 + 0.15 * Math.sin(t * 7);
            lampF.setAttribute('d', inkDot(lp[0], lp[1], 14 * glow, 18 * glow, sd + 97, t));
            lampL.setAttribute('d', inkCircle(lp[0], lp[1], 26 * glow, sd + 98, t, { w: 2.5 }));
          }
          // counter tunnel from `counter`
          if (counterAt != null && lt >= counterAt) {
            const p2 = clamp01((lt - counterAt) / Math.max(0.4, meetT - counterAt));
            const n2 = Math.max(2, Math.round(D2.length * p2));
            const o2 = tube(D2, n2, tw * 0.9);
            tun2F.setAttribute('d', inkLoop(o2, io(110, t, { amp: 1 })));
            tun2L.setAttribute('d', inkPath(o2, io(111, t, { w: 5, closed: true })));
            const h2 = D2[n2 - 1];
            if (digger2) {
              const sw = Math.sin(t * 9 + 1.5);
              digger2.update(t, 'point', { dir: -20 + sw * 45, x: h2[0] + 20, y: h2[1] + tw * 0.9 - 4, face: -1, since: lt, emotion: lt >= meetT ? 'surprised' : 'angry' });
              const hx = h2[0] - 20, hy = h2[1] + tw * 0.9 - 4 - 300 * diggerS, a = Math.PI + (40 - sw * 50) * Math.PI / 180;
              const tip = [hx + Math.cos(a) * 70, hy + Math.sin(a) * 70];
              pick2.setAttribute('d', inkPath([[hx, hy], tip], io(115, t, { w: 5 })) + ' ' + inkPath([[tip[0] + 18, tip[1] + 14], tip, [tip[0] - 18, tip[1] - 6]], io(116, t, { w: 5 })));
            }
            dig2G.style.display = '';
            const ls = spring(lt, counterAt, 0.6);
            lab2.setAttribute('transform', `translate(${f1(W * 0.8)} ${f1(BOT - 40)}) rotate(-3) scale(${lerp(0.6, 1, ls).toFixed(3)})`);
            lab2.style.opacity = clamp01(ls * 2);
          } else { tun2F.setAttribute('d', ''); tun2L.setAttribute('d', ''); dig2G.style.display = 'none'; lab2.style.opacity = 0; }
          const l1 = spring(lt, digAt + 0.4, 0.6);
          lab1.setAttribute('transform', `translate(${f1(W * 0.3)} ${f1(BOT - 40)}) rotate(-2) scale(${lerp(0.6, 1, l1).toFixed(3)})`);
          lab1.style.opacity = clamp01(l1 * 2);
          // burst where they meet
          if (lt >= meetT) {
            const b = prog(lt, meetT, 0.5), c = [W * 0.665, tunY - 4], R = 30 + 70 * b;
            const star = []; for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, rr = k % 2 ? R * 0.5 : R; star.push([c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]); }
            burstF.setAttribute('d', inkLoop(star, io(120, t, { smooth: false, amp: 1.5 })));
            burstL.setAttribute('d', inkPath(star, io(121, t, { w: 4, closed: true, smooth: false })));
          } else { burstF.setAttribute('d', ''); burstL.setAttribute('d', ''); }
          gl.setAttribute('d', '');
          updateCast(cast, lt, dur, cues, t, W, gyf);
        },
      };
    },
  };
})();
