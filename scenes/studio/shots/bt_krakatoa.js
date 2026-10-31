// bt_krakatoa: the 1883 eruption of Krakatoa, the loudest sound on record, belgesel style (docs/BELGESEL.md).
// Clean still line art, slow natural motion only (expanding sound rings, rising ash, water, a pen writing). Vertical
// Short first; places are drawn on the 1920x1080 stage (BTL.stage frames them for a Short).
//   bt_krakatoa  P: {mode: "rings"|"erupt"|"after", label, sub}  cues: hit
//                rings: a dark sea, one steep island cone; thin sound rings spread slowly from its summit
//                erupt: the same island; an ash column rises from the summit, fire light at the vent (+ label/sub)
//                after: only half a cliff is left where the island stood; one last faint ring moves away on "hit"
//   bt_ocean     P: {from: {lon, lat, label}, to: {lon, lat, label}, dist: "4.800 km", bounds}  cues: go
//                Indian Ocean map (Sumatra, Java, India, Sri Lanka); on "go" a gold arc runs from Krakatoa to
//                Rodrigues and the distance appears; a faint ring spreads from Krakatoa
//   bt_rodrigues P: {}  cues: hit        a small low island at dusk, sea all round, one figure looking out, a small sailing
//                ship on the horizon; faint sound arcs roll in from the sea; on "hit" the ship's outline turns gold
//   bt_barograph P: {mode: "room"|"close", label}  cues: hit
//                room: a weather-station desk at night under a lamp, a barograph writing a flat line
//                close: the drum chart close up, grid + trace; on "hit" the pen jumps into a sharp spike
//   bt_wave      P: {laps: 3.5, unit: "tur", fade}  cues: go   a globe centred on Krakatoa; the pressure ring spreads to
//                the horizon, runs round the far side (dashed) and back; a counter climbs to "3,5 tur"
//                fade: true: no counter, the ring travels slowly and dies away (a quiet closing frame)
//   bt_trace     P: {days: 5, n: 7, label}  cues: hit    a long barograph strip, days 1-5; the pen writes seven
//                fading spikes; on "hit" a big gold "7" appears
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const halo = e => { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 10); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); return e; };
  const circ = (cx, cy, r) => BTL.E(cx, cy, r, r);

  // ------------------------------------------------------------------ the island (stage px, sea level y 700)
  // Krakatoa before 1883: the steep Rakata cone on the left, a long lower ridge (Danan, Perboewatan) to the right
  const HORIZON = 700;
  const ISLAND = 'M600 700C660 694 730 640 790 560C830 506 862 470 884 452L906 446C930 470 958 512 990 560C1018 598 1060 616 1120 622C1170 628 1200 618 1240 632C1270 644 1300 676 1340 700Z';
  const SUMMIT = [895, 446];
  // after 1883: the northern half of Rakata collapsed: only a sheer cliff is left
  const CLIFF = 'M640 700C690 694 748 640 800 566C836 514 864 476 884 454L902 450L908 520L900 600L912 700Z';
  const CLIFF_FACE = 'M902 450L908 520L900 600L912 700';
  const STRATA = 'M842 520L906 516M818 556L904 560M796 594L900 600M780 630L904 634M760 664L908 668';

  function sea(g) {
    P0(g, `M-200 ${HORIZON}L2120 ${HORIZON}L2120 1800L-200 1800Z`, C.paperDark, 0.9);
    L0(g, `M-200 ${HORIZON}L2120 ${HORIZON}`, C.inkSoft, 2, 0.45);
    const rip = [];
    for (let i = 0; i < 16; i++) {
      const y = HORIZON + 18 + i * i * 3.6 + i * 14, len = 50 + i * 24, x = 560 + ((i * 337) % 800);
      rip.push({ e: L0(g, '', C.inkSoft, 2, 0.26 - i * 0.011), y, len, x, sp: 3 + (i % 4) * 2, ph: i * 1.9 });
    }
    return { update(lt) { for (const r of rip) { const x = r.x + r.sp * lt + 12 * Math.sin(lt * 0.35 + r.ph); r.e.setAttribute('d', `M${f1(x - r.len / 2)} ${r.y}L${f1(x + r.len / 2)} ${r.y}`); } } };
  }

  SH.bt_krakatoa = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'rings';
      const { g } = BTL.stage(svg, W, H, { fx: 960, ty: 720 });
      const st = BTL.stars(g, mode === 'after' ? 90 : 190, 1883, [0, -220, 1920, 640]);
      const sky = BTL.glow(svg, defs, 900, mode === 'after' ? 690 : 520, mode === 'after' ? 620 : 520, C.stain, mode === 'after' ? 0.2 : 0.16, g);
      // sound rings in the air, behind the island (rings / after)
      const rings = [];
      if (mode !== 'erupt') for (let i = 0; i < 5; i++) rings.push({ e: L0(g, '', C.gold, 3, 0), ph: i / 5 });
      const sw = sea(g);
      // sea rings: flat ellipses on the water around the island's foot
      const seaRings = [];
      if (mode !== 'erupt') for (let i = 0; i < 4; i++) seaRings.push({ e: L0(g, '', C.gold, 2.5, 0), ph: i / 4 });
      // ash column (erupt), drawn behind the cone
      // ash column (erupt): ONE filled silhouette with lobed edges, drawn behind the cone
      let vent = null, colF = null, colS = null, colIn = null;
      const LOBE = (() => { const r = rng(27), o = []; for (let i = 0; i < 40; i++) o.push({ a: 0.7 + r() * 0.6, ph: r() * TAU }); return o; })();
      if (mode === 'erupt') {
        colF = P0(g, '', mix(C.paperLight, C.inkSoft, 0.28), 0);
        colIn = L0(g, '', C.inkSoft, 2, 0);
        colS = L0(g, '', C.ink, 3, 0);
        vent = BTL.glow(svg, defs, SUMMIT[0], SUMMIT[1] + 6, 160, C.gold, 0, g);
      }
      // the column outline for growth gr (0..1) at time lt
      function column(gr, lt) {
        const N = 9, Hc = 450 * gr, cx = SUMMIT[0], y0 = SUMMIT[1] + 4;
        const pt = (k, side) => {
          // a narrow rising stem, then the wide umbrella cap in the top third
          const q = k / N, cap = clamp01((q - 0.6) / 0.4), w = (30 + q * 70 + Math.sin(cap * Math.PI * 0.5) * 240) * (0.45 + 0.55 * gr);
          return [cx + side * w + 6 * Math.sin(lt * 0.35 + k), y0 - q * Hc];
        };
        const lobe = (A, B, out, j) => {   // a bulge between A and B, pushed outwards
          const L = LOBE[j % LOBE.length], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
          const dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy) || 1;
          const b = len * 0.42 * L.a * (1 + 0.06 * Math.sin(lt * 0.5 + L.ph));
          const nx = -dy / len * out, ny = dx / len * out;
          return `Q${f1(mx + nx * b)} ${f1(my + ny * b)} ${f1(B[0])} ${f1(B[1])}`;
        };
        const left = [], right = [];
        for (let k = 0; k <= N; k++) { left.push(pt(k, -1)); right.push(pt(k, 1)); }
        let d = `M${f1(left[0][0])} ${f1(left[0][1])}`;
        for (let k = 1; k <= N; k++) d += lobe(left[k - 1], left[k], -1, k);
        // the cap: lobes across the top, from the top-left to the top-right
        const TL = left[N], TR = right[N], n = 4;
        let prev = TL;
        for (let i = 1; i <= n; i++) {
          const u = i / n, P = [TL[0] + (TR[0] - TL[0]) * u, TL[1] - Math.sin(u * Math.PI) * 40 * gr];
          d += lobe(prev, P, -1, 20 + i); prev = P;
        }
        for (let k = N - 1; k >= 0; k--) d += lobe(right[k + 1], right[k], -1, 10 + k);
        // a few inner billows for volume
        let din = '';
        for (let k = 3; k < N; k += 2) {
          const a = pt(k, -0.6), b = pt(k, 0.6), c = [(a[0] + b[0]) / 2, a[1] - 34 * gr];
          din += `M${f1(a[0])} ${f1(a[1])}Q${f1(c[0])} ${f1(c[1])} ${f1(b[0])} ${f1(b[1])}`;
        }
        return [d + 'Z', din];
      }
      const D = BTL.drawing(g);
      if (mode === 'after') {
        D.f(CLIFF, C.paperLight, 1);
        D.s(CLIFF.replace(/Z$/, ''), { w: 3.5, color: C.ink });
        D.s(STRATA, { w: 2, color: C.inkSoft, alpha: 0.7 });
        D.s(CLIFF_FACE, { w: 4, color: C.ink });
      } else {
        D.f(ISLAND, C.paperLight, 1);
        D.s(ISLAND.replace(/Z$/, ''), { w: 3.5, color: C.ink });
        D.s('M830 520C850 560 858 610 852 690M948 520C962 560 990 600 1010 640', { w: 2, color: C.inkSoft, alpha: 0.55 });
      }
      // reflection of the island, very faint
      el(g, 'path', { d: mode === 'after' ? CLIFF : ISLAND, fill: C.paperLight, 'fill-opacity': 0.12, transform: `translate(0 ${2 * HORIZON}) scale(1 -1)` });
      let lab = null, sub = null;
      if (P.label) lab = halo(txt(g, P.label, 960, 770, 60, { weight: 400 }));
      if (P.sub) sub = halo(txt(g, P.sub, 960, 846, 44, { font: LO, italic: true, color: C.inkSoft }));
      return {
        update(lt, dur, cues) {
          st.update(lt); sw.update(lt);
          D.reveal(BTL.ease(lt, 0, 1.8));
          if (mode === 'erupt') {
            const hit = cue(cues, 'hit', 1.2), grow = BTL.ease(lt, 0.2, 1.4) * 0.45 + BTL.ease(lt, hit - 0.2, 3.2) * 0.55;
            sky.set(0.16 + 0.14 * BTL.ease(lt, hit - 0.2, 2));
            const fire = BTL.ease(lt, hit - 0.3, 1.6);
            vent.set((0.3 + 0.4 * fire) * (0.92 + 0.08 * Math.sin(lt * 1.3)));
            vent.e.setAttribute('r', f1(120 + 300 * fire));
            const [cd, cin] = column(grow, lt);
            colF.setAttribute('d', cd); colS.setAttribute('d', cd); colIn.setAttribute('d', cin);
            const a = BTL.ease(lt, 0.2, 0.8);
            colF.setAttribute('fill-opacity', a.toFixed(3)); colS.setAttribute('stroke-opacity', (0.9 * a).toFixed(3)); colIn.setAttribute('stroke-opacity', (0.55 * a).toFixed(3));
          } else {
            sky.set((mode === 'after' ? 0.18 : 0.15) + 0.03 * Math.sin(lt * 0.5));
            const on = BTL.ease(lt, 0.3, 1.2), last = mode === 'after';
            const hit = cue(cues, 'hit', 0.6);
            rings.forEach((q, i) => {
              let ph;
              if (last) ph = i === 0 ? clamp01((lt - hit) / 6) : 0;
              else ph = ((lt / 3.6 + q.ph) % 1);
              const r = 60 + ph * 1050;
              q.e.setAttribute('d', circ(SUMMIT[0], SUMMIT[1], r));
              q.e.setAttribute('stroke-opacity', (on * (last ? (i === 0 ? 0.7 * (1 - ph) * BTL.ease(lt, hit, 0.6) : 0) : Math.min(1, 1.05 * Math.pow(1 - ph, 1.1)))).toFixed(3));
              q.e.setAttribute('stroke-width', (5.5 - 3 * ph).toFixed(2));
            });
            seaRings.forEach((q, i) => {
              let ph;
              if (last) ph = i === 0 ? clamp01((lt - hit) / 6) : 0;
              else ph = ((lt / 3.6 + q.ph + 0.1) % 1);
              const rx = 380 + ph * 900;
              q.e.setAttribute('d', BTL.E(960, HORIZON + 10, rx, rx * 0.12));
              q.e.setAttribute('stroke-opacity', (on * (last ? (i === 0 ? 0.4 * (1 - ph) * BTL.ease(lt, hit, 0.6) : 0) : 0.35 * (1 - ph))).toFixed(3));
            });
          }
          fade(lab, BTL.ease(lt, 0.6, 1.2)); fade(sub, BTL.ease(lt, 1.0, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ coastlines [lon, lat] (simplified)
  const COAST = {
    africa: [[32.5, 30], [33, 28], [35, 24], [37.5, 18], [39.5, 15.5], [43.3, 12.5], [51.2, 11.8], [51, 10.4], [49, 6], [46, 2], [42, -1], [40, -3], [39, -7], [40, -11], [40.5, -15], [37, -18], [35, -22], [35.5, -24], [33, -26], [32, -29], [27.5, -33.5], [20, -34.8], [18.4, -34], [15, -27], [12, -18], [13.5, -11], [12, -5], [9.5, 1], [9.5, 4], [4, 6.3], [-5, 5], [-8, 4.5], [-13, 8], [-17, 14.7], [-16, 23], [-10, 30], [-6, 35.8], [10, 37.3], [20, 32], [30, 31.3]],
    madagascar: [[49.3, -12], [50.4, -15.5], [49.5, -17.5], [48, -22], [47, -25], [45, -25.3], [43.6, -23.5], [43.3, -21.5], [44.4, -19.5], [44, -17], [46.3, -15.7], [48, -13.5]],
    asia: [[32.5, 30], [34, 28], [35, 27], [39, 21], [42.8, 14], [45, 12.8], [52, 15.5], [55, 17.5], [57.8, 19], [59.8, 22.5], [57, 24], [56, 26.2], [54, 24], [51.5, 24.5], [50, 26.5], [48, 29.5], [50, 30], [52, 27.8], [57, 25.7], [61, 25.2], [66.5, 25.3], [68.5, 23.5], [70, 21], [72.8, 19], [73.5, 16], [74.8, 12.8], [76.3, 9.5], [77.5, 8.1], [78.2, 9], [79.8, 10.3], [80.2, 13], [80.3, 15.8], [82.3, 17], [85, 19.5], [87, 21.5], [89, 22], [92, 22], [94, 19], [94.5, 16], [97.6, 16.5], [98.5, 13], [98.3, 10], [98.8, 8], [100.3, 6], [100.4, 4], [101.3, 2.8], [103.4, 1.3], [104.3, 1.4], [103.5, 4], [103.2, 5.5], [102.2, 6.2], [101, 6.9], [100.2, 8.5], [99.2, 10.2], [99.8, 12.5], [100.5, 13.5], [101.5, 12.7], [102.8, 12], [104.8, 10.5], [105, 8.7], [106.7, 10.4], [108.8, 11.3], [109.4, 12.9], [108.8, 15.4], [106.6, 17.5], [106, 19], [108, 21.5], [110, 21], [113, 22.5], [117, 23.5], [120, 26.5], [121.8, 31], [120.5, 34], [119, 35], [122.5, 37.4], [121, 40.8], [124, 40], [126, 37], [126.5, 34.5], [129.4, 35.4], [129.5, 40.8], [133, 42.8], [140, 48], [141, 53], [135, 54.5], [141, 59], [150, 59.5], [160, 61.5], [170, 60], [180, 65], [180, 72], [140, 73], [110, 77], [80, 73], [60, 70], [40, 67], [30, 70], [30, 40], [35, 36.5], [36, 35], [34.5, 32]],
    srilanka: [[79.9, 9.8], [80.2, 9.8], [81.9, 7.5], [81.7, 6.4], [80.6, 5.9], [80, 6.8], [79.8, 8.2]],
    sumatra: [[95.3, 5.6], [97.5, 5.2], [98.7, 3.8], [100.4, 2.2], [101.4, 1.7], [103.7, 0.5], [104.5, -1.8], [105.9, -3.3], [105.8, -5.8], [104.6, -5.9], [103.8, -5.1], [102.3, -4], [101, -2.4], [100.2, -0.8], [99.1, 0.2], [98.6, 1.7], [97.1, 3], [96, 4.3]],
    java: [[105.2, -6.8], [106, -5.9], [107, -5.95], [108.3, -6.3], [110.4, -6.9], [111.5, -6.6], [112.6, -6.9], [114.5, -7.7], [114.4, -8.7], [112.5, -8.4], [110.5, -8.1], [108.5, -7.8], [106.4, -7.4], [105.4, -6.9]],
    sunda: [[115, -8.2], [115.7, -8.4], [116.7, -8.4], [119, -8.2], [120.5, -8.5], [122.8, -8.3], [122.8, -8.8], [119, -8.8], [117, -9.1], [115.5, -8.8], [115, -8.7]],
    borneo: [[109, 1.6], [109.6, -0.9], [110.2, -2.9], [111.7, -3], [113, -3.2], [114.6, -4.1], [116, -3.6], [116.5, -2], [117.6, 0.6], [118, 1.4], [118.9, 1], [119, 5], [117, 7], [115.5, 5], [113, 3.2], [111.2, 2.5], [109.6, 2]],
    sulawesi: [[119.5, -5.5], [120.4, -5.5], [120.5, -3], [121, -2.5], [122, -4.7], [123, -4.5], [121.4, -1.9], [123.3, -0.9], [121.1, -0.7], [120.4, 0.5], [121.5, 1.2], [124.7, 1.5], [124, 0.3], [120, 0.8], [119.5, -0.8], [118.8, -2.8], [119.4, -5]],
    newguinea: [[131, -1.5], [134, -0.9], [135, -3.3], [138, -1.7], [141, -2.6], [145.7, -4.7], [147.5, -6], [147.8, -8], [150, -10.3], [146.5, -8.8], [144, -7.8], [143, -9], [141, -9.1], [139, -8], [138, -5.7], [133, -4], [132, -2.9]],
    luzon: [[120, 18.5], [122.3, 18.5], [122, 16], [124, 13], [121, 13.8], [120.6, 14.5], [119.8, 16]],
    mindanao: [[122, 8], [126.5, 7], [126.2, 9.5], [125.3, 9.8], [123.5, 8.6], [122.5, 7.5]],
    mauritius: [[57.3, -20], [57.8, -19.95], [57.8, -20.5], [57.35, -20.45]],
    reunion: [[55.2, -20.9], [55.75, -20.9], [55.8, -21.35], [55.25, -21.35]],
    rodrigues: [[63.3, -19.65], [63.55, -19.65], [63.55, -19.78], [63.3, -19.78]],
    australia: [[113.5, -22], [114, -21.8], [116, -20.5], [118.5, -20.3], [121, -19.5], [122.3, -17.5], [123.5, -16.5], [125, -14.5], [127, -13.8], [128.5, -15], [130, -13], [132, -11.5], [136.7, -12.2], [136, -15], [139.5, -17.5], [141.5, -15], [141.6, -12.6], [142.5, -10.7], [143.5, -14], [145.4, -15], [146.3, -19], [149, -21.5], [153, -25.5], [153.6, -28.5], [152.5, -32.5], [150.8, -34.8], [150, -37.5], [147, -38.5], [144.5, -38.2], [141, -38], [138.5, -35.5], [137.8, -32.5], [135.8, -34.8], [134, -32.5], [131, -31.5], [126, -32.3], [123.5, -33.9], [119.8, -34], [117.5, -35], [115, -34.3], [115.7, -32], [115, -29], [114, -26], [113.5, -24.5]],
  };
  const KRAKATOA = [105.42, -6.1];

  SH.bt_ocean = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const [l0, b0, l1, b1] = P.bounds || [46, -26, 116, 6];
      const kc = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 70 : 300), ah = portrait ? 980 : H - 260;
      const s = Math.min(aw / ((l1 - l0) * kc), ah / (b1 - b0)) * (portrait ? 1.12 : 1);
      let ox = W / 2 - (l1 - l0) * kc * s / 2, oy = (portrait ? 740 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * kc * s, Y = lat => oy + (b1 - lat) * s;
      const poly = pts => 'M' + pts.map(p => f1(X(p[0])) + ' ' + f1(Y(p[1]))).join('L') + 'Z';
      if (portrait) {   // a vertical frame: the Krakatoa - Rodrigues arc sits in the middle of the picture
        const f0 = P.from || { lon: KRAKATOA[0], lat: KRAKATOA[1] }, t0 = P.to || { lon: 63.42, lat: -19.72 };
        ox += W / 2 - 20 - (X(f0.lon) + X(t0.lon)) / 2; oy += 820 - (Y(f0.lat) + Y(t0.lat)) / 2;
      }
      let grat = '';
      for (let lon = 30; lon <= 150; lon += 10) grat += `M${f1(X(lon))} -10L${f1(X(lon))} ${H + 10}`;
      for (let lat = -60; lat <= 40; lat += 10) grat += `M-10 ${f1(Y(lat))}L${W + 10} ${f1(Y(lat))}`;
      L0(g, grat, C.inkSoft, 1.5, 0.14);
      const from = P.from || { lon: KRAKATOA[0], lat: KRAKATOA[1], label: 'Krakatoa' };
      const to = P.to || { lon: 63.42, lat: -19.72, label: 'Rodrigues' };
      const A = [X(from.lon), Y(from.lat)], B = [X(to.lon), Y(to.lat)];
      const gl = BTL.glow(svg, defs, (A[0] + B[0]) / 2, (A[1] + B[1]) / 2, 520, C.stain, 0.1, g);
      const land = Object.values(COAST).map(poly).join('');
      P0(g, land, C.paperLight, 0.95);
      const coast = L0(g, land, C.inkSoft, 2.5, 0);
      // a faint sound ring spreading from Krakatoa
      const ring = L0(g, '', C.gold, 2.5, 0);
      // the arc (bulging up, over the open ocean)
      const mx = (A[0] + B[0]) / 2, my = Math.min(A[1], B[1]) - Math.abs(A[0] - B[0]) * 0.22;
      const arcD = `M${f1(A[0])} ${f1(A[1])}Q${f1(mx)} ${f1(my)} ${f1(B[0])} ${f1(B[1])}`;
      const arc = el(g, 'path', { d: arcD, fill: 'none', stroke: C.gold, 'stroke-width': 4, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
      const dot = P0(g, circ(0, 0, 9), C.ink, 0);
      const pts = [[A, from, 'end'], [B, to, 'start']].map(([p, q, an]) => {
        const pg = el(g, 'g');
        const rr = L0(pg, circ(p[0], p[1], 18), C.gold, 2.5, 0.8);
        P0(pg, circ(p[0], p[1], 9), C.gold, 1);
        const dx = an === 'end' ? -26 : 26;
        const t = halo(txt(pg, q.label || '', p[0] + dx, p[1] + 64, 50, { anchor: an }));
        t.setAttribute('opacity', 1);
        return { pg, rr, p };
      });
      // distance label, under the top of the arc
      const dist = halo(txt(g, P.dist || '4.800 km', mx, (A[1] + B[1]) / 2 + 64, 72, { color: C.gold, weight: 500, anchor: 'middle' }));
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 0, 1.2)).toFixed(3));
          const go = cue(cues, 'go', 0.8);
          fade(pts[0].pg, BTL.ease(lt, 0, 0.6)); fade(pts[1].pg, BTL.ease(lt, 0.2, 0.6) * (0.4 + 0.6 * BTL.ease(lt, go + 0.6, 0.5)));
          pts.forEach(q => { const ph = ((lt % 2.6) + 2.6) % 2.6 / 2.6; q.rr.setAttribute('d', circ(q.p[0], q.p[1], 14 + 24 * ph)); q.rr.setAttribute('stroke-opacity', ((1 - ph) * 0.8).toFixed(3)); });
          const a = BTL.ease(lt, go - 0.3, 1.0);
          arc.setAttribute('stroke-dashoffset', (1 - a).toFixed(4));
          // the travelling dot on the arc
          const u = a, ix = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], iy = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * my + u * u * B[1];
          dot.setAttribute('d', circ(ix, iy, 9)); dot.setAttribute('fill-opacity', (a > 0.01 && a < 0.99 ? 1 : 0).toString());
          fade(dist, BTL.ease(lt, go + 0.3, 0.6));
          const rp = clamp01((lt - 0.2) / Math.max(3, dur));
          ring.setAttribute('d', circ(A[0], A[1], 30 + rp * Math.abs(A[0] - B[0]) * 1.1));
          ring.setAttribute('stroke-opacity', (0.45 * (1 - rp) * BTL.ease(lt, 0.2, 0.6)).toFixed(3));
          gl.set(0.1 + 0.02 * Math.sin(lt * 0.6));
        },
      };
    },
  };

  // ------------------------------------------------------------------ Rodrigues: a shore at dusk
  // a small three-masted sailing ship, waterline y 0, bow right
  const SAIL = {
    hull: 'M-120 0C-118-14-112-22-104-26L104-26C112-22 124-14 132 0Z',
    masts: 'M-60-26L-60-190M10-26L10-220M76-26L76-176M132-14L190-60',
    sails: 'M-96-60L-24-60L-30-120L-90-120ZM-92-128L-28-128L-36-176L-84-176ZM-30-66L50-66L44-136L-24-136ZM-26-144L46-144L38-206L-18-206ZM46-60L106-60L100-116L52-116ZM50-124L102-124L96-166L56-166Z',
  };
  SH.bt_rodrigues = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const st = BTL.stars(g, 70, 19, [0, -220, 1920, 360]);
      const sky = BTL.glow(svg, defs, 760, 650, 640, C.stain, 0.24, g);
      const hz = 640;
      P0(g, `M-200 ${hz}L2120 ${hz}L2120 1800L-200 1800Z`, C.paperDark, 0.9);
      L0(g, `M-200 ${hz}L2120 ${hz}`, C.inkSoft, 2, 0.5);
      // sun glitter path under the low light
      const glit = [];
      for (let i = 0; i < 12; i++) glit.push({ e: L0(g, '', C.gold, 2, 0.3 - i * 0.02), y: hz + 14 + i * i * 2.2 + i * 10, len: 40 + i * 12, ph: i * 1.3 });
      // sound arcs rolling in from the sea (left) towards the shore
      const arcs = [0, 1, 2].map(i => ({ e: L0(g, '', C.gold, 2.5, 0), ph: i / 3 }));
      // the ship on the horizon
      const sg = el(g, 'g', { transform: `translate(760 ${hz + 4}) scale(0.42)` });
      const shipG = BTL.glow(svg, defs, 760, hz - 40, 140, C.gold, 0, g);
      const ship = BTL.drawing(sg);
      ship.f(SAIL.hull + SAIL.sails, C.paperLight, 0.9);
      ship.s(SAIL.hull, { w: 5, color: C.inkSoft });
      ship.s(SAIL.masts, { w: 4, color: C.inkSoft });
      ship.s(SAIL.sails, { w: 4, color: C.inkSoft });
      const gold = L0(sg, SAIL.hull + SAIL.masts + SAIL.sails, C.gold, 5, 0);
      // ripples on the open sea in front
      const rip = [];
      for (let i = 0; i < 12; i++) rip.push({ e: L0(g, '', C.inkSoft, 2, 0.24 - i * 0.012), y: hz + 60 + i * i * 4 + i * 18, len: 50 + i * 20, x: 620 + ((i * 263) % 700), ph: i * 1.7 });
      // a small low island in the middle distance, sea all round it; one figure on it looks out to the ship
      const ISL = 'M930 880C960 856 1010 836 1080 828C1150 820 1220 828 1270 850C1290 862 1300 874 1302 880Z';
      el(g, 'path', { d: ISL, fill: C.paperLight, 'fill-opacity': 0.12, transform: 'translate(0 1760) scale(1 -1)' });
      P0(g, ISL, C.paperLight, 1);
      L0(g, ISL.replace(/Z$/, ''), C.inkSoft, 3, 0.9);
      P0(g, 'M1250 880C1258 866 1276 862 1286 872L1290 880Z', C.paperDark, 0.9);
      P0(g, 'M960 880C966 870 982 868 990 876L992 880Z', C.paperDark, 0.9);
      // foam where the sea meets the island
      const foam = L0(g, '', C.ink, 2, 0.35);
      const fig = el(g, 'g');
      BTL.person(fig, 'stand', 1130, 832, 230, { face: -1 });
      return {
        update(lt, dur, cues) {
          st.update(lt);
          sky.set(0.22 + 0.03 * Math.sin(lt * 0.5));
          ship.reveal(BTL.ease(lt, 0, 1.6));
          const hit = cue(cues, 'hit', dur * 0.5);
          const hg = BTL.ease(lt, hit - 0.1, 0.9);
          gold.setAttribute('stroke-opacity', (0.95 * hg).toFixed(3));
          shipG.set(0.28 * hg * (0.85 + 0.15 * Math.sin(lt * 1.2)));
          glit.forEach(q => { const x = 760 + 10 * Math.sin(lt * 0.5 + q.ph); q.e.setAttribute('d', `M${f1(x - q.len / 2)} ${f1(q.y)}L${f1(x + q.len / 2)} ${f1(q.y)}`); });
          arcs.forEach(q => {
            const ph = (lt / 3.6 + q.ph) % 1, r = 200 + ph * 1200;
            q.e.setAttribute('d', `M${f1(300 + r * Math.cos(-0.5))} ${f1(hz + r * Math.sin(-0.5) * 0.4)}A${f1(r)} ${f1(r * 0.4)} 0 0 1 ${f1(300 + r * Math.cos(0.9))} ${f1(hz + r * Math.sin(0.9) * 0.4)}`);
            q.e.setAttribute('stroke-opacity', (0.5 * Math.sin(ph * Math.PI) * BTL.ease(lt, 0.4, 1)).toFixed(3));
          });
          const fy = 4 * Math.sin(lt * 0.8);
          foam.setAttribute('d', BTL.E(1116, 884, 196 + fy, 9 + fy * 0.5));
          for (const r of rip) { const x = r.x + 4 * lt + 10 * Math.sin(lt * 0.35 + r.ph); r.e.setAttribute('d', `M${f1(x - r.len / 2)} ${r.y}L${f1(x + r.len / 2)} ${r.y}`); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the barograph
  // trace value (px, up is negative) at scene time u: a quiet baseline, then a sharp jump and ringing on the hit
  const quiet = u => 6 * Math.sin(u * 0.7) + 3 * Math.sin(u * 1.9 + 1);
  const spikeAt = (u, hit, A) => {
    if (u < hit) return 0;
    const q = u - hit;
    return -A * Math.sin(Math.min(q * 5.5, Math.PI)) * (q < 0.57 ? 1 : 0) + (q >= 0.57 ? A * 0.55 * Math.sin((q - 0.57) * 3.2) * Math.exp(-(q - 0.57) * 1.1) : 0);
  };

  SH.bt_barograph = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'room';
      if (mode === 'close') {
        const portrait = H > W, g = el(svg, 'g');
        const x0 = portrait ? 80 : 300, x1 = portrait ? W - 80 : W - 300, y0 = portrait ? 420 : 230, y1 = portrait ? 1040 : 790;
        const midY = (y0 + y1) / 2 + 60, penX = x0 + (x1 - x0) * 0.72;
        BTL.glow(svg, defs, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.7, C.stain, 0.16, g);
        // the drum: a paper sheet with rounded top/bottom shading
        P0(g, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, C.paperLight, 1);
        P0(g, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y0 + 40}L${x0} ${y0 + 40}Z`, C.paperDark, 0.5);
        P0(g, `M${x0} ${y1 - 40}L${x1} ${y1 - 40}L${x1} ${y1}L${x0} ${y1}Z`, C.paperDark, 0.5);
        L0(g, `M${x0} ${y0}L${x1} ${y0}M${x0} ${y1}L${x1} ${y1}`, C.inkSoft, 3, 0.9);
        // grid: horizontal pressure lines (fixed), vertical time arcs (scroll with the paper)
        let hl = '';
        for (let y = y0 + 70; y < y1 - 50; y += 55) hl += `M${x0} ${y}L${x1} ${y}`;
        L0(g, hl, C.inkSoft, 1.5, 0.35);
        const vg = L0(g, '', C.inkSoft, 1.5, 0.3);
        const trace = L0(g, '', C.ink, 4, 1);
        // the pen arm: from a pivot off the right side to the nib
        // the pen rides on a carriage that slides up and down a rail beside the drum: the nib is always the trace's end
        const railX = penX + 120;
        L0(g, `M${f1(railX)} ${y0 + 20}L${f1(railX)} ${y1 - 20}`, C.inkSoft, 4, 0.8);
        const arm = L0(g, '', C.inkSoft, 6, 0.9), car = P0(g, '', C.paperDark, 1), carS = L0(g, '', C.inkSoft, 3, 1), nib = P0(g, '', C.gold, 1);
        const lab = P.label ? halo(txt(g, P.label, (x0 + x1) / 2, y0 - 40, 48, { font: LO, italic: true, color: C.inkSoft, anchor: 'middle' })) : null;
        const v = 150;   // paper speed, px / s
        return {
          update(lt, dur, cues) {
            const hit = cue(cues, 'hit', dur * 0.5), A = (y1 - y0) * 0.36;
            const val = u => quiet(u) + spikeAt(u, hit, A);
            let d = '';
            for (let x = x0 + 6; x <= penX; x += 4) {
              const u = lt - (penX - x) / v;
              d += (d ? 'L' : 'M') + f1(x) + ' ' + f1(midY + val(u));
            }
            trace.setAttribute('d', d);
            let vd = '';
            const off = (lt * v) % 110;
            for (let x = x0 + 40 - off + 110; x < x1; x += 110) vd += `M${f1(x)} ${y0 + 40}Q${f1(x - 14)} ${(y0 + y1) / 2} ${f1(x)} ${y1 - 40}`;
            vg.setAttribute('d', vd);
            const ny = midY + val(lt);
            arm.setAttribute('d', `M${f1(penX + 6)} ${f1(ny)}L${f1(railX)} ${f1(ny)}`);
            const cd = `M${f1(railX - 22)} ${f1(ny - 30)}L${f1(railX + 22)} ${f1(ny - 30)}L${f1(railX + 22)} ${f1(ny + 30)}L${f1(railX - 22)} ${f1(ny + 30)}Z`;
            car.setAttribute('d', cd); carS.setAttribute('d', cd);
            nib.setAttribute('d', circ(penX, ny, 8));
            fade(lab, BTL.ease(lt, 0.3, 1));
          },
        };
      }
      // room: a weather station desk at night
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.6, fy: 560 });
      const st = BTL.stars(g, 40, 7, [1150, 260, 1330, 520]);
      // back wall + window
      P0(g, 'M1150 250L1340 250L1340 530L1150 530Z', C.paperDark, 1);
      L0(g, 'M1150 250L1340 250L1340 530L1150 530ZM1245 250L1245 530M1150 390L1340 390', C.inkSoft, 3, 0.8);
      const lamp = BTL.glow(svg, defs, 840, 420, 460, C.stain, 0.3, g);
      // hanging lamp
      L0(g, 'M840 -100L840 300', C.inkSoft, 2.5, 0.8);
      P0(g, 'M790 340C800 312 880 312 890 340Z', C.paperLight, 1);
      L0(g, 'M790 340C800 312 880 312 890 340Z', C.inkSoft, 3, 1);
      const flame = P0(g, circ(840, 350, 9), C.gold, 0.9);
      // desk
      P0(g, 'M520 760L1400 760L1400 1800L520 1800Z', C.paperLight, 0.55);
      L0(g, 'M520 760L1400 760', C.inkSoft, 3, 0.9);
      L0(g, 'M520 790L1400 790', C.inkSoft, 2, 0.4);
      const D = BTL.drawing(g);
      // case base
      D.f('M720 760L1220 760L1220 712L720 712Z', C.paperDark, 1);
      D.s('M720 760L1220 760L1220 712L720 712Z', { w: 3, color: C.inkSoft });
      // drum
      D.f('M700 712L700 500C700 484 1000 484 1000 500L1000 712Z', C.paperLight, 1);
      D.s('M700 712L700 500M1000 500L1000 712', { w: 3.5, color: C.ink });
      D.s(BTL.E(850, 500, 150, 16), { w: 3.5, color: C.ink });
      D.s('M700 560L1000 560M700 610L1000 610M700 660L1000 660M760 516L760 712M840 516L840 712M920 516L920 712', { w: 1.5, color: C.inkSoft, alpha: 0.45 });
      // aneroid stack
      D.f('M1060 712L1060 600L1140 600L1140 712Z', C.paperLight, 0.6);
      D.s('M1050 700L1150 700M1050 670L1150 670M1050 640L1150 640M1050 610L1150 610', { w: 4, color: C.inkSoft });
      D.s('M1100 600L1100 560L1180 560', { w: 3, color: C.inkSoft });
      // the pen arm
      const trace = L0(g, '', C.ink, 4.5, 0);
      const arm = L0(g, '', C.ink, 5, 0), nib = P0(g, '', C.gold, 0);
      return {
        update(lt) {
          st.update(lt);
          D.reveal(BTL.ease(lt, 0, 1.6));
          lamp.set(0.28 + 0.03 * Math.sin(lt * 1.1));
          flame.setAttribute('fill-opacity', (0.8 + 0.15 * Math.sin(lt * 1.7)).toFixed(3));
          const on = BTL.ease(lt, 0.6, 0.8), wy = u => 600 + 5 * Math.sin(u * 0.9) + 2 * Math.sin(u * 2.3), ny = wy(lt);
          arm.setAttribute('d', `M1180 560L1100 ${f1(ny - 6)}L${f1(930)} ${f1(ny)}`); arm.setAttribute('stroke-opacity', on.toFixed(3));
          nib.setAttribute('d', circ(930, ny, 9)); nib.setAttribute('fill-opacity', on.toFixed(3));
          // the quiet line already written on the turning drum, running out from the pen to the left
          let d = '';
          for (let x = 930; x >= 712; x -= 6) d += (d ? 'L' : 'M') + f1(x) + ' ' + f1(wy(lt - (930 - x) / 30));
          trace.setAttribute('d', d); trace.setAttribute('stroke-opacity', on.toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the globe
  const DEG = Math.PI / 180;
  function ortho(lon0, lat0) {
    const s0 = Math.sin(lat0 * DEG), c0 = Math.cos(lat0 * DEG);
    return (lon, lat) => {
      const l = (lon - lon0) * DEG, p = lat * DEG, cp = Math.cos(p);
      const x = cp * Math.sin(l), y = c0 * Math.sin(p) - s0 * cp * Math.cos(l), z = s0 * Math.sin(p) + c0 * cp * Math.cos(l);
      if (z >= 0) return [x, y];
      const n = Math.hypot(x, y) || 1;   // behind the horizon: pinned to the limb
      return [x / n, y / n];
    };
  }
  SH.bt_wave = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 720 : 500, R = portrait ? 410 : 360;
      const pr = ortho(KRAKATOA[0] - 8, KRAKATOA[1] + 4);
      const XY = (lon, lat) => { const [x, y] = pr(lon, lat); return [cx + x * R, cy - y * R]; };
      BTL.glow(svg, defs, cx, cy, R * 1.6, C.stain, 0.14, g);
      P0(g, circ(cx, cy, R), C.paperDark, 1);
      const id = 'btk-globe-' + Math.round(cx) + '-' + Math.round(cy) + '-' + W;
      const cp = el(defs, 'clipPath', { id }); el(cp, 'path', { d: circ(cx, cy, R) });
      const inner = el(g, 'g', { 'clip-path': `url(#${id})` });
      // graticule (front side only)
      let gr = '';
      for (let lon = -180; lon < 180; lon += 30) { let d = '', on = false; for (let lat = -88; lat <= 88; lat += 4) { const [x, y] = pr(lon, lat), z = vis(lon, lat); if (z) { d += (on ? 'L' : 'M') + f1(cx + x * R) + ' ' + f1(cy - y * R); on = true; } else on = false; } gr += d; }
      for (let lat = -60; lat <= 60; lat += 30) { let d = '', on = false; for (let lon = -180; lon <= 180; lon += 4) { const [x, y] = pr(lon, lat), z = vis(lon, lat); if (z) { d += (on ? 'L' : 'M') + f1(cx + x * R) + ' ' + f1(cy - y * R); on = true; } else on = false; } gr += d; }
      function vis(lon, lat) {
        const l0 = (KRAKATOA[0] - 8) * DEG, p0 = (KRAKATOA[1] + 4) * DEG, l = lon * DEG, p = lat * DEG;
        return Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0) > 0;
      }
      L0(inner, gr, C.inkSoft, 1.5, 0.25);
      const land = Object.values(COAST).map(pts => 'M' + pts.map(p => XY(p[0], p[1]).map(f1).join(' ')).join('L') + 'Z').join('');
      P0(inner, land, C.paperLight, 1);
      L0(inner, land, C.inkSoft, 2, 0.9);
      L0(g, circ(cx, cy, R), C.ink, 3, 0.9);
      // the ring: a small circle at angular distance th from Krakatoa (drawn as a polyline of the sphere circle)
      const K = KRAKATOA.map(v => v * DEG);
      const ringPts = th => {
        const out = [];
        for (let i = 0; i <= 72; i++) {
          const b = i / 72 * TAU;
          const lat = Math.asin(Math.sin(K[1]) * Math.cos(th) + Math.cos(K[1]) * Math.sin(th) * Math.cos(b));
          const lon = K[0] + Math.atan2(Math.sin(b) * Math.sin(th) * Math.cos(K[1]), Math.cos(th) - Math.sin(K[1]) * Math.sin(lat));
          out.push([lon / DEG, lat / DEG]);
        }
        return out;
      };
      const front = L0(g, '', C.gold, 4, 0), back = L0(g, '', C.gold, 2.5, 0, { 'stroke-dasharray': '10 12' });
      const [kx, ky] = XY(KRAKATOA[0], KRAKATOA[1]);
      const kd = P0(g, circ(kx, ky, 10), C.gold, 0);
      const pring = L0(g, '', C.gold, 3, 0);   // fade: a soft ring breathing out of Krakatoa
      const num = halo(txt(g, '', cx - 20, cy - R - 70, 110, { color: C.gold, weight: 500, anchor: 'end' }));
      const unit = halo(txt(g, P.unit || 'tur', cx, cy - R - 70, 64, { font: LO, italic: true, color: C.inkSoft, anchor: 'start' }));
      const laps = P.laps ?? 3.5;
      return {
        update(lt, dur, cues) {
          const go = cue(cues, 'go', 0.4);
          kd.setAttribute('fill-opacity', BTL.ease(lt, 0, 0.6).toFixed(3));
          const t0 = 0.3, lapDur = P.fade ? 4.5 : 3.2;
          const q = Math.max(0, lt - t0) / lapDur, th = (q % 1) * TAU;   // 0..2pi: out to the antipode and back
          const ang = th <= Math.PI ? th : TAU - th;
          let fd = '', bd = '';
          if (ang > 0.02 && ang < Math.PI - 0.02) {
            let on1 = false, on2 = false;
            for (const [lon, lat] of ringPts(ang)) {
              const [x, y] = XY(lon, lat), s = f1(x) + ' ' + f1(y);
              if (vis(lon, lat)) { fd += (on1 ? 'L' : 'M') + s; on1 = true; on2 = false; } else { bd += (on2 ? 'L' : 'M') + s; on2 = true; on1 = false; }
            }
          }
          front.setAttribute('d', fd); back.setAttribute('d', bd);
          const a = BTL.ease(lt, t0, 0.5) * (P.fade ? 1 - 0.5 * BTL.ease(lt, 0.6, Math.max(1, dur - 0.8)) : 1);
          if (P.fade) { const ph = ((lt - 0.2) / 2.6 % 1 + 1) % 1; pring.setAttribute('d', circ(kx, ky, 12 + ph * 150)); pring.setAttribute('stroke-opacity', (0.7 * (1 - ph) * BTL.ease(lt, 0.2, 0.5)).toFixed(3)); }
          front.setAttribute('stroke-opacity', (0.95 * a).toFixed(3)); back.setAttribute('stroke-opacity', (0.5 * a).toFixed(3));
          // the counter climbs to the full number of laps by the cue (+ ~1.5 s), in half laps
          const c = laps * clamp01((lt - 0.4) / Math.max(1, Math.min(dur, go + 0.6) - 1.0));
          const hv = Math.max(0.5, Math.floor(c * 2) / 2);
          num.textContent = (hv % 1 ? hv.toFixed(1).replace('.', ',') : String(hv));
          fade(num, P.fade ? 0 : BTL.ease(lt, 0.3, 0.6)); fade(unit, P.fade ? 0 : BTL.ease(lt, 0.3, 0.6));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the five-day strip
  SH.bt_trace = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const days = P.days || 5, n = P.n || 7;
      const x0 = portrait ? 70 : 220, x1 = portrait ? W - 70 : W - 220, y0 = portrait ? 560 : 330, y1 = portrait ? 960 : 720;
      const mid = (y0 + y1) / 2 + 30;
      BTL.glow(svg, defs, W / 2, mid, (x1 - x0) * 0.6, C.stain, 0.13, g);
      P0(g, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, C.paperLight, 1);
      L0(g, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, C.inkSoft, 2.5, 0.9);
      let hl = '';
      for (let y = y0 + 50; y < y1; y += 50) hl += `M${x0} ${y}L${x1} ${y}`;
      L0(g, hl, C.inkSoft, 1.2, 0.3);
      let vl = '';
      const dw = (x1 - x0) / days;
      for (let i = 1; i < days; i++) vl += `M${f1(x0 + i * dw)} ${y0}L${f1(x0 + i * dw)} ${y1}`;
      L0(g, vl, C.inkSoft, 2, 0.55);
      const dl = [];
      for (let i = 0; i < days; i++) dl.push(txt(g, `${i + 1}. gün`, x0 + (i + 0.5) * dw, y1 + 64, 44, { font: LO, italic: true, color: C.inkSoft, anchor: 'middle' }));
      // passes of the wave over one station (hours): first arrival + returns every ~36 h, alternately from each side
      const hrs = [10, 26, 46, 62, 82, 98, 118].slice(0, n), amp = [1, 0.78, 0.56, 0.45, 0.33, 0.26, 0.19];
      const X = h => x0 + (h / (days * 24)) * (x1 - x0), Aw = (y1 - y0) * 0.42;
      const yv = h => {
        let v = 4 * Math.sin(h * 0.35);
        hrs.forEach((c, i) => { const q = (h - c) / 1.6; if (Math.abs(q) < 3) v -= Aw * amp[i] * Math.exp(-q * q * 1.4) * (1 - 0.6 * q * Math.exp(-q * q)); });
        return v;
      };
      const trace = L0(g, '', C.ink, 3.5, 1);
      const marks = hrs.map(h => P0(g, circ(X(h), mid - Aw * amp[hrs.indexOf(h)] - 22, 7), C.gold, 0));
      const pen = P0(g, '', C.gold, 1);
      const big = halo(txt(g, String(n), W / 2, portrait ? y0 - 70 : y0 - 50, portrait ? 220 : 170, { color: C.gold, weight: 500, anchor: 'middle' }));
      const lab = P.label ? halo(txt(g, P.label, W / 2, portrait ? y0 - 20 : y0 - 18, 44, { font: LO, italic: true, color: C.inkSoft, anchor: 'middle' })) : null;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5);
          const p = BTL.ease(lt, 0.2, Math.max(1.5, dur - 0.6)), hEnd = p * days * 24;
          let d = '';
          for (let h = 0; h <= hEnd; h += 0.5) d += (d ? 'L' : 'M') + f1(X(h)) + ' ' + f1(mid + yv(h));
          trace.setAttribute('d', d);
          pen.setAttribute('d', p > 0 && p < 1 ? circ(X(hEnd), mid + yv(hEnd), 8) : '');
          hrs.forEach((h, i) => marks[i].setAttribute('fill-opacity', (hEnd > h + 1.5 ? 0.9 : 0).toString()));
          dl.forEach((e, i) => fade(e, BTL.ease(lt, 0.1 + i * 0.12, 0.8)));
          fade(big, BTL.ease(lt, hit - 0.1, 0.8));
          fade(lab, BTL.ease(lt, hit + 0.4, 0.8));
        },
      };
    },
  };
})();
