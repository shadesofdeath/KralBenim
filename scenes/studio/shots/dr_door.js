// dr_door: a round "millstone" door of a rock-cut underground city, seen head-on (parchment ink, BRAND.md §3, §5).
// A rough tuff wall with strata; a low arched doorway whose tunnel recedes into the dark (arches shrinking towards a
// vanishing point); beside it a niche holding a huge stone disc with a hole in the middle and chisel marks. On `roll`
// the disc rolls sideways (it really turns) and seals the doorway; dust puffs at its foot, the camera thuds.
// An inner cast walks inside the tunnel (clipped to the doorway, can shrink into the distance or grow as it comes
// closer), the outer cast stands in front.
// P: {door: {x: 0.36, w: 400, h: 500}, stone: {r: 285, side: "right"}, closed: false (start closed),
//   roll: {at: cue, dur: 1.4, open: false (true = rolls away from the doorway)},
//   inner: [DRL cast; x/y 0..1 of W/H, shrink: {to, at, dur}, tilt], cast: [DRL cast in front],
//   labels: [MCB labels], stamp: {text, at, x, y}, cam: {zoom: 1.06, focus: [0.45, 0.55]}}
// cues: roll (or roll.at), hit, shake (default: end of the roll), cast/label at names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.dr_door = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const D = window.DRL, sd = seed * 1000 + 613, atOr = D.atOr, f1 = D.f1;
      const Dr = Object.assign({ x: 0.36, w: 400, h: 500 }, P.door || {});
      const St = Object.assign({ r: 285, side: 'right' }, P.stone || {});
      const floorY = H * 0.86, dx = Dr.x * W, dTop = floorY - Dr.h;
      const sgn = St.side === 'left' ? -1 : 1;
      const nicheX = dx + sgn * (Dr.w / 2 + St.r + 30), stoneY = floorY - St.r;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const wallF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.6 });
      const tex = D.rock(el(cam, 'g'), -80, W + 80, -60, floorY, sd + 1, { gap: 120, pebbles: 22 });
      const niche = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.9 }), nicheR = inkEl(cam, INK.ink);
      const doorPts = () => { const x0 = dx - Dr.w / 2, x1 = dx + Dr.w / 2; return [[x0, floorY], [x0, dTop + Dr.w * 0.45], [x0 + Dr.w * 0.15, dTop + 30], [dx, dTop], [x1 - Dr.w * 0.15, dTop + 30], [x1, dTop + Dr.w * 0.45], [x1, floorY]]; };
      const cid = 'drdoor' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      const clipP = el(clip, 'path', { d: 'M' + doorPts().map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + ' Z' });
      void clipP;
      const inG = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const dark = inkEl(inG, INK.ink), rings = Array.from({ length: 6 }, (_, i) => inkEl(inG, i % 2 ? INK.inkSoft : INK.paperDark));
      const inGlow = el(inG, 'circle', { fill: INK.gold, 'fill-opacity': 0.0 });
      const fy = floorY / H - 0.86;   // cast y values are given for a 0.86 floor
      const innerCast = D.cast(el(inG, 'g'), P.inner, sd + 200, (x, y) => [x * W, ((y ?? 0.86) + fy) * H]);
      const doorR = inkEl(cam, INK.ink);
      const floorF = inkEl(cam, INK.paperDark), floor = inkEl(cam, INK.ink);
      const stG = el(cam, 'g');
      const stF = inkEl(stG, INK.paperLight), stR = inkEl(stG, INK.ink), stM = inkEl(stG, INK.inkSoft), stH = inkEl(stG, INK.inkSoft, { 'fill-opacity': 0.8 });
      const dust = Array.from({ length: 6 }, () => inkEl(cam, INK.paperDark, { 'fill-opacity': 0.6 }));
      const cast = D.cast(el(cam, 'g'), P.cast, sd + 500, (x, y) => [x * W, ((y ?? 0.9) + fy) * H]);
      const lab = MCB.labels(el(root, 'g'), P.labels, W, H, sd + 900);
      const stamp = P.stamp ? MCB.labels(el(root, 'g'), [Object.assign({ stamp: true, x: 0.8, y: 0.18, color: 'red', size: 96 }, P.stamp)], W, H, sd + 950) : null;
      const RL = Object.assign({ dur: 1.4 }, P.roll || {});

      return {
        update(lt, dur, cues) {
          const t = lt;
          const ra = P.roll ? atOr(cues, RL.at ?? 'roll', atOr(cues, 'roll', null)) : null;
          let p = P.closed ? 1 : 0;
          if (ra != null) { const q = progIO(lt, ra, RL.dur); p = RL.open ? 1 - q : q; if (P.closed && !RL.open) p = 1; }
          const endA = ra != null ? ra + RL.dur : null;
          const shA = atOr(cues, P.shake, endA);
          const sh = shA != null && lt >= shA && lt < shA + 0.6 ? Math.exp(-(lt - shA) * 6) : 0;
          MCB.camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [Dr.x + 0.05, 0.55] }, punch(lt, cue(cues, 'hit', null)), sh);
          wallF.setAttribute('d', inkLoop([[-80, -60], [W + 80, -60], [W + 80, floorY], [-80, floorY]], { seed: sd + 2, t, amp: 0.5, smooth: false }));
          tex.update(t);
          // niche
          const nP = inkEllipsePts(nicheX, stoneY, St.r + 22, St.r + 16, sd + 4, 16);
          niche.setAttribute('d', inkLoop(nP, { seed: sd + 5, t }));
          nicheR.setAttribute('d', inkPath(nP.filter(q => q[1] < floorY - 4), { w: 5, seed: sd + 6, t }));
          // tunnel inside the doorway
          const dp = doorPts();
          dark.setAttribute('d', inkLoop(dp, { seed: sd + 7, t, amp: 0.6 }));
          const vx = dx + 10, vy = dTop + Dr.h * 0.42;
          rings.forEach((rg, i) => {
            const k = 0.86 - i * 0.14 + Math.sin(lt * 0.5) * 0.01;
            const pts = dp.map(q => [lerp(vx, q[0], k), lerp(vy, q[1], k)]);
            rg.setAttribute('d', inkPath(pts, { w: 10 * k + 2, seed: sd + 10 + i, t, amp: 1 }));
          });
          innerCast.update(lt, t, cues);
          doorR.setAttribute('d', inkPath(dp, { w: 8, seed: sd + 20, t }));
          floorF.setAttribute('d', inkLoop([[-80, floorY], [W + 80, floorY], [W + 80, H + 60], [-80, H + 60]], { seed: sd + 21, t, smooth: false }));
          floor.setAttribute('d', inkPath([[-80, floorY], [W + 80, floorY + 3]], { w: 6, seed: sd + 22, t }));
          // the stone
          const sx = lerp(nicheX, dx, p), ang = (sx - nicheX) / St.r * sgn * -1;
          const sP = inkEllipsePts(sx, stoneY, St.r, St.r, sd + 30, 18);
          stF.setAttribute('d', inkLoop(sP, { seed: sd + 31, t }));
          stR.setAttribute('d', inkPath(sP, { w: 9, seed: sd + 32, t, closed: true }) + ' ' + inkCircle(sx, stoneY, St.r * 0.72, sd + 33, t, { w: 3.5 }));
          const ms = [];
          for (let i = 0; i < 9; i++) {
            const a = ang + i / 9 * 6.283, r1 = St.r * 0.38, r2 = St.r * (0.6 + 0.08 * Math.sin(i * 3));
            ms.push(inkPath([[sx + Math.cos(a) * r1, stoneY + Math.sin(a) * r1], [sx + Math.cos(a + 0.12) * r2, stoneY + Math.sin(a + 0.12) * r2]], { w: 4, seed: sd + 40 + i, t }));
          }
          stM.setAttribute('d', ms.join(' '));
          stH.setAttribute('d', inkLoop(inkEllipsePts(sx, stoneY, St.r * 0.17, St.r * 0.17, sd + 50, 10), { seed: sd + 51, t }) + ' ' + inkPath(inkEllipsePts(sx, stoneY, St.r * 0.2, St.r * 0.2, sd + 52, 10), { w: 6, seed: sd + 53, t, closed: true }));
          stH.setAttribute('fill', INK.ink);
          // dust at the foot while rolling and on impact
          dust.forEach((d, i) => {
            if (ra == null || lt < ra) { d.setAttribute('d', ''); return; }
            const tt = lt - ra, life = RL.dur + 1.2, q = clamp01(tt / life);
            if (q >= 1) { d.setAttribute('d', ''); return; }
            const x = lerp(nicheX, sx, clamp01((i + 1) / dust.length)) + Math.sin(i * 4) * 30, y = floorY - 30 - q * 70 - i * 6;
            d.setAttribute('fill-opacity', (0.6 * (1 - q)).toFixed(3));
            d.setAttribute('d', inkDot(x, y, 40 + 70 * q, 26 + 40 * q, sd + 60 + i, t));
          });
          cast.update(lt, t, cues);
          lab.update(lt, t, cues);
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
