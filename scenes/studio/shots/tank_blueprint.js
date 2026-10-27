// tank_blueprint: a design sheet pinned on a drafting board (1915-1916 landship designs), parchment ink (BRAND.md §3,
// §5). A light sheet with a faint blue grid, double border and title block, tilted slightly, with drawing pins and a
// shadow (the "interior" set behind it). The design draws itself on in blue ink with dimension lines:
//   design "ship"    — a dreadnought in side view on its waterline; at cue `tracks` the waves fade and two track loops
//                      draw under the hull (the "landship" idea)
//   design "wheel"   — the giant-wheeled landship proposal: a platform with three turrets on huge wheels, a tiny man
//                      for scale, a weight note
//   design "morph"   — a low Little Willie track loop that, at cue `morph`, grows into the Mark I rhomboid running round
//                      the whole hull; arrow heads keep circling the loop
//   design "compare" — a riveted water tank (box, filler cap, tap) next to a Mark I silhouette; "=" pops at cue `eq`
// P: {design, title: "...", x: 0.5, y: 0.47, w: 0.8, h: 0.66, rot: -1.5, draw: [at, dur] (draw-on window, s),
//     cross: cue (big red X over the drawing), dims: [{text, a: [x, y], b: [x, y], at}] (design px, origin = sheet centre),
//     cast: [...], labels: [...]}
// cues: tracks, morph, eq, cross, dims, labels, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const MK1 = [[-235, 0], [185, 0], [300, -58], [392, -140], [404, -184], [384, -224], [336, -246], [-300, -246], [-366, -226], [-398, -182], [-386, -118], [-322, -48]];
  const WIL = [[-250, 0], [205, 0], [282, -42], [300, -88], [282, -122], [-262, -122], [-298, -92], [-292, -44]];
  function resample(pts, n) {
    const L = [0]; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; L.push(L[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const tot = L[L.length - 1], out = [];
    for (let k = 0; k < n; k++) { const s = tot * k / n; let i = 0; while (L[i + 1] < s) i++; const u = (s - L[i]) / (L[i + 1] - L[i]); const a = pts[i], b = pts[(i + 1) % pts.length]; out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]); }
    return out;
  }
  // first fraction f of an open polyline
  function part(pts, f) {
    if (f >= 1) return pts; if (f <= 0) return [];
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const s = L[L.length - 1] * f, out = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (L[i] <= s) out.push(pts[i]); else { const u = (s - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
    return out;
  }
  const closed = pts => pts.concat([pts[0]]);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, n = 16) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

  SH.tank_blueprint = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 651;
      const root = el(svg, 'g');
      const cx = (P.x ?? 0.53) * W, cy = (P.y ?? 0.54) * H, sw = (P.w ?? 0.8) * W, shh = (P.h ?? 0.6) * H, rot = P.rot ?? -1.5;
      const sheetG = el(root, 'g', { transform: `translate(${cx} ${cy}) rotate(${rot})` });
      const L = (fill, extra) => inkEl(sheetG, fill, extra || {});
      const lay = {
        shadow: L(INK.ink, { 'fill-opacity': 0.18 }), sheet: L(INK.paperLight), grid: L(INK.blue, { 'fill-opacity': 0.22 }), border: L(INK.ink),
        tb: L(INK.ink), wash: L(INK.blue, { 'fill-opacity': 0.14 }), soft: L(INK.blue, { 'fill-opacity': 0.45 }), blue: L(INK.blue), ink: L(INK.ink),
        red: L(INK.red), arrows: L(INK.red), pins: L(INK.red),
      };
      const tbText = el(sheetG, 'text', { 'font-family': INK_FONT, 'font-size': 46, fill: INK.ink, 'text-anchor': 'middle' });
      tbText.textContent = P.title || '';
      const eqText = P.design === 'compare' ? el(sheetG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 190, fill: INK.red, 'text-anchor': 'middle' }) : null;
      if (eqText) eqText.textContent = '=';
      const dimT = (P.dims || []).map(d => { const e = el(sheetG, 'text', { 'font-family': INK_FONT, 'font-size': 52, fill: INK.ink, 'text-anchor': 'middle', stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' }); e.textContent = d.text; return e; });
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const hw = sw / 2, hh = shh / 2;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.1, w: 5 }, extra || {});
          const [d0, dd] = P.draw || [0.1, 2.2];
          const dp = k => progIO(lt, at(d0, 0.1) + k * 0.25, dd);          // staggered draw-on
          // sheet, grid, border, title block, pins
          const sheet = rect(-hw, -hh, hw, hh);
          lay.shadow.setAttribute('d', inkLoop(rect(-hw + 18, -hh + 22, hw + 18, hh + 22), o(1, { smooth: false })));
          lay.sheet.setAttribute('d', inkLoop(sheet, o(2, { smooth: false, amp: 0.6 })));
          const GR = [];
          for (let x = -hw + 60; x < hw; x += 60) GR.push(inkPath([[x, -hh + 8], [x, hh - 8]], o(10 + x, { w: 1.6, amp: 0.3 })));
          for (let y = -hh + 60; y < hh; y += 60) GR.push(inkPath([[-hw + 8, y], [hw - 8, y]], o(500 + y, { w: 1.6, amp: 0.3 })));
          lay.grid.setAttribute('d', GR.join(' '));
          const tbx = hw - 420, tby = hh - 110;
          lay.border.setAttribute('d', inkPath(sheet, o(3, { closed: true, smooth: false, w: 6 })) + ' ' + inkPath(rect(-hw + 24, -hh + 24, hw - 24, hh - 24), o(4, { closed: true, smooth: false, w: 2.5 })));
          lay.tb.setAttribute('d', inkPath(rect(tbx, tby, hw - 24, hh - 24), o(5, { closed: true, smooth: false, w: 3 })));
          tbText.setAttribute('x', (tbx + hw - 24) / 2); tbText.setAttribute('y', tby + 60);
          lay.pins.setAttribute('d', [[-hw + 30, -hh + 30], [hw - 30, -hh + 30], [-hw + 30, hh - 30]].map((p, k) => inkDot(p[0], p[1], 13, 13, sd + 20 + k, t)).join(' '));

          const BL = [], SO = [], WA = [], IN = [], RD = [], AR = [];
          const blue = (pts, k, f, extra) => { const q = part(pts, f); if (q.length > 1) BL.push(inkPath(q, o(k, Object.assign({ w: 6, smooth: false }, extra || {})))); };
          const D = P.design || 'morph';
          const S = P.scale ?? 1, OX = P.ox ?? 0, OY = P.oy ?? 0;
          const M = pts => pts.map(p => [OX + p[0] * S, OY + p[1] * S]);
          if (D === 'ship') {
            const wl = 120;
            const hull = M([[-600, wl - 100], [620, wl - 100], [570, wl + 10], [-560, wl + 10]]);
            blue(closed(hull), 30, dp(0));
            WA.push(inkLoop(hull, o(31, { smooth: false })));
            const sup = [M(rect(-170, wl - 175, 160, wl - 100)), M(rect(190, wl - 210, 280, wl - 100)), M(rect(-80, wl - 270, -36, wl - 175)), M(rect(30, wl - 255, 74, wl - 175))];
            sup.forEach((q, k) => blue(closed(q), 32 + k, dp(1 + k * 0.3), { w: 4.5 }));
            blue(M([[240, wl - 210], [240, wl - 340]]), 40, dp(2), { w: 4 });
            [[-400, -1], [420, 1]].forEach(([x, s2], k) => { blue(closed(M([[x - 60, wl - 100], [x + 60, wl - 100], [x + 50, wl - 150], [x - 50, wl - 150]])), 41 + k, dp(2 + k * 0.2), { w: 4.5 });
              blue(M([[x + s2 * 40, wl - 128], [x + s2 * 170, wl - 128]]), 43 + k, dp(2.4), { w: 7 }); });
            for (let k = 0; k < 7; k++) SO.push(inkDot(...M([[-420 + k * 140, wl - 60]])[0], 9, 9, sd + 50 + k, t));
            const tr = at('tracks', null), tp = tr == null ? 0 : progIO(lt, tr, 0.9);
            // waves fade as tracks grow
            for (let k = 0; k < 8; k++) { const x = -640 + k * 170 + Math.sin(lt * 1.5 + k) * 10, y = wl + 30;
              if (tp < 0.95) SO.push(inkPath(M([[x, y], [x + 40, y - 12], [x + 80, y]]), o(60 + k, { w: 4 * (1 - tp) + 0.5 }))); }
            if (tp > 0) [[-520, -80], [80, 520]].forEach(([a, b], k) => {
              const loop = M([[a + 50, wl + 14], [b - 50, wl + 14], [b, wl + 64], [b - 50, wl + 116], [a + 50, wl + 116], [a, wl + 64]]);
              const q = part(closed(loop), tp); if (q.length > 1) RD.push(inkPath(q, o(70 + k, { w: 14 })));
              for (let j = 0; j < 4; j++) { const wx = lerp(a + 80, b - 80, j / 3); if (tp > 0.6) IN.push(inkPath(circ(...M([[wx, wl + 66]])[0], 30 * S, 10), o(80 + k * 5 + j, { closed: true, w: 4 }))); }
              const ph = (lt * 60) % 40; if (tp > 0.9) for (let x = a + 50 + ph; x < b - 50; x += 40) RD.push(inkPath(M([[x, wl + 14], [x, wl + 34]]), o(90 + k * 30 + Math.round(x), { w: 6 })));
            });
          } else if (D === 'wheel') {
            const g0 = 230;
            const plat = M(rect(-470, -170, 470, -60));
            blue(closed(plat), 30, dp(0)); WA.push(inkLoop(plat, o(31, { smooth: false })));
            [[-300], [0], [300]].forEach(([x], k) => { const tur = M([[x - 70, -170], [x + 70, -170], [x + 56, -230], [x - 56, -230]]); blue(closed(tur), 32 + k, dp(0.6 + k * 0.2), { w: 4.5 });
              blue(M([[x + 60, -205], [x + 170, -205]]), 35 + k, dp(1 + k * 0.2), { w: 7 }); });
            const wheels = [[260, g0 - 230, 230], [-330, g0 - 140, 140]];
            wheels.forEach(([x, y, r], k) => { const c = M([[x, y]])[0], R = r * S, sp = lt * 0.4;
              blue(closed(circ(c[0], c[1], R, 28)), 40 + k, dp(1.5 + k * 0.3), { w: 7, smooth: true });
              blue(closed(circ(c[0], c[1], R * 0.18, 10)), 42 + k, dp(1.8), { w: 4, smooth: true });
              for (let j = 0; j < 8; j++) { const an = sp + j * Math.PI / 4; SO.push(inkPath([[c[0] + Math.cos(an) * R * 0.2, c[1] + Math.sin(an) * R * 0.2], [c[0] + Math.cos(an) * R * 0.95, c[1] + Math.sin(an) * R * 0.95]], o(50 + k * 10 + j, { w: 3 }))); }
              WA.push(inkLoop(circ(c[0], c[1], R, 20), o(44 + k)));
            });
            blue(M([[-330, -60], [-330, g0 - 140]]), 46, dp(2), { w: 5 });
            IN.push(inkPath(M([[-620, g0], [620, g0]]), o(47, { w: 3 })));
            // tiny man for scale
            const mx = 560, m = M([[mx, g0]])[0], u = 24 * S;
            IN.push(inkPath(circ(m[0], m[1] - u * 3.2, u * 0.45, 8), o(48, { closed: true, w: 3 })), inkPath([[m[0], m[1] - u * 2.75], [m[0], m[1] - u * 1.2]], o(49, { w: 3 })),
              inkPath([[m[0] - u * 0.6, m[1]], [m[0], m[1] - u * 1.2], [m[0] + u * 0.6, m[1]]], o(57, { w: 3 })), inkPath([[m[0] - u * 0.7, m[1] - u * 2.2], [m[0], m[1] - u * 2.5], [m[0] + u * 0.7, m[1] - u * 2.2]], o(58, { w: 3 })));
          } else if (D === 'morph') {
            const mo = at('morph', null), mp = mo == null ? 0 : progIO(lt, mo, 1.6), N = 64;
            const RH = [[-235, 0], [120, 0], [430, -230], [415, -262], [-330, -262], [-410, -170]]; const a = resample(WIL, N), b = resample(RH, N);
            // align start points roughly: both start at the rear end of the ground run
            const loop = M(a.map((p, i) => [lerp(p[0], b[i][0], mp), lerp(p[1], b[i][1], mp) + 120]));
            blue(closed(loop), 30, dp(0), { w: 9 });
            WA.push(inkLoop(loop, o(31, { smooth: false })));
            // hull box of the old design fades into the side plate
            const box = M([[-230, 0], [226, 0], [262, -78], [232, -178], [-220, -178], [-242, -88]].map(p => [p[0], p[1]]));
            if (mp < 0.98) SO.push(inkPath(closed(box), o(32, { w: 4 * (1 - mp) + 0.3 })));
            const sp = M(rect(-110, 120 - 186, 104, 120 - 58));
            if (mp > 0.6) blue(closed(sp), 33, (mp - 0.6) / 0.4, { w: 4 });
            // arrows circling the loop
            if (dp(0) > 0.9) {
              const Lp = closed(loop), segs = [0]; for (let i = 1; i < Lp.length; i++) segs.push(segs[i - 1] + Math.hypot(Lp[i][0] - Lp[i - 1][0], Lp[i][1] - Lp[i - 1][1]));
              const tot = segs[segs.length - 1];
              for (let k = 0; k < 6; k++) { const s = ((lt * 160 + k * tot / 6) % tot); let i = 1; while (segs[i] < s) i++;
                const u = (s - segs[i - 1]) / (segs[i] - segs[i - 1]), p = [lerp(Lp[i - 1][0], Lp[i][0], u), lerp(Lp[i - 1][1], Lp[i][1], u)];
                const d = [Lp[i][0] - Lp[i - 1][0], Lp[i][1] - Lp[i - 1][1]], ln = Math.hypot(d[0], d[1]) || 1, ux = d[0] / ln, uy = d[1] / ln;
                AR.push(inkPath([[p[0] - ux * 26 - uy * 18, p[1] - uy * 26 + ux * 18], p, [p[0] - ux * 26 + uy * 18, p[1] - uy * 26 - ux * 18]], o(100 + k, { w: 7, smooth: false }))); }
            }
            IN.push(inkPath(M([[-560, 126], [560, 126]]), o(34, { w: 3 })));
          } else if (D === 'compare') {
            // water tank (left)
            const tk = M(rect(-560, -150, -160, 150));
            blue(closed(tk), 30, dp(0)); WA.push(inkLoop(tk, o(31, { smooth: false })));
            for (let k = 1; k < 4; k++) blue(M([[-560, -150 + k * 75], [-160, -150 + k * 75]]), 32 + k, dp(0.5), { w: 3 });
            for (let k = 0; k < 9; k++) for (let j = 0; j < 4; j++) SO.push(inkDot(...M([[-540 + k * 47, -136 + j * 75]])[0], 5, 5, sd + 40 + k * 4 + j, t));
            blue(closed(M(rect(-400, -190, -320, -150))), 37, dp(0.8), { w: 4 });
            blue(M([[-160, 110], [-110, 110], [-110, 140]]), 38, dp(1), { w: 7 });
            const drop = (lt * 0.8) % 1; IN.push(inkDot(...M([[-110, 160 + drop * 60]])[0], 7, 10, sd + 39, t));
            // tank silhouette (right)
            const mk = M(MK1.map(p => [p[0] * 0.95 + 340, p[1] * 0.95 + 120]));
            blue(closed(mk), 50, dp(1.2)); WA.push(inkLoop(mk, o(51, { smooth: false })));
            blue(closed(M(rect(250, 120 - 176, 440, 120 - 56))), 52, dp(1.6), { w: 4 });
            const ea = at('eq', null);
            if (eqText) eqText.style.display = 'none';
            if (ea != null && lt >= ea) { const k = spring(lt, ea, 0.5), ex = OX - 100, ey = OY + 10, hw2 = 60 * k;
              RD.push(inkPath([[ex - hw2, ey - 30], [ex + hw2, ey - 30]], o(90, { w: 26 })), inkPath([[ex - hw2, ey + 30], [ex + hw2, ey + 30]], o(91, { w: 26 }))); }
          }
          // dimension lines
          (P.dims || []).forEach((d, k) => {
            const da = at(d.at, 0.8 + k * 0.4), p = progIO(lt, da, 0.8), e = dimT[k];
            if (p <= 0) { e.style.display = 'none'; return; }
            const a = d.a, b2 = d.b, q = part([a, b2], p);
            IN.push(inkPath(q, o(200 + k, { w: 3 })));
            const ux = b2[0] - a[0], uy = b2[1] - a[1], ln = Math.hypot(ux, uy) || 1, nx = -uy / ln * 20, ny = ux / ln * 20;
            IN.push(inkPath([[a[0] - nx, a[1] - ny], [a[0] + nx, a[1] + ny]], o(210 + k, { w: 3 })));
            if (p > 0.95) IN.push(inkPath([[b2[0] - nx, b2[1] - ny], [b2[0] + nx, b2[1] + ny]], o(220 + k, { w: 3 })));
            e.style.display = ''; e.setAttribute('x', (a[0] + b2[0]) / 2 + (d.dx || 0)); e.setAttribute('y', (a[1] + b2[1]) / 2 - 22 + (d.dy || 0));
            e.setAttribute('opacity', clamp01(p * 2).toFixed(2));
          });
          // red X
          const xa = P.cross != null ? at(P.cross, null) : null;
          if (xa != null && lt >= xa) { const p1 = progIO(lt, xa, 0.35), p2 = progIO(lt, xa + 0.3, 0.35);
            RD.push(inkPath(part([[-hw * 0.6, -hh * 0.6], [hw * 0.6, hh * 0.6]], p1), o(300, { w: 26 })));
            if (p2 > 0) RD.push(inkPath(part([[hw * 0.6, -hh * 0.6], [-hw * 0.6, hh * 0.6]], p2), o(301, { w: 26 }))); }
          lay.blue.setAttribute('d', BL.join(' ')); lay.soft.setAttribute('d', SO.join(' ')); lay.wash.setAttribute('d', WA.join(' '));
          lay.ink.setAttribute('d', IN.join(' ')); lay.red.setAttribute('d', RD.join(' ')); lay.arrows.setAttribute('d', AR.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          sheetG.setAttribute('transform', `translate(${cx} ${cy + Math.sin(lt * 0.5) * 3}) rotate(${(rot + Math.sin(lt * 0.4) * 0.3).toFixed(2)}) scale(${(1 + 0.02 * hit).toFixed(4)})`);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
