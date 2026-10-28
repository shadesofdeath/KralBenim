// cay_map: a full-bleed old map from Chernobyl to the Black Sea (Chernobyl tea story), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). Not a card on empty paper: the land fills the
// whole frame (Ukraine at the top, the Black Sea in the middle, Anatolia and the Mediterranean down to the bottom
// edge), with the Dnieper, the Sea of Azov, Marmara, Lake Van and the Caspian's west shore. A radiation cloud of ink
// puffs leaves Chernobyl (pulsing red marker) and drifts south over the sea towards Rize along a dashed wind arrow,
// leaving a grey trail; when it arrives (`arrive`) the Rize marker pulses red. Projection: equirectangular around
// 46° N (lon/lat -> px), Chernobyl at P.chern, Rize at P.rize.
// P: {chern: [262, 340] (px), rize: [776, 1077] (px), labels: true, compass: true,
//     path: [[lon, lat]...] (cloud route, Chernobyl -> Rize), arrive: "arrive" (cue)}
// cues: go (cloud starts, default 0.1 s), arrive (cloud over Rize), label cues not needed. Needs cay__lib.js (CAY).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const BLACK = [[27.5, 42], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [39.5, 47], [38, 46], [37.5, 45.3], [38.5, 44.4], [40, 43.4], [41.5, 42], [41.5, 41.5], [40, 41], [38, 40.9], [36.5, 41.3], [35, 42], [33, 42], [31.4, 41.3], [30, 41.1], [29.1, 41.2], [29, 41.2]];
  const MARMARA = [[26.2, 40.1], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29.4, 40.8], [29, 40.4], [27.5, 40.4], [26.8, 40.35]];
  const MED = [[10, 37], [10, 40.6], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.1, 39.5], [26.9, 39.4], [26.8, 38.6], [26.4, 38.3], [27.2, 37.9], [27.4, 37], [28.2, 36.7], [29.6, 36.2], [30.5, 36.5], [31, 36.8], [32.5, 36.1], [33.6, 36.2], [34.6, 36.8], [35.8, 36.8], [36.2, 36.6], [35.9, 36.6], [35.8, 35.5], [35.9, 34.5], [35.2, 33], [34.9, 32.4], [34.5, 31.6], [34.2, 31.3], [32.3, 31.2], [31.2, 31.5], [29.9, 31.2], [27.5, 31.2], [25, 31.7], [22.9, 32.6], [20, 32], [20, 30.9], [18.5, 30.3], [15, 32], [10, 33]];
  const VAN = [[42.3, 38.6], [42.9, 38.95], [43.5, 38.8], [43.3, 38.4], [42.6, 38.3]];
  const CASP = [[46.6, 44.8], [47.5, 43.5], [47.6, 42.9], [48.6, 41.8], [49.1, 41.2], [49.6, 40.3], [49.4, 39.4], [48.9, 38.4], [49, 37.6], [50, 37.4], [60, 37], [60, 48], [50, 47], [49, 46.5], [47.5, 46]];
  const CYPRUS = [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]];
  const CRETE = [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]];
  const DNIEPER = [[30.1, 51.4], [30.5, 51.2], [30.5, 50.45], [31.5, 49.6], [33, 49], [34.6, 48.5], [35.1, 47.8], [34, 47.5], [33, 46.8], [32.3, 46.6]];
  const CHERN = [30.1, 51.39], RIZE = [40.52, 41.02];
  const ROUTE = [[30.1, 51.39], [30.9, 49.6], [31.6, 47.4], [33.2, 44.6], [35.8, 43.2], [38.4, 42.2], [40.52, 41.25]];
  SH.cay_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CAY, sd = seed * 1000 + 607;
      const root = el(svg, 'g');
      const ch = P.chern || [0.2426 * W, 0.177 * H], rz = P.rize || [0.7185 * W, 0.5609 * H];
      const ky = (ch[1] - rz[1]) / (CHERN[1] - RIZE[1]);              // px per degree latitude (negative lat -> down)
      const kx = Math.abs(ky) * Math.cos(46 * Math.PI / 180);
      const X = p => [ch[0] + (p[0] - CHERN[0]) * kx, ch[1] + (p[1] - CHERN[1]) * ky];
      const Q = (fill, extra) => inkEl(root, fill, extra);
      const land = Q(mix(INK.paper, INK.stain, 0.28)), landHatch = Q(INK.inkSoft, { 'fill-opacity': 0.35 });
      const waterCol = mix(INK.blue, INK.paperLight, 0.72);
      const seas = [BLACK, MARMARA, MED, VAN, CASP].map(() => ({ f: Q(waterCol), r: Q(INK.inkSoft) }));
      const isles = [CYPRUS, CRETE].map(() => ({ f: Q(mix(INK.paper, INK.stain, 0.28)), r: Q(INK.inkSoft) }));
      const waves = Q(INK.blue, { 'fill-opacity': 0.55 });
      const river = Q(INK.blue);
      const mounts = Q(INK.inkSoft);
      const trail = Q(INK.inkSoft, { 'fill-opacity': 0.22 });
      const arrowL = el(root, 'path', { fill: 'none', stroke: INK.red, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-dasharray': '22 18' });
      const arrowH = Q(INK.red);
      const markC = Q(INK.red), markCR = Q(INK.red, { 'fill-opacity': 0.5 }), markR = Q(INK.red), markRR = Q(INK.red, { 'fill-opacity': 0.5 });
      const cl = [0, 1, 2].map(i => C.cloud(el(root, 'g'), sd + 50 + i * 7));
      const comp = Q(INK.inkSoft), compN = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 48, 'text-anchor': 'middle', fill: INK.inkSoft });
      compN.textContent = 'K';
      const labs = P.labels === false ? [] : [
        C.label(root, { text: 'Çernobil', x: (ch[0] + 180) / W, y: (ch[1] + 90) / H, size: 70, color: 'red', at: 0, underline: false, rot: -4 }, W, H),
        C.label(root, { text: 'Karadeniz', x: 0.42, y: 0.47, size: 72, color: 'blue', at: 0.2, underline: false, rot: -6 }, W, H),
        C.label(root, { text: 'Anadolu', x: 0.42, y: 0.588, size: 70, color: 'ink', at: 0.4, underline: false, rot: -2 }, W, H),
        C.label(root, { text: 'Akdeniz', x: 0.3, y: 0.8, size: 70, color: 'blue', at: 0.5, underline: false, rot: -3 }, W, H),
        C.label(root, { text: 'Rize', x: Math.min(0.86, (rz[0] + 150) / W), y: (rz[1] - 40) / H, size: 70, color: 'red', at: 0.3, dim: P.arrive || 'arrive', underline: true, rot: -3 }, W, H),
      ];
      const r0 = rng(sd + 3), WV = Array.from({ length: 22 }, () => [r0(), r0()]), MT = Array.from({ length: 16 }, () => [r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          land.setAttribute('d', `M-20 -20 H${W + 20} V${H + 20} H-20 Z`);
          const LH = [];
          for (let i = -20; i < 40; i++) { const x = i * 60; LH.push(inkPath([[x, -20], [x + H * 0.35, H + 20]], { w: 1.6, seed: k + 300 + i, t, amp: 1 })); }
          landHatch.setAttribute('d', '');
          [BLACK, MARMARA, MED, VAN, CASP].forEach((poly, i) => {
            const pts = poly.map(X);
            seas[i].f.setAttribute('d', inkLoop(pts, { seed: k + 10 + i, t, amp: 1.2, smooth: i !== 2 && i !== 4 ? true : false }));
            seas[i].r.setAttribute('d', inkPath(pts, { w: 4.5, seed: k + 20 + i, t, closed: true, amp: 1.2, smooth: i !== 2 && i !== 4 }));
          });
          [CYPRUS, CRETE].forEach((poly, i) => {
            const pts = poly.map(X);
            isles[i].f.setAttribute('d', inkLoop(pts, { seed: k + 30 + i, t, amp: 1 }));
            isles[i].r.setAttribute('d', inkPath(pts, { w: 4, seed: k + 32 + i, t, closed: true, amp: 1 }));
          });
          // waves in the Black Sea + Med
          const WVs = [];
          WV.forEach((q, i) => {
            const sea = i < 14 ? [[29.5, 42], [41, 46]] : [[26.5, 32.2], [33.5, 35.6]];
            const p = X([lerp(sea[0][0], sea[1][0], q[0]), lerp(sea[0][1], sea[1][1], q[1])]);
            if (i < 14 && (p[1] > X([0, 42.2])[1] || p[1] < X([0, 45.5])[1])) return;
            const dx = Math.sin(t * 1.2 + i) * 4;
            WVs.push(inkPath([[p[0] - 22 + dx, p[1]], [p[0] - 8 + dx, p[1] - 8], [p[0] + 6 + dx, p[1]], [p[0] + 20 + dx, p[1] - 8]], { w: 3.5, seed: k + 40 + i, t, amp: 0.8 }));
          });
          waves.setAttribute('d', WVs.join(' '));
          river.setAttribute('d', inkPath(DNIEPER.map(X), { w: 5, seed: k + 60, t, amp: 1 }));
          // mountain marks over Anatolia + the Caucasus
          const M = [];
          MT.forEach((q, i) => {
            const p = i < 11 ? X([lerp(30, 43, q[0]), lerp(37.6, 40.2, q[1])]) : X([lerp(40.5, 46, q[0]), lerp(42.3, 43.4, q[1])]);
            M.push(inkPath([[p[0] - 26, p[1] + 10], [p[0], p[1] - 22], [p[0] + 26, p[1] + 10]], { w: 3.5, seed: k + 70 + i, t, smooth: false }));
          });
          mounts.setAttribute('d', M.join(' '));
          // cloud route progress
          const go = C.atOr(cues, 'go', 0.1), arr = C.atOr(cues, P.arrive || 'arrive', dur * 0.8);
          const pr = progIO(lt, go, Math.max(0.6, arr - go));
          const R = ROUTE.map(X), seg = [];
          const LEN = []; let tot = 0;
          for (let i = 1; i < R.length; i++) { const d = Math.hypot(R[i][0] - R[i - 1][0], R[i][1] - R[i - 1][1]); LEN.push(d); tot += d; }
          const at = f => { let d = f * tot; for (let i = 0; i < LEN.length; i++) { if (d <= LEN[i]) { const q = d / LEN[i]; return [lerp(R[i][0], R[i + 1][0], q), lerp(R[i][1], R[i + 1][1], q)]; } d -= LEN[i]; } return R[R.length - 1]; };
          for (let i = 0; i <= 40; i++) seg.push(at(Math.min(1, pr + 0.08) * i / 40));
          arrowL.setAttribute('d', 'M' + seg.map(p => C.f1(p[0]) + ' ' + C.f1(p[1])).join(' L'));
          arrowL.setAttribute('stroke-dashoffset', C.f1(-t * 40));
          const tip = seg[seg.length - 1], pre = seg[seg.length - 3] || seg[0], ang = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
          arrowH.setAttribute('d', pr > 0.02 ? inkLoop([[tip[0] + Math.cos(ang) * 30, tip[1] + Math.sin(ang) * 30], [tip[0] + Math.cos(ang + 2.4) * 30, tip[1] + Math.sin(ang + 2.4) * 30], [tip[0] + Math.cos(ang - 2.4) * 30, tip[1] + Math.sin(ang - 2.4) * 30]], { seed: k + 80, t, smooth: false }) : '');
          // grey trail of fallout behind the cloud
          const TL = [];
          for (let i = 0; i < 14; i++) { const f = i / 13 * pr; if (f > pr - 0.04) continue; const p = at(f); TL.push(inkCircle(p[0] + Math.sin(i * 2.1) * 20, p[1], 46 + i * 2.5, k + 90 + i, t, { fill: true, n: 10 })); }
          trail.setAttribute('d', TL.join(' '));
          // markers
          const pc = 1 + 0.25 * Math.sin(t * 6);
          markC.setAttribute('d', inkCircle(ch[0], ch[1], 16, k + 100, t, { fill: true }) + ' ' + inkCircle(ch[0], ch[1], 30 * pc, k + 101, t, { w: 5 }));
          const ring = ((t * 0.8) % 1);
          markCR.setAttribute('fill-opacity', (0.6 * (1 - ring)).toFixed(3));
          markCR.setAttribute('d', inkCircle(ch[0], ch[1], 30 + ring * 70, k + 102, t, { w: 5 }));
          const ra = lt >= arr ? 1 : 0, rp = punch(lt, arr, 1.0);
          markR.setAttribute('d', inkCircle(rz[0], rz[1], 16 * (1 + 0.5 * rp), k + 110, t, { fill: true }) + ' ' + inkCircle(rz[0], rz[1], 30 * (1 + 0.6 * rp), k + 111, t, { w: 5 }));
          const ring2 = ((t * 0.8 + 0.5) % 1);
          markRR.setAttribute('fill-opacity', ra ? (0.6 * (1 - ring2)).toFixed(3) : '0');
          markRR.setAttribute('d', ra ? inkCircle(rz[0], rz[1], 30 + ring2 * 70, k + 112, t, { w: 5 }) : '');
          // the cloud itself (three overlapping puffs at the head)
          const head = at(pr);
          cl.forEach((c, i) => c.update(t, head[0] - 60 + (i - 1) * 70 + Math.sin(t + i) * 6, head[1] - 110 - (i % 2) * 34, 230 - i * 30, 140, Math.min(1, lt / 0.35), 0.5));
          // compass rose bottom-left
          const cc = [0.88 * W, 0.83 * H], cr = 58;
          comp.setAttribute('d', inkPath([[cc[0], cc[1] - cr], [cc[0] + 18, cc[1]], [cc[0], cc[1] + cr], [cc[0] - 18, cc[1]]], { w: 4, seed: k + 120, t, closed: true, smooth: false }) + ' ' +
            inkPath([[cc[0] - cr, cc[1]], [cc[0], cc[1] + 18], [cc[0] + cr, cc[1]], [cc[0], cc[1] - 18]], { w: 4, seed: k + 121, t, closed: true, smooth: false }) + ' ' + inkCircle(cc[0], cc[1], cr * 0.55, k + 122, t, { w: 3 }));
          compN.setAttribute('x', C.f1(cc[0])); compN.setAttribute('y', C.f1(cc[1] - cr - 14));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
