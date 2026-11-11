// lk_locks: shots for the Stickstory long video "The unpickable lock" (2026-11-11), parchment ink (theme "parchment",
// brand/kit/BRAND.md §3, §5). Palette tokens only (INK), every line boils at 8 Hz via _ink.js, pure function of
// (seed, lt); no Math.random. Needs tz__lib.js (TZ.Shapes) and mcB__lib.js (MCB.cast, MCB.labels) at build time.
// Laid out for the 1920x1080 long-video stage. Common P: cast: [MCB cast entries] (Kaşif = who "kasif"),
// labels: [MCB label entries: {text, x, y (0..1), at, size, color, stamp, arrow, strike}].
//
// SHOTS.lk_padlock — the Elizabethan brass letter padlock from the Ann Francis wreck (1583).
//   P: {mode: "seabed"|"wreck"|"table"|"scan"|"xray"|"chest", lock: {x: 0.5, y: 0.6, s: 1, rot: 0},
//       spin: cue|true (rings roll through letters), code: cue (letters A N C E appear, gold), letters: "ANCE",
//       align: cue (xray: ring notches line up), scan: cue (scan: beam sweeps, monitor fills), coins: cue (chest)}
// SHOTS.lk_shop — a Georgian shop front on Piccadilly with the Bramah challenge padlock in the window, and its rooms.
//   P: {mode: "window"|"workshop"|"sign"|"pick", night: false, years: {from, to, at, dur, x, y} (counter),
//       prize: cue (sign: "200 GUINEAS" lands), days: {to: 16, at, dur}, hours: {to: 51, at, dur}, pick: true}
// SHOTS.lk_cut — cutaway mechanisms (the recurring "inside the lock" motif).
//   P: {mode: "wood"|"yale"|"lever"|"bramah"|"bramah_open",
//       wood: closed: true, close: cue (bolt shuts, pins drop), key: cue (key slides in), lift: cue (pegs lift pins),
//             slide: cue (bolt slides open)
//       yale: key: cue (key slides in, pins ride the bumps), turn: cue (shear line clear, key turns)
//       lever: lift: cue (a pick lifts a lever), jam: cue (lifted too high: the detector catches it)
//       bramah: push: cue (sliders pushed), miss: cue (one slider off: nothing turns), turn: cue (core turns)
//       bramah_open: pick: true, open: cue (shackle springs up)}
// SHOTS.lk_ward — warded locks. P: {mode: "block"|"pick"|"ring"|"plate", wrong: cue (wrong key hits the ward),
//   right: cue (slotted key turns, bolt moves), wire: cue (pick: bent wire slips round the wards), wards: 2, draw: cue (plate)}
// SHOTS.lk_door — an ancient mud-brick storeroom door with a wooden pin lock. P: {mode: "store"|"egypt", key: cue, open: cue}
// SHOTS.lk_hall — inside the Crystal Palace, 1851. P: {mode: "wide"|"table", clock: {to: 25, at, dur, unit: "min"}, open: cue}
// SHOTS.lk_map — full-frame old map from the Atlantic to Mesopotamia.
//   P: {bounds: [-80, 50, 20, 60], places: [{name, x: lon, y: lat, at, color, dx, dy, size, dot}],
//       routes: [{pts: [[lon, lat]...], at, dur: 2, color: "red"|"blue"}], seas: [{name, x, y}]}
// Aliases (mode preset): lk_seabed, lk_table, lk_scan, lk_xray, lk_chest (lk_padlock) · lk_workshop, lk_sign, lk_pick (lk_shop) ·
//   lk_pinlock, lk_yale, lk_lever, lk_bramah (lk_cut) · lk_ring, lk_plate (lk_ward) · lk_demo (lk_hall table; P.room: true = a
//   Westminster room, no glass arches) · lk_inside (lk_shop "inside": reverse angle out through the window at a crowd).
// SHOTS.lk_key — close-up of a modern flat key in a front-door lock, its bumps lined up with the pins it lifts.
//   P: {bumps: cue (pins rise one by one), key: {x: 0.56, y: 0.5}}
'use strict';

