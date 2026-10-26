// nea_shadow: a modern person walks along a street in low evening light; their long shadow on the wall beside them
// walks in step, and on the morph cue the shadow turns into a Neanderthal's (Neanderthal DNA Short). The street and
// sky are the scene's "set" (city); this shot draws the lit wall (plaster + brick courses), gold light rays, the
// walker and the two shadows (cross-faded, clipped to the wall).
// P: {walker: {kind: "human", x: 0.14, to: 0.34, y: 1130, s: 1.1, coat: "blue"}, wall: {x0: 0.44, top: 420, bottom: 1130},
//     shadow: {x: 0.72, s: 1.9, a: 0.5}, morph: cue|s, rays: true, labels: [...MCB labels]}
// cues: morph, labels' at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_shadow = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const { atOr, labels } = window.MCB;
      const sd = seed * 1000 + 9600;
      const WK = Object.assign({ kind: 'human', x: 0.1, to: 0.3, y: 1130, s: 1.3, coat: 'blue' }, P.walker || {});
      const WL = Object.assign({ x0: 0.44, top: 420, bottom: 1130 }, P.wall || {});
      const SD = Object.assign({ x: 0.62, s: 1.7, a: 0.5 }, P.shadow || {});
      const root = el(svg, 'g');
      const x0 = WL.x0 * W;
      const wallF = inkEl(root, INK.paperLight), wallS = inkEl(root, INK.paperDark), bricks = inkEl(root, INK.inkSoft), wallL = inkEl(root, INK.ink);
      const cid = 'neash' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: x0 + 6, y: WL.top + 6, width: W - x0 + 40, height: WL.bottom - WL.top - 6 });
      const sg = el(root, 'g', { 'clip-path': `url(#${cid})` });
      const shA = NEA.fig(el(sg, 'g'), 'human', sd + 10), shB = NEA.fig(el(sg, 'g'), 'nean', sd + 20);
      const rays = inkEl(root, INK.gold);
      const walker = NEA.fig(el(root, 'g'), WK.kind, sd + 30);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const mAt = atOr(cues, P.morph, dur * 0.5), mp = prog(lt, mAt, 0.6), pk = punch(lt, mAt, 0.6);
          // wall
          const wp = [[x0, WL.top], [W + 40, WL.top - 30], [W + 40, WL.bottom], [x0, WL.bottom]];
          wallF.setAttribute('d', inkLoop(wp, { seed: sd + 1, t, amp: 0.8, smooth: false }));
          wallS.setAttribute('d', inkLoop([[x0, WL.top], [x0 + 40, WL.top], [x0 + 40, WL.bottom], [x0, WL.bottom]], { seed: sd + 2, t, amp: 0.6, smooth: false }));
          let bd = '';
          for (let r = 0, y = WL.top + 60; y < WL.bottom - 20; r++, y += 64) {
            bd += inkPath([[x0 + 40, y], [W + 40, y - 30 * (W + 40 - x0 - 40) / (W + 40 - x0) * ((WL.bottom - y) / (WL.bottom - WL.top))]], { w: 2.5, seed: sd + 40 + r, t, amp: 0.6 }) + ' ';
            for (let c = 0; c < 6; c++) { const bx = x0 + 90 + c * 120 + (r % 2) * 60; if (bx < W) bd += inkPath([[bx, y - 62], [bx, y - 4]], { w: 2.5, seed: sd + 60 + r * 7 + c, t, amp: 0.5 }) + ' '; }
          }
          bricks.setAttribute('d', bd); bricks.setAttribute('fill-opacity', 0.5);
          wallL.setAttribute('d', inkPath(wp, { w: 6, seed: sd + 3, t, closed: true, amp: 1, smooth: false }));
          // walker + shadows walk in step
          const u = progIO(lt, 0, Math.max(1, dur)), ph = lt * 0.85;
          const wx = lerp(WK.x, WK.to, u) * W;
          const sx = SD.x * W + (wx - WK.x * W) * 1.0;
          shA.draw(t, { x: sx, y: WK.y, s: SD.s, face: 1, walk: 1, ph, sil: true, a: SD.a * (1 - mp) });
          shB.draw(t, { x: sx, y: WK.y, s: SD.s * 1.04 * (1 + 0.05 * pk), face: 1, walk: 1, ph, sil: true, a: SD.a * mp, arm: 'spear' });
          // rays from the low sun on the left
          let rd = '';
          for (let i = 0; i < 5; i++) {
            const y = 380 + i * 120 + Math.sin(t * 0.8 + i) * 8;
            rd += inkPath([[-20, y - 120], [x0 - 10 + i * 30, y + 60]], { w: 10 - i, seed: sd + 80 + i, t, amp: 0.8, taper: 0.6 }) + ' ';
          }
          rays.setAttribute('d', P.rays === false ? '' : rd); rays.setAttribute('fill-opacity', 0.4);
          walker.draw(t, { x: wx, y: WK.y, s: WK.s, face: 1, walk: 1, ph, coat: WK.coat });
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
