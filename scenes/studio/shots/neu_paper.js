// neu_paper: paper documents of a science story (Stickstory neutrino video, 2026-10-27; parametric). Modes:
//   letter:   a typed letter on a big sheet: date line, the readable lines typed letter by letter, the rest as ink
//             scribble lines, a signature that writes itself, fold creases; `hl` underlines a line in red
//   telegram: a telegram form with a heavy header and pasted paper tape strips that type out in capitals
//   news:     a newspaper page (no real masthead): a big headline typed in, picture box with an atom drawing, columns
//   post:     an envelope flies along a dashed arc from a lit ballroom (left, dancers + music notes) to a lecture hall
// SHOTS.neu_paper P: {mode, lines: [{text, size, at, color}], sign: "W. Pauli" | false, hl: {line: 0, at},
//   rot: -2 (deg), stamp: {text, at, color} (red/blue ink stamp), fly: {at} (post: envelope flight),
//   box: [x0, y0, x1, y1] (telegram rect, 0..1), hand: true (telegram: a big hand grips the bottom edge), labels, figures, kasif}
// Readable words on screen stay <= 5 (BRAND §6.4): everything else is scribble. cues: line "at"s, hl.at, stamp.at, fly.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const SLAB = "'Zilla Slab', Georgia, serif", FR = 'Fraunces, Georgia, serif';
  SH.neu_paper = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const N = window.NEU, f1 = N.f1, atOr = N.atOr, sd = seed * 1000 + 307;
      const mode = P.mode || 'letter';
      const root = el(svg, 'g'), sheet = el(root, 'g');
      const back = N.mkPen(sheet), mid = N.mkPen(sheet);
      const texts = (P.lines || []).map(L => {
        const tEl = el(sheet, 'text', { 'font-family': mode === 'news' ? FR : SLAB, 'font-weight': mode === 'news' ? 900 : 700,
          'font-size': L.size || (mode === 'news' ? 96 : mode === 'telegram' ? 64 : 58), fill: L.color === 'red' ? INK.red : INK.ink, 'text-anchor': mode === 'letter' ? 'start' : 'middle' });
        return { L, tEl, full: mode === 'telegram' || mode === 'news' ? String(L.text).toLocaleUpperCase('en-US') : String(L.text) };
      });
      const top = N.mkPen(sheet);
      const signT = P.sign ? el(sheet, 'text', { 'font-family': INK_FONT, 'font-size': 76, fill: INK.ink, 'text-anchor': 'start' }) : null;
      const stampT = P.stamp ? el(sheet, 'text', { 'font-family': SLAB, 'font-weight': 700, 'font-size': 70, 'text-anchor': 'middle', fill: P.stamp.color === 'blue' ? INK.blue : INK.red }) : null;
      if (stampT) stampT.textContent = String(P.stamp.text).toLocaleUpperCase('en-US');
      const com = N.common(root, P, W, H, sd);
      const R0 = rng(sd + 3), scrib = Array.from({ length: 40 }, () => [R0(), R0(), R0()]);
      function scribble(pen, x0, x1, y, k, t, w = 4, col) {
        const pts = [], n = Math.max(4, Math.round((x1 - x0) / 26));
        for (let j = 0; j <= n; j++) pts.push([lerp(x0, x1, j / n), y + Math.sin(j * 2.3 + k * 1.7) * 7 + (j % 2 ? -5 : 5)]);
        N.line(pen, pts, sd + 500 + k, t, w, col || INK.inkSoft, { smooth: true });
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, top].forEach(p => p.begin());
          const rot = (P.rot ?? -2) + Math.sin(t * 0.5) * 0.4;
          sheet.setAttribute('transform', `rotate(${f1(rot)} ${f1(W / 2)} ${f1(H / 2)})`);
          let x0, y0, x1, y1;
          if (mode === 'letter') {
            x0 = W * 0.27; x1 = W * 0.73; y0 = H * (P.top ?? 0.08); y1 = H * 1.08;
            N.shape(back, N.rect(x0 + 16, y0 + 16, x1 + 16, y1 + 16), INK.paperDark, sd + 1, t, { w: 0, op: 0.7 });
            N.shape(back, N.rect(x0, y0, x1, y1), INK.paperLight, sd + 2, t, { w: 5 });
            N.line(back, [[x0, y0 + H * 0.34], [x1, y0 + H * 0.35]], sd + 4, t, 2.5, INK.paperDark);
            N.line(back, [[x0 + 60, y0 + 70], [x0 + 300, y0 + 70]], sd + 5, t, 4, INK.inkSoft);
            for (let k = 0; k < 9; k++) {
              const y = y0 + H * 0.3 + k * 62, w2 = (x1 - x0 - 120) * (0.7 + 0.3 * scrib[k][0]);
              scribble(mid, x0 + 60, x0 + 60 + w2, y, k, t);
            }
          } else if (mode === 'telegram') {
            [x0, y0, x1, y1] = (P.box || [0.14, P.top ?? 0.24, 0.86, 0.92]).map((v, i) => v * (i % 2 ? H : W));
            N.shape(back, N.rect(x0 + 16, y0 + 16, x1 + 16, y1 + 16), INK.paperDark, sd + 1, t, { w: 0, op: 0.7 });
            N.shape(back, N.rect(x0, y0, x1, y1), INK.paperLight, sd + 2, t, { w: 5 });
            N.shape(back, N.rect(x0, y0, x1, y0 + 110), INK.ink, sd + 3, t, { w: 0, op: 0.85 });
            for (let k = 0; k < 6; k++) back.fill(inkDot(x0 + 80 + k * 46, y0 + 55, 12, 12, sd + 6 + k, t), INK.paperLight);
            scribble(back, x1 - 520, x1 - 60, y0 + 56, 30, t, 5, INK.paperLight);
            for (let k = 0; k < 3; k++) N.line(back, [[x0 + 60, y0 + 170 + k * 40], [x0 + 60 + 300 + k * 60, y0 + 170 + k * 40]], sd + 14 + k, t, 3, INK.inkSoft);
          } else if (mode === 'news') {
            x0 = W * 0.2; x1 = W * 0.8; y0 = H * (P.top ?? 0.2); y1 = H * 1.12;
            N.shape(back, N.rect(x0 + 16, y0 + 16, x1 + 16, y1 + 16), INK.paperDark, sd + 1, t, { w: 0, op: 0.7 });
            N.shape(back, N.rect(x0, y0, x1, y1), INK.paperLight, sd + 2, t, { w: 5 });
            scribble(back, W * 0.36, W * 0.64, y0 + 60, 31, t, 12, INK.ink);
            N.line(back, [[x0 + 40, y0 + 110], [x1 - 40, y0 + 110]], sd + 3, t, 5);
            N.line(back, [[x0 + 40, y0 + 124], [x1 - 40, y0 + 124]], sd + 4, t, 2.5);
            const py0 = y0 + H * 0.5, px0 = x0 + 60, px1 = x0 + (x1 - x0) * 0.42;
            N.shape(back, N.rect(px0, py0, px1, py0 + H * 0.3), INK.paper, sd + 5, t, { w: 4 });
            const ax = (px0 + px1) / 2, ay = py0 + H * 0.15;
            N.nucleus(mid, ax, ay, 26, sd + 7, t, { n: 7 });
            for (let k = 0; k < 3; k++) {
              const a = k * Math.PI / 3 + t * 0.3, pts = [];
              for (let j = 0; j < 18; j++) { const b = j / 18 * Math.PI * 2, x = Math.cos(b) * 110, y = Math.sin(b) * 40; pts.push([ax + x * Math.cos(a) - y * Math.sin(a), ay + x * Math.sin(a) + y * Math.cos(a)]); }
              mid.fill(inkPath(pts, { w: 3.5, seed: sd + 40 + k, t, closed: true, smooth: true }), INK.inkSoft);
              const b = t * 2 + k * 2;
              N.nu(mid, ax + Math.cos(b) * 110 * Math.cos(a) - Math.sin(b) * 40 * Math.sin(a), ay + Math.cos(b) * 110 * Math.sin(a) + Math.sin(b) * 40 * Math.cos(a), 10, sd + 50 + k * 9, t, { tail: 0 });
            }
            for (let c = 0; c < 2; c++) for (let k = 0; k < 5; k++) scribble(mid, px1 + 50 + c * ((x1 - px1 - 60) / 2), px1 + 20 + (c + 1) * ((x1 - px1 - 60) / 2) - 30, py0 + 20 + k * 48, 60 + c * 9 + k, t, 3);
          } else {   // post
            x0 = 0; x1 = W; y0 = 0; y1 = H;
            const gy = H * 0.86;
            // ballroom (left)
            const bx = W * 0.24;
            N.shape(back, N.rect(bx - 330, gy - 480, bx + 330, gy), INK.paperLight, sd + 1, t, { w: 6 });
            N.shape(back, [[bx - 370, gy - 480], [bx, gy - 620], [bx + 370, gy - 480]], INK.paperDark, sd + 2, t, { w: 6 });
            for (let k = 0; k < 3; k++) {
              const wx = bx - 210 + k * 210, glow = 0.45 + 0.2 * Math.sin(t * 3 + k);
              const win = [[wx - 85, gy - 60], [wx - 85, gy - 330], [wx, gy - 410], [wx + 85, gy - 330], [wx + 85, gy - 60]];
              N.shape(back, win, INK.gold, sd + 4 + k * 2, t, { w: 6, op: glow });
              // a waltzing couple in each window: he (ink, tails) and she (red gown), hands joined, turning
              const ph = t * 2.2 + k * 2.1, sw = Math.sin(ph) * 14, fy = gy - 70;
              const mx = wx - 26 + sw, wx2 = wx + 26 + sw;
              mid.fill(inkDot(mx, fy - 200, 19, 21, sd + 20 + k, t), INK.ink);
              N.shape(mid, [[mx - 18, fy - 176], [mx + 16, fy - 176], [mx + 12, fy - 90], [mx - 16, fy - 90]], INK.ink, sd + 26 + k * 3, t, { w: 3 });
              N.line(mid, [[mx - 10, fy - 92], [mx - 16, fy]], sd + 40 + k, t, 7); N.line(mid, [[mx + 8, fy - 92], [mx + 14, fy]], sd + 43 + k, t, 7);
              mid.fill(inkDot(wx2, fy - 196, 18, 20, sd + 46 + k, t), INK.ink);
              N.shape(mid, [[wx2 - 10, fy - 174], [wx2 + 10, fy - 174], [wx2 + 46 - sw * 0.6, fy], [wx2 - 40 - sw * 0.6, fy]], INK.red, sd + 50 + k * 3, t, { w: 4 });
              N.line(mid, [[mx + 14, fy - 160], [(mx + wx2) / 2, fy - 186], [wx2 - 8, fy - 160]], sd + 60 + k, t, 6, INK.ink, { smooth: true });
            }
            for (let k = 0; k < 4; k++) {   // music notes
              const ph = (t * 0.35 + k * 0.25) % 1, nx = bx - 120 + k * 80 + Math.sin(ph * 6 + k) * 20, ny = gy - 520 - ph * 180;
              mid.fill(inkDot(nx, ny, 14, 11, sd + 40 + k, t), INK.ink, 1 - ph);
              N.line(mid, [[nx + 12, ny], [nx + 12, ny - 50], [nx + 30, ny - 40]], sd + 44 + k, t, 4, INK.ink, { op: 1 - ph });
            }
            // lecture hall (right)
            const hx = W * 0.8;
            N.shape(back, N.rect(hx - 240, gy - 300, hx + 240, gy), INK.paperLight, sd + 60, t, { w: 6 });
            N.shape(back, [[hx - 280, gy - 300], [hx, gy - 420], [hx + 280, gy - 300]], INK.paperDark, sd + 62, t, { w: 6 });
            for (let k = 0; k < 5; k++) N.line(back, [[hx - 190 + k * 95, gy - 280], [hx - 190 + k * 95, gy - 10]], sd + 64 + k, t, 9, INK.inkSoft);
            N.line(back, [[-20, gy], [W + 20, gy + 2]], sd + 70, t, 7);
            // envelope flight
            const fa = P.fly ? atOr(cues, P.fly.at, 0.4) : 0.4, fp = lt >= fa ? progIO(lt, fa, P.fly && P.fly.dur || 2.6) : 0;
            const A = [bx + 200, gy - 540], B = [hx - 60, gy - 360], C = [W * 0.56, H * 0.12];
            const bez = u => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1]];
            for (let k = 0; k < 24; k++) { const u0 = k / 24, u1 = u0 + 0.02; if (u0 > fp) break; N.line(back, [bez(u0), bez(Math.min(u1, fp))], sd + 80 + k, t, 4, INK.red); }
            const [ex, ey] = bez(fp), ew = 130, eh = 84, er = Math.sin(fp * Math.PI * 2) * 12;
            const env = [[-ew / 2, -eh / 2], [ew / 2, -eh / 2], [ew / 2, eh / 2], [-ew / 2, eh / 2]].map(([x, y]) => { const a = er * Math.PI / 180; return [ex + x * Math.cos(a) - y * Math.sin(a), ey + x * Math.sin(a) + y * Math.cos(a)]; });
            N.shape(top, env, INK.paperLight, sd + 110, t, { w: 5 });
            N.line(top, [env[0], [(env[0][0] + env[1][0]) / 2 + (env[3][0] - env[0][0]) * 0.55, (env[0][1] + env[1][1]) / 2 + (env[3][1] - env[0][1]) * 0.55], env[1]], sd + 112, t, 4);
            top.fill(inkDot((env[2][0] + env[3][0]) / 2, (env[0][1] + env[3][1]) / 2 + 6, 12, 12, sd + 114, t), INK.red);
          }
          // typed lines
          texts.forEach(({ L, tEl, full }, i) => {
            const a = atOr(cues, L.at, 0.3 + i * 0.6), cps = L.cps || 22;
            const n = lt >= a ? Math.min(full.length, Math.floor((lt - a) * cps) + 1) : 0;
            tEl.textContent = full.slice(0, n);
            let x, y;
            if (mode === 'letter') { x = x0 + 60; y = (L.y ?? (0.21 + i * 0.08)) * H; }
            else if (mode === 'telegram') { x = W / 2; y = (L.y ?? (0.5 + i * 0.14)) * H; }
            else if (mode === 'news') { x = W / 2; y = (L.y ?? (0.24 + i * 0.12)) * H; }
            else { x = (L.x ?? 0.5) * W; y = (L.y ?? 0.2) * H; }
            tEl.setAttribute('x', f1(x)); tEl.setAttribute('y', f1(y));
            if (mode === 'telegram' && n > 0) {   // pasted tape behind the typed text
              let w = 0; try { w = tEl.getComputedTextLength(); } catch (e) { w = 0; }
              N.shape(back, N.rect(x - w / 2 - 24, y - (L.size || 64) * 0.85, x + w / 2 + 24, y + (L.size || 64) * 0.3), INK.paper, sd + 200 + i * 3, t, { w: 2.5, ink: INK.inkSoft });
            }
            if (P.hl && (P.hl.line ?? 0) === i) {
              const ha = atOr(cues, P.hl.at, null), hp = ha != null && lt >= ha ? prog(lt, ha, 0.5) : 0;
              let w = 0; try { w = tEl.getComputedTextLength(); } catch (e) { w = 0; }
              const xs = tEl.getAttribute('text-anchor') === 'middle' ? x - w / 2 : x;
              if (hp > 0.01) N.line(top, [[xs - 6, y + 16], [xs - 6 + (w + 12) * hp, y + 10]], sd + 300 + i, t, 10, INK.red);
            }
          });
          if (signT) {
            const sa = atOr(cues, P.sign_at, dur * 0.6), n = lt >= sa ? Math.min(P.sign.length, Math.floor((lt - sa) * 14) + 1) : 0;
            signT.textContent = P.sign.slice(0, n);
            signT.setAttribute('x', f1(mode === 'letter' ? x1 - 360 : W * 0.6)); signT.setAttribute('y', f1(mode === 'letter' ? H * 0.98 : H * 0.8));
          }
          if (stampT) {
            const sa = atOr(cues, P.stamp.at, dur * 0.5), s = lt >= sa ? spring(lt, sa, 0.4) : 0;
            const sx = (P.stamp.x ?? 0.7) * W, sy = (P.stamp.y ?? 0.8) * H;
            stampT.setAttribute('opacity', clamp01(s * 2).toFixed(2));
            stampT.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(-12) scale(${(lerp(2, 1, clamp01(s))).toFixed(3)})`);
            if (s > 0.01) {
              let w = 0; try { w = stampT.getComputedTextLength(); } catch (e) { w = 300; }
              const pts = N.rect(-w / 2 - 30, -70, w / 2 + 30, 30).map(([x, y]) => { const a = -12 * Math.PI / 180, k = lerp(2, 1, clamp01(s)); return [sx + (x * Math.cos(a) - y * Math.sin(a)) * k, sy + (x * Math.sin(a) + y * Math.cos(a)) * k]; });
              top.fill(inkPath(pts, { w: 8, seed: sd + 400, t, closed: true, smooth: false }), P.stamp.color === 'blue' ? INK.blue : INK.red, clamp01(s * 2));
            }
          }
          if (P.hand && mode === 'telegram') {   // a big hand holding the form at its bottom edge
            const hx = x0 + (x1 - x0) * 0.3, hy = y1;
            N.shape(top, [[hx - 150, H + 60], [hx - 140, hy + 40], [hx - 90, hy - 10], [hx + 120, hy - 10], [hx + 170, hy + 40], [hx + 160, H + 60]], INK.paperLight, sd + 600, t, { w: 7, smooth: true });
            N.shape(top, [[hx - 70, hy + 30], [hx - 60, hy - 70], [hx - 20, hy - 96], [hx + 18, hy - 70], [hx + 22, hy + 20]], INK.paperLight, sd + 604, t, { w: 6, smooth: true });
            for (let k = 0; k < 3; k++) N.line(top, [[hx + 40 + k * 40, hy + 10], [hx + 44 + k * 40, hy + 70]], sd + 610 + k, t, 4, INK.inkSoft);
          }
          [back, mid, top].forEach(p => p.end());
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
