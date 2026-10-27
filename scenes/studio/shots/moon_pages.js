// moon_pages: printed sheets pinned with clothes-pins on a drying line across a print shop (Stickstory ag-14): each
// sheet pops onto the line on its cue and sways; a sheet is either a small front page (masthead, date, an engraving
// from moon__lib.js) or a big clue card (a large number / word). A red ring can single one out.
// Set: "interior" (pass "ground"). Parchment ink style, palette tokens only, pure function of (seed, lt).
// P: {y: 0.2 (line height), sag: 50, h: 0.6 (sheet height, of H), rows: 1 (lines of sheets), row_gap: 0.45 (of H),
//     gap: 26, max_w: 330, ratio: 1.45 (sheet height / width),
//     pages: [{date: "AUG 25", kind: "lens"|"bison"|"beaver"|"manbat"|"temple"|"fire"|"goat"|null, big: "1", sub, at}],
//     masthead: "THE SUN", ring: {index, at}, kasif: K (MOON.K), cast: [K], labels: [...]}
// cues: pages "at", ring.at, cast cues.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const f1 = v => Math.round(v * 10) / 10;

  SH.moon_pages = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = MOON.line, n = Math.max(1, (P.pages || []).length), rows = Math.max(1, P.rows ?? 1), per = Math.ceil(n / rows);
      const ly0 = (P.y ?? 0.2) * H, sag = P.sag ?? 50, rowGap = (P.row_gap ?? 0.45) * H;
      const gap = P.gap ?? 26, pw = Math.min(P.max_w ?? 330, (W - 140 - gap * (per - 1)) / per), ph = Math.min((P.h ?? 0.6) * H, pw * (P.ratio ?? 1.45));
      const x0 = (W - (pw * per + gap * (per - 1))) / 2;
      const lineYr = (x, r) => ly0 + r * rowGap + sag * (1 - ((x - W / 2) / (W / 2)) ** 2);
      const lineY = x => lineYr(x, 0);
      const root = el(svg, 'g');
      const rope = inkEl(root, INK.inkSoft), posts = inkEl(root);
      const pages = (P.pages || []).map((pg, i) => {
        const row = Math.floor(i / per), col = i % per;
        const cx = x0 + col * (pw + gap) + pw / 2, top = lineYr(cx, row) + 6;
        const g = el(root, 'g');
        const sh = inkEl(g, INK.paperDark), f = inkEl(g, INK.paperLight), r = inkEl(g), cols = inkEl(g, INK.inkSoft);
        const mast = el(g, 'text', { x: cx, y: top + pw * 0.2, 'font-family': FR, 'font-weight': 900, 'font-size': Math.max(44, pw * 0.17), 'text-anchor': 'middle', fill: INK.ink });
        mast.textContent = pg.big ? '' : (P.masthead ?? 'THE SUN');
        const date = el(g, 'text', { x: cx, y: top + pw * 0.2 + 56, 'font-family': FR, 'font-weight': 700, 'font-size': 44, 'text-anchor': 'middle', fill: INK.red });
        date.textContent = pg.big ? '' : (pg.date || '');
        const big = pg.big ? el(g, 'text', { x: cx, y: top + ph * 0.62, 'font-family': FR, 'font-weight': 900, 'font-size': ph * 0.5, 'text-anchor': 'middle', fill: INK.ink }) : null;
        if (big) big.textContent = pg.big;
        const sub = pg.sub ? el(g, 'text', { x: cx, y: top + ph * 0.86, 'font-family': INK_FONT, 'font-size': 48, 'text-anchor': 'middle', fill: INK.red }) : null;
        if (sub) sub.textContent = pg.sub;
        const eg = el(g, 'g'), ebox = inkEl(eg, mix(INK.paperDark, INK.paperLight, 0.5)), eboxR = inkEl(eg);
        const mk = { manbat: MOON.manbat, bison: MOON.bison, beaver: MOON.beaver, temple: MOON.temple, goat: MOON.goat, fire: MOON.hut }[pg.kind];
        const obj = mk ? mk(el(eg, 'g'), seed * 7 + i * 13) : null;
        const lensF = pg.kind === 'lens' ? inkEl(eg, mix(INK.blue, INK.paperLight, 0.68)) : null, lensR = pg.kind === 'lens' ? inkEl(eg) : null;
        const fireF = pg.kind === 'fire' ? inkEl(eg, INK.red) : null, fireG = pg.kind === 'fire' ? inkEl(eg, INK.gold) : null;
        const pins = inkEl(g, mix(INK.paperDark, INK.inkSoft, 0.4)), pinsR = inkEl(g);
        return { pg, i, row, cx, top, g, sh, f, r, cols, eg, ebox, eboxR, obj, lensF, lensR, fireF, fireG, pins, pinsR };
      });
      const ring = inkEl(root, INK.red);
      const cast = (P.cast || []).concat(P.kasif ? [P.kasif] : []).map((c, i) => MOON.K(el(root, 'g'), c, seed * 3 + i * 7 + 1));
      const labels = (P.labels || []).map((l, i) => MOON.label(el(root, 'g'), l, W, H, seed * 41 + i * 7));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          let rd = '', pd = '';
          for (let r = 0; r < rows; r++) {
            const rp = []; for (let i = 0; i <= 20; i++) { const x = -30 + i * (W + 60) / 20; rp.push([x, lineYr(x, r)]); }
            rd += L(rp, seed + r * 7, t, 4, 1, 0.02) + ' ';
            const ly = ly0 + r * rowGap;
            pd += L([[30, ly - 40], [30, ly + 30]], seed + 1 + r * 7, t, 9) + ' ' + L([[W - 30, ly - 40], [W - 30, ly + 30]], seed + 2 + r * 7, t, 9) + ' ';
          }
          rope.setAttribute('d', rd); posts.setAttribute('d', pd);
          for (const o of pages) {
            const a = MOON.at(cues, o.pg.at, 0.25 + o.i * 0.35), p = spring(lt, a, 0.7);
            o.g.style.visibility = lt >= a ? 'visible' : 'hidden';
            if (lt < a) continue;
            const sw = Math.sin(lt * 1.3 + o.i * 1.7) * 1.6 + (1 - p) * 14;
            o.g.setAttribute('transform', `rotate(${sw.toFixed(2)} ${f1(o.cx)} ${f1(o.top)}) translate(0 ${f1((1 - p) * -60)})`);
            const x = o.cx - pw / 2, y = o.top, q = [[x, y], [x + pw, y], [x + pw - 2, y + ph], [x + 2, y + ph - 3]];
            o.sh.setAttribute('d', inkLoop(q.map(v => [v[0] + 10, v[1] + 12]), { seed: seed + o.i * 5, t, amp: 0.8, smooth: false }));
            o.sh.setAttribute('fill-opacity', 0.7);
            o.f.setAttribute('d', inkLoop(q, { seed: seed + o.i * 5 + 1, t, amp: 0.8, smooth: false }));
            o.r.setAttribute('d', inkPath(q, { w: 4, seed: seed + o.i * 5 + 2, t, closed: true, amp: 0.8, smooth: false }) +
              (o.pg.big ? '' : ' ' + L([[x + 16, y + pw * 0.2 + 14], [x + pw - 16, y + pw * 0.2 + 14]], seed + o.i * 5 + 3, t, 3)));
            // engraving + columns (front pages only)
            const ey = y + pw * 0.2 + 80, eh = Math.min(ph * 0.42, pw * 0.75), ew = pw - 40, ex = x + 20, ecx = o.cx, egy = ey + eh - 14;
            if (!o.pg.big) {
              let cd = ''; const rows = Math.floor((y + ph - 30 - (ey + eh + 24)) / 22);
              for (let k = 0; k < rows; k++) { const yy = ey + eh + 24 + k * 22; cd += L([[x + 22, yy], [x + 22 + (pw - 44) * (k % 4 === 3 ? 0.6 : 1), yy + 1]], seed + o.i * 50 + k, t, 2.4, 0.5) + ' '; }
              o.cols.setAttribute('d', cd);
              const bq = [[ex, ey], [ex + ew, ey], [ex + ew, ey + eh], [ex, ey + eh]];
              o.ebox.setAttribute('d', inkLoop(bq, { seed: seed + o.i * 7, t, amp: 0.6, smooth: false }));
              o.eboxR.setAttribute('d', inkPath(bq, { w: 3, seed: seed + o.i * 7 + 1, t, closed: true, amp: 0.6, smooth: false }));
              const k = eh / 330;
              if (o.obj) {
                if (o.pg.kind === 'manbat') o.obj.update(t, { x: ecx, y: egy + 8, s: k, flap: Math.sin(t * 3 + o.i) * 0.5 });
                else if (o.pg.kind === 'temple') o.obj.update(t, { x: ecx, y: egy, s: k * 0.68 });
                else if (o.pg.kind === 'fire') o.obj.update(t, { x: ecx, y: egy, s: k * 1.1 });
                else o.obj.update(t, { x: ecx, y: egy, s: k * (o.pg.kind === 'bison' ? 0.95 : 1.1), face: 1, graze: true, walk: o.pg.kind === 'beaver' });
              }
              if (o.lensF) {
                const r = eh * 0.38;
                o.lensF.setAttribute('d', inkLoop(inkEllipsePts(ecx, ey + eh / 2, r, r, seed + o.i, 16), { seed: seed + o.i, t, amp: 0.8 }));
                o.lensR.setAttribute('d', inkCircle(ecx, ey + eh / 2, r, seed + o.i + 1, t, { w: 5 }) + ' ' + L([[ecx - r * 0.45, ey + eh / 2 - r * 0.3], [ecx - r * 0.15, ey + eh / 2 - r * 0.6]], seed + o.i + 2, t, 3.5));
              }
              if (o.fireF) {
                let ff = '', fg = '';
                for (let j = 0; j < 3; j++) { const bx = ecx - 40 * k * 3 + j * 40 * k * 3, hh = (60 + 30 * Math.sin(t * 7 + j)) * k * 1.4, by = egy - 100 * k * 1.1; ff += inkLoop([[bx - 22 * k * 2, by], [bx, by - hh], [bx + 22 * k * 2, by]], { seed: seed + o.i * 9 + j, t, amp: 1.2 }) + ' '; fg += inkLoop([[bx - 8 * k * 2, by], [bx, by - hh * 0.5], [bx + 8 * k * 2, by]], { seed: seed + o.i * 9 + j + 5, t, amp: 1 }) + ' '; }
                o.fireF.setAttribute('d', ff); o.fireG.setAttribute('d', fg);
              }
            } else o.eg.style.display = 'none';
            // two clothes-pins
            let pf = '', pr = '';
            for (const dx of [-pw * 0.32, pw * 0.32]) { const px = o.cx + dx, py = lineYr(px, o.row) - 18; const pq = [[px - 9, py], [px + 9, py], [px + 7, py + 50], [px - 7, py + 50]]; pf += inkLoop(pq, { seed: seed + o.i * 3 + dx, t, amp: 0.5, smooth: false }) + ' '; pr += inkPath(pq, { w: 3, seed: seed + o.i * 3 + dx + 1, t, closed: true, amp: 0.5, smooth: false }) + ' '; }
            o.pins.setAttribute('d', pf); o.pinsR.setAttribute('d', pr);
          }
          if (P.ring) {
            const o = pages[P.ring.index ?? 0], a = MOON.at(cues, P.ring.at, 0.8), q = clamp01((lt - a) / 0.6);
            const pts = []; const nn = Math.max(2, Math.round(30 * q));
            for (let k = 0; k <= nn; k++) { const an = -2.2 + k / 30 * Math.PI * 2.15; pts.push([o.cx + Math.cos(an) * (pw * 0.62), o.top + ph / 2 + Math.sin(an) * (ph * 0.58)]); }
            ring.setAttribute('d', o && q > 0 ? L(pts, seed + 99, t, 8, 1.5) : '');
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
