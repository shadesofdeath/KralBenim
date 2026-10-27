// mohac_stream: the Csele stream at nightfall (14-mohac-1526): a swollen creek under a steep muddy bank, reeds in the
// foreground, rain. A rider in a gold caparison tries to climb the bank; on the "fall" cue the horse rears, slides back
// and goes over into the water (it sinks behind the water surface, a splash and rings spread). Mode "after": only the
// rings, a floating plume and a broken lance in the reeds remain.
// Draws its own water and bank (they ARE the subject); the scene's "set" (night/storm) gives the sky behind.
// P: {mode: "climb"|"after", rain: true, fall: cue, rear: cue (the horse rears and stays up, no fall), x: 980 (rider start), water: 790 (surface y), bank: true,
//     helmet: true (floating plume in "after"), flash: cue (lightning bolt), labels: [MCB labels], lance: true (broken lance in the reeds), cast: [MCB cast]}
// cues: fall, cast cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_stream = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const WY = P.water ?? 790, mode = P.mode || 'climb';
      const root = el(svg, 'g');
      const bankG = el(root, 'g'), riderG = el(root, 'g'), waterG = el(root, 'g'), splashG = el(root, 'g'), reedsG = el(root, 'g'), rainG = el(root, 'g'), castG = el(root, 'g');
      const bankF = inkEl(bankG, mix(INK.paperDark, INK.stain, 0.35)), bankH = inkEl(bankG, INK.inkSoft), bankL = inkEl(bankG, INK.ink), grass = inkEl(bankG, INK.inkSoft);
      const farBankF = inkEl(bankG, mix(INK.paperLight, INK.inkSoft, 0.25)), farBankL = inkEl(bankG, INK.inkSoft);
      const rider = mode === 'climb' ? M.rider(el(riderG, 'g'), { side: 'gold', head: 'helm', crown: P.crown !== false, seed: seed * 10 + 1 }) : null;
      const riderWrap = riderG.firstChild;
      const waterF = inkEl(waterG, mix(INK.paperLight, INK.blue, 0.5)), waterL = inkEl(waterG, INK.ink), waterW = inkEl(waterG, INK.blue), waterS = inkEl(waterG, INK.paperLight);
      const spF = inkEl(splashG, INK.paperLight), spL = inkEl(splashG, INK.blue), ringL = inkEl(splashG, INK.ink);
      const plumeF = inkEl(splashG, INK.gold), plumeL = inkEl(splashG, INK.ink), helmF = inkEl(splashG, INK.inkSoft), helmL = inkEl(splashG, INK.ink), lanceL = inkEl(reedsG, INK.ink), lanceP = inkEl(reedsG, INK.gold);
      const reeds = M.reeds(reedsG, P.reeds || [
        { x: 90, y: 1090, h: 360, n: 9, w: 200, lean: 0.15, wd: 7 }, { x: 330, y: 1100, h: 250, n: 6, w: 140, lean: 0.25, wd: 6 },
        { x: 1700, y: 1095, h: 330, n: 8, w: 220, lean: -0.2, wd: 7 }, { x: 1900, y: 1090, h: 400, n: 7, w: 160, lean: -0.1, wd: 7 },
        { x: 640, y: WY + 6, h: 120, n: 5, w: 120, lean: 0.1, wd: 4 }], seed * 7);
      const rainL = inkEl(rainG, INK.inkSoft);
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;
      const labels = P.labels && window.MCB ? window.MCB.labels(castG, P.labels, W, H, seed * 5) : null;
      const boltL = inkEl(rainG, INK.paperLight), boltI = inkEl(rainG, INK.ink);
      // the bank: a steep slope rising from the water to the right
      const bankPts = [[560, WY + 10], [760, WY - 40], [980, WY - 150], [1180, WY - 270], [1360, WY - 330], [2050, WY - 350], [2050, WY + 10]];

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // far (left) bank, low and pale
          const fb = [[-60, WY + 4], [-60, WY - 70], [200, WY - 80], [420, WY - 50], [600, WY - 10], [640, WY + 4]];
          farBankF.setAttribute('d', inkLoop(fb, { seed: seed + 1, t, amp: 0.8 }));
          farBankL.setAttribute('d', inkPath(fb.slice(1, 5), { w: 3.5, seed: seed + 2, t }));
          bankF.setAttribute('d', inkLoop(bankPts, { seed: seed + 3, t, amp: 1 }));
          bankL.setAttribute('d', inkPath(bankPts.slice(0, 6), { w: 6, seed: seed + 4, t }));
          let hd = '', gd = '';
          for (let i = 0; i < 46; i++) {     // hachures down the slope + mud streaks
            const q = rng(inkHash(seed, i + 30)), u = q(), x0 = lerp(620, 1900, u), top = x0 < 1360 ? lerp(WY - 10, WY - 330, (x0 - 560) / 800) : WY - 345;
            const L = 40 + q() * 110; hd += inkPath([[x0, top + 14], [x0 - 18 - q() * 20, Math.min(WY + 4, top + 14 + L)]], { w: 3, seed: seed + 40 + i, t, taper: 0.6 });
            if (i % 2 === 0) { const gx = x0, gy = top; gd += inkPath([[gx, gy], [gx - 6, gy - 22 - q() * 14]], { w: 3, seed: seed + 100 + i, t }) + inkPath([[gx + 6, gy], [gx + 12, gy - 18]], { w: 3, seed: seed + 140 + i, t }); }
          }
          bankH.setAttribute('d', hd); grass.setAttribute('d', gd);
          // rider on the slope, then the fall
          let sinkY = 0;
          if (rider) {
            const fall = atOr(cues, P.fall, dur * 0.5);
            const climb = Math.min(lt, fall);
            const x0 = P.x ?? 900, x = x0 + climb * 26, slopeY = WY - 40 - (x - 760) * 0.55;
            const ra = atOr(cues, P.rear, null), held = ra != null && lt >= ra ? 0.75 * prog(lt, ra, 0.6) + 0.06 * Math.sin(lt * 5) : 0;
            const ft = lt - fall, rear = ft < 0 ? Math.max(held, 0.12 * Math.max(0, Math.sin(lt * 3))) : clamp01(ft / 0.45);
            const back = ft < 0.35 ? 0 : progIO(ft, 0.35, 1.1);
            const tilt = lerp(-28, 62, back), dx = -back * 260, dy = back * (WY + 30 - slopeY) + progIO(ft, 1.6, 3) * 70;   // lands half in the water, then sinks slowly
            sinkY = WY;
            riderWrap.setAttribute('transform', `translate(${f1(dx)} ${f1(dy)}) rotate(${f1(tilt)} ${f1(x)} ${f1(slopeY)})`);
            rider.update(t, { x, y: slopeY, s: 1.05, face: 1, ph: lt * 1.6, gallop: ft < 0 ? 0.8 : Math.max(0, 0.8 - ft * 2), couch: 0, rear: Math.min(1, rear) * (1 - back * 0.5), tumble: back * 0.6 });
            // splash when the horse hits the water
            const st = ft - 1.0;
            let sf = '', sl = '', rl = '';
            const cx = x - 240, cy = WY + 6;
            if (st >= 0) {
              for (let k = 0; k < 9; k++) {
                const q = rng(inkHash(seed + 300, k)), a = -Math.PI * (0.15 + q() * 0.7), v = 380 + q() * 380, tt = st * 1.1;
                const px = cx + Math.cos(a) * v * tt * (k % 2 ? 1 : -1) * 0.6, py = cy + Math.sin(a) * v * tt + 900 * tt * tt;
                if (py < WY + 10) { sf += inkDot(px, py, 12 + q() * 10, 16 + q() * 12, seed + 310 + k, t); sl += inkPath(inkEllipsePts(px, py, 12 + q() * 10, 16 + q() * 12, seed + 310 + k, 8), { w: 3, seed: seed + 320 + k, t, closed: true }); }
              }
              for (let k = 0; k < 3; k++) { const age = st - k * 0.45; if (age < 0) continue; const r = 60 + age * 220; rl += inkPath(inkEllipsePts(cx, WY + 20, r, r * 0.16, seed + 330 + k, 18), { w: Math.max(1.5, 6 - age * 2), seed: seed + 340 + k, t, closed: true }); }
            }
            spF.setAttribute('d', sf); spL.setAttribute('d', sl); ringL.setAttribute('d', rl);
          } else {
            // after: slow rings and a floating plume drifting with the current
            let rl = '';
            const cx = 820 + lt * 18;
            for (let k = 0; k < 3; k++) { const age = ((lt * 0.5 + k / 3) % 1), r = 50 + age * 320; rl += inkPath(inkEllipsePts(cx, WY + 40, r, r * 0.15, seed + 350 + k, 18), { w: Math.max(1.2, 5 * (1 - age)), seed: seed + 360 + k, t, closed: true }); }
            ringL.setAttribute('d', rl); spF.setAttribute('d', ''); spL.setAttribute('d', '');
            if (P.helmet !== false) {
              const bob = Math.sin(t * 2.2) * 5, px = cx, py = WY + 30 + bob;
              const pl = [[px - 70, py], [px - 40, py - 46], [px + 10, py - 60], [px + 60, py - 40], [px + 36, py - 12], [px - 10, py - 20]];
              const helm = [[px - 60, py + 14], [px - 52, py - 30], [px - 14, py - 52], [px + 30, py - 44], [px + 58, py - 10], [px + 62, py + 14]];
              plumeF.setAttribute('d', inkLoop(pl.map(q => [q[0] + 20, q[1] - 40]), { seed: seed + 370, t, amp: 1 }));
              helmF.setAttribute('d', inkLoop(helm, { seed: seed + 373, t, amp: 0.8 }));
              helmL.setAttribute('d', inkPath(helm, { w: 5, seed: seed + 374, t }) + inkPath([[px - 40, py - 10], [px + 50, py - 14]], { w: 4, seed: seed + 375, t }));
              plumeL.setAttribute('d', inkPath(pl.map(q => [q[0] + 20, q[1] - 40]), { w: 4, seed: seed + 371, t, closed: true }));
            }
          }
          // water surface in front (the horse sinks behind it)
          const top = []; for (let k = 0; k <= 24; k++) { const x = -60 + k / 24 * (W + 120); top.push([x, WY + 4 * Math.sin(x * 0.012 + t * 1.5)]); }
          waterF.setAttribute('d', inkLoop(top.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: seed + 5, t, amp: 0.6, smooth: false }));
          waterL.setAttribute('d', inkPath(top, { w: 5, seed: seed + 6, t }));
          let wd = '', ws = '';
          for (let i = 0; i < 30; i++) {
            const q = rng(inkHash(seed, i + 500)), y = WY + 30 + Math.pow(q(), 0.8) * 300, x = ((q() * W + t * (40 + (y - WY) * 0.3)) % (W + 300)) - 150, L = 50 + (y - WY) * 0.4;
            const p = [[x, y], [x + L * 0.5, y - 5], [x + L, y]];
            if (i % 4 === 0) ws += inkPath(p, { w: 4, seed: seed + 520 + i, t }); else wd += inkPath(p, { w: 2.5 + (y - WY) * 0.01, seed: seed + 520 + i, t });
          }
          waterW.setAttribute('d', wd); waterS.setAttribute('d', ws);
          reeds.update(t, 1.4);
          if (P.lance !== false && mode === 'after') {
            lanceL.setAttribute('d', inkPath([[1560, 1080], [1420, 760]], { w: 8, seed: seed + 600, t }) + inkPath([[1420, 760], [1400, 700]], { w: 6, seed: seed + 601, t }));
            lanceP.setAttribute('d', inkLoop([[1418, 752], [1350, 770], [1380, 800], [1428, 790]], { seed: seed + 602, t, amp: 0.8 }));
          }
          if (P.rain !== false) {
            let rd = '';
            for (let i = 0; i < 90; i++) {
              const q = rng(inkHash(seed, i + 700)), sp = 900 + q() * 300, y = ((q() * H + lt * sp) % (H + 100)) - 50, x = (q() * (W + 200)) - 100 - (y * 0.25);
              rd += inkPath([[x, y], [x - 12, y + 46]], { w: 2.2, seed: seed + 710 + i, t, amp: 0.4 });
            }
            rainL.setAttribute('d', rd);
          }
          const fl = atOr(cues, P.flash, null);
          if (fl != null && lt >= fl && lt < fl + 0.35) {
            const pts = [[1500, -20], [1440, 120], [1520, 150], [1420, 330], [1480, 350], [1390, 520]];
            boltI.setAttribute('d', inkPath(pts, { w: 14, seed: seed + 800, t, smooth: false })); boltL.setAttribute('d', inkPath(pts, { w: 6, seed: seed + 801, t, smooth: false }));
          } else { boltI.setAttribute('d', ''); boltL.setAttribute('d', ''); }
          if (labels) labels.update(lt, t, cues);
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
