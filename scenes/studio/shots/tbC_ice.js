// tbC_ice: the answer in the ice (Tambora long video, chapter 5). Parchment ink (BRAND §5), palette tokens only.
//   tbC_globe    — a hand-drawn old world map (rough continents, no borders): volcano / snowflake marks with labels,
//                  a dashed sea route with a small sailing ship, a red line that "connects the dots", a year counter
//   tbC_ice      — mode "drill": a polar ice camp (tent, drilling tripod, winch) above a cut-away of the ice sheet's
//                  layers; the borehole goes deep on a cue and an ice core is hoisted up
//                  mode "core": a long ice core lying across the frame with its yearly layers, a years ruler, a sulfur
//                  graph that is drawn left to right and spikes at the eruption layer, a red fingerprint whorl
//   tbC_thermo   — a big Celsius thermometer: the red column drops a hair on a cue, a magnifier ring shows the tiny drop
//   tbC_trio     — three pinned cards pop up one by one: snow on corn in June · an empty bowl · the Frankenstein book
//   tbC_question — split page: 1816 snowy farm on the left, a modern city in snow on the right, dashed divider
// Common P: cast (TBC.cast entries), labels (MCB labels), cam: {zoom, focus, push: cue}, ground: 0.86
// tbC_globe P: + marks: [{lon, lat, kind: "volcano"|"snow"|"dot", at, label, dx: 0, dy: -70, size: 52}],
//   route: {pts: [[lon, lat], ...], at, dur: 4, ship: true}, link: {from: [lon, lat], to: [lon, lat], at, dur: 1.2, bend: 0.25},
//   counter: {from: 1816, to: 1920, at, dur: 3, x: 0.5, y: 0.14}, ask: {at, lon, lat} (big red "?")
// tbC_ice P: + mode, surface: 0.5 (drill), deep: cue (borehole goes down), up: cue (core hoisted), core: {x0: 0.06, x1: 0.78,
//   y: 0.62}, graph: {at, dur: 2.5, spike: 0.62 (0..1 along the core)}, years: [{text, u}], fp: cue (fingerprint)
// tbC_thermo P: + x: 0.36, from: 0.64, to: 0.6, at (drop), lens: cue, note: {text: "< 1 °C", at}
// tbC_trio P: + at: [cue, cue, cue], xs: [0.2, 0.5, 0.8] (card centres), y: 0.4, s: 1 (card scale)
// tbC_question P: + split: cue (divider + panels), snow: true
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const T = () => window.TBC;
  function layers(ctx) {
    const { svg, seed } = ctx;
    const camG = el(svg, 'g');
    return { camG, bg: T().ink(el(camG, 'g'), seed * 3 + 1), mid: T().ink(el(camG, 'g'), seed * 3 + 2), castG: el(camG, 'g'),
      front: T().ink(el(camG, 'g'), seed * 3 + 3), fx: T().ink(el(camG, 'g'), seed * 3 + 4), labG: el(camG, 'g') };
  }
  const begin = (L, t) => { L.bg.begin(t); L.mid.begin(t); L.front.begin(t); L.fx.begin(t); };
  const end = L => { L.bg.end(); L.mid.end(); L.front.end(); L.fx.end(); };
  function volcano(R, x, y, s, t, smoke = 1, sd = 1) {
    R.shape([[x - 60 * s, y], [x - 14 * s, y - 64 * s], [x + 14 * s, y - 64 * s], [x + 60 * s, y]], { f: INK.paperDark, w: 4.5, smooth: false });
    R.fill([[x - 14 * s, y - 64 * s], [x + 14 * s, y - 64 * s], [x + 8 * s, y - 48 * s], [x - 6 * s, y - 52 * s]], { c: INK.red });
    for (let k = 0; k < 3; k++) {
      const ph = ((t * 0.5 + k / 3 + sd * 0.17) % 1), r = (10 + ph * 20) * s * smoke;
      R.circle(x + ph * 30 * s, y - 74 * s - ph * 80 * s, Math.max(0.5, r), { f: INK.paperLight, w: 3.5, c: 'soft', op: 1 - ph * 0.6 });
    }
  }
  function flake(R, x, y, s) {
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI + Math.PI / 2; R.line([[x - Math.cos(a) * 30 * s, y - Math.sin(a) * 30 * s], [x + Math.cos(a) * 30 * s, y + Math.sin(a) * 30 * s]], { w: 6 * Math.max(0.6, s), c: 'blue' }); }
    R.circle(x, y, 8 * s, { f: INK.paperLight, w: 3.5, c: 'blue' });
  }

  // ------------------------------------------------------------------ world map data (lon, lat), rough
  const LAND = [
    [[-168, 66], [-158, 71], [-140, 70], [-120, 72], [-95, 72], [-80, 68], [-65, 61], [-56, 52], [-66, 45], [-70, 42], [-76, 36], [-81, 31], [-80, 25], [-90, 29], [-97, 26], [-97, 21], [-90, 21], [-87, 15], [-83, 9], [-80, 8], [-86, 13], [-95, 16], [-105, 20], [-110, 24], [-117, 32], [-124, 40], [-125, 49], [-133, 56], [-150, 60], [-165, 60]],
    [[-80, 8], [-75, 11], [-62, 11], [-50, 0], [-35, -6], [-39, -14], [-48, -26], [-58, -36], [-65, -42], [-68, -52], [-74, -52], [-73, -40], [-71, -18], [-81, -5]],
    [[-72, 78], [-55, 82], [-30, 82], [-20, 75], [-25, 68], [-42, 60], [-52, 64], [-58, 72]],
    [[-9, 37], [-9, 43], [-1, 46], [-4, 48], [2, 51], [8, 54], [10, 57], [5, 59], [6, 62], [14, 67], [22, 70], [30, 70], [42, 67], [60, 69], [75, 72], [100, 77], [115, 73], [140, 72], [170, 69], [180, 66], [178, 62], [162, 58], [156, 51], [142, 46], [135, 43], [128, 35], [122, 30], [121, 24], [110, 20], [108, 11], [104, 9], [100, 13], [100, 6], [103, 1], [98, 8], [94, 17], [90, 22], [80, 15], [78, 8], [73, 18], [67, 25], [58, 25], [56, 22], [52, 17], [44, 12], [51, 12], [42, 0], [40, -10], [40, -16], [35, -24], [32, -29], [27, -34], [19, -35], [15, -27], [12, -17], [13, -8], [9, -1], [9, 4], [0, 5], [-8, 4], [-14, 10], [-17, 15], [-17, 21], [-13, 27], [-9, 32], [-6, 36], [3, 37], [10, 37], [11, 33], [20, 31], [32, 31], [36, 35], [27, 37], [23, 38], [20, 40], [16, 38], [18, 40], [13, 44], [8, 44], [3, 43], [-1, 37]],
    [[114, -22], [122, -18], [130, -12], [137, -12], [142, -10], [146, -18], [153, -25], [151, -33], [145, -38], [138, -35], [132, -32], [124, -34], [115, -34]],
    [[95, 5], [98, 4], [104, -2], [106, -6], [102, -4], [96, 2]], [[105, -6], [110, -6.6], [114, -7.6], [110, -8.4], [106, -7.4]],
    [[109, 1], [114, 4], [118, 6], [119, 1], [116, -4], [111, -3]], [[116.6, -8.2], [119.2, -8.0], [119.2, -9.0], [116.8, -9.0]],
    [[131, -1], [141, -3], [150, -10], [141, -9], [135, -4]], [[130, 31], [135, 34], [141, 38], [142, 44], [140, 40], [134, 35]],
    [[-5, 50], [1, 51], [0, 54], [-3, 58], [-6, 56], [-4, 53]], [[44, -13], [50, -15], [47, -25], [43, -22]], [[-24, 64], [-14, 65], [-15, 66.5], [-22, 66.4]],
  ];
  const proj = (W, H) => (lon, lat) => [W * 0.03 + (lon + 170) / 350 * W * 0.94, H * 0.265 + (78 - lat) / 150 * H * 0.55];

  SH.tbC_globe = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx), pj = proj(W, H);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      const land = LAND.map(poly => poly.map(q => pj(q[0], q[1])));
      const ant = []; for (let i = 0; i <= 14; i++) ant.push([lerp(-40, W + 40, i / 14), pj(0, -66)[1] + Math.sin(i * 1.7) * 10]);
      const route = P.route ? P.route.pts.map(q => pj(q[0], q[1])) : null;
      const rlen = route ? route.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - route[i][0], q[1] - route[i][1]), 0) : 0;
      const along = d => { let acc = 0; for (let i = 1; i < route.length; i++) { const sl = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); if (acc + sl >= d) { const u = (d - acc) / sl; return [lerp(route[i - 1][0], route[i][0], u), lerp(route[i - 1][1], route[i][1], u), Math.atan2(route[i][1] - route[i - 1][1], route[i][0] - route[i - 1][0])]; } acc += sl; } const e = route[route.length - 1]; return [e[0], e[1], 0]; };
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb), f1 = T().f1;
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.04, focus: [0.5, 0.5] }, punch(lt, A(P.cam && P.cam.push, null)));
          begin(L, t);
          const { bg, mid, front, fx } = L;
          // frame + graticule
          bg.line([[W * 0.02, H * 0.22], [W * 0.98, H * 0.22], [W * 0.98, H * 0.86], [W * 0.02, H * 0.86]], { w: 6, closed: true, smooth: false });
          for (let lat = -60; lat <= 60; lat += 30) { const y = pj(0, lat)[1]; bg.line([[W * 0.02, y], [W * 0.98, y]], { w: 2.5, c: 'soft', op: 0.6 }); }
          for (let lon = -150; lon <= 180; lon += 30) { const x = pj(lon, 0)[0]; bg.line([[x, H * 0.22], [x, H * 0.86]], { w: 2.5, c: 'soft', op: 0.6 }); }
          land.forEach(p => bg.shape(p, { f: INK.paperDark, w: 4.5 }));
          bg.shape(ant.concat([[W + 40, H * 0.86], [-40, H * 0.86]]), { f: INK.paperLight, w: 4.5 });
          // sea route + ship
          if (route) {
            const R0 = P.route, ra = A(R0.at, 0.3), rp = progIO(lt, ra, R0.dur ?? 4), d = rp * rlen;
            const step = 26, n = Math.floor(rlen / step);
            for (let i = 0; i < n; i += 2) {
              const a = along(i * step), b = along(Math.min(d, (i + 1) * step));
              mid.line(i * step < d ? [[a[0], a[1]], [b[0], b[1]]] : null, { w: 4.5, c: 'ink', amp: 0.6 });
            }
            if (R0.ship !== false && lt >= ra) {
              const [sx, sy] = along(d), bob = Math.sin(lt * 3) * 3;
              mid.push(`translate(${f1(sx)} ${f1(sy - 10 + bob)}) scale(0.9)`);
              mid.shape([[-40, 0], [40, 0], [28, 18], [-28, 18]], { f: INK.stain, w: 4, smooth: false });
              mid.line([[0, 0], [0, -64]], { w: 4 });
              mid.shape([[2, -60], [34, -16], [2, -14]], { f: INK.paperLight, w: 3.5, smooth: false });
              mid.shape([[-2, -54], [-28, -14], [-2, -12]], { f: INK.paperLight, w: 3.5, smooth: false });
              mid.pop();
            } else { mid.push(''); mid.pop(); }
          }
          // connecting line
          if (P.link) {
            const Lk = P.link, a = pj(...Lk.from), b = pj(...Lk.to), la = A(Lk.at, dur * 0.6), lp = prog(lt, la, Lk.dur ?? 1.2);
            const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - Math.abs(b[0] - a[0]) * (Lk.bend ?? 0.25);
            const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20 * lp; pts.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * mx + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * my + u * u * b[1]]); }
            fx.line(lp > 0.01 ? pts : null, { w: 9, c: 'red' });
          }
          // marks
          (P.marks || []).forEach((m, i) => {
            const [x, y] = pj(m.lon, m.lat), a = A(m.at, 0.2 + i * 0.3), p = lt >= a ? spring(lt, a, 0.6) : 0, s = Math.max(0.01, p) * (m.s ?? 1);
            if (m.kind === 'snow') flake(front, x, y, s);
            else if (m.kind === 'dot') { front.circle(x, y, 16 * s, { f: INK.red, w: 4 }); }
            else volcano(front, x, y + 20 * s, s, t, 1, i);
            front.text(m.label || '', x + (m.dx ?? 0), y + (m.dy ?? -96), { size: m.size ?? 52, op: m.label && p > 0.05 ? Math.min(1, p) : 0, c: m.color });
          });
          if (P.counter) {
            const Cn = P.counter, ca = A(Cn.at, 0.3), cp = progIO(lt, ca, Cn.dur ?? 3), v = Math.round(lerp(Cn.from ?? 1816, Cn.to ?? 1920, cp));
            const pk = punch(lt, ca + (Cn.dur ?? 3));
            fx.shape(inkEllipsePts(W * (Cn.x ?? 0.5), H * (Cn.y ?? 0.15), 170, 70, 3, 14), { f: INK.paperLight, w: 5 });
            fx.text(String(v), W * (Cn.x ?? 0.5), H * (Cn.y ?? 0.15) + 4, { font: 'serif', size: 96, c: cp >= 1 ? 'red' : 'ink', scale: 1 + 0.1 * pk });
          }
          if (P.ask) {
            const Q = P.ask, qa = A(Q.at, dur * 0.3), qp = lt >= qa ? spring(lt, qa, 0.6) : 0, [qx, qy] = pj(Q.lon, Q.lat);
            fx.text('?', qx, qy, { font: 'serif', size: 200, c: 'red', scale: Math.max(0.01, qp), op: qp > 0.02 ? 1 : 0, rot: Math.sin(lt * 2) * 4 });
          }
          end(L);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_ice
  SH.tbC_ice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const mode = P.mode || 'drill';
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      const r0 = rng(seed + 71), bands = Array.from({ length: 40 }, () => 0.3 + r0() * 0.7);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb), f1 = T().f1;
          begin(L, t);
          const { bg, mid, front, fx } = L;
          if (mode === 'drill') {
            T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.55] }, punch(lt, A(P.cam && P.cam.push, null)));
            const sy = H * (P.surface ?? 0.5), hx = W * (P.hole_x ?? 0.5);
            // far ice ridges + surface
            bg.shape([[-60, sy], [W * 0.12, sy - 70], [W * 0.25, sy - 30], [W * 0.4, sy - 90], [W * 0.62, sy - 40], [W * 0.8, sy - 100], [W + 60, sy - 50], [W + 60, sy]], { f: INK.paperLight, w: 5 });
            // cut-away layers
            const nb = 9;
            for (let i = 0; i < nb; i++) {
              const y0 = sy + 10 + i * (H * 0.96 - sy) / nb, y1 = y0 + (H * 0.96 - sy) / nb;
              const pts = [[-60, y0], [W * 0.3, y0 + Math.sin(i) * 8], [W * 0.7, y0 - Math.cos(i) * 8], [W + 60, y0]];
              bg.shape(pts.concat([[W + 60, y1], [-60, y1]]), { f: i % 2 ? INK.paperLight : INK.paper, w: 3, c: 'soft' });
            }
            bg.line([[-60, sy + 4], [W + 60, sy + 4]], { w: 7 });
            // borehole going deep
            const dp = progIO(lt, A(P.deep, dur * 0.5), 1.8), by = lerp(sy + 10, H * 0.94, dp);
            mid.shape([[hx - 18, sy + 4], [hx + 18, sy + 4], [hx + 18, by], [hx - 18, by]], { f: INK.inkSoft, w: 4, smooth: false });
            mid.circle(hx, by, 22 * Math.max(0.05, dp), { f: INK.red, w: 4, op: dp > 0.05 ? 1 : 0 });
            // tent
            const tx = W * 0.16;
            mid.shape([[tx - 150, sy + 4], [tx, sy - 190], [tx + 150, sy + 4]], { f: INK.red, w: 6, smooth: false });
            mid.shape([[tx - 30, sy + 4], [tx, sy - 80], [tx + 30, sy + 4]], { f: INK.inkSoft, w: 4, smooth: false });
            mid.line([[tx, sy - 190], [tx, sy - 290]], { w: 5 });
            mid.shape([[tx, sy - 290], [tx + 80 + Math.sin(lt * 6) * 10, sy - 274], [tx, sy - 252]], { f: INK.blue, w: 4 });
            // drilling tripod + winch + hoisted core
            mid.line([[hx - 140, sy + 4], [hx, sy - 330]], { w: 8 }); mid.line([[hx + 140, sy + 4], [hx, sy - 330]], { w: 8 });
            mid.circle(hx, sy - 330, 16, { f: INK.paperLight, w: 4 });
            const up = prog(lt, A(P.up, dur * 0.25), 2.2), coreTop = lerp(sy + 30, sy - 250, up);
            mid.line([[hx, sy - 316], [hx, coreTop]], { w: 3.5 });
            mid.shape([[hx - 22, coreTop], [hx + 22, coreTop], [hx + 22, coreTop + 200], [hx - 22, coreTop + 200]], { f: INK.paperLight, w: 4, smooth: false });
            for (let k = 0; k < 6; k++) mid.line([[hx - 20, coreTop + 30 + k * 28], [hx + 20, coreTop + 30 + k * 28]], { w: 2.5, c: k === 3 ? 'red' : 'soft' });
            const wx = hx + 230, cr = lt * 4;
            mid.shape([[wx - 60, sy + 4], [wx - 50, sy - 120], [wx + 50, sy - 120], [wx + 60, sy + 4]], { f: INK.blue, w: 5, smooth: false });
            mid.circle(wx, sy - 160, 40, { f: INK.paperLight, w: 5 });
            mid.line([[wx, sy - 160], [wx + Math.cos(cr) * 46, sy - 160 + Math.sin(cr) * 46]], { w: 6 });
            mid.line([[wx, sy - 200], [hx + 6, sy - 320]], { w: 3 });
            T().snow(fx, W, H, 26, lt + 3, { y1: sy + 20, wind: 80, speed: 50, size: 7, seed: seed + 5 });
          } else {
            T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.45, 0.5] }, punch(lt, A(P.fp, null)));
            const Cr = P.core || {}, x0 = W * (Cr.x0 ?? 0.06), x1 = W * (Cr.x1 ?? 0.78), cy = H * (Cr.y ?? 0.64), rr = 82;
            const G = P.graph || {}, spike = G.spike ?? 0.62, sxp = lerp(x0, x1, spike);
            // core cylinder
            bg.shape([[x0, cy - rr], [x1, cy - rr], [x1 + 24, cy], [x1, cy + rr], [x0, cy + rr], [x0 + 24, cy]], { f: INK.paperLight, w: 6 });
            bg.circle(x1, cy, 1, { w: 0 });
            bg.line([[x1, cy - rr], [x1 - 26, cy - rr * 0.6], [x1 - 30, cy], [x1 - 26, cy + rr * 0.6], [x1, cy + rr]], { w: 4, c: 'soft' });
            const gp = prog(lt, A(G.at, 0.4), G.dur ?? 2.5), fpA = A(P.fp, dur * 0.7);
            bands.forEach((b, i) => {
              const x = lerp(x0 + 30, x1 - 40, i / (bands.length - 1)), red = Math.abs(x - sxp) < 22 && gp > (spike + 0.02);
              bg.line([[x, cy - rr + 6], [x + 4, cy + rr - 6]], { w: red ? 9 : 2.5 + b * 2, c: red ? 'red' : 'soft', op: red ? 0.9 : 0.6 + b * 0.3 });
            });
            // years ruler
            bg.line([[x0, cy + rr + 40], [x1, cy + rr + 40]], { w: 5 });
            (P.years || []).forEach(yr => { const x = lerp(x0, x1, yr.u); bg.line([[x, cy + rr + 28], [x, cy + rr + 54]], { w: 4 }); bg.text(yr.text, x, cy + rr + 92, { font: 'serif', size: 50, c: yr.red ? 'red' : 'ink' }); });
            // sulfur graph above the core
            const gy0 = cy - rr - 40, pts = [];
            for (let i = 0; i <= 60; i++) {
              const u = i / 60; if (u > gp) break;
              const x = lerp(x0 + 20, x1 - 20, u), sp = Math.exp(-((u - spike) ** 2) / 0.0007);
              pts.push([x, gy0 - 14 - Math.sin(i * 1.9) * 8 - sp * 270]);
            }
            mid.line(pts.length > 1 ? pts : null, { w: 7, c: gp > spike ? 'red' : 'ink' });
            mid.line([[x0 + 20, gy0], [x1 - 20, gy0]], { w: 3, c: 'soft' });
            // fingerprint whorl
            const fp = prog(lt, fpA, 1.2);
            for (let k = 0; k < 6; k++) {
              const rx = (18 + k * 16) * fp, ry = (26 + k * 20) * fp;
              fx.line(fp > 0.05 ? inkEllipsePts(sxp, cy, rx, ry, 11 + k, 14).slice(0, 12 + (k % 2)) : null, { w: 4.5, c: 'red', op: 0.95 });
            }
          }
          end(L);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_thermo
  SH.tbC_thermo = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb), f1 = T().f1;
          const at = A(P.at, dur * 0.3), hit = punch(lt, at);
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [0.4, 0.45] }, hit);
          begin(L, t);
          const { bg, mid, front, fx } = L;
          const x = W * (P.x ?? 0.34), top = H * 0.1, bot = H * 0.74, tw = 46;
          bg.shape([[x - tw, top + tw], [x - tw, bot], [x + tw, bot], [x + tw, top + tw], [x, top]], { f: INK.paperLight, w: 7 });
          bg.circle(x, bot + 50, 84, { f: INK.paperLight, w: 7 });
          for (let i = 0; i <= 10; i++) { const y = lerp(bot - 20, top + 60, i / 10); bg.line([[x + tw + 10, y], [x + tw + (i % 5 ? 40 : 70), y]], { w: i % 5 ? 4 : 6 }); }
          bg.text('°C', x + tw + 120, top + 50, { font: 'serif', size: 70 });
          const lvl = lerp(P.from ?? 0.64, P.to ?? 0.6, progIO(lt, at, 1.6)) + Math.sin(lt * 2) * 0.002;
          const ly = lerp(bot - 20, top + 60, lvl);
          mid.shape([[x - 22, bot + 10], [x - 22, ly], [x + 22, ly], [x + 22, bot + 10]], { f: INK.red, w: 4, smooth: false });
          mid.circle(x, bot + 50, 64, { f: INK.red, w: 4 });
          // magnifier on the drop
          const lp = spring(lt, A(P.lens, at + 1.2), 0.6), y0 = lerp(bot - 20, top + 60, P.from ?? 0.64);
          if (lt >= A(P.lens, at + 1.2)) {
            const mx = x + 300, my = (y0 + ly) / 2 - 20, mr = 150 * lp;
            fx.circle(mx, my, Math.max(1, mr), { f: INK.paperLight, w: 9 });
            fx.line([[mx + mr * 0.7, my + mr * 0.7], [mx + mr * 1.25, my + mr * 1.25]], { w: 18 });
            fx.line([[mx - 90 * lp, my - 30 * lp], [mx + 90 * lp, my - 30 * lp]], { w: 5, c: 'soft' });
            fx.line([[mx - 90 * lp, my + 30 * lp], [mx + 90 * lp, my + 30 * lp]], { w: 6, c: 'red' });
            fx.line([[mx + 60 * lp, my - 30 * lp], [mx + 60 * lp, my + 24 * lp]], { w: 5, c: 'red' });
            fx.line([[mx + 46 * lp, my + 8 * lp], [mx + 60 * lp, my + 26 * lp], [mx + 74 * lp, my + 8 * lp]], { w: 5, c: 'red', smooth: false });
            fx.line([[x + tw + 6, ly], [mx - mr, my]], { w: 3.5, c: 'soft' });
          } else { fx.circle(0, 0, 1, { w: 0 }); for (let k = 0; k < 6; k++) fx.line(null); }
          end(L);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_trio
  SH.tbC_trio = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb), f1 = T().f1;
          const ats = (P.at || [0.4, 1.8, 3.2]).map((a, i) => A(a, 0.4 + i * 1.4));
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.04, focus: [0.5, 0.45] }, ats.reduce((s, a) => s + punch(lt, a), 0));
          begin(L, t);
          const R = L.mid;
          (P.xs || [0.2, 0.5, 0.8]).forEach((u, i) => {
            const a = ats[i], p = lt >= a ? spring(lt, a, 0.6) : 0, cx = W * u, cy = H * (P.y ?? 0.4), cw = 470, ch = 440;
            R.push(`translate(${f1(cx)} ${f1(cy)}) rotate(${(i - 1) * 3}) scale(${(Math.max(0.01, p) * (P.s ?? 1)).toFixed(3)})`, p > 0.01 ? 1 : 0);
            R.shape([[-cw / 2, -ch / 2], [cw / 2, -ch / 2], [cw / 2, ch / 2], [-cw / 2, ch / 2]], { f: INK.paperLight, w: 6, smooth: false });
            R.circle(0, -ch / 2 + 16, 12, { f: INK.red, w: 3 });
            if (i === 0) {
              R.line([[-200, 150], [200, 150]], { w: 5 });
              for (let k = 0; k < 3; k++) T().stalk(R, -150 + k * 90, 150, 200, t, 0.8, k + 3);
              R.shape([[-210, 150], [-100, 128], [40, 140], [210, 126], [210, 160], [-210, 160]], { f: INK.paperLight, w: 4 });
              for (let k = 0; k < 7; k++) { const fy = ((t * 50 + k * 47) % 300) - 170; R.dot(-190 + k * 60, fy, 8, { c: INK.paperLight }); R.circle(-190 + k * 60, fy, 8, { w: 2.5, c: 'soft' }); }
              T().calendar(R, 120, -80, 150, 'JUNE', 1, { size: 44 });
            } else if (i === 1) {
              R.shape([[-170, 10], [170, 10], [130, 110], [-130, 110]], { f: INK.blue, w: 6 });
              R.shape(inkEllipsePts(0, 10, 170, 34, 5, 16), { f: INK.paperDark, w: 6 });
              R.line([[130, -40], [210, -160]], { w: 9 }); R.shape(inkEllipsePts(120, -26, 24, 34, 9, 10, 0.6), { f: INK.paperLight, w: 5 });
              for (let k = 0; k < 4; k++) R.dot(-60 + k * 40, 140 + (k % 2) * 10, 6, { c: 'soft' });
            } else {
              R.shape([[-215, 150], [215, 150], [215, -110], [-215, -110]], { f: INK.red, w: 6, smooth: false });
              R.line([[-200, -94], [200, -94], [200, 134], [-200, 134]], { w: 4, c: 'gold', closed: true, smooth: false });
              R.text('FRANKENSTEIN', 0, 20, { font: 'serif', size: 50, c: 'light', maxw: 370 });
              const fl = Math.sin(t * 6) > 0.6 ? 1 : 0;
              R.shape([[60, -200], [30, -150], [56, -148], [24, -96], [80, -160], [54, -162], [76, -200]], { f: INK.gold, w: 3.5, smooth: false, fop: 0.6 + 0.4 * fl });
            }
            R.pop();
          });
          end(L);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_question
  SH.tbC_question = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      const gy = H * (P.ground ?? 0.84);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb);
          const sp = prog(lt, A(P.split, 0.2), 0.9);
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.04, focus: [0.5, 0.5] }, punch(lt, A(P.cam && P.cam.push, null)));
          begin(L, t);
          const { bg, mid, fx } = L;
          // divider
          const dn = 14;
          for (let i = 0; i < dn; i++) { const y0 = H * 0.08 + i * (gy - H * 0.08) / dn; mid.line(i / dn < sp ? [[W / 2, y0], [W / 2, y0 + (gy - H * 0.08) / dn * 0.55]] : null, { w: 6, c: 'soft' }); }
          bg.line([[-60, gy], [W + 60, gy]], { w: 6 });
          // left: 1816 farm
          T().house(bg, W * 0.16, gy, 280, 190, { snow: true, roof: 'red', lit: true });
          for (let k = 0; k < 4; k++) T().stalk(bg, W * 0.3 + k * 50, gy, 180, t, 0.85, k + 9);
          bg.shape([[-60, gy + 4], [W * 0.2, gy - 20], [W * 0.46, gy - 6], [W * 0.46, gy + 30], [-60, gy + 30]], { f: INK.paperLight, w: 4 });
          // right: modern city
          const bx0 = W * 0.56;
          [[0, 330], [110, 470], [220, 380], [330, 560], [460, 300], [570, 420], [680, 340]].forEach(([dx, h], i) => {
            const x = bx0 + dx, w = 96;
            bg.shape([[x, gy], [x, gy - h], [x + w, gy - h], [x + w, gy]], { f: i % 2 ? INK.paperLight : INK.paper, w: 5, smooth: false });
            bg.shape([[x - 6, gy - h], [x + w + 6, gy - h], [x + w, gy - h - 14], [x, gy - h - 14]], { f: INK.paperLight, w: 3.5, smooth: false });
            for (let r = 0; r < Math.floor(h / 70); r++) for (let k = 0; k < 2; k++) {
              const wx = x + 22 + k * 40, wy = gy - h + 40 + r * 70, on = ((i * 7 + r * 3 + k) % 4) !== 0;
              bg.shape([[wx, wy], [wx + 18, wy], [wx + 18, wy + 30], [wx, wy + 30]], { f: on ? INK.gold : INK.paperDark, w: 3, smooth: false });
            }
          });
          // truck on the road
          const tx = W * 0.62 + ((lt * 60) % (W * 0.3));
          bg.shape([[tx, gy - 10], [tx, gy - 110], [tx + 150, gy - 110], [tx + 150, gy - 10]], { f: INK.blue, w: 5, smooth: false });
          bg.shape([[tx + 150, gy - 10], [tx + 150, gy - 80], [tx + 200, gy - 80], [tx + 220, gy - 50], [tx + 220, gy - 10]], { f: INK.paperLight, w: 5, smooth: false });
          bg.circle(tx + 40, gy - 10, 18, { f: INK.inkSoft, w: 4 }); bg.circle(tx + 180, gy - 10, 18, { f: INK.inkSoft, w: 4 });
          if (P.snow !== false) T().snow(fx, W, H, 34, lt + 5, { y1: gy + 20, size: 8, seed: seed + 3 });
          end(L);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
