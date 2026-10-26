// ra_siphon: Byzantine "Rum ateşi" (Greek fire) at sea, in parchment ink (theme "parchment", brand/kit/BRAND.md §3, §5).
// Built on SHOTS.pv_sea (sea, horizon, galleys with blue/red pennants, ships catching fire, ledge, cast, labels, camera)
// and draws on top of it, inside the same camera group (so it pushes in with the sea):
//   · bronze siphon tubes mounted on a bow (gold tube, ink bands, flared mouth, a small pump lever that works);
//   · jets of liquid fire: a tapered red stream with a gold core that shoots along an arc from the mouth to a target,
//     wobbles, drips burning drops, can sweep across targets and stop (the tail then flies off);
//   · burning slicks floating on the waves (fire that water does not put out): gold/red pool, flame tongues, ripples,
//     rising smoke; on a "flare" cue the flames jump up;
//   · splashes: water thrown along an arc (blue stream + drops); where it lands, steam puffs and the fire flares.
// Every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt). Colours only from INK tokens.
//
// SHOTS.ra_siphon P: {...every pv_sea param (horizon, shore, wind, ships, guns, ledge, labels, cast, shake, zoom, focus),
//   siphons: [{x: 0.3, y: 0.5 (0..1 frame: the mouth), aim: 0 (deg, 0 = right, + = down), len: 150 (px at 1080 wide),
//              at: cue|s (springs in; default 0), pump: true (lever pumps while its jets stream)}],
//   jets: [{from: [x, y] | siphon index (default 0), to: [x, y], at: cue|s, dur: 0.45 (shoot time), stop: cue|s,
//           arc: 0.18 (upward bulge, share of the length), w: 1 (thickness), sweep: [[x, y], ...], sweep_at: cue|s,
//           sweep_dur: 1.2 (the target slides through the sweep points)}],
//   pools: [{x: 0.6, y: 0.6 (waterline, 0..1), at: cue|s (ignites; negative = already burning), w: 1 (size),
//            flare: cue|s | [cues] (flames jump up), h: 1 (flame height; 0.5 = a low, flat burning slick), n: 7 (tongues)}],
//   splashes: [{from: [x, y], to: [x, y], at: cue|s, dur: 0.55, bucket: false (a wooden bucket at "from" tips over),
//               pour: 0 (s the stream keeps flowing after it lands), leap: 300, leap_w: 120 (px: the flame that leaps up where the water lands)}],
//   waves: true | {y0: 0.46, y1: 0.66, rows: 5, n: 6} (ink wave crests drifting on the water, kept out of the slicks)
// }
// cues: whatever the params name (jet at/stop/sweep_at, pool at/flare, splash at, siphon at, + pv_sea cues).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  // one fill path holds many shapes: give every loop the same winding, or overlaps cancel into holes (nonzero rule)
  const orient = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a < 0 ? pts.slice().reverse() : pts; };
  const loop = (pts, o) => inkLoop(orient(pts), o);
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  // layer order (back to front): water ripples, smoke, red flames, gold cores, bronze, ink outlines, water, steam
  const LAYERS = ['rimb', 'wave', 'smoke', 'red', 'gold', 'bronze', 'ink', 'blue', 'light', 'rim'];

  function tongue(fx, y0, w, h, t, ph) {
    const L = [], R = [];
    for (let s = 0; s <= 6; s++) {
      const u = s / 6, wid = w * Math.pow(1 - u, 0.75), sw = Math.sin(t * 9 + ph + u * 4) * w * 0.35 * u;
      L.push([fx - wid + sw, y0 - h * u]); R.push([fx + wid + sw, y0 - h * u]);
    }
    const tip = [fx + Math.sin(t * 7 + ph) * w * 0.7, y0 - h * 1.12];
    return L.slice(0, -1).concat([tip]).concat(R.slice(0, -1).reverse());
  }

  SH.ra_siphon = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, S = portrait ? W / 1080 : H / 1080, sd = seed * 1000 + 613;
      const inner = SH.pv_sea ? SH.pv_sea.build(ctx) : null;
      // our group lives inside pv_sea's camera group, just below its cast (Kaşif stays in front of the fire)
      const pvRoot = svg.lastChild, cam = pvRoot && pvRoot.firstChild;
      const castG = cam ? cam.lastChild : null;            // pv_sea appends its cast group last
      const host = el(cam || svg, 'g');
      if (castG) cam.insertBefore(host, castG);
      const E = {}, B = {};
      const fills = { rimb: [INK.inkSoft], wave: [INK.ink], smoke: [INK.inkSoft, { 'fill-opacity': 0.42 }], red: [INK.red], gold: [INK.gold], bronze: [INK.gold],
        ink: [INK.ink], blue: [INK.blue], light: [INK.paperLight], rim: [INK.inkSoft] };
      LAYERS.forEach(k => { E[k] = inkEl(host, fills[k][0], fills[k][1] || {}); B[k] = ''; });
      const add = (k, d) => { B[k] += d + ' '; };
      const X = u => u * W, Y = v => v * H;

      const siphons = (P.siphons || []).map(s => Object.assign({ x: 0.3, y: 0.5, aim: 0, len: 150, at: 0, pump: true }, s));
      const jets = (P.jets || []).map(j => Object.assign({ dur: 0.45, arc: 0.18, w: 1, sweep_dur: 1.2 }, j));
      const pools = (P.pools || []).map(p => Object.assign({ x: 0.6, y: 0.6, at: 0, w: 1 }, p));
      const splashes = (P.splashes || []).map(s => Object.assign({ dur: 0.55 }, s));

      function puff(x, y, r, sdd, t, kind) {
        [[-0.55, 0.15, 0.62], [0.5, 0.18, 0.66], [0, -0.22, 0.8]].forEach(([dx, dy, k], i) => {
          const pts = inkEllipsePts(x + dx * r, y + dy * r, r * k, r * k * 0.86, sdd + i * 5, 10, 0, 0.06);
          if (kind === 'steam') { add('light', loop(pts, { seed: sdd + i, t, amp: 1 })); add('rim', inkPath(pts, { w: 3.5 * S, seed: sdd + i + 3, t, closed: true, amp: 1 })); }
          else add('smoke', loop(pts, { seed: sdd + i, t, amp: 1 }));
        });
      }
      // one flame wall: a single silhouette whose top edge rises into n licking tongues (pointed peaks with concave
      // sides that lean and flicker), red outside, a gold core inside; reads as one fire, not a row of spikes
      function wallPts(cx, y, half, hgt, n, t, ph, k) {
        const N = 30, top = [];
        const peaks = Array.from({ length: n }, (_, i) => {
          const u = n > 1 ? (i + 0.5) / n * 2 - 1 : 0;
          return { x: cx + u * half * 0.9 + Math.sin(t * 2.3 + i * 1.9 + ph) * half * 0.05,
            h: hgt * (1 - 0.5 * u * u) * (0.62 + 0.38 * Math.abs(Math.sin(t * 3.1 + i * 2.7 + ph))) * (i % 2 ? 0.78 : 1),
            w: half / n * 1.9 };
        });
        for (let q = 0; q <= N; q++) {
          const x = cx - half + 2 * half * q / N, e = 1 - Math.pow(Math.abs(x - cx) / half, 4);
          let h = hgt * 0.16 * e;
          peaks.forEach(p => { const d = Math.abs(x - p.x) / p.w; if (d < 1) h = Math.max(h, p.h * Math.pow(1 - d, 1.35)); });
          h *= k;
          const lean = Math.sin(t * 4.2 + x * 0.012 + ph) * h * 0.12;
          top.push([x + lean, y - h * Math.max(0, e)]);
        }
        return [[cx + half, y + 6 * S]].concat(top.reverse(), [[cx - half, y + 6 * S]]);
      }
      // a burst of fat, curling flame tongues fanning up and out from one point (fire leaping where water hit it)
      function fireBurst(x, y, size, half, sdd, t) {
        if (size < 8) return;
        const n = 5;
        for (let i = 0; i < n; i++) {
          const f = i / (n - 1) * 2 - 1, ang = f * 0.55 + Math.sin(t * 3.3 + i * 1.7) * 0.07;
          const h = size * (1 - 0.38 * f * f) * (0.85 + 0.15 * Math.sin(t * 7 + i * 2.3)), w = half * 0.42 * (1 - 0.25 * Math.abs(f));
          const bx = x + f * half * 0.55, ca = Math.cos(ang), sa = Math.sin(ang);
          const side = k => {
            const pts = [];
            for (let m = 0; m <= 8; m++) {
              const u = m / 8, hw = w * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.9 + 0.1)), 0.7) * (1 - 0.55 * u);
              const cxu = Math.sin(t * 8 + i * 1.3 + u * 3.2) * w * 0.55 * u;
              const lx = cxu + k * hw, ly = -h * u;
              pts.push([bx + lx * ca - ly * sa, y + lx * sa + ly * ca]);
            }
            return pts;
          };
          const tipU = [Math.sin(t * 8 + i * 1.3 + 3.4) * w * 0.7, -h * 1.08], tip = [bx + tipU[0] * ca - tipU[1] * sa, y + tipU[0] * sa + tipU[1] * ca];
          const outer = side(-1).concat([tip], side(1).reverse());
          add('red', loop(outer, { seed: sdd + i, t, amp: 1.2 }));
          add('ink', inkPath(outer, { w: 4 * S, seed: sdd + 20 + i, t, amp: 1.2, closed: true }));
          const core = outer.map(p => [bx + (p[0] - bx) * 0.5, y + (p[1] - y) * 0.6]);
          add('gold', loop(core, { seed: sdd + 40 + i, t, amp: 1 }));
        }
      }
      function flamesRow(cx, y, half, hgt, n, sdd, t, k) {
        if (hgt * k < 6) return;
        const outer = wallPts(cx, y, half, hgt, n, t, sdd % 11, k), core = wallPts(cx, y, half * 0.78, hgt * 0.58, Math.max(2, n - 1), t * 1.15, sdd % 11 + 1, k);
        add('red', loop(outer, { seed: sdd, t, amp: 1.2 }));
        add('ink', inkPath(outer.slice(1, -1), { w: 4 * S, seed: sdd + 40, t, amp: 1.2, taper: 0.5 }));
        add('gold', loop(core, { seed: sdd + 80, t, amp: 1 }));
        // a few sparks rising
        for (let q = 0; q < 5; q++) {
          const u = ((t * 0.9 + q * 0.21 + (sdd % 7) * 0.1) % 1), sx = cx + Math.sin(q * 2.9 + sdd) * half * 0.7 + Math.sin(t * 3 + q) * 12 * S;
          const sy = y - hgt * k * (0.7 + u * 0.9), r = (6 - u * 4) * S;
          if (r > 1) add('gold', inkDot(sx, sy, r, r, sdd + 90 + q, t));
        }
      }
      // quadratic arc from a to b, bulging up by arc * length
      const arcPt = (a, b, arc, u) => {
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const c = [mx, my - arc * L];
        const v = 1 - u;
        return [v * v * a[0] + 2 * v * u * c[0] + u * u * b[0], v * v * a[1] + 2 * v * u * c[1] + u * u * b[1]];
      };
      const mouthOf = (s, lt, cues) => {
        const ap = spring(lt, atOr(cues, s.at, 0), 0.5), a = s.aim * Math.PI / 180;
        return { x: X(s.x), y: Y(s.y), a, ap };
      };

      return {
        update(lt, dur, cues, env = {}) {
          if (inner) inner.update(lt, dur, cues, env);
          const t = env.t ?? lt;
          LAYERS.forEach(k => { B[k] = ''; });

          // ---- wave crests on the water (drawn under the fire; none inside a burning slick)
          if (P.waves) {
            const Wv = Object.assign({ y0: 0.46, y1: 0.66, rows: 5, n: 6 }, P.waves === true ? {} : P.waves);
            for (let r = 0; r < Wv.rows; r++) {
              const y = Y(lerp(Wv.y0, Wv.y1, Wv.rows > 1 ? r / (Wv.rows - 1) : 0)), k = 0.6 + 0.4 * r / Math.max(1, Wv.rows - 1);
              if (H > W && y > 1150 && y < 1330) continue;
              for (let q = 0; q < Wv.n; q++) {
                const span = W + 240 * S, x = ((q / Wv.n * span + t * (22 + r * 6) * S + r * 97) % span) - 120 * S, len = 90 * S * k;
                if (pools.some(p => Math.abs(x + len / 2 - X(p.x)) < 200 * S * p.w && Math.abs(y - Y(p.y)) < 60 * S)) continue;
                if ((P.cast || []).some(c => x < X(c.x ?? 0.8) + 110 * S * (c.scale ?? 0.5) * 2 && x + len * 1.6 > X(c.x ?? 0.8) - 110 * S * (c.scale ?? 0.5) * 2 && y < Y(c.y ?? 0.7) + 10 * S && y > Y(c.y ?? 0.7) - 560 * S * (c.scale ?? 0.5))) continue;
                const pts = Array.from({ length: 9 }, (_, m) => [x + len * 1.6 * m / 8, y - Math.sin(m / 8 * Math.PI * 3 + t * 2 + q) * 6 * S * k]);
                add('wave', inkPath(pts, { w: 4.5 * S * k, seed: sd + 700 + r * 31 + q, t, amp: 1.2 }));
              }
            }
          }

          // ---- burning slicks on the water
          pools.forEach((p, i) => {
            const a0 = atOr(cues, p.at, 0);
            if (lt < a0) return;
            const g = a0 < 0 ? 1 : sm((lt - a0) / 0.7);
            const fl = [].concat(p.flare == null ? [] : p.flare).map(c => atOr(cues, c, null)).filter(v => v != null);
            let flare = 0; fl.forEach(fa => { if (lt >= fa) flare = Math.max(flare, Math.exp(-(lt - fa) * 0.9) * (1 - Math.exp(-(lt - fa) * 14))); });
            const cx = X(p.x), cy = Y(p.y) + Math.sin(t * 1.6 + i) * 4 * S, rx = 190 * S * p.w * (0.35 + 0.65 * g), ry = rx * 0.16;
            // ripples
            for (let r = 0; r < 2; r++) {
              const u = ((lt * 0.45 + r * 0.5) % 1), rr = rx * (1.05 + u * 0.55);
              add('rimb', inkPath(inkEllipsePts(cx, cy + ry * 0.2, rr, rr * 0.16, sd + 900 + i * 7 + r, 14), { w: 3.5 * S * (1 - u * 0.6), seed: sd + 920 + i * 7 + r, t, closed: true, amp: 1 }));
            }
            const slick = inkEllipsePts(cx, cy, rx, ry, sd + 940 + i, 14, 0, 0.08);
            add('red', loop(slick, { seed: sd + 950 + i, t, amp: 1.2 }));
            add('gold', loop(inkEllipsePts(cx, cy - ry * 0.1, rx * 0.66, ry * 0.55, sd + 960 + i, 12, 0, 0.1), { seed: sd + 961 + i, t, amp: 1 }));
            add('ink', inkPath(slick.slice(0, 8).concat([slick[0]]).slice(0, 8), { w: 4 * S, seed: sd + 970 + i, t, amp: 1.2, taper: 0.4 }));
            flamesRow(cx, cy - ry * 0.2, rx * 0.86, 170 * S * p.w * (p.h ?? 1) * g * (1 + 0.8 * flare), p.n ?? 7, sd + 1000 + i * 50, t, 1);
            // smoke rising
            for (let q = 0; q < 4; q++) {
              const u = ((lt - a0) * 0.42 + q * 0.25) % 1;
              puff(cx + Math.sin(q * 2.3 + u * 3) * rx * 0.4 + u * 60 * S, cy - 170 * S * p.w * (p.h ?? 1) * (0.7 + u * 1.6), (18 + u * 46) * S * Math.min(1.2, p.w * (p.h ?? 1)) * Math.min(1, (lt - a0) * 1.5 + 0.4), sd + 1100 + i * 9 + q, t);
            }
          });

          // ---- siphon tubes
          siphons.forEach((s, i) => {
            const m = mouthOf(s, lt, cues);
            if (m.ap <= 0.01) return;
            const L = s.len * S * m.ap, c = Math.cos(m.a), sn = Math.sin(m.a), nx = -sn, ny = c, r = 17 * S;
            const back = [m.x - c * L, m.y - sn * L];
            const P4 = (u, k) => [lerp(back[0], m.x, u) + nx * r * k, lerp(back[1], m.y, u) + ny * r * k];
            const tube = [P4(0, -1), P4(0.88, -1), P4(1, -1.5), P4(1, 1.5), P4(0.88, 1), P4(0, 1)];
            add('bronze', loop(tube, { seed: sd + 1200 + i, t, amp: 0.8, smooth: false }));
            add('ink', inkPath(tube, { w: 5 * S, seed: sd + 1210 + i, t, closed: true, amp: 0.8, smooth: false }));
            [0.25, 0.55].forEach((u, k) => add('ink', inkPath([P4(u, -1), P4(u, 1)], { w: 4 * S, seed: sd + 1220 + i * 3 + k, t, amp: 0.6, taper: 0 })));
            // pump lever behind the tube: pivots while a jet from this siphon streams
            const streaming = jets.some(j => (j.from == null ? 0 : j.from) === i && lt >= atOr(cues, j.at, 1e9) && lt < (atOr(cues, j.stop, 1e9)));
            if (s.pump) {
              const piv = P4(0.12, -1), ang = -Math.PI / 2 - 0.35 + (streaming ? Math.sin(lt * 14) * 0.35 : 0) + m.a;
              const tip = [piv[0] + Math.cos(ang) * 70 * S, piv[1] + Math.sin(ang) * 70 * S];
              add('ink', inkPath([piv, tip], { w: 6 * S, seed: sd + 1230 + i, t, amp: 0.8 }));
              add('ink', inkDot(tip[0], tip[1], 7 * S, 7 * S, sd + 1235 + i, t));
            }
          });

          // ---- jets of liquid fire
          jets.forEach((j, i) => {
            const a0 = atOr(cues, j.at, null);
            if (a0 == null || lt < a0) return;
            let A;
            if (Array.isArray(j.from)) A = [X(j.from[0]), Y(j.from[1])];
            else { const s = siphons[j.from || 0]; if (!s) return; const m = mouthOf(s, lt, cues); A = [m.x + Math.cos(m.a) * 8 * S, m.y + Math.sin(m.a) * 8 * S]; }
            let Bt = [X(j.to[0]), Y(j.to[1])];
            if (j.sweep && j.sweep.length) {
              const pts = [j.to].concat(j.sweep), sa = atOr(cues, j.sweep_at, a0 + j.dur), sp = progIO(lt, sa, j.sweep_dur) * (pts.length - 1);
              const k = Math.min(pts.length - 2, Math.floor(sp)), f = sp - k;
              Bt = [X(lerp(pts[k][0], pts[k + 1][0], f)), Y(lerp(pts[k][1], pts[k + 1][1], f))];
            }
            const head = prog(lt, a0, j.dur), so = atOr(cues, j.stop, null), tail = so != null ? prog(lt, so, 0.4) : 0;
            if (tail >= 0.999) return;
            const n = 18, top = [], bot = [], ctop = [], cbot = [];
            const u0 = tail * head, u1 = head;
            for (let q = 0; q <= n; q++) {
              const u = lerp(u0, u1, q / n), p = arcPt(A, Bt, j.arc, u), p2 = arcPt(A, Bt, j.arc, Math.min(1, u + 0.01));
              let tx = p2[0] - p[0], ty = p2[1] - p[1]; const ln = Math.hypot(tx, ty) || 1; tx /= ln; ty /= ln;
              const wob = Math.sin(t * 22 + u * 14 + i) * 7 * S * u;
              const wd = j.w * S * (9 + 24 * Math.pow(u, 0.8) + 4 * Math.sin(t * 17 + u * 9));
              const cx = p[0] - ty * wob, cy = p[1] + tx * wob;
              top.push([cx - ty * wd, cy + tx * wd]); bot.push([cx + ty * wd, cy - tx * wd]);
              ctop.push([cx - ty * wd * 0.42, cy + tx * wd * 0.42]); cbot.push([cx + ty * wd * 0.42, cy - tx * wd * 0.42]);
            }
            const outline = top.concat(bot.slice().reverse()), core = ctop.concat(cbot.slice().reverse());
            add('red', loop(outline, { seed: sd + 1300 + i, t, amp: 1.5 }));
            add('ink', inkPath(outline, { w: 4 * S, seed: sd + 1310 + i, t, closed: true, amp: 1.5 }));
            add('gold', loop(core, { seed: sd + 1320 + i, t, amp: 1.2 }));
            // burning drops falling off the stream
            for (let q = 0; q < 6; q++) {
              const u = lerp(u0, u1, 0.2 + q * 0.13), ph = ((lt * 1.7 + q * 0.37) % 1);
              if (u > u1) continue;
              const p = arcPt(A, Bt, j.arc, u);
              const dx = p[0] + ph * 10 * S, dy = p[1] + ph * ph * 160 * S + 20 * S, r = (9 - ph * 5) * S * j.w;
              add('red', inkDot(dx, dy, r, r * 1.2, sd + 1340 + i * 9 + q, t));
              add('gold', inkDot(dx, dy, r * 0.45, r * 0.5, sd + 1360 + i * 9 + q, t));
            }
            // impact: a burst of flame where the stream lands
            if (head > 0.92 && tail < 0.5) {
              const k = sm((lt - a0 - j.dur * 0.8) / 0.3) * (1 - tail * 2);
              flamesRow(Bt[0], Bt[1] + 10 * S, 80 * S * j.w, 110 * S * j.w * k, 3, sd + 1400 + i * 20, t, 1);
            }
            // smoke above the stream
            for (let q = 0; q < 3; q++) {
              const u = ((lt - a0) * 0.6 + q * 0.33) % 1, p = arcPt(A, Bt, j.arc, lerp(u0, u1, 0.3 + q * 0.25));
              puff(p[0] + u * 40 * S, p[1] - 50 * S - u * 140 * S, (14 + u * 34) * S, sd + 1450 + i * 7 + q, t);
            }
          });

          // ---- water thrown at the fire: a bucket tips, a thick blue arc lands on the slick, the flames LEAP up there
          splashes.forEach((s, i) => {
            const a0 = atOr(cues, s.at, null);
            const A = [X(s.from[0]), Y(s.from[1])], Bt = [X(s.to[0]), Y(s.to[1])];
            const left = Bt[0] < A[0] ? -1 : 1;
            if (s.bucket) {   // wooden bucket in the thrower's hands: upright, then tipped toward the fire
              const tip = a0 == null ? 0 : progIO(lt, a0 - 0.15, 0.3), ang = left * (tip * 115 + Math.sin(t * 2) * 3) * Math.PI / 180;
              const c = Math.cos(ang), sn = Math.sin(ang), bw = 34 * S, bh = 46 * S;
              const tf = q => [A[0] + q[0] * c - q[1] * sn, A[1] + 20 * S + q[0] * sn + q[1] * c];
              const body = [[-bw, -bh], [bw, -bh], [bw * 0.78, bh * 0.6], [-bw * 0.78, bh * 0.6]].map(tf);
              add('bronze', loop(body, { seed: sd + 1580 + i, t, amp: 0.8, smooth: false }));
              add('ink', inkPath(body, { w: 5 * S, seed: sd + 1581 + i, t, closed: true, amp: 0.8, smooth: false }));
              [[-0.55, 0.92], [0.25, 0.83]].forEach(([v, k], q) => add('ink', inkPath([tf([-bw * k, bh * v]), tf([bw * k, bh * v])], { w: 4 * S, seed: sd + 1582 + i * 3 + q, t, amp: 0.6, taper: 0 })));
              if (tip < 0.5) add('blue', loop([[-bw * 0.92, -bh], [bw * 0.92, -bh], [bw * 0.86, -bh * 0.7], [-bw * 0.86, -bh * 0.7]].map(tf), { seed: sd + 1585 + i, t, amp: 0.6, smooth: false }));
            }
            if (a0 == null || lt < a0) return;
            const pr = lin(lt, a0, s.dur);
            const pour = s.pour ?? 0, land0 = a0 + s.dur;
            if (pr < 1 || lt < land0 + pour) {   // the water body: a thick tapered band with an ink edge (keeps pouring)
              const u0 = pr < 1 ? Math.max(0, pr - 0.55) : prog(lt, land0 + pour - 0.3, 0.3), u1 = pr, top = [], bot = [];
              for (let q = 0; q <= 14; q++) {
                const u = lerp(u0, u1, q / 14), p0 = arcPt(A, Bt, 0.35, u), p2 = arcPt(A, Bt, 0.35, Math.min(1, u + 0.01));
                let tx = p2[0] - p0[0], ty = p2[1] - p0[1]; const ln = Math.hypot(tx, ty) || 1; tx /= ln; ty /= ln;
                const wd = S * (10 + 22 * (q / 14)) * (0.9 + 0.1 * Math.sin(t * 19 + q));
                top.push([p0[0] - ty * wd, p0[1] + tx * wd]); bot.push([p0[0] + ty * wd, p0[1] - tx * wd]);
              }
              const band = top.concat(bot.reverse());
              add('blue', loop(band, { seed: sd + 1500 + i, t, amp: 1.2 }));
              add('ink', inkPath(band, { w: 3 * S, seed: sd + 1501 + i, t, closed: true, amp: 1.2 }));
              for (let q = 0; q < 6; q++) {
                const u = pr + 0.03 - q * 0.07; if (u < 0 || u > 1) continue;
                const p0 = arcPt(A, Bt, 0.35, u);
                add('blue', inkDot(p0[0] + Math.sin(q * 2.1) * 26 * S, p0[1] + 18 * S + Math.cos(q * 1.7) * 16 * S, 9 * S, 11 * S, sd + 1520 + i * 9 + q, t));
              }
            }
            const land = a0 + s.dur;
            if (lt >= land) {
              const u = lt - land;
              // splash crown of blue drops
              if (u < 0.6) for (let q = 0; q < 7; q++) {
                const a = -Math.PI * (0.15 + 0.7 * q / 6), r = (40 + 110 * u) * S;
                add('blue', inkDot(Bt[0] + Math.cos(a) * r, Bt[1] + Math.sin(a) * r * 0.8 + u * u * 300 * S, 9 * S * (1 - u), 11 * S * (1 - u), sd + 1540 + i * 9 + q, t));
              }
              // the fire leaps up exactly where the water hit (it does not go out)
              const k = Math.min(1, u / 0.25) * (1 - 0.3 * sm((u - 0.3) / 1.2));
              fireBurst(Bt[0], Bt[1] + 10 * S, (s.leap ?? 300) * S * k, (s.leap_w ?? 120) * S, sd + 1560 + i * 20, t);
              // hiss: three grey steam curls rising and thinning
              for (let q = 0; q < 3; q++) {
                const uu = (u * 0.7 + q * 0.3) % 1.2, x0 = Bt[0] + (q - 1) * 70 * S, y0 = Bt[1] - 120 * S - uu * 260 * S;
                if (u > 3 || uu > 1) continue;
                const pts = Array.from({ length: 6 }, (_, m) => [x0 + Math.sin(m * 1.3 + t * 3 + q) * 18 * S, y0 - m * 22 * S]);
                add('rim', inkPath(pts, { w: 5 * S * (1 - uu * 0.6), seed: sd + 1550 + i * 7 + q, t, amp: 1 }));
              }
            }
          });

          LAYERS.forEach(k => E[k].setAttribute('d', B[k]));
        },
      };
    },
  };
})();
