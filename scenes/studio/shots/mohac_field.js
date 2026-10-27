// mohac_field: the Mohács battlefield in an oblique bird's-eye view (14-mohac-1526), drawn in perspective: the Danube
// with its reed marshes along one side, the wet plain in the middle and the raised terrace (a hatched escarpment) at the
// far end. Armies are blocks of tiny ink figures (riders, foot, guns, tents) that march, open, wheel and break on cues;
// hand-drawn arrows sweep over the plain. Unlike a flat top-down map the units shrink and crowd with distance.
// Plane coords: u 0..1 left -> right, v 0 (near, bottom of frame) .. 1 (far, top of the terrace).
// P: {horizon: 200, near: 1100 (y of v = 0), depth: 1.6 (perspective strength), units[].size: 1.6 (glyph scale), river: "left"|"right"|false, marsh: true, ridge: 0.8 (v of the escarpment foot) | false, town: {u, v, name},
//     units: [{side: "hu"|"ot", kind: "cav"|"inf"|"guns"|"camp", u, v, w: 0.1, d: 0.05, rows: 3, cols: 8,
//              keys: [{at: cue|s, u, v, dur: 1.5}], scatter: cue (block breaks apart), burn: cue (camp burns), flag: true,
//              hide_until: cue, fade: cue (block thins out)}],
//     arrows: [{pts: [[u, v], ...], at, dur: 1.2, color: "red"|"blue"|"ink"}], labels: [{text, u, v, at, dy: -60, color, size}],
//     smoke: [{u, v, at, n: 5, w: 0.2}] (gun smoke rolling over a line), dusk: 0..1 (long shadows: units drawn ink-soft),
//     fore: [{type: "reeds"|"banner"|"wheel", x, y, h, w, side, face, s}] (big foreground layer), size: 2.8 (glyph scale),
//     cast: [MCB cast entries]}
// The scene's "set" ({"name": "field", "ground": 1060, "horizon": 300}) paints the sky and the land under the plain.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const HZ = P.horizon ?? 200, YN = P.near ?? 1100, K = P.depth ?? 1.6, WN = 4000;
      const z = v => 1 + K * v;
      const pr = (u, v, e = 0) => { const zz = z(v); return [W / 2 + (u - 0.5) * WN / zz, HZ + (YN - HZ) / zz - e * 170 / zz]; };
      const ridgeV = P.ridge === false ? null : (P.ridge ?? 0.8), ridgeTop = ridgeV != null ? Math.min(1.25, ridgeV + 0.09) : null;
      const elev = v => ridgeV == null ? 0 : v <= ridgeV ? 0 : v >= ridgeTop ? 1 : (1 - Math.cos((v - ridgeV) / (ridgeTop - ridgeV) * Math.PI)) / 2;
      const hU = u => 0.55 + 0.45 * Math.pow(Math.sin(u * 5.3 + 0.7), 2) + 0.15 * Math.sin(u * 13 + 2);   // the ridge rises and dips along its length
      const PR = (u, v) => pr(u, v, elev(v) * hU(u));
      const root = el(svg, 'g');
      const landG = el(root, 'g'), waterG = el(root, 'g'), marshG = el(root, 'g'), ridgeG = el(root, 'g'), townG = el(root, 'g'), unitG = el(root, 'g'),
        smokeG = el(root, 'g'), arrowG = el(root, 'g'), labG = el(root, 'g'), castG = el(root, 'g');
      const plainF = inkEl(landG, mix(INK.paperLight, INK.green, 0.18)), plainL = inkEl(landG, INK.inkSoft), puddF = inkEl(landG, mix(INK.paperLight, INK.blue, 0.35));
      const riverF = inkEl(waterG, mix(INK.paperLight, INK.blue, 0.45)), riverL = inkEl(waterG, INK.ink), riverW = inkEl(waterG, INK.blue);
      const marshL = inkEl(marshG, INK.inkSoft), marshT = inkEl(marshG, INK.stain);
      const slopeF = inkEl(ridgeG, mix(INK.paperLight, INK.stain, 0.35)), slopeH = inkEl(ridgeG, INK.inkSoft), slopeL = inkEl(ridgeG, INK.ink), topF = inkEl(ridgeG, mix(INK.paperLight, INK.green, 0.28));
      const townF = inkEl(townG, INK.paperLight), townL = inkEl(townG, INK.ink), townR = inkEl(townG, INK.red);
      const RIV = P.river ?? 'left';
      const riverU = v => RIV === 'left' ? 0.1 + 0.05 * Math.sin(v * 5 + 1) : 0.9 + 0.05 * Math.sin(v * 5 + 1);
      const units = (P.units || []).map((U, i) => ({ U, i, fill: inkEl(unitG, U.kind === 'camp' ? INK.paperLight : M.side(U.side)), ink: inkEl(unitG, P.dusk ? INK.inkSoft : INK.ink),
        flame: inkEl(unitG, INK.gold), flameR: inkEl(unitG, INK.red), flag: inkEl(unitG, M.side(U.side)) }));
      const smB = inkEl(smokeG, INK.paperDark), smF = inkEl(smokeG, INK.paperLight), smL = inkEl(smokeG, INK.inkSoft);
      const arrows = (P.arrows || []).map((A, i) => ({ A, i, n: inkEl(arrowG, A.color === 'blue' ? INK.blue : A.color === 'ink' ? INK.ink : INK.red) }));
      const labels = (P.labels || []).map((L, i) => {
        const g = el(labG, 'g'), size = L.size || 54;
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: L.color === 'red' ? INK.red : L.color === 'blue' ? INK.blue : INK.ink, stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
        t.textContent = L.text;
        return { L, g, t };
      });
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;
      // foreground layer (stage px, drawn big in front of the plain): reeds, a banner, a gun wheel
      const foreG = el(root, 'g');
      const fore = (P.fore || []).map((F, i) => F.type === 'reeds' ? { F, r: M.reeds(foreG, [{ x: F.x, y: F.y ?? H + 20, h: F.h ?? 420, n: F.n ?? 9, w: F.w ?? 260, lean: F.lean ?? 0.1, wd: 8 }], seed * 11 + i) }
        : F.type === 'banner' ? { F, b: M.banner(foreG, { side: F.side || 'hu', seed: seed * 12 + i, tail: true }) }
        : { F, c: M.cannon(foreG, { seed: seed * 13 + i }) });

      // glyphs (plane position -> screen, scale 1/z)
      function glyph(kind, x, y, s, sd, t, broken, sideCol) {
        const w = Math.max(1.6, 4.2 * s);
        if (kind === 'cav') {
          const body = inkEllipsePts(x, y - 30 * s, 24 * s, 11 * s, sd, 8);
          return { f: inkLoop([[x - 18 * s, y - 42 * s], [x + 8 * s, y - 42 * s], [x + 14 * s, y - 28 * s], [x - 20 * s, y - 24 * s]], { seed: sd, t, amp: 0.6, smooth: false }),
            l: inkPath(body, { w, seed: sd, t, closed: true, amp: 0.6 }) + inkPath([[x + 18 * s, y - 36 * s], [x + 34 * s, y - 50 * s]], { w: w * 1.3, seed: sd + 1, t, amp: 0.6 })
              + inkPath([[x - 16 * s, y - 24 * s], [x - 20 * s, y]], { w, seed: sd + 2, t, amp: 0.5 }) + inkPath([[x + 14 * s, y - 24 * s], [x + 18 * s, y]], { w, seed: sd + 3, t, amp: 0.5 })
              + inkPath([[x - 2 * s, y - 40 * s], [x, y - 66 * s]], { w: w * 1.2, seed: sd + 4, t, amp: 0.5 }) + inkDot(x + 1 * s, y - 74 * s, 7 * s, 7 * s, sd + 5, t, 0.4)
              + (broken ? '' : inkPath([[x - 20 * s, y - 60 * s], [x + 50 * s, y - 70 * s]], { w: w * 0.8, seed: sd + 6, t, amp: 0.5 })) };
        }
        if (kind === 'inf') {
          return { f: inkLoop([[x - 9 * s, y - 50 * s], [x + 9 * s, y - 50 * s], [x + 11 * s, y - 24 * s], [x - 11 * s, y - 24 * s]], { seed: sd, t, amp: 0.5, smooth: false }),
            l: inkPath([[x - 8 * s, y], [x, y - 24 * s], [x + 8 * s, y]], { w, seed: sd, t, amp: 0.5 }) + inkPath([[x, y - 24 * s], [x, y - 52 * s]], { w: w * 1.2, seed: sd + 1, t, amp: 0.5 })
              + inkDot(x, y - 62 * s, 9 * s, 9 * s, sd + 2, t, 0.4) + inkPath([[x + 10 * s, y - 20 * s], [x + 14 * s, y - 92 * s]], { w: w * 0.8, seed: sd + 3, t, amp: 0.5 }) };
        }
        if (kind === 'guns') {
          return { f: '', l: inkPath([[x - 30 * s, y - 16 * s], [x + 30 * s, y - 26 * s]], { w: w * 2.6, seed: sd, t, amp: 0.5 }) + inkPath(inkEllipsePts(x - 6 * s, y - 10 * s, 11 * s, 11 * s, sd, 8), { w, seed: sd + 1, t, closed: true, amp: 0.5 }) };
        }
        // camp: a tent
        return { f: inkLoop([[x - 34 * s, y], [x, y - 52 * s], [x + 34 * s, y]], { seed: sd, t, amp: 0.6, smooth: false }),
          l: inkPath([[x - 34 * s, y], [x, y - 52 * s], [x + 34 * s, y], [x - 34 * s, y]], { w, seed: sd, t, amp: 0.6, smooth: false }) + inkPath([[x, y - 52 * s], [x, y - 70 * s]], { w, seed: sd + 1, t, amp: 0.4 }) };
      }

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // plain: a big quad from the near edge to the ridge foot (or the far edge)
          const vFar = ridgeV ?? 1.2;
          const quad = [pr(-0.3, 0), pr(-0.3, vFar), pr(1.3, vFar), pr(1.3, 0)];
          plainF.setAttribute('d', P.plain_fill ? inkLoop(quad, { seed: seed + 1, t, amp: 0.5, smooth: false }) : '');
          let pl = '', pd = '';
          for (let i = 0; i < 40; i++) {      // furrows / wet streaks, receding
            const q = rng(inkHash(seed, i + 10)), u = q() * 1.2 - 0.1, v = q() * vFar * 0.95, L = 0.04 + q() * 0.06;
            pl += inkPath([PR(u, v), PR(u + L, v + (q() - 0.5) * 0.01)], { w: Math.max(1.5, 4 / z(v)), seed: seed + 20 + i, t, amp: 0.6 });
          }
          for (let i = 0; i < 12; i++) {      // standing water after the rain
            const q = rng(inkHash(seed, i + 90)), u = q() * 0.9 + (RIV === 'left' ? 0.1 : 0), v = q() * vFar * 0.8;
            const c = PR(u, v), zz = z(v);
            pd += inkLoop(inkEllipsePts(c[0], c[1], (60 + q() * 90) / zz, (14 + q() * 16) / zz, seed + 100 + i, 10), { seed: seed + 100 + i, t, amp: 0.6 });
          }
          plainL.setAttribute('d', pl); puddF.setAttribute('d', pd);
          // river
          if (RIV) {
            const sideU = RIV === 'left' ? -0.6 : 1.6, L = [], Rr = [];
            for (let k = 0; k <= 16; k++) { const v = -0.05 + k / 16 * 1.4; L.push(pr(riverU(v), v)); Rr.push(pr(sideU, v)); }
            riverF.setAttribute('d', inkLoop(L.concat(Rr.reverse()), { seed: seed + 3, t, amp: 0.8 }));
            riverL.setAttribute('d', inkPath(L, { w: 6, seed: seed + 4, t }));
            let wd = '';
            for (let i = 0; i < 16; i++) {
              const q = rng(inkHash(seed, i + 200)), v = q() * 1.2, flow = (t * 0.03 + q()) % 1;
              const u0 = RIV === 'left' ? riverU(v) - 0.05 - q() * 0.3 : riverU(v) + 0.05 + q() * 0.3;
              const a = pr(u0, v + flow * 0.05), b = pr(u0 - 0.06, v + flow * 0.05 + 0.01);
              wd += inkPath([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 4], b], { w: Math.max(2, 5 / z(v)), seed: seed + 210 + i, t });
            }
            riverW.setAttribute('d', wd);
            if (P.marsh !== false) {
              let ml = '', mt = '';
              for (let i = 0; i < 70; i++) {
                const q = rng(inkHash(seed, i + 400)), v = q() * Math.min(1.1, vFar), off = q() * 0.14;
                const u = RIV === 'left' ? riverU(v) + 0.01 + off : riverU(v) - 0.01 - off, b = PR(u, v), s = 1 / z(v);
                const sw = Math.sin(t * 1.5 + i) * 6 * s;
                for (let k = -1; k <= 1; k++) ml += inkPath([[b[0] + k * 8 * s, b[1]], [b[0] + k * 14 * s + sw, b[1] - (50 + q() * 30) * s]], { w: Math.max(1.4, 3.5 * s), seed: seed + 420 + i * 3 + k, t, amp: 0.5, taper: 0.6 });
                if (i % 3 === 0) mt += inkLoop(inkEllipsePts(b[0] + sw, b[1] - 70 * s, 4 * s + 1, 11 * s + 1, seed + 500 + i, 6), { seed: seed + 500 + i, t, amp: 0.4 });
              }
              marshL.setAttribute('d', ml); marshT.setAttribute('d', mt);
            }
          }
          // ridge: escarpment band with hachures, then the plateau
          if (ridgeV != null) {
            const foot = [], top = [], far = [];
            for (let k = 0; k <= 40; k++) { const u = -0.3 + k / 40 * 1.6, wv = 0.012 * Math.sin(u * 9 + 2); foot.push(pr(u, ridgeV + wv, 0)); top.push(pr(u, ridgeTop + wv, hU(u))); far.push(pr(u, 1.6, hU(u))); }
            slopeF.setAttribute('d', inkLoop(foot.concat(top.slice().reverse()), { seed: seed + 5, t, amp: 0.6, smooth: false }));
            topF.setAttribute('d', inkLoop(top.concat(far.slice().reverse()), { seed: seed + 6, t, amp: 0.6, smooth: false }));
            let hd = '';
            for (let k = 0; k < 90; k++) {      // hachures: dense under the brow, thinning down the slope, uneven like a pen
              const q = rng(inkHash(seed + 600, k)), u = -0.25 + (k + q() * 0.8) / 90 * 1.5, wv = 0.012 * Math.sin(u * 9 + 2);
              const L = 0.35 + q() * 0.6, a = PR(u, ridgeTop + wv - 0.003), b = PR(u - 0.006 + q() * 0.004, ridgeTop + wv - (ridgeTop - ridgeV) * L);
              hd += inkPath([a, [(a[0] + b[0]) / 2 + 2, (a[1] + b[1]) / 2], b], { w: 1.8 + q() * 1.6, seed: seed + 600 + k, t, amp: 0.6, taper: 0.8 });
            }
            for (let k = 0; k < 16; k++) {      // bushes along the brow
              const q = rng(inkHash(seed + 650, k)), u = -0.2 + q() * 1.4, c = PR(u, ridgeTop + 0.012 * Math.sin(u * 9 + 2) + 0.01), r = 9 + q() * 8;
              hd += inkPath(inkEllipsePts(c[0], c[1] - r, r * 1.3, r, seed + 660 + k, 8), { w: 2.4, seed: seed + 680 + k, t, closed: true });
            }
            slopeH.setAttribute('d', hd);
            slopeL.setAttribute('d', inkPath(top, { w: 5, seed: seed + 7, t }) + inkPath(foot, { w: 3, seed: seed + 8, t }));
          }
          // town (houses + a church tower)
          if (P.town) {
            const T = P.town, c = PR(T.u, T.v), s = 1.3 / z(T.v);
            let tf = '', tl = '', tr = '';
            for (let k = 0; k < 6; k++) {
              const x = c[0] + (k - 2.5) * 60 * s, y = c[1] + (k % 2) * 16 * s, hw = 24 * s, hh = 30 * s;
              const box = [[x - hw, y], [x - hw, y - hh], [x + hw, y - hh], [x + hw, y]];
              tf += inkLoop(box, { seed: seed + 700 + k, t, amp: 0.5, smooth: false });
              tl += inkPath(box.concat([box[0]]), { w: 3, seed: seed + 710 + k, t, amp: 0.5, smooth: false });
              tr += inkLoop([[x - hw - 5 * s, y - hh], [x, y - hh - 24 * s], [x + hw + 5 * s, y - hh]], { seed: seed + 720 + k, t, amp: 0.5, smooth: false });
            }
            const tx = c[0] + 40 * s, ty = c[1] - 10 * s, tower = [[tx - 14 * s, ty], [tx - 14 * s, ty - 90 * s], [tx + 14 * s, ty - 90 * s], [tx + 14 * s, ty]];
            tf += inkLoop(tower, { seed: seed + 730, t, amp: 0.5, smooth: false }); tl += inkPath(tower.concat([tower[0]]), { w: 3, seed: seed + 731, t, smooth: false }) + inkPath([[tx, ty - 90 * s], [tx, ty - 130 * s]], { w: 3, seed: seed + 732, t });
            townF.setAttribute('d', tf); townL.setAttribute('d', tl); townR.setAttribute('d', tr);
          }
          // units
          units.forEach(({ U, i, fill, ink, flame, flameR, flag }) => {
            const hu = atOr(cues, U.hide_until, null);
            if (hu != null && lt < hu) { [fill, ink, flame, flameR, flag].forEach(n => n.setAttribute('d', '')); return; }
            let u = U.u, v = U.v;
            (U.keys || []).forEach(k => { const a = atOr(cues, k.at, null); if (a == null) return; const p = progIO(lt, a, k.dur ?? 1.5); u = lerp(u, k.u ?? u, p); v = lerp(v, k.v ?? v, p); });
            const sc = atOr(cues, U.scatter, null), br = sc != null ? prog(lt, sc, 1.6) : 0;
            const fd = atOr(cues, U.fade, null), thin = fd != null ? prog(lt, fd, 1.2) : 0;
            const rows = U.rows ?? 3, cols = U.cols ?? 8, w = U.w ?? 0.12, d = U.d ?? 0.05;
            let F = '', Li = '';
            const items = [];
            for (let r = rows - 1; r >= 0; r--) for (let c = 0; c < cols; c++) {
              const q = rng(inkHash(seed * 31 + i, r * 50 + c));
              if (thin > 0 && q() < thin) continue;
              let uu = u + (c / Math.max(1, cols - 1) - 0.5) * w + (q() - 0.5) * 0.008, vv = v + (r / Math.max(1, rows - 1) - 0.5) * d + (q() - 0.5) * 0.004;
              if (br > 0) { uu += (q() - 0.5) * 0.25 * br; vv += (q() - 0.5) * 0.12 * br; }
              const march = U.keys && U.keys.length ? Math.sin(t * 9 + c + r) * 0.6 : 0;
              const p = PR(uu, vv), s = (U.size ?? P.size ?? 2.8) / z(vv);
              items.push([p[0], p[1] + march, s, r * 50 + c, br > 0.3 && q() < 0.5]);
            }
            items.sort((a, b) => a[1] - b[1]);
            items.forEach(([x, y, s, k, fallen]) => { const gph = glyph(U.kind || 'cav', x, y, s, seed * 1000 + i * 100 + k, t, fallen); F += gph.f; Li += gph.l; });
            fill.setAttribute('d', F); ink.setAttribute('d', Li);
            // flag above the block
            if (U.flag !== false && U.kind !== 'camp') {
              const p = PR(u + w * 0.3, v), s = (U.size ?? P.size ?? 2.8) / z(v), wv = Math.sin(t * 6 + i) * 6 * s;
              const fx = p[0], fy = p[1] - 150 * s;
              flag.setAttribute('d', inkLoop([[fx, fy], [fx + 60 * s, fy + wv], [fx + 56 * s, fy + 34 * s + wv], [fx, fy + 30 * s]], { seed: seed + 800 + i, t, amp: 0.6 }));
              Li += inkPath([[fx, p[1] - 40 * s], [fx, fy]], { w: Math.max(1.5, 4 * s), seed: seed + 810 + i, t });
              ink.setAttribute('d', Li);
            } else flag.setAttribute('d', '');
            // a burning camp
            const bu = atOr(cues, U.burn, null);
            if (U.kind === 'camp' && bu != null && lt >= bu) {
              let ff = '', fr = '';
              items.forEach(([x, y, s, k], j) => {
                if (j % 2) return;
                const h = (60 + 30 * Math.sin(t * 13 + j)) * s * prog(lt, bu + j * 0.05, 0.6);
                const pts = [[x - 26 * s, y - 20 * s], [x - 14 * s, y - 20 * s - h * 0.7], [x - 2 * s, y - 20 * s - h * 0.45], [x + 6 * s, y - 20 * s - h], [x + 16 * s, y - 20 * s - h * 0.5], [x + 26 * s, y - 20 * s]];
                ff += inkLoop(pts, { seed: seed + 900 + j, t, amp: 1.2 });
                fr += inkLoop(pts.map(p => [x + (p[0] - x) * 0.5, y - 20 * s + (p[1] - y + 20 * s) * 0.5]), { seed: seed + 950 + j, t, amp: 1 });
              });
              flame.setAttribute('d', ff); flameR.setAttribute('d', fr);
            } else { flame.setAttribute('d', ''); flameR.setAttribute('d', ''); }
          });
          // gun smoke rolling over a line
          let sf = '', sl = '', sb = '';
          (P.smoke || []).forEach((S, i) => {
            const a = atOr(cues, S.at, null); if (a == null || lt < a) return;
            const n = S.n ?? 8;
            for (let k = 0; k < n; k++) {
              const age = lt - a - k * 0.12; if (age < 0) continue;
              const grow = 1 - Math.exp(-age * 1.2), u = S.u + (k / Math.max(1, n - 1) - 0.5) * (S.w ?? 0.2), v = S.v - grow * 0.05;
              const c = PR(u, v), r = (70 + grow * 110) / z(S.v);
              sf += M.puff(c[0], c[1] - r * 0.6, r, seed + 1000 + i * 20 + k, t);
              sb += M.puff(c[0] + r * 0.15, c[1] - r * 0.35, r * 0.95, seed + 1100 + i * 20 + k, t);
              if (k === Math.floor(n / 2)) sl += inkPath(M.puffPts(c[0], c[1] - r * 0.6, r, seed + 1000 + i * 20 + k).slice(5), { w: 2.4, seed: seed + 1050 + k, t });
              
            }
          });
          smF.setAttribute('d', sf); smL.setAttribute('d', sl); smB.setAttribute('d', sb);
          // arrows sweeping over the plain
          arrows.forEach(({ A, i, n }) => {
            const a = atOr(cues, A.at, null); if (a == null || lt < a) { n.setAttribute('d', ''); return; }
            const p = prog(lt, a, A.dur ?? 1.2);
            const pts = inkSpline(A.pts.map(q => PR(q[0], q[1])), false, 12), m = Math.max(2, Math.round(pts.length * p));
            const pp = pts.slice(0, m), tip = pp[pp.length - 1], prev = pp[Math.max(0, pp.length - 4)];
            const ang = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]), hl = 46;
            const ww = A.w ?? 13;
            let d = inkPath(pp, { w: ww, seed: seed + 1100 + i, t, taper: 0.1 });
            if (p > 0.15) d += inkPath([[tip[0] - hl * Math.cos(ang - 0.6), tip[1] - hl * Math.sin(ang - 0.6)], tip, [tip[0] - hl * Math.cos(ang + 0.6), tip[1] - hl * Math.sin(ang + 0.6)]], { w: ww * 0.9, seed: seed + 1120 + i, t, smooth: false });
            n.setAttribute('d', d);
          });
          labels.forEach(({ L, g, t: tx }) => {
            const a = atOr(cues, L.at, 0.3); if (lt < a) { g.style.display = 'none'; return; }
            g.style.display = '';
            const p = PR(L.u, L.v), sp = spring(lt, a, 0.5);
            tx.setAttribute('x', f1(p[0])); tx.setAttribute('y', f1(p[1] + (L.dy ?? -60)));
            g.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1] + (L.dy ?? -60))}) scale(${f1(Math.max(0.01, sp) * 1000) / 1000}) translate(${f1(-p[0])} ${f1(-p[1] - (L.dy ?? -60))})`);
          });
          fore.forEach(({ F, r, b, c }) => {
            if (r) r.update(t, 1.2);
            else if (b) b.update(t, { x: F.x, y: F.y ?? H + 40, h: F.h ?? 700, w: F.w ?? 280, face: F.face ?? 1, sw: 9 });
            else c.update(t, { x: F.x, y: F.y ?? H + 60, s: F.s ?? 1.9, face: F.face ?? -1, recoil: 0, fire: 0 });
          });
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
