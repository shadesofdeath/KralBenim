// alv_drift: shots for the Stickstory Short "Alvarenga, 438 days adrift" (2026-11-23). In November 2012 the fisherman
// José Salvador Alvarenga left Costa Azul (Chiapas, Mexico) in a 7 m open fiberglass skiff; a storm killed the outboard,
// the radio died, and he drifted about 6,000 miles across the Pacific to Ebon Atoll, Marshall Islands (30 Jan 2014).
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any small-boat / castaway story.
// Uses td__lib.js (TD.label, TD.sun, TD.stars) and tz__lib.js (TZ.water). The hero is params.hero / params.mate (period
// figures, no hat); the narrator (fez) only through params.kasif.
//
// K (figure) = {x, y (ground, 0..1 H), scale, pose, face: "left"|"right", dir, emotion, beard, accessory,
//               seq: [{at, pose, dir, face, emotion}]}  (on the boat x/y are ignored: the figure stands on the deck)
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot, underline}
//
// SHOTS.alv_sea — open sea, side view: a white fiberglass skiff (blue stripe, outboard at the stern, icebox amidships)
//   with the hero (and optionally the mate) on it; a big foreground swell fills the lower frame.
//   P: {mode: "hook"|"storm"|"catch"|"night", sea: 0.6 (waterline 0..1 H), boat: {x: 0.5, s: 1.1, rock: 3},
//       hero: K, hero_at: -150 (deck x, boat units), mate: K | false, mate_at: -20, cap: false (a cap left on the icebox),
//       engine: cue (storm: the motor's last puff, it dies), bolt: cue|[cues] (storm: lightning), fish: cue (catch: a
//       fish jumps into the raised hand), bird: cue (catch: a gull swoops into the other hand), gulls: 2,
//       front: true (foreground swell), labels: [L]}
//   cues: hit (punch) + the names above + label/seq names
// SHOTS.alv_close — close-ups with their own foreground. P: {mode: "radio"|"turtle", labels: [L]}
//   radio: a hand holds a walkie-talkie up in the rain, the screen glows, signal arcs pulse from the antenna; cue
//     "dead": the screen goes black, the arcs stop, a red battery icon drains. P.dead
//   turtle: the hero big behind the boat's gunwale under a blazing sun; cue "rain": a raindrop icon is crossed out red;
//     cue "turtle": he lifts a sea turtle in both arms. P: {hero: K, rain, turtle, sun: [x, y, r]}
// SHOTS.alv_shore — a beach (set "coast"): sand from P.gy down, surf line, foreground beach grass / driftwood / shells.
//   P: {mode: "start"|"land"|"end", gy: 0.62, palms: [[x, s, flip]...] (0..1), hut: x | false (palm-thatch hut),
//       boat: {x, s, rot, from (drift in from this x), at: cue, dur: 2.4, water: true (afloat at the surf line)},
//       hero: K, hero_at, mate: K | false, mate_at, kasif: K | false, labels: [L]}
// SHOTS.alv_map — old ink map of the North Pacific (no set): North and Central America on the right, Hawaii, the
//   Marshall Islands, Kiribati, New Guinea and Australia's corner on the left; wave hatching, compass rose.
//   P: {pins: [{lon, lat, at, label: L}], route: {points: [[lon, lat]...], at: cue, dur: 2.6} | false,
//       counter: {to: 6000, unit: "MILES", at, dur, x: 0.5, y: 0.53, size: 96} | false, kasif: K | false, labels: [L]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const R2 = (x, y, s, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return p => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s]; };
  const fill = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ring = (e, pts, sd, t, w = 5, amp = 1, smooth = true) => e.setAttribute('d', inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth }));
  const line = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);

  // ------------------------------------------------------------------ figure (hero / mate / narrator)
  function figure(parent, K, sd, hat) {
    const rig = KASIF.create(el(parent, 'g'), { scale: K.scale ?? 0.5, hat, accessory: hat ? null : (K.accessory || null), beard: hat ? null : (K.beard || null), seed: sd });
    return {
      K,
      update(lt, t, cues, x, y) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at), face = faceOf(s.face ?? K.face, 1);
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, s.pose || 'idle', o), sc = K.scale ?? 0.5;
        return { hand: [x + face * sc * r.hands[1][0], y + sc * r.hands[1][1]], hand2: [x + face * sc * r.hands[0][0], y + sc * r.hands[0][1]],
          head: [x + face * sc * r.head[0], y + sc * r.head[1]], face, pose: s.pose };
      },
    };
  }
  const figAt = (parent, K, sd, hat, W, H) => K ? Object.assign(figure(parent, K, sd, hat), { px: (K.x ?? 0.5) * W, py: (K.y ?? 0.6) * H }) : null;

  // ------------------------------------------------------------------ the skiff (side view, bow right), waterline y = 0
  //   back layer: icebox + far rim (behind the crew); front layer: hull, stripe, outboard (in front of the crew's legs)
  function skiff(back, front, sd) {
    const rimB = inkEl(back, mix(INK.inkSoft, INK.paperDark, 0.4)), box = inkEl(back, INK.paperLight), boxR = inkEl(back), boxL = inkEl(back);
    const hull = inkEl(front, INK.paperLight), hullR = inkEl(front), stripe = inkEl(front, INK.blue), shade = inkEl(front, INK.paperDark, { 'fill-opacity': 0.7 });
    const motor = inkEl(front, mix(INK.inkSoft, INK.paperDark, 0.35)), motorR = inkEl(front), shaft = inkEl(front), smoke = inkEl(front, INK.inkSoft, { 'fill-opacity': 0.55 });
    const spark = inkEl(front, INK.red), capE = inkEl(back, INK.red), capR = inkEl(back);
    return {
      update(t, x, y, s, rock, o = {}) {
        const R = R2(x, y, s, rock), k = sd * 7;
        // far rim (inside of the hull, seen over the near gunwale)
        fill(rimB, [[-262, -64], [262, -74], [306, -116], [250, -86], [-258, -80]].map(R), k + 1, t, 0.8, false);
        // icebox amidships
        const bp = [[40, -60], [44, -150], [200, -152], [204, -64]];
        fill(box, bp.map(R), k + 2, t, 1, false); ring(boxR, bp.map(R), k + 3, t, 5, 1, false);
        boxL.setAttribute('d', line([[44, -132], [200, -134]].map(R), k + 4, t, 3) + ' ' + line([[104, -152], [104, -168], [140, -168], [140, -152]].map(R), k + 5, t, 4));
        if (o.cap) {   // a small cap left on the icebox
          const cp = [[92, -152], [96, -186], [118, -196], [140, -186], [146, -152]], br = [[140, -156], [184, -150], [180, -144], [140, -150]];
          capE.setAttribute('d', inkLoop(cp.map(R), { seed: k + 6, t }) + ' ' + inkLoop(br.map(R), { seed: k + 7, t, smooth: false }));
          capR.setAttribute('d', inkPath(cp.map(R), { w: 4, seed: k + 8, t, closed: true }));
        } else { capE.setAttribute('d', ''); capR.setAttribute('d', ''); }
        // hull
        const hp = [[-272, -64], [256, -76], [318, -122], [300, -60], [258, 4], [190, 28], [-238, 30], [-270, -6]];
        fill(hull, hp.map(R), k + 10, t); ring(hullR, hp.map(R), k + 11, t, 6);
        fill(stripe, [[-270, -44], [264, -56], [296, -82], [286, -60], [262, -36], [-268, -26]].map(R), k + 12, t, 0.8, false);
        fill(shade, [[-262, 4], [254, 0], [190, 26], [-236, 28]].map(R), k + 13, t, 0.8, false);
        // outboard motor, tilted up when dead
        const tilt = o.tilt ?? 0, M = R2(...R([-268, -66]), s, rock + 32 * tilt);
        const mp = [[-14, 0], [-64, -2], [-84, -30], [-80, -96], [-24, -102], [-8, -52]];
        fill(motor, mp.map(M), k + 20, t, 1, false); ring(motorR, mp.map(M), k + 21, t, 5, 1, false);
        motorR.setAttribute('d', motorR.getAttribute('d') + ' ' + line([[-80, -74], [-12, -72]].map(M), k + 24, t, 3));
        shaft.setAttribute('d', line([[-40, 0], [-42, 104]].map(M), k + 22, t, 10) + ' ' + line([[-62, 100], [-22, 110]].map(M), k + 23, t, 7));
        // smoke puffs: o.smoke 0..1 strength, o.burst 0..1 last black puff
        const S = [], top = M([-56, -118]);
        const sm = o.smoke ?? 0;
        if (sm > 0) for (let i = 0; i < 5; i++) { const u = (t * 0.7 + i / 5) % 1; S.push(inkLoop(ell(top[0] - u * 140 * s, top[1] - u * 180 * s, (14 + u * 34) * s * sm, (10 + u * 24) * s * sm, 9), { seed: k + 30 + i, t, amp: 1.2 })); }
        const bu = o.burst ?? 0;
        if (bu > 0 && bu < 1) for (let i = 0; i < 3; i++) S.push(inkLoop(ell(top[0] - (bu * 60 + i * 38) * s, top[1] - (bu * 120 + i * 46) * s, (26 + bu * 34 - i * 5) * s * (1 - bu * 0.4), (20 + bu * 24 - i * 4) * s * (1 - bu * 0.4), 11), { seed: k + 40 + i, t, amp: 2 }));
        smoke.setAttribute('d', S.join(' '));
        smoke.setAttribute('fill', bu > 0 ? mix(INK.ink, INK.inkSoft, 0.4) : INK.inkSoft);
        if (bu > 0 && bu < 0.6) {
          const st = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rr = (i % 2 ? 46 : 20) * s * (0.6 + bu); st.push([top[0] + Math.cos(a) * rr, top[1] + 10 + Math.sin(a) * rr]); }
          spark.setAttribute('d', inkLoop(st, { seed: k + 41, t, smooth: false }));
        } else spark.setAttribute('d', '');
        return { R, deck: x0 => R([x0, -46]), bow: R([318, -122]) };
      },
    };
  }

  // gull (wings flapping), side view
  const gull = (x, y, s, flap, sd, t) => inkPath([[x - 44 * s, y + flap * s], [x - 18 * s, y - 13 * s], [x, y + 3 * s], [x + 18 * s, y - 13 * s], [x + 44 * s, y + flap * s]], { w: 5 * Math.max(0.7, s), seed: sd, t, amp: 0.6 });

  // fish (side view, head +x), returns path strings [body, outline+details]
  function fishD(x, y, s, rot, sd, t) {
    const R = R2(x, y, s, rot);
    const bp = [[-70, 0], [-30, -30], [30, -30], [70, -6], [74, 4], [30, 26], [-30, 24]].map(R), tp = [[-66, 0], [-110, -34], [-100, 0], [-110, 34]].map(R);
    return [inkLoop(bp, { seed: sd, t }) + ' ' + inkLoop(tp, { seed: sd + 1, t }),
      inkPath(bp, { w: 4, seed: sd + 2, t, closed: true }) + ' ' + inkPath(tp, { w: 4, seed: sd + 3, t, closed: true }) + ' ' + inkDot(...R([46, -6]), 6 * s, 6 * s, sd + 4, t) +
      ' ' + inkPath([R([22, -24]), R([16, 0]), R([22, 22])], { w: 3, seed: sd + 5, t })];
  }

  // sea turtle (top view), returns [shell fill, skin fill, outlines]
  function turtleD(x, y, s, rot, sd, t, paddle = 0) {
    const R = R2(x, y, s, rot), sw = Math.sin(paddle) * 14;
    const sh = ell(0, 0, 110, 86, 16).map(R);
    const fl = [
      [[60, -50], [140 + sw, -110], [170 + sw, -96], [90, -30]], [[60, 50], [140 - sw, 110], [170 - sw, 96], [90, 30]],
      [[-70, -46], [-120, -84 - sw], [-104, -40]], [[-70, 46], [-120, 84 + sw], [-104, 40]],
    ].map(q => q.map(R));
    const hd = ell(140, 0, 40, 30, 10).map(R);
    const skin = fl.map((q, i) => inkLoop(q, { seed: sd + 10 + i, t })).join(' ') + ' ' + inkLoop(hd, { seed: sd + 15, t });
    const pat = [];
    for (const [cx, cy] of [[0, 0], [-50, -30], [-50, 30], [50, -30], [50, 30]]) pat.push(inkPath(ell(cx, cy, 30, 24, 6).map(R), { w: 3, seed: sd + 20 + cx + cy, t, closed: true }));
    const out = inkPath(sh, { w: 6, seed: sd + 2, t, closed: true }) + ' ' + fl.map((q, i) => inkPath(q, { w: 4, seed: sd + 30 + i, t, closed: true })).join(' ') +
      ' ' + inkPath(hd, { w: 4, seed: sd + 36, t, closed: true }) + ' ' + inkDot(...R([158, -12]), 5 * s, 5 * s, sd + 37, t) + ' ' + pat.join(' ');
    return [inkLoop(sh, { seed: sd + 1, t }), skin, out];
  }

  // palm tree: trunk curve from (x, y) up, fronds; returns paths [trunk fill, fronds fill, outlines]
  function palmD(x, y, s, flip, sd, t) {
    const sway = Math.sin(t * 0.9 + sd) * 10, F = flip ? -1 : 1;
    const top = [x + F * (90 + sway) * s, y - 560 * s];
    const trunk = [], tl = [], tr = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10, cx = x + F * (Math.pow(u, 1.6) * (90 + sway * u)) * s, cy = y - u * 560 * s, w = lerp(26, 14, u) * s; tl.push([cx - w, cy]); tr.push([cx + w, cy]); trunk.push([cx, cy]); }
    const tf = [...tl, ...tr.reverse()];
    const fr = [];
    for (let k = 0; k < 7; k++) {
      const a = (-160 + k * 50 + Math.sin(t * 1.3 + k) * 4) * Math.PI / 180, L = (210 + (k % 2) * 50) * s;
      const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.75 + 70 * s];
      const mid = [top[0] + Math.cos(a) * L * 0.5, top[1] + Math.sin(a) * L * 0.5 - 30 * s];
      fr.push([top, [mid[0] - 22 * s * Math.sin(a), mid[1] - 18 * s], tip, [mid[0] + 18 * s * Math.sin(a), mid[1] + 20 * s]]);
    }
    const rings = []; for (let i = 1; i < 10; i++) rings.push(inkPath([tl[i], [lerp(tl[i][0], tr[tr.length - 1 - i][0], 0.5), tl[i][1] + 6 * s], tr[tr.length - 1 - i]], { w: 2.5, seed: sd + 60 + i, t }));
    return [inkLoop(tf, { seed: sd, t, smooth: false }), fr.map((q, i) => inkLoop(q, { seed: sd + 10 + i, t })).join(' '),
      inkPath(tf, { w: 5, seed: sd + 1, t, closed: true, smooth: false }) + ' ' + fr.map((q, i) => inkPath(q, { w: 4, seed: sd + 30 + i, t, closed: true })).join(' ') + ' ' + rings.join(' ') +
      ' ' + [[-24, 20], [8, 34], [26, 14]].map((d, i) => inkDot(top[0] + d[0] * s, top[1] + d[1] * s, 17 * s, 17 * s, sd + 50 + i, t)).join(' ')];
  }

  // rain streaks over the frame
  function rainD(W, H, lt, sd, t, n = 46, y1 = 1) {
    const r = rng(sd), S = [];
    for (let i = 0; i < n; i++) { const x0 = r() * (W + 300), sp = 900 + r() * 500, ph = r(); const y = ((lt * sp / H + ph) % 1) * H * y1, x = x0 - y * 0.28;
      S.push(inkPath([[x, y], [x - 16, y + 58]], { w: 3, seed: sd + i, t, amp: 0.4 })); }
    return S.join(' ');
  }

  // foreground swell (lower frame)
  function swell(parent, sd) {
    const g = el(parent, 'g');
    const sw = inkEl(g, mix(INK.blue, INK.ink, 0.35)), swR = inkEl(g), foam = inkEl(g, INK.paperLight), lines = inkEl(g, INK.ink, { 'fill-opacity': 0.55 });
    return {
      update(lt, t, W, H, y0, amp = 1, dark = false) {
        const top = [];
        for (let i = 0; i <= 18; i++) { const x = -40 + i / 18 * (W + 80); top.push([x, y0 + Math.sin(x * 0.006 + t * 1.1 + sd) * 44 * amp + Math.sin(x * 0.017 - t * 1.7) * 14 * amp]); }
        sw.setAttribute('fill', dark ? mix(INK.blue, INK.ink, 0.6) : mix(INK.blue, INK.ink, 0.35));
        fill(sw, [...top, [W + 40, H + 40], [-40, H + 40]], sd + 1, t, 1, false);
        swR.setAttribute('d', inkPath(top, { w: 7, seed: sd + 2, t }));
        const FO = [], LN = [];
        for (let i = 0; i < 6; i++) { const k = i * 3 + 1, p = top[k], q = top[k + 1]; FO.push(inkLoop([[p[0], p[1] - 4], [lerp(p[0], q[0], 0.5), Math.min(p[1], q[1]) - 22], [q[0], q[1] - 2], [lerp(p[0], q[0], 0.5), Math.max(p[1], q[1]) + 8]], { seed: sd + 10 + i, t })); }
        for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = ((i + 0.5 * j) / 4 * (W + 200) + t * (30 + j * 8)) % (W + 200) - 100, y = y0 + 110 + j * 110; LN.push(inkPath([[x, y], [x + 60, y - 14], [x + 130, y]], { w: 4, seed: sd + 20 + j * 4 + i, t })); }
        foam.setAttribute('d', FO.join(' ')); lines.setAttribute('d', LN.join(' '));
      },
    };
  }

  // ================================================================== alv_sea
  SH.alv_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 431, root = el(svg, 'g'), cam = el(root, 'g');
      const mode = P.mode || 'hook', seaY = (P.sea ?? 0.6) * H, night = mode === 'night', storm = mode === 'storm';
      const B = Object.assign({ x: 0.5, s: 1.1, rock: storm ? 10 : 3 }, P.boat || {});
      const skyG = el(cam, 'g');
      const sun = mode === 'hook' || mode === 'catch' ? window.TD.sun(el(skyG, 'g'), sd + 3) : null;
      const stars = night ? window.TD.stars(el(skyG, 'g'), sd + 4, W, H, 30, 0.14, 0.42) : null;
      const gullE = inkEl(skyG);
      const boltE = inkEl(skyG, INK.paperLight), boltR = inkEl(skyG, INK.gold);
      const farWater = window.TZ.water(el(cam, 'g'), sd + 5);
      const back = el(cam, 'g'), crew = el(cam, 'g'), front = el(cam, 'g');
      const boat = skiff(back, front, sd + 10);
      const hero = P.hero ? figure(crew, P.hero, sd + 30, false) : null;
      const mate = P.mate ? figure(crew, P.mate, sd + 40, false) : null;
      const kas = P.kasif ? figure(crew, P.kasif, sd + 45, true) : null;
      const catchG = el(cam, 'g'), fishF = inkEl(catchG, mix(INK.blue, INK.paperLight, 0.45)), fishR = inkEl(catchG), splash = inkEl(catchG, INK.paperLight), splashR = inkEl(catchG);
      const birdF = inkEl(catchG, INK.paperLight), birdR = inkEl(catchG);
      const water = window.TZ.water(el(cam, 'g'), sd + 60);
      const sw = P.front === false ? null : swell(el(cam, 'g'), sd + 70);
      const rainE = storm ? inkEl(root, INK.inkSoft, { 'fill-opacity': 0.8 }) : null;
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pk = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${seaY}) scale(${(1 + 0.05 * pk).toFixed(3)}) translate(${-W / 2} ${-seaY})`);
          if (sun) sun.update(t, W * 0.8, H * 0.2, 70);
          if (stars) stars.update(t);
          const GS = [];
          for (let i = 0; i < (P.gulls ?? (night || storm ? 0 : 2)); i++) { const cx = W * (0.3 + i * 0.35), cy = H * (0.25 + i * 0.05), a = lt * (0.6 + i * 0.2) + i * 2;
            GS.push(gull(cx + Math.cos(a) * 160, cy + Math.sin(a) * 50, 0.9, Math.sin(lt * 7 + i * 2) * 14, sd + 3 + i, t)); }
          gullE.setAttribute('d', GS.join(' '));
          // lightning: a zig-zag bolt for 0.35 s
          const BL = [].concat(P.bolt ?? []).map(b => atOr(cues, b, null)).filter(v => v != null);
          const bnow = BL.find(a => lt >= a && lt < a + 0.35);
          if (storm && bnow != null) {
            const bx = W * (0.28 + 0.4 * ((BL.indexOf(bnow) * 0.37) % 1)), pts = [[bx, -10]];
            for (let i = 1; i <= 7; i++) pts.push([bx + (i % 2 ? 46 : -30) + i * 8, i * (seaY - 200) / 7]);
            boltE.setAttribute('d', inkPath(pts, { w: 22, seed: sd + 90, t, amp: 1.5 })); boltR.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 91, t, amp: 1.5 }));
          } else { boltE.setAttribute('d', ''); boltR.setAttribute('d', ''); }
          const rough = storm ? 2.2 : night ? 0.6 : 1;
          farWater.update(t, W, H, seaY - 90, { rough: 0.5 * rough, dark: night || storm });
          // boat
          const bob = Math.sin(t * (storm ? 2.4 : 1.6)) * (storm ? 26 : 8), rk = Math.sin(t * (storm ? 1.9 : 1.2) + 0.5) * B.rock + (storm ? Math.sin(t * 0.7) * 4 : 0);
          const eng = atOr(cues, P.engine, null);
          let smoke = 0, burst = 0, tilt = mode === 'storm' ? 0 : 1;
          if (storm) { if (eng == null || lt < eng) smoke = 0.7 + 0.3 * Math.sin(lt * 9); else burst = clamp01((lt - eng) / 1.1); }
          const bx = B.x * W, by = seaY + bob;
          const b = boat.update(t, bx, by, B.s, rk, { smoke, burst, tilt, cap: P.cap });
          let hr = null;
          if (hero) hr = hero.update(lt, t, cues, ...b.deck(P.hero_at ?? -150));
          if (mate) mate.update(lt, t, cues, ...b.deck(P.mate_at ?? -20));
          if (kas) kas.update(lt, t, cues, ...b.deck(P.kasif_at ?? -20));
          // catch: a fish leaps from the water into the raised hand; a gull swoops into the other hand
          if (mode === 'catch' && hr) {
            const fa = atOr(cues, P.fish, null), ba = atOr(cues, P.bird, null);
            if (fa != null && lt >= fa) {
              const u = progIO(lt, fa, 0.55), from = [hr.hand[0] + 160, seaY + 140], to = hr.hand;
              const x = lerp(from[0], to[0], u), y = lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 220;
              const d = fishD(x + (u >= 1 ? 70 : 0), y + (u >= 1 ? 10 : 0), 0.95, u >= 1 ? -20 + Math.sin(lt * 14) * 16 : -40 + u * 20, sd + 300, t);
              fishF.setAttribute('d', d[0]); fishR.setAttribute('d', d[1]);
              const su = lin(lt, fa, 0.7);
              if (su < 1) { const SP = []; for (let i = 0; i < 5; i++) { const a = -Math.PI * (0.15 + i * 0.17), rr = 40 + su * 120; SP.push(inkLoop(ell(from[0] + Math.cos(a) * rr, from[1] - 30 + Math.sin(a) * rr, 12 * (1 - su) + 4, 18 * (1 - su) + 5, 7), { seed: sd + 310 + i, t })); }
                splash.setAttribute('d', SP.join(' ')); } else splash.setAttribute('d', '');
            } else { fishF.setAttribute('d', ''); fishR.setAttribute('d', ''); splash.setAttribute('d', ''); }
            if (ba != null) {
              const u = progIO(lt, ba - 0.9, 0.9), hx = Math.max(W * 0.13, hr.hand2[0] - 70), from = [W + 120, H * 0.2], to = [hx, hr.hand2[1] - 20];
              const x = lerp(from[0], to[0], u), y = lerp(from[1], to[1], u) - Math.sin(u * Math.PI) * 60, s = 1.2;
              const flap = u >= 1 ? Math.sin(lt * 16) : Math.sin(lt * 8);
              const body = ell(x, y, 44 * s, 24 * s, 12), head = ell(x - 44 * s, y - 18 * s, 18 * s, 16 * s, 10);
              const wing = sg => [[x - 6 * s, y - 10 * s], [x + sg * 50 * s, y - (60 + 40 * flap) * s], [x + sg * 110 * s, y - (40 + 70 * flap) * s], [x + sg * 40 * s, y - 4 * s]];
              const wl = wing(-1), wr = wing(1);
              birdF.setAttribute('d', inkLoop(body, { seed: sd + 320, t }) + ' ' + inkLoop(head, { seed: sd + 321, t }) + ' ' + inkLoop(wl, { seed: sd + 328, t }) + ' ' + inkLoop(wr, { seed: sd + 329, t }));
              birdR.setAttribute('d', inkPath(body, { w: 4, seed: sd + 322, t, closed: true }) + ' ' + inkPath(head, { w: 4, seed: sd + 323, t, closed: true }) +
                ' ' + inkPath(wl, { w: 5, seed: sd + 324, t, closed: true }) + ' ' + inkPath(wr, { w: 5, seed: sd + 330, t, closed: true }) +
                ' ' + inkPath([[x - 60 * s, y - 20 * s], [x - 86 * s, y - 12 * s], [x - 60 * s, y - 10 * s]], { w: 4, seed: sd + 325, t }) + ' ' + inkDot(x - 48 * s, y - 22 * s, 3.5, 3.5, sd + 326, t) +
                ' ' + inkPath([[x + 40 * s, y + 4 * s], [x + 76 * s, y + 12 * s]], { w: 5, seed: sd + 327, t }) +
                (u >= 1 ? ' ' + [0, 1].map(i => inkPath([[x + (i ? 70 : -70) * s, y - 110 * s], [x + (i ? 84 : -84) * s, y - 132 * s]], { w: 4, seed: sd + 331 + i, t })).join(' ') : ''));
            }
          }
          water.update(t, W, H, seaY + 10, { rough, dark: night || storm });
          if (sw) sw.update(lt, t, W, H, seaY + (P.front_dy ?? 300), storm ? 1.8 : 1, night || storm);
          if (rainE) rainE.setAttribute('d', rainD(W, H, lt, sd + 400, t, 60));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== alv_close
  SH.alv_close = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 531, root = el(svg, 'g'), cam = el(root, 'g');
      const mode = P.mode || 'radio';
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      if (mode === 'radio') {
        const water = window.TZ.water(el(cam, 'g'), sd + 3);
        const arcs = inkEl(cam, INK.gold), sleeve = inkEl(cam, mix(INK.blue, INK.ink, 0.25)), sleeveR = inkEl(cam);
        const body = inkEl(cam, mix(INK.ink, INK.inkSoft, 0.2)), bodyR = inkEl(cam, INK.ink), ant = inkEl(cam, INK.ink);
        const scr = inkEl(cam, INK.gold), scrR = inkEl(cam, INK.paperLight), grille = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.75 }), btn = inkEl(cam, INK.red), btnR = inkEl(cam);
        const hand = inkEl(cam, INK.paperLight), handR = inkEl(cam);
        const bat = inkEl(cam, INK.paperLight), batR = inkEl(cam), batF = inkEl(cam, INK.red);
        const gun = inkEl(cam, INK.paperLight), gunR = inkEl(cam), gunS = inkEl(cam, INK.blue);
        const rainE = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.8 });
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, dead = atOr(cues, P.dead ?? 'dead', dur * 0.6), pk = punch(lt, dead, 0.6) + punch(lt, atOr(cues, 'hit', null), 0.6);
            const on = lt < dead, sh = Math.sin(t * 1.6) * 10;
            water.update(t, W, H, H * 0.55, { rough: 1.6, dark: true });
            // gunwale of the boat across the lower frame
            const gp = [[-40, H * 0.76 + sh * 0.5], [W + 40, H * 0.72 + sh * 0.5], [W + 40, H + 40], [-40, H + 40]];
            fill(gun, gp, sd + 5, t, 1, false); ring(gunR, gp, sd + 6, t, 6, 1, false);
            fill(gunS, [[-40, H * 0.8 + sh * 0.5], [W + 40, H * 0.76 + sh * 0.5], [W + 40, H * 0.79 + sh * 0.5], [-40, H * 0.83 + sh * 0.5]], sd + 7, t, 1, false);
            const R = R2(W * 0.5, H * 0.43 + sh, 1 + 0.05 * pk, -8 + Math.sin(t * 1.1) * 2);
            // sleeve + forearm from the lower right
            const slp = [[60, 260], [160, 250], [560, 980], [300, 1100]];
            fill(sleeve, slp.map(R), sd + 8, t); ring(sleeveR, slp.map(R), sd + 9, t, 6);
            const bp = [[-130, -250], [130, -250], [140, 300], [-140, 300]];
            fill(body, bp.map(R), sd + 10, t, 1, false); ring(bodyR, bp.map(R), sd + 11, t, 7, 1, false);
            ant.setAttribute('d', line([[80, -250], [84, -470]].map(R), sd + 12, t, 18) + ' ' + inkDot(...R([84, -478]), 16, 16, sd + 13, t));
            const sp = [[-96, -210], [96, -210], [96, -70], [-96, -70]];
            scr.setAttribute('fill', on ? INK.gold : INK.ink);
            fill(scr, sp.map(R), sd + 14, t, 0.8, false); ring(scrR, sp.map(R), sd + 15, t, 4, 0.8, false);
            const G = []; for (let i = 0; i < 6; i++) G.push(inkPath([[-90, -20 + i * 30], [90, -20 + i * 30]].map(R), { w: 6, seed: sd + 20 + i, t }));
            grille.setAttribute('d', G.join(' '));
            const bt = ell(0, 220, 46, 30, 12).map(R);
            fill(btn, bt, sd + 30, t); ring(btnR, bt, sd + 31, t, 4);
            // fist round the lower half
            const hp = [[-160, 120], [-60, 70], [80, 80], [170, 140], [180, 300], [60, 360], [-140, 330], [-180, 220]];
            fill(hand, hp.map(R), sd + 32, t); ring(handR, hp.map(R), sd + 33, t, 6);
            handR.setAttribute('d', handR.getAttribute('d') + ' ' + [0, 1, 2].map(i => line([[-150, 170 + i * 50], [-40, 160 + i * 50]].map(R), sd + 34 + i, t, 4)).join(' '));
            // signal arcs while on
            const A = [];
            if (on) for (let i = 0; i < 3; i++) { const u = (lt * 1.4 + i / 3) % 1, c = R([84, -478]), rr = 40 + u * 170;
              A.push(inkPath(Array.from({ length: 11 }, (_, j) => { const a = -Math.PI * 0.85 + j / 10 * Math.PI * 0.7; return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]; }), { w: 12 * (1 - u) + 3, seed: sd + 40 + i, t })); }
            arcs.setAttribute('d', A.join(' '));
            // battery icon (top right), drains after "dead"
            const bu = on ? 1 : 1 - progIO(lt, dead, 0.8), bx = W * 0.8, by = H * 0.17, bw = 150, bh = 76;
            const bo = [[bx - bw / 2, by - bh / 2], [bx + bw / 2, by - bh / 2], [bx + bw / 2, by + bh / 2], [bx - bw / 2, by + bh / 2]];
            fill(bat, bo, sd + 60, t, 1, false); ring(batR, bo, sd + 61, t, 6, 1, false);
            batR.setAttribute('d', batR.getAttribute('d') + ' ' + inkLoop([[bx + bw / 2, by - 16], [bx + bw / 2 + 16, by - 16], [bx + bw / 2 + 16, by + 16], [bx + bw / 2, by + 16]], { seed: sd + 62, t, smooth: false }));
            batF.setAttribute('fill', on ? INK.green : INK.red);
            const fw = (bw - 24) * Math.max(0.06, bu);
            fill(batF, [[bx - bw / 2 + 12, by - bh / 2 + 12], [bx - bw / 2 + 12 + fw, by - bh / 2 + 12], [bx - bw / 2 + 12 + fw, by + bh / 2 - 12], [bx - bw / 2 + 12, by + bh / 2 - 12]], sd + 63, t, 0.6, false);
            rainE.setAttribute('d', rainD(W, H, lt, sd + 400, t, 50));
            labs.forEach(l => l.update(lt, t, cues));
          },
        };
      }
      // turtle
      const sunO = window.TD.sun(el(cam, 'g'), sd + 3);
      const drop = inkEl(cam, INK.blue, { 'fill-opacity': 0.6 }), dropR = inkEl(cam), cross = inkEl(cam, INK.red);
      const water = window.TZ.water(el(cam, 'g'), sd + 4);
      const crew = el(cam, 'g');
      const K = Object.assign({ scale: 1.35, pose: 'idle', face: 'right', beard: 'short' }, P.hero || {});
      const hero = figure(crew, K, sd + 30, false);
      const tShell = inkEl(cam, mix(INK.green, INK.stain, 0.35)), tSkin = inkEl(cam, mix(INK.green, INK.paperLight, 0.45)), tOut = inkEl(cam);
      const gun = inkEl(cam, INK.paperLight), gunR = inkEl(cam), gunS = inkEl(cam, INK.blue), gunSh = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 });
      const seam = inkEl(cam, INK.inkSoft), bones = inkEl(cam, INK.ink), rope = inkEl(cam, mix(INK.stain, INK.ink, 0.25)), lap = swell(el(cam, 'g'), sd + 90);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pk = punch(lt, atOr(cues, 'hit', null), 0.6);
          const S = P.sun || [0.78, 0.17, 95];
          sunO.update(t, S[0] * W, S[1] * H, S[2] * (1 + 0.08 * Math.sin(t * 2)));
          // raindrop icon, crossed out on "rain"
          const ra = atOr(cues, P.rain ?? 'rain', 0.4), dx = W * 0.3, dy = H * 0.2, dp = spring(lt, ra - 0.35, 0.5);
          const dpts = [[dx, dy - 80 * dp], [dx + 46 * dp, dy + 10 * dp], [dx + 40 * dp, dy + 40 * dp], [dx, dy + 62 * dp], [dx - 40 * dp, dy + 40 * dp], [dx - 46 * dp, dy + 10 * dp]];
          if (dp > 0.02) { fill(drop, dpts, sd + 5, t); ring(dropR, dpts, sd + 6, t, 6); } else { drop.setAttribute('d', ''); dropR.setAttribute('d', ''); }
          const cu = lt >= ra ? prog(lt, ra, 0.3) : 0;
          cross.setAttribute('d', cu > 0.01 ? inkPath([[dx - 90, dy - 90], [dx - 90 + 180 * cu, dy - 90 + 180 * cu]], { w: 20, seed: sd + 7, t, taper: 0.2 }) +
            (cu > 0.5 ? ' ' + inkPath([[dx + 90, dy - 90], [dx + 90 - 180 * (cu - 0.5) * 2, dy - 90 + 180 * (cu - 0.5) * 2]], { w: 20, seed: sd + 8, t, taper: 0.2 }) : '') : '');
          water.update(t, W, H, H * 0.5, { rough: 0.5 });
          const bob = Math.sin(t * 1.4) * 6, gy = H * (P.gy ?? 0.9) + bob;
          const ta = atOr(cues, P.turtle ?? 'turtle', dur * 0.5);
          const hr = hero.update(lt, t, cues, W * (K.x ?? 0.36), gy);
          // turtle: rises from below the gunwale into the hands
          const u = progIO(lt, ta - 0.5, 0.6);
          const tx = lerp(W * 0.7, hr.hand[0] + 70, u), ty = lerp(H * 0.8, Math.min(hr.hand[1] + 20, H * (P.turtle_y ?? 0.47)), u);
          const d = turtleD(tx, ty, 1.05 * (1 + 0.06 * pk), -70 + 20 * u, sd + 300, t, lt * 5);
          tShell.setAttribute('d', d[0]); tSkin.setAttribute('d', d[1]); tOut.setAttribute('d', d[2]);
          // gunwale (the near side of the boat) across the lower frame
          const g0 = H * (P.gun ?? 0.64) + bob * 0.6;
          const gp = [[-40, g0 + 20], [W + 40, g0 - 10], [W + 40, H + 40], [-40, H + 40]];
          fill(gun, gp, sd + 10, t, 1, false); ring(gunR, gp, sd + 11, t, 6, 1, false);
          fill(gunS, [[-40, g0 + 80], [W + 40, g0 + 50], [W + 40, g0 + 90], [-40, g0 + 120]], sd + 12, t, 1, false);
          fill(gunSh, [[-40, g0 + 420], [W + 40, g0 + 390], [W + 40, H + 40], [-40, H + 40]], sd + 13, t, 1, false);
          // seams on the hull
          seam.setAttribute('d', [200, 300].map((dy, i) => line([[-40, g0 + dy + 20], [W + 40, g0 + dy - 10]], sd + 14 + i, t, 2.5)).join(' ') +
            ' ' + [0.18, 0.5, 0.82].map((x, i) => line([[x * W, g0 + 140], [x * W + 4, g0 + 390]], sd + 17 + i, t, 2.5)).join(' '));
          // drying line along the rim with fish skeletons swinging
          const ly = g0 + 30, LP = [[W * 0.06, ly + 10], [W * 0.5, ly + 60], [W * 0.94, ly + 4]];
          const FB = [inkPath(LP, { w: 4, seed: sd + 20, t })];
          [0.22, 0.42, 0.62].forEach((u, i) => { const x = lerp(LP[0][0], LP[2][0], u), y = ly + 10 + Math.sin(u * Math.PI) * 50, sw = Math.sin(t * 2 + i) * 6, R = R2(x, y, 1, 90 + sw);
            FB.push(inkPath([R([0, 0]), R([150, 0])], { w: 5, seed: sd + 21 + i, t }));
            for (let r = 0; r < 5; r++) { const bx = 30 + r * 22; FB.push(inkPath([R([bx, -26 + r * 2]), R([bx + 6, 0]), R([bx, 26 - r * 2])], { w: 3, seed: sd + 30 + i * 7 + r, t })); }
            FB.push(inkPath([R([150, 0]), R([180, -24]), R([180, 24]), R([150, 0])], { w: 4, seed: sd + 60 + i, t, closed: true }));
            FB.push(inkPath(ell(...R([-14, 0]), 18, 14, 8), { w: 4, seed: sd + 70 + i, t, closed: true })); });
          bones.setAttribute('d', FB.join(' '));
          // rope coil hanging over the rim (right)
          const rx = W * 0.84, ry = g0 + 250, RC = [];
          for (let i = 0; i < 4; i++) RC.push(inkPath(ell(rx, ry + i * 10, 110 - i * 8, 150 - i * 10, 16), { w: 9, seed: sd + 80 + i, t, closed: true }));
          RC.push(inkPath([[rx - 20, g0 - 6], [rx - 30, ry - 140]], { w: 9, seed: sd + 85, t }));
          rope.setAttribute('d', RC.join(' '));
          // water lapping at the bottom
          lap.update(lt, t, W, H, H * 0.93, 0.5, false);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== alv_shore
  SH.alv_shore = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 631, root = el(svg, 'g'), cam = el(root, 'g');
      const mode = P.mode || 'land', gy = (P.gy ?? 0.62) * H;
      const palmG = el(cam, 'g'), PT = (P.palms || []).map(() => ({ t: inkEl(palmG, INK.stain), f: inkEl(palmG, mix(INK.green, INK.ink, 0.15)), o: inkEl(palmG) }));
      const hutG = el(cam, 'g'), hutT = inkEl(hutG, mix(INK.gold, INK.stain, 0.4)), hutP = inkEl(hutG), hutL = inkEl(hutG, INK.ink);
      const surf = inkEl(cam, INK.paperLight), surfR = inkEl(cam, INK.inkSoft), wet = inkEl(cam, INK.stain, { 'fill-opacity': 0.3 });
      const BO = P.boat ? Object.assign({ x: 0.6, s: 0.9, rot: 0 }, P.boat) : null;
      const back = el(cam, 'g'), crew = el(cam, 'g'), front = el(cam, 'g');
      const boat = BO ? skiff(back, front, sd + 10) : null;
      const hero = P.hero ? figure(crew, P.hero, sd + 30, false) : null;
      const mate = P.mate ? figure(crew, P.mate, sd + 40, false) : null;
      const kG = el(cam, 'g');
      const kas = P.kasif ? figure(kG, P.kasif, sd + 45, true) : null;
      const near = el(cam, 'g'), grass = inkEl(near, mix(INK.green, INK.ink, 0.2)), grassR = inkEl(near), wood = inkEl(near, INK.stain), woodR = inkEl(near), shells = inkEl(near, INK.paperLight), shellsR = inkEl(near), sandL = inkEl(near, INK.stain);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pk = punch(lt, atOr(cues, 'hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${gy}) scale(${(1 + 0.05 * pk).toFixed(3)}) translate(${-W / 2} ${-gy})`);
          (P.palms || []).forEach((p, i) => { const d = palmD(p[0] * W, gy + (p[3] ?? 0) * H, p[1] ?? 1, !!p[2], sd + 500 + i * 97, t); PT[i].t.setAttribute('d', d[0]); PT[i].f.setAttribute('d', d[1]); PT[i].o.setAttribute('d', d[2]); });
          if (P.hut != null && P.hut !== false) {
            const hx = P.hut * W, hy = gy - 10, s = P.hut_s ?? 1;
            const roof = [[hx - 230 * s, hy - 250 * s], [hx, hy - 420 * s], [hx + 230 * s, hy - 250 * s], [hx + 200 * s, hy - 236 * s], [hx - 200 * s, hy - 236 * s]];
            fill(hutT, roof, sd + 80, t);
            const TH = []; for (let i = 0; i < 9; i++) { const u = i / 8; TH.push(line([[hx, hy - 410 * s], [hx - 210 * s + u * 420 * s, hy - 244 * s]], sd + 81 + i, t, 2.5)); }
            hutL.setAttribute('d', TH.join(' ') + ' ' + inkPath(roof, { w: 5, seed: sd + 95, t, closed: true }));
            hutP.setAttribute('d', [-170, -60, 60, 170].map((dx, i) => line([[hx + dx * s, hy - 240 * s], [hx + dx * s + 2, hy]], sd + 96 + i, t, 9)).join(' '));
          }
          // surf line + wet sand
          const SU = []; for (let i = 0; i <= 20; i++) { const x = -40 + i / 20 * (W + 80); SU.push([x, gy + 8 + Math.sin(x * 0.02 + t * 1.8) * 6 + Math.sin(t * 0.9) * 8]); }
          fill(surf, [...SU, [W + 40, gy - 8], [-40, gy - 8]], sd + 100, t, 1, false);
          surfR.setAttribute('d', inkPath(SU, { w: 4, seed: sd + 101, t }));
          fill(wet, [...SU, [W + 40, gy + 70], [-40, gy + 80]], sd + 102, t, 1, false);
          // boat (beached or drifting in)
          if (boat) {
            const a = atOr(cues, BO.at, 0), u = BO.from != null ? progIO(lt, a, BO.dur ?? 2.4) : 1;
            const bx = lerp(BO.from ?? BO.x, BO.x, u) * W, afloat = BO.water || u < 1;
            const bob = afloat ? Math.sin(t * 1.7) * 8 * (1 - u * 0.7) : 0, rk = afloat ? Math.sin(t * 1.2) * 3 * (1 - u * 0.7) : 0;
            const b = boat.update(t, bx, gy + (BO.dy ?? 30) * BO.s + bob, BO.s, (BO.rot ?? 0) + rk, { tilt: BO.tilt ?? 1 });
            if (hero) hero.update(lt, t, cues, ...(P.hero_at != null ? b.deck(P.hero_at) : [(P.hero.x ?? 0.3) * W, (P.hero.y ?? 0.72) * H]));
            if (mate) mate.update(lt, t, cues, ...(P.mate_at != null ? b.deck(P.mate_at) : [(P.mate.x ?? 0.5) * W, (P.mate.y ?? 0.72) * H]));
          } else {
            if (hero) hero.update(lt, t, cues, (P.hero.x ?? 0.3) * W, (P.hero.y ?? 0.72) * H);
            if (mate) mate.update(lt, t, cues, (P.mate.x ?? 0.5) * W, (P.mate.y ?? 0.72) * H);
          }
          if (kas) kas.update(lt, t, cues, (P.kasif.x ?? 0.7) * W, (P.kasif.y ?? 0.75) * H);
          // near foreground: sand hatching, driftwood log, shells, beach grass tufts
          const SL = []; for (let j = 0; j < 9; j++) for (let i = 0; i < 5; i++) { const x = ((i + (j % 2) * 0.5) / 5) * W + 30, y = gy + 140 + j * 85; SL.push(line([[x, y], [x + 50, y - 6]], sd + 110 + j * 5 + i, t, 2.5)); }
          sandL.setAttribute('d', SL.join(' '));
          const wx = W * (mode === 'end' ? 0.3 : 0.66), wy = H * 0.84;
          const wp = [[wx - 300, wy + 14], [wx - 290, wy - 56], [wx + 270, wy - 96], [wx + 296, wy - 30], [wx - 280, wy + 30]];
          fill(wood, wp, sd + 150, t); ring(woodR, wp, sd + 151, t, 6);
          woodR.setAttribute('d', woodR.getAttribute('d') + ' ' + line([[wx - 200, wy - 18], [wx + 180, wy - 42]], sd + 152, t, 3) + ' ' + inkPath(ell(wx + 240, wy - 46, 18, 26, 8), { w: 4, seed: sd + 153, t, closed: true }));
          const SH_ = [], SHR = [];
          for (let i = 0; i < 4; i++) { const x = W * (0.12 + i * 0.25), y = H * (0.82 + (i % 2) * 0.05), p = [[x - 30, y + 10], [x, y - 26], [x + 30, y + 10]];
            SH_.push(inkLoop(p, { seed: sd + 160 + i, t })); SHR.push(inkPath(p, { w: 4, seed: sd + 170 + i, t, closed: true }) + ' ' + line([[x, y - 22], [x, y + 8]], sd + 180 + i, t, 2.5)); }
          shells.setAttribute('d', SH_.join(' ')); shellsR.setAttribute('d', SHR.join(' '));
          const GR = [], GRR = [];
          for (const [cx, k] of [[0.04, 0], [0.96, 1], [mode === 'end' ? 0.56 : 0.42, 2]]) {
            const x = cx * W, y = H + 10;
            for (let i = 0; i < 6; i++) { const a = (-120 + i * 12 + Math.sin(t * 1.5 + i + k) * 5) * Math.PI / 180, L = 330 + (i % 3) * 110;
              const p = [[x - 12, y], [x + Math.cos(a) * L * 0.5 - 8, y + Math.sin(a) * L * 0.5], [x + Math.cos(a) * L, y + Math.sin(a) * L], [x + Math.cos(a) * L * 0.5 + 10, y + Math.sin(a) * L * 0.5 + 6], [x + 12, y]];
              GR.push(inkLoop(p, { seed: sd + 200 + k * 10 + i, t })); GRR.push(inkPath(p, { w: 3, seed: sd + 230 + k * 10 + i, t, closed: true })); }
          }
          grass.setAttribute('d', GR.join(' ')); grassR.setAttribute('d', GRR.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== alv_map
  // [lon (0..360, east positive), lat]
  const NAM = [[188, 66], [192, 60], [200, 58.6], [206, 59.6], [210, 60.4], [214, 60], [218, 58.6], [222, 57.6], [225.5, 55.5], [228, 53.5], [230.5, 50.5],
    [234.5, 48.4], [236, 46.2], [235.8, 43.4], [236.2, 40.6], [237.6, 38.6], [239, 36.4], [240.6, 34.4], [242.6, 33.6], [243.4, 32], [244.6, 30.2], [245.8, 28.2],
    [247, 26.4], [248.4, 24.6], [250, 23], [250.8, 24], [249.2, 26.8], [248.2, 29.2], [247.4, 31.4], [248.6, 31], [250.4, 28.4], [252.6, 25.8], [253.8, 23.6], [254.6, 21.6],
    [254.6, 20.2], [256.2, 18.9], [258.4, 17.8], [260.6, 16.9], [262.6, 16.2], [264.6, 15.8], [266.6, 15.4], [268.4, 14.4], [270.4, 13.4], [272.4, 12.6], [274.4, 11.2], [276, 9.6],
    [278, 8.4], [280.4, 8.2], [282, 7.6], [290, 7], [290, 72], [188, 72]];
  const NGUINEA = [[141, -2.6], [144, -3.6], [146.4, -5.6], [148, -7.4], [150.2, -10.4], [148.4, -10.2], [146.6, -8.8], [144.2, -7.8], [142.4, -9.2], [141, -9.2], [130, -9], [130, -1]];
  const NBRIT = [[148.6, -5.4], [150.4, -5.2], [152.2, -4.2], [152.6, -4.8], [151.4, -5.8], [149.6, -6.2]];
  const AUS = [[141.6, -12.6], [142.4, -10.8], [143.4, -12.8], [144.6, -14.4], [145.4, -16], [146.2, -18.6], [148.6, -20.4], [150.4, -22.6], [152.8, -25.4], [153.6, -28.6], [153, -31.6], [151.4, -33.8], [150, -37.4], [140, -38], [130, -30], [130, -12]];
  const ISLES = [[204.5, 19.6, 14], [203.4, 20.8, 7], [202, 21.4, 7], [200.4, 22, 6],                                    // Hawaii
    [171.2, 7.1, 5], [169.6, 6.2, 5], [168.8, 4.6, 6], [171.4, 9.6, 4], [168.6, 9.2, 4], [170, 10.8, 4], [166.2, 11.2, 4],    // Marshall Islands
    [173, 1.4, 4], [174.2, -0.4, 4], [176, -2.4, 4],                                                                     // Gilbert Is. (Kiribati)
    [200.6, 3.9, 5], [202.6, 1.9, 6], [197.6, 5.9, 4],                                                                   // Line Islands (Kiribati)
    [158.2, 6.9, 5], [151.8, 7.4, 4], [163, 5.3, 4], [134.5, 7.5, 5], [144.8, 13.4, 5]];                                 // Micronesia, Palau, Guam
  SH.alv_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 731, root = el(svg, 'g'), cam = el(root, 'g');
      const lon0 = P.lon0 ?? 146, k = W / ((P.lon1 ?? 272) - lon0), lat0 = P.lat0 ?? 8, y0 = (P.y0 ?? 0.38) * H;
      const M = q => [(q[0] - lon0) * k, y0 + (lat0 - q[1]) * k];
      const sea = inkEl(cam, INK.blue, { 'fill-opacity': 0.16 }), grid = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.5 }), hatch = inkEl(cam, INK.inkSoft);
      const land = inkEl(cam, mix(INK.paperDark, INK.green, 0.25)), landR = inkEl(cam), isl = inkEl(cam, mix(INK.paperDark, INK.green, 0.3)), islR = inkEl(cam);
      const route = inkEl(cam, INK.red), boatF = inkEl(cam, INK.paperLight), boatR = inkEl(cam), pins = inkEl(cam, INK.red), pinR = inkEl(cam), pulse = inkEl(cam, INK.red);
      const mtS = inkEl(cam, mix(INK.green, INK.stain, 0.35)), mtK = inkEl(cam, mix(INK.green, INK.paperLight, 0.45)), mtO = inkEl(cam);
      const comp = inkEl(cam, INK.inkSoft), compF = inkEl(cam, INK.red, { 'fill-opacity': 0.8 });
      const cntG = el(root, 'g'), card = inkEl(cntG, INK.paperLight), cardR = inkEl(cntG);
      const C = P.counter ? Object.assign({ to: 6000, unit: 'MILES', at: 'count', dur: 2.2, x: 0.5, y: 0.53, size: 96 }, P.counter) : null;
      const ctx_ = C ? el(cntG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size, 'text-anchor': 'middle', fill: INK.ink }) : null;
      const kG = el(root, 'g'), kas = P.kasif ? figure(kG, P.kasif, sd + 45, true) : null;
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      const RT = P.route ? P.route.points.map(M) : null;
      let RL = null;
      if (RT) { RL = [0]; for (let i = 1; i < RT.length; i++) RL.push(RL[i - 1] + Math.hypot(RT[i][0] - RT[i - 1][0], RT[i][1] - RT[i - 1][1])); }
      const along = d => { for (let i = 1; i < RT.length; i++) if (d <= RL[i]) { const u = (d - RL[i - 1]) / (RL[i] - RL[i - 1] || 1); return [lerp(RT[i - 1][0], RT[i][0], u), lerp(RT[i - 1][1], RT[i][1], u), Math.atan2(RT[i][1] - RT[i - 1][1], RT[i][0] - RT[i - 1][0])]; } const n = RT.length - 1; return [RT[n][0], RT[n][1], 0]; };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, pk = punch(lt, atOr(cues, 'hit', null), 0.6);
          fill(sea, [[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], sd + 1, t, 0.5, false);
          const GRD = [];
          for (let la = 60; la >= -60; la -= 20) GRD.push(inkPath([M([lon0 - 5, la]), M([lon0 + 140, la])], { w: 1.6, seed: sd + 100 + la, t, amp: 0.4, smooth: false }));
          for (let lo = 150; lo <= 270; lo += 20) GRD.push(inkPath([M([lo, 85]), M([lo, -90])], { w: 1.6, seed: sd + 300 + lo, t, amp: 0.4, smooth: false }));
          grid.setAttribute('d', GRD.join(' '));
          const HT = [];
          for (let j = 0; j < 14; j++) for (let i = 0; i < 4; i++) { const x = ((i + (j % 2) * 0.5) / 4) * W + 40 + Math.sin(t * 0.8 + j) * 10, y = H * 0.05 + j * H * 0.07;
            if (x > W * 0.78 && y < H * 0.45) continue;
            HT.push(inkPath([[x, y], [x + 26, y - 9], [x + 52, y], [x + 78, y - 9]], { w: 2.5, seed: sd + 400 + j * 5 + i, t, amp: 0.6 })); }
          hatch.setAttribute('d', HT.join(' '));
          const LD = [NAM, NGUINEA, NBRIT, AUS].map(q => q.map(M));
          land.setAttribute('d', LD.map((q, i) => inkLoop(q, { seed: sd + 10 + i, t, smooth: false })).join(' '));
          landR.setAttribute('d', LD.map((q, i) => inkPath(q, { w: 5, seed: sd + 20 + i, t, closed: true, smooth: false })).join(' '));
          isl.setAttribute('d', ISLES.map((q, i) => { const p = M(q); return inkDot(p[0], p[1], q[2] * 1.6, q[2] * 1.3, sd + 30 + i, t); }).join(' '));
          islR.setAttribute('d', ISLES.map((q, i) => { const p = M(q); return inkPath(ell(p[0], p[1], q[2] * 1.6 + 3, q[2] * 1.3 + 3, 8), { w: 3, seed: sd + 60 + i, t, closed: true }); }).join(' '));
          // pins with a pulse ring
          const PN = [], PR = [], PU = [];
          (P.pins || []).forEach((pn, i) => { const a = atOr(cues, pn.at, 0.3), p = spring(lt, a, 0.5); if (lt < a) return; const c = M([pn.lon, pn.lat]), r = 20 * p;
            const pts = [[c[0], c[1]], [c[0] - r, c[1] - r * 1.6], [c[0], c[1] - r * 2.6], [c[0] + r, c[1] - r * 1.6]];
            PN.push(inkLoop(pts, { seed: sd + 500 + i, t })); PR.push(inkPath(pts, { w: 4, seed: sd + 510 + i, t, closed: true }));
            const u = ((lt - a) * 0.9) % 1; PU.push(inkPath(ell(c[0], c[1], 20 + u * 90, (20 + u * 90) * 0.6, 14), { w: 6 * (1 - u) + 1, seed: sd + 520 + i, t, closed: true })); });
          pins.setAttribute('d', PN.join(' ')); pinR.setAttribute('d', PR.join(' ')); pulse.setAttribute('d', PU.join(' '));
          // dashed drift route with the small boat at its head
          if (RT) {
            const a = atOr(cues, P.route.at, 0.4), u = progIO(lt, a, P.route.dur ?? 2.6), L = RL[RL.length - 1] * u, D = [];
            for (let d = 0; d < L; d += 34) { const p = along(d), q = along(Math.min(L, d + 20)); D.push(inkPath([[p[0], p[1]], [q[0], q[1]]], { w: 9, seed: sd + 600 + d, t, amp: 0.6 })); }
            route.setAttribute('d', D.join(' '));
            if (lt >= a) {
              const h = along(L), bob = Math.sin(t * 3) * 3, R = R2(h[0], h[1] - 18 + bob, 0.36, 0);
              const hp = [[-100, -30], [100, -36], [130, -62], [110, 0], [-90, 10]].map(q => R([-q[0], q[1]]));
              fill(boatF, hp, sd + 700, t); ring(boatR, hp, sd + 701, t, 4);
            } else { boatF.setAttribute('d', ''); boatR.setAttribute('d', ''); }
          }
          if (P.turtle !== false) {
            const T = P.turtle || [0.3, 0.8], u = (lt * 0.04) % 1;
            const d = turtleD(T[0] * W + u * 160, T[1] * H - u * 60, 0.75, -20, sd + 950, t, lt * 4);
            mtS.setAttribute('d', d[0]); mtK.setAttribute('d', d[1]); mtO.setAttribute('d', d[2]);
          }
          // compass rose (lower right)
          const cx = W * 0.8, cy = H * 0.79, cr = 80, CP = [];
          for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; CP.push(inkPath([[cx + Math.cos(a) * cr, cy + Math.sin(a) * cr], [cx + Math.cos(a + 0.6) * 18, cy + Math.sin(a + 0.6) * 18], [cx - Math.cos(a) * 10, cy - Math.sin(a) * 10]], { w: 3, seed: sd + 800 + i, t, closed: true })); }
          CP.push(inkPath(ell(cx, cy, cr * 0.62, cr * 0.62, 16), { w: 2.5, seed: sd + 810, t, closed: true }));
          comp.setAttribute('d', CP.join(' '));
          compF.setAttribute('d', inkLoop([[cx, cy - cr], [cx + 16, cy - 10], [cx - 16, cy - 10]], { seed: sd + 811, t }));
          // counter card
          if (C) {
            const a = atOr(cues, C.at, 0.4), p = spring(lt, a - 0.2, 0.5), uu = progIO(lt, a, C.dur), v = Math.round(lerp(0, C.to, uu) / 10) * 10, done = uu >= 1, pkc = punch(lt, a + C.dur, 0.6);
            const x = C.x * W, y = C.y * H, w = C.size * 6.2, h = C.size * 1.45;
            cntG.setAttribute('opacity', clamp01(p * 3).toFixed(3));
            cntG.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(-2 + (1 - p) * 6)}) scale(${(lerp(0.5, 1, p) * (1 + 0.1 * pkc)).toFixed(3)})`);
            const cp = [[-w / 2, -h / 2], [w / 2, -h / 2 - 5], [w / 2 + 4, h / 2], [-w / 2 - 3, h / 2 + 4]];
            card.setAttribute('fill', done ? INK.red : INK.paperLight);
            fill(card, cp, sd + 900, t, 1, false); ring(cardR, cp, sd + 901, t, 5, 1, false);
            ctx_.textContent = '~' + v.toLocaleString('en-US') + ' ' + C.unit; ctx_.setAttribute('y', f1(C.size * 0.35)); ctx_.setAttribute('fill', done ? INK.paperLight : INK.ink);
          }
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.04 * pk).toFixed(3)}) translate(${-W / 2} ${-H / 2})`);
          if (kas) kas.update(lt, t, cues, (P.kasif.x ?? 0.78) * W, (P.kasif.y ?? 0.76) * H);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
