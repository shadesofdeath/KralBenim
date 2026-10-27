// sb_map: a full-bleed old ink map of the North Sea world of 1066 (brand/kit/BRAND.md §3, §5): Great Britain, the
// east coast of Ireland, south-west Norway, Denmark and the coast from Frisia to Normandy, drawn edge to edge (no small
// card on empty paper). Land is paper-dark with inner hatching along the coast, the sea carries drifting wave ticks,
// the Humber / Ouse / Derwent and the Thames are thin blue rivers. On cues: a dashed route draws itself, a fleet of
// tiny longships (or a column of marching spears) travels along it, cities pop in, labels and stamps spring.
// Coordinates are [lon, lat] (equirectangular, cos-corrected); the view picks centre + scale, so the same map frames
// "Norway -> York" (wide) or "London -> York" (close) without a camera zoom.
// No set (the map is its own world). Uses sb__lib.js (SB) + mcB__lib.js (MCB.labels).
// P: {view: {lon: 1.5, lat: 53.85, s: 93 (px per degree of latitude), y: 0.5 (screen y of the centre, 0..1)},
//     cities: [{name, lon, lat, at, color: "ink"|"red"|"blue"|"green", dx: 0, dy: -50, size: 60, anchor}],
//     route: {pts: [[lon, lat], ...], at: cue|s, dur: 2.2, color: "red"} | false,
//     fleet: {n: 6, gap: 0.06 (route fraction between ships), s: 0.12, color: "red"} | false (ships ride the route head),
//     column: {n: 7, gap: 0.035, s: 1} | false (marching spearmen glyphs ride the route head instead of ships),
//     names: [{text, lon, lat, size: 60, color: "soft"}] (land / sea names in spaced capitals),
//     kasif: SB.warrior K (narrator standing on the map) | false,
//     rivers: true, labels: [MCB label entries (screen 0..1)], pulse: {lon, lat, at} (ink rings around a place)}
// cues: route.at, cities/labels "at", hit (punch on the route head)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const GB = [[-3.03, 58.64], [-3.09, 58.44], [-3.65, 58.1], [-3.78, 57.86], [-4.22, 57.48], [-3.87, 57.59], [-3.28, 57.72], [-2.0, 57.69], [-1.78, 57.5],
    [-2.08, 57.15], [-2.47, 56.7], [-2.97, 56.46], [-2.58, 56.28], [-3.2, 56.05], [-2.52, 56.0], [-2.0, 55.77], [-1.71, 55.6], [-1.42, 55.02], [-1.38, 54.9],
    [-1.18, 54.69], [-0.61, 54.49], [-0.4, 54.28], [-0.08, 54.12], [-0.19, 54.05], [0.12, 53.58], [-0.33, 53.72], [-0.7, 53.7], [-0.33, 53.66], [-0.07, 53.57],
    [0.34, 53.14], [0.1, 52.92], [0.4, 52.8], [0.49, 52.95], [1.3, 52.93], [1.73, 52.6], [1.75, 52.48], [1.35, 51.95], [0.9, 51.75], [0.7, 51.53], [0.2, 51.48],
    [0.9, 51.42], [1.38, 51.39], [1.45, 51.33], [1.31, 51.12], [0.97, 50.91], [0.58, 50.85], [0.33, 50.8], [0.25, 50.73], [-0.14, 50.82], [-0.79, 50.73],
    [-1.1, 50.8], [-1.6, 50.75], [-2.45, 50.6], [-2.9, 50.72], [-3.45, 50.62], [-3.64, 50.22], [-4.14, 50.37], [-5.2, 49.96], [-5.7, 50.07], [-5.0, 50.5],
    [-4.2, 51.05], [-3.0, 51.22], [-2.7, 51.5], [-3.2, 51.42], [-4.3, 51.65], [-5.2, 51.7], [-5.3, 51.88], [-4.1, 52.5], [-4.5, 52.8], [-4.7, 52.85],
    [-4.5, 53.4], [-3.1, 53.35], [-3.0, 53.45], [-3.0, 53.9], [-3.6, 54.5], [-3.3, 54.92], [-4.9, 54.7], [-5.15, 54.85], [-4.7, 55.5], [-5.6, 55.3],
    [-5.6, 56.3], [-6.2, 56.7], [-5.7, 57.3], [-5.8, 58.0], [-5.0, 58.62]];
  const IRELAND = [[-6.0, 52.2], [-6.2, 53.3], [-6.1, 54.0], [-5.5, 54.6], [-6.0, 55.2], [-7.3, 55.3], [-8.3, 55.2], [-11, 54.5], [-11, 51.4], [-8.5, 51.5], [-6.4, 52.1]];
  const CONT = [[11.0, 59.0], [11.2, 58.4], [11.9, 57.7], [12.5, 56.9], [12.9, 56.2], [12.6, 55.6], [12.4, 55.3], [12.2, 54.2], [11.5, 54.2], [10.3, 54.5],
    [10.0, 55.0], [10.7, 55.6], [10.9, 56.3], [10.3, 56.5], [10.6, 57.0], [10.4, 57.5], [10.6, 57.74], [9.96, 57.59], [8.6, 57.1], [8.1, 56.5], [8.1, 55.55],
    [8.6, 55.0], [8.9, 54.0], [8.5, 53.55], [7.1, 53.5], [6.0, 53.45], [4.8, 53.0], [4.5, 52.4], [4.0, 51.95], [3.4, 51.4], [2.55, 51.1], [1.85, 50.95],
    [1.6, 50.73], [1.6, 50.2], [1.08, 49.93], [0.2, 49.7], [0.25, 49.45], [-0.3, 49.33], [-1.25, 49.4], [-1.6, 49.65], [-1.9, 49.7], [-1.6, 49.2], [-2.0, 48.65],
    [-3.0, 48.8], [-4.7, 48.4], [-6, 46], [30, 46], [30, 60], [16, 60]];
  const NORWAY = [[7.05, 57.98], [6.6, 58.1], [6.0, 58.45], [5.6, 58.7], [5.7, 58.97], [5.3, 59.3], [5.27, 59.41], [5.1, 59.9], [5.0, 60.4], [4.9, 60.8],
    [4.9, 61.1], [5.0, 61.6], [5.3, 62.2], [6.0, 62.5], [7.0, 63.0], [8.5, 63.6], [12, 64.5], [16, 66], [16, 59.5], [11.0, 59.0], [10.6, 59.8], [10.5, 59.2],
    [9.6, 59.0], [8.77, 58.46], [8.0, 58.15], [7.45, 58.03]];
  const RIVERS = [
    [[-0.7, 53.7], [-0.87, 53.71], [-0.95, 53.76], [-1.06, 53.84], [-1.08, 53.96], [-1.3, 54.05], [-1.55, 54.2]],   // Ouse (Humber -> Riccall -> York)
    [[-0.87, 53.71], [-0.9, 53.8], [-0.88, 53.9], [-0.91, 53.99], [-0.8, 54.1], [-0.75, 54.2]],                         // Derwent (Stamford Bridge)
    [[0.2, 51.48], [-0.12, 51.5], [-0.5, 51.45], [-1.0, 51.6], [-1.6, 51.7]],                                           // Thames
    [[0.1, 49.5], [0.8, 49.3], [1.5, 49.1]],                                                                            // Seine mouth
  ];

  SH.sb_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const SB = window.SB, MCB = window.MCB, atOr = SB.atOr, f1 = SB.f1, sd = seed * 1000 + 613;
      const V = Object.assign({ lon: 1.5, lat: 53.85, s: 93, y: 0.5 }, P.view || {});
      const kx = Math.cos(V.lat * Math.PI / 180);
      const PX = q => [W / 2 + (q[0] - V.lon) * kx * V.s, V.y * H - (q[1] - V.lat) * V.s];
      const root = el(svg, 'g');
      const seaH = inkEl(root, INK.blue, { 'fill-opacity': 0.55 });
      const landF = [GB, IRELAND, CONT, NORWAY].map(() => inkEl(root, INK.paperDark));
      const landH = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.6 });
      const landR = [GB, IRELAND, CONT, NORWAY].map(() => inkEl(root, INK.inkSoft));
      const riv = inkEl(root, INK.blue);
      // decoration that fills the sheet: hill and tree glyphs on the land, a double border, a compass rose, a scale bar
      const DECO = P.deco !== false;
      const glyH = inkEl(root, INK.inkSoft), glyT = inkEl(root, INK.green, { 'fill-opacity': 0.55 }), glyTR = inkEl(root, INK.inkSoft);
      const border = inkEl(root, INK.ink), compF = inkEl(root, INK.paperLight), compK = inkEl(root, INK.ink), compR = inkEl(root, INK.red);
      const scaleE = inkEl(root, INK.ink), scaleF = inkEl(root, INK.ink);
      const lands = [GB, IRELAND, CONT, NORWAY].map(poly => poly.map(PX));
      const inPoly = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
      const glyphs = [];
      if (DECO) { const rg = rng(sd + 31); for (let gy = 140; gy < H - 60; gy += 120) for (let gx = 60; gx < W - 40; gx += 130) {
        const x = gx + (rg() - 0.5) * 70, y = gy + (rg() - 0.5) * 60, kind = rg() < 0.5 ? 'hill' : 'tree';
        if (y > 1150 && y < 1340) continue;                                    // keep the caption band clean
        if (!lands.some(l => inPoly(l, x, y))) continue;
        if (lands.some(l => l.some(([px, py]) => Math.hypot(px - x, py - y) < 46))) continue;   // not on the coast line
        glyphs.push([x, y, kind, rg()]);
      } }
      const SCB = P.scalebar || { x: 0.1, y: 0.86, miles: 100 };
      const COMP = P.compass === false ? null : Object.assign({ x: 0.82, y: 0.84, r: 120 }, P.compass || {});
      const scaleT = DECO && SCB ? el(root, 'text', { 'font-family': INK_FONT, 'font-size': 52, fill: INK.ink, x: f1(SCB.x * W), y: f1(SCB.y * H - 34) }) : null;
      if (scaleT) scaleT.textContent = `${SCB.miles} MILES`;
      const compN = COMP ? el(root, 'text', { 'font-family': "'Zilla Slab', Georgia, serif", 'font-weight': 700, 'font-size': 56, fill: INK.ink, 'text-anchor': 'middle', x: f1(COMP.x * W), y: f1(COMP.y * H - COMP.r - 22) }) : null;
      if (compN) compN.textContent = 'N';
      const names = (P.names || []).map(N => {
        const [x, y] = PX([N.lon, N.lat]);
        const t = el(root, 'text', { x: f1(x), y: f1(y), 'font-family': INK_FONT, 'font-size': N.size || 60, 'text-anchor': 'middle', fill: SB.COL[N.color] || INK.inkSoft, 'letter-spacing': '0.18em' });
        t.textContent = String(N.text).toLocaleUpperCase('en-US');
        return t;
      });
      const routeE = inkEl(root, SB.COL[(P.route || {}).color] || INK.red);
      const routeHead = inkEl(root, SB.COL[(P.route || {}).color] || INK.red);
      const pulse = inkEl(root, INK.red);
      const ships = P.fleet ? Array.from({ length: P.fleet.n ?? 6 }, (_, i) => SB.longship(el(root, 'g'), sd + 40 + i)) : [];
      const colG = el(root, 'g'), colE = inkEl(colG), colT = inkEl(colG, INK.inkSoft), colH = inkEl(colG, INK.inkSoft);
      const cities = (P.cities || []).map((c, i) => {
        const g = el(root, 'g'), dot = inkEl(g, INK.paperLight), ring = inkEl(g, SB.COL[c.color] || INK.ink), core = inkEl(g, SB.COL[c.color] || INK.ink);
        const t = el(g, 'text', { 'font-family': "'Zilla Slab', Fraunces, Georgia, serif", 'font-weight': 700, 'font-size': c.size || 62, 'text-anchor': c.anchor || 'middle', fill: SB.COL[c.color] || INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        t.textContent = String(c.name).toLocaleUpperCase('en-US');
        return { c, g, dot, ring, core, t, xy: PX([c.lon, c.lat]), i };
      });
      const kas = P.kasif ? SB.warrior(el(root, 'g'), Object.assign({ who: 'kasif', x: 0.8, y: 0.6, scale: 0.7, pose: 'point', face: 'left' }, P.kasif), sd + 280) : null;
      const labels = MCB.labels(el(root, 'g'), P.labels || [], W, H, sd + 300);
      // route geometry: dense Catmull-Rom polyline in screen px + cumulative length
      let R = null;
      if (P.route && (P.route.pts || []).length > 1) {
        const pts = P.route.pts.map(PX), dense = [];
        for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 14; k++) {
          const u = k / 14, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
          const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
          dense.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
        }
        dense.push(pts[pts.length - 1]);
        const cum = [0]; for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
        R = { dense, cum, L: cum[cum.length - 1] };
      }
      const at = u => {     // point + angle at route fraction u
        if (!R) return [[0, 0], 0];
        const d = clamp01(u) * R.L; let i = 1; while (i < R.cum.length - 1 && R.cum[i] < d) i++;
        const a = R.dense[i - 1], b = R.dense[i], seg = (R.cum[i] - R.cum[i - 1]) || 1, k = (d - R.cum[i - 1]) / seg;
        return [[lerp(a[0], b[0], k), lerp(a[1], b[1], k)], Math.atan2(b[1] - a[1], b[0] - a[0])];
      };
      // sea ticks: fixed grid of small arcs, drifting
      const r0 = rng(sd + 7), ticks = Array.from({ length: 70 }, () => [r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let sd2 = '';
          ticks.forEach((q, i) => {
            const x = ((q[0] * (W + 200) + t * (10 + q[2] * 12)) % (W + 200)) - 100, y = q[1] * H;
            sd2 += inkPath([[x, y], [x + 22, y - 9], [x + 44, y]], { w: 4, seed: sd + 100 + i, t, amp: 0.8 }) + ' ';
          });
          seaH.setAttribute('d', sd2);
          [GB, IRELAND, CONT, NORWAY].forEach((poly, k) => {
            const pts = poly.map(PX);
            landF[k].setAttribute('d', inkLoop(pts, { seed: sd + 10 + k, t, amp: 1.2, smooth: false }));
            landR[k].setAttribute('d', inkPath(pts, { w: 5, seed: sd + 20 + k, t, closed: true, amp: 1.2, smooth: false }));
          });
          // coastal hatching on Britain (short strokes just inside the coast)
          let hd = '';
          const gp = GB.map(PX);
          for (let i = 0; i < gp.length; i += 2) {
            const a = gp[i], b = gp[(i + 1) % gp.length], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
            const nx = -dy / L, ny = dx / L;   // inward normal for a clockwise ring in screen space
            hd += inkPath([[mx + nx * 8, my + ny * 8], [mx + nx * 26, my + ny * 26]], { w: 3, seed: sd + 200 + i, t, amp: 0.6 }) + ' ';
          }
          landH.setAttribute('d', hd);
          if (DECO) {
            let gh = '', gt = '', gtr = '';
            glyphs.forEach(([x, y, kind, q], i) => {
              if (kind === 'hill') gh += inkPath([[x - 34, y + 12], [x - 10, y - 18 - q * 10], [x + 6, y - 4], [x + 22, y - 22 - q * 8], [x + 44, y + 12]], { w: 4, seed: sd + 800 + i, t, amp: 0.8 }) + ' ';
              else { const c = SB.ell(x, y - 18, 20, 24, 9); gt += inkLoop(c, { seed: sd + 900 + i, t, amp: 0.8 }) + ' '; gtr += inkPath(c, { w: 3.5, seed: sd + 950 + i, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[x, y + 4], [x, y + 22]], { w: 4, seed: sd + 990 + i, t, amp: 0.5 }) + ' '; }
            });
            glyH.setAttribute('d', gh); glyT.setAttribute('d', gt); glyTR.setAttribute('d', gtr);
            const m = 26;
            border.setAttribute('d', inkPath([[m, m], [W - m, m], [W - m, H - m], [m, H - m]], { w: 9, seed: sd + 60, t, closed: true, amp: 1, smooth: false }) + ' ' +
              inkPath([[m + 18, m + 18], [W - m - 18, m + 18], [W - m - 18, H - m - 18], [m + 18, H - m - 18]], { w: 3, seed: sd + 61, t, closed: true, amp: 1, smooth: false }));
            if (COMP) {
              const cx = COMP.x * W, cy = COMP.y * H, R = COMP.r, rot = Math.sin(t * 0.6) * 4 * Math.PI / 180;
              compF.setAttribute('d', inkLoop(SB.ell(cx, cy, R * 0.7, R * 0.7, 18), { seed: sd + 62, t, amp: 1 }));
              let kd = inkPath(SB.ell(cx, cy, R * 0.7, R * 0.7, 18), { w: 4, seed: sd + 63, t, closed: true, amp: 1 }) + ' ', rd = '';
              for (let q = 0; q < 8; q++) {
                const a = q * Math.PI / 4 - Math.PI / 2 + rot, L = q % 2 ? R * 0.62 : R, wd = q % 2 ? 0.16 : 0.14;
                const tip = [cx + Math.cos(a) * L, cy + Math.sin(a) * L], l = [cx + Math.cos(a - Math.PI / 2) * R * wd, cy + Math.sin(a - Math.PI / 2) * R * wd], r2 = [cx + Math.cos(a + Math.PI / 2) * R * wd, cy + Math.sin(a + Math.PI / 2) * R * wd];
                const tri = inkLoop([l, tip, r2, [cx, cy]], { seed: sd + 64 + q, t, amp: 0.6, smooth: false });
                if (q === 0) rd += tri; else if (q % 2 === 0) kd += tri + ' '; else kd += inkPath([l, tip, r2], { w: 3, seed: sd + 74 + q, t, amp: 0.6, smooth: false }) + ' ';
              }
              compK.setAttribute('d', kd); compR.setAttribute('d', rd);
            }
            if (SCB && scaleT) {
              const px = SCB.miles / 69 * V.s, x0 = SCB.x * W, y0 = SCB.y * H;
              let sf = '';
              for (let k = 0; k < 4; k++) if (k % 2 === 0) sf += inkLoop([[x0 + k * px / 4, y0 - 9], [x0 + (k + 1) * px / 4, y0 - 9], [x0 + (k + 1) * px / 4, y0 + 9], [x0 + k * px / 4, y0 + 9]], { seed: sd + 90 + k, t, amp: 0.5, smooth: false }) + ' ';
              scaleF.setAttribute('d', sf);
              scaleE.setAttribute('d', inkPath([[x0, y0 - 9], [x0 + px, y0 - 9], [x0 + px, y0 + 9], [x0, y0 + 9]], { w: 4, seed: sd + 95, t, closed: true, amp: 0.6, smooth: false }));
            }
          }
          if (P.rivers !== false) riv.setAttribute('d', RIVERS.map((r, k) => inkPath(r.map(PX), { w: 5, seed: sd + 30 + k, t, amp: 0.8 })).join(' '));
          // route + travellers
          let headU = 0;
          if (R) {
            const a = atOr(cues, P.route.at, 0.3), u = progIO(lt, a, P.route.dur ?? 2.2); headU = u;
            let d = '';
            if (u > 0) {
              const L = u * R.L; let acc = 0;
              for (let i = 1; i < R.dense.length && R.cum[i - 1] < L; i++) {
                if (Math.floor(R.cum[i] / 34) % 2 === 0) { const b = R.cum[i] > L ? at(u)[0] : R.dense[i]; d += inkPath([R.dense[i - 1], b], { w: 9, seed: sd + 400 + i, t, amp: 0.6, taper: 0 }) + ' '; }
                acc = R.cum[i];
              }
              const [hp, ang] = at(u);
              const s = 1 + 0.25 * hit;
              routeHead.setAttribute('d', u < 0.995 ? inkDot(hp[0], hp[1], 13 * s, 13 * s, sd + 5, t) :
                inkPath([[hp[0] - Math.cos(ang - 0.5) * 36, hp[1] - Math.sin(ang - 0.5) * 36], hp, [hp[0] - Math.cos(ang + 0.5) * 36, hp[1] - Math.sin(ang + 0.5) * 36]], { w: 9, seed: sd + 6, t, amp: 0.6, smooth: false }));
            } else routeHead.setAttribute('d', '');
            routeE.setAttribute('d', d);
          }
          ships.forEach((sh, i) => {
            const F = P.fleet, u = headU - i * (F.gap ?? 0.06);
            if (!R || u <= 0.001) { sh.update(t, { x: -9999, y: -9999, s: 0.01 }); return; }
            const [p, ang] = at(u), face = Math.cos(ang) >= 0 ? 1 : -1;
            sh.update(t, { x: p[0] + (i % 2 ? 14 : -14), y: p[1] + 10, s: F.s ?? 0.12, face, sail: 1, stripes: F.color || 'red', rock: 2 });
          });
          // marching column glyphs (spear + helmet dots) behind the head
          if (P.column && R) {
            const C = P.column, n = C.n ?? 7; let cd = '', ct = '', ch = '';
            for (let i = 0; i < n; i++) {
              const u = headU - i * (C.gap ?? 0.035); if (u <= 0.001) continue;
              const [p] = at(u), s = C.s ?? 1, bob = Math.abs(Math.sin(t * 6 + i)) * 4;
              cd += inkPath([[p[0] - 8 * s, p[1] - bob], [p[0] - 2 * s, p[1] - 70 * s - bob]], { w: 5, seed: sd + 500 + i, t, amp: 0.6 }) + ' ';
              ct += inkLoop([[p[0] - 8 * s, p[1] - 70 * s - bob], [p[0], p[1] - 96 * s - bob], [p[0] + 4 * s, p[1] - 70 * s - bob]], { seed: sd + 520 + i, t, amp: 0.4, smooth: false }) + ' ';
              ch += inkLoop(SB.ell(p[0] + 8 * s, p[1] - 24 * s - bob, 14 * s, 14 * s, 8), { seed: sd + 540 + i, t, amp: 0.5 }) + ' ';
            }
            colE.setAttribute('d', cd); colT.setAttribute('d', ct); colH.setAttribute('d', ch);
          }
          cities.forEach(C => {
            const a = atOr(cues, C.c.at, 0.2 + C.i * 0.3);
            if (lt < a) { C.g.style.display = 'none'; return; }
            C.g.style.display = '';
            const p = spring(lt, a, 0.55), pk = punch(lt, a, 0.6), [x, y] = C.xy, s = p * (1 + 0.15 * pk);
            C.dot.setAttribute('d', inkDot(x, y, 20 * s, 20 * s, sd + 600 + C.i, t));
            C.ring.setAttribute('d', inkCircle(x, y, 20 * s, sd + 620 + C.i, t, { w: 6 }));
            C.core.setAttribute('d', inkDot(x, y, 8 * s, 8 * s, sd + 640 + C.i, t));
            C.t.setAttribute('x', f1(x + (C.c.dx ?? 0))); C.t.setAttribute('y', f1(y + (C.c.dy ?? -42)));
            C.t.setAttribute('opacity', clamp01(p * 2).toFixed(3));
          });
          if (P.pulse) {
            const a = atOr(cues, P.pulse.at, 1), [x, y] = PX([P.pulse.lon, P.pulse.lat]); let d = '';
            if (lt >= a) for (let k = 0; k < 2; k++) { const u = ((lt - a) * 0.7 + k * 0.5) % 1; d += inkCircle(x, y, 30 + u * 110, sd + 700 + k, t, { w: 6 * (1 - u) + 1 }) + ' '; }
            pulse.setAttribute('d', d);
          }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
