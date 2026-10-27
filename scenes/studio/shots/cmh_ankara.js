// cmh_ankara: Ankara in 1923 from the street (02-cumhuriyetin-ilani-1923), over the scene's "set" (city / night / hills).
//   "town"   — the citadel walls and towers on the hill, flat-roofed mud-brick houses climbing the slope, a minaret,
//              poplars, a dirt road with telegraph poles and an ox cart creaking past.
//   "meclis" — the first Assembly building: a two-storey stone hall with arched windows, a flag on the roof, steps
//              and a sign over the door (sign text appears on a cue).
//   "kosk"   — the Çankaya mansion on its hill: a two-storey house with a small tower, poplars, lit windows at night.
// Night: windows glow, a cannon on the ridge can fire salvoes (flash + smoke) while a counter climbs to 101.
// P: {mode: "town"|"meclis"|"kosk", night: false, gy: 900 (ground line), cart: true, poles: true,
//     cannon: {at: cue, x: 0.82, y: 0.62, shots: 6}, counter: {to: 101, at: cue, dur: 3, x: 0.3, y: 0.3},
//     sign: {text, at}, cast: [CMH cast entries], crowd: {at: cue, n: 9} (heads gathering at the foot of the steps),
//     labels: [MCB label entries]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cmh_ankara = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CMH, { atOr, f1 } = C;
      const mode = P.mode || 'town', night = !!P.night, GY = P.gy ?? 900;
      const root = el(svg, 'g');
      const farG = el(root, 'g'), midG = el(root, 'g'), roadG = el(root, 'g'), castG = el(root, 'g'), frontG = el(root, 'g'), labG = el(root, 'g');
      const hillF = inkEl(farG, INK.paperDark, { 'fill-opacity': 0.8 }), hillL = inkEl(farG, INK.inkSoft);
      const wallF = inkEl(farG, INK.paperLight), wallL = inkEl(farG, INK.ink);
      const houseF = inkEl(midG, INK.paperLight), roofF = inkEl(midG, INK.stain), houseL = inkEl(midG, INK.ink);
      const winF = inkEl(midG, night ? INK.gold : INK.inkSoft, { 'fill-opacity': night ? 0.95 : 0.8 }), winGlow = inkEl(midG, INK.gold, { 'fill-opacity': night ? 0.18 : 0 });
      const flagF = inkEl(midG, INK.red), flagM = inkEl(midG, INK.paperLight), flagCut = inkEl(midG, INK.red), flagL = inkEl(midG, INK.ink);
      const treeF = inkEl(midG, INK.green, { 'fill-opacity': night ? 0.45 : 0.7 }), treeL = inkEl(midG, INK.ink);
      const smokeF = inkEl(midG, INK.paperLight, { 'fill-opacity': 0.9 }), smokeL = inkEl(midG, INK.inkSoft), flash = inkEl(midG, INK.gold), gunL = inkEl(midG, INK.ink);
      const roadF = inkEl(roadG, INK.stain, { 'fill-opacity': 0.5 }), roadL = inkEl(roadG, INK.ink), poleL = inkEl(roadG, INK.ink), wire = inkEl(roadG, INK.inkSoft);
      const cartF = inkEl(roadG, INK.stain), cartW = inkEl(roadG, INK.paperLight), cartL = inkEl(roadG, INK.ink);
      const cast = P.cast ? C.cast(castG, P.cast, W, H, seed * 3 + 7) : null;
      const crowd = P.crowd ? Array.from({ length: P.crowd.n ?? 9 }, (_, i) => C.bust(frontG, { hat: ['kalpak', 'fes', 'sarik', 'fes', 'kalpak'][i % 5], seed: seed * 5 + i * 7 + 1 })) : null;
      const groundF = inkEl(frontG, INK.paperDark, { 'fill-opacity': 0.7 }), groundL = inkEl(frontG, INK.ink), stones = inkEl(frontG, INK.inkSoft);
      const signG = P.sign ? el(labG, 'g') : null;
      const signF = signG ? inkEl(signG, INK.paperLight) : null, signL = signG ? inkEl(signG, INK.ink) : null;
      const signT = signG ? el(signG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': P.sign.size || 74, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: P.sign.color === 'ink' ? INK.ink : INK.red }) : null;
      if (signT) signT.textContent = P.sign.text;
      const ctr = P.counter ? el(labG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': P.counter.size || 170, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red }) : null;
      const ctrBox = ctr ? { f: inkEl(labG, INK.paperLight), l: inkEl(labG, INK.ink) } : null;
      if (ctrBox) { labG.appendChild(ctr); }
      const ctrCap = P.counter && P.counter.caption ? el(labG, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': 56, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }) : null;
      if (ctrCap) ctrCap.textContent = P.counter.caption;
      const labels = P.labels ? C.labels(labG, P.labels, W, H, seed * 9) : null;

      const box = (x0, y0, x1, y1) => [[x0, y1], [x0, y0], [x1, y0], [x1, y1]];
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          let hf = '', hl = '', wf = '', wl = '', ff = '', rf = '', ll = '', wi = '', wg = '', tf = '', tl = '';
          const window_ = (x, y, w, h, k) => { wi += inkLoop(box(x - w / 2, y - h / 2, x + w / 2, y + h / 2), { seed: seed + 900 + k, t, amp: 0.5, smooth: false }) + ' ';
            ll += inkPath(box(x - w / 2, y - h / 2, x + w / 2, y + h / 2), { w: 4, seed: seed + 950 + k, t, closed: true, smooth: false });
            if (night) wg += inkLoop(inkEllipsePts(x, y, w * 1.2, h * 1.0, seed + 990 + k, 8), { seed: seed + 990 + k, t, amp: 1 }) + ' '; };
          const poplar = (x, y, h, k) => { const sw = Math.sin(t * 1.2 + k) * 6; const pts = [[x, y - h], [x + 34 + sw * 0.5, y - h * 0.6], [x + 30, y - 40], [x - 30, y - 40], [x - 34 + sw * 0.5, y - h * 0.6]];
            tf += inkLoop(pts, { seed: seed + 800 + k, t, amp: 1 }) + ' '; tl += inkPath(pts, { w: 4, seed: seed + 820 + k, t, closed: true }) + inkPath([[x, y], [x, y - 60]], { w: 7, seed: seed + 840 + k, t }); };
          if (mode === 'town') {
            // hill + citadel
            const hp = [[W * 0.32, GY - 120], [W * 0.45, GY - 330], [W * 0.56, GY - 520], [W * 0.7, GY - 560], [W * 0.84, GY - 500], [W + 60, GY - 330], [W + 60, GY], [W * 0.32, GY]];
            hillF.setAttribute('d', inkLoop(hp, { seed: seed + 1, t, amp: 1 }));
            hillL.setAttribute('d', inkPath(hp.slice(0, 6), { w: 5, seed: seed + 2, t }));
            const cw = [[W * 0.55, GY - 520], [W * 0.55, GY - 600], [W * 0.84, GY - 590], [W * 0.84, GY - 500]];
            wf += inkLoop(cw.concat([[W * 0.7, GY - 540]]), { seed: seed + 3, t, amp: 1, smooth: false });
            wl += inkPath(cw, { w: 6, seed: seed + 4, t, smooth: false });
            [0.56, 0.62, 0.69, 0.76, 0.83].forEach((u, k) => { const x = W * u, y0 = GY - 680 + (k % 2) * 20; const tw = box(x - 34, y0, x + 34, GY - 540);
              wf += ' ' + inkLoop(tw, { seed: seed + 10 + k, t, amp: 0.8, smooth: false }); wl += inkPath(tw, { w: 6, seed: seed + 20 + k, t, closed: true, smooth: false });
              for (let m = 0; m < 3; m++) wl += inkPath(box(x - 34 + m * 26, y0 - 18, x - 22 + m * 26, y0), { w: 4, seed: seed + 30 + k * 3 + m, t, smooth: false }); });
            // minaret
            const mx = W * 0.4, my = GY - 200;
            const mn = [[mx - 18, my], [mx - 18, my - 330], [mx - 30, my - 340], [mx + 30, my - 340], [mx + 18, my - 330], [mx + 18, my]];
            hf += inkLoop(mn, { seed: seed + 40, t, amp: 0.6, smooth: false }) + ' ' + inkLoop([[mx - 18, my - 340], [mx, my - 420], [mx + 18, my - 340]], { seed: seed + 41, t, amp: 0.6, smooth: false }) + ' ';
            hl += inkPath(mn, { w: 5, seed: seed + 42, t, smooth: false }) + inkPath([[mx - 18, my - 340], [mx, my - 420], [mx + 18, my - 340]], { w: 5, seed: seed + 43, t, smooth: false });
            // houses climbing the slope
            const houses = [[0.36, 0, 1], [0.47, 60, 0.9], [0.55, 150, 0.8], [0.64, 230, 0.75], [0.74, 260, 0.72], [0.86, 200, 0.75], [0.95, 130, 0.85], [0.6, 40, 1.05], [0.78, 60, 1.0], [0.92, 20, 1.1], [0.5, -10, 1.15]];
            houses.forEach(([u, lift, s], k) => {
              const x = W * u, y = GY - 60 - lift, w = 190 * s, h = 120 * s;
              const b = box(x - w / 2, y - h, x + w / 2, y); hf += inkLoop(b, { seed: seed + 50 + k, t, amp: 0.8, smooth: false }) + ' ';
              hl += inkPath(b, { w: 5, seed: seed + 70 + k, t, closed: true, smooth: false });
              const roof = [[x - w / 2 - 14, y - h], [x + w / 2 + 14, y - h], [x + w / 2 + 6, y - h - 22 * s], [x - w / 2 - 6, y - h - 22 * s]];
              rf += inkLoop(roof, { seed: seed + 90 + k, t, amp: 0.6, smooth: false }) + ' '; hl += inkPath(roof, { w: 4, seed: seed + 110 + k, t, closed: true, smooth: false });
              window_(x - w * 0.22, y - h * 0.55, 30 * s, 36 * s, k * 2); window_(x + w * 0.22, y - h * 0.55, 30 * s, 36 * s, k * 2 + 1);
            });
            poplar(W * 0.3, GY - 40, 300, 1); poplar(W * 0.68, GY - 40, 260, 2); poplar(W * 0.98, GY - 30, 330, 3);
          } else if (mode === 'meclis') {
            // first Assembly building (two storeys, hipped roof, arched windows, central door, steps)
            const x0 = W * 0.36, x1 = W * 0.98, y0 = GY - 520, y1 = GY - 40;
            const b = box(x0, y0, x1, y1);
            hf += inkLoop(b, { seed: seed + 50, t, amp: 0.8, smooth: false }) + ' ';
            hl += inkPath(b, { w: 7, seed: seed + 51, t, closed: true, smooth: false }) + inkPath([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]], { w: 5, seed: seed + 52, t });
            const roof = [[x0 - 30, y0], [x1 + 30, y0], [x1 - 60, y0 - 110], [x0 + 60, y0 - 110]];
            rf += inkLoop(roof, { seed: seed + 53, t, amp: 0.8, smooth: false }) + ' '; hl += inkPath(roof, { w: 6, seed: seed + 54, t, closed: true, smooth: false });
            for (let k = 0; k < 7; k++) { const x = lerp(x0 + 70, x1 - 70, k / 6); if (k === 3) continue; window_(x, y0 + 120, 56, 110, k); window_(x, y1 - 130, 56, 110, k + 10); }
            // door + steps
            const dx = (x0 + x1) / 2, door = [[dx - 70, y1], [dx - 70, y1 - 170], [dx, y1 - 220], [dx + 70, y1 - 170], [dx + 70, y1]];
            rf += inkLoop(door, { seed: seed + 55, t, amp: 0.6, smooth: false }) + ' '; hl += inkPath(door, { w: 6, seed: seed + 56, t, smooth: false });
            for (let k = 0; k < 3; k++) hl += inkPath([[dx - 130 - k * 30, y1 + k * 14], [dx + 130 + k * 30, y1 + k * 14]], { w: 5, seed: seed + 57 + k, t });
            window_(dx, y0 + 120, 56, 110, 30);
            // flag on the roof
            const fx = dx, fy = y0 - 260, wv = Math.sin(t * 2.2) * 10;
            hl += inkPath([[fx, y0 - 100], [fx, fy - 10]], { w: 6, seed: seed + 60, t });
            const fp = [[fx, fy], [fx + 90, fy + wv * 0.5], [fx + 180, fy + wv], [fx + 180, fy + 110 + wv], [fx + 90, fy + 110 + wv * 0.5], [fx, fy + 110]];
            flagF.setAttribute('d', inkLoop(fp, { seed: seed + 61, t, amp: 0.6 }));
            flagM.setAttribute('d', inkLoop(inkEllipsePts(fx + 70, fy + 55 + wv * 0.4, 30, 30, seed + 62, 12), { seed: seed + 62, t, amp: 0.4 }) + ' ' + C.star(fx + 120, fy + 55 + wv * 0.6, 18, seed + 63, 0));
            flagCut.setAttribute('d', inkLoop(inkEllipsePts(fx + 80, fy + 55 + wv * 0.4, 24, 24, seed + 64, 12), { seed: seed + 64, t, amp: 0.4 }));
            flagL.setAttribute('d', inkPath(fp, { w: 4, seed: seed + 65, t, closed: true }));
            poplar(W * 0.27, GY - 40, 330, 1); poplar(W * 0.31, GY - 30, 280, 2);
          } else if (mode === 'kosk') {
            const hp = [[-60, GY - 60], [W * 0.3, GY - 200], [W * 0.55, GY - 300], [W * 0.8, GY - 240], [W + 60, GY - 120], [W + 60, GY], [-60, GY]];
            hillF.setAttribute('d', inkLoop(hp, { seed: seed + 1, t, amp: 1 }));
            hillL.setAttribute('d', inkPath(hp.slice(0, 5), { w: 5, seed: seed + 2, t }));
            const x0 = W * 0.42, x1 = W * 0.8, y1 = GY - 270, y0 = y1 - 400;
            const b = box(x0, y0, x1, y1); hf += inkLoop(b, { seed: seed + 50, t, amp: 0.8, smooth: false }) + ' ';
            hl += inkPath(b, { w: 7, seed: seed + 51, t, closed: true, smooth: false }) + inkPath([[x0, (y0 + y1) / 2], [x1, (y0 + y1) / 2]], { w: 4, seed: seed + 52, t });
            const roof = [[x0 - 30, y0], [x1 + 30, y0], [x1 - 60, y0 - 90], [x0 + 60, y0 - 90]];
            rf += inkLoop(roof, { seed: seed + 53, t, amp: 0.8, smooth: false }) + ' '; hl += inkPath(roof, { w: 6, seed: seed + 54, t, closed: true, smooth: false });
            const tx0 = x1 - 170, tx1 = x1 - 30, ty0 = y0 - 200;
            const tw = box(tx0, ty0, tx1, y0 - 60); hf += inkLoop(tw, { seed: seed + 55, t, amp: 0.6, smooth: false }) + ' '; hl += inkPath(tw, { w: 6, seed: seed + 56, t, closed: true, smooth: false });
            const tr = [[tx0 - 20, ty0], [tx1 + 20, ty0], [(tx0 + tx1) / 2, ty0 - 80]]; rf += inkLoop(tr, { seed: seed + 57, t, amp: 0.6, smooth: false }) + ' '; hl += inkPath(tr, { w: 5, seed: seed + 58, t, closed: true, smooth: false });
            window_((tx0 + tx1) / 2, ty0 + 70, 50, 60, 40);
            for (let k = 0; k < 5; k++) { const x = lerp(x0 + 70, x1 - 70, k / 4); window_(x, y0 + 100, 60, 100, k); window_(x, y1 - 100, 60, 100, k + 10); }
            poplar(W * 0.36, GY - 230, 320, 1); poplar(W * 0.86, GY - 200, 340, 2); poplar(W * 0.9, GY - 180, 290, 3); poplar(W * 0.33, GY - 210, 260, 4);
          }
          houseF.setAttribute('d', hf); roofF.setAttribute('d', rf); houseL.setAttribute('d', hl + ll);
          wallF.setAttribute('d', wf); wallL.setAttribute('d', wl);
          winF.setAttribute('d', wi); winGlow.setAttribute('d', wg);
          treeF.setAttribute('d', tf); treeL.setAttribute('d', tl);
          // cannon salvoes on the ridge
          if (P.cannon) {
            const ca = atOr(cues, P.cannon.at, 0), cx = (P.cannon.x ?? 0.18) * W, cy = (P.cannon.y ?? 0.76) * H, n = P.cannon.shots ?? 6, gap = P.cannon.gap ?? 0.7;
            let sm = '', sl = '', fl = '';
            let recoil = 0;
            for (let i = 0; i < n; i++) {
              const st = ca + i * gap; if (lt < st) continue;
              const age = lt - st; recoil = Math.max(recoil, Math.exp(-age * 8));
              if (age < 0.18) fl += C.star(cx + 120, cy - 50, 70 + age * 200, seed + 500 + i, t) + ' ';
              for (let k = 0; k < 3; k++) { const a2 = age - k * 0.15; if (a2 < 0 || a2 > 2.6) continue;
                const r = 26 + a2 * 22, x = cx + 150 + a2 * 60 + k * 34, y = cy - 66 - a2 * 40 - k * 18, sdk = seed + 520 + i * 5 + k;
                sm += C.puff(x, y, r, sdk, t) + ' '; sl += inkPath(C.puffPts(x, y, r, sdk), { w: 3.5, seed: sdk + 40, t, closed: true }); }
            }
            smokeF.setAttribute('d', sm); smokeL.setAttribute('d', sl); flash.setAttribute('d', fl);
            const rc = -recoil * 20;
            const barrel = [[cx - 60 + rc, cy - 30], [cx + 120 + rc, cy - 62], [cx + 124 + rc, cy - 40], [cx - 56 + rc, cy - 4]];
            gunL.setAttribute('d', inkPath(barrel, { w: 14, seed: seed + 580, t, closed: true, smooth: false }) + inkPath(inkEllipsePts(cx + rc, cy, 40, 40, seed + 581, 12), { w: 8, seed: seed + 582, t, closed: true })
              + inkPath([[cx - 40 + rc, cy], [cx + 40 + rc, cy]], { w: 5, seed: seed + 583, t }) + inkPath([[cx + rc, cy - 40], [cx + rc, cy + 40]], { w: 5, seed: seed + 584, t }));
          }
          // road + poles + cart
          const rd = [[-60, GY - 10], [W + 60, GY - 30], [W + 60, H + 40], [-60, H + 40]];
          roadF.setAttribute('d', inkLoop(rd, { seed: seed + 600, t, amp: 1 }));
          roadL.setAttribute('d', inkPath([[-60, GY - 10], [W * 0.5, GY - 22], [W + 60, GY - 30]], { w: 6, seed: seed + 601, t }));
          if (P.poles !== false) {
            let pl = '', wr = '';
            const ps = [0.12, 0.42, 0.72, 1.0].map(u => [u * W, GY - 20]);
            ps.forEach(([x, y], k) => { pl += inkPath([[x, y], [x + 4, y - 360]], { w: 9, seed: seed + 610 + k, t }) + inkPath([[x - 40, y - 330], [x + 44, y - 330]], { w: 6, seed: seed + 620 + k, t }); });
            for (let k = 0; k < ps.length - 1; k++) { const a = ps[k], b = ps[k + 1]; wr += inkPath([[a[0] + 4, a[1] - 330], [(a[0] + b[0]) / 2, a[1] - 300 + Math.sin(t * 1.5 + k) * 3], [b[0] + 4, b[1] - 330]], { w: 3, seed: seed + 630 + k, t }); }
            poleL.setAttribute('d', pl); wire.setAttribute('d', wr);
          }
          if (P.cart) {
            const sp = P.cart.speed ?? 60, x = ((P.cart.x ?? 0.1) * W + lt * sp), y = GY + 40, rot = lt * sp / 46;
            const bed = [[x - 120, y - 70], [x + 110, y - 70], [x + 120, y - 120], [x - 130, y - 120]];
            cartF.setAttribute('d', inkLoop(bed, { seed: seed + 640, t, amp: 0.8, smooth: false }));
            const wh = [inkEllipsePts(x - 70, y - 40, 46, 46, seed + 641, 12), inkEllipsePts(x + 70, y - 40, 46, 46, seed + 642, 12)];
            cartW.setAttribute('d', wh.map(w => inkLoop(w, { seed: seed + 643, t, amp: 0.6 })).join(' '));
            let cl = inkPath(bed, { w: 6, seed: seed + 644, t, closed: true, smooth: false }) + wh.map((w, k) => inkPath(w, { w: 6, seed: seed + 645 + k, t, closed: true })).join('');
            [-70, 70].forEach((dx, k) => { for (let s = 0; s < 3; s++) { const a = rot + s * Math.PI / 3; cl += inkPath([[x + dx - Math.cos(a) * 44, y - 40 - Math.sin(a) * 44], [x + dx + Math.cos(a) * 44, y - 40 + Math.sin(a) * 44]], { w: 3.5, seed: seed + 650 + k * 3 + s, t }); } });
            // the ox
            const ox = x + 260, bob = Math.sin(lt * 4) * 4;
            const body = [[ox - 110, y - 70], [ox - 110, y - 150 + bob], [ox + 70, y - 150 + bob], [ox + 80, y - 70]];
            const headO = [[ox + 70, y - 145 + bob], [ox + 140, y - 130 + bob], [ox + 160, y - 90 + bob], [ox + 135, y - 78 + bob], [ox + 80, y - 100 + bob]];
            cartF.setAttribute('d', cartF.getAttribute('d') + ' ' + inkLoop(body, { seed: seed + 660, t, amp: 0.8 }) + ' ' + inkLoop(headO, { seed: seed + 664, t, amp: 0.6 }));
            cl += inkPath(body, { w: 6, seed: seed + 661, t, closed: true }) + inkPath(headO, { w: 5, seed: seed + 665, t, closed: true })
              + inkPath([[ox + 100, y - 140 + bob], [ox + 86, y - 182 + bob], [ox + 112, y - 196 + bob]], { w: 7, seed: seed + 662, t }) + inkPath([[ox + 124, y - 136 + bob], [ox + 140, y - 176 + bob], [ox + 166, y - 182 + bob]], { w: 7, seed: seed + 666, t })
              + inkDot(ox + 128, y - 116 + bob, 5, 5, seed + 667, t) + inkPath([[ox - 110, y - 140 + bob], [ox - 140, y - 100 + bob]], { w: 5, seed: seed + 668, t });
            for (let k = 0; k < 4; k++) { const lx = ox - 90 + k * 48 + (k > 1 ? 30 : 0), ph = Math.sin(lt * 4 + k * 1.6) * 12; cl += inkPath([[lx, y - 76], [lx + ph, y - 6]], { w: 12, seed: seed + 663 + k, t }); }
            cl += inkPath([[x + 120, y - 100], [ox - 100, y - 120 + bob]], { w: 6, seed: seed + 670, t });
            cartL.setAttribute('d', cl);
          }
          if (cast) cast.update(lt, t, cues);
          if (crowd) {
            const ca = atOr(cues, P.crowd.at, 0);
            crowd.forEach((b, i) => { const st = ca + i * 0.15, u = prog(lt, st, 0.7), x = W * (0.42 + i * 0.065), y = H + 60 - u * 150;
              b.update(t, { x, y, s: 1.05, back: true, turn: Math.sin(t * 0.7 + i) * 0.4, cheer: P.crowd.cheer ? prog(lt, atOr(cues, P.crowd.cheer, 1e9) + i * 0.08, 0.3) : 0 }); });
          }
          // foreground ground strip with stones
          const gp = [[-60, GY + 90], [W * 0.5, GY + 80], [W + 60, GY + 96], [W + 60, H + 40], [-60, H + 40]];
          groundF.setAttribute('d', inkLoop(gp, { seed: seed + 700, t, amp: 1 }));
          groundL.setAttribute('d', inkPath(gp.slice(0, 3), { w: 5, seed: seed + 701, t }));
          let st = ''; for (let k = 0; k < 14; k++) { const q = rng(seed + 710 + k), x = q() * W, y = GY + 110 + q() * 70; st += inkLoop(inkEllipsePts(x, y, 14 + q() * 16, 7 + q() * 5, seed + 720 + k, 8), { seed: seed + 720 + k, t, amp: 0.6 }) + ' '; }
          stones.setAttribute('d', st);
          // sign over the door / counter
          if (signG) {
            const sa = atOr(cues, P.sign.at, 0); if (lt < sa) signG.style.display = 'none'; else {
              signG.style.display = '';
              const p = spring(lt, sa, 0.5), x = (P.sign.x ?? 0.67) * W, y = (P.sign.y ?? (GY - 330) / H) * H;
              let w = 200; try { w = signT.getComputedTextLength() / 2 + 46; } catch (e) {}
              signG.setAttribute('transform', `translate(${f1(x)} ${f1(y - (1 - p) * 40)}) rotate(${f1(Math.sin(t * 1.6) * 2)})`);
              const bp = box(-w, -60, w, 60); signF.setAttribute('d', inkLoop(bp, { seed: seed + 750, t, amp: 0.8, smooth: false }));
              signL.setAttribute('d', inkPath(bp, { w: 7, seed: seed + 751, t, closed: true, smooth: false }) + inkPath([[-w * 0.6, -60], [-w * 0.5, -130]], { w: 4, seed: seed + 752, t }) + inkPath([[w * 0.6, -60], [w * 0.5, -130]], { w: 4, seed: seed + 753, t }));
            }
          }
          if (ctr) {
            const c = P.counter, ca = atOr(cues, c.at, 0), u = prog(lt, ca, c.dur ?? 3);
            if (lt < ca) { ctr.style.display = 'none'; ctrBox.f.setAttribute('d', ''); ctrBox.l.setAttribute('d', ''); if (ctrCap) ctrCap.style.display = 'none'; }
            else {
              const n = Math.round((c.to ?? 101) * u), pk = punch(lt, ca + (c.dur ?? 3), 0.6), x = (c.x ?? 0.3) * W, y = (c.y ?? 0.32) * H, s = 1 + 0.1 * pk;
              ctr.style.display = ''; ctr.textContent = String(n); ctr.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
              const bp = box(x - 190 * s, y - 120 * s, x + 190 * s, y + (ctrCap ? 170 : 110) * s);
              ctrBox.f.setAttribute('d', inkLoop(bp, { seed: seed + 760, t, amp: 1, smooth: false }));
              ctrBox.l.setAttribute('d', inkPath(bp, { w: 7, seed: seed + 761, t, closed: true, smooth: false }));
              if (ctrCap) { ctrCap.style.display = ''; ctrCap.setAttribute('x', f1(x)); ctrCap.setAttribute('y', f1(y + 120 * s)); }
            }
          }
          if (labels) labels.update(lt, t, cues);
        },
      };
    },
  };
})();
