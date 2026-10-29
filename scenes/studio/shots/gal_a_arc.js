// gal_a_arc: a long span of years as one giant arc across a stone hall (02-galileo-teleskop: 1633 -> 1992).
// "set": false. Stone wall (GAL.room) + floor to the frame bottom; on the left a lectern with an open trial ledger and the
// first year, on the right a lectern with a sealed charter and the second year; a dashed arc draws itself across the
// whole wall from left to right with a glowing dot riding its tip and a year counter beside it; on `big.at` a huge
// number card (red box, Fraunces) punches in at the centre. Parchment ink, palette tokens only, pure function of (seed, lt).
// P: {from: {year, text, at}, to: {year, text, at (the arc reaches it here)}, big: {text: "359 yıl", at}, labels}
// cues: from.at (arc starts), to.at, big.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  SH.gal_a_arc = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 121;
      const A = P.from || { year: '1633' }, B = P.to || { year: '1992' };
      const y0 = +A.year || 0, y1 = +B.year || 0;
      const root = el(svg, 'g');
      const room = G.room(el(root, 'g'), sd + 1);
      const arcL = inkEl(root, INK.ink), dot = inkEl(root, INK.gold), dotR = inkEl(root, INK.red);
      const lecF = inkEl(root, mix(INK.stain, INK.ink, 0.35)), lecL = inkEl(root), bookF = inkEl(root, INK.paperLight), sealF = inkEl(root, INK.red);
      const T = (txt, size, font, fill, weight = 900) => { const e = el(root, 'text', { 'font-family': font, 'font-size': size, 'font-weight': weight, 'text-anchor': 'middle', fill }); e.textContent = txt; return e; };
      const ya = T(A.year, 120, FR, INK.ink), yb = T(B.year, 120, FR, INK.red);
      const ta = T(A.text || '', 50, INK_FONT, INK.ink, 400), tb = T(B.text || '', 50, INK_FONT, INK.ink, 400);
      const cnt = T('', 64, FR, INK.ink, 800);
      const bigG = el(root, 'g'), bigF = inkEl(bigG, INK.red), bigL = inkEl(bigG);
      const bigT = el(bigG, 'text', { 'font-family': FR, 'font-size': 190, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.paperLight });
      bigT.textContent = (P.big && P.big.text) || '';
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 50 + i));
      const lx = 0.17 * W, rx = 0.83 * W, gy = 0.8 * H, base = 0.52 * H, peak = 0.12 * H;
      const ab = base - 150, arcPt = u => [lerp(lx, rx, u), ab - Math.sin(u * Math.PI) * (ab - peak)];
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          room.update(t, W, H, { gy, kind: 'stone' });
          // lecterns
          let lf = '', ll = '', bf = '', sf = '';
          [lx, rx].forEach((x, i) => {
            const k = spring(lt, i ? G.atOr(cues, B.at, 1.5) - 0.4 : 0, 0.7);
            const p = [[x - 110, gy + 10], [x + 110, gy + 10], [x + 80, base + 120], [x - 80, base + 120]];
            lf += inkLoop(p, { seed: sd + 10 + i, t, amp: 0.5, smooth: false }) + ' ';
            ll += G.ring(p, sd + 12 + i, t, 5, 0.5) + ' ' + G.line([[x - 130, base + 120], [x + 130, base + 112]], sd + 14 + i, t, 12) + ' ';
            const s = Math.max(0.01, k), bw = 120 * s, bh = 40 * s, by = base + 100;
            const bk = [[x - bw, by], [x, by + 10 * s], [x + bw, by], [x + bw + 8, by - bh], [x, by - bh + 10 * s], [x - bw - 8, by - bh]];
            bf += inkLoop(bk, { seed: sd + 16 + i, t, amp: 0.4, smooth: false }) + ' ';
            ll += G.ring(bk, sd + 18 + i, t, 3.5, 0.4) + ' ' + G.line([[x, by + 10 * s], [x, by - bh + 10 * s]], sd + 20 + i, t, 3) + ' ';
            if (i) sf += inkDot(x + 50 * s, by - bh * 0.5, 18 * s, 18 * s, sd + 22, t) + ' ';
          });
          lecF.setAttribute('d', lf); lecL.setAttribute('d', ll); bookF.setAttribute('d', bf); sealF.setAttribute('d', sf);
          ya.setAttribute('x', lx); ya.setAttribute('y', base - 30); ta.setAttribute('x', lx); ta.setAttribute('y', base + 44);
          yb.setAttribute('x', rx); yb.setAttribute('y', base - 30); tb.setAttribute('x', rx); tb.setAttribute('y', base + 44);
          const a0 = G.atOr(cues, A.at, 0.2), a1 = G.atOr(cues, B.at, a0 + 3);
          const u = progIO(lt, a0, Math.max(0.8, a1 - a0));
          yb.style.display = tb.style.display = u >= 0.98 ? '' : 'none';
          // the arc (dashes up to the tip) + riding dot + counter
          let ad = '';
          const n = 34;
          for (let i = 0; i < n; i++) { const s0 = i / n, s1 = (i + 0.55) / n; if (s0 > u) break; ad += G.line([arcPt(s0), arcPt(Math.min(s1, u))], sd + 30 + i, t, 9, 1) + ' '; }
          arcL.setAttribute('d', ad);
          const tip = arcPt(u), pulse = 1 + 0.2 * Math.sin(t * 8);
          dot.setAttribute('d', u > 0 ? inkDot(tip[0], tip[1], 26 * pulse, 26 * pulse, sd + 70, t) : '');
          dotR.setAttribute('d', u > 0 ? inkCircle(tip[0], tip[1], 44 * pulse, sd + 71, t, { w: 4 }) : '');
          cnt.textContent = u > 0 && u < 0.98 ? String(Math.round(lerp(y0, y1, u))) : '';
          cnt.setAttribute('x', G.f1(tip[0])); cnt.setAttribute('y', G.f1(tip[1] - 64));
          // big number card
          const ba = P.big ? G.atOr(cues, P.big.at, null) : null;
          if (ba != null && lt >= ba) {
            const k = spring(lt, ba, 0.8) * (1 + 0.08 * punch(lt, ba + 0.5)), cx = 0.5 * W, cy = 0.5 * H;
            bigG.style.display = '';
            bigG.setAttribute('transform', `translate(${cx} ${cy}) rotate(-3) scale(${G.f1(Math.max(0.01, k) * 100) / 100})`);
            const bw = 400, bh = 140, bx = [[-bw, -bh], [bw, -bh - 8], [bw + 10, bh], [-bw + 6, bh + 6]];
            bigF.setAttribute('d', inkLoop(bx, { seed: sd + 80, t, amp: 1.2, smooth: false }));
            bigL.setAttribute('d', G.ring(bx, sd + 81, t, 6, 1));
            bigT.setAttribute('x', 0); bigT.setAttribute('y', 66);
          } else bigG.style.display = 'none';
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
