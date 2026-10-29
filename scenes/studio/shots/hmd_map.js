// hmd_map: a full-bleed old ink map of the eastern Mediterranean for the Hamidiye raid (1913), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). Land fills the frame (no card on empty paper);
// seas are pale blue wash with wave marks: the Aegean with its islands, the Dardanelles, Marmara and the Bosphorus, the
// Black Sea, the Adriatic, Sicily and Malta, the Levant coast, the Nile delta, the Suez canal and the Red Sea.
// Projection: equirectangular, kx = W / (lon1 - lon0), ky = kx / cos(latc); P.anchor lat sits at y = P.anchor_y.
// Modes:
//   blockade: zoomed on the Dardanelles: blue-pennant warship marks appear one by one in an arc across the strait's
//             mouth; on `close` a dashed blue chain joins them and the mouth is shut (a red "x" over the exit);
//             labels "Çanakkale" (red), "İstanbul", P.fleet_label (blue).
//   route:    the whole raid: small anchor marks pop up at the ports the cruiser used (no order implied), then a red ship
//             mark runs home from the Red Sea through Suez and the Aegean to İstanbul, drawing a solid red line; on
//             `home` İstanbul pulses and the P.counter label ("8 ay") pops.
// P: {mode, view: {lon0, lon1, latc, anchor, anchor_y}, labels: true, fleet_label: "Yunan donanması", counter: "8 ay",
//     ships: 6 (blockade marks), stops: [[lon, lat]...] (route)}
// cues: close (blockade), home (route), go (route: ship starts, default 25% of the scene). Needs hmd__lib.js (HMD).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const MED = [[8, 44.4], [8.8, 44.4], [10.2, 43.9], [10.5, 43.3], [11.1, 42.4], [12.3, 41.7], [13, 41.2], [14, 40.8], [14.4, 40.6], [15, 40.2], [15.7, 39.9], [16, 39.4], [15.7, 38.9], [15.6, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [17.1, 39.4], [16.5, 39.8], [17, 40.5], [18, 40.2], [18.5, 40.1], [18.3, 40.6], [17.2, 41], [16, 41.5], [15.9, 41.9], [14.7, 42.1], [14, 42.6], [13.6, 43.5], [12.4, 44.2], [12.3, 45], [12.9, 45.7], [13.7, 45.7],
    [13.8, 45], [14.5, 45.2], [15.2, 44.3], [16, 43.5], [17.4, 43], [18.5, 42.4], [19.4, 41.9], [19.4, 41.4], [19.5, 40.8], [19.3, 40.4], [20, 39.7], [20.2, 39.3], [20.8, 38.9], [21.1, 38.4], [21.6, 38.3], [21.3, 37.9], [21.6, 37.3], [21.7, 36.8], [22.1, 36.9], [22.4, 36.4], [22.8, 36.6], [23.1, 36.4], [23, 37], [22.7, 37.6], [23.2, 37.6], [23.2, 37.9], [23.7, 37.9], [24, 37.7], [24.1, 38.2], [24.6, 38.1], [24.2, 38.6], [23.3, 39], [22.8, 39.3], [23.3, 39.4], [22.9, 40], [22.6, 40.5], [23.3, 40.2], [23.7, 40], [24.3, 40.2], [23.9, 40.5], [24.6, 40.9], [25.5, 40.9], [26, 40.8], [26.7, 40.62], [26.45, 40.4], [26.18, 40.05],
    [26.4, 40.22], [26.62, 40.38], [26.72, 40.44], [26.68, 40.36], [26.45, 40.2], [26.28, 40.02], [26.1, 39.5], [26.9, 39.5], [26.6, 39], [26.9, 38.6], [26.3, 38.3], [27.2, 37.9], [27.3, 37.4], [27.6, 37], [28.1, 36.8], [28.3, 36.6], [29.1, 36.6], [29.6, 36.2], [30.5, 36.4], [30.6, 36.8], [31.4, 36.7], [32.5, 36.1], [33.6, 36.2], [34.6, 36.8], [35.8, 36.8], [36.2, 36.6], [35.8, 35.8], [35.9, 35.2], [35.5, 34.5], [35.45, 33.9], [35.1, 33.1], [34.95, 32.8], [34.6, 31.9], [34.3, 31.4], [33, 31.1], [32.3, 31.25], [31, 31.6], [30, 31.3], [29, 30.9], [27, 31.4], [25, 31.7], [23, 32.4], [21, 32.8], [20, 32], [19.6, 30.4], [18, 30.8], [15.5, 31.6], [15, 32.5], [11.5, 33.3], [10.8, 34], [11.1, 35.2], [10.6, 35.8], [11, 36.9], [10.2, 37.2], [9.5, 37.3], [8, 37]];
  const MARMARA = [[26.66, 40.38], [26.75, 40.43], [27.3, 40.65], [27.5, 40.98], [28, 41], [28.98, 41.02], [29.05, 41.15], [29.1, 41.2], [29.12, 41.1], [29.05, 40.98], [29.9, 40.75], [29, 40.4], [28, 40.38], [27.5, 40.3], [27, 40.4]];
  const BLACK = [[29.1, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [39.5, 47], [38, 46], [37.5, 45.3], [38.5, 44.4], [40, 43.4], [41.5, 42], [41.5, 41.5], [40, 41], [38, 40.9], [36.5, 41.3], [35, 42], [33, 42], [31.4, 41.3], [30, 41.1], [29.15, 41.2]];
  const RED = [[32.55, 29.95], [32.6, 29.2], [33.6, 27.8], [34.3, 26], [35.5, 24], [36.8, 22], [37.3, 20], [38.5, 18], [39.5, 15.5], [41.5, 13.5], [43.3, 12.6], [44, 12.6], [43.5, 13], [42.6, 15.5], [41.5, 17.5], [40.8, 19], [39.1, 21.5], [38, 24], [36.8, 25.9], [35.2, 28], [34.6, 28.5], [34.3, 27.9], [33.6, 28.4], [32.7, 29.6]];
  const ISLES = [
    [[12.4, 38.1], [13.3, 38.2], [14.5, 38], [15.6, 38.3], [15.1, 37.2], [15.1, 36.7], [14.3, 37], [12.6, 37.6]],            // Sicily
    [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],                                    // Crete
    [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],                                       // Cyprus
    [[27.7, 36.2], [28.2, 36.45], [28.25, 36.1], [27.8, 35.9]],                                                            // Rhodes
    [[25.85, 39.35], [26.4, 39.4], [26.6, 39.05], [26.1, 39.05]],                                                          // Lesbos
    [[25.9, 38.6], [26.15, 38.55], [26.1, 38.25], [25.85, 38.3]],                                                          // Chios
    [[25.05, 40], [25.45, 40], [25.4, 39.8], [25.1, 39.8]],                                                                // Lemnos
    [[25.7, 40.22], [26, 40.2], [25.95, 40.12], [25.7, 40.12]],                                                            // Imbros (Gökçeada)
    [[25.98, 39.85], [26.1, 39.85], [26.08, 39.79], [25.98, 39.8]],                                                        // Tenedos (Bozcaada)
    [[24.85, 37.5], [24.98, 37.5], [24.96, 37.38], [24.86, 37.4]],                                                         // Syros
    [[25.25, 37.15], [25.55, 37.15], [25.5, 36.95], [25.25, 37]],                                                          // Naxos
    [[24.4, 37.65], [24.6, 37.68], [24.55, 37.5], [24.4, 37.55]],                                                          // Kea
    [[14.3, 36.0], [14.6, 35.92], [14.5, 35.8], [14.33, 35.86]],                                                           // Malta (drawn a little big)
  ];
  const CANAL = [[32.3, 31.25], [32.3, 30.6], [32.4, 30.2], [32.55, 29.95]];
  const STOPS = [[24.93, 37.45], [35.5, 33.9], [32.3, 31.25], [14.5, 35.9], [34.99, 32.82]];   // Syros, Beirut, Port Said, Malta, Haifa
  const HOME = [[38.4, 19.6], [37.6, 21.8], [36.3, 24.5], [34.6, 26.9], [33.3, 28.6], [32.55, 29.95], [32.4, 30.4], [32.3, 31.25], [31, 32.3], [28.6, 33.6], [26.3, 35.9], [25.6, 37.6], [25.5, 39.0], [25.95, 39.85], [26.22, 40.08], [26.45, 40.25], [26.7, 40.41], [27.6, 40.75], [28.97, 41.0]];
  const VIEWS = {
    blockade: { lon0: 23.5, lon1: 29.5, latc: 39, anchor: 41.0, anchor_y: 0.2 },
    route: { lon0: 11.5, lon1: 40.5, latc: 33, anchor: 46, anchor_y: 0.17 },
  };
  SH.hmd_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.HMD, sd = seed * 1000 + 419, mode = P.mode || 'blockade', u = W / 1080;
      const V = Object.assign({}, VIEWS[mode] || VIEWS.blockade, P.view || {});
      const kx = W / (V.lon1 - V.lon0), ky = kx / Math.cos(V.latc * Math.PI / 180), ay = V.anchor_y * H;
      const X = p => [(p[0] - V.lon0) * kx, ay + (V.anchor - p[1]) * ky];
      const root = el(svg, 'g');
      const Q = (fill, extra) => inkEl(root, fill, extra);
      const land = Q(mix(INK.paper, INK.stain, 0.3)), landMarks = Q(INK.inkSoft, { 'fill-opacity': 0.55 });
      const waterCol = mix(INK.blue, INK.paperLight, 0.68);
      const seas = [MED, MARMARA, BLACK, RED].map(() => ({ f: Q(waterCol), r: Q(INK.inkSoft) }));
      const canal = Q(INK.blue);
      const isles = ISLES.map(() => ({ f: Q(mix(INK.paper, INK.stain, 0.3)), r: Q(INK.inkSoft) }));
      const waves = Q(INK.blue, { 'fill-opacity': 0.5 });
      const chain = el(root, 'path', { fill: 'none', stroke: INK.blue, 'stroke-width': 7 * u, 'stroke-linecap': 'round', 'stroke-dasharray': `${18 * u} ${14 * u}` });
      const shipsG = el(root, 'g');
      const nShips = P.ships ?? 6;
      const marks = Array.from({ length: nShips }, () => ({ hull: inkEl(shipsG, INK.ink), pen: inkEl(shipsG, INK.blue), mast: inkEl(shipsG) }));
      const cross = Q(INK.red);
      const stopsE = Q(INK.ink), stopsR = Q(INK.paperLight);
      const routeL = el(root, 'path', { fill: 'none', stroke: INK.red, 'stroke-width': 8 * u, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      const shipMark = { hull: Q(INK.red), r: Q() };
      const home = Q(INK.red), homeR = Q(INK.red, { 'fill-opacity': 0.5 }), dard = Q(INK.red);
      const comp = Q(INK.inkSoft), compN = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 48, 'text-anchor': 'middle', fill: INK.inkSoft });
      compN.textContent = 'K';
      const L = (o) => M.label(root, Object.assign({ underline: false }, o), W, H);
      const mouth = X([26.18, 40.03]), ist = X([28.97, 41.01]);
      const labs = [];
      if (P.labels !== false) {
        if (mode === 'blockade') {
          labs.push(L({ text: 'İstanbul', x: Math.min(0.8, ist[0] / W - 0.08), y: ist[1] / H - 0.035, size: 64, at: 0.1, rot: -3 }));
          labs.push(L({ text: 'Çanakkale', x: (mouth[0] + 250 * u) / W, y: (mouth[1] + 40 * u) / H, size: 70, color: 'red', at: 0.2, rot: -4, underline: true }));
          labs.push(L({ text: P.fleet_label || 'Yunan donanması', x: 0.3, y: (mouth[1] + 340 * u) / H, size: 72, color: 'blue', at: 'close', hit: 'close', rot: -3 }));
        } else {
          const mt = X([14.5, 35.9]), rs = X([37, 20.5]);
          labs.push(L({ text: 'Malta', x: mt[0] / W + 0.06, y: mt[1] / H + 0.04, size: 64, at: 0.5, rot: -3 }));
          labs.push(L({ text: 'Kızıldeniz', x: Math.min(0.78, rs[0] / W - 0.12), y: 0.76, size: 64, color: 'blue', at: 0.6, rot: -6 }));
          labs.push(L({ text: 'İstanbul', x: Math.min(0.8, ist[0] / W - 0.06), y: ist[1] / H - 0.04, size: 68, color: 'red', at: 0.2, rot: -3, underline: true }));
          if (P.counter !== false) labs.push(L({ text: P.counter || '8 ay', x: 0.3, y: 0.53, size: 110, color: 'red', at: 'home', hit: 'home', rot: -6, underline: true }));
        }
      }
      const r0 = rng(sd + 3), WV = Array.from({ length: 40 }, () => [r0(), r0()]), MK = Array.from({ length: 60 }, () => [r0(), r0()]);
      // land marks: mountain carets in the interiors (screen-space sampled, kept on land by lon/lat boxes)
      const ON_LAND = [[20.5, 41.2, 23.5, 42.8], [21.2, 38.6, 22.6, 40.2], [27.8, 38.2, 31.5, 40.2], [31.5, 37.2, 36, 39.6], [36, 23, 40.5, 30], [26, 22, 31.8, 29.5], [11.5, 42.8, 13.5, 44.5], [15.5, 40.5, 16.5, 41.2], [35.8, 31, 38.5, 33.5], [17.5, 43.4, 20, 45]];
      const IN_SEA = mode === 'route' ? [[16.5, 33.4, 23.5, 36.3], [27, 32.4, 33, 34.3], [23.5, 36.6, 25.7, 39.6], [17.3, 41.5, 18.5, 42.3]] : [[24, 36.6, 25.6, 39.6], [24.6, 35.8, 27, 36.5], [26.9, 40.5, 28.5, 40.85]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          land.setAttribute('d', `M-20 -20 H${W + 20} V${H + 20} H-20 Z`);
          [MED, MARMARA, BLACK, RED].forEach((poly, i) => {
            const pts = poly.map(X);
            seas[i].f.setAttribute('d', inkLoop(pts, { seed: k + 10 + i, t, amp: 1.1, smooth: false }));
            seas[i].r.setAttribute('d', inkPath(pts, { w: 4.5 * Math.max(0.8, u), seed: k + 20 + i, t, closed: true, amp: 1.1, smooth: false }));
          });
          canal.setAttribute('d', inkPath(CANAL.map(X), { w: 5 * u, seed: k + 25, t, amp: 0.6 }));
          ISLES.forEach((poly, i) => {
            let pts = poly.map(X);
            const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
            const span = Math.max(...pts.map(p => Math.hypot(p[0] - cx, p[1] - cy)));
            if (span < 13 * u) { const f = 13 * u / Math.max(1, span); pts = pts.map(p => [cx + (p[0] - cx) * f, cy + (p[1] - cy) * f]); }
            isles[i].f.setAttribute('d', inkLoop(pts, { seed: k + 30 + i, t, amp: 0.7 }));
            isles[i].r.setAttribute('d', inkPath(pts, { w: 3.5, seed: k + 50 + i, t, closed: true, amp: 0.7 }));
          });
          const WVs = [];
          WV.forEach((q, i) => {
            const b = IN_SEA[i % IN_SEA.length], p = X([lerp(b[0], b[2], q[0]), lerp(b[1], b[3], q[1])]), dx = Math.sin(t * 1.2 + i) * 4 * u, s = 1.1 * Math.max(0.8, u);
            WVs.push(inkPath([[p[0] - 22 * s + dx, p[1]], [p[0] - 8 * s + dx, p[1] - 8 * s], [p[0] + 6 * s + dx, p[1]], [p[0] + 20 * s + dx, p[1] - 8 * s]], { w: 3.2, seed: k + 80 + i, t, amp: 0.8 }));
          });
          waves.setAttribute('d', WVs.join(' '));
          const MKs = [];
          MK.forEach((q, i) => {
            const b = ON_LAND[i % ON_LAND.length], lon = lerp(b[0], b[2], q[0]), lat = lerp(b[1], b[3], q[1]);
            if (lon < V.lon0 || lon > V.lon1) return;
            const p = X([lon, lat]), s = mode === 'blockade' ? 1.4 : 0.9;
            if (p[1] < 0 || p[1] > H) return;
            MKs.push(inkPath([[p[0] - 24 * s, p[1] + 10 * s], [p[0], p[1] - 20 * s], [p[0] + 24 * s, p[1] + 10 * s]], { w: 3.2, seed: k + 150 + i, t, smooth: false }));
          });
          landMarks.setAttribute('d', MKs.join(' '));
          if (mode === 'blockade') {
            // warship marks in an arc across the strait mouth, appearing one by one; the chain joins them on `close`
            const close = M.atOr(cues, 'close', dur * 0.7);
            const arc = Array.from({ length: nShips }, (_, i) => { const a = (150 + i * (105 / (nShips - 1))) * Math.PI / 180, R = 175 * u; return [mouth[0] + Math.cos(a) * R * 1.15, mouth[1] - Math.sin(a) * R]; });
            arc.forEach((p, i) => {
              const a0 = 0.1 + i * Math.min(0.35, Math.max(0.12, (close - 0.8) / nShips)), sp = spring(lt, a0, 0.5), m = marks[i];
              if (lt < a0) { M.blank(m.hull, m.pen, m.mast); return; }
              const s = sp * 0.8 * u, bb = Math.sin(t * 1.5 + i) * 3 * u;
              const x = p[0], y = p[1] + bb;
              m.hull.setAttribute('d', inkLoop([[x - 46 * s, y - 12 * s], [x + 52 * s, y - 12 * s], [x + 38 * s, y + 12 * s], [x - 40 * s, y + 12 * s]], { seed: k + 300 + i, t, smooth: false }));
              m.mast.setAttribute('d', inkPath([[x - 6 * s, y - 12 * s], [x - 6 * s, y - 64 * s]], { w: 5 * s + 1, seed: k + 320 + i, t }) + ' ' + inkLoop([[x + 10 * s, y - 12 * s], [x + 26 * s, y - 12 * s], [x + 24 * s, y - 40 * s], [x + 12 * s, y - 40 * s]], { seed: k + 330 + i, t, smooth: false }));
              const wv = Math.sin(t * 5 + i) * 5 * s;
              m.pen.setAttribute('d', inkLoop([[x - 6 * s, y - 64 * s], [x + 34 * s, y - 56 * s + wv], [x - 6 * s, y - 46 * s]], { seed: k + 340 + i, t, smooth: false }));
            });
            const cq = progIO(lt, close - 0.25, 0.45);
            if (cq > 0.01) {
              const pts = []; const n = Math.max(2, Math.ceil(cq * 30));
              for (let j = 0; j <= n; j++) { const f = j / 30 * (nShips - 1), i0 = Math.min(nShips - 2, Math.floor(f)), q = f - i0; pts.push([lerp(arc[i0][0], arc[i0 + 1][0], q), lerp(arc[i0][1], arc[i0 + 1][1], q)]); }
              chain.setAttribute('d', 'M' + pts.map(p => M.f1(p[0]) + ' ' + M.f1(p[1])).join(' L'));
              chain.setAttribute('stroke-dashoffset', M.f1(-t * 30));
            } else chain.setAttribute('d', '');
            const xs = spring(lt, close + 0.15, 0.35) * (1 + 0.3 * punch(lt, close + 0.15, 0.7)), c = [mouth[0] - 10 * u, mouth[1] + 20 * u], r = 40 * u * xs;
            cross.setAttribute('d', lt > close + 0.15 ? inkPath([[c[0] - r, c[1] - r], [c[0] + r, c[1] + r]], { w: 11 * u, seed: k + 360, t }) + ' ' + inkPath([[c[0] + r, c[1] - r], [c[0] - r, c[1] + r]], { w: 11 * u, seed: k + 361, t }) : '');
            dard.setAttribute('d', inkCircle(mouth[0] + 60 * u, mouth[1] - 40 * u, 13 * u, k + 362, t, { fill: true }));
            home.setAttribute('d', inkCircle(ist[0], ist[1], 13 * u, k + 363, t, { fill: true }));
            homeR.setAttribute('d', '');
            M.blank(stopsE, stopsR, shipMark.hull, shipMark.r); routeL.setAttribute('d', '');
          } else {
            // ports used during the raid (no order implied): small anchors that pop in
            const S1 = [], S2 = [];
            STOPS.forEach((s, i) => {
              const a0 = 0.15 + i * 0.12; if (lt < a0) return;
              const p = X(s), q = spring(lt, a0, 0.45) * u * 1.1;
              S1.push(inkCircle(p[0], p[1], 15 * q, k + 400 + i, t, { fill: true }));
              S2.push(inkCircle(p[0], p[1], 6 * q, k + 420 + i, t, { fill: true }));
            });
            stopsE.setAttribute('d', S1.join(' ')); stopsR.setAttribute('d', S2.join(' '));
            // the run home
            const go = M.atOr(cues, 'go', dur * 0.18), hm = M.atOr(cues, 'home', dur * 0.75);
            const pr = progIO(lt, go, Math.max(0.8, hm - go));
            const R = HOME.map(X), LEN = []; let tot = 0;
            for (let i = 1; i < R.length; i++) { const d = Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]); LEN.push(d); tot += d; }
            const at = f => { let d = f * tot; for (let i = 0; i < LEN.length; i++) { if (d <= LEN[i]) { const q = d / LEN[i]; return [lerp(R[i][0], R[i + 1][0], q), lerp(R[i][1], R[i + 1][1], q), Math.atan2(R[i + 1][1] - R[i][1], R[i + 1][0] - R[i][0])]; } d -= LEN[i]; } const n = R.length; return [R[n - 1][0], R[n - 1][1], Math.atan2(R[n - 1][1] - R[n - 2][1], R[n - 1][0] - R[n - 2][0])]; };
            const seg = []; for (let i = 0; i <= 60; i++) seg.push(at(pr * i / 60));
            routeL.setAttribute('d', pr > 0.005 ? 'M' + seg.map(p => M.f1(p[0]) + ' ' + M.f1(p[1])).join(' L') : '');
            const hd = at(pr), a = hd[2], s = 1.3 * u, ca = Math.cos(a), sa = Math.sin(a);
            const sh = [[34, 0], [16, 12], [-30, 12], [-34, 0], [-30, -12], [16, -12]].map(p => [hd[0] + (p[0] * ca - p[1] * sa) * s, hd[1] + (p[0] * sa + p[1] * ca) * s]);
            shipMark.hull.setAttribute('d', inkLoop(sh, { seed: k + 450, t, smooth: false }));
            shipMark.r.setAttribute('d', inkPath(sh, { w: 4, seed: k + 451, t, closed: true, smooth: false }));
            const hp = punch(lt, hm, 1), ring = (t * 0.8) % 1;
            home.setAttribute('d', inkCircle(ist[0], ist[1], 15 * u * (1 + 0.6 * hp), k + 460, t, { fill: true }) + ' ' + inkCircle(ist[0], ist[1], 30 * u * (1 + 0.6 * hp), k + 461, t, { w: 5 }));
            homeR.setAttribute('fill-opacity', lt >= hm ? (0.6 * (1 - ring)).toFixed(3) : '0');
            homeR.setAttribute('d', lt >= hm ? inkCircle(ist[0], ist[1], 30 * u + ring * 80 * u, k + 462, t, { w: 5 }) : '');
            const dd = X([26.3, 40.12]);
            dard.setAttribute('d', inkCircle(dd[0], dd[1], 9 * u, k + 470, t, { fill: true }));
            cross.setAttribute('d', ''); chain.setAttribute('d', ''); marks.forEach(m => M.blank(m.hull, m.pen, m.mast));
          }
          // compass rose (right, mid-lower, clear of the caption band)
          const cc = mode === 'blockade' ? [0.86 * W, 0.6 * H] : [0.12 * W, 0.86 * H], cr = 58 * u, sp = Math.sin(t * 0.7) * 0.05;
          const rot = p => [cc[0] + (p[0] - cc[0]) * Math.cos(sp) - (p[1] - cc[1]) * Math.sin(sp), cc[1] + (p[0] - cc[0]) * Math.sin(sp) + (p[1] - cc[1]) * Math.cos(sp)];
          comp.setAttribute('d', inkPath([[cc[0], cc[1] - cr], [cc[0] + 18, cc[1]], [cc[0], cc[1] + cr], [cc[0] - 18, cc[1]]].map(rot), { w: 4, seed: k + 500, t, closed: true, smooth: false }) + ' ' +
            inkPath([[cc[0] - cr, cc[1]], [cc[0], cc[1] + 18], [cc[0] + cr, cc[1]], [cc[0], cc[1] - 18]].map(rot), { w: 4, seed: k + 501, t, closed: true, smooth: false }) + ' ' + inkCircle(cc[0], cc[1], cr * 0.55, k + 502, t, { w: 3 }));
          compN.setAttribute('x', M.f1(cc[0])); compN.setAttribute('y', M.f1(cc[1] - cr - 14));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
