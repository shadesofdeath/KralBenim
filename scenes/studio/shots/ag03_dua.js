// ag03_dua: an old ink map of the 11th-century Seljuk lands (eastern Anatolia, Syria, Iraq, Iran; parchment style,
// brand/kit/BRAND.md §3, §5): Black Sea and Caspian coasts, the Levant coast, Tigris and Euphrates, Lake Van; one
// city after another gets a small domed mosque with a minaret, then a dashed line runs from it to a target city
// (red ring) with a gold dot travelling along it, like prayers converging on one place. Narrator (Kaşif / fez) beside.
// P: {cities: [{name, lon, lat, at, dx, dy}], target: {name: "Malazgirt", lon: 42.53, lat: 39.14, dx, dy},
//     link: cue (lines start drawing, staggered), kasif: {x: 0.1, y: 0.86, scale: 0.62, face: 1, pose, dir, emotion,
//     seq: [{at, pose, dir, emotion}]} | false, zoom: 1.06}
// cues: city "at" names, link
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);
  const LON0 = 31.5, LON1 = 56, LAT0 = 30.4, LAT1 = 42.6, KX = Math.cos(36.5 * Math.PI / 180);
  const BLACK = [[31, 43], [31, 41.2], [32.5, 41.85], [33.5, 42.0], [35.0, 42.05], [36.0, 41.7], [37.0, 41.15], [38.5, 40.95], [40.0, 40.95], [41.5, 41.5], [41.7, 42.3], [41.9, 43]];
  const CASP = [[47.6, 43], [48.6, 41.8], [49.2, 41.0], [49.5, 40.3], [49.3, 39.5], [48.9, 38.4], [49.0, 37.6], [50.3, 37.2], [51.5, 36.8], [53.0, 36.9], [54.0, 37.3], [53.9, 38.5], [53.2, 39.3], [53.0, 40.5], [52.8, 41.6], [52.6, 43]];
  const MED = [[30, 36.4], [32, 36.1], [33.5, 36.2], [34.6, 36.8], [35.8, 36.8], [36.2, 36.6], [35.9, 35.9], [35.8, 35.3], [35.9, 34.6], [35.5, 33.9], [35.1, 33.1], [34.9, 32.4], [34.5, 31.6], [34.2, 31.2], [34.0, 30.0], [30, 30]];
  const GULF = [[47.6, 30.0], [48.0, 30.0], [48.6, 30.1], [49.4, 30.1], [50.2, 29.9], [50.6, 29.3], [47.6, 29.3]];
  const VAN = [[42.3, 38.6], [42.9, 38.95], [43.5, 38.8], [43.3, 38.4], [42.6, 38.3]];
  const URMIA = [[45.3, 38.0], [45.6, 38.2], [45.9, 37.9], [45.7, 37.3], [45.4, 37.5]];
  const FIRAT = [[39.6, 39.7], [38.9, 38.8], [38.3, 37.6], [38.0, 36.8], [38.4, 35.9], [40.1, 35.1], [41.4, 34.4], [42.8, 34.0], [43.9, 32.9], [45.3, 31.9], [46.5, 31.0], [47.6, 30.1]];
  const DICLE = [[40.2, 38.4], [41.2, 37.8], [42.4, 37.3], [43.1, 36.3], [43.7, 35.0], [44.4, 33.3], [45.3, 32.6], [46.4, 31.6], [47.6, 30.1]];

  SH.ag03_dua = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const sd = seed * 1000 + 917;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const sc = 58, mw = (LON1 - LON0) * KX * sc, mh = (LAT1 - LAT0) * sc;
      const X0 = W * 0.6 - mw / 2, Y0 = H * 0.47 - mh / 2;
      const PX = (lon, lat) => [X0 + (lon - LON0) * KX * sc, Y0 + (LAT1 - lat) * sc];
      const sheet = [[X0, Y0], [X0 + mw, Y0], [X0 + mw, Y0 + mh], [X0, Y0 + mh]];
      const shadowF = mk(cam, INK.stain, { 'fill-opacity': 0.25 });
      const sheetF = mk(cam, INK.paperLight), sheetR = mk(cam);
      const cid = 'duaclip' + seed;
      const cp = el(defs, 'clipPath', { id: cid }); el(cp, 'rect', { x: X0 + 8, y: Y0 + 8, width: mw - 16, height: mh - 16 });
      const mg = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const seaF = mk(mg, INK.paperDark, { 'fill-opacity': 0.8 }), coastR = mk(mg, INK.inkSoft), riverR = mk(mg, INK.blue, { 'fill-opacity': 0.75 });
      const waveR = mk(mg, INK.inkSoft);
      const linkR = mk(mg, INK.inkSoft), dotsF = mk(mg, INK.gold);
      const tgtF = mk(mg, INK.red), tgtR = mk(mg, INK.red);
      const cityG = el(mg, 'g');
      const mosqF = mk(cityG, INK.paperLight), mosqD = mk(cityG, INK.gold), mosqR = mk(cityG);
      const labs = el(cam, 'g');
      const lab = (txt, size, col) => { const t = el(labs, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: col, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` }); t.textContent = txt; return t; };
      const T = Object.assign({ name: 'Malazgirt', lon: 42.53, lat: 39.14 }, P.target || {});
      const tp = PX(T.lon, T.lat), tLab = lab(T.name, 60, INK.red);
      const cities = (P.cities || []).map((c, i) => ({ c, p: PX(c.lon, c.lat), t: lab(c.name, 54, INK.ink), i }));
      const K = P.kasif === false ? null : Object.assign({ x: 0.1, y: 0.86, scale: 0.62, face: 1, pose: 'idle' }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: 1, hat: true, seed: sd + 5 }) : null;
      let last = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== last; last = step;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const pin = spring(lt, 0, 0.7), z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0.2, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(tp[0])} ${f1(tp[1] + (1 - pin) * 50)}) scale(${z.toFixed(4)}) rotate(${f1(-0.4 + Math.sin(lt * 0.3) * 0.3)}) translate(${f1(-tp[0])} ${f1(-tp[1])})`);
          if (redraw || lt < 0.05) {
            shadowF.setAttribute('d', inkLoop(sheet.map(p => [p[0] + 12, p[1] + 14]), O(1, { smooth: false })));
            sheetF.setAttribute('d', inkLoop(sheet, O(2, { smooth: false })));
            sheetR.setAttribute('d', inkPath(inkLinear(sheet, true, 60), O(3, { closed: true, w: 4, smooth: false })) + ' ' + inkPath(inkLinear(sheet.map((p, i) => [p[0] + (i === 0 || i === 3 ? 18 : -18), p[1] + (i < 2 ? 18 : -18)]), true, 60), O(4, { closed: true, w: 2.5, smooth: false })));
            const polys = [BLACK, CASP, MED, GULF, VAN, URMIA].map(pl => pl.map(q => PX(q[0], q[1])));
            seaF.setAttribute('d', polys.map((pl, i) => inkLoop(pl, O(10 + i))).join(' '));
            coastR.setAttribute('d', polys.map((pl, i) => inkPath(pl, O(20 + i, { closed: true, w: 4 }))).join(' '));
            riverR.setAttribute('d', [FIRAT, DICLE].map((rv, i) => inkPath(rv.map(q => PX(q[0], q[1])), O(30 + i, { w: 4.5, taper: 0.6 }))).join(' '));
            const wv = [[33.5, 41.4], [37.5, 41.6], [50.8, 39.5], [32.4, 33.8], [33.2, 31.6]].map(q => PX(q[0], q[1]));
            waveR.setAttribute('d', wv.map((p, i) => inkPath([[p[0] - 30, p[1]], [p[0] - 15, p[1] - 8], [p[0], p[1]], [p[0] + 15, p[1] - 8], [p[0] + 30, p[1]]], O(40 + i, { w: 2.5 }))).join(' '));
          }
          // target city
          const lk = atOr(cues, P.link, Math.max(1, dur * 0.55));
          const tg = punch(lt, lk + 1.4, 0.8);
          tgtF.setAttribute('d', inkDot(tp[0], tp[1], 13, 13, sd + 50, t));
          tgtR.setAttribute('d', inkPath(inkEllipsePts(tp[0], tp[1], 36 * (1 + 0.35 * tg), 30 * (1 + 0.35 * tg), sd + 51, 12), O(51, { closed: true, w: 6 })));
          tLab.setAttribute('x', f1(tp[0] + (T.dx ?? 0))); tLab.setAttribute('y', f1(tp[1] + (T.dy ?? -54)));
          // mosques, labels, links
          let mf = '', md = '', mr = '', ln = '', dt = '';
          cities.forEach(C => {
            const a = atOr(cues, C.c.at, 0.4 + C.i * 0.6), p = lt >= a ? spring(lt, a, 0.6) : 0;
            C.t.setAttribute('opacity', clamp01(p * 2));
            C.t.setAttribute('x', f1(C.p[0] + (C.c.dx ?? 0))); C.t.setAttribute('y', f1(C.p[1] + (C.c.dy ?? 62)));
            if (p > 0.01) {
              const s = p, x = C.p[0], y = C.p[1] + 10, Q = k => O(100 + C.i * 20 + k, { amp: 1 });
              const base = [[x - 34 * s, y], [x - 34 * s, y - 34 * s], [x + 34 * s, y - 34 * s], [x + 34 * s, y]];
              const dome = []; for (let q = 0; q <= 8; q++) { const aa = Math.PI + q / 8 * Math.PI; dome.push([x + Math.cos(aa) * 30 * s, y - 34 * s + Math.sin(aa) * 30 * s]); }
              const mn = [[x + 42 * s, y], [x + 42 * s, y - 92 * s], [x + 50 * s, y - 110 * s], [x + 58 * s, y - 92 * s], [x + 58 * s, y]];
              mf += inkLoop(base, Q(1)) + ' ' + inkLoop(mn, Q(2)) + ' ';
              md += inkLoop(dome, Q(3)) + ' ';
              mr += (inkPath(base, Object.assign(Q(4), { closed: true, w: 4, smooth: false })) + ' ' + inkPath(dome, Object.assign(Q(5), { w: 4 })) + ' ' +
                inkPath(mn, Object.assign(Q(6), { closed: true, w: 3.5, smooth: false })) + ' ' + inkPath([[x, y - 64 * s], [x, y - 78 * s]], Object.assign(Q(7), { w: 3 })) + ' ' +
                inkPath([[x - 10 * s, y], [x - 10 * s, y - 16 * s], [x + 10 * s, y - 16 * s], [x + 10 * s, y]], Object.assign(Q(8), { w: 3 })) + ' ');
            }
            // dashed link to the target, then a gold dot travelling along it
            const la = lk + C.i * 0.35, lp = lt >= la ? progIO(lt, la, 1.1) : 0;
            if (lp > 0) {
              const mid = [(C.p[0] + tp[0]) / 2, (C.p[1] + tp[1]) / 2 - 60];
              const B = u => [(1 - u) * (1 - u) * C.p[0] + 2 * (1 - u) * u * mid[0] + u * u * tp[0], (1 - u) * (1 - u) * C.p[1] + 2 * (1 - u) * u * mid[1] + u * u * tp[1]];
              for (let q = 0; q < 16; q++) {
                const u0 = q / 16, u1 = u0 + 0.6 / 16;
                if (u0 > lp) break;
                ln += inkPath([B(u0), B(Math.min(u1, lp))], O(300 + C.i * 20 + q, { w: 4, amp: 0.8 })) + ' ';
              }
              if (lp >= 1) { const u = ((lt - la - 1.1) * 0.5) % 1, q = B(u); dt += inkDot(q[0], q[1], 9, 9, sd + 400 + C.i, t) + ' '; }
            }
          });
          mosqF.setAttribute('d', mf); mosqD.setAttribute('d', md); mosqR.setAttribute('d', mr);
          linkR.setAttribute('d', ln); dotsF.setAttribute('d', dt);
          if (kas) {
            const Lg = [{ at: -1, pose: K.pose, dir: K.dir, face: K.face, emotion: K.emotion }];
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) Lg.push(Object.assign({}, s, { at: a })); });
            Lg.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < Lg.length; j++) if (lt >= Lg[j].at) i = j;
            const s = Lg[i], pv = i > 0 ? Lg[i - 1] : null, since = lt - Math.max(0, s.at);
            const o = { x: K.x * W, y: K.y * H, scale: K.scale, face: faceOf(s.face ?? K.face), since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: 0 };
            if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
            kas.update(t, s.pose, o);
          }
        },
      };
    },
  };
})();
