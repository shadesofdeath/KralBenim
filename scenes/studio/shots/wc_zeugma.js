// wc_zeugma — topic shots and objects for "Zeugma" (videos/2026-11-24/02-zeugma.json): Roman floor mosaics painted
// as real tesserae (a painted design, quantised into small stone cubes with mortar joints, baked once), water
// creeping over them, the floor cut into twelve pieces by looters, a face cleaned out of the soil, the earth in section.
//
//   wc_zeugma_floor  a villa floor seen from above, laid in the excavated earth. params: {
//                    design: "grid" (twelve panels: birds, masks, rosettes, fish) | "medallion" (a face in the middle),
//                    flood: {at, dur, to (0..1: how much of the floor is under water at the end), from: "right"|"bottom"},
//                    cut: at (s | cue: saw lines divide the field into 4 × 3 pieces), missing: [indexes 0..11], missing_at,
//                    ret: at (the missing pieces slide back in), night: true (dark, a lantern's pool of light),
//                    lantern: [x, y] (0..1 of the stage), notes: [{text, at, x, y, ax, ay, color}]}
//   wc_zeugma_face   the face mosaic (a woman, wild hair, eyes turned aside) as a close plate. params: {
//                    mode: "plain" | "reveal" (soil brushed away from at) | "water" (water ripples over it) |
//                    "museum" (a dark room, a pool of light), at, x (centre 0..1, default .5), size (×), notes: [...]}
//   wc_zeugma_layers the earth in section down to the floor. params: {mode: "collapse" (walls fall in, fire, the
//                    rubble covers the mosaic) | "time" (soil layers build up, fields on top) | "pit" (a looters' pit
//                    on the left; on the right the floor still buried), at, notes: [...], labels: true}
//   objects: bronze_statue (WC.G: a standing bronze god with a spear on a plinth; o: {spear: true})
//            dam (a concrete dam wall with spillway piers; o: {w: ×}) · mosaic_slab (a lifted panel under gauze; o: {gauze})
'use strict';
(() => {
  const C = WC.C, { clamp, seg, ss, eio, eo, mix, rnd, hash, vnoise, mixc } = WC;
  const mkCanvas = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.ceil(w)); cv.height = Math.max(1, Math.ceil(h)); return cv; };
  const hex = h => { const v = parseInt(WC.col(h).slice(1), 16); return [v >> 16 & 255, v >> 8 & 255, v & 255]; };
  const paperFill = (c, W, H) => { const pp = WC.paper(); if (pp) c.drawImage(pp, 0, 0, W, H); else { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); } };
  const notesOf = (X, P, lt, cues, W, H) => {
    for (const n of P.notes || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2);
      const o = { size: n.size || 46, col: n.color === 'red' ? C.red : C.ink, bend: n.bend };
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, o);
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), Object.assign(o, { align: n.align || 'center' }));
    }
  };
  // a broken-edged rectangle (the edge of a lifted / excavated mosaic)
  function brokenRect(x0, y0, x1, y1, j, seed) {
    const P = [], n = 18;
    const e = (i, k) => (vnoise(seed + i * .7 + k * 13) - .5) * 2 * j;
    for (let i = 0; i <= n; i++) P.push([mix(x0, x1, i / n), y0 + e(i, 0)]);
    for (let i = 1; i <= n; i++) P.push([x1 + e(i, 1), mix(y0, y1, i / n)]);
    for (let i = n - 1; i >= 0; i--) P.push([mix(x0, x1, i / n), y1 + e(i, 2)]);
    for (let i = n - 1; i >= 1; i--) P.push([x0 + e(i, 3), mix(y0, y1, i / n)]);
    return P;
  }
  const path = (c, P) => { c.beginPath(); P.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };

  // ------------------------------------------------------------ the tessera engine
  // src: a canvas with the design painted flat; returns a canvas of stone cubes in mortar
  function tessellate(src, cell, o = {}) {
    const w = src.width, h = src.height, out = mkCanvas(w, h), c = out.getContext('2d');
    const d = src.getContext('2d').getImageData(0, 0, w, h).data;
    const mortar = hex(o.mortar || mixc(C.stone, C.paperDark, .5));
    c.fillStyle = `rgb(${mortar.join(',')})`; c.fillRect(0, 0, w, h);
    const gap = o.gap ?? Math.max(1, cell * .16);
    for (let y = 0, r = 0; y < h; y += cell, r++) {
      const off = (r % 2) * cell * .5 * (o.brick ?? .35);
      for (let x = -cell + off; x < w; x += cell) {
        const cx = Math.min(w - 1, Math.max(0, Math.round(x + cell / 2))), cy = Math.min(h - 1, Math.round(y + cell / 2));
        const i = (cy * w + cx) * 4;
        if (d[i + 3] < 20) continue;
        const k = (hash(cx * .37 + cy * 1.91) - .5) * .16, jx = (hash(cx + cy * 3.1) - .5) * cell * .14, jy = (hash(cx * 2.3 + cy) - .5) * cell * .14;
        const f = v => Math.max(0, Math.min(255, Math.round(v * (1 + k))));
        c.fillStyle = `rgb(${f(d[i])},${f(d[i + 1])},${f(d[i + 2])})`;
        const s = cell - gap;
        c.fillRect(x + gap / 2 + jx, y + gap / 2 + jy, s * (.9 + hash(cx * 5.1 + cy) * .14), s * (.9 + hash(cx + cy * 4.7) * .14));
      }
    }
    // age: soft stains and worn patches, a watercolour bloom over the stones
    WC.withSeed(o.seed || 3, () => {
      for (let i = 0; i < 14; i++) { c.fillStyle = WC.rgba(i % 3 ? C.stain : C.paperLight, .07); c.beginPath(); c.ellipse(rnd(0, w), rnd(0, h), rnd(40, 160), rnd(30, 110), rnd(0, 3), 0, 7); c.fill(); }
    });
    return out;
  }

  // ------------------------------------------------------------ painted designs (flat, before tessellation)
  function waveBand(c, x0, y0, x1, y1, fg, bg) {
    c.fillStyle = bg; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    const hgt = y1 - y0, step = hgt * 1.6;
    c.strokeStyle = fg; c.lineWidth = hgt * .28; c.lineCap = 'round';
    for (let x = x0; x < x1; x += step) {
      c.beginPath(); c.moveTo(x, y1 - hgt * .25);
      c.bezierCurveTo(x + step * .35, y1 - hgt * .25, x + step * .45, y0 + hgt * .2, x + step * .7, y0 + hgt * .35);
      c.arc(x + step * .62, y0 + hgt * .52, hgt * .16, -1.2, 2.2); c.stroke();
    }
  }
  function frame(c, x0, y0, x1, y1, bw) {
    const ink = C.ink, light = C.paperLight, red = C.red;
    c.fillStyle = mixc(C.stoneDark, C.ink, .3); c.fillRect(x0, y0, x1 - x0, y1 - y0);
    c.fillStyle = light; c.fillRect(x0 + bw * .12, y0 + bw * .12, x1 - x0 - bw * .24, y1 - y0 - bw * .24);
    // the running wave on the four sides
    const b0 = bw * .22, b1 = bw * .72;
    waveBand(c, x0 + b0, y0 + b0, x1 - b0, y0 + b1, red, light);
    waveBand(c, x0 + b0, y1 - b1, x1 - b0, y1 - b0, red, light);
    c.save(); c.translate(x0 + b0, y1 - b0); c.rotate(-Math.PI / 2); waveBand(c, 0, 0, y1 - y0 - 2 * b0, b1 - b0, red, light); c.restore();
    c.save(); c.translate(x1 - b0, y0 + b0); c.rotate(Math.PI / 2); waveBand(c, 0, 0, y1 - y0 - 2 * b0, b1 - b0, red, light); c.restore();
    c.fillStyle = ink; c.fillRect(x0 + bw * .8, y0 + bw * .8, x1 - x0 - bw * 1.6, y1 - y0 - bw * 1.6);
    c.fillStyle = mixc(C.paperLight, C.stone, .25); c.fillRect(x0 + bw * .9, y0 + bw * .9, x1 - x0 - bw * 1.8, y1 - y0 - bw * 1.8);
  }
  const ell = (c, x, y, rx, ry, col, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.5, rx), Math.max(.5, ry), rot, 0, 7); c.fill(); };
  function motif(c, kind, x, y, s) {
    if (kind === 'bird') {               // a river bird (duck) facing right
      ell(c, x - s * .05, y + s * .1, s * .3, s * .17, C.clothB);
      ell(c, x - s * .1, y + s * .05, s * .2, s * .1, mixc(C.clothB, C.paperLight, .35));
      c.strokeStyle = C.clothB; c.lineWidth = s * .08; c.beginPath(); c.moveTo(x + s * .18, y + s * .02); c.quadraticCurveTo(x + s * .26, y - s * .14, x + s * .2, y - s * .24); c.stroke();
      ell(c, x + s * .22, y - s * .26, s * .09, s * .08, C.green);
      ell(c, x + s * .33, y - s * .25, s * .07, s * .03, C.gold);
      ell(c, x + s * .23, y - s * .28, s * .02, s * .02, C.ink);
      c.fillStyle = C.ink; c.beginPath(); c.moveTo(x - s * .3, y + s * .05); c.lineTo(x - s * .46, y - s * .04); c.lineTo(x - s * .4, y + s * .14); c.fill();
      c.strokeStyle = C.red; c.lineWidth = s * .035; c.beginPath(); c.moveTo(x - s * .02, y + s * .26); c.lineTo(x - s * .06, y + s * .38); c.moveTo(x + s * .06, y + s * .26); c.lineTo(x + s * .08, y + s * .38); c.stroke();
      c.strokeStyle = C.green; c.lineWidth = s * .04; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x - s * .4 + i * s * .26, y + s * .42); c.quadraticCurveTo(x - s * .36 + i * s * .26, y + s * .2, x - s * .3 + i * s * .26, y + s * .1); c.stroke(); }
    } else if (kind === 'mask') {        // a theatre mask
      ell(c, x, y, s * .3, s * .38, mixc(C.paperLight, C.skin, .45));
      ell(c, x - s * .12, y - s * .08, s * .07, s * .05, C.ink); ell(c, x + s * .12, y - s * .08, s * .07, s * .05, C.ink);
      ell(c, x, y + s * .17, s * .1, s * .08, C.ink);
      c.strokeStyle = C.inkSoft; c.lineWidth = s * .03; c.beginPath(); c.arc(x - s * .12, y - s * .14, s * .1, 3.5, 5.9); c.stroke(); c.beginPath(); c.arc(x + s * .12, y - s * .14, s * .1, 3.5, 5.9); c.stroke();
      ell(c, x, y - s * .36, s * .3, s * .1, C.wood);
      c.strokeStyle = C.red; c.lineWidth = s * .05; c.beginPath(); c.moveTo(x - s * .3, y - s * .1); c.quadraticCurveTo(x - s * .45, y + s * .2, x - s * .38, y + s * .4); c.moveTo(x + s * .3, y - s * .1); c.quadraticCurveTo(x + s * .45, y + s * .2, x + s * .38, y + s * .4); c.stroke();
    } else if (kind === 'rosette') {
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ell(c, x + Math.cos(a) * s * .22, y + Math.sin(a) * s * .22, s * .17, s * .08, i % 2 ? C.red : C.gold, a); }
      ell(c, x, y, s * .1, s * .1, C.ink); ell(c, x, y, s * .05, s * .05, C.gold);
    } else if (kind === 'fish') {
      ell(c, x, y, s * .32, s * .13, C.waterDeep); ell(c, x + s * .02, y - s * .03, s * .24, s * .06, mixc(C.water, C.paperLight, .3));
      c.fillStyle = C.waterDeep; c.beginPath(); c.moveTo(x - s * .28, y); c.lineTo(x - s * .45, y - s * .14); c.lineTo(x - s * .45, y + s * .14); c.fill();
      ell(c, x + s * .2, y - s * .02, s * .025, s * .025, C.ink);
      ell(c, x + s * .05, y + s * .3, s * .26, s * .06, mixc(C.water, C.paperLight, .2));
    }
  }
  // the face: a woman in three-quarter view, a mass of curls, ivy, eyes turned to one side, an earring
  function face(c, cx, cy, R) {
    const hair = [mixc(C.wood, C.ink, .75), mixc(C.wood, C.ink, .55), mixc(C.wood, C.ink, .35), mixc(C.stoneDark, C.ink, .65)];
    ell(c, cx, cy + R * 1.15, R * .95, R * .5, mixc(C.cloth, C.ink, .2));                       // shoulders, the dress
    ell(c, cx - R * .25, cy + R * 1.05, R * .5, R * .3, mixc(C.cloth, C.paperLight, .25));
    c.fillStyle = mixc(C.skin, C.wood, .25); c.fillRect(cx - R * .28, cy + R * .55, R * .5, R * .5);   // neck
    WC.withSeed(19, () => {                                                     // curls round the head
      for (let i = 0; i < 70; i++) { const a = rnd(-3.6, .5), r = R * rnd(.95, 1.3); ell(c, cx + Math.cos(a) * r * .9 + R * .05, cy - R * .12 + Math.sin(a) * r * .95, R * rnd(.16, .27), R * rnd(.14, .22), WC.pick(hair), rnd(0, 3)); }
      for (let i = 0; i < 26; i++) { const a = rnd(.3, 1.1) + (i % 2 ? 1.9 : 0), r = R * rnd(.95, 1.25); ell(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r * .9, R * rnd(.12, .2), R * rnd(.1, .18), WC.pick(hair), rnd(0, 3)); }
      for (let i = 0; i < 9; i++) { const a = -2.9 + i * .3, r = R * 1.08; ell(c, cx + Math.cos(a) * r, cy - R * .1 + Math.sin(a) * r, R * .13, R * .07, i % 2 ? C.leaf : C.leafDark, a + 1.2); }
    });
    ell(c, cx + R * .05, cy + R * .05, R * .68, R * .86, mixc(C.skin, C.paperLight, .08));   // the face
    ell(c, cx + R * .5, cy + R * .16, R * .16, R * .55, mixc(C.skin, C.wood, .2));   // a soft turn of the far cheek
    ell(c, cx + R * .05, cy + R * .78, R * .5, R * .14, mixc(C.skin, C.wood, .35));  // under the jaw
    ell(c, cx - R * .3, cy - R * .02, R * .22, R * .2, mixc(C.skin, C.paperLight, .3)); // lit cheekbone
    ell(c, cx - R * .3, cy + R * .27, R * .16, R * .1, mixc(C.skin, C.red, .28));   // blush
    for (const [ex, w] of [[-R * .25, R * .14], [R * .2, R * .115]]) {          // eyes: almond, gaze to the viewer's left
      ell(c, cx + ex, cy - R * .12, w, R * .065, mixc(C.paperLight, C.skin, .2));
      ell(c, cx + ex - w * .3, cy - R * .12, w * .42, R * .06, mixc(C.wood, C.ink, .65));
      ell(c, cx + ex - w * .3, cy - R * .125, w * .18, R * .03, C.ink);
      c.strokeStyle = mixc(C.wood, C.ink, .7); c.lineWidth = R * .035; c.beginPath(); c.ellipse(cx + ex, cy - R * .11, w * 1.02, R * .08, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      c.strokeStyle = mixc(C.wood, C.ink, .45); c.lineWidth = R * .03; c.beginPath(); c.ellipse(cx + ex, cy - R * .2, w * 1.15, R * .07, 0, Math.PI * 1.12, Math.PI * 1.88); c.stroke();
    }
    c.strokeStyle = mixc(C.skin, C.wood, .7); c.lineWidth = R * .06;          // nose
    c.beginPath(); c.moveTo(cx + R * .02, cy - R * .08); c.quadraticCurveTo(cx + R * .12, cy + R * .2, cx - R * .04, cy + R * .3); c.stroke();
    ell(c, cx - R * .02, cy + R * .3, R * .05, R * .03, mixc(C.wood, C.ink, .3));
    ell(c, cx - R * .02, cy + R * .5, R * .15, R * .055, C.red);                // lips
    ell(c, cx - R * .02, cy + R * .53, R * .1, R * .03, mixc(C.red, C.ink, .3));
    ell(c, cx - R * .66, cy + R * .15, R * .08, R * .13, mixc(C.skin, C.wood, .2));  // ear + earring
    ell(c, cx - R * .68, cy + R * .36, R * .07, R * .07, C.gold); ell(c, cx - R * .68, cy + R * .36, R * .03, R * .03, mixc(C.gold, C.ink, .4));
  }
  function design(w, h, kind) {
    const cv = mkCanvas(w, h), c = cv.getContext('2d');
    const bw = Math.min(w, h) * .1;
    frame(c, 0, 0, w, h, bw);
    const fx0 = bw * .9, fy0 = bw * .9, fw = w - bw * 1.8, fh = h - bw * 1.8;
    if (kind === 'face') { face(c, w / 2, h * .45, Math.min(w, h) * .29); return cv; }
    const kinds = ['bird', 'mask', 'rosette', 'fish'];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) {
      const x = fx0 + fw * (q + .5) / 4, y = fy0 + fh * (r + .5) / 3, s = Math.min(fw / 4, fh / 3) * .86;
      c.strokeStyle = C.inkSoft; c.lineWidth = Math.max(2, s * .04); c.strokeRect(x - fw / 8 + s * .04, y - fh / 6 + s * .04, fw / 4 - s * .08, fh / 3 - s * .08);
      if (kind === 'medallion' && r === 1 && (q === 1 || q === 2)) continue;
      motif(c, kinds[(r * 4 + q + r) % 4], x, y, s * .9);
    }
    if (kind === 'medallion') {
      const mx = w / 2, my = h / 2, R = fh * .3;
      ell(c, mx, my, R * 1.25, R * 1.25, C.ink); ell(c, mx, my, R * 1.18, R * 1.18, C.red); ell(c, mx, my, R * 1.1, R * 1.1, mixc(C.paperLight, C.stone, .2));
      c.save(); c.beginPath(); c.ellipse(mx, my, R * 1.1, R * 1.1, 0, 0, 7); c.clip(); face(c, mx, my - R * .08, R * .62); c.restore();
    }
    return cv;
  }
  const cache = new Map();
  function mosaic(w, h, kind, cell, seed) {
    const key = [w, h, kind, cell, seed].join('|');
    if (!cache.has(key)) cache.set(key, tessellate(design(w, h, kind), cell, { seed }));
    return cache.get(key);
  }

  // soil around an excavated floor: a broad earth wash with lumps, baked
  function earth(c, W, H, hole, seed) {
    WC.withSeed(seed, () => {
      WC.wash(c, [[-30, -30], [W + 30, -30], [W + 30, H + 30], [-30, H + 30]], C.ground, .5, 3, 6);
      WC.blooms(c, -20, -20, W + 20, H + 20, mixc(C.ground, C.stoneDark, .3), 14, .16);
      WC.granulate(c, -20, -20, W + 20, H + 20, C.stoneDark, 1, .16);
      for (let i = 0; i < 26; i++) { const x = rnd(0, W), y = rnd(0, H); if (x > hole[0] - 30 && x < hole[2] + 30 && y > hole[1] - 30 && y < hole[3] + 30) continue; const g = WC.make('rock', rnd(.25, .5), { col: C.stone }, i + seed); WC.drawObj(c, g, x, y); }
      // the trench edge: a darker band hugging the floor
      c.save(); c.strokeStyle = WC.rgba(mixc(C.ground, C.ink, .45), .35); c.lineWidth = 26; path(c, brokenRect(hole[0] - 14, hole[1] - 14, hole[2] + 14, hole[3] + 14, 10, seed)); c.stroke(); c.restore();
    });
  }

  // ------------------------------------------------------------ wc_zeugma_floor
  SHOTS.wc_zeugma_floor = { kind: '2d', build(ctx) {
    const { W, H, P, seed } = ctx, X = WC.canvas(ctx);
    const fit = P.fit === 'upper' ? [.2, .12, .8, .74] : [.16, .14, .84, .85];
    const x0 = W * fit[0], y0 = H * fit[1], x1 = W * fit[2], y1 = H * fit[3], fw = x1 - x0, fh = y1 - y0;
    const kind = P.design || 'grid';
    const mos = mosaic(Math.round(fw), Math.round(fh), kind, 15, 7);
    const edge = brokenRect(x0, y0, x1, y1, 9, seed + 2);
    const base = mkCanvas(W, H), b = base.getContext('2d');
    paperFill(b, W, H); earth(b, W, H, [x0, y0, x1, y1], seed + 5);
    b.save(); path(b, edge); b.clip(); b.drawImage(mos, x0, y0); b.restore();
    b.save(); b.strokeStyle = WC.rgba(C.ink, .55); b.lineWidth = 3; path(b, edge); b.stroke(); b.restore();
    // pieces: 4 × 3 over the inner field
    const bw = Math.min(fw, fh) * .1, px0 = x0 + bw * .9, py0 = y0 + bw * .9, pw = (fw - bw * 1.8) / 4, ph = (fh - bw * 1.8) / 3;
    const cell = i => [px0 + (i % 4) * pw, py0 + Math.floor(i / 4) * ph];
    const holeImg = mkCanvas(pw, ph);
    WC.withSeed(seed + 9, () => { const h = holeImg.getContext('2d'); h.fillStyle = mixc(C.ground, C.stoneDark, .5); h.fillRect(0, 0, pw, ph); WC.granulate(h, 0, 0, pw, ph, mixc(C.ground, C.ink, .4), 1.4, .3); h.fillStyle = WC.rgba(C.ink, .25); h.fillRect(0, 0, pw, 10); h.fillRect(0, 0, 8, ph); });
    let night = null;
    if (P.night) { night = mkCanvas(W, H); const n = night.getContext('2d'); n.drawImage(base, 0, 0); n.fillStyle = WC.rgba(C.night, .5); n.fillRect(0, 0, W, H); }
    const lantern = P.night ? WC.make('lantern', .7, {}, 3) : null;
    const lp = P.lantern || [.78, .5];
    const missing = P.missing || [];
    const fl = P.flood;
    const shimmer = WC.withSeed(seed + 4, () => Array.from({ length: 34 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), w: rnd(40, 120), ph: rnd(0, 6.28) })));
    return { update(lt, dur, cues) {
      X.clear();
      if (night) {
        X.drawImage(night, 0, 0);
        const r = 420 + Math.sin(lt * 7) * 6 + Math.sin(lt * 3.1) * 8, lx = lp[0] * W, ly = lp[1] * H;
        X.save(); X.beginPath(); X.arc(lx, ly, r, 0, 7); X.clip(); X.globalAlpha = .9; X.drawImage(base, 0, 0); X.restore();
        const g = X.createRadialGradient(lx, ly, r * .5, lx, ly, r); g.addColorStop(0, WC.rgba(C.night, 0)); g.addColorStop(1, WC.rgba(C.night, .6));
        X.fillStyle = g; X.beginPath(); X.arc(lx, ly, r + 1, 0, 7); X.fill();
        const gw = X.createRadialGradient(lx, ly, 10, lx, ly, r * .6); gw.addColorStop(0, WC.rgba(C.gold, .18)); gw.addColorStop(1, WC.rgba(C.gold, 0)); X.fillStyle = gw; X.beginPath(); X.arc(lx, ly, r * .6, 0, 7); X.fill();
      } else X.drawImage(base, 0, 0);
      // missing pieces (looted) and their return
      const tm = WC.timeOf(P.missing_at, cues, 0), tr = WC.timeOf(P.ret, cues, 1e9);
      missing.forEach((i, k) => {
        const [x, y] = cell(i), a = P.missing_at == null ? 1 : ss(seg(lt, tm + k * .25, tm + k * .25 + .8));
        if (a <= 0) return;
        const back = ss(seg(lt, tr + k * .3, tr + k * .3 + 1.4));
        X.globalAlpha = a * (1 - back) * (night ? .8 : 1); X.drawImage(holeImg, x, y); X.globalAlpha = 1;
        if (back > 0) { const dx = (1 - back) * (i % 4 < 2 ? -1 : 1) * 160, dy = (1 - back) * -120; X.save(); X.globalAlpha = back; X.beginPath(); X.rect(x + dx, y + dy, pw, ph); X.clip(); X.drawImage(mos, x0 + dx, y0 + dy); X.restore(); }
      });
      // saw cuts
      if (P.cut != null) {
        const tc = WC.timeOf(P.cut, cues, 1);
        X.save(); X.strokeStyle = WC.rgba(C.red, .85); X.lineWidth = 4; X.setLineDash([16, 9]); X.lineCap = 'round';
        const lines = [];
        for (let q = 1; q < 4; q++) lines.push([px0 + q * pw, py0, px0 + q * pw, py0 + 3 * ph]);
        for (let r = 1; r < 3; r++) lines.push([px0, py0 + r * ph, px0 + 4 * pw, py0 + r * ph]);
        lines.push([px0, py0, px0 + 4 * pw, py0], [px0 + 4 * pw, py0, px0 + 4 * pw, py0 + 3 * ph], [px0 + 4 * pw, py0 + 3 * ph, px0, py0 + 3 * ph], [px0, py0 + 3 * ph, px0, py0]);
        lines.forEach((L, k) => { const p = eio(seg(lt, tc + k * .18, tc + k * .18 + .9)); if (p <= 0) return; X.beginPath(); X.moveTo(L[0], L[1]); X.lineTo(mix(L[0], L[2], p), mix(L[1], L[3], p)); X.stroke(); });
        X.restore();
      }
      // flood: water creeping over the floor with a wavy front
      if (fl) {
        const t0 = WC.timeOf(fl.at, cues, 0), d = fl.dur ?? Math.max(2, dur - t0), p = (fl.from0 ?? 0) + ((fl.to ?? .6) - (fl.from0 ?? 0)) * ss(seg(lt, t0, t0 + d));
        if (p > 0) {
          const fromB = fl.from === 'bottom', front = [];
          if (fromB) { const yf = mix(H * .95, H * .02, p); for (let x = -20; x <= W + 20; x += 30) front.push([x, yf + Math.sin(x * .011 + lt * .9) * 14 + (vnoise(x * .004 + 3) - .5) * 60]); front.push([W + 20, H + 20], [-20, H + 20]); }
          else { const xf = mix(W * 1.02, W * .02, p); for (let y = -20; y <= H + 20; y += 30) front.push([xf + Math.sin(y * .012 + lt * .9) * 16 + (vnoise(y * .004 + 7) - .5) * 80, y]); front.push([W + 20, H + 20], [W + 20, -20]); }
          X.save(); path(X, front); X.fillStyle = WC.rgba(C.water, .42); X.fill(); X.clip();
          X.fillStyle = WC.rgba(C.waterDeep, .14); X.fillRect(0, 0, W, H);
          for (const m of shimmer) { const a = .35 * (.5 + .5 * Math.sin(lt * 1.5 + m.ph)); X.strokeStyle = WC.rgba(C.paperLight, a); X.lineWidth = 3; X.beginPath(); const dx = Math.sin(lt * .6 + m.ph) * 16; X.moveTo(m.x * W + dx, m.y * H); X.lineTo(m.x * W + dx + m.w, m.y * H + 2); X.stroke(); }
          X.restore();
          X.save(); X.strokeStyle = WC.rgba(C.paperLight, .75); X.lineWidth = 5; X.beginPath(); front.slice(0, -2).forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.stroke();
          X.strokeStyle = WC.rgba(C.waterDeep, .5); X.lineWidth = 2; X.beginPath(); front.slice(0, -2).forEach(([x, y], i) => i ? X.lineTo(x + (fromB ? 0 : 10), y + (fromB ? 10 : 0)) : X.moveTo(x + (fromB ? 0 : 10), y + (fromB ? 10 : 0))); X.stroke(); X.restore();
        }
      }
      if (lantern) { const a = ss(seg(lt, .2, 1)); WC.drawObj(X, lantern, lp[0] * W, lp[1] * H + 60, a); if (a >= 1 && lantern.live) { X.save(); X.translate(lp[0] * W, lp[1] * H + 60); lantern.live(X, lt, {}); X.restore(); } }
      notesOf(X, P, lt, cues, W, H);
    } };
  } };

  // ------------------------------------------------------------ wc_zeugma_face
  SHOTS.wc_zeugma_face = { kind: '2d', build(ctx) {
    const { W, H, P, seed } = ctx, X = WC.canvas(ctx);
    const mode = P.mode || 'plain', S = Math.round(Math.min(W, H) * .74 * (P.size ?? 1)) & ~1;
    const cx = (P.x ?? .5) * W, cy = (P.y ?? .43) * H, x0 = cx - S / 2, y0 = cy - S / 2;
    const mos = mosaic(S, S, 'face', 7, 11);
    const edge = brokenRect(x0, y0, x0 + S, y0 + S, 12, seed + 3);
    const base = mkCanvas(W, H), b = base.getContext('2d');
    paperFill(b, W, H);
    if (mode === 'museum') { b.fillStyle = WC.rgba(C.stoneDark, .32); b.fillRect(0, 0, W, H); const g = b.createRadialGradient(cx, cy, S * .2, cx, cy, S * 1.1); g.addColorStop(0, WC.rgba(C.skyWarm, .75)); g.addColorStop(1, WC.rgba(C.skyWarm, 0)); b.fillStyle = g; b.fillRect(0, 0, W, H); WC.withSeed(seed, () => WC.granulate(b, 0, 0, W, H, C.stoneDark, .8, .14)); }
    else earth(b, W, H, [x0, y0, x0 + S, y0 + S], seed + 5);
    b.save(); path(b, edge); b.clip(); b.drawImage(mos, x0, y0); b.restore();
    b.save(); b.strokeStyle = WC.rgba(C.ink, .5); b.lineWidth = 3; path(b, edge); b.stroke(); b.restore();
    let soil = null;
    if (mode === 'reveal') {
      soil = mkCanvas(W, H); const s = soil.getContext('2d'); s.drawImage(base, 0, 0);
      WC.withSeed(seed + 8, () => { s.save(); path(s, edge); s.clip(); s.fillStyle = WC.rgba(C.ground, .9); s.fillRect(x0, y0, S, S); WC.blooms(s, x0, y0, x0 + S, y0 + S, mixc(C.ground, C.stoneDark, .4), 12, .3); WC.granulate(s, x0, y0, x0 + S, y0 + S, C.stoneDark, 1.6, .3); s.restore(); });
    }
    const mask = soil ? mkCanvas(W, H) : null, mk = mask && mask.getContext('2d');
    const strokes = WC.withSeed(seed + 13, () => Array.from({ length: 9 }, (_, i) => { const y = y0 + S * (.08 + i * .105); return [x0 + S * rnd(-.05, .1), y + rnd(-20, 20), x0 + S * rnd(.9, 1.05), y + rnd(-30, 30)]; }));
    let spoil = null;
    if (P.spoil) WC.withSeed(seed + 21, () => {          // the heap: a lumpy earth mass with its own right edge
      spoil = mkCanvas(W, H); const c = spoil.getContext('2d'), w = spoil.width, pts = [[0, -20]];
      for (let y = -20; y <= H + 20; y += 26) { const k = (y - cy) / (H * .5); pts.push([w - 10 - vnoise(y * .012 + 2) * 50 - vnoise(y * .004 + 9) * 50 - k * k * 200, y]); }
      pts.push([0, H + 20]);
      path(c, pts); c.fillStyle = WC.rgba(mixc(C.ground, C.stoneDark, .45), .8); c.fill(); WC.wash(c, pts, mixc(C.ground, C.stoneDark, .55), 1, 5, 5);
      WC.granulate(c, 0, 0, w, H, mixc(C.ground, C.ink, .4), 1.6, .3);
      for (let i = 0; i < 30; i++) { const g = WC.make('rock', rnd(.2, .45), { col: C.stone }, i + 40); WC.drawObj(c, g, rnd(w - 420, w - 120), rnd(60, H - 40)); }
      c.strokeStyle = WC.rgba(C.ink, .45); c.lineWidth = 3; c.beginPath(); pts.slice(1, -1).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    });
    const ripples = WC.withSeed(seed + 2, () => Array.from({ length: 26 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), w: rnd(60, 160), ph: rnd(0, 6.28) })));
    return { update(lt, dur, cues) {
      X.clear();
      if (soil) {
        X.drawImage(soil, 0, 0);
        const t0 = WC.timeOf(P.at, cues, .5), p = seg(lt, t0, t0 + (P.paint ?? 2.6));
        mk.setTransform(1, 0, 0, 1, 0, 0); mk.globalCompositeOperation = 'source-over'; mk.clearRect(0, 0, W, H);
        mk.lineCap = 'round'; mk.strokeStyle = '#000'; mk.lineWidth = S * .16;
        strokes.forEach((L, k) => { const q = clamp(p * strokes.length - k); if (q <= 0) return; mk.beginPath(); mk.moveTo(L[0], L[1]); mk.lineTo(mix(L[0], L[2], eio(q)), mix(L[1], L[3], eio(q))); mk.stroke(); });
        mk.globalCompositeOperation = 'source-in'; mk.drawImage(base, 0, 0);
        X.drawImage(mask, 0, 0);
      } else X.drawImage(base, 0, 0);
      if (mode === 'museum') {
        const g = X.createRadialGradient(cx, cy, S * .3, cx, cy, S * .85); g.addColorStop(0, WC.rgba(C.night, 0)); g.addColorStop(1, WC.rgba(C.wood, .16 + .03 * Math.sin(lt)));
        X.fillStyle = g; X.fillRect(0, 0, W, H);
      }
      if (mode === 'water') {
        X.save(); path(X, edge); X.clip(); X.fillStyle = WC.rgba(C.water, .22); X.fillRect(x0, y0, S, S);
        for (const r of ripples) { const a = .35 * (.5 + .5 * Math.sin(lt * 1.4 + r.ph)); X.strokeStyle = WC.rgba(C.paperLight, a); X.lineWidth = 3; X.beginPath(); const dx = Math.sin(lt * .5 + r.ph) * 20; X.moveTo(x0 + r.x * S + dx, y0 + r.y * S); X.quadraticCurveTo(x0 + r.x * S + dx + r.w / 2, y0 + r.y * S - 6, x0 + r.x * S + dx + r.w, y0 + r.y * S); X.stroke(); }
        X.restore();
      }
      // water creeping in from the right up to the plate's edge (P.front: {at, dur, to: 0..1 of the plate width covered})
      if (P.front) {
        const f = P.front, t0 = WC.timeOf(f.at, cues, 0), p = ss(seg(lt, t0, t0 + (f.dur ?? 4)));
        const xf = mix(W + 40, x0 + S * (1 - (f.to ?? .1)), p), front = [];
        for (let y = -20; y <= H + 20; y += 24) front.push([xf + Math.sin(y * .014 + lt * .9) * 14 + (vnoise(y * .005 + 3) - .5) * 70, y]);
        front.push([W + 20, H + 20], [W + 20, -20]);
        X.save(); path(X, front); X.fillStyle = WC.rgba(C.water, .55); X.fill(); X.clip(); X.fillStyle = WC.rgba(C.waterDeep, .18); X.fillRect(0, 0, W, H);
        for (const r of ripples) { const a = .4 * (.5 + .5 * Math.sin(lt * 1.4 + r.ph)); X.strokeStyle = WC.rgba(C.paperLight, a); X.lineWidth = 3; X.beginPath(); const dx = Math.sin(lt * .5 + r.ph) * 20; X.moveTo(r.x * W + dx, r.y * H); X.lineTo(r.x * W + dx + r.w, r.y * H + 2); X.stroke(); }
        X.restore();
        X.save(); X.strokeStyle = WC.rgba(C.paperLight, .85); X.lineWidth = 6; X.beginPath(); front.slice(0, -2).forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.stroke(); X.restore();
      }
      // a heap of dug-out earth sliding over the plate from the left (P.spoil: {at, dur, to: 0..1 of the plate covered})
      if (spoil) {
        const f = P.spoil, t0 = WC.timeOf(f.at, cues, .3), p = eio(seg(lt, t0, t0 + (f.dur ?? 3)));
        const xe = mix(x0 - S * .45, x0 + S * (f.to ?? .3), p);
        X.drawImage(spoil, xe - spoil.width, 0);
      }
      // a slow light glint passing over the stones
      const gx = x0 + S * ((lt * .06 + .1) % 1.4 - .2);
      X.save(); path(X, edge); X.clip(); const gg = X.createLinearGradient(gx - 140, 0, gx + 140, 0); gg.addColorStop(0, WC.rgba(C.paperLight, 0)); gg.addColorStop(.5, WC.rgba(C.paperLight, mode === 'museum' ? .07 : .1)); gg.addColorStop(1, WC.rgba(C.paperLight, 0)); X.fillStyle = gg; X.fillRect(gx - 140, y0, 280, S); X.restore();
      notesOf(X, P, lt, cues, W, H);
    } };
  } };

  // ------------------------------------------------------------ wc_zeugma_layers
  SHOTS.wc_zeugma_layers = { kind: '2d', build(ctx) {
    const { W, H, P, seed } = ctx, X = WC.canvas(ctx), mode = P.mode || 'time';
    const surf = H * .28, floorY = H * .76, fl = H * .036;
    const strip = mosaic(Math.round(W * 1.1), Math.round(fl * 3), 'grid', 8, 5);   // the floor seen edge-on (a band of cubes)
    const back = mkCanvas(W, H), b = back.getContext('2d');
    paperFill(b, W, H);
    WC.withSeed(seed + 1, () => {
      const sky = b.createLinearGradient(0, 0, 0, surf); sky.addColorStop(0, WC.rgba(C.sky, .55)); sky.addColorStop(1, WC.rgba(C.skyWarm, .35)); b.fillStyle = sky; b.fillRect(0, 0, W, surf);
      // under the floor: old fill
      WC.wash(b, [[-20, floorY + fl], [W + 20, floorY + fl], [W + 20, H + 20], [-20, H + 20]], mixc(C.ground, C.stoneDark, .25), .45, 3, 3);
      WC.granulate(b, 0, floorY + fl, W, H, C.stoneDark, 1, .16);
    });
    // the soil layers above the floor: n bands (each a wash with a wavy top), painted from the bottom up
    const bands = WC.withSeed(seed + 3, () => {
      const L = [], n = 5, cols = [mixc(C.ground, C.stoneDark, .35), mixc(C.ground, C.wood, .2), C.ground, mixc(C.ground, C.stone, .4), mixc(C.ground, C.leaf, .15)];
      for (let i = 0; i < n; i++) {
        const top = mix(floorY - H * .16, surf, (i + 1) / n), bot = i === 0 ? floorY - H * .14 : mix(floorY - H * .16, surf, i / n);
        const cv = mkCanvas(W, H), c = cv.getContext('2d'), pts = [];
        for (let x = -20; x <= W + 20; x += 40) pts.push([x, top + Math.sin(x * .004 + i * 2) * 10 + (vnoise(x * .01 + i * 9) - .5) * 14]);
        pts.push([W + 20, bot + 6], [-20, bot + 6]);
        WC.wash(c, pts, cols[i], .62, 3, 3); WC.granulate(c, 0, top - 20, W, bot + 10, mixc(cols[i], C.ink, .3), 1.1, .2);
        for (let k = 0; k < 10; k++) { const g = WC.make('rock', rnd(.12, .28), { col: C.stone }, k + i * 20); WC.drawObj(c, g, rnd(0, W), rnd(top + 14, bot)); }
        L.push(cv);
      }
      return L;
    });
    // the rubble: mudbrick blocks, charcoal, burnt patches (falling in "collapse")
    const blocks = WC.withSeed(seed + 5, () => Array.from({ length: 46 }, (_, i) => {
      const w = rnd(60, 130), h = rnd(30, 52), x = rnd(30, W - 30), y = floorY - h / 2 - rnd(0, H * .12);
      return { x, y, w, h, rot: rnd(-.5, .5), col: WC.pick([mixc(C.ground, C.wood, .25), mixc(C.ground, C.stoneDark, .3), mixc(C.roof, C.ground, .5)]), t: rnd(0, 1), from: rnd(H * .2, H * .45) };
    }));
    const burnt = WC.withSeed(seed + 6, () => { const cv = mkCanvas(W, H), c = cv.getContext('2d'); for (let i = 0; i < 18; i++) { c.fillStyle = WC.rgba(i % 2 ? C.ink : C.wood, .22); c.beginPath(); c.ellipse(rnd(0, W), floorY - rnd(10, 60), rnd(60, 200), rnd(8, 20), 0, 0, 7); c.fill(); } return cv; });
    // walls of the room standing on the floor (collapse mode)
    const wallL = WC.make('wall', 1, { len: 260, h: 300, broken: false, crenel: false }, 4), wallR = WC.make('wall', 1, { len: 260, h: 300, broken: false, crenel: false }, 8);
    const tree = WC.make('tree', .9, {}, 3), ox = WC.make('ox', .8, { pose: 'walk' }, 2), man = WC.make('person', .8, { pose: 'walk', dress: 'peasant' }, 5);
    const digger = WC.make('person', 1.25, { pose: 'kneel', dress: 'peasant', hold: 'lantern' }, 6);
    const pit = [W * .06, W * .36];
    return { update(lt, dur, cues) {
      X.clear(); X.drawImage(back, 0, 0);
      const t0 = WC.timeOf(P.at, cues, .4);
      const time = mode === 'time', col = mode === 'collapse', pitM = mode === 'pit';
      // the floor band
      X.save(); X.beginPath(); X.rect(0, floorY - fl, W, fl * 2.2); X.clip(); X.drawImage(strip, -W * .05, floorY - fl * 1.1); X.restore();
      // rubble
      const pr = col ? 1 : 1;
      for (const k of blocks) {
        const tf = col ? t0 + k.t * 2.2 : -1, q = col ? eio(seg(lt, tf, tf + 1.1)) : 1;
        if (q <= 0) continue;
        X.save(); X.translate(k.x, k.y - (1 - q) * k.from); X.rotate(k.rot * q);
        X.fillStyle = WC.rgba(k.col, .9 * pr); X.fillRect(-k.w / 2, -k.h / 2, k.w, k.h);
        X.strokeStyle = WC.rgba(C.ink, .45); X.lineWidth = 2; X.strokeRect(-k.w / 2, -k.h / 2, k.w, k.h); X.restore();
      }
      if (col) {
        // the walls before they fall: standing, then fading as the bricks come down
        const a = 1 - ss(seg(lt, t0 + .3, t0 + 1.6));
        if (a > 0) { WC.drawObj(X, wallL, W * .22, floorY - fl, 1, { a }); WC.drawObj(X, wallR, W * .78, floorY - fl, 1, { a }); }
        X.globalAlpha = ss(seg(lt, t0 + 1, t0 + 2.5)); X.drawImage(burnt, 0, 0); X.globalAlpha = 1;
        for (let i = 0; i < 4; i++) WC.flame(X, W * (.2 + i * .2), floorY - H * .05, 80 * (1 - ss(seg(lt, t0 + 2, dur))) + 20, lt, i);
        for (let i = 0; i < 3; i++) WC.smoke(X, W * (.25 + i * .25), floorY - H * .1, H * .55, lt + 2, i, .32, 1);
      } else {
        X.drawImage(burnt, 0, 0);
        // soil layers
        bands.forEach((cv, i) => {
          const a = time ? ss(seg(lt, t0 + i * .8, t0 + i * .8 + 1)) : 1; if (a <= 0) return;
          X.globalAlpha = a; X.drawImage(cv, 0, 0); X.globalAlpha = 1;
        });
        const top = time ? ss(seg(lt, t0 + bands.length * .8, t0 + bands.length * .8 + 1)) : 1;
        if (top > 0) {
          WC.drawObj(X, tree, W * .86, surf + 6, top, { sk: .006 * Math.sin(lt * 1.1) });
          const wx = mix(W * .25, W * .55, clamp(lt / Math.max(4, dur)));
          WC.drawObj(X, ox, wx, surf + 8, 1, { a: top }); WC.drawObj(X, man, wx - 150, surf + 8, 1, { a: top });
        }
        if (pitM) {
          // the looters' pit: cut down from the surface to the floor, its floor band gone
          const p = eio(seg(lt, t0, t0 + 1.6));
          const yb = mix(surf, floorY + fl, p);
          X.save(); X.beginPath(); X.moveTo(pit[0], surf - 4); X.lineTo(pit[1], surf - 4); X.lineTo(pit[1] - 40, yb); X.lineTo(pit[0] + 40, yb); X.closePath();
          X.fillStyle = WC.rgba(mixc(C.ground, C.ink, .5), .88); X.fill(); X.clip(); for (let i = 0; i < 22; i++) { const bx = pit[0] + hash(i * 3.1) * (pit[1] - pit[0]), by = surf + hash(i * 7.7) * (yb - surf); X.fillStyle = WC.rgba(i % 2 ? C.ground : C.ink, .16); X.beginPath(); X.ellipse(bx, by, 30 + hash(i) * 50, 12 + hash(i + 9) * 18, 0, 0, 7); X.fill(); } X.restore();
          X.save(); X.beginPath(); X.moveTo(pit[0], surf - 4); X.lineTo(pit[0] + 40, yb); X.lineTo(pit[1] - 40, yb); X.lineTo(pit[1], surf - 4); X.strokeStyle = WC.rgba(C.ink, .6); X.lineWidth = 4; X.stroke(); X.restore();
          if (p >= 1) { const a = ss(seg(lt, t0 + 1.6, t0 + 2.4)); WC.drawObj(X, digger, (pit[0] + pit[1]) / 2, floorY + fl * .6, 1, { a }); if (digger.live && a > .5) { X.save(); X.translate((pit[0] + pit[1]) / 2, floorY + fl * .6); digger.live(X, lt, {}); X.restore(); } }
          // the face, still under the earth on the right: a hint of colour at the floor
          const fx = W * .7, g = X.createRadialGradient(fx, floorY, 10, fx, floorY, 160); g.addColorStop(0, WC.rgba(C.gold, .45 + .1 * Math.sin(lt * 1.5))); g.addColorStop(1, WC.rgba(C.gold, 0));
          X.fillStyle = g; X.fillRect(fx - 170, floorY - 120, 340, 200);
        }
      }
      if (P.labels) {
        WC.hand(X, '253', W * .03, floorY - fl * 2.6, seg(lt, .4, 1.2), { size: 40, col: C.red });
        if (!col) WC.hand(X, '1960', W * .03, surf + 34, seg(lt, t0 + 3, t0 + 4), { size: 40 });
      }
      // the ground line and a fringe of grass on top
      X.save(); X.strokeStyle = WC.rgba(C.ink, .55); X.lineWidth = 3; X.beginPath(); for (let x = 0; x <= W; x += 30) { const y = surf + Math.sin(x * .004) * 6; x ? X.lineTo(x, y) : X.moveTo(x, y); } X.stroke(); X.restore();
      notesOf(X, P, lt, cues, W, H);
    } };
  } };

  // ------------------------------------------------------------ objects
  // bronze_statue — a standing bronze god (Mars) with a spear, on a stone plinth. ~300 px with the plinth.
  WC.G.bronze_statue = (sc, o = {}) => {
    const fig = WC.G.person(sc * 1.15, { pose: 'stand', dress: 'roman', hold: o.spear === false ? undefined : 'spear' });
    const dark = hex(mixc(C.wood, C.ink, .45)), lite = hex(mixc(C.clothC, C.gold, .35));
    const toBronze = h => {
      if (typeof h !== 'string' || h[0] !== '#') return h;
      const [r, g, bb] = hex(h), l = (r * .3 + g * .59 + bb * .11) / 255, t = Math.pow(l, 1.3);
      const m = dark.map((v, i) => Math.round(v + (lite[i] - v) * t));
      return '#' + m.map(v => v.toString(16).padStart(2, '0')).join('');
    };
    const S = [];
    const pw = 90 * sc, ph = 70 * sc;
    S.push(WC.washShape([[-pw, 0], [pw, 0], [pw, -ph], [-pw, -ph]], C.stone, .8, 3, 2));
    S.push(WC.washShape([[-pw, -ph], [pw, -ph], [pw * .92, -ph - 14 * sc], [-pw * .92, -ph - 14 * sc]], mixc(C.stone, C.paperLight, .3), .8, 2, 2));
    S.push(...WC.inkLine([[-pw, 0], [-pw, -ph], [pw, -ph], [pw, 0]], 2.2 * sc, C.ink, { step: 1, a: .7 }));
    for (const s of fig.S) {
      const t = Object.assign({}, s);
      if (s.poly) { t.fill = toBronze(s.fill); t.poly = s.poly.map(r => r.map(([x, y]) => [x, y - ph - 14 * sc])); t.pts = s.pts.map(([x, y]) => [x, y - ph - 14 * sc]); }
      else { t.col = toBronze(s.col); t.pts = s.pts.map(([x, y]) => [x, y - ph - 14 * sc]); }
      S.push(t);
    }
    return { S, parts: { head: [0, -ph - 14 * sc - 160 * sc], plinth: [0, -ph / 2], top: [0, -ph - 200 * sc], bottom: [0, 0] } };
  };
  // coin_hoard — a heap of bronze coins spilling out of a broken pot; about 360 px wide
  WC.G.coin_hoard = (sc, o = {}) => {
    const S = [], w = 360 * sc, h = 150 * sc;
    const pot = []; for (let k = 0; k <= 16; k++) { const a = .5 + k / 16 * 5.2; pot.push([-w * .26 + Math.cos(a) * w * .19, -h * .5 + Math.sin(a) * h * .48]); }
    S.push(WC.washShape(pot, mixc(C.roof, C.ground, .3), .85, 3, 2), ...WC.inkLine(pot.concat([pot[0]]), 2.2 * sc, C.ink, { step: 1, a: .7 }));
    const cols = [mixc(C.clothC, C.wood, .3), mixc(C.clothC, C.green, .35), mixc(C.wood, C.gold, .35), mixc(C.clothC, C.ink, .25)];
    for (let i = 0; i < 150; i++) {
      const u = rnd(-1, 1), x = u * w * .5, top = -h * .55 * (1 - u * u) - h * .05, y = rnd(top, 0), r = rnd(11, 16) * sc;
      const pts = []; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r * rnd(.4, .6)]); }
      S.push(WC.washShape(pts, WC.pick(cols), .95, 1, .4));
      if (i % 3 === 0) S.push(WC.mk(WC.qcurve(x - r * .7, y + r * .2, x + r * .7, y + r * .2, 2, 4), 1.6 * sc, C.ink, { prof: 'even', nb: 0, a: .45 }));
    }
    return { S, parts: { top: [0, -h * .6], pot: [-w * .2, -h * .6], heap: [w * .2, -h * .3], bottom: [0, 0] } };
  };
  // dam — a concrete dam wall across a valley, spillway piers, a road on top; about 760 px wide
  WC.G.dam = (sc, o = {}) => {
    const S = [], w = 760 * sc * (o.w ?? 1), h = 170 * sc;
    const face = [[-w / 2, 0], [w / 2, 0], [w / 2 - 30 * sc, -h], [-w / 2 + 30 * sc, -h]];
    S.push(WC.washShape(face, mixc(C.stone, C.stoneDark, .2), 1, 4, 2)); S.push(WC.washShape(face, mixc(C.stone, C.paperLight, .2), .7, 2, 3));
    S.push(WC.washShape([[-w / 2, 0], [w / 2, 0], [w / 2 - 14 * sc, -h * .35], [-w / 2 + 14 * sc, -h * .35]], mixc(C.stone, C.stoneDark, .35), .45, 2, 2));
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x = -w * .3 + i * w * .6 / (n - 1);
      S.push(WC.mk(WC.qcurve(x, -h - 10 * sc, x, 0, 0, 6), 22 * sc, mixc(C.stoneDark, C.ink, .15), { prof: 'even', nb: 3, a: .9 }));
      if (i < n - 1) S.push(WC.washShape([[x + 8 * sc, -h * .9], [x + w * .6 / (n - 1) - 8 * sc, -h * .9], [x + w * .6 / (n - 1) - 8 * sc, -h * .5], [x + 8 * sc, -h * .5]], mixc(C.water, C.paperLight, .3), .5, 2, 1));
    }
    S.push(WC.mk(WC.qcurve(-w / 2 + 26 * sc, -h - 4 * sc, w / 2 - 26 * sc, -h - 4 * sc, 0, 20), 9 * sc, C.stoneDark, { prof: 'even', nb: 0, a: .8 }));
    S.push(...WC.inkLine(face.concat([face[0]]), 2.4 * sc, C.ink, { step: 1, a: .75 }));
    S.push(WC.mk(WC.qcurve(-w * .3, 4, w * .3, 4, 0, 16), 16 * sc, C.paperLight, { prof: 'leaf', nb: 5, a: .55 }));   // white water at the foot
    return { S };
  };
  // mosaic_slab — a lifted mosaic panel lying on the ground, seen a little from above, half under glued gauze
  WC.G.mosaic_slab = (sc, o = {}) => {
    const S = [], w = 300 * sc, h = 95 * sc, sk = 50 * sc, n = 26, m = 8;
    const P = (u, v) => [-w / 2 + u * w + (1 - v) * sk * .5 - sk * .25, -v * h];
    S.push(WC.washShape([P(0, 0), P(1, 0), P(1, 1), P(0, 1)], mixc(C.stone, C.paperDark, .4), .9, 2, 1));
    const cols = [C.red, C.paperLight, C.ink, C.gold, C.clothB, C.stone];
    for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
      const edgeB = i === 0 || j === 0 || i === n - 1 || j === m - 1, inner = i === 1 || j === 1 || i === n - 2 || j === m - 2;
      const dx = (i - (n - 1) / 2) / 3.2, dy = (j - (m - 1) / 2) / 1.6, r = Math.hypot(dx, dy);
      const k = edgeB ? ((i + j) % 2 ? 0 : 1) : inner ? 2 : r < .9 ? 0 : r < 1.6 ? 3 : r < 2.1 ? 4 : 1;
      const a = P(i / n + .006, j / m + .02), b = P((i + 1) / n - .006, j / m + .02), c = P((i + 1) / n - .006, (j + 1) / m - .02), d = P(i / n + .006, (j + 1) / m - .02);
      S.push(WC.washShape([a, b, c, d], cols[k], .85, 1, .5));
    }
    if (o.gauze !== false) {
      S.push(WC.washShape([P(.5, -.04), P(1.04, -.04), P(1.04, 1.06), P(.46, 1.06)], C.paperLight, .82, 3, 3));
      for (let i = 0; i < 5; i++) S.push(WC.mk(WC.qcurve(...P(.52 + i * .1, 0), ...P(.5 + i * .1, 1), 3, 6), 2 * sc, C.stone, { prof: 'even', nb: 0, a: .5 }));
    }
    S.push(...WC.inkLine([P(0, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)], 2 * sc, C.ink, { step: 1, a: .7 }));
    return { S };
  };
})();
