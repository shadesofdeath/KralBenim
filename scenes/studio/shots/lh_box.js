// lh_box: the 1967 shuttle box (Seligman & Maier) in a lab, parchment ink style (brand/kit/BRAND.md §3, §5; boils at
// 8 Hz, pure function of (seed, time)). A two-compartment box with a low, thick middle barrier: the left half is cool,
// dark and grey with small gold zig-zag shock marks flickering above its grid floor, the right half (the way out) is
// warm, lit and golden. A dog lies in the left half, head on its paws, ears down; no pain is drawn, only the marks.
// The box's tall front planks fill the lower frame. Lab wall behind: a clock and (hook) a shelf with jars. Modes:
//   hook: Kaşif stands in the lit half, points at the barrier and jumps back in shock on `shock`. Runs on the global
//         clock env.t (P.realtime, default true), so the engine's slowed hook still plays at real speed. On the
//         thumbnail render (html.cover without .hook) Kaşif is drawn in his last seq pose (shock).
//         A warm beam of light falls into the right half from the upper right.
//   jump: (close-up on the barrier) the marks flash on the left; on `arc` a dashed gold arc is drawn from the dog over
//         the barrier into the lit half, with an arrow head, and P.label pops above it.
//   wait: (close-up on the dog's face) the dog lies still with open, sad eyes (brows up, mouth down) looking at the lit
//         side; the marks keep flashing but it does not move; the wall clock's hands race.
// P: {mode: "hook"|"jump"|"wait", box: {x0, x1, xm, wt, fb, ff, dx, bh, bw, rim, lampX} (stage px), dog: {x, s},
//     zaps: 3, clock: [x, y, r] (0..1, 0..1, px) | false, shelf: (hook), lamp: (not hook), beam: (hook), cart: false,
//     kasif: {...} | false, label: {...}, spin: 1.2 (clock turns/s), arc_h: 170, realtime}
// cues: shock (Kaşif's seq), arc (jump), label.at. Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lh_box = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 811, mode = P.mode || 'hook', u = W / 1080;
      const root = el(svg, 'g');
      const B = Object.assign({ x0: -60, x1: 1240, xm: 590, wt: 760, fb: 1000, ff: 1090, dx: 44, bh: 150, bw: 18, rim: 330, lampX: 820 }, P.box || {});
      B.lamp = P.lamp ?? (mode !== 'hook');
      // wall dressing: shelf with jars, a clock
      const wallG = el(root, 'g');
      const shelf = inkEl(wallG, mix(INK.stain, INK.paperDark, 0.2)), shelfR = inkEl(wallG);
      const jars = [0, 1, 2, 3].map(i => ({ f: inkEl(wallG, [INK.paperLight, INK.blue, INK.paperLight, INK.gold][i]), liq: inkEl(wallG, [INK.green, INK.paperLight, INK.red, INK.paperLight][i], { 'fill-opacity': 0.8 }), r: inkEl(wallG) }));
      const clk = P.clock === false ? null : L.clock(wallG, sd + 20);
      const backG = el(root, 'g');
      const beamE = inkEl(root, INK.paperLight, { 'fill-opacity': 0.34 }), beamE2 = inkEl(root, INK.gold, { 'fill-opacity': 0.16 });
      const dogG = el(root, 'g'), frontG = el(root, 'g'), fxG = el(root, 'g');
      const box = L.shuttle(backG, frontG, sd + 40);
      const zaps = Array.from({ length: P.zaps ?? 3 }, (_, i) => L.zap(fxG, sd + 60 + i * 7));
      const dg = L.dog(dogG, sd + 80);
      const D = Object.assign({ x: 270, s: 1.0 }, P.dog || {});
      const arcE = inkEl(fxG, INK.gold), head = inkEl(fxG, INK.gold), arcR = inkEl(fxG);
      const cart = P.cart ? L.front(el(root, 'g'), sd + 90, 'cart') : null;
      const KK = P.kasif ? Object.assign({ x: 0.74, y: 0.55, scale: 1.1, pose: 'point', face: 'left', dir: -24 }, P.kasif) : null;
      const kas = KK ? L.kasif(el(root, 'g'), KK, W, H, seed) : null;
      const lab = P.label ? L.label(root, P.label, W, H) : null;
      const realtime = P.realtime ?? (mode === 'hook');
      return {
        update(lt0, dur, cues, env = {}) {
          const t = env.t ?? lt0, k = sd, lt = realtime ? t : lt0;
          const root2 = document.documentElement, thumb = root2.classList.contains('cover') && !root2.classList.contains('hook');
          // shelf + jars on the lab wall (hook only)
          const showShelf = P.shelf ?? (mode === 'hook');
          const sy = showShelf ? B.wt - 70 * u : -9999, sx0 = 90 * u, sx1 = 450 * u;
          shelf.setAttribute('d', inkLoop(L.rect(sx0, sy, sx1, sy + 18 * u), { seed: k + 1, t, smooth: false }));
          shelfR.setAttribute('d', inkPath(L.rect(sx0, sy, sx1, sy + 18 * u), { w: 5, seed: k + 2, t, closed: true, smooth: false }) + ' ' +
            inkPath([[sx0 + 30 * u, sy + 18 * u], [sx0 + 50 * u, sy + 60 * u]], { w: 5, seed: k + 3, t }) + ' ' + inkPath([[sx1 - 30 * u, sy + 18 * u], [sx1 - 50 * u, sy + 60 * u]], { w: 5, seed: k + 4, t }));
          jars.forEach((j, i) => {
            const jx = sx0 + (50 + i * 92) * u, jh = [96, 70, 110, 80][i] * u, jw = [30, 40, 26, 36][i] * u;
            const pts = i === 2 ? [[jx - jw * 1.6, sy], [jx + jw * 1.6, sy], [jx + jw * 0.5, sy - jh * 0.55], [jx + jw * 0.5, sy - jh], [jx - jw * 0.5, sy - jh], [jx - jw * 0.5, sy - jh * 0.55]]
              : [[jx - jw, sy], [jx + jw, sy], [jx + jw, sy - jh], [jx - jw, sy - jh]];
            j.f.setAttribute('d', inkLoop(pts, { seed: k + 10 + i, t, smooth: false, amp: 0.8 }));
            const lv = sy - jh * (0.45 + 0.04 * Math.sin(t * 2 + i));
            j.liq.setAttribute('d', inkLoop([[pts[0][0] + 4, sy - 3], [pts[1][0] - 4, sy - 3], [jx + jw * 0.9, lv], [jx - jw * 0.9, lv]], { seed: k + 14 + i, t, smooth: false, amp: 0.6 }));
            j.r.setAttribute('d', inkPath(pts, { w: 4.5, seed: k + 18 + i, t, closed: true, smooth: false, amp: 0.8 }));
          });
          if (clk) {
            const c = P.clock || [0.24, 0.245, 64];
            clk.update(t, c[0] * W, c[1] * H, c[2] * u, (mode === 'wait' ? (P.spin ?? 1.2) * lt : t / 60) + 0.12);
          }
          // the box
          const res = box.update(t, Object.assign({ light: 0.9 + 0.1 * Math.sin(t * 1.3) }, B));
          const fy = (B.fb + B.ff) / 2 + 6 * u, xm = res.xm;
          // a warm beam into the lit half (the way out)
          if (P.beam ?? (mode === 'hook')) {
            const sw = Math.sin(t * 0.8) * 8 * u;
            const bp = [[W + 60, 0.2 * H], [W + 60, 0.3 * H], [xm + 300 * u + sw, fy + 20 * u], [xm + 40 * u + sw, fy + 10 * u]];
            beamE.setAttribute('d', inkLoop(bp, { seed: k + 30, t, smooth: false, amp: 1 }));
            beamE2.setAttribute('d', inkLoop([[W + 60, 0.22 * H], [W + 60, 0.27 * H], [xm + 220 * u + sw, fy + 16 * u], [xm + 110 * u + sw, fy + 12 * u]], { seed: k + 31, t, smooth: false, amp: 1 }));
          } else L.blank(beamE, beamE2);
          // shock marks: only in the left half, around the dog
          const zk = mode === 'jump' ? 1 : 0.85;
          const ZP = [[xm - 500 * u, fy - 150 * u], [xm - 110 * u, fy - 200 * u], [xm - 300 * u, fy - 235 * u], [xm - 180 * u, fy - 120 * u]];
          zaps.forEach((z, i) => { const q = ZP[i % ZP.length]; z.update(t, q[0], q[1], (mode === 'hook' ? 46 : 52) * u, zk, i); });
          // the dog lies in the left half
          const zapNow = ((t * 5 + 0.37 + (sd + 60) * 0.13) % 1) < 0.25;
          const st = { pose: 'lie', face: 1 };
          if (mode === 'wait') Object.assign(st, { eye: 0.95 - 0.05 * Math.sin(t * 0.6), brow: 1.3, smile: -1.2, sway: 0 });
          else Object.assign(st, { ear: zapNow ? 0.16 : 0.04 * Math.sin(t * 3), shake: mode === 'jump' && zapNow ? 0.35 : 0, sway: 0.5, eye: mode === 'hook' ? 0.95 - 0.05 * Math.sin(t * 0.7) : undefined, brow: mode === 'hook' ? 1.3 : 1.1, smile: mode === 'hook' ? -1.2 : undefined });
          dg.update(t, D.x * u, fy, D.s * u, st);
          // the jump arc: from the dog over the barrier into the lit half
          const a0 = L.atOr(cues, 'arc', dur * 0.35);
          let q = 0, fade = 1;
          if (mode === 'jump') q = clamp01((lt - a0) / 0.9);
          if (q > 0.01) {
            const p0 = [D.x * u + 210 * D.s * u, fy - 110 * u], p2 = [xm + 250 * u, fy - 20 * u], top = res.bar[0][1] - (P.arc_h ?? 170) * u;
            const pc = [xm + B.dx * 0.5, top];
            const N = 26, A = [];
            for (let i = 0; i <= N; i++) { const s = i / N; if (s > q) break; A.push([(1 - s) * (1 - s) * p0[0] + 2 * (1 - s) * s * pc[0] + s * s * p2[0], (1 - s) * (1 - s) * p0[1] + 2 * (1 - s) * s * pc[1] + s * s * p2[1]]); }
            const dashes = [];
            for (let i = 0; i + 1 < A.length; i += 2) dashes.push(inkPath([A[i], A[i + 1]], { w: 12 * u, seed: k + 200 + i, t, amp: 0.6, taper: 0 }));
            arcE.setAttribute('d', dashes.join(' '));
            const e = A[A.length - 1], pv = A[Math.max(0, A.length - 3)], ang = Math.atan2(e[1] - pv[1], e[0] - pv[0]);
            head.setAttribute('d', q > 0.9 ? inkLoop([[e[0] + Math.cos(ang) * 32 * u, e[1] + Math.sin(ang) * 32 * u], [e[0] + Math.cos(ang + 2.4) * 32 * u, e[1] + Math.sin(ang + 2.4) * 32 * u], [e[0] + Math.cos(ang - 2.4) * 32 * u, e[1] + Math.sin(ang - 2.4) * 32 * u]], { seed: k + 260, t, smooth: false, amp: 0.6 }) : '');
          } else { arcE.setAttribute('d', ''); head.setAttribute('d', ''); }
          arcR.setAttribute('d', '');
          if (cart) cart.update(t, W, H, (P.cart_top ?? 0.79) * H, { x0: -0.06, x1: 0.44, cable: [B.x0 + 30 * u, B.ff + B.rim * 0.6] });
          if (kas) kas.update(thumb ? 99 : lt, t, cues);   // thumbnail: Kaşif in his cue pose (shock)
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
