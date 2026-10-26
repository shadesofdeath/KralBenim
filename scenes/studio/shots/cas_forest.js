// cas_forest: a coastal cedar forest that becomes a "ghost forest" (brand/kit/BRAND.md §3, §5). Tall conical
// western red cedars on a tidal flat; on "sink" the ground drops, the tide floods in between the trunks, the
// foliage withers and falls, and silver dead snags with broken tops are left standing in the salt water; marsh grass
// in front. A red down-arrow shows the land dropping. The sky/sea come from the scene's "set" (coast / sea).
// Uses td__lib.js (TD: label, figure).
// P: {floor: 0.58, trees: [{x, s}], swell: 0 (1 = the tide line creeps up and heaves over the scene), sink: cue|sec, dur: 1.4, drop: 60, arrow: cue|sec|false, dead: false (start dead),
//     kasif: K | false, labels: [TD.label specs]}
// cues: hit (punch), sink, plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.cas_forest = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, atOr = TD.atOr, sd = seed * 1000 + 157;
      const FL = (P.floor ?? 0.58) * H;
      const trees = P.trees || [{ x: 0.12, s: 0.9 }, { x: 0.33, s: 1.15 }, { x: 0.55, s: 0.85 }, { x: 0.74, s: 1.05 }, { x: 0.93, s: 0.8 }];
      const root = el(svg, 'g');
      const ground = inkEl(root), mud = inkEl(root, INK.stain, { 'fill-opacity': 0.35 });
      const T = trees.map(() => ({ trunkF: inkEl(root, INK.paperDark), trunkR: inkEl(root), bark: inkEl(root, INK.inkSoft), br: inkEl(root), leafF: inkEl(root, INK.green, { 'fill-opacity': 0.6 }), leafR: inkEl(root) }));
      const fall = inkEl(root, INK.green, { 'fill-opacity': 0.6 });
      const sea = inkEl(root, INK.blue, { 'fill-opacity': 0.42 }), seaR = inkEl(root), seaL = inkEl(root, INK.paperLight);
      const grass = inkEl(root, INK.inkSoft), arrow = inkEl(root, INK.red);
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.85, y: P.floor ?? 0.58, scale: 0.7, pose: 'point', face: 'left' }, P.kasif), sd + 60) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const sa = atOr(cues, P.sink ?? 'sink', 0.6), sp = P.dead ? 1 : progIO(lt, sa, P.dur ?? 1.4), wither = P.dead ? 1 : prog(lt, sa + 0.3, 1.2);
          const drop = (P.drop ?? 60) * sp, gy = FL + drop, shake = punch(lt, sa, 0.8) * Math.sin(lt * 60) * 6;
          ground.setAttribute('d', inkPath([[-20, gy], [W * 0.5, gy + 3], [W + 20, gy - 2]], { w: 7, seed: sd + 1, t }));
          mud.setAttribute('d', inkLoop([[-20, gy], [W + 20, gy], [W + 20, gy + 60], [-20, gy + 60]], { seed: sd + 2, t, smooth: false }));
          let fl = '';
          trees.forEach((tr, i) => {
            const s = (tr.s ?? 1) * (1 + 0.03 * hit), x = tr.x * W + shake, top = gy - 820 * s, sway = Math.sin(t * 1.1 + i) * 6 * (1 - wither);
            const brk = wither * (60 + (i % 3) * 50) * s;   // dead snags lose their tops
            const tt = top + brk;
            const trunk = [[x - 26 * s, gy + 4], [x - 9 * s + sway * 0.3, tt], [x + 9 * s + sway * 0.3, tt + 10], [x + 26 * s, gy + 4]];
            T[i].trunkF.setAttribute('d', inkLoop(trunk, { seed: sd + 10 + i, t, smooth: false }));
            T[i].trunkR.setAttribute('d', inkPath(trunk, { w: 6, seed: sd + 20 + i, t, smooth: false }) + (wither > 0.5 ? ' ' + inkPath([[x - 9 * s, tt], [x - 2 * s, tt - 26 * s], [x + 4 * s, tt + 6], [x + 9 * s, tt - 14 * s]], { w: 4, seed: sd + 25 + i, t, smooth: false }) : ''));
            let bk = '';
            for (let k = 0; k < 5; k++) { const yy = lerp(gy - 40, tt + 60, k / 5); bk += inkPath([[x - 6 * s + (k % 2) * 8, yy], [x - 4 * s + (k % 2) * 8, yy - 70 * s]], { w: 2.6, seed: sd + 30 + i * 7 + k, t, amp: 0.8 }) + ' '; }
            T[i].bark.setAttribute('d', bk);
            // branches: drooping cedar sprays when alive, bare grey sticks when dead
            let br = '', lf = '', lr = '';
            const nb = 6;
            for (let k = 0; k < nb; k++) {
              const u = (k + 0.5) / nb, yy = lerp(gy - 260 * s, top + 60 * s, u);
              if (yy < tt + 10) continue;
              const side = k % 2 ? 1 : -1, len = lerp(200, 70, u) * s * (1 - 0.35 * wither);
              const ex = x + side * len + sway, ey = yy + lerp(30, -40, wither) * s;
              br += inkPath([[x, yy], [x + side * len * 0.5 + sway * 0.5, yy - 10], [ex, ey]], { w: 5 * s, seed: sd + 40 + i * 9 + k, t, amp: 1 }) + ' ';
              const leaf = clamp01(1 - wither * 1.3 + (k % 3) * 0.05);
              if (leaf > 0.02) {
                const pad = [[x + side * len * 0.15, yy - 26 * s * leaf], [ex, ey - 30 * s * leaf], [ex + side * 30 * s * leaf, ey + 24 * s * leaf], [x + side * len * 0.2, yy + 38 * s * leaf]];
                lf += inkLoop(pad, { seed: sd + 50 + i * 9 + k, t }) + ' ';
                lr += inkPath(pad, { w: 3.6, seed: sd + 60 + i * 9 + k, t, closed: true }) + ' ';
              }
            }
            if (wither < 0.8) {   // the crown spire
              const cs = 1 - wither, crown = [[x - 60 * s * cs, top + 200 * s], [x + sway, top - 20 * s * cs], [x + 60 * s * cs, top + 200 * s]];
              lf += inkLoop(crown, { seed: sd + 70 + i, t }) + ' '; lr += inkPath(crown, { w: 4, seed: sd + 75 + i, t, closed: true }) + ' ';
            }
            T[i].br.setAttribute('d', br); T[i].leafF.setAttribute('d', lf); T[i].leafR.setAttribute('d', lr);
            // falling needles
            if (wither > 0.02 && wither < 1) for (let k = 0; k < 4; k++) {
              const fx = x + (k - 1.5) * 60 * s + Math.sin(t * 3 + k) * 20, fy = lerp(top + 200 * s, gy - 20, (wither + k * 0.2) % 1);
              fl += inkDot(fx, fy, 12, 6, sd + 80 + i * 5 + k, t) + ' ';
            }
          });
          fall.setAttribute('d', fl);
          // tide floods in between the trunks
          const wl = gy - 70 * sp - (P.swell ?? 0) * (18 + 14 * Math.sin(t * 1.3)) * lin(lt, 0, Math.max(1, dur));   // swell: the tide creeps up
          if (sp > 0.01) {
            const top = [];
            for (let k = 0; k <= 18; k++) { const x = lerp(-20, W + 20, k / 18); top.push([x, wl + Math.sin(x * 0.015 + t * 2.4) * 7]); }
            sea.setAttribute('d', inkLoop(top.concat([[W + 20, gy + 70], [-20, gy + 70]]), { seed: sd + 100, t, smooth: false }));
            seaR.setAttribute('d', inkPath(top, { w: 5, seed: sd + 101, t }));
            let sl = '';
            for (let k = 0; k < 8; k++) { const x = ((k * 0.13 + t * 0.03) % 1) * W, y = wl + 22 + (k % 3) * 14; sl += inkPath([[x, y], [x + 50, y - 3]], { w: 4, seed: sd + 102 + k, t, amp: 0.8 }) + ' '; }
            seaL.setAttribute('d', sl);
          } else { sea.setAttribute('d', ''); seaR.setAttribute('d', ''); seaL.setAttribute('d', ''); }
          // marsh grass in front
          let gr = '';
          for (let k = 0; k < 26; k++) { const x = (k / 26) * W + 15, y = gy + 50, h = 50 + (k % 4) * 16, bend = Math.sin(t * 1.8 + k) * 8; gr += inkPath([[x, y], [x + bend * 0.5, y - h * 0.6], [x + bend + 6, y - h]], { w: 3.2, seed: sd + 120 + k, t, amp: 0.8, taper: 0.6 }) + ' '; }
          grass.setAttribute('d', gr);
          // land-drop arrow
          const aa = P.arrow == null || P.arrow === false ? null : atOr(cues, P.arrow, null), ap = aa == null ? 0 : prog(lt, aa, 0.5);
          if (ap > 0.01) {
            const ax = (P.arrow_x ?? 0.44) * W, ay0 = FL - 330, ay1 = ay0 + 200 * ap;
            arrow.setAttribute('d', inkPath([[ax, ay0], [ax, ay1]], { w: 16, seed: sd + 130, t }) + ' ' + inkLoop([[ax - 40, ay1 - 10], [ax + 40, ay1 - 10], [ax, ay1 + 46]], { seed: sd + 131, t, smooth: false }));
          } else arrow.setAttribute('d', '');
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
