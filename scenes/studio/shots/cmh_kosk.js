// cmh_kosk: inside the Çankaya mansion, Ankara, October 1923 (02-cumhuriyetin-ilani-1923). Two rooms:
//   "dinner" — papered dining room at night: window with moon and curtains, hanging oil lamp, a long laid table
//              (cloth, plates, glasses, candles); the cast sits/stands behind it (their legs hidden by the cloth);
//              chair backs in the foreground; optional papers (resignation letters) flying onto a pile.
//   "desk"   — close-up of a writing desk at night: a big sheet of paper on which words are written one by one
//              (dip pen follows the writing), an oil lamp, an inkwell; optional cast behind the desk.
// Use "set": false (the shot paints its own room).
// P: {room: "dinner"|"desk", cast: [CMH cast entries], letters: {at: cue, n: 5, from: [x...] (0..1 W)},
//     heading: "Madde 1", words: [{text, at, line: 0|1}], write_dur: 0.5, stamp: {text, at, color},
//     candles: true, clock: {from, to, at} | false, labels: [MCB label entries], lamp: true}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cmh_kosk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CMH, { atOr, f1 } = C;
      const room = P.room || 'dinner', desk = room === 'desk', study = room === 'study';
      const root = el(svg, 'g');
      const wallG = el(root, 'g'), castG = el(root, 'g'), tableG = el(root, 'g'), topG = el(root, 'g'), labG = el(root, 'g');
      const wallF = inkEl(wallG, INK.paperDark, { 'fill-opacity': 0.7 }), patt = inkEl(wallG, INK.inkSoft, { 'fill-opacity': 0.55 });
      const wainF = inkEl(wallG, INK.stain, { 'fill-opacity': 0.55 });
      const winF = inkEl(wallG, study ? INK.paperLight : INK.inkSoft, { 'fill-opacity': 0.9 }), moon = inkEl(wallG, study ? INK.paperDark : INK.paperLight), curt = inkEl(wallG, INK.red, { 'fill-opacity': 0.75 });
      const wallL = inkEl(wallG, INK.ink);
      const clk = P.clock ? C.clock(wallG, Object.assign({ seed: seed + 70 }, P.clock)) : null;
      const lampH = !desk && !study && P.lamp !== false ? C.lamp(topG, { seed: seed + 40, glow: 0.16 }) : null;
      const cast = P.cast ? C.cast(castG, P.cast, W, H, seed * 3 + 5) : null;
      const clothF = inkEl(tableG, desk || study ? INK.stain : INK.paperLight), clothL = inkEl(tableG, INK.ink), grain = inkEl(tableG, INK.inkSoft);
      const dish = inkEl(tableG, INK.paperLight), dishL = inkEl(tableG, INK.ink), flame = inkEl(tableG, INK.gold), glowC = inkEl(tableG, INK.gold, { 'fill-opacity': 0.18 });
      const chairsF = inkEl(topG, INK.stain), chairsL = inkEl(topG, INK.ink);
      const pileF = inkEl(topG, INK.paperLight), pileL = inkEl(topG, INK.ink);
      // desk room: paper + words + pen + lamp + inkwell
      const paperF = desk ? inkEl(tableG, INK.paperLight) : null, paperL = desk ? inkEl(tableG, INK.ink) : null;
      const textG = desk ? el(tableG, 'g') : null;
      const head = desk && P.heading ? el(textG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': 58, 'text-anchor': 'middle', fill: INK.ink }) : null;
      if (head) head.textContent = P.heading;
      const words = desk ? (P.words || []).map(w => {
        const tx = el(textG, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': w.size || 74, 'text-anchor': 'start', fill: w.color === 'red' ? INK.red : INK.ink });
        tx.textContent = w.text; let wd = 0; try { wd = tx.getComputedTextLength(); } catch (e) { wd = 36 * w.text.length; }
        return { w, tx, wd };
      }) : [];
      const deskLamp = desk ? { glow: [0, 1, 2].map(k => inkEl(tableG, INK.gold, { 'fill-opacity': 0.14 - k * 0.03 })), f: inkEl(tableG, INK.paperLight), fl: inkEl(tableG, INK.gold), l: inkEl(tableG, INK.ink) } : null;
      const well = desk ? { f: inkEl(tableG, INK.ink), l: inkEl(tableG, INK.ink) } : null;
      const pen = desk ? { f: inkEl(labG, INK.inkSoft), l: inkEl(labG, INK.ink) } : null;
      const labels = P.labels ? C.labels(labG, P.labels, W, H, seed * 9) : null;
      const stamp = P.stamp ? C.labels(labG, [Object.assign({ x: 0.8, y: 0.9, stamp: true, size: 84, color: 'red', rot: -8 }, P.stamp)], W, H, seed * 13) : null;
      // word layout on the sheet (two lines)
      const PX = W * 0.5, PY = H * 0.72, PW = 1180, PH = 460, ROT = -2.5;
      let lineX = [0, 0];
      const lay = words.map(o => { const ln = o.w.line || 0; const x = lineX[ln]; lineX[ln] += o.wd + 26; return { o, ln, x }; });
      const lineW = lineX.map(v => Math.max(0, v - 26));

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const base = desk ? H * 0.5 : H * 0.6;
          // walls + wallpaper pattern
          wallF.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, base], [-40, base]], { seed: seed + 1, t, amp: 1, smooth: false }));
          let pd = '';
          for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++) {
            const x = 120 + c * 105 + (r % 2) * 52, y = 60 + r * 80;
            if (y > base - 140 || (x < 600 && y < 200)) continue;
            pd += inkLoop([[x, y - 12], [x + 9, y], [x, y + 12], [x - 9, y]], { seed: seed + 100 + r * 20 + c, t, amp: 0.5, smooth: false }) + ' ';
          }
          if (study) {   // bookshelf on the left wall instead of wallpaper diamonds
            pd = '';
            const bx0 = W * 0.04, bx1 = W * 0.28, by0 = H * 0.3, by1 = base - 10;
            let sl = inkPath([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], { w: 6, seed: seed + 300, t, closed: true, smooth: false });
            for (let r = 0; r < 4; r++) {
              const y1 = lerp(by0, by1, (r + 1) / 4), y0 = lerp(by0, by1, r / 4) + 12;
              sl += inkPath([[bx0, y1], [bx1, y1]], { w: 5, seed: seed + 301 + r, t });
              let x = bx0 + 14;
              for (let k = 0; x < bx1 - 30; k++) { const q = rng(seed + 310 + r * 40 + k), w = 18 + q() * 16, h = (y1 - y0) * (0.7 + q() * 0.28), lean = q() < 0.12 ? 10 : 0;
                pd += inkLoop([[x, y1 - 3], [x + lean, y1 - h], [x + w + lean, y1 - h], [x + w, y1 - 3]], { seed: seed + 320 + r * 40 + k, t, amp: 0.5, smooth: false }) + ' '; x += w + 4; }
            }
            this._sl = sl;
          }
          patt.setAttribute('d', pd);
          wainF.setAttribute('d', inkLoop([[-40, base - 120], [W + 40, base - 120], [W + 40, base], [-40, base]], { seed: seed + 2, t, amp: 1, smooth: false }));
          let wl = inkPath([[-40, base - 120], [W + 40, base - 120]], { w: 6, seed: seed + 3, t }) + inkPath([[-40, base], [W + 40, base]], { w: 7, seed: seed + 4, t });
          for (let k = 0; k < 10; k++) { const x = 60 + k * 200; wl += inkPath(inkLinear([[x, base - 100], [x + 150, base - 100], [x + 150, base - 18], [x, base - 18]], true, 40), { w: 3, seed: seed + 10 + k, t, closed: true, smooth: false }); }
          // window with moon + curtains (right)
          const wx0 = desk ? W * 0.7 : W * 0.76, wx1 = wx0 + 280, wy0 = 110, wy1 = base - 150;
          winF.setAttribute('d', inkLoop([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], { seed: seed + 20, t, amp: 0.8, smooth: false }));
          moon.setAttribute('d', study ? C.puff(wx0 + 90 + Math.sin(t * 0.3) * 20, wy0 + 90, 40, seed + 21, t) + ' ' + C.puff(wx0 + 200 + Math.sin(t * 0.25) * 16, wy0 + 170, 32, seed + 22, t) : inkLoop(inkEllipsePts(wx0 + 190, wy0 + 80, 34, 34, seed + 21, 12), { seed: seed + 21, t, amp: 0.6 }) + ' '
            + (study ? '' : [0, 1, 2, 3].map(k => { const q = rng(seed + 30 + k); return inkDot(wx0 + 30 + q() * 220, wy0 + 40 + q() * (wy1 - wy0 - 80), 4, 4, seed + 31 + k, t); }).join(' ')));
          wl += inkPath([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], { w: 7, seed: seed + 22, t, closed: true, smooth: false })
            + inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 5, seed: seed + 23, t }) + inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 5, seed: seed + 24, t });
          const sw = Math.sin(t * 0.8) * 8;
          const cl = [[wx0 - 70, wy0 - 30], [wx0 + 30, wy0 - 30], [wx0 + 10 + sw, (wy0 + wy1) / 2], [wx0 + 40, wy1 + 30], [wx0 - 80, wy1 + 30]];
          const cr = [[wx1 - 30, wy0 - 30], [wx1 + 70, wy0 - 30], [wx1 + 80, wy1 + 30], [wx1 - 40, wy1 + 30], [wx1 - 10 - sw, (wy0 + wy1) / 2]];
          curt.setAttribute('d', inkLoop(cl, { seed: seed + 25, t, amp: 1 }) + ' ' + inkLoop(cr, { seed: seed + 26, t, amp: 1 }));
          wl += inkPath(cl, { w: 5, seed: seed + 27, t, closed: true }) + inkPath(cr, { w: 5, seed: seed + 28, t, closed: true }) + inkPath([[wx0 - 100, wy0 - 34], [wx1 + 100, wy0 - 34]], { w: 9, seed: seed + 29, t });
          if (study && this._sl) wl += this._sl;
          wallL.setAttribute('d', wl);
          if (clk) clk.update(t, lt, cues, { x: desk ? W * 0.56 : W * 0.6, y: desk ? H * 0.16 : H * 0.17, r: 54, dur });
          if (cast) cast.update(lt, t, cues);
          if (study) {
            const ty = H * 0.76, x0 = W * 0.36, x1 = W * 0.64;
            const top = [[x0, ty], [x1, ty], [x1 + 20, ty + 40], [x0 - 20, ty + 40]];
            clothF.setAttribute('d', inkLoop(top, { seed: seed + 50, t, amp: 0.8, smooth: false }));
            let cd = inkPath(top, { w: 6, seed: seed + 52, t, closed: true, smooth: false });
            [[x0, 1], [x1, -1]].forEach(([x, d], k) => { cd += inkPath([[x + d * 10, ty + 40], [x + d * 16, H * 0.97]], { w: 10, seed: seed + 53 + k, t }); });
            cd += inkPath([[-40, H * 0.97], [W + 40, H * 0.97]], { w: 6, seed: seed + 57, t });
            clothL.setAttribute('d', cd);
            if (P.letters) {
              const la = atOr(cues, P.letters.at, 0), n = P.letters.n ?? 4, from = P.letters.from || [0.2, 0.32, 0.68, 0.8];
              let pf = '', plin = '';
              for (let i = 0; i < n; i++) {
                const st = la + i * 0.3, u = progIO(lt, st, 0.7); if (lt < st) continue;
                const sx = from[i % from.length] * W, sy = H * 0.55, ex = W * 0.5 + (i - n / 2) * 10, ey = ty - 8 - i * 7;
                const x = lerp(sx, ex, u), y = lerp(sy, ey, u) - Math.sin(u * Math.PI) * 90, r = (1 - u) * 0.5 + (i % 2 ? 0.06 : -0.05), fl = u > 0.95 ? 0.3 : 1;
                const pts = [[-66, -44], [66, -44], [66, 44], [-66, 44]].map(([a, b]) => [x + a * Math.cos(r) - b * Math.sin(r) * fl, y + a * Math.sin(r) + b * Math.cos(r) * fl]);
                pf += inkLoop(pts, { seed: seed + 140 + i, t, amp: 0.6, smooth: false }) + ' ';
                plin += inkPath(pts, { w: 4, seed: seed + 150 + i, t, closed: true, smooth: false });
              }
              pileF.setAttribute('d', pf); pileL.setAttribute('d', plin);
            }
          } else if (!desk) {
            // ---- the table
            const ty = H * 0.78, x0 = W * 0.1, x1 = W * 0.9;
            const top = [[x0 + 40, ty - 34], [x1 - 40, ty - 34], [x1, ty + 10], [x0, ty + 10]];
            const hem = []; for (let i = 0; i <= 16; i++) hem.push([lerp(x1, x0, i / 16), H * 0.99 + (i % 2 ? 10 : 0)]);
            const cloth = [[x0, ty + 10], [x1, ty + 10], ...hem];
            clothF.setAttribute('d', inkLoop(top, { seed: seed + 50, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(cloth, { seed: seed + 51, t, amp: 0.8, smooth: false }));
            let cd = inkPath(top, { w: 6, seed: seed + 52, t, closed: true, smooth: false }) + inkPath(cloth, { w: 6, seed: seed + 53, t, closed: true, smooth: false });
            for (let k = 1; k < 8; k++) { const x = lerp(x0, x1, k / 8); cd += inkPath([[x, ty + 20], [x + 6, H * 0.97]], { w: 2.5, seed: seed + 60 + k, t }); }
            clothL.setAttribute('d', cd);
            let dd = '', dl = '', fl = '', gl = '';
            for (let k = 0; k < 7; k++) {
              const x = lerp(x0 + 140, x1 - 140, k / 6), y = ty - 14;
              const pl = inkEllipsePts(x, y, 58, 14, seed + 70 + k, 12);
              dd += inkLoop(pl, { seed: seed + 70 + k, t, amp: 0.5 }) + ' ';
              dl += inkPath(pl, { w: 4, seed: seed + 80 + k, t, closed: true, amp: 0.5 });
              const gx = x + 74, gp = [[gx - 12, y - 64], [gx + 12, y - 64], [gx + 6, y - 22], [gx + 2, y - 4], [gx - 2, y - 4], [gx - 6, y - 22]];
              dl += inkPath(gp, { w: 3.5, seed: seed + 90 + k, t, closed: true, smooth: false }) + inkPath([[gx - 12, y - 2], [gx + 12, y - 2]], { w: 3.5, seed: seed + 95 + k, t });
            }
            if (P.candles !== false) (P.candle_x || [0.06, 0.94]).forEach((u, k) => {
              const x = lerp(x0, x1, u), y = ty - 20, f = 1 + Math.sin(t * 11 + k) * 0.08;
              dl += inkPath([[x, y], [x, y - 80]], { w: 12, seed: seed + 110 + k, t }) + inkPath([[x - 34, y], [x + 34, y]], { w: 6, seed: seed + 112 + k, t });
              fl += inkLoop([[x, y - 120 * f], [x + 10, y - 94], [x, y - 82], [x - 10, y - 94]], { seed: seed + 114 + k, t, amp: 0.6 }) + ' ';
              gl += inkLoop(inkEllipsePts(x, y - 100, 70 * f, 60 * f, seed + 116 + k, 10), { seed: seed + 116 + k, t, amp: 1.5 }) + ' ';
            });
            dish.setAttribute('d', dd); dishL.setAttribute('d', dl); flame.setAttribute('d', fl); glowC.setAttribute('d', gl);
            // foreground chair backs
            let chf = '', chl = '';
            [[W * 0.08, 1], [W * 0.92, -1]].forEach(([x, d], k) => {
              const cb = [[x - 120, H + 40], [x - 110, H * 0.86], [x - 80, H * 0.8], [x + 80, H * 0.8], [x + 110, H * 0.86], [x + 120, H + 40]];
              chf += inkLoop(cb, { seed: seed + 120 + k, t, amp: 1 }) + ' ';
              chl += inkPath(cb, { w: 7, seed: seed + 122 + k, t }) + inkPath([[x - 70, H * 0.88], [x + 70, H * 0.88]], { w: 4, seed: seed + 124 + k, t }) + inkPath([[x - 70, H * 0.95], [x + 70, H * 0.95]], { w: 4, seed: seed + 126 + k, t });
            });
            chairsF.setAttribute('d', chf); chairsL.setAttribute('d', chl);
            if (lampH) lampH.update(t, { x: W * 0.5, top: -20, len: 250, s: 1.2, swing: 0.04 });
            // letters flying onto a pile at the table centre
            if (P.letters) {
              const la = atOr(cues, P.letters.at, 0), n = P.letters.n ?? 5, from = P.letters.from || [0.25, 0.37, 0.63, 0.75, 0.5];
              let pf = '', plin = '';
              for (let i = 0; i < n; i++) {
                const st = la + i * 0.25, u = progIO(lt, st, 0.6); if (lt < st) continue;
                const sx = from[i % from.length] * W, sy = H * 0.6, ex = W * 0.5 + (i - n / 2) * 8, ey = ty - 30 - i * 10;
                const x = lerp(sx, ex, u), y = lerp(sy, ey, u) - Math.sin(u * Math.PI) * 120, r = (1 - u) * 0.6 + (i % 2 ? 0.08 : -0.06);
                const pts = [[-70, -46], [70, -46], [70, 46], [-70, 46]].map(([a, b]) => [x + a * Math.cos(r) - b * Math.sin(r) * (u > 0.95 ? 0.3 : 1), y + a * Math.sin(r) + b * Math.cos(r) * (u > 0.95 ? 0.3 : 1)]);
                pf += inkLoop(pts, { seed: seed + 140 + i, t, amp: 0.6, smooth: false }) + ' ';
                plin += inkPath(pts, { w: 4, seed: seed + 150 + i, t, closed: true, smooth: false });
              }
              pileF.setAttribute('d', pf); pileL.setAttribute('d', plin);
            }
          } else {
            // ---- desk close-up
            const dy = H * 0.5;
            const top = [[-60, dy], [W + 60, dy], [W + 60, H + 40], [-60, H + 40]];
            clothF.setAttribute('d', inkLoop(top, { seed: seed + 50, t, amp: 0.8, smooth: false }));
            clothL.setAttribute('d', inkPath([[-60, dy], [W + 60, dy]], { w: 8, seed: seed + 52, t }));
            let gd = ''; for (let k = 0; k < 7; k++) { const y = dy + 40 + k * 80; gd += inkPath([[-40, y], [W * 0.3, y + 10], [W * 0.7, y - 6], [W + 40, y + 6]], { w: 2.5, seed: seed + 60 + k, t }); }
            grain.setAttribute('d', gd);
            // paper
            const a = ROT * Math.PI / 180, R = (x, y) => [PX + x * Math.cos(a) - y * Math.sin(a), PY + x * Math.sin(a) + y * Math.cos(a)];
            const sheet = [R(-PW / 2, -PH / 2), R(PW / 2, -PH / 2), R(PW / 2, PH / 2), R(-PW / 2, PH / 2)];
            paperF.setAttribute('d', inkLoop(sheet, { seed: seed + 160, t, amp: 0.8, smooth: false }));
            let pl = inkPath(sheet, { w: 5, seed: seed + 161, t, closed: true, smooth: false });
            for (let k = 0; k < 3; k++) { const yy = -PH / 2 + 205 + k * 120; pl += inkPath([R(-PW / 2 + 60, yy), R(PW / 2 - 60, yy)], { w: 2, seed: seed + 162 + k, t, amp: 0.6 }); }
            paperL.setAttribute('d', pl);
            textG.setAttribute('transform', `translate(${f1(PX)} ${f1(PY)}) rotate(${ROT})`);
            if (head) { head.setAttribute('x', 0); head.setAttribute('y', -PH / 2 + 80); }
            let penAt = null;
            lay.forEach(({ o, ln, x }, i) => {
              const at = atOr(cues, o.w.at, 0.3 + i * 0.5), wd = P.write_dur ?? 0.5, u = clamp01((lt - at) / wd);
              const x0 = -lineW[ln] / 2 + x, y0 = -PH / 2 + 190 + ln * 120;
              o.tx.setAttribute('x', f1(x0)); o.tx.setAttribute('y', f1(y0));
              if (lt < at) { o.tx.style.display = 'none'; return; }
              o.tx.style.display = '';
              o.tx.setAttribute('clip-path', '');
              o.tx.style.clipPath = `inset(-60px ${f1((1 - u) * 100)}% -60px -10px)`;
              penAt = R(x0 + o.wd * u, y0 - 10);
            });
            // pen follows the writing
            const pp = penAt || R(-PW / 2 + 120, -PH / 2 + 130), jig = Math.sin(t * 30) * 4;
            const tip = [pp[0] + 6, pp[1] + jig], end = [tip[0] + 190, tip[1] - 320];
            pen.f.setAttribute('d', inkLoop([[tip[0], tip[1]], [tip[0] + 22, tip[1] - 46], [end[0] + 10, end[1] + 4], [end[0] - 6, end[1] - 6], [tip[0] + 6, tip[1] - 50]], { seed: seed + 170, t, amp: 0.6, smooth: false }));
            pen.l.setAttribute('d', inkPath([tip, [tip[0] + 22, tip[1] - 46], [end[0] + 10, end[1] + 4], [end[0] - 6, end[1] - 6], [tip[0] + 6, tip[1] - 50], tip], { w: 4, seed: seed + 171, t, smooth: false })
              + inkPath([[end[0] - 4, end[1]], [end[0] + 40, end[1] - 110], [end[0] + 70, end[1] - 60]], { w: 4, seed: seed + 172, t }));
            // desk lamp (left) + inkwell (right)
            const lx = W * 0.13, ly = dy + 120, fl2 = 1 + Math.sin(t * 12) * 0.06;
            deskLamp.glow.forEach((g, k) => g.setAttribute('d', inkLoop(inkEllipsePts(lx, ly - 220, (170 + k * 90) * fl2, (150 + k * 80) * fl2, seed + 180 + k, 12), { seed: seed + 180 + k, t, amp: 2 })));
            const lb = [[lx - 90, ly], [lx - 60, ly - 70], [lx + 60, ly - 70], [lx + 90, ly]], ch = inkEllipsePts(lx, ly - 190, 46, 110, seed + 185, 12);
            deskLamp.f.setAttribute('d', inkLoop(lb, { seed: seed + 183, t, amp: 0.6 }) + ' ' + inkLoop(ch, { seed: seed + 184, t, amp: 0.6 }));
            deskLamp.fl.setAttribute('d', inkLoop([[lx, ly - 250 * fl2], [lx + 16, ly - 180], [lx, ly - 160], [lx - 16, ly - 180]], { seed: seed + 186, t, amp: 0.6 }));
            deskLamp.l.setAttribute('d', inkPath(lb, { w: 6, seed: seed + 187, t, closed: true }) + inkPath(ch, { w: 5, seed: seed + 188, t, closed: true }));
            const ix = W * 0.88, iy = dy + 150, wp = [[ix - 60, iy], [ix - 70, iy - 70], [ix - 30, iy - 96], [ix + 30, iy - 96], [ix + 70, iy - 70], [ix + 60, iy]];
            well.f.setAttribute('d', inkLoop(wp, { seed: seed + 190, t, amp: 0.6 }));
            well.l.setAttribute('d', inkPath(wp, { w: 5, seed: seed + 191, t, closed: true }));
          }
          if (labels) labels.update(lt, t, cues);
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
