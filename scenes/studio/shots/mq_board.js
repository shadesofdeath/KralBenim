// mq_board: a big cork board on the lab wall above a lab bench, parchment ink style (brand/kit/BRAND.md §3, §5;
// boils at 8 Hz, pure function of (seed, time)). Two mosquitoes buzz across it.
//   mode "bracket": a round-robin "tournament" of worn stockings: eight pinned cards, each with a little stocking,
//     bracket lines draw themselves round by round; the winner's path is red, and on `win` the champion card pops up
//     at the top with P.champ (e.g. "33") and a gold crown.
//   mode "chart": a hand-drawn line chart pinned to the board: several grey lines crawl along near the bottom, one red
//     line stays far above them all the way (a red marker pen draws it), its end tag P.champ.
// Leaves the wall to the scene's "set" (interior); the bench fills the frame bottom.
// P: {mode: "bracket"|"chart", champ: "33", winner: 5 (bracket: entrant index 0..7), bench: 0.63,
//     labels: [{text, x, y, size, color, at, ...}] (LH.label)}
// cues: win (bracket: champion; chart: red line tag), plus whatever the labels use. Needs LH and MQ.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const partial = (pts, p) => {
    if (p <= 0) return null;
    if (p >= 1) return pts;
    let tot = 0; const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
    let rem = tot * p; const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      if (rem >= seg[i - 1]) { out.push(pts[i]); rem -= seg[i - 1]; continue; }
      const f = rem / seg[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break;
    }
    return out;
  };
  SH.mq_board = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, Q = window.MQ, sd = seed * 1000 + 733, u = W / 1080;
      const root = el(svg, 'g');
      const mode = P.mode || 'bracket';
      const bt = (P.bench ?? 0.63) * H;
      const bx0 = 0.045 * W, bx1 = 0.955 * W, by0 = 0.15 * H, by1 = bt - 40 * u;
      const frame = inkEl(root, mix(INK.stain, INK.ink, 0.3)), cork = inkEl(root, mix(INK.stain, INK.paperDark, 0.45)), dots = inkEl(root, mix(INK.stain, INK.ink, 0.15)), frameR = inkEl(root);
      const cards = inkEl(root, INK.paperLight), cardsR = inkEl(root), pins = inkEl(root, INK.red);
      const mini = mode === 'bracket' ? Array.from({ length: 8 }, (_, i) => Q.stocking(el(root, 'g'), sd + 10 + i)) : [];
      const grey = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.15)), red = inkEl(root, INK.red), axes = inkEl(root);
      const champ = el(root, 'g'), champC = inkEl(champ, INK.paperLight), champR = inkEl(champ), crown = inkEl(champ, INK.gold), crownR = inkEl(champ);
      const champT = L.txt(champ, { 'font-family': L.SERIF, 'font-weight': 900, 'font-size': 120 * u, fill: INK.ink });
      champT.textContent = P.champ || '33';
      const tagG = el(root, 'g'), tagC = inkEl(tagG, INK.red), tagT = L.txt(tagG, { 'font-family': L.SERIF, 'font-weight': 900, 'font-size': 64 * u, fill: INK.paperLight });
      tagT.textContent = P.champ || '33';
      const penB = inkEl(root, INK.paperLight), penC = inkEl(root, INK.red), penR = inkEl(root);
      const bugs = Q.swarm(el(root, 'g'), 2, sd + 50, 'aedes');
      const bench = Q.bench(el(root, 'g'), sd + 60);
      const labels = (P.labels || []).map(o => L.label(root, o, W, H));
      const R = rng(inkHash(sd, 9)), FQ = Array.from({ length: 80 }, () => R());
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const win = L.atOr(cues, 'win', dur * 0.6);
          const B = [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]];
          const B2 = [[bx0 + 26 * u, by0 + 26 * u], [bx1 - 26 * u, by0 + 26 * u], [bx1 - 26 * u, by1 - 26 * u], [bx0 + 26 * u, by1 - 26 * u]];
          frame.setAttribute('d', inkLoop(B, { seed: k + 1, t, smooth: false }));
          cork.setAttribute('d', inkLoop(B2, { seed: k + 2, t, smooth: false }));
          frameR.setAttribute('d', inkPath(B, { w: 6, seed: k + 3, t, closed: true, smooth: false }) + ' ' + inkPath(B2, { w: 4, seed: k + 4, t, closed: true, smooth: false }));
          const DT = []; for (let i = 0; i < 40; i++) DT.push(inkDot(lerp(B2[0][0], B2[1][0], FQ[i]), lerp(B2[0][1], B2[2][1], FQ[i + 40]), 3 * u, 2 * u, k + 10 + i, t, 0.3));
          dots.setAttribute('d', DT.join(' '));
          const CD = [], CR = [], PN = [], G = [], RD = [], AX = [];
          if (mode === 'bracket') {
            const xs = Array.from({ length: 8 }, (_, i) => lerp(0.14 * W, 0.86 * W, i / 7));
            const cy = by1 - 130 * u, cw = 52 * u, ch = 80 * u;
            xs.forEach((x, i) => {
              const ap = spring(lt, 0.05 + i * 0.06, 0.4); if (ap <= 0) return;
              const c4 = [[x - cw * ap, cy - ch * ap], [x + cw * ap, cy - ch * ap], [x + cw * ap, cy + ch * ap], [x - cw * ap, cy + ch * ap]];
              CD.push(inkLoop(c4, { seed: k + 100 + i, t, smooth: false })); CR.push(inkPath(c4, { w: 4, seed: k + 110 + i, t, closed: true, smooth: false }));
              PN.push(inkDot(x, cy - ch * ap + 10 * u, 10 * u, 10 * u, k + 120 + i, t));
              mini[i].update(t, x - 4 * u, cy - ch * ap + 26 * u, 96 * u * ap, 34 * u * ap, Math.sin(t * 1.5 + i) * 3, {});
            });
            const lv = [cy - ch - 90 * u, cy - ch - 250 * u, cy - ch - 410 * u];
            const wi = P.winner ?? 5;
            let cur = xs.map((x, i) => [x, cy - ch, i]);
            const rStart = [0.6, 0.6 + (win - 0.6) * 0.4, 0.6 + (win - 0.6) * 0.75];
            for (let r = 0; r < 3; r++) {
              const nxt = [];
              for (let j = 0; j < cur.length; j += 2) {
                const a = cur[j], b = cur[j + 1], mx = (a[0] + b[0]) / 2, y = lv[r];
                const wIn = [a[2], b[2]].includes(wi) ? wi : (FQ[r * 8 + j] < 0.5 ? a[2] : b[2]);
                const p = clamp01((lt - rStart[r]) / 0.5);
                const pa = partial([[a[0], a[1]], [a[0], y], [mx, y]], p), pb = partial([[b[0], b[1]], [b[0], y], [mx, y]], p);
                [[pa, a[2]], [pb, b[2]]].forEach(([pp, who], q) => { if (!pp) return; (who === wi ? RD : G).push(inkPath(pp, { w: who === wi ? 12 * u : 7 * u, seed: k + 200 + r * 20 + j + q, t, smooth: false })); });
                nxt.push([mx, y, wIn]);
              }
              cur = nxt;
            }
            const fin = cur[0], pf = clamp01((lt - win + 0.3) / 0.3), top = by0 + 215 * u;
            const pfl = partial([[fin[0], fin[1]], [fin[0], top + 80 * u]], pf); if (pfl) RD.push(inkPath(pfl, { w: 9 * u, seed: k + 290, t, smooth: false }));
            const cp = spring(lt, win, 0.5) * (1 + 0.12 * punch(lt, win, 0.7));
            if (lt >= win) {
              champ.setAttribute('transform', `translate(${L.f1(fin[0])} ${L.f1(top)}) scale(${cp.toFixed(3)})`);
              const c4 = [[-150 * u, -78 * u], [150 * u, -82 * u], [154 * u, 84 * u], [-146 * u, 80 * u]];
              champC.setAttribute('d', inkLoop(c4, { seed: k + 300, t, smooth: false }));
              champR.setAttribute('d', inkPath(c4, { w: 7, seed: k + 301, t, closed: true, smooth: false }));
              const CW = [[-90, -84], [-110, -170], [-50, -120], [0, -190], [50, -120], [110, -170], [90, -84]].map(q => [q[0] * u, q[1] * u + Math.sin(t * 3) * 3 * u]);
              crown.setAttribute('d', inkLoop(CW, { seed: k + 302, t, smooth: false }));
              crownR.setAttribute('d', inkPath(CW, { w: 5, seed: k + 303, t, closed: true, smooth: false }));
              champT.setAttribute('y', 42 * u);
            } else champ.setAttribute('transform', 'scale(0)');
            tagG.setAttribute('transform', 'scale(0)');
          } else {
            const ax0 = 0.16 * W, ax1 = 0.86 * W, ay0 = by0 + 230 * u, ay1 = by1 - 70 * u;
            AX.push(inkPath([[ax0, ay0 - 30 * u], [ax0, ay1], [ax1 + 30 * u, ay1]], { w: 6, seed: k + 400, t, smooth: false }));
            for (let i = 1; i <= 3; i++) { const x = lerp(ax0, ax1, i / 3); AX.push(inkPath([[x, ay1 - 12 * u], [x, ay1 + 14 * u]], { w: 5, seed: k + 401 + i, t })); }
            const p = clamp01((lt - 0.2) / Math.max(1, Math.min(dur * 0.75, win + 0.4)));
            for (let li = 0; li < 5; li++) {
              const pts = [];
              for (let j = 0; j <= 12; j++) { const v = j / 12, base = li === 0 ? 0.12 : 0.62 + li * 0.07; pts.push([lerp(ax0, ax1, v), lerp(ay0, ay1, Math.min(0.97, base + Math.sin(v * 5 + li * 2) * 0.05 + (FQ[li * 13 + j] - 0.5) * 0.06))]); }
              const pp = partial(pts, p); if (!pp) continue;
              (li === 0 ? RD : G).push(inkPath(pp, { w: li === 0 ? 10 * u : 5 * u, seed: k + 420 + li, t }));
              if (li === 0 && pp.length) {
                const e = pp[pp.length - 1], tp = spring(lt, win, 0.4);
                // a red marker pen draws the line (held at an angle, its tip on the line's end)
                const pa = -0.9 + Math.sin(t * 7) * 0.05, pl = 230 * u, pw = 26 * u, ca = Math.cos(pa), sa = Math.sin(pa);
                const tip = [e[0] + Math.sin(t * 9) * 2 * u, e[1]];
                const body = [[0, -pw * 0.45], [pl, -pw], [pl, pw], [0, pw * 0.45]].map(q => [tip[0] + q[0] * ca - q[1] * sa, tip[1] + q[0] * sa + q[1] * ca]);
                const cap = [[pl * 0.62, -pw * 0.92], [pl, -pw], [pl, pw], [pl * 0.62, pw * 0.92]].map(q => [tip[0] + q[0] * ca - q[1] * sa, tip[1] + q[0] * sa + q[1] * ca]);
                const show = p < 1 || lt < win + 0.6;
                penB.setAttribute('d', show ? inkLoop(body, { seed: k + 460, t, smooth: false }) : '');
                penC.setAttribute('d', show ? inkLoop(cap, { seed: k + 461, t, smooth: false }) : '');
                penR.setAttribute('d', show ? inkPath(body, { w: 5, seed: k + 462, t, closed: true, smooth: false }) : '');
                if (lt >= win) {
                  tagG.setAttribute('transform', `translate(${L.f1(Math.min(e[0], ax1 - 40 * u))} ${L.f1(e[1] - 80 * u)}) scale(${(tp * (1 + 0.12 * punch(lt, win))).toFixed(3)})`);
                  const c4 = [[-70 * u, -52 * u], [70 * u, -54 * u], [72 * u, 26 * u], [-68 * u, 28 * u]];
                  tagC.setAttribute('d', inkLoop(c4, { seed: k + 450, t, smooth: false })); tagT.setAttribute('y', 0);
                } else tagG.setAttribute('transform', 'scale(0)');
              }
            }
            champ.setAttribute('transform', 'scale(0)');
          }
          cards.setAttribute('d', CD.join(' ')); cardsR.setAttribute('d', CR.join(' ')); pins.setAttribute('d', PN.join(' '));
          grey.setAttribute('d', G.join(' ')); red.setAttribute('d', RD.join(' ')); axes.setAttribute('d', AX.join(' '));
          bugs.update(t, 0.5 * W, (by0 + by1) / 2, 0.42 * W, 0.18 * H, 0.5 * u);
          bench.update(t, W, H, bt);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
