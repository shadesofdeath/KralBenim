// londonfire: the Great Fire of London (2 September 1666) in the parchment ink style (brand/kit/BRAND.md §5;
// every line boils at 8 Hz via _ink.js). Two modes:
//   street  — a row of half-timbered houses with jettied upper floors (each storey sticks out over the one below),
//             gabled roofs, lattice windows; one house is the bakery (brick oven glowing in the ground floor, a loaf
//             sign). Fire starts in one house on a cue and jumps house to house (red/gold ink flame tongues, smoke,
//             embers carried by the wind). Optional: oven sparks, wind lines, the jetties growing out until the top
//             floors almost touch ("tight"), the timber frame flashing red ("timber").
//   skyline — the City seen from across the Thames: a dense roofline of tiny houses, church towers and Old St Paul's
//             (long nave + square tower, no spire, as in 1666); a fire front sweeps across from right to left,
//             flames + smoke columns above the roofs, glow streaks in the river, the cathedral catches on a cue,
//             an optional counter ("13.200 ev") ticks up.
// Fire uses only palette tokens: red tongues, gold cores, ink outline, ink-soft smoke (fill-opacity per blob).
//
// SHOTS.londonfire P: {
//   mode: "street"|"skyline",
//   houses: 5, bakery: 2 (index, -1 = none), ground: 0.585 (0..1 H),
//   fire: {start: 2, at: cue|seconds (default 0.3; negative = already burning), step: 0.5 (s per house),
//          dir: 0 (both ways) | 1 | -1, only: false (just the start house), size: 1, grow: 1.2 (s to full)},
//   spark: cue|seconds (sparks burst from the oven mouth), wind: {at, dir: -1, y: 0.2} (wind lines across the sky),
//   tight: {at, from: 0} (jetties grow from `from` x their width to full: the upper floors close the street gap,
//          a red double arrow appears between the top floors),
//   timber: {at} (beams flash red, then stay red-tinted),
//   embers: true,
//   skyline: {front: {from: 1.05, to: 0.1, at, dur: 2.6}, cathedral: {x: 0.3, at: cue}, count: {to: 13200,
//             suffix: " ev", at, dur: 1.6, x: 0.5, y: 0.2, size: 120}},
//   cast: [{who: "kasif"|name, accessory, beard, x, y (0..1 H), scale, pose, at, then, to, face: "left"|"right",
//           dir, emotion, emotion0, item, text, seq: [{at, pose, to, face, emotion, dir}]}],
//   label: {text, x: 0.5, y: 0.2, at, size, color: "ink"|"red", arrow: [x, y]},
//   cam: {zoom: 1.06, focus: [0.5, 0.5]}
// }
// cues: fire.at, spark, wind.at, tight.at, timber.at, skyline.front.at / cathedral.at / count.at, cast/label "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // one flame tongue: base centre (cx, by), width w, height h, sway (px at the tip)
  function tongue(cx, by, w, h, sway) {
    return [[cx - w / 2, by], [cx - w * 0.46, by - h * 0.3], [cx - w * 0.22 + sway * 0.45, by - h * 0.66], [cx + sway, by - h],
      [cx + w * 0.2 + sway * 0.5, by - h * 0.58], [cx + w * 0.44 + sway * 0.15, by - h * 0.28], [cx + w / 2, by]];
  }

  // ---- cast: Kaşif + period figures on the ground line (shared by londonfire / londonmap / firecauses)
  function castMake(parent, list, seed, portrait) {
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const sc = m.scale ?? (portrait ? 0.62 : 0.5);
      return { m, isK, sc, rig: typeof KASIF !== 'undefined' ? KASIF.create(el(parent, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) : null };
    });
  }
  function castUpdate(cast, lt, t, cues, W, H, G, dur) {
    cast.forEach(c => {
      if (!c.rig) return;
      const m = c.m;
      let pose = m.pose || 'idle', since = lt, x = (m.x ?? 0.8) * W, face = m.face === 'left' ? -1 : 1, emotion = m.emotion0 || null, dir = m.dir, prevPose = null, at = null;
      const at0 = atOr(cues, m.at, null);
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      if (moving && (at0 == null || lt < at0)) x = lerp(x, m.to * W, clamp01(lt / Math.max(0.3, at0 ?? dur)));
      else if (m.to != null) x = m.to * W;
      if (at0 != null && lt >= at0) { prevPose = pose; pose = m.then || 'point'; since = lt - at0; at = at0; emotion = m.emotion || (pose === 'shock' ? 'surprised' : null); }
      (m.seq || []).forEach(sq => {
        const sa = atOr(cues, sq.at, null);
        if (sa == null || lt < sa) return;
        prevPose = pose; at = sa; since = lt - sa;
        const x0 = x;
        pose = sq.pose || pose;
        if (sq.face) face = sq.face === 'left' ? -1 : 1;
        if (sq.emotion) emotion = sq.emotion;
        if (sq.dir != null) dir = sq.dir;
        if (sq.to != null) x = lerp(x0, sq.to * W, clamp01((lt - sa) / (sq.dur ?? 1.2)));
      });
      const y = m.y != null ? m.y * H : G + 6;
      const dd = typeof dir === 'number' ? dir : DIRS[dir] ?? 30;
      const o = { x, y, face, since, dir: dd, text: m.text, item: m.item, emotion };
      if (pose === 'walk' || pose === 'run') o.ph = lt / (pose === 'run' ? 0.55 : 0.9);
      if (at != null && since < 0.32 && prevPose) { o.prev = { pose: prevPose, since: at, dir: dd, ph: o.ph }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
    });
  }
  // ---- giant Fraunces words, word by word (cues w0, w1, ...), one highlight word in a red box
  // Wd: {lines: ["Asıl tehlike", "başkaydı"], highlight: ["tehlike"], y: 0.22 (first baseline, 0..1 H), size: 140, x: 0.5}
  function wordsMake(parent, Wd) {
    if (!Wd || !Wd.lines) return null;
    const hl = (Wd.highlight || []).map(w => w.toLocaleUpperCase('tr-TR'));
    const items = [];
    Wd.lines.forEach((line, li) => line.split(/\s+/).filter(Boolean).forEach(w => {
      const up = w.toLocaleUpperCase('tr-TR'), isH = hl.some(h => up.replace(/[^\p{L}\d]/gu, '') === h.replace(/[^\p{L}\d]/gu, ''));
      const g = el(parent, 'g'), box = isH ? inkEl(g, INK.red) : null, boxO = isH ? inkEl(g, INK.ink) : null;
      const tx = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': Wd.size || 140, 'text-anchor': 'start',
        fill: isH ? INK.paperLight : INK.ink, style: isH ? '' : `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
      tx.textContent = up;
      items.push({ li, g, box, boxO, tx, isH, w: 0 });
    }));
    return { Wd, items };
  }
  function wordsUpdate(wr, lt, t, cues, W, H, sd) {
    if (!wr) return;
    const { Wd, items } = wr, fs = Wd.size || 140, gap = fs * 0.3, lh = fs * 1.12;
    items.forEach(it => { it.w = it.tx.getComputedTextLength ? it.tx.getComputedTextLength() || fs * 3 : fs * 3; });
    const nl = Math.max(...items.map(it => it.li)) + 1;
    for (let li = 0; li < nl; li++) {
      const row = items.filter(it => it.li === li);
      const tw = row.reduce((a, it) => a + it.w + (it.isH ? fs * 0.3 : 0), 0) + gap * (row.length - 1);
      let x = (Wd.x ?? 0.5) * W - tw / 2;
      const y = (Wd.y ?? 0.22) * H + li * lh;
      row.forEach(it => {
        const k = items.indexOf(it), at = atOr(cues, 'w' + k, 0.1 + k * 0.18), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5);
        const pad = it.isH ? fs * 0.15 : 0, cx = x + pad + it.w / 2;
        const sc = lerp(1.35, 1, p) * (1 + 0.06 * pk), b = boil(sd + 9100 + k, t, 1);
        it.g.style.display = lt >= at ? '' : 'none';
        it.g.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(y - fs * 0.35 + b[1])}) scale(${sc.toFixed(3)}) rotate(${f1((1 - p) * (k % 2 ? 5 : -5) + (it.isH ? -2 : 0))}) translate(${f1(-cx)} ${f1(-(y - fs * 0.35))})`);
        it.tx.setAttribute('x', f1(x + pad)); it.tx.setAttribute('y', f1(y));
        if (it.isH) {
          const q = [[x, y - fs * 0.86], [x + it.w + pad * 2, y - fs * 0.9], [x + it.w + pad * 2 + 4, y + fs * 0.2], [x - 3, y + fs * 0.22]];
          it.box.setAttribute('d', inkLoop(q, { seed: sd + 9200 + k, t, amp: 1.2, smooth: false }));
          it.boxO.setAttribute('d', inkPath(q, { seed: sd + 9200 + k, t, amp: 1.2, w: 5, closed: true, smooth: false }));
        }
        x += it.w + pad * 2 + gap;
      });
    }
  }
  // camera: slow push-in over the scene + optional second push towards a point on a cue (cam.push)
  function camSet(node, Pc, lt, t, dur, cues, W, H, shake) {
    Pc = Pc || {};
    const F0 = Pc.focus || [0.5, 0.5];
    let z = lerp(1, Pc.zoom ?? 1.06, progIO(lt, 0, Math.max(1.5, dur))), fx = F0[0] * W, fy = F0[1] * H;
    if (Pc.push) {
      const pa = atOr(cues, Pc.push.at, null);
      if (pa != null) {
        const pp = progIO(lt, pa, Pc.push.dur ?? 1.2), F1 = Pc.push.focus || F0;
        z = lerp(z, Pc.push.zoom ?? 1.25, pp); fx = lerp(fx, F1[0] * W, pp); fy = lerp(fy, F1[1] * H, pp);
      }
    }
    const sh = shake || 0;
    node.setAttribute('transform', `translate(${f1(fx + Math.sin(t * 37) * sh)} ${f1(fy + Math.cos(t * 41) * sh)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }

  SH.londonfire = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.72, this_K = K;
      const mode = P.mode || 'street';
      const G = (P.ground ?? (portrait ? 0.585 : 0.8)) * H;
      const r = rng(seed * 11 + 5);
      const cam = el(svg, 'g');
      const farG = el(cam, 'g'), smokeG = el(cam, 'g'), houseG = el(cam, 'g'), fireG = el(cam, 'g'), actorG = el(cam, 'g'), fxG = el(cam, 'g');
      const uiG = el(svg, 'g');
      const FIRE = Object.assign({ start: 2, at: 0.3, step: 0.5, dir: 0, only: false, size: 1, grow: 1.2 }, P.fire || {});
      const windDir = (P.wind && P.wind.dir) || -1;

      // ---------------------------------------------------------------- street: houses
      const houses = [];
      if (mode === 'street') {
        const n = Math.max(2, Math.min(7, P.houses ?? 5));
        const sp = W / n, bi = P.bakery ?? 2, big = P.big ?? 1;
        for (let i = 0; i < n; i++) {
          const s0 = i === bi ? big : 1;
          const w0 = sp * (0.7 + r() * 0.04) * s0, h1 = (160 + r() * 30) * K * s0, h2 = (140 + r() * 24) * K * s0, h3 = (128 + r() * 24) * K * s0;
          const hr = (130 + r() * 60) * K * s0, ov = sp * (0.065 + r() * 0.01) * s0;
          const g = el(houseG, 'g');
          houses.push({ i, s: s0, cx: sp * (i + 0.5), w0, h1, h2, h3, hr, ov, g, wall: mk(g, INK.paperLight), char: mk(g, INK.inkSoft, { 'fill-opacity': 0 }),
            beams: mk(g), beamsR: mk(g, INK.red, { 'fill-opacity': 0 }), win: mk(g, INK.inkSoft), winF: mk(g, INK.paperDark), roof: mk(g, INK.paperDark), roofO: mk(g), oven: null });
        }
        if (big !== 1 && houses[bi]) {   // re-place the row around the big bakery (top floors touch, as in the even row)
          const topW = h => h.w0 + 4 * h.ov;
          houses[bi].cx = (P.hero_x ?? 0.5) * W;
          for (let i = bi + 1; i < n; i++) houses[i].cx = houses[i - 1].cx + (topW(houses[i - 1]) + topW(houses[i])) / 2;
          for (let i = bi - 1; i >= 0; i--) houses[i].cx = houses[i + 1].cx - (topW(houses[i + 1]) + topW(houses[i])) / 2;
        }
        const b = houses[P.bakery ?? 2];
        if (b && (P.bakery ?? 2) >= 0) houseG.appendChild(b.g);
        if (b && (P.bakery ?? 2) >= 0) b.oven = { glow: mk(b.g, INK.gold), glowR: mk(b.g, INK.red), brick: mk(b.g), sign: mk(b.g, INK.paperLight), signO: mk(b.g), loaf: mk(b.g, INK.stain), loafO: mk(b.g) };
      }
      // street cobbles
      const gL = mk(farG), cob = mk(farG, INK.inkSoft, { 'fill-opacity': 0.55 });

      // ---------------------------------------------------------------- skyline
      const sky = mode === 'skyline' ? (() => {
        const Y0 = ((P.skyline && P.skyline.y) ?? (portrait ? 0.47 : 0.62)) * H, bl = [];
        let x = -30;
        while (x < W + 30) {
          const w = (46 + r() * 46) * K, h = (80 + r() * 120) * K;
          bl.push({ x: x + w / 2, w, h, roof: r() < 0.7, s: r() });
          x += w - 4 * K;
        }
        const S = Object.assign({}, P.skyline || {});
        const cathX = ((S.cathedral && S.cathedral.x) ?? 0.3) * W;
        const churches = [0.08, 0.5, 0.64, 0.9].map(u => ({ x: u * W, h: (220 + r() * 60) * K, w: 38 * K }));
        return { Y0, bl, S, cathX, churches,
          back: mk(farG, INK.paperDark, { 'fill-opacity': 0.75 }), backO: mk(farG, INK.inkSoft),
          ch: mk(farG, INK.paperLight), chO: mk(farG), cath: mk(farG, INK.paperLight), cathO: mk(farG), cathW: mk(farG, INK.inkSoft),
          water: mk(farG, INK.paperLight), waterO: mk(farG, INK.inkSoft), rip: mk(farG, INK.inkSoft, { 'fill-opacity': 0.7 }),
          glowW: mk(farG, INK.gold, { 'fill-opacity': 0.55 }), glowR: mk(farG, INK.red, { 'fill-opacity': 0.45 }),
          bank: mk(farG, INK.paperDark), bankO: mk(farG) };
      })() : null;

      // ---------------------------------------------------------------- fire, smoke, embers
      const flR = mk(fireG, INK.red), flG = mk(fireG, INK.gold), flO = mk(fireG, INK.ink);
      const smoke = [];
      for (let i = 0; i < 22; i++) smoke.push(mk(smokeG, INK.inkSoft, { 'fill-opacity': 0 }));
      const embers = mk(fxG, INK.gold), sparks = mk(fxG, INK.gold), sparksO = mk(fxG, INK.red);
      const windP = mk(fxG, INK.inkSoft);
      const arrow = mk(uiG, INK.red);

      // ---------------------------------------------------------------- cast
      const cast = castMake(actorG, P.cast, seed, portrait);
      const words = wordsMake(uiG, P.words);
      // label
      let label = null;
      if (P.label && P.label.text) {
        const t = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': P.label.size || (portrait ? 88 : 64), 'text-anchor': 'middle', fill: P.label.color === 'red' ? INK.red : INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
        t.textContent = P.label.text;
        label = { L: P.label, t, u: mk(uiG, INK.red), a: mk(uiG, INK.ink) };
      }
      // counter
      let counter = null;
      if (sky && sky.S.count) {
        const C = sky.S.count;
        const t = el(uiG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': C.size || 120 * K, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` });
        counter = { C, t };
      }


      // ignition time of street house i
      const ignite = (i, at0) => {
        const d = i - FIRE.start;
        if (FIRE.only && d !== 0) return null;
        if (FIRE.dir && d * FIRE.dir < 0) return null;
        return at0 + Math.abs(d) * FIRE.step;
      };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = seed * 1000;
          const O = (k, o) => Object.assign({ seed: sd + k, t, amp: 1.4 }, o || {});
          const fireAt = atOr(cues, FIRE.at, 0.3);
          const fireHit = punch(lt, fireAt, 0.6);
          // camera: slow push-in + small shake on the fire cue
          camSet(cam, P.cam, lt, t, dur, cues, W, H, fireHit * 6);

          let fR = '', fG = '', fO = '';
          // a flame cluster: three licking tongues of different heights on a rounded base, each flickering on its own
          const cluster = (cx, by, w, h, ph, sc) => {
            const PK = [[-0.3, 0.6], [0.02, 1], [0.3, 0.72]];
            const pts = [[cx - w / 2, by], [cx - w * 0.47, by - h * 0.14]];
            PK.forEach(([px, a], i) => {
              const hh = h * a * sc * (0.78 + 0.16 * Math.sin(t * (7.5 + i * 2.3) + ph + i * 2.1) + 0.06 * Math.sin(t * 19 + ph * 3 + i));
              const sway = Math.sin(t * (4.2 + i) + ph + i) * w * 0.1 + windDir * hh * 0.28;
              const bx = cx + px * w;
              if (i > 0) pts.push([bx - w * 0.15, by - h * sc * 0.3]);
              pts.push([bx - w * 0.09 + sway * 0.4, by - hh * 0.55], [bx + sway, by - hh], [bx + w * 0.07 + sway * 0.55, by - hh * 0.62]);
            });
            pts.push([cx + w * 0.47, by - h * 0.16], [cx + w / 2, by], [cx + w * 0.3, by + w * 0.1], [cx - w * 0.3, by + w * 0.1]);
            return pts;
          };
          const flame = (cx, by, w, h, ph, k) => {
            if (h < 4) return;
            const pts = cluster(cx, by, w, h, ph, 1);
            fR += inkLoop(pts, O(k, { amp: 1.4 })) + ' ';
            fO += inkPath(pts, O(k, { w: 3.4 * K, closed: true, amp: 1.4 })) + ' ';
            fG += inkLoop(cluster(cx + windDir * h * 0.03, by - h * 0.02, w * 0.6, h * 0.62, ph + 1.3, 1), O(k + 1, { amp: 1.1 })) + ' ';
          };
          let smokeI = 0;
          const puff = (x, y, s, k, wind) => {
            for (let j = 0; j < 2 && smokeI < smoke.length; j++, smokeI++) {
              const ph = ((t * 0.32 + (k * 0.37 + j * 0.5)) % 1 + 1) % 1;
              const rr = (34 + ph * 80) * s * K, px = x + wind * ph * 160 * K + Math.sin(t * 1.3 + k) * 10, py = y - ph * 330 * s * K;
              smoke[smokeI].setAttribute('d', inkCircle(px, py, rr, sd + 5000 + k * 7 + j, t, { fill: true, n: 10 }));
              const top = portrait ? clamp01((py - 250) / 160) : 1;
              smoke[smokeI].setAttribute('fill-opacity', (0.34 * Math.sin(ph * Math.PI) * top).toFixed(3));
            }
          };
          let emb = '';
          const emberAt = (x, y, k, s) => {
            for (let j = 0; j < 3; j++) {
              const ph = ((t * 0.55 + k * 0.29 + j * 0.33) % 1 + 1) % 1;
              const ex = x + windDir * ph * 260 * K + Math.sin(t * 3 + k + j) * 24, ey = y - ph * 380 * K;
              if (ph < 0.92) emb += inkDot(ex, ey, 5 * K * s, 5 * K * s, sd + 6000 + k * 5 + j, t) + ' ';
            }
          };

          // ---------------------------------------------------------- street
          if (mode === 'street') {
            // ground
            gL.setAttribute('d', inkPath([[-20, G + 4], [W * 0.5, G + 1], [W + 20, G + 5]], O(10, { w: 5 })));
            let cd = '';
            for (let k = 0; k < 14; k++) { const cx = (k + 0.5) / 14 * W + Math.sin(k * 3.1) * 14, cy = G + 34 + (k % 2) * 30; cd += inkCircle(cx, cy, 16, sd + 20 + k, t, { ry: 7, fill: true, n: 8 }) + ' '; }
            cob.setAttribute('d', cd);
            const T = P.tight, tAt = T ? atOr(cues, T.at, 0.6) : null;
            const ovK = T ? lerp(T.from ?? 0, 1, spring(lt, tAt, 0.9)) : 1;
            const tb = P.timber ? atOr(cues, P.timber.at, 0.6) : null;
            const tbP = tb != null ? punch(lt, tb, 0.9) : 0, tbOn = tb != null && lt >= tb;
            houses.forEach(hs => {
              const { cx, w0, h1, h2, h3, hr } = hs, ov = hs.ov * ovK;
              const L1 = cx - w0 / 2, R1 = cx + w0 / 2, y1 = G - h1;
              const L2 = L1 - ov, R2 = R1 + ov, y2 = y1 - h2;
              const L3 = L2 - ov, R3 = R2 + ov, y3 = y2 - h3;
              const top = y3 - hr;
              const k0 = 100 + hs.i * 60;
              const fl1 = [[L1, G], [L1, y1], [R1, y1], [R1, G]], fl2 = [[L2, y1], [L2, y2], [R2, y2], [R2, y1]], fl3 = [[L3, y2], [L3, y3], [R3, y3], [R3, y2]];
              const roof = [[L3 - 10 * K, y3], [cx, top], [R3 + 10 * K, y3]];
              hs.wall.setAttribute('d', [fl1, fl2, fl3].map((q, j) => inkLoop(q, O(k0 + j, { smooth: false, amp: 1 }))).join(' '));
              hs.roof.setAttribute('d', inkLoop(roof, O(k0 + 3, { smooth: false, amp: 1 })));
              // timber frame: outlines, posts, braces, floor beams
              let bd = '';
              [fl1, fl2, fl3].forEach((q, j) => { bd += inkPath(q, O(k0 + 4 + j, { w: 5 * K, closed: true, smooth: false, amp: 1 })) + ' '; });
              const posts = (L, R, yb, yt, j) => {
                let d = '';
                for (let u = 1; u < 3; u++) { const x = lerp(L, R, u / 3); d += inkPath([[x, yb], [x, yt]], O(k0 + 10 + j * 5 + u, { w: 4 * K, amp: 1 })) + ' '; }
                d += inkPath([[L, yb], [lerp(L, R, 1 / 3), yt]], O(k0 + 20 + j, { w: 3.5 * K, amp: 1 })) + ' ';
                d += inkPath([[R, yb], [lerp(L, R, 2 / 3), yt]], O(k0 + 25 + j, { w: 3.5 * K, amp: 1 })) + ' ';
                return d;
              };
              bd += posts(L2, R2, y1, y2, 1) + posts(L3, R3, y2, y3, 2);
              // jetty brackets under the overhangs
              bd += inkPath([[L1, y1 + 24 * K], [L2, y1]], O(k0 + 30, { w: 4 * K })) + inkPath([[R1, y1 + 24 * K], [R2, y1]], O(k0 + 31, { w: 4 * K }));
              bd += inkPath([[L2, y2 + 22 * K], [L3, y2]], O(k0 + 32, { w: 4 * K })) + inkPath([[R2, y2 + 22 * K], [R3, y2]], O(k0 + 33, { w: 4 * K }));
              hs.beams.setAttribute('d', bd);
              hs.beamsR.setAttribute('d', tbOn ? bd : '');
              hs.beamsR.setAttribute('fill-opacity', tbOn ? (0.55 + 0.45 * tbP).toFixed(3) : 0);
              hs.roofO.setAttribute('d', inkPath(roof, O(k0 + 34, { w: 5 * K, closed: true, smooth: false, amp: 1 })) + ' ' +
                [0.3, 0.55, 0.8].map((u, j) => inkPath([[lerp(L3, cx, u), lerp(y3, top, u)], [lerp(R3, cx, u), lerp(y3, top, u)]], O(k0 + 35 + j, { w: 2.5 * K, amp: 1 }))).join(' '));
              // windows (lattice) on upper floors, door on the ground floor
              let wd = '', wf = '';
              [[L2, R2, y1, y2], [L3, R3, y2, y3]].forEach(([L, R, yb, yt], j) => {
                [0.5].forEach(u => {
                  const wx = lerp(L, R, u), wy = (yb + yt) / 2, ww = (R - L) * 0.24, wh = (yb - yt) * 0.42;
                  const q = [[wx - ww / 2, wy - wh / 2], [wx + ww / 2, wy - wh / 2], [wx + ww / 2, wy + wh / 2], [wx - ww / 2, wy + wh / 2]];
                  wf += inkLoop(q, O(k0 + 40 + j, { smooth: false, amp: 0.8 })) + ' ';
                  wd += inkPath(q, O(k0 + 42 + j, { w: 3.5 * K, closed: true, smooth: false, amp: 0.8 })) + ' ' +
                    inkPath([[wx, wy - wh / 2], [wx, wy + wh / 2]], O(k0 + 44 + j, { w: 2.5 * K, amp: 0.6 })) + ' ' +
                    inkPath([[wx - ww / 2, wy], [wx + ww / 2, wy]], O(k0 + 46 + j, { w: 2.5 * K, amp: 0.6 })) + ' ';
                });
              });
              if (!hs.oven) {
                const dx = cx + w0 * 0.12, dw = w0 * 0.26, dh = h1 * 0.62;
                const q = [[dx - dw / 2, G], [dx - dw / 2, G - dh], [dx + dw / 2, G - dh], [dx + dw / 2, G]];
                wf += inkLoop(q, O(k0 + 48, { smooth: false, amp: 0.8 })) + ' ';
                wd += inkPath(q, O(k0 + 49, { w: 4 * K, smooth: false, amp: 0.8 })) + ' ';
              }
              hs.win.setAttribute('d', wd); hs.winF.setAttribute('d', wf);
              // bakery oven + loaf sign
              if (hs.oven) {
                const K = this_K * hs.s;
                const ov2 = hs.oven, os = P.oven ?? 1, ox = cx - w0 * 0.08, ow = w0 * 0.5 * os, oh = Math.min(h1 * 0.9, h1 * 0.55 * os), ob = G - 8 * K;
                const arch = [[ox - ow / 2, ob], [ox - ow / 2, ob - oh * 0.55], [ox - ow * 0.3, ob - oh * 0.9], [ox, ob - oh], [ox + ow * 0.3, ob - oh * 0.9], [ox + ow / 2, ob - oh * 0.55], [ox + ow / 2, ob]];
                const mouth = [[ox - ow * 0.3, ob], [ox - ow * 0.3, ob - oh * 0.35], [ox, ob - oh * 0.58], [ox + ow * 0.3, ob - oh * 0.35], [ox + ow * 0.3, ob]];
                const glowK = 0.75 + 0.25 * Math.sin(t * 7) + punch(lt, atOr(cues, P.spark, -9), 0.8) * 0.4;
                ov2.glowR.setAttribute('d', inkLoop(mouth, O(k0 + 50, { amp: 1 })));
                const inner = mouth.map(q => [ox + (q[0] - ox) * 0.6 * glowK, ob - (ob - q[1]) * 0.7 * glowK]);
                ov2.glow.setAttribute('d', inkLoop(inner, O(k0 + 51, { amp: 1 })));
                let br = inkPath(arch, O(k0 + 52, { w: 5 * K })) + ' ' + inkPath(mouth, O(k0 + 53, { w: 4 * K })) + ' ';
                for (let j = 1; j < 4; j++) { const yy = ob - oh * j * 0.2; br += inkPath([[ox - ow / 2, yy], [ox - ow * 0.32, yy]], O(k0 + 54 + j, { w: 2.5 * K })) + inkPath([[ox + ow * 0.32, yy], [ox + ow / 2, yy]], O(k0 + 58 + j, { w: 2.5 * K })) + ' '; }
                ov2.brick.setAttribute('d', br);
                // hanging sign with a loaf, on a bracket out of the first floor
                const sx = R1 + ov + 36 * K, sy = y1 - h2 * 0.45, swing = Math.sin(t * 2.2) * 6 * K;
                const sq = [[sx - 52 * K + swing, sy + 34 * K], [sx + 52 * K + swing, sy + 34 * K], [sx + 52 * K + swing, sy + 112 * K], [sx - 52 * K + swing, sy + 112 * K]];
                ov2.sign.setAttribute('d', inkLoop(sq, O(k0 + 62, { smooth: false, amp: 1 })));
                ov2.signO.setAttribute('d', inkPath(sq, O(k0 + 63, { w: 4 * K, closed: true, smooth: false })) + ' ' +
                  inkPath([[R2, sy], [sx + 60 * K, sy]], O(k0 + 64, { w: 5 * K })) + ' ' +
                  inkPath([[sx - 40 * K, sy], [sx - 40 * K + swing, sy + 34 * K]], O(k0 + 65, { w: 2.5 * K })) + ' ' +
                  inkPath([[sx + 40 * K, sy], [sx + 40 * K + swing, sy + 34 * K]], O(k0 + 66, { w: 2.5 * K })));
                const lp = inkEllipsePts(sx + swing, sy + 73 * K, 36 * K, 20 * K, sd + 67, 10);
                ov2.loaf.setAttribute('d', inkLoop(lp, O(k0 + 67, { amp: 0.8 })));
                ov2.loafO.setAttribute('d', inkPath(lp, O(k0 + 68, { w: 3.5 * K, closed: true, amp: 0.8 })) + ' ' +
                  [-14, 0, 14].map((d, j) => inkPath([[sx + swing + d * K - 5 * K, sy + 64 * K], [sx + swing + d * K + 5 * K, sy + 80 * K]], O(k0 + 69 + j, { w: 2.5 * K, amp: 0.5 }))).join(' '));
              }
              // fire on this house
              const ti = ignite(hs.i, fireAt);
              let f = 0;
              if (ti != null && lt >= ti) f = Math.min(1.15, ti < 0 && lt < 0.05 ? 1 : (ti < 0 ? 1 : spring(lt, ti, FIRE.grow))) * (FIRE.size ?? 1);
              hs.char.setAttribute('fill-opacity', (clamp01(f) * 0.32).toFixed(3));
              hs.char.setAttribute('d', f > 0.01 ? [fl2, fl3].map((q, j) => inkLoop(q.map(p => [p[0], lerp(p[1], Math.max(p[1], (q[0][1] + q[1][1]) / 2), 0)]), O(k0 + 70 + j, { smooth: false, amp: 1 }))).join(' ') : '');
              if (f > 0.01) {
                const ph = hs.i * 1.7;
                // roof fire
                const fw = (R3 - L3) * 0.42;
                const ncl = Math.max(1, Math.round((R3 - L3) / (250 * K))), cw = (R3 - L3) / ncl;
                for (let j = 0; j < ncl; j++) {
                  const u = (j + 0.5) / ncl, yy = lerp(y3, top, 1 - Math.abs(u - 0.5) * 1.6) + 40 * K;
                  flame(L3 + cw * (j + 0.5), yy, cw * 1.05 * Math.min(1, 0.35 + 0.65 * f), 330 * K * f * Math.max(0.6, hs.s * (1 - Math.abs(u - 0.5) * 0.5)), ph + j * 1.9, k0 + 80 + j * 2);
                }
                // windows spitting flames
                flame(cx, (y2 + y3) / 2 + (y2 - y3) * 0.2, (R3 - L3) * 0.26, 120 * K * clamp01(f * 1.4 - 0.3), ph + 1, k0 + 86);
                if (f > 0.5) flame(cx, (y1 + y2) / 2 + (y1 - y2) * 0.2, (R2 - L2) * 0.24, 100 * K * clamp01(f * 2 - 1), ph + 3, k0 + 88);
                if (hs.oven && P.ovenfire !== false) {
                  const os = P.oven ?? 1, ox = cx - w0 * 0.08, oh = Math.min(h1 * 0.9, h1 * 0.55 * os);
                  flame(ox, G - 10 * K, w0 * 0.34 * os, oh * 1.5 * f, ph + 5, k0 + 90);
                  flame(L1 + w0 * 0.12, y1 + 6, w0 * 0.3, 150 * K * hs.s * f, ph + 6, k0 + 92);
                  flame(R1 - w0 * 0.1, y1 + 6, w0 * 0.3, 170 * K * hs.s * f, ph + 7, k0 + 94);
                }
                puff(cx, top, 1 * f * (hs.s || 1), hs.i, windDir);
                if (hs.s > 1) { puff(cx + w0 * 0.6, top - 60 * K, 1.2 * f, hs.i + 20, windDir); emberAt(cx + w0 * 0.4, top, hs.i + 20, 1.2); }
                emberAt(cx, top, hs.i, 1);
              }
              hs.top = top; hs.y3 = y3; hs.R3 = R3; hs.L3 = L3;
            });
            // the "tight" arrow between the top floors of the two middle houses
            if (T && houses.length > 2) {
              const a = houses[Math.floor(houses.length / 2) - 1], b = houses[Math.floor(houses.length / 2)];
              const p = spring(lt, tAt + 0.6, 0.6), y = (a.y3 + b.y3) / 2 + 40 * K, xa = a.R3 + 2, xb = b.L3 - 2;
              if (p > 0.02) {
                const d = 22 * K * p;
                arrow.setAttribute('d', inkPath([[xa - 70 * K, y], [xa - 6, y]], O(900, { w: 6 * K })) + inkPath([[xa - 6 - d, y - d], [xa - 6, y], [xa - 6 - d, y + d]], O(901, { w: 6 * K, smooth: false })) +
                  inkPath([[xb + 70 * K, y], [xb + 6, y]], O(902, { w: 6 * K })) + inkPath([[xb + 6 + d, y - d], [xb + 6, y], [xb + 6 + d, y + d]], O(903, { w: 6 * K, smooth: false })));
              } else arrow.setAttribute('d', '');
            }
            // oven sparks
            if (P.spark != null) {
              const sa = atOr(cues, P.spark, 0.5), sp = clamp01((lt - sa) / 1.4);
              const hs = houses.find(h => h.oven);
              if (hs && lt >= sa && sp < 1) {
                let d = '', dO = '';
                const ox = hs.cx - hs.w0 * 0.08, oy = G - hs.h1 * 0.3;
                for (let j = 0; j < 14; j++) {
                  const rr = rng(sd + 7000 + j), ang = -Math.PI / 2 + (rr() - 0.5) * 2.4, v = (240 + rr() * 300) * K;
                  const x = ox + Math.cos(ang) * v * sp, y = oy + Math.sin(ang) * v * sp + 260 * K * sp * sp;
                  const s = (10 - 6 * sp) * K;
                  d += inkDot(x, y, s, s, sd + 7100 + j, t) + ' ';
                  if (j % 3 === 0) dO += inkDot(x, y, s * 0.6, s * 0.6, sd + 7200 + j, t) + ' ';
                }
                sparks.setAttribute('d', d); sparksO.setAttribute('d', dO);
              } else { sparks.setAttribute('d', ''); sparksO.setAttribute('d', ''); }
            }
          }

          // ---------------------------------------------------------- skyline
          if (sky) {
            const { Y0, bl, S, cathX, churches } = sky;
            const F = Object.assign({ from: 1.05, to: 0.1, at: 0.2, dur: 2.6 }, S.front || {});
            const fAt = atOr(cues, F.at, 0.2), xf = lerp(F.from, F.to, progIO(lt, fAt, F.dur)) * W;
            const burn = x => clamp01((x - xf) / (140 * K));
            // river + south bank
            const wTop = Y0 + 4, wBot = G - 40 * K;
            const wq = [[-20, wTop], [W + 20, wTop], [W + 20, wBot], [-20, wBot]];
            sky.water.setAttribute('d', inkLoop(wq, O(300, { smooth: false, amp: 1 })));
            sky.waterO.setAttribute('d', inkPath([[-20, wTop], [W + 20, wTop]], O(301, { w: 3 })) + inkPath([[-20, wBot], [W + 20, wBot]], O(302, { w: 3 })));
            let rd = '', gw = '', gr = '';
            for (let k = 0; k < 12; k++) {
              const u = ((k * 0.37 + t * 0.05) % 1), x = u * W, y = lerp(wTop + 20, wBot - 14, (k % 4) / 3);
              const pts = []; for (let j = 0; j <= 5; j++) pts.push([x - 40 + j * 16, y + Math.sin(j * 1.7 + t * 2.4 + k) * 4]);
              rd += inkPath(pts, O(310 + k, { w: 2.5, amp: 0.7 })) + ' ';
            }
            for (let k = 0; k < 18; k++) {
              const x = (k + 0.5) / 18 * W, b = Math.max(burn(x), 0);
              if (b < 0.05) continue;
              const y = lerp(wTop + 16, wBot - 10, ((k * 7) % 5) / 4), len = (30 + (k % 3) * 18) * K * b * (0.8 + 0.2 * Math.sin(t * 5 + k));
              gw += inkLoop([[x - len, y - 4], [x + len, y - 3], [x + len * 0.9, y + 4], [x - len * 0.9, y + 5]], O(330 + k, { amp: 1 })) + ' ';
              if (k % 2) gr += inkLoop([[x - len * 0.5, y + 10], [x + len * 0.5, y + 10], [x + len * 0.4, y + 16], [x - len * 0.4, y + 16]], O(360 + k, { amp: 1 })) + ' ';
            }
            sky.rip.setAttribute('d', rd); sky.glowW.setAttribute('d', gw); sky.glowR.setAttribute('d', gr);
            const bq = [[-20, wBot], [W + 20, wBot - 4], [W + 20, G + 50 * K], [-20, G + 54 * K]];
            sky.bank.setAttribute('d', inkLoop(bq, O(380, { smooth: false, amp: 1 })));
            sky.bankO.setAttribute('d', inkPath([[-20, wBot], [W * 0.5, wBot - 3], [W + 20, wBot - 4]], O(381, { w: 5 })));
            // roofline
            let bf = '', bo = '';
            bl.forEach((b, k) => {
              const L = b.x - b.w / 2, R = b.x + b.w / 2, top = Y0 - b.h;
              const q = b.roof ? [[L, Y0], [L, top], [b.x, top - b.w * 0.45], [R, top], [R, Y0]] : [[L, Y0], [L, top], [R, top], [R, Y0]];
              bf += inkLoop(q, O(400 + k, { smooth: false, amp: 0.9 })) + ' ';
              bo += inkPath(q, O(400 + k, { w: 3, smooth: false, amp: 0.9 })) + ' ';
              if (b.s > 0.4) bo += inkPath([[b.x - b.w * 0.15, top + b.h * 0.35], [b.x + b.w * 0.15, top + b.h * 0.35]], O(500 + k, { w: 3, amp: 0.6 })) + ' ';
            });
            sky.back.setAttribute('d', bf); sky.backO.setAttribute('d', bo);
            // church towers
            let cf = '', co = '';
            churches.forEach((c, k) => {
              const L = c.x - c.w / 2, R = c.x + c.w / 2, top = Y0 - c.h;
              const q = [[L, Y0], [L, top], [c.x, top - 80 * K], [R, top], [R, Y0]];
              cf += inkLoop(q, O(600 + k, { smooth: false, amp: 0.9 })) + ' ';
              co += inkPath(q, O(600 + k, { w: 4, smooth: false, amp: 0.9 })) + ' ' + inkPath([[c.x, top - 80 * K], [c.x, top - 108 * K]], O(610 + k, { w: 3 })) + ' ';
            });
            sky.ch.setAttribute('d', cf); sky.chO.setAttribute('d', co);
            // Old St Paul's: long nave with buttresses and pointed windows + a square tower (no spire in 1666)
            const cx = cathX, nW = 430 * K, nH = 150 * K, tW = 116 * K, tH = 390 * K;
            const nave = [[cx - nW / 2, Y0], [cx - nW / 2, Y0 - nH], [cx - nW / 2 + 20 * K, Y0 - nH - 40 * K], [cx + nW / 2 - 20 * K, Y0 - nH - 40 * K], [cx + nW / 2, Y0 - nH], [cx + nW / 2, Y0]];
            const tower = [[cx - tW / 2, Y0 - nH], [cx - tW / 2, Y0 - tH], [cx + tW / 2, Y0 - tH], [cx + tW / 2, Y0 - nH]];
            sky.cath.setAttribute('d', inkLoop(nave, O(700, { smooth: false, amp: 1 })) + ' ' + inkLoop(tower, O(701, { smooth: false, amp: 1 })));
            let cw = '';
            for (let j = 0; j < 7; j++) {
              const x = cx - nW / 2 + (j + 0.5) / 7 * nW;
              if (Math.abs(x - cx) < tW * 0.6) continue;
              cw += inkLoop([[x - 9 * K, Y0 - 24 * K], [x - 9 * K, Y0 - 70 * K], [x, Y0 - 86 * K], [x + 9 * K, Y0 - 70 * K], [x + 9 * K, Y0 - 24 * K]], O(720 + j, { smooth: false, amp: 0.8 })) + ' ';
            }
            for (let j = 0; j < 2; j++) { const x = cx + (j - 0.5) * tW * 0.45; cw += inkLoop([[x - 10 * K, Y0 - nH - 30 * K], [x - 10 * K, Y0 - tH + 70 * K], [x, Y0 - tH + 50 * K], [x + 10 * K, Y0 - tH + 70 * K], [x + 10 * K, Y0 - nH - 30 * K]], O(740 + j, { smooth: false, amp: 0.8 })) + ' '; }
            sky.cathW.setAttribute('d', cw);
            sky.cathO.setAttribute('d', inkPath(nave, O(700, { w: 5, smooth: false, amp: 1 })) + ' ' + inkPath(tower, O(701, { w: 5, closed: true, smooth: false, amp: 1 })) + ' ' +
              [[-tW / 2, -tH], [tW / 2, -tH]].map(([dx], j) => inkPath([[cx + dx, Y0 - tH], [cx + dx, Y0 - tH - 26 * K]], O(750 + j, { w: 5 }))).join(' ') + ' ' +
              [0.2, 0.4, 0.6, 0.8].map((u, j) => inkPath([[cx - nW / 2 + u * nW, Y0], [cx - nW / 2 + u * nW, Y0 - nH - 10 * K]], O(760 + j, { w: 3 }))).join(' '));
            // flames + smoke over burning roofs (sampled every ~60 px)
            const step = 62 * K;
            for (let x = step / 2, k = 0; x < W + step; x += step, k++) {
              const b = burn(x);
              if (b < 0.03) continue;
              const near = bl.reduce((m, q) => Math.abs(q.x - x) < Math.abs(m.x - x) ? q : m, bl[0]);
              const by = Y0 - near.h + 6;
              flame(x, by + 10 * K, step * 1.5, (120 + (k % 3) * 50) * K * b, k * 1.3, 800 + k * 3);
              if (k % 2 === 0) puff(x, by - 40 * K, 0.85 * b, k, windDir);
              if (k % 3 === 0) emberAt(x, by - 60 * K, k, 0.8);
            }
            // the cathedral catches
            const C = S.cathedral || {}, cAt = atOr(cues, C.at, null);
            if (cAt != null && lt >= cAt) {
              const p = spring(lt, cAt, 1.1), pk = punch(lt, cAt, 0.7);
              flame(cx, Y0 - tH + 8, tW * 1.6, 250 * K * p * (1 + 0.15 * pk), 0.4, 880);
              flame(cx - nW * 0.3, Y0 - nH - 30 * K, nW * 0.32, 200 * K * p, 1.9, 884);
              flame(cx + nW * 0.3, Y0 - nH - 30 * K, nW * 0.32, 220 * K * p, 3.1, 888);
              puff(cx, Y0 - tH - 60 * K, 1.1 * p, 40, windDir);
              puff(cx - 120 * K, Y0 - tH, 0.9 * p, 41, windDir);
            }
            // counter
            if (counter) {
              const Cc = counter.C, at = atOr(cues, Cc.at, 0.5), p = progIO(lt, at, Cc.dur ?? 1.6), sp = spring(lt, at, 0.6);
              const v = Math.round((Cc.to ?? 13200) * p / (Cc.round || 100)) * (Cc.round || 100);
              counter.t.textContent = fmtNum(v) + (Cc.suffix ?? ' ev');
              const x = (Cc.x ?? 0.5) * W, y = (Cc.y ?? 0.2) * H, b = boil(sd + 8200, t, 1.2), pk = punch(lt, at + (Cc.dur ?? 1.6), 0.6);
              counter.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-3) scale(${(lerp(0.5, 1, sp) * (1 + 0.1 * pk)).toFixed(3)})`);
              counter.t.setAttribute('fill-opacity', clamp01(sp * 2)); counter.t.setAttribute('stroke-opacity', clamp01(sp * 2));
            }
          }

          for (let i = smokeI; i < smoke.length; i++) smoke[i].setAttribute('d', '');
          flR.setAttribute('d', fR); flG.setAttribute('d', fG); flO.setAttribute('d', fO);
          embers.setAttribute('d', emb);

          // wind lines
          if (P.wind) {
            const wa = atOr(cues, P.wind.at, 0.4);
            let wd = '';
            if (lt >= wa) {
              for (let k = 0; k < 4; k++) {
                const ph = ((lt - wa) * 0.55 + k * 0.27) % 1.2, y = ((P.wind.y ?? 0.2) + k * 0.045) * H;
                const head = W * (windDir < 0 ? 1.1 - ph * 1.1 : -0.1 + ph * 1.1), len = 260 * K;
                const pts = [];
                for (let j = 0; j <= 8; j++) { const u = j / 8; pts.push([head - windDir * len * u, y + Math.sin(u * 6 + t * 3 + k) * 12 * K]); }
                const curl = [[head, y], [head + windDir * 30 * K, y - 22 * K], [head + windDir * 8 * K, y - 44 * K], [head - windDir * 18 * K, y - 26 * K]];
                wd += inkPath(pts, O(950 + k, { w: 5 * K, taper: 0.8 })) + ' ' + inkPath(curl, O(960 + k, { w: 4 * K })) + ' ';
              }
            }
            windP.setAttribute('d', wd);
          }

          // cast
          castUpdate(cast, lt, t, cues, W, H, G, dur);
          wordsUpdate(words, lt, t, cues, W, H, sd);

          // label
          if (label) {
            const Lb = label.L, at = atOr(cues, Lb.at, 0.2), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? (portrait ? 0.2 : 0.16)) * H, b = boil(sd + 8000, t, 1);
            label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
            label.t.setAttribute('fill-opacity', clamp01(sp * 2)); label.t.setAttribute('stroke-opacity', clamp01(sp * 2));
            const tw = Math.min(W * 0.85, label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300), pu = prog(lt, at + 0.25, 0.5);
            label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 16]], O(8001, { w: 6 })) : '');
            if (Lb.arrow) {
              const pa = prog(lt, at + 0.4, 0.5), tx = Lb.arrow[0] * W, ty = Lb.arrow[1] * H, sx = x + (tx > x ? tw * 0.3 : -tw * 0.3), sy = y + 40;
              const ex = lerp(sx, tx, pa), ey = lerp(sy, ty, pa), ang = Math.atan2(ty - sy, tx - sx), hd = 26;
              label.a.setAttribute('d', pa > 0.02 ? inkPath([[sx, sy], [lerp(sx, ex, 0.5) + 20, lerp(sy, ey, 0.5)], [ex, ey]], O(8002, { w: 5 })) +
                (pa > 0.9 ? inkPath([[ex - hd * Math.cos(ang - 0.5), ey - hd * Math.sin(ang - 0.5)], [ex, ey], [ex - hd * Math.cos(ang + 0.5), ey - hd * Math.sin(ang + 0.5)]], O(8003, { w: 5, smooth: false })) : '') : '');
            }
          }
        },
      };
    },
  };
  // londonsky: the skyline mode of londonfire as its own shot type (the City burning across the Thames).
  SH.londonsky = {
    kind: '2d',
    build(ctx) { return SH.londonfire.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: 'skyline' }) })); },
  };

  // londonmap: hand-drawn plan of London in 1666 filling the frame: the Thames, the old City wall, London Bridge,
  // dense house blocks, Old St Paul's, a pulsing red Pudding Lane marker, a note card, and Kaşif in front pointing.
  // P: {marker: {at}, note: {text, at}, labels: true, kasif-free cast: [...], cam: {zoom: 1.2, focus: [0.68, 0.55]}}
  // cues: marker.at, note.at, cast "at"
  SH.londonmap = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.72;
      const S = portrait ? { x: 30, y: 380, w: 1020, h: 770 } : { x: (W - 1300) / 2, y: 140, w: 1300, h: 760 };
      const X = (u, v) => [S.x + u * S.w, S.y + v * S.h];
      const G = S.y + S.h + 14;
      const root = el(svg, 'g'), cam = el(root, 'g'), mg = el(cam, 'g'), actorG = el(root, 'g'), uiG = el(root, 'g');
      const sheetF = mk(mg, INK.paperDark), sheetO = mk(mg), frame = mk(mg, INK.inkSoft);
      const blocks = mk(mg, INK.inkSoft, { 'fill-opacity': 0.45 }), streets = mk(mg, INK.inkSoft, { 'fill-opacity': 0.7 });
      const riverF = mk(mg, INK.paperLight), riverO = mk(mg, INK.inkSoft), waves = mk(mg, INK.inkSoft, { 'fill-opacity': 0.7 });
      const wall = mk(mg), bridge = mk(mg), bridgeF = mk(mg, INK.paperLight);
      const paulF = mk(mg, INK.paperLight), paulO = mk(mg);
      const ring = mk(mg, INK.red), dot = mk(mg, INK.red), compF = mk(mg, INK.paperLight), compO = mk(mg, INK.inkSoft), compN = mk(mg, INK.ink);
      const lab = (txt, size, color) => {
        const t = el(mg, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: color,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = txt; return t;
      };
      const L = P.labels || {};
      const labs = [
        { t: lab(L.pudding || 'Pudding Lane', 66, INK.red), u: 0.69, v: 0.43, at: 'marker' },
        { t: lab(L.paul || 'Aziz Paul', 58, INK.ink), u: 0.34, v: 0.53, at: 0.4 },
        { t: lab(L.river || 'Thames', 60, INK.inkSoft), u: 0.42, v: 0.79, at: 0.6 },
      ];
      let note = null;
      if (P.note) {
        const N = typeof P.note === 'string' ? { text: P.note } : P.note;
        const g = el(uiG, 'g'), box = mk(g, INK.paperLight), boxO = mk(g);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': N.size || 72, 'text-anchor': 'middle', fill: INK.red });
        t.textContent = N.text;
        note = { N, g, box, boxO, t };
      }
      const cast = castMake(actorG, P.cast, seed, portrait);
      const r = rng(seed * 5 + 1), B = [];
      for (let i = 0; i < 70; i++) {   // house blocks inside the wall (north bank) + a few on the south bank
        const south = i > 60, u = south ? 0.15 + r() * 0.75 : 0.14 + r() * 0.72, v = south ? 0.88 + r() * 0.08 : 0.16 + r() * 0.44;
        B.push([u, v, 0.012 + r() * 0.02, 0.01 + r() * 0.016]);
      }
      const RT = [[-0.05, 0.66], [0.2, 0.7], [0.45, 0.66], [0.7, 0.63], [0.9, 0.65], [1.05, 0.62]];
      const RB = [[1.05, 0.78], [0.9, 0.8], [0.7, 0.77], [0.45, 0.8], [0.2, 0.84], [-0.05, 0.81]];
      const WALL = [[0.12, 0.665], [0.1, 0.45], [0.16, 0.27], [0.3, 0.15], [0.48, 0.12], [0.64, 0.16], [0.78, 0.3], [0.84, 0.48], [0.86, 0.635]];
      const MK = [0.69, 0.55], PAUL = [0.34, 0.4];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = seed * 1000, O = (k, o) => Object.assign({ seed: sd + k, t, amp: 1.2 }, o || {});
          const pin = spring(lt, 0, 0.7);
          camSet(cam, Object.assign({ zoom: 1.18, focus: [0.68, 0.5] }, P.cam || {}), lt, t, dur, cues, W, H, 0);
          root.setAttribute('transform', `translate(0 ${f1((1 - pin) * 60)})`);
          const sp = [[S.x, S.y], [S.x + S.w, S.y - 5], [S.x + S.w + 4, S.y + S.h], [S.x - 3, S.y + S.h + 4]];
          sheetF.setAttribute('d', inkLoop(sp, O(1, { smooth: false })));
          sheetO.setAttribute('d', inkPath(sp, O(1, { w: 5, closed: true, smooth: false })));
          frame.setAttribute('d', inkPath(sp.map(q => [lerp(q[0], S.x + S.w / 2, 0.035), lerp(q[1], S.y + S.h / 2, 0.04)]), O(2, { w: 2.5, closed: true, smooth: false })));
          let bd = '';
          B.forEach(([u, v, bw, bh], i) => { const [x, y] = X(u, v); bd += inkLoop([[x, y], [x + bw * S.w, y], [x + bw * S.w, y + bh * S.h], [x, y + bh * S.h]], O(100 + i, { smooth: false, amp: 0.8 })) + ' '; });
          blocks.setAttribute('d', bd);
          let st = '';
          [[[0.14, 0.4], [0.84, 0.36]], [[0.2, 0.55], [0.82, 0.52]], [[0.5, 0.14], [0.52, 0.64]], [[0.3, 0.2], [0.26, 0.64]], [[0.69, 0.3], [0.69, 0.63]]].forEach((q, i) => {
            st += inkPath(q.map(p => X(...p)), O(200 + i, { w: 3 })) + ' ';
          });
          streets.setAttribute('d', st);
          const rp = RT.concat(RB).map(q => X(...q));
          riverF.setAttribute('d', inkLoop(rp, O(300)));
          riverO.setAttribute('d', inkPath(RT.map(q => X(...q)), O(301, { w: 4 })) + ' ' + inkPath(RB.map(q => X(...q)), O(302, { w: 4 })));
          let wv = '';
          for (let k = 0; k < 8; k++) { const [x0, y0] = X(0.05 + k * 0.12, 0.72 + (k % 2) * 0.04), pts = []; for (let j = 0; j <= 5; j++) pts.push([x0 + j * 12, y0 + Math.sin(j * 1.6 + t * 2.2 + k) * 4]); wv += inkPath(pts, O(310 + k, { w: 3, amp: 0.6 })) + ' '; }
          waves.setAttribute('d', wv);
          // the old City wall: dashed, drawn in at the start
          const wpts = inkSpline(WALL.map(q => X(...q)), false, 10), wn = Math.floor(wpts.length * prog(lt, 0.1, 1.2));
          let wd = '';
          for (let i = 0; i + 3 < wn; i += 6) wd += inkPath(wpts.slice(i, i + 4), O(400 + i, { w: 6, amp: 0.8 })) + ' ';
          wall.setAttribute('d', wd);
          // London Bridge with little houses
          const b0 = X(0.73, 0.62), b1 = X(0.75, 0.8);
          const bq = [[b0[0] - 14, b0[1]], [b0[0] + 14, b0[1]], [b1[0] + 14, b1[1]], [b1[0] - 14, b1[1]]];
          bridgeF.setAttribute('d', inkLoop(bq, O(450, { smooth: false })));
          let bdg = inkPath(bq, O(451, { w: 4, closed: true, smooth: false })) + ' ';
          for (let j = 1; j < 5; j++) { const y = lerp(b0[1], b1[1], j / 5), x = lerp(b0[0], b1[0], j / 5); bdg += inkPath([[x - 14, y], [x + 14, y]], O(452 + j, { w: 3 })) + ' '; }
          bridge.setAttribute('d', bdg);
          // Old St Paul's glyph
          const [px, py] = X(...PAUL), s1 = 1.2 * K;
          const nave = [[px - 60 * s1, py + 22 * s1], [px - 60 * s1, py - 8 * s1], [px + 60 * s1, py - 8 * s1], [px + 60 * s1, py + 22 * s1]];
          const tower = [[px - 14 * s1, py - 8 * s1], [px - 14 * s1, py - 56 * s1], [px + 14 * s1, py - 56 * s1], [px + 14 * s1, py - 8 * s1]];
          paulF.setAttribute('d', inkLoop(nave, O(500, { smooth: false })) + ' ' + inkLoop(tower, O(501, { smooth: false })));
          paulO.setAttribute('d', inkPath(nave, O(500, { w: 4, closed: true, smooth: false })) + ' ' + inkPath(tower, O(501, { w: 4, closed: true, smooth: false })));
          // Pudding Lane marker
          const ma = atOr(cues, P.marker && P.marker.at || 'marker', 0.8), mp = spring(lt, ma, 0.6), [mx, my] = X(...MK);
          dot.setAttribute('d', mp > 0.01 ? inkDot(mx, my, 16 * mp, 16 * mp, sd + 600, t) : '');
          const ph = lt >= ma ? ((lt - ma) * 0.9) % 1 : 0;
          ring.setAttribute('d', lt >= ma ? inkCircle(mx, my, 22 + ph * 60, sd + 601, t, { w: 6 * (1 - ph) + 1 }) + ' ' + inkCircle(mx, my, 30, sd + 602, t, { w: 5 }) : '');
          labs.forEach((lb, k) => {
            const at = typeof lb.at === 'number' ? lb.at : atOr(cues, lb.at, ma), p = spring(lt, at, 0.6), [x, y] = X(lb.u, lb.v), b = boil(sd + 700 + k, t, 0.9);
            lb.t.style.display = lt >= at ? '' : 'none';
            lb.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) scale(${lerp(0.6, 1, p).toFixed(3)})`);
          });
          // compass
          const [cx, cy] = X(0.9, 0.12), R = 48, ca = Math.sin(t * 0.6) * 0.08;
          const rp2 = (x, y) => [cx + x * Math.cos(ca) - y * Math.sin(ca), cy + x * Math.sin(ca) + y * Math.cos(ca)];
          compF.setAttribute('d', inkCircle(cx, cy, R * 0.7, sd + 800, t, { fill: true }));
          compO.setAttribute('d', inkCircle(cx, cy, R * 0.7, sd + 800, t, { w: 3 }) + ' ' + inkLoop([rp2(0, -12), rp2(R * 0.8, 0), rp2(0, 12), rp2(-R * 0.8, 0)], O(801, { smooth: false })));
          compN.setAttribute('d', inkLoop([rp2(-11, 0), rp2(0, -R), rp2(11, 0)], O(802, { smooth: false })) + ' ' + inkLoop([rp2(-11, 0), rp2(0, R), rp2(11, 0)], O(803, { smooth: false })));
          if (note) {
            const N = note.N, at = atOr(cues, N.at || 'note', dur * 0.5), p = spring(lt, at, 0.6);
            const nx = (N.x ?? 0.62) * W, ny = (N.y ?? 0.2) * H, fs = N.size || 72;
            const tw = note.t.getComputedTextLength ? note.t.getComputedTextLength() || 400 : 400;
            const bp = [[nx - tw / 2 - 28, ny - fs * 0.85], [nx + tw / 2 + 28, ny - fs * 0.9], [nx + tw / 2 + 30, ny + fs * 0.4], [nx - tw / 2 - 26, ny + fs * 0.44]];
            note.box.setAttribute('d', inkLoop(bp, O(900, { smooth: false })));
            note.boxO.setAttribute('d', inkPath(bp, O(900, { w: 5, closed: true, smooth: false })));
            note.t.setAttribute('x', nx); note.t.setAttribute('y', ny);
            note.g.style.display = lt >= at ? '' : 'none';
            note.g.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) rotate(${f1(-3 + (1 - p) * -8)}) scale(${lerp(0.6, 1, p).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
          }
          castUpdate(cast, lt, t, cues, W, H, G, dur);
        },
      };
    },
  };

  // firecauses: "why did it spread?" — big hand-drawn rows (red flame badge + ink icon + Patrick Hand label) appearing on
  // cues, optional giant Fraunces header words, faint timber houses along the ground, Kaşif counting the rows.
  // P: {words: {lines, highlight, y, size}, rows: [{icon: "house"|"sun"|"wind", text, at}], y0: 0.3, gap: 0.115,
  //     houses: true, cast: [...], cam: {zoom}}   cues: row "at" names, w0.. (words), cast "at"/seq
  SH.firecauses = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.72;
      const G = (P.ground ?? (portrait ? 0.585 : 0.8)) * H;
      const cam = el(svg, 'g'), backG = el(cam, 'g'), rowG = el(cam, 'g'), actorG = el(cam, 'g'), uiG = el(svg, 'g');
      const hsF = mk(backG, INK.paperLight, { 'fill-opacity': 0.6 }), hsO = mk(backG, INK.inkSoft, { 'fill-opacity': 0.55 }), gl = mk(backG, INK.inkSoft);
      const rows = (P.rows || []).map((R, k) => {
        const g = el(rowG, 'g');
        const card = mk(g, INK.paperLight), cardO = mk(g), badge = mk(g, INK.paperLight), badgeO = mk(g), fl = mk(g, INK.red), flG = mk(g, INK.gold), ic = mk(g), icF = mk(g, INK.paperDark), icG = mk(g, INK.gold);
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': R.size || 92, fill: INK.ink, 'text-anchor': 'start' });
        tx.textContent = R.text;
        return { R, k, g, card, cardO, badge, badgeO, fl, flG, ic, icF, icG, tx };
      });
      const words = wordsMake(uiG, P.words);
      const cast = castMake(actorG, P.cast, seed, portrait);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = seed * 1000, O = (k, o) => Object.assign({ seed: sd + k, t, amp: 1.2 }, o || {});
          camSet(cam, Object.assign({ zoom: 1.05, focus: [0.5, 0.5] }, P.cam || {}), lt, t, dur, cues, W, H, 0);
          // faint timber houses along the ground
          if (P.houses !== false) {
            let f = '', o = '';
            for (let i = 0; i < 6; i++) {
              const cx = (i + 0.5) / 6 * W, w = W / 6 * 0.78, y1 = G - 150 * K, y2 = y1 - 130 * K, top = y2 - 120 * K, ov = 12 * K;
              const b1 = [[cx - w / 2, G], [cx - w / 2, y1], [cx + w / 2, y1], [cx + w / 2, G]], b2 = [[cx - w / 2 - ov, y1], [cx - w / 2 - ov, y2], [cx + w / 2 + ov, y2], [cx + w / 2 + ov, y1]];
              const rf = [[cx - w / 2 - ov - 8, y2], [cx, top], [cx + w / 2 + ov + 8, y2]];
              f += [b1, b2, rf].map((q, j) => inkLoop(q, O(10 + i * 5 + j, { smooth: false }))).join(' ') + ' ';
              o += [b1, b2, rf].map((q, j) => inkPath(q, O(10 + i * 5 + j, { w: 4, closed: true, smooth: false }))).join(' ') + ' ' +
                inkPath([[cx - w / 2 - ov, y2], [cx, y1]], O(50 + i, { w: 3 })) + inkPath([[cx + w / 2 + ov, y2], [cx, y1]], O(56 + i, { w: 3 })) + ' ';
            }
            hsF.setAttribute('d', f); hsO.setAttribute('d', o);
            gl.setAttribute('d', inkPath([[-20, G + 4], [W + 20, G + 2]], O(5, { w: 5 })));
          }
          // rows
          const y0 = (P.y0 ?? 0.3) * H, gap = (P.gap ?? 0.115) * H, x0 = (P.x0 ?? 0.05) * W, rw = (P.width ?? 0.62) * W, rh = 150 * K;
          rows.forEach(rw2 => {
            const { R, k } = rw2, at = atOr(cues, R.at, R.at == null ? 0.1 + k * 0.05 : dur * 0.4), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.6);
            const cy = y0 + k * gap, b = boil(sd + 100 + k, t, 1);
            rw2.g.style.display = lt >= at ? '' : 'none';
            rw2.g.setAttribute('transform', `translate(${f1((1 - p) * -140 + b[0])} ${f1(b[1])}) translate(${f1(x0 + rw / 2)} ${f1(cy)}) scale(${(lerp(0.85, 1, p) * (1 + 0.06 * pk)).toFixed(3)}) translate(${f1(-(x0 + rw / 2))} ${f1(-cy)})`);
            const cq = [[x0, cy - rh / 2], [x0 + rw, cy - rh / 2 - 4], [x0 + rw + 3, cy + rh / 2], [x0 - 2, cy + rh / 2 + 3]];
            rw2.card.setAttribute('d', inkLoop(cq, O(200 + k, { smooth: false })));
            rw2.cardO.setAttribute('d', inkPath(cq, O(200 + k, { w: 4, closed: true, smooth: false })));
            // red flame badge
            const bx = x0 + 74 * K, by = cy;
            rw2.badge.setAttribute('d', inkCircle(bx, by, 52 * K, sd + 300 + k, t, { fill: true }));
            rw2.badgeO.setAttribute('d', inkCircle(bx, by, 52 * K, sd + 300 + k, t, { w: 5 }));
            const fh = 70 * K * (0.9 + 0.1 * Math.sin(t * 9 + k)), sw = Math.sin(t * 6 + k) * 6;
            const fp = [[bx - 24 * K, by + 28 * K], [bx - 26 * K, by], [bx - 8 * K + sw * 0.5, by - fh * 0.45], [bx + sw, by - fh * 0.62], [bx + 14 * K + sw * 0.4, by - fh * 0.2], [bx + 24 * K, by + 28 * K]];
            rw2.fl.setAttribute('d', inkLoop(fp, O(320 + k)) + ' ');
            rw2.flG.setAttribute('d', inkLoop(fp.map(q => [bx + (q[0] - bx) * 0.5, by + 28 * K + (q[1] - by - 28 * K) * 0.55]), O(330 + k)));
            // icon
            const ix = x0 + 196 * K, iy = cy;
            let d = '', df = '', dg = '';
            if (R.icon === 'house') {
              const q = [[ix - 46, iy + 50], [ix - 46, iy - 6], [ix + 46, iy - 6], [ix + 46, iy + 50]], rf = [[ix - 58, iy - 6], [ix, iy - 54], [ix + 58, iy - 6]];
              df = inkLoop(q, O(400 + k, { smooth: false })) + ' ' + inkLoop(rf, O(401 + k, { smooth: false }));
              d = inkPath(q, O(400 + k, { w: 5, closed: true, smooth: false })) + inkPath(rf, O(401 + k, { w: 5, closed: true, smooth: false })) +
                inkPath([[ix - 46, iy + 50], [ix + 46, iy - 6]], O(402 + k, { w: 4 })) + inkPath([[ix - 46, iy - 6], [ix + 46, iy + 50]], O(403 + k, { w: 4 })) + inkPath([[ix, iy - 6], [ix, iy + 50]], O(404 + k, { w: 4 }));
            } else if (R.icon === 'sun') {
              dg = inkCircle(ix, iy, 30, sd + 410 + k, t, { fill: true });
              d = inkCircle(ix, iy, 30, sd + 410 + k, t, { w: 5 });
              for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2 + t * 0.8, r1 = 42, r2 = 58 + Math.sin(t * 6 + j) * 5; d += inkPath([[ix + Math.cos(a) * r1, iy + Math.sin(a) * r1], [ix + Math.cos(a) * r2, iy + Math.sin(a) * r2]], O(420 + j + k * 10, { w: 5 })); }
            } else {
              for (let j = 0; j < 3; j++) {
                const y = iy - 30 + j * 30, ph = (t * 1.6 + j * 0.3) % 1, pts = [];
                for (let q = 0; q <= 6; q++) pts.push([ix - 60 + q * 20, y + Math.sin(q * 1.1 + t * 5 + j) * 6]);
                d += inkPath(pts, O(440 + j + k * 10, { w: 5 })) + inkPath([[ix + 60, y], [ix + 74, y - 12], [ix + 64, y - 24]], O(450 + j + k * 10, { w: 4 }));
                void ph;
              }
            }
            rw2.ic.setAttribute('d', d); rw2.icF.setAttribute('d', df); rw2.icG.setAttribute('d', dg);
            rw2.tx.setAttribute('x', f1(x0 + 284 * K)); rw2.tx.setAttribute('y', f1(cy + 30 * K));
          });
          wordsUpdate(words, lt, t, cues, W, H, sd);
          castUpdate(cast, lt, t, cues, W, H, G, dur);
        },
      };
    },
  };
})();
