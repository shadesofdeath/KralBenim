// hx_halifax: the Halifax Explosion (6 December 1917) in parchment ink (brand/kit/BRAND.md §3, §5; every line boils at
// 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for 01-halifax-patlamasi,
// parametric for any harbour ship fire / collision / blast. Needs mcB__lib.js (window.MCB: cast, labels, camPush).
//
// SHOTS.hx_harbor — side view of a harbour: far shore hills with little houses, water, a near quay the cast stands on.
//   Steamships drawn in ink (hull, bridge, funnel with a band, two masts, portholes).
//   mode "watch"   — a burning ship in the middle distance (flames on the bow, a smoke column) and a big clapboard
//                    house in the foreground whose windows fill with watching faces (P.house, P.faces cue).
//   mode "collide" — ship A (left, facing right) and ship B (right, facing left) close in and touch on cue `hit`
//                    (gold sparks, punch, both shudder); fire starts on ship A's bow on cue `fire`.
//   mode "flee"    — ship A burns; a lifeboat with the crew rows away (P.boat), shout arcs from the boat (cue `shout`).
//   mode "blast"   — ship A burns; a clock dial runs (P.clock) until cue `boom`: flash, fireball, ink shock rings,
//                    mushroom cloud, flying debris, water column, camera shake; the ship is gone.
//   P: {mode, water: 0.47 (waterline of the ships, 0..1 H), quay: 0.6 (ground line of the cast, 0..1 H),
//       ships: [{x: 0.45, L: 380 (px), face: 1|-1, band: "red"|"blue"|null, from: x0 (moves from x0 to x by `hit`),
//                burn: 0|1|cue (on fire from that cue; 1 = burning from the start), barrels: false, wl: 0 (px offset)}],
//       house: {x: 0.62, w: 0.42 (0..1 W), h: 0.25 (wall, 0..1 H)} (watch mode), faces: cue|seconds,
//       boat: {from: 0.5, to: 0.18, y: 0.55, at: 0, dur: 4, crew: [{who, accessory, beard, dx (px), pose, at, then, dir,
//              face, emotion}]}, shouts: cue|seconds (shout arcs from the boat towards the quay),
//       clock: {x: 0.78, y: 0.21, r: 95, from: [8, 45], to: [9, 4]} (blast mode, hands run until boom),
//       ships[].far: {L, wl} (the ship starts smaller and higher, i.e. far away, and grows as it closes in by `hit`),
//       flag: {at, cross, top: -0.5, w: 0.16, h: 0.1} (dashed red ghost flag on ship 0's foremast, crossed out on `cross`),
//       crowd: {n: 7, y: 0.66, from: 0.3, to: 1, r: 44} (backs of watching heads + shoulders in the foreground),
//       cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.06, focus: [0.5, 0.55]}}
//   cues: hit, fire, faces, shout(s), boom, flag.at / flag.cross, plus cast/label "at" names.
//
// SHOTS.hx_end — closing card: a big broken window frame (jagged glass, a tiny burning ship far away through it),
//   giant Fraunces lines above it, one by one (cues l0, l1, ...), the highlight line in a red box, Kaşif beside it.
//   P: {lines: ["Kör eden", "ateş değil,", "merak"], highlight: "merak", y: 0.17, size: 130,
//       window: {x: 0.36, y: 0.6, w: 0.42, h: 0.27}, kasif: {...MCB cast entry}}
//
// SHOTS.hx_hold — cutaway of a cargo steamer: holds packed with drums and "TNT" crates that stack in from cue `fill`,
//   barrels lashed on deck, bridge, funnel, masts; the ship rides at a dashed waterline. Cue `hit` flashes the cargo red.
//   P: {fill: cue|seconds, crate_text: "TNT", cast: [...], labels: [...], cam: {zoom, focus}}   cues: fill, hit, cast/label names.
//
// SHOTS.hx_street — a street of two-storey clapboard houses (Richmond, Halifax), a smoke column over the harbour behind.
//   mode "windows" — faces pop into the windows one by one from cue `faces`; townspeople walk/run toward the harbour (cast).
//   mode "shatter" — the shock front sweeps in from the left on cue `hit`: every window bursts outward in glass shards
//                    as the front passes, the faces drop out of sight, dust, camera shake.
//   mode "after"   — the same houses with broken / boarded windows, ash drifting, figures with bandaged eyes (P.hurt).
//   P: {mode, ground: 0.6, houses: 3, x0: 0.3 (0..1 W, first house), smoke: {x: 0.13} | false, faces: cue,
//       hurt: [{x, pose: "sit"|"idle", face, scale: 0.55, accessory, emotion}], cast, labels, cam}
//   cues: faces, hit, plus cast/label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const J = a => a.filter(Boolean).join(' ');

  // flame tongues standing on (cx, base), width w, height h
  function flamePts(cx, base, w, h, t, seed) {
    const n = 4, pts = [[cx - w / 2, base]];
    for (let i = 0; i < n; i++) {
      const u0 = (i + 0.15) / n, u1 = (i + 0.5) / n, u2 = (i + 0.85) / n;
      const hh = h * (0.55 + 0.45 * Math.abs(Math.sin(seed * 1.7 + i * 2.1))) * (0.82 + 0.18 * Math.sin(t * 9 + i * 1.9 + seed));
      const sway = Math.sin(t * 6 + i + seed) * w * 0.07;
      pts.push([cx - w / 2 + w * u0, base - hh * 0.35], [cx - w / 2 + w * u1 + sway, base - hh], [cx - w / 2 + w * u2, base - hh * 0.4]);
    }
    pts.push([cx + w / 2, base]);
    return pts;
  }
  // smoke column: blobs that rise continuously from (x0, y0), widening; returns [fills, rings]
  function smokeColumn(x0, y0, height, width, t, sd, grow = 1, drift = -0.35, n = 11) {
    const fills = [], rings = [];
    if (grow <= 0.01) return [fills, rings];
    for (let i = 0; i < n; i++) {
      const v = ((i + t * 0.32) % n) / n, vv = v * grow;
      const y = y0 - vv * height;
      const x = x0 + drift * vv * height * 0.6 + Math.sin(i * 2.3 + t * 0.8) * width * 0.12 * vv;
      const r = width * (0.22 + 0.62 * vv) * (v < 0.08 ? v / 0.08 : 1);
      if (r < 4) continue;
      fills.push(inkCircle(x, y, r, sd + i * 3, t, { fill: true, n: 12 }));
      fills.push(inkCircle(x + r * 0.25, y + r * 0.2, r * 0.62, sd + i * 3 + 2, t, { fill: true, n: 10 }));
      if (i % 3 === 0) rings.push(inkCircle(x, y, r, sd + i * 3 + 1, t, { w: 2.5, n: 12 }));
    }
    return [fills, rings];
  }
  const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // ------------------------------------------------------------------ ink steamship (side view)
  // returns path strings into acc: {hull, light, line, band, red, gold, smoke, smokeR}
  function ship(acc, s, t, sd, o = {}) {
    const L = s.L, face = s.face ?? 1, x = s.x, wl = s.wl;
    const roll = (o.roll ?? 0.6) * Math.sin(t * 1.1 + sd) * Math.PI / 180 + (o.tilt || 0);
    const bob = Math.sin(t * 1.3 + sd * 0.7) * 4 + (o.dy || 0);
    const c = Math.cos(roll), sn = Math.sin(roll);
    const T = (u, v) => { const px = face * u * L, py = v * L; return [x + px * c - py * sn, wl + bob + px * sn + py * c]; };
    const TP = pts => pts.map(q => T(q[0], q[1]));
    const hull = TP([[-0.5, -0.13], [0.34, -0.13], [0.35, -0.165], [0.54, -0.175], [0.49, -0.04], [0.45, 0.03], [-0.45, 0.03], [-0.5, -0.03], [-0.52, -0.1]]);
    acc.hull.push(inkLoop(hull, { seed: sd + 1, t, amp: 1.2, smooth: false }));
    acc.line.push(inkPath(hull, { w: 6, seed: sd + 2, t, closed: true, amp: 1.2, smooth: false }));
    // sheer line + portholes
    acc.line.push(inkPath(TP([[-0.48, -0.1], [0.46, -0.115]]), { w: 3, seed: sd + 3, t, amp: 1 }));
    for (let k = 0; k < 7; k++) acc.light.push(inkDot(...T(-0.38 + k * 0.12, -0.06), L * 0.011, L * 0.011, sd + 10 + k, t));
    // bridge house + stern house
    const br = TP([[-0.1, -0.13], [-0.1, -0.23], [0.07, -0.23], [0.07, -0.13]]);
    const st = TP([[-0.48, -0.13], [-0.48, -0.18], [-0.36, -0.18], [-0.36, -0.13]]);
    [br, st].forEach((p, k) => { acc.light.push(inkLoop(p, { seed: sd + 20 + k, t, amp: 1, smooth: false })); acc.line.push(inkPath(p, { w: 5, seed: sd + 22 + k, t, closed: true, amp: 1, smooth: false })); });
    for (let k = 0; k < 3; k++) acc.line.push(inkPath(TP([[-0.07 + k * 0.05, -0.205], [-0.045 + k * 0.05, -0.205]]), { w: 5, seed: sd + 25 + k, t, amp: 0.6 }));
    // funnel with a band
    const fn = TP([[-0.21, -0.13], [-0.2, -0.33], [-0.135, -0.33], [-0.125, -0.13]]);
    acc.hull.push(inkLoop(fn, { seed: sd + 30, t, amp: 1, smooth: false }));
    acc.line.push(inkPath(fn, { w: 5, seed: sd + 31, t, closed: true, amp: 1, smooth: false }));
    if (s.band) acc.band.push({ c: s.band, d: inkLoop(TP([[-0.203, -0.27], [-0.2, -0.3], [-0.135, -0.3], [-0.132, -0.27]]), { seed: sd + 32, t, amp: 0.8, smooth: false }) });
    // masts, booms, stays
    [[0.25, -0.52], [-0.32, -0.48]].forEach(([u, top], k) => {
      acc.line.push(inkPath(TP([[u, -0.13], [u, top]]), { w: 5, seed: sd + 40 + k, t, amp: 1 }));
      acc.line.push(inkPath(TP([[u, top + 0.12], [u + 0.12 * (k ? -1 : 1), -0.15]]), { w: 3, seed: sd + 44 + k, t, amp: 1 }));
      acc.line.push(inkPath(TP([[u - 0.04, top + 0.06], [u + 0.04, top + 0.06]]), { w: 4, seed: sd + 48 + k, t, amp: 0.8 }));
    });
    acc.line.push(inkPath(TP([[0.25, -0.52], [0.53, -0.18]]), { w: 2.5, seed: sd + 50, t, amp: 0.8 }));
    acc.line.push(inkPath(TP([[-0.32, -0.48], [-0.5, -0.14]]), { w: 2.5, seed: sd + 51, t, amp: 0.8 }));
    acc.line.push(inkPath(TP([[0.25, -0.5], [-0.32, -0.46]]), { w: 2.5, seed: sd + 52, t, amp: 0.8 }));
    // deck barrels (benzol drums)
    if (s.barrels) for (let k = 0; k < 6; k++) {
      const u = 0.1 + k * 0.035;
      const b = TP([[u, -0.13], [u, -0.162], [u + 0.028, -0.162], [u + 0.028, -0.13]]);
      acc.light.push(inkLoop(b, { seed: sd + 60 + k, t, amp: 0.6, smooth: false }));
      acc.line.push(inkPath(b, { w: 3, seed: sd + 70 + k, t, closed: true, amp: 0.6, smooth: false }));
    }
    // fire on the bow (f 0..1) + smoke column
    const f = o.burn ?? 0;
    if (f > 0.01) {
      [[0.22, 1], [0.32, 1.25], [0.42, 1.1], [0.12, 0.7]].forEach(([u, k], i) => {
        const [bx, by] = T(u, -0.14), w = L * 0.13 * (0.6 + 0.4 * f), h = L * 0.3 * k * f;
        acc.red.push(inkLoop(flamePts(bx, by + 6, w, h, t, sd + i * 5), { seed: sd + 80 + i, t, amp: 1.5 }));
        acc.gold.push(inkLoop(flamePts(bx, by + 4, w * 0.55, h * 0.55, t * 1.2, sd + i * 5 + 2), { seed: sd + 90 + i, t, amp: 1.2 }));
      });
      const [sx, sy] = T(0.3, -0.3);
      const [fl, rg] = smokeColumn(sx, sy, o.smokeH ?? L * 1.5, L * (o.smokeW ?? 0.42), t, sd + 300, Math.min(1, f * 1.2), o.drift ?? -0.3);
      acc.smoke.push(...fl); acc.smokeR.push(...rg);
    }
    return { T };
  }

  function layers(cam) {
    return {
      skyL: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.6 }),
      farF: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 }), farR: inkEl(cam, INK.inkSoft),
      smoke: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.42 }), smokeR: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }),
      waterF: inkEl(cam, INK.blue, { 'fill-opacity': 0.16 }), waterR: inkEl(cam, INK.inkSoft),
      glow: inkEl(cam, INK.red, { 'fill-opacity': 0.45 }),
    };
  }
  const shipLayers = cam => ({ hull: inkEl(cam, INK.inkSoft), light: inkEl(cam, INK.paperLight), line: inkEl(cam), bandR: inkEl(cam, INK.red), bandB: inkEl(cam, INK.blue),
    red: inkEl(cam, INK.red), gold: inkEl(cam, INK.gold) });

  // ================================================================== hx_harbor
  SH.hx_harbor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1917;
      const mode = P.mode || 'watch';
      const WL = (P.water ?? 0.5) * H, QY = (P.quay ?? 0.6) * H, HZ = WL - 0.075 * H;
      // P.scale: static zoom of the whole harbour around the quay line (bigger ships, the sky stays filled)
      const root = el(svg, 'g', { transform: `translate(${W / 2} ${QY}) scale(${P.scale ?? 1}) translate(${-W / 2} ${-QY})` }), cam = el(root, 'g');
      const Lb = layers(cam);
      const shipsDef = (P.ships || [{ x: 0.45, L: 380, face: 1, band: 'red', burn: 1 }]).map((s, i) => Object.assign({ i }, s));
      const SL = shipLayers(cam);
      const sparks = inkEl(cam, INK.gold), sparkR = inkEl(cam);
      // blast layers
      const BL = { col: inkEl(cam, INK.paperLight), colR: inkEl(cam, INK.inkSoft), cloud: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.78 }), cloudR: inkEl(cam, INK.ink), fireR: inkEl(cam, INK.red), fireG: inkEl(cam, INK.gold),
        flash: inkEl(cam, INK.paperLight), rays: inkEl(cam, INK.gold), rings: inkEl(cam, INK.ink), debris: inkEl(cam, INK.ink) };
      const boatL = { f: inkEl(cam, INK.paperLight), r: inkEl(cam), oars: inkEl(cam), shout: inkEl(cam, INK.red) };
      const boatCastG = el(cam, 'g');
      [boatL.f, boatL.r, boatL.oars, boatL.shout].forEach(n => cam.appendChild(n));   // hull hides the crew's legs
      const flagL = { f: inkEl(cam, INK.red, { 'fill-opacity': 0.25 }), r: inkEl(cam, INK.red), x: inkEl(cam, INK.red) };
      const quayL = { f: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.75 }), r: inkEl(cam), h: inkEl(cam, INK.inkSoft) };
      const houseL = { f: inkEl(cam, INK.paperLight), win: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.85 }), faceF: inkEl(cam, INK.paperLight), faceR: inkEl(cam), r: inkEl(cam), clap: inkEl(cam, INK.inkSoft), roof: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.9 }) };
      const crowdL = { f: inkEl(cam, INK.paperLight), hair: inkEl(cam, INK.inkSoft), r: inkEl(cam) };
      const castG = el(cam, 'g');
      const clockG = el(root, 'g');
      const clockL = { f: inkEl(clockG, INK.paperLight), r: inkEl(clockG), hands: inkEl(clockG, INK.red) };
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const boat = P.boat || null;
      const crew = boat ? (boat.crew || []).map(m => Object.assign({ scale: 0.36, pose: 'idle' }, m)) : [];
      const bcs = boat ? cast(boatCastG, crew, W, H, sd + 500) : null;
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const R = rng(sd + 7);
      const farHouses = Array.from({ length: 16 }, (_, k) => ({ x: (k + 0.2 + R() * 0.5) / 16, w: 26 + R() * 22, h: 22 + R() * 26 }));
      const debris = Array.from({ length: 30 }, () => ({ a: -Math.PI * (0.1 + R() * 0.8), v: 500 + R() * 700, s: 12 + R() * 20, sp: (R() - 0.5) * 12 }));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = atOr(cues, 'hit', mode === 'collide' ? dur * 0.45 : null);
          const fireAt = atOr(cues, 'fire', null);
          const boom = mode === 'blast' ? atOr(cues, 'boom', dur * 0.5) : null;
          const exploded = boom != null && lt >= boom;
          const pk = Math.max(punch(lt, hit, 0.6), punch(lt, boom, 0.8));
          const shake = boom != null && lt >= boom ? Math.exp(-(lt - boom) * 2.2) : hit != null && lt >= hit ? Math.exp(-(lt - hit) * 6) * 0.4 : 0;
          camPush(cam, lt, dur, W, H, P.cam || {}, pk, shake);

          // sky hatching + far shore (Dartmouth hills, little houses)
          const sky = [];
          for (let k = 0; k < 7; k++) { const y = H * 0.17 + k * 26, x0 = ((k * 173 + t * 12) % (W + 400)) - 200; sky.push(inkPath([[x0, y], [x0 + 90, y - 4], [x0 + 170, y]], { w: 3, seed: sd + 600 + k, t, amp: 1 })); }
          Lb.skyL.setAttribute('d', J(sky));
          const hill = [[-40, HZ + 30]];
          for (let x = -40; x <= W + 40; x += 60) hill.push([x, HZ - 40 - 36 * Math.sin(x * 0.006 + 1.2) - 18 * Math.sin(x * 0.017)]);
          hill.push([W + 40, HZ + 30]);
          Lb.farF.setAttribute('d', inkLoop(hill, { seed: sd + 610, t, amp: 1 }));
          const farR = [inkPath(hill.slice(1, -1), { w: 4, seed: sd + 611, t, amp: 1.2 })];
          farHouses.forEach((fh, k) => {
            const x = fh.x * W, base = HZ - 30 - 36 * Math.sin(x * 0.006 + 1.2) - 18 * Math.sin(x * 0.017) + 34;
            farR.push(inkPath([[x, base], [x, base - fh.h], [x + fh.w / 2, base - fh.h - 14], [x + fh.w, base - fh.h], [x + fh.w, base]], { w: 3, seed: sd + 620 + k, t, amp: 0.8, smooth: false }));
          });
          Lb.farR.setAttribute('d', J(farR));
          // water
          const wpts = [];
          for (let x = -40; x <= W + 40; x += 40) wpts.push([x, HZ + 6 * Math.sin(x * 0.02 + t * 1.4)]);
          Lb.waterF.setAttribute('d', inkLoop(wpts.concat([[W + 40, QY + 10], [-40, QY + 10]]), { seed: sd + 630, t, amp: 0.8, smooth: false }));
          const wr = [inkPath(wpts, { w: 4, seed: sd + 631, t, amp: 1 })];
          for (let k = 0; k < 16; k++) {
            const yy = HZ + 30 + (k % 8) * (QY - HZ - 50) / 8, len = 60 + (k * 37 % 70), xx = ((k * 211 + t * (16 + k % 5 * 4)) % (W + 300)) - 150;
            wr.push(inkPath([[xx, yy], [xx + len / 2, yy - 6 * Math.sin(t * 2 + k)], [xx + len, yy]], { w: 3, seed: sd + 640 + k, t, amp: 1 }));
          }
          Lb.waterR.setAttribute('d', J(wr));

          // ships
          const acc = { hull: [], light: [], line: [], band: [], red: [], gold: [], smoke: [], smokeR: [] };
          const glow = [];
          let ship0 = null;
          shipsDef.forEach((s, i) => {
            if (exploded && i === 0) return;
            let x = s.x;
            if (s.from != null && hit != null) x = lerp(s.from, s.x, progIO(lt, 0, Math.max(0.3, hit)));
            const recoil = hit != null && lt >= hit ? Math.sin(Math.min(1, (lt - hit) * 3) * Math.PI) * 10 * -(s.face ?? 1) : 0;
            let burn = 0;
            if (s.burn === true || s.burn === 1) burn = 1;
            else if (s.burn != null && s.burn !== false && s.burn !== 0) {
              const b0 = atOr(cues, s.burn, s.burn === 'fire' ? fireAt : null);
              if (b0 != null) burn = clamp01((lt - b0) / 0.6);
            }
            if (boom != null && i === 0) burn = lt < boom ? 1 + 0.4 * clamp01(lt / boom) : 0;
            let Ls = s.L ?? 380, wls = s.wl || 0;
            if (s.far && hit != null) { const ap = progIO(lt, 0, Math.max(0.3, hit)); Ls = lerp(s.far.L ?? Ls * 0.6, Ls, ap); wls = lerp(s.far.wl ?? -40, wls, ap); }
            const sh = { x: x * W + recoil, wl: WL + wls, L: Ls, face: s.face ?? 1, band: s.band, barrels: s.barrels };
            const shp = ship(acc, sh, t, sd + 1000 + i * 97, { smokeW: s.smokeW, burn: Math.min(1.4, burn), roll: hit != null && lt >= hit && lt < hit + 0.8 ? 2.5 : 0.6, smokeH: s.smokeH ?? (sh.L * 1.6), drift: s.drift });
            if (i === 0) ship0 = { T: shp.T, sh };
            if (burn > 0.05) for (let k = 0; k < 3; k++) {
              const gx = sh.x + sh.face * sh.L * (0.25 + k * 0.08), gy = WL + 30 + k * 26;
              glow.push(inkPath([[gx - 50, gy], [gx, gy + 3], [gx + 50, gy]], { w: 7 * Math.min(1, burn), seed: sd + 650 + k + i * 9, t, amp: 1.5 }));
            }
          });
          Lb.smoke.setAttribute('d', J(acc.smoke)); Lb.smokeR.setAttribute('d', J(acc.smokeR));
          Lb.glow.setAttribute('d', J(glow));
          SL.hull.setAttribute('d', J(acc.hull)); SL.light.setAttribute('d', J(acc.light)); SL.line.setAttribute('d', J(acc.line));
          SL.bandR.setAttribute('d', J(acc.band.filter(b => b.c === 'red').map(b => b.d)));
          SL.bandB.setAttribute('d', J(acc.band.filter(b => b.c !== 'red').map(b => b.d)));
          SL.red.setAttribute('d', J(acc.red)); SL.gold.setAttribute('d', J(acc.gold));

          // missing danger flag on the foremast: dashed red ghost flag, crossed out on its cue
          if (P.flag && ship0) {
            const fa = atOr(cues, P.flag.at, 0.3), fp = clamp01((lt - fa + 0.8) / 0.5), xa = atOr(cues, P.flag.cross, null);
            const T = ship0.T, wave = k => Math.sin(t * 5 + k * 1.3) * 0.012;
            const top = P.flag.top ?? -0.5, fw = P.flag.w ?? 0.16, fh = P.flag.h ?? 0.1;
            const pts = [T(0.25, top), T(0.25 + fw * 0.5, top + wave(1)), T(0.25 + fw, top + 0.01 + wave(2)), T(0.25 + fw, top + fh + wave(3)), T(0.25 + fw * 0.5, top + fh + wave(4)), T(0.25, top + fh)];
            const dashes = [];
            if (fp > 0) for (let k = 0; k < pts.length; k++) {
              const a = pts[k], b = pts[(k + 1) % pts.length];
              for (let j = 0; j < 3; j++) { const u0 = j / 3, u1 = u0 + 0.18; dashes.push(inkPath([[lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)], [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1)]], { w: 6, seed: sd + 1500 + k * 3 + j, t, amp: 0.6 })); }
            }
            flagL.f.setAttribute('d', fp > 0 ? inkLoop(pts, { seed: sd + 1520, t, amp: 0.8, smooth: false }) : '');
            flagL.r.setAttribute('d', J(dashes));
            if (xa != null && lt >= xa) {
              const c = [(pts[0][0] + pts[3][0]) / 2, (pts[0][1] + pts[3][1]) / 2], r = ship0.sh.L * fw * 0.75 * (1 + 0.25 * punch(lt, xa, 0.5)), q = prog(lt, xa, 0.3);
              flagL.x.setAttribute('d', J([inkPath([[c[0] - r, c[1] - r], [c[0] - r + 2 * r * q, c[1] - r + 2 * r * q]], { w: 14, seed: sd + 1530, t, amp: 1 }),
                q > 0.5 ? inkPath([[c[0] + r, c[1] - r], [c[0] + r - 2 * r * (q * 2 - 1), c[1] - r + 2 * r * (q * 2 - 1)]], { w: 14, seed: sd + 1531, t, amp: 1 }) : '']));
            } else flagL.x.setAttribute('d', '');
          }

          // collision sparks
          if (hit != null && lt >= hit && lt < hit + 1.4 && shipsDef.length > 1) {
            const s0 = shipsDef[0], cx = (s0.x * W) + (s0.face ?? 1) * (s0.L ?? 380) * 0.5, cy = WL - (s0.L ?? 380) * 0.12;
            const u = (lt - hit) / 1.4, sp = [], spr = [];
            for (let k = 0; k < 12; k++) {
              const a = -Math.PI * (0.05 + 0.9 * ((k * 0.618) % 1)), d = 30 + u * (160 + (k % 4) * 50);
              const px = cx + Math.cos(a) * d, py = cy + Math.sin(a) * d + u * u * 180, r = 9 * (1 - u) + 2;
              sp.push(inkDot(px, py, r, r, sd + 700 + k, t));
            }
            const st = [];
            for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, rr = k % 2 ? 26 : 64; st.push([cx + Math.cos(a) * rr * (1 + 0.5 * u), cy + Math.sin(a) * rr * (1 + 0.5 * u)]); }
            sp.push(inkLoop(st, { seed: sd + 720, t, amp: 1, smooth: false }));
            spr.push(inkPath(st, { w: 4, seed: sd + 721, t, amp: 1, closed: true, smooth: false }));
            sparks.setAttribute('d', u < 0.7 ? J(sp) : J(sp.slice(0, 12)));
            sparkR.setAttribute('d', u < 0.7 ? J(spr) : '');
          } else { sparks.setAttribute('d', ''); sparkR.setAttribute('d', ''); }

          // blast
          if (boom != null) {
            const s0 = shipsDef[0], bx = s0.x * W, by = WL - (s0.L ?? 380) * 0.1, u = lt - boom;
            if (u >= 0) {
              const fr = Math.min(1, u / 0.3);
              const R0 = lerp(40, W * 0.34, Math.pow(fr, 0.6));
              BL.flash.setAttribute('d', u < 0.16 ? inkCircle(bx, by, lerp(80, W * 0.5, u / 0.16), sd + 800, t, { fill: true, n: 16 }) : '');
              const rays = [];
              for (let k = 0; k < 14; k++) {
                const a = k / 14 * Math.PI * 2 + 0.1, r1 = R0 * 0.9, r2 = R0 * (1.5 + 0.4 * ((k * 0.37) % 1)) * Math.min(1, u / 0.3);
                rays.push(inkLoop([[bx + Math.cos(a - 0.07) * r1, by + Math.sin(a - 0.07) * r1], [bx + Math.cos(a) * r2, by + Math.sin(a) * r2], [bx + Math.cos(a + 0.07) * r1, by + Math.sin(a + 0.07) * r1]], { seed: sd + 810 + k, t, amp: 1.5, smooth: false }));
              }
              BL.rays.setAttribute('d', u < 1.6 ? J(rays) : '');
              // mushroom cloud: stem + cap that climb and widen
              const cl = [], clr = [], up = Math.min(1, u / 0.45);
              const top = by - lerp(80, H * 0.34, Math.pow(up, 0.6));
              for (let k = 0; k < 9; k++) {
                const v = k / 8, y = lerp(by, top, v), r = lerp(R0 * 0.45, R0 * 0.32, v) * (0.9 + 0.1 * Math.sin(t * 2 + k));
                cl.push(inkCircle(bx + Math.sin(k * 1.7 + t) * 14, y, r, sd + 830 + k, t, { fill: true, n: 12 }));
              }
              for (let k = 0; k < 9; k++) {
                const a = k / 9 * Math.PI * 2 + t * 0.2, rx = lerp(R0 * 0.4, R0 * 1.05, up), ry = rx * 0.45;
                const cx = bx + Math.cos(a) * rx * 0.7, cy = top + Math.sin(a) * ry * 0.6, r = rx * 0.42;
                cl.push(inkCircle(cx, cy, r, sd + 850 + k, t, { fill: true, n: 12 }));
                if (k % 2 === 0) clr.push(inkCircle(cx, cy, r, sd + 870 + k, t, { w: 4, n: 12 }));
              }
              BL.cloud.setAttribute('d', J(cl)); BL.cloudR.setAttribute('d', J(clr));
              // fireball inside the cloud
              const fb = R0 * (u < 0.6 ? 1 : lerp(1, 0.55, Math.min(1, (u - 0.6) / 1.5)));
              const puff = (cx, cy, r, k0, n = 16) => { const pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, rr = r * (1 + 0.14 * Math.sin(k * 2.7 + t * 5 + k0) + (k % 2 ? 0.1 : -0.04)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92]); } return inkLoop(pts, { seed: sd + k0, t, amp: 2 }); };
              BL.fireR.setAttribute('d', J([puff(bx, by, fb * 0.75, 890), puff(bx, lerp(by, top, 0.5), fb * 0.42, 891, 12)]));
              BL.fireG.setAttribute('d', J([puff(bx, by - fb * 0.05, fb * 0.45, 892, 12)]));
              // ink shock rings racing out
              const rings = [];
              for (let k = 0; k < 3; k++) { const rr = (u - k * 0.18) * 1500; if (rr > R0 * 1.15 && rr < W * 1.3) rings.push(inkCircle(bx, by, rr, sd + 900 + k, t, { w: 6 - k * 1.5, n: 18, ry: rr * 0.32 })); }
              BL.rings.setAttribute('d', J(rings));
              // debris on arcs
              const dbs = [];
              debris.forEach((d, k) => { if (u > 2.2) return; const px = bx + Math.cos(d.a) * d.v * u, py = by + Math.sin(d.a) * d.v * u + 700 * u * u;
                dbs.push(inkLoop(rectP(px - d.s / 2, py - d.s / 3, d.s, d.s * 0.66).map(q => [px + (q[0] - px) * Math.cos(d.sp * u) - (q[1] - py) * Math.sin(d.sp * u), py + (q[0] - px) * Math.sin(d.sp * u) + (q[1] - py) * Math.cos(d.sp * u)]), { seed: sd + 920 + k, t, amp: 0.6, smooth: false })); });
              BL.debris.setAttribute('d', J(dbs));
              // water column
              const ch = Math.min(1, u / 0.25) * (u < 2.5 ? 1 : Math.max(0, 1 - (u - 2.5)));
              const colP = [[bx - R0 * 1.3, WL + 6], [bx - R0 * 1.1, WL - 150 * ch], [bx - R0 * 0.9, WL - 70 * ch], [bx - R0 * 0.75, WL - 220 * ch], [bx + R0 * 0.8, WL - 210 * ch], [bx + R0 * 0.95, WL - 80 * ch], [bx + R0 * 1.15, WL - 160 * ch], [bx + R0 * 1.35, WL + 6]];
              BL.col.setAttribute('d', ch > 0.02 ? inkLoop(colP, { seed: sd + 950, t, amp: 2 }) : '');
              BL.colR.setAttribute('d', ch > 0.02 ? inkPath(colP, { w: 4, seed: sd + 951, t, amp: 2 }) : '');
            } else Object.values(BL).forEach(n => n.setAttribute('d', ''));
          }

          // lifeboat
          if (boat) {
            const ba = atOr(cues, boat.at, 0), bu = progIO(lt, ba, boat.dur ?? Math.max(1, dur - ba));
            const bxp = lerp(boat.from ?? 0.5, boat.to ?? 0.18, bu), bxx = bxp * W, byy = (boat.y ?? 0.55) * H + Math.sin(t * 2.2) * 4;
            const bw = boat.w ?? 300;
            const hullP = [[bxx - bw / 2, byy - 62], [bxx + bw / 2, byy - 66], [bxx + bw * 0.4, byy + 6], [bxx - bw * 0.4, byy + 6]];
            boatL.f.setAttribute('d', inkLoop(hullP, { seed: sd + 960, t, amp: 1 }));
            boatL.r.setAttribute('d', J([inkPath(hullP, { w: 6, seed: sd + 961, t, amp: 1, closed: true }), inkPath([[bxx - bw * 0.46, byy - 40], [bxx + bw * 0.46, byy - 43]], { w: 3, seed: sd + 962, t, amp: 0.8 })]));
            const ph = t * 4.2, oars = [];
            for (let k = 0; k < 3; k++) {
              const ox = bxx + (k - 1) * 0.3 * bw, sw = Math.sin(ph + k * 0.4);
              oars.push(inkPath([[ox + sw * 40, byy - 120], [ox + sw * 10, byy - 50], [ox - sw * 60, byy + 50 + Math.cos(ph) * 12]], { w: 7, seed: sd + 965 + k, t, amp: 0.8 }));
              oars.push(inkLoop([[ox - sw * 60 - 14, byy + 50], [ox - sw * 60, byy + 30], [ox - sw * 60 + 14, byy + 50], [ox - sw * 60, byy + 78]], { seed: sd + 975 + k, t, amp: 0.6 }));
            }
            boatL.oars.setAttribute('d', J(oars));
            crew.forEach(m => { m.x = (bxx + (m.dx || 0)) / W; m.y = (byy - 4) / H; });
            bcs.update(lt, t, cues);
            const sa = atOr(cues, P.shouts ?? 'shout', null), shouts = [];
            if (sa != null && lt >= sa) for (let k = 0; k < 3; k++) {
              const ph2 = ((lt - sa) * 1.3 + k / 3) % 1, rr = 50 + ph2 * 160;
              const cx = bxx + bw * 0.2, cy = byy - 200;
              const pts = []; for (let j = 0; j <= 6; j++) { const a = -0.7 + j / 6 * 1.4; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
              if (ph2 < 0.9) shouts.push(inkPath(pts, { w: 6 * (1 - ph2) + 1, seed: sd + 970 + k, t, amp: 1 }));
            }
            boatL.shout.setAttribute('d', J(shouts));
          }

          // near quay (stone edge + planks)
          const q = [[-40, QY], [W + 40, QY], [W + 40, H + 20], [-40, H + 20]];
          quayL.f.setAttribute('d', inkLoop(q, { seed: sd + 980, t, amp: 0.8, smooth: false }));
          quayL.r.setAttribute('d', inkPath([[-40, QY], [W * 0.5, QY + 3], [W + 40, QY]], { w: 6, seed: sd + 981, t, amp: 1 }));
          const qh = [];
          for (let k = 0; k < 9; k++) { const y = QY + 26 + k * 36; if (y > H * 0.79) break; for (let j = 0; j < 5; j++) { const x = (j + (k % 2) * 0.5) * W / 4.5 - 30; qh.push(inkPath([[x, y], [x + 110, y + 2]], { w: 3, seed: sd + 1100 + k * 7 + j, t, amp: 1 })); } }
          quayL.h.setAttribute('d', J(qh));

          // watching house (foreground, watch mode)
          if (P.house) {
            const hs = P.house, hx = (hs.x ?? 0.62) * W, hw = (hs.w ?? 0.42) * W, hh = (hs.h ?? 0.25) * H, top = QY - hh;
            const wall = [[hx, QY], [hx, top], [hx + hw, top], [hx + hw, QY]];
            const roof = [[hx - 26, top + 4], [hx + hw * 0.5, top - hw * 0.34], [hx + hw + 26, top + 4]];
            houseL.f.setAttribute('d', inkLoop(wall, { seed: sd + 1200, t, amp: 0.8, smooth: false }));
            houseL.roof.setAttribute('d', inkLoop(roof, { seed: sd + 1201, t, amp: 0.8, smooth: false }));
            const clap = [];
            for (let k = 1; k < 12; k++) { const y = top + k * hh / 12; clap.push(inkPath([[hx + 6, y], [hx + hw - 6, y + 2]], { w: 2.5, seed: sd + 1210 + k, t, amp: 0.8 })); }
            houseL.clap.setAttribute('d', J(clap));
            const ww = hw * 0.26, wh = hh * 0.3, wins = [[hx + hw * 0.14, top + hh * 0.1], [hx + hw * 0.6, top + hh * 0.1], [hx + hw * 0.14, top + hh * 0.55], [hx + hw * 0.6, top + hh * 0.55]];
            const fa = atOr(cues, P.faces, 0);
            const wf = [], rr = [inkPath(wall, { w: 6, seed: sd + 1202, t, amp: 1, closed: true, smooth: false }), inkPath(roof, { w: 6, seed: sd + 1203, t, amp: 1, smooth: false })], ff = [], fr = [];
            wins.forEach(([wx, wy], k) => {
              const wp = rectP(wx, wy, ww, wh);
              wf.push(inkLoop(wp, { seed: sd + 1220 + k, t, amp: 0.8, smooth: false }));
              // faces (two per window), looking left at the fire, brows up
              const fp = spring(lt, fa + k * 0.18, 0.5);
              for (let j = 0; j < 2; j++) {
                const r = ww * 0.2, fx = wx + ww * (0.3 + j * 0.42), fy = wy + wh * 0.62 + (1 - fp) * wh * 0.6 + Math.sin(t * 1.5 + k + j) * 2;
                if (fp < 0.05) continue;
                ff.push(inkCircle(fx, fy, r, sd + 1240 + k * 3 + j, t, { fill: true, n: 12 }));
                ff.push(inkLoop([[fx - r * 1.1, fy + r * 0.9], [fx + r * 1.1, fy + r * 0.9], [fx + r * 1.2, wy + wh], [fx - r * 1.2, wy + wh]], { seed: sd + 1260 + k * 3 + j, t, amp: 0.6, smooth: false }));
                fr.push(inkCircle(fx, fy, r, sd + 1280 + k * 3 + j, t, { w: 4, n: 12 }));
                fr.push(inkDot(fx - r * 0.55, fy - r * 0.05, 4, 4.5, sd + 1300 + k * 4 + j, t), inkDot(fx - r * 0.05, fy - r * 0.05, 4, 4.5, sd + 1301 + k * 4 + j, t));
                fr.push(inkPath([[fx - r * 0.75, fy - r * 0.45], [fx - r * 0.4, fy - r * 0.6]], { w: 3, seed: sd + 1320 + k * 4 + j, t, amp: 0.5 }), inkPath([[fx - r * 0.2, fy - r * 0.6], [fx + r * 0.15, fy - r * 0.45]], { w: 3, seed: sd + 1321 + k * 4 + j, t, amp: 0.5 }));
                fr.push(inkCircle(fx - r * 0.3, fy + r * 0.45, r * 0.14, sd + 1340 + k * 4 + j, t, { w: 3, n: 8 }));
              }
              rr.push(inkPath(wp, { w: 5, seed: sd + 1360 + k, t, amp: 0.8, closed: true, smooth: false }));
              rr.push(inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh * 0.42]], { w: 3, seed: sd + 1370 + k, t, amp: 0.6 }));
              rr.push(inkPath([[wx, wy + wh * 0.42], [wx + ww, wy + wh * 0.42]], { w: 3, seed: sd + 1380 + k, t, amp: 0.6 }));
            });
            // red glow of the fire reflected on the window panes
            houseL.win.setAttribute('d', J(wf)); houseL.faceF.setAttribute('d', J(ff)); houseL.faceR.setAttribute('d', J(fr)); houseL.r.setAttribute('d', J(rr));
          }

          // crowd on the quay seen from behind (they watch the fire)
          if (P.crowd) {
            const C = P.crowd, n = C.n ?? 7, cy = (C.y ?? 0.66) * H, x0 = (C.from ?? 0.3) * W, x1 = (C.to ?? 1) * W, hr = C.r ?? 44;
            const cf = [], ch = [], cr = [];
            for (let k = 0; k < n; k++) {
              const x = lerp(x0, x1, n > 1 ? k / (n - 1) : 0.5) + Math.sin(k * 3.1) * 14, y = cy + (k % 2) * 26 + Math.sin(t * 1.6 + k) * 3, r = hr * (0.88 + 0.12 * ((k * 7) % 3) / 2);
              const sh = [[x - r * 1.9, y + r * 3.2], [x - r * 1.6, y + r * 1.4], [x - r * 0.6, y + r * 0.85], [x + r * 0.6, y + r * 0.85], [x + r * 1.6, y + r * 1.4], [x + r * 1.9, y + r * 3.2]];
              cf.push(inkLoop(sh, { seed: sd + 1600 + k, t, amp: 0.8 }), inkCircle(x, y, r, sd + 1620 + k, t, { fill: true, n: 12 }));
              cr.push(inkPath(sh, { w: 5, seed: sd + 1640 + k, t, amp: 0.8 }), inkCircle(x, y, r, sd + 1660 + k, t, { w: 5, n: 12 }));
              const hair = [[x - r * 1.0, y + r * 0.35], [x - r * 1.0, y - r * 0.2], [x - r * 0.7, y - r * 0.8], [x, y - r * 1.02], [x + r * 0.7, y - r * 0.8], [x + r * 1.0, y - r * 0.2], [x + r * 1.0, y + r * 0.35], [x + r * 0.5, y + r * 0.75], [x - r * 0.5, y + r * 0.75]];
              ch.push(inkLoop(hair, { seed: sd + 1680 + k, t, amp: 0.8 }));
              if (k % 3 === 1) ch.push(inkLoop([[x - r * 1.45, y - r * 0.3], [x - r * 0.9, y - r * 0.55], [x - r * 0.8, y - r * 1.15], [x + r * 0.8, y - r * 1.15], [x + r * 0.9, y - r * 0.55], [x + r * 1.45, y - r * 0.3]], { seed: sd + 1690 + k, t, amp: 0.8 }));
            }
            crowdL.f.setAttribute('d', J(cf)); crowdL.hair.setAttribute('d', J(ch)); crowdL.r.setAttribute('d', J(cr));
          }

          // clock (blast mode)
          if (P.clock) {
            const C = P.clock, cx = (C.x ?? 0.78) * W, cy = (C.y ?? 0.21) * H, r = C.r ?? 95;
            const p0 = spring(lt, 0, 0.5);
            const [h0, m0] = C.from || [8, 45], [h1, m1] = C.to || [9, 4];
            const mins = lerp(h0 * 60 + m0, h1 * 60 + m1, boom != null ? progIO(lt, 0.05, Math.max(0.3, boom * 0.8)) : 1);
            clockG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${(p0 * (1 + 0.15 * punch(lt, boom, 0.6))).toFixed(3)}) rotate(${f1(boom != null && lt > boom ? Math.sin(lt * 30) * 6 * Math.exp(-(lt - boom) * 3) : 0)})`);
            clockL.f.setAttribute('d', inkCircle(0, 0, r, sd + 1400, t, { fill: true }));
            const ticks = [inkCircle(0, 0, r, sd + 1401, t, { w: 7 })];
            for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ticks.push(inkPath([[Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78], [Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9]], { w: 4, seed: sd + 1410 + k, t, amp: 0.5 })); }
            const am = (mins % 60) / 60 * Math.PI * 2 - Math.PI / 2, ah = ((mins / 60) % 12) / 12 * Math.PI * 2 - Math.PI / 2;
            ticks.push(inkPath([[0, 0], [Math.cos(ah) * r * 0.5, Math.sin(ah) * r * 0.5]], { w: 9, seed: sd + 1430, t, amp: 0.5 }));
            clockL.r.setAttribute('d', J(ticks));
            clockL.hands.setAttribute('d', J([inkPath([[0, 0], [Math.cos(am) * r * 0.78, Math.sin(am) * r * 0.78]], { w: 6, seed: sd + 1431, t, amp: 0.5 }), inkDot(0, 0, 9, 9, sd + 1432, t)]));
          }

          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== hx_hold
  SH.hx_hold = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1918;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const portrait = H > W;
      const DY = (portrait ? 0.34 : 0.4) * H, KY = (portrait ? 0.565 : 0.8) * H, WLy = (portrait ? 0.48 : 0.68) * H;
      const X0 = W * 0.05, X1 = W * 0.97;
      const L = {
        waterF: inkEl(cam, INK.blue, { 'fill-opacity': 0.16 }), waterR: inkEl(cam, INK.inkSoft),
        hullF: inkEl(cam, INK.paperLight), hullS: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.5 }),
        cargoF: inkEl(cam, INK.paperDark), cargoL: inkEl(cam, INK.paperLight), cargoR: inkEl(cam), cargoHot: inkEl(cam, INK.red),
        txt: el(cam, 'g'),
        sup: inkEl(cam, INK.paperLight), supD: inkEl(cam, INK.inkSoft), r: inkEl(cam), wl: inkEl(cam, INK.blue),
      };
      const castG = el(cam, 'g');
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      // hull outline (stern left, bow right)
      const hull = [[X0 + 10, DY - 6], [X1 - 120, DY - 6], [X1 - 116, DY - 40], [X1, DY - 52], [X1 - 40, DY + (KY - DY) * 0.5], [X1 - 120, KY], [X0 + 90, KY], [X0 + 20, DY + (KY - DY) * 0.55], [X0, DY + 30]];
      const heads = [X0 + 0.28 * (X1 - X0), X0 + 0.52 * (X1 - X0), X0 + 0.76 * (X1 - X0)];
      // cargo items: per hold, rows from the bottom
      const items = [];
      const holds = [[X0 + 60, heads[0]], [heads[0], heads[1]], [heads[1], heads[2]], [heads[2], X1 - 130]];
      holds.forEach(([a, b], hI) => {
        const crate = hI % 2 === 1, iw = crate ? 112 : 70, ih = crate ? 74 : 92, gap = 8;
        const n = Math.max(1, Math.floor((b - a - 20) / (iw + gap))), rows = Math.floor((KY - DY - 40) / (ih + 4));
        const ox = a + (b - a - n * (iw + gap) + gap) / 2;
        for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) items.push({ hI, crate, x: ox + k * (iw + gap), y: KY - 14 - (r + 1) * (ih + 4), w: iw, h: ih, order: r * 10 + k * 0.6 + hI * 0.3 + r * 0.3 });
      });
      items.sort((p, q) => p.order - q.order);
      const crateText = P.crate_text ?? 'TNT';
      const txts = items.filter(it => it.crate).map(it => {
        const tx = el(L.txt, 'text', { x: it.x + it.w / 2, y: it.y + it.h / 2 + 2, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 44, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red });
        tx.textContent = crateText; return { it, tx };
      });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const fillAt = atOr(cues, P.fill ?? 'fill', 0.1), hit = atOr(cues, 'hit', null), pk = punch(lt, hit, 0.6);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [0.5, 0.45] }, pk);
          const bob = Math.sin(t * 1.2) * 5, rot = Math.sin(t * 0.9) * 0.6;
          const shipG = `translate(0 ${f1(bob)}) rotate(${f1(rot)} ${f1(W / 2)} ${f1(WLy)})`;
          // water behind the hull
          const wp = []; for (let x = -40; x <= W + 40; x += 40) wp.push([x, WLy + 7 * Math.sin(x * 0.02 + t * 1.5)]);
          L.waterF.setAttribute('d', inkLoop(wp.concat([[W + 40, H * 0.79], [-40, H * 0.79]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
          const wr = [inkPath(wp, { w: 4, seed: sd + 2, t, amp: 1 })];
          for (let k = 0; k < 10; k++) { const yy = WLy + 40 + (k % 5) * 50 + (KY > WLy ? 140 : 0), xx = ((k * 233 + t * 20) % (W + 300)) - 150; wr.push(inkPath([[xx, yy], [xx + 50, yy - 5], [xx + 100, yy]], { w: 3, seed: sd + 3 + k, t, amp: 1 })); }
          L.waterR.setAttribute('d', J(wr));
          ['hullF', 'hullS', 'cargoF', 'cargoL', 'cargoR', 'cargoHot', 'sup', 'supD', 'r', 'wl'].forEach(k => L[k].setAttribute('transform', shipG));
          L.txt.setAttribute('transform', shipG); castG.setAttribute('transform', shipG);
          L.hullF.setAttribute('d', inkLoop(hull, { seed: sd + 20, t, amp: 1, smooth: false }));
          // hold walls (shaded strip inside the hull)
          L.hullS.setAttribute('d', J(holds.map(([a, b], k) => inkLoop(rectP(a + 4, DY + 18, b - a - 8, KY - DY - 30), { seed: sd + 30 + k, t, amp: 0.8, smooth: false }))));
          const r = [inkPath(hull, { w: 8, seed: sd + 21, t, amp: 1.2, closed: true, smooth: false })];
          heads.forEach((x, k) => r.push(inkPath([[x, DY - 6], [x, KY]], { w: 5, seed: sd + 40 + k, t, amp: 1 })));
          r.push(inkPath([[X0 + 30, DY + 14], [X1 - 70, DY + 14]], { w: 4, seed: sd + 45, t, amp: 1 }));
          // cargo stacking in
          const cf = [], cl = [], cr = [], hot = [];
          const hotOn = hit != null && lt >= hit;
          items.forEach((it, k) => {
            const a = fillAt + k * Math.min(0.05, 1.8 / items.length), p = spring(lt, a, 0.45);
            if (p < 0.02) { it.vis = 0; return; }
            it.vis = 1;
            const y = it.y - (1 - p) * 90;
            const box = it.crate ? rectP(it.x, y, it.w, it.h) : [[it.x + 6, y], [it.x + it.w - 6, y], [it.x + it.w, y + 8], [it.x + it.w, y + it.h - 8], [it.x + it.w - 6, y + it.h], [it.x + 6, y + it.h], [it.x, y + it.h - 8], [it.x, y + 8]];
            (it.crate ? cl : cf).push(inkLoop(box, { seed: sd + 100 + k, t, amp: 0.6, smooth: false }));
            cr.push(inkPath(box, { w: 4, seed: sd + 400 + k, t, amp: 0.7, closed: true, smooth: false }));
            if (!it.crate) { cr.push(inkPath([[it.x + 2, y + it.h * 0.3], [it.x + it.w - 2, y + it.h * 0.3]], { w: 3, seed: sd + 700 + k, t, amp: 0.5 }), inkPath([[it.x + 2, y + it.h * 0.7], [it.x + it.w - 2, y + it.h * 0.7]], { w: 3, seed: sd + 900 + k, t, amp: 0.5 })); }
            if (hotOn && Math.sin((lt - hit) * 9 + k) > 0.2 && lt - hit < 2.5) hot.push(inkPath(box, { w: 7, seed: sd + 1100 + k, t, amp: 0.8, closed: true, smooth: false }));
          });
          L.cargoF.setAttribute('d', J(cf)); L.cargoL.setAttribute('d', J(cl)); L.cargoR.setAttribute('d', J(cr)); L.cargoHot.setAttribute('d', J(hot));
          txts.forEach(({ it, tx }) => { tx.style.display = it.vis ? '' : 'none'; const p = spring(lt, fillAt + items.indexOf(it) * Math.min(0.05, 1.8 / items.length), 0.45); tx.setAttribute('transform', `translate(0 ${f1(-(1 - p) * 90)})`); });
          // superstructure: bridge, funnel, masts, deck barrels
          const bx0 = X0 + 0.36 * (X1 - X0), bx1 = bx0 + 150;
          const bridge = rectP(bx0, DY - 110, bx1 - bx0, 104);
          const funnel = [[bx0 - 90, DY - 6], [bx0 - 84, DY - 230], [bx0 - 26, DY - 230], [bx0 - 20, DY - 6]];
          const sup = [inkLoop(bridge, { seed: sd + 50, t, amp: 0.8, smooth: false })];
          L.supD.setAttribute('d', J([inkLoop(funnel, { seed: sd + 51, t, amp: 0.8, smooth: false })]));
          r.push(inkPath(bridge, { w: 5, seed: sd + 52, t, amp: 1, closed: true, smooth: false }), inkPath(funnel, { w: 5, seed: sd + 53, t, amp: 1, closed: true, smooth: false }));
          for (let k = 0; k < 4; k++) r.push(inkPath(rectP(bx0 + 14 + k * 34, DY - 92, 22, 26), { w: 3.5, seed: sd + 54 + k, t, amp: 0.6, closed: true, smooth: false }));
          [[X0 + 0.16 * (X1 - X0), DY - 330], [X0 + 0.7 * (X1 - X0), DY - 340]].forEach(([mx, top], k) => {
            r.push(inkPath([[mx, DY - 6], [mx, top]], { w: 6, seed: sd + 60 + k, t, amp: 1 }));
            r.push(inkPath([[mx - 40, top + 50], [mx + 40, top + 50]], { w: 5, seed: sd + 62 + k, t, amp: 0.8 }));
            r.push(inkPath([[mx, top + 80], [mx + (k ? 150 : -120), DY - 20]], { w: 3, seed: sd + 64 + k, t, amp: 0.8 }));
          });
          for (let k = 0; k < 2; k++) for (let j = 0; j < 7; j++) {
            const x = X0 + 0.55 * (X1 - X0) + j * 46 + (k ? 23 : 0), y = DY - 6 - (k + 1) * 52;
            if (k && j === 6) continue;
            const b = [[x + 4, y], [x + 38, y], [x + 42, y + 8], [x + 42, y + 44], [x + 38, y + 52], [x + 4, y + 52], [x, y + 44], [x, y + 8]];
            sup.push(inkLoop(b, { seed: sd + 70 + k * 10 + j, t, amp: 0.5, smooth: false }));
            r.push(inkPath(b, { w: 3.5, seed: sd + 90 + k * 10 + j, t, amp: 0.5, closed: true, smooth: false }));
          }
          L.sup.setAttribute('d', J(sup));
          L.r.setAttribute('d', J(r));
          // dashed waterline across the cutaway
          const dash = [];
          for (let x = X0 + 30; x < X1 - 40; x += 70) dash.push(inkPath([[x, WLy], [x + 36, WLy]], { w: 4, seed: sd + 1500 + x, t, amp: 0.6 }));
          L.wl.setAttribute('d', J(dash));
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== hx_street
  SH.hx_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1919;
      const mode = P.mode || 'windows';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const GY = (P.ground ?? 0.6) * H;
      const Lr = {
        farF: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 }), farR: inkEl(cam, INK.inkSoft),
        smoke: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.42 }), smokeR: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }),
        fireR: inkEl(cam, INK.red), fireG: inkEl(cam, INK.gold),
        groundF: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.75 }), groundR: inkEl(cam), groundH: inkEl(cam, INK.inkSoft),
        houseF: inkEl(cam, INK.paperLight), roof: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.9 }), clap: inkEl(cam, INK.inkSoft),
        win: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.85 }), boards: inkEl(cam, INK.paperDark), faceF: inkEl(cam, INK.paperLight), faceR: inkEl(cam), r: inkEl(cam),
        front: inkEl(cam, INK.inkSoft), dust: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.8 }), shardF: inkEl(cam, INK.paperLight), shardR: inkEl(cam),
        ash: inkEl(cam, INK.inkSoft),
      };
      const hurtG = el(cam, 'g'), castG = el(cam, 'g');
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const R = rng(sd + 9);
      // houses
      const n = P.houses ?? 3, x0 = (P.x0 ?? 0.3) * W, hw = (W * 1.04 - x0) / n;
      const houses = Array.from({ length: n }, (_, k) => ({ x: x0 + k * hw + 6, w: hw - 12, h: H * (0.21 + 0.03 * ((k * 7) % 3)) }));
      const wins = [];
      houses.forEach((h, k) => {
        const top = GY - h.h, ww = h.w * 0.27, wh = h.h * 0.26;
        [[0.14, 0.1], [0.59, 0.1], [0.14, 0.52], [0.59, 0.52]].forEach(([u, v], j) => {
          if (k === 1 && j === 2) return;   // door instead
          wins.push({ k, x: h.x + h.w * u, y: top + h.h * v, w: ww, h: wh, i: wins.length, faces: (k + j) % 3 === 0 ? 2 : 1 });
        });
      });
      const shards = wins.map(w => Array.from({ length: 7 }, () => ({ u: R(), v: R(), vx: 260 + R() * 560, vy: -260 + R() * 360, rot: (R() - 0.5) * 14, s: 22 + R() * 26 })));
      // bandaged figures (after mode)
      const hurt = (P.hurt || []).map((m, i) => {
        const rig = KASIF.create(el(hurtG, 'g'), { scale: m.scale ?? 0.55, hat: false, accessory: m.accessory || null, beard: m.beard || null, seed: sd + 300 + i * 11 });
        const bF = inkEl(rig.node, INK.paperLight), bR = inkEl(rig.node);
        return { m, rig, bF, bR, i };
      });
      const ash = Array.from({ length: 40 }, () => ({ x: R(), y: R(), s: 3 + R() * 4, v: 30 + R() * 40 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = mode === 'shatter' ? atOr(cues, 'hit', dur * 0.35) : null;
          const pk = punch(lt, hit, 0.7), shake = hit != null && lt >= hit ? Math.exp(-(lt - hit) * 2.5) * 0.8 : 0;
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [0.5, 0.5] }, pk, shake);
          // far roofline + harbour smoke
          const far = [[-40, GY - H * 0.06]];
          for (let x = -40; x <= W * 0.5; x += 50) far.push([x, GY - H * 0.1 - ((x / 50) % 3 === 0 ? 40 : (x / 50) % 3 === 1 ? 10 : 26)]);
          far.push([W * 0.5, GY - H * 0.06]);
          Lr.farF.setAttribute('d', inkLoop(far.concat([[W * 0.5, GY], [-40, GY]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
          Lr.farR.setAttribute('d', inkPath(far, { w: 4, seed: sd + 2, t, amp: 1, smooth: false }));
          if (P.smoke !== false) {
            const sx = (P.smoke?.x ?? 0.13) * W, sy = GY - H * 0.15;
            const [fl, rg] = smokeColumn(sx, sy, H * 0.42, 210, t, sd + 50, 1, 0.25, 12);
            if (mode === 'after') { Lr.smoke.setAttribute('d', J(fl.slice(0, 7))); Lr.smokeR.setAttribute('d', J(rg.slice(0, 3))); Lr.fireR.setAttribute('d', ''); Lr.fireG.setAttribute('d', ''); }
            else {
              Lr.smoke.setAttribute('d', J(fl)); Lr.smokeR.setAttribute('d', J(rg));
              const fr = [], fg = [];
              for (let k = 0; k < 3; k++) { fr.push(inkLoop(flamePts(sx - 60 + k * 60, sy + 30, 90, 110 + k * 20, t, sd + k), { seed: sd + 60 + k, t, amp: 1.5 })); fg.push(inkLoop(flamePts(sx - 60 + k * 60, sy + 28, 46, 60, t * 1.2, sd + k + 3), { seed: sd + 70 + k, t, amp: 1.2 })); }
              Lr.fireR.setAttribute('d', J(fr)); Lr.fireG.setAttribute('d', J(fg));
            }
          }
          // street
          Lr.groundF.setAttribute('d', inkLoop([[-40, GY], [W + 40, GY], [W + 40, H + 20], [-40, H + 20]], { seed: sd + 3, t, amp: 0.8, smooth: false }));
          Lr.groundR.setAttribute('d', inkPath([[-40, GY], [W / 2, GY + 3], [W + 40, GY]], { w: 6, seed: sd + 4, t, amp: 1 }));
          const gh = [];
          for (let k = 0; k < 6; k++) for (let j = 0; j < 6; j++) { const y = GY + 30 + k * 40, x = j * W / 5.5 + (k % 2) * 60 - 40; if (y > H * 0.79) continue; gh.push(inkPath([[x, y], [x + 70, y + 2]], { w: 3, seed: sd + 100 + k * 7 + j, t, amp: 1 })); }
          Lr.groundH.setAttribute('d', J(gh));
          // houses
          const hf = [], rf = [], cl = [], rr = [], wf = [], bd = [], ff = [], fr = [];
          houses.forEach((h, k) => {
            const top = GY - h.h, wall = rectP(h.x, top, h.w, h.h), roof = [[h.x - 18, top + 4], [h.x + h.w / 2, top - h.w * 0.36], [h.x + h.w + 18, top + 4]];
            hf.push(inkLoop(wall, { seed: sd + 200 + k, t, amp: 0.8, smooth: false }));
            rf.push(inkLoop(roof, { seed: sd + 210 + k, t, amp: 0.8, smooth: false }));
            rr.push(inkPath(wall, { w: 6, seed: sd + 220 + k, t, amp: 1, closed: true, smooth: false }), inkPath(roof, { w: 6, seed: sd + 230 + k, t, amp: 1, smooth: false }));
            for (let j = 1; j < 11; j++) { const y = top + j * h.h / 11; cl.push(inkPath([[h.x + 6, y], [h.x + h.w - 6, y + 2]], { w: 2.5, seed: sd + 240 + k * 13 + j, t, amp: 0.8 })); }
            if (k === 1) { const d = rectP(h.x + h.w * 0.16, GY - h.h * 0.36, h.w * 0.24, h.h * 0.36); bd.push(inkLoop(d, { seed: sd + 280, t, amp: 0.6, smooth: false })); rr.push(inkPath(d, { w: 5, seed: sd + 281, t, amp: 0.8, closed: true, smooth: false })); }
            // chimney
            const cx = h.x + h.w * 0.7, ch = rectP(cx, top - h.w * 0.3, 34, h.w * 0.22);
            rf.push(inkLoop(ch, { seed: sd + 290 + k, t, amp: 0.6, smooth: false })); rr.push(inkPath(ch, { w: 4, seed: sd + 295 + k, t, amp: 0.8, closed: true, smooth: false }));
          });
          // windows: faces, bursting glass, broken frames
          const fa = atOr(cues, P.faces ?? 'faces', mode === 'windows' ? 0.4 : -5);
          const frontX = hit != null ? (lt - hit) * 1700 - 100 : -1e9;
          const sf = [], sr = [];
          wins.forEach((w, i) => {
            const wp = rectP(w.x, w.y, w.w, w.h);
            const broke = mode === 'after' || (hit != null && frontX > w.x);
            const tb = hit != null ? hit + (w.x + 100) / 1700 : null;
            wf.push(inkLoop(wp, { seed: sd + 300 + i, t, amp: 0.7, smooth: false }));
            // faces
            if (mode !== 'after') {
              const fp = spring(lt, fa + (mode === 'windows' ? i * 0.16 : 0), 0.5);
              const drop = broke ? clamp01((lt - tb) / 0.25) : 0;
              for (let j = 0; j < w.faces; j++) {
                if (fp < 0.05 || drop >= 1) continue;
                const r = w.w * (w.faces === 2 ? 0.19 : 0.24), fx = w.x + w.w * (w.faces === 2 ? 0.3 + j * 0.42 : 0.5), fy = w.y + w.h * 0.6 + (1 - fp) * w.h * 0.6 + drop * w.h * 0.6 + Math.sin(t * 1.4 + i + j) * 2;
                ff.push(inkCircle(fx, fy, r, sd + 400 + i * 3 + j, t, { fill: true, n: 12 }));
                ff.push(inkLoop([[fx - r * 1.1, fy + r * 0.9], [fx + r * 1.1, fy + r * 0.9], [fx + r * 1.2, w.y + w.h], [fx - r * 1.2, w.y + w.h]], { seed: sd + 450 + i * 3 + j, t, amp: 0.6, smooth: false }));
                fr.push(inkCircle(fx, fy, r, sd + 500 + i * 3 + j, t, { w: 4, n: 12 }));
                fr.push(inkDot(fx - r * 0.55, fy - r * 0.05, 4, 4.5, sd + 550 + i * 4 + j, t), inkDot(fx - r * 0.08, fy - r * 0.05, 4, 4.5, sd + 551 + i * 4 + j, t));
                fr.push(inkPath([[fx - r * 0.78, fy - r * 0.45], [fx - r * 0.4, fy - r * 0.62]], { w: 3, seed: sd + 600 + i * 4 + j, t, amp: 0.5 }), inkPath([[fx - r * 0.24, fy - r * 0.62], [fx + r * 0.12, fy - r * 0.45]], { w: 3, seed: sd + 601 + i * 4 + j, t, amp: 0.5 }));
                fr.push(inkCircle(fx - r * 0.3, fy + r * 0.45, r * 0.14, sd + 650 + i * 4 + j, t, { w: 3, n: 8 }));
              }
            }
            if (!broke) {
              rr.push(inkPath(wp, { w: 5, seed: sd + 700 + i, t, amp: 0.8, closed: true, smooth: false }));
              rr.push(inkPath([[w.x + w.w / 2, w.y], [w.x + w.w / 2, w.y + w.h * 0.42]], { w: 3, seed: sd + 760 + i, t, amp: 0.6 }), inkPath([[w.x, w.y + w.h * 0.42], [w.x + w.w, w.y + w.h * 0.42]], { w: 3, seed: sd + 820 + i, t, amp: 0.6 }));
              // pane glint
              rr.push(inkPath([[w.x + w.w * 0.12, w.y + w.h * 0.3], [w.x + w.w * 0.3, w.y + w.h * 0.1]], { w: 2.5, seed: sd + 880 + i, t, amp: 0.4 }));
            } else {
              rr.push(inkPath(wp, { w: 6, seed: sd + 700 + i, t, amp: 1, closed: true, smooth: false }));
              // jagged remnants in the corners
              const jg = (cx, cy, sx, sy, s) => inkPath([[cx, cy + sy * s], [cx + sx * s * 0.35, cy + sy * s * 0.45], [cx + sx * s * 0.6, cy + sy * s * 0.7], [cx + sx * s, cy]], { w: 3.5, seed: sd + 940 + i * 4 + (sx > 0 ? 1 : 0) + (sy > 0 ? 2 : 0), t, amp: 0.6, smooth: false });
              rr.push(jg(w.x, w.y, 1, 1, w.w * 0.4), jg(w.x + w.w, w.y + w.h, -1, -1, w.w * 0.45), jg(w.x + w.w, w.y, -1, 1, w.w * 0.3));
              if (mode === 'after' && i % 3 === 1) {   // boarded up
                [[0.2, -0.12], [0.55, 0.1]].forEach(([v, s], j) => { const b = [[w.x - 10, w.y + w.h * v], [w.x + w.w + 10, w.y + w.h * (v + s)], [w.x + w.w + 10, w.y + w.h * (v + s) + 26], [w.x - 10, w.y + w.h * v + 26]];
                  bd.push(inkLoop(b, { seed: sd + 990 + i * 2 + j, t, amp: 0.6, smooth: false })); rr.push(inkPath(b, { w: 4, seed: sd + 1050 + i * 2 + j, t, amp: 0.6, closed: true, smooth: false })); });
              }
              // flying shards
              if (tb != null && lt >= tb && lt < tb + 1.4) {
                const u = lt - tb;
                shards[i].forEach((s, k) => {
                  const px = w.x + s.u * w.w + s.vx * u, py = w.y + s.v * w.h + s.vy * u + 700 * u * u, sz = s.s * (1 - u / 1.4), a = s.rot * u;
                  const tri = [[0, -sz], [sz * 0.7, sz * 0.6], [-sz * 0.5, sz * 0.4]].map(([qx, qy]) => [px + qx * Math.cos(a) - qy * Math.sin(a), py + qx * Math.sin(a) + qy * Math.cos(a)]);
                  sf.push(inkLoop(tri, { seed: sd + 1100 + i * 7 + k, t, amp: 0.5, smooth: false }));
                  sr.push(inkPath(tri, { w: 3, seed: sd + 1200 + i * 7 + k, t, amp: 0.5, closed: true, smooth: false }));
                });
              }
            }
          });
          Lr.houseF.setAttribute('d', J(hf)); Lr.roof.setAttribute('d', J(rf)); Lr.clap.setAttribute('d', J(cl)); Lr.win.setAttribute('d', J(wf));
          Lr.boards.setAttribute('d', J(bd)); Lr.faceF.setAttribute('d', J(ff)); Lr.faceR.setAttribute('d', J(fr)); Lr.r.setAttribute('d', J(rr));
          Lr.shardF.setAttribute('d', J(sf)); Lr.shardR.setAttribute('d', J(sr));
          // shock front + dust
          if (hit != null && lt >= hit && frontX < W + 300) {
            const fl = [], du = [];
            for (let k = 0; k < 3; k++) {
              const fxk = frontX - k * 70, pts = [];
              for (let y = H * 0.12; y <= GY + 40; y += 60) pts.push([fxk + Math.sin(y * 0.02 + t * 8 + k) * 16, y]);
              fl.push(inkPath(pts, { w: 9 - k * 3, seed: sd + 1300 + k, t, amp: 2 }));
            }
            for (let k = 0; k < 8; k++) { const dx = frontX - 60 - k * 40, dy = GY - 20 - (k % 3) * 40; du.push(inkCircle(dx, dy, 40 + k * 6, sd + 1320 + k, t, { fill: true, n: 10 })); }
            Lr.front.setAttribute('d', J(fl)); Lr.dust.setAttribute('d', J(du));
          } else if (hit != null && lt >= hit) {
            const du = []; const u = lt - hit;
            for (let k = 0; k < 8; k++) du.push(inkCircle(W * (0.1 + k * 0.12) + u * 30, GY - 30 - (k % 3) * 30, (50 + k * 4) * Math.max(0, 1 - (u - 0.8) / 2), sd + 1340 + k, t, { fill: true, n: 10 }));
            Lr.front.setAttribute('d', ''); Lr.dust.setAttribute('d', u < 2.8 ? J(du) : '');
          } else { Lr.front.setAttribute('d', ''); Lr.dust.setAttribute('d', ''); }
          // ash drifting (after mode)
          if (mode === 'after') {
            Lr.ash.setAttribute('d', J(ash.map((a, k) => { const y = ((a.y * H * 0.7 + t * a.v) % (H * 0.7)) + H * 0.1, x = a.x * W + Math.sin(t + k) * 20; return inkDot(x, y, a.s, a.s * 0.8, sd + 1400 + k, t); })));
          }
          // bandaged figures
          hurt.forEach(({ m, rig, bF, bR, i }) => {
            const face = m.face === 'left' ? -1 : 1;
            const a = atOr(cues, m.at, null), pose = a != null && lt >= a && m.then ? m.then : (m.pose || 'idle');
            const res = rig.update(t, pose, { x: m.x * W, y: (m.y ?? (P.ground ?? 0.6)) * H, face, since: a != null && lt >= a ? lt - a : lt, emotion: m.emotion || 'worried', dir: m.dir ?? 20 }) || { head: [0, -470] };
            const hc = res.head, Pp = pts => pts.map(q => [hc[0] + q[0], hc[1] + q[1]]);
            const band = Pp([[-76, -10], [-74, 22], [0, 28], [76, 20], [76, -10], [0, -16]]);
            bF.setAttribute('d', inkLoop(band, { seed: sd + 1500 + i, t, amp: 0.8 }));
            bR.setAttribute('d', J([inkPath(band, { w: 4.5, seed: sd + 1510 + i, t, amp: 0.8, closed: true }), inkPath(Pp([[-74, 4], [-104, -10], [-110, 20]]), { w: 5, seed: sd + 1520 + i, t, amp: 0.8 })]));
          });
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
  // ================================================================== hx_end
  SH.hx_end = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, camPush } = window.MCB;
      const sd = seed * 1000 + 1920;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const Wd = Object.assign({ x: 0.2, y: 0.37, w: 0.47, h: 0.23 }, P.window || {});
      const wx = Wd.x * W, wy = Wd.y * H, ww = Wd.w * W, wh = Wd.h * H;
      const L = { sky: inkEl(cam, INK.paperLight), hz: inkEl(cam, INK.inkSoft), water: inkEl(cam, INK.blue, { 'fill-opacity': 0.16 }),
        smoke: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.42 }), smokeR: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }) };
      const SL = shipLayers(cam);
      const F = { wall: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 }), clap: inkEl(cam, INK.inkSoft), frame: inkEl(cam, INK.paperLight), r: inkEl(cam), glass: inkEl(cam, INK.paperLight, { 'fill-opacity': 0.9 }), glassR: inkEl(cam) };
      const castG = el(cam, 'g');
      const cs = cast(castG, P.kasif ? [Object.assign({ who: 'kasif', x: 0.84, y: 0.6, scale: 0.6, face: 'left' }, P.kasif)] : [], W, H, sd + 200);
      const words = el(root, 'g');
      const size = P.size ?? 130, lh = size * 1.12, y0 = (P.y ?? 0.15) * H;
      const hl = String(P.highlight || '').toLocaleUpperCase(LOCALE);
      const lines = (P.lines || []).map((ln, i) => {
        const g = el(words, 'g'), up = String(ln).toLocaleUpperCase(LOCALE), isH = hl && up.replace(/[^\p{L}]/gu, '') === hl.replace(/[^\p{L}]/gu, '');
        const box = isH ? inkEl(g, INK.red) : null, boxR = isH ? inkEl(g) : null;
        const tx = el(g, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'central',
          fill: isH ? INK.paperLight : INK.ink, style: isH ? '' : `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
        tx.textContent = up;
        let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * up.length * 0.6; }
        const k = Math.min(1, (W * 0.9) / Math.max(1, w + (isH ? 80 : 0)));
        return { g, tx, box, boxR, isH, w, k, i, y: y0 + i * lh * (isH ? 1.08 : 1) };
      });
      const R = rng(sd + 3);
      const panes = [[0, 0], [1, 0], [0, 1], [1, 1]];
      const jag = panes.map(() => Array.from({ length: 3 }, () => [R(), R(), R()]));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const last = atOr(cues, 'l' + (lines.length - 1), null), pk = punch(lt, last, 0.6);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.45, 0.6] }, pk);
          // wall around the window (clapboard strip)
          const wall = rectP(wx - 90, wy - 70, ww + 180, wh + 150);
          F.wall.setAttribute('d', inkLoop(wall, { seed: sd + 1, t, amp: 1, smooth: false }));
          const cl = [];
          for (let k = 0; k < 9; k++) { const y = wy - 50 + k * (wh + 120) / 8; cl.push(inkPath([[wx - 84, y], [wx - 10, y + 1]], { w: 3, seed: sd + 10 + k, t, amp: 0.8 }), inkPath([[wx + ww + 10, y], [wx + ww + 84, y + 1]], { w: 3, seed: sd + 30 + k, t, amp: 0.8 })); }
          F.clap.setAttribute('d', J(cl));
          // view through the window: sky, far shore line, water, a burning ship far away
          L.sky.setAttribute('d', inkLoop(rectP(wx, wy, ww, wh), { seed: sd + 2, t, amp: 0.6, smooth: false }));
          const hz = wy + wh * 0.62;
          const hp = []; for (let x = wx + 4; x <= wx + ww - 4; x += 30) hp.push([x, hz - 12 - 10 * Math.sin(x * 0.02)]);
          L.hz.setAttribute('d', inkPath(hp, { w: 3, seed: sd + 3, t, amp: 0.8 }));
          L.water.setAttribute('d', inkLoop([[wx + 4, hz], [wx + ww - 4, hz], [wx + ww - 4, wy + wh - 4], [wx + 4, wy + wh - 4]], { seed: sd + 4, t, amp: 0.6, smooth: false }));
          const acc = { hull: [], light: [], line: [], band: [], red: [], gold: [], smoke: [], smokeR: [] };
          ship(acc, { x: wx + ww * 0.55, wl: hz + 28, L: ww * 0.42, face: 1, band: 'red' }, t, sd + 50, { burn: 1, smokeH: wh * 0.45, smokeW: 0.3, drift: -0.2, roll: 0.4 });
          L.smoke.setAttribute('d', J(acc.smoke)); L.smokeR.setAttribute('d', J(acc.smokeR));
          SL.hull.setAttribute('d', J(acc.hull)); SL.light.setAttribute('d', J(acc.light)); SL.line.setAttribute('d', J(acc.line));
          SL.bandR.setAttribute('d', J(acc.band.map(b => b.d))); SL.red.setAttribute('d', J(acc.red)); SL.gold.setAttribute('d', J(acc.gold));
          // frame, muntins, sill
          const fr = [], ff = [];
          const outer = rectP(wx - 26, wy - 26, ww + 52, wh + 52);
          ff.push(inkLoop(outer.concat([[wx - 26, wy - 26]]).concat(rectP(wx, wy, ww, wh).reverse()).concat([[wx, wy]]), { seed: sd + 60, t, amp: 0.5, smooth: false }));
          const sill = rectP(wx - 50, wy + wh + 20, ww + 100, 30);
          ff.push(inkLoop(sill, { seed: sd + 61, t, amp: 0.6, smooth: false }));
          fr.push(inkPath(outer, { w: 8, seed: sd + 62, t, amp: 1, closed: true, smooth: false }), inkPath(rectP(wx, wy, ww, wh), { w: 6, seed: sd + 63, t, amp: 1, closed: true, smooth: false }), inkPath(sill, { w: 6, seed: sd + 64, t, amp: 1, closed: true, smooth: false }));
          fr.push(inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { w: 10, seed: sd + 65, t, amp: 0.8 }), inkPath([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], { w: 10, seed: sd + 66, t, amp: 0.8 }));
          F.frame.setAttribute('d', J(ff)); F.r.setAttribute('d', J(fr));
          // jagged glass left in the pane corners + shards on the sill
          const gf = [], gr = [];
          panes.forEach(([c, r], k) => {
            const px = wx + c * ww / 2, py = wy + r * wh / 2, pw = ww / 2, ph = wh / 2, j = jag[k];
            const cx = c ? px + pw : px, cy = r ? py + ph : py, sx = c ? -1 : 1, sy = r ? -1 : 1;
            const shard = [[cx, cy], [cx + sx * pw * (0.45 + 0.3 * j[0][0]), cy], [cx + sx * pw * 0.22, cy + sy * ph * (0.25 + 0.2 * j[0][1])], [cx + sx * pw * 0.12, cy + sy * ph * (0.55 + 0.3 * j[0][2])], [cx, cy + sy * ph * (0.7 + 0.2 * j[1][0])]];
            gf.push(inkLoop(shard, { seed: sd + 70 + k, t, amp: 0.5, smooth: false }));
            gr.push(inkPath(shard.slice(1).concat([shard[0]]), { w: 3.5, seed: sd + 80 + k, t, amp: 0.5, smooth: false }));
          });
          for (let k = 0; k < 6; k++) { const x = wx - 20 + k * (ww + 40) / 5.5, y = wy + wh + 20, s2 = 16 + (k % 3) * 8; const tri = [[x, y], [x + s2 * 1.6, y], [x + s2 * 0.5, y - s2 * (0.7 + 0.2 * Math.sin(k))]];
            gf.push(inkLoop(tri, { seed: sd + 90 + k, t, amp: 0.4, smooth: false })); gr.push(inkPath(tri, { w: 3, seed: sd + 100 + k, t, amp: 0.4, closed: true, smooth: false })); }
          F.glass.setAttribute('d', J(gf)); F.glassR.setAttribute('d', J(gr));
          // words
          lines.forEach(o => {
            const a = atOr(cues, 'l' + o.i, 0.15 + o.i * 0.35), p = spring(lt, a, 0.6), pk2 = punch(lt, a, 0.5);
            if (lt < a) { o.g.style.display = 'none'; return; }
            o.g.style.display = '';
            const s2 = o.k * lerp(1.3, 1, p) * (1 + 0.06 * pk2);
            o.g.setAttribute('transform', `translate(${f1(W / 2)} ${f1(o.y + (1 - p) * 30)}) rotate(${f1(o.isH ? -2 : (1 - p) * (o.i % 2 ? 3 : -3))}) scale(${s2.toFixed(3)})`);
            if (o.box) {
              const bp = rectP(-o.w / 2 - 40, -size * 0.62, o.w + 80, size * 1.24);
              o.box.setAttribute('d', inkLoop(bp, { seed: sd + 200 + o.i, t, amp: 1.2, smooth: false }));
              o.boxR.setAttribute('d', inkPath(bp, { w: 7, seed: sd + 210 + o.i, t, amp: 1.2, closed: true, smooth: false }));
            }
          });
          cs.update(lt, t, cues);
        },
      };
    },
  };
})();
