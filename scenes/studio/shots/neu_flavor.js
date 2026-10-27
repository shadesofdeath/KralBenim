// neu_flavor: neutrino oscillation as a picture (Stickstory neutrino video, 2026-10-27; parametric). The Sun on the
// left, a detector tank on the right, a long dashed path between them. Neutrinos fly along it and keep changing flavour
// on the way: blue ball (electron) -> red triangle (muon) -> gold diamond (tau) and round again, while a three-colour
// wave is drawn underneath. At the tank only blue ones flash ("caught"); red and gold ones fly straight through.
// A legend of the three shapes sits above the path.
// SHOTS.neu_flavor P: {go: {at} (first neutrino leaves), legend: true, catch: true, labels, kasif}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_flavor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, TD = window.TD, atOr = N.atOr, sd = seed * 1000 + 1103;
      const root = el(svg, 'g');
      const back = N.mkPen(root), sun = TD.sun(el(root, 'g'), sd + 1), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      function token(pen, x, y, s, f, k, t) {
        const col = N.FLAV()[f];
        let pts;
        if (f === 0) pts = N.ell(x, y, s, s, 12);
        else if (f === 1) pts = [[x, y - s * 1.25], [x + s * 1.15, y + s * 0.8], [x - s * 1.15, y + s * 0.8]];
        else pts = [[x, y - s * 1.3], [x + s, y], [x, y + s * 1.3], [x - s, y]];
        N.shape(pen, pts, col, sd + k, t, { w: Math.max(3, s * 0.22), smooth: f === 0 });
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          const sx = W * 0.1, py = H * 0.46, tx = W * 0.86;
          sun.update(t, sx, py, 120);
          for (let k = 0; k < 30; k++) { const u0 = k / 30; N.line(back, [[lerp(sx + 170, tx - 150, u0), py], [lerp(sx + 170, tx - 150, u0 + 0.016), py]], sd + 10 + k, t, 4, INK.inkSoft); }
          // tank
          N.shape(back, N.rect(tx - 110, py - 120, tx + 110, py + 120), INK.paperLight, sd + 50, t, { w: 7 });
          N.shape(back, N.rect(tx - 86, py - 96, tx + 86, py + 96), INK.blue, sd + 52, t, { w: 3, op: 0.3 });
          // wave chart underneath
          const wy = H * 0.76, x0 = sx + 170, x1 = tx - 150;
          for (let f = 0; f < 3; f++) {
            const pts = [];
            for (let j = 0; j <= 60; j++) { const u = j / 60, ph = u * 3 * Math.PI * 2 - f * 2.09; pts.push([lerp(x0, x1, u), wy - 60 * Math.max(0, Math.cos(ph)) ]); }
            N.line(back, pts, sd + 60 + f, t, 5, N.FLAV()[f], { smooth: true, amp: 0.5 });
          }
          N.line(back, [[x0 - 10, wy + 4], [x1 + 10, wy + 4]], sd + 66, t, 3, INK.inkSoft);
          if (P.legend !== false) for (let f = 0; f < 3; f++) token(mid, W * (0.36 + f * 0.14), H * 0.22, 32, f, 70 + f * 3, t);
          // travelling neutrinos
          const ga = atOr(cues, P.go && P.go.at, 0.2), per = 1.1, fly = 2.6;
          if (lt >= ga) for (let k = 0; k < 8; k++) {
            const t0 = ga + k * per, a = lt - t0; if (a < 0) break;
            const u = a / fly, startF = 0, fx = u * 3 + (k % 3) * 0.37;
            const f = (Math.floor(fx) + startF) % 3;
            if (u <= 1) {
              const x = lerp(x0, x1 + 140, u), y = py + Math.sin(u * 20 + k) * 4;
              const pop = 1 + 0.25 * Math.max(0, 1 - (fx % 1) * 6);
              token(front, x, y, 30 * pop, f, 100 + k * 7, t);
            } else {
              const arrivedF = (Math.floor((1) * 3 + (k % 3) * 0.37) + startF) % 3, b = (u - 1) * fly;
              if (P.catch !== false && arrivedF === 0) { N.flash(front, tx, py, 170, sd + 200 + k, t, b / 1.0); }
              else if (b < 1.4) token(front, lerp(tx, W + 120, b / 1.4), py, 30, arrivedF, 100 + k * 7, t);
            }
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
