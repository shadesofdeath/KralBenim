// tbA_world: farm fields, a colonial garrison, the open sea and a sound map in parchment ink (brand/kit/BRAND.md §3,
// §5) — written for ag-04-tambora-1816, parametric for other weather / sea / sound stories. Every line boils at 8 Hz
// (_ink.js); everything is a pure function of (seed, lt), no Math.random. Needs mcB__lib.js (window.MCB).
//
// SHOTS.tbA_field — farmland in summer: rows of corn (and/or wheat), a farmhouse with a red barn, a fence, a sun.
//   P: {ground: 0.7 (0..1 H), crops: [{type: "corn"|"wheat", from: 0, to: 1, wilt: cue (droop + turn brown),
//       flat: cue (wheat beaten flat)}], house: {x: 0.8, barn: true} | false, fence: true, sun: {x, y, dim: cue} | false,
//       snow: {at: 0, heavy: cue, settle: true} | false (falling flakes, white caps that grow on the ground and roofs),
//       rain: {at: cue, from: 0.5, to: 1} | false (dark cloud + rain streaks over that x range), divider: 0.5 (dashed),
//       cast, labels, cam}   cues: snow.heavy, crops[].wilt/flat, rain.at, sun.dim, cast/label names.
// SHOTS.tbA_java — a tropical garrison: palms, a stone fort wall with a flag (Union-style), soldiers marching
//   (cast entries), and booms rolling in from the horizon: on each `booms` cue sound arcs race in from the right
//   and a "BOOM!" word punches. P: {booms: [cue|s, ...], boom_text: "BOOM!", from: [1.05, 0.42], flag: true, cast, labels, cam}
// SHOTS.tbA_sea — open sea with a horizon. mode "search": rowboats (P.boats) pull out from a beach on the left with
//   crew (cast entries inside each boat), a red dashed "ghost ship" waits on the horizon (P.ghost {x, at, cross: cue
//   -> red X}). mode "pumice": a three-masted ship sails through rafts of floating stone (P.ship {x, to, crew: [...]}).
//   P.far_volcano: {x: 0.9, at} — a tiny volcano on the horizon whose plume rises from that cue.
//   P: {mode, horizon: 0.5, beach: true, boats: [{x, to, at, dur, crew: [...cast]}], ghost, ship, rafts: 0..1 density,
//       cast, labels, cam}
// SHOTS.tbA_sound — a parchment map sheet (land polygons in [lon, lat], default: Indonesia + north Australia) with a
//   volcano marker; sound rings pulse out from it, and on cue `ring` a red dashed circle of P.km radius draws round
//   with a radius line. P: {bounds: [lon0, lon1, lat0, lat1], src: [118, -8.25], km: 2500, names: [{name, x, y}],
//   sheet: {x, y, w, h} (0..1), cast, labels, cam}   cues: ring, cast/label names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const J = a => a.filter(Boolean).join(' ');
  const ff = v => Math.round(v * 10) / 10;
  const puff = (cx, cy, r, k0, t, n = 14, wob = 0.13, fy = 0.9) => { const pts = []; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, q = r * (1 + wob * Math.sin(k * 2.7 + t * 3 + k0) + (k % 2 ? 0.08 : -0.03)); pts.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q * fy]); } return pts; };

  // ================================================================== tbA_field
  SH.tbA_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1816;
      const GY = (P.ground ?? 0.7) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = { sun: inkEl(cam, INK.gold), sunR: inkEl(cam), cloud: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.85 }), cloudR: inkEl(cam),
        hills: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.6 }), hillsR: inkEl(cam, INK.inkSoft),
        barn: inkEl(cam, INK.red, { 'fill-opacity': 0.85 }), house: inkEl(cam, INK.paperLight), roof: inkEl(cam, INK.inkSoft), houseR: inkEl(cam), roofSnow: inkEl(cam, INK.paperLight), roofSnowR: inkEl(cam, INK.inkSoft),
        ground: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 }), groundR: inkEl(cam),
        fence: inkEl(cam, INK.hat), fenceR: inkEl(cam),
        stem: inkEl(cam, INK.green), stemB: inkEl(cam, INK.inkSoft), leafR: inkEl(cam), wheat: inkEl(cam, INK.gold), wheatR: inkEl(cam, INK.inkSoft),
        snowCap: inkEl(cam, INK.paperLight), snowCapR: inkEl(cam, INK.inkSoft), div: inkEl(cam, INK.inkSoft),
        rain: inkEl(cam, INK.blue), flakes: inkEl(cam, INK.paperLight), flakesR: inkEl(cam, INK.inkSoft) };
      const castG = el(cam, 'g');
      cam.appendChild(L.rain); cam.appendChild(L.flakes); cam.appendChild(L.flakesR);
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const R = rng(sd + 3);
      const crops = (P.crops || [{ type: 'corn', from: 0, to: 1 }]);
      const plants = [];
      crops.forEach((c, ci) => { const rows = 3; for (let r = 0; r < rows; r++) { const n = Math.round((c.to - c.from) * (c.type === 'wheat' ? 26 : 13)), y = GY + 24 + r * 66;
        for (let i = 0; i < n; i++) plants.push({ c, ci, x: (c.from + (i + 0.5 + (r % 2) * 0.4) / n * (c.to - c.from)) * W, y, s: 1.0 + r * 0.22, k: plants.length, j: R() }); } });
      plants.sort((a, b) => a.y - b.y);
      const flakes = Array.from({ length: 70 }, () => ({ x: R(), y: R(), v: 0.6 + R() * 0.5, s: 7 + R() * 7, d: R() * 6 }));
      const drops = Array.from({ length: 46 }, () => ({ x: R(), y: R(), v: 1.4 + R() * 0.6 }));
      const house = P.house === false ? null : Object.assign({ x: 0.8, barn: true }, P.house || {});

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const snow = P.snow === false || P.snow == null ? null : Object.assign({ at: 0, settle: true }, P.snow);
          const sa = snow ? atOr(cues, snow.at, 0) : null, heavy = snow ? atOr(cues, snow.heavy, null) : null;
          const rain = P.rain ? Object.assign({ from: 0.5, to: 1 }, P.rain) : null, ra = rain ? atOr(cues, rain.at, 0.5) : null;
          const pk = Math.max(punch(lt, heavy, 0.6), punch(lt, ra, 0.6), ...crops.map(c => Math.max(punch(lt, atOr(cues, c.wilt, null), 0.6), punch(lt, atOr(cues, c.flat, null), 0.6))));
          camPush(cam, lt, dur, W, H, P.cam || {}, pk, 0);
          // sun
          if (P.sun !== false) { const s = Object.assign({ x: 0.16, y: 0.2 }, P.sun || {}), sx = s.x * W, sy = s.y * H, dm = atOr(cues, s.dim, null), d = dm != null ? prog(lt, dm, 0.8) : 0;
            const rays = []; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + t * 0.2, r2 = lerp(132, 100, d) + 6 * Math.sin(t * 3 + k); rays.push(inkPath([[sx + Math.cos(a) * 88, sy + Math.sin(a) * 88], [sx + Math.cos(a) * r2, sy + Math.sin(a) * r2]], { w: 6, seed: sd + 10 + k, t, amp: 1 })); }
            L.sun.setAttribute('d', inkCircle(sx, sy, 66, sd + 30, t, { fill: true })); L.sunR.setAttribute('d', J([inkCircle(sx, sy, 66, sd + 31, t, { w: 6 }), ...rays])); }
          // far hills
          const hp = []; for (let x = -40; x <= W + 40; x += 48) hp.push([x, GY - 70 - 50 * Math.sin(x * 0.0042 + 1) - 26 * Math.sin(x * 0.011)]);
          L.hills.setAttribute('d', inkLoop(hp.concat([[W + 40, GY + 10], [-40, GY + 10]]), { seed: sd + 40, t, amp: 0.8, smooth: false }));
          L.hillsR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 41, t, amp: 1 }));
          // rain cloud
          if (rain && lt >= ra - 0.6) { const cp = spring(lt, ra - 0.6, 0.8), x0 = rain.from * W, x1 = rain.to * W, cy = 0.15 * H, cf = [], cr = [];
            for (let k = 0; k < 6; k++) { const cx = lerp(x0 + 80, x1 - 80, k / 5) + Math.sin(t * 0.7 + k) * 10, r = (90 + (k % 2) * 30) * cp;
              const pts = puff(cx, cy + (k % 2) * 30, r, k, t, 14, 0.1, 0.6); cf.push(inkLoop(pts, { seed: sd + 50 + k, t, amp: 1.2 })); cr.push(inkPath(pts, { w: 4, seed: sd + 60 + k, t, closed: true })); }
            L.cloud.setAttribute('d', J(cf)); L.cloudR.setAttribute('d', J(cr));
            if (lt >= ra) { const rp = clamp01((lt - ra) / 0.4), dr = [];
              drops.forEach((d, k) => { if (k / drops.length > rp) return; const x = lerp(x0 + 40, x1 - 40, d.x) - ((d.y + (lt - ra) * d.v) % 1) * 60, y = cy + 60 + ((d.y + (lt - ra) * d.v) % 1) * (GY + 120 - cy);
                dr.push(inkPath([[x, y], [x - 14, y + 46]], { w: 4, seed: sd + 70 + k, t, amp: 0.5, taper: 0.6 })); });
              L.rain.setAttribute('d', J(dr)); } }
          // house + barn
          const snowK = snow && snow.settle ? clamp01((lt - sa) / 6) * (heavy != null && lt > heavy ? 1.6 : 1) : 0;
          if (house) { const x = house.x * W, y = GY + 4, bw = 230, bh = 150;
            const body = [[x - bw / 2, y - bh], [x + bw / 2, y - bh], [x + bw / 2, y], [x - bw / 2, y]], roof = [[x - bw / 2 - 26, y - bh + 4], [x, y - bh - 110], [x + bw / 2 + 26, y - bh + 4]];
            const bx = x - 270, barnB = [[bx - 110, y - 160], [bx + 110, y - 160], [bx + 110, y], [bx - 110, y]], barnR = [[bx - 130, y - 156], [bx - 70, y - 230], [bx + 70, y - 230], [bx + 130, y - 156]];
            L.house.setAttribute('d', inkLoop(body, { seed: sd + 80, t, amp: 0.8, smooth: false }));
            L.barn.setAttribute('d', house.barn ? inkLoop(barnB, { seed: sd + 81, t, amp: 0.8, smooth: false }) : '');
            L.roof.setAttribute('d', J([inkLoop(roof, { seed: sd + 82, t, amp: 0.8, smooth: false }), house.barn ? inkLoop(barnR, { seed: sd + 83, t, amp: 0.8, smooth: false }) : '']));
            const win = (wx, wy) => [[wx - 26, wy - 26], [wx + 26, wy - 26], [wx + 26, wy + 26], [wx - 26, wy + 26]];
            L.houseR.setAttribute('d', J([inkPath(body, { w: 5, seed: sd + 84, t, closed: true, smooth: false }), inkPath(roof, { w: 5, seed: sd + 85, t, closed: true, smooth: false }),
              inkPath(win(x - 60, y - 90), { w: 4, seed: sd + 86, t, closed: true, smooth: false }), inkPath(win(x + 60, y - 90), { w: 4, seed: sd + 87, t, closed: true, smooth: false }),
              inkPath([[x - 22, y], [x - 22, y - 70], [x + 22, y - 70], [x + 22, y]], { w: 4, seed: sd + 88, t, smooth: false }),
              ...(house.barn ? [inkPath(barnB, { w: 5, seed: sd + 89, t, closed: true, smooth: false }), inkPath(barnR, { w: 5, seed: sd + 90, t, closed: true, smooth: false }),
                inkPath([[bx - 50, y], [bx - 50, y - 100], [bx + 50, y - 100], [bx + 50, y], [bx - 50, y - 100], [bx + 50, y]], { w: 4, seed: sd + 91, t, smooth: false, amp: 0.8 })] : [])]));
            if (snowK > 0.02) { const th = 8 + 22 * Math.min(1, snowK);
              const cap = (a, b, c) => [a, b, c, [c[0] - 6, c[1] + th * 0.6], [b[0], b[1] + th], [a[0] + 6, a[1] + th * 0.6]];
              const caps = [cap(roof[0], roof[1], roof[2])]; if (house.barn) caps.push([barnR[1], barnR[2], [barnR[2][0], barnR[2][1] + th], [barnR[1][0], barnR[1][1] + th]]);
              L.roofSnow.setAttribute('d', J(caps.map((c, k) => inkLoop(c, { seed: sd + 92 + k, t, amp: 0.8 }))));
              L.roofSnowR.setAttribute('d', J(caps.map((c, k) => inkPath(c, { w: 3.5, seed: sd + 94 + k, t, closed: true, amp: 0.8 })))); } }
          // ground
          const gp = []; for (let x = -40; x <= W + 40; x += 60) gp.push([x, GY + Math.sin(x * 0.008) * 5]);
          L.ground.setAttribute('d', inkLoop(gp.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 100, t, amp: 0.8, smooth: false }));
          L.groundR.setAttribute('d', inkPath(gp, { w: 6, seed: sd + 101, t, amp: 1.2 }));
          // fence
          if (P.fence !== false) { const fy = GY + 2, posts = [], rails = [], fr = [];
            for (let k = 0; k <= 14; k++) { const x = 30 + k * 64; if (x > (house ? house.x * W - 420 : W)) break; posts.push([[x - 7, fy], [x - 7, fy - 92], [x + 7, fy - 96], [x + 7, fy]]); }
            const x1 = posts.length ? posts[posts.length - 1][0][0] + 7 : 0;
            [fy - 70, fy - 36].forEach((ry, i) => rails.push([[24, ry], [x1, ry - 2], [x1, ry + 9], [24, ry + 11]]));
            L.fence.setAttribute('d', J(posts.concat(rails).map((p, k) => inkLoop(p, { seed: sd + 110 + k, t, amp: 0.6, smooth: false }))));
            L.fenceR.setAttribute('d', J(posts.concat(rails).map((p, k) => inkPath(p, { w: 3.5, seed: sd + 140 + k, t, closed: true, amp: 0.6, smooth: false })))); }
          // crops
          const st = [], sb = [], lr = [], wh = [], whr = [], caps = [];
          plants.forEach(p => {
            const wa = atOr(cues, p.c.wilt, null), fa = atOr(cues, p.c.flat, null);
            const w = wa != null ? progIO(lt, wa + p.j * 0.5, 1.2) : 0, fl = fa != null ? progIO(lt, fa + p.j * 0.4, 0.9) : 0;
            const sway = Math.sin(t * 1.6 + p.x * 0.01) * 0.06 * (1 - w) + (rain && lt > ra && p.x > rain.from * W ? Math.sin(t * 5 + p.k) * 0.1 : 0);
            const sc = p.s, x = p.x, y = p.y;
            if (p.c.type === 'wheat') {
              const h = 120 * sc, a = sway - fl * 1.1 + Math.sin(p.k) * 0.05;
              const tip = [x + Math.sin(a) * h, y - Math.cos(a) * h];
              whr.push(inkPath([[x, y], [x + Math.sin(a * 0.5) * h * 0.5, y - Math.cos(a * 0.5) * h * 0.5], tip], { w: 4, seed: sd + 300 + p.k, t, amp: 0.6 }));
              wh.push(inkLoop(inkEllipsePts(tip[0], tip[1], 9 * sc, 24 * sc, sd + 400 + p.k, 8, a), { seed: sd + 500 + p.k, t, amp: 0.6 }));
              return;
            }
            const h = 190 * sc * (1 - 0.35 * w), bend = sway + w * 0.9 * (p.k % 2 ? 1 : -1);
            const pts = []; for (let i = 0; i <= 4; i++) { const v = i / 4, a = bend * v * v; pts.push([x + Math.sin(a) * h * v, y - Math.cos(a) * h * v]); }
            (w > 0.5 ? sb : st).push(inkPath(pts, { w: 9 * sc, seed: sd + 600 + p.k, t, amp: 0.7, taper: 0.5 }));
            for (let i = 1; i <= 3; i++) { const b = pts[i], side = i % 2 ? 1 : -1, droop = 0.4 + w * 1.6, len = 70 * sc;
              const e = [b[0] + side * len * Math.cos(droop * 0.6), b[1] + len * Math.sin(droop) * 0.7 - 20 * (1 - w)];
              const leaf = [b, [lerp(b[0], e[0], 0.5), lerp(b[1], e[1], 0.5) - 16 * sc], e, [lerp(b[0], e[0], 0.5), lerp(b[1], e[1], 0.5) + 4 * sc]];
              (w > 0.5 ? sb : st).push(inkLoop(leaf, { seed: sd + 700 + p.k * 4 + i, t, amp: 0.6 }));
              lr.push(inkPath(leaf, { w: 2.6, seed: sd + 900 + p.k * 4 + i, t, closed: true, amp: 0.6 }));
              if (snowK > 0.2 && i === 2) caps.push(inkEllipsePts(lerp(b[0], e[0], 0.55), lerp(b[1], e[1], 0.55) - 8, 16 * sc * Math.min(1, snowK), 7 * sc * Math.min(1, snowK), sd + 1100 + p.k, 8));
            }
            if (snowK > 0.2) caps.push(inkEllipsePts(pts[4][0], pts[4][1], 14 * sc * Math.min(1, snowK), 7 * sc * Math.min(1, snowK), sd + 1200 + p.k, 8));
          });
          L.stem.setAttribute('d', J(st)); L.stemB.setAttribute('d', J(sb)); L.leafR.setAttribute('d', J(lr)); L.wheat.setAttribute('d', J(wh)); L.wheatR.setAttribute('d', J(whr));
          // snow on the ground + plants
          if (snowK > 0.02) { const th = 6 + 20 * Math.min(1, snowK), sg = []; for (let x = -40; x <= W + 40; x += 50) sg.push([x, GY - th + Math.sin(x * 0.03) * 4]);
            const band = sg.concat(sg.slice().reverse().map(q => [q[0], q[1] + th + 6]));
            caps.push(band); }
          L.snowCap.setAttribute('d', J(caps.map((c, k) => inkLoop(c, { seed: sd + 1300 + k, t, amp: 0.6 }))));
          L.snowCapR.setAttribute('d', caps.length ? inkPath(caps[caps.length - 1].slice(0, Math.floor(caps[caps.length - 1].length / 2)), { w: 3, seed: sd + 1399, t, amp: 0.8 }) : '');
          if (P.divider != null) { const dx = P.divider * W, ds = []; for (let y = 0.12 * H; y < GY + 200; y += 46) ds.push(inkPath([[dx, y], [dx + 2, y + 24]], { w: 5, seed: sd + 1400 + y, t, amp: 0.6 })); L.div.setAttribute('d', J(ds)); }
          // falling snow
          if (snow && lt >= sa) { const fr = [], frr = [], hv = heavy != null && lt > heavy ? 1 : 0.55;
            flakes.forEach((f, k) => { if (k / flakes.length > hv) return; const yy = ((f.y + (t - sa) * f.v * 0.13) % 1), x = f.x * W + Math.sin(t * 1.3 + f.d) * 26, y = yy * (GY + 260) - 40;
              fr.push(inkDot(x, y, f.s, null, sd + 1500 + k, t)); if (k % 2) frr.push(inkCircle(x, y, f.s, sd + 1600 + k, t, { w: 2.5, n: 8 })); });
            L.flakes.setAttribute('d', J(fr)); L.flakesR.setAttribute('d', J(frr)); }
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== tbA_java
  SH.tbA_java = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1500;
      const GY = (P.ground ?? 0.8) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = { hills: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), hillsR: inkEl(cam, INK.inkSoft),
        arcs: inkEl(cam, INK.red), wall: inkEl(cam, INK.paperLight), wallR: inkEl(cam), bricks: inkEl(cam, INK.inkSoft),
        pole: inkEl(cam), flagB: inkEl(cam, INK.blue), flagW: inkEl(cam, INK.paperLight), flagR: inkEl(cam, INK.red), flagO: inkEl(cam),
        ground: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 }), groundR: inkEl(cam), tick: inkEl(cam, INK.inkSoft),
        palm: inkEl(cam), frond: inkEl(cam, INK.green), frondR: inkEl(cam), dust: inkEl(cam, INK.paperDark), dustR: inkEl(cam, INK.inkSoft) };
      const castG = el(cam, 'g');
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const boomG = el(root, 'g');
      const booms = (P.booms || []).map((b, i) => { const g = el(boomG, 'g'); const tx = el(g, 'text', { 'font-family': "Fraunces, Georgia, serif", 'font-weight': 900, 'font-size': 110, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red, stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' }); tx.textContent = P.boom_text || 'BOOM!'; return { b, g, i }; });
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const palms = P.palms || [{ x: 0.47, h: 1.1 }, { x: 0.62, h: 0.9 }, { x: 0.95, h: 1.2 }];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const bt = booms.map(o => atOr(cues, o.b, null));
          const pk = Math.max(0, ...bt.map(a => punch(lt, a, 0.6)));
          const shake = Math.max(0, ...bt.map(a => a != null && lt >= a ? Math.exp(-(lt - a) * 5) * 0.5 : 0));
          camPush(cam, lt, dur, W, H, P.cam || {}, pk, shake);
          const hp = []; for (let x = -40; x <= W + 40; x += 48) hp.push([x, GY - 150 - 60 * Math.sin(x * 0.0035 + 2) - 20 * Math.sin(x * 0.013)]);
          L.hills.setAttribute('d', inkLoop(hp.concat([[W + 40, GY], [-40, GY]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
          L.hillsR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 2, t, amp: 1 }));
          // sound arcs rolling in from the horizon
          const [fx, fy] = (P.from || [1.05, 0.42]).map((v, i) => v * (i ? H : W)), arcs = [];
          bt.forEach((a, k) => { if (a == null) return; for (let j = 0; j < 3; j++) { const u = lt - (a - 0.5) - j * 0.14; if (u < 0 || u > 1.6) continue; const r = 120 + u * 900;
            const pts = []; for (let i = 0; i <= 12; i++) { const ang = Math.PI * (0.72 + 0.56 * i / 12); pts.push([fx + Math.cos(ang) * r, fy + Math.sin(ang) * r * 0.75]); }
            arcs.push(inkPath(pts, { w: 9 - j * 2.5, seed: sd + 10 + k * 3 + j, t, amp: 1.2 })); } });
          L.arcs.setAttribute('d', J(arcs));
          // fort wall + flag
          const wx1 = (P.wall ?? 0.3) * W, wt = GY - 230, wall = [[-40, wt], [wx1, wt], [wx1, GY + 4], [-40, GY + 4]], mer = [];
          for (let x = 0; x < wx1 - 40; x += 90) mer.push([[x, wt], [x, wt - 50], [x + 50, wt - 50], [x + 50, wt]]);
          L.wall.setAttribute('d', J([inkLoop(wall, { seed: sd + 20, t, amp: 0.6, smooth: false }), ...mer.map((m, k) => inkLoop(m, { seed: sd + 21 + k, t, amp: 0.6, smooth: false }))]));
          L.wallR.setAttribute('d', J([inkPath(wall, { w: 6, seed: sd + 40, t, closed: true, smooth: false }), ...mer.map((m, k) => inkPath(m, { w: 5, seed: sd + 41 + k, t, smooth: false }))]));
          const br = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const x = (c + (r % 2) * 0.5) / 6 * wx1, y = wt + 30 + r * 50; if (x + 70 < wx1) br.push(inkPath([[x + 10, y], [x + 70, y]], { w: 3, seed: sd + 60 + r * 6 + c, t, amp: 0.6 })); }
          L.bricks.setAttribute('d', J(br));
          if (P.flag !== false) { const px = wx1 * 0.55, py = wt - 50, top = py - 260, fw = 210, fh = 130, wv = k => Math.sin(t * 3.5 - k * 2.2) * 12 * k;
            const FP = (u, v) => [px + u * fw, top + v * fh + wv(u)];
            const quad = (u0, v0, u1, v1) => [FP(u0, v0), FP((u0 + u1) / 2, v0), FP(u1, v0), FP(u1, v1), FP((u0 + u1) / 2, v1), FP(u0, v1)];
            L.pole.setAttribute('d', inkPath([[px - 4, py], [px - 4, top - 16]], { w: 7, seed: sd + 80, t, amp: 0.6 }));
            L.flagB.setAttribute('d', inkLoop(quad(0, 0, 1, 1), { seed: sd + 81, t, amp: 0.6, smooth: false }));
            const diag = (a, b, w) => [FP(a[0] - w, a[1]), FP(a[0] + w, a[1]), FP(b[0] + w, b[1]), FP(b[0] - w, b[1])];
            L.flagW.setAttribute('d', J([inkLoop(diag([0, 0], [1, 1], 0.07), { seed: sd + 87, t, amp: 0.4, smooth: false }), inkLoop(diag([1, 0], [0, 1], 0.07), { seed: sd + 88, t, amp: 0.4, smooth: false }), inkLoop(quad(0.38, 0, 0.62, 1), { seed: sd + 82, t, amp: 0.5, smooth: false }), inkLoop(quad(0, 0.33, 1, 0.67), { seed: sd + 83, t, amp: 0.5, smooth: false })]));
            L.flagR.setAttribute('d', J([inkLoop(diag([0, 0], [1, 1], 0.025), { seed: sd + 89, t, amp: 0.3, smooth: false }), inkLoop(diag([1, 0], [0, 1], 0.025), { seed: sd + 90, t, amp: 0.3, smooth: false }), inkLoop(quad(0.45, 0, 0.55, 1), { seed: sd + 84, t, amp: 0.4, smooth: false }), inkLoop(quad(0, 0.42, 1, 0.58), { seed: sd + 85, t, amp: 0.4, smooth: false })]));
            L.flagO.setAttribute('d', inkPath(quad(0, 0, 1, 1), { w: 4, seed: sd + 86, t, closed: true, smooth: false, amp: 0.6 })); }
          // palms
          const pm = [], fr = [], frr = [];
          palms.forEach((pl, k) => { const x = pl.x * W, y = GY + 6, h = 300 * (pl.h ?? 1), sw = Math.sin(t * 1.1 + k) * 10, tp = [x + 34 + sw, y - h];
            pm.push(inkPath([[x, y], [x + 20, y - h * 0.5], tp], { w: 11, seed: sd + 100 + k, t, amp: 1, taper: 0.1 }));
            for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55 + Math.sin(t * 1.4 + i + k) * 0.06, L1 = 140;
              const e = [tp[0] + Math.cos(a) * L1 * 1.2, tp[1] + Math.sin(a) * L1 * 0.5 + 70], m = [tp[0] + Math.cos(a) * L1 * 0.6, tp[1] + Math.sin(a) * L1 * 0.6 - 10];
              fr.push(inkLoop([tp, m, e, [m[0] + 12, m[1] + 14]], { seed: sd + 110 + k * 6 + i, t, amp: 0.8 })); frr.push(inkPath([tp, m, e], { w: 4, seed: sd + 150 + k * 6 + i, t, amp: 0.8 })); } });
          L.palm.setAttribute('d', J(pm)); L.frond.setAttribute('d', J(fr)); L.frondR.setAttribute('d', J(frr));
          // ground + marching dust
          const gp = []; for (let x = -40; x <= W + 40; x += 60) gp.push([x, GY + Math.sin(x * 0.01) * 5]);
          L.ground.setAttribute('d', inkLoop(gp.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 200, t, amp: 0.8, smooth: false }));
          L.groundR.setAttribute('d', inkPath(gp, { w: 6, seed: sd + 201, t, amp: 1.2 }));
          const tk = []; for (let k = 0; k < 20; k++) { const x = (k + 0.5) / 20 * W, y = GY + 40 + (k % 3) * 30; tk.push(inkPath([[x, y], [x + 10, y - 20], [x + 18, y]], { w: 3.5, seed: sd + 210 + k, t, amp: 0.8 })); }
          L.tick.setAttribute('d', J(tk));
          cs.update(lt, t, cues);
          booms.forEach((o, k) => { const a = bt[k]; if (a == null || lt < a) { o.g.style.display = 'none'; return; } o.g.style.display = '';
            const p = spring(lt, a, 0.45), u = lt - a, x = (P.boom_x ?? 0.78) * W - k * 90, y = (0.2 + (k % 2) * 0.1) * H;
            o.g.setAttribute('transform', `translate(${ff(x + Math.sin(t * 40) * 6 * Math.exp(-u * 4))} ${ff(y)}) rotate(${-6 + k * 5}) scale(${(Math.max(0.01, p) * (1 + 0.1 * punch(lt, a, 0.5))).toFixed(3)})`);
            o.g.setAttribute('opacity', u > 1.8 ? clamp01(1 - (u - 1.8) / 0.4).toFixed(2) : 1); });
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== tbA_sea
  SH.tbA_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush, sea } = window.MCB;
      const sd = seed * 1000 + 1700;
      const mode = P.mode || 'search';
      const HZ = (P.horizon ?? 0.5) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = { cloud: inkEl(cam, INK.paperLight), cloudR: inkEl(cam, INK.inkSoft), birds: inkEl(cam),
        vol: inkEl(cam, INK.paperDark), volR: inkEl(cam, INK.inkSoft), plume: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }), plumeR: inkEl(cam),
        ghost: inkEl(cam, INK.red), ghostX: inkEl(cam, INK.red) };
      const seaG = el(cam, 'g');
      const sw = sea(seaG, W, H, HZ, sd + 5, { hatch: 26 });
      const BCH = { f: inkEl(cam, INK.gold, { 'fill-opacity': 0.35 }), r: inkEl(cam), palm: inkEl(cam), frond: inkEl(cam, INK.green), frondR: inkEl(cam) };
      const rafts = { f: inkEl(cam, INK.paperDark), r: inkEl(cam, INK.inkSoft) };
      const front = { f: inkEl(cam, INK.paperDark), r: inkEl(cam, INK.inkSoft) };
      const boats = (P.boats || []).map((b, i) => {
        const g = el(cam, 'g'), crewG = el(g, 'g');
        const crew = cast(crewG, (b.crew || []).map(m => Object.assign({ scale: 0.5, y: 0.72 }, m, { x: m.dx ?? 0 })), 1, H, sd + 300 + i * 40);
        const hull = { f: inkEl(g, INK.hat), r: inkEl(g), oars: inkEl(g) };
        return { b, g, crew, hull, i };
      });
      const ship = mode === 'pumice' ? Object.assign({ x: 0.45, to: 0.55, s: 1 }, P.ship || {}) : null;
      const shipG = ship ? el(cam, 'g') : null;
      const SHP = ship ? { mast: inkEl(shipG), sail: inkEl(shipG, INK.paperLight), sailR: inkEl(shipG), crewG: el(shipG, 'g'), hull: inkEl(shipG, INK.inkSoft), hullR: inkEl(shipG), port: inkEl(shipG, INK.paperLight), band: inkEl(shipG, INK.gold) } : null;
      const shipCrew = ship ? cast(SHP.crewG, (ship.crew || []).map(m => Object.assign({ scale: 0.4 }, m, { x: m.dx ?? 0, y: 0 })), 1, 1, sd + 500) : null;
      const castG = el(cam, 'g');
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const R = rng(sd + 9);
      const rafts0 = Array.from({ length: 9 }, () => ({ x: R(), y: R() })), stones = Array.from({ length: 110 }, (_, k) => { const c = rafts0[k % 9]; return { x: c.x + (R() - 0.5) * 0.16, y: Math.min(1, Math.max(0, c.y + (R() - 0.5) * 0.12)), s: 0.5 + R() * 0.7, k: R() }; });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const gx = P.ghost ? atOr(cues, P.ghost.cross, null) : null;
          const pk = Math.max(punch(lt, gx, 0.6));
          camPush(cam, lt, dur, W, H, P.cam || {}, pk, 0);
          // clouds + gulls
          const cf = [], cr = [];
          [[0.2, 0.28, 100], [0.66, 0.24, 80]].forEach(([x, y, r], k) => { const cx = ((x * W + t * (12 + k * 5)) % (W + 400)) - 120, cy = y * H, pts = [];
            for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, q = r * (1 + 0.18 * Math.sin(i * 3.1 + k)); pts.push([cx + Math.cos(a) * q * 1.9, cy + Math.sin(a) * q * 0.55]); }
            cf.push(inkLoop(pts, { seed: sd + 10 + k, t, amp: 1.5 })); cr.push(inkPath(pts, { w: 4, seed: sd + 20 + k, t, closed: true })); });
          L.cloud.setAttribute('d', J(cf)); L.cloudR.setAttribute('d', J(cr));
          const bs = []; for (let k = 0; k < 3; k++) { const bx = ((0.3 + k * 0.17) * W + t * 34) % (W + 200) - 100, by = (0.24 + 0.04 * k) * H + Math.sin(t * 1.2 + k) * 10, f = Math.sin(t * 8 + k) * 12;
            bs.push(inkPath([[bx - 24, by - f], [bx, by + 6], [bx + 24, by - f]], { w: 5, seed: sd + 30 + k, t, amp: 0.8 })); }
          L.birds.setAttribute('d', J(bs));
          // far volcano on the horizon
          if (P.far_volcano) { const fv = Object.assign({ x: 0.9 }, P.far_volcano), x = fv.x * W, a = atOr(cues, fv.at, 0), p = spring(lt, a - 0.3, 0.6);
            const v = [[x - 170, HZ + 4], [x - 30, HZ - 90], [x + 30, HZ - 92], [x + 170, HZ + 4]];
            L.vol.setAttribute('d', inkLoop(v, { seed: sd + 40, t, amp: 0.8 })); L.volR.setAttribute('d', inkPath(v, { w: 5, seed: sd + 41, t, amp: 1 }));
            if (lt >= a) { const u = lt - a, pf = [], pr = []; for (let k = 0; k < 6; k++) { const vv = Math.min(1, u / 2) * (k / 5), r = 26 + vv * 70;
              const pts = puff(x + vv * 60 + Math.sin(t + k) * 8, HZ - 100 - vv * 300, r * Math.min(1, u / 0.6 + 0.3), k, t); pf.push(inkLoop(pts, { seed: sd + 50 + k, t, amp: 1 })); pr.push(inkPath(pts, { w: 4, seed: sd + 60 + k, t, closed: true })); }
              L.plume.setAttribute('d', J(pf)); L.plumeR.setAttribute('d', J(pr)); }
            void p; }
          // ghost ship (red dashed outline) + cross
          if (P.ghost) { const g = Object.assign({ x: 0.68, s: 0.8 }, P.ghost), a = atOr(cues, g.at, 0), p = prog(lt, a, 0.8);
            const x = g.x * W, y = HZ - 6, s = g.s, ol = [[x - 150 * s, y - 40 * s], [x + 170 * s, y - 40 * s], [x + 120 * s, y + 10 * s], [x - 120 * s, y + 10 * s], [x - 150 * s, y - 40 * s]];
            const masts = [[[x - 50 * s, y - 40 * s], [x - 50 * s, y - 240 * s]], [[x + 60 * s, y - 40 * s], [x + 60 * s, y - 260 * s]]];
            const sails = [[[x - 110 * s, y - 220 * s], [x + 10 * s, y - 220 * s], [x + 6 * s, y - 70 * s], [x - 106 * s, y - 70 * s], [x - 110 * s, y - 220 * s]], [[x, y - 240 * s], [x + 120 * s, y - 240 * s], [x + 116 * s, y - 70 * s], [x + 4 * s, y - 70 * s], [x, y - 240 * s]]];
            const segs = [];
            [ol, ...masts, ...sails].forEach(poly => { for (let i = 0; i < poly.length - 1; i++) { const A = poly[i], Bp = poly[i + 1], len = Math.hypot(Bp[0] - A[0], Bp[1] - A[1]), n = Math.max(2, Math.floor(len / 18));
              for (let j = 0; j < n; j += 2) { const u0 = j / n, u1 = Math.min(1, (j + 1) / n); segs.push([[lerp(A[0], Bp[0], u0), lerp(A[1], Bp[1], u0)], [lerp(A[0], Bp[0], u1), lerp(A[1], Bp[1], u1)]]); } } });
            const dashes = segs.filter((q, k) => k / segs.length <= p).map((q, k) => inkPath(q, { w: 6, seed: sd + 70 + k, t, amp: 0.5, taper: 0 }));
            L.ghost.setAttribute('d', J(dashes));
            if (gx != null && lt >= gx) { const xp = prog(lt, gx, 0.35), xp2 = prog(lt, gx + 0.2, 0.35), r = 190 * s, cy = y - 120 * s;
              L.ghostX.setAttribute('d', J([inkPath([[x - r, cy - r], [lerp(x - r, x + r, xp), lerp(cy - r, cy + r, xp)]], { w: 18, seed: sd + 95, t }), xp2 > 0.01 ? inkPath([[x + r, cy - r], [lerp(x + r, x - r, xp2), lerp(cy - r, cy + r, xp2)]], { w: 18, seed: sd + 96, t }) : ''])); } }
          sw.update(t);
          // beach on the left
          if (P.beach !== false && mode === 'search') { const bp = [[-40, HZ + 40], [0.12 * W, HZ + 60], [0.2 * W, HZ + 150], [0.17 * W, H * 0.7], [0.24 * W, H + 20], [-40, H + 20]];
            BCH.f.setAttribute('d', inkLoop(bp, { seed: sd + 100, t, amp: 1 })); BCH.r.setAttribute('d', inkPath(bp.slice(0, 5), { w: 5, seed: sd + 101, t }));
            const x = 0.07 * W, y = HZ + 230, h = 330, tp = [x + 40 + Math.sin(t * 1.1) * 10, y - h], fr = [], frr = [];
            BCH.palm.setAttribute('d', inkPath([[x, y], [x + 24, y - h * 0.5], tp], { w: 11, seed: sd + 102, t, amp: 1, taper: 0.1 }));
            for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.55 + Math.sin(t * 1.4 + i) * 0.06, L1 = 140, e = [tp[0] + Math.cos(a) * L1 * 1.2, tp[1] + Math.sin(a) * L1 * 0.5 + 70], m = [tp[0] + Math.cos(a) * L1 * 0.6, tp[1] + Math.sin(a) * L1 * 0.6 - 10];
              fr.push(inkLoop([tp, m, e, [m[0] + 12, m[1] + 14]], { seed: sd + 110 + i, t, amp: 0.8 })); frr.push(inkPath([tp, m, e], { w: 4, seed: sd + 120 + i, t, amp: 0.8 })); }
            BCH.frond.setAttribute('d', J(fr)); BCH.frondR.setAttribute('d', J(frr)); }
          // floating stone rafts
          if (mode === 'pumice') { const dens = P.rafts ?? 1, rf = [], rr2 = [], ff2 = [], fr2 = [];
            stones.forEach((s, k) => { if (k / stones.length > dens) return; const yy = HZ + 20 + Math.pow(s.y, 1.4) * (H * 0.92 - HZ), depth = (yy - HZ) / (H - HZ);
              const x = ((s.x * (W + 300) - t * (30 + depth * 60)) % (W + 300) + W + 300) % (W + 300) - 150, y = yy + Math.sin(t * 1.5 + k) * 4, r = (14 + 30 * depth) * s.s;
              const pts = inkEllipsePts(x, y, r * 1.5, r * 0.55, sd + 600 + k, 9, 0, 0.15);
              (yy > H * 0.72 ? ff2 : rf).push(inkLoop(pts, { seed: sd + 700 + k, t, amp: 0.8 })); (yy > H * 0.72 ? fr2 : rr2).push(inkPath(pts, { w: 3 + depth * 2, seed: sd + 800 + k, t, closed: true, amp: 0.8 })); });
            rafts.f.setAttribute('d', J(rf)); rafts.r.setAttribute('d', J(rr2)); front.f.setAttribute('d', J(ff2)); front.r.setAttribute('d', J(fr2)); }
          // rowboats
          boats.forEach(({ b, g, crew, hull, i }) => { const a = atOr(cues, b.at, 0), u = progIO(lt, a, b.dur ?? Math.max(1, dur - a)), x = lerp(b.x ?? 0.2, b.to ?? (b.x ?? 0.2), u) * W;
            const y = (b.y ?? 0.72) * H + Math.sin(t * 2 + i) * 5, s = b.s ?? 1, ang = Math.sin(t * 1.6 + i) * 2;
            g.setAttribute('transform', `translate(${ff(x)} ${ff(y - 0.72 * H)}) rotate(${ff(ang)} 0 ${ff(0.72 * H)})`);
            const y0 = 0.72 * H, hp = [[-200 * s, y0 - 40 * s], [200 * s, y0 - 50 * s], [160 * s, y0 + 30 * s], [-150 * s, y0 + 30 * s]];
            hull.f.setAttribute('d', inkLoop(hp, { seed: sd + 900 + i, t, amp: 0.8 }));
            const oa = Math.sin(t * 3.2 + i) * 0.5;
            hull.r.setAttribute('d', J([inkPath(hp, { w: 6, seed: sd + 910 + i, t, closed: true }), inkPath([[-190 * s, y0 - 24 * s], [190 * s, y0 - 32 * s]], { w: 3.5, seed: sd + 915 + i, t })]));
            hull.oars.setAttribute('d', J([-1, 1].map(sd2 => inkPath([[sd2 * 40 * s, y0 - 50 * s], [sd2 * 40 * s + Math.sin(oa) * 140 * s, y0 + 70 * s]], { w: 6, seed: sd + 920 + i + sd2, t }))));
            crew.update(lt, t, cues); });
          // the ship
          if (ship) { const u = progIO(lt, 0, Math.max(1, dur)), x = lerp(ship.x, ship.to, u) * W, s = ship.s, y = (ship.y ?? 0.66) * H + Math.sin(t * 1.4) * 6, ang = Math.sin(t * 1.1) * 1.6;
            shipG.setAttribute('transform', `translate(${ff(x)} ${ff(y)}) rotate(${ff(ang)}) scale(${s})`);
            const hp = [[-330, -70], [360, -80], [300, 30], [-280, 30]];
            SHP.hull.setAttribute('d', inkLoop(hp, { seed: sd + 1000, t, amp: 0.8 })); SHP.hullR.setAttribute('d', J([inkPath(hp, { w: 6, seed: sd + 1001, t, closed: true }), inkPath([[-320, -50], [350, -60]], { w: 3.5, seed: sd + 1002, t })]));
            SHP.band.setAttribute('d', inkLoop([[-310, -40], [340, -50], [334, -36], [-306, -26]], { seed: sd + 1003, t, amp: 0.5 }));
            SHP.port.setAttribute('d', J([-200, -100, 0, 100, 200].map((px, k) => inkDot(px, -8, 10, null, sd + 1004 + k, t))));
            const masts = [[-170, 360], [20, 440], [210, 380]], sl = [], slr = [], ms = [];
            masts.forEach(([mx, mh], k) => { ms.push(inkPath([[mx, -70], [mx, -70 - mh]], { w: 7, seed: sd + 1010 + k, t, amp: 0.6 }));
              [[0.25, 0.55], [0.6, 0.9]].forEach(([a, b], j) => { const bl = Math.sin(t * 1.3 + k + j) * 10, w = 120 - j * 26, y0 = -70 - mh * b, y1 = -70 - mh * a;
                const sp = [[mx - w, y0], [mx + w, y0], [mx + w + 16 + bl, (y0 + y1) / 2], [mx + w, y1], [mx - w, y1], [mx - w + 16 + bl, (y0 + y1) / 2]];
                sl.push(inkLoop(sp, { seed: sd + 1020 + k * 2 + j, t, amp: 0.8 })); slr.push(inkPath(sp, { w: 4.5, seed: sd + 1030 + k * 2 + j, t, closed: true, amp: 0.8 })); }); });
            ms.push(inkPath([[-330, -70], [-170, -430]], { w: 3, seed: sd + 1040, t, amp: 0.8 }), inkPath([[-170, -430], [20, -510]], { w: 3, seed: sd + 1041, t, amp: 0.8 }), inkPath([[20, -510], [210, -450]], { w: 3, seed: sd + 1042, t, amp: 0.8 }), inkPath([[210, -450], [360, -80]], { w: 3, seed: sd + 1043, t, amp: 0.8 }));
            SHP.mast.setAttribute('d', J(ms)); SHP.sail.setAttribute('d', J(sl)); SHP.sailR.setAttribute('d', J(slr));
            SHP.crewG.setAttribute('transform', 'translate(0 -70)');
            shipCrew.update(lt, t, cues); }
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== tbA_sound
  const LANDS = [
    [[95.3, 5.6], [97.5, 5.2], [100.3, 2.6], [103.7, -1.0], [106.0, -3.0], [105.9, -5.8], [104.5, -5.9], [102.3, -4.0], [100.4, -1.0], [98.7, 1.7], [96.0, 3.9]],
    [[99.0, 9.5], [99.7, 7.0], [100.4, 5.5], [101.3, 2.8], [103.4, 1.4], [104.3, 1.4], [103.4, 4.0], [102.3, 6.2], [101.0, 7.0], [100.5, 9.5]],
    [[109.0, 1.6], [109.6, 2.0], [111.0, 1.6], [113.0, 3.2], [115.4, 5.2], [117.0, 7.0], [119.2, 5.2], [118.0, 4.3], [117.8, 1.0], [118.9, 1.0], [116.6, -1.5], [116.0, -3.8], [114.6, -3.6], [113.0, -3.2], [110.3, -2.9], [109.6, -1.0], [108.9, 0.4]],
    [[119.4, -0.6], [120.0, 0.7], [120.9, 1.3], [122.9, 0.9], [124.9, 1.6], [125.2, 1.4], [123.4, 0.4], [121.3, 0.5], [120.2, 0.0], [120.6, -1.3], [121.6, -0.9], [123.3, -0.9], [121.8, -1.9], [122.9, -4.6], [122.0, -4.8], [121.3, -2.8], [120.4, -3.0], [120.5, -5.6], [119.4, -5.4], [119.6, -3.4], [118.8, -2.6]],
    [[105.2, -6.8], [106.0, -5.9], [106.8, -6.1], [108.3, -6.3], [108.6, -6.7], [110.4, -6.95], [111.0, -6.4], [112.6, -6.9], [112.8, -7.2], [113.5, -7.7], [114.4, -7.8], [114.6, -8.7], [114.0, -8.6], [112.5, -8.4], [111.0, -8.2], [110.0, -8.1], [108.5, -7.8], [107.4, -7.5], [106.4, -7.4], [105.5, -6.9]],
    [[114.45, -8.1], [115.2, -8.05], [115.7, -8.4], [115.2, -8.85], [114.6, -8.4]],
    [[115.85, -8.3], [116.4, -8.2], [116.7, -8.4], [116.5, -8.9], [115.9, -8.8]],
    [[116.75, -8.6], [117.0, -8.4], [117.4, -8.45], [117.55, -8.55], [117.75, -8.45], [117.7, -8.2], [118.0, -8.05], [118.3, -8.1], [118.4, -8.35], [118.7, -8.3], [119.15, -8.45], [119.2, -8.75], [118.8, -8.85], [118.2, -8.85], [117.6, -9.05], [117.1, -9.05], [116.85, -8.85]],
    [[119.8, -8.5], [120.5, -8.3], [121.5, -8.5], [122.5, -8.1], [123.0, -8.3], [122.8, -8.6], [121.8, -8.9], [120.5, -8.85], [119.9, -8.8]],
    [[119.0, -9.5], [120.8, -10.1], [120.3, -10.3], [119.2, -9.8]],
    [[123.6, -10.3], [124.4, -9.4], [125.2, -8.6], [127.0, -8.4], [126.4, -8.9], [124.4, -10.2], [123.8, -10.4]],
    [[131.0, -1.2], [132.5, -0.4], [134.0, -0.8], [135.5, -3.3], [138.0, -1.6], [141.0, -2.6], [146.0, -5.0], [147.5, -8.0], [146.0, -8.2], [143.0, -9.0], [141.0, -9.2], [139.0, -8.1], [138.0, -8.4], [137.8, -5.2], [135.5, -4.5], [133.0, -4.0], [132.0, -2.8]],
    [[113.5, -22.0], [114.2, -22.0], [116.7, -20.6], [121.0, -19.5], [122.3, -17.0], [125.0, -14.5], [127.0, -14.0], [129.5, -15.0], [130.5, -12.4], [132.6, -11.5], [135.8, -12.2], [136.8, -12.2], [135.6, -15.0], [139.5, -17.4], [141.5, -12.6], [142.5, -10.7], [143.6, -14.0], [145.3, -15.0], [146.3, -19.0], [148.8, -20.4], [150.0, -23.0], [150.0, -35.0], [113.0, -35.0]],
    [[121.9, 6.9], [123.7, 7.6], [125.4, 9.0], [126.6, 7.3], [126.0, 6.0], [125.4, 5.6], [124.0, 6.4], [122.2, 6.8]],
  ];
  SH.tbA_sound = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 2500;
      const sh = Object.assign({ x: 0.05, y: 0.14, w: 0.66, h: 0.66 }, P.sheet || {});
      const SX = sh.x * W, SY = sh.y * H, SW = sh.w * W, SHh = sh.h * H;
      const [lo0, lo1, la0, la1] = P.bounds || [92, 146, 7.5, -21.5];
      const X = lo => SX + (lo - lo0) / (lo1 - lo0) * SW, Y = la => SY + (la0 - la) / (la0 - la1) * SHh;
      const src = P.src || [118.0, -8.25], [sx, sy] = [X(src[0]), Y(src[1])];
      const pxPerDeg = SW / (lo1 - lo0), rKm = (P.km ?? 2500) / 111 * pxPerDeg;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const cid = 'tbAsnd' + seed, clip = el(ctx.defs || svg, 'clipPath', { id: cid });
      el(clip, 'rect', { x: SX + 6, y: SY + 6, width: SW - 12, height: SHh - 12, rx: 10 });
      const L = { shadow: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.8 }), sheet: inkEl(cam, INK.paperLight), sheetR: inkEl(cam) };
      const mg = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const M = { grat: inkEl(mg, INK.inkSoft, { 'fill-opacity': 0.35 }), land: inkEl(mg, INK.paperDark), landR: inkEl(mg, INK.inkSoft), rings: inkEl(mg, INK.inkSoft), big: inkEl(mg, INK.red), rad: inkEl(mg, INK.red),
        vol: inkEl(mg, INK.paper), volR: inkEl(mg), fire: inkEl(mg, INK.red) };
      const names = (P.names || []).map(n => { const t = el(mg, 'text', { x: X(n.x), y: Y(n.y), 'font-family': INK_FONT, 'font-size': n.size || 46, 'text-anchor': 'middle', fill: INK.inkSoft, 'letter-spacing': '0.06em' }); t.textContent = n.name; return t; });
      const castG = el(cam, 'g');
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      void names;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ra = atOr(cues, 'ring', dur * 0.4);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.04, focus: [0.4, 0.5] }, punch(lt, ra, 0.6), 0);
          const sp = [[SX, SY], [SX + SW, SY], [SX + SW, SY + SHh], [SX, SY + SHh]];
          L.shadow.setAttribute('d', inkLoop(sp.map(q => [q[0] + 12, q[1] + 14]), { seed: sd + 1, t, amp: 0.6, smooth: false }));
          L.sheet.setAttribute('d', inkLoop(sp, { seed: sd + 2, t, amp: 0.6, smooth: false }));
          L.sheetR.setAttribute('d', J([inkPath(sp, { w: 5, seed: sd + 3, t, closed: true, smooth: false }), inkPath([[SX + 18, SY + 18], [SX + SW - 18, SY + 18], [SX + SW - 18, SY + SHh - 18], [SX + 18, SY + SHh - 18]], { w: 2.5, seed: sd + 4, t, closed: true, smooth: false, amp: 0.8 })]));
          const gr = []; for (let i = 1; i < 6; i++) { const x = SX + SW * i / 6, y = SY + SHh * i / 6; for (let k = 0; k < 14; k += 2) { gr.push(inkPath([[x, SY + SHh * k / 14], [x, SY + SHh * (k + 1) / 14]], { w: 2, seed: sd + 10 + i * 20 + k, t, amp: 0.5 })); gr.push(inkPath([[SX + SW * k / 14, y], [SX + SW * (k + 1) / 14, y]], { w: 2, seed: sd + 300 + i * 20 + k, t, amp: 0.5 })); } }
          M.grat.setAttribute('d', J(gr));
          M.land.setAttribute('d', J(LANDS.map((poly, k) => inkLoop(poly.map(q => [X(q[0]), Y(q[1])]), { seed: sd + 600 + k, t, amp: 1 }))));
          M.landR.setAttribute('d', J(LANDS.map((poly, k) => inkPath(poly.map(q => [X(q[0]), Y(q[1])]), { w: 4, seed: sd + 650 + k, t, closed: true, amp: 1 }))));
          // pulsing sound rings
          const rg = []; for (let k = 0; k < 4; k++) { const v = ((t * 0.5 + k / 4) % 1), r = 30 + v * rKm * 0.95; rg.push(inkCircle(sx, sy, r, sd + 700 + k, t, { w: 6 * (1 - v) + 1.5, n: 18 })); }
          M.rings.setAttribute('d', J(rg));
          // big red dashed circle at P.km
          if (lt >= ra) { const p = progIO(lt, ra, 1.4), ds = [], n = 48;
            for (let i = 0; i < n * p; i += 2) { const a0 = -Math.PI / 2 + i / n * Math.PI * 2, a1 = -Math.PI / 2 + (i + 1) / n * Math.PI * 2;
              ds.push(inkPath([[sx + Math.cos(a0) * rKm, sy + Math.sin(a0) * rKm], [sx + Math.cos((a0 + a1) / 2) * rKm, sy + Math.sin((a0 + a1) / 2) * rKm], [sx + Math.cos(a1) * rKm, sy + Math.sin(a1) * rKm]], { w: 8, seed: sd + 800 + i, t, amp: 0.8 })); }
            M.big.setAttribute('d', J(ds));
            const rp = prog(lt, ra, 0.8), ang = Math.PI * 1.08, ex = sx + Math.cos(ang) * rKm * rp, ey = sy + Math.sin(ang) * rKm * rp;
            M.rad.setAttribute('d', J([inkPath([[sx, sy], [ex, ey]], { w: 6, seed: sd + 900, t }), rp > 0.9 ? inkPath([[ex + 30, ey - 14], [ex, ey], [ex + 26, ey + 24]], { w: 6, seed: sd + 901, t, smooth: false }) : ''])); }
          // volcano marker
          const vs = 40 * (1 + 0.1 * punch(lt, ra, 0.6)), v = [[sx - vs, sy + vs * 0.4], [sx - vs * 0.2, sy - vs * 0.55], [sx + vs * 0.2, sy - vs * 0.55], [sx + vs, sy + vs * 0.4]];
          M.vol.setAttribute('d', inkLoop(v, { seed: sd + 950, t, amp: 0.8 })); M.volR.setAttribute('d', inkPath(v, { w: 5, seed: sd + 951, t, closed: true }));
          M.fire.setAttribute('d', J([0, 1, 2].map(k => inkLoop([[sx - 26 + k * 18, sy - vs * 0.5], [sx - 16 + k * 18 + Math.sin(t * 6 + k) * 6, sy - vs * (1.15 + 0.15 * Math.sin(t * 5 + k))], [sx - 8 + k * 18, sy - vs * 0.5]], { seed: sd + 960 + k, t, amp: 1 }))));
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
