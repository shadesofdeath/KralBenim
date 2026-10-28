// cay_reactor: a nuclear plant at night after the 1986 accident (Chernobyl tea story), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). Documentary tone, no fireball: the long
// turbine hall and the tall reactor block with its striped ventilation stack; the reactor block's roof is broken open,
// a dull gold-red glow comes from inside and a column of smoke rises and leans with the wind (to the right). Lit
// windows in the hall. On `hit` the glow flares once and the smoke thickens. In front: a fence line and dark pine
// woods down to the frame bottom. Leaves the sky to the scene's "set" (night); ground ≈ 0.6 H.
// P: {gy: 0.66 (0..1 H), scale: 1.3 (plant size about its base), wind: 1 (smoke lean), glow: 1, label: {text, x, y, at, size, color}}
// cues: hit (flare), label.at. Needs cay__lib.js (CAY).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cay_reactor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CAY, sd = seed * 1000 + 503, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.66) * H;
      const bld = el(root, 'g'), Q0 = (fill, extra) => inkEl(root, fill, extra);
      const Q = (fill, extra) => inkEl(bld, fill, extra);
      const bs = P.scale ?? 1.3;
      const smokeBack = Array.from({ length: 9 }, () => Q(INK.inkSoft, { 'fill-opacity': 0.4 }));
      const stack = Q(INK.paperDark), stackBands = Q(INK.red), stackR = Q();
      const block = Q(mix(INK.inkSoft, INK.paperDark, 0.25)), blockR = Q(), blockLines = Q(INK.ink);
      const glow = Q(INK.gold, { 'fill-opacity': 0.85 }), glowRed = Q(INK.red, { 'fill-opacity': 0.8 }), breachR = Q();
      const hall = Q(mix(INK.inkSoft, INK.paperDark, 0.4)), hallR = Q(), wins = Q(INK.gold, { 'fill-opacity': 0.9 }), winsR = Q();
      const smoke = Array.from({ length: 12 }, () => ({ f: Q(INK.inkSoft, { 'fill-opacity': 0.5 }), r: Q(INK.ink, { 'fill-opacity': 0.5 }) }));
      const sparks = Q(INK.gold);
      const ground = Q0(mix(mix(INK.inkSoft, INK.green, 0.4), INK.paperDark, 0.35)), groundR = Q0();
      const fence = Q0(INK.ink);
      const trees = [0, 1].map(i => Q0(mix(mix(INK.green, INK.ink, i ? 0.45 : 0.2), INK.paperDark, i ? 0 : 0.3))), treesR = Q0();
      const lab = P.label ? C.label(root, P.label, W, H) : null;
      const r0 = rng(sd + 7), TR = Array.from({ length: 24 }, () => [r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const hitAt = C.atOr(cues, 'hit', dur * 0.5), fl = punch(lt, hitAt, 1.2), after = hitAt != null && lt > hitAt ? 1 : 0;
          const wind = (P.wind ?? 1);
          bld.setAttribute('transform', `translate(${C.f1(0.45 * W)} ${C.f1(gy)}) scale(${bs}) translate(${C.f1(-0.45 * W)} ${C.f1(-gy)})`);
          // geometry
          const bx0 = 0.2 * W, bx1 = 0.62 * W, btop = gy - 470 * u;                 // reactor block
          const brk = [[0.36 * W, btop], [0.4 * W, btop - 18 * u], [0.43 * W, btop + 40 * u], [0.47 * W, btop + 8 * u], [0.5 * W, btop + 62 * u], [0.54 * W, btop + 20 * u], [0.58 * W, btop + 50 * u], [0.62 * W, btop + 92 * u]];
          const sx = 0.72 * W, stop = 0.3 * H, sw0 = 40 * u, sw1 = 30 * u;           // stack
          // smoke column from the breach, leaning right
          const src = [0.49 * W, btop + 30 * u];
          const sm = (arr, back) => arr.forEach((p, i) => {
            const n = arr.length, uu = ((t * 0.16 + i / n) % 1), y = lerp(src[1], 0.07 * H, uu), x = src[0] + Math.pow(uu, 1.6) * 520 * u * wind + Math.sin(uu * 6 + i) * 30 * u;
            const rad = (50 + uu * 210) * u * (back ? 1.25 : 1) * (1 + 0.25 * fl + 0.12 * after), a = Math.min(1, uu * 6) * (1 - uu * 0.5);
            const pts = inkEllipsePts(x + (back ? 40 * u : 0), y, rad, rad * 0.8, k + i * 5 + (back ? 300 : 0), 12, 0, 0.12);
            if (back) { p.setAttribute('fill-opacity', (0.28 * a).toFixed(3)); p.setAttribute('d', inkLoop(pts, { seed: k + i * 5 + 300, t, amp: 3 })); }
            else {
              p.f.setAttribute('fill-opacity', (0.55 * a).toFixed(3)); p.f.setAttribute('d', inkLoop(pts, { seed: k + i * 5, t, amp: 3 }));
              p.r.setAttribute('fill-opacity', (0.6 * a).toFixed(3)); p.r.setAttribute('d', inkPath(pts.slice(5, 12), { w: 4, seed: k + i * 5 + 1, t, amp: 2 }));
            }
          });
          sm(smokeBack, true);
          // stack (behind the block)
          const sp = [[sx - sw0, gy - 300 * u], [sx + sw0, gy - 300 * u], [sx + sw1, stop], [sx - sw1, stop]];
          stack.setAttribute('d', inkLoop(sp, { seed: k + 1, t, smooth: false, amp: 1 }));
          const B = [];
          [0, 1, 2].forEach(i => { const y0 = stop + i * 74 * u, y1 = y0 + 36 * u; const w0 = lerp(sw1, sw0, (y0 - stop) / (gy - 300 * u - stop)), w1 = lerp(sw1, sw0, (y1 - stop) / (gy - 300 * u - stop)); B.push(inkLoop([[sx - w0, y0], [sx + w0, y0], [sx + w1, y1], [sx - w1, y1]], { seed: k + 2 + i, t, smooth: false, amp: 0.8 })); });
          stackBands.setAttribute('d', B.join(' '));
          stackR.setAttribute('d', inkPath(sp, { w: 5, seed: k + 6, t, closed: true, smooth: false }) + ' ' + inkPath([[sx - 60 * u, stop + 260 * u], [sx + 60 * u, stop + 260 * u]], { w: 4, seed: k + 7, t }) + ' ' + inkPath([[sx - 60 * u, stop + 180 * u], [sx + 60 * u, stop + 180 * u]], { w: 4, seed: k + 8, t }));
          // reactor block with a broken roof
          const bp = [[bx0, gy], [bx0, btop], ...brk, [bx1, gy]];
          block.setAttribute('d', inkLoop(bp, { seed: k + 10, t, smooth: false, amp: 1 }));
          blockR.setAttribute('d', inkPath(bp, { w: 5.5, seed: k + 11, t, closed: true, smooth: false }));
          const BL = [];
          for (let i = 1; i < 6; i++) BL.push(inkPath([[bx0 + i * (bx1 - bx0) / 6, btop + 110 * u], [bx0 + i * (bx1 - bx0) / 6, gy - 10]], { w: 2.4, seed: k + 12 + i, t }));
          BL.push(inkPath([[bx0, btop + 90 * u], [bx1, btop + 90 * u]], { w: 3, seed: k + 19, t }));
          blockLines.setAttribute('d', BL.join(' '));
          // glow inside the breach
          const gk = (P.glow ?? 1) * (0.75 + 0.15 * Math.sin(t * 5.3) + 0.1 * Math.sin(t * 8.1) + 0.6 * fl);
          const gp = [[0.36 * W, btop + 4 * u], ...brk.slice(1, 7).map(p => [p[0], p[1] + 6 * u]), [0.58 * W, btop + 110 * u], [0.4 * W, btop + 100 * u]];
          glow.setAttribute('fill-opacity', Math.min(1, 0.6 + 0.3 * gk).toFixed(3));
          glow.setAttribute('d', inkLoop(gp, { seed: k + 20, t, amp: 2 }));
          const gr = gp.map(p => [lerp(p[0], 0.49 * W, 0.35), lerp(p[1], btop + 60 * u, 0.35) - 14 * u * gk]);
          glowRed.setAttribute('d', inkLoop(gr, { seed: k + 21, t, amp: 2.5 }));
          breachR.setAttribute('d', inkPath(brk, { w: 6, seed: k + 22, t, smooth: false }));
          sm(smoke, false);
          // sparks / debris rising slowly
          const S = [];
          for (let i = 0; i < 10; i++) { const uu = ((t * 0.3 + i / 10) % 1); const x = 0.42 * W + (i % 5) * 26 * u + uu * 120 * u * wind, y = lerp(btop + 20 * u, btop - 380 * u, uu); if (uu < 0.85) S.push(inkDot(x, y, 4 * u + 2, 4 * u + 2, k + 40 + i, t)); }
          sparks.setAttribute('d', S.join(' '));
          // turbine hall (long, low, lit windows)
          const hx0 = -30, hx1 = W + 30, htop = gy - 170 * u;
          const hp = [[hx0, gy + 10], [hx0, htop + 30 * u], [0.2 * W, htop + 30 * u], [0.2 * W, htop], [hx1, htop], [hx1, gy + 10]];
          hall.setAttribute('d', inkLoop(hp, { seed: k + 30, t, smooth: false }));
          hallR.setAttribute('d', inkPath(hp, { w: 5, seed: k + 31, t, closed: true, smooth: false }));
          const Wn = [], WnR = [];
          for (let i = 0; i < 9; i++) {
            const x = 0.05 * W + i * 0.105 * W, y = htop + 60 * u, on = (i * 7 + Math.floor(t * 1.5 + i)) % 5 !== 0 ? 1 : 0;
            const r = [[x, y], [x + 50 * u, y], [x + 50 * u, y + 46 * u], [x, y + 46 * u]];
            if (on) Wn.push(inkLoop(r, { seed: k + 50 + i, t, smooth: false, amp: 0.6 }));
            WnR.push(inkPath(r, { w: 3, seed: k + 60 + i, t, closed: true, smooth: false }));
          }
          wins.setAttribute('d', Wn.join(' ')); winsR.setAttribute('d', WnR.join(' '));
          // ground + fence + pine woods to the bottom
          const gtop = gy + 10;
          ground.setAttribute('d', `M-20 ${C.f1(gtop)} H${W + 20} V${H + 20} H-20 Z`);
          groundR.setAttribute('d', inkPath([[-20, gtop], [W + 20, gtop + 4]], { w: 6, seed: k + 70, t }));
          const F = [];
          for (let i = 0; i <= 12; i++) { const x = i / 12 * W; F.push(inkPath([[x, gtop + 120 * u], [x + 4, gtop + 20 * u]], { w: 6, seed: k + 80 + i, t })); }
          for (let j = 0; j < 3; j++) F.push(inkPath([[-20, gtop + 34 * u + j * 28 * u], [W + 20, gtop + 40 * u + j * 28 * u]], { w: 2.5, seed: k + 95 + j, t, amp: 1.5 }));
          fence.setAttribute('d', F.join(' '));
          const T2 = [[], []], TRr = [];
          TR.forEach((q, i) => {
            const row = i < 14 ? 0 : 1, x = (row ? (i - 14) / 9 : i / 13) * (W + 120) - 60 + q[0] * 30;
            const base = row ? H + 30 : gy + 0.2 * H + q[1] * 50, hgt = (row ? 380 : 230) * u * (0.8 + q[2] * 0.4), w = hgt * 0.36;
            const sway = Math.sin(t * 0.9 + i) * 4 * u;
            const pts = [[x - w, base]];
            for (let l = 0; l < 4; l++) { const yy = base - hgt * (l / 4 + 0.22), ww = w * (1 - l / 4.6); pts.push([x - ww + sway * l * 0.3, yy], [x - ww * 0.45 + sway * l * 0.3, yy - 10 * u]); }
            pts.push([x + sway, base - hgt * 1.05]);
            for (let l = 3; l >= 0; l--) { const yy = base - hgt * (l / 4 + 0.22), ww = w * (1 - l / 4.6); pts.push([x + ww * 0.45 + sway * l * 0.3, yy - 10 * u], [x + ww + sway * l * 0.3, yy]); }
            pts.push([x + w, base]);
            T2[row].push(inkLoop(pts, { seed: k + 100 + i, t, smooth: false, amp: 1.2 }));
            TRr.push(inkPath(pts, { w: 3.5, seed: k + 140 + i, t, closed: true, smooth: false, amp: 1.2 }));
          });
          trees[0].setAttribute('d', T2[0].join(' ')); trees[1].setAttribute('d', T2[1].join(' '));
          treesR.setAttribute('d', TRr.join(' '));
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
