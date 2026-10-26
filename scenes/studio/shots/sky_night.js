// sky_night + sky_yard: a small outback town at night when space debris streaks overhead, and the yard where the
// pieces landed (Stickstory "Skylab fell on Esperance", 2026-10-26; parametric for any "fireballs over a town" or
// "meteorite in the yard" moment). Parchment ink (brand/kit/BRAND.md §3, §5): night = opaque paper-dark wash with ink
// hatching (no transparent full-frame layer), every line boils at 8 Hz, palette tokens only, pure function of (seed, lt).
// Uses sky__lib.js (SKY.chunk, mkPen, shape, line) and td__lib.js (TD.stars / label / figure).
//
// SHOTS.sky_night P: {
//   ground: 0.74 (0..1 H), stars: 24,
//   town: {x0: 0.05, x1: 0.95, s: 1, lights: true} | false     (row of low houses, a water tank tower, a windmill),
//   streaks: [{from: [x, y], to: [x, y] (0..1), at: cue|sec, dur: 2.6, size: 1, split: 0.55 (0..1 of the path where it
//             breaks up), pieces: 4}]   glowing fireballs with tapering gold/red trails; past `split` they break into
//             pieces that fan out and fade,
//   booms: [{at: cue|sec, x: 0.5, y: 0.3, text: "BOOM"}]   ink sound rings + a big punching word,
//   labels: [...TD.label], kasif: K | false, cast: [K, ...] (TD.figure, hat false + accessory), cam: {zoom: 1.06}
// }   cues: hit, streaks[].at, booms[].at, label / seq names
//
// SHOTS.sky_yard P: {
//   ground: 0.8, night: false (true: night wash), house: {x: 0.3, s: 1} (house with a corrugated tin roof + fence),
//   chunks: [{x, y (0..1), s: 0.8, rot: 0, at: cue|sec (drops in from above), smoke: true}],
//   pickup: {who: 0 (cast index), chunk: 0, at: cue} (that chunk jumps into the figure's hand from the cue),
//   labels, kasif, cast, cam
// }   cues: hit, chunks[].at, pickup.at, label / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  function nightWash(pen, W, gy, sd, t) {
    // night: opaque bands, darker at the top, lighter toward the horizon (no transparent layer), wavy edges
    const bands = [[0, 0.42], [0.3, 0.34], [0.55, 0.26], [0.78, 0.18]];
    bands.forEach(([y0, k], i) => {
      const top = y0 * gy, pts = [[0, gy], [0, top]];
      for (let j = 0; j <= 8; j++) pts.push([W * j / 8, top + Math.sin(j * 1.7 + i) * 14 * (i ? 1 : 0)]);
      pts.push([W, gy]);
      pen.fill(inkLoop(pts, { seed: sd + 40 + i, t, amp: 1.2, smooth: false }), mix(INK.paperDark, INK.inkSoft, k));
    });
    for (let k = 0; k < 18; k++) {        // cross-hatching, denser at the top
      const x = ((k * 397) % 1000) / 1000 * W, y = 170 + ((k * 211) % 1000) / 1000 * (gy * 0.6 - 120);
      pen.fill(inkPath([[x, y], [x + 90, y - 30]], { w: 3, seed: sd + k, t, amp: 0.8 }), INK.inkSoft);
      if (k % 2) pen.fill(inkPath([[x + 20, y - 28], [x + 100, y + 4]], { w: 2.4, seed: sd + 60 + k, t, amp: 0.8 }), INK.inkSoft);
    }
  }
  function town(pen, W, gy, T, sd, t) {
    const x0 = T.x0 * W, x1 = T.x1 * W, s = T.s;
    const r = rng(sd + 3); let x = x0, k = 0;
    while (x < x1) {
      const w = lerp(120, 200, r()) * s, h = lerp(70, 110, r()) * s, roof = lerp(30, 55, r()) * s;
      if (k === 2) {   // water tank tower
        SKY.line(pen, [[x + 20 * s, gy], [x + 30 * s, gy - 170 * s]], sd + 50, t, 5); SKY.line(pen, [[x + 90 * s, gy], [x + 80 * s, gy - 170 * s]], sd + 51, t, 5);
        SKY.shape(pen, [[x, gy - 170 * s], [x + 110 * s, gy - 170 * s], [x + 110 * s, gy - 240 * s], [x, gy - 240 * s]], INK.paperDark, sd + 52, t);
        x += 150 * s; k++; continue;
      }
      if (k === 5) {   // windmill
        const cx = x + 40 * s, top = gy - 230 * s;
        SKY.line(pen, [[cx - 30 * s, gy], [cx, top]], sd + 60, t, 5); SKY.line(pen, [[cx + 30 * s, gy], [cx, top]], sd + 61, t, 5);
        for (let b = 0; b < 8; b++) { const a = b / 8 * Math.PI * 2 + t * 1.2; SKY.line(pen, [[cx, top], [cx + Math.cos(a) * 60 * s, top + Math.sin(a) * 60 * s]], sd + 62 + b, t, 4); }
        x += 110 * s; k++; continue;
      }
      SKY.shape(pen, [[x, gy], [x, gy - h], [x + w / 2, gy - h - roof], [x + w, gy - h], [x + w, gy]], mix(INK.paperDark, INK.paperLight, 0.3), sd + 70 + k * 3, t);
      if (T.lights !== false) { const lit = (k % 3) !== 1; SKY.shape(pen, [[x + w * 0.3, gy - h * 0.65], [x + w * 0.5, gy - h * 0.65], [x + w * 0.5, gy - h * 0.35], [x + w * 0.3, gy - h * 0.35]], lit ? INK.gold : INK.inkSoft, sd + 71 + k * 3, t, { w: 3 }); }
      x += w + lerp(20, 70, r()) * s; k++;
    }
    SKY.line(pen, [[0, gy], [W, gy + 4]], sd + 90, t, 6);
  }
  function fireball(pen, A, lt, t, W, H, cues, sd) {
    const a = TD_at(cues, A.at, 0), dur = A.dur ?? 2.6, p = lt >= a ? clamp01((lt - a) / dur) : -1;
    if (p < 0) return;
    const sz = A.size ?? 1, split = A.split ?? 0.55, n = A.pieces ?? 4;
    const fx = A.from[0] * W, fy = A.from[1] * H, tx = A.to[0] * W, ty = A.to[1] * H, dx = tx - fx, dy = ty - fy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    const head = (hx, hy, s, k, fade = 0) => {
      const tl = 260 * s * (1 - fade * 0.5), nx = -uy, ny = ux, w = 22 * s;
      const tr = [[hx + nx * w, hy + ny * w], [hx - ux * tl * 0.5 + nx * w * 0.6, hy - uy * tl * 0.5 + ny * w * 0.6], [hx - ux * tl, hy - uy * tl], [hx - ux * tl * 0.5 - nx * w * 0.6, hy - uy * tl * 0.5 - ny * w * 0.6], [hx - nx * w, hy - ny * w]];
      pen.fill(inkLoop(tr, { seed: sd + k, t, amp: 2 }), INK.gold, 0.85 * (1 - fade * 0.6));
      pen.fill(inkPath(tr.slice(1, 4), { w: 3, seed: sd + 20 + k, t, amp: 2 }), INK.red);
      pen.fill(inkDot(hx, hy, 24 * s, 24 * s, sd + 40 + k, t, 1.2), INK.red);
      pen.fill(inkDot(hx - ux * 6, hy - uy * 6, 12 * s, 12 * s, sd + 60 + k, t, 1), INK.paperLight);
    };
    if (p < split) head(fx + dx * p, fy + dy * p, sz * (1 + 0.1 * Math.sin(lt * 20)), 0);
    else {
      const q = (p - split) / (1 - split), bx = fx + dx * split, by = fy + dy * split;
      if (q < 0.25) pen.fill(inkDot(bx, by, 60 * sz * (1 - q * 3), 60 * sz * (1 - q * 3), sd + 90, t, 2), INK.gold, 0.8);
      for (let i = 0; i < n; i++) {
        const spread = ((i - (n - 1) / 2) / Math.max(1, n - 1)) * 0.9;     // fan angle (radians)
        const ca = Math.cos(spread), sa = Math.sin(spread), vx = ux * ca - uy * sa, vy = ux * sa + uy * ca;
        const dist = q * (1 - split) * L * (0.8 + 0.3 * ((i * 7) % 3) / 2);
        const s = sz * lerp(0.7, 0.35, q) * (1 - (i % 2) * 0.2);
        head(bx + vx * dist, by + vy * dist, s, 100 + i * 7, q);
      }
    }
  }
  const TD_at = (cues, n, fb) => window.TD.atOr(cues, n, fb);

  SH.sky_night = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, f1 = TD.f1, sd = seed * 1000 + 901, gy = (P.ground ?? 0.74) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bgG = el(cam, 'g'), bg = SKY.mkPen(bgG);
      const st = TD.stars(cam, sd + 1, W, H, P.stars ?? 24, 0.14, (P.ground ?? 0.74) - 0.12);
      const skyG = el(cam, 'g'), skyP = SKY.mkPen(skyG);
      const tG = el(cam, 'g'), tP = SKY.mkPen(tG);
      const boomT = (P.booms || []).map(() => el(cam, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 130, 'text-anchor': 'middle', fill: INK.red }));
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 30 + i));
      const cast = (P.cast || []).map((K, i) => TD.figure(el(root, 'g'), Object.assign({ hat: false, scale: 0.7, pose: 'look', face: 'right' }, K), sd + 50 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.15, y: 0.95, scale: 0.75, pose: 'shock', face: 'right' }, P.kasif), sd + 7) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, TD.atOr(cues, 'hit', null), 0.6);
          let shake = 0;
          (P.booms || []).forEach(b => { const a = TD.atOr(cues, b.at, null); if (a != null && lt >= a && lt < a + 0.45) shake += Math.sin(lt * 70) * 10 * (1 - (lt - a) / 0.45); });
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(W / 2 + shake)} ${f1(H * 0.45)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.45)})`);
          bg.begin(); nightWash(bg, W, gy, sd + 100, t); bg.end();
          st.update(t);
          skyP.begin();
          (P.streaks || []).forEach((A, i) => fireball(skyP, A, lt, t, W, H, cues, sd + 200 + i * 150));
          (P.booms || []).forEach((b, i) => {
            const a = TD.atOr(cues, b.at, null), x = (b.x ?? 0.5) * W, y = (b.y ?? 0.3) * H;
            if (a == null || lt < a) { boomT[i].setAttribute('opacity', 0); return; }
            for (let k = 0; k < 3; k++) {
              const r = (lt - a - k * 0.18) * 520; if (r <= 0 || r > 900) continue;
              const pts = []; for (let j = 0; j <= 14; j++) { const an = Math.PI * (0.1 + 0.8 * j / 14); pts.push([x + Math.cos(an) * r, y + Math.sin(an) * r * 0.55]); }
              skyP.fill(inkPath(pts, { w: 5, seed: sd + 600 + i * 5 + k, t, amp: 1.2 }), INK.ink);
            }
            const p = spring(lt, a, 0.5), pk = punch(lt, a, 0.5), b2 = boil(sd + 700 + i, t, 1.5);
            boomT[i].textContent = b.text || 'BOOM';
            boomT[i].setAttribute('opacity', clamp01(p * 3).toFixed(3));
            boomT[i].setAttribute('transform', `translate(${f1(x + b2[0])} ${f1(y + b2[1])}) rotate(-6) scale(${(lerp(0.4, 1, p) * (1 + 0.15 * pk)).toFixed(3)})`);
          });
          skyP.end();
          tP.begin(); if (P.town !== false) town(tP, W, gy, Object.assign({ x0: 0.05, x1: 0.95, s: 1 }, P.town || {}), sd + 300, t);
          else SKY.line(tP, [[0, gy], [W, gy + 4]], sd + 390, t, 6);
          tP.end();
          labels.forEach(l => l && l.update(lt, t, cues));
          cast.forEach(c => c && c.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  SH.sky_yard = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, f1 = TD.f1, sd = seed * 1000 + 951, gy = (P.ground ?? 0.8) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bgG = el(cam, 'g'), bg = SKY.mkPen(bgG);
      const st = P.night ? TD.stars(cam, sd + 1, W, H, 18, 0.14, 0.4) : null;
      const hG = el(cam, 'g'), hP = SKY.mkPen(hG);
      const HS = Object.assign({ x: 0.3, s: 1 }, P.house || {});
      const chunks = (P.chunks || []).map((c, i) => ({ c, d: SKY.chunk(el(cam, 'g'), sd + 20 + i) }));
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 40 + i));
      const cast = (P.cast || []).map((K, i) => TD.figure(el(root, 'g'), Object.assign({ hat: false, scale: 0.8, pose: 'idle', face: 'left' }, K), sd + 60 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.85, y: 0.95, scale: 0.75, pose: 'point', face: 'left' }, P.kasif), sd + 7) : null;
      const handG = el(root, 'g'), hand = P.pickup ? SKY.chunk(handG, sd + 90) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, TD.atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(W * 0.45)} ${f1(H * 0.6)}) scale(${z.toFixed(4)}) translate(${f1(-W * 0.45)} ${f1(-H * 0.6)})`);
          bg.begin(); if (P.night) nightWash(bg, W, gy, sd + 100, t); bg.end();
          if (st) st.update(t);
          // house with a corrugated tin roof + fence
          hP.begin();
          const hx = HS.x * W, s = HS.s, w = 520 * s, h = 230 * s, roofH = 150 * s;
          SKY.shape(hP, [[hx - w / 2, gy], [hx - w / 2, gy - h], [hx + w / 2, gy - h], [hx + w / 2, gy]], INK.paperLight, sd + 200, t, { w: 6 });
          const roof = [[hx - w / 2 - 50 * s, gy - h + 10], [hx - w / 2 + 70 * s, gy - h - roofH], [hx + w / 2 - 70 * s, gy - h - roofH], [hx + w / 2 + 50 * s, gy - h + 10]];
          SKY.shape(hP, roof, INK.paperDark, sd + 202, t, { w: 6 });
          for (let k = 1; k < 12; k++) { const u = k / 12; SKY.line(hP, [[lerp(roof[0][0], roof[3][0], u), gy - h + 6], [lerp(roof[1][0], roof[2][0], u), gy - h - roofH + 6]], sd + 210 + k, t, 2.8, INK.inkSoft); }
          SKY.shape(hP, [[hx - 40 * s, gy], [hx - 40 * s, gy - 150 * s], [hx + 40 * s, gy - 150 * s], [hx + 40 * s, gy]], INK.paperDark, sd + 230, t);
          for (const dx of [-170, 110]) SKY.shape(hP, [[hx + dx * s, gy - 170 * s], [hx + (dx + 70) * s, gy - 170 * s], [hx + (dx + 70) * s, gy - 100 * s], [hx + dx * s, gy - 100 * s]], P.night ? INK.gold : INK.paperDark, sd + 240 + dx, t, { w: 4 });
          for (let k = 0; k < 9; k++) { const x = hx + w / 2 + 60 + k * 70; if (x < W + 40) SKY.line(hP, [[x, gy + 4], [x + 2, gy - 90]], sd + 260 + k, t, 6); }
          SKY.line(hP, [[hx + w / 2 + 40, gy - 60], [W + 20, gy - 58]], sd + 280, t, 5); SKY.line(hP, [[hx + w / 2 + 40, gy - 25], [W + 20, gy - 24]], sd + 281, t, 5);
          SKY.line(hP, [[0, gy], [W, gy + 4]], sd + 290, t, 6);
          for (let k = 0; k < 14; k++) { const x = (k * 137 + 40) % W; SKY.line(hP, [[x, gy + 30 + (k % 3) * 40], [x + 40, gy + 26 + (k % 3) * 40]], sd + 300 + k, t, 3, INK.inkSoft); }
          hP.end();
          const pk = P.pickup ? TD.atOr(cues, P.pickup.at, null) : null;
          chunks.forEach(({ c, d }, i) => {
            const a = TD.atOr(cues, c.at, 0), p = lt >= a ? prog(lt, a, 0.5) : 0;
            if (pk != null && lt >= pk && i === (P.pickup.chunk ?? 0)) { d.update(t, -999, -999, 0.01); return; }
            if (p <= 0) { d.update(t, -999, -999, 0.01); return; }
            const y = lerp(-0.2 * H, c.y * H, p), b = punch(lt, a + 0.5, 0.4);
            d.update(t, c.x * W, y, (c.s ?? 0.8) * (1 + 0.15 * b), (c.rot ?? 0) + (1 - p) * 90, c.smoke === false ? 0 : 1);
          });
          labels.forEach(l => l && l.update(lt, t, cues));
          const hs = cast.map(c => c && c.update(lt, t, cues, W, H));
          if (hand) {
            if (pk != null && lt >= pk && hs[P.pickup.who ?? 0]) { const hh = hs[P.pickup.who ?? 0].hand; hand.update(t, hh[0], hh[1] - 20, 0.6 * spring(lt, pk, 0.4), -10, 0.7); }
            else hand.update(t, -999, -999, 0.01);
          }
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
