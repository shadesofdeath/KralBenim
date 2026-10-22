// tunguska: an air burst over a forest (Tunguska, Siberia, 30 June 1908) in the parchment ink style
// (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via _ink.js). Three shots, all parametric:
//
// SHOTS.tunguska — side view of a taiga: far hills, a far row and a near row of hand-drawn conifers, a fireball that
//   streaks in leaving a smoke trail, an air burst (flash disc, gold rays, ink shock rings) and the shock front that
//   knocks every tree over AWAY from the burst point as it reaches it; trees right under the burst stay standing,
//   stripped of their branches. Optional altitude marker (dashed line burst -> ground + label) and a ground note.
//   P: {blast: [0.62, 0.24] (0..1 of W/H), from: [-0.15, -0.02] (where the fireball enters), streak: 0 (cue/seconds the
//       fireball appears; it reaches the burst point on "boom"), fall: true, speed: 1500 (shock front px/s),
//       front: {xs: [0.04, 0.5, 0.98], y: 0.67, scale: 1.7} (optional foreground row of big trees, also knocked over),
//       n: 12 (near trees), tree_scale: 1 (near tree height), far: 20 (far trees), strip: 0.08 (half-width, 0..1 W, of the standing stripped trees),
//       ground: 0.56 (0..1 H), aftermath: false (true: the burst is long over, all trees already down), alt: {text: "5–10 km", at}, crater: {text: "krater yok", at, x, dy: 62 (px below the ground line; negative = in the sky), size},
//       labels: [{text, x, y, at, size, color, rot}], cast: [{who: "kasif"|name, accessory, beard, x, y, scale, pose,
//       at, then, dir, face: "left"|"right", emotion, to (walk/run target x, arrives on "at")}], cam: {zoom: 1.06, focus: [x, y]}}
//   cues: streak, boom (burst), alt, crater, label/cast "at" names
//
// SHOTS.tunguska_top — bird's-eye view of the felled forest: hundreds of tree crowns in a butterfly-shaped area; on
//   "fall" a shock ring races out from the centre and every tree it passes is laid flat pointing outward (the famous
//   radial "fan"); the trees in the middle stay standing. A winding river, a centre star, a handwritten label.
//   P: {center: [0.44, 0.43], rx: 0.42 (0..1 W), ry: 0.2 (0..1 H), n: 240, speed: 520, core: 0.1 (standing core, 0..1 of rx),
//       aftermath: false (true: everything already lies flat), cam: {from: 1.07, to: 1} (zoom over the shot),
//       river: true, label: {text: "~2.000 km²", x, y, at, size}, cast: [...]}
//   cues: fall (ring + trees), hit (punch), label/cast "at" names
//
// SHOTS.tunguska_porch — a log trading post with a porch; a man sits on the porch; on "flash" the far horizon lights up
//   (gold glow + rays), heat waves roll across; on "thrown" the man is hurled off the porch (arc + spin) and lands on
//   his back; on "heat" little flames lick his shirt. Kaşif and others react through `cast`.
//   P: {house_x: 0.26, man: {x: 0.5, scale, accessory, beard: "short", throw: 0.06 (0..1 W, how far left he lands)}, sign: "Vanavara", glow_x: 1.02,
//       labels: [...], cast: [...], ground: 0.56}
//   cues: flash, thrown, heat, label/cast "at" names
// SHOTS.tunguska_rock — a big ink space rock with a smoke trail flying in over a forest (see its block below).
// Everything is a pure function of (seed, lt): no Math.random, scrubbing back gives the same frame.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { red: INK.red, ink: INK.ink, blue: INK.blue, gold: INK.gold, green: INK.green, soft: INK.inkSoft };
  const rotP = (q, a) => { const c = Math.cos(a), s = Math.sin(a); return [q[0] * c - q[1] * s, q[0] * s + q[1] * c]; };
  const hand = (parent, size, color) => el(parent, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: color,
    style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });

  // ---------------------------------------------------------------- cast (Kaşif + period figures)
  function castOf(P, parent, seed, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = (m.scale ?? 1) * defScale;
      return { m, isK, sc, rig: KASIF.create(el(parent, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) };
    });
  }
  function castUpdate(cast, lt, t, cues, W, H, G) {
    cast.forEach(c => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      let x = (m.x ?? 0.8) * W;
      if (moving) x = lerp(x, m.to * W, progIO(lt, 0, Math.max(0.4, at ?? 1.5)));
      const y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : m.face === 'right' ? 1 : (moving ? (m.to > m.x ? 1 : -1) : 1);
      const o = { x, y, face, since, dir, text: m.text, item: m.item,
        emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
      if (pose === 'walk' || pose === 'run') o.ph = Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) || lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
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

  // ---------------------------------------------------------------- a conifer (local: base at 0,0, up = -y)
  function crownPts(h, w) {
    const k = 5, L = [], R = [];
    for (let i = 0; i < k; i++) {
      const y0 = -h * 0.22 - i * (h * 0.76 / k), wo = w * (1 - i / (k + 0.5)), step = h * 0.76 / k;
      L.push([-wo, y0], [-wo * 0.42, y0 - step * 0.6]);
      R.push([wo, y0], [wo * 0.42, y0 - step * 0.6]);
    }
    return L.concat([[0, -h]], R.reverse());
  }
  const place = (pts, x, y, a) => pts.map(q => { const r = rotP(q, a); return [x + r[0], y + r[1]]; });

  // ================================================================ tunguska (side view)
  SH.tunguska = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 17, G = (P.ground ?? (portrait ? 0.56 : 0.8)) * H;
      const r = rng(seed * 31 + 5);
      const root = el(svg, 'g'), world = el(root, 'g');
      const cloudF = mk(world, INK.paperLight), cloudR = mk(world, INK.inkSoft);
      const glowF = mk(world, INK.paperLight, { 'fill-opacity': 0 }), ringR = mk(world, INK.inkSoft, { 'fill-opacity': 0 });
      const smokeF = mk(world, INK.paperDark, { 'fill-opacity': 0.85 }), smokeR = mk(world, INK.inkSoft);
      const hillF = mk(world, INK.paperDark, { 'fill-opacity': 0.6 }), hillR = mk(world, INK.inkSoft);
      const farF = mk(world, INK.inkSoft, { 'fill-opacity': 0.35 }), farR = mk(world, INK.inkSoft);
      const raysR = mk(world, INK.gold), coreF = mk(world, INK.gold), coreR = mk(world, INK.red), coreL = mk(world, INK.paperLight);
      const groundF = mk(world, INK.paperDark, { 'fill-opacity': 0.55 }), groundR = mk(world), hatchR = mk(world, INK.inkSoft);
      const nearF = mk(world, INK.inkSoft, { 'fill-opacity': 0.45 }), nearR = mk(world), trunkR = mk(world);
      const frontF = mk(world, INK.inkSoft, { 'fill-opacity': 0.55 }), frontR = mk(world), frontTk = mk(world);
      const altR = mk(world, INK.red), altG = el(world, 'g'), altT = hand(altG, portrait ? 80 : 64, INK.red);
      const crG = el(world, 'g'), crT = hand(crG, (P.crater && P.crater.size) || (portrait ? 72 : 60), INK.red), crU = mk(crG, INK.red);
      const castG = el(world, 'g');
      const uiG = el(root, 'g');
      if (P.alt) altT.textContent = P.alt.text || '';
      if (P.crater) crT.textContent = P.crater.text || '';
      const cast = castOf(P, castG, seed, portrait ? 0.78 : 0.62);
      const labels = labelsOf(P.labels, uiG, W, H);
      const BX = (P.blast ? P.blast[0] : 0.62) * W, BY = (P.blast ? P.blast[1] : 0.24) * H;
      const FX = (P.from ? P.from[0] : -0.15) * W, FY = (P.from ? P.from[1] : -0.02) * H;
      const strip = (P.strip ?? 0.08) * W, v = P.speed ?? 1500;
      // trees: near row spans the width, far row smaller on the hill line
      const nN = P.n ?? 12, nF = P.far ?? 20;
      const mkTree = (i, n, far) => {
        const x = -60 + (W + 120) * (i + 0.5 + (r() - 0.5) * 0.6) / n;
        const h = (far ? 120 + r() * 70 : (portrait ? 300 : 240) + r() * (portrait ? 140 : 110)) * (far ? 1 : (P.tree_scale ?? 1));
        return { x, y: far ? G - 150 + r() * 26 : G + 8 + r() * 26, h, w: h * (0.2 + r() * 0.06), far, ph: r() * 6 };
      };
      const near = Array.from({ length: nN }, (_, i) => mkTree(i, nN, false)).sort((a, b) => a.y - b.y);
      const farT = Array.from({ length: nF }, (_, i) => mkTree(i, nF, true));
      const FR = P.front || null;
      const front = FR ? (FR.xs || [0.04, 0.5, 0.98]).map((fx0, i) => { const h = 400 * (FR.scale ?? 1.7) * (0.9 + r() * 0.2); return { x: fx0 * W, y: (FR.y ?? (portrait ? 0.67 : 0.9)) * H, h, w: h * 0.22, far: false, ph: r() * 6 }; }) : [];
      const clouds = Array.from({ length: 3 }, (_, i) => ({ x: W * (0.15 + i * 0.36) + r() * 80, y: H * (portrait ? 0.2 : 0.16) + r() * 120, s: 0.8 + r() * 0.5 }));
      const hatch = Array.from({ length: 30 }, () => ({ x: r() * W, y: G + 20 + r() * 50, l: 30 + r() * 50 }));
      // fall progress of a tree (0 standing .. 1 down); trees under the burst stay up
      const fallOf = (tr, lt, boom) => {
        if (P.fall === false || lt < boom) return 0;
        if (Math.abs(tr.x - BX) < strip) return 0;
        const d = Math.hypot(tr.x - BX, tr.y - tr.h * 0.5 - BY);
        return sm((lt - boom - d / v) / (tr.far ? 0.3 : 0.42));
      };
      const stripped = (tr, lt, boom) => P.fall !== false && lt >= boom + Math.hypot(tr.x - BX, tr.y - BY) / v && Math.abs(tr.x - BX) < strip;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const AFT = !!P.aftermath, boom = AFT ? -60 : atOr(cues, 'boom', dur * 0.45), st = Math.min(atOr(cues, 'streak', 0), boom - 0.2);
          const pk = punch(lt, boom, 0.7), since = lt - boom;
          const shake = since > 0 && !AFT ? Math.sin(lt * 47) * 16 * Math.exp(-since * 3.5) : 0;
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * pk);
          const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.45) * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 7 + shake)} ${f1(Math.cos(lt * 0.27) * 4 + shake * 0.4)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // clouds drift
          let cf = '', cr = '';
          clouds.forEach((c, i) => {
            const x = c.x + lt * 12 * c.s, y = c.y, R = 34 * c.s;
            const b = [[x - 3 * R, y], [x - 2.4 * R, y - 0.9 * R], [x - 1.4 * R, y - 1.4 * R], [x - 0.3 * R, y - 1.9 * R], [x + 0.8 * R, y - 1.4 * R], [x + 1.8 * R, y - 1.5 * R], [x + 2.7 * R, y - 0.7 * R], [x + 3 * R, y]];
            cf += inkLoop(b.concat([[x, y + 6]]), O(10 + i, { amp: 1.2 })) + ' ';
            cr += inkPath(b, O(10 + i, { w: 3.5, amp: 1.2 })) + ' ';
          });
          cloudF.setAttribute('d', cf); cloudR.setAttribute('d', cr);
          // fireball travel + smoke trail
          const tr = clamp01((lt - st) / Math.max(0.2, boom - st)), hx = lerp(FX, BX, tr), hy = lerp(FY, BY, tr * tr * 0.3 + tr * 0.7);
          let sf = '', sr = '';
          if (lt >= st && !AFT) {
            const L = Math.hypot(hx - FX, hy - FY), n = Math.floor(L / 58);
            for (let i = 0; i < n; i++) {
              const u = i * 58 / Math.max(1, Math.hypot(BX - FX, BY - FY)), px = lerp(FX, BX, u), py = lerp(FY, BY, u * u * 0.3 + u * 0.7);
              const age = Math.max(0, lt - (st + u * (boom - st)));
              const rad = Math.min(58, 12 + age * 30) * (1 + 0.15 * Math.sin(i * 1.7));
              const off = boil(sd + 60 + i, t, 2);
              sf += inkCircle(px + off[0], py + off[1] - age * 8, rad, sd + 70 + i, t, { fill: true }) + ' ';
              sr += inkCircle(px + off[0], py + off[1] - age * 8, rad, sd + 70 + i, t, { w: 3 }) + ' ';
            }
          }
          smokeF.setAttribute('d', sf); smokeR.setAttribute('d', sr);
          smokeF.setAttribute('fill-opacity', f1(0.85 * (since > 0 ? Math.max(0.35, 1 - since * 0.25) : 1) * 100) / 100);
          // burst: flash disc, rays, shock rings
          if (since > 0 && !AFT) {
            const u = clamp01(since / 1.4), gr = lerp(120, portrait ? 900 : 1100, sm(u));
            glowF.setAttribute('d', inkCircle(BX, BY, gr, sd + 3, t, { fill: true }));
            glowF.setAttribute('fill-opacity', f1((1 - u) * 0.9 * 100) / 100);
            let rr = '';
            for (let k = 0; k < 2; k++) {
              const R = (since - k * 0.18) * v * 0.9;
              if (R > 20 && R < 2200) rr += inkCircle(BX, BY, R, sd + 5 + k, t, { w: 7 - k * 2, ry: R * 0.92 }) + ' ';
            }
            ringR.setAttribute('d', rr);
            ringR.setAttribute('fill-opacity', f1(clamp01(1.4 - since * 0.5) * 100) / 100);
          } else { glowF.setAttribute('d', ''); ringR.setAttribute('d', ''); }
          // hills + far trees
          hillF.setAttribute('d', inkLoop([[-80, G - 120], [W * 0.18, G - 190], [W * 0.42, G - 150], [W * 0.66, G - 210], [W * 0.88, G - 160], [W + 80, G - 180], [W + 80, G], [-80, G]], O(30, { amp: 2 })));
          hillR.setAttribute('d', inkPath([[-80, G - 120], [W * 0.18, G - 190], [W * 0.42, G - 150], [W * 0.66, G - 210], [W * 0.88, G - 160], [W + 80, G - 180]], O(31, { w: 4 })));
          let ff = '', fr = '';
          farT.forEach((tr2, i) => {
            const p = fallOf(tr2, lt, boom), dirS = tr2.x >= BX ? 1 : -1, sway = Math.sin(t * 1.3 + tr2.ph) * 0.02;
            if (stripped(tr2, lt, boom)) { fr += inkPath(place([[0, 0], [0, -tr2.h * 0.9]], tr2.x, tr2.y, 0), O(40 + i, { w: 4 })) + ' '; return; }
            const pts = place(crownPts(tr2.h, tr2.w * (1 - 0.5 * p)), tr2.x, tr2.y, dirS * 1.45 * p + sway);
            ff += inkLoop(pts, O(40 + i, { smooth: false, amp: 1 })) + ' ';
            fr += inkPath(pts, O(40 + i, { w: 3, closed: true, smooth: false, amp: 1 })) + ' ';
          });
          farF.setAttribute('d', ff); farR.setAttribute('d', fr);
          // fireball head / burst core
          if (AFT) { raysR.setAttribute('d', ''); coreF.setAttribute('d', ''); coreR.setAttribute('d', ''); coreL.setAttribute('d', ''); }
          else if (lt >= st && since < 0) {
            const hr = 34 + Math.sin(t * 20) * 3, dx = hx - FX, dy = hy - FY, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
            let rays = '';
            for (let k = -1; k <= 1; k++) rays += inkPath([[hx - ux * hr * 0.8 - uy * k * 16, hy - uy * hr * 0.8 + ux * k * 16], [hx - ux * (hr * 3.2 - Math.abs(k) * 30) - uy * k * 26, hy - uy * (hr * 3.2 - Math.abs(k) * 30) + ux * k * 26]], O(50 + k, { w: 12 - Math.abs(k) * 3 })) + ' ';
            raysR.setAttribute('d', rays); raysR.setAttribute('fill', INK.red);
            coreF.setAttribute('d', inkCircle(hx, hy, hr, sd + 55, t, { fill: true }));
            coreR.setAttribute('d', inkCircle(hx, hy, hr, sd + 55, t, { w: 6 }));
            coreL.setAttribute('d', inkCircle(hx, hy, hr * 0.42, sd + 56, t, { fill: true }));
          } else if (since >= 0) {
            const u = clamp01(since / 1.6), cr2 = lerp(70, 150, sm(since / 0.4)) * (1 - 0.55 * u) * (1 + 0.08 * Math.sin(t * 14));
            let rays = '';
            for (let k = 0; k < 16; k++) {
              const a = k / 16 * Math.PI * 2 + 0.2 + t * 0.15, l0 = cr2 * 1.25, l1 = cr2 * (1.9 + 0.5 * Math.sin(t * 9 + k * 1.7)) + since * 60;
              rays += inkPath([[BX + Math.cos(a) * l0, BY + Math.sin(a) * l0], [BX + Math.cos(a) * l1, BY + Math.sin(a) * l1]], O(80 + k, { w: 9 * (1 - u * 0.6) })) + ' ';
            }
            raysR.setAttribute('d', u < 1 ? rays : ''); raysR.setAttribute('fill', INK.gold);
            coreF.setAttribute('d', inkCircle(BX, BY, cr2, sd + 57, t, { fill: true }));
            coreR.setAttribute('d', inkCircle(BX, BY, cr2, sd + 57, t, { w: 6 }));
            coreL.setAttribute('d', inkCircle(BX, BY, cr2 * 0.55, sd + 58, t, { fill: true }));
          } else { raysR.setAttribute('d', ''); coreF.setAttribute('d', ''); coreR.setAttribute('d', ''); coreL.setAttribute('d', ''); }
          // ground
          groundF.setAttribute('d', inkLoop([[-80, G], [W + 80, G - 4], [W + 80, G + 80], [-80, G + 80]], O(90, { smooth: false })));
          groundR.setAttribute('d', inkPath([[-80, G + 2], [W * 0.5, G - 4], [W + 80, G + 1]], O(91, { w: 6 })));
          hatchR.setAttribute('d', hatch.map((h, i) => inkPath([[h.x, h.y], [h.x + h.l, h.y - 6]], O(92 + i, { w: 3, amp: 1 }))).join(' '));
          // near trees
          let nf = '', nr = '', tk = '';
          near.forEach((tr2, i) => {
            const p = fallOf(tr2, lt, boom), dirS = tr2.x >= BX ? 1 : -1, sway = Math.sin(t * 1.1 + tr2.ph) * 0.025 * (1 - p);
            const a = dirS * 1.48 * p + sway;
            if (stripped(tr2, lt, boom)) {
              const S = place([[0, 0], [0, -tr2.h * 0.92]], tr2.x, tr2.y, sway);
              tk += inkPath(S, O(130 + i, { w: 11 })) + ' ';
              for (let k = 1; k <= 4; k++) for (const s of [-1, 1]) {
                const yy = -tr2.h * (0.25 + k * 0.15);
                tk += inkPath(place([[0, yy], [s * 26, yy - 22 + k * 3]], tr2.x, tr2.y, sway), O(140 + i * 10 + k + (s > 0 ? 5 : 0), { w: 5 })) + ' ';
              }
              return;
            }
            const pts = place(crownPts(tr2.h, tr2.w * (1 - 0.5 * p)), tr2.x, tr2.y, a);
            nf += inkLoop(pts, O(100 + i, { smooth: false, amp: 1.3 })) + ' ';
            nr += inkPath(pts, O(100 + i, { w: 4.5, closed: true, smooth: false, amp: 1.3 })) + ' ';
            tk += inkPath(place([[0, 4], [0, -tr2.h * (p > 0.05 ? 0.96 : 0.24)]], tr2.x, tr2.y, a), O(120 + i, { w: 10 })) + ' ';
            if (p > 0.02 && p < 0.98) {   // dust kicked up at the root
              const b = place([[dirS * -30, -6]], tr2.x, tr2.y, 0)[0];
              tk += inkPath([[b[0], b[1]], [b[0] - dirS * 40 * p, b[1] - 30 * p]], O(160 + i, { w: 3 })) + ' ';
            }
          });
          nearF.setAttribute('d', nf); nearR.setAttribute('d', nr); trunkR.setAttribute('d', tk);
          // foreground row: the same physics, closer to the camera
          let ff2 = '', fr2 = '', ft2 = '';
          front.forEach((tr2, i) => {
            const p = fallOf(tr2, lt, boom), dirS = tr2.x >= BX ? 1 : -1, a = dirS * 1.5 * p + Math.sin(t * 0.9 + tr2.ph) * 0.02 * (1 - p);
            const pts = place(crownPts(tr2.h, tr2.w * (1 - 0.5 * p)), tr2.x, tr2.y, a);
            ff2 += inkLoop(pts, O(500 + i, { smooth: false, amp: 1.6 })) + ' ';
            fr2 += inkPath(pts, O(500 + i, { w: 6.5, closed: true, smooth: false, amp: 1.6 })) + ' ';
            ft2 += inkPath(place([[0, 6], [0, -tr2.h * (p > 0.05 ? 0.96 : 0.24)]], tr2.x, tr2.y, a), O(520 + i, { w: 16 })) + ' ';
          });
          frontF.setAttribute('d', ff2); frontR.setAttribute('d', fr2); frontTk.setAttribute('d', ft2);
          // altitude marker
          if (P.alt) {
            const aAt = atOr(cues, P.alt.at || 'alt', boom + 0.4), pa = lt >= aAt ? prog(lt, aAt, 0.6) : 0;
            const y0 = BY + 170, y1 = G - 10, yy = lerp(y0, y1, pa);
            let d = '';
            for (let k = 0; k < 40; k++) {
              const a = y0 + k * 34, b = Math.min(a + 20, yy);
              if (a >= yy) break;
              d += inkPath([[BX, a], [BX, b]], O(200 + k, { w: 6, amp: 1 })) + ' ';
            }
            if (pa > 0.05) d += inkPath([[BX - 22, y0 + 26], [BX, y0], [BX + 22, y0 + 26]], O(250, { w: 6 })) + ' ';
            if (pa > 0.95) d += inkPath([[BX - 22, y1 - 26], [BX, y1], [BX + 22, y1 - 26]], O(251, { w: 6 })) + ' ';
            altR.setAttribute('d', d);
            const ts = lt >= aAt ? spring(lt, aAt + 0.3, 0.6) : 0, b = boil(sd + 260, t, 1.3);
            altG.setAttribute('opacity', clamp01(ts * 2));
            const lx = BX + (BX < W * 0.6 ? 1 : -1) * (portrait ? 210 : 230);
            altG.setAttribute('transform', `translate(${f1(lx + b[0])} ${f1((y0 + y1) / 2 + b[1])}) rotate(-4) scale(${lerp(0.5, 1, ts).toFixed(3)})`);
          }
          if (P.crater) {
            const cAt = atOr(cues, P.crater.at || 'crater', boom + 1), cs = lt >= cAt ? spring(lt, cAt, 0.6) : 0, b = boil(sd + 270, t, 1.3);
            crG.setAttribute('opacity', clamp01(cs * 2));
            const cx = P.crater.x != null ? P.crater.x * W : BX, cy = G + (P.crater.dy ?? 62);
            crG.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(cy + b[1])}) rotate(-2) scale(${lerp(0.5, 1, cs).toFixed(3)})`);
            const tw = crT.getComputedTextLength ? crT.getComputedTextLength() : 260, pu = lt >= cAt ? prog(lt, cAt + 0.3, 0.3) : 0;
            crU.setAttribute('d', pu > 0.01 ? inkPath([[-tw / 2 - 10, 18], [-tw / 2 - 10 + (tw + 20) * pu, 12]], O(280, { w: 7 })) : '');
          }
          castUpdate(cast, lt, t, cues, W, H, G);
          labelsUpdate(labels, lt, t, cues, W, H, sd);
        },
      };
    },
  };

  // ================================================================ tunguska_top (bird's-eye fan)
  SH.tunguska_top = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 29, r = rng(seed * 13 + 3);
      const CX = (P.center ? P.center[0] : 0.44) * W, CY = (P.center ? P.center[1] : 0.43) * H;
      const RX = (P.rx ?? 0.42) * W, RY = (P.ry ?? (portrait ? 0.2 : 0.36)) * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const areaF = mk(world, INK.paperDark, { 'fill-opacity': 0.45 }), areaR = mk(world, INK.inkSoft);
      const riverF = mk(world, INK.paperLight), riverR = mk(world, INK.inkSoft);
      const ringR = mk(world, INK.red, { 'fill-opacity': 0 });
      const crownF = mk(world, INK.inkSoft, { 'fill-opacity': 0.75 }), trunkR = mk(world), tipF = mk(world, INK.inkSoft);
      const starF = mk(world, INK.gold), starR = mk(world, INK.red);
      const castG = el(root, 'g'), uiG = el(root, 'g');
      const cast = castOf(P, castG, seed, portrait ? 0.62 : 0.5);
      const labels = labelsOf(P.label ? [Object.assign({ x: 0.5, y: portrait ? 0.2 : 0.14, size: portrait ? 84 : 70, color: 'red' }, P.label)] : [], uiG, W, H);
      const shape = a => 1 + 0.2 * Math.cos(2 * (a - 0.35)) - 0.08 * Math.cos(a + 0.4);   // butterfly-ish outline
      const N = P.n ?? 240, core = (P.core ?? 0.1);
      const trees = [];
      for (let i = 0; i < N * 3 && trees.length < N; i++) {
        const a = r() * Math.PI * 2, u = Math.sqrt(r()) * 0.98;
        if (u < 0.05) continue;
        const k = shape(a), x = CX + Math.cos(a) * RX * k * u, y = CY + Math.sin(a) * RY * k * u;
        trees.push({ x, y, u, a: Math.atan2(y - CY, (x - CX) * RY / RX), len: (portrait ? 30 : 24) + r() * 16, k: i });
      }
      const outline = Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2, k = shape(a) * 1.04; return [CX + Math.cos(a) * RX * k, CY + Math.sin(a) * RY * k]; });
      const river = [[-60, CY + RY * 0.95], [W * 0.18, CY + RY * 0.7], [W * 0.32, CY + RY * 1.05], [W * 0.55, CY + RY * 0.82], [W * 0.75, CY + RY * 1.12], [W + 60, CY + RY * 0.9]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const fAt = P.aftermath ? -30 : atOr(cues, 'fall', dur * 0.25), pk = punch(lt, atOr(cues, 'hit', P.aftermath ? null : fAt), 0.6);
          const Cm = P.cam || {}, z = lerp(Cm.from ?? Cm.zoom ?? 1.07, Cm.to ?? 1, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * pk);
          world.setAttribute('transform', `translate(${f1(CX)} ${f1(CY)}) rotate(${f1(Math.sin(lt * 0.3) * 1.2 - 1)}) scale(${z.toFixed(4)}) translate(${f1(-CX)} ${f1(-CY)})`);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          areaF.setAttribute('d', inkLoop(outline, O(1, { amp: 2 })));
          areaR.setAttribute('d', inkPath(outline, O(1, { w: 3.5, closed: true, amp: 2 })));
          if (P.river !== false) {
            const up = river.map(q => [q[0], q[1] - 18]), dn = river.map(q => [q[0], q[1] + 18]).reverse();
            riverF.setAttribute('d', inkLoop(up.concat(dn), O(2, { amp: 1.5 })));
            riverR.setAttribute('d', inkPath(up, O(3, { w: 4 })) + ' ' + inkPath(dn, O(4, { w: 4 })));
          }
          // shock ring (in "fan space": a circle of radius u = 1 is the outline)
          const since = lt - fAt, R = since > 0 ? since * (P.speed ?? 520) / RX : 0;
          let rr = '';
          for (let k = 0; k < 2; k++) {
            const Rk = R - k * 0.08;
            if (Rk > 0.02 && Rk < 1.35) rr += inkCircle(CX, CY, RX * Rk * 1.1, sd + 10 + k, t, { w: 8 - k * 3, ry: RY * Rk * 1.1 }) + ' ';
          }
          ringR.setAttribute('d', rr);
          ringR.setAttribute('fill-opacity', since > 0 ? f1(clamp01(1.5 - R) * 100) / 100 : 0);
          // trees: standing crowns -> fallen strokes pointing away from the centre
          let cf = '', tk = '', tf = '';
          trees.forEach(tr => {
            const reach = tr.u * shape(tr.a), p = since > 0 && tr.u > core ? sm((R - reach) / 0.12) : 0;
            const b = boil(sd + 100 + tr.k, t, 1.1);
            const x = tr.x + b[0], y = tr.y + b[1];
            if (p < 0.5) {
              const s = 1 - p * 1.2, rad = (portrait ? 11 : 9) * s;
              if (tr.u <= core && since > 0.3) { tk += inkPath([[x - 9, y - 9], [x + 9, y + 9]], O(300 + tr.k, { w: 3.5, amp: 0.6 })) + ' ' + inkPath([[x + 9, y - 9], [x - 9, y + 9]], O(700 + tr.k, { w: 3.5, amp: 0.6 })) + ' '; }
              else cf += inkDot(x, y, rad, rad, sd + 200 + tr.k, t) + ' ';
            }
            if (p > 0) {
              const dx = Math.cos(tr.a) * RX / Math.max(RX, RY), dy = Math.sin(tr.a) * RY / Math.max(RX, RY), dl = Math.hypot(dx, dy) || 1;
              const L = tr.len * sm(p);
              const ex = x + dx / dl * L, ey = y + dy / dl * L;
              tk += inkPath([[x, y], [ex, ey]], O(300 + tr.k, { w: 4.5, amp: 0.6 })) + ' ';
              tf += inkDot(ex, ey, 7, 5, sd + 900 + tr.k, t) + ' ';
            }
          });
          crownF.setAttribute('d', cf); trunkR.setAttribute('d', tk); tipF.setAttribute('d', tf);
          // centre star (the burst point)
          const ss = lt >= fAt - 0.1 ? spring(lt, fAt - 0.1, 0.5) : 0;
          if (ss > 0.01) {
            const pts = []; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + t * 0.4, rad = (k % 2 ? 16 : 40) * ss * (1 + 0.1 * Math.sin(t * 9)); pts.push([CX + Math.cos(a) * rad, CY + Math.sin(a) * rad]); }
            starF.setAttribute('d', inkLoop(pts, O(20, { smooth: false, amp: 1 })));
            starR.setAttribute('d', inkPath(pts, O(20, { w: 4, closed: true, smooth: false, amp: 1 })));
          } else { starF.setAttribute('d', ''); starR.setAttribute('d', ''); }
          castUpdate(cast, lt, t, cues, W, H, H * (portrait ? 0.6 : 0.85));
          labelsUpdate(labels, lt, t, cues, W, H, sd);
        },
      };
    },
  };

  // ================================================================ tunguska_porch (the trading post)
  SH.tunguska_porch = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 41, G = (P.ground ?? (portrait ? 0.56 : 0.8)) * H, r = rng(seed * 7 + 2);
      const root = el(svg, 'g'), world = el(root, 'g');
      const glowF = mk(world, INK.paperLight, { 'fill-opacity': 0 }), glowR = mk(world, INK.gold), sunF = mk(world, INK.gold), sunR = mk(world, INK.red);
      const hillF = mk(world, INK.paperDark, { 'fill-opacity': 0.6 }), hillR = mk(world, INK.inkSoft), farTr = mk(world, INK.inkSoft);
      const groundF = mk(world, INK.paperDark, { 'fill-opacity': 0.55 }), groundR = mk(world);
      const houseF = mk(world, INK.paperLight), logR = mk(world, INK.inkSoft), houseR = mk(world), roofF = mk(world, INK.paperDark), winF = mk(world, INK.gold, { 'fill-opacity': 0.6 });
      const signF = mk(world, INK.paperLight), signR = mk(world), signG = el(world, 'g');
      const signT = el(signG, 'text', { 'font-family': INK_FONT, 'font-size': portrait ? 50 : 44, 'text-anchor': 'middle', fill: INK.ink }); signT.textContent = P.sign || '';
      const porchF = mk(world, INK.paperDark), porchR = mk(world);
      const heatR = mk(world, INK.red, { 'fill-opacity': 0 });
      const manG = el(world, 'g'), manRig = el(manG, 'g'), flameF = mk(manG, INK.gold), flameR = mk(manG, INK.red);
      const castG = el(world, 'g'), uiG = el(root, 'g');
      const M = P.man || {}, msc = (M.scale ?? 1) * (portrait ? 0.7 : 0.56);
      const man = KASIF.create(manRig, { scale: msc, hat: false, accessory: M.accessory || null, beard: M.beard || 'short', seed: seed + 3 });
      const cast = castOf(P, castG, seed, portrait ? 0.74 : 0.6);
      const labels = labelsOf(P.labels, uiG, W, H);
      const HX = (P.house_x ?? 0.26) * W, HW = portrait ? 420 : 460, HH = portrait ? 330 : 300, PY = G - 46;
      const MX = (M.x ?? 0.5) * W, GX = (P.glow_x ?? 1.02) * W, GY = G - 150;
      const farT = Array.from({ length: 9 }, (_, i) => ({ x: W * (0.48 + i * 0.07) + r() * 20, h: 70 + r() * 50 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const fAt = atOr(cues, 'flash', 0.25), thAt = atOr(cues, 'thrown', dur * 0.4), hAt = atOr(cues, 'heat', dur * 0.7);
          const fl = lt - fAt, pk = punch(lt, thAt, 0.6);
          const shake = lt > thAt ? Math.sin(lt * 45) * 12 * Math.exp(-(lt - thAt) * 4) : 0;
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * pk), fx = MX, fy = G - 200;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 6 + shake)} ${f1(Math.cos(lt * 0.27) * 4)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // horizon glow
          if (fl > 0) {
            const g = sm(fl / 0.5), gr = lerp(80, portrait ? 360 : 420, g) * (1 + 0.04 * Math.sin(t * 7));
            glowF.setAttribute('d', inkCircle(GX, GY, gr, sd + 1, t, { fill: true }));
            glowF.setAttribute('fill-opacity', f1(lerp(0.95, 0.6, clamp01(fl / 3)) * 100) / 100);
            let rays = '';
            for (let k = 0; k < 11; k++) {
              const a = Math.PI + (k / 10 - 0.5) * Math.PI * 0.95 - 0.1, l0 = 150 * g, l1 = (330 + 90 * Math.sin(t * 6 + k * 2.1)) * g;
              rays += inkPath([[GX + Math.cos(a) * l0, GY + Math.sin(a) * l0], [GX + Math.cos(a) * l1, GY + Math.sin(a) * l1]], O(10 + k, { w: 8 })) + ' ';
            }
            glowR.setAttribute('d', rays);
            sunF.setAttribute('d', inkCircle(GX, GY, 120 * g, sd + 2, t, { fill: true }));
            sunR.setAttribute('d', inkCircle(GX, GY, 120 * g, sd + 2, t, { w: 6 }));
          } else { glowF.setAttribute('d', ''); glowR.setAttribute('d', ''); sunF.setAttribute('d', ''); sunR.setAttribute('d', ''); }
          // hills, far trees (they lean when the heat arrives)
          const hill = [[-80, G - 90], [W * 0.3, G - 130], [W * 0.6, G - 110], [W + 80, G - 150]];
          hillF.setAttribute('d', inkLoop(hill.concat([[W + 80, G], [-80, G]]), O(30, { amp: 2 })));
          hillR.setAttribute('d', inkPath(hill, O(31, { w: 4 })));
          const lean = lt > thAt ? -0.5 * sm((lt - thAt) / 0.4) : Math.sin(t * 1.2) * 0.02;
          farTr.setAttribute('d', farT.map((f, i) => { const y = G - 110 - (f.x / W) * 30; return inkPath(place(crownPts(f.h, f.h * 0.22), f.x, y, lean), O(40 + i, { w: 3, closed: true, smooth: false, amp: 1 })); }).join(' '));
          // ground
          groundF.setAttribute('d', inkLoop([[-80, G], [W + 80, G - 4], [W + 80, G + 80], [-80, G + 80]], O(50, { smooth: false })));
          groundR.setAttribute('d', inkPath([[-80, G + 2], [W * 0.5, G - 4], [W + 80, G + 1]], O(51, { w: 6 })));
          // log house + roof + window
          const x0 = HX - HW / 2, x1 = HX + HW / 2, yT = PY - HH;
          const body = [[x0, PY], [x0, yT], [x1, yT], [x1, PY]];
          houseF.setAttribute('d', inkLoop(body, O(60, { smooth: false })));
          let logs = '';
          for (let k = 1; k < 7; k++) { const y = yT + k * HH / 7; logs += inkPath([[x0 - 12, y], [x1 + 12, y + 2]], O(61 + k, { w: 3.5 })) + ' '; }
          logR.setAttribute('d', logs);
          const roof = [[x0 - 50, yT + 6], [HX, yT - HH * 0.55], [x1 + 50, yT + 6]];
          const rattle = lt > thAt ? Math.sin(lt * 60) * 6 * Math.exp(-(lt - thAt) * 3) : 0;
          roofF.setAttribute('d', inkLoop(roof.map((q, i) => i === 1 ? [q[0] + rattle, q[1]] : q), O(70, { smooth: false })));
          const wx = HX - HW * 0.28, wy = yT + HH * 0.3, ww = HW * 0.22, wh = HH * 0.3;
          winF.setAttribute('d', inkLoop([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], O(80, { smooth: false, amp: 1 })));
          winF.setAttribute('fill-opacity', fl > 0 ? f1(clamp01(0.4 + 0.5 * Math.sin(t * 11)) * 100) / 100 : 0.15);
          houseR.setAttribute('d', inkPath(body, O(60, { w: 6, closed: true, smooth: false })) + ' ' + inkPath(roof.map((q, i) => i === 1 ? [q[0] + rattle, q[1]] : q), O(70, { w: 6, closed: true, smooth: false })) + ' ' +
            inkPath([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], O(80, { w: 5, closed: true, smooth: false, amp: 1 })) + ' ' + inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], O(81, { w: 4 })) +
            ' ' + inkPath([[HX + HW * 0.1, PY], [HX + HW * 0.1, PY - HH * 0.62], [HX + HW * 0.32, PY - HH * 0.62], [HX + HW * 0.32, PY]], O(82, { w: 5, smooth: false })));
          // sign board over the door
          if (P.sign) {
            const sw = Math.max(200, (signT.getComputedTextLength ? signT.getComputedTextLength() : 200) + 40), sx = HX - sw / 2, sy = yT - 30, sh2 = portrait ? 66 : 58, sw2 = Math.sin(t * 2.4) * 1.5 + rattle * 0.5;
            const sp = [[sx, sy], [sx + sw, sy], [sx + sw, sy + sh2], [sx, sy + sh2]];
            signF.setAttribute('d', inkLoop(sp, O(85, { smooth: false, amp: 1 })));
            signR.setAttribute('d', inkPath(sp, O(85, { w: 4, closed: true, smooth: false, amp: 1 })));
            signG.setAttribute('transform', `translate(${f1(HX)} ${f1(sy + sh2 * 0.72)}) rotate(${f1(sw2)})`);
          }
          // porch planks + posts
          const px0 = x0 - 20, px1 = Math.max(x1 + 80, MX + 140);
          porchF.setAttribute('d', inkLoop([[px0, PY], [px1, PY], [px1, PY + 22], [px0, PY + 22]], O(90, { smooth: false, amp: 1 })));
          porchR.setAttribute('d', inkPath([[px0, PY], [px1, PY], [px1, PY + 22], [px0, PY + 22]], O(90, { w: 5, closed: true, smooth: false, amp: 1 })) + ' ' +
            [px1 - 14, x1 + 30].map((x, k) => inkPath([[x, PY + 22], [x, G]], O(91 + k, { w: 6 }))).join(' ') + ' ' + inkPath([[px1 - 14, PY], [px1 - 14, PY - 170]], O(95, { w: 6 })));
          // heat waves rolling in from the glow
          if (fl > 0) {
            let hw = '';
            for (let k = 0; k < 4; k++) {
              const xx = GX - ((fl * 520 + k * 240) % (W * 1.2)), y = GY - 260 + k * 110, pts = [];
              for (let j = 0; j <= 8; j++) pts.push([xx + j * 26, y + Math.sin(j * 1.3 + t * 8 + k) * 14]);
              hw += inkPath(pts, O(100 + k, { w: 5, amp: 1 })) + ' ';
            }
            heatR.setAttribute('d', hw);
            heatR.setAttribute('fill-opacity', f1(clamp01(fl * 2) * 0.8 * 100) / 100);
          } else heatR.setAttribute('d', '');
          // the man: sits, then thrown off the porch backwards (away from the glow), lands on his back
          const th = lt >= thAt ? clamp01((lt - thAt) / 0.7) : 0, e = sm(th);
          const mx = lerp(MX, MX - (M.throw ?? 0.06) * W, e), my = lerp(PY, G + 6, e) - Math.sin(Math.PI * th) * 190;
          const rot = -78 * sm(th * 1.1);
          manG.setAttribute('transform', `translate(${f1(mx)} ${f1(my)}) rotate(${f1(rot)})`);
          const pose = lt < thAt ? 'sit' : 'shock';
          const o = { x: 0, y: 0, face: 1, since: lt < thAt ? lt : lt - thAt, emotion: lt < thAt ? (fl > 0 ? 'surprised' : 'neutral') : 'surprised' };
          if (lt >= thAt && lt - thAt < 0.25) { o.prev = { pose: 'sit', since: thAt }; o.mix = (lt - thAt) / 0.25; }
          man.update(t, pose, o);
          // flames on the shirt
          if (lt >= hAt) {
            const fs = spring(lt, hAt, 0.5);
            let ff = '', fr = '';
            for (let k = 0; k < 3; k++) {
              const bx = (-26 + k * 26) * msc, by = -250 * msc, hh = (60 + 22 * Math.sin(t * 13 + k * 2)) * fs * msc;
              const fp = [[bx - 16 * msc, by], [bx - 10 * msc, by - hh * 0.5], [bx + 2 * msc, by - hh], [bx + 12 * msc, by - hh * 0.45], [bx + 16 * msc, by]];
              ff += inkLoop(fp, O(120 + k, { amp: 1.2 })) + ' ';
              fr += inkPath(fp, O(120 + k, { w: 4, closed: true, amp: 1.2 })) + ' ';
            }
            flameF.setAttribute('d', ff); flameR.setAttribute('d', fr);
          } else { flameF.setAttribute('d', ''); flameR.setAttribute('d', ''); }
          castUpdate(cast, lt, t, cues, W, H, G);
          labelsUpdate(labels, lt, t, cues, W, H, sd);
        },
      };
    },
  };
  // ================================================================ tunguska_rock (a space rock streaking in)
  // SHOTS.tunguska_rock — a big irregular ink rock with a burning edge and a smoke trail flies in across the sky
  //   above a forest silhouette and slows to hang over it; punch on "hit". Cast + labels as above.
  //   P: {from: [1.25, -0.05], to: [0.42, 0.3], size: 1, dur: 1.6, n: 14 (forest trees), labels: [...], cast: [...]}
  //   cues: streak (rock enters), hit (punch), label/cast "at" names
  SH.tunguska_rock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 61, G = (P.ground ?? (portrait ? 0.56 : 0.8)) * H, r = rng(seed * 19 + 4);
      const root = el(svg, 'g'), world = el(root, 'g');
      const cloudF = mk(world, INK.paperLight), cloudR = mk(world, INK.inkSoft);
      const smokeF = mk(world, INK.paperDark, { 'fill-opacity': 0.85 }), smokeR = mk(world, INK.inkSoft);
      const hillF = mk(world, INK.paperDark, { 'fill-opacity': 0.6 }), hillR = mk(world, INK.inkSoft);
      const treeF = mk(world, INK.inkSoft, { 'fill-opacity': 0.45 }), treeR = mk(world), trunkR = mk(world);
      const groundF = mk(world, INK.paperDark, { 'fill-opacity': 0.55 }), groundR = mk(world);
      const flameF = mk(world, INK.red), glowF = mk(world, INK.gold), rockF = mk(world, INK.paperDark), rockR = mk(world), crR = mk(world, INK.inkSoft);
      const castG = el(world, 'g'), uiG = el(root, 'g');
      const cast = castOf(P, castG, seed, portrait ? 0.78 : 0.62);
      const labels = labelsOf(P.labels, uiG, W, H);
      const nT = P.n ?? 14;
      const trees = Array.from({ length: nT }, (_, i) => ({ x: -40 + (W + 80) * (i + 0.5 + (r() - 0.5) * 0.5) / nT, h: (portrait ? 230 : 190) + r() * 110, ph: r() * 6 }));
      const rk = Array.from({ length: 11 }, (_, i) => { const a = i / 11 * Math.PI * 2; return [Math.cos(a) * (0.8 + r() * 0.35), Math.sin(a) * (0.75 + r() * 0.35)]; });
      const craters = [[-0.3, -0.2, 0.18], [0.25, 0.15, 0.14], [0.05, -0.42, 0.1], [-0.15, 0.35, 0.1]];
      const clouds = [[0.18, 0.2], [0.62, 0.15], [0.86, 0.3]].map(([x, y]) => ({ x: x * W, y: y * H }));
      const F = P.from || [1.25, -0.05], T = P.to || [0.42, 0.3];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const st = atOr(cues, 'streak', 0.1), hit = atOr(cues, 'hit', dur * 0.7), pk = punch(lt, hit, 0.7);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * pk);
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 7)} ${f1(Math.cos(lt * 0.27) * 4)}) translate(${W / 2} ${f1(H * 0.4)}) scale(${z.toFixed(4)}) translate(${-W / 2} ${f1(-H * 0.4)})`);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          let cf = '', cr = '';
          clouds.forEach((c, i) => {
            const x = c.x + lt * 10, y = c.y, R = 36;
            const b = [[x - 3 * R, y], [x - 2.2 * R, y - 1 * R], [x - 0.8 * R, y - 1.7 * R], [x + 0.8 * R, y - 1.4 * R], [x + 2.4 * R, y - 0.8 * R], [x + 3 * R, y]];
            cf += inkLoop(b.concat([[x, y + 6]]), O(10 + i, { amp: 1.2 })) + ' '; cr += inkPath(b, O(10 + i, { w: 3.5, amp: 1.2 })) + ' ';
          });
          cloudF.setAttribute('d', cf); cloudR.setAttribute('d', cr);
          // rock path: fast entry, then a slow glide
          const u = lt < st ? 0 : Math.min(1, (lt - st) / (P.dur ?? 1.6)), e = 1 - Math.pow(1 - u, 2.2), glide = Math.max(0, lt - st - (P.dur ?? 1.6)) * 0.02;
          const rx = lerp(F[0], T[0], e) * W - glide * W, ry = lerp(F[1], T[1], e) * H + glide * H * 0.6;
          const RS = (P.size ?? 1) * (portrait ? 120 : 100) * (1 + 0.15 * pk), vis = lt >= st;
          let sf = '', sr = '';
          if (vis) {
            const dx = F[0] * W - rx, dy = F[1] * H - ry, L = Math.hypot(dx, dy), n = Math.min(14, Math.floor(L / 70));
            for (let i = 1; i <= n; i++) {
              const k = i / Math.max(1, n), px = rx + dx * k * 0.95, py = ry + dy * k * 0.95, rad = (30 + 40 * k) * (RS / 120), off = boil(sd + 40 + i, t, 2);
              sf += inkCircle(px + off[0], py + off[1], rad, sd + 50 + i, t, { fill: true }) + ' ';
              sr += inkCircle(px + off[0], py + off[1], rad, sd + 50 + i, t, { w: 3 }) + ' ';
            }
            const ang = Math.atan2(dy, dx);
            let fl = '';
            for (let k = -2; k <= 2; k++) {
              const a = ang + k * 0.22, l = RS * (1.6 + 0.4 * Math.sin(t * 14 + k)) * (1 - Math.abs(k) * 0.15);
              fl += inkLoop([[rx + Math.cos(a + 1.2) * RS * 0.5, ry + Math.sin(a + 1.2) * RS * 0.5], [rx + Math.cos(a) * l, ry + Math.sin(a) * l], [rx + Math.cos(a - 1.2) * RS * 0.5, ry + Math.sin(a - 1.2) * RS * 0.5]], O(70 + k, { amp: 2 })) + ' ';
            }
            flameF.setAttribute('d', fl);
            glowF.setAttribute('d', inkCircle(rx, ry, RS * 1.18, sd + 80, t, { fill: true }));
            const spin = lt * 0.8, pts = rk.map(q => { const q2 = rotP(q, spin); return [rx + q2[0] * RS, ry + q2[1] * RS]; });
            rockF.setAttribute('d', inkLoop(pts, O(81, { smooth: false, amp: 2 })));
            rockR.setAttribute('d', inkPath(pts, O(81, { w: 8, closed: true, smooth: false, amp: 2 })));
            crR.setAttribute('d', craters.map((c, i) => { const q = rotP([c[0], c[1]], spin); return inkCircle(rx + q[0] * RS, ry + q[1] * RS, c[2] * RS, sd + 90 + i, t, { w: 4 }); }).join(' '));
          } else { flameF.setAttribute('d', ''); glowF.setAttribute('d', ''); rockF.setAttribute('d', ''); rockR.setAttribute('d', ''); crR.setAttribute('d', ''); }
          smokeF.setAttribute('d', sf); smokeR.setAttribute('d', sr);
          const hill = [[-80, G - 110], [W * 0.3, G - 170], [W * 0.62, G - 130], [W + 80, G - 180]];
          hillF.setAttribute('d', inkLoop(hill.concat([[W + 80, G], [-80, G]]), O(30, { amp: 2 })));
          hillR.setAttribute('d', inkPath(hill, O(31, { w: 4 })));
          let tf = '', tr = '', tk = '';
          trees.forEach((tr2, i) => {
            const a = Math.sin(t * 1.2 + tr2.ph) * 0.03, pts = place(crownPts(tr2.h, tr2.h * 0.22), tr2.x, G + 10, a);
            tf += inkLoop(pts, O(100 + i, { smooth: false, amp: 1.2 })) + ' ';
            tr += inkPath(pts, O(100 + i, { w: 4, closed: true, smooth: false, amp: 1.2 })) + ' ';
            tk += inkPath(place([[0, 4], [0, -tr2.h * 0.24]], tr2.x, G + 10, a), O(130 + i, { w: 9 })) + ' ';
          });
          treeF.setAttribute('d', tf); treeR.setAttribute('d', tr); trunkR.setAttribute('d', tk);
          groundF.setAttribute('d', inkLoop([[-80, G], [W + 80, G - 4], [W + 80, G + 80], [-80, G + 80]], O(140, { smooth: false })));
          groundR.setAttribute('d', inkPath([[-80, G + 2], [W * 0.5, G - 4], [W + 80, G + 1]], O(141, { w: 6 })));
          castUpdate(cast, lt, t, cues, W, H, G);
          labelsUpdate(labels, lt, t, cues, W, H, sd);
        },
      };
    },
  };
})();
