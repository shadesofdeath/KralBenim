// moon_paper: an 1835 penny-paper front page, big and close (Stickstory ag-14, Great Moon Hoax): masthead with two
// turning sun emblems, date line and price, a headline set word by word, a credit line, three columns that "print"
// themselves, an engraving panel (a man-bat, the Moon, the telescope lens, a goat...) and red ink marks / stamps.
// Parchment ink style (BRAND.md §5), palette tokens only, pure function of (seed, lt).
// P: {masthead: "THE SUN", date: "NEW-YORK, AUGUST 25, 1835", price: "ONE CENT",
//     head: ["GREAT ASTRONOMICAL", "DISCOVERIES"], credit: "Edinburgh Journal of Science", at: cue|sec (headline starts),
//     page: {x: 0.5, y: 0.56, w: 0.7, h: 1.02, rot: -2}, drop: true (page slides in),
//     engraving: {kind: "manbat"|"orb"|"lens"|"goat"|"beaver"|"temple"|false, at, side: "right"|"left", h (max px)},
//     ring: {target: "price"|"credit"|"head"|"date", at, color: "red"} (hand-drawn ellipse around it),
//     stamps: [{text, x: 0.5, y: 0.6 (0..1 of page), at, color: "red"|"ink"|"blue", rot: -8, size: 120}],
//     strike: {target: "credit", at} (red line through it), marks: [{text, x, y (0..1 of page), size: 64, at}] (printed
//     phrases in the columns, circled in red on their cue), kasif: K (MOON.K), cast: [K]}
// cues: whatever "at"s reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = () => ({ red: INK.red, ink: INK.ink, blue: INK.blue, gold: INK.gold });
  const tlen = (n, fb) => { let w = 0; try { w = n.getComputedTextLength(); } catch (e) { w = 0; } return w || fb; };

  function scribble(x0, y0, w, rows, lh, sd, t, upto) {
    let d = '';
    const r = rng(inkHash(sd, 7)), n = Math.max(0, Math.min(rows, upto));
    for (let i = 0; i < Math.floor(n); i++) {
      const y = y0 + i * lh, ww = w * (i % 6 === 5 ? 0.5 : 0.84 + r() * 0.16);
      const pts = []; for (let k = 0; k <= 5; k++) pts.push([x0 + ww * k / 5, y + Math.sin(k * 2.1 + i) * 1.8]);
      d += inkPath(pts, { w: 3.4, seed: sd + i * 3, t, amp: 0.7, taper: 0.4 }) + ' ';
    }
    const fr = n - Math.floor(n);
    if (fr > 0 && n < rows) { const y = y0 + Math.floor(n) * lh; d += inkPath([[x0, y], [x0 + w * 0.9 * fr, y]], { w: 3.4, seed: sd + 999, t, amp: 0.7, taper: 0.4 }); }
    return d;
  }

  SH.moon_paper = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL();
      const PG = Object.assign({ x: 0.5, y: 0.56, w: 0.7, h: 1.02, rot: -2 }, P.page || {});
      const pw = PG.w * W, ph = PG.h * H, px = PG.x * W - pw / 2, py = PG.y * H - ph / 2;
      const root = el(svg, 'g'), page = el(root, 'g');
      const shadow = inkEl(page, INK.paperDark), sheetF = inkEl(page, INK.paperLight), sheetR = inkEl(page), rules = inkEl(page);
      const suns = inkEl(page, INK.gold), sunsR = inkEl(page);
      const mast = el(page, 'text', { x: px + pw / 2, y: py + 150, 'font-family': FR, 'font-weight': 900, 'font-size': 138, 'text-anchor': 'middle', fill: INK.ink, 'letter-spacing': 4 });
      mast.textContent = P.masthead ?? 'THE SUN';
      let ms = 138; while (ms > 70 && tlen(mast, 0) > pw * 0.56) { ms -= 6; mast.setAttribute('font-size', ms); }
      const mw = tlen(mast, pw * 0.5);
      const date = el(page, 'text', { x: px + 46, y: py + 232, 'font-family': FR, 'font-weight': 700, 'font-size': 46, fill: INK.inkSoft });
      date.textContent = P.date ?? '';
      const price = el(page, 'text', { x: px + pw - 46, y: py + 232, 'font-family': FR, 'font-weight': 900, 'font-size': 52, 'text-anchor': 'end', fill: INK.ink });
      price.textContent = P.price ?? 'ONE CENT';
      // headline words
      const heads = (P.head || []).map((ln, li) => {
        const tx = el(page, 'text', { x: px + pw / 2, y: py + 340 + li * 96, 'font-family': FR, 'font-weight': 900, 'font-size': 86, 'text-anchor': 'middle', fill: INK.ink });
        const words = ln.split(' ').map((w, k) => { const sp = el(tx, 'tspan'); sp.textContent = (k ? ' ' : '') + w; return sp; });
        let fs = 86; while (fs > 50 && tlen(tx, 0) > pw - 110) { fs -= 4; tx.setAttribute('font-size', fs); }
        return { tx, words, y: py + 340 + li * 96, fs };
      });
      const nH = heads.length;
      const credY = py + 340 + nH * 96 - 10;
      const cred = P.credit ? el(page, 'text', { x: px + pw / 2, y: credY, 'font-family': FR, 'font-style': 'italic', 'font-weight': 600, 'font-size': 50, 'text-anchor': 'middle', fill: INK.inkSoft }) : null;
      if (cred) { cred.textContent = P.credit; let fs = 50; while (fs > 44 && tlen(cred, 0) > pw - 120) { fs -= 2; cred.setAttribute('font-size', fs); } }
      const colTop = credY + 50, colH = py + ph - colTop - 40;
      const cols = inkEl(page, INK.inkSoft);
      // engraving panel
      const E = P.engraving && P.engraving.kind ? P.engraving : null;
      const eSide = E && E.side === 'left' ? 0 : 1;
      const cg = 36, cw = (pw - 92 - cg * 2) / 3;
      const ex = px + 46 + (eSide ? cw + cg : 0), ew = cw * 2 + cg, ey = colTop, eh = Math.min(colH, ew * 0.62, (E && E.h) || 1e9);
      const eBox = E ? inkEl(page, mix(INK.paperDark, INK.paperLight, 0.55)) : null, eBoxR = E ? inkEl(page) : null, eHatch = E ? inkEl(page, INK.inkSoft) : null;
      const eG = E ? el(page, 'g') : null;
      let eObj = null;
      if (E) {
        const mk = { manbat: MOON.manbat, orb: MOON.orb, goat: MOON.goat, beaver: MOON.beaver, temple: MOON.temple, bison: MOON.bison }[E.kind];
        if (mk) eObj = mk(eG, seed * 5 + 3);
      }
      const lensG = E && E.kind === 'lens' ? el(page, 'g') : null, lensF = lensG && inkEl(lensG, mix(INK.blue, INK.paperLight, 0.7)), lensR = lensG && inkEl(lensG);
      // printed key phrases inside the columns, circled in red on their cue
      const marks = (P.marks || []).map(m => {
        const bg = inkEl(page, INK.paperLight), tx = el(page, 'text', { x: px + (m.x ?? 0.5) * pw, y: py + (m.y ?? 0.7) * ph, 'font-family': FR, 'font-weight': 800, 'font-size': m.size || 64, 'text-anchor': 'middle', fill: INK.ink });
        tx.textContent = m.text;
        return { m, bg, tx, ring: inkEl(page, INK.red), w: 0 };
      });
      const ringE = inkEl(page, INK.red), strikeE = inkEl(page, INK.red);
      const stamps = (P.stamps || []).map(s => {
        const g = el(root, 'g'), col = C[s.color] || INK.red, size = s.size || 120;
        const box = inkEl(g, col), tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: col, 'letter-spacing': 2 });
        tx.textContent = s.text;
        return { s, g, box, tx, size, w: tlen(tx, size * s.text.length * 0.6) };
      });
      const cast = (P.cast || []).concat(P.kasif ? [P.kasif] : []).map((c, i) => MOON.K(el(root, 'g'), c, seed * 3 + i * 7 + 1));
      const target = (name) => {
        if (name === 'price') { const w = tlen(price, 260); return [px + pw - 46 - w / 2, py + 216, w / 2 + 34, 46]; }
        if (name === 'date') { const w = tlen(date, 600); return [px + 46 + w / 2, py + 216, w / 2 + 30, 42]; }
        if (name === 'credit' && cred) { const w = tlen(cred, 700); return [px + pw / 2, credY - 16, w / 2 + 34, 46]; }
        if (name === 'mast') return [px + pw / 2, py + 105, mw / 2 + 40, 80];
        const h = heads[0]; const w = h ? tlen(h.tx, 800) : 600; return [px + pw / 2, (h ? h.y : py + 340) - 30 + (nH - 1) * 48, w / 2 + 40, 60 + (nH - 1) * 48];
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const dp = P.drop === false ? 1 : spring(lt, 0, 0.9);
          const rot = PG.rot + (1 - dp) * 5, oy = (1 - dp) * H * 0.35;
          page.setAttribute('transform', `translate(0 ${f1(oy)}) rotate(${f1(rot)} ${f1(px + pw / 2)} ${f1(py + ph / 2)})`);
          const sheet = [[px, py], [px + pw, py + 4], [px + pw - 3, py + ph], [px + 2, py + ph - 3]];
          shadow.setAttribute('d', inkLoop(sheet.map(p => [p[0] + 16, p[1] + 18]), { seed: seed * 11, t, amp: 1, smooth: false }));
          shadow.setAttribute('fill-opacity', 0.6);
          sheetF.setAttribute('d', inkLoop(sheet, { seed: seed * 11 + 1, t, amp: 1.2, smooth: false }));
          sheetR.setAttribute('d', inkPath(sheet, { w: 4, seed: seed * 11 + 2, t, amp: 1.2, closed: true, smooth: false }));
          let rd = '';
          for (const y of [py + 180, py + 190, py + 252]) rd += MOON.line([[px + 36, y], [px + pw - 36, y]], seed * 11 + y, t, y === py + 190 ? 2.5 : 4.5, 0.8, 0.05) + ' ';
          for (let k = 1; k < 3; k++) { const x = px + 46 + k * (cw + cg) - cg / 2; rd += MOON.line([[x, colTop - 10], [x, py + ph - 40]], seed * 11 + 50 + k, t, 2.5, 0.8, 0.05) + ' '; }
          rules.setAttribute('d', rd);
          // two little suns beside the masthead, rays turning
          let sd = '', sr = '';
          for (const k of [-1, 1]) {
            const cx = px + pw / 2 + k * (mw / 2 + 90), cy = py + 100, r = 38, a0 = t * 0.6 * k;
            sd += inkCircle(cx, cy, r, seed * 13 + k, t, { fill: true }) + ' ';
            sr += inkCircle(cx, cy, r, seed * 13 + k + 3, t, { w: 4 }) + ' ';
            for (let i = 0; i < 12; i++) { const a = a0 + i / 12 * Math.PI * 2; sr += MOON.line([[cx + Math.cos(a) * (r + 8), cy + Math.sin(a) * (r + 8)], [cx + Math.cos(a) * (r + (i % 2 ? 22 : 34)), cy + Math.sin(a) * (r + (i % 2 ? 22 : 34))]], seed * 13 + 20 + i + k * 40, t, 3.5) + ' '; }
            sr += inkDot(cx - 12, cy - 6, 4, 4, seed * 13 + 60 + k, t) + ' ' + inkDot(cx + 12, cy - 6, 4, 4, seed * 13 + 62 + k, t) + ' ' + MOON.line([[cx - 12, cy + 12], [cx, cy + 17], [cx + 12, cy + 12]], seed * 13 + 64 + k, t, 3);
          }
          suns.setAttribute('d', sd); sunsR.setAttribute('d', sr);
          // headline: word by word
          const h0 = MOON.at(cues, P.at, 0.35);
          let wi = 0;
          heads.forEach(h => h.words.forEach(sp => { sp.style.visibility = lt >= h0 + wi * 0.16 ? 'visible' : 'hidden'; wi++; }));
          if (cred) cred.style.visibility = lt >= h0 + wi * 0.16 + 0.1 ? 'visible' : 'hidden';
          // columns print themselves
          const pr = Math.max(0, (lt - 0.4) * 9);
          const rows = Math.floor(colH / 30);
          let cd = '';
          for (let k = 0; k < 3; k++) {
            const x = px + 46 + k * (cw + cg);
            const inE = E && ((eSide && k >= 1) || (!eSide && k <= 1));
            const y0 = inE ? ey + eh + 34 : colTop + 6, rr = inE ? Math.max(0, Math.floor((py + ph - 40 - y0) / 30)) : rows;
            cd += scribble(x, y0, cw, rr, 30, seed * 17 + k * 101, t, pr - k * 4);
          }
          cols.setAttribute('d', cd);
          if (E) {
            const ea = MOON.at(cues, E.at, 0.5), ep = spring(lt, ea, 0.8);
            const bx = [[ex, ey], [ex + ew, ey], [ex + ew, ey + eh], [ex, ey + eh]];
            eBox.setAttribute('d', ep > 0.01 ? inkLoop(bx, { seed: seed * 19, t, amp: 0.8, smooth: false }) : '');
            eBoxR.setAttribute('d', ep > 0.01 ? inkPath(bx, { w: 4, seed: seed * 19 + 1, t, amp: 0.8, closed: true, smooth: false }) : '');
            let hd = ''; if (ep > 0.01) for (let i = 0; i < 14; i++) { const y = ey + 12 + i * (eh * 0.62 / 14); hd += MOON.line([[ex + 14, y], [ex + ew - 14, y + 2]], seed * 19 + 10 + i, t, 1.6, 0.6) + ' '; }
            eHatch.setAttribute('d', hd);
            eG.style.visibility = ep > 0.01 ? 'visible' : 'hidden';
            const k = Math.max(0.01, ep), mx = ex + ew / 2, gy2 = ey + eh - 18;
            if (eObj) {
              const kind = E.kind;
              if (kind === 'orb') eObj.update(t, { x: mx, y: ey + eh / 2, r: eh * 0.4 * k });
              else if (kind === 'manbat') eObj.update(t, { x: mx, y: gy2 + 10, s: eh / 330 * k, face: 1, flap: Math.sin(t * Math.PI * 2 * 0.5) * 0.6 });
              else if (kind === 'temple') eObj.update(t, { x: mx, y: gy2, s: eh / 460 * k });
              else eObj.update(t, { x: mx, y: gy2, s: eh / 300 * k, face: 1, graze: true, walk: kind === 'beaver' });
            }
            if (lensG) {
              const r = eh * 0.38 * k;
              lensF.setAttribute('d', inkLoop(inkEllipsePts(mx, ey + eh / 2, r, r, seed * 23, 18), { seed: seed * 23, t, amp: 1 }));
              lensR.setAttribute('d', inkCircle(mx, ey + eh / 2, r, seed * 23 + 1, t, { w: 6 }) + ' ' + inkCircle(mx, ey + eh / 2, r * 0.82, seed * 23 + 2, t, { w: 2.5 }) + ' ' +
                MOON.line([[mx - r * 0.5, ey + eh / 2 - r * 0.35], [mx - r * 0.2, ey + eh / 2 - r * 0.6]], seed * 23 + 3, t, 4));
            }
          }
          marks.forEach((o, i) => {
            if (!o.w) o.w = tlen(o.tx, (o.m.size || 64) * o.m.text.length * 0.6);
            const mx = px + (o.m.x ?? 0.5) * pw, my = py + (o.m.y ?? 0.7) * ph, sz = o.m.size || 64;
            o.bg.setAttribute('d', `M${mx - o.w / 2 - 24} ${my - sz * 0.95}h${o.w + 48}v${sz * 1.3}h${-o.w - 48}Z`);
            const a = MOON.at(cues, o.m.at, 1 + i), q = clamp01((lt - a) / 0.5), rx = o.w / 2 + 36, ry = sz * 0.72, cy = my - sz * 0.32;
            const pts = []; const n = Math.max(2, Math.round(30 * q)); for (let k = 0; k <= n; k++) { const an = -2.2 + k / 30 * Math.PI * 2.15; pts.push([mx + Math.cos(an) * rx, cy + Math.sin(an) * ry]); }
            o.ring.setAttribute('d', q > 0 ? MOON.line(pts, seed * 43 + i, t, 7, 1.5) : '');
          });
          // ring / strike marks
          if (P.ring) {
            const a = MOON.at(cues, P.ring.at, 1), q = clamp01((lt - a) / 0.55), [cx, cy, rx, ry] = target(P.ring.target);
            ringE.setAttribute('fill', C[P.ring.color] || INK.red);
            const pts = []; const n = Math.max(2, Math.round(30 * q)); for (let i = 0; i <= n; i++) { const an = -2.2 + i / 30 * Math.PI * 2.15; pts.push([cx + Math.cos(an) * rx, cy + Math.sin(an) * ry]); }
            ringE.setAttribute('d', q > 0 ? MOON.line(pts, seed * 29, t, 7, 1.5) : '');
          }
          if (P.strike) {
            const a = MOON.at(cues, P.strike.at, 1), q = clamp01((lt - a) / 0.4), [cx, cy, rx] = target(P.strike.target);
            strikeE.setAttribute('d', q > 0 ? MOON.line([[cx - rx + 10, cy + 6], [lerp(cx - rx + 10, cx + rx - 10, q), cy - 4]], seed * 31, t, 9) : '');
          }
          stamps.forEach((o, i) => {
            const a = MOON.at(cues, o.s.at, 1.2), p = clamp01((lt - a) / 0.22), hit = punch(lt, a + 0.22, 0.5);
            o.g.style.visibility = lt >= a ? 'visible' : 'hidden';
            if (lt < a) return;
            const sx = px + (o.s.x ?? 0.5) * pw, sy = py + (o.s.y ?? 0.6) * ph + oy, sc = lerp(1.7, 1, p) * (1 + 0.06 * hit);
            o.g.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(${o.s.rot ?? -8}) scale(${sc.toFixed(3)})`);
            o.tx.setAttribute('x', 0); o.tx.setAttribute('y', o.size * 0.36);
            const bw = o.w / 2 + 40, bh = o.size * 0.62;
            o.box.setAttribute('d', inkPath([[-bw, -bh], [bw, -bh], [bw, bh], [-bw, bh]], { w: 9, seed: seed * 37 + i, t, closed: true, smooth: false, amp: 1.5 }));
          });
          cast.forEach(c => c.update(lt, t, cues, W, H));
        },
      };
    },
  };
})();
