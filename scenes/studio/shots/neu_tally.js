// neu_tally: comparisons drawn as lab objects (Stickstory neutrino video, 2026-10-27; parametric). Modes:
//   jars:  two tall glass jars; gold atoms drop into the left one up to the predicted level, the right one only fills to
//          a third; a red dashed line carries the predicted level across and a red brace marks the gap
//   scale: a big brass balance with a single neutrino on the left pan; on `tip` the beam dips a hair towards it, the
//          needle swings off zero and a red magnifier ring circles the needle (`unknown`: the needle keeps wobbling)
// SHOTS.neu_tally P: {mode, pred: {at}, found: {at}, level: 0.33, desk: true (jars stand on a desk under a lamp),
//   tip: {at}, unknown: false, labels, kasif}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_tally = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 907;
      const mode = P.mode || 'jars';
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      function jar(pen, x, y0, y1, w, t, k) {
        const pts = [[x - w / 2, y0], [x - w / 2, y1 - 30], [x - w / 2 + 30, y1], [x + w / 2 - 30, y1], [x + w / 2, y1 - 30], [x + w / 2, y0]];
        pen.fill(inkPath(pts, { w: 7, seed: sd + k, t, smooth: false }), INK.ink);
        N.shape(pen, N.rect(x - w / 2 - 20, y0 - 30, x + w / 2 + 20, y0), INK.paperDark, sd + k + 3, t, { w: 5 });
        N.line(pen, [[x - w / 2 + 24, y0 + 40], [x - w / 2 + 24, y1 - 60]], sd + k + 6, t, 5, INK.paperLight);
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          if (mode === 'jars') {
            const desk = P.desk !== false, y0 = desk ? H * 0.2 : H * 0.28, y1 = desk ? H * 0.74 : H * 0.9, w = 300, xs = [W * 0.32, W * 0.66], cap = 25;
            if (desk) {   // Bahcall's desk under a lamp: papers full of equations, the lamp's gold cone over the jars
              N.bench(back, W * 0.04, W * 0.96, y1, H * 1.02, sd + 600, t);
              N.shape(back, [[W * 0.84, y1 - 6], [W * 0.84, H * 0.2], [W * 0.6, H * 0.08]], null, sd + 610, t, { w: 9 });
              N.shape(back, [[W * 0.56, H * 0.06], [W * 0.66, H * 0.06], [W * 0.68, H * 0.14], [W * 0.54, H * 0.14]], INK.inkSoft, sd + 612, t, { w: 6 });
              back.fill(inkLoop([[W * 0.55, H * 0.14], [W * 0.67, H * 0.14], [W * 0.84, y1], [W * 0.18, y1]], { seed: sd + 614, t }), INK.gold, 0.16 + 0.03 * Math.sin(t * 2));
              for (let k = 0; k < 3; k++) {
                const px = W * (0.06 + k * 0.05), py = y1 - 10 - k * 6;
                N.shape(back, [[px, py], [px + 170, py - 8], [px + 176, py + 4], [px + 4, py + 10]], INK.paperLight, sd + 620 + k * 2, t, { w: 3 });
              }
            }
            const pa = atOr(cues, P.pred && P.pred.at, 0.3), fa = atOr(cues, P.found && P.found.at, dur * 0.5), lvl = P.level ?? 0.33;
            const fillN = [Math.floor(cap * clamp01((lt - pa) / 1.6)), Math.floor(cap * lvl * clamp01((lt - fa) / 1.2))];
            xs.forEach((x, j) => {
              for (let m = 0; m < fillN[j]; m++) {
                const row = Math.floor(m / 5), col = m % 5, ax = x - w / 2 + 40 + col * 55 + (row % 2) * 12, ay = y1 - 40 - row * 70;
                const age = (j ? lt - fa : lt - pa) - m * (j ? 1.2 / (cap * lvl) : 1.6 / cap), drop = clamp01(age / 0.3);
                const yy = lerp(y0 - 40, ay, EASE(drop));
                mid.fill(inkDot(ax, yy, 22, 22, sd + 100 + j * 50 + m, t), INK.gold);
                mid.fill(inkPath(N.ell(ax, yy, 22, 22, 9), { w: 3.5, seed: sd + 200 + j * 50 + m, t, closed: true }), INK.ink);
              }
              jar(back, x, y0, y1, w, t, 10 + j * 10);
            });
            if (lt > fa + 1.4) {
              const ly = y1 - 40 - (cap / 5 - 1) * 70 - 30, p = prog(lt, fa + 1.4, 0.8);
              for (let k = 0; k < 14; k++) { const u0 = k / 14; if (u0 > p) break; N.line(front, [[lerp(xs[0] - w / 2, xs[1] + w / 2, u0), ly], [lerp(xs[0] - w / 2, xs[1] + w / 2, Math.min(p, u0 + 0.04)), ly]], sd + 300 + k, t, 6, INK.red); }
              if (p > 0.9) {
                const bx = xs[1] + w / 2 + 50, yTop = ly, yBot = y1 - 40 - (Math.ceil(cap * lvl / 5) - 1) * 70 - 30;
                N.line(front, [[bx - 20, yTop], [bx, yTop + 20], [bx, (yTop + yBot) / 2 - 20], [bx + 24, (yTop + yBot) / 2], [bx, (yTop + yBot) / 2 + 20], [bx, yBot - 20], [bx - 20, yBot]], sd + 330, t, 7, INK.red, { smooth: true });
              }
            }
          } else {   // scale
            const cx = W * 0.5, py = H * 0.36, ta = atOr(cues, P.tip && P.tip.at, dur * 0.5);
            let tilt = lt >= ta ? 2.2 * progIO(lt, ta, 1.2) : 0;
            if (P.unknown) tilt = 1.5 + Math.sin(t * 2.4) * 1.8;
            tilt += Math.sin(t * 1.5) * 0.25;
            const a = tilt * Math.PI / 180, L = 520;
            N.shape(back, [[cx - 140, H * 0.88], [cx + 140, H * 0.88], [cx + 60, H * 0.8], [cx - 60, H * 0.8]], INK.paperDark, sd + 1, t, { w: 6 });
            N.line(back, [[cx, H * 0.8], [cx, py]], sd + 2, t, 12);
            const lx = cx - Math.cos(a) * L, ly = py + Math.sin(a) * L, rx = cx + Math.cos(a) * L, ry = py - Math.sin(a) * L;
            N.line(mid, [[lx, ly], [rx, ry]], sd + 3, t, 12);
            N.shape(mid, N.ell(cx, py, 26, 26, 10), INK.gold, sd + 4, t, { w: 5, smooth: true });
            for (const [x, y, k] of [[lx, ly, 0], [rx, ry, 1]]) {
              const pyy = y + 230;
              N.line(mid, [[x, y], [x - 120, pyy]], sd + 10 + k * 3, t, 3.5);
              N.line(mid, [[x, y], [x + 120, pyy]], sd + 11 + k * 3, t, 3.5);
              const pan = []; for (let j = 0; j <= 12; j++) { const b = j / 12 * Math.PI; pan.push([x + Math.cos(b) * 140, pyy + Math.sin(b) * 44]); }
              N.shape(mid, pan, INK.gold, sd + 20 + k * 2, t, { w: 6, op: 0.6, smooth: true });
              if (k === 0) N.nu(front, x, pyy - 22, 18, sd + 30, t, { tail: 0, glow: 0.6 + 0.4 * Math.sin(t * 4) });
            }
            // needle + dial
            const dx = cx, dy = H * 0.66, nr = 120;
            const dial = []; for (let j = 0; j <= 14; j++) { const b = Math.PI + j / 14 * Math.PI; dial.push([dx + Math.cos(b) * nr, dy + Math.sin(b) * nr]); }
            N.shape(back, dial.concat([[dx + nr, dy], [dx - nr, dy]]), INK.paperLight, sd + 40, t, { w: 5 });
            N.line(back, [[dx, dy - nr], [dx, dy - nr + 26]], sd + 41, t, 5, INK.green);
            const na = -Math.PI / 2 - tilt * 0.18;
            N.line(front, [[dx, dy], [dx + Math.cos(na) * nr * 0.9, dy + Math.sin(na) * nr * 0.9]], sd + 42, t, 6, INK.red);
            if (lt >= ta || P.unknown) {
              const s = P.unknown ? 1 : spring(lt, ta + 0.6, 0.5);
              if (s > 0.01) front.fill(inkPath(N.ell(dx, dy - nr * 0.55, 150 * s, 110 * s, 16), { w: 9, seed: sd + 50, t, closed: true, smooth: true }), INK.red);
            }
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
