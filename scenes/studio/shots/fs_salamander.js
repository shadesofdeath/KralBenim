// fs_salamander: shots for the fire salamander Short (Stickstory 2026-10-30): people thought it was born in fire,
// Pliny wrote it was so cold it put out flames; the truth is it sleeps in rotting firewood logs; its real power is a
// poison spray, and in 2026 scientists found it glows blue-green under a UV lamp.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any newt / salamander / amphibian story.
// Uses td__lib.js (TD.label, TD.figure) at build time; the narrator (fez) comes from params.kasif (TD.figure spec).
//
// Shared drawing: the salamander, seen from above. S = {x, y (snout tip, 0..1), s (1 = 600 px long), rot (deg, the
//   way the snout points: 0 right, 90 down, 180 left), curl (0 straight .. 1 curled up), wig: 0.12 (body wave),
//   uv: 0..1 | cue (black + yellow -> blue-green glow), sleep: false, walk: {from: [x, y], at, dur} (snout crawls
//   from -> x/y)}
// K (figure) = TD.figure spec {x, y (ground 0..1), scale, pose, face, dir, emotion, seq, accessory}
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
// Lines      = [{words: [...], at: [cue...], y, size}] + highlight (giant Fraunces words, highlight in a red box)
//
// SHOTS.fs_hearth — a medieval stone fireplace fills the frame: logs burning on iron firedogs, flames + sparks,
//   flagstone hearth, firewood stack + bellows in front. The front log has a hollow end; the salamander crawls out
//   of it onto the hearth (sal.walk). Optional toss: a peasant throws the front log in (cue), the fire flares.
//   P: {sal: S, log: {x0: 0.39, x1: 0.87, r: 80, char: 0.4}, toss: {at} | false, peasant: K | false, kasif: K,
//       labels, lines, highlight}
// SHOTS.fs_pliny — a Roman terrace at night: Pliny (laurel) beside a table with an unrolled scroll and an oil lamp;
//   the salamander walks over the table to the lamp and the flame goes out on cue "snuff" (smoke curl); mosaic floor
//   and a big scroll with a salamander-in-flames sketch in front.  P: {sal: S, snuff: cue, pliny: K, labels}
// SHOTS.fs_log — a wet forest floor: a big mossy log (cut-away window shows the hollow with the salamander curled
//   asleep inside), mushrooms, ferns and leaf litter to the frame bottom, rain; or the night version with the
//   narrator shining a UV torch on the glowing salamander walking on top.
//   P: {log: {x0: 0.06, x1: 0.94, y: 0.47, r: 0.09, cut: [0.3, 0.72] | false}, sal: S, rain: true, torch: true
//       (beam from the narrator's hand to the salamander), kasif: K, labels, lines, highlight}
// SHOTS.fs_head — extreme close-up from above: the salamander's head and front body fill the frame, the bulging
//   poison glands behind the eyes, droplets spray out on cue "spray", leaf litter around. P: {sal: S, spray: cue, labels}
// SHOTS.fs_lab — a dim lab: shelves with jars, a glass tank on the bench with the salamander on moss, a gloved hand
//   comes in from the left with a UV torch; on cue "uv" the beam switches on and the salamander glows.
//   P: {sal: S, uv: cue | number, labels}
// SHOTS.fs_years — a naturalist's study: a big counter (0 -> 250, "YEARS"), field sketches of the salamander pinned on
//   the wall one after another, a desk with stacks of notebooks and a magnifier, the narrator shrugs behind it.
//   P: {counter: {to: 250, x, y, at, dur, size}, sheets: 3, kasif: K, labels}
// cues: hit (punch), sal.walk.at, toss.at, snuff, spray, uv, counter.at, labels / seq / words "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  const fill = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const person = (parent, K, sd, narrator) => window.TD.figure(el(parent, 'g'), Object.assign({}, K, narrator ? {} : { hat: false }), sd);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const BODYC = () => mix(INK.ink, INK.inkSoft, 0.14);
  const GLOW = () => mix(mix(INK.blue, INK.green, 0.5), INK.paperLight, 0.42);
  const STONE = () => mix(INK.paperDark, INK.stain, 0.35);

  // ------------------------------------------------------------------ the salamander (top view)
  const WK = [[0, 0], [0.012, 0.038], [0.035, 0.062], [0.075, 0.072], [0.118, 0.084], [0.158, 0.062], [0.22, 0.076], [0.45, 0.079], [0.54, 0.067], [0.6, 0.05], [0.8, 0.025], [1, 0.004]];
  const wAt = u => { for (let i = 0; i < WK.length - 1; i++) if (u <= WK[i + 1][0]) return lerp(WK[i][1], WK[i + 1][1], (u - WK[i][0]) / (WK[i + 1][0] - WK[i][0])); return 0.004; };
  const SPOTS = [[0.05, -0.42, 0.02], [0.05, 0.44, 0.019], [0.112, -0.56, 0.04], [0.114, 0.58, 0.038], [0.21, -0.5, 0.028], [0.25, 0.46, 0.032], [0.31, -0.42, 0.03],
    [0.36, 0.5, 0.027], [0.42, -0.48, 0.032], [0.47, 0.4, 0.028], [0.52, -0.36, 0.024], [0.6, 0.38, 0.022], [0.66, -0.36, 0.02], [0.73, 0.32, 0.016], [0.8, -0.28, 0.013], [0.87, 0.18, 0.01]];
  const LEGS = [{ u: 0.19, side: 1, off: 0, front: true }, { u: 0.19, side: -1, off: 0.5, front: true }, { u: 0.53, side: 1, off: 0.5 }, { u: 0.53, side: -1, off: 0 }];

  function salamander(parent, sd) {
    const g = el(parent, 'g');
    const halo = inkEl(g, GLOW(), { 'fill-opacity': 0 });
    const legO = inkEl(g, INK.ink), legF = inkEl(g, BODYC()), bodyO = inkEl(g, INK.ink), body = inkEl(g, BODYC());
    const sh = inkEl(g, INK.paperLight, { 'fill-opacity': 0.1 });
    const sHalo = inkEl(g, GLOW(), { 'fill-opacity': 0 }), spots = inkEl(g, INK.gold), dots = inkEl(g, GLOW(), { 'fill-opacity': 0 });
    const eyes = inkEl(g, INK.ink), eyeHi = inkEl(g, INK.paperLight), lines = inkEl(g, INK.ink);
    return {
      update(t, o) {
        const L = 600 * (o.s ?? 1), N = 44, rot = (o.rot ?? 0) * Math.PI / 180, curl = o.curl || 0, wig = o.wig ?? 0.12, ph = o.ph || 0;
        const uv = clamp01(o.uv || 0), br = 1 + 0.025 * Math.sin(t * 2.1 + sd), k = sd * 13;
        const C = [], T = []; let x = o.x, y = o.y;
        for (let i = 0; i <= N; i++) {
          const u = i / N, th = rot + curl * u * Math.PI * 1.75 + wig * Math.sin(2 * Math.PI * (u * 1.1 - ph)) * Math.min(1, u / 0.3);
          C.push([x, y]); T.push(th); x -= Math.cos(th) * L / N; y -= Math.sin(th) * L / N;
        }
        const at = (u, v) => { const f = clamp01(u) * N, i = Math.min(N - 1, Math.floor(f)), r = f - i, th = lerp(T[i], T[i + 1], r), p = [lerp(C[i][0], C[i + 1][0], r), lerp(C[i][1], C[i + 1][1], r)], w = wAt(u) * L * br; return [p[0] - Math.sin(th) * v * w, p[1] + Math.cos(th) * v * w, th]; };
        const outline = []; for (let i = 0; i <= N; i++) outline.push(at(i / N, 1)); for (let i = N; i >= 0; i--) outline.push(at(i / N, -1));
        const ow = Math.max(3.5, Math.min(9, L * 0.011));
        const bc = mix(BODYC(), mix(INK.ink, INK.blue, 0.3), uv);
        body.setAttribute('fill', bc); legF.setAttribute('fill', bc);
        // legs
        const LO = [], LF = [], TO = [], LSP = [];
        LEGS.forEach((lg, j) => {
          const sw = o.sleep ? 0 : Math.sin(2 * Math.PI * (ph + lg.off)), s0 = at(lg.u, lg.side * 0.8), th = s0[2];
          const hx = Math.cos(th), hy = Math.sin(th), ox = -Math.sin(th) * lg.side, oy = Math.cos(th) * lg.side;
          const a = (lg.front ? 0.18 : -0.55) + sw * 0.45 - (o.sleep ? (lg.front ? -0.6 : 0.7) : 0), b = a + 0.85;
          const d1 = [ox * Math.cos(a) + hx * Math.sin(a), oy * Math.cos(a) + hy * Math.sin(a)], d2 = [ox * Math.cos(b) + hx * Math.sin(b), oy * Math.cos(b) + hy * Math.sin(b)];
          const el1 = [s0[0] + d1[0] * 0.075 * L, s0[1] + d1[1] * 0.075 * L], ft = [el1[0] + d2[0] * 0.058 * L, el1[1] + d2[1] * 0.058 * L];
          const pts = [[s0[0], s0[1]], el1, ft], lw = 0.042 * L;
          LO.push(lineS(pts, k + 10 + j, t, lw + ow * 2, 0.6)); LF.push(lineS(pts, k + 20 + j, t, lw, 0.6));
          const ba = Math.atan2(d2[1], d2[0]);
          for (let q = 0; q < 4; q++) { const aa = ba + (q - 1.5) * 0.5, tl = 0.026 * L; TO.push(lineS([ft, [ft[0] + Math.cos(aa) * tl, ft[1] + Math.sin(aa) * tl]], k + 30 + j * 4 + q, t, Math.max(4, 0.014 * L), 0.4)); }
          const m = [lerp(s0[0], el1[0], 0.55), lerp(s0[1], el1[1], 0.55)];
          LSP.push(loopS(inkEllipsePts(m[0], m[1], 0.022 * L, 0.015 * L, k + 50 + j, 8, Math.atan2(d1[1], d1[0]), 0.15), k + 50 + j, t, 0.5));
        });
        legO.setAttribute('d', LO.join(' ')); legF.setAttribute('d', LF.join(' '));
        bodyO.setAttribute('d', ringS(outline, k + 1, t, ow * 2, 0.6));
        fill(body, outline, k + 2, t, 0.6);
        // soft sheen along the back
        const back = []; for (let i = 2; i <= N * 0.7; i++) back.push(at(i / N, 0.25)); for (let i = Math.floor(N * 0.7); i >= 2; i--) back.push(at(i / N, -0.05));
        sh.setAttribute('d', uv > 0.5 ? '' : loopS(back.map(p => [p[0], p[1]]), k + 3, t, 0.5));
        // spots
        const SP = [], HA = [];
        SPOTS.forEach(([u, v, z], j) => { const p = at(u, v); SP.push(loopS(inkEllipsePts(p[0], p[1], z * L * 1.25, z * L * 0.85, k + 60 + j, 10, p[2], 0.18), k + 60 + j, t, 0.5)); if (uv > 0) HA.push(loopS(ell(p[0], p[1], z * L * 2.1, z * L * 1.7, 12, p[2]), k + 80 + j, t, 0.8)); });
        spots.setAttribute('d', SP.concat(LSP).join(' '));
        const pulse = 0.85 + 0.15 * Math.sin(t * 3.2 + sd);
        spots.setAttribute('fill', mix(INK.gold, mix(GLOW(), INK.paperLight, 0.25), uv));
        sHalo.setAttribute('d', HA.join(' ')); sHalo.setAttribute('fill-opacity', (0.45 * uv * pulse).toFixed(3));
        halo.setAttribute('d', uv > 0 ? loopS(outline.map((p, i) => { const c = at(0.3, 0); return [c[0] + (p[0] - c[0]) * 1.18, c[1] + (p[1] - c[1]) * 1.18]; }), k + 4, t, 1) : '');
        halo.setAttribute('fill-opacity', (0.28 * uv * pulse).toFixed(3));
        const D = []; if (uv > 0) for (let u = 0.17; u < 0.62; u += 0.028) [-1, 1].forEach((sd2, q) => { const p = at(u, sd2 * 0.86); D.push(loopS(ell(p[0], p[1], 0.008 * L, 0.008 * L, 7), k + 120 + Math.round(u * 100) * 2 + q, t, 0.4)); });
        dots.setAttribute('d', D.join(' ')); dots.setAttribute('fill-opacity', uv.toFixed(3)); dots.setAttribute('fill', mix(GLOW(), INK.paperLight, 0.25));
        // eyes + nostrils
        const E = [], EH = [], Ln = [];
        [-1, 1].forEach((sg, q) => {
          const p = at(0.058, sg * 0.9), r = 0.024 * L;
          if (o.sleep) { E.push(loopS(ell(p[0], p[1], r, r * 0.9, 10), k + 140 + q, t, 0.4)); Ln.push(lineS([at(0.045, sg * 0.75), at(0.07, sg * 0.98)].map(a => [a[0], a[1]]), k + 150 + q, t, Math.max(3, r * 0.3), 0.3)); }
          else { E.push(loopS(ell(p[0], p[1], r, r * 0.9, 10), k + 140 + q, t, 0.4)); EH.push(loopS(ell(p[0] + r * 0.3, p[1] - r * 0.3, r * 0.3, r * 0.3, 7), k + 160 + q, t, 0.3)); }
          const n = at(0.012, sg * 0.4); Ln.push(loopS(ell(n[0], n[1], 0.005 * L, 0.005 * L, 6), k + 170 + q, t, 0.3));
        });
        eyes.setAttribute('d', E.join(' ')); eyes.setAttribute('fill', o.sleep ? mix(bc, INK.paperLight, 0.12) : INK.ink);
        eyeHi.setAttribute('d', EH.join(' ')); lines.setAttribute('d', Ln.join(' ') + ' ' + TO.join(' '));
        return { snout: C[0], at, glands: [at(0.114, -0.62), at(0.114, 0.62)], mid: at(0.32, 0), L };
      },
    };
  }
  // salamander state from S + cues
  function salState(S, W, H, lt, cues, dur) {
    const o = Object.assign({}, S), x1 = (S.x ?? 0.5) * W, y1 = (S.y ?? 0.5) * H, L = 600 * (S.s ?? 1);
    let x = x1, y = y1, ph = (S.ph0 || 0) + (S.idle === false ? 0 : lt * 0.15);
    if (S.walk) {
      const a = atOr(cues, S.walk.at, 0), d = S.walk.dur ?? 2, p = lt >= a ? clamp01((lt - a) / d) : 0, e = 1 - Math.pow(1 - p, 1.6), fr = S.walk.from || [S.x, S.y];
      x = lerp(fr[0] * W, x1, e); y = lerp(fr[1] * H, y1, e);
      ph += Math.hypot(x - fr[0] * W, y - fr[1] * H) / (0.32 * L);
    }
    const ua = S.uv == null || typeof S.uv === 'number' ? null : atOr(cues, S.uv, null);
    o.uv = ua == null ? (S.uv || 0) : (lt >= ua ? prog(lt, ua, 0.5) : 0);
    return Object.assign(o, { x, y, ph });
  }

  // ------------------------------------------------------------------ flames on a base line
  function fire(parent, sd) {
    const g = el(parent, 'g'), glow = inkEl(g, INK.gold, { 'fill-opacity': 0.22 }), outer = inkEl(g, INK.red), mid = inkEl(g, INK.gold), core = inkEl(g, mix(INK.gold, INK.paperLight, 0.55)), r = inkEl(g), sp = inkEl(g, INK.gold);
    return {
      update(t, x, y, w, h, kk = 1, n = 7, glowOn = true, lick = 0) {
        const k = sd * 7, O = [], M = [], Cc = [], R = [];
        for (let i = 0; i < n; i++) {
          const xi = x - w / 2 + (i + 0.5) * w / n + Math.sin(t * 2.3 + i) * w * 0.01;
          const hh = h * kk * (0.55 + 0.45 * hn(sd + i, 3)) * (0.82 + 0.18 * Math.sin(t * (6 + i % 3) + i * 1.9));
          const bw = w / n * 0.9, sway = Math.sin(t * 5 + i * 1.3) * bw * (0.4 + 0.25 * lick), hh2 = hh * (1 + 0.25 * lick * Math.max(0, Math.sin(t * 3.1 + i * 2.2)));
          const shape = sc => [[xi - bw * sc, y], [xi - bw * 0.7 * sc + sway * 0.3, y - hh2 * 0.35 * sc], [xi - bw * 0.25 * sc + sway * 0.8, y - hh2 * 0.75 * sc], [xi + sway, y - hh2 * sc], [xi + bw * 0.3 * sc + sway * 0.6, y - hh2 * 0.62 * sc], [xi + bw * 0.75 * sc + sway * 0.2, y - hh2 * 0.3 * sc], [xi + bw * sc, y]];
          void hh2; O.push(loopS(shape(1), k + i, t, 1.2)); M.push(loopS(shape(0.68), k + 20 + i, t, 1)); Cc.push(loopS(shape(0.36), k + 40 + i, t, 0.8));
          R.push(ringS(shape(1), k + 60 + i, t, 3, 1.2));
        }
        outer.setAttribute('d', O.join(' ')); mid.setAttribute('d', M.join(' ')); core.setAttribute('d', Cc.join(' ')); r.setAttribute('d', R.join(' '));
        glow.setAttribute('d', glowOn ? loopS(ell(x, y - h * 0.35, w * 0.72, h * 0.8 * kk, 16), k + 90, t, 1.5) : '');
        const S = []; for (let i = 0; i < 22; i++) { const u = (t * 0.55 + hn(sd + i, 7)) % 1, sx = x + (hn(sd + i, 9) - 0.5) * w * 0.8 + Math.sin(u * 6 + i) * 30, sy = y - h * 0.3 - u * h * 1.3 * kk; S.push(loopS(ell(sx, sy, 10 * (1 - u) + 3, 10 * (1 - u) + 3, 6), k + 100 + i, t, 0.6)); }
        sp.setAttribute('d', S.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a log lying across (side view), local coords
  //   update(t, x0, x1, cy, r, o): o = {char 0..1, hollow: true (left end face is a ring: the inside shows), moss, cut: [a, b] | null, embers}
  function logDraw(parent, sd) {
    const g = el(parent, 'g'), hole = inkEl(g, mix(INK.ink, INK.stain, 0.25)), mid = el(g, 'g');
    const body = inkEl(g, WOOD()), bark = inkEl(g, INK.inkSoft), face = inkEl(g, mix(WOOD(), INK.paperLight, 0.4), { 'fill-rule': 'evenodd' }), rings = inkEl(g, INK.inkSoft);
    const cutF = inkEl(g, mix(INK.stain, INK.ink, 0.3)), cutFib = inkEl(g, mix(INK.stain, INK.ink, 0.25)), cutIn = el(g, 'g');
    const moss = inkEl(g, mix(INK.green, INK.paperLight, 0.12)), mossD = inkEl(g, mix(INK.green, INK.ink, 0.3)), emb = inkEl(g, INK.red), r = inkEl(g);
    return {
      mid, cutIn,
      update(t, x0, x1, cy, rr, o = {}) {
        const k = sd * 11, rx = rr * 0.36, ch = clamp01(o.char || 0);
        body.setAttribute('fill', mix(WOOD(), INK.ink, 0.6 * ch));
        const top = [], bot = [];
        for (let i = 0; i <= 16; i++) { const x = lerp(x0, x1, i / 16); top.push([x, cy - rr + Math.sin(i * 1.7 + sd) * 3]); bot.push([x, cy + rr + Math.sin(i * 1.3 + sd) * 3]); }
        const endR = []; for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; endR.push([x1 + Math.cos(a) * rx, cy + Math.sin(a) * rr]); }
        const shape = top.concat(endR).concat(bot.slice().reverse());
        fill(body, shape, k + 1, t, 0.8);
        const B = []; for (let j = 0; j < 5; j++) { const yy = cy - rr * 0.7 + j * rr * 0.35, pts = []; for (let i = 0; i <= 10; i++) pts.push([lerp(x0 + rx, x1, i / 10), yy + Math.sin(i * 1.9 + j * 2 + sd) * rr * 0.06]); B.push(lineS(pts, k + 10 + j, t, 2.5, 0.6)); }
        [[0.35, -0.3], [0.7, 0.35]].forEach(([u, v], j) => B.push(ringS(ell(lerp(x0, x1, u), cy + v * rr, rr * 0.12, rr * 0.07, 9), k + 20 + j, t, 2.5, 0.5)));
        bark.setAttribute('d', B.join(' '));
        // left end face (ring if hollow)
        const fo = ell(x0, cy, rx, rr, 18), fi = ell(x0 + rx * 0.08, cy + rr * 0.05, rx * 0.6, rr * 0.6, 14);
        hole.setAttribute('d', o.hollow ? loopS(fi, k + 31, t, 0.5) : '');
        face.setAttribute('d', loopS(fo, k + 30, t, 0.6) + (o.hollow ? ' ' + loopS(fi.slice().reverse(), k + 31, t, 0.5) : ''));
        const RG = []; [0.82, 0.7].forEach((f, j) => RG.push(ringS(ell(x0, cy, rx * f, rr * f, 16), k + 40 + j, t, 2, 0.6)));
        if (!o.hollow) RG.push(ringS(ell(x0, cy, rx * 0.4, rr * 0.4, 12), k + 43, t, 2, 0.6), ringS(ell(x0, cy, rx * 0.15, rr * 0.15, 8), k + 44, t, 2, 0.4));
        rings.setAttribute('d', RG.join(' '));
        // cut-away window into the hollow
        if (o.cut) {
          const a = o.cut[0], b = o.cut[1], cw = [];
          for (let i = 0; i <= 18; i++) { const an = Math.PI + i / 18 * Math.PI * 2, jag = (i % 2 ? 0.92 : 1.04); cw.push([(a + b) / 2 + Math.cos(an) * (b - a) / 2 * jag, cy + 0.05 * rr + Math.sin(an) * rr * 0.68 * jag]); }
          fill(cutF, cw, k + 50, t, 0.6, false);
          const F = []; for (let j = 0; j < 9; j++) { const yy = cy - rr * 0.45 + j * rr * 0.14, pts = []; for (let i = 0; i <= 6; i++) pts.push([lerp(a + 20, b - 20, i / 6), yy + Math.sin(i * 2 + j) * 6]); F.push(lineS(pts, k + 60 + j, t, 3, 0.6)); }
          cutFib.setAttribute('d', F.join(' '));
          r.dataset.cut = ringS(cw, k + 51, t, 5, 0.6, false);
        } else { cutF.setAttribute('d', ''); cutFib.setAttribute('d', ''); r.dataset.cut = ''; }
        // moss + embers
        if (o.moss) {
          const M = [], MD = []; for (let i = 0; i < 9; i++) { const u = 0.05 + i * 0.11, cx = lerp(x0, x1, u), w = rr * (0.35 + hn(sd + i, 2) * 0.3); M.push(loopS([[cx - w, cy - rr + 6], [cx - w * 0.6, cy - rr - w * 0.35], [cx, cy - rr - w * 0.5], [cx + w * 0.6, cy - rr - w * 0.35], [cx + w, cy - rr + 6], [cx + w * 0.5, cy - rr + w * 0.3], [cx - w * 0.5, cy - rr + w * 0.3]], k + 70 + i, t, 0.8)); MD.push(lineS([[cx - w * 0.5, cy - rr - w * 0.1], [cx + w * 0.4, cy - rr - w * 0.2]], k + 90 + i, t, 2.5, 0.5)); }
          moss.setAttribute('d', M.join(' ')); mossD.setAttribute('d', MD.join(' '));
        } else { moss.setAttribute('d', ''); mossD.setAttribute('d', ''); }
        if (o.embers) {
          const E = []; for (let i = 0; i < 7; i++) { const cx = lerp(x0 + rx, x1, (i + 0.5) / 7), yy = cy + rr * (0.2 + 0.5 * hn(sd + i, 4)), gl = 0.6 + 0.4 * Math.sin(t * 4 + i * 2); E.push(lineS([[cx - 30, yy], [cx - 10, yy - 10], [cx + 8, yy + 4], [cx + 30, yy - 6]], k + 100 + i, t, 6 * gl, 0.6)); }
          emb.setAttribute('d', E.join(' '));
        } else emb.setAttribute('d', '');
        r.setAttribute('d', [ringS(shape, k + 120, t, 5, 0.8), ringS(fo, k + 121, t, 4.5, 0.6), o.hollow ? ringS(fi, k + 122, t, 3.5, 0.5) : '', r.dataset.cut || ''].join(' '));
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
      const gap = size * 0.32, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), sc = Math.min(1, (W - 120) / tot);
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

  // ------------------------------------------------------------------ UV torch in a hand (p0 = grip, aims at p1), beam on
  function torch(parent, sd) {
    const g = el(parent, 'g'), beam = inkEl(g, GLOW(), { 'fill-opacity': 0 }), beam2 = inkEl(g, GLOW(), { 'fill-opacity': 0 }), body = inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)), lens = inkEl(g, INK.blue), r = inkEl(g), spot = inkEl(g, GLOW(), { 'fill-opacity': 0 });
    return {
      update(t, p0, p1, on, len = 150, wid = 46, spread = 180) {
        const k = sd * 5, dx = p1[0] - p0[0], dy = p1[1] - p0[1], D = Math.hypot(dx, dy) || 1, ux = dx / D, uy = dy / D, nx = -uy, ny = ux;
        const back = [p0[0] - ux * len * 0.35, p0[1] - uy * len * 0.35], head = [p0[0] + ux * len * 0.65, p0[1] + uy * len * 0.65];
        const bp = [[back[0] + nx * wid * 0.4, back[1] + ny * wid * 0.4], [head[0] + nx * wid * 0.4, head[1] + ny * wid * 0.4], [head[0] + nx * wid * 0.62 + ux * 30, head[1] + ny * wid * 0.62 + uy * 30], [head[0] - nx * wid * 0.62 + ux * 30, head[1] - ny * wid * 0.62 + uy * 30], [head[0] - nx * wid * 0.4, head[1] - ny * wid * 0.4], [back[0] - nx * wid * 0.4, back[1] - ny * wid * 0.4]];
        fill(body, bp, k + 1, t, 0.5, false);
        const tip = [head[0] + ux * 30, head[1] + uy * 30], lp = [[tip[0] + nx * wid * 0.58, tip[1] + ny * wid * 0.58], [tip[0] + nx * wid * 0.58 + ux * 10, tip[1] + ny * wid * 0.58 + uy * 10], [tip[0] - nx * wid * 0.58 + ux * 10, tip[1] - ny * wid * 0.58 + uy * 10], [tip[0] - nx * wid * 0.58, tip[1] - ny * wid * 0.58]];
        fill(lens, lp, k + 2, t, 0.4, false);
        r.setAttribute('d', ringS(bp, k + 3, t, 4, 0.5, false) + ' ' + lineS([[back[0] + ux * 40 + nx * wid * 0.4, back[1] + uy * 40 + ny * wid * 0.4], [back[0] + ux * 40 - nx * wid * 0.4, back[1] + uy * 40 - ny * wid * 0.4]], k + 4, t, 3));
        const fl = 0.9 + 0.1 * Math.sin(t * 7);
        const bm = s => [[tip[0] + nx * wid * 0.5, tip[1] + ny * wid * 0.5], [p1[0] + nx * spread * s, p1[1] + ny * spread * s], [p1[0] + ux * 40, p1[1] + uy * 40], [p1[0] - nx * spread * s, p1[1] - ny * spread * s], [tip[0] - nx * wid * 0.5, tip[1] - ny * wid * 0.5]];
        beam.setAttribute('d', on > 0 ? loopS(bm(1), k + 5, t, 1) : ''); beam.setAttribute('fill-opacity', (0.2 * on * fl).toFixed(3));
        beam2.setAttribute('d', on > 0 ? loopS(bm(0.55), k + 6, t, 1) : ''); beam2.setAttribute('fill-opacity', (0.22 * on * fl).toFixed(3));
        spot.setAttribute('d', on > 0 ? loopS(ell(p1[0], p1[1], spread * 1.15, spread * 0.55, 16), k + 7, t, 1) : ''); spot.setAttribute('fill-opacity', (0.18 * on * fl).toFixed(3));
      },
    };
  }

  // ------------------------------------------------------------------ leaf litter (fixed per seed) between y0 and y1
  function litter(parent, sd, W, y0, y1, n = 26) {
    const g = el(parent, 'g'), cols = [mix(INK.stain, INK.paperDark, 0.2), mix(INK.gold, INK.stain, 0.5), mix(INK.red, INK.stain, 0.55), mix(INK.green, INK.stain, 0.4)];
    const F = cols.map(c => inkEl(g, c)), r = inkEl(g), R = rng(sd);
    const LV = Array.from({ length: n }, (_, i) => { const v = R(); return { x: R() * W, y: lerp(y0, y1, Math.pow(v, 0.8)), s: lerp(0.6, 1.6, v), a: R() * Math.PI * 2, c: Math.floor(R() * 4) }; }).sort((a, b) => a.y - b.y);
    return {
      update(t) {
        const k = sd * 3, FF = [[], [], [], []], L = [];
        LV.forEach((l, i) => {
          const len = 70 * l.s, w = 30 * l.s, ca = Math.cos(l.a), sa = Math.sin(l.a), Pp = (u, v) => [l.x + ca * u - sa * v, l.y + (sa * u + ca * v) * 0.6];
          const pts = [Pp(-len, 0), Pp(-len * 0.4, -w), Pp(len * 0.4, -w * 0.8), Pp(len, 0), Pp(len * 0.4, w * 0.8), Pp(-len * 0.4, w)];
          FF[l.c].push(loopS(pts, k + i, t, 0.6)); L.push(ringS(pts, k + 100 + i, t, 3, 0.6), lineS([Pp(-len * 1.15, 0), Pp(len * 0.9, 0)], k + 200 + i, t, 2.5, 0.5));
        });
        F.forEach((f, i) => f.setAttribute('d', FF[i].join(' '))); r.setAttribute('d', L.join(' '));
      },
    };
  }
  // fern clump (fronds fan out from a base point)
  function fern(parent, sd) {
    const f = inkEl(parent, mix(INK.green, INK.ink, 0.15)), r = inkEl(parent, mix(INK.green, INK.ink, 0.55));
    return {
      update(t, x, y, s, n = 6, dirs = [-1.0, 1.0]) {
        const k = sd * 9, FF = [], L = [];
        for (let i = 0; i < n; i++) {
          const a0 = lerp(dirs[0], dirs[1], i / (n - 1)) - Math.PI / 2 + Math.sin(t * 1.2 + i) * 0.04, len = 260 * s * (0.75 + 0.25 * hn(sd + i, 1)), pts = [];
          for (let j = 0; j <= 8; j++) { const u = j / 8, a = a0 + u * 0.6 * Math.sign(a0 + Math.PI / 2 || 1); pts.push([x + Math.cos(a) * len * u, y + Math.sin(a) * len * u]); }
          L.push(lineS(pts, k + i, t, 4, 0.6));
          for (let j = 1; j < 8; j++) { const p = pts[j], q = pts[j + 1], dx = q[0] - p[0], dy = q[1] - p[1], dl = Math.hypot(dx, dy) || 1, lw = 46 * s * (1 - j / 9); [-1, 1].forEach(sg => FF.push(loopS([p, [p[0] - dy / dl * lw * sg + dx * 0.6, p[1] + dx / dl * lw * sg + dy * 0.6], q], k + 20 + i * 20 + j * 2 + (sg > 0 ? 1 : 0), t, 0.5))); }
        }
        f.setAttribute('d', FF.join(' ')); r.setAttribute('d', L.join(' '));
      },
    };
  }

  // ================================================================== fs_hearth
  SH.fs_hearth = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3101, top = el(svg, 'g'), root = el(top, 'g');
      const gy = 1152;
      const stone = inkEl(root, STONE()), stoneL = inkEl(root, mix(INK.inkSoft, INK.stain, 0.3)), soot = inkEl(root, mix(INK.ink, INK.inkSoft, 0.22)), brick = inkEl(root, mix(INK.inkSoft, INK.ink, 0.3)), surR = inkEl(root);
      const mantel = inkEl(root, mix(WOOD(), INK.ink, 0.25)), mantelR = inkEl(root), jug = inkEl(root, mix(INK.red, INK.stain, 0.5)), jugR = inkEl(root);
      const fireBack = fire(el(root, 'g'), sd + 1);
      const dogs = inkEl(root, mix(INK.ink, INK.inkSoft, 0.15));
      const backLog = logDraw(el(root, 'g'), sd + 2);
      const LG = Object.assign({ x0: 0.39, x1: 0.87, r: 80, char: 0.4 }, P.log || {});
      const logG = el(root, 'g'), frontLog = logDraw(logG, sd + 3);
      const clipId = 'fsclip' + sd, defs = el(svg, 'defs'), cp = el(defs, 'clipPath', { id: clipId }), cpR = el(cp, 'rect', { x: -4000, y: -4000, width: 10, height: 8000 });
      frontLog.mid.setAttribute('clip-path', `url(#${clipId})`);
      const sal = salamander(frontLog.mid, sd + 4);
      const fireFront = fire(el(root, 'g'), sd + 5);
      const floor = inkEl(root, mix(INK.paperDark, INK.stain, 0.3)), floorR = inkEl(root), ash = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.35 });
      const wood = inkEl(root, WOOD()), woodE = inkEl(root, mix(WOOD(), INK.paperLight, 0.4)), woodR = inkEl(root);
      const bel = inkEl(root, mix(INK.stain, INK.ink, 0.3)), belW = inkEl(root, mix(WOOD(), INK.paperLight, 0.2)), belR = inkEl(root);
      const puffE = inkEl(root, INK.gold), puffR = inkEl(root, INK.red);
      const peas = P.peasant ? person(root, P.peasant, sd + 7, false) : null;
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const S = Object.assign({ x: 0.14, y: 0.555, s: 0.95, rot: 180, wig: 0.1 }, P.sal || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // stone surround + opening (x 150..930, arch top 560)
          const ox0 = 150, ox1 = 930, oyT = 640;
          fill(stone, [[-30, 440], [W + 30, 440], [W + 30, gy + 10], [-30, gy + 10]], k + 1, t, 0.6, false);
          const SL = []; for (let row = 0; row < 8; row++) { const y = 440 + row * 90; SL.push(lineS([[-30, y], [W + 30, y + 3]], k + 10 + row, t, 3, 0.6)); for (let c = 0; c < 8; c++) { const x = (c + (row % 2) * 0.5) * 160 - 40; SL.push(lineS([[x, y], [x + 2, y + 90]], k + 30 + row * 8 + c, t, 3, 0.6)); } }
          stoneL.setAttribute('d', SL.join(' '));
          const op = [[ox0, gy + 4], [ox0, oyT]]; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; op.push([(ox0 + ox1) / 2 + Math.cos(a) * (ox1 - ox0) / 2, oyT + Math.sin(a) * 90]); } op.push([ox1, oyT], [ox1, gy + 4]);
          fill(soot, op, k + 2, t, 0.6, false);
          const BR = []; for (let row = 0; row < 7; row++) { const y = 600 + row * 70; BR.push(lineS([[ox0 + 30, y], [ox1 - 30, y]], k + 120 + row, t, 2.5, 0.6)); for (let c = 0; c < 6; c++) { const x = ox0 + 70 + (c + (row % 2) * 0.5) * 120; BR.push(lineS([[x, y], [x, y + 70]], k + 140 + row * 6 + c, t, 2.5, 0.6)); } }
          brick.setAttribute('d', BR.join(' '));
          surR.setAttribute('d', ringS(op, k + 3, t, 6, 0.6, false));
          // mantel beam + jugs on it
          const mp = [[-30, 380], [W + 30, 376], [W + 30, 460], [-30, 464]];
          fill(mantel, mp, k + 4, t, 0.6, false);
          mantelR.setAttribute('d', [ringS(mp, k + 5, t, 5, 0.6, false), lineS([[-30, 404], [W + 30, 400]], k + 6, t, 2.5)].join(' '));
          const J = [], JR = []; [[790, 1.0], [890, 0.75]].forEach(([jx, js], i) => { const pts = [[jx - 34 * js, 378], [jx - 50 * js, 330], [jx - 40 * js, 280], [jx - 18 * js, 262], [jx - 20 * js, 236], [jx + 20 * js, 236], [jx + 18 * js, 262], [jx + 40 * js, 280], [jx + 50 * js, 330], [jx + 34 * js, 378]]; J.push(loopS(pts, k + 7 + i, t, 0.6)); JR.push(ringS(pts, k + 9 + i, t, 4, 0.6)); });
          jug.setAttribute('d', J.join(' ')); jugR.setAttribute('d', JR.join(' '));
          if (peas) { const r = peas.update(lt, t, cues, W, H); peas.lastHand = r.hand; }
          // toss: the front log flies in from the peasant's hands
          const ta = P.toss ? atOr(cues, P.toss.at, dur * 0.3) : null, tp = ta == null ? 1 : (lt >= ta ? clamp01((lt - ta) / 0.6) : 0);
          const land = ta == null ? 0 : punch(lt, ta + 0.6, 0.9), flare = 1 + 0.45 * land + 0.06 * hit;
          const x0 = LG.x0 * W, x1 = LG.x1 * W, cy = gy - LG.r - 6, lc = [(x0 + x1) / 2, cy];
          // fire behind
          backLog.update(t, 300, 900, gy - 150, 62, { char: 0.85, embers: true });
          fireBack.update(t, 590, gy - 160, 640, 430, flare * (P.fireK ?? 1), 8, true, P.lick ?? 0);
          dogs.setAttribute('d', [470, 860].map((dx, i) => [lineS([[dx, gy], [dx, gy - 150]], k + 60 + i, t, 16), loopS(ell(dx, gy - 160, 20, 20, 9), k + 62 + i, t, 0.5), lineS([[dx - 50, gy], [dx + 50, gy]], k + 64 + i, t, 12)].join(' ')).join(' '));
          // front log (local coords around its centre)
          let tx = 0, ty = 0, ang = 0;
          if (ta != null && tp < 1) { const hd = peas && peas.lastHand ? peas.lastHand : [0.85 * W, 0.45 * H]; tx = lerp(hd[0] - lc[0] - 80, 0, tp); ty = lerp(hd[1] - lc[1], 0, tp) - Math.sin(tp * Math.PI) * 220; ang = lerp(-28, 0, tp); }
          logG.setAttribute('transform', `translate(${f1(lc[0] + tx)} ${f1(lc[1] + ty)}) rotate(${f1(ang)})`);
          cpR.setAttribute('width', f1(x0 - lc[0] + 4000 + LG.r * 0.12));
          const so = salState(S, W, H, lt, cues, dur);
          sal.update(t, Object.assign(so, { x: so.x - lc[0], y: so.y - lc[1], s: so.s * (1 + 0.05 * hit) }));
          frontLog.update(t, x0 - lc[0], x1 - lc[0], 0, LG.r, { char: LG.char * (ta == null ? 1 : tp), hollow: true, embers: LG.char > 0.2 && tp >= 1 });
          fireFront.update(t, 700, gy - 40, 300, 170, flare * (ta == null ? 1 : clamp01((lt - ta - 0.4) * 1.5)), 4, false);
          // flagstone hearth floor to the frame bottom
          const FL = []; let yy = gy;
          for (let row = 0; row < 7; row++) { const h = 70 + row * 32, y2 = yy + h; FL.push(lineS([[-30, y2], [W + 30, y2 + 4]], k + 200 + row, t, 3.5)); const n = 4 + (row % 2); for (let c = 1; c < n; c++) { const x = c * W / n + (row % 2) * 40 - 20; FL.push(lineS([[x + (x - W / 2) * 0.05, yy], [x + (x - W / 2) * 0.12, y2]], k + 220 + row * 6 + c, t, 3)); } yy = y2; }
          fill(floor, [[-30, gy], [W + 30, gy], [W + 30, H + 30], [-30, H + 30]], k + 199, t, 0.6, false);
          floorR.setAttribute('d', [lineS([[-30, gy], [W + 30, gy]], k + 198, t, 6)].concat(FL).join(' '));
          ash.setAttribute('d', loopS(ell(590, gy + 30, 380, 34, 16), k + 197, t, 1));
          // firewood stack (bottom left) + bellows (bottom right)
          const WE = [], WR = [], WB = [];
          [[0, 6], [1, 5], [2, 4], [3, 3]].forEach(([row, n]) => { for (let c = 0; c < n; c++) { const cx = 40 + c * 110 + row * 55, cyy = 1860 - row * 96, rr = 52; WB.push(loopS([[cx, cyy - rr], [cx + 140, cyy - rr - 30], [cx + 140, cyy + rr - 30], [cx, cyy + rr]], k + 300 + row * 10 + c, t, 0.6, false)); WE.push(loopS(ell(cx, cyy, rr * 0.9, rr, 12), k + 340 + row * 10 + c, t, 0.6)); WR.push(ringS(ell(cx, cyy, rr * 0.9, rr, 12), k + 380 + row * 10 + c, t, 4, 0.6), ringS(ell(cx, cyy, rr * 0.45, rr * 0.5, 9), k + 420 + row * 10 + c, t, 2, 0.5)); } });
          wood.setAttribute('d', WB.join(' ')); woodE.setAttribute('d', WE.join(' ')); woodR.setAttribute('d', WR.join(' '));
          const bx = P.pail === false ? -9999 : 860, by = 1600, sl = Math.sin(t * 2) * 6;
          const bp = [[bx - 150, by - 150], [bx + 150, by - 150], [bx + 120, by + 170], [bx - 120, by + 170]];
          fill(bel, bp, k + 450, t, 0.5, false); fill(belW, ell(bx, by - 150, 150, 34, 16).map(p => [p[0], p[1] + (p[1] > by - 150 ? 0 : 0)]), k + 451, t, 0.5);
          belR.setAttribute('d', [ringS(bp, k + 452, t, 5, 0.5, false), ringS(ell(bx, by - 150, 150, 34, 16), k + 453, t, 4, 0.5), lineS([[bx - 142, by - 60], [bx + 142, by - 60]], k + 454, t, 7), lineS([[bx - 128, by + 100], [bx + 128, by + 100]], k + 455, t, 7),
            lineS([[bx - 150, by - 150], [bx - 120, by - 300 + sl], [bx + 120, by - 300 + sl], [bx + 150, by - 150]], k + 456, t, 6), lineS([[bx - 60, by - 150], [bx - 40, by - 20]], k + 457, t, 2.5), lineS([[bx + 50, by - 150], [bx + 40, by - 10]], k + 458, t, 2.5)].join(' '));
          belW.setAttribute('fill', mix(INK.blue, INK.paperLight, 0.45));
          // spark puff off the log end on the puff cue
          const pa = P.puff ? atOr(cues, P.puff, null) : null, PE = [], PR = [];
          if (pa != null && lt >= pa && lt < pa + 1.4) { const u = lt - pa; for (let i = 0; i < 16; i++) { const an = Math.PI * (0.55 + 0.9 * hn(sd + i, 11)) + Math.PI, v = 380 + hn(sd + i, 12) * 420, px = x0 + Math.cos(an) * v * u * 0.9, py = cy - 20 + Math.sin(an) * v * u + 520 * u * u, r = (12 + hn(sd + i, 13) * 10) * (1 - u / 1.4); (i % 3 ? PE : PR).push(loopS(ell(px, py, r, r, 7), k + 700 + i, t, 0.5)); } }
          puffE.setAttribute('d', PE.join(' ')); puffR.setAttribute('d', PR.join(' '));
          if (kas) kas.update(lt, t, cues, W, H);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== fs_pliny
  SH.fs_pliny = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3201, top = el(svg, 'g'), root = el(top, 'g'), gy = 1150;
      const col = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.4)), colR = inkEl(root);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.25 });
      const plG = el(root, 'g'), pl = P.pliny ? person(plG, P.pliny, sd + 7, false) : null;
      const tbl = inkEl(root, WOOD()), tblD = inkEl(root, mix(WOOD(), INK.ink, 0.3)), tblR = inkEl(root);
      const scr = inkEl(root, INK.paperLight), scrRoll = inkEl(root, mix(INK.paperDark, INK.stain, 0.3)), scrR = inkEl(root), scrT = inkEl(root, INK.inkSoft);
      const lamp = inkEl(root, mix(INK.red, INK.stain, 0.55)), lampR = inkEl(root);
      const fl = fire(el(root, 'g'), sd + 3), smoke = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.4 });
      const sal = salamander(el(root, 'g'), sd + 4);
      const floor = inkEl(root, mix(INK.paperDark, INK.stain, 0.25)), tiles = inkEl(root, mix(INK.red, INK.stain, 0.45)), tilesB = inkEl(root, mix(INK.blue, INK.paperDark, 0.4)), floorR = inkEl(root);
      const big = inkEl(root, INK.paperLight), bigRoll = inkEl(root, mix(INK.paperDark, INK.stain, 0.35)), bigR = inkEl(root), bigT = inkEl(root, INK.inkSoft);
      const sk = el(root, 'g'), skSal = salamander(sk, sd + 9), skFire = fire(el(root, 'g'), sd + 10);
      const amph = inkEl(root, mix(INK.red, INK.stain, 0.4)), amphR = inkEl(root);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const S = Object.assign({ x: 0.66, y: 0.468, s: 0.42, rot: 0, walk: { from: [0.42, 0.47], at: 0, dur: 2.2 } }, P.sal || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // column at the right
          const cx = 990, cp = [[cx - 70, 300], [cx + 70, 300], [cx + 80, gy], [cx - 80, gy]];
          fill(col, cp, k + 1, t, 0.6, false);
          colR.setAttribute('d', [ringS(cp, k + 2, t, 5, 0.6, false), ringS([[cx - 110, 250], [cx + 110, 250], [cx + 90, 300], [cx - 90, 300]], k + 3, t, 5, 0.6, false)].concat([-40, -10, 20, 50].map((d, i) => lineS([[cx + d, 310], [cx + d * 1.1, gy - 10]], k + 4 + i, t, 2.5, 0.6))).join(' '));
          // table (top 930..975, legs to the ground)
          const tp = [[300, 930], [1000, 926], [1030, 975], [270, 979]];
          fill(tbl, tp, k + 10, t, 0.6, false);
          tblD.setAttribute('d', [loopS([[270, 979], [1030, 975], [1030, 1015], [270, 1019]], k + 11, t, 0.6, false), loopS([[320, 1015], [360, 1015], [350, gy], [326, gy]], k + 12, t, 0.5, false), loopS([[940, 1013], [980, 1013], [976, gy], [952, gy]], k + 13, t, 0.5, false)].join(' '));
          tblR.setAttribute('d', [ringS(tp, k + 14, t, 4.5, 0.6, false), ringS([[270, 979], [1030, 975], [1030, 1015], [270, 1019]], k + 15, t, 4, 0.6, false)].join(' '));
          // scroll on the table
          const sp = [[360, 940], [700, 936], [690, 966], [350, 970]];
          fill(scr, sp, k + 20, t, 0.5, false);
          scrRoll.setAttribute('d', [loopS(ell(352, 954, 16, 24, 10), k + 21, t, 0.4), loopS(ell(702, 950, 16, 24, 10), k + 22, t, 0.4)].join(' '));
          scrR.setAttribute('d', ringS(sp, k + 23, t, 3.5, 0.5, false));
          scrT.setAttribute('d', [0, 1, 2].map(i => lineS([[390, 946 + i * 8], [660, 944 + i * 8]].map((p, j) => [p[0], p[1] + Math.sin(j + i) * 2]), k + 24 + i, t, 2, 0.6)).join(' '));
          // oil lamp + flame (goes out on "snuff")
          const lx = 840, ly = 928, sa = atOr(cues, P.snuff, dur * 0.6), out = lt >= sa ? clamp01((lt - sa) / 0.35) : 0;
          const lp = [[lx - 70, ly], [lx - 80, ly - 30], [lx - 40, ly - 52], [lx + 30, ly - 50], [lx + 80, ly - 40], [lx + 92, ly - 30], [lx + 60, ly - 18], [lx + 20, ly]];
          fill(lamp, lp, k + 30, t, 0.6);
          lampR.setAttribute('d', [ringS(lp, k + 31, t, 4.5, 0.6), ringS(ell(lx - 10, ly - 46, 22, 8, 10), k + 32, t, 3, 0.5), lineS([[lx - 76, ly - 30], [lx - 110, ly - 46], [lx - 104, ly - 12], [lx - 70, ly - 10]], k + 33, t, 4)].join(' '));
          const fh = 110 * (1 - out) * (1 + 0.04 * hit);
          if (fh > 2) fl.update(t, lx + 82, ly - 38, 40, fh, 1, 2, false); else fl.update(t, lx + 82, ly - 38, 1, 0.1, 0, 1, false);
          glow.setAttribute('d', loopS(ell(lx + 70, ly - 80, 260 * (1 - out * 0.85), 220 * (1 - out * 0.85), 16), k + 34, t, 1.5));
          const SM = []; if (out > 0) for (let i = 0; i < 6; i++) { const u = clamp01((lt - sa) / 2.2 - i * 0.08); if (u <= 0) continue; const c = [lx + 82 + Math.sin(u * 7 + i) * 26, ly - 40 - u * 380 - i * 20]; SM.push(loopS(ell(c[0], c[1], 14 + u * 34, 12 + u * 22, 9), k + 40 + i, t, 1)); }
          smoke.setAttribute('d', SM.join(' '));
          // salamander walks over the table to the flame
          const so = salState(S, W, H, lt, cues, dur);
          sal.update(t, so);
          // Pliny
          if (pl) pl.update(lt, t, cues, W, H);
          // mosaic floor to the frame bottom
          fill(floor, [[-30, gy], [W + 30, gy], [W + 30, H + 30], [-30, H + 30]], k + 50, t, 0.6, false);
          const TL = [], TB = [], FR2 = [lineS([[-30, gy], [W + 30, gy]], k + 51, t, 6)];
          let yy = gy; for (let row = 0; row < 9; row++) { const h = 40 + row * 14, n = 9; for (let c = 0; c < n; c++) { const xa = lerp(-80, W + 80, c / n) + (lerp(-80, W + 80, c / n) - W / 2) * row * 0.05, xb = lerp(-80, W + 80, (c + 1) / n) + (lerp(-80, W + 80, (c + 1) / n) - W / 2) * row * 0.05, q = [[xa + 5, yy + 5], [xb - 5, yy + 5], [xb - 5 + (xb - W / 2) * 0.05, yy + h - 5], [xa + 5 + (xa - W / 2) * 0.05, yy + h - 5]]; if ((row + c) % 2 === 0) TL.push(loopS(q, k + 60 + row * 10 + c, t, 0.5, false)); else if ((row * 3 + c) % 4 === 1) TB.push(loopS(q, k + 60 + row * 10 + c, t, 0.5, false)); } FR2.push(lineS([[-30, yy + h], [W + 30, yy + h]], k + 160 + row, t, 2.5, 0.6)); yy += h; }
          tiles.setAttribute('d', TL.join(' ')); tilesB.setAttribute('d', TB.join(' ')); floorR.setAttribute('d', FR2.join(' '));
          // big scroll unrolled across the front with Pliny's "salamander in flames" sketch
          const by = 1500, bp = [[110, by - 110], [980, by - 130], [990, by + 150], [100, by + 170]];
          fill(big, bp, k + 170, t, 0.6, false);
          bigRoll.setAttribute('d', [loopS([[60, by - 140], [130, by - 140], [130, by + 200], [60, by + 200]], k + 171, t, 0.5, false), loopS([[960, by - 160], [1030, by - 160], [1030, by + 180], [960, by + 180]], k + 172, t, 0.5, false)].join(' '));
          bigR.setAttribute('d', [ringS(bp, k + 173, t, 4, 0.6, false), ringS([[60, by - 140], [130, by - 140], [130, by + 200], [60, by + 200]], k + 174, t, 4, 0.5, false), ringS([[960, by - 160], [1030, by - 160], [1030, by + 180], [960, by + 180]], k + 175, t, 4, 0.5, false)].join(' '));
          const BT = []; for (let i = 0; i < 6; i++) { const y = by - 80 + i * 44; BT.push(lineS([[170, y], [480, y - 4]].map((p, j) => [p[0], p[1] + Math.sin(i + j) * 3]), k + 180 + i, t, 3, 0.6)); }
          bigT.setAttribute('d', BT.join(' '));
          skFire.update(t, 760, by + 110, 300, 170, 1, 5, false);
          skSal.update(t, { x: 600, y: by + 40, s: 0.6, rot: 180, wig: 0.15, ph: t * 0.4 });
          // amphora (bottom left)
          const ap = [[60, 1900], [10, 1780], [20, 1650], [70, 1590], [70, 1550], [130, 1550], [130, 1590], [180, 1650], [190, 1780], [140, 1900]].map(p => [p[0] - 40, p[1] + 20]);
          fill(amph, ap, k + 190, t, 0.6); amphR.setAttribute('d', [ringS(ap, k + 191, t, 5, 0.6), lineS([[-10, 1640], [-30, 1600], [20, 1580]], k + 192, t, 5), lineS([[150, 1640], [170, 1600], [120, 1580]], k + 193, t, 5)].join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== fs_log
  SH.fs_log = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3301, top = el(svg, 'g'), root = el(top, 'g'), gy = 1150;
      const trunks = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.35)), trunkR = inkEl(root, mix(INK.inkSoft, INK.ink, 0.2));
      const LG = Object.assign({ x0: 0.06, x1: 0.94, y: 0.47, r: 0.09, cut: [0.3, 0.72] }, P.log || {});
      const lg = logDraw(el(root, 'g'), sd + 2);
      const S = Object.assign({ x: 0.36, y: 0.5, s: 0.6, rot: 200, curl: 0.55, sleep: true, wig: 0.03, idle: false }, P.sal || {});
      const sal = salamander(P.log && P.log.cut === false ? el(root, 'g') : lg.cutIn, sd + 4);
      const mush = inkEl(root, INK.red), mushS = inkEl(root, INK.paperLight), mushSt = inkEl(root, INK.paperLight), mushR = inkEl(root);
      const zz = inkEl(root, INK.inkSoft);
      const ground = inkEl(root, mix(INK.stain, INK.paperDark, 0.35)), groundR = inkEl(root);
      const ferns = [0, 1, 2].map(i => fern(el(root, 'g'), sd + 20 + i));
      const lit = litter(el(root, 'g'), sd + 30, W, gy + 40, H + 40, 30);
      const rain = inkEl(root, mix(INK.blue, INK.inkSoft, 0.4));
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const tor = P.torch ? torch(el(root, 'g'), sd + 9) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const x0 = LG.x0 * W, x1 = LG.x1 * W, cy = LG.y * H, r = LG.r * H;
          // tree trunks behind
          const TR = [], TL = []; [[0.12, 90], [0.5, 60], [0.86, 110]].forEach(([u, w], i) => { const x = u * W, p = [[x - w, gy - 40], [x - w * 0.7, 0], [x + w * 0.7, 0], [x + w, gy - 40]]; TR.push(loopS(p, k + 1 + i, t, 0.6, false)); TL.push(ringS(p, k + 5 + i, t, 4, 0.6, false)); for (let j = 0; j < 4; j++) TL.push(lineS([[x - w * 0.4 + j * w * 0.25, 80 + j * 60], [x - w * 0.45 + j * w * 0.28, gy - 120]], k + 10 + i * 4 + j, t, 2.5, 0.6)); });
          trunks.setAttribute('d', TR.join(' ')); trunkR.setAttribute('d', TL.join(' '));
          // ground band + leaf litter + ferns
          fill(ground, [[-30, gy - 30], [W + 30, gy - 40], [W + 30, H + 30], [-30, H + 30]], k + 30, t, 0.6, false);
          groundR.setAttribute('d', lineS([[-30, gy - 30], [W + 30, gy - 40]], k + 31, t, 5));
          ferns[0].update(t, 60, gy + 20, 1.2, 6, [-0.4, 1.1]); ferns[1].update(t, W - 40, gy + 30, 1.3, 6, [-1.1, 0.4]); ferns[2].update(t, W * 0.55, H - 120, 1.5, 7, [-1.2, 1.2]);
          // the log
          lg.update(t, x0, x1, cy, r, { moss: true, hollow: false, cut: LG.cut ? [LG.cut[0] * W, LG.cut[1] * W] : null });
          const so = salState(S, W, H, lt, cues, dur);
          const sr = sal.update(t, Object.assign(so, { s: so.s * (1 + 0.04 * hit) }));
          // mushrooms on the log top
          const M = [], MS = [], ST = [], MR = [];
          (P.mushrooms ?? [[0.78, 1], [0.84, 0.7], [0.2, 0.8]]).forEach(([u, s], i) => { const mx = u * W, my = cy - r - 6, h = 90 * s, w = 70 * s, cap = [[mx - w, my - h], [mx - w * 0.6, my - h - w * 0.6], [mx, my - h - w * 0.8], [mx + w * 0.6, my - h - w * 0.6], [mx + w, my - h], [mx, my - h + w * 0.12]]; ST.push(loopS([[mx - w * 0.2, my + 4], [mx - w * 0.16, my - h], [mx + w * 0.16, my - h], [mx + w * 0.2, my + 4]], k + 40 + i, t, 0.5, false)); M.push(loopS(cap, k + 44 + i, t, 0.6)); MR.push(ringS(cap, k + 48 + i, t, 4, 0.6), ringS([[mx - w * 0.2, my + 4], [mx - w * 0.16, my - h], [mx + w * 0.16, my - h], [mx + w * 0.2, my + 4]], k + 52 + i, t, 3.5, 0.5, false)); [[-0.5, -0.4], [0.1, -0.65], [0.5, -0.35]].forEach(([a, b], j) => MS.push(loopS(ell(mx + a * w, my - h + b * w, 9 * s, 7 * s, 7), k + 56 + i * 3 + j, t, 0.4))); });
          mush.setAttribute('d', M.join(' ')); mushS.setAttribute('d', MS.join(' ')); mushSt.setAttribute('d', ST.join(' ')); mushR.setAttribute('d', MR.join(' '));
          // Zzz over the sleeping salamander
          if (S.sleep && LG.cut) { const Z = []; for (let i = 0; i < 3; i++) { const u = (lt * 0.45 + i / 3) % 1, zx = sr.mid[0] + 60 + u * 120 + i * 10, zy = cy - r * 0.2 - u * 160, zs = 18 + u * 22; if (zy < cy - r * 0.6) continue; Z.push(lineS([[zx - zs, zy - zs], [zx + zs, zy - zs], [zx - zs, zy + zs], [zx + zs, zy + zs]], k + 70 + i, t, 4, 0.4)); } zz.setAttribute('d', Z.join(' ')); } else zz.setAttribute('d', '');
          lit.update(t);
          // rain
          if (P.rain !== false) { const R = []; for (let i = 0; i < 46; i++) { const u = (lt * 1.6 + hn(sd + i, 5)) % 1, x = hn(sd + i, 6) * (W + 200) - 100 - u * 60, y = -60 + u * (H + 120); R.push(lineS([[x, y], [x - 14, y + 70]], k + 100 + i, t, 3, 0.3)); } rain.setAttribute('d', R.join(' ')); } else rain.setAttribute('d', '');
          // narrator + UV torch
          let hand = null;
          if (kas) { const kr = kas.update(lt, t, cues, W, H); hand = kr.hand; }
          if (tor && hand) { const on = clamp01(lt * 3); tor.update(t, hand, [sr.mid[0], sr.mid[1]], on, 150, 44, 170); }
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== fs_head
  SH.fs_head = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3401, top = el(svg, 'g'), root = el(top, 'g');
      const soil = inkEl(root, mix(INK.stain, INK.paperDark, 0.4));
      const lit = litter(el(root, 'g'), sd + 30, W, 120, H + 40, 34);
      const S = Object.assign({ x: 0.5, y: 0.19, s: 4.2, rot: -90, wig: 0.03, idle: false }, P.sal || {});
      const sal = salamander(el(root, 'g'), sd + 4);
      const drops = inkEl(root, mix(INK.paperLight, INK.gold, 0.25)), dropR = inkEl(root), trails = inkEl(root, mix(INK.paperLight, INK.gold, 0.2), { 'fill-opacity': 0.7 });
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          fill(soil, [[-30, -30], [W + 30, -30], [W + 30, H + 30], [-30, H + 30]], k + 1, t, 0.4, false);
          lit.update(t);
          const so = salState(S, W, H, lt, cues, dur);
          const sr = sal.update(t, Object.assign(so, { y: so.y + Math.sin(lt * 1.3) * 10, ph: lt * 0.12, s: so.s * (1 + 0.025 * hit) }));
          // poison droplets fan out of both glands
          const sa = atOr(cues, P.spray, dur * 0.4), D = [], DR = [], TR = [];
          if (lt >= sa) sr.glands.forEach((gp, gi) => {
            const side = gi ? 1 : -1;
            for (let i = 0; i < 14; i++) {
              const per = 0.9, t0 = sa + (i % 7) * 0.07 + Math.floor(i / 7) * 0.45; if (lt < t0) continue; const u = (lt - t0) % per; if (u > per - 0.05) continue;
              const ang = -Math.PI / 2 + side * (0.55 + hn(sd + i + gi * 20, 1) * 0.9), v = 900 + hn(sd + i, 2) * 500;
              const x = gp[0] + Math.cos(ang) * v * u, y = gp[1] + Math.sin(ang) * v * u + 900 * u * u, rr = 10 + hn(sd + i, 3) * 12;
              D.push(loopS([[x, y - rr * 1.5], [x + rr, y], [x, y + rr], [x - rr, y]], k + 10 + gi * 20 + i, t, 0.4)); DR.push(ringS([[x, y - rr * 1.5], [x + rr, y], [x, y + rr], [x - rr, y]], k + 60 + gi * 20 + i, t, 3, 0.4));
              const u0 = Math.max(0, u - 0.12), xb = gp[0] + Math.cos(ang) * v * u0, yb = gp[1] + Math.sin(ang) * v * u0 + 900 * u0 * u0;
              TR.push(lineS([[xb, yb], [x, y]], k + 110 + gi * 20 + i, t, rr * 0.3, 0.3));
            }
            // a wet bead swelling on the gland
            const sw = clamp01((lt - sa) * 3); D.push(loopS(ell(gp[0], gp[1], 22 * sw, 18 * sw, 9), k + 160 + gi, t, 0.4)); DR.push(ringS(ell(gp[0], gp[1], 22 * sw, 18 * sw, 9), k + 162 + gi, t, 3, 0.4));
          });
          drops.setAttribute('d', D.join(' ')); dropR.setAttribute('d', DR.join(' ')); trails.setAttribute('d', TR.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== fs_lab
  // a jar on the bench (base y, height h)
  const jarPts = (x, y, w, h) => [[x - w, y], [x - w, y - h + 24], [x - w * 0.62, y - h], [x + w * 0.62, y - h], [x + w, y - h + 24], [x + w, y]];
  SH.fs_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3501, top = el(svg, 'g'), root = el(top, 'g'), by = P.bench ?? 1190;
      const DARK = mix(mix(INK.inkSoft, INK.blue, 0.4), INK.ink, 0.35), NIGHT = mix(INK.ink, INK.blue, 0.12);
      const wall = inkEl(root, DARK), shelf = inkEl(root, mix(DARK, INK.ink, 0.45)), jars = inkEl(root, mix(DARK, INK.paperLight, 0.12)), jarR = inkEl(root, mix(DARK, INK.paperLight, 0.35));
      const roomGlow = inkEl(root, GLOW(), { 'fill-opacity': 0 });
      const benchT = inkEl(root, mix(INK.stain, INK.ink, 0.42)), benchL = inkEl(root, mix(INK.stain, INK.ink, 0.6)), benchF = inkEl(root, mix(INK.stain, INK.ink, 0.66)), benchR = inkEl(root, mix(INK.stain, INK.ink, 0.85));
      const moss = inkEl(root, mix(INK.green, INK.ink, 0.45)), mossR = inkEl(root, mix(INK.green, INK.ink, 0.7));
      const sal = salamander(el(root, 'g'), sd + 4);
      const glass = inkEl(root, INK.paperLight, { 'fill-opacity': 0.06 }), glassR = inkEl(root, mix(DARK, INK.paperLight, 0.55)), glint = inkEl(root, INK.paperLight, { 'fill-opacity': 0.3 });
      // bench-top props in front of the tank: open notebook, specimen jars, torch cable
      const nbF = inkEl(root, INK.paperLight), nbR = inkEl(root), nbT = inkEl(root, INK.inkSoft), nbSal = salamander(el(root, 'g'), sd + 12);
      const cable = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2));
      const fj = inkEl(root, mix(INK.paperLight, DARK, 0.35), { 'fill-opacity': 0.8 }), fjL = inkEl(root, mix(INK.green, INK.stain, 0.4)), fjLid = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), fjLab = inkEl(root, INK.paperLight), fjR = inkEl(root);
      const sleeve = inkEl(root, INK.paperLight), sleeveR = inkEl(root), glove = inkEl(root, mix(INK.blue, INK.paperLight, 0.25)), gloveR = inkEl(root);
      const tor = torch(el(root, 'g'), sd + 9);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const S = Object.assign({ x: 0.2, y: 0.553, s: 1.05, rot: 186, wig: 0.08, curl: 0.04 }, P.sal || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const ua = atOr(cues, P.uv, 0.3), on = lt >= ua ? prog(lt, ua, 0.35) : 0;
          // the room goes dark when the UV torch is on (fill colours swap, no overlay layer)
          const dk = on, wallC = mix(DARK, NIGHT, dk);
          wall.setAttribute('fill', wallC); shelf.setAttribute('fill', mix(wallC, INK.ink, 0.45)); jars.setAttribute('fill', mix(wallC, INK.paperLight, 0.1 * (1 - dk) + 0.05)); jarR.setAttribute('fill', mix(wallC, INK.paperLight, 0.3 - 0.15 * dk));
          benchT.setAttribute('fill', mix(mix(INK.stain, INK.ink, 0.42), INK.ink, 0.5 * dk)); benchF.setAttribute('fill', mix(mix(INK.stain, INK.ink, 0.66), INK.ink, 0.5 * dk)); benchL.setAttribute('fill', mix(mix(INK.stain, INK.ink, 0.6), INK.ink, 0.5 * dk));
          fill(wall, [[-30, -30], [W + 30, -30], [W + 30, by + 10], [-30, by + 10]], k + 1, t, 0.4, false);
          const SHl = [], JR = [], JF = [];
          [360, 600].forEach((sy, i) => { SHl.push(loopS([[-30, sy], [W + 30, sy - 4], [W + 30, sy + 26], [-30, sy + 30]], k + 10 + i, t, 0.5, false)); for (let j = 0; j < 7; j++) { const jx = 330 + j * 115 + (i % 2) * 50, jh = 110 + hn(sd + i * 7 + j, 1) * 70, jw = 36 + hn(sd + j, 2) * 16; if (jx > W + 40) continue; const pp = jarPts(jx, sy, jw, jh); JF.push(loopS(pp, k + 20 + i * 10 + j, t, 0.5, false)); JR.push(ringS(pp, k + 40 + i * 10 + j, t, 3, 0.5, false)); } });
          shelf.setAttribute('d', SHl.join(' ')); jars.setAttribute('d', JF.join(' ')); jarR.setAttribute('d', JR.join(' '));
          // bench: deep top surface (by .. by + 480), front edge to the frame bottom
          const fy = by + 480;
          fill(benchT, [[-30, by - 20], [W + 30, by - 24], [W + 30, fy], [-30, fy]], k + 70, t, 0.5, false);
          fill(benchL, [[-30, fy], [W + 30, fy], [W + 30, fy + 40], [-30, fy + 40]], k + 71, t, 0.5, false);
          fill(benchF, [[-30, fy + 40], [W + 30, fy + 40], [W + 30, H + 30], [-30, H + 30]], k + 72, t, 0.5, false);
          const BR = [lineS([[-30, by - 20], [W + 30, by - 24]], k + 73, t, 5), lineS([[-30, fy], [W + 30, fy]], k + 74, t, 5), lineS([[-30, fy + 40], [W + 30, fy + 40]], k + 75, t, 4)];
          for (let i = 1; i < 5; i++) BR.push(lineS([[-30, by + i * 96], [W + 30, by + i * 96 - 3]], k + 76 + i, t, 2, 0.5));
          benchR.setAttribute('d', BR.join(' '));
          // tank (glass box) with moss, standing on the bench
          const gx0 = 70, gx1 = 1010, gyT = P.tankTop ?? 640, gyB = by - 22;
          fill(moss, [[gx0 + 10, gyB], [gx0 + 10, gyB - 70], [gx0 + 200, gyB - 96], [gx0 + 480, gyB - 76], [gx1 - 200, gyB - 98], [gx1 - 10, gyB - 74], [gx1 - 10, gyB]], k + 100, t, 0.8);
          mossR.setAttribute('d', [0, 1, 2, 3, 4, 5, 6].map(i => lineS([[gx0 + 70 + i * 125, gyB - 56], [gx0 + 92 + i * 125, gyB - 86]], k + 101 + i, t, 3, 0.5)).join(' '));
          roomGlow.setAttribute('d', on > 0 ? loopS(ell((gx0 + gx1) / 2, gyB - 120, 620, 330, 16), k + 110, t, 1) : ''); roomGlow.setAttribute('fill-opacity', (0.2 * on).toFixed(3));
          const so = salState(Object.assign({}, S, { uv: on }), W, H, lt, cues, dur);
          const sr = sal.update(t, Object.assign(so, { s: so.s * (1 + 0.04 * hit), ph: lt * 0.12 }));
          const gq = [[gx0, gyT], [gx1, gyT], [gx1, gyB], [gx0, gyB]];
          fill(glass, gq, k + 111, t, 0.4, false);
          glassR.setAttribute('d', [ringS(gq, k + 112, t, 5, 0.4, false), lineS([[gx0 + 30, gyT + 20], [gx0 + 30, gyB - 10]], k + 113, t, 3)].join(' '));
          glint.setAttribute('d', loopS([[gx1 - 120, gyT + 30], [gx1 - 84, gyT + 30], [gx1 - 170, gyB - 120], [gx1 - 206, gyB - 120]], k + 114, t, 0.4, false));
          // open field notebook (left) with a salamander sketch
          const nx = 300, ny = by + 250, np = [[nx - 250, ny - 120], [nx + 250, ny - 130], [nx + 270, ny + 140], [nx - 270, ny + 150]];
          fill(nbF, np, k + 120, t, 0.5, false);
          nbR.setAttribute('d', [ringS(np, k + 121, t, 4, 0.5, false), lineS([[nx - 5, ny - 125], [nx + 5, ny + 145]], k + 122, t, 3)].join(' '));
          nbT.setAttribute('d', [0, 1, 2, 3, 4].map(i => lineS([[nx + 30, ny - 80 + i * 44], [nx + 230, ny - 82 + i * 44]], k + 123 + i, t, 2.5, 0.6)).concat([lineS([[nx - 230, ny + 100], [nx - 40, ny + 98]], k + 130, t, 2.5, 0.6)]).join(' '));
          nbSal.update(t, { x: nx - 225, y: ny - 10, s: 0.34, rot: 178, wig: 0.15, ph: 0.2, uv: on * 0.0 });
          // specimen jars (right) on the bench
          const FJ = [], FL = [], LD = [], LB = [], FR = [];
          [[800, by + 380, 70, 280], [940, by + 330, 56, 220]].forEach(([x, y, w, h], i) => { const pp = jarPts(x, y, w, h); FJ.push(loopS(pp, k + 140 + i, t, 0.5, false)); FL.push(loopS([[x - w + 8, y - 6], [x - w + 8, y - h * 0.45], [x + w - 8, y - h * 0.5], [x + w - 8, y - 6]], k + 142 + i, t, 0.5, false)); LD.push(loopS([[x - w * 0.7, y - h], [x + w * 0.7, y - h], [x + w * 0.7, y - h - 30], [x - w * 0.7, y - h - 30]], k + 144 + i, t, 0.4, false)); LB.push(loopS([[x - w * 0.6, y - h * 0.8], [x + w * 0.6, y - h * 0.8], [x + w * 0.6, y - h * 0.62], [x - w * 0.6, y - h * 0.62]], k + 146 + i, t, 0.4, false)); FR.push(ringS(pp, k + 148 + i, t, 4, 0.5, false)); });
          fj.setAttribute('d', FJ.join(' ')); fjL.setAttribute('d', FL.join(' ')); fjLid.setAttribute('d', LD.join(' ')); fjLab.setAttribute('d', LB.join(' ')); fjR.setAttribute('d', FR.join(' '));
          // sleeve + gloved hand from the left holding the torch above the tank
          const hx = 250 + Math.sin(t * 0.9) * 8, hy = 470 + Math.sin(t * 1.1) * 6;
          cable.setAttribute('d', lineS([[hx - 60, hy + 20], [60, hy + 200], [30, by - 40], [140, by + 60], [560, by + 70], [640, fy - 30], [700, fy + 10], [W + 40, fy + 10]], k + 160, t, 9, 0.6));
          const slv = [[-40, 300], [hx - 70, hy - 70], [hx - 40, hy + 40], [-40, 480]];
          fill(sleeve, slv, k + 161, t, 0.6, false); sleeveR.setAttribute('d', ringS(slv, k + 162, t, 5, 0.6, false));
          const gp = [[hx - 70, hy - 60], [hx + 20, hy - 70], [hx + 70, hy - 30], [hx + 60, hy + 30], [hx - 10, hy + 50], [hx - 50, hy + 40]];
          fill(glove, gp, k + 163, t, 0.6); gloveR.setAttribute('d', ringS(gp, k + 164, t, 4.5, 0.6));
          tor.update(t, [hx + 30, hy - 10], [sr.mid[0], sr.mid[1] - 10], on, 190, 58, 300);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== fs_years
  SH.fs_years = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3601, top = el(svg, 'g'), root = el(top, 'g'), dy = 1060;
      const N = P.sheets ?? 3, SHT = Array.from({ length: N }, (_, i) => ({ g: el(root, 'g') }));
      SHT.forEach((s, i) => { s.paper = inkEl(s.g, INK.paperLight); s.r = inkEl(s.g); s.txt = inkEl(s.g, INK.inkSoft); s.pin = inkEl(s.g, INK.red); s.sal = salamander(s.g, sd + 40 + i); });
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const desk = inkEl(root, WOOD()), deskF = inkEl(root, mix(WOOD(), INK.ink, 0.22)), nbF = inkEl(root, INK.paperLight), boxF = inkEl(root, mix(WOOD(), INK.stain, 0.5)), boxIn = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.4)), deskR = inkEl(root), knobs = inkEl(root, INK.inkSoft);
      const nbSal = salamander(el(root, 'g'), sd + 70), boxSal = salamander(el(root, 'g'), sd + 71);
      const books = inkEl(root, mix(INK.red, INK.stain, 0.4)), books2 = inkEl(root, mix(INK.blue, INK.paperDark, 0.3)), books3 = inkEl(root, mix(INK.green, INK.paperDark, 0.3)), booksP = inkEl(root, INK.paperLight), booksR = inkEl(root);
      const mag = inkEl(root, mix(INK.ink, INK.stain, 0.3)), magG = inkEl(root, INK.paperLight, { 'fill-opacity': 0.45 }), magR = inkEl(root);
      const C = Object.assign({ to: 250, x: 0.72, y: 0.2, at: 0.1, dur: 1.4, size: 220 }, P.counter || {});
      const ctr = el(top, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 18px; stroke-linejoin: round` });
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.6));
          const a = atOr(cues, C.at, 0.1), p = lt >= a ? prog(lt, a, C.dur) : 0, v = Math.round(lerp(0, C.to, p)), sp = lt >= a ? spring(lt, a, 0.5) : 0, pk = punch(lt, a + C.dur, 0.5), b = boil(sd, t, 1.2);
          ctr.textContent = String(v) + (C.suffix || '');
          ctr.setAttribute('opacity', clamp01(sp * 3).toFixed(3));
          ctr.setAttribute('transform', `translate(${f1(C.x * W + b[0])} ${f1(C.y * H + b[1])}) scale(${(lerp(0.5, 1, sp) * (1 + 0.1 * pk)).toFixed(3)})`);
          // pinned field sketches, one after another while the count runs
          SHT.forEach((s, i) => {
            const cx = [0.17, 0.41, 0.645][i % 3] * W, cy = (0.35 + (i % 2) * 0.025) * H, rot = [-5, 3, -2][i % 3], ap = a + i * (C.dur / N) * 0.9, q = lt >= ap ? spring(lt, ap, 0.5) : 0;
            s.g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${rot}) scale(${(lerp(0.3, 1, q)).toFixed(3)})`);
            s.g.setAttribute('opacity', clamp01(q * 3).toFixed(3));
            const pp = [[-130, -150], [130, -154], [134, 150], [-128, 154]];
            fill(s.paper, pp, k + 10 + i, t, 0.5, false); s.r.setAttribute('d', ringS(pp, k + 20 + i, t, 3.5, 0.5, false));
            s.txt.setAttribute('d', [0, 1].map(j => lineS([[-100, 100 + j * 24], [90 - j * 40, 98 + j * 24]], k + 30 + i * 2 + j, t, 2.5, 0.6)).join(' '));
            s.pin.setAttribute('d', loopS(ell(0, -138, 13, 13, 8), k + 36 + i, t, 0.4));
            s.sal.update(t, { x: -95, y: -10 + i * 6, s: 0.36, rot: 180 + (i - 1) * 8, wig: 0.14, ph: i * 0.3 });
          });
          if (kas) kas.update(lt, t, cues, W, H);
          // desk to the frame bottom
          const dp = [[-30, dy], [W + 30, dy - 4], [W + 30, dy + 60], [-30, dy + 64]];
          fill(desk, dp, k + 50, t, 0.5, false);
          fill(deskF, [[-30, dy + 64], [W + 30, dy + 60], [W + 30, H + 30], [-30, H + 30]], k + 51, t, 0.5, false);
          const DR = [ringS(dp, k + 52, t, 5, 0.5, false)], KN = [];
          // desk front: open field notebook with a sketch, a pinned specimen box, ink pot + quill
          const nx = 330, ny = 1480, np = [[nx - 280, ny - 170], [nx + 280, ny - 180], [nx + 300, ny + 190], [nx - 300, ny + 200]];
          KN.push(''); DR.push(ringS(np, k + 53, t, 4, 0.5, false), lineS([[nx - 5, ny - 175], [nx + 5, ny + 195]], k + 54, t, 3));
          for (let i = 0; i < 6; i++) DR.push(lineS([[nx + 40, ny - 120 + i * 50], [nx + 250, ny - 122 + i * 50]], k + 55 + i, t, 2.5, 0.6));
          const bx0 = 690, by0 = 1330, bq = [[bx0, by0], [bx0 + 330, by0 - 6], [bx0 + 340, by0 + 300], [bx0 + 6, by0 + 306]];
          DR.push(ringS(bq, k + 62, t, 5, 0.5, false), ringS(bq.map(p => [lerp(p[0], bx0 + 170, 0.12), lerp(p[1], by0 + 150, 0.12)]), k + 63, t, 3, 0.5, false));
          DR.push(loopS(ell(860, 1790, 70, 34, 12), k + 64, t, 0.5), ringS(ell(860, 1790, 70, 34, 12), k + 65, t, 4, 0.5), lineS([[880, 1770], [1010, 1560 + Math.sin(t * 1.4) * 6]], k + 66, t, 6));
          nbF.setAttribute('d', loopS(np, k + 67, t, 0.5, false)); boxF.setAttribute('d', loopS(bq, k + 68, t, 0.5, false)); boxIn.setAttribute('d', loopS(bq.map(p => [lerp(p[0], bx0 + 170, 0.12), lerp(p[1], by0 + 150, 0.12)]), k + 69, t, 0.5, false));
          nbSal.update(t, { x: nx - 250, y: ny + 10, s: 0.38, rot: 176, wig: 0.15, ph: 0.4 });
          boxSal.update(t, { x: bx0 + 50, y: by0 + 150, s: 0.42, rot: 180, curl: 0.05, wig: 0.06, ph: 0.1 });
          deskR.setAttribute('d', DR.join(' ')); knobs.setAttribute('d', KN.join(' '));
          // stack of notebooks growing with the count
          const nb = Math.max(1, Math.round(lerp(1, 6, p))), B1 = [], B2 = [], B3 = [], BP = [], BR = [];
          for (let i = 0; i < nb; i++) { const h = 40, y1 = dy - i * h, w = 300 - (i % 3) * 22, x = 230 + Math.sin(i * 2.1) * 20, q = [[x - w / 2, y1], [x + w / 2, y1], [x + w / 2 - 4, y1 - h + 4], [x - w / 2 + 4, y1 - h + 4]]; [B1, B2, B3][i % 3].push(loopS(q, k + 70 + i, t, 0.5, false)); BP.push(loopS([[x + w / 2 - 30, y1 - 6], [x + w / 2 - 6, y1 - 6], [x + w / 2 - 8, y1 - h + 10], [x + w / 2 - 30, y1 - h + 10]], k + 80 + i, t, 0.4, false)); BR.push(ringS(q, k + 90 + i, t, 3.5, 0.5, false)); }
          books.setAttribute('d', B1.join(' ')); books2.setAttribute('d', B2.join(' ')); books3.setAttribute('d', B3.join(' ')); booksP.setAttribute('d', BP.join(' ')); booksR.setAttribute('d', BR.join(' '));
          // magnifier on the desk
          const mx = 560, my = dy - 40, sw = Math.sin(t * 0.8) * 4;
          magG.setAttribute('d', loopS(ell(mx, my, 70, 30, 14), k + 100, t, 0.5));
          mag.setAttribute('d', lineS([[mx + 70, my + 6], [mx + 230, my + 20 + sw]], k + 101, t, 20));
          magR.setAttribute('d', ringS(ell(mx, my, 70, 30, 14), k + 102, t, 8, 0.5));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
