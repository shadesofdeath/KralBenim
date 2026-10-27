// tank_front: old ink map of the Western Front 1914-1918 (BRAND.md §3, §5): simplified real coastlines of the Channel
// and the North Sea (France, Belgium, the Netherlands, southern England) in [lon, lat], hatched sea, the trench line
// from the North Sea coast at Nieuwport to the Swiss border drawing itself on as a red zig-zag with cross ticks,
// country names, cities with rings, dashed arrows (with a small tank glyph riding the tip), a camera that eases
// from one view to another (zoom on the Somme), notes, and a double map border with a compass rose.
// P: {view: [lon0, lon1, lat0, lat1], view2: [...] (eased to at cue `zoom`), line: {at, dur: 2.5} | false,
//     countries: true, cities: [{name, lon, lat, at, ring: true, color: "red"|"ink"|"blue", dx, dy}],
//     arrows: [{from: [lon, lat], to: [lon, lat], at, dur: 1.6, color: "red"|"blue"|"ink", tank: true, bend: 0.15}],
//     notes: [{text, x, y (0..1), at, color, size}], kasif: {x, y, pose, at, then, face, scale}, compass: true}
// cues: line.at, zoom, city/arrow/note "at", hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const CONT = [[4.8, 53.4], [4.75, 52.9], [4.4, 52.2], [4.0, 51.9], [3.6, 51.5], [3.2, 51.35], [2.55, 51.08], [1.85, 50.95], [1.6, 50.7], [1.58, 50.2],
    [1.4, 50.07], [1.0, 49.9], [0.2, 49.7], [0.1, 49.45], [-0.2, 49.3], [-1.1, 49.35], [-1.3, 49.65], [-1.95, 49.72], [-1.6, 48.65], [-2.5, 48.55], [-3.5, 48.8], [-4.7, 48.55], [-4.4, 47.95], [-3.2, 47.6], [-2.4, 47.3], [-2.1, 47.0], [-1.9, 46.5], [-1.2, 46.2], [-1.3, 45.6], [-1.3, 44.5], [-6, 44.5], [-6, 40], [25, 40], [25, 54.5], [8.7, 53.9], [6.5, 53.6], [4.8, 53.4]];
  const ENG = [[-8, 56], [-0.1, 56], [0.3, 53.5], [0.3, 52.95], [1.7, 52.7], [1.75, 52.4], [1.6, 52.1], [1.2, 51.8], [0.9, 51.7], [0.6, 51.5], [1.4, 51.35], [1.4, 51.15], [1.0, 50.98], [0.3, 50.75],
    [-0.8, 50.77], [-1.5, 50.72], [-2.5, 50.62], [-3, 50.6], [-8, 50.3]];
  const FRONT = [[2.75, 51.13], [2.86, 51.03], [2.95, 50.85], [2.88, 50.69], [2.8, 50.29], [2.65, 50.0], [2.85, 49.95], [2.8, 49.7], [3.0, 49.58], [3.33, 49.4], [4.03, 49.25],
    [4.95, 49.2], [5.38, 49.16], [5.55, 48.9], [6.05, 48.9], [6.6, 48.6], [7.0, 48.2], [7.1, 47.8], [7.15, 47.47]];
  const COUNTRIES = [{ n: 'İNGİLTERE', en: 'ENGLAND', lon: -1.1, lat: 51.45 }, { n: 'FRANSA', en: 'FRANCE', lon: 2.6, lat: 48.2 }, { n: 'BELÇİKA', en: 'BELGIUM', lon: 4.7, lat: 50.95 },
    { n: 'ALMANYA', en: 'GERMANY', lon: 7.9, lat: 49.7 }, { n: 'İSVİÇRE', en: 'SWITZERLAND', lon: 7.9, lat: 47.2 }, { n: 'Kuzey Denizi', en: 'North Sea', lon: 3.3, lat: 51.9, sea: true }];
  function part(pts, f) {
    if (f >= 1) return pts; if (f <= 0) return [];
    const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const s = L[L.length - 1] * f, out = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (L[i] <= s) out.push(pts[i]); else { const u = (s - L[i - 1]) / (L[i] - L[i - 1]); out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } }
    return out;
  }
  SH.tank_front = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 559;
      const root = el(svg, 'g');
      const M = { x0: 90, x1: W - 90, y0: 230, y1: H - 180 };
      const clipId = 'tkmap' + sd;
      const defs = el(root, 'defs'), cp = el(defs, 'clipPath', { id: clipId });
      el(cp, 'rect', { x: M.x0, y: M.y0, width: M.x1 - M.x0, height: M.y1 - M.y0 });
      const mapG = el(root, 'g', { 'clip-path': `url(#${clipId})` });
      const L = (fill, extra) => inkEl(mapG, fill, extra || {});
      const lay = { sea: L(INK.blue, { 'fill-opacity': 0.5 }), land: L(INK.paperLight), landS: L(INK.paperDark, { 'fill-opacity': 0.7 }), coast: L(INK.inkSoft),
        lineG: L(INK.red, { 'fill-opacity': 0.25 }), line: L(INK.red), tick: L(INK.red), arrows: L(INK.ink), arrowsR: L(INK.red), arrowsB: L(INK.blue), glyph: L(INK.ink), rings: L(INK.red), dots: L(INK.ink) };
      const txG = el(mapG, 'g');
      const EN = typeof LOCALE !== 'undefined' && LOCALE === 'en-US';
      const ctry = P.countries === false ? [] : COUNTRIES.map(c => { const e = el(txG, 'text', { 'font-family': c.sea ? INK_FONT : 'Fraunces, Georgia, serif', 'font-weight': c.sea ? 400 : 800,
        'font-size': c.sea ? 56 : 50, 'letter-spacing': c.sea ? 0 : 8, fill: c.sea ? INK.blue : INK.inkSoft, 'text-anchor': 'middle' }); e.textContent = EN ? c.en : c.n; return { c, e }; });
      const cities = (P.cities || []).map(c => { const e = el(txG, 'text', { 'font-family': INK_FONT, 'font-size': c.size || 56, fill: c.color === 'red' ? INK.red : c.color === 'blue' ? INK.blue : INK.ink,
        'text-anchor': 'middle', stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' }); e.textContent = c.name; return { c, e }; });
      const frame = inkEl(root, INK.ink), comp = inkEl(root, INK.inkSoft), compR = inkEl(root, INK.red);
      const notes = (P.notes || []).map((n, i) => ({ text: n.text, x: n.x, y: n.y, at: n.at, color: n.color || 'red', size: n.size || 72, stamp: n.stamp, rot: n.rot }));
      const labG = el(root, 'g'), castG = el(root, 'g');
      const labs = B.labels(labG, notes, W, H, sd + 70);
      const cast = B.cast(castG, P.kasif ? [Object.assign({ who: 'kasif', scale: 0.5, y: 0.93 }, P.kasif)] : [], W, H, sd + 50);
      const hatch = []; const rr = rng(sd + 3); for (let k = 0; k < 160; k++) hatch.push([rr(), rr()]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.1, w: 5 }, extra || {});
          // view (eased), equirectangular with cos(lat)
          let v = P.view || [-1.0, 9.0, 46.9, 52.3];
          if (P.view2) { const za = at('zoom', null), zp = za == null ? 0 : progIO(lt, za, 1.8); v = v.map((x, i) => lerp(x, P.view2[i], zp)); }
          const lat0 = (v[2] + v[3]) / 2, kx = Math.cos(lat0 * Math.PI / 180);
          const vw = (v[1] - v[0]) * kx, vh = v[3] - v[2], aw = M.x1 - M.x0, ah = M.y1 - M.y0;
          const sc = Math.min(aw / vw, ah / vh) * (1 + 0.02 * progIO(lt, 0, dur));
          const cxl = (v[0] + v[1]) / 2, cyl = (v[2] + v[3]) / 2, mx = (M.x0 + M.x1) / 2, my = (M.y0 + M.y1) / 2;
          const Pj = (lon, lat) => [mx + (lon - cxl) * kx * sc, my - (lat - cyl) * sc];
          const PJ = pts => pts.map(p => Pj(p[0], p[1]));
          // sea hatching across the whole map, land on top
          const SE = [];
          hatch.forEach((h, k) => { const x = M.x0 + h[0] * aw, y = M.y0 + h[1] * ah, d = Math.sin(lt * 1.2 + k) * 4; SE.push(inkPath([[x + d, y], [x + 22 + d, y - 6], [x + 44 + d, y]], { seed: sd + 100 + k, t, w: 2.6, amp: 0.6 })); });
          lay.sea.setAttribute('d', SE.join(' '));
          const cont = PJ(CONT), eng = PJ(ENG);
          lay.land.setAttribute('d', inkLoop(cont, o(1, { smooth: false, amp: 0.8 })) + ' ' + inkLoop(eng, o(2, { smooth: false, amp: 0.8 })));
          lay.landS.setAttribute('d', '');
          lay.coast.setAttribute('d', inkPath(PJ(CONT.slice(0, 18)), o(3, { w: 4.5 })) + ' ' + inkPath(PJ(ENG.slice(2)), o(4, { w: 4.5 })));
          // country names
          ctry.forEach(({ c, e }) => { const p = Pj(c.lon, c.lat); e.setAttribute('x', p[0]); e.setAttribute('y', p[1]); });
          // front line
          if (P.line !== false) {
            const LN = Object.assign({ at: 0.3, dur: 2.5 }, P.line || {}), lp = progIO(lt, at(LN.at, 0.3), LN.dur);
            const pts = PJ(FRONT), q = part(pts, lp);
            if (q.length > 1) {
              const zz = []; for (let i = 1; i < q.length; i++) { const a = q[i - 1], b = q[i], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 16));
                for (let j = 0; j < n; j++) { const u = j / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy) || 1;
                  zz.push([x - dy / ln * 7 * (j % 2 ? 1 : -1), y + dx / ln * 7 * (j % 2 ? 1 : -1)]); } }
              zz.push(q[q.length - 1]);
              lay.line.setAttribute('d', inkPath(zz, o(10, { w: 5, smooth: false })));
              lay.lineG.setAttribute('d', inkPath(q, o(11, { w: 26 })));
              const TK = []; for (let i = 2; i < zz.length; i += 6) { const p = zz[i]; TK.push(inkPath([[p[0] - 9, p[1] - 9], [p[0] + 9, p[1] + 9]], o(20 + i, { w: 3 })), inkPath([[p[0] + 9, p[1] - 9], [p[0] - 9, p[1] + 9]], o(21 + i, { w: 3 }))); }
              lay.tick.setAttribute('d', TK.join(' '));
            } else { lay.line.setAttribute('d', ''); lay.lineG.setAttribute('d', ''); lay.tick.setAttribute('d', ''); }
          }
          // cities
          const RG = [], DT = [];
          cities.forEach(({ c, e }, i) => { const a = at(c.at, 0.4 + i * 0.3), p = Pj(c.lon, c.lat), k = spring(lt, a, 0.5);
            if (lt < a) { e.style.display = 'none'; return; } e.style.display = '';
            DT.push(inkDot(p[0], p[1], 10 * k, 10 * k, sd + 200 + i, t));
            if (c.ring !== false) { const pts = inkEllipsePts(p[0], p[1], 34 * k, 30 * k, sd + 220 + i, 12); RG.push(inkPath(pts, o(220 + i, { closed: true, w: 6 }))); }
            e.setAttribute('x', p[0] + (c.dx || 0)); e.setAttribute('y', p[1] + (c.dy ?? -48)); e.setAttribute('transform', `translate(0 ${((1 - k) * 20).toFixed(1)})`); });
          lay.rings.setAttribute('d', RG.join(' ')); lay.dots.setAttribute('d', DT.join(' '));
          // arrows
          const AK = [], AR = [], AB = [], GL = [];
          (P.arrows || []).forEach((a, i) => { const t0 = at(a.at, 0.6 + i * 0.4), p = progIO(lt, t0, a.dur ?? 1.6); if (p <= 0) return;
            const s0 = Pj(...a.from), s1 = Pj(...a.to), bend = a.bend ?? 0.15, mx2 = (s0[0] + s1[0]) / 2 - (s1[1] - s0[1]) * bend, my2 = (s0[1] + s1[1]) / 2 + (s1[0] - s0[0]) * bend;
            const curve = []; for (let k = 0; k <= 20; k++) { const u = k / 20; curve.push([(1 - u) * (1 - u) * s0[0] + 2 * u * (1 - u) * mx2 + u * u * s1[0], (1 - u) * (1 - u) * s0[1] + 2 * u * (1 - u) * my2 + u * u * s1[1]]); }
            const q = part(curve, p), aw = a.w ?? 8, dash = []; for (let k = 0; k < q.length - 1; k += 2) dash.push(inkPath([q[k], q[k + 1]], o(300 + i * 30 + k, { w: aw })));
            const tip = q[q.length - 1], pr = q[Math.max(0, q.length - 3)], an = Math.atan2(tip[1] - pr[1], tip[0] - pr[0]);
            if (p > 0.95) dash.push(inkPath([[tip[0] - Math.cos(an - 0.5) * 36 * aw / 8, tip[1] - Math.sin(an - 0.5) * 36 * aw / 8], tip, [tip[0] - Math.cos(an + 0.5) * 36 * aw / 8, tip[1] - Math.sin(an + 0.5) * 36 * aw / 8]], o(299 - i, { w: aw, smooth: false })));
            (a.color === 'blue' ? AB : a.color === 'ink' ? AK : AR).push(dash.join(' '));
            if (a.tank && p < 1) { const g = [[-30, 0], [26, 0], [34, -14], [26, -26], [-30, -26], [-36, -12]].map(v2 => [tip[0] + v2[0], tip[1] + v2[1] - 10]); GL.push(inkLoop(g, o(400 + i, { smooth: false }))); } });
          lay.arrows.setAttribute('d', AK.join(' ')); lay.arrowsR.setAttribute('d', AR.join(' ')); lay.arrowsB.setAttribute('d', AB.join(' ')); lay.glyph.setAttribute('d', GL.join(' '));
          // frame + compass
          frame.setAttribute('d', inkPath([[M.x0, M.y0], [M.x1, M.y0], [M.x1, M.y1], [M.x0, M.y1]], o(500, { closed: true, smooth: false, w: 7 })) + ' ' +
            inkPath([[M.x0 + 16, M.y0 + 16], [M.x1 - 16, M.y0 + 16], [M.x1 - 16, M.y1 - 16], [M.x0 + 16, M.y1 - 16]], o(501, { closed: true, smooth: false, w: 2.5 })));
          if (P.compass !== false) { const c = [M.x1 - 120, M.y1 - 120], r = 60, sp = Math.sin(lt * 0.8) * 0.06;
            const star = []; for (let k = 0; k < 8; k++) { const an = -Math.PI / 2 + k * Math.PI / 4 + sp, rr2 = k % 2 ? r * 0.35 : r; star.push([c[0] + Math.cos(an) * rr2, c[1] + Math.sin(an) * rr2]); }
            comp.setAttribute('d', inkPath(star, o(510, { closed: true, smooth: false, w: 3.5 })) + ' ' + inkPath(inkEllipsePts(c[0], c[1], r * 1.15, r * 1.15, sd + 511, 16), o(511, { closed: true, w: 2.5 })));
            compR.setAttribute('d', inkLoop([star[0], star[1], [c[0], c[1]], star[7]], o(512, { smooth: false }))); }
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
