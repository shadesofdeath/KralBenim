// lh_flip: fifty years later the theory is turned upside down (Maier & Seligman 2016), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, time)). Upper left: a tear-off wall calendar shows
// P.from; from `years` its leaves fly off while the year counts up to P.to. Upper right: a small blackboard with the
// chalk word P.word; on `flip` a red curling arrow is drawn round it, the word turns upside down (spring) and P.label
// ("TERS!") pops in red. Lower right: an older Seligman (hatless, white receding hair, glasses, lab coat) reads his
// notebook, then on `flip` raises his eyebrows and looks up at the board. Foreground: a wooden desk with books and a
// mug down to the frame bottom. Leaves wall + floor to the set (interior).
// A second older figure (Maier: white hair, sweater) stands beside him and points up at the board on `flip`.
// P: {from: 1967, to: 2016, word: "ÇARESİZLİK", label: "TERS!", label_at: [0.31, 0.36], cal: [0.22, 0.47], second: true, gy: 0.6, desk: 0.7}
// cues: years (count starts), flip (arrow + word turns + label). Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lh_flip = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 271, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const cal = L.calendar(el(root, 'g'), sd + 1);
      const frame = inkEl(root, mix(INK.stain, INK.ink, 0.25)), slate = inkEl(root, mix(INK.ink, INK.green, 0.28)), frameR = inkEl(root);
      const word = L.txt(root, { 'font-family': INK_FONT, 'font-size': 104 * u, fill: INK.paperLight });
      word.textContent = P.word || 'ÇARESİZLİK';
      const arrow = inkEl(root, INK.red), arrowH = inkEl(root, INK.red);
      const labG = el(root, 'g');
      const labHalo = L.txt(labG, { 'font-family': L.SERIF, 'font-weight': 900, 'font-size': 120 * u, fill: 'none', stroke: INK.paperLight, 'stroke-width': 14, 'stroke-linejoin': 'round' });
      const labT = L.txt(labG, { 'font-family': L.SERIF, 'font-weight': 900, 'font-size': 120 * u, fill: INK.red });
      labHalo.textContent = labT.textContent = P.label || 'TERS!';
      const sel = L.person(el(root, 'g'), sd + 20, { kind: 'lab', hair: 'white', glasses: true });
      const mai = P.second === false ? null : L.person(el(root, 'g'), sd + 30, { kind: 'sweater', hair: 'white', glasses: false, col: mix(INK.blue, INK.paperDark, 0.35) });
      const nb = inkEl(root, INK.blue), nbP = inkEl(root, INK.paperLight), nbR = inkEl(root);
      const desk = L.front(el(root, 'g'), sd + 40, 'desk');
      const from = P.from ?? 1967, to = P.to ?? 2016;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const ys = L.atOr(cues, 'years', dur * 0.35), fl = L.atOr(cues, 'flip', dur * 0.7);
          const cq = clamp01((lt - ys) / 1.3), yr = Math.round(lerp(from, to, progIO(cq, 0, 1)));
          const pop = 1 + 0.12 * punch(lt, ys + 1.3, 0.6);
          const CP = P.cal || [0.22, 0.47];
          cal.g.setAttribute('transform', `translate(${L.f1(CP[0] * W)} ${L.f1(CP[1] * H)}) scale(${pop.toFixed(3)}) translate(${L.f1(-CP[0] * W)} ${L.f1(-CP[1] * H)})`);
          cal.update(t, CP[0] * W, CP[1] * H, 300 * u, 330 * u, String(yr), cq > 0 && cq < 1 ? lt * 0.9 : 0);
          // board with the chalk word
          const x0 = 0.5 * W, x1 = 0.96 * W, y0 = 0.17 * H, y1 = 0.41 * H, cx = (x0 + x1) / 2, cy = lerp(y0, y1, 0.6);
          const fr = [[x0 - 20 * u, y0 - 20 * u], [x1 + 20 * u, y0 - 20 * u], [x1 + 20 * u, y1 + 20 * u], [x0 - 20 * u, y1 + 20 * u]];
          frame.setAttribute('d', inkLoop(fr, { seed: k + 1, t, smooth: false }));
          slate.setAttribute('d', inkLoop(L.rect(x0, y0, x1, y1), { seed: k + 2, t, smooth: false }));
          frameR.setAttribute('d', inkPath(fr, { w: 6, seed: k + 3, t, closed: true, smooth: false }) + ' ' + inkPath(L.rect(x0, y0, x1, y1), { w: 5, seed: k + 4, t, closed: true, smooth: false }));
          const rq = spring(lt, fl + 0.25, 0.9), jx = boil(k + 5, t, 1.2);
          word.setAttribute('x', L.f1(cx + jx[0])); word.setAttribute('y', L.f1(cy + 36 * u + jx[1]));
          word.setAttribute('transform', `rotate(${L.f1(180 * rq)} ${L.f1(cx)} ${L.f1(cy)})`);
          // red curling arrow round the word
          const aq = clamp01((lt - fl) / 0.6);
          if (aq > 0) {
            const A = [], n = 30, a0 = -2.6;
            for (let i = 0; i <= n * aq; i++) { const a = a0 + i / n * 5.2; A.push([cx + Math.cos(a) * 250 * u, cy + Math.sin(a) * 125 * u]); }
            arrow.setAttribute('d', A.length > 1 ? inkPath(A, { w: 12 * u, seed: k + 10, t }) : '');
            const e = A[A.length - 1], pv = A[Math.max(0, A.length - 3)], ang = Math.atan2(e[1] - pv[1], e[0] - pv[0]);
            arrowH.setAttribute('d', aq > 0.95 ? inkLoop([[e[0] + Math.cos(ang) * 40 * u, e[1] + Math.sin(ang) * 40 * u], [e[0] + Math.cos(ang + 2.3) * 34 * u, e[1] + Math.sin(ang + 2.3) * 34 * u], [e[0] + Math.cos(ang - 2.3) * 34 * u, e[1] + Math.sin(ang - 2.3) * 34 * u]], { seed: k + 11, t, smooth: false }) : '');
          } else { arrow.setAttribute('d', ''); arrowH.setAttribute('d', ''); }
          const lp = spring(lt, fl + 0.45, 0.5) * (1 + 0.12 * punch(lt, fl + 0.45, 0.7));
          labG.setAttribute('transform', lt < fl + 0.45 ? 'scale(0)' : `translate(${L.f1((P.label_at || [0.31, 0.36])[0] * W)} ${L.f1((P.label_at || [0.31, 0.36])[1] * H)}) rotate(${L.f1(-6 + Math.sin(t * 2) * 1.5)}) scale(${lp.toFixed(3)})`);
          // the older Seligman reads, then looks up on `flip`
          const look = lt >= fl, px = 0.6 * W, s = 0.95 * u;
          const nbx = px - 70 * s, nby = gy - 300 * s + Math.sin(t * 1.7) * 3;
          const hl = [nbx - 40 * s, nby + 10 * s], hr = [nbx + 40 * s, nby + 14 * s];
          sel.update(t, px, gy, s, { face: -1, lean: look ? -2 : 6, armL: hl, armR: hr, look: look ? [4, -10] : [0, 10], brow: look ? 1 : 0, mouth: look && lt < fl + 1.5 ? 0.6 : 0 });
          if (mai) mai.update(t, 0.85 * W, gy, s, { face: -1, lean: look ? -4 : 2, armL: [0.85 * W - 40 * s, gy - 230 * s], armR: look ? [0.85 * W - 120 * s, gy - 470 * s] : [0.85 * W - 30 * s, gy - 220 * s], look: look ? [4, -12] : [-4, 4], brow: look ? 1 : 0, mouth: look && lt < fl + 1.5 ? 0.7 : 0 });
          const np = [[nbx - 70 * s, nby - 50 * s], [nbx + 60 * s, nby - 60 * s], [nbx + 66 * s, nby + 40 * s], [nbx - 64 * s, nby + 50 * s]];
          nb.setAttribute('d', inkLoop(np, { seed: k + 20, t, smooth: false }));
          nbP.setAttribute('d', inkLoop([[nbx - 60 * s, nby - 42 * s], [nbx + 50 * s, nby - 50 * s], [nbx + 54 * s, nby + 30 * s], [nbx - 56 * s, nby + 40 * s]], { seed: k + 21, t, smooth: false }));
          nbR.setAttribute('d', inkPath(np, { w: 5, seed: k + 22, t, closed: true, smooth: false }) + ' ' + [0, 1, 2].map(i => inkPath([[nbx - 44 * s, nby - 20 * s + i * 22 * s], [nbx + 40 * s, nby - 26 * s + i * 22 * s]], { w: 2.5, seed: k + 23 + i, t })).join(' '));
          desk.update(t, W, H, (P.desk ?? 0.7) * H);
        },
      };
    },
  };
})();
