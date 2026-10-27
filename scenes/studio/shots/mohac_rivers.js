// mohac_rivers: an old river map of the Hungarian plain (14-mohac-1526): no coastline, the rivers ARE the map — the
// Danube with its bend at Buda, the Drava, the Sava and the Tisza drawn as thick wavering ink, with hand-lettered names.
// Cities pop in on cues, an army column of tiny banners marches along a dashed route, a bridge mark sits on a river,
// a rain cloud can stall another column, and regions can be hatched (the later three-way division).
// Coordinates are [lon, lat] (equirectangular, cos-corrected), bounds: [15.4, 24.6, 44.35, 48.3] (lon0, lon1, lat0, lat1).
// P: {bounds, cities: [{name, x, y, at, color, dx, dy}], route: {points: [[lon, lat], ...], at, dur: 3, color: "blue", column: true},
//     route2: {...} (a second route, e.g. red), bridge: {x, y, at}, rain: {x, y, at} (cloud + rain over a point),
//     regions: [{pts: [[lon, lat]...], at, color: "blue"|"red"|"green", label, lx, ly}], labels: [{text, x, y, at, size, color}],
//     rivers: true, river_names: true, hide_names: ["Sava"], note: {text, x, y, at}, cast: [MCB cast]}
// cues: route.at, route2.at, cities/labels/regions "at", bridge.at, rain.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const RIVERS = {
    Tuna: [[15.2, 48.25], [16.37, 48.21], [17.1, 48.12], [17.7, 47.85], [18.3, 47.76], [18.75, 47.8], [18.97, 47.76], [19.07, 47.6], [19.05, 47.45], [18.95, 47.1],
      [18.92, 46.7], [18.87, 46.4], [18.75, 46.1], [18.72, 45.95], [18.85, 45.75], [18.95, 45.56], [19.0, 45.35], [19.35, 45.22], [19.85, 45.26], [20.3, 45.0],
      [20.47, 44.82], [21.0, 44.75], [21.6, 44.65], [22.4, 44.6], [23.0, 44.2], [24.0, 43.7], [25.6, 43.65]],
    Drava: [[15.0, 46.55], [15.9, 46.4], [16.6, 46.25], [17.2, 46.0], [17.8, 45.8], [18.3, 45.68], [18.69, 45.56], [18.95, 45.56]],
    Sava: [[15.0, 45.85], [16.0, 45.55], [16.8, 45.3], [17.6, 45.12], [18.4, 45.05], [19.1, 44.9], [19.7, 44.92], [20.45, 44.82]],
    Tisza: [[22.4, 48.3], [21.5, 48.15], [21.0, 47.9], [20.4, 47.55], [20.15, 47.1], [20.1, 46.6], [20.15, 46.25], [20.1, 45.8], [20.15, 45.4], [20.25, 45.15]],
  };
  const NAME_AT = { Tuna: [19.25, 46.75], Drava: [17.0, 45.82], Sava: [17.4, 44.98], Tisza: [20.55, 46.75] };
  SH.mohac_rivers = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const [lo0, lo1, la0, la1] = P.bounds || [15.4, 24.6, 44.35, 48.3], kx = Math.cos(46.2 * Math.PI / 180);
      const S = { x: 150, y: 235, w: 1620, h: 740 };
      const sc = Math.min(S.w / ((lo1 - lo0) * kx), S.h / (la1 - la0));
      const ox = S.x + (S.w - (lo1 - lo0) * kx * sc) / 2, oy = S.y + (S.h - (la1 - la0) * sc) / 2;
      const PX = q => [ox + (q[0] - lo0) * kx * sc, oy + (la1 - q[1]) * sc];
      const root = el(svg, 'g');
      const frameG = el(root, 'g'), regG = el(root, 'g'), rivG = el(root, 'g'), routeG = el(root, 'g'), cityG = el(root, 'g'), fxG = el(root, 'g'), labG = el(root, 'g'), castG = el(root, 'g');
      const frameL = inkEl(frameG, INK.inkSoft), sheetF = inkEl(frameG, mix(INK.paperLight, INK.stain, 0.12));
      const regs = (P.regions || []).map((R, i) => ({ R, i, f: inkEl(regG, mix(INK.paperLight, R.color === 'red' ? INK.red : R.color === 'green' ? INK.green : INK.blue, 0.38)), l: inkEl(regG, R.color === 'red' ? INK.red : R.color === 'green' ? INK.green : INK.blue), h: inkEl(regG, R.color === 'red' ? INK.red : R.color === 'green' ? INK.green : INK.blue) }));
      const rivF = inkEl(rivG, INK.blue), rivL = inkEl(rivG, INK.ink);
      const mkRoute = (R, col) => R ? { R, n: el(routeG, 'path', { fill: 'none', stroke: col, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-dasharray': '22 18' }), head: inkEl(routeG, col), colF: inkEl(routeG, col), colL: inkEl(routeG, INK.ink) } : null;
      const r1 = mkRoute(P.route, P.route && P.route.color === 'red' ? INK.red : INK.blue), r2 = mkRoute(P.route2, P.route2 && P.route2.color === 'blue' ? INK.blue : INK.red);
      const cities = (P.cities || []).map((C, i) => {
        const g = el(cityG, 'g'), dot = inkEl(g, C.color === 'red' ? INK.red : INK.ink), ring = inkEl(g, C.color === 'red' ? INK.red : INK.ink);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': C.size || 50, 'text-anchor': 'middle', fill: C.color === 'red' ? INK.red : INK.ink, stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
        t.textContent = C.name;
        return { C, i, g, dot, ring, t, p: PX([C.x, C.y]) };
      });
      const rivNames = P.river_names !== false ? Object.keys(NAME_AT).filter(k => !(P.hide_names || []).includes(k)).map(k => { const t = el(rivG, 'text', { 'font-family': INK_FONT, 'font-size': 44, 'text-anchor': 'middle', fill: INK.blue, 'font-style': 'italic' }); t.textContent = k; const p = PX(NAME_AT[k]); t.setAttribute('x', f1(p[0])); t.setAttribute('y', f1(p[1])); return t; }) : [];
      void rivNames;
      const bridgeL = inkEl(fxG, INK.ink), bridgeF = inkEl(fxG, INK.stain), cloudF = inkEl(fxG, mix(INK.paperLight, INK.inkSoft, 0.2)), cloudL = inkEl(fxG, INK.ink), rainL = inkEl(fxG, INK.blue);
      const labels = (P.labels || []).map((L, i) => {
        const g = el(labG, 'g'), t = el(g, 'text', { 'font-family': L.font === 'serif' ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-weight': L.font === 'serif' ? 900 : 400, 'font-size': L.size || 56, 'text-anchor': 'middle', fill: L.color === 'red' ? INK.red : L.color === 'blue' ? INK.blue : INK.ink, stroke: INK.paperLight, 'stroke-width': 12, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
        t.textContent = L.text; const p = PX([L.x, L.y]); t.setAttribute('x', f1(p[0])); t.setAttribute('y', f1(p[1]));
        return { L, g, p };
      });
      const regLabels = regs.map(({ R }) => { if (!R.label) return null; const g = el(labG, 'g'), t = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': R.size || 54, 'text-anchor': 'middle', fill: R.color === 'red' ? INK.red : R.color === 'green' ? INK.green : INK.blue, stroke: INK.paperLight, 'stroke-width': 12, 'paint-order': 'stroke' }); t.textContent = R.label; const p = PX([R.lx, R.ly]); t.setAttribute('x', f1(p[0])); t.setAttribute('y', f1(p[1])); return { g, p }; });
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;
      const routeLen = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
      const along = (pts, d) => { for (let i = 1; i < pts.length; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= s) { const u = d / s; return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])]; } d -= s; } const n = pts.length; return [pts[n - 1][0], pts[n - 1][1], 0]; };

      function drawRoute(o, lt, cues, t, sd) {
        if (!o) return;
        const R = o.R, a = atOr(cues, R.at, 0.4), p = progIO(lt, a, R.dur ?? 3);
        const pts = inkSpline(R.points.map(PX), false, 10), L = routeLen(pts), d = L * p;
        if (p <= 0.001) { [o.n, o.head, o.colF, o.colL].forEach(n => n.setAttribute('d', '')); return; }
        const shown = []; for (let i = 0; i < pts.length; i++) { shown.push(pts[i]); if (routeLen(shown) >= d) break; }
        const tip = along(pts, d);
        shown[shown.length - 1] = [tip[0], tip[1]];
        o.n.setAttribute('d', 'M' + shown.map(q => f1(q[0]) + ' ' + f1(q[1])).join(' L'));
        o.n.setAttribute('stroke-dashoffset', f1(-t * 20));
        const an = tip[2], hl = 40;
        o.head.setAttribute('d', p < 0.98 ? '' : inkPath([[tip[0] - hl * Math.cos(an - 0.55), tip[1] - hl * Math.sin(an - 0.55)], [tip[0], tip[1]], [tip[0] - hl * Math.cos(an + 0.55), tip[1] - hl * Math.sin(an + 0.55)]], { w: 9, seed: sd, t, smooth: false }));
        // column of tiny banner-bearers following the tip
        if (R.column !== false) {
          let cf = '', cl = '';
          for (let k = 0; k < 7; k++) {
            const dd = d - k * 34; if (dd < 0) break;
            const q = along(pts, dd), bob = Math.abs(Math.sin(t * 8 + k)) * 4, x = q[0], y = q[1] - 8 - bob;
            cl += inkPath([[x, y], [x, y - 54]], { w: 4, seed: sd + 10 + k, t, amp: 0.6 }) + inkDot(x, y + 6, 9, 9, sd + 30 + k, t);
            cf += inkLoop([[x, y - 54], [x + 30, y - 48 + Math.sin(t * 7 + k) * 3], [x, y - 36]], { seed: sd + 50 + k, t, amp: 0.6, smooth: false });
          }
          o.colF.setAttribute('d', cf); o.colL.setAttribute('d', cl);
        }
      }

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const fr = [[S.x - 30, S.y - 30], [S.x + S.w + 30, S.y - 30], [S.x + S.w + 30, S.y + S.h + 30], [S.x - 30, S.y + S.h + 30]];
          sheetF.setAttribute('d', inkLoop(fr, { seed: seed + 1, t, amp: 1, smooth: false }));
          frameL.setAttribute('d', inkPath(fr, { w: 4, seed: seed + 2, t, closed: true, smooth: false }) + inkPath(fr.map((p, i) => [p[0] + (i === 0 || i === 3 ? 16 : -16), p[1] + (i < 2 ? 16 : -16)]), { w: 2, seed: seed + 3, t, closed: true, smooth: false }));
          // regions (hatched)
          regs.forEach(({ R, i, f, l, h }) => {
            const a = atOr(cues, R.at, 0.3), p = clamp01((lt - a) / 0.8);
            if (p <= 0) { f.setAttribute('d', ''); l.setAttribute('d', ''); h.setAttribute('d', ''); return; }
            const pts = R.pts.map(PX), cx = pts.reduce((s, q) => s + q[0], 0) / pts.length, cy = pts.reduce((s, q) => s + q[1], 0) / pts.length;
            const sp = pts.map(q => [cx + (q[0] - cx) * spring(lt, a, 0.8), cy + (q[1] - cy) * spring(lt, a, 0.8)]);
            f.setAttribute('d', inkLoop(sp, { seed: seed + 100 + i, t, amp: 1.5, smooth: false }));
            l.setAttribute('d', inkPath(sp, { w: 5, seed: seed + 110 + i, t, closed: true, smooth: false }));
            h.setAttribute('d', '');
          });
          regLabels.forEach((r, i) => { if (!r) return; const a = atOr(cues, regs[i].R.at, 0.3); r.g.style.display = lt >= a + 0.3 ? '' : 'none'; });
          // rivers: wavering double ink
          let rf = '', rl = '';
          for (const k in RIVERS) {
            const pts = RIVERS[k].map(PX), main = k === 'Tuna';
            rf += inkPath(pts, { w: main ? 16 : 10, seed: seed + k.length * 7, t, amp: 1.2, taper: 0.1 });
            rl += inkPath(pts.map(q => [q[0] + 1, q[1] + (main ? 9 : 6)]), { w: 2.4, seed: seed + k.length * 9, t, amp: 1.2 });
          }
          rivF.setAttribute('d', rf); rivL.setAttribute('d', rl);
          drawRoute(r1, lt, cues, t, seed + 200); drawRoute(r2, lt, cues, t, seed + 300);
          cities.forEach(({ C, i, g, dot, ring, t: tx, p }) => {
            const a = atOr(cues, C.at, 0.2 + i * 0.15), sp = spring(lt, a, 0.5);
            if (lt < a) { g.style.display = 'none'; return; }
            g.style.display = '';
            dot.setAttribute('d', inkDot(p[0], p[1], 13, 13, seed + 400 + i, t));
            ring.setAttribute('d', C.color === 'red' ? inkPath(inkEllipsePts(p[0], p[1], 30 + 6 * Math.sin(t * 4), 30 + 6 * Math.sin(t * 4), seed + 410 + i, 12), { w: 5, seed: seed + 420 + i, t, closed: true }) : '');
            tx.setAttribute('x', f1(p[0] + (C.dx ?? 0))); tx.setAttribute('y', f1(p[1] + (C.dy ?? -30)));
            g.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1])}) scale(${f1(Math.max(0.01, sp) * 1000) / 1000}) translate(${f1(-p[0])} ${f1(-p[1])})`);
          });
          // bridge mark: a row of boats across the river
          if (P.bridge) {
            const a = atOr(cues, P.bridge.at, 0.5), p = prog(lt, a, 0.8), c = PX([P.bridge.x, P.bridge.y]);
            let bf = '', bl = '';
            if (p > 0) for (let k = 0; k < 5; k++) { if (k / 5 > p) break; const x = c[0] - 50 + k * 25, y = c[1] - 45 + k * 22; bf += inkLoop([[x - 14, y - 6], [x + 14, y - 6], [x + 9, y + 7], [x - 9, y + 7]], { seed: seed + 500 + k, t, amp: 0.5, smooth: false }); bl += inkPath([[x - 14, y - 6], [x + 14, y - 6], [x + 9, y + 7], [x - 9, y + 7], [x - 14, y - 6]], { w: 3, seed: seed + 510 + k, t, smooth: false }); }
            if (p > 0.9) bl += inkPath([[c[0] - 64, c[1] - 58], [c[0] + 64, c[1] + 50]], { w: 5, seed: seed + 520, t });
            bridgeF.setAttribute('d', bf); bridgeL.setAttribute('d', bl);
          }
          // rain cloud
          if (P.rain) {
            const a = atOr(cues, P.rain.at, 0.5), sp = spring(lt, a, 0.6), c = PX([P.rain.x, P.rain.y]);
            if (lt >= a) {
              const cy = c[1] - 120, r = 70 * sp;
              const lobes = [[0, 0, 1], [-r * 0.9, r * 0.25, 0.75], [r * 0.95, r * 0.2, 0.8], [r * 0.3, -r * 0.45, 0.7]];
              cloudF.setAttribute('d', lobes.map(([dx, dy, k], j) => inkLoop(inkEllipsePts(c[0] + dx, cy + dy, r * k, r * k * 0.75, seed + 600 + j, 12), { seed: seed + 600 + j, t, amp: 1 })).join(''));
              cloudL.setAttribute('d', lobes.map(([dx, dy, k], j) => inkPath(inkEllipsePts(c[0] + dx, cy + dy, r * k, r * k * 0.75, seed + 600 + j, 12).slice(j ? 6 : 5, 12), { w: 5, seed: seed + 610 + j, t })).join('') + inkPath([[c[0] - r * 1.6, cy + r * 0.75], [c[0] + r * 1.7, cy + r * 0.7]], { w: 5, seed: seed + 620, t }));
              let rd = '';
              for (let k = 0; k < 14; k++) { const q = rng(inkHash(seed + 610, k)), y = cy + 30 + ((q() * 90 + lt * 160) % 90), x = c[0] - 70 + q() * 140; rd += inkPath([[x, y], [x - 8, y + 26]], { w: 4, seed: seed + 620 + k, t }); }
              rainL.setAttribute('d', sp > 0.5 ? rd : '');
            }
          }
          labels.forEach(({ L, g, p }) => {
            const a = atOr(cues, L.at, 0.3); if (lt < a) { g.style.display = 'none'; return; }
            g.style.display = ''; const sp = spring(lt, a, 0.5);
            g.setAttribute('transform', `translate(${f1(p[0])} ${f1(p[1])}) rotate(${L.rot ?? -3}) scale(${f1(Math.max(0.01, sp) * 1000) / 1000}) translate(${f1(-p[0])} ${f1(-p[1])})`);
          });
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
