// dp_dyatlov: the Dyatlov Pass incident (Northern Urals, 1-2 February 1959) in the parchment ink style (brand/kit/BRAND.md
// §3, §5; lines boil at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random).
// Written for the Stickstory long video ag-03-dyatlov-pass (2026-11-19) but parametric. Tuned for 16:9 (1920x1080).
// Uses mcB__lib.js (MCB.labels) for hand-written labels and kasif.js (KASIF.create) for the narrator. Respectful: the dead
// are never drawn, only small red marker flags.
//
// Common P: labels: [MCB label entries {text, x, y (0..1), at, size, color, stamp, arrow, strike}],
//   kasif: {x, y (0..1, feet), scale: 0.5, pose: "idle", at: cue, then, dir, face: 1|-1, emotion, text, seq: [...]} | false
//
// SHOTS.dp_slope — the open snow slope of Kholat Syakhl (rises to the right), a long ridge tent on it, forest bottom-left.
//   P.mode "night": tent glows (lantern) and dims on cue "dim"; "pitch": three hikers dig the cut, the tent rises on cue
//   "tent", P.cut shows the notch; "flee": the tent wall is slit, P.n small hikers walk down toward the trees leaving
//   footprints; "tracks": only the footprints draw themselves from the tent to the forest; "found": daylight, the tent sags
//   half buried, slit flapping, three searchers stand by it, one points on cue "pt"; "slab": a crack opens above the tent on
//   cue "crack" and a snow block slides onto it on cue "slab", the tent flattens.
//   P: {mode, slope: [0.98, 0.42] (surface y at left/right edge, 0..1 H), tent: {x: 0.64, s: 1}, n: 9, trees: true,
//       cut: false (tent wall slit), wind: 0..1, dusk: false}   cues: dim, tent, crack, slab, pt, go
//
// SHOTS.dp_inside — full-frame view from inside the tent at night: canvas wall, seams, lantern glow. A knife blade pushes
//   through and slices down on cue "cut", the slit opens on the dark night with snow blowing in.
//   P.mode "cut" | "out" (slit already wide, wind pours in, the fabric flaps) | "found" (daylight, the slit flaps, a pair of
//   boots and a folded coat lie on the floor).   cues: cut, hit
//
// SHOTS.dp_cedar — the tall cedar at the forest edge.  P.mode "fire": a small fire at its foot flickers, sparks rise, two
//   hikers crouch by it; "return": the cedar at left, the slope rises to a tiny tent at upper right, three small hikers
//   lean into the wind and climb toward it; "ash": daylight, cold ashes, P.flags red marker flags (2 by the tree, 3 up the
//   slope) pop in on cues; "calm": the cedar, snow falling, tiny tent on the slope (closing scene).
//   P: {mode, tree_x: 0.6, ground: 0.84, flags: [{x, y, at}]}
//
// SHOTS.dp_ravine — cut-away of a ravine filled with layered snow, a stream running under it; searchers on both banks
//   push long probes into the snow (one strikes on cue "find"); melt drips fall from the snow lip.
//
// SHOTS.dp_ski — a line of skiers in the forest (trees scroll past).  P.mode "march": P.n skiers glide right, P.lead
//   (index) is labelled; "goodbye": the group glides off to the right while one skier (P.yudin) turns left, waves on cue
//   "bye" and glides away the other way.  P: {mode, n: 9, ground: 0.84, speed: 60}
//
// SHOTS.dp_map — full-frame old map of the Northern Urals: a north-south mountain chain, rivers, villages; the dashed ski
//   route draws itself from Vizhai to Kholat Syakhl (cue "route"), red stub on to Otorten (cue "goal"); P.places
//   [{name, x, y, at, kind: "village"|"peak"|"camp"}] and P.route [[x, y], ...] in 0..1 frame coords.
//
// SHOTS.dp_desk — an investigator's desk (interior set).  P.mode "stamp": typed lines appear on a case file and a hand
//   brings a red rubber stamp down on cue "stamp" (P.stamp text); "report": a big typed page fills the frame, P.lines
//   type themselves, the last one is underlined red on cue "hit"; "phone": an old telephone rings (shakes, sound arcs);
//   "duo": two scientists at a laptop that shows a slope diagram.  P: {mode, stamp, lines, kasif, cast: [rig entries]}
//
// SHOTS.dp_slab — full-frame cross-section diagram of the slope (the theory of Gaume & Puzrin, 2021).
//   P.mode "cut": layered snow on the slope, the tent sits in a notch, the notch is cut out on cue "cut" and red arrows show
//   the support taken away; "wind": wind arrows blow snow up the slope and a drift wedge grows above the tent (cue "load");
//   "release": a crack opens (cue "crack") and the slab slides onto the tent (cue "slab"); "doubt": the gentle slope with a
//   red angle arc and P.angle label; "sim": the slab is drawn as a grid of particles that hits a crash-test dummy outline,
//   a green check pops on cue "match".  P: {mode, angle: "30°?", labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const I = INK;
  const F1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const tc = (cues, v, fb) => v == null ? fb : typeof v === 'number' ? v : (cues && cues[v] != null ? cues[v] : fb);
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const ell = (cx, cy, rx, ry, k, n = 14, rot = 0) => inkEllipsePts(cx, cy, rx, ry, k, n, rot, 0.04);
  const V = (deg, L) => [Math.sin(deg * Math.PI / 180) * L, Math.cos(deg * Math.PI / 180) * L];   // 0 = down, 90 = right, 180 = up
  const hr = a => { const v = Math.sin(a * 12.9898 + 4.1414) * 43758.5453; return v - Math.floor(v); };
  const rngI = k => { const r = rng(Math.floor(hr(k) * 2147483000) + 1); r(); return r; };   // decorrelated seeds (Lehmer rng: neighbouring seeds start alike)
  const rot = (px, py, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a), dx = px - cx, dy = py - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };

  // ---------------------------------------------------------------- pooled painter (painter's order per frame)
  function painter(parent) {
    const els = []; let n = 0, T = 0;
    const get = () => { const e = els[n] || (els[n] = el(parent, 'path', { stroke: 'none' })); n++; e.style.display = ''; return e; };
    const P = {
      begin(t) { n = 0; T = t; },
      end() { for (let i = n; i < els.length; i++) els[i].style.display = 'none'; },
      fill(pts, col, k, o = {}) {
        const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', o.op ?? 1);
        e.setAttribute('d', inkLoop(pts, { seed: k, t: T, amp: o.amp ?? 1.2, smooth: o.smooth !== false }));
      },
      line(pts, w, k, o = {}) {
        const e = get(); e.setAttribute('fill', o.col || I.ink); e.setAttribute('fill-opacity', o.op ?? 1);
        e.setAttribute('d', inkPath(pts, { w, seed: k, t: T, amp: o.amp ?? 1.4, closed: !!o.closed, smooth: o.smooth !== false }));
      },
      shape(pts, col, w, k, o = {}) { P.fill(pts, col, k, o); P.line(pts, w, k + 1, Object.assign({}, o, { closed: true, col: o.lc || I.ink, op: o.lop ?? 1 })); },
      dot(x, y, r, col, k, op) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op ?? 1); e.setAttribute('d', inkDot(x, y, r, r, k, T)); },
    };
    return P;
  }

  // ---------------------------------------------------------------- small posable hiker (knitted cap) — same build as mw_mawson
  function man(pt, o, k) {
    const s = o.s ?? 0.5, x = o.x, y = o.y, w = 14 * s;
    const tv = V(o.torso ?? 180, 210 * s), neck = [x + tv[0], y + tv[1]];
    const hv = V(o.torso ?? 180, 74 * s), head = [neck[0] + hv[0], neck[1] + hv[1]];
    const sh = [lerp(x, neck[0], 0.9), lerp(y, neck[1], 0.9)];
    const limb = (p0, a1, a2, L1, L2) => { const v1 = V(a1, L1), p1 = [p0[0] + v1[0], p0[1] + v1[1]], v2 = V(a2, L2); return [p0, p1, [p1[0] + v2[0], p1[1] + v2[1]]]; };
    const legs = o.legs || [[-8, 0], [8, 0]], arms = o.arms || [[-12, -6], [12, 6]];
    const lc = o.lc || I.ink;
    if (o.pack) pt.shape([[neck[0] - (o.face ?? 1) * 70 * s, neck[1] + 10 * s], [neck[0] - (o.face ?? 1) * 18 * s, neck[1] + 4 * s], [x - (o.face ?? 1) * 14 * s, y - 40 * s], [x - (o.face ?? 1) * 76 * s, y - 50 * s]], I.paperDark, 6 * s, k + 40, { smooth: false });
    const hands = [];
    legs.forEach((L, i) => { const pp = limb([x, y], L[0], L[1], 120 * s, 120 * s); pt.line(pp, w, k + i, { smooth: false, col: lc }); pt.dot(pp[2][0] + 8 * s * (o.face ?? 1), pp[2][1], 11 * s, lc, k + 10 + i); });
    pt.line([[x, y], neck], w * 1.05, k + 3, { col: lc });
    arms.forEach((A, i) => { const pp = limb(sh, A[0], A[1], 95 * s, 90 * s); pt.line(pp, w * 0.95, k + 4 + i, { smooth: false, col: lc }); pt.dot(pp[2][0], pp[2][1], 12 * s, lc, k + 12 + i); hands.push(pp[2]); });
    const r = 70 * s;
    pt.shape(ell(head[0], head[1], r, r, k + 21), I.paperLight, 9 * s, k + 21, { lc });
    const f = o.face ?? 1;
    if (!o.back) {
      pt.dot(head[0] + f * 10 * s, head[1] + 12 * s, 8 * s, I.ink, k + 22); pt.dot(head[0] + f * 38 * s, head[1] + 12 * s, 8 * s, I.ink, k + 23);
      if (o.worried) { pt.line([[head[0] + f * 2 * s, head[1] - 2 * s], [head[0] + f * 18 * s, head[1] - 8 * s]], 4 * s, k + 27, { smooth: false }); pt.line([[head[0] + f * 30 * s, head[1] - 8 * s], [head[0] + f * 46 * s, head[1] - 2 * s]], 4 * s, k + 28, { smooth: false }); }
      pt.line([[head[0] + f * 14 * s, head[1] + 40 * s], [head[0] + f * 36 * s, head[1] + 40 * s]], 4 * s, k + 29, { smooth: false });
    }
    if (o.cap !== false) {
      const c = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; c.push([head[0] + Math.cos(a) * r * 1.04, head[1] + Math.sin(a) * r * 1.04 - 6 * s]); }
      c.push([head[0] + r * 1.05, head[1] - 4 * s]);
      pt.shape(c, o.capCol || I.blue, 7 * s, k + 24, { op: 0.92 });
      pt.dot(head[0], head[1] - r * 1.12, 13 * s, o.capCol || I.blue, k + 26);
    }
    return { head, neck, hands };
  }
  // walking pose (legs/arms swing with phase ph in cycles)
  const walkPose = (ph, lean = 0, amp = 1) => {
    const a = Math.sin(ph * 6.283) * 26 * amp;
    return { torso: 180 - lean, legs: [[a, a * 0.3 - 4], [-a, -a * 0.3 + 4]], arms: [[-a * 0.8, -a * 0.6 - 10], [a * 0.8, a * 0.6 + 10]] };
  };
  // skis + poles under a skier at (x, y)
  function skis(pt, x, y, s, k, f = 1) {
    pt.line([[x - 150 * s * f, y + 4], [x + 140 * s * f, y + 2], [x + 162 * s * f, y - 14 * s]], 6 * s, k);
  }

  function streaks(pt, W, H, t, n, k, o = {}) {   // wind-blown snow, left -> right (o.dir -1: right -> left)
    const r = rngI(k * 7 + 3), sp = o.speed ?? 800, y0 = o.y0 ?? 0, y1 = o.y1 ?? H, d = o.dir ?? 1;
    for (let i = 0; i < n; i++) {
      const yy = y0 + r() * (y1 - y0), L = 40 + r() * 120, v = sp * (0.6 + r() * 0.8);
      let x = ((r() * (W + 400) + t * v) % (W + 400)) - 200; if (d < 0) x = W - x;
      pt.line([[x, yy], [x + d * L * 0.5, yy + 3 + (o.slope ?? 0.08) * L], [x + d * L, yy + (o.slope ?? 0.08) * L * 2]], 2.4 + r() * 2.6, k + i, { col: o.col || (r() < 0.5 ? I.inkSoft : I.paperLight), op: 0.55 + r() * 0.35, amp: 0.6 });
    }
  }
  function flakes(pt, W, H, t, n, k, o = {}) {      // slow falling snow
    const r = rngI(k * 3 + 9);
    for (let i = 0; i < n; i++) {
      const x0 = r() * W, sp = 40 + r() * 60, y = ((r() * H + t * sp) % (H + 40)) - 20, x = x0 + Math.sin(t * 0.8 + i) * 24;
      pt.dot(x, y, 3 + r() * 4, o.col || I.paperLight, k + i, 0.85);
    }
  }
  function conifer(pt, x, y, h, k, o = {}) {        // layered ink fir; y = foot
    const sw = Math.sin((o.t || 0) * 1.3 + k) * (o.sway ?? 4);
    pt.line([[x, y], [x + sw * 0.3, y - h]], Math.max(4, h * 0.035), k);
    const tiers = o.tiers ?? 5;
    for (let i = 0; i < tiers; i++) {
      const u = i / tiers, ty = y - h * (0.18 + u * 0.8), wd = h * (0.34 - u * 0.055), dx = sw * (0.3 + u);
      pt.shape([[x - wd + dx, ty + h * 0.12], [x + dx * 1.2, ty - h * 0.16], [x + wd + dx, ty + h * 0.12]], o.fill || I.ink, Math.max(3, h * 0.02), k + 2 + i * 2, { op: o.op ?? 0.88, lc: o.lc || I.ink });
      if (o.snow !== false) pt.line([[x - wd * 0.7 + dx, ty + h * 0.08], [x + dx * 1.1, ty - h * 0.08], [x + wd * 0.6 + dx, ty + h * 0.07]], Math.max(3, h * 0.022), k + 30 + i, { col: I.paperLight, op: 0.9 });
    }
  }
  // the long ridge tent (two tents sewn into one, ~4 m), seen side-on; (x, y) = middle of the base; a = slope angle (rad)
  function ridgeTent(pt, x, y, s, a, k, o = {}) {
    const L = 230 * s, h = 110 * s, sag = o.sag ?? 0, bury = o.bury ?? 0;
    const R = (px, py) => rot(x + px, y + py, x, y, a);
    const ridgeH = h * (1 - sag);
    const body = [R(-L, 0), R(-L * 0.96, -ridgeH * 0.95), R(-L * 0.3, -ridgeH * (1 - sag * 0.6)), R(L * 0.3, -ridgeH * (1 - sag * 0.4)), R(L * 0.96, -ridgeH * 0.95), R(L, 0)];
    if (o.glow) pt.fill(ell(x, y - h * 0.4, L * 1.5, h * 1.3, k + 90), I.gold, k + 90, { op: o.glow * 0.25 });
    pt.shape(body, o.glow ? I.gold : I.paperDark, 7 * s, k, { op: o.glow ? Math.min(1, 0.45 + o.glow) : 1, smooth: false });
    for (let i = 1; i < 6; i++) { const u = -1 + i / 3; pt.line([R(L * u * 0.98, -2), R(L * u * 0.98, -ridgeH * 0.9)], 2.5 * s, k + 3 + i, { col: I.inkSoft, op: 0.7 }); }
    // ski-pole uprights + guy lines
    [-1, 1].forEach((sd, i) => { pt.line([R(sd * L * 0.98, 4), R(sd * L * 1.0, -ridgeH - 30 * s)], 6 * s, k + 12 + i); pt.line([R(sd * L, -ridgeH - 26 * s), R(sd * (L + 120 * s), 6)], 3 * s, k + 14 + i, { col: I.inkSoft }); });
    if (o.slit) {   // the cut in the wall (opening u 0..1)
      const sx = o.slitX ?? 0.35, op = o.slit, flap = Math.sin((o.t || 0) * 7) * 6 * s * (o.flap ?? 1);
      const top = R(L * sx, -ridgeH * 0.85), bot = R(L * sx + 10 * s, -6 * s);
      pt.fill([top, R(L * sx - 26 * s * op - flap, -ridgeH * 0.45), bot, R(L * sx + 30 * s * op + flap, -ridgeH * 0.5)], I.ink, k + 20, { op: 0.95 });
      pt.line([top, R(L * sx - 4 * s, -ridgeH * 0.5), bot], 4 * s, k + 21, { col: I.red });
    }
    if (bury > 0) pt.fill([R(-L - 160 * s, 20 * s), R(-L * 0.6, -ridgeH * bury), R(0, -ridgeH * bury * 0.8 - 8 * s), R(L * 0.7, -ridgeH * bury * 1.05), R(L + 160 * s, 20 * s)], I.paperLight, k + 30, { op: 0.98 });
    return { R, L, h: ridgeH };
  }

  // labels + optional Kaşif
  function rigOf(parent, K, sd) {
    if (!K) return null;
    const isK = (K.who || 'kasif') === 'kasif';
    const g = el(parent, 'g');
    const rig = KASIF.create(g, { scale: K.scale ?? 0.5, hat: isK, accessory: isK ? null : (K.accessory ?? null), beard: isK ? null : (K.beard || null), seed: sd });
    return { K, rig, g };
  }
  function rigUpdate(R, lt, t, cues, W, H, over = {}) {
    if (!R) return;
    const K = R.K;
    const st = [{ at: -1e9, pose: K.pose || 'idle', dir: K.dir ?? 20, face: K.face ?? 1, emotion: K.emotion0 || 'neutral', text: K.text0 ?? K.text, item: K.item }];
    if (K.at != null) st.push({ at: tc(cues, K.at, 1e9), pose: K.then || 'point', dir: K.dir_then ?? K.dir ?? 20, face: K.face_then ?? K.face ?? 1, emotion: K.emotion || 'surprised', text: K.text, item: K.item });
    for (const s of K.seq || []) st.push({ at: tc(cues, s.at, 1e9), pose: s.pose, dir: s.dir ?? K.dir ?? 20, face: s.face ?? K.face ?? 1, emotion: s.emotion || 'neutral', text: s.text ?? K.text, item: s.item });
    st.sort((a, b) => a.at - b.at);
    let i = 0; while (i + 1 < st.length && lt >= st[i + 1].at) i++;
    const c = st[i], pv = st[i - 1], since = i ? lt - c.at : lt, D = window.MCB.dirOf, FC = v => v === 'left' ? -1 : v === 'right' ? 1 : v;
    const o = Object.assign({ x: K.x * W, y: (K.y ?? 0.84) * H, face: FC(c.face), since, dir: D(c.dir), emotion: c.emotion, ph: lt * (K.pace ?? 1.1), text: c.text, item: c.item, mouth: 0 }, over);
    if (pv && since < 0.3) { o.prev = { pose: pv.pose, since: since + 1, dir: D(pv.dir), ph: o.ph }; o.mix = since / 0.3; }
    R.rig.update(t, over.pose || c.pose, o);
  }
  function base(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), rigs = el(root, 'g'), front = el(root, 'g'), top = el(root, 'g');
    const pb = painter(back), pm = painter(mid), pf = painter(front);
    const L = window.MCB.labels(top, P.labels || [], W, H, seed * 31 + 5);
    const K = rigOf(rigs, P.kasif, seed * 17 + 3);
    return { P, W, H, seed, root, back, mid, rigs, front, top, pb, pm, pf, L, K,
      begin(t) { pb.begin(t); pm.begin(t); pf.begin(t); },
      end(lt, t, cues) { pb.end(); pm.end(); pf.end(); L.update(lt, t, cues); rigUpdate(K, lt, t, cues, W, H); },
    };
  }

  // ================================================================ dp_slope
  SH.dp_slope = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'night';
      const [yl, yr] = (P.slope || [0.98, 0.42]).map(v => v * H);
      const sy = x => lerp(yl, yr, x / W), ang = Math.atan2(yr - yl, W);
      const T = Object.assign({ x: 0.64, s: 1 }, P.tent || {});
      const tx = T.x * W, ty = sy(tx);
      const n = P.n ?? 9, night = mode === 'night' || mode === 'flee' || mode === 'tracks' || mode === 'slab';
      const forestX = W * 0.14, forestY = sy(forestX);
      const rr = rngI(seed * 13 + 7);
      const trees = P.trees === false ? [] : Array.from({ length: 9 }, (_, i) => { const x = -60 + i * 70 + rr() * 40; return [x, sy(x) + 40 + rr() * 60, 170 + rr() * 120]; });
      // footprint paths: from the tent down to the forest, slightly fanned
      const paths = Array.from({ length: n }, (_, i) => { const off = (i - (n - 1) / 2) * 16; return u => { const x = lerp(tx - 120, forestX + 120, u); return [x + Math.sin(u * 9 + i) * 10, sy(x) - 6 + off * (0.3 + u * 0.7) + 30 * u]; }; });
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          // mountain body
          const surf = [[-60, sy(-60)], [W * 0.3, sy(W * 0.3) + 6], [W * 0.6, sy(W * 0.6) - 4], [W + 60, sy(W + 60)]];
          pb.fill(surf.concat([[W + 60, H + 60], [-60, H + 60]]), I.paperLight, seed + 1, { op: 0.97 });
          pb.line(surf, 6, seed + 2);
          for (let i = 0; i < 16; i++) { const r = rngI(seed * 5 + i), x = r() * W, d = 40 + r() * 260; const y = sy(x) + d; if (y > H) continue; pb.line([[x, y], [x + 90, y - 90 * Math.tan(-ang) * 0.9 - 4]], 3, seed + 10 + i, { col: I.inkSoft, op: 0.45 }); }
          trees.forEach(([x, y, h], i) => conifer(pm, x, y, h, seed + 100 + i * 50, { t: lt, sway: 3 }));
          // tent
          let glow = 0, slit = P.cut ? 1 : 0, sag = 0, bury = 0, tentS = T.s;
          if (mode === 'night') { const da = tc(cues, 'dim', null); glow = (P.glow ?? 0.55) * (da == null ? 1 : 1 - prog(lt, da, 1.4)) * (0.92 + 0.08 * Math.sin(lt * 7)); }
          if (mode === 'flee' || mode === 'tracks') slit = 1;
          if (mode === 'found') { slit = 1; sag = 0.3; bury = 0.38; }
          let tentY = ty;
          if (mode === 'pitch') { const ta = tc(cues, 'tent', dur * 0.45); tentS = T.s * Math.max(0.001, spring(lt, ta, 0.7)); if (lt < ta) tentS = 0; }
          // the cut (notch) in the slope
          if (P.cut_notch || mode === 'pitch') pm.fill([[tx - 260 * T.s, ty + 4], [tx + 250 * T.s, sy(tx + 250 * T.s) + 4], [tx + 270 * T.s, ty - 40 * T.s], [tx - 250 * T.s, ty + 2]], I.inkSoft, seed + 300, { op: 0.4, smooth: false });
          let slabOff = 0;
          if (mode === 'slab') {
            const ca = tc(cues, 'crack', dur * 0.3), sa = tc(cues, 'slab', dur * 0.55);
            const u = sm(lin(lt, sa, 1.1)); slabOff = u;
            sag = 0.75 * u;
            const bx = tx + 330 + (-330 + 60) * u, byy = sy(bx);
            const bl = 300, bh = 80;
            const blk = [[bx - bl / 2, byy + 4], [bx + bl / 2, sy(bx + bl / 2) + 4], [bx + bl / 2 + 10, sy(bx + bl / 2) - bh], [bx - bl / 2 + 10, byy - bh]];
            if (lt > ca) {
              const cp = prog(lt, ca, 0.5), cx0 = tx + 480;
              if (u < 0.05) pm.line([[cx0, sy(cx0) - 2], [cx0 + 6, sy(cx0) + 30 * cp], [cx0 - 4, sy(cx0) + 60 * cp]], 6, seed + 320, { col: I.red });
            }
            pm.shape(blk, I.paperLight, 6, seed + 330, { smooth: false, lc: I.ink });
            for (let q = 1; q < 3; q++) { const f = q / 3; pm.line([[lerp(blk[0][0], blk[3][0], f), lerp(blk[0][1], blk[3][1], f)], [lerp(blk[1][0], blk[2][0], f), lerp(blk[1][1], blk[2][1], f)]], 3, seed + 336 + q, { col: I.blue, op: 0.75 }); }
            for (let q = 0; q < 6; q++) { const f = (q + 0.5) / 6; const p0 = [lerp(blk[3][0], blk[2][0], f), lerp(blk[3][1], blk[2][1], f)]; pm.line([p0, [p0[0] - 18, p0[1] + 26]], 3, seed + 345 + q, { col: I.inkSoft, op: 0.6 }); }
            if (u > 0.8) { const v = lin(lt, sa + 0.9, 0.9); for (let j = 0; j < 14; j++) { const a = Math.PI + (j / 13) * Math.PI; pf.dot(tx + Math.cos(a) * (60 + v * 220), ty - 40 + Math.sin(a) * (40 + v * 160), 9 * (1 - v) + 2, I.paperLight, seed + 360 + j, 1 - v); } }
            pm.line([blk[3], blk[2]], 4, seed + 334, { col: I.blue, op: 0.8 });
            if (u > 0.02 && u < 1) for (let j = 0; j < 10; j++) { const r = rngI(seed + j * 9); pf.dot(bx - bl / 2 - 10 - r() * 120, byy - 20 - r() * 70 - Math.sin(u * 3 + j) * 20, 5 + r() * 6, I.paperLight, seed + 340 + j, 0.9); }
          }
          if (tentS > 0.01) ridgeTent(pm, tx, tentY, tentS, ang, seed + 200, { glow, slit, sag, bury, t: lt, flap: mode === 'found' ? 1.4 : 1 });
          // hikers
          if (mode === 'pitch') {
            [[-0.27, 1], [0.0, -1], [0.27, -1]].forEach(([dx, f], i) => {
              const x = tx + dx * 900 * T.s + (i === 1 ? 0 : 0), y = sy(x) + 10;
              const dig = Math.sin(lt * 4 + i * 1.7);
              const m = man(pm, { x, y: y - 120 * 0.42, s: 0.42, torso: 180 - f * (18 + dig * 8), legs: [[-14, 4], [14, -4]], arms: [[f * (70 + dig * 30), f * 40], [f * (90 + dig * 30), f * 60]], face: f, pack: false }, seed + 400 + i * 50);
              const hd = m.hands[1]; pm.line([[hd[0], hd[1]], [hd[0] + f * 50, hd[1] + 80]], 5, seed + 440 + i); pm.fill(ell(hd[0] + f * 58, hd[1] + 92, 22, 14, seed + 445 + i), I.inkSoft, seed + 445 + i);
              if (dig > 0.6) pf.dot(hd[0] + f * 90, hd[1] + 40 - dig * 40, 8, I.paperLight, seed + 450 + i, 0.9);
            });
          }
          if (mode === 'flee' || mode === 'tracks') {
            const go = tc(cues, 'go', 0.2);
            paths.forEach((p, i) => {
              const st = go + i * (mode === 'tracks' ? 0.12 : 0.45), u = clamp01((lt - st) / (mode === 'tracks' ? Math.max(2, dur * 0.7) : Math.max(5, dur * 1.6)));
              const steps = Math.floor(u * 34);
              for (let j = 0; j < steps; j++) { const q = p((j + 0.5) / 34); pm.dot(q[0] + (j % 2 ? 6 : -6), q[1] + 6, 5, I.inkSoft, seed + 500 + i * 40 + j, 0.85); }
              if (mode === 'flee' && u > 0 && u < 1) {
                const q = p(u), wp = walkPose(lt * 1.4 + i * 0.3, -6, 0.9);
                man(pm, Object.assign({ x: q[0], y: q[1] - 240 * 0.2, s: 0.2, face: -1, lc: I.ink, cap: i % 3 !== 0 }, wp), seed + 800 + i * 50);
              }
            });
          }
          if (mode === 'found') {
            const pa = tc(cues, 'pt', dur * 0.4);
            [[-560, 1], [-420, 1], [380, -1]].forEach(([dx, f], i) => {
              const x = tx + dx, y = sy(x) + 4, br = Math.sin(lt * 1.6 + i) * 2;
              const pointing = i === 0 && lt > pa;
              man(pm, { x, y: y - 50, s: 0.42, face: f, torso: 180 + br, legs: [[-10, 0], [10, 0]], arms: pointing ? [[-20, -10], [f * 100, f * 95]] : [[-14 + br, -8], [14, 6]], capCol: I.inkSoft, worried: true }, seed + 600 + i * 50);
              pm.line([[x + f * 60, y], [x + f * 66, y - 170]], 4, seed + 690 + i, { col: I.inkSoft });
            });
          }
          if (P.wind || night) streaks(pf, W, H, t, Math.round(18 + 36 * (P.wind ?? 0.6)), seed + 900, { speed: 700, y0: 40, y1: H - 60, dir: -1, col: I.paperLight });
          if (mode === 'found') flakes(pf, W, H, t, 26, seed + 950, { col: I.inkSoft });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_inside
  SH.dp_inside = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'cut', day = mode === 'found';
      const sx = (P.x ?? 0.5) * W, y0 = 0.16 * H, y1 = 0.84 * H;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          // canvas wall (full frame), roof panels converge to a ridge at the top
          pb.fill([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], day ? I.paperLight : I.paperDark, seed + 1, { op: 1, smooth: false });
          for (let i = -6; i <= 6; i++) pb.line([[W / 2 + i * 40, -20], [W / 2 + i * 220, H + 20]], 4, seed + 10 + i, { col: I.inkSoft, op: 0.55 });
          pb.line([[-40, H * 0.08], [W / 2, -10], [W + 40, H * 0.08]], 8, seed + 30);
          // floor + light
          pb.fill([[-40, H * 0.86], [W + 40, H * 0.86], [W + 40, H + 40], [-40, H + 40]], I.inkSoft, seed + 32, { op: 0.55, smooth: false });
          if (!day) { const fl = 0.85 + 0.15 * Math.sin(lt * 8) * Math.sin(lt * 3.1); pb.fill(ell(W * 0.2, H * 0.8, W * 0.38 * fl, H * 0.4 * fl, seed + 34), I.gold, seed + 34, { op: 0.3 }); pb.dot(W * 0.2, H * 0.8, 26 * fl, I.gold, seed + 35, 0.95); pb.line([[W * 0.2 - 30, H * 0.86], [W * 0.2 - 22, H * 0.76], [W * 0.2 + 22, H * 0.76], [W * 0.2 + 30, H * 0.86]], 6, seed + 36, { closed: false }); }
          // slit
          const ca = tc(cues, 'cut', mode === 'cut' ? Math.max(0.6, dur * 0.3) : -10);
          const cp = mode === 'cut' ? sm(lin(lt, ca, 1.3)) : 1;
          const yk = lerp(y0, y1, cp);
          const open = mode === 'cut' ? sm(lin(lt, ca + 0.1, 1.0)) * 0.9 : (mode === 'out' ? 1 : 0.7);
          const fl = Math.sin(lt * 6.5) * 16 * (mode === 'cut' ? open : 1) + Math.sin(lt * 11) * 5;
          if (cp > 0.01) {
            const wd = 14 + open * 110;
            const hole = [[sx, y0], [sx - wd * 0.8 - fl, lerp(y0, yk, 0.5)], [sx - 6, yk], [sx + wd + fl * 0.7, lerp(y0, yk, 0.55)]];
            pm.fill(hole, day ? I.blue : I.ink, seed + 40, { op: day ? 0.5 : 0.97 });
            if (!day) for (let j = 0; j < 10; j++) { const r = rngI(seed + j * 3); const px = sx + (r() - 0.5) * wd * 1.1, py = lerp(y0 + 30, yk - 20, r()); if (py < yk) pm.dot(px, py, 2.5 + r() * 2, I.paperLight, seed + 60 + j, 0.4 + 0.5 * Math.abs(Math.sin(lt * 3 + j))); }
            pm.line([[sx, y0], [sx - wd * 0.8 - fl, lerp(y0, yk, 0.5)], [sx - 6, yk]], 6, seed + 44);
            pm.line([[sx, y0], [sx + wd + fl * 0.7, lerp(y0, yk, 0.55)], [sx - 6, yk]], 6, seed + 45);
            // snow blowing in through the slit
            if (!day && open > 0.05) for (let j = 0; j < Math.round(10 + open * 30); j++) { const r = rngI(seed * 11 + j), u = (lt * (0.6 + r() * 0.8) + r()) % 1; const px = sx + (r() - 0.5) * 60 + u * (W * 0.5) * (r() < 0.5 ? -1 : 1), py = lerp(y0, yk, r()) + u * 120; pf.line([[px, py], [px + 30, py + 6]], 4, seed + 100 + j, { col: I.paperLight, op: (1 - u) * 0.9 }); }
          }
          // knife + hand (mode cut)
          if (mode === 'cut') {
            // knife held from the right: tip in the canvas at the cut point, blade pointing left, hand + arm to the lower right
            const pre = y0 + 40 + Math.sin(lt * 3) * 6;
            const kx = sx + 4, ky = cp > 0.01 ? Math.max(pre, yk - 30) : pre;
            const back = cp > 0.01 ? 0 : 60 * (1 - sm(lin(lt, ca - 0.8, 0.8)));   // the blade pushes in before the cut
            const pk = punch(lt, ca, 0.5), bx = kx + back;
            pf.shape([[bx - 6, ky + 4], [bx + 60, ky - 34], [bx + 300, ky - 40], [bx + 300, ky + 14], [bx + 60, ky + 16]], I.paperLight, 6, seed + 200, { smooth: false });
            pf.line([[bx + 70, ky - 12], [bx + 290, ky - 14]], 3, seed + 203, { col: I.inkSoft });
            pf.line([[bx + 304, ky - 62], [bx + 304, ky + 38]], 14, seed + 207);
            pf.shape([[bx + 310, ky - 26], [bx + 520, ky - 30], [bx + 520, ky + 22], [bx + 310, ky + 18]], I.ink, 6, seed + 205, { smooth: false });
            // knitted sleeve from the right edge + mitten gripping the handle
            pf.shape([[bx + 470, ky - 56], [W + 80, ky - 70], [W + 80, ky + 74], [bx + 470, ky + 60]], I.blue, 7, seed + 213, { op: 0.95, smooth: false });
            for (let j = 0; j < 5; j++) pf.line([[bx + 500 + j * 30, ky - 54], [bx + 500 + j * 30, ky + 58]], 3, seed + 216 + j, { col: I.ink, op: 0.55 });
            const mw = 1 + 0.04 * pk;
            pf.shape([[bx + 350, ky - 58 * mw], [bx + 480, ky - 62 * mw], [bx + 490, ky + 60 * mw], [bx + 350, ky + 62 * mw], [bx + 330, ky + 10]], I.inkSoft, 7, seed + 210, { op: 0.95 });
            pf.shape([[bx + 380, ky - 58], [bx + 360, ky - 96], [bx + 400, ky - 104], [bx + 420, ky - 60]], I.inkSoft, 6, seed + 222, { op: 0.95 });
            pf.line([[bx + 360, ky - 20], [bx + 470, ky - 22]], 4, seed + 224, { col: I.paperLight, op: 0.7 });
          }
          if (mode === 'found') {
            // boots + folded coat on the floor
            const bx = W * 0.22, by = H * 0.9;
            [0, 1].forEach(i => { const x = bx + i * 120; pm.shape([[x - 40, by - 150], [x + 10, by - 150], [x + 14, by - 40], [x + 80, by - 30], [x + 84, by], [x - 44, by]], I.ink, 6, seed + 300 + i * 4, { op: 0.88, smooth: false }); pm.line([[x - 30, by - 110], [x + 4, by - 110]], 4, seed + 303 + i * 4, { col: I.paperLight }); });
            const cx = W * 0.72, cy = H * 0.9, bob = Math.sin(lt * 1.2) * 2;
            pm.shape([[cx - 200, cy], [cx - 180, cy - 90 + bob], [cx + 180, cy - 96 + bob], [cx + 210, cy]], I.blue, 6, seed + 320, { op: 0.85 });
            for (let j = 0; j < 4; j++) pm.dot(cx - 60 + j * 40, cy - 50 + bob, 7, I.paperLight, seed + 330 + j);
            pm.line([[cx - 170, cy - 40], [cx + 170, cy - 44]], 4, seed + 340, { col: I.ink });
          }
          if (mode === 'out') streaks(pf, W, H, t, 50, seed + 900, { speed: 1100, y0: H * 0.1, y1: H * 0.85, col: I.paperLight, dir: -1 });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_cedar
  SH.dp_cedar = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'fire', gy = (P.ground ?? 0.84) * H;
      const tx = (P.tree_x ?? (mode === 'return' ? 0.18 : 0.6)) * W;
      const th = mode === 'return' ? 0.62 * H : (P.tree_h ?? 0.7) * H;
      const flags = P.flags || [];
      function cedar(pm, lt) {
        const sw = Math.sin(lt * 1.1) * 6;
        pm.shape([[tx - 26, gy + 6], [tx - 14, gy - th], [tx + 14, gy - th], [tx + 30, gy + 6]], I.inkSoft, 6, seed + 1, { smooth: false });
        const r = rngI(seed + 3);
        for (let i = 0; i < 9; i++) {
          const u = i / 9, y = gy - th * (0.28 + u * 0.7), wd = th * (0.42 - u * 0.33) * (0.85 + r() * 0.3), s = i % 2 ? 1 : -1, dx = sw * (0.2 + u);
          pm.shape([[tx + dx, y - 20], [tx + s * wd + dx * 1.4, y + 30 + r() * 30], [tx + s * wd * 0.55 + dx, y + 60], [tx + dx, y + 40]], I.ink, 5, seed + 10 + i * 3, { op: 0.9 });
          pm.line([[tx + dx, y + 10], [tx + s * wd * 0.85 + dx * 1.3, y + 34]], 5, seed + 40 + i, { col: I.paperLight, op: 0.85 });
        }
      }
      const kids = mode === 'return' ? null : null;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const rr = rngI(seed + 50);
          // forest behind
          for (let i = 0; i < 10; i++) { const x = (i / 9) * W + (rr() - 0.5) * 120; if (Math.abs(x - tx) < 160) continue; conifer(pb, x, gy + 10, 200 + rr() * 160, seed + 100 + i * 40, { t: lt, sway: 2, op: 0.55, fill: I.inkSoft, lc: I.inkSoft }); }
          if (mode === 'return' || mode === 'calm') {
            // slope rising from the forest to the tent
            const x0 = W * 0.3, sl = [[x0, gy + 10], [W * 0.62, gy - H * 0.22], [W + 60, gy - H * 0.46]];
            pb.fill(sl.concat([[W + 60, gy + 80], [x0, gy + 80]]), I.paperLight, seed + 60, { op: 0.96 });
            pb.line(sl, 6, seed + 61);
            const tpx = W * 0.86, tpy = lerp(gy - H * 0.22, gy - H * 0.46, (tpx - W * 0.62) / (W * 0.38 + 60));
            ridgeTent(pm, tpx, tpy, 0.42, Math.atan2(-H * 0.24, W * 0.38), seed + 70, { slit: 1, t: lt });
            if (mode === 'return') {
              const go = tc(cues, 'go', 0.3);
              [0, 1, 2].forEach(i => {
                let u = clamp01((lt - go - i * 0.6) / Math.max(6, dur * 1.8)) * 0.55 + 0.08 + i * 0.05; if (P.away) u = 0.92 - u;
                const x = lerp(x0 + 40, tpx - 120, u), y = x < W * 0.62 ? lerp(gy + 10, gy - H * 0.22, (x - x0) / (W * 0.62 - x0)) : lerp(gy - H * 0.22, gy - H * 0.46, (x - W * 0.62) / (W * 0.38 + 60));
                const wp = walkPose(lt * 0.9 + i * 0.37, 20, 0.7);
                man(pm, Object.assign({ x, y: y - 240 * 0.24 + 4, s: 0.24, face: P.away ? -1 : 1, worried: true }, P.away ? walkPose(lt * 0.9 + i * 0.37, -8, 0.7) : wp), seed + 200 + i * 50);
              });
              streaks(pf, W, H, t, 40, seed + 600, { speed: 900, y0: H * 0.1, y1: gy, dir: -1, col: I.paperLight });
            }
          }
          cedar(pm, lt);
          if (mode === 'fire') {
            const fx = tx + 230, fy = gy + 6;
            pb.fill(ell(fx, fy - 40, 300, 170, seed + 300), I.gold, seed + 300, { op: 0.22 + 0.05 * Math.sin(lt * 9) });
            [[-50, -20], [50, -26], [0, 10]].forEach(([dx, a], i) => pm.line([[fx + dx - 30, fy], [fx + dx + 30, fy - 10]], 9, seed + 310 + i, { col: I.inkSoft }));
            for (let j = 0; j < 4; j++) { const f = Math.sin(lt * 9 + j * 1.9) * 0.2 + 0.9, hh = (110 - j * 18) * f; const ox = (j - 1.5) * 22; pm.shape([[fx + ox - 30, fy - 6], [fx + ox + Math.sin(lt * 7 + j) * 16, fy - hh], [fx + ox + 30, fy - 6]], j % 2 ? I.gold : I.red, 4, seed + 320 + j * 3, { op: 0.95, lc: I.red }); }
            for (let j = 0; j < 8; j++) { const u = (lt * 0.7 + j / 8) % 1; pf.dot(fx + Math.sin(u * 7 + j) * 40, fy - 120 - u * 320, 5 * (1 - u) + 1, I.gold, seed + 350 + j, 1 - u); }
            // two hikers crouched by the fire
            [[fx - 190, 1], [fx + 200, -1]].forEach(([x, f], i) => {
              const br = Math.sin(lt * 1.8 + i) * 4;
              man(pm, { x, y: gy - 70, s: 0.4, face: f, torso: 180 - f * (24 + br), legs: [[f * 70, -f * 60], [f * 80, -f * 50]], arms: [[f * (95 + br * 2), f * 90], [f * (105 + br * 2), f * 100]], worried: true }, seed + 400 + i * 50);
            });
            flakes(pf, W, H, t, 22, seed + 700);
          }
          if (mode === 'ash') {
            const fx = tx + 230, fy = gy + 6;
            pm.fill(ell(fx, fy - 6, 90, 22, seed + 500), I.ink, seed + 500, { op: 0.8 });
            for (let j = 0; j < 3; j++) { const u = (lt * 0.25 + j / 3) % 1; pm.line([[fx - 10 + j * 10, fy - 30 - u * 200], [fx + Math.sin(u * 5 + j) * 30, fy - 80 - u * 200]], 4, seed + 510 + j, { col: I.inkSoft, op: 0.6 * (1 - u) }); }
            flags.forEach((F, i) => {
              const a = tc(cues, F.at, 0.4 + i * 0.4); if (lt < a) return;
              const p = spring(lt, a, 0.5), x = F.x * W, y = F.y * H, w = Math.sin(lt * 5 + i) * 8;
              pm.line([[x, y], [x, y - 200 * p]], 7, seed + 520 + i * 3);
              pm.shape([[x, y - 200 * p], [x + 110 * p, y - 168 * p + w], [x, y - 136 * p]], I.red, 4, seed + 521 + i * 3, { smooth: false });
            });
            flakes(pf, W, H, t, 18, seed + 700, { col: I.inkSoft });
          }
          if (mode === 'calm') flakes(pf, W, H, t, 40, seed + 700);
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_ravine
  SH.dp_ravine = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const gy = (P.ground ?? 0.42) * H, bed = 0.92 * H;
      const fa = P.find ?? 'find';
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const lb = [[-60, gy], [W * 0.26, gy + 10], [W * 0.38, bed - 40], [W * 0.46, bed]], rb = [[W * 0.56, bed], [W * 0.64, bed - 60], [W * 0.74, gy + 20], [W + 60, gy]];
          // earth banks
          pb.fill(lb.concat([[W * 0.46, H + 60], [-60, H + 60]]), I.paperDark, seed + 1, { op: 1 });
          pb.fill(rb.concat([[W + 60, H + 60], [W * 0.56, H + 60]]), I.paperDark, seed + 2, { op: 1 });
          for (let i = 0; i < 14; i++) { const r = rngI(seed + i), x = r() * W, y = gy + 60 + r() * (H - gy); pb.line([[x, y], [x + 60, y + 6]], 3, seed + 10 + i, { col: I.inkSoft, op: 0.5 }); }
          // layered snow filling the ravine
          const layers = 6;
          for (let l = 0; l < layers; l++) {
            const yTop = lerp(gy + 30, bed - 30, l / layers), yBot = lerp(gy + 30, bed - 30, (l + 1) / layers);
            const xl = u => lerp(W * 0.26, W * 0.44, u), xr = u => lerp(W * 0.74, W * 0.57, u);
            const ua = (yTop - gy) / (bed - gy), ub = (yBot - gy) / (bed - gy);
            pm.fill([[xl(ua), yTop], [xr(ua), yTop], [xr(ub), yBot], [xl(ub), yBot]], l % 2 ? I.paperLight : I.paper, seed + 30 + l, { op: 0.97 });
            pm.line([[xl(ua), yTop], [W / 2, yTop + 8 + Math.sin(l) * 6], [xr(ua), yTop]], 3, seed + 40 + l, { col: I.blue, op: 0.6 });
          }
          pm.line([[W * 0.25, gy + 26], [W / 2, gy + 10], [W * 0.75, gy + 26]], 6, seed + 50);
          // stream under the snow
          const sp = lt * 90;
          for (let j = 0; j < 3; j++) pm.line(Array.from({ length: 8 }, (_, i) => [W * 0.45 + i * 22, bed - 10 + Math.sin(i * 0.9 + sp * 0.05 + j) * 5 - j * 8]), 4, seed + 60 + j, { col: I.blue });
          // drips from the lip
          for (let j = 0; j < 6; j++) { const u = (lt * 0.6 + j / 6) % 1, x = W * (0.3 + j * 0.08); pf.dot(x, gy + 30 + u * 200, 5, I.blue, seed + 70 + j, 1 - u); }
          // searchers with probes
          const findAt = tc(cues, fa, dur * 0.55);
          [[W * 0.14, 1], [W * 0.86, -1], [W * 0.22, 1]].forEach(([x, f], i) => {
            const y = gy + (i === 2 ? 4 : 0), push = Math.sin(lt * 2.2 + i * 1.3) * 0.5 + 0.5;
            const m = man(pm, { x, y: y - 50, s: 0.4, face: f, torso: 180 - f * 14, legs: [[-12, 2], [12, -2]], arms: [[f * 60, f * 90], [f * 70, f * 100]], capCol: I.inkSoft }, seed + 100 + i * 50);
            const hd = m.hands[1], L = 520, ang = f > 0 ? 0.5 : Math.PI - 0.5;
            const reach = 120 + push * 80 + (i === 0 && lt > findAt ? 60 : 0);
            pm.line([[hd[0] - Math.cos(ang) * 60, hd[1] - Math.sin(ang) * 60], [hd[0] + Math.cos(ang) * reach * 2.2, hd[1] + Math.sin(ang) * reach * 2.2]], 6, seed + 160 + i, { col: I.ink });
          });
          if (lt > findAt) { const p = spring(lt, findAt, 0.5); pf.fill(ell(W * 0.44, gy + 320, 40 * p, 40 * p, seed + 190), I.red, seed + 190, { op: 0.85 }); }
          flakes(pf, W, gy + 30, t, 14, seed + 800, { col: I.inkSoft });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_ski
  SH.dp_ski = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'march', gy = (P.ground ?? 0.84) * H, n = P.n ?? 9;
      const yi = P.yudin ?? 0;
      const lead = P.lead;
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          const speed = P.speed ?? 60, scroll = mode === 'march' ? lt * speed : 0;
          // trees: far (slow) and near (fast)
          const r = rngI(seed + 5);
          for (let i = 0; i < 12; i++) { const base = r() * (W + 400), x = ((base - scroll * 0.4) % (W + 400) + W + 400) % (W + 400) - 200; conifer(pb, x, gy - 30, 220 + r() * 140, seed + 20 + i * 40, { t: lt, sway: 2, op: 0.5, fill: I.inkSoft, lc: I.inkSoft }); }
          for (let i = 0; i < 3; i++) { const base = r() * (W + 800), x = ((base - scroll * 1.6) % (W + 800) + W + 800) % (W + 800) - 400; conifer(pf, x, H + 300, 400 + r() * 60, seed + 600 + i * 40, { t: lt, sway: 3, op: 0.92 }); }
          // ski tracks
          pm.line([[-40, gy + 8], [W + 40, gy + 8]], 3, seed + 300, { col: I.inkSoft, op: 0.7 });
          pm.line([[-40, gy + 22], [W + 40, gy + 22]], 3, seed + 301, { col: I.inkSoft, op: 0.7 });
          const bye = tc(cues, 'bye', dur * 0.35);
          for (let i = 0; i < n; i++) {
            let x = W * (0.1 + i * (0.8 / Math.max(1, n - 1))), f = 1, ph = lt * 1.1 + i * 0.37;
            if (mode === 'goodbye') {
              if (i === yi) { x = W * (P.yudin_x ?? 0.3) - Math.max(0, lt - bye - 1.6) * 40; f = -1; }
              else if (P.alone) { if (i > 3) continue; x = W * 0.82 + i * W * 0.05 + lt * 30; }
              else x = W * 0.5 + (i - (i > yi ? 1 : 0)) * W * 0.06 + lt * 70;
              if (x > W + 120 || x < -160) continue;
            }
            const wp = walkPose(ph, 10, 0.7);
            if (mode === 'goodbye' && i === yi && lt > bye - 0.4 && lt < bye + 2.2) wp.arms = [[-20, -10], [f * 160 + Math.sin(lt * 9) * 20, f * 170]];
            const ss = mode === 'goodbye' ? (i === yi ? (P.yudin_s ?? 0.55) : (P.alone ? 0.22 : 0.32)) : 0.36;
            const m = man(pm, Object.assign({ x, y: gy - 240 * ss, s: ss, face: f, pack: true, capCol: i % 3 === 1 ? I.inkSoft : I.blue, back: false }, wp), seed + 400 + i * 50);
            skis(pm, x, gy + 2, ss * 1.3, seed + 380 + i, f);
            m.hands.forEach((hd, j) => pm.line([hd, [hd[0] - f * 30, gy + 4]], 3, seed + 470 + i * 2 + j, { col: I.inkSoft }));
          }
          flakes(pf, W, H, t, 20, seed + 900, { col: I.paperLight });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_map
  SH.dp_map = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const route = (P.route || [[0.2, 0.86], [0.3, 0.7], [0.4, 0.58], [0.5, 0.46], [0.6, 0.38]]).map(([x, y]) => [x * W, y * H]);
      const goal = (P.goal || [[0.6, 0.38], [0.64, 0.2]]).map(([x, y]) => [x * W, y * H]);
      const places = P.places || [];
      const tx = places.map((pl, i) => { const t = el(B.top, 'text', { 'font-family': pl.kind === 'peak' ? FR : INK_FONT, 'font-weight': pl.kind === 'peak' ? 800 : 400, 'font-size': pl.size || 56, 'text-anchor': pl.anchor || 'start', fill: pl.color === 'red' ? I.red : I.ink, style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 10px` }); t.textContent = pl.name; return t; });
      const r0 = rngI(seed + 9);
      const peaks = Array.from({ length: 26 }, (_, i) => { const u = i / 25; return [W * (0.52 + Math.sin(u * 5) * 0.06 + (r0() - 0.5) * 0.08), H * (0.06 + u * 0.9), 40 + r0() * 50]; });
      const polyLen = pts => pts.reduce((s, p, i) => i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0, 0);
      const partial = (pts, u) => { const L = polyLen(pts) * u, out = [pts[0]]; let acc = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + d >= L) { const k = (L - acc) / d; out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); return out; } acc += d; out.push(pts[i]); } return out; };
      const dashes = (pm, pts, col, k) => { const L = polyLen(pts), n = Math.floor(L / 46); for (let i = 0; i < n; i++) { const a = partial(pts, i / Math.max(1, L / 46)), b = partial(pts, (i + 0.55) / Math.max(1, L / 46)); pm.line([a[a.length - 1], b[b.length - 1]], 9, k + i, { col, smooth: false }); } };
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          // frame
          pb.line([[40, 40], [W - 40, 40], [W - 40, H - 40], [40, H - 40]], 8, seed + 1, { closed: true, smooth: false });
          pb.line([[62, 62], [W - 62, 62], [W - 62, H - 62], [62, H - 62]], 3, seed + 2, { closed: true, smooth: false, col: I.inkSoft });
          // rivers
          [[[0.06, 0.3], [0.2, 0.44], [0.26, 0.62], [0.2, 0.8], [0.3, 0.95]], [[0.3, 0.1], [0.38, 0.3], [0.33, 0.5], [0.42, 0.72], [0.4, 0.95]], [[0.92, 0.2], [0.84, 0.44], [0.9, 0.7], [0.82, 0.95]]].forEach((rv, i) => {
            const pts = rv.map(([x, y]) => [x * W, y * H]).map((p, j) => [p[0] + Math.sin(lt * 1.5 + j + i) * 2, p[1]]);
            pb.line(pts, 5, seed + 10 + i, { col: I.blue, op: 0.8 });
          });
          // mountain chain
          peaks.forEach(([x, y, h], i) => { pb.shape([[x - h * 0.8, y + h * 0.3], [x, y - h * 0.7], [x + h * 0.8, y + h * 0.3]], I.paperLight, 4, seed + 30 + i * 2, { smooth: false, lc: I.inkSoft }); pb.line([[x, y - h * 0.7], [x + h * 0.3, y + h * 0.3]], 3, seed + 90 + i, { col: I.inkSoft }); });
          // forest dots
          for (let i = 0; i < 40; i++) { const r = rngI(seed * 3 + i); const x = W * (0.1 + r() * 0.36), y = H * (0.5 + r() * 0.42); pb.line([[x - 10, y + 10], [x, y - 14], [x + 10, y + 10]], 3, seed + 150 + i, { col: I.green, op: 0.8, smooth: false }); }
          // route
          const ra = tc(cues, 'route', 0.4), rp = sm(lin(lt, ra, Math.max(2, dur * 0.5)));
          if (rp > 0.01) dashes(pm, partial(route, rp), I.ink, seed + 200);
          const ga = tc(cues, 'goal', null);
          if (ga != null && lt > ga) dashes(pm, partial(goal, sm(lin(lt, ga, 1.4))), I.red, seed + 260);
          const head = partial(route, rp).slice(-1)[0];
          if (rp > 0.01) { const bob = Math.sin(lt * 6) * 5; pm.dot(head[0], head[1] + bob, 16, I.red, seed + 290); }
          places.forEach((pl, i) => {
            const a = tc(cues, pl.at, 0.2 + i * 0.3), x = pl.x * W, y = pl.y * H, p = spring(lt, a, 0.5), show = lt >= a;
            tx[i].style.display = show ? '' : 'none';
            if (!show) return;
            if (pl.kind === 'peak') { pm.shape([[x - 50 * p, y + 20], [x, y - 70 * p], [x + 50 * p, y + 20]], pl.color === 'red' ? I.red : I.paperDark, 6, seed + 300 + i * 3, { smooth: false }); }
            else if (pl.kind === 'camp') { pm.shape([[x - 40 * p, y + 14], [x, y - 40 * p], [x + 40 * p, y + 14]], I.gold, 5, seed + 300 + i * 3, { smooth: false }); }
            else pm.shape(ell(x, y, 14 * p, 14 * p, seed + 300 + i * 3), I.ink, 4, seed + 300 + i * 3);
            tx[i].setAttribute('transform', `translate(${F1(x + (pl.dx ?? 40))} ${F1(y + (pl.dy ?? 16))}) rotate(-2) scale(${p.toFixed(3)})`);
          });
          // compass
          const cx = W * 0.88, cy = H * 0.8, sp = Math.sin(lt * 0.8) * 0.06;
          pf.shape([[cx, cy - 90], [cx + 22, cy], [cx, cy + 90], [cx - 22, cy]].map(p => rot(p[0], p[1], cx, cy, sp)), I.paperLight, 5, seed + 400, { smooth: false });
          pf.fill([[cx, cy - 90], [cx + 22, cy], [cx - 22, cy]].map(p => rot(p[0], p[1], cx, cy, sp)), I.red, seed + 402, { smooth: false });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_desk
  SH.dp_desk = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'stamp', gy = (P.ground ?? 0.62) * H;
      const lines = P.lines || [];
      const big = mode === 'report';
      const px = big ? W * 0.3 : W * 0.3, pw = big ? W * 0.46 : W * 0.4, py = big ? H * 0.12 : gy - 440, ph = big ? H * 0.8 : 440;
      const lineT = lines.map((s, i) => { const t = el(B.top, 'text', { 'font-family': "'Courier New', Courier, monospace", 'font-weight': 700, 'font-size': big ? 62 : 46, fill: I.ink }); t.textContent = ''; return t; });
      const stT = el(B.top, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 74, 'text-anchor': 'middle', fill: I.red, 'dominant-baseline': 'central' });
      stT.textContent = (P.stamp || '').toLocaleUpperCase('en-US');
      const stBox = el(B.top, 'path', { fill: I.red });
      const cast = (P.cast || []).map((c, i) => rigOf(B.rigs, c, seed * 7 + i * 13));
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          // hanging lamp, swinging slowly, light cone
          const sw = Math.sin(lt * 0.9) * 0.05, lx = W * 0.5 + Math.sin(sw) * 300, ly = H * 0.12;
          if (!big) {
            pb.line([[W * 0.5, -10], [lx, ly]], 4, seed + 1);
            pb.fill([[lx - 60, ly + 50], [lx + 60, ly + 50], [lx + W * 0.36, gy + 40], [lx - W * 0.36, gy + 40]], I.gold, seed + 2, { op: 0.16 });
            pb.shape([[lx - 70, ly + 54], [lx - 30, ly], [lx + 30, ly], [lx + 70, ly + 54]], I.ink, 5, seed + 3, { smooth: false });
            pb.dot(lx, ly + 58, 14, I.gold, seed + 4);
            // desk
            pm.shape([[-40, gy], [W + 40, gy], [W + 40, gy + 50], [-40, gy + 50]], I.paperDark, 7, seed + 10, { smooth: false });
            pm.fill([[-40, gy + 50], [W + 40, gy + 50], [W + 40, H + 40], [-40, H + 40]], I.inkSoft, seed + 12, { op: 0.75, smooth: false });
            for (let i = 0; i < 6; i++) pm.line([[-40, gy + 80 + i * 50], [W + 40, gy + 84 + i * 50]], 3, seed + 14 + i, { col: I.ink, op: 0.4 });
          }
          if (mode === 'stamp' || mode === 'report') {
            // folder + page
            if (!big) pm.shape([[px - 30, py + 30], [px + pw + 30, py + 30], [px + pw + 40, gy + 6], [px - 40, gy + 6]], I.gold, 6, seed + 20, { op: 0.85, smooth: false });
            const pp = big ? [[px, py], [px + pw, py + 6], [px + pw - 4, py + ph], [px + 4, py + ph - 4]] : [[px, py], [px + pw, py + 4], [px + pw + 6, gy - 4], [px - 6, gy - 4]];
            pm.shape(pp, I.paperLight, 6, seed + 22, { smooth: false });
            const lh = big ? 120 : 64;
            lines.forEach((s, i) => {
              const a = tc(cues, (P.line_at || [])[i], 0.3 + i * 0.9), n = Math.floor(clamp01((lt - a) / Math.max(0.6, s.length * 0.06)) * s.length);
              lineT[i].textContent = s.slice(0, n);
              lineT[i].setAttribute('x', F1(px + (big ? 70 : 40))); lineT[i].setAttribute('y', F1(py + (big ? 150 : 80) + i * lh));
              if (i === lines.length - 1 && big) { const ha = tc(cues, 'hit', a + 1.5); if (lt > ha) { const u = prog(lt, ha, 0.5); pf.line([[px + 60, py + 176 + i * lh], [px + 60 + (pw - 140) * u, py + 170 + i * lh]], 12, seed + 40, { col: I.red }); } }
            });
            if (!big) for (let i = lines.length; i < 6; i++) pm.line([[px + 40, py + 60 + i * 64], [px + pw - 60 - (i % 2) * 80, py + 62 + i * 64]], 5, seed + 50 + i, { col: I.inkSoft, op: 0.6 });
          }
          if (mode === 'stamp') {
            const sa = tc(cues, 'stamp', dur * 0.5), down = lt >= sa;
            const lift = down ? sm(lin(lt, sa + 0.3, 0.6)) * 1.6 : 1 - sm(lin(lt, sa - 0.8, 0.8));
            const sx = px + pw * 0.52 + lift * 620, syy = py + 300 - lift * 320;
            const pk = punch(lt, sa, 0.5);
            stT.style.display = down ? '' : 'none'; stBox.style.display = down ? '' : 'none';
            if (down) {
              const s = lerp(1.25, 1, clamp01((lt - sa) * 5)) * (1 + 0.06 * pk);
              stT.setAttribute('transform', `translate(${F1(px + pw * 0.52)} ${F1(py + 300)}) rotate(-6) scale(${s.toFixed(3)})`);
              let w = 600; try { w = stT.getComputedTextLength(); } catch (e) {}
              const bx = -w / 2 - 26, by = -56, bw = w + 52, bh = 112;
              const d = inkPath([[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]], { w: 9, seed: seed + 60, t, amp: 1.5, closed: true, smooth: false });
              stBox.setAttribute('d', d); stBox.setAttribute('transform', stT.getAttribute('transform'));
            }
            // stamp + hand
            pf.shape([[sx - 110, syy - 20], [sx + 110, syy - 20], [sx + 110, syy + 20], [sx - 110, syy + 20]], I.red, 6, seed + 70, { smooth: false });
            pf.shape([[sx - 24, syy - 20], [sx + 24, syy - 20], [sx + 18, syy - 80], [sx - 18, syy - 80]], I.paperDark, 6, seed + 72, { smooth: false });
            pf.shape(ell(sx, syy - 105, 46, 34, seed + 74), I.paperDark, 6, seed + 74);
            pf.line([[sx + 40, syy - 105], [sx + 300, syy - 120], [W + 60, syy - 125]], 22, seed + 76);
          }
          if (mode === 'phone') {
            const ra = tc(cues, 'ring', 0.2), ring = lt > ra ? Math.sin((lt - ra) * 40) * (Math.sin((lt - ra) * 3) > 0 ? 1 : 0.15) : 0;
            const cx = W * (P.phone_x ?? 0.4), cy = gy - 10;
            pm.shape([[cx - 170, cy], [cx + 170, cy], [cx + 120, cy - 150], [cx - 120, cy - 150]].map(p => [p[0] + ring * 5, p[1]]), I.ink, 6, seed + 80, { op: 0.9, smooth: false });
            pm.shape(ell(cx + ring * 5, cy - 80, 70, 50, seed + 82), I.paperLight, 5, seed + 82);
            for (let j = 0; j < 8; j++) { const a = j / 8 * 6.283 + lt * 0.2; pm.dot(cx + ring * 5 + Math.cos(a) * 45, cy - 80 + Math.sin(a) * 32, 7, I.ink, seed + 84 + j); }
            const hy = cy - 170 - Math.abs(ring) * 14;
            pm.shape([[cx - 210, hy + 10], [cx - 160, hy - 30], [cx + 160, hy - 30], [cx + 210, hy + 10], [cx + 150, hy + 20], [cx - 150, hy + 20]], I.ink, 6, seed + 92, { op: 0.95 });
            pm.line([[cx + 170, cy - 20], [cx + 260, cy + 10], [cx + 300, cy - 30]], 5, seed + 94);
            if (lt > ra) for (let j = 0; j < 3; j++) { const u = ((lt - ra) * 0.8 + j / 3) % 1, rr = 260 + u * 220; [-1, 1].forEach(s => pf.line([[cx + s * rr * 0.9, hy - rr * 0.35], [cx + s * rr, hy], [cx + s * rr * 0.9, hy + rr * 0.35]], 7, seed + 100 + j * 2 + (s > 0), { col: I.red, op: 1 - u })); }
          }
          if (mode === 'duo') {
            const cx = W * 0.5, cy = gy - 8;
            pm.shape([[cx - 200, cy], [cx + 200, cy], [cx + 230, cy + 20], [cx - 230, cy + 20]], I.ink, 5, seed + 120, { smooth: false });
            pm.shape([[cx - 190, cy], [cx + 190, cy], [cx + 170, cy - 250], [cx - 170, cy - 250]], I.paperLight, 7, seed + 122, { smooth: false });
            // slope diagram on the screen, a slab blinking
            pm.line([[cx - 150, cy - 30], [cx + 150, cy - 210]], 5, seed + 124);
            const b = 0.5 + 0.5 * Math.sin(lt * 4);
            pm.fill([[cx + 10, cy - 114], [cx + 110, cy - 174], [cx + 120, cy - 150], [cx + 20, cy - 90]], I.blue, seed + 126, { op: 0.4 + 0.5 * b, smooth: false });
            pm.shape([[cx - 70, cy - 58], [cx - 20, cy - 88], [cx - 6, cy - 64], [cx - 56, cy - 36]], I.paperDark, 4, seed + 128, { smooth: false });
          }
          cast.forEach(R => rigUpdate(R, lt, t, cues, W, H));
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ dp_slab
  SH.dp_slab = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'cut';
      // slope surface from lower-left to upper-right
      const A = [0.02 * W, 0.76 * H], Bp = [0.98 * W, 0.18 * H];
      const sy = x => lerp(A[1], Bp[1], (x - A[0]) / (Bp[0] - A[0]));
      const ang = Math.atan2(Bp[1] - A[1], Bp[0] - A[0]);
      const tx = W * (P.tent_x ?? (mode === 'doubt' ? 0.66 : 0.46)), ty = sy(tx);
      const angT = el(B.top, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 84, fill: I.red, 'text-anchor': 'start', style: `paint-order: stroke; stroke: ${I.paperLight}; stroke-width: 12px` });
      angT.textContent = P.angle || '';
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          // ground (earth) under layered snow
          const off = 120;   // snow depth (px, perpendicular-ish)
          pb.fill([[A[0] - 80, sy(A[0] - 80) + off], [Bp[0] + 80, sy(Bp[0] + 80) + off], [W + 80, H + 80], [-80, H + 80]], I.paperDark, seed + 1, { op: 1, smooth: false });
          for (let i = 0; i < 18; i++) { const r = rngI(seed + i), x = r() * W, y = sy(x) + off + 40 + r() * 300; if (y < H) pb.line([[x, y], [x + 50, y - 50 * Math.tan(-ang)]], 3, seed + 10 + i, { col: I.inkSoft, op: 0.5 }); }
          // snow layers
          for (let l = 0; l < 3; l++) {
            const d0 = l * off / 3, d1 = (l + 1) * off / 3;
            pm.fill([[-80, sy(-80) + d0], [W + 80, sy(W + 80) + d0], [W + 80, sy(W + 80) + d1], [-80, sy(-80) + d1]], l % 2 ? I.paper : I.paperLight, seed + 30 + l, { op: 1, smooth: false });
            pm.line([[-80, sy(-80) + d1], [W + 80, sy(W + 80) + d1]], 3, seed + 40 + l, { col: l === 2 ? I.ink : I.blue, op: 0.7 });
          }
          pm.line([[-80, sy(-80)], [W + 80, sy(W + 80)]], 6, seed + 50);
          // the cut (notch) + tent
          const ca = tc(cues, 'cut', mode === 'cut' ? dur * 0.3 : -10), cp = sm(lin(lt, ca, 0.9));
          const nl = 300, nd = 70 * cp;
          if (cp > 0.01) pm.fill([[tx - nl / 2, sy(tx - nl / 2)], [tx + nl / 2, sy(tx + nl / 2)], [tx + nl / 2, sy(tx + nl / 2) + nd], [tx - nl / 2, sy(tx - nl / 2) + nd * 0.2]], I.ink, seed + 60, { op: 0.75, smooth: false });
          const sa = tc(cues, 'slab', mode === 'release' ? dur * 0.5 : 1e9), su = sm(lin(lt, sa, 1.2));
          const tentY = sy(tx) + nd * 0.6;
          ridgeTent(pm, tx, tentY, 0.55, 0, seed + 70, { sag: su * 0.7, t: lt });
          if (mode === 'cut' && cp > 0.3) {
            [-1, 0, 1].forEach((k, i) => { const x = tx + k * 90 + 40, y = sy(x) - 80 - Math.sin(lt * 4 + i) * 10; pf.line([[x, y], [x, y + 60]], 8, seed + 80 + i, { col: I.red }); pf.line([[x - 16, y + 40], [x, y + 64], [x + 16, y + 40]], 8, seed + 84 + i, { col: I.red, smooth: false }); });
          }
          // wind + drift wedge
          if (mode === 'wind' || mode === 'release' || mode === 'sim') {
            const la = tc(cues, 'load', mode === 'wind' ? dur * 0.2 : -10), lp = mode === 'wind' ? clamp01((lt - la) / Math.max(3, dur * 0.7)) : 1;
            const x0 = tx + 160, x1 = tx + 620, th = 90 * lp;
            const wedge = [[x0, sy(x0)], [x1, sy(x1)], [x1 - 20, sy(x1) - th], [x0 + 60, sy(x0 + 60) - th * 0.6]];
            const slide = su * (x0 - tx + 60);
            const ww = wedge.map(([x, y]) => [x - slide * Math.cos(ang), y - slide * Math.sin(ang) + su * 30]);
            if (mode !== 'sim') { pm.shape(ww, I.paperLight, 6, seed + 100, { smooth: false }); pm.line([ww[3], ww[2]], 4, seed + 102, { col: I.blue }); }
            if (mode === 'wind') for (let j = 0; j < 6; j++) { const u = (lt * 0.5 + j / 6) % 1, x = lerp(W * 0.98, x0, u), y = sy(x) - 140 - j * 26; pf.line([[x + 120, y], [x, y + 10]], 7, seed + 110 + j, { col: I.blue, op: 1 - u * 0.6 }); pf.line([[x + 20, y - 8], [x, y + 10], [x + 24, y + 22]], 7, seed + 120 + j, { col: I.blue, op: 1 - u * 0.6, smooth: false }); }
            if (mode === 'wind') for (let j = 0; j < 14; j++) { const r = rngI(seed + j * 5), u = (lt * (0.4 + r() * 0.4) + r()) % 1, x = lerp(W, x0 + 40, u); pf.dot(x, sy(x) - 30 - r() * 120 * (1 - u), 6, I.paperLight, seed + 130 + j, 0.95); }
            if (mode === 'release') {
              const cra = tc(cues, 'crack', dur * 0.25);
              if (lt > cra && su < 0.05) { const cp2 = prog(lt, cra, 0.5); pm.line([[x1 - 10, sy(x1) - th], [x1 - 24, sy(x1) - th * 0.5], [x1 - 8, sy(x1) - th * (1 - cp2)]], 7, seed + 140, { col: I.red }); }
              if (su > 0.02 && su < 1) for (let j = 0; j < 12; j++) { const r = rngI(seed + j * 7); pf.dot(ww[0][0] - r() * 120, ww[0][1] - 30 - r() * 80, 6 + r() * 6, I.paperLight, seed + 150 + j, 0.9); }
            }
            if (mode === 'sim') {
              // particle slab hitting a crash-test dummy outline
              const ma = tc(cues, 'match', dur * 0.6), hp = sm(lin(lt, 0.3, Math.max(1.5, dur * 0.4)));
              for (let a = 0; a < 7; a++) for (let b = 0; b < 3; b++) {
                const x = lerp(x1 - 40, tx + 120, hp) + a * 34 - b * 4, y = sy(x) - 20 - b * 30 + Math.sin(lt * 6 + a + b) * 3;
                pm.dot(x, y, 11, I.blue, seed + 200 + a * 3 + b, 0.85);
              }
              const dx = tx - 20, dy = sy(tx) - 6;
              man(pm, { x: dx, y: dy - 30, s: 0.5, torso: 270 - 14, legs: [[-80, -86], [-76, -92]], arms: [[-60, -70], [-50, -80]], face: -1, cap: false, back: true, lc: I.inkSoft }, seed + 260);
              if (lt > ma) { const p = spring(lt, ma, 0.5); const cx0 = tx - 60, cy0 = sy(tx) - 300; pf.line([[cx0 - 50 * p, cy0], [cx0 - 10 * p, cy0 + 44 * p], [cx0 + 70 * p, cy0 - 60 * p]], 18, seed + 280, { col: I.green, smooth: false }); }
            }
          }
          if (mode === 'doubt') {
            const ox = W * 0.2, oy = sy(ox), ap = sm(lin(lt, 0.3, 1.4)), R = 480;
            pm.line([[ox, oy], [ox + R * 1.3, oy]], 5, seed + 300, { col: I.inkSoft });
            const arc = Array.from({ length: 12 }, (_, i) => { const a = ang * (i / 11) * ap; return [ox + Math.cos(a) * R, oy + Math.sin(a) * R]; });
            pm.line(arc, 8, seed + 302, { col: I.red });
            const pk = punch(lt, tc(cues, 'hit', 1.4), 0.6);
            angT.setAttribute('transform', `translate(${F1(W * 0.36)} ${F1(H * 0.4)}) scale(${(ap * (1 + 0.1 * pk)).toFixed(3)})`);
            flakes(pf, W, H, t, 16, seed + 900, { col: I.inkSoft });
          } else angT.style.display = 'none';
          B.end(lt, t, cues);
        },
      };
    },
  };
  // ================================================================ dp_board
  // SHOTS.dp_board — pinned evidence board filling the frame: a Fraunces title and 2-3 cards, each with a moving ink icon
  //   (rocket | lights | waves | slab | wind | family | check) and a hand-written label; cards pop in on their cue; optional
  //   mark ("check" | "x" | "?") and a pill note at the bottom.
  //   P: {title, cards: [{icon, text, at, mark}], pill: {text, color, at}}
  SH.dp_board = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const cards = (P.cards || []).slice(0, 3), n = Math.max(1, cards.length);
      const ttl = el(B.top, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 96, 'text-anchor': 'middle', fill: I.ink });
      ttl.textContent = P.title || '';
      const txt = cards.map(c => { const e = el(B.top, 'text', { 'font-family': INK_FONT, 'font-size': String(c.text || '').length > 15 ? 50 : 64, 'text-anchor': 'middle', fill: I.ink }); e.textContent = c.text || ''; return e; });
      const pill = P.pill ? el(B.top, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': 60, 'text-anchor': 'middle', fill: I.paperLight }) : null;
      if (pill) pill.textContent = P.pill.text;
      const cw = Math.min(520, (W * 0.86) / n - 40), ch = H * 0.42, y0 = H * 0.24;
      function icon(pt, kind, cx, cy, s, lt, k) {
        if (kind === 'rocket') {
          const b = Math.sin(lt * 2) * 6;
          pt.shape([[cx, cy - 120 * s + b], [cx + 34 * s, cy - 50 * s + b], [cx + 34 * s, cy + 60 * s + b], [cx - 34 * s, cy + 60 * s + b], [cx - 34 * s, cy - 50 * s + b]], I.paperLight, 6, k, { smooth: false });
          pt.shape([[cx - 34 * s, cy + 20 * s + b], [cx - 70 * s, cy + 70 * s + b], [cx - 34 * s, cy + 60 * s + b]], I.red, 5, k + 3, { smooth: false });
          pt.shape([[cx + 34 * s, cy + 20 * s + b], [cx + 70 * s, cy + 70 * s + b], [cx + 34 * s, cy + 60 * s + b]], I.red, 5, k + 5, { smooth: false });
          const f = 0.8 + 0.3 * Math.sin(lt * 14);
          pt.shape([[cx - 22 * s, cy + 64 * s + b], [cx, cy + (64 + 70 * f) * s + b], [cx + 22 * s, cy + 64 * s + b]], I.gold, 4, k + 7, { smooth: false, lc: I.red });
          pt.shape(ell(cx, cy - 30 * s + b, 14 * s, 14 * s, k + 9), I.blue, 4, k + 9);
        } else if (kind === 'lights') {
          for (let j = 0; j < 3; j++) { const on = 0.5 + 0.5 * Math.sin(lt * 3 + j * 2.1), x = cx + (j - 1) * 80 * s, y = cy - 40 * s + (j % 2) * 40 * s;
            pt.fill(ell(x, y, 46 * s, 46 * s, k + j * 3), I.gold, k + j * 3, { op: 0.25 + 0.35 * on }); pt.shape(ell(x, y, 20 * s, 20 * s, k + j * 3 + 1), on > 0.5 ? I.gold : I.paperLight, 4, k + j * 3 + 1); }
          pt.line([[cx - 140 * s, cy + 80 * s], [cx - 40 * s, cy + 66 * s], [cx + 60 * s, cy + 84 * s], [cx + 140 * s, cy + 70 * s]], 5, k + 20);
        } else if (kind === 'waves') {
          pt.shape([[cx - 100 * s, cy - 30 * s], [cx - 60 * s, cy - 30 * s], [cx - 20 * s, cy - 70 * s], [cx - 20 * s, cy + 70 * s], [cx - 60 * s, cy + 30 * s], [cx - 100 * s, cy + 30 * s]], I.ink, 4, k, { smooth: false, op: 0.9 });
          for (let j = 0; j < 3; j++) { const u = (lt * 0.7 + j / 3) % 1, r = (40 + u * 110) * s; pt.line([[cx + r * 0.5, cy - r * 0.9], [cx + r, cy], [cx + r * 0.5, cy + r * 0.9]], 6, k + 4 + j, { col: I.blue, op: 1 - u }); }
        } else if (kind === 'slab') {
          pt.line([[cx - 150 * s, cy + 80 * s], [cx + 150 * s, cy - 60 * s]], 6, k);
          const u = (Math.sin(lt * 1.2) * 0.5 + 0.5) * 50 * s;
          pt.shape([[cx + 30 * s - u, cy - 4 * s + u * 0.47], [cx + 130 * s - u, cy - 52 * s + u * 0.47], [cx + 136 * s - u, cy - 86 * s + u * 0.47], [cx + 36 * s - u, cy - 38 * s + u * 0.47]], I.paperLight, 5, k + 2, { smooth: false, lc: I.blue });
          pt.shape([[cx - 100 * s, cy + 56 * s], [cx - 40 * s, cy + 28 * s], [cx - 50 * s, cy + 2 * s]], I.paperDark, 4, k + 4, { smooth: false });
        } else if (kind === 'wind') {
          for (let j = 0; j < 3; j++) { const u = (lt * 0.6 + j / 3) % 1, y = cy - 60 * s + j * 60 * s, x = cx + (60 - u * 120) * s;
            pt.line([[x + 80 * s, y], [x - 60 * s, y], [x - 80 * s, y - 20 * s]], 6, k + j, { col: I.blue, op: 0.4 + 0.6 * (1 - Math.abs(u - 0.5) * 2) }); }
        } else if (kind === 'family') {
          [[-70, 1.0], [0, 1.15], [70, 0.9]].forEach(([dx, sc], j) => { const br = Math.sin(lt * 1.5 + j) * 3; const x = cx + dx * s, y = cy + 90 * s;
            pt.line([[x, y], [x, y - 90 * s * sc + br]], 7, k + j * 4); pt.shape(ell(x, y - 120 * s * sc + br, 30 * s * sc, 30 * s * sc, k + j * 4 + 1), I.paperLight, 5, k + j * 4 + 1); });
        }
      }
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt, pb = B.pb, pm = B.pm, pf = B.pf;
          B.begin(t);
          // cork-coloured board filling the frame
          pb.shape([[W * 0.04, H * 0.06], [W * 0.96, H * 0.07], [W * 0.95, H * 0.94], [W * 0.05, H * 0.93]], I.paperDark, 9, seed + 1, { smooth: false });
          for (let i = 0; i < 40; i++) { const r = rngI(seed + i * 3); pb.dot(W * (0.06 + r() * 0.88), H * (0.08 + r() * 0.84), 3 + r() * 3, I.inkSoft, seed + 10 + i, 0.35); }
          ttl.setAttribute('x', W / 2); ttl.setAttribute('y', H * 0.19);
          ttl.setAttribute('transform', `rotate(${F1(Math.sin(lt * 0.6) * 0.6)} ${W / 2} ${H * 0.16})`);
          cards.forEach((c, i) => {
            const a = tc(cues, c.at, 0.3 + i * 0.6), x = W / 2 + (i - (n - 1) / 2) * (cw + 50), p = lt < a ? 0 : spring(lt, a, 0.5);
            txt[i].style.display = p > 0.05 ? '' : 'none';
            if (p <= 0.01) return;
            const tilt = ((i % 2) ? 1 : -1) * 0.025 + Math.sin(lt * 0.8 + i) * 0.006;
            const R = q => rot(x + (q[0] - x) * p, y0 + ch / 2 + (q[1] - y0 - ch / 2) * p, x, y0 + ch / 2, tilt);
            pm.shape([[x - cw / 2, y0], [x + cw / 2, y0], [x + cw / 2, y0 + ch], [x - cw / 2, y0 + ch]].map(R), I.paperLight, 6, seed + 100 + i * 10, { smooth: false });
            pm.dot(...R([x, y0 + 26]), 14, I.red, seed + 105 + i * 10);
            icon(pm, c.icon, ...R([x, y0 + ch * 0.4]), 1.2 * p, lt, seed + 200 + i * 40);
            const tp = R([x, y0 + ch * 0.84]);
            txt[i].setAttribute('transform', `translate(${F1(tp[0])} ${F1(tp[1])}) rotate(${F1(tilt * 57)}) scale(${p.toFixed(3)})`);
            if (c.mark) { const ma = tc(cues, c.mark_at || c.at, a) + 0.4; if (lt > ma) { const q = spring(lt, ma, 0.4), mx = x + cw / 2 - 50, my = y0 + 60;
              if (c.mark === 'check') pf.line([[mx - 40 * q, my], [mx - 10 * q, my + 34 * q], [mx + 44 * q, my - 40 * q]], 12, seed + 300 + i, { col: I.green, smooth: false });
              else pf.line([[mx - 30 * q, my - 30 * q], [mx, my - 50 * q], [mx + 26 * q, my - 30 * q], [mx, my], [mx, my + 16 * q]], 10, seed + 300 + i, { col: I.red }); } }
          });
          if (pill) { const a = tc(cues, P.pill.at, dur * 0.7), on = lt >= a; pill.style.display = on ? '' : 'none';
            if (on) { const p = spring(lt, a, 0.5); let w = 400; try { w = pill.getComputedTextLength(); } catch (e) {}
              pf.shape([[W / 2 - (w / 2 + 40) * p, H * 0.73 - 40 * p], [W / 2 + (w / 2 + 40) * p, H * 0.73 - 40 * p], [W / 2 + (w / 2 + 40) * p, H * 0.73 + 40 * p], [W / 2 - (w / 2 + 40) * p, H * 0.73 + 40 * p]], P.pill.color === 'blue' ? I.blue : I.red, 5, seed + 400, { smooth: false });
              pill.setAttribute('transform', `translate(${W / 2} ${F1(H * 0.73 + 20)}) scale(${p.toFixed(3)})`); } }
          B.end(lt, t, cues);
        },
      };
    },
  };
})();
