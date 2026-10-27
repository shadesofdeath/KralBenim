// mohac_ridge: a medium shot from the Hungarian line looking up at the escarpment (14-mohac-1526): in the foreground
// the backs of the Hungarian knights (helmets, plumes, a forest of lances and red pennons, swaying), the wet plain in
// between, and the hatched slope where the Ottoman vanguard comes down in a long blue column, guns and banners on top.
// The scene's "set" (field, ground ≈ 1060, horizon ≈ 360) gives the sky; this draws the ridge, the plain and the people.
// P: {open: cue (mode: two blue blocks slide apart and reveal chained guns facing us; fire: cue flashes), down: cue (the column starts down the slope), note: {text, at} (hand-written note, top right, inside the frame),
//     guns: true, cast: [MCB cast]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_ridge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const root = el(svg, 'g');
      const ridgeG = el(root, 'g'), colG = el(root, 'g'), plainG = el(root, 'g'), frontG = el(root, 'g'), labG = el(root, 'g'), castG = el(root, 'g');
      const slopeF = inkEl(ridgeG, mix(INK.paperLight, INK.stain, 0.4)), topF = inkEl(ridgeG, mix(INK.paperLight, INK.green, 0.3)), hach = inkEl(ridgeG, INK.inkSoft), ridgeL = inkEl(ridgeG, INK.ink);
      const colF = inkEl(colG, INK.blue), colL = inkEl(colG, INK.ink), flagF = inkEl(colG, INK.blue);
      const pudF = inkEl(plainG, mix(INK.paperLight, INK.blue, 0.35)), plainL = inkEl(plainG, INK.inkSoft);
      const lanceL = inkEl(frontG, INK.ink), penF = inkEl(frontG, INK.red), helmF = inkEl(frontG, INK.inkSoft), plumeF = inkEl(frontG, INK.red), backF = inkEl(frontG, INK.red), frontL = inkEl(frontG, INK.ink);
      const note = P.note ? (() => { const g = el(labG, 'g'), t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'end', fill: INK.red, stroke: INK.paperLight, 'stroke-width': 12, 'paint-order': 'stroke' }); t.textContent = P.note.text; t.setAttribute('x', W - 140); t.setAttribute('y', 300); return { g, t }; })() : null;
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;
      // "open" mode: two blue blocks in front of the guns slide apart and the gun mouths face the knights
      const OP = P.open != null;
      const gunsG = root.insertBefore(document.createElementNS(NS, 'g'), frontG), gunBody = inkEl(gunsG, INK.inkSoft), gunBore = inkEl(gunsG, INK.ink), gunWheelF = inkEl(gunsG, INK.paperLight), gunL = inkEl(gunsG, INK.ink), janF = inkEl(gunsG, INK.blue), janL = inkEl(gunsG, INK.ink), flashF = inkEl(gunsG, INK.gold);
      const blkG = root.insertBefore(document.createElementNS(NS, 'g'), frontG), blkF = inkEl(blkG, INK.blue), blkL = inkEl(blkG, INK.ink), blkFlag = inkEl(blkG, INK.blue);
      // ridge profile: brow line from left to right, foot line lower
      const brow = x => 400 + 40 * Math.sin(x * 0.004 + 1) + 22 * Math.sin(x * 0.011);
      const foot = x => 640 + 20 * Math.sin(x * 0.006 + 2);

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const B = [], F = [];
          for (let x = -60; x <= W + 60; x += 60) { B.push([x, brow(x)]); F.push([x, foot(x)]); }
          topF.setAttribute('d', inkLoop(B.concat([[W + 60, 300], [-60, 300]]), { seed: seed + 1, t, amp: 0.8 }));
          slopeF.setAttribute('d', inkLoop(B.concat(F.slice().reverse()), { seed: seed + 2, t, amp: 0.8 }));
          let hd = '';
          for (let k = 0; k < 110; k++) { const q = rng(inkHash(seed + 3, k)), x = -40 + (k + q()) / 110 * (W + 80), y0 = brow(x) + 4, L = (foot(x) - brow(x)) * (0.3 + q() * 0.6); hd += inkPath([[x, y0], [x - 8 - q() * 10, y0 + L]], { w: 1.8 + q() * 1.8, seed: seed + 10 + k, t, taper: 0.8 }); }
          for (let k = 0; k < 14; k++) { const q = rng(inkHash(seed + 4, k)), x = q() * W, r = 12 + q() * 10; hd += inkPath(inkEllipsePts(x, brow(x) - r * 0.8, r * 1.3, r, seed + 200 + k, 8), { w: 2.4, seed: seed + 220 + k, t, closed: true }); }
          hach.setAttribute('d', hd);
          ridgeL.setAttribute('d', inkPath(B, { w: 6, seed: seed + 5, t }) + inkPath(F, { w: 3, seed: seed + 6, t }));
          // the Ottoman column: on the brow, then down the slope on "down"
          const da = atOr(cues, P.down, dur * 0.3), dp = clamp01((lt - da) / Math.max(1, dur - da));
          let cf = '', cl = '', ff = '';
          for (let k = 0; k < 40; k++) {
            const q = rng(inkHash(seed + 7, k)), lane = k % 4, along = Math.floor(k / 4) / 10;
            const xs = 1500 - along * 520 + lane * 26, x = xs - dp * 420, ys = brow(xs) - 2, yd = lerp(brow(x), foot(x), clamp01(dp * 1.4 - along * 0.6)) ;
            const y = dp > 0 ? Math.max(ys + (yd - ys) * 1, brow(x) - 2) : ys, s = 0.95 + lane * 0.05;
            const g = M.glyph(k % 7 === 3 ? 'cav' : 'inf', x, y + lane * 6 + Math.abs(Math.sin(t * 8 + k)) * -2, s, seed * 30 + k, t, -1);
            cf += g.f; cl += g.l;
            if (k % 8 === 0) { const fx = x, fy = y - 110 * s, wv = Math.sin(t * 6 + k) * 5; cl += inkPath([[fx, y - 40], [fx, fy]], { w: 3, seed: seed + 300 + k, t }); ff += inkLoop([[fx, fy], [fx - 60, fy + wv], [fx - 56, fy + 32 + wv], [fx, fy + 28]], { seed: seed + 320 + k, t, amp: 0.6 }); }
          }
          if (P.guns !== false) for (let k = 0; k < 9; k++) { const x = 380 + k * 120, y = brow(x) - 2; cl += inkPath([[x - 34, y - 16], [x + 24, y - 24]], { w: 9, seed: seed + 400 + k, t }) + inkPath(inkEllipsePts(x, y - 10, 12, 12, seed + 410 + k, 8), { w: 3, seed: seed + 420 + k, t, closed: true }); }
          if (OP) { cf = ''; cl = ''; ff = ''; }
          colF.setAttribute('d', cf); colL.setAttribute('d', cl); flagF.setAttribute('d', ff);
          if (OP) {
            const oa = atOr(cues, P.open, dur * 0.3), op = progIO(lt, oa, 1.8), fa = atOr(cues, P.fire, null), GYR = 760;
            // guns facing us: barrel ends with dark bores, wheels on both sides; janissaries behind
            let gb = '', bo = '', wf = '', gl = '', jf = '', jl = '', fl = '';
            for (let k = 0; k < 7; k++) {
              const x = 600 + k * 120, y = GYR - (k % 2) * 6;
              const jg = M.glyph('inf', x + 50, y - 40, 1.3, seed * 70 + k, t, -1); jf += jg.f; jl += jg.l;
              gb += inkLoop(inkEllipsePts(x, y - 34, 40, 30, seed + 800 + k, 10), { seed: seed + 800 + k, t, amp: 0.6 });
              bo += inkLoop(inkEllipsePts(x, y - 36, 17, 15, seed + 820 + k, 8), { seed: seed + 820 + k, t, amp: 0.5 });
              gl += inkPath(inkEllipsePts(x, y - 34, 40, 30, seed + 800 + k, 10), { w: 5, seed: seed + 840 + k, t, closed: true }) + inkPath(inkEllipsePts(x, y - 36, 25, 22, seed + 850 + k, 10), { w: 3.5, seed: seed + 860 + k, t, closed: true });
              for (const sx of [-1, 1]) { const wp = inkEllipsePts(x + sx * 52, y - 26, 12, 30, seed + 870 + k * 2 + (sx > 0), 10); wf += inkLoop(wp, { seed: seed + 880 + k, t, amp: 0.5 }); gl += inkPath(wp, { w: 4, seed: seed + 890 + k * 2 + (sx > 0), t, closed: true }); }
              gl += inkPath([[x - 64, y - 2], [x + 64, y - 6]], { w: 4, seed: seed + 900 + k, t });
              if (fa != null && lt >= fa + k * 0.15 && lt < fa + k * 0.15 + 0.2) fl += M.flash(x, y - 36, 60, seed + 910 + k, t, 1);
            }
            for (let k = 0; k < 6; k++) gl += inkPath(inkEllipsePts(660 + k * 120, GYR - 26, 14, 8, seed + 930 + k, 8), { w: 4, seed: seed + 940 + k, t, closed: true });   // chain links between the guns
            gunBody.setAttribute('d', gb); gunBore.setAttribute('d', bo); gunWheelF.setAttribute('d', wf); gunL.setAttribute('d', gl); janF.setAttribute('d', jf); janL.setAttribute('d', jl); flashF.setAttribute('d', fl);
            // the two Rumeli blocks in front, sliding to the sides
            let bf = '', bl = '', bfl = '';
            for (const side of [-1, 1]) {
              const cx = 960 + side * (230 + op * 620);
              for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
                const x = cx + (c - 2.5) * 66 + r * 12 * side, y = 800 + r * 34, g = M.glyph('inf', x, y + Math.abs(Math.sin(t * 7 + c + r)) * -3 * (op > 0 && op < 1 ? 1 : 0.2), 1.55 + r * 0.12, seed * 90 + (side > 0 ? 50 : 0) + r * 10 + c, t, -side);
                bf += g.f; bl += g.l;
              }
              const fx = cx - side * 120, wv = Math.sin(t * 6 + side) * 6;
              bl += inkPath([[fx, 790], [fx, 600]], { w: 5, seed: seed + 960 + side, t }); bfl += inkLoop([[fx, 600], [fx + 90, 606 + wv], [fx + 84, 650 + wv], [fx, 646]], { seed: seed + 970 + side, t, amp: 0.6 });
            }
            blkF.setAttribute('d', bf); blkL.setAttribute('d', bl); blkFlag.setAttribute('d', bfl);
          }
          // plain: puddles and streaks between the ridge foot and the knights
          let pd = '', pl = '';
          for (let k = 0; k < 9; k++) { const q = rng(inkHash(seed + 8, k)), x = q() * W, y = 690 + q() * 180; pd += inkLoop(inkEllipsePts(x, y, 80 + q() * 120, 12 + q() * 10, seed + 500 + k, 10), { seed: seed + 500 + k, t, amp: 0.6 }); }
          for (let k = 0; k < 24; k++) { const q = rng(inkHash(seed + 9, k)), x = q() * W, y = 680 + q() * 220; pl += inkPath([[x, y], [x + 60 + q() * 80, y + 2]], { w: 2.5, seed: seed + 520 + k, t }); }
          pudF.setAttribute('d', pd); plainL.setAttribute('d', pl);
          // foreground: backs of the knights at the bottom edge, lances up, pennons streaming
          let ll = '', pf = '', hf = '', plf = '', bf = '', fl = '';
          for (let k = 0; k < 9; k++) {
            const q = rng(inkHash(seed + 11, k)), x = 60 + k * 225 + q() * 40, y = 1000 + (k % 2) * 40, sw = Math.sin(t * 1.3 + k) * 0.04;
            const hx = x, hy = y - 40, r = 58;
            const back = [[hx - 90, H + 60], [hx - 80, hy + 50], [hx - 40, hy + 30], [hx + 40, hy + 30], [hx + 80, hy + 50], [hx + 90, H + 60]];
            bf += inkLoop(back, { seed: seed + 600 + k, t, amp: 1 }); fl += inkPath(back, { w: 6, seed: seed + 620 + k, t });
            const helm = inkEllipsePts(hx, hy, r, r * 1.05, seed + 640 + k, 12);
            hf += inkLoop(helm, { seed: seed + 640 + k, t, amp: 0.8 }); fl += inkPath(helm, { w: 6, seed: seed + 660 + k, t, closed: true }) + inkPath([[hx - r * 0.9, hy + 6], [hx + r * 0.9, hy + 2]], { w: 4, seed: seed + 670 + k, t });
            plf += inkLoop([[hx - 6, hy - r], [hx - 30 + sw * 300, hy - r - 70], [hx - 70 + sw * 400, hy - r - 60], [hx - 20, hy - r + 4]], { seed: seed + 680 + k, t, amp: 1 });
            const lx = hx + 70, tip = [lx + Math.sin(sw - 0.06) * 760, hy + 40 - Math.cos(sw - 0.06) * 760];
            ll += inkPath([[lx, hy + 120], tip], { w: 7, seed: seed + 700 + k, t, taper: 0.5 });
            const fw = Math.sin(t * 7 + k) * 8;
            pf += inkLoop([[tip[0], tip[1] + 20], [tip[0] - 110, tip[1] + 30 + fw], [tip[0] - 70, tip[1] + 50 + fw * 0.5], [tip[0] - 110, tip[1] + 70 + fw], [tip[0], tip[1] + 60]], { seed: seed + 720 + k, t, amp: 0.8 });
          }
          lanceL.setAttribute('d', ll); penF.setAttribute('d', pf); helmF.setAttribute('d', hf); plumeF.setAttribute('d', plf); backF.setAttribute('d', bf); frontL.setAttribute('d', fl);
          if (note) { const na = atOr(cues, P.note.at, 0.4); note.g.style.display = lt >= na ? '' : 'none'; }
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
