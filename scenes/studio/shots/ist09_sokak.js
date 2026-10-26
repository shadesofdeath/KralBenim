// ist09_sokak: a narrow Ottoman street at night, in parchment ink (brand/kit/BRAND.md §3, §5), seen from the cobbles:
// timber houses with jutting upper floors (cumba), lattice windows and tiled eaves lean in from both sides towards a
// vanishing point; oil lanterns hang from brackets; the cobbled street fills the bottom of the frame. On the shake cue
// the houses sway, lanterns swing, roof tiles rain from the eaves and dust rolls down the street. Built for
// 11-istanbul-depremi-1509, parametric for any old-town street in an earthquake. Needs ist09__lib.js and mcB__lib.js.
//
// SHOTS.ist09_sokak P: {
//   night: false (houses washed dark, lit windows, dark cobbles), debris: true (broken tiles + a snapped lattice in front),
//   vp: [0.5, 0.42] (vanishing point, 0..1), eave: 0.2 (0..1 H: eave line of the nearest houses),
//   shake: cue|s, shake_dur: 3, tiles: cue|s (tiles start to fall), dust: cue|s,
//   cast: [...MCB cast], labels: [...MCB labels]
// }
// Close-up targets (portrait 1080×1920): left lantern ≈ [300, 700], street end ≈ [540, 800].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.ist09_sokak = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.IST9, M = window.MCB, { atOr, rect } = L;
      const S = Math.min(W, H) / 1080 * (H > W ? 1 : 0.62);
      const sd = (seed || 1) * 19 + 7701, r = rng(sd);
      const VX = W * (P.vp?.[0] ?? 0.5), VY = H * (P.vp?.[1] ?? 0.42);
      const root = el(svg, 'g'), shakeG = el(root, 'g'), sh = L.Shapes();
      const GY = H * 0.62;    // street level at the nearest houses' feet (cobbles continue below, in front)

      // cobbles: street floor from the frame bottom to the vanishing point
      const streetG = el(shakeG, 'g');
      sh.add(streetG, [[-60, H + 40], [W + 60, H + 40], [VX + 40 * S, VY + 60 * S], [VX - 40 * S, VY + 60 * S]], { fill: P.night ? INK.inkSoft : INK.paperDark, fop: P.night ? 0.7 : 0.7, stroke: INK.inkSoft, w: 3 });
      for (let k = 0; k < 16; k++) {                    // cobble rows: ellipses shrinking with distance
        const u = Math.pow(k / 16, 1.6), y = lerp(H + 10, VY + 70 * S, u), half = lerp(W * 0.62, 40 * S, u), cw = lerp(80, 10, u) * S;
        for (let x = VX - half + ((k % 2) * cw * 0.5); x < VX + half; x += cw)
          sh.add(streetG, inkEllipsePts(x, y, cw * 0.42, cw * 0.18, sd + k * 40 + Math.round(x), 8), { stroke: INK.inkSoft, w: Math.max(1.5, 3.5 * (1 - u)), sop: 0.8 });
      }
      sh.add(streetG, [[VX, VY + 60 * S], [VX, H + 40]], { stroke: INK.inkSoft, w: 3, closed: false, sop: 0.5 });

      // houses: depth slices from far (k = 0) to near (k = n-1) on both sides
      const houses = [];
      const n = 4;
      for (let side of [-1, 1]) for (let k = 0; k < n; k++) {
        const d0 = (k + 0.0) / n, d1 = (k + 1) / n;                    // 0 far .. 1 near
        const g = el(shakeG, 'g');
        const xf = d => VX + side * lerp(70 * S, W * 0.62, Math.pow(d, 1.25));      // facade line x at depth d
        const yTop = d => lerp(VY - 40 * S, H * (P.eave ?? 0.2), Math.pow(d, 1.1)); // eave
        const yBot = d => lerp(VY + 60 * S, H + 60, Math.pow(d, 1.25));             // street line
        const yFl = d => lerp(yTop(d), yBot(d), 0.48);                               // upper floor line
        const out = d => side * lerp(6, 70, Math.pow(d, 1.2)) * S;                   // cumba jut
        const xa = xf(d0), xb = xf(d1);
        // ground floor (stone)
        sh.add(g, [[xa, yFl(d0)], [xb, yFl(d1)], [xb, yBot(d1)], [xa, yBot(d0)]], { fill: P.night ? INK.ink : INK.paper, fop: P.night ? 0.62 : 1, stroke: INK.ink, w: lerp(2.5, 6, d1) });
        // jutting upper floor (timber)
        const up = [[xa + out(d0), yTop(d0)], [xb + out(d1), yTop(d1)], [xb + out(d1), yFl(d1)], [xa + out(d0), yFl(d0)]];
        sh.add(g, up, { fill: P.night ? (k % 2 ? INK.ink : INK.stain) : (k % 2 ? INK.paperLight : INK.stain), fop: P.night ? (k % 2 ? 0.5 : 0.95) : (k % 2 ? 1 : 0.55), stroke: INK.ink, w: lerp(2.5, 6, d1) });
        for (let j = 1; j < 6; j++) { const u = j / 6, xx = lerp(xa, xb, u) + lerp(out(d0), out(d1), u); sh.add(g, [[xx, lerp(yTop(d0), yTop(d1), u)], [xx, lerp(yFl(d0), yFl(d1), u)]], { stroke: INK.ink, w: lerp(1.5, 3, d1), closed: false, sop: 0.55 }); }
        // brackets under the jut
        for (const u of [0.15, 0.85]) { const x0 = lerp(xa, xb, u), y0 = lerp(yFl(d0), yFl(d1), u); sh.add(g, [[x0 + lerp(out(d0), out(d1), u), y0], [x0, y0 + lerp(10, 60, d1) * S]], { stroke: INK.ink, w: lerp(2, 5, d1), closed: false }); }
        // lattice window on the upper floor
        const wu0 = 0.3, wu1 = 0.7, wx0 = lerp(xa, xb, wu0) + lerp(out(d0), out(d1), wu0), wx1 = lerp(xa, xb, wu1) + lerp(out(d0), out(d1), wu1);
        const wy0 = u => lerp(lerp(yTop(d0), yTop(d1), u), lerp(yFl(d0), yFl(d1), u), 0.25), wy1 = u => lerp(lerp(yTop(d0), yTop(d1), u), lerp(yFl(d0), yFl(d1), u), 0.75);
        sh.add(g, [[wx0, wy0(wu0)], [wx1, wy0(wu1)], [wx1, wy1(wu1)], [wx0, wy1(wu0)]], { fill: INK.gold, fop: P.night ? ((k + side) % 2 === 0 ? 0.95 : 0.7) : ((k + side) % 3 === 0 ? 0.6 : 0.15), stroke: INK.ink, w: lerp(2, 4.5, d1) });
        for (let j = 1; j < 4; j++) { const u = lerp(wu0, wu1, j / 4), xx = lerp(xa, xb, u) + lerp(out(d0), out(d1), u); sh.add(g, [[xx, wy0(u)], [xx, wy1(u)]], { stroke: INK.ink, w: lerp(1.2, 2.5, d1), closed: false }); }
        // door on the ground floor
        const du0 = 0.35, du1 = 0.6, dx0 = lerp(xa, xb, du0), dx1 = lerp(xa, xb, du1);
        sh.add(g, [[dx0, lerp(lerp(yFl(d0), yBot(d0), 0.3), lerp(yFl(d1), yBot(d1), 0.3), du0)], [dx1, lerp(lerp(yFl(d0), yBot(d0), 0.3), lerp(yFl(d1), yBot(d1), 0.3), du1)], [dx1, lerp(yBot(d0), yBot(d1), du1)], [dx0, lerp(yBot(d0), yBot(d1), du0)]],
          { fill: INK.ink, fop: 0.7, stroke: INK.ink, w: lerp(2, 5, d1) });
        // tiled eave
        const eave = [[xa + out(d0) * 1.5, yTop(d0)], [xb + out(d1) * 1.5, yTop(d1)], [xb + out(d1) * 1.2, yTop(d1) - lerp(10, 70, d1) * S], [xa + out(d0) * 1.2, yTop(d0) - lerp(10, 70, d0) * S]];
        sh.add(g, eave, { fill: INK.red, fop: 0.6, stroke: INK.ink, w: lerp(2.5, 6, d1) });
        for (let j = 1; j < 6; j++) { const u = j / 6; sh.add(g, [[lerp(eave[0][0], eave[1][0], u), lerp(eave[0][1], eave[1][1], u)], [lerp(eave[3][0], eave[2][0], u), lerp(eave[3][1], eave[2][1], u)]], { stroke: INK.ink, w: lerp(1.2, 3, d1), closed: false, sop: 0.7 }); }
        houses.push({ g, side, k, d1, px: xb, py: yBot(d1), eave, eaveY: yTop(d1) });
      }
      // draw near houses last
      houses.sort((a, b) => a.d1 - b.d1).forEach(h => shakeG.appendChild(h.g));

      // lanterns on brackets (one per side, mid-depth)
      const lanterns = [-1, 1].map((side, i) => {
        const hx = houses.find(h => h.side === side && h.k === 2);
        const ax = hx.eave[1][0] - side * 30 * S, ay = hx.eaveY + 120 * S, g = el(root, 'g');
        const len = 120 * S;
        sh.add(g, [[ax, ay], [ax, ay + len]], { stroke: INK.ink, w: 3, closed: false });
        sh.add(g, [[ax - 26 * S, ay + len], [ax + 26 * S, ay + len], [ax + 20 * S, ay + len + 70 * S], [ax - 20 * S, ay + len + 70 * S]], { fill: INK.gold, fop: 0.85, stroke: INK.ink, w: 4 });
        sh.add(g, [[ax - 30 * S, ay + len], [ax, ay + len - 24 * S], [ax + 30 * S, ay + len]], { fill: INK.ink, fop: 0.8, stroke: INK.ink, w: 3 });
        const brk = sh.add(root, [[ax + side * 40 * S, ay - 20 * S], [ax, ay - 20 * S], [ax, ay]], { stroke: INK.ink, w: 5, closed: false });
        return { g, ax, ay, i };
      });

      // broken tiles and a snapped lattice lying on the cobbles in front
      if (P.debris !== false) {
        const dG = el(root, 'g');
        for (let i = 0; i < 9; i++) {
          const x = W * (0.08 + 0.84 * ((i * 37) % 9) / 9), y = H * (0.72 + 0.12 * ((i * 5) % 4) / 3), w = (60 + (i % 3) * 20) * S, a = (i % 5 - 2) * 0.35, c = Math.cos(a), sn = Math.sin(a);
          sh.add(dG, [[-w / 2, -w * 0.2], [w / 2, -w * 0.25], [w * 0.4, w * 0.2], [-w * 0.45, w * 0.22]].map(([px, py]) => [x + px * c - py * sn, y + px * sn + py * c]), { fill: INK.red, fop: 0.85, stroke: INK.ink, w: 4 });
        }
        const kx = W * 0.72, ky = H * 0.8;
        sh.add(dG, [[kx - 150 * S, ky], [kx + 130 * S, ky - 60 * S], [kx + 140 * S, ky - 20 * S], [kx - 140 * S, ky + 40 * S]], { fill: INK.stain, fop: 0.9, stroke: INK.ink, w: 5 });
        for (let j = 1; j < 5; j++) sh.add(dG, [[kx - 150 * S + j * 56 * S, ky - j * 12 * S], [kx - 140 * S + j * 56 * S, ky + 40 * S - j * 12 * S]], { stroke: INK.ink, w: 3.5, closed: false });
      }
      // falling roof tiles
      const tileG = el(root, 'g');
      const tiles = Array.from({ length: 18 }, (_, i) => {
        const h = houses.filter(q => q.k >= 2)[i % 4], u = 0.15 + 0.7 * ((i * 7) % 10) / 10;
        const x = lerp(h.eave[0][0], h.eave[1][0], u), y = lerp(h.eave[0][1], h.eave[1][1], u);
        return { x, y, vx: -h.side * (60 + (i % 5) * 30) * S, vy: -(40 + (i % 3) * 50) * S, dt: (i % 9) * 0.17, f: inkEl(tileG, INK.red, { 'fill-opacity': 0.85 }), l: inkEl(tileG, INK.ink), floor: GY + (i % 4) * 150 * S + 200 * S, sz: (24 + (i % 3) * 8) * S * (0.7 + h.d1 * 0.4) };
      });
      const dust = L.dust(el(root, 'g'), sd + 600);
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      const labs = M.labels(labG, P.labels || [], W, H, sd + 950);
      const done = new Set();

      return {
        update(lt, dur, cues, info) {
          const t = (info && info.t != null) ? info.t : lt;
          const sa = atOr(cues, P.shake, null), env = L.quakeEnv(lt, sa, P.shake_dur ?? 3);
          shakeG.setAttribute('transform', env > 0 ? `translate(${L.f1(Math.sin(lt * 45) * 10 * env * S)} ${L.f1(Math.cos(lt * 38) * 6 * env * S)})` : '');
          houses.forEach(h => h.g.setAttribute('transform', env > 0 ? `rotate(${(Math.sin(lt * 17 + h.k + h.side) * 1.4 * env).toFixed(2)} ${L.f1(h.px)} ${L.f1(h.py)})` : ''));
          lanterns.forEach(ln => ln.g.setAttribute('transform', `rotate(${((env * 28 + 3) * Math.sin(lt * 3.3 + ln.i)).toFixed(2)} ${L.f1(ln.ax)} ${L.f1(ln.ay)})`));
          const ta = atOr(cues, P.tiles, sa);
          tiles.forEach((tl, i) => {
            const u = ta == null ? -1 : lt - ta - tl.dt;
            const x = tl.x + tl.vx * u, y = tl.y + tl.vy * u + 0.5 * 1800 * S * u * u;
            if (u < 0 || y > tl.floor) { tl.f.setAttribute('d', ''); tl.l.setAttribute('d', ''); return; }
            const a = u * (5 + i % 4), c = Math.cos(a), s = Math.sin(a), w = tl.sz, hgt = tl.sz * 0.45;
            const pts = [[-w / 2, -hgt / 2], [w / 2, -hgt / 2], [w / 2, hgt / 2], [-w / 2, hgt / 2]].map(([px, py]) => [x + px * c - py * s, y + px * s + py * c]);
            tl.f.setAttribute('d', inkLoop(pts, { seed: sd + 300 + i, t, amp: 0.6, smooth: false }));
            tl.l.setAttribute('d', inkPath(pts, { seed: sd + 340 + i, t, w: 3, amp: 0.6, closed: true, smooth: false }));
          });
          const da = atOr(cues, P.dust, null);
          if (da != null && !done.has('d')) { done.add('d'); dust.puff(VX, VY + 160 * S, da, 2 * S); dust.puff(VX - 200 * S, GY + 100 * S, da + 0.3, 1.6 * S); dust.puff(VX + 220 * S, GY + 60 * S, da + 0.45, 1.6 * S); }
          sh.update(t, lt);
          dust.update(lt, t);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
