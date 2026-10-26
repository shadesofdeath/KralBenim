// ist09_akce: an Ottoman treasury desk in close-up, in parchment ink (brand/kit/BRAND.md §3, §5): a big open register
// (defter) on a low wooden table, its pages filling with lines of ink as a reed pen moves across them; silver akçe coins
// (small, uneven, stamped) drop one by one onto a growing stack beside an open cloth purse; an ink pot. A hand-lettered
// stamp lands on the cue. Built for 11-istanbul-depremi-1509 (the 22-akçe household levy), parametric for any tax/levy.
// Needs ist09__lib.js (IST9) and mcB__lib.js (MCB). Every line boils at 8 Hz; pure function of (seed, lt).
//
// SHOTS.ist09_akce P: {
//   table: 0.6 (0..1 H: table top front edge), coins: 22 (coins that drop), coin_at: cue|s (first coin), coin_every: 0.12,
//   write_at: cue|s (the pen starts writing), lines: 7 (per page),
//   counter: {at, to: 22, x: 0.74, y: 0.27, size: 150, suffix: ""} (a big Fraunces number counting up with the coins) | false,
//   cast: [...MCB cast], labels: [...MCB labels]
// }
// Close-up targets (portrait 1080×1920, defaults): coin stack ≈ [800, 1000], register ≈ [420, 930].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.ist09_akce = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.IST9, M = window.MCB, { atOr, arc, rect } = L;
      const S = Math.min(W, H) / 1080 * (H > W ? 1 : 0.62);
      const sd = (seed || 1) * 3 + 2201, r = rng(sd);
      const TY = H * (P.table ?? 0.6);
      const root = el(svg, 'g'), sh = L.Shapes();

      // table: perspective top + front apron with carved arches
      const tTop = TY - 260 * S;
      sh.add(root, [[-40, TY], [W + 40, TY], [W + 40, tTop + 40 * S], [-40, tTop + 40 * S]], { fill: INK.stain, fop: 0.55, stroke: INK.ink, w: 6 });
      for (let k = 0; k < 9; k++) sh.add(root, [[k * W / 8 - 30 * S, tTop + 60 * S + k * 3 * S], [k * W / 8 + 70 * S, tTop + 64 * S + k * 3 * S]], { stroke: INK.ink, w: 2, closed: false, sop: 0.4 });
      const AH = (P.apron ?? 340) * S;
      sh.add(root, rect(-40, TY, W + 40, TY + AH), { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 6 });
      for (let x = 20 * S, k = 0; x < W; x += 180 * S, k++) {
        sh.add(root, [[x, TY + AH - 20 * S], [x, TY + 70 * S], [x + 70 * S, TY + 30 * S], [x + 140 * S, TY + 70 * S], [x + 140 * S, TY + AH - 20 * S]], { stroke: INK.ink, w: 4, smooth: false, fill: INK.paperDark, fop: 0.35 });
        sh.add(root, inkEllipsePts(x + 70 * S, TY + AH * 0.55, 30 * S, 30 * S, sd + 500 + k, 10), { stroke: INK.gold, w: 4 });
      }

      // register
      const bx = W * 0.34, by = TY - 130 * S, pw = 250 * S, ph = 230 * S, tilt = 0.12;
      const page = (sx) => [[bx, by + 10 * S], [bx + sx * pw, by - ph * tilt * sx * 0 + 0], [bx + sx * pw - 20 * S * sx, by - ph], [bx, by - ph + 20 * S]];
      sh.add(root, [[bx - pw - 14 * S, by + 16 * S], [bx + pw + 14 * S, by + 16 * S], [bx + pw + 8 * S, by - ph + 8 * S], [bx - pw - 8 * S, by - ph + 8 * S]], { fill: INK.red, fop: 0.65, stroke: INK.ink, w: 5 });
      for (const sx of [-1, 1]) sh.add(root, [[bx, by + 6 * S], [bx + sx * pw, by], [bx + sx * (pw - 6 * S), by - ph], [bx, by - ph + 16 * S]], { fill: INK.paperLight, stroke: INK.ink, w: 5, smooth: false });
      sh.add(root, [[bx, by + 6 * S], [bx, by - ph + 16 * S]], { stroke: INK.ink, w: 4, closed: false });
      for (const sx of [-1, 1]) sh.add(root, rect(bx + sx * 40 * S, by - ph + 30 * S, bx + sx * (pw - 40 * S), by - ph + 60 * S).map(p => p), { stroke: INK.red, w: 3 });
      const nL = P.lines ?? 7, wa = atOr({}, P.write_at, 0.2);
      const lineSlots = [];
      for (const sx of [-1, 1]) for (let k = 0; k < nL; k++) lineSlots.push({ sx, k });
      const lineEls = lineSlots.map(() => inkEl(root, INK.ink, { 'fill-opacity': 0.8 }));
      const pen = el(root, 'g'), penL = inkEl(pen, INK.ink), penF = inkEl(pen, INK.paperDark);
      // ink pot
      const ipx = bx - pw - 70 * S, ipy = TY - 60 * S;
      sh.add(root, [[ipx - 40 * S, ipy], [ipx - 46 * S, ipy - 50 * S], [ipx - 24 * S, ipy - 70 * S], [ipx + 24 * S, ipy - 70 * S], [ipx + 46 * S, ipy - 50 * S], [ipx + 40 * S, ipy]], { fill: INK.blue, fop: 0.7, stroke: INK.ink, w: 5, smooth: true });
      // purse + coin stack
      const cx = W * 0.72, cy = TY - 70 * S;
      sh.add(root, [[cx + 60 * S, cy + 10 * S], [cx + 40 * S, cy - 90 * S], [cx + 90 * S, cy - 130 * S], [cx + 150 * S, cy - 100 * S], [cx + 170 * S, cy + 10 * S]], { fill: INK.green, fop: 0.55, stroke: INK.ink, w: 5, smooth: true });
      sh.add(root, inkEllipsePts(cx + 95 * S, cy - 118 * S, 46 * S, 14 * S, sd + 5, 10), { fill: INK.ink, fop: 0.6, stroke: INK.ink, w: 3 });
      const N = P.coins ?? 22, every = P.coin_every ?? 0.12;
      const coinF = Array.from({ length: N }, () => inkEl(root, INK.paperLight)), coinL = Array.from({ length: N }, () => inkEl(root, INK.ink)), coinM = Array.from({ length: N }, () => inkEl(root, INK.inkSoft));
      const ctr = P.counter === false ? null : Object.assign({ to: N, x: 0.5, y: 0.3, size: 150, suffix: '' }, P.counter || {});
      const ctrT = ctr ? el(root, 'text', { x: ctr.x * W, y: ctr.y * H, 'font-family': M.FR, 'font-weight': 900, 'font-size': ctr.size * S, 'text-anchor': 'middle', fill: INK.red }) : null;
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      const labs = M.labels(labG, P.labels || [], W, H, sd + 950);

      return {
        update(lt, dur, cues, info) {
          const t = (info && info.t != null) ? info.t : lt;
          // writing: lines appear one after another, the pen tip rides the current line end
          const w0 = atOr(cues, P.write_at, 0.15), per = Math.max(0.25, (dur - w0) / lineSlots.length * 0.9);
          let tip = null;
          lineSlots.forEach(({ sx, k }, i) => {
            const p = clamp01((lt - w0 - i * per) / per);
            const y = by - ph + 90 * S + k * (ph - 110 * S) / nL, x0 = bx + sx * 30 * S, x1 = bx + sx * (pw - 40 * S);
            if (p <= 0) { lineEls[i].setAttribute('d', ''); return; }
            const pts = []; const n = 14;
            for (let j = 0; j <= Math.round(n * p); j++) { const u = j / n; pts.push([lerp(sx < 0 ? x1 : x0, sx < 0 ? x0 : x1, u), y + Math.sin(u * 30 + k) * 4 * S - (j % 3 === 1 ? 5 * S : 0)]); }
            lineEls[i].setAttribute('d', pts.length > 1 ? inkPath(pts, { seed: sd + 30 + i, t, w: 3.5, amp: 0.6 }) : '');
            if (p < 1) tip = pts[pts.length - 1];
          });
          if (tip) {
            const [x, y] = tip, bob = Math.sin(lt * 20) * 3 * S;
            penL.setAttribute('d', inkPath([[x, y + bob], [x + 120 * S, y - 170 * S]], { seed: sd + 60, t, w: 10, amp: 0.8 }));
            penF.setAttribute('d', inkPath([[x + 60 * S, y - 85 * S], [x + 118 * S, y - 166 * S]], { seed: sd + 61, t, w: 6, amp: 0.8 }));
          } else { penL.setAttribute('d', ''); penF.setAttribute('d', ''); }
          // coins
          const c0 = atOr(cues, P.coin_at, 0.3);
          let landed = 0;
          for (let i = 0; i < N; i++) {
            const a = c0 + i * every, u = lt - a;
            if (u < 0) { coinF[i].setAttribute('d', ''); coinL[i].setAttribute('d', ''); coinM[i].setAttribute('d', ''); continue; }
            const col = i % 2, row = Math.floor(i / 2), restY = cy - 8 * S - row * 11 * S, restX = cx - 40 * S + col * 70 * S + ((i * 7) % 5 - 2) * 3 * S;
            const fall = Math.min(1, u / 0.3), y = lerp(restY - 520 * S, restY, fall * fall);
            if (fall >= 1) landed++;
            const ry = fall < 1 ? 26 * S * Math.abs(Math.cos(u * 18)) + 6 * S : 11 * S;
            const pts = inkEllipsePts(restX, y, 34 * S, ry, sd + 100 + i, 12, 0, 0.08);
            coinF[i].setAttribute('d', inkLoop(pts, { seed: sd + 100 + i, t, amp: 0.7 }));
            coinL[i].setAttribute('d', inkPath(pts, { seed: sd + 200 + i, t, w: 3.5, amp: 0.7, closed: true }));
            coinM[i].setAttribute('d', ry > 9 * S ? inkPath([[restX - 14 * S, y], [restX - 4 * S, y - ry * 0.3], [restX + 6 * S, y + ry * 0.2], [restX + 14 * S, y - ry * 0.2]], { seed: sd + 300 + i, t, w: 2.5, amp: 0.5 }) : '');
          }
          if (ctrT) {
            const ca = atOr(cues, ctr.at, c0);
            ctrT.textContent = lt < ca ? '' : fmtNum(Math.round(ctr.to * landed / N)) + ctr.suffix;
            const pk = punch(lt, c0 + N * every + 0.3, 0.6);
            ctrT.setAttribute('transform', `translate(${L.f1(ctr.x * W)} ${L.f1(ctr.y * H)}) scale(${(1 + 0.12 * pk).toFixed(3)}) translate(${L.f1(-ctr.x * W)} ${L.f1(-ctr.y * H)})`);
          }
          sh.update(t, lt);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
