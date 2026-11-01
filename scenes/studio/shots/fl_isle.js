// fl_isle: the Flannan Isles lighthouse mystery (Eilean Mor, December 1900) in parchment ink (brand/kit/BRAND.md §3,
// §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt), no
// Math.random. Written for the Stickstory long video (2026-11-01) but parametric: any rock lighthouse / cliff landing /
// keepers' cottage / handwritten record. Needs mcB__lib.js (MCB.cast, MCB.labels, MCB.sea, MCB.camPush).
//
// K (figure) = {x, y (ground, 0..1 H), scale: 0.5, pose, face: "left"|"right", dir, emotion, accessory, beard,
//               seq: [{at, pose, dir, face, emotion, text, item}], text, item}
//   P.kasif = K (the narrator, fez via the script's narrator) · P.men = [K] period figures (no hat; lint does not count them)
// L (label)  = MCB.labels entry {text, x, y, at, size, color, font: "hand"|"serif", stamp, strike, arrow, rot}
//
// SHOTS.fl_isle — side view across the sea to a high cliff island with a lighthouse on top (keepers' cottage + wall,
//   flagpole), breakers at its foot, an optional relief steamer (whistle arcs, a rocket), a giant wave that climbs the
//   cliff, rain, gulls, tiny figures on the plateau, a near rock ledge for the narrator. Use "set": "storm"|"night"|"ocean".
//   P: {sea: 0.72 (water line, 0..1 H), isle: {x: 0.62, w: 0.62, h: 0.42, lx: 0.36 (lighthouse along the island)},
//       tower: 0.2 (tower height, 0..1 H), ghost: false|true|cue (light off: a faint cut-off beam, from the cue on), dead: false (light off: ink-black glass), light: "on"|"off"|{off: cue}|{on: cue} (beam sweeps while on), glow: 1,
//       flag: "none"|"flag", steps: true, ship: {x: 0.2, to, at, dur, s: 1, y (waterline), smoke: true, name} | false,
//       whistle: cue|s, rocket: cue|s, wave: {at, dur: 2.4, top: 0.9 (share of the cliff), side: "left"|"right"},
//       rain: false, gulls: 3, men: [K + {u: 0..1 along the island top (sets x, y)}], rock: {x: 0.14, w: 0.34} | false,
//       kasif: K, labels: [L], shake: cue, zoom: 1.04}
//   cues: hit (punch), whistle, rocket, wave.at, light.on/off, label / seq names
//
// SHOTS.fl_landing — close side view of a cliff landing: sea at the bottom, a sheer cliff face filling the right of the
//   frame, a concrete stair + iron tramway climbing it diagonally with railings, a small crane at the landing, a rope
//   box wedged in a crevice, a big boulder, the turf edge on top, a height ruler on the left in feet.
//   P: {sea: 0.86, top: 0.2 (cliff top, 0..1 H), feet: 230 (height of the cliff top), marks: [{ft: 110, text, at, color, x1: 0.6 (dash end), lx (label x, 0..1)}],
//       box: {u: 0.42 (along the path), smash: cue} , rail: {rip: cue}, railing: {bend: cue}, boulder: {move: cue},
//       turf: {tear: cue}, broken: cue (all of the damage at once), wave: {at, dur: 2.6, to: 0.2 (y it reaches, 0..1 H), hold: 1},
//       men: [K + {u: 0..1 along the path, to: u, at, dur, swept: cue (the wave takes them)}], kasif: K, labels: [L],
//       spray: true, rain: false, shake: cue, pole: {x: 0.86, h: 0.3, flag: false} (flagpole on the cliff top)}
//   cues: hit, the damage cues, wave.at, marks "at", labels / seq names
//
// SHOTS.fl_room — inside the keepers' quarters, on the "interior" set (floor line P.floor). P.mode:
//   "kitchen": table + two chairs, a dresser with plates, a range with pots, a wall clock;
//              P.table: "clean" | "meal" (plates, cups, bread) and P.chair: "up" | "down" (one chair knocked over)
//   "hall":    a row of coat pegs (P.coats: ["coat", "empty", "empty"], hl: {i, at} red ring), sea boots, a door (P.door: "open"|"shut")
//   "beds":    two empty box beds, a cold stove (P.fire: false)
//   "lantern": the lantern room: a big beehive lens on its pedestal, the lamp (P.lamp: "on"|"off"|{on: cue}), storm panes
//   P.shelf: true|{x, y, w} (wall shelf with stacked plates and pots), P.card: {title, items: [{text, mark: "check"|"x", at}], x, y, w, size: 54}
//     (a checklist pinned on the wall; marks land on their cues). SHOTS.fl_lantern = fl_room with mode "lantern".
//   Shared: P.clock: {x: 0.66, y: 0.3, r: 70, stopped: true|cue (stops on cue), ring: cue, time: [h, m]}, P.window (default only in the hall; the interior set has its own),
//           P.rain: true, P.floor: 0.8, men: [K], kasif: K, labels: [L], myth: {at, text: "MYTH"} (red stamp)
//   cues: hit, hl.at, clock.stopped, lamp.on, labels / seq names
//
// SHOTS.fl_chart — full-frame sea chart (see the comment above SH.fl_chart). SHOTS.fl_lantern — fl_room mode "lantern".
//
// SHOTS.fl_paper — a desk filling the frame with one document on it. P.kind: "slate" (chalk on a framed slate) | "log"
//   (an open ledger, ruled, with a date column) | "telegram" (a telegraph form). Hand-written lines write themselves
//   letter by letter with a pen/chalk tip at the end; scribble rows (unreadable writing) fill the page.
//   P: {kind, lines: [{text, at, dur: 1.4, size: 64, color: "ink"|"red"|"blue", x, y (0..1 of the page), strike: cue}],
//       scribble: {rows: 6, at: 0.2, dur: 4, y0: 0.2, y1: 0.85}, header: "TELEGRAM", stamp: {text, at, color: "red", x, y, rot},
//       lamp: true, labels: [L], zoom}
//   cues: hit, lines[].at, lines[].strike, stamp.at, labels
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const fillP = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ringP = (e, pts, sd, t, w = 5, amp = 1, smooth = true) => e.setAttribute('d', inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth }));
  const ln = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const COLS = () => ({ red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft, paper: INK.paperLight });

  // ------------------------------------------------------------------ a figure (narrator or period figure)
  function figure(parent, K, sd, hat) {
    const rig = KASIF.create(el(parent, 'g'), { scale: K.scale ?? 0.5, hat, accessory: hat ? null : (K.accessory || null), beard: hat ? null : (K.beard || null), seed: sd });
    const gait = KASIF.gait ? KASIF.gait(K.run ? 'run' : 'walk') : 120;
    return {
      update(lt, t, cues, x, y, o = {}) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion, text: K.text, item: K.item }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({ text: K.text, item: K.item }, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        let pose = s.pose || 'idle', face = faceOf(s.face ?? K.face, 1), ph = 0;
        if (o.walking) { pose = K.run ? 'run' : 'walk'; face = o.dirx < 0 ? -1 : 1; ph = o.dist / (gait * (K.scale ?? 0.5)); }
        const op = { x, y, face, since, ph, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, text: s.text, item: s.item };
        if (pv && since < 0.32 && !o.walking) { op.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir), text: pv.text, item: pv.item }; op.mix = since / 0.32; }
        rig.update(t, pose, op);
      },
    };
  }

  // ------------------------------------------------------------------ rain streaks over the whole frame
  function rain(parent, W, H, sd, n = 70) {
    const e = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0.55 }), r = rng(sd), R = Array.from({ length: n }, () => [r(), r(), r()]);
    return { update(t) {
      e.setAttribute('d', R.map((q, i) => {
        const L = 40 + q[2] * 50, y = ((q[1] * (H + 200) + t * (900 + q[2] * 300)) % (H + 200)) - 100, x = ((q[0] * (W + 300) - t * 260 - (y * 0.3)) % (W + 300) + W + 300) % (W + 300) - 150;
        return inkPath([[x, y], [x - L * 0.32, y + L]], { w: 2.2, seed: sd + i, t, amp: 0.5 });
      }).join(' '));
    } };
  }

  // ------------------------------------------------------------------ gulls
  function gulls(parent, W, H, sd, n) {
    const e = inkEl(parent, INK.ink), r = rng(sd + 5), G = Array.from({ length: n }, () => [r(), r(), r()]);
    return { update(t) {
      e.setAttribute('d', G.map((g, i) => {
        const x = ((g[0] * W + t * (30 + g[2] * 30)) % (W * 1.1)) - W * 0.05, y = H * (0.12 + g[1] * 0.22) + Math.sin(t * 1.3 + i) * 10, s = 14 + g[2] * 12, f = Math.sin(t * 6 + i * 2) * 0.5;
        return inkPath([[x - s, y - s * (0.2 + f)], [x - s * 0.45, y - s * 0.35], [x, y], [x + s * 0.45, y - s * 0.35], [x + s, y - s * (0.2 + f)]], { w: 3.5, seed: sd + 20 + i, t, amp: 0.6 });
      }).join(' '));
    } };
  }

  // ------------------------------------------------------------------ small relief steamer (side view, bow right), waterline y = 0
  function steamer(parent, sd) {
    const g = el(parent, 'g');
    const smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.4 }), puff = inkEl(g, INK.paperLight, { 'fill-opacity': 0.9 }), arcs = inkEl(g, INK.inkSoft);
    const masts = inkEl(g), hull = inkEl(g, mix(INK.ink, INK.inkSoft, 0.25)), hullR = inkEl(g), band = inkEl(g, INK.paperLight);
    const hse = inkEl(g, INK.paperLight), hseR = inkEl(g), fun = inkEl(g, INK.stain), funR = inkEl(g), funB = inkEl(g, INK.red);
    return {
      update(t, x, y, s, rot, o = {}) {
        const a = rot * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a), R = p => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s], k = sd * 11;
        const hp = [[-300, -60], [250, -64], [330, -96], [292, 22], [-270, 24], [-316, -16]];
        fillP(hull, hp.map(R), k + 1, t); ringP(hullR, hp.map(R), k + 2, t, 6);
        band.setAttribute('d', inkPath([[-300, -40], [300, -44]].map(R), { w: 5, seed: k + 3, t, amp: 0.8 }));
        const hs = [[-90, -62], [-86, -126], [80, -128], [86, -64]];
        fillP(hse, hs.map(R), k + 4, t, 1, false); ringP(hseR, hs.map(R), k + 5, t, 5, 1, false);
        hseR.setAttribute('d', hseR.getAttribute('d') + ' ' + [-60, -20, 20, 50].map((wx, i) => inkLoop(rect(wx, -110, 18, 16).map(R), { seed: k + 6 + i, t, smooth: false, amp: 0.5 })).join(' '));
        const fp = [[-10, -126], [-4, -230], [44, -230], [50, -126]];
        fillP(fun, fp.map(R), k + 12, t, 1, false); ringP(funR, fp.map(R), k + 13, t, 5, 1, false);
        fillP(funB, [[-6, -205], [46, -205], [47, -185], [-7, -185]].map(R), k + 14, t, 0.6, false);
        masts.setAttribute('d', [ln([[-220, -62], [-220, -300]].map(R), k + 20, t, 5), ln([[200, -64], [200, -290]].map(R), k + 21, t, 5),
          ln([[-220, -300], [-316, -18]].map(R), k + 22, t, 2.2), ln([[200, -290], [328, -94]].map(R), k + 23, t, 2.2), ln([[-220, -300], [200, -290]].map(R), k + 24, t, 2)].join(' '));
        if (o.smoke !== false) {
          const S = [];
          for (let i = 0; i < 6; i++) { const u = ((t * 0.3 + i / 6) % 1), q = R([20 - u * 420, -240 - u * 110 - Math.sin(u * 6 + i) * 16]); S.push(inkLoop(ell(q[0], q[1], (24 + u * 60) * s, (18 + u * 38) * s, 10), { seed: k + 40 + i, t, amp: 1.4 })); }
          smoke.setAttribute('d', S.join(' '));
        } else smoke.setAttribute('d', '');
        // whistle: a white steam puff at the funnel + sound arcs
        if (o.whistle != null && o.whistle >= 0 && o.whistle < 3.2) {
          const w = o.whistle, q = R([60, -228]), pr = Math.min(1, w / 0.4) * (w < 2.6 ? 1 : 1 - (w - 2.6) / 0.6);
          puff.setAttribute('d', inkLoop(ell(q[0] + 20 * s, q[1] - 30 * s * pr, 30 * s * pr + 1, 22 * s * pr + 1, 10), { seed: k + 60, t, amp: 1 }));
          const A = [];
          for (let j = 0; j < 3; j++) { const ph = ((w * 1.2 + j / 3) % 1), rr = (40 + ph * 160) * s; if (w > 2.8) continue; const pts = []; for (let m = -4; m <= 4; m++) { const an = m * 0.16 - 0.5; pts.push([q[0] + 30 * s + Math.cos(an) * rr, q[1] - 30 * s + Math.sin(an) * rr]); } A.push(inkPath(pts, { w: 5 * (1 - ph) + 1, seed: k + 70 + j, t, amp: 1 })); }
          arcs.setAttribute('d', A.join(' '));
        } else { puff.setAttribute('d', ''); arcs.setAttribute('d', ''); }
        return { R, deck: R([-200, -66]), funnel: R([20, -230]) };
      },
    };
  }

  // ------------------------------------------------------------------ the lighthouse (tower + lantern), ground at y = 0, height h px
  function lighthouse(parent, sd) {
    const g = el(parent, 'g');
    const beam = inkEl(g, INK.gold, { 'fill-opacity': 0.32 }), glow = inkEl(g, INK.gold, { 'fill-opacity': 0.4 });
    const body = inkEl(g, INK.paperLight), bodyR = inkEl(g), dome = inkEl(g, INK.ink), lan = inkEl(g, INK.inkSoft), lanR = inkEl(g), core = inkEl(g, INK.gold), det = inkEl(g);
    return {
      update(t, x, y, h, on, o = {}) {
        const k = sd * 13, bw = h * 0.16, tw = h * 0.11, ly = y - h * 0.82;
        const bp = [[x - bw, y], [x - tw, ly], [x + tw, ly], [x + bw, y]];
        fillP(body, bp, k + 1, t, 0.8, false); ringP(bodyR, bp, k + 2, t, Math.max(3, h * 0.02), 0.8, false);
        const gl = [[x - tw * 1.35, ly], [x + tw * 1.35, ly]], lt0 = ly - h * 0.12, lp = rect(x - tw * 0.95, lt0, tw * 1.9, h * 0.12);
        lan.setAttribute('fill', on > 0.5 ? INK.paperLight : (o.dead ? INK.ink : INK.inkSoft));
        fillP(lan, lp, k + 3, t, 0.6, false); ringP(lanR, lp, k + 4, t, Math.max(2.5, h * 0.016), 0.6, false);
        fillP(dome, [[x - tw * 1.1, lt0], [x - tw * 0.6, lt0 - h * 0.06], [x, lt0 - h * 0.085], [x + tw * 0.6, lt0 - h * 0.06], [x + tw * 1.1, lt0]], k + 5, t, 0.6);
        const D = [ln(gl, k + 6, t, Math.max(3, h * 0.02)), ln([[x, lt0 - h * 0.085], [x, lt0 - h * 0.12]], k + 7, t, Math.max(2, h * 0.012)),
          ln([[x - tw * 0.3, lt0], [x - tw * 0.3, ly]], k + 8, t, 2), ln([[x + tw * 0.3, lt0], [x + tw * 0.3, ly]], k + 9, t, 2)];
        for (let i = 1; i <= 2; i++) { const yy = y - h * 0.82 * i / 3; D.push(ln([[x - lerp(bw, tw, i / 3) * 0.3, yy], [x + lerp(bw, tw, i / 3) * 0.3, yy - 2]], k + 10 + i, t, 2)); }
        D.push(inkLoop(rect(x - bw * 0.25, y - h * 0.16, bw * 0.5, h * 0.16), { seed: k + 15, t, smooth: false, amp: 0.6 }));
        det.setAttribute('d', D.join(' '));
        const cx = x, cy = lt0 + h * 0.06;
        if (on > 0.01) {
          core.setAttribute('d', inkLoop(ell(cx, cy, tw * 0.45, h * 0.035, 10), { seed: k + 20, t, amp: 0.6 }));
          glow.setAttribute('d', inkLoop(ell(cx, cy, h * 0.22 * on * (o.glow ?? 1), h * 0.2 * on * (o.glow ?? 1), 16), { seed: k + 21, t, amp: 2 }));
          if (o.beam !== false) {
            const ph = (t * 0.45) % 1, side = ph < 0.5 ? -1 : 1, q = Math.sin((ph % 0.5) / 0.5 * Math.PI);   // the beam swings toward us and away
            const L = h * (1.2 + 5.2 * q) * on, sp = h * (0.05 + 0.1 * q);
            beam.setAttribute('d', inkLoop([[cx, cy - h * 0.02], [cx + side * L, cy - sp - L * 0.02], [cx + side * L, cy + sp + L * 0.03], [cx, cy + h * 0.02]], { seed: k + 22, t, amp: 2, smooth: false }));
          } else beam.setAttribute('d', '');
        } else {
          core.setAttribute('d', ''); glow.setAttribute('d', '');
          if (o.ghost) {   // a faint, cut-off memory of the beam: it reaches a little way out and stops
            const L = h * (0.9 + 0.15 * Math.sin(t * 2)), sp = h * 0.07;
            beam.setAttribute('fill-opacity', '0.13');
            beam.setAttribute('d', inkLoop([[cx, cy - h * 0.02], [cx - L, cy - sp], [cx - L * 0.96, cy + sp], [cx, cy + h * 0.02]], { seed: k + 23, t, amp: 2, smooth: false }));
          } else beam.setAttribute('d', '');
        }
        if (on > 0.01) beam.setAttribute('fill-opacity', '0.32');
        return { lamp: [cx, cy], top: [x, lt0 - h * 0.12] };
      },
    };
  }

  // ================================================================== fl_isle
  SH.fl_isle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, sd = seed * 1000 + 401, u = Math.min(W, H) / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const seaY = (P.sea ?? 0.72) * H;
      const I = Object.assign({ x: 0.62, w: 0.62, h: 0.42, lx: 0.36 }, P.isle || {});
      const ix0 = (I.x - I.w / 2) * W, iw = I.w * W, ih = I.h * H;
      // island profile (left base -> right base), y measured up from the water line
      const prof = [[0, -0.02], [0.03, 0.55], [0.06, 0.82], [0.12, 0.9], [0.24, 0.96], [0.36, 1], [0.48, 0.95], [0.58, 0.86], [0.7, 0.9], [0.8, 0.93], [0.9, 0.84], [0.95, 0.6], [0.985, 0.2], [1, -0.02]];
      const PX = p => [ix0 + p[0] * iw, seaY - p[1] * ih];
      const topY = fx => { for (let i = 1; i < prof.length; i++) if (prof[i][0] >= fx) { const a = prof[i - 1], b = prof[i], q = (fx - a[0]) / Math.max(1e-6, b[0] - a[0]); return seaY - lerp(a[1], b[1], q) * ih; } return seaY; };
      const far = el(cam, 'g');
      const rains = P.rain ? rain(el(cam, 'g'), W, H, sd + 3) : null;
      const gls = (P.gulls ?? 3) > 0 ? gulls(far, W, H, sd + 4, P.gulls ?? 3) : null;
      const isle = el(cam, 'g');
      const rock = inkEl(isle, mix(INK.paperDark, INK.stain, 0.55)), rockR = inkEl(isle), hatch = inkEl(isle, INK.inkSoft, { 'fill-opacity': 0.8 }), grass = inkEl(isle, INK.green, { 'fill-opacity': 0.85 });
      const walls = inkEl(isle, INK.paperLight), wallsR = inkEl(isle), steps = inkEl(isle, INK.ink), pole = inkEl(isle), flag = inkEl(isle, INK.red);
      const lh = lighthouse(isle, sd + 7);
      const menG = el(cam, 'g'), men = (P.men || []).map((m, i) => ({ m, f: figure(menG, m, sd + 30 + i * 7, false) }));
      const shipG = el(cam, 'g'), ship = P.ship ? steamer(shipG, sd + 9) : null;
      const rocket = inkEl(cam, INK.red), sparks = inkEl(cam, INK.gold);
      const waveG = el(cam, 'g'), waveF = inkEl(waveG, INK.paperLight, { 'fill-opacity': 0.92 }), waveR = inkEl(waveG, INK.inkSoft), spray = inkEl(waveG, INK.paperLight);
      const seaG = el(cam, 'g'), sea = M.sea(seaG, W, H, seaY, sd + 11, { amp: 7 * u, hatch: 26 });
      const foam = inkEl(cam, INK.paperLight), foamR = inkEl(cam, INK.inkSoft);
      const RK = P.rock === false || !P.rock ? null : Object.assign({ x: 0.14, w: 0.34, y: 0.86 }, P.rock);
      const rockF = RK ? inkEl(cam, mix(INK.ink, INK.stain, 0.35)) : null, rockFR = RK ? inkEl(cam) : null, rockFH = RK ? inkEl(cam, INK.inkSoft) : null;
      const kG = el(cam, 'g'), kas = P.kasif ? figure(kG, P.kasif, sd + 90, true) : null;
      const labG = el(cam, 'g'), labs = M.labels(labG, P.labels, W, H, sd + 70);
      const tH = (P.tower ?? 0.2) * H, lx = ix0 + I.lx * iw, ly = topY(I.lx);
      return {
        update(lt, dur, cues) {
          const t = lt;
          const hit = punch(lt, cue(cues, 'hit', null)), sh = atOr(cues, P.shake, null), shk = sh != null ? Math.max(0, 1 - Math.abs(lt - sh - 0.4) / 0.9) : 0;
          M.camPush(cam, lt, dur, W, H, { zoom: P.zoom ?? 1.04, focus: [I.x, 0.5] }, hit, shk);
          // island
          const pts = prof.map(PX); pts.push([ix0 + iw, seaY + 30], [ix0, seaY + 30]);
          fillP(rock, pts, sd + 20, lt, 1.2); rockR.setAttribute('d', inkPath(prof.map(PX), { w: 6 * u, seed: sd + 21, t: lt, amp: 1.2 }));
          const Hh = [];
          for (let i = 0; i < 26; i++) { const fx = 0.02 + (i / 25) * 0.96, ty = topY(fx) + 26 * u, len = Math.max(0, seaY - ty - 10) * (0.35 + 0.5 * ((i * 37) % 7) / 7); Hh.push(inkPath([[ix0 + fx * iw, ty + 14 * u], [ix0 + fx * iw + 4, ty + 14 * u + len]], { w: 2.4 * u, seed: sd + 40 + i, t: lt, amp: 1 })); }
          hatch.setAttribute('d', Hh.join(' '));
          const top = []; for (let fx = 0.05; fx <= 0.92; fx += 0.03) top.push([ix0 + fx * iw, topY(fx) - 2]);
          grass.setAttribute('d', inkPath(top, { w: 9 * u, seed: sd + 22, t: lt, amp: 1 }));
          // keepers' cottage + wall, steps, flagpole, lighthouse
          const cx0 = lx + tH * 0.14, cy = ly + 2, cw = tH * 0.55, chh = tH * 0.2;
          const hs = [[cx0, cy], [cx0, cy - chh], [cx0 + cw * 0.5, cy - chh * 1.45], [cx0 + cw, cy - chh], [cx0 + cw, cy]];
          fillP(walls, hs, sd + 23, lt, 0.8, false); ringP(wallsR, hs, sd + 24, lt, 4 * u, 0.8, false);
          wallsR.setAttribute('d', wallsR.getAttribute('d') + ' ' + ln([[lx - tH * 0.45, cy - tH * 0.05], [lx - tH * 0.45, cy], [cx0 + cw * 1.2, cy], [cx0 + cw * 1.2, cy - tH * 0.05]], sd + 25, lt, 3.5 * u));
          if (P.steps !== false) {
            const S = []; const sx = ix0 + iw * 0.05, sy = seaY - 4, ex = ix0 + iw * 0.2, ey = topY(0.2);
            S.push(ln([[sx, sy], [lerp(sx, ex, 0.5) + 30 * u, lerp(sy, ey, 0.5)], [ex, ey]], sd + 26, lt, 3 * u));
            for (let i = 1; i < 10; i++) { const q = i / 10, x = lerp(sx, ex, q) + Math.sin(q * Math.PI) * 30 * u, y = lerp(sy, ey, q); S.push(ln([[x - 10 * u, y], [x + 10 * u, y]], sd + 27 + i, lt, 2.4 * u)); }
            steps.setAttribute('d', S.join(' '));
          }
          const px = lx - tH * 0.3;
          pole.setAttribute('d', ln([[px, ly + 2], [px, ly - tH * 0.62]], sd + 28, lt, 3.5 * u));
          if (P.flag === 'flag') {
            const fl = []; for (let i = 0; i <= 6; i++) fl.push([px - i * tH * 0.05, ly - tH * 0.6 + Math.sin(lt * 6 + i) * 4 * u * i / 6]);
            for (let i = 6; i >= 0; i--) fl.push([px - i * tH * 0.05, ly - tH * 0.48 + Math.sin(lt * 6 + i) * 4 * u * i / 6]);
            fillP(flag, fl, sd + 29, lt, 0.6);
          } else flag.setAttribute('d', '');
          let on = P.light === 'off' ? 0 : 1;
          if (P.light && typeof P.light === 'object') {
            if (P.light.off != null) { const a = atOr(cues, P.light.off, 0); on = lt < a ? 1 : Math.max(0, 1 - (lt - a) / 0.5); }
            if (P.light.on != null) { const a = atOr(cues, P.light.on, 0); on = clamp01((lt - a) / 0.6); }
          }
          const gh = P.ghost === true ? true : P.ghost ? lt >= atOr(cues, P.ghost, 1e9) : false;
          lh.update(t, lx, ly + 2, tH, on, { glow: P.glow ?? 1, beam: P.beam, ghost: gh, dead: !!P.dead });
          // men on the plateau
          men.forEach(({ m, f }, i) => {
            let fx = m.u ?? 0.5, walking = false, dirx = 1, dist = 0;
            if (m.to != null) { const a = atOr(cues, m.at, 0), d = m.dur ?? 2.4, q = progIO(lt, a, d); walking = lt > a && lt < a + d; dirx = m.to - fx; dist = Math.abs(m.to - fx) * iw * q; fx = lerp(fx, m.to, q); }
            f.update(lt, t, cues, ix0 + fx * iw, topY(fx) + 2, { walking, dirx, dist });
          });
          // the relief steamer
          let shipInfo = null;
          if (ship) {
            const S = P.ship, a = atOr(cues, S.at, 0), d = S.dur ?? Math.max(1, dur), q = S.to != null ? progIO(lt, a, d) : 0;
            const x = lerp(S.x ?? 0.2, S.to ?? S.x ?? 0.2, q) * W, y = (S.y ?? (seaY / H + 0.015)) * H + Math.sin(lt * 1.4) * 5 * u;
            const wa = atOr(cues, P.whistle, null);
            shipInfo = ship.update(t, x, y, (S.s ?? 1) * u, Math.sin(lt * 1.1) * 2.2, { smoke: S.smoke, whistle: wa != null ? lt - wa : null });
          }
          // the rocket: a red trail up into the sky, then a gold burst that falls
          const ra = atOr(cues, P.rocket, null);
          if (ra != null && lt >= ra && shipInfo) {
            const k = lt - ra, [sx, sy] = shipInfo.deck, tx = sx + 160 * u, ty = H * 0.14, q = clamp01(k / 1.1);
            const hx = lerp(sx, tx, q), hy = lerp(sy, ty, 1 - (1 - q) * (1 - q));
            rocket.setAttribute('d', q < 1 || k < 2.2 ? inkPath([[sx, sy], [lerp(sx, hx, 0.5), lerp(sy, hy, 0.6)], [hx, hy]], { w: (q < 1 ? 5 : 5 * Math.max(0, 1 - (k - 1.1))) * u + 0.1, seed: sd + 50, t: lt, amp: 1 }) : '');
            if (k > 1.1) {
              const b = k - 1.1, Sx = [];
              for (let j = 0; j < 14; j++) { const an = j / 14 * Math.PI * 2, r0 = Math.min(1, b / 0.5) * 120 * u, fx = tx + Math.cos(an) * r0, fy = ty + Math.sin(an) * r0 + b * b * 40 * u; if (b < 2.6) Sx.push(inkLoop(ell(fx, fy, 7 * u * (1 - b / 2.6) + 1, 7 * u * (1 - b / 2.6) + 1, 6), { seed: sd + 60 + j, t: lt, amp: 0.5 })); }
              sparks.setAttribute('d', Sx.join(' '));
            } else sparks.setAttribute('d', '');
          } else { rocket.setAttribute('d', ''); sparks.setAttribute('d', ''); }
          // the giant wave up the cliff
          if (P.wave) {
            const Wv = P.wave, a = atOr(cues, Wv.at, 0.5), d = Wv.dur ?? 2.4, k = lt - a;
            if (k > 0) {
              const up = k < d ? Math.sin(Math.min(1, k / d) * Math.PI / 2) : Math.max(0, 1 - (k - d - (Wv.hold ?? 0.6)) / 1.4);
              const left = (Wv.side || 'left') === 'left', fx0 = left ? 0.0 : 1.0, sgn = left ? 1 : -1;
              const reach = (Wv.top ?? 0.9) * up * ih, bx = ix0 + fx0 * iw, Pp = [];
              Pp.push([bx - sgn * 260 * u, seaY + 10]);
              for (let j = 0; j <= 8; j++) { const q = j / 8, y = seaY - reach * Math.sin(q * Math.PI / 2) * (1 - 0.15 * q * q); Pp.push([bx - sgn * 260 * u * (1 - q) + sgn * q * iw * 0.08 + Math.sin(lt * 5 + j) * 6 * u, y]); }
              Pp.push([bx + sgn * iw * 0.14, seaY - reach * 0.7], [bx + sgn * iw * 0.16, seaY + 10]);
              fillP(waveF, Pp, sd + 70, lt, 2); waveR.setAttribute('d', inkPath(Pp.slice(0, 11), { w: 5 * u, seed: sd + 71, t: lt, amp: 1.5 }));
              const Sp = [];
              for (let j = 0; j < 16; j++) { const q = ((j * 0.37 + k * 0.8) % 1), sx = bx + sgn * (j % 5) * 30 * u, sy = seaY - reach - q * 160 * u * up; if (up > 0.05) Sp.push(inkLoop(ell(sx + sgn * q * 80 * u, sy, 10 * u * (1 - q) + 2, 8 * u * (1 - q) + 2, 6), { seed: sd + 72 + j, t: lt, amp: 0.6 })); }
              spray.setAttribute('d', Sp.join(' '));
            } else { waveF.setAttribute('d', ''); waveR.setAttribute('d', ''); spray.setAttribute('d', ''); }
          }
          sea.update(lt);
          // breakers at the island's foot
          const F = [], FR = [];
          for (let j = 0; j < 9; j++) { const fx = ix0 + (j / 8) * iw, ph = Math.sin(lt * 2.2 + j * 1.7), r0 = (26 + 14 * ph) * u; F.push(inkLoop(ell(fx, seaY - r0 * 0.3, r0 * 1.6, r0 * 0.6, 10), { seed: sd + 80 + j, t: lt, amp: 1.2 })); FR.push(inkPath([[fx - r0 * 1.5, seaY - r0 * 0.1], [fx, seaY - r0 * 0.85], [fx + r0 * 1.5, seaY - r0 * 0.1]], { w: 2.5 * u, seed: sd + 90 + j, t: lt, amp: 1 })); }
          foam.setAttribute('d', F.join(' ')); foamR.setAttribute('d', FR.join(' '));
          if (RK) {
            const x0 = (RK.x - RK.w / 2) * W, x1 = (RK.x + RK.w / 2) * W, gy = RK.y * H;
            const rp = [[x0 - 40 * u, H + 20], [x0, gy + 30 * u], [x0 + (x1 - x0) * 0.2, gy], [x0 + (x1 - x0) * 0.7, gy - 6 * u], [x1, gy + 24 * u], [x1 + 60 * u, H + 20]];
            fillP(rockF, rp, sd + 100, lt, 1); rockFR.setAttribute('d', inkPath(rp.slice(1, 5), { w: 6 * u, seed: sd + 101, t: lt, amp: 1 }));
            const RH = []; for (let j = 0; j < 9; j++) { const xx = lerp(x0 + 20 * u, x1 - 20 * u, j / 8); RH.push(inkPath([[xx, gy + 30 * u], [xx - 18 * u, H]], { w: 2.5 * u, seed: sd + 102 + j, t: lt, amp: 1 })); }
            rockFH.setAttribute('d', RH.join(' '));
          }
          if (kas) { const K = P.kasif; kas.update(lt, t, cues, K.x * W, (K.y ?? (RK ? RK.y : 0.9)) * H); }
          if (rains) rains.update(lt);
          if (gls) gls.update(lt);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== fl_landing
  SH.fl_landing = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, sd = seed * 1000 + 503, u = Math.min(W, H) / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const seaY = (P.sea ?? 0.86) * H, topY = (P.top ?? 0.2) * H, FT = P.feet ?? 230;
      const yFt = ft => seaY - (ft / FT) * (seaY - topY);
      // cliff outline: the face runs from bottom-left up to the top edge
      const face = [[0.2, 1.02], [0.21, 0.9], [0.25, 0.8], [0.27, 0.66], [0.31, 0.56], [0.33, 0.44], [0.37, 0.34], [0.39, 0.24], [0.42, (P.top ?? 0.2) + 0.01]].map(p => [p[0] * W, p[1] * H]);
      const topEdge = [[0.42 * W, topY], [0.6 * W, topY - 8 * u], [0.8 * W, topY + 4 * u], [W + 20, topY - 4 * u]];
      // the landing path: platform at the bottom, then a straight climb up the face to the top
      const path = [[0.27 * W, seaY - 0.05 * H], [0.5 * W, 0.6 * H], [0.74 * W, 0.37 * H], [0.93 * W, topY + 0.05 * H]];
      const along = q => { const n = path.length - 1, s = Math.min(n - 1e-6, Math.max(0, q * n)), i = Math.floor(s), f = s - i; return [lerp(path[i][0], path[i + 1][0], f), lerp(path[i][1], path[i + 1][1], f)]; };
      const ruler = el(cam, 'g'), rulerL = inkEl(ruler, INK.inkSoft);
      const marksG = el(cam, 'g');
      const marks = (P.marks || []).map((m, i) => {
        const g = el(marksG, 'g'), dash = inkEl(g, COLS()[m.color] || INK.red), tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': Math.max(44, m.size || 64), fill: COLS()[m.color] || INK.red, 'text-anchor': 'start', 'dominant-baseline': 'central' });
        tx.textContent = m.text || `${m.ft} ft`; return { m, g, dash, tx, i };
      });
      const cliffG = el(cam, 'g'), cliff = inkEl(cliffG, mix(INK.paperDark, INK.stain, 0.5)), cliffR = inkEl(cliffG), cliffH = inkEl(cliffG, INK.inkSoft, { 'fill-opacity': 0.75 }), strata = inkEl(cliffG, INK.inkSoft, { 'fill-opacity': 0.6 });
      const turf = inkEl(cliffG, INK.green, { 'fill-opacity': 0.9 }), turfR = inkEl(cliffG), clods = inkEl(cliffG, INK.green);
      const crev = inkEl(cliffG, INK.ink), boxF = inkEl(cliffG, INK.stain), boxR = inkEl(cliffG), lid = inkEl(cliffG, INK.stain), lidR = inkEl(cliffG), ropes = inkEl(cliffG, INK.gold), ropesR = inkEl(cliffG, INK.inkSoft);
      const plat = inkEl(cliffG, INK.paperLight), platR = inkEl(cliffG), track = inkEl(cliffG), railing = inkEl(cliffG, INK.ink), crane = inkEl(cliffG);
      const poleE = P.pole ? inkEl(cliffG) : null, flagE = P.pole ? inkEl(cliffG, INK.red) : null;
      const bould = inkEl(cliffG, mix(INK.inkSoft, INK.stain, 0.4)), bouldR = inkEl(cliffG), bArrow = inkEl(cliffG, INK.red);
      cam.appendChild(marksG);   // the height marks sit on top of the cliff face
      const menG = el(cam, 'g'), men = (P.men || []).map((m, i) => { const g = el(menG, 'g'); return { m, g, f: figure(g, m, sd + 40 + i * 9, false) }; });
      const waveG = el(cam, 'g'), waveF = inkEl(waveG, INK.paperLight, { 'fill-opacity': 0.94 }), waveR = inkEl(waveG, INK.inkSoft), waveH = inkEl(waveG, INK.blue, { 'fill-opacity': 0.6 }), spray = inkEl(waveG, INK.paperLight), sprayR = inkEl(waveG, INK.inkSoft);
      const seaG = el(cam, 'g'), sea = M.sea(seaG, W, H, seaY, sd + 11, { amp: 9 * u, hatch: 18, dark: true });
      const rains = P.rain ? rain(el(cam, 'g'), W, H, sd + 3, 60) : null;
      const kG = el(cam, 'g'), kas = P.kasif ? figure(kG, P.kasif, sd + 90, true) : null;
      const labG = el(cam, 'g'), labs = M.labels(labG, P.labels, W, H, sd + 70);
      const boxU = (P.box && P.box.u) ?? 0.42, boxP = along(boxU);
      const KEY = { box: 'smash', rail: 'rip', railing: 'bend', boulder: 'move', turf: 'tear' };
      const brk = name => { const own = P[name] ? P[name][KEY[name]] : null; return own != null ? own : P.broken; };
      return {
        update(lt, dur, cues) {
          const t = lt, hit = punch(lt, cue(cues, 'hit', null)), sh = atOr(cues, P.shake, null), shk = sh != null ? Math.max(0, 1 - Math.abs(lt - sh - 0.5) / 1.0) : 0;
          M.camPush(cam, lt, dur, W, H, { zoom: P.zoom ?? 1.04, focus: P.focus || [0.55, 0.5] }, hit, shk);
          const dmg = name => { const c = brk(name); const a = c == null ? null : atOr(cues, c, null); return a == null ? 0 : clamp01((lt - a) / 0.5); };
          const dBox = dmg('box'), dRail = dmg('rail'), dRailing = dmg('railing'), dBoul = dmg('boulder'), dTurf = dmg('turf');
          // ruler
          const rx = 0.07 * W, Rl = [ln([[rx, seaY], [rx, topY]], sd + 1, t, 5 * u)];
          for (let ft = 0; ft <= FT; ft += 50) Rl.push(ln([[rx - 16 * u, yFt(ft)], [rx + 16 * u, yFt(ft)]], sd + 2 + ft, t, 4 * u));
          rulerL.setAttribute('d', Rl.join(' '));
          // cliff body
          const body = face.concat(topEdge.slice(1), [[W + 20, H + 20], [0.2 * W, H + 20]]);
          fillP(cliff, body, sd + 10, t, 1.2); cliffR.setAttribute('d', inkPath(face.concat(topEdge.slice(1)), { w: 6 * u, seed: sd + 11, t, amp: 1.3 }));
          const Hc = [];
          for (let i = 0; i < 30; i++) { const x = (0.3 + 0.7 * (i / 29)) * W, y0 = topY + (40 + (i * 53) % 180) * u, len = (60 + (i * 29) % 120) * u; Hc.push(inkPath([[x, y0], [x - 8 * u, y0 + len]], { w: 2.5 * u, seed: sd + 20 + i, t, amp: 1 })); }
          cliffH.setAttribute('d', Hc.join(' '));
          const St = []; for (let i = 0; i < 5; i++) { const y = topY + (i + 1) * (seaY - topY) / 6, x0 = lerp(0.42, 0.21, (y - topY) / (seaY - topY)) * W + 30 * u; St.push(inkPath([[x0, y], [x0 + 0.25 * W, y + 18 * u], [W, y - 10 * u]], { w: 2 * u, seed: sd + 60 + i, t, amp: 1.4 })); }
          strata.setAttribute('d', St.join(' '));
          // turf on top (torn: chunks missing near the edge + clods flying)
          const tp = []; for (let i = 0; i <= 20; i++) { const x = lerp(0.42 * W, W + 20, i / 20), y = topY - 6 * u + Math.sin(i * 1.7) * 3 * u; tp.push([x, y]); }
          const tTop = tp.map(p => [p[0], p[1] - 22 * u]);
          fillP(turf, tp.concat(tTop.slice().reverse()), sd + 30, t, 1);
          const TR = [inkPath(tTop, { w: 4 * u, seed: sd + 31, t, amp: 1 })];
          for (let i = 0; i < 26; i++) { const x = lerp(0.43 * W, W, i / 25); TR.push(inkPath([[x, topY - 26 * u], [x + 5 * u, topY - 40 * u]], { w: 2.5 * u, seed: sd + 32 + i, t, amp: 1 })); }
          turfR.setAttribute('d', TR.join(' '));
          if (dTurf > 0) {
            const C = [], k = Math.max(0, lt - atOr(cues, brk('turf'), 0));
            for (let j = 0; j < 7; j++) {
              const x = (0.46 + j * 0.06) * W, gx = inkLoop(rect(x, topY - 30 * u, 50 * u, 34 * u), { seed: sd + 120 + j, t, smooth: false });
              C.push(gx.replace(/^/, ''));
              const fx = x + 25 * u + (j % 2 ? 1 : -1) * k * 60 * u, fy = topY - 30 * u - k * 140 * u + k * k * 120 * u;
              if (k < 2.5) C.push(inkLoop(ell(fx, fy, 16 * u, 10 * u, 8), { seed: sd + 130 + j, t, amp: 0.8 }));
            }
            clods.setAttribute('d', C.join(' '));
            clods.setAttribute('fill', mix(INK.stain, INK.ink, 0.35));
          } else clods.setAttribute('d', '');
          if (poleE) {
            const px = (P.pole.x ?? 0.86) * W, py = topY - 20 * u, ph = (P.pole.h ?? 0.3) * H;
            poleE.setAttribute('d', ln([[px, py], [px + 3 * u, py - ph]], sd + 140, t, 6 * u) + ' ' + inkDot(px + 3 * u, py - ph - 8 * u, 10 * u, 10 * u, sd + 141, t));
            if (P.pole.flag) { const fl = []; for (let i = 0; i <= 6; i++) fl.push([px - i * 26 * u, py - ph + 10 * u + Math.sin(lt * 6 + i) * 5 * u * i / 6]); for (let i = 6; i >= 0; i--) fl.push([px - i * 26 * u, py - ph + 90 * u + Math.sin(lt * 6 + i) * 5 * u * i / 6]); fillP(flagE, fl, sd + 142, t, 0.6); } else flagE.setAttribute('d', '');
          }
          // landing platform + the path (stair + tramway) + railings
          const pl = [[0.2 * W, seaY - 0.05 * H], [0.33 * W, seaY - 0.05 * H], [0.33 * W, seaY - 0.02 * H], [0.2 * W, seaY - 0.02 * H]];
          fillP(plat, pl, sd + 40, t, 0.8, false); ringP(platR, pl, sd + 41, t, 4 * u, 0.8, false);
          const Tr = [];
          const off = (q, d) => { const a = along(q), b = along(Math.min(1, q + 0.01)), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [a[0] - dy / L * d, a[1] + dx / L * d]; };
          const ripA = 0.52, ripB = 0.66;
          for (const d of [-10 * u, 10 * u]) {
            const seg1 = [], seg2 = [], seg3 = [];
            for (let q = 0; q <= 1.0001; q += 0.02) { const p = off(q, d); if (q < ripA) seg1.push(p); else if (q > ripB) seg3.push(p); else seg2.push(p); }
            Tr.push(inkPath(seg1, { w: 4 * u, seed: sd + 42 + d, t, amp: 0.8 }), inkPath(seg3, { w: 4 * u, seed: sd + 43 + d, t, amp: 0.8 }));
            // ripped section: lifts and twists away from the face
            const tw = seg2.map((p, i) => { const q = i / Math.max(1, seg2.length - 1); return [p[0] - dRail * Math.sin(q * Math.PI) * 70 * u, p[1] - dRail * Math.sin(q * Math.PI) * 50 * u + dRail * q * 40 * u]; });
            Tr.push(inkPath(tw, { w: 4 * u, seed: sd + 44 + d, t, amp: 0.8 }));
          }
          for (let q = 0.02; q < 1; q += 0.035) { const a = off(q, -12 * u), b = off(q, 12 * u); const lift = q > ripA && q < ripB ? dRail * Math.sin((q - ripA) / (ripB - ripA) * Math.PI) : 0; Tr.push(inkPath([[a[0] - lift * 70 * u, a[1] - lift * 50 * u], [b[0] - lift * 70 * u, b[1] - lift * 50 * u]], { w: 3 * u, seed: sd + 45 + Math.round(q * 100), t, amp: 0.6 })); }
          track.setAttribute('d', Tr.join(' '));
          const Rg = [], rail = [];
          for (let q = 0.04; q < 1; q += 0.07) {
            const b = off(q, 26 * u), bend = q < 0.4 ? dRailing * (0.6 + 0.4 * Math.sin(q * 20)) : 0;
            const tx = b[0] - 50 * u * (1 - bend) + bend * 40 * u, ty = b[1] - 60 * u * (1 - bend * 0.7);
            Rg.push(inkPath([[b[0], b[1]], [lerp(b[0], tx, 0.6), lerp(b[1], ty, 0.6) - bend * 10 * u], [tx, ty]], { w: 3.5 * u, seed: sd + 50 + Math.round(q * 100), t, amp: 0.8 }));
            rail.push([tx, ty]);
          }
          Rg.push(inkPath(rail, { w: 3 * u, seed: sd + 49, t, amp: 0.8 }));
          railing.setAttribute('d', Rg.join(' '));
          // crane at the landing
          const cx = 0.23 * W, cy = seaY - 0.05 * H;
          crane.setAttribute('d', [ln([[cx, cy], [cx, cy - 170 * u]], sd + 55, t, 6 * u), ln([[cx, cy - 170 * u], [cx + 120 * u, cy - 120 * u]], sd + 56, t, 5 * u),
            ln([[cx, cy - 60 * u], [cx + 100 * u, cy - 116 * u]], sd + 57, t, 3 * u), ln([[cx + 118 * u, cy - 120 * u], [cx + 118 * u, cy - 50 * u + Math.sin(lt * 2) * 6 * u]], sd + 58, t, 2.5 * u)].join(' '));
          // crevice + rope box (smashed: lid flies off, ropes spill down the rocks)
          const [bx, by] = [boxP[0] + 60 * u, boxP[1] - 50 * u];
          crev.setAttribute('d', inkLoop([[bx - 70 * u, by + 30 * u], [bx - 50 * u, by - 70 * u], [bx + 10 * u, by - 90 * u], [bx + 80 * u, by - 60 * u], [bx + 90 * u, by + 30 * u]], { seed: sd + 70, t, amp: 1 }));
          const bp = rect(bx - 55 * u, by - 40 * u, 110 * u, 70 * u);
          fillP(boxF, bp, sd + 71, t, 0.8, false);
          boxR.setAttribute('d', inkPath(bp, { w: 5 * u, seed: sd + 72, t, closed: true, amp: 0.8, smooth: false }) + ' ' + ln([[bx - 55 * u, by - 8 * u], [bx + 55 * u, by - 8 * u]], sd + 73, t, 3 * u) + (dBox > 0 ? ' ' + ln([[bx - 20 * u, by - 40 * u], [bx + 5 * u, by - 5 * u], [bx - 10 * u, by + 30 * u]], sd + 74, t, 4 * u) : ''));
          const kb = dBox > 0 ? lt - atOr(cues, brk('box'), 0) : 0;
          const lp = rect(-60 * u, -10 * u, 120 * u, 20 * u), lrot = dBox * 70 + kb * 30, lxx = bx + kb * 140 * u, lyy = by - 50 * u - kb * 160 * u + kb * kb * 90 * u;
          const LR = p => { const a = lrot * Math.PI / 180; return [lxx + p[0] * Math.cos(a) - p[1] * Math.sin(a), lyy + p[0] * Math.sin(a) + p[1] * Math.cos(a)]; };
          if (kb < 3) { fillP(lid, lp.map(LR), sd + 75, t, 0.6, false); ringP(lidR, lp.map(LR), sd + 76, t, 4 * u, 0.6, false); } else { lid.setAttribute('d', ''); lidR.setAttribute('d', ''); }
          if (dBox > 0) {
            const Rp = [], RpR = [], q = clamp01(kb / 1.4);
            for (let j = 0; j < 4; j++) { const p = [[bx + (j - 1.5) * 20 * u, by - 20 * u]]; for (let m = 1; m <= 6; m++) p.push([bx + (j - 1.5) * 30 * u + Math.sin(m * 1.3 + j) * 40 * u + m * (j % 2 ? 22 : -14) * u, by - 20 * u + m * 45 * u * q]); Rp.push(inkPath(p, { w: 9 * u, seed: sd + 80 + j, t, amp: 1 })); RpR.push(inkPath(p, { w: 2 * u, seed: sd + 85 + j, t, amp: 1 })); }
            ropes.setAttribute('d', Rp.join(' ')); ropesR.setAttribute('d', RpR.join(' '));
          } else { ropes.setAttribute('d', ''); ropesR.setAttribute('d', ''); }
          // the boulder (over a ton): slides along the platform and tips
          const b0 = [0.35 * W, seaY - 0.06 * H], b1 = [0.44 * W, 0.72 * H], bq = progIO(dBoul, 0, 1);
          const bxx = lerp(b0[0], b1[0], bq), byy = lerp(b0[1], b1[1], bq) - Math.sin(bq * Math.PI) * 30 * u;
          const bpts = [[-90, 0], [-80, -60], [-30, -100], [40, -96], [90, -50], [86, 0]].map(p => { const a = bq * 0.6; return [bxx + (p[0] * Math.cos(a) - p[1] * Math.sin(a)) * u, byy + (p[0] * Math.sin(a) + p[1] * Math.cos(a)) * u]; });
          fillP(bould, bpts, sd + 90, t, 0.8); ringP(bouldR, bpts, sd + 91, t, 5 * u, 0.8);
          if (dBoul > 0) { const ap = clamp01((lt - atOr(cues, brk('boulder'), 0)) / 0.6); bArrow.setAttribute('d', ap > 0.02 ? inkPath([[b0[0], b0[1] + 20 * u], [lerp(b0[0], b1[0], ap), lerp(b0[1], b1[1], ap) + 20 * u]], { w: 7 * u, seed: sd + 92, t, amp: 1 }) : ''); } else bArrow.setAttribute('d', '');
          // men on the path
          men.forEach(({ m, g, f }) => {
            let q = m.u ?? 0.3, walking = false, dirx = 1, dist = 0;
            if (m.to != null) { const a = atOr(cues, m.at, 0), d = m.dur ?? 2.4, p = progIO(lt, a, d); walking = lt > a && lt < a + d; const a0 = along(q), a1 = along(m.to); dirx = a1[0] - a0[0]; dist = Math.hypot(a1[0] - a0[0], a1[1] - a0[1]) * p; q = lerp(q, m.to, p); }
            const sw = atOr(cues, m.swept, null), gone = sw != null && lt > sw + 0.3;
            const [x, y] = m.x != null ? [m.x * W, m.y * H] : along(q);
            g.style.display = gone ? 'none' : '';
            if (!gone) f.update(lt, lt, cues, x, y - 4 * u, { walking, dirx, dist });
          });
          // the wave: a wall of white water rising up the face
          if (P.wave) {
            const Wv = P.wave, a = atOr(cues, Wv.at, 0.5), d = Wv.dur ?? 2.6, k = lt - a;
            if (k > 0) {
              const up = k < d ? Math.sin(Math.min(1, k / d) * Math.PI / 2) : Math.max(0, 1 - (k - d - (Wv.hold ?? 1)) / 1.6);
              const crest = lerp(seaY, (Wv.to ?? 0.2) * H, up), Pp = [[-20, H + 20], [-20, seaY - 20 * u]];
              for (let j = 0; j <= 12; j++) { const q = j / 12, x = lerp(0, 0.7 * W, q), hump = Math.sin(Math.min(1, q * 1.15) * Math.PI * 0.95); Pp.push([x, lerp(seaY - 30 * u, crest, hump) + Math.sin(lt * 6 + j * 1.3) * 12 * u]); }
              Pp.push([0.75 * W, seaY], [0.75 * W, H + 20]);
              fillP(waveF, Pp, sd + 100, lt, 2.5);
              waveR.setAttribute('d', inkPath(Pp.slice(1, 15), { w: 6 * u, seed: sd + 101, t: lt, amp: 2 }));
              const Hv = []; for (let j = 0; j < 12; j++) { const x = lerp(0.04, 0.6, j / 11) * W, top = Pp[2 + Math.min(12, Math.round(j * 12 / 11))][1]; Hv.push(inkPath([[x, top + 40 * u], [x + 30 * u, lerp(top, seaY, 0.5)], [x + 10 * u, seaY + 40 * u]], { w: 3 * u, seed: sd + 110 + j, t: lt, amp: 1.5 })); }
              waveH.setAttribute('d', Hv.join(' '));
              const S = [], SR = [];
              if (P.spray !== false && up > 0.05) for (let j = 0; j < 22; j++) { const q = ((j * 0.41 + k * 0.9) % 1), sx = lerp(0.2, 0.6, (j % 7) / 6) * W + q * 60 * u, sy = crest - q * 220 * u * up, r0 = (16 * (1 - q) + 4) * u; S.push(inkLoop(ell(sx, sy, r0, r0 * 0.8, 7), { seed: sd + 130 + j, t: lt, amp: 0.6 })); SR.push(inkPath(ell(sx, sy, r0, r0 * 0.8, 7), { w: 2 * u, closed: true, seed: sd + 160 + j, t: lt, amp: 0.6 })); }
              spray.setAttribute('d', S.join(' ')); sprayR.setAttribute('d', SR.join(' '));
            } else { waveF.setAttribute('d', ''); waveR.setAttribute('d', ''); waveH.setAttribute('d', ''); spray.setAttribute('d', ''); sprayR.setAttribute('d', ''); }
          }
          sea.update(lt);
          marks.forEach(({ m, dash, tx, i }) => {
            const a = atOr(cues, m.at, 0.3 + i * 0.4), p = prog(lt, a, 0.7), y = yFt(m.ft);
            if (lt < a) { dash.setAttribute('d', ''); tx.style.display = 'none'; return; }
            tx.style.display = '';
            const D = []; const x1 = lerp(rx, (m.x1 ?? 0.6) * W, p); for (let x = rx; x < x1 - 30; x += 50 * u) D.push(inkPath([[x, y], [Math.min(x1, x + 30 * u), y]], { w: 5 * u, seed: sd + 200 + i * 31 + Math.round(x), t, amp: 0.6 }));
            dash.setAttribute('d', D.join(' '));
            tx.setAttribute('x', f1(m.lx != null ? m.lx * W : rx + 30 * u)); tx.setAttribute('y', f1(y - 44 * u)); tx.setAttribute('opacity', p.toFixed(3));
          });
          if (kas) { const K = P.kasif; kas.update(lt, lt, cues, K.x * W, (K.y ?? 0.9) * H); }
          if (rains) rains.update(lt);
          labs.update(lt, lt, cues);
        },
      };
    },
  };

  // ================================================================== fl_room
  SH.fl_room = {
    kind: '2d',
    build(ctx) { return buildRoom(ctx, ctx.P.mode || 'kitchen'); },
  };
  // fl_lantern: the lantern room on its own (same drawing as fl_room mode "lantern")
  SH.fl_lantern = { kind: '2d', build(ctx) { return buildRoom(ctx, 'lantern'); } };

  function buildRoom(ctx, mode0) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, sd = seed * 1000 + 611, u = Math.min(W, H) / 1080;
      const mode = mode0, fy = (P.floor ?? 0.8) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const floorL = inkEl(cam, INK.ink);
      const back = el(cam, 'g'), mid = el(cam, 'g'), front = el(cam, 'g');
      const E = (parent, fill) => inkEl(parent, fill);
      // window with a storm outside
      const win = (P.window != null ? P.window !== false : mode === 'hall') && mode !== 'lantern' ? { f: E(back, mix(INK.inkSoft, INK.blue, 0.4)), r: E(back, INK.ink), rain: inkEl(back, INK.paperLight, { 'fill-opacity': 0.7 }) } : null;
      const WX = (P.window && P.window.x) ?? (mode === 'hall' ? 0.72 : 0.12), WY = 0.2;
      // the clock
      const CL = P.clock ? Object.assign({ x: 0.66, y: 0.28, r: 70, time: [2, 40] }, P.clock) : null;
      const clk = CL ? { f: E(back, INK.paperLight), r: E(back, INK.ink), h: E(back, INK.ink), p: E(back, INK.ink), ring: E(back, INK.red) } : null;
      const parts = [];   // [{e, fn(t) -> d}]
      const add = (parent, fill, fn) => { const e = inkEl(parent, fill); parts.push({ e, fn }); return e; };
      let lampOn = () => 1;
      if (mode === 'kitchen' || mode === 'beds') {
        // dresser with plates (left) / range with pots (right)
        const dx = (mode === 'kitchen' ? 0.06 : 0.82) * W, dw = 0.16 * W, dh = 0.42 * H;
        if (mode === 'kitchen') {
          add(back, INK.stain, t => inkLoop(rect(dx, fy - dh, dw, dh), { seed: sd + 1, t, smooth: false }));
          add(back, INK.ink, t => inkPath(rect(dx, fy - dh, dw, dh), { w: 5 * u, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + [0.3, 0.6].map((q, i) => ln([[dx, fy - dh + dh * q], [dx + dw, fy - dh + dh * q]], sd + 3 + i, t, 4 * u)).join(' '));
          add(back, INK.paperLight, t => [0, 1, 2, 3].map(i => inkLoop(ell(dx + dw * (0.16 + i * 0.22), fy - dh + dh * 0.2, 26 * u, 26 * u, 10), { seed: sd + 10 + i, t, amp: 0.6 })).join(' ') + ' ' + [0, 1, 2].map(i => inkLoop(rect(dx + dw * (0.12 + i * 0.3), fy - dh + dh * 0.42, 34 * u, 40 * u), { seed: sd + 20 + i, t, smooth: false, amp: 0.6 })).join(' '));
          add(back, INK.ink, t => [0, 1, 2, 3].map(i => inkPath(ell(dx + dw * (0.16 + i * 0.22), fy - dh + dh * 0.2, 26 * u, 26 * u, 10), { w: 3 * u, closed: true, seed: sd + 14 + i, t, amp: 0.6 })).join(' ') + ' ' + [0, 1, 2].map(i => inkPath(rect(dx + dw * (0.12 + i * 0.3), fy - dh + dh * 0.42, 34 * u, 40 * u), { w: 3 * u, closed: true, smooth: false, seed: sd + 24 + i, t, amp: 0.6 })).join(' '));
          // range
          const rx = 0.78 * W, rw = 0.17 * W, rh = 0.2 * H;
          add(back, mix(INK.ink, INK.inkSoft, 0.4), t => inkLoop(rect(rx, fy - rh, rw, rh), { seed: sd + 30, t, smooth: false }) + ' ' + inkLoop(rect(rx + rw * 0.4, fy - rh - 0.3 * H, rw * 0.2, 0.3 * H), { seed: sd + 31, t, smooth: false }));
          add(back, INK.ink, t => inkPath(rect(rx, fy - rh, rw, rh), { w: 5 * u, closed: true, smooth: false, seed: sd + 32, t }) + ' ' + inkLoop(rect(rx + rw * 0.3, fy - rh * 0.6, rw * 0.4, rh * 0.4), { seed: sd + 33, t, smooth: false }));
          add(back, INK.stain, t => inkLoop([[rx + rw * 0.08, fy - rh], [rx + rw * 0.1, fy - rh - 60 * u], [rx + rw * 0.36, fy - rh - 60 * u], [rx + rw * 0.38, fy - rh]], { seed: sd + 34, t, smooth: false }) + ' ' + inkLoop([[rx + rw * 0.62, fy - rh], [rx + rw * 0.64, fy - rh - 44 * u], [rx + rw * 0.9, fy - rh - 44 * u], [rx + rw * 0.92, fy - rh]], { seed: sd + 35, t, smooth: false }));
          // table
          const tx = 0.5 * W, tw = 0.3 * W, ty = fy - 0.17 * H;
          add(mid, INK.stain, t => inkLoop([[tx - tw / 2, ty], [tx + tw / 2, ty], [tx + tw / 2 - 10 * u, ty + 24 * u], [tx - tw / 2 + 10 * u, ty + 24 * u]], { seed: sd + 40, t, smooth: false }));
          add(mid, INK.ink, t => inkPath([[tx - tw / 2, ty], [tx + tw / 2, ty], [tx + tw / 2 - 10 * u, ty + 24 * u], [tx - tw / 2 + 10 * u, ty + 24 * u]], { w: 5 * u, closed: true, smooth: false, seed: sd + 41, t }) + ' ' +
            ln([[tx - tw * 0.42, ty + 24 * u], [tx - tw * 0.42, fy]], sd + 42, t, 7 * u) + ' ' + ln([[tx + tw * 0.42, ty + 24 * u], [tx + tw * 0.42, fy]], sd + 43, t, 7 * u));
          if (P.table === 'meal') {
            add(mid, INK.paperLight, t => [-0.3, 0, 0.3].map((q, i) => inkLoop(ell(tx + q * tw, ty - 6 * u, 48 * u, 12 * u, 10), { seed: sd + 50 + i, t, amp: 0.6 })).join(' '));
            add(mid, INK.stain, t => [-0.3, 0, 0.3].map((q, i) => inkLoop(ell(tx + q * tw, ty - 16 * u, 26 * u, 12 * u, 10), { seed: sd + 54 + i, t, amp: 0.6 })).join(' ') + ' ' + inkLoop(ell(tx + 0.15 * tw, ty - 30 * u, 44 * u, 26 * u, 12), { seed: sd + 58, t, amp: 0.6 }));
            add(mid, INK.ink, t => [-0.3, 0, 0.3].map((q, i) => inkPath(ell(tx + q * tw, ty - 6 * u, 48 * u, 12 * u, 10), { w: 3 * u, closed: true, seed: sd + 60 + i, t, amp: 0.6 })).join(' ') + ' ' + [-0.15, 0.42].map((q, i) => inkPath(rect(tx + q * tw - 14 * u, ty - 44 * u, 28 * u, 38 * u), { w: 3 * u, closed: true, smooth: false, seed: sd + 64 + i, t })).join(' '));
          }
          // chairs
          const chair = (x, face, down, s0) => t => {
            if (!down) return ln([[x, fy], [x, ty + 10 * u], [x + face * 70 * u, ty + 10 * u], [x + face * 70 * u, fy]], s0, t, 5 * u) + ' ' + ln([[x, ty + 10 * u], [x - face * 6 * u, ty - 110 * u]], s0 + 1, t, 6 * u);
            const R = p => [x + p[0] * u, fy - 8 * u + p[1] * u];
            return ln([[0, 0], [120, -12], [126, -80]].map(R), s0, t, 5 * u) + ' ' + ln([[0, 0], [-20, -60]].map(R), s0 + 1, t, 5 * u) + ' ' + ln([[120, -12], [230, 6]].map(R), s0 + 2, t, 6 * u);
          };
          add(front, INK.ink, chair(tx - tw * 0.42 - 90 * u, 1, false, sd + 70));
          add(front, INK.ink, chair(tx + tw * 0.42 + (P.chair === 'down' ? 40 : 20) * u, -1, P.chair === 'down', sd + 74));
        } else {
          // beds: two box beds with neat blankets, empty
          [0.12, 0.42].forEach((bx0, i) => {
            const bx = bx0 * W, bw = 0.24 * W, bh = 0.34 * H;
            add(back, mix(INK.stain, INK.paperDark, 0.4), t => inkLoop(rect(bx, fy - bh, bw, bh), { seed: sd + 100 + i, t, smooth: false }));
            add(back, INK.paperLight, t => inkLoop(rect(bx + bw * 0.06, fy - bh * 0.48, bw * 0.88, bh * 0.2), { seed: sd + 104 + i, t, smooth: false }) + ' ' + inkLoop(ell(bx + bw * 0.18, fy - bh * 0.5, bw * 0.1, bh * 0.06, 10), { seed: sd + 106 + i, t }));
            add(back, INK.blue, t => inkLoop(rect(bx + bw * 0.3, fy - bh * 0.5, bw * 0.64, bh * 0.2), { seed: sd + 108 + i, t, smooth: false }));
            add(back, INK.ink, t => inkPath(rect(bx, fy - bh, bw, bh), { w: 6 * u, closed: true, smooth: false, seed: sd + 110 + i, t }) + ' ' + inkPath(rect(bx + bw * 0.06, fy - bh * 0.48, bw * 0.88, bh * 0.2), { w: 3 * u, closed: true, smooth: false, seed: sd + 112 + i, t }) + ' ' + [0.42, 0.58, 0.74, 0.9].map((q, j) => ln([[bx + bw * q, fy - bh * 0.5], [bx + bw * q, fy - bh * 0.3]], sd + 114 + i * 5 + j, t, 2 * u)).join(' '));
          });
          // cold stove
          const sx = 0.78 * W, sw = 0.12 * W, shh = 0.22 * H;
          add(back, mix(INK.ink, INK.inkSoft, 0.4), t => inkLoop(rect(sx, fy - shh, sw, shh), { seed: sd + 130, t, smooth: false }) + ' ' + inkLoop(rect(sx + sw * 0.38, 0, sw * 0.24, fy - shh), { seed: sd + 131, t, smooth: false }));
          add(back, INK.ink, t => inkPath(rect(sx, fy - shh, sw, shh), { w: 5 * u, closed: true, smooth: false, seed: sd + 132, t }) + ' ' + inkLoop(rect(sx + sw * 0.25, fy - shh * 0.6, sw * 0.5, shh * 0.35), { seed: sd + 133, t, smooth: false }));
          if (P.fire) add(back, INK.gold, t => inkLoop([[sx + sw * 0.3, fy - shh * 0.28], [sx + sw * 0.4, fy - shh * 0.55 - Math.sin(t * 9) * 6 * u], [sx + sw * 0.5, fy - shh * 0.4], [sx + sw * 0.62, fy - shh * 0.58 + Math.sin(t * 7) * 6 * u], [sx + sw * 0.7, fy - shh * 0.28]], { seed: sd + 134, t }));
        }
      } else if (mode === 'hall') {
        const coats = P.coats || ['coat', 'empty', 'empty'], px0 = 0.2 * W, gap = 0.15 * W, py = 0.3 * H;
        add(back, INK.stain, t => inkLoop(rect(px0 - 60 * u, py - 20 * u, gap * (coats.length - 1) + 120 * u, 34 * u), { seed: sd + 200, t, smooth: false }));
        add(back, INK.ink, t => inkPath(rect(px0 - 60 * u, py - 20 * u, gap * (coats.length - 1) + 120 * u, 34 * u), { w: 4 * u, closed: true, smooth: false, seed: sd + 201, t }) + ' ' + coats.map((c, i) => ln([[px0 + i * gap, py], [px0 + i * gap + 6 * u, py + 34 * u], [px0 + i * gap + 20 * u, py + 30 * u]], sd + 202 + i, t, 6 * u)).join(' '));
        coats.forEach((c, i) => {
          if (c !== 'coat') return;
          const x = px0 + i * gap, sw = (t) => Math.sin(t * 1.3 + i) * 3;
          const coat = t => { const s = sw(t) * u; return [[x - 10 * u, py + 30 * u], [x - 70 * u + s, py + 80 * u], [x - 90 * u + s, py + 400 * u], [x + 90 * u + s, py + 400 * u], [x + 70 * u + s, py + 80 * u], [x + 10 * u, py + 30 * u]]; };
          add(back, INK.gold, t => inkLoop(coat(t), { seed: sd + 210 + i, t }));
          add(back, INK.ink, t => inkPath(coat(t), { w: 5 * u, closed: true, seed: sd + 214 + i, t }) + ' ' + ln([[x, py + 40 * u], [x + sw(t) * u, py + 396 * u]], sd + 218 + i, t, 3 * u) + ' ' + ln([[x - 70 * u, py + 90 * u], [x - 110 * u, py + 300 * u]], sd + 220 + i, t, 4 * u));
        });
        // sea boots under the pegs (only under the coat that stayed)
        coats.forEach((c, i) => { if (c !== 'coat') return; const x = px0 + i * gap; add(mid, INK.ink, t => [-40, 40].map((d, j) => inkLoop([[x + d * u - 26 * u, fy], [x + d * u - 22 * u, fy - 120 * u], [x + d * u + 18 * u, fy - 120 * u], [x + d * u + 18 * u, fy - 30 * u], [x + d * u + 50 * u, fy - 20 * u], [x + d * u + 50 * u, fy]], { seed: sd + 230 + i * 3 + j, t, smooth: false })).join(' ')); });
        // door
        const dx = 0.86 * W, dw = 0.12 * W, dh = 0.62 * H;
        add(back, P.door === 'shut' ? INK.stain : mix(INK.ink, INK.blue, 0.4), t => inkLoop(rect(dx, fy - dh, dw, dh), { seed: sd + 240, t, smooth: false }));
        add(back, INK.ink, t => inkPath(rect(dx, fy - dh, dw, dh), { w: 6 * u, closed: true, smooth: false, seed: sd + 241, t }));
        if (P.door !== 'shut') {
          add(back, INK.stain, t => { const sw = Math.sin(t * 1.7) * 8 * u; return inkLoop([[dx, fy - dh], [dx - dw * 0.5 + sw, fy - dh - 20 * u], [dx - dw * 0.5 + sw, fy + 20 * u], [dx, fy]], { seed: sd + 242, t, smooth: false }); });
          add(back, INK.paperLight, t => Array.from({ length: 10 }, (_, j) => { const y = fy - dh + ((j * 61 + t * 600) % dh), x = dx + ((j * 37) % 100) / 100 * dw; return inkPath([[x, y], [x - 10 * u, y + 30 * u]], { w: 2.5 * u, seed: sd + 250 + j, t, amp: 0.4 }); }).join(' '));
        }
      } else if (mode === 'lantern') {
        // lantern room: storm panes (diagonal astragals) behind, the lens on its pedestal in the middle
        const gy0 = 0.08 * H, gy1 = fy - 0.2 * H;
        add(back, INK.ink, t => { const D = [ln([[0, gy0], [W, gy0]], sd + 300, t, 8 * u), ln([[0, gy1], [W, gy1]], sd + 301, t, 8 * u)]; for (let i = -6; i < 12; i++) { const x = i * 0.12 * W; D.push(ln([[x, gy1], [x + 0.16 * W, gy0]], sd + 302 + i + 6, t, 4 * u), ln([[x + 0.16 * W, gy1], [x, gy0]], sd + 330 + i + 6, t, 4 * u)); } return D.join(' '); });
        add(back, INK.stain, t => inkLoop(rect(0, gy1, W, fy - gy1), { seed: sd + 360, t, smooth: false }));
        add(back, INK.ink, t => [0.1, 0.3, 0.7, 0.9].map((q, i) => ln([[q * W, gy1], [q * W, fy]], sd + 361 + i, t, 4 * u)).join(' ') + ' ' + ln([[0, gy1 + 30 * u], [W, gy1 + 30 * u]], sd + 366, t, 4 * u));
        const cx = 0.5 * W, lw = 0.13 * W, top = 0.14 * H, bot = fy - 0.24 * H;
        lampOn = (lt, cues) => { const L = P.lamp; if (L === 'off') return 0; if (L && typeof L === 'object' && L.on != null) return clamp01((lt - atOr(cues, L.on, 0)) / 0.6); return 1; };
        add(mid, INK.stain, t => inkLoop(rect(cx - lw * 0.5, bot, lw, fy - bot), { seed: sd + 370, t, smooth: false }));
        add(mid, INK.ink, t => inkPath(rect(cx - lw * 0.5, bot, lw, fy - bot), { w: 5 * u, closed: true, smooth: false, seed: sd + 371, t }));
        const lens = t => { const p = []; for (let i = 0; i <= 10; i++) { const q = i / 10, w = lw * (0.75 + 0.35 * Math.sin(q * Math.PI)); p.push([cx - w, lerp(top, bot, q)]); } for (let i = 10; i >= 0; i--) { const q = i / 10, w = lw * (0.75 + 0.35 * Math.sin(q * Math.PI)); p.push([cx + w, lerp(top, bot, q)]); } return p; };
        add(mid, INK.paperLight, t => inkLoop(lens(t), { seed: sd + 372, t, smooth: false }));
        parts.push({ e: inkEl(mid, INK.gold, { 'fill-opacity': 0.5 }), fn: (t, lt, cues) => { const on = lampOn(lt, cues); return on > 0.02 ? inkLoop(ell(cx, lerp(top, bot, 0.5), lw * 0.95 * on, (bot - top) * 0.42 * on, 14), { seed: sd + 373, t, amp: 2 }) : ''; } });
        add(mid, INK.ink, t => { const D = [inkPath(lens(t), { w: 6 * u, closed: true, smooth: false, seed: sd + 374, t })]; for (let i = 1; i < 10; i++) { const q = i / 10, w = lw * (0.75 + 0.35 * Math.sin(q * Math.PI)), y = lerp(top, bot, q); D.push(ln([[cx - w, y], [cx + w, y]], sd + 380 + i, t, (i === 5 ? 6 : 3) * u)); } D.push(ln([[cx, top], [cx, top - 40 * u]], sd + 395, t, 5 * u)); return D.join(' '); });
        parts.push({ e: inkEl(mid, INK.gold), fn: (t, lt, cues) => { const on = lampOn(lt, cues); return on > 0.02 ? inkLoop(ell(cx, lerp(top, bot, 0.5), lw * 0.22, 30 * u * (0.9 + 0.1 * Math.sin(t * 11)), 10), { seed: sd + 396, t, amp: 1 }) : ''; } });
        // oil can on the floor
        add(front, INK.blue, t => inkLoop([[0.7 * W, fy], [0.7 * W, fy - 90 * u], [0.74 * W, fy - 100 * u], [0.77 * W, fy - 90 * u], [0.77 * W, fy]], { seed: sd + 397, t, smooth: false }));
        add(front, INK.ink, t => inkPath([[0.7 * W, fy], [0.7 * W, fy - 90 * u], [0.74 * W, fy - 100 * u], [0.77 * W, fy - 90 * u], [0.77 * W, fy]], { w: 4 * u, closed: true, smooth: false, seed: sd + 398, t }) + ' ' + ln([[0.77 * W, fy - 70 * u], [0.81 * W, fy - 110 * u]], sd + 399, t, 4 * u));
      }
      const menG = el(cam, 'g'), men = (P.men || []).map((m, i) => ({ m, f: figure(menG, m, sd + 500 + i * 9, false) }));
      const kG = el(cam, 'g'), kas = P.kasif ? figure(kG, P.kasif, sd + 590, true) : null;
      const hlR = inkEl(cam, INK.red);
      // wall shelf with plates and pots stacked away (kitchen)
      if (P.shelf) {
        const S0 = Object.assign({ x: 0.3, y: 0.46, w: 0.24 }, P.shelf === true ? {} : P.shelf), sx = S0.x * W, sy = S0.y * H, sw = S0.w * W;
        add(back, INK.stain, t => inkLoop(rect(sx, sy, sw, 18 * u), { seed: sd + 960, t, smooth: false }));
        add(back, INK.paperLight, t => [0, 1, 2, 3, 4].map(i => inkLoop(ell(sx + sw * 0.2, sy - 8 * u - i * 13 * u, 62 * u, 9 * u, 10), { seed: sd + 961 + i, t, amp: 0.5 })).join(' '));
        add(back, INK.ink, t => inkPath(rect(sx, sy, sw, 18 * u), { w: 4 * u, closed: true, smooth: false, seed: sd + 967, t }) + ' ' + [0, 1, 2, 3, 4].map(i => inkPath(ell(sx + sw * 0.2, sy - 8 * u - i * 13 * u, 62 * u, 9 * u, 10), { w: 2.5 * u, closed: true, seed: sd + 970 + i, t, amp: 0.5 })).join(' ') +
          ' ' + ln([[sx + 20 * u, sy + 18 * u], [sx + 40 * u, sy + 60 * u]], sd + 976, t, 4 * u) + ' ' + ln([[sx + sw - 20 * u, sy + 18 * u], [sx + sw - 40 * u, sy + 60 * u]], sd + 977, t, 4 * u));
        const pot = (cx, w, h, k) => [[cx - w / 2, sy], [cx - w / 2 - 4 * u, sy - h], [cx + w / 2 + 4 * u, sy - h], [cx + w / 2, sy]];
        add(back, mix(INK.inkSoft, INK.stain, 0.3), t => inkLoop(pot(sx + sw * 0.55, 90 * u, 70 * u), { seed: sd + 978, t, smooth: false }) + ' ' + inkLoop(pot(sx + sw * 0.55, 70 * u, 50 * u).map(p => [p[0], p[1] - 70 * u]), { seed: sd + 979, t, smooth: false }) + ' ' + inkLoop(pot(sx + sw * 0.85, 70 * u, 56 * u), { seed: sd + 980, t, smooth: false }));
        add(back, INK.ink, t => inkPath(pot(sx + sw * 0.55, 90 * u, 70 * u), { w: 4 * u, closed: true, smooth: false, seed: sd + 981, t }) + ' ' + inkPath(pot(sx + sw * 0.55, 70 * u, 50 * u).map(p => [p[0], p[1] - 70 * u]), { w: 4 * u, closed: true, smooth: false, seed: sd + 982, t }) + ' ' + inkPath(pot(sx + sw * 0.85, 70 * u, 56 * u), { w: 4 * u, closed: true, smooth: false, seed: sd + 983, t }) +
          ' ' + ln([[sx + sw * 0.85 + 39 * u, sy - 40 * u], [sx + sw * 0.85 + 70 * u, sy - 46 * u]], sd + 984, t, 5 * u));
      }
      // pinned checklist card on the wall: title + rows, the marks land on their cues
      const CD = P.card ? Object.assign({ x: 0.7, y: 0.14, w: 0.26, size: 54 }, P.card) : null;
      let card = null;
      if (CD) {
        const g = el(cam, 'g'), f = inkEl(g, INK.paperLight), r = inkEl(g), pin = inkEl(g, INK.red), marks = inkEl(g, INK.green), xs = inkEl(g, INK.red);
        const fs = CD.size * u, cx = CD.x * W, cy = CD.y * H, cw = CD.w * W, rows = CD.items || [], ch = fs * (1.9 + rows.length * 1.35);
        const tt = el(g, 'text', { x: f1(cx + cw / 2), y: f1(cy + fs * 1.05), 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': f1(fs), fill: INK.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
        tt.textContent = CD.title || '';
        const tx = rows.map((it, i) => { const e = el(g, 'text', { x: f1(cx + fs * 1.6), y: f1(cy + fs * (2.4 + i * 1.35)), 'font-family': INK_FONT, 'font-size': f1(fs * 0.95), fill: INK.ink, 'dominant-baseline': 'central' }); e.textContent = it.text; return e; });
        card = { g, f, r, pin, marks, xs, fs, cx, cy, cw, ch, rows, tx };
      }
      const labG = el(cam, 'g'), labs = M.labels(labG, (P.labels || []).concat(P.myth ? [{ text: P.myth.text || 'MYTH', x: P.myth.x ?? 0.5, y: P.myth.y ?? 0.42, at: P.myth.at, stamp: true, color: 'red', size: P.myth.size || 110 }] : []), W, H, sd + 700);
      const rainE = (P.rain ?? true) && win ? win.rain : null;
      return {
        update(lt, dur, cues) {
          const t = lt, hit = punch(lt, cue(cues, 'hit', null));
          M.camPush(cam, lt, dur, W, H, { zoom: P.zoom ?? 1.05, focus: P.focus || [0.5, 0.55] }, hit);
          floorL.setAttribute('d', inkPath([[-20, fy], [W + 20, fy]], { w: 5 * u, seed: sd + 900, t, amp: 1 }));
          if (win) {
            const wx = WX * W, wy = WY * H, ww = 0.16 * W, wh = 0.26 * H;
            fillP(win.f, rect(wx, wy, ww, wh), sd + 901, t, 0.8, false);
            win.r.setAttribute('d', inkPath(rect(wx, wy, ww, wh), { w: 7 * u, closed: true, smooth: false, seed: sd + 902, t }) + ' ' + ln([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], sd + 903, t, 4 * u) + ' ' + ln([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], sd + 904, t, 4 * u));
            if (rainE) rainE.setAttribute('d', Array.from({ length: 12 }, (_, j) => { const y = wy + ((j * 47 + t * 500) % wh), x = wx + ((j * 29) % 100) / 100 * ww; return inkPath([[x, y], [x - 8 * u, Math.min(wy + wh, y + 26 * u)]], { w: 2.5 * u, seed: sd + 910 + j, t, amp: 0.4 }); }).join(' '));
          }
          if (clk) {
            const cx = CL.x * W, cy = CL.y * H, r = CL.r * u;
            fillP(clk.f, ell(cx, cy, r, r, 16), sd + 920, t, 0.6); clk.r.setAttribute('d', inkPath(ell(cx, cy, r, r, 16), { w: 6 * u, closed: true, seed: sd + 921, t, amp: 0.6 }) + ' ' + Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return ln([[cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78], [cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9]], sd + 922 + i, t, 3 * u); }).join(' '));
            const st = CL.stopped === true ? 0 : atOr(cues, CL.stopped, null);
            const run = st == null ? lt : Math.min(lt, st);
            const mm = CL.time[1] + run * 6, hh = CL.time[0] + mm / 60;
            const am = mm / 60 * Math.PI * 2 - Math.PI / 2, ah = hh / 12 * Math.PI * 2 - Math.PI / 2;
            clk.h.setAttribute('d', ln([[cx, cy], [cx + Math.cos(ah) * r * 0.5, cy + Math.sin(ah) * r * 0.5]], sd + 940, t, 7 * u));
            clk.p.setAttribute('d', ln([[cx, cy], [cx + Math.cos(am) * r * 0.75, cy + Math.sin(am) * r * 0.75]], sd + 941, t, 4.5 * u) + ' ' + inkDot(cx, cy, 8 * u, 8 * u, sd + 942, t));
            const sa = st != null && st !== 0 ? st : (CL.ring != null ? atOr(cues, CL.ring, null) : null);
            clk.ring.setAttribute('d', sa != null && lt > sa ? inkPath(ell(cx, cy, r * 1.3, r * 1.3, 16), { w: 7 * u * clamp01((lt - sa) / 0.3), closed: true, seed: sd + 943, t, amp: 1.5 }) : '');
          }
          parts.forEach(p => p.e.setAttribute('d', p.fn(t, lt, cues) || ''));
          if (card) {
            const { f, r, pin, marks, xs, fs, cx, cy, cw, ch, rows } = card, sw = Math.sin(lt * 1.4) * 1.2;
            card.g.setAttribute('transform', `rotate(${sw.toFixed(2)} ${f1(cx + cw / 2)} ${f1(cy)})`);
            fillP(f, rect(cx, cy, cw, ch), sd + 990, t, 0.8, false); r.setAttribute('d', inkPath(rect(cx, cy, cw, ch), { w: 4 * u, closed: true, smooth: false, seed: sd + 991, t }) + ' ' + inkPath([[cx + cw * 0.2, cy + fs * 1.6], [cx + cw * 0.8, cy + fs * 1.6]], { w: 3 * u, seed: sd + 992, t }));
            pin.setAttribute('d', inkDot(cx + cw / 2, cy + 4 * u, 12 * u, 12 * u, sd + 993, t));
            const M = [], X = [], Cc = [];
            rows.forEach((it, i) => {
              const a = atOr(cues, it.at, 0.3 + i * 0.5), p = prog(lt, a, 0.35), x0 = cx + fs * 0.4, y0 = cy + fs * (2.4 + i * 1.35), s0 = fs * 0.42;
              M.push(inkPath(rect(x0, y0 - s0, s0 * 2, s0 * 2), { w: 3 * u, closed: true, smooth: false, seed: sd + 994 + i, t }));
              if (p <= 0.01) return;
              if (it.mark === 'x') X.push(inkPath([[x0 + 2, y0 - s0], [lerp(x0 + 2, x0 + s0 * 2 + 6, p), lerp(y0 - s0, y0 + s0 + 4, p)]], { w: 6 * u, seed: sd + 1000 + i, t }) + (p > 0.5 ? ' ' + inkPath([[x0 + s0 * 2 + 4, y0 - s0], [x0 + 2, y0 + s0 + 4]], { w: 6 * u, seed: sd + 1010 + i, t }) : ''));
              else Cc.push(inkPath([[x0 + 4, y0], [x0 + s0 * 0.8, y0 + s0 * 0.8], [lerp(x0 + s0 * 0.8, x0 + s0 * 2.4, p), lerp(y0 + s0 * 0.8, y0 - s0 * 1.4, p)]], { w: 6 * u, seed: sd + 1020 + i, t, smooth: false }));
            });
            r.setAttribute('d', r.getAttribute('d') + ' ' + M.join(' '));
            marks.setAttribute('d', Cc.join(' ')); xs.setAttribute('d', X.join(' '));
          }
          if (P.hl && mode === 'hall') {
            const a = atOr(cues, P.hl.at, 0.5), i = P.hl.i ?? 0, x = 0.2 * W + i * 0.15 * W, y = 0.3 * H + 210 * u;
            hlR.setAttribute('d', lt > a ? inkPath(ell(x, y, 150 * u, 250 * u, 18), { w: 8 * u * clamp01((lt - a) / 0.3), closed: true, seed: sd + 950, t, amp: 1.5 }) : '');
          }
          men.forEach(({ m, f }) => {
            let x = m.x, walking = false, dirx = 1, dist = 0;
            if (m.to != null) { const a = atOr(cues, m.at, 0), d = m.dur ?? 2, q = progIO(lt, a, d); walking = lt > a && lt < a + d; dirx = m.to - m.x; dist = Math.abs(m.to - m.x) * W * q; x = lerp(m.x, m.to, q); }
            f.update(lt, t, cues, x * W, (m.y ?? (fy / H)) * H, { walking, dirx, dist });
          });
          if (kas) { const K = P.kasif; let x = K.x, walking = false, dirx = 1, dist = 0; if (K.to != null) { const a = atOr(cues, K.at, 0), d = K.dur ?? 1.6, q = progIO(lt, a, d); walking = lt > a && lt < a + d; dirx = K.to - K.x; dist = Math.abs(K.to - K.x) * W * q; x = lerp(K.x, K.to, q); } kas.update(lt, t, cues, x * W, (K.y ?? (fy / H)) * H, { walking, dirx, dist }); }
          labs.update(lt, t, cues);
        },
      };
  }

  // ================================================================== fl_chart
  // Full-frame sea chart (no card on empty paper): sea wash + drifting wave strokes over the whole frame, land masses
  // (paper-dark, ink coast) with cliff hatching along their coasts, iron rail tracks, places, a dashed route, compass.
  // P: {land: [{pts: [[x, y]...] (0..1 of the frame), cliffs: false}], rails: [[[x, y]...]], route: {points, at, dur: 1.8, color},
  //     places: [{name, x, y, at, color, dx, dy, icon: "dot"|"lighthouse"|"none", lit: true, size: 60}], compass: true, labels: [L], zoom: 1.05, focus}
  SH.fl_chart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, sd = seed * 1000 + 811, u = Math.min(W, H) / 1080, C = COLS();
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sea = inkEl(cam, INK.blue, { 'fill-opacity': 0.16 }), waves = inkEl(cam, INK.blue, { 'fill-opacity': 0.55 }), grat = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.25 });
      const lands = (P.land || []).map(() => ({ f: inkEl(cam, INK.paperDark), h: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }), r: inkEl(cam) }));
      const rails = inkEl(cam), route = inkEl(cam, C[(P.route || {}).color] || INK.red);
      const places = (P.places || []).map((pl, i) => {
        const g = el(cam, 'g'), glow = inkEl(g, INK.gold, { 'fill-opacity': 0.35 }), ic = inkEl(g, INK.paperLight), icR = inkEl(g, C[pl.color] || INK.ink);
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': f1(Math.max(44, pl.size || 60) * u), fill: C[pl.color] || INK.ink, 'text-anchor': pl.anchor || 'middle', 'dominant-baseline': 'central',
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: ${f1(12 * u)}px; stroke-linejoin: round` });
        tx.textContent = pl.name; return { pl, g, glow, ic, icR, tx, i };
      });
      const comp = P.compass === false ? null : { r: inkEl(cam), f: inkEl(cam, INK.ink), t: el(cam, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': f1(48 * u), fill: INK.ink, 'text-anchor': 'middle' }) };
      if (comp) comp.t.textContent = 'N';
      const labG = el(cam, 'g'), labs = M.labels(labG, P.labels, W, H, sd + 70);
      const r0 = rng(sd + 3), WV = Array.from({ length: 34 }, () => [r0(), r0(), r0()]);
      const XY = p => [p[0] * W, p[1] * H];
      return {
        update(lt, dur, cues) {
          const t = lt, hit = punch(lt, cue(cues, 'hit', null));
          M.camPush(cam, lt, dur, W, H, { zoom: P.zoom ?? 1.05, focus: P.focus || [0.5, 0.5] }, hit);
          sea.setAttribute('d', inkLoop(rect(-40, -40, W + 80, H + 80), { seed: sd + 1, t, smooth: false, amp: 0.5 }));
          waves.setAttribute('d', WV.map((q, i) => { const x = ((q[0] * (W + 200) + t * (14 + q[2] * 12)) % (W + 200)) - 100, y = q[1] * H, L = (40 + q[2] * 50) * u;
            return inkPath([[x, y], [x + L * 0.5, y - 9 * u], [x + L, y]], { w: 3 * u, seed: sd + 10 + i, t, amp: 0.8 }); }).join(' '));
          const G = []; for (let i = 1; i < 6; i++) { G.push(inkPath([[i / 6 * W, 0], [i / 6 * W, H]], { w: 1.6 * u, seed: sd + 60 + i, t, amp: 0.6 })); if (i < 5) G.push(inkPath([[0, i / 5 * H], [W, i / 5 * H]], { w: 1.6 * u, seed: sd + 70 + i, t, amp: 0.6 })); }
          grat.setAttribute('d', G.join(' '));
          (P.land || []).forEach((L, i) => {
            const pts = L.pts.map(XY), o = lands[i];
            o.f.setAttribute('d', inkLoop(pts, { seed: sd + 100 + i, t, amp: 1.2 }));
            o.r.setAttribute('d', inkPath(pts, { w: 5 * u, closed: true, seed: sd + 120 + i, t, amp: 1.2 }));
            if (L.cliffs) {
              const hh = [], n = pts.length; let cx = 0, cy = 0; pts.forEach(p => { cx += p[0] / n; cy += p[1] / n; });
              for (let j = 0; j < n; j++) { const a = pts[j], b = pts[(j + 1) % n], seg = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(seg / (22 * u)));
                for (let m = 0; m < k; m++) { const q = (m + 0.5) / k, x = lerp(a[0], b[0], q), y = lerp(a[1], b[1], q), dx = cx - x, dy = cy - y, dl = Math.hypot(dx, dy) || 1, Lh = (18 + ((j * 7 + m * 3) % 5) * 4) * u;
                  hh.push(inkPath([[x, y], [x + dx / dl * Lh, y + dy / dl * Lh]], { w: 2.6 * u, seed: sd + 200 + j * 40 + m, t, amp: 0.6 })); } }
              o.h.setAttribute('d', hh.join(' '));
            }
          });
          rails.setAttribute('d', (P.rails || []).map((R, i) => { const pts = R.map(XY), D = [inkPath(pts, { w: 4 * u, seed: sd + 400 + i, t, amp: 0.6 })];
            for (let j = 0; j < pts.length - 1; j++) { const a = pts[j], b = pts[j + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
              for (let d = 0; d < L; d += 26 * u) { const x = a[0] + (b[0] - a[0]) * d / L, y = a[1] + (b[1] - a[1]) * d / L; D.push(inkPath([[x - nx * 10 * u, y - ny * 10 * u], [x + nx * 10 * u, y + ny * 10 * u]], { w: 2.5 * u, seed: sd + 420 + i * 50 + j * 9 + Math.round(d), t, amp: 0.4 })); } }
            return D.join(' '); }).join(' '));
          if (P.route) {
            const R = P.route, a = atOr(cues, R.at, 0.6), p = prog(lt, a, R.dur ?? 1.8), pts = R.points.map(XY), D = [];
            let tot = 0; const segL = []; for (let j = 0; j < pts.length - 1; j++) { const l = Math.hypot(pts[j + 1][0] - pts[j][0], pts[j + 1][1] - pts[j][1]); segL.push(l); tot += l; }
            let acc = 0, want = tot * p;
            for (let j = 0; j < pts.length - 1; j++) { const A = pts[j], B = pts[j + 1]; for (let d = 0; d < segL[j]; d += 34 * u) { if (acc + d > want) break; const e = Math.min(segL[j], d + 20 * u); D.push(inkPath([[lerp(A[0], B[0], d / segL[j]), lerp(A[1], B[1], d / segL[j])], [lerp(A[0], B[0], e / segL[j]), lerp(A[1], B[1], e / segL[j])]], { w: 7 * u, seed: sd + 500 + j * 60 + Math.round(d), t, amp: 0.5 })); } acc += segL[j]; }
            route.setAttribute('d', D.join(' '));
          }
          places.forEach(({ pl, g, glow, ic, icR, tx, i }) => {
            const a = atOr(cues, pl.at, 0.2 + i * 0.3); if (lt < a) { g.style.display = 'none'; return; }
            g.style.display = ''; const sp = spring(lt, a, 0.5), [x, y] = XY([pl.x, pl.y]);
            g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${Math.max(0.01, sp).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
            if (pl.icon === 'lighthouse') {
              const tp = [[x - 16 * u, y], [x - 9 * u, y - 70 * u], [x + 9 * u, y - 70 * u], [x + 16 * u, y]];
              ic.setAttribute('d', inkLoop(tp, { seed: sd + 600 + i, t, smooth: false }));
              icR.setAttribute('d', inkPath(tp, { w: 4 * u, closed: true, smooth: false, seed: sd + 610 + i, t }) + ' ' + inkLoop(rect(x - 11 * u, y - 86 * u, 22 * u, 16 * u), { seed: sd + 620 + i, t, smooth: false }));
              glow.setAttribute('d', pl.lit === false ? '' : inkLoop(ell(x, y - 78 * u, 40 * u * (1 + 0.15 * Math.sin(lt * 4)), 40 * u * (1 + 0.15 * Math.sin(lt * 4)), 12), { seed: sd + 630 + i, t, amp: 1 }));
            } else if (pl.icon === 'none') { ic.setAttribute('d', ''); icR.setAttribute('d', ''); glow.setAttribute('d', ''); } else {
              ic.setAttribute('d', inkLoop(ell(x, y, 16 * u, 16 * u, 10), { seed: sd + 600 + i, t, amp: 0.8 }));
              icR.setAttribute('d', inkPath(ell(x, y, 16 * u, 16 * u, 10), { w: 5 * u, closed: true, seed: sd + 610 + i, t, amp: 0.8 }) + ' ' + inkDot(x, y, 6 * u, 6 * u, sd + 620 + i, t));
            }
            tx.setAttribute('x', f1(x + (pl.dx ?? 0) * u)); tx.setAttribute('y', f1(y + (pl.dy ?? -50) * u));
          });
          if (comp) {
            const cx = (P.compass_x ?? 0.9) * W, cy = (P.compass_y ?? 0.8) * H, R = 70 * u, rot = Math.sin(lt * 0.6) * 3 * Math.PI / 180, S = [], F = [];
            S.push(inkPath(ell(cx, cy, R * 0.75, R * 0.75, 16), { w: 3 * u, closed: true, seed: sd + 700, t, amp: 0.8 }));
            for (let q = 0; q < 4; q++) { const an = q * Math.PI / 2 - Math.PI / 2 + rot, tip = [cx + Math.cos(an) * R, cy + Math.sin(an) * R], l = [cx + Math.cos(an - 1.4) * R * 0.18, cy + Math.sin(an - 1.4) * R * 0.18];
              (q === 0 ? F : S).push(q === 0 ? inkLoop([l, tip, [cx, cy]], { seed: sd + 701 + q, t, smooth: false, amp: 0.5 }) : inkPath([l, tip, [cx, cy]], { w: 3 * u, closed: true, smooth: false, seed: sd + 701 + q, t, amp: 0.5 })); }
            comp.r.setAttribute('d', S.join(' ')); comp.f.setAttribute('d', F.join(' '));
            comp.t.setAttribute('x', f1(cx)); comp.t.setAttribute('y', f1(cy - R - 14 * u));
          }
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== fl_paper
  SH.fl_paper = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB, sd = seed * 1000 + 733, u = Math.min(W, H) / 1080, kind = P.kind || 'log';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const desk = inkEl(cam, mix(INK.stain, INK.paperDark, 0.35)), deskR = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const lampG = el(cam, 'g'), lampGlow = inkEl(lampG, INK.gold, { 'fill-opacity': 0.25 }), lampB = inkEl(lampG, INK.blue), lampR = inkEl(lampG), lampF = inkEl(lampG, INK.gold);
      // the document rectangle
      const S = kind === 'telegram' ? { x: 0.24 * W, y: 0.12 * H, w: 0.52 * W, h: 0.76 * H } : kind === 'slate' ? { x: 0.18 * W, y: 0.1 * H, w: 0.64 * W, h: 0.8 * H } : { x: 0.1 * W, y: 0.08 * H, w: 0.8 * W, h: 0.84 * H };
      const docF = inkEl(cam, kind === 'slate' ? mix(INK.ink, INK.inkSoft, 0.3) : INK.paperLight), docR = inkEl(cam), rules = inkEl(cam, kind === 'slate' ? INK.paperLight : INK.blue, { 'fill-opacity': kind === 'slate' ? 0.25 : 0.35 });
      const frame = kind === 'slate' ? inkEl(cam, INK.stain) : null, frameR = kind === 'slate' ? inkEl(cam) : null;
      const scrib = inkEl(cam, kind === 'slate' ? INK.paperLight : INK.inkSoft, { 'fill-opacity': kind === 'slate' ? 0.75 : 0.8 });
      const head = el(cam, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 64 * u, fill: INK.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      head.textContent = P.header || (kind === 'telegram' ? 'TELEGRAM' : '');
      const C = COLS();
      const lines = (P.lines || []).map((L, i) => {
        const size = Math.max(44, L.size || 64) * u;
        const tx = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': size, fill: kind === 'slate' && !L.color ? INK.paperLight : (C[L.color] || INK.ink), 'text-anchor': 'start', 'dominant-baseline': 'central' });
        tx.textContent = L.text; let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * L.text.length * 0.5; }
        tx.textContent = '';
        const strike = inkEl(cam, INK.red);
        return { L, tx, w, size, strike, i };
      });
      const pen = inkEl(cam, kind === 'slate' ? INK.paperLight : INK.ink);
      const labG = el(cam, 'g'), labs = M.labels(labG, (P.labels || []).concat(P.stamp ? [Object.assign({ x: 0.66, y: 0.5, stamp: true, color: 'red', size: 110, rot: -8 }, P.stamp)] : []), W, H, sd + 70);
      return {
        update(lt, dur, cues) {
          const t = lt, hit = punch(lt, cue(cues, 'hit', null));
          M.camPush(cam, lt, dur, W, H, { zoom: P.zoom ?? 1.05, focus: P.focus || [0.5, 0.5] }, hit);
          fillP(desk, rect(-30, -30, W + 60, H + 60), sd + 1, t, 0.5, false);
          const G = []; for (let i = 0; i < 9; i++) { const y = (i + 0.5) / 9 * H; G.push(inkPath([[-20, y], [W * 0.4, y + 10 * u], [W + 20, y - 6 * u]], { w: 2 * u, seed: sd + 2 + i, t, amp: 1.2 })); }
          deskR.setAttribute('d', G.join(' '));
          // oil lamp in the corner, flickering
          const lx = (kind === 'log' ? 0.94 : 0.88) * W, ly = 0.86 * H, fl = 1 + 0.08 * Math.sin(lt * 13) + 0.05 * Math.sin(lt * 7.3);
          if (P.lamp !== false) {
            lampGlow.setAttribute('d', inkLoop(ell(lx, ly - 200 * u, 190 * u * fl, 190 * u * fl, 16), { seed: sd + 10, t, amp: 2 }));
            const bp = [[lx - 60 * u, ly], [lx - 70 * u, ly - 60 * u], [lx - 30 * u, ly - 100 * u], [lx + 30 * u, ly - 100 * u], [lx + 70 * u, ly - 60 * u], [lx + 60 * u, ly]];
            fillP(lampB, bp, sd + 11, t); lampR.setAttribute('d', inkPath(bp, { w: 5 * u, closed: true, seed: sd + 12, t }) + ' ' + inkPath([[lx - 34 * u, ly - 100 * u], [lx - 44 * u, ly - 250 * u], [lx + 44 * u, ly - 250 * u], [lx + 34 * u, ly - 100 * u]], { w: 4 * u, closed: true, seed: sd + 13, t }));
            fillP(lampF, [[lx - 14 * u, ly - 120 * u], [lx, ly - 120 * u - 70 * u * fl], [lx + 14 * u, ly - 120 * u]], sd + 14, t, 0.6);
          }
          if (frame) { fillP(frame, rect(S.x - 40 * u, S.y - 40 * u, S.w + 80 * u, S.h + 80 * u), sd + 20, t, 0.6, false); frameR.setAttribute('d', inkPath(rect(S.x - 40 * u, S.y - 40 * u, S.w + 80 * u, S.h + 80 * u), { w: 6 * u, closed: true, smooth: false, seed: sd + 21, t })); }
          fillP(docF, rect(S.x, S.y, S.w, S.h), sd + 22, t, 0.6, false);
          const DR = [inkPath(rect(S.x, S.y, S.w, S.h), { w: 5 * u, closed: true, smooth: false, seed: sd + 23, t })];
          if (kind === 'log') DR.push(ln([[S.x + S.w / 2, S.y], [S.x + S.w / 2, S.y + S.h]], sd + 24, t, 6 * u));
          docR.setAttribute('d', DR.join(' '));
          const R = [];
          if (kind !== 'slate') {
            const halves = kind === 'log' ? [[S.x, S.x + S.w / 2], [S.x + S.w / 2, S.x + S.w]] : [[S.x, S.x + S.w]];
            const y0 = S.y + (kind === 'telegram' ? 0.24 : 0.12) * S.h;
            for (let y = y0; y < S.y + S.h - 30 * u; y += 70 * u) halves.forEach(([a, b], j) => R.push(inkPath([[a + 20 * u, y], [b - 20 * u, y]], { w: 2 * u, seed: sd + 30 + Math.round(y) + j, t, amp: 0.6 })));
            if (kind === 'log') halves.forEach(([a], j) => R.push(inkPath([[a + 120 * u, S.y + 20 * u], [a + 120 * u, S.y + S.h - 20 * u]], { w: 2.5 * u, seed: sd + 28 + j, t, amp: 0.6 })));
          }
          rules.setAttribute('d', R.join(' '));
          if (head.textContent) { head.setAttribute('x', f1(S.x + S.w / 2)); head.setAttribute('y', f1(S.y + 0.1 * S.h)); }
          // scribble rows: unreadable hand-writing that writes itself
          const sc = P.scribble === false ? null : Object.assign({ rows: 7, at: 0.1, dur: 4, y0: 0.18, y1: 0.86 }, P.scribble || {});
          const SC = [];
          let penAt = null;
          if (sc) {
            const a = atOr(cues, sc.at, 0.1), p = clamp01((lt - a) / sc.dur);
            const cols = kind === 'log' ? [[0.04, 0.46], [0.54, 0.96]] : [[0.06, 0.94]];
            const total = sc.rows * cols.length;
            for (let k = 0; k < total; k++) {
              const ci = Math.floor(k / sc.rows), ri = k % sc.rows, q = clamp01(p * total - k);
              if (q <= 0) break;
              const [c0, c1] = cols[ci], y = S.y + lerp(sc.y0, sc.y1, sc.rows > 1 ? ri / (sc.rows - 1) : 0) * S.h - 14 * u;
              const xs = S.x + (c0 + (kind === 'log' ? 0.08 : 0)) * S.w, xe = lerp(xs, S.x + (c1 - (ri % 3) * 0.05) * S.w, q);
              const pts = []; for (let x = xs, m = 0; x <= xe; x += 14 * u, m++) pts.push([x, y + Math.sin(m * 1.9 + k) * 10 * u - (m % 5 === 0 ? 10 * u : 0)]);
              if (pts.length > 1) SC.push(inkPath(pts, { w: 3 * u, seed: sd + 300 + k, t, amp: 0.5 }));
              if (q < 1) penAt = [xe, y];
            }
          }
          scrib.setAttribute('d', SC.join(' '));
          lines.forEach(({ L, tx, w, size, strike, i }) => {
            const a = atOr(cues, L.at, 0.3 + i * 1.2), d = L.dur ?? 1.4, p = clamp01((lt - a) / d);
            const x = S.x + (L.x ?? 0.08) * S.w, y = S.y + (L.y ?? (0.3 + i * 0.16)) * S.h;
            const n = Math.round(L.text.length * p);
            tx.textContent = L.text.slice(0, n); tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(y));
            if (p > 0 && p < 1) penAt = [x + w * p, y];
            const sa = L.strike != null ? atOr(cues, L.strike, null) : null, sp = sa != null ? prog(lt, sa, 0.4) : 0;
            strike.setAttribute('d', sp > 0.01 ? inkPath([[x - 12 * u, y + 4 * u], [x - 12 * u + (w + 24 * u) * sp, y - 6 * u]], { w: 10 * u, seed: sd + 400 + i, t, amp: 1 }) : '');
          });
          if (penAt) {
            const [px, py] = penAt;
            pen.setAttribute('d', kind === 'slate' ? inkPath([[px, py + 10 * u], [px + 40 * u, py + 120 * u]], { w: 14 * u, seed: sd + 500, t, amp: 0.6 }) : inkPath([[px, py + 6 * u], [px + 30 * u, py - 60 * u], [px + 80 * u, py - 200 * u]], { w: 6 * u, seed: sd + 500, t, amp: 0.6 }));
          } else pen.setAttribute('d', '');
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
