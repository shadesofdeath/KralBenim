// ce_map: old parchment map of North America and the Caribbean; an aurora curtain (red rays, gold veil, green hem)
// spreads south across it from the Arctic down to a chosen latitude, a dashed "front" line follows it, a target place
// (e.g. Cuba) gets a red ring. Carrington Event Short (Stickstory 2026-10-26); parametric for any "seen as far south
// as ..." story in the Americas. Uses ce__lib.js (CE) and td__lib.js (TD.label). Palette tokens only, boil 8 Hz.
// P: {
//   band: 190 (px height of the moving aurora curtain), op: 0.55 (its fill strength; land stays readable),
//   from: 62, to: 22 (aurora hem latitude: start -> end), at: cue|sec (starts moving), dur: 2.2,
//   target: {name: "CUBA", lon: -79.5, lat: 21.8, at: cue (red ring + name)} | false,
//   cities: [{name, lon, lat, at, dx, dy}],
//   kasif: K | false, labels: [...], compass: true
// }   cues: hit (punch), at, target.at, city names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  // simplified coastlines [lon, lat]
  const NA = [[-135, 70], [-135, 58], [-130, 55], [-127, 50.5], [-124.5, 48.4], [-124, 46], [-124.3, 42], [-122.5, 37.8], [-120.6, 34.6], [-117.2, 32.6],
    [-115.8, 30.4], [-114.2, 28], [-112.4, 25.8], [-110, 23], [-109.6, 23.2], [-111.2, 26.5], [-112.8, 29.6], [-114.6, 31.6], [-113.2, 31.2], [-110.8, 27.8],
    [-109, 25.5], [-106, 23], [-105.4, 20.4], [-103.8, 18.6], [-100, 16.9], [-96.5, 15.7], [-94, 16], [-92.2, 14.6], [-90, 13.6], [-87.5, 13], [-85.8, 11],
    [-85.7, 9.9], [-83.6, 8.5], [-81, 7.6], [-80, 7], [-77.4, 8], [-77.8, 9.2], [-79.6, 9.6], [-81.5, 8.9], [-83.5, 10.9], [-83.7, 13.5], [-83.3, 15],
    [-86, 15.9], [-88.2, 15.8], [-88.3, 17.5], [-87.5, 19.5], [-86.8, 21.4], [-88.5, 21.5], [-90.4, 21], [-90.6, 19.4], [-91.8, 18.5], [-94.5, 18.2],
    [-96, 19.2], [-97.2, 21.4], [-97.7, 24], [-97.2, 27.8], [-94.6, 29.4], [-91.2, 29.3], [-89.4, 29], [-89.2, 30.3], [-87.5, 30.3], [-85.2, 29.7], [-83.6, 29.6],
    [-82.7, 27.6], [-81.2, 25.2], [-80.4, 25.4], [-80.1, 26.8], [-80.8, 29.5], [-81.4, 31.4], [-79.2, 33.1], [-76.4, 34.8], [-75.8, 36.4], [-76.2, 37.4],
    [-75.2, 38.4], [-74, 40.3], [-72, 40.9], [-70.6, 41.5], [-70, 41.8], [-70.6, 42.6], [-70.2, 43.7], [-68.6, 44.3], [-67, 44.7], [-66.1, 44.9], [-64.4, 45.4],
    [-65.6, 43.6], [-63.6, 44.4], [-61.2, 45.4], [-60, 46], [-61.6, 46.3], [-64.5, 46.6], [-64.9, 48.6], [-66.2, 49.2], [-62.5, 50], [-59.3, 50.3],
    [-55.8, 52], [-57.3, 54.6], [-60.5, 56], [-62.4, 57.8], [-64.6, 60.3], [-70, 59], [-74, 62], [-80, 63], [-95, 66], [-120, 70]];
  const HUDSON = [[-94.5, 59], [-92.4, 57.2], [-88.4, 56.4], [-85, 55.3], [-82.3, 55.2], [-79.4, 51.6], [-78.8, 54.8], [-77, 58.5], [-78.3, 61], [-82, 62.8], [-89, 64], [-94, 61.6]];
  const ISLANDS = [
    [[-84.9, 21.9], [-83, 22.9], [-81, 23.2], [-79.3, 22.4], [-77.2, 21.6], [-75.6, 20.7], [-74.2, 20.2], [-75.4, 19.9], [-77.7, 19.85], [-78.3, 20.9], [-80.6, 21.9], [-82.6, 22.2]],
    [[-74.4, 19.9], [-72.6, 19.9], [-70, 19.8], [-68.4, 18.6], [-70, 18.2], [-71.6, 17.7], [-73.6, 18.2], [-72.8, 18.9]],
    [[-78.3, 18.4], [-76.3, 18.2], [-76.9, 17.9], [-77.9, 18]],
    [[-67.2, 18.5], [-65.6, 18.4], [-65.7, 18], [-67.2, 18]],
    [[-55.7, 51.6], [-53, 49.4], [-52.7, 47.6], [-53.6, 46.7], [-56, 47.6], [-59.3, 47.7], [-57.6, 50.5]],
  ];
  const LAKES = [[[-92, 46.7], [-88.2, 48.6], [-84.8, 46.8], [-87.5, 46.4]], [[-87.8, 42], [-86.4, 44.9], [-84.8, 45.8], [-86.2, 42.4]], [[-83.5, 41.7], [-79.2, 42.6], [-80.6, 43.4], [-82.4, 42.6]], [[-79.8, 43.3], [-76.2, 44.1], [-76.6, 43.5]]];

  SH.ce_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const CE = window.CE, TD = window.TD, f1 = CE.f1, atOr = CE.atOr, sd = seed * 1000 + 811, portrait = H > W;
      const S = portrait ? { x: 60, y: 340, w: 960, h: 800 } : { x: (W - 1100) / 2, y: 150, w: 1100, h: 700 };
      const B = [-128, -58, 10, 64], kx = Math.cos(36 * Math.PI / 180);
      const sc = Math.min(S.w / ((B[1] - B[0]) * kx), S.h / (B[3] - B[2]));
      const cx0 = S.x + S.w / 2, cy0 = S.y + S.h / 2, lonC = (B[0] + B[1]) / 2, latC = (B[2] + B[3]) / 2;
      const PX = (lon, lat) => [cx0 + (lon - lonC) * kx * sc, cy0 - (lat - latC) * sc];
      const root = el(svg, 'g');
      const id = 'cemap' + seed + '_' + (sd % 997);
      const cp = el(defs || svg, 'clipPath', { id }); el(cp, 'rect', { x: S.x, y: S.y, width: S.w, height: S.h });
      const cam = el(root, 'g'), clipG = el(cam, 'g', { 'clip-path': `url(#${id})` });
      const sheetF = inkEl(clipG, INK.paperLight, { 'fill-opacity': 0.55 });
      const grid = inkEl(clipG, INK.inkSoft, { 'fill-opacity': 0.55 });
      const landF = inkEl(clipG, INK.paperDark), lakeF = inkEl(clipG, INK.paperLight, { 'fill-opacity': 0.8 }), landR = inkEl(clipG), waves = inkEl(clipG, INK.inkSoft);
      const au = CE.aurora(clipG, sd + 3), front = inkEl(clipG, INK.red);
      const frame = inkEl(cam);
      const tgtR = inkEl(cam, INK.red), dots = inkEl(cam, INK.ink);
      const txtG = el(cam, 'g');
      const T = P.target === false ? null : Object.assign({ name: 'CUBA', lon: -79.5, lat: 21.8 }, P.target || {});
      const mk = (s, size, col) => { const n = el(txtG, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: col || INK.ink }); n.textContent = s; return n; };
      const tName = T ? mk(T.name, 64, INK.red) : null;
      const cities = (P.cities || []).map(c => Object.assign({ node: mk(c.name, 46) }, c));
      const latT = el(txtG, 'text', { 'font-family': INK_FONT, 'font-size': 46, 'text-anchor': 'start', fill: INK.red });
      const kas = P.kasif ? CE.fig(el(root, 'g'), Object.assign({ x: 0.84, y: 0.6, scale: 0.7, pose: 'point', face: 'left', dir: 20 }, P.kasif), sd + 80) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      const land = NA.map(([a, b]) => PX(a, b)), hud = HUDSON.map(([a, b]) => PX(a, b));
      const isl = ISLANDS.map(I => I.map(([a, b]) => PX(a, b))), lakes = LAKES.map(I => I.map(([a, b]) => PX(a, b)));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const a0 = atOr(cues, P.at, 0.2), mp = lt >= a0 ? progIO(lt, a0, P.dur ?? 2.2) : 0;
          const ta = T ? atOr(cues, T.at, a0 + (P.dur ?? 2.2)) : null;
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          const foc = T ? PX(T.lon, T.lat) : [W / 2, H / 2];
          const fx = lerp(W / 2, foc[0], 0.35), fy = lerp(S.y + S.h / 2, foc[1], 0.35);
          cam.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const SR = CE.rect(S.x, S.y, S.w, S.h);
          sheetF.setAttribute('d', inkLoop(SR, { seed: sd + 1, t, amp: 1, smooth: false }));
          frame.setAttribute('d', inkPath(SR, { w: 7, seed: sd + 2, t, closed: true, amp: 1, smooth: false }));
          let gd = '';
          for (let lat = 20; lat <= 60; lat += 20) { const a = PX(B[0] - 10, lat), b = PX(B[1] + 10, lat); gd += inkPath([a, b], { w: 2.5, seed: sd + lat, t, amp: 0.8 }) + ' '; }
          for (let lon = -120; lon <= -60; lon += 20) { const a = PX(lon, B[2] - 5), b = PX(lon, B[3] + 5); gd += inkPath([a, b], { w: 2.5, seed: sd + 200 + lon, t, amp: 0.8 }) + ' '; }
          grid.setAttribute('d', gd);
          landF.setAttribute('d', inkLoop(land, { seed: sd + 3, t, amp: 1.2, smooth: false }) + ' ' + isl.map((I, i) => inkLoop(I, { seed: sd + 10 + i, t, amp: 0.8 })).join(' '));
          lakeF.setAttribute('d', inkLoop(hud, { seed: sd + 4, t, amp: 1 }) + ' ' + lakes.map((I, i) => inkLoop(I, { seed: sd + 30 + i, t, amp: 0.6 })).join(' '));
          landR.setAttribute('d', inkPath(land, { w: 5, seed: sd + 5, t, closed: true, amp: 1.2, smooth: false }) + ' ' + inkPath(hud, { w: 4, seed: sd + 6, t, closed: true, amp: 1 }) + ' ' +
            isl.map((I, i) => inkPath(I, { w: 4, seed: sd + 20 + i, t, closed: true, amp: 0.8 })).join(' ') + ' ' + lakes.map((I, i) => inkPath(I, { w: 3, seed: sd + 40 + i, t, closed: true, amp: 0.6 })).join(' '));
          let wd = '';
          for (const [k, [lo, la]] of [[0, [-140, 30]], [1, [-125, 18]], [2, [-50, 35]], [3, [-60, 25]], [4, [-95, 24.5]]].entries()) {
            const q = PX(lo, la);
            wd += inkPath([[q[0] - 30, q[1]], [q[0] - 15, q[1] - 8], [q[0], q[1]], [q[0] + 15, q[1] - 8], [q[0] + 30, q[1]]], { w: 3.5, seed: sd + 60 + k, t: t + k, amp: 0.8 }) + ' ';
            void k;
          }
          waves.setAttribute('d', wd);
          // aurora: hem latitude moves from P.from to P.to
          const hemLat = lerp(P.from ?? 62, P.to ?? 22, mp), hy = PX(0, hemLat)[1];
          au.update(t, { x0: S.x - 60, x1: S.x + S.w + 60, y: hy, h: P.band ?? 190, amp: 18, p: 1, rise: clamp01(mp * 4), k: 1.2, tilt: -30, bright: punch(lt, ta, 0.6), op: P.op ?? 0.55 });
          let fd = '';
          if (mp > 0.02) for (let k = 0; k < 14; k++) { const x0 = S.x + k * S.w / 14 + 10, x1 = x0 + S.w / 28; fd += inkPath([[x0, hy + 34 - 30 * (x0 - S.x) / S.w], [x1, hy + 34 - 30 * (x1 - S.x) / S.w]], { w: 5, seed: sd + 70 + k, t, amp: 0.8 }) + ' '; }
          front.setAttribute('d', fd);
          if (mp > 0.02) {
            latT.textContent = `${Math.round(hemLat)}°N`;
            latT.setAttribute('x', f1(S.x + 18)); latT.setAttribute('y', f1(hy + 84));
            latT.setAttribute('opacity', '1');
          } else latT.setAttribute('opacity', '0');
          let dd = '', rr = '';
          if (T) {
            const q = PX(T.lon, T.lat), p = lt >= ta ? spring(lt, ta, 0.6) : 0;
            const R = 92 * p * (1 + 0.1 * punch(lt, ta, 0.6));
            if (p > 0.02) rr += inkCircle(q[0], q[1], R, sd + 90, t, { w: 9, ry: R * 0.62 }) + ' ';
            tName.setAttribute('x', f1(q[0] + 30)); tName.setAttribute('y', f1(q[1] + 130));
            tName.setAttribute('opacity', clamp01(p * 2).toFixed(3));
          }
          cities.forEach((c, i) => {
            const q = PX(c.lon, c.lat), a = atOr(cues, c.at, 0.3), p = lt >= a ? spring(lt, a, 0.5) : 0;
            if (p > 0.02) dd += inkDot(q[0], q[1], 11 * p, 11 * p, sd + 110 + i, t) + ' ';
            c.node.setAttribute('x', f1(q[0] + (c.dx ?? 0))); c.node.setAttribute('y', f1(q[1] + (c.dy ?? -26)));
            c.node.setAttribute('opacity', clamp01(p * 2).toFixed(3));
          });
          tgtR.setAttribute('d', rr); dots.setAttribute('d', dd);
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
