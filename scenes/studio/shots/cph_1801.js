// cph_1801: the Battle of Copenhagen (2 April 1801) and the Dannebroge wreck found in 2026, parchment ink style
// (theme "parchment", brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via _ink.js; pure function of (seed, lt),
// no Math.random). Written for videos/2026-11-01/ag-01-dannebroge-copenhagen; parametric for any sailing-navy battle,
// ship fire / explosion, harbour wreck dig or land reclamation. Needs mcB__lib.js (MCB.cast, MCB.labels, MCB.sea).
//
// SHOTS.cph_sea — side view of a harbour roadstead: a far city skyline with spires on the horizon, ships of the line
//   (two gun decks, a chequer stripe, three masts, square sails set or furled, stern ensign), gun smoke puffs with gold
//   flashes, a signal hoist that runs up a far ship's mast, fire on a ship (flames + smoke column), an explosion
//   (flash, fireball, ink shock rings, flying timbers, water column, smoke cloud, camera shake; the ship is gone after),
//   optional foreground: a stone quay the cast stands on, or a row of watching heads + rooftops (the city hears it).
//   P: {water: 0.5 (waterline of the near water, 0..1 H), city: {y: 0.47, from: 0, to: 1, spires: 6} | false,
//       ships: [{x: 0.5, y: 0.56 (waterline 0..1), s: 1 (1 ≈ 560 px long), face: 1|-1, sails: 1 (0 = furled),
//                flag: "uk"|"dk"|null, guns: true|false (smoke puffs from the ports), gun_ph: 0, fire: cue|s,
//                boom: cue|s, depth: 0 (0..1 paler), roll: 1}],
//       hoist: {ship: 0, at: cue|s, n: 3} (signal flags run up that ship's mainmast),
//       quay: {y: 0.74} | false (stone quay band from y to the frame bottom), roofs: {y: 0.8} | false (rooftops +
//       chimneys in the foreground), crowd: {y: 0.9, n: 8, at: cue (heads jump)} | false,
//       cast: [MCB cast], labels: [MCB labels], cam: {zoom: 1.06, focus: [0.5, 0.5]}}
//   cues: ships[].fire / boom, hoist.at, crowd.at, cast / label "at" names.
//
// SHOTS.cph_nelson — close-up on a quarterdeck: a one-armed admiral in a bicorne hat (left sleeve holds a long brass
//   telescope, right sleeve empty and pinned) at the rail; the sea and a far flagship flying a signal hoist behind him.
//   On cue `raise` he lifts the telescope to his eye; labels (e.g. "BLIND EYE" with an arrow) pop on their cues.
//   P: {x: 0.4, y: 0.37 (head centre, 0..1), r: 118 (head radius px), raise: cue|s, eye: "right"|"left" (which eye the
//       telescope goes to, seen from the viewer), far: {x: 0.8, y: 0.47, s: 0.42}, hoist: {at, n: 3},
//       horizon: 0.5, deck: 0.7, labels: [MCB labels], cam: {zoom, focus}}
//   cues: raise, hoist.at, label "at" names.
//
// SHOTS.cph_mud — murky harbour seabed (full frame, own water: use "set": false): silt specks drift, a diver with a
//   torch whose beam sweeps the mud; the wreck: charred ribs and a keel sticking out of the mud, two cannons, cannonballs
//   and a bar shot, a shoe. mode "reveal": the wreck rises out of a silt cloud on cue `hit`. mode "find": the diver
//   kneels close and fans the mud; a lower jawbone shows and a red ink ring circles it on cue `find`.
//   P: {mode: "reveal"|"find", floor: 0.56 (top of the mud, 0..1 H), diver: {x: 0.3, y: 0.34} , jaw: {x: 0.6},
//       labels: [MCB labels], cam: {zoom, focus}}
//   cues: hit (reveal), find (find), label "at" names.
//
// SHOTS.cph_island — cross-section of the harbour: water, the seabed, the wreck lying in the mud (dashed outline,
//   timbers, a cannon), and a new island growing out of the water on cue `build` (stone revetment, sand layers) while a
//   barge with a crane drops sand; optionally finished from the start (P.done) with the cast standing on top.
//   P: {surf: 0.42, bed: 0.6 (seabed, 0..1 H), wreck: {x: 0.55}, build: cue|s, done: false, island: {from: -0.05,
//       to: 0.8, top: 0.37}, barge: true, cast: [MCB cast; y defaults to island top], labels: [MCB labels], cam}
//   cues: build, label / cast "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const circ = (cx, cy, r, n = 12, ry) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * (ry ?? r)]);
  const hsh = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

  // one <path> per colour, filled in painter's order
  const LAYERS = ['dark', 'stain', 'sand', 'light', 'soft', 'red', 'blue', 'green', 'gold', 'ink'];
  function layerSet(parent, extra = {}) {
    const C = { light: INK.paperLight, dark: INK.paperDark, stain: INK.stain, sand: INK.gold, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, soft: INK.inkSoft, ink: INK.ink };
    const g = el(parent, 'g'), E = {}, B = {};
    LAYERS.forEach(k => { E[k] = mk(g, C[k], extra[k] || (k === 'sand' ? { 'fill-opacity': 0.45 } : {})); B[k] = ''; });
    return { g, add(k, d) { if (d) B[k] += d + ' '; }, flush() { LAYERS.forEach(k => { E[k].setAttribute('d', B[k]); B[k] = ''; }); } };
  }

  // ---------------------------------------------------------------- a ship of the line, side view
  // o: {x, y (waterline), s, face, sails 0..1, flag, roll (deg), hoist: 0..1 (signal flags up the mainmast), n}
  // returns anchor points {ports: [[x,y]...], deck: [x0, x1, y], main: [x, ytop]}
  function drawShip(Lr, sd, t, o) {
    const s = o.s ?? 1, f = o.face ?? 1, x0 = o.x, y0 = o.y, rot = (o.roll ?? 0) * Math.PI / 180;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const Q = (u, v) => { u *= f; return [x0 + (u * cr - v * sr) * s, y0 + (u * sr + v * cr) * s]; };
    const QQ = arr => arr.map(p => Q(p[0], p[1]));
    const soft = !!o.soft, inkK = soft ? 'soft' : 'ink', w = k => Math.max(2.5, k * Math.min(1.2, s + 0.15));
    // hull (bow at +u)
    const hull = QQ([[-280, -150], [-250, -160], [-120, -128], [60, -122], [210, -132], [262, -148], [268, -112], [240, -40], [190, 22], [-200, 26], [-262, -40]]);
    Lr.add('dark', inkLoop(hull, { seed: sd + 1, t, amp: 1.2, smooth: false }));
    Lr.add(inkK, inkPath(hull, { seed: sd + 1, t, w: w(7), closed: true, amp: 1.2, smooth: false }));
    // chequer stripes (light bands with the gunport rows)
    [[-92, -70], [-50, -30]].forEach(([a, b], i) => {
      const band = QQ([[-250, a], [235, a + 6], [232, b + 6], [-246, b]]);
      Lr.add('light', inkLoop(band, { seed: sd + 3 + i, t, amp: 1, smooth: false }));
    });
    const ports = [];
    [-81, -40].forEach((v, r) => {
      for (let k = 0; k < 11; k++) {
        const u = -215 + k * 41;
        const sq = QQ([[u - 10, v - 9], [u + 10, v - 9], [u + 10, v + 9], [u - 10, v + 9]]);
        Lr.add(inkK, inkLoop(sq, { seed: sd + 10 + r * 20 + k, t, amp: 0.6, smooth: false }));
        ports.push(Q(u, v));
      }
    });
    Lr.add(inkK, inkPath(QQ([[-262, -112], [-120, -100], [60, -96], [250, -104]]), { seed: sd + 5, t, w: w(4) }));
    // bowsprit
    Lr.add(inkK, inkPath(QQ([[250, -140], [400, -230]]), { seed: sd + 6, t, w: w(6) }));
    // masts, yards, sails
    const masts = [[-150, 400], [10, 470], [150, 420]];
    const sails = o.sails ?? 1, bill = Math.sin(t * 1.3 + sd) * 6;
    let mainTop = null;
    masts.forEach(([u, h], m) => {
      Lr.add(inkK, inkPath(QQ([[u, -128], [u + 4, -128 - h]]), { seed: sd + 30 + m, t, w: w(7) }));
      if (m === 1) mainTop = Q(u + 4, -128 - h);
      [0.3, 0.58, 0.82].forEach((k, j) => {
        const yy = -128 - h * k, half = (j === 0 ? 110 : j === 1 ? 92 : 64) * (m === 1 ? 1.05 : 0.95);
        Lr.add(inkK, inkPath(QQ([[u - half, yy], [u + half, yy]]), { seed: sd + 40 + m * 5 + j, t, w: w(5) }));
        if (sails > 0.02) {
          const nh = (j === 0 ? h * 0.27 : j === 1 ? h * 0.23 : h * 0.17) * sails, b = (bill + 10) * sails;
          const sl = QQ([[u - half + 6, yy], [u + half - 6, yy], [u + half - 2, yy + nh], [u + b * 0.4, yy + nh + b * 0.5], [u - half + 2, yy + nh]]);
          Lr.add('light', inkLoop(sl, { seed: sd + 60 + m * 5 + j, t, amp: 1 }));
          Lr.add(inkK, inkPath(sl, { seed: sd + 60 + m * 5 + j, t, w: w(4), closed: true, amp: 1 }));
        } else {
          Lr.add('light', inkPath(QQ([[u - half + 8, yy + 8], [u + half - 8, yy + 8]]), { seed: sd + 70 + m * 5 + j, t, w: w(12) }));
        }
      });
    });
    // stern ensign
    if (o.flag) {
      const fx = -282, fy = -170, wv = Math.sin(t * 3 + sd) * 8;
      Lr.add(inkK, inkPath(QQ([[fx, -150], [fx - 20, fy - 90]]), { seed: sd + 80, t, w: w(4) }));
      const fl = QQ([[fx - 20, fy - 90], [fx - 120, fy - 84 + wv], [fx - 116, fy - 30 + wv], [fx - 18, fy - 36]]);
      if (o.flag === 'dk') {
        Lr.add('red', inkLoop(fl, { seed: sd + 81, t, amp: 0.8, smooth: false }));
        Lr.add('light', inkPath(QQ([[fx - 54, fy - 88 + wv * 0.4], [fx - 52, fy - 33 + wv * 0.4]]), { seed: sd + 82, t, w: w(9) }));
        Lr.add('light', inkPath(QQ([[fx - 20, fy - 62], [fx - 118, fy - 57 + wv]]), { seed: sd + 83, t, w: w(9) }));
      } else {
        Lr.add('blue', inkLoop(fl, { seed: sd + 81, t, amp: 0.8, smooth: false }));
        Lr.add('red', inkPath(QQ([[fx - 22, fy - 62], [fx - 60, fy - 60 + wv * 0.5]]), { seed: sd + 82, t, w: w(8) }));
      }
      Lr.add(inkK, inkPath(fl, { seed: sd + 81, t, w: w(4), closed: true, amp: 0.8, smooth: false }));
    }
    // signal hoist on the mainmast
    if (o.hoist > 0 && mainTop) {
      const n = o.n ?? 3, cols = ['red', 'gold', 'blue', 'red'];
      for (let i = 0; i < n; i++) {
        const p = clamp01(o.hoist * n - i * 0.6), uu = 10 + 4, top = -128 - 470 + 20;
        if (p <= 0) continue;
        const vv = lerp(-150, top + i * 62, p), wv = Math.sin(t * 4 + i) * 6;
        const fl = QQ([[uu, vv], [uu + 78, vv + wv], [uu + 78, vv + 50 + wv], [uu, vv + 50]]);
        Lr.add(cols[i % 4], inkLoop(fl, { seed: sd + 90 + i, t, amp: 0.8, smooth: false }));
        if (i % 2 === 0) Lr.add('light', inkPath(QQ([[uu + 26, vv + 6], [uu + 26, vv + 46]]), { seed: sd + 95 + i, t, w: w(10) }));
        Lr.add(inkK, inkPath(fl, { seed: sd + 90 + i, t, w: w(4), closed: true, amp: 0.8, smooth: false }));
      }
      Lr.add(inkK, inkPath([Q(14, -150), Q(14, -128 - 450)], { seed: sd + 99, t, w: w(2.5), amp: 0.6 }));
    }
    return { ports, deck: [Q(-240, -130), Q(230, -130)], main: mainTop, Q };
  }

  // flames + smoke column at a point (stage px), size k (px), p 0..1 growth
  function drawFire(Lr, sd, t, x, y, k, p) {
    if (p <= 0) return;
    for (let i = 0; i < 6; i++) {
      const ox = (i - 2.5) * k * 0.32, ph = t * 7 + i * 1.9, hh = k * (0.7 + 0.45 * Math.sin(ph)) * p * (i % 2 ? 0.8 : 1.15);
      const fl = [[x + ox - k * 0.2, y], [x + ox - k * 0.12, y - hh * 0.55], [x + ox + Math.sin(ph * 0.7) * k * 0.15, y - hh], [x + ox + k * 0.14, y - hh * 0.5], [x + ox + k * 0.2, y]];
      Lr.add(i % 2 ? 'gold' : 'red', inkLoop(fl, { seed: sd + i, t, amp: 1.5 }));
    }
    // smoke column: blobs rising and widening
    for (let j = 0; j < 9; j++) {
      const ph = (t * 0.35 + j / 9) % 1, yy = y - k * 0.6 - ph * k * 5.5 * p, xx = x + Math.sin(ph * 4 + j) * k * 0.4 + ph * k * 1.2, r = k * (0.35 + ph * 0.9) * p;
      Lr.add('soft', inkLoop(circ(xx, yy, r, 10, r * 0.8), { seed: sd + 20 + j, t, amp: 3 }));
    }
  }

  // explosion at (x, y), size k, q = seconds since the boom
  function drawBlast(Lr, sd, t, x, y, k, q) {
    if (q < 0) return;
    const p = clamp01(q / 0.45), fade = clamp01(1 - (q - 1.6) / 2.2);
    // water column (pale)
    const wc = [[x - k * 0.9, y + 10], [x - k * 0.5, y - k * 1.4 * p], [x, y - k * 1.8 * p], [x + k * 0.5, y - k * 1.4 * p], [x + k * 0.9, y + 10]];
    Lr.add('light', inkLoop(wc, { seed: sd + 1, t, amp: 3 }));
    Lr.add('soft', inkPath(wc, { seed: sd + 1, t, w: 3, closed: true, amp: 3 }));
    // a light smoke cloud only after the burst has peaked
    const sq = clamp01((q - 0.7) / 1.4);
    if (sq > 0) for (let j = 0; j < 8; j++) {
      const a = j / 8 * 6.2832, rr = k * (1.2 + q * 0.12), cx = x + Math.cos(a) * rr * 0.8, cy = y - k * 1.5 - q * k * 0.2 + Math.sin(a) * rr * 0.45;
      Lr.add('soft', inkLoop(circ(cx, cy, k * 0.5 * sq, 10, k * 0.4 * sq), { seed: sd + 10 + j, t, amp: 3 }));
    }
    // fireball: clean red rays + gold core + light heart
    if (fade > 0) {
      const R = k * (0.5 + 1.25 * p) * (0.7 + 0.3 * fade), cy = y - k * 0.85 * p;
      const fb = []; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, rr = R * (i % 2 ? 0.72 : 1.08 + 0.12 * hsh(i, Math.floor(t * 8))); fb.push([x + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9]); }
      Lr.add('red', inkLoop(fb, { seed: sd + 30, t, amp: 2, smooth: false }));
      const fi = []; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.2832, rr = R * (i % 2 ? 0.5 : 0.68); fi.push([x + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.9]); }
      Lr.add('gold', inkLoop(fi, { seed: sd + 31, t, amp: 2, smooth: false }));
      Lr.add('light', inkLoop(circ(x, cy, R * (q < 0.5 ? 0.32 : 0.22), 12), { seed: sd + 32, t, amp: 2 }));
    }
    // one thin shock ring
    if (q < 1.4) { const rr = k * (1.0 + q * 3); Lr.add('soft', inkPath(circ(x, y - k * 0.7, rr, 24, rr * 0.6), { seed: sd + 40, t, w: Math.max(2, 5 * (1 - q / 1.4)), closed: true, amp: 2 })); }
    // flying timbers: short planks with a light face
    for (let i = 0; i < 9; i++) {
      const a = -0.3 - (i / 8) * 2.55, v = k * (2.4 + hsh(i, 3) * 2.2), g = k * 2.6, qq = Math.min(q, 2.2);
      const px = x + Math.cos(a) * v * qq, py = y - k * 0.8 + Math.sin(a) * v * qq + g * qq * qq * 0.5;
      if (py > y + k * 0.4 || q < 0.08) continue;
      const ang = q * (3 + i) + i, L = k * (0.16 + hsh(i, 7) * 0.12), c = Math.cos(ang), s = Math.sin(ang), wd = k * 0.05;
      const pl = [[px - c * L - s * wd, py - s * L + c * wd], [px + c * L - s * wd, py + s * L + c * wd], [px + c * L + s * wd, py + s * L - c * wd], [px - c * L + s * wd, py - s * L - c * wd]];
      Lr.add('dark', inkLoop(pl, { seed: sd + 60 + i, t, amp: 0.6, smooth: false }));
      Lr.add('ink', inkPath(pl, { seed: sd + 60 + i, t, w: 4, closed: true, amp: 0.6, smooth: false }));
    }
  }

  // city skyline on the horizon: roofs, spires, a dome
  function drawCity(Lr, sd, t, W, y, from, to, nsp) {
    const pts = [[from * W, y + 4]];
    const n = 26;
    for (let i = 0; i <= n; i++) {
      const x = lerp(from * W, to * W, i / n), hgt = 26 + hsh(i, 2) * 34;
      pts.push([x, y - hgt], [x + (to - from) * W / n * 0.5, y - hgt - 14], [x + (to - from) * W / n, y - hgt]);
    }
    pts.push([to * W, y + 4]);
    Lr.add('dark', inkLoop(pts, { seed: sd + 1, t, amp: 1, smooth: false }));
    Lr.add('soft', inkPath(pts.slice(1, -1), { seed: sd + 2, t, w: 3, amp: 1, smooth: false }));
    for (let i = 0; i < nsp; i++) {
      const x = lerp(from * W + 60, to * W - 60, (i + 0.5) / nsp + (hsh(i, 5) - 0.5) * 0.06), h = 90 + hsh(i, 6) * 120;
      const sp = [[x - 16, y - 40], [x - 14, y - h * 0.55], [x, y - h], [x + 14, y - h * 0.55], [x + 16, y - 40]];
      Lr.add('green', inkLoop(sp, { seed: sd + 10 + i, t, amp: 1, smooth: false }));
      Lr.add('soft', inkPath(sp, { seed: sd + 10 + i, t, w: 3, closed: true, amp: 1, smooth: false }));
    }
  }

  // ================================================================ cph_sea
  SH.cph_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000;
      const cam = el(svg, 'g');
      const back = layerSet(cam), sea = MCB.sea(el(cam, 'g'), W, H, (P.water ?? 0.5) * H, sd0 + 5, { hatch: 26 });
      const shipL = layerSet(cam), fx = layerSet(cam), front = layerSet(cam);
      const castG = el(cam, 'g'), labG = el(cam, 'g');
      const cast = MCB.cast(castG, P.cast, W, H, sd0 + 700), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      const ships = (P.ships || []).map((s, i) => Object.assign({ i }, s));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          // explosions drive the shake
          let shake = 0, hit = 0;
          ships.forEach(s => { const b = atOr(cues, s.boom, null); if (b != null && lt >= b) { shake = Math.max(shake, Math.exp(-(lt - b) * 2.2)); hit = Math.max(hit, punch(lt, b, 0.8)); } });
          const C = P.cam || {};
          MCB.camPush(cam, lt, dur, W, H, { zoom: C.zoom ?? 1.06, focus: C.focus || [0.5, 0.5] }, hit, shake * 0.8);
          const wy = (P.water ?? 0.5) * H;
          if (P.city !== false) { const c = P.city || {}; drawCity(back, sd + 100, t, W, (c.y ?? (P.water ?? 0.5) - 0.03) * H, c.from ?? 0, c.to ?? 1, c.spires ?? 6); }
          back.flush();
          sea.update(t);
          // ships, far ones first
          ships.slice().sort((a, b) => (a.y ?? 0.56) - (b.y ?? 0.56)).forEach(s => {
            const boom = atOr(cues, s.boom, null), q = boom != null ? lt - boom : -1;
            const bx = s.x * W, by = (s.y ?? 0.56) * H, k = 230 * (s.s ?? 1);
            if (q < 0.5) {
              const roll = Math.sin(t * 0.9 + s.i) * 1.4 * (s.roll ?? 1);
              const hz = s.hoist ?? (P.hoist && P.hoist.ship === s.i ? progIO(lt, atOr(cues, P.hoist.at, 0.5), 1.4) : 0);
              const A = drawShip(shipL, sd + 200 + s.i * 300, t, { x: bx, y: by + Math.sin(t * 1.2 + s.i) * 4, s: s.s ?? 1, face: s.face ?? 1, sails: s.sails ?? 1, flag: s.flag, roll, hoist: hz, n: P.hoist && P.hoist.n, soft: (s.depth ?? 0) > 0.5 });
              // gun puffs
              if (s.guns) {
                for (let j = 0; j < 4; j++) {
                  const per = 1.6, ph = ((t + (s.gun_ph ?? 0) + j * 0.41) % per) / per, pt = A.ports[(j * 5 + 3) % A.ports.length];
                  if (ph < 0.5) {
                    const r = (14 + ph * 70) * (s.s ?? 1), dx = (s.face ?? 1) * ph * 120 * (s.s ?? 1);
                    shipL.add('soft', inkLoop(circ(pt[0] + dx, pt[1] - ph * 30, r, 10, r * 0.75), { seed: sd + 260 + s.i * 30 + j, t, amp: 2 }));
                    if (ph < 0.12) shipL.add('gold', inkLoop(circ(pt[0] + (s.face ?? 1) * 18, pt[1], 16 * (s.s ?? 1), 8), { seed: sd + 280 + j, t, amp: 2 }));
                  }
                }
              }
              const fa = atOr(cues, s.fire, null);
              if (fa != null && lt >= fa) {
                const pf = clamp01((lt - fa) / 0.9) * (q > 0 ? 0 : 1);
                drawFire(fx, sd + 400 + s.i * 50, t, bx - 60 * (s.face ?? 1) * (s.s ?? 1), by - 130 * (s.s ?? 1), k * 0.55, pf);
                drawFire(fx, sd + 450 + s.i * 50, t, bx + 110 * (s.face ?? 1) * (s.s ?? 1), by - 128 * (s.s ?? 1), k * 0.4, clamp01(pf * 1.4 - 0.3));
              }
            } else {
              // wreckage floating
              for (let j = 0; j < 6; j++) {
                const xx = bx + (j - 2.5) * k * 0.45 + Math.sin(t + j) * 6, yy = by + 6 + Math.sin(t * 1.4 + j) * 4;
                shipL.add('ink', inkPath([[xx - k * 0.14, yy], [xx + k * 0.14, yy - 4]], { seed: sd + 500 + j, t, w: 7 }));
              }
            }
            if (q >= 0) drawBlast(fx, sd + 600 + s.i * 90, t, bx, by - 90 * (s.s ?? 1), k * (s.blast ?? 0.62), q);
          });
          shipL.flush(); fx.flush();
          // foreground
          if (P.quay) {
            const qy = (P.quay.y ?? 0.74) * H;
            const top = [[-40, qy], [W + 40, qy + 6]];
            front.add('dark', inkLoop([[-40, qy], [W + 40, qy + 6], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 900, t, amp: 1, smooth: false }));
            front.add('light', inkLoop([[-40, qy - 4], [W + 40, qy + 2], [W + 40, qy + 40], [-40, qy + 34]], { seed: sd + 901, t, amp: 1, smooth: false }));
            front.add('ink', inkPath(top, { seed: sd + 902, t, w: 8 }));
            front.add('ink', inkPath([[-40, qy + 38], [W + 40, qy + 44]], { seed: sd + 903, t, w: 5 }));
            for (let r = 0; r < 7; r++) {
              const yy = qy + 40 + r * 90; if (yy > H + 20) break;
              front.add('soft', inkPath([[-40, yy], [W + 40, yy + 4]], { seed: sd + 910 + r, t, w: 4 }));
              for (let c = 0; c < 6; c++) { const xx = ((c + (r % 2) * 0.5) / 6) * W + 40; front.add('soft', inkPath([[xx, yy], [xx + 2, yy + 90]], { seed: sd + 930 + r * 7 + c, t, w: 3.5 })); }
            }
            // bollard + rope
            const bx = W * (P.quay.bollard ?? 0.14);
            const bo = [[bx - 34, qy + 4], [bx - 30, qy - 70], [bx - 44, qy - 90], [bx + 44, qy - 90], [bx + 30, qy - 70], [bx + 34, qy + 4]];
            front.add('dark', inkLoop(bo, { seed: sd + 960, t, smooth: false }));
            front.add('ink', inkPath(bo, { seed: sd + 960, t, w: 6, closed: true, smooth: false }));
            front.add('soft', inkPath([[bx + 30, qy - 50], [bx + 160, qy - 20 + Math.sin(t) * 6], [bx + 300, qy - 60]], { seed: sd + 961, t, w: 7 }));
          }
          if (P.roofs) {
            const ry = (P.roofs.y ?? 0.8) * H;
            const pts = [[-40, H + 40], [-40, ry + 40]];
            const xs = [0, 0.18, 0.3, 0.52, 0.66, 0.86, 1.04];
            xs.forEach((u, i) => { if (i === xs.length - 1) return; const a = u * W, b = xs[i + 1] * W, hh = ry - (i % 2 ? 40 : 90); pts.push([a, ry + 30], [(a + b) / 2, hh], [b, ry + 30]); });
            pts.push([W + 40, ry + 40], [W + 40, H + 40]);
            front.add('dark', inkLoop(pts, { seed: sd + 970, t, smooth: false, amp: 1 }));
            front.add('ink', inkPath(pts.slice(1, -1), { seed: sd + 971, t, w: 6, smooth: false }));
            for (let r = 0; r < 8; r++) front.add('soft', inkPath([[-20, ry + 70 + r * 56], [W + 20, ry + 74 + r * 56]], { seed: sd + 972 + r, t, w: 3 }));
            [[0.24, 60], [0.6, 40], [0.78, 70]].forEach(([u, hh], i) => {
              const cx = u * W, ch = [[cx - 22, ry + 10], [cx - 22, ry - hh - 60], [cx + 22, ry - hh - 60], [cx + 22, ry + 10]];
              front.add('dark', inkLoop(ch, { seed: sd + 985 + i, t, smooth: false })); front.add('ink', inkPath(ch, { seed: sd + 985 + i, t, w: 5, closed: true, smooth: false }));
            });
          }
          if (P.crowd) {
            const Cw = P.crowd, cy = (Cw.y ?? 0.9) * H, n = Cw.n ?? 8, ca = atOr(cues, Cw.at, null);
            for (let i = 0; i < n; i++) {
              const x = (i + 0.5) / n * W + (hsh(i, 1) - 0.5) * 60, r = (Cw.r ?? 78) + hsh(i, 2) * 18;
              const jump = ca != null && lt >= ca ? Math.exp(-(lt - ca) * 3) * Math.abs(Math.sin((lt - ca) * 9)) * 40 : 0;
              const y = cy - jump + Math.sin(t * 1.5 + i) * 3 + (i % 2) * 40;
              const sh = [[x - r * 1.9, y + r * 3], [x - r * 1.6, y + r * 1.3], [x, y + r * 0.9], [x + r * 1.6, y + r * 1.3], [x + r * 1.9, y + r * 3]];
              front.add(i % 2 ? 'blue' : 'soft', inkLoop(sh, { seed: sd + 1000 + i, t }));
              front.add('ink', inkPath(sh.slice(1, 4), { seed: sd + 1000 + i, t, w: 6 }));
              front.add('light', inkLoop(circ(x, y, r, 14), { seed: sd + 1020 + i, t }));
              front.add('ink', inkPath(circ(x, y, r, 14), { seed: sd + 1020 + i, t, w: 6, closed: true }));
              // hats: tricorn-ish / bonnet alternate
              const ht = i % 3 === 0 ? [[x - r * 1.2, y - r * 0.55], [x, y - r * 1.5], [x + r * 1.2, y - r * 0.55], [x, y - r * 0.8]]
                : i % 3 === 1 ? [[x - r * 1.05, y - r * 0.2], [x - r * 0.6, y - r * 1.2], [x + r * 0.6, y - r * 1.2], [x + r * 1.05, y - r * 0.2]] : null;
              if (ht) { front.add('ink', inkLoop(ht, { seed: sd + 1040 + i, t, smooth: i % 3 === 1 })); }
            }
          }
          front.flush();
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ cph_nelson
  SH.cph_nelson = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000;
      const cam = el(svg, 'g');
      const hz = (P.horizon ?? 0.5) * H;
      const back = layerSet(cam), sea = MCB.sea(el(cam, 'g'), W, H, hz, sd0 + 5, { hatch: 18, amp: 6 });
      const far = layerSet(cam), deck = layerSet(cam), man = layerSet(cam);
      const labG = el(cam, 'g'), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const C = P.cam || {};
          const ra = atOr(cues, P.raise, dur * 0.35), pr = spring(lt, ra, 0.8), hit = punch(lt, ra, 0.7);
          MCB.camPush(cam, lt, dur, W, H, { zoom: C.zoom ?? 1.08, focus: C.focus || [0.45, 0.4] }, hit);
          back.flush();
          sea.update(t);
          // far flagship with the signal hoist
          const F = P.far || {}, ho = P.hoist || {};
          drawShip(far, sd + 100, t, { x: (F.x ?? 0.8) * W, y: (F.y ?? 0.47) * H + 30, s: F.s ?? 0.42, face: F.face ?? -1, sails: 1, flag: 'uk', roll: Math.sin(t) * 1, hoist: progIO(lt, atOr(cues, ho.at, 0.2), 1.2), n: ho.n ?? 3, soft: false });
          far.flush();
          // deck rail + planks (foreground, fills the lower frame)
          const dy = (P.deck ?? 0.7) * H, ry = dy - 150;
          deck.add('dark', inkLoop([[-40, ry], [W + 40, ry - 6], [W + 40, ry + 40], [-40, ry + 46]], { seed: sd + 200, t, smooth: false, amp: 1 }));
          deck.add('ink', inkPath([[-40, ry], [W + 40, ry - 6]], { seed: sd + 201, t, w: 8 }));
          deck.add('ink', inkPath([[-40, ry + 46], [W + 40, ry + 40]], { seed: sd + 202, t, w: 5 }));
          for (let i = 0; i < 9; i++) { const x = i / 8 * W; deck.add('ink', inkPath([[x, ry + 44], [x + 2, dy]], { seed: sd + 210 + i, t, w: 7 })); }
          deck.add('dark', inkLoop([[-40, dy], [W + 40, dy], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 230, t, smooth: false, amp: 1 }));
          deck.add('ink', inkPath([[-40, dy], [W + 40, dy]], { seed: sd + 231, t, w: 7 }));
          for (let i = 1; i < 12; i++) { const y = dy + i * i * 7 + i * 20; if (y > H + 20) break; deck.add('soft', inkPath([[-40, y], [W + 40, y]], { seed: sd + 240 + i, t, w: 3 + i * 0.4 })); }
          // a carronade on the deck (foreground right)
          {
            const cx = W * 0.8, cy = dy + 240;
            const car = [[cx - 160, cy + 60], [cx + 120, cy + 60], [cx + 100, cy - 20], [cx - 140, cy - 20]];
            deck.add('dark', inkLoop(car, { seed: sd + 260, t, smooth: false })); deck.add('ink', inkPath(car, { seed: sd + 260, t, w: 6, closed: true, smooth: false }));
            const br = [[cx - 120, cy - 40], [cx + 200, cy - 90], [cx + 210, cy - 50], [cx - 110, cy + 0]];
            deck.add('ink', inkLoop(br, { seed: sd + 261, t, smooth: false }));
            [cx - 120, cx + 90].forEach((wx, i) => { deck.add('light', inkLoop(circ(wx, cy + 70, 46, 12), { seed: sd + 262 + i, t })); deck.add('ink', inkPath(circ(wx, cy + 70, 46, 12), { seed: sd + 262 + i, t, w: 6, closed: true })); });
            // cannonball stack
            [[-260, 100], [-210, 100], [-235, 60]].forEach(([dx, dyy], i) => deck.add('ink', inkLoop(circ(cx + dx, cy + dyy, 26, 10), { seed: sd + 270 + i, t })));
          }
          deck.flush();
          // the admiral (P.look: -1 looks to the viewer's left, +1 to the right; the telescope goes to the eye on that side)
          const hx = (P.x ?? 0.4) * W, hy = (P.y ?? 0.37) * H + Math.sin(t * 1.1) * 3, r = P.r ?? 118, dir = P.look ?? 1;
          const coat = [[hx - r * 1.5, dy + 20], [hx - r * 1.35, hy + r * 1.7], [hx - r * 0.5, hy + r * 1.05], [hx + r * 0.5, hy + r * 1.05], [hx + r * 1.35, hy + r * 1.7], [hx + r * 1.5, dy + 20]];
          man.add('blue', inkLoop(coat, { seed: sd + 300, t }));
          man.add('ink', inkPath(coat, { seed: sd + 300, t, w: 7, closed: true }));
          man.add('light', inkLoop([[hx - r * 0.28, hy + r * 1.05], [hx + r * 0.28, hy + r * 1.05], [hx, hy + r * 2.2]], { seed: sd + 301, t, smooth: false }));
          man.add('ink', inkPath([[hx - r * 0.28, hy + r * 1.05], [hx, hy + r * 2.2], [hx + r * 0.28, hy + r * 1.05]], { seed: sd + 302, t, w: 5, smooth: false }));
          for (let i = 0; i < 4; i++) man.add('gold', inkDot(hx - r * 0.42, hy + r * (1.6 + i * 0.45), 9, 9, sd + 303 + i, t));
          [-1, 1].forEach((sg, i) => { const ex = hx + sg * r * 1.25, ey = hy + r * 1.55; man.add('gold', inkLoop([[ex - r * 0.35, ey], [ex + r * 0.35, ey - 6], [ex + r * 0.3 * sg, ey + 26], [ex - r * 0.3 * sg, ey + 26]], { seed: sd + 310 + i, t })); });
          // his right sleeve (viewer's left) is empty and pinned to the coat
          const sl = [[hx - r * 1.3, hy + r * 1.75], [hx - r * 1.55, hy + r * 2.5], [hx - r * 1.0, hy + r * 2.6]];
          man.add('ink', inkPath(sl, { seed: sd + 320, t, w: 26 }));
          man.add('gold', inkDot(hx - r * 1.0, hy + r * 2.6, 12, 12, sd + 321, t));
          // head
          man.add('light', inkLoop(circ(hx, hy, r, 18), { seed: sd + 330, t }));
          man.add('ink', inkPath(circ(hx, hy, r, 18), { seed: sd + 330, t, w: 7, closed: true }));
          // eyes shifted toward the look side; eyeO = the outer eye on that side (dir -1: his RIGHT eye)
          const ey = hy - r * 0.05, eyeI = hx + dir * r * 0.1, eyeO = hx + dir * r * 0.55, eb = pr;
          man.add('ink', inkDot(eyeI, ey, 11, 13, sd + 340, t));
          man.add('ink', inkPath([[eyeI - 24, ey - 42 - eb * 6], [eyeI + 24, ey - 42 - eb * 6]], { seed: sd + 342, t, w: 6 }));
          man.add('ink', inkPath([[hx + dir * r * 0.05, hy + r * 0.45], [hx + dir * r * 0.28, hy + r * 0.42 - eb * 6], [hx + dir * r * 0.5, hy + r * 0.45]], { seed: sd + 344, t, w: 6 }));
          // bicorne + cockade
          const bh = [[hx - r * 1.55, hy - r * 0.55], [hx - r * 0.9, hy - r * 1.35], [hx, hy - r * 1.75], [hx + r * 0.9, hy - r * 1.35], [hx + r * 1.55, hy - r * 0.55], [hx + r * 0.9, hy - r * 0.8], [hx, hy - r * 0.9], [hx - r * 0.9, hy - r * 0.8]];
          man.add('ink', inkLoop(bh, { seed: sd + 350, t }));
          man.add('gold', inkPath([[hx - r * 1.3, hy - r * 0.68], [hx, hy - r * 1.0], [hx + r * 1.3, hy - r * 0.68]], { seed: sd + 351, t, w: 7 }));
          man.add('gold', inkDot(hx + dir * r * 0.55, hy - r * 1.2, 20, 20, sd + 352, t));
          // telescope: rests low, swings up on `raise` with its eyepiece on eyeO, tube pointing toward `dir`
          const ang = lerp(0.2, -0.07, pr), L = r * 3.4;
          const eyeP = [lerp(hx + dir * r * 1.6, eyeO + dir * 6, pr), lerp(dy - 170, ey, pr)];
          if (pr < 0.5) man.add('ink', inkDot(eyeO, ey, 11, 13, sd + 341, t));      // the eye shows until the glass covers it
          const dx = dir * Math.cos(ang) * L, dyy = Math.sin(ang) * L;
          const tube = [[eyeP[0], eyeP[1] - 16], [eyeP[0] + dx, eyeP[1] + dyy - 30], [eyeP[0] + dx, eyeP[1] + dyy + 30], [eyeP[0], eyeP[1] + 16]];
          man.add('gold', inkLoop(tube, { seed: sd + 360, t, smooth: false }));
          man.add('ink', inkPath(tube, { seed: sd + 360, t, w: 6, closed: true, smooth: false }));
          [0.3, 0.55, 0.85].forEach((k, i) => { const px = eyeP[0] + dx * k, py = eyeP[1] + dyy * k, hh = 18 + k * 12; man.add('ink', inkPath([[px, py - hh], [px + 2, py + hh]], { seed: sd + 361 + i, t, w: 6 })); });
          // his left arm (viewer's right shoulder) crosses the chest to hold the tube
          const sh = [hx + r * 1.2, hy + r * 1.8];
          const hand = [eyeP[0] + dx * 0.22, eyeP[1] + dyy * 0.22 + 26];
          const elbow = [lerp(sh[0], hand[0], 0.45), Math.max(sh[1], hand[1]) + r * 0.55];
          man.add('ink', inkPath([sh, elbow, hand], { seed: sd + 370, t, w: 30 }));
          man.add('blue', inkPath([sh, elbow, hand], { seed: sd + 370, t, w: 18 }));
          man.add('light', inkDot(hand[0], hand[1], 24, 24, sd + 371, t));
          man.add('ink', inkPath(circ(hand[0], hand[1], 24, 10), { seed: sd + 372, t, w: 5, closed: true }));
          man.flush();
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ cph_mud
  SH.cph_mud = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000, mode = P.mode || 'reveal';
      const cam = el(svg, 'g');
      const water = mk(cam, INK.paperDark, { 'fill-opacity': 0.85 }), deep = mk(cam, INK.inkSoft, { 'fill-opacity': 0.22 });
      const beam = mk(cam, INK.paperLight, { 'fill-opacity': 0.5 }), beam2 = mk(cam, INK.paperLight, { 'fill-opacity': 0.45 });
      const silt = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });
      const wreck = layerSet(cam), mud = layerSet(cam), front = layerSet(cam), cloud = mk(cam, INK.paperDark, { 'fill-opacity': 0.8 }), cloudI = mk(cam, INK.inkSoft);
      const diver = layerSet(cam), ring = mk(cam, INK.red);
      const labG = el(cam, 'g'), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      const r0 = rng(seed * 31 + 7);
      const specks = Array.from({ length: 60 }, () => [r0() * W, r0() * H, 2 + r0() * 4, r0()]);
      // a cannon barrel lying on its side: o {x, y (bottom), L, rot, s}
      function cannon(Lr, sd, t, x, y, L, rot) {
        const c = Math.cos(rot), s = Math.sin(rot), Q = (a, b) => [x + a * c - b * s, y + a * s + b * c];
        const R0 = L * 0.13, R1 = L * 0.085;
        const bar = [Q(-L / 2, -R0 * 2), Q(L / 2, -R0 - R1), Q(L / 2, -R0 + R1 - R0), Q(-L / 2, 0)];
        const body = [Q(-L / 2, 0), Q(-L / 2, -2 * R0), Q(L / 2 - 20, -R0 - R1), Q(L / 2 - 20, -R0 + R1)];
        Lr.add('soft', inkLoop(body, { seed: sd, t, amp: 1, smooth: false }));
        Lr.add('ink', inkPath(body, { seed: sd, t, w: 6, closed: true, amp: 1, smooth: false }));
        const muz = [Q(L / 2 - 20, -R0 - R1 - 10), Q(L / 2 + 6, -R0 - R1 - 10), Q(L / 2 + 6, -R0 + R1 + 10), Q(L / 2 - 20, -R0 + R1 + 10)];
        Lr.add('soft', inkLoop(muz, { seed: sd + 1, t, smooth: false })); Lr.add('ink', inkPath(muz, { seed: sd + 1, t, w: 5, closed: true, smooth: false }));
        Lr.add('ink', inkLoop(circ(...Q(L / 2 + 6, -R0), R1 * 0.7, 10, R1 * 0.85), { seed: sd + 2, t }));
        [-0.25, 0.1].forEach((k, i) => { const a = Q(L * k, -2 * R0 - 6 + (R0 - R1) * (k + 0.5)), b = Q(L * k, 6); Lr.add('ink', inkPath([a, b], { seed: sd + 3 + i, t, w: 7 })); });
        Lr.add('ink', inkLoop(circ(...Q(-L / 2 - 22, -R0), R0 * 0.45, 10), { seed: sd + 6, t }));
        Lr.add('green', inkPath([Q(-L * 0.4, -2 * R0 + 8), Q(L * 0.3, -R0 - R1 + 8)], { seed: sd + 7, t, w: 5 }));
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const fl = (P.floor ?? 0.56) * H;
          const ha = mode === 'reveal' ? atOr(cues, 'hit', dur * 0.4) : -5, pw = mode === 'reveal' ? spring(lt, ha, 1.0) : 1, hit = punch(lt, ha, 0.8);
          const fa = mode === 'find' ? atOr(cues, 'find', dur * 0.5) : null;
          const C = P.cam || {};
          MCB.camPush(cam, lt, dur, W, H, { zoom: C.zoom ?? 1.05, focus: C.focus || [0.5, 0.55] }, hit);
          water.setAttribute('d', `M-60 -60 L${W + 60} -60 L${W + 60} ${H + 60} L-60 ${H + 60} Z`);
          deep.setAttribute('d', inkLoop([[-60, fl - 260], [W + 60, fl - 300], [W + 60, H + 60], [-60, H + 60]], { seed: sd + 2, t, amp: 2 }));
          // diver + torch geometry
          const D = P.diver || {}, s = D.s ?? 1.25;
          const dx = (D.x ?? 0.3) * W + Math.sin(t * 0.7) * 10, dyy = (D.y ?? 0.4) * H + Math.sin(t * 1.1) * 8;
          const jaw = P.jaw || {}, jx = (jaw.x ?? 0.62) * W, jy = fl + (jaw.dy ?? 70);
          const target = mode === 'find' ? [jx, jy] : [W * (0.55 + Math.sin(t * 0.8) * 0.15), fl - 40];
          const tx = dx + 120 * s, ty = dyy + 30 * s;
          const ang = Math.atan2(target[1] - ty, target[0] - tx), Lb = Math.hypot(target[0] - tx, target[1] - ty) + 200, spread = 0.3;
          const bm = [[tx, ty], [tx + Math.cos(ang - spread) * Lb, ty + Math.sin(ang - spread) * Lb], [tx + Math.cos(ang) * Lb * 1.05, ty + Math.sin(ang) * Lb * 1.05], [tx + Math.cos(ang + spread) * Lb, ty + Math.sin(ang + spread) * Lb]];
          beam.setAttribute('d', inkLoop(bm, { seed: sd + 5, t, amp: 2 }));
          const bm2 = [[tx, ty], [tx + Math.cos(ang - spread * 0.45) * Lb * 0.9, ty + Math.sin(ang - spread * 0.45) * Lb * 0.9], [tx + Math.cos(ang + spread * 0.45) * Lb * 0.9, ty + Math.sin(ang + spread * 0.45) * Lb * 0.9]];
          beam2.setAttribute('d', inkLoop(bm2, { seed: sd + 6, t, amp: 2 }));
          silt.setAttribute('d', specks.map(([x, y, r, v], i) => { const xx = (x + t * (8 + v * 14)) % W, yy = (y + Math.sin(t * 0.6 + i) * 20 - t * 6 * v + H) % H; return inkDot(xx, yy, r, r * 0.8, sd + 10 + i, t, 0.4); }).join(' '));
          // wreck hull side: keel, curved frames with broken tops, two strakes of planking (rises from the mud on `hit`)
          const wx = W * (P.wreck_x ?? 0.52), ws = P.wreck_scale ?? 1, sink = (1 - pw) * 220;
          const WP = (u, v) => [wx + u * ws, fl + 10 - v * ws + sink];
          const keel = [WP(-470, 0), WP(470, 18), WP(470, 44), WP(-470, 30)];
          wreck.add('ink', inkLoop(keel, { seed: sd + 100, t, amp: 1, smooth: false }));
          [-400, -300, -200, -100, 0, 100, 200, 300, 400].forEach((u, i) => {
            const h = 250 + Math.sin(i * 2.1) * 70 - Math.abs(u) * 0.12, bend = 46, wd = 30;
            const brk = (hsh(i, 4) - 0.5) * 40;
            const fr = [WP(u - wd / 2, 10), WP(u - wd / 2 - bend * 0.6, h * 0.5), WP(u - wd / 2 - bend, h - 12 + brk), WP(u + wd / 2 - bend + 8, h + 14 - brk), WP(u + wd / 2 - bend * 0.6 + 4, h * 0.5), WP(u + wd / 2, 10)];
            wreck.add(i % 2 ? 'dark' : 'soft', inkLoop(fr, { seed: sd + 110 + i, t, amp: 1, smooth: false }));
            wreck.add('ink', inkPath(fr, { seed: sd + 110 + i, t, w: 5, closed: true, amp: 1, smooth: false }));
            for (let k = 0; k < 3; k++) { const v = h * (0.25 + k * 0.22); wreck.add('ink', inkPath([WP(u - 8 - bend * v / h * 0.7, v), WP(u + 4 - bend * v / h * 0.7, v + 10)], { seed: sd + 120 + i * 3 + k, t, w: 3 })); }
          });
          [[40, 70], [120, 150]].forEach(([a, b], k) => {
            const pl = [WP(-460, a), WP(380 - k * 160, a + 10), WP(380 - k * 160, b + 10), WP(-460, b)];
            wreck.add('dark', inkLoop(pl, { seed: sd + 150 + k, t, amp: 1, smooth: false }));
            wreck.add('ink', inkPath(pl, { seed: sd + 150 + k, t, w: 5, closed: true, amp: 1, smooth: false }));
          });
          wreck.flush();
          // mud with strata down to the frame bottom
          const top = []; for (let i = 0; i <= 18; i++) { const x = -60 + i * (W + 120) / 18; top.push([x, fl + 40 + Math.sin(i * 1.3) * 14]); }
          mud.add('stain', inkLoop(top.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 200, t, amp: 1.2, smooth: false }));
          mud.add('ink', inkPath(top, { seed: sd + 201, t, w: 7, amp: 1.2 }));
          for (let r = 0; r < 8; r++) { const y = fl + 150 + r * (H - fl) / 8; const pts = []; for (let i = 0; i <= 8; i++) pts.push([-40 + i * (W + 80) / 8, y + Math.sin(i * 1.1 + r) * 10]); mud.add('soft', inkPath(pts, { seed: sd + 210 + r, t, w: 3 })); }
          mud.flush();
          // objects lying on / in the mud (fill the lower frame)
          const cy = fl + 40;
          cannon(front, sd + 300, t, wx - (P.cannons || [300, 330])[0] * ws, cy + 20, 330, -0.04);
          cannon(front, sd + 320, t, wx + (P.cannons || [300, 330])[1] * ws, cy + 34, 300, 0.07);
          const balls = [[0.08, 0.2], [0.14, 0.22], [0.11, 0.17], [0.94, 0.14], [0.88, 0.3], [0.35, 0.42], [0.7, 0.55], [0.22, 0.7], [0.82, 0.78]];
          balls.forEach(([u, v], i) => { const bx = u * W, by = cy + 40 + v * (H - cy - 120); front.add('ink', inkLoop(circ(bx, by, 26, 12), { seed: sd + 340 + i, t })); front.add('light', inkDot(bx - 8, by - 8, 6, 5, sd + 350 + i, t)); });
          // bar shot
          { const a = [W * 0.6, cy + 330], b = [W * 0.72, cy + 300]; front.add('ink', inkPath([a, b], { seed: sd + 360, t, w: 10 })); front.add('ink', inkLoop(circ(a[0], a[1], 24, 10), { seed: sd + 361, t })); front.add('ink', inkLoop(circ(b[0], b[1], 24, 10), { seed: sd + 362, t })); }
          // loose planks
          [[0.18, 0.5, 0.12, 170], [0.62, 0.68, -0.08, 210], [0.4, 0.88, 0.05, 240]].forEach(([u, v, rot, L], i) => {
            const px = u * W, py = cy + 40 + v * (H - cy - 120), c = Math.cos(rot), sn = Math.sin(rot);
            const pl = [[px - c * L + sn * 18, py - sn * L - c * 18], [px + c * L + sn * 18, py + sn * L - c * 18], [px + c * L - sn * 18, py + sn * L + c * 18], [px - c * L - sn * 18, py - sn * L + c * 18]];
            front.add('dark', inkLoop(pl, { seed: sd + 370 + i, t, smooth: false })); front.add('ink', inkPath(pl, { seed: sd + 370 + i, t, w: 5, closed: true, smooth: false }));
            front.add('soft', inkPath([[px - c * L * 0.8, py - sn * L * 0.8], [px + c * L * 0.8, py + sn * L * 0.8]], { seed: sd + 375 + i, t, w: 3 }));
          });
          // shoe (buckled) and a clay pipe
          { const sx = W * 0.2, sy = cy + 230; const sh = [[sx - 80, sy], [sx + 40, sy - 10], [sx + 90, sy + 14], [sx + 84, sy + 40], [sx - 84, sy + 40], [sx - 90, sy + 20]]; front.add('soft', inkLoop(sh, { seed: sd + 380, t })); front.add('ink', inkPath(sh, { seed: sd + 380, t, w: 6, closed: true })); front.add('ink', inkPath([[sx - 84, sy + 40], [sx - 60, sy + 54], [sx - 30, sy + 40]], { seed: sd + 381, t, w: 8 })); front.add('gold', inkLoop([[sx - 6, sy - 6], [sx + 26, sy - 9], [sx + 26, sy + 10], [sx - 6, sy + 12]], { seed: sd + 382, t, smooth: false })); }
          { const px = W * 0.78, py = cy + 520; front.add('light', inkPath([[px - 120, py + 10], [px + 40, py - 6]], { seed: sd + 390, t, w: 14 })); front.add('ink', inkPath([[px - 120, py + 10], [px + 40, py - 6]], { seed: sd + 391, t, w: 4 })); const bowl = [[px + 30, py - 8], [px + 34, py - 60], [px + 80, py - 62], [px + 74, py - 4]]; front.add('light', inkLoop(bowl, { seed: sd + 392, t })); front.add('ink', inkPath(bowl, { seed: sd + 392, t, w: 5, closed: true })); }
          // the jawbone (find): side view of a mandible, teeth on top, ramus at the back
          if (mode === 'find') {
            const k = jaw.s ?? 1.2, Jx = (u, v) => [jx + u * k, jy + v * k];
            const jb = [Jx(-110, -10), Jx(-86, -94), Jx(-66, -108), Jx(-52, -92), Jx(-58, -40), Jx(60, -34), Jx(100, -30), Jx(110, -10), Jx(96, 10), Jx(30, 18), Jx(-60, 20), Jx(-104, 12)];
            front.add('light', inkLoop(jb, { seed: sd + 400, t, amp: 0.8 }));
            front.add('ink', inkPath(jb, { seed: sd + 400, t, w: 6, closed: true, amp: 0.8 }));
            for (let i = 0; i < 8; i++) { const u = -44 + i * 19; const tooth = [Jx(u - 6, -36), Jx(u - 5, -56), Jx(u + 6, -58), Jx(u + 7, -35)]; front.add('light', inkLoop(tooth, { seed: sd + 410 + i, t, smooth: false })); front.add('ink', inkPath(tooth, { seed: sd + 410 + i, t, w: 4, closed: true, smooth: false })); }
            front.add('soft', inkPath([Jx(-80, -60), Jx(-70, -20)], { seed: sd + 420, t, w: 3 }));
            if (fa != null && lt >= fa) {
              const pf = clamp01((lt - fa) / 0.7), rp = [], n = 30;
              for (let i = 0; i <= Math.round(n * 1.12 * pf); i++) { const a = -2.4 + i / n * 6.2832, rr = 1 + i / n * 0.08; rp.push([jx + Math.cos(a) * 175 * k * rr, jy - 40 * k + Math.sin(a) * 105 * k * rr]); }
              ring.setAttribute('d', rp.length > 1 ? inkPath(rp, { seed: sd + 430, t, w: 10, amp: 1.2 }) : '');
            } else ring.setAttribute('d', '');
          } else ring.setAttribute('d', '');
          front.flush();
          // silt cloud as the wreck rises (reveal only)
          const cq = mode === 'reveal' ? lt - ha : -1;
          if (cq >= 0 && cq < 3) {
            let d = '', di = '';
            for (let j = 0; j < 9; j++) {
              const a = j / 9 * 6.2832, rr = 80 + cq * 160, a2 = Math.max(0, 1 - cq / 3), cx = wx + Math.cos(a) * rr * 1.6, cy2 = fl - 20 + Math.sin(a) * rr * 0.4 - cq * 30, r = (60 + cq * 40) * a2;
              if (r < 4) continue;
              const pts = circ(cx, cy2, r, 10, r * 0.7);
              d += inkLoop(pts, { seed: sd + 450 + j, t, amp: 3 }) + ' '; di += inkPath(pts, { seed: sd + 450 + j, t, w: 3, closed: true, amp: 3 }) + ' ';
            }
            cloud.setAttribute('d', d); cloudI.setAttribute('d', di);
          } else { cloud.setAttribute('d', ''); cloudI.setAttribute('d', ''); }
          // diver: head with mask, torso with tank, two legs with fins, arm with torch, bubbles
          {
            const x = dx, y = dyy, kick = Math.sin(t * 3) * 0.25, Q = (u, v) => [x + u * s, y + v * s];
            const tank = [Q(-95, -52), Q(15, -52), Q(15, -28), Q(-95, -28)];
            diver.add('gold', inkLoop(tank, { seed: sd + 500, t, smooth: false })); diver.add('ink', inkPath(tank, { seed: sd + 500, t, w: 5, closed: true, smooth: false }));
            const torso = [Q(-100, -26), Q(30, -30), Q(40, 0), Q(30, 26), Q(-100, 22)];
            diver.add('soft', inkLoop(torso, { seed: sd + 501, t })); diver.add('ink', inkPath(torso, { seed: sd + 501, t, w: 6, closed: true }));
            [[-1, kick], [1, -kick]].forEach(([sg, kk], i) => {
              const hip = Q(-100, sg * 10), knee = Q(-170, sg * 18 + kk * 60), foot = Q(-235, sg * 6 + kk * 110);
              diver.add('ink', inkPath([hip, knee, foot], { seed: sd + 510 + i, t, w: 20 * s }));
              const fin = [foot, Q(-300, sg * 6 + kk * 150 - 26), Q(-305, sg * 6 + kk * 150 + 22)];
              diver.add('blue', inkLoop(fin, { seed: sd + 515 + i, t, smooth: false })); diver.add('ink', inkPath(fin, { seed: sd + 515 + i, t, w: 4, closed: true, smooth: false }));
            });
            diver.add('light', inkLoop(circ(...Q(78, -8), 38 * s, 14), { seed: sd + 520, t })); diver.add('ink', inkPath(circ(...Q(78, -8), 38 * s, 14), { seed: sd + 520, t, w: 6, closed: true }));
            const mk2 = [Q(86, -32), Q(124, -30), Q(126, 6), Q(88, 8)];
            diver.add('blue', inkLoop(mk2, { seed: sd + 521, t, smooth: false })); diver.add('ink', inkPath(mk2, { seed: sd + 521, t, w: 5, closed: true, smooth: false }));
            diver.add('ink', inkPath([Q(60, 26), Q(40, 46), Q(10, 40)], { seed: sd + 522, t, w: 5 }));
            const hand = [tx, ty];
            diver.add('ink', inkPath([Q(20, 10), [lerp(x + 20 * s, tx, 0.5), lerp(y + 10 * s, ty, 0.5) + 24], hand], { seed: sd + 530, t, w: 16 * s }));
            const tc = [[tx - Math.cos(ang) * 44 - Math.sin(ang) * 14, ty - Math.sin(ang) * 44 + Math.cos(ang) * 14], [tx + Math.sin(ang) * 20, ty - Math.cos(ang) * 20], [tx - Math.sin(ang) * 20, ty + Math.cos(ang) * 20], [tx - Math.cos(ang) * 44 + Math.sin(ang) * 14, ty - Math.sin(ang) * 44 - Math.cos(ang) * 14]];
            diver.add('gold', inkLoop(tc, { seed: sd + 531, t, smooth: false })); diver.add('ink', inkPath(tc, { seed: sd + 531, t, w: 5, closed: true, smooth: false }));
            for (let j = 0; j < 6; j++) {
              const ph = (t * 0.6 + j / 6) % 1, bx = x + 110 * s + Math.sin(ph * 8 + j) * 14, by = y - 50 * s - ph * 520, r = 6 + ph * 12;
              if (by < -20) continue;
              diver.add('light', inkLoop(circ(bx, by, r, 10), { seed: sd + 540 + j, t, amp: 0.6 })); diver.add('soft', inkPath(circ(bx, by, r, 10), { seed: sd + 540 + j, t, w: 3, closed: true, amp: 0.6 }));
            }
          }
          diver.flush();
          labels.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ cph_island
  SH.cph_island = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd0 = seed * 1000;
      const cam = el(svg, 'g');
      const surf = (P.surf ?? 0.42) * H, bed = (P.bed ?? 0.6) * H;
      const sea = MCB.sea(el(cam, 'g'), W, H, surf, sd0 + 5, { hatch: 20, bottom: bed + 30, amp: 7 });
      const ground = layerSet(cam), isl = layerSet(cam), top = layerSet(cam);
      const castG = el(cam, 'g'), labG = el(cam, 'g');
      const I = P.island || {}, itop = (I.top ?? 0.37) * H;
      const castList = (P.cast || []).map(c => Object.assign({ y: (itop - 4) / H }, c));
      const cast = MCB.cast(castG, castList, W, H, sd0 + 700), labels = MCB.labels(labG, P.labels, W, H, sd0 + 800);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const C = P.cam || {};
          const ba = P.done ? -10 : atOr(cues, P.build, dur * 0.25), pb = P.done ? 1 : progIO(lt, ba, Math.max(1.2, dur - ba - 0.4));
          MCB.camPush(cam, lt, dur, W, H, { zoom: C.zoom ?? 1.05, focus: C.focus || [0.5, 0.55] }, punch(lt, ba, 0.6));
          sea.update(t);
          // seabed + mud with strata down to the frame bottom
          const bt = []; for (let i = 0; i <= 16; i++) { const x = -60 + i * (W + 120) / 16; bt.push([x, bed + Math.sin(i * 1.5) * 12]); }
          ground.add('stain', inkLoop(bt.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 100, t, amp: 1, smooth: false }));
          ground.add('ink', inkPath(bt, { seed: sd + 101, t, w: 7 }));
          for (let r = 0; r < 8; r++) { const y = bed + 60 + r * (H - bed) / 8; const pts = []; for (let i = 0; i <= 8; i++) pts.push([-40 + i * (W + 80) / 8, y + Math.sin(i + r) * 9]); ground.add('soft', inkPath(pts, { seed: sd + 110 + r, t, w: 3 })); }
          // stones, planks and cannonballs in the deep mud (fills the lower frame)
          for (let i = 0; i < 10; i++) { const x = hsh(i, 11) * W, y = bed + 200 + hsh(i, 12) * (H - bed - 260), rx = 30 + hsh(i, 13) * 40; const st = circ(x, y, rx, 9, rx * 0.6); ground.add(i % 3 ? 'dark' : 'ink', inkLoop(st, { seed: sd + 170 + i, t })); ground.add('ink', inkPath(st, { seed: sd + 170 + i, t, w: 4, closed: true })); }
          [[0.2, 0.35, 0.1], [0.7, 0.62, -0.06]].forEach(([u, v, rot], i) => { const px = u * W, py = bed + 200 + v * (H - bed - 260), L = 190, c = Math.cos(rot), sn = Math.sin(rot); const pl = [[px - c * L + sn * 16, py - sn * L - c * 16], [px + c * L + sn * 16, py + sn * L - c * 16], [px + c * L - sn * 16, py + sn * L + c * 16], [px - c * L - sn * 16, py - sn * L + c * 16]]; ground.add('dark', inkLoop(pl, { seed: sd + 185 + i, t, smooth: false })); ground.add('ink', inkPath(pl, { seed: sd + 185 + i, t, w: 4, closed: true, smooth: false })); });
          // the wreck in the mud: dashed outline + ribs + a cannon
          const wx = ((P.wreck || {}).x ?? 0.55) * W, wy = bed + (P.wreck_dy ?? 50);
          const hull = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * i / 16; hull.push([wx - Math.cos(a) * 280, wy - 30 + Math.sin(a) * 70]); }
          for (let i = 0; i < hull.length - 1; i += 2) ground.add('red', inkPath([hull[i], hull[i + 1]], { seed: sd + 130 + i, t, w: 6 }));
          for (let i = 0; i < 7; i++) { const x = wx - 210 + i * 70, h = 60 + Math.sin(i * 1.7) * 18; ground.add('ink', inkPath([[x, wy + 20], [x - 8, wy - h * 0.5], [x + 4, wy - h]], { seed: sd + 150 + i, t, w: 9 })); }
          ground.add('ink', inkPath([[wx - 250, wy + 30], [wx + 260, wy + 24]], { seed: sd + 160, t, w: 12 }));
          ground.add('ink', inkLoop([[wx + 60, wy - 6], [wx + 200, wy - 16], [wx + 200, wy + 4], [wx + 60, wy + 16]], { seed: sd + 161, t, smooth: false }));
          ground.flush();
          // the island: grows from the seabed up past the surface (left to right)
          const x0 = (I.from ?? -0.05) * W, x1 = (I.to ?? 0.8) * W;
          const grow = clamp01(pb * 1.15), xr = lerp(x0 + 120, x1, clamp01(pb * 1.3)), ytop = lerp(bed - 20, itop, grow);
          if (pb > 0.01) {
            const shape = [[x0, bed + 10], [x0, ytop], [xr - 120, ytop], [xr, Math.min(bed + 10, ytop + (bed - ytop))]];
            const sh = [[x0 - 40, bed + 14], [x0 - 40, ytop], [xr - 140, ytop + 2], [xr - 40, ytop + 60], [xr + 30, bed + 14]];
            isl.add('sand', inkLoop(sh, { seed: sd + 200, t, amp: 1, smooth: false }));
            // sand layers
            for (let r = 1; r < 6; r++) { const y = lerp(ytop, bed, r / 6); if (y <= ytop + 6) continue; const xe = lerp(xr - 140, xr + 30, (y - ytop) / Math.max(1, bed - ytop)); isl.add('soft', inkPath([[x0 + (r % 2) * 120, y], [lerp(x0, xe, 0.5) + r * 30, y + 3]], { seed: sd + 210 + r, t, w: 2.5 })); }
            for (let i = 0; i < 18; i++) { const u = hsh(i, 1), v = hsh(i, 2); const y = lerp(ytop + 20, bed, v), xe = lerp(xr - 140, xr + 30, (y - ytop) / Math.max(1, bed - ytop)); const x = lerp(x0, xe - 30, u); isl.add('soft', inkDot(x, y, 5, 4, sd + 230 + i, t)); }
            // stone revetment on the slope
            for (let i = 0; i < 6; i++) { const k = i / 6, x = lerp(xr - 130, xr + 20, k), y = lerp(ytop + 8, bed, k); isl.add('dark', inkLoop(circ(x + 14, y + 10, 26, 8, 20), { seed: sd + 250 + i, t })); isl.add('ink', inkPath(circ(x + 14, y + 10, 26, 8, 20), { seed: sd + 250 + i, t, w: 4, closed: true })); }
            isl.add('ink', inkPath(sh.slice(1), { seed: sd + 200, t, w: 7, amp: 1, smooth: false }));
            // grass tufts + a little house on top when finished
            if (grow > 0.95) {
              if (P.houses !== false) [0.12, 0.3, 0.72].forEach((u, i) => { const hx = lerp(x0 + 60, xr - 200, u), hw = 70, hh = 60; const hs = [[hx - hw, ytop], [hx - hw, ytop - hh], [hx, ytop - hh - 50], [hx + hw, ytop - hh], [hx + hw, ytop]]; isl.add('light', inkLoop(hs, { seed: sd + 280 + i, t, smooth: false })); isl.add('ink', inkPath(hs, { seed: sd + 280 + i, t, w: 5, closed: true, smooth: false })); isl.add('red', inkLoop([[hx - hw - 8, ytop - hh], [hx, ytop - hh - 54], [hx + hw + 8, ytop - hh], [hx + hw, ytop - hh + 10], [hx - hw, ytop - hh + 10]], { seed: sd + 285 + i, t, smooth: false })); });
              for (let i = 0; i < 6; i++) { const x = lerp(x0 + 40, xr - 180, i / 5); isl.add('green', inkPath([[x - 14, ytop], [x - 4, ytop - 26], [x + 2, ytop], [x + 10, ytop - 22], [x + 16, ytop]], { seed: sd + 270 + i, t, w: 5, smooth: false })); }
            }
          }
          isl.flush();
          // barge + crane dropping sand (while building)
          if (P.barge !== false) {
            const bx = Math.min(W - 160, xr + 230), by = surf + Math.sin(t * 1.4) * 5;
            const hull = [[bx - 150, by - 40], [bx + 150, by - 40], [bx + 120, by + 30], [bx - 120, by + 30]];
            top.add('dark', inkLoop(hull, { seed: sd + 300, t, smooth: false })); top.add('ink', inkPath(hull, { seed: sd + 300, t, w: 6, closed: true, smooth: false }));
            top.add('gold', inkLoop([[bx - 120, by - 40], [bx - 80, by - 90], [bx + 20, by - 96], [bx + 60, by - 40]], { seed: sd + 301, t }));
            const sw = Math.sin(t * 0.8) * 0.06, jx = bx + 90, jy = by - 40, tipX = jx - Math.cos(0.9 + sw) * 340, tipY = jy - Math.sin(0.9 + sw) * 340;
            top.add('ink', inkPath([[jx, jy], [jx + 10, jy - 120]], { seed: sd + 302, t, w: 12 }));
            top.add('ink', inkPath([[jx + 4, jy - 100], [tipX, tipY]], { seed: sd + 303, t, w: 9 }));
            top.add('ink', inkPath([[tipX, tipY], [tipX, tipY + 90]], { seed: sd + 304, t, w: 3 }));
            const gr = [[tipX - 34, tipY + 90], [tipX + 34, tipY + 90], [tipX + 22, tipY + 130], [tipX - 22, tipY + 130]];
            top.add('dark', inkLoop(gr, { seed: sd + 305, t, smooth: false })); top.add('ink', inkPath(gr, { seed: sd + 305, t, w: 5, closed: true, smooth: false }));
            if (!P.done && pb < 0.98) {
              for (let j = 0; j < 10; j++) { const ph = (t * 1.2 + j / 10) % 1, y = tipY + 130 + ph * (Math.max(ytop, surf) - tipY - 120), x = tipX + Math.sin(j * 3 + t) * 16; top.add('soft', inkDot(x, y, 7, 7, sd + 310 + j, t)); }
            }
          }
          top.flush();
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
