// nea_compare: two long paper tapes of DNA letters (A C G T), one above the other, slowly scrolling: the top one is
// the ancient genome, the bottom one ours (Neanderthal DNA Short). A big magnifying glass slides along them; gold
// ink ties join matching letters as it passes, and on the match cue a run of letters lights up in gold boxes with
// a stamped note. Hand-written tape names on the left.
// P: {rows: [{label: "NEANDERTHAL", y: 560}, {label: "YOU", y: 900}], cell: 104 (px per letter), speed: 40 (px/s),
//     match: {at: cue|s, from: 5, n: 3, label: "MATCH!"}, lens: {from: 0.15, to: 0.75, y: 0.38}, labels: [...MCB labels]}
// cues: match.at, labels' at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_compare = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const { atOr, labels, FR, rr } = window.MCB;
      const sd = seed * 1000 + 7300;
      const rows = P.rows || [{ label: 'NEANDERTHAL', y: 660 }, { label: 'YOU', y: 1000 }];
      const cell = P.cell ?? 104, n = Math.ceil(W / cell) + 4;
      const R = rng(sd + 1), BASES = 'ACGT';
      const seqA = Array.from({ length: n }, () => BASES[Math.floor(R() * 4)]);
      const seqB = seqA.slice();
      [3, 10].forEach(i => { if (i < n) seqB[i] = BASES[(BASES.indexOf(seqA[i]) + 2) % 4]; });   // a few differences
      const MT = Object.assign({ from: 5, n: 3, label: 'MATCH!' }, P.match || {});
      const root = el(svg, 'g');
      // a wooden desk the tapes lie on (fills the frame to the bottom), a pencil and a printout corner
      const desk = inkEl(root, INK.paperDark), grain = inkEl(root, INK.inkSoft), deskL = inkEl(root, INK.ink);
      const sheetF = inkEl(root, INK.paperLight), sheetL = inkEl(root, INK.inkSoft), pencilF = inkEl(root, INK.gold), pencilL = inkEl(root, INK.ink);
      const DESK = P.desk ?? 430, GR = rng(sd + 33), GRAIN = Array.from({ length: 16 }, () => [GR(), GR(), GR()]);
      const ties = inkEl(root, INK.gold), tiesX = inkEl(root, INK.red);
      const tapes = rows.map((r, k) => {
        const g = el(root, 'g');
        const shadow = inkEl(g, INK.ink), paper = inkEl(g, INK.paperLight), hi = inkEl(g, INK.gold), line = inkEl(g, INK.ink), ticks = inkEl(g, INK.inkSoft);
        const letters = (k ? seqB : seqA).map(ch => { const tx = el(g, 'text', { 'font-family': FR, 'font-size': 76, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }); tx.textContent = ch; return tx; });
        const name = el(root, 'text', { x: 60, y: r.y - 118, 'font-family': INK_FONT, 'font-size': 66, fill: k ? INK.blue : INK.red });
        name.textContent = r.label;
        return { r, shadow, paper, hi, line, ticks, letters, name };
      });
      const lensG = el(root, 'g'), lensF = inkEl(lensG, INK.paperLight), lensL = inkEl(lensG, INK.ink), lensH = inkEl(lensG, INK.inkSoft);
      const stampG = el(root, 'g'), stampF = inkEl(stampG, INK.paperLight), stampL = inkEl(stampG, INK.red);
      const stampT = el(stampG, 'text', { x: 0, y: 0, 'font-family': FR, 'font-size': 84, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red });
      stampT.textContent = MT.label;
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const off = -lt * (P.speed ?? 40) - cell * 0.5;
          const dk = [[-40, DESK], [W + 40, DESK - 10], [W + 40, H + 20], [-40, H + 20]];
          desk.setAttribute('d', inkLoop(dk, { seed: sd + 300, t, amp: 0.8, smooth: false })); desk.setAttribute('fill-opacity', 0.55);
          let gd = '';
          GRAIN.forEach((g, i) => { const y = DESK + 30 + g[0] * (H - DESK - 60), x0 = g[1] * W * 0.6 - 60, L = 300 + g[2] * 500;
            gd += inkPath([[x0, y], [x0 + L * 0.5, y + 6 * Math.sin(i)], [x0 + L, y + 2]], { w: 2.5, seed: sd + 310 + i, t, amp: 0.6 }) + ' '; });
          gd += inkPath([[-40, H - 30], [W + 40, H - 30]], { w: 1, seed: sd + 330, t, amp: 0.4 });
          grain.setAttribute('d', gd); grain.setAttribute('fill-opacity', 0.6);
          deskL.setAttribute('d', inkPath([[-40, DESK], [W + 40, DESK - 10]], { w: 7, seed: sd + 331, t, amp: 1 }));
          const shp = [[W * 0.08, rows[1].y + 150], [W * 0.62, rows[1].y + 135], [W * 0.66, H + 40], [W * 0.05, H + 40]];
          sheetF.setAttribute('d', inkLoop(shp, { seed: sd + 332, t, amp: 0.8, smooth: false }));
          let sl = inkPath(shp, { w: 4, seed: sd + 333, t, closed: true, amp: 0.8, smooth: false });
          for (let i = 0; i < 5; i++) { const y = rows[1].y + 200 + i * 52; sl += ' ' + inkPath([[W * 0.12, y], [W * (0.42 + (i % 3) * 0.06), y - 3]], { w: 6, seed: sd + 334 + i, t, amp: 0.6 }); }
          sheetL.setAttribute('d', sl);
          const pc = [[W * 0.7, rows[1].y + 330], [W * 0.98, rows[1].y + 230]];
          pencilF.setAttribute('d', inkPath(pc, { w: 30, seed: sd + 340, t, amp: 0.5, taper: 0.02 }));
          pencilL.setAttribute('d', inkPath(pc, { w: 6, seed: sd + 341, t, amp: 0.5 }) + ' ' + inkPath([[pc[0][0] - 50, pc[0][1] + 18], pc[0]], { w: 12, seed: sd + 342, t, amp: 0.4 }));
          const mAt = atOr(cues, MT.at, dur * 0.55), mp = spring(lt, mAt, 0.5), mpk = punch(lt, mAt, 0.6);
          const L = Object.assign({ from: 0.15, to: 0.78, y: (rows[0].y + rows[1].y) / 2 / H }, P.lens || {});
          const lx = lerp(L.from, L.to, progIO(lt, 0.1, Math.max(1, dur - 0.4))) * W, ly = L.y * H;
          const app = k => spring(lt, 0.05 + k * 0.15, 0.6);
          const xs = i => off + i * cell + cell / 2;
          tapes.forEach((tp, k) => {
            const y = tp.r.y, a = app(k), dy = (1 - a) * 80;
            const pts = rr(-40, y - 62 + dy, W + 80, 124, 10);
            tp.shadow.setAttribute('d', inkLoop(pts.map(q => [q[0] + 10, q[1] + 12]), { seed: sd + 10 + k, t, amp: 1 }));
            tp.shadow.setAttribute('fill-opacity', 0.15);
            tp.paper.setAttribute('d', inkLoop(pts, { seed: sd + 12 + k, t, amp: 1 }));
            tp.line.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 14 + k, t, closed: true, amp: 1.2 }));
            let tk = '', hb = '';
            tp.letters.forEach((tx, i) => {
              const x = xs(i);
              tx.setAttribute('x', NEA.f1(x)); tx.setAttribute('y', NEA.f1(y + dy));
              tx.setAttribute('fill', i >= MT.from && i < MT.from + MT.n && mp > 0.5 ? INK.red : INK.ink);
              tk += inkPath([[x + cell / 2, y - 50 + dy], [x + cell / 2, y + 50 + dy]], { w: 3, seed: sd + 20 + i + k * 40, t, amp: 0.6 }) + ' ';
              if (i >= MT.from && i < MT.from + MT.n && mp > 0.01) hb += inkLoop(rr(x - cell / 2 + 8, y - 50 + dy, (cell - 16), 100, 10), { seed: sd + 60 + i + k * 40, t, amp: 1 }) + ' ';
            });
            tp.ticks.setAttribute('d', tk); tp.hi.setAttribute('d', hb); tp.hi.setAttribute('fill-opacity', (0.55 * mp).toFixed(3));
            tp.name.setAttribute('y', NEA.f1(y - 100 + dy));
          });
          // gold ties for letters the lens has passed
          let td = '', tx = '';
          const y0 = rows[0].y + 66, y1 = rows[1].y - 66;
          for (let i = 0; i < n; i++) {
            const x = xs(i); if (x > lx + 40 || x < -40 || x > W + 40) continue;
            const same = seqA[i] === seqB[i], pp = clamp01((lx + 40 - x) / 120);
            if (pp <= 0) continue;
            const yy = lerp(y0, y1, pp);
            if (same) td += inkPath([[x, y0], [x, yy]], { w: i >= MT.from && i < MT.from + MT.n ? 12 * (1 + 0.3 * mpk) : 7, seed: sd + 120 + i, t, amp: 0.8 }) + ' ';
            else tx += inkPath([[x - 20, (y0 + y1) / 2 - 20], [x + 20, (y0 + y1) / 2 + 20]], { w: 7, seed: sd + 170 + i, t, amp: 0.6 }) + ' ' + inkPath([[x + 20, (y0 + y1) / 2 - 20], [x - 20, (y0 + y1) / 2 + 20]], { w: 7, seed: sd + 175 + i, t, amp: 0.6 });
          }
          ties.setAttribute('d', td); tiesX.setAttribute('d', tx);
          // lens
          const lr = 150;
          lensF.setAttribute('d', inkCircle(lx, ly, lr, sd + 200, t, { fill: true })); lensF.setAttribute('fill-opacity', 0.35);
          lensL.setAttribute('d', inkCircle(lx, ly, lr, sd + 201, t, { w: 18 }) + ' ' + inkPath([[lx + lr * 0.72, ly + lr * 0.72], [lx + lr * 1.55, ly + lr * 1.55]], { w: 34, seed: sd + 202, t, amp: 1, taper: 0.05 }));
          lensH.setAttribute('d', inkPath([[lx - lr * 0.55, ly - lr * 0.2], [lx - lr * 0.25, ly - lr * 0.6]], { w: 10, seed: sd + 203, t, amp: 0.6 }));
          // stamp
          if (lt >= mAt) {
            const sx = xs(MT.from + (MT.n - 1) / 2), sy = (rows[0].y + rows[1].y) / 2, s = lerp(1.8, 1, clamp01(mp)) * (1 + 0.08 * mpk);
            stampG.style.display = '';
            stampG.setAttribute('transform', `translate(${NEA.f1(Math.min(W - 230, Math.max(230, sx)))} ${NEA.f1(sy)}) rotate(-6) scale(${s.toFixed(3)})`);
            let w = 300; try { w = stampT.getComputedTextLength(); } catch (e) {}
            const pts = rr(-w / 2 - 30, -60, w + 60, 120, 14);
            stampF.setAttribute('d', inkLoop(pts, { seed: sd + 210, t, amp: 1 }));
            stampL.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 211, t, closed: true, amp: 1.2 }));
          } else stampG.style.display = 'none';
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
