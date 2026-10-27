// neu_sun: the Sun cut open (Stickstory neutrino video, 2026-10-27; parametric for any "inside the Sun" story).
// A huge hand-drawn Sun with a wedge cut out: gold core where hydrogen pairs collide in small flashes, a pale
// radiative zone where a red light ray staggers in a random zig-zag, a convective rim of rolling loops, flame tongues
// on the surface. From the core, neutrinos fly out in straight lines through every layer and off the frame.
// SHOTS.neu_sun P: {x: 0.36, y: 0.52, r: 0.46 (frame heights), fuse: {at} (collisions start), stream: {at} (neutrinos),
//   photon: true, labels, kasif}   cues: fuse.at, stream.at, label names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_sun = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 701;
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const cx = (P.x ?? 0.36) * W, cy = (P.y ?? 0.52) * H, R = (P.r ?? 0.38) * H;
      const W0 = -0.75, W1 = 0.45;    // the cut wedge (radians, 0 = right)
      const rays = N.rain(16, sd + 3), pairs = N.rain(8, sd + 4);
      const inWedge = a => a > W0 && a < W1;
      const arc = (r, a0, a1, n = 30) => { const o = []; for (let j = 0; j <= n; j++) { const a = lerp(a0, a1, j / n); o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          // flames around the surface
          for (let k = 0; k < 22; k++) {
            const a = k / 22 * Math.PI * 2 + 0.1; if (inWedge(a) || inWedge(a - Math.PI * 2)) continue;
            const L = R * (0.1 + 0.05 * Math.sin(t * 3 + k * 1.7)), w = 0.07;
            const pts = [[cx + Math.cos(a - w) * R, cy + Math.sin(a - w) * R], [cx + Math.cos(a) * (R + L), cy + Math.sin(a) * (R + L)], [cx + Math.cos(a + w) * R, cy + Math.sin(a + w) * R]];
            N.shape(back, pts, k % 2 ? INK.gold : INK.red, sd + 10 + k, t, { w: 3.5, op: 0.8 });
          }
          // body with the wedge cut out (outer disc = convective zone)
          const body = [[cx, cy]].concat(arc(R, W1, W0 + Math.PI * 2, 40));
          N.shape(back, body, INK.gold, sd + 40, t, { w: 7, op: 0.45 });
          for (let k = 0; k < 14; k++) {   // surface hatching
            const a = W1 + 0.15 + k * 0.33; if (a > W0 + Math.PI * 2 - 0.1) break;
            N.line(back, [[cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9], [cx + Math.cos(a + 0.1) * R * 0.97, cy + Math.sin(a + 0.1) * R * 0.97]], sd + 50 + k, t, 3, INK.red, { op: 0.6 });
          }
          // the cut: three layers visible in the wedge
          const conv = [[cx, cy]].concat(arc(R, W0, W1));
          N.shape(mid, conv, INK.paperDark, sd + 70, t, { w: 6 });
          const rad = [[cx, cy]].concat(arc(R * 0.7, W0, W1));
          N.shape(mid, rad, INK.paperLight, sd + 72, t, { w: 5 });
          const core = [[cx, cy]].concat(arc(R * 0.26, W0, W1, 14));
          N.shape(mid, core, INK.gold, sd + 74, t, { w: 5, op: 0.85 });
          for (let k = 0; k < 5; k++) {   // convection loops
            const a = lerp(W0 + 0.12, W1 - 0.12, k / 4), r = R * 0.85, lx = cx + Math.cos(a) * r, ly = cy + Math.sin(a) * r, rr = R * 0.1, sp = t * 1.2 + k;
            const loop = []; for (let j = 0; j <= 14; j++) { const b = sp + j / 14 * Math.PI * 1.7; loop.push([lx + Math.cos(b) * rr, ly + Math.sin(b) * rr]); }
            N.line(mid, loop, sd + 80 + k, t, 3.5, INK.red, { smooth: true });
          }
          if (P.photon !== false) {   // random walk of a light ray in the radiative zone
            const r0 = rng(sd + 90), pts = [[cx + R * 0.3 * Math.cos(-0.15), cy + R * 0.3 * Math.sin(-0.15)]];
            const steps = 6 + Math.floor((t * 4) % 18);
            for (let j = 0; j < steps; j++) {
              const p = pts[pts.length - 1], a = lerp(W0, W1, r0()), d = R * 0.08;
              let nx = p[0] + Math.cos(a * 4 + j) * d, ny = p[1] + Math.sin(a * 4 + j) * d;
              const rr = Math.hypot(nx - cx, ny - cy), aa = Math.atan2(ny - cy, nx - cx);
              if (rr > R * 0.66 || rr < R * 0.3 || !inWedge(aa)) { nx = p[0] - (nx - p[0]); ny = p[1] - (ny - p[1]); }
              pts.push([nx, ny]);
            }
            N.line(mid, pts, sd + 92, t, 4, INK.red, { amp: 0.5 });
          }
          // fusion in the core
          const fa = atOr(cues, P.fuse && P.fuse.at, 0.2);
          if (lt >= fa) pairs.forEach((q, i) => {
            const per = 1.4, ph = ((lt - fa) / per + q.u) % 1, a = lerp(W0 + 0.15, W1 - 0.15, q.v), r = R * (0.08 + 0.12 * q.k);
            const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r, d = 34 * (1 - clamp01(ph / 0.5));
            if (ph < 0.5) { mid.fill(inkDot(px - d, py, 9, 9, sd + 100 + i, t), INK.red); mid.fill(inkDot(px + d, py, 9, 9, sd + 110 + i, t), INK.red); }
            else N.flash(front, px, py, 60, sd + 120 + i, t, (ph - 0.5) * 2);
          });
          // neutrinos straight out
          const sa = atOr(cues, P.stream && P.stream.at, 0.6);
          if (lt >= sa) rays.forEach((q, i) => {
            const a = lerp(-0.9, 0.7, q.v), u = N.rainPos(q, t, 0.3), d = R * 0.1 + u * W * 0.9;
            const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
            if (x > W + 30 || y < -30 || y > H + 30) return;
            N.nu(front, x, y, 11, sd + 200 + i * 9, t, { dir: [Math.cos(a), Math.sin(a)], tail: 110 });
          });
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
