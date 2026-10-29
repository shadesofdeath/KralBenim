// lh_brain: a hand-drawn sagittal brain on an anatomy notebook page lying on a desk (Maier & Seligman 2016), parchment
// ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, time)). The page fills the frame (no set):
// cerebrum with gyri, cerebellum, brain stem, front of the brain to the right. On `red` a small region in the brain stem
// (dorsal raphe) lights up red by itself and pulses, P.red_label ("PES ET") pops with an arrow; on `gold` gold light
// grows in the front of the brain (medial prefrontal cortex), runs along a dotted path down to the stem and the red
// fades out; P.gold_label ("UMUT") pops. On the desk below the page: a pencil, folded glasses, eraser crumbs, a mug ring.
// P: {red_label: "PES ET", gold_label: "UMUT", gold_sub: null (a smaller second line, e.g. "= UMUT"), cx: 0.5, cy: 0.34, s: 1.2}
// cues: red, gold. Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const BRAIN = [[-330, 40], [-345, -40], [-310, -140], [-220, -220], [-100, -262], [30, -266], [150, -236], [250, -172], [320, -84], [342, 6], [312, 86], [240, 128], [150, 118], [80, 140], [20, 168], [-60, 178], [-170, 150], [-262, 128], [-318, 92]];
  const STEM = [[-64, 140], [8, 150], [-14, 300], [-36, 430], [-110, 430], [-104, 300], [-98, 180]];
  const GYRI = [
    [[-280, -60], [-230, -120], [-170, -90], [-140, -170], [-80, -200]],
    [[-40, -220], [0, -170], [60, -210], [110, -150], [170, -190]],
    [[200, -120], [240, -60], [200, -20], [270, 20], [250, 80]],
    [[-260, 40], [-200, 0], [-150, 60], [-100, 10], [-40, 70]],
    [[-120, -120], [-60, -90], [-20, -130], [40, -80], [100, -100], [150, -40]],
    [[0, 100], [60, 60], [120, 90], [180, 40], [220, 90]],
  ];
  SH.lh_brain = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 151, u = W / 1080;
      const root = el(svg, 'g');
      const desk = inkEl(root, mix(INK.stain, INK.paperDark, 0.35)), grain = inkEl(root, mix(INK.stain, INK.ink, 0.15)), ring = inkEl(root, mix(INK.stain, INK.ink, 0.3));
      const shadowP = inkEl(root, INK.ink, { 'fill-opacity': 0.12 });
      const pageG = el(root, 'g');
      const page = inkEl(pageG, INK.paperLight), pageR = inkEl(pageG), rules = inkEl(pageG, mix(INK.blue, INK.paperLight, 0.55)), margin = inkEl(pageG, mix(INK.red, INK.paperLight, 0.4)), holes = inkEl(pageG, mix(INK.stain, INK.paperDark, 0.4));
      const cereb = inkEl(pageG, mix(INK.paperDark, INK.paperLight, 0.45)), cbl = inkEl(pageG, mix(INK.paperDark, INK.stain, 0.25)), stem = inkEl(pageG, mix(INK.paperDark, INK.stain, 0.15));
      const lines = inkEl(pageG), gyri = inkEl(pageG, INK.inkSoft);
      const redW = inkEl(pageG, INK.red, { 'fill-opacity': 0.25 }), redC = inkEl(pageG, INK.red);
      const goldW = inkEl(pageG, INK.gold, { 'fill-opacity': 0.3 }), goldC = inkEl(pageG, INK.gold), goldPath = inkEl(pageG, INK.gold);
      const arrowR = inkEl(pageG, INK.red), arrowG = inkEl(pageG, INK.gold);
      const mkLab = (text, col) => { const g = el(pageG, 'g'); const h = L.txt(g, { 'font-family': INK_FONT, 'font-size': 96 * u, fill: 'none', stroke: INK.paperLight, 'stroke-width': 14, 'stroke-linejoin': 'round' }); const tx = L.txt(g, { 'font-family': INK_FONT, 'font-size': 96 * u, fill: col }); h.textContent = tx.textContent = text; return g; };
      const labR = mkLab(P.red_label || 'PES ET', INK.red), labG = mkLab(P.gold_label || 'UMUT', mix(INK.gold, INK.ink, 0.25));
      if (P.gold_sub) { const h = L.txt(labG, { y: 78 * u, 'font-family': INK_FONT, 'font-size': 72 * u, fill: 'none', stroke: INK.paperLight, 'stroke-width': 12, 'stroke-linejoin': 'round' }); const tx = L.txt(labG, { y: 78 * u, 'font-family': INK_FONT, 'font-size': 72 * u, fill: mix(INK.gold, INK.ink, 0.25) }); h.textContent = tx.textContent = P.gold_sub; }
      const pencil = inkEl(root, INK.gold), pencilT = inkEl(root, INK.paperDark), pencilR = inkEl(root), lead = inkEl(root), eraser = inkEl(root, INK.red);
      const specs = inkEl(root), crumbs = inkEl(root, INK.paperLight);
      const cx = (P.cx ?? 0.5) * W, cy = (P.cy ?? 0.34) * H, S = (P.s ?? 1.2) * u;
      const B = q => [cx + q[0] * S, cy + q[1] * S];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const rc = L.atOr(cues, 'red', dur * 0.3), gc = L.atOr(cues, 'gold', dur * 0.7);
          desk.setAttribute('d', `M-40 -40 H${W + 40} V${H + 40} H-40 Z`);
          const GR = []; for (let i = 0; i < 26; i++) { const y = i * H / 26 + 20; GR.push(inkPath([[-20, y], [W * 0.3, y + 8 * Math.sin(i)], [W * 0.7, y - 6 * Math.cos(i * 1.3)], [W + 20, y + 4]], { w: 2, seed: k + i, t, amp: 1 })); }
          grain.setAttribute('d', GR.join(' '));
          ring.setAttribute('d', inkCircle(0.82 * W, 0.86 * H, 120 * u, k + 30, t, { w: 5 }) + ' ' + inkCircle(0.82 * W, 0.86 * H, 104 * u, k + 31, t, { w: 2.5 }));
          // the page (slightly rotated, breathing a little)
          const rot = -2 + Math.sin(t * 0.7) * 0.4;
          pageG.setAttribute('transform', `rotate(${L.f1(rot)} ${L.f1(W / 2)} ${L.f1(0.38 * H)})`);
          const pg = L.rect(0.06 * W, 0.135 * H, 0.94 * W, 0.62 * H);
          shadowP.setAttribute('d', inkLoop(pg.map(q => [q[0] + 16 * u, q[1] + 20 * u]), { seed: k + 40, t, smooth: false }));
          page.setAttribute('d', inkLoop(pg, { seed: k + 41, t, smooth: false, amp: 0.8 }));
          pageR.setAttribute('d', inkPath(pg, { w: 5, seed: k + 42, t, closed: true, smooth: false }));
          const RL = []; for (let i = 0; i < 24; i++) { const y = 0.17 * H + i * 40 * u; RL.push(inkPath([[0.06 * W + 6, y], [0.94 * W - 6, y]], { w: 2, seed: k + 50 + i, t, amp: 0.4 })); }
          rules.setAttribute('d', RL.join(' '));
          margin.setAttribute('d', inkPath([[0.16 * W, 0.135 * H + 4], [0.16 * W, 0.62 * H - 4]], { w: 3, seed: k + 80, t }));
          holes.setAttribute('d', [0, 1, 2, 3, 4].map(i => inkCircle(0.1 * W, lerp(0.18, 0.58, i / 4) * H, 14 * u, k + 81 + i, t, { fill: true })).join(' '));
          // the brain
          const bp = BRAIN.map(B), sp = STEM.map(B);
          stem.setAttribute('d', inkLoop(sp, { seed: k + 90, t, amp: 1 }));
          const cb = inkEllipsePts(B([-200, 196])[0], B([-200, 196])[1], 124 * S, 76 * S, k + 91, 14, -0.15);
          cbl.setAttribute('d', inkLoop(cb, { seed: k + 91, t, amp: 1 }));
          cereb.setAttribute('d', inkLoop(bp, { seed: k + 92, t, amp: 1 }));
          const LN = [inkPath(bp, { w: 7, seed: k + 93, t, closed: true, amp: 1 }), inkPath(sp, { w: 6, seed: k + 94, t, closed: true, amp: 1 }), inkPath(cb, { w: 6, seed: k + 95, t, closed: true, amp: 1 })];
          for (let i = 0; i < 4; i++) LN.push(inkPath([B([-300 + i * 10, 170 + i * 26]), B([-200, 150 + i * 28]), B([-100 + i * 6, 180 + i * 24])], { w: 3, seed: k + 96 + i, t }));
          LN.push(inkPath([B([-170, 30]), B([-40, -40]), B([100, -20]), B([170, 30])], { w: 5, seed: k + 101, t }));
          lines.setAttribute('d', LN.join(' '));
          gyri.setAttribute('d', GYRI.map((g, i) => inkPath(g.map(B), { w: 3.5, seed: k + 110 + i, t, amp: 1 })).join(' '));
          // red: the brain stem's default "give up" signal
          const raphe = B([-56, 232]), pf = B([262, -62]);
          const rOn = clamp01((lt - rc) / 0.3), gOn = clamp01((lt - gc) / 0.9), rK = rOn * (1 - 0.85 * gOn);
          const pulse = 1 + 0.18 * Math.sin(t * 8);
          redW.setAttribute('fill-opacity', (0.3 * rK).toFixed(3));
          redW.setAttribute('d', rK > 0.02 ? inkCircle(raphe[0], raphe[1], 90 * S * pulse * (0.6 + 0.4 * rOn), k + 120, t, { fill: true }) : '');
          redC.setAttribute('fill-opacity', Math.max(0.15, rK).toFixed(3));
          redC.setAttribute('d', rOn > 0 ? inkCircle(raphe[0], raphe[1], 26 * S * (1 + 0.6 * punch(lt, rc, 0.7)), k + 121, t, { fill: true }) : '');
          // gold: the front of the brain learns control and calms it
          goldW.setAttribute('fill-opacity', (0.34 * gOn).toFixed(3));
          goldW.setAttribute('d', gOn > 0 ? inkCircle(pf[0], pf[1], 130 * S * (0.5 + 0.5 * gOn) * (1 + 0.06 * Math.sin(t * 5)), k + 130, t, { fill: true }) : '');
          goldC.setAttribute('d', gOn > 0 ? inkCircle(pf[0], pf[1], 32 * S * (1 + 0.5 * punch(lt, gc, 0.7)), k + 131, t, { fill: true }) : '');
          const GP = [], path = [pf, B([150, 30]), B([20, 110]), [raphe[0] + 20 * S, raphe[1] - 30 * S]];
          const gq = clamp01((lt - gc - 0.2) / 0.8);
          for (let i = 0; i < 14; i++) {
            const q = i / 14; if (q > gq) break;
            const seg = Math.min(2, Math.floor(q * 3)), f = q * 3 - seg, a = path[seg], b = path[seg + 1];
            const m = ((t * 0.8 + i / 14) % 1) * 0.3;
            GP.push(inkDot(lerp(a[0], b[0], f), lerp(a[1], b[1], f), (9 + 5 * Math.sin(t * 6 + i) + m) * S, (9 + m) * S, k + 140 + i, t));
          }
          goldPath.setAttribute('d', GP.join(' '));
          // labels + arrows
          const lr = spring(lt, rc + 0.1, 0.5), lg = spring(lt, gc + 0.2, 0.5);
          const lrp = [0.24 * W, 0.565 * H], lgp = [0.76 * W, 0.215 * H];
          labR.setAttribute('transform', lt < rc + 0.1 ? 'scale(0)' : `translate(${L.f1(lrp[0])} ${L.f1(lrp[1])}) rotate(-4) scale(${lr.toFixed(3)})`);
          labG.setAttribute('transform', lt < gc + 0.2 ? 'scale(0)' : `translate(${L.f1(lgp[0])} ${L.f1(lgp[1])}) rotate(-3) scale(${(lg * (1 + 0.12 * punch(lt, gc + 0.2, 0.7))).toFixed(3)})`);
          const arr = (a, b, q, sk) => { if (q <= 0.05) return ''; const e = [lerp(a[0], b[0], q), lerp(a[1], b[1], q)], ang = Math.atan2(b[1] - a[1], b[0] - a[0]); return inkPath([a, [(a[0] + e[0]) / 2 + 20, (a[1] + e[1]) / 2 - 30], e], { w: 6, seed: sk, t }) + (q > 0.9 ? ' ' + inkPath([[e[0] - Math.cos(ang - 0.5) * 30, e[1] - Math.sin(ang - 0.5) * 30], e, [e[0] - Math.cos(ang + 0.5) * 30, e[1] - Math.sin(ang + 0.5) * 30]], { w: 6, seed: sk + 1, t, smooth: false }) : ''); };
          arrowR.setAttribute('fill-opacity', Math.max(0.3, rK).toFixed(2));
          arrowR.setAttribute('d', arr([lrp[0] + 120 * u, lrp[1] - 70 * u], [raphe[0] - 34 * S, raphe[1] + 20 * S], clamp01((lt - rc - 0.2) / 0.4), k + 150));
          arrowG.setAttribute('d', arr([lgp[0] - 60 * u, lgp[1] + 20 * u], [pf[0] - 30 * S, pf[1] - 30 * S], clamp01((lt - gc - 0.3) / 0.4), k + 152));
          // desk props: pencil (rolls a little), folded glasses, eraser crumbs
          const roll = Math.sin(t * 0.9) * 10 * u;
          const pa = [0.12 * W + roll, 0.71 * H], pb = [0.56 * W + roll, 0.8 * H];
          pencil.setAttribute('d', inkPath([pa, pb], { w: 30 * u, seed: k + 160, t, taper: 0 }));
          const dv = [pb[0] - pa[0], pb[1] - pa[1]], dl = Math.hypot(dv[0], dv[1]), nd = [dv[0] / dl, dv[1] / dl];
          const tipB = [pb[0] + nd[0] * 60 * u, pb[1] + nd[1] * 60 * u];
          pencilT.setAttribute('d', inkLoop([[pb[0] - nd[1] * 15 * u, pb[1] + nd[0] * 15 * u], tipB, [pb[0] + nd[1] * 15 * u, pb[1] - nd[0] * 15 * u]], { seed: k + 161, t, smooth: false }));
          lead.setAttribute('d', inkDot(tipB[0] - nd[0] * 8 * u, tipB[1] - nd[1] * 8 * u, 8 * u, 8 * u, k + 162, t));
          eraser.setAttribute('d', inkPath([[pa[0] - nd[0] * 40 * u, pa[1] - nd[1] * 40 * u], pa], { w: 30 * u, seed: k + 163, t, taper: 0 }));
          pencilR.setAttribute('d', inkPath([[pa[0] - nd[0] * 40 * u, pa[1] - nd[1] * 40 * u], tipB], { w: 4, seed: k + 164, t }) + ' ' + inkPath([[pa[0] - nd[1] * 15 * u, pa[1] + nd[0] * 15 * u], [pb[0] - nd[1] * 15 * u, pb[1] + nd[0] * 15 * u]], { w: 3.5, seed: k + 165, t }) + ' ' + inkPath([[pa[0] + nd[1] * 15 * u, pa[1] - nd[0] * 15 * u], [pb[0] + nd[1] * 15 * u, pb[1] - nd[0] * 15 * u]], { w: 3.5, seed: k + 166, t }));
          const gx = 0.7 * W, gyy = 0.74 * H;
          specs.setAttribute('d', inkCircle(gx, gyy, 56 * u, k + 170, t, { w: 7 }) + ' ' + inkCircle(gx + 140 * u, gyy + 10 * u, 56 * u, k + 171, t, { w: 7 }) + ' ' +
            inkPath([[gx + 52 * u, gyy - 8 * u], [gx + 70 * u, gyy - 22 * u], [gx + 88 * u, gyy - 4 * u]], { w: 6, seed: k + 172, t }) + ' ' +
            inkPath([[gx - 54 * u, gyy - 6 * u], [gx - 30 * u, gyy + 90 * u], [gx + 120 * u, gyy + 96 * u]], { w: 5, seed: k + 173, t }));
          crumbs.setAttribute('d', [0, 1, 2, 3, 4, 5].map(i => inkDot(0.32 * W + i * 28 * u + Math.sin(i * 2) * 20 * u, 0.67 * H + (i % 3) * 18 * u, 8 * u, 5 * u, k + 180 + i, t)).join(' '));
        },
      };
    },
  };
})();
