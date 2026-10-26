// ce_scope: a 19th-century astronomer projecting the Sun onto a screen and sketching sunspots (mode "wide"), or a
// close-up of the projected disc where two white-light flare kernels burst out (mode "disc"). Carrington Event Short
// (Stickstory 2026-10-26), parametric. Uses ce__lib.js (CE: scope, board, fig) and td__lib.js (TD: sun, label).
// P: {
//   mode: "wide" | "disc",
//   sketch_at: cue|sec (sunspots get drawn one by one over ~1.6 s), flare_at: cue (kernels burst, camera jolts),
//   disc: {x: 0.5, y: 0.4, r: 380 (disc mode) | 150 (wide)},
//   window: {x: 0.2, y: 0.24} (wide: the window with the Sun the telescope points at),
//   cast: [{who: "man", beard, accessory, x, y, scale, pose, face, dir, seq}] (the astronomer, pencil in hand),
//   group_scale: 1 (wide) | 1.7 (disc) (size of the sunspot group), kasif: K | false, labels: [...], cam: {zoom: 1.06}
// }   cues: hit (punch), sketch_at, flare_at, seq / label names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.ce_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CE = window.CE, TD = window.TD, f1 = CE.f1, atOr = CE.atOr, sd = seed * 1000 + 733;
      const wide = (P.mode || 'wide') === 'wide';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const DS = Object.assign(wide ? { x: 0.66, y: 0.36, r: 150 } : { x: 0.46, y: 0.38, r: 380 }, P.disc || {});
      const WN = Object.assign({ x: 0.2, y: 0.22 }, P.window || {});
      const winF = wide ? inkEl(cam, INK.paperLight) : null, winR = wide ? inkEl(cam) : null;
      const sun = wide ? TD.sun(cam, sd + 1) : null;
      const beam = wide ? inkEl(cam, INK.gold, { 'fill-opacity': 0.22 }) : null;
      const floorR = inkEl(cam);
      const scope = wide ? CE.scope(cam, sd + 2) : null;
      const brd = CE.board(cam, sd + 3);
      const rays = !wide ? inkEl(cam, INK.gold) : null;
      const castG = el(root, 'g');
      const cast = (P.cast || []).map((K, i) => CE.fig(castG, Object.assign({ who: 'man', scale: 0.8, pose: 'point' }, K), sd + 40 + i * 13));
      const pencil = inkEl(root, INK.gold), pencilR = inkEl(root);
      const kas = P.kasif ? CE.fig(castG, Object.assign({ x: 0.84, y: 0.6, scale: 0.8, pose: 'point', face: 'left' }, P.kasif), sd + 80) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      const zoom = (P.cam && P.cam.zoom) || (wide ? 1.06 : 1.1);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const fa = atOr(cues, P.flare_at, null), fl = fa == null ? 0 : (lt >= fa ? spring(lt, fa, 0.6) : 0), flash = fa == null ? 0 : (lt >= fa ? Math.max(0.25, Math.exp(-(lt - fa) * 2.5)) : 0);
          let shake = 0;
          if (fa != null && lt >= fa && lt < fa + 0.4) shake = Math.sin(lt * 85) * 9 * (1 - (lt - fa) / 0.4);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit + 0.03 * punch(lt, fa, 0.5));
          const fx = DS.x * W, fy = DS.y * H;
          cam.setAttribute('transform', `translate(${f1(fx + shake)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const ska = atOr(cues, P.sketch_at, wide ? 0.3 : null), sk = ska == null ? 1 : (lt >= ska ? clamp01((lt - ska) / 1.6) : 0.15);
          const GY = 0.6 * H;
          floorR.setAttribute('d', inkPath([[-40, GY + 6], [W * 0.5, GY - 4], [W + 40, GY + 8]], { w: 6, seed: sd + 5, t }));
          let eye = null;
          if (wide) {
            const wx = WN.x * W, wy = WN.y * H, ww = 250, wh = 300;
            const R = CE.rect(wx - ww / 2, wy - wh / 2, ww, wh);
            winF.setAttribute('d', inkLoop(R, { seed: sd + 6, t, amp: 1, smooth: false }));
            winR.setAttribute('d', inkPath(R, { w: 8, seed: sd + 7, t, closed: true, amp: 1, smooth: false }) + ' ' + inkPath([[wx, wy - wh / 2], [wx, wy + wh / 2]], { w: 5, seed: sd + 8, t }) + ' ' + inkPath([[wx - ww / 2, wy], [wx + ww / 2, wy]], { w: 5, seed: sd + 9, t }));
            sun.update(t, wx - 30, wy - 50, 44 * (1 + 0.03 * Math.sin(t * 2)));
            const r = scope.update(t, 0.36 * W, GY, 0.85, -142 + Math.sin(lt * 0.6) * 1.5);
            eye = r.eye;
            // projected light cone: eyepiece -> screen
            const bx = DS.x * W, by = DS.y * H;
            beam.setAttribute('d', inkLoop([[eye[0] - 6, eye[1] - 6], [bx - DS.r * 0.95, by - DS.r * 0.3], [bx - DS.r * 0.95, by + DS.r * 0.3], [eye[0] + 6, eye[1] + 6]], { seed: sd + 10, t, amp: 1, smooth: false }));
          }
          const out = brd.update(t, DS.x * W, DS.y * H, DS.r * (1 + 0.04 * punch(lt, fa, 0.5)), { frame: wide, spots: sk, flare: fl, flash, gs: P.group_scale ?? (wide ? 1 : 1.7) });
          if (rays) {
            let d = '';
            if (fl > 0.01) for (let k = 0; k < 16; k++) {
              const a = k / 16 * Math.PI * 2 + lt * 0.2, R0 = DS.r * 1.06, R1 = R0 + DS.r * (0.12 + 0.18 * flash) * (0.6 + 0.6 * CE.hz(k, t, sd));
              d += inkPath([[DS.x * W + Math.cos(a) * R0, DS.y * H + Math.sin(a) * R0], [DS.x * W + Math.cos(a) * R1, DS.y * H + Math.sin(a) * R1]], { w: 9, seed: sd + 20 + k, t, amp: 1, taper: 0.7 }) + ' ';
            }
            rays.setAttribute('d', d);
          }
          const outs = cast.map(c => c.update(lt, t, cues, W, H));
          // the astronomer's pencil
          if (outs[0] && wide) {
            const h = outs[0].hand, dx = -outs[0].face * 40;
            const pts = [[h[0], h[1]], [h[0] + dx, h[1] - 26]];
            pencil.setAttribute('d', inkPath(pts, { w: 12, seed: sd + 30, t, amp: 0.5 }));
            pencilR.setAttribute('d', inkPath(pts, { w: 3, seed: sd + 31, t, amp: 0.5 }));
          } else { pencil.setAttribute('d', ''); pencilR.setAttribute('d', ''); }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
          void out;
        },
      };
    },
  };
})();
