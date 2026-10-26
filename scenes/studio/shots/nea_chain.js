// nea_chain: generations in a line that runs from the far horizon to the foreground (Neanderthal DNA Short). The
// farthest, smallest figure is a Neanderthal; every next one is a modern human, bigger and nearer, each springing up
// in turn, and a gold thread (the inherited DNA) runs hand to hand from the first to the last. A big counter
// counts up the generations. Perspective and the scene's "set" (hills) give the depth.
// P: {n: 9, far: {x: 0.14, y: 790, s: 0.22}, near: {x: 0.8, y: 1150, s: 1.15}, thread: cue|s (starts drawing),
//     counter: {at: cue|s, to: 1500, plus: true, x: 0.36, y: 0.24, label: "GENERATIONS", size: 170}, labels: [...]}
// cues: thread / counter.at / labels' at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_chain = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, FR } = window.MCB;
      const sd = seed * 1000 + 9100;
      const n = P.n ?? 9, FA = Object.assign({ x: 0.14, y: 790, s: 0.22 }, P.far || {}), NE = Object.assign({ x: 0.8, y: 1150, s: 1.15 }, P.near || {});
      const root = el(svg, 'g');
      const coats = ['paperDark', 'green', 'blue', 'red', 'paperDark', 'blue', 'green', 'red', 'blue', 'green'];
      const items = Array.from({ length: n }, (_, k) => {
        const u = k / Math.max(1, n - 1), kind = k === 0 ? 'nean' : 'human';
        const x = lerp(FA.x, NE.x, Math.pow(u, 1.25)) * W, y = lerp(FA.y, NE.y, Math.pow(u, 1.6)), s = FA.s * Math.pow(NE.s / FA.s, Math.pow(u, 0.9));
        const g = el(root, 'g');
        return { k, u, kind, x, y, s, g, fig: NEA.fig(g, kind, sd + k * 71), coat: kind === 'nean' ? null : coats[k % coats.length] };
      });
      const threadL = inkEl(root, INK.ink), thread = inkEl(root, INK.gold);
      const grassF = inkEl(root, INK.green), grassL = inkEl(root, INK.ink);
      const GR2 = rng(sd + 44), BL = Array.from({ length: 40 }, () => [GR2(), GR2(), GR2()]);
      const CT = P.counter ? Object.assign({ to: 1500, plus: true, x: 0.36, y: 0.24, label: 'GENERATIONS', size: 170 }, P.counter) : null;
      const cg = el(root, 'g');
      const cNum = CT ? el(cg, 'text', { x: 0, y: 0, 'font-family': FR, 'font-size': CT.size, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red }) : null;
      const cLab = CT ? el(cg, 'text', { x: 0, y: CT.size * 0.72, 'font-family': INK_FONT, 'font-size': 72, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }) : null;
      if (cLab) cLab.textContent = CT.label;
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const BB = { nean: { sh: [8, -262], a: 64 }, human: { sh: [6, -292], a: 72 } };
      const handOf = it => { const B = BB[it.kind]; return [it.x + (B.sh[0] + B.a * 1.2) * it.s, it.y + (B.sh[1] + B.a * 1.1) * it.s]; };
      const backOf = it => { const B = BB[it.kind]; return [it.x + (B.sh[0] - 8 - B.a * 0.35) * it.s, it.y + (B.sh[1] + B.a * 1.7) * it.s]; };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const span = Math.max(0.8, dur * 0.55);
          const shown = [];
          items.forEach(it => {
            const a0 = 0.05 + it.u * span, p = spring(lt, a0, 0.5);
            if (p < 0.01) { it.g.style.display = 'none'; return; }
            it.g.style.display = '';
            it.fig.draw(t, { x: it.x, y: it.y + (1 - Math.min(1, p)) * 40 * it.s, s: it.s * Math.max(0.05, Math.min(1.06, p)), face: 1, arm: it.kind === 'nean' ? 'spear' : 'hold', spearLen: 0.8, coat: it.coat, a: clamp01(p * 2) });
            if (p > 0.6) shown.push(it);
          });
          // gold thread hand to hand
          const th = atOr(cues, P.thread, 0.25), tp = clamp01((lt - th) / Math.max(0.6, span));
          if (shown.length > 1 && tp > 0) {
            const m = Math.max(2, Math.ceil(shown.length * tp));
            let dl = '', dg = '';
            for (let k = 0; k + 1 < m && k + 1 < shown.length; k++) {   // hand of one generation -> the back hand of the next
              const a = handOf(shown[k]), b = backOf(shown[k + 1]), w = 4 + 6 * shown[k + 1].s;
              const mid = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 18 * shown[k + 1].s];
              dl += inkPath([a, mid, b], { w: w + 5, seed: sd + 3 + k, t, amp: 0.6, taper: 0.1 }) + ' ';
              dg += inkPath([a, mid, b], { w, seed: sd + 30 + k, t, amp: 0.5, taper: 0.1 }) + ' ';
            }
            threadL.setAttribute('d', dl); thread.setAttribute('d', dg);
          } else { thread.setAttribute('d', ''); threadL.setAttribute('d', ''); }
          if (CT) {
            const ca = atOr(cues, CT.at, 0.4), cp = prog(lt, ca, Math.max(0.8, dur - ca - 0.6)), sp = spring(lt, ca, 0.5);
            const v = Math.round(CT.to * cp / 10) * 10;
            cNum.textContent = v.toLocaleString('en-US') + (CT.plus && cp >= 1 ? '+' : '');
            cg.style.display = lt < ca ? 'none' : '';
            cg.setAttribute('transform', `translate(${NEA.f1(CT.x * W)} ${NEA.f1(CT.y * H)}) rotate(-3) scale(${(Math.max(0.01, sp) * (1 + 0.08 * punch(lt, ca + Math.max(0.8, dur - ca - 0.6), 0.6))).toFixed(3)})`);
          }
          // foreground grass across the bottom (in front of the nearest figures' feet)
          let gf = '', gl = '';
          BL.forEach((b, i) => { const x = b[0] * (W + 80) - 40, y = 1230 + b[1] * 260, h = 50 + b[2] * 90, sw = Math.sin(t * 1.3 + i) * 8;
            const blade = [[x - 10, y], [x + sw * 0.5, y - h * 0.6], [x + 6 + sw, y - h], [x + 10, y]];
            gf += inkLoop(blade, { seed: sd + 60 + i, t, amp: 0.6 }) + ' '; gl += inkPath(blade.slice(0, 3), { w: 3, seed: sd + 110 + i, t, amp: 0.5 }) + ' '; });
          gl += inkPath([[-40, 1500], [W + 40, 1500]], { w: 1, seed: sd + 170, t, amp: 0.4 });
          grassF.setAttribute('d', gf); grassF.setAttribute('fill-opacity', 0.5); grassL.setAttribute('d', gl);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
