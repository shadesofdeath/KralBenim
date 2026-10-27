// tz_dive: underwater close to the shore — a diver's hand reaches down to a gold coin half buried in the sandy
// seabed among stones and seagrass; light shafts from the surface, rising bubbles, small fish. Full-frame (own water,
// use "set": false). Parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)).
// Needs tz__lib.js (TZ), kaime__lib.js (KMA.hand) and mcB__lib.js (MCB.labels).
// P: {bed: 0.54 (seabed top, 0..1 H), coin: {x: 0.5, y: 0.555, r: 92}, reach: cue|s (the hand comes down; default
//   0.2), take: cue|s (fingers close on the coin and lift it; default dur*0.6), labels: [MCB labels], fish: 3}
// cues: reach, take, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tz_dive = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TZ, K = window.KMA, M = window.MCB, sd = seed * 1000 + 311;
      const root = el(svg, 'g');
      const sh = T.Shapes();
      const bedY = (P.bed ?? 0.54) * H;
      const WATER = mix(INK.paper, INK.blue, 0.38), DEEP = mix(INK.paper, INK.blue, 0.55);
      // water body (opaque token mix), deeper band, surface line with light
      sh.add(root, T.rect(-30, -30, W + 30, H + 30), { fill: WATER });
      sh.add(root, lt => { const p = [[-30, bedY - 260]]; for (let i = 0; i <= 10; i++) p.push([i / 10 * W, bedY - 240 + Math.sin(i + lt * 0.8) * 30]); p.push([W + 30, bedY - 260], [W + 30, H + 30], [-30, H + 30]); return p; }, { fill: DEEP, smooth: true, amp: 2 });
      sh.add(root, lt => { const p = []; for (let i = 0; i <= 16; i++) p.push([-30 + i / 16 * (W + 60), 150 + Math.sin(i * 1.3 + lt * 2.2) * 14]); p.push([W + 30, -30], [-30, -30]); return p; }, { fill: mix(INK.paperLight, INK.blue, 0.15), stroke: INK.ink, w: 4, smooth: true });
      // light shafts (paper-light wedges, low opacity per path)
      for (let i = 0; i < 4; i++) {
        const x = W * (0.12 + i * 0.26);
        sh.add(root, lt => { const s = Math.sin(lt * 0.7 + i * 1.9) * 40; return [[x - 40, 160], [x + 50, 160], [x + 220 + s, bedY + 40], [x + 60 + s, bedY + 40]]; }, { fill: INK.paperLight, fop: 0.28, amp: 0.5 });
      }
      // fish
      const fishG = el(root, 'g');
      const fish = Array.from({ length: P.fish ?? 3 }, (_, i) => ({ f: inkEl(fishG, INK.inkSoft), r: inkEl(fishG), y: H * (0.33 + 0.07 * i), v: 60 + i * 25, s: 1 - i * 0.18, ph: i * 0.37 }));
      // seabed: sand, ripples, stones, seagrass (down to the frame bottom)
      const bedG = el(root, 'g');
      const SAND = mix(INK.paperDark, INK.stain, 0.25);
      const bedPts = [[-30, bedY + 30]];
      for (let i = 0; i <= 12; i++) bedPts.push([i / 12 * W, bedY + Math.sin(i * 0.9 + seed) * 26 + (i % 3) * 8]);
      bedPts.push([W + 30, bedY + 20], [W + 30, H + 30], [-30, H + 30]);
      sh.add(bedG, bedPts, { fill: SAND, stroke: INK.ink, w: 5, smooth: true });
      for (let j = 0; j < 9; j++) { const y = bedY + 70 + j * 95 + j * j * 4; sh.add(bedG, [[-20, y], [W * 0.3, y - 10], [W * 0.6, y + 8], [W + 20, y - 6]], { stroke: INK.inkSoft, w: 2.5 + j * 0.3, closed: false, smooth: true }); }
      const r = rng(sd + 3);
      for (let i = 0; i < 9; i++) {
        const x = W * (0.05 + r() * 0.9), y = bedY + 140 + r() * (H - bedY - 200), s = 40 + r() * 70 + (y - bedY) * 0.08;
        if (Math.abs(x - W * 0.5) < 160 && y < bedY + 260) continue;
        sh.add(bedG, inkEllipsePts(x, y, s, s * 0.55, sd + 10 + i, 9, r() * 0.6, 0.12), { fill: i % 2 ? INK.paperLight : mix(INK.paperDark, INK.inkSoft, 0.4), stroke: INK.ink, w: 4, smooth: true });
      }
      // seagrass clumps (sway)
      const grass = [[0.08, 0.05], [0.2, 0.0], [0.85, 0.03], [0.95, 0.08], [0.72, 0.42], [0.25, 0.4]];
      grass.forEach(([gx, gyy], c) => {
        for (let b = 0; b < 5; b++) {
          const x0 = gx * W + (b - 2) * 16, y0 = bedY + 20 + gyy * (H - bedY), len = 200 + ((b * 37 + c * 11) % 5) * 40;
          sh.add(bedG, lt => { const sw = Math.sin(lt * 1.3 + b * 0.7 + c) * 40; return [[x0, y0], [x0 + sw * 0.3, y0 - len * 0.35], [x0 + sw * 0.7, y0 - len * 0.7], [x0 + sw, y0 - len]]; },
            { stroke: mix(INK.green, INK.ink, 0.2), w: 14, closed: false, smooth: true, amp: 1 });
        }
      });
      // the coin, half in the sand (tilted flat), with a sand rim in front
      const C = Object.assign({ x: 0.5, y: 0.555, r: 92 }, P.coin || {});
      const coinG = el(root, 'g'), coin = T.coin(coinG, sd + 20);
      const sandLip = inkEl(root, SAND), sandLipR = inkEl(root);
      // bubbles
      const bubG = el(root, 'g'), bubs = Array.from({ length: 12 }, (_, i) => ({ e: inkEl(bubG), x: W * (0.72 + (i % 4) * 0.05), ph: i / 12, s: 8 + (i % 3) * 6 }));
      // the diver: mask + snorkel peeking in at the top edge, a wetsuit arm with a dark glove and a blue cuff band
      const maskG = el(root, 'g'), mx = W * 0.86, my = 150;
      sh.add(maskG, inkEllipsePts(mx, my - 40, 150, 130, sd + 200, 14), { fill: mix(INK.ink, INK.inkSoft, 0.5), stroke: INK.ink, w: 5, smooth: true });
      sh.add(maskG, [[mx - 120, my - 20], [mx + 120, my - 20], [mx + 110, my + 70], [mx + 20, my + 90], [mx, my + 60], [mx - 20, my + 90], [mx - 110, my + 70]], { fill: mix(INK.paperLight, INK.blue, 0.35), stroke: INK.ink, w: 9, smooth: true });
      sh.add(maskG, [[mx - 90, my + 10], [mx - 40, my - 4]], { stroke: INK.paperLight, w: 8, closed: false });
      sh.add(maskG, [[mx - 150, my - 30], [mx - 210, my + 40], [mx - 190, my - 160]], { stroke: INK.blue, w: 16, closed: false, smooth: true });
      sh.add(maskG, [[-30, my - 140], [mx - 145, my - 40]], { stroke: INK.ink, w: 12, closed: false });
      const hand = K.hand(el(root, 'g'), sd + 30, { sleeve: 'dark', from: [W * 1.2, -0.06 * H] });
      const hg = root.lastChild.firstChild, glove = mix(INK.inkSoft, INK.ink, 0.35);
      if (hg && hg.children.length >= 13) { hg.children[3].setAttribute('fill', INK.blue); hg.children[8].setAttribute('fill', glove); hg.children[11].setAttribute('fill', glove); }
      const suitG = el(root, 'g'), suitHi = inkEl(suitG, mix(INK.inkSoft, INK.paperLight, 0.35), { 'fill-opacity': 0.8 }), suitSeam = inkEl(suitG, INK.paperLight), suitDark = inkEl(suitG, INK.ink, { 'fill-opacity': 0.35 });
      const labs = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 950);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const reach = T.atOr(cues, P.reach ?? 'reach', 0.2), take = T.atOr(cues, P.take ?? 'take', dur * 0.6);
          const pk = punch(lt, T.atOr(cues, 'hit', take), 0.6);
          sh.update(t, lt);
          fish.forEach((f, i) => {
            const x = ((lt * f.v + f.ph * (W + 400)) % (W + 400)) - 200, y = f.y + Math.sin(lt * 2 + i) * 14, s = f.s * 1.4, wag = Math.sin(lt * 9 + i) * 10 * s;
            const pts = [[x + 60 * s, y], [x + 20 * s, y - 22 * s], [x - 40 * s, y - 10 * s], [x - 70 * s, y - 28 * s + wag], [x - 62 * s, y + wag * 0.2], [x - 70 * s, y + 28 * s + wag], [x - 40 * s, y + 10 * s], [x + 20 * s, y + 22 * s]];
            f.f.setAttribute('d', inkLoop(pts, { seed: sd + 60 + i, t, amp: 0.8 }));
            f.r.setAttribute('d', inkPath(pts, { w: 3.5, seed: sd + 70 + i, t, closed: true, amp: 0.8 }) + ' ' + inkDot(x + 34 * s, y - 4 * s, 4, 4, sd + 80 + i, t));
          });
          // coin: lies tilted in the sand; on take it is lifted and turns to face the viewer
          const lift = progIO(lt, take + 0.25, 1.2);
          const cx = C.x * W + lift * 40, cy = C.y * H - lift * (P.lift ?? 300) + Math.sin(t * 2) * 8 * lift;
          const glint = 0.35 + 0.65 * Math.max(0, Math.sin(t * 3.1)) + pk;
          coin.update(t, cx, cy, C.r * (1 + 0.25 * lift + 0.05 * pk), { crown: 1, glint: Math.min(1, glint), tilt: lerp(0.42, 1, lift), rot: lerp(-8, 0, lift) });
          const lipY = C.y * H + C.r * 0.2;
          const lip = [[C.x * W - C.r * 1.3, lipY + 10], [C.x * W - C.r * 0.6, lipY - 12], [C.x * W + C.r * 0.5, lipY - 8], [C.x * W + C.r * 1.4, lipY + 12], [C.x * W + C.r * 1.2, lipY + 40], [C.x * W - C.r * 1.2, lipY + 40]];
          sandLip.setAttribute('d', inkLoop(lip, { seed: sd + 90, t, amp: 1 }));
          sandLipR.setAttribute('d', inkPath(lip.slice(0, 4), { w: 3, seed: sd + 91, t, amp: 1 }));
          bubs.forEach((b, i) => {
            const u = (lt * 0.35 + b.ph) % 1, y = lerp(H * 0.3, 120, u), x = W * 0.6 + (i % 4) * 22 + Math.sin(u * 12 + i) * 18;
            b.e.setAttribute('d', u < 0.97 ? inkCircle(x, y, b.s * (0.6 + u * 0.6), sd + 100 + i, t, { w: 3 }) : '');
          });
          // the hand: comes down from the upper right, reaches the coin, closes, lifts with it
          const down = progIO(lt, reach, Math.max(0.4, take - reach)), wx = lerp(W * 1.25, cx + C.r * 1.25, down), wy = lerp(-520, cy - C.r * 0.25, down);
          const kind = lt >= take ? 'fist' : 'flat';
          hand.update(t, [wx, wy], 160 + 10 * Math.sin(t * 1.5), 1.25, kind, { mirror: true });
          { // wetsuit sleeve: a lit stripe, a shadow side and a stitched seam along the arm
            const fx = W * 1.2, fy = -0.06 * H, dx = wx - fx, dy = wy - fy, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
            const at = (u, o) => [lerp(fx, wx, u) + nx * o * lerp(95, 58, u) * 1.25, lerp(fy, wy, u) + ny * o * lerp(95, 58, u) * 1.25];
            suitHi.setAttribute('d', inkLoop([at(0.02, 0.15), at(0.02, 0.55), at(0.86, 0.55), at(0.86, 0.15)], { seed: sd + 140, t, amp: 0.8, smooth: false }));
            suitDark.setAttribute('d', inkLoop([at(0.02, -0.5), at(0.02, -0.92), at(0.86, -0.92), at(0.86, -0.5)], { seed: sd + 141, t, amp: 0.8, smooth: false }));
            const seam = [];
            for (let k = 0; k < 14; k++) { const u0 = 0.05 + k * 0.06; seam.push(inkPath([at(u0, -0.05), at(u0 + 0.035, -0.05)], { w: 4, seed: sd + 150 + k, t, amp: 0.4 })); }
            suitSeam.setAttribute('d', seam.join(' '));
          }
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
