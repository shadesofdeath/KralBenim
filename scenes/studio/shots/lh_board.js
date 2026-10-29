// lh_board: a 1960s lecture-room blackboard filling the frame, parchment ink style (brand/kit/BRAND.md §3, §5; boils at
// 8 Hz, pure function of (seed, time)). A chalk hand writes P.lines letter by letter (Patrick Hand, paper-light chalk
// with a dusty edge), a chalk stick moving with the last letter; on `term` the last line gets a double chalk
// underline and punches. A journal page (title lines + P.note, e.g. "1967") is pinned to the board's lower right corner
// with a red pin and flutters. Below the board: chalk ledge with chalk and a sponge, then the floor; foreground: a
// wooden teacher's desk with books and a steaming mug down to the frame bottom. Leaves wall + floor to the set.
// P: {lines: ["ÖĞRENİLMİŞ", "ÇARESİZLİK"], size: 140, note: "1967", board: [x0, y0, x1, y1] (0..1), desk: 0.76 (0..1 H)}
// cues: term (underline + punch). Needs lh__lib.js (LH).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lh_board = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 617, u = W / 1080;
      const root = el(svg, 'g');
      const bb = P.board || [0.04, 0.15, 0.96, 0.56];
      const frame = inkEl(root, mix(INK.stain, INK.ink, 0.25)), slate = inkEl(root, mix(INK.ink, INK.green, 0.28)), smudge = inkEl(root, INK.paperLight, { 'fill-opacity': 0.08 }), frameR = inkEl(root);
      const lines = P.lines || ['ÖĞRENİLMİŞ', 'ÇARESİZLİK'], size = (P.size || 140) * u;
      const T = lines.map(() => L.txt(root, { 'font-family': INK_FONT, 'font-size': size, fill: INK.paperLight }));
      const ul = inkEl(root, INK.paperLight, { 'fill-opacity': 0.92 });
      const chalk = inkEl(root, INK.paperLight), chalkR = inkEl(root), dust = inkEl(root, INK.paperLight, { 'fill-opacity': 0.5 });
      const pageG = el(root, 'g');
      const page = inkEl(pageG, INK.paperLight), pageR = inkEl(pageG), pageL = inkEl(pageG, INK.inkSoft), pin = inkEl(pageG, INK.red);
      const pageT = L.txt(pageG, { 'font-family': L.SERIF, 'font-weight': 900, 'font-size': 64 * u, fill: INK.ink });
      pageT.textContent = P.note || '1967';
      const ledge = inkEl(root, mix(INK.stain, INK.ink, 0.2)), ledgeR = inkEl(root), sticks = inkEl(root, INK.paperLight), sponge = inkEl(root, mix(INK.gold, INK.stain, 0.4)), spongeR = inkEl(root);
      const desk = L.front(el(root, 'g'), sd + 50, 'desk');
      const total = lines.reduce((a, s) => a + s.length, 0);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const term = L.atOr(cues, 'term', dur * 0.6);
          const x0 = bb[0] * W, y0 = bb[1] * H, x1 = bb[2] * W, y1 = bb[3] * H;
          const fr = [[x0 - 26 * u, y0 - 26 * u], [x1 + 26 * u, y0 - 26 * u], [x1 + 26 * u, y1 + 26 * u], [x0 - 26 * u, y1 + 26 * u]];
          frame.setAttribute('d', inkLoop(fr, { seed: k + 1, t, smooth: false }));
          slate.setAttribute('d', inkLoop(L.rect(x0, y0, x1, y1), { seed: k + 2, t, smooth: false, amp: 1 }));
          smudge.setAttribute('d', [0, 1, 2, 3].map(i => inkPath([[lerp(x0, x1, 0.08 + i * 0.22), lerp(y0, y1, 0.12 + (i % 2) * 0.72)], [lerp(x0, x1, 0.2 + i * 0.22), lerp(y0, y1, 0.1 + (i % 2) * 0.72)]], { w: 22 * u, seed: k + 3 + i, t })).join(' '));
          frameR.setAttribute('d', inkPath(fr, { w: 6, seed: k + 6, t, closed: true, smooth: false }) + ' ' + inkPath(L.rect(x0, y0, x1, y1), { w: 5, seed: k + 7, t, closed: true, smooth: false }));
          // chalk writing, letter by letter, finished a little before `term`
          const wEnd = Math.max(0.8, term - 0.2), done = Math.floor(clamp01(lt / wEnd) * total + 0.001);
          let used = 0, tip = null;
          const cy0 = lerp(y0, y1, lines.length > 1 ? 0.36 : 0.55), gap = size * 1.12;
          T.forEach((e, i) => {
            const n = Math.max(0, Math.min(lines[i].length, done - used)); used += lines[i].length;
            e.textContent = lines[i].slice(0, n);
            const yy = cy0 + i * gap, jx = boil(k + 10 + i, t, 1.2);
            e.setAttribute('x', L.f1((x0 + x1) / 2 + jx[0])); e.setAttribute('y', L.f1(yy + jx[1]));
            const hit = i === lines.length - 1 ? punch(lt, term, 0.7) : 0;
            e.setAttribute('transform', hit ? `translate(${L.f1((x0 + x1) / 2)} ${L.f1(yy)}) scale(${(1 + 0.1 * hit).toFixed(3)}) translate(${L.f1(-(x0 + x1) / 2)} ${L.f1(-yy)})` : '');
            if (n > 0 && n < lines[i].length) tip = [(x0 + x1) / 2 - lines[i].length * size * 0.24 + n * size * 0.48, yy - size * 0.3];
          });
          if (!tip && done < total) tip = [x0 + 140 * u, cy0 - size * 0.3];
          const lastY = cy0 + (lines.length - 1) * gap;
          const uq = clamp01((lt - term) / 0.5), uw = lines[lines.length - 1].length * size * 0.26;
          ul.setAttribute('d', uq > 0 ? [0, 1].map(i => inkPath([[(x0 + x1) / 2 - uw, lastY + (34 + i * 26) * u], [(x0 + x1) / 2 - uw + 2 * uw * uq, lastY + (30 + i * 26) * u]], { w: 8 * u, seed: k + 20 + i, t })).join(' ') : '');
          if (!tip && uq > 0 && uq < 1) tip = [(x0 + x1) / 2 - uw + 2 * uw * uq, lastY + 30 * u];
          if (tip) {
            const cp = [[tip[0], tip[1]], [tip[0] + 22 * u, tip[1] - 8 * u], [tip[0] + 70 * u, tip[1] - 90 * u], [tip[0] + 48 * u, tip[1] - 98 * u]];
            chalk.setAttribute('d', inkLoop(cp, { seed: k + 30, t, smooth: false }));
            chalkR.setAttribute('d', inkPath(cp, { w: 3.5, seed: k + 31, t, closed: true, smooth: false }));
            dust.setAttribute('d', [0, 1, 2, 3].map(i => { const ph = (t * 1.5 + i / 4) % 1; return inkDot(tip[0] - 6 * u + i * 6 * u, tip[1] + ph * 60 * u, 4 * u, 4 * u, k + 32 + i, t); }).join(' '));
          } else { chalk.setAttribute('d', ''); chalkR.setAttribute('d', ''); dust.setAttribute('d', ''); }
          // pinned journal page (lower right of the board), flutters
          const px = x1 - 150 * u, py = y1 - 130 * u, fl = Math.sin(t * 3.1) * 2.5;
          pageG.setAttribute('transform', `rotate(${L.f1(5 + fl)} ${L.f1(px)} ${L.f1(py - 110 * u)})`);
          const pg = L.rect(px - 110 * u, py - 120 * u, px + 110 * u, py + 140 * u);
          page.setAttribute('d', inkLoop(pg, { seed: k + 40, t, smooth: false }));
          pageR.setAttribute('d', inkPath(pg, { w: 4.5, seed: k + 41, t, closed: true, smooth: false }));
          pageL.setAttribute('d', [0, 1, 2, 3, 4, 5].map(i => inkPath([[px - 86 * u, py + (10 + i * 20) * u], [px + (i === 5 ? 20 : 86) * u, py + (10 + i * 20) * u]], { w: 3, seed: k + 42 + i, t })).join(' ') + ' ' +
            inkPath([[px - 86 * u, py - 80 * u], [px + 86 * u, py - 80 * u]], { w: 5, seed: k + 49, t }));
          pageT.setAttribute('x', L.f1(px)); pageT.setAttribute('y', L.f1(py - 14 * u));
          pin.setAttribute('d', inkCircle(px, py - 108 * u, 13 * u, k + 50, t, { fill: true }));
          // ledge with chalk and a sponge
          const ly = y1 + 26 * u;
          ledge.setAttribute('d', inkLoop(L.rect(x0 - 40 * u, ly, x1 + 40 * u, ly + 30 * u), { seed: k + 60, t, smooth: false }));
          ledgeR.setAttribute('d', inkPath(L.rect(x0 - 40 * u, ly, x1 + 40 * u, ly + 30 * u), { w: 5, seed: k + 61, t, closed: true, smooth: false }));
          sticks.setAttribute('d', [0.18, 0.24, 0.7].map((q, i) => inkLoop(L.rect(lerp(x0, x1, q), ly - 12 * u, lerp(x0, x1, q) + 54 * u, ly), { seed: k + 62 + i, t, smooth: false })).join(' '));
          const spg = L.rect(lerp(x0, x1, 0.42), ly - 40 * u, lerp(x0, x1, 0.42) + 120 * u, ly);
          sponge.setAttribute('d', inkLoop(spg, { seed: k + 66, t, smooth: false }));
          spongeR.setAttribute('d', inkPath(spg, { w: 4.5, seed: k + 67, t, closed: true, smooth: false }));
          desk.update(t, W, H, (P.desk ?? 0.76) * H);
        },
      };
    },
  };
})();
