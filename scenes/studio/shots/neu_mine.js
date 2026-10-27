// neu_mine: a deep-mine neutrino lab in cutaway (Stickstory neutrino video, 2026-10-27; parametric for any underground
// lab: Homestake, Kamioka, Sudbury). Modes:
//   wide:  the surface (headframe with its big wheel, a few mining-town houses) and, below, a mile of rock strata with a
//          shaft, a moving lift cage, a depth ruler on the left and the cavern with a long horizontal tank at the bottom
//          (bus: true draws a city-bus outline beside it for scale; newhall: true opens a second, bigger cavern holding a
//          gold detector box)
//   rays:  the same cutaway; red cosmic rays rain from the sky and die in the upper rock in small bursts, while blue
//          neutrinos run through every layer, the tank and beyond
//   purge: close-up of the tank: green chlorine dots drift in the liquid, a pipe at the bottom blows helium bubbles that
//          carry gold argon atoms up and out to a small trap jar where they collect
//   surface: at the mine head: a towering headframe with its turning wheel, the hoist house, a cage riding the rope,
//          the dark shaft mouth; on `arrow` a red arrow points down into the ground (P.ground, P.hx, P.arrow: {at})
//   dune:  a long slice of the Earth's curve: a ring accelerator near the left edge fires a beam of neutrinos along a
//          straight dashed chord through the rock to a headframe and deep cavern near the right edge
// SHOTS.neu_mine P: {mode, surface: 0.3 (ground line, 0..1 H), depth: 0.84 (cavern centre), bus: false, newhall: false,
//   lift: true, rays: {at}, fire: {at} (dune), hl: {at} (tank pulses red outline), labels, kasif}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_mine = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 809;
      const mode = P.mode || 'wide';
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const rocks = N.rain(40, sd + 3), parts = N.rain(24, sd + 4), bubbles = N.rain(18, sd + 5), atoms = N.rain(26, sd + 6);
      function headframe(pen, x, gy, s, t, k) {
        const h = 240 * s;
        N.line(pen, [[x - 70 * s, gy], [x - 10 * s, gy - h]], sd + k, t, 7);
        N.line(pen, [[x + 70 * s, gy], [x + 10 * s, gy - h]], sd + k + 1, t, 7);
        N.line(pen, [[x + 70 * s, gy], [x + 150 * s, gy - h * 0.55]], sd + k + 2, t, 6);
        for (let j = 1; j < 4; j++) { const y = gy - h * j / 4, w = lerp(70, 10, j / 4) * s; N.line(pen, [[x - w, y], [x + w, y]], sd + k + 3 + j, t, 4); }
        const wy = gy - h - 20 * s, a = t * 2;
        N.shape(pen, N.ell(x, wy, 46 * s, 46 * s, 14), INK.paperLight, sd + k + 8, t, { w: 6, smooth: true });
        for (let j = 0; j < 3; j++) N.line(pen, [[x + Math.cos(a + j * 2.09) * 40 * s, wy + Math.sin(a + j * 2.09) * 40 * s], [x - Math.cos(a + j * 2.09) * 40 * s, wy - Math.sin(a + j * 2.09) * 40 * s]], sd + k + 9 + j, t, 3.5);
      }
      function tank(pen, x, y, w, h, t, k, fill = INK.blue) {
        const pts = [];
        for (let j = 0; j <= 10; j++) { const a = -Math.PI / 2 + j / 10 * Math.PI; pts.push([x + w / 2 - h / 2 + Math.cos(a) * h / 2, y + Math.sin(a) * h / 2]); }
        for (let j = 0; j <= 10; j++) { const a = Math.PI / 2 + j / 10 * Math.PI; pts.push([x - w / 2 + h / 2 + Math.cos(a) * h / 2, y + Math.sin(a) * h / 2]); }
        N.shape(pen, pts, fill, sd + k, t, { w: 7, op: 0.45, smooth: true });
        for (let j = 1; j < 5; j++) N.line(pen, [[x - w / 2 + j * w / 5, y - h / 2 + 6], [x - w / 2 + j * w / 5, y + h / 2 - 6]], sd + k + 2 + j, t, 2.5, INK.inkSoft);
        return pts;
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          if (mode === 'wide' || mode === 'rays') {
            const gy = (P.surface ?? 0.3) * H, cyv = (P.depth ?? 0.84) * H, sx = W * 0.5;
            N.line(back, [[-20, gy], [W * 0.4, gy + 4], [W + 20, gy - 2]], sd + 1, t, 7);
            for (let k = 0; k < 5; k++) {
              const y = gy + (k + 1) * (H - gy) / 6;
              N.line(back, [[-20, y], [W * 0.3, y + 14 * Math.sin(k)], [W * 0.7, y - 10], [W + 20, y + 6]], sd + 2 + k, t, 3.5, INK.inkSoft, { smooth: true });
            }
            rocks.forEach((q, i) => {
              const x = q.u * W, y = gy + 40 + q.v * (H - gy - 30);
              if (Math.abs(x - sx) < 60 || (Math.abs(y - cyv) < 110 && Math.abs(x - sx - 120) < 420)) return;
              N.shape(back, N.ell(x, y, 12 + q.k * 20, 7 + q.k * 11, 7), INK.paperDark, sd + 20 + i * 3, t, { w: 3 });
            });
            // houses + headframe
            for (let k = 0; k < 4; k++) {
              const hx = W * (0.64 + k * 0.08), hw = 60 + (k % 2) * 20;
              N.shape(back, N.rect(hx - hw / 2, gy - 70, hx + hw / 2, gy), INK.paperLight, sd + 150 + k * 3, t, { w: 5 });
              N.shape(back, [[hx - hw / 2 - 10, gy - 70], [hx, gy - 110], [hx + hw / 2 + 10, gy - 70]], INK.paperDark, sd + 151 + k * 3, t, { w: 5 });
            }
            headframe(back, sx, gy, 1, t, 170);
            N.line(back, [[sx - 30, gy], [sx - 30, cyv + 80]], sd + 190, t, 5);
            N.line(back, [[sx + 30, gy], [sx + 30, cyv + 80]], sd + 191, t, 5);
            if (P.lift !== false) {
              const u = (Math.sin(t * 0.6) + 1) / 2, ly = lerp(gy + 40, cyv + 20, u);
              N.shape(mid, N.rect(sx - 22, ly - 30, sx + 22, ly + 30), INK.paperLight, sd + 192, t, { w: 4 });
              N.line(mid, [[sx, gy - 200], [sx, ly - 30]], sd + 193, t, 2.5);
            }
            // depth ruler
            const rx = W * 0.06;
            N.line(back, [[rx, gy], [rx, cyv]], sd + 200, t, 6, INK.red);
            for (let k = 0; k <= 8; k++) N.line(back, [[rx - (k % 4 ? 12 : 24), lerp(gy, cyv, k / 8)], [rx + (k % 4 ? 12 : 24), lerp(gy, cyv, k / 8)]], sd + 201 + k, t, 4, INK.red);
            // cavern + tank
            const cav = [];
            for (let j = 0; j < 16; j++) { const a = j / 16 * Math.PI * 2; cav.push([sx + 190 + Math.cos(a) * 340 * (1 + 0.05 * Math.sin(j * 3)), cyv + Math.sin(a) * 120 * (1 + 0.08 * Math.cos(j * 2))]); }
            N.shape(back, cav, INK.paper, sd + 210, t, { w: 6, smooth: true });
            const ha = P.hl ? atOr(cues, P.hl.at, null) : null, hp = ha != null && lt >= ha ? 1 : 0;
            const tp = tank(mid, sx + 190, cyv + 10, 420, 150, t, 220);
            if (hp) front.fill(inkPath(tp, { w: 10 + 4 * Math.sin(t * 6), seed: sd + 230, t, closed: true, smooth: true }), INK.red);
            if (P.bus) {   // a city bus outline for scale, standing on the cavern floor in front
              const bx = sx + 180, by = cyv + 108, bw = 345, bh = 86;
              N.shape(front, N.rect(bx - bw / 2, by - bh, bx + bw / 2, by - 14), INK.paperLight, sd + 240, t, { w: 4, op: 0.65, ink: INK.red });
              for (let k = 0; k < 6; k++) N.shape(front, N.rect(bx - bw / 2 + 20 + k * 54, by - bh + 12, bx - bw / 2 + 60 + k * 54, by - bh + 40), null, sd + 242 + k, t, { w: 3, ink: INK.red });
              front.fill(inkDot(bx - bw / 2 + 60, by - 12, 16, 16, sd + 250, t), INK.red); front.fill(inkDot(bx + bw / 2 - 60, by - 12, 16, 16, sd + 251, t), INK.red);
            }
            if (P.newhall) {   // a second, bigger cavern with a gold (argon) detector
              const nx = W * 0.82, ny = cyv - 30;
              N.shape(back, N.rect(nx - 170, ny - 140, nx + 170, ny + 140), INK.paper, sd + 260, t, { w: 6 });
              N.shape(mid, N.rect(nx - 130, ny - 100, nx + 130, ny + 130), INK.gold, sd + 262, t, { w: 6, op: 0.5 + 0.15 * Math.sin(t * 3) });
              N.line(back, [[sx + 30, cyv - 60], [nx - 170, ny - 60]], sd + 264, t, 5);
            }
            if (mode === 'rays') {
              const ra = atOr(cues, P.rays && P.rays.at, 0.3);
              if (lt >= ra) {
                for (let i = 0; i < 9; i++) {   // cosmic rays: stop in the upper rock
                  const q = parts[i], per = 1.3, ph = ((lt - ra) / per + q.u) % 1, x = W * (0.12 + q.v * 0.8), stop = gy + 60 + q.k * 140;
                  const y = lerp(-40, stop, clamp01(ph / 0.6)), zz = [];
                  for (let j = 0; j < 5; j++) zz.push([x + (j % 2 ? 16 : -16), y - 160 + j * 40]);
                  if (ph < 0.6) N.line(front, zz, sd + 300 + i, t, 6, INK.red, { taper: 0.2 });
                  else N.flash(front, x, stop, 70, sd + 320 + i, t, (ph - 0.6) / 0.4);
                }
                for (let i = 9; i < 20; i++) {   // neutrinos: straight through everything
                  const q = parts[i], u = N.rainPos(q, t, 0.32), x = W * (0.15 + q.v * 0.75) + u * 120, y = lerp(-60, H + 60, u);
                  N.nu(front, x, y, 10, sd + 400 + i * 9, t, { dir: [0.12, 1], tail: 90 });
                }
              }
            }
          } else if (mode === 'purge') {
            const cx = W * 0.44, cy = H * 0.52, w = W * 0.72, h = H * 0.6;
            const tp = tank(back, cx, cy, w, h, t, 10);
            void tp;
            atoms.forEach((q, i) => {   // chlorine
              const x = cx - w / 2 + 120 + q.u * (w - 240) + Math.sin(t * 0.8 + i) * 14, y = cy - h / 2 + 70 + q.v * (h - 140) + Math.cos(t * 0.7 + i) * 10;
              mid.fill(inkDot(x, y, 12, 12, sd + 30 + i, t), INK.green);
            });
            N.line(back, [[cx - w / 2 + 80, cy + h / 2 - 30], [cx + w / 2 - 80, cy + h / 2 - 30]], sd + 70, t, 9);
            N.line(back, [[cx + w / 2 - 160, cy - h / 2], [cx + w / 2 - 160, cy - h / 2 - 90], [W * 0.92, cy - h / 2 - 90], [W * 0.92, cy - 60]], sd + 72, t, 9);
            const jx = W * 0.92, jy = cy + 40;   // trap jar
            N.shape(back, [[jx - 70, jy - 100], [jx + 70, jy - 100], [jx + 80, jy + 120], [jx - 80, jy + 120]], INK.paperLight, sd + 74, t, { w: 6 });
            const ga = atOr(cues, P.bubble && P.bubble.at, 0.3);
            if (lt >= ga) {
              bubbles.forEach((q, i) => {
                const ph = ((lt - ga) * 0.35 + q.u) % 1, x = cx - w / 2 + 140 + q.v * (w - 280) + Math.sin(ph * 12 + i) * 10, y = lerp(cy + h / 2 - 40, cy - h / 2 + 30, ph);
                mid.fill(inkPath(N.ell(x, y, 16 + q.k * 10, 16 + q.k * 10, 10), { w: 3.5, seed: sd + 100 + i, t, closed: true, smooth: true }), INK.ink);
                if (i % 4 === 0) front.fill(inkDot(x, y, 10, 10, sd + 130 + i, t), INK.gold);
              });
              const got = Math.min(7, Math.floor((lt - ga) / 1.2));
              for (let k = 0; k < got; k++) { const ax = jx - 40 + (k % 3) * 40, ay = jy + 90 - Math.floor(k / 3) * 36; front.fill(inkDot(ax, ay, 13, 13, sd + 160 + k, t), INK.gold); front.fill(inkPath(N.ell(ax, ay, 13, 13, 8), { w: 3, seed: sd + 170 + k, t, closed: true }), INK.ink); }
            }
          } else if (mode === 'surface') {   // at the mine head: a towering headframe, the hoist house, the dark shaft mouth
            const gy = (P.ground ?? 0.8) * H, hx = W * (P.hx ?? 0.6);
            N.line(back, [[-20, gy], [W + 20, gy + 2]], sd + 1, t, 7);
            N.shape(back, N.rect(W * 0.78, gy - 300, W * 0.98, gy), INK.paperLight, sd + 2, t, { w: 6 });
            N.shape(back, [[W * 0.76, gy - 300], [W * 0.88, gy - 380], [W * 1.0, gy - 300]], INK.paperDark, sd + 3, t, { w: 6 });
            for (let k = 0; k < 2; k++) N.shape(back, N.rect(W * (0.81 + k * 0.08), gy - 220, W * (0.85 + k * 0.08), gy - 140), INK.gold, sd + 5 + k, t, { w: 4, op: 0.5 });
            N.line(back, [[hx + 20, gy - 600], [W * 0.82, gy - 300]], sd + 8, t, 3);
            headframe(mid, hx, gy, 2.4, t, 20);
            N.shape(mid, N.ell(hx, gy + 8, 110, 22, 14), INK.ink, sd + 40, t, { w: 4, op: 0.85, smooth: true });
            const u = (Math.sin(t * 0.7) + 1) / 2, cy2 = lerp(gy - 420, gy - 60, u);
            N.line(mid, [[hx, gy - 600], [hx, cy2 - 50]], sd + 42, t, 3);
            N.shape(mid, N.rect(hx - 40, cy2 - 50, hx + 40, cy2 + 30), INK.paperLight, sd + 44, t, { w: 5 });
            const aa = atOr(cues, P.arrow && P.arrow.at, null), ap = aa != null && lt >= aa ? prog(lt, aa, 0.8) : 0;
            if (ap > 0) { const ax = hx + 150, y2 = lerp(gy - 240, gy + 50, ap); N.line(front, [[ax, gy - 240], [ax, y2]], sd + 46, t, 9, INK.red); N.line(front, [[ax - 26, y2 - 30], [ax, y2], [ax + 26, y2 - 30]], sd + 47, t, 9, INK.red); }
          } else {   // dune
            const R = W * 2.2, ccx = W * 0.5, ccy = H * 0.26 + R;
            const surf = []; for (let j = 0; j <= 40; j++) { const x = lerp(-40, W + 40, j / 40); surf.push([x, ccy - Math.sqrt(R * R - (x - ccx) * (x - ccx))]); }
            N.line(back, surf, sd + 1, t, 7, INK.ink, { smooth: true });
            for (let k = 1; k < 5; k++) N.line(back, surf.map(([x, y]) => [x, y + k * 130 + Math.sin(x * 0.01 + k) * 10]), sd + 2 + k, t, 3, INK.inkSoft, { smooth: true });
            rocks.forEach((q, i) => { const x = q.u * W, y = H * 0.36 + q.v * H * 0.6; N.shape(back, N.ell(x, y, 10 + q.k * 16, 6 + q.k * 9, 7), INK.paperDark, sd + 20 + i * 3, t, { w: 3 }); });
            const yOn = x => ccy - Math.sqrt(R * R - (x - ccx) * (x - ccx));
            const ax = W * 0.12, ay = yOn(ax), bx = W * 0.86, by = yOn(bx);
            N.shape(mid, N.ell(ax, ay - 40, 110, 34, 16), null, sd + 200, t, { w: 7, smooth: true });
            N.shape(mid, N.rect(ax + 60, ay - 50, ax + 130, ay - 10), INK.paperLight, sd + 202, t, { w: 5 });
            headframe(mid, bx, by, 0.7, t, 210);
            const dy = by + 210;
            N.line(mid, [[bx, by], [bx, dy]], sd + 230, t, 5);
            N.shape(mid, N.rect(bx - 90, dy - 50, bx + 90, dy + 60), INK.gold, sd + 232, t, { w: 6, op: 0.55 });
            const fa = atOr(cues, P.fire && P.fire.at, 0.3), fp = lt >= fa ? progIO(lt, fa, 1.6) : 0;
            const A = [ax + 130, ay - 20], B = [bx - 90, dy];   // a neutrino beam is a straight chord through the curved Earth
            const bez = u => [lerp(A[0], B[0], u), lerp(A[1], B[1], u)];
            for (let k = 0; k < 30; k++) { const u0 = k / 30; if (u0 > fp) break; N.line(back, [bez(u0), bez(Math.min(u0 + 0.018, fp))], sd + 240 + k, t, 5, INK.red); }
            if (fp > 0.05) for (let i = 0; i < 8; i++) {
              const u = ((t * 0.25 + i / 8) % 1) * fp, p = bez(u), p2 = bez(Math.min(1, u + 0.01));
              N.nu(front, p[0], p[1], 10, sd + 300 + i * 9, t, { dir: [p2[0] - p[0], p2[1] - p[1]], tail: 70 });
            }
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
