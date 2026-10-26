// ist09_sehir: Ottoman İstanbul seen from the sea in 1509, in parchment ink (brand/kit/BRAND.md §3, §5): a hill crowded
// with domed mosques, slender pencil minarets, tiled houses and cypresses; a row of rooftops peeking over the brick-banded
// sea walls with their towers; the sea in front. Built for 11-istanbul-depremi-1509 but parametric (any walled old city
// on a shore hit by an earthquake, a tsunami or rebuilt). Every line boils at 8 Hz; pure function of (seed, lt).
// Needs ist09__lib.js (IST9) and mcB__lib.js (MCB: cast, labels).
//
// SHOTS.ist09_sehir P: {
//   hill: 0.455 (0..1 H: hilltop line at the edges), wall: 0.53 (wall top), sea_y: 0.575 (waterline at the wall foot),
//   towers: [0.06, 0.29, 0.52, 0.75, 0.98] (x of the wall towers),
//   buildings: [{k: "mosque"|"house"|"cypress", x, s: 1, min: [-1, 1] (mosque: minaret sides)}] (default: 3 mosques, 5 minarets
//     — minaret index order = left to right: m0, m1 (mosque at 0.25), m2, m3 (mosque at 0.62), m4 (mosque at 0.93)),
//   sea: true (own water band from sea_y down, wave hatching drifting, foam at the wall foot), fill: "paperLight"|"paper",
//   shake: cue|s (the ground shakes: everything sways, rooftops jitter), shake_dur: 3,
//   fall: [{m: 3, at: cue|s, dir: 1}] (a minaret snaps at a third of its height and its top topples, dust where it lands),
//   domes: [{b: 1 (mosque index), at}] (the main dome caves into the drum, dust), cracks: [{b: 1, at}] (red crack runs down a dome),
//   towers_fall: [{i: 2, at}] (a wall tower's top crumbles, stones tumble into the sea and splash),
//   wave: cue|s (a surge rolls in from the left along the wall, its crest rising over the battlements; spray lands in the city),
//   wave_dur: 1.6, wave_over: 70 (px the crest rises above the wall top),
//   build: {b: 1, at: cue|s, dur: 3, m: 3 (minaret that grows), tower: 2 (tower that grows course by course), crane: true}
//     (rebuilding: scaffolding round the mosque, its dome drawn arc by arc, a treadwheel crane hoisting a stone block),
//   gulls: 0, boats: [{x: 0.3, y: 0.66, s: 1}] (rowing caïques bobbing on the sea),
//   quay: {x0: 0, x1: 0.5, y: 0.6} (near stone quay in front of the water for the cast to stand on),
//   cast: [...MCB cast], labels: [...MCB labels]
// }
// cues: whatever the params name. Close-up targets (stage px, portrait 1080×1920, default buildings): minaret m3 ≈ [862, 640],
// big dome ≈ [670, 760], wall tower 2 ≈ [562, 1000], wave crest ≈ [540, 960].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.ist09_sehir = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.IST9, M = window.MCB, { atOr, arc, rect } = L;
      const S = Math.min(W, H) / 1080 * (H > W ? 1 : 0.62);
      const sd = (seed || 1) * 7 + 9091;
      const r = rng(sd);
      const hillY = x => H * (P.hill ?? 0.455) - H * 0.04 * Math.exp(-Math.pow((x / W - 0.55) / 0.32, 2));
      const wallTop = H * (P.wall ?? 0.53), seaY = H * (P.sea_y ?? 0.575), towerTop = wallTop - 70 * S;
      const fillTok = INK[P.fill || 'paperLight'];
      const root = el(svg, 'g');
      const shake = el(root, 'g');
      const sh = L.Shapes();

      // ---------------------------------------------------------- hill + far rooftops
      const backG = el(shake, 'g');
      const hillPts = [];
      for (let x = -40; x <= W + 40; x += 40) hillPts.push([x, hillY(x)]);
      sh.add(backG, hillPts.concat([[W + 40, wallTop + 30], [-40, wallTop + 30]]), { fill: INK.paperDark, fop: 0.55 });
      sh.add(backG, hillPts, { stroke: INK.inkSoft, w: 4, closed: false, smooth: true });
      for (let i = 0; i < 26; i++) {
        const x = r() * W, y0 = hillY(x) + 20 + r() * (wallTop - hillY(x) - 30);
        sh.add(backG, [[x, y0], [x + 26 * S, y0 + 16 * S]], { stroke: INK.inkSoft, w: 2.2, closed: false, sop: 0.8 });
      }

      // ---------------------------------------------------------- buildings on the hill
      const B = P.buildings || [
        { k: 'cypress', x: 0.035 }, { k: 'house', x: 0.1, s: 0.95 }, { k: 'mosque', x: 0.27, s: 0.82, min: [-1, 1] },
        { k: 'house', x: 0.43, s: 0.9 }, { k: 'cypress', x: 0.465, s: 0.9 }, { k: 'mosque', x: 0.64, s: 1.12, min: [-1, 1] },
        { k: 'cypress', x: 0.83, s: 1.05 }, { k: 'mosque', x: 0.95, s: 0.66, min: [-1] },
      ];
      const bldG = el(shake, 'g');
      const mosques = [], minarets = [], sways = [];
      const build = P.build || null;
      B.forEach((b, bi) => {
        const cx = b.x * W, by = hillY(cx) + 6 * S, s = (b.s ?? 1) * S;
        const g = el(bldG, 'g');
        sways.push({ g, cx, by, k: bi });
        if (b.k === 'cypress') {
          const h = 190 * s;
          sh.add(g, [[cx, by - h], [cx + 15 * s, by - h * 0.7], [cx + 21 * s, by - h * 0.35], [cx + 13 * s, by - 8 * s], [cx, by], [cx - 13 * s, by - 8 * s], [cx - 21 * s, by - h * 0.35], [cx - 15 * s, by - h * 0.7]],
            { fill: INK.green, fop: 0.62, stroke: INK.ink, w: 4, smooth: true });
          for (let k = 0; k < 4; k++) sh.add(g, [[cx - 8 * s, by - h * (0.25 + k * 0.17)], [cx + 6 * s, by - h * (0.3 + k * 0.17)]], { stroke: INK.ink, w: 2.5, closed: false, sop: 0.6 });
          return;
        }
        if (b.k === 'house') {
          const w = 92 * s, h = 64 * s;
          sh.add(g, rect(cx - w / 2, by - h, cx + w / 2, by), { fill: fillTok, stroke: INK.ink, w: 4.5 });
          sh.add(g, [[cx - w / 2 - 10 * s, by - h], [cx + w / 2 + 10 * s, by - h], [cx + w / 2 - 8 * s, by - h - 34 * s], [cx - w / 2 + 8 * s, by - h - 34 * s]], { fill: INK.red, fop: 0.5, stroke: INK.ink, w: 4.5 });
          for (const dx of [-0.25, 0.25]) sh.add(g, rect(cx + dx * w - 8 * s, by - h * 0.72, cx + dx * w + 8 * s, by - h * 0.38), { fill: INK.ink, fop: 0.7 });
          return;
        }
        // mosque: base hall, side half-domes, drum + main dome (own group: it can cave in), pencil minarets
        const bw = 300 * s, bh = 92 * s, R = bw * 0.3, dz = -bh - 20 * s;
        for (const sx of [-1, 1]) sh.add(g, arc(cx + sx * bw * 0.29, by - bh, bw * 0.17, bw * 0.15, Math.PI, 2 * Math.PI, 12), { fill: fillTok, stroke: INK.ink, w: 4.5 });
        sh.add(g, rect(cx - bw / 2, by - bh, cx + bw / 2, by), { fill: fillTok, stroke: INK.ink, w: 5 });
        for (let k = 0; k < 5; k++) {   // arched windows
          const wx = cx - bw * 0.36 + k * bw * 0.18, wy = by - bh * 0.32;
          sh.add(g, [[wx - 9 * s, wy], [wx - 9 * s, wy - 26 * s]].concat(arc(wx, wy - 26 * s, 9 * s, 10 * s, Math.PI, 2 * Math.PI, 6)).concat([[wx + 9 * s, wy]]), { fill: INK.ink, fop: 0.62 });
        }
        sh.add(g, [[cx - bw / 2, by - bh * 0.62], [cx + bw / 2, by - bh * 0.62]], { stroke: INK.inkSoft, w: 2.5, closed: false });
        const domeG = el(g, 'g');
        const bd = build && build.b === mosques.length ? build : null;
        const domeP = lt => bd ? clamp01(0.3 + 0.7 * progIO(lt, atOr(curCues, bd.at, 0.4), bd.dur ?? 3)) : 1;
        sh.add(domeG, rect(cx - R * 1.04, by - bh, cx + R * 1.04, by + dz), { fill: fillTok, stroke: INK.ink, w: 4.5 });
        for (let k = -3; k <= 3; k++) sh.add(domeG, rect(cx + k * R * 0.27 - 3.5 * s, by - bh - 5 * s, cx + k * R * 0.27 + 3.5 * s, by + dz + 5 * s), { fill: INK.ink, fop: 0.7 });
        const domePts = lt => { const p = domeP(lt); return arc(cx, by + dz, R, R * 0.92, Math.PI, Math.PI + Math.PI * p, 18).concat(p < 1 ? [[cx, by + dz]] : []); };
        sh.add(domeG, domePts, { fill: fillTok, stroke: INK.ink, w: 5.5 });
        sh.add(domeG, lt => domeP(lt) < 0.99 ? null : arc(cx, by + dz, R, R * 0.92, -Math.PI * 0.42, 0, 8).concat(arc(cx + R * 0.18, by + dz, R * 0.74, R * 0.8, 0, -Math.PI * 0.42, 8)),
          { fill: INK.inkSoft, fop: 0.3 });
        sh.add(domeG, lt => domeP(lt) < 0.99 ? null : [[cx, by + dz - R * 0.92], [cx, by + dz - R * 0.92 - 34 * s]], { stroke: INK.ink, w: 4, closed: false });
        sh.add(domeG, lt => domeP(lt) < 0.99 ? null : arc(cx, by + dz - R * 0.92 - 42 * s, 9 * s, 9 * s, -Math.PI * 0.2, Math.PI * 1.1, 7), { stroke: INK.gold, w: 4, closed: false });
        const crack = el(g, 'g');
        const mo = { cx, by, bw, bh, R, dz, s, g, domeG, crack };
        mosques.push(mo);
        // minarets
        (b.min || []).forEach(side => {
          const mx = cx + side * (bw / 2 + 30 * s), mw = 24 * s, mh = 430 * s, hb = mh * 0.33, mi = minarets.length;
          const grow = build && build.m === mi ? build : null;
          const hP = lt => grow ? lerp(0.42, 1, progIO(lt, atOr(curCues, grow.at, 0.4) + 0.4, grow.dur ?? 3)) : 1;
          const stumpG = el(g, 'g'), topG = el(g, 'g');
          sh.add(stumpG, rect(mx - mw / 2 - 7 * s, by, mx + mw / 2 + 7 * s, by - 34 * s), { fill: fillTok, stroke: INK.ink, w: 4 });
          const brk = { at: null };
          sh.add(stumpG, lt => brk.at != null && lt >= brk.at
            ? [[mx - mw / 2, by - 34 * s], [mx - mw / 2, by - hb + 10 * s], [mx - mw / 4, by - hb - 8 * s], [mx, by - hb + 6 * s], [mx + mw / 4, by - hb - 12 * s], [mx + mw / 2, by - hb + 4 * s], [mx + mw / 2, by - 34 * s]]
            : rect(mx - mw / 2, by - 34 * s, mx + mw / 2, by - hb), { fill: fillTok, stroke: INK.ink, w: 4 });
          const H2 = lt => mh * hP(lt);
          sh.add(topG, lt => rect(mx - mw / 2, by - hb, mx + mw / 2, by - H2(lt)), { fill: fillTok, stroke: INK.ink, w: 4 });
          sh.add(topG, lt => { const yb = by - Math.min(H2(lt) - 20 * s, mh * 0.72); return [[mx - mw / 2 - 12 * s, yb], [mx + mw / 2 + 12 * s, yb], [mx + mw / 2 + 12 * s, yb - 12 * s], [mx - mw / 2 - 12 * s, yb - 12 * s]]; },
            { fill: fillTok, stroke: INK.ink, w: 4 });
          sh.add(topG, lt => { const yb = by - Math.min(H2(lt) - 20 * s, mh * 0.72); return [[mx - mw / 2, yb + 1], [mx, yb + 22 * s], [mx + mw / 2, yb + 1]]; }, { stroke: INK.ink, w: 3, closed: false });
          sh.add(topG, lt => hP(lt) < 0.99 ? null : [[mx - mw / 2 - 3 * s, by - mh], [mx, by - mh - 86 * s], [mx + mw / 2 + 3 * s, by - mh]], { fill: INK.inkSoft, fop: 0.6, stroke: INK.ink, w: 4 });
          sh.add(topG, lt => hP(lt) < 0.99 ? null : [[mx, by - mh - 86 * s], [mx, by - mh - 112 * s]], { stroke: INK.ink, w: 3.5, closed: false });
          for (let k = 1; k < 5; k++) sh.add(topG, lt => by - hb - k * (mh - hb) / 5 > by - H2(lt) ? [[mx - mw / 2, by - hb - k * (mh - hb) / 5], [mx + mw / 2, by - hb - k * (mh - hb) / 5]] : null, { stroke: INK.inkSoft, w: 2, closed: false });
          minarets.push({ mx, by, hb, mh, s, topG, brk, side, g });
        });
      });

      // ---------------------------------------------------------- rebuilding: scaffolding + treadwheel crane
      const scafG = el(bldG, 'g');
      let crane = null;
      if (build && mosques[build.b ?? 1]) {
        const mo = mosques[build.b ?? 1], { cx, by, R, bw, s } = mo, top = by + mo.dz - R - 30 * s;
        const wood = { stroke: INK.stain, w: 5, closed: false };
        const xs = [-1.25, -0.6, 0, 0.6, 1.25].map(k => cx + k * R);
        xs.forEach(x => sh.add(scafG, [[x, by], [x, top + Math.abs(x - cx) * 0.5]], wood));
        for (const k of [0.3, 0.62, 0.9]) { const y = by - (by - top) * k; sh.add(scafG, [[xs[0] - 10 * s, y], [xs[4] + 10 * s, y]], wood); }
        for (let i = 0; i < 4; i++) sh.add(scafG, [[xs[i], by - (by - top) * 0.3], [xs[i + 1], by - (by - top) * 0.62]], { stroke: INK.stain, w: 3, closed: false });
        const m = minarets[build.m];
        if (m) {
          const hp = lt => m.by - lerp(0.42, 1, progIO(lt, atOr(curCues, build.at, 0.4) + 0.4, build.dur ?? 3)) * m.mh;
          for (const dx of [-26, 26]) sh.add(scafG, lt => [[m.mx + dx * s, m.by], [m.mx + dx * s, hp(lt) + 10 * s]], wood);
          sh.add(scafG, lt => { const pts = []; for (let y = m.by - 60 * s; y > hp(lt) + 20 * s; y -= 70 * s) pts.push([m.mx - 26 * s, y], [m.mx + 26 * s, y], [m.mx + 26 * s, y - 2], [m.mx - 26 * s, y - 2]); return pts.length ? pts : null; },
            { stroke: INK.stain, w: 3, closed: false });
        }
        if (build.crane !== false && build.crane !== 0) {
          const mx = cx - bw * 0.62, mtop = by - 370 * s, tipX = cx - R * 0.3, tipY = mtop + 40 * s, wr = 48 * s;
          sh.add(scafG, [[mx - 30 * s, by], [mx, mtop], [mx + 30 * s, by]], { stroke: INK.ink, w: 6, closed: false });
          sh.add(scafG, [[mx, mtop], [tipX, tipY]], { stroke: INK.ink, w: 6, closed: false });
          sh.add(scafG, [[mx, mtop + 120 * s], [tipX, tipY]], { stroke: INK.ink, w: 3, closed: false });
          sh.add(scafG, inkEllipsePts(mx, by - wr, wr, wr, sd + 5, 16, 0, 0.01), { stroke: INK.ink, w: 5, fill: INK.paperLight, fop: 0.6 });
          crane = { mx, by, wr, tipX, tipY, s, spokes: inkEl(scafG, INK.ink), rope: inkEl(scafG, INK.ink), block: inkEl(scafG, INK.paperLight), blockL: inkEl(scafG, INK.ink), man: KASIF.create(el(scafG, 'g'), { scale: 0.17 * s, hat: false, accessory: 'turban', seed: sd + 41 }) };
        }
      }

      // ---------------------------------------------------------- rooftops peeking over the wall
      const roofG = el(shake, 'g');
      for (let x = -20, k = 0; x < W + 20; k++) {
        const w = (54 + r() * 40) * S, h = (26 + r() * 30) * S, y = wallTop + 4 * S;
        sh.add(roofG, rect(x, y - h, x + w, y + 10), { fill: fillTok, stroke: INK.ink, w: 3.5 });
        sh.add(roofG, [[x - 6 * S, y - h], [x + w + 6 * S, y - h], [x + w - 6 * S, y - h - 22 * S], [x + 6 * S, y - h - 22 * S]], { fill: INK.red, fop: 0.42, stroke: INK.ink, w: 3.5 });
        if (r() < 0.6) sh.add(roofG, rect(x + w * 0.4, y - h * 0.7, x + w * 0.4 + 11 * S, y - h * 0.35), { fill: INK.ink, fop: 0.65 });
        x += w + (4 + r() * 22) * S;
      }

      // ---------------------------------------------------------- sea walls + towers
      const wallG = el(shake, 'g');
      const merl = (x0, x1, y, step = 44 * S, mw = 24 * S, mh = 22 * S) => {
        const pts = [[x0, y]];
        for (let x = x0 + 8 * S; x + mw < x1; x += step) pts.push([x, y], [x, y - mh], [x + mw, y - mh], [x + mw, y]);
        pts.push([x1, y]);
        return pts;
      };
      sh.add(wallG, [[-30, seaY + 30 * S]].concat(merl(-30, W + 30, wallTop)).concat([[W + 30, seaY + 30 * S]]), { fill: fillTok, stroke: INK.ink, w: 5.5 });
      for (const dy of [28, 54]) sh.add(wallG, rect(-30, wallTop + dy * S, W + 30, wallTop + (dy + 8) * S), { fill: INK.red, fop: 0.5 });
      for (let y = wallTop + 14 * S; y < seaY; y += 20 * S)
        for (let x = -20 + ((y / (20 * S)) % 2) * 30 * S; x < W; x += 120 * S) sh.add(wallG, [[x, y], [x + 70 * S, y]], { stroke: INK.inkSoft, w: 2, closed: false, sop: 0.8 });
      const TW = P.towers || [0.06, 0.29, 0.52, 0.75, 0.98];
      const tfall = (P.towers_fall || []);
      const drG = el(root, 'g'), dr = L.drops(drG, sd + 300);
      const towers = TW.map((tx, i) => {
        const x = tx * W, w = 98 * S, g = el(wallG, 'g');
        const tf = tfall.find(f => f.i === i);
        const tb = build && build.tower === i ? build : null;
        const st = { x, w, g, tf, at: null };
        const topY = lt => {
          if (tb) { const p = progIO(lt, atOr(curCues, tb.at, 0.4) + 0.2, (tb.dur ?? 3) * 0.9); return lerp(wallTop + 12 * S, towerTop, Math.floor(p * 6) / 6); }
          if (st.at != null && lt >= st.at) return lerp(towerTop, wallTop + 18 * S, progIO(lt, st.at, 0.7));
          return towerTop;
        };
        const broken = lt => (tb && progIO(lt, atOr(curCues, tb.at, 0.4) + 0.2, (tb.dur ?? 3) * 0.9) < 0.999) || (st.at != null && lt >= st.at);
        sh.add(g, lt => {
          const y = topY(lt);
          const top = broken(lt) ? [[x - w / 2, y + 6 * S], [x - w / 4, y - 10 * S], [x - 4 * S, y + 8 * S], [x + w / 5, y - 14 * S], [x + w / 2, y + 4 * S]] : merl(x - w / 2, x + w / 2, y, 30 * S, 16 * S, 20 * S);
          return [[x - w / 2, seaY + 30 * S]].concat(top).concat([[x + w / 2, seaY + 30 * S]]);
        }, { fill: fillTok, stroke: INK.ink, w: 6 });
        for (const dy of [28, 54]) sh.add(g, lt => topY(lt) < wallTop + dy * S ? rect(x - w / 2, wallTop + dy * S, x + w / 2, wallTop + (dy + 8) * S) : null, { fill: INK.red, fop: 0.55 });
        sh.add(g, lt => topY(lt) < towerTop + 30 * S ? rect(x - 5 * S, towerTop + 18 * S, x + 5 * S, towerTop + 48 * S) : null, { fill: INK.ink, fop: 0.75 });
        sh.add(g, lt => tb && broken(lt) ? [[x - w / 2 - 14 * S, topY(lt) - 50 * S], [x - w / 2 - 14 * S, seaY], [x + w / 2 + 14 * S, seaY], [x + w / 2 + 14 * S, topY(lt) - 50 * S]] : null,
          { stroke: INK.stain, w: 4, closed: false });
        sh.add(g, lt => tb && broken(lt) ? [[x - w / 2 - 14 * S, topY(lt) - 10 * S], [x + w / 2 + 14 * S, topY(lt) - 10 * S]] : null, { stroke: INK.stain, w: 4, closed: false });
        return st;
      });

      // ---------------------------------------------------------- sea, foam, boats
      const seaG = el(root, 'g');
      const seaTop = (x, t) => seaY + 6 * S * Math.sin(x * 0.018 + t * 2) + 3 * S * Math.sin(x * 0.05 - t * 3);
      let seaF = null, seaL = null, crests = [], foam = [];
      if (P.sea !== false) {
        seaF = inkEl(seaG, INK.blue, { 'fill-opacity': 0.3 });
        seaL = inkEl(seaG, INK.ink);
        crests = Array.from({ length: 26 }, (_, i) => ({ e: inkEl(seaG, INK.blue, { 'fill-opacity': 0.85 }), a: r(), b: r(), c: r() }));
        foam = Array.from({ length: 14 }, (_, i) => ({ e: inkEl(seaG, INK.paperLight), x: (i + 0.5) / 14 * W + (r() - 0.5) * 40, ph: r() * 6 }));
      }
      const boats = (P.boats || []).map((b, i) => {
        const g = el(seaG, 'g');
        const s = (b.s ?? 1) * S, hull = [[-90 * s, -18 * s], [90 * s, -18 * s], [70 * s, 10 * s], [-62 * s, 10 * s]];
        const e1 = sh.add(g, hull, { fill: INK.stain, fop: 0.85, stroke: INK.ink, w: 4.5 });
        const oarL = sh.add(g, lt => { const a = Math.sin(lt * 4 + i) * 0.5; return [[-10 * s, -14 * s], [-10 * s - Math.cos(0.9 + a) * 80 * s, 10 * s + Math.sin(0.9 + a) * 30 * s]]; }, { stroke: INK.ink, w: 3.5, closed: false });
        const rower = KASIF.create(el(g, 'g'), { scale: 0.2 * s / S * S, hat: false, accessory: 'turban', seed: sd + 70 + i });
        return { b, g, s, rower };
      });
      const dust = L.dust(el(root, 'g'), sd + 500);

      // ---------------------------------------------------------- the surge
      const waveG = el(root, 'g');
      const wv = P.wave != null ? {
        f: inkEl(waveG, INK.blue, { 'fill-opacity': 0.78 }), h: Array.from({ length: 18 }, () => inkEl(waveG, INK.paperLight, { 'fill-opacity': 0.9 })),
        foam: inkEl(waveG, INK.paperLight), l: inkEl(waveG, INK.ink), curl: inkEl(waveG, INK.ink), hr: Array.from({ length: 18 }, () => [r(), r()]), flood: inkEl(waveG, INK.blue, { 'fill-opacity': 0.55 }), floodL: inkEl(waveG, INK.paperLight),
      } : null;
      if (wv) { waveG.insertBefore(wv.floodL, waveG.firstChild); waveG.insertBefore(wv.flood, waveG.firstChild); }
      const sprayAt = [], sprayEls = [], sprayDat = [];
      if (wv) for (let i = 0; i < 22; i++) {
        sprayEls.push(inkEl(waveG, INK.blue, { 'fill-opacity': 0.85 }));
        sprayDat.push({ x: (0.05 + 0.9 * i / 22) * W, y: wallTop - (P.wave_over ?? 170) * S, vx: (r() - 0.25) * 140 * S, vy: -(280 + r() * 300) * S, g: 1400 * S, sz: (12 + r() * 12) * S, floor: hillY((0.05 + 0.9 * i / 22) * W) + 60 * S });
      }

      if (P.stones_front) root.appendChild(drG);   // falling wall stones drawn in front of the surge
      // ---------------------------------------------------------- foreground below the caption strip
      const foreG = el(root, 'g');
      const FO = P.fore || null, foreBoat = [];
      if (FO && (FO.kind || 'rubble') === 'rubble') {
        const y0 = (FO.y ?? 0.66) * H;
        const rocks = [];
        for (let x = -60, i = 0; x < W + 60; i++) { const w = (110 + r() * 120) * S, h = (70 + r() * 90) * S; rocks.push([x, w, h]); x += w * 0.7; }
        sh.add(foreG, [[-60, H + 40], [-60, y0 + 40 * S]].concat(rocks.map(([x, w, h]) => [x + w / 2, y0 + 60 * S - h * 0.6])).concat([[W + 60, y0 + 40 * S], [W + 60, H + 40]]), { fill: INK.paperDark, fop: 0.95, stroke: INK.ink, w: 5, smooth: true });
        rocks.forEach(([x, w, h], i) => {
          const cx = x + w / 2, cy = y0 + 70 * S + (i % 3) * 30 * S;
          sh.add(foreG, inkEllipsePts(cx, cy, w * 0.5, h * 0.45, sd + 400 + i, 9, (i % 5 - 2) * 0.1, 0.18), { fill: i % 3 ? INK.paperLight : INK.paperDark, stroke: INK.ink, w: 5 });
          sh.add(foreG, [[cx - w * 0.3, cy + h * 0.1], [cx + w * 0.1, cy + h * 0.3]], { stroke: INK.inkSoft, w: 3, closed: false });
        });
        for (let i = 0; i < 4; i++) { const x = W * (0.12 + i * 0.26), y = y0 + 40 * S + (i % 2) * 50 * S; sh.add(foreG, [[x - 90 * S, y + 20 * S], [x + 90 * S, y - 30 * S], [x + 96 * S, y - 12 * S], [x - 84 * S, y + 38 * S]], { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 4.5 }); }
        for (let y = y0 + 150 * S; y < H; y += 26 * S) sh.add(foreG, [[r() * W * 0.3, y], [W * 0.3 + r() * W * 0.6, y + 10 * S]], { stroke: INK.inkSoft, w: 2, closed: false, sop: 0.6 });
      }
      const foamF = [];
      if (FO && FO.kind === 'foam') {
        const y0 = (FO.y ?? 0.66) * H;
        for (let i = 0; i < 16; i++) foamF.push({ e: inkEl(foreG, INK.paperLight), l: inkEl(foreG, INK.ink, { 'fill-opacity': 0.8 }), a: r(), b: r(), c: r() });
        foamF.y0 = y0;
      }
      if (FO && FO.kind === 'boat') {
        const g = el(foreG, 'g'), y0 = (FO.y ?? 0.7) * H, x0 = (FO.x ?? 0.0) * W, s = 2.2 * S;
        sh.add(g, [[x0 - 80 * s, y0 - 30 * s], [x0 + 150 * s, y0 - 46 * s], [x0 + 190 * s, y0 - 80 * s], [x0 + 176 * s, y0 + 10 * s], [x0 + 110 * s, y0 + 46 * s], [x0 - 80 * s, y0 + 46 * s]], { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 6 });
        for (let k = 0; k < 3; k++) sh.add(g, [[x0 - 80 * s, y0 - 18 * s + k * 18 * s], [x0 + 160 * s - k * 12 * s, y0 - 36 * s + k * 22 * s]], { stroke: INK.ink, w: 3, closed: false, sop: 0.7 });
        sh.add(g, [[x0 + 60 * s, y0 - 40 * s], [x0 + 140 * s, y0 + 140 * s]], { stroke: INK.ink, w: 7, closed: false });
        sh.add(g, [[x0 + 186 * s, y0 - 80 * s], [x0 + 196 * s, y0 - 100 * s]], { stroke: INK.ink, w: 5, closed: false });
        foreBoat.push({ g, x0, y0 });
      }

      // ---------------------------------------------------------- quay, cast, labels
      const quayG = el(root, 'g');
      if (P.quay) {
        const q = P.quay, y = q.y * H, x0 = (q.x0 ?? 0) * W - 40, x1 = (q.x1 ?? 0.5) * W;
        sh.add(quayG, [[x0, y], [x1, y], [x1 + 40 * S, H + 40], [x0, H + 40]], { fill: INK.paperDark, fop: 0.95, stroke: INK.ink, w: 6 });
        for (let yy = y + 40 * S; yy < H; yy += 46 * S) sh.add(quayG, [[x0, yy], [x1 + (yy - y) * 0.06, yy]], { stroke: INK.inkSoft, w: 3, closed: false });
        for (let yy = y, k = 0; yy < H; yy += 46 * S, k++) for (let x = x0 + (k % 2) * 50 * S; x < x1; x += 100 * S) sh.add(quayG, [[x, yy], [x, yy + 46 * S]], { stroke: INK.inkSoft, w: 3, closed: false });
      }
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      const labs = M.labels(labG, P.labels || [], W, H, sd + 950);

      let curCues = {};
      const done = new Set(), crackEl = new Map();
      const fallSpec = P.fall || [];

      return {
        update(lt, dur, cues, info) {
          curCues = cues || {};
          const t = (info && info.t != null) ? info.t : lt;
          // shaking
          const sa = atOr(cues, P.shake, null), env = L.quakeEnv(lt, sa, P.shake_dur ?? 3);
          shake.setAttribute('transform', env > 0 ? `translate(${L.f1(Math.sin(lt * 47) * 9 * env * S)} ${L.f1(Math.cos(lt * 39) * 5 * env * S)})` : '');
          sways.forEach(({ g, cx, by, k }) => g.setAttribute('transform', env > 0 ? `rotate(${(Math.sin(lt * 21 + k * 1.7) * 2.2 * env).toFixed(2)} ${L.f1(cx)} ${L.f1(by)})` : ''));
          // minarets falling
          fallSpec.forEach(f => {
            const m = minarets[f.m]; if (!m) return;
            const a = atOr(cues, f.at, null); m.brk.at = a;
            if (a == null || lt < a) { m.topG.setAttribute('transform', ''); m.topG.style.display = ''; return; }
            const u = lt - a, dir = f.dir ?? m.side, px = m.mx, py = m.by - m.hb;
            const ang = Math.min(100, 16 * u + 150 * u * u) * dir;
            const drop = Math.min(wallTop - (m.by - m.hb) + 60 * S, Math.max(0, u - 0.45) * Math.max(0, u - 0.45) * 2600 * m.s);
            m.topG.style.display = u > 1.4 ? 'none' : '';
            m.topG.setAttribute('transform', `translate(0 ${L.f1(drop)}) rotate(${ang.toFixed(2)} ${L.f1(px)} ${L.f1(py)})`);
            if (!done.has(f)) { done.add(f); dust.puff(px + dir * m.mh * 0.55, m.by - 20 * m.s, a + 0.75, 1.3 * m.s); dust.puff(px, py, a + 0.05, 0.5 * m.s); }
          });
          // domes caving in
          (P.domes || []).forEach(d => {
            const mo = mosques[d.b]; if (!mo) return;
            const a = atOr(cues, d.at, null);
            const p = a == null ? 0 : progIO(lt, a, 0.6);
            mo.domeG.setAttribute('transform', p > 0 ? `translate(0 ${L.f1(p * mo.R * 0.9)}) scale(1 ${(1 - 0.55 * p).toFixed(3)})` : '');
            if (p > 0) { const yb = mo.by - mo.bh; mo.domeG.setAttribute('transform', `translate(0 ${L.f1(yb)}) scale(1 ${(1 - 0.75 * p).toFixed(3)}) translate(0 ${L.f1(-yb)})`); }
            if (a != null && !done.has(d)) { done.add(d); dust.puff(mo.cx, mo.by - mo.bh - 20 * mo.s, a + 0.1, 1.6 * mo.s); }
          });
          // cracks
          (P.cracks || []).forEach((c, ci) => {
            const mo = mosques[c.b]; if (!mo) return;
            if (!crackEl.has(c)) crackEl.set(c, inkEl(mo.crack, INK.red));
            const a = atOr(cues, c.at, null), p = a == null ? 0 : prog(lt, a, 0.5);
            const R = mo.R, x = mo.cx + R * 0.15, y0 = mo.by + mo.dz - R * 0.85;
            const pts = [[x, y0], [x - 14 * mo.s, y0 + R * 0.25], [x + 10 * mo.s, y0 + R * 0.45], [x - 8 * mo.s, y0 + R * 0.7], [x + 12 * mo.s, y0 + R * 0.95], [x - 6 * mo.s, mo.by - mo.bh * 0.4]];
            const n = Math.max(2, Math.round(pts.length * p));
            crackEl.get(c).setAttribute('d', p > 0.02 ? inkPath(pts.slice(0, n), { seed: sd + 40 + ci, t, w: 7, amp: 1 }) : '');
          });
          // towers crumbling
          towers.forEach((tw, i) => {
            if (!tw.tf) return;
            const a = atOr(cues, tw.tf.at, null); tw.at = a;
            if (a != null && !done.has(tw)) {
              done.add(tw);
              dust.puff(tw.x, towerTop + 10 * S, a + 0.1, 1.2 * S);
              for (let k = 0; k < 7; k++) dr.add({ kind: 'stone', x: tw.x + (k - 3) * 12 * S, y: towerTop + 10 * S, vx: (k - 3) * 40 * S + 30 * S, vy: -(140 + 40 * (k % 3)) * S, g: 1500 * S, at: a + 0.05 * k, size: (1 + (k % 3) * 0.3) * S, floor: seaY + (P.stones_front ? 260 + (k % 3) * 60 : 60) * S, spin: 4 + k, splash: !!P.stones_front });
            }
          });
          // surge
          if (wv) {
            const a = atOr(cues, P.wave, null), wd = P.wave_dur ?? 1.6;
            const p = a == null ? 0 : progIO(lt, a, wd), rise = a == null ? 0 : prog(lt, a - 0.3, 0.5);
            const xf = lerp(-0.25 * W, 1.3 * W, p), A = (seaY - wallTop + (P.wave_over ?? 170) * S) * rise;
            const hgt = x => A * (x < xf ? 1 : Math.exp(-Math.pow((x - xf) / (0.16 * W), 2))) * (0.92 + 0.08 * Math.sin(x * 0.02 + lt * 3));
            const top = [];
            for (let x = -40; x <= W + 40; x += 24) top.push([x, seaY - hgt(x)]);
            if (A > 2) {
              wv.f.setAttribute('d', inkLoop(top.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 60, t, amp: 1.5, smooth: false }));
              wv.l.setAttribute('d', inkPath(top, { seed: sd + 61, t, w: 6, amp: 1.5 }));
              wv.foam.setAttribute('d', inkPath(top.map(([x, y]) => [x, y + 14 * S]), { seed: sd + 62, t, w: 16 * S, amp: 2.5 }));
              const cxp = Math.min(W - 40, Math.max(40, xf)), cy = seaY - hgt(cxp);
              wv.curl.setAttribute('d', inkPath(arc(cxp + 20 * S, cy + 70 * S, 95 * S, 80 * S, Math.PI * 1.1, Math.PI * 2.6, 16), { seed: sd + 63, t, w: 9, amp: 1.2 }));
              wv.h.forEach((e, i) => {
                const [u1, u2] = wv.hr[i], x = u1 * W, yTop = seaY - hgt(x), y = yTop + 30 * S + u2 * (H * 0.9 - yTop);
                const len = 60 * S + u2 * 60 * S, xx = x + ((lt * 60 * S) % 80);
                e.setAttribute('d', hgt(x) > 30 ? inkPath([[xx, y], [xx + len * 0.5, y - 8 * S], [xx + len, y]], { seed: sd + 70 + i, t, w: 3.5, amp: 1 }) : '');
              });
              // the flood behind the wall: water spreads over the rooftops wherever the crest has passed
              const fl = [], fh = (P.wave_flood ?? 75) * S;
              for (let x = -40; x <= Math.min(W + 40, xf); x += 30) fl.push([x, wallTop - fh * clamp01((xf - x) / (0.25 * W)) - 6 * S * Math.sin(x * 0.03 + lt * 4)]);
              if (fl.length > 1) {
                const base = fl.map(([x]) => [x, wallTop + 10 * S]).reverse();
                wv.flood.setAttribute('d', inkLoop(fl.concat(base), { seed: sd + 64, t, amp: 1.2, smooth: false }));
                wv.floodL.setAttribute('d', inkPath(fl, { seed: sd + 65, t, w: 7, amp: 1.5 }));
              } else { wv.flood.setAttribute('d', ''); wv.floodL.setAttribute('d', ''); }
            } else { wv.flood.setAttribute('d', ''); wv.floodL.setAttribute('d', ''); wv.f.setAttribute('d', ''); wv.l.setAttribute('d', ''); wv.foam.setAttribute('d', ''); wv.curl.setAttribute('d', ''); wv.h.forEach(e => e.setAttribute('d', '')); }
          }
          if (wv) {
            const a = atOr(cues, P.wave, null), wd = P.wave_dur ?? 1.6;
            if (a != null && !done.has(wv)) {
              done.add(wv);
              // drop i leaves when the front reaches its x
              const xs = sprayDat.map(d => d.x);
              let k = 0;
              for (const x of xs) {
                const p = (x + 0.25 * W) / (1.55 * W);
                // inverse of the eased progress, approximated with a few bisection steps
                let lo = 0, hi = 1; for (let it = 0; it < 14; it++) { const mid = (lo + hi) / 2; if (EASE_IO(mid) < p) lo = mid; else hi = mid; }
                sprayAt[k++] = a + lo * wd;
              }
            }
          }
          // sea
          if (seaF) {
            const pts = []; for (let x = -40; x <= W + 40; x += 40) pts.push([x, seaTop(x, lt)]);
            seaF.setAttribute('d', inkLoop(pts.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
            seaL.setAttribute('d', inkPath(pts, { seed: sd + 2, t, w: 4, amp: 1 }));
            crests.forEach((c, i) => {
              const y = seaY + 30 * S + c.b * (H - seaY - 60 * S), k = (y - seaY) / (H - seaY);
              const len = (40 + c.c * 70) * S * (0.7 + k), x = ((c.a * (W + 300) + lt * (20 + c.c * 26) * S) % (W + 300)) - 150;
              c.e.setAttribute('d', inkPath([[x, y], [x + len * 0.5, y - (6 + 4 * Math.sin(lt * 2 + i)) * S], [x + len, y]], { seed: sd + 10 + i, t, w: (2.5 + 2 * k) * S, amp: 1 }));
            });
            foam.forEach((f, i) => {
              const b = 0.5 + 0.5 * Math.sin(lt * 3 + f.ph);
              f.e.setAttribute('d', inkDot(f.x, seaY + 4 * S - b * 10 * S, (14 + 10 * b) * S, (6 + 4 * b) * S, sd + 200 + i, t, 0.8));
            });
          }
          boats.forEach(({ b, g, s, rower }, i) => {
            const x = b.x * W + Math.sin(lt * 0.5 + i) * 20 * S, y = (b.y ?? 0.66) * H + Math.sin(lt * 2.2 + i) * 6 * S;
            g.setAttribute('transform', `translate(${L.f1(x)} ${L.f1(y)}) rotate(${(Math.sin(lt * 1.9 + i) * 3).toFixed(2)})`);
            rower.update(t, 'sit', { x: 0, y: -16 * s, face: 1, since: 1 });
          });
          if (crane) {
            const c = crane, s = c.s, a = lt * 1.6, sp = [];
            for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 4; sp.push(inkPath([[c.mx - Math.cos(an) * c.wr, c.by - c.wr - Math.sin(an) * c.wr], [c.mx + Math.cos(an) * c.wr, c.by - c.wr + Math.sin(an) * c.wr]], { seed: sd + 80 + k, t, w: 3, amp: 0.8 })); }
            c.spokes.setAttribute('d', sp.join(' '));
            const yb = lerp(c.by - 60 * s, c.tipY + 90 * s, 0.5 - 0.5 * Math.cos(lt * 1.3));
            c.rope.setAttribute('d', inkPath([[c.tipX, c.tipY], [c.tipX, yb - 22 * s]], { seed: sd + 90, t, w: 3, amp: 0.6 }));
            const bp = rect(c.tipX - 30 * s, yb - 22 * s, c.tipX + 30 * s, yb + 22 * s);
            c.block.setAttribute('d', inkLoop(bp, { seed: sd + 91, t, amp: 0.8, smooth: false }));
            c.blockL.setAttribute('d', inkPath(bp, { seed: sd + 92, t, w: 4, amp: 0.8, closed: true, smooth: false }));
            c.man.update(t, 'walk', { x: c.mx, y: c.by - 6 * s, face: 1, ph: lt * 0.9, since: 1 });
          }
          foamF.forEach((f, i) => {
            const y = foamF.y0 + f.b * (H - foamF.y0), k = (y - foamF.y0) / (H - foamF.y0), R = (60 + 90 * f.c) * S * (0.6 + k);
            const x = ((f.a * (W + 400) + lt * (90 + 60 * f.c) * S) % (W + 400)) - 200;
            const pts = []; for (let j = 0; j <= 10; j++) { const an = Math.PI * (1.0 + 1.3 * j / 10); pts.push([x + Math.cos(an) * R * (1 - j * 0.05), y + Math.sin(an) * R * 0.55 * (1 - j * 0.05)]); }
            f.e.setAttribute('d', inkPath(pts, { seed: sd + 700 + i, t, w: (10 + 10 * k) * S, amp: 1.5 }));
            f.l.setAttribute('d', inkPath(pts.map(([px, py]) => [px, py + 8 * S]), { seed: sd + 760 + i, t, w: 3, amp: 1.2 }));
          });
          foreBoat.forEach(b => b.g.setAttribute('transform', `rotate(${(Math.sin(lt * 1.7) * 2.5).toFixed(2)} ${L.f1(b.x0)} ${L.f1(b.y0)}) translate(0 ${L.f1(Math.sin(lt * 2.1) * 8 * S)})`));
          sh.update(t, lt);
          dust.update(lt, t);
          if (wv) dropsWave(lt, t);
          dr.update(lt, t);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };

      // wave spray: separate small set of drops whose launch time comes from sprayAt
      function dropsWave(lt, t) {
        sprayEls.forEach((e, i) => {
          const a = sprayAt[i];
          if (a == null) { e.setAttribute('d', ''); return; }
          const u = lt - a, d = sprayDat[i];
          const x = d.x + d.vx * u, y = d.y + d.vy * u + 0.5 * d.g * u * u;
          e.setAttribute('d', u > 0 && y < d.floor ? inkDot(x, y, d.sz * 0.6, d.sz * 0.8, sd + 600 + i, t, 0.6) : '');
        });
      }
    },
  };
})();
