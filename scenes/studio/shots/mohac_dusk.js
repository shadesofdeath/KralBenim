// mohac_dusk: the battlefield at sunset, at ground level (14-mohac-1526): a huge sun sinking on the horizon behind
// the plain, broken lances standing in the mud, fallen banners, a riderless horse walking slowly across, thin smoke
// columns rising and crows circling; optionally an hourglass running out in the foreground and big words.
// The scene's "set" (field, ground ≈ 840, horizon ≈ 620) paints the land; this draws the sun and everything on it.
// P: {sun: true, sink: 1 (how far it sets during the scene, 0..1), hourglass: {x, at} | false, horse: true,
//     words: [MCB label entries] (e.g. big serif words), lances: 7, banners: 2, crows: 5, smoke: 3}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_dusk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const HZ = P.horizon ?? 620, GY = P.gy ?? 840;
      const root = el(svg, 'g');
      const sunG = el(root, 'g'), farG = el(root, 'g'), midG = el(root, 'g'), nearG = el(root, 'g'), labG = el(root, 'g');
      const sunF = inkEl(sunG, INK.gold), sunR = inkEl(sunG, INK.red), rays = inkEl(sunG, INK.gold), sunL = inkEl(sunG, INK.ink), hzMask = inkEl(sunG, mix(INK.paperLight, INK.stain, 0.3));
      const smokeF = inkEl(farG, mix(INK.paperLight, INK.inkSoft, 0.25)), crowsL = inkEl(farG, INK.ink);
      const horse = P.horse !== false ? M.rider(midG, { side: 'hu', head: 'helm', riderless: true, lance: false, seed: seed * 20 }) : null;
      const lances = inkEl(nearG, INK.ink), pen = inkEl(nearG, INK.red), banF = inkEl(nearG, INK.red), banL = inkEl(nearG, INK.ink), ground = inkEl(nearG, INK.ink);
      const hgF = inkEl(nearG, INK.paperLight), sandF = inkEl(nearG, INK.gold), hgL = inkEl(nearG, INK.ink);
      const words = P.words && window.MCB ? window.MCB.labels(labG, P.words, W, H, seed * 7) : null;

      return {
        update(lt, dur, cues, env) {
          const t = env.t, sk = (P.sink ?? 1) * clamp01(lt / Math.max(1, dur));
          // sun: half-disc sinking into the horizon; the land in front masks its lower part
          const sx = P.sun_x ?? 1180, R = 210, sy = HZ - R * 0.55 + sk * R * 0.6;
          if (P.sun !== false) {
            sunF.setAttribute('d', inkLoop(inkEllipsePts(sx, sy, R, R, seed + 1, 22), { seed: seed + 1, t, amp: 1 }));
            sunR.setAttribute('d', inkLoop([[sx - R * 0.9, sy + R * 0.2], [sx + R * 0.9, sy + R * 0.2], [sx + R * 0.8, sy + R * 0.5], [sx - R * 0.8, sy + R * 0.5]], { seed: seed + 2, t, amp: 1 }));
            let rd = ''; for (let k = 0; k < 14; k++) { const a = Math.PI + k / 13 * Math.PI, r0 = R + 30, r1 = R + 90 + 30 * Math.sin(t * 2 + k); rd += inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], { w: 6, seed: seed + 10 + k, t }); }
            rays.setAttribute('d', rd); sunL.setAttribute('d', inkPath(inkEllipsePts(sx, sy, R, R, seed + 1, 22), { w: 5, seed: seed + 3, t, closed: true }));
            hzMask.setAttribute('d', inkLoop([[-60, HZ], [W + 60, HZ - 4], [W + 60, H + 60], [-60, H + 60]], { seed: seed + 4, t, amp: 1 }));
          }
          // smoke columns + crows
          let sm = '';
          for (let k = 0; k < (P.smoke ?? 3); k++) { const bx = 300 + k * 520; for (let j = 0; j < 6; j++) { const age = ((lt * 0.2 + j / 6) % 1), x = bx + age * 120 + Math.sin(age * 6 + k) * 20, y = HZ + 20 - age * 420, r = 20 + age * 60; sm += M.puff(x, y, r, seed + 40 + k * 10 + j, t); } }
          smokeF.setAttribute('d', sm);
          let cr = '';
          for (let k = 0; k < (P.crows ?? 5); k++) { const a = t * 0.5 + k * 1.3, x = 700 + Math.cos(a) * (240 + k * 40), y = 230 + Math.sin(a * 1.3) * 60 + k * 18, f = Math.sin(t * 9 + k) * 10; cr += inkPath([[x - 26, y - f], [x, y + 6], [x + 26, y - f]], { w: 4.5, seed: seed + 60 + k, t }); }
          crowsL.setAttribute('d', cr);
          // riderless horse walking across the mid-ground
          if (horse) horse.update(t, { x: 200 + lt * 70, y: GY - 60, s: 0.75, face: 1, ph: lt * 0.9, gallop: 0.3, couch: 0 });
          // near: broken lances, pennons, fallen banners, the ground line
          ground.setAttribute('d', inkPath([[-60, GY], [W * 0.5, GY - 4], [W + 60, GY + 2]], { w: 6, seed: seed + 70, t }));
          let ll = '', pp = '', bf = '', bl = '';
          for (let k = 0; k < (P.lances ?? 7); k++) {
            const q = rng(inkHash(seed + 80, k)), x = 80 + k * 260 + q() * 60, y = GY + 40 + q() * 160, ang = (q() - 0.5) * 0.7, L = 200 + q() * 260;
            const tip = [x + Math.sin(ang) * L, y - Math.cos(ang) * L];
            ll += inkPath([[x, y], tip], { w: 8, seed: seed + 90 + k, t }) + inkPath([tip, [tip[0] + 12, tip[1] - 20], [tip[0] - 4, tip[1] - 10]], { w: 4, seed: seed + 110 + k, t, smooth: false });
            if (k % 2 === 0) { const fw = Math.sin(t * 3 + k) * 6, a = [x + Math.sin(ang) * L * 0.85, y - Math.cos(ang) * L * 0.85]; pp += inkLoop([a, [a[0] + 70, a[1] + 12 + fw], [a[0] + 46, a[1] + 26 + fw], [a[0] + 4, a[1] + 34]], { seed: seed + 130 + k, t, amp: 0.8 }); }
          }
          for (let k = 0; k < (P.banners ?? 2); k++) {
            const x = 520 + k * 860, y = GY + 120 + k * 70, wv = Math.sin(t * 2 + k) * 8;
            bl += inkPath([[x - 240, y + 10], [x + 200, y - 40]], { w: 9, seed: seed + 150 + k, t });
            const cl = [[x + 80, y - 26], [x + 200, y - 40], [x + 210 + wv, y - 130], [x + 280 + wv, y - 96], [x + 260, y - 6], [x + 140, y + 6]];
            bf += inkLoop(cl, { seed: seed + 160 + k, t, amp: 1 }); bl += inkPath(cl, { w: 5, seed: seed + 170 + k, t, closed: true });
          }
          lances.setAttribute('d', ll); pen.setAttribute('d', pp); banF.setAttribute('d', bf); banL.setAttribute('d', bl);
          // hourglass running out
          if (P.hourglass) {
            const Hg = P.hourglass, ha = atOr(cues, Hg.at, 0.3), pr = spring(lt, ha, 0.6), x = Hg.x ?? 1600, y = Hg.y ?? 960, s = 1.15 * Math.max(0.01, pr), run = clamp01((lt - ha) / Math.max(1, dur - ha - 0.3));
            if (lt >= ha) {
              const glass = [[x - 90 * s, y - 360 * s], [x + 90 * s, y - 360 * s], [x + 12 * s, y - 180 * s], [x + 90 * s, y], [x - 90 * s, y], [x - 12 * s, y - 180 * s]];
              hgF.setAttribute('d', inkLoop(glass, { seed: seed + 200, t, amp: 0.8 }));
              const topH = (1 - run) * 120 * s, botH = run * 120 * s;
              let sd = inkLoop([[x - 70 * s * (topH / (120 * s) + 0.1), y - 200 * s - topH], [x + 70 * s * (topH / (120 * s) + 0.1), y - 200 * s - topH], [x + 8 * s, y - 190 * s], [x - 8 * s, y - 190 * s]], { seed: seed + 201, t, amp: 0.5, smooth: false });
              sd += inkLoop([[x - 84 * s, y - 6 * s], [x + 84 * s, y - 6 * s], [x + 10 * s, y - 6 * s - botH], [x - 10 * s, y - 6 * s - botH]], { seed: seed + 202, t, amp: 0.5, smooth: false });
              if (run < 1) sd += inkPath([[x, y - 186 * s], [x + Math.sin(t * 20) * 1.5, y - 10 * s - botH]], { w: 4, seed: seed + 203, t });
              sandF.setAttribute('d', sd);
              hgL.setAttribute('d', inkPath(glass, { w: 6, seed: seed + 204, t, closed: true, smooth: false }) + inkPath([[x - 120 * s, y - 380 * s], [x + 120 * s, y - 380 * s]], { w: 14, seed: seed + 205, t }) + inkPath([[x - 120 * s, y + 18 * s], [x + 120 * s, y + 18 * s]], { w: 14, seed: seed + 206, t })
                + inkPath([[x - 110 * s, y - 380 * s], [x - 110 * s, y + 18 * s]], { w: 8, seed: seed + 207, t }) + inkPath([[x + 110 * s, y - 380 * s], [x + 110 * s, y + 18 * s]], { w: 8, seed: seed + 208, t }));
            }
          }
          if (words) words.update(lt, t, cues);
        },
      };
    },
  };
})();
