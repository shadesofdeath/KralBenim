// mohac_count: two armies counted in little ink soldiers (14-mohac-1526): a red row (Hungarians) fills in figure by
// figure, then a much longer blue row (Ottomans), then a row of small guns; a red stamp says the numbers are disputed.
// No numbers on purpose (they are disputed): the comparison is the length of the rows. Plain parchment, no set.
// P: {rows: [{label, side: "hu"|"ot", n, at, kind: "cav"|"inf"}], guns: {label, n, at}, stamp: {text, at}}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_count = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const root = el(svg, 'g');
      const rows = (P.rows || []).map((R, i) => {
        const g = el(root, 'g'), f = inkEl(g, M.side(R.side)), l = inkEl(g, INK.ink);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'start', fill: R.side === 'hu' ? INK.red : INK.blue });
        t.textContent = R.label; t.setAttribute('x', 180); t.setAttribute('y', 380 + i * 240 - 100);
        return { R, i, f, l, t, y: 380 + i * 240 };
      });
      const G = P.guns, gunL = G ? inkEl(root, INK.ink) : null, gunF = G ? inkEl(root, INK.inkSoft) : null;
      const gunT = G ? el(root, 'text', { 'font-family': INK_FONT, 'font-size': 60, 'text-anchor': 'start', fill: INK.ink }) : null;
      if (gunT) { gunT.textContent = G.label; gunT.setAttribute('x', 180); gunT.setAttribute('y', 380 + rows.length * 240 - 90); }
      const base = inkEl(root, INK.inkSoft);
      const stamp = P.stamp && window.MCB ? window.MCB.labels(root, [{ text: P.stamp.text, x: 0.78, y: 0.17, at: P.stamp.at, color: 'red', stamp: true, size: 60, rot: -6 }], W, H, seed * 3) : null;

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          let bd = '';
          rows.forEach(({ R, i, f, l, t: tx, y }) => {
            const a = atOr(cues, R.at, 0.3 + i), n = R.n ?? 10, step = Math.min(78, 1500 / n);
            let F = '', L = '';
            for (let k = 0; k < n; k++) {
              const ak = a + k * Math.min(0.07, 1.2 / n); if (lt < ak) break;
              const sp = spring(lt, ak, 0.4), x = 210 + k * step, yy = y + 40 + Math.abs(Math.sin(t * 6 + k)) * -3;
              const g = M.glyph(R.kind || 'inf', x, yy, 1.55 * sp, seed * 50 + i * 100 + k, t, 1);
              F += g.f; L += g.l;
            }
            f.setAttribute('d', F); l.setAttribute('d', L);
            tx.style.display = lt >= a - 0.2 ? '' : 'none';
            bd += inkPath([[170, y + 46], [W - 160, y + 50]], { w: 3, seed: seed + 10 + i, t });
          });
          if (G) {
            const a = atOr(cues, G.at, dur * 0.7), y = 380 + rows.length * 240, n = G.n ?? 14;
            let L = '', F = '';
            for (let k = 0; k < n; k++) {
              const ak = a + k * 0.06; if (lt < ak) break;
              const x = 230 + k * 105, s = spring(lt, ak, 0.4);
              F += inkLoop([[x - 34 * s, y - 2], [x + 40 * s, y - 16 * s], [x + 42 * s, y - 2 * s], [x - 34 * s, y + 12 * s]], { seed: seed + 300 + k, t, amp: 0.5, smooth: false });
              L += inkPath(inkEllipsePts(x - 10, y + 16, 16 * s, 16 * s, seed + 320 + k, 8), { w: 3.5, seed: seed + 340 + k, t, closed: true });
            }
            gunF.setAttribute('d', F); gunL.setAttribute('d', L);
            gunT.style.display = lt >= a - 0.2 ? '' : 'none';
          }
          base.setAttribute('d', bd);
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
