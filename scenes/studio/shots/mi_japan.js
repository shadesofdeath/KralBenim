// mi_japan: shots for the Stickstory long video "Mongol invasions of Japan, 1274 and 1281" (2026-11-09), parchment ink
// (theme "parchment", brand/kit/BRAND.md §3, §5). Palette tokens only (INK), lines boil at 8 Hz via _ink.js, pure
// function of (seed, lt); no Math.random. Needs mi__lib.js (MI), tz__lib.js (TZ.Shapes) and mcB__lib.js (MCB.cast, MCB.labels).
// Common P: cast: [MCB cast entries] (Kaşif = who "kasif"), labels: [MCB label entries], plus:
//
// SHOTS.mi_bay / SHOTS.mi_storm — side view of a bay full of war junks (mi_storm: storm waves, rain, lightning on).
//   P: {horizon: 0.52 (water top, 0..1 H), island: {x: 0.8, w: 0.3, h: 0.07} | false (far island silhouette),
//       fleet: {n: 26, x0: 0.02, x1: 0.98, y0: 0.53, y1: 0.66, s0: 0.16, s1: 0.32, at, gone: cue (they sink away), sail: 1, far: true},
//       ships: [{x, y (waterline 0..1), s: 0.8, face: 1|-1, to, at, dur, roll: 2, mast: cue, split: cue, sink: cue, sail: 1}],
//       dark: cue|true (black clouds roll over the sky), storm: true, bolts: [cue...], rain: cue|true,
//       shore: {side: "left"|"right", w: 0.34, y: 0.8, wall: true, samurai: [{x (0..1), s: 0.55, pose, face, bow}]} | false,
//       boats: [{x, to, at, dur: 3, y: 0.74, n: 3, s: 0.5}] (small night-raid boats with rowing samurai),
//       debris: {n: 14, at} (planks + a broken mast float on the water), sun: {x: 0.8, y: 0.2} (heat sun) | false}
// SHOTS.mi_beach — Hakata beach seen from the land side: sea strip behind with far junks, sand in front.
//   P: {sea: 0.5, ground: 0.84, ships: [{x, y, s}], samurai: [{x, s: 0.62, pose, face, at, then, emotion, bow, call: cue}],
//       blocks: [{x, y (0..1), cols: 7, rows: 3, s: 1, face: -1, at, march: {to, at, dur}, drum: true}],
//       volleys: [{x0, y0, x1, y1, at, n: 14}], bomb: {x, y, at, r: 1}, wall: {x0: 0, x1: 1, y: 0.84, h: 0.13, build: cue|false, dur: 3},
//       workers: [{x, to, at, dur, s: 0.5}] (carry stones), dusk: true}
// SHOTS.mi_bomb — close-up of a clay bomb (tetsuhau) on the sand; fuse fizzes, bursts on cue `at`. P: {x: 0.5, y: 0.6, r: 170, at}
// SHOTS.mi_wall — cross-section of the Hakata stone wall: sheer sea face on the left, slope on the land side; an archer
//   runs up the slope. P: {x: 0.42 (sea face), top: 0.46, ground: 0.84, run: cue (archer runs up), aim: cue}
// SHOTS.mi_court — a hall. P: {mode: "khan"|"shogun", ruler: {x: 0.5, s: 0.8, accessory, beard, pose: "sit", emotion, at, then},
//   guards: 2, scroll: {x, at} (a scroll on the low table)}
// SHOTS.mi_letter — close-up of a handscroll letter. P: {mode: "letter"|"blank"|"painting", write: cue (columns appear),
//   seal: cue (red seal stamps), brush: true (blank: a brush hovers and never writes), bomb: cue (painting: burst above the rider)}
// SHOTS.mi_yard — a shipyard slipway: hull frames, planks being nailed by workers; P: {rush: cue (hammering speeds up), hulls: 2}
// SHOTS.mi_deck — close on a junk's deck in summer heat: rail, mast, crowded soldiers; dice tumble on cue. P: {dice: cue, heat: true}
// SHOTS.mi_seabed — underwater, full frame (use "set": false). P: {mode: "search"|"finds"|"dice"|"hull", find: cue,
//   items: [{kind: "helmet"|"sword"|"anchor"|"bomb", x, y, at}]}
// SHOTS.mi_hull — two hull cross-sections in the water (V hull with keel vs flat river boat); wave on cue `wave`, the flat
//   one cracks on `crack`. P: {single: false (only the flat boat, big), wave, crack}
// SHOTS.mi_map — full-frame old map of East Asia (China coast, Korea, Kyushu, Honshu, Tsushima, Iki).
//   P: {bounds: [119, 137, 28.5, 40] (lon0, lon1, lat0, lat1 kept visible), places: [{name, x: lon, y: lat, at, dot: true, dx, dy, size, color}],
//       routes: [{pts: [[lon, lat]...], at, dur: 2, color: "red"|"blue", fleet: 6 (ship icons travel along it)}],
//       swarm: {x, y, n: 30, r: 0.5 (deg), at} (a packed fleet), seas: [{name, x, y}]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const A = (cues, n, fb) => window.TZ.atOr(cues, n, fb);
  const f1 = v => Math.round(v * 10) / 10;
  const common = (root, P, W, H, sd) => {
    const M = window.MCB;
    const castG = el(root, 'g'), labG = el(root, 'g');
    const cast = M.cast(castG, P.cast || [], W, H, sd + 700), labs = M.labels(labG, P.labels || [], W, H, sd + 800);
    return { update(lt, t, cues) { cast.update(lt, t, cues); labs.update(lt, t, cues); }, castG, labG };
  };
  // skirt: a wave-shaped water patch in front of a ship's lower hull (hides it as it sinks)
  const skirt = (g, sd) => { const f = inkEl(g, INK.paperDark), l = inkEl(g, INK.inkSoft);
    return (t, lt, x, y, s, dark) => { const w = 260 * s, p = [];
      for (let i = 0; i <= 10; i++) { const xx = x - w + i * w / 5; p.push([xx, y + 6 * s + Math.sin(i * 1.7 + lt * 3) * 8 * s]); }
      f.setAttribute('fill', dark ? mix(INK.paperDark, INK.inkSoft, 0.45) : INK.paperDark);
      f.setAttribute('d', inkLoop(p.concat([[x + w, y + 300 * s], [x - w, y + 300 * s]]), { seed: sd, t, amp: 0.8 }));
      l.setAttribute('d', inkPath(p, { w: 4, seed: sd + 1, t, amp: 1 })); }; };

  // ------------------------------------------------------------------ burst (clay bomb explodes)
  function burst(g, sd) {
    const flash = inkEl(g, INK.gold), core = inkEl(g, INK.paperLight), rays = inkEl(g, INK.ink), ring = inkEl(g, INK.red), shards = inkEl(g, INK.ink), smoke = inkEl(g, mix(INK.inkSoft, INK.paperDark, 0.4)), smokeR = inkEl(g, INK.inkSoft);
    const r = rng(sd), S = Array.from({ length: 16 }, () => [r() * Math.PI * 2, 0.6 + r() * 0.8]);
    return (t, lt, x, y, at, k = 1) => {
      const u = lt - at;
      if (at == null || u < 0) { [flash, core, rays, ring, shards, smoke, smokeR].forEach(e => e.setAttribute('d', '')); return; }
      const fl = Math.max(0, 1 - u / 0.7), R = 140 * k * (0.5 + prog(lt, at, 0.4));
      const star = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, rr = i % 2 ? R * 0.55 : R * (1.1 + 0.2 * Math.sin(i * 3.1)); star.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
      flash.setAttribute('d', fl > 0 ? inkLoop(star, { seed: sd + 1, t, amp: 3, smooth: false }) : '');
      core.setAttribute('d', fl > 0.3 ? inkLoop(inkEllipsePts(x, y, R * 0.4, R * 0.4, sd + 2, 10), { seed: sd + 2, t }) : '');
      rays.setAttribute('d', fl > 0 ? inkPath(star, { w: 5, seed: sd + 3, t, amp: 2, closed: true, smooth: false }) : '');
      const rg = prog(lt, at, 0.9);
      ring.setAttribute('d', rg < 0.98 ? inkPath(inkEllipsePts(x, y, R * (0.8 + rg * 1.4), R * (0.7 + rg * 1.2), sd + 4, 16), { w: 6 * (1 - rg) + 1, seed: sd + 5, t, closed: true }) : '');
      shards.setAttribute('d', S.map(([a, v], i) => { const d = Math.min(1.6, u) * 420 * v * k, sx = x + Math.cos(a) * d, sy = y + Math.sin(a) * d + u * u * 120;
        return u < 1.6 ? inkLoop([[sx, sy - 9], [sx + 12, sy], [sx, sy + 9], [sx - 10, sy]], { seed: sd + 10 + i, t, amp: 1 }) : ''; }).join(' '));
      const sm = prog(lt, at + 0.15, 2.5), sp = [];
      for (let i = 0; i < 5; i++) { const cx = x + (i - 2) * 60 * k * (0.6 + sm), cy = y - 40 * k - sm * 140 * k - (i % 2) * 30 * k, rr = (50 + 40 * sm) * k * (1 + (i % 3) * 0.2);
        sp.push(inkEllipsePts(cx, cy, rr, rr * 0.8, sd + 30 + i, 10)); }
      smoke.setAttribute('d', u > 0.1 ? sp.map((p, i) => inkLoop(p, { seed: sd + 40 + i, t })).join(' ') : '');
      smokeR.setAttribute('d', u > 0.1 ? sp.map((p, i) => inkPath(p, { w: 3.5, seed: sd + 50 + i, t, closed: true })).join(' ') : '');
    };
  }

  // ------------------------------------------------------------------ mi_bay / mi_storm
  function seaBuild(ctx, stormDefault) {
      {
        const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 17;
        const storm = P.storm ?? stormDefault, hz = (P.horizon ?? 0.52) * H;
        const root = el(svg, 'g');
        // black clouds (sky turns black)
        const cloudF = inkEl(root, mix(INK.ink, INK.inkSoft, 0.35), { 'fill-opacity': 0.92 }), cloudL = inkEl(root, INK.ink);
        const sunE = P.sun ? { f: inkEl(root, INK.gold), r: inkEl(root, INK.ink) } : null;
        // far island
        const isl = P.island === false ? null : Object.assign({ x: 0.8, w: 0.3, h: 0.07 }, P.island || {});
        const islF = isl ? inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.5)) : null, islL = isl ? inkEl(root, INK.ink) : null;
        const sea = MI.waves(root, W, H, hz, sd + 3, { amp: storm ? 18 : 8, storm, dark: storm || P.dark === true, rows: storm ? 4 : 3 });
        // far packed fleet
        const fl = P.fleet ? Object.assign({ n: 26, x0: 0.02, x1: 0.98, y0: (P.horizon ?? 0.52) + 0.01, y1: (P.horizon ?? 0.52) + 0.14, s0: 0.14, s1: 0.3 }, P.fleet) : null;
        const fleetG = el(root, 'g'), fleet = [];
        if (fl) { const r = rng(sd + 5); for (let i = 0; i < fl.n; i++) { const v = r(); fleet.push({ x: lerp(fl.x0, fl.x1, (i + r() * 0.8) / fl.n), v, face: r() < 0.7 ? 1 : -1, ph: r() * 6 }); }
          fleet.sort((a, b) => a.v - b.v); fleet.forEach((f, i) => { f.j = MI.junk(fleetG, sd + 40 + i, { simple: true, dark: storm }); f.sk = skirt(fleetG, sd + 400 + i); }); }
        const shipG = el(root, 'g');
        const ships = (P.ships || []).slice().sort((a, b) => (a.y ?? 0.7) - (b.y ?? 0.7)).map((s, i) => ({ s, j: MI.junk(shipG, sd + 100 + i * 9, { dark: false, bold: !!s.bold }), sk: skirt(shipG, sd + 500 + i) }));
        // raid boats
        const boatG = el(root, 'g');
        const boats = (P.boats || []).map((b, i) => ({ b, f: inkEl(boatG, mix(INK.paperDark, INK.inkSoft, 0.5)), l: inkEl(boatG, INK.ink),
          men: Array.from({ length: b.n || 3 }, (_, k) => MI.samurai(boatG, sd + 600 + i * 10 + k, (b.s || 0.5) * 0.55)) }));
        // debris
        const debG = el(root, 'g'), deb = P.debris ? Array.from({ length: P.debris.n || 14 }, (_, i) => ({ f: inkEl(debG, mix(INK.paperDark, INK.stain, 0.5)), l: inkEl(debG, INK.ink), i })) : [];
        // shore + wall + samurai
        const shore = P.shore ? Object.assign({ side: 'left', w: 0.34, y: 0.8, wall: true }, P.shore) : null;
        const shoreG = el(root, 'g'), shoreF = shore ? inkEl(shoreG, mix(INK.paperDark, INK.stain, 0.35)) : null, shoreL = shore ? inkEl(shoreG, INK.ink) : null;
        const wallF = shore && shore.wall ? inkEl(shoreG, mix(INK.paperDark, INK.inkSoft, 0.25)) : null, wallL = shore && shore.wall ? inkEl(shoreG, INK.ink) : null;
        const sams = shore ? (shore.samurai || []).map((m, i) => ({ m, r: MI.samurai(shoreG, sd + 650 + i * 7, m.s || 0.55, { bow: m.bow }) })) : [];
        const rainE = MI.rain(root, W, H, sd + 7, 80), boltE = MI.bolt(root, sd + 9);
        const com = common(root, P, W, H, sd);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt;
            // clouds
            const dk = P.dark === true || storm ? 1 : P.dark ? prog(lt, A(cues, P.dark, 0), 2.2) : 0;
            if (dk > 0.01) { const p = [[-60, -60], [W + 60, -60]]; const by = lerp(-40, hz - 30, dk);
              for (let i = 12; i >= 0; i--) { const x = i / 12 * (W + 120) - 60; p.push([x, by + Math.sin(i * 1.9 + lt * 0.6) * 40 + (i % 2) * 30]); }
              cloudF.setAttribute('d', inkLoop(p, { seed: sd + 1, t, amp: 2 }));
              cloudL.setAttribute('d', inkPath(p.slice(2), { w: 5, seed: sd + 2, t, amp: 2 }));
            } else { cloudF.setAttribute('d', ''); cloudL.setAttribute('d', ''); }
            if (sunE) { const sx = P.sun.x * W, sy = P.sun.y * H, rr = 90; const rays = [];
              for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + lt * 0.2, r1 = rr * 1.25, r2 = rr * (1.6 + 0.12 * Math.sin(lt * 3 + i)); rays.push(inkPath([[sx + Math.cos(a) * r1, sy + Math.sin(a) * r1], [sx + Math.cos(a) * r2, sy + Math.sin(a) * r2]], { w: 6, seed: sd + 60 + i, t })); }
              sunE.f.setAttribute('d', inkLoop(inkEllipsePts(sx, sy, rr, rr, sd + 61, 14), { seed: sd + 62, t }));
              sunE.r.setAttribute('d', inkPath(inkEllipsePts(sx, sy, rr, rr, sd + 61, 14), { w: 6, seed: sd + 63, t, closed: true }) + ' ' + rays.join(' ')); }
            if (isl) { const x0 = (isl.x - isl.w / 2) * W, x1 = (isl.x + isl.w / 2) * W, h = isl.h * H;
              const p = [[x0, hz + 4], [x0 + (x1 - x0) * 0.15, hz - h * 0.6], [x0 + (x1 - x0) * 0.35, hz - h], [x0 + (x1 - x0) * 0.55, hz - h * 0.75], [x0 + (x1 - x0) * 0.75, hz - h * 0.9], [x1, hz + 4]];
              islF.setAttribute('d', inkLoop(p, { seed: sd + 70, t })); islL.setAttribute('d', inkPath(p, { w: 4, seed: sd + 71, t })); }
            sea.update(t);
            if (fl) { const ap = A(cues, fl.at, -1), gone = fl.gone != null ? A(cues, fl.gone, null) : null;
              fleet.forEach((f, i) => { const y = lerp(fl.y0, fl.y1, f.v) * H, s = lerp(fl.s0, fl.s1, f.v), x = f.x * W + (storm ? Math.sin(lt * 1.3 + f.ph) * 10 : lt * 6 * f.face);
                const pin = spring(lt, ap + i * 0.03, 0.5), sk = gone != null ? prog(lt, gone + (i % 7) * 0.18, 1.6) : 0;
                const bob = storm ? Math.sin(lt * 2.4 + f.ph) * 10 * s * 3 : Math.sin(lt * 1.5 + f.ph) * 3;
                f.j.update(t, lt, x, y + bob, Math.max(0.01, s * pin), f.face, { roll: (storm ? 9 : 2) * Math.sin(lt * 1.7 + f.ph), sink: sk, sail: fl.sail ?? 1, mast: storm && f.v > 0.6 && sk > 0 ? 1 : 0 });
                f.sk(t, lt, x, y + bob, s, storm); }); }
            ships.forEach(({ s, j, sk }) => {
              const a = A(cues, s.at, 0), d = s.dur ?? dur, x = s.to != null ? lerp(s.x, s.to, progIO(lt, a, d)) * W : s.x * W;
              const y = (s.y ?? 0.7) * H + (storm ? Math.sin(lt * 2.2 + s.x * 9) * 22 : Math.sin(lt * 1.4 + s.x * 9) * 5), sc = s.s ?? 0.8;
              const mk = s.mast != null ? prog(lt, A(cues, s.mast, 9e9), 0.9) : 0, spv = s.split != null ? prog(lt, A(cues, s.split, 9e9), 1.4) : 0;
              const snk = s.sink != null ? prog(lt, A(cues, s.sink, 9e9), 2.4) : 0;
              j.update(t, lt, x, y, sc, s.face || 1, { roll: (s.roll ?? (storm ? 10 : 2)) * Math.sin(lt * (storm ? 1.9 : 1.1) + s.x * 5), mast: mk, split: spv, sink: snk, sail: s.sail ?? 1 });
              sk(t, lt, x, y, sc, storm);
            });
            boats.forEach(({ b, f, l, men }, i) => {
              const a = A(cues, b.at, 0), u = progIO(lt, a, b.dur || 3), x = lerp(b.x, b.to ?? b.x, u) * W, y = (b.y ?? 0.74) * H + Math.sin(lt * 2 + i) * 5, s = b.s || 0.5;
              const p = [[x - 170 * s, y - 40 * s], [x + 190 * s, y - 44 * s], [x + 150 * s, y + 20 * s], [x - 140 * s, y + 20 * s]];
              f.setAttribute('d', inkLoop(p, { seed: sd + 300 + i, t })); l.setAttribute('d', inkPath(p, { w: 5, seed: sd + 301 + i, t, closed: true }) +
                ' ' + inkPath([[x - 90 * s, y - 30 * s], [x - 200 * s + Math.sin(lt * 4) * 30 * s, y + 40 * s]], { w: 5, seed: sd + 302 + i, t }));
              men.forEach((m, k) => m.update(t, 'idle', { x: x + (k - (men.length - 1) / 2) * 90 * s, y: y - 30 * s, face: (b.to ?? b.x) >= b.x ? 1 : -1, since: lt, dir: 10 }));
            });
            deb.forEach(({ f, l, i }) => { const a = A(cues, P.debris.at, 0), pin = prog(lt, a + i * 0.08, 0.5); if (pin <= 0) { f.setAttribute('d', ''); l.setAttribute('d', ''); return; }
              const x = ((i * 0.137 + 0.05) % 1) * W + Math.sin(lt * 0.5 + i) * 20, y = hz + 40 + ((i * 0.31) % 1) * (H - hz - 120) + Math.sin(lt * 1.6 + i) * 6, len = (i % 4 === 0 ? 220 : 90 + (i % 3) * 30) * (0.6 + (y - hz) / (H - hz)), rot = (i * 37 % 40) - 20;
              const c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180), hw = 9;
              const p = [[x - c * len / 2 - sn * hw, y - sn * len / 2 + c * hw], [x + c * len / 2 - sn * hw, y + sn * len / 2 + c * hw], [x + c * len / 2 + sn * hw, y + sn * len / 2 - c * hw], [x - c * len / 2 + sn * hw, y - sn * len / 2 - c * hw]];
              f.setAttribute('d', inkLoop(p, { seed: sd + 200 + i, t, smooth: false })); l.setAttribute('d', inkPath(p, { w: 3.5, seed: sd + 230 + i, t, closed: true, smooth: false })); });
            if (shore) { const left = shore.side !== 'right', w = shore.w * W, y = shore.y * H, xe = left ? w : W - w, xo = left ? -40 : W + 40;
              const p = [[xo, y - 60], [lerp(xo, xe, 0.7), y - 50], [xe, y + 10], [xe + (left ? 80 : -80), H + 40], [xo, H + 40]];
              shoreF.setAttribute('d', inkLoop(p, { seed: sd + 80, t })); shoreL.setAttribute('d', inkPath(p.slice(0, 4), { w: 5, seed: sd + 81, t }));
              if (wallF) { const wx0 = left ? -40 : xe - 30, wx1 = left ? xe - 30 : W + 40, wy = y - 55, wh = 0.11 * H;
                const wp = [[wx0, wy], [wx1, wy], [wx1, wy - wh], [wx0, wy - wh]]; wallF.setAttribute('d', inkLoop(wp, { seed: sd + 82, t, smooth: false }));
                const st = []; for (let r = 0; r < 3; r++) for (let x = wx0 + (r % 2) * 40; x < wx1; x += 80) st.push(inkPath(inkEllipsePts(x + 40, wy - wh * (r + 0.5) / 3, 36, wh / 7, sd + r * 50 + x, 8), { w: 3, seed: sd + 90 + r * 30 + Math.round(x), t, closed: true }));
                wallL.setAttribute('d', inkPath(wp, { w: 5, seed: sd + 83, t, closed: true, smooth: false }) + ' ' + st.join(' ')); }
              sams.forEach(({ m, r }) => { const a = A(cues, m.at, null), pose = a != null && lt >= a ? (m.then || 'point') : (m.pose || 'idle');
                r.update(t, pose, { x: m.x * W, y: shore.wall ? y - 55 - 0.11 * H : y - 50, face: m.face === 'left' || m.face === -1 ? -1 : 1, since: a != null && lt >= a ? lt - a : lt, dir: m.dir ?? 10, emotion: m.emotion }); }); }
            const rk = P.rain === true || storm ? 1 : P.rain ? prog(lt, A(cues, P.rain, 9e9), 1) : 0;
            rainE.update(t, rk);
            boltE.update(t, lt, (P.bolts || []).map(b => A(cues, b, null)), W * (P.bolt_x ?? 0.64), H);
            com.update(lt, t, cues);
          },
        };
      }
  }
  SH.mi_bay = {
    kind: '2d', build(ctx) { return seaBuild(ctx, false); } };
  SH.mi_storm = {
    kind: '2d', build(ctx) { return seaBuild(ctx, true); } };

  // ------------------------------------------------------------------ mi_beach
  SH.mi_beach = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 29;
      const root = el(svg, 'g'), seaY = (P.sea ?? 0.5) * H, gy = (P.ground ?? 0.84) * H;
      const sea = MI.waves(root, W, H, seaY, sd + 1, { amp: 6, rows: 2, dark: !!P.dusk });
      const shipG = el(root, 'g'), ships = (P.ships || []).map((s, i) => ({ s, j: MI.junk(shipG, sd + 10 + i * 9, { simple: (s.s || 0.3) < 0.35 }), sk: skirt(shipG, sd + 300 + i) }));
      const sandF = inkEl(root, mix(INK.paperDark, INK.stain, 0.3)), sandL = inkEl(root, INK.ink), sandH = inkEl(root, INK.inkSoft);
      const wall = P.wall ? Object.assign({ x0: 0, x1: 1, y: P.ground ?? 0.84, h: 0.13, dur: 3 }, P.wall) : null;
      const wallG = el(root, 'g'), stones = [];
      if (wall) { const sw = 86, rows = 3, hh = wall.h * H / rows; for (let r = 0; r < rows; r++) for (let x = wall.x0 * W + (r % 2) * sw / 2 - sw / 2; x < wall.x1 * W; x += sw)
        stones.push({ x, y: wall.y * H - hh * (r + 1), w: sw, h: hh, r, f: inkEl(wallG, r % 2 ? mix(INK.paperDark, INK.inkSoft, 0.3) : mix(INK.paperDark, INK.inkSoft, 0.15)), l: inkEl(wallG, INK.ink) }); }
      const blocksG = el(root, 'g'), blocks = (P.blocks || []).map((b, i) => ({ b, s: MI.soldiers(blocksG, sd + 50 + i * 40, Object.assign({}, b, { x: b.x * W, y: b.y * H, march: b.march ? Object.assign({}, b.march, { to: b.march.to * W }) : null })) }));
      const samG = el(root, 'g'), sams = (P.samurai || []).map((m, i) => ({ m, r: MI.samurai(samG, sd + 120 + i * 7, m.s || 0.62, { bow: m.bow }), call: inkEl(samG, INK.ink) }));
      const workG = el(root, 'g'), works = (P.workers || []).map((w, i) => ({ w, rig: KASIF.create(el(workG, 'g'), { scale: w.s || 0.5, hat: false, accessory: 'slouch', seed: sd + 140 + i }), st: inkEl(workG, mix(INK.paperDark, INK.inkSoft, 0.3)), stl: inkEl(workG, INK.ink) }));
      const volG = el(root, 'g'), vols = (P.volleys || []).map((v, i) => ({ v, e: inkEl(volG, INK.ink) }));
      const bombG = el(root, 'g'), bomb = P.bomb ? burst(bombG, sd + 200) : null, ball = P.bomb ? { f: inkEl(bombG, mix(INK.inkSoft, INK.stain, 0.4)), l: inkEl(bombG, INK.ink) } : null;
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sea.update(t);
          ships.forEach(({ s, j, sk }) => { const x = s.x * W + lt * 8 * (s.face || 1), y = s.y * H + Math.sin(lt * 1.3 + s.x * 7) * 4; j.update(t, lt, x, y, s.s || 0.3, s.face || 1, { roll: 2 * Math.sin(lt + s.x * 4) }); sk(t, lt, x, y, s.s || 0.3); });
          const sp = [[-40, seaY + 30], [W * 0.3, seaY + 22 + Math.sin(lt) * 4], [W * 0.7, seaY + 34], [W + 40, seaY + 26], [W + 40, H + 40], [-40, H + 40]];
          sandF.setAttribute('d', inkLoop(sp, { seed: sd + 2, t })); sandL.setAttribute('d', inkPath(sp.slice(0, 4), { w: 5, seed: sd + 3, t }));
          const hs = []; for (let i = 0; i < 16; i++) { const y = seaY + 80 + (i % 4) * (H - seaY - 80) / 4 + (i % 3) * 20, x = ((i * 0.23) % 1) * W; hs.push(inkPath([[x, y], [x + 70, y - 6], [x + 140, y]], { w: 3, seed: sd + 20 + i, t })); }
          sandH.setAttribute('d', hs.join(' '));
          if (wall) { const b = wall.build === false || wall.build == null ? -9 : A(cues, wall.build, 0.3);
            stones.forEach((s, i) => { const k = wall.build ? clamp01((lt - b) / wall.dur * stones.length - i * (1 - 0.1)) : 1;
              const order = wall.build ? (s.r * 1000 + s.x) : 0; void order;
              const kk = wall.build ? spring(lt, b + (s.r * 0.33 + (s.x - wall.x0 * W) / ((wall.x1 - wall.x0) * W) * 0.67) * wall.dur, 0.45) : 1;
              if (kk <= 0.01) { s.f.setAttribute('d', ''); s.l.setAttribute('d', ''); return; } void k;
              const yy = s.y - (1 - Math.min(1, kk)) * 120, p = inkEllipsePts(s.x + s.w / 2, yy + s.h / 2, s.w / 2 - 3, s.h / 2 - 2, sd + 500 + i, 9, 0, 0.14);
              s.f.setAttribute('d', inkLoop(p, { seed: sd + 600 + i, t })); s.l.setAttribute('d', inkPath(p, { w: 4, seed: sd + 700 + i, t, closed: true })); }); }
          blocks.forEach(({ s }) => s.update(t, lt, cues));
          vols.forEach(({ v, e }, i) => { const a = A(cues, v.at, 0.5), n = v.n || 14, D = [];
            for (let k = 0; k < n; k++) { const st = a + (k % 5) * 0.12 + Math.floor(k / 5) * 0.5, u = clamp01((lt - st) / 0.9); if (lt < st) continue;
              const ox = (k * 37 % 90) - 45, oy = (k * 53 % 60) - 30, x0 = v.x0 * W + ox, y0 = v.y0 * H + oy, x1 = v.x1 * W + ox * 2, y1 = v.y1 * H + oy;
              const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 260, dx = (x1 - x0) / 0.9, dy = (y1 - y0) / 0.9 - Math.cos(u * Math.PI) * Math.PI * 260 / 0.9, L = Math.hypot(dx, dy) || 1;
              D.push(inkPath([[x - dx / L * 60, y - dy / L * 60], [x, y]], { w: 4, seed: sd + 900 + i * 50 + k, t, amp: 0.5 })); }
            e.setAttribute('d', D.join(' ')); });
          if (bomb) { const a = A(cues, P.bomb.at, 1), bx = P.bomb.x * W, by = P.bomb.y * H, u = clamp01((lt - a + 0.8) / 0.8);
            if (lt < a) { const x = lerp(bx - 500, bx, u), y = by - Math.sin(u * Math.PI) * 200; const p = inkEllipsePts(x, y, 34, 34, sd + 210, 10);
              ball.f.setAttribute('d', u > 0 ? inkLoop(p, { seed: sd + 211, t }) : ''); ball.l.setAttribute('d', u > 0 ? inkPath(p, { w: 5, seed: sd + 212, t, closed: true }) : ''); }
            else { ball.f.setAttribute('d', ''); ball.l.setAttribute('d', ''); }
            bomb(t, lt, bx, by, a, P.bomb.r || 1); }
          sams.forEach(({ m, r, call }) => { const a = A(cues, m.at, null), on = a != null && lt >= a, pose = on ? (m.then || 'point') : (m.pose || 'idle');
            const x = m.x * W, y = (m.y ?? P.ground ?? 0.84) * H, face = m.face === 'left' || m.face === -1 ? -1 : 1, s = m.s || 0.62;
            r.update(t, pose, { x, y, face, since: on ? lt - a : lt, dir: m.dir ?? 15, emotion: m.emotion });
            const ca = A(cues, m.call, null);
            if (ca != null && lt >= ca) { const D = []; for (let k = 0; k < 3; k++) { const ph = ((lt - ca) * 1.2 + k / 3) % 1, rr = 40 + ph * 120; const cx = x + face * 90 * s, cy = y - 420 * s;
              D.push(inkPath([[cx + face * rr * 0.5, cy - rr * 0.6], [cx + face * rr * 0.75, cy], [cx + face * rr * 0.5, cy + rr * 0.6]], { w: 5 * (1 - ph) + 1, seed: sd + 950 + k, t })); }
              call.setAttribute('d', D.join(' ')); } else call.setAttribute('d', ''); });
          works.forEach(({ w, rig, st, stl }, i) => { const a = A(cues, w.at, 0), d = w.dur || 2.4, s = w.s || 0.5, u = ((lt - a) / d) % 2, back = u > 1;
            const k = back ? 2 - u : u, x = lerp(w.x, w.to ?? w.x, lt < a ? 0 : k) * W, y = (P.ground ?? 0.84) * H + 30;
            const moving = lt >= a && w.to != null, face = moving ? (back ? (w.to > w.x ? -1 : 1) : (w.to > w.x ? 1 : -1)) : 1;
            rig.update(t, moving ? 'walk' : 'hold', { x, y, face, ph: Math.abs((w.to - w.x) * W * k) / ((KASIF.gait ? KASIF.gait('walk') : 120) * s), since: lt, dir: 20 });
            const carry = !back; const sx = x + face * 70 * s, sy = y - 330 * s, p = inkEllipsePts(sx, sy, 70 * s, 48 * s, sd + 960 + i, 9, 0, 0.12);
            st.setAttribute('d', carry ? inkLoop(p, { seed: sd + 961 + i, t }) : ''); stl.setAttribute('d', carry ? inkPath(p, { w: 4, seed: sd + 962 + i, t, closed: true }) : ''); });
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_bomb
  SH.mi_bomb = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 41, root = el(svg, 'g');
      const x = (P.x ?? 0.5) * W, y = (P.y ?? 0.6) * H, R = P.r || 170;
      const sh = el(root, 'g'), shad = inkEl(sh, INK.inkSoft, { 'fill-opacity': 0.35 }), ballF = inkEl(sh, mix(INK.inkSoft, INK.stain, 0.45)), ballL = inkEl(sh, INK.ink), dots = inkEl(sh, INK.ink), hi = inkEl(sh, INK.paperLight, { 'fill-opacity': 0.6 });
      const fuse = inkEl(sh, INK.ink), spark = inkEl(sh, INK.gold), sparkR = inkEl(sh, INK.red);
      const b = burst(el(root, 'g'), sd + 5), com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, a = A(cues, P.at ?? 'at', dur * 0.55), on = lt < a + 0.05;
          const p = inkEllipsePts(x, y - R, R, R, sd + 1, 16);
          const wob = Math.sin(lt * 30) * (lt > a - 0.6 ? 4 : 0);
          shad.setAttribute('d', on ? inkLoop(inkEllipsePts(x + 30, y + 6, R * 1.1, R * 0.22, sd + 2, 12), { seed: sd + 3, t }) : '');
          ballF.setAttribute('d', on ? inkLoop(p.map(q => [q[0] + wob, q[1]]), { seed: sd + 4, t }) : '');
          ballL.setAttribute('d', on ? inkPath(p.map(q => [q[0] + wob, q[1]]), { w: 7, seed: sd + 5, t, closed: true }) : '');
          const D = []; if (on) for (let i = 0; i < 9; i++) { const ang = i * 2.4, rr = R * (0.2 + (i % 3) * 0.25); D.push(inkDot(x + wob + Math.cos(ang) * rr, y - R + Math.sin(ang) * rr * 0.9, 7, 6, sd + 10 + i, t)); }
          dots.setAttribute('d', D.join(' '));
          hi.setAttribute('d', on ? inkLoop(inkEllipsePts(x - R * 0.4 + wob, y - R * 1.45, R * 0.28, R * 0.14, sd + 6, 8, -0.5), { seed: sd + 7, t }) : '');
          const burn = clamp01(lt / Math.max(0.5, a)), fx = x + wob + 10, fy0 = y - 2 * R, L = 160 * (1 - burn * 0.85);
          const fp = [[fx, fy0 + 6], [fx + L * 0.4, fy0 - L * 0.5], [fx + L * 0.9, fy0 - L * 0.7]];
          fuse.setAttribute('d', on ? inkPath(fp, { w: 8, seed: sd + 8, t }) : '');
          const tip = fp[2], SP = [], SR = [];
          if (on) for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2 + lt * 9, r2 = 26 + 16 * Math.sin(lt * 23 + i);
            SP.push(inkPath([[tip[0], tip[1]], [tip[0] + Math.cos(ang) * r2, tip[1] + Math.sin(ang) * r2]], { w: 5, seed: sd + 20 + i, t, amp: 0.5 }));
            if (i % 2) SR.push(inkDot(tip[0] + Math.cos(ang) * r2 * 1.4, tip[1] + Math.sin(ang) * r2 * 1.4, 5, 5, sd + 30 + i, t)); }
          spark.setAttribute('d', SP.join(' ')); sparkR.setAttribute('d', SR.join(' '));
          b(t, lt, x, y - R, a, 1.9);
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_wall (cross-section)
  SH.mi_wall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 53, root = el(svg, 'g');
      const gx = (P.x ?? 0.42) * W, top = (P.top ?? 0.46) * H, gy = (P.ground ?? 0.84) * H, tw = 150, slopeEnd = gx + tw + 520;
      const sea = MI.waves(root, gx + 10, H, gy - 60, sd + 1, { amp: 10, rows: 2 });
      const wf = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.2)), wl = inkEl(root, INK.ink), wst = inkEl(root, INK.inkSoft);
      const earth = inkEl(root, mix(INK.paperDark, INK.stain, 0.35)), earthL = inkEl(root, INK.ink);
      const sam = MI.samurai(el(root, 'g'), sd + 10, 0.5, { bow: true });
      const arrowE = inkEl(root, INK.ink);
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sea.update(t);
          const wp = [[gx, gy + 120], [gx, top], [gx + tw, top], [slopeEnd, gy], [slopeEnd, gy + 120]];
          wf.setAttribute('d', inkLoop(wp, { seed: sd + 2, t, smooth: false })); wl.setAttribute('d', inkPath(wp.slice(0, 4), { w: 7, seed: sd + 3, t, smooth: false }));
          const S = []; for (let r = 0; r < 6; r++) { const y = lerp(top, gy, (r + 0.5) / 6); const xe = lerp(gx + tw, slopeEnd, (r + 0.5) / 6);
            for (let x = gx + 10 + (r % 2) * 30; x < xe - 40; x += 70) S.push(inkPath(inkEllipsePts(x + 30, y, 30, (gy - top) / 14, sd + r * 40 + x, 8), { w: 3, seed: sd + 100 + r * 40 + Math.round(x), t, closed: true })); }
          wst.setAttribute('d', S.join(' '));
          const ep = [[slopeEnd - 20, gy], [W + 40, gy - 6], [W + 40, H + 40], [slopeEnd - 20, H + 40]];
          earth.setAttribute('d', inkLoop(ep, { seed: sd + 4, t })); earthL.setAttribute('d', inkPath(ep.slice(0, 2), { w: 5, seed: sd + 5, t }));
          const run = A(cues, P.run, 0.3), aim = A(cues, P.aim, run + 2.4), u = progIO(lt, run, Math.max(0.6, aim - run - 0.2));
          const sx = lerp(slopeEnd + 200, gx + tw * 0.55, u), sy = sx > gx + tw ? lerp(top, gy, (sx - gx - tw) / (slopeEnd - gx - tw)) : top;
          const moving = lt >= run && lt < aim - 0.2;
          sam.update(t, lt >= aim ? 'point' : moving ? 'run' : 'idle', { x: sx, y: sy, face: -1, ph: Math.abs(sx - slopeEnd - 200) / 120, since: lt >= aim ? lt - aim : lt, dir: 12, emotion: 'angry' });
          const ar = lt >= aim + 0.4 ? clamp01((lt - aim - 0.4) / 0.8) : -1;
          arrowE.setAttribute('d', ar >= 0 ? inkPath([[sx - 120 - ar * 700, sy - 250 + ar * 60], [sx - 40 - ar * 700, sy - 250 + ar * 60]], { w: 5, seed: sd + 7, t }) : '');
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_court
  SH.mi_court = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 67, root = el(svg, 'g');
      const shogun = P.mode === 'shogun', gy = (P.ground ?? 0.84) * H, sh = window.TZ.Shapes();
      if (shogun) {   // shoji screens + tatami
        for (let i = 0; i < 5; i++) { const x0 = W * (0.02 + i * 0.196), x1 = x0 + W * 0.18, y0 = H * 0.16, y1 = gy - 20;
          sh.add(root, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { fill: INK.paperLight, stroke: INK.ink, w: 6 });
          for (let k = 1; k < 4; k++) sh.add(root, [[x0 + (x1 - x0) * k / 4, y0], [x0 + (x1 - x0) * k / 4, y1]], { stroke: INK.inkSoft, w: 3, closed: false });
          for (let k = 1; k < 6; k++) sh.add(root, [[x0, y0 + (y1 - y0) * k / 6], [x1, y0 + (y1 - y0) * k / 6]], { stroke: INK.inkSoft, w: 3, closed: false }); }
        sh.add(root, [[-30, gy - 20], [W + 30, gy - 20], [W + 30, H + 30], [-30, H + 30]], { fill: mix(INK.paperDark, INK.green, 0.18), stroke: INK.ink, w: 5 });
        for (let k = 0; k < 6; k++) sh.add(root, [[W * (k / 5) - 200, H + 30], [W * 0.5 + (k / 5 - 0.5) * W * 0.5, gy - 20]], { stroke: INK.inkSoft, w: 3, closed: false });
        sh.add(root, [[W * 0.36, gy + 20], [W * 0.64, gy + 20], [W * 0.62, gy - 30], [W * 0.38, gy - 30]], { fill: mix(INK.paperDark, INK.stain, 0.3), stroke: INK.ink, w: 5 });
      } else {        // khan's throne hall: pillars, banners, throne on a dais
        [0.12, 0.88].forEach((px, i) => sh.add(root, [[W * px - 50, H * 0.08], [W * px + 50, H * 0.08], [W * px + 50, gy], [W * px - 50, gy]], { fill: INK.red, stroke: INK.ink, w: 6 }));
        [0.28, 0.72].forEach((px, i) => sh.add(root, lt => { const s = Math.sin(lt * 1.3 + i) * 14; return [[W * px - 70, H * 0.1], [W * px + 70, H * 0.1], [W * px + 70 + s, H * 0.52], [W * px + s, H * 0.6], [W * px - 70 + s, H * 0.52]]; }, { fill: INK.gold, stroke: INK.ink, w: 5 }));
        sh.add(root, [[W * 0.39, gy - 520], [W * 0.61, gy - 520], [W * 0.61, gy - 70], [W * 0.39, gy - 70]], { fill: mix(INK.red, INK.ink, 0.25), stroke: INK.ink, w: 7, smooth: false });
        sh.add(root, [[W * 0.41, gy - 500], [W * 0.59, gy - 500], [W * 0.59, gy - 80], [W * 0.41, gy - 80]], { stroke: INK.gold, w: 6 });
        for (let k = 0; k < 3; k++) sh.add(root, [[W * (0.3 - k * 0.04), gy - 70 + k * 35], [W * (0.7 + k * 0.04), gy - 70 + k * 35], [W * (0.7 + k * 0.04), gy - 35 + k * 35], [W * (0.3 - k * 0.04), gy - 35 + k * 35]], { fill: mix(INK.paperDark, INK.stain, 0.3 + k * 0.1), stroke: INK.ink, w: 5 });
      }
      const ru = Object.assign({ x: 0.5, s: 0.8, pose: 'sit' }, P.ruler || {});
      const rg = el(root, 'g'), rig = KASIF.create(rg, { scale: ru.s, hat: false, accessory: ru.accessory ?? (shogun ? null : 'crown'), beard: ru.beard ?? (shogun ? null : 'black'), seed: sd + 3 });
      const fan = shogun ? inkEl(root, INK.paperLight) : null, fanL = shogun ? inkEl(root, INK.ink) : null;
      const guards = Array.from({ length: P.guards ?? (shogun ? 0 : 2) }, (_, i) => ({ rig: KASIF.create(el(root, 'g'), { scale: 0.62, hat: false, accessory: 'helmet_byz', seed: sd + 10 + i }), x: i ? 0.8 : 0.2, spear: inkEl(root, INK.ink) }));
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sh.update(t, lt);
          const a = A(cues, ru.at, null), on = a != null && lt >= a;
          const ry = shogun ? gy - 30 : gy - 70;
          rig.update(t, on ? (ru.then || 'point') : ru.pose, { x: ru.x * W, y: ry, face: ru.face === 'left' ? -1 : 1, since: on ? lt - a : lt, dir: ru.dir ?? 10, emotion: on ? ru.emotion : (ru.emotion0 || ru.emotion), text: ru.text, item: ru.item });
          if (fan) { const fx = ru.x * W + 95 * ru.s, fy = ry - 190 * ru.s, op = 0.6 + 0.4 * Math.sin(lt * 1.5), p = [[fx, fy]];
            for (let k = 0; k <= 6; k++) { const an = -Math.PI / 2 - 0.9 * op + k / 6 * 1.8 * op; p.push([fx + Math.cos(an) * 110 * ru.s, fy + Math.sin(an) * 110 * ru.s]); }
            fan.setAttribute('d', inkLoop(p, { seed: sd + 20, t })); fanL.setAttribute('d', inkPath(p, { w: 4, seed: sd + 21, t, closed: true })); }
          guards.forEach((g, i) => { const x = g.x * W; g.rig.update(t, 'idle', { x, y: gy, face: i ? -1 : 1, since: lt });
            g.spear.setAttribute('d', inkPath([[x + (i ? -1 : 1) * 50, gy - 60], [x + (i ? -1 : 1) * 60, gy - 520]], { w: 6, seed: sd + 30 + i, t }) + ' ' + inkLoop([[x + (i ? -1 : 1) * 60 - 16, gy - 520], [x + (i ? -1 : 1) * 62, gy - 590], [x + (i ? -1 : 1) * 60 + 16, gy - 520]], { seed: sd + 32 + i, t })); });
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_letter / mi_scroll
  function letterBuild(ctx, defMode) {
      {
        const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 79, root = el(svg, 'g');
        const mode = P.mode || defMode, sh = window.TZ.Shapes();
        const x0 = W * 0.08, x1 = W * 0.92, y0 = H * 0.12, y1 = H * 0.8;
        sh.add(root, [[x0 + 14, y0 + 18], [x1 + 14, y0 + 18], [x1 + 14, y1 + 18], [x0 + 14, y1 + 18]], { fill: INK.inkSoft, fop: 0.25 });
        sh.add(root, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { fill: INK.paperLight, stroke: INK.ink, w: 5 });
        [x0 - 10, x1 + 10].forEach(x => sh.add(root, [[x - 22, y0 - 30], [x + 22, y0 - 30], [x + 22, y1 + 30], [x - 22, y1 + 30]], { fill: mix(INK.paperDark, INK.stain, 0.6), stroke: INK.ink, w: 5 }));
        const cols = [], colG = el(root, 'g');
        if (mode === 'letter') for (let c = 0; c < 14; c++) cols.push({ e: inkEl(colG, INK.ink), x: x1 - 90 - c * ((x1 - x0 - 160) / 13), n: 7 + (c * 5 % 4) });
        const seal = { f: inkEl(root, INK.red), l: inkEl(root, INK.paperLight) };
        const paint = mode === 'painting' ? el(root, 'g') : null;
        let rider = null, horse = null, bombB = null, arrows = null, ball = null;
        if (paint) { horse = { f: inkEl(paint, mix(INK.paperDark, INK.stain, 0.5)), l: inkEl(paint, INK.ink) }; rider = MI.samurai(paint, sd + 5, 0.55, { bow: true });
          arrows = inkEl(paint, INK.ink); ball = { f: inkEl(paint, mix(INK.inkSoft, INK.stain, 0.45)), l: inkEl(paint, INK.ink) }; bombB = burst(el(paint, 'g'), sd + 6);
          sh.add(paint, [[x0 + 30, H * 0.7], [x0 + 400, H * 0.66], [x1 - 400, H * 0.72], [x1 - 30, H * 0.68]], { stroke: INK.inkSoft, w: 4, closed: false }); }
        const brush = mode === 'blank' ? { h: inkEl(root, mix(INK.stain, INK.inkSoft, 0.4)), l: inkEl(root, INK.ink), tip: inkEl(root, INK.ink), drop: inkEl(root, INK.ink) } : null;
        const com = common(root, P, W, H, sd);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt; sh.update(t, lt);
            const w0 = A(cues, P.write, 0.2);
            cols.forEach((c, i) => { const k = clamp01((lt - w0) / 2.2 * 14 - i); const D = [];
              for (let j = 0; j < Math.min(7, Math.floor(k * c.n)); j++) { const y = y0 + 130 + j * 64, x = c.x, r = rng(sd + i * 97 + j * 13), sz = 24;
                const G = [];
                G.push([[x - sz, y - sz * 0.55 + r() * 8], [x + sz * 0.9, y - sz * 0.62]]);                              // top horizontal
                if (r() < 0.8) G.push([[x - 2 + r() * 6, y - sz], [x + r() * 4, y + sz * 0.9]]);                            // vertical
                if (r() < 0.7) G.push([[x - 4, y + 2], [x - sz * 0.9, y + sz * 0.95]]);                                     // left-falling sweep
                if (r() < 0.7) G.push([[x + 4, y + 2], [x + sz, y + sz * 0.9]]);                                            // right-falling sweep
                if (r() < 0.5) G.push([[x - sz * 0.8, y + sz * 0.2], [x + sz * 0.7, y + sz * 0.1]]);                         // middle bar
                G.forEach((g2, q) => D.push(inkPath(g2, { w: 9 - q, seed: sd + i * 30 + j * 7 + q, t, amp: 0.7, taper: 0.7 })));
                if (r() < 0.5) D.push(inkDot(x + sz * 0.7, y - sz * 1.05, 6, 6, sd + i * 31 + j, t)); }
              c.e.setAttribute('d', D.join(' ')); });
            const sa = A(cues, P.seal, null);
            if (sa != null && lt >= sa) { const s = lerp(1.8, 1, spring(lt, sa, 0.4)), cx = (P.seal_x ?? 0.2) * W, cy = (P.seal_y ?? 0.62) * H, r = 80 * s;
              const p = [[cx - r, cy - r], [cx + r, cy - r], [cx + r, cy + r], [cx - r, cy + r]];
              seal.f.setAttribute('d', inkLoop(p, { seed: sd + 50, t, smooth: false }));
              seal.l.setAttribute('d', [0, 1, 2].map(k => inkPath([[cx - r * 0.6, cy - r * 0.5 + k * r * 0.5], [cx + r * 0.6, cy - r * 0.5 + k * r * 0.5]], { w: 7, seed: sd + 51 + k, t })).join(' ') + ' ' + inkPath([[cx, cy - r * 0.7], [cx, cy + r * 0.7]], { w: 7, seed: sd + 55, t }));
            } else { seal.f.setAttribute('d', ''); seal.l.setAttribute('d', ''); }
            if (brush) { const bx = W * 0.6 + Math.sin(lt * 0.9) * 60, by = H * 0.36 + Math.sin(lt * 1.3) * 20, ang = -0.5 + Math.sin(lt * 0.7) * 0.08, L = 420;
              const tx = bx + Math.cos(ang + Math.PI / 2) * 0, p = [[bx, by], [bx + Math.sin(-ang) * L, by - Math.cos(ang) * L]]; void tx;
              brush.h.setAttribute('d', inkPath(p, { w: 26, seed: sd + 60, t, amp: 0.5 })); brush.l.setAttribute('d', inkPath(p, { w: 6, seed: sd + 61, t, amp: 0.5 }));
              brush.tip.setAttribute('d', inkLoop([[bx - 18, by - 10], [bx + 18, by - 10], [bx + 2, by + 60]], { seed: sd + 62, t }));
              const du = (lt * 0.5) % 1; brush.drop.setAttribute('d', du > 0.5 ? inkDot(bx + 2, by + 70 + (du - 0.5) * 2 * 160, 9, 12, sd + 63, t) : ''); }
            if (paint) { const hx = W * 0.6 + Math.sin(lt * 2) * 6, hy = H * 0.66, g1 = Math.sin(lt * 5) * 14;
              const hp = [[hx - 170, hy - 230], [hx - 60, hy - 250], [hx + 80, hy - 245], [hx + 130, hy - 270], [hx + 170, hy - 350], [hx + 205, hy - 375], [hx + 260, hy - 340], [hx + 265, hy - 320], [hx + 215, hy - 318],
                [hx + 185, hy - 270], [hx + 160, hy - 200], [hx + 130, hy - 175], [hx - 150, hy - 170], [hx - 190, hy - 200]];
              const legs = [[hx + 110, hy - 180, 40 + g1], [hx + 70, hy - 180, -10 - g1], [hx - 110, hy - 180, -40 - g1], [hx - 150, hy - 185, 10 + g1]];
              const tail = [[hx - 185, hy - 220], [hx - 250, hy - 200 + g1], [hx - 275, hy - 130 + g1]];
              horse.f.setAttribute('d', inkLoop(hp, { seed: sd + 70, t }));
              horse.l.setAttribute('d', inkPath(hp, { w: 6, seed: sd + 71, t, closed: true }) + ' ' + legs.map(([lx, ly, sw], k) => inkPath([[lx, ly], [lx + sw * 0.4, ly + 95], [lx + sw, hy]], { w: 13, seed: sd + 72 + k, t })).join(' ') +
                ' ' + inkPath(tail, { w: 14, seed: sd + 77, t }) + ' ' + inkPath([[hx + 150, hy - 300], [hx + 120, hy - 330], [hx + 150, hy - 350]], { w: 6, seed: sd + 78, t }) + ' ' + inkDot(hx + 215, hy - 345, 6, 6, sd + 79, t));
              rider.update(t, 'point', { x: hx - 20, y: hy - 200, face: 1, since: lt, dir: 30, emotion: 'worried' });
              const D = []; for (let k = 0; k < 8; k++) { const ax = W * 0.2 + k * 50, ay = H * 0.25 + (k % 3) * 40 + Math.sin(lt * 2 + k) * 8; D.push(inkPath([[ax, ay], [ax + 90, ay + 30]], { w: 4, seed: sd + 80 + k, t })); }
              arrows.setAttribute('d', D.join(' '));
              const ba = A(cues, P.bomb, 1.2), bx = W * 0.44, by = H * 0.24;
              if (lt < ba) { const p = inkEllipsePts(bx, by, 40, 40, sd + 90, 10); ball.f.setAttribute('d', inkLoop(p, { seed: sd + 91, t })); ball.l.setAttribute('d', inkPath(p, { w: 5, seed: sd + 92, t, closed: true })); }
              else { ball.f.setAttribute('d', ''); ball.l.setAttribute('d', ''); }
              bombB(t, lt, bx, by, ba, 0.6); }
            com.update(lt, t, cues);
          },
        };
      }
  }
  SH.mi_letter = {
    kind: '2d', build(ctx) { return letterBuild(ctx, 'letter'); } };
  SH.mi_scroll = {
    kind: '2d', build(ctx) { return letterBuild(ctx, 'painting'); } };

  // ------------------------------------------------------------------ mi_log: dive logbook page filling the frame
  // P: {title, rows: [{text, at, mark: "check"|"hull"|null, color: "ink"|"red"}], pill: {text, at, color: "red"}}
  SH.mi_log = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 151, root = el(svg, 'g'), sh = window.TZ.Shapes();
      const x0 = W * 0.06, x1 = W * 0.94, y0 = H * 0.06, y1 = H * 0.98;
      sh.add(root, [[-30, H * 0.8], [W + 30, H * 0.8], [W + 30, H + 30], [-30, H + 30]], { fill: mix(INK.paperDark, INK.stain, 0.5), stroke: INK.ink, w: 5 });
      for (let k = 0; k < 4; k++) sh.add(root, [[-30, H * 0.84 + k * 40], [W + 30, H * 0.84 + k * 40]], { stroke: INK.inkSoft, w: 3, closed: false });
      sh.add(root, [[x0 + 16, y0 + 20], [x1 + 16, y0 + 20], [x1 + 16, y1 + 20], [x0 + 16, y1 + 20]], { fill: INK.inkSoft, fop: 0.25 });
      sh.add(root, [[x0, y0], [x1, y0 - 6], [x1, y1], [x0, y1 + 4]], { fill: INK.paperLight, stroke: INK.ink, w: 5 });
      for (let k = 1; k < 9; k++) sh.add(root, [[x0 + 10, y0 + k * (y1 - y0) / 9], [x1 - 10, y0 + k * (y1 - y0) / 9]], { stroke: INK.blue, w: 2.5, closed: false });
      sh.add(root, [[x0 + 230, y0 + 4], [x0 + 230, y1 - 4]], { stroke: INK.red, w: 3, closed: false });
      const tt = el(root, 'text', { x: W * 0.5, y: y0 + 96, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 84, fill: INK.ink, 'text-anchor': 'middle' }); tt.textContent = P.title || '';
      const rows = (P.rows || []).map((r, i) => { const g = el(root, 'g'), y = y0 + 260 + i * 150;
        const tx = el(g, 'text', { x: x0 + 420, y, 'font-family': INK_FONT, 'font-size': 92, fill: r.color === 'red' ? INK.red : INK.ink, 'dominant-baseline': 'central' }); tx.textContent = r.text;
        return { r, g, y, mark: inkEl(g, r.mark === 'check' ? INK.green : INK.ink), mark2: inkEl(g, mix(INK.paperDark, INK.stain, 0.4)) }; });
      const pill = P.pill ? { f: inkEl(root, P.pill.color === 'blue' ? INK.blue : INK.red), tx: el(root, 'text', { x: W * 0.66, y: H * 0.66, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': 64, fill: INK.paperLight, 'text-anchor': 'middle', 'dominant-baseline': 'central' }) } : null;
      if (pill) pill.tx.textContent = P.pill.text;
      let pillW = 0; if (pill) { try { pillW = pill.tx.getComputedTextLength(); } catch (e) { pillW = 0; } if (!(pillW > 0)) pillW = 64 * 0.56 * P.pill.text.length; }
      const pen = { f: inkEl(root, INK.blue), l: inkEl(root, INK.ink) };
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sh.update(t, lt);
          let last = -1;
          rows.forEach(({ r, g, y, mark, mark2 }, i) => { const a = A(cues, r.at, 0.3 + i * 0.8), k = spring(lt, a, 0.5);
            if (k <= 0.01) { g.style.display = 'none'; return; } g.style.display = ''; last = i;
            g.setAttribute('transform', `translate(${f1((1 - Math.min(1, k)) * -40)} 0)`);
            const mx = x0 + 300, mp = prog(lt, a, 0.5);
            if (r.mark === 'check') { mark.setAttribute('d', inkPath([[mx - 40, y], [mx - 12, y + 34], [mx + 46, y - 44]].slice(0, mp > 0.5 ? 3 : 2), { w: 12, seed: sd + 20 + i, t })); mark2.setAttribute('d', ''); }
            else if (r.mark === 'hull') { const hp = [[mx - 60, y - 20], [mx + 60, y - 22], [mx + 40, y + 24], [mx - 44, y + 24]];
              mark2.setAttribute('d', inkLoop(hp, { seed: sd + 30 + i, t })); mark.setAttribute('d', inkPath(hp, { w: 5, seed: sd + 40 + i, t, closed: true }) + ' ' + inkPath([[mx - 10, y - 22], [mx - 6, y - 90]], { w: 5, seed: sd + 50 + i, t })); }
            else { mark.setAttribute('d', ''); mark2.setAttribute('d', ''); } });
          if (pill) { const a = A(cues, P.pill.at, dur * 0.8), k = spring(lt, a, 0.5), w = (pillW + 140) * Math.max(0.01, Math.min(1.06, k)), cx = W * 0.66, cy = H * 0.66;
            pill.f.setAttribute('d', k > 0.01 ? inkLoop([[cx - w / 2, cy - 54], [cx + w / 2, cy - 58], [cx + w / 2 + 20, cy], [cx + w / 2, cy + 56], [cx - w / 2, cy + 54], [cx - w / 2 - 20, cy]], { seed: sd + 60, t }) : '');
            pill.tx.style.display = k > 0.85 ? '' : 'none'; }
          const py = last >= 0 ? rows[last].y : y0 + 260, px = x1 - 260 + Math.sin(lt * 6) * 30;
          const pp = [[px, py + 10], [px + 18, py - 10], [px + 240, py - 210], [px + 220, py - 230]];
          pen.f.setAttribute('d', inkLoop(pp, { seed: sd + 70, t, smooth: false })); pen.l.setAttribute('d', inkPath(pp, { w: 5, seed: sd + 71, t, closed: true, smooth: false }));
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_yard (shipyard)
  SH.mi_yard = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 91, root = el(svg, 'g'), gy = (P.ground ?? 0.84) * H, sh = window.TZ.Shapes();
      const hulls = [];
      for (let h = 0; h < (P.hulls ?? 2); h++) {
        const cx = W * (h ? 0.7 : 0.32), s = h ? 0.75 : 1, by = gy - 70 * s;
        sh.add(root, [[cx - 420 * s, gy], [cx + 420 * s, gy], [cx + 420 * s, gy - 40 * s], [cx - 420 * s, gy - 40 * s]], { fill: mix(INK.paperDark, INK.stain, 0.5), stroke: INK.ink, w: 5 });   // slipway
        sh.add(root, [[cx - 400 * s, by], [cx + 400 * s, by]], { stroke: INK.ink, w: 12, closed: false });   // keel line
        for (let k = 0; k < 9; k++) { const x = cx - 340 * s + k * 85 * s, hh = (220 - Math.abs(k - 4) * 14) * s;
          sh.add(root, [[x - 40 * s, by - hh], [x - 20 * s, by - hh * 0.3], [x, by], [x + 20 * s, by - hh * 0.3], [x + 40 * s, by - hh]], { stroke: INK.ink, w: 7, closed: false, smooth: true }); }
        hulls.push({ cx, s, by, planks: Array.from({ length: 4 }, (_, k) => inkEl(root, mix(INK.paperDark, INK.stain, 0.3 + k * 0.05))), pl: inkEl(root, INK.ink) });
      }
      sh.add(root, [[W * 0.02, gy], [W * 0.14, gy], [W * 0.14, gy - 120], [W * 0.02, gy - 120]], { fill: mix(INK.paperDark, INK.stain, 0.5), stroke: INK.ink, w: 5 });
      for (let k = 1; k < 5; k++) sh.add(root, [[W * 0.02, gy - k * 24], [W * 0.14, gy - k * 24]], { stroke: INK.inkSoft, w: 3, closed: false });
      const workers = [0.18, 0.42, 0.6, 0.84].map((x, i) => ({ x, rig: KASIF.create(el(root, 'g'), { scale: 0.48, hat: false, accessory: 'slouch', seed: sd + i }), ham: inkEl(root, INK.ink), hit: inkEl(root, INK.gold) }));
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sh.update(t, lt);
          const ra = A(cues, P.rush, null), speed = ra != null && lt >= ra ? 3.2 : 1.2;
          hulls.forEach((h, i) => { const k = clamp01(0.3 + lt * 0.08 * speed);
            h.planks.forEach((p, j) => { const y = h.by - (30 + j * 44) * h.s, xa = h.cx - 360 * h.s, xb = xa + 720 * h.s * clamp01(k * 1.4 - j * 0.15);
              p.setAttribute('d', xb > xa + 10 ? inkLoop([[xa, y], [xb, y], [xb, y - 36 * h.s], [xa, y - 36 * h.s]], { seed: sd + 40 + i * 9 + j, t, smooth: false }) : ''); });
            h.pl.setAttribute('d', h.planks.map((_, j) => { const y = h.by - (30 + j * 44) * h.s, xa = h.cx - 360 * h.s, xb = xa + 720 * h.s * clamp01(k * 1.4 - j * 0.15); return xb > xa + 10 ? inkPath([[xa, y], [xb, y], [xb, y - 36 * h.s], [xa, y - 36 * h.s]], { w: 3.5, seed: sd + 60 + i * 9 + j, t, closed: true, smooth: false }) : ''; }).join(' ')); });
          workers.forEach((w, i) => { const x = w.x * W, ph = (lt * speed * 1.6 + i * 0.3) % 1, up = ph < 0.6 ? ph / 0.6 : 1 - (ph - 0.6) / 0.4, f = i % 2 ? -1 : 1;
            w.rig.update(t, 'point', { x, y: gy, face: f, since: 1, dir: lerp(-30, 60, up), emotion: speed > 2 ? 'worried' : null });
            const sx = x + f * 60, sy = gy - 300 * 0.48, an = lerp(-0.5, 1.1, up) * -1, hx = sx + f * Math.cos(an) * 110, hy = sy + Math.sin(an) * 110;
            w.ham.setAttribute('d', inkPath([[sx, sy], [hx, hy]], { w: 6, seed: sd + 80 + i, t }) + ' ' + inkLoop([[hx - 20, hy - 14], [hx + 20, hy - 14], [hx + 20, hy + 14], [hx - 20, hy + 14]], { seed: sd + 90 + i, t, smooth: false }));
            w.hit.setAttribute('d', ph > 0.95 || ph < 0.08 ? inkLoop([[hx - 30, hy], [hx, hy - 30], [hx + 30, hy], [hx, hy + 30]], { seed: sd + 100 + i, t, smooth: false }) : ''); });
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_deck (crowded deck, summer heat, dice)
  SH.mi_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 103, root = el(svg, 'g'), sh = window.TZ.Shapes();
      const deckY = (P.ground ?? 0.84) * H;
      const sea = MI.waves(root, W, H, H * 0.5, sd + 1, { amp: 6, rows: 2 });
      const heat = Array.from({ length: 6 }, () => inkEl(root, INK.gold, { 'fill-opacity': 0.8 }));
      sh.add(root, [[W * 0.08, -30], [W * 0.08 + 40, -30], [W * 0.08 + 40, deckY], [W * 0.08, deckY]], { fill: mix(INK.paperDark, INK.stain, 0.55), stroke: INK.ink, w: 6 });
      sh.add(root, lt => [[-30, deckY - 170 + Math.sin(lt * 1.2) * 6], [W + 30, deckY - 180 + Math.sin(lt * 1.2) * 6]], { stroke: INK.ink, w: 12, closed: false });
      for (let k = 0; k < 14; k++) sh.add(root, lt => [[k * W / 13, deckY - 175 + Math.sin(lt * 1.2) * 6], [k * W / 13, deckY]], { stroke: INK.ink, w: 6, closed: false });
      const crowdG = el(root, 'g'), crowd = MI.soldiers(crowdG, sd + 5, { x: W * 0.16, y: deckY - 150, cols: 14, rows: 2, gap: 80, s: 0.75, face: -1 });
      sh.add(root, [[-30, deckY], [W + 30, deckY], [W + 30, H + 30], [-30, H + 30]], { fill: mix(INK.paperDark, INK.stain, 0.45), stroke: INK.ink, w: 6 });
      for (let k = 1; k < 5; k++) sh.add(root, [[-30, deckY + k * 50], [W + 30, deckY + k * 50]], { stroke: INK.inkSoft, w: 3, closed: false });
      const players = [0.34, 0.56].map((x, i) => ({ x, rig: KASIF.create(el(root, 'g'), { scale: 0.75, hat: false, accessory: 'helmet_byz', seed: sd + 20 + i }) }));
      const dice = Array.from({ length: 5 }, (_, i) => ({ f: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink), d: inkEl(root, INK.red), i }));
      const tiles = Array.from({ length: 4 }, (_, i) => ({ f: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink), i }));
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sea.update(t); sh.update(t, lt); crowd.update(t, lt, cues);
          heat.forEach((e, i) => { const x = W * (0.2 + i * 0.13), p = []; for (let k = 0; k < 6; k++) p.push([x + Math.sin(lt * 3 + k + i) * 14, H * 0.42 - k * 40 - ((lt * 30) % 40)]);
            e.setAttribute('d', P.heat === false ? '' : inkPath(p, { w: 4, seed: sd + 30 + i, t, amp: 0.5 })); });
          players.forEach((p, i) => p.rig.update(t, 'sit', { x: p.x * W + (i ? 120 : -120), y: deckY + 40, face: i ? -1 : 1, since: lt, emotion: 'happy' }));
          const da = A(cues, P.dice, 0.6), cx = W * 0.45, cy = deckY - 110;
          dice.forEach(({ f, l, d, i }) => { const u = clamp01((lt - da - i * 0.07) / 0.9), x = cx - 160 + i * 75 + (1 - u) * -200, y = cy - Math.abs(Math.sin(u * Math.PI * 2.5)) * 120 * (1 - u), rot = (1 - u) * 720 + i * 17, r = 30;
            if (lt < da) { f.setAttribute('d', ''); l.setAttribute('d', ''); d.setAttribute('d', ''); return; }
            const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), p = [[-r, -r], [r, -r], [r, r], [-r, r]].map(q => [x + q[0] * c - q[1] * s, y + q[0] * s + q[1] * c]);
            f.setAttribute('d', inkLoop(p, { seed: sd + 40 + i, t, smooth: false })); l.setAttribute('d', inkPath(p, { w: 4, seed: sd + 50 + i, t, closed: true, smooth: false }));
            d.setAttribute('d', inkDot(x, y, 6, 6, sd + 60 + i, t)); });
          tiles.forEach(({ f, l, i }) => { const x = W * 0.66 + i * 70, y = cy + 4, p = [[x - 24, y - 50], [x + 24, y - 50], [x + 24, y + 30], [x - 24, y + 30]];
            f.setAttribute('d', inkLoop(p, { seed: sd + 70 + i, t, smooth: false })); l.setAttribute('d', inkPath(p, { w: 4, seed: sd + 75 + i, t, closed: true, smooth: false }) + ' ' + inkDot(x, y - 28, 5, 5, sd + 80 + i, t) + ' ' + inkDot(x, y + 8, 5, 5, sd + 85 + i, t)); });
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_seabed
  SH.mi_seabed = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 113, root = el(svg, 'g'), sh = window.TZ.Shapes();
      const mode = P.mode || 'search', bed = (P.bed ?? (mode === 'dice' ? 0.42 : 0.66)) * H;
      const WATER = mix(INK.paper, INK.blue, 0.4), DEEP = mix(INK.paper, INK.blue, 0.58), MUD = mix(INK.paperDark, INK.inkSoft, 0.35);
      sh.add(root, [[-30, -30], [W + 30, -30], [W + 30, H + 30], [-30, H + 30]], { fill: WATER });
      sh.add(root, lt => { const p = [[-30, bed - 300]]; for (let i = 0; i <= 10; i++) p.push([i / 10 * W, bed - 280 + Math.sin(i + lt * 0.7) * 30]); p.push([W + 30, H + 30], [-30, H + 30]); return p; }, { fill: DEEP, smooth: true, amp: 2 });
      for (let i = 0; i < 4; i++) { const x = W * (0.1 + i * 0.25); sh.add(root, lt => { const s = Math.sin(lt * 0.6 + i * 2) * 40; return [[x - 40, -30], [x + 50, -30], [x + 240 + s, bed], [x + 80 + s, bed]]; }, { fill: INK.paperLight, fop: 0.18, amp: 0.5 }); }
      const bp = [[-30, bed + 20]]; for (let i = 0; i <= 12; i++) bp.push([i / 12 * W, bed + Math.sin(i * 1.1 + seed) * 22]); bp.push([W + 30, bed + 10], [W + 30, H + 30], [-30, H + 30]);
      sh.add(root, bp, { fill: MUD, stroke: INK.ink, w: 5, smooth: true });
      for (let j = 0; j < 6; j++) { const y = bed + 60 + j * 70; sh.add(root, [[-20, y], [W * 0.35, y - 8], [W * 0.7, y + 8], [W + 20, y - 4]], { stroke: INK.inkSoft, w: 2.5, closed: false, smooth: true }); }
      const objG = el(root, 'g'), objs = [];
      const item = (kind, x, y, at, s = 1) => {
        const g = el(objG, 'g'), es = { f: inkEl(g, kind === 'bomb' ? mix(INK.inkSoft, INK.stain, 0.45) : kind === 'tile' || kind === 'die' ? INK.paperLight : mix(INK.paperDark, INK.inkSoft, 0.55)), l: inkEl(g, INK.ink), d: inkEl(g, INK.red) };
        objs.push({ kind, x, y, at, s, es });
      };
      if (mode === 'hull' || mode === 'search') { const rb = el(objG, 'g'); objs.push({ kind: 'ribs', es: { f: inkEl(rb, mix(INK.paperDark, INK.stain, 0.55)), l: inkEl(rb, INK.ink) } }); }
      if (mode === 'finds') (P.items || [{ kind: 'helmet', x: 0.2, y: 0.7 }, { kind: 'sword', x: 0.42, y: 0.74 }, { kind: 'anchor', x: 0.64, y: 0.7 }, { kind: 'bomb', x: 0.84, y: 0.72 }]).forEach(o => item(o.kind, o.x * W, o.y * H, o.at, o.s || 1));
      if (mode === 'dice') { for (let i = 0; i < 5; i++) item('die', W * (0.18 + i * 0.07), bed + 120 + (i % 2) * 50, P.find, 1);
        for (let i = 0; i < 8; i++) item('tile', W * (0.56 + (i % 4) * 0.09), bed + 110 + Math.floor(i / 4) * 170, P.find, 1); }
      const diverG = el(root, 'g'), diver = { suit: inkEl(diverG, mix(INK.ink, INK.inkSoft, 0.4)), tank: inkEl(diverG, INK.gold), l: inkEl(diverG, INK.ink), mask: inkEl(diverG, mix(INK.paperLight, INK.blue, 0.3)), beam: inkEl(diverG, INK.paperLight, { 'fill-opacity': 0.3 }) };
      const bubG = el(root, 'g'), bubs = Array.from({ length: 10 }, (_, i) => ({ e: inkEl(bubG), ph: i / 10 }));
      const brush = mode === 'dice' ? { h: inkEl(root, mix(INK.stain, INK.inkSoft, 0.3)), l: inkEl(root, INK.ink) } : null;
      const silt = inkEl(root, INK.paperLight, { 'fill-opacity': 0.6 });
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sh.update(t, lt);
          const fa = A(cues, P.find, dur * 0.4);
          objs.forEach((o, i) => { const e = o.es;
            if (o.kind === 'ribs' && (mode === 'hull' || mode === 'search')) { const cx = W * 0.52, y = bed + 40, x0 = cx - 760, x1 = cx + 760, F = [], L = [];
              const bot = u => y + 70 - Math.pow(2 * u - 1, 2) * 70, top = u => y - 150 + Math.pow(2 * u - 1, 2) * 110 + ((u * 37) % 1 < 0.3 ? 18 : 0) * Math.sin(u * 40);
              const outline = []; for (let k = 0; k <= 20; k++) outline.push([lerp(x0, x1, k / 20), top(k / 20)]); for (let k = 20; k >= 0; k--) outline.push([lerp(x0, x1, k / 20), bot(k / 20)]);
              F.push(inkLoop(outline, { seed: sd + 300, t }));
              L.push(inkPath(outline, { w: 6, seed: sd + 301, t, closed: true }));
              for (let p = 1; p < 5; p++) { const pts = []; for (let k = 0; k <= 20; k++) { const u = k / 20; pts.push([lerp(x0, x1, u), lerp(top(u), bot(u), p / 5)]); } L.push(inkPath(pts, { w: 3, seed: sd + 310 + p, t })); }
              for (let k = 1; k < 16; k++) { const u = k / 16, x = lerp(x0, x1, u); L.push(inkPath([[x - 6, top(u) - 20], [x + 4, lerp(top(u), bot(u), 0.5)], [x + 10, bot(u)]], { w: 12, seed: sd + 330 + k, t })); }
              const keel = []; for (let k = 0; k <= 20; k++) keel.push([lerp(x0 - 40, x1 + 40, k / 20), bot(k / 20) + 14]); L.push(inkPath(keel, { w: 16, seed: sd + 360, t }));
              e.f.setAttribute('d', F.join(' ')); e.l.setAttribute('d', L.join(' ')); return; }
            if (o.kind === 'ribs') { const cx = W * (mode === 'hull' ? 0.5 : 0.6), y = bed + 30, n = mode === 'hull' ? 13 : 8, len = mode === 'hull' ? 1500 : 820, F = [], L = [];
              const kp = [[cx - len / 2, y + 30], [cx + len / 2, y + 10], [cx + len / 2, y + 50], [cx - len / 2, y + 70]]; F.push(inkLoop(kp, { seed: sd + 300, t, smooth: false })); L.push(inkPath(kp, { w: 5, seed: sd + 301, t, closed: true, smooth: false }));
              for (let k = 0; k < n; k++) { const x = cx - len / 2 + 40 + k * (len - 80) / (n - 1), hh = 70 + ((k * 37) % 50); const p = [[x - 14, y + 30], [x - 22, y - hh], [x + 4, y - hh - 10], [x + 14, y + 30]];
                F.push(inkLoop(p, { seed: sd + 310 + k, t, smooth: false })); L.push(inkPath(p, { w: 4, seed: sd + 340 + k, t, closed: true, smooth: false })); }
              if (mode === 'hull') for (let k = 0; k < 3; k++) { const yy = y + 90 + k * 46; const p = [[cx - len / 2 + 60, yy], [cx + len / 2 - 60, yy - 6], [cx + len / 2 - 60, yy + 28], [cx - len / 2 + 60, yy + 34]]; F.push(inkLoop(p, { seed: sd + 380 + k, t, smooth: false })); L.push(inkPath(p, { w: 4, seed: sd + 390 + k, t, closed: true, smooth: false })); }
              e.f.setAttribute('d', F.join(' ')); e.l.setAttribute('d', L.join(' ')); return; }
            const a = A(cues, o.at, fa - 0.3 + (i % 5) * 0.25), k = mode === 'dice' ? 1 : spring(lt, a, 0.6); if (k <= 0.01) { e.f.setAttribute('d', ''); e.l.setAttribute('d', ''); e.d.setAttribute('d', ''); return; }
            const x = o.x, y = o.y, s = o.s * k * (1 + 0.08 * punch(lt, a, 0.6)); let p, extra = '', dots = '';
            if (o.kind === 'helmet') p = [[x - 90 * s, y], [x - 80 * s, y - 70 * s], [x - 30 * s, y - 120 * s], [x, y - 150 * s], [x + 30 * s, y - 120 * s], [x + 80 * s, y - 70 * s], [x + 90 * s, y]];
            else if (o.kind === 'sword') { p = [[x - 170 * s, y - 10 * s], [x + 120 * s, y - 24 * s], [x + 170 * s, y - 20 * s], [x + 120 * s, y - 4 * s], [x - 170 * s, y + 10 * s]]; extra = inkPath([[x - 170 * s, y - 40 * s], [x - 170 * s, y + 40 * s]], { w: 10, seed: sd + 400 + i, t }); }
            else if (o.kind === 'anchor') p = [[x - 40 * s, y], [x - 30 * s, y - 220 * s], [x + 30 * s, y - 220 * s], [x + 40 * s, y]].concat([]);
            else if (o.kind === 'bomb') p = inkEllipsePts(x, y - 70 * s, 70 * s, 70 * s, sd + 410 + i, 12);
            else if (o.kind === 'die') { const r = 34 * s; p = [[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]]; dots = inkDot(x, y, 8, 8, sd + 420 + i, t) + ' ' + inkDot(x - 16, y - 16, 7, 7, sd + 421 + i, t) + ' ' + inkDot(x + 16, y + 16, 7, 7, sd + 422 + i, t); }
            else { const w = 52 * s, h = 100 * s; p = [[x - w, y - h], [x + w, y - h], [x + w, y + h], [x - w, y + h]]; dots = [[-0.4, -0.55], [0.4, -0.55], [0, 0.45], [-0.4, 0.45], [0.4, 0.45]].map((q, j) => inkDot(x + q[0] * w, y + q[1] * h, 8, 8, sd + 430 + i * 5 + j, t)).join(' ');
              extra = inkPath([[x - w + 8, y], [x + w - 8, y]], { w: 3, seed: sd + 440 + i, t }); }
            e.f.setAttribute('d', inkLoop(p, { seed: sd + 450 + i, t, smooth: o.kind === 'bomb' || o.kind === 'helmet' }));
            e.l.setAttribute('d', inkPath(p, { w: 5, seed: sd + 460 + i, t, closed: true, smooth: o.kind === 'bomb' || o.kind === 'helmet' }) + ' ' + extra +
              (o.kind === 'anchor' ? ' ' + inkPath([[x - 140 * s, y - 180 * s], [x + 140 * s, y - 200 * s]], { w: 14, seed: sd + 470 + i, t }) : ''));
            e.d.setAttribute('d', dots); });
          // diver (not in the dice close-up)
          if (mode !== 'dice') { const dx = (mode === 'hull' ? 0.26 : 0.3) * W + Math.sin(lt * 0.5) * 60 + lt * 14, dy = bed - 240 + Math.sin(lt * 1.1) * 14, ang = -0.25;
            const body = [[dx - 150, dy - 30], [dx + 90, dy - 40], [dx + 130, dy], [dx + 90, dy + 34], [dx - 150, dy + 26]];
            diver.suit.setAttribute('d', inkLoop(body, { seed: sd + 500, t }) + ' ' + inkLoop(inkEllipsePts(dx + 160, dy - 6, 46, 42, sd + 501, 10), { seed: sd + 502, t }));
            diver.tank.setAttribute('d', inkLoop([[dx - 120, dy - 70], [dx + 40, dy - 76], [dx + 40, dy - 36], [dx - 120, dy - 30]], { seed: sd + 503, t }));
            const kick = Math.sin(lt * 4) * 30;
            diver.l.setAttribute('d', inkPath(body, { w: 5, seed: sd + 504, t, closed: true }) + ' ' + inkPath([[dx - 150, dy - 10], [dx - 260, dy - 30 + kick], [dx - 330, dy - 40 + kick * 1.4]], { w: 16, seed: sd + 505, t }) +
              ' ' + inkPath([[dx - 150, dy + 14], [dx - 260, dy + 30 - kick], [dx - 330, dy + 40 - kick * 1.4]], { w: 16, seed: sd + 506, t }) + ' ' + inkPath([[dx + 90, dy + 20], [dx + 180, dy + 110], [dx + 230, dy + 150]], { w: 12, seed: sd + 507, t }));
            diver.mask.setAttribute('d', inkLoop(inkEllipsePts(dx + 190, dy - 10, 22, 18, sd + 508, 8), { seed: sd + 509, t }));
            diver.beam.setAttribute('d', inkLoop([[dx + 230, dy + 150], [dx + 520 + Math.sin(lt) * 60, bed + 40], [dx + 260 + Math.sin(lt) * 60, bed + 60]], { seed: sd + 510, t }));
            bubs.forEach((b, i) => { const u = (lt * 0.4 + b.ph) % 1; b.e.setAttribute('d', inkCircle(dx + 200 + Math.sin(u * 10 + i) * 14, dy - 40 - u * (dy + 40), 6 + u * 8, sd + 520 + i, t, { w: 3 })); }); }
          else { ['suit', 'tank', 'l', 'mask', 'beam'].forEach(k => diver[k].setAttribute('d', ''));
            bubs.forEach((b, i) => { const u = (lt * 0.3 + b.ph) % 1; b.e.setAttribute('d', inkCircle(W * (0.1 + i * 0.09), bed - u * bed, 6 + u * 8, sd + 520 + i, t, { w: 3 })); }); }
          if (brush) { const bx = W * 0.44 + Math.sin(lt * 3) * 120, by = bed + 40; brush.h.setAttribute('d', inkPath([[bx, by], [bx + 260, by - 300]], { w: 24, seed: sd + 540, t })); brush.l.setAttribute('d', inkPath([[bx - 30, by + 10], [bx + 30, by - 10]], { w: 18, seed: sd + 541, t })); }
          const S = []; for (let i = 0; i < 30; i++) { const x = ((i * 0.173 + lt * 0.01 * (i % 3 + 1)) % 1) * W, y = ((i * 0.311) % 1) * bed + Math.sin(lt + i) * 10; S.push(inkDot(x, y, 3, 3, sd + 600 + i, t)); }
          silt.setAttribute('d', S.join(' '));
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_hull (cross-sections)
  SH.mi_hull = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, MI = window.MI, sd = seed * 1000 + 127, root = el(svg, 'g');
      const single = !!P.single, wl = (P.water ?? 0.5) * H;
      const sea = MI.waves(root, W, H, wl, sd + 1, { amp: 10, rows: 3, storm: single });
      const mk = cx => ({ cx, f: inkEl(root, mix(INK.paperDark, INK.stain, 0.45)), l: inkEl(root, INK.ink), c: inkEl(root, INK.red), w: inkEl(root, INK.inkSoft) });
      const V = single ? null : mk(W * 0.28), F = mk(single ? W * 0.5 : W * 0.72);
      const crest = { f: inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35)), l: inkEl(root, INK.ink) };
      const com = common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sea.update(t);
          const wa = A(cues, P.wave, dur * 0.35), ca = A(cues, P.crack, wa + 0.6), wu = progIO(lt, wa, 1.4), hitK = Math.sin(clamp01((lt - wa) / 1.4) * Math.PI);
          const draw = (h, kind) => { if (!h) return; const s = single ? 1.5 : 1, cx = h.cx, y = wl;
            const tilt = (kind === 'v' ? 6 : 18) * hitK * (single ? 1.4 : 1) + Math.sin(lt * 1.5) * 2, c = Math.cos(tilt * Math.PI / 180), sn = Math.sin(tilt * Math.PI / 180);
            const R = q => [cx + (q[0] * c - q[1] * sn) * s, y + (q[0] * sn + q[1] * c) * s];
            const pts = kind === 'v' ? [[-220, -120], [-190, 40], [-60, 150], [0, 230], [60, 150], [190, 40], [220, -120]] : [[-260, -90], [-250, 50], [-200, 80], [200, 80], [250, 50], [260, -90]];
            const crack = kind === 'f' ? prog(lt, ca, 0.6) : 0;
            const split = q => crack > 0 && q[0] > 0 ? [q[0] + 30 * crack, q[1] + 20 * crack] : q;
            const P2 = pts.map(split).map(R);
            h.f.setAttribute('d', inkLoop(P2, { seed: sd + (kind === 'v' ? 10 : 20), t, smooth: false }));
            h.l.setAttribute('d', inkPath(P2, { w: 7, seed: sd + (kind === 'v' ? 11 : 21), t, closed: true, smooth: false }) + ' ' +
              (kind === 'v' ? inkPath([[0, 150], [0, 270]].map(R), { w: 22, seed: sd + 12, t }) + ' ' + inkPath([[-180, -60], [180, -60]].map(R), { w: 5, seed: sd + 13, t }) : inkPath([[-240, -10], [240, -10]].map(split).map(R), { w: 5, seed: sd + 22, t })));
            h.c.setAttribute('d', crack > 0 ? inkPath([[0, -90], [16, -30], [-12, 20], [8, 80]].map(R), { w: 8, seed: sd + 23, t }) : '');
            h.w.setAttribute('d', crack > 0.3 ? [0, 1, 2].map(k => inkDot(...R([10 + k * 8, 60 + ((lt * 200 + k * 40) % 120) - 120]), 8, 12, sd + 30 + k, t)).join(' ') : '');
          };
          draw(V, 'v'); draw(F, 'f');
          // the wave crest rolling in from the left
          const cx = lerp(-300, W + 300, wu), y = wl, h = 220 * (single ? 1.4 : 1);
          const cp = [[cx - 400, y + 40], [cx - 140, y - h * 0.4], [cx, y - h], [cx + 80, y - h * 0.9], [cx + 40, y - h * 0.6], [cx + 160, y + 40]];
          crest.f.setAttribute('d', lt >= wa && wu < 1 ? inkLoop(cp, { seed: sd + 40, t }) : ''); crest.l.setAttribute('d', lt >= wa && wu < 1 ? inkPath(cp, { w: 6, seed: sd + 41, t }) : '');
          com.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ mi_map
  const LAND = [
    [[110, 20], [117, 20], [117, 23.5], [118.5, 24.5], [119.5, 25.8], [120, 26.6], [120.7, 27.8], [121.5, 28.6], [121.9, 29.9], [121, 30.6], [121.9, 31.0], [121.0, 32.2], [120.6, 33.3], [119.6, 34.4], [119.2, 35.0], [120.2, 35.9], [120.8, 36.5], [122.5, 37.2], [121.6, 37.5], [120.7, 37.8], [119.0, 37.2], [118.0, 38.1], [117.7, 39.0], [119.3, 39.4], [121.2, 40.8], [122.2, 40.5], [121.2, 39.5], [121.6, 39.0], [122.6, 39.4], [124.3, 39.9], [125.1, 39.6], [125.4, 38.9], [124.9, 38.2], [125.3, 37.7], [126.1, 37.7], [126.6, 37.1], [126.3, 36.4], [126.5, 35.6], [126.3, 34.6], [127.0, 34.5], [127.6, 34.7], [128.4, 34.85], [129.0, 35.1], [129.4, 35.5], [129.5, 36.1], [129.4, 36.9], [129.2, 37.6], [128.6, 38.4], [128.0, 39.0], [127.5, 39.4], [128.4, 40], [129.7, 41], [130.7, 42.3], [131.5, 43], [133, 43], [135, 43.8], [138, 46], [138, 48], [110, 48]],
    [[129.6, 33.2], [129.9, 33.5], [130.4, 33.6], [131.0, 33.9], [131.6, 33.6], [131.7, 33.0], [131.6, 32.3], [131.4, 31.4], [131.0, 31.0], [130.6, 31.0], [130.2, 31.3], [130.3, 31.9], [130.6, 32.6], [130.2, 32.8], [129.8, 32.7], [129.6, 33.0]],
    [[130.9, 34.0], [131.4, 34.4], [132.2, 35.0], [133.0, 35.5], [134.2, 35.6], [135.4, 35.6], [136.0, 35.9], [136.8, 37.2], [137.5, 37.0], [138.5, 37.5], [140, 38.5], [142, 40], [142, 33], [136.0, 33.5], [135.2, 34.3], [134.2, 34.7], [133.0, 34.4], [132.2, 33.9], [131.4, 33.9]],
    [[132.0, 33.0], [132.6, 33.9], [133.6, 34.2], [134.6, 34.2], [134.7, 33.8], [134.2, 33.2], [133.2, 32.8], [132.6, 32.8]],
    [[129.2, 34.1], [129.45, 34.7], [129.35, 34.75], [129.15, 34.3]],
    [[129.65, 33.75], [129.8, 33.85], [129.8, 33.72], [129.68, 33.7]],
    [[129.7, 33.3], [129.8, 33.36], [129.82, 33.3], [129.74, 33.27]],
  ];
  SH.mi_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 139, root = el(svg, 'g');
      const [lo0, lo1, la0, la1] = P.bounds || [119, 137, 28.5, 40], kx = Math.cos((la0 + la1) / 2 * Math.PI / 180);
      const sc = Math.min((W - 160) / ((lo1 - lo0) * kx), (H - 160) / (la1 - la0)), lc = (lo0 + lo1) / 2, ac = (la0 + la1) / 2;
      const X = q => [W / 2 + (q[0] - lc) * kx * sc, H / 2 - (q[1] - ac) * sc];
      const sh = window.TZ.Shapes();
      sh.add(root, [[-30, -30], [W + 30, -30], [W + 30, H + 30], [-30, H + 30]], { fill: mix(INK.paperLight, INK.blue, 0.12) });
      for (let i = 1; i < 8; i++) { sh.add(root, [[i / 8 * W, -20], [i / 8 * W, H + 20]], { stroke: INK.inkSoft, w: 1.5, closed: false }); if (i < 5) sh.add(root, [[-20, i / 5 * H], [W + 20, i / 5 * H]], { stroke: INK.inkSoft, w: 1.5, closed: false }); }
      LAND.forEach((poly, i) => sh.add(root, poly.map(X), { fill: mix(INK.paperDark, INK.stain, 0.3), stroke: INK.ink, w: Math.max(3, Math.min(6, sc / 30)), smooth: true, amp: 1 }));
      // wave ticks in the sea
      const waveE = inkEl(root, INK.inkSoft);
      const seaNames = (P.seas || []).map(s => { const tx = el(root, 'text', { 'font-family': INK_FONT, 'font-size': s.size || 46, fill: INK.blue, 'text-anchor': 'middle', 'font-style': 'italic' }); tx.textContent = s.name; return { s, tx }; });
      const routeG = el(root, 'g'), routes = (P.routes || []).map((r, i) => ({ r, e: inkEl(routeG, r.color === 'blue' ? INK.blue : INK.red), head: inkEl(routeG, r.color === 'blue' ? INK.blue : INK.red),
        icons: Array.from({ length: r.fleet ?? 0 }, () => ({ f: inkEl(routeG, INK.paperLight), l: inkEl(routeG, INK.ink) })) }));
      const swarmG = el(root, 'g'), swarm = P.swarm ? Array.from({ length: P.swarm.n || 30 }, () => ({ f: inkEl(swarmG, INK.paperLight), l: inkEl(swarmG, INK.ink) })) : [];
      const placeG = el(root, 'g'), places = (P.places || []).map((p, i) => {
        const g = el(placeG, 'g'), dot = inkEl(g, p.color === 'red' ? INK.red : INK.ink);
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': p.size || 52, fill: p.color === 'red' ? INK.red : INK.ink, 'text-anchor': p.anchor || 'start', 'dominant-baseline': 'central', 'paint-order': 'stroke', stroke: INK.paperLight, 'stroke-width': 10 });
        tx.textContent = p.name; return { p, g, dot, tx }; });
      const comp = { e: inkEl(root, INK.ink), n: el(root, 'text', { 'font-family': INK_FONT, 'font-size': 48, fill: INK.ink, 'text-anchor': 'middle' }) }; comp.n.textContent = 'N';
      const com = common(root, P, W, H, sd);
      const along = (pts, u) => { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
        let k = u * tot; for (let i = 1; i < pts.length; i++) { if (k <= L[i - 1]) { const f = k / L[i - 1]; return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; } k -= L[i - 1]; }
        const n = pts.length - 1; return [pts[n][0], pts[n][1], Math.atan2(pts[n][1] - pts[n - 1][1], pts[n][0] - pts[n - 1][0])]; };
      const icon = (x, y, a, s) => { const c = Math.cos(a), sn = Math.sin(a); return [[-22, -10], [18, -10], [30, 0], [18, 10], [-22, 10]].map(q => [x + (q[0] * c - q[1] * sn) * s, y + (q[0] * sn + q[1] * c) * s]); };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt; sh.update(t, lt);
          const WV = []; for (let i = 0; i < 14; i++) { const x = ((i * 0.37 + 0.05) % 1) * W, y = ((i * 0.53 + 0.1) % 1) * H, dx = Math.sin(lt * 1.5 + i) * 8; WV.push(inkPath([[x + dx, y], [x + 24 + dx, y - 10], [x + 48 + dx, y]], { w: 3, seed: sd + 10 + i, t })); }
          waveE.setAttribute('d', WV.join(' '));
          seaNames.forEach(({ s, tx }) => { const [x, y] = X([s.x, s.y]); tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(y)); });
          routes.forEach(({ r, e, head, icons }, i) => { const a = A(cues, r.at, 0.4 + i * 0.6), u = prog(lt, a, r.dur || 2), pts = r.pts.map(X);
            if (u <= 0) { e.setAttribute('d', ''); head.setAttribute('d', ''); icons.forEach(c => { c.f.setAttribute('d', ''); c.l.setAttribute('d', ''); }); return; }
            const seg = []; const N = 40; for (let k = 0; k <= N * u; k++) { const q = along(pts, k / N); seg.push([q[0], q[1]]); }
            const dash = []; for (let k = 0; k + 1 < seg.length; k += 2) dash.push(inkPath([seg[k], seg[k + 1]], { w: 7, seed: sd + 100 + i * 50 + k, t, amp: 0.6 }));
            e.setAttribute('d', dash.join(' '));
            const hd = along(pts, u), hl = 34; head.setAttribute('d', inkLoop([[hd[0] + Math.cos(hd[2]) * hl, hd[1] + Math.sin(hd[2]) * hl], [hd[0] + Math.cos(hd[2] + 2.4) * hl, hd[1] + Math.sin(hd[2] + 2.4) * hl], [hd[0] + Math.cos(hd[2] - 2.4) * hl, hd[1] + Math.sin(hd[2] - 2.4) * hl]], { seed: sd + 90 + i, t, smooth: false }));
            icons.forEach((c, k) => { const q = along(pts, clamp01(u - k * 0.035)), off = ((k % 3) - 1) * 26, p = icon(q[0] - Math.sin(q[2]) * off, q[1] + Math.cos(q[2]) * off, q[2], 1.1);
              c.f.setAttribute('d', inkLoop(p, { seed: sd + 200 + i * 20 + k, t, smooth: false })); c.l.setAttribute('d', inkPath(p, { w: 3.5, seed: sd + 230 + i * 20 + k, t, closed: true, smooth: false })); }); });
          if (P.swarm) { const a = A(cues, P.swarm.at, 0.3), [cx, cy] = X([P.swarm.x, P.swarm.y]), R = (P.swarm.r || 0.5) * sc;
            swarm.forEach((c, k) => { const pin = spring(lt, a + k * 0.03, 0.4); const ang = k * 2.39996, rr = R * Math.sqrt((k + 0.5) / swarm.length), x = cx + Math.cos(ang) * rr * 1.4, y = cy + Math.sin(ang) * rr * 0.8 + Math.sin(lt * 2 + k) * 3;
              const p = icon(x, y, 0.2 * Math.sin(k), Math.max(0.01, pin));
              c.f.setAttribute('d', pin > 0.01 ? inkLoop(p, { seed: sd + 300 + k, t, smooth: false }) : ''); c.l.setAttribute('d', pin > 0.01 ? inkPath(p, { w: 3, seed: sd + 340 + k, t, closed: true, smooth: false }) : ''); }); }
          places.forEach(({ p, g, dot, tx }, i) => { const a = A(cues, p.at, 0.2 + i * 0.25), k = spring(lt, a, 0.5); if (k <= 0.01) { g.style.display = 'none'; return; } g.style.display = '';
            const [x, y] = X([p.x, p.y]); dot.setAttribute('d', p.dot === false ? '' : inkDot(x, y, 12 * k, 12 * k, sd + 400 + i, t));
            tx.setAttribute('x', f1(x + (p.dx ?? 24))); tx.setAttribute('y', f1(y + (p.dy ?? 0))); tx.setAttribute('font-size', f1((p.size || 52) * Math.min(1, k))); });
          const cxp = W - 120, cyp = H - 150, rr = 60;
          comp.e.setAttribute('d', inkPath(inkEllipsePts(cxp, cyp, rr, rr, sd + 500, 14), { w: 4, seed: sd + 501, t, closed: true }) + ' ' + inkLoop([[cxp, cyp - rr * 1.2], [cxp + 16, cyp], [cxp, cyp + rr * 1.2], [cxp - 16, cyp]], { seed: sd + 502, t, smooth: false }));
          comp.n.setAttribute('x', cxp); comp.n.setAttribute('y', f1(cyp - rr * 1.35));
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
