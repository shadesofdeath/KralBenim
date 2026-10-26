// sh_hot: "as hot as ..." comparison on parchment (brand/kit/BRAND.md §3, §5): on the left a collapsing bubble
// whose core flares as a pulsing gold star, on the right a big gold sun that
// springs in; a hand-drawn "=" sign draws itself between them; wavy heat lines rise from both. Uses sh__lib.js
// (SHR) + td__lib.js (TD).
// P: {bubble: {x: 0.27, y: 0.34, r: 150, at: cue|sec (flares)}, sun: {x: 0.75, y: 0.34, r: 120, at: cue|sec} | false,
//     eq: {at: cue|sec, x: 0.51, y: 0.34, text: "="} | false,
//     labels: [TD.label specs], kasif: K | false}
// cues: hit (punch), bubble.at / sun.at / eq.at / labels / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sh_hot = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, SHR = window.SHR, f1 = SHR.f1, atOr = TD.atOr, sd = seed * 1000 + 733;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const B = Object.assign({ x: 0.27, y: 0.34, r: 150, at: 0.2 }, P.bubble || {});
      const S = P.sun === false ? null : Object.assign({ x: 0.75, y: 0.34, r: 120, at: 1 }, P.sun || {});
      const E = P.eq === false ? null : Object.assign({ x: 0.51, y: 0.34, at: S ? S.at : 1 }, P.eq || {});
      const heat = inkEl(cam, INK.red, { 'fill-opacity': 0.8 });
      const bub = SHR.bubble(cam, sd + 1);
      const glowS = inkEl(cam, INK.gold), glowR = inkEl(cam), core = inkEl(cam, INK.paperLight);
      const sun = S ? TD.sun(el(cam, 'g'), sd + 2) : null, sunG = sun ? cam.lastChild : null;
      const eq = inkEl(cam);
      const labels = (P.labels || []).map((L, i) => TD.label(cam, L, W, H, sd + 20 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.5, y: 0.6, scale: 0.8, pose: 'shock', face: 'right' }, P.kasif), sd + 8) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          const fx = W * 0.5, fy = H * 0.4;
          cam.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const bx = B.x * W, by = B.y * H, ba = atOr(cues, B.at, 0.2), bp = lt >= ba ? spring(lt, ba, 0.6) : 0;
          bub.update(t, bx, by, B.r);
          const fl = bp * (0.85 + 0.15 * Math.sin(lt * 14));
          if (fl > 0.02) {
            const pts = [];
            for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2 + lt * 0.6, rr = (k % 2 ? 0.4 : 1) * B.r * 0.78 * fl; pts.push([bx + Math.cos(a) * rr, by + Math.sin(a) * rr]); }
            glowS.setAttribute('d', inkLoop(pts, { seed: sd + 3, t, smooth: false }));
            glowR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 4, t, closed: true, smooth: false }));
            core.setAttribute('d', inkDot(bx, by, B.r * 0.2 * fl, B.r * 0.2 * fl, sd + 5, t));
          }
          let hd = '';
          const srcs = [[bx, by - B.r - 20, bp]];
          if (S) { const sa = atOr(cues, S.at, 1); srcs.push([S.x * W, S.y * H - S.r * 1.7, lt >= sa ? spring(lt, sa, 0.7) : 0]); }
          srcs.forEach(([x, y, p], j) => {
            if (p < 0.05) return;
            for (let k = 0; k < 3; k++) {
              const u = (lt * 0.7 + k / 3) % 1, xx = x + (k - 1) * 60, yy = y - u * 120, pts = [];
              for (let q = 0; q <= 4; q++) pts.push([xx + Math.sin(q * 1.6 + lt * 4) * 12, yy - q * 22]);
              hd += inkPath(pts, { w: 6 * (1 - u) * p, seed: sd + 60 + j * 5 + k, t, amp: 0.8, taper: 0.6 }) + ' ';
            }
          });
          heat.setAttribute('d', hd);
          if (sun) {
            const sa = atOr(cues, S.at, 1), sp = lt >= sa ? spring(lt, sa, 0.7) : 0;
            sunG.style.display = sp > 0.01 ? '' : 'none';
            if (sp > 0.01) sun.update(t, S.x * W + (1 - sp) * W * 0.4, S.y * H, S.r * lerp(0.3, 1, sp) * (1 + 0.04 * Math.sin(lt * 3)));
          }
          if (E) {
            const ea = atOr(cues, E.at, 1), p = lt >= ea ? prog(lt, ea + 0.15, 0.4) : 0, x = E.x * W, y = E.y * H;
            eq.setAttribute('d', p > 0.01 ? [-28, 28].map((dy, k) => inkPath([[x - 60, y + dy], [x - 60 + 120 * p, y + dy - 4]], { w: 18, seed: sd + 70 + k, t, amp: 1.2 })).join(' ') : '');
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
