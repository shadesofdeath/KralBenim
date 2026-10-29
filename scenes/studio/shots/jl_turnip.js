// jl_turnip: shots for the turnip jack-o'-lantern Short (Stickstory 2026-10-29): a record pumpkin in Rhode Island,
// turnip lanterns in old Ireland, the folk legend of Stingy Jack, the switch to pumpkins in America.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any harvest / folk-custom / lantern story.
// Uses td__lib.js (TD.label) at build time. Period figures: params.figs (hat: false, one accessory); the narrator
// (fez) only through params.kasif (lint counts it as the host).
//
// K (figure) = {x, y (ground, 0..1), scale, pose, face: "left"|"right", dir, emotion, accessory, seq: [{at, pose, dir,
//              face, emotion}], walk: {to, at, dur} (x glides to `to`), devil: true (red horns + tail),
//              knife: true (a small knife in the front hand that saws), lantern: {s: 0.5, lit: cue|s} (a turnip lantern
//              hangs from the front hand on a string)}
// LN (lantern) = {kind: "turnip"|"pumpkin", x, y (base, 0..1), s: 1, carve: cue|s|1 (0 = uncut, 1 = face cut),
//              cdur: 1.2, lit: cue|s|false, at: cue|s (pops in), giant: false (pumpkin: squat record giant, no face)}
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
// Lines      = [{words: [...], at: [cue...], y, size}] + highlight: "TURNIP." (giant Fraunces words, red box)
//
// SHOTS.jl_room  — cottage interior at night: a table top at P.ground with plank front down to the frame bottom,
//   an optional stone hearth with a live fire, lanterns on the table, a carver behind the table (knife), the narrator.
//   P: {ground: 0.6, hearth: {x: 0.14, s: 1} | false, lanterns: [LN], figs: [K], kasif: K | false, labels: [L],
//       lines, highlight}
// SHOTS.jl_weigh — giant-pumpkin weigh-off: a record pumpkin on a pallet on a platform scale, a readout board on posts
//   with a rolling counter, the grower cheering, the crowd's heads in the foreground.
//   P: {ground: 0.6, pumpkin: {x: 0.5, s: 2.4}, board: {x: 0.68, y: 0.22, to: 3156, unit: "LB", at, dur: 1.6},
//       figs: [K], crowd: true, labels: [L]}
// SHOTS.jl_tale  — night in the countryside (folk tale): grassy ground with stones to the frame bottom, a gnarled
//   tree (the Devil can sit in it), a cross scratched on the trunk (cue), a stone wall, figures, lanterns.
//   P: {ground: 0.6, tree: {x: 0.66, s: 1, cross: cue} | false, wall: true, figs: [K], kasif: K, lanterns: [LN],
//       fog: true, labels: [L]}
// SHOTS.jl_gates — the folk tale's two doors: a cloud gate (gold bars) up in the sky and a red-glowing door in a
//   rock; both swing shut on their cues, red X marks; the wanderer in the middle.
//   P: {ground: 0.6, heaven: {x: 0.3, y: 0.3, shut: cue, label}, hell: {x: 0.76, shut: cue, label}, figs: [K], labels}
// SHOTS.jl_porch / SHOTS.jl_night — an American house front: porch floor boards (jl_porch, daylight, open field at
//   the left) or front steps under a lit window (jl_night), lanterns / pumpkins, figures, the narrator, giant words.
//   P: {ground: 0.6, lanterns: [LN], figs: [K], kasif: K, labels: [L], lines, highlight, wall: 0.45 (x where the
//       house starts, jl_porch)}
// cues: hit (punch), and whatever the lanterns / figures / labels / words / gates reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const ORANGE = () => mix(INK.gold, INK.red, 0.38);
  const PURPLE = () => mix(mix(INK.red, INK.blue, 0.45), INK.paperLight, 0.22);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.35);
  const flick = (t, k) => 0.78 + 0.13 * Math.sin(t * 17 + k) + 0.09 * Math.sin(t * 37 + k * 2.3);
  const fmt = v => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const val = (cues, v, fb) => v === false || v == null ? fb : atOr(cues, v, fb);

  // ------------------------------------------------------------------ glow halo (per-path fill-opacity, no group opacity)
  function halo(parent) {
    const rs = [1, 0.74, 0.5].map(() => inkEl(parent, INK.gold, { 'fill-opacity': 0 }));
    return {
      update(t, x, y, r, a, sd) {
        rs.forEach((e, i) => {
          const k = [1, 0.74, 0.5][i];
          e.setAttribute('fill-opacity', (a * [0.1, 0.13, 0.18][i]).toFixed(3));
          e.setAttribute('d', a > 0.01 ? loopS(ell(x, y, r * k, r * k * 0.92, 16), sd + i, t, 2) : '');
        });
      },
    };
  }

  // ------------------------------------------------------------------ turnip lantern (base at y, ~280 units tall, faces viewer)
  // o: {x, y, s, carve 0..1, glow 0..1, handle: true, swing: deg}
  function turnip(parent, sd) {
    const g = el(parent, 'g'), hl = halo(g);
    const root = inkEl(g), body = inkEl(g, mix(INK.paperLight, INK.gold, 0.12)), lit = inkEl(g, INK.gold, { 'fill-opacity': 0 }), cap = inkEl(g, PURPLE()), wr = inkEl(g, INK.inkSoft);
    const rimF = inkEl(g, mix(INK.ink, INK.stain, 0.25)), rimG = inkEl(g, INK.gold, { 'fill-opacity': 0 }), holes = inkEl(g, INK.ink), holesHot = inkEl(g, INK.paperLight, { 'fill-opacity': 0 });
    const r = inkEl(g), hnd = inkEl(g), sparks = inkEl(g, INK.gold);
    // round bulb: widest low-middle, cut flat near the top (the hollowed opening), tapering into a thin taproot
    const KN = [[0, 34], [0.1, 104], [0.28, 150], [0.46, 158], [0.64, 142], [0.8, 112], [0.9, 88], [0.96, 64]];
    const wAt = u => { for (let i = 1; i < KN.length; i++) if (u <= KN[i][0]) { const a = KN[i - 1], b = KN[i], f = (u - a[0]) / (b[0] - a[0]); return lerp(a[1], b[1], f * f * (3 - 2 * f)); } return KN[KN.length - 1][1]; };
    const yAt = u => -26 - u * 250, TOP = 0.96, YT = yAt(TOP);
    const prof = (u0, u1, n = 9) => { const R = [], L = []; for (let i = 0; i <= n; i++) { const u = lerp(u0, u1, i / n); R.push([wAt(u), yAt(u)]); L.unshift([-wAt(u), yAt(u)]); } return R.concat(L); };
    const BODY = prof(0, TOP, 14);
    const eyeL = [[-104, -176], [-30, -152], [-84, -124]], eyeR = eyeL.map(p => [-p[0], p[1]]);
    const nose = [[-15, -108], [15, -108], [0, -134]];
    const mouth = []; for (let i = 0; i <= 10; i++) { const x = -100 + i * 20; mouth.push([x, -82 + (i % 2 ? 16 : 0) + Math.abs(x) * 0.12]); }
    for (let i = 10; i >= 0; i--) { const x = -100 + i * 20; mouth.push([x, -48 + (i % 2 ? 0 : -12) - Math.abs(x) * 0.12 + (Math.abs(x) > 80 ? -18 : 0)]); }
    const UC = 0.66, edge = []; for (let i = 0; i <= 12; i++) { const x = lerp(-wAt(UC), wAt(UC), i / 12); edge.push([x, yAt(UC) + 12 * Math.sin(i * 1.7) + Math.abs(x) * 0.08]); }
    const capPts = edge.concat(prof(UC, TOP, 6).slice(1, 7), prof(UC, TOP, 6).slice(7, 13));
    return {
      update(t, o) {
        const s = o.s ?? 1, k = sd * 11, c = clamp01(o.carve ?? 1), gl = clamp01(o.glow ?? 0), sw = (o.swing || 0) * Math.PI / 180;
        const cs = Math.cos(sw), sn = Math.sin(sw), piv = o.pivot ?? -400;
        const W = p => { const px = p[0], py = p[1] - piv; return [o.x + (px * cs - py * sn) * s, o.y + (piv + px * sn + py * cs) * s]; };
        const fl = flick(t, sd);
        hl.update(t, ...W([0, -140]), 320 * s, gl * fl * 1.2, k + 1);
        root.setAttribute('d', lineS([[0, -30], [-10, -16], [-40, -10], [-70, -18]].map(W), k + 6, t, 5) + ' ' + lineS([[18, -28], [36, -16], [52, -16]].map(W), k + 7, t, 3));
        body.setAttribute('d', loopS(BODY.map(W), k + 2, t, 1));
        lit.setAttribute('fill-opacity', (gl * fl * 0.28).toFixed(3));
        lit.setAttribute('d', gl > 0.02 ? loopS(ell(0, -140, 120, 95, 14).map(W), k + 8, t, 1) : '');
        cap.setAttribute('d', loopS(capPts.map(W), k + 3, t, 1));
        const WR = [[[-130, -60], [-112, -44], [-120, -26]], [[128, -80], [112, -56]], [[64, -40], [86, -46]], [[-70, -36], [-48, -30]], [[-142, -150], [-136, -126]], [[140, -140], [146, -116]]];
        wr.setAttribute('d', WR.map((q, i) => lineS(q.map(W), k + 10 + i, t, 3)).join(' '));
        // the cut top: a dark hollow with the coal's light inside, a jagged knife edge
        const rim = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; rim.push([Math.cos(a) * (wAt(TOP) - 10) + (i % 2 ? 4 : -4), YT + Math.sin(a) * 10]); }
        rimF.setAttribute('d', loopS(rim.map(W), k + 4, t, 0.8, false));
        rimG.setAttribute('fill-opacity', (gl * fl * 0.9).toFixed(3));
        rimG.setAttribute('d', loopS(ell(0, YT + 2, 38, 6, 10).map(W), k + 5, t, 0.8));
        // face: each feature cut in turn (eyes, nose, mouth), scaled from its own centre
        const feat = [[eyeL, 0, 0.3], [eyeR, 0.1, 0.4], [nose, 0.35, 0.55], [mouth, 0.5, 1]];
        const H = [], HH = [], HR = [];
        feat.forEach(([pts, a, b], i) => {
          const p = clamp01((c - a) / (b - a)); if (p <= 0.01) return;
          const cx = pts.reduce((m, q) => m + q[0], 0) / pts.length, cy = pts.reduce((m, q) => m + q[1], 0) / pts.length;
          const q = pts.map(v => W([cx + (v[0] - cx) * p, cy + (v[1] - cy) * p]));
          H.push(loopS(q, k + 20 + i, t, 0.8, false)); HR.push(ringS(q, k + 50 + i, t, 3.5, 0.8, false));
          HH.push(loopS(pts.map(v => W([cx + (v[0] - cx) * p * 0.55, cy + (v[1] - cy) * p * 0.45])), k + 30 + i, t, 0.6, true));
        });
        holes.setAttribute('d', H.join(' '));
        holes.setAttribute('fill', gl > 0.05 ? mix(INK.ink, INK.gold, Math.min(1, gl * fl * 1.1)) : INK.ink);
        holesHot.setAttribute('fill-opacity', (gl * fl * 0.9).toFixed(3));
        holesHot.setAttribute('d', gl > 0.05 ? HH.join(' ') : '');
        r.setAttribute('d', [ringS(BODY.map(W), k + 40, t, 6), ringS(rim.map(W), k + 41, t, 3.5, 0.8, false), lineS(edge.map(W), k + 42, t, 3.5)].concat(HR).join(' '));
        hnd.setAttribute('d', o.handle ? lineS([[-86, YT], [-50, YT - 90], [0, piv], [50, YT - 90], [86, YT]].map(W), k + 60, t, 3.5) : '');
        // sparks rising from the coal
        const SP = [];
        if (gl > 0.05 && o.sparks !== false) for (let i = 0; i < 9; i++) {
          const u = (t * 1.3 + i / 9) % 1, x = Math.sin(t * 5 + i * 2.1) * 50 * u + (i - 4) * 12, y = YT - 10 - u * 300;
          const rr = (11 - u * 8) * Math.min(1.4, Math.max(0.5, s));
          SP.push(inkDot(...W([x, y]), rr / s * s, rr / s * s, k + 70 + i, t));
        }
        sparks.setAttribute('d', SP.join(' '));
        return { top: W([0, YT]), center: W([0, -140]) };
      },
    };
  }

  // ------------------------------------------------------------------ pumpkin (base at y, ribbed; carved face optional)
  // o: {x, y, s, giant: false (squat record giant, warty), carve 0..1, glow 0..1}
  function pumpkin(parent, sd) {
    const g = el(parent, 'g'), hl = halo(g);
    const lobes = [0, 1, 2, 3, 4].map(() => ({ f: inkEl(g, ORANGE()), sh: inkEl(g, INK.red, { 'fill-opacity': 0.16 }), r: inkEl(g) }));
    const stem = inkEl(g, mix(INK.green, INK.stain, 0.35)), holes = inkEl(g, INK.ink), hot = inkEl(g, INK.paperLight, { 'fill-opacity': 0 }), r = inkEl(g);
    return {
      update(t, o) {
        const s = o.s ?? 1, k = sd * 13, gi = !!o.giant, c = clamp01(o.carve ?? 0), gl = clamp01(o.glow ?? 0);
        const W = p => [o.x + p[0] * s, o.y + p[1] * s];
        const h = gi ? 210 : 230, fl = flick(t, sd + 3);
        hl.update(t, ...W([0, -h * 0.5]), 320 * s, gl * fl, k + 1);
        const L = [[-120, 70], [-62, 84], [0, 92], [62, 84], [120, 70]];   // lobe centre x, half width
        const order = [0, 4, 1, 3, 2], R = [], S = [];
        order.forEach((i, j) => {
          const [cx, hw] = L[i], wf = gi ? 1.32 : 1;
          const pts = ell(cx * wf, -h / 2, hw * wf, h / 2 * (i === 2 ? 1 : 0.95), 16).map(p => [p[0], Math.min(p[1], 0)]);
          lobes[j].f.setAttribute('d', loopS(pts.map(W), k + 2 + i, t, 0.8));
          lobes[j].r.setAttribute('d', ringS(pts.map(W), k + 10 + i, t, 5, 0.8));
          lobes[j].sh.setAttribute('d', i !== 2 ? loopS(ell(cx * wf + Math.sign(cx) * hw * 0.35 * wf, -h / 2, hw * 0.45 * wf, h * 0.4, 10).map(W), k + 20 + i, t, 0.8) : '');
        });
        const st = [[-14, -h + 8], [-10, -h - 40], [8, -h - 66], [26, -h - 58], [12, -h - 34], [14, -h + 8]];
        stem.setAttribute('d', loopS(st.map(W), k + 30, t, 0.8));
        R.push(ringS(st.map(W), k + 31, t, 4.5, 0.8));
        if (gi) for (let i = 0; i < 7; i++) { const a = rng(k + 40 + i); const p0 = [(a() - 0.5) * 380, -40 - a() * 130]; R.push(inkCircle(...W(p0), 6 * s, k + 50 + i, t, { w: 3 })); }
        // carved face
        const F = [[[-98, -150], [-30, -150], [-64, -196]], [[30, -150], [98, -150], [64, -196]], [[-14, -112], [14, -112], [0, -136]]];
        const m = []; for (let i = 0; i <= 8; i++) { const x = -110 + i * 27.5; m.push([x, -86 + Math.abs(x) * 0.2 * -1 + 30 + (i % 2 ? 14 : 0) - 28]); }
        for (let i = 8; i >= 0; i--) { const x = -110 + i * 27.5; m.push([x, -26 - Math.abs(x) * 0.25 + (i === 3 || i === 5 ? -16 : 0)]); }
        F.push(m);
        const H = [], HH = [];
        F.forEach((pts, i) => {
          const p = clamp01((c - i * 0.2) / 0.35); if (p <= 0.01) return;
          const cx = pts.reduce((a, q) => a + q[0], 0) / pts.length, cy = pts.reduce((a, q) => a + q[1], 0) / pts.length;
          const q = pts.map(v => W([cx + (v[0] - cx) * p, cy + (v[1] - cy) * p]));
          H.push(loopS(q, k + 60 + i, t, 0.8, false)); R.push(ringS(q, k + 70 + i, t, 3.5, 0.8, false));
          HH.push(loopS(pts.map(v => W([cx + (v[0] - cx) * p * 0.5, cy + (v[1] - cy) * p * 0.42])), k + 80 + i, t, 0.6));
        });
        holes.setAttribute('d', H.join(' '));
        holes.setAttribute('fill', gl > 0.05 ? mix(INK.ink, INK.gold, Math.min(1, gl * fl * 1.1)) : INK.ink);
        hot.setAttribute('fill-opacity', (gl * fl * 0.9).toFixed(3)); hot.setAttribute('d', gl > 0.05 ? HH.join(' ') : '');
        r.setAttribute('d', R.join(' '));
        return { top: W([0, -h - 60]), center: W([0, -h / 2]) };
      },
    };
  }

  // lantern spec -> drawer
  function lantern(parent, LN, sd) {
    const d = LN.kind === 'pumpkin' ? pumpkin(parent, sd) : turnip(parent, sd);
    return {
      update(lt, t, cues, W, H, hit) {
        const a = atOr(cues, LN.at, 0), p = lt >= a ? spring(lt, a, 0.6) : 0;
        if (p <= 0.001) { d.update(t, { x: -9999, y: -9999, s: 0.001 }); return; }
        let c = 1;
        if (typeof LN.carve === 'number') c = LN.carve;
        else if (typeof LN.carve === 'string') { const at = atOr(cues, LN.carve, 0); c = lt >= at ? clamp01((lt - at) / (LN.cdur ?? 1.2)) : 0; }
        const la = LN.lit === false || LN.lit == null ? null : atOr(cues, LN.lit, 0);
        const gl = la == null ? 0 : lt >= la ? prog(lt, la, 0.4) : 0;
        d.update(t, { x: LN.x * W, y: LN.y * H, s: (LN.s ?? 1) * p * (1 + 0.06 * (LN.hit === false ? 0 : hit)), carve: c, glow: gl, giant: LN.giant, handle: LN.handle, swing: LN.rock ? Math.sin(t * 2.2) * LN.rock : 0, pivot: 0 });
      },
    };
  }

  // ------------------------------------------------------------------ figure (narrator or period figure) + extras
  function figure(parent, K, sd, narrator, front) {
    const g = el(parent, 'g'), fg_ = front || g;
    const isK = !!narrator;
    const tailE = inkEl(g, INK.red), lanG = el(g, 'g');
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), seed: sd });
    const redF = inkEl(g, INK.red, { 'fill-opacity': K.devil ? 0.45 : 0 }), horns = inkEl(g, INK.red), hornsR = inkEl(g), knife = inkEl(fg_, INK.paperDark), knifeR = inkEl(fg_), str = inkEl(fg_);
    const lan = K.lantern ? turnip(lanG, sd + 5) : null;
    const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
    const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
    const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
    return {
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at), sc = K.scale ?? 1;
        let x = (K.x ?? 0.5) * W;
        if (K.walk) { const a = atOr(cues, K.walk.at, 0), d = K.walk.dur ?? 3; x = lerp(K.x, K.walk.to, clamp01((lt - a) / d)) * W; }
        const y = (K.y ?? 0.6) * H, face = faceOf(s.face ?? K.face, -1);
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (s.pose === 'walk' && K.walk) o.ph = (x - K.x * W) / (KASIF.gait('walk') * sc) * face;
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, s.pose || 'idle', o);
        const P = p => [x + face * sc * p[0], y + sc * p[1]];
        const head = P(r.head), hand = P(r.hands[1]), hip = P(r.hip || [0, -184]);
        if (K.devil) {
          redF.setAttribute('d', loopS(ell(head[0], head[1], 60 * sc, 60 * sc, 14), sd + 29, t, 0.8));
          const hs = [-1, 1].map(sg => { const b = [head[0] + sg * 34 * sc, head[1] - 50 * sc]; return [b, [b[0] + sg * 52 * sc, b[1] - 66 * sc], [b[0] + sg * 6 * sc, b[1] - 6 * sc]]; });
          hs.forEach(q => q.splice(2, 0, [q[0][0] + (q[1][0] - q[0][0]) * 0.3, q[1][1] + 6 * sc]));
          horns.setAttribute('d', hs.map((q, j) => loopS([q[0], q[1], [q[0][0] + (q[1][0] - q[0][0]) * 0.15 + (j ? -14 : 14) * sc, q[0][1] + 4 * sc]], sd + 30 + j, t, 0.6, false)).join(' '));
          hornsR.setAttribute('d', hs.map((q, j) => ringS([q[0], q[1], [q[0][0] + (q[1][0] - q[0][0]) * 0.15 + (j ? -14 : 14) * sc, q[0][1] + 4 * sc]], sd + 32 + j, t, 3.5, 0.6, false)).join(' '));
          const tp = []; for (let j = 0; j <= 8; j++) { const u = j / 8; tp.push([hip[0] - face * (20 + u * 110) * sc, hip[1] + (Math.sin(u * 3.2 + t * 3) * 40 + u * 60) * sc]); }
          const tip = tp[tp.length - 1];
          tailE.setAttribute('d', lineS(tp, sd + 34, t, 7 * sc) + ' ' + loopS([[tip[0], tip[1] - 22 * sc], [tip[0] - face * 24 * sc, tip[1] + 6 * sc], [tip[0], tip[1] + 22 * sc], [tip[0] + face * 10 * sc, tip[1]]], sd + 35, t, 0.6, false)
            + ' ' + loopS([[head[0] + face * 4 * sc, head[1] + 58 * sc], [head[0] + face * 30 * sc, head[1] + 60 * sc], [head[0] + face * 14 * sc, head[1] + 100 * sc]], sd + 36, t, 0.6, false));
        }
        if (K.knife) {
          const KN = typeof K.knife === 'object' ? K.knife : {};
          const ka = atOr(cues, KN.at, 0), on = lt >= ka ? 1 : 0;
          const tg = KN.to ? [KN.to[0] * W, KN.to[1] * H] : [hand[0] - face * 100, hand[1] + 40];
          let dx = tg[0] - hand[0], dy = tg[1] - hand[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
          const saw = on * Math.sin(lt * 15) * 22 * sc, L = 120 * sc, nx = -dy, ny = dx;
          const hx = hand[0] + dx * saw, hy = hand[1] + dy * saw;
          const tipP = [hx + dx * L, hy + dy * L];
          const bl = [[hx + nx * 9 * sc, hy + ny * 9 * sc], tipP, [hx - nx * 3 * sc, hy - ny * 3 * sc]];
          knife.setAttribute('d', loopS(bl, sd + 40, t, 0.5, false));
          knifeR.setAttribute('d', ringS(bl, sd + 41, t, 3, 0.5, false) + ' ' + lineS([[hx, hy], [hx - dx * 46 * sc, hy - dy * 46 * sc]], sd + 42, t, 12 * sc));
          // wood chips flicking off while sawing
          if (on) { const C = []; for (let j = 0; j < 4; j++) { const u = (lt * 2.2 + j / 4) % 1, cx = tipP[0] + (j - 1.5) * 14 + u * 60 * (j % 2 ? 1 : -1), cy = tipP[1] - u * 90 + u * u * 160; C.push(inkDot(cx, cy, 6 * sc, 4 * sc, sd + 50 + j, t)); } str.setAttribute('d', C.join(' ')); str.setAttribute('fill', INK.paperLight); }
        }
        if (lan) {
          const LS = K.lantern.s ?? 0.5, sw = Math.sin(lt * 3.2) * 14, la = atOr(cues, K.lantern.lit, 0);
          const gl = lt >= la ? prog(lt, la, 0.4) : 0;
          const ls = LS / sc;   // lantern drawn in stage px, independent of figure scale
          const by = hand[1] + 330 * LS;
          lan.update(t, { x: hand[0], y: by, s: LS, carve: 1, glow: gl, handle: true, swing: sw, pivot: -330 });
          void ls;
        }
        return { x, y, face, hand, head };
      },
    };
  }

  // ------------------------------------------------------------------ giant words (Fraunces 900, highlight in a red box)
  function words(parent, P, W, H, sd) {
    const out = [];
    (P.lines || []).forEach((Ln, li) => {
      const size = Ln.size || 130, y = (Ln.y ?? 0.17 + li * 0.09) * H;
      const ts = Ln.words.map(w => { const g = el(parent, 'g'); const box = inkEl(g, INK.red), boxR = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` }); tx.textContent = w; return { g, box, boxR, tx, w, hl: w === P.highlight }; });
      const ws = ts.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } return w || o.w.length * size * 0.6; });
      const gap = size * 0.6 + 24, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
      const sc = Math.min(1, (W - 120) / tot);
      let x = W / 2 - tot * sc / 2;
      ts.forEach((o, i) => { o.x = x + ws[i] * sc / 2; o.y = y; o.ww = ws[i]; o.size = size; o.sc = sc; o.at = (Ln.at || [])[i]; o.k = li * 10 + i; x += (ws[i] + gap) * sc; out.push(o); });
    });
    return {
      update(lt, t, cues) {
        out.forEach(o => {
          const a = atOr(cues, o.at, 0.1 + o.k * 0.2), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5), b = boil(sd + 50 + o.k, t, 1.2);
          o.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
          o.g.setAttribute('transform', `translate(${f1(o.x + b[0])} ${f1(o.y + b[1])}) rotate(${f1((o.hl ? -3 : 0) + (1 - p) * -6)}) scale(${(o.sc * lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
          o.tx.setAttribute('y', f1(o.size * 0.35));
          if (o.hl) {
            o.tx.setAttribute('fill', INK.paperLight); o.tx.setAttribute('style', '');
            const bw = o.ww + 50, bh = o.size * 1.25, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
            o.box.setAttribute('d', inkLoop(pts, { seed: sd + 60 + o.k, t, smooth: false })); o.boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 70 + o.k, t, closed: true, smooth: false }));
          }
        });
      },
    };
  }

  // ------------------------------------------------------------------ table: top at y0, plank front to the frame bottom
  function table(parent, sd, W, H, y0, th) {
    const g = el(parent, 'g'), floor = inkEl(g, mix(INK.stain, INK.paperDark, 0.5)), top = inkEl(g, mix(WOOD(), INK.paperLight, 0.2)), front = inkEl(g, WOOD()), legs = inkEl(g, mix(WOOD(), INK.ink, 0.25));
    const stool = inkEl(g, WOOD()), peel = inkEl(g, PURPLE()), peel2 = inkEl(g, INK.paperLight), roots = inkEl(g, mix(INK.paperLight, INK.gold, 0.12)), rootsTop = inkEl(g, PURPLE()), r = inkEl(g), grain = inkEl(g, INK.inkSoft);
    const yb = th ? y0 + th : H + 20;
    return {
      update(t) {
        const k = sd * 5, R = [], G = [];
        if (th) {
          floor.setAttribute('d', loopS([[-20, yb - 40], [W + 20, yb - 40], [W + 20, H + 20], [-20, H + 20]], k + 50, t, 1, false));
          for (let i = 0; i < 5; i++) { const y = yb + 60 + i * i * 34; R.push(lineS([[-20, y], [W + 20, y + 3]], k + 51 + i, t, 3)); }
          const LG = [[60, yb, 40], [W - 100, yb, 40]].map(([x, y, w], i) => [[x, y], [x + w, y], [x + w - 4, H - 200], [x + 4, H - 200]]);
          legs.setAttribute('d', LG.map((q, i) => loopS(q, k + 60 + i, t, 0.6, false)).join(' '));
          LG.forEach((q, i) => R.push(ringS(q, k + 62 + i, t, 4.5, 0.6, false)));
          // stool (left), peelings and uncut roots on the floor (right)
          const sx = 0.3 * W, sy = yb + 330, seat = [[sx - 130, sy - 230], [sx + 130, sy - 236], [sx + 130, sy - 196], [sx - 130, sy - 192]];
          const sl = [[[sx - 100, sy - 196], [sx - 120, sy]], [[sx + 100, sy - 196], [sx + 120, sy]], [[sx, sy - 196], [sx + 4, sy - 20]]];
          stool.setAttribute('d', loopS(seat, k + 70, t, 0.8, false));
          R.push(ringS(seat, k + 71, t, 5, 0.8, false)); sl.forEach((q, i) => R.push(lineS(q, k + 72 + i, t, 9)));
          const P1 = [], P2 = [];
          [[0.6, yb + 110, 1], [0.72, yb + 170, -1], [0.52, yb + 200, 1], [0.84, yb + 90, -1]].forEach(([u, y, d], i) => {
            const pts = []; for (let j = 0; j <= 8; j++) { const a = j / 8 * Math.PI * 1.6; pts.push([u * W + Math.cos(a) * (40 - j * 3) * d + j * 6, y + Math.sin(a) * (22 - j * 2)]); }
            P1.push(lineS(pts, k + 80 + i, t, 13)); P2.push(lineS(pts, k + 85 + i, t, 5));
          });
          peel.setAttribute('d', P1.join(' ')); peel2.setAttribute('d', P2.join(' '));
          const RT = [], RTT = [];
          [[0.9, yb + 230, 1.1], [0.68, yb + 280, 0.8]].forEach(([u, y, s], i) => {
            const b = ell(u * W, y - 60 * s, 80 * s, 64 * s, 14); RT.push(loopS(b, k + 90 + i, t, 0.8)); R.push(ringS(b, k + 92 + i, t, 5, 0.8));
            const tp = ell(u * W, y - 100 * s, 70 * s, 26 * s, 10).map(p => [p[0], Math.min(p[1], y - 96 * s)]); RTT.push(loopS(tp, k + 94 + i, t, 0.8));
            R.push(lineS([[u * W - 10, y - 124 * s], [u * W - 30, y - 190 * s]], k + 96 + i, t, 6), lineS([[u * W + 10, y - 124 * s], [u * W + 34, y - 180 * s]], k + 98 + i, t, 6));
          });
          roots.setAttribute('d', RT.join(' ')); rootsTop.setAttribute('d', RTT.join(' '));
        }
        const tp = [[-20, y0 - 10], [W + 20, y0 - 14], [W + 20, y0 + 40], [-20, y0 + 44]];
        top.setAttribute('d', loopS(tp, k + 1, t, 1, false));
        front.setAttribute('d', loopS([[-20, y0 + 44], [W + 20, y0 + 40], [W + 20, yb], [-20, yb]], k + 2, t, 1, false));
        R.push(lineS([[-20, y0 - 10], [W + 20, y0 - 14]], k + 3, t, 6), lineS([[-20, y0 + 44], [W + 20, y0 + 40]], k + 4, t, 6));
        if (th) R.push(lineS([[-20, yb], [W + 20, yb]], k + 5, t, 6));
        const n = th ? 2 : 5;
        for (let i = 1; i < n; i++) { const y = y0 + 44 + i * (yb - y0 - 44) / n; R.push(lineS([[-20, y], [W + 20, y - 4]], k + 10 + i, t, 4.5)); }
        for (let i = 0; i < (th ? 5 : 14); i++) { const a = rng(k + 30 + i); const y = y0 + 70 + a() * (yb - y0 - 90), x = a() * W; G.push(lineS([[x, y], [x + 80 + a() * 120, y + (a() - 0.5) * 8]], k + 40 + i, t, 2.5)); }
        r.setAttribute('d', R.join(' ')); grain.setAttribute('d', G.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ stone hearth with a live fire (left wall)
  function hearth(parent, sd, W, H, x, y0, s) {
    const g = el(parent, 'g'), stone = inkEl(g, INK.paperDark), dark = inkEl(g, INK.ink), fl1 = inkEl(g, INK.red), fl2 = inkEl(g, INK.gold), r = inkEl(g), hl = halo(g);
    return {
      update(t) {
        const k = sd * 7, Wp = p => [x + p[0] * s, y0 + p[1] * s];
        hl.update(t, ...Wp([0, -120]), 260 * s, flick(t, sd) * 0.9, k);
        const outer = [[-190, 0], [-190, -470], [190, -470], [190, 0]];
        stone.setAttribute('d', loopS(outer.map(Wp), k + 1, t, 1, false));
        const arch = [[-110, 0], [-110, -200], [-80, -260], [0, -285], [80, -260], [110, -200], [110, 0]];
        dark.setAttribute('d', loopS(arch.map(Wp), k + 2, t, 1));
        const F = (amp, w, ph) => { const pts = [[-w, 0]]; for (let i = 1; i < 6; i++) { const u = i / 6; pts.push([-w + 2 * w * u, -amp * (0.5 + 0.5 * Math.sin(u * Math.PI)) * (0.75 + 0.25 * Math.sin(t * 11 + i * 1.7 + ph))]); } pts.push([w, 0]); return pts; };
        fl1.setAttribute('d', loopS(F(190, 90, 0).map(Wp), k + 3, t, 2));
        fl2.setAttribute('d', loopS(F(110, 60, 2).map(Wp), k + 4, t, 2));
        const R = [ringS(outer.map(Wp), k + 5, t, 6, 1, false), lineS(arch.map(Wp), k + 6, t, 5)];
        for (let row = 0; row < 6; row++) { const y = -80 * row - 70; R.push(lineS([[-190, y], [-112, y]].map(Wp), k + 10 + row, t, 3), lineS([[112, y], [190, y]].map(Wp), k + 20 + row, t, 3)); }
        R.push(lineS([[-200, -470], [200, -470]].map(Wp), k + 30, t, 9));
        r.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ night ground: grass + stones from y0 to the bottom
  function ground(parent, sd, W, H, y0, o = {}) {
    const g = el(parent, 'g'), f = inkEl(g, mix(INK.green, INK.ink, o.dark ? 0.45 : 0.15), { 'fill-opacity': 0.55 }), stones = inkEl(g, INK.paperDark), r = inkEl(g), tufts = inkEl(g, INK.ink);
    const R0 = rng(sd), ST = Array.from({ length: 7 }, () => ({ x: R0() * W, y: y0 + 120 + Math.pow(R0(), 0.7) * (H - y0 - 120), s: 0.6 + R0() })), TU = Array.from({ length: 26 }, () => ({ x: R0() * W, y: y0 + 20 + Math.pow(R0(), 0.8) * (H - y0), ph: R0() * 6 }));
    return {
      update(t) {
        const k = sd * 3, top = [[-20, y0]]; for (let x = 0; x <= W + 40; x += 90) top.push([x, y0 - 8 * Math.sin(x * 0.012 + 1)]);
        f.setAttribute('d', loopS(top.concat([[W + 40, H + 30], [-20, H + 30]]), k + 1, t, 1));
        const R = [lineS(top, k + 2, t, 5)], S = [], TT = [];
        ST.forEach((st, i) => { const sc = st.s * (0.5 + (st.y - y0) / (H - y0)); const pts = ell(st.x, st.y, 60 * sc, 30 * sc, 10); S.push(loopS(pts, k + 10 + i, t, 0.8)); R.push(ringS(pts, k + 20 + i, t, 4, 0.8)); });
        TU.forEach((u, i) => { const sc = 0.5 + (u.y - y0) / (H - y0) * 1.3, sw = Math.sin(t * 2 + u.ph) * 6 * sc; for (let j = -1; j <= 1; j++) TT.push(lineS([[u.x + j * 10 * sc, u.y], [u.x + j * 22 * sc + sw, u.y - 40 * sc]], k + 40 + i * 3 + j, t, 3.5 * Math.min(1.5, sc))); });
        stones.setAttribute('d', S.join(' ')); r.setAttribute('d', R.join(' ')); tufts.setAttribute('d', TT.join(' '));
      },
    };
  }

  // fog wisps drifting low (per-path fill-opacity)
  function fog(parent, sd, W, H, y) {
    const ws = [0, 1, 2, 3].map(() => inkEl(parent, INK.paperLight, { 'fill-opacity': 0.32 }));
    return {
      update(t) {
        ws.forEach((e, i) => { const cx = ((t * (18 + i * 6) + i * 330) % (W + 600)) - 300, cy = y - i * 34; e.setAttribute('d', loopS(ell(cx, cy, 260 - i * 30, 22, 12), sd + i, t, 1.5)); });
      },
    };
  }

  // gnarled tree (trunk + branches), a cross scratched on the trunk
  function tree(parent, sd, x, y0, s) {
    const g = el(parent, 'g'), trunk = inkEl(g, mix(INK.inkSoft, INK.stain, 0.4)), r = inkEl(g), cr = inkEl(g, INK.paperLight), crR = inkEl(g);
    return {
      update(t, crossP, sway) {
        const k = sd * 9, Wp = p => [x + p[0] * s + (p[1] < -300 ? Math.sin(t * 1.3) * sway * (-p[1] - 300) / 400 : 0), y0 + p[1] * s];
        const tr = [[-90, 0], [-50, -60], [-46, -300], [-60, -460], [-150, -620], [-130, -640], [-30, -500], [0, -560], [10, -720], [40, -720], [40, -540], [130, -620], [260, -640], [270, -610], [150, -580], [60, -440], [50, -300], [60, -60], [110, 0]];
        trunk.setAttribute('d', loopS(tr.map(Wp), k + 1, t, 1));
        const R = [ringS(tr.map(Wp), k + 2, t, 6)];
        const twigs = [[[-140, -630], [-200, -700], [-230, -690]], [[25, -715], [10, -800], [-20, -830]], [[255, -630], [320, -700], [350, -690]], [[200, -615], [240, -560]], [[-100, -560], [-170, -560]]];
        twigs.forEach((q, i) => R.push(lineS(q.map(Wp), k + 10 + i, t, 6 - i * 0.5)));
        R.push(lineS([[-20, -120], [-10, -220]].map(Wp), k + 20, t, 3), lineS([[20, -160], [26, -260]].map(Wp), k + 21, t, 3));
        r.setAttribute('d', R.join(' '));
        if (crossP > 0.01) {
          const cy = -230, h = 60 * crossP;
          const pts1 = [[-4, cy - h], [4, cy - h], [4, cy + h], [-4, cy + h]], pts2 = [[-34 * crossP, cy - 22], [34 * crossP, cy - 22], [34 * crossP, cy - 12], [-34 * crossP, cy - 12]];
          cr.setAttribute('d', loopS(pts1.map(Wp), k + 30, t, 0.5, false) + ' ' + loopS(pts2.map(Wp), k + 31, t, 0.5, false));
          crR.setAttribute('d', ringS(pts1.map(Wp), k + 32, t, 3, 0.5, false) + ' ' + ringS(pts2.map(Wp), k + 33, t, 3, 0.5, false));
        } else { cr.setAttribute('d', ''); crR.setAttribute('d', ''); }
        return { branch: Wp([60, -600]) };
      },
    };
  }

  // dry-stone wall across the frame at y0
  function stoneWall(parent, sd, W, y0, h) {
    const g = el(parent, 'g'), f = inkEl(g, mix(INK.paperDark, INK.inkSoft, 0.25)), r = inkEl(g);
    const R0 = rng(sd), B = []; for (let row = 0; row < 3; row++) { let x = -30 + R0() * 40; while (x < W + 30) { const w = 70 + R0() * 60; B.push([x, y0 - (row + 1) * h / 3, w, h / 3]); x += w + 4; } }
    return {
      update(t) {
        const F = [], R = [];
        B.forEach((b, i) => { const pts = ell(b[0] + b[2] / 2, b[1] + b[3] / 2, b[2] / 2, b[3] / 2 - 2, 8); F.push(loopS(pts, sd + i, t, 0.6)); R.push(ringS(pts, sd + 300 + i, t, 3, 0.6)); });
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // ================================================================== jl_room
  SH.jl_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2101, top = el(svg, 'g'), root = el(top, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const HE = P.hearth ? Object.assign({ x: 0.14, s: 1 }, P.hearth) : null;
      const hr = HE ? hearth(el(root, 'g'), sd + 1, W, H, HE.x * W, gy, HE.s) : null;
      const figG = el(root, 'g'), kasG = el(root, 'g');
      const tb = table(el(root, 'g'), sd + 2, W, H, gy, P.table_h);
      const lans = (P.lanterns || []).map((LN, i) => lantern(el(root, 'g'), LN, sd + 60 + i * 5));
      const frontG = el(root, 'g');
      const figs = (P.figs || []).map((K, i) => figure(el(figG, 'g'), K, sd + 10 + i * 7, false, frontG));
      const kas = P.kasif ? figure(kasG, P.kasif, sd + 40, true) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (hr) hr.update(t);
          figs.forEach(f => f.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          tb.update(t);
          lans.forEach(l => l.update(lt, t, cues, W, H, hit));
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== jl_weigh
  SH.jl_weigh = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2201, root = el(svg, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const BD = Object.assign({ x: 0.68, y: 0.2, to: 3156, unit: 'LB', at: 0.3, dur: 1.6, size: 150 }, P.board || {});
      const board = el(root, 'g'), bF = inkEl(board, INK.ink), bR = inkEl(board), posts = inkEl(board, INK.inkSoft);
      const num = el(board, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': BD.size, 'text-anchor': 'middle', fill: INK.gold });
      const unit = el(board, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': BD.size * 0.42, 'text-anchor': 'middle', fill: INK.paperLight });
      unit.textContent = BD.unit;
      const plat = el(root, 'g'), platF = inkEl(plat, INK.inkSoft), pallet = inkEl(plat, WOOD()), platR = inkEl(plat);
      const PK = Object.assign({ x: 0.5, s: 2.4 }, P.pumpkin || {});
      const pk = pumpkin(el(root, 'g'), sd + 3);
      const figs = (P.figs || []).map((K, i) => figure(el(root, 'g'), K, sd + 10 + i * 7, false));
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 40, true) : null;
      const crowd = el(root, 'g'), heads = [], R0 = rng(sd + 9);
      if (P.crowd !== false) for (let row = 0; row < 2; row++) for (let i = 0; i < 6 - row; i++) {
        const s = row ? 1.5 : 1.15, x = (i + 0.5 + (row ? 0.3 : 0) + (R0() - 0.5) * 0.3) * W / (6 - row), y = H - (row ? 40 : 300) + R0() * 30;
        heads.push({ x, y, s, ph: R0() * 6, f: inkEl(crowd, mix(INK.paperDark, INK.inkSoft, row ? 0.5 : 0.2)), h: inkEl(crowd, mix(INK.inkSoft, INK.stain, 0.3 + (i % 3) * 0.2)), r: inkEl(crowd), hat: inkEl(crowd, [INK.blue, INK.red, INK.green, INK.inkSoft][Math.floor(R0() * 4)]) });
      }
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5)), k = sd;
          // readout board on two posts
          const bx = BD.x * W, by = BD.y * H, bw = 520, bh = 300, a = atOr(cues, BD.at, 0.3);
          const v = BD.to * EASE_IO(clamp01((lt - a) / BD.dur)), pkk = punch(lt, a + BD.dur, 0.6);
          const bp = [[bx - bw / 2, by - bh / 2], [bx + bw / 2, by - bh / 2 - 4], [bx + bw / 2 + 3, by + bh / 2], [bx - bw / 2, by + bh / 2 + 3]];
          posts.setAttribute('d', [-1, 1].map((sg, i) => loopS([[bx + sg * 170 - 12, by], [bx + sg * 170 + 12, by], [bx + sg * 172 + 12, gy - 10], [bx + sg * 172 - 12, gy - 10]], k + 1 + i, t, 0.8, false)).join(' '));
          bF.setAttribute('d', loopS(bp, k + 3, t, 1, false));
          bR.setAttribute('d', ringS(bp, k + 4, t, 6, 1, false) + ' ' + ringS([[bx - bw / 2 + 18, by - bh / 2 + 18], [bx + bw / 2 - 18, by - bh / 2 + 16], [bx + bw / 2 - 16, by + bh / 2 - 16], [bx - bw / 2 + 18, by + bh / 2 - 15]], k + 5, t, 3, 0.8, false).replace(/^/, ''));
          bR.setAttribute('fill', INK.gold);
          const b = boil(k + 6, t, 1);
          num.textContent = fmt(v);
          num.setAttribute('transform', `translate(${f1(bx + b[0])} ${f1(by + 30 + b[1])}) scale(${(1 + 0.1 * pkk).toFixed(3)})`);
          unit.setAttribute('transform', `translate(${f1(bx + b[0])} ${f1(by + 112 + b[1])})`);
          // platform scale + pallet
          const px = PK.x * W, pw = 420 * PK.s / 2.4 * 1.2;
          const pl = [[px - pw, gy - 40], [px + pw, gy - 44], [px + pw + 20, gy + 10], [px - pw - 20, gy + 12]];
          platF.setAttribute('d', loopS(pl, k + 10, t, 1, false));
          const pa = [[px - pw * 0.85, gy - 90], [px + pw * 0.85, gy - 92], [px + pw * 0.85, gy - 40], [px - pw * 0.85, gy - 40]];
          pallet.setAttribute('d', loopS(pa, k + 11, t, 1, false));
          const PR = [ringS(pl, k + 12, t, 5, 1, false), ringS(pa, k + 13, t, 5, 1, false)];
          for (let i = 1; i < 6; i++) PR.push(lineS([[px - pw * 0.85 + i * pw * 0.34, gy - 90], [px - pw * 0.85 + i * pw * 0.34, gy - 40]], k + 14 + i, t, 3.5));
          platR.setAttribute('d', PR.join(' '));
          const r = pk.update(t, { x: px, y: gy - 90, s: PK.s * (1 + 0.04 * hit) * (1 + 0.012 * Math.sin(t * 2)), giant: true, carve: 0, glow: 0 });
          void r;
          figs.forEach(f => f.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          heads.forEach((h, i) => {
            const bob = Math.abs(Math.sin(t * 3 + h.ph)) * 14 * h.s * (lt > a + BD.dur ? 1.6 : 0.6), x = h.x, y = h.y - bob, s = h.s;
            const sh = [[x - 120 * s, y + 200 * s], [x - 110 * s, y + 70 * s], [x - 50 * s, y + 40 * s], [x + 50 * s, y + 40 * s], [x + 110 * s, y + 70 * s], [x + 120 * s, y + 200 * s]];
            h.f.setAttribute('d', loopS(sh, k + 30 + i, t, 1));
            const hd = ell(x, y - 10 * s, 52 * s, 56 * s, 12);
            h.h.setAttribute('d', loopS(hd, k + 50 + i, t, 0.8));
            const cap = [[x - 56 * s, y - 20 * s], [x - 50 * s, y - 56 * s], [x, y - 72 * s], [x + 50 * s, y - 56 * s], [x + 56 * s, y - 20 * s]];
            h.hat.setAttribute('d', i % 3 === 1 ? '' : loopS(cap, k + 70 + i, t, 0.8));
            h.r.setAttribute('d', ringS(sh, k + 90 + i, t, 5) + ' ' + ringS(hd, k + 110 + i, t, 5) + (i % 3 === 1 ? '' : ' ' + lineS(cap, k + 130 + i, t, 4)));
          });
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== jl_tale
  SH.jl_tale = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2301, root = el(svg, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const wl = P.wall === false ? null : stoneWall(el(root, 'g'), sd + 1, W, gy + 6, 120);
      const FW = P.front_wall ? Object.assign({ y: 0.82, h: 0.14 }, P.front_wall) : null;
      const TR = P.tree ? Object.assign({ x: 0.66, s: 1 }, P.tree) : null;
      const tr = TR ? tree(el(root, 'g'), sd + 2, TR.x * W, gy, TR.s) : null;
      const gr = ground(el(root, 'g'), sd + 3, W, H, gy, { dark: true });
      const figs = (P.figs || []).map((K, i) => figure(el(root, 'g'), K, sd + 10 + i * 7, false));
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 40, true) : null;
      const lans = (P.lanterns || []).map((LN, i) => lantern(el(root, 'g'), LN, sd + 60 + i * 5));
      const fg = P.fog === false ? null : fog(el(root, 'g'), sd + 5, W, H, gy + 70);
      const fw = FW ? stoneWall(el(root, 'g'), sd + 9, W, FW.y * H, FW.h * H) : null;
      const bats = Array.from({ length: P.bats || 0 }, (_, i) => ({ f: inkEl(root, INK.ink), r: rng(sd + 700 + i) }));
      bats.forEach(b => { b.y = ((P.bat_y ?? 0.2) + b.r() * 0.1) * H; b.sp = 140 + b.r() * 120; b.ph = b.r() * 6; b.x0 = b.r() * W; b.s = 0.8 + b.r() * 0.6; });
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (wl) wl.update(t);
          if (tr) { const ca = TR.cross ? atOr(cues, TR.cross, null) : null; tr.update(t, ca == null ? 0 : prog(lt, ca, 0.5), 6); }
          gr.update(t);
          figs.forEach(f => f.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          lans.forEach(l => l.update(lt, t, cues, W, H, hit));
          if (fg) fg.update(t);
          if (fw) fw.update(t);
          bats.forEach((b, i) => {
            const x = ((b.x0 + t * b.sp) % (W + 300)) - 150, y = b.y + Math.sin(t * 2.4 + b.ph) * 40, fl = Math.sin(t * 16 + b.ph), s = b.s;
            const pts = [[-70, -10 - 40 * fl], [-40, -6 - 10 * fl], [-26, 10], [-12, 0], [0, 12], [12, 0], [26, 10], [40, -6 - 10 * fl], [70, -10 - 40 * fl], [44, 6], [0, -12], [-44, 6]].map(p => [x + p[0] * s, y + p[1] * s]);
            b.f.setAttribute('d', loopS(pts, sd + 720 + i, t, 0.6, true));
          });
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== jl_gates
  SH.jl_gates = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2401, root = el(svg, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const HV = Object.assign({ x: 0.3, y: 0.34, shut: 'heaven', label: 'HEAVEN' }, P.heaven || {});
      const HL = Object.assign({ x: 0.77, shut: 'hell', label: 'HELL' }, P.hell || {});
      const cl = el(root, 'g'), cloudF = inkEl(cl, INK.paperLight), cloudR = inkEl(cl), gateR = inkEl(cl, INK.gold), gateI = inkEl(cl), glowH = halo(cl);
      const rock = el(root, 'g'), rockF = inkEl(rock, mix(INK.inkSoft, INK.ink, 0.3)), doorHole = inkEl(rock, INK.red), flames = inkEl(rock, INK.gold), door = inkEl(rock, WOOD()), rockR = inkEl(rock), glowD = halo(rock);
      const gr = ground(el(root, 'g'), sd + 3, W, H, gy, { dark: true });
      const figs = (P.figs || []).map((K, i) => figure(el(root, 'g'), K, sd + 10 + i * 7, false));
      const FW = P.front_wall ? Object.assign({ y: 0.83, h: 0.14 }, P.front_wall) : null;
      const fw = FW ? stoneWall(el(root, 'g'), sd + 9, W, FW.y * H, FW.h * H) : null;
      const xs = [0, 1].map(() => ({ f: inkEl(root, INK.red) }));
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      const tH = el(svg, 'text', { 'font-family': INK_FONT, 'font-size': 80, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      const tD = el(svg, 'text', { 'font-family': INK_FONT, 'font-size': 80, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      tH.textContent = HV.label; tD.textContent = HL.label;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const sH = atOr(cues, HV.shut, dur * 0.3), sD = atOr(cues, HL.shut, dur * 0.6);
          const pH = lt >= sH ? spring(lt, sH, 0.45) : 0, pD = lt >= sD ? spring(lt, sD, 0.45) : 0;
          // heaven: cloud bank + golden double gate that swings shut
          const cx = HV.x * W, cy = HV.y * H + Math.sin(t * 1.1) * 8;
          glowH.update(t, cx, cy - 60, 300, 0.9 * (1 - 0.6 * pH), k + 1);
          const cloud = []; for (let i = 0; i < 7; i++) cloud.push(ell(cx - 240 + i * 80, cy + 120 + Math.sin(i * 2) * 14, 80 + (i % 2) * 20, 50, 10));
          cloudF.setAttribute('d', cloud.map((c, i) => loopS(c, k + 10 + i, t, 1)).join(' '));
          cloudR.setAttribute('d', cloud.map((c, i) => ringS(c, k + 20 + i, t, 4)).join(' '));
          const gw = 120, gh = 250, open = 1 - pH;
          const G = [], GI = [];
          [-1, 1].forEach((sg, j) => {
            const hx = cx + sg * gw, w = gw * (0.15 + 0.85 * (1 - open * 0.85));   // leaves fold toward the hinge when open
            const x0 = hx, x1 = hx - sg * w;
            const leaf = [[x0, cy + 100], [x0, cy - gh + 40], [x1, cy - gh + 10 * (1 - open)], [x1, cy + 100]];
            GI.push(ringS(leaf, k + 30 + j, t, 5, 0.8, false));
            for (let b = 1; b < 5; b++) { const xb = lerp(x0, x1, b / 5); GI.push(lineS([[xb, cy + 100], [xb, cy - gh + 30]], k + 40 + j * 5 + b, t, 4)); }
            G.push(loopS([[x0, cy - gh + 30], [x1, cy - gh + 30], [x1, cy - gh + 50], [x0, cy - gh + 50]], k + 50 + j, t, 0.6, false));
          });
          gateR.setAttribute('d', G.join(' ')); gateI.setAttribute('d', GI.join(' '));
          // hell: rock with a red-glowing door that slams shut
          const dx = HL.x * W, dw = 140, dh = 330;
          glowD.update(t, dx, gy - 180, 280, (1 - pD) * flick(t, 4), k + 2);
          const rk = [[dx - 260, gy + 20], [dx - 230, gy - 300], [dx - 120, gy - 470], [dx + 40, gy - 500], [dx + 200, gy - 420], [dx + 280, gy - 220], [dx + 300, gy + 20]];
          rockF.setAttribute('d', loopS(rk, k + 60, t, 1));
          const dp = [[dx - dw / 2, gy], [dx - dw / 2, gy - dh + 60], [dx, gy - dh], [dx + dw / 2, gy - dh + 60], [dx + dw / 2, gy]];
          doorHole.setAttribute('d', loopS(dp, k + 61, t, 0.8, false));
          const fl = []; for (let i = 0; i < 3; i++) { const fx = dx - 40 + i * 40, hgt = (110 + 40 * Math.sin(t * 9 + i * 2)) * (1 - pD); fl.push(loopS([[fx - 26, gy], [fx - 10, gy - hgt * 0.6], [fx + 2, gy - hgt], [fx + 14, gy - hgt * 0.5], [fx + 26, gy]], k + 70 + i, t, 1.5)); }
          flames.setAttribute('d', fl.join(' '));
          const dwid = dw * pD, dpp = [[dx - dw / 2, gy], [dx - dw / 2, gy - dh + 60], [dx - dw / 2 + dwid / 2, gy - dh + 60 * (1 - pD)], [dx - dw / 2 + dwid, gy - dh + 60], [dx - dw / 2 + dwid, gy]];
          door.setAttribute('d', pD > 0.02 ? loopS(dpp, k + 80, t, 0.8, false) : '');
          const RR = [ringS(rk, k + 81, t, 6), ringS(dp, k + 82, t, 5, 0.8, false)];
          if (pD > 0.02) { RR.push(ringS(dpp, k + 83, t, 5, 0.8, false)); for (let i = 1; i < 3; i++) RR.push(lineS([[dx - dw / 2 + dwid * i / 3, gy - 10], [dx - dw / 2 + dwid * i / 3, gy - dh + 70]], k + 84 + i, t, 3)); }
          rockR.setAttribute('d', RR.join(' '));
          gr.update(t);
          figs.forEach(f => f.update(lt, t, cues, W, H));
          if (fw) fw.update(t);
          // red X marks
          [[cx, cy - 60, sH + 0.35], [dx, gy - 170, sD + 0.35]].forEach(([x, y, a], i) => {
            const p = lt >= a ? spring(lt, a, 0.4) : 0, L = 110 * p;
            xs[i].f.setAttribute('d', p > 0.02 ? lineS([[x - L, y - L], [x + L, y + L]], k + 90 + i, t, 26) + ' ' + lineS([[x + L, y - L], [x - L, y + L]], k + 92 + i, t, 26) : '');
          });
          const b1 = boil(k + 95, t, 1.2), b2 = boil(k + 96, t, 1.2);
          tH.setAttribute('x', f1(cx + b1[0])); tH.setAttribute('y', f1(cy - gh - 10 + b1[1]));
          tD.setAttribute('x', f1(dx + b2[0])); tD.setAttribute('y', f1(gy - 530 + b2[1]));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== jl_porch / jl_night (house front)
  function houseShot(night) {
    return {
      build(ctx) {
        const { P, W, H, svg, seed } = ctx;
        const sd = seed * 1000 + (night ? 2601 : 2501), top = el(svg, 'g'), root = el(top, 'g');
        const gy = (P.ground ?? 0.6) * H, wx = (P.wall ?? (night ? 0.34 : 0.42)) * W;
        const wall = inkEl(root, night ? mix(INK.paperDark, INK.inkSoft, 0.4) : mix(INK.paperLight, INK.paperDark, 0.25)), clap = inkEl(root, INK.inkSoft);
        const win = inkEl(root, night ? INK.gold : mix(INK.blue, INK.paperLight, 0.6), { 'fill-opacity': night ? 0.85 : 1 }), winR = inkEl(root), wh = halo(root);
        const floor = inkEl(root, WOOD()), floorR = inkEl(root), rail = inkEl(root), stepF = inkEl(root, mix(WOOD(), INK.paperLight, 0.15));
        const figs = (P.figs || []).map((K, i) => figure(el(root, 'g'), K, sd + 10 + i * 7, false));
        const lans = (P.lanterns || []).map((LN, i) => lantern(el(root, 'g'), LN, sd + 60 + i * 5));
        const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 40, true) : null;
        const leaves = el(root, 'g'), lf = inkEl(leaves, mix(INK.gold, INK.red, 0.5)), lfR = inkEl(leaves);
        const wd = words(el(top, 'g'), P, W, H, sd + 300);
        const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
        const WI = P.window ? Object.assign({ x: 0.72, y: 0.3, w: 0.26, h: 0.2 }, P.window) : { x: night ? 0.7 : 0.74, y: night ? 0.3 : 0.28, w: 0.24, h: 0.18 };
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
            const wp = [[wx, -20], [W + 20, -20], [W + 20, gy], [wx, gy]];
            wall.setAttribute('d', loopS(wp, k + 1, t, 1, false));
            const C = [lineS([[wx, -20], [wx, gy]], k + 2, t, 6)];
            for (let y = 80; y < gy; y += 64) C.push(lineS([[wx, y], [W + 20, y + 2]], k + 3 + y, t, 2.5));
            clap.setAttribute('d', C.join(' '));
            const ww = WI.w * W, whh = WI.h * H, wxx = WI.x * W - ww / 2, wyy = WI.y * H - whh / 2;
            const wpp = [[wxx, wyy], [wxx + ww, wyy], [wxx + ww, wyy + whh], [wxx, wyy + whh]];
            if (night) wh.update(t, WI.x * W, WI.y * H, ww * 0.9, 0.7 * flick(t, 9), k + 4);
            win.setAttribute('d', loopS(wpp, k + 5, t, 0.8, false));
            winR.setAttribute('d', [ringS(wpp, k + 6, t, 7, 0.8, false), lineS([[wxx + ww / 2, wyy], [wxx + ww / 2, wyy + whh]], k + 7, t, 5), lineS([[wxx, wyy + whh / 2], [wxx + ww, wyy + whh / 2]], k + 8, t, 5)].join(' '));
            // floor boards (porch) or front steps (night), down to the frame bottom
            const fp = [[-20, gy], [W + 20, gy], [W + 20, H + 20], [-20, H + 20]];
            floor.setAttribute('d', loopS(fp, k + 9, t, 1, false));
            const FR_ = [lineS([[-20, gy], [W + 20, gy]], k + 10, t, 6)], ST = [];
            if (night) {
              const steps = [gy + 170, gy + 380, gy + 620];
              steps.forEach((y, i) => { const pts = [[-20, y], [W + 20, y], [W + 20, y + 40], [-20, y + 40]]; ST.push(loopS(pts, k + 20 + i, t, 0.8, false)); FR_.push(lineS([[-20, y], [W + 20, y]], k + 24 + i, t, 6), lineS([[-20, y + 40], [W + 20, y + 40]], k + 28 + i, t, 4)); });
            } else {
              for (let i = -12; i <= 12; i++) FR_.push(lineS([[W / 2 + i * 70, gy], [W / 2 + i * 260, H + 20]], k + 40 + i, t, 3));
              for (let y = gy + 90, j = 0; y < H; y += 60 + j * 40, j++) FR_.push(lineS([[-20, y], [W + 20, y]], k + 70 + j, t, 2.5));
            }
            stepF.setAttribute('d', ST.join(' '));
            floorR.setAttribute('d', FR_.join(' '));
            // porch posts + railing (day) / door frame posts (night)
            const RL = [];
            if (!night) {
              [0.06, 0.4].forEach((u, i) => RL.push(lineS([[u * W, gy], [u * W, -20]], k + 90 + i, t, 18)));
              RL.push(lineS([[0, gy - 230], [wx, gy - 236]], k + 93, t, 9));
              for (let x = 30; x < wx; x += 46) RL.push(lineS([[x, gy - 230], [x, gy]], k + 100 + x, t, 4));
            } else {
              if (wx > 20) RL.push(lineS([[wx - 14, gy], [wx - 14, -20]], k + 94, t, 18), lineS([[-20, gy - 200], [wx - 14, gy - 204]], k + 95, t, 9));
              for (let x = 30; x < wx - 30; x += 50) RL.push(lineS([[x, gy - 200], [x, gy]], k + 100 + x, t, 4));
            }
            rail.setAttribute('d', RL.join(' '));
            figs.forEach(f => f.update(lt, t, cues, W, H));
            lans.forEach(l => l.update(lt, t, cues, W, H, hit));
            if (kas) kas.update(lt, t, cues, W, H);
            // falling autumn leaves (constant motion)
            const LF = [], LR = [];
            for (let i = 0; i < 7; i++) {
              const r = rng(k + 200 + i); const x0 = r() * W, sp = 60 + r() * 50, y = ((t * sp + r() * H) % (H * 0.9)) + 40, x = x0 + Math.sin(t * 1.5 + i) * 60;
              const a = t * 2 + i, c = Math.cos(a), s = Math.sin(a);
              const pts = [[0, -22], [12, 0], [0, 22], [-12, 0]].map(p => [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c]);
              LF.push(loopS(pts, k + 220 + i, t, 0.5)); LR.push(ringS(pts, k + 240 + i, t, 2.5, 0.5));
            }
            lf.setAttribute('d', LF.join(' ')); lfR.setAttribute('d', LR.join(' '));
            wd.update(lt, t, cues);
            labs.forEach(l => l.update(lt, t, cues));
          },
        };
      },
    };
  }
  SH.jl_porch = {
    kind: '2d',
    build(ctx) { return houseShot(false).build(ctx); },
  };
  SH.jl_night = {
    kind: '2d',
    build(ctx) { return houseShot(true).build(ctx); },
  };
})();
