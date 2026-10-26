// sky_map: a big old parchment map sheet (~75% of the frame) with hand-drawn coasts, cities, an animated red dashed
// route (optionally with a little plane riding it), a target cross and Kaşif pointing beside it. Written for the
// Stickstory long video "Skylab fell on Esperance" (2026-10-26) because the shared `map` sheet is only 1000 px wide;
// parametric for any route / impact-zone map. Parchment ink (brand/kit/BRAND.md §3, §5): boil 8 Hz, palette tokens
// only, pure function of (seed, lt). Uses sky__lib.js (SKY) and td__lib.js (TD.label / figure).
// SHOTS.sky_map P: {
//   sheet: {x: 0.16, y: 0.23, w: 0.74, h: 0.6} (0..1 of the frame; keeps the kicker corner and caption band clear), all coordinates below are 0..1 of the sheet,
//   land: [[[x, y], ...], ...] (filled coast polygons), seas: [{name, x, y, size: 56}],
//   cities: [{name, x, y, at, color: "red", dx: 0, dy: -30, anchor: "middle"|"start"|"end", size: 58}],
//   route: {points: [[x, y], ...], at: cue|sec, dur: 2, color: "red", plane: false} (dashed line drawn along),
//   zone: {x, y, rx: 0.12, ry: 0.06, rot: -20, at} (red hatched ellipse: an impact / debris area),
//   target: {x, y, at} (red ✗ in a ring), note: {text, x, y, at, color, size} (TD.label in frame coords),
//   compass: "tr"|"tl"|"br"|"bl"|false, kasif: K (TD.figure) | false, cam: {zoom: 1.05}
// }   cues: hit, route.at, zone.at, target.at, city / note / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.sky_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, SKY = window.SKY, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 931;
      const Sh = Object.assign({ x: 0.16, y: 0.23, w: 0.74, h: 0.6 }, P.sheet || {});
      const X = u => (Sh.x + u * Sh.w) * W, Y = v => (Sh.y + v * Sh.h) * H, PX = q => [X(q[0]), Y(q[1])];
      const root = el(svg, 'g'), cam = el(root, 'g');
      const base = SKY.mkPen(cam);
      const seaT = (P.seas || []).map(sl => { const e = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': sl.size || 56, 'text-anchor': 'middle', fill: INK.inkSoft, 'letter-spacing': '0.06em' }); e.textContent = sl.name; return e; });
      const top = SKY.mkPen(cam);
      const cityT = (P.cities || []).map(c => { const e = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': c.size || 58, 'text-anchor': c.anchor || 'middle', fill: c.color === 'red' ? INK.red : INK.ink }); e.textContent = c.name; return e; });
      const compT = P.compass === false ? null : el(cam, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink });
      if (compT) compT.textContent = 'N';
      const note = P.note ? TD.label(root, Object.assign({ size: 64, color: 'red' }, P.note), W, H, sd + 50) : null;
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.07, y: 0.95, scale: 0.62, pose: 'point', face: 'right', dir: 30 }, P.kasif), sd + 7) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.05;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = W * (Sh.x + Sh.w / 2), fy = H * (Sh.y + Sh.h / 2);
          cam.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          base.begin();
          const x0 = X(0), y0 = Y(0), x1 = X(1), y1 = Y(1);
          base.fill(inkLoop([[x0 + 14, y0 + 16], [x1 + 14, y0 + 16], [x1 + 14, y1 + 16], [x0 + 14, y1 + 16]], { seed: sd + 1, t, smooth: false }), INK.paperDark);
          SKY.shape(base, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], INK.paperLight, sd + 2, t, { w: 6 });
          for (let i = 1; i < 6; i++) {         // dashed graticule
            for (let k = 0; k < 14; k++) {
              const u = k / 14, v = u + 0.035;
              SKY.line(base, [[X(i / 6), lerp(y0, y1, u)], [X(i / 6), lerp(y0, y1, v)]], sd + 10 + i * 20 + k, t, 2, INK.inkSoft);
              if (i < 5) SKY.line(base, [[lerp(x0, x1, u), Y(i / 5)], [lerp(x0, x1, v), Y(i / 5)]], sd + 200 + i * 20 + k, t, 2, INK.inkSoft);
            }
          }
          (P.land || []).forEach((poly, i) => SKY.shape(base, poly.map(PX), INK.paperDark, sd + 400 + i * 2, t, { w: 4.5, ink: INK.inkSoft, smooth: true, amp: 1.4 }));
          base.end();
          (P.seas || []).forEach((sl, i) => { const [sx, sy] = PX([sl.x, sl.y]); seaT[i].setAttribute('x', f1(sx)); seaT[i].setAttribute('y', f1(sy)); });
          top.begin();
          // zone
          if (P.zone) {
            const Z = P.zone, za = atOr(cues, Z.at, 0.2), zp = lt >= za ? spring(lt, za, 0.7) : 0;
            if (zp > 0.01) {
              const [cx, cy] = PX([Z.x, Z.y]), rx = (Z.rx ?? 0.12) * Sh.w * W * zp, ry = (Z.ry ?? 0.06) * Sh.h * H * zp, a = (Z.rot ?? -20) * Math.PI / 180;
              const pts = []; for (let k = 0; k < 16; k++) { const q = k / 16 * Math.PI * 2, ex = Math.cos(q) * rx, ey = Math.sin(q) * ry; pts.push([cx + ex * Math.cos(a) - ey * Math.sin(a), cy + ex * Math.sin(a) + ey * Math.cos(a)]); }
              top.fill(inkLoop(pts, { seed: sd + 500, t, amp: 1.5 }), INK.red, 0.18);
              top.fill(inkPath(pts, { w: 5, seed: sd + 501, t, closed: true, amp: 1.5 }), INK.red);
            }
          }
          // route
          if (P.route) {
            const Rt = P.route, ra = atOr(cues, Rt.at, 0.3), rp = lt >= ra ? progIO(lt, ra, Rt.dur ?? 2) : 0;
            const pts = Rt.points.map(PX), seg = [];
            for (let i = 0; i + 1 < pts.length; i++) seg.push(Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]));
            const L = seg.reduce((a, b) => a + b, 0);
            const at = d => { let k = 0; while (k < seg.length - 1 && d > seg[k]) { d -= seg[k]; k++; } const u = Math.min(1, d / seg[k]); return [lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)]; };
            const col = Rt.color === 'ink' ? INK.ink : INK.red, n = Math.max(6, Math.round(L / 46));
            for (let k = 0; k < n; k++) { const d0 = k / n * L, d1 = d0 + L / n * 0.55; if (d1 <= rp * L) top.fill(inkPath([at(d0), at(d1)], { w: 7, seed: sd + 600 + k, t, amp: 0.8 }), col); }
            if (rp > 0.02) {
              const hp = at(rp * L), bp = at(Math.max(0, rp * L - 30)), ang = Math.atan2(hp[1] - bp[1], hp[0] - bp[0]);
              const rot = q => [hp[0] + q[0] * Math.cos(ang) - q[1] * Math.sin(ang), hp[1] + q[0] * Math.sin(ang) + q[1] * Math.cos(ang)];
              if (Rt.plane) {
                SKY.shape(top, [[34, 0], [10, -7], [-6, -36], [-16, -36], [-8, -7], [-30, -6], [-38, -20], [-44, -20], [-40, 0], [-44, 20], [-38, 20], [-30, 6], [-8, 7], [-16, 36], [-6, 36], [10, 7]].map(q => rot([q[0] * 1.4, q[1] * 1.4])), INK.paperLight, sd + 700, t, { w: 4 });
              } else if (rp < 1) top.fill(inkLoop([[0, 0], [-26, -16], [-26, 16]].map(rot), { seed: sd + 701, t, smooth: false }), col);
            }
          }
          // target
          if (P.target) {
            const ta = atOr(cues, P.target.at, 0.4), tp = lt >= ta ? spring(lt, ta, 0.5) : 0, [cx, cy] = PX([P.target.x, P.target.y]), r = 46 * tp;
            if (tp > 0.01) {
              top.fill(inkPath(SKY.ell(cx, cy, r, r, 12), { w: 6, seed: sd + 720, t, closed: true }), INK.red);
              top.fill(inkPath([[cx - r * 0.6, cy - r * 0.6], [cx + r * 0.6, cy + r * 0.6]], { w: 7, seed: sd + 721, t }), INK.red);
              top.fill(inkPath([[cx + r * 0.6, cy - r * 0.6], [cx - r * 0.6, cy + r * 0.6]], { w: 7, seed: sd + 722, t }), INK.red);
            }
          }
          // cities
          (P.cities || []).forEach((c, i) => {
            const ca = atOr(cues, c.at, 0.1), cp = lt >= ca ? spring(lt, ca, 0.5) : 0, [cx, cy] = PX([c.x, c.y]);
            const col = c.color === 'red' ? INK.red : INK.ink, pk = punch(lt, ca, 0.5);
            if (cp > 0.01) { top.fill(inkDot(cx, cy, 11 * cp * (1 + 0.3 * pk), 11 * cp * (1 + 0.3 * pk), sd + 800 + i, t), col); top.fill(inkPath(SKY.ell(cx, cy, 20 * cp, 20 * cp, 10), { w: 4, seed: sd + 820 + i, t, closed: true }), col); }
            cityT[i].setAttribute('x', f1(cx + (c.dx ?? 0))); cityT[i].setAttribute('y', f1(cy + (c.dy ?? -32)));
            cityT[i].setAttribute('opacity', clamp01(cp * 2).toFixed(3));
          });
          // compass
          if (compT) {
            const pos = P.compass || 'tr', cx = pos.endsWith('r') ? x1 - 90 : x0 + 90, cy = pos.startsWith('t') ? y0 + 110 : y1 - 90, sp = t * 0.15;
            top.fill(inkPath(SKY.ell(cx, cy, 52, 52, 12), { w: 4, seed: sd + 900, t, closed: true }), INK.inkSoft);
            for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 - Math.PI / 2 + Math.sin(sp) * 0.05; top.fill(inkLoop([[cx + Math.cos(a) * 62, cy + Math.sin(a) * 62], [cx + Math.cos(a + 1.3) * 14, cy + Math.sin(a + 1.3) * 14], [cx + Math.cos(a - 1.3) * 14, cy + Math.sin(a - 1.3) * 14]], { seed: sd + 910 + k, t, smooth: false }), k === 0 ? INK.red : INK.ink); }
            compT.setAttribute('x', f1(cx)); compT.setAttribute('y', f1(cy - 72));
          }
          top.end();
          if (note) note.update(lt, t, cues);
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
