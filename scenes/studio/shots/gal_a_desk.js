// gal_a_desk: Galileo's study / workshop (02-galileo-teleskop). "set": false: a plastered room (GAL.room) with a window,
// a heavy table whose front runs to the frame bottom (GAL.table, foreground), and the cast behind it. Modes:
//   "debts"  — candle, an open ledger, a brass compass (pergel) and a stack of gold coins; on `dowry` two little dowry
//              chests pop onto the ledger with red minus marks; on `coins.vanish` the coins fly off one by one.
//   "letter" — the window opens on a summer roofline; a sealed letter flies in to the table on `letter.at` and unfolds on
//              `letter.open` with a little spyglass sketch on it.
//   "grind"  — a lens-grinding wheel turns on the table (faster from `wheel.fast`), glass dust flies; on `idea.at` a
//              thought cloud with a two-lens ray diagram draws itself over the head.
//   "power"  — a long spyglass on the table and a big round inset (a far campanile) that zooms in steps: steps:
//              [{text: "3x", at, zoom: 1, color}] with a red badge for the current step.
//   "drawer" — a writing cabinet: on `drawer.at` the held drawing goes into a drawer that slides shut and gathers dust;
//              a night window shows the Moon from `moon_window.at`.
// P: {mode, galileo: GAL.person (sits behind the table by default), cast: [GAL.person], kasif: GAL.person,
//     window: true, dowry: cue, coins: {n: 6, vanish: cue}, letter: {at, open}, idea: {at}, wheel: {fast},
//     steps: [...], drawer: {at}, moon_window: {at}, labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_a_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 81, mode = P.mode || 'debts';
      const TY = 0.84 * H, TOP = TY - 40;
      const root = el(svg, 'g');
      const room = G.room(el(root, 'g'), sd + 1);
      const decF = inkEl(root, INK.paperLight), decL = inkEl(root, INK.inkSoft), books = inkEl(root, mix(INK.red, INK.stain, 0.4));
      const winG = el(root, 'g');
      const winMoon = (mode === 'drawer') ? G.moon(winG, sd + 2) : null;
      const winStars = (mode === 'drawer') ? G.stars(winG, sd + 3, 10) : null;
      const back = el(root, 'g');
      const cab = mode === 'drawer' ? { f: inkEl(back, mix(INK.stain, INK.ink, 0.35)), d: inkEl(back, mix(INK.stain, INK.ink, 0.2)), l: inkEl(back), k: inkEl(back, INK.gold), dust: inkEl(back, INK.inkSoft) } : null;
      const castG = el(root, 'g');
      const gm = P.galileo ? Object.assign({ who: 'galileo', age: 'young', x: 0.42, y: 0.86, scale: 0.66, pose: 'idle', face: 'right' }, P.galileo) : null;
      const gal = gm ? G.person(castG, gm, sd + 4) : null;
      const cast = (P.cast || []).map((m, i) => G.person(castG, Object.assign({ y: 0.86 }, m), sd + 10 + i * 7));
      const table = mode === 'drawer' ? null : G.table(el(root, 'g'), sd + 5);
      const fgPre = null; void fgPre;
      const fg = el(root, 'g');
      const A = (fill, extra) => inkEl(fg, fill, extra);
      const candle = A(INK.paperLight), flame = A(INK.gold), ledger = A(INK.paperLight), ledgerL = A(INK.ink), num = A(INK.inkSoft), minus = A(INK.red);
      const pergel = A(INK.gold), chest = A(mix(INK.stain, INK.ink, 0.3)), chestB = A(INK.gold), coins = A(INK.gold), coinsL = A(INK.ink);
      const letterF = A(INK.paperLight), letterL = A(INK.ink), seal = A(INK.red), sketch = A(INK.inkSoft);
      const wheelF = A(mix(INK.paperDark, INK.inkSoft, 0.3)), wheelL = A(INK.ink), dust = A(INK.gold), glassF = A(mix(INK.blue, INK.paperLight, 0.5));
      const cloudF = A(INK.paperLight), cloudL = A(INK.ink), rays = A(INK.gold);
      const tubeF = A(mix(INK.red, INK.ink, 0.45)), tubeB = A(INK.gold), tubeL = A(INK.ink);
      const insetSky = A(mix(INK.paperLight, INK.blue, 0.15)), insetG = el(fg, 'g'), insetRing = A(INK.gold), insetL = A(INK.ink);
      const tower = mode === 'power' ? G.campanile(insetG, sd + 6) : null;
      let clip = null;
      if (mode === 'power') { const id = 'galdesk' + seed + '_' + mode; const cp = el(defs || svg, 'clipPath', { id }); clip = el(cp, 'circle', { cx: 0, cy: 0, r: 1 }); insetG.setAttribute('clip-path', `url(#${id})`); }
      const kasG = el(root, 'g');
      const kas = P.kasif ? G.person(kasG, Object.assign({ who: 'kasif' }, P.kasif), sd + 30) : null;
      const stepLabs = (P.steps || []).map((s, i) => G.label(fg, { text: s.text, x: 0.6, y: 0.2, at: s.at, size: 120, font: 'serif', box: s.color === 'red', color: 'ink' }, W, H, sd + 40 + i));
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 50 + i));
      const q = rng(inkHash(sd, 3)), DUST = Array.from({ length: 18 }, () => [q(), q(), q()]);
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const night = mode === 'drawer';
          const wr = room.update(t, W, H, { gy: 0.8 * H, kind: mode === 'drawer' ? 'wood' : 'plaster',
            window: (P.window || mode === 'drawer' || mode === 'letter') ? { x: 0.72, y: 0.12, w: 0.17, h: 0.44, night, view: night ? null : 'roofs' } : false,
            shelves: mode === 'drawer' ? [] : [{ x: 0.04, y: 0.26, w: 0.22 }, { x: 0.04, y: 0.44, w: 0.22 }] });
          // wall decor: a pinned star chart and a row of books on the shelves (fills the upper wall)
          if (mode !== 'drawer') {
            const cx0 = 0.38 * W, cy0 = 0.1 * H, cw = 0.2 * W, ch = 0.3 * H, sw = Math.sin(t * 0.7) * 0.6;
            const chart = [[cx0, cy0], [cx0 + cw, cy0 + 6], [cx0 + cw - 4, cy0 + ch], [cx0 + 4, cy0 + ch - 4]];
            let d = G.ring(chart, sd + 300, t, 4, 0.5) + ' ' + inkCircle(cx0 + cw / 2, cy0 + ch / 2, ch * 0.36, sd + 301, t, { w: 3 }) + ' ' + inkCircle(cx0 + cw / 2, cy0 + ch / 2, ch * 0.2, sd + 302, t, { w: 2.4 });
            for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + sw * 0.01; d += ' ' + G.line([[cx0 + cw / 2, cy0 + ch / 2], [cx0 + cw / 2 + Math.cos(a) * ch * 0.4, cy0 + ch / 2 + Math.sin(a) * ch * 0.4]], sd + 303 + i, t, 1.8); }
            decL.setAttribute('d', d); decF.setAttribute('d', inkLoop(chart, { seed: sd + 312, t, amp: 0.5, smooth: false }));
            let bk = '';
            for (const sy of [0.26, 0.44]) for (let i = 0; i < 9; i++) { const x = 0.05 * W + i * 44, h = 70 + (i * 37 % 30); bk += inkLoop([[x, sy * H], [x + 34, sy * H], [x + 34, sy * H - h], [x, sy * H - h]], { seed: sd + 320 + i + sy * 100, t, amp: 0.4, smooth: false }) + ' '; }
            books.setAttribute('d', bk);
          }
          if (winMoon && wr.win) {
            const [x0, y0, ww, wh] = wr.win, ma = G.atOr(cues, (P.moon_window || {}).at, 0), mk = spring(lt, ma, 0.9);
            winStars.update(t, x0 + 10, y0 + 40, x0 + ww - 10, y0 + wh - 20, 1);
            winMoon.update(t, { x: x0 + ww * 0.5, y: y0 + wh * 0.42, r: ww * 0.3 * Math.max(0.01, lt < ma ? 0 : mk), term: 0.1, rough: 1, halo: false });
          }
          if (gal) gal.update(lt, t, cues, W, H);
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (table) table.update(t, { x0: 0.08 * W, x1: (P.kasif ? 0.7 : 0.94) * W, y: TY, depth: 80, H });
          const clr = (...e) => e.forEach(x => x.setAttribute('d', ''));
          clr(candle, flame, ledger, ledgerL, num, minus, pergel, chest, chestB, coins, coinsL, letterF, letterL, seal, sketch, wheelF, wheelL, dust, glassF, cloudF, cloudL, rays, tubeF, tubeB, tubeL, insetSky, insetRing, insetL);
          // candle on every table
          if (table) {
            const cx = 0.16 * W, fk = Math.sin(t * 9) * 0.12 + Math.sin(t * 14) * 0.08;
            candle.setAttribute('d', inkLoop([[cx - 18, TOP - 140], [cx + 18, TOP - 140], [cx + 18, TOP], [cx - 18, TOP]], { seed: sd + 60, t, amp: 0.4, smooth: false }));
            flame.setAttribute('d', inkLoop([[cx, TOP - 140 - 70 * (1 + fk)], [cx + 16, TOP - 164], [cx, TOP - 144], [cx - 16, TOP - 164]], { seed: sd + 61, t, amp: 0.8 }));
          }
          if (mode === 'debts') {
            // ledger
            const lx = 0.56 * W, ly = TOP - 6, lw = 300, lh = 70;
            const pg = [[lx - lw, ly - lh], [lx, ly - lh + 8], [lx + lw, ly - lh], [lx + lw + 20, ly + 6], [lx, ly + 14], [lx - lw - 20, ly + 6]];
            ledger.setAttribute('d', inkLoop(pg, { seed: sd + 70, t, amp: 0.4, smooth: false }));
            let ll = G.ring(pg, sd + 71, t, 4, 0.4) + ' ' + G.line([[lx, ly - lh + 8], [lx, ly + 14]], sd + 72, t, 3), nm = '';
            for (let k = 0; k < 4; k++) { const y = ly - lh + 22 + k * 14; nm += G.line([[lx - lw + 30, y], [lx - 40, y + 2]], sd + 73 + k, t, 2) + ' ' + G.line([[lx + 40, y + 2], [lx + lw - 30, y]], sd + 80 + k, t, 2) + ' '; }
            ledgerL.setAttribute('d', ll); num.setAttribute('d', nm);
            const da = G.atOr(cues, P.dowry, null);
            if (da != null && lt >= da) {
              let ch = '', cb = '', mi = '';
              [-1, 1].forEach((k, i) => {
                const s = spring(lt, da + i * 0.25, 0.7), x = lx + k * 150, y = ly - lh - 10, w = 90 * s, h = 64 * s;
                const b = [[x - w, y], [x + w, y], [x + w, y - h], [x - w, y - h]], lid = [[x - w, y - h], [x + w, y - h], [x + w * 0.8, y - h * 1.5], [x - w * 0.8, y - h * 1.5]];
                ch += inkLoop(b, { seed: sd + 90 + i, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(lid, { seed: sd + 92 + i, t, amp: 0.4, smooth: false }) + ' ';
                cb += inkLoop([[x - 8, y - h * 1.1], [x + 8, y - h * 1.1], [x + 8, y - h * 0.6], [x - 8, y - h * 0.6]], { seed: sd + 94 + i, t, amp: 0.3, smooth: false }) + ' ';
                mi += G.line([[x + w + 30, y - h * 1.6], [x + w + 80, y - h * 1.6]], sd + 96 + i, t, 9 * s) + ' ';
              });
              chest.setAttribute('d', ch); chestB.setAttribute('d', cb); minus.setAttribute('d', mi);
            }
            // compass (pergel)
            const px = 0.3 * W, py = TOP - 10, sa = G.atOr(cues, (P.galileo && (P.galileo.seq || [])[0] || {}).at, null), lift = sa != null && lt >= sa ? spring(lt, sa, 0.6) * 0 : 0;
            pergel.setAttribute('d', G.line([[px, py - 150 - lift], [px - 60, py]], sd + 100, t, 9) + ' ' + G.line([[px, py - 150 - lift], [px + 60, py]], sd + 101, t, 9) + ' ' + inkDot(px, py - 154 - lift, 14, 14, sd + 102, t));
            // coins stack: fly off one by one on vanish
            const C = P.coins || { n: 6 }, va = G.atOr(cues, C.vanish, null);
            let cf = '', cl = '';
            for (let i = 0; i < (C.n || 6); i++) {
              const ga = va == null ? null : va + i * 0.22, k = ga == null ? 0 : clamp01((lt - ga) / 0.6);
              if (k >= 1) continue;
              const x = 0.84 * W + (i % 2) * 6 + k * (80 + i * 30), y = TOP - 4 - i * 16 - k * k * 300, rx = 46 * (1 - k * 0.6);
              const e = inkEllipsePts(x, y, rx, rx * 0.32, sd + 110 + i, 12);
              cf += inkLoop(e, { seed: sd + 110 + i, t, amp: 0.3 }) + ' '; cl += G.ring(e, sd + 130 + i, t, 3, 0.3) + ' ';
            }
            coins.setAttribute('d', cf); coinsL.setAttribute('d', cl);
          }
          if (mode === 'letter') {
            const L = P.letter || {}, la = G.atOr(cues, L.at, 0.3), oa = G.atOr(cues, L.open, la + 1.5), k = progIO(lt, la, 1.4);
            const held = gm && gm.then === 'hold' && gm.at && G.atOr(cues, gm.at, 1e9) <= lt;
            if (lt >= la && !held) {
              const x = lerp(0.78 * W, 0.6 * W, k), y = lerp(0.3 * H, TOP - 20, k) - Math.sin(k * Math.PI) * 120, rot = (1 - k) * 380;
              const ok = clamp01((lt - oa) / 0.5), w = lerp(90, 200, ok), h = lerp(60, 130, ok);
              const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), R = (u, v) => [x + u * c - v * s, y + u * s + v * c];
              const p = [R(-w, -h), R(w, -h), R(w, h), R(-w, h)];
              letterF.setAttribute('d', inkLoop(p, { seed: sd + 140, t, amp: 0.4, smooth: false }));
              letterL.setAttribute('d', G.ring(p, sd + 141, t, 4, 0.4) + (ok < 0.5 ? ' ' + G.line([R(-w, -h), R(0, 0), R(w, -h)], sd + 142, t, 3) : ''));
              if (ok < 0.5) seal.setAttribute('d', inkDot(...R(0, 4), 18, 18, sd + 143, t));
              else {   // a spyglass sketch drawing itself
                const dk = clamp01((lt - oa - 0.3) / 0.8), a0 = R(-w * 0.7, h * 0.3), a1 = R(lerp(-w * 0.7, w * 0.7, dk), lerp(h * 0.3, -h * 0.5, dk));
                sketch.setAttribute('d', G.line([a0, a1], sd + 144, t, 9) + ' ' + G.line([R(-w * 0.2, -h * 0.05), R(-w * 0.4, h * 0.8)], sd + 145, t, 3) + ' ' + G.line([R(-w * 0.2, -h * 0.05), R(0.05 * w, h * 0.8)], sd + 146, t, 3));
              }
            }
          }
          if (mode === 'grind') {
            const fa = G.atOr(cues, (P.wheel || {}).fast, null), speed = fa != null && lt >= fa ? 2.6 : 1;
            const wx = 0.62 * W, wy = TOP - 120, wrr = 120, ang = lt * speed * 2.2;
            wheelF.setAttribute('d', inkLoop(inkEllipsePts(wx, wy, wrr, wrr * 0.96, sd + 150, 18), { seed: sd + 150, t, amp: 0.4 }));
            let wl = G.ring(inkEllipsePts(wx, wy, wrr, wrr * 0.96, sd + 150, 18), sd + 151, t, 6, 0.4) + ' ' + inkCircle(wx, wy, 22, sd + 152, t, { w: 5 });
            for (let i = 0; i < 6; i++) { const a = ang + i * Math.PI / 3; wl += ' ' + G.line([[wx + Math.cos(a) * 24, wy + Math.sin(a) * 24], [wx + Math.cos(a) * (wrr - 10), wy + Math.sin(a) * (wrr - 10)]], sd + 153 + i, t, 4); }
            wl += ' ' + G.line([[wx - 90, TOP], [wx - 40, wy + 60]], sd + 160, t, 10) + ' ' + G.line([[wx + 90, TOP], [wx + 40, wy + 60]], sd + 161, t, 10);
            wheelL.setAttribute('d', wl);
            // the lens pressed on the wheel's rim + glass dust
            const gx = wx - wrr * 0.7, gy2 = wy - wrr * 0.7;
            glassF.setAttribute('d', inkLoop(inkEllipsePts(gx, gy2, 34, 14, sd + 162, 10, -0.7), { seed: sd + 162, t, amp: 0.3 }));
            let ds = '';
            DUST.forEach((d, i) => { const ph = (lt * speed * 1.4 + d[0]) % 1, x = gx - 10 - ph * (120 + d[1] * 160), y = gy2 - 10 - ph * (40 + d[2] * 140) + ph * ph * 180; ds += inkDot(x, y, 4 * (1 - ph) + 1.5, 4 * (1 - ph) + 1.5, sd + 170 + i, t) + ' '; });
            dust.setAttribute('d', ds);
            const ia = G.atOr(cues, (P.idea || {}).at, null);
            if (ia != null && lt >= ia) {
              const k = spring(lt, ia, 0.8), cx = 0.36 * W, cy = 0.33 * H, rw = 260 * k, rh = 120 * k;
              const cl = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, bump = i % 2 ? 1.08 : 0.94; cl.push([cx + Math.cos(a) * rw * bump, cy + Math.sin(a) * rh * bump]); }
              cloudF.setAttribute('d', inkLoop(cl, { seed: sd + 180, t, amp: 0.8 }));
              let cd = G.ring(cl, sd + 181, t, 4, 0.8) + ' ' + inkCircle(cx + 160 * k, cy + 150 * k, 18 * k, sd + 182, t, { w: 3 }) + ' ' + inkCircle(cx + 200 * k, cy + 200 * k, 11 * k, sd + 183, t, { w: 3 });
              // two lenses + converging rays drawing in
              const dk = clamp01((lt - ia - 0.3) / 1.0);
              [-110, 80].forEach((dx, i) => { cd += ' ' + G.ring(inkEllipsePts(cx + dx * k, cy, 14 * k, 60 * k, sd + 184 + i, 12), sd + 186 + i, t, 3.5, 0.3); });
              let ry = '';
              for (const v of [-40, 0, 40]) ry += G.line([[cx - 220 * k, cy + v * k], [cx + lerp(-220, 200, dk) * k, cy + v * k * (1 - dk * 0.7)]], sd + 190 + v, t, 3) + ' ';
              cloudL.setAttribute('d', cd); rays.setAttribute('d', ry);
            }
          }
          if (mode === 'power') {
            // long spyglass on the table
            const tx = 0.38 * W, ty = TOP - 34, len = 700;
            const p = [[tx - len / 2, ty - 22], [tx + len / 2, ty - 34], [tx + len / 2, ty + 34], [tx - len / 2, ty + 22]];
            tubeF.setAttribute('d', inkLoop(p, { seed: sd + 200, t, amp: 0.4, smooth: false }));
            let tb = ''; for (const u of [-0.3, 0, 0.3]) tb += inkLoop([[tx + u * len, ty - 32], [tx + u * len + 16, ty - 32], [tx + u * len + 16, ty + 32], [tx + u * len, ty + 32]], { seed: sd + 201 + u * 10, t, amp: 0.3, smooth: false }) + ' ';
            tubeB.setAttribute('d', tb);
            tubeL.setAttribute('d', G.ring(p, sd + 205, t, 4.5, 0.4) + ' ' + G.line([[tx + len / 2 + 10, ty - 30], [0.66 * W, 0.42 * H]], sd + 206, t, 2.4) + ' ' + G.line([[tx + len / 2 + 10, ty + 30], [0.66 * W, 0.62 * H]], sd + 207, t, 2.4));
            // round inset: a far campanile, zooming by steps
            const ix = 0.79 * W, iy = 0.4 * H, ir = 0.27 * H, steps = P.steps || [];
            let z = 1, si = -1; steps.forEach((s, i) => { const a = G.atOr(cues, s.at, 0); if (lt >= a) { si = i; } });
            if (si >= 0) { const a = G.atOr(cues, steps[si].at, 0), prev = si > 0 ? (steps[si - 1].zoom ?? 1) : (steps[si].zoom ?? 1); z = lerp(prev, steps[si].zoom ?? 1, progIO(lt, a, 0.9)); }
            clip.setAttribute('cx', G.f1(ix)); clip.setAttribute('cy', G.f1(iy)); clip.setAttribute('r', G.f1(ir));
            insetSky.setAttribute('d', inkLoop(inkEllipsePts(ix, iy, ir, ir, sd + 210, 20), { seed: sd + 210, t, amp: 0.4 }));
            const gy3 = iy + ir * 0.2 * z + ir * 0.5;
            tower.update(t, { x: ix, gy: gy3, h: 150 * z * 1.4, w: 26 * z * 1.4 });
            insetRing.setAttribute('d', inkLoop(inkEllipsePts(ix, iy, ir + 24, ir + 24, sd + 211, 22), { seed: sd + 211, t, amp: 0.4 }) + ' ' + inkLoop(inkEllipsePts(ix, iy, ir, ir, sd + 212, 22).reverse(), { seed: sd + 212, t, amp: 0.4 }));
            insetRing.setAttribute('fill-rule', 'evenodd');
            insetL.setAttribute('d', G.ring(inkEllipsePts(ix, iy, ir + 24, ir + 24, sd + 213, 22), sd + 214, t, 5, 0.4) + ' ' + G.line([[ix - ir, gy3], [ix + ir, gy3]], sd + 215, t, 3));
            stepLabs.forEach((l, i) => { if (i === si) l.update(lt, t, cues); else l.update(-1, t, cues); });
          }
          if (cab) {
            // writing cabinet with drawers; the drawing goes in and the drawer shuts
            const x0 = 0.12 * W, x1 = 0.34 * W, y0 = 0.42 * H, y1 = 0.8 * H, da = G.atOr(cues, (P.drawer || {}).at, 0.5);
            const op = 1 - progIO(lt, da + 0.4, 0.8), body = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
            cab.f.setAttribute('d', inkLoop(body, { seed: sd + 220, t, amp: 0.4, smooth: false }));
            const dy = y0 + 60, dw = 90 * op, dr = [[x0 + 20 + dw, dy], [x1 - 20 + dw, dy], [x1 - 20 + dw, dy + 90], [x0 + 20 + dw, dy + 90]];
            cab.d.setAttribute('d', inkLoop(dr, { seed: sd + 221, t, amp: 0.4, smooth: false }) + ' ' + inkLoop([[x0 + 20, dy + 120], [x1 - 20, dy + 120], [x1 - 20, dy + 210], [x0 + 20, dy + 210]], { seed: sd + 222, t, amp: 0.4, smooth: false }));
            let cl = G.ring(body, sd + 223, t, 5, 0.4) + ' ' + G.ring(dr, sd + 224, t, 4, 0.4) + ' ' + G.line([[x0 - 20, y0], [x1 + 20, y0]], sd + 225, t, 10);
            // the sheet sliding in
            const sk = progIO(lt, da, 0.6);
            if (sk < 1 && lt >= da - 0.01) { const sx = lerp(x1 + 160, (x0 + x1) / 2 + dw, sk), sy = lerp(dy - 120, dy + 20, sk); cl += ' ' + G.ring([[sx - 70, sy - 40], [sx + 70, sy - 44], [sx + 72, sy + 40], [sx - 68, sy + 42]], sd + 226, t, 3.5, 0.4); }
            cab.l.setAttribute('d', cl);
            cab.k.setAttribute('d', inkDot((x0 + x1) / 2 + dw, dy + 45, 10, 10, sd + 227, t) + ' ' + inkDot((x0 + x1) / 2, dy + 165, 10, 10, sd + 228, t));
            let du = '';
            if (op < 0.05) { const dk = clamp01((lt - da - 1.2) / 1.5); for (let i = 0; i < 10; i++) du += G.line([[x0 + 30 + i * 36, y0 - 10 - dk * 30 - (i % 3) * 14], [x0 + 30 + i * 36, y0 - 4 - (i % 3) * 14]], sd + 230 + i, t, 2) + ' '; }
            cab.dust.setAttribute('d', du);
            // floor strip in front (foreground)
          }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
