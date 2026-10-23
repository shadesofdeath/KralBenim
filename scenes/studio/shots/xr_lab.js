// xr_lab / xr_hand: Röntgen's X-ray discovery (Würzburg, 1895) in the parchment ink style (brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js). Two 2D shots, both with an optional cast (Kaşif + period figures).
//
// SHOTS.xr_lab — the laboratory bench: back wall with a shelf of bottles, a long bench with an induction coil whose
//   terminals spark, a pear-shaped cathode-ray tube on a stand, a small fluorescent screen on a stand.
//   P: {
//     mode: "wrap"|"glow"|"hand",
//       wrap — a black cardboard box drops over the glowing tube on cue "wrap"
//       glow — the tube is already wrapped; the room darkens (cue "dark", default 0) and on cue "glow" the little
//              screen lights up gold with pulsing halo rings and rays
//       hand — the tube hangs over a photographic plate on the bench; on cue "hand" a palm slides from the
//              "reach" cast member's hand onto the plate, then gold rays fall from the tube onto it (cue "rays")
//     bench: [x0, x1] (0..1 W, default [0.22, 0.8]), screen_x: 0.72, tube_x: 0.5, plate_x: 0.5,
//     dark: {at, k: 0.8} (any mode; glow mode defaults to {at: 0, k: 0.85}),
//     label: {text, x: 0.5, y: 0.2, at, size: 84, color: "ink"|"red"|"gold"},
//     cast: [{who: "kasif"|name, accessory, beard, hair: "bun" (woman: hair bun + skirt), x, y (ground 0..1 H),
//             scale, pose: "idle", at, then, face: "left"|"right", dir, emotion, reach: true (hand mode arm),
//             enter: cue|seconds (hidden before, then slides in from the nearer edge)}],
//     cam: {zoom: 1.07, focus: [0.5, 0.45]}
//   }   cues: wrap, dark, glow, hand, rays, hit (punch), label/cast "at" names
//
// SHOTS.xr_hand — a radiograph of a left hand with a ring (Anna Bertha Röntgen's, 22 Dec 1895): plate with frame,
//   soft flesh silhouette, bones (forearm, carpals, metacarpals, phalanges), a dark ring on the ring finger.
//   P: {
//     mode: "plate"|"reveal"|"print",
//       plate  — everything visible; slow push towards the ring, gold rim pulse
//       reveal — flesh first; on cue "bones" the bones appear wrist -> tips under a sweeping scan line; on cue
//                "ring" the ring punches in
//       print  — a smaller tilted photo print pinned on the page (paper margin, red tack)
//     plate: {cx: 0.46, cy: 0.37, w: 700, h: 840, rot: 0} (px), hand_scale: 1,
//     mark: {at: "ring", color: "red"} | false   (hand-drawn circle around the ring),
//     label: {text, x, y, at, size, color}, label2: {...},
//     cast: [...as above], cam: {zoom: 1.06, focus: [0.42, 0.42]}
//   }   cues: bones, ring, hit, mark/label/cast "at" names
// Everything is a pure function of (seed, lt): no Math.random.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = n => ({ red: INK.red, gold: INK.gold, blue: INK.blue, green: INK.green, soft: INK.inkSoft }[n] || INK.ink);
  const circ = (cx, cy, r, n = 24, ry) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * (ry ?? r)]);
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // ---------------------------------------------------------------- shared: cast, labels
  function makeCast(parent, P, seed, portrait) {
    return (P.cast || []).map((c, i) => {
      const isK = (c.who || 'kasif') === 'kasif';
      const g = el(parent, 'g');
      const sc = c.scale ?? (portrait ? 0.7 : 0.55);
      const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: seed + i * 7 + 3 });
      let hair = null;
      if (!isK && c.hair) {
        const hg = el(g, 'g');
        hair = { skirtF: inkEl(hg, INK.paperLight), skirtR: inkEl(hg), capF: inkEl(hg, INK.inkSoft), bunF: inkEl(hg, INK.inkSoft), bunR: inkEl(hg) };
      }
      return { c, rig, sc, hair, isK };
    });
  }
  function updateCast(cast, lt, t, cues, W, H, portrait, sd) {
    const outs = [];
    cast.forEach(({ c, rig, sc, hair }, ci) => {
      const at = atOr(cues, c.at, null), y = (c.y ?? (portrait ? 0.573 : 0.9)) * H;
      // optional entrance: hidden before c.enter (cue/seconds), then slides in from the nearer edge
      const en = c.enter != null ? atOr(cues, c.enter, 0) : null, ep = en == null ? 1 : spring(lt, en, 0.6);
      const x0 = (c.x ?? 0.8) * W, x = en == null ? x0 : lerp(x0 + (x0 > W / 2 ? 1 : -1) * W * 0.35, x0, ep);
      const after = at != null && lt >= at, pose = after ? (c.then || 'shock') : (c.pose || 'idle');
      const since = after ? lt - at : lt, dir = typeof c.dir === 'number' ? c.dir : DIRS[c.dir] ?? 20;
      const emo = after ? (c.emotion || (pose === 'shock' ? 'surprised' : null)) : (c.emotion0 || null);
      const face = c.face === 'left' ? -1 : 1;
      const o = { x, y, face, since, dir, emotion: emo, text: c.text, item: c.item, alpha: en != null && lt < en ? 0 : 1 };
      if (after && since < 0.32) { o.prev = { pose: c.pose || 'idle', since: at, dir: typeof c.dir0 === 'number' ? c.dir0 : dir }; o.mix = since / 0.32; }
      const out = rig.update(t, pose, o) || {};
      const W2 = q => [x + face * sc * q[0], y + sc * q[1]];
      if (hair && out.head) {
        const [hx, hy] = W2(out.head), R = 72 * sc, hp = out.hip ? W2(out.hip) : [x, y - 188 * sc];
        // skirt from the waist to just above the knees
        const top = hp[1] - 40 * sc, bot = hp[1] + 110 * sc;
        const sk = [[hp[0] - 34 * sc, top], [hp[0] + 34 * sc, top], [hp[0] + 92 * sc, bot], [hp[0] - 92 * sc, bot]];
        hair.skirtF.setAttribute('d', inkLoop(sk, { seed: sd + 700 + ci, t, smooth: false, amp: 1.2 }));
        hair.skirtR.setAttribute('d', inkPath(sk, { seed: sd + 700 + ci, t, closed: true, w: 6, smooth: false, amp: 1.2 }));
        // hair cap over the top of the head + a bun at the back
        const cap = [];
        for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.08 + k / 10 * 0.84); cap.push([hx + Math.cos(a) * R * 1.08, hy + Math.sin(a) * R * 1.08]); }
        for (let k = 10; k >= 0; k--) { const a = Math.PI * (1.08 + k / 10 * 0.84); cap.push([hx + Math.cos(a) * R * 0.82 - face * 4, hy + Math.sin(a) * R * 0.7 - 6 * sc]); }
        hair.capF.setAttribute('d', inkLoop(cap, { seed: sd + 720 + ci, t, amp: 1 }));
        const bx = hx - face * R * 0.82, by = hy - R * 0.78, br = R * 0.42;
        hair.bunF.setAttribute('d', inkLoop(circ(bx, by, br, 12), { seed: sd + 740 + ci, t, amp: 1 }));
        hair.bunR.setAttribute('d', inkPath(circ(bx, by, br, 12), { seed: sd + 740 + ci, t, closed: true, w: 5, amp: 1 }));
      }
      outs.push({ c, out, W2 });
    });
    return outs;
  }
  function makeLabel(parent, L, portrait) {
    if (!L || !L.text) return null;
    const size = L.size || (portrait ? 84 : 66), g = el(parent, 'g'), col = COL(L.color);
    const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: col,
      style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
    tx.textContent = L.text;
    return { L, g, tx, u: inkEl(g, col), size };
  }
  function updateLabel(label, lt, t, dur, cues, W, H, sd) {
    if (!label) return;
    const L = label.L, at = atOr(cues, L.at, dur * 0.5), p = spring(lt, at, 0.6);
    const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.2) * H;
    label.g.style.display = lt < at ? 'none' : '';
    label.tx.setAttribute('x', x); label.tx.setAttribute('y', y);
    const tw = label.tx.getComputedTextLength ? label.tx.getComputedTextLength() : 300;
    label.u.setAttribute('d', inkPath([[x - tw / 2, y + 18], [x + tw / 2, y + 12]], { seed: sd + 990, t, w: 6 }));
    label.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(L.rot ?? -3)}) scale(${lerp(0.6, 1, p).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
  }
  function camTf(lt, dur, t, W, H, cam, zoom0, focus0) {
    const C = cam || {}, z = lerp(1, C.zoom ?? zoom0, progIO(lt, 0, Math.max(1, dur)));
    const [fx, fy] = C.focus || focus0, pin = spring(lt, 0, 0.7);
    return `translate(${f1(Math.sin(t * 0.31) * 5)} ${f1(Math.cos(t * 0.23) * 4 + (1 - pin) * 36)}) translate(${f1(fx * W)} ${f1(fy * H)}) scale(${z.toFixed(4)}) translate(${f1(-fx * W)} ${f1(-fy * H)})`;
  }

  // ---------------------------------------------------------------- xr_lab
  SH.xr_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, mode = P.mode || 'wrap', sd0 = seed * 10 + 5;
      const gy = portrait ? 1100 : 860;
      const [b0, b1] = P.bench || (mode === 'hand' ? [0.3, 0.68] : [0.22, 0.8]);
      const BX0 = b0 * W, BX1 = b1 * W, BT = gy - (portrait ? 215 : 190);   // bench top
      const tubeX = (P.tube_x ?? (mode === 'hand' ? P.plate_x ?? 0.49 : 0.5)) * W;
      const tubeY = mode === 'hand' ? BT - 300 : BT - 150;
      const scrX = (P.screen_x ?? 0.72) * W, plX = (P.plate_x ?? 0.49) * W;
      const cam = el(svg, 'g');
      const mk = (fill = INK.ink, extra) => inkEl(cam, fill, extra);
      // back wall: shelf with bottles, wall line
      const wall = { line: mk(INK.inkSoft), shelf: mk(), bottF: mk(INK.paperLight), bottI: mk(), hatch: mk(INK.inkSoft, { 'fill-opacity': 0 }) };
      const shelfY = portrait ? 470 : 300;
      const br = rng(seed * 17 + 3), bottles = [];
      for (let x = (portrait ? 140 : 340); x < W - (portrait ? 160 : 360); x += 90 + br() * 40) {
        const h = 70 + br() * 60, w = 34 + br() * 24;
        bottles.push({ x, h, w, neck: br() > 0.4 });
      }
      // hatching for the dark room (wall + floor in front, never the caption band)
      const hatch = [], hr = rng(seed * 23 + 1);
      for (let y = (portrait ? 300 : 140); y < gy + (portrait ? 40 : 30); y += 30) for (let x = -20 + hr() * 40; x < W; x += 54 + hr() * 30) hatch.push([[x, y + 16], [x + 26, y - 10]]);
      // bench
      const bench = { topF: mk(INK.paperDark), topI: mk(), legs: mk() };
      // coil (left on the bench), wires, sparks
      const coil = { F: mk(INK.hat, { 'fill-opacity': 0.55 }), I: mk(), wind: mk(INK.inkSoft), wire: mk(), spark: mk(INK.gold), sparkI: mk() };
      const coilX = BX0 + 40, coilW = mode === 'hand' ? 110 : 150;
      // tube + glow + cardboard
      const tube = { glowF: mk(INK.gold, { 'fill-opacity': 0.0 }), F: mk(INK.paperLight), I: mk(), el: mk(), stand: mk(), rays: mk(INK.gold) };
      const box = { F: mk(INK.ink), I: mk(), hl: mk(INK.inkSoft) };
      // screen
      const scrNote = P.screen_note === false || mode === 'hand' ? null : el(cam, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 60 : 50, 'text-anchor': 'middle', fill: INK.ink,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
      if (scrNote) scrNote.textContent = P.screen_note || 'ekran';
      const scr = { halo: mk(INK.gold, { 'fill-opacity': 0 }), F: mk(INK.paperLight), I: mk(), stand: mk(), rays: mk(INK.gold) };
      // plate + palm (hand mode)
      const plate = { F: mk(INK.inkSoft, { 'fill-opacity': 0.85 }), I: mk(), palmF: mk(INK.paperLight), palmI: mk(), arm: mk() };
      const label = makeLabel(cam, P.label, portrait);
      const castG = el(cam, 'g');
      const cast = makeCast(castG, P, seed, portrait);
      // the hatch must sit over the wall but under bench & cast: move it right after the wall line
      cam.insertBefore(wall.hatch, wall.shelf);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          cam.setAttribute('transform', camTf(lt, dur, t, W, H, P.cam, 1.07, [0.5, 0.45]));
          const hit = punch(lt, atOr(cues, 'hit', null));
          // wall
          wall.line.setAttribute('d', inkPath([[-20, BT - 10], [W * 0.5, BT - 14], [W + 20, BT - 8]], { seed: sd + 1, t, w: 3, amp: 1 }));
          let sh = inkPath([[W * 0.08, shelfY], [W * 0.92, shelfY + 4]], { seed: sd + 2, t, w: 8 });
          sh += ' ' + inkPath([[W * 0.16, shelfY], [W * 0.18, shelfY + 40]], { seed: sd + 3, t, w: 6 }) + ' ' + inkPath([[W * 0.84, shelfY], [W * 0.82, shelfY + 40]], { seed: sd + 4, t, w: 6 });
          wall.shelf.setAttribute('d', sh);
          let bf = '', bi = '';
          bottles.forEach((b, i) => {
            const pts = b.neck ? [[b.x - b.w / 2, shelfY - 4], [b.x - b.w / 2, shelfY - b.h * 0.6], [b.x - 8, shelfY - b.h * 0.75], [b.x - 8, shelfY - b.h], [b.x + 8, shelfY - b.h], [b.x + 8, shelfY - b.h * 0.75], [b.x + b.w / 2, shelfY - b.h * 0.6], [b.x + b.w / 2, shelfY - 4]]
                               : rect(b.x - b.w / 2, shelfY - b.h * 0.7, b.w, b.h * 0.7 - 4);
            bf += inkLoop(pts, { seed: sd + 10 + i, t, smooth: false, amp: 1 }) + ' ';
            bi += inkPath(pts, { seed: sd + 10 + i, t, closed: true, w: 5, smooth: false, amp: 1 }) + ' ';
          });
          wall.bottF.setAttribute('d', bf); wall.bottI.setAttribute('d', bi);
          // darkness
          const D = P.dark || (mode === 'glow' ? { at: 0, k: 0.85 } : null);
          if (D) {
            const dk = (D.k ?? 0.8) * prog(lt, atOr(cues, D.at ?? 'dark', 0), 0.9);
            wall.hatch.setAttribute('fill-opacity', (0.5 * dk).toFixed(3));
            wall.hatch.setAttribute('d', dk > 0.01 ? hatch.map((h, i) => inkPath(h, { seed: sd + 2000 + i, t, w: 4, amp: 1 })).join(' ') : '');
          }
          // bench (top with a little depth + legs)
          const top = [[BX0 - 20, BT], [BX1 + 20, BT], [BX1 + 34, BT + 34], [BX0 - 34, BT + 34]];
          bench.topF.setAttribute('d', inkLoop(top, { seed: sd + 30, t, smooth: false }));
          let li = inkPath(top, { seed: sd + 30, t, closed: true, w: 6, smooth: false });
          for (const xx of [BX0, BX1]) li += ' ' + inkPath([[xx, BT + 34], [xx + (xx < W / 2 ? -10 : 10), gy]], { seed: sd + 31 + xx, t, w: 9 });
          li += ' ' + inkPath([[-20, gy + 4], [W * 0.5, gy], [W + 20, gy + 5]], { seed: sd + 35, t, w: 6 });
          bench.legs.setAttribute('d', li);
          // coil: wooden base + wound cylinder, two terminals with a spark gap
          const cy0 = BT - 70, cbx = coilX, cw = coilW;
          const base = rect(cbx - 10, BT - 22, cw + 20, 22), cyl = rect(cbx, cy0, cw, 48);
          coil.F.setAttribute('d', inkLoop(base, { seed: sd + 40, t, smooth: false }) + ' ' + inkLoop(cyl, { seed: sd + 41, t, smooth: false }));
          coil.I.setAttribute('d', inkPath(base, { seed: sd + 40, t, closed: true, w: 5, smooth: false }) + ' ' + inkPath(cyl, { seed: sd + 41, t, closed: true, w: 6, smooth: false })
            + ' ' + inkPath([[cbx + 18, cy0], [cbx + 18, cy0 - 50]], { seed: sd + 42, t, w: 6 }) + ' ' + inkPath([[cbx + cw - 18, cy0], [cbx + cw - 18, cy0 - 50]], { seed: sd + 43, t, w: 6 }));
          let wd = ''; for (let k = 1; k < 9; k++) { const xx = cbx + k * cw / 9; wd += inkPath([[xx, cy0 + 4], [xx + 6, cy0 + 44]], { seed: sd + 50 + k, t, w: 3, amp: 0.6 }) + ' '; }
          coil.wind.setAttribute('d', wd);
          // spark between the terminal tips: new zig-zag each boil frame
          const fr = inkFrame(t), sr = rng(inkHash(seed + 77, fr)), sx0 = cbx + 18, sx1 = cbx + cw - 18, syy = cy0 - 54;
          const on = mode !== 'hand' || lt > atOr(cues, 'rays', dur * 0.55) - 0.1;
          if (on && sr() > 0.15) {
            const zz = [[sx0, syy]]; for (let k = 1; k < 6; k++) zz.push([lerp(sx0, sx1, k / 6), syy + (sr() * 2 - 1) * 16]); zz.push([sx1, syy]);
            coil.sparkI.setAttribute('d', inkPath(zz, { seed: sd + 60 + fr, t, w: 5, smooth: false, amp: 0.5 }));
            coil.spark.setAttribute('d', inkPath(zz, { seed: sd + 61 + fr, t, w: 13, smooth: false, amp: 0.5 }));
          } else { coil.sparkI.setAttribute('d', ''); coil.spark.setAttribute('d', ''); }
          // wires from the coil terminals to the tube electrodes
          const tr = mode === 'hand' ? 62 : 70;
          const eA = [tubeX - tr * 1.45, tubeY], eB = [tubeX + tr * 0.2, tubeY - tr * 0.95];
          const sag = (p, q, d) => [p, [lerp(p[0], q[0], 0.5), Math.max(p[1], q[1]) + d], q];
          coil.wire.setAttribute('d', inkPath(sag([sx0, cy0 - 50], eA, 40), { seed: sd + 70, t, w: 4 }) + ' '
            + inkPath(sag([sx1, cy0 - 50], eB, mode === 'hand' ? 30 : 20), { seed: sd + 71, t, w: 4 }));
          // tube: pear-shaped glass bulb with a long neck to the left, cathode cap, anode pin on top
          const bulb = [];
          for (let k = 0; k < 18; k++) { const a = k / 18 * 6.2832; bulb.push([tubeX + Math.cos(a) * tr, tubeY + Math.sin(a) * tr * 0.92]); }
          const neckPts = [[tubeX - tr * 0.6, tubeY - tr * 0.55], [tubeX - tr * 1.4, tubeY - 16], [tubeX - tr * 1.4, tubeY + 16], [tubeX - tr * 0.6, tubeY + tr * 0.55]];
          const tubeShape = [[tubeX - tr * 1.42, tubeY - 18], [tubeX - tr * 0.7, tubeY - tr * 0.62], ...bulb.slice(13), ...bulb.slice(0, 6), [tubeX - tr * 0.7, tubeY + tr * 0.62], [tubeX - tr * 1.42, tubeY + 18]];
          const glowOn = mode === 'wrap' ? 1 - prog(lt, atOr(cues, 'wrap', dur * 0.5), 0.5) : mode === 'hand' ? prog(lt, atOr(cues, 'rays', dur * 0.55), 0.4) : 0;
          const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3);
          tube.glowF.setAttribute('fill-opacity', (0.42 * glowOn * flick).toFixed(3));
          tube.glowF.setAttribute('d', inkLoop(tubeShape, { seed: sd + 80, t, amp: 1.5 }));
          tube.F.setAttribute('fill-opacity', (glowOn > 0.05 ? 0.55 : 1).toFixed(2));
          tube.F.setAttribute('d', inkLoop(tubeShape, { seed: sd + 80, t, amp: 1.5 }));
          tube.I.setAttribute('d', inkPath(tubeShape, { seed: sd + 80, t, closed: true, w: 6, amp: 1.5 }) + ' '
            + inkPath([[tubeX + tr * 0.35, tubeY - tr * 0.5], [tubeX + tr * 0.6, tubeY - tr * 0.1]], { seed: sd + 81, t, w: 4, amp: 0.8 }));   // glint
          tube.el.setAttribute('d', inkLoop(rect(tubeX - tr * 1.62, tubeY - 14, 26, 28), { seed: sd + 82, t, smooth: false }) + ' '
            + inkPath([[tubeX + tr * 0.2, tubeY - tr * 0.9], [tubeX + tr * 0.2, tubeY - tr * 0.55]], { seed: sd + 83, t, w: 7 }) + ' '
            + inkPath([[tubeX - tr * 1.3, tubeY], [tubeX - tr * 0.9, tubeY]], { seed: sd + 84, t, w: 5 }));
          // stand: a rod down to the bench (hand mode: an arm from the right holding the tube high)
          if (mode === 'hand') {
            const sx = tubeX + tr * 2.1;
            tube.stand.setAttribute('d', inkPath([[sx, BT], [sx, tubeY - 20]], { seed: sd + 85, t, w: 9 }) + ' ' + inkPath([[sx, tubeY - 20], [tubeX + tr * 0.9, tubeY - 10]], { seed: sd + 86, t, w: 7 })
              + ' ' + inkPath([[sx - 40, BT], [sx + 40, BT]], { seed: sd + 87, t, w: 9 }));
          } else {         // retort stand: rod on the right, clamp arm onto the bulb's top
            const sx = tubeX + tr * 1.75, ay = tubeY - tr * 0.75;
            tube.stand.setAttribute('d', inkPath([[sx, BT], [sx, ay - 40]], { seed: sd + 85, t, w: 9 }) + ' ' + inkPath([[sx - 46, BT - 2], [sx + 46, BT - 2]], { seed: sd + 86, t, w: 10 })
              + ' ' + inkPath([[sx, ay], [tubeX + tr * 0.45, ay]], { seed: sd + 87, t, w: 7 }) + ' ' + inkPath(circ(tubeX + tr * 0.32, ay + 6, 16, 10), { seed: sd + 88, t, closed: true, w: 5, amp: 0.8 }));
          }
          // glow lines around a lit tube (wrap: before the cardboard, hand: rays down onto the plate)
          let ry = '';
          if (glowOn > 0.05 && mode === 'wrap') {
            for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + t * 0.4, r0 = tr * 1.15, r1 = tr * (1.45 + 0.12 * Math.sin(t * 6 + k)); ry += inkPath([[tubeX + Math.cos(a) * r0, tubeY + Math.sin(a) * r0], [tubeX + Math.cos(a) * r1, tubeY + Math.sin(a) * r1]], { seed: sd + 90 + k, t, w: 6, amp: 0.8 }) + ' '; }
          }
          if (mode === 'hand' && glowOn > 0.05) {
            const ra = atOr(cues, 'rays', dur * 0.55);
            for (let k = 0; k < 7; k++) {
              const xx = tubeX - 90 + k * 30, ph = ((lt - ra) * 1.6 + k * 0.17) % 1;
              const y0 = tubeY + tr * 0.9 + ph * (BT - tubeY - tr) * 0.8, y1 = y0 + 46;
              const xa = lerp(tubeX, xx, (y0 - tubeY) / (BT - tubeY)), xb = lerp(tubeX, xx, (y1 - tubeY) / (BT - tubeY));
              if (y1 < BT - 6) ry += inkPath([[xa, y0], [xb, y1]], { seed: sd + 100 + k, t, w: 6, amp: 0.6 }) + ' ';
            }
          }
          tube.rays.setAttribute('d', ry);
          // black cardboard sleeve over the tube: follows the tube's outline, crumpled, with fold lines
          if (mode !== 'hand') {
            const pw = mode === 'wrap' ? spring(lt, atOr(cues, 'wrap', dur * 0.5) - 0.35, 0.8) : 1;
            const oy = lerp(-520, 0, pw), ocx = tubeX - tr * 0.35;
            if (pw > 0.002 || mode === 'glow') {
              const cr = rng(seed * 61 + 7);
              const sl = tubeShape.map(([x, y]) => { const k = 1.2 + (cr() * 2 - 1) * 0.07; return [ocx + (x - ocx) * k, tubeY + (y - tubeY) * (k + 0.06) + oy]; });
              box.F.setAttribute('d', inkLoop(sl, { seed: sd + 110, t, amp: 1.5, smooth: false }));
              box.I.setAttribute('d', inkPath(sl, { seed: sd + 110, t, closed: true, w: 6, amp: 1.5, smooth: false }));
              let fo = '';
              for (let k = 0; k < 5; k++) { const x = tubeX - tr * 1.2 + k * tr * 0.55, y0 = tubeY - tr * 0.5 + oy + (k % 2) * 14; fo += inkPath([[x, y0], [x + 14, y0 + tr * 0.35], [x - 6, y0 + tr * 0.8]], { seed: sd + 111 + k, t, w: 4, amp: 0.8, smooth: false }) + ' '; }
              box.hl.setAttribute('d', fo);
            } else { box.F.setAttribute('d', ''); box.I.setAttribute('d', ''); box.hl.setAttribute('d', ''); }
          }
          // screen on a small stand (wrap & glow)
          if (mode !== 'hand') {
            const sw = 130, shh = 160, sxx = scrX - sw / 2, syy2 = BT - 4 - shh;
            const ga = mode === 'glow' ? atOr(cues, 'glow', dur * 0.5) : 1e9, gp = prog(lt, ga, 0.35), gh = punch(lt, ga, 0.9);
            const lean = 26, sp = [[sxx + lean, syy2], [sxx + sw + lean, syy2], [sxx + sw, syy2 + shh], [sxx, syy2 + shh]];
            const s1 = 1 + gh * 0.12, tfs = `translate(${f1(scrX)} ${f1(syy2 + shh / 2)}) scale(${s1.toFixed(3)}) translate(${f1(-scrX)} ${f1(-syy2 - shh / 2)})`;
            scr.F.setAttribute('transform', tfs); scr.I.setAttribute('transform', tfs);
            scr.F.setAttribute('fill', gp > 0.01 ? mix(INK.paperLight, INK.gold, gp * (0.85 + 0.15 * Math.sin(t * 9))) : INK.paperLight);
            scr.F.setAttribute('d', inkLoop(sp, { seed: sd + 120, t, smooth: false }));
            scr.I.setAttribute('d', inkPath(sp, { seed: sd + 120, t, closed: true, w: 6, smooth: false }) + ' ' + inkPath([[sxx + lean + 14, syy2 + 14], [sxx + sw + lean - 14, syy2 + 14], [sxx + sw - 12, syy2 + shh - 14], [sxx + 12, syy2 + shh - 14]], { seed: sd + 121, t, closed: true, w: 3, smooth: false }));
            scr.stand.setAttribute('d', inkPath([[sxx + sw + lean + 8, syy2 + 30], [sxx + sw + 40, BT - 2]], { seed: sd + 122, t, w: 6 }));   // a prop stick behind the leaning plate
            if (scrNote) { scrNote.setAttribute('x', f1(scrX + 10)); scrNote.setAttribute('y', f1(syy2 - 28)); }
            if (gp > 0.01) {
              const cx = scrX, cy = syy2 + shh / 2;
              let halo = '';
              for (let k = 0; k < 3; k++) { const ph = ((lt - ga) * 0.8 + k / 3) % 1, r = 110 + ph * 210; halo += inkPath(circ(cx, cy, r, 26, r * 1.05), { seed: sd + 130 + k, t, closed: true, w: 10 * (1 - ph) + 2, amp: 1.5 }) + ' '; }
              scr.halo.setAttribute('fill-opacity', (0.75 * gp).toFixed(3));
              scr.halo.setAttribute('d', halo);
              let rr = '';
              for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283 + 0.13, r0 = 115, r1 = 150 + 30 * gp + 14 * Math.sin(t * 8 + k * 1.7); rr += inkPath([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 1.1], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 1.1]], { seed: sd + 140 + k, t, w: 7, amp: 0.8 }) + ' '; }
              scr.rays.setAttribute('d', rr);
            } else { scr.halo.setAttribute('d', ''); scr.rays.setAttribute('d', ''); }
          }
          // plate + palm (hand mode)
          let palmAt = null;
          if (mode === 'hand') {
            const pw2 = 230, pd = 30, px0 = plX - pw2 / 2, py0 = BT + 4;
            const pq = [[px0 + 14, py0], [px0 + pw2 + 14, py0], [px0 + pw2 - 4, py0 + pd], [px0 - 4, py0 + pd]];
            plate.F.setAttribute('d', inkLoop(pq, { seed: sd + 150, t, smooth: false }));
            plate.I.setAttribute('d', inkPath(pq, { seed: sd + 150, t, closed: true, w: 5, smooth: false }));
            palmAt = [plX + 10, py0 + pd * 0.5];
          }
          // cast (after the bench so the figures stand in front of it)
          const outs = updateCast(cast, lt, t, cues, W, H, portrait, sd);
          if (mode === 'hand') {
            const ha = atOr(cues, 'hand', dur * 0.4), hp = progIO(lt, ha - 0.2, 0.7);
            const rm = outs.find(o => o.c.reach) || outs[0];
            if (rm && rm.out.hands && hp > 0.001) {
              const hw = rm.W2(rm.out.hands[1]);
              const pc = [lerp(hw[0] + 30, palmAt[0], hp), lerp(hw[1], palmAt[1] - 4, hp)];
              plate.arm.setAttribute('d', inkPath([hw, pc], { seed: sd + 160, t, w: 7 }));
              // flat palm seen from the front: an oval with four finger nubs towards the tube side
              const pal = [];
              for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283; pal.push([pc[0] + 20 + Math.cos(a) * 46, pc[1] + Math.sin(a) * 12]); }
              let fi = inkPath(pal, { seed: sd + 161, t, closed: true, w: 5, amp: 0.8 });
              for (let k = 0; k < 4; k++) fi += ' ' + inkPath([[pc[0] + 50 + k * 4, pc[1] - 6 + k * 4], [pc[0] + 92 + k * 2, pc[1] - 8 + k * 5]], { seed: sd + 162 + k, t, w: 6, amp: 0.6 });
              plate.palmF.setAttribute('d', inkLoop(pal, { seed: sd + 161, t, amp: 0.8 }));
              plate.palmI.setAttribute('d', fi);
            } else { plate.arm.setAttribute('d', ''); plate.palmF.setAttribute('d', ''); plate.palmI.setAttribute('d', ''); }
          }
          updateLabel(label, lt, t, dur, cues, W, H, sd);
          // punch on "hit": the whole bench bumps slightly
          const hs1 = 1 + hit * 0.05;
          if (hit > 0.001) cam.setAttribute('transform', cam.getAttribute('transform') + ` translate(${f1(W / 2)} ${f1(BT)}) scale(${hs1.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-BT)})`);
        },
      };
    },
  };

  // ---------------------------------------------------------------- xr_hand: the radiograph
  // left hand, palm down, seen from the tube: fingers up, thumb on the right. Units: wrist centre = (0, 0), up = -y.
  const CH = [   // finger chains: metacarpal base, knuckle, then phalanx joints/tip; widths per bone
    { pts: [[-70, -92], [-138, -250], [-172, -356], [-191, -426], [-202, -474]], w: [24, 23, 19, 15] },   // little
    { pts: [[-32, -102], [-64, -288], [-84, -418], [-96, -502], [-103, -560]], w: [26, 25, 21, 16] },     // ring
    { pts: [[6, -106], [14, -300], [21, -440], [26, -534], [29, -598]], w: [27, 26, 22, 17] },           // middle
    { pts: [[44, -100], [88, -284], [117, -408], [134, -488], [146, -543]], w: [26, 25, 20, 16] },        // index
    { pts: [[78, -62], [166, -172], [238, -250], [286, -302]], w: [27, 24, 19] },                        // thumb
  ];
  const RING = { finger: 1, u: 0.33 };   // ring on the ring finger's proximal phalanx (a third of the way up)
  const CARP = [[-62, -60, 22, 18], [-24, -66, 22, 18], [16, -68, 22, 19], [52, -62, 20, 18], [-52, -24, 24, 18], [-12, -28, 24, 19], [28, -28, 24, 19], [64, -26, 20, 17]];
  function capsule(a, b, w) {     // rounded bone with knobby ends
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const r = w / 2, k = r * 1.25, pts = [];
    // outline: base cap (-n -> -u -> +n), waist +n, tip cap (+n -> +u -> -n), waist -n
    const P = (c, ux2, nx2, kk) => [c[0] + ux * ux2 * kk + nx * nx2 * kk, c[1] + uy * ux2 * kk + ny * nx2 * kk];
    for (let i = 0; i <= 6; i++) { const an = i / 6 * Math.PI; pts.push(P(a, -Math.sin(an), -Math.cos(an), k)); }
    const m1 = [a[0] + dx * 0.5, a[1] + dy * 0.5];
    pts.push([m1[0] + nx * r * 0.78, m1[1] + ny * r * 0.78]);
    for (let i = 0; i <= 6; i++) { const an = i / 6 * Math.PI; pts.push(P(b, Math.sin(an), Math.cos(an), k * 0.95)); }
    pts.push([m1[0] - nx * r * 0.78, m1[1] - ny * r * 0.78]);
    return pts;
  }
  const ccw = pts => {             // same winding for every flesh loop (nonzero fill = union, no holes)
    let A = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; }
    return A < 0 ? pts.slice().reverse() : pts;
  };
  function band(a, b, w) {        // straight thick band a -> b (flesh around a finger)
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    const pts = [[a[0] + nx, a[1] + ny]];
    for (let i = 0; i <= 8; i++) { const an = i / 8 * Math.PI, c = Math.cos(an), s = Math.sin(an); pts.push([b[0] + nx * c + dx / L * w / 2 * s, b[1] + ny * c + dy / L * w / 2 * s]); }
    pts.push([a[0] - nx, a[1] - ny]);
    return pts;
  }

  SH.xr_hand = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, mode = P.mode || 'plate', sd0 = seed * 10 + 9;
      const PL = Object.assign({ cx: portrait ? 0.46 : 0.42, cy: portrait ? 0.37 : 0.46, w: portrait ? 700 : 560, h: portrait ? 840 : 680, rot: 0 },
        mode === 'print' ? { cx: 0.5, cy: 0.33, w: 520, h: 620, rot: -3 } : {}, P.plate || {});
      const pcx = PL.cx * W, pcy = PL.cy * H, pw = PL.w, ph = PL.h;
      const hs = (P.hand_scale ?? 1) * Math.min(pw / 640, ph / 800);
      const wristY = pcy + ph / 2 - 120 * hs, wristX = pcx - 10 * hs;
      const HX = q => [wristX + q[0] * hs, wristY + q[1] * hs];
      const cam = el(svg, 'g');
      const plateG = el(cam, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const isPrint = mode === 'print';
      const frame = { sh: mk(plateG, INK.ink, { 'fill-opacity': 0.12 }), mar: mk(plateG, INK.paperLight), F: mk(plateG, isPrint ? INK.paperDark : INK.paperLight), I: mk(plateG), tack: mk(plateG, INK.red), clips: mk(plateG, INK.inkSoft) };
      const cid = 'xrclip' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      const clipR = el(clip, 'rect', { x: pcx - pw / 2 + 10, y: pcy - ph / 2 + 10, width: pw - 20, height: ph - 20 });
      const inner = el(plateG, 'g', { 'clip-path': `url(#${cid})` });
      const flesh = { F: mk(inner, INK.inkSoft, { 'fill-opacity': 0.34 }), I: mk(inner, INK.inkSoft, { 'fill-opacity': 0.8 }) };
      // bones: one element per bone (each fades in on its own), wrist -> tips order
      const bones = [];
      bones.push({ a: [-58, 160], b: [-50, -4], w: 40, ord: 0 }, { a: [46, 160], b: [42, -2], w: 48, ord: 0 });
      CARP.forEach(([x, y, rx, ry], i) => bones.push({ blob: [x, y, rx, ry], ord: 0.12 + i * 0.01 }));
      CH.forEach((c, fi) => { for (let k = 0; k < c.pts.length - 1; k++) bones.push({ a: c.pts[k], b: c.pts[k + 1], w: c.w[k], ord: 0.25 + k * 0.22 + fi * 0.015, fi, k }); });
      bones.forEach(b => { b.F = mk(inner, INK.ink, { 'fill-opacity': 0 }); b.M = mk(inner, INK.paperDark, { 'fill-opacity': 0 }); });
      const ringE = { F: mk(inner, INK.ink, { 'fill-opacity': 0 }), G: mk(inner, INK.gold, { 'fill-opacity': 0 }) };
      const scan = { F: mk(inner, INK.gold, { 'fill-opacity': 0 }) };
      const rim = mk(plateG, INK.gold, { 'fill-opacity': 0 });
      const markE = mk(cam, COL((P.mark && P.mark.color) || 'red'));
      const label = makeLabel(cam, P.label, portrait), label2 = makeLabel(cam, P.label2, portrait);
      const castG = el(cam, 'g');
      const cast = makeCast(castG, P, seed, portrait);
      // ring geometry (world, before plate transform)
      const rc = CH[RING.finger], ra = rc.pts[1], rb = rc.pts[2];
      const ringC = [lerp(ra[0], rb[0], RING.u), lerp(ra[1], rb[1], RING.u)];
      const ringW = HX(ringC);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const foc = P.cam && P.cam.focus ? P.cam.focus : [ringW[0] / W, ringW[1] / H];
          cam.setAttribute('transform', camTf(lt, dur, t, W, H, Object.assign({ focus: foc }, P.cam || {}), mode === 'reveal' ? 1.05 : 1.08, foc));
          const hit = punch(lt, atOr(cues, 'hit', null));
          const ptf = `translate(${f1(pcx)} ${f1(pcy)}) rotate(${f1((PL.rot || 0) + Math.sin(t * 0.6) * 0.4)}) scale(${(1 + hit * 0.06).toFixed(4)}) translate(${f1(-pcx)} ${f1(-pcy)})`;
          plateG.setAttribute('transform', ptf);
          // plate / print frame
          const x0 = pcx - pw / 2, y0 = pcy - ph / 2;
          const fr = rect(x0, y0, pw, ph);
          frame.sh.setAttribute('d', inkLoop(rect(x0 + 14, y0 + 18, pw, ph), { seed: sd + 1, t, smooth: false }));
          if (isPrint) {
            const m = 30, mr = rect(x0 - m, y0 - m, pw + 2 * m, ph + 2 * m + 24);
            frame.mar.setAttribute('d', inkLoop(mr, { seed: sd + 2, t, smooth: false }));
            frame.tack.setAttribute('d', inkDot(pcx, y0 - m + 14, 16, 16, seed + 3, t));
            frame.I.setAttribute('d', inkPath(mr, { seed: sd + 2, t, closed: true, w: 4, smooth: false }) + ' ' + inkPath(fr, { seed: sd + 4, t, closed: true, w: 3, smooth: false }));
          } else {
            frame.I.setAttribute('d', inkPath(fr, { seed: sd + 4, t, closed: true, w: 8, smooth: false }) + ' ' + inkPath(rect(x0 + 18, y0 + 18, pw - 36, ph - 36), { seed: sd + 5, t, closed: true, w: 3, smooth: false }));
            let cl = '';
            for (const [cx, cy] of [[x0, y0], [x0 + pw, y0], [x0, y0 + ph], [x0 + pw, y0 + ph]]) cl += inkLoop(circ(cx, cy, 20, 10), { seed: sd + 6 + cx, t, amp: 0.8 }) + ' ';
            frame.clips.setAttribute('d', cl);
          }
          frame.F.setAttribute('d', inkLoop(fr, { seed: sd + 4, t, smooth: false }));
          // flesh: palm + forearm + fingers (one path: nonzero union)
          let fd = inkLoop(ccw([[-120, 200], [-112, -40], [-150, -200], [-118, -300], [-40, -320], [40, -318], [118, -296], [150, -190], [128, -60], [112, 200]].map(HX)), { seed: sd + 10, t, amp: 1.5 });
          let fo = inkPath([[-120, 200], [-112, -40], [-150, -200]].map(HX), { seed: sd + 11, t, w: 4, amp: 1.2 }) + ' ' + inkPath([[150, -190], [128, -60], [112, 200]].map(HX), { seed: sd + 12, t, w: 4, amp: 1.2 });
          CH.forEach((c, fi) => {
            const a = c.pts[1], b = c.pts[c.pts.length - 1], w = c.w[1] * 2.5;
            const bp = band(a, b, w).map(HX);
            fd += ' ' + inkLoop(ccw(bp), { seed: sd + 20 + fi, t, amp: 1.3 });
            fo += ' ' + inkPath(bp.slice(1, -1), { seed: sd + 20 + fi, t, w: 4, amp: 1.3 });
          });
          flesh.F.setAttribute('d', fd); flesh.I.setAttribute('d', fo);
          // bones
          const ba = mode === 'reveal' ? atOr(cues, 'bones', dur * 0.3) : -10;
          const span = 1.1;
          const sweep = mode === 'reveal' ? clamp01((lt - ba) / span) : 1;
          bones.forEach((b, i) => {
            const vis = mode === 'reveal' ? clamp01((lt - ba - b.ord * span * 0.8) / 0.3) : 1;
            b.F.setAttribute('fill-opacity', (0.82 * vis).toFixed(3));
            b.M.setAttribute('fill-opacity', (0.55 * vis).toFixed(3));
            if (vis <= 0.001) { b.F.setAttribute('d', ''); b.M.setAttribute('d', ''); return; }
            if (b.blob) {
              const [x, y, rx, ry] = b.blob, c = HX([x, y]);
              b.F.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], rx * hs, ry * hs, seed + i, 9, i * 0.4, 0.12), { seed: sd + 100 + i, t, amp: 1 }));
              b.M.setAttribute('d', '');
            } else {
              const cp = capsule(b.a, b.b, b.w).map(HX);
              b.F.setAttribute('d', inkLoop(cp, { seed: sd + 100 + i, t, amp: 1 }));
              const m0 = [lerp(b.a[0], b.b[0], 0.22), lerp(b.a[1], b.b[1], 0.22)], m1 = [lerp(b.a[0], b.b[0], 0.78), lerp(b.a[1], b.b[1], 0.78)];
              b.M.setAttribute('d', inkPath([m0, m1].map(HX), { seed: sd + 300 + i, t, w: Math.max(3, b.w * 0.22 * hs), amp: 0.6 }));
            }
          });
          // ring: thick dark band across the ring finger with a gold glint
          const rgA = mode === 'reveal' ? atOr(cues, 'ring', dur * 0.65) : -10, rgv = mode === 'reveal' ? prog(lt, rgA, 0.25) : 1, rgh = punch(lt, rgA, 0.8);
          const dx = rb[0] - ra[0], dy = rb[1] - ra[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
          const rw = 38 * (1 + rgh * 0.35), rt = 17 * (1 + rgh * 0.35);
          const rq = [[ringC[0] + nx * rw - ux * rt, ringC[1] + ny * rw - uy * rt], [ringC[0] + nx * rw + ux * rt, ringC[1] + ny * rw + uy * rt], [ringC[0] - nx * rw + ux * rt, ringC[1] - ny * rw + uy * rt], [ringC[0] - nx * rw - ux * rt, ringC[1] - ny * rw - uy * rt]].map(HX);
          ringE.F.setAttribute('fill-opacity', (0.97 * rgv).toFixed(3));
          ringE.F.setAttribute('d', rgv > 0.001 ? inkLoop(rq, { seed: sd + 400, t, amp: 0.8 }) : '');
          ringE.G.setAttribute('fill-opacity', (0.9 * rgv * (0.6 + 0.4 * Math.sin(t * 5))).toFixed(3));
          ringE.G.setAttribute('d', rgv > 0.001 ? inkPath([HX([ringC[0] + nx * rw * 0.6 - ux * 3, ringC[1] + ny * rw * 0.6 - uy * 3]), HX([ringC[0] - nx * rw * 0.2 - ux * 3, ringC[1] - ny * rw * 0.2 - uy * 3])], { seed: sd + 401, t, w: 6, amp: 0.5 }) : '');
          // scan line (reveal): a gold band sweeping bottom -> top while the bones appear
          if (mode === 'reveal' && sweep > 0 && sweep < 1) {
            const yy = lerp(y0 + ph, y0, sweep);
            scan.F.setAttribute('fill-opacity', '0.75');
            scan.F.setAttribute('d', inkPath([[x0 - 10, yy], [x0 + pw * 0.5, yy - 6], [x0 + pw + 10, yy]], { seed: sd + 500, t, w: 16, amp: 1.2 }));
          } else scan.F.setAttribute('d', '');
          // rim pulse (plate mode): a gold glow line just outside the frame
          if (mode !== 'print') {
            const pulse = 0.35 + 0.35 * Math.sin(t * 3.2);
            rim.setAttribute('fill-opacity', pulse.toFixed(3));
            rim.setAttribute('d', inkPath(rect(x0 - 16, y0 - 16, pw + 32, ph + 32), { seed: sd + 510, t, closed: true, w: 6, smooth: false, amp: 1.5 }));
          }
          // hand-drawn circle around the ring
          if (P.mark !== false && P.mark) {
            const ma = atOr(cues, P.mark.at || 'ring', dur * 0.7);
            if (lt >= ma) {
              const pr = prog(lt, ma, 0.6), n = 26, pts = [];
              const rr = 78 * hs;
              for (let k = 0; k <= Math.round(n * 1.1 * pr); k++) { const a = -1.9 + k / n * 6.2832; pts.push([ringW[0] + Math.cos(a) * rr * (1 + 0.06 * Math.sin(k)), ringW[1] + Math.sin(a) * rr * 0.86]); }
              // the mark sits in plate space: same transform as the plate
              markE.setAttribute('transform', ptf);
              markE.setAttribute('d', pts.length > 1 ? inkPath(pts, { seed: sd + 600, t, w: 8, amp: 1 }) : '');
            } else markE.setAttribute('d', '');
          }
          updateLabel(label, lt, t, dur, cues, W, H, sd);
          updateLabel(label2, lt, t, dur, cues, W, H, sd + 50);
          updateCast(cast, lt, t, cues, W, H, portrait, sd);
          clipR.setAttribute('x', x0 + 10);
        },
      };
    },
  };
})();
