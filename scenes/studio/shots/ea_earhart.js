// ea_earhart: Amelia Earhart / the "Taraia Object" on Nikumaroro (2026 news) in parchment ink (brand/kit/BRAND.md §3, §5).
// Every line boils at 8 Hz through _ink.js; everything is a pure function of (seed, lt), no Math.random.
//
// SHOTS.ea_sat — a taped-down "satellite photo": top view of an atoll (land ring with palm dots, lagoon with water
//   hatching, a sandbar) and a dark Y-shaped blur in the lagoon; the camera creeps in on it. cue "glint": gold star
//   sparkles flash on it; cue "ring": a red ink ring circles it; label (e.g. "?").
//   P: {glint: cue, ring: cue, label: {text, x, y, at, size, color: "red"|"ink", stamp}, cast: [...], zoom: 1.12,
//       photo: {x: 0.5, y: 0.36, w: 0.86, h: 0.42} (0..1 of W/H)}
// SHOTS.ea_lagoon — side view standing in the lagoon: far palms, shallow water, a sandbar with a tangle of fallen
//   tree trunks (Y-shaped, broken branches); optional dashed ghost of the plane over it that fades out on "gone".
//   cue "trees": trunks punch + crust sparkles; label as above. P: {ghost: {at, gone: cue} | false, trees: cue, ...}
// SHOTS.ea_plane — the Lockheed Electra (twin engines, twin tail fins) over the Pacific: clouds, waves far below, a
//   tiny island speck; propellers spin; cue "vanish": the plane drifts into a cloud bank and fades to a dashed outline.
//   P: {vanish: cue, island: {x: 0.82} | false, label: {...}, cast: [...]}
// SHOTS.ea_log — close-up of one fallen trunk crusted with coral sand that glints like metal; cue "glint" sparkles;
//   cue "ring": red ring + hand-written note. P: {note: "coral sand", note_x, note_y, glint, ring, cast, label}
// SHOTS.ea_crabs — night on the atoll: moon, palms, the expedition ship at anchor offshore, giant coconut crabs
//   crawling out of the brush; cue "run": the cast runs to the right (towards the ship). P: {crabs: 3, run: cue, cast}
// Common: cast: [{who: "kasif"|name, x, y (feet, 0..1 H), to (run/walk target x), scale, pose, at, then, face, dir,
//   emotion, text, item}], label: {text, x, y, at, size, color, stamp}, zoom, focus. cues: as named above.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const circ = (cx, cy, r, n = 14) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  const mk = (g, fill = INK.ink, extra = {}) => inkEl(g, fill, extra);
  const star = (x, y, r, rot = 0) => Array.from({ length: 8 }, (_, i) => { const a = rot + i / 8 * 6.2832, rr = i % 2 ? r * 0.3 : r; return [x + Math.cos(a) * rr, y + Math.sin(a) * rr]; });

  // ---------------------------------------------------------------- shared helpers
  function makeCast(ctx, P, castG, defScale) {
    return (P.cast || []).map((c, i) => {
      const isK = (c.who || 'kasif') === 'kasif';
      const rig = KASIF.create(el(castG, 'g'), { scale: c.scale ?? defScale, hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: ctx.seed + i * 7 + 3 });
      return { c, rig };
    });
  }
  function updateCast(cast, W, H, lt, t, cues) {
    cast.forEach(({ c, rig }) => {
      const at = atOr(cues, c.at, null), after = at != null && lt >= at;
      let x = (c.x ?? 0.75) * W, ph;
      const y = (c.y ?? 0.6) * H;
      let pose = after ? (c.then || 'shock') : (c.pose || 'idle');
      let face = c.face === 'left' ? -1 : 1;
      if (c.to != null && after) {                      // runs / walks to "to" after the cue
        const sp = (pose === 'run' ? 900 : 380) * (c.scale ?? 0.6), dist = (c.to - (c.x ?? 0.75)) * W, T = Math.abs(dist) / sp;
        const u = clamp01((lt - at) / Math.max(0.1, T));
        x += dist * u; face = dist >= 0 ? 1 : -1;
        ph = Math.abs(dist * u) / (c.scale ?? 0.6) / KASIF.gait(pose === 'run' ? 'run' : 'walk');
        if (u >= 1) pose = c.end || 'idle';
      }
      const since = after ? lt - at : lt, dir = typeof c.dir === 'number' ? c.dir : DIRS[c.dir] ?? 20;
      const emo = after ? (c.emotion || (pose === 'shock' ? 'surprised' : null)) : (c.emotion0 || null);
      const o = { x, y, face, since, dir, emotion: emo, text: c.text, item: c.item, ph };
      if (after && since < 0.32 && c.to == null) { o.prev = { pose: c.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      rig.update(t, pose, o);
    });
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
  function camT(cam, P, W, H, lt, dur, t) {
    const z = lerp(1, P.zoom ?? 1.07, progIO(lt, 0, Math.max(1, dur))), fc = P.focus || [0.5, 0.5], fx = fc[0] * W, fy = fc[1] * H;
    cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  // palm tree (side view): curved trunk + fronds, base at (x, y), height h
  function palm(x, y, h, lean, sd, t, sway) {
    const top = [x + lean * h * 0.3 + sway, y - h];
    let ink = inkPath([[x, y], [x + lean * h * 0.12, y - h * 0.5], top], { seed: sd, t, w: 9 });
    for (let i = 0; i < 6; i++) {
      const a = -2.9 + i * 0.55 + Math.sin(t * 1.3 + i) * 0.05, L = h * 0.42;
      ink += ' ' + inkPath([top, [top[0] + Math.cos(a) * L * 0.6, top[1] + Math.sin(a) * L * 0.5 - 14], [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.4 + 26]], { seed: sd + 1 + i, t, w: 6 });
    }
    return ink;
  }
  // fallen trunk: from (x0,y0) to (x1,y1) with thickness w, plus broken branch stubs (Y shape)
  function trunk(x0, y0, x1, y1, w, sd, t, branches = [[0.55, -0.9, 0.5]]) {
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    const body = [[x0 + nx * w * 0.5, y0 + ny * w * 0.5], [x1 + nx * w * 0.35, y1 + ny * w * 0.35], [x1 - nx * w * 0.35, y1 - ny * w * 0.35], [x0 - nx * w * 0.5, y0 - ny * w * 0.5]];
    let fill = inkLoop(body, { seed: sd, t, smooth: false }), ink = inkPath(body, { seed: sd, t, closed: true, w: 6, smooth: false });
    ink += ' ' + inkPath(circ(x0, y0, w * 0.5, 12).map(([px, py]) => [x0 + (px - x0) * 0.45, py]), { seed: sd + 1, t, closed: true, w: 5 });
    let grain = '';
    for (let k = 1; k < 4; k++) grain += inkPath([[lerp(x0, x1, 0.1 * k) + nx * w * (k - 2) * 0.2, lerp(y0, y1, 0.1 * k) + ny * w * (k - 2) * 0.2], [lerp(x0, x1, 0.25 + 0.15 * k) + nx * w * (k - 2) * 0.2, lerp(y0, y1, 0.25 + 0.15 * k) + ny * w * (k - 2) * 0.2]], { seed: sd + 5 + k, t, w: 2.5 }) + ' ';
    branches.forEach(([u, ang, len], i) => {
      const bx = lerp(x0, x1, u), by = lerp(y0, y1, u), a = Math.atan2(dy, dx) + ang, bl = L * len;
      const ex = bx + Math.cos(a) * bl, ey = by + Math.sin(a) * bl;
      const bw = w * 0.45, bnx = -Math.sin(a), bny = Math.cos(a);
      const br = [[bx + bnx * bw * 0.6, by + bny * bw * 0.6], [ex + bnx * bw * 0.35, ey + bny * bw * 0.35], [ex - bnx * bw * 0.35, ey - bny * bw * 0.35], [bx - bnx * bw * 0.6, by - bny * bw * 0.6]];
      fill += ' ' + inkLoop(br, { seed: sd + 20 + i, t, smooth: false });
      ink += ' ' + inkPath(br, { seed: sd + 20 + i, t, closed: true, w: 5, smooth: false });
    });
    return { fill, ink, grain, along: u => [lerp(x0, x1, u), lerp(y0, y1, u)], nx, ny };
  }

  // ================================================================ ea_sat
  SH.ea_sat = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000;
      const Ph = Object.assign({ x: 0.5, y: 0.36, w: 0.86, h: 0.42 }, P.photo || {});
      const px = Ph.x * W, py = Ph.y * H, pw = Ph.w * W, ph = Ph.h * H;
      const rootG = el(svg, 'g');
      const frameF = mk(rootG, INK.paperLight), frameI = mk(rootG), tape = mk(rootG, INK.stain, { 'fill-opacity': 0.55 });
      const clipId = `easat${seed}`;
      const defs = el(rootG, 'defs'), cp = el(defs, 'clipPath', { id: clipId });
      el(cp, 'rect', { x: px - pw / 2 + 16, y: py - ph / 2 + 16, width: pw - 32, height: ph - 32 });
      const clipG = el(rootG, 'g', { 'clip-path': `url(#${clipId})` });
      const cam = el(clipG, 'g');
      const sea = mk(cam, INK.blue, { 'fill-opacity': 0.28 }), seaH = mk(cam, INK.blue, { 'fill-opacity': 0.5 });
      const land = mk(cam, INK.green, { 'fill-opacity': 0.55 }), landI = mk(cam), dots = mk(cam, INK.green, { 'fill-opacity': 0.9 });
      const lag = mk(cam, INK.paperLight), lagH = mk(cam, INK.blue, { 'fill-opacity': 0.35 }), bar = mk(cam, INK.stain, { 'fill-opacity': 0.6 });
      const blur = mk(cam, INK.ink, { 'fill-opacity': 0.7 }), blur2 = mk(cam, INK.inkSoft, { 'fill-opacity': 0.5 });
      const spark = mk(cam, INK.gold), ring = mk(cam, INK.red);
      const castG = el(rootG, 'g');
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);
      // the atoll ring in photo coords: an elongated loop, lagoon inside
      const ax = px, ay = py, R = Math.min(pw, ph * 1.6) * 0.42;
      const outer = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * 6.2832, k = 1 + Math.sin(a * 3 + 1) * 0.06; return [ax + Math.cos(a) * R * 1.25 * k, ay + Math.sin(a) * R * 0.62 * k]; });
      const inner = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * 6.2832, k = 1 + Math.sin(a * 4 + 2) * 0.05; return [ax + Math.cos(a) * R * 1.02 * k, ay + Math.sin(a) * R * 0.42 * k]; });
      const r0 = rng(seed * 3 + 7);
      const palmsXY = outer.map((p, i) => { const q = inner[i]; return [lerp(p[0], q[0], 0.5 + (r0() - 0.5) * 0.3), lerp(p[1], q[1], 0.5 + (r0() - 0.5) * 0.3)]; });
      const bx = ax + R * 0.52, by = ay - R * 0.08;   // the object, near the lagoon's east end
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          // the whole page drifts and tilts a little (handheld feel)
          const zz = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))), rr = Math.sin(t * 0.7) * 1.2 + lerp(-2, 0, prog(lt, 0, 0.8));
          rootG.setAttribute('transform', `translate(${f1(W / 2 + Math.sin(t * 0.5) * 10)} ${f1(H * 0.45 + Math.cos(t * 0.4) * 8)}) rotate(${f1(rr)}) scale(${zz.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.45)})`);
          // frame + tape
          const fr = [[px - pw / 2, py - ph / 2], [px + pw / 2, py - ph / 2], [px + pw / 2, py + ph / 2], [px - pw / 2, py + ph / 2]];
          frameF.setAttribute('d', inkLoop(fr, { seed: sd + 1, t, smooth: false }));
          frameI.setAttribute('d', inkPath(fr, { seed: sd + 1, t, closed: true, w: 6, smooth: false }));
          tape.setAttribute('d', [[px - pw / 2 + 10, py - ph / 2], [px + pw / 2 - 10, py + ph / 2]].map(([x, y], i) => inkLoop([[x - 70, y - 20], [x + 70, y - 34], [x + 76, y + 14], [x - 64, y + 28]], { seed: sd + 3 + i, t, smooth: false })).join(' '));
          // camera creeps in on the object
          const z = lerp(1, P.zoom ?? 1.5, progIO(lt, 0, Math.max(1, dur)));
          const fx = lerp(ax, bx, progIO(lt, 0, dur)), fy = lerp(ay, by, progIO(lt, 0, dur));
          cam.setAttribute('transform', `translate(${f1(ax)} ${f1(ay)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          sea.setAttribute('d', `M${px - pw} ${py - ph} H${px + pw} V${py + ph} H${px - pw} Z`);
          let sh = ''; for (let k = 0; k < 16; k++) { const y = py - ph / 2 + (k + 0.5) * ph / 16, x = px - pw / 2 + ((k * 137 + t * 14) % pw); sh += inkPath([[x - 40, y], [x - 14, y - 6], [x + 14, y + 4], [x + 40, y]], { seed: sd + 10 + k, t, w: 3 }) + ' '; }
          seaH.setAttribute('d', sh);
          land.setAttribute('d', inkLoop(outer, { seed: sd + 30, t }) + ' ' + inkLoop(inner.slice().reverse(), { seed: sd + 31, t }));
          landI.setAttribute('d', inkPath(outer, { seed: sd + 30, t, closed: true, w: 5 }) + ' ' + inkPath(inner, { seed: sd + 31, t, closed: true, w: 4 }));
          dots.setAttribute('d', palmsXY.map((p, i) => inkDot(p[0], p[1], 9, 9, seed + 40 + i, t)).join(' '));
          lag.setAttribute('d', inkLoop(inner, { seed: sd + 31, t }));
          let lh = ''; for (let k = 0; k < 6; k++) { const y = ay - R * 0.3 + k * R * 0.12, x = ax - R * 0.6 + ((k * 91 + t * 8) % (R * 1.2)); lh += inkPath([[x - 30, y], [x, y - 4], [x + 30, y]], { seed: sd + 50 + k, t, w: 2.5 }) + ' '; }
          lagH.setAttribute('d', lh);
          bar.setAttribute('d', inkLoop(inkEllipsePts(bx + 10, by + 12, R * 0.26, R * 0.07, seed + 5, 12, -0.2, 0.1), { seed: sd + 60, t }));
          // the Y-shaped blur (soft halo + core)
          const Y = [[bx - 60, by + 18], [bx - 4, by + 2], [bx + 46, by - 30], [bx + 4, by - 2], [bx + 58, by + 16], [bx + 2, by + 8], [bx - 56, by + 28]];
          blur2.setAttribute('d', inkLoop(inkEllipsePts(bx, by + 4, 78, 40, seed + 9, 12, -0.15, 0.12), { seed: sd + 70, t, amp: 2 }));
          blur.setAttribute('d', inkLoop(Y, { seed: sd + 71, t, amp: 1.5 }));
          // glint sparkles
          const ga = atOr(cues, P.glint, -1);
          let sp = '';
          if (ga >= 0 && lt >= ga) {
            [[bx + 20, by - 14, 1], [bx - 30, by + 12, 0.7], [bx + 44, by + 10, 0.55]].forEach(([x, y, k], i) => {
              const pulse = 0.5 + 0.5 * Math.sin((lt - ga) * 9 + i * 2), r = (14 + 22 * pulse) * k * spring(lt, ga + i * 0.12, 0.4);
              sp += inkLoop(star(x, y, r, t * 1.5 + i), { seed: sd + 80 + i, t, amp: 0.4, smooth: false }) + ' ';
            });
          }
          spark.setAttribute('d', sp);
          const ra = atOr(cues, P.ring, -1);
          if (ra >= 0 && lt >= ra) {
            const p = clamp01((lt - ra) / 0.6), pts = [];
            for (let i = 0; i <= Math.round(30 * 1.1 * p); i++) { const a = -2.4 + i / 30 * 6.2832; pts.push([bx + Math.cos(a) * 120 * (1 + i / 300), by + 6 + Math.sin(a) * 70]); }
            ring.setAttribute('d', pts.length > 1 ? inkPath(pts, { seed: sd + 90, t, w: 9 / z * 1.4 }) : '');
          } else ring.setAttribute('d', '');
          updateLabel(label, W, H, lt, t, cues, dur, sd);
          updateCast(cast, W, H, lt, t, cues);
        },
      };
    },
  };

  // ================================================================ ea_lagoon
  SH.ea_lagoon = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, wl = (P.water ?? 0.5) * H;
      const cam = el(svg, 'g');
      const farI = mk(cam, INK.inkSoft, { 'fill-opacity': 0.8 }), farL = mk(cam, INK.green, { 'fill-opacity': 0.35 });
      const water = mk(cam, INK.blue, { 'fill-opacity': 0.22 }), waterH = mk(cam, INK.blue, { 'fill-opacity': 0.45 });
      const ghost = mk(cam, INK.inkSoft);
      const bar = mk(cam, INK.stain, { 'fill-opacity': 0.55 }), barI = mk(cam);
      const trF = mk(cam, INK.hat, { 'fill-opacity': 0.85 }), trI = mk(cam), trG = mk(cam, INK.hatBand, { 'fill-opacity': 0.9 }), crust = mk(cam, INK.paperLight, { 'fill-opacity': 0.9 });
      const spark = mk(cam, INK.gold);
      const castG = el(cam, 'g');
      const front = mk(cam, INK.blue, { 'fill-opacity': 0.3 }), frontI = mk(cam, INK.blue, { 'fill-opacity': 0.6 });
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);
      const by = wl + (portrait ? 150 : 110);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t);
          // far shore with palms
          const fy = wl - 10;
          farL.setAttribute('d', inkLoop([[-60, fy], [W + 60, fy], [W + 60, fy - 40], [W * 0.7, fy - 56], [W * 0.3, fy - 50], [-60, fy - 36]], { seed: sd + 1, t, smooth: true }));
          let pl = ''; for (let i = 0; i < 6; i++) pl += palm(W * (0.06 + i * 0.18), fy - 30, (portrait ? 210 : 170) * (0.8 + (i % 3) * 0.15), (i % 2 ? 1 : -1) * 0.6, sd + 10 + i * 9, t, Math.sin(t * 1.1 + i) * 6) + ' ';
          farI.setAttribute('d', pl);
          const wv = []; for (let i = 0; i <= 20; i++) wv.push([-60 + i * (W + 120) / 20, wl + Math.sin(i * 0.9 + t * 1.6) * 6]);
          water.setAttribute('d', inkLoop(wv.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 2, t, smooth: false, amp: 1 }));
          let wh = ''; for (let k = 0; k < 12; k++) { const y = wl + 40 + k * 70, x = ((k * 173 + t * (10 + k)) % (W + 200)) - 100; wh += inkPath([[x, y], [x + 40, y - 6], [x + 80, y]], { seed: sd + 20 + k, t, w: 3 }) + ' '; }
          waterH.setAttribute('d', wh);
          // dashed ghost Electra over the sandbar, fading out on "gone"
          if (P.ghost) {
            const G = P.ghost, ga = atOr(cues, G.at, 0), go = atOr(cues, G.gone, -1), vis = lt >= ga && (go < 0 || lt < go + 0.6);
            const fade = go >= 0 && lt >= go ? 1 - clamp01((lt - go) / 0.6) : 1;
            if (vis) {
              const cx = W * 0.5, cy = by - (portrait ? 110 : 90), s = portrait ? 1.3 : 0.95;
              const segs = electraOutline(cx, cy, s);
              let d = '';
              segs.forEach((sg, i) => { for (let k = 0; k < sg.length - 1; k++) if ((k + i) % 2 === 0) d += inkPath([sg[k], sg[k + 1]], { seed: sd + 200 + i * 40 + k, t, w: 8 * fade + 0.5 }) + ' '; });
              ghost.setAttribute('d', d); ghost.setAttribute('fill-opacity', fade.toFixed(3));
            } else ghost.setAttribute('d', '');
          }
          // sandbar
          const bp = inkEllipsePts(W * 0.5, by + 30, W * 0.42, 46, seed + 3, 14, 0, 0.06);
          bar.setAttribute('d', inkLoop(bp, { seed: sd + 40, t }));
          barI.setAttribute('d', inkPath(bp.filter((p) => p[1] < by + 40), { seed: sd + 41, t, w: 4 }));
          // fallen trunks (Y shape)
          const ta = atOr(cues, P.trees, -1), hit = punch(lt, ta, 0.6), s = 1 + hit * 0.08;
          const k = portrait ? 1 : 0.85, ox = W * 0.5, oy = by;
          const T = (x, y) => [ox + (x - ox) * s, oy + (y - oy) * s];
          const tA = trunk(...T(W * 0.18, by + 10), ...T(W * 0.78, by - 26), 64 * k, sd + 50, t, [[0.55, -0.75, 0.38], [0.3, 0.6, 0.18]]);
          const tB = trunk(...T(W * 0.42, by + 22), ...T(W * 0.86, by + 6), 46 * k, sd + 80, t, [[0.6, -0.5, 0.3]]);
          trF.setAttribute('d', tA.fill + ' ' + tB.fill); trI.setAttribute('d', tA.ink + ' ' + tB.ink); trG.setAttribute('d', tA.grain + ' ' + tB.grain);
          let cr = ''; for (let i = 0; i < 26; i++) { const tt = i % 2 ? tA : tB, [x, y] = tt.along(0.08 + (i * 0.37) % 0.85); cr += inkDot(x + Math.sin(i * 3) * 10, y - 14 + Math.cos(i * 5) * 8, 5, 4, seed + 100 + i, t) + ' '; }
          crust.setAttribute('d', cr);
          let sp = '';
          if (ta >= 0 && lt >= ta) [[0.35, tA], [0.7, tA], [0.5, tB]].forEach(([u, tt], i) => { const [x, y] = tt.along(u); const r = (12 + 18 * (0.5 + 0.5 * Math.sin((lt - ta) * 8 + i * 2))) * spring(lt, ta + i * 0.1, 0.4); sp += inkLoop(star(x, y - 30, r, t + i), { seed: sd + 120 + i, t, amp: 0.4, smooth: false }) + ' '; });
          spark.setAttribute('d', sp);
          updateCast(cast, W, H, lt, t, cues);
          // shallow water lapping in front of the cast's shins
          const fv = []; for (let i = 0; i <= 20; i++) fv.push([-60 + i * (W + 120) / 20, by + 160 + Math.sin(i * 1.1 + t * 2) * 8]);
          front.setAttribute('d', inkLoop(fv.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 140, t, smooth: false, amp: 1 }));
          frontI.setAttribute('d', inkPath(fv, { seed: sd + 141, t, w: 4 }));
          updateLabel(label, W, H, lt, t, cues, dur, sd);
        },
      };
    },
  };

  // Lockheed Electra 10E side view outline as polylines, centred at (cx, cy), facing right; nose at +330*s
  function electraOutline(cx, cy, s) {
    const Q = (x, y) => [cx + x * s, cy + y * s];
    const fus = [[330, 4], [300, -26], [210, -44], [40, -46], [-180, -34], [-300, -18], [-330, -10], [-330, 8], [-300, 14], [-180, 26], [40, 34], [210, 32], [300, 22], [330, 4]].map(p => Q(...p));
    const fin1 = [[-260, -26], [-300, -112], [-330, -116], [-334, -12]].map(p => Q(...p));
    const fin2 = [[-210, -30], [-250, -96], [-276, -98], [-280, -28]].map(p => Q(...p));
    const tailp = [[-200, 0], [-340, -4]].map(p => Q(...p));
    const wing = [[150, 10], [-60, 14], [-70, 26], [150, 26]].map(p => Q(...p));
    const eng = [[170, -6], [260, -8], [276, 6], [260, 22], [170, 20]].map(p => Q(...p));
    const win = [[210, -40], [270, -24]].map(p => Q(...p));
    return [fus, fin1, fin2, tailp, wing, eng, win];
  }

  // ================================================================ ea_plane
  SH.ea_plane = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, sea = (P.sea ?? 0.72) * H;
      const cam = el(svg, 'g');
      const cloudsB = mk(cam, INK.paperLight), cloudsBI = mk(cam, INK.inkSoft);
      const ocean = mk(cam, INK.blue, { 'fill-opacity': 0.22 }), oceanH = mk(cam, INK.blue, { 'fill-opacity': 0.5 }), isl = mk(cam, INK.green, { 'fill-opacity': 0.6 }), islI = mk(cam);
      const route = mk(cam, INK.red);
      const planeG = el(cam, 'g'), pF = mk(planeG, INK.paperLight), pS = mk(planeG, INK.paperDark), pI = mk(planeG), prop = mk(planeG, INK.inkSoft, { 'fill-opacity': 0.55 }), pD = mk(planeG, INK.inkSoft);
      const cloudsF = mk(cam, INK.paperLight), cloudsFI = mk(cam, INK.inkSoft);
      const castG = el(cam, 'g');
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);
      const r0 = rng(seed * 11 + 3);
      const clouds = Array.from({ length: 7 }, (_, i) => ({ x: r0() * W, y: lerp(H * 0.16, sea - 160, r0()), w: 150 + r0() * 120, v: 14 + r0() * 16, front: i % 3 === 0 }));
      const cloudPts = (x, y, w) => { const pts = []; for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; pts.push([x + Math.cos(a) * w, y + Math.sin(a) * w * 0.32 * (1 + 0.25 * Math.sin(i * 2.3))]); } return pts.concat([[x + w, y + 10], [x - w, y + 10]]); };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t);
          const va = atOr(cues, P.vanish, -1), vp = va >= 0 ? clamp01((lt - va) / 1.2) : 0;
          // clouds drift left (the plane flies right)
          let cb = '', cbi = '', cf = '', cfi = '';
          clouds.forEach((c, i) => {
            const x = ((c.x - t * c.v) % (W + 400) + W + 400) % (W + 400) - 200, pts = cloudPts(x, c.y, c.w * (portrait ? 1 : 0.9));
            const f = inkLoop(pts, { seed: sd + 10 + i, t }), ink = inkPath(pts, { seed: sd + 10 + i, t, closed: true, w: 4 });
            if (c.front) { cf += f + ' '; cfi += ink + ' '; } else { cb += f + ' '; cbi += ink + ' '; }
          });
          // a cloud bank that rolls in over the plane on "vanish"
          if (vp > 0) { const bx = lerp(W * 1.4, W * 0.62, progIO(lt, va, 1.0)), by = H * 0.4; const pts = cloudPts(bx, by + 60, 330); cf += inkLoop(pts, { seed: sd + 40, t }) + ' '; cfi += inkPath(pts, { seed: sd + 40, t, closed: true, w: 5 }) + ' '; }
          cloudsB.setAttribute('d', cb); cloudsBI.setAttribute('d', cbi); cloudsF.setAttribute('d', cf); cloudsFI.setAttribute('d', cfi);
          const ov = []; for (let i = 0; i <= 20; i++) ov.push([-60 + i * (W + 120) / 20, sea + Math.sin(i * 1.3 + t) * 4]);
          ocean.setAttribute('d', inkLoop(ov.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 50, t, smooth: false }));
          let oh = ''; for (let k = 0; k < 14; k++) { const y = sea + 30 + (k % 7) * 60, x = ((k * 211 - t * (20 + k * 2)) % (W + 200) + W + 200) % (W + 200) - 100; oh += inkPath([[x, y], [x + 30, y - 8], [x + 60, y]], { seed: sd + 60 + k, t, w: 3 }) + ' '; }
          oceanH.setAttribute('d', oh);
          if (P.island !== false) {
            const ix = ((P.island || {}).x ?? 0.84) * W, iy = sea + 30, ip = inkEllipsePts(ix, iy, 34, 9, seed + 7, 10, 0, 0.1);
            isl.setAttribute('d', inkLoop(ip, { seed: sd + 70, t })); islI.setAttribute('d', inkPath(ip, { seed: sd + 70, t, closed: true, w: 4 }));
          }
          // plane
          const s = (portrait ? 1.05 : 0.9) * (P.scale ?? 1), cx = lerp(W * 0.36, W * 0.5, progIO(lt, 0, dur)) + vp * W * 0.2, cy = (P.y ?? 0.4) * H + Math.sin(t * 1.4) * 10;
          const rot = Math.sin(t * 0.9) * 2.5;
          planeG.setAttribute('transform', `rotate(${f1(rot)} ${f1(cx)} ${f1(cy)})`);
          const seg = electraOutline(cx, cy, s), fade = 1 - vp;
          if (fade > 0.02) {
            pF.setAttribute('d', inkLoop(seg[0], { seed: sd + 100, t }) + ' ' + inkLoop(seg[1], { seed: sd + 101, t, smooth: false }) + ' ' + inkLoop(seg[2], { seed: sd + 102, t, smooth: false }));
            pS.setAttribute('d', inkLoop(seg[4], { seed: sd + 104, t, smooth: false }) + ' ' + inkLoop(seg[5], { seed: sd + 105, t }));
            pI.setAttribute('d', seg.map((g, i) => inkPath(g, { seed: sd + 100 + i, t, closed: i !== 3 && i !== 6, w: i === 6 ? 8 : 6, smooth: i === 0 || i === 5 })).join(' '));
            [pF, pS, pI].forEach(e => e.setAttribute('fill-opacity', (fade * (e === pS ? 1 : 1)).toFixed(3)));
            const [ex, ey] = [cx + 280 * s, cy + 7 * s], ph = Math.abs(Math.sin(t * 40));
            prop.setAttribute('d', inkLoop(inkEllipsePts(ex, ey, 8 * s, 46 * s * (0.6 + 0.4 * ph), seed + 3, 10), { seed: sd + 120, t }));
            prop.setAttribute('fill-opacity', (0.55 * fade).toFixed(3));
          } else { pF.setAttribute('d', ''); pS.setAttribute('d', ''); pI.setAttribute('d', ''); prop.setAttribute('d', ''); }
          // dashed outline left behind
          if (vp > 0) { let d = ''; seg.forEach((g, i) => { for (let k = 0; k < g.length - 1; k++) if ((k + i) % 2 === 0) d += inkPath([g[k], g[k + 1]], { seed: sd + 300 + i * 30 + k, t, w: 5 }) + ' '; }); pD.setAttribute('d', d); pD.setAttribute('fill-opacity', (vp * (1 - clamp01((lt - va - 1.6) / 0.8))).toFixed(3)); }
          else pD.setAttribute('d', '');
          // dashed route behind the plane towards the island
          if (P.route) {
            const ra = atOr(cues, P.route, 0.2), rp = prog(lt, ra, 1.5), x0 = W * 0.04, y0 = cy + 20, x1 = lerp(x0, cx - 340 * s, rp);
            let d = ''; for (let x = x0; x < x1 - 20; x += 50) d += inkPath([[x, y0 + Math.sin(x * 0.01) * 8], [Math.min(x + 26, x1), y0 + Math.sin((x + 26) * 0.01) * 8]], { seed: sd + 400 + Math.round(x), t, w: 6 }) + ' ';
            route.setAttribute('d', d);
          }
          updateLabel(label, W, H, lt, t, cues, dur, sd);
          updateCast(cast, W, H, lt, t, cues);
        },
      };
    },
  };

  // ================================================================ ea_log
  SH.ea_log = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, gy = (P.ground ?? 0.58) * H;
      const cam = el(svg, 'g');
      const water = mk(cam, INK.blue, { 'fill-opacity': 0.22 }), sand = mk(cam, INK.stain, { 'fill-opacity': 0.5 }), sandI = mk(cam);
      const trF = mk(cam, INK.hat, { 'fill-opacity': 0.85 }), trI = mk(cam), trG = mk(cam, INK.hatBand, { 'fill-opacity': 0.9 });
      const crustF = mk(cam, INK.paperLight), crustI = mk(cam, INK.inkSoft), spark = mk(cam, INK.gold);
      const ring = mk(cam, INK.red), arrow = mk(cam, INK.red);
      const note = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 84 : 66, 'text-anchor': 'middle', fill: INK.red,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      note.textContent = P.note || 'coral sand';
      const castG = el(cam, 'g');
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);
      const r0 = rng(seed * 17 + 1);
      const grains = Array.from({ length: 70 }, () => [r0(), r0() * 2 - 1, 4 + r0() * 8]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t);
          water.setAttribute('d', `M-60 ${f1(gy - 260)} H${W + 60} V${f1(gy + 60)} H-60 Z`);
          const sf = []; for (let i = 0; i <= 14; i++) sf.push([-60 + i * (W + 120) / 14, gy + 40 + Math.sin(i * 1.7) * 10]);
          sand.setAttribute('d', inkLoop(sf.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 1, t, smooth: false }));
          sandI.setAttribute('d', inkPath(sf, { seed: sd + 2, t, w: 5 }));
          const ent = spring(lt, 0, 0.7), w = (portrait ? 230 : 190) * lerp(0.8, 1, ent);
          const tr = trunk(-80, gy - 20, W * 0.86, gy - 120, w, sd + 10, t, [[0.62, -0.85, 0.28]]);
          trF.setAttribute('d', tr.fill); trI.setAttribute('d', tr.ink); trG.setAttribute('d', tr.grain);
          // crust: pale blobs along the top half of the trunk
          let cf = '', ci = '';
          grains.forEach(([u, v, r], i) => { const [x, y] = tr.along(0.12 + u * 0.8); const yy = y + tr.ny * v * w * 0.42, xx = x + tr.nx * v * w * 0.42; if (v > 0.3) return; cf += inkDot(xx, yy, r, r * 0.7, seed + 200 + i, t) + ' '; if (i % 3 === 0) ci += inkPath(circ(xx, yy, r, 8), { seed: sd + 300 + i, t, closed: true, w: 2 }) + ' '; });
          crustF.setAttribute('d', cf); crustI.setAttribute('d', ci);
          const ga = atOr(cues, P.glint, 0.2);
          let sp = '';
          [0.25, 0.48, 0.7, 0.36].forEach((u, i) => { const [x, y] = tr.along(u); const pulse = 0.5 + 0.5 * Math.sin((lt - ga) * 8 + i * 1.7), r = (16 + 24 * pulse) * spring(lt, ga + i * 0.15, 0.4); if (lt >= ga) sp += inkLoop(star(x, y - w * 0.3, r, t + i), { seed: sd + 400 + i, t, amp: 0.4, smooth: false }) + ' '; });
          spark.setAttribute('d', sp);
          const ra = atOr(cues, P.ring, -1);
          if (ra >= 0 && lt >= ra) {
            const [bx, by] = tr.along(0.45), p = clamp01((lt - ra) / 0.6), pts = [];
            for (let i = 0; i <= Math.round(30 * 1.1 * p); i++) { const a = -2.4 + i / 30 * 6.2832; pts.push([bx + Math.cos(a) * 230 * (1 + i / 300), by - w * 0.15 + Math.sin(a) * w * 0.6]); }
            ring.setAttribute('d', pts.length > 1 ? inkPath(pts, { seed: sd + 500, t, w: 10 }) : '');
            const np = spring(lt, ra + 0.4, 0.6), nx = (P.note_x ?? 0.5) * W, ny = (P.note_y ?? 0.28) * H;
            note.style.display = lt < ra + 0.4 ? 'none' : '';
            note.setAttribute('x', nx); note.setAttribute('y', ny);
            note.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) scale(${lerp(0.6, 1, np).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
            const ap = clamp01((lt - ra - 0.5) / 0.5), ax1 = bx, ay1 = by - w * 0.75;
            arrow.setAttribute('d', ap > 0 ? inkPath([[nx, ny + 26], [lerp(nx, ax1, ap * 0.5) + 30, lerp(ny + 26, ay1, ap * 0.5)], [lerp(nx, ax1, ap), lerp(ny + 26, ay1, ap)]], { seed: sd + 510, t, w: 7 }) +
              (ap >= 1 ? ' ' + inkPath([[ax1 - 26, ay1 - 24], [ax1, ay1], [ax1 + 6, ay1 - 30]], { seed: sd + 511, t, w: 7 }) : '') : '');
          } else { ring.setAttribute('d', ''); arrow.setAttribute('d', ''); note.style.display = 'none'; }
          updateCast(cast, W, H, lt, t, cues);
          updateLabel(label, W, H, lt, t, cues, dur, sd);
        },
      };
    },
  };

  // ================================================================ ea_crabs
  SH.ea_crabs = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd0 = seed * 1000, gy = (P.ground ?? 0.62) * H, sea = gy - (portrait ? 170 : 130);
      const cam = el(svg, 'g');
      const sky = mk(cam, INK.inkSoft, { 'fill-opacity': 0.35 }), stars = mk(cam, INK.paperLight), moon = mk(cam, INK.paperLight), moonI = mk(cam);
      const water = mk(cam, INK.blue, { 'fill-opacity': 0.35 }), waterH = mk(cam, INK.paperLight, { 'fill-opacity': 0.6 });
      const shipF = mk(cam, INK.paperDark), shipI = mk(cam), shipL = mk(cam, INK.gold);
      const beach = mk(cam, INK.stain, { 'fill-opacity': 0.55 }), beachI = mk(cam);
      const palms = mk(cam);
      const castG = el(cam, 'g');
      const crabF = mk(cam, INK.red, { 'fill-opacity': 0.75 }), crabI = mk(cam);
      const label = makeLabel(svg, P, portrait);
      const cast = makeCast(ctx, P, castG, portrait ? 0.6 : 0.5);
      const n = P.crabs ?? 3;
      const r0 = rng(seed * 5 + 9);
      const crabs = Array.from({ length: n }, (_, i) => ({ x0: -0.25 - i * 0.12, x1: 0.18 + i * 0.16, y: gy + 70 + (i % 2) * 90, s: (portrait ? 1.3 : 0.95) * (1.1 - i * 0.12), d: 0.2 + i * 0.35, ph: r0() * 6 }));
      const starXY = Array.from({ length: 18 }, () => [r0() * W, r0() * (sea - 120)]);
      function crab(cx, cy, s, t, sd, walk) {
        const Q = (x, y) => [cx + x * s, cy + y * s];
        const body = [[-90, -60], [-40, -96], [40, -96], [90, -60], [70, -30], [-70, -30]].map(p => Q(...p));
        let f = inkLoop(body, { seed: sd, t }), ink = inkPath(body, { seed: sd, t, closed: true, w: 6 });
        for (let side = -1; side <= 1; side += 2) for (let l = 0; l < 4; l++) {
          const sw = Math.sin(walk * 6.2832 + l * 1.4 + side) * 14, hx = side * (50 + l * 10), knee = [hx + side * 60, -90 + l * 6 + sw], foot = [hx + side * (100 + l * 12) + sw, 6];
          ink += ' ' + inkPath([Q(hx, -50), Q(...knee), Q(...foot)], { seed: sd + 10 + l + side * 5, t, w: 6 });
        }
        // big claws in front
        const cl = Math.sin(t * 5) * 0.12;
        [[1, 0], [-1, 1]].forEach(([d, k]) => {
          const base = Q(d * 70, -70), tip = Q(d * 150, -150 + k * 20);
          ink += ' ' + inkPath([base, Q(d * 120, -110), tip], { seed: sd + 30 + k, t, w: 10 });
          const cp = [tip, Q(d * (180 + cl * 60), -180 + k * 20), Q(d * 200, -150 + k * 20), Q(d * 176, -138 + k * 20)];
          f += ' ' + inkLoop(cp, { seed: sd + 40 + k, t });
          ink += ' ' + inkPath(cp, { seed: sd + 40 + k, t, closed: true, w: 5 });
        });
        const eyes = inkDot(...Q(-20, -104), 6, 6, sd + 50, t) + ' ' + inkDot(...Q(20, -104), 6, 6, sd + 51, t);
        return { f, ink: ink + ' ' + eyes + ' ' + inkPath([Q(-20, -96), Q(-24, -112)], { seed: sd + 52, t, w: 4 }) + ' ' + inkPath([Q(20, -96), Q(24, -112)], { seed: sd + 53, t, w: 4 }) };
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          camT(cam, P, W, H, lt, dur, t);
          sky.setAttribute('d', `M-60 -60 H${W + 60} V${f1(sea)} H-60 Z`);
          stars.setAttribute('d', starXY.map(([x, y], i) => inkLoop(star(x, y, 8 + 4 * Math.sin(t * 3 + i), i), { seed: sd + 5 + i, t, amp: 0.3, smooth: false })).join(' '));
          const mx = W * 0.8, my = H * 0.2;
          moon.setAttribute('d', inkLoop(circ(mx, my, 70, 16), { seed: sd + 2, t }));
          moonI.setAttribute('d', inkPath(circ(mx, my, 70, 16), { seed: sd + 2, t, closed: true, w: 5 }));
          const wv = []; for (let i = 0; i <= 20; i++) wv.push([-60 + i * (W + 120) / 20, sea + Math.sin(i * 1.1 + t * 1.4) * 5]);
          water.setAttribute('d', inkLoop(wv.concat([[W + 60, gy + 20], [-60, gy + 20]]), { seed: sd + 3, t, smooth: false }));
          let wh = ''; for (let k = 0; k < 6; k++) { const x = mx - 60 + k * 26 + Math.sin(t * 2 + k) * 10, y = sea + 20 + k * 22; wh += inkPath([[x - 30, y], [x + 30, y]], { seed: sd + 20 + k, t, w: 4 }) + ' '; }
          waterH.setAttribute('d', wh);
          // the expedition ship offshore, a lit window
          const sx = W * 0.82, sy = sea + 6 + Math.sin(t * 1.3) * 4;
          const hull = [[sx - 150, sy - 40], [sx + 160, sy - 44], [sx + 120, sy + 10], [sx - 120, sy + 10]];
          const cabin = [[sx - 60, sy - 40], [sx - 60, sy - 90], [sx + 50, sy - 90], [sx + 50, sy - 40]];
          shipF.setAttribute('d', inkLoop(hull, { seed: sd + 30, t, smooth: false }) + ' ' + inkLoop(cabin, { seed: sd + 31, t, smooth: false }));
          shipI.setAttribute('d', inkPath(hull, { seed: sd + 30, t, closed: true, w: 5, smooth: false }) + ' ' + inkPath(cabin, { seed: sd + 31, t, closed: true, w: 5, smooth: false }) + ' ' + inkPath([[sx + 20, sy - 90], [sx + 20, sy - 170]], { seed: sd + 32, t, w: 5 }));
          shipL.setAttribute('d', inkLoop([[sx - 40, sy - 76], [sx - 10, sy - 76], [sx - 10, sy - 56], [sx - 40, sy - 56]], { seed: sd + 33, t, smooth: false }));
          const bf = []; for (let i = 0; i <= 16; i++) bf.push([-60 + i * (W + 120) / 16, gy + Math.sin(i * 1.6) * 10]);
          beach.setAttribute('d', inkLoop(bf.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 40, t, smooth: false }));
          beachI.setAttribute('d', inkPath(bf, { seed: sd + 41, t, w: 5 }));
          palms.setAttribute('d', [0, 1].map(i => palm(W * (0.06 + i * 0.2), gy + 10, (portrait ? 420 : 320) * (1 - i * 0.2), 0.8 - i * 0.3, sd + 50 + i * 10, t, Math.sin(t * 1.2 + i) * 8)).join(' '));
          let cf = '', ci = '';
          crabs.forEach((c, i) => {
            const u = progIO(lt, c.d, Math.max(1, dur * 0.8)), x = lerp(c.x0, c.x1, u) * W, walk = (lt - c.d) * 1.6 + c.ph;
            const g = crab(x, c.y + Math.abs(Math.sin(walk * 6.2832)) * -4, c.s * spring(lt, c.d, 0.6), t, sd + 100 + i * 60, walk);
            cf += g.f + ' '; ci += g.ink + ' ';
          });
          crabF.setAttribute('d', cf); crabI.setAttribute('d', ci);
          updateCast(cast, W, H, lt, t, cues);
          updateLabel(label, W, H, lt, t, cues, dur, sd);
        },
      };
    },
  };
})();
