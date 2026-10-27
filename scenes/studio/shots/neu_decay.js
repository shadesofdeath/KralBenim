// neu_decay: nuclear decay bookkeeping, drawn as ink diagrams (Stickstory neutrino video, 2026-10-27; parametric).
// Modes:
//   missing: a radioactive nucleus (left) fires an electron again and again; on the right two energy bars, "in"
//            (full gold) and "out" (the electron's share in blue, a different length every time), the gap between them
//            ringed in red dashes with a red "?"
//   ghost:   the same, but each decay also lets a dashed ghost particle slip out; its share fills the gap (hatched)
//   capture: a neutrino flies in and hits a big chlorine nucleus (green), which flashes and turns into argon (gold),
//            glowing; an electron leaves
// SHOTS.neu_decay P: {mode, emit: {at} (first decay), period: 2.4, hit: {at} (capture), bench: true (missing/ghost: the source
//   sits in a lead castle on a lab bench, the bars hang on the wall as a framed meter board), labels, kasif}
// cues: emit.at, hit.at, label names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_decay = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, atOr = N.atOr, sd = seed * 1000 + 401;
      const mode = P.mode || 'missing';
      const root = el(svg, 'g');
      const back = N.mkPen(root), mid = N.mkPen(root), front = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const R0 = rng(sd + 5), shares = Array.from({ length: 12 }, () => 0.3 + 0.45 * R0()), angs = Array.from({ length: 12 }, () => -0.5 + R0() * 0.5);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front].forEach(p => p.begin());
          if (mode === 'capture') {
            const cx = W * 0.55, cy = H * 0.47, ha = atOr(cues, P.hit && P.hit.at, dur * 0.4), hit = lt >= ha;
            const ap = hit ? clamp01((lt - ha) / 0.5) : 0, glow = hit ? 0.6 + 0.4 * Math.sin(t * 5) : 0;
            if (hit) back.fill(inkLoop(N.ell(cx, cy, 260 + 20 * Math.sin(t * 4), 260 + 20 * Math.sin(t * 4), 16), { seed: sd + 1, t, amp: 2 }), INK.gold, 0.25 * glow);
            for (let k = 0; k < 3; k++) {   // electron shells
              const r = 230 + k * 70, a0 = t * (0.4 - k * 0.1);
              back.fill(inkPath(N.ell(cx, cy, r, r * 0.92, 20), { w: 3, seed: sd + 10 + k, t, closed: true, smooth: true }), INK.inkSoft);
              back.fill(inkDot(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r * 0.92, 11, 11, sd + 14 + k, t), INK.ink);
            }
            N.nucleus(mid, cx, cy, 150, sd + 20, t, { n: 19, cols: ap > 0.5 ? [INK.gold, INK.paperLight] : [INK.green, INK.paperLight], shake: lt < ha && lt > ha - 0.3 ? 4 : 0 });
            if (!hit) {
              const u = clamp01(lt / Math.max(0.4, ha)), x = lerp(-60, cx - 120, u), y = lerp(cy - 160, cy - 30, u);
              N.nu(front, x, y, 16, sd + 40, t, { dir: [1, 0.25], tail: 160 });
            } else {
              N.flash(front, cx - 100, cy - 20, 300, sd + 50, t, clamp01((lt - ha) / 1.1));
              const u = clamp01((lt - ha) / 1.6);
              N.nu(front, lerp(cx - 60, W + 80, u), lerp(cy - 30, cy - 260, u), 12, sd + 60, t, { dir: [1, -0.25], tail: 60, col: INK.inkSoft, ghost: false });
            }
          } else {
            const lab = P.bench !== false, nx = lab ? W * 0.22 : W * 0.2, ny = lab ? H * 0.56 : H * 0.45, ea = atOr(cues, P.emit && P.emit.at, 0.3), per = P.period ?? 2.4;
            if (lab) {   // 1920s lab: work bench, lead castle holding the source, the energy meter as a framed board on the wall
              N.bench(back, W * 0.03, W * 0.46, H * 0.74, H * 0.98, sd + 300, t);
              for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
                const bx = nx + (c ? 120 : -230), by = H * 0.74 - (r + 1) * 70;
                N.shape(back, N.rect(bx, by, bx + 110, by + 66), INK.inkSoft, sd + 310 + r * 2 + c, t, { w: 4, op: 0.55 });
              }
              N.shape(back, N.rect(nx - 230, H * 0.74 - 230, nx + 230, H * 0.74 - 210), INK.inkSoft, sd + 320, t, { w: 4, op: 0.55 });
              N.shape(back, N.rect(W * 0.48, H * 0.12, W * 0.96, H * 0.8), INK.paperLight, sd + 330, t, { w: 8 });
              N.shape(back, N.rect(W * 0.48 + 22, H * 0.12 + 22, W * 0.96 - 22, H * 0.8 - 22), null, sd + 332, t, { w: 3, ink: INK.inkSoft });
              for (const [sx, sy] of [[0.5, 0.15], [0.94, 0.15], [0.5, 0.77], [0.94, 0.77]]) back.fill(inkDot(W * sx, H * sy, 8, 8, sd + 340 + sx * 10 + sy, t), INK.inkSoft);
              for (let k = 0; k <= 10; k++) N.line(back, [[lerp(W * 0.53, W * 0.92, k / 10), H * 0.71], [lerp(W * 0.53, W * 0.92, k / 10), H * 0.71 - (k % 5 ? 16 : 32)]], sd + 350 + k, t, 3, INK.inkSoft);
            }
            const k = lt >= ea ? Math.floor((lt - ea) / per) : -1, ph = k >= 0 ? (lt - ea - k * per) / per : 0;
            N.nucleus(mid, nx, ny, 110, sd + 20, t, { n: 13, shake: k >= 0 && ph < 0.08 ? 5 : 0 });
            const share = k >= 0 ? shares[k % shares.length] : 0.5;
            if (k >= 0) {
              const a = angs[k % angs.length], d = EASE(clamp01(ph / 0.6)) * W * 0.5;
              N.flash(front, nx + 110, ny, 120, sd + 30 + k, t, clamp01(ph / 0.35));
              const ex = nx + Math.cos(a) * (130 + d), ey = ny + Math.sin(a) * (130 + d);
              front.fill(inkDot(ex, ey, 18, 18, sd + 40, t), INK.ink);
              for (let j = 1; j < 4; j++) front.fill(inkDot(ex - Math.cos(a) * j * 36, ey - Math.sin(a) * j * 36, 7 - j, 7 - j, sd + 41 + j, t), INK.inkSoft);
              if (mode === 'ghost') {
                const b = a + 1.1, gd = EASE(clamp01(ph / 0.7)) * W * 0.4;
                N.nu(front, nx + Math.cos(b) * (130 + gd), ny + Math.sin(b) * (130 + gd), 16, sd + 50, t, { dir: [Math.cos(b), Math.sin(b)], tail: 120, ghost: true, col: INK.blue });
              }
            }
            // energy bars
            const bx0 = lab ? W * 0.53 : W * 0.42, bx1 = lab ? W * 0.92 : W * 0.9, L = bx1 - bx0, y1 = lab ? H * 0.3 : H * 0.32, y2 = lab ? H * 0.54 : H * 0.62, bh = lab ? 80 : 64;
            N.shape(back, N.rect(bx0, y1 - bh / 2, bx1, y1 + bh / 2), INK.gold, sd + 60, t, { w: 6, op: 0.85 });
            const s = k >= 0 ? EASE(clamp01(ph / 0.4)) * share : 0;
            N.shape(back, N.rect(bx0, y2 - bh / 2, bx0 + L * Math.max(0.02, s), y2 + bh / 2), INK.blue, sd + 62, t, { w: 6, op: 0.85 });
            if (k >= 0 && ph > 0.35) {
              const gx0 = bx0 + L * share, pulse = 1 + 0.06 * Math.sin(t * 8);
              if (mode === 'ghost') {
                const gp = clamp01((ph - 0.35) / 0.3);
                N.shape(back, N.rect(gx0, y2 - bh / 2, gx0 + (bx1 - gx0) * gp, y2 + bh / 2), INK.paperLight, sd + 64, t, { w: 5, ink: INK.blue });
                for (let j = 0; j < 8; j++) { const hx = gx0 + (j + 0.5) * (bx1 - gx0) / 8; if (hx < gx0 + (bx1 - gx0) * gp) N.line(back, [[hx - 14, y2 + bh / 2 - 8], [hx + 14, y2 - bh / 2 + 8]], sd + 66 + j, t, 3, INK.blue); }
              } else {
                for (let j = 0; j < 10; j++) {
                  const u0 = j / 10, u1 = u0 + 0.05, xa = lerp(gx0, bx1, u0), xb = lerp(gx0, bx1, u1);
                  N.line(back, [[xa, y2 - bh / 2 - 6], [xb, y2 - bh / 2 - 6]], sd + 70 + j, t, 5, INK.red);
                  N.line(back, [[xa, y2 + bh / 2 + 6], [xb, y2 + bh / 2 + 6]], sd + 80 + j, t, 5, INK.red);
                }
                const qx = (gx0 + bx1) / 2, qy = y2 + (lab ? 110 : 150), q = (lab ? 0.9 : 1.2) * pulse;
                front.fill(inkPath([[qx - 26 * q, qy - 40 * q], [qx - 10 * q, qy - 66 * q], [qx + 22 * q, qy - 60 * q], [qx + 28 * q, qy - 30 * q], [qx, qy - 6 * q], [qx, qy + 14 * q]], { w: 13, seed: sd + 90, t, smooth: true }), INK.red);
                front.fill(inkDot(qx, qy + 42 * q, 9, 9, sd + 91, t), INK.red);
              }
            }
          }
          [back, mid, front].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
