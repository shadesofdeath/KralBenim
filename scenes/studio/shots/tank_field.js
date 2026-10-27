// tank_field: side-on Western Front battlefield, 1915-1918, in parchment ink (BRAND.md §3, §5; the set gives the sky
// and the far land, this shot draws the churned ground on top of it). Shell craters and shattered tree stumps,
// trenches cut into the ground (revetment planks, sandbag parapets, duckboards), barbed wire on X pickets that the
// tracks flatten, the first tanks (tank__lib: Mark I male/female, Little Willie, Mother; tracks roll, the hull pitches
// over the craters, exhaust smoke, muzzle flash, breakdown with black smoke, nose-down in a trench), bullets sparking
// off the armour, shell bursts, a dawn mist the machine comes out of, a biplane, ruined village walls, a foreground
// sandbag parapet (the defender's point of view), and the cast (bb__lib) with period helmets drawn over the heads.
// P: {
//   ground: 0.8 (0..1 H), craters: [{x, w: 0.1, d: 40}], berms: [{x, w, h}] (raised banks the tank climbs),
//   trenches: [{x, w: 0.06, depth: 150, bags: true}] (x, w: 0..1 W), stumps: [x...], ruins: [{x, w: 0.12, h: 260}],
//   wire: [{x0, x1, h: 70}],
//   tanks: [{variant: "male"|"female"|"willie"|"mother", x, to, at (cue|s, start), dur: 4, s: 0.6, face: 1|-1,
//            y (0..1 H ground for far rows), roof, label, fascine, fire: [cues], dead: cue, smoke: true,
//            stuck: {at: cue, x} (nose dips into the trench, the track sags), rock: 0 (extra pitching, deg), sparks: cue}],
//   mist: {x0: 0, x1: 1, y0: 0.5, y1: 0.82, clear: cue (thins out after), bands: 7},
//   bursts: [{x, y, at, size: 90}], parapet: {from: 0, to: 1, y: 0.86} (foreground sandbags),
//   plane: {x, to, y: 0.2, at, dur: 5, s: 0.9, face: 1}, smoke_black: [{x, y, at}] (rising columns),
//   cast: [... bb__lib cast + helmet: "brodie"|"stahl"|"cap"|"top"|"naval"|"flat", moustache: true, rifle: true],
//   labels: [... bb__lib labels], shake: cue
// }
// cues: tank at/fire/dead/stuck/sparks, mist.clear, bursts, plane, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 811;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const G = P.ground ?? 0.8, gy0 = G * H;
      const craters = (P.craters || []).map(c => ({ x: c.x * W, w: (c.w ?? 0.1) * W, d: c.d ?? 40 }));
      const berms = (P.berms || []).map(c => ({ x: c.x * W, w: (c.w ?? 0.08) * W, h: c.h ?? 60 }));
      const trenches = (P.trenches || []).map(c => ({ x: c.x * W, w: (c.w ?? 0.06) * W, depth: c.depth ?? 150, bags: c.bags !== false }));
      const bowl = (x, c, k) => { const u = (x - c.x) / (c.w / 2); return Math.abs(u) < 1 ? k * (0.5 + 0.5 * Math.cos(u * Math.PI)) : 0; };
      const gyT = x => { let y = gy0; craters.forEach(c => { y += bowl(x, c, c.d); }); berms.forEach(c => { y -= bowl(x, c, c.h); }); return y; };   // tank sees this (bridges trenches)
      const inTrench = x => trenches.find(c => Math.abs(x - c.x) < c.w / 2);
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = {
        far: L(INK.inkSoft),
        ruinF: L(INK.paperDark), ruinI: L(INK.ink),
        stump: L(INK.ink),
        trF: L(INK.inkSoft, { 'fill-opacity': 0.85 }), trI: L(INK.ink), bagF: L(INK.paperDark), bagI: L(INK.ink),
        crater: L(INK.inkSoft, { 'fill-opacity': 0.55 }), groundI: L(INK.ink), mud: L(INK.inkSoft),
        wireP: L(INK.ink), wireC: L(INK.ink),
        smokeBF: L(INK.inkSoft, { 'fill-opacity': 0.8 }), smokeBI: L(INK.ink),
      };
      const snapF = L(INK.inkSoft), snapI = L(INK.ink);
      const tankG = el(cam, 'g');
      const tanks = (P.tanks || []).map((k, i) => ({ k, r: T.tank(el(tankG, 'g'), { variant: k.variant || 'male', roof: k.roof, label: k.label, fascine: k.fascine, tail: k.tail, seed: sd + i * 31 }) }));
      const fx = { smF: L(INK.paperLight), smI: L(INK.inkSoft), spark: L(INK.gold), sparkI: L(INK.red),
        bCloud: L(INK.inkSoft), bInk: L(INK.ink), bFlash: L(INK.gold) };
      const mistL = L(INK.paperLight, { 'fill-opacity': 0.0 }), mistL2 = L(INK.paperLight, { 'fill-opacity': 0.0 });
      const castG = el(cam, 'g'), rifle = L(INK.ink), helmF = L(INK.inkSoft), helmI = L(INK.ink);
      const planeF = L(INK.paperDark), planeI = L(INK.ink);
      const parF = L(INK.paperDark), parI = L(INK.ink), parS = L(INK.inkSoft);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const rs = rng(sd + 5);
      const clods = Array.from({ length: 70 }, () => [rs(), rs(), rs()]);
      // foreground sandbags (static layout)
      const PAR = P.parapet ? Object.assign({ from: 0, to: 1, y: 0.86 }, P.parapet) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.2, w: 5 }, extra || {});
          // ruins (behind everything on the ground)
          const RF = [], RI = [];
          (P.ruins || []).forEach((r, i) => {
            const x = r.x * W, w = (r.w ?? 0.12) * W, h = r.h ?? 260, gb = gyT(x);
            const pts = [[x - w / 2, gb], [x - w / 2, gb - h * 0.8], [x - w * 0.3, gb - h], [x - w * 0.1, gb - h * 0.7], [x + w * 0.08, gb - h * 0.86], [x + w * 0.25, gb - h * 0.45], [x + w / 2, gb - h * 0.5], [x + w / 2, gb]];
            RF.push(inkLoop(pts, o(1000 + i * 9, { smooth: false })));
            RI.push(inkPath(pts.slice(0, -1), o(1001 + i * 9, { smooth: false, w: 5 })));
            for (let yy = gb - 40; yy > gb - h * 0.7; yy -= 40) RI.push(inkPath([[x - w / 2 + 8, yy], [x + w * 0.2, yy + 3]], o(1002 + i * 9 + yy, { w: 2.4, amp: 0.6 })));
            RI.push(inkPath(T.rect(x - w * 0.3, gb - h * 0.62, x - w * 0.12, gb - h * 0.36), o(1003 + i * 9, { closed: true, smooth: false, w: 4 })));
          });
          lay.ruinF.setAttribute('d', RF.join(' ')); lay.ruinI.setAttribute('d', RI.join(' '));
          // shattered stumps
          lay.stump.setAttribute('d', (P.stumps || []).map((sx, i) => {
            const x = sx * W, gb = gyT(x), h = 120 + (i % 3) * 50;
            return inkPath([[x - 14, gb], [x - 8, gb - h], [x + 4, gb - h - 26], [x + 8, gb - h + 10], [x + 14, gb]], o(1100 + i * 3, { smooth: false, w: 7 })) + ' ' +
              inkPath([[x - 6, gb - h * 0.6], [x - 50, gb - h * 0.8]], o(1101 + i * 3, { w: 5 }));
          }).join(' '));
          // trenches cut into the ground
          const TF = [], TI = [], BF = [], BI = [];
          trenches.forEach((c, i) => {
            const x0 = c.x - c.w / 2, x1 = c.x + c.w / 2, yb = gy0 + c.depth;
            const cut = [[x0 - 6, gy0], [x0 + 6, yb], [x1 - 6, yb], [x1 + 6, gy0]];
            TF.push(inkLoop(cut, o(1200 + i * 11, { smooth: false })));
            TI.push(inkPath(cut, o(1201 + i * 11, { smooth: false, w: 6 })));
            for (let x = x0 + 18; x < x1 - 10; x += 26) TI.push(inkPath([[x, gy0 + 12], [x, yb - 6]], o(1202 + i * 11 + x, { w: 2.2, amp: 0.5 })));
            TI.push(inkPath([[x0 + 10, yb - 14], [x1 - 10, yb - 14]], o(1203 + i * 11, { w: 4 })));
            if (c.bags) [x0 - 70, x1 + 4].forEach((bx, j) => {
              for (let r = 0; r < 2; r++) for (let q = 0; q < 3 - r; q++) {
                const cx = bx + 12 + q * 24 + r * 12, cy = gy0 - 10 - r * 18;
                const pts = inkEllipsePts(cx, cy, 15, 9, sd + 1300 + i * 40 + j * 20 + r * 5 + q, 8);
                BF.push(inkLoop(pts, o(1300 + i * 40 + j * 20 + r * 5 + q, { amp: 0.6 })));
                BI.push(inkPath(pts, o(1340 + i * 40 + j * 20 + r * 5 + q, { closed: true, w: 3, amp: 0.6 })));
              }
            });
          });
          lay.trF.setAttribute('d', TF.join(' ')); lay.trI.setAttribute('d', TI.join(' '));
          lay.bagF.setAttribute('d', BF.join(' ')); lay.bagI.setAttribute('d', BI.join(' '));
          // ground line with crater bowls + berms (gaps over trenches), mud clods
          const GP = [], CR = [];
          let seg = [];
          for (let x = -40; x <= W + 40; x += 24) {
            if (inTrench(x)) { if (seg.length > 1) GP.push(seg); seg = []; continue; }
            seg.push([x, gyT(x)]);
          }
          if (seg.length > 1) GP.push(seg);
          lay.groundI.setAttribute('d', GP.map((s2, i) => inkPath(s2, o(1400 + i, { w: 6 }))).join(' '));
          craters.forEach((c, i) => {
            const pts = []; for (let k = 0; k <= 12; k++) { const x = c.x - c.w / 2 + c.w * k / 12; pts.push([x, gyT(x)]); }
            pts.push([c.x + c.w * 0.3, gy0 + 4], [c.x - c.w * 0.3, gy0 + 4]);
            CR.push(inkLoop(pts, o(1500 + i, { amp: 0.8 })));
          });
          lay.crater.setAttribute('d', CR.join(' '));
          lay.mud.setAttribute('d', clods.map((q, k) => { const x = q[0] * W; if (inTrench(x)) return ''; const y = gyT(x) + 14 + q[1] * 60;
            return inkPath([[x, y], [x + 16 + q[2] * 26, y + 2]], { seed: sd + 1600 + k, t, w: 2.6, amp: 0.6 }); }).join(' '));

          // tanks
          const smoke = [], sparks = [], blackCols = [], snaps = [];
          const tankOut = tanks.map(({ k, r }, i) => {
            const s = k.s ?? 0.6, face = k.face === -1 || k.face === 'left' ? -1 : 1;
            const a0 = at(k.at, 0), d0 = k.dur ?? 4;
            const deadAt = k.dead != null ? at(k.dead, null) : null;
            let u = k.to == null ? 0 : clamp01((lt - a0) / d0);
            if (deadAt != null && lt > deadAt) u = Math.min(u, clamp01((deadAt - a0) / d0) + 0.012 * clamp01((lt - deadAt) / 0.5));
            const xs = k.x * W, xe = (k.to ?? k.x) * W, x = lerp(xs, xe, u);
            const rowY = k.y != null ? k.y * H : null;
            const half = 210 * s;
            const yf = rowY ?? gyT(x + face * half), yr = rowY ?? gyT(x - face * half);
            let a = Math.atan2(yr - yf, 2 * half) * 180 / Math.PI, y = (yf + yr) / 2;
            const moving = k.to != null && lt > a0 && u < 1 && !(deadAt != null && lt > deadAt);
            if (moving) a += Math.sin(lt * 2.2 + i) * (1.2 + (k.rock || 0)) + Math.sin(lt * 5.3 + i * 2) * 0.5 * (1 + (k.rock || 0) * 0.3);
            else if (k.rock && !(deadAt != null && lt > deadAt)) a += Math.sin(lt * 1.8 + i) * k.rock;
            let dead = deadAt != null ? clamp01((lt - deadAt) / 0.8) : 0;
            if (k.stuck) {   // nose dives into the trench in front
              const sa = at(k.stuck.at, null), kk = sa == null ? 0 : progIO(lt, sa, 1.2);
              a -= 20 * kk; y += 50 * kk * s / 0.6; dead = Math.max(dead, kk);
            }
            let fire = 0;
            (k.fire || []).forEach(fn => { const fa = at(fn, null); if (fa != null && lt >= fa && lt < fa + 0.35) fire = Math.max(fire, 1 - (lt - fa) / 0.35); });
            const ph = (x - xs) / s * face;
            const res = r.update(t, { x, y, a, face, s, ph, fire, dead, shake: moving ? 0.8 : 0 });
            // exhaust smoke: puffs drift up and back
            if (k.smoke !== false && res.exhaust) for (let q = 0; q < 5; q++) {
              const age = ((lt * 0.9 + q / 5) % 1);
              smoke.push({ x: res.exhaust[0] - face * age * 140 * s / 0.6 + Math.sin(lt + q) * 6, y: res.exhaust[1] - age * 150 * s / 0.6, r: (10 + age * 34) * s / 0.6 });
            }
            if (dead > 0) blackCols.push({ x: res.center[0], y: res.top[1], k: dead, s });
            if (k.snap && dead > 0) snaps.push({ x: x - face * 240 * s, face, s, k: dead });
            const sp = k.sparks != null ? at(k.sparks, null) : null;
            if (sp != null && lt >= sp) for (let q = 0; q < 4; q++) {
              const ph2 = ((lt - sp) * 2.6 + q * 0.27) % 1, rr = rng(sd + 1700 + q + Math.floor((lt - sp) * 2.6 + q * 0.27) * 7);
              const cx = lerp(res.rear[0], res.nose[0], 0.3 + rr() * 0.6), cy = res.center[1] - rr() * 120 * s / 0.6;
              if (ph2 < 0.35) sparks.push({ x: cx, y: cy, r: (18 + 30 * ph2) * s / 0.6, a: rr() * 6 });
            }
            return { res, x, face, s };
          });
          // wire flattened where a tank has driven over it
          const crushMem = x => { let c = 0; tankOut.forEach((q, i) => { const k = tanks[i].k; if (k.to == null) return;
            const xs = k.x * W, cur = q.res.rear[0], nose = q.res.nose[0];
            if (q.face > 0 && x > xs && x < Math.max(cur, nose)) c = 1; if (q.face < 0 && x < xs && x > Math.min(cur, nose)) c = 1; }); return c; };
          const WP = [], WC = [];
          (P.wire || []).forEach((wv, i) => { const r2 = T.wire(wv.x0 * W, wv.x1 * W, gyT, t, sd + 1800 + i * 500, crushMem, { h: wv.h ?? 70 }); WP.push(r2.posts); WC.push(r2.coil); });
          lay.wireP.setAttribute('d', WP.join(' ')); lay.wireC.setAttribute('d', WC.join(' '));
          // a snapped track lying behind the tank: a loose chain of plates on the ground
          const SF = [], SI = [];
          snaps.forEach((q, j) => { const len = 520 * q.s * q.k, n = Math.max(2, Math.round(len / (40 * q.s)));
            for (let i = 0; i < n; i++) { const x0 = q.x - q.face * i * 40 * q.s, y0 = gyT(x0) - 4 + Math.sin(i * 1.7) * 3, w = 36 * q.s, h = 16 * q.s;
              const pl = [[x0, y0 - h], [x0 - q.face * w, y0 - h + 2], [x0 - q.face * w, y0 + 2], [x0, y0]];
              SF.push(inkLoop(pl, o(3000 + j * 40 + i, { smooth: false, amp: 0.6 }))); SI.push(inkPath(pl, o(3100 + j * 40 + i, { closed: true, smooth: false, w: 3 }))); } });
          snapF.setAttribute('d', SF.join(' ')); snapI.setAttribute('d', SI.join(' '));
          // black smoke columns over broken tanks
          const BC = [], BCI = [];
          blackCols.concat((P.smoke_black || []).map((q, i) => { const a2 = at(q.at, 0); return lt >= a2 ? { x: q.x * W, y: q.y * H, k: clamp01((lt - a2) / 0.8), s: q.s ?? 0.6 } : null; }).filter(Boolean))
            .forEach((c, i) => { for (let q = 0; q < 6; q++) { const age = (lt * 0.35 + q / 6) % 1, r = (24 + age * 70) * c.s / 0.6 * c.k;
              const pts = inkEllipsePts(c.x + Math.sin(age * 5 + q) * 20 - age * 80 * c.s, c.y - age * 380 * c.s / 0.6, r, r * 0.85, sd + 1900 + i * 10 + q, 10, 0, 0.1);
              BC.push(inkLoop(pts, o(1900 + i * 10 + q))); if (q % 2) BCI.push(inkPath(pts, o(1950 + i * 10 + q, { closed: true, w: 3 }))); } });
          lay.smokeBF.setAttribute('d', BC.join(' ')); lay.smokeBI.setAttribute('d', BCI.join(' '));
          const pf = T.puffs(smoke, t, sd + 2000);
          fx.smF.setAttribute('d', pf.fill); fx.smI.setAttribute('d', pf.ink);
          fx.spark.setAttribute('d', sparks.map((q, i) => inkLoop(Array.from({ length: 10 }, (_, k) => { const an = q.a + k / 10 * 6.2832, rr = (k % 2 ? 0.35 : 1) * q.r; return [q.x + Math.cos(an) * rr, q.y + Math.sin(an) * rr]; }), o(2100 + i, { smooth: false, amp: 0.6 }))).join(' '));
          fx.sparkI.setAttribute('d', sparks.map((q, i) => inkPath([[q.x, q.y], [q.x - q.r * 2, q.y - q.r * 1.4]], o(2150 + i, { w: 3 }))).join(' '));
          // shell bursts
          const BCl = [], BIn = [], BFl = [];
          (P.bursts || []).forEach((b, i) => { const a2 = at(b.at, 0.3 + i * 0.8); const r2 = T.burst(b.x * W, (b.y ?? G) * H, lt - a2, b.size ?? 90, t, sd + 2200 + i * 40);
            BCl.push(r2.cloud); BIn.push(r2.ink); BFl.push(r2.flash); });
          fx.bCloud.setAttribute('d', BCl.join(' ')); fx.bInk.setAttribute('d', BIn.join(' ')); fx.bFlash.setAttribute('d', BFl.join(' '));
          // cast + helmets
          const cres = cast.update(lt, t, cues);
          const HF = [], HI = [], RF2 = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return;
            if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 2400 + i * 20); HF.push(h.fill); HI.push(h.ink); }
            if (m.moustache) HI.push(T.moustache(q.head, q.face, q.s, t, sd + 2500 + i * 7));
            if (m.rifle) { const x = q.x + q.face * 40 * q.s / 0.6, y = q.y; RF2.push(inkPath([[x - q.face * 30 * q.s / 0.6, y - 120 * q.s / 0.6], [x + q.face * 40 * q.s / 0.6, y - 360 * q.s / 0.6]], o(2600 + i, { w: 7 }))); }
          });
          helmF.setAttribute('d', HF.join(' ')); helmI.setAttribute('d', HI.join(' ')); rifle.setAttribute('d', RF2.join(' '));
          // mist bands in front of everything on the field
          if (P.mist) {
            const M = Object.assign({ x0: 0, x1: 1, y0: 0.5, y1: 0.82, bands: 7 }, P.mist), ca = at(M.clear, null);
            const thin = ca == null ? 1 : 1 - 0.75 * progIO(lt, ca, 1.6);
            const A = [], Bm = [];
            for (let k = 0; k < M.bands; k++) {
              const y = lerp(M.y0, M.y1, k / Math.max(1, M.bands - 1)) * H, drift = ((lt * (14 + k * 4) + k * 170) % 400) - 200;
              const x0 = M.x0 * W - 200 + drift, x1 = M.x1 * W + 200 + drift, hh = 34 + (k % 3) * 14;
              const pts = []; for (let x = x0; x <= x1; x += 80) pts.push([x, y - hh * (0.6 + 0.4 * Math.sin(x * 0.01 + k))]);
              for (let x = x1; x >= x0; x -= 80) pts.push([x, y + hh * (0.6 + 0.4 * Math.cos(x * 0.012 + k))]);
              (k % 2 ? Bm : A).push(inkLoop(pts, o(2700 + k, { amp: 2 })));
            }
            mistL.setAttribute('d', A.join(' ')); mistL.setAttribute('fill-opacity', (0.6 * thin).toFixed(3));
            mistL2.setAttribute('d', Bm.join(' ')); mistL2.setAttribute('fill-opacity', (0.42 * thin).toFixed(3));
          }
          // biplane
          if (P.plane) {
            const p2 = P.plane, a2 = at(p2.at, 0), u2 = progIO(lt, a2, p2.dur ?? 5);
            const x = lerp(p2.x * W, (p2.to ?? p2.x) * W, u2), y = (p2.y ?? 0.2) * H + Math.sin(lt * 1.3) * 8;
            const pl = T.plane(x, y, p2.s ?? 0.9, p2.face === -1 ? -1 : 1, t, sd + 2800);
            planeF.setAttribute('d', pl.fill); planeI.setAttribute('d', pl.ink);
          }
          // foreground parapet (sandbags along the bottom of the frame)
          if (PAR) {
            const PF = [], PI = [], PS = [];
            const y0 = PAR.y * H;
            for (let r = 0; r < 4; r++) for (let x = PAR.from * W - 60 + (r % 2) * 55; x < PAR.to * W + 60; x += 112) {
              const cy = y0 + r * 60, k = r * 100 + Math.round(x / 112);
              const pts = inkEllipsePts(x, cy, 62, 34, sd + 2900 + k, 10, (k % 5 - 2) * 0.03, 0.05);
              PF.push(inkLoop(pts, o(2900 + k, { amp: 0.8 })));
              PI.push(inkPath(pts, o(3300 + k, { closed: true, w: 5, amp: 0.8 })));
              PS.push(inkPath([[x - 40, cy + 14], [x + 40, cy + 16]], o(3700 + k, { w: 2.5, amp: 0.5 })));
            }
            parF.setAttribute('d', PF.join(' ')); parI.setAttribute('d', PI.join(' ')); parS.setAttribute('d', PS.join(' '));
          }
          const hit = punch(lt, at('hit', null), 0.6), shA = P.shake != null ? at(P.shake, null) : null, shk = shA == null ? 0 : punch(lt, shA, 0.9);
          const sx = shk ? Math.sin(lt * 63) * 12 * shk : 0, sy = shk ? Math.cos(lt * 51) * 8 * shk : 0;
          cam.setAttribute('transform', `translate(${(sx).toFixed(1)} ${(sy).toFixed(1)}) translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
