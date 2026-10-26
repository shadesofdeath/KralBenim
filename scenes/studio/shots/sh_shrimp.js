// sh_shrimp: a big pistol shrimp on the seabed (parchment ink, brand/kit/BRAND.md §3, §5) that can snap its giant
// claw: the claw closes, a water jet shoots out, a cavitation bubble swells and collapses into a bang (gold flash,
// ink spikes, sound rings, camera shake). Optional size-reference finger, a tiny submarine that peeks out from
// behind the shrimp, hand-drawn arrows, pop-in labels and the narrator. Uses sh__lib.js (SHR) + td__lib.js (TD).
// P: {shrimp: {x: 0.5, y: 0.6 (ground under the body, 0..1), s: 0.85, face: 1, rot: 0, at: cue (springs in)},
//     snap: cue|sec|null (claw closes), burst: cue|sec (bang; default snap + 0.4) | false, bubble_r: 70, burst_r: 120,
//     bubble_dx: 110 (bubble centre ahead of the claw tip, shrimp units; small = burst right at the tip),
//     prey: {x: 0.8, y: 0.45, s: 0.8, face: 1, stun: cue|sec (flips belly-up, X eyes, dizzy stars)} | false,
//     resnap: 0 (seconds between extra idle snaps after the bang, 0 = none),
//     finger: {x: 0.98, y: 0.36 (fingertip), s: 1, at: cue|sec (slides in)} | false,
//     sub: {from: [x, y], to: [x, y] (0..1, hull centre), at: cue|sec, dur: 1.4, s: 0.35, face: 1, front: false} | false,
//     water: {surface: false, bed: 0.6} | false, labels: [TD.label specs], arrows: [{from: [x, y], to: [x, y], at, color}],
//     kasif: {x, y, scale, pose, face, dir, emotion, seq} | false, cam: {zoom: 1.06, focus: [0.5, 0.45]}}
// cues: hit (punch), snap / burst / labels / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  // shared snap timing: {close 0..1, jet 0..1, r (bubble radius), age (seconds since bang or null)}
  function snapState(lt, snapAt, burstAt, R, resnap) {
    if (snapAt == null) return { close: 0, jet: 0, r: 0, age: null };
    let s = snapAt, b = burstAt;
    if (resnap > 0 && b != null && lt > b + resnap) {          // idle repeat snaps
      const sh = Math.floor((lt - b) / resnap) * resnap;
      s += sh; b += sh;
    }
    let close = lt < s ? 0 : clamp01((lt - s) / 0.06);
    if (b != null && lt > b + 0.7) close = 1 - progIO(lt, b + 0.7, 0.6);
    const jet = lt < s ? 0 : (b != null && lt > b ? Math.max(0, 1 - (lt - b) / 0.2) : prog(lt, s, 0.3));
    let r = 0;
    if (lt >= s + 0.02) {
      if (b == null) r = R * prog(lt, s + 0.02, 0.4);
      else if (lt < b - 0.1) r = R * prog(lt, s + 0.02, Math.max(0.08, b - 0.1 - s - 0.02));
      else if (lt < b) r = R * (1 - (lt - (b - 0.1)) / 0.1);
    }
    return { close, jet: clamp01(jet), r, age: b != null && lt >= b ? lt - b : null };
  }

  window.SHR_SNAP = snapState;

  SH.sh_shrimp = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, SHR = window.SHR, f1 = SHR.f1, atOr = TD.atOr, sd = seed * 1000 + 611;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const WT = P.water === false ? null : Object.assign({ surface: false, bed: 0.6 }, P.water || {});
      const water = WT ? SHR.water(cam, sd + 1, W, H, WT) : null;
      const SB = P.sub ? Object.assign({ from: [0.3, 0.5], to: [0.4, 0.5], dur: 1.4, s: 0.35, face: 1 }, P.sub) : null;
      const subBack = SB && !SB.front ? SHR.sub(el(cam, 'g'), sd + 2) : null;
      const SR = Object.assign({ x: 0.5, y: 0.6, s: 0.85, face: 1, rot: 0 }, P.shrimp || {});
      const shrimp = SHR.shrimp(el(cam, 'g'), sd + 3);
      const subFront = SB && SB.front ? SHR.sub(el(cam, 'g'), sd + 2) : null;
      const FG = P.finger ? Object.assign({ x: 0.98, y: 0.36, s: 1 }, P.finger) : null, finger = FG ? SHR.finger(el(cam, 'g'), sd + 4) : null;
      const PR = P.prey ? Object.assign({ x: 0.8, y: 0.45, s: 0.8, face: 1 }, P.prey) : null, prey = PR ? SHR.fish(el(cam, 'g'), sd + 9) : null;
      const fx = el(cam, 'g'), bub = SHR.bubble(fx, sd + 6), jet = SHR.jet(fx, sd + 5), bang = SHR.burst(fx, sd + 7);
      const arrows = (P.arrows || []).map((A, i) => ({ A, a: SHR.arrow(cam, sd + 40 + i) }));
      const labels = (P.labels || []).map((L, i) => TD.label(cam, L, W, H, sd + 20 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.18, y: 0.6, scale: 0.8, pose: 'point', face: 'right' }, P.kasif), sd + 8) : null;
      const C = Object.assign({ zoom: 1.06, focus: [0.5, 0.45] }, P.cam || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const snapAt = P.snap == null ? null : atOr(cues, P.snap, null);
          const burstAt = P.burst === false || snapAt == null ? null : atOr(cues, P.burst, snapAt + 0.4);
          const st = snapState(lt, snapAt, burstAt, P.bubble_r ?? 70, P.resnap || 0);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let shake = 0;
          if (st.age != null && st.age < 0.4) shake = Math.sin(st.age * 95) * 14 * (1 - st.age / 0.4);
          const z = lerp(1, C.zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          const cx = C.focus[0] * W, cy = C.focus[1] * H;
          cam.setAttribute('transform', `translate(${f1(cx + shake)} ${f1(cy + shake * 0.5)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          if (water) water.update(t);
          const a0 = atOr(cues, SR.at, null), pin = a0 == null ? 1 : (lt >= a0 ? spring(lt, a0, 0.7) : 0);
          const bob = Math.sin(lt * 2.1) * 6;
          const o = { x: SR.x * W + (1 - pin) * -W * 0.6, y: SR.y * H + bob * 0.3, s: SR.s * (1 + 0.03 * hit), face: SR.face, rot: SR.rot + Math.sin(lt * 1.3) * 1.2, close: st.close };
          if (SB) {
            const a = atOr(cues, SB.at, 0.2), p = lt >= a ? progIO(lt, a, SB.dur) : 0;
            const so = { x: lerp(SB.from[0], SB.to[0], p) * W, y: lerp(SB.from[1], SB.to[1], p) * H + Math.sin(lt * 1.5) * 6, s: SB.s, face: SB.face, rot: Math.sin(lt * 1.1) * 1.5 };
            (subBack || subFront).update(t, so);
          }
          const r = shrimp.update(t, o);
          if (finger) {
            const a = atOr(cues, FG.at, 0.1), p = lt >= a ? spring(lt, a, 0.8) : 0;
            finger.update(t, { x: FG.x * W + (1 - p) * W * 0.7 + Math.sin(lt * 1.2) * 8, y: FG.y * H, s: FG.s });
          }
          const dir = SR.face < 0 ? -1 : 1, tip = r.tip;
          const bx = tip[0] + dir * (P.bubble_dx ?? (40 + (P.bubble_r ?? 70))) * SR.s;
          jet.update(t, tip[0], tip[1], dir, Math.max(190, (P.bubble_dx ?? 110) + 2 * (P.bubble_r ?? 70) + 60) * SR.s, st.jet);
          if (prey) {
            const sa = atOr(cues, PR.stun, null), sp = sa == null ? 0 : (lt >= sa ? progIO(lt, sa, 0.5) : 0);
            const kick = st.age != null && st.age < 0.6 ? Math.sin(st.age * 30) * 18 * (1 - st.age / 0.6) : 0;
            prey.update(t, { x: PR.x * W + kick + Math.sin(lt * 1.4) * 14 * (1 - sp), y: PR.y * H + Math.sin(lt * 2) * 10 + sp * 40, s: PR.s, face: PR.face, stun: sp });
          }
          bub.update(t, bx, tip[1], st.r * SR.s * 1.2);
          bang.update(t, bx, tip[1], st.age, (P.burst_r ?? 120) * SR.s * 1.2);
          arrows.forEach(({ A, a }) => {
            const at = atOr(cues, A.at, 0.3), p = lt >= at ? prog(lt, at, 0.4) : 0;
            a.update(t, [A.from[0] * W, A.from[1] * H], [A.to[0] * W, A.to[1] * H], p, A.color && INK[A.color]);
          });
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
