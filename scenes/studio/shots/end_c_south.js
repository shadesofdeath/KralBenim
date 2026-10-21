// end_c_south: Shackleton / Endurance (1916) shots in the parchment ink style (brand/kit/BRAND.md §3, §5; every line
// boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for the long video
// 03-shackleton-endurance (chapters "Haritasız Dağlar" and "Yirmi İki Kişi") but parametric. Layout tuned for 16:9.
//
// cast (all shots that take it): [{who: "kasif"|name, accessory: "beret" (default for period figures; null = none),
//   beard: "black"|"grey"|"short", x: 0.5, y (ground, 0..1 H; default the shot's ground), scale: 0.6, face: "left"|"right",
//   pose: "idle", at: cue|seconds, then: "point", dir: deg|"up"|"left"..., emotion, emotion0,
//   seq: [{at, pose, dir, emotion, face, to (walk/run target x), dur, then (pose after the walk)}]}]
//
// SHOTS.end_c_gear — an upturned boot on the snow; screws pop into its sole one by one while an adze (keser) taps them in,
//   then a coiled rope and the adze land side by side with handwritten labels. P: {labels: {vida, halat, keser}, cast}
//   cues: vida (screws start), halat (rope), keser (adze flies to the rope), cast "at" names
// SHOTS.end_c_ridge — dusk on a knife-edge snow ridge: three roped figures on the crest, a setting sun, far peaks, a
//   fog bank that climbs the left slope from cue "sis". P: {men: [cast...], fog_label: "Sis", cast}   cues: sis, cast names
// SHOTS.end_c_slide — a long snow slope. mode "top": three men stand on the upper ledge, sit down on a rope coil (cue
//   "otur") and slide down (cue "kay"); mode "bottom": they shoot down the lower slope, plough into the run-out (cue
//   "land" or 2.4 s) and stand up (cue "up"); P: {mode, idea: cue (red "!" over the leader), height: {text, at}, cast}
// SHOTS.end_c_nap — night on a snow ledge: two men asleep sitting (rising z's) and Shackleton awake; a big pocket watch
//   whose minute hand creeps 5 minutes; "30 dk" label (cue "half") crossed out by a red "5 dk" (cue "five").
//   cues: wake (sleepers stand up), half, five, cast names
// SHOTS.end_c_whistle — morning: the men on a hill crest above a bay with a whaling station; from cue "duduk" the
//   station whistle blows steam and ink music notes float up to the men (gold from cue "muzik"). P: {label, cast}
// SHOTS.end_c_hut — Elephant Island beach: cliffs and glacier, the hut of two upturned boats with a smoking stovepipe.
//   mode "wait": sunrise, P.wild (cast entry) packs and points at the sea, quote label (cue "quote");
//   mode "rescue": a fog bank over the sea lifts (cue "sis"), the steam tug Yelcho appears (cue "ship"), the men on the
//   shore wave (cue "wave") and a big counter counts 1..22 (cue "say"). P: {quote: {text, at}, count: 22, cast}
// SHOTS.end_c_roster — left: a small card "İkinci ekip" with three dim figures (cue "ross"); right: 28 ink pictograms
//   popping in (cue "crew") that all turn green with a big "28 / 28" (cue "home"). P: {left: "İkinci ekip", n: 28, cast}
// SHOTS.end_c_wreck — cross-section: ice floes and a ship on the surface, a depth ruler (0 – 3.000 m), an ROV that
//   descends its cable (cue "dive") to the upright wreck on the sea bed; a red "3.000 m" tag (cue "depth"); on cue
//   "stern" the camera pushes into the stern where ENDURANCE lights up letter by letter. P: {name, cast}
// SHOTS.end_c_choice — closing question: Kaşif in the middle, the little boat on big waves on the left ("SANDAL",
//   cue "boat") and the island hut on the right ("ADA", cue "island"), a handwritten headline (cue "head") and a red
//   "?" (cue "q"). P: {left: "SANDAL", right: "ADA", head: "En büyük kurtuluş", cast}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = INK;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const TT = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: C.ink, red: C.red, blue: C.blue, green: C.green, gold: C.gold, soft: C.inkSoft };

  // ---------------------------------------------------------------- pen: pooled ink paths, z-order = call order
  function Pen(parent, base) {
    const pool = []; let k = 0;
    const put = (d, fill, op) => {
      if (!d) return;
      let e = pool[k]; if (!e) { e = inkEl(parent); pool.push(e); }
      k++;
      e.setAttribute('d', d); e.setAttribute('fill', fill);
      e.setAttribute('fill-opacity', op == null ? '1' : clamp01(op).toFixed(3));
      e.style.display = '';
    };
    const sd = o => o.seed ?? (base * 131 + k * 17);
    const pen = {
      begin() { k = 0; },
      end() { for (let i = k; i < pool.length; i++) pool[i].style.display = 'none'; },
      fill(pts, col, o = {}) { put(inkLoop(pts, { seed: sd(o), t: o.t ?? 0, amp: o.amp ?? 1.2, smooth: o.smooth }), col, o.op); },
      line(pts, o = {}) { put(inkPath(pts, { w: o.w ?? 5, seed: sd(o), t: o.t ?? 0, amp: o.amp ?? 1.3, closed: !!o.closed, smooth: o.smooth, taper: o.taper }), o.col || C.ink, o.op); },
      shape(pts, col, o = {}) { pen.fill(pts, col, o); pen.line(pts, Object.assign({}, o, { closed: true, seed: o.seed != null ? o.seed + 1 : undefined })); },
      dot(x, y, r, col, o = {}) { put(inkDot(x, y, r, o.ry ?? r, sd(o), o.t ?? 0, o.amp ?? 0.6), col, o.op); },
      raw(d, col, op) { put(d, col, op); },
    };
    return pen;
  }
  const ell = (cx, cy, rx, ry, seed, n = 12, rot = 0) => inkEllipsePts(cx, cy, rx, ry, seed, n, rot);
  const seg = (a, b, n = 6) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  const partial = (pts, p) => { const n = Math.max(2, Math.round(pts.length * clamp01(p))); return pts.slice(0, n); };

  function Txt(parent, s, size, o = {}) {
    const t = el(parent, 'text', { 'font-family': o.font || INK_FONT, 'font-size': size, 'text-anchor': o.anchor || 'middle',
      fill: o.fill || C.ink, 'font-weight': o.weight || 400, x: 0, y: 0,
      style: `paint-order: stroke; stroke: ${o.halo || C.paper}; stroke-width: ${Math.round(size * (o.haloK ?? 0.16))}px; stroke-linejoin: round` });
    t.textContent = s;
    return t;
  }
  function place(node, x, y, sp, rot, t, seed) {
    const b = boil(seed, t, 1);
    node.setAttribute('opacity', clamp01(sp * 2).toFixed(3));
    node.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(rot || 0)}) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
  }
  // camera: slow push-in + drift on the whole group
  function camera(g, lt, dur, W, H, zoom = 1.05, focus = [0.5, 0.5], extra = '') {
    const u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, zoom, u), fx = focus[0] * W, fy = focus[1] * H;
    g.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 7)} ${f1(Math.cos(lt * 0.27) * 4)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)}) ${extra}`);
  }

  // ---------------------------------------------------------------- cast (Kaşif + hatless period figures)
  const faceOf = f => (f === 'left' || f === -1) ? -1 : 1;
  function makeCast(parent, list, seed, H) {
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const wrap = el(parent, 'g');
      const sc = (m.scale ?? 0.6) * H / 1080;
      const acc = isK ? null : (m.accessory === undefined ? 'beret' : m.accessory);
      const rig = KASIF.create(el(wrap, 'g'), { scale: sc, hat: isK, accessory: acc, beard: isK ? null : (m.beard || null), seed: seed * 7 + i * 13 + 3 });
      const steps = [{ at: -99, pose: m.pose || 'idle', dir: m.dir0 ?? m.dir, emotion: m.emotion0 || null, face: m.face }];
      if (m.at != null) steps.push({ at: m.at, pose: m.then || 'point', dir: m.dir, emotion: m.emotion });
      for (const s of m.seq || []) steps.push(s);
      return { m, isK, rig, wrap, steps, sc };
    });
  }
  function castSegs(c, cues, W, H) {
    const m = c.m;
    const st = c.steps.map(s => Object.assign({}, s, { T: s.at === -99 ? -99 : TT(cues, s.at, null) })).filter(s => s.T != null).sort((a, b) => a.T - b.T);
    let x = (m.x ?? 0.5) * W, face = faceOf(m.face);
    const segs = [];
    for (const s of st) {
      if (s.face != null) face = faceOf(s.face);
      if (s.to != null) {
        const x1 = s.to * W, d = s.dur ?? Math.max(0.6, Math.abs(x1 - x) / (300 * H / 1080));
        if (s.face == null) face = x1 < x ? -1 : 1;
        segs.push({ t0: s.T, t1: s.T + d, pose: s.pose || 'walk', x0: x, x1, face, dir: s.dir, emotion: s.emotion });
        x = x1;
        segs.push({ t0: s.T + d, t1: s.T + d, pose: s.then || 'idle', x0: x, x1: x, face, dir: s.dir, emotion: s.emotion });
      } else segs.push({ t0: s.T, t1: s.T, pose: s.pose, x0: x, x1: x, face, dir: s.dir, emotion: s.emotion });
    }
    return segs;
  }
  const dirAng = d => typeof d === 'number' ? d : (DIRS[d] ?? 20);
  // ov(c, i) -> {x, y, rot, pose, face, emotion} overrides (e.g. sliding down a slope)
  function updateCast(cast, lt, t, cues, W, H, gy, ov) {
    return cast.map((c, i) => {
      const segs = castSegs(c, cues, W, H);
      let k = 0; while (k + 1 < segs.length && lt >= segs[k + 1].t0) k++;
      const it = segs[k], pv = segs[k - 1];
      const o = ov ? ov(c, i) || {} : {};
      const x = o.x ?? (it.t1 > it.t0 ? lerp(it.x0, it.x1, clamp01((lt - it.t0) / (it.t1 - it.t0))) : it.x1);
      let y = o.y ?? (c.m.y != null ? c.m.y * H : gy);
      const thop = c.m.hop != null ? TT(cues, c.m.hop, null) : null;
      if (thop != null && lt >= thop && lt < thop + 2.6) y -= Math.abs(Math.sin((lt - thop) * 6.5)) * 110 * H / 1080 * Math.exp(-(lt - thop) * 1.1);
      const since = lt - (it.t0 === -99 ? 0 : it.t0);
      const pose = o.pose || it.pose;
      const walkPh = (seg, at) => (seg.pose === 'walk' || seg.pose === 'run')
        ? (seg.x1 === seg.x0 ? at / 0.9 : Math.abs(lerp(seg.x0, seg.x1, clamp01((at - seg.t0) / Math.max(0.01, seg.t1 - seg.t0))) - seg.x0) / (KASIF.gait(seg.pose) * c.sc))
        : undefined;
      const emo = o.emotion || it.emotion || c.m.emotion0 || (pose === 'shock' ? 'surprised' : null);
      const face = o.face ?? (pv && pv.face !== it.face && since < 0.22 ? lerp(pv.face, it.face, sm(since / 0.22)) : it.face);
      const alpha = c.m.vanish && segs.length > 1 && k === segs.length - 1 ? 1 - clamp01((lt - it.t0) / 0.35) : 1;
      const opts = { x, y, face, alpha, ph: walkPh(it, lt), since: o.pose ? lt : since, dir: dirAng(it.dir), emotion: emo, item: c.m.item, text: c.m.text };
      if (!o.pose && pv && since < 0.3) {
        opts.prev = { pose: pv.pose, ph: walkPh(pv, it.t0), since: it.t0 - pv.t0, dir: dirAng(pv.dir), emotion: pv.emotion };
        opts.mix = since / 0.3;
      }
      c.wrap.setAttribute('transform', o.rot ? `rotate(${f1(o.rot)} ${f1(x)} ${f1(y)})` : '');
      const r = c.rig.update(t, pose, opts);
      const s = c.sc, fc = face;
      const W2 = q => [x + q[0] * s * fc, y + q[1] * s];
      return { x, y, head: W2(r.head), hip: W2(r.hip), s, pose };
    });
  }

  // ---------------------------------------------------------------- shared scenery
  function rangePts(W, H, seed, base, top, n = 8, x0 = -0.06, x1 = 1.06) {
    const r = rng(seed), pts = [[x0 * W, base]];
    for (let i = 0; i <= n; i++) {
      const x = lerp(x0, x1, i / n) * W;
      pts.push([x - W / n * 0.25, base - (top * (0.25 + r() * 0.25))]);
      pts.push([x, base - top * (0.6 + r() * 0.4)]);
    }
    pts.push([x1 * W, base]);
    return pts;
  }
  // snow caps: short strokes just below each peak
  function capsOf(pts) {
    const out = [];
    for (let i = 2; i < pts.length - 1; i += 2) {
      const p = pts[i], a = pts[i - 1], b = pts[i + 1];
      out.push([[lerp(p[0], a[0], 0.35), lerp(p[1], a[1], 0.35)], [p[0] - 6, p[1] + 26], [lerp(p[0], b[0], 0.3), lerp(p[1], b[1], 0.3)]]);
    }
    return out;
  }
  function flakes(pen, lt, t, seed, n, W, H, ymax = 0.82, col = C.inkSoft) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, sp = 26 + r() * 34, ph = r(), rad = 3 + r() * 2.5;
      const y = (ph * H * ymax + lt * sp) % (H * ymax);
      pen.dot(x0 + Math.sin(lt * 0.7 + i) * 18, y, rad, col, { t, op: 0.55, seed: seed + i * 3 });
    }
  }
  function puff(pen, x, y, r, t, seed, op = 1, col = C.paperLight) {
    const pts = []; const n = 9;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, k = 1 + 0.18 * Math.sin(i * 2.7 + seed);
      pts.push([x + Math.cos(a) * r * 1.35 * k, y + Math.sin(a) * r * 0.75 * k]);
    }
    pen.fill(pts, col, { t, seed, op });
    pen.line(pts, { t, seed: seed + 1, w: 3, col: C.inkSoft, closed: true, op: op * 0.9 });
  }
  function sunAt(pen, x, y, r, t, lt, seed, rays = 9) {
    pen.shape(ell(x, y, r, r, seed, 14), C.gold, { t, w: 4, seed });
    for (let i = 0; i < rays; i++) {
      const a = i / rays * Math.PI * 2 + lt * 0.15;
      pen.line([[x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18)], [x + Math.cos(a) * (r + 46), y + Math.sin(a) * (r + 46)]], { t, w: 4, col: C.gold, seed: seed + 10 + i });
    }
  }
  function zzz(pen, x, y, lt, t, seed, k = 1) {   // rising z's (drawn strokes)
    for (let i = 0; i < 3; i++) {
      const ph = ((lt * 0.45 + i / 3) % 1), s = (14 + ph * 16) * k, zx = x + ph * 60 * k + i * 4, zy = y - ph * 120 * k;
      pen.line([[zx - s, zy - s], [zx + s, zy - s], [zx - s, zy + s], [zx + s, zy + s]], { t, w: 4, smooth: false, col: C.blue, op: 1 - ph * 0.7, seed: seed + i });
    }
  }
  function ropeCoil(pen, x, y, R, t, seed) {
    for (let i = 0; i < 3; i++) {
      const pts = ell(x, y - 6 - i * 7, R - i * 12, R * 0.28 - i * 3, seed + i, 14);
      pen.line(pts, { t, w: 10, col: C.stain, closed: true, seed: seed + 20 + i });
      pen.line(pts, { t, w: 3, col: C.ink, closed: true, seed: seed + 40 + i, op: 0.8 });
    }
  }
  // upturned boat (hut roof), local: base centre (x, y), half length L, height h
  function upBoat(pen, x, y, L, h, t, seed, fill = C.paperDark) {
    const hull = [[x - L, y], [x - L * 0.92, y - h * 0.55], [x - L * 0.6, y - h * 0.92], [x, y - h], [x + L * 0.6, y - h * 0.92], [x + L * 0.95, y - h * 0.5], [x + L * 1.04, y - h * 0.1], [x + L, y]];
    pen.shape(hull, fill, { t, w: 5, seed });
    for (let k = 1; k <= 2; k++) pen.line([[x - L * 0.96, y - h * 0.28 * k], [x, y - h * (0.42 + 0.22 * k)], [x + L * 0.98, y - h * 0.28 * k]], { t, w: 2.5, col: C.inkSoft, seed: seed + 5 + k });
    pen.line([[x - L * 0.7, y - h * 0.93], [x, y - h - 6], [x + L * 0.7, y - h * 0.93]], { t, w: 7, seed: seed + 9 });
  }
  function boatHut(pen, x, y, s, t, lt, seed, smoke = true) {
    // low stone wall
    const r = rng(seed);
    for (let i = 0; i < 9; i++) {
      const bx = x - 250 * s + i * 58 * s, bw = (46 + r() * 14) * s, bh = (26 + r() * 8) * s;
      pen.shape(ell(bx + bw / 2, y - bh / 2, bw / 2, bh / 2, seed + 30 + i, 9), C.paperDark, { t, w: 3, seed: seed + 60 + i * 2 });
    }
    upBoat(pen, x + 50 * s, y - 34 * s, 230 * s, 96 * s, t, seed + 100, C.paperDark);
    upBoat(pen, x - 20 * s, y - 24 * s, 250 * s, 104 * s, t, seed + 120, C.paperLight);
    // canvas door
    pen.shape([[x - 200 * s, y - 2], [x - 196 * s, y - 70 * s], [x - 150 * s, y - 72 * s], [x - 146 * s, y - 2]], C.inkSoft, { t, w: 3, seed: seed + 140 });
    // stovepipe + smoke
    const px = x + 80 * s, py = y - 130 * s;
    pen.line([[px, py + 20 * s], [px + 2, py - 40 * s]], { t, w: 9, seed: seed + 150 });
    if (smoke) for (let i = 0; i < 4; i++) {
      const u = ((lt * 0.25 + i / 4) % 1);
      puff(pen, px + 10 * s + u * 90 * s + Math.sin(u * 6 + i) * 8, py - 50 * s - u * 170 * s, (12 + u * 26) * s, t, seed + 160 + i * 3, 1 - u * 0.8);
    }
  }
  // little boat with a mast (James Caird), local base centre (x, y), size s
  function smallBoat(pen, x, y, s, t, seed, rot = 0) {
    const R = q => { const a = rot * Math.PI / 180, c = Math.cos(a), si = Math.sin(a); return [x + (q[0] * c - q[1] * si) * s, y + (q[0] * si + q[1] * c) * s]; };
    pen.shape([[-130, -40], [130, -46], [100, 0], [-100, 0]].map(R), C.paperDark, { t, w: 5, seed });
    pen.line([[-118, -26], [118, -30]].map(R), { t, w: 2.5, col: C.inkSoft, seed: seed + 1 });
    pen.line([[0, -44], [0, -230]].map(R), { t, w: 6, seed: seed + 2 });
    pen.shape([[6, -222], [96, -60], [6, -54]].map(R), C.paperLight, { t, w: 4, seed: seed + 3, smooth: false });
    pen.shape([[-6, -200], [-80, -66], [-6, -60]].map(R), C.paperLight, { t, w: 4, seed: seed + 5, smooth: false });
  }
  function waves(pen, x0, x1, y, lt, t, seed, rows = 2, amp = 10, col = C.inkSoft) {
    for (let r = 0; r < rows; r++) {
      const pts = [];
      for (let x = x0; x <= x1 + 1; x += 30) pts.push([x, y + r * 38 + Math.sin(x * 0.02 + lt * 2.1 + r) * amp]);
      pen.line(pts, { t, w: r ? 3 : 4, col, seed: seed + r });
    }
  }
  // tiny pictogram person (head + body + legs), feet at (x, y), height h
  function picto(pen, x, y, h, t, seed, col = C.ink, op = 1, fill = C.paperLight, wave = 0) {
    const hr = h * 0.14;
    pen.shape(ell(x, y - h + hr, hr, hr, seed, 8), fill, { t, w: 3, seed, col, op });
    pen.line([[x, y - h + hr * 2], [x, y - h * 0.42]], { t, w: 4, col, op, seed: seed + 2 });
    pen.line([[x - h * 0.16, y], [x, y - h * 0.42], [x + h * 0.16, y]], { t, w: 4, col, op, seed: seed + 3 });
    const ay = y - h * 0.68;
    pen.line([[x - h * 0.2, ay + h * 0.18], [x, ay], [x + h * (0.2 + 0.08 * wave), ay + h * (0.18 - 0.42 * wave)]], { t, w: 4, col, op, seed: seed + 4 });
  }

  // ================================================================ end_c_gear
  SH.end_c_gear = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), mid = el(root, 'g'), castG = el(root, 'g'), fr = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pm = Pen(mid, seed + 1), pf = Pen(fr, seed + 2);
      const gy = 0.74 * H, bs = 1.15 * H / 1080, bx = 0.12 * W, by = gy - 330 * bs;
      const X = (lx, ly) => [bx + lx * bs, by + ly * bs];
      const L = P.labels || {};
      const lab = { vida: Txt(ui, L.vida || 'vida', 60), halat: Txt(ui, L.halat || 'halat', 60), keser: Txt(ui, L.keser || 'keser', 60),
        ocak: Txt(ui, L.ocak || 'ocak', 60), erzak: Txt(ui, L.erzak || 'erzak', 60) };
      const cast = makeCast(castG, P.cast || [{ who: 'kasif', x: 0.86, face: 'left', pose: 'idle', at: 'vida', then: 'point', dir: 12, seq: [{ at: 'kadar', pose: 'shrug', emotion: 'happy' }] }], seed, H);
      const screws = [30, 68, 106, 144, 182, 220, 258, 296];
      const rope = [0.42 * W, gy], restAdze = [0.52 * W, gy], stove = [0.61 * W, gy], bag = [0.71 * W, gy];
      const r = rng(seed * 5 + 1), ticks = Array.from({ length: 14 }, () => [r() * W, gy + 20 + r() * 60]);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.05, [0.42, 0.55]);
          pb.begin(); pm.begin(); pf.begin();
          // far snowy peaks + ground
          const rp = rangePts(W, H, seed + 3, 0.5 * H, 0.2 * H, 7);
          pb.shape(rp, C.paperDark, { t, w: 4, col: C.inkSoft, seed: 900 });
          capsOf(rp).forEach((c, i) => pb.line(c, { t, w: 3, col: C.inkSoft, seed: 920 + i }));
          pb.fill([[-60, gy], [W + 60, gy], [W + 60, H + 30], [-60, H + 30]], C.paperLight, { t, seed: 940 });
          pb.line(seg([-60, gy + 4], [W + 60, gy - 2], 14), { t, w: 6, seed: 941 });
          ticks.forEach((q, i) => pb.line([q, [q[0] + 24, q[1] - 6]], { t, w: 3, col: C.inkSoft, seed: 950 + i }));
          flakes(pb, lt, t, seed + 11, 16, W, H, 0.78);
          // the upturned boot (sole up, shaft standing on the snow)
          const tv = TT(cues, 'vida', dur * 0.25), th = TT(cues, 'halat', dur * 0.55), tk = TT(cues, 'keser', dur * 0.68);
          const bp = spring(lt, 0.05, 0.6);
          const up = [[-4, 0], [300, 0], [334, 12], [322, 62], [255, 108], [130, 150], [124, 330], [14, 330], [-6, 150]].map(q => X(q[0], q[1] + (1 - bp) * 30));
          pm.shape(up, C.paperDark, { t, w: 6, seed: 10 });
          pm.shape([[-8, -26], [300, -26], [338, -6], [334, 12], [300, 0], [-6, 0]].map(q => X(q[0], q[1] + (1 - bp) * 30)), C.inkSoft, { t, w: 5, seed: 12 });
          for (let i = 0; i < 5; i++) pm.line([X(110, 170 + i * 30), X(136, 184 + i * 30)], { t, w: 3, seed: 20 + i });
          pm.line([X(20, 120), X(250, 100)], { t, w: 3, col: C.inkSoft, seed: 30 });
          // screws + adze
          const strike = i => tv + 0.15 + i * 0.3;
          let cur = -1;
          screws.forEach((sx, i) => {
            const at = strike(i), p = spring(lt, at, 0.4), pk = punch(lt, at, 0.4);
            if (lt >= at - 0.02) {
              const [x, y] = X(sx, -26);
              pm.shape(ell(x, y - 6, 13 * (1 + 0.3 * pk), 8, 40 + i, 8), C.paperLight, { t, w: 4, seed: 50 + i * 3 });
              pm.line([[x - 7, y - 7], [x + 7, y - 5]], { t, w: 3, seed: 52 + i * 3 });
              if (pk > 0.05) for (let k = 0; k < 4; k++) {
                const a = -Math.PI / 2 + (k - 1.5) * 0.5, r0 = 22, r1 = 22 + 30 * pk;
                pf.line([[x + Math.cos(a) * r0, y - 6 + Math.sin(a) * r0], [x + Math.cos(a) * r1, y - 6 + Math.sin(a) * r1]], { t, w: 4, col: C.gold, seed: 70 + k });
              }
              cur = i;
            }
            void p;
          });
          // adze position: hammering until the last screw, then flies to its rest spot on cue keser
          const last = strike(screws.length - 1);
          let hx, hy, ang;
          const target = cur >= 0 ? X(screws[Math.min(cur + (lt > strike(cur) + 0.15 ? 1 : 0), screws.length - 1)], -26) : X(screws[0], -26);
          if (lt < last + 0.3) {
            const i = Math.max(0, Math.min(screws.length - 1, Math.round((lt - tv - 0.15) / 0.3)));
            const d = lt - strike(i), a = Math.abs(d) < 0.15 ? 1 - Math.abs(d) / 0.15 : 0;
            const sp = X(screws[i], -26);
            hx = sp[0] + 40; hy = sp[1] - 18 - (1 - a) * 90; ang = lerp(-55, -5, a);
            if (lt < tv) { hx = target[0] + 60; hy = target[1] - 130; ang = -55 + Math.sin(lt * 2) * 4; }
          } else {
            const fly = spring(lt, Math.max(tk, last + 0.3), 0.8), sp = X(screws[screws.length - 1], -26);
            hx = lerp(sp[0] + 40, restAdze[0], clamp01(fly)); hy = lerp(sp[1] - 108, restAdze[1] - 24, clamp01(fly)) - Math.sin(clamp01(fly) * Math.PI) * 120; ang = lerp(-55, -78, clamp01(fly));
          }
          const ca = Math.cos(ang * Math.PI / 180), sa = Math.sin(ang * Math.PI / 180), Lh = 210 * bs;
          const grip = [hx + ca * Lh, hy + sa * Lh];
          pf.line([[hx, hy], grip], { t, w: 11, col: C.inkSoft, seed: 90 });
          pf.line([[hx, hy], grip], { t, w: 3, seed: 91 });
          const nx = -sa, ny = ca;   // blade perpendicular to the handle
          pf.shape([[hx - nx * 34 - ca * 8, hy - ny * 34 - sa * 8], [hx + nx * 30 - ca * 26, hy + ny * 30 - sa * 26], [hx + nx * 40 - ca * 4, hy + ny * 40 - sa * 4], [hx - nx * 30 + ca * 12, hy - ny * 30 + sa * 12]], C.inkSoft, { t, w: 4, seed: 92 });
          // rope coil
          const rpS = spring(lt, th, 0.6);
          if (lt >= th) {
            const k = clamp01(rpS);
            ropeCoil(pf, rope[0], rope[1] - (1 - k) * 60, 115 * (0.5 + 0.5 * rpS), t, 120);
          }
          const to = TT(cues, 'ocak', dur * 0.75), ty = TT(cues, 'yiyecek', dur * 0.82);
          const so = spring(lt, to, 0.6), sb = spring(lt, ty, 0.6);
          if (so > 0.01) {   // small primus stove with a pot and a flame
            const k = so, x = stove[0], y = stove[1] - (1 - clamp01(k)) * 50, q = (a, b) => [x + a * k, y + b * k];
            pf.line([q(-36, 0), q(-20, -40)], { t, w: 5, seed: 130 }); pf.line([q(36, 0), q(20, -40)], { t, w: 5, seed: 131 });
            pf.shape([q(-30, -40), q(30, -40), q(34, -64), q(-34, -64)], C.inkSoft, { t, w: 4, seed: 132, smooth: false });
            const fl = Math.sin(lt * 14) * 5;
            pf.shape([q(-12, -66), q(0, -96 + fl), q(12, -66)], C.gold, { t, w: 3, seed: 134 });
            pf.shape([q(-46, -96), q(46, -96), q(40, -150), q(-40, -150)], C.paperDark, { t, w: 5, seed: 136, smooth: false });
            pf.line([q(-52, -150), q(52, -150)], { t, w: 6, seed: 138 });
            for (let i = 0; i < 2; i++) { const u = ((lt * 0.5 + i / 2) % 1); pf.line([q(-10 + i * 20, -160 - u * 50), q(-2 + i * 20 + Math.sin(u * 6) * 8, -190 - u * 50)], { t, w: 3, col: C.inkSoft, op: 1 - u, seed: 140 + i }); }
          }
          if (sb > 0.01) {   // food sack, tied at the neck
            const k = sb, x = bag[0], y = bag[1] - (1 - clamp01(k)) * 50, q = (a, b) => [x + a * k, y + b * k];
            pf.shape([q(-52, 0), q(-62, -60), q(-34, -112), q(-16, -124), q(16, -124), q(34, -112), q(62, -60), q(52, 0)], C.paperDark, { t, w: 5, seed: 150 });
            pf.shape([q(-22, -124), q(-30, -156), q(0, -146), q(30, -158), q(22, -124)], C.paperDark, { t, w: 4, seed: 152 });
            pf.line([q(-24, -126), q(24, -126)], { t, w: 6, col: C.stain, seed: 154 });
            pf.line([q(-30, -50), q(-6, -40), q(20, -56)], { t, w: 3, col: C.inkSoft, seed: 155 });
          }
          pb.end(); pm.end(); pf.end();
          // labels
          const sv = X(160, -26);
          place(lab.vida, sv[0], sv[1] - 120, spring(lt, tv + 0.5, 0.6), -4, t, seed + 31);
          place(lab.halat, rope[0], rope[1] + 0 - 90, spring(lt, th + 0.2, 0.6), 3, t, seed + 32);
          place(lab.keser, restAdze[0] + 10, restAdze[1] - 300, spring(lt, Math.max(tk, last + 0.3) + 0.5, 0.6), -3, t, seed + 33);
          place(lab.ocak, stove[0], stove[1] - 225, spring(lt, TT(cues, 'ocak', dur * 0.75) + 0.2, 0.6), 3, t, seed + 34);
          place(lab.erzak, bag[0], bag[1] - 205, spring(lt, TT(cues, 'yiyecek', dur * 0.82) + 0.2, 0.6), -3, t, seed + 35);
          updateCast(cast, lt, t, cues, W, H, gy);
        },
      };
    },
  };

  // ================================================================ end_c_ridge
  SH.end_c_ridge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), mid = el(root, 'g'), castG = el(root, 'g'), fogG = el(root, 'g'), fr = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pm = Pen(mid, seed + 1), pfog = Pen(fogG, seed + 2), pf = Pen(fr, seed + 3);
      const ridge = [[-60, 1.08 * H], [-60, 0.78 * H], [0.12 * W, 0.66 * H], [0.24 * W, 0.55 * H], [0.34 * W, 0.46 * H], [0.42 * W, 0.405 * H], [0.5 * W, 0.395 * H],
        [0.57 * W, 0.41 * H], [0.63 * W, 0.52 * H], [0.7 * W, 0.68 * H], [0.76 * W, 0.86 * H], [0.79 * W, 1.08 * H]];
      const crestY = x => { // y on the ridge top line for x in 0.36..0.6 W
        for (let i = 3; i < ridge.length - 1; i++) if (x >= ridge[i][0] && x <= ridge[i + 1][0]) return lerp(ridge[i][1], ridge[i + 1][1], (x - ridge[i][0]) / (ridge[i + 1][0] - ridge[i][0]));
        return 0.4 * H;
      };
      const men = P.men || [
        { who: 'shackleton', x: 0.445, beard: 'short', face: 'left', pose: 'look', at: 'sis', then: 'point', dir: -20, emotion: 'worried' },
        { who: 'worsley', x: 0.495, beard: 'short', face: 'left', pose: 'idle', at: 'sis', then: 'shock', emotion: 'worried' },
        { who: 'crean', x: 0.545, beard: 'black', face: 'left', pose: 'idle', at: 'don', then: 'think', emotion: 'worried' },
      ];
      men.forEach(m => { m.scale = m.scale ?? 0.36; m.y = crestY(m.x * W) / H + 0.004; });
      const LB = P.label ? Object.assign({ x: 0.5, y: 0.26 }, P.label) : null, lbT = LB ? Txt(ui, LB.text, 72, { fill: C.red }) : null;
      const crew = makeCast(castG, men, seed, H);
      const kas = makeCast(kG, P.cast || [{ who: 'kasif', x: 0.89, y: 0.86, scale: 0.55, face: 'left', pose: 'look', at: 'don', then: 'shock', emotion: 'worried' }], seed + 50, H);
      const fogLab = Txt(ui, P.fog_label || 'Sis', 72, { fill: C.ink });
      const r = rng(seed * 3 + 7), hatch = [];
      for (let i = 0; i < 26; i++) { const x = (0.55 + r() * 0.25) * W, y = (0.5 + r() * 0.45) * H; if (y > crestY(Math.min(x, 0.6 * W)) + 40) hatch.push([[x, y], [x + 26, y - 18]]); }
      const sky = []; for (let i = 0; i < 18; i++) { const x = (0.3 + r() * 0.7) * W, y = (0.08 + r() * 0.2) * H; sky.push([[x, y], [x + 60, y - 14]]); }
      const puffs = Array.from({ length: 9 }, (_, i) => ({ x: (0.02 + i * 0.05) * W, y: (0.9 + (i % 3) * 0.05) * H, r: (60 + r() * 30) * H / 1080, dx: (0.04 + r() * 0.06) * W, dy: (0.18 + (8 - i) * 0.022) * H }));
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.06, [0.5, 0.45]);
          pb.begin(); pm.begin(); pfog.begin(); pf.begin();
          sky.forEach((s, i) => pb.line(s, { t, w: 3, col: C.inkSoft, op: 0.45, seed: 400 + i }));
          sunAt(pb, 0.83 * W, 0.5 * H + lt * 3, 62, t, lt, 300);
          const rp = rangePts(W, H, seed + 5, 0.66 * H, 0.26 * H, 6);
          pb.shape(rp, C.paperDark, { t, w: 4, col: C.inkSoft, seed: 310 });
          capsOf(rp).forEach((c, i) => pb.line(c, { t, w: 3, col: C.inkSoft, seed: 330 + i }));
          pm.shape(ridge, C.paperLight, { t, w: 6, seed: 350, smooth: false });
          hatch.forEach((h, i) => pm.line(h, { t, w: 3, col: C.inkSoft, seed: 360 + i }));
          for (let i = 0; i < 4; i++) pm.shape(ell((0.2 + i * 0.12) * W, (0.78 - i * 0.07) * H, 40, 18, 370 + i, 8), C.inkSoft, { t, w: 3, seed: 380 + i * 2, op: 0.8 });
          // fog bank climbing from the valley
          const ts = TT(cues, 'sis', dur * 0.45), f = progIO(lt, ts - 0.4, Math.max(1.2, dur - ts + 0.4));
          if (P.fog !== false) puffs.forEach((p, i) => puff(pfog, p.x + f * p.dx + Math.sin(lt * 0.6 + i) * 14, p.y - f * p.dy, p.r * (1 + 0.25 * f), t, 500 + i * 3, 0.95));
          // foreground ledge for Kaşif
          pf.shape([[0.74 * W, 1.08 * H], [0.76 * W, 0.87 * H], [0.84 * W, 0.855 * H], [0.95 * W, 0.86 * H], [1.04 * W, 0.84 * H], [1.04 * W, 1.08 * H]], C.paperDark, { t, w: 5, seed: 600 });
          const pos = updateCast(crew, lt, t, cues, W, H, 0.4 * H);
          for (let i = 0; i + 1 < pos.length; i++) {      // the rope between the men
            const a = pos[i].hip, b = pos[i + 1].hip, m2 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 22];
            pf.line([a, m2, b], { t, w: 4, col: C.stain, seed: 620 + i });
          }
          pb.end(); pm.end(); pfog.end(); pf.end();
          if (lbT) place(lbT, LB.x * W, LB.y * H, spring(lt, TT(cues, LB.at || 'label', 0.6), 0.6) * (1 + 0.1 * punch(lt, TT(cues, LB.at || 'label', 0.6))), -3, t, seed + 42);
          if (P.fog === false) fogLab.setAttribute('opacity', 0); else place(fogLab, 0.18 * W + f * 0.05 * W, 0.6 * H - f * 0.08 * H, spring(lt, ts + 0.2, 0.6), -5, t, seed + 41);
          updateCast(kas, lt, t, cues, W, H, 0.86 * H);
        },
      };
    },
  };

  // ================================================================ end_c_slide
  SH.end_c_slide = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'top';
      const root = el(svg, 'g'), bg = el(root, 'g'), mid = el(root, 'g'), castG = el(root, 'g'), fr = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pm = Pen(mid, seed + 1), pf = Pen(fr, seed + 2);
      const S = [[0.0, 0.44], [0.22, 0.44], [0.3, 0.49], [0.41, 0.58], [0.52, 0.67], [0.63, 0.74], [0.75, 0.79], [0.86, 0.805], [1.06, 0.81]].map(q => [q[0] * W, q[1] * H]);
      const curve = inkSpline([[-80, 0.44 * H], ...S], false, 6);
      const cum = [0]; for (let i = 1; i < curve.length; i++) cum.push(cum[i - 1] + Math.hypot(curve[i][0] - curve[i - 1][0], curve[i][1] - curve[i - 1][1]));
      const Ltot = cum[cum.length - 1];
      const at = d => {
        d = Math.max(0, Math.min(Ltot - 1, d));
        let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
        const u = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]), a = curve[i - 1], b = curve[i];
        return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI };
      };
      const dAtX = x => { for (let i = 0; i < curve.length; i++) if (curve[i][0] >= x) return cum[i]; return Ltot; };
      const d0 = dAtX(0.27 * W), dEnd = dAtX(0.69 * W), gap = 112 * H / 1080;
      const men = [
        { who: 'shackleton', beard: 'short', face: 'right', scale: 0.5 },
        { who: 'worsley', beard: 'short', face: 'right', scale: 0.5 },
        { who: 'crean', beard: 'black', face: 'right', scale: 0.5 },
      ];
      const crew = makeCast(castG, men, seed, H);
      const kas = makeCast(kG, P.cast || [{ who: 'kasif', x: 0.9, y: 0.815, scale: 0.55, face: 'left', pose: 'idle', at: 'kay', then: 'shock', emotion: 'surprised' }], seed + 50, H);
      const bang = Txt(ui, '!', 130, { font: FR, weight: 900, fill: C.red });
      const hT = P.height ? Txt(ui, P.height.text || 'yüzlerce metre', 60, { fill: C.red }) : null;
      const r = rng(seed * 7 + 3), hatch = [];
      for (let i = 0; i < 40; i++) { const x = r() * W, d = dAtX(x), p = at(d), y = p.y + 40 + r() * (H - p.y - 60); hatch.push([[x, y], [x + 24, y - 14]]); }
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.04, mode === 'top' ? [0.3, 0.4] : [0.6, 0.7]);
          pb.begin(); pm.begin(); pf.begin();
          const rp = rangePts(W, H, seed + 9, 0.62 * H, 0.32 * H, 6, 0.2, 1.08);
          pb.shape(rp, C.paperDark, { t, w: 4, col: C.inkSoft, seed: 700 });
          capsOf(rp).forEach((c, i) => pb.line(c, { t, w: 3, col: C.inkSoft, seed: 720 + i }));
          pm.fill([...curve, [W + 80, H + 40], [-80, H + 40]], C.paperLight, { t, seed: 740, amp: 0.8 });
          pm.line(curve, { t, w: 6, seed: 741, amp: 1 });
          hatch.forEach((h, i) => pm.line(h, { t, w: 3, col: C.inkSoft, seed: 760 + i, op: 0.7 }));
          // where is the lead slider?
          const tOt = TT(cues, 'otur', dur * 0.5), tK = TT(cues, 'kay', dur * 0.7);
          const tLand = TT(cues, 'land', Math.min(2.4, dur * 0.45)), tUp = TT(cues, 'up', dur * 0.7);
          let dl, sitting, speed = 0;
          if (mode === 'top') {
            sitting = lt >= tOt;
            const tS = Math.min(tK, tOt + 0.45), rem = Math.max(0.6, dur - tS), acc = 2 * (dAtX(0.64 * W) - d0) / (rem * rem);
            const tau = Math.max(0, lt - tS);
            dl = d0 + 0.5 * acc * tau * tau; speed = acc * tau;
          } else {
            sitting = lt < tUp;
            const u = clamp01(lt / tLand), e = 1 - (1 - u) * (1 - u);
            dl = lerp(dAtX(0.42 * W), dEnd, e); speed = (1 - u) * 900;
          }
          // tracks behind the sliders
          if (speed > 1 || mode === 'bottom') {
            const from = mode === 'top' ? d0 - gap * 2 : 0, to = dl - gap * 2;
            if (to > from + 10) {
              const pts = []; for (let d = from; d <= to; d += 20) { const p = at(d); pts.push([p.x, p.y + 2]); }
              if (pts.length > 1) pm.line(pts, { t, w: 4, col: C.inkSoft, seed: 800 });
            }
          }
          pb.end(); pm.end();
          const pos = updateCast(crew, lt, t, cues, W, H, 0, (c, i) => {
            const p = at(dl - i * gap);
            const ov = { x: p.x, y: p.y + 2, rot: sitting ? p.ang * 0.9 : 0, face: 1 };
            if (sitting) { ov.pose = 'sit'; ov.emotion = mode === 'top' && lt >= tOt + 0.45 ? 'surprised' : null; }
            else if (mode === 'top') { ov.pose = i === 0 && lt >= TT(cues, P.idea || 'fikir', 1e9) ? 'point' : (i === 0 ? 'think' : 'idle'); }
            else { ov.pose = lt - tUp < 0.7 ? 'idle' : (i === 1 ? 'shrug' : 'wave'); ov.emotion = 'happy'; }
            return ov;
          });
          // rope coil under the sitters, spray + speed lines
          if (sitting) pos.forEach((q, i) => {
            const p = at(dl - i * gap), sp = mode === 'top' ? spring(lt, tOt + i * 0.08, 0.5) : 1;
            if (sp > 0.02) ropeCoil(pf, p.x - 6, p.y + 4, 78 * H / 1080 * clamp01(sp), t, 820 + i * 10);
          });
          if (speed > 60) {
            const k = clamp01(speed / 700), tail = at(dl - gap * 2.6);
            for (let j = 0; j < 7; j++) {
              const ph = ((lt * 2.4 + j / 7) % 1), a = (tail.ang - 160 + j * 9) * Math.PI / 180;
              pf.dot(tail.x + Math.cos(a) * ph * 120, tail.y - 10 + Math.sin(a) * ph * 90 - ph * 30, (6 + 8 * (1 - ph)) * k, C.inkSoft, { t, op: (1 - ph) * k, seed: 860 + j });
            }
            for (let j = 0; j < 3; j++) {
              const p = at(dl - gap * (3.2 + j * 0.6)), off = -70 - j * 34;
              const n = [Math.sin(p.ang * Math.PI / 180), -Math.cos(p.ang * Math.PI / 180)];
              const c = Math.cos(p.ang * Math.PI / 180), s = Math.sin(p.ang * Math.PI / 180), len = 90 * k;
              pf.line([[p.x - n[0] * off - c * len, p.y + n[1] * -off - s * len], [p.x - n[0] * off, p.y + n[1] * -off]], { t, w: 4, col: C.inkSoft, seed: 880 + j, op: k });
            }
          }
          if (mode === 'bottom' && lt >= tLand - 0.1) {   // snow burst where they stop
            const e = clamp01((lt - tLand + 0.1) / 1.4), p = at(dEnd + 40);
            for (let j = 0; j < 6; j++) puff(pf, p.x + Math.cos(j * 1.1) * 80 * e + 20, p.y - 20 - Math.abs(Math.sin(j * 1.7)) * 90 * e, (24 + 20 * e) * H / 1080, t, 900 + j * 3, 1 - e * 0.85);
          }
          pf.end();
          // red "!" over the leader on the idea cue
          const ti = TT(cues, P.idea || 'fikir', null);
          if (mode === 'top' && ti != null && lt >= ti) place(bang, pos[0].head[0] + 10, pos[0].head[1] - 110 * H / 1080, spring(lt, ti, 0.5) * (1 + 0.15 * punch(lt, ti)), 6, t, seed + 61);
          else bang.setAttribute('opacity', 0);
          if (hT) {
            const ta = TT(cues, P.height.at || 'yuz', 0.6), pa = prog(lt, ta, 0.8);
            place(hT, 0.065 * W, 0.62 * H, spring(lt, ta + 0.3, 0.6), -90, t, seed + 62);
            // vertical double arrow
            const x = 0.1 * W, y0 = 0.44 * H, y1 = 0.8 * H, ym = lerp(y0, y1, pa);
            if (pa > 0.01) {
              pf.begin();
              pf.line([[x, y0], [x + 2, ym]], { t, w: 6, col: C.red, seed: 950 });
              pf.line([[x - 20, y0 + 26], [x, y0], [x + 20, y0 + 26]], { t, w: 6, col: C.red, smooth: false, seed: 951 });
              if (pa > 0.95) pf.line([[x - 20, y1 - 26], [x, y1], [x + 20, y1 - 26]], { t, w: 6, col: C.red, smooth: false, seed: 952 });
              pf.end();
            }
          }
          updateCast(kas, lt, t, cues, W, H, 0.815 * H);
        },
      };
    },
  };

  // ================================================================ end_c_nap
  SH.end_c_nap = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), castG = el(root, 'g'), fr = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pf = Pen(fr, seed + 2);
      const gy = 0.78 * H;
      const crew = makeCast(castG, [
        { who: 'worsley', x: 0.17, beard: 'short', scale: 0.5, face: 'right', pose: 'sit', at: 'wake', then: 'idle', emotion: 'surprised' },
        { who: 'crean', x: 0.28, beard: 'black', scale: 0.5, face: 'right', pose: 'sit', at: 'wake', then: 'shrug', emotion: 'surprised' },
        { who: 'shackleton', x: 0.41, beard: 'short', scale: 0.5, face: 'left', pose: 'sit', at: 'wake', then: 'talk' },
      ], seed, H);
      const kas = makeCast(kG, P.cast || [{ who: 'kasif', x: 0.91, scale: 0.58, face: 'left', pose: 'think', at: 'five', then: 'point', dir: 25, emotion: 'happy' }], seed + 50, H);
      const t30 = Txt(ui, P.half_text || '30 dk', 76, { font: FR, weight: 900 });
      const t5 = Txt(ui, P.five_text || '5 dk', 84, { font: FR, weight: 900, fill: C.red });
      const r = rng(seed * 11 + 1), stars = Array.from({ length: 16 }, () => [(0.3 + r() * 0.7) * W, (0.06 + r() * 0.28) * H, r()]);
      const WX = 0.66 * W, WY = 0.4 * H, R = 150 * H / 1080;
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.05, [0.5, 0.5]);
          pb.begin(); pf.begin();
          stars.forEach((s, i) => { const k = 8 + 6 * Math.sin(lt * 2 + s[2] * 9); pb.line([[s[0] - k, s[1]], [s[0] + k, s[1]]], { t, w: 3, col: C.inkSoft, seed: 100 + i }); pb.line([[s[0], s[1] - k], [s[0], s[1] + k]], { t, w: 3, col: C.inkSoft, seed: 130 + i }); });
          // crescent moon
          const mx = 0.5 * W, my = 0.14 * H;
          pb.shape([[mx - 30, my - 50], [mx + 20, my - 30], [mx + 34, my + 4], [mx + 18, my + 40], [mx - 26, my + 54], [mx - 4, my + 22], [mx, my - 6], [mx - 8, my - 30]], C.paperLight, { t, w: 4, seed: 160 });
          // rock shelter + snow ledge
          pb.shape([[-60, gy], [-60, 0.3 * H], [0.06 * W, 0.26 * H], [0.16 * W, 0.34 * H], [0.22 * W, 0.42 * H], [0.18 * W, 0.5 * H], [0.24 * W, gy]], C.paperDark, { t, w: 5, seed: 170 });
          for (let i = 0; i < 6; i++) pb.line([[0.02 * W + i * 30, 0.4 * H + i * 40], [0.06 * W + i * 30, 0.38 * H + i * 40]], { t, w: 3, col: C.inkSoft, seed: 180 + i });
          pb.fill([[-60, gy], [W + 60, gy], [W + 60, H + 30], [-60, H + 30]], C.paperLight, { t, seed: 190 });
          pb.line(seg([-60, gy + 3], [W + 60, gy - 3], 14), { t, w: 6, seed: 191 });
          // pocket watch
          const ws = spring(lt, 0.1, 0.6);
          pb.line([[WX, WY - R - 6], [WX, WY - R - 40]], { t, w: 8, seed: 200 });
          pb.shape(ell(WX, WY - R - 54, 22, 18, 201, 10), C.paperLight, { t, w: 5, seed: 202 });
          pb.shape(ell(WX, WY, R * ws, R * ws, 203, 18), C.paperLight, { t, w: 8, seed: 204 });
          const t5c = TT(cues, 'five', dur * 0.75), th = TT(cues, 'half', dur * 0.5);
          if (lt >= t5c) {   // the real 5 minutes as a gold wedge
            const pk = prog(lt, t5c, 0.6), wp = [[WX, WY]];
            for (let i = 0; i <= 8; i++) { const a = (-90 + 30 * pk * i / 8) * Math.PI / 180; wp.push([WX + Math.cos(a) * R * 0.86, WY + Math.sin(a) * R * 0.86]); }
            pb.fill(wp, C.gold, { t, seed: 205, op: 0.75 });
          }
          for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r1 = R * 0.86, r2 = R * (i % 3 ? 0.78 : 0.7); pb.line([[WX + Math.cos(a) * r1, WY + Math.sin(a) * r1], [WX + Math.cos(a) * r2, WY + Math.sin(a) * r2]], { t, w: i % 3 ? 3 : 6, seed: 210 + i }); }
          const mA = (-90 + 30 * clamp01(lt / Math.max(1, dur))) * Math.PI / 180, sA = (-90 + lt * 300) * Math.PI / 180;
          pb.line([[WX, WY], [WX + Math.cos(mA) * R * 0.74, WY + Math.sin(mA) * R * 0.74]], { t, w: 8, seed: 230 });
          pb.line([[WX, WY], [WX + Math.cos(-60 * Math.PI / 180) * R * 0.5, WY + Math.sin(-60 * Math.PI / 180) * R * 0.5]], { t, w: 10, seed: 231 });
          pb.line([[WX, WY], [WX + Math.cos(sA) * R * 0.8, WY + Math.sin(sA) * R * 0.8]], { t, w: 3, col: C.red, seed: 232 });
          pb.dot(WX, WY, 10, C.ink, { t, seed: 233 });
          pb.end();
          const tw = TT(cues, 'wake', dur * 0.4);
          const pos = updateCast(crew, lt, t, cues, W, H, gy);
          if (lt < tw) pos.slice(0, 2).forEach((q, i) => zzz(pf, q.head[0] + 30, q.head[1] - 50, lt, t, 300 + i * 10));
          // strike-through over "30 dk"
          const lx30 = 0.58 * W, lx5 = 0.76 * W, ly = 0.74 * H;
          if (lt >= t5c) { const p = prog(lt, t5c, 0.4); pf.line(partial(seg([lx30 - 90, ly - 10], [lx30 + 90, ly - 40], 8), p), { t, w: 9, col: C.red, seed: 320 }); }
          pf.end();
          place(t30, lx30, ly, spring(lt, th, 0.6), -3, t, seed + 71);
          place(t5, lx5, ly, spring(lt, t5c + 0.25, 0.6) * (1 + 0.1 * punch(lt, t5c + 0.25)), 4, t, seed + 72);
          updateCast(kas, lt, t, cues, W, H, gy);
        },
      };
    },
  };

  // ================================================================ end_c_whistle
  SH.end_c_whistle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), mid = el(root, 'g'), castG = el(root, 'g'), fr = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pm = Pen(mid, seed + 1), pf = Pen(fr, seed + 2);
      const hill = [[-60, H + 30], [-60, 0.6 * H], [0.08 * W, 0.575 * H], [0.2 * W, 0.565 * H], [0.3 * W, 0.6 * H], [0.38 * W, 0.68 * H], [0.44 * W, 0.8 * H], [0.5 * W, H + 30]];
      const hillY = x => { for (let i = 1; i < hill.length - 1; i++) if (x >= hill[i][0] && x <= hill[i + 1][0]) return lerp(hill[i][1], hill[i + 1][1], (x - hill[i][0]) / (hill[i + 1][0] - hill[i][0])); return 0.6 * H; };
      const men = [
        { who: 'shackleton', x: 0.13, beard: 'short', face: 'right', scale: 0.42, pose: 'idle', at: 'duduk', then: 'look', seq: [{ at: 'muzik', pose: 'wave', emotion: 'happy' }] },
        { who: 'worsley', x: 0.19, beard: 'short', face: 'right', scale: 0.42, pose: 'idle', at: 'duduk', then: 'shock', seq: [{ at: 'muzik', pose: 'point', dir: 30, emotion: 'happy' }] },
        { who: 'crean', x: 0.25, beard: 'black', face: 'right', scale: 0.42, pose: 'idle', at: 'duduk', then: 'idle', emotion: 'surprised', seq: [{ at: 'muzik', pose: 'wave', emotion: 'happy' }] },
      ];
      men.forEach(m => { m.y = hillY(m.x * W) / H; });
      const k0 = (P.cast && P.cast[0]) || { who: 'kasif', x: 0.355, scale: 0.5, face: 'right', pose: 'idle', at: 'duduk', then: 'point', dir: 10, emotion: 'surprised', seq: [{ at: 'muzik', pose: 'wave', emotion: 'happy' }] };
      if (k0.y == null) k0.y = hillY(k0.x * W) / H;
      const crew = makeCast(castG, men.concat([k0]), seed, H);
      const lab = Txt(ui, (P.label && P.label.text) || 'Stromness', 60);
      const st = { x0: 0.6 * W, y: 0.63 * H };
      const r = rng(seed * 13 + 5), sheds = [];
      for (let i = 0, x = st.x0; i < 6; i++) { const w = (70 + r() * 60) * H / 1080, h = (50 + r() * 50) * H / 1080; sheds.push({ x, w, h }); x += w + 14; }
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.05, [0.6, 0.55]);
          pb.begin(); pm.begin(); pf.begin();
          sunAt(pb, 0.86 * W, 0.4 * H - lt * 4, 58, t, lt, 100);
          const rp = rangePts(W, H, seed + 3, 0.6 * H, 0.26 * H, 6, 0.38, 1.08);
          pb.shape(rp, C.paperDark, { t, w: 4, col: C.inkSoft, seed: 120 });
          capsOf(rp).forEach((c, i) => pb.line(c, { t, w: 3, col: C.inkSoft, seed: 140 + i }));
          // shore strip + bay water
          pb.fill([[0.42 * W, 0.6 * H], [1.08 * W, 0.6 * H], [1.08 * W, 0.66 * H], [0.42 * W, 0.66 * H]], C.paperLight, { t, seed: 160 });
          pb.line(seg([0.42 * W, 0.66 * H], [1.08 * W, 0.66 * H], 10), { t, w: 4, seed: 161 });
          waves(pb, 0.46 * W, 1.06 * W, 0.71 * H, lt, t, 170, 3, 6);
          // station: sheds, chimney, jetty
          sheds.forEach((s, i) => {
            const by = st.y;
            pm.shape([[s.x, by], [s.x, by - s.h], [s.x + s.w, by - s.h], [s.x + s.w, by]], C.paperLight, { t, w: 4, seed: 200 + i * 4, smooth: false });
            pm.shape([[s.x - 8, by - s.h], [s.x + s.w / 2, by - s.h - s.w * 0.32], [s.x + s.w + 8, by - s.h]], i % 2 ? C.inkSoft : C.red, { t, w: 4, seed: 202 + i * 4, smooth: false });
          });
          const cx = sheds[2].x + sheds[2].w * 0.7, cy = st.y - sheds[2].h;
          pm.line([[cx, cy], [cx, cy - 120]], { t, w: 12, seed: 240 });
          for (let i = 0; i < 4; i++) { const u = ((lt * 0.2 + i / 4) % 1); puff(pm, cx + u * 80, cy - 140 - u * 130, 14 + u * 22, t, 250 + i * 3, 1 - u * 0.8); }
          pm.line([[sheds[4].x, st.y + 4], [sheds[4].x + 20, 0.69 * H]], { t, w: 6, seed: 270 });
          pm.line([[sheds[4].x - 10, 0.665 * H], [sheds[5].x + sheds[5].w + 40, 0.665 * H]], { t, w: 6, seed: 271 });
          // whistle pipe + steam blasts
          const wx = sheds[1].x + sheds[1].w * 0.5, wy = st.y - sheds[1].h - sheds[1].w * 0.32;
          pm.line([[wx, wy], [wx, wy - 26]], { t, w: 7, seed: 280 });
          const td = TT(cues, 'duduk', dur * 0.3), tm = TT(cues, 'muzik', dur * 0.75);
          for (let b = 0; b < 3; b++) {
            const tb = td + b * 0.8, u = clamp01((lt - tb) / 1.4);
            if (lt >= tb && u < 1) for (let j = 0; j < 3; j++) puff(pm, wx + j * 14 + u * 30, wy - 40 - u * 110 - j * 26, (10 + u * 30) * (1 - j * 0.15), t, 300 + b * 10 + j * 3, 1 - u);
          }
          pb.end(); pm.end();
          // hill (front) with the men
          pf.shape(hill, C.paperLight, { t, w: 6, seed: 400, smooth: false });
          for (let i = 0; i < 8; i++) { const x = (0.03 + i * 0.05) * W, y = hillY(x) + 60 + (i % 3) * 40; pf.line([[x, y], [x + 24, y - 14]], { t, w: 3, col: C.inkSoft, seed: 410 + i }); }
          // music notes floating from the station to the men
          if (lt >= td + 0.3) for (let j = 0; j < 7; j++) {
            const t0 = td + 0.3 + j * 0.45, u = (lt - t0) / 3.2;
            if (u <= 0 || u >= 1) continue;
            const x = lerp(wx, 0.24 * W, u) + Math.sin(u * 9 + j) * 30, y = lerp(wy - 60, 0.32 * H, u) - Math.sin(u * Math.PI) * 120;
            const col = lt >= tm ? C.gold : C.ink, op = Math.min(1, u * 6, (1 - u) * 4), s = 1 + 0.25 * punch(lt, tm);
            pf.fill(ell(x, y, 15 * s, 11 * s, 500 + j, 8, -0.4), col, { t, op, seed: 510 + j * 3 });
            pf.line([[x + 13 * s, y - 4], [x + 13 * s, y - 70 * s]], { t, w: 5, col, op, seed: 511 + j * 3 });
            pf.line([[x + 13 * s, y - 70 * s], [x + 34 * s, y - 50 * s], [x + 30 * s, y - 34 * s]], { t, w: 5, col, op, seed: 512 + j * 3 });
          }
          pf.end();
          place(lab, sheds[2].x + 40, 0.76 * H, spring(lt, TT(cues, (P.label && P.label.at) || 'strom', td + 0.8), 0.6), -2, t, seed + 81);
          updateCast(crew, lt, t, cues, W, H, 0.6 * H);
        },
      };
    },
  };

  // ================================================================ end_c_hut
  SH.end_c_hut = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const mode = P.mode || 'wait';
      const root = el(svg, 'g'), bg = el(root, 'g'), mid = el(root, 'g'), castG = el(root, 'g'), fr = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pm = Pen(mid, seed + 1), pf = Pen(fr, seed + 2);
      const hz = 0.5 * H, beach = 0.72 * H, gy = 0.76 * H;
      const cliff = [[0.44 * W, beach], [0.48 * W, 0.42 * H], [0.53 * W, 0.3 * H], [0.6 * W, 0.24 * H], [0.68 * W, 0.2 * H], [0.78 * W, 0.15 * H], [0.9 * W, 0.12 * H], [1.06 * W, 0.11 * H], [1.06 * W, beach]];
      const glacier = [[0.66 * W, 0.21 * H], [0.74 * W, 0.17 * H], [0.84 * W, 0.14 * H], [0.86 * W, 0.3 * H], [0.8 * W, 0.42 * H], [0.74 * W, 0.4 * H], [0.7 * W, 0.3 * H]];
      let list = [];
      if (mode === 'wait') {
        list.push(Object.assign({ who: 'wild', accessory: 'beret', beard: 'black', x: 0.5, scale: 0.55, face: 'left', pose: 'hold', item: 'scroll',
          seq: [{ at: 'quote', pose: 'walk', to: 0.35, dur: 1.2, then: 'point', dir: 12, face: 'left', emotion: 'happy' }] }, P.wild || {}));
        list.push({ who: 'm1', x: 0.8, scale: 0.4, face: 'left', pose: 'sit', beard: 'short' }, { who: 'm2', x: 0.89, scale: 0.4, face: 'left', pose: 'sit', beard: 'grey', at: 'quote', then: 'sit', emotion: 'happy' });
      } else if (mode === 'shelter') {
        for (let i = 0; i < 6; i++) list.push({ who: 's' + i, x: 0.3 + i * 0.05, scale: 0.42, face: 'right', pose: 'idle', beard: ['short', 'black', 'grey'][i % 3], vanish: true,
          seq: [{ at: 0.3 + (5 - i) * 0.55, pose: 'walk', to: 0.6, dur: 0.9 + i * 0.25, then: 'idle' }] });
      } else {
        for (let i = 0; i < 9; i++) list.push({ who: 'm' + i, x: 0.28 + i * 0.032, y: 0.735 + (i % 2) * 0.02, scale: 0.3, face: 'left', pose: 'idle',
          beard: ['short', 'black', 'grey'][i % 3], seq: [{ at: 'wave', pose: i % 3 === 1 ? 'point' : 'wave', dir: 30, emotion: 'happy' }] });
      }
      const crew = makeCast(castG, list, seed, H);
      const kas = makeCast(kG, P.cast || (mode === 'wait'
        ? [{ who: 'kasif', x: 0.12, y: 0.82, scale: 0.55, face: 'right', pose: 'think', at: 'quote', then: 'point', dir: 15, emotion: 'happy' }]
        : [{ who: 'kasif', x: 0.9, y: 0.84, scale: 0.55, face: 'left', pose: 'look', at: 'done', then: 'point', dir: 20, emotion: 'happy' }]), seed + 50, H);
      const Q = P.quote || { text: '“Patron bugün gelebilir”', at: 'quote' };
      const SL = mode === 'shelter' ? Object.assign({ text: '22 kişi', at: 'n22' }, P.label || {}) : null, slT = SL ? Txt(ui, SL.text, 84, { font: FR, weight: 900, fill: C.red }) : null;
      const qT = mode === 'wait' ? Txt(ui, Q.text, 64) : null;
      const cnt = mode === 'rescue' ? Txt(ui, '0', 170, { font: FR, weight: 900, fill: C.gold, halo: C.ink, haloK: 0.05 }) : null;
      const cntSub = mode === 'rescue' ? Txt(ui, P.count_label || 'kişi', 60) : null;
      const N = P.count || 22;
      const r = rng(seed * 17 + 3), pebbles = Array.from({ length: 30 }, () => [r() * W, beach + 30 + r() * (H - beach - 50), 6 + r() * 8]);
      const fog = Array.from({ length: 8 }, (_, i) => ({ x: (0.02 + i * 0.065) * W, y: (0.43 + (i % 3) * 0.04) * H, r: (50 + r() * 26) * H / 1080 }));
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.05, mode === 'wait' ? [0.4, 0.6] : [0.35, 0.55]);
          pb.begin(); pm.begin(); pf.begin();
          if (mode === 'wait') sunAt(pb, 0.2 * W, hz + 10 - lt * 5, 54, t, lt, 100);
          // sea
          pb.fill([[-60, hz], [0.5 * W, hz], [0.5 * W, beach], [-60, beach]], C.paperLight, { t, seed: 110, op: 0.6 });
          pb.line(seg([-60, hz], [0.5 * W, hz], 10), { t, w: 3, col: C.inkSoft, seed: 111 });
          waves(pb, 0, 0.46 * W, hz + 40, lt, t, 120, 4, 6);
          // cliffs + glacier
          pb.shape(cliff, C.paperDark, { t, w: 5, seed: 130, smooth: false });
          pb.shape(glacier, C.paperLight, { t, w: 4, col: C.inkSoft, seed: 132 });
          for (let i = 0; i < 10; i++) { const x = (0.5 + i * 0.05) * W, y = (0.36 + (i % 4) * 0.08) * H; pb.line([[x, y], [x + 30, y - 22]], { t, w: 3, col: C.inkSoft, seed: 140 + i }); }
          // beach
          pb.fill([[-60, beach], [W + 60, beach], [W + 60, H + 30], [-60, H + 30]], C.paperLight, { t, seed: 160 });
          const foam = []; for (let x = -60; x <= 0.5 * W; x += 30) foam.push([x, beach + Math.sin(x * 0.03 + lt * 1.8) * 5]);
          pb.line(foam, { t, w: 5, seed: 161 });
          pebbles.forEach((p, i) => pb.line(ell(p[0], p[1], p[2], p[2] * 0.6, 170 + i, 7), { t, w: 2.5, col: C.inkSoft, closed: true, seed: 171 + i }));
          // the boat hut
          boatHut(pm, 0.68 * W, gy - 10, H / 1080 * 0.95, t, lt, 300);
          // rescue: Yelcho + fog
          if (mode === 'rescue') {
            const ts = TT(cues, 'sis', 0.4), tsh = TT(cues, 'ship', ts + 0.8), fo = progIO(lt, ts, 2.2);
            const sp = prog(lt, tsh - 0.4, 1.6), sx = lerp(0.18, 0.26, prog(lt, 0, dur)) * W, sy = hz + 18 + Math.sin(lt * 1.5) * 3;
            if (sp > 0.01) {
              const s = H / 1080 * 1.0, o = sp;
              pm.shape([[sx - 150 * s, sy - 30 * s], [sx + 160 * s, sy - 36 * s], [sx + 120 * s, sy + 8 * s], [sx - 120 * s, sy + 8 * s]], C.inkSoft, { t, w: 4, seed: 400, op: o });
              pm.shape([[sx - 70 * s, sy - 32 * s], [sx - 66 * s, sy - 70 * s], [sx + 50 * s, sy - 72 * s], [sx + 54 * s, sy - 34 * s]], C.paperLight, { t, w: 4, seed: 402, op: o, smooth: false });
              pm.shape([[sx - 14 * s, sy - 70 * s], [sx - 12 * s, sy - 132 * s], [sx + 14 * s, sy - 132 * s], [sx + 16 * s, sy - 70 * s]], C.ink, { t, w: 3, seed: 404, op: o, smooth: false });
              pm.line([[sx - 13 * s, sy - 112 * s], [sx + 15 * s, sy - 112 * s]], { t, w: 6, col: C.red, seed: 406, op: o });
              pm.line([[sx + 90 * s, sy - 36 * s], [sx + 92 * s, sy - 150 * s]], { t, w: 5, seed: 407, op: o });
              pm.line([[sx - 110 * s, sy - 32 * s], [sx - 112 * s, sy - 120 * s]], { t, w: 5, seed: 408, op: o });
              // small Chilean ensign at the stern mast
              const fx = sx - 112 * s, fy = sy - 120 * s, fw = 44 * s, fh = 28 * s, wv = Math.sin(lt * 5) * 3;
              pm.fill([[fx, fy], [fx - fw, fy + wv], [fx - fw, fy + fh / 2 + wv], [fx, fy + fh / 2]], C.paperLight, { t, seed: 409, op: o, smooth: false });
              pm.fill([[fx, fy + fh / 2], [fx - fw, fy + fh / 2 + wv], [fx - fw, fy + fh + wv], [fx, fy + fh]], C.red, { t, seed: 410, op: o, smooth: false });
              pm.fill([[fx, fy], [fx - fw * 0.4, fy + wv * 0.4], [fx - fw * 0.4, fy + fh / 2 + wv * 0.4], [fx, fy + fh / 2]], C.blue, { t, seed: 411, op: o, smooth: false });
              for (let i = 0; i < 4; i++) { const u = ((lt * 0.3 + i / 4) % 1); puff(pm, sx + u * 120 * s + 6, sy - 150 * s - u * 120 * s, (14 + u * 26) * s, t, 420 + i * 3, (1 - u) * o); }
              pm.line(seg([sx - 170 * s, sy + 12], [sx + 170 * s, sy + 10], 8), { t, w: 3, col: C.inkSoft, seed: 430, op: o });
            }
            fog.forEach((f, i) => puff(pm, f.x - fo * (0.25 + i * 0.03) * W, f.y - fo * 30, f.r * (1 + 0.3 * fo), t, 450 + i * 3, 0.97 * (1 - fo)));
          }
          if (mode === 'shelter') flakes(pm, lt, t, seed + 21, 22, W, H, 0.74);
          pb.end(); pm.end();
          updateCast(crew, lt, t, cues, W, H, gy);
          if (SL) {   // red arrow from the label down onto the boat roof
            const ta = TT(cues, SL.at, dur * 0.3), pa = prog(lt, ta + 0.3, 0.5);
            const a = [0.5 * W, 0.3 * H], b = [0.63 * W, 0.56 * H], m2 = [0.6 * W, 0.3 * H];
            if (pa > 0.01) {
              const q = []; for (let i = 0; i <= 10; i++) { const v = i / 10 * pa; q.push([(1 - v) * (1 - v) * a[0] + 2 * v * (1 - v) * m2[0] + v * v * b[0], (1 - v) * (1 - v) * a[1] + 2 * v * (1 - v) * m2[1] + v * v * b[1]]); }
              pf.line(q, { t, w: 7, col: C.red, seed: 600 });
              if (pa > 0.95) pf.line([[b[0] - 30, b[1] - 22], b, [b[0] + 8, b[1] - 36]], { t, w: 7, col: C.red, smooth: false, seed: 601 });
            }
          }
          pf.end();
          if (slT) place(slT, 0.4 * W, 0.3 * H, spring(lt, TT(cues, SL.at, dur * 0.3), 0.6) * (1 + 0.1 * punch(lt, TT(cues, SL.at, dur * 0.3))), -3, t, seed + 94);
          if (qT) place(qT, 0.3 * W, 0.34 * H, spring(lt, TT(cues, Q.at || 'quote', dur * 0.4) + 0.3, 0.6), -2, t, seed + 91);
          if (cnt) {
            const tsay = TT(cues, 'say', dur * 0.6), p = clamp01((lt - tsay) / 2.4), n = Math.max(1, Math.round(N * p));
            const done = p >= 1, pk = punch(lt, tsay + 2.4, 0.7);
            if (cnt.textContent !== String(n)) cnt.textContent = String(n);
            place(cnt, 0.4 * W, 0.3 * H, spring(lt, tsay, 0.5) * (1 + 0.18 * pk), -3, t, seed + 92);
            place(cntSub, 0.4 * W + 150, 0.3 * H - 6, spring(lt, tsay + 0.3, 0.5), -3, t, seed + 93);
            cnt.setAttribute('fill', done ? C.green : C.gold);
          }
          const cl = Object.assign({}, cues);
          if (mode === 'rescue' && cl.done == null) cl.done = TT(cues, 'say', dur * 0.6) + 2.5;
          updateCast(kas, lt, t, cl, W, H, 0.84 * H);
        },
      };
    },
  };

  // ================================================================ end_c_roster
  SH.end_c_roster = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed);
      const N = P.n || 28, cols = 7, rows = Math.ceil(N / cols);
      const kas = makeCast(kG, P.cast || [{ who: 'kasif', x: 0.9, y: 0.8, scale: 0.6, face: 'left', pose: 'talk', at: 'home', then: 'point', dir: 20, emotion: 'happy' }], seed + 50, H);
      const leftT = Txt(ui, P.left || 'İkinci ekip', 60, { font: FR, weight: 800, fill: C.blue });
      const big = Txt(ui, `${N} / ${N}`, 120, { font: FR, weight: 900, fill: C.green });
      const LX = 0.06 * W, LY = 0.24 * H, LW = 0.24 * W, LH = 0.5 * H;
      const GX = 0.36 * W, GY = 0.18 * H, GW = 0.42 * W, GH = 0.44 * H;
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.04, [0.5, 0.5]);
          pb.begin();
          const tr = TT(cues, 'ross', 0.3), tc = TT(cues, 'crew', dur * 0.55), th = TT(cues, 'home', dur * 0.8);
          // left card: the other party (respectful, dim)
          const cs = spring(lt, tr, 0.6);
          if (cs > 0.01) {
            const k = clamp01(cs), cy = LY + (1 - k) * 40;
            pb.shape([[LX, cy], [LX + LW, cy - 4], [LX + LW + 4, cy + LH], [LX + 2, cy + LH + 4]], C.paperLight, { t, w: 4, seed: 100, smooth: false, op: k });
            pb.dot(LX + LW / 2, cy + 6, 12, C.red, { t, seed: 102 });
            for (let i = 0; i < 3; i++) picto(pb, LX + LW * (0.25 + i * 0.25), cy + LH * 0.82, 150 * H / 1080, t, 110 + i * 9, C.inkSoft, 0.75 * k, C.paperDark);
          }
          // right: 28 pictograms
          for (let i = 0; i < N; i++) {
            const c = i % cols, rr = Math.floor(i / cols), at = tc + i * 0.05, sp = spring(lt, at, 0.45);
            if (sp <= 0.01) continue;
            const hop = lt >= th ? Math.max(0, Math.sin((lt - th - c * 0.06) * 8)) * 16 * Math.exp(-(lt - th) * 1.2) : 0;
            const x = GX + GW * (c + 0.5) / cols, y = GY + GH * (rr + 1) / rows - 6 - hop + Math.sin(lt * 2 + i) * 2;
            const home = lt >= th + c * 0.06;
            picto(pb, x, y, 92 * H / 1080 * lerp(0.4, 1, sp), t, 200 + i * 7, home ? C.green : C.ink, 1, C.paperLight, home ? 1 : 0);
          }
          if (lt >= th) { const p = prog(lt, th + 0.4, 0.5); pb.line(partial(seg([GX + 140, GY + GH + 150], [GX + GW - 140, GY + GH + 142], 10), p), { t, w: 7, col: C.green, seed: 500 }); }
          pb.end();
          place(leftT, LX + LW / 2, LY + 80, spring(lt, tr + 0.2, 0.6), -2, t, seed + 11);
          place(big, GX + GW / 2, GY + GH + 125, spring(lt, th, 0.6) * (1 + 0.12 * punch(lt, th)), -2, t, seed + 12);
          updateCast(kas, lt, t, cues, W, H, 0.8 * H);
        },
      };
    },
  };

  // ================================================================ end_c_wreck
  SH.end_c_wreck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), mid = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g'), top = el(svg, 'g');
      const pb = Pen(bg, seed), pm = Pen(mid, seed + 1), pw = Pen(el(ui, 'g'), seed + 9);
      const SY = 0.3 * H, BY = 0.8 * H;           // surface, sea bed
      const kas = makeCast(kG, P.cast || [{ who: 'kasif', x: 0.88, y: SY / H - 0.004, scale: 0.36, face: 'left', pose: 'look', at: 'buldu', then: 'shock', emotion: 'surprised', seq: [{ at: 'stern', pose: 'point', dir: -30, emotion: 'happy' }] }], seed + 50, H);
      const ticksT = [0, 1, 2, 3].map(k => Txt(ui, k ? `${fmtNum(k * 1000)} m` : '0 m', 46, { anchor: 'start' }));
      const tag = Txt(ui, (P.depth_text || '3.000 m'), 84, { font: FR, weight: 900, fill: C.paperLight, halo: C.red, haloK: 0.32 });
      const name = P.name || 'ENDURANCE';
      const letters = [...name].map(ch => Txt(ui, ch, 40, { font: FR, weight: 900, fill: C.gold, halo: C.ink, haloK: 0.12 }));
      const WX0 = 0.32 * W, WX1 = 0.74 * W;            // wreck bow .. stern
      const r = rng(seed * 19 + 5), snow = Array.from({ length: 26 }, () => [r() * W, r(), 0.4 + r() * 0.6]);
      const hatch = []; for (let i = 0; i < 46; i++) { const y = SY + 40 + Math.pow(r(), 0.7) * (BY - SY - 60), x = 0.14 * W + r() * 0.84 * W; hatch.push([[x, y], [x + 40, y + 4]]); }
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          const tdv = TT(cues, 'dive', 0.6), tdp = TT(cues, 'depth', dur * 0.4), tst = TT(cues, 'stern', dur * 0.72);
          // camera: gentle drift, then push into the stern
          const zp = progIO(lt, tst, 1.6), z = lerp(1.03, 2.3, zp), fx = lerp(0.5 * W, WX1 - 160, zp), fy = lerp(0.5 * H, BY - 110, zp);
          root.setAttribute('transform', `translate(${f1(W / 2 + Math.sin(lt * 0.35) * 6)} ${f1(H / 2 + Math.cos(lt * 0.3) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          pb.begin(); pm.begin();
          // water body: hatching gets denser with depth, drifting marine snow
          hatch.forEach((h, i) => pb.line(h, { t, w: 2.5, col: C.inkSoft, seed: 100 + i, op: 0.25 + 0.5 * (h[0][1] - SY) / (BY - SY) }));
          snow.forEach((s, i) => { const y = SY + 30 + ((s[1] + lt * 0.02 * s[2]) % 1) * (BY - SY - 40); pb.dot(s[0] + Math.sin(lt + i) * 10, y, 3, C.inkSoft, { t, seed: 160 + i, op: 0.6 }); });
          // surface: ice floes + ship
          const sl = []; for (let x = -60; x <= W + 60; x += 40) sl.push([x, SY + Math.sin(x * 0.02 + lt * 2) * 4]);
          pb.line(sl, { t, w: 5, seed: 200 });
          [[0.04, 0.12], [0.16, 0.2], [0.34, 0.44], [0.8, 0.98]].forEach((f, i) => pb.shape([[f[0] * W, SY + 2], [f[0] * W + 10, SY - 16], [f[1] * W - 12, SY - 18], [f[1] * W, SY + 4], [f[1] * W - 20, SY + 22], [f[0] * W + 14, SY + 20]], C.paperLight, { t, w: 4, seed: 210 + i * 2 }));
          const shx = 0.62 * W, s = H / 1080;
          pb.shape([[shx - 150 * s, SY - 34 * s], [shx + 160 * s, SY - 40 * s], [shx + 120 * s, SY + 14 * s], [shx - 120 * s, SY + 14 * s]], C.red, { t, w: 4, seed: 230 });
          pb.shape([[shx - 60 * s, SY - 36 * s], [shx - 56 * s, SY - 92 * s], [shx + 70 * s, SY - 94 * s], [shx + 74 * s, SY - 38 * s]], C.paperLight, { t, w: 4, seed: 232, smooth: false });
          pb.line([[shx - 10 * s, SY - 94 * s], [shx - 8 * s, SY - 150 * s]], { t, w: 5, seed: 234 });
          // depth ruler
          const RX = 0.08 * W;
          pb.line([[RX, SY + 10], [RX, BY]], { t, w: 5, seed: 240 });
          for (let k = 0; k <= 3; k++) { const y = lerp(SY + 10, BY, k / 3); pb.line([[RX - 16, y], [RX + 16, y]], { t, w: 5, seed: 241 + k }); }
          // sea bed + wreck
          const bed = []; for (let x = -60; x <= W + 60; x += 50) bed.push([x, BY + Math.sin(x * 0.013) * 8]);
          pb.fill([...bed, [W + 60, H + 40], [-60, H + 40]], C.paperDark, { t, seed: 250 });
          pb.line(bed, { t, w: 5, seed: 251 });
          const hb = BY - 6, hh = 130 * s;
          const hull = [[WX0, hb - hh * 0.95], [WX0 + 40, hb - hh * 0.3], [WX0 + 120, hb], [WX1 - 60, hb], [WX1 - 6, hb - hh * 0.5], [WX1 + 20, hb - hh * 1.05], [WX1 - 10, hb - hh * 1.02], [WX0 + 30, hb - hh * 0.92]];
          pm.shape(hull, C.inkSoft, { t, w: 6, seed: 300 });
          for (let k = 1; k <= 3; k++) pm.line([[WX0 + 30 + k * 6, hb - hh * (0.92 - k * 0.2)], [WX1 - 12 - k * 4, hb - hh * (1.0 - k * 0.22)]], { t, w: 2.5, col: C.ink, seed: 302 + k, op: 0.6 });
          pm.line([[WX0 + 30, hb - hh * 0.95], [WX1 + 16, hb - hh * 1.05]], { t, w: 7, seed: 310 });
          // broken mast stubs + rail
          [[0.18, 150, -6], [0.5, 120, 9], [0.78, 90, -14]].forEach(([u, h, a], i) => { const x = lerp(WX0 + 40, WX1 - 20, u), y = hb - hh * 1.0; pm.line([[x, y], [x + Math.sin(a * Math.PI / 180) * h * s, y - h * s]], { t, w: 10, seed: 320 + i }); });
          for (let k = 0; k < 14; k++) { const x = lerp(WX0 + 50, WX1 - 30, k / 13), y = hb - hh * (0.95 + 0.1 * k / 13); pm.line([[x, y], [x, y - 22 * s]], { t, w: 3, seed: 340 + k, op: 0.8 }); }
          // stern star (Polaris) above the name
          const stx = WX1 - 30, sty = hb - hh * 0.66;
          const starP = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 7 : 16; starP.push([stx + Math.cos(a) * rr, sty - 34 + Math.sin(a) * rr]); }
          pm.shape(starP, C.gold, { t, w: 2, seed: 360, smooth: false, op: prog(lt, tst + 0.4, 0.5) });
          // ROV on its cable: down from the ship to the stern
          const dv = progIO(lt, tdv, Math.max(1.2, tdp - tdv + 0.8)), rx = lerp(shx + 40 * s, WX1 + 90, dv), ry = lerp(SY + 30, hb - hh * 0.75, dv);
          pm.line([[shx + 40 * s, SY + 10], [lerp(shx + 40 * s, rx, 0.5) + 30, lerp(SY, ry, 0.5)], [rx, ry - 26]], { t, w: 3, col: C.ink, seed: 370 });
          // light cone (small, gold, low opacity) towards the stern
          const ca = Math.atan2(sty - ry, stx - rx) + Math.sin(lt * 1.3) * 0.12, cl = 260;
          const cone = [[rx - 30, ry], [rx - 30 + Math.cos(ca - 0.32) * cl, ry + Math.sin(ca - 0.32) * cl], [rx - 30 + Math.cos(ca + 0.32) * cl, ry + Math.sin(ca + 0.32) * cl]];
          if (dv > 0.6) pm.fill(cone, C.gold, { t, seed: 380, op: 0.28 * (dv - 0.6) / 0.4 });
          pm.shape([[rx - 40, ry - 26], [rx + 40, ry - 26], [rx + 44, ry + 24], [rx - 42, ry + 26]], C.paperLight, { t, w: 4, seed: 390, smooth: false });
          pm.dot(rx - 30, ry, 9, C.gold, { t, seed: 392 });
          pm.line([[rx - 10, ry - 26], [rx - 10, ry + 26]], { t, w: 3, seed: 393 });
          pb.end(); pm.end();
          // ruler labels
          ticksT.forEach((tx, k) => place(tx, RX + 28, lerp(SY + 10, BY, k / 3) + 16, spring(lt, 0.2 + k * 0.15, 0.5) * (k === 3 ? 1 - prog(lt, tdp, 0.3) : 1), 0, t, seed + 20 + k));
          // depth tag (outside the camera group so it stays readable) — hide during the stern push
          const tp = spring(lt, tdp, 0.6) * (1 - prog(lt, tst, 0.5));
          place(tag, 0.17 * W, BY - 22, tp * (1 + 0.12 * punch(lt, tdp)), -4, t, seed + 30);
          const pa = prog(lt, tdp + 0.3, 0.5) * (1 - prog(lt, tst, 0.5));
          pw.begin();
          if (pa > 0.01) {
            const a = [0.17 * W + 180, BY - 50], b = [WX0 + 70, BY - 62], m2 = [(0.17 * W + 180 + WX0 + 70) / 2, BY - 80];
            const q = []; for (let i = 0; i <= 10; i++) { const v = i / 10 * Math.min(1, pa * 1.05); q.push([(1 - v) * (1 - v) * a[0] + 2 * v * (1 - v) * m2[0] + v * v * b[0], (1 - v) * (1 - v) * a[1] + 2 * v * (1 - v) * m2[1] + v * v * b[1]]); }
            pw.line(q, { t, w: 7, col: C.red, seed: 700 });
            if (pa > 0.95) pw.line([[b[0] - 30, b[1] - 20], b, [b[0] - 32, b[1] + 16]], { t, w: 7, col: C.red, smooth: false, seed: 701 });
          }
          pw.end();
          // name on the stern, letter by letter
          const n = letters.length, nx0 = WX1 - 330, nx1 = WX1 - 120;
          letters.forEach((L, i) => {
            const at = tst + 0.3 + i * 0.07, x = lerp(nx0, nx1, i / (n - 1)), y = hb - hh * (0.42 + 0.12 * i / (n - 1));
            place(L, x, y, spring(lt, at, 0.4), -4, t, seed + 40 + i);
          });
          updateCast(kas, lt, t, cues, W, H, SY);
        },
      };
    },
  };

  // ================================================================ end_c_choice
  SH.end_c_choice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed);
      const kas = makeCast(kG, P.cast || [{ who: 'kasif', x: 0.5, y: 0.84, scale: 0.75, face: 'right', pose: 'talk',
        seq: [{ at: 'boat', pose: 'point', dir: 25, face: 'left' }, { at: 'island', pose: 'point', dir: 25, face: 'right' }, { at: 'yorum', pose: 'wave', emotion: 'happy' }] }], seed + 50, H);
      const head = Txt(ui, P.head || 'En büyük kurtuluş', 76, { font: FR, weight: 900 });
      const lT = Txt(ui, P.left || 'SANDAL', 72, { font: FR, weight: 900, fill: C.paperLight, halo: C.blue, haloK: 0.3 });
      const rT = Txt(ui, P.right || 'ADA', 72, { font: FR, weight: 900, fill: C.paperLight, halo: C.red, haloK: 0.3 });
      const q = Txt(ui, '?', 170, { font: FR, weight: 900, fill: C.red });
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.03, [0.5, 0.5]);
          pb.begin();
          const tb = TT(cues, 'boat', dur * 0.45), ti = TT(cues, 'island', dur * 0.65), th = TT(cues, 'head', 0.4), tq = TT(cues, 'q', dur * 0.4);
          const ground = 0.84 * H;
          pb.line(seg([-60, ground + 4], [W + 60, ground - 2], 14), { t, w: 5, seed: 90 });
          // left panel: the little boat on big waves
          const ca = P.cards_at || [0.3, 0.7], lp = spring(lt, ca[0], 0.6);
          if (lp > 0.01) {
            const k = clamp01(lp), cx = 0.2 * W, cy = 0.6 * H;
            pb.shape([[cx - 260, cy - 300], [cx + 250, cy - 296], [cx + 256, cy + 160], [cx - 254, cy + 164]], C.paperLight, { t, w: 5, seed: 100, smooth: false, op: k });
            const by = cy + 30 + Math.sin(lt * 2.2) * 16, rot = Math.sin(lt * 1.6) * 9;
            smallBoat(pb, cx, by, 0.85 * lerp(0.6, 1, k) * H / 1080, t, 110, rot);
            const wv = []; for (let x = cx - 250; x <= cx + 250; x += 25) wv.push([x, cy + 50 + Math.sin(x * 0.03 + lt * 3) * 22]);
            pb.line(wv, { t, w: 6, col: C.blue, seed: 130 });
            const wv2 = []; for (let x = cx - 250; x <= cx + 250; x += 25) wv2.push([x, cy + 100 + Math.sin(x * 0.03 + lt * 3 + 1.5) * 16]);
            pb.line(wv2, { t, w: 4, col: C.blue, seed: 131 });
          }
          const rp = spring(lt, ca[1], 0.6);
          if (rp > 0.01) {
            const k = clamp01(rp), cx = 0.8 * W, cy = 0.6 * H;
            pb.shape([[cx - 252, cy - 296], [cx + 258, cy - 300], [cx + 254, cy + 162], [cx - 256, cy + 160]], C.paperLight, { t, w: 5, seed: 150, smooth: false, op: k });
            pb.shape([[cx - 240, cy + 100], [cx - 180, cy - 60], [cx - 90, cy - 180], [cx + 20, cy - 220], [cx + 140, cy - 150], [cx + 240, cy - 40], [cx + 240, cy + 100]], C.paperDark, { t, w: 5, seed: 160 });
            boatHut(pb, cx, cy + 96, 0.6 * lerp(0.6, 1, k) * H / 1080, t, lt, 170);
            const wv = []; for (let x = cx - 250; x <= cx + 250; x += 25) wv.push([x, cy + 130 + Math.sin(x * 0.03 + lt * 2) * 6]);
            pb.line(wv, { t, w: 4, col: C.inkSoft, seed: 190 });
          }
          pb.end();
          place(head, 0.5 * W, 0.17 * H, spring(lt, th, 0.6), -2, t, seed + 1);
          place(lT, 0.2 * W, 0.32 * H, spring(lt, ca[0] + 0.2, 0.6) * (1 + 0.18 * punch(lt, tb)), -4, t, seed + 2);
          place(rT, 0.8 * W, 0.32 * H, spring(lt, ca[1] + 0.2, 0.6) * (1 + 0.18 * punch(lt, ti)), 4, t, seed + 3);
          place(q, 0.5 * W + 10, 0.3 * H, spring(lt, tq, 0.5) * (1 + 0.15 * punch(lt, TT(cues, 'yorum', 1e9))), 6, t, seed + 4);
          updateCast(kas, lt, t, cues, W, H, 0.84 * H);
        },
      };
    },
  };
  // ================================================================ end_c_words
  // big Fraunces words (one per cue w0, w1, ...; highlighted word in a red box), optional century vignettes
  // (left: wreck on the sea bed + year, right: grave cross on a hill + year, a red arrow between them on cue "note"),
  // cast with hop support. P: {lines, highlight, x: 0.5, y: 0.24, size: 140, vignettes: {left: "2022", right: "1922",
  //   at_left, at_right, at_arrow}, cast}
  SH.end_c_words = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), ui = el(root, 'g'), kG = el(root, 'g');
      const pb = Pen(bg, seed);
      const hl = (P.highlight || []).map(x => x.toLocaleUpperCase('tr-TR'));
      const size = P.size || 140, rows = [];
      let k = 0;
      (P.lines || []).forEach(ln => rows.push(ln.split(/\s+/).filter(Boolean).map(w => {
        const isH = hl.includes(w.toLocaleUpperCase('tr-TR').replace(/[?!.,:;]/g, ''));
        return { t: Txt(ui, w, size, { font: FR, weight: 900, fill: isH ? C.paperLight : C.ink, haloK: isH ? 0.001 : 0.08 }), isH, k: k++, w };
      })));
      const cx0 = (P.x ?? 0.5) * W, y0 = (P.y ?? 0.24) * H;
      const layout = rows.map((r, ri) => {
        const ws = r.map(o => o.t.getComputedTextLength() + (o.isH ? size * 0.3 : 0)), gap = size * 0.25;
        const tot = ws.reduce((a, b) => a + b, 0) + gap * (r.length - 1);
        let x = cx0 - tot / 2;
        return r.map((o, i) => { const c = x + ws[i] / 2; x += ws[i] + gap; return { o, x: c, y: y0 + ri * size * 1.1, w: ws[i] }; });
      }).flat();
      const V = P.vignettes || null;
      const vL = V ? Txt(ui, V.left || '2022', 64, { font: FR, weight: 900 }) : null, vR = V ? Txt(ui, V.right || '1922', 64, { font: FR, weight: 900 }) : null;
      const cast = makeCast(kG, P.cast || [], seed + 50, H);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.03, [0.5, 0.45]);
          pb.begin();
          const sp = layout.map(L => spring(lt, TT(cues, 'w' + L.o.k, 0.15 + L.o.k * 0.2), 0.5));
          layout.forEach((L, i) => {
            if (L.o.isH && sp[i] > 0.01) {
              const s2 = lerp(0.6, 1, sp[i]), hw = L.w / 2 * s2, hh = size * 0.56 * s2, yc = L.y - size * 0.34;
              pb.shape([[L.x - hw, yc - hh], [L.x + hw, yc - hh - 3], [L.x + hw + 3, yc + hh], [L.x - hw + 2, yc + hh + 2]], C.red, { t, w: 5, smooth: false, seed: 40 + i });
            }
          });
          if (V) {
            const lc = [0.2 * W, 0.62 * H], rc = [0.8 * W, 0.62 * H], R0 = 0.16 * H;
            const sl = spring(lt, TT(cues, V.at_left, 0.5), 0.6), sr = spring(lt, TT(cues, V.at_right, 1.0), 0.6);
            if (sl > 0.01) {
              const r = R0 * lerp(0.5, 1, sl), [x, y] = lc;
              pb.shape(ell(x, y, r, r, 60, 18), C.paperLight, { t, w: 6, seed: 61 });
              for (let i = 0; i < 4; i++) pb.line([[x - r * 0.6, y - r * 0.5 + i * r * 0.22], [x - r * 0.3, y - r * 0.48 + i * r * 0.22]], { t, w: 2.5, col: C.inkSoft, seed: 63 + i });
              pb.fill([[x - r * 0.95, y + r * 0.45], [x + r * 0.95, y + r * 0.42], [x + r * 0.7, y + r * 0.75], [x - r * 0.7, y + r * 0.75]], C.paperDark, { t, seed: 70 });
              pb.shape([[x - r * 0.7, y + r * 0.1], [x - r * 0.55, y + r * 0.42], [x + r * 0.5, y + r * 0.42], [x + r * 0.72, y + r * 0.02], [x + r * 0.6, y + r * 0.05]], C.inkSoft, { t, w: 4, seed: 72 });
              [-0.35, 0, 0.35].forEach((u, i) => pb.line([[x + u * r, y + r * 0.06], [x + u * r + (i - 1) * 6, y - r * (0.35 - i * 0.06)]], { t, w: 6, seed: 74 + i }));
            }
            if (sr > 0.01) {
              const r = R0 * lerp(0.5, 1, sr), [x, y] = rc;
              pb.shape(ell(x, y, r, r, 80, 18), C.paperLight, { t, w: 6, seed: 81 });
              pb.fill([[x - r * 0.95, y + r * 0.5], [x - r * 0.5, y + r * 0.15], [x, y + r * 0.05], [x + r * 0.6, y + r * 0.2], [x + r * 0.95, y + r * 0.5], [x + r * 0.6, y + r * 0.8], [x - r * 0.6, y + r * 0.8]], C.paperDark, { t, seed: 83 });
              pb.line([[x, y + r * 0.12], [x, y - r * 0.55]], { t, w: 9, seed: 85 });
              pb.line([[x - r * 0.24, y - r * 0.3], [x + r * 0.24, y - r * 0.32]], { t, w: 9, seed: 86 });
            }
            const pa = prog(lt, TT(cues, V.at_arrow, 1.6), 0.8);
            if (pa > 0.01) {
              const a = [rc[0] - R0 * 0.9, rc[1] - R0 * 0.75], b = [lc[0] + R0 * 0.9, lc[1] - R0 * 0.75], m2 = [0.5 * W, 0.36 * H];
              // drawn from 1922 (right) to 2022 (left)
              const q = []; for (let i = 0; i <= 14; i++) { const v = i / 14 * pa; q.push([(1 - v) * (1 - v) * a[0] + 2 * v * (1 - v) * m2[0] + v * v * b[0], (1 - v) * (1 - v) * a[1] + 2 * v * (1 - v) * m2[1] + v * v * b[1]]); }
              pb.line(q, { t, w: 7, col: C.red, seed: 90 });
              if (pa > 0.95) pb.line([[b[0] + 34, b[1] - 18], b, [b[0] + 20, b[1] + 30]], { t, w: 7, col: C.red, smooth: false, seed: 91 });
            }
            place(vL, lc[0], lc[1] + R0 + 70, sl, -3, t, seed + 5);
            place(vR, rc[0], rc[1] + R0 + 70, sr, 3, t, seed + 6);
          }
          pb.end();
          layout.forEach((L, i) => place(L.o.t, L.x, L.y, sp[i], L.o.isH ? -2 : (i % 2 ? 1.5 : -1.5), t, seed + 10 + i));
          updateCast(cast, lt, t, cues, W, H, 0.86 * H);
        },
      };
    },
  };

  // ================================================================ end_c_station
  // Stromness 1916: sheds + a door on the right, three soot-faced bearded men walk in from the left, the station manager
  // at the door startles (red "?") and handwritten name tags with arrows. P: {men: [...], manager: {...}, tags:
  // [{text, who: index into men+manager, at, x, y}], cast}   cues: hit (manager), tag "at" names
  SH.end_c_station = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g'), bg = el(root, 'g'), castG = el(root, 'g'), fr = el(root, 'g'), kG = el(root, 'g'), ui = el(root, 'g');
      const pb = Pen(bg, seed), pf = Pen(fr, seed + 2);
      const gy = 0.8 * H;
      const men = (P.men || [
        { who: 'crean', beard: 'black', x: -0.3, scale: 0.6, face: 'right', seq: [{ at: 0.1, pose: 'walk', to: 0.16, dur: 2.0, then: 'idle' }] },
        { who: 'shackleton', beard: 'black', x: -0.18, scale: 0.6, face: 'right', seq: [{ at: 0.1, pose: 'walk', to: 0.28, dur: 2.0, then: 'talk' }] },
        { who: 'worsley', beard: 'black', x: -0.06, scale: 0.6, face: 'right', seq: [{ at: 0.1, pose: 'walk', to: 0.4, dur: 2.0, then: 'idle' }] },
      ]).concat([Object.assign({ who: 'mudur', accessory: null, x: 0.6, scale: 0.62, face: 'left', pose: 'idle', at: 'hit', then: 'shock', emotion: 'surprised' }, P.manager || {})]);
      const crew = makeCast(castG, men, seed, H);
      const kas = makeCast(kG, P.cast || [], seed + 50, H);
      const tags = (P.tags || [{ text: 'Shackleton', who: 1, at: 'sh', x: 0.22, y: 0.33 }, { text: 'müdür', who: 3, at: 'md', x: 0.5, y: 0.3 }])
        .map(g => Object.assign({ node: Txt(ui, g.text, 66, { fill: C.red }) }, g));
      const q = Txt(ui, '?', 150, { font: FR, weight: 900, fill: C.red });
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt;
          camera(root, lt, dur, W, H, 1.05, [0.45, 0.6]);
          pb.begin(); pf.begin();
          const rp = rangePts(W, H, seed + 3, 0.6 * H, 0.24 * H, 7);
          pb.shape(rp, C.paperDark, { t, w: 4, col: C.inkSoft, seed: 100 });
          capsOf(rp).forEach((c, i) => pb.line(c, { t, w: 3, col: C.inkSoft, seed: 120 + i }));
          pb.fill([[-60, gy], [W + 60, gy], [W + 60, H + 30], [-60, H + 30]], C.paperLight, { t, seed: 140 });
          pb.line(seg([-60, gy + 3], [W + 60, gy - 3], 14), { t, w: 6, seed: 141 });
          // sheds
          [[0.64, 0.17, 0.27, C.red], [0.83, 0.15, 0.22, C.inkSoft]].forEach(([x, w, h, roof], i) => {
            const x0 = x * W, x1 = (x + w) * W, top = gy - h * H;
            pb.shape([[x0, gy], [x0, top], [x1, top], [x1, gy]], C.paperLight, { t, w: 5, smooth: false, seed: 150 + i * 4 });
            pb.shape([[x0 - 14, top], [(x0 + x1) / 2, top - w * W * 0.3], [x1 + 14, top]], roof, { t, w: 5, smooth: false, seed: 152 + i * 4 });
            for (let k = 1; k < 4; k++) pb.line([[x0 + k * (x1 - x0) / 4, top + 10], [x0 + k * (x1 - x0) / 4, gy - 10]], { t, w: 2.5, col: C.inkSoft, seed: 160 + i * 5 + k });
          });
          pb.shape([[0.665 * W, gy], [0.665 * W, gy - 0.18 * H], [0.715 * W, gy - 0.18 * H], [0.715 * W, gy]], C.paperDark, { t, w: 5, smooth: false, seed: 180 });
          const cx = 0.93 * W, cy = gy - 0.22 * H;
          pb.line([[cx, cy], [cx, cy - 140]], { t, w: 12, seed: 182 });
          for (let i = 0; i < 4; i++) { const u = ((lt * 0.22 + i / 4) % 1); puff(pb, cx - u * 60, cy - 160 - u * 120, 14 + u * 22, t, 190 + i * 3, 1 - u * 0.8); }
          pb.end();
          const pos = updateCast(crew, lt, t, cues, W, H, gy);
          // soot-darkened faces of the three walkers
          pos.slice(0, men.length - 1).forEach((p, i) => pf.fill(ell(p.head[0], p.head[1] + 8, 52 * p.s, 46 * p.s, 300 + i, 10), C.inkSoft, { t, op: 0.38, seed: 310 + i }));
          tags.forEach((g, i) => {
            const at = TT(cues, g.at, 0.5 + i), pa = prog(lt, at + 0.25, 0.5), p = pos[g.who];
            if (!p || pa <= 0.01) return;
            const a = [g.x * W + (g.x * W < p.head[0] ? 60 : -60), g.y * H + 30], b = [p.head[0] + (a[0] < p.head[0] ? -40 : 40), p.head[1] - 70 * p.s / 0.6];
            const m2 = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 10];
            const qq = []; for (let k = 0; k <= 10; k++) { const v = k / 10 * pa; qq.push([(1 - v) * (1 - v) * a[0] + 2 * v * (1 - v) * m2[0] + v * v * b[0], (1 - v) * (1 - v) * a[1] + 2 * v * (1 - v) * m2[1] + v * v * b[1]]); }
            pf.line(qq, { t, w: 6, col: C.red, seed: 400 + i * 3 });
            if (pa > 0.95) { const e = qq[10], f = qq[8], an = Math.atan2(e[1] - f[1], e[0] - f[0]); pf.line([[e[0] - 28 * Math.cos(an - 0.5), e[1] - 28 * Math.sin(an - 0.5)], e, [e[0] - 28 * Math.cos(an + 0.5), e[1] - 28 * Math.sin(an + 0.5)]], { t, w: 6, col: C.red, smooth: false, seed: 401 + i * 3 }); }
          });
          pf.end();
          tags.forEach((g, i) => place(g.node, g.x * W, g.y * H, spring(lt, TT(cues, g.at, 0.5 + i), 0.6), -3 + i * 5, t, seed + 20 + i));
          const th = TT(cues, 'hit', dur * 0.8), mp = pos[men.length - 1];
          place(q, mp.head[0] + 70, mp.head[1] - 120, spring(lt, th, 0.5) * (1 + 0.15 * punch(lt, th)), 8, t, seed + 30);
          updateCast(kas, lt, t, cues, W, H, gy);
        },
      };
    },
  };
})();
