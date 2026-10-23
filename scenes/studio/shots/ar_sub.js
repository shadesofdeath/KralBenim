// ar_sub: a Cold War submarine in the parchment ink style (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via
// _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for 01-vasili-arhipov (Soviet
// submarine B-59, 27 October 1962), but parametric: any submarine / depth-charge / control-room moment.
//
// SHOTS.ar_room — inside a submarine compartment: dark curved hull wall with ribs and pipes, a red alarm lamp that
//   pulses (faster after "alarm"), a torpedo hatch on the left and a long torpedo on an overhead rack (red band,
//   optional handwritten label) that slides into the open hatch on "load"; pressure gauges whose needles tremble,
//   an optional thermometer whose mercury climbs on "heat" (+ rising heat waves and sweat drops), an optional radio
//   box (crossed out on "radio"), hits from outside ("booms": camera shake, lamp swing, dust falling).
//   Cast members (KASIF rig) stand on the deck; each can get a vote mark above the head (green ✓ / red ✗) and a
//   speech bubble (Fraunces). Handwritten labels.
//   P: {ground: 0.585 (deck line, 0..1 H), lamp: {x: 0.5} | false, alarm: cue,
//       torpedo: {x: 0.52, y: 0.29, len: 0.56, label: "nükleer", label_at, load: cue, color: "red"} | false,
//       hatch: {x: 0.13} | false, gauges: true | false | [[x, y, R], ...] (0..1 W/H, px), thermo: {x: 0.92, heat: cue} | false, heat: cue|seconds|false (waves),
//       radio: {x: 0.79, y: 0.25, at: cue (crossed)} | false, booms: ["cue", ...] (hits from outside), hits: ["cue"] (camera punch),
//       cast: [{who: "kasif"|name, accessory, beard, x, to, y, scale, pose, at, then, dir, face: "left"|"right",
//               emotion, emotion0, then_emotion, text, item, sweat: true, vote: {mark: "yes"|"no", at}}],
//       bubbles: [{text, at, x, y, size: 84, color: "red"|"ink", tail: [x, y]}],
//       labels: [{text, x, y, at, size, color, rot}], cam: {zoom: 1.06, focus: [0.5, 0.5]},
//       cover_cam: {zoom: 1.15, dx: 0, dy: 0 (px), hide_kasif: false} (only in the thumbnail / Shorts hook frame)}
//   cues: alarm, load, heat, radio, booms[...], cast/bubble/label "at" names
//
// SHOTS.ar_sea — side view of the sea: sky with clouds, destroyer silhouettes bobbing on the surface, the water
//   below (hatching, drifting bubbles) and a big submarine hull deep down with a cut-away window into its control
//   room (red lamp inside; cast members can stand in it). Sonar pings ring down from the ships ("ping"); depth
//   charges drop from the ships, sink with a bubble trail and burst near the hull ("drop" → bursts, shake); on
//   "rise" the submarine climbs to the surface. Cast on the ship decks (y above the surface) or inside the window.
//   P: {surface: 0.3 (0..1 H), ships: [{x: 0.3, scale: 1, face: 1|-1}], sub: {x: 0.5, y: 0.53, len: 0.9, h: 330 (px),
//       window: true | [x0, x1, y0, y1] (fractions of len / h), sail: 0.95 (sail height, of h), face: 1|-1, rise: cue}, clouds: true, ping: cue|false, charges: [{x (0..1 W), at: cue|seconds, depth (0..1 H)}],
//       cast, bubbles, labels, cam (as ar_room)}
//   cues: ping, rise, charge "at" names, cast/bubble/label "at" names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { red: INK.red, ink: INK.ink, blue: INK.blue, gold: INK.gold, green: INK.green, soft: INK.inkSoft };
  const FR = 'Fraunces, Georgia, serif';
  const hand = (parent, size, color) => el(parent, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: color,
    style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });

  // ---------------------------------------------------------------- cast (Kaşif + period figures)
  function castOf(P, parent, seed, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = (m.scale ?? 1) * defScale;
      const wrap = el(parent, 'g'), g = el(wrap, 'g'), fx = el(wrap, 'g');
      return { m, isK, sc, fx, wrap, sweat: m.sweat ? mk(fx, INK.blue) : null, vote: m.vote ? { ring: mk(fx, INK.paperLight), rr: mk(fx), mark: mk(fx, m.vote.mark === 'no' ? INK.red : INK.green) } : null,
        rig: KASIF.create(g, { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) };
    });
  }
  function castUpdate(cast, lt, t, cues, W, H, G, sd) {
    cast.forEach((c, i) => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      let x = (m.x ?? 0.8) * W;
      if (moving) x = lerp(x, m.to * W, progIO(lt, 0, Math.max(0.4, at ?? 1.5)));
      const y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : m.face === 'right' ? 1 : (moving ? (m.to > m.x ? 1 : -1) : 1);
      const emo = after ? (m.then_emotion || m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || m.emotion || null);
      const o = { x, y, face, since, dir, text: m.text, item: m.item, emotion: emo };
      if (pose === 'walk' || pose === 'run') o.ph = Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) || lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
      const headY = y - 470 * c.sc;
      if (c.sweat) {   // drops slide off the forehead in a loop
        let d = '';
        for (let k = 0; k < 3; k++) {
          const u = ((lt * 0.9 + k / 3) % 1), sx = x + (k - 1) * 46 * c.sc + face * 20 * c.sc, sy = headY + 20 * c.sc + u * 120 * c.sc;
          if (u < 0.85) d += inkLoop([[sx, sy - 16 * c.sc], [sx + 8 * c.sc, sy], [sx, sy + 8 * c.sc], [sx - 8 * c.sc, sy]], { seed: sd + 900 + i * 7 + k, t, amp: 0.6 }) + ' ';
        }
        c.sweat.setAttribute('d', d);
      }
      if (c.vote) {
        const vAt = atOr(cues, m.vote.at, 0.4), s = lt >= vAt ? spring(lt, vAt, 0.55) : 0, pk = punch(lt, vAt + 0.1, 0.5);
        const vx = x, vy = y - 540 * c.sc - 90, R = 54 * s * (1 + 0.12 * pk);
        if (s > 0.01) {
          c.vote.ring.setAttribute('d', inkCircle(vx, vy, R, sd + 950 + i, t, { fill: true }));
          c.vote.rr.setAttribute('d', inkCircle(vx, vy, R, sd + 950 + i, t, { w: 5 }));
          const pm = prog(lt, vAt + 0.12, 0.3), q = R * 0.55;
          let d = '';
          if (m.vote.mark === 'no') {
            const a = [[vx - q, vy - q], [vx + q, vy + q]], b = [[vx + q, vy - q], [vx - q, vy + q]];
            if (pm > 0.02) d += inkPath([a[0], [lerp(a[0][0], a[1][0], Math.min(1, pm * 2)), lerp(a[0][1], a[1][1], Math.min(1, pm * 2))]], { seed: sd + 960 + i, t, w: 12, amp: 1 }) + ' ';
            if (pm > 0.5) d += inkPath([b[0], [lerp(b[0][0], b[1][0], (pm - 0.5) * 2), lerp(b[0][1], b[1][1], (pm - 0.5) * 2)]], { seed: sd + 970 + i, t, w: 12, amp: 1 });
          } else if (pm > 0.02) {
            const pts = [[vx - q, vy], [vx - q * 0.25, vy + q * 0.7], [vx + q * 1.05, vy - q * 0.8]];
            const n = pm < 0.4 ? [pts[0], [lerp(pts[0][0], pts[1][0], pm / 0.4), lerp(pts[0][1], pts[1][1], pm / 0.4)]]
              : [pts[0], pts[1], [lerp(pts[1][0], pts[2][0], (pm - 0.4) / 0.6), lerp(pts[1][1], pts[2][1], (pm - 0.4) / 0.6)]];
            d = inkPath(n, { seed: sd + 960 + i, t, w: 13, amp: 1, smooth: false });
          }
          c.vote.mark.setAttribute('d', d);
        } else { c.vote.ring.setAttribute('d', ''); c.vote.rr.setAttribute('d', ''); c.vote.mark.setAttribute('d', ''); }
      }
    });
  }
  // handwritten labels with an underline that draws in
  function labelsOf(list, parent, W, H) {
    return (list || []).map((L, i) => {
      const g = el(parent, 'g'), col = COL[L.color] || INK.ink;
      const t = hand(g, L.size || (H > W ? 76 : 64), col); t.textContent = L.text || '';
      return { L, g, t, u: mk(g, col), k: i };
    });
  }
  function labelsUpdate(labels, lt, t, cues, W, H, sd) {
    labels.forEach(lb => {
      const L = lb.L, at = atOr(cues, L.at, 0.3 + lb.k * 0.4), s = lt >= at ? spring(lt, at, 0.6) : 0, b = boil(sd + 400 + lb.k, t, 1.4);
      const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.2) * H;
      lb.g.setAttribute('opacity', clamp01(s * 2));
      lb.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${L.rot ?? -3}) scale(${lerp(0.5, 1, s).toFixed(3)})`);
      const tw = lb.t.getComputedTextLength ? lb.t.getComputedTextLength() : 200, pu = lt >= at ? prog(lt, at + 0.3, 0.35) : 0;
      lb.u.setAttribute('d', pu > 0.01 ? inkPath([[-tw / 2, 22], [-tw / 2 + tw * pu, 15]], { seed: sd + 420 + lb.k, t, w: 6, amp: 1.2 }) : '');
    });
  }
  // speech bubbles: paper-light balloon, ink ring, tail, Fraunces text
  function bubblesOf(list, parent, W, H) {
    return (list || []).map((B, i) => {
      const g = el(parent, 'g'), col = COL[B.color] || INK.red;
      const f = mk(g, INK.paperLight), r = mk(g);
      const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': B.size || (H > W ? 84 : 70), 'text-anchor': 'middle', fill: col });
      tx.textContent = B.text || '';
      return { B, g, f, r, tx, k: i };
    });
  }
  function bubblesUpdate(bubbles, lt, t, cues, W, H, sd) {
    bubbles.forEach(bb => {
      const B = bb.B, at = atOr(cues, B.at, 0.3), s = lt >= at ? spring(lt, at, 0.5) : 0, pk = punch(lt, at, 0.6);
      if (s < 0.01) { bb.g.setAttribute('opacity', 0); return; }
      const x = (B.x ?? 0.5) * W, y = (B.y ?? 0.25) * H, sz = B.size || (H > W ? 84 : 70);
      const tw = bb.tx.getComputedTextLength ? bb.tx.getComputedTextLength() : sz * 3;
      const rx = tw / 2 + sz * 0.55, ry = sz * 0.85;
      const tl = B.tail ? [(B.tail[0] - (B.x ?? 0.5)) * W, (B.tail[1] - (B.y ?? 0.25)) * H] : [-rx * 0.3, ry * 1.8];
      // balloon outline with the tail merged in
      const pts = [], n = 20, ta = Math.atan2(tl[1] / ry, tl[0] / rx);
      for (let k = 0; k < n; k++) {
        const a = ta + 0.22 + k / n * (Math.PI * 2 - 0.44);
        pts.push([Math.cos(a) * rx, Math.sin(a) * ry]);
      }
      pts.push(tl);
      const O = { seed: sd + 600 + bb.k, t, amp: 1.2 };
      bb.f.setAttribute('d', inkLoop(pts, Object.assign({ smooth: false }, O)));
      bb.r.setAttribute('d', inkPath(pts, Object.assign({ w: 6, closed: true, smooth: false }, O)));
      bb.tx.setAttribute('x', 0); bb.tx.setAttribute('y', sz * 0.34);
      const b = boil(sd + 620 + bb.k, t, 1.2), sc = lerp(0.3, 1, s) * (1 + 0.1 * pk);
      bb.g.setAttribute('opacity', 1);
      bb.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${B.rot ?? -3}) scale(${sc.toFixed(3)})`);
    });
  }
  // thumbnail / Shorts hook: the engine shifts the shot down under the cover title; cover_cam lets a shot grow and
  // move up there (zoom around the top centre, dy px) and hide its own Kaşif (the cover adds a big one)
  const inCover = () => { try { return document.documentElement.classList.contains('cover'); } catch (e) { return false; } };
  function coverTf(P, W) {
    const C = P.cover_cam; if (!C || !inCover()) return '';
    const z = C.zoom ?? 1.15;
    return `translate(${f1(C.dx ?? 0)} ${f1(C.dy ?? 0)}) translate(${f1(W / 2)} 0) scale(${z}) translate(${f1(-W / 2)} 0) `;
  }
  function hideCoverKasif(P, cast) {
    const hide = !!(P.cover_cam && P.cover_cam.hide_kasif && inCover());
    cast.forEach(c => { if (c.isK) c.wrap.style.display = hide ? 'none' : ''; });
  }
  function camOf(P, lt, dur, W, H, extra = 1) {
    const Cm = P.cam || {}, u = Cm.linear ? lin(lt, 0, Math.max(1, dur)) : progIO(lt, 0, Math.max(1, dur));
    const z = lerp(Cm.from ?? 1, Cm.zoom ?? 1.06, u) * extra;
    const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.5) * H;
    return { z, fx, fy };
  }

  // ================================================================ ar_room (inside the submarine)
  SH.ar_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 71, G = (P.ground ?? (portrait ? 0.585 : 0.82)) * H, r = rng(seed * 17 + 9);
      const TOP = portrait ? 0.16 * H : 0.12 * H, CORNER = portrait ? 0.22 * H : 0.24 * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const wallF = mk(world, INK.paperDark), ribR = mk(world, INK.inkSoft), ceilR = mk(world);
      const glowF = mk(world, INK.red, { 'fill-opacity': 0.2 });
      const pipeF = mk(world, INK.paperLight), pipeR = mk(world), valveR = mk(world, INK.red);
      const gaugeF = mk(world, INK.paperLight), gaugeR = mk(world), needleR = mk(world, INK.red);
      const radioF = mk(world, INK.paperLight), radioR = mk(world), radioX = mk(world, INK.red);
      const thermoF = mk(world, INK.paperLight), thermoR = mk(world), merc = mk(world, INK.red);
      const torpF = mk(world, INK.paperLight), torpR = mk(world), torpBand = mk(world, INK.red), rackR = mk(world, INK.inkSoft);
      const hatchF = mk(world, INK.inkSoft), hatchR = mk(world), hatchDoorF = mk(world, INK.paperLight), hatchDoorR = mk(world), boltF = mk(world);
      const lampF = mk(world, INK.red), lampR = mk(world), lampHi = mk(world, INK.paperLight);
      const heatR = mk(world, INK.inkSoft), dustF = mk(world, INK.inkSoft);
      const floorF = mk(world, INK.inkSoft, { 'fill-opacity': 0.55 }), floorR = mk(world), rivetF = mk(world, INK.inkSoft);
      const castG = el(world, 'g'), uiG = el(root, 'g');
      const TP = P.torpedo === false ? null : Object.assign({ x: 0.52, y: portrait ? 0.29 : 0.3, len: portrait ? 0.56 : 0.42, label: null }, P.torpedo || {});
      const HT = P.hatch === false ? null : Object.assign({ x: 0.13 }, P.hatch || {});
      const TH = P.thermo ? Object.assign({ x: 0.92 }, P.thermo) : null;
      const RD = P.radio ? Object.assign({ x: 0.79, y: portrait ? 0.25 : 0.2 }, P.radio) : null;
      const LP = P.lamp === false ? null : Object.assign({ x: 0.5 }, P.lamp || {});
      const cast = castOf(P, castG, seed, portrait ? 0.78 : 0.6);
      const tlab = TP && TP.label ? labelsOf([{ text: TP.label, x: TP.x + 0.06, y: TP.y - (portrait ? 0.05 : 0.09), at: TP.label_at, color: TP.color || 'red', size: portrait ? 80 : 64, rot: -4 }], uiG, W, H) : [];
      const labels = labelsOf(P.labels, uiG, W, H).concat(tlab);
      const bubbles = bubblesOf(P.bubbles, uiG, W, H);
      const waves = Array.from({ length: 7 }, (_, i) => ({ x: W * (0.08 + i * 0.14) + r() * 40, ph: r(), sp: 0.35 + r() * 0.2 }));
      const dust = Array.from({ length: 26 }, () => ({ x: r() * W, d: r() * 0.4, sp: 300 + r() * 300, s: 3 + r() * 4 }));
      const ceilY = x => { const u = x / W * 2 - 1; return TOP + (CORNER - TOP) * u * u; };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          // hits from outside
          const booms = (P.booms || []).map(b => atOr(cues, b, null)).filter(v => v != null);
          let shake = 0, swing = 0, lastB = null;
          booms.forEach(b => { const s = lt - b; if (s >= 0) { shake += Math.sin(lt * 53 + b) * 20 * Math.exp(-s * 4); swing += Math.sin(s * 7) * 18 * Math.exp(-s * 1.5); lastB = b; } });
          const alarm = atOr(cues, P.alarm, null), alarmOn = alarm != null && lt >= alarm;
          const hitK = (P.hits || []).reduce((a, h) => a + punch(lt, atOr(cues, h, null), 0.6), 0);
          const cm = camOf(P, lt, dur, W, H, 1 + 0.03 * booms.reduce((a, b) => a + punch(lt, b, 0.6), 0) + 0.06 * hitK);
          world.setAttribute('transform', `${coverTf(P, W)}translate(${f1(Math.sin(lt * 0.4) * 6 + shake)} ${f1(Math.cos(lt * 0.3) * 4 + shake * 0.5)}) translate(${f1(cm.fx)} ${f1(cm.fy)}) scale(${cm.z.toFixed(4)}) translate(${f1(-cm.fx)} ${f1(-cm.fy)})`);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // hull wall + ribs + ceiling arc
          const arc = []; for (let k = 0; k <= 16; k++) { const x = -80 + (W + 160) * k / 16; arc.push([x, ceilY(x)]); }
          wallF.setAttribute('d', inkLoop(arc.concat([[W + 80, G + 10], [-80, G + 10]]), O(1, { amp: 1.4 })));
          ceilR.setAttribute('d', inkPath(arc, O(2, { w: 7 })) + ' ' + inkPath(arc.map(q => [q[0], q[1] + 34]), O(3, { w: 3.5 })));
          let rb = '';
          for (let k = 0; k < 7; k++) { const x = W * (k + 0.5) / 7, y0 = ceilY(x) + 34; rb += inkPath([[x - 6, y0], [x + 4, (y0 + G) / 2], [x - 4, G]], O(10 + k, { w: 3.5 })) + ' '; }
          ribR.setAttribute('d', rb);
          // pipes along the ceiling
          let pf = '', pr = '', vr = '';
          [0, 1].forEach(j => {
            const off = 70 + j * 52, pts = arc.map(q => [q[0], q[1] + off]), pts2 = arc.map(q => [q[0], q[1] + off + 24]);
            pf += inkLoop(pts.concat(pts2.slice().reverse()), O(20 + j, { amp: 1 })) + ' ';
            pr += inkPath(pts, O(22 + j, { w: 4 })) + ' ' + inkPath(pts2, O(24 + j, { w: 4 })) + ' ';
          });
          [0.3, 0.68].forEach((vx, j) => {
            const x = vx * W, y = ceilY(x) + 82 + j * 52, a = t * 0.6 + j;
            vr += inkCircle(x, y, 26, sd + 30 + j, t, { w: 6 }) + ' ';
            for (let s = 0; s < 3; s++) { const aa = a + s * Math.PI / 3; vr += inkPath([[x - Math.cos(aa) * 26, y - Math.sin(aa) * 26], [x + Math.cos(aa) * 26, y + Math.sin(aa) * 26]], O(32 + j * 3 + s, { w: 4 })) + ' '; }
          });
          pipeF.setAttribute('d', pf); pipeR.setAttribute('d', pr); valveR.setAttribute('d', vr);
          // gauges (needles tremble, jump on hits)
          let gf = '', gr = '', nr = '';
          if (P.gauges !== false) {
            (Array.isArray(P.gauges) ? P.gauges : [[portrait ? 0.62 : 0.66, portrait ? 0.4 : 0.42, 56], [portrait ? 0.76 : 0.76, portrait ? 0.43 : 0.47, 44]]).forEach(([gx, gy, R], j) => {
              const x = gx * W, y = gy * H;
              gf += inkCircle(x, y, R, sd + 40 + j, t, { fill: true }) + ' ';
              gr += inkCircle(x, y, R, sd + 40 + j, t, { w: 6 }) + ' ';
              for (let k = 0; k < 5; k++) { const a = Math.PI * (0.85 + k * 0.325); gr += inkPath([[x + Math.cos(a) * R * 0.72, y + Math.sin(a) * R * 0.72], [x + Math.cos(a) * R * 0.88, y + Math.sin(a) * R * 0.88]], O(44 + j * 5 + k, { w: 3 })) + ' '; }
              const na = Math.PI * (1.25 + 0.35 * Math.sin(t * (alarmOn ? 9 : 2.2) + j * 2)) + swing * 0.03;
              nr += inkPath([[x, y], [x + Math.cos(na) * R * 0.78, y + Math.sin(na) * R * 0.78]], O(56 + j, { w: 5, amp: 0.6 })) + ' ';
            });
          }
          gaugeF.setAttribute('d', gf); gaugeR.setAttribute('d', gr); needleR.setAttribute('d', nr);
          // radio box (crossed out on its cue)
          if (RD) {
            const x = RD.x * W, y = RD.y * H, w = portrait ? 190 : 170, h = portrait ? 120 : 100;
            const box = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
            radioF.setAttribute('d', inkLoop(box, O(60, { smooth: false })));
            let d = inkPath(box, O(61, { w: 5, closed: true, smooth: false }));
            d += ' ' + inkCircle(x - w * 0.22, y, h * 0.26, sd + 62, t, { w: 4 });
            for (let k = 0; k < 3; k++) d += ' ' + inkPath([[x + w * 0.05, y - h * 0.2 + k * h * 0.2], [x + w * 0.38, y - h * 0.2 + k * h * 0.2]], O(63 + k, { w: 3.5 }));
            d += ' ' + inkPath([[x + w * 0.3, y - h / 2], [x + w * 0.42, y - h * 1.1 + Math.sin(t * 3) * 6]], O(67, { w: 4 }));
            radioR.setAttribute('d', d);
            const xa = atOr(cues, RD.at, null), px = xa != null ? prog(lt, xa, 0.35) : 0;
            let xd = '';
            if (px > 0.02) {
              const q = w * 0.55;
              xd += inkPath([[x - q, y - q * 0.6], [lerp(x - q, x + q, Math.min(1, px * 2)), lerp(y - q * 0.6, y + q * 0.6, Math.min(1, px * 2))]], O(68, { w: 11 }));
              if (px > 0.5) xd += ' ' + inkPath([[x + q, y - q * 0.6], [lerp(x + q, x - q, (px - 0.5) * 2), lerp(y - q * 0.6, y + q * 0.6, (px - 0.5) * 2)]], O(69, { w: 11 }));
            }
            radioX.setAttribute('d', xd);
          }
          // thermometer
          if (TH) {
            const x = TH.x * W, y0 = (portrait ? 0.33 : 0.3) * H, y1 = (portrait ? 0.5 : 0.62) * H, bw = 30;
            const tube = [[x - bw / 2, y0], [x + bw / 2, y0], [x + bw / 2, y1], [x - bw / 2, y1]];
            thermoF.setAttribute('d', inkLoop(tube, O(70, { smooth: false })) + ' ' + inkCircle(x, y1 + 30, 38, sd + 71, t, { fill: true }));
            let d = inkPath(tube, O(72, { w: 5, closed: true, smooth: false })) + ' ' + inkCircle(x, y1 + 30, 38, sd + 71, t, { w: 5 });
            for (let k = 1; k < 6; k++) d += ' ' + inkPath([[x - bw / 2 - 18, lerp(y1, y0, k / 6)], [x - bw / 2 - 2, lerp(y1, y0, k / 6)]], O(73 + k, { w: 3 }));
            thermoR.setAttribute('d', d);
            const ha = atOr(cues, TH.heat, 0.2), lev = lerp(0.35, 0.95, prog(lt, ha, 1.6)) + Math.sin(t * 5) * 0.01;
            merc.setAttribute('d', inkLoop([[x - 8, y1 + 10], [x - 8, lerp(y1, y0, lev)], [x + 8, lerp(y1, y0, lev)], [x + 8, y1 + 10]], O(80, { smooth: false, amp: 0.6 })) + ' ' + inkCircle(x, y1 + 30, 26, sd + 81, t, { fill: true }));
          }
          // heat waves rising from the deck
          if (P.heat != null && P.heat !== false) {
            const ha = atOr(cues, P.heat, 0), k0 = clamp01((lt - ha) / 0.6);
            let d = '';
            if (k0 > 0) waves.forEach((wv, i) => {
              const u = ((lt * wv.sp + wv.ph) % 1), y = lerp(G - 40, G - 0.32 * H, u), pts = [];
              for (let k = 0; k <= 6; k++) pts.push([wv.x + Math.sin(k * 1.4 + t * 4 + i) * 16, y - k * 26]);
              if (u < 0.9) d += inkPath(pts, O(90 + i, { w: 4 * k0 * (1 - u), amp: 0.8 })) + ' ';
            });
            heatR.setAttribute('d', d);
          }
          // torpedo on the overhead rack (slides into the hatch on "load")
          if (TP) {
            const L = TP.len * W, h = portrait ? 104 : 84, la = atOr(cues, TP.load, null), slide = la != null ? progIO(lt, la, 1.2) * L * 0.3 : 0;
            const cx = TP.x * W - slide, cy = TP.y * H, xl = cx - L / 2, xr = cx + L / 2;
            const body = [[xl + h * 0.1, cy - h * 0.42], [xl + h * 0.35, cy - h / 2], [xr - h * 0.3, cy - h / 2], [xr, cy - h * 0.34], [xr, cy + h * 0.34], [xr - h * 0.3, cy + h / 2], [xl + h * 0.35, cy + h / 2], [xl + h * 0.1, cy + h * 0.42], [xl - h * 0.08, cy]];
            torpF.setAttribute('d', inkLoop(body, O(100, { amp: 1.2 })));
            let d = inkPath(body, O(101, { w: 6, closed: true, amp: 1.2 }));
            d += ' ' + inkPath([[xr - 10, cy - h * 0.34], [xr + 46, cy - h * 0.72], [xr + 56, cy - h * 0.6], [xr + 30, cy - h * 0.1]], O(102, { w: 5 }));
            d += ' ' + inkPath([[xr - 10, cy + h * 0.34], [xr + 46, cy + h * 0.72], [xr + 56, cy + h * 0.6], [xr + 30, cy + h * 0.1]], O(103, { w: 5 }));
            const pa = t * 14; d += ' ' + inkPath([[xr + 6, cy - Math.cos(pa) * h * 0.4], [xr + 6, cy + Math.cos(pa) * h * 0.4]], O(104, { w: 6 }));
            for (let k = 1; k < 4; k++) d += ' ' + inkPath([[lerp(xl, xr, 0.2 + k * 0.16), cy - h / 2 + 6], [lerp(xl, xr, 0.2 + k * 0.16), cy + h / 2 - 6]], O(105 + k, { w: 2.5 }));
            torpR.setAttribute('d', d);
            const bx = xl + h * 0.9, alarmK = alarmOn ? 0.75 + 0.25 * Math.sin(t * 10) : 1;
            torpBand.setAttribute('d', inkLoop([[bx, cy - h / 2 + 3], [bx + h * 0.5, cy - h / 2 + 3], [bx + h * 0.5, cy + h / 2 - 3], [bx, cy + h / 2 - 3]], O(110, { smooth: false, amp: 0.8 })));
            torpBand.setAttribute('fill-opacity', (0.85 + 0.15 * (alarmK - 0.5) / 0.5).toFixed(2));
            // cradles hanging from the ceiling (fixed: the torpedo slides through them)
            let rk = '';
            [0.3, 0.7].forEach((u, j) => { const x = (TP.x - TP.len / 2 + TP.len * u) * W; rk += inkPath([[x, ceilY(x) + 150], [x, cy - h / 2 - 4]], O(112 + j, { w: 5 })) + ' ' + inkPath([[x - 60, cy + h / 2 + 8], [x, cy + h / 2 + 20], [x + 60, cy + h / 2 + 8]], O(114 + j, { w: 6 })) + ' '; });
            rackR.setAttribute('d', rk);
          }
          // torpedo hatch (drawn over the torpedo nose, door swings open on "load")
          if (HT) {
            const x = HT.x * W, y = TP ? TP.y * H : 0.36 * H, R = portrait ? 110 : 90;
            hatchF.setAttribute('d', inkCircle(x, y, R, sd + 120, t, { fill: true }));
            hatchR.setAttribute('d', inkCircle(x, y, R, sd + 120, t, { w: 8 }) + ' ' + inkCircle(x, y, R * 0.78, sd + 121, t, { w: 4 }));
            const la = TP ? atOr(cues, TP.load, null) : null, op = la != null ? progIO(lt, la - 0.4, 0.5) : 0;
            const dx = x - R * 0.9 * op, rxD = R * 0.78 * (1 - 0.82 * op);
            hatchDoorF.setAttribute('d', inkCircle(dx, y, rxD, sd + 122, t, { fill: true, ry: R * 0.78 }));
            hatchDoorR.setAttribute('d', inkCircle(dx, y, rxD, sd + 122, t, { w: 5, ry: R * 0.78 }) + (op < 0.3 ? ' ' + inkPath([[dx - rxD * 0.5, y], [dx + rxD * 0.5, y]], O(123, { w: 6 })) + ' ' + inkCircle(dx, y, 16, sd + 124, t, { w: 5 }) : ''));
            let bf = ''; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; bf += inkDot(x + Math.cos(a) * R * 0.89, y + Math.sin(a) * R * 0.89, 6, 6, sd + 130 + k, t) + ' '; }
            boltF.setAttribute('d', bf);
          }
          // red alarm lamp + glow (pulses; faster after "alarm"; swings on hits)
          if (LP) {
            const x0 = LP.x * W, y0 = ceilY(x0) + 26, ang = swing * Math.PI / 180, L = 70;
            const lx = x0 + Math.sin(ang) * L, ly = y0 + Math.cos(ang) * L;
            const pulse = alarmOn ? 0.5 + 0.5 * Math.sin((lt - alarm) * 12) : 0.5 + 0.5 * Math.sin(t * 2.4);
            const gr = (portrait ? 150 : 120) * (0.85 + 0.3 * pulse);
            glowF.setAttribute('d', inkCircle(lx, ly + 10, gr, sd + 140, t, { fill: true }));
            glowF.setAttribute('fill-opacity', f1((alarmOn ? 0.18 + 0.2 * pulse : 0.1 + 0.1 * pulse) * 100) / 100);
            const dome = []; for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; dome.push([lx + Math.cos(a) * 46, ly + 30 + Math.sin(a) * 52]); }
            lampF.setAttribute('d', inkLoop(dome, O(141, { amp: 0.8 })));
            let d = inkPath([[x0, y0], [lx, ly - 22]], O(142, { w: 5 })) + ' ' + inkPath(dome.concat([dome[0]]), O(143, { w: 6, amp: 0.8 }));
            for (let k = -1; k <= 1; k++) d += ' ' + inkPath([[lx + k * 24, ly + 30], [lx + k * 16, ly - 18]], O(144 + k, { w: 3 }));
            d += ' ' + inkPath([[lx - 58, ly + 32], [lx + 58, ly + 32]], O(148, { w: 6 }));
            lampR.setAttribute('d', d);
            lampHi.setAttribute('d', inkDot(lx - 16, ly + 2, 9, 13, sd + 149, t));
          }
          // dust falling after hits
          if (lastB != null && lt - lastB < 2.2) {
            const s = lt - lastB; let d = '';
            dust.forEach((p, i) => { const tt = s - p.d; if (tt > 0) { const y = ceilY(p.x) + 40 + tt * p.sp; if (y < G) d += inkDot(p.x + Math.sin(tt * 3 + i) * 10, y, p.s, p.s, sd + 160 + i, t) + ' '; } });
            dustF.setAttribute('d', d);
          } else dustF.setAttribute('d', '');
          // deck
          floorF.setAttribute('d', inkLoop([[-80, G - 4], [W + 80, G - 4], [W + 80, G + 44], [-80, G + 44]], O(170, { smooth: false })));
          floorR.setAttribute('d', inkPath([[-80, G - 2], [W / 2, G + 2], [W + 80, G - 2]], O(171, { w: 7 })) + ' ' + inkPath([[-80, G + 44], [W + 80, G + 44]], O(172, { w: 4 })));
          let rv = ''; for (let k = 0; k < 12; k++) rv += inkDot(W * (k + 0.5) / 12, G + 20, 5, 5, sd + 180 + k, t) + ' ';
          rivetF.setAttribute('d', rv);
          castUpdate(cast, lt, t, cues, W, H, G, sd); hideCoverKasif(P, cast);
          labelsUpdate(labels, lt, t, cues, W, H, sd);
          bubblesUpdate(bubbles, lt, t, cues, W, H, sd);
        },
      };
    },
  };

  // ---------------------------------------------------------------- ar_sea helpers
  // destroyer silhouette, waterline at y = 0, bow toward +x (local coords, scaled by s)
  function shipParts(s) {
    const a = 210 * s, h = 64 * s;
    return {
      hull: [[-a, -h * 0.5], [a * 0.75, -h * 0.55], [a * 1.08, -h * 0.95], [a * 0.96, h * 0.4], [-a * 0.96, h * 0.4], [-a * 1.02, -h * 0.35]],
      deck: [[-a * 0.6, -h * 0.52], [-a * 0.6, -h * 1.15], [a * 0.15, -h * 1.15], [a * 0.15, -h * 0.55]],
      bridge: [[a * 0.15, -h * 0.55], [a * 0.15, -h * 1.7], [a * 0.42, -h * 1.7], [a * 0.5, -h * 0.55]],
      fun1: [[-a * 0.38, -h * 1.12], [-a * 0.34, -h * 1.85], [-a * 0.2, -h * 1.85], [-a * 0.18, -h * 1.12]],
      fun2: [[-a * 0.06, -h * 1.12], [-a * 0.02, -h * 1.75], [a * 0.1, -h * 1.75], [a * 0.12, -h * 1.12]],
      mast: [[a * 0.3, -h * 1.7], [a * 0.3, -h * 2.9]], yard: [[a * 0.18, -h * 2.5], [a * 0.42, -h * 2.5]],
      gun: [[a * 0.6, -h * 0.75], [a * 0.92, -h * 1.0]],
      deckY: -h * 0.55, a, h,
    };
  }
  // submarine side profile around (0, 0), nose toward +x
  function subPts(L, h) {
    const top = [], bot = [];
    for (let k = 0; k <= 24; k++) {
      const u = k / 24, x = -L / 2 + L * u;
      let half = h / 2 * Math.pow(Math.sin(Math.PI * Math.min(0.999, Math.max(0.001, u * 0.92 + 0.04))), 0.32);
      if (u < 0.35) half *= lerp(0.35, 1, sm(u / 0.35));
      top.push([x, -half]); bot.push([x, half]);
    }
    return top.concat(bot.reverse());
  }

  // ================================================================ ar_sea (side view, ships above, submarine below)
  SH.ar_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 83, r = rng(seed * 23 + 4);
      const SY = (P.surface ?? (portrait ? 0.3 : 0.32)) * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const cloudF = mk(world, INK.paperLight), cloudR = mk(world, INK.inkSoft);
      const shipG = el(world, 'g');
      const waterF = mk(world, INK.paperDark), surfR = mk(world), hatchR = mk(world, INK.inkSoft), bubF = mk(world, INK.paperLight), bubR = mk(world, INK.inkSoft);
      const pingR = mk(world, INK.inkSoft);
      const subF = mk(world, INK.inkSoft), subR = mk(world), subD = mk(world, INK.paperDark), winF = mk(world, INK.paperLight), winR = mk(world), winLamp = mk(world, INK.red), winGlow = mk(world, INK.red, { 'fill-opacity': 0.16 });
      const chF = mk(world, INK.inkSoft), chR = mk(world), trailR = mk(world, INK.inkSoft);
      const blastF = mk(world, INK.gold), blastR = mk(world, INK.red), blastC = mk(world, INK.paperLight), ringR = mk(world, INK.inkSoft);
      const castG = el(world, 'g'), uiG = el(root, 'g');
      const ships = (P.ships || [{ x: 0.25 }, { x: 0.72, face: -1 }]).map((s, i) => ({ s, i, F: mk(shipG, INK.paperLight), D: mk(shipG, INK.paperDark), R: mk(shipG), ph: r() * 6 }));
      const SB = Object.assign({ x: 0.5, y: portrait ? 0.53 : 0.62, len: portrait ? 0.9 : 0.62, h: portrait ? 330 : 250, window: true, face: 1 }, P.sub || {});
      const charges = (P.charges || []).map((c, i) => Object.assign({ k: i }, c));
      const cast = castOf(P, castG, seed, portrait ? 0.78 : 0.6);
      const labels = labelsOf(P.labels, uiG, W, H);
      const bubbles = bubblesOf(P.bubbles, uiG, W, H);
      const cTop = portrait ? 0.15 * H : 0.12 * H;
      const clouds = P.clouds === false ? [] : Array.from({ length: 3 }, (_, i) => ({ x: W * (0.12 + i * 0.38) + r() * 60, y: Math.max(cTop, SY * (0.45 + r() * 0.25)), s: 0.7 + r() * 0.4 }));
      const hatch = Array.from({ length: 34 }, () => ({ x: r() * W, y: SY + 40 + r() * (H - SY), l: 30 + r() * 60, sp: 8 + r() * 14 }));
      const fizz = Array.from({ length: 18 }, () => ({ x: r(), ph: r(), sp: 0.12 + r() * 0.1, s: 6 + r() * 8 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          // charge timings
          const CH = charges.map(c => { const at = atOr(cues, c.at, 0.5 + c.k * 0.5); const sx = (c.x ?? 0.5) * W, ty = (c.depth ?? (SB.y - SB.h / H * 0.75)) * H; return { c, at, sx, ty, hit: at + (ty - SY) / 520 }; });
          let shake = 0;
          CH.forEach(c => { const s = lt - c.hit; if (s >= 0) shake += Math.sin(lt * 49 + c.k) * 18 * Math.exp(-s * 4); });
          const cm = camOf(P, lt, dur, W, H, 1 + 0.03 * CH.reduce((a, c) => a + punch(lt, c.hit, 0.6), 0));
          world.setAttribute('transform', `${coverTf(P, W)}translate(${f1(Math.sin(lt * 0.35) * 6 + shake)} ${f1(Math.cos(lt * 0.28) * 4 + shake * 0.4)}) translate(${f1(cm.fx)} ${f1(cm.fy)}) scale(${cm.z.toFixed(4)}) translate(${f1(-cm.fx)} ${f1(-cm.fy)})`);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // clouds
          let cf = '', cr = '';
          clouds.forEach((c, i) => {
            const x = c.x + lt * 14 * c.s, y = c.y, R = 30 * c.s;
            const b = [[x - 3 * R, y], [x - 2.4 * R, y - 0.9 * R], [x - 1.4 * R, y - 1.4 * R], [x - 0.3 * R, y - 1.9 * R], [x + 0.8 * R, y - 1.4 * R], [x + 1.8 * R, y - 1.5 * R], [x + 2.7 * R, y - 0.7 * R], [x + 3 * R, y]];
            cf += inkLoop(b.concat([[x, y + 6]]), O(10 + i, { amp: 1.2 })) + ' ';
            cr += inkPath(b, O(10 + i, { w: 3.5, amp: 1.2 })) + ' ';
          });
          cloudF.setAttribute('d', cf); cloudR.setAttribute('d', cr);
          // ships (bobbing; drawn before the water so the hull bottoms hide under it)
          ships.forEach(sh => {
            const s = sh.s, sc = (s.scale ?? 1) * (portrait ? 1 : 0.85), face = s.face ?? 1, x0 = (s.x ?? 0.5) * W, y0 = SY + 6 + Math.sin(t * 1.3 + sh.ph) * 5;
            const rot = Math.sin(t * 1.1 + sh.ph) * 1.5, pp = shipParts(sc);
            const tf = q => { const a = rot * Math.PI / 180, x = q[0] * face, y = q[1]; return [x0 + x * Math.cos(a) - y * Math.sin(a), y0 + x * Math.sin(a) + y * Math.cos(a)]; };
            const T = a => a.map(tf), k = 200 + sh.i * 30;
            sh.F.setAttribute('d', inkLoop(T(pp.hull), O(k, { smooth: false, amp: 1.2 })) + ' ' + inkLoop(T(pp.bridge), O(k + 2, { smooth: false, amp: 1 })));
            sh.D.setAttribute('d', inkLoop(T(pp.deck), O(k + 1, { smooth: false, amp: 1 })) + ' ' + inkLoop(T(pp.fun1), O(k + 3, { smooth: false, amp: 1 })) + ' ' + inkLoop(T(pp.fun2), O(k + 4, { smooth: false, amp: 1 })));
            let d = '';
            [pp.hull, pp.deck, pp.bridge, pp.fun1, pp.fun2].forEach((a, j) => { d += inkPath(T(a), O(k + 5 + j, { w: 5, closed: true, smooth: false, amp: 1.1 })) + ' '; });
            d += inkPath(T(pp.mast), O(k + 11, { w: 5 })) + ' ' + inkPath(T(pp.yard), O(k + 12, { w: 4 })) + ' ' + inkPath(T(pp.gun), O(k + 13, { w: 7 })) + ' ';
            d += inkPath(T([[pp.a * 0.2, -pp.h * 1.3], [pp.a * 0.38, -pp.h * 1.3]]), O(k + 14, { w: 3 }));
            // funnel smoke
            for (let j = 0; j < 3; j++) { const u = ((lt * 0.5 + j / 3) % 1); const p = tf([-pp.a * 0.27 - u * 90, -pp.h * 1.95 - u * 70]); d += ' ' + inkCircle(p[0], p[1], 10 + u * 22, sd + k + 20 + j, t, { w: 3 }); }
            sh.R.setAttribute('d', d);
          });
          // water
          const surf = []; for (let k = 0; k <= 24; k++) { const x = -80 + (W + 160) * k / 24; surf.push([x, SY + Math.sin(k * 1.3 + t * 2) * 6]); }
          waterF.setAttribute('d', inkLoop(surf.concat([[W + 80, H + 80], [-80, H + 80]]), O(30, { amp: 1 })));
          surfR.setAttribute('d', inkPath(surf, O(31, { w: 6 })));
          hatchR.setAttribute('d', hatch.map((h, i) => { const x = ((h.x + lt * h.sp) % (W + 120)) - 60; return inkPath([[x, h.y], [x + h.l, h.y + 2]], O(40 + i, { w: 3, amp: 0.8 })); }).join(' '));
          // sonar pings from the ships
          const pa = P.ping != null && P.ping !== false ? atOr(cues, P.ping, 0.2) : null;
          let pg = '';
          if (pa != null && lt >= pa) ships.forEach((sh, j) => {
            const x0 = (sh.s.x ?? 0.5) * W;
            for (let k = 0; k < 3; k++) {
              const u = ((lt - pa) * 0.8 + k / 3 + j * 0.17) % 1, R = 40 + u * (portrait ? 620 : 520), pts = [];
              for (let q = 0; q <= 12; q++) { const a = Math.PI * (0.18 + 0.64 * q / 12); pts.push([x0 + Math.cos(a) * R, SY + 30 + Math.sin(a) * R * 0.8]); }
              if (u < 0.92) pg += inkPath(pts, O(60 + j * 5 + k, { w: 6 * (1 - u) + 1, amp: 1 })) + ' ';
            }
          });
          pingR.setAttribute('d', pg);
          // submarine (rises on "rise")
          const ra = atOr(cues, SB.rise, null), rp = ra != null ? progIO(lt, ra, 2.4) : 0;
          const L = SB.len * W, sh2 = SB.h, sx = SB.x * W + Math.sin(lt * 0.5) * 6, syBase = SB.y * H, sy = lerp(syBase, SY + sh2 * 0.15, rp) + Math.sin(lt * 0.9) * 5, fc = SB.face;
          const rotD = Math.sin(lt * 0.7) * 0.8 - rp * (1 - rp) * 10 * fc;
          const tfS = q => { const a = rotD * Math.PI / 180, x = q[0] * fc, y = q[1]; return [sx + x * Math.cos(a) - y * Math.sin(a), sy + x * Math.sin(a) + y * Math.cos(a)]; };
          const hull = subPts(L, sh2).map(tfS);
          const sT = SB.sail ?? 0.95;
          const sail = [[L * 0.06, -sh2 * 0.42], [L * 0.1, -sh2 * sT], [L * 0.24, -sh2 * sT], [L * 0.27, -sh2 * 0.4]].map(tfS);
          subF.setAttribute('d', inkLoop(hull, O(80, { amp: 1.2 })));
          subD.setAttribute('d', inkLoop(sail, O(81, { smooth: false, amp: 1 })));
          let d = inkPath(hull, O(82, { w: 7, closed: true, amp: 1.2 })) + ' ' + inkPath(sail, O(83, { w: 6, closed: true, smooth: false }));
          d += ' ' + inkPath([[L * 0.16, -sh2 * sT], [L * 0.16, -sh2 * (sT + 0.25)], [L * 0.2, -sh2 * (sT + 0.25)]].map(tfS), O(84, { w: 5 }));
          d += ' ' + inkPath([[-L * 0.5, -sh2 * 0.05], [-L * 0.56, -sh2 * 0.32], [-L * 0.47, -sh2 * 0.3]].map(tfS), O(85, { w: 5 }));
          const pr = t * 9; d += ' ' + inkPath([[-L * 0.5 - 8, -Math.cos(pr) * sh2 * 0.2], [-L * 0.5 - 8, Math.cos(pr) * sh2 * 0.2]].map(tfS), O(86, { w: 6 }));
          for (let k = 0; k < 8; k++) d += ' ' + inkDot(...tfS([-L * 0.3 + k * L * 0.09, sh2 * 0.28]), 5, 5, sd + 87 + k, t);
          let wf = '', wr = '', wl = '', wg = '';
          if (SB.window) {
            const WN = Array.isArray(SB.window) ? SB.window : [-0.2, 0.22, -0.4, 0.42];
            const wx0 = L * WN[0], wx1 = L * WN[1], wy0 = sh2 * WN[2], wy1 = sh2 * WN[3];
            const win = [[wx0 + 30, wy0], [wx1 - 30, wy0], [wx1, wy0 + 30], [wx1, wy1 - 20], [wx1 - 20, wy1], [wx0 + 20, wy1], [wx0, wy1 - 20], [wx0, wy0 + 30]].map(tfS);
            wf = inkLoop(win, O(100, { smooth: false, amp: 1 }));
            wr = inkPath(win, O(101, { w: 6, closed: true, smooth: false, amp: 1 }));
            const lp = tfS([(wx0 + wx1) / 2, wy0 + 26]), pulse = 0.5 + 0.5 * Math.sin(t * 3);
            wl = inkCircle(lp[0], lp[1], 18, sd + 102, t, { fill: true });
            wg = inkCircle(lp[0], lp[1] + 20, 80 + 20 * pulse, sd + 103, t, { fill: true });
            // a pipe line inside
            wr += ' ' + inkPath([[wx0 + 10, wy0 + 60], [wx1 - 10, wy0 + 60]].map(tfS), O(104, { w: 4 }));
          }
          winF.setAttribute('d', wf); winR.setAttribute('d', wr); winLamp.setAttribute('d', wl); winGlow.setAttribute('d', wg);
          subR.setAttribute('d', d);
          // bubbles drifting up from the hull
          let bf = '', br = '';
          fizz.forEach((b, i) => {
            const u = (lt * b.sp + b.ph) % 1, x = sx + (b.x - 0.5) * L * 0.9 + Math.sin(u * 9 + i) * 10, y = lerp(sy - sh2 * 0.4, SY + 20, u);
            if (y > SY + 20) { bf += inkCircle(x, y, b.s, sd + 120 + i, t, { fill: true }) + ' '; br += inkCircle(x, y, b.s, sd + 120 + i, t, { w: 2.5 }) + ' '; }
          });
          bubF.setAttribute('d', bf); bubR.setAttribute('d', br);
          // depth charges: drop, sink with a trail, burst
          let cfd = '', crd = '', tr = '', bfd = '', brd = '', bcd = '', rgd = '';
          CH.forEach(c => {
            if (lt < c.at) return;
            if (lt < c.hit) {
              const y = lerp(SY - 40, c.ty, clamp01((lt - c.at) / (c.hit - c.at))), x = c.sx + Math.sin((lt - c.at) * 5 + c.k) * 8, a = (lt - c.at) * 2.5;
              const bar = [[-15, -20], [15, -20], [15, 20], [-15, 20]].map(q => [x + q[0] * Math.cos(a) - q[1] * Math.sin(a), y + q[0] * Math.sin(a) + q[1] * Math.cos(a)]);
              cfd += inkLoop(bar, O(140 + c.k, { smooth: false, amp: 0.6 })) + ' ';
              crd += inkPath(bar, O(150 + c.k, { w: 5, closed: true, smooth: false, amp: 0.6 })) + ' ';
              for (let k = 1; k < 6; k++) { const yy = y - k * 34; if (yy > SY + 10) tr += inkCircle(x + Math.sin(k * 2 + lt * 4) * 9, yy, 5 + k * 1.2, sd + 160 + c.k * 7 + k, t, { w: 2.5 }) + ' '; }
            } else {
              const s = lt - c.hit, u = clamp01(s / 1.2);
              if (u < 1) {
                const R = lerp(30, portrait ? 150 : 120, sm(s / 0.3)) * (1 - 0.6 * u);
                const pts = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + c.k, rr = (k % 2 ? 0.55 : 1) * R; pts.push([c.sx + Math.cos(a) * rr, c.ty + Math.sin(a) * rr]); }
                bfd += inkLoop(pts, O(170 + c.k, { smooth: false, amp: 1.2 })) + ' ';
                brd += inkPath(pts, O(180 + c.k, { w: 6, closed: true, smooth: false, amp: 1.2 })) + ' ';
                bcd += inkCircle(c.sx, c.ty, R * 0.35, sd + 190 + c.k, t, { fill: true }) + ' ';
              }
              for (let k = 0; k < 2; k++) { const RR = (s - k * 0.15) * 700; if (RR > 20 && RR < 900) rgd += inkCircle(c.sx, c.ty, RR, sd + 200 + c.k * 3 + k, t, { w: Math.max(1.5, 7 - RR / 150), ry: RR * 0.8 }) + ' '; }
            }
          });
          chF.setAttribute('d', cfd); chR.setAttribute('d', crd); trailR.setAttribute('d', tr);
          blastF.setAttribute('d', bfd); blastR.setAttribute('d', brd); blastC.setAttribute('d', bcd); ringR.setAttribute('d', rgd);
          // cast members ride the sub when they stand in its window (y below the surface)
          const dy = sy - syBase;
          castUpdate(cast, lt, t, cues, W, H, SY + shipParts(portrait ? 1 : 0.85).deckY, sd); hideCoverKasif(P, cast);
          cast.forEach(c => { if (c.m.y != null && c.m.y * H > SY) { c.wrap.setAttribute('transform', `translate(0 ${f1(dy)})`); } });
          labelsUpdate(labels, lt, t, cues, W, H, sd);
          bubblesUpdate(bubbles, lt, t, cues, W, H, sd);
        },
      };
    },
  };
})();
