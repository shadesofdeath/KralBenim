// neu_stream: streams of neutrinos passing straight through things (Stickstory neutrino video, 2026-10-27; parametric
// for any "invisible particles pass through you" story). Modes:
//   field: a stream crosses the frame and runs through an empty detector box without a single flash; one particle
//          can be singled out with a magnifier ring
//   body:  a big contour human (not a stick figure) with a diagonal rain of neutrinos passing through the body
//   hand:  a giant fingertip, a 1 cm square drawn on the nail, a dense rain falling through it
//   sun:   the Sun (left) sends rows of neutrinos to the Earth (right); on `fade` two of every three turn into dashed
//          ghosts and vanish halfway, a red "?" pops where they disappear
//   rock:  close on a mile of rock strata: red cosmic rays rain down and die in bursts in the top layers, blue
//          neutrinos run straight through every layer (P.rays: {at})
//   sun reveal: {at}: the vanished ghosts come back as red triangles / gold diamonds (they changed flavour)
//   earth: a big Earth with a detector on top; neutrinos from the sky above arrive whole, the ones that cross the whole
//          planet from below fade out on the way (the longer the trip, the more go missing)
// SHOTS.neu_stream P: {mode, n: 40, speed: 0.22, hl: {at, label?} (field: magnifier on one particle),
//   box: {x: 0.5, y: 0.5, w: 380, h: 300} (field), person: {x: 0.5, h: 0.78} (body), fade: {at} (sun/earth),
//   kasif_through: true (field: the stream passes through the narrator too), labels: [TD.label], kasif: K}
// cues: hl.at, fade.at, label / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_stream = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const N = window.NEU, TD = window.TD, atOr = N.atOr, sd = seed * 1000 + 211;
      const mode = P.mode || 'field';
      const root = el(svg, 'g');
      const back = N.mkPen(root);
      const sunD = mode === 'sun' || mode === 'hand' ? TD.sun(el(root, 'g'), sd + 1) : null;
      const earthD = mode === 'sun' || mode === 'earth' ? TD.earth(el(root, 'g'), defs, sd + 2) : null;
      const mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const over = N.mkPen(root);   // in front of the narrator: the stream runs through him
      const n = P.n ?? (mode === 'hand' ? 70 : mode === 'body' ? 46 : 40);
      const parts = N.rain(n, sd + 7);
      const speed = P.speed ?? 0.22;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front, over].forEach(p => p.begin());
          const fa = P.fade ? atOr(cues, P.fade.at, null) : null, fp = fa != null && lt >= fa ? prog(lt, fa, 0.9) : 0;
          const ra = P.reveal ? atOr(cues, P.reveal.at, null) : null, rp = ra != null && lt >= ra ? spring(lt, ra, 0.6) : 0;
          if (mode === 'field') {
            const B = Object.assign({ x: 0.5, y: 0.5, w: 380, h: 300 }, P.box || {}), bx = B.x * W, by = B.y * H;
            if (P.box !== false) {
            N.shape(back, N.rect(bx - B.w / 2, by - B.h / 2, bx + B.w / 2, by + B.h / 2), INK.paperLight, sd + 10, t, { w: 7, op: 0.85 });
            N.shape(back, N.rect(bx - B.w / 2 + 22, by - B.h / 2 + 22, bx + B.w / 2 - 22, by + B.h / 2 - 22), INK.blue, sd + 12, t, { w: 3, op: 0.25 });
            for (let k = 0; k < 5; k++) {   // dark sensors along the top + bottom: they never light up
              back.fill(inkDot(bx - B.w / 2 + 50 + k * (B.w - 100) / 4, by - B.h / 2 + 4, 14, 14, sd + 20 + k, t), INK.inkSoft);
              back.fill(inkDot(bx - B.w / 2 + 50 + k * (B.w - 100) / 4, by + B.h / 2 - 4, 14, 14, sd + 30 + k, t), INK.inkSoft);
            }
            }
            parts.forEach((q, i) => {
              const x = N.rainPos(q, t, speed) * (W + 300) - 150, y = H * (0.2 + 0.62 * q.v) + Math.sin(t * 1.3 + i) * 6;
              N.nu(i % 3 === 0 ? over : mid, x, y, 10 + q.k * 4, sd + 100 + i * 9, t, { dir: [1, 0], tail: 110 });
            });
            if (P.hl) {
              const a = atOr(cues, P.hl.at, 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0;
              if (p > 0.01) {
                const x = lerp(W * 0.3, W * 0.72, clamp01((lt - a) / Math.max(2, dur - a))), y = H * 0.34;
                N.nu(front, x, y, 22, sd + 60, t, { dir: [1, 0], tail: 160, glow: 1 });
                const R = 70 * p;
                front.fill(inkPath(N.ell(x, y, R, R, 14), { w: 8, seed: sd + 61, t, closed: true, smooth: true }), INK.red);
                N.line(front, [[x + R * 0.7, y + R * 0.7], [x + R * 1.6, y + R * 1.6]], sd + 62, t, 14, INK.red);
              }
            }
          } else if (mode === 'body' || mode === 'hand') {
            if (mode === 'body') {
              const Pp = Object.assign({ x: 0.5, h: 0.78 }, P.person || {});
              N.human(back, Pp.x * W, H * 0.9, Pp.h * H, sd + 10, t, { op: 0.9 });
            } else {
              if (sunD) sunD.update(t, W * 0.08, H * 0.1, 110);
              const cx = W * 0.56, fw = 300, tip = H * 0.2;
              const finger = [];
              for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; finger.push([cx + Math.cos(a) * fw / 2, tip + fw / 2 + Math.sin(a) * fw / 2]); }
              finger.push([cx + fw / 2 + 8, H * 0.85], [cx + fw / 2 + 30, H + 60], [cx - fw / 2 - 30, H + 60], [cx - fw / 2 - 8, H * 0.85]);
              N.shape(back, finger, INK.paperLight, sd + 10, t, { w: 7, smooth: true, amp: 1.2 });
              const nail = [[cx - 95, tip + 120], [cx - 100, tip + 45], [cx - 60, tip + 20], [cx + 60, tip + 20], [cx + 100, tip + 45], [cx + 95, tip + 120], [cx + 70, tip + 330], [cx - 70, tip + 330]];
              N.shape(back, nail, INK.paper, sd + 12, t, { w: 5, smooth: true });
              for (let k = 0; k < 3; k++) N.line(back, [[cx - 90, H * 0.8 + k * 22], [cx + 90, H * 0.8 + k * 22 + 6]], sd + 14 + k, t, 3.5, INK.inkSoft, { smooth: true });
              const sq = 110, sy = tip + 175, sa = P.square ? atOr(cues, P.square.at, 0.3) : 0.3, sp = lt >= sa ? prog(lt, sa, 0.6) : 0;
              if (sp > 0.01) {
                const s2 = sq * (0.4 + 0.6 * sp) * (1 + 0.1 * punch(lt, sa, 0.6));
                front.fill(inkPath(N.rect(cx - s2 / 2, sy - s2 / 2, cx + s2 / 2, sy + s2 / 2), { w: 9, seed: sd + 18, t, closed: true, smooth: false }), INK.red);
              }
            }
            const ang = mode === 'hand' ? 0.85 : 0.5, dx = Math.cos(ang), dy = Math.sin(ang);
            parts.forEach((q, i) => {
              const u = N.rainPos(q, t, speed), L = Math.hypot(W, H) * 1.1;
              const sx = (q.v * 1.6 - 0.6) * W, x = sx + dx * u * L, y = -100 + dy * u * L;
              if (x < -50 || x > W + 50 || y < -50 || y > H + 50) return;
              N.nu(i % 2 ? front : mid, x, y, mode === 'hand' ? 8 + q.k * 3 : 12 + q.k * 5, sd + 100 + i * 9, t, { dir: [dx, dy], tail: mode === 'hand' ? 70 : 100 });
            });
          } else if (mode === 'sun') {
            const sx = W * 0.1, sy = H * 0.5, ex = W * 0.86, ey = H * 0.5;
            if (sunD) sunD.update(t, sx, sy, 170);
            if (earthD) earthD.update(t, ex, ey, 150);
            const rows = 9;
            for (let i = 0; i < rows * 3; i++) {
              const q = parts[i % parts.length], row = i % rows, lane = Math.floor(i / rows);
              const u = ((q.u + t * 0.16 + lane * 0.33) % 1), x = lerp(sx + 230, ex - 170, u), y = sy + (row - (rows - 1) / 2) * 50 + Math.sin(u * 9 + row) * 6;
              const doomed = i % 3 !== 0;
              let ghost = false, vis = 1;
              if (doomed && fp > 0) { if (u > 0.45) { ghost = true; vis = 1 - clamp01((u - 0.45) / 0.15 * fp); } }
              if (doomed && rp > 0 && u > 0.45) {   // the answer: they were never gone, they changed flavour
                N.token(mid, x, y, 12 + 8 * rp, 1 + (i % 2), sd + 100 + i * 9, t);
                continue;
              }
              if (vis <= 0.02) continue;
              if (ghost) N.nu(mid, x, y, 11, sd + 100 + i * 9, t, { dir: [1, 0], tail: 0, ghost: true, col: INK.inkSoft });
              else N.nu(mid, x, y, 11, sd + 100 + i * 9, t, { dir: [1, 0], tail: 80 });
            }
            if (fp > 0 && rp < 0.5) for (let k = 0; k < 2; k++) {
              const qx = W * (0.55 + k * 0.1), qy = H * (0.22 + k * 0.56), s = spring(lt, fa + 0.4 + k * 0.3, 0.6);
              if (s > 0.01) front.fill(inkPath([[qx - 26 * s, qy - 40 * s], [qx - 10 * s, qy - 66 * s], [qx + 22 * s, qy - 60 * s], [qx + 28 * s, qy - 30 * s], [qx, qy - 6 * s], [qx, qy + 16 * s]], { w: 13, seed: sd + 70 + k, t, smooth: true }), INK.red), front.fill(inkDot(qx, qy + 44 * s, 9 * s, 9 * s, sd + 72 + k, t), INK.red);
            }
          } else if (mode === 'rock') {   // close on a mile of rock: cosmic rays die in the top layers, neutrinos go through
            const gy = H * (P.surface ?? 0.14);
            N.line(back, [[-20, gy], [W * 0.5, gy + 4], [W + 20, gy - 2]], sd + 1, t, 7);
            for (let k = 0; k < 7; k++) {
              const y = gy + 60 + k * (H - gy) / 7, y2 = y + (H - gy) / 7;
              back.fill(inkLoop([[-20, y], [W * 0.3, y + 12 * Math.sin(k)], [W * 0.7, y - 10], [W + 20, y + 6], [W + 20, y2], [-20, y2]], { seed: sd + 10 + k, t, smooth: false }), k % 2 ? INK.paperDark : INK.paper, 0.55);
              N.line(back, [[-20, y], [W * 0.3, y + 12 * Math.sin(k)], [W * 0.7, y - 10], [W + 20, y + 6]], sd + 20 + k, t, 4, INK.inkSoft, { smooth: true });
            }
            parts.slice(0, 16).forEach((q, i) => N.shape(back, N.ell(q.u * W, gy + 80 + q.v * (H - gy - 120), 16 + q.k * 26, 9 + q.k * 14, 7), INK.paperDark, sd + 40 + i * 3, t, { w: 3 }));
            const ra2 = atOr(cues, P.rays && P.rays.at, 0.3);
            if (lt >= ra2) {
              for (let i = 0; i < 9; i++) {
                const q = parts[20 + i], per = 1.3, ph = ((lt - ra2) / per + q.u) % 1, x = W * (0.08 + q.v * 0.84), stop = gy + 70 + q.k * 220;
                const y = lerp(-60, stop, clamp01(ph / 0.55)), zz = [];
                for (let j = 0; j < 5; j++) zz.push([x + (j % 2 ? 20 : -20), y - 200 + j * 50]);
                if (ph < 0.55) N.line(front, zz, sd + 300 + i, t, 8, INK.red, { taper: 0.2 });
                else N.flash(front, x, stop, 100, sd + 320 + i, t, (ph - 0.55) / 0.45);
              }
              for (let i = 0; i < 12; i++) {
                const q = parts[30 + (i % 10)], u = ((q.u + i * 0.083) + t * 0.3) % 1, x = W * (0.1 + ((q.v + i * 0.37) % 1) * 0.8) + u * 140, y = lerp(-80, H + 80, u);
                N.nu(over, x, y, 14, sd + 400 + i * 9, t, { dir: [0.14, 1], tail: 110 });
              }
            }
          } else if (mode === 'earth') {
            const cx = W * 0.42, cy = H * 0.56, R = H * 0.27;
            if (earthD) earthD.update(t, cx, cy, R);
            const dx0 = cx, dy0 = cy - R - 40;
            N.shape(front, N.rect(dx0 - 70, dy0 - 60, dx0 + 70, dy0 + 40), INK.paperLight, sd + 40, t, { w: 6 });
            N.shape(front, N.rect(dx0 - 54, dy0 - 44, dx0 + 54, dy0 + 24), INK.blue, sd + 42, t, { w: 3, op: 0.4 });
            // from above: short path, arrive whole
            for (let i = 0; i < 6; i++) {
              const q = parts[i], u = (q.u + t * 0.3) % 1, x = dx0 + (q.v - 0.5) * 140, y = lerp(-60, dy0 - 70, u);
              N.nu(mid, x, y, 15, sd + 100 + i * 9, t, { dir: [0, 1], tail: 90 });
            }
            // from below: through the whole Earth
            for (let i = 0; i < 10; i++) {
              const q = parts[10 + i], u = (q.u + t * 0.12) % 1, x = dx0 + (q.v - 0.5) * 120, y = lerp(cy + R + 80, dy0 + 50, u);
              const lost = (i % 2 === 0) && fp > 0 && u > 0.35 ? clamp01((u - 0.35) / 0.2) * fp : 0;
              if (lost >= 0.98) continue;
              if (lost > 0) N.nu(mid, x, y, 15 * (1 - lost * 0.5), sd + 200 + i * 9, t, { dir: [0, -1], tail: 0, ghost: true, col: INK.red });
              else N.nu(mid, x, y, 15, sd + 200 + i * 9, t, { dir: [0, -1], tail: 90 });
            }
            N.line(back, [[dx0, cy + R + 60], [dx0, dy0 + 60]], sd + 50, t, 4, INK.inkSoft, { op: 0.6 });
          }
          [back, mid, front, over].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
