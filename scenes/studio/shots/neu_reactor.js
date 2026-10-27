// neu_reactor: the 1956 reactor neutrino experiment as ink cutaways (Stickstory neutrino video, 2026-10-27;
// parametric for any reactor-detector story). Modes:
//   site:     a big reactor building with a smoke stack, a cutaway window onto the glowing core with its rods; under
//             the ground a shielded room holds the detector stack; neutrinos stream from the core through the
//             walls and soil, and now and then the detector blinks
//   detector: a close-up of the detector sandwich: three tanks of glowing liquid, two water tanks between them, rows
//             of light sensors on both ends, lead bricks around; the liquid blinks when a neutrino is caught
//   hit:      inside the water: a neutrino hits a proton (red) -> a positron flash, a neutron (pale) zig-zags off and is
//             swallowed by a cadmium nucleus (grey) -> a second flash; a small trace below draws both blips
//   choice:   a half-dug hole with a shovel stuck in the dirt pile (left), a reactor on the horizon (right) that starts
//             to glow on `glow` and sends a stream of neutrinos across
// SHOTS.neu_reactor P: {mode, ground: 0.66, glow: {at} (choice), tank: true (hit: steel tank walls fill the frame), hit: {at}, second: {at} (hit mode, default hit + 1.6 s), blink: 2.2 (s between
//   detector blinks), labels, kasif}   cues: hit.at, second.at, label names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_reactor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 503;
      const mode = P.mode || 'site';
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const parts = N.rain(28, sd + 9);
      const blinkAt = (t, per, k) => { const c = Math.floor(t / per), ph = (t - c * per) / per; const r = rng(sd + c * 13 + k)(); return { ph, on: r > 0.35, r }; };
      function stack(pen, x0, y0, w, h, t, s0) {   // the detector sandwich, local box
        const layers = [['s', 0.22], ['w', 0.12], ['s', 0.22], ['w', 0.12], ['s', 0.22]];
        let y = y0, li = 0;
        const out = [];
        for (const [kind, f] of layers) {
          const hh = h * f, gap = h * 0.025;
          N.shape(pen, N.rect(x0, y, x0 + w, y + hh), kind === 's' ? INK.gold : INK.blue, s0 + li * 5, t, { w: 5, op: kind === 's' ? 0.32 : 0.4 });
          if (kind === 's') for (let k = 0; k < 2; k++) for (const side of [0, 1]) {
            const px = side ? x0 + w + 4 : x0 - 4, py = y + hh * (0.3 + k * 0.4), dir = side ? 1 : -1;
            N.shape(pen, [[px, py - hh * 0.14], [px + dir * 40, py - hh * 0.2], [px + dir * 40, py + hh * 0.2], [px, py + hh * 0.14]], INK.paperLight, s0 + 40 + li * 8 + k * 2 + side, t, { w: 3.5 });
            pen.fill(inkDot(px + dir * 48, py, 12, hh * 0.16, s0 + 60 + li * 8 + k * 2 + side, t), INK.inkSoft);
          }
          out.push({ kind, y0: y, y1: y + hh });
          y += hh + gap; li++;
        }
        return out;
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          if (mode === 'site') {
            const gy = (P.ground ?? 0.66) * H;
            N.line(back, [[-20, gy], [W * 0.5, gy + 2], [W + 20, gy]], sd + 1, t, 7);
            for (let k = 0; k < 3; k++) N.line(back, [[-20, gy + 90 + k * 90], [W + 20, gy + 100 + k * 90]], sd + 2 + k, t, 3, INK.inkSoft, { smooth: true });
            // building
            const b0 = W * 0.08, b1 = W * 0.48, bt = gy - 330;
            N.shape(back, N.rect(b0, bt, b1, gy), INK.paperLight, sd + 10, t, { w: 7 });
            N.shape(back, N.rect(b0 + 60, bt - 110, b0 + 330, bt), INK.paperDark, sd + 12, t, { w: 6 });
            N.shape(back, N.rect(b1 - 150, bt - 330, b1 - 90, bt), INK.paperLight, sd + 14, t, { w: 6 });
            for (let k = 0; k < 4; k++) { const ph = (t * 0.25 + k * 0.25) % 1; back.fill(inkLoop(N.ell(b1 - 120 + ph * 90, bt - 360 - ph * 160, 30 + ph * 40, 22 + ph * 26, 10), { seed: sd + 16 + k, t, amp: 2 }), INK.inkSoft, 0.35 * (1 - ph)); }
            for (let k = 0; k < 6; k++) N.line(back, [[b0 + 20 + k * 120, bt + 20], [b0 + 20 + k * 120, bt + 60]], sd + 20 + k, t, 3, INK.inkSoft);
            // cutaway core
            const cx = (b0 + b1) / 2, cy = gy - 140, cr = 110, gl = 0.7 + 0.3 * Math.sin(t * 4);
            N.shape(mid, N.ell(cx, cy, cr + 30, cr + 30, 16), INK.paperDark, sd + 30, t, { w: 6, smooth: true });
            N.shape(mid, N.ell(cx, cy, cr, cr, 16), INK.gold, sd + 32, t, { w: 5, smooth: true, op: 0.55 * gl + 0.2 });
            for (let k = 0; k < 7; k++) N.line(mid, [[cx - 90 + k * 30, cy - 80 + Math.abs(k - 3) * 10], [cx - 90 + k * 30, cy + 80 - Math.abs(k - 3) * 10]], sd + 34 + k, t, 6, INK.ink);
            // underground detector room
            const r0 = W * 0.56, r1 = W * 0.84, ry0 = gy + 70, ry1 = gy + 330;
            N.shape(back, N.rect(r0 - 40, ry0 - 40, r1 + 40, ry1 + 40), INK.paperDark, sd + 50, t, { w: 6 });
            N.shape(back, N.rect(r0, ry0, r1, ry1), INK.paper, sd + 52, t, { w: 5 });
            for (let k = 0; k < 10; k++) N.line(back, [[r0 - 36 + k * ((r1 - r0 + 72) / 10), ry0 - 36], [r0 - 16 + k * ((r1 - r0 + 72) / 10), ry0 - 6]], sd + 54 + k, t, 3, INK.inkSoft);
            const layers = stack(mid, r0 + 70, ry0 + 30, r1 - r0 - 140, ry1 - ry0 - 60, t, sd + 100);
            const bl = blinkAt(t, P.blink ?? 1.6, 1);
            if (bl.on) { const L = layers[1 + 2 * Math.floor(bl.r * 2)]; N.flash(front, r0 + 70 + (r1 - r0 - 140) * (0.2 + 0.6 * bl.r), (L.y0 + L.y1) / 2, 110, sd + 70 + Math.floor(t / 1.6), t, bl.ph * 1.6); }
            parts.forEach((q, i) => {
              const ang = lerp(-0.25, 0.75, q.v), u = N.rainPos(q, t, 0.35), d = 140 + u * W * 0.75;
              const x = cx + Math.cos(ang) * d, y = cy + Math.sin(ang) * d;
              if (x > W + 30 || y > H + 30) return;
              N.nu(front, x, y, 9, sd + 200 + i * 9, t, { dir: [Math.cos(ang), Math.sin(ang)], tail: 70 });
            });
          } else if (mode === 'detector') {
            const x0 = W * 0.27, y0 = H * 0.22, w = W * 0.46, h = H * 0.62;
            N.shape(back, N.rect(x0 - 110, y0 - 50, x0 + w + 110, y0 + h + 50), INK.paperDark, sd + 1, t, { w: 7 });
            for (let r = 0; r < 9; r++) for (let c = 0; c < 2; c++) {   // lead bricks on the sides
              const bx = c ? x0 + w + 20 : x0 - 100, by = y0 - 40 + r * (h + 80) / 9;
              N.shape(back, N.rect(bx, by, bx + 80, by + (h + 80) / 9 - 6), INK.inkSoft, sd + 10 + r * 2 + c, t, { w: 3, op: 0.35 });
            }
            const layers = stack(mid, x0, y0, w, h, t, sd + 100);
            const bl = blinkAt(t, P.blink ?? 1.3, 2);
            if (bl.on) {
              const L = layers[1 + 2 * Math.floor(bl.r * 2)], fx = x0 + w * (0.2 + 0.6 * bl.r), fy = (L.y0 + L.y1) / 2;
              N.flash(front, fx, fy, 150, sd + 60 + Math.floor(t / 1.3), t, bl.ph * 1.3);
              const g = clamp01(1 - bl.ph * 2);
              layers.forEach((S, k) => { if (S.kind === 's' && Math.abs(k - layers.indexOf(L)) === 1) N.shape(front, N.rect(x0 + 4, S.y0 + 4, x0 + w - 4, S.y1 - 4), INK.gold, sd + 80 + k, t, { w: 0, op: 0.45 * g }); });
            }
            parts.slice(0, 12).forEach((q, i) => {
              const u = N.rainPos(q, t, 0.3), x = lerp(-80, W + 80, u), y = y0 + q.v * h;
              N.nu(front, x, y, 9, sd + 200 + i * 9, t, { dir: [1, 0.1], tail: 80 });
            });
          } else if (mode === 'choice') {   // the abandoned dig in the desert, a reactor glowing on the horizon
            const gy = (P.ground ?? 0.74) * H, hx = W * 0.36;
            N.line(back, [[-20, gy], [W + 20, gy + 2]], sd + 1, t, 7);
            N.shape(back, [[hx - 150, gy], [hx - 120, gy + 150], [hx + 120, gy + 150], [hx + 150, gy]], INK.paper, sd + 2, t, { w: 6 });
            for (let k = 0; k < 6; k++) N.line(back, [[hx - 140 + k * 50, gy + 20], [hx - 120 + k * 50, gy + 130]], sd + 4 + k, t, 3, INK.inkSoft);
            N.shape(back, [[hx - 420, gy], [hx - 330, gy - 120], [hx - 250, gy - 140], [hx - 180, gy]], INK.paperDark, sd + 12, t, { w: 6, smooth: true });
            N.line(mid, [[hx + 60, gy + 40], [hx + 150, gy - 260]], sd + 14, t, 9);
            N.shape(mid, [[hx + 40, gy + 30], [hx + 80, gy + 44], [hx + 64, gy + 120], [hx + 24, gy + 100]], INK.inkSoft, sd + 15, t, { w: 5 });
            N.line(mid, [[hx + 130, gy - 260], [hx + 170, gy - 252]], sd + 16, t, 9);
            const rx = W * 0.82, ry = gy - 6, ga = atOr(cues, P.glow && P.glow.at, dur * 0.4), g = lt >= ga ? prog(lt, ga, 0.8) : 0;
            const halo = 0.25 + 0.75 * g, pulse = 1 + 0.08 * Math.sin(t * 4);
            back.fill(inkLoop(N.ell(rx, ry - 90, 260 * halo * pulse, 170 * halo * pulse, 16), { seed: sd + 20, t, amp: 3 }), INK.gold, 0.18 + 0.25 * g);
            N.shape(mid, N.rect(rx - 150, ry - 150, rx + 150, ry), INK.paperLight, sd + 22, t, { w: 6 });
            N.shape(mid, N.rect(rx + 70, ry - 330, rx + 110, ry - 150), INK.paperLight, sd + 24, t, { w: 5 });
            N.shape(mid, N.ell(rx - 40, ry - 80, 44, 44, 12), INK.gold, sd + 26, t, { w: 5, op: 0.4 + 0.5 * g, smooth: true });
            for (let k = 0; k < 3; k++) { const ph = (t * 0.25 + k / 3) % 1; mid.fill(inkLoop(N.ell(rx + 90 + ph * 70, ry - 360 - ph * 120, 22 + ph * 30, 16 + ph * 20, 10), { seed: sd + 30 + k, t, amp: 2 }), INK.inkSoft, 0.4 * (1 - ph)); }
            if (g > 0) parts.slice(0, 10).forEach((q, i) => {
              const u = N.rainPos(q, t, 0.25), x = lerp(rx - 160, W * 0.45, u), y = ry - 80 + (q.v - 0.5) * 220 * u;
              N.nu(front, x, y, 10, sd + 200 + i * 9, t, { dir: [-1, 0], tail: 70 });
            });
          } else {   // hit
            if (P.tank !== false) {   // inside the water tank: steel walls with rivets fill the frame
              const m = 40;
              back.fill(inkLoop(N.rect(m, m, W - m, H - m), { seed: sd + 900, t }), INK.blue, 0.16);
              back.fill(inkPath(N.rect(m, m, W - m, H - m), { w: 14, seed: sd + 902, t, closed: true, smooth: false }), INK.ink);
              for (let k = 0; k < 14; k++) { back.fill(inkDot(m + 30 + k * (W - 2 * m - 60) / 13, m + 26, 7, 7, sd + 904 + k, t), INK.inkSoft); back.fill(inkDot(m + 30 + k * (W - 2 * m - 60) / 13, H - m - 26, 7, 7, sd + 920 + k, t), INK.inkSoft); }
              for (let k = 0; k < 8; k++) { const ph = (t * 0.2 + k / 8) % 1; N.shape(mid, N.ell(W * (0.08 + k * 0.12), lerp(H - 80, 80, ph), 9 + (k % 3) * 4, 9 + (k % 3) * 4, 8), null, sd + 940 + k, t, { w: 3, ink: INK.blue }); }
            }
            const ha = atOr(cues, P.hit && P.hit.at, dur * 0.25), sa = atOr(cues, P.second && P.second.at, ha + 1.6);
            for (let k = 0; k < 6; k++) { const y = H * (0.12 + k * 0.1) + Math.sin(t * 1.2 + k) * 8; N.line(back, [[W * 0.05, y], [W * 0.3, y + 6], [W * 0.6, y - 4], [W * 0.95, y + 4]], sd + 1 + k, t, 3, INK.blue, { smooth: true, op: 0.35 }); }
            const px = W * 0.3, py = H * 0.42;
            N.nucleus(mid, px, py, 80, sd + 10, t, { n: 1, cols: [INK.red] });
            if (lt < ha) {
              const u = clamp01(lt / Math.max(0.3, ha)), x = lerp(-60, px - 60, u), y = lerp(py - 120, py - 10, u);
              N.nu(front, x, y, 22, sd + 20, t, { dir: [1, 0.3], tail: 190 });
            } else {
              N.flash(front, px + 60, py - 50, 300, sd + 30, t, clamp01((lt - ha) / 1.1));
              // neutron path: zig-zag to the cadmium
              const cdx = W * 0.74, cdy = H * 0.38;
              N.nucleus(mid, cdx, cdy, 110, sd + 40, t, { n: 11, cols: [INK.inkSoft, INK.paperDark] });
              const pts = [[px + 60, py + 20], [px + 200, py + 150], [px + 360, py - 40], [px + 520, py + 110], [cdx - 90, cdy + 20]];
              const u = clamp01((lt - ha) / Math.max(0.3, sa - ha)), seg = u * (pts.length - 1), si = Math.min(pts.length - 2, Math.floor(seg)), f = seg - si;
              const npos = [lerp(pts[si][0], pts[si + 1][0], f), lerp(pts[si][1], pts[si + 1][1], f)];
              for (let k = 0; k <= si; k++) N.line(back, [pts[k], k === si ? npos : pts[k + 1]], sd + 50 + k, t, 3.5, INK.inkSoft, { op: 0.7 });
              if (lt < sa) N.shape(front, N.ell(npos[0], npos[1], 44, 44, 12), INK.paperLight, sd + 60, t, { w: 6, smooth: true });
              else N.flash(front, cdx, cdy, 260, sd + 70, t, clamp01((lt - sa) / 1.1));
            }
            // trace
            const tx0 = W * 0.2, tx1 = W * 0.8, ty = H * 0.8, span = Math.max(3, (sa - ha) * 1.6);
            N.line(back, [[tx0, ty + 40], [tx1, ty + 40]], sd + 80, t, 3, INK.inkSoft);
            const pts = [], tnow = clamp01((lt - (ha - 0.6)) / span);
            for (let j = 0; j <= 80 * tnow; j++) {
              const u = j / 80, tt = ha - 0.6 + u * span;
              const b1 = Math.exp(-Math.pow((tt - ha) / 0.06, 2)), b2 = Math.exp(-Math.pow((tt - sa) / 0.06, 2));
              pts.push([lerp(tx0, tx1, u), ty - 160 * (b1 + b2) + Math.sin(j * 1.7) * 3]);
            }
            if (pts.length > 1) N.line(mid, pts, sd + 81, t, 6, INK.red, { amp: 0.4 });
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
