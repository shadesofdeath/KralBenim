// neu_detector: giant water-tank neutrino detectors in ink (Stickstory neutrino video, 2026-10-27; parametric). Modes:
//   superk: a huge cylinder cut open: the far wall tiled from floor to ceiling with round gold light sensors, water
//           hatching, a tiny rubber boat with two figures on the surface for scale; every few seconds a particle track
//           shoots up and a ring of sensors lights up gold/red on the wall (the Cherenkov ring)
//   sno:    a cavern with a geodesic steel sphere carrying light sensors on its nodes, a clear inner sphere of heavy
//           water with a neck to the top; neutrinos of all three flavours (blue, red, gold) fly in and every one of them
//           sets off a flash
// SHOTS.neu_detector P: {mode, ring: {at} (first ring / first catch), boat: true, labels, kasif}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_detector = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 1009;
      const mode = P.mode || 'superk';
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          const ra = atOr(cues, P.ring && P.ring.at, 0.6);
          if (mode === 'superk') {
            const x0 = W * 0.14, x1 = W * 0.86, yt = H * 0.22, yb = H * 0.88, ey = 64, cx = (x0 + x1) / 2;
            const rx = (x1 - x0) / 2;
            const top = N.ell(cx, yt, rx, ey, 30), bot = N.ell(cx, yb, rx, ey, 30);
            N.shape(back, N.rect(x0, yt, x1, yb), INK.blue, sd + 1, t, { w: 0, op: 0.22 });
            N.shape(back, bot, INK.blue, sd + 2, t, { w: 5, op: 0.3, smooth: true });
            // sensor grid on the far wall (columns squeeze towards the sides: curved wall)
            const cols = 17, rows = 8, per = 2.2;
            const c = Math.floor(Math.max(0, lt - ra) / per), ph = lt >= ra ? ((lt - ra) % per) / per : -1;
            const r0 = rng(sd + c * 7 + 3), rcx = lerp(0.3, 0.7, r0()), rcy = lerp(0.3, 0.7, r0()), rrad = lerp(0.18, 0.26, r0());
            for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
              const u = (i + 0.5) / cols, s = Math.sin((u - 0.5) * Math.PI), x = cx + s * rx * 0.94, y = lerp(yt + 50, yb - 40, (j + 0.5) / rows);
              const wid = 26 * Math.cos((u - 0.5) * Math.PI) + 6;
              const du = (u - rcx) / rrad, dv = ((j + 0.5) / rows - rcy) / (rrad * 1.6), d = Math.hypot(du, dv);
              const lit = ph >= 0 && ph < 0.9 && Math.abs(d - 1) < 0.3 ? 1 - 0.6 * ph / 0.9 : 0;
              mid.fill(inkLoop(N.ell(x, y, wid, 26, 9), { seed: sd + 10 + i * rows + j, t, amp: 0.5 }), lit ? (Math.abs(d - 1) < 0.12 ? INK.red : INK.gold) : INK.paperDark, lit ? 0.6 + 0.4 * lit : 0.9);
              mid.fill(inkPath(N.ell(x, y, wid, 26, 9), { w: 2.6, seed: sd + 500 + i * rows + j, t, closed: true, amp: 0.5 }), INK.ink);
            }
            if (ph >= 0 && ph < 0.35) {   // the track that makes the ring
              const tx = cx + Math.sin((rcx - 0.5) * Math.PI) * rx * 0.94, ty = lerp(yt + 50, yb - 40, rcy), u = ph / 0.35;
              N.line(front, [[cx, yb + 40], [lerp(cx, tx, u), lerp(yb + 40, ty, u)]], sd + 700, t, 7, INK.red);
            }
            N.line(back, [[x0, yt], [x0, yb]], sd + 3, t, 7);
            N.line(back, [[x1, yt], [x1, yb]], sd + 4, t, 7);
            front.fill(inkPath(top, { w: 6, seed: sd + 5, t, closed: true, smooth: true }), INK.ink);
            for (let k = 0; k < 6; k++) N.line(front, [[lerp(x0, x1, k / 6) + 30, yb + 10], [lerp(x0, x1, k / 6) + 90, yb + 6]], sd + 20 + k, t, 3, INK.paperLight);
            if (P.boat !== false) {   // tiny rubber boat for scale
              const bx = W * 0.3 + Math.sin(t * 0.5) * 30, by = yb - 6;
              N.shape(front, [[bx - 60, by - 14], [bx + 60, by - 14], [bx + 46, by + 12], [bx - 46, by + 12]], INK.red, sd + 40, t, { w: 4, op: 0.85 });
              for (let k = 0; k < 2; k++) { front.fill(inkDot(bx - 18 + k * 36, by - 46, 9, 9, sd + 42 + k, t), INK.ink); N.line(front, [[bx - 18 + k * 36, by - 38], [bx - 18 + k * 36, by - 14]], sd + 44 + k, t, 4); }
            }
          } else {   // sno
            const cx = W * 0.5, cy = H * 0.52, R = H * 0.38, r = R * 0.66;
            const cav = []; for (let j = 0; j < 18; j++) { const a = j / 18 * Math.PI * 2; cav.push([cx + Math.cos(a) * R * 1.45 * (1 + 0.05 * Math.sin(j * 2.3)), cy + Math.sin(a) * R * 1.2 * (1 + 0.05 * Math.cos(j * 1.7))]); }
            N.shape(back, cav, INK.paperDark, sd + 1, t, { w: 6, op: 0.6, smooth: true });
            // geodesic frame: latitude + longitude ellipses, sensors on crossings
            for (let k = 1; k < 6; k++) { const yy = cy - R + k * R / 3, w2 = Math.sqrt(Math.max(0, R * R - (yy - cy) * (yy - cy))); back.fill(inkPath(N.ell(cx, yy, w2, w2 * 0.18, 18), { w: 3, seed: sd + 10 + k, t, closed: true, smooth: true }), INK.inkSoft); }
            for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI + t * 0.05; back.fill(inkPath(N.ell(cx, cy, Math.abs(Math.cos(a)) * R + 4, R, 20), { w: 3, seed: sd + 20 + k, t, closed: true, smooth: true }), INK.inkSoft); }
            back.fill(inkPath(N.ell(cx, cy, R, R, 24), { w: 7, seed: sd + 30, t, closed: true, smooth: true }), INK.ink);
            const R1 = rng(sd + 31);
            for (let k = 0; k < 46; k++) { const a = R1() * Math.PI * 2, d = Math.sqrt(R1()) * R * 0.97; back.fill(inkDot(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 8, 8, sd + 40 + k, t), INK.gold); }
            N.shape(mid, N.rect(cx - 34, cy - R - 60, cx + 34, cy - r + 10), INK.paperLight, sd + 90, t, { w: 5 });
            N.shape(mid, N.ell(cx, cy, r, r, 22), INK.blue, sd + 92, t, { w: 6, op: 0.4, smooth: true });
            mid.fill(inkPath([[cx - r * 0.6, cy - r * 0.5], [cx - r * 0.3, cy - r * 0.78]], { w: 8, seed: sd + 94, t }), INK.paperLight);
            if (lt >= ra) {
              const per = 1.2, k = Math.floor((lt - ra) / per), ph = ((lt - ra) % per) / per, fl = N.FLAV()[k % 3];
              const r2 = rng(sd + 200 + k), ang = lerp(-0.6, 0.6, r2()), tx = cx + (r2() - 0.5) * r, ty = cy + (r2() - 0.5) * r;
              if (ph < 0.5) { const u = ph / 0.5; N.nu(front, lerp(-60, tx, u), lerp(ty + Math.sin(ang) * 400, ty, u), 16, sd + 210 + k, t, { col: fl, dir: [1, -Math.sin(ang) * 0.4], tail: 140 }); }
              else N.flash(front, tx, ty, 170, sd + 220 + k, t, (ph - 0.5) / 0.5);
            }
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
