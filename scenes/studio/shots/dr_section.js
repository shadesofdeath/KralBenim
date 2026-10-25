// dr_section: cross-section of a rock-cut underground city (Derinkuyu, Cappadocia) in parchment ink (BRAND.md §3, §5).
// Surface village (flat-roofed stone houses, a fairy-chimney rock, grass) on top; below it soft tuff with strata and
// pebbles; carved chambers on several levels (stable with a donkey, wine press with a trickle, kitchen with a pot,
// living room with niches, cross-plan church) linked by sloping tunnels; vertical ventilation shafts (air arrows run
// down on a cue) and a well shaft (bucket goes up/down, water ripples); flickering lamps in the rooms; a depth gauge
// on the left that scrolls with the camera; an optional dashed "apartment block" sunk beside the city, drawn floor by
// floor; soot from the lamps that darkens the ceilings; entrances sealed with rubble; "ghost" mode (chambers faint:
// a city nobody has seen yet); cast (Kaşif with a lantern, villagers) standing on a level.
// Units: world x = 0..1 of W, world y in metres below the surface (k px per metre, surface = 0, up is negative).
// P: {
//   k: 26 (px per metre), cam: {d0: 4, d1: 4 (centre depth, m), z0: 1, z1: 1.04, x0: 0.5, x1: 0.5, at: 0, dur: scene},
//   levels: [{x0, x1, d (floor depth m), h: 7 (m), kind: "stable"|"press"|"kitchen"|"room"|"church"|"store", lamp: true}]
//     (default: a 9-chamber Derinkuyu-like layout from 6 m to 82 m),
//   tunnels: [[[x, d], ...]] (default links the levels), shafts: [{x, d0: 0, d1: 60, kind: "air"|"well"}] (default 3 air + 1 well),
//   air: cue (arrows run down the air shafts), well: cue (bucket moves), smoke: cue (soot), sealed: cue (rubble plugs the
//   entrances), ghost: true (chambers drawn faint), houses: true, gauge: {mark: 85, at: cue} | true | false,
//   tower: {x: 0.9, floors: 20, at: cue, dur: 2.4, label: "20 KAT"} (dashed apartment block hanging down from the surface),
//   highlight: [{level: i, at: cue, text: "Ahır", color: "red", below: false}] (ring + hand-written label, screen-space),
//   people: [{level: i, x, pose: "sit"|"idle", accessory, beard, face}] (small villagers, idle),
//   cast: [DRL cast entries; x 0..1 W, y = depth m (floor) or level: i], labels: [{text, x, y (0..1 screen), at, size, color}],
//   stamp: {text: "85 M", at, x: 0.8, y: 0.2},
//   front: [DRL cast entries in screen space: x/y 0..1 of W/H] (a big narrator in front of the section),
//   levels[].ghost: true (only that chamber faint), well_span: m (bucket travel; default to the surface),
//   kicker_mask: false (default: a paper patch keeps the brand/kicker corner clear)
// }
// cues: air, well, smoke, sealed, tower.at, gauge.at, stamp.at, highlight[].at, cast/label at names, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const DEF_LEVELS = [
    { x0: 0.16, x1: 0.42, d: 9, kind: 'stable' }, { x0: 0.56, x1: 0.84, d: 9, kind: 'room' },
    { x0: 0.26, x1: 0.6, d: 18, kind: 'press' },
    { x0: 0.1, x1: 0.38, d: 30, kind: 'kitchen' }, { x0: 0.55, x1: 0.86, d: 30, kind: 'store' },
    { x0: 0.3, x1: 0.68, d: 45, kind: 'room' },
    { x0: 0.12, x1: 0.42, d: 60, kind: 'room' }, { x0: 0.56, x1: 0.86, d: 62, kind: 'room' },
    { x0: 0.32, x1: 0.7, d: 82, kind: 'church' },
  ];
  const DEF_TUNNELS = [
    [[0.3, -1], [0.3, 9]], [[0.42, 8.4], [0.56, 8.4]], [[0.4, 9], [0.45, 13], [0.4, 18]],
    [[0.58, 18], [0.6, 24], [0.62, 30]], [[0.28, 18], [0.24, 24], [0.24, 30]], [[0.36, 30], [0.4, 38], [0.45, 45]],
    [[0.66, 45], [0.7, 54], [0.7, 62]], [[0.32, 45], [0.28, 52], [0.26, 60]], [[0.42, 59.6], [0.56, 61.4]],
    [[0.6, 62], [0.58, 72], [0.56, 82]],
  ];
  const DEF_SHAFTS = [{ x: 0.5, d0: 0, d1: 45, kind: 'air' }, { x: 0.9, d0: 0, d1: 62, kind: 'air' },
    { x: 0.08, d0: 0, d1: 60, kind: 'air' }, { x: 0.76, d0: 0, d1: 82, kind: 'well' }];

  SH.dr_section = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, dur: sdur } = ctx;
      const D = window.DRL, sd = seed * 1000 + 811, atOr = D.atOr, f1 = D.f1;
      const k = P.k || 26, X = u => u * W, Y = d => d * k;
      const levels = (P.levels || DEF_LEVELS).map(l => Object.assign({ h: 7, lamp: true }, l));
      const tunnels = P.tunnels || (P.levels ? [] : DEF_TUNNELS);
      const shafts = P.shafts || (P.levels ? [] : DEF_SHAFTS);
      const deep = Math.max(90, ...levels.map(l => l.d + 6));
      const root = el(svg, 'g'), cam = el(root, 'g'), scr = el(root, 'g');
      // paper mask behind the brand + kicker (top-left), so the drawing never runs under it
      const kmask = P.kicker_mask === false ? null : inkEl(scr, INK.paper, { 'fill-opacity': 0.94 });
      // sky + surface
      const skyG = el(cam, 'g'), rockFill = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 });
      const rockG = el(cam, 'g');
      const tex = D.rock(rockG, -1.2 * W, 2.2 * W, Y(0.6), Y(deep), sd + 1, { gap: 130 });
      const tunG = el(cam, 'g'), chG = el(cam, 'g'), shG = el(cam, 'g'), fxG = el(cam, 'g'), surfG = el(cam, 'g'), castG = el(cam, 'g');
      const tun = tunnels.map((p, i) => ({ p, b: D.band(tunG, sd + 40 + i * 3) }));
      const sha = shafts.map((s, i) => ({ s, b: D.band(shG, sd + 90 + i * 3), arrows: Array.from({ length: 4 }, () => inkEl(fxG, INK.blue)),
        water: s.kind === 'well' ? inkEl(fxG, INK.blue, { 'fill-opacity': 0.8 }) : null, rope: s.kind === 'well' ? inkEl(fxG, INK.ink) : null,
        bucket: s.kind === 'well' ? inkEl(fxG, INK.hat) : null, cap: inkEl(surfG, INK.inkSoft) }));
      const cham = levels.map((l, i) => ({ l, fill: inkEl(chG, INK.paperLight), soot: inkEl(chG, INK.inkSoft, { 'fill-opacity': 0 }),
        rim: inkEl(chG, INK.ink), deco: inkEl(chG, INK.ink), deco2: inkEl(chG, INK.hat),
        glow: l.lamp ? el(chG, 'circle', { fill: INK.gold, 'fill-opacity': 0.25 }) : null, flame: l.lamp ? inkEl(chG, INK.gold) : null,
        smoke: [0, 1, 2].map(() => inkEl(chG, INK.inkSoft, { 'fill-opacity': 0.6 })) }));
      const people = (P.people || []).map((p, i) => {
        const l = levels[p.level] || levels[0];
        return { p, l, rig: KASIF.create(el(castG, 'g'), { scale: p.scale ?? 0.34, hat: false, accessory: p.accessory || null, beard: p.beard || null, seed: sd + 300 + i * 7 }) };
      });
      const cast = D.cast(castG, P.cast, sd + 600, (x, y, m) => {
        const lv = m.level != null ? levels[m.level] : null;
        return [X(x), Y(lv ? lv.d : (y ?? 0))];
      });
      // surface: houses, fairy chimney, ground line, grass
      const ground = inkEl(surfG, INK.ink), grass = inkEl(surfG, INK.inkSoft);
      const houses = (P.houses === false ? [] : [[0.24, 1], [0.36, 0.8], [0.62, 1.1], [0.74, 0.85]]).map(([x, s], i) => ({ x, s, f: inkEl(surfG, INK.paperLight), r: inkEl(surfG, INK.ink), dr: inkEl(surfG, INK.ink) }));
      const chim = { f: inkEl(skyG, INK.paperLight), r: inkEl(skyG, INK.inkSoft) };
      const rubble = shafts.length || tunnels.length ? [0, 1, 2, 3, 4].map(() => inkEl(surfG, INK.ink, { 'fill-opacity': 0.85 })) : [];
      // tower (sunk apartment block)
      const tw = P.tower ? { r: inkEl(fxG, INK.red), fl: inkEl(fxG, INK.red, { 'fill-opacity': 0.8 }) } : null;
      // screen space: gauge, labels, stamp
      const gauge = P.gauge === false ? null : { line: inkEl(scr, INK.ink), ticks: inkEl(scr, INK.ink), txt: [], mark: P.gauge && P.gauge.mark ? { box: inkEl(scr, INK.paperLight), rim: inkEl(scr, INK.red), t: el(scr, 'text', { 'font-family': D.FR, 'font-weight': 900, 'font-size': 64, fill: INK.red, 'text-anchor': 'start', 'dominant-baseline': 'central' }) } : null };
      if (gauge) for (let i = 0; i < 12; i++) gauge.txt.push(el(scr, 'text', { 'font-family': INK_FONT, 'font-size': 46, fill: INK.inkSoft, 'text-anchor': 'start', 'dominant-baseline': 'central' }));
      if (gauge && gauge.mark) gauge.mark.t.textContent = `${P.gauge.mark} m`;
      const hl = (P.highlight || []).map((h, i) => ({ h, ring: inkEl(scr, h.color === 'blue' ? INK.blue : INK.red), t: (() => { const t = el(scr, 'text', { 'font-family': INK_FONT, 'font-size': h.size || 60, fill: h.color === 'blue' ? INK.blue : INK.red, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); t.textContent = h.text || ''; return t; })() }));
      const towerCard = P.tower && P.tower.label ? { f: inkEl(scr, INK.paperLight), r: inkEl(scr, INK.ink) } : null;
      const towerTxt = P.tower && P.tower.label ? (() => { const t = el(scr, 'text', { 'font-family': D.FR, 'font-weight': 900, 'font-size': 66, fill: INK.red, 'text-anchor': 'end', 'dominant-baseline': 'central' }); t.textContent = P.tower.label; return t; })() : null;
      const lab = window.MCB ? MCB.labels(el(scr, 'g'), P.labels, W, H, sd + 950) : null;
      const front = P.front ? D.cast(el(scr, 'g'), P.front, sd + 1200, (x, y) => [x * W, (y ?? 0.9) * H]) : null;
      const stamp = P.stamp ? MCB.labels(el(scr, 'g'), [Object.assign({ stamp: true, x: 0.8, y: 0.2, color: 'red', size: 96 }, P.stamp)], W, H, sd + 970) : null;
      const C = Object.assign({ d0: 4, d1: 4, z0: 1, z1: 1.04, x0: 0.5, x1: 0.5, at: 0 }, P.cam || {});

      const chamberPts = (l) => {
        const x0 = X(l.x0), x1 = X(l.x1), yb = Y(l.d), yt = Y(l.d - l.h), w = x1 - x0;
        return [[x0, yb], [x0 - 6, yb - (yb - yt) * 0.55], [x0 + w * 0.12, yt + 10], [x0 + w * 0.5, yt - 6], [x1 - w * 0.12, yt + 10], [x1 + 6, yb - (yb - yt) * 0.55], [x1, yb]];
      };
      const decoOf = (l, t, lt, i) => {
        const x0 = X(l.x0), x1 = X(l.x1), yb = Y(l.d), cx = (x0 + x1) / 2, hh = l.h * k, s = hh / 182;
        const P2 = (pts, w = 5, n = 0) => inkPath(pts, { w: w * Math.max(0.7, s), seed: sd + 2000 + i * 20 + n, t, amp: 1 });
        const out = [], out2 = [];
        if (l.kind === 'stable') {          // donkey + trough
          const dx = x0 + (x1 - x0) * 0.62, b = Math.sin(lt * 2 + i) * 4 * s;
          out.push(P2([[dx - 70 * s, yb - 70 * s], [dx + 40 * s, yb - 72 * s]], 26), P2([[dx - 60 * s, yb - 60 * s], [dx - 62 * s, yb]], 6, 1), P2([[dx + 30 * s, yb - 60 * s], [dx + 32 * s, yb]], 6, 2),
            P2([[dx + 40 * s, yb - 74 * s], [dx + 62 * s, yb - 110 * s + b], [dx + 92 * s, yb - 98 * s + b]], 16, 3), P2([[dx + 62 * s, yb - 116 * s + b], [dx + 58 * s, yb - 150 * s + b]], 6, 4), P2([[dx - 70 * s, yb - 74 * s], [dx - 90 * s, yb - 46 * s + b]], 4, 5));
          out2.push(inkLoop([[x0 + 30 * s, yb - 40 * s], [x0 + 130 * s, yb - 40 * s], [x0 + 120 * s, yb], [x0 + 40 * s, yb]], { seed: sd + 2100 + i, t, smooth: false }));
        } else if (l.kind === 'press') {   // basin + channel + jar, a trickle that moves
          const bx = x0 + (x1 - x0) * 0.3;
          out.push(P2([[bx - 80 * s, yb - 50 * s], [bx - 70 * s, yb], [bx + 70 * s, yb], [bx + 80 * s, yb - 50 * s]], 6), P2([[bx + 80 * s, yb - 34 * s], [bx + 150 * s, yb - 20 * s]], 5, 1));
          const jx = bx + 190 * s;
          out2.push(inkLoop(inkEllipsePts(jx, yb - 40 * s, 34 * s, 40 * s, sd + 2200 + i, 10), { seed: sd + 2201 + i, t }));
          const ph = (lt * 1.5) % 1;
          out.push(inkDot(bx + 80 * s + 70 * s * ph, yb - 34 * s + 14 * s * ph, 6 * s, 5 * s, sd + 2202 + i, t));
        } else if (l.kind === 'kitchen') {  // pot on a hearth
          const px = x0 + (x1 - x0) * 0.35;
          out.push(P2([[px - 60 * s, yb - 66 * s], [px - 50 * s, yb - 20 * s], [px + 50 * s, yb - 20 * s], [px + 60 * s, yb - 66 * s]], 7), P2([[px - 70 * s, yb - 66 * s], [px + 70 * s, yb - 66 * s]], 6, 1));
          out2.push(inkLoop([[px - 40 * s, yb], [px - 20 * s, yb - 18 * s - Math.abs(Math.sin(lt * 9)) * 8 * s], [px, yb - 6 * s], [px + 20 * s, yb - 20 * s], [px + 40 * s, yb]], { seed: sd + 2300 + i, t }));
        } else if (l.kind === 'church') {   // cross-plan apse + cross
          const yt = Y(l.d - l.h);
          out.push(P2([[cx - 90 * s, yb], [cx - 90 * s, yt + 70 * s], [cx, yt + 20 * s], [cx + 90 * s, yt + 70 * s], [cx + 90 * s, yb]], 5));
          out2.push(inkPath([[cx, yt + 60 * s], [cx, yt + 150 * s]], { w: 10 * s, seed: sd + 2400 + i, t }) + inkPath([[cx - 30 * s, yt + 88 * s], [cx + 30 * s, yt + 88 * s]], { w: 10 * s, seed: sd + 2401 + i, t }));
        } else if (l.kind === 'store') {    // jars in a row
          for (let j = 0; j < 3; j++) out2.push(inkLoop(inkEllipsePts(x0 + (x1 - x0) * (0.25 + j * 0.2), yb - 34 * s, 26 * s, 34 * s, sd + 2500 + i * 5 + j, 10), { seed: sd + 2510 + i * 5 + j, t }));
        } else {                            // room: two wall niches
          for (let j = 0; j < 2; j++) { const nx = x0 + (x1 - x0) * (0.22 + j * 0.56); out.push(P2([[nx - 24 * s, yb - 60 * s], [nx - 24 * s, yb - 100 * s], [nx, yb - 118 * s], [nx + 24 * s, yb - 100 * s], [nx + 24 * s, yb - 60 * s]], 4, 10 + j)); }
        }
        return [out.join(' '), out2.join(' ')];
      };

      return {
        update(lt, dur, cues) {
          const t = lt, hit = punch(lt, cue(cues, 'hit', null));
          const ca = atOr(cues, C.at, 0), cd = C.dur ?? Math.max(1, dur - ca), u = progIO(lt, ca, cd);
          const cdp = lerp(C.d0, C.d1, u), z = lerp(C.z0, C.z1, u) * (1 + 0.03 * hit), cxw = lerp(C.x0, C.x1, u) * W;
          const tf = (wx, wy) => [W / 2 + (wx - cxw) * z, H / 2 + (wy - Y(cdp)) * z];
          cam.setAttribute('transform', `translate(${f1(W / 2 + Math.sin(lt * 0.4) * 3)} ${f1(H / 2)}) scale(${z.toFixed(4)}) translate(${f1(-cxw)} ${f1(-Y(cdp))})`);
          // rock
          rockFill.setAttribute('d', inkLoop([[-1.5 * W, Y(0.3)], [2.5 * W, Y(0.3)], [2.5 * W, Y(deep + 20)], [-1.5 * W, Y(deep + 20)]], { seed: sd + 3, t, amp: 0.5, smooth: false }));
          tex.update(t);
          // fairy chimney + houses + ground
          const fcx = X(0.5), fs = 1.1;
          chim.f.setAttribute('d', inkLoop([[fcx - 90 * fs, 0], [fcx - 40 * fs, -230 * fs], [fcx, -300 * fs], [fcx + 40 * fs, -230 * fs], [fcx + 90 * fs, 0]], { seed: sd + 5, t }));
          chim.r.setAttribute('d', inkPath([[fcx - 90 * fs, 0], [fcx - 40 * fs, -230 * fs], [fcx, -300 * fs], [fcx + 40 * fs, -230 * fs], [fcx + 90 * fs, 0]], { w: 4, seed: sd + 6, t }) + inkCircle(fcx, -150 * fs, 20, sd + 7, t, { w: 4 }));
          houses.forEach((h, i) => {
            const x = X(h.x), w = 150 * h.s, hh = 120 * h.s;
            const b = [[x - w / 2, 0], [x - w / 2, -hh], [x + w / 2, -hh - 4], [x + w / 2, 0]];
            h.f.setAttribute('d', inkLoop(b, { seed: sd + 10 + i, t, smooth: false }));
            h.r.setAttribute('d', inkPath(b, { w: 5, seed: sd + 20 + i, t, smooth: false }) + ' ' + inkPath([[x - w / 2 - 12, -hh], [x + w / 2 + 12, -hh - 4]], { w: 8, seed: sd + 25 + i, t }));
            h.dr.setAttribute('d', inkPath([[x - 18 * h.s, 0], [x - 18 * h.s, -50 * h.s], [x, -64 * h.s], [x + 18 * h.s, -50 * h.s], [x + 18 * h.s, 0]], { w: 4, seed: sd + 30 + i, t }) + ' ' + inkDot(x + w * 0.3, -hh * 0.65, 10 * h.s, 12 * h.s, sd + 35 + i, t));
          });
          const gp = []; for (let x = -1.5; x <= 2.5; x += 0.05) gp.push([X(x), Math.sin(x * 40) * 3]);
          ground.setAttribute('d', inkPath(gp, { w: 6, seed: sd + 40, t, amp: 1 }));
          const gr = []; for (let i = 0; i < 26; i++) { const x = X(-0.2 + i * 0.055 + 0.01 * Math.sin(i * 7)), sw = Math.sin(lt * 2 + i) * 4; gr.push(inkPath([[x, 0], [x + sw, -22]], { w: 3, seed: sd + 50 + i, t, amp: 0.6 })); }
          grass.setAttribute('d', gr.join(' '));
          // tunnels, shafts
          tun.forEach(({ p, b }) => b.update(p.map(q => [X(q[0]), Y(q[1])]), t, 42));
          const airA = atOr(cues, P.air, null), wellA = atOr(cues, P.well, null), sealA = atOr(cues, P.sealed, null);
          const sealP = sealA != null ? prog(lt, sealA, 0.9) : 0;
          sha.forEach(({ s, b, arrows, water, rope, bucket, cap }, i) => {
            const x = X(s.x), y0 = Y(s.d0 ?? 0) - 6, y1 = Y(s.d1);
            b.update([[x, y0], [x, y1]], t, s.kind === 'well' ? 40 : 30);
            arrows.forEach((a, j) => {
              if (s.kind !== 'air' || airA == null || lt < airA) { a.setAttribute('d', ''); return; }
              const ph = ((lt - airA) * 0.35 + j / arrows.length) % 1, yy = lerp(y0 + 40, y1 - 30, ph);
              a.setAttribute('d', inkPath([[x, yy - 80], [x, yy]], { w: 9, seed: sd + 120 + i * 9 + j, t }) + ' ' + inkPath([[x - 22, yy - 24], [x, yy], [x + 22, yy - 24]], { w: 9, seed: sd + 130 + i * 9 + j, t, smooth: false }));
            });
            if (water) {
              const wp = []; for (let q = -1; q <= 1; q += 0.25) wp.push([x + q * 20, y1 - 30 + Math.sin(q * 6 + lt * 5) * 3]);
              water.setAttribute('d', inkLoop(wp.concat([[x + 20, y1], [x - 20, y1]]), { seed: sd + 140 + i, t, smooth: false }));
              const bp = wellA != null ? Math.abs(Math.sin(Math.max(0, lt - wellA) * 0.9)) : 0.15;
              const by = P.well_span ? lerp(y1 - 50, y1 - 50 - P.well_span * k, bp) : lerp(y1 - 50, y0 + 60, bp);
              rope.setAttribute('d', inkPath([[x, y0 - 30], [x, by - 20]], { w: 3, seed: sd + 150 + i, t, amp: 0.5 }));
              bucket.setAttribute('d', inkLoop([[x - 17, by - 26], [x + 17, by - 26], [x + 13, by + 10], [x - 13, by + 10]], { seed: sd + 155 + i, t, smooth: false }));
              if (wellA != null) cap.setAttribute('d', inkPath([[x - 40, -6], [x - 40, -70], [x + 40, -70], [x + 40, -6]], { w: 6, seed: sd + 160 + i, t, smooth: false }));
            }
          });
          // rubble plugs at the surface entrances
          rubble.forEach((r, i) => {
            if (sealP <= 0.01) { r.setAttribute('d', ''); return; }
            const src = i < tunnels.length ? (tunnels[0] || [[0.3, 0]])[0] : [0.3, 0];
            const xs = [X(src[0]), ...shafts.map(s => X(s.x))][i] ?? X(0.3);
            const pts = []; for (let j = 0; j < 7; j++) { const a = j / 7 * 6.283; pts.push([xs + Math.cos(a) * 30, 12 + Math.sin(a) * 26]); }
            r.setAttribute('d', [0, 1, 2, 3, 4].map(q => inkDot(xs - 50 + q * 25, lerp(-160, -20 + (q % 2) * 26 + q * 6, sealP), 34, 26, sd + 170 + i * 5 + q, t)).join(' '));
          });
          // chambers
          const ghostAll = !!P.ghost, smA = atOr(cues, P.smoke, null);
          cham.forEach((c, i) => {
            const pts = chamberPts(c.l), ghost = ghostAll || !!c.l.ghost;
            c.fill.setAttribute('d', inkLoop(pts, { seed: sd + 200 + i, t, amp: 1.2 }));
            c.fill.setAttribute('fill-opacity', ghost ? 0.35 : 1);
            c.rim.setAttribute('d', inkPath(pts, { w: ghost ? 3 : 6, seed: sd + 220 + i, t, closed: true }));
            c.rim.setAttribute('fill', ghost ? INK.inkSoft : INK.ink);
            const [d1, d2] = ghost ? ['', ''] : decoOf(c.l, t, lt, i);
            c.deco.setAttribute('d', d1); c.deco2.setAttribute('d', d2);
            const yb = Y(c.l.d), yt = Y(c.l.d - c.l.h), lx = X(c.l.x0) + (X(c.l.x1) - X(c.l.x0)) * 0.82, ly = yb - (yb - yt) * 0.55;
            if (c.glow) {
              const fk = 0.85 + 0.15 * Math.sin(t * 11 + i * 2) * Math.sin(t * 6.1 + i);
              c.glow.setAttribute('cx', f1(lx)); c.glow.setAttribute('cy', f1(ly)); c.glow.setAttribute('r', ghost ? 0 : f1(70 * fk));
              c.flame.setAttribute('d', ghost ? '' : inkLoop([[lx - 8, ly + 10], [lx, ly - 16 * fk], [lx + 8, ly + 10]], { seed: sd + 260 + i, t }) + ' ' + inkPath([[lx - 18, ly + 14], [lx + 18, ly + 14]], { w: 7, seed: sd + 261 + i, t }));
            }
            const sp = smA != null ? prog(lt, smA, 3) : 0;
            c.soot.setAttribute('fill-opacity', (0.55 * sp).toFixed(3));
            c.soot.setAttribute('d', sp > 0.01 ? inkLoop([pts[1], pts[2], pts[3], pts[4], pts[5], [pts[5][0] - 10, pts[5][1] + 10], [X(c.l.x0) + (X(c.l.x1) - X(c.l.x0)) * 0.5, yt + 30 + 24 * sp], [pts[1][0] + 10, pts[1][1] + 10]], { seed: sd + 280 + i, t }) : '');
            c.smoke.forEach((s, j) => {
              if (smA == null || lt < smA || ghost) { s.setAttribute('d', ''); return; }
              const ph = ((lt - smA) * 0.5 + j / 3) % 1, yy = lerp(ly - 10, yt + 26, ph), xx = lx + Math.sin(ph * 6 + j) * 20 - ph * 40;
              s.setAttribute('d', inkPath([[xx, yy + 30], [xx + 12, yy + 14], [xx - 6, yy], [xx + 8, yy - 14]], { w: 6 + ph * 8, seed: sd + 290 + i * 3 + j, t }));
            });
          });
          // tower: dashed apartment block hanging down from the surface, floor by floor
          if (tw) {
            const T = P.tower, ta = atOr(cues, T.at, 0.4), n = T.floors || 20, fh = 3 * k, x = X(T.x ?? 0.94), w = T.w || 150;
            const tp = prog(lt, ta, T.dur || 2.4) * n, nf = Math.floor(tp);
            const rp = [], fl = [];
            if (lt >= ta) {
              const bot = Math.min(tp, n) * fh;
              rp.push(inkPath([[x - w / 2, 0], [x - w / 2, bot]], { w: 6, seed: sd + 700, t, amp: 1 }), inkPath([[x + w / 2, 0], [x + w / 2, bot]], { w: 6, seed: sd + 701, t, amp: 1 }));
              for (let f = 1; f <= Math.min(nf, n); f++) {
                rp.push(inkPath([[x - w / 2, f * fh], [x + w / 2, f * fh]], { w: f === n ? 7 : 3, seed: sd + 710 + f, t, amp: 0.8 }));
                for (let q = 0; q < 3; q++) fl.push(inkLoop([[x - w * 0.36 + q * w * 0.28, f * fh - fh * 0.7], [x - w * 0.2 + q * w * 0.28, f * fh - fh * 0.7], [x - w * 0.2 + q * w * 0.28, f * fh - fh * 0.3], [x - w * 0.36 + q * w * 0.28, f * fh - fh * 0.3]], { seed: sd + 740 + f * 3 + q, t, amp: 0.6, smooth: false }));
              }
            }
            tw.r.setAttribute('d', rp.join(' ')); tw.fl.setAttribute('d', fl.join(' '));
            if (towerTxt) {
              const [sx, sy] = tf(x, Math.min(tp, n) * fh);
              const on = tp >= n * 0.9, tx2 = Math.max(420, sx - w * z / 2 - 40), ty2 = Math.max(300, Math.min(H - 260, sy - 40));
              towerTxt.setAttribute('x', f1(tx2 - 24)); towerTxt.setAttribute('y', f1(ty2));
              towerTxt.setAttribute('opacity', on ? 1 : 0);
              const cw = 300, cp = D.rr(tx2 - cw, ty2 - 54, cw, 108, 14);
              towerCard.f.setAttribute('d', on ? inkLoop(cp, { seed: sd + 760, t, amp: 1 }) : '');
              towerCard.r.setAttribute('d', on ? inkPath(cp, { w: 6, seed: sd + 761, t, closed: true }) : '');
            }
          }
          // people + cast
          people.forEach(({ p, l, rig }, i) => rig.update(t, p.pose || 'idle', { x: X(p.x ?? (l.x0 + l.x1) / 2), y: Y(l.d), face: p.face === 'left' || p.face === -1 ? -1 : 1, since: 2 + i, emotion: p.emotion }));
          cast.update(lt, t, cues);
          // highlights (screen space)
          hl.forEach(({ h, ring, t: tx }, i) => {
            const l = levels[h.level] || levels[0], a = atOr(cues, h.at, 0.3);
            const [ax, ay] = tf(X(l.x0) - 20, Y(l.d - l.h) - 20), [bx, by] = tf(X(l.x1) + 20, Y(l.d) + 20);
            if (lt < a || by < 240 || ay > H - 120) { ring.setAttribute('d', ''); tx.setAttribute('opacity', 0); return; }
            const p = prog(lt, a, 0.7), cx = (ax + bx) / 2, cy = (ay + by) / 2, rx = (bx - ax) / 2, ry = (by - ay) / 2;
            const pts = inkEllipsePts(cx, cy, rx, ry, sd + 800 + i, 16);
            const n = Math.max(2, Math.round(pts.length * p));
            ring.setAttribute('d', inkPath(p >= 1 ? pts : pts.slice(0, n), { w: 7, seed: sd + 810 + i, t, closed: p >= 1 }));
            const s = spring(lt, a + 0.2, 0.6);
            const ty = h.below ? cy : Math.max(280, ay - 44);
            if (h.below) tx.setAttribute('text-anchor', 'end');
            tx.setAttribute('x', f1(h.below ? ax - 16 : cx)); tx.setAttribute('y', f1(ty));
            tx.setAttribute('opacity', clamp01(s * 2).toFixed(3));
            tx.setAttribute('transform', `rotate(-3 ${f1(cx)} ${f1(ty)})`);
          });
          if (kmask) kmask.setAttribute('d', inkLoop(D.rr(-40, -40, 560, 275, 40), { seed: sd + 990, t, amp: 0.6 }));
          // depth gauge (screen space, left)
          if (gauge) {
            const gx = 70, top = 260, bot = H - 190;
            gauge.line.setAttribute('d', inkPath([[gx, top], [gx, bot]], { w: 6, seed: sd + 900, t }));
            const tk = [];
            let ti = 0;
            for (let d = 0; d <= 90; d += 10) {
              const [, sy] = tf(0, Y(d));
              if (sy < top || sy > bot) continue;
              tk.push(inkPath([[gx, sy], [gx + 26, sy]], { w: 5, seed: sd + 910 + d, t }));
              const nearMark = gauge.mark && Math.abs(tf(0, Y(P.gauge.mark))[1] - sy) < 90 && lt >= atOr(cues, P.gauge.at, 0.5);
              if (ti < gauge.txt.length && d % 20 === 0 && !nearMark) { const tt = gauge.txt[ti++]; tt.textContent = d === 0 ? '0 m' : `${d} m`; tt.setAttribute('x', gx + 36); tt.setAttribute('y', f1(sy)); tt.setAttribute('opacity', 1); }
            }
            for (; ti < gauge.txt.length; ti++) gauge.txt[ti].setAttribute('opacity', 0);
            gauge.ticks.setAttribute('d', tk.join(' '));
            if (gauge.mark) {
              const ma = atOr(cues, P.gauge.at, 0.5), mp = spring(lt, ma, 0.6), pk = punch(lt, ma);
              if (lt < ma) { gauge.mark.box.setAttribute('d', ''); gauge.mark.rim.setAttribute('d', ''); gauge.mark.t.setAttribute('opacity', 0); }
              else {
                const [, my] = tf(0, Y(P.gauge.mark)), yy = Math.max(top + 50, Math.min(bot - 40, my)), bx = gx + 40, w = 230 * mp * (1 + 0.1 * pk), hh = 100;
                const bp = D.rr(bx, yy - hh / 2, Math.max(20, w), hh, 14);
                gauge.mark.box.setAttribute('d', inkLoop(bp, { seed: sd + 930, t, amp: 1 }));
                gauge.mark.rim.setAttribute('d', inkPath(bp, { w: 7, seed: sd + 931, t, closed: true }));
                gauge.mark.t.setAttribute('x', bx + 24); gauge.mark.t.setAttribute('y', yy + 2); gauge.mark.t.setAttribute('opacity', clamp01(mp * 2 - 0.6).toFixed(3));
              }
            }
          }
          if (front) front.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
