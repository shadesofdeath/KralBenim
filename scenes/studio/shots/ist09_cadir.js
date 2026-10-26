// ist09_cadir: a camp of Ottoman tents in a palace garden after an earthquake, in parchment ink (brand/kit/BRAND.md §3, §5):
// on the horizon the wounded city (domes, snapped minarets); a row of cypresses; striped bell tents with scalloped
// valances and gold finials receding in perspective; the sultan's large tent (otağ) with its door flap open; a campfire
// with smoke; small aftershocks shake the camp again and again. Built for 11-istanbul-depremi-1509, parametric.
// Needs ist09__lib.js (IST9) and mcB__lib.js (MCB). Every line boils at 8 Hz; pure function of (seed, lt).
//
// SHOTS.ist09_cadir P: {
//   ground: 0.6 (0..1 H: where the nearest tents stand),
//   tents: [{x, y (0..1 H, base), s: 1, sultan: false}] (default: 5 small tents receding + the otağ at x 0.66),
//   tremors: [cue|s, ...] (each a 0.9 s aftershock: tents sway, rope lines twang, dust lifts off the ground),
//   bundles: [[x, y, s], ...] (cloth bundles in the foreground), fire: {x: 0.3, y: 0.62} | false, city: true (far skyline with broken minarets),
//   cast: [...MCB cast], labels: [...MCB labels]
// }
// Close-up targets (portrait 1080×1920, defaults): otağ door ≈ [710, 1040], campfire ≈ [324, 1150].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.ist09_cadir = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.IST9, M = window.MCB, { atOr, arc, rect } = L;
      const S = Math.min(W, H) / 1080 * (H > W ? 1 : 0.62);
      const sd = (seed || 1) * 5 + 3301, r = rng(sd);
      const GY = H * (P.ground ?? 0.6);
      const root = el(svg, 'g'), sh = L.Shapes();

      // ---------------------------------------------------------- far city with broken minarets
      const farG = el(root, 'g'), fy = GY - 300 * S;
      if (P.city !== false) {
        const xs = [0.08, 0.2, 0.33, 0.47, 0.6, 0.74, 0.88];
        xs.forEach((fx, i) => {
          const x = fx * W, s = (0.7 + 0.3 * ((i * 3) % 4) / 3) * S;
          if (i % 2 === 0) {
            sh.add(farG, rect(x - 60 * s, fy - 40 * s, x + 60 * s, fy + 10), { fill: INK.paperLight, fop: 0.8, stroke: INK.inkSoft, w: 3 });
            sh.add(farG, arc(x, fy - 40 * s, 40 * s, 36 * s, Math.PI, 2 * Math.PI, 10), { fill: INK.paperLight, fop: 0.8, stroke: INK.inkSoft, w: 3 });
            const broken = i % 4 === 0, mh = (broken ? 70 : 150) * s;
            sh.add(farG, broken ? [[x + 74 * s, fy], [x + 74 * s, fy - mh], [x + 80 * s, fy - mh + 10 * s], [x + 86 * s, fy - mh - 8 * s], [x + 86 * s, fy]] : rect(x + 74 * s, fy, x + 86 * s, fy - mh),
              { fill: INK.paperLight, fop: 0.8, stroke: INK.inkSoft, w: 3 });
            if (!broken) sh.add(farG, [[x + 72 * s, fy - mh], [x + 80 * s, fy - mh - 34 * s], [x + 88 * s, fy - mh]], { stroke: INK.inkSoft, w: 3 });
          } else {
            sh.add(farG, rect(x - 40 * s, fy - 30 * s, x + 40 * s, fy + 10), { fill: INK.paperLight, fop: 0.7, stroke: INK.inkSoft, w: 3 });
            sh.add(farG, [[x - 48 * s, fy - 30 * s], [x, fy - 56 * s], [x + 48 * s, fy - 30 * s]], { fill: INK.red, fop: 0.3, stroke: INK.inkSoft, w: 3 });
          }
        });
        sh.add(farG, [[-20, fy + 10], [W + 20, fy + 10]], { stroke: INK.inkSoft, w: 3, closed: false });
      }
      // cypress row
      for (let x = 20 * S; x < W; x += 92 * S) {
        const h = (170 + r() * 70) * S, y = fy + 70 * S;
        sh.add(farG, [[x, y - h], [x + 16 * S, y - h * 0.6], [x + 20 * S, y - h * 0.25], [x + 10 * S, y], [x - 10 * S, y], [x - 20 * S, y - h * 0.25], [x - 16 * S, y - h * 0.6]],
          { fill: INK.green, fop: 0.5, stroke: INK.ink, w: 3.5, smooth: true });
      }

      // ---------------------------------------------------------- tents
      const T = P.tents || [
        { x: 0.12, y: 0.5, s: 0.55 }, { x: 0.36, y: 0.5, s: 0.5 }, { x: 0.9, y: 0.51, s: 0.55 },
        { x: 0.2, y: 0.56, s: 0.75 }, { x: 0.66, y: 0.6, s: 1.25, sultan: true },
      ];
      const tents = T.slice().sort((a, b) => a.y - b.y).map((tn, i) => {
        const g = el(root, 'g'), x = tn.x * W, y = tn.y * H, s = (tn.s ?? 1) * S, w = 300 * s, h = 230 * s, peak = 120 * s;
        const red = tn.sultan ? INK.red : (i % 2 ? INK.blue : INK.red);
        // ropes + pegs
        for (const sx of [-1, 1]) sh.add(g, [[x + sx * w * 0.38, y - h - 10 * s], [x + sx * w * 0.8, y]], { stroke: INK.inkSoft, w: 2.5, closed: false });
        // walls with stripes
        sh.add(g, rect(x - w / 2, y - h, x + w / 2, y), { fill: INK.paperLight, stroke: INK.ink, w: 5 });
        for (let k = 1; k < 6; k++) if (k % 2) sh.add(g, rect(x - w / 2 + k * w / 6, y - h, x - w / 2 + (k + 1) * w / 6, y), { fill: red, fop: 0.38 });
        // roof
        sh.add(g, [[x - w / 2 - 14 * s, y - h], [x, y - h - peak], [x + w / 2 + 14 * s, y - h]], { fill: red, fop: 0.6, stroke: INK.ink, w: 5, smooth: false });
        // valance scallops
        const sc = [];
        for (let k = 0; k <= 10; k++) sc.push([x - w / 2 - 14 * s + k * (w + 28 * s) / 10, y - h + (k % 2 ? 30 : 8) * s]);
        sh.add(g, [[x - w / 2 - 14 * s, y - h], [x + w / 2 + 14 * s, y - h]].concat(sc.reverse()), { fill: INK.gold, fop: 0.75, stroke: INK.ink, w: 4, smooth: false });
        // door
        sh.add(g, [[x - w * 0.16, y], [x - w * 0.12, y - h * 0.72], [x, y - h * 0.8], [x + w * 0.12, y - h * 0.72], [x + w * 0.16, y]], { fill: tn.sultan ? INK.gold : INK.ink, fop: tn.sultan ? 0.35 : 0.75, stroke: INK.ink, w: 4, smooth: true });
        sh.add(g, [[x + w * 0.16, y], [x + w * 0.12, y - h * 0.72], [x + w * 0.3, y - h * 0.5], [x + w * 0.28, y]], { fill: INK.paperDark, stroke: INK.ink, w: 4 });
        // pole + finial
        sh.add(g, [[x, y - h - peak], [x, y - h - peak - 40 * s]], { stroke: INK.ink, w: 4, closed: false });
        sh.add(g, inkEllipsePts(x, y - h - peak - 48 * s, 11 * s, 11 * s, sd + i, 8), { fill: INK.gold, stroke: INK.ink, w: 3 });
        if (tn.sultan) sh.add(g, [[x, y - h - peak - 60 * s], [x + 50 * s, y - h - peak - 72 * s], [x, y - h - peak - 86 * s]], { fill: INK.red, fop: 0.85, stroke: INK.ink, w: 3 });
        return { g, x, y, k: i };
      });

      // ---------------------------------------------------------- campfire
      const fireG = el(root, 'g');
      const F = P.fire === false ? null : Object.assign({ x: 0.3, y: 0.62 }, P.fire || {});
      if (F) {
        const fx = F.x * W, fyy = F.y * H;
        for (let k = 0; k < 4; k++) sh.add(fireG, rect(fx - 60 * S + k * 10 * S, fyy - 10 * S - k * 3 * S, fx + 60 * S - k * 10 * S, fyy + 4 * S - k * 3 * S), { fill: INK.stain, stroke: INK.ink, w: 3.5 });
        for (let k = 0; k < 3; k++) sh.add(fireG, lt => {
          const ph = lt * (7 + k) + k * 2, hh = (70 + 30 * Math.sin(ph)) * S * (1 - k * 0.25), xo = (k - 1) * 22 * S;
          return [[fx + xo - 24 * S, fyy - 8 * S], [fx + xo + Math.sin(ph * 1.3) * 10 * S, fyy - 8 * S - hh], [fx + xo + 24 * S, fyy - 8 * S]];
        }, { fill: k === 1 ? INK.gold : INK.red, fop: 0.9, stroke: INK.ink, w: 3, smooth: true });
        for (let k = 0; k < 4; k++) sh.add(fireG, lt => {
          const u = ((lt * 0.35 + k / 4) % 1), y = fyy - 110 * S - u * 360 * S, x = fx + Math.sin(u * 6 + k) * 30 * S;
          return inkEllipsePts(x, y, (20 + u * 40) * S, (14 + u * 26) * S, sd + 90 + k, 10);
        }, { fill: INK.paperDark, fop: 0.3, stroke: INK.inkSoft, w: 2, sop: 0.6, smooth: true });
      }
      // foreground: trampled grass, tent pegs and ropes, a rolled rug and a water jug in front of the camp
      const foreG = el(root, 'g');
      for (let i = 0; i < 46; i++) { const x = r() * W, y = GY + 60 * S + Math.pow(r(), 0.8) * (H * 0.92 - GY), k = (y - GY) / (H - GY); sh.add(foreG, [[x, y], [x + (r() - 0.5) * 20 * S, y - (20 + 40 * k) * S], [x + 10 * S, y]], { stroke: INK.green, w: 2.5 + 3 * k, closed: false, sop: 0.85 }); }
      for (const [fx2, fy2] of [[0.1, 0.72], [0.9, 0.7]]) sh.add(foreG, [[fx2 * W, fy2 * H], [fx2 * W + 10 * S, fy2 * H + 70 * S]], { stroke: INK.stain, w: 9, closed: false });
      sh.add(foreG, [[0.1 * W, 0.72 * H], [0.32 * W, GY - 40 * S]], { stroke: INK.inkSoft, w: 3, closed: false });
      sh.add(foreG, [[0.9 * W, 0.7 * H], [0.78 * W, GY - 80 * S]], { stroke: INK.inkSoft, w: 3, closed: false });
      const jx = W * 0.82, jy = H * 0.75;
      sh.add(foreG, [[jx - 40 * S, jy], [jx - 55 * S, jy - 80 * S], [jx - 20 * S, jy - 130 * S], [jx - 18 * S, jy - 160 * S], [jx + 18 * S, jy - 160 * S], [jx + 20 * S, jy - 130 * S], [jx + 55 * S, jy - 80 * S], [jx + 40 * S, jy]], { fill: INK.red, fop: 0.55, stroke: INK.ink, w: 5, smooth: true });
      sh.add(foreG, [[W * 0.06, H * 0.78], [W * 0.38, H * 0.76], [W * 0.4, H * 0.8], [W * 0.08, H * 0.82]], { fill: INK.blue, fop: 0.45, stroke: INK.ink, w: 5, smooth: true });
      (P.bundles || []).forEach(([bxp, byp, bs], i) => {   // cloth bundles (bohça) of the people waiting outside
        const x = bxp * W, y = byp * H, s2 = (bs ?? 1) * S;
        sh.add(foreG, [[x - 60 * s2, y], [x - 66 * s2, y - 50 * s2], [x - 20 * s2, y - 80 * s2], [x + 30 * s2, y - 78 * s2], [x + 64 * s2, y - 46 * s2], [x + 58 * s2, y]], { fill: i % 2 ? INK.blue : INK.red, fop: 0.6, stroke: INK.ink, w: 4.5, smooth: true });
        sh.add(foreG, [[x - 10 * s2, y - 80 * s2], [x - 30 * s2, y - 110 * s2], [x + 6 * s2, y - 96 * s2], [x + 26 * s2, y - 116 * s2], [x + 12 * s2, y - 80 * s2]], { fill: i % 2 ? INK.blue : INK.red, fop: 0.75, stroke: INK.ink, w: 3.5, smooth: true });
      });
      const dust = L.dust(el(root, 'g'), sd + 600);
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      const labs = M.labels(labG, P.labels || [], W, H, sd + 950);
      const done = new Set();

      return {
        update(lt, dur, cues, info) {
          const t = (info && info.t != null) ? info.t : lt;
          let env = 0;
          (P.tremors || []).forEach((c, i) => {
            const a = atOr(cues, c, null);
            env = Math.max(env, L.quakeEnv(lt, a, 0.9));
            if (a != null && !done.has(i)) { done.add(i); const tn = tents[tents.length - 1 - (i % 2) * 2]; if (tn) dust.puff(tn.x + (i % 2 ? -60 : 200) * S, tn.y, a + 0.1, 0.6 * S); }
          });
          tents.forEach(tn => tn.g.setAttribute('transform', env > 0 ? `rotate(${(Math.sin(lt * 26 + tn.k) * 2.6 * env).toFixed(2)} ${L.f1(tn.x)} ${L.f1(tn.y)})` : ''));
          farG.setAttribute('transform', env > 0 ? `translate(${L.f1(Math.sin(lt * 40) * 5 * env)} 0)` : '');
          sh.update(t, lt);
          dust.update(lt, t);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
