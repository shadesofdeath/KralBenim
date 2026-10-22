// pekmez: the Great Molasses Flood (Boston, 15 January 1919) in the parchment ink style (brand/kit/BRAND.md §5;
// every line boils at 8 Hz via _ink.js). A harbour street with a far row of brick buildings and an elevated
// railway trestle, a giant riveted storage tank, leaking seams, a worker painting the tank brown with a long
// brush, the tank shaking, cracking and splitting open, a dark molasses wave with a curling crest rushing down the
// street (debris riding on it), a thick molasses swamp where people are stuck, and a red "stamp" verdict.
// Molasses is ink-soft brown with stain highlights (palette only, no extra colours).
//
// SHOTS.pekmez P: {
//   mode: "tank"|"paint"|"burst"|"wave"|"stuck"|"wreck",
//     tank  — the whole tank standing on the street (optional height marker, leaks)
//     paint — a worker on the ground paints the tank brown from the bottom up with a long brush; leaks disappear
//     burst — the tank shivers, cracks on cue "crack", splits open on cue "hit", the flood runs down the street
//     wave  — the flood wave runs left -> right across the frame (broken tank behind), debris on the surface
//     stuck — the street is a thick molasses swamp in front of the cast (they stand sunk in it), slow ripples
//     wreck — broken tank halves lying in a molasses puddle; optional stamp on cue "stamp"
//   tank: {x: 0.3, scale: 1, painted: false|true, splay: 84 (deg the split halves fall open)},
//   deep: true,                // wave/burst: the flood fills the foreground down to the frame bottom   // tank position (0..1 W) and look
//   leaks: true,               // dripping seams (tank / paint modes)
//   measure: {text: "15 m", at},   // dimension line along the tank side
//   wave: {from: 0.05, to: 0.75, h: 1, at, dur},   // wave mode: front x travels from -> to (0..1 W) from cue/seconds `at`
//   sky: true, el: true,       // far buildings / elevated railway trestle
//   sink: 0.2,                 // stuck mode: swamp surface height above the ground (0..1 of the tank height)
//   cast: [{who: "kasif"|name, accessory, x, y (0..1 H), sink (px down into the ground), scale, pose, at, then,
//           to, face: "left"|"right", dir, emotion, wiggle: true (struggles side to side)}],
//   worker: {x: 0.68, accessory: "beret"}  // paint mode painter (period figure, no hat)
//   label: {text, x: 0.5, y: 0.2, at, size}, stamp: {text: "TEST YOK", x: 0.5, y: 0.3, at, rot: -8, size}
//   cam: {zoom: 1.06, focus: [0.5, 0.55]}
// }
// cues: crack, hit, paint, wave, stamp, cast/label/measure "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const rotAbout = (q, c, deg) => { const a = deg * Math.PI / 180, s = Math.sin(a), co = Math.cos(a), x = q[0] - c[0], y = q[1] - c[1]; return [c[0] + x * co - y * s, c[1] + x * s + y * co]; };

  SH.pekmez = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.72;
      const mode = P.mode || 'tank';
      const G = (P.ground ?? (portrait ? 0.585 : 0.8)) * H;
      const T = Object.assign({ x: mode === 'wave' ? 0.12 : 0.32, scale: 1, painted: mode === 'burst' || mode === 'wave' || mode === 'wreck' || mode === 'stuck' }, P.tank || {});
      const TS = (T.scale ?? 1) * K;
      const TW = 380 * TS, TH = 600 * TS, tx = T.x * W, x0 = tx - TW / 2, x1 = tx + TW / 2, top = G - TH;
      const r = rng(seed * 7 + 3);

      const cam = el(svg, 'g');
      const farG = el(cam, 'g'), streetG = el(cam, 'g'), tankG = el(cam, 'g'), fluidB = el(cam, 'g');
      const actorG = el(cam, 'g'), fluidF = el(cam, 'g'), fxG = el(cam, 'g'), uiG = el(svg, 'g');

      // ---------- far plane: brick buildings + elevated railway trestle
      const blds = [];
      if (P.sky !== false) {
        let x = -30;
        while (x < W + 40) {
          const w = (110 + r() * 90) * K, h = (230 + r() * 210) * K;
          blds.push({ x, w, h, roof: r() < 0.4, win: 2 + Math.floor(r() * 2) });
          x += w + (6 + r() * 14) * K;
        }
      }
      const bF = mk(farG, INK.paperDark, { 'fill-opacity': 0.55 }), bL = mk(farG, INK.inkSoft), bWin = mk(farG, INK.inkSoft, { 'fill-opacity': 0.7 });
      const elG = P.el !== false ? { L: mk(farG, INK.inkSoft), F: mk(farG, INK.paperDark, { 'fill-opacity': 0.8 }) } : null;
      const elY = G - 300 * K;
      // street
      const gL = mk(streetG), cob = mk(streetG, INK.inkSoft, { 'fill-opacity': 0.6 });

      // ---------- tank (two halves + roof, each its own group for the split)
      const half = side => {
        const g = el(tankG, 'g');
        return { g, f: mk(g, INK.paperLight), paint: mk(g, INK.inkSoft, { 'fill-opacity': 0.92 }), riv: mk(g, INK.ink), o: mk(g), side };
      };
      const tL = half(-1), tR = half(1);
      const roofG = el(tankG, 'g'), roofF = mk(roofG, INK.paperLight), roofP = mk(roofG, INK.inkSoft, { 'fill-opacity': 0.92 }), roofO = mk(roofG);
      const leakP = mk(tankG, INK.inkSoft), crackP = mk(tankG), jetP = mk(tankG, INK.inkSoft);
      const leaks = (P.leaks ?? (mode === 'tank' || mode === 'paint')) ? [0.18, 0.47, 0.8].map((u, i) => ({ u, y0: 0.25 + 0.22 * i, sp: 0.7 + 0.25 * i })) : [];
      const bands = [0.18, 0.4, 0.62, 0.84];
      // painter + brush
      let worker = null;
      if (mode === 'paint' && typeof KASIF !== 'undefined') {
        const Wk = Object.assign({ x: 0.7, accessory: 'beret', scale: portrait ? 0.5 : 0.42 }, P.worker || {});
        worker = { Wk, rig: KASIF.create(el(actorG, 'g'), { scale: Wk.scale, hat: false, accessory: Wk.accessory, seed: seed + 91 }), pole: mk(actorG), tip: mk(actorG, INK.inkSoft), tipO: mk(actorG) };
      }
      // measure line
      let meas = null;
      if (P.measure) {
        const M = typeof P.measure === 'string' ? { text: P.measure } : P.measure;
        const t = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': M.size || 84 * K, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = M.text || '15 m';
        meas = { M, t, p: mk(uiG, INK.red) };
      }
      // ---------- fluid
      const flB = { f: mk(fluidB, INK.inkSoft), hi: mk(fluidB, INK.stain), o: mk(fluidB), drops: mk(fluidB, INK.inkSoft) };
      const flF = { f: mk(fluidF, INK.inkSoft), hi: mk(fluidF, INK.stain), o: mk(fluidF), rip: mk(fluidF, INK.stain), bub: mk(fluidF, INK.stain) };
      const debris = [0, 1, 2].map(i => ({ g: el(fluidB, 'g'), f: null, i }));
      debris.forEach(d => { d.f = mk(d.g, INK.paperLight); d.o = mk(d.g); });
      const rivFly = mk(fxG);

      // ---------- cast (Kaşif + period figures)
      const cast = (P.cast || []).map((m, i) => {
        const isK = (m.who || 'kasif') === 'kasif';
        const sc = m.scale ?? (portrait ? 0.62 : 0.5);
        return { m, isK, sc, rig: typeof KASIF !== 'undefined' ? KASIF.create(el(actorG, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) : null };
      });
      // label + stamp
      let label = null;
      if (P.label && P.label.text) {
        const t = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': P.label.size || (portrait ? 84 : 64), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
        t.textContent = P.label.text;
        label = { L: P.label, t, u: mk(uiG, INK.red) };
      }
      let stamp = null;
      if (P.stamp && P.stamp.text) {
        const g = el(uiG, 'g'), box = mk(g, INK.paperLight), ring = mk(g, INK.red);
        const t = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': P.stamp.size || 104 * K, 'text-anchor': 'middle', fill: INK.red });
        t.textContent = P.stamp.text.toLocaleUpperCase(LOCALE);
        stamp = { S: P.stamp, g, box, ring, t, w: null };
      }

      // ---------- helpers
      const tankPts = (sideK) => sideK < 0 ? [[x0, G], [x0, top], [tx, top], [tx, G]] : [[tx, G], [tx, top], [x1, top], [x1, G]];
      // fluid surface polygon: left edge xl (height 0) -> origin xo (height ho) -> crest just behind the front xf
      function flood(xl, xo, ho, xf, crest, plateau, t, curl) {
        const pts = [], L = Math.max(60, Math.min(0.42 * W, xf - xo));
        const wob = x => Math.sin(x * 0.011 + t * 3.1) * 9 * K + Math.sin(x * 0.029 - t * 2.3) * 4 * K;
        const hAt = x => {
          if (x <= xo) return lerp(0, ho, sm((x - xl) / Math.max(1, xo - xl)));
          const base = lerp(ho, plateau, sm((x - xo) / Math.max(1, L * 0.6)));
          return lerp(base, crest, sm((x - (xf - L)) / L));
        };
        for (let x = xl; x < xf - 40 * K; x += 34 * K) pts.push([x, G - Math.max(0, hAt(x) + (x > xl + 30 ? wob(x) : 0))]);
        if (curl) {
          pts.push([xf - 20 * K, G - crest - 22 * K], [xf + 34 * K, G - crest - 6 * K], [xf + 66 * K, G - crest + 36 * K],
            [xf + 46 * K, G - crest + 70 * K], [xf + 26 * K, G - crest + 52 * K], [xf + 34 * K, G - crest * 0.6],
            [xf + 70 * K, G - crest * 0.25], [xf + 104 * K, G + 8]);
        } else {
          pts.push([xf, G - crest * 0.5], [xf + 30 * K, G + 4]);
        }
        return { top: pts, hAt: x => hAt(x) + wob(x) };
      }
      function drawFlood(F, fl, t, sd, deep) {
        const xe = fl.top[fl.top.length - 1][0];
        const poly = deep ? fl.top.concat([[xe + 90 * K, G + 60 * K], [xe + 230 * K, G + 190 * K], [xe + 330 * K, H + 60], [fl.top[0][0], H + 60]])
          : fl.top.concat([[xe, G + 80 * K], [lerp(xe, fl.top[0][0], 0.5), G + 90 * K], [fl.top[0][0], G + 80 * K]]);
        F.f.setAttribute('d', inkLoop(poly, { seed: sd + 1, t, amp: 1.4 }));
        F.o.setAttribute('d', inkPath(fl.top, { seed: sd + 2, t, w: 6.5 * K }));
        // two gloss streaks a little under the surface
        let hd = '';
        for (let k = 0; k < 2; k++) {
          const off = (34 + k * 46) * K, n = fl.top.length, a = Math.floor(n * (0.15 + k * 0.2)), b = Math.max(a + 2, Math.floor(n * (0.7 - k * 0.12)));
          const seg = fl.top.slice(a, b).map(q => [q[0], q[1] + off]);
          if (seg.length > 2) hd += inkPath(seg, { seed: sd + 3 + k, t, w: 5 * K });
        }
        F.hi.setAttribute('d', hd);
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = seed * 1000;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.7 }, x);
          const crackAt = atOr(cues, 'crack', dur * 0.18), hitAt = atOr(cues, 'hit', dur * 0.42);
          // camera: slow push-in + shake on the burst
          const C = Object.assign({ zoom: mode === 'stuck' || mode === 'tank' ? 1.07 : 1.05, focus: [0.5, 0.55] }, P.cam || {});
          const z = lerp(1, C.zoom, progIO(lt, 0, Math.max(1.5, dur))) * (1 + 0.05 * punch(lt, mode === 'burst' ? hitAt : (mode === 'wave' ? atOr(cues, 'hit', null) : null)));
          let shx = 0, shy = 0;
          if (mode === 'burst' && lt >= hitAt) { const k = Math.exp(-(lt - hitAt) * 3.2); shx = Math.sin(lt * 61) * 16 * k; shy = Math.cos(lt * 47) * 12 * k; }
          const fx = C.focus[0] * W, fy = C.focus[1] * H;
          cam.setAttribute('transform', `translate(${f1(fx + shx)} ${f1(fy + shy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          // ---------- far plane
          let bf = '', bl = '', bw = '';
          blds.forEach((b, i) => {
            const y0 = G - 4, yt = G - b.h;
            const pts = b.roof ? [[b.x, y0], [b.x, yt + 30 * K], [b.x + b.w / 2, yt - 10 * K], [b.x + b.w, yt + 30 * K], [b.x + b.w, y0]]
              : [[b.x, y0], [b.x, yt], [b.x + b.w, yt], [b.x + b.w, y0]];
            bf += inkLoop(pts, { seed: sd + 50 + i, t, amp: 1.2, smooth: false });
            bl += inkPath(pts, O(60 + i, { w: 3.6 * K, smooth: false }));
            const cols = b.win, ww = 18 * K, wh = 30 * K;
            for (let c = 0; c < cols; c++) for (let rr = 0; rr < 3; rr++) {
              const wx = b.x + (c + 0.5) * b.w / cols - ww / 2, wy = yt + 50 * K + rr * 66 * K;
              if (wy + wh > elY - 10 && elG) continue;
              bw += inkLoop([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { seed: sd + 300 + i * 9 + c * 3 + rr, t, amp: 0.8, smooth: false });
            }
          });
          bF.setAttribute('d', bf); bL.setAttribute('d', bl); bWin.setAttribute('d', bw);
          if (elG) {
            let d = '', fd = '';
            fd += inkLoop([[-20, elY], [W + 20, elY], [W + 20, elY + 26 * K], [-20, elY + 26 * K]], { seed: sd + 70, t, amp: 1, smooth: false });
            d += inkPath([[-20, elY], [W + 20, elY - 2]], O(71, { w: 4.5 * K })) + inkPath([[-20, elY + 26 * K], [W + 20, elY + 25 * K]], O(72, { w: 4 * K }));
            for (let x = 40 * K, i = 0; x < W; x += 150 * K, i++) {
              d += inkPath([[x, elY + 26 * K], [x + 2, G - 4]], O(80 + i, { w: 4 * K }));
              if (i % 2 === 0) d += inkPath([[x, elY + 30 * K], [x + 150 * K, elY + 120 * K]], O(120 + i, { w: 2.6 * K }));
            }
            elG.F.setAttribute('d', fd); elG.L.setAttribute('d', d);
          }
          // street
          gL.setAttribute('d', inkPath([[-20, G], [W * 0.5, G + 3], [W + 20, G - 1]], O(5, { w: 6 * K })));
          let cd = '';
          for (let row = 0; row < 2; row++) for (let i = 0; i < 9; i++) {
            const cx = (i + (row ? 0.5 : 0)) * W / 8.5, cy = G + (28 + row * 34) * K;
            cd += inkLoop(inkEllipsePts(cx, cy, 34 * K, 9 * K, sd + 400 + row * 20 + i, 8), { seed: sd + 400 + row * 20 + i, t, amp: 0.8 });
          }
          cob.setAttribute('d', cd);

          // ---------- tank state
          let open = 0, roofUp = 0, shake = 0, paintP = T.painted ? 1 : 0, crackP2 = 0;
          if (mode === 'burst') {
            shake = lt < hitAt ? clamp01((lt - crackAt * 0.3) / Math.max(0.3, hitAt)) : 0;
            crackP2 = lt < hitAt ? prog(lt, crackAt, Math.max(0.2, hitAt - crackAt)) : 0;
            open = prog(lt, hitAt, 0.9); roofUp = prog(lt, hitAt, 1.3);
          } else if (mode === 'wave' || mode === 'wreck' || mode === 'stuck') { open = 1; roofUp = 1; }
          if (mode === 'paint') paintP = progIO(lt, atOr(cues, 'paint', dur * 0.12), Math.max(1, dur * 0.8));
          const sx = Math.sin(lt * 53) * 5 * shake * K, sy = Math.cos(lt * 41) * 3 * shake * K;
          const showTank = T.x != null && mode !== 'stuck' || (P.tank && mode === 'stuck');
          tankG.style.display = showTank ? '' : 'none';
          if (showTank) {
            [tL, tR].forEach((h, k) => {
              const pivot = h.side < 0 ? [x0, G] : [x1, G];
              const ang = h.side * open * (T.splay ?? 84);
              h.g.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(${ang.toFixed(2)} ${f1(pivot[0])} ${f1(pivot[1])})`);
              const pts = tankPts(h.side);
              h.f.setAttribute('d', inkLoop(pts, { seed: sd + 10 + k, t, amp: 1.2, smooth: false }));
              h.o.setAttribute('d', inkPath(pts.concat(open > 0.02 ? [] : []), O(12 + k, { w: 6.5 * K, smooth: false, closed: true })));
              // painted part (bottom up)
              if (paintP > 0.001) {
                const py = G - TH * paintP;
                const xa = h.side < 0 ? x0 : tx, xb = h.side < 0 ? tx : x1, pp = [[xa, G]];
                for (let i = 0; i <= 6; i++) { const x = lerp(xa, xb, i / 6); pp.push([x, Math.max(top, py + Math.sin(i * 1.7 + k * 2) * 10 * K * (paintP < 1 ? 1 : 0))]); }
                pp.push([xb, G]);
                h.paint.setAttribute('d', inkLoop(pp, { seed: sd + 14 + k, t, amp: 1, smooth: false }));
              } else h.paint.setAttribute('d', '');
              // rivet bands
              let rd = '';
              bands.forEach((b, bi) => {
                const y = top + TH * b, xa = h.side < 0 ? x0 + 10 : tx + 8, xb = h.side < 0 ? tx - 8 : x1 - 10;
                rd += inkPath([[xa, y], [xb, y]], O(20 + k * 10 + bi, { w: 3 * K, amp: 1 }));
                for (let i = 0; i < 5; i++) rd += inkDot(lerp(xa + 12, xb - 12, i / 4), y + 12 * K, 4.2 * K, 4.2 * K, sd + 600 + k * 50 + bi * 7 + i, t, 0.5);
              });
              // vertical seam rivets
              const sxs = h.side < 0 ? tx - 14 * K : tx + 14 * K;
              for (let i = 0; i < 8; i++) rd += inkDot(sxs, top + 30 * K + i * (TH - 60 * K) / 7, 4 * K, 4 * K, sd + 700 + k * 20 + i, t, 0.5);
              h.riv.setAttribute('d', rd);
              h.riv.setAttribute('fill', paintP > 0.6 ? INK.paperDark : INK.ink);
            });
            const rP = [[x0 - 14 * K, top], [tx, top - 70 * TS], [x1 + 14 * K, top]];
            roofG.setAttribute('transform', `translate(${f1(sx + roofUp * 90 * K)} ${f1(sy - Math.sin(roofUp * Math.PI) * 260 * K + roofUp * (TH - 40 * K))}) rotate(${(roofUp * 28).toFixed(2)} ${f1(tx)} ${f1(top)})`);
            roofF.setAttribute('d', inkLoop(rP, { seed: sd + 30, t, amp: 1.2, smooth: false }));
            roofP.setAttribute('d', paintP > 0.98 ? inkLoop(rP, { seed: sd + 31, t, amp: 1.2, smooth: false }) : '');
            roofO.setAttribute('d', inkPath(rP, O(32, { w: 6 * K, smooth: false, closed: true })));
            // leaks: streaks from the seams, a drop sliding down each; hidden by the paint
            let ld = '';
            leaks.forEach((L, i) => {
              const x = lerp(x0 + 24 * K, x1 - 24 * K, L.u), y0 = top + TH * L.y0;
              if (G - TH * paintP < y0 + 10) return;
              const yb = Math.min(G - TH * paintP, G - 6);
              ld += inkPath([[x, y0], [x + 3, lerp(y0, yb, 0.5)], [x - 2, yb]], O(40 + i, { w: 7 * K, taper: 0.6 }));
              const dp = ((lt * L.sp + i * 0.37) % 1), dy = lerp(y0, yb, dp * dp);
              ld += inkDot(x, dy, 9 * K, 12 * K, sd + 45 + i, t, 0.6);
            });
            leakP.setAttribute('d', ld);
            // crack up the middle seam + jets
            if (crackP2 > 0.01 && open < 0.05) {
              const n = 9, pts = [];
              for (let i = 0; i <= n * crackP2; i++) pts.push([tx + sx + (i % 2 ? 18 : -14) * K, G - 8 - (TH - 20) * i / n]);
              crackP.setAttribute('d', pts.length > 1 ? inkPath(pts, O(50, { w: 8 * K, smooth: false })) : '');
              let jd = '';
              pts.forEach((q, i) => { if (i % 2 && i > 0) { const l = (40 + 30 * Math.sin(lt * 9 + i)) * K * crackP2; jd += inkPath([[q[0], q[1]], [q[0] + l, q[1] + l * 0.4], [q[0] + l * 1.5, q[1] + l * 1.3]], O(55 + i, { w: 7 * K, taper: 0.7 })); } });
              jetP.setAttribute('d', jd);
            } else { crackP.setAttribute('d', ''); jetP.setAttribute('d', ''); }
          }
          // flying rivets (burst)
          if (mode === 'burst' && lt >= hitAt && lt < hitAt + 1.6) {
            let fd = ''; const u = lt - hitAt;
            for (let i = 0; i < 10; i++) {
              const a = -0.4 - (i / 9) * 2.3, v = (700 + (i * 137 % 300)) * K, y0 = top + TH * (0.2 + (i % 5) * 0.15);
              const x = tx + Math.cos(a) * v * u, y = y0 + Math.sin(a) * v * u * 0.7 + 900 * K * u * u;
              if (y < G) fd += inkDot(x, y, 7 * K, 7 * K, sd + 800 + i, t, 0.6);
            }
            rivFly.setAttribute('d', fd);
          } else rivFly.setAttribute('d', '');

          // ---------- fluid
          flB.f.setAttribute('d', ''); flB.o.setAttribute('d', ''); flB.hi.setAttribute('d', ''); flB.drops.setAttribute('d', '');
          debris.forEach(d => d.g.style.display = 'none');
          let front = null;
          const fAt = hitAt + 0.3;
          if (mode === 'burst' && lt >= fAt) {
            const u = lt - fAt, pr = prog(lt, fAt, Math.max(1.6, dur - fAt));
            const xf = lerp(tx + TW * 0.3, W * ((P.wave && P.wave.to) ?? 1.02), pr), crest = lerp(TH * 0.85, 400 * K, sm(u / 1.1)) + Math.sin(t * 2.2) * 20 * K;
            const fl = flood(lerp(tx - 20, -80, prog(lt, fAt, 1.4)), tx, lerp(TH * 0.8, 140 * K, sm(u / 1.3)), xf, crest, 170 * K, t, u > 0.25);
            drawFlood(flB, fl, t, sd + 900, P.deep !== false);
            front = { xf, crest, fl };
          } else if (mode === 'wave') {
            const Wv = Object.assign({ from: 0.05, to: 0.75, h: 1 }, P.wave || {});
            const a = atOr(cues, Wv.at, 0), d = Wv.dur ?? Math.max(1.2, dur - a);
            const xf = lerp(Wv.from * W, Wv.to * W, prog(lt, a, d) * 0.35 + lin(lt, a, d) * 0.65), crest = (330 + 26 * Math.sin(t * 2.2)) * K * Wv.h;
            const fl = flood(-80, Math.min(tx, xf - 200 * K), 160 * K * Wv.h, xf, crest, 190 * K * Wv.h, t, true);
            drawFlood(flB, fl, t, sd + 900, P.deep !== false);
            front = { xf, crest, fl };
          } else if (mode === 'wreck') {
            const fl = flood(-80, -40, 60 * K, W + 160, 60 * K, 60 * K, t, false);
            drawFlood(flB, fl, t, sd + 900);
          }
          if (front) {
            // spray drops ahead of the crest
            let dd = '';
            for (let i = 0; i < 6; i++) {
              const ph = (lt * 1.4 + i / 6) % 1;
              const x = front.xf + (60 + i * 18) * K + ph * 60 * K, y = G - front.crest - 30 * K + (ph * ph * 160 - ph * 90 + i * 12) * K;
              dd += inkDot(x, y, (9 - i * 0.8) * K, (11 - i) * K, sd + 950 + i, t, 0.6);
            }
            flB.drops.setAttribute('d', dd);
            // debris riding the surface: barrel, wheel, plank
            debris.forEach((d, i) => {
              const x = front.xf - (150 + i * 210) * K;
              if (x < 20) return;
              const y = G - front.fl.hAt(x) - 4, rot = (lt * (60 + i * 25) + i * 70) % 360;
              d.g.style.display = '';
              d.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${rot.toFixed(1)})`);
              const s = K * (i === 1 ? 1.1 : 0.9);
              if (i === 0) {       // barrel
                const pts = [[-34 * s, -46 * s], [34 * s, -46 * s], [40 * s, 0], [34 * s, 46 * s], [-34 * s, 46 * s], [-40 * s, 0]];
                d.f.setAttribute('d', inkLoop(pts, { seed: sd + 960, t, amp: 1 }));
                d.o.setAttribute('d', inkPath(pts, O(961, { w: 5 * K, closed: true })) + inkPath([[-38 * s, -16 * s], [38 * s, -16 * s]], O(962, { w: 3.5 * K })) + inkPath([[-38 * s, 18 * s], [38 * s, 18 * s]], O(963, { w: 3.5 * K })));
              } else if (i === 1) { // cart wheel
                d.f.setAttribute('d', '');
                let o = inkCircle(0, 0, 52 * s, sd + 970, t, { w: 6 * K });
                for (let k = 0; k < 4; k++) { const a = k * Math.PI / 4; o += inkPath([[-Math.cos(a) * 50 * s, -Math.sin(a) * 50 * s], [Math.cos(a) * 50 * s, Math.sin(a) * 50 * s]], O(971 + k, { w: 4 * K })); }
                d.o.setAttribute('d', o);
              } else {              // plank
                const pts = [[-80 * s, -12 * s], [80 * s, -16 * s], [82 * s, 12 * s], [-78 * s, 14 * s]];
                d.f.setAttribute('d', inkLoop(pts, { seed: sd + 980, t, amp: 1, smooth: false }));
                d.o.setAttribute('d', inkPath(pts, O(981, { w: 5 * K, closed: true, smooth: false })));
              }
            });
          }
          // stuck: swamp in front of the cast
          if (mode === 'stuck') {
            const hS = (P.sink ?? 0.2) * 600 * K;
            const fl = flood(-80, -40, hS, W + 160, hS, hS, t * 0.35, false);
            drawFlood(flF, fl, t, sd + 1200, true);
            let rd = '', bd = '';
            cast.forEach((c, i) => {
              const cx = (c.m.x ?? 0.5) * W, sy = G - hS;
              for (let k = 0; k < 2; k++) {
                const ph = ((lt * 0.45 + k * 0.5 + i * 0.3) % 1), rx = (70 + ph * 140) * K;
                rd += inkPath(inkEllipsePts(cx, sy + 16 * K, rx, rx * 0.16, sd + 1300 + i * 5 + k, 14), O(1300 + i * 5 + k, { w: (5 - ph * 3.5) * K, closed: true, amp: 1 }));
              }
            });
            for (let i = 0; i < 5; i++) {
              const ph = (lt * 0.6 + i * 0.21) % 1, bx = W * (0.08 + i * 0.21), by = G - hS + 30 * K;
              if (ph < 0.75) bd += inkCircle(bx, by - ph * 6, (8 + ph * 18) * K, sd + 1400 + i, t, { w: 4 * K });
            }
            flF.rip.setAttribute('d', rd); flF.bub.setAttribute('d', bd);
          } else { ['f', 'o', 'hi', 'rip', 'bub'].forEach(k => flF[k].setAttribute('d', '')); }

          // ---------- painter
          if (worker) {
            const Wk = worker.Wk, wx = Wk.x * W, wy = G + 6;
            const dir = 32 + Math.sin(lt * 3.4) * 22;
            const res = worker.rig.update(t, 'point', { x: wx, y: wy, face: wx > tx ? -1 : 1, dir, since: 2, emotion: 'neutral' });
            const face = wx > tx ? -1 : 1, s = Wk.scale;
            if (res && res.hands) {
              const hnd = res.hands.reduce((a, b) => (b[1] < a[1] ? b : a));
              const hx = wx + face * s * hnd[0], hy = wy + s * hnd[1];
              const py = G - TH * paintP, tipX = lerp(x0 + 40 * K, x1 - 30 * K, 0.5 + 0.38 * Math.sin(lt * 2.1)), tipY = Math.max(top + 20, py) + Math.sin(lt * 6.8) * 14 * K;
              worker.pole.setAttribute('d', inkPath([[hx, hy], [tipX, tipY]], O(1500, { w: 6 * K, taper: 0.1 })));
              const bp = [[tipX - 34 * K, tipY - 14 * K], [tipX + 34 * K, tipY - 14 * K], [tipX + 30 * K, tipY + 16 * K], [tipX - 30 * K, tipY + 16 * K]];
              worker.tip.setAttribute('d', inkLoop(bp, { seed: sd + 1501, t, amp: 1 }));
              worker.tipO.setAttribute('d', inkPath(bp, O(1502, { w: 4.5 * K, closed: true })));
            }
          }
          // ---------- measure
          if (meas) {
            const at = atOr(cues, meas.M.at, dur * 0.3), p = prog(lt, at, 0.9), mx = x0 - 60 * K, ya = G - 6, yb = lerp(G - 6, top + 4, p);
            let d = p > 0.01 ? inkPath([[mx, ya], [mx, yb]], O(1600, { w: 5 * K })) + inkPath([[mx - 26 * K, ya], [mx + 26 * K, ya]], O(1601, { w: 5 * K })) : '';
            if (p > 0.95) d += inkPath([[mx - 26 * K, top + 4], [mx + 26 * K, top + 4]], O(1602, { w: 5 * K })) + inkPath([[mx - 22 * K, top + 34 * K], [mx, top + 6], [mx + 22 * K, top + 34 * K]], O(1603, { w: 5 * K }));
            meas.p.setAttribute('d', d);
            const sp = spring(lt, at + 0.5, 0.6), b = boil(sd + 1610, t, 1.2);
            meas.t.setAttribute('transform', `translate(${f1(mx + b[0] - 8 * K)} ${f1((G + top) / 2 + b[1])}) rotate(-90) scale(${lerp(0.5, 1, sp).toFixed(3)})`);
            meas.t.setAttribute('fill-opacity', clamp01(sp * 2)); meas.t.setAttribute('stroke-opacity', clamp01(sp * 2));
          }

          // ---------- cast
          cast.forEach(c => {
            if (!c.rig) return;
            const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
            const pose = after ? (m.then || 'point') : (m.pose || 'idle');
            const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
            let x = (m.x ?? 0.8) * W;
            if (moving && !after) x = lerp(x, m.to * W, clamp01(lt / Math.max(0.3, at ?? dur)));
            else if (m.to != null) x = m.to * W;
            if (m.wiggle) x += Math.sin(lt * 6.5 + c.sc * 9) * 12 * K;
            const y = (m.y != null ? m.y * H : G + 6) + (m.sink || 0) * K;
            const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
            const o = { x, y, face: m.face === 'left' ? -1 : 1, since, dir, text: m.text, item: m.item, emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
            if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
            if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir, ph: o.ph }; o.mix = since / 0.32; }
            c.rig.update(t, pose, o);
          });
          // ---------- label
          if (label) {
            const Lb = label.L, at = atOr(cues, Lb.at, 0.2), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? (portrait ? 0.2 : 0.16)) * H, b = boil(sd + 8000, t, 1);
            label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
            label.t.setAttribute('fill-opacity', clamp01(sp * 2)); label.t.setAttribute('stroke-opacity', clamp01(sp * 2));
            const tw = Math.min(W * 0.85, label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300), pu = prog(lt, at + 0.25, 0.5);
            label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 16]], O(8001, { w: 6 })) : '');
          }
          // ---------- stamp
          if (stamp) {
            const S = stamp.S, at = atOr(cues, S.at ?? 'stamp', dur * 0.5), vis = lt >= at;
            stamp.g.style.display = vis ? '' : 'none';
            if (vis) {
              if (stamp.w == null && stamp.t.getComputedTextLength) stamp.w = stamp.t.getComputedTextLength() || 500;
              const w = (stamp.w || 500) + 70 * K, h = (S.size || 104 * K) * 1.25, sc = lerp(1.8, 1, prog(lt, at, 0.28)) * (1 + 0.08 * punch(lt, at + 0.28));
              const x = (S.x ?? 0.5) * W, y = (S.y ?? 0.3) * H, b = boil(sd + 8100, t, 1);
              stamp.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${S.rot ?? -8}) scale(${sc.toFixed(3)})`);
              const bx = [[-w / 2, -h * 0.62], [w / 2, -h * 0.62], [w / 2, h * 0.38], [-w / 2, h * 0.38]];
              stamp.box.setAttribute('d', inkLoop(bx, { seed: sd + 8101, t, amp: 1.2, smooth: false }));
              stamp.ring.setAttribute('d', inkPath(bx, O(8102, { w: 10 * K, closed: true, smooth: false })) +
                inkPath(bx.map(q => [q[0] * 0.94, q[1] * 0.9 - h * 0.012]), O(8103, { w: 4 * K, closed: true, smooth: false })));
              stamp.t.setAttribute('y', f1(h * 0.12));
            }
          }
        },
      };
    },
  };
})();
