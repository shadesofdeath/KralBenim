// neu_scope: lab read-outs of a detector (Stickstory neutrino video, 2026-10-27; parametric). Modes:
//   fingerprint: a 1950s oscilloscope (dark round-cornered screen, knobs, grid) sweeping a trace; every sweep shows the
//                same two blips a fixed gap apart; on `print` a big red-ink fingerprint is stamped beside it and the gap
//                gets a bracket
//   tally:       a log-book page under a wall clock whose hand turns hour after hour; tally marks (groups of five)
//                add up as the clock turns
// SHOTS.neu_scope P: {mode, print: {at}, rate: 3 (tally marks per clock turn), turn: 1.4 (s per clock turn), labels, kasif}
// cues: print.at, label names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 607;
      const mode = P.mode || 'fingerprint';
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          if (mode === 'fingerprint') {
            const x0 = W * 0.12, x1 = W * 0.6, y0 = H * 0.24, y1 = H * 0.84;
            N.bench(back, W * 0.02, W * 0.98, y1, H * 1.05, sd + 700, t);
            N.shape(back, N.rect(x0, y0, x1, y1), INK.paperDark, sd + 1, t, { w: 7 });
            const s0 = x0 + 50, s1 = x1 - 50, sy0 = y0 + 50, sy1 = y1 - 150;
            N.shape(back, [[s0 + 30, sy0], [s1 - 30, sy0], [s1, sy0 + 30], [s1, sy1 - 30], [s1 - 30, sy1], [s0 + 30, sy1], [s0, sy1 - 30], [s0, sy0 + 30]], INK.ink, sd + 2, t, { w: 5, op: 0.88 });
            for (let k = 1; k < 8; k++) N.line(back, [[lerp(s0, s1, k / 8), sy0 + 12], [lerp(s0, s1, k / 8), sy1 - 12]], sd + 3 + k, t, 1.6, INK.inkSoft);
            for (let k = 1; k < 5; k++) N.line(back, [[s0 + 12, lerp(sy0, sy1, k / 5)], [s1 - 12, lerp(sy0, sy1, k / 5)]], sd + 13 + k, t, 1.6, INK.inkSoft);
            for (let k = 0; k < 4; k++) {
              const kx = x0 + 110 + k * 150, ky = y1 - 75;
              N.shape(back, N.ell(kx, ky, 34, 34, 12), INK.paperLight, sd + 20 + k, t, { w: 5, smooth: true });
              const a = t * 0.3 + k * 1.3; N.line(back, [[kx, ky], [kx + Math.cos(a) * 26, ky + Math.sin(a) * 26]], sd + 25 + k, t, 4);
            }
            // trace: sweeps every 1.6 s, two blips at fixed positions
            const per = 1.6, ph = (t % per) / per, base = (sy0 + sy1) / 2 + 60, b1 = 0.32, b2 = 0.62;
            const pts = [];
            for (let j = 0; j <= 120 * ph; j++) {
              const u = j / 120, y = base - 190 * (Math.exp(-Math.pow((u - b1) / 0.018, 2)) + 0.85 * Math.exp(-Math.pow((u - b2) / 0.018, 2))) + Math.sin(j * 2.1 + t * 9) * 3;
              pts.push([lerp(s0 + 20, s1 - 20, u), y]);
            }
            if (pts.length > 1) N.line(mid, pts, sd + 30, t, 6, INK.gold, { amp: 0.4 });
            const pa = atOr(cues, P.print && P.print.at, dur * 0.5), pp = lt >= pa ? spring(lt, pa, 0.5) : 0;
            if (pp > 0.01) {
              const bx0 = lerp(s0 + 20, s1 - 20, b1), bx1 = lerp(s0 + 20, s1 - 20, b2), by = base - 250;
              N.line(front, [[bx0, by + 30], [bx0, by], [bx1, by], [bx1, by + 30]], sd + 40, t, 6, INK.red);
              // fingerprint: nested loops, stamped in red
              const fx = W * 0.78, fy = H * 0.48, sc = lerp(1.5, 1, clamp01(pp));
              for (let k = 0; k < 9; k++) {
                const rx = (30 + k * 22) * sc, ry = (44 + k * 27) * sc, gap = 0.25 + (k % 3) * 0.12, arc = [];
                for (let j = 0; j <= 20; j++) { const a = -Math.PI / 2 + gap + j / 20 * (Math.PI * 2 - gap * 2); arc.push([fx + Math.cos(a) * rx + Math.sin(k + j) * 2, fy + Math.sin(a) * ry * (a > 0 ? 0.92 : 1)]); }
                front.fill(inkPath(arc, { w: 7, seed: sd + 50 + k, t, smooth: true, amp: 0.8 }), INK.red, clamp01(pp * 2));
              }
            }
          } else {   // tally
            // a cramped control trailer at night: window, wall clock, the log book propped on a desk, a coffee mug
            const cx = W * 0.27, cy = H * 0.3, R = 110, turn = P.turn ?? 1.4, rate = P.rate ?? 3;
            N.bench(back, W * 0.02, W * 0.98, H * 0.8, H * 1.05, sd + 700, t);
            N.shape(back, N.rect(W * 0.03, H * 0.56, W * 0.27, H * 0.8 - 4), null, sd + 710, t, { w: 0 });
            const mx = W * 0.3, my = H * 0.8;
            N.shape(back, N.rect(mx - 50, my - 110, mx + 50, my), INK.paperLight, sd + 712, t, { w: 6 });
            back.fill(inkPath([[mx + 50, my - 90], [mx + 90, my - 80], [mx + 90, my - 30], [mx + 50, my - 24]], { w: 6, seed: sd + 714, t, smooth: true }), INK.ink);
            for (let k = 0; k < 2; k++) { const ph = (t * 0.4 + k * 0.5) % 1; N.line(back, [[mx - 20 + k * 30, my - 120 - ph * 90], [mx - 10 + k * 30 + Math.sin(ph * 9) * 10, my - 160 - ph * 90]], sd + 716 + k, t, 4, INK.inkSoft, { op: 1 - ph, smooth: true }); }
            N.shape(back, N.ell(cx, cy, R, R, 18), INK.paperLight, sd + 1, t, { w: 7, smooth: true });
            for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; N.line(back, [[cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8], [cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92]], sd + 2 + k, t, 5); }
            const ah = -Math.PI / 2 + (t / turn) * Math.PI * 2 / 12, am = -Math.PI / 2 + (t / turn) * Math.PI * 2;
            N.line(mid, [[cx, cy], [cx + Math.cos(ah) * R * 0.5, cy + Math.sin(ah) * R * 0.5]], sd + 20, t, 10);
            N.line(mid, [[cx, cy], [cx + Math.cos(am) * R * 0.78, cy + Math.sin(am) * R * 0.78]], sd + 21, t, 6, INK.red);
            // log book
            const x0 = W * 0.38, x1 = W * 0.92, y0 = H * 0.16, y1 = H * 0.8;
            N.shape(back, N.rect(x0 + 14, y0 + 14, x1 + 14, y1 + 14), INK.paperDark, sd + 30, t, { w: 0, op: 0.7 });
            N.shape(back, N.rect(x0, y0, x1, y1), INK.paperLight, sd + 31, t, { w: 5 });
            for (let k = 0; k < 7; k++) N.line(back, [[x0 + 30, y0 + 80 + k * 80], [x1 - 30, y0 + 80 + k * 80]], sd + 32 + k, t, 2, INK.blue, { op: 0.5 });
            N.line(back, [[x0 + 110, y0 + 20], [x0 + 110, y1 - 20]], sd + 45, t, 2.5, INK.red, { op: 0.6 });
            const marks = Math.floor(Math.max(0, lt - 0.3) / turn * rate);
            for (let m = 0; m < Math.min(marks, 45); m++) {
              const g = Math.floor(m / 5), j = m % 5, row = Math.floor(g / 6), col = g % 6;
              const gx = x0 + 160 + col * 120, gy = y0 + 90 + row * 150;
              if (j < 4) N.line(mid, [[gx + j * 22, gy], [gx + j * 22 + 4, gy + 110]], sd + 100 + m, t, 7);
              else N.line(mid, [[gx - 14, gy + 80], [gx + 90, gy + 24]], sd + 100 + m, t, 7, INK.red);
            }
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
