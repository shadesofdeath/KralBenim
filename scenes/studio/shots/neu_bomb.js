// neu_bomb: the 1951 Reines-Cowan plan as a cutaway of a desert test site (Stickstory neutrino video, 2026-10-27;
// parametric for any "detector beside a blast" story). A lattice test tower with the bomb in its cab, a ground line
// with a soil cutaway below it, a deep shaft with a winch and a hanging detector tank (rows of light sensors),
// a cushion at the bottom. The detector can drop down the shaft, the bomb can flash into a fireball with a mushroom
// stem and shock rings, a flood of neutrinos can stream through the soil, a red cross can cancel the tower, and a
// dimension line can measure tower -> shaft. Uses neu__lib.js (NEU) + td__lib.js (labels, narrator).
// SHOTS.neu_bomb P: {
//   ground: 0.64 (ground line, 0..1 H), tower: {x: 0.27, h: 0.44 (0..1 H), cab: 1 (cab + device size)} | false, mesas: false,
//   shaft: {x: 0.68, w: 150, depth: 0.3 (0..1 H below ground), dig: 1 (0..1 how far it is dug)} | false,
//   detector: {hang: 0.06 (0..1 H above ground), s: 1} | false, drop: {at: cue, dur: 1.7} (free fall to the cushion),
//   blast: {at: cue} (flash, fireball, stem, shock rings, shake), flood: {at: cue, n: 26} (neutrinos through the soil),
//   cancel: {at: cue} (red X over the tower), dim: {at: cue} (red dimension arrows tower -> shaft, just above ground),
//   dig_anim: {at, from: 0.2} (shaft deepens), labels: [TD.label...], kasif: K (TD.figure)
// }   cues: names used in the params above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.neu_bomb = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, f1 = N.f1, atOr = N.atOr, sd = seed * 1000 + 101;
      const root = el(svg, 'g'), world = el(root, 'g');
      const soilPen = N.mkPen(world), backPen = N.mkPen(world), towerPen = N.mkPen(world), shaftPen = N.mkPen(world),
        detPen = N.mkPen(world), fxPen = N.mkPen(world), topPen = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const gy = (P.ground ?? 0.64) * H;
      const T = P.tower === false ? null : Object.assign({ x: 0.27, h: 0.44 }, P.tower || {});
      const S = P.shaft === false ? null : Object.assign({ x: 0.68, w: 150, depth: 0.3, dig: 1 }, P.shaft || {});
      const D = P.detector === false || !S ? null : Object.assign({ hang: 0.06, s: 1 }, P.detector || {});
      const flood = N.rain((P.flood && P.flood.n) || 26, sd + 5);
      const rocks = N.rain(26, sd + 6);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ba = P.blast ? atOr(cues, P.blast.at, null) : null, bt = ba != null && lt >= ba ? lt - ba : -1;
          const shake = bt >= 0 && bt < 1.4 ? Math.sin(bt * 60) * 10 * (1 - bt / 1.4) : 0;
          world.setAttribute('transform', `translate(${f1(shake)} ${f1(shake * 0.4)})`);
          [soilPen, backPen, towerPen, shaftPen, detPen, fxPen, topPen].forEach(p => p.begin());
          // ---- ground line + soil cutaway (stones, strata)
          N.line(soilPen, [[-20, gy], [W * 0.3, gy + 3], [W * 0.62, gy - 2], [W + 20, gy + 2]], sd + 1, t, 7);
          for (let k = 0; k < 3; k++) {
            const y = gy + (k + 1) * (H - gy) / 4 + Math.sin(k * 2) * 8;
            N.line(soilPen, [[-20, y], [W * 0.25, y + 10], [W * 0.5, y - 6], [W * 0.75, y + 8], [W + 20, y]], sd + 10 + k, t, 3, INK.inkSoft, { smooth: true });
          }
          rocks.forEach((q, i) => {
            const x = q.u * W, y = gy + 30 + q.v * (H - gy - 40);
            if (S && Math.abs(x - S.x * W) < S.w) return;
            N.shape(soilPen, N.ell(x, y, 10 + q.k * 16, 6 + q.k * 9, 7), INK.paperDark, sd + 20 + i * 3, t, { w: 3, op: 0.8 });
          });
          if (P.mesas) for (let k = 0; k < 4; k++) {   // distant flat-topped mesas on the horizon
            const mx = W * (0.08 + k * 0.27), mw = 260 + (k % 2) * 140, mh = 90 + (k % 3) * 40;
            N.shape(backPen, [[mx - mw / 2 - 60, gy], [mx - mw / 2, gy - mh], [mx + mw / 2, gy - mh - 6], [mx + mw / 2 + 70, gy]], INK.paperDark, sd + 500 + k * 3, t, { w: 3, op: 0.55, ink: INK.inkSoft });
            for (let j = 1; j < 4; j++) N.line(backPen, [[mx - mw / 2 + j * mw / 4, gy - mh + 8], [mx - mw / 2 + j * mw / 4 - 18, gy - 6]], sd + 520 + k * 4 + j, t, 2.5, INK.inkSoft, { op: 0.6 });
          }
          // ---- tower + bomb cab
          const vapor = bt >= 0 ? clamp01(bt / 0.25) : 0;
          if (T && vapor < 1) {
            const tx = T.x * W, top = gy - T.h * H, bw = 150 * (T.cab ?? 1), tw = 54 * (T.cab ?? 1);
            const L = y => lerp(tx - bw / 2, tx - tw / 2, (gy - y) / (gy - top)), R = y => lerp(tx + bw / 2, tx + tw / 2, (gy - y) / (gy - top));
            N.line(towerPen, [[L(gy), gy], [L(top), top]], sd + 40, t, 7);
            N.line(towerPen, [[R(gy), gy], [R(top), top]], sd + 41, t, 7);
            const n = 7;
            for (let k = 0; k < n; k++) {
              const y0 = lerp(gy, top, k / n), y1 = lerp(gy, top, (k + 1) / n);
              N.line(towerPen, [[L(y0), y0], [R(y1), y1]], sd + 42 + k, t, 3.5, INK.inkSoft);
              N.line(towerPen, [[R(y0), y0], [L(y1), y1]], sd + 52 + k, t, 3.5, INK.inkSoft);
              N.line(towerPen, [[L(y1), y1], [R(y1), y1]], sd + 62 + k, t, 4);
            }
            const cs = T.cab ?? 1, cw = 110 * cs, ch = 150 * cs;
            const cab = N.rect(tx - cw, top - ch, tx + cw, top);
            N.shape(towerPen, cab, INK.paperLight, sd + 70, t, { w: 6 });
            N.shape(towerPen, [[tx - cw - 16, top - ch + 2], [tx, top - ch - 50 * cs], [tx + cw + 16, top - ch + 2]], INK.paperDark, sd + 72, t, { w: 5 });
            // the device: a fat capsule with a box tail fin, hung from a hook (not a fish)
            const bx = tx - 12 * cs, by = top - ch * 0.45, bl = 150 * cs, bh = 70 * cs, glow = 0.5 + 0.5 * Math.sin(t * 5);
            N.line(towerPen, [[bx, top - ch], [bx, by - bh / 2]], sd + 73, t, 4);
            const cap = []; for (let j = 0; j <= 8; j++) { const a = Math.PI / 2 + j / 8 * Math.PI; cap.push([bx - bl / 2 + bh / 2 + Math.cos(a) * bh / 2, by + Math.sin(a) * bh / 2]); }
            for (let j = 0; j <= 8; j++) { const a = -Math.PI / 2 + j / 8 * Math.PI; cap.push([bx + bl / 2 - bh / 2 + Math.cos(a) * bh / 2 * 0.7, by + Math.sin(a) * bh / 2]); }
            N.shape(towerPen, cap, INK.inkSoft, sd + 74, t, { w: 5, smooth: true });
            const fx0 = bx + bl / 2 - 4, fs = bh * 0.55;
            N.shape(towerPen, N.rect(fx0, by - fs, fx0 + fs * 0.9, by + fs), INK.paperDark, sd + 76, t, { w: 4 });
            N.line(towerPen, [[fx0, by], [fx0 + fs * 0.9, by]], sd + 77, t, 3);
            N.line(towerPen, [[bx - bl * 0.12, by - bh / 2 + 4], [bx - bl * 0.12, by + bh / 2 - 4]], sd + 78, t, 6, INK.red, { op: 0.5 + 0.5 * glow });
            // cancel cross
            const ca = P.cancel ? atOr(cues, P.cancel.at, null) : null;
            if (ca != null && lt >= ca) {
              const p1 = prog(lt, ca, 0.35), p2 = prog(lt, ca + 0.3, 0.35), x0 = tx - 190, x1 = tx + 190, y0 = top - 190, y1 = gy - 10;
              N.line(topPen, [[x0, y0], [lerp(x0, x1, p1), lerp(y0, y1, p1)]], sd + 80, t, 26, INK.red, { taper: 0.15 });
              if (p2 > 0) N.line(topPen, [[x1, y0], [lerp(x1, x0, p2), lerp(y0, y1, p2)]], sd + 81, t, 26, INK.red, { taper: 0.15 });
            }
          }
          // ---- shaft, winch, cushion
          let dig = S ? S.dig : 0;
          if (S && P.dig_anim) { const da = atOr(cues, P.dig_anim.at, 0.2); dig = lerp(P.dig_anim.from ?? 0.2, S.dig, lt >= da ? progIO(lt, da, P.dig_anim.dur ?? 2.2) : 0); }
          let bottom = gy;
          if (S) {
            const sx = S.x * W, hw = S.w / 2;
            bottom = gy + S.depth * H * dig;
            N.shape(shaftPen, N.rect(sx - hw, gy, sx + hw, bottom), INK.paper, sd + 90, t, { w: 0 });
            N.line(shaftPen, [[sx - hw, gy], [sx - hw, bottom]], sd + 91, t, 7);
            N.line(shaftPen, [[sx + hw, gy], [sx + hw, bottom]], sd + 92, t, 7);
            for (let k = 0; k < 9; k++) {
              const y = gy + (k + 0.5) * (bottom - gy) / 9;
              N.line(shaftPen, [[sx - hw - 26, y + 14], [sx - hw, y]], sd + 93 + k, t, 3, INK.inkSoft);
              N.line(shaftPen, [[sx + hw, y], [sx + hw + 26, y + 14]], sd + 103 + k, t, 3, INK.inkSoft);
            }
            if (dig > 0.95) {   // feather cushion
              N.shape(shaftPen, N.rect(sx - hw + 6, bottom - 40, sx + hw - 6, bottom), INK.paperLight, sd + 113, t, { w: 4 });
              for (let k = 0; k < 5; k++) N.line(shaftPen, [[sx - hw + 20 + k * 26, bottom - 12], [sx - hw + 30 + k * 26, bottom - 32], [sx - hw + 40 + k * 26, bottom - 18]], sd + 114 + k, t, 3, INK.inkSoft, { smooth: true });
            } else {           // digging: a shovel of soil flying out
              const ph = (t * 1.6) % 1;
              N.shape(shaftPen, N.ell(sx + hw + 40 + ph * 60, gy - 30 - Math.sin(ph * Math.PI) * 60, 12, 9, 7), INK.paperDark, sd + 119, t, { w: 3 });
              N.line(shaftPen, [[sx - 20, bottom - 4], [sx + 20, bottom - 4]], sd + 120, t, 5);
            }
            // winch frame over the shaft
            const wy = gy - 120;
            N.line(shaftPen, [[sx - hw - 30, gy], [sx - 10, wy]], sd + 121, t, 6);
            N.line(shaftPen, [[sx + hw + 30, gy], [sx + 10, wy]], sd + 122, t, 6);
            N.shape(shaftPen, N.ell(sx, wy, 18, 18, 9), INK.paperLight, sd + 123, t, { w: 5, smooth: true });
            // ---- detector tank
            if (D) {
              const dw = 110 * D.s, dh = 150 * D.s, y0 = gy - D.hang * H;
              const da = P.drop ? atOr(cues, P.drop.at, null) : null, ddur = (P.drop && P.drop.dur) || 1.7;
              const fall = da != null && lt >= da ? Math.min(1, Math.pow((lt - da) / ddur, 2)) : 0;
              const yEnd = bottom - 40 - dh / 2, cy = lerp(y0, yEnd, fall) + (fall >= 1 ? Math.sin((lt - da - ddur) * 18) * 6 * Math.exp(-(lt - da - ddur) * 5) : 0);
              if (fall < 0.02) N.line(detPen, [[sx, wy], [sx, cy - dh / 2]], sd + 130, t, 3);
              else N.line(detPen, [[sx, wy], [sx, wy + 30]], sd + 130, t, 3);
              N.shape(detPen, N.rect(sx - dw / 2, cy - dh / 2, sx + dw / 2, cy + dh / 2), INK.paperLight, sd + 131, t, { w: 6 });
              N.shape(detPen, N.rect(sx - dw / 2 + 12, cy - dh / 2 + 14, sx + dw / 2 - 12, cy + dh / 2 - 14), INK.blue, sd + 133, t, { w: 3, op: 0.35 });
              for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) detPen.fill(inkDot(sx - dw / 4 + c * dw / 2, cy - dh / 2 + 30 + r * (dh - 60) / 3, 9 * D.s, 9 * D.s, sd + 140 + r * 2 + c, t), INK.gold);
              if (fall > 0 && fall < 1) for (let k = 0; k < 3; k++) N.line(detPen, [[sx - 30 + k * 30, cy - dh / 2 - 20], [sx - 30 + k * 30, cy - dh / 2 - 70]], sd + 150 + k, t, 3, INK.inkSoft);
            }
          }
          // ---- dimension arrows tower -> shaft
          if (P.dim && T && S) {
            const a = atOr(cues, P.dim.at, 0.3), p = lt >= a ? prog(lt, a, 0.8) : 0;
            if (p > 0.01) {
              const x0 = T.x * W + 90, x1 = lerp(x0, S.x * W - S.w / 2 - 40, p), y = gy - 40;
              N.line(fxPen, [[x0, y], [x1, y]], sd + 160, t, 6, INK.red);
              N.line(fxPen, [[x0, y - 24], [x0, y + 24]], sd + 161, t, 6, INK.red);
              N.line(fxPen, [[x1 - 22, y - 18], [x1, y], [x1 - 22, y + 18]], sd + 162, t, 6, INK.red);
            }
          }
          // ---- neutrino flood through the soil
          if (P.flood && T) {
            const fa = atOr(cues, P.flood.at, 0.2), on = lt >= fa ? clamp01((lt - fa) / 0.6) : 0;
            const ox = T.x * W, oy = gy - T.h * H - 52;
            if (on > 0) flood.forEach((q, i) => {
              const ang = lerp(0.12, 0.95, q.v), u = N.rainPos(q, t, 0.55), d = u * W * 0.95;
              const x = ox + Math.cos(ang) * d, y = oy + Math.sin(ang) * d;
              if (y > H + 20 || x > W + 20) return;
              N.nu(fxPen, x, y, 9, sd + 200 + i * 9, t, { dir: [Math.cos(ang), Math.sin(ang)], tail: 70, col: INK.blue });
            });
          }
          // ---- blast: flash, fireball, stem, shock rings
          if (T && bt >= 0) {
            const tx = T.x * W, top = gy - T.h * H;
            N.flash(fxPen, tx, top - 52, P.blast.r ?? 420, sd + 300, t, clamp01(bt / 1.2));
            if (P.blast.r > 600 && bt < 1.6) fxPen.fill(inkLoop(N.ell(tx, top, P.blast.r * 1.4, P.blast.r, 18), { seed: sd + 301, t, amp: 3 }), INK.gold, 0.35 * (1 - bt / 1.6));
            const g = EASE(clamp01((bt - 0.15) / 2.2)), fr = 70 + (P.blast.size ?? 110) * g, fy = top - 30 - (P.blast.rise ?? 150) * g;
            if (bt > 0.15) {
              // base ring (dust skirt) behind the stem
              const br = []; for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2; br.push([tx + Math.cos(a) * fr * 1.7 * (1 + 0.06 * Math.sin(k * 3 + t * 4)), gy - 10 + Math.sin(a) * fr * 0.32]); }
              N.shape(fxPen, br, INK.paperDark, sd + 308, t, { w: 5, smooth: true });
              // stem: a narrow column that flares at the base
              const sw = fr * 0.28, ry = fr * 0.72, rx = fr * 1.35, sTop = fy + ry * 0.3;
              const stem = [[tx - sw, sTop], [tx + sw, sTop], [tx + sw * 1.1, (sTop + gy) / 2], [tx + sw * 2.2, gy - 12], [tx - sw * 2.2, gy - 12], [tx - sw * 1.1, (sTop + gy) / 2]];
              N.shape(fxPen, stem, INK.paperDark, sd + 310, t, { w: 6, smooth: true });
              for (let k = 0; k < 4; k++) N.line(fxPen, [[tx - sw * 0.6 + k * sw * 0.4, sTop + 20], [tx - sw * 0.8 + k * sw * 0.5, gy - 30]], sd + 312 + k, t, 3, INK.inkSoft);
              // cap: a dome with rolled-under edges
              const cap = [];
              for (let k = 0; k <= 14; k++) { const a = Math.PI + k / 14 * Math.PI, wob = 1 + 0.06 * Math.sin(k * 2.7 + t * 3); cap.push([tx + Math.cos(a) * rx * wob, fy + Math.sin(a) * ry * wob]); }
              cap.push([tx + rx * 0.92, fy + ry * 0.35], [tx + rx * 0.55, fy + ry * 0.5], [tx + sw * 1.2, fy + ry * 0.32], [tx - sw * 1.2, fy + ry * 0.32], [tx - rx * 0.55, fy + ry * 0.5], [tx - rx * 0.92, fy + ry * 0.35]);
              N.shape(fxPen, cap, INK.gold, sd + 314, t, { w: 7, smooth: true, amp: 1.5 });
              N.shape(fxPen, N.ell(tx, fy + ry * 0.12, rx * 0.62, ry * 0.3, 12), INK.red, sd + 316, t, { w: 0, op: 0.6, smooth: true });
              for (let k = 0; k < 4; k++) { const a = Math.PI * (1.15 + k * 0.23); N.line(fxPen, [[tx + Math.cos(a) * rx * 0.85, fy + Math.sin(a) * ry * 0.85], [tx + Math.cos(a) * rx * 0.45, fy + Math.sin(a) * ry * 0.4]], sd + 318 + k, t, 4, INK.red, { smooth: true }); }
              for (let k = 0; k < 3; k++) {
                const rr = (bt - 0.2 - k * 0.35) * 520;
                if (rr > 20 && rr < 1400) {
                  const pts = []; for (let j = 0; j <= 12; j++) { const a = Math.PI + j / 12 * Math.PI; pts.push([tx + Math.cos(a) * rr, gy + Math.sin(a) * rr * 0.35]); }
                  N.line(fxPen, pts, sd + 320 + k, t, 6 - k, INK.red, { smooth: true, op: clamp01(1 - rr / 1400) });
                }
              }
            }
          }
          [soilPen, backPen, towerPen, shaftPen, detPen, fxPen, topPen].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
