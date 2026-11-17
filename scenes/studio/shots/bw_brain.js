// bw_brain: shots for the Stickstory Short "The brain wash" (2026-11-17): the glymphatic system. The body hauls its
// waste away through lymph vessels, but there are none inside the brain tissue. In 2013 (Xie et al., Science,
// Nedergaard lab) the space between brain cells of sleeping mice grew by about 60 % and cerebrospinal fluid flushed
// through, clearing beta-amyloid about twice as fast; in 2019 (Fultz et al., Science) MRI caught waves of that fluid
// washing the brains of sleeping people. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*),
// every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Uses lh__lib.js (LH.kasif, LH.person, LH.front) and bb__lib.js (BBL.labels) read-only. Portrait (1080x1920) layouts.
//
// Common P: labels: [{text, x, y (0..1), at, size, color, font, rot, arrow, stamp}] (BBL.labels),
//   kasif: {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | absent
//
// SHOTS.bw_bed — a bedroom at night: a sleeper lies on the back (face up, head on a pillow at the left, quilt over the
//   body down to the frame bottom), a night window with moon and stars. The brain shows through the head (X-ray) and
//   blue tides of fluid wash through it; soap bubbles rise from it, Z's drift up.
//   P: {wash: cue|s (the tide starts; default 0), bath: 1 (strength), bubbles: true, duck: cue|s (a tiny rubber duck
//   bobs on the tide), skip: cue|s (the sleeper's eye opens, the tide stops, Z's stop, gold waste specks stay in the
//   brain), clean: cue|s (gold sparkles burst around the brain, the brain shines), head: {x: 360, y: 850,
//   r: 165}, labels, kasif}   Close-up target: the head ≈ [330, 860].
// SHOTS.bw_body — a giant front-view body against a clinic wall (feet at the frame bottom): green lymph vessels branch
//   through arms, legs and torso with nodes; gold waste specks run along them to the neck. The brain inside the head
//   has none. P: {none: cue|s (red ring round the brain, the vessels' end at the neck flashes red, a red "?" in the
//   head), labels}   Close-up target: the head ≈ [540, 430].
// SHOTS.bw_lab — 2013, a sleep lab at night: a scientist in a lab coat leans over a glass box in which a mouse sleeps
//   curled on its bedding (Z's), a wire to a small monitor with a slow trace, a wall clock; lab bench in front.
//   P: {q: cue|s (a big red "?" pops over the box), labels}
// SHOTS.bw_cells — full-frame brain tissue under the microscope: packed cells with stubby branches and the narrow gaps
//   between them. mode "grow": on `grow` the cells draw in and the gaps widen (counter 0 → P.pct, double arrows in the
//   gaps); mode "flow": wide gaps, blue fluid streams through them and gold waste specks wash out of the frame.
//   P: {mode: "grow"|"flow", grow: cue|s, pct: 60, kicker: true (no cells in the top-left kicker corner), counter: {x: 0.5, y: 0.33, size: 170}, labels}
// SHOTS.bw_scan — 2019, an MRI scanner: big ring with the sleeper's head in the bore, blue rings of fluid pulsing
//   round the head; the patient table runs toward us under a blanket (feet at the bottom); a wall monitor shows a brain
//   with a blue wave sweeping through it and a trace. P: {pulse: cue|s (waves start), labels}
// cues: wash, duck, clean, none, q, grow, pulse + label/kasif "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const fr = v => v - Math.floor(v);
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const FR = 'Fraunces, Georgia, serif';
  // colours (tokens only)
  const SKIN = () => mix(INK.paperLight, INK.stain, 0.28);
  const BRAIN = () => mix(INK.paperLight, INK.red, 0.28);
  const BRAIN_D = () => mix(INK.red, INK.ink, 0.25);
  const FLUID = () => mix(INK.blue, INK.paperLight, 0.25);
  const FLUID_L = () => mix(INK.blue, INK.paperLight, 0.6);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.3);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const QUILT = () => mix(INK.blue, INK.paperLight, 0.35);
  const QUILT_D = () => mix(INK.blue, INK.ink, 0.25);
  const NIGHT = () => mix(INK.blue, INK.ink, 0.55);
  const LYMPH = () => mix(INK.green, INK.paperLight, 0.1);
  const STEEL = () => mix(INK.inkSoft, INK.paperLight, 0.55);

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
      shape(pts, col, o = {}) { P.fill(pts, col, o); if ((o.w ?? 5) > 0) P.line(pts, o.w ?? 5, o.line || INK.ink, { closed: true, smooth: !!o.smooth, amp: o.amp, op: o.lop ?? 1 }); },
      circ(cx, cy, r, col, o = {}) { k += 3; if (col) P.raw(inkCircle(cx, cy, r, k, t, { fill: true, ry: o.ry }), col, o.op ?? 1); if ((o.w ?? 5) > 0) P.raw(inkCircle(cx, cy, r, k + 1, t, { w: o.w ?? 5, ry: o.ry }), o.line || INK.ink, o.lop ?? 1); },
      dot(cx, cy, rx, ry, col = INK.ink, op = 1) { k += 3; P.raw(inkDot(cx, cy, rx, ry, k, t), col, op); },
      get t() { return t; },
    };
    return P;
  }
  const labelsOf = (root, list, W, H, sd) => window.BBL ? window.BBL.labels(el(root, 'g'), list || [], W, H, sd) : { update() {} };
  const kasifOf = (root, K, W, H, sd) => K && window.LH ? window.LH.kasif(el(root, 'g'), K, W, H, sd) : null;
  const zoomAt = (g, x, y, k) => g.setAttribute('transform', k ? `translate(${f1(x)} ${f1(y)}) scale(${f1((1 + k) * 1000) / 1000}) translate(${f1(-x)} ${f1(-y)})` : '');
  // a clip group whose clip shape is set every frame
  function clipped(parent, defs, id) {
    const cp = el(defs, 'clipPath', { id });
    const shape = el(cp, 'path', { d: '' });
    const g = el(parent, 'g', { 'clip-path': `url(#${id})` });
    return { g, set(d) { shape.setAttribute('d', d); } };
  }
  const ellipse = (cx, cy, rx, ry, n = 20, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  // gyri: wavy folds inside a brain ellipse (local coords), returns point lists
  function gyri(cx, cy, rx, ry, sd) {
    const out = [];
    for (let j = 0; j < 5; j++) {
      const yy = cy - ry * 0.62 + j * ry * 0.3, span = rx * Math.sqrt(Math.max(0.05, 1 - Math.pow((yy - cy) / ry, 2))) * 0.85;
      const pts = [];
      for (let q = 0; q <= 10; q++) { const x = cx - span + q / 10 * span * 2; pts.push([x, yy + Math.sin(q * 1.9 + j + sd) * ry * 0.09]); }
      out.push(pts);
    }
    return out;
  }
  function zzz(pn, x, y, t, s = 1, ph = 0) {
    for (let i = 0; i < 3; i++) {
      const q = fr(t * 0.32 + i / 3 + ph), zx = x + q * 90 * s + Math.sin(t * 1.5 + i) * 10, zy = y - q * 260 * s, z = (26 + 22 * q) * s;
      const op = Math.sin(q * Math.PI);
      pn.line([[zx - z, zy - z], [zx + z, zy - z], [zx - z, zy + z], [zx + z, zy + z]], 6 * s, INK.ink, { smooth: false, op });
    }
  }
  function sparkle(pn, x, y, r, col, op = 1) {
    pn.fill([[x, y - r], [x + r * 0.22, y - r * 0.22], [x + r, y], [x + r * 0.22, y + r * 0.22], [x, y + r], [x - r * 0.22, y + r * 0.22], [x - r, y], [x - r * 0.22, y - r * 0.22]], col, { op });
  }

  // ------------------------------------------------------------------ a profile head lying face-up, brain in X-ray
  // world coords round the skull centre (cx, cy), radius R: the face points up, the crown points left, the neck runs
  // right under the quilt. The brain sits fully inside the skull (crown half), long axis vertical (front = up).
  // o: {bath: 0..1 (tide strength), glow: 0..1 (gold shine), awake: 0..1 (eye opens), waste: 0..1 (gold specks in it)}
  function lyingHead(pn, wash, cx, cy, R, t, o = {}) {
    const W2 = pts => pts.map(p => [cx + p[0] * R, cy + p[1] * R]);
    const head = W2([[0.55, 0.86], [-0.2, 1.0], [-0.78, 0.64], [-1.0, 0.02], [-0.84, -0.58], [-0.38, -0.92], [0.0, -1.0],
      [0.1, -1.02], [0.2, -1.34], [0.3, -1.36], [0.36, -1.08], [0.46, -1.04], [0.52, -1.1], [0.6, -1.02], [0.74, -0.98],
      [0.84, -0.7], [1.4, -0.56], [1.4, 0.62]]);
    pn.shape(head, SKIN(), { w: 7, smooth: false, amp: 0.8 });
    // hair round the crown and the back of the head (on the pillow side)
    pn.shape(W2([[-0.42, -0.95], [-0.88, -0.6], [-1.05, 0.02], [-0.82, 0.68], [-0.2, 1.05], [0.3, 0.98], [-0.18, 0.9], [-0.68, 0.56], [-0.88, 0.0], [-0.74, -0.52], [-0.36, -0.82]]), INK.inkSoft, { w: 5, smooth: true });
    // face on top: brow, eye (closed arc with lashes or open dot), cheek, mouth, ear
    const aw = o.awake ?? 0;
    pn.line(W2([[-0.12, -0.9], [0.0, -0.95], [0.12, -0.92]]), 7, INK.ink);
    if (aw < 0.5) {
      pn.line(W2([[-0.12, -0.78], [0.0, -0.72], [0.12, -0.78]]), 7, INK.ink);
      for (let i = 0; i < 3; i++) pn.line(W2([[-0.08 + i * 0.08, -0.73], [-0.1 + i * 0.1, -0.64]]), 4, INK.ink);
    } else {
      pn.circ(cx, cy - 0.78 * R, 0.1 * R, INK.paperLight, { w: 5 });
      pn.dot(cx + 0.02 * R, cy - 0.8 * R, 0.05 * R, 0.05 * R, INK.ink);
    }
    pn.dot(cx + 0.3 * R, cy - 0.72 * R, 0.1 * R, 0.07 * R, mix(SKIN(), INK.red, 0.35), 0.8);
    const sn = aw > 0.5 ? 0.4 : 1 + 0.3 * Math.sin(t * 1.3);
    pn.shape(W2(ellipse(0.53, -1.03, 0.06 * sn, 0.05, 10)), mix(INK.red, INK.ink, 0.4), { w: 4, smooth: true });
    // brain (X-ray), fully inside the skull
    const bx = -0.36, by = 0.04, brx = 0.5, bry = 0.66;
    const bpts = W2(ellipse(bx, by, brx, bry, 22));
    const glow = o.glow ?? 0;
    pn.shape(bpts, mix(BRAIN(), INK.gold, glow * 0.55), { w: 6, smooth: true });
    pn.line(W2([[bx, by - bry], [bx + 0.03, by], [bx, by + bry]]), 4, BRAIN_D());
    for (let j = 0; j < 5; j++) {   // folds (run across the long axis)
      const yy = by - bry * 0.7 + j * bry * 0.35, span = brx * Math.sqrt(Math.max(0.05, 1 - Math.pow((yy - by) / bry, 2))) * 0.82;
      const pts = []; for (let q = 0; q <= 8; q++) pts.push([bx - span + q / 8 * span * 2, yy + Math.sin(q * 2.1 + j) * 0.05]);
      pn.line(W2(pts), 4, BRAIN_D(), { op: 0.75 });
    }
    // waste specks stuck in the brain
    const ws = o.waste ?? 0;
    for (let i = 0; i < 14; i++) {
      if (hn(i, 31) > ws) continue;
      const a = hn(i, 32) * Math.PI * 2, d = Math.sqrt(hn(i, 33)) * 0.8;
      pn.circ(cx + (bx + Math.cos(a) * brx * d) * R, cy + (by + Math.sin(a) * bry * d) * R, 0.045 * R, INK.gold, { w: 3 });
    }
    const clipD = inkLoop(bpts, { seed: 77, t: 0, amp: 0, smooth: true });
    // the tide: blue bands with foam lines sweeping from the neck end (bottom) up to the front of the brain (top)
    const b = o.bath ?? 0;
    wash.begin(t);
    if (b > 0) {
      wash.fill(bpts, FLUID(), { op: 0.14 * b });
      for (let i = 0; i < 3; i++) {
        const u = fr(t * 0.36 + i / 3), yc = lerp(by + bry * 1.25, by - bry * 1.25, u), hw = 0.11, op = b * Math.sin(u * Math.PI);
        const top = [], bot = [];
        for (let q = 0; q <= 8; q++) { const x = bx - brx * 1.2 + q / 8 * brx * 2.4; top.push([x, yc - hw + Math.sin(q * 1.1 + t * 3 + i) * 0.035]); bot.push([x, yc + hw + Math.sin(q * 1.1 + t * 3 + i + 1) * 0.035]); }
        wash.fill(W2(top.concat(bot.reverse())), FLUID(), { op: 0.7 * op, smooth: true });
        wash.line(W2(top), 7, FLUID_L(), { op: 0.95 * op });
      }
    }
    wash.end();
    return { clipD, brainC: [cx + bx * R, cy + by * R], top: [cx, cy - R] };
  }

  // ================================================================== bw_bed
  SH.bw_bed = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed, defs } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5101;
      const HD = Object.assign({ x: 370, y: 850, r: 185 }, P.head || {});
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100);
      const clip = clipped(root, defs, `bw-bed-clip-${seed}`), wash = pen(clip.g, sd + 150);
      const top = pen(el(root, 'g'), sd + 200);
      const fg = pen(el(root, 'g'), sd + 300);
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); top.begin(t); fg.begin(t);
          const wa = atOr(cues, P.wash, 0), ca = atOr(cues, P.clean, null), da = atOr(cues, P.duck, null);
          const bath = (P.bath ?? 1) * clamp01((lt - wa) / 0.6 + (wa <= 0 ? 1 : 0));
          const cl = ca == null ? 0 : clamp01((lt - ca) / 0.5);
          const ka = atOr(cues, P.skip, null), sk = ka == null ? 0 : clamp01((lt - ka) / 0.6);
          const hit = punch(lt, ca ?? atOr(cues, 'hit', null));
          // night window with curtains, moon and stars
          const wx0 = 600, wx1 = 1000, wy0 = 300, wy1 = 660;
          back.shape(rect(wx0 - 18, wy0 - 18, wx1 + 18, wy1 + 18), WOOD(), { w: 5, smooth: false });
          back.shape(rect(wx0, wy0, wx1, wy1), NIGHT(), { w: 4, smooth: false });
          back.circ(880, 400, 52, INK.paperLight, { w: 4 });
          back.circ(905, 385, 44, NIGHT(), { w: 0 });
          for (let i = 0; i < 7; i++) { const sx = wx0 + 30 + hn(i, 3) * 340, sy = wy0 + 30 + hn(i, 7) * 300; sparkle(back, sx, sy, 9 + 5 * Math.sin(t * 2.4 + i * 1.7), INK.paperLight, 0.9); }
          back.line([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], 8, WOOD());
          back.line([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], 8, WOOD());
          const sw = Math.sin(t * 0.8) * 8;
          back.shape([[wx0 - 50, wy0 - 40], [wx0 + 60, wy0 - 40], [wx0 + 30 + sw, wy1 + 60], [wx0 - 60, wy1 + 70]], mix(INK.red, INK.paperLight, 0.35), { w: 5, smooth: false });
          back.shape([[wx1 - 60, wy0 - 40], [wx1 + 50, wy0 - 40], [wx1 + 60, wy1 + 70], [wx1 - 30 + sw, wy1 + 60]], mix(INK.red, INK.paperLight, 0.35), { w: 5, smooth: false });
          back.line([[wx0 - 80, wy0 - 44], [wx1 + 80, wy0 - 44]], 9, WOOD_D());
          // headboard + mattress
          const mt = HD.y + HD.r + 30;
          back.shape([[40, 560], [150, 540], [160, mt + 140], [40, mt + 150]], WOOD(), { w: 6, smooth: false });
          back.line([[60, 600], [140, 590]], 4, WOOD_D());
          mid.shape(rect(120, mt, W + 30, mt + 70), INK.paperLight, { w: 5, smooth: false });
          // pillow
          mid.shape(ellipse(HD.x - 40, mt - 20, 230, 62, 18), INK.paperLight, { w: 6, smooth: true });
          mid.line([[HD.x - 220, mt - 30], [HD.x - 150, mt - 12]], 3, INK.inkSoft);
          // the head + brain
          const hd = lyingHead(mid, wash, HD.x, HD.y, HD.r, t, { bath: bath * (1 - sk), glow: cl, awake: sk, waste: sk });
          clip.set(hd.clipD);
          // quilt over the body: from the neck to the right edge, then down over the bed front to the frame bottom
          const br = Math.sin(t * 1.6) * 16;   // breathing
          const qy = HD.y;
          const quilt = [[HD.x + HD.r * 1.0, qy - 0.58 * HD.r], [HD.x + HD.r * 1.5, qy - 0.72 * HD.r - br], [HD.x + HD.r * 2.4, qy - 0.78 * HD.r - br], [HD.x + HD.r * 3.3, qy - 0.55 * HD.r - br * 0.5],
            [W + 40, qy - 0.5 * HD.r], [W + 40, H + 40], [80, H + 40], [110, mt + 60], [HD.x + HD.r * 0.6, mt + 50]];
          top.shape(quilt, QUILT(), { w: 7, smooth: false });
          // quilt pattern: stitched squares + folds
          for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) {
            const x = 150 + c * 170 + (r % 2) * 85, y = mt + 120 + r * 150;
            if (x > W + 20) continue;
            top.line([[x - 50, y], [x, y - 40], [x + 50, y], [x, y + 40]], 3, QUILT_D(), { closed: true, smooth: false, op: 0.7 });
          }
          top.line([[HD.x + HD.r * 1.2, qy - 0.1 * HD.r], [HD.x + HD.r * 2.2, qy - 0.3 * HD.r - br], [W, qy - 0.2 * HD.r]], 4, QUILT_D(), { op: 0.7 });
          top.line([[110, mt + 60], [W + 30, mt + 70]], 5, QUILT_D(), { op: 0.8 });
          top.fill(rect(-20, mt + 62, W + 20, mt + 80), QUILT_D(), { op: 0.35 });
          // bubbles rising from the brain, Z's
          if (P.bubbles !== false && bath * (1 - sk) > 0) {
            for (let i = 0; i < 7; i++) {
              const q = fr(t * 0.22 + i / 7), bx = hd.brainC[0] - 110 + hn(i, 11) * 160 + Math.sin(t * 1.4 + i) * 18, by = hd.top[1] + 120 - q * 520;
              const r = (16 + hn(i, 5) * 22) * (0.6 + 0.6 * q), op = Math.sin(q * Math.PI) * bath * (1 - sk);
              top.circ(bx, by, r, FLUID_L(), { w: 4, line: INK.blue, op: 0.35 * op, lop: op });
              top.line([[bx - r * 0.45, by - r * 0.2], [bx - r * 0.2, by - r * 0.5]], 4, INK.paperLight, { op });
            }
          }
          if (sk < 0.5) zzz(top, HD.x + HD.r * 0.75, HD.y - HD.r * 1.3, t, 1, 0);
          // rubber duck bobbing on the tide
          if (da != null && lt >= da) {
            const p = spring(lt, da, 0.6), dx = hd.brainC[0] + 20 + Math.sin(t * 1.1) * 40, dy = hd.brainC[1] - 20 + Math.sin(t * 2.2) * 8;
            const s = 0.8 * p;
            top.shape(ellipse(dx, dy, 58 * s, 34 * s, 14), INK.gold, { w: 5, smooth: true });
            top.shape(ellipse(dx + 40 * s, dy - 40 * s, 28 * s, 26 * s, 12), INK.gold, { w: 5, smooth: true });
            top.fill([[dx + 64 * s, dy - 44 * s], [dx + 92 * s, dy - 36 * s], [dx + 64 * s, dy - 30 * s]], INK.red, {});
            top.dot(dx + 46 * s, dy - 48 * s, 5, 5, INK.ink);
          }
          // clean: sparkles burst round the brain
          if (cl > 0) {
            for (let i = 0; i < 9; i++) {
              const a = i / 9 * Math.PI * 2 + 0.3, d = lerp(60, 230, spring(lt, ca + i * 0.05, 0.6)), tw = 0.6 + 0.4 * Math.sin(t * 5 + i * 2);
              sparkle(top, hd.brainC[0] + Math.cos(a) * d, hd.brainC[1] + Math.sin(a) * d * 0.8, (20 + (i % 3) * 10) * tw * cl, INK.gold, 0.95);
            }
          }
          if (kas) kas.update(lt, t, cues);
          back.end(); mid.end(); top.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, HD.x, HD.y, hit ? 0.04 * hit : 0);
        },
      };
    },
  };

  // ================================================================== bw_body
  SH.bw_body = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 6101;
      const back = pen(el(root, 'g'), sd), body = pen(el(root, 'g'), sd + 100), ly = pen(el(root, 'g'), sd + 200), fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const cx = W / 2, hy = 430, hr = 125;
      // lymph routes (each ends at the neck duct); specks flow along them
      const duct = [cx - 40, 600];
      const routes = [
        [[cx - 300, 1180], [cx - 250, 960], [cx - 215, 780], [cx - 150, 660], duct],     // left arm
        [[cx + 300, 1180], [cx + 250, 960], [cx + 215, 780], [cx + 150, 660], [cx + 40, 600]], // right arm
        [[cx - 110, 1840], [cx - 100, 1500], [cx - 80, 1160], [cx - 40, 960], [cx - 30, 760], duct], // left leg
        [[cx + 110, 1840], [cx + 100, 1500], [cx + 80, 1160], [cx + 20, 980], [cx - 20, 760], duct], // right leg
        [[cx - 150, 900], [cx - 90, 820], [cx - 40, 720], duct],
        [[cx + 150, 900], [cx + 90, 820], [cx + 30, 720], [cx - 30, 640]],
      ];
      const nodes = [[cx - 150, 660], [cx + 150, 660], [cx - 80, 1160], [cx + 80, 1160], [cx - 60, 560], [cx + 60, 560], [cx - 100, 1500], [cx + 100, 1500], [cx - 250, 960], [cx + 250, 960]];
      const along = (pts, u) => {
        const L = []; let tot = 0;
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
        let s = u * tot;
        for (let i = 0; i < L.length; i++) { if (s <= L[i]) { const f = s / L[i]; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } s -= L[i]; }
        return pts[pts.length - 1];
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); body.begin(t); ly.begin(t); fg.begin(t);
          const na = atOr(cues, P.none, null), np = na == null ? 0 : clamp01((lt - na) / 0.4);
          const hit = punch(lt, na ?? atOr(cues, 'hit', null));
          const sw = Math.sin(t * 1.2) * 4;
          // clinic wall: tiles, a height chart
          for (let y = 300; y < 1800; y += 160) back.line([[-20, y], [W + 20, y]], 3, INK.inkSoft, { op: 0.35 });
          back.shape(rect(910, 340, 990, 1700), INK.paperLight, { w: 4, smooth: false });
          for (let y = 380; y < 1700; y += 60) back.line([[910, y], [y % 120 === 20 ? 960 : 940, y]], 3, INK.ink);
          // body (front view)
          const sk = SKIN();
          const legs = [[cx - 150, 1150], [cx - 30, 1150], [cx - 40, 1500], [cx - 60, 1830], [cx - 150, 1840], [cx - 130, 1500]];
          body.shape(legs, sk, { w: 7, smooth: false });
          body.shape(legs.map(p => [2 * cx - p[0], p[1]]), sk, { w: 7, smooth: false });
          body.shape(ellipse(cx - 110, 1850, 70, 24, 12), INK.ink, { w: 0 });
          body.shape(ellipse(cx + 110, 1850, 70, 24, 12), INK.ink, { w: 0 });
          const arm = s => [[cx + s * 190, 600], [cx + s * 250, 640], [cx + s * 300 + s * sw, 960], [cx + s * 330 + s * sw, 1200], [cx + s * 270 + s * sw, 1210], [cx + s * 230, 960], [cx + s * 180, 760]];
          body.shape(arm(-1), sk, { w: 7, smooth: true });
          body.shape(arm(1), sk, { w: 7, smooth: true });
          body.shape([[cx - 200, 590], [cx + 200, 590], [cx + 175, 900], [cx + 150, 1170], [cx - 150, 1170], [cx - 175, 900]], sk, { w: 7, smooth: true });
          body.shape(rect(cx - 45, 520, cx + 45, 600), sk, { w: 0, smooth: false });
          body.line([[cx - 45, 525], [cx - 50, 590]], 6, INK.ink);
          body.line([[cx + 45, 525], [cx + 50, 590]], 6, INK.ink);
          // shorts
          body.shape([[cx - 158, 1080], [cx + 158, 1080], [cx + 165, 1290], [cx + 20, 1290], [cx, 1200], [cx - 20, 1290], [cx - 165, 1290]], mix(INK.blue, INK.inkSoft, 0.3), { w: 6, smooth: false });
          // head
          body.shape(ellipse(cx, hy, hr, hr * 1.12, 20), sk, { w: 7, smooth: true });
          body.shape([[cx - hr * 1.02, hy - 10], [cx - hr * 0.9, hy - hr * 0.8], [cx, hy - hr * 1.16], [cx + hr * 0.9, hy - hr * 0.8], [cx + hr * 1.02, hy - 10], [cx + hr * 0.86, hy - hr * 0.5], [cx, hy - hr * 0.86], [cx - hr * 0.86, hy - hr * 0.5]], INK.inkSoft, { w: 5, smooth: true });
          // brain (two hemispheres, X-ray) inside the head
          const bry = hy - 30;
          body.shape(ellipse(cx, bry, hr * 0.78, hr * 0.56, 18), mix(BRAIN(), INK.red, np * 0.2), { w: 5, smooth: true });
          body.line([[cx, bry - hr * 0.56], [cx + 4, bry + hr * 0.5]], 4, BRAIN_D());
          for (let j = 0; j < 3; j++) { const yy = bry - hr * 0.32 + j * hr * 0.3; [-1, 1].forEach(s => body.line([[cx + s * 14, yy], [cx + s * 40, yy - 14], [cx + s * 65, yy + 8], [cx + s * 85, yy - 8]], 3.5, BRAIN_D(), { op: 0.85 })); }
          // closed-mouth face (calm)
          body.dot(cx - 40, hy + 50, 7, 7, INK.ink); body.dot(cx + 40, hy + 50, 7, 7, INK.ink);
          body.line([[cx - 22, hy + 92], [cx + 22, hy + 92]], 5, INK.ink);
          // lymph vessels + nodes + flowing waste specks
          routes.forEach((r, i) => ly.line(r, 9, LYMPH(), { op: 0.95 }));
          routes.forEach((r, i) => ly.line(r, 3, mix(INK.green, INK.ink, 0.4), { op: 0.8 }));
          nodes.forEach(([x, y], i) => ly.shape(ellipse(x, y, 20, 14, 10, 0.4 * (i % 2 ? 1 : -1)), LYMPH(), { w: 4, smooth: true }));
          routes.forEach((r, i) => {
            for (let k = 0; k < 4; k++) {
              const u = fr(t * 0.28 + k / 4 + i * 0.13), p = along(r, u);
              ly.circ(p[0], p[1], 10, INK.gold, { w: 3, op: Math.sin(Math.min(1, u * 1.15) * Math.PI) });
            }
          });
          // the duct end at the neck: flashes red on "none"
          if (np > 0) {
            const fl = 0.6 + 0.4 * Math.sin(t * 8);
            ly.line([[cx - 80, 535], [cx + 80, 535]], 10, INK.red, { op: np * fl });
            body.circ(cx, bry, hr * 0.86 * (0.92 + 0.08 * np), null, { w: 9, line: INK.red, lop: np, ry: hr * 0.64 * (0.92 + 0.08 * np) });
            // a red "?" in the head
            const qs = spring(lt, na + 0.15, 0.5);
            if (lt > na + 0.15) {
              const qx = cx, qy = bry - 4, s = qs * 1;
              fg.line([[qx - 26 * s, qy - 34 * s], [qx - 16 * s, qy - 58 * s], [qx + 12 * s, qy - 62 * s], [qx + 28 * s, qy - 40 * s], [qx + 14 * s, qy - 14 * s], [qx, qy + 2 * s], [qx, qy + 18 * s]], 11, INK.red);
              fg.dot(qx, qy + 42 * s, 9 * s, 9 * s, INK.red);
            }
          }
          back.end(); body.end(); ly.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, cx, hy, hit ? 0.05 * hit : 0);
        },
      };
    },
  };

  // ================================================================== bw_lab
  SH.bw_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 7101;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100);
      const sci = window.LH ? window.LH.person(el(root, 'g'), 5, { kind: 'lab', glasses: true, hair: 'dark' }) : null;
      const box = pen(el(root, 'g'), sd + 200);
      const bench = window.LH ? window.LH.front(el(root, 'g'), sd + 400, 'bench') : null;
      const fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const top = 1110;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); box.begin(t); fg.begin(t);
          const qa = atOr(cues, P.q, null);
          // wall clock (night) and a dark window
          const ccx = 860, ccy = 400;
          back.circ(ccx, ccy, 95, INK.paperLight, { w: 7 });
          for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; back.line([[ccx + Math.cos(a) * 75, ccy + Math.sin(a) * 75], [ccx + Math.cos(a) * 86, ccy + Math.sin(a) * 86]], 4, INK.ink); }
          const ma = t * 0.9, ha = -Math.PI / 2 + Math.PI * 2 * (2.9 / 12) + t * 0.075;
          back.line([[ccx, ccy], [ccx + Math.cos(ha) * 46, ccy + Math.sin(ha) * 46]], 9, INK.ink);
          back.line([[ccx, ccy], [ccx + Math.cos(ma - Math.PI / 2) * 70, ccy + Math.sin(ma - Math.PI / 2) * 70]], 5, INK.ink);
          back.shape(rect(80, 330, 420, 640), NIGHT(), { w: 7, smooth: false });
          back.circ(330, 420, 40, INK.paperLight, { w: 3 }); back.circ(350, 408, 34, NIGHT(), { w: 0 });
          for (let i = 0; i < 4; i++) sparkle(back, 120 + hn(i, 2) * 160, 380 + hn(i, 9) * 220, 8 + 4 * Math.sin(t * 2 + i), INK.paperLight, 0.9);
          back.line([[250, 330], [250, 640]], 6, WOOD()); back.line([[80, 485], [420, 485]], 6, WOOD());
          // monitor on the wall with a slow sleep trace
          const mx0 = 520, my0 = 560, mx1 = 1000, my1 = 820;
          back.shape(rect(mx0, my0, mx1, my1), mix(INK.ink, INK.blue, 0.25), { w: 7, smooth: false });
          const tr = [];
          for (let q = 0; q <= 40; q++) { const x = mx0 + 20 + q / 40 * (mx1 - mx0 - 40); tr.push([x, (my0 + my1) / 2 + Math.sin(q * 0.5 - t * 3) * 50 * (0.6 + 0.4 * Math.sin(q * 0.13))]); }
          back.line(tr, 5, mix(INK.green, INK.paperLight, 0.4), { amp: 0.4 });
          // the glass box with a sleeping mouse on bedding
          const bx0 = 560, bx1 = 980, by0 = 860, by1 = top;
          box.fill(rect(bx0, by0, bx1, by1), mix(INK.paperLight, INK.blue, 0.12), { op: 0.6 });
          box.fill([[bx0, by1 - 70], [bx0 + 120, by1 - 92], [bx0 + 260, by1 - 80], [bx1, by1 - 96], [bx1, by1], [bx0, by1]], mix(INK.gold, INK.paperLight, 0.4), {});
          for (let i = 0; i < 18; i++) box.line([[bx0 + 20 + i * 22, by1 - 30 - hn(i, 4) * 40], [bx0 + 36 + i * 22, by1 - 44 - hn(i, 6) * 40]], 3, INK.stain);
          // mouse: curled ball, breathing
          const mcx = 770, mcy = by1 - 120, b = 1 + 0.04 * Math.sin(t * 2.6);
          box.shape(ellipse(mcx, mcy, 118 * b, 70 * b, 16), mix(INK.inkSoft, INK.paperLight, 0.45), { w: 6, smooth: true });
          box.shape(ellipse(mcx + 88, mcy - 6, 56, 44, 14), mix(INK.inkSoft, INK.paperLight, 0.45), { w: 6, smooth: true });
          box.shape(ellipse(mcx + 70, mcy - 52, 26, 30, 10), mix(INK.red, INK.paperLight, 0.55), { w: 5, smooth: true });
          box.line([[mcx + 108, mcy - 8], [mcx + 122, mcy - 2], [mcx + 134, mcy - 8]], 5, INK.ink);
          box.dot(mcx + 142, mcy + 8, 7, 6, INK.red);
          box.line([[mcx - 110, mcy + 20], [mcx - 160, mcy + 40], [mcx - 110, mcy + 62], [mcx + 40, mcy + 68]], 5, mix(INK.red, INK.paperLight, 0.4));
          // wire from the mouse's head up to the monitor
          box.line([[mcx + 80, mcy - 44], [mcx + 60, by0 - 40], [mcx + 20, my1 + 10]], 4, INK.ink, { op: 0.8 });
          zzz(box, mcx + 60, mcy - 90, t, 0.8, 0.2);
          // glass walls + rim
          box.line(rect(bx0, by0, bx1, by1), 6, INK.ink, { closed: true, smooth: false });
          box.line([[bx0 + 30, by0 + 30], [bx0 + 70, by0 + 150]], 5, INK.paperLight, { op: 0.8 });
          // scientist leaning toward the box
          if (sci) {
            const q = Math.sin(t * 1.4);
            sci.update(t, 300, 1330, 1.0, { face: 1, lean: 14 + q * 2, armR: [bx0 - 10, 960 + q * 6], armL: [340, 1100], brow: 0.6, look: [1, 0.3] });
          }
          if (bench) bench.update(t, W, H, top);
          // the question mark
          if (qa != null && lt >= qa) {
            const s = spring(lt, qa, 0.5) * 2.0, qx = (P.qx ?? 0.43) * W, qy = (P.qy ?? 0.37) * H;
            fg.line([[qx - 26 * s, qy - 34 * s], [qx - 16 * s, qy - 58 * s], [qx + 12 * s, qy - 62 * s], [qx + 28 * s, qy - 40 * s], [qx + 14 * s, qy - 14 * s], [qx, qy + 2 * s], [qx, qy + 18 * s]], 11 * Math.min(1.6, s), INK.red);
            fg.dot(qx, qy + 42 * s, 9 * s, 9 * s, INK.red);
          }
          back.end(); mid.end(); box.end(); fg.end();
          lbs.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== bw_cells
  SH.bw_cells = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 8101;
      const mode = P.mode || 'grow';
      const gap = pen(el(root, 'g'), sd), cells = pen(el(root, 'g'), sd + 100), fg = pen(el(root, 'g'), sd + 200);
      const cnt = el(root, 'g');
      const C = Object.assign({ x: 0.5, y: 0.33, size: 170 }, P.counter || {});
      const card = inkEl(cnt, INK.paperLight), cardR = inkEl(cnt, INK.red);
      const tx = el(cnt, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': C.size, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red });
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      // packed cells on a jittered hex grid
      const list = [], sp = 210;
      for (let r = -1; r < Math.ceil(H / (sp * 0.87)) + 1; r++) for (let c = -1; c < Math.ceil(W / sp) + 1; c++) {
        const x = c * sp + (r % 2 ? sp / 2 : 0) + (hn(r * 31 + c, 1) - 0.5) * 50, y = r * sp * 0.87 + (hn(r * 31 + c, 2) - 0.5) * 50;
        list.push({ x, y, r: 92 + hn(r * 31 + c, 3) * 14, rot: hn(r, c) * 6, glia: hn(r * 7 + c, 9) > 0.72, n: 5 + Math.floor(hn(c, r + 4) * 3) });
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          gap.begin(t); cells.begin(t); fg.begin(t);
          const ga = atOr(cues, P.grow, 0.4);
          const g = mode === 'flow' ? 1 : progIO(lt, ga, 1.4);
          const hit = punch(lt, ga);
          // gaps: pale, turning blue with fluid
          gap.fill(rect(-40, -40, W + 40, H + 40), mix(INK.paperLight, INK.blue, mode === 'flow' ? 0.42 : 0.12 + 0.2 * g), { smooth: false, amp: 0 });
          // flowing streaks (only seen in the gaps, cells are drawn over them)
          const fl = mode === 'flow' ? 1 : g * 0.5;
          for (let i = 0; i < 16; i++) {
            const y0 = (fr(i * 0.618) * (H + 400)) - 200, ph = fr(t * (mode === 'flow' ? 0.45 : 0.25) + i * 0.37);
            const pts = [];
            for (let q = 0; q <= 6; q++) { const x = -200 + (ph + q / 6) * (W + 400) * 0.6; pts.push([x, y0 + q * 70 + Math.sin(q + t * 1.5 + i) * 30 + ph * 300]); }
            gap.line(pts, 10, FLUID_L(), { op: 0.7 * fl });
          }
          // waste specks
          for (let i = 0; i < 46; i++) {
            const bx = hn(i, 21) * W, by = hn(i, 22) * H;
            let x = bx, y = by, op = 1;
            if (mode === 'flow') {
              const q = fr(t * 0.18 + hn(i, 23));
              x = bx + q * 900; y = by + q * 700 + Math.sin(t * 2 + i) * 14;
              x = ((x % (W + 200)) + W + 200) % (W + 200) - 100; y = ((y % (H + 200)) + H + 200) % (H + 200) - 100;
              op = Math.sin(q * Math.PI) * clamp01(1.2 - lt / Math.max(1, dur) * 0.6);
            } else { const q = fr(t * 0.1 * (0.5 + g) + hn(i, 23)); x += q * 260 * (0.3 + g); y += q * 200 * (0.3 + g) + Math.sin(t * 1.5 + i) * 10; op = Math.sin(q * Math.PI); }
            gap.circ(x, y, 9 + (i % 3) * 3, INK.gold, { w: 3, op, lop: op });
          }
          // cells: shrink on grow → wider gaps
          const s = lerp(1.0, 0.78, g);
          list.forEach((c, i) => {
            if (P.kicker !== false && c.x < 590 && c.y < 410) return;   // keep the kicker corner clear
            const br = 1 + 0.06 * Math.sin(t * 2.2 + i * 1.3);
            const R = c.r * s * br, cx = c.x + Math.sin(t * 0.9 + i) * 14 + (mode === 'flow' ? Math.sin(t * 1.6 + i * 0.7) * 8 : 0), cy = c.y + Math.cos(t * 0.8 + i) * 14;
            const pts = [];
            for (let q = 0; q < c.n * 2; q++) { const a = q / (c.n * 2) * Math.PI * 2 + c.rot; const k = q % 2 ? 0.78 : 1.1 + 0.1 * hn(i, q); pts.push([cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]); }
            const col = c.glia ? mix(INK.paperDark, INK.green, 0.25) : mix(INK.paperDark, INK.red, 0.2);
            cells.shape(pts, col, { w: 5, smooth: true });
            cells.dot(cx + R * 0.05, cy - R * 0.08, R * 0.26, R * 0.22, c.glia ? mix(INK.green, INK.ink, 0.3) : BRAIN_D(), 0.85);
          });
          // double arrows in a few gaps while they widen
          if (mode === 'grow' && lt > ga) {
            const ap = clamp01((lt - ga) / 0.6);
            [[0.3, 0.55], [0.72, 0.6], [0.5, 0.75], [0.22, 0.8], [0.8, 0.82]].forEach(([u, v], i) => {
              const x = u * W, y = v * H, a = i * 0.9, L = lerp(10, 60, g);
              const d = [Math.cos(a), Math.sin(a)];
              const p0 = [x - d[0] * L, y - d[1] * L], p1 = [x + d[0] * L, y + d[1] * L];
              fg.line([p0, p1], 7, INK.ink, { op: ap });
              [[p0, -1], [p1, 1]].forEach(([p, sg]) => { const ang = Math.atan2(d[1], d[0]) + (sg < 0 ? Math.PI : 0); fg.line([[p[0] - Math.cos(ang - 0.6) * 22, p[1] - Math.sin(ang - 0.6) * 22], p, [p[0] - Math.cos(ang + 0.6) * 22, p[1] - Math.sin(ang + 0.6) * 22]], 7, INK.ink, { smooth: false, op: ap }); });
            });
          }
          // microscope vignette ring (soft, drawn as a thick frame)
          fg.fill([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], INK.ink, { op: 0, smooth: false });
          // counter
          if (mode === 'grow' && P.pct !== false) {
            const pc = Math.round((P.pct ?? 60) * g), show = lt > ga - 0.1;
            cnt.style.display = show ? '' : 'none';
            if (show) {
              tx.textContent = '+' + pc + '%';
              const w = C.size * 2.9, h = C.size * 1.25, x = C.x * W, y = C.y * H, k = 1 + 0.08 * hit;
              const box = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
              card.setAttribute('d', inkLoop(box, { seed: sd + 1, t, smooth: false, amp: 1.2 }));
              cardR.setAttribute('d', inkPath(box, { w: 10, seed: sd + 2, t, closed: true, smooth: false, amp: 1.4 }));
              tx.setAttribute('transform', `translate(${f1(x)} ${f1(y + 6)}) scale(${k.toFixed(3)})`);
              cnt.setAttribute('transform', `rotate(-4 ${f1(x)} ${f1(y)})`);
            }
          } else cnt.style.display = 'none';
          gap.end(); cells.end(); fg.end();
          lbs.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== bw_scan
  SH.bw_scan = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 9101;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100), fg = pen(el(root, 'g'), sd + 200);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); fg.begin(t);
          const pa = atOr(cues, P.pulse, 0.3), pp = clamp01((lt - pa) / 0.5);
          const hit = punch(lt, pa);
          // wall monitor: brain with a blue wave sweeping through, and a trace
          const m0 = [560, 300], m1 = [1010, 600];
          back.line([[785, 230], [785, 300]], 8, STEEL());
          back.shape(rect(m0[0], m0[1], m1[0], m1[1]), mix(INK.ink, INK.blue, 0.25), { w: 7, smooth: false });
          const bc = [700, 450];
          back.shape(ellipse(bc[0], bc[1], 100, 76, 16), mix(INK.paperLight, INK.blue, 0.3), { w: 4, line: INK.paperLight, smooth: true });
          gyri(bc[0], bc[1], 100, 76, 5).forEach(p => back.line(p, 3, INK.inkSoft, { op: 0.7 }));
          if (pp > 0) {
            const u = fr(t * 0.45), wx = lerp(bc[0] - 100, bc[0] + 100, u), hw = 76 * Math.sqrt(Math.max(0, 1 - Math.pow((wx - bc[0]) / 100, 2)));
            back.fill(ellipse(wx, bc[1], 22, Math.max(6, hw), 12), INK.blue, { op: 0.85 * pp });
          }
          const tr = [];
          for (let q = 0; q <= 24; q++) { const x = 830 + q * 7; tr.push([x, 450 + Math.sin(q * 0.55 - t * 3) * 60 * (pp * 0.8 + 0.2)]); }
          back.line(tr, 5, mix(INK.blue, INK.paperLight, 0.45));
          // moon icon (sleep)
          back.circ(980 - 30, 340, 20, INK.paperLight, { w: 0 }); back.circ(990 - 30, 334, 17, mix(INK.ink, INK.blue, 0.25), { w: 0 });
          // the scanner: a big rounded block with the bore
          const sc = [480, 860], R0 = 400, Rb = 205;
          mid.shape(ellipse(sc[0], sc[1], R0 + 30, R0 - 10, 28), mix(INK.paperLight, INK.paperDark, 0.25), { w: 8, smooth: true });
          mid.line(ellipse(sc[0], sc[1], R0 - 40, R0 - 70, 28), 4, INK.inkSoft, { closed: true, op: 0.8 });
          mid.shape(ellipse(sc[0], sc[1], Rb + 30, Rb + 30, 22), STEEL(), { w: 6, smooth: true });
          mid.shape(ellipse(sc[0], sc[1], Rb, Rb, 22), mix(INK.ink, INK.blue, 0.35), { w: 6, smooth: true });
          // blue fluid rings pulsing round the head inside the bore
          for (let i = 0; i < 3; i++) {
            const q = fr(t * 0.6 + i / 3), r = lerp(70, Rb - 10, q);
            mid.line(ellipse(sc[0], sc[1] + 20, r, r * 0.9, 20), 8, FLUID_L(), { closed: true, op: pp * Math.sin(q * Math.PI) });
          }
          // the head seen from the crown (hair) lying in the bore
          mid.shape(ellipse(sc[0], sc[1] + 30, 82, 92, 16), SKIN(), { w: 6, smooth: true });
          mid.shape(ellipse(sc[0], sc[1] + 6, 80, 70, 16), INK.inkSoft, { w: 4, smooth: true });
          // head coil cage
          [-60, -20, 20, 60].forEach(dx => mid.line([[sc[0] + dx, sc[1] - 70], [sc[0] + dx * 1.2, sc[1] + 110]], 5, mix(INK.paperLight, INK.inkSoft, 0.2)));
          mid.line([[sc[0] - 95, sc[1] - 40], [sc[0] + 95, sc[1] - 40]], 6, mix(INK.paperLight, INK.inkSoft, 0.2));
          // patient table to the viewer, blanket over the body, feet at the bottom
          const tb = [[sc[0] - 120, sc[1] + 120], [sc[0] + 120, sc[1] + 120], [sc[0] + 380, H + 40], [sc[0] - 380, H + 40]];
          fg.shape(tb, mix(INK.paperLight, INK.paperDark, 0.15), { w: 7, smooth: false });
          fg.fill([[sc[0] - 380, H + 40], [sc[0] + 380, H + 40], [sc[0] + 380, H - 60], [sc[0] - 380, H - 60]], STEEL(), { smooth: false });
          const br = Math.sin(t * 1.3) * 6;
          fg.shape([[sc[0] - 100, sc[1] + 140], [sc[0] + 100, sc[1] + 140], [sc[0] + 230, 1450], [sc[0] + 270, 1690], [sc[0] - 270, 1690], [sc[0] - 230, 1450]].map((p, i) => [p[0] + (i < 2 ? 0 : (p[0] - sc[0]) * br * 0.004), p[1]]), QUILT(), { w: 6, smooth: true });
          for (let i = 0; i < 4; i++) fg.line([[sc[0] - 200 + i * 20, 1200 + i * 120], [sc[0] + 200 - i * 20, 1220 + i * 120]], 3, QUILT_D(), { op: 0.7 });
          // feet
          fg.shape(ellipse(sc[0] - 110, 1700, 70, 90, 12), SKIN(), { w: 6, smooth: true });
          fg.shape(ellipse(sc[0] + 110, 1700, 70, 90, 12), SKIN(), { w: 6, smooth: true });
          back.end(); mid.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, sc[0], sc[1], hit ? 0.04 * hit : 0);
        },
      };
    },
  };
})();
