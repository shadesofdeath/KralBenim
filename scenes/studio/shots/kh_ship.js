// kh_ship: shots for the Stickstory Short "Khufu ship" (2026-11-16). Around 2500 BC a 43 m cedar ship was taken apart
// and sealed in a pit beside the Great Pyramid of Giza; Kamal el-Mallakh found it in 1954 under huge limestone blocks,
// in 1,224 pieces. It has no nails: the planks are sewn together with rope that runs through hidden channels on the
// inside faces. Ahmed Youssef Moustafa spent over ten years putting it back together; its twin from the second pit is
// being rebuilt in public at the Grand Egyptian Museum. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens
// only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Uses bb__lib.js (BBL.labels) and lh__lib.js (LH.kasif) read-only; dekor ("set") paints the sky and the ground.
//
// Common P: labels: [{text, x, y (0..1), at, size, color, font, rot, arrow, stamp}] (BBL.labels),
//   kasif: {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | absent
//
// SHOTS.kh_ship — the Khufu ship in side view (papyrus-bundle prow on the left, stern post curling in on the right,
//   deckhouse, forward canopy, oars, steering oar), standing on props.
//   P: {mode: "desert" (on sand, Great Pyramid behind) | "shed" (half-rebuilt in a restoration shed, the restorer
//   carries a plank, numbered planks on the floor, a wall tally of years) | "hall" (finished, in a museum hall behind a
//   rail, visitors' heads in front), gy: 0.6 (ground), ship: {x: 0.5, L: 980, ex: 1.35 (height exaggeration)},
//   build: 1 | [from, to] (shed: share of the hull planked, grows over the scene), pyramid: {x: 0.62, w: 1240, h: 700},
//   nail: {at, x, y, s, cross: cue} (a big iron nail that gets a red X), glow: cue (the rope stitches light up gold),
//   tally: {at, n: 10} (shed: tally marks appear one by one), labels, kasif}
// SHOTS.kh_pit — 1954 at the foot of the Great Pyramid: a row of huge limestone blocks seals a trench; one block rises
//   on ropes from a wooden derrick while two workers haul; under it the dark pit with cedar ends in a shaft of light.
//   P: {gy: 0.6, lift: cue|sec (block starts rising), labels}
// SHOTS.kh_pieces — the pit in cross-section: cover blocks at ground level (one open, a shaft of light), limestone
//   walls, and inside the timbers stacked in layers (planks, beams, oars, rope coils) that appear one by one while a
//   counter runs to P.count. P: {gy: 0.29, count: 1224, at: cue (counter starts), done: cue (counter reaches count),
//   counter: {x: 0.68, y: 0.15, size: 150}, labels}
// SHOTS.kh_lash — the inside face of three cedar planks (frames across them) and the rope that sews them: on each seam
//   pairs of holes; the rope dives into a hole, runs hidden inside the wood (V-channel, shown as an X-ray dash on cue
//   "hidden") and comes out across the seam. P: {sew: cue (rope starts running), span: 2.2 (s), done: 0 (share of
//   stitching already done at the start), holes: cue (holes ring gold), hidden: cue, q: cue (a big "?" before "sew"),
//   labels}
// SHOTS.kh_twin — the second boat being rebuilt in a museum hall: a steel cradle with ribs, the first floor planks
//   in place, a new plank lowered on straps between two conservators; visitors watch over a glass rail in front.
//   P: {gy: 0.6, n: 7 (planks in place), lower: cue|sec (new plank lands), labels}
// cues: glow, cross, lift, at, done, sew, holes, hidden, lower + label/kasif "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const fr = v => v - Math.floor(v);
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  // colours (tokens only)
  const CEDAR = () => mix(INK.gold, INK.stain, 0.5);
  const CEDAR_L = () => mix(INK.gold, INK.paperLight, 0.5);
  const CEDAR_D = () => mix(INK.stain, INK.ink, 0.4);
  const STONE = () => mix(INK.paperLight, INK.paperDark, 0.4);
  const STONE_D = () => mix(INK.paperDark, INK.stain, 0.55);
  const SAND = () => mix(INK.gold, INK.paperLight, 0.58);
  const SAND_D = () => mix(INK.gold, INK.stain, 0.55);
  const ROPE = () => mix(INK.gold, INK.paperLight, 0.3);
  const ROPE_D = () => mix(INK.stain, INK.ink, 0.25);
  const STEEL = () => mix(INK.inkSoft, INK.paperLight, 0.45);
  const DARK = () => mix(INK.ink, INK.stain, 0.2);
  const SKIN = () => mix(INK.inkSoft, INK.ink, 0.35);

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

  // ------------------------------------------------------------------ a hatless period figure (KASIF rig) -> world head/hands
  function person(parent, sd, o = {}) {
    const rig = KASIF.create(el(parent, 'g'), { scale: 1, hat: false, accessory: o.accessory || null, beard: o.beard || null, seed: sd });
    return {
      update(t, x, y, S, pose, oo = {}) {
        const face = oo.face ?? 1;
        const res = rig.update(t, pose, Object.assign({ x, y, face, scale: S, since: oo.since ?? 1, dir: oo.dir ?? 0, emotion: oo.emotion || null, mouth: 0 }, oo.extra || {})) || {};
        const W2 = q => [x + face * S * q[0], y + S * q[1]];
        return { head: res.head ? W2(res.head) : [x, y - 400 * S], hands: (res.hands || []).map(W2) };
      },
    };
  }

  // ------------------------------------------------------------------ the Khufu ship, side view, prow to the left
  // o: {build: 0..1 (share planked from the prow), glow: 0..1, props: "wood"|"steel"|false, gy (ground for props), sway}
  function ship(pn, cx, by, L, ex, t, o = {}) {
    const build = o.build ?? 1, glow = o.glow ?? 0, front = o.front ?? 9;
    const X = u => cx + u * L;
    const sheer = u => by - L * ex * (0.1 + 0.068 * Math.pow(Math.abs(2 * u), 3));
    const bot = u => by - L * ex * 0.165 * Math.pow(Math.abs(2 * u), 2.6);
    const N = 30, us = Array.from({ length: N + 1 }, (_, i) => -0.5 + i / N);
    // props under the hull
    if (o.props) {
      [-0.32, -0.12, 0.08, 0.28].forEach((u, i) => {
        const x = X(u), yb = bot(u) + 4, g = o.gy ?? by + 60;
        if (o.props === 'steel') {
          pn.shape([[x - 16, yb], [x + 16, yb], [x + 20, g], [x - 20, g]], STEEL(), { w: 4, smooth: false });
          pn.shape(rect(x - 54, g - 12, x + 54, g + 4), STEEL(), { w: 4, smooth: false });
        } else {
          pn.shape([[x - 70, yb - 6], [x + 70, yb - 6], [x + 52, yb + 26], [x - 52, yb + 26]], CEDAR_D(), { w: 4, smooth: false });
          pn.shape([[x - 22, yb + 22], [x + 22, yb + 22], [x + 34, g], [x - 34, g]], CEDAR(), { w: 4, smooth: false });
        }
      });
    }
    // oars (near side) + steering oar, swaying slowly
    const oarU = [-0.36, -0.25, -0.14, -0.03, 0.08];
    const oars = () => oarU.slice(0, typeof o.oars === 'number' ? o.oars : 5).forEach((u, i) => {
      if (u > -0.5 + build + 0.02) return;
      const a = Math.sin(t * 0.7 + i * 0.9) * 0.025 + (o.sway ?? 0);
      const p0 = [X(u), sheer(u) + 6], len = L * 0.2;
      const d = [-Math.sin(0.62 + a), Math.cos(0.62 + a)];
      const p1 = [p0[0] + d[0] * len, p0[1] + d[1] * len * 0.9];
      pn.line([[p0[0] + 20, p0[1] - 18], p1], 9, CEDAR_D());
      pn.shape(inkEllipsePts(p1[0] - d[0] * 30, p1[1] - d[1] * 30, 15, 44, 300 + i, 9, -0.62 - a, 0.05), CEDAR(), { w: 4, smooth: true });
    });
    // ghost outline of the unbuilt hull (shed)
    const hullPts = us.map(u => [X(u), sheer(u)]).concat(us.slice().reverse().map(u => [X(u), bot(u)]));
    if (build < 1) pn.line(hullPts, 3, INK.inkSoft, { closed: true, op: 0.55 });
    // keel plank + frames (ribs) where not yet planked
    if (build < 1) {
      pn.line(us.map(u => [X(u), bot(u) - 6]), 14, CEDAR_D());
      for (let u = -0.46; u <= 0.46; u += 0.046) {
        if (u < -0.5 + build) continue;
        pn.line([[X(u), bot(u) - 4], [X(u) - 4, (bot(u) + sheer(u)) / 2], [X(u) + 2, sheer(u) - 4]], 11, CEDAR(), { amp: 0.6 });
        pn.line([[X(u) - 7, bot(u) - 4], [X(u) - 7, sheer(u) - 4]], 3, INK.ink, { amp: 0.6 });
      }
    }
    // planked hull
    const ub = Math.min(0.5, -0.5 + build), usB = us.filter(u => u <= ub + 1e-6);
    if (usB.length > 1) {
      if (usB[usB.length - 1] < ub) usB.push(ub);
      const pts = usB.map(u => [X(u), sheer(u)]).concat(usB.slice().reverse().map(u => [X(u), bot(u)]));
      pn.shape(pts, CEDAR(), { w: 6, smooth: true });
      for (let k = 1; k <= 3; k++) {   // plank seams + rope stitches along them
        const q = k / 4, seam = usB.map(u => [X(u), lerp(sheer(u), bot(u), q)]);
        pn.line(seam, 3, CEDAR_D(), { amp: 0.6 });
        for (let u = -0.46 + (k % 2) * 0.017; u < ub - 0.01; u += 0.034) {
          const y = lerp(sheer(u), bot(u), q), x = X(u);
          const band = clamp01(1 - Math.abs(u - (-0.62 + fr(t * 0.55) * 1.24)) * 9), sh = Math.max(0.5 + 0.5 * Math.sin(t * 6 - u * 26 + k), band), gl = glow * clamp01((front - u) * 6) * (0.7 + 0.3 * sh), sc = mix(INK.ink, INK.gold, gl), sw = 3 + 4 * gl + 3 * gl * sh + 4 * clamp01(1 - Math.abs(front - u) * 8) + 4 * band * glow;
          const z = o.stitch ?? 1;
          pn.line([[x - 8 * z, y - 9 * z], [x, y + z], [x + 8 * z, y - 9 * z]], sw * z, sc, { amp: 0.4, smooth: false });
          if (gl > 0.05) pn.dot(x, y - 3, 9 * gl, 7 * gl, INK.gold, 0.45 * gl);
        }
      }
      pn.line(usB.map(u => [X(u), sheer(u) + 4]), 9, CEDAR_D());   // gunwale
      pn.line(usB.map(u => [X(u), sheer(u) - 2]), 3, INK.ink);
    }
    if (build >= 0.999) {
      // prow (papyrus bundle) and stern post
      const post = (pts, w) => { pn.line(pts, w + 10, INK.ink, { taper: 0.4 }); pn.line(pts, w, CEDAR(), { taper: 0.4 }); };
      const P = q => [X(q[0]), by - L * ex * q[1]];
      const prow = [[-0.49, 0.162], [-0.525, 0.22], [-0.548, 0.29], [-0.55, 0.335]].map(P);
      const stern = [[0.49, 0.162], [0.525, 0.24], [0.54, 0.31], [0.525, 0.365], [0.495, 0.38]].map(P);
      post(prow, 22); post(stern, 22);
      const umb = (p, dir) => {   // flared papyrus umbel
        const a = p[0], b = p[1];
        pn.shape([[a - 6, b + 4], [a - 26, b - 34], [a + 2 * dir, b - 42], [a + 26, b - 32], [a + 6, b + 4]], CEDAR_L(), { w: 4, smooth: false });
        for (let i = 0; i < 4; i++) pn.line([[a, b], [lerp(a - 22, a + 22, i / 3), b - 34]], 2.5, CEDAR_D());
      };
      umb(prow[prow.length - 1], -1); umb(stern[stern.length - 1], -1);
      for (let i = 0; i < 4; i++) {   // bands lashed round the posts
        const a = prow[1 + (i % 3)], b = stern[1 + (i % 3)];
        if (i < 3) { pn.line([[a[0] - 16, a[1] + 8], [a[0] + 16, a[1] - 6]], 5, mix(INK.ink, INK.gold, glow)); pn.line([[b[0] - 16, b[1] - 6], [b[0] + 16, b[1] + 8]], 5, mix(INK.ink, INK.gold, glow)); }
      }
      // forward canopy (poles + roof) and the deckhouse
      const cu0 = -0.34, cu1 = -0.2, ch = L * ex * 0.07;
      [cu0, -0.293, -0.247, cu1].forEach(u => pn.line([[X(u), sheer(u)], [X(u), sheer(u) - ch]], 5, CEDAR_D()));
      pn.shape([[X(cu0) - 12, sheer(cu0) - ch - 4], [X(cu1) + 12, sheer(cu1) - ch - 4], [X(cu1) + 12, sheer(cu1) - ch + 10], [X(cu0) - 12, sheer(cu0) - ch + 10]], CEDAR_L(), { w: 4, smooth: false });
      const d0 = -0.04, d1 = 0.27, dh = L * ex * 0.085, top = Math.min(sheer(d0), sheer(d1)) - dh;
      pn.shape([[X(d0), sheer(d0)], [X(d0), top + 10], [X(d1), top + 10], [X(d1), sheer(d1)]], CEDAR_L(), { w: 5, smooth: false });
      for (let i = 1; i < 9; i++) { const u = lerp(d0, d1, i / 9); pn.line([[X(u), top + 14], [X(u), sheer(u) - 2]], 3, CEDAR_D()); }
      pn.shape([[X(d0) - 22, top + 12], [X(d0) - 6, top - 6], [X(d1) + 6, top - 6], [X(d1) + 22, top + 12]], CEDAR(), { w: 5, smooth: false });
      // small anteroom on the deckhouse front + door
      pn.shape(rect(X(d0) - 2, top + 30, X(d0) + 46, sheer(d0)), CEDAR(), { w: 4, smooth: false });
      // steering oar at the stern
      if (o.oars !== false) {
      const sa = Math.sin(t * 0.6) * 0.02;
      const s0 = [X(0.4), sheer(0.4) - L * ex * 0.04], s1 = [X(0.47) + 40 + sa * 300, by + L * 0.06];
      pn.line([s0, s1], 10, CEDAR_D());
      pn.line([[X(0.4), sheer(0.4) + 2], [X(0.4) - 8, sheer(0.4) - L * ex * 0.05]], 7, CEDAR_D());
      pn.shape(inkEllipsePts(s1[0] - 12, s1[1] - 26, 18, 54, 377, 9, -0.35, 0.05), CEDAR(), { w: 4, smooth: true });
      }
    }
    if (o.oars !== false) oars();
    return { sheer, bot, X };
  }

  function pyramid(pn, cx, base, w, h, o = {}) {
    const apex = [cx, base - h], L = [cx - w / 2, base], R = [cx + w / 2, base];
    const mid = [cx + w * 0.08, base];
    pn.fill([apex, L, mid], mix(STONE(), INK.gold, 0.18), {});
    pn.fill([apex, mid, R], STONE_D(), {});
    const rows = o.rows ?? 26;
    for (let i = 1; i < rows; i++) {
      const q = i / rows, y = lerp(apex[1], base, q), xl = lerp(apex[0], L[0], q), xm = lerp(apex[0], mid[0], q), xr = lerp(apex[0], R[0], q);
      pn.line([[xl, y], [xm, y]], 2, INK.inkSoft, { op: 0.55, amp: 0.5 });
      pn.line([[xm, y], [xr, y]], 2, INK.ink, { op: 0.35, amp: 0.5 });
    }
    pn.line([L, apex, R], 5, INK.ink, { smooth: false });
    pn.line([apex, mid], 3, INK.inkSoft, { smooth: false });
  }
  // near sand dune + stones (foreground down to the frame bottom)
  function dune(pn, W, H, top, t, sd, o = {}) {
    const pts = [[-20, H + 20]];
    for (let x = -20; x <= W + 20; x += 60) pts.push([x, top + 26 * Math.sin(x * 0.006 + sd) + 14 * Math.sin(x * 0.017 + sd * 2)]);
    pts.push([W + 20, H + 20]);
    pn.shape(pts, SAND(), { w: 5, smooth: true });
    for (let i = 0; i < 9; i++) { const y = top + 70 + i * (H - top) / 9.5, x0 = (hn(i, sd) * 0.5) * W; pn.line([[x0, y], [x0 + 160 + hn(i, sd + 1) * 200, y + 8]], 3, SAND_D(), { op: 0.7 }); }
    (o.stones || [[0.1, 0.86, 90], [0.84, 0.9, 120], [0.55, 0.96, 70]]).forEach(([x, y, r], i) => {
      const cx = x * W, cy = y * H;
      pn.shape([[cx - r, cy + r * 0.4], [cx - r * 0.9, cy - r * 0.5], [cx - r * 0.2, cy - r * 0.75], [cx + r * 0.9, cy - r * 0.55], [cx + r, cy + r * 0.4]], STONE(), { w: 5, smooth: false });
      pn.line([[cx + r * 0.1, cy - r * 0.7], [cx + r * 0.25, cy + r * 0.38]], 3, INK.inkSoft);
    });
    // drifting sand
    for (let i = 0; i < (o.drift ?? 10); i++) {
      const q = fr(t * (o.speed ?? 0.22) * (0.8 + 0.4 * hn(i, sd + 6)) + hn(i, sd + 4)), y = top - 40 + hn(i, sd + 5) * (H - top) * 0.85, x = -160 + q * (W + 320);
      const wv = Math.sin(t * 5 + i) * 8, L = 150 + 90 * hn(i, sd + 7);
      pn.line([[x, y], [x + L * 0.5, y - 6 + wv], [x + L, y + 2]], o.w ?? 3, SAND_D(), { op: 0.8 * Math.sin(q * Math.PI) });
    }
  }
  function nail(pn, x, y, s, p, cross) {
    if (p <= 0) return;
    const S = s * p;
    pn.shape([[x - 18 * S, y - 150 * S], [x + 18 * S, y - 150 * S], [x + 14 * S, y + 120 * S], [x, y + 190 * S], [x - 14 * S, y + 120 * S]], mix(INK.inkSoft, INK.ink, 0.3), { w: 5, smooth: false });
    pn.shape(inkEllipsePts(x, y - 156 * S, 62 * S, 20 * S, 501, 12), mix(INK.inkSoft, INK.ink, 0.15), { w: 5, smooth: true });
    pn.line([[x - 6 * S, y - 130 * S], [x - 4 * S, y + 110 * S]], 4 * S, INK.paperLight, { op: 0.6 });
    if (cross > 0) {
      const c = cross, R = 170 * S;
      pn.line([[x - R, y - R], [x - R + 2 * R * Math.min(1, c * 2), y - R + 2 * R * Math.min(1, c * 2)]], 30, INK.red);
      if (c > 0.5) pn.line([[x + R, y - R], [x + R - 2 * R * (c - 0.5) * 2, y - R + 2 * R * (c - 0.5) * 2]], 30, INK.red);
    }
  }
  function visitors(pn, W, H, top, t, sd, n = 7) {
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n * W + (hn(i, sd) - 0.5) * 70, y = top + 120 + hn(i, sd + 1) * 120, s = 1 + hn(i, sd + 2) * 0.35;
      const bob = Math.sin(t * 0.9 + i * 1.7) * 6, lean = Math.sin(t * 0.5 + i) * 8;
      const col = i % 3 === 0 ? mix(INK.blue, INK.ink, 0.35) : i % 3 === 1 ? mix(INK.inkSoft, INK.ink, 0.2) : mix(INK.red, INK.ink, 0.45);
      pn.shape([[x - 150 * s, H + 30], [x - 128 * s, y + 150 * s + bob], [x - 60 * s, y + 96 * s + bob], [x + 60 * s, y + 96 * s + bob], [x + 128 * s, y + 150 * s + bob], [x + 150 * s, H + 30]], col, { w: 5, smooth: true });
      pn.circ(x + lean, y + bob, 72 * s, SKIN(), { w: 5 });
      pn.fill(inkEllipsePts(x + lean, y - 22 * s + bob, 74 * s, 54 * s, sd + i, 10), mix(INK.ink, INK.inkSoft, 0.2), { smooth: true });
    }
  }
  function rail(pn, W, y, t) {
    pn.fill(rect(-20, y, W + 20, y + 150), mix(INK.paperLight, INK.blue, 0.12), { op: 0.55 });
    pn.line([[-20, y], [W + 20, y]], 12, STEEL());
    pn.line([[-20, y - 6], [W + 20, y - 6]], 3, INK.ink);
    for (let x = 60; x < W; x += 240) pn.line([[x, y], [x, y + 160]], 10, STEEL());
    const q = fr(t * 0.12); pn.line([[q * W - 80, y + 30], [q * W + 40, y + 120]], 8, INK.paperLight, { op: 0.6 });
  }

  // ================================================================== kh_ship
  SH.kh_ship = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 4101;
      const mode = P.mode || 'desert', gy = (P.gy ?? 0.6) * H;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100);
      const castG = el(root, 'g');
      const resto = mode === 'shed' ? person(castG, sd + 7) : null;
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const S = Object.assign({ x: 0.5, L: 900, ex: 1.6 }, P.ship || {});
      const PY = Object.assign({ x: 0.62, w: 1240, h: 700 }, P.pyramid || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); fg.begin(t);
          const glowAt = atOr(cues, P.glow, null), glow = glowAt == null ? 0 : (lt < glowAt ? 0 : 0.85 + 0.15 * Math.sin(t * 5));
          const hit = punch(lt, glowAt ?? atOr(cues, 'hit', null));
          const by = P.props === false ? gy - 12 : gy - 70;
          if (mode === 'desert' && P.pyramid !== false) pyramid(back, PY.x * W, gy - 250, PY.w, PY.h);
          if (mode === 'hall') {   // tall hall: steel roof trusses, wall panels and spotlights
            for (let i = 0; i < 6; i++) back.line([[i * 220 - 40, 120], [i * 220 + 110, 40]], 8, STEEL(), { op: 0.9 });
            back.line([[-20, 130], [W + 20, 130]], 12, STEEL());
            for (let i = 0; i < 5; i++) { const x = 120 + i * 210; back.line([[x, 136], [x, 210]], 4, INK.ink); back.shape(rect(x - 20, 210, x + 20, 246), INK.ink, { w: 0, smooth: false }); back.fill([[x - 16, 246], [x + 16, 246], [x + 120, gy - 160], [x - 120, gy - 160]], INK.paperLight, { op: 0.32 + 0.05 * Math.sin(t * 1.2 + i) }); }
            back.line([[-20, gy - 300], [W + 20, gy - 300]], 4, INK.inkSoft, { op: 0.6 });
          }
          if (mode === 'shed') {   // wall tally of years
            const T = Object.assign({ n: 10, x: 0.72, y: 0.15 }, P.tally || {}), ta = atOr(cues, T.at, 0.3);
            const bx = T.x * W, byy = T.y * H;
            back.shape(rect(bx - 250, byy - 90, bx + 250, byy + 120), mix(INK.paperLight, INK.stain, 0.15), { w: 6, smooth: false });
            for (let i = 0; i < T.n; i++) {
              const a = ta + i * 0.16; if (lt < a) continue;
              const p = spring(lt, a, 0.3), x = bx - 200 + (i % 5) * 34 + Math.floor(i / 5) * 210, top = byy - 60;
              if (i % 5 === 4) back.line([[x - 150, top + 120 * p], [x + 10, top + 20]], 7, INK.red);
              else back.line([[x, top], [x + 4, top + 130 * p]], 7, INK.ink);
            }
          }
          // the ship
          let build = 1;
          if (Array.isArray(P.build)) build = lerp(P.build[0], P.build[1], clamp01(lt / Math.max(1, dur)));
          else if (P.build != null) build = P.build;
                    const front = glowAt == null ? 9 : -0.55 + (lt - glowAt) * 1.4;
          const sp = ship(mid, S.x * W, by, S.L, S.ex, t, { build, glow, front, stitch: P.stitch, oars: P.oars, props: P.props === false ? false : mode === 'hall' ? 'steel' : 'wood', gy });
          // the restorer carries the next plank to the hull
          if (resto) {
            const ux = -0.5 + build, hx = sp.X(ux) + 150, q = Math.sin(t * 1.6);
            const r = resto.update(t, hx + q * 6, gy + 40, 0.82, 'point', { face: -1, dir: 4 + q * 3, emotion: 'neutral' });
            const hd = r.hands.length ? r.hands.reduce((a, b) => (b[0] < a[0] ? b : a)) : [hx - 80, gy - 200];
            const y = hd[1] - 6;
            mid.shape([[hd[0] - 230, y - 16], [hd[0] + 120, y - 22], [hd[0] + 120, y + 14], [hd[0] - 230, y + 20]], CEDAR(), { w: 5, smooth: false });
            for (let i = 0; i < 3; i++) mid.circ(hd[0] - 200 + i * 40, y - 1, 6, INK.ink, { w: 0 });
          }
          if (P.shoe) {   // inset: a laced shoe whose criss-cross laces light up like the hull's stitches
            const Q = P.shoe, sa = atOr(cues, Q.at, 0.3), p = spring(lt, sa, 0.5), la = atOr(cues, Q.glow, sa + 0.8), lg = clamp01((lt - la) / 0.5);
            if (lt >= sa) {
              const cx = (Q.x ?? 0.32) * W, cy = (Q.y ?? 0.24) * H, k = (Q.s ?? 1) * p;
              fg.circ(cx, cy, 230 * k, INK.paperLight, { w: 7 });
              const T = q => [cx + q[0] * k, cy + q[1] * k];
              const UP = mix(INK.blue, INK.ink, 0.25), LT = mix(INK.paperLight, INK.gold, lg);
              fg.shape([[-175, 40], [-178, -40], [-150, -78], [-90, -70], [-40, -96], [10, -118], [40, -100], [70, -60], [140, -20], [182, 10], [185, 40]].map(T), UP, { w: 6, smooth: true });
              fg.shape([[110, -12], [150, -14], [182, 10], [185, 40], [110, 40]].map(T), mix(UP, INK.paperLight, 0.35), { w: 4, smooth: true });
              fg.shape([[-188, 36], [192, 36], [196, 58], [180, 78], [-180, 78], [-192, 58]].map(T), INK.paperLight, { w: 6, smooth: true });
              fg.line([T([-180, 56]), T([186, 56])], 3, INK.inkSoft);
              const E = i => { const q = i / 3; return [[lerp(-34, 44, q), lerp(-100, -52, q)], [lerp(4, 84, q), lerp(-112, -64, q)]]; };
              for (let i = 0; i < 4; i++) { const [a, b] = E(i); fg.circ(...T(a), 7 * k, INK.paperLight, { w: 3 }); fg.circ(...T(b), 7 * k, INK.paperLight, { w: 3 }); }
              for (let i = 0; i < 3; i++) { const [a, b] = E(i), [c, d] = E(i + 1); fg.line([T(a), T(d)], 8 + 3 * lg, LT); fg.line([T(b), T(c)], 8 + 3 * lg, LT); }
              const [a0, b0] = E(0);
              fg.line([T(a0), T([-60, -150]), T([-100, -130])], 8, LT);
              fg.line([T(b0), T([20, -170]), T([60, -160])], 8, LT);
            }
          }
          if (P.nail) {
            const N = P.nail, na = atOr(cues, N.at, 0.2), ca = atOr(cues, N.cross, na + 0.7);
            const np = spring(lt, na, 0.5), cp = clamp01((lt - ca) / 0.35);
            nail(fg, (N.x ?? 0.74) * W, (N.y ?? 0.2) * H, N.s ?? 1, np, cp);
          }
          // foreground
          if (mode === 'desert') dune(fg, W, H, 0.72 * H, t, sd % 17 + 2, { drift: P.drift ?? 24, speed: P.wind ?? 0.22, w: P.wind ? 6 : 3 });
          if (mode === 'hall') { rail(fg, W, 0.74 * H, t); visitors(fg, W, H, 0.74 * H, t, sd % 13 + 1); }
          if (mode === 'shed') {   // numbered planks laid out on the floor like a puzzle
            const top = 0.72 * H;
            fg.fill(rect(-20, top - 20, W + 20, H + 20), mix(INK.stain, INK.paperDark, 0.45), {});
            fg.line([[-20, top - 20], [W + 20, top - 20]], 5, INK.ink);
            for (let r = 0; r < 4; r++) for (let i = 0; i < 4; i++) {
              const y = top + 40 + r * 125, x = 20 + i * 270 + (r % 2) * 60, w = 180 + hn(i, r + sd) * 60, a = (hn(i + r * 4, sd + 2) - 0.5) * 0.06;
              const pts = [[x, y], [x + w, y + w * a], [x + w - 10, y + 60 + w * a], [x + 6, y + 64]];
              fg.shape(pts, r % 2 ? CEDAR() : CEDAR_L(), { w: 4, smooth: false });
              fg.shape(rect(x + w * 0.45, y + 12, x + w * 0.45 + 50, y + 44), INK.paperLight, { w: 3, smooth: false });
              fg.line([[x + w * 0.45 + 10, y + 28], [x + w * 0.45 + 40, y + 28]], 3, INK.ink);
            }
            const dq = fr(t * 0.3); fg.dot(lerp(200, 900, dq), top + 10 - Math.sin(dq * Math.PI) * 40, 6, 6, INK.inkSoft, 0.7);
          }
          if (kas) kas.update(lt, t, cues);
          back.end(); mid.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, W / 2, H * 0.45, hit ? 0.04 * hit : 0);
        },
      };
    },
  };

  // ================================================================== kh_pit
  SH.kh_pit = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 5201;
      const gy = (P.gy ?? 0.6) * H;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100);
      const castG = el(root, 'g');
      const men = [person(castG, sd + 11, { accessory: 'turban' }), person(castG, sd + 23, { accessory: 'turban', beard: 'black' })];
      const fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); fg.begin(t);
          const la = atOr(cues, P.lift, 0.4), lp = progIO(lt, la, 1.8), hit = punch(lt, la);
          pyramid(back, 0.56 * W, gy - 280, 1500, 820);
          // the block row (front faces + top faces), one block rising
          const bx0 = 30, bw = 172, top = gy - 150, depth = 46, lift = 0.42 * W;
          const nB = 6, liftI = 2;
          // the opened pit under the lifted block
          const lx = bx0 + liftI * bw;
          if (lp > 0) {
            mid.shape(rect(lx + 4, top - depth + 6, lx + bw - 4, gy - 4), DARK(), { w: 4, smooth: false });
            for (let i = 0; i < 5; i++) { const y = top + 6 + i * 22; mid.shape(rect(lx + 16 + (i % 2) * 18, y, lx + bw - 20 - (i % 3) * 14, y + 14), CEDAR(), { w: 3, smooth: false, op: Math.min(1, lp * 2) }); }
            mid.fill([[lx + 30, top - depth + 6], [lx + bw - 30, top - depth + 6], [lx + bw - 6, gy - 6], [lx + 6, gy - 6]], INK.gold, { op: 0.3 * lp });
          }
          for (let i = 0; i < nB; i++) {
            const x = bx0 + i * bw, up = i === liftI ? lp * 300 + Math.sin(t * 1.7) * 3 * lp : 0, sway = i === liftI ? Math.sin(t * 1.3) * 6 * lp : 0;
            const pn = i === liftI ? fg : mid;
            pn.shape([[x + sway, top - up], [x + bw - 8 + sway, top - up], [x + bw - 8 + 22 + sway, top - depth - up], [x + 22 + sway, top - depth - up]], STONE(), { w: 5, smooth: false });
            pn.shape(rect(x + sway, top - up, x + bw - 8 + sway, gy - up - (i === liftI ? 4 : 0)), STONE_D(), { w: 5, smooth: false });
            pn.line([[x + 30 + sway, top + 40 - up], [x + 60 + sway, top + 90 - up]], 3, INK.inkSoft);
            if (i === liftI && lp > 0) [0.2, 0.8].forEach(q => fg.line([[x + bw * q + sway, top - depth * 0.5 - up], [0.235 * W + 4, 0.3 * H]], 5, ROPE_D()));
          }
          // derrick (A-frame) with a pulley; the haul rope runs down to the workers
          const apex = [0.235 * W, 0.3 * H];
          fg.line([[apex[0] - 6, apex[1]], [0.05 * W, gy + 30]], 20, CEDAR_D());
          fg.line([[apex[0] + 6, apex[1]], [0.47 * W, gy + 30]], 20, CEDAR_D());
          fg.line([[0.1 * W, gy - 120], [0.42 * W, gy - 120]], 12, CEDAR_D());
          fg.circ(apex[0], apex[1] + 10, 26, CEDAR_L(), { w: 5 });
          fg.line([[apex[0] - 4, apex[1] + 10], [apex[0] + 4, apex[1] + 14]], 3, INK.ink);
          // two workers haul (lean back, hands on the rope)
          const haul = Math.sin(t * 2.4);
          const hs = [];
          [[0.68, 0.9], [0.86, 0.95]].forEach(([x, s], i) => {
            const r = men[i].update(t, x * W + haul * 8, gy + 70 + i * 30, s, 'point', { face: -1, dir: 18 + haul * 4, emotion: 'worried' });
            hs.push(r.hands.length ? r.hands.reduce((a, b) => (b[0] < a[0] ? b : a)) : r.head);
          });
          fg.line([[apex[0] + 18, apex[1] + 24], hs[0], hs[1], [hs[1][0] + 90, hs[1][1] + 140]], 6, ROPE_D());
          // dust and sand trickle from the rising block
          if (lp > 0.05) for (let i = 0; i < 10; i++) {
            const q = fr(t * 0.9 + i / 10), x = lx + 20 + hn(i, sd) * (bw - 40);
            fg.dot(x, top - lp * 300 + 10 + q * (lp * 300 + 120), 4, 5, SAND_D(), 0.8 * (1 - q));
          }
          // foreground: rubble, basket, sand
          dune(fg, W, H, 0.74 * H, t, sd % 11 + 3, { stones: [[0.12, 0.88, 110], [0.9, 0.84, 80], [0.5, 0.97, 90]] });
          const bx = 0.3 * W, byb = 0.86 * H;
          fg.shape([[bx - 110, byb - 90], [bx + 110, byb - 90], [bx + 90, byb + 40], [bx - 90, byb + 40]], CEDAR_L(), { w: 5, smooth: true });
          for (let i = 0; i < 4; i++) fg.line([[bx - 100 + i * 8, byb - 60 + i * 30], [bx + 100 - i * 8, byb - 60 + i * 30]], 3, CEDAR_D());
          fg.line([[bx - 110, byb - 90], [bx, byb - 170], [bx + 110, byb - 90]], 6, CEDAR_D());
          back.end(); mid.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, W / 2, H * 0.5, hit ? 0.03 * hit : 0);
        },
      };
    },
  };

  // ================================================================== kh_pieces
  SH.kh_pieces = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 6301;
      const gy = (P.gy ?? 0.29) * H;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100), fg = pen(el(root, 'g'), sd + 300);
      const C = Object.assign({ x: 0.68, y: 0.15, size: 150 }, P.counter || {});
      const num = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': C.size, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` });
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const x0 = 70, x1 = W - 70, pTop = gy + 90, pBot = (P.bottom ?? 0.6) * H, frontY = P.front ? P.front * H : null;
      // the stacked timbers, bottom layer first
      const pieces = [];
      let y = pBot - 18, row = 0;
      while (y > pTop + 40) {
        let x = x0 + 18 + (row % 2) * 30;
        while (x < x1 - 60) {
          const k = hn(pieces.length, sd), len = k < 0.18 ? 90 + hn(pieces.length, sd + 1) * 60 : 180 + hn(pieces.length, sd + 2) * 260;
          const h = k < 0.18 ? 40 : 20 + hn(pieces.length, sd + 3) * 14;
          const kind = k < 0.18 ? 'beam' : k > 0.9 ? 'oar' : k > 0.82 ? 'coil' : 'plank';
          pieces.push({ x, y, len: Math.min(len, x1 - 20 - x), h, kind, a: (hn(pieces.length, sd + 4) - 0.5) * 0.08 });
          x += len + 14;
        }
        y -= 40; row++;
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); fg.begin(t);
          const ca = atOr(cues, P.at, 0.2), cd = atOr(cues, P.done, Math.max(ca + 1.2, dur * 0.55));
          const cp = clamp01((lt - ca) / Math.max(0.3, cd - ca)), cnt = Math.round((P.count ?? 1224) * (1 - Math.pow(1 - cp, 2.2)));
          const hit = punch(lt, cd);
          // the Great Pyramid's base behind, then bedrock around the pit: strata down to the frame bottom
          if (P.pyramid !== false) pyramid(back, 0.64 * W, gy - 4, 1900, 1100, { rows: 40 });
          back.fill(rect(-20, gy, W + 20, H + 20), STONE_D(), {});
          back.fill(rect(-20, gy - 6, W + 20, gy + 22), SAND(), {});
          for (let i = 0; i < 16; i++) { const yy = gy + 40 + i * (H - gy) / 15; back.line([[-20, yy], [W * 0.4, yy + 10 * Math.sin(i)], [W + 20, yy - 6]], 3, INK.inkSoft, { op: 0.45 }); }
          for (let i = 0; i < 22; i++) { const px = hn(i, sd + 9) * W, py = pBot + 60 + hn(i, sd + 8) * (H - pBot - 80); back.dot(px, py, 10 + hn(i, 3) * 14, 7 + hn(i, 4) * 8, STONE(), 0.9); }
          // pit walls + dark inside
          back.shape(rect(x0, pTop - 4, x1, pBot), DARK(), { w: 7, smooth: false });
          for (let i = 0; i < (pBot - pTop) / 52 - 1; i++) { back.line([[x0 + 8, pTop + 40 + i * 52], [x0 + 26, pTop + 40 + i * 52]], 3, INK.inkSoft); back.line([[x1 - 26, pTop + 40 + i * 52], [x1 - 8, pTop + 40 + i * 52]], 3, INK.inkSoft); }
          // cover blocks at ground level, one missing (light shaft)
          const nB = 6, bw = (x1 - x0 + 40) / nB;
          for (let i = 0; i < nB; i++) {
            const bx = x0 - 20 + i * bw;
            if (i === 3) {
              mid.fill([[bx + 10, gy], [bx + bw - 10, gy], [bx + bw + 120, pBot - 10], [bx - 60, pBot - 10]], INK.gold, { op: 0.26 + 0.04 * Math.sin(t * 1.5) });
              continue;
            }
            mid.shape(rect(bx + 4, gy - 6, bx + bw - 4, pTop + 4), STONE(), { w: 5, smooth: false });
            mid.line([[bx + 20, gy + 20], [bx + 50, gy + 60]], 3, INK.inkSoft);
          }
          // pieces appear one by one as the counter runs
          const n = pieces.length;
          pieces.forEach((p, i) => {
            const a = ca + (i / n) * Math.max(0.3, cd - ca), s = spring(lt, a, 0.35);
            if (lt < a) return;
            const cx = p.x + p.len / 2, cy = p.y - p.h / 2, L = p.len * s, Hh = p.h * s;
            const c = Math.cos(p.a), sn = Math.sin(p.a);
            const R = q => [cx + q[0] * c - q[1] * sn, cy + q[0] * sn + q[1] * c];
            if (p.kind === 'coil') { mid.circ(cx, cy, 22 * s, ROPE(), { w: 4 }); mid.circ(cx, cy, 11 * s, null, { w: 3 }); return; }
            if (p.kind === 'oar') {
              mid.line([R([-L / 2, 0]), R([L / 2 - 60 * s, 0])], 9, CEDAR_D());
              mid.shape(inkEllipsePts(...R([L / 2 - 30 * s, 0]), 40 * s, 14 * s, sd + i, 9, p.a, 0.05), CEDAR(), { w: 4, smooth: true });
              return;
            }
            mid.shape([R([-L / 2, -Hh / 2]), R([L / 2, -Hh / 2]), R([L / 2, Hh / 2]), R([-L / 2, Hh / 2])], p.kind === 'beam' ? CEDAR_D() : (i % 3 ? CEDAR() : CEDAR_L()), { w: 3.5, smooth: false });
          });
          // dust motes in the light shaft + sand trickling in
          for (let i = 0; i < 12; i++) { const q = fr(t * 0.18 + hn(i, sd + 6)), bx = x0 - 20 + 3 * bw; fg.dot(bx + 20 + hn(i, sd + 7) * (bw + 40) + q * 60, gy + 30 + q * (pBot - gy - 60), 4, 4, INK.paperLight, 0.8 * Math.sin(q * Math.PI)); }
          // sand foreground: the trench edge with numbered pieces laid out, a rope coil
          if (frontY) {
            dune(fg, W, H, frontY, t, sd % 9 + 4, { stones: [[0.92, 0.95, 70]], drift: 12 });
            for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) {
              const yy = frontY + 90 + r * 120, xx = 40 + i * 300 + (r % 2) * 80, w = 200 + hn(i + r * 3, sd) * 50;
              if (xx + w > W - 20) continue;
              fg.shape([[xx, yy], [xx + w, yy - 6], [xx + w - 8, yy + 52], [xx + 4, yy + 56]], r % 2 ? CEDAR() : CEDAR_L(), { w: 4, smooth: false });
              fg.shape(rect(xx + w * 0.4, yy + 10, xx + w * 0.4 + 46, yy + 40), INK.paperLight, { w: 3, smooth: false });
              fg.line([[xx + w * 0.4 + 9, yy + 25], [xx + w * 0.4 + 37, yy + 25]], 3, INK.ink);
            }
            const cx = 0.8 * W, cy = frontY + 330;
            for (let i = 0; i < 4; i++) fg.circ(cx, cy, 90 - i * 18, i ? null : ROPE(), { w: 10, line: ROPE(), ry: 44 - i * 8 });
            for (let i = 0; i < 4; i++) fg.circ(cx, cy, 90 - i * 18, null, { w: 3, ry: 44 - i * 8, line: ROPE_D() });
          }
          // the counter
          num.setAttribute('x', f1(C.x * W)); num.setAttribute('y', f1(C.y * H));
          num.textContent = lt < ca ? '' : String(cnt).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
          const sc = 1 + 0.12 * hit;
          num.setAttribute('transform', `translate(${f1(C.x * W)} ${f1(C.y * H)}) scale(${f1(sc * 100) / 100}) translate(${f1(-C.x * W)} ${f1(-C.y * H)})`);
          back.end(); mid.end(); fg.end();
          lbs.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== kh_lash
  SH.kh_lash = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 7401;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100), rope = pen(el(root, 'g'), sd + 200), fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const edges = [330, 640, 950, 1260];   // plank edges (top of plank 1 .. bottom of plank 3)
      const seams = [640, 950];
      const xs = []; for (let x = 150; x <= W - 110; x += 150) xs.push(x);
      // rope path per seam: lower hole i -> (surface, across the seam) upper hole i+1 ; upper -> lower hidden inside
      const paths = seams.map(sy => {
        const pts = [];
        xs.forEach((x, i) => { pts.push({ p: [x, sy - 38], hid: false }); pts.push({ p: [x + 16, sy + 38], hid: true }); });
        return pts;
      });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); rope.begin(t); fg.begin(t);
          const sa = atOr(cues, P.sew, 0.3), span = P.span ?? 2.2, done = P.done ?? 0;
          const sp = clamp01(done + (1 - done) * clamp01((lt - sa) / span));
          const ha = atOr(cues, P.holes, null), hp = ha == null ? 0 : clamp01((lt - ha) / 0.4);
          const xa = atOr(cues, P.hidden, null), xp = xa == null ? 0 : clamp01((lt - xa) / 0.5);
          const hit = punch(lt, atOr(cues, 'hit', sa));
          const gap = lerp(P.gap ?? 16, 3, sp);
          // planks (inside face) with grain
          for (let k = 0; k < 3; k++) {
            const y0 = edges[k] + (k ? gap / 2 : 0), y1 = edges[k + 1] - (k < 2 ? gap / 2 : 0);
            back.shape([[-20, y0 + 6 * Math.sin(k)], [W + 20, y0 - 4], [W + 20, y1], [-20, y1 + 4]], k === 1 ? CEDAR_L() : CEDAR(), { w: 6, smooth: false });
            for (let g = 0; g < 7; g++) {
              const yy = lerp(y0 + 20, y1 - 20, g / 6), wv = 9 * Math.sin(g + k * 2);
              back.line([[-20, yy], [W * 0.3, yy + wv], [W * 0.62, yy - wv * 0.6], [W + 20, yy + wv * 0.4]], 2.5, CEDAR_D(), { op: 0.55 });
            }
            const kx = (0.25 + 0.5 * hn(k, sd)) * W, ky = (y0 + y1) / 2;
            back.circ(kx, ky, 26, CEDAR_D(), { w: 3, ry: 14, op: 0.6 });
            back.circ(kx, ky, 46, null, { w: 2.5, ry: 26, line: CEDAR_D(), lop: 0.6 });
          }
          // holes on both sides of each seam
          seams.forEach(sy => xs.forEach(x => {
            [[x, sy - 38], [x + 16, sy + 38]].forEach(([hx, hy]) => {
              back.circ(hx, hy, 17, DARK(), { w: 4 });
              if (hp > 0) back.circ(hx, hy, 17 + 14 * hp + 4 * Math.sin(t * 6), null, { w: 6, line: INK.gold, lop: hp });
            });
          }));
          // X-ray of the hidden channel (V-shaped, inside the wood)
          if (xp > 0) seams.forEach(sy => xs.forEach(x => {
            for (let d = 0; d < 4; d++) { const a = d / 4, b = a + 0.16; mid.line([[lerp(x, x + 16, a), lerp(sy - 38, sy + 38, a)], [lerp(x, x + 16, b), lerp(sy - 38, sy + 38, b)]], 16, INK.gold, { op: 0.95 * xp }); }
            mid.line([[x - 30, sy - 40], [x - 6, sy], [x - 30, sy + 40]], 5, INK.red, { op: xp, smooth: false });
          }));
          // rope: runs from hole to hole as sp grows; hidden runs are drawn only as the X-ray dash
          const total = paths[0].length - 1;
          paths.forEach((pts, si) => {
            const prog = clamp01(sp * 2 - si * 0.85) * total;
            for (let j = 0; j < total; j++) {
              if (j >= prog) break;
              const a = pts[j].p, b = pts[j + 1].p, q = Math.min(1, prog - j), e = [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
              if (pts[j + 1].hid) continue;   // upper hole i -> lower hole i runs hidden inside the wood
              const slack = (1 - sp) * 18 * Math.sin(t * 3 + j);
              const m = [(a[0] + e[0]) / 2 + slack, (a[1] + e[1]) / 2];
              rope.line([a, m, e], 20, INK.ink);
              rope.line([a, m, e], 13, ROPE());
              for (let s = 0.15; s < q; s += 0.14) { const px = lerp(a[0], e[0], s), py = lerp(a[1], e[1], s); rope.line([[px - 6, py - 4], [px + 6, py + 4]], 3, ROPE_D()); }
            }
            // the running end (frayed) while sewing
            if (prog > 0 && prog < total) {
              const j = Math.floor(prog), a = pts[j].p, b = pts[j + 1].p, q = prog - j;
              const e = [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
              for (let f = -1; f <= 1; f++) rope.line([e, [e[0] + 20 + f * 4, e[1] + f * 14]], 4, ROPE_D());
            }
          });
          // frames (ribs) across the planks at both ends
          [40, W - 40].forEach((x, i) => {
            fg.shape([[x - 50, edges[0] - 40], [x + 50, edges[0] - 40], [x + 46, edges[3] + 40], [x - 46, edges[3] + 40]], CEDAR_D(), { w: 6, smooth: false });
          });
          // workbench floor below: shavings, mallet, rope coil
          const ft = 1320;
          fg.fill(rect(-20, ft, W + 20, H + 20), mix(INK.stain, INK.paperDark, 0.4), {});
          fg.line([[-20, ft], [W + 20, ft]], 6, INK.ink);
          for (let i = 0; i < 6; i++) fg.line([[i * 200 - 40, ft + 6], [i * 200 - 140, H + 20]], 3, CEDAR_D(), { op: 0.5 });
          for (let i = 0; i < 14; i++) { const x = hn(i, sd + 1) * W, y = ft + 80 + hn(i, sd + 2) * 460; fg.line([[x, y], [x + 20, y - 16], [x + 40, y - 4], [x + 30, y + 10], [x + 14, y + 2]], 5, CEDAR_L()); }
          const cx = 0.74 * W, cy = 0.82 * H;
          for (let i = 0; i < 5; i++) fg.circ(cx, cy, 120 - i * 20, i ? null : ROPE(), { w: 12, line: ROPE(), ry: 60 - i * 10 });
          for (let i = 0; i < 5; i++) fg.circ(cx, cy, 120 - i * 20, null, { w: 3, ry: 60 - i * 10, line: ROPE_D() });
          fg.line([[0.18 * W, 0.86 * H], [0.42 * W, 0.8 * H]], 18, CEDAR_D());
          fg.shape([[0.38 * W, 0.74 * H], [0.5 * W, 0.71 * H], [0.53 * W, 0.83 * H], [0.41 * W, 0.86 * H]], CEDAR(), { w: 5, smooth: false });
          back.end(); mid.end(); rope.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, W / 2, 800, hit ? 0.03 * hit : 0);
        },
      };
    },
  };

  // ================================================================== kh_twin
  SH.kh_twin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 8501;
      const gy = (P.gy ?? 0.6) * H;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100);
      const castG = el(root, 'g');
      const crew = [person(castG, sd + 5), person(castG, sd + 17)];
      const fg = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); fg.begin(t);
          const la = atOr(cues, P.lower, dur * 0.55), lp = progIO(lt, la - 1.6, 1.6), hit = punch(lt, la);
          // hall: roof beams, spotlights, a big glass wall with the pyramids far off
          back.line([[-20, 120], [W + 20, 120]], 12, STEEL());
          for (let i = 0; i < 6; i++) back.line([[i * 200, 126], [i * 200 + 100, 60]], 6, STEEL());
          back.shape(rect(60, 330, W - 60, gy - 480), mix(INK.paperLight, INK.blue, 0.18), { w: 5, smooth: false });
          for (let i = 1; i < 6; i++) back.line([[60 + i * (W - 120) / 6, 330], [60 + i * (W - 120) / 6, gy - 480]], 4, STEEL());
          [[0.32, 120, 90], [0.52, 190, 130], [0.7, 90, 60]].forEach(([x, w, h]) => back.fill([[x * W - w, gy - 490], [x * W, gy - 490 - h], [x * W + w, gy - 490]], STONE_D(), { op: 0.7 }));
          // steel cradle: beam, posts, U-ribs
          const bx0 = 40, bx1 = W - 40, beamY = gy - 90;
          mid.shape(rect(bx0, beamY - 12, bx1, beamY + 12), STEEL(), { w: 4, smooth: false });
          for (let x = bx0 + 20; x < bx1; x += 130) { mid.line([[x, beamY + 10], [x, gy]], 9, STEEL()); mid.line([[x - 40, gy], [x + 40, gy]], 6, STEEL()); }
          for (let i = 0; i < 5; i++) {
            const x = lerp(bx0 + 90, bx1 - 90, i / 4), e = Math.abs(i / 4 - 0.5) * 2, h = 380 - e * 100, U = [[x - 95 + e * 20, beamY - h], [x - 70, beamY - 60], [x, beamY - 30], [x + 70, beamY - 60], [x + 95 - e * 20, beamY - h]];
            mid.line(U, 30, INK.ink, { smooth: true });
            mid.line(U, 20, STEEL(), { smooth: true });
          }
          // floor planks in place (from the left)
          const n = P.n ?? 5, pw = 150;
          for (let i = 0; i < n; i++) { const x = bx0 + 10 + i * pw; mid.shape(rect(x, beamY - 52, x + pw - 6, beamY - 10), i % 2 ? CEDAR_D() : CEDAR(), { w: 4, smooth: false }); }
          // the new plank, lowered on two straps
          const nx = bx0 + 10 + n * pw, ny = lerp(beamY - 560, beamY - 52, lp), swing = Math.sin(t * 1.4) * 8 * (1 - lp);
          [nx + 10, nx + pw - 16].forEach(x => mid.line([[x + swing, 0], [x + swing, ny]], 6, mix(INK.blue, INK.ink, 0.3)));
          mid.shape(rect(nx + swing, ny, nx + pw - 6 + swing, ny + 42), CEDAR_L(), { w: 5, smooth: false });
          if (hit) for (let j = 0; j < 5; j++) { const a = -Math.PI * (0.15 + j * 0.17); mid.line([[nx + 56 + Math.cos(a) * 80, beamY - 40 + Math.sin(a) * 40], [nx + 56 + Math.cos(a) * 130, beamY - 40 + Math.sin(a) * 80]], 5, INK.ink, { op: hit }); }
          // two conservators guide it
          const g1 = Math.sin(t * 1.8);
          crew[0].update(t, Math.max(170, nx - 70), gy + 30, 0.9, 'point', { face: 1, dir: 30 + g1 * 6, emotion: 'neutral' });
          crew[1].update(t, Math.min(W - 170, nx + pw + 80), gy + 30, 0.9, 'point', { face: -1, dir: 30 - g1 * 6, emotion: 'happy' });
          // foreground: glass rail + visitors watching
          rail(fg, W, 0.72 * H, t);
          visitors(fg, W, H, 0.72 * H, t, sd % 7 + 3, 6);
          back.end(); mid.end(); fg.end();
          lbs.update(lt, t, cues);
          zoomAt(root, W / 2, H * 0.45, hit ? 0.03 * hit : 0);
        },
      };
    },
  };
})();
