// kk_kekova: the Kekova wreck (off Turkey, ~4,500 years old, 2026 news) in parchment ink (brand/kit/BRAND.md §3, §5).
// Every line boils at 8 Hz through _ink.js; everything is a pure function of (seed, lt), no Math.random.
// Early Bronze Age "belted" storage jars (ovoid, flat base, two shoulder handles, a raised clay band round the belly),
// slab stone anchors with a rope hole, a sandy sea floor 30 m down. Parametric: any wreck that is only its cargo.
//
// SHOTS.kk_sea — underwater: light rays, drifting hatching, fish, sand floor; belted jars and stone anchors lie
//   scattered on the floor and pop in on cues; an optional dashed "ghost" hull floats above them where the ship
//   should be (crossed out in red on its cue); a depth line from the surface; a counter; the cast swims with bubbles.
//   P: {floor: 0.62 (0..1 H), jars: {n: 9, at, dur: 1.6, x0: 0.06, x1: 0.94, scale: 1} | false,
//       anchors: {n: 3, at, dur: 0.8} | false, ghost: {at, dur: 1.2, cross: cue, y: 0.4, scale: 1} | false,
//       depth: {x: 0.1, text: "30 m", at} | false, counter: {x: 0.5, y: 0.2, to: 30, at, dur: 1.4, suffix: "+ JARS", size: 110},
//       label: {text, x: 0.5, y: 0.2, at, size: 90, color: "red"|"ink", stamp: true},
//       cast: [{who: "kasif"|name, x, y (feet, 0..1 H), from_y (swims down from here until at), scale, pose, at, then,
//               face: "left"|"right", dir, emotion, emotion0, bubbles: true}], zoom: 1.07, focus: [0.5, 0.5],
//       cover_cam: {zoom, dx, dy} (thumbnail / hook frame only)}
//   cues: jars.at, anchors.at, ghost.at/cross, depth.at, counter.at, label.at, cast "at" names
//
// SHOTS.kk_hull — a wooden hull lying on the floor, packed with jars; on cue "rot" its planks crumble one by one
//   into drifting flecks (stern to bow) and the jars settle onto the sand; only a dashed outline is left.
//   P: {floor: 0.6, rot: cue, dur: 1.8, label: {...as kk_sea}, cast: [...as kk_sea], zoom, focus}
//
// SHOTS.kk_jar — one big belted jar on the sand, close; cue "belt" rings the clay band in red with a hand-written
//   note + arrow; cue "hit" punches the jar. P: {x: 0.42, y: 0.5 (jar centre), size: 1, tilt: -8 (deg), note: "clay belt",
//   label: {...}, cast: [...], zoom, focus}
//
// SHOTS.kk_egypt — dry land: desert horizon with the Giza pyramids, the biggest still unfinished with a mud-brick ramp
//   and tiny workers hauling a block up it; a belted jar stands in the foreground next to the cast. Sun, haze lines.
//   P: {horizon: 0.5, jar: {x: 0.2, y: 0.7, size: 0.6, at} | false, label: {...}, cast: [...], zoom, focus}
//   cues: jar.at, label.at, cast "at" names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const circ = (cx, cy, r, n = 14) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  const mk = (g, fill = INK.ink, extra = {}) => inkEl(g, fill, extra);

  // ---------------------------------------------------------------- belted jar
  // local units: jar ~ 200 tall, base at v = 0, mouth at v = -200; (u, v) -> rotated + scaled around (cx, cy)
  function jarGeom(cx, cy, s, rotDeg) {
    const a = rotDeg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    const Q = (u, v) => [cx + (u * c - v * sn) * s, cy + (u * sn + v * c) * s];
    const body = [[-36, 0], [-62, -26], [-74, -70], [-70, -112], [-56, -146], [-30, -166], [-22, -176], [-24, -196],
      [24, -196], [22, -176], [30, -166], [56, -146], [70, -112], [74, -70], [62, -26], [36, 0]].map(p => Q(p[0], p[1]));
    const belt = [[-75, -86], [-37, -80], [0, -78], [37, -80], [75, -86]].map(p => Q(p[0], p[1]));
    const belt2 = [[-75, -72], [-37, -66], [0, -64], [37, -66], [75, -72]].map(p => Q(p[0], p[1]));
    const rim = [[-28, -196], [28, -196]].map(p => Q(p[0], p[1]));
    const hL = [[-56, -146], [-88, -150], [-84, -116], [-70, -110]].map(p => Q(p[0], p[1]));
    const hR = [[56, -146], [88, -150], [84, -116], [70, -110]].map(p => Q(p[0], p[1]));
    const shade = [[30, -40], [54, -70], [52, -120]].map(p => Q(p[0], p[1]));
    return { body, belt, belt2, rim, hL, hR, shade, Q };
  }
  function jarPaths(cx, cy, s, rot, sd, t) {
    const J = jarGeom(cx, cy, s, rot), w = Math.max(3, 6 * Math.min(1.6, s));
    return {
      fill: inkLoop(J.body, { seed: sd, t }),
      ink: inkPath(J.body, { seed: sd, t, closed: true, w }) + ' ' + inkPath(J.belt, { seed: sd + 1, t, w: w * 0.8 }) + ' ' +
        inkPath(J.belt2, { seed: sd + 2, t, w: w * 0.8 }) + ' ' + inkPath(J.rim, { seed: sd + 3, t, w: w * 1.3 }) + ' ' +
        inkPath(J.hL, { seed: sd + 4, t, w }) + ' ' + inkPath(J.hR, { seed: sd + 5, t, w }),
      soft: inkPath(J.shade, { seed: sd + 6, t, w: w * 0.6 }),
      band: inkLoop(J.belt.concat(J.belt2.slice().reverse()), { seed: sd + 7, t, smooth: false }),
      J,
    };
  }
  // ---------------------------------------------------------------- stone anchor (slab with a rope hole)
  function anchorPaths(cx, cy, s, rot, sd, t) {
    const a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a);
    const Q = (u, v) => [cx + (u * c - v * sn) * s, cy + (u * sn + v * c) * s];
    const slab = [[-60, 0], [-48, -110], [-30, -150], [30, -150], [48, -110], [60, 0]].map(p => Q(p[0], p[1]));
    const [hx, hy] = Q(0, -118);
    return {
      fill: inkLoop(slab, { seed: sd, t }),
      ink: inkPath(slab, { seed: sd, t, closed: true, w: 6 }) + ' ' + inkPath(circ(hx, hy, 15 * s, 10), { seed: sd + 1, t, closed: true, w: 5 }),
      soft: inkPath([Q(-30, -30), Q(-10, -60)], { seed: sd + 2, t, w: 3 }) + ' ' + inkPath([Q(20, -20), Q(36, -56)], { seed: sd + 3, t, w: 3 }),
    };
  }

  // ---------------------------------------------------------------- shared: water, floor, cast, label
  function sea(ctx, P, floorY) {
    const { W, H, seed } = ctx;
    const r0 = rng(seed * 13 + 5);
    const fish = Array.from({ length: 5 }, () => ({ x: r0() * W, y: lerp(H * 0.14, floorY - 140, r0()), v: (r0() < 0.5 ? -1 : 1) * (30 + r0() * 30), s: 0.7 + r0() * 0.5 }));
    const hl = Array.from({ length: 14 }, () => ({ x: r0() * W, y: lerp(H * 0.1, floorY - 40, r0()), w: 50 + r0() * 90, v: 6 + r0() * 10 }));
    const peb = Array.from({ length: 18 }, () => [r0() * W, floorY + 40 + r0() * (H * 0.18), 6 + r0() * 10]);
    return { fish, hl, peb };
  }
  function drawSea(E, S, W, H, floorY, t, sd, seed) {
    E.water.setAttribute('d', inkLoop([[-80, -80], [W + 80, -80], [W + 80, floorY + 40], [-80, floorY + 40]], { seed: sd + 1, t, amp: 1, smooth: false }));
    let ry = '';
    for (let k = 0; k < 4; k++) { const x0 = W * (0.12 + k * 0.25) + Math.sin(t * 0.5 + k) * 24; ry += inkLoop([[x0 - 26, -40], [x0 + 26, -40], [x0 + 130, floorY - 30], [x0 + 46, floorY - 30]], { seed: sd + 5 + k, t, amp: 1, smooth: false }) + ' '; }
    E.rays.setAttribute('d', ry);
    E.hatch.setAttribute('d', S.hl.map((h, i) => { const x = ((h.x + t * h.v) % (W + 200)) - 100; const pts = []; for (let j = 0; j <= 4; j++) pts.push([x + j * h.w / 4, h.y + Math.sin(j * 1.5 + t) * 5]); return inkPath(pts, { seed: sd + 20 + i, t, w: 3, amp: 0.8 }); }).join(' '));
    E.fish.setAttribute('d', S.fish.map((f, i) => {
      const x = ((f.x + t * f.v) % (W + 200) + W + 200) % (W + 200) - 100, y = f.y + Math.sin(t * 1.3 + i) * 10, s = 26 * f.s, d = f.v > 0 ? 1 : -1;
      return inkLoop([[x + d * s, y], [x, y - s * 0.45], [x - d * s * 0.8, y], [x - d * s * 1.3, y - s * 0.4], [x - d * s * 1.3, y + s * 0.4], [x - d * s * 0.8, y], [x, y + s * 0.45]], { seed: sd + 40 + i, t, amp: 0.6, smooth: false });
    }).join(' '));
    const sf = []; for (let i = 0; i <= 16; i++) { const x = -80 + i * (W + 160) / 16; sf.push([x, floorY + Math.sin(i * 1.7) * 14]); }
    E.sandF.setAttribute('d', inkLoop(sf.concat([[W + 80, H + 60], [-80, H + 60]]), { seed: sd + 60, t, amp: 1.2, smooth: false }));
    E.sandI.setAttribute('d', inkPath(sf, { seed: sd + 61, t, w: 6, amp: 1.2 }));
    E.sandS.setAttribute('d', S.peb.map((p, i) => inkDot(p[0], p[1], p[2], p[2] * 0.6, seed + 70 + i, t)).join(' ') + ' ' +
      [0, 1, 2].map(k => inkPath([[60 + k * 340, floorY + 80 + k * 22], [160 + k * 340, floorY + 70 + k * 22], [260 + k * 340, floorY + 82 + k * 22]], { seed: sd + 80 + k, t, w: 3 })).join(' '));
  }
  function seaLayers(cam) {
    return {
      water: mk(cam, INK.paperDark, { 'fill-opacity': 0.42 }),
      rays: mk(cam, INK.paperLight, { 'fill-opacity': 0.5 }),
      hatch: mk(cam, INK.inkSoft, { 'fill-opacity': 0.5 }),
      fish: mk(cam, INK.inkSoft, { 'fill-opacity': 0.85 }),
    };
  }
  function sandLayers(cam, E) {
    E.sandF = mk(cam, INK.paperDark); E.sandI = mk(cam); E.sandS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });
    return E;
  }
  function makeCast(ctx, P, castG, defScale) {
    const { seed } = ctx;
    return (P.cast || []).map((c, i) => {
      const isK = (c.who || 'kasif') === 'kasif';
      const rig = KASIF.create(el(castG, 'g'), { scale: c.scale ?? defScale, hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: seed + i * 7 + 3 });
      return { c, rig };
    });
  }
  function updateCast(cast, W, H, lt, t, cues, swim) {
    cast.forEach(({ c, rig }) => {
      const at = atOr(cues, c.at, null);
      let x = (c.x ?? 0.75) * W, y = (c.y ?? 0.6) * H;
      if (c.from_y != null) {                       // swims down onto its spot, arriving on its cue (or half-way)
        const arr = at != null ? at : 1.6;
        y = lerp(c.from_y * H, y, progIO(lt, 0, Math.max(0.4, arr)));
      }
      if (swim) { y += Math.sin(t * 1.7 + x * 0.01) * 8; x += Math.sin(t * 0.9) * 6; }
      const after = at != null && lt >= at, pose = after ? (c.then || 'shock') : (c.pose || 'idle');
      const since = after ? lt - at : lt, dir = typeof c.dir === 'number' ? c.dir : DIRS[c.dir] ?? 20;
      const emo = after ? (c.emotion || (pose === 'shock' ? 'surprised' : null)) : (c.emotion0 || null);
      const o = { x, y, face: c.face === 'left' ? -1 : 1, since, dir, emotion: emo, text: c.text, item: c.item };
      if (after && since < 0.32) { o.prev = { pose: c.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      rig.update(t, pose, o);
      c._head = [x, y - 560 * (c.scale ?? 0.6) * 0.95];
    });
  }
  function bubbles(E, srcs, t, sd, topY) {
    let bb = '', bi = '';
    srcs.forEach(([sx, sy], s) => {
      for (let j = 0; j < 5; j++) {
        const ph = ((t * 0.55 + j / 5 + s * 0.13) % 1), y = sy - ph * 420, x = sx + Math.sin(ph * 9 + j) * 14, r = 6 + ph * 11;
        if (y < topY) continue;
        bb += inkLoop(circ(x, y, r, 10), { seed: sd + 360 + j + s * 9, t, amp: 0.6 }) + ' ';
        bi += inkPath(circ(x, y, r, 10), { seed: sd + 360 + j + s * 9, t, closed: true, w: 3, amp: 0.6 }) + ' ';
      }
    });
    E.bubF.setAttribute('d', bb); E.bubI.setAttribute('d', bi);
  }
  function makeLabel(svg, P, portrait) {
    if (!P.label || !P.label.text) return null;
    const Lb = P.label, size = Lb.size || (portrait ? 90 : 70), g = el(svg, 'g'), red = Lb.color === 'red';
    const box = Lb.stamp ? mk(g, INK.red) : null;
    const tx = el(g, 'text', { 'font-family': Lb.stamp ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-weight': Lb.stamp ? 900 : 400, 'font-size': size, 'text-anchor': 'middle',
      fill: Lb.stamp ? INK.paperLight : red ? INK.red : INK.ink,
      style: Lb.stamp ? '' : `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
    tx.textContent = Lb.text;
    return { Lb, g, tx, box, u: Lb.stamp ? null : mk(g, red ? INK.red : INK.ink), size };
  }
  function updateLabel(label, W, H, lt, t, cues, dur, sd) {
    if (!label) return;
    const Lb = label.Lb, at = atOr(cues, Lb.at, dur * 0.5), p = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? 0.2) * H;
    label.g.style.display = lt < at ? 'none' : '';
    label.tx.setAttribute('x', x); label.tx.setAttribute('y', y);
    const tw = label.tx.getComputedTextLength ? label.tx.getComputedTextLength() : 300;
    if (label.box) {
      const s = label.size, pad = s * 0.28;
      label.box.setAttribute('d', inkLoop([[x - tw / 2 - pad, y - s * 0.86], [x + tw / 2 + pad, y - s * 0.9], [x + tw / 2 + pad, y + s * 0.26], [x - tw / 2 - pad, y + s * 0.3]], { seed: sd + 980, t, smooth: false }));
    } else label.u.setAttribute('d', inkPath([[x - tw / 2, y + 18], [x + tw / 2, y + 12]], { seed: sd + 990, t, w: 6 }));
    const sc = label.box ? lerp(1.6, 1, p) : lerp(0.6, 1, p);
    label.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(-3) scale(${sc.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
  }
  function camT(cam, P, W, H, lt, dur, t, env, extra = 1) {
    const zz = P.zoom ?? 1.07, fc = P.focus || [0.5, 0.5];
    let z = lerp(1, zz, progIO(lt, 0, Math.max(1, dur))) * extra, dx = 0, dy = 0;
    if (env && env.cover && P.cover_cam) { z *= P.cover_cam.zoom ?? 1; dx = P.cover_cam.dx || 0; dy = P.cover_cam.dy || 0; }
    const fx = fc[0] * W, fy = fc[1] * H;
    cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6 + dx)} ${f1(Math.cos(t * 0.23) * 5 + dy)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }

  // jar layout on the floor: deterministic scatter, alternating standing / lying / tilted, some half-buried
  function jarLayout(n, x0, x1, floorY, seed, scale) {
    const r = rng(seed * 7 + 11), out = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1), x = lerp(x0, x1, u) + (r() - 0.5) * 50;
      const kind = i % 3, rot = kind === 0 ? (r() - 0.5) * 16 : kind === 1 ? 84 + (r() - 0.5) * 20 : -(26 + r() * 20);
      const s = scale * (0.62 + r() * 0.3), back = i % 2 === 1;
      const y = floorY + (back ? -6 : 34) + (kind === 1 ? -66 * s * 0.0 : 0);
      out.push({ x, y, rot, s: back ? s * 0.82 : s, back, kind });
    }
    return out.sort((a, b) => (a.back === b.back ? 0 : a.back ? -1 : 1));
  }

  // ================================================================ kk_sea
  SH.kk_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, floorY = (P.floor ?? 0.62) * H;
      const cam = el(svg, 'g');
      const E = seaLayers(cam);
      const depthG = el(cam, 'g'), depthI = mk(depthG), depthT = el(depthG, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 72 : 56, 'text-anchor': 'start', fill: INK.ink,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
      const ghostI = mk(cam, INK.inkSoft), ghostX = mk(cam, INK.red);
      const backF = mk(cam, INK.paperLight), backI = mk(cam), backS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      sandLayers(cam, E);
      const ancF = mk(cam, INK.paperDark), ancI = mk(cam), ancS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.8 });
      const frontF = mk(cam, INK.paperLight), frontI = mk(cam), frontS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const castG = el(cam, 'g');
      E.bubF = mk(cam, INK.paperLight); E.bubI = mk(cam, INK.inkSoft);
      const S = sea(ctx, P, floorY);
      const JP = P.jars === false ? null : Object.assign({ n: 9, x0: 0.06, x1: 0.94, scale: 1 }, P.jars || {});
      const jars = JP ? jarLayout(JP.n, JP.x0 * W, JP.x1 * W, floorY, seed, (JP.scale) * (portrait ? 1.15 : 1)) : [];
      const AP = P.anchors === false ? null : Object.assign({ n: 3 }, P.anchors || {});
      const anchors = AP ? Array.from({ length: AP.n }, (_, i) => ({ x: W * (0.2 + i * 0.3) + (i === 1 ? 40 : 0), y: floorY + 70 + (i % 2) * 30, rot: [-14, 8, 72][i % 3], s: portrait ? 0.95 : 0.8 })) : [];
      let counter = null;
      if (P.counter) {
        const C = P.counter, g = el(svg, 'g');
        const tx = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': C.size || (portrait ? 110 : 90), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        counter = { C, g, tx };
      }
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t, env);
          drawSea(E, S, W, H, floorY, t, sd, seed);
          // depth line from the top edge down to the floor
          if (P.depth) {
            const D = P.depth, at = atOr(cues, D.at, 0.2), p = prog(lt, at, 1.0), x = (D.x ?? 0.1) * W;
            depthG.style.display = lt < at ? 'none' : '';
            const y1 = lerp(H * 0.15, floorY - 10, p);
            let d = '';
            for (let y = H * 0.15; y < y1 - 20; y += 56) d += inkPath([[x, y], [x, Math.min(y + 30, y1)]], { seed: sd + 500 + Math.round(y), t, w: 6 }) + ' ';
            d += inkPath([[x - 22, y1 - 30], [x, y1], [x + 22, y1 - 30]], { seed: sd + 498, t, w: 6 });
            depthI.setAttribute('d', d);
            depthT.textContent = D.text || '30 m';
            depthT.setAttribute("x", x + 26); depthT.setAttribute("y", lerp(H * 0.15, floorY, 0.5 * p) + 20);
          } else depthG.style.display = 'none';
          // ghost hull: dashed outline where the ship should be, crossed out on its cue
          if (P.ghost) {
            const G = P.ghost, at = atOr(cues, G.at, 0.1), p = clamp01((lt - at) / (G.dur ?? 1.2)), gs = (G.scale ?? 1) * (portrait ? 1 : 0.9);
            const cx = W * 0.5, cy = (G.y ?? 0.4) * H + Math.sin(t * 0.8) * 8, hw = 380 * gs, hh = 150 * gs;
            const hull = [[cx - hw, cy - hh * 0.5], [cx - hw * 0.7, cy + hh * 0.55], [cx + hw * 0.7, cy + hh * 0.55], [cx + hw * 1.04, cy - hh * 0.62]];
            const mast = [[cx, cy - hh * 0.5], [cx, cy - hh * 2.3]];
            const sail = [[cx - hw * 0.5, cy - hh * 2.15], [cx + hw * 0.5, cy - hh * 2.15], [cx + hw * 0.46, cy - hh * 0.85], [cx - hw * 0.46, cy - hh * 0.85]];
            const segs = [];
            const dash = (pts, closed) => {
              const all = closed ? pts.concat([pts[0]]) : pts;
              for (let i = 0; i < all.length - 1; i++) {
                const a = all[i], b = all[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 46));
                for (let k = 0; k < n; k++) segs.push([[lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)], [lerp(a[0], b[0], (k + 0.55) / n), lerp(a[1], b[1], (k + 0.55) / n)]]);
              }
            };
            dash(hull, true); dash(mast, false); dash(sail, true);
            const show = Math.round(segs.length * p);
            ghostI.setAttribute('d', lt < at ? '' : segs.slice(0, show).map((s, i) => inkPath(s, { seed: sd + 600 + i, t, w: 7 })).join(' '));
            const xa = atOr(cues, G.cross, null);
            if (xa != null && lt >= xa) {
              const q = clamp01((lt - xa) / 0.5), q2 = clamp01((lt - xa - 0.25) / 0.5), r = hw * 0.75;
              const A = [cx - r, cy - hh * 1.9], B = [cx + r, cy + hh * 0.6], C2 = [cx + r, cy - hh * 1.9], D2 = [cx - r, cy + hh * 0.6];
              ghostX.setAttribute('d', inkPath([A, [lerp(A[0], B[0], q), lerp(A[1], B[1], q)]], { seed: sd + 700, t, w: 18 }) + ' ' +
                (q2 > 0 ? inkPath([C2, [lerp(C2[0], D2[0], q2), lerp(C2[1], D2[1], q2)]], { seed: sd + 701, t, w: 18 }) : ''));
            } else ghostX.setAttribute('d', '');
          }
          // jars: staggered pop on their cue
          if (JP) {
            const at = atOr(cues, JP.at, -1), span = JP.dur ?? 1.6;
            let bf = '', bi = '', bs = '', ff = '', fi = '', fs = '';
            jars.forEach((j, i) => {
              const a0 = at < 0 ? -1 : at + span * (i / Math.max(1, jars.length));
              const p = a0 < 0 ? 1 : spring(lt, a0, 0.5);
              if (p < 0.02) return;
              const jp = jarPaths(j.x, j.y - (j.kind === 1 ? 70 * j.s : 0), j.s * p * (1 + punch(lt, a0, 0.5) * 0.1), j.rot, sd + 100 + i * 13, t);
              if (j.back) { bf += jp.fill + ' '; bi += jp.ink + ' '; bs += jp.soft + ' '; } else { ff += jp.fill + ' '; fi += jp.ink + ' '; fs += jp.soft + ' '; }
            });
            backF.setAttribute('d', bf); backI.setAttribute('d', bi); backS.setAttribute('d', bs);
            frontF.setAttribute('d', ff); frontI.setAttribute('d', fi); frontS.setAttribute('d', fs);
          }
          if (AP) {
            const at = atOr(cues, AP.at, -1);
            let f = '', i2 = '', s2 = '';
            anchors.forEach((a, i) => {
              const a0 = at < 0 ? -1 : at + (AP.dur ?? 0.8) * i / anchors.length, p = a0 < 0 ? 1 : spring(lt, a0, 0.5);
              if (p < 0.02) return;
              const ap = anchorPaths(a.x, a.y, a.s * p * (1 + punch(lt, a0, 0.5) * 0.12), a.rot, sd + 300 + i * 7, t);
              f += ap.fill + ' '; i2 += ap.ink + ' '; s2 += ap.soft + ' ';
            });
            ancF.setAttribute('d', f); ancI.setAttribute('d', i2); ancS.setAttribute('d', s2);
          }
          if (counter) {
            const C = counter.C, at = atOr(cues, C.at, dur * 0.4), p = prog(lt, at, C.dur ?? 1.4);
            counter.g.style.display = lt < at ? 'none' : '';
            counter.tx.textContent = Math.round((C.to ?? 30) * p).toLocaleString('en-US') + (C.suffix ?? '');
            const x = (C.x ?? 0.5) * W, y = (C.y ?? 0.2) * H, s = 1 + punch(lt, at + (C.dur ?? 1.4), 0.6) * 0.15;
            counter.tx.setAttribute('x', x); counter.tx.setAttribute('y', y);
            counter.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
          }
          updateLabel(label, W, H, lt, t, cues, dur, sd);
          updateCast(cast, W, H, lt, t, cues, true);
          bubbles(E, cast.filter(c => c.c.bubbles !== false).map(c => [c.c._head[0] + 30 * (c.c.face === 'left' ? -1 : 1), c.c._head[1]]), t, sd, 0);
        },
      };
    },
  };

  // ================================================================ kk_hull
  SH.kk_hull = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, floorY = (P.floor ?? 0.6) * H;
      const cam = el(svg, 'g');
      const E = seaLayers(cam);
      sandLayers(cam, E);
      const outline = mk(cam, INK.inkSoft);
      const NP = 7, planks = Array.from({ length: NP }, () => ({ f: mk(cam, INK.hat), i: mk(cam) }));
      const jarF = mk(cam, INK.paperLight), jarI = mk(cam), jarS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const ribs = Array.from({ length: NP }, () => mk(cam));
      const fleck = mk(cam, INK.hat, { 'fill-opacity': 0.9 });
      const castG = el(cam, 'g');
      E.bubF = mk(cam, INK.paperLight); E.bubI = mk(cam, INK.inkSoft);
      const S = sea(ctx, P, floorY);
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.55 : 0.5);
      const hw = portrait ? 470 : 600, hh = portrait ? 210 : 190, cx = W * (P.x ?? 0.5), base = floorY + 40;
      // hull cross-section seen from the side: a shallow bowl, planks as horizontal strakes
      const hullAt = (u, v) => {   // u -1..1 along, v 0 (keel) .. 1 (gunwale)
        const half = hw * lerp(0.62, 1, Math.pow(v, 0.6));
        const sheer = (u > 0 ? 0.14 : 0.05) * hh * Math.pow(Math.abs(u), 3);
        return [cx + u * half, base - v * hh - sheer];
      };
      const strake = k => {
        const v0 = k / NP, v1 = (k + 1) / NP, top = [], bot = [];
        for (let i = 0; i <= 10; i++) { const u = -1 + i / 5; top.push(hullAt(u, v1)); bot.push(hullAt(u, v0)); }
        return top.concat(bot.reverse());
      };
      const r0 = rng(seed * 3 + 1);
      const fl = Array.from({ length: 70 }, () => ({ k: Math.floor(r0() * NP), u: r0() * 2 - 1, vx: (r0() - 0.5) * 60, vy: 40 + r0() * 70, s: 4 + r0() * 6 }));
      const jarSpots = [-0.6, -0.3, 0, 0.3, 0.6].map((u, i) => ({ u, s: (portrait ? 0.9 : 0.85) * (i % 2 ? 0.9 : 1), rot: (i - 2) * 3 }));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t, env);
          drawSea(E, S, W, H, floorY, t, sd, seed);
          const ra = atOr(cues, P.rot, dur * 0.35), span = P.dur ?? 1.8;
          // per plank decay 0..1, top strake first
          const dec = k => clamp01((lt - (ra + span * (NP - 1 - k) / NP)) / 0.6);
          // dashed outline of the vanished hull (fades in as planks go)
          const og = clamp01((lt - ra) / span);
          if (og > 0) {
            const pts = []; for (let i = 0; i <= 20; i++) pts.push(hullAt(-1 + i / 10, 1));
            const pb = []; for (let i = 0; i <= 20; i++) pb.push(hullAt(1 - i / 10, 0));
            const ring = pts.concat(pb, [pts[0]]); let d = '';
            for (let i = 0; i < ring.length - 1; i++) if (i % 2 === 0) d += inkPath([ring[i], ring[i + 1]], { seed: sd + 50 + i, t, w: 5 }) + ' ';
            outline.setAttribute('d', d);
          } else outline.setAttribute('d', '');
          planks.forEach((pl, k) => {
            const q = dec(k);
            if (q >= 1) { pl.f.setAttribute('d', ''); pl.i.setAttribute('d', ''); return; }
            const sh = strake(k).map(([x, y], i) => [x + Math.sin(i + k) * q * 30, y + q * q * 40]);
            pl.f.setAttribute('d', inkLoop(sh, { seed: sd + 200 + k, t }));
            pl.f.setAttribute('fill-opacity', (0.75 * (1 - q)).toFixed(3));
            pl.i.setAttribute('d', inkPath(sh, { seed: sd + 200 + k, t, closed: true, w: 5 * (1 - q) + 1 }));
            pl.i.setAttribute('fill-opacity', (1 - q).toFixed(3));
          });
          ribs.forEach((rb, k) => {
            const u = -0.75 + k * 0.25, q = clamp01((lt - ra - span * 0.3 - k * 0.08) / 0.7);
            if (q >= 1) { rb.setAttribute('d', ''); return; }
            rb.setAttribute('d', inkPath([hullAt(u, 0), hullAt(u * 1.04, 0.55), hullAt(u * 1.08, 1.1 - q * 0.9)], { seed: sd + 300 + k, t, w: 8 * (1 - q) + 1 }));
            rb.setAttribute('fill-opacity', (1 - q).toFixed(3));
          });
          // flecks drift up from decaying planks
          let fd = '';
          fl.forEach((f, i) => {
            const st = ra + span * (NP - 1 - f.k) / NP, a = lt - st;
            if (a < 0 || a > 2.6) return;
            const [x0, y0] = hullAt(f.u, (f.k + 0.5) / NP);
            fd += inkDot(x0 + f.vx * a + Math.sin(a * 3 + i) * 10, y0 - f.vy * a, f.s * (1 - a / 2.6) + 1, f.s * 0.6 * (1 - a / 2.6) + 1, seed + 900 + i, t) + ' ';
          });
          fleck.setAttribute('d', fd);
          // jars: ride inside the hull, then settle onto the sand when it is gone
          let jf = '', ji = '', js = '';
          jarSpots.forEach((j, i) => {
            const [x, yTop] = hullAt(j.u, 0.15), settle = progIO(lt, ra + span * 0.6 + i * 0.07, 0.8);
            const y = lerp(yTop, floorY + 46, settle), rot = lerp(j.rot, j.rot + (i % 2 ? 18 : -14), settle);
            const jp = jarPaths(x, y, j.s * (1 + punch(lt, ra + span * 0.6 + 0.8 + i * 0.07, 0.4) * 0.06), rot, sd + 400 + i * 11, t);
            jf += jp.fill + ' '; ji += jp.ink + ' '; js += jp.soft + ' ';
          });
          jarF.setAttribute('d', jf); jarI.setAttribute('d', ji); jarS.setAttribute('d', js);
          updateLabel(label, W, H, lt, t, cues, dur, sd);
          updateCast(cast, W, H, lt, t, cues, true);
          bubbles(E, cast.filter(c => c.c.bubbles !== false).map(c => [c.c._head[0] + 30 * (c.c.face === 'left' ? -1 : 1), c.c._head[1]]), t, sd, 0);
        },
      };
    },
  };

  // ================================================================ kk_jar
  SH.kk_jar = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, floorY = (P.floor ?? 0.66) * H;
      const cam = el(svg, 'g');
      const E = seaLayers(cam);
      sandLayers(cam, E);
      const jF = mk(cam, INK.paperLight), jB = mk(cam, INK.gold, { 'fill-opacity': 0 }), jI = mk(cam), jS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const ring = mk(cam, INK.red), arrow = mk(cam, INK.red);
      const note = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 84 : 66, 'text-anchor': 'middle', fill: INK.red,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      note.textContent = P.note || 'clay belt';
      const castG = el(cam, 'g');
      E.bubF = mk(cam, INK.paperLight); E.bubI = mk(cam, INK.inkSoft);
      const S = sea(ctx, P, floorY);
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.55 : 0.5);
      const size = (P.size ?? 1) * (portrait ? 3.1 : 2.6);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t, env);
          drawSea(E, S, W, H, floorY, t, sd, seed);
          const ent = spring(lt, 0, 0.7), hit = punch(lt, atOr(cues, 'hit', -9), 0.6);
          const ba = atOr(cues, 'belt', dur * 0.45), bp = clamp01((lt - ba) / 0.7);
          const cx = (P.x ?? 0.42) * W, cy = floorY + 30 + Math.sin(t * 0.7) * 3;
          const jp = jarPaths(cx, cy, size * lerp(0.7, 1, ent) * (1 + hit * 0.06), (P.tilt ?? -8) + Math.sin(t * 0.6) * 1.2, sd + 10, t);
          jF.setAttribute('d', jp.fill); jI.setAttribute('d', jp.ink); jS.setAttribute('d', jp.soft);
          jB.setAttribute('d', jp.band); jB.setAttribute('fill-opacity', (0.55 * bp).toFixed(3));
          // red ring round the belt + note with arrow
          const J = jp.J, [bx, by] = J.Q(0, -76);
          if (lt >= ba) {
            const rp = [], n = 32;
            for (let i = 0; i <= Math.round(n * 1.1 * bp); i++) { const a = -2.6 + i / n * 6.2832; rp.push([bx + Math.cos(a) * 92 * size * (1 + i / n * 0.05), by + Math.sin(a) * 30 * size]); }
            ring.setAttribute('d', rp.length > 1 ? inkPath(rp, { seed: sd + 50, t, w: 10 }) : '');
            const np = spring(lt, ba + 0.4, 0.6), nx = P.note_x != null ? P.note_x * W : W * 0.5, ny = P.note_y != null ? P.note_y * H : floorY - 210 * size - 70;
            note.setAttribute('x', nx); note.setAttribute('y', ny);
            note.style.display = lt < ba + 0.4 ? 'none' : '';
            note.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) scale(${lerp(0.6, 1, np).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
            const ap = clamp01((lt - ba - 0.5) / 0.5), ax0 = nx, ay0 = ny + 24, ax1 = bx + 60 * size, ay1 = by - 34 * size;
            arrow.setAttribute('d', ap > 0 ? inkPath([[ax0, ay0], [lerp(ax0, ax1, ap * 0.5) + 30, lerp(ay0, ay1, ap * 0.5)], [lerp(ax0, ax1, ap), lerp(ay0, ay1, ap)]], { seed: sd + 60, t, w: 7 }) +
              (ap >= 1 ? ' ' + inkPath([[ax1 - 30, ay1 - 22], [ax1, ay1], [ax1 - 4, ay1 - 36]], { seed: sd + 61, t, w: 7 }) : '') : '');
          } else { ring.setAttribute('d', ''); arrow.setAttribute('d', ''); note.style.display = 'none'; }
          updateLabel(label, W, H, lt, t, cues, dur, sd);
          updateCast(cast, W, H, lt, t, cues, true);
          bubbles(E, cast.filter(c => c.c.bubbles !== false).map(c => [c.c._head[0] + 30 * (c.c.face === 'left' ? -1 : 1), c.c._head[1]]), t, sd, 0);
        },
      };
    },
  };

  // ================================================================ kk_egypt
  SH.kk_egypt = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, hz = (P.horizon ?? 0.5) * H;
      const cam = el(svg, 'g');
      const sun = mk(cam, INK.gold, { 'fill-opacity': 0.55 }), sunI = mk(cam), haze = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });
      const pyrF = mk(cam, INK.paperLight), pyrS = mk(cam, INK.paperDark), pyrI = mk(cam), pyrH = mk(cam, INK.inkSoft, { 'fill-opacity': 0.75 });
      const ramp = mk(cam, INK.stain, { 'fill-opacity': 0.55 }), rampI = mk(cam);
      const work = mk(cam), block = mk(cam, INK.paperDark), blockI = mk(cam);
      const sandF = mk(cam, INK.paperDark, { 'fill-opacity': 0.55 }), sandI = mk(cam), dunes = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });
      const jF = mk(cam, INK.paperLight), jI = mk(cam), jS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const castG = el(cam, 'g');
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);
      const r0 = rng(seed * 5 + 2);
      const hz2 = Array.from({ length: 8 }, () => ({ x: r0() * W, y: hz - 30 - r0() * 160, w: 80 + r0() * 120, v: 8 + r0() * 10 }));
      // pyramids: [cx, base half-width, height, finished 0..1]
      const pyrs = portrait
        ? [[0.24, 170, 230, 1], [0.66, 300, 420, 0.72], [0.93, 120, 160, 1]]
        : [[0.3, 170, 230, 1], [0.6, 300, 420, 0.72], [0.82, 120, 160, 1]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t, env);
          const sx = W * 0.82, sy = hz - (portrait ? 560 : 300) + Math.sin(t * 0.4) * 4;
          sun.setAttribute('d', inkLoop(circ(sx, sy, 70, 16), { seed: sd + 1, t }));
          let rays = inkPath(circ(sx, sy, 70, 16), { seed: sd + 1, t, closed: true, w: 5 });
          for (let i = 0; i < 10; i++) { const a = i / 10 * 6.2832 + t * 0.15, r1 = 96, r2 = 130 + Math.sin(t * 3 + i) * 8; rays += ' ' + inkPath([[sx + Math.cos(a) * r1, sy + Math.sin(a) * r1], [sx + Math.cos(a) * r2, sy + Math.sin(a) * r2]], { seed: sd + 10 + i, t, w: 5 }); }
          sunI.setAttribute('d', rays);
          haze.setAttribute('d', hz2.map((h, i) => { const x = ((h.x + t * h.v) % (W + 240)) - 120; const pts = []; for (let j = 0; j <= 4; j++) pts.push([x + j * h.w / 4, h.y + Math.sin(j * 1.4 + t * 1.3) * 4]); return inkPath(pts, { seed: sd + 30 + i, t, w: 3 }); }).join(' '));
          let pf = '', ps = '', pi = '', ph = '';
          const rise = k => spring(lt, 0.1 + k * 0.18, 0.7);
          pyrs.forEach(([ux, bw, ht, fin], k) => {
            const cx = ux * W, s = rise(k), h = ht * s, tip = hz - h;
            const topW = bw * (1 - fin);                                // unfinished: a flat top
            const yTop = fin < 1 ? hz - h * fin : tip;
            const L = [cx - bw * s, hz], R = [cx + bw * s, hz], TL = [cx - topW * s, yTop], TR = [cx + topW * s, yTop];
            const shape = fin < 1 ? [L, TL, TR, R] : [L, [cx, tip], R];
            pf += inkLoop(shape, { seed: sd + 40 + k, t, smooth: false }) + ' ';
            const shadeP = fin < 1 ? [[cx + 30 * s, yTop], TR, R, [cx + 40 * s, hz]] : [[cx, tip], R, [cx + 30 * s, hz]];
            ps += inkLoop(shadeP, { seed: sd + 45 + k, t, smooth: false }) + ' ';
            pi += inkPath(shape, { seed: sd + 40 + k, t, closed: true, w: 6, smooth: false }) + ' ';
            const rows = Math.round(h / 34);                            // block courses
            for (let r = 1; r < rows; r++) {
              const y = hz - r * 34; if (y < yTop + 6) break;
              const half = lerp(bw * s, fin < 1 ? topW * s : 0, (hz - y) / Math.max(1, hz - (fin < 1 ? yTop : tip)) * (fin < 1 ? 1 : 1));
              ph += inkPath([[cx - half + 8, y], [cx + half - 8, y]], { seed: sd + 60 + k * 30 + r, t, w: 2.5 }) + ' ';
            }
            if (fin < 1) {                                              // mud-brick ramp up the left face + workers hauling a block
              const rp = [[cx - bw * s - 160, hz], [TL[0] + 20, yTop + 4], [TL[0] + 80, yTop + 4], [cx - bw * s - 60, hz]];
              ramp.setAttribute('d', inkLoop(rp, { seed: sd + 90, t, smooth: false }));
              rampI.setAttribute('d', inkPath(rp, { seed: sd + 90, t, closed: true, w: 5, smooth: false }));
              const u = (t * 0.06) % 1, bx = lerp(cx - bw * s - 110, TL[0] + 50, u), by = lerp(hz - 6, yTop + 2, u);
              const bl = [[bx - 26, by - 30], [bx + 26, by - 30], [bx + 26, by], [bx - 26, by]];
              block.setAttribute('d', inkLoop(bl, { seed: sd + 95, t, smooth: false }));
              blockI.setAttribute('d', inkPath(bl, { seed: sd + 95, t, closed: true, w: 4, smooth: false }) + ' ' + inkPath([[bx + 26, by - 14], [bx + 70, by - 14 - 70 * (TL[1] - hz) / (TL[0] - cx + bw * s + 110) * -0.5]], { seed: sd + 96, t, w: 3 }));
              let wk = '';
              for (let i = 0; i < 4; i++) {                             // tiny stick workers pulling the rope
                const wu = Math.min(1, u + 0.05 + i * 0.035), wx = lerp(cx - bw * s - 110, TL[0] + 50, wu), wy = lerp(hz - 6, yTop + 2, wu), sw = Math.sin(t * 6 + i * 1.7) * 6;
                wk += inkPath([[wx, wy], [wx + 4, wy - 26]], { seed: sd + 100 + i, t, w: 4 }) + ' ' + inkDot(wx + 6, wy - 34, 7, 7, seed + 100 + i, t) + ' ' +
                  inkPath([[wx - 6 + sw, wy + 2], [wx, wy - 4], [wx + 6 - sw, wy + 2]], { seed: sd + 110 + i, t, w: 3 }) + ' ' + inkPath([[wx + 2, wy - 18], [wx + 16, wy - 22]], { seed: sd + 120 + i, t, w: 3 }) + ' ';
              }
              work.setAttribute('d', wk);
            }
          });
          pyrF.setAttribute('d', pf); pyrS.setAttribute('d', ps); pyrI.setAttribute('d', pi); pyrH.setAttribute('d', ph);
          // desert floor
          const sf = []; for (let i = 0; i <= 14; i++) { const x = -80 + i * (W + 160) / 14; sf.push([x, hz + Math.sin(i * 1.3) * 6]); }
          sandF.setAttribute('d', inkLoop(sf.concat([[W + 80, H + 60], [-80, H + 60]]), { seed: sd + 130, t, smooth: false }));
          sandI.setAttribute('d', inkPath(sf, { seed: sd + 131, t, w: 6 }));
          dunes.setAttribute('d', [0, 1, 2, 3].map(k => inkPath([[40 + k * 290, hz + 110 + (k % 2) * 90], [140 + k * 290, hz + 90 + (k % 2) * 90], [240 + k * 290, hz + 112 + (k % 2) * 90]], { seed: sd + 140 + k, t, w: 3 })).join(' '));
          // the jar in the foreground
          if (P.jar !== false) {
            const Jp = P.jar || {}, at = atOr(cues, Jp.at, 0.3), p = spring(lt, at, 0.6);
            if (p > 0.02) {
              const jp = jarPaths((Jp.x ?? 0.2) * W, (Jp.y ?? 0.7) * H, (Jp.size ?? 1.6) * p * (1 + punch(lt, at, 0.5) * 0.1), -4 + Math.sin(t * 0.8) * 1.5, sd + 160, t);
              jF.setAttribute('d', jp.fill); jI.setAttribute('d', jp.ink); jS.setAttribute('d', jp.soft);
            } else { jF.setAttribute('d', ''); jI.setAttribute('d', ''); jS.setAttribute('d', ''); }
          }
          updateLabel(label, W, H, lt, t, cues, dur, sd);
          updateCast(cast, W, H, lt, t, cues, false);
        },
      };
    },
  };
})();
