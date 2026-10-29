// lh_field: hope is learned, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed,
// time)). Outdoors on a morning meadow (the scene's "hills" set): the same low wooden barrier as the shuttle box stands
// in the grass. Birds cross the sky. Foreground: tall grass and flowers down to the frame bottom. Modes:
//   leap: the dog runs in from the left, leaps over the barrier on `jump`, lands, races on across the meadow, turns
//         round and comes back, then sits down happily (tongue out, tail wagging). Motion fills the whole scene.
//   end:  a medium shot: the dog sits wagging its tail next to Kaşif, the barrier small behind them; Kaşif smiles and
//         points at the dog, then waves at the viewer on `wave`.
// P: {mode: "leap"|"end", gy: 0.6, bar: 0.4 (barrier x), dog: {x, to, s}, kasif: {...} | false, grass: 0.7 (0..1 H)}
// cues: jump (leap), wave (Kaşif seq in end). Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lh_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 733, u = W / 1080, mode = P.mode || 'leap';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const birds = inkEl(root);
      const tufts = inkEl(root, mix(INK.green, INK.ink, 0.2));
      const bar = L.board(root, sd + 20);
      const dg = L.dog(el(root, 'g'), sd + 10);
      const D = Object.assign(mode === 'end' ? { x: 0.36, s: 1.05 } : { x: -0.12, to: 0.68, s: 1.0 }, P.dog || {});
      const kas = P.kasif ? L.kasif(el(root, 'g'), Object.assign({ x: 0.62, y: 0.6, scale: 1.1, pose: 'point', face: 'left', dir: -30, emotion: 'happy' }, P.kasif), W, H, seed) : null;
      const grass = L.front(el(root, 'g'), sd + 30, 'grass');
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // birds (right half of the sky)
          const BD = []; for (let i = 0; i < 4; i++) { const x = ((t * 40 + i * 230) % (W + 200)) - 100, y = (0.17 + 0.04 * (i % 2)) * H + Math.sin(t + i) * 10, f = Math.sin(t * 8 + i) * 10 * u; if (x < 0.55 * W) continue; BD.push(inkPath([[x - 22 * u, y - f], [x, y + 6 * u], [x + 22 * u, y - f]], { w: 4, seed: k + i, t })); }
          birds.setAttribute('d', BD.join(' '));
          const TF = []; for (let i = 0; i < 14; i++) { const x = (i + 0.3) * W / 14, sw = Math.sin(t * 1.5 + i) * 6; TF.push(inkLoop([[x - 18, gy + 8], [x - 6 + sw, gy - 30], [x, gy - 4], [x + 8 + sw, gy - 36], [x + 18, gy + 8]], { seed: k + 10 + i, t, amp: 0.6 })); }
          tufts.setAttribute('d', TF.join(' '));
          const xm = (P.bar ?? (mode === 'end' ? 0.12 : 0.4)) * W, s = D.s * u;
          const bs = mode === 'end' ? 0.75 : 1;
          bar.update(t, xm, gy - (mode === 'end' ? 40 * u : 0), 140 * u * bs, 50 * u * bs, 80 * u * bs, 16 * u * bs);
          let x, y = gy, st;
          if (mode === 'leap') {
            const jp = L.atOr(cues, 'jump', dur * 0.35), fly = 0.85;
            const xA = xm - 230 * s, xL = xm + 150 * s, x1 = D.to * W, far = Math.min(0.86 * W, x1 + 0.16 * W);
            if (lt < jp) { const r = clamp01(lt / Math.max(0.3, jp)); x = lerp(D.x * W, xA, r); st = { pose: 'run', ph: lt * 2.4, face: 1, ear: 0.3 }; }
            else if (lt < jp + fly) { const q = (lt - jp) / fly; x = lerp(xA, xL, q); y = gy - Math.sin(q * Math.PI) * 280 * u; st = { pose: 'jump', prev: 'run', mix: q / 0.15, ground: gy, face: 1 }; }
            else {
              const r = lt - jp - fly;
              if (r < 0.7) { x = lerp(xL, far, progIO(r, 0, 0.7)); st = { pose: 'run', prev: 'jump', mix: r / 0.2, ph: lt * 2.4, face: 1 }; }
              else if (r < 1.5) { const q = (r - 0.7) / 0.8; x = lerp(far, x1, progIO(q, 0, 1)); st = { pose: 'run', ph: lt * 2.4, face: q < 0.15 ? lerp(1, -1, q / 0.15) : -1 }; }
              else { x = x1; st = { pose: 'sit', prev: 'run', mix: (r - 1.5) / 0.3, wag: 1, face: -1 }; }
            }
          } else { x = D.x * W; st = { pose: 'sit', wag: 1, face: 1, ear: 0.1 * Math.sin(t * 2) }; }
          dg.update(t, x, y, s, st);
          if (kas) kas.update(lt, t, cues);
          grass.update(t, W, H, (P.grass ?? 0.7) * H);
        },
      };
    },
  };
})();
