// ist09_yol: two roads converging on a far walled city, in parchment ink (brand/kit/BRAND.md §3, §5): columns of
// craftsmen (turbans, caps, tools and planks on their shoulders) and ox-carts loaded with stone blocks walk up both roads
// in perspective, shrinking towards the city gate on the horizon, where scaffolding already climbs the domes. Hand-lettered
// signposts name where each road comes from. Built for 11-istanbul-depremi-1509 (masons from Anatolia and Rumelia),
// parametric for any "people stream into a city" moment. Needs ist09__lib.js (IST9) and mcB__lib.js (MCB).
//
// SHOTS.ist09_yol P: {
//   horizon: 0.4 (0..1 H: the city's ground line), near: 0.62 (where the roads leave the frame bottom of the action),
//   gate: 0.5 (x of the city gate), n: 6 (walkers per road), speed: 0.09 (road share per second),
//   signs: [{text: "Anadolu", side: "left"}, {text: "Rumeli", side: "right"}], sign_at: cue|s,
//   carts: true, cast: [...MCB cast], labels: [...MCB labels]
// }
// Close-up targets (portrait 1080×1920, defaults): gate ≈ [540, 760], left road walkers ≈ [260, 1080].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.ist09_yol = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.IST9, M = window.MCB, { atOr, arc, rect } = L;
      const S = Math.min(W, H) / 1080 * (H > W ? 1 : 0.62);
      const sd = (seed || 1) * 17 + 5501, r = rng(sd);
      const HY = H * (P.horizon ?? 0.4), NY = H * (P.near ?? 0.6), GX = W * (P.gate ?? 0.5);
      const root = el(svg, 'g'), sh = L.Shapes();

      // far city: wall with gate, domes with scaffolding, minarets
      const cityG = el(root, 'g');
      const cw = W * 0.7, wy = HY;
      sh.add(cityG, rect(GX - cw / 2, wy - 60 * S, GX + cw / 2, wy), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
      for (let x = GX - cw / 2 + 6 * S; x < GX + cw / 2 - 14 * S; x += 26 * S) sh.add(cityG, rect(x, wy - 72 * S, x + 14 * S, wy - 60 * S), { fill: INK.paperLight, stroke: INK.ink, w: 3 });
      for (const dx of [-0.42, -0.2, 0.2, 0.42]) sh.add(cityG, rect(GX + dx * cw - 24 * S, wy - 96 * S, GX + dx * cw + 24 * S, wy), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
      sh.add(cityG, rect(GX - cw / 2, wy - 40 * S, GX + cw / 2, wy - 34 * S), { fill: INK.red, fop: 0.5 });
      sh.add(cityG, [[GX - 34 * S, wy], [GX - 34 * S, wy - 50 * S], [GX, wy - 76 * S], [GX + 34 * S, wy - 50 * S], [GX + 34 * S, wy]], { fill: INK.ink, fop: 0.8, stroke: INK.ink, w: 4, smooth: true });
      const domes = [[-0.25, 1], [0.12, 1.3], [0.36, 0.8]];
      domes.forEach(([dx, k], i) => {
        const x = GX + dx * cw, R = 54 * S * k, base = wy - 60 * S;
        sh.add(cityG, rect(x - R * 1.4, base - 40 * S * k, x + R * 1.4, base), { fill: INK.paperLight, stroke: INK.ink, w: 3.5 });
        sh.add(cityG, arc(x, base - 40 * S * k, R, R * 0.9, Math.PI, 2 * Math.PI, 12), { fill: INK.paperLight, stroke: INK.ink, w: 3.5 });
        if (i !== 0) sh.add(cityG, rect(x + R * 1.6, base, x + R * 1.6 + 12 * S, base - 200 * S * k), { fill: INK.paperLight, stroke: INK.ink, w: 3 });
        if (i !== 0) sh.add(cityG, [[x + R * 1.6 - 2 * S, base - 200 * S * k], [x + R * 1.6 + 6 * S, base - 236 * S * k], [x + R * 1.6 + 14 * S, base - 200 * S * k]], { fill: INK.inkSoft, fop: 0.6, stroke: INK.ink, w: 3 });
        if (i !== 2) for (const sx of [-1.2, -0.4, 0.4, 1.2]) sh.add(cityG, [[x + sx * R, base], [x + sx * R, base - 40 * S * k - R * (1 - Math.abs(sx) * 0.35)]], { stroke: INK.stain, w: 3, closed: false });
        if (i !== 2) sh.add(cityG, [[x - R * 1.3, base - 30 * S * k - R * 0.5], [x + R * 1.3, base - 30 * S * k - R * 0.5]], { stroke: INK.stain, w: 3, closed: false });
      });

      // the two roads: from bottom corners to the gate
      const roads = [
        { a: [-0.25 * W, H + 120 * S], b: [GX - 20 * S, HY + 6 * S], wA: 620 * S, wB: 40 * S, face: 1 },
        { a: [1.25 * W, H + 120 * S], b: [GX + 20 * S, HY + 6 * S], wA: 620 * S, wB: 40 * S, face: -1 },
      ];
      const roadG = el(root, 'g');
      roads.forEach((rd, i) => {
        const [ax, ay] = rd.a, [bx, by] = rd.b, dx = bx - ax, dy = by - ay, ln = Math.hypot(dx, dy), nx = -dy / ln, ny = dx / ln;
        const pts = [[ax + nx * rd.wA / 2, ay + ny * rd.wA / 2], [bx + nx * rd.wB / 2, by + ny * rd.wB / 2], [bx - nx * rd.wB / 2, by - ny * rd.wB / 2], [ax - nx * rd.wA / 2, ay - ny * rd.wA / 2]];
        sh.add(roadG, pts, { fill: INK.stain, fop: 0.45, stroke: INK.inkSoft, w: 4 });
        for (let k = 0; k < 10; k++) {
          const u = k / 10 + 0.03, x = lerp(ax, bx, u), y = lerp(ay, by, u), w = lerp(rd.wA, rd.wB, u) * 0.3;
          sh.add(roadG, [[x - nx * w, y - ny * w], [x - nx * w * 0.4, y - ny * w * 0.4]], { stroke: INK.inkSoft, w: 2.5, closed: false, sop: 0.7 });
        }
        rd.pos = u => { const q = 1 - Math.pow(1 - u, 2.2); return [lerp(ax, bx, q), lerp(ay, by, q)]; };
      });

      // carts (ox + cart with stone blocks), one per road
      const cartG = el(root, 'g');
      const carts = P.carts === false ? [] : roads.map((rd, i) => {
        const g = el(cartG, 'g');
        sh.add(g, rect(-90, -70, 60, -30), { fill: INK.stain, fop: 0.9, stroke: INK.ink, w: 5 });
        for (const [x, y] of [[-80, -112], [-34, -112], [12, -112], [-58, -150], [-12, -150]]) sh.add(g, rect(x, y, x + 44, y + 40), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
        const wheel = sh.add(g, inkEllipsePts(-20, -22, 34, 34, sd + 40 + i, 14), { fill: INK.paperLight, fop: 0.6, stroke: INK.ink, w: 5 });
        sh.add(g, [[60, -50], [120, -54]], { stroke: INK.ink, w: 5, closed: false });
        sh.add(g, [[120, -40], [130, -96], [200, -100], [230, -86], [236, -40], [210, -40], [205, 0], [192, 0], [190, -40], [150, -40], [148, 0], [134, 0]], { fill: INK.paperDark, stroke: INK.ink, w: 5 });
        sh.add(g, [[226, -96], [252, -128], [262, -118], [240, -88]], { fill: INK.paperDark, stroke: INK.ink, w: 4 });
        sh.add(g, [[214, -100], [212, -124]], { stroke: INK.ink, w: 4, closed: false });
        return { g, rd, u0: 0.12 + i * 0.1 };
      });

      // walkers
      const walkG = el(root, 'g');
      const n = P.n ?? 12, acc = ['turban', 'beret', 'turban', null, 'turban', 'beret'];
      const walkers = [];
      roads.forEach((rd, ri) => {
        for (let k = 0; k < n; k++) {
          const g = el(walkG, 'g'), toolE = inkEl(g, INK.stain), toolL = inkEl(g, INK.ink);
          const wrap = el(g, 'g'), rig = KASIF.create(el(wrap, 'g'), { scale: 1, hat: false, accessory: acc[(k + ri) % acc.length], beard: k % 3 === 0 ? 'black' : null, seed: sd + ri * 50 + k });
          walkers.push({ g, wrap, rig, rd, k, ri, lane: ((k * 5) % 3 - 1) * 0.28, u0: (k + 0.5 * ri) / n, tool: k % 3, toolE, toolL });
        }
      });
      const signs = (P.signs || [{ text: 'Anadolu', side: 'left' }, { text: 'Rumeli', side: 'right' }]).map((sg, i) => {
        const g = el(root, 'g'), left = sg.side !== 'right', x = left ? W * 0.17 : W * 0.83, y = NY - 10 * S;
        sh.add(g, [[x, y + 40 * S], [x, y - 230 * S]], { stroke: INK.ink, w: 7, closed: false });
        const bw = 280 * S, bh = 90 * S, bx = left ? x - 40 * S : x - bw + 40 * S;
        sh.add(g, [[bx, y - 230 * S], [bx + bw, y - 230 * S], [bx + bw + (left ? 34 * S : 0), y - 185 * S], [bx + bw, y - 140 * S], [bx, y - 140 * S], [bx - (left ? 0 : 34 * S), y - 185 * S]], { fill: INK.paperLight, stroke: INK.ink, w: 6 });
        const tx = el(g, 'text', { x: bx + bw / 2, y: y - 168 * S, 'font-family': INK_FONT, 'font-size': 64 * S, 'text-anchor': 'middle', fill: INK.ink });
        tx.textContent = sg.text;
        return { g, x, y, sg, i };
      });
      const castG = el(root, 'g'), labG = el(root, 'g');
      const cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      const labs = M.labels(labG, P.labels || [], W, H, sd + 950);
      const sc = u => lerp(0.75, 0.05, 1 - Math.pow(1 - u, 2.2)) * S;

      return {
        update(lt, dur, cues, info) {
          const t = (info && info.t != null) ? info.t : lt;
          const sp = P.speed ?? 0.09;
          // far walkers first (painter's order)
          const order = walkers.map(w => ({ w, u: (w.u0 + lt * sp) % 1 })).sort((a, b) => b.u - a.u);
          order.forEach(({ w, u }, idx) => {
            const [x0, y] = w.rd.pos(u), s = sc(u), face = w.rd.face, x = x0 + w.lane * s / S * 560 * S;
            w.g.parentNode.appendChild(w.g);
            w.rig.update(t, 'walk', { x, y, face, ph: lt * 1.2 + w.k * 0.3, since: 1, scale: s });
            // rig size comes from opts.scale (perspective)
            // tool on the shoulder
            const sx = x, sy = y - 400 * s, f = face;
            if (w.tool === 0) { w.toolE.setAttribute('d', inkPath([[sx - f * 120 * s, sy + 10 * s], [sx + f * 140 * s, sy - 30 * s]], { seed: sd + 500 + idx, t, w: Math.max(3, 22 * s), amp: 0.6 })); w.toolL.setAttribute('d', ''); }
            else if (w.tool === 1) { w.toolE.setAttribute('d', inkPath([[sx - f * 40 * s, sy + 30 * s], [sx + f * 80 * s, sy - 110 * s]], { seed: sd + 500 + idx, t, w: Math.max(2, 12 * s), amp: 0.6 })); w.toolL.setAttribute('d', inkPath([[sx + f * 40 * s, sy - 130 * s], [sx + f * 80 * s, sy - 110 * s], [sx + f * 120 * s, sy - 80 * s]], { seed: sd + 600 + idx, t, w: Math.max(3, 16 * s), amp: 0.6 })); }
            else { w.toolE.setAttribute('d', ''); w.toolL.setAttribute('d', ''); }
          });
          carts.forEach((c, i) => {
            const u = (c.u0 + lt * sp * 0.55) % 1, [x, y] = c.rd.pos(u), s = sc(u) * 1.5, f = c.rd.face;
            c.g.setAttribute('transform', `translate(${L.f1(x)} ${L.f1(y + Math.abs(Math.sin(lt * 5 + i)) * -3 * S)}) scale(${(f * s).toFixed(4)} ${s.toFixed(4)})`);
          });
          signs.forEach(({ g, x, y, sg, i }) => {
            const a = atOr(cues, sg.at ?? P.sign_at, 0.2 + i * 0.5), p = spring(lt, a, 0.6);
            g.style.display = lt < a ? 'none' : '';
            g.setAttribute('transform', `translate(${L.f1(x)} ${L.f1(y)}) scale(1 ${Math.max(0.01, p).toFixed(3)}) translate(${L.f1(-x)} ${L.f1(-y)})`);
          });
          sh.update(t, lt);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
