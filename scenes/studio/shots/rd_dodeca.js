// rd_dodeca: shots for the Stickstory Short "Roman dodecahedron" (2026-11-15). Small hollow bronze objects with twelve
// pentagonal faces, a round hole of a different size in each face and a little knob on every corner; over a hundred
// found, almost all in the north-western provinces (Britain, Gaul, the Rhine, Switzerland), none in Italy, mostly
// 2nd–3rd century AD, never mentioned in any Roman text. Parchment ink style (brand/kit/BRAND.md §3, §5): palette
// tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Uses lh__lib.js (LH.label, LH.kasif) read-only.
//
// Common: labels: [{text, x, y (0..1), at, size, color: ink|red|gold|blue|paper, font: "hand"|"serif", card, rot}],
//   kasif: {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false
//   (figures also take hat: false + accessory: "laurel"|"beret"|... for hatless period people)
//
// SHOTS.rd_object — the dodecahedron (3D, slowly turning, bronze shading, holes of 12 sizes, engraved rings, 20 knobs)
//   on a red velvet cushion on an archaeologist's wooden table under a hanging lamp; a shelf with pots on the wall.
//   P: {obj: {x: 0.4, r: 270 (outer radius px)}, table: 0.58 (table top y, 0..1), spin: 0.5 (rad/s), tilt: 0.45,
//   faces: cue (the twelve faces light up gold one by one), holes: cue (hole rims glow), knobs: cue (knobs glow one
//   by one), hit: cue (punch), lamp: true, shelf: true, kasif, labels}
// SHOTS.rd_map — full-frame old map of western Europe and the Mediterranean (sea hatching, Alps, Rhine, Danube,
//   compass); red find dots pop up across Britain, Gaul, the Rhine and the Danube. P: {dots: cue|sec|"all",
//   dur: 2.4 (s for all dots), italy: cue (Italy fills red, its border pulses), rome: true, labels}
// SHOTS.rd_scroll — a Roman library: a tall wooden shelf of scroll pigeonholes with hanging tags, a hatless scribe
//   (laurel) behind a desk writing on a scroll on a stand (the text grows); cue "every": the tags flash in a wave;
//   cue "obj": the dodecahedron lands on the desk beside a blank scroll. P: {scribe: {x, y, scale, seq}, obj: {x, r}, labels}
// SHOTS.rd_theory — a Roman frontier town street: three hatless townsfolk each hold a dodecahedron and try a theory:
//   "glove" (a knitted finger hangs from it, yarn to a ball on the ground), "calendar" (held up to a low sun beside a
//   wheat sheaf), "candle" (a candle burns in its top hole). P: {figs: [{kind, x, bx (bubble x for the X), at, face, accessory, scale}],
//   bubbleY: 0.3, cross: cue (red X over each bubble in turn, figures shrug), labels}
// SHOTS.rd_altar — alias of rd_theory for one figure: figs: [{kind: "altar", torc: true, place: cue (sets the object on
//   the altar), altarDx, r}], town: false (no street, for a hills/field set).
// SHOTS.rd_dig — an English field dig: a trench with soil layers, string grid and pegs, a spoil heap, bucket and
//   trowel in the grass in front. P: {mode: "find"|"end", obj: {x, r}, rise: [0.35, 0.75] (visible part over the
//   scene), glint: cue (sparkles), kasif (end: Kaşif holds the object up in one hand), labels}
// cues: the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  // colours (tokens only)
  const BRONZE = () => mix(INK.gold, INK.stain, 0.45);
  const WOOD = () => mix(INK.stain, INK.inkSoft, 0.3);
  const WOOD_L = () => mix(INK.stain, INK.paperLight, 0.3);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.55);
  const VELVET = () => mix(INK.red, INK.ink, 0.3);
  const SOIL = () => mix(INK.stain, INK.inkSoft, 0.45);
  const SOIL_D = () => mix(INK.stain, INK.ink, 0.5);
  const CLAY = () => mix(INK.stain, INK.gold, 0.35);
  const GRASS = () => mix(INK.green, INK.paperDark, 0.3);
  const GRASS_D = () => mix(INK.green, INK.ink, 0.3);
  const TERRA = () => mix(INK.red, INK.stain, 0.45);
  const WOOL = () => mix(INK.blue, INK.paperLight, 0.3);

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

  // ------------------------------------------------------------------ the dodecahedron
  const PHI = (1 + Math.sqrt(5)) / 2, IP = 1 / PHI;
  const nrm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const VERTS = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const c of [-1, 1]) VERTS.push([a, b, c]);
  for (const a of [-1, 1]) for (const b of [-1, 1]) { VERTS.push([0, a * IP, b * PHI]); VERTS.push([a * IP, b * PHI, 0]); VERTS.push([a * PHI, 0, b * IP]); }
  const NORMS = [];
  for (const a of [-1, 1]) for (const b of [-1, 1]) { NORMS.push([0, a * PHI, b]); NORMS.push([a * PHI, b, 0]); NORMS.push([a, 0, b * PHI]); }
  const FACES = NORMS.map(n0 => {
    const n = nrm(n0);
    const idx = VERTS.map((v, i) => [dot3(v, n), i]).sort((a, b) => b[0] - a[0]).slice(0, 5).map(x => x[1]);
    const c = [0, 1, 2].map(m => idx.reduce((s, i) => s + VERTS[i][m], 0) / 5);
    const u = nrm(VERTS[idx[0]].map((x, m) => x - c[m])), w = cross(n, u);
    const ang = i => { const d = VERTS[i].map((x, m) => x - c[m]); return Math.atan2(dot3(d, w), dot3(d, u)); };
    idx.sort((i, j) => ang(i) - ang(j));
    return { n, idx, c, u, w };
  });
  // hole radius per face (pentagon inradius ≈ 0.85 units): twelve different sizes
  const HOLES = [0.56, 0.24, 0.44, 0.32, 0.5, 0.2, 0.4, 0.29, 0.53, 0.36, 0.47, 0.27];
  const LIGHT = nrm([-0.45, 0.62, 0.65]);
  function rot3(v, a, b, c) {
    let [x, y, z] = v;
    const ca = Math.cos(a), sa = Math.sin(a); [x, z] = [x * ca + z * sa, -x * sa + z * ca];
    const cb = Math.cos(b), sb = Math.sin(b); [y, z] = [y * cb - z * sb, y * sb + z * cb];
    const cc = Math.cos(c), sc = Math.sin(c); [x, y] = [x * cc - y * sc, x * sc + y * cc];
    return [x, y, z];
  }
  // R: outer radius incl. knobs (px); ang: [yaw, pitch, roll]; o: {faceHl[12], holeHl[12], knobHl[20], col}
  function dodeca(pn, cx, cy, R, ang, o = {}) {
    const s = R / (Math.sqrt(3) * 1.19);
    const P3 = v => rot3(v, ang[0], ang[1], ang[2]);
    const PR = r => [cx + r[0] * s, cy - r[1] * s];
    const V = VERTS.map(P3);
    const base = o.col || BRONZE();
    const w = Math.max(2.2, s * 0.032);
    const tone = k => k > 0.55 ? mix(base, INK.paperLight, Math.min(0.62, (k - 0.55) * 1.25)) : mix(base, INK.ink, Math.min(0.55, (0.55 - k) * 0.95));
    const knob = i => {
      const r = V[i], nr = nrm(r), b = PR(r), p = PR(r.map(x => x * 1.12)), kr = s * 0.16;
      pn.line([b, p], s * 0.13, mix(base, INK.ink, 0.4), { amp: 0.4 });
      pn.circ(p[0], p[1], kr, tone(0.5 + 0.45 * dot3(nr, LIGHT)), { w: w * 0.9, amp: 0.4 });
      pn.dot(p[0] - kr * 0.32, p[1] - kr * 0.36, kr * 0.32, kr * 0.24, INK.paperLight, 0.75);
      const hl = o.knobHl ? o.knobHl[i] || 0 : 0;
      if (hl > 0.01) pn.circ(p[0], p[1], kr * (1.35 + 0.25 * hl), null, { w: Math.max(3, w * 1.8 * hl), line: INK.gold });
    };
    const order = V.map((r, i) => [r[2], i]).sort((a, b) => a[0] - b[0]);
    order.forEach(([z, i]) => { if (z < 0) knob(i); });
    const vis = FACES.map((F, fi) => ({ F, fi, n: P3(F.n) })).filter(f => f.n[2] > 0.015).sort((a, b) => a.n[2] - b.n[2]);
    vis.forEach(({ F, fi, n }) => {
      const pts = F.idx.map(i => PR(V[i]));
      const k = 0.5 + 0.5 * dot3(n, LIGHT);
      pn.shape(pts, tone(k), { w, smooth: false, amp: 0.45 });
      const c = P3(F.c), u = P3(F.u), ww = P3(F.w);
      const ring = (rr, off = [0, 0, 0], N = 22) => Array.from({ length: N }, (_, j) => {
        const q = j / N * Math.PI * 2;
        return PR([0, 1, 2].map(m => c[m] + off[m] + rr * (u[m] * Math.cos(q) + ww[m] * Math.sin(q))));
      });
      const hr = HOLES[fi % 12];
      // two engraved rings around the hole (many finds carry them)
      pn.line(ring(Math.min(0.78, hr + 0.13)), w * 0.6, mix(base, INK.ink, 0.5), { closed: true, amp: 0.35 });
      if (hr < 0.4) pn.line(ring(hr + 0.24), w * 0.45, mix(base, INK.ink, 0.42), { closed: true, amp: 0.35 });
      // the hole: lit inner wall, then the dark cavity seen through it (shifted along -n: the wall's thickness)
      pn.fill(ring(hr), tone(0.32), { amp: 0.35 });
      const d = 0.16;
      pn.fill(ring(hr * 0.94, [-n[0] * d, -n[1] * d, -n[2] * d]).map((p, j, A) => p), mix(INK.ink, base, 0.12), { amp: 0.35 });
      pn.line(ring(hr), w * 0.8, INK.ink, { closed: true, amp: 0.35 });
      const hl = o.faceHl ? o.faceHl[fi] || 0 : 0;
      if (hl > 0.01) pn.line(pts, Math.max(3, w * 2.4 * hl), INK.gold, { closed: true, smooth: false, amp: 0.45 });
      const hh = o.holeHl ? o.holeHl[fi] || 0 : 0;
      if (hh > 0.01) pn.line(ring(hr + 0.05), Math.max(3, w * 2 * hh), INK.gold, { closed: true, amp: 0.35 });
    });
    order.forEach(([z, i]) => { if (z >= 0) knob(i); });
    // top-most visible face centre (for a candle) in screen px
    let top = null, ty = 1e9;
    vis.forEach(({ F }) => { const p = PR(P3(F.c)); if (p[1] < ty) { ty = p[1]; top = p; } });
    return { s, top };
  }
  const angAt = (t, spin, tilt, seed = 0) => [t * spin + seed * 0.7, tilt + 0.12 * Math.sin(t * 0.45 + seed), 0.18 + 0.05 * Math.sin(t * 0.3)];
  // staggered 0..1 glow for n items from cue a
  const stagger = (lt, a, n, step, i) => a == null ? 0 : clamp01((lt - a - i * step) / 0.18);

  // a figure: Kaşif (hat) or a hatless period person (hat: false, accessory)
  function figure(parent, K, W, H, seed) {
    const g = el(parent, 'g');
    const rig = KASIF.create(el(g, 'g'), { scale: K.scale ?? 0.8, seed: seed * 3 + 1, hat: K.hat !== false, accessory: K.accessory || null });
    const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
    const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
    const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
    function update(lt, t, cues) {
      const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
      (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
      segs.sort((a, b) => a.at - b.at);
      let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
      const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
      const oo = { x: (K.x ?? 0.5) * W, y: (K.y ?? 0.6) * H, face: faceOf(s.face ?? K.face, 1), since, dir: dirOf(s.dir ?? K.dir),
        emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
      if (pv && since < 0.32) { oo.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; oo.mix = since / 0.32; }
      const r = rig.update(t, s.pose || 'idle', oo), S = K.scale ?? 0.8;
      const SP = q => [oo.x + oo.face * S * q[0], oo.y + S * q[1]];
      return r && r.hands ? { hip: SP(r.hip), head: SP(r.head), hands: r.hands.map(SP), face: oo.face } : null;
    }
    return { update, g };
  }
  // the hand that holds the object: the one farthest up/out from the hip
  const holdHand = (r, low) => {
    if (!r || !r.hands) return null;
    const face = r.face;
    const sc = h => (r.hip[1] - h[1]) + Math.abs(h[0] - r.hip[0]) * 0.6;
    const hi = sc(r.hands[0]) > sc(r.hands[1]);
    const h = (low ? !hi : hi) ? r.hands[0] : r.hands[1];
    return [h[0] + (face || 1) * 6, h[1] - 8];
  };

  // ================================================================== rd_object
  SH.rd_object = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 31;
      const back = pen(el(root, 'g'), sd);
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, W, H, sd + 5) : null;
      const tab = pen(el(root, 'g'), sd + 100), obj = pen(el(root, 'g'), sd + 200);
      const lbs = labels(root, P.labels, W, H);
      const O = Object.assign({ x: 0.4, r: 270 }, P.obj || {});
      const ty = (P.table ?? 0.58) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); tab.begin(t); obj.begin(t);
          const ox = O.x * W, R = O.r, oy = O.y != null ? O.y * H : ty + 6 - R * 0.84;
          // wall shelf with pots + books (right side, behind the host)
          if (P.shelf !== false) {
            const sy = P.shelfY != null ? P.shelfY * H : Math.max(330, oy - R - 40), x0 = W * 0.6;
            back.shape(rect(x0, sy, W + 30, sy + 26), WOOD(), { w: 4 });
            [[0.66, 120, 0], [0.76, 160, 1], [0.86, 96, 2]].forEach(([px, h, i]) => {
              const x = px * W, wd = h * 0.42;
              back.shape([[x - wd * 0.3, sy], [x - wd, sy - h * 0.35], [x - wd * 0.8, sy - h * 0.78], [x - wd * 0.25, sy - h * 0.9], [x - wd * 0.3, sy - h], [x + wd * 0.3, sy - h], [x + wd * 0.25, sy - h * 0.9], [x + wd * 0.8, sy - h * 0.78], [x + wd, sy - h * 0.35], [x + wd * 0.3, sy]], i === 1 ? TERRA() : mix(TERRA(), INK.paperDark, 0.4), { w: 4, smooth: true });
              back.line([[x - wd * 0.85, sy - h * 0.6], [x + wd * 0.85, sy - h * 0.6]], 3, INK.inkSoft);
            });
            [0, 1, 2, 3].forEach(i => back.shape(rect(W * 0.93 + i * 18, sy - 110 + (i % 2) * 8, W * 0.93 + i * 18 + 16, sy), i % 2 ? INK.blue : WOOD_D(), { w: 3, smooth: false }));
          }
          // hanging lamp + light cone
          if (P.lamp !== false) {
            const sw = Math.sin(t * 0.8) * 7, ly = Math.max(150, oy - R - 150), lx = ox + sw;
            back.fill([[lx - 70, ly + 40], [lx + 70, ly + 40], [ox + R * 1.25, ty + 40], [ox - R * 1.25, ty + 40]], INK.gold, { op: 0.13 + 0.02 * Math.sin(t * 3) });
            back.line([[ox, -20], [lx, ly - 40]], 4);
            back.shape([[lx - 40, ly - 40], [lx + 40, ly - 40], [lx + 86, ly + 40], [lx - 86, ly + 40]], mix(INK.green, INK.ink, 0.35), { w: 5 });
            back.circ(lx, ly + 46, 22, INK.paperLight, { w: 3 });
          }
          // table
          tab.shape([[-30, ty], [W + 30, ty], [W + 30, ty + 64], [-30, ty + 64]], WOOD_L(), { w: 5, smooth: false });
          tab.shape([[-30, ty + 64], [W + 30, ty + 64], [W + 30, H + 30], [-30, H + 30]], WOOD(), { w: 5, smooth: false });
          for (let i = 0; i < 7; i++) { const y = ty + 110 + i * 120; const pts = []; for (let x = -20; x <= W + 20; x += 90) pts.push([x, y + Math.sin(x * 0.01 + i) * 10]); tab.line(pts, 3, WOOD_D(), { op: 0.7 }); }
          for (let i = 0; i < 3; i++) tab.line([[40 + i * 380, ty + 18], [300 + i * 380, ty + 24 + (i % 2) * 6]], 2.5, WOOD(), { op: 0.7 });
          const dy = ty + 360;
          tab.shape(rect(W * 0.18, dy, W * 0.82, dy + 230), mix(WOOD(), WOOD_L(), 0.35), { w: 5, smooth: false });
          tab.circ(W * 0.5, dy + 115, 20, INK.gold, { w: 4 });
          // cushion + shadow
          const hit = punch(lt, atOr(cues, P.hit, null), 0.7);
          tab.fill(inkEllipsePts(ox, ty + 26, R * 1.02, R * 0.2, sd + 3, 16), mix(VELVET(), INK.ink, 0.35));
          tab.shape(inkEllipsePts(ox, ty + 10, R * 0.95, R * 0.19, sd + 4, 16), VELVET(), { w: 5, smooth: true });
          tab.line([[ox - R * 0.7, ty + 2], [ox - R * 0.2, ty - 10], [ox + R * 0.3, ty - 8]], 4, mix(VELVET(), INK.paperLight, 0.4), { op: 0.8 });
          tab.fill(inkEllipsePts(ox, ty + 4, R * 0.6, R * 0.09, sd + 5, 14), INK.ink, { op: 0.35 });
          // the object
          const nF = 12, aF = atOr(cues, P.faces, null), aH = atOr(cues, P.holes, null), aK = atOr(cues, P.knobs, null);
          const faceHl = Array.from({ length: nF }, (_, i) => stagger(lt, aF, nF, 0.11, i));
          const holeHl = Array.from({ length: nF }, (_, i) => aH == null ? 0 : stagger(lt, aH, nF, 0.06, i) * (0.75 + 0.25 * Math.sin(t * 5 + i)));
          const knobHl = Array.from({ length: 20 }, (_, i) => stagger(lt, aK, 20, 0.07, i) * (0.8 + 0.2 * Math.sin(t * 6 + i)));
          const RR = R * (1 + 0.07 * hit);
          dodeca(obj, ox, oy - R * 0.07 * hit, RR, angAt(t, P.spin ?? 0.5, P.tilt ?? 0.45, seed), { faceHl, holeHl, knobHl });
          back.end(); tab.end(); obj.end();
          if (kas) kas.update(lt, t, cues);
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== rd_map
  // equirectangular, portrait: x = 18 + (lon + 12) * 29, y = 200 + (60 - lat) * 43
  const MAPX = lon => 18 + (lon + 12) * 29, MAPY = lat => 200 + (60 - lat) * 43;
  const LL = pts => pts.map(([lo, la]) => [MAPX(lo), MAPY(la)]);
  const GB = [[-5.7, 50.0], [-3.5, 50.3], [-1, 50.7], [1.4, 51.2], [1.7, 52.6], [0.3, 53.5], [-0.2, 54.2], [-1.6, 55.6], [-2.1, 56.0], [-1.8, 57.6], [-3.0, 58.6], [-5.0, 58.6], [-6.2, 57.5], [-5.6, 56.3], [-5.0, 55.3], [-3.1, 54.9], [-3.2, 54.0], [-3.0, 53.4], [-4.6, 53.3], [-4.1, 52.3], [-5.2, 51.7], [-3.3, 51.4], [-4.5, 51.0]];
  const IE = [[-6.0, 52.2], [-6.2, 53.5], [-5.6, 54.6], [-7.3, 55.3], [-8.4, 54.6], [-10.0, 54.2], [-9.9, 53.0], [-10.4, 51.8], [-8.5, 51.6]];
  const ITALY_E = [[13.7, 45.6], [12.3, 45.4], [12.3, 44.2], [13.6, 43.5], [14.8, 42.0], [16.1, 41.4], [18.5, 40.1], [17.1, 39.4], [16.6, 38.9], [15.7, 38.0]];
  const ITALY_W = [[15.6, 40.0], [14.3, 40.8], [12.4, 41.7], [10.5, 42.9], [10.2, 43.9], [8.8, 44.4], [7.5, 43.8]];
  const EU = [[10.5, 57.7], [10.9, 56.4], [12.5, 55.6], [12, 54.4], [14.2, 53.9], [18.5, 54.6], [21.2, 55.2], [21.5, 57.2], [24.0, 57.5], [30, 58], [30, 40], [26, 40.9], [22.9, 40.6], [23.3, 39.2], [24, 38], [22.5, 36.5], [21.2, 37.0], [21.0, 38.4], [20.2, 39.6], [19.4, 41.8], [18.5, 42.5], [16.5, 43.5], [15.2, 44.3]]
    .concat(ITALY_E, ITALY_W, [[6.0, 43.1], [4.6, 43.4], [3.1, 43.1], [3.2, 41.9], [1.0, 41.0], [0.0, 39.5], [-0.6, 38.3], [-2.1, 36.7], [-5.6, 36.0], [-6.4, 36.8], [-7.4, 37.2], [-8.9, 37.0], [-8.8, 38.7], [-9.5, 39.4], [-8.7, 41.2], [-8.9, 42.6], [-9.3, 43.2], [-7.7, 43.7], [-4.5, 43.4], [-1.8, 43.4], [-1.2, 44.6], [-1.2, 46.1], [-2.2, 47.1], [-4.6, 47.9], [-4.8, 48.5], [-3.0, 48.8], [-1.6, 48.7], [-1.9, 49.7], [-1.2, 49.4], [0.2, 49.5], [1.6, 50.2], [2.5, 51.1], [3.6, 51.5], [4.5, 52.4], [4.8, 53.0], [6.8, 53.4], [8.6, 53.9], [8.6, 55.5], [8.1, 56.6]]);
  const ITALY = [[6.9, 45.9], [8.5, 46.4], [10.5, 46.6], [12.3, 47.0], [13.7, 46.5]].concat(ITALY_E, ITALY_W, [[6.9, 44.3]]);
  const SICILY = [[12.4, 38.1], [15.6, 38.3], [15.1, 36.7], [12.4, 37.8]];
  const SARD = [[8.4, 41.0], [9.8, 40.9], [9.6, 39.1], [8.4, 39.0]], CORS = [[9.4, 43.0], [9.6, 42.1], [9.2, 41.4], [8.6, 41.9]];
  const SCAN = [[4.6, 66], [5, 62], [5.5, 59.0], [5.6, 58.2], [7, 58], [8.6, 58.4], [10.6, 59.5], [11.2, 58.9], [12.0, 57.7], [12.8, 56.5], [14.2, 55.4], [16.0, 56.3], [16.6, 57.8], [18.0, 59.0], [18.5, 60.5], [21, 66]];
  const AFR = [[-12, 33], [-9.5, 33], [-6, 35.8], [-2, 35.1], [3, 36.8], [10, 37.2], [11, 35.5], [10, 33.5], [20, 30.5], [30, 31], [30, 15], [-12, 15]];
  const RHINE = [[4.1, 52], [6.1, 51.8], [7.6, 50.3], [8.4, 49], [7.6, 47.6], [9.5, 47.6]];
  const DANUBE = [[8.5, 48], [12, 49], [16.3, 48.2], [18.9, 47.7], [19, 45.2], [22, 44.6], [28.5, 45]];
  const inPoly = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  function findDots(seed) {
    const r = rng(inkHash(seed, 1111)), out = [];
    const gauss = () => { const u = Math.max(1e-6, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v); };
    const CL = [[-1.2, 52.6, 1.2, 1.0, 22], [-2.4, 54.2, 0.6, 0.5, 4], [2.5, 48.6, 1.5, 0.9, 15], [4.6, 46.6, 0.9, 0.9, 10], [0.8, 46.8, 1.0, 0.7, 6],
      [5.0, 50.8, 0.8, 0.45, 12], [7.2, 50.0, 0.55, 1.1, 14], [7.4, 47.0, 0.6, 0.3, 8], [10.2, 48.4, 1.1, 0.45, 8], [16.6, 47.8, 1.3, 0.35, 5]];
    CL.forEach(([lo, la, sl, sa, n]) => {
      let made = 0, tries = 0;
      while (made < n && tries++ < 400) {
        const p = [lo + gauss() * sl, la + gauss() * sa];
        const land = inPoly(p, GB) || (inPoly(p, EU) && !inPoly(p, ITALY));
        if (!land || p[1] < 45.2 || (p[1] < 46.3 && p[0] > 6.6) || out.some(q => Math.hypot(q[0] - p[0], (q[1] - p[1]) * 1.4) < 0.5)) continue;
        out.push(p); made++;
      }
    });
    const ord = out.map((p, i) => [r(), i]).sort((a, b) => a[0] - b[0]).map(x => out[x[1]]);
    return ord.map(([lo, la]) => [MAPX(lo), MAPY(la)]);
  }
  SH.rd_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 77;
      const sea = pen(el(root, 'g'), sd), land = pen(el(root, 'g'), sd + 100), top = pen(el(root, 'g'), sd + 200);
      const lbs = labels(root, P.labels, W, H);
      const POL = { gb: LL(GB), ie: LL(IE), eu: LL(EU), it: LL(ITALY), si: LL(SICILY), sa: LL(SARD), co: LL(CORS), sc: LL(SCAN), af: LL(AFR) };
      const DOTS = findDots(seed + 5);
      const LAND = () => mix(INK.paperLight, INK.stain, 0.12), SEA = () => mix(INK.paper, INK.blue, 0.24);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sea.begin(t); land.begin(t); top.begin(t);
          sea.raw(`M-40 -40H${W + 40}V${H + 40}H-40Z`, SEA());
          for (let i = 0; i < 46; i++) {
            const y = 40 + i * 42 + Math.sin(i * 1.3) * 6, pts = [];
            for (let x = -60; x <= W + 60; x += 60) pts.push([x + ((t * 10 + i * 17) % 60), y + Math.sin(x * 0.03 + i + t * 0.8) * 5]);
            sea.line(pts, 2.2, mix(INK.blue, INK.paper, 0.3), { op: 0.5 });
          }
          // meridians / parallels
          for (let lo = -10; lo <= 25; lo += 5) for (let la = 61; la > 18; la -= 1.2) sea.line([[MAPX(lo), MAPY(la)], [MAPX(lo), MAPY(la - 0.6)]], 2, INK.inkSoft, { op: 0.35, amp: 0.4 });
          for (let la = 35; la <= 60; la += 5) for (let lo = -12; lo < 26; lo += 1.4) sea.line([[MAPX(lo), MAPY(la)], [MAPX(lo + 0.7), MAPY(la)]], 2, INK.inkSoft, { op: 0.35, amp: 0.4 });
          // land
          ['af', 'sc', 'eu', 'gb', 'ie', 'si', 'sa', 'co'].forEach(k => {
            land.line(POL[k], 16, mix(SEA(), INK.blue, 0.25), { closed: true, smooth: false, op: 0.6 });
            land.shape(POL[k], LAND(), { w: 5, smooth: false, amp: 0.7 });
          });
          // Italy (cue italy)
          const aI = atOr(cues, P.italy, null), pI = aI == null ? 0 : spring(lt, aI, 0.5);
          if (pI > 0) {
            const pul = 0.85 + 0.15 * Math.sin(t * 5);
            land.fill(POL.it, INK.red, { op: 0.28 * Math.min(1, pI) * pul });
            land.fill(POL.si, INK.red, { op: 0.28 * Math.min(1, pI) * pul });
            land.line(POL.it, 7 * Math.min(1, pI), INK.red, { closed: true, smooth: false });
          }
          // rivers + Alps
          land.line(LL(RHINE), 5, INK.blue, { op: 0.85 });
          land.line(LL(DANUBE), 5, INK.blue, { op: 0.85 });
          for (let i = 0; i < 10; i++) {
            const lo = 6.2 + i * 0.95, la = 45.9 + Math.sin(i * 1.7) * 0.25 + (i > 5 ? 0.5 : 0), x = MAPX(lo), y = MAPY(la);
            land.line([[x - 20, y + 12], [x, y - 14], [x + 20, y + 12]], 4, INK.inkSoft, { smooth: false });
          }
          // Rome
          if (P.rome !== false) {
            const rx = MAPX(12.5), ry = MAPY(41.9), st = [];
            for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 9 : 22; st.push([rx + Math.cos(a) * rr, ry + Math.sin(a) * rr]); }
            land.shape(st, INK.ink, { w: 2, smooth: false });
          }
          // compass rose (Baltic)
          const cx = MAPX(18.6), cy = MAPY(57.8), cr = 70, wob = Math.sin(t * 1.4) * 0.08;
          top.circ(cx, cy, cr, INK.paperLight, { w: 4 });
          [0, 1, 2, 3].forEach(i => { const a = wob + i * Math.PI / 2, b = a + Math.PI / 2; top.shape([[cx + Math.cos(a) * cr * 1.25, cy + Math.sin(a) * cr * 1.25], [cx + Math.cos(b) * 14, cy + Math.sin(b) * 14], [cx, cy], [cx - Math.cos(b) * 14, cy - Math.sin(b) * 14]], i === 3 ? INK.red : INK.ink, { w: 2, smooth: false }); });
          // find dots
          const aD = P.dots === 'all' ? -9 : atOr(cues, P.dots, 0.3), dd = (P.dur ?? 2.4) / DOTS.length;
          DOTS.forEach((p, i) => {
            const a = aD + i * dd; if (lt < a) return;
            const q = spring(lt, a, 0.4), rr = 11 * q;
            if (lt - a < 0.8) top.circ(p[0], p[1], 12 + (lt - a) * 50, null, { w: 3, line: INK.red, lop: 1 - (lt - a) / 0.8 });
            top.circ(p[0], p[1], rr + 0.5 * Math.sin(t * 3 + i), INK.red, { w: 3 });
          });
          // map border
          top.line(rect(22, 22, W - 22, H - 22), 6, INK.ink, { closed: true, smooth: false, amp: 0.6 });
          top.line(rect(38, 38, W - 38, H - 38), 2.5, INK.ink, { closed: true, smooth: false, amp: 0.6 });
          sea.end(); land.end(); top.end();
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== rd_scroll
  SH.rd_scroll = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 401;
      const shelf = pen(el(root, 'g'), sd);
      const SC = Object.assign({ x: 0.3, y: 0.73, scale: 1.2, pose: 'point', dir: -30, face: 'right', hat: false, accessory: 'laurel' }, P.scribe || {});
      const scribe = figure(el(root, 'g'), SC, W, H, sd + 9);
      const desk = pen(el(root, 'g'), sd + 100), obj = pen(el(root, 'g'), sd + 200);
      const lbs = labels(root, P.labels, W, H);
      const dyTop = (P.desk ?? 0.6) * H;
      const O = Object.assign({ x: 0.74, r: 140 }, P.obj || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          shelf.begin(t); desk.begin(t); obj.begin(t);
          // the armarium: big pigeonholes with side-on scroll rolls and hanging tags; plain wall above (for a label)
          const x0 = 60, x1 = W - 60, y0 = (P.shelfTop ?? 0.29) * H, y1 = dyTop - 20, cols = P.cols ?? 3, rows = P.rows ?? 3, cw = (x1 - x0) / cols, ch = (y1 - y0) / rows;
          shelf.shape(rect(x0 - 24, y0 - 34, x1 + 24, y1 + 10), WOOD(), { w: 6, smooth: false });
          shelf.shape(rect(x0 - 44, y0 - 54, x1 + 44, y0 - 20), WOOD_L(), { w: 5, smooth: false });
          const aE = atOr(cues, P.every, null);
          const ROLL = [() => INK.paperLight, () => mix(INK.paperLight, INK.stain, 0.3), () => mix(INK.paperDark, INK.paperLight, 0.4)];
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
            const cx0 = x0 + c * cw + 12, cy0 = y0 + r * ch + 10, cx1 = cx0 + cw - 24, cy1 = cy0 + ch - 20, i = r * cols + c;
            shelf.fill(rect(cx0, cy0, cx1, cy1), WOOD_D(), { smooth: false, amp: 0.5 });
            const wave = aE == null ? 0 : Math.max(0, 1 - Math.abs((lt - aE) * 5 - (c + r * 0.8)) / 1.4);
            // a pile of 3-4 rolls seen from the side: long cylinders with round ends
            const n = 3 + (i % 2), rh = Math.min(42, (cy1 - cy0 - 20) / (n * 0.95));
            for (let k = 0; k < n; k++) {
              const yy = cy1 - 10 - rh / 2 - k * rh * 0.92, off = ((i * 7 + k * 13) % 5) * 9, xa = cx0 + 16 + off, xb = cx1 - 22 - ((k * 11 + i) % 4) * 12;
              shelf.shape([[xa, yy - rh / 2], [xb, yy - rh / 2], [xb, yy + rh / 2], [xa, yy + rh / 2]], wave > 0.05 ? mix(ROLL[(i + k) % 3](), INK.gold, wave * 0.8) : ROLL[(i + k) % 3](), { w: 3, smooth: false, amp: 0.5 });
              shelf.circ(xb, yy, rh / 2, INK.paperDark, { w: 3, ry: rh / 2 });
              shelf.dot(xb, yy, 4, 4, INK.ink);
              shelf.line([[xa + 30, yy - rh / 2], [xa + 30, yy + rh / 2]], 2, INK.inkSoft, { op: 0.7 });
            }
            const sw = Math.sin(t * 2 + i * 0.9) * 7, tx = cx1 - 34 + sw, tyy = cy0 + 40;
            shelf.line([[cx1 - 30, cy0 + 4], [tx, tyy]], 2.5, INK.ink);
            shelf.shape(rect(tx - 20, tyy, tx + 20, tyy + 28), wave > 0.05 ? INK.gold : (i % 2 ? INK.red : INK.blue), { w: 3, smooth: false });
          }
          // desk
          desk.shape([[-30, dyTop], [W + 30, dyTop], [W + 30, dyTop + 58], [-30, dyTop + 58]], WOOD_L(), { w: 5, smooth: false });
          desk.shape([[-30, dyTop + 58], [W + 30, dyTop + 58], [W + 30, H + 30], [-30, H + 30]], WOOD(), { w: 5, smooth: false });
          [0.08, 0.38, 0.68].forEach(px => desk.line(rect(px * W, dyTop + 160, px * W + W * 0.26, dyTop + 520), 4, WOOD_D(), { closed: true, smooth: false }));
          // writing stand with an open scroll; the text grows while he writes
          const sx0 = W * (P.stand ? P.stand[0] : 0.05), sx1 = W * (P.stand ? P.stand[1] : 0.4), st0 = dyTop - 300, st1 = dyTop - 20;
          desk.line([[(sx0 + sx1) / 2, st1], [(sx0 + sx1) / 2, dyTop + 4]], 10, WOOD_D());
          desk.shape([[sx0, st0 + 20], [sx1, st0], [sx1 + 10, st1], [sx0 - 10, st1 + 12]], INK.paperLight, { w: 5, smooth: false });
          desk.shape(inkEllipsePts((sx0 + sx1) / 2, st0 + 10, (sx1 - sx0) / 2 + 14, 16, sd + 2, 12, -0.045), INK.paperDark, { w: 4 });
          desk.shape(inkEllipsePts((sx0 + sx1) / 2, st1 + 6, (sx1 - sx0) / 2 + 22, 16, sd + 3, 12, -0.03), INK.paperDark, { w: 4 });
          const nL = Math.min(7, Math.floor(1 + lt * 2.6));
          for (let i = 0; i < nL; i++) {
            const yy = st0 + 52 + i * 32, L = i === nL - 1 ? clamp01(lt * 2.6 % 1) : 1, pts = [];
            for (let k = 0; k <= 10 * L; k++) pts.push([sx0 + 30 + k * (sx1 - sx0 - 60) / 10, yy - (sx1 - sx0) * 0.0 + Math.sin(k * 2.3 + i) * 5 - k * 1.6]);
            if (pts.length > 1) desk.line(pts, 4, INK.ink, { smooth: false, amp: 0.6 });
          }
          // the object lands on the desk (cue obj) beside a blank scroll
          const aO = atOr(cues, P.objAt, null);
          const bx = O.x * W, rr = O.r;
          desk.shape([[bx - 230, dyTop + 4], [bx - 120, dyTop - 40], [bx - 80, dyTop - 6], [bx - 190, dyTop + 34]], INK.paperLight, { w: 4, smooth: false });
          desk.circ(bx - 108, dyTop - 22, 22, INK.paperDark, { w: 3, ry: 26 });
          if (aO != null && lt >= aO) {
            const q = spring(lt, aO, 0.6), drop = (1 - Math.min(1, prog(lt, aO, 0.35))) * 220;
            obj.fill(inkEllipsePts(bx, dyTop + 6, rr * 0.8 * q, rr * 0.12, sd + 7, 12), INK.ink, { op: 0.3 });
            dodeca(obj, bx, dyTop - rr * 0.84 - drop, rr * Math.min(1.1, q), angAt(t, 0.6, 0.5, seed));
          }
          shelf.end(); desk.end(); obj.end();
          scribe.update(lt, t, cues);
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== rd_theory
  SH.rd_theory = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 613;
      const gy = (P.ground ?? 0.6) * H;
      const sky = pen(el(root, 'g'), sd);
      const FIGS = (P.figs || [{ kind: 'glove', x: 0.2 }, { kind: 'calendar', x: 0.5 }, { kind: 'candle', x: 0.8 }]).map((f, i) => {
        const K = Object.assign({ y: P.ground ?? 0.6, scale: 1.05, pose: 'point', dir: f.kind === 'calendar' ? 55 : 6, face: f.x > 0.5 ? 'left' : 'right', hat: false }, f);
        K.seq = (K.seq || []).concat(P.cross ? [{ at: P.cross, pose: 'shrug', face: K.face, emotion: 'worried' }] : []);
        const wrap = el(root, 'g'), back = pen(el(wrap, 'g'), sd + 50 + i * 40);
        const fig = figure(el(wrap, 'g'), K, W, H, sd + 11 + i);
        const front = pen(el(wrap, 'g'), sd + 70 + i * 40);
        return { K, wrap, back, fig, front, i };
      });
      const fg = pen(el(root, 'g'), sd + 400), xs = pen(el(root, 'g'), sd + 500);
      const lbs = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sky.begin(t); fg.begin(t); xs.begin(t);
          // a low winter sun for the calendar theory
          const cal = FIGS.find(f => f.K.kind === 'calendar');
          if (cal) {
            const sx = cal.K.x * W + (cal.K.face === 'left' ? -330 : 330), syy = gy - 900;
            for (let i = 0; i < 12; i++) { const a = t * 0.25 + i * Math.PI / 6; sky.line([[sx + Math.cos(a) * 70, syy + Math.sin(a) * 70], [sx + Math.cos(a) * 104, syy + Math.sin(a) * 104]], 6, INK.gold); }
            sky.circ(sx, syy, 56, INK.gold, { w: 4 });
          }
          // a Roman street front: tiled-roof houses and a small temple, hiding the set's skyline
          const hy = gy - 470;
          if (P.town !== false) [[-40, 260, 0], [W - 250, W + 40, 1]].forEach(([a, b, i]) => {
            sky.shape(rect(a, hy + 60, b, gy), mix(INK.paperLight, INK.stain, 0.25), { w: 4, smooth: false });
            sky.shape([[a - 20, hy + 70], [(a + b) / 2, hy - 10], [b + 20, hy + 70]], TERRA(), { w: 4, smooth: false });
            for (let k = 0; k < 6; k++) sky.line([[lerp(a, b, k / 5) - 10, hy + 66], [(a + b) / 2, hy - 6]], 2, mix(TERRA(), INK.ink, 0.35), { op: 0.6 });
            sky.shape(rect(lerp(a, b, 0.3), hy + 160, lerp(a, b, 0.55), hy + 280), WOOD_D(), { w: 3, smooth: false });
            sky.shape(rect(lerp(a, b, 0.62), gy - 190, lerp(a, b, 0.86), gy), WOOD(), { w: 3, smooth: false });
          });
          const tx0 = 300, tx1 = W - 290;
          if (P.town !== false) {
          sky.shape([[tx0 - 20, hy + 40], [(tx0 + tx1) / 2, hy - 90], [tx1 + 20, hy + 40]], mix(INK.paperLight, INK.paperDark, 0.4), { w: 4, smooth: false });
          sky.shape(rect(tx0 - 20, hy + 40, tx1 + 20, hy + 76), mix(INK.paperLight, INK.paperDark, 0.3), { w: 4, smooth: false });
          for (let k = 0; k < 6; k++) { const x = lerp(tx0 + 20, tx1 - 20, k / 5); sky.shape(rect(x - 16, hy + 76, x + 16, gy - 40), INK.paperLight, { w: 3, smooth: false }); }
          sky.shape(rect(tx0 - 40, gy - 40, tx1 + 40, gy), mix(INK.paperLight, INK.paperDark, 0.5), { w: 4, smooth: false });
          }
          if (P.street !== false && P.town !== false) {
            sky.shape([[-30, gy], [W + 30, gy], [W + 30, H + 30], [-30, H + 30]], mix(INK.paperDark, INK.stain, 0.25), { w: 5, smooth: false });
            for (let row = 0, y = gy + 12; y < H + 20; row++, y += 18 + (y - gy) * 0.09) {
              const s = 30 + (y - gy) * 0.14;
              for (let x = (row % 2) * s * 0.5 - s; x < W + s; x += s) sky.line(inkEllipsePts(x, y, s * 0.42, 5 + (y - gy) * 0.03, sd + row * 31 + Math.round(x), 8), 2.5, mix(INK.stain, INK.inkSoft, 0.4), { closed: true, op: 0.55, amp: 0.5 });
            }
          }
          FIGS.forEach(F => {
            const { K, back, front } = F;
            back.begin(t); front.begin(t);
            const a = atOr(cues, K.at, -1), p = lt < a ? 0 : spring(lt, a, 0.55), x = K.x * W;
            F.wrap.setAttribute('transform', p >= 0.999 ? '' : `translate(${f1(x)} ${f1(gy)}) scale(${Math.max(0.001, f1(p * 1000) / 1000)}) translate(${f1(-x)} ${f1(-gy)})`);
            const fc = K.face === 'left' ? -1 : 1;
            if (K.kind === 'calendar') {   // wheat sheaf behind
              const wx = x - fc * 120;
              for (let k = 0; k < 6; k++) {
                const top = [wx + (k - 2.5) * 16 + Math.sin(t * 1.5 + k) * 5, gy - 300 - (k % 2) * 30];
                back.line([[wx + (k - 2.5) * 6, gy], top], 4, mix(INK.gold, INK.stain, 0.4));
                for (let g = 0; g < 5; g++) back.dot(top[0] + (g % 2 ? 7 : -7), top[1] + g * 14, 7, 11, INK.gold);
              }
              back.line([[wx - 26, gy - 120], [wx + 26, gy - 116]], 6, INK.red);
            }
            let altarTop = null;
            if (K.kind === 'altar') {   // a rough stone altar in front of him, a small fire bowl on it
              const as = K.altarS ?? 1, ax = x + fc * (K.altarDx ?? 260), aw = 150 * as, ah = 300 * as, ay = gy;
              back.shape([[ax - aw, ay], [ax - aw * 0.86, ay - ah], [ax + aw * 0.9, ay - ah - 6], [ax + aw, ay]], mix(INK.paperDark, INK.inkSoft, 0.35), { w: 5, smooth: false });
              back.shape(rect(ax - aw * 1.08, ay - ah - 34, ax + aw * 1.08, ay - ah), mix(INK.paperDark, INK.inkSoft, 0.2), { w: 5, smooth: false });
              for (let k = 0; k < 4; k++) back.line([[ax - aw * 0.8, ay - 60 - k * 60], [ax + aw * 0.8, ay - 56 - k * 62]], 2.5, INK.inkSoft, { op: 0.6 });
              back.line([[ax - 60 * as, ay - 160 * as], [ax, ay - 210 * as], [ax + 60 * as, ay - 160 * as], [ax, ay - 110 * as], [ax - 60 * as, ay - 160 * as]], 4, INK.inkSoft, { closed: true });
              altarTop = [ax, ay - ah - 34];
            }
            const r = F.fig.update(lt, t, cues);
            if (K.torc && r) {   // a gold torc round the neck
              const hd = r.head, nk = [lerp(hd[0], r.hip[0], 0.32), lerp(hd[1], r.hip[1], 0.3)];
              front.line(inkEllipsePts(nk[0], nk[1], 46 * (K.scale ?? 1.05), 16 * (K.scale ?? 1.05), sd + 5, 12), 9, INK.gold, { closed: true });
              [-1, 1].forEach(sg => front.circ(nk[0] + sg * 14, nk[1] + 14, 9, INK.gold, { w: 3 }));
            }
            const h = holdHand(r);
            if (!h) { back.end(); front.end(); return; }
            const R = (K.r ?? 84) * (K.scale ?? 1.05) / 1.05;
            let ox = h[0] + fc * R * 0.6, oy = h[1] - R * 0.3;
            if (altarTop) { const q = progIO(lt, atOr(cues, K.place, 0.2), 0.8); ox = lerp(ox, altarTop[0], q); oy = lerp(oy, altarTop[1] - R * 0.85, q); }
            if (K.kind === 'glove') {   // a knitted finger hangs from the bottom; yarn to a ball on the ground
              const bx = x + fc * 150, by = gy - 34;
              back.line([[ox, oy + R * 0.6], [lerp(ox, bx, 0.5), lerp(oy, by, 0.5) + 40 + Math.sin(t * 2) * 8], [bx, by - 30]], 3.5, INK.red);
              back.circ(bx, by, 34, INK.red, { w: 4 });
              back.line([[bx - 22, by - 12], [bx + 10, by + 18], [bx + 24, by - 8]], 3, mix(INK.red, INK.ink, 0.4));
              const sw = Math.sin(t * 2.2) * 6, tube = [[ox - R * 0.32, oy + R * 0.55], [ox + R * 0.32, oy + R * 0.55], [ox + R * 0.3 + sw, oy + R * 2.0], [ox - R * 0.3 + sw, oy + R * 2.05]];
              front.shape(tube, WOOL(), { w: 4, smooth: true });
              for (let k = 1; k < 6; k++) front.line([[ox - R * 0.3 + sw * k / 6, oy + R * (0.55 + k * 0.25)], [ox + R * 0.3 + sw * k / 6, oy + R * (0.55 + k * 0.25)]], 2.5, mix(INK.blue, INK.ink, 0.3));
            }
            const d = dodeca(front, ox, oy, R, angAt(t, 0.7, 0.45, seed + F.i * 2));
            if (K.kind === 'candle' && d.top) {
              const cx = ox, cy = oy - R * 0.55, fl = 1 + 0.12 * Math.sin(t * 13) + 0.08 * Math.sin(t * 21);
              front.fill(inkEllipsePts(cx, cy - 70, 70 * fl, 80 * fl, sd + 9, 12), INK.gold, { op: 0.22 });
              front.shape(rect(cx - 14, cy - 64, cx + 14, cy + 6), INK.paperLight, { w: 4, smooth: false });
              front.line([[cx, cy - 64], [cx, cy - 76]], 3);
              front.fill([[cx - 12 * fl, cy - 80], [cx + Math.sin(t * 9) * 6, cy - 80 - 52 * fl], [cx + 12 * fl, cy - 80], [cx, cy - 66]], INK.gold, { smooth: true });
              front.fill([[cx - 5, cy - 78], [cx + Math.sin(t * 9) * 3, cy - 78 - 26 * fl], [cx + 5, cy - 78], [cx, cy - 70]], INK.red, { smooth: true });
            }
            if (K.kind === 'calendar') {   // dashed ray from the sun through the hole
              const sx = K.x * W + (K.face === 'left' ? -330 : 330), syy = gy - 900;
              for (let k = 0; k < 7; k++) { const q0 = k / 7, q1 = q0 + 0.07, ph = (t * 0.6) % (1 / 7); front.line([[lerp(sx, ox, q0 + ph), lerp(syy, oy, q0 + ph)], [lerp(sx, ox, Math.min(1, q1 + ph)), lerp(syy, oy, Math.min(1, q1 + ph))]], 4, INK.gold); }
            }
            back.end(); front.end();
          });
          // red X over each bubble (cue cross)
          const aX = atOr(cues, P.cross, null);
          if (aX != null) FIGS.forEach((F, i) => {
            const a = aX + i * 0.28; if (lt < a) return;
            const x = (F.K.bx ?? F.K.x) * W, y = (F.K.by ?? P.bubbleY ?? 0.3) * H, s = F.K.bw ?? 95, q1 = prog(lt, a, 0.14), q2 = prog(lt, a + 0.12, 0.14);
            xs.line([[x - s, y - 90], [lerp(x - s, x + s, q1), lerp(y - 90, y + 70, q1)]], 22, INK.red, { smooth: false });
            if (q2 > 0) xs.line([[x + s, y - 90], [lerp(x + s, x - s, q2), lerp(y - 90, y + 70, q2)]], 22, INK.red, { smooth: false });
          });
          // foreground: amphorae and a crate in front of the street
          const amph = (x, y, h, c) => { const w = h * 0.36; fg.shape([[x - w * 0.3, y], [x - w, y - h * 0.4], [x - w * 0.8, y - h * 0.8], [x - w * 0.22, y - h * 0.92], [x - w * 0.26, y - h], [x + w * 0.26, y - h], [x + w * 0.22, y - h * 0.92], [x + w * 0.8, y - h * 0.8], [x + w, y - h * 0.4], [x + w * 0.3, y]], c, { w: 5, smooth: true }); fg.line([[x - w * 0.9, y - h * 0.62], [x + w * 0.9, y - h * 0.62]], 3, INK.inkSoft); };
          if (P.town === false) {   // open country: a dry-stone wall and grass tufts in front
            const wy = gy + 190;
            fg.shape([[-30, wy + 20], [W * 0.3, wy], [W * 0.7, wy + 14], [W + 30, wy - 4], [W + 30, H + 30], [-30, H + 30]], mix(INK.green, INK.paperDark, 0.45), { w: 5, smooth: false });
            for (let row = 0; row < 3; row++) for (let k = 0; k < 7; k++) {
              const sx = -60 + k * 180 + (row % 2) * 90, sy = wy + 190 + row * 110;
              fg.shape(inkEllipsePts(sx, sy, 88, 46, sd + row * 13 + k, 9), mix(INK.paperDark, INK.inkSoft, 0.25 + 0.1 * ((k + row) % 3)), { w: 4, smooth: true });
            }
            for (let k = 0; k < 18; k++) { const x = hn(k, 21) * W, y = wy + 40 + hn(k, 22) * 120, sw = Math.sin(t * 1.5 + k) * 8; fg.line([[x, y], [x + sw * 0.5, y - 40], [x + sw, y - 70]], 5, GRASS_D(), { taper: 0.8 }); }
          }
          if (P.town !== false) {
          amph(120, H + 40, 520, TERRA()); amph(260, H + 80, 420, mix(TERRA(), INK.paperDark, 0.35));
          fg.shape(rect(W - 330, H - 330, W + 30, H + 30), WOOD(), { w: 5, smooth: false });
          for (let k = 1; k < 4; k++) fg.line([[W - 330, H - 330 + k * 80], [W + 30, H - 330 + k * 80]], 3, WOOD_D());
          fg.line([[W - 330, H - 330], [W + 30, H + 30]], 4, WOOD_D());
          }
          sky.end(); fg.end(); xs.end();
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // rd_altar: the same street/landscape shot used for a single period figure at an altar (kind "altar", torc), town: false
  SH.rd_altar = {
    kind: '2d',
    build(ctx) { return SH.rd_theory.build(ctx); },
  };

  // ================================================================== rd_dig
  SH.rd_dig = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 811;
      const mode = P.mode || 'find';
      const pit = pen(el(root, 'g'), sd), obj = pen(el(root, 'g'), sd + 100), bank = pen(el(root, 'g'), sd + 200);
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, W, H, sd + 5) : null;
      const hand = pen(el(root, 'g'), sd + 300);
      const lbs = labels(root, P.labels, W, H);
      const gy = (P.ground ?? 0.4) * H;
      const T = Object.assign({ x0: 0.08, x1: 0.77 }, P.trench || {});
      const O = Object.assign({ x: 0.42, r: 130 }, P.obj || {});
      const CRUMB = Array.from({ length: 14 }, (_, i) => [hn(i, 1), hn(i, 2), hn(i, 3)]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          pit.begin(t); obj.begin(t); bank.begin(t); hand.begin(t);
          const fx0 = T.x0 * W, fx1 = T.x1 * W, ft = gy + 40, ff = gy + 150, nb = gy + 420, nx0 = fx0 - 70, nx1 = fx1 + 90;
          // far wall with strata
          const layer = (y0, y1, c) => pit.fill([[fx0, y0], [fx1, y0], [fx1 - 30, y1], [fx0 + 40, y1]], c, { smooth: false, amp: 0.6 });
          layer(ft, ft + 34, SOIL_D()); layer(ft + 34, ft + 80, SOIL()); layer(ft + 80, ff, CLAY());
          pit.line([[fx0, ft + 34], [fx1, ft + 34]], 2.5, INK.inkSoft); pit.line([[fx0 + 18, ft + 80], [fx1 - 14, ft + 80]], 2.5, INK.inkSoft);
          // side walls + floor
          pit.shape([[fx0, ft], [fx0 + 40, ff], [nx0 + 60, nb], [nx0, nb]], SOIL(), { w: 4, smooth: false });
          pit.shape([[fx1, ft], [fx1 - 30, ff], [nx1 - 60, nb], [nx1, nb]], mix(SOIL(), SOIL_D(), 0.5), { w: 4, smooth: false });
          pit.shape([[fx0 + 40, ff], [fx1 - 30, ff], [nx1 - 60, nb], [nx0 + 60, nb]], mix(CLAY(), INK.paperDark, 0.25), { w: 4, smooth: false });
          for (let i = 0; i < 9; i++) { const q = i / 8; pit.line([[lerp(fx0 + 60, fx1 - 50, hn(i, 4)), lerp(ff + 20, nb - 30, hn(i, 5))], [lerp(fx0 + 60, fx1 - 50, hn(i, 4)) + 30, lerp(ff + 20, nb - 30, hn(i, 5)) + 4]], 3, SOIL_D(), { op: 0.6 }); }
          // the object in the floor (find) or its empty hollow (end)
          const ox = O.x * W, oy = lerp(ff, nb, 0.5), R = O.r;
          if (mode === 'find') {
            const rise = P.rise || [0.35, 0.75], q = lerp(rise[0], rise[1], progIO(lt, 0, Math.max(1, dur)));
            const cy = oy + R * (1 - q) * 1.4 - R * 0.2;
            dodeca(obj, ox, cy, R, angAt(t * 0.15, 0.4, 0.5, seed));
            // soil still covering its lower part
            const sl = cy + R * (1.2 - 1.6 * q * 0.9);
            obj.shape([[ox - R * 1.7, oy + R * 0.9], [ox - R * 1.3, sl + 10], [ox - R * 0.5, sl - 8], [ox + R * 0.4, sl + 4], [ox + R * 1.2, sl - 6], [ox + R * 1.8, oy + R * 0.9]], mix(CLAY(), INK.paperDark, 0.2), { w: 4, smooth: true });
            CRUMB.forEach((c, i) => { const ph = (t * 0.7 + c[2]) % 1, x = ox + (c[0] - 0.5) * R * 2.2, y = sl - 10 + ph * 50; obj.dot(x, y, 7 + c[1] * 5, 5 + c[1] * 3, SOIL_D(), 1 - ph); });
            const aG = atOr(cues, P.glint, null);
            if (aG != null && lt >= aG) for (let i = 0; i < 4; i++) {
              const a = i * 1.7 + 0.4, d = R * (0.8 + 0.2 * i % 2), sx = ox + Math.cos(a) * d, sy = cy - R * 0.2 + Math.sin(a) * d * 0.6;
              const z = spring(lt, aG + i * 0.12, 0.4) * (0.7 + 0.3 * Math.sin(t * 6 + i)), s = 34 * z;
              obj.fill([[sx, sy - s], [sx + s * 0.22, sy - s * 0.22], [sx + s, sy], [sx + s * 0.22, sy + s * 0.22], [sx, sy + s], [sx - s * 0.22, sy + s * 0.22], [sx - s, sy], [sx - s * 0.22, sy - s * 0.22]], INK.gold, { smooth: false });
            }
          } else {
            obj.fill(inkEllipsePts(ox, oy + 20, R * 1.1, R * 0.4, sd + 2, 14), SOIL_D());
            obj.line([[ox - R * 1.2, oy + 30], [ox - R * 0.4, oy + R * 0.5], [ox + R * 0.6, oy + R * 0.45], [ox + R * 1.2, oy + 26]], 3, INK.inkSoft);
          }
          // string grid and pegs on the edges
          const pegs = [[fx0, ft], [fx1, ft], [nx0 + 20, nb + 6], [nx1 - 20, nb + 6], [lerp(fx0, fx1, 0.5), ft]];
          pit.line([[fx0, ft - 50], [fx1, ft - 50]], 2.5, INK.red);
          pit.line([[lerp(fx0, fx1, 0.5), ft - 50], [lerp(nx0, nx1, 0.5), nb - 40]], 2.5, INK.red, { op: 0.9 });
          pegs.slice(0, 2).concat([pegs[4]]).forEach(p => pit.shape(rect(p[0] - 8, p[1] - 60, p[0] + 8, p[1] + 6), WOOD_L(), { w: 3, smooth: false }));
          // near bank: grass down to the frame bottom, spoil heap, bucket, trowel
          bank.shape([[-30, nb], [nx0, nb], [nx1, nb], [W + 30, nb - 10], [W + 30, H + 30], [-30, H + 30]], GRASS(), { w: 5, smooth: false });
          for (let i = 0; i < 40; i++) {
            const x = hn(i, 7) * W, y = nb + 50 + hn(i, 8) * (H - nb), h = 30 + (y - nb) * 0.08, sw = Math.sin(t * 1.6 + i) * (6 + h * 0.1);
            bank.line([[x, y], [x + sw * 0.5, y - h * 0.6], [x + sw, y - h]], 4 + (y - nb) * 0.004, GRASS_D(), { taper: 0.8 });
          }
          bank.shape([[W * 0.56, H + 30], [W * 0.6, nb + 420], [W * 0.74, nb + 300], [W * 0.9, nb + 330], [W * 1.04, nb + 450], [W * 1.06, H + 30]], SOIL(), { w: 5, smooth: true });
          bank.line([[W * 0.66, nb + 420], [W * 0.76, nb + 380], [W * 0.86, nb + 410]], 3, SOIL_D());
          const bxk = W * 0.2, byk = nb + 560;
          bank.shape([[bxk - 90, byk - 150], [bxk + 90, byk - 150], [bxk + 70, byk + 40], [bxk - 70, byk + 40]], INK.blue, { w: 5, smooth: false });
          bank.fill(inkEllipsePts(bxk, byk - 150, 90, 22, sd + 6, 12), SOIL_D());
          bank.line([[bxk - 86, byk - 150], [bxk, byk - 260], [bxk + 86, byk - 150]], 4, INK.ink);
          const tx = W * 0.42, tyy = nb + 330;
          bank.shape([[tx - 40, tyy + 10], [tx, tyy - 20], [tx + 40, tyy + 10], [tx, tyy + 120]], mix(INK.paperDark, INK.inkSoft, 0.4), { w: 4, smooth: false });
          bank.shape(rect(tx - 12, tyy - 120, tx + 12, tyy - 20), WOOD(), { w: 4, smooth: false });
          pit.end(); obj.end(); bank.end();
          if (kas) {
            const r = kas.update(lt, t, cues);
            const h = holdHand(r, P.holdLow);
            const hr = P.hold ?? 92;
            if (h && P.holdLow) { const sg = Math.sign(h[0] - r.hip[0]) || -r.face; dodeca(hand, h[0] + sg * hr * 0.85, h[1] - hr * 0.45, hr, angAt(t, 0.6, 0.45, seed)); }
            else if (h) dodeca(hand, h[0] + r.face * 70, h[1] - hr * 0.7, hr, angAt(t, 0.8, 0.45, seed));
          }
          hand.end();
          lbs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
