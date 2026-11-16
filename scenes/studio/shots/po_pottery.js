// po_pottery: shots for the Stickstory Short "pottery is older than farming" (2026-11-16). Broken pottery from
// Xianrendong Cave (Jiangxi, southern China) dates to about 20,000 years ago (Wu et al., Science, 2012): Ice Age
// hunter-gatherers made it about 10,000 years before farming, and scorch / soot marks on the outside suggest cooking.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any "Stone Age cave / dig / ice / first farm" story.
// Uses bb__lib.js (BBL.labels) and lh__lib.js (LH.kasif, LH.person) read-only.
//
// Common P: labels: [{text, x, y (0..1), at, size, color, font, rot, stamp}] (BBL.labels),
//   kasif: {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | absent
//
// SHOTS.po_cave — inside a rock shelter looking out: a rock arch frames the snowy Ice Age world (the set shows through
//   the opening; snow drifts down inside it), a stone-ringed fire on the cave floor, a round-bottomed, cord-marked clay
//   pot, shells and bones on the floor, big boulders in the foreground down to the frame bottom.
//   P: {mode: "hook"|"lift"|"cook"|"end", gy: 1120 (cave floor line, px), arch: {x0: 150, x1: 930, top: 400},
//   pot: {x: 0.5, s: 1, soot: 0..1, steam: true | number (stroke thickness factor), boil: false, on: true (sits in the fire)} | false,
//   fire: {x: 0.5, s: 1} | false, hunters: [{x, s: 1, face, pose: "idle"|"sit"|"hold"|"point", dir, stir: true,
//   carry: true (holds the pot, straining), emotion}], kasif, labels}   cues: hit (punch)
// SHOTS.po_dig — an excavation inside the cave: rock wall and a hanging work lamp at the top, a trench face with
//   coloured soil layers, a string grid with pegs, sherds in a deep layer (the oldest one rings red at cue "find"),
//   an archaeologist brushing at it, buckets, a sieve, sample bags and a trowel in the foreground.
//   P: {gy: 1150, top: 560 (trench top), find: cue, person: {x: 0.72, s: 1.15, kneel: false} | false, labels}
// SHOTS.po_ice — the Ice Age outside: a glacier wall on the horizon, blowing snow, drifts and rocks in the foreground.
//   P: {mode: "glacier"|"hunters", gy: 1150, glacier: {y: 600, h: 300, strata: true}, snow: 90 (flakes), wind: 1,
//   boulder: {x: 0.5, y: 1010, rx: 330, ry: 190, tree: 0.35 (x offset in rx)} (big snow-capped boulder with icicles + a frozen dead tree) | absent,
//   hunters: [{x0, x1 (0..1), s: 0.9}] (walk across in fur coats with spears; breath puffs), labels}
// SHOTS.po_shard — close-up: one big broken sherd lying on a cloth on the finds table, cord-marked outside, black soot
//   across its lower half; at cue "scorch" the soot is ringed in red, at cue "fire" ghost flames lick up both sides.
//   A magnifying glass drifts across it; brush, tweezers, a scale ruler and a find tag below the subtitle. Laid out in
//   screen px for the close-up P.view {focus, zoom} (= the scene's camera). P: {view, cx: 540, cy: 760, rx: 430,
//   ry: 360 (sherd, screen px), labels}
// SHOTS.po_field — the first farms along the Yangtze: flooded rice terraces with seedlings, thatched huts on stilts,
//   a hatless farmer bent over planting seedlings, big ripe rice stalks in the foreground water.
//   P: {gy: 1150, horizon: 700, farmer: {x: 0.55, s: 1}, labels}
// cues: hit, find, scorch, fire + label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const fr = v => v - Math.floor(v);
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const DIRS = { up: 70, down: -38, forward: 8 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  // colours (tokens only)
  const ROCK = () => mix(INK.inkSoft, INK.stain, 0.4);
  const ROCK_D = () => mix(INK.ink, INK.inkSoft, 0.45);
  const ROCK_L = () => mix(INK.stain, INK.paperDark, 0.45);
  const CLAY = () => mix(INK.stain, INK.red, 0.28);
  const CLAY_D = () => mix(INK.stain, INK.ink, 0.4);
  const CLAY_L = () => mix(INK.stain, INK.paperLight, 0.35);
  const SOOT = () => mix(INK.ink, INK.inkSoft, 0.15);
  const FUR = () => mix(INK.stain, INK.paperDark, 0.25);
  const FUR_D = () => mix(INK.stain, INK.ink, 0.35);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.3);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const SNOW = () => INK.paperLight;
  const SNOW_S = () => mix(INK.paperLight, INK.blue, 0.28);
  const ICE = () => mix(INK.blue, INK.paperLight, 0.55);
  const ICE_D = () => mix(INK.blue, INK.ink, 0.25);
  const WHEAT = () => mix(INK.gold, INK.paperDark, 0.2);
  const WHEAT_D = () => mix(INK.gold, INK.stain, 0.5);
  const SHELL = () => mix(INK.paperLight, INK.stain, 0.25);

  // ------------------------------------------------------------------ a pen: ordered pool of filled paths
  function pen(parent, seed) {
    const g = el(parent, 'g'), pool = [];
    let i = 0, t = 0, k = 0;
    const get = () => { if (i >= pool.length) pool.push(el(g, 'path', { stroke: 'none' })); return pool[i++]; };
    const P = {
      g,
      begin(tt) { i = 0; t = tt; k = seed; },
      end() { for (let j = i; j < pool.length; j++) pool[j].setAttribute('d', ''); },
      raw(d, col, op = 1) { const e = get(); e.setAttribute('d', d); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op); },
      fill(pts, col, o = {}) { k += 3; P.raw(inkLoop(pts, { seed: k, t, smooth: !!o.smooth, amp: o.amp ?? 1 }), col, o.op ?? 1); },
      line(pts, w, col = INK.ink, o = {}) { k += 3; P.raw(inkPath(pts, { w, seed: k, t, closed: !!o.closed, smooth: o.smooth ?? true, amp: o.amp ?? 1, taper: o.taper }), col, o.op ?? 1); },
      shape(pts, col, o = {}) { P.fill(pts, col, o); if ((o.w ?? 5) > 0) P.line(pts, o.w ?? 5, o.line || INK.ink, { closed: true, smooth: !!o.smooth, amp: o.amp }); },
      circ(cx, cy, r, col, o = {}) { k += 3; if (col) P.raw(inkCircle(cx, cy, r, k, t, { fill: true, ry: o.ry }), col, o.op ?? 1); if ((o.w ?? 5) > 0) P.raw(inkCircle(cx, cy, r, k + 1, t, { w: o.w ?? 5, ry: o.ry }), o.line || INK.ink, o.lop ?? 1); },
      dot(cx, cy, rx, ry, col = INK.ink, op = 1) { k += 3; P.raw(inkDot(cx, cy, rx, ry, k, t), col, op); },
      get t() { return t; },
    };
    return P;
  }
  const labelsOf = (root, list, W, H, sd) => window.BBL ? window.BBL.labels(el(root, 'g'), list || [], W, H, sd) : { update() {} };
  const kasifOf = (root, K, W, H, sd) => K && window.LH ? window.LH.kasif(el(root, 'g'), K, W, H, sd) : null;
  const zoomAt = (root, hit, W, H, cy) => root.setAttribute('transform', hit ? `translate(${W / 2} ${cy}) scale(${f1((1 + 0.05 * hit) * 1000) / 1000}) translate(${-W / 2} ${-cy})` : '');

  // ------------------------------------------------------------------ the pot: deep, round-bottomed, cord-marked
  // (cx, by) = bottom centre; ~300 s tall, ~250 s wide. o: {soot 0..1, steam, boil, tilt (rad), t}
  const POT = [[-0.42, -1], [-0.38, -0.92], [-0.46, -0.7], [-0.5, -0.45], [-0.45, -0.2], [-0.3, -0.04], [0, 0.01], [0.3, -0.04], [0.45, -0.2], [0.5, -0.45], [0.46, -0.7], [0.38, -0.92], [0.42, -1]];
  function pot(pn, cx, by, s, lt, o = {}) {
    const t = pn.t, H = 300 * s, Wd = 250 * s, a = o.tilt || 0, c = Math.cos(a), sn = Math.sin(a);
    const T = q => { const x = q[0] * Wd, y = q[1] * H; return [cx + x * c - y * sn, by + x * sn + y * c]; };
    const body = POT.map(T);
    pn.fill(body, CLAY(), { smooth: true, amp: 0.7 });
    // cord marks: short slanted strokes in rows
    for (let r = 0; r < 6; r++) {
      const yy = -0.86 + r * 0.13, half = 0.42 - Math.abs(yy + 0.5) * 0.25;
      for (let k = 0; k < 7; k++) {
        const xx = -half + (k + 0.5) / 7 * half * 2;
        pn.line([T([xx - 0.025, yy - 0.04]), T([xx + 0.025, yy + 0.04])], Math.max(2.5, 4 * s), CLAY_D(), { op: 0.7, amp: 0.5 });
      }
    }
    // soot over the lower part (jagged top edge)
    const so = o.soot ?? 0;
    if (so > 0) {
      const top = [];
      for (let k = 0; k <= 10; k++) { const xx = -0.49 + k * 0.098; top.push([xx * (k === 0 || k === 10 ? 0.98 : 1), -0.42 + (hn(k, 3) - 0.5) * 0.14 - Math.sin(k * 1.3) * 0.04]); }
      const low = [[0.45, -0.2], [0.3, -0.04], [0, 0.01], [-0.3, -0.04], [-0.45, -0.2]];
      pn.fill(top.concat(low).map(T), SOOT(), { smooth: true, amp: 0.8, op: 0.85 * so });
      for (let k = 0; k < 5; k++) pn.dot(...T([-0.3 + k * 0.15, -0.5 - hn(k, 9) * 0.12]), 9 * s, 6 * s, SOOT(), 0.6 * so);
    }
    pn.line(body, Math.max(4, 6 * s), INK.ink, { closed: false, amp: 0.7 });
    // rim + opening
    const rc = T([0, -1]);
    pn.circ(rc[0], rc[1], Wd * 0.42, mix(INK.ink, CLAY_D(), 0.3), { ry: 22 * s, w: Math.max(4, 6 * s) });
    if (o.boil) {
      pn.circ(rc[0], rc[1] + 3 * s, Wd * 0.34, mix(INK.paperLight, INK.stain, 0.45), { ry: 15 * s, w: 0 });
      for (let k = 0; k < 4; k++) { const q = fr(lt * 1.3 + k * 0.27), bx = rc[0] + (hn(k, 5) - 0.5) * Wd * 0.5; pn.circ(bx, rc[1] - q * 8 * s, (5 + q * 9) * s, null, { w: 2.5, line: INK.inkSoft }); }
    }
    if (o.steam) {
      const sw = typeof o.steam === 'number' ? o.steam : 1;
      for (let k = 0; k < 3; k++) {
        const q = fr(lt * 0.45 + k / 3), x = rc[0] + (k - 1) * 40 * s + Math.sin(q * 6 + k) * 22 * s, y0 = rc[1] - 30 * s - q * 240 * s;
        const sp = [[x, y0], [x + 18 * s, y0 - 50 * s], [x - 8 * s, y0 - 100 * s]];
        pn.line(sp, Math.max(7, 12 * s * sw * (1 - q * 0.5)), INK.inkSoft, { op: Math.min(1, 0.55 * sw) * (1 - q) });
        pn.line(sp, Math.max(4, 7 * s * sw * (1 - q * 0.5)), INK.paperLight, { op: 0.95 * (1 - q) });
      }
    }
    return { rim: rc, H, Wd };
  }

  // ------------------------------------------------------------------ fire: stone ring, logs, flames, sparks
  function fire(pn, cx, gy, s, lt) {
    const t = pn.t;
    for (let k = 0; k < 3; k++) pn.circ(cx, gy + 4, (150 + k * 60) * s, INK.gold, { ry: (34 + k * 14) * s, w: 0, op: 0.16 - k * 0.04 });
    pn.line([[cx - 130 * s, gy + 6], [cx + 120 * s, gy - 22 * s]], 24 * s, WOOD_D());
    pn.line([[cx - 110 * s, gy - 22 * s], [cx + 140 * s, gy + 4]], 22 * s, WOOD());
    for (let i = 0; i < 6; i++) {
      const fx = cx + (i - 2.5) * 38 * s, hgt = (110 + 50 * Math.sin(t * 9 + i * 1.7) + 30 * hn(i, 3)) * s;
      const fl = [[fx - 28 * s, gy - 12 * s], [fx - 16 * s, gy - 12 * s - hgt * 0.6], [fx + Math.sin(t * 13 + i) * 12 * s, gy - 12 * s - hgt], [fx + 16 * s, gy - 12 * s - hgt * 0.6], [fx + 28 * s, gy - 12 * s]];
      pn.fill(fl, i % 2 ? INK.gold : mix(INK.red, INK.gold, 0.4), { smooth: true });
    }
    for (let i = 0; i < 12; i++) {   // sparks rising
      const q = fr(lt * 0.7 + i / 12), x = cx + (hn(i, 4) - 0.5) * 200 * s + Math.sin(q * 7 + i) * 20 * s;
      pn.dot(x, gy - 120 * s - q * 380 * s, 5 * s * (1 - q) + 1.5, 5 * s * (1 - q) + 1.5, INK.gold, 1 - q);
    }
    for (let i = 0; i < 9; i++) {   // stone ring (front stones over the logs)
      const a = Math.PI * (0.05 + 0.9 * i / 8);
      pn.circ(cx + Math.cos(a) * 190 * s, gy + Math.sin(a) * 26 * s + 6, (34 + hn(i, 7) * 12) * s, ROCK(), { ry: (22 + hn(i, 8) * 6) * s, w: 4 });
    }
  }

  // ------------------------------------------------------------------ Ice Age hunter: hatless rig + fur hood + fur coat
  function hunter(parent, sd) {
    const g = el(parent, 'g');
    const back = el(g, 'g'), rg = el(g, 'g'), front = el(g, 'g');
    const hoodF = inkEl(back, FUR()), hoodR = inkEl(back);
    const rig = KASIF.create(rg, { scale: 1, hat: false, seed: sd });
    const coatF = inkEl(front, FUR()), coatR = inkEl(front), fringe = inkEl(front, FUR_D()), spear = inkEl(front), tip = inkEl(front, INK.inkSoft);
    function update(t, x, y, S, pose, o = {}) {
      const face = o.face ?? 1;
      const res = rig.update(t, pose, Object.assign({ x, y, face, scale: S, since: o.since ?? 1, dir: o.dir ?? 0, emotion: o.emotion || null, mouth: 0, ph: o.ph ?? 0 }, o.extra || {})) || {};
      const W2 = q => [x + face * S * q[0], y + S * q[1]];
      const hc = res.head ? W2(res.head) : [x, y - 400 * S];
      const hp = inkEllipsePts(hc[0], hc[1] + 4 * S, 92 * S, 96 * S, sd + 1, 14);
      hoodF.setAttribute('d', inkLoop(hp, { seed: sd + 1, t, amp: 0.9 }));
      let hd = inkPath(hp, { seed: sd + 2, t, w: 5, closed: true, amp: 0.9 });
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r0 = 90 * S, r1 = 108 * S; hd += ' ' + inkPath([[hc[0] + Math.cos(a) * r0, hc[1] + 4 * S + Math.sin(a) * r0], [hc[0] + Math.cos(a + 0.12) * r1, hc[1] + 4 * S + Math.sin(a + 0.12) * r1]], { seed: sd + 20 + k, t, w: 3.5, amp: 0.6 }); }
      hoodR.setAttribute('d', hd);
      const hip = res.hip ? W2(res.hip) : [x, y - 184 * S];
      const top = hc[1] + 74 * S, bot = hip[1] + 90 * S, sw = Math.sin(t * 1.6) * 3 * S;
      const pts = [[hip[0] - 50 * S, top], [hip[0] + 50 * S, top], [hip[0] + 70 * S, hip[1] - 20 * S], [hip[0] + 84 * S + sw, bot], [hip[0] - 84 * S + sw, bot], [hip[0] - 70 * S, hip[1] - 20 * S]];
      coatF.setAttribute('d', inkLoop(pts, { seed: sd + 5, t, amp: 1 }));
      coatR.setAttribute('d', inkPath(pts, { seed: sd + 6, t, w: 5.5, closed: true, amp: 1 }) + ' ' +
        inkPath([[hip[0] - 66 * S, hip[1] - 12 * S], [hip[0] + 66 * S, hip[1] - 12 * S]], { seed: sd + 7, t, w: 6, amp: 0.8 }));
      let fd = '';
      for (let k = 0; k < 9; k++) { const fx = hip[0] - 80 * S + sw + k * 20 * S; fd += ' ' + inkPath([[fx, bot - 4], [fx + 4 * S, bot + 22 * S]], { seed: sd + 40 + k, t, w: 6 * S + 2, amp: 0.5 }); }
      fringe.setAttribute('d', fd);
      const hands = (res.hands || []).map(W2);
      if (o.spear && hands.length) {
        const h = hands.reduce((a, b) => (b[0] - a[0]) * face > 0 ? b : a);
        const p0 = [h[0] - face * 30 * S, h[1] + 170 * S], p1 = [h[0] + face * 60 * S, h[1] - 330 * S];
        spear.setAttribute('d', inkPath([p0, p1], { seed: sd + 8, t, w: 8 * S + 2, amp: 0.6 }));
        const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        tip.setAttribute('d', inkLoop([[p1[0] - uy * 14 * S, p1[1] + ux * 14 * S], [p1[0] + ux * 60 * S, p1[1] + uy * 60 * S], [p1[0] + uy * 14 * S, p1[1] - ux * 14 * S]], { seed: sd + 9, t, amp: 0.6 }));
      } else { spear.setAttribute('d', ''); tip.setAttribute('d', ''); }
      return { head: hc, hands, hip };
    }
    return { update };
  }

  // little props on a cave floor
  function shell(pn, x, y, r, rot) {
    const pts = []; for (let k = 0; k <= 8; k++) { const a = Math.PI * (k / 8); pts.push([x + Math.cos(a + rot) * r, y - Math.sin(a) * r * 0.8]); }
    pn.shape(pts, SHELL(), { w: 3, smooth: true });
    for (let k = 1; k < 4; k++) { const a = Math.PI * k / 4; pn.line([[x, y], [x + Math.cos(a + rot) * r * 0.9, y - Math.sin(a) * r * 0.7]], 2.2, INK.inkSoft); }
  }
  function bone(pn, x, y, L, rot) {
    const c = Math.cos(rot), s = Math.sin(rot), a = [x - c * L / 2, y - s * L / 2], b = [x + c * L / 2, y + s * L / 2];
    pn.line([a, b], 14, SHELL());
    [a, b].forEach(p => { pn.circ(p[0] - s * 8, p[1] + c * 8, 10, SHELL(), { w: 3 }); pn.circ(p[0] + s * 8, p[1] - c * 8, 10, SHELL(), { w: 3 }); });
    pn.line([a, b], 3, INK.inkSoft, { op: 0.6 });
  }
  function boulder(pn, cx, cy, rx, ry, seed, col) {
    const pts = inkEllipsePts(cx, cy, rx, ry, seed, 11, 0, 0.12);
    pn.shape(pts, col || ROCK(), { w: 6, smooth: true });
    for (let k = 0; k < 4; k++) pn.line([[cx - rx * 0.6 + k * rx * 0.3, cy - ry * 0.5], [cx - rx * 0.5 + k * rx * 0.3, cy + ry * 0.3]], 3, INK.ink, { op: 0.35 });
  }
  // falling snow inside a box; wind pushes it sideways
  function snowfall(pn, lt, n, x0, x1, y0, y1, wind, seed, size = 1) {
    for (let i = 0; i < n; i++) {
      const sp = 0.12 + 0.12 * hn(i, seed), q = fr(lt * sp + hn(i, seed + 1));
      const y = lerp(y0, y1, q), x = x0 + fr(hn(i, seed + 2) + q * 0.35 * wind) * (x1 - x0) + Math.sin(lt * 2 + i) * 10;
      const r = (4 + 6 * hn(i, seed + 3)) * size;
      pn.dot(x, y, r, r, SNOW(), 0.95);
    }
  }

  // ================================================================== po_cave
  SH.po_cave = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5101;
      const mode = P.mode || 'hook', gy = P.gy ?? 1120;
      const A = Object.assign({ x0: 150, x1: 930, top: 400 }, P.arch || {});
      const out = pen(el(root, 'g'), sd), rock = pen(el(root, 'g'), sd + 50), floor = pen(el(root, 'g'), sd + 80);
      const mid = pen(el(root, 'g'), sd + 100);
      const castG = el(root, 'g');
      const HU = (P.hunters || []).map((h, i) => ({ h, r: hunter(castG, sd + 30 + i * 9) }));
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const front = pen(el(root, 'g'), sd + 200), fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const PO = P.pot === false ? null : Object.assign({ x: 0.5, s: 1, soot: 0.6, steam: true, boil: false, on: true }, P.pot || {});
      const FI = P.fire === false ? null : Object.assign({ x: 0.5, s: 1 }, P.fire || {});
      // the arch opening (stage px), bottom on the floor line
      const arch = []; for (let k = 0; k <= 16; k++) { const a = Math.PI * (1 - k / 16), r = 1 + 0.06 * Math.sin(k * 2.1) + 0.04 * hn(k, 5);
        arch.push([(A.x0 + A.x1) / 2 + Math.cos(a) * (A.x1 - A.x0) / 2 * r, gy - Math.sin(a) * (gy - A.top) * Math.pow(r, 0.5)]); }
      const floorStuff = Array.from({ length: 14 }, (_, i) => [lerp(40, W - 40, hn(i, 61)), lerp(gy + 40, gy + 170, hn(i, 62)), i]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [out, rock, floor, mid, front, fg].forEach(p => p.begin(t));
          const hit = punch(lt, atOr(cues, 'hit', null));
          // outside: snow drifting down inside the opening only
          snowfall(out, lt, P.snow ?? 40, A.x0 + 30, A.x1 - 30, A.top + 40, gy - 20, 0.6, 11, P.snowSize ?? 0.9);
          // rock around the opening: one C-shaped polygon (frame edges + the arch)
          const C = [[-60, gy + 30], [-60, -60], [W + 60, -60], [W + 60, gy + 30]].concat(arch.slice().reverse());
          rock.shape(C, ROCK(), { w: 7, smooth: false, amp: 1.2 });
          for (let k = 0; k < 16; k++) {   // cracks + strata on the rock
            const x = hn(k, 71) * W, y = 60 + hn(k, 72) * (gy - 100);
            const inside = x > A.x0 - 30 && x < A.x1 + 30 && y > A.top - 40;
            if (!inside) rock.line([[x - 60, y], [x - 10, y + 14], [x + 50, y + 4]], 4, ROCK_D(), { op: 0.7 });
          }
          for (let k = 0; k < 6; k++) {   // stalactites along the arch top
            const p = arch[4 + k], L = 40 + hn(k, 74) * 60;
            rock.fill([[p[0] - 18, p[1] - 10], [p[0] + 18, p[1] - 10], [p[0] + 2, p[1] + L]], ROCK(), { smooth: false });
            rock.line([[p[0] - 18, p[1] - 6], [p[0] + 2, p[1] + L], [p[0] + 18, p[1] - 6]], 4, INK.ink);
          }
          // cave floor (down to the frame bottom)
          floor.shape([[-60, gy - 6], [W + 60, gy - 6], [W + 60, H + 60], [-60, H + 60]], ROCK_L(), { w: 6, smooth: false });
          for (let k = 0; k < 8; k++) floor.line([[-20, gy + 60 + k * k * 12], [W + 20, gy + 66 + k * k * 12]], 3, INK.inkSoft, { op: 0.45 });
          floorStuff.forEach(([x, y, i]) => { if (Math.abs(x - (FI ? FI.x * W : -999)) < 260) return; i % 3 ? shell(floor, x, y, 18 + hn(i, 63) * 10, hn(i, 64)) : bone(floor, x, y, 70, hn(i, 65) * 3); });
          // fire + pot
          if (FI) fire(mid, FI.x * W, gy + 40, FI.s, lt);
          let pr = null;
          if (PO && !(mode === 'lift')) {
            const by = PO.on && FI ? gy - 20 : gy + 20;
            pr = pot(mid, PO.x * W, by, PO.s, lt, { soot: PO.soot, steam: PO.steam, boil: PO.boil });
            if (PO.on && FI) for (let i = 0; i < 4; i++) {   // flames licking up the pot's sides
              const sd2 = i < 2 ? -1 : 1, fx = PO.x * W + sd2 * (40 + (i % 2) * 50) * PO.s, hgt = (90 + 40 * Math.sin(t * 10 + i * 2)) * PO.s;
              mid.fill([[fx - 20 * PO.s, gy - 10], [fx + Math.sin(t * 12 + i) * 10, gy - 10 - hgt], [fx + 20 * PO.s, gy - 10]], i % 2 ? INK.gold : mix(INK.red, INK.gold, 0.4), { smooth: true, op: 0.9 });
            }
          }
          // hunters
          HU.forEach(({ h, r }, i) => {
            const face = faceOf(h.face, 1), S = h.s ?? 1;
            let pose = h.pose || 'idle', extra = {};
            const bob = h.carry ? Math.sin(t * 2.4) * 10 : 0;
            const res = r.update(t, (h.x ?? 0.3) * W, gy + (h.dy ?? 0), S, h.carry ? 'hold' : pose, { face, dir: dirOf(h.dir ?? 20), emotion: h.emotion || (h.carry ? 'worried' : 'neutral'), spear: h.spear, extra: h.carry ? { item: 'rock' } : extra });
            if (h.carry && res.hands.length) {   // the heavy pot in his arms, sagging and swaying
              const mx = (res.hands[0][0] + res.hands[1][0]) / 2, my = Math.max(res.hands[0][1], res.hands[1][1]);
              pot(front, mx, my + 150 * S + bob, (PO ? PO.s : 0.9) * 0.95, lt, { soot: PO ? PO.soot : 0.4, tilt: Math.sin(t * 1.2) * 0.05 });
              for (let k = 0; k < 3; k++) front.line([[res.head[0] + face * (90 + k * 14) * S, res.head[1] - (60 - k * 30) * S], [res.head[0] + face * (120 + k * 16) * S, res.head[1] - (70 - k * 30) * S]], 4, INK.inkSoft, { op: 0.5 + 0.5 * Math.sin(t * 6 + k) });
            }
            if (h.stir && res.hands.length && pr) {   // stirring stick into the pot
              const hd = res.hands.reduce((a, b) => (b[0] - a[0]) * face > 0 ? b : a), st = Math.sin(t * 3);
              const tip = [pr.rim[0] - face * 30 + st * 24, pr.rim[1] + 40];
              const dx = tip[0] - hd[0], dy = tip[1] - hd[1], ln = Math.hypot(dx, dy) || 1;
              front.line([[hd[0] - dx / ln * 70, hd[1] - dy / ln * 70], tip], 11, WOOD_D());
            }
          });
          // floor props in the near band: firewood stack (left), a fur hide (right), broken sherds, a spare pot
          if (P.props !== false) {
            const fy = gy + 150;
            for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) {
              const cx = 70 + (i + r * 0.5) * 70, cy = fy + 120 - r * 56;
              front.circ(cx, cy, 34, WOOD(), { w: 5 }); front.circ(cx, cy, 16, null, { w: 2.5, line: WOOD_D() });
            }
            const hx = W - 250, hy = fy + 120;
            const hide = [[hx - 190, hy - 30], [hx - 120, hy - 90], [hx - 40, hy - 70], [hx + 40, hy - 100], [hx + 150, hy - 60], [hx + 200, hy + 10], [hx + 140, hy + 70], [hx + 30, hy + 60], [hx - 80, hy + 90], [hx - 170, hy + 50]];
            front.shape(hide, FUR(), { w: 5, smooth: true });
            for (let k = 0; k < 10; k++) front.line([[hx - 140 + k * 30, hy - 40 + (k % 3) * 20], [hx - 130 + k * 30, hy - 10 + (k % 3) * 20]], 3, FUR_D());
            for (let k = 0; k < 5; k++) front.shape(inkEllipsePts(380 + k * 70, fy + 200 + (k % 2) * 40, 30, 18, sd + 90 + k, 7, k, 0.25), CLAY(), { w: 4 });
            if (P.spare !== false) pot(front, W - 130, fy + 10, 0.5, lt, { soot: 0.5, tilt: 0.2 });
          }
          // foreground: big boulders in the bottom corners + a pile of shells
          boulder(fg, 90, H - 80, 260, 210, sd + 1, ROCK());
          boulder(fg, W - 40, H - 40, 300, 240, sd + 2, ROCK_D());
          boulder(fg, 300, H + 40, 180, 140, sd + 3, ROCK_D());
          for (let i = 0; i < 7; i++) shell(fg, 560 + i * 46 + hn(i, 81) * 20, H - 220 + hn(i, 82) * 120, 30, hn(i, 83));
          if (kas) kas.update(lt, t, cues);
          [out, rock, floor, mid, front, fg].forEach(p => p.end());
          lbs.update(lt, t, cues);
          zoomAt(root, hit, W, H, 800);
        },
      };
    },
  };

  // ================================================================== po_dig
  SH.po_dig = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5301;
      const gy = P.gy ?? 1150, top = P.top ?? 560;
      const back = pen(el(root, 'g'), sd), face = pen(el(root, 'g'), sd + 50), mid = pen(el(root, 'g'), sd + 80);
      const per = P.person === false || !window.LH ? null : window.LH.person(el(root, 'g'), 7, { kind: 'sweater', col: mix(INK.blue, INK.ink, 0.3), hair: 'dark', glasses: false });
      const fg = pen(el(root, 'g'), sd + 200);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const LAY = [[top, 0.0], [top + 90, 0.35], [top + 190, 0.12], [top + 300, 0.55], [top + 420, 0.25], [gy - 40, 0.7]];
      const sherds = [[300, top + 470, 46], [180, top + 500, 22], [470, top + 455, 26], [640, top + 360, 18], [120, top + 340, 16]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, face, mid, fg].forEach(p => p.begin(t));
          const fd = atOr(cues, P.find || 'find', dur * 0.5), hit = punch(lt, fd);
          // cave wall behind (top band) + hanging work lamp
          back.shape([[-60, -60], [W + 60, -60], [W + 60, top + 20], [-60, top + 20]], ROCK(), { w: 0 });
          for (let k = 0; k < 10; k++) { const x = hn(k, 41) * W, y = 80 + hn(k, 42) * (top - 140); back.line([[x - 70, y], [x - 10, y + 16], [x + 60, y + 4]], 4, ROCK_D(), { op: 0.7 }); }
          const lx = 0.62 * W, ly = 260 + Math.sin(t * 0.9) * 6;
          back.line([[lx - 4, -20], [lx, ly - 40]], 4);
          for (let k = 0; k < 3; k++) back.circ(lx, ly + 30, 120 + k * 80, INK.gold, { w: 0, op: 0.14 - k * 0.04 });
          back.shape([[lx - 60, ly], [lx + 60, ly], [lx + 36, ly - 46], [lx - 36, ly - 46]], mix(INK.blue, INK.ink, 0.3), { w: 5, smooth: false });
          back.circ(lx, ly + 14, 26, mix(INK.gold, INK.paperLight, 0.4), { w: 4 });
          // trench face: soil layers
          for (let i = 0; i < LAY.length; i++) {
            const y0 = LAY[i][0], y1 = i + 1 < LAY.length ? LAY[i + 1][0] : gy + 20, k = LAY[i][1];
            const col = mix(mix(INK.stain, INK.paperDark, 0.4), mix(INK.stain, INK.ink, 0.35), k);
            const wav = x => Math.sin(x * 0.012 + i * 1.7) * 10;
            const pts = [];
            for (let x = -60; x <= W + 60; x += 80) pts.push([x, y0 + wav(x)]);
            for (let x = W + 60; x >= -60; x -= 80) pts.push([x, y1 + wav(x) * (i + 1 < LAY.length ? 1 : 0)]);
            face.fill(pts, col, { smooth: false, amp: 0.8 });
            face.line(pts.slice(0, Math.ceil(pts.length / 2)), 4, INK.ink, { op: 0.6 });
            for (let j = 0; j < 6; j++) face.dot(hn(j, i * 7 + 3) * W, lerp(y0 + 20, y1 - 20, hn(j, i * 7 + 4)), 7, 5, mix(col, INK.ink, 0.3), 0.7);
          }
          // tags pinned on the layers
          [[0.88, top + 140, 'A'], [0.88, top + 250, 'B'], [0.88, top + 370, 'C']].forEach(([x, y], i) => { face.shape(rect(x * W - 30, y - 20, x * W + 30, y + 20), INK.paperLight, { w: 3, smooth: false }); face.line([[x * W - 14, y], [x * W + 14, y]], 3, INK.inkSoft); });
          // string grid + pegs along the trench top
          for (let k = 0; k < 6; k++) { const x = 60 + k * 190; face.line([[x, top - 70], [x, top + 30]], 10, WOOD_D()); }
          face.line([[40, top - 50 + Math.sin(t) * 2], [W - 40, top - 50 - Math.sin(t) * 2]], 3, INK.paperLight);
          // sherds in the deep layer
          sherds.forEach(([x, y, r], i) => {
            const pts = inkEllipsePts(x, y, r * 1.6, r, sd + i, 7, hn(i, 9) * 0.6, 0.25);
            face.shape(pts, CLAY(), { w: 4 });
            face.line([[x - r, y + r * 0.2], [x + r * 0.8, y + r * 0.4]], 5, SOOT(), { op: 0.7 });
          });
          if (lt >= fd) {   // the oldest sherd rings red
            const p = spring(lt, fd, 0.5), [x, y, r] = sherds[0], pul = 1 + 0.06 * Math.sin(t * 5);
            face.circ(x, y, r * 2.6 * p * pul, null, { w: 8, line: INK.red, ry: r * 1.9 * p * pul });
          }
          // the archaeologist kneels at the trench face and brushes the sherd
          if (per) {
            const PP = Object.assign({ x: 0.72, kneel: false, s: 1.15 }, P.person || {}), br = Math.sin(t * 6) * 18;
            const px = PP.x * W, target = [sherds[0][0] + 60 + br, sherds[0][1] - 10];
            per.update(t, px, gy + 30, PP.s, { face: -1, lean: (PP.kneel ? 34 : 14) + Math.sin(t * 1.2) * 2, seat: PP.kneel ? gy - 40 : null, armL: target,
              armR: PP.kneel ? [target[0] + 120, target[1] + 60] : [px - 120, gy - 300], look: [-8, 6], brow: lt >= fd ? 1 : 0, mouth: lt >= fd ? 0.6 : 0 });
            mid.line([[target[0] + 10, target[1] - 6], [target[0] + 70, target[1] - 40]], 9, WOOD_D());
            mid.shape(rect(target[0] - 12, target[1] - 12, target[0] + 14, target[1] + 16), mix(INK.paperLight, INK.stain, 0.4), { w: 3, smooth: false });
          }
          // foreground: trench floor, buckets, sieve, sample bags, trowel
          fg.shape([[-60, gy - 10], [W + 60, gy - 10], [W + 60, H + 60], [-60, H + 60]], mix(INK.stain, INK.paperDark, 0.25), { w: 6, smooth: false });
          for (let k = 0; k < 6; k++) fg.line([[-20, gy + 70 + k * k * 18], [W + 20, gy + 76 + k * k * 18]], 3, INK.inkSoft, { op: 0.4 });
          // bucket
          const bx = 200, byy = H - 260;
          fg.shape([[bx - 150, byy - 300], [bx + 150, byy - 300], [bx + 120, byy], [bx - 120, byy]], mix(INK.blue, INK.paperLight, 0.35), { w: 6, smooth: false });
          fg.circ(bx, byy - 300, 150, mix(INK.stain, INK.ink, 0.3), { ry: 30, w: 5 });
          fg.line([[bx - 150, byy - 300], [bx, byy - 440], [bx + 150, byy - 300]], 6);
          // sieve with sherds
          const sx = 760, sy = H - 330;
          fg.circ(sx, sy, 260, WOOD(), { ry: 80, w: 7 });
          fg.circ(sx, sy - 6, 220, mix(INK.paperDark, INK.inkSoft, 0.3), { ry: 64, w: 4 });
          for (let k = -4; k <= 4; k++) fg.line([[sx + k * 48, sy - 60 * Math.sqrt(1 - (k / 4.6) ** 2)], [sx + k * 48, sy + 52 * Math.sqrt(1 - (k / 4.6) ** 2)]], 2.5, INK.inkSoft);
          for (let k = 0; k < 4; k++) { const x = sx - 120 + k * 80 + Math.sin(t * 2 + k) * 6, y = sy - 10 + (k % 2) * 20; fg.shape(inkEllipsePts(x, y, 34, 20, sd + 70 + k, 7, k, 0.25), CLAY(), { w: 4 }); }
          // sample bags + trowel
          [[380, H - 120], [520, H - 90]].forEach(([x, y], i) => { fg.shape([[x - 70, y - 150], [x + 70, y - 150], [x + 80, y], [x - 80, y]], INK.paperLight, { w: 5, smooth: false }); fg.line([[x - 50, y - 100], [x + 40, y - 104]], 4, INK.red); });
          fg.shape([[W - 280, H - 110], [W - 120, H - 170], [W - 90, H - 120], [W - 250, H - 60]], mix(INK.inkSoft, INK.paperLight, 0.3), { w: 5, smooth: false });
          fg.line([[W - 100, H - 145], [W - 10, H - 190]], 22, WOOD_D());
          [back, face, mid, fg].forEach(p => p.end());
          lbs.update(lt, t, cues);
          zoomAt(root, hit, W, H, 900);
        },
      };
    },
  };

  // ================================================================== po_ice
  SH.po_ice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5501;
      const mode = P.mode || 'glacier', gy = P.gy ?? 1150;
      const G = Object.assign({ y: 600, h: 300 }, P.glacier || {});
      const far = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 50);
      const castG = el(root, 'g');
      const HU = (P.hunters || []).map((h, i) => ({ h, r: hunter(castG, sd + 30 + i * 9) }));
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const air = pen(el(root, 'g'), sd + 150), fg = pen(el(root, 'g'), sd + 200), air2 = pen(el(root, 'g'), sd + 250);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [far, mid, air, fg, air2].forEach(p => p.begin(t));
          const hit = punch(lt, atOr(cues, 'hit', null));
          // glacier wall on the horizon: blocky ice cliffs with crevasses
          const g0 = G.y, gh = G.h;
          const prof = []; for (let k = 0; k <= 14; k++) { const x = -60 + k * (W + 120) / 14; prof.push([x, g0 - gh * (0.55 + 0.45 * hn(k, 21)) + (k % 2 ? 26 : 0)]); }
          const cliff = prof.concat([[W + 60, g0 + 80], [-60, g0 + 80]]);
          far.shape(cliff, ICE(), { w: 6, smooth: false });
          // shaded cliff faces between the peaks + deep blue crevasses + horizontal strata + a snow cap
          prof.forEach(([x, y], k) => { if (k < 14) { const [x2, y2] = prof[k + 1]; if (k % 2) far.fill([[x, y], [x2, y2], [x2 - 20, g0 + 70], [x + 10, g0 + 70]], ICE_D(), { smooth: false, op: 0.35 }); } });
          prof.forEach(([x, y], k) => { if (k && k < 14) { const bx = x + (hn(k, 22) - 0.5) * 40; far.fill([[x - 10, y + 20], [x + 10, y + 20], [bx + 4, g0 + 60], [bx - 4, g0 + 60]], ICE_D(), { smooth: false, op: 0.85 }); } });
          if (G.strata !== false) for (let k = 1; k < 5; k++) { const y = g0 - gh * 0.08 * k * 1.6; far.line([[-40, y + 40], [W * 0.5, y + 30 + (k % 2) * 16], [W + 40, y + 44]], 3, ICE_D(), { op: 0.45 }); }
          far.fill(prof.concat(prof.slice().reverse().map(([x, y], k) => [x, y + 26 + 14 * Math.sin(k * 1.7)])), SNOW(), { smooth: false, amp: 0.6 });
          for (let k = 0; k < 8; k++) far.line([[hn(k, 23) * W, g0 - 40 - hn(k, 24) * 80], [hn(k, 23) * W + 80, g0 - 30 - hn(k, 24) * 80]], 3, INK.paperLight, { op: 0.9 });
          // snowfield between glacier and the walkers: soft rolls
          mid.fill([[-60, g0 + 60], [W * 0.3, g0 + 30], [W * 0.7, g0 + 70], [W + 60, g0 + 40], [W + 60, gy + 30], [-60, gy + 30]], SNOW(), { smooth: true, amp: 0.6 });
          for (let k = 0; k < 6; k++) mid.line([[-20 + k * 200, g0 + 140 + (k % 3) * 90], [140 + k * 200, g0 + 150 + (k % 3) * 90]], 3, SNOW_S(), { op: 0.9 });
          // a few dark dead pines far left / right
          [[90, g0 + 120, 1], [980, g0 + 110, 0.8], [190, g0 + 150, 0.7]].forEach(([x, y, s]) => {
            mid.line([[x, y + 10], [x, y - 230 * s]], 7 * s + 2, ROCK_D());
            for (let k = 0; k < 5; k++) { const yy = y - 40 * s - k * 40 * s, L = (80 - k * 12) * s; mid.line([[x - L, yy + 16 * s], [x, yy], [x + L, yy + 16 * s]], 5 * s + 1.5, ROCK_D()); }
          });
          // one big snow-capped boulder with icicles and a frozen dead tree (middle third)
          if (P.boulder) {
            const B = Object.assign({ x: 0.5, y: 1010, rx: 330, ry: 190 }, P.boulder), bx = B.x * W, by = B.y;
            mid.circ(bx + 30, by + B.ry * 0.8, B.rx * 1.05, SNOW_S(), { ry: 40, w: 0, op: 0.8 });
            boulder(mid, bx, by, B.rx, B.ry, sd + 61, ROCK());
            const cap = []; for (let k = 0; k <= 12; k++) { const a = Math.PI * (1 - k / 12); cap.push([bx + Math.cos(a) * B.rx * 1.02, by - Math.sin(a) * B.ry * 1.02]); }
            for (let k = 12; k >= 0; k--) { const a = Math.PI * (1 - k / 12); cap.push([bx + Math.cos(a) * B.rx * 0.9, by - Math.sin(a) * B.ry * 0.62 + 18 * Math.sin(k * 2.1)]); }
            mid.shape(cap, SNOW(), { w: 5, smooth: true });
            for (let k = 0; k < 7; k++) { const x = bx - B.rx * 0.75 + k * B.rx * 0.25, y = by - B.ry * 0.25 + Math.abs(k - 3) * 22, L = 40 + hn(k, 66) * 50; mid.shape([[x - 12, y], [x + 12, y], [x, y + L]], ICE(), { w: 3, smooth: false }); }
            const tx = bx + B.rx * (B.tree ?? 0.35), ty = by - B.ry * 0.8, sw = Math.sin(t * 1.8) * 6;
            mid.line([[tx, ty + 20], [tx + 6, ty - 220], [tx + 14 + sw, ty - 360]], 14, ROCK_D());
            [[0.35, -1, 120], [0.55, 1, 110], [0.75, -1, 80]].forEach(([q, sd2, L]) => { const y = ty - 360 * q; mid.line([[tx + 8, y], [tx + 8 + sd2 * L * 0.6 + sw, y - L * 0.5], [tx + 8 + sd2 * L + sw, y - L * 0.6]], 8, ROCK_D()); mid.line([[tx + 8 + sd2 * L * 0.4, y - L * 0.35], [tx + 8 + sd2 * L + sw, y - L * 0.65]], 6, SNOW()); });
          }
          // footprints trail
          if (mode === 'hunters') for (let k = 0; k < 14; k++) mid.dot(-20 + k * 60, gy + 14 + (k % 2) * 12, 14, 6, SNOW_S(), 0.9);
          // hunters walking across
          HU.forEach(({ h, r }, i) => {
            const S = h.s ?? 0.9, x0 = (h.x0 ?? 0.1) * W, x1 = (h.x1 ?? 0.6) * W;
            const u = clamp01(lt / Math.max(1, dur)), x = lerp(x0, x1, u), face = x1 >= x0 ? 1 : -1;
            const ph = Math.abs(x - x0) / (gait * S);
            const res = r.update(t, x, gy + (h.dy ?? 0), S, 'walk', { face, ph, spear: true });
            const q = fr(t * 0.7 + i * 0.33);   // breath puff
            air.circ(res.head[0] + face * (90 + q * 70) * S, res.head[1] + 10 * S - q * 30 * S, (14 + q * 26) * S, INK.paperLight, { w: 3, line: SNOW_S(), op: 0.9 * (1 - q), lop: 1 - q });
          });
          // foreground drifts with rocks and dry grass, down to the frame bottom
          const d1 = [[-60, gy + 60], [200, gy + 10], [480, gy + 80], [760, gy + 30], [W + 60, gy + 70], [W + 60, H + 60], [-60, H + 60]];
          fg.shape(d1, SNOW(), { w: 6, smooth: true, amp: 0.8 });
          for (let k = 0; k < 7; k++) fg.line([[40 + k * 150, gy + 160 + (k % 3) * 120], [180 + k * 150, gy + 170 + (k % 3) * 120]], 4, SNOW_S());
          boulder(fg, 140, H - 330, 200, 120, sd + 1, ROCK());
          boulder(fg, W - 160, H - 470, 170, 100, sd + 2, ROCK_D());
          fg.fill([[-60, H - 250], [200, H - 300], [420, H - 260], [700, H - 330], [W + 60, H - 280], [W + 60, H + 60], [-60, H + 60]], SNOW(), { smooth: true });
          fg.line([[-60, H - 250], [200, H - 300], [420, H - 260], [700, H - 330], [W + 60, H - 280]], 5, SNOW_S(), { smooth: true });
          for (let k = 0; k < 10; k++) {   // dry grass tufts bending in the wind
            const x = 60 + k * 105 + hn(k, 31) * 30, y = H - 270 - (k % 2) * 40 + (hn(k, 32) - 0.5) * 30, sw = Math.sin(t * 2.2 + k) * 14 + 18 * (P.wind ?? 1);
            for (let j = -1; j <= 1; j++) fg.line([[x + j * 10, y + 30], [x + j * 24 + sw, y - 70 - Math.abs(j) * -10]], 4, WHEAT_D());
          }
          // blowing snow over everything
          const n = P.snow ?? 90;
          snowfall(air2, lt, n, -100, W + 100, -40, H + 40, (P.wind ?? 1) * 2, 17, 1.1);
          for (let k = 0; k < 6; k++) {   // wind streaks
            const q = fr(lt * 0.5 + k / 6), y = 300 + hn(k, 41) * 1200, x = -300 + q * (W + 600);
            air2.line([[x, y], [x + 160, y - 8], [x + 300, y + 6]], 4, INK.paperLight, { op: 0.8 * Math.sin(q * Math.PI) });
          }
          if (kas) kas.update(lt, t, cues);
          [far, mid, air, fg, air2].forEach(p => p.end());
          lbs.update(lt, t, cues);
          zoomAt(root, hit, W, H, 800);
        },
      };
    },
  };

  // ================================================================== po_shard
  // Laid out in SCREEN pixels for the close-up given in P.view {focus, zoom} (= the scene's camera): the engine puts
  // focus at screen (W/2, 705) and scales by zoom, so S(x, y) maps a screen point back to stage px.
  SH.po_shard = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const V = P.view || { focus: [540, 740], zoom: 1.6 }, z = V.zoom || 1, CY = P.anchorY ?? 705;
      const S = (x, y) => [V.focus[0] + (x - W / 2) / z, V.focus[1] + (y - CY) / z];
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5701;
      const table = pen(el(root, 'g'), sd), sh = pen(el(root, 'g'), sd + 50), top = pen(el(root, 'g'), sd + 100);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const scx = P.cx ?? 540, scy = P.cy ?? 760, RX = P.rx ?? 430, RY = P.ry ?? 360;   // sherd centre + radii (screen px)
      const out = [[-1, -0.55], [-0.7, -0.8], [-0.3, -0.72], [0.05, -0.92], [0.45, -0.78], [0.8, -0.86], [1, -0.4], [0.88, 0.05], [0.98, 0.42], [0.6, 0.7], [0.2, 0.62], [-0.15, 0.82], [-0.6, 0.66], [-0.95, 0.3], [-0.85, -0.1]];
      const T = q => S(scx + q[0] * RX, scy + q[1] * RY);
      const k = 1 / z;   // screen px -> stage px
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [table, sh, top].forEach(p => p.begin(t));
          const sc = atOr(cues, 'scorch', dur * 0.35), fi = atOr(cues, 'fire', dur * 0.7), hit = punch(lt, sc);
          // finds table: linen cloth with a woven check, full frame
          table.fill(rect(-60, -60, W + 60, H + 60), mix(INK.paperLight, INK.stain, 0.22), { amp: 0.4 });
          for (let i = 0; i < 24; i++) { table.line([[-20, i * 90], [W + 20, i * 90 + 6]], 3, INK.inkSoft, { op: 0.25 }); table.line([[i * 90, -20], [i * 90 + 6, H + 20]], 3, INK.inkSoft, { op: 0.25 }); }
          // ghost flames licking up both sides of the sherd (memory of the hearth)
          if (lt >= fi) {
            const p = spring(lt, fi, 0.6);
            for (let i = 0; i < 8; i++) {
              const side = i < 4 ? -1 : 1, j = i % 4, fx = scx + side * (RX * 0.7 + j * 60), base = scy + RY * 0.55;
              const hgt = (300 + 110 * Math.sin(t * 8 + i * 1.9)) * p, w = 46;
              sh.fill([S(fx - w, base), S(fx - w * 0.4, base - hgt * 0.6), S(fx + Math.sin(t * 11 + i) * 18, base - hgt), S(fx + w * 0.4, base - hgt * 0.6), S(fx + w, base)], i % 2 ? INK.gold : mix(INK.red, INK.gold, 0.4), { smooth: true, op: 0.6 });
            }
          }
          // shadow + sherd
          sh.fill(out.map(q => T([q[0] + 0.04, q[1] + 0.07])), mix(INK.inkSoft, INK.stain, 0.4), { smooth: false, op: 0.5 });
          const body = out.map(T);
          sh.fill(body, CLAY(), { smooth: false, amp: 0.8 });
          sh.line(out.slice(0, 7).map(q => T([q[0], q[1] + 0.05])), 18 * k, CLAY_L(), { op: 0.9 });
          for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) {   // cord marks
            const xx = -0.8 + c * 0.2 + (r % 2) * 0.1, yy = -0.62 + r * 0.17;
            if (Math.abs(xx) > 0.95 - Math.abs(yy) * 0.2) continue;
            sh.line([T([xx - 0.035, yy - 0.06]), T([xx + 0.035, yy + 0.06])], 9 * k, CLAY_D(), { op: 0.7, amp: 0.5 });
          }
          const soot = [[-0.92, 0.12], [-0.5, -0.02], [-0.1, 0.1], [0.3, -0.04], [0.7, 0.06], [0.94, 0.0], [0.98, 0.42], [0.6, 0.7], [0.2, 0.62], [-0.15, 0.82], [-0.6, 0.66], [-0.95, 0.3]];
          sh.fill(soot.map(T), SOOT(), { smooth: true, amp: 0.8, op: lt >= sc ? 0.92 : 0.8 });
          for (let i = 0; i < 6; i++) sh.dot(...T([-0.7 + i * 0.27, -0.08 - hn(i, 5) * 0.12]), 24 * k, 15 * k, SOOT(), 0.7);
          sh.line(body, 10 * k, INK.ink, { closed: true, smooth: false, amp: 0.8 });
          if (lt >= sc) {   // red ring around the soot (lower half only)
            const p = spring(lt, sc, 0.5), pul = 1 + 0.03 * Math.sin(t * 5), c = S(scx, scy + RY * 0.3);
            top.circ(c[0], c[1], RX * 1.02 * k * p * pul, null, { w: 12 * k, line: INK.red, ry: RY * 0.55 * k * p * pul });
          }
          // magnifying glass drifting over the cord marks
          const m = S(scx + Math.sin(lt * 0.7) * 160, scy - RY * 0.35 + Math.cos(lt * 0.5) * 40);
          top.circ(m[0], m[1], 150 * k, INK.paperLight, { w: 16 * k, line: mix(INK.gold, INK.stain, 0.3), op: 0.22 });
          top.line([[m[0] + 110 * k, m[1] + 100 * k], [m[0] + 280 * k, m[1] + 250 * k]], 38 * k, WOOD_D());
          // finds-table foreground (screen y 1350-1800, inside x 60-1020): brush, tweezers, a scale ruler, a whole find tag
          const by = 1420, wig = Math.sin(t * 1.4) * 6;
          top.line([S(90, by + 160), S(380, by + 10 + wig)], 26 * k, WOOD());   // brush handle
          top.shape([S(370, by - 20 + wig), S(470, by - 60 + wig), S(500, by + 10 + wig), S(400, by + 50 + wig)], INK.inkSoft, { w: 5 * k + 2, smooth: false });
          for (let i = 0; i < 6; i++) top.line([S(470 + i * 4, by - 50 + i * 14 + wig), S(520 + i * 4 + Math.sin(t * 3 + i) * 5, by - 70 + i * 16 + wig)], 4 * k + 1.5, INK.ink);
          top.line([S(560, by + 120), S(800, by + 40)], 10 * k, mix(INK.inkSoft, INK.paperLight, 0.3));   // tweezers
          top.line([S(560, by + 120), S(800, by + 70)], 10 * k, mix(INK.inkSoft, INK.paperLight, 0.3));
          top.shape([S(90, 1700), S(700, 1700), S(700, 1770), S(90, 1770)], mix(INK.paperLight, INK.gold, 0.25), { w: 5 * k + 2, smooth: false });   // ruler
          for (let i = 0; i <= 20; i++) top.line([S(110 + i * 29, 1700), S(110 + i * 29, 1700 + (i % 5 ? 22 : 44))], 3, INK.ink);
          for (let i = 0; i < 4; i++) top.shape([S(110 + i * 145, 1748), S(255 + i * 145, 1748), S(255 + i * 145, 1766), S(110 + i * 145, 1766)], i % 2 ? INK.ink : INK.paperLight, { w: 2, smooth: false });
          const tg = [S(760, 1560), S(1010, 1530), S(1030, 1740), S(780, 1770)];   // tag on a string
          top.shape(tg, INK.paperLight, { w: 5 * k + 2, smooth: false });
          for (let i = 0; i < 3; i++) top.line([S(800, 1610 + i * 40), S(980 - i * 40, 1590 + i * 40)], 5 * k + 1, INK.inkSoft);
          top.circ(...S(790, 1580), 12 * k, null, { w: 3 });
          top.line([S(790, 1580), S(700, 1500 + wig * 2), S(640, 1440)], 4, INK.red);
          [table, sh, top].forEach(p => p.end());
          lbs.update(lt, t, cues);
          const hc = S(scx, scy);
          zoomAt(root, hit, W, H, hc[1]);
        },
      };
    },
  };

  // ================================================================== po_field
  // the first farms along the Yangtze: a flooded rice field with rows of seedlings, thatched huts on low stilts behind,
  // a hatless farmer in a plain wrap bent over planting seedlings, big ripe rice stalks in the foreground water.
  SH.po_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5901;
      const gy = P.gy ?? 1150, hz = P.horizon ?? 700;
      const far = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 50);
      const castG = el(root, 'g');
      const FA = Object.assign({ x: 0.55, s: 1 }, P.farmer || {});
      const rig = KASIF.create(castG, { scale: 1, hat: false, seed: sd + 3 });
      const tunicG = el(root, 'g'), tunicF = inkEl(tunicG, mix(INK.paperLight, INK.stain, 0.35)), tunicR = inkEl(tunicG), hair = inkEl(tunicG, INK.ink);
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const wat = pen(el(root, 'g'), sd + 150), fg = pen(el(root, 'g'), sd + 200);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const WATER = () => mix(INK.blue, INK.paperLight, 0.62), WATER_D = () => mix(INK.blue, INK.paperLight, 0.3);
      const RICE = () => mix(INK.green, INK.paperLight, 0.15), RICE_D = () => mix(INK.green, INK.ink, 0.25);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [far, mid, wat, fg].forEach(p => p.begin(t));
          const hit = punch(lt, atOr(cues, 'hit', null));
          // wooded hills + thatched huts on low stilts along the far bank
          far.fill([[-60, hz + 40], [180, hz - 60], [420, hz - 10], [700, hz - 90], [W + 60, hz - 20], [W + 60, hz + 60], [-60, hz + 60]], mix(INK.green, INK.paperLight, 0.55), { smooth: true });
          [[160, 1], [330, 0.8], [800, 0.9], [960, 0.7]].forEach(([x, s], i) => {
            const w = 170 * s, y = hz + 60, h = 80 * s;
            for (let j = -1; j <= 1; j += 2) far.line([[x + j * w * 0.35, y], [x + j * w * 0.35, y - 30 * s]], 6, WOOD_D());
            far.shape(rect(x - w * 0.4, y - 30 * s - h, x + w * 0.4, y - 30 * s), mix(INK.stain, INK.paperLight, 0.3), { w: 4, smooth: false });
            far.shape([[x - w * 0.62, y - 20 * s - h], [x + w * 0.62, y - 20 * s - h], [x + w * 0.1, y - 120 * s - h], [x - w * 0.1, y - 120 * s - h]], WHEAT_D(), { w: 4, smooth: false });
            for (let k = 0; k < 6; k++) far.line([[x - w * 0.5 + k * w * 0.2, y - 24 * s - h], [x - w * 0.08 + k * w * 0.03, y - 112 * s - h]], 2.5, INK.ink, { op: 0.5 });
            const q = fr(t * 0.2 + i / 4); far.circ(x + 20 + q * 30, y - 140 * s - h - q * 110, 12 + q * 22, INK.paperLight, { w: 2.5, line: INK.inkSoft, op: 1 - q, lop: 1 - q });
          });
          // flooded field in terraces: water bands with low dikes and rows of seedlings
          for (let r = 0; r < 4; r++) {
            const y0 = hz + 70 + r * (gy - hz - 40) / 4, y1 = y0 + (gy - hz - 40) / 4;
            mid.fill([[-60, y0], [W + 60, y0 + 6], [W + 60, y1], [-60, y1]], WATER(), { amp: 0.5 });
            mid.line([[-60, y0], [W + 60, y0 + 6]], 10 + r * 4, mix(INK.stain, INK.paperDark, 0.2));
            for (let k = 0; k < 3; k++) { const q = fr(t * 0.15 + k / 3 + r * 0.2); mid.line([[q * W - 60, y0 + 30 + k * 18], [q * W + 40, y0 + 32 + k * 18]], 3, INK.paperLight, { op: 0.8 }); }
            const n = 14 + r * 3, L = 22 + r * 14;
            for (let k = 0; k < n; k++) {
              const x = (k + 0.5) / n * W, y = lerp(y0 + 20, y1 - 10, 0.6), sw = Math.sin(t * 1.6 + k * 0.6 + r) * (2 + r);
              for (let j = -1; j <= 1; j++) mid.line([[x, y], [x + j * L * 0.4 + sw, y - L * (1 - Math.abs(j) * 0.25)]], 2 + r * 0.8, RICE());
            }
          }
          // the farmer, bent over, planting seedlings from a bundle
          const S2 = FA.s, fx = FA.x * W, dip = Math.sin(t * 2.2);
          const res = rig.update(t, 'point', { x: fx, y: gy, face: -1, scale: S2, since: 1, dir: -55 + dip * 15, emotion: 'neutral', mouth: 0 }) || {};
          const W2 = q => [fx - S2 * q[0], gy + S2 * q[1]];
          const hip = res.hip ? W2(res.hip) : [fx, gy - 184 * S2], hc = res.head ? W2(res.head) : [fx, gy - 420 * S2];
          const tp = [[hip[0] - 44 * S2, hc[1] + 80 * S2], [hip[0] + 44 * S2, hc[1] + 80 * S2], [hip[0] + 60 * S2, hip[1] + 40 * S2], [hip[0] - 60 * S2, hip[1] + 40 * S2]];
          tunicF.setAttribute('d', inkLoop(tp, { seed: sd + 5, t, amp: 1 }));
          tunicR.setAttribute('d', inkPath(tp, { seed: sd + 6, t, w: 5, closed: true, amp: 1 }) + ' ' + inkPath([[hip[0] - 50 * S2, hip[1] - 4], [hip[0] + 50 * S2, hip[1] - 4]], { seed: sd + 7, t, w: 6, amp: 0.8 }));
          hair.setAttribute('d', inkLoop(inkEllipsePts(hc[0] + 6 * S2, hc[1] - 62 * S2, 52 * S2, 24 * S2, sd + 8, 10), { seed: sd + 8, t, amp: 0.6 }) + ' ' + inkCircle(hc[0] + 14 * S2, hc[1] - 92 * S2, 20 * S2, sd + 9, t, { fill: true }));
          const hands = (res.hands || []).map(W2);
          if (hands.length) {
            const h = hands.reduce((a, b) => b[0] < a[0] ? b : a), o = hands.reduce((a, b) => b[0] > a[0] ? b : a);
            for (let j = -1; j <= 1; j++) fg.line([[h[0], h[1] + 10], [h[0] + j * 18, h[1] - 50]], 4, RICE());   // the seedling going in
            for (let j = -2; j <= 2; j++) fg.line([[o[0], o[1] + 30], [o[0] + j * 12, o[1] - 70]], 4, RICE());   // the bundle
            fg.line([[o[0] - 18, o[1]], [o[0] + 18, o[1]]], 6, WHEAT_D());
          }
          // ripples around the farmer's legs + the water in front of him
          wat.fill([[-60, gy - 20], [W + 60, gy - 20], [W + 60, gy + 40], [-60, gy + 40]], WATER(), { amp: 0.4, op: 0.85 });
          for (let k = 0; k < 2; k++) { const q = fr(t * 0.6 + k / 2); wat.circ(fx, gy, 60 + q * 120, null, { ry: 10 + q * 18, w: 3, line: INK.paperLight, lop: 1 - q }); }
          // foreground: deep water + big ripe rice stalks with drooping grain heads
          fg.fill([[-60, gy + 40], [W + 60, gy + 40], [W + 60, H + 60], [-60, H + 60]], WATER_D(), { amp: 0.5 });
          for (let k = 0; k < 8; k++) { const q = fr(t * 0.12 + k / 8); fg.line([[q * W - 120, gy + 120 + k * 90], [q * W + 60, gy + 124 + k * 90]], 4, INK.paperLight, { op: 0.7 }); }
          for (let k = 0; k < 18; k++) {
            const x = (k + hn(k, 91) * 0.7) / 18 * (W + 80) - 40, by = H + 30, L = 320 + hn(k, 92) * 260, sw = Math.sin(t * 1.3 + k * 0.7) * 20;
            for (let j = -1; j <= 1; j++) fg.line([[x + j * 10, by], [x + j * 40 + sw * 0.6, by - L * (0.55 + 0.1 * j)]], 7, RICE_D());
            const tip = [x + sw, by - L], head = [];
            for (let i = 0; i <= 6; i++) head.push([tip[0] + i * 16 + Math.sin(i) * 3, tip[1] + i * i * 5]);
            fg.line([[x, by], [x + sw * 0.5, by - L * 0.6], tip], 6, RICE_D());
            fg.line(head, 5, WHEAT_D());
            head.forEach(([hx, hy], i) => { if (i) fg.dot(hx, hy + 8, 7, 12, WHEAT()); });
          }
          if (kas) kas.update(lt, t, cues);
          [far, mid, wat, fg].forEach(p => p.end());
          lbs.update(lt, t, cues);
          zoomAt(root, hit, W, H, 800);
        },
      };
    },
  };
})();
