// lh_person: today, a person who keeps losing (learned helplessness in a human life), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, time)). A small room at night: dark walls with a
// big window through which the scene's "night" set shows (stars, moon, hills); a desk with a lamp (warm light pool) and
// crumpled papers marked with red crosses; a hatless person in a sweater sits slumped at the desk, head hanging, one
// hand on the forehead. On the floor in front of his feet, softly lit: the same low wooden barrier board as in the dogs'
// box; he does not look at it. On `star` one small gold star falls onto the desk next to his hand and twinkles. Foreground: floor
// boards, a wastebasket and more crumpled papers down to the frame bottom.
// P: {window: [x0, y0, x1, y1] (0..1), gy: 0.6, desk: 0.47 (desk top, 0..1 H), step: [0.47, 0.6]}
// cues: star. Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lh_person = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 547, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, dt = (P.desk ?? 0.47) * H;
      const wn = P.window || [0.5, 0.15, 0.92, 0.4];
      const wall = inkEl(root, mix(INK.blue, INK.ink, 0.5), { 'fill-rule': 'evenodd' }), wallT = inkEl(root, mix(INK.blue, INK.ink, 0.35)), floorF = inkEl(root, mix(INK.stain, INK.ink, 0.5));
      const winR = inkEl(root, mix(INK.stain, INK.ink, 0.3)), curtain = inkEl(root, mix(INK.red, INK.ink, 0.35)), curtainR = inkEl(root);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.22 }), glow2 = inkEl(root, INK.gold, { 'fill-opacity': 0.2 });
      const stepPool = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), step = L.board(root, sd + 5);
      const chair = inkEl(root, mix(INK.stain, INK.ink, 0.25));
      const man = L.person(el(root, 'g'), sd + 10, { kind: 'sweater', hair: 'dark', glasses: false, col: mix(INK.gold, INK.stain, 0.4) });
      const desk = inkEl(root, mix(INK.stain, INK.paperDark, 0.15)), deskR = inkEl(root);
      const lampE = inkEl(root, mix(INK.green, INK.ink, 0.3)), lampR = inkEl(root), bulb = inkEl(root, INK.gold), cone = inkEl(root, INK.gold, { 'fill-opacity': 0.25 });
      const balls = inkEl(root, INK.paperLight), ballsR = inkEl(root), xs = inkEl(root, INK.red);
      const star = inkEl(root, INK.gold), starR = inkEl(root), spark = inkEl(root, INK.gold);
      const fr = L.front(el(root, 'g'), sd + 30, 'papers');
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const sc = L.atOr(cues, 'star', dur * 0.7);
          // room: wall with a window hole, floor
          const wx0 = wn[0] * W, wy0 = wn[1] * H, wx1 = wn[2] * W, wy1 = wn[3] * H;
          wall.setAttribute('d', `M-40 -40 H${W + 40} V${L.f1(gy)} H-40 Z M${L.f1(wx0)} ${L.f1(wy0)} V${L.f1(wy1)} H${L.f1(wx1)} V${L.f1(wy0)} Z`);
          wallT.setAttribute('d', inkLoop([[-40, gy - 60 * u], [W + 40, gy - 60 * u], [W + 40, gy], [-40, gy]], { seed: k + 1, t, smooth: false }));
          floorF.setAttribute('d', `M-40 ${L.f1(gy)} H${W + 40} V${H + 40} H-40 Z`);
          const WR = [inkPath(L.rect(wx0, wy0, wx1, wy1), { w: 16 * u, seed: k + 2, t, closed: true, smooth: false }), inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 10 * u, seed: k + 3, t }), inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 10 * u, seed: k + 4, t }),
            inkPath([[wx0 - 30 * u, wy1 + 14 * u], [wx1 + 30 * u, wy1 + 14 * u]], { w: 22 * u, seed: k + 5, t })];
          winR.setAttribute('d', WR.join(' '));
          const cs = Math.sin(t * 0.8) * 8 * u;
          const cp = [[wx1 - 60 * u, wy0 - 40 * u], [wx1 + 60 * u, wy0 - 40 * u], [wx1 + 70 * u, wy1 + 120 * u], [wx1 - 30 * u + cs, wy1 + 110 * u], [wx1 - 10 * u + cs, wy0 + 200 * u]];
          curtain.setAttribute('d', inkLoop(cp, { seed: k + 6, t, amp: 1 }));
          curtainR.setAttribute('d', inkPath(cp, { w: 5, seed: k + 7, t, closed: true, amp: 1 }) + ' ' + inkPath([[wx0 - 60 * u, wy0 - 40 * u], [wx1 + 80 * u, wy0 - 40 * u]], { w: 10 * u, seed: k + 8, t }));
          // lamp light pools
          const lx = 0.12 * W, fl = 0.95 + 0.05 * Math.sin(t * 6);
          glow.setAttribute('d', '');
          glow2.setAttribute('d', inkCircle(lx + 120 * u, dt - 4 * u, 190 * u, k + 10, t, { ry: 26 * u, fill: true }));
          // the low barrier on the floor in front of his feet, the same board as in the dogs' box, softly lit
          const sp = P.step || [0.47, 0.6], sx = sp[0] * W, sy = sp[1] * H + 10 * u;
          stepPool.setAttribute('d', inkCircle(sx + 40 * u, sy - 20 * u, 150 * u, k + 11, t, { ry: 34 * u, fill: true }));
          step.update(t, sx, sy, 150 * u, 46 * u, 70 * u, 16 * u);
          // chair + the slumped person
          const hipX = 0.7 * W, seat = dt + 70 * u;
          chair.setAttribute('d', inkPath([[hipX - 50 * u, seat + 20 * u], [hipX + 70 * u, seat + 20 * u]], { w: 18 * u, seed: k + 15, t }) + ' ' + inkPath([[hipX + 64 * u, seat + 20 * u], [hipX + 80 * u, seat - 260 * u]], { w: 16 * u, seed: k + 16, t }) + ' ' +
            [hipX - 40 * u, hipX + 60 * u].map((x, i) => inkPath([[x, seat + 20 * u], [x + (i ? 6 : -6) * u, gy]], { w: 12 * u, seed: k + 17 + i, t })).join(' '));
          const sigh = Math.sin(t * 1.3) * 0.5 + 0.5;
          const res = man.update(t, hipX, gy, 1.4 * u, { face: -1, seat, lean: 16 + 3 * sigh, droop: 0.6, armL: [0.43 * W, dt - 14 * u], armR: [0.4 * W, dt - 20 * u + sigh * 4 * u], bendR: -1, brow: -0.2, look: [-2, 10] });
          // desk
          const dp = L.rect(0.03 * W, dt, 0.46 * W, dt + 34 * u);
          desk.setAttribute('d', inkLoop(dp, { seed: k + 20, t, smooth: false }));
          deskR.setAttribute('d', inkPath(dp, { w: 6, seed: k + 21, t, closed: true, smooth: false }) + ' ' + [0.07 * W, 0.42 * W].map((x, i) => inkPath([[x, dt + 34 * u], [x, gy + 10 * u]], { w: 16 * u, seed: k + 22 + i, t })).join(' '));
          // desk lamp
          const lb = [lx, dt], le = [lx + 40 * u, dt - 220 * u], lh = [lx + 150 * u, dt - 250 * u];
          lampE.setAttribute('d', inkLoop([[lh[0] - 70 * u, lh[1] + 60 * u], [lh[0] + 50 * u, lh[1] + 60 * u], [lh[0] + 10 * u, lh[1] - 10 * u], [lh[0] - 40 * u, lh[1] - 10 * u]], { seed: k + 25, t, smooth: false }) + ' ' + inkLoop(L.rect(lb[0] - 60 * u, dt - 20 * u, lb[0] + 60 * u, dt), { seed: k + 26, t, smooth: false }));
          lampR.setAttribute('d', inkPath([lb, le, lh], { w: 9 * u, seed: k + 27, t }));
          bulb.setAttribute('d', inkCircle(lh[0] - 10 * u, lh[1] + 62 * u, 20 * u, k + 28, t, { fill: true }));
          cone.setAttribute('fill-opacity', (0.26 * fl).toFixed(3));
          cone.setAttribute('d', inkLoop([[lh[0] - 66 * u, lh[1] + 60 * u], [lh[0] + 46 * u, lh[1] + 60 * u], [lh[0] + 190 * u, dt], [lh[0] - 200 * u, dt]], { seed: k + 29, t, smooth: false }));
          // crumpled papers with red crosses on the desk
          const BA = [], BR = [], X = [];
          [[0.27, 46], [0.36, 40], [0.31, 42, -60]].forEach((q, i) => {
            const x = q[0] * W, r = q[1] * u, y = dt - r * 0.8 + (q[2] || 0) * u;
            const pts = inkEllipsePts(x, y, r, r * 0.85, k + 40 + i, 9, i, 0.16);
            BA.push(inkLoop(pts, { seed: k + 40 + i, t, smooth: false })); BR.push(inkPath(pts, { w: 4.5, seed: k + 45 + i, t, closed: true, smooth: false }));
            X.push(inkPath([[x - r * 0.35, y - r * 0.35], [x + r * 0.35, y + r * 0.35]], { w: 6, seed: k + 50 + i, t }), inkPath([[x + r * 0.35, y - r * 0.35], [x - r * 0.35, y + r * 0.35]], { w: 6, seed: k + 55 + i, t }));
          });
          balls.setAttribute('d', BA.join(' ')); ballsR.setAttribute('d', BR.join(' ')); xs.setAttribute('d', X.join(' '));
          // the falling star
          const fq = clamp01((lt - sc) / 0.8), land = [0.405 * W, dt - 58 * u];
          if (lt >= sc) {
            const p = [land[0] + (1 - fq) * 60 * u, lerp(0.12 * H, land[1], fq * fq)], r = 58 * u * (1 + 0.25 * punch(lt, sc + 0.8, 0.6)), rot = (1 - fq) * 3 + Math.sin(t * 2) * 0.1;
            const SP = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + rot, q = i % 2 ? r * 0.45 : r; SP.push([p[0] + Math.cos(a) * q, p[1] + Math.sin(a) * q]); }
            star.setAttribute('d', inkLoop(SP, { seed: k + 60, t, smooth: false, amp: 0.6 }));
            starR.setAttribute('d', inkPath(SP, { w: 4, seed: k + 61, t, closed: true, smooth: false }));
            const SPK = []; if (fq >= 1) for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + t, d = (78 + 16 * Math.sin(t * 5 + i)) * u; SPK.push(inkDot(p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d, 7 * u, 7 * u, k + 62 + i, t)); }
            else for (let i = 0; i < 4; i++) SPK.push(inkDot(p[0] + (i - 1.5) * 6 * u, p[1] - (i + 1) * 40 * u, 5 * u, 5 * u, k + 70 + i, t));
            spark.setAttribute('d', SPK.join(' '));
          } else L.blank(star, starR, spark);
          fr.update(t, W, H, gy, { bin: 0.15, balls: [[0.08, -0.25], [0.2, -0.3], [0.45, 0.42], [0.62, 0.62], [0.9, 0.5], [0.34, 0.75]] });
        },
      };
    },
  };
})();
