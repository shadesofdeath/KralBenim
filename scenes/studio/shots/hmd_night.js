// hmd_night: the Hamidiye slipping out of the Dardanelles on a dark night (January 1913), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, time)). A night wash sky (stars, moon) down to
// P.horizon, the sea from there to the frame bottom. Blockading warships (lights on) search the water with their
// searchlights: each beam ends in a lit oval spot that slides over the water BEHIND the cruiser (between the horizon
// and her waterline) and, on `miss`, passes just behind her stern without touching her. The cruiser is a dark
// silhouette (three funnels, two masts, no lights, ensign at the stern) with a stern wake and a bow wave. Modes:
//   hook: one far warship (left) + the cruiser big in the middle, steaming right; Kaşif on a near rock ledge (right)
//         points at the cruiser and jumps back in shock on his cue. P.realtime (default true in hook): the shot runs
//         on the global clock env.t (scene 0 starts at 0), so the moving parts keep their real speed during the
//         engine's hook (which plays the cover moment slowed down); cues then are read on the same clock.
//   slip: two warships (left and right) sweep their spots towards each other; the dark cruiser runs between them
//         (right to left, out to sea); on `miss` both spots cross just behind her stern. Big swells along the bottom.
// P: {mode: "hook"|"slip", horizon: 0.38 (0..1 H), sky: true, moon: [0.78, 0.1] (0..1) | false,
//     ship: {x, to, y (waterline), s, face}, far: [{x, y, s, face}], spot_y: (0..1 H, where the spots run),
//     rock: true (hook), rock_y: 0.69, rock_x: 0.64, kasif: {x, y, scale, pose, face, dir, seq} | false, realtime, label: {...}}
// cues: miss (spots pass behind the stern), kasif seq names, label.at. Needs hmd__lib.js (HMD).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.hmd_night = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.HMD, sd = seed * 1000 + 313, mode = P.mode || 'hook', u = W / 1080;
      const root = el(svg, 'g');
      const hy = (P.horizon ?? (mode === 'hook' ? 0.4 : 0.36)) * H;
      const skyE = P.sky === false ? null : { f: inkEl(root, mix(INK.blue, INK.ink, 0.62)), band: inkEl(root, mix(INK.blue, INK.ink, 0.42)), clear: inkEl(root, mix(INK.blue, INK.paperLight, 0.4)), clear2: inkEl(root, mix(INK.blue, INK.paperLight, 0.62)), stars: inkEl(root, INK.paperLight), moon: inkEl(root, INK.paperLight), halo: inkEl(root, INK.paperLight, { 'fill-opacity': 0.18 }), coast: inkEl(root, mix(INK.ink, INK.blue, 0.25)) };
      const r0 = rng(sd + 7), STARS = Array.from({ length: 46 }, () => [r0(), r0(), r0()]);
      const sea = M.sea(el(root, 'g'), sd + 1);
      const spotG = el(root, 'g');
      const farDef = P.far || (mode === 'slip'
        ? [{ x: 0.13, y: hy / H + 0.075, s: 0.5, face: 1 }, { x: 0.87, y: hy / H + 0.085, s: 0.54, face: -1 }]
        : [{ x: 0.16, y: hy / H + 0.04, s: 0.42, face: 1 }]);
      const farShips = farDef.map((f, i) => ({ f, c: M.cruiser(spotG, sd + 10 + i * 7, { funnels: 2, flag: 'gr' }), cone: inkEl(spotG, INK.paperLight, { 'fill-opacity': 0.22 }), core: inkEl(spotG, INK.paperLight, { 'fill-opacity': 0.3 }), spot: inkEl(spotG, INK.paperLight, { 'fill-opacity': 0.7 }), spotR: inkEl(spotG, INK.gold, { 'fill-opacity': 0.6 }) }));
      const sp = Object.assign(mode === 'slip' ? { x: 0.66, to: 0.4, y: 0.62, s: 0.9, face: -1 } : { x: 0.34, to: 0.5, y: 0.565, s: 0.82, face: 1 }, P.ship || {});
      const ship = M.cruiser(el(root, 'g'), sd + 30, { funnels: 3, flag: 'tr', tone: 'dark' });
      const rockG = el(root, 'g');
      const rock = mode === 'hook' && P.rock !== false ? { f: inkEl(rockG, mix(INK.ink, INK.inkSoft, 0.35)), h: inkEl(rockG, INK.paperDark, { 'fill-opacity': 0.35 }), r: inkEl(rockG), sp: inkEl(rockG, INK.paperLight, { 'fill-opacity': 0.6 }) } : null;
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.84, y: 0.69, scale: 1.1, pose: 'point', face: -1, dir: 'forward' }, P.kasif), W, H, seed) : null;
      const lab = P.label ? M.label(root, P.label, W, H) : null;
      const realtime = P.realtime ?? (mode === 'hook');
      const spotY = (P.spot_y ?? (mode === 'slip' ? 0.53 : 0.5)) * H;
      return {
        update(lt0, dur, cues, env = {}) {
          const t = env.t ?? lt0, k = sd, lt = realtime ? t : lt0;
          const miss = M.atOr(cues, 'miss', dur * 0.6);
          // night sky + a low dark far coast on the horizon
          if (skyE) {
            skyE.f.setAttribute('d', `M-30 -30 H${W + 30} V${M.f1(hy + 2)} H-30 Z`);
            skyE.band.setAttribute('d', inkLoop([[-30, hy - 0.08 * H], [W + 30, hy - 0.09 * H], [W + 30, hy + 2], [-30, hy + 2]], { seed: k + 2, t, smooth: false, amp: 2 }));
            // a lighter patch of sky behind the brand + kicker (top left) so they stay readable
            skyE.clear.setAttribute('d', inkLoop(inkEllipsePts(0.24 * W, 0.075 * H, 0.42 * W, 0.11 * H, k + 8, 18), { seed: k + 8, t, amp: 2 }));
            skyE.clear2.setAttribute('d', inkLoop(inkEllipsePts(0.22 * W, 0.07 * H, 0.33 * W, 0.075 * H, k + 9, 16), { seed: k + 9, t, amp: 2 }));
            skyE.stars.setAttribute('d', STARS.filter(q => !(q[0] < 0.62 && q[1] < 0.5)).map((q, i) => { const tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7); return inkDot(q[0] * W, q[1] * (hy - 0.1 * H), (2 + q[2] * 3) * tw * u, (2 + q[2] * 3) * tw * u, k + 20 + i, t); }).join(' '));
            if (P.moon !== false) {
              const m = P.moon || [0.78, 0.12], mx = m[0] * W, my = m[1] * H;
              skyE.moon.setAttribute('d', inkCircle(mx, my, 46 * u, k + 3, t, { fill: true }));
              skyE.halo.setAttribute('d', inkCircle(mx, my, 110 * u, k + 4, t, { fill: true }));
            }
            const cp = []; for (let i = 0; i <= 12; i++) { const x = i / 12 * W; cp.push([x, hy - (18 + 22 * Math.sin(i * 1.3 + 1) * Math.sin(i * 0.5)) * u - (i > 8 ? 30 * u : 0)]); }
            skyE.coast.setAttribute('d', inkLoop([[-30, hy + 2], ...cp, [W + 30, hy + 2]], { seed: k + 5, t, amp: 1 }));
          }
          sea.update(t, W, H, hy, { night: 1, rows: 10, moon: P.moon === false ? null : (P.moon || [0.78])[0] * W, near: mode === 'slip' ? 'big' : true });
          // cruiser position (real speed)
          const pr = clamp01(lt / Math.max(1, dur));
          const sx = lerp(sp.x, sp.to ?? sp.x, pr) * W, swy = sp.y * H, sc = sp.s * u;
          const sternAt = x => x - sp.face * 326 * sc;
          const sternMiss = sternAt(lerp(sp.x, sp.to ?? sp.x, clamp01(miss / Math.max(1, dur))) * W);
          // searchlights: lamp -> lit spot on the water behind the cruiser
          farShips.forEach((o, i) => {
            const { f, c } = o;
            const res = c.update(t, f.x * W, f.y * H, f.s * u, { face: f.face, night: 0.65, lights: 1, smoke: 0.35 });
            const lamp = res.bridge;
            const dirX = mode === 'slip' ? (f.face > 0 ? 1 : -1) : 1;           // which way the spot travels
            const v = (mode === 'slip' ? 0.3 : 0.42) * W;
            const ax = sternMiss - sp.face * 40 * u * (mode === 'slip' ? 0 : 1) + dirX * v * (lt - miss) + (mode === 'slip' ? dirX * (i ? -1 : 1) * 0 : 0);
            const ay = spotY + Math.sin(t * 1.7 + i) * 8 * u;
            const d = [ax - lamp[0], ay - lamp[1]], L = Math.hypot(d[0], d[1]) || 1, n = [-d[1] / L, d[0] / L], ww = 70 * u;
            const cone = [[lamp[0] + n[0] * 6, lamp[1] + n[1] * 6], [ax + n[0] * ww, ay + n[1] * ww * 0.3], [ax - n[0] * ww, ay - n[1] * ww * 0.3], [lamp[0] - n[0] * 6, lamp[1] - n[1] * 6]];
            o.cone.setAttribute('d', inkLoop(cone, { seed: k + 40 + i, t, smooth: false, amp: 1 }));
            o.core.setAttribute('d', inkLoop([[lamp[0], lamp[1]], [ax + n[0] * ww * 0.35, ay + n[1] * ww * 0.1], [ax - n[0] * ww * 0.35, ay - n[1] * ww * 0.1]], { seed: k + 44 + i, t, smooth: false, amp: 1 }));
            o.spot.setAttribute('d', inkCircle(ax, ay, 95 * u, k + 48 + i, t, { ry: 22 * u, fill: true, n: 14 }));
            o.spotR.setAttribute('d', inkCircle(lamp[0], lamp[1], 11 * u, k + 52 + i, t, { fill: true }));
          });
          // the cruiser: dark, no lights
          ship.update(t, sx, swy, sc, { face: sp.face, night: 0.92, lights: 0, smoke: 0.8, wake: 0.9, roll: Math.sin(t * 0.9) * 1.2 });
          // rock ledge (hook)
          if (rock) {
            const top = (P.rock_y ?? 0.69) * H, x0 = (P.rock_x ?? 0.64) * W;
            const pts = [[x0 - 60 * u, H + 30], [x0, top + 120 * u], [x0 + 70 * u, top + 30 * u], [x0 + 170 * u, top], [0.94 * W, top - 6 * u], [W + 30, top + 40 * u], [W + 30, H + 30]];
            rock.f.setAttribute('d', inkLoop(pts, { seed: k + 50, t, amp: 1.5, smooth: false }));
            const HH = [];
            for (let i = 0; i < 12; i++) { const x = x0 + 40 * u + i * 34 * u, y = top + 60 * u + (i % 3) * 50 * u; HH.push(inkPath([[x, y], [x + 40 * u, y + 90 * u]], { w: 3, seed: k + 60 + i, t })); }
            rock.h.setAttribute('d', HH.join(' '));
            rock.r.setAttribute('d', inkPath(pts.slice(1, 6), { w: 6, seed: k + 51, t, amp: 1.5, smooth: false }));
            const SP = [];
            for (let i = 0; i < 4; i++) { const ph = (t * 0.7 + i / 4) % 1, x = x0 + 10 * u + i * 26 * u, y = top + 170 * u - ph * 110 * u; SP.push(inkCircle(x - ph * 50 * u, y, (12 + ph * 24) * u, k + 70 + i, t, { fill: true, n: 8 })); }
            rock.sp.setAttribute('d', SP.join(' '));
          }
          if (kas) kas.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
