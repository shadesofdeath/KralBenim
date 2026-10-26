// kaime_fire: paper money burned on a city square (the Ottoman kaime withdrawal, 1878-79), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). A mound of banknotes on the cobbles burns
// in a big three-layer ink flame; burning notes curl and rise with the smoke; behind it a row of fez-wearing
// officials and onlookers in ink-wash silhouette; an official on the left tosses a tied bundle of notes into the
// fire on `toss`. The flame flares on `hit`. Leaves sky and ground to the scene's "set" (city / night); ground y ≈ 0.6 H.
// P: {x: 0.5 (fire centre), gy: 0.6 (ground, 0..1 H), size: 1 (fire + mound scale), flame_h: 640 (px), ember_top: 0.26,
//     smoke_top: 0.24 (0..1 H: how high burning notes / smoke rise; keep the kicker clear in close-ups), crowd: true, tosser: true,
//     embers: 9, kasif: {x, y, scale, pose, face, dir, emotion, seq: [{at, pose, ...}]} | false,
//     label: {text, x, y, at, size, color}}
//     crowd_n: 5 (how many onlookers), fore: true (cobbles + crowd heads + scraps below the ground line)
// cues: toss (bundle flies in), hit (flare + punch), label.at, kasif seq names. Needs kaime__lib.js (KMA).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.kaime_fire = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, M = window.KMA;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, cx = (P.x ?? 0.5) * W, sz = (P.size ?? 1) * W / 1080;
      // ground line + foreground (cobbles, crowd heads, burnt scraps) down to the frame bottom
      const foreL = P.fore === false ? null : M.fore(root, 'cobbles', sd + 5);
      const ground = inkEl(root);
      // crowd behind the fire
      const crowdG = el(root, 'g');
      const crowd = P.crowd === false ? [] : [
        { x: 0.1, s: 0.5, face: 1, beard: true }, { x: 0.24, s: 0.46, face: 1, coat: 'blue' }, { x: 0.72, s: 0.47, face: -1, beard: true },
        { x: 0.86, s: 0.5, face: -1, coat: 'blue' }, { x: 0.96, s: 0.44, face: -1 },
      ].slice(0, P.crowd_n ?? 5).map((c, i) => Object.assign(c, { f: M.fig(crowdG, sd + 10 + i, c) }));
      const smoke = M.smoke(root, sd + 50, 8);
      // mound of notes (fixed layout per seed)
      const moundG = el(root, 'g');
      const r = rng(sd + 3), mound = [];
      for (let i = 0; i < 16; i++) {
        const u = (i % 8) / 7, row = Math.floor(i / 8);
        const nt = M.note(moundG, sd + 100 + i);
        mound.push({ nt, x: (u - 0.5) * 360 * (row ? 0.7 : 1) + (r() - 0.5) * 30, y: -20 - row * 46 - Math.sin(u * Math.PI) * 60 * (row ? 1.2 : 1) + (r() - 0.5) * 10, rot: (r() - 0.5) * 70, b: 0.15 + r() * 0.5 });
      }
      const fl = M.flame(root, sd + 200), fl2 = M.flame(root, sd + 210);
      // a few notes in front of the flames, at the foot of the fire
      const frontG = el(root, 'g'), front = [-200, -95, 20, 130, 215].map((x, i) => ({ nt: M.note(frontG, sd + 150 + i), x, y: -8 - (i % 2) * 18, rot: (i - 2) * 14 + (r() - 0.5) * 20, b: 0.1 + r() * 0.3 }));
      // rising burning notes
      const embG = el(root, 'g');
      const embers = Array.from({ length: P.embers ?? 9 }, (_, i) => ({ nt: M.note(embG, sd + 300 + i), ph: i / (P.embers ?? 9), sx: (r() - 0.5), rot0: r() * 360, spin: (r() - 0.5) * 200 }));
      // the official tossing a bundle
      const tossG = el(root, 'g');
      const tosser = P.tosser === false ? null : M.fig(tossG, sd + 400, { beard: true });
      const bundleG = el(root, 'g'), bundle = M.note(bundleG, sd + 410), bundle2 = M.note(bundleG, sd + 411), strap = inkEl(bundleG, INK.red);
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.8, y: (P.gy ?? 0.6), scale: 0.78, pose: 'idle', face: -1 }, P.kasif), W, H, seed) : null;
      const lab = P.label ? M.label(root, P.label, W, H) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = M.atOr(cues, 'hit', null), tossAt = M.atOr(cues, 'toss', null);
          const flare = 1 + 0.35 * punch(lt, hitAt, 1.2) + (hitAt != null && lt > hitAt ? 0.12 : 0);
          const k = (0.75 + 0.25 * prog(lt, 0, 0.6)) * flare;
          if (foreL) foreL.update(t, W, H, gy);
          ground.setAttribute('d', inkPath([[-20, gy], [W * 0.5, gy + 3], [W + 20, gy]], { w: 5, seed: sd + 1, t, amp: 1.5 }));
          crowd.forEach((c, i) => {
            const raise = hitAt != null && lt > hitAt + i * 0.08 ? 1 : 0;   // on the flare they flinch back
            c.f.update(t, c.x * W, gy - 40, c.s * sz, { face: c.face, lean: raise ? -8 * c.face : 2 * c.face,
              armR: raise ? [c.x * W + 40 * c.face * c.s, gy - 40 - 420 * c.s] : null });
          });
          smoke.update(t, cx, Math.max(gy - (P.flame_h ?? 640) * 0.65 * sz * k, H * (P.smoke_top ?? 0.24) + 60), 260 * sz, H * (P.smoke_top ?? 0.24), 0.85);
          mound.forEach((m, i) => {
            m.nt.g.setAttribute('transform', `translate(${M.f1(cx + m.x * sz)} ${M.f1(gy + m.y * sz)}) rotate(${M.f1(m.rot)}) scale(${M.f1(0.42 * sz * 100) / 100})`);
            m.nt.update(t, { burn: Math.min(0.85, m.b + lt * 0.04), seal: 1, write: 1, value: i % 3 ? null : '100' });
          });
          fl.update(t, cx, gy - 30 * sz, 520 * sz, (P.flame_h ?? 640) * sz, k);
          fl2.update(t + 0.3, cx + 150 * sz, gy - 20 * sz, 220 * sz, (P.flame_h ?? 640) * 0.47 * sz, k * 0.9);
          front.forEach((m, i) => {
            m.nt.g.setAttribute('transform', `translate(${M.f1(cx + m.x * sz)} ${M.f1(gy + m.y * sz)}) rotate(${M.f1(m.rot)}) scale(${M.f1(0.4 * sz * 100) / 100})`);
            m.nt.update(t, { burn: Math.min(0.7, m.b + lt * 0.05), seal: 1, write: 1, value: i % 2 ? '100' : null });
          });
          // embers: notes rising, spinning, burning away
          embers.forEach((e, i) => {
            const u = ((lt * 0.28 + e.ph) % 1);
            const x = cx + e.sx * 380 * sz + Math.sin(u * 6 + i) * 60 * sz, y = lerp(gy - 200 * sz, H * (P.ember_top ?? 0.26), u);
            e.nt.g.setAttribute('transform', `translate(${M.f1(x)} ${M.f1(y)}) rotate(${M.f1(e.rot0 + e.spin * u)}) scale(${M.f1(lerp(0.3, 0.2, u) * sz * 100) / 100})`);
            e.nt.update(t, { burn: lerp(0.15, 1, u), seal: 1, write: 1 });
          });
          // the toss
          if (tosser) {
            const tx = W * 0.2, ta = tossAt ?? dur * 0.3, wind = prog(lt, ta - 0.5, 0.45), thr = prog(lt, ta, 0.25);
            const arm = [tx + lerp(lerp(60, -70, wind), 120, thr) * sz, gy - lerp(lerp(250, 420, wind), 470, thr) * sz];
            const p = tosser.update(t, tx, gy, 0.85 * sz, { face: 1, lean: lerp(-6, 10, thr), armR: arm, armL: [tx + 70 * sz, gy - 230 * sz] });
            const fly = clamp01((lt - ta) / 0.8);
            let bx, by, rot;
            if (lt < ta) { bx = p.hR[0]; by = p.hR[1] - 30 * sz; rot = -20; }
            else { bx = lerp(p.hR[0], cx - 40 * sz, fly); by = lerp(p.hR[1], gy - 120 * sz, fly) - Math.sin(fly * Math.PI) * 260 * sz; rot = -20 + fly * 220; }
            const gone = fly >= 1;
            bundleG.setAttribute('transform', gone ? 'scale(0)' : `translate(${M.f1(bx)} ${M.f1(by)}) rotate(${M.f1(rot)})`);
            if (!gone) {
              bundle.g.setAttribute('transform', `scale(${M.f1(0.36 * sz * 100) / 100})`);
              bundle2.g.setAttribute('transform', `translate(6 -8) rotate(4) scale(${M.f1(0.36 * sz * 100) / 100})`);
              bundle.update(t, { seal: 1, value: '100' }); bundle2.update(t, { seal: 1, value: '100' });
              strap.setAttribute('d', inkPath([[0, -52 * sz], [4, 52 * sz]], { w: 14 * sz, seed: sd + 412, t, amp: 0.8 }));
            }
          }
          if (kas) kas.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