(() => {
  const LK_LAND = [[[-9.5, 43.5], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.3], [0, 39], [0.3, 40.5], [3, 41.8], [3.1, 42.8], [4, 43.5], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [11.6, 42.3], [12.4, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40], [16, 39], [15.7, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [16.6, 40], [17, 40.5], [18.5, 40.1], [18.4, 40.3], [17.9, 40.7], [16.2, 41.3], [15.2, 41.9], [14, 42.6], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.3, 45.2], [15.2, 44.3], [16.4, 43.5], [17.6, 43], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [60, 47], [60, 75], [5, 62], [5, 58], [8, 57], [8, 54], [4, 52], [2, 51], [-1, 50], [-5, 48.5], [-4, 47.5], [-1, 46], [-1.5, 43.5]],
        [[29.1, 41.2], [30, 41.1], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.5, 41.5], [41.5, 42.5], [60, 42.5], [60, 36.6], [36.2, 36.6], [35.8, 36.8], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29, 40.4], [29.4, 40.8]],
        [[-9.8, 30], [-6.8, 34], [-6, 35.8], [-5.3, 35.9], [-2, 35.1], [0, 35.9], [3, 36.8], [5, 36.8], [7.8, 36.9], [9.8, 37.3], [10.3, 36.8], [11, 37], [10.4, 36.2], [11.1, 35.2], [10, 34.2], [10.9, 33.1], [12.5, 32.8], [15.2, 32.3], [15.7, 31.4], [18.5, 30.3], [20, 30.9], [20, 32], [21, 32.8], [22.9, 32.6], [25, 31.7], [27.5, 31.2], [29.9, 31.2], [31.2, 31.5], [32.3, 31.2], [34.2, 31.3], [34.6, 32], [35.2, 33], [35.9, 34.5], [35.8, 35.5], [35.9, 36.6], [60, 36.6], [60, -10], [-8, 4.5], [-13, 9], [-16, 12], [-17.5, 14.7], [-17, 21], [-13, 27]],
        [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
        [[8.4, 41], [9.2, 41.2], [9.8, 40.6], [9.6, 39.2], [9, 39], [8.4, 39], [8.4, 40]],
        [[8.6, 42.8], [9.4, 43], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]],
        [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
        [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
        [[2.5, 39.9], [3.4, 39.8], [3.1, 39.3], [2.4, 39.5]],[[-120, 75], [-60, 75], [-55, 52], [-66, 45], [-70, 42], [-76, 38], [-81, 31], [-80, 25], [-82, 24], [-90, 21], [-87, 15], [-83, 10], [-77, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -5], [-35, -30], [-120, -30]],
        [[-5.7, 50], [1.5, 51], [1.7, 52.8], [0, 53.5], [-1.5, 55], [-2, 57], [-4, 58.6], [-6, 57.5], [-5, 55], [-3, 54], [-4.5, 53], [-5, 51.7]],
        [[-10, 51.5], [-6, 52], [-6, 54], [-8, 55.2], [-10, 54]]];
  const SH = window.SHOTS || (window.SHOTS = {});
  const A = (cues, n, fb) => typeof n === 'number' ? n : (n != null && cues && cues[n] != null) ? cues[n] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const R = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const arc = (cx, cy, rx, ry, a0, a1, n = 18) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const ell = (cx, cy, rx, ry, n = 20) => arc(cx, cy, rx, ry, 0, Math.PI * 2 * (1 - 1 / n), n - 1);
  const rot = (p, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a); return p.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  const tx = (g, s, x, y, size, o = {}) => { const e = el(g, 'text', { x, y, 'font-family': o.font || FR, 'font-weight': o.weight ?? 900, 'font-size': size,
    fill: o.fill || INK.ink, 'text-anchor': o.anchor || 'middle', 'dominant-baseline': 'central' }); e.textContent = s; return e; };
  const C = () => ({
    BR: mix(INK.gold, INK.paperDark, 0.2), BRD: mix(INK.gold, INK.ink, 0.38), BRL: mix(INK.gold, INK.paperLight, 0.5),
    WD: mix(INK.stain, INK.paperDark, 0.35), WDD: mix(INK.stain, INK.ink, 0.35), WDL: mix(INK.stain, INK.paperLight, 0.5),
    IR: mix(INK.inkSoft, INK.ink, 0.25), IRL: mix(INK.inkSoft, INK.paperDark, 0.45),
    WT: mix(INK.paperDark, INK.blue, 0.32), WTD: mix(INK.paperDark, INK.blue, 0.55), SAND: mix(INK.paperDark, INK.stain, 0.45),
    XR: mix(INK.ink, INK.blue, 0.3), PIN: mix(INK.gold, INK.stain, 0.25), RUST: mix(INK.green, INK.inkSoft, 0.35),
  });
  const common = (root, P, W, H, sd) => {
    const M = window.MCB, castG = el(root, 'g'), labG = el(root, 'g');
    const cast = M.cast(castG, P.cast || [], W, H, sd + 700), labs = M.labels(labG, P.labels || [], W, H, sd + 800);
    return { update(lt, t, cues) { cast.update(lt, t, cues); labs.update(lt, t, cues); } };
  };
  const tf = (g, x, y, s, r = 0) => g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)}) scale(${Math.max(0.001, s).toFixed(3)})`);
  // counter text: a number that counts up from `from` to `to` between at and at + dur
  const counter = (g, x, y, size, spec, fill) => { const e = tx(g, '', x, y, size, { fill }); return (lt, cues) => {
    const a = A(cues, spec.at, 0), k = progIO(lt, a, spec.dur ?? 2), v = Math.round(lerp(spec.from ?? 0, spec.to, k));
    e.textContent = lt < a - 0.01 && spec.hide ? '' : String(v) + (spec.unit ? ' ' + spec.unit : ''); }; };

  // ================================================================== drawing kit
  // Elizabethan letter padlock: brass barrel with four lettered rings and a U shackle. Local units: body ±290 x ±112.
  function padlock(parent, sd) {
    const K = C(), g = el(parent, 'g'), sh = window.TZ.Shapes(), shk = el(g, 'g'), bodyG = el(g, 'g');
    const U = [[-170, -60], [-170, -110]].concat(arc(0, -110, 170, 150, Math.PI, Math.PI * 2, 14)).concat([[170, -110], [170, -60]]);
    sh.add(shk, U, { stroke: INK.ink, w: 44, closed: false, smooth: true });
    sh.add(shk, U, { stroke: K.BRD, w: 28, closed: false, smooth: true });
    const body = arc(250, 0, 44, 98, -Math.PI / 2, Math.PI / 2, 8).concat(arc(-250, 0, 44, 98, Math.PI / 2, Math.PI * 1.5, 8));
    sh.add(bodyG, body, { fill: K.BR, stroke: INK.ink, w: 8 });
    sh.add(bodyG, [[-240, -66], [240, -66]], { stroke: K.BRL, w: 12, closed: false });
    sh.add(bodyG, ell(-262, 0, 22, 70, 12), { fill: K.BRD, stroke: INK.ink, w: 5 });
    sh.add(bodyG, ell(262, 0, 22, 70, 12), { fill: K.BRD, stroke: INK.ink, w: 5 });
    const st = { spin: 0, glow: 0, ph: 0 };
    const rings = [0, 1, 2, 3].map(i => {
      const cx = -150 + i * 100;
      sh.add(bodyG, R(cx - 44, -114, cx + 44, 114), { fill: K.BRD, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 3; k++) sh.add(bodyG, lt => { const y = ((k * 76 + st.ph * 90 + i * 31) % 228) - 114; return Math.abs(y) > 100 || Math.abs(y) < 62 ? null : [[cx - 40, y], [cx + 40, y]]; }, { stroke: INK.ink, w: 4, closed: false });
      sh.add(bodyG, R(cx - 34, -52, cx + 34, 56), { fill: K.BRL, stroke: INK.ink, w: 5 });
      const glow = inkEl(bodyG, INK.gold);
      const t = tx(bodyG, '?', cx, 6, 84);
      return { cx, t, glow };
    });
    const rust = inkEl(bodyG, K.RUST), rr = rng(sd + 9), RS = Array.from({ length: 34 }, () => [rr() * 560 - 280, rr() * 200 - 100, 6 + rr() * 16]);
    return {
      update(t, lt, x, y, s, o = {}) {
        tf(g, x, y, s, o.rot || 0);
        shk.setAttribute('transform', `translate(0 ${f1(-(o.open || 0) * 80)})`);
        st.ph = o.spin ? lt * (o.spin === true ? 1 : o.spin) : 0;
        sh.update(t, lt);
        const L = (o.letters || '????');
        rings.forEach((r, i) => {
          let ch = L[i] || '?';
          if (o.spin && !(o.glow > 0 && o.fixed && o.fixed[i])) ch = String.fromCharCode(65 + (Math.floor(lt * 5 + i * 7) % 26));
          if (o.fixed && o.fixed[i]) ch = L[i];
          r.t.textContent = ch;
          const gk = o.fixed ? (o.fixed[i] ? o.glow || 0 : 0) : o.glow || 0;
          r.t.setAttribute('fill', gk > 0.5 ? INK.red : INK.ink);
          r.glow.setAttribute('d', gk > 0.05 ? inkPath(ell(r.cx, 2, 54 * (0.6 + 0.4 * gk), 70 * (0.6 + 0.4 * gk), 14), { w: 9, seed: sd + 40 + i, t, closed: true }) : '');
        });
        const cr = o.crust || 0;
        rust.setAttribute('d', cr > 0.02 ? RS.map((q, i) => inkDot(q[0], q[1], q[2] * cr, q[2] * cr * 0.8, sd + 60 + i, t)).join(' ') : '');
      },
    };
  }
  // Bramah challenge padlock: brass body, round keyhole plate with a tiny tube keyhole, iron shackle. Local ±150.
  function bramahLock(parent, sd) {
    const K = C(), g = el(parent, 'g'), sh = window.TZ.Shapes(), shk = el(g, 'g');
    const U = [[-95, -100], [-95, -190]].concat(arc(0, -190, 95, 110, Math.PI, Math.PI * 2, 12)).concat([[95, -190], [95, -100]]);
    sh.add(shk, U, { stroke: INK.ink, w: 40, closed: false, smooth: true });
    sh.add(shk, U, { stroke: K.IRL, w: 24, closed: false, smooth: true });
    const body = arc(0, -40, 150, 70, Math.PI, Math.PI * 2, 10).concat([[150, 120]]).concat(arc(0, 120, 150, 50, 0, Math.PI, 10));
    sh.add(g, body, { fill: K.BR, stroke: INK.ink, w: 8 });
    sh.add(g, [[-120, -60], [120, -60]], { stroke: K.BRL, w: 10, closed: false });
    sh.add(g, ell(0, 40, 72, 72, 18), { fill: K.BRD, stroke: INK.ink, w: 6 });
    sh.add(g, ell(0, 40, 24, 24, 12), { fill: INK.ink });
    sh.add(g, ell(0, 40, 8, 8, 8), { fill: K.BRL });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; sh.add(g, ell(Math.cos(a) * 54, 40 + Math.sin(a) * 54, 6, 6, 8), { fill: INK.ink }); }
    return { node: g, update(t, lt, x, y, s, o = {}) { tf(g, x, y, s, o.rot || 0); shk.setAttribute('transform', `translate(0 ${f1(-(o.open || 0) * 90)})`); sh.update(t, lt); } };
  }
  // water background with light rays, bubbles and fish (for the seabed shots)
  function water(root, W, H, sd, sandY) {
    const K = C(), sh = window.TZ.Shapes();
    sh.add(root, R(-40, -40, W + 40, H + 40), { fill: K.WT, amp: 0.5 });
    for (let i = 0; i < 4; i++) sh.add(root, lt => { const x = W * (0.12 + i * 0.26) + Math.sin(lt * 0.4 + i) * 40; return [[x - 40, -20], [x + 40, -20], [x + 190, sandY], [x + 40, sandY]]; }, { fill: INK.paperLight, fop: 0.22, amp: 0.5 });
    // sand with ripples
    sh.add(root, lt => { const p = []; for (let x = -40; x <= W + 40; x += 60) p.push([x, sandY + Math.sin(x * 0.006) * 16]); return p.concat([[W + 40, H + 40], [-40, H + 40]]); }, { fill: K.SAND, stroke: INK.ink, w: 5 });
    for (let k = 0; k < 6; k++) sh.add(root, lt => { const y = sandY + 50 + k * 34, x0 = (k * 293) % 900; return [[x0, y], [x0 + 120, y - 10], [x0 + 260, y]]; }, { stroke: INK.inkSoft, w: 3, closed: false, smooth: true });
    for (let k = 0; k < 6; k++) sh.add(root, lt => { const y = sandY + 70 + k * 30, x0 = 1000 + (k * 211) % 800; return [[x0, y], [x0 + 140, y - 8], [x0 + 280, y]]; }, { stroke: INK.inkSoft, w: 3, closed: false, smooth: true });
    // seaweed
    [[0.08, 1.0], [0.9, 0.9], [0.95, 0.7]].forEach(([xf, hh], j) => { for (let s = 0; s < 3; s++) sh.add(root, lt => {
      const x = W * xf + s * 26, p = []; for (let k = 0; k <= 6; k++) { const yy = sandY + 20 - k * 60 * hh; p.push([x + Math.sin(lt * 1.2 + k * 0.7 + s + j) * k * 7, yy]); } return p; }, { stroke: mix(INK.green, INK.ink, 0.2), w: 12, closed: false, smooth: true }); });
    const bub = inkEl(root, INK.paperLight), bubR = inkEl(root, INK.inkSoft), br = rng(sd + 3), B = Array.from({ length: 16 }, () => [br(), br(), br()]);
    const fishF = inkEl(root, mix(INK.inkSoft, K.WTD, 0.4)), fishR = inkEl(root, INK.ink);
    return { update(t, lt) {
      sh.update(t, lt);
      const pb = [], pr = [];
      B.forEach((b, i) => { const y = sandY - ((b[1] * sandY + lt * (50 + b[2] * 60)) % sandY), x = W * (0.15 + b[0] * 0.7) + Math.sin(lt * 2 + i) * 12, r = 7 + b[2] * 10;
        pb.push(inkLoop(ell(x, y, r, r, 10), { seed: sd + 20 + i, t })); pr.push(inkPath(ell(x, y, r, r, 10), { w: 3, seed: sd + 40 + i, t, closed: true })); });
      bub.setAttribute('d', pb.join(' ')); bubR.setAttribute('d', pr.join(' '));
      const ff = [], fr = [];
      [[0.3, 0.2, 1, 70], [0.7, 0.32, -1, 55], [0.5, 0.12, 1, 45]].forEach(([x0, y0, d, s], i) => {
        const x = ((x0 * W + d * lt * 70) % (W + 300) + W + 300) % (W + 300) - 150, y = y0 * H + Math.sin(lt * 1.5 + i) * 10;
        const bd = [[x - d * s, y], [x - d * s * 0.2, y - s * 0.45], [x + d * s * 0.8, y - s * 0.1], [x + d * s * 0.8, y + s * 0.1], [x - d * s * 0.2, y + s * 0.45]];
        const tl = Math.sin(lt * 8 + i) * s * 0.2, tail = [[x + d * s * 0.75, y], [x + d * s * 1.3, y - s * 0.4 + tl], [x + d * s * 1.3, y + s * 0.4 + tl]];
        ff.push(inkLoop(bd, { seed: sd + 60 + i, t, smooth: true }), inkLoop(tail, { seed: sd + 70 + i, t }));
        fr.push(inkPath(bd, { w: 4, seed: sd + 80 + i, t, closed: true, smooth: true }), inkPath(tail, { w: 4, seed: sd + 90 + i, t, closed: true }));
      });
      fishF.setAttribute('d', ff.join(' ')); fishR.setAttribute('d', fr.join(' '));
    } };
  }
  // x-ray view of the letter padlock: four rings with notches that line up on the locking bar. Local ±420 x ±300.
  function xray(parent, sd) {
    const K = C(), g = el(parent, 'g'), sh = window.TZ.Shapes(), L = INK.paperLight;
    sh.add(g, R(-440, -310, 440, 310), { fill: K.XR, stroke: INK.ink, w: 8 });
    for (let i = -3; i <= 3; i++) sh.add(g, [[i * 120, -300], [i * 120, 300]], { stroke: mix(K.XR, L, 0.15), w: 2, closed: false });
    for (let i = -2; i <= 2; i++) sh.add(g, [[-430, i * 120], [430, i * 120]], { stroke: mix(K.XR, L, 0.15), w: 2, closed: false });
    const body = arc(270, 40, 40, 100, -Math.PI / 2, Math.PI / 2, 8).concat(arc(-270, 40, 40, 100, Math.PI / 2, Math.PI * 1.5, 8));
    sh.add(g, body, { stroke: L, w: 5 });
    sh.add(g, [[-170, -60], [-170, -110]].concat(arc(0, -110, 170, 150, Math.PI, Math.PI * 2, 12)).concat([[170, -110], [170, -60]]).map(([x, y]) => [x, y + 0]), { stroke: L, w: 5, closed: false, smooth: true });
    const st = { al: 0, lt: 0, bar: 0 };
    // locking bar with teeth through the middle
    sh.add(g, lt => R(-240 + st.bar, 30, 240 + st.bar, 50), { fill: mix(K.XR, L, 0.45), stroke: L, w: 4 });
    const N = [70, -60, 40, -80];
    [0, 1, 2, 3].forEach(i => {
      const cx = -150 + i * 100;
      sh.add(g, R(cx - 40, -64, cx + 40, 144), { stroke: L, w: 5 });
      sh.add(g, lt => { const y = 40 + lerp(N[i] + Math.sin(st.lt * 2.2 + i * 1.7) * 40, 0, st.al); return R(cx - 40, y - 18, cx + 40, y + 18); }, { fill: K.XR, stroke: INK.gold, w: 5 });
      sh.add(g, lt => R(cx - 12 + st.bar, 6, cx + 12 + st.bar, 32), { fill: L });
    });
    const gate = inkEl(g, INK.gold);
    const lets = [0, 1, 2, 3].map(i => tx(g, '', -150 + i * 100, -200, 110, { fill: INK.gold }));
    return { update(t, lt, x, y, s, o = {}) {
      tf(g, x, y, s); st.lt = lt; st.al = o.align || 0; st.bar = (o.slide || 0) * 40; sh.update(t, lt);
      gate.setAttribute('d', st.al > 0.95 ? inkPath([[-250, 40], [250, 40]], { w: 6, seed: sd + 5, t }) : '');
      const C4 = o.letters || 'ANCE';
      lets.forEach((e, i) => { const k = o.code ? o.code[i] || 0 : 0; e.textContent = k > 0.01 ? C4[i] : ''; e.setAttribute('font-size', String(Math.round(110 * (0.6 + 0.4 * Math.min(1.1, k))))); });
    } };
  }

  // ================================================================== lk_padlock
  SH.lk_padlock = { kind: '2d', build(ctx) {
    const { P, W, H, svg, defs, seed } = ctx, sd = seed * 1000 + 31, root = el(svg, 'g'), K = C(), mode = P.mode || 'table';
    const sh = window.TZ.Shapes(), back = el(root, 'g');
    let wat = null, ribs = null, scan = null, xr = null, chest = null, coins = null;
    const LK = Object.assign({ x: 0.5, y: 0.6, s: 1, rot: 0 }, P.lock || {});
    if (mode === 'seabed' || mode === 'wreck') {
      wat = water(back, W, H, sd, H * (mode === 'wreck' ? 0.74 : 0.7));
      if (mode === 'wreck') { ribs = el(back, 'g');
        for (let i = 0; i < 8; i++) { const x = W * (0.16 + i * 0.085), h = H * (0.36 - Math.abs(i - 3.5) * 0.03), lean = (i - 3.5) * 10;
          sh.add(ribs, [[x - 16, H * 0.76], [x - 6 + lean * 0.5, H * 0.76 - h * 0.6], [x + lean, H * 0.76 - h], [x + 22 + lean, H * 0.76 - h + 8], [x + 14 + lean * 0.5, H * 0.76 - h * 0.55], [x + 16, H * 0.76]], { fill: K.WDD, stroke: INK.ink, w: 5, smooth: true }); }
        sh.add(ribs, [[W * 0.12, H * 0.75], [W * 0.82, H * 0.72], [W * 0.84, H * 0.76], [W * 0.12, H * 0.79]], { fill: K.WDD, stroke: INK.ink, w: 5 });
      }
    } else if (mode === 'xray') {
      xr = xray(back, sd);
    } else {
      // museum / lab table (chest + hold: a ship's hold instead)
      if (mode === 'chest' && P.hold) {
        sh.add(back, R(-40, -40, W + 40, H + 40), { fill: mix(K.WDD, INK.ink, 0.35) });
        for (let i = 0; i < 9; i++) { const x = W * (i / 8); sh.add(back, [[x - 30, -20], [x - 60 + (i - 4) * 14, H * 0.5], [x - 20 + (i - 4) * 30, H + 20], [x + 20 + (i - 4) * 30, H + 20], [x - 20 + (i - 4) * 14, H * 0.5], [x + 10, -20]], { fill: K.WD, stroke: INK.ink, w: 5, smooth: true }); }
        for (let k = 0; k < 3; k++) sh.add(back, [[-40, H * (0.15 + k * 0.12)], [W + 40, H * (0.13 + k * 0.12)]], { stroke: INK.ink, w: 5, closed: false });
        for (const bx of [0.12, 0.84]) { sh.add(back, [[W * bx - 110, H * 0.86], [W * bx - 125, H * 0.66], [W * bx - 110, H * 0.46], [W * bx + 110, H * 0.46], [W * bx + 125, H * 0.66], [W * bx + 110, H * 0.86]], { fill: K.WD, stroke: INK.ink, w: 6, smooth: true }); for (const y of [0.52, 0.8]) sh.add(back, [[W * bx - 118, H * y], [W * bx + 118, H * y]], { stroke: K.IR, w: 8, closed: false }); }
      }
      if (!(mode === 'chest' && P.hold)) sh.add(back, R(-40, H * 0.74, W + 40, H + 40), { fill: K.WD, stroke: INK.ink, w: 6 });
      sh.add(back, R(-40, H * 0.74, W + 40, H * 0.77), { fill: K.WDD, stroke: INK.ink, w: 4 });
      for (let k = 0; k < 4; k++) sh.add(back, [[-40, H * (0.82 + k * 0.05)], [W + 40, H * (0.82 + k * 0.05) + 6]], { stroke: K.WDD, w: 3, closed: false });
      if (mode === 'table') sh.add(back, [[W * 0.18, H * 0.745], [W * 0.7, H * 0.735], [W * 0.74, H * 0.8], [W * 0.14, H * 0.81]], { fill: mix(INK.blue, INK.paperDark, 0.45), stroke: INK.ink, w: 5 });
      if (mode === 'scan') {
        scan = { g: el(back, 'g') };
        sh.add(scan.g, R(W * 0.06, H * 0.14, W * 0.5, H * 0.74), { fill: mix(INK.paperLight, INK.paperDark, 0.4), stroke: INK.ink, w: 7 });
        sh.add(scan.g, ell(W * 0.28, H * 0.44, 230, 230, 28), { fill: mix(INK.ink, INK.inkSoft, 0.4), stroke: INK.ink, w: 8 });
        sh.add(scan.g, ell(W * 0.28, H * 0.44, 190, 190, 26), { fill: mix(INK.inkSoft, INK.paperDark, 0.3), stroke: INK.ink, w: 4 });
        sh.add(scan.g, R(W * 0.08, H * 0.16, W * 0.2, H * 0.22), { fill: INK.blue, stroke: INK.ink, w: 4 });
        for (let k = 0; k < 3; k++) sh.add(scan.g, ell(W * (0.4 + k * 0.03), H * 0.19, 12, 12, 8), { fill: k === 0 ? INK.green : INK.inkSoft, stroke: INK.ink, w: 3 });
        // monitor
        sh.add(scan.g, R(W * 0.56, H * 0.12, W * 0.94, H * 0.6), { fill: INK.ink, stroke: INK.ink, w: 8 });
        sh.add(scan.g, R(W * 0.73, H * 0.6, W * 0.77, H * 0.74), { fill: INK.inkSoft, stroke: INK.ink, w: 5 });
        const cid = 'lkclip' + seed; const clip = el(defs, 'clipPath', { id: cid }); scan.clip = el(clip, 'rect', { x: W * 0.57, y: H * 0.13, width: 0, height: H * 0.46 });
        scan.mon = el(scan.g, 'g', { 'clip-path': `url(#${cid})` });
        xr = xray(scan.mon, sd + 300);
        scan.beam = inkEl(scan.g, INK.gold); scan.beam2 = inkEl(scan.g, INK.paperLight);
      }
      if (mode === 'chest') {
        chest = el(back, 'g');
        const cx = W * 0.42, cy = H * 0.5;
        sh.add(chest, R(cx - 330, cy - 120, cx + 330, cy + 230), { fill: K.WD, stroke: INK.ink, w: 8 });
        sh.add(chest, [[cx - 340, cy - 120], [cx - 320, cy - 230], [cx + 320, cy - 230], [cx + 340, cy - 120]], { fill: K.WDD, stroke: INK.ink, w: 8 });
        for (const dx of [-250, 250]) sh.add(chest, R(cx + dx - 26, cy - 228, cx + dx + 26, cy + 230), { fill: K.IR, stroke: INK.ink, w: 5 });
        for (let k = 0; k < 3; k++) sh.add(chest, [[cx - 320, cy - 40 + k * 90], [cx + 320, cy - 40 + k * 90]], { stroke: K.WDD, w: 4, closed: false });
        sh.add(chest, R(cx - 40, cy - 150, cx + 40, cy - 50), { fill: K.IR, stroke: INK.ink, w: 5 });
        const cr = rng(sd + 77); coins = Array.from({ length: 18 }, (_, i) => ({ x: W * (0.12 + cr() * 0.8), y: H * (0.7 + cr() * 0.08), r: 34 + cr() * 10, f: inkEl(back, mix(INK.paperLight, INK.inkSoft, 0.15)), l: inkEl(back, INK.ink), i }));
        coins = coins.filter(c => Math.abs(c.x - cx) > 360);
      }
    }
    const lock = padlock(el(root, 'g'), sd + 5);
    const front = el(root, 'g'); const sand2 = (mode === 'seabed') ? inkEl(front, K.SAND) : null, sand2L = sand2 ? inkEl(front, INK.ink) : null;
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      if (wat) wat.update(t, lt);
      sh.update(t, lt);
      const spin = P.spin === true ? true : P.spin != null ? (lt >= A(cues, P.spin, 0) ? 1 : 0) : 0;
      const code = P.code != null ? A(cues, P.code, null) : null;
      const fixed = code != null ? [0, 1, 2, 3].map(i => lt >= code + i * 0.35) : null;
      const glow = code != null ? prog(lt, code, 0.5) : 0;
      const o = { letters0: 1, rot: LK.rot + Math.sin(lt * 0.9) * (mode === 'seabed' || mode === 'wreck' ? 1.2 : 0.6), spin: spin ? 1 : 0, letters: code != null ? (P.letters || 'ANCE') : '????', fixed, glow, crust: mode === 'seabed' || mode === 'wreck' ? 1 : mode === 'table' || mode === 'chest' ? 0.35 : 0.2 };
      if (mode === 'scan') {
        const a = A(cues, P.scan, 0.5), k = prog(lt, a, Math.max(1, dur - a - 0.6));
        lock.update(t, lt, W * 0.28, H * 0.47, 0.5, Object.assign(o, { rot: 0 }));
        const bx = W * 0.28 + Math.sin(lt * 2.4) * 170;
        scan.beam.setAttribute('d', lt >= a ? inkPath([[bx, H * 0.44 - 200], [bx, H * 0.44 + 200]], { w: 10, seed: sd + 3, t }) : '');
        scan.beam2.setAttribute('d', lt >= a ? inkPath([[bx, H * 0.44 - 180], [bx, H * 0.44 + 180]], { w: 4, seed: sd + 4, t }) : '');
        scan.clip.setAttribute('width', f1(W * 0.36 * k));
        xr.update(t, lt, W * 0.75, H * 0.37, 0.48, { align: 0 });
      } else if (mode === 'xray') {
        const al = P.align != null ? progIO(lt, A(cues, P.align, 0.5), 1.4) : 0;
        xr.update(t, lt, W * 0.5, H * 0.46, 1.18, { align: al, slide: al >= 1 ? prog(lt, A(cues, P.align, 0.5) + 1.5, 0.6) : 0,
          code: code != null ? [0, 1, 2, 3].map(i => spring(lt, code + i * 0.35, 0.5)) : null, letters: P.letters });
      } else if (mode === 'chest') {
        lock.update(t, lt, W * 0.42, H * 0.5 + 40, 0.42, Object.assign(o, { rot: Math.sin(lt * 1.6) * 4 }));
        const ca = A(cues, P.coins, 0);
        coins.forEach(c => { const k = spring(lt, ca + c.i * 0.12, 0.5), r = c.r * Math.max(0.01, k);
          c.f.setAttribute('d', k > 0.01 ? inkLoop(ell(c.x, c.y, r, r * 0.55, 14), { seed: sd + 200 + c.i, t }) : '');
          c.l.setAttribute('d', k > 0.01 ? inkPath(ell(c.x, c.y, r, r * 0.55, 14), { w: 4, seed: sd + 220 + c.i, t, closed: true }) + ' ' + inkPath([[c.x - r * 0.4, c.y], [c.x + r * 0.4, c.y]], { w: 4, seed: sd + 240 + c.i, t }) + ' ' + inkPath([[c.x, c.y - r * 0.3], [c.x, c.y + r * 0.3]], { w: 4, seed: sd + 260 + c.i, t }) : ''); });
      } else {
        const bob = mode === 'seabed' ? Math.sin(lt * 0.8) * 3 : 0;
        lock.update(t, lt, LK.x * W, LK.y * H + bob, LK.s, o);
      }
      if (sand2) { const p = []; for (let x = LK.x * W - 420; x <= LK.x * W + 420; x += 60) p.push([x, LK.y * H + 70 * LK.s + Math.sin(x * 0.02 + 1) * 10 - Math.max(0, 1 - Math.abs(x - LK.x * W) / 420) * 30]);
        sand2.setAttribute('d', inkLoop(p.concat([[LK.x * W + 420, LK.y * H + 200 * LK.s], [LK.x * W - 420, LK.y * H + 200 * LK.s]]), { seed: sd + 90, t, smooth: true }));
        sand2L.setAttribute('d', inkPath(p, { w: 5, seed: sd + 91, t, smooth: true })); }
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_shop
  SH.lk_shop = { kind: '2d', build(ctx) {
    const { P, W, H, svg, defs, seed } = ctx, sd = seed * 1000 + 57, root = el(svg, 'g'), K = C(), mode = P.mode || 'window';
    const sh = window.TZ.Shapes(), G = H * 0.86, night = !!P.night;
    const parts = {};
    if (mode === 'window') {
      const fac = night ? mix(INK.inkSoft, INK.paperDark, 0.35) : mix(INK.paperLight, INK.paperDark, 0.55);
      sh.add(root, R(W * 0.06, H * 0.08, W * 0.94, G), { fill: fac, stroke: INK.ink, w: 7 });
      sh.add(root, R(W * 0.04, H * 0.06, W * 0.96, H * 0.13), { fill: INK.paperDark, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 14; k++) sh.add(root, R(W * (0.06 + k * 0.063), H * 0.13, W * (0.06 + k * 0.063) + 30, H * 0.155), { fill: INK.paperDark, stroke: INK.ink, w: 3 });
      sh.add(root, R(W * 0.24, H * 0.17, W * 0.68, H * 0.27), { fill: INK.ink, stroke: INK.ink, w: 6 });
      tx(root, 'BRAMAH', W * 0.46, H * 0.22, 72, { fill: INK.gold });
      // bow window
      const wx0 = W * 0.22, wx1 = W * 0.7, wy0 = H * 0.31, wy1 = H * 0.76;
      sh.add(root, R(wx0 - 24, wy0 - 24, wx1 + 24, wy1 + 30), { fill: INK.paperDark, stroke: INK.ink, w: 7 });
      sh.add(root, R(wx0, wy0, wx1, wy1), { fill: night ? mix(INK.gold, INK.paperLight, 0.45) : mix(INK.paperLight, INK.blue, 0.14), stroke: INK.ink, w: 5 });
      // display: red cloth stand, the lock, the sign
      sh.add(root, R(W * 0.3, H * 0.63, W * 0.52, wy1), { fill: INK.red, stroke: INK.ink, w: 5 });
      parts.lock = bramahLock(el(root, 'g'), sd + 5);
      sh.add(root, R(W * 0.54, H * 0.47, W * 0.67, H * 0.7), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      tx(root, '200', W * 0.605, H * 0.54, 84, { fill: INK.red });
      tx(root, 'GUINEAS', W * 0.605, H * 0.63, 44);
      const cid = 'lkwin' + seed, clip = el(defs, 'clipPath', { id: cid }); el(clip, 'rect', { x: wx0, y: wy0, width: wx1 - wx0, height: wy1 - wy0 });
      parts.glint = el(root, 'g', { 'clip-path': `url(#${cid})` }); parts.gl = inkEl(parts.glint, INK.paperLight);
      for (let c = 1; c < 5; c++) sh.add(root, [[lerp(wx0, wx1, c / 5), wy0], [lerp(wx0, wx1, c / 5), wy1]], { stroke: INK.ink, w: 7, closed: false });
      for (let r = 1; r < 3; r++) sh.add(root, [[wx0, lerp(wy0, wy1, r / 3)], [wx1, lerp(wy0, wy1, r / 3)]], { stroke: INK.ink, w: 7, closed: false });
      // door with fanlight
      sh.add(root, R(W * 0.75, H * 0.36, W * 0.88, G), { fill: mix(INK.green, INK.ink, 0.35), stroke: INK.ink, w: 7 });
      sh.add(root, arc(W * 0.815, H * 0.36, W * 0.065, H * 0.08, Math.PI, Math.PI * 2, 12), { fill: night ? mix(INK.gold, INK.paperLight, 0.4) : INK.paperLight, stroke: INK.ink, w: 6 });
      for (const yy of [0.42, 0.62]) sh.add(root, R(W * 0.765, H * yy, W * 0.865, H * (yy + 0.15)), { stroke: INK.ink, w: 4 });
      sh.add(root, ell(W * 0.86, H * 0.62, 12, 12, 8), { fill: INK.gold, stroke: INK.ink, w: 3 });
      // lamp post
      sh.add(root, R(W * 0.025, H * 0.26, W * 0.035, G), { fill: INK.ink });
      sh.add(root, [[W * 0.01, H * 0.17], [W * 0.05, H * 0.17], [W * 0.045, H * 0.27], [W * 0.015, H * 0.27]], { fill: night ? INK.gold : INK.paperLight, stroke: INK.ink, w: 5 });
      parts.flame = inkEl(root, night ? INK.paperLight : INK.gold);
      // kerb + cobbles
      sh.add(root, R(-40, G, W + 40, G + 26), { fill: INK.paperDark, stroke: INK.ink, w: 5 });
      for (let k = 0; k < 18; k++) sh.add(root, ell(W * (k / 17), G + 70 + (k % 2) * 40, 46, 16, 10), { fill: mix(INK.paperDark, INK.inkSoft, 0.25), stroke: INK.ink, w: 3 });
      if (P.years) parts.yr = counter(root, P.years.x != null ? P.years.x * W : W * 0.8, P.years.y != null ? P.years.y * H : H * 0.22, 120, P.years, INK.red);
    } else if (mode === 'inside') {
      // reverse angle: inside the dark shop, looking out through the bow window at a crowd pressed to the glass
      sh.add(root, R(-40, -40, W + 40, H + 40), { fill: mix(INK.ink, INK.inkSoft, 0.45) });
      const wx0 = W * 0.1, wx1 = W * 0.9, wy0 = H * 0.08, wy1 = H * 0.7;
      sh.add(root, R(wx0, wy0, wx1, wy1), { fill: mix(INK.paperLight, INK.blue, 0.12), stroke: INK.ink, w: 8 });
      for (let k = 0; k < 6; k++) sh.add(root, R(wx0 + 20 + k * 260, H * 0.2, wx0 + 200 + k * 260, H * 0.42), { fill: mix(INK.paperDark, INK.inkSoft, 0.2), stroke: INK.inkSoft, w: 4 });
      parts.crowd = Array.from({ length: 7 }, (_, i) => ({ i, f: inkEl(root, INK.paperLight), b: inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.15 + (i % 3) * 0.15)), h: inkEl(root, INK.ink), l: inkEl(root, INK.ink) }));
      parts.lock = bramahLock(el(root, 'g'), sd + 5);
      sh.add(root, R(W * 0.38, H * 0.6, W * 0.62, wy1), { fill: INK.red, stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.66, H * 0.42, W * 0.8, H * 0.66), { fill: INK.paperDark, stroke: INK.ink, w: 6 });
      for (let c = 1; c < 6; c++) sh.add(root, [[lerp(wx0, wx1, c / 6), wy0], [lerp(wx0, wx1, c / 6), wy1]], { stroke: INK.ink, w: 9, closed: false });
      for (let r = 1; r < 3; r++) sh.add(root, [[wx0, lerp(wy0, wy1, r / 3)], [wx1, lerp(wy0, wy1, r / 3)]], { stroke: INK.ink, w: 9, closed: false });
      sh.add(root, R(-40, wy1, W + 40, H + 40), { fill: K.WD, stroke: INK.ink, w: 7 });
      for (let k = 0; k < 3; k++) sh.add(root, [[-40, wy1 + 60 + k * 70], [W + 40, wy1 + 64 + k * 70]], { stroke: K.WDD, w: 4, closed: false });
    } else if (mode === 'workshop') {
      // shelves with locks on the wall
      for (let r = 0; r < 2; r++) { sh.add(root, R(W * 0.05, H * (0.2 + r * 0.17), W * 0.62, H * (0.215 + r * 0.17)), { fill: K.WDD, stroke: INK.ink, w: 4 });
        for (let k = 0; k < 6; k++) { const x = W * (0.09 + k * 0.09), y = H * (0.2 + r * 0.17);
          sh.add(root, R(x - 34, y - 70, x + 34, y), { fill: K.BR, stroke: INK.ink, w: 4 });
          sh.add(root, arc(x, y - 70, 24, 36, Math.PI, Math.PI * 2, 8), { stroke: INK.ink, w: 7, closed: false }); } }
      // lathe wheel + belt
      parts.wheel = el(root, 'g');
      sh.add(parts.wheel, ell(0, 0, 150, 150, 26), { stroke: INK.ink, w: 12 });
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI; sh.add(parts.wheel, [[Math.cos(a) * 150, Math.sin(a) * 150], [-Math.cos(a) * 150, -Math.sin(a) * 150]], { stroke: INK.ink, w: 7, closed: false }); }
      sh.add(parts.wheel, ell(0, 0, 26, 26, 10), { fill: K.IR, stroke: INK.ink, w: 4 });
      sh.add(root, [[W * 0.82 - 150, H * 0.36], [W * 0.62, H * 0.6]], { stroke: INK.inkSoft, w: 6, closed: false });
      sh.add(root, [[W * 0.82 + 150, H * 0.36], [W * 0.66, H * 0.6]], { stroke: INK.inkSoft, w: 6, closed: false });
      // bench
      sh.add(root, R(W * 0.1, H * 0.6, W * 0.95, H * 0.66), { fill: K.WD, stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.12, H * 0.66, W * 0.93, G), { fill: K.WDD, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 3; k++) sh.add(root, R(W * (0.18 + k * 0.26), H * 0.7, W * (0.36 + k * 0.26), H * 0.8), { stroke: INK.ink, w: 4 });
      // the tiny tube key, drawn big on the bench
      parts.key = el(root, 'g');
      sh.add(parts.key, ell(-150, 0, 70, 70, 16), { fill: K.BR, stroke: INK.ink, w: 7 });
      sh.add(parts.key, ell(-150, 0, 34, 34, 12), { fill: K.WD, stroke: INK.ink, w: 5 });
      sh.add(parts.key, R(-90, -24, 150, 24), { fill: K.BR, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 4; k++) sh.add(parts.key, R(150 - 10 - k * 0, -24 + k * 13, 166, -16 + k * 13), { fill: INK.ink });
      sh.add(parts.key, ell(160, 0, 12, 24, 10), { fill: INK.ink });
      parts.lock = bramahLock(el(root, 'g'), sd + 5);
      parts.spark = inkEl(root, INK.gold);
    } else if (mode === 'sign') {
      sh.add(root, R(W * 0.14, H * 0.06, W * 0.86, H * 0.86), { fill: K.WDD, stroke: INK.ink, w: 9 });
      sh.add(root, R(W * 0.18, H * 0.11, W * 0.82, H * 0.81), { fill: INK.paperLight, stroke: INK.ink, w: 6 });
      parts.rows = Array.from({ length: 5 }, (_, i) => inkEl(root, INK.ink));
      parts.prize = el(root, 'g'); tx(parts.prize, '200 GUINEAS', 0, 0, 128, { fill: INK.red });
      parts.lock = bramahLock(el(root, 'g'), sd + 5);
    } else if (mode === 'pick') {
      sh.add(root, R(W * 0.34, H * 0.62, W * 0.95, H * 0.67), { fill: K.WD, stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.36, H * 0.67, W * 0.93, G), { fill: K.WDD, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 5; k++) { const x = W * (0.66 + k * 0.045); sh.add(root, [[x, H * 0.635], [x + 90, H * 0.6], [x + 100, H * 0.585]], { stroke: K.IR, w: 7, closed: false }); }
      // calendar + clock on the wall
      sh.add(root, R(W * 0.74, H * 0.08, W * 0.9, H * 0.38), { fill: INK.paperLight, stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.74, H * 0.08, W * 0.9, H * 0.14), { fill: INK.red, stroke: INK.ink, w: 5 });
      tx(root, 'DAY', W * 0.82, H * 0.11, 44, { fill: INK.paperLight });
      parts.day = counter(root, W * 0.82, H * 0.27, 140, Object.assign({ from: 1, to: 16, at: 0.3, dur: 4 }, P.days || {}), INK.ink);
      sh.add(root, ell(W * 0.56, H * 0.2, 100, 100, 22), { fill: INK.paperLight, stroke: INK.ink, w: 7 });
      for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; sh.add(root, [[W * 0.56 + Math.cos(a) * 80, H * 0.2 + Math.sin(a) * 80], [W * 0.56 + Math.cos(a) * 92, H * 0.2 + Math.sin(a) * 92]], { stroke: INK.ink, w: 4, closed: false }); }
      parts.hands = inkEl(root, INK.ink);
      parts.lock = bramahLock(el(root, 'g'), sd + 5);
      parts.vice = inkEl(root, K.IR); parts.viceL = inkEl(root, INK.ink);
      parts.pick = inkEl(root, INK.ink);
      parts.lamp = { b: inkEl(root, K.BR), f: inkEl(root, INK.gold), l: inkEl(root, INK.ink) };
    }
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      sh.update(t, lt);
      if (mode === 'inside') {
        parts.crowd.forEach(c => { const x = W * (0.16 + c.i * 0.115) + Math.sin(lt * 0.9 + c.i) * 14, y = H * (0.5 + (c.i % 2) * 0.05) + Math.sin(lt * 1.7 + c.i * 2) * 6, r = 62;
          c.b.setAttribute('d', inkLoop([[x - 110, H * 0.72], [x - 90, y + 70], [x + 90, y + 70], [x + 110, H * 0.72]], { seed: sd + 300 + c.i, t, smooth: true }));
          c.f.setAttribute('d', inkLoop(ell(x, y, r, r, 14), { seed: sd + 320 + c.i, t }));
          const hat = c.i % 2 ? R(x - 50, y - 150, x + 50, y - 50).concat([]) : [[x - 80, y - 40], [x - 60, y - 70], [x + 60, y - 70], [x + 80, y - 40]];
          c.h.setAttribute('d', inkLoop(hat, { seed: sd + 340 + c.i, t }));
          c.l.setAttribute('d', inkPath(ell(x, y, r, r, 14), { w: 5, seed: sd + 360 + c.i, t, closed: true }) + ' ' + inkDot(x - 20, y, 7, 9, sd + 380 + c.i, t) + ' ' + inkDot(x + 20, y, 7, 9, sd + 390 + c.i, t) + ' ' + inkLoop(ell(x, y + 30, 12, 16, 10), { seed: sd + 395 + c.i, t })); });
        parts.lock.update(t, lt, W * 0.5, H * 0.5, 0.75, { rot: Math.sin(lt * 0.8) * 1.5 });
      }
      if (mode === 'window') {
        parts.lock.update(t, lt, W * 0.41, H * 0.53, 0.55, { rot: Math.sin(lt * 0.8) * 1.5 });
        const gx = W * 0.22 + ((lt * 260) % (W * 0.8)) - W * 0.1;
        parts.gl.setAttribute('d', inkPath([[gx, H * 0.78], [gx + 220, H * 0.28]], { w: 18, seed: sd + 3, t }) + ' ' + inkPath([[gx + 70, H * 0.78], [gx + 290, H * 0.28]], { w: 7, seed: sd + 4, t }));
        const fl = Math.sin(lt * 9) * 6;
        parts.flame.setAttribute('d', inkLoop([[W * 0.03 - 14, H * 0.25], [W * 0.03 + fl * 0.4, H * 0.19 - Math.abs(fl)], [W * 0.03 + 14, H * 0.25]], { seed: sd + 5, t, smooth: true }));
        if (parts.yr) parts.yr(lt, cues);
      } else if (mode === 'workshop') {
        tf(parts.wheel, W * 0.82, H * 0.36, 1, lt * 90);
        tf(parts.key, W * 0.62, H * 0.57, 0.9 + 0.04 * punch(lt, A(cues, P.hit, null)), Math.sin(lt * 1.2) * 2);
        parts.lock.update(t, lt, W * 0.37, H * 0.51, 0.55, {});
        const sp = []; for (let i = 0; i < 6; i++) { const ph = (lt * 3 + i / 6) % 1, x = W * 0.4 + 30 + ph * (60 + i * 20), y = H * 0.56 - ph * (90 - i * 8) + ph * ph * 120; sp.push(inkPath([[x, y], [x + 18, y - 8]], { w: 5, seed: sd + 40 + i, t })); }
        parts.spark.setAttribute('d', P.sparks === false ? '' : sp.join(' '));
      } else if (mode === 'sign') {
        parts.rows.forEach((e, i) => { const k = prog(lt, 0.2 + i * 0.45, 0.9), y = H * (0.2 + i * 0.075), x0 = W * 0.24, x1 = W * (i === 4 ? 0.6 : 0.76), p = [];
          for (let x = x0; x <= lerp(x0, x1, k); x += 22) p.push([x, y + Math.sin(x * 0.09 + i) * 9 - (Math.floor(x / 22) % 4 === 0 ? 14 : 0)]);
          e.setAttribute('d', p.length > 1 ? inkPath(p, { w: 4, seed: sd + 60 + i, t }) : ''); });
        const a = A(cues, P.prize, dur * 0.6), k = spring(lt, a, 0.6);
        parts.prize.style.display = lt >= a ? '' : 'none';
        tf(parts.prize, W * 0.45, H * 0.65, Math.max(0.01, lerp(1.6, 1, clamp01(k)) * (1 + 0.08 * punch(lt, a))), -3);
        parts.lock.update(t, lt, W * 0.75, H * 0.62, 0.32, { rot: 8 });
      } else if (mode === 'pick') {
        const lx = W * 0.6, ly = H * 0.44;
        parts.lock.update(t, lt, lx, ly, 0.85, { open: P.open != null ? spring(lt, A(cues, P.open, 99), 0.5) : 0 });
        parts.vice.setAttribute('d', inkLoop(R(lx - 190, ly + 130, lx + 190, ly + 190), { seed: sd + 70, t }));
        parts.viceL.setAttribute('d', inkPath(R(lx - 190, ly + 130, lx + 190, ly + 190), { w: 5, seed: sd + 71, t, closed: true }));
        const wig = Math.sin(lt * 7) * 4, kx = lx, ky = ly + 34 * 0.85;
        parts.pick.setAttribute('d', P.pick === false ? '' : inkPath(rot([[kx, ky], [kx + 160, ky - 30], [kx + 280, ky - 30]], kx, ky, wig * Math.PI / 180), { w: 7, seed: sd + 72, t }) + ' ' +
          inkPath(rot([[kx + 6, ky + 10], [kx + 170, ky + 60], [kx + 290, ky + 70]], kx, ky, -wig * Math.PI / 180), { w: 7, seed: sd + 73, t }));
        parts.day(lt, cues);
        const hr = lt * 2.2; const cx = W * 0.56, cy = H * 0.2;
        parts.hands.setAttribute('d', inkPath([[cx, cy], [cx + Math.cos(hr - 1.57) * 70, cy + Math.sin(hr - 1.57) * 70]], { w: 6, seed: sd + 74, t }) + ' ' + inkPath([[cx, cy], [cx + Math.cos(hr / 12 - 1.57) * 46, cy + Math.sin(hr / 12 - 1.57) * 46]], { w: 9, seed: sd + 75, t }));
        const bx = W * 0.4, by = H * 0.62, fl = Math.sin(lt * 9) * 5;
        parts.lamp.b.setAttribute('d', inkLoop(ell(bx, by - 30, 50, 34, 14), { seed: sd + 76, t }));
        parts.lamp.f.setAttribute('d', inkLoop([[bx - 14, by - 64], [bx + fl * 0.5, by - 120 - Math.abs(fl)], [bx + 14, by - 64]], { seed: sd + 77, t, smooth: true }));
        parts.lamp.l.setAttribute('d', inkPath(ell(bx, by - 30, 50, 34, 14), { w: 5, seed: sd + 78, t, closed: true }));
      }
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_cut (inside the lock)
  SH.lk_cut = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 83, root = el(svg, 'g'), K = C(), mode = P.mode || 'wood';
    const sh = window.TZ.Shapes(), S = {}, dyn = el(root, 'g');
    if (mode === 'wood') {
      // door jamb (left), housing block on the door, hollow bolt, three pins, the peg key
      sh.add(root, R(80, 140, 340, 960), { fill: K.WDD, stroke: INK.ink, w: 7 });
      for (let k = 0; k < 3; k++) sh.add(root, [[120 + k * 80, 150], [120 + k * 80, 950]], { stroke: INK.ink, w: 3, closed: false });
      sh.add(root, R(340, 140, 1840, 960), { fill: K.WD, stroke: INK.ink, w: 7 });
      for (let k = 0; k < 5; k++) sh.add(root, [[340, 300 + k * 150], [1840, 300 + k * 150 + 6]], { stroke: K.WDD, w: 3, closed: false });
      sh.add(root, R(560, 200, 1240, 470), { fill: K.WDL, stroke: INK.ink, w: 7 });
      S.ch = [700, 880, 1060]; S.ch.forEach(x => sh.add(root, R(x - 34, 210, x + 34, 470), { fill: mix(K.WDD, INK.ink, 0.3), stroke: INK.ink, w: 4 }));
      S.boltG = el(root, 'g'); S.pinsG = el(root, 'g'); S.keyG = el(root, 'g');
      // bolt in local coords: closed position x = 200..1300 (goes into the jamb), hollow channel for the key
      sh.add(S.boltG, R(200, 470, 1300, 640), { fill: K.WD, stroke: INK.ink, w: 7 });
      sh.add(S.boltG, R(420, 560, 1300, 610), { fill: mix(K.WDD, INK.ink, 0.35), stroke: INK.ink, w: 4 });
      S.ch.forEach(x => sh.add(S.boltG, R(x - 36, 470, x + 36, 560), { fill: mix(K.WDD, INK.ink, 0.45), stroke: INK.ink, w: 4 }));
      S.pins = S.ch.map((x, i) => { const g = el(S.pinsG, 'g'); sh.add(g, R(x - 30, 0, x + 30, 220), { fill: K.PIN, stroke: INK.ink, w: 6 }); sh.add(g, [[x - 18, 30], [x + 18, 30]], { stroke: INK.ink, w: 3, closed: false }); return g; });
      // key: handle at the right, a bar that slides inside the channel, three pegs
      sh.add(S.keyG, R(0, 0, 1000, 40), { fill: K.WDL, stroke: INK.ink, w: 6 });
      S.ch.forEach(x => sh.add(S.keyG, R(x - 440 - 24, -48, x - 440 + 24, 0), { fill: K.WDL, stroke: INK.ink, w: 5 }));
      sh.add(S.keyG, [[1000, -40], [1180, -60], [1200, 100], [1000, 80]], { fill: K.WDL, stroke: INK.ink, w: 7 });
    } else if (mode === 'yale') {
      sh.add(root, R(200, 170, 1720, 860), { fill: K.BR, stroke: INK.ink, w: 8 });
      sh.add(root, R(200, 560, 1720, 820), { fill: K.BRL, stroke: INK.ink, w: 7 });   // the plug
      S.xs = [560, 760, 960, 1160, 1360]; S.cuts = [60, 20, 90, 40, 75];             // bitting: how high each bump lifts its pin
      S.xs.forEach(x => sh.add(root, R(x - 38, 200, x + 38, 720), { fill: mix(K.BRD, INK.ink, 0.25), stroke: INK.ink, w: 4 }));
      sh.add(root, R(200, 700, 1720, 790), { fill: mix(K.BRD, INK.ink, 0.45), stroke: INK.ink, w: 4 });   // keyway
      S.shear = inkEl(root, INK.gold);
      S.springs = inkEl(root, INK.ink); S.drv = S.xs.map(() => ({ f: inkEl(root, INK.inkSoft), l: inkEl(root, INK.ink) })); S.kp = S.xs.map(() => ({ f: inkEl(root, INK.gold), l: inkEl(root, INK.ink) }));
      S.keyF = inkEl(root, mix(INK.paperLight, INK.inkSoft, 0.3)); S.keyL = inkEl(root, INK.ink); S.bowF = inkEl(root, mix(INK.paperLight, INK.inkSoft, 0.3)); S.bowL = inkEl(root, INK.ink);
    } else if (mode === 'lever') {
      sh.add(root, R(260, 150, 1660, 880), { fill: K.IRL, stroke: INK.ink, w: 8 });
      for (const [x, y] of [[320, 210], [1600, 210], [320, 820], [1600, 820]]) sh.add(root, ell(x, y, 18, 18, 8), { fill: INK.ink });
      S.lev = [0, 1, 2, 3].map(i => { const g = el(root, 'g'), y = 330 + i * 30;
        sh.add(g, [[420, y], [1380, y - 10], [1380, y + 90], [420, y + 100]], { fill: mix(K.BR, K.BRL, i * 0.2), stroke: INK.ink, w: 6 });
        sh.add(g, R(980 + i * 6, y + 30, 1060 + i * 6, y + 70), { fill: K.IRL, stroke: INK.ink, w: 4 });
        sh.add(g, ell(460, y + 50, 16, 16, 8), { fill: INK.ink });
        return { g, y }; });
      S.det = el(root, 'g');
      sh.add(S.det, [[1440, 220], [1560, 220], [1560, 280], [1470, 300], [1440, 290]], { fill: INK.red, stroke: INK.ink, w: 6 });
      sh.add(S.det, [[1500, 300], [1480, 340], [1520, 370], [1490, 410]], { stroke: INK.ink, w: 5, closed: false });
      S.bolt = el(root, 'g'); sh.add(S.bolt, R(820, 640, 1700, 740), { fill: K.IR, stroke: INK.ink, w: 7 }); sh.add(S.bolt, R(1000, 560, 1040, 640), { fill: K.IR, stroke: INK.ink, w: 5 });
      S.pick = inkEl(root, INK.ink);
    } else if (mode === 'bramah') {
      S.cx = W * 0.42; S.cy = H * 0.47;
      sh.add(root, ell(S.cx, S.cy, 400, 400, 40), { fill: K.BR, stroke: INK.ink, w: 9 });
      S.core = el(root, 'g');
      sh.add(S.core, ell(0, 0, 300, 300, 36), { fill: K.BRL, stroke: INK.ink, w: 6 });
      S.gate = inkEl(root, INK.gold);
      S.N = 8; S.depth = [40, 90, 60, 20, 110, 70, 30, 80];
      S.sl = Array.from({ length: S.N }, (_, i) => ({ g: el(S.core, 'g'), f: inkEl(S.core, K.IRL), l: inkEl(S.core, INK.ink), n: inkEl(S.core, INK.ink) }));
      sh.add(S.core, ell(0, 0, 70, 70, 18), { fill: INK.ink });
      S.keyF = inkEl(root, K.BRD); S.keyL = inkEl(root, INK.ink);
      // side drawing of the tiny tube key
      S.tube = el(root, 'g');
      sh.add(S.tube, R(-40, -170, 40, 120), { fill: K.BR, stroke: INK.ink, w: 6 });
      sh.add(S.tube, ell(0, 190, 90, 90, 18), { fill: K.BR, stroke: INK.ink, w: 7 });
      sh.add(S.tube, ell(0, 190, 40, 40, 12), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      [0, 1, 2].forEach(k => sh.add(S.tube, R(-40, -170, -24, -170 + 26 + k * 22), { fill: INK.ink }));
      [0, 1].forEach(k => sh.add(S.tube, R(24, -170, 40, -170 + 40 + k * 30), { fill: INK.ink }));
      S.x = inkEl(root, INK.red);
    } else if (mode === 'bramah_open') {
      S.lock = bramahLock(el(root, 'g'), sd + 5);
      S.burst = inkEl(root, INK.gold); S.burstL = inkEl(root, INK.ink);
      S.pick = inkEl(root, INK.ink);
    }
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      if (mode === 'wood') {
        const cl = P.closed ? 1 : P.close != null ? progIO(lt, A(cues, P.close, 0.3), 1.2) : 0;
        const ka = P.key != null ? A(cues, P.key, null) : null, la = P.lift != null ? A(cues, P.lift, null) : null, sa = P.slide != null ? A(cues, P.slide, null) : null;
        const kin = ka != null ? progIO(lt, ka, 1.3) : 0, lift = la != null ? progIO(lt, la, 0.8) : 0, slide = sa != null ? progIO(lt, sa, 1.2) : 0;
        const bx = (1 - cl) * 330 + slide * 330;
        S.boltG.setAttribute('transform', `translate(${f1(bx)} 0)`);
        const drop = cl >= 1 ? prog(lt, (P.closed ? -1 : A(cues, P.close, 0.3) + 1.2), 0.35) : 0;
        S.pins.forEach((g, i) => { const d = drop * 90 - lift * 90 + Math.sin(lt * 3 + i) * (drop < 1 && lift < 0.01 && cl < 1 ? 2 : 0); g.setAttribute('transform', `translate(${f1(slide > 0 ? 0 : 0)} ${f1(250 + d)})`); });
        S.keyG.style.display = ka != null && lt >= ka ? '' : 'none';
        S.keyG.setAttribute('transform', `translate(${f1(440 + (1 - kin) * 1100 + bx)} ${f1(565 - lift * 90)})`);
      } else if (mode === 'yale') {
        const ka = P.key != null ? A(cues, P.key, 0.3) : 0, kin = progIO(lt, ka, 1.8), kx = lerp(1900, 230, kin);
        const ta = P.turn != null ? A(cues, P.turn, null) : null, turn = ta != null ? prog(lt, ta, 0.8) : 0;
        // key blade: profile of bumps relative to the key tip at kx
        const prof = x => { const u = x - kx; if (u < 0) return 0; let h = 10; S.xs.forEach((px, i) => { const c = px - 230, d = Math.abs(u - c); if (d < 70) h = Math.max(h, S.cuts[i] * (1 - d / 70) + 10 * (d / 70)); }); return h; };
        const top = 790, bp = [];
        for (let x = kx; x <= 1900; x += 20) bp.push([x, top - 70 - prof(x)]);
        const blade = [[kx, top]].concat(bp).concat([[1900, top]]);
        S.keyF.setAttribute('d', kin > 0.001 ? inkLoop(blade, { seed: sd + 10, t, amp: 0.6 }) : '');
        S.keyL.setAttribute('d', kin > 0.001 ? inkPath(blade, { w: 5, seed: sd + 11, t, closed: true, amp: 0.6 }) : '');
        const bw = 120 * Math.max(0.1, Math.abs(Math.cos(turn * Math.PI / 2))), bxc = kx + 1720 - 230 + 150;
        S.bowF.setAttribute('d', kin > 0.5 ? inkLoop(ell(Math.min(bxc, 1830), 740, bw, 150, 18), { seed: sd + 12, t }) : '');
        S.bowL.setAttribute('d', kin > 0.5 ? inkPath(ell(Math.min(bxc, 1830), 740, bw, 150, 18), { w: 6, seed: sd + 13, t, closed: true }) : '');
        const sp = [];
        S.xs.forEach((x, i) => {
          const keyTop = kin > 0.001 && x >= kx ? top - 70 - prof(x) : 720, L = 160 + 0;
          const kb = Math.min(720, keyTop), kt = kb - (160 - S.cuts[i]) ;
          const kpTop = kb - (kb === 720 ? 160 - S.cuts[i] : 160 - S.cuts[i]);
          const dTop = kpTop - 150;
          S.kp[i].f.setAttribute('d', inkLoop(R(x - 30, kpTop, x + 30, kb), { seed: sd + 20 + i, t }));
          S.kp[i].l.setAttribute('d', inkPath(R(x - 30, kpTop, x + 30, kb), { w: 5, seed: sd + 30 + i, t, closed: true }));
          S.drv[i].f.setAttribute('d', inkLoop(R(x - 30, dTop, x + 30, kpTop), { seed: sd + 40 + i, t }));
          S.drv[i].l.setAttribute('d', inkPath(R(x - 30, dTop, x + 30, kpTop), { w: 5, seed: sd + 50 + i, t, closed: true }));
          const zz = []; for (let k = 0; k <= 8; k++) zz.push([x + (k % 2 ? 22 : -22), lerp(206, dTop, k / 8)]);
          sp.push(inkPath(zz, { w: 4, seed: sd + 60 + i, t, smooth: false }));
        });
        S.springs.setAttribute('d', sp.join(' '));
        const ok = kin > 0.98;
        S.shear.setAttribute('fill', ok ? INK.green : INK.gold);
        S.shear.setAttribute('d', inkPath([[200, 560], [1720, 560]], { w: ok ? 10 : 5, seed: sd + 70, t }));
      } else if (mode === 'lever') {
        const la = P.lift != null ? A(cues, P.lift, 0.4) : 0, ja = P.jam != null ? A(cues, P.jam, null) : null;
        const lift = progIO(lt, la, 1), over = ja != null ? progIO(lt, ja, 0.5) : 0;
        S.lev.forEach((L, i) => { const a = i === 1 ? -(lift * 3 + over * 6) : i === 2 ? -lift * 2.5 : 0; L.g.setAttribute('transform', `rotate(${f1(a)} 460 ${L.y + 50})`); });
        S.det.setAttribute('transform', `rotate(${f1(over * 18)} 1560 250)`);
        S.bolt.setAttribute('transform', `translate(${f1(over > 0 ? Math.sin(lt * 40) * 4 * (1 - prog(lt, ja + 0.5, 0.6)) : 0)} 0)`);
        const px = 1400 - lift * 60, py = 560 - lift * 30 - over * 30, wig = Math.sin(lt * 6) * 6;
        S.pick.setAttribute('d', inkPath([[1900, py + 40 + wig], [1500, py + 20], [px, py], [px - 20, py - 40]], { w: 8, seed: sd + 80, t }));
      } else if (mode === 'bramah') {
        const pa = P.push != null ? A(cues, P.push, 0.4) : 0, push = progIO(lt, pa, 1.2);
        const ma = P.miss != null ? A(cues, P.miss, null) : null, miss = ma != null ? prog(lt, ma, 0.4) : 0;
        const ta = P.turn != null ? A(cues, P.turn, null) : null, turn = ta != null ? progIO(lt, ta, 1) : 0;
        const wob = miss > 0 && turn === 0 ? Math.sin(lt * 30) * 2 * (1 - prog(lt, ma + 0.4, 0.8)) : 0;
        tf(S.core, S.cx, S.cy, 1, turn * 40 + wob);
        S.gate.setAttribute('d', inkPath(ell(S.cx, S.cy, 200, 200, 30).concat([ell(S.cx, S.cy, 200, 200, 30)[0]]), { w: 6, seed: sd + 5, t }));
        S.sl.forEach((s, i) => {
          const a = i / S.N * Math.PI * 2 - Math.PI / 2, off = i === 3 ? miss * 34 : 0;
          const r0 = 80 + (1 - push) * 0 + push * 0, nr = 200 + (1 - push) * (S.depth[i] - 60) + off;
          const pts = rot(R(-26, -290, 26, -80), 0, 0, a + Math.PI / 2), n = rot(R(-26, -nr - 14, 26, -nr + 14), 0, 0, a + Math.PI / 2);
          const red = i === 3 && miss > 0.5;
          s.f.setAttribute('fill', red ? INK.red : push > 0.98 && miss < 0.5 ? INK.green : K.IRL);
          s.f.setAttribute('d', inkLoop(pts, { seed: sd + 20 + i, t }));
          s.l.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 30 + i, t, closed: true }));
          s.n.setAttribute('d', inkLoop(n, { seed: sd + 40 + i, t }));
        });
        const kk = clamp01(push * 1.5);
        S.keyF.setAttribute('d', kk > 0.01 ? inkLoop(ell(S.cx, S.cy, 100 * kk, 100 * kk, 18), { seed: sd + 50, t }) : '');
        S.keyL.setAttribute('d', kk > 0.01 ? inkPath(ell(S.cx, S.cy, 100 * kk, 100 * kk, 18), { w: 6, seed: sd + 51, t, closed: true }) + ' ' + inkPath(ell(S.cx, S.cy, 72 * kk, 72 * kk, 14), { w: 4, seed: sd + 52, t, closed: true }) : '');
        tf(S.tube, W * 0.82, H * 0.46, 0.95, 20 + Math.sin(lt * 1.1) * 3);
        S.x.setAttribute('d', miss > 0.6 && turn === 0 ? inkPath([[S.cx + 230, S.cy - 330], [S.cx + 330, S.cy - 230]], { w: 14, seed: sd + 60, t }) + ' ' + inkPath([[S.cx + 330, S.cy - 330], [S.cx + 230, S.cy - 230]], { w: 14, seed: sd + 61, t }) : '');
      } else if (mode === 'bramah_open') {
        const oa = P.open != null ? A(cues, P.open, dur * 0.4) : 9e9, op = spring(lt, oa, 0.6);
        S.lock.update(t, lt, W * 0.5, H * 0.58, 1.6, { open: op, rot: Math.sin(lt * 0.8) * 1 + (lt < oa ? Math.sin(lt * 25) * 0.4 : 0) });
        const u = lt - oa, rays = [], rl = [];
        if (u > 0 && u < 1.6) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r1 = 380 + u * 120, r2 = r1 + 90 * (1 - u / 1.6); rays.push(inkPath([[W * 0.5 + Math.cos(a) * r1, H * 0.42 + Math.sin(a) * r1 * 0.8], [W * 0.5 + Math.cos(a) * r2, H * 0.42 + Math.sin(a) * r2 * 0.8]], { w: 14, seed: sd + 70 + i, t })); }
        S.burst.setAttribute('d', rays.join(' '));
        const kx = W * 0.5, ky = H * 0.58 + 40 * 1.6, wig = lt < oa ? Math.sin(lt * 7) * 5 : 0;
        const pp = rot([[kx, ky], [kx + 260, ky + 60], [kx + 520, ky + 70]], kx, ky, wig * Math.PI / 180), red = P.pick === 'red';
        S.pick.setAttribute('fill', red ? INK.red : INK.ink);
        S.burstL.setAttribute('d', red ? inkPath(pp, { w: 34, seed: sd + 91, t }) : '');
        S.pick.setAttribute('d', P.pick === false ? '' : inkPath(pp, { w: red ? 20 : 9, seed: sd + 90, t }));
      }
      sh.update(t, lt);
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_ward
  SH.lk_ward = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 111, root = el(svg, 'g'), K = C(), mode = P.mode || 'block';
    const sh = window.TZ.Shapes(), S = {};
    if (mode === 'block' || mode === 'pick') {
      S.cx = W * 0.44; S.cy = H * 0.46;
      sh.add(root, R(W * 0.12, H * 0.08, W * 0.76, H * 0.86), { fill: K.IRL, stroke: INK.ink, w: 9 });
      for (const [x, y] of [[0.15, 0.12], [0.73, 0.12], [0.15, 0.82], [0.73, 0.82]]) sh.add(root, ell(W * x, H * y, 16, 16, 8), { fill: INK.ink });
      const nw = P.wards ?? 2; S.wr = [130, 200].slice(0, nw);
      S.wr.forEach((r, i) => sh.add(root, arc(S.cx, S.cy, r, r, Math.PI * 0.3, Math.PI * 1.7, 26), { stroke: INK.ink, w: 24, closed: false, smooth: true }));
      S.wr.forEach((r, i) => sh.add(root, arc(S.cx, S.cy, r, r, Math.PI * 0.3, Math.PI * 1.7, 26), { stroke: K.IR, w: 12, closed: false, smooth: true }));
      S.bolt = el(root, 'g'); sh.add(S.bolt, R(W * 0.3, H * 0.74, W * 0.86, H * 0.82), { fill: K.IR, stroke: INK.ink, w: 7 });
      sh.add(S.bolt, R(W * 0.42, H * 0.7, W * 0.45, H * 0.74), { fill: K.IR, stroke: INK.ink, w: 5 });
      sh.add(root, ell(S.cx, S.cy, 30, 30, 10), { fill: INK.ink });
      S.key = { f: inkEl(root, mix(INK.gold, INK.inkSoft, 0.4)), l: inkEl(root, INK.ink) };
      S.wrong = { f: inkEl(root, INK.red), l: inkEl(root, INK.ink) };
      S.wire = inkEl(root, INK.red);
      S.x = inkEl(root, INK.red);
    } else if (mode === 'ring') {
      S.hand = el(root, 'g');
      const skin = INK.paperLight;
      sh.add(S.hand, [[-260, 900], [-250, 260], [-200, 120], [200, 120], [260, 260], [270, 900]], { fill: skin, stroke: INK.ink, w: 8, smooth: true });
      [[-185, 60], [-62, 30], [62, 40], [185, 80]].forEach(([x, top], i) => sh.add(S.hand, [[x - 56, 180], [x - 56, top - 260 + i * 10], [x - 30, top - 330 + i * 10], [x + 30, top - 330 + i * 10], [x + 56, top - 260 + i * 10], [x + 56, 180]], { fill: skin, stroke: INK.ink, w: 8, smooth: true }));
      sh.add(S.hand, [[230, 420], [380, 260], [440, 280], [420, 360], [280, 560]], { fill: skin, stroke: INK.ink, w: 8, smooth: true });
      // the ring key on the second finger: band + a small key plate with ward notches
      sh.add(S.hand, R(-128, -120, 4, -70), { fill: INK.gold, stroke: INK.ink, w: 7 });
      sh.add(S.hand, R(-110, -250, -10, -120), { fill: INK.gold, stroke: INK.ink, w: 7 });
      sh.add(S.hand, R(-88, -230, -66, -170), { fill: INK.ink }); sh.add(S.hand, R(-54, -250, -32, -200), { fill: INK.ink });
      S.spark = inkEl(root, INK.gold);
    } else if (mode === 'plate') {
      for (let k = 0; k < 8; k++) sh.add(root, R(k * W / 8 - 4, -20, (k + 1) * W / 8, H + 20), { fill: k % 2 ? K.WD : mix(K.WD, K.WDD, 0.25), stroke: INK.ink, w: 5 });
      for (let k = 0; k < 8; k++) for (const y of [0.12, 0.88]) sh.add(root, ell(k * W / 8 + W / 16, H * y, 12, 12, 8), { fill: INK.ink });
      S.orn = [];
      sh.add(root, R(W * 0.26, H * 0.16, W * 0.62, H * 0.8), { fill: K.IR, stroke: INK.ink, w: 9 });
      sh.add(root, R(W * 0.29, H * 0.2, W * 0.59, H * 0.76), { stroke: K.IRL, w: 5 });
      for (let k = 0; k < 6; k++) { const cx = W * (k < 3 ? 0.26 : 0.62), cy = H * (0.25 + (k % 3) * 0.25), d = k < 3 ? -1 : 1;
        S.orn.push(sh.add(root, lt => { const p = []; const n = Math.max(2, Math.round(prog(lt, A(ctx.cues || {}, P.draw, 0.2) + k * 0.25, 1) * 20)); for (let i = 0; i < n; i++) { const a = i / 20 * Math.PI * 3, r = 70 - i * 3; p.push([cx + d * (40 + Math.cos(a) * r), cy + Math.sin(a) * r]); } return p; }, { stroke: K.IR, w: 14, closed: false, smooth: true })); }
      for (const [x, y] of [[0.3, 0.22], [0.58, 0.22], [0.3, 0.74], [0.58, 0.74]]) sh.add(root, ell(W * x, H * y, 16, 16, 8), { fill: INK.ink });
      sh.add(root, [[W * 0.44 - 26, H * 0.4], [W * 0.44 + 26, H * 0.4], [W * 0.44 + 14, H * 0.56], [W * 0.44 - 14, H * 0.56]], { fill: INK.ink });
      sh.add(root, ell(W * 0.44, H * 0.4, 36, 36, 12), { fill: INK.ink });
      S.key = el(root, 'g');
      sh.add(S.key, ell(0, -180, 60, 60, 14), { stroke: K.IR, w: 18 });
      sh.add(S.key, R(-12, -120, 12, 160), { fill: K.IR, stroke: INK.ink, w: 4 });
      sh.add(S.key, R(12, 90, 80, 150), { fill: K.IR, stroke: INK.ink, w: 4 });
      sh.add(S.key, R(36, 90, 52, 130), { fill: K.WD });
      // inset: wards multiply
      S.inset = { f: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink), w: Array.from({ length: 4 }, () => inkEl(root, INK.ink)) };
    }
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt; ctx.cues = cues;
      sh.update(t, lt);
      if (mode === 'block' || mode === 'pick') {
        const cx = S.cx, cy = S.cy;
        let boltK = 0;
        if (mode === 'block') {
          const wa = P.wrong != null ? A(cues, P.wrong, null) : null, ra = P.right != null ? A(cues, P.right, null) : null;
          const useRight = ra != null && lt >= ra;
          if (!useRight && wa != null && lt >= wa) {
            const ang = Math.min(prog(lt, wa, 0.5) * 0.55, 0.5) + (lt > wa + 0.5 ? Math.sin(lt * 30) * 0.03 : 0);
            const bit = rot(R(cx - 22, cy, cx + 22, cy + 230), cx, cy, ang);
            S.wrong.f.setAttribute('d', inkLoop(bit, { seed: sd + 1, t })); S.wrong.l.setAttribute('d', inkPath(bit, { w: 6, seed: sd + 2, t, closed: true }));
            S.x.setAttribute('d', lt > wa + 0.6 ? inkPath([[cx + 260, cy - 300], [cx + 360, cy - 200]], { w: 16, seed: sd + 3, t }) + ' ' + inkPath([[cx + 360, cy - 300], [cx + 260, cy - 200]], { w: 16, seed: sd + 4, t }) : '');
          } else { S.wrong.f.setAttribute('d', ''); S.wrong.l.setAttribute('d', ''); S.x.setAttribute('d', ''); }
          if (useRight || (wa == null && ra == null)) {
            const ang = ra != null ? progIO(lt, ra, 1.6) * Math.PI * 0.9 : Math.sin(lt * 0.8) * 0.2;
            const segs = [[cx - 22, cy], [cx + 22, cy]];
            let pts = [[cx - 22, cy], [cx - 22, cy + 230], [cx + 22, cy + 230], [cx + 22, cy]];
            const bit = rot(pts, cx, cy, ang);
            S.key.f.setAttribute('d', inkLoop(bit, { seed: sd + 5, t }));
            const slots = S.wr.map((r, i) => inkLoop(rot(R(cx - 24, cy + r - 16, cx + 24, cy + r + 16), cx, cy, ang), { seed: sd + 8 + i, t })).join(' ');
            S.key.l.setAttribute('d', inkPath(bit, { w: 6, seed: sd + 6, t, closed: true }) + ' ' + slots);
            boltK = ra != null ? prog(lt, ra + 1, 0.6) : 0;
          } else { S.key.f.setAttribute('d', ''); S.key.l.setAttribute('d', ''); }
          S.wire.setAttribute('d', '');
          if (P.push != null) boltK = progIO(lt, A(cues, P.push, 0), 1.6);
        } else {
          const ia = P.wire != null ? A(cues, P.wire, 0.3) : 0.3, k = progIO(lt, ia, 1.2), ang = progIO(lt, ia + 1.2, 1.4) * Math.PI * 0.9;
          const wp = [[cx, cy - 300 + k * 300], [cx, cy], [cx + 4, cy + 60], [cx + 60, cy + 120], [cx + 60, cy + 175], [cx - 10, cy + 240], [cx - 20, cy + 250]];
          S.wire.setAttribute('d', lt >= ia ? inkPath(k < 1 ? wp.slice(0, 2) : rot(wp.slice(1), cx, cy, ang), { w: 9, seed: sd + 7, t }) : '');
          boltK = prog(lt, ia + 2.4, 0.6);
          S.key.f.setAttribute('d', ''); S.key.l.setAttribute('d', ''); S.wrong.f.setAttribute('d', ''); S.wrong.l.setAttribute('d', ''); S.x.setAttribute('d', '');
        }
        S.bolt.setAttribute('transform', `translate(${f1(boltK * 160)} 0)`);
      } else if (mode === 'ring') {
        tf(S.hand, W * 0.46 + Math.sin(lt * 0.9) * 10, H * 0.62, 0.85, Math.sin(lt * 0.7) * 3);
        const sx = W * 0.4, sy = H * 0.33, k = 0.6 + 0.4 * Math.abs(Math.sin(lt * 2.5));
        S.spark.setAttribute('d', inkLoop([[sx, sy - 50 * k], [sx + 12, sy - 12], [sx + 50 * k, sy], [sx + 12, sy + 12], [sx, sy + 50 * k], [sx - 12, sy + 12], [sx - 50 * k, sy], [sx - 12, sy - 12]], { seed: sd + 3, t }));
      } else if (mode === 'plate') {
        tf(S.key, W * 0.44, H * 0.48, 1, Math.sin(lt * 1.6) * 8);
        const ia = A(cues, P.inset, 0.4), cx = W * 0.82, cy = H * 0.36, r = 180 * spring(lt, ia, 0.5);
        S.inset.f.setAttribute('d', r > 1 ? inkLoop(ell(cx, cy, r, r, 24), { seed: sd + 20, t }) : '');
        S.inset.l.setAttribute('d', r > 1 ? inkPath(ell(cx, cy, r, r, 24), { w: 7, seed: sd + 21, t, closed: true }) : '');
        S.inset.w.forEach((e, i) => { const on = lt > ia + 0.5 + i * 0.6, rr = r * (0.25 + i * 0.18);
          e.setAttribute('d', on && r > 1 ? inkPath(arc(cx, cy, rr, rr, Math.PI * 0.35, Math.PI * 1.65, 18), { w: 12, seed: sd + 30 + i, t }) : ''); });
      }
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_door (ancient storeroom)
  SH.lk_door = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 141, root = el(svg, 'g'), K = C(), mode = P.mode || 'store';
    const sh = window.TZ.Shapes(), G = H * 0.86, MUD = mix(INK.paperDark, INK.stain, 0.3), S = {};
    if (mode === 'egypt') {
      [[0.16, 0.2], [0.3, 0.13]].forEach(([x, h]) => sh.add(root, [[W * x - H * h * 1.1, G - H * 0.12], [W * x, G - H * 0.12 - H * h * 1.6], [W * x + H * h * 1.1, G - H * 0.12]], { fill: mix(INK.paperDark, INK.stain, 0.2), stroke: INK.inkSoft, w: 5 }));
    }
    // palm tree
    S.palm = el(root, 'g');
    sh.add(S.palm, [[-14, 0], [-20, -300], [-6, -520], [10, -520], [6, -300], [16, 0]], { fill: K.WDD, stroke: INK.ink, w: 5, smooth: true });
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.5; sh.add(S.palm, lt => { const sw = Math.sin(lt * 1.3 + k) * 0.06; const b = a + sw; return [[0, -520], [Math.cos(b) * 120, -520 + Math.sin(b) * 120 - 30], [Math.cos(b) * 230, -520 + Math.sin(b) * 230 + 40]]; }, { stroke: mix(INK.green, INK.ink, 0.15), w: 18, closed: false, smooth: true }); }
    const wx0 = mode === 'egypt' ? W * 0.42 : W * 0.2, wx1 = W * 0.96, wy0 = mode === 'egypt' ? H * 0.3 : H * 0.18;
    sh.add(root, R(wx0, wy0, wx1, G), { fill: MUD, stroke: INK.ink, w: 7 });
    for (let r = 0; r < 12; r++) { const y = wy0 + 40 + r * 56; if (y > G - 10) break; for (let c = 0; c < 16; c++) { const x = wx0 + 20 + c * 110 + (r % 2) * 55; if (x > wx1 - 60) break; sh.add(root, [[x, y], [x + 80, y]], { stroke: mix(MUD, INK.ink, 0.35), w: 3, closed: false }); } }
    // storeroom cutaway: dark room with jars and a little gold
    const cx0 = wx0 + (wx1 - wx0) * 0.52, cx1 = wx1 - 40, cy0 = wy0 + 70;
    sh.add(root, R(cx0, cy0, cx1, G), { fill: mix(INK.inkSoft, INK.paperDark, 0.25), stroke: INK.ink, w: 6 });
    for (let k = 0; k < 4; k++) { const x = cx0 + 70 + k * (cx1 - cx0 - 140) / 3, y = G, h = 170 + (k % 2) * 50;
      sh.add(root, [[x - 50, y], [x - 70, y - h * 0.5], [x - 40, y - h * 0.9], [x - 22, y - h], [x + 22, y - h], [x + 40, y - h * 0.9], [x + 70, y - h * 0.5], [x + 50, y]], { fill: mix(INK.stain, INK.red, 0.25), stroke: INK.ink, w: 6, smooth: true }); }
    S.gold = inkEl(root, INK.gold); S.goldL = inkEl(root, INK.ink);
    // door + wooden lock on it
    const dx0 = wx0 + (wx1 - wx0) * 0.12, dx1 = wx0 + (wx1 - wx0) * 0.42, dy0 = wy0 + 90;
    sh.add(root, R(dx0 - 20, dy0 - 30, dx1 + 20, G), { fill: mix(MUD, INK.ink, 0.25), stroke: INK.ink, w: 6 });
    sh.add(root, R(dx0, dy0, dx1, G), { fill: K.WD, stroke: INK.ink, w: 7 });
    for (let k = 1; k < 4; k++) sh.add(root, [[lerp(dx0, dx1, k / 4), dy0], [lerp(dx0, dx1, k / 4), G]], { stroke: K.WDD, w: 4, closed: false });
    const ly = dy0 + (G - dy0) * 0.42; S.ly = ly; S.dx1 = dx1;
    sh.add(root, R(dx1 - 170, ly - 120, dx1 - 30, ly - 20), { fill: K.WDL, stroke: INK.ink, w: 6 });
    S.bolt = el(root, 'g'); sh.add(S.bolt, R(dx1 - 230, ly - 20, dx1 + 90, ly + 30), { fill: K.WDD, stroke: INK.ink, w: 6 });
    sh.add(root, R(dx1 + 40, ly - 40, dx1 + 70, ly + 50), { fill: K.WDD, stroke: INK.ink, w: 5 });   // staple on the wall
    S.key = el(root, 'g'); sh.add(S.key, R(0, -12, 260, 12), { fill: K.WDL, stroke: INK.ink, w: 5 }); for (let k = 0; k < 3; k++) sh.add(S.key, R(170 + k * 26, -36, 184 + k * 26, -12), { fill: K.WDL, stroke: INK.ink, w: 3 });
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      tf(S.palm, mode === 'egypt' ? W * 0.06 : W * 0.08, G, 1, Math.sin(lt * 0.9) * 1.5);
      sh.update(t, lt);
      const gk = 0.7 + 0.3 * Math.sin(lt * 3), gx = wx1 - 200, gy = G - 30;
      const pile = [[gx - 90, gy + 30], [gx - 50, gy - 20 * gk], [gx, gy - 40], [gx + 50, gy - 18 * gk], [gx + 90, gy + 30]];
      S.gold.setAttribute('d', inkLoop(pile, { seed: sd + 1, t, smooth: true })); S.goldL.setAttribute('d', inkPath(pile, { w: 5, seed: sd + 2, t, closed: true, smooth: true }));
      const ka = P.key != null ? A(cues, P.key, null) : null, oa = P.open != null ? A(cues, P.open, null) : null;
      const kin = ka != null ? progIO(lt, ka, 1.2) : 0, op = oa != null ? progIO(lt, oa, 1) : 0;
      S.key.style.display = ka != null && lt >= ka ? '' : 'none';
      tf(S.key, S.dx1 - 200 - (1 - kin) * 360 - op * 0, S.ly + 6 - (kin >= 1 ? prog(lt, ka + 1.2, 0.4) * 20 : 0), 1, 0);
      S.bolt.setAttribute('transform', `translate(${f1(-op * 120)} 0)`);
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_hall (Crystal Palace, 1851)
  SH.lk_hall = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 171, root = el(svg, 'g'), K = C(), mode = P.mode || 'wide';
    const sh = window.TZ.Shapes(), G = H * 0.86, cx = W / 2, S = {};
    const vy = H * 0.72, room = !!P.room;
    if (room) {
      for (let i = 0; i < 16; i++) sh.add(root, [[i * W / 15, H * 0.02], [i * W / 15, H * 0.56]], { stroke: mix(INK.blue, INK.paperDark, 0.6), w: 10, closed: false });
      sh.add(root, R(-20, H * 0.56, W + 20, G), { fill: mix(INK.stain, INK.paperDark, 0.35), stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.04, H * 0.08, W * 0.2, H * 0.48), { fill: INK.paperLight, stroke: INK.ink, w: 7 });
      sh.add(root, [[W * 0.12, H * 0.08], [W * 0.12, H * 0.48]], { stroke: INK.ink, w: 6, closed: false }); sh.add(root, [[W * 0.04, H * 0.28], [W * 0.2, H * 0.28]], { stroke: INK.ink, w: 6, closed: false });
      sh.add(root, R(W * 0.03, H * 0.06, W * 0.07, H * 0.5), { fill: INK.red, stroke: INK.ink, w: 4 }); sh.add(root, R(W * 0.17, H * 0.06, W * 0.21, H * 0.5), { fill: INK.red, stroke: INK.ink, w: 4 });
    }
    if (!room) [1100, 900, 740, 610, 500].forEach((r, i) => {
      sh.add(root, arc(cx, vy, r, r * 0.75, Math.PI, Math.PI * 2, 30), { stroke: INK.ink, w: 7 - i, closed: false, smooth: true });
      for (const s of [-1, 1]) sh.add(root, [[cx + s * r, vy], [cx + s * r, G]], { stroke: INK.ink, w: 9 - i, closed: false });
    });
    if (!room) for (let k = 1; k < 12; k++) { const a = Math.PI + k / 12 * Math.PI; sh.add(root, [[cx + Math.cos(a) * 500, vy + Math.sin(a) * 375], [cx + Math.cos(a) * 1100, vy + Math.sin(a) * 825]], { stroke: INK.inkSoft, w: 3, closed: false }); }
    // elm tree inside
    const tcx = cx + (mode === 'table' ? -560 : 0);
    if (!room) sh.add(root, [[tcx - 24, G], [tcx - 30, H * 0.5], [tcx + 30, H * 0.5], [tcx + 24, G]], { fill: K.WDD, stroke: INK.ink, w: 5 });
    S.tree = room ? [] : Array.from({ length: 5 }, (_, i) => ({ f: inkEl(root, mix(INK.green, INK.paperDark, 0.35 + i * 0.05)), l: inkEl(root, INK.ink), i }));
    S.flags = room ? [] : Array.from({ length: 6 }, (_, i) => ({ f: inkEl(root, i % 2 ? INK.red : INK.blue), l: inkEl(root, INK.ink), i }));
    if (mode === 'table') {
      sh.add(root, R(W * 0.33, H * 0.62, W * 0.67, H * 0.66), { fill: K.WD, stroke: INK.ink, w: 6 });
      sh.add(root, R(W * 0.35, H * 0.66, W * 0.65, G), { fill: mix(INK.red, INK.ink, 0.2), stroke: INK.ink, w: 6 });
      S.lockG = el(root, 'g');
      sh.add(S.lockG, R(-150, -130, 150, 0), { fill: K.BR, stroke: INK.ink, w: 7 });
      sh.add(S.lockG, [[-14, -90], [14, -90], [8, -40], [-8, -40]], { fill: INK.ink });
      sh.add(S.lockG, ell(0, -92, 18, 18, 10), { fill: INK.ink });
      S.bolt = el(S.lockG, 'g'); sh.add(S.bolt, R(150, -90, 230, -50), { fill: K.IR, stroke: INK.ink, w: 5 });
      S.pick = inkEl(root, INK.ink);
      S.clockF = inkEl(root, INK.paperLight); S.clockL = inkEl(root, INK.ink); S.hand = inkEl(root, INK.red);
      if (P.clock) S.cnt = counter(root, W * 0.86, H * 0.42, 70, Object.assign({ unit: 'min' }, P.clock), INK.red);
    }
    S.crowd = el(root, 'g'); S.heads = []; const cr = rng(sd + 5);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 16; k++) S.heads.push({ x: (k + cr() * 0.6 + r * 0.5) / 16 * W, y: H * (0.95 + r * 0.06), s: 1 + r * 0.25, ph: cr() * 6, f: inkEl(S.crowd, INK.paperLight), b: inkEl(S.crowd, mix(INK.inkSoft, INK.paperDark, 0.2 + cr() * 0.3)), l: inkEl(S.crowd, INK.ink) });
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      sh.update(t, lt);
      S.tree.forEach(({ f, l, i }) => { const x = cx + (mode === 'table' ? -560 : 0) + (i - 2) * 90 + Math.sin(lt * 0.8 + i) * 6, y = H * 0.4 + (i % 2) * 50, r = 120 - Math.abs(i - 2) * 10, p = ell(x, y, r, r * 0.8, 14);
        f.setAttribute('d', inkLoop(p, { seed: sd + 10 + i, t, smooth: true })); l.setAttribute('d', inkPath(p, { w: 4, seed: sd + 20 + i, t, closed: true, smooth: true })); });
      S.flags.forEach(({ f, l, i }) => { const a = Math.PI + (i + 1) / 7 * Math.PI, x = cx + Math.cos(a) * 900, y = vy + Math.sin(a) * 675 + 10, sw = Math.sin(lt * 2 + i) * 14;
        const p = [[x - 34, y], [x + 34, y], [x + sw * 0.6, y + 140]]; f.setAttribute('d', inkLoop(p, { seed: sd + 30 + i, t })); l.setAttribute('d', inkPath(p, { w: 4, seed: sd + 40 + i, t, closed: true })); });
      if (mode === 'table') {
        const lx = W * 0.5, ly = H * 0.62, oa = P.open != null ? A(cues, P.open, null) : null;
        tf(S.lockG, lx, ly, 1, 0);
        const ok = oa != null && lt >= oa;
        S.bolt.setAttribute('transform', `translate(${f1(ok ? -prog(lt, oa, 0.4) * 70 : 0)} 0)`);
        const wig = ok ? 0 : Math.sin(lt * 7) * 4, kx = lx, ky = ly - 70;
        S.pick.setAttribute('d', inkPath(rot([[kx, ky], [kx - 140, ky + 40], [kx - 260, ky + 46]], kx, ky, wig * Math.PI / 180), { w: 7, seed: sd + 50, t }));
        const ccx = W * 0.86, ccy = H * 0.24, a = P.clock ? A(cues, P.clock.at, 0) : 0, ang = P.clock ? progIO(lt, a, P.clock.dur ?? 2) * Math.PI * 2 * ((P.clock.to || 25) / 60) : lt;
        S.clockF.setAttribute('d', inkLoop(ell(ccx, ccy, 110, 110, 22), { seed: sd + 60, t }));
        S.clockL.setAttribute('d', inkPath(ell(ccx, ccy, 110, 110, 22), { w: 7, seed: sd + 61, t, closed: true }) + ' ' + inkPath([[ccx, ccy], [ccx, ccy - 90]], { w: 6, seed: sd + 62, t }));
        S.hand.setAttribute('d', inkLoop([[ccx, ccy]].concat(arc(ccx, ccy, 96, 96, -Math.PI / 2, -Math.PI / 2 + Math.max(0.02, ang), 16)), { seed: sd + 63, t }));
        if (S.cnt) S.cnt(lt, cues);
      }
      S.heads.forEach((h, i) => { const y = h.y + Math.sin(lt * 2 + h.ph) * 4, r = 44 * h.s;
        h.b.setAttribute('d', inkLoop([[h.x - r * 1.6, y + r * 2.4], [h.x - r * 1.3, y + r * 0.9], [h.x + r * 1.3, y + r * 0.9], [h.x + r * 1.6, y + r * 2.4]], { seed: sd + 100 + i, t, smooth: true }));
        h.f.setAttribute('d', inkLoop(ell(h.x, y, r, r, 12), { seed: sd + 200 + i, t }));
        h.l.setAttribute('d', inkPath(ell(h.x, y, r, r, 12), { w: 5, seed: sd + 300 + i, t, closed: true })); });
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_map
  SH.lk_map = { kind: '2d', build(ctx) {
    const { P, W, H, svg, defs, seed } = ctx, sd = seed * 1000 + 191, root = el(svg, 'g'), K = C();
    const sh = window.TZ.Shapes();
    const [lo0, lo1, la0, la1] = P.bounds || [-80, 50, 20, 60];
    const x0 = W * 0.03, x1 = W * 0.97, y0 = H * 0.04, y1 = H * 0.96, kx = Math.cos((la0 + la1) / 2 * Math.PI / 180);
    const sc = Math.min((x1 - x0) / ((lo1 - lo0) * kx), (y1 - y0) / (la1 - la0)), lc = (lo0 + lo1) / 2, ac = (la0 + la1) / 2;
    const PX = ([lo, la]) => [W / 2 + (lo - lc) * kx * sc, H / 2 - (la - ac) * sc];
    sh.add(root, R(x0, y0, x1, y1), { fill: mix(INK.paperLight, INK.blue, 0.1), stroke: INK.ink, w: 8 });
    const cid = 'lkmap' + seed, clip = el(defs, 'clipPath', { id: cid }); el(clip, 'rect', { x: x0 + 4, y: y0 + 4, width: x1 - x0 - 8, height: y1 - y0 - 8 });
    const mg = el(root, 'g', { 'clip-path': `url(#${cid})` });
    for (let lo = -80; lo <= 60; lo += 20) sh.add(mg, [PX([lo, 0]), PX([lo, 80])], { stroke: mix(INK.inkSoft, INK.paperLight, 0.5), w: 2, closed: false });
    for (let la = 20; la <= 70; la += 10) sh.add(mg, [PX([-120, la]), PX([90, la])], { stroke: mix(INK.inkSoft, INK.paperLight, 0.5), w: 2, closed: false });
    LK_LAND.forEach((poly, i) => sh.add(mg, poly.map(PX), { fill: mix(INK.paperDark, INK.stain, 0.25), stroke: INK.ink, w: 4, seed: sd + i * 11, amp: 1 }));
    (P.seas || [{ name: 'Atlantic Ocean', x: -45, y: 33 }]).forEach(s => { const [x, y] = PX([s.x, s.y]); tx(mg, s.name, x, y, 52, { font: INK_FONT, weight: 400, fill: INK.inkSoft }); });
    // compass
    const cpx = x1 - 140, cpy = y1 - 150; sh.add(root, ell(cpx, cpy, 70, 70, 16), { stroke: INK.inkSoft, w: 4 });
    sh.add(root, [[cpx, cpy - 100], [cpx + 18, cpy], [cpx, cpy + 100], [cpx - 18, cpy]], { fill: INK.red, stroke: INK.ink, w: 4 });
    tx(root, 'N', cpx, cpy - 130, 48, { fill: INK.ink });
    const routes = (P.routes || []).map((r, i) => ({ r, e: inkEl(mg, r.color === 'blue' ? INK.blue : INK.red), pts: r.pts.map(PX), i }));
    const places = (P.places || []).map((p, i) => { const g = el(root, 'g'), [x, y] = PX([p.x, p.y]);
      const dot = p.dot === false ? null : { f: inkEl(g, p.color === 'red' ? INK.red : INK.ink), l: inkEl(g, INK.ink) };
      const t = tx(g, p.name, x + (p.dx ?? 30), y + (p.dy ?? -40), p.size || 54, { font: INK_FONT, weight: 400, fill: p.color === 'red' ? INK.red : INK.ink, anchor: p.anchor || 'start' });
      return { p, g, x, y, dot, i }; });
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      sh.update(t, lt);
      routes.forEach(({ r, e, pts, i }) => { const a = A(cues, r.at, 0.4 + i), k = progIO(lt, a, r.dur ?? 2); if (k <= 0.01) { e.setAttribute('d', ''); return; }
        const dense = []; for (let j = 0; j < pts.length - 1; j++) for (let s = 0; s < 12; s++) dense.push([lerp(pts[j][0], pts[j + 1][0], s / 12), lerp(pts[j][1], pts[j + 1][1], s / 12)]); dense.push(pts[pts.length - 1]);
        const n = Math.max(2, Math.round(dense.length * k)), d = [];
        for (let j = 0; j < n - 1; j += 2) d.push(inkPath([dense[j], dense[Math.min(n - 1, j + 1)]], { w: 9, seed: sd + 400 + i * 50 + j, t }));
        const hd = dense[n - 1]; d.push(inkLoop(ell(hd[0], hd[1], 14, 14, 10), { seed: sd + 450 + i, t }));
        e.setAttribute('d', d.join(' ')); });
      places.forEach(({ p, g, x, y, dot, i }) => { const a = A(cues, p.at, 0.2 + i * 0.3), k = spring(lt, a, 0.5);
        g.style.display = lt >= a ? '' : 'none';
        if (dot) { const r = 16 * Math.max(0.01, k) * (1 + 0.3 * punch(lt, a)); dot.f.setAttribute('d', inkLoop(ell(x, y, r, r, 10), { seed: sd + 500 + i, t })); dot.l.setAttribute('d', inkPath(ell(x, y, r + 6, r + 6, 10), { w: 4, seed: sd + 520 + i, t, closed: true })); } });
      com.update(lt, t, cues);
    } };
  } };

  // ================================================================== lk_key (the key in your pocket)
  SH.lk_key = { kind: '2d', build(ctx) {
    const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 211, root = el(svg, 'g'), K = C();
    const sh = window.TZ.Shapes(), S = {};
    for (let k = 0; k < 7; k++) sh.add(root, R(k * W / 7 - 4, -20, (k + 1) * W / 7, H + 20), { fill: k % 2 ? K.WD : mix(K.WD, K.WDD, 0.2), stroke: INK.ink, w: 5 });
    // lock face on the door (left)
    sh.add(root, ell(W * 0.14, H * 0.44, 150, 150, 26), { fill: K.BR, stroke: INK.ink, w: 8 });
    sh.add(root, ell(W * 0.14, H * 0.44, 90, 90, 20), { fill: K.BRL, stroke: INK.ink, w: 6 });
    sh.add(root, R(W * 0.14 - 14, H * 0.44 - 60, W * 0.14 + 14, H * 0.44 + 60), { fill: INK.ink });
    // ghost pins above the key
    S.xs = [0.36, 0.45, 0.54, 0.63, 0.72].map(f => f * W); S.cuts = [50, 15, 80, 35, 65];
    S.pins = S.xs.map(() => ({ f: inkEl(root, INK.gold), l: inkEl(root, INK.ink), d: inkEl(root, INK.inkSoft), dl: inkEl(root, INK.ink) }));
    S.shear = inkEl(root, INK.green);
    S.key = el(root, 'g');
    const ky = H * 0.6, top = ky - 60;
    const prof = [[W * 0.27, ky + 60], [W * 0.27, top]];
    S.xs.forEach((x, i) => { prof.push([x - 40, top], [x, top - S.cuts[i]], [x + 40, top]); });
    prof.push([W * 0.78, top + 20], [W * 0.8, ky + 60]);
    sh.add(S.key, prof, { fill: mix(INK.paperLight, INK.inkSoft, 0.25), stroke: INK.ink, w: 7 });
    sh.add(S.key, [[W * 0.29, ky + 20], [W * 0.76, ky + 20]], { stroke: INK.inkSoft, w: 5, closed: false });
    sh.add(S.key, ell(W * 0.86, ky, 90, 110, 24), { fill: mix(INK.paperLight, INK.inkSoft, 0.25), stroke: INK.ink, w: 8 });
    sh.add(S.key, ell(W * 0.86, ky, 28, 28, 12), { fill: K.WD, stroke: INK.ink, w: 6 });
    S.dots = inkEl(root, INK.inkSoft);
    const com = common(root, P, W, H, sd);
    return { update(lt, dur, cues, env = {}) {
      const t = env.t ?? lt;
      S.key.setAttribute('transform', `translate(0 ${f1(Math.sin(lt * 1.1) * 6)})`);
      sh.update(t, lt);
      const ba = P.bumps != null ? A(cues, P.bumps, 0.4) : 0.4, top = H * 0.6 - 60 + Math.sin(lt * 1.1) * 6, shear = H * 0.22;
      const dd = [];
      S.pins.forEach((p, i) => { const k = progIO(lt, ba + i * 0.35, 0.6), x = S.xs[i];
        const bot = lerp(top - 120, top - 30 - S.cuts[i], k) - 16, kpTop = bot - (110 - S.cuts[i]) - 0 * k;
        const kt = lerp(bot - 120, shear, k); const len = bot - kt;
        p.f.setAttribute('d', inkLoop(R(x - 26, kt, x + 26, bot), { seed: sd + 10 + i, t }));
        p.l.setAttribute('d', inkPath(R(x - 26, kt, x + 26, bot), { w: 5, seed: sd + 20 + i, t, closed: true }));
        p.d.setAttribute('d', inkLoop(R(x - 26, kt - 110, x + 26, kt), { seed: sd + 30 + i, t }));
        p.dl.setAttribute('d', inkPath(R(x - 26, kt - 110, x + 26, kt), { w: 5, seed: sd + 40 + i, t, closed: true }));
        for (let y = bot + 10; y < top - S.cuts[i] - 6; y += 22) dd.push(inkDot(x, y, 5, 5, sd + 50 + i * 9 + Math.round(y), t)); });
      S.dots.setAttribute('d', dd.join(' '));
      const all = progIO(lt, ba + 4 * 0.35, 0.6);
      S.shear.setAttribute('d', all > 0.98 ? inkPath([[W * 0.32, shear], [W * 0.76, shear]], { w: 9, seed: sd + 90, t }) : '');
      com.update(lt, t, cues);
    } };
  } };

  // one type name per place, so the same drawing does not repeat as one "type" (the mode is preset; P.mode still wins)
  const via = (ctx, base, mode) => { ctx.P = Object.assign({ mode }, ctx.P || {}); return SH[base].build(ctx); };
  SH.lk_seabed = { kind: '2d', build: ctx => via(ctx, 'lk_padlock', 'seabed') };
  SH.lk_table = { kind: '2d', build: ctx => via(ctx, 'lk_padlock', 'table') };
  SH.lk_scan = { kind: '2d', build: ctx => via(ctx, 'lk_padlock', 'scan') };
  SH.lk_xray = { kind: '2d', build: ctx => via(ctx, 'lk_padlock', 'xray') };
  SH.lk_chest = { kind: '2d', build: ctx => via(ctx, 'lk_padlock', 'chest') };
  SH.lk_workshop = { kind: '2d', build: ctx => via(ctx, 'lk_shop', 'workshop') };
  SH.lk_sign = { kind: '2d', build: ctx => via(ctx, 'lk_shop', 'sign') };
  SH.lk_pick = { kind: '2d', build: ctx => via(ctx, 'lk_shop', 'pick') };
  SH.lk_pinlock = { kind: '2d', build: ctx => via(ctx, 'lk_cut', 'wood') };
  SH.lk_yale = { kind: '2d', build: ctx => via(ctx, 'lk_cut', 'yale') };
  SH.lk_lever = { kind: '2d', build: ctx => via(ctx, 'lk_cut', 'lever') };
  SH.lk_bramah = { kind: '2d', build: ctx => via(ctx, 'lk_cut', 'bramah') };
  SH.lk_ring = { kind: '2d', build: ctx => via(ctx, 'lk_ward', 'ring') };
  SH.lk_plate = { kind: '2d', build: ctx => via(ctx, 'lk_ward', 'plate') };
  SH.lk_demo = { kind: '2d', build: ctx => via(ctx, 'lk_hall', 'table') };
  SH.lk_inside = { kind: '2d', build: ctx => via(ctx, 'lk_shop', 'inside') };

})();
