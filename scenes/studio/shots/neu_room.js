// neu_room: full-frame "rooms" for a science story (Stickstory neutrino video, 2026-10-27; parametric). Each mode fills
// the frame with one big object in a place, so the story never sits as a small diagram on empty paper. Modes:
//   tablet:    a tall stone tablet on a plinth in a hall, a rule engraved on it; on `crack` a crack runs down through it
//              and chips fall
//   board:     a big chalkboard in a wooden frame; chalk words write themselves (P.lines), optional chalk sketch
//              ("flood": a small detector box with a few arrows, then on `flood` a mushroom cloud sketch whose many arrows
//              pour through the box and make it flash); period people can stand in front (P.figures)
//   portraits: two oval portraits on the wall (bust of a bare-headed figure in each), name plaques via labels; red
//              "RIGHT" stamps slam on at their cues (P.stamps)
//   medals:    two big gold medals on ribbons swing in, a profile in relief and the year in the middle of each
//   cosmos:    spiral galaxies turn in a starry sky; one big glowing neutrino in front with a giant question mark
//   split:     a dilemma: a detector tank (left) under a red magnifier and the Sun (right), each with a question mark;
//              a wall calendar between them flips through the years (P.years)
// SHOTS.neu_room P: {mode, lines: [{text, x, y, size, at, color}] (board / tablet), crack: {at}, sketch: "flood",
//   flood: {at}, frames: [{x, y, figure: K}] (portraits), stamps: [{text, x, y, at}], medals: [{x, year, at}],
//   years: [1968, 1994], labels, figures, kasif}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif', SLAB = "'Zilla Slab', Georgia, serif";
  let clipN = 0;
  SH.neu_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const N = window.NEU, TD = window.TD, f1 = N.f1, atOr = N.atOr, sd = seed * 1000 + 1201;
      const mode = P.mode || 'board';
      const root = el(svg, 'g');
      const back = N.mkPen(root);
      const sunD = mode === 'split' ? TD.sun(el(root, 'g'), sd + 2) : null;
      // portraits: clipped busts
      let busts = [];
      if (mode === 'portraits') {
        const id = 'neuclip' + (sd % 100000) + '_' + (clipN++);
        const cp = el(defs || root, 'clipPath', { id });
        (P.frames || []).forEach(F => el(cp, 'ellipse', { cx: F.x * W, cy: (F.y ?? 0.44) * H, rx: 220, ry: 280 }));
        const cg = el(root, 'g', { 'clip-path': `url(#${id})` });
        const bg = N.mkPen(cg);
        busts = (P.frames || []).map((F, i) => TD.figure(el(cg, 'g'), Object.assign({ x: F.x, y: 1.0, scale: 1.45, pose: 'idle', face: i ? 'left' : 'right' }, F.figure || {}, { hat: false }), sd + 40 + i * 9));
        busts.bg = bg;
      }
      const mid = N.mkPen(root);
      const texts = (P.lines || []).map(L => {
        const board = mode === 'board';
        const tEl = el(root, 'text', { 'font-family': board ? INK_FONT : FR, 'font-weight': board ? 400 : 900, 'font-size': L.size || (board ? 120 : 104),
          'text-anchor': 'middle', fill: board ? (L.color === 'gold' ? INK.gold : INK.paperLight) : INK.ink });
        return { L, tEl, full: board ? String(L.text) : String(L.text).toLocaleUpperCase('en-US') };
      });
      const yearT = mode === 'split' || mode === 'medals' ? (mode === 'split' ? [el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.ink })]
        : (P.medals || []).map(() => el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 96, 'text-anchor': 'middle', fill: INK.ink }))) : [];
      const qT = mode === 'cosmos' || mode === 'split' ? [0, 1].map(() => el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 220, 'text-anchor': 'middle', fill: INK.red })) : [];
      const front = N.mkPen(root);
      const stampsT = (P.stamps || []).map(S => { const e = el(root, 'text', { 'font-family': SLAB, 'font-weight': 700, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red }); e.textContent = String(S.text).toLocaleUpperCase('en-US'); return e; });
      const stampPen = N.mkPen(root);
      const com = N.common(root, P, W, H, sd);
      const R0 = rng(sd + 5), stars = Array.from({ length: 70 }, () => [R0(), R0(), R0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          [back, mid, front, stampPen].forEach(p => p.begin());
          if (busts.bg) busts.bg.begin();
          texts.forEach(({ tEl }) => { tEl.textContent = ''; });
          if (mode === 'tablet') {
            const cx = W / 2, x0 = W * 0.3, x1 = W * 0.7, y0 = H * 0.1, y1 = H * 0.8;
            const top = []; for (let j = 0; j <= 16; j++) { const a = Math.PI + j / 16 * Math.PI; top.push([cx + Math.cos(a) * (x1 - x0) / 2, y0 + 110 + Math.sin(a) * 110]); }
            const slab = top.concat([[x1, y1], [x0, y1]]);
            N.shape(back, slab.map(([x, y]) => [x + 18, y + 18]), INK.inkSoft, sd + 1, t, { w: 0, op: 0.35, smooth: false });
            N.shape(back, slab, INK.paperDark, sd + 2, t, { w: 8, smooth: false });
            const inner = slab.map(([x, y]) => [cx + (x - cx) * 0.9, y0 + 40 + (y - y0) * 0.92]);
            back.fill(inkPath(inner, { w: 3.5, seed: sd + 4, t, closed: true, smooth: false }), INK.inkSoft);
            N.shape(back, N.rect(W * 0.25, y1, W * 0.75, y1 + 60), INK.paperDark, sd + 6, t, { w: 7 });
            N.line(back, [[-20, y1 + 60], [W + 20, y1 + 62]], sd + 8, t, 6);
            const ca = P.crack ? atOr(cues, P.crack.at, null) : null, cp = ca != null && lt >= ca ? prog(lt, ca, 0.7) : 0;
            if (cp > 0) {
              const zz = [[cx + 40, y0], [cx - 10, y0 + 120], [cx + 50, y0 + 230], [cx - 40, y0 + 360], [cx + 30, y0 + 480], [cx - 30, y1]];
              const n = Math.max(2, Math.ceil(cp * zz.length));
              N.line(front, zz.slice(0, n), sd + 10, t, 10, INK.ink, { taper: 0.1 });
              N.line(front, zz.slice(0, n).map(([x, y]) => [x + 7, y + 3]), sd + 11, t, 3, INK.paperLight);
              for (let k = 0; k < 5; k++) {
                const a = ca + 0.2 + k * 0.15, u = clamp01((lt - a) / 1.1);
                if (u > 0) { const p = zz[1 + (k % 4)], fx = p[0] + (k % 2 ? 40 : -40) * u, fy = p[1] + 400 * u * u; N.shape(front, [[fx - 14, fy - 10], [fx + 12, fy - 12], [fx + 6, fy + 12]], INK.paperDark, sd + 20 + k, t, { w: 3 }); }
              }
            }
          } else if (mode === 'board') {
            const x0 = W * 0.06, x1 = W * 0.94, y0 = H * 0.21, y1 = H * 0.8;
            N.shape(back, N.rect(x0 - 30, y0 - 30, x1 + 30, y1 + 30), INK.paperDark, sd + 1, t, { w: 7 });
            N.shape(back, N.rect(x0, y0, x1, y1), INK.ink, sd + 2, t, { w: 5, op: 0.9 });
            for (let k = 0; k < 5; k++) N.line(back, [[x0 + 60 + k * 300, y0 + 40 + (k % 3) * 120], [x0 + 200 + k * 300, y0 + 60 + (k % 3) * 120]], sd + 4 + k, t, 10, INK.paperLight, { op: 0.08 });
            N.shape(back, N.rect(x0 - 10, y1 + 30, x1 + 10, y1 + 54), INK.paperDark, sd + 12, t, { w: 5 });
            for (let k = 0; k < 3; k++) back.fill(inkLoop(N.rect(x0 + 300 + k * 90, y1 + 14, x0 + 360 + k * 90, y1 + 30), { seed: sd + 14 + k, t }), INK.paperLight);
            if (P.sketch === 'flood') {
              const C = INK.paperLight, bx = W * 0.72, by = H * 0.44, fa = atOr(cues, P.flood && P.flood.at, dur * 0.6), on = lt >= fa;
              N.line(mid, [[bx - 110, by - 80], [bx + 110, by - 80], [bx + 110, by + 80], [bx - 110, by + 80], [bx - 110, by - 80]], sd + 20, t, 6, C);
              const n = on ? 14 : 3;
              for (let k = 0; k < n; k++) {
                const ph = (t * 0.5 + k / n) % 1, y = by - 70 + (k * 37 % 140), xa = on ? lerp(W * 0.3, W * 0.88, ph) : lerp(W * 0.48, W * 0.88, ph);
                N.line(mid, [[xa - 60, y], [xa, y]], sd + 30 + k, t, 5, C);
                N.line(mid, [[xa - 16, y - 12], [xa, y], [xa - 16, y + 12]], sd + 50 + k, t, 5, C);
              }
              if (on) {
                const mx = W * 0.22, my = H * 0.5, g = spring(lt, fa, 0.7);
                N.line(mid, [[mx - 30, my + 150], [mx - 24, my - 20 * g], [mx + 24, my - 20 * g], [mx + 30, my + 150]], sd + 70, t, 6, C);
                const cap = []; for (let j = 0; j <= 14; j++) { const a = j / 14 * Math.PI * 2; cap.push([mx + Math.cos(a) * 130 * g * (1 + 0.1 * Math.sin(j * 3)), my - 70 * g + Math.sin(a) * 70 * g]); }
                mid.fill(inkPath(cap, { w: 6, seed: sd + 72, t, closed: true, smooth: true }), C);
                N.line(mid, [[mx - 160, my + 150], [mx + 160, my + 150]], sd + 74, t, 6, C);
                if ((t * 1.3) % 1 < 0.35) N.flash(front, bx, by, 120, sd + 76 + Math.floor(t * 1.3), t, ((t * 1.3) % 1) / 0.35);
              }
            }
            texts.forEach(({ L, tEl, full }, i) => {
              const a = atOr(cues, L.at, 0.2 + i * 0.6), n = lt >= a ? Math.min(full.length, Math.floor((lt - a) * (L.cps || 14)) + 1) : 0;
              tEl.textContent = full.slice(0, n); tEl.setAttribute('x', f1((L.x ?? 0.5) * W)); tEl.setAttribute('y', f1((L.y ?? 0.3) * H));
            });
          } else if (mode === 'portraits') {
            (P.frames || []).forEach((F, i) => {
              const fx = F.x * W, fy = (F.y ?? 0.44) * H;
              busts.bg.fill(inkLoop(N.ell(fx, fy, 230, 290, 24), { seed: sd + 60 + i, t }), i ? INK.paperLight : INK.paper);
              busts.bg.fill(inkLoop(N.ell(fx, fy - 40, 150, 160, 18), { seed: sd + 64 + i, t }), INK.gold, 0.25);
            });
            busts.forEach(b => b.update(lt, t, cues, W, H));
            (P.frames || []).forEach((F, i) => {
              const fx = F.x * W, fy = (F.y ?? 0.44) * H;
              const outer = N.ell(fx, fy, 262, 322, 26), inner = N.ell(fx, fy, 222, 282, 26);
              front.fill(inkLoop(outer, { seed: sd + 70 + i, t }) + ' ' + inkLoop(inner.slice().reverse(), { seed: sd + 72 + i, t }), INK.gold, 0.85);
              front.fill(inkPath(outer, { w: 7, seed: sd + 74 + i, t, closed: true, smooth: true }), INK.ink);
              front.fill(inkPath(inner, { w: 5, seed: sd + 76 + i, t, closed: true, smooth: true }), INK.ink);
              N.shape(front, N.rect(fx - 150, fy + 330, fx + 150, fy + 400), INK.paperDark, sd + 78 + i, t, { w: 5 });
            });
          } else if (mode === 'medals') {
            (P.medals || []).forEach((M, i) => {
              const a = atOr(cues, M.at, 0.3 + i), p = lt >= a ? spring(lt, a, 0.8) : 0;
              if (p <= 0.01) { yearT[i].textContent = ''; return; }
              const cx = M.x * W, cy = H * 0.5 + (1 - p) * -500, R = 230, sw = Math.sin(t * 1.6 + i) * 4 * (Math.PI / 180), top = cy - R;
              const rib = [[cx - 140, top - 300], [cx - 60, top - 300], [cx, top + 20], [cx + 60, top - 300], [cx + 140, top - 300], [cx + 30, top + 40], [cx - 30, top + 40]];
              N.shape(back, [[cx - 150, -40], [cx - 40, -40], [cx + 10, top + 30], [cx - 50, top + 30]], INK.blue, sd + 100 + i * 9, t, { w: 5 });
              N.shape(back, [[cx + 150, -40], [cx + 40, -40], [cx - 10, top + 30], [cx + 50, top + 30]], INK.red, sd + 102 + i * 9, t, { w: 5 });
              void rib;
              const rot = ([x, y]) => [cx + (x - cx) * Math.cos(sw) - (y - cy) * Math.sin(sw), cy + (x - cx) * Math.sin(sw) + (y - cy) * Math.cos(sw)];
              N.shape(mid, N.ell(cx, cy, R, R, 28).map(rot), INK.gold, sd + 104 + i * 9, t, { w: 8, smooth: true });
              mid.fill(inkPath(N.ell(cx, cy, R - 30, R - 30, 26).map(rot), { w: 4, seed: sd + 106 + i * 9, t, closed: true, smooth: true }), INK.ink);
              const prof = [[-60, -150], [-20, -170], [20, -150], [30, -110], [50, -90], [30, -80], [36, -60], [20, -40], [10, -10], [-30, 0]].map(([x, y]) => rot([cx + x, cy + y]));
              N.line(mid, prof, sd + 108 + i * 9, t, 6, INK.inkSoft, { smooth: true });
              for (let k = 0; k < 4; k++) { const ph = (t * 0.7 + k * 0.25 + i * 0.1) % 1, a2 = k * 1.7 + i; front.fill(inkLoop([[0, -1], [0.25, 0], [0, 1], [-0.25, 0]].map(([x, y]) => [cx + Math.cos(a2) * (R + 30) + x * 30 * (1 - ph), cy + Math.sin(a2) * (R + 30) + y * 30 * (1 - ph)]), { seed: sd + 120 + k, t }), INK.gold); }
              yearT[i].textContent = String(M.year); yearT[i].setAttribute('x', f1(cx)); yearT[i].setAttribute('y', f1(cy + 110));
            });
          } else if (mode === 'cosmos') {
            stars.forEach(([u, v, k], i) => back.fill(inkDot(u * W, v * H * 0.9, 3 + k * 4, 3 + k * 4, sd + 200 + i, t), k > 0.7 ? INK.gold : INK.inkSoft));
            [[0.2, 0.32, 300, 1], [0.8, 0.3, 260, -1], [0.76, 0.72, 200, 1], [0.24, 0.72, 170, -1]].forEach(([gx, gy, R, dir], g) => {
              for (let arm = 0; arm < 2; arm++) {
                const pts = []; for (let j = 0; j <= 24; j++) { const u = j / 24, a = dir * (u * 4.2 + t * 0.15) + arm * Math.PI; pts.push([gx * W + Math.cos(a) * R * u, gy * H + Math.sin(a) * R * u * 0.55]); }
                N.line(mid, pts, sd + 300 + g * 4 + arm, t, 12 - arm * 3, INK.blue, { smooth: true, op: 0.75 });
                for (let j = 3; j < 24; j += 3) mid.fill(inkDot(pts[j][0], pts[j][1], 5, 5, sd + 600 + g * 40 + arm * 20 + j, t), INK.gold);
              }
              mid.fill(inkLoop(N.ell(gx * W, gy * H, R * 0.22, R * 0.14, 10), { seed: sd + 320 + g, t }), INK.gold);
            });
            const cx = W * 0.5, cy = H * 0.5;
            N.nu(front, cx, cy, 70, sd + 330, t, { tail: 0, glow: 0.7 + 0.3 * Math.sin(t * 3) });
            qT[0].textContent = '?'; qT[0].setAttribute('x', f1(cx + 170)); qT[0].setAttribute('y', f1(cy + 70 + Math.sin(t * 2) * 8));
          } else if (mode === 'split') {
            N.bench(back, W * 0.02, W * 0.42, H * 0.76, H * 1.0, sd + 400, t);
            const tx = W * 0.22, ty = H * 0.62;
            const tp = []; for (let j = 0; j <= 10; j++) { const a = -Math.PI / 2 + j / 10 * Math.PI; tp.push([tx + 160 + Math.cos(a) * 80, ty + Math.sin(a) * 80]); }
            for (let j = 0; j <= 10; j++) { const a = Math.PI / 2 + j / 10 * Math.PI; tp.push([tx - 160 + Math.cos(a) * 80, ty + Math.sin(a) * 80]); }
            N.shape(mid, tp, INK.blue, sd + 410, t, { w: 7, op: 0.5, smooth: true });
            if (sunD) sunD.update(t, W * 0.8, H * 0.42, 150);
            const ea = atOr(cues, P.left_at, 0.5), sa = atOr(cues, P.right_at, dur * 0.5);
            [[ea, tx, ty - 190], [sa, W * 0.8, H * 0.42 - 240]].forEach(([a, x, y], i) => {
              const s = lt >= a ? spring(lt, a, 0.5) : 0;
              qT[i].textContent = s > 0.01 ? '?' : ''; qT[i].setAttribute('x', f1(x)); qT[i].setAttribute('y', f1(y + 70));
              qT[i].setAttribute('font-size', f1(160 * Math.max(0.01, s)));
              if (i === 0 && s > 0.01) { front.fill(inkPath(N.ell(tx + 60, ty, 140 * s, 140 * s, 18), { w: 10, seed: sd + 420, t, closed: true, smooth: true }), INK.red); N.line(front, [[tx + 160, ty + 100], [tx + 260, ty + 200]], sd + 421, t, 16, INK.red); }
            });
            // wall calendar flipping through the years
            const Y = P.years || [1968, 1994], cx = W * 0.5, cy = H * 0.24, u = clamp01(lt / Math.max(1, dur - 0.5)), yr = Math.round(lerp(Y[0], Y[1], u * u));
            N.shape(back, N.rect(cx - 150, cy - 110, cx + 150, cy + 120), INK.paperLight, sd + 430, t, { w: 6 });
            N.shape(back, N.rect(cx - 150, cy - 110, cx + 150, cy - 60), INK.red, sd + 432, t, { w: 5, op: 0.85 });
            for (let k = 0; k < 2; k++) back.fill(inkDot(cx - 60 + k * 120, cy - 110, 10, 10, sd + 434 + k, t), INK.ink);
            const flip = (lt * 4) % 1;
            if (u < 0.98) N.shape(front, [[cx - 150, cy - 60], [cx + 150, cy - 60], [cx + 150 - 40 * flip, cy - 60 - 160 * flip], [cx - 150 + 40 * flip, cy - 60 - 160 * flip]], INK.paperLight, sd + 436, t, { w: 3, op: 1 - flip });
            yearT[0].textContent = String(yr); yearT[0].setAttribute('x', f1(cx)); yearT[0].setAttribute('y', f1(cy + 80)); yearT[0].setAttribute('font-size', '96');
          }
          // stamps
          (P.stamps || []).forEach((S, i) => {
            const a = atOr(cues, S.at, dur * 0.5), s = lt >= a ? spring(lt, a, 0.35) : 0, e = stampsT[i];
            const sx = S.x * W, sy = (S.y ?? 0.66) * H, k = lerp(2.2, 1, clamp01(s));
            e.setAttribute('opacity', clamp01(s * 2).toFixed(2));
            e.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(-10) scale(${k.toFixed(3)})`);
            if (s > 0.01) {
              let w = 0; try { w = e.getComputedTextLength(); } catch (er) { w = 300; }
              const pts = N.rect(-w / 2 - 30, -90, w / 2 + 30, 34).map(([x, y]) => { const r = -10 * Math.PI / 180; return [sx + (x * Math.cos(r) - y * Math.sin(r)) * k, sy + (x * Math.sin(r) + y * Math.cos(r)) * k]; });
              stampPen.fill(inkPath(pts, { w: 9, seed: sd + 500 + i, t, closed: true, smooth: false }), INK.red, clamp01(s * 2));
            }
          });
          if (mode === 'tablet') texts.forEach(({ L, tEl, full }, i) => {
            const a = atOr(cues, L.at, 0.1 + i * 0.3), p = lt >= a ? spring(lt, a, 0.5) : 0;
            tEl.textContent = p > 0.01 ? full : ''; tEl.setAttribute('x', f1(W / 2)); tEl.setAttribute('y', f1((L.y ?? (0.36 + i * 0.15)) * H));
            tEl.setAttribute('fill-opacity', clamp01(p * 2).toFixed(2));
          });
          [back, mid, front, stampPen].forEach(p => p.end());
          if (busts.bg) busts.bg.end();
          com.update(lt, t, cues);
        },
      };
    },
  };
})();
