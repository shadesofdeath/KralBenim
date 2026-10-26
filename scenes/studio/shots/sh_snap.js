// sh_snap: close-up of the pistol shrimp's snapping claw inside a giant magnifying glass held by the narrator
// (parchment ink, brand/kit/BRAND.md §3, §5). Inside the lens: water, the huge claw, the water jet, the swelling
// cavitation bubble and its collapse (gold flash, spikes, sound rings, shake). Uses sh__lib.js (SHR), td__lib.js (TD)
// and the snap timing of sh_shrimp.js (window.SHR_SNAP).
// P: {lens: {x: 0.5, y: 0.36, r: 400}, shrimp: {x: -0.25, y: 0.5, s: 2 (world placement, 0..1 W/H; the claw sits
//     in the lens)}, snap: cue|sec (claw closes) | "pre" (claw already shut, bubble already swollen),
//     burst: cue|sec (bang; default snap + 0.5) | false, bubble_r: 70, burst_r: 110,
//     labels: [TD.label specs], arrows: [{from, to, at, color}],
//     kasif: {x: 0.84, y: 0.6, scale: 0.75, pose: "point", dir: 35, ...} | false (holds the lens handle)}
// cues: hit (punch), snap / burst / labels / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  let clipN = 0;

  SH.sh_snap = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, SHR = window.SHR, f1 = SHR.f1, atOr = TD.atOr, sd = seed * 1000 + 677;
      const L = Object.assign({ x: 0.5, y: 0.36, r: 400 }, P.lens || {});
      const id = 'shlens' + (seed % 100000) + '_' + (clipN++);
      const cp = el(defs || svg, 'clipPath', { id }), cc = el(cp, 'circle');
      const root = el(svg, 'g'), cam = el(root, 'g');
      const handleO = inkEl(cam), handleF = inkEl(cam, INK.hatBand);
      const glassF = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.9 });
      const inner = el(cam, 'g', { 'clip-path': `url(#${id})` }), zoomG = el(inner, 'g');
      const water = SHR.water(zoomG, sd + 1, W, H, { y0: L.y - L.r / H, y1: L.y + L.r / H });
      const SR = Object.assign({ x: -0.25, y: 0.5, s: 2 }, P.shrimp || {});
      const shrimp = SHR.shrimp(el(zoomG, 'g'), sd + 3);
      const bub = SHR.bubble(zoomG, sd + 6), jet = SHR.jet(zoomG, sd + 5), bang = SHR.burst(zoomG, sd + 7);
      const rim = inkEl(cam), rim2 = inkEl(cam, INK.inkSoft), glint = inkEl(cam, INK.paperLight);
      const arrows = (P.arrows || []).map((A, i) => ({ A, a: SHR.arrow(cam, sd + 40 + i) }));
      const labels = (P.labels || []).map((Lb, i) => TD.label(cam, Lb, W, H, sd + 20 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.84, y: 0.6, scale: 0.75, pose: 'point', dir: 35, face: 'left' }, P.kasif), sd + 8) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const pre = P.snap === 'pre';
          const snapAt = pre ? -5 : (P.snap == null ? null : atOr(cues, P.snap, null));
          const burstAt = P.burst === false || snapAt == null ? null : atOr(cues, P.burst, snapAt + 0.5);
          const st = window.SHR_SNAP(lt, snapAt, burstAt, P.bubble_r ?? 70, 0);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let shake = 0;
          if (st.age != null && st.age < 0.4) shake = Math.sin(st.age * 95) * 12 * (1 - st.age / 0.4);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          const lx = L.x * W, ly = L.y * H;
          cam.setAttribute('transform', `translate(${f1(lx + shake)} ${f1(ly)}) scale(${z.toFixed(4)}) translate(${f1(-lx)} ${f1(-ly)})`);
          // slow push inside the lens
          const zi = lerp(1, 1.08, progIO(lt, 0, Math.max(1, dur)));
          zoomG.setAttribute('transform', `translate(${f1(lx)} ${f1(ly + shake * 0.6)}) scale(${zi.toFixed(4)}) translate(${f1(-lx)} ${f1(-ly)})`);
          cc.setAttribute('cx', f1(lx)); cc.setAttribute('cy', f1(ly)); cc.setAttribute('r', f1(L.r - 6));
          const lens = SHR.ell(lx, ly, L.r, L.r, 28);
          glassF.setAttribute('d', inkLoop(lens, { seed: sd + 50, t, amp: 1 }));
          rim.setAttribute('d', inkPath(lens, { w: 16, seed: sd + 51, t, closed: true, amp: 1.2 }));
          rim2.setAttribute('d', inkPath(SHR.ell(lx, ly, L.r - 18, L.r - 18, 28), { w: 4, seed: sd + 52, t, closed: true, amp: 1 }));
          glint.setAttribute('d', inkPath([[lx - L.r * 0.7, ly - L.r * 0.25], [lx - L.r * 0.6, ly - L.r * 0.5], [lx - L.r * 0.38, ly - L.r * 0.68]], { w: 14, seed: sd + 53, t, amp: 1 }));
          water.update(t);
          const r = shrimp.update(t, { x: SR.x * W, y: SR.y * H + Math.sin(lt * 1.8) * 5, s: SR.s, face: 1, rot: Math.sin(lt * 1.1) * 0.8, close: st.close });
          const tip = r.tip, R = (P.bubble_r ?? 70) * SR.s * 0.75, bx = tip[0] + 30 + R;
          jet.update(t, tip[0], tip[1], 1, 30 + 2 * R + 150, st.jet);
          bub.update(t, bx, tip[1], st.r / (P.bubble_r ?? 70) * R);
          bang.update(t, bx, tip[1], st.age, (P.burst_r ?? 110) * SR.s * 0.6);
          // narrator holds the handle
          let hand = [lx + L.r * 0.95, ly + L.r * 1.1];
          if (kas) { const k = kas.update(lt, t, cues, W, H); if (k && k.hand) hand = k.hand; }
          const a = Math.atan2(hand[1] - ly, hand[0] - lx), h0 = [lx + Math.cos(a) * (L.r + 4), ly + Math.sin(a) * (L.r + 4)];
          handleO.setAttribute('d', inkPath([h0, hand], { w: 40, seed: sd + 60, t, amp: 1, taper: 0 }));
          handleF.setAttribute('d', inkPath([[lerp(h0[0], hand[0], 0.08), lerp(h0[1], hand[1], 0.08)], [lerp(h0[0], hand[0], 0.96), lerp(h0[1], hand[1], 0.96)]], { w: 26, seed: sd + 61, t, amp: 1, taper: 0 }));
          arrows.forEach(({ A, a: ar }) => {
            const at = atOr(cues, A.at, 0.3), p = lt >= at ? prog(lt, at, 0.4) : 0;
            ar.update(t, [A.from[0] * W, A.from[1] * H], [A.to[0] * W, A.to[1] * H], p, A.color && INK[A.color]);
          });
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
