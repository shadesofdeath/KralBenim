// wc_ricemortar — sticky-rice mortar of the Ming walls (Stickstory ag-01, 2026-11-25). Watercolour kit: wc__lib.js
// (docs/SULUBOYA.md §9). Deterministic (WC.rnd inside WC.make / WC.withSeed, WC.hash in frames), colours only from
// WC.C tokens.
//
// Objects (WC.G; origin = base centre, y up negative, sc 1 = natural size):
//   great_wall   the Great Wall climbing a green ridge: a grey-brick wall with merlons snaking up from the lower left
//                to the far right, a big square watchtower (arched windows, crenellated top, a small roofed lookout)
//                near the front, smaller towers further up, a pale blue far ridge with a thin wall behind.
//                ≈ 960 × 470 px at sc 1 (the slope runs on 640 px below its base, under the ground).
//                o: {hero: false (no big front tower), far: false, base: px of slope below the base (640; 60 far away)}   parts: hero wall far
//   cauldron     a big iron wok set in a mud-brick stove, full of white rice soup; a wooden paddle in it;
//                live: fire in the stove mouth, steam rising, the paddle stirring slowly. ≈ 330 × 300 px.
//                parts: soup fire paddle
//   rice_bowl    a blue-and-white porcelain bowl heaped with sticky rice; live: a thread of steam. ≈ 250 × 200 px.
//                o: {steam: false}  parts: rice bowl
//   bulldozer    a modern yellow bulldozer in side view, blade toward −x; live: exhaust smoke. ≈ 400 × 250 px.
//                parts: blade cab
//   ming_tomb    a Ming tomb's soul tower: a crenellated brick platform with an arched tunnel, a red-walled
//                pavilion with a yellow double-eaved roof on top, the green burial mound behind. ≈ 560 × 380 px.
//                parts: tower tunnel mound
//   rice_sack / lime_basket   foreground props: a tied hemp sack with spilled grains; a woven basket of lime lumps.
//   microscope   a brass-and-black laboratory microscope with a glass slide on the stage. ≈ 260 × 390 px.
//                parts: eyepiece tube stage slide knob
//
// Shots:
//   wc_ricemortar_mix       close on a wooden trough of slaked lime: a ladle tips in from the top right and pours a
//       thin stream of rice soup; where it lands a cream swirl opens and turns, then a paddle stirs it round; a rice
//       sack and a lime basket stand in the foreground. params: {pour: s | cue (default 1),
//       notes: [{text, x, y, ax?, ay?, at, color, size, align}]}
//   wc_ricemortar_brick     close on the wall face: uneven grey bricks and pale mortar seams (faded into the paper at
//       the sides and bottom), sky and a far ridge above; one gap in the top course; on `set` (s | cue, default 1.2)
//       a new brick comes down into its mortar bed and a bead of mortar squeezes out. rain: true → a storm sky,
//       wet bricks, slanted rain, drops gathering on the bricks and running down the faces (no new brick).
//       params: {set, rain, notes}
//   wc_ricemortar_crystals  two microscope views, stacked: "lime only" (big loose crystals with dark pores) and
//       "with rice" (threads of starch, then tiny crystals packed tight). params: {top: {label, at}, bottom:
//       {label, at (threads), fill (crystals: s | cue)}, notes}
'use strict';

(() => {
  const C = WC.C, { rnd, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eio, hash } = WC, mixN = WC.mix;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ helpers
  const BRICK = () => mixc(mixc(C.stone, C.stoneDark, .5), C.far, .12);
  const BRICKD = () => mixc(BRICK(), C.ink, .32);
  const MORTAR = () => mixc(C.paperLight, C.stone, .35);
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const wsh = (S, pts, col, a = .85, n = 3, j = 1) => S.push(washShape(pts, col, a * (a > .7 ? .85 : 1), Math.max(3, n), Math.max(1.6, j * 1.6)));
  const ink = (S, pts, w = 2.2, a = .8, step = 3) => looseInk(S, pts, w, a * .9, .68);
  // dry-brush highlights: paper-white broken strokes over a lit face
  const dry = (S, x0, y0, x1, y1, n = 4, w = 7) => { for (let k = 0; k < n; k++) { const x = rnd(x0, x1), ya = rnd(y0, mixN(y0, y1, .4)); S.push(mk(qcurve(x, ya, x + rnd(-6, 6), ya + (y1 - y0) * rnd(.35, .6), rnd(-4, 4), 8), w * rnd(.7, 1.2), C.paperLight, { prof: 'leaf', nb: 5, a: .42, rough: .5 })); } };
  // a pooled shadow side: darker pigment gathering along an edge
  const pool = (S, pts, col, w = 10) => S.push(mk(along(pts, 16), w, col, { prof: 'even', nb: 5, a: .38, rough: .55 }));
  const brush = (S, pts, w, col, o = {}) => S.push(mk(pts, w, col, Object.assign({ prof: 'even', nb: 0 }, o)));
  const shadow = (S, cx, rx, ry = 10) => { wsh(S, WC.blobPts(cx, -1, rx * 1.05, ry * 1.4, 30, .1), C.stoneDark, .14, 3, 2); wsh(S, WC.blobPts(cx, -1, rx * .75, ry * .7, 26, .08), C.stoneDark, .2, 2, 1); };
  function chaikin(P, it = 2) {
    for (let k = 0; k < it; k++) { const o = [P[0]]; for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1]; o.push(a.map((v, j) => v * .75 + b[j] * .25), a.map((v, j) => v * .25 + b[j] * .75)); } o.push(P[P.length - 1]); P = o; }
    return P;
  }
  // scale a stroke list built at sc 1
  function scaleS(S, sc) {
    if (sc === 1) return S;
    for (const s of S) {
      if (s.poly) { s.poly = s.poly.map(r => r.map(([x, y]) => [x * sc, y * sc])); s.pts = s.pts.map(([x, y]) => [x * sc, y * sc]); continue; }
      s.pts = s.pts.map(([x, y]) => [x * sc, y * sc]); s.ws = s.ws.map(w => w * sc);
      if (s.br) for (const b of s.br) { b.bw *= sc; b.dash = b.dash.map(d => d * sc); }
    }
    return S;
  }
  const scP = (parts, sc) => { const o = {}; for (const k in parts) o[k] = [parts[k][0] * sc, parts[k][1] * sc]; return o; };
  function archPts(x, yb, w, h, n = 10) { const r = w / 2; return [[x - r, yb], [x - r, yb - h + r], ...ell(x, yb - h + r, r, r, PI, TAU, n).slice(1), [x + r, yb]]; }
  // soft steam: pale blobs rising and widening (drawn every frame)
  function steam(c, x, y, h, lt, i = 0, a = .3) {
    for (let k = 0; k < 8; k++) {
      const ph = ((lt * .2 + k / 8 + hash(i * 5 + k) * .1) % 1), yy = y - ph * h, xx = x + Math.sin(ph * 4 + lt * .5 + i + k) * h * .07 * (ph + .3);
      const r = h * (.05 + ph * .17), al = a * Math.sin(PI * ph);
      if (al <= .01) continue;
      const g = c.createRadialGradient(xx, yy, 0, xx, yy, r);
      g.addColorStop(0, WC.rgba(C.smoke, al * .5)); g.addColorStop(.6, WC.rgba(C.smoke, al * .25)); g.addColorStop(1, WC.rgba(C.smoke, 0));
      c.fillStyle = g; c.beginPath(); c.arc(xx, yy, r, 0, TAU); c.fill();
    }
  }
  function glow(c, x, y, r, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, WC.rgba(C.gold, a)); g.addColorStop(.5, WC.rgba(C.fire, a * .35)); g.addColorStop(1, WC.rgba(C.fire, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }

  // loose ink: a polyline as a few brush pieces with gaps (never a closed, even outline)
  function looseInk(S, pts, w, a = .7, keep = .7) {
    const P = along(pts, Math.max(8, Math.round(pts.length * 4)));
    for (let i = 0; i < P.length - 1; i += 4) {
      if (rnd() > keep) continue;
      const part = P.slice(i, Math.min(P.length, i + 5 + Math.floor(rnd(0, 3))));
      if (part.length > 1) S.push(mk(part, w * rnd(.6, 1.25), C.ink, { prof: 'tip', nb: 0, a: a * rnd(.7, 1), rough: .45 }));
    }
  }
  // brick dabs inside a quad face (x0..x1 at the bottom, tapering), rows of uneven bricks in a few tones
  function brickDabs(S, xL, xR, yTop, yBot, rowH, tones, a = .3, taper = 0) {
    for (let y = yBot - rowH * .55, r = 0; y > yTop + rowH * .4; y -= rowH, r++) {
      const f = (yBot - y) / Math.max(1, yBot - yTop), x0 = xL + taper * f, x1 = xR - taper * f;
      let x = x0 + (r % 2) * rowH * .9 + rnd(0, rowH * .4);
      while (x < x1 - rowH * .4) {
        const bl = rowH * rnd(1.4, 2.6), xe = Math.min(x1, x + bl);
        if (rnd() < .82) wsh(S, [[x + rnd(-1, 1), y - rowH * .36], [xe, y - rowH * .38 + rnd(-1, 1)], [xe + rnd(-1, 1), y + rowH * .34], [x, y + rowH * .36]], tones[Math.floor(rnd(0, tones.length))], a * rnd(.6, 1.2), 2, rowH * .06);
        x = xe + rowH * rnd(.18, .3);
      }
    }
  }
  // a Ming watchtower painted in layers: a pale underlay, two body washes, uneven bricks, a darker shadow side with
  // a ragged edge, dry-brush highlights, wet dark windows, merlons with paper-white tops, loose broken ink
  function mtower(S, cx, by, w, h, o = {}) {
    const br = o.col || BRICK(), dk = mixc(br, C.ink, .32), lite = mixc(br, C.paperLight, .5), top = by - h, j = w * .02;
    const body = [[cx - w / 2, by], [cx - w * .49, by - h * .5], [cx - w * .47, top], [cx, top + rnd(-2, 2)], [cx + w * .47, top], [cx + w * .49, by - h * .5], [cx + w / 2, by]];
    S.push(washShape(body, C.paperLight, 1, 1, 0));
    wsh(S, body, br, .5, 3, j);
    wsh(S, body.map(([x, y]) => [cx + (x - cx) * .94, by + (y - by) * .97]), lite, .25, 2, j * 2);
    if (w > 60) brickDabs(S, cx - w * .47, cx + w * .47, top + h * .08, by - h * .14, Math.max(6, h * .055), [br, dk, lite, mixc(br, C.stoneDark, .3)], .32, w * .03);
    // shadow side: a darker pigment layer with a ragged left edge, pooling darker at its right edge
    const sx = cx + w * .2, sh = [[sx + rnd(-3, 3), by]];
    for (let k = 1; k < 8; k++) sh.push([sx + rnd(-w * .03, w * .03), by - h * k / 8]);
    sh.push([cx + w * .47, top], [cx + w / 2, by]);
    wsh(S, sh, dk, .42, 3, j);
    S.push(mk(along([[cx + w * .48, top + 4], [cx + w * .5, by - 2]], 14), Math.max(3, w * .05), dk, { prof: 'even', nb: 4, a: .35, rough: .5 }));
    for (let k = 0; k < 3; k++) wsh(S, WC.blobPts(cx + rnd(-.35, .35) * w, by - rnd(.2, .8) * h, w * rnd(.08, .16), h * rnd(.04, .08), 14, .35), k % 2 ? dk : lite, .16, 2, 1);
    // dry-brush highlights on the lit face
    for (let k = 0; k < 4; k++) { const x = cx - w * rnd(.4, .05); S.push(mk(qcurve(x, top + h * rnd(.08, .3), x + rnd(-3, 3), top + h * rnd(.55, .85), rnd(-3, 3), 8), Math.max(3, w * .04), C.paperLight, { prof: 'leaf', nb: 5, a: .4, rough: .5 })); }
    // plinth of dressed stone at the foot
    wsh(S, [[cx - w * .52, by - h * .13], [cx + w * .52, by - h * .14], [cx + w * .52, by], [cx - w * .52, by]], mixc(C.stone, C.paperLight, .3), .55, 2, j);
    S.push(mk(along([[cx - w * .52, by - h * .135], [cx + w * .52, by - h * .14]], 10), Math.max(1.5, w * .018), dk, { prof: 'tip', nb: 0, a: .45 }));
    // windows: wet dark washes, a little blurred, a lighter pooling inside
    const nw = o.windows ?? 3, ww = w * .14, wh = h * .2, wcol = mixc(C.ink, C.stoneDark, .35);
    for (let i = 0; i < nw; i++) { const x = cx + (i - (nw - 1) / 2) * w * .27 + rnd(-2, 2); wsh(S, archPts(x, top + h * .5, ww, wh), wcol, .55, 3, ww * .06); wsh(S, archPts(x + ww * .1, top + h * .5, ww * .6, wh * .7), wcol, .3, 2, ww * .1); }
    if (o.door) { wsh(S, archPts(cx - w * .02, by - h * .135, w * .2, h * .3), wcol, .6, 3, w * .01); wsh(S, archPts(cx, by - h * .135, w * .13, h * .2), wcol, .3, 2, w * .01); }
    // parapet band and merlons: uneven, paper-white tops, shadowed right sides
    const pb = Math.max(4, h * .07);
    wsh(S, [[cx - w * .5, top], [cx + w * .5, top + rnd(-2, 2)], [cx + w * .5, top + pb], [cx - w * .5, top + pb]], lite, .5, 2, j);
    S.push(mk(along([[cx - w * .5, top + pb], [cx + w * .5, top + pb]], 10), Math.max(2, w * .03), dk, { prof: 'even', nb: 3, a: .35, rough: .5 }));
    const nm = Math.max(3, Math.round(w / Math.max(10, w * .16))), mw = w / (nm * 2 - 1);
    for (let i = 0; i < nm; i++) {
      const x0 = cx - w * .5 + i * mw * 2 + rnd(-1, 1), mh = Math.max(5, h * rnd(.07, .095));
      const m = [[x0, top + 1], [x0 + rnd(-1, 1), top - mh], [x0 + mw, top - mh + rnd(-1.5, 1.5)], [x0 + mw, top + 1]];
      S.push(washShape(m, C.paperLight, 1, 1, 0)); wsh(S, m, br, .55, 2, mw * .06);
      wsh(S, [[x0 + mw * .6, top + 1], [x0 + mw * .6, top - mh], [x0 + mw, top - mh], [x0 + mw, top + 1]], dk, .35, 1, mw * .04);
      S.push(mk([[x0 + 1, top - mh + 1], [x0 + mw - 1, top - mh + 1]], Math.max(1.5, mh * .2), C.paperLight, { prof: 'even', nb: 0, a: .7 }));
      if (rnd() < .7) looseInk(S, [[x0 + mw, top], [x0 + mw, top - mh], [x0, top - mh]], Math.max(1, w * .011), .6, .9);
    }
    if (o.roof) {    // a small lookout pavilion on the roof
      const rw = w * .42, rh = h * .2, ry = top - h * .08;
      wsh(S, box(cx - rw * .38, ry - rh * .55, cx + rw * .38, ry), mixc(C.cloth, C.stone, .35), .65, 3, 1);
      wsh(S, box(cx + rw * .1, ry - rh * .55, cx + rw * .38, ry), mixc(C.cloth, C.ink, .3), .3, 2, 1);
      const eave = [[cx - rw * .86, ry - rh * .62], [cx - rw * .66, ry - rh * .6], [cx - rw * .3, ry - rh * 1.15], [cx + rw * .3, ry - rh * 1.15], [cx + rw * .66, ry - rh * .6], [cx + rw * .86, ry - rh * .62], [cx + rw * .62, ry - rh * .48], [cx - rw * .62, ry - rh * .48]];
      S.push(washShape(eave, C.paperLight, 1, 1, 0));
      wsh(S, eave, mixc(C.inkSoft, C.stoneDark, .4), .6, 3, 1.5);
      wsh(S, eave.slice(3, 7), mixc(C.inkSoft, C.ink, .3), .3, 2, 1);
      S.push(mk(along([[cx - rw * .3, ry - rh * 1.17], [cx + rw * .3, ry - rh * 1.17]], 8), Math.max(2, rh * .12), C.ink, { prof: 'tip', nb: 0, a: .75 }));
      looseInk(S, eave.slice(0, 6), Math.max(1, w * .012), .65, .75);
    }
    // loose ink: strongest down the shadow side, broken on the lit side and the top
    looseInk(S, [[cx + w * .47, top], [cx + w * .49, by - h * .5], [cx + w / 2, by]], Math.max(1.6, w * .02), .75, .9);
    looseInk(S, [[cx - w * .47, top], [cx - w * .49, by - h * .5], [cx - w / 2, by]], Math.max(1.2, w * .014), .5, .55);
  }
  // ------------------------------------------------------------ great_wall
  WC.G.great_wall = (sc, o = {}) => {
    const S = [];
    // the far ridge and its thin wall (behind everything)
    if (o.far !== false) {
      const fr = chaikin([[-120, 0], [-60, -210], [60, -300], [190, -360], [300, -395], [400, -430], [500, -420], [560, -360], [560, 0]], 2);
      wsh(S, fr, mixc(C.far, C.paper, .3), .5, 3, 2);
      const crest = chaikin([[250, -383], [330, -405], [400, -432], [470, -428], [540, -400]], 2);
      const fw = mixc(BRICK(), C.far, .55);
      wsh(S, crest.map(([x, y]) => [x, y - 9]).concat(crest.slice().reverse().map(([x, y]) => [x, y + 2])), fw, .7, 2, .5);
      for (const [x, y] of [[330, -405], [470, -428]]) mtower(S, x, y + 2, 20, 26, { col: fw, windows: 1 });
    }
    // the main ridge: follows the wall's path, falls to the ground at both ends
    const path = chaikin([[-500, -10, 1.15], [-400, -40, 1.12], [-300, -95, 1.08], [-200, -150, 1.03], [-120, -175, 1], [-40, -205, .9], [40, -255, .8],
      [110, -300, .7], [170, -318, .63], [235, -292, .56], [300, -305, .5], [350, -345, .45], [410, -372, .4], [470, -366, .36]], 3);
    const BASE = o.base ?? 640;
    const hill = [[-560, BASE], [-560, -6], ...path.map(([x, y]) => [x, y + 4]), [520, -300], [560, -200], [600, BASE]];
    const green = mixc(C.mid, C.leaf, .25);
    wsh(S, hill, green, .78, 3, 2);
    wsh(S, [[-560, BASE], ...path.map(([x, y]) => [x, y + 40 + (y + 380) * .2]), [600, -150], [600, BASE]], mixc(C.leaf, C.ground, .2), .28, 2, 3);
    if (BASE > 100) wsh(S, [[-560, 30], [600, 10], [600, BASE], [-560, BASE]], mixc(C.leaf, C.ground, .45), .35, 2, 4);
    for (let i = 0; i < (BASE > 100 ? 18 : 0); i++) { const x = rnd(-540, 580), y = rnd(30, 560); brush(S, qcurve(x, y, x + rnd(40, 110), y + rnd(-6, 8), rnd(-6, 6), 6), rnd(3, 6), mixc(C.leaf, C.ink, .1), { prof: 'leaf', nb: 2, a: .2 }); }
    // slope texture: dry-brush strokes and shrub clumps below the crest
    for (let i = 0; i < 26; i++) {
      const x = rnd(-480, 520), py = path.reduce((b, p) => Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b, path[0])[1], y = rnd(py + 30, Math.min(-10, py + 260));
      if (y > -8) continue;
      brush(S, qcurve(x, y, x + rnd(30, 80), y + rnd(10, 30), rnd(-6, 6), 6), rnd(3, 6), mixc(C.leaf, C.ink, .1), { prof: 'leaf', nb: 2, a: .22 });
    }
    for (let i = 0; i < 16; i++) {
      const x = rnd(-470, 500), py = path.reduce((b, p) => Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b, path[0])[1], y = rnd(py + 26, Math.min(-12, py + 200));
      if (y > -10) continue;
      WC.clump(S, x, y, rnd(10, 18), 9, WC.shades(C.leafDark, .18), { l0: 6, l1: 12, w0: 4, w1: 8 });
    }
    // the wall face along the crest: wet washes, uneven brick dabs, a shadowed lower band, paper-white walkway edge
    const hw = 44, tp = path.map(([x, y, k]) => [x, y - hw * k]), bp = path.map(([x, y, k]) => [x, y + 4 * k]);
    const br = BRICK(), dk = BRICKD(), lite = mixc(br, C.paperLight, .5);
    S.push(washShape(tp.concat(bp.slice().reverse()), C.paperLight, 1, 1, 0));
    wsh(S, tp.concat(bp.slice().reverse()), br, .55, 3, 2.5);
    wsh(S, path.map(([x, y, k]) => [x, y - hw * k * (.38 + .12 * WC.vnoise(x * .02))]).concat(bp.slice().reverse()), dk, .32, 3, 2);
    for (let i = 4; i < path.length - 2; i += 3) {
      const [x, y, k] = path[i], rh = 7 * k;
      for (let r = 0; r < 4; r++) { const yy = y - hw * k * (.15 + r * .22), bl = rh * rnd(1.5, 2.6); if (rnd() < .75) wsh(S, [[x, yy - rh * .4], [x + bl, yy - rh * .4 + (path[i + 1][1] - y) * .3], [x + bl, yy + rh * .35 + (path[i + 1][1] - y) * .3], [x, yy + rh * .35]], [br, dk, lite][Math.floor(rnd(0, 3))], .28, 2, 1); }
    }
    S.push(mk(along(bp, 160), 6, dk, { prof: 'even', nb: 5, a: .3, rough: .5 }));
    // the walkway's paper-white top edge (dry brush) and the merlons
    S.push(mk(along(tp, 160), 4, C.paperLight, { prof: 'even', nb: 6, a: .55, rough: .5 }));
    let acc = 0;
    for (let i = 1; i < tp.length; i++) {
      const [x0, y0] = tp[i - 1], [x1, y1] = tp[i], k = path[i][2], d = Math.hypot(x1 - x0, y1 - y0);
      acc += d;
      if (acc < 15 * k) continue;
      acc = 0;
      const mw = 8 * k, mh = 10 * k * rnd(.8, 1.15);
      const m = [[x1 - mw / 2, y1 + 1], [x1 - mw / 2 + rnd(-.6, .6), y1 - mh], [x1 + mw / 2, y1 - mh + rnd(-1, 1)], [x1 + mw / 2, y1 + 1]];
      S.push(washShape(m, C.paperLight, 1, 1, 0)); wsh(S, m, br, .6, 2, .5);
      wsh(S, [[x1, y1 + 1], [x1, y1 - mh], [x1 + mw / 2, y1 - mh], [x1 + mw / 2, y1 + 1]], dk, .3, 1, .3);
      if (rnd() < .6) S.push(mk([[x1 - mw / 2, y1 - mh], [x1 + mw / 2, y1 - mh]], Math.max(1, 1.4 * k), C.ink, { prof: 'tip', nb: 0, a: .45 }));
    }
    looseInk(S, tp, 2.2, .65, .6); looseInk(S, bp, 1.6, .45, .45);
    // towers along the wall: big front tower (hero), two smaller ones further up
    const at = x => path.reduce((b, p) => Math.abs(p[0] - x) < Math.abs(b[0] - x) ? p : b, path[0]);
    const towers = [[170, 62, 78], [410, 40, 52]];
    for (const [x, w, h] of towers) { const [px, py, k] = at(x); mtower(S, px, py + 4, w * k / .63 * .63, h, { windows: 2 }); }
    const [hx, hy] = at(-150);
    if (o.hero !== false) {
      shadow(S, hx + 10, 80, 8);
      mtower(S, hx, hy + 22, 150, 205, { roof: true, door: true });
    }
    const ftop = hy + 22 - 205 - 16;
    const live = o.hero === false ? null : (c, lt) => {
      c.save(); c.scale(sc, sc);
      const px = hx - 62, py = ftop - 4, L = 78;
      c.strokeStyle = WC.rgba(C.ink, .85); c.lineWidth = 3; c.beginPath(); c.moveTo(px, py); c.lineTo(px, py - L); c.stroke();
      const top = [], bot = [];
      for (let k = 0; k <= 8; k++) { const f = k / 8, wv = Math.sin(f * 4.5 - lt * 4.2) * 11 * f + Math.sin(lt * 1.7) * 3 * f; top.push([px + f * 56, py - L + wv]); bot.push([px + f * 52, py - L + 30 * (1 - f * .5) + wv]); }
      c.beginPath(); top.concat(bot.reverse()).forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath();
      c.fillStyle = WC.rgba(C.cloth, .85); c.fill();
      c.restore();
    };
    return { S: scaleS(S, sc), parts: scP({ hero: [hx, hy - 110], wall: [-330, -100], far: [400, -420] }, sc), live };
  };

  // ------------------------------------------------------------ cauldron
  WC.G.cauldron = (sc, o = {}) => {
    const S = [], mud = mixc(mixc(C.ground, C.wood, .35), C.roof, .2), mudD = mixc(mud, C.ink, .28);
    shadow(S, 0, 170, 10);
    // the stove: a mud-brick block
    const st = [[-165, 0], [-155, -150], [155, -150], [165, 0]];
    wsh(S, st, mud, .9, 3, 1.5);
    wsh(S, [[60, 0], [58, -150], [155, -150], [165, 0]], mudD, .3, 2, 1);
    wsh(S, [[95, 0], [93, -150], [155, -150], [165, 0]], mudD, .25, 2, 3); pool(S, [[158, -146], [164, -4]], mudD, 12); dry(S, -150, -145, -40, -10, 5, 9);
    for (let y = -24; y > -145; y -= 24) brush(S, along([[-160, y], [160, y + rnd(-2, 2)]], 10), 1.6, mudD, { a: .28, rough: .5 });
    for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) { const x = -150 + k * 50 + (r % 2) * 25, y = -24 * r; if (x > -150 && x < 150) brush(S, [[x, y - 2], [x, y - 22]], 1.4, mudD, { a: .22 }); }
    // the fire mouth
    const mouth = archPts(0, 0, 96, 82, 12);
    wsh(S, mouth, mixc(C.ink, C.wood, .3), .9, 2, .5);
    wsh(S, archPts(0, 0, 70, 50, 10), mixc(C.fire, C.wood, .35), .55, 2, .5);
    for (const [x, r] of [[-20, -.2], [16, .25]]) brush(S, [[x - 30, -6], [x + 30, -10 + r * 6]], 11, C.wood, { a: .9 });
    // the wok: dark iron lip, the soup surface
    const ry = 42, rx = 150, cy = -152;
    wsh(S, ell(0, cy, rx + 8, ry + 6, 0, TAU, 48), mixc(C.ink, C.inkSoft, .4), .9, 2, .5);
    wsh(S, ell(0, cy + 2, rx - 6, ry - 6, 0, TAU, 48), MORTAR(), .95, 3, .5);
    wsh(S, ell(-30, cy - 6, rx * .6, ry * .45, 0, TAU, 30), C.paperLight, .5, 2, 1);
    wsh(S, ell(40, cy + 10, rx * .55, ry * .35, 0, TAU, 30), mixc(C.stone, C.clothC, .2), .3, 2, 1);
    for (let i = 0; i < 46; i++) { const a = rnd(0, TAU), r = Math.sqrt(rnd()) * .85, x = Math.cos(a) * r * (rx - 10), y = cy + 2 + Math.sin(a) * r * (ry - 10), d = rnd(0, PI); brush(S, [[x - Math.cos(d) * 4, y - Math.sin(d) * 2], [x + Math.cos(d) * 4, y + Math.sin(d) * 2]], 3.4, i % 3 ? C.paperLight : mixc(C.stone, C.clothC, .25), { a: .9 }); }
    ink(S, ell(0, cy, rx + 8, ry + 6, 0, TAU, 48), 2.4, .8, 3);
    // the iron handles on the rim
    for (const s of [-1, 1]) brush(S, ell(s * (rx + 14), cy - 2, 12, 9, s > 0 ? -PI / 2 : PI / 2, s > 0 ? PI / 2 : PI * 1.5, 10), 4, C.ink, { a: .8 });
    ink(S, st, 2.4, .8, 1);
    const live = (c, lt, it) => {
      const k = it && it.reveal != null ? it.reveal : 1;
      c.save(); c.scale(sc, sc);
      glow(c, 0, -30, 120, .35 * k * (.85 + .15 * Math.sin(lt * 5)));
      WC.flame(c, -14, -4, 52 * (.9 + .1 * Math.sin(lt * 6.3)), lt, 3);
      WC.flame(c, 18, -4, 40 * (.9 + .1 * Math.sin(lt * 7.1 + 1)), lt, 4);
      // the paddle stirring slowly in the soup
      const a = -1.1 + Math.sin(lt * 1.1) * .12, px = 20 + Math.cos(lt * 1.1) * 40, py = cy - 2 + Math.sin(lt * 1.1) * 12;
      c.save(); c.translate(px, py); c.rotate(a);
      c.fillStyle = WC.rgba(mixc(C.wood, C.paperLight, .3), .95); c.beginPath(); c.ellipse(0, 0, 26, 12, 0, 0, TAU); c.fill();
      c.strokeStyle = WC.rgba(mixc(C.wood, C.paperLight, .2), .95); c.lineCap = 'round'; c.lineWidth = 9; c.beginPath(); c.moveTo(14, 0); c.lineTo(175, 0); c.stroke();
      c.strokeStyle = WC.rgba(C.ink, .7); c.lineWidth = 2; c.beginPath(); c.moveTo(20, -5); c.lineTo(175, -5); c.moveTo(20, 5); c.lineTo(175, 5); c.stroke();
      c.restore();
      for (let i = 0; i < 3; i++) steam(c, -70 + i * 70, cy - 20, 330, lt + i * 1.3, i, .42 * k);
      c.restore();
    };
    return { S: scaleS(S, sc), parts: scP({ soup: [0, cy], fire: [0, -30], paddle: [120, cy - 90] }, sc), live };
  };

  // ------------------------------------------------------------ rice_bowl
  WC.G.rice_bowl = (sc, o = {}) => {
    const S = [], por = mixc(C.paperLight, C.sky, .12), porD = mixc(C.paperLight, C.sky, .55), blue = C.blue;
    shadow(S, 6, 80, 7);
    const rim = -118, rx = 128;
    // foot ring, body
    wsh(S, box(-48, -16, 48, 0), porD, .8, 2, .5);
    const body = [[-rx, rim], ...qcurve(-rx, rim, -48, -16, 45, 12).slice(1), [48, -16], ...qcurve(48, -16, rx, rim, 45, 12).slice(1)];
    const heap0 = [...qcurve(-rx + 6, rim, 0, rim - 86, -60, 14), ...qcurve(0, rim - 86, rx - 6, rim, -60, 14).slice(1)];
    S.push(washShape(body.concat(heap0.slice().reverse()), C.paperLight, 1, 1, 0));
    wsh(S, body, por, .92, 3, .5);
    wsh(S, [[30, -18], ...qcurve(48, -16, rx, rim, 45, 12).slice(1), [60, rim]], porD, .35, 2, .5);
    // blue bands and a loose lotus scroll
    brush(S, along(qcurve(-rx + 6, rim + 12, rx - 6, rim + 12, -12, 20), 30), 6, blue, { a: .75 });
    brush(S, along(qcurve(-56, -28, 56, -28, -4, 10), 14), 4, blue, { a: .7 });
    for (let k = 0; k < 5; k++) {
      const x = -78 + k * 39, y = -66 + (k % 2) * 8;
      brush(S, ell(x, y, 13, 9, rnd(0, 1), rnd(4, 5.5), 10), 3, blue, { a: .7, prof: 'tip' });
      brush(S, qcurve(x + 10, y + 4, x + 30, y - 6, 6, 6), 2.4, blue, { a: .6, prof: 'tip' });
    }
    // the heap of rice above the rim
    const heap = [...ell(0, rim, rx - 4, 18, 0, PI, 20), ...qcurve(-rx + 6, rim, 0, rim - 86, -60, 14).slice(1), ...qcurve(0, rim - 86, rx - 6, rim, -60, 14).slice(1)];
    wsh(S, heap, mixc(C.paperLight, C.stone, .3), .9, 3, 1);
    wsh(S, ell(28, rim - 30, 60, 30, 0, TAU, 20), mixc(C.stone, C.stoneDark, .2), .2, 2, 1);
    for (let i = 0; i < 60; i++) {
      const x = rnd(-.85, .85) * (rx - 10), top = rim - 86 * (1 - Math.pow(x / rx, 2)) * .95, y = rnd(top + 6, rim + 4), d = rnd(0, PI);
      brush(S, [[x - Math.cos(d) * 5, y - Math.sin(d) * 2.5], [x + Math.cos(d) * 5, y + Math.sin(d) * 2.5]], 4, i % 3 ? C.paperLight : mixc(C.stone, C.stoneDark, .25), { a: .9 });
    }
    ink(S, body, 2.2, .75, 2);
    ink(S, ell(0, rim, rx, 14, 0, PI, 20), 1.6, .55, 3);
    const live = o.steam === false ? null : (c, lt) => { c.save(); c.scale(sc, sc); steam(c, -10, rim - 70, 260, lt, 7, .3); steam(c, 30, rim - 60, 220, lt + 2.1, 8, .25); c.restore(); };
    return { S: scaleS(S, sc), parts: scP({ rice: [0, rim - 50], bowl: [0, -60] }, sc), live };
  };

  // ------------------------------------------------------------ bulldozer
  WC.G.bulldozer = (sc, o = {}) => {
    const S = [], yel = mixc(C.gold, C.clothC, .5), yelD = mixc(yel, C.wood, .4), steel = mixc(C.inkSoft, C.ink, .3);
    shadow(S, 0, 210, 9);
    // the track: a long rounded loop
    const tr = [...ell(-110, -34, 34, 34, PI / 2, PI * 1.5, 14), ...ell(150, -34, 34, 34, -PI / 2, PI / 2, 14)];
    wsh(S, tr, steel, .92, 3, .5);
    for (let x = -128; x < 175; x += 15) brush(S, [[x, -2], [x + 6, -2]], 5, C.ink, { a: .55 });
    for (const x of [-100, -40, 20, 80, 140]) { wsh(S, ell(x, -34, 22, 22, 0, TAU, 18), mixc(C.inkSoft, C.paperLight, .25), .85, 2, .3); wsh(S, ell(x, -34, 8, 8, 0, TAU, 10), C.ink, .7, 1, .2); }
    ink(S, tr.concat([tr[0]]), 2.4, .8, 2);
    // the body: engine hood, the cab
    const hood = [[-120, -70], [-116, -138], [70, -142], [80, -70]];
    wsh(S, hood, yel, .92, 3, .8);
    wsh(S, [[-120, -70], [-116, -86], [80, -86], [80, -70]], yelD, .45, 2, .5);
    dry(S, -110, -138, 20, -95, 4, 7); pool(S, [[78, -140], [80, -72]], yelD, 8);
    for (let k = 0; k < 4; k++) brush(S, [[-108, -96 - k * 10], [-70, -97 - k * 10]], 3, yelD, { a: .7 });
    const cab = [[40, -70], [44, -246], [168, -246], [176, -70]];
    wsh(S, cab, yel, .92, 3, .8);
    wsh(S, box(58, -230, 156, -150), mixc(C.sky, C.paperLight, .2), .85, 2, .5);
    brush(S, [[105, -230], [105, -150]], 5, yel, { a: .95 });
    wsh(S, box(36, -262, 182, -246), yelD, .9, 2, .4);
    wsh(S, [[120, -70], [124, -246], [168, -246], [176, -70]], yelD, .25, 2, .5);
    ink(S, hood.concat([hood[0]]), 2.2, .8, 1); ink(S, cab.concat([cab[0]]), 2.2, .8, 1); ink(S, box(58, -230, 156, -150).concat([[58, -230]]), 1.6, .6, 1);
    // exhaust stack
    brush(S, [[-30, -140], [-30, -210]], 10, steel, { a: .95 }); brush(S, [[-34, -212], [-26, -214]], 12, C.ink, { a: .9 });
    // push arms and the blade
    brush(S, [[-110, -46], [-188, -56]], 14, yelD, { a: .95 }); brush(S, [[-100, -110], [-180, -100]], 9, steel, { a: .9 });
    const blade = [[-215, -4], ...qcurve(-215, -4, -210, -140, 22, 10).slice(1), [-188, -144], ...qcurve(-188, -144, -194, -2, -18, 10).slice(1)];
    wsh(S, blade, yel, .92, 3, .6);
    wsh(S, [[-215, -4], [-213, -30], [-192, -30], [-194, -2]], steel, .8, 2, .4);
    ink(S, blade.concat([blade[0]]), 2.4, .85, 1);
    const live = (c, lt, it) => { c.save(); c.scale(sc, sc); steam(c, -30, -214, 300, lt * 1.3, 11, .5); c.restore(); };
    return { S: scaleS(S, sc), parts: scP({ blade: [-205, -70], cab: [106, -190] }, sc), live };
  };

  // ------------------------------------------------------------ ming_tomb
  WC.G.ming_tomb = (sc, o = {}) => {
    const S = [], br = BRICK(), dk = BRICKD();
    // the burial mound behind, with trees
    const mound = [[-200, -120], ...qcurve(-200, -120, 330, -60, -260, 24).slice(1), [330, 0], [-200, 0]];
    wsh(S, mound, mixc(C.mid, C.leaf, .3), .75, 3, 2);
    for (let i = 0; i < 11; i++) { const x = rnd(-150, 300), y = -150 - 140 * Math.sin(PI * clamp((x + 200) / 530)) + rnd(20, 60); WC.clump(S, x, y, rnd(18, 28), 12, WC.shades(C.leafDark, .2), { l0: 8, l1: 15, w0: 6, w1: 10 }); }
    shadow(S, 0, 210, 9);
    // the platform
    const base = [[-200, 0], [-188, -170], [188, -170], [200, 0]];
    wsh(S, base, br, .92, 3, 1);
    wsh(S, [[90, 0], [86, -170], [188, -170], [200, 0]], dk, .3, 2, 1);
    brickDabs(S, -190, 190, -165, -32, 12, [br, dk, mixc(br, C.paperLight, .45)], .28, 4); pool(S, [[192, -166], [199, -4]], dk, 12); dry(S, -180, -165, -40, -40, 5, 9);
    for (let y = -14; y > -165; y -= 14) brush(S, along([[-195, y], [195, y + rnd(-1, 1)]], 12), 1.4, dk, { a: .22, rough: .5 });
    wsh(S, box(-202, -30, 202, 0), mixc(C.stone, C.paperLight, .25), .8, 2, 1);
    wsh(S, archPts(0, 0, 84, 118, 12), mixc(C.ink, C.stoneDark, .3), .92, 2, .4);
    ink(S, archPts(0, 0, 96, 126, 12), 2, .7, 2);
    for (let i = 0; i < 12; i++) { const x0 = -188 + i * 32; wsh(S, box(x0, -186, x0 + 18, -170), br, .9, 1, .3); ink(S, [[x0, -170], [x0, -186], [x0 + 18, -186], [x0 + 18, -170]], 1.4, .65, 1); }
    ink(S, base, 2.4, .8, 1);
    // the pavilion: red walls, a tablet, the yellow double-eaved roof
    const red = mixc(C.cloth, C.roof, .3), gold = mixc(C.gold, C.clothC, .45), goldD = mixc(gold, C.wood, .35);
    wsh(S, box(-110, -256, 110, -186), red, .9, 3, .8);
    wsh(S, box(40, -256, 110, -186), mixc(red, C.ink, .3), .3, 2, .5);
    wsh(S, archPts(0, -186, 38, 50, 8), mixc(C.ink, C.cloth, .3), .85, 2, .3);
    const eave1 = [[-160, -252], ...qcurve(-160, -252, -110, -292, -10, 6).slice(1), [110, -292], ...qcurve(110, -292, 160, -252, -10, 6).slice(1)];
    wsh(S, eave1.concat([[150, -250], [-150, -250]]), gold, .92, 3, .6);
    brush(S, along(eave1, 30), 4, goldD, { a: .7 });
    wsh(S, box(-80, -312, 80, -290), red, .9, 2, .4);
    const roof2 = [[-128, -308], ...qcurve(-128, -308, -70, -356, -12, 6).slice(1), [70, -356], ...qcurve(70, -356, 128, -308, -12, 6).slice(1)];
    wsh(S, roof2.concat([[120, -306], [-120, -306]]), gold, .92, 3, .6);
    for (let x = -100; x <= 100; x += 14) brush(S, [[x * .6, -352], [x, -310]], 1.6, goldD, { a: .45 });
    for (let x = -140; x <= 140; x += 14) brush(S, [[x * .75, -290], [x, -254]], 1.6, goldD, { a: .45 });
    brush(S, [[-72, -357], [72, -357]], 6, goldD, { a: .9 });
    ink(S, eave1, 2.2, .8, 2); ink(S, roof2, 2.2, .8, 2); ink(S, box(-110, -256, 110, -186).concat([[-110, -256]]), 1.8, .65, 1);
    return { S: scaleS(S, sc), parts: scP({ tower: [0, -280], tunnel: [0, -60], mound: [200, -200] }, sc) };
  };

  // ------------------------------------------------------------ microscope
  WC.G.microscope = (sc, o = {}) => {
    const S = [], blk = mixc(C.ink, C.inkSoft, .35), blkL = mixc(C.inkSoft, C.paperLight, .2), brass = mixc(C.clothC, C.gold, .35), brassD = mixc(brass, C.wood, .45);
    shadow(S, 10, 130, 9);
    // horseshoe foot
    const foot = [[-120, 0], [-110, -26], [-40, -36], [40, -36], [120, -26], [128, 0]];
    wsh(S, foot, blk, .92, 3, .5); brush(S, along([[-104, -24], [110, -24]], 10), 3, blkL, { a: .5 });
    ink(S, foot, 2, .7, 1);
    // pillar and the curved arm
    brush(S, [[40, -34], [40, -150]], 34, blk, { a: .95 });
    const arm = qcurve(40, -150, -10, -330, -70, 16);
    brush(S, arm, 30, blk, { a: .95, prof: 'even' }); S.push(WC.edgeOf(mk(arm, 30, blk), -1, 3, blkL, .5));
    // the mirror under the stage
    wsh(S, ell(-20, -96, 30, 16, 0, TAU, 20), brass, .9, 2, .3); wsh(S, ell(-20, -96, 22, 11, 0, TAU, 18), mixc(C.sky, C.paperLight, .3), .9, 2, .2);
    brush(S, [[-20, -96], [40, -110]], 5, brassD, { a: .9 });
    // the stage and the glass slide
    wsh(S, box(-110, -178, 90, -160), blk, .95, 2, .3); ink(S, box(-110, -178, 90, -160).concat([[-110, -178]]), 1.6, .7, 1);
    wsh(S, box(-80, -186, 40, -178), mixc(C.sky, C.paperLight, .35), .9, 2, .2);
    wsh(S, ell(-20, -182, 12, 3, 0, TAU, 12), mixc(C.paperLight, C.stone, .5), .95, 1, .1);
    brush(S, [[-104, -186], [-60, -186]], 4, brassD, { a: .9 }); brush(S, [[20, -186], [70, -186]], 4, brassD, { a: .9 });
    // the tube, objective, eyepiece
    const tube = [[-44, -214], [-56, -372], [-6, -376], [6, -214]];
    wsh(S, tube, brass, .95, 3, .4);
    wsh(S, [[-14, -214], [-22, -374], [-6, -376], [6, -214]], brassD, .4, 2, .3);
    wsh(S, [[-34, -190], [-36, -214], [-2, -214], [-6, -190]], brassD, .95, 2, .2);
    for (const y of [-250, -330]) brush(S, [[-49 + (y + 214) * .07, y], [3 + (y + 214) * .03, y]], 5, brassD, { a: .9 });
    wsh(S, [[-50, -376], [-52, -412], [-14, -414], [-10, -376]], blk, .95, 2, .2);
    wsh(S, ell(-32, -414, 20, 6, 0, TAU, 14), blkL, .9, 1, .1);
    ink(S, tube.concat([tube[0]]), 2, .75, 1);
    // focus knob
    wsh(S, ell(46, -262, 26, 26, 0, TAU, 22), brass, .95, 2, .3); wsh(S, ell(46, -262, 10, 10, 0, TAU, 12), brassD, .8, 1, .2);
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; brush(S, [[46 + Math.cos(a) * 22, -262 + Math.sin(a) * 22], [46 + Math.cos(a) * 27, -262 + Math.sin(a) * 27]], 2, brassD, { a: .7 }); }
    ink(S, ell(46, -262, 26, 26, 0, TAU, 22), 1.8, .7, 3);
    return { S: scaleS(S, sc), parts: scP({ eyepiece: [-32, -405], tube: [-25, -300], stage: [-10, -170], slide: [-20, -182], knob: [46, -262] }, sc) };
  };


  // ------------------------------------------------------------ rice_sack, lime_basket (foreground props)
  // rice_sack — a hemp sack tied at the neck, a few grains spilled in front. ≈ 200 × 230 px.  parts: neck grains
  WC.G.rice_sack = (sc, o = {}) => {
    const S = [], hemp = mixc(C.ground, C.wood, .2), hd = mixc(hemp, C.ink, .3);
    shadow(S, 0, 110, 9);
    const body = [[-95, 0], ...qcurve(-95, 0, -70, -170, 30, 10).slice(1), [-30, -190], [30, -192], ...qcurve(70, -172, 98, 0, 30, 10)];
    S.push(washShape(body, C.paperLight, 1, 1, 0));
    wsh(S, body, hemp, .6, 3, 3);
    wsh(S, [[20, 0], [40, -180], [70, -172], [98, 0]], hd, .3, 2, 3);
    for (let k = 0; k < 9; k++) { const x = rnd(-70, 70); S.push(mk(qcurve(x, -15, x + rnd(-8, 8), -165, rnd(-6, 6), 8), 2, hd, { prof: 'even', nb: 0, a: .2 })); }
    pool(S, [[70, -168], [96, -4]], hd, 12);
    for (let k = 0; k < 4; k++) S.push(mk(qcurve(-60 + k * 30, -150, -40 + k * 30, -40, rnd(-10, 10), 8), 5, C.paperLight, { prof: 'leaf', nb: 4, a: .35 }));
    // the neck, tied, the mouth folded open
    wsh(S, [[-30, -190], [-40, -235], [40, -238], [30, -192]], hemp, .6, 2, 2);
    S.push(mk(along([[-34, -196], [34, -198]], 8), 7, mixc(C.wood, C.ink, .2), { prof: 'even', nb: 0, a: .85 }));
    wsh(S, ell(0, -238, 46, 12, 0, TAU, 20), mixc(C.paperLight, C.stone, .25), .85, 2, 1);
    looseInk(S, body, 2, .6, .7);
    for (let i = 0; i < 26; i++) { const x = rnd(-140, 150), y = rnd(-6, 14), d = rnd(0, PI); S.push(mk([[x - Math.cos(d) * 4, y - Math.sin(d) * 2], [x + Math.cos(d) * 4, y + Math.sin(d) * 2]], 3.6, i % 3 ? C.paperLight : C.stone, { prof: 'even', nb: 0, a: .9 })); }
    return { S: scaleS(S, sc), parts: scP({ neck: [0, -210], grains: [100, 0] }, sc) };
  };
  // lime_basket — a woven basket heaped with white lumps of lime. ≈ 220 × 150 px.  parts: lime
  WC.G.lime_basket = (sc, o = {}) => {
    const S = [], wick = mixc(C.clothC, C.wood, .35), wd = mixc(wick, C.ink, .3);
    shadow(S, 0, 120, 8);
    const body = [[-110, -110], [110, -110], [86, 0], [-86, 0]];
    const heap = [...ell(0, -110, 104, 16, PI, 0, 16), ...qcurve(104, -110, 0, -160, 40, 10).slice(1), ...qcurve(0, -160, -104, -110, 40, 10).slice(1)];
    S.push(washShape(body.concat(heap), C.paperLight, 1, 1, 0));
    wsh(S, heap, mixc(C.paperLight, C.stone, .35), .7, 3, 2);
    for (let i = 0; i < 9; i++) wsh(S, WC.blobPts(rnd(-80, 80), -118 - rnd(0, 30), rnd(12, 22), rnd(8, 14), 12, .3), i % 2 ? C.paperLight : mixc(C.stone, C.stoneDark, .2), .5, 2, 1);
    wsh(S, body, wick, .6, 3, 2);
    wsh(S, [[30, -110], [110, -110], [86, 0], [24, 0]], wd, .3, 2, 2);
    for (let r = 0; r < 6; r++) { const y = -100 + r * 17; for (let k = 0; k < 9; k++) { const x0 = -100 + k * 24 + (r % 2) * 12 + r * 2; S.push(mk(qcurve(x0, y, x0 + 18, y, -4, 4), 6, r % 2 ? wd : mixc(wick, C.paperLight, .3), { prof: 'leaf', nb: 0, a: .55 })); } }
    S.push(mk(along([[-110, -110], [110, -110]], 14), 8, wd, { prof: 'even', nb: 4, a: .6 }));
    looseInk(S, [[-110, -110], [-86, 0], [86, 0], [110, -110]], 2, .6, .7);
    return { S: scaleS(S, sc), parts: scP({ lime: [0, -135] }, sc) };
  };

  // ------------------------------------------------------------ shared for the shots
  const paperBack = (W, H) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); const pp = WC.paper(); if (pp) c.drawImage(pp, 0, 0); else { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); } return [cv, c]; };
  function notes(X, lt, cues, P, W, H, portrait) {
    for (const n of P.notes || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || (portrait ? 54 : 44), col = n.color === 'red' ? C.red : C.ink;
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col, bend: n.bend });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
    }
  }
  const drawL = (X, S, spr, p) => { if (p <= 0) return; if (p >= 1) X.drawImage(spr.cv, spr.x0, spr.y0); else WC.drawList(X, S, p); };

  // ------------------------------------------------------------ wc_ricemortar_mix
  SHOTS.wc_ricemortar_mix = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const [back, c] = paperBack(W, H);
      // the trough in perspective: back rim (y bk), front rim (y fr), the front face down to (y fb)
      const bk = H * (portrait ? .3 : .34), fr = H * (portrait ? .52 : .7), fb = H * (portrait ? .7 : .92);
      const bx0 = W * .14, bx1 = W * .86, fx0 = W * .02, fx1 = W * .98;
      const wood = mixc(C.wood, C.paper, .35), woodD = mixc(C.wood, C.ink, .15);
      const lime = mixc(C.paperLight, C.stone, .45);
      const S = WC.withSeed(seed * 19 + 3, () => {
        const T = [];
        wsh(T, [[-20, bk - H * .12], [W + 20, bk - H * .14], [W + 20, H + 20], [-20, H + 20]], mixc(C.ground, C.paper, .35), .55, 3, 4);
        // inner back wall of the trough, the lime surface, the front face
        wsh(T, [[bx0, bk], [bx1, bk], [bx1 - 10, bk + 40], [bx0 + 10, bk + 40]], woodD, .7, 2, 1);
        wsh(T, [[bx0 + 10, bk + 34], [bx1 - 10, bk + 34], [fx1 - 22, fr - 12], [fx0 + 22, fr - 12]], lime, .95, 3, 2);
        for (let i = 0; i < 40; i++) { const y = rnd(bk + 50, fr - 30), f = (y - bk) / (fr - bk), x0 = mixN(bx0, fx0, f) + 40, x1 = mixN(bx1, fx1, f) - 40, x = rnd(x0, x1); T.push(mk(qcurve(x, y, x + rnd(40, 110), y + rnd(-6, 6), rnd(-8, 8), 6), rnd(4, 10), i % 2 ? C.paperLight : mixc(C.stone, C.stoneDark, .3), { prof: 'leaf', nb: 2, a: .35 })); }
        // side walls (planks) and rims
        wsh(T, [[fx0, fr], [bx0, bk], [bx0 + 14, bk + 34], [fx0 + 22, fr - 12]], wood, .9, 2, 1);
        wsh(T, [[fx1, fr], [bx1, bk], [bx1 - 14, bk + 34], [fx1 - 22, fr - 12]], mixc(wood, C.ink, .12), .9, 2, 1);
        wsh(T, [[fx0, fr - 14], [fx1, fr - 14], [fx1, fb], [fx0, fb]], wood, .92, 3, 2);
        wsh(T, [[W * .6, fr - 14], [fx1, fr - 14], [fx1, fb], [W * .6, fb]], woodD, .25, 2, 2);
        for (let k = 1; k < 4; k++) { const y = fr - 14 + (fb - fr + 14) * k / 4; T.push(mk(along([[fx0 + 8, y], [fx1 - 8, y + rnd(-3, 3)]], 20), 3, woodD, { prof: 'even', nb: 0, a: .5 })); }
        for (let i = 0; i < 14; i++) { const y = rnd(fr, fb - 10), x = rnd(fx0, fx1 - 300); T.push(mk(qcurve(x, y, x + rnd(140, 300), y + rnd(-3, 3), rnd(-5, 5), 8), rnd(2, 3), C.wood, { prof: 'leaf', nb: 0, a: .3 })); }
        ink(T, [[fx0, fb], [fx0, fr - 14], [bx0, bk], [bx1, bk], [fx1, fr - 14], [fx1, fb]], 2.6, .8, 1);
        ink(T, [[fx0, fr - 14], [fx1, fr - 14]], 2.4, .8, 3);
        // the ground below runs to the bottom of the frame
        wsh(T, [[-20, fb], [W + 20, fb], [W + 20, H + 20], [-20, H + 20]], mixc(C.ground, C.stoneDark, .25), .5, 3, 3);
        return T;
      });
      const spr = WC.sprite(S);
      // the ladle (bowl + handle), built once; its lip is the origin
      const LS = WC.withSeed(seed * 19 + 7, () => {
        const T = [], wd = mixc(C.wood, C.paperLight, .3);
        T.push(mk(qcurve(60, -40, 520, -330, -20, 14), 22, wd, { prof: 'even', nb: 3, a: .95 }));
        T.push(WC.edgeOf(mk(qcurve(60, -40, 520, -330, -20, 14), 22, wd), 1, 2.2, C.ink, .7));
        wsh(T, ell(60, -20, 85, 52, 0, TAU, 30), wd, .95, 3, 1);
        wsh(T, ell(48, -30, 64, 34, 0, TAU, 24), mixc(C.paperLight, C.stone, .2), .9, 2, .5);
        ink(T, ell(60, -20, 85, 52, 0, TAU, 30), 2.4, .8, 3);
        return T;
      });
      const lspr = WC.sprite(LS);
      const cx = W * .47, cy = mixN(bk, fr, .55);
      const sack = WC.make('rice_sack', portrait ? 1.5 : 1.1, {}, seed + 5), basket = WC.make('lime_basket', portrait ? 1.45 : 1.05, {}, seed + 6);
      const PD = WC.withSeed(seed * 19 + 9, () => { const T = [], wd = mixc(C.wood, C.paperLight, .25); T.push(mk(qcurve(0, 0, 0, -560, 8, 14), 18, wd, { prof: 'even', nb: 3, a: .95 })); T.push(WC.edgeOf(mk(qcurve(0, 0, 0, -560, 8, 14), 18, wd), 1, 2, C.ink, .65)); wsh(T, [[-26, 30], [26, 30], [20, -40], [-20, -40]], wd, .9, 2, 1); looseInk(T, [[-26, 30], [-20, -40]], 2, .6, .9); return T; });
      const pspr = WC.sprite(PD);
      const lipX = W * .62, lipY = H * (portrait ? .16 : .12);
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          drawL(X, S, spr, seg(lt, 0, .7));
          const tp = WC.timeOf(P.pour, cues, 1.0);
          // the swirl: cream rings opening and turning where the stream lands
          const q = seg(lt, tp + .15, tp + 2.6);
          if (q > 0) {
            const rmax = W * .34 * eio(q) + 20;
            for (let r = 0; r < 4; r++) {
              const rr = rmax * (1 - r * .2), a0 = lt * .9 + r * 1.4;
              X.save(); X.translate(cx, cy); X.scale(1, .42);
              X.strokeStyle = WC.rgba(mixc(C.paperLight, C.clothC, .6), .8 - r * .12); X.lineWidth = 20 - r * 3; X.lineCap = 'round';
              X.beginPath(); X.arc(0, 0, rr, a0, a0 + PI * (1.1 + q * .5)); X.stroke();
              X.restore();
            }
            X.save(); X.translate(cx, cy); X.scale(1, .42);
            const g = X.createRadialGradient(0, 0, 0, 0, 0, rmax * .7);
            g.addColorStop(0, WC.rgba(mixc(C.paperLight, C.clothC, .55), .7)); g.addColorStop(1, WC.rgba(C.paperLight, 0));
            X.fillStyle = g; X.beginPath(); X.arc(0, 0, rmax * .7, 0, TAU); X.fill(); X.restore();
          }
          // foreground: a sack of rice and a basket of lime on the ground in front of the trough
          X.drawImage(sack.spr.cv, W * .2 + sack.spr.x0, H * (portrait ? .84 : .98) + sack.spr.y0);
          X.drawImage(basket.spr.cv, W * .78 + basket.spr.x0, H * (portrait ? .82 : .97) + basket.spr.y0);
          // after the pour, a paddle stirs the lime slowly round
          const st = seg(lt, tp + .7, tp + 1.2);
          if (st > 0) {
            const a = lt * 1.4, px = cx + Math.cos(a) * W * .12, py = cy + Math.sin(a) * W * .05;
            X.save(); X.globalAlpha = ss(st); X.translate(px, py); X.rotate(.32 + Math.cos(a) * .08); X.drawImage(pspr.cv, pspr.x0, pspr.y0); X.restore();
          }
          // the ladle tips in, pours, stays tipped
          const li = seg(lt, .2, 1.0), lo = ss(seg(lt, tp + .9, tp + 1.6)), tilt = ss(seg(lt, tp - .5, tp + .1));
          if (li > 0) {
            X.save(); X.globalAlpha = 1 - lo; X.translate(lipX + (1 - eio(li) + lo) * 260, lipY - (1 - eio(li) + lo) * 200); X.rotate(-.1 + tilt * .38 + Math.sin(lt * 1.2) * .01);
            if (li >= 1) X.drawImage(lspr.cv, lspr.x0, lspr.y0); else WC.drawList(X, LS, li);
            X.restore();
          }
          // the stream: a pale ribbon from the lip to the swirl, its texture flowing down
          const sp = seg(lt, tp, tp + .35) * (1 - ss(seg(lt, tp + .7, tp + .95)));
          if (sp > 0) {
            const x0 = lipX - 20, y0 = lipY + 10, y1 = mixN(y0, cy, sp);
            const pts = qcurve(x0, y0, mixN(x0, cx, sp), y1, -30 * sp, 14);
            X.strokeStyle = WC.rgba(mixc(C.paperLight, C.clothC, .55), .95); X.lineWidth = 24; X.lineCap = 'round';
            X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x, y) : X.moveTo(x, y)); X.stroke();
            X.setLineDash([22, 30]); X.lineDashOffset = -lt * 260; X.strokeStyle = WC.rgba(C.paperLight, .9); X.lineWidth = 6;
            X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x + 3, y) : X.moveTo(x + 3, y)); X.stroke(); X.setLineDash([]);
            X.strokeStyle = WC.rgba(C.ink, .45); X.lineWidth = 1.6;
            X.beginPath(); pts.forEach(([x, y], i) => i ? X.lineTo(x - 9, y) : X.moveTo(x - 9, y)); X.stroke();
          }
          notes(X, lt, cues, P, W, H, portrait);
        },
      };
    },
  };

  // ------------------------------------------------------------ wc_ricemortar_brick
  SHOTS.wc_ricemortar_brick = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx), wet = !!P.rain;
      const [back, c] = paperBack(W, H);
      const top = H * .3, bh = portrait ? 112 : 116, jt = portrait ? 22 : 20, rows = Math.ceil((H * .86 - top) / (bh + jt));
      // uneven bricks: each row its own widths and tones; the top row keeps one gap (the brick still to come)
      const rowH = [], rowY = [];
      WC.withSeed(seed * 29 + 2, () => { let y = top; for (let r = 0; r < rows; r++) { rowY.push(y); rowH.push(bh * (r === 0 ? 1 : rnd(.72, 1.3))); y += rowH[r] + jt * rnd(.7, 1.3); } });
      const layout = WC.withSeed(seed * 29 + 1, () => {
        const out = [];
        for (let r = 0; r < rows; r++) {
          let x = -rnd(40, 200);
          const rh = rowH[r];
          while (x < W + 40) { const bw = rnd(190, 360); out.push({ r, x, y: rowY[r] + rnd(-4, 4), bw, bh: rh * rnd(.88, 1.06), loose: r > 0 && rnd() < .16 }); x += bw + jt * rnd(.6, 1.5); }
        }
        return out;
      });
      const gi = layout.findIndex(b => b.r === 0 && b.x > W * .25);
      const gap = layout[gi];
      const brickS = (b, i) => {
        const T = [], { x, y, bw } = b, h = b.bh;
        const col = mixc(BRICK(), [C.stone, C.stoneDark, C.far, C.stain][i % 4], WC.hash(i * 1.7) * .35);
        if (b.loose) {   // a brick only hinted at: a loose wash dissolving into the mortar
          wsh(T, WC.blobPts(x + bw / 2, y + h / 2, bw * .5, h * .5, 16, .25), col, .3, 3, h * .1);
          T.push(mk(along([[x + 10, y + h - 6], [x + bw * rnd(.4, .9), y + h - 4]], 10), h * .1, mixc(col, C.ink, .3), { prof: 'leaf', nb: 4, a: .25 }));
          return T;
        }
        const q = [[x + rnd(-3, 3), y + rnd(-2, 2)], [x + bw * .5, y + rnd(-3, 1)], [x + bw + rnd(-3, 3), y + rnd(-2, 2)], [x + bw + rnd(-2, 2), y + h], [x + bw * .5, y + h + rnd(-1, 3)], [x + rnd(-2, 2), y + h]];
        S0(T, q, col, h);
        // wet pooling at the lower/right edges, a dark corner, dry-brush highlight along the top
        T.push(mk(along([[x + 6, y + h - 4], [x + bw - 4, y + h - 3]], 14), h * .12, mixc(col, C.ink, .35), { prof: 'leaf', nb: 4, a: .35, rough: .5 }));
        T.push(mk(along([[x + bw - 5, y + 6], [x + bw - 4, y + h - 6]], 8), h * .08, mixc(col, C.ink, .3), { prof: 'leaf', nb: 0, a: .3 }));
        T.push(mk(along([[x + 10, y + 7], [x + bw * rnd(.4, .8), y + 6]], 12), h * .1, C.paperLight, { prof: 'leaf', nb: 5, a: .5, rough: .5 }));
        for (let k = 0; k < 3; k++) wsh(T, WC.blobPts(x + rnd(25, bw - 25), y + rnd(18, h - 18), rnd(12, 34), rnd(6, 14), 14, .35), mixc(col, k % 2 ? C.paperLight : C.ink, .25), .22, 2, 1);
        if (wet) wsh(T, [[x, y + h * .35], [x + bw, y + h * .3], [x + bw, y + h], [x, y + h]], mixc(C.waterDeep, col, .5), .18, 2, 2);
        looseInk(T, [[x + bw, y], [x + bw, y + h], [x, y + h]], 2, .5, .55);
        return T;
      };
      function S0(T, q, col, h) { wsh(T, q, col, .55, 3, h * .03); wsh(T, q.map(([px, py]) => [px * .98 + q[0][0] * .02, py]), mixc(col, C.paperLight, .2), .25, 2, h * .05); }
      WC.withSeed(seed * 29 + 3, () => {
        // sky above the wall (summer, or a storm), a far ridge
        if (wet) { WC.wash(c, [[-20, -20], [W + 20, -20], [W + 20, top + 20], [-20, top + 20]], mixc(C.smoke, C.night, .25), .55, 3, 3); WC.blob(c, W * .3, top * .3, W * .5, top * .2, C.smoke, .35); }
        else { WC.wash(c, [[-20, -20], [W + 20, -20], [W + 20, top], [-20, top]], C.sky, .45, 3, 3); WC.blob(c, W * .7, top * .35, W * .35, top * .18, C.skyWarm, .3); }
        WC.wash(c, [[-20, top], ...Array.from({ length: 13 }, (_, i) => [i / 12 * (W + 40) - 20, top - 60 - 90 * WC.fbm(i * .6 + 3)]), [W + 20, top]], mixc(wet ? C.far : C.far, wet ? C.smoke : C.paper, .25), .6, 3, 2);
        // the wall on its own canvas, then faded into the paper at the sides and the bottom
        const wc = document.createElement('canvas'); wc.width = W; wc.height = H; const w2 = wc.getContext('2d');
        WC.wash(w2, [[-20, top - 8], [W + 20, top - 8], [W + 20, H + 20], [-20, H + 20]], MORTAR(), .75, 3, 4);
        WC.blooms(w2, -20, top, W + 20, H, mixc(MORTAR(), C.stoneDark, .3), 10, .14);
        WC.granulate(w2, -20, top, W + 20, H, C.stoneDark, .7, .1);
        layout.forEach((b, i) => { if (i !== gi) for (const s of brickS(b, i)) WC.drawItem(w2, s, 1, null, 1); });
        for (let k = 0; k < 14; k++) WC.blob(w2, rnd(0, W), rnd(top + 60, H), rnd(60, 160), rnd(40, 110), k % 3 ? mixc(MORTAR(), C.stoneDark, .45) : C.paperLight, k % 3 ? .16 : .35);
        if (wet) for (let k = 0; k < 7; k++) { const x = W * (.18 + k * .085) + rnd(-25, 25), y0 = top + rnd(60, 320), L = rnd(300, 620), pts = []; for (let i = 0; i <= 10; i++) pts.push([x + Math.sin(i * .9 + k) * 8 + rnd(-3, 3), y0 + L * i / 10]); WC.drawS(w2, mk(pts, rnd(16, 30), mixc(C.waterDeep, C.ink, .3), { prof: 'tip', nb: 5, a: .2, rough: .5 }), 1, null, 1); }
        // rice specks in the seams
        for (let n = 0; n < 70; n++) { const r = Math.floor(rnd(1, rows)), y = rowY[r] - jt / 2, x = rnd(0, W); WC.drawS(w2, mk([[x - 3, y], [x + 3, y + 1]], 3, C.paperLight, { prof: 'even', nb: 0, a: .85 }), 1, null, 1); }
        if (!wet && gap) WC.wash(w2, box(gap.x - 8, gap.y + gap.bh - 14, gap.x + gap.bw + 8, gap.y + gap.bh + jt), mixc(C.paperLight, C.clothC, .18), .8, 2, 1);
        // mask: concentric ragged blobs (soft, uneven edge into the paper)
        const m = document.createElement('canvas'); m.width = W; m.height = H; const mc = m.getContext('2d');
        for (let k = 0; k < 9; k++) { mc.globalAlpha = .32; mc.fillStyle = '#000'; mc.beginPath(); WC.blobPts(W * .5, top + (H - top) * .42, W * (.66 - k * .025), (H - top) * (.72 - k * .03), 40, .14).forEach(([x, y], i) => i ? mc.lineTo(x, y) : mc.moveTo(x, y)); mc.closePath(); mc.fill(); }
        mc.globalAlpha = 1; mc.fillRect(W * .1, top - 30, W * .8, 60);
        w2.globalCompositeOperation = 'destination-in'; w2.drawImage(m, 0, 0); w2.globalCompositeOperation = 'source-over';
        c.drawImage(wc, 0, 0);
      });
      const NB = gap && !wet ? WC.withSeed(seed * 29 + 17, () => brickS(Object.assign({}, gap, { x: 0, y: 0 }), gi)) : null, nspr = NB && WC.sprite(NB);
      const grass = WC.make('grass', portrait ? 1.1 : .9, {}, seed + 3);
      // rain: drops that gather on the brick tops and run down the faces and seams
      const drops = layout.filter((b, i) => b.r < rows - 1 && b.x > W * .12 && b.x < W * .62).slice(0, 22).map((b, k) => ({ x: b.x + b.bw * (.2 + WC.hash(k * 3.1) * .6), y: b.y + 4, len: b.bh + jt + 160 + WC.hash(k) * 220, ph: WC.hash(k * 7.7) }));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          if (NB) {
            const ts = WC.timeOf(P.set, cues, 1.2), q = eio(seg(lt, ts - 1, ts)), pin = seg(lt, 0, .7);
            const yy = mixN(gap.y - H * .2, gap.y, q);
            if (q >= 1) {
              const b = ss(seg(lt, ts, ts + .5));
              X.fillStyle = WC.rgba(mixc(C.paperLight, C.clothC, .2), .9);
              X.beginPath(); X.ellipse(gap.x + gap.bw * .5, gap.y + gap.bh + jt * .3, gap.bw * .55 * b, jt * .5 * b, 0, 0, TAU); X.fill();
            }
            X.save(); X.translate(gap.x, yy - gap.y);
            if (pin < 1) WC.drawList(X, NB, pin); else X.drawImage(nspr.cv, nspr.x0, nspr.y0);
            X.restore();
          }
          if (wet) {
            for (const d of drops) {
              const ph = (lt * .35 + d.ph) % 1, grow = ss(seg(ph, 0, .35)), run = eio(seg(ph, .35, 1));
              const y = d.y + run * d.len, x = d.x + Math.sin(run * 3 + d.ph * 6) * 4, r = 8 + 6 * grow;
              if (run > 0) { X.strokeStyle = WC.rgba(mixc(C.waterDeep, C.ink, .25), .2 * (1 - run * .6)); X.lineWidth = r * .7; X.lineCap = 'round'; X.beginPath(); X.moveTo(d.x, d.y); X.lineTo(x, y - r); X.stroke(); }
              X.fillStyle = WC.rgba(C.waterDeep, .5 * (1 - ss(seg(ph, .9, 1)))); X.beginPath(); X.ellipse(x, y, r * .8, r, 0, 0, TAU); X.fill();
              X.fillStyle = WC.rgba(C.paperLight, .8 * (1 - ss(seg(ph, .9, 1)))); X.beginPath(); X.arc(x - r * .25, y - r * .3, r * .28, 0, TAU); X.fill();
            }
            // driving rain, slanted
            X.strokeStyle = WC.rgba(C.waterDeep, .32); X.lineWidth = 2.2; X.lineCap = 'round'; X.beginPath();
            for (let i = 0; i < 150; i++) { const x = ((WC.hash(i) * (W + 600) + lt * 380) % (W + 600)) - 300, y = ((WC.hash(i + .37) * (H + 200) + lt * (1100 + WC.hash(i + 2) * 300)) % (H + 200)) - 100; X.moveTo(x, y); X.lineTo(x + 14, y + 44); }
            X.stroke();
          }
          X.save(); X.translate(W * .14, top - 4); X.transform(1, 0, .05 * Math.sin(lt * 1.3), 1, 0, 0); X.drawImage(grass.spr.cv, grass.spr.x0, grass.spr.y0); X.restore();
          notes(X, lt, cues, P, W, H, portrait);
        },
      };
    },
  };
  // ------------------------------------------------------------ wc_ricemortar_crystals
  // a calcite rhomb (crystal) at (x, y), size s, rotation r
  function rhomb(T, x, y, s, r, col, a = .85, iw = 1.4) {
    const pts = [[-1, -.55], [.55, -.62], [1, .55], [-.55, .62]].map(([u, v]) => [x + (u * Math.cos(r) - v * Math.sin(r)) * s, y + (u * Math.sin(r) + v * Math.cos(r)) * s]);
    wsh(T, pts, col, a, 2, Math.max(.3, s * .04));
    wsh(T, [pts[0], pts[1], [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2], [(pts[0][0] + pts[3][0]) / 2, (pts[0][1] + pts[3][1]) / 2]], C.paperLight, .3, 1, .2);
    ink(T, pts.concat([pts[0]]), iw, .6, 1);
  }
  SHOTS.wc_ricemortar_crystals = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const [back, c] = paperBack(W, H);
      const R = portrait ? 240 : 300;
      const A = portrait ? [W * .6, H * .2] : [W * .3, H * .44], B = portrait ? [W * .6, H * .465] : [W * .7, H * .44];
      const crystal = mixc(C.stone, C.paperLight, .35), pore = mixc(C.ink, C.stoneDark, .4), starch = mixc(C.gold, C.clothC, .3);
      // the two lenses: a pale field inside a dark brass ring (baked into the backdrop)
      WC.withSeed(seed * 13 + 1, () => {
        for (const [x, y] of [A, B]) {
          WC.wash(c, ell(x, y, R, R, 0, TAU, 60), mixc(C.sky, C.paperLight, .45), .7, 3, 2);
          WC.blob(c, x + R * .4, y + R * .5, R * .7, R * .35, C.stoneDark, .1);
        }
      });
      const inside = (p, q, x, y, m = 0) => Math.hypot(x - p, y - q) < R - m;
      // top: lime alone — big crystals, uneven, dark pores between them
      const TA = WC.withSeed(seed * 13 + 5, () => {
        const T = [];
        for (let i = 0; i < 9; i++) { const a = rnd(0, TAU), r = Math.sqrt(rnd()) * R * .78; wsh(T, WC.blobPts(A[0] + Math.cos(a) * r, A[1] + Math.sin(a) * r, rnd(14, 30), rnd(10, 22), 14, .35), pore, .75, 2, 1); }
        for (let i = 0; i < 16; i++) { const a = rnd(0, TAU), r = Math.sqrt(rnd()) * R * .72, x = A[0] + Math.cos(a) * r, y = A[1] + Math.sin(a) * r; rhomb(T, x, y, rnd(40, 70), rnd(0, PI), mixc(crystal, i % 3 ? C.sky : C.stone, .2), .88, 2); }
        return T;
      });
      // bottom: threads of starch first, then tiny crystals packed tight around them
      const TS = WC.withSeed(seed * 13 + 9, () => {
        const T = [];
        for (let i = 0; i < 9; i++) {
          let x = B[0] - R * .85, y = B[1] + (i / 8 - .5) * R * 1.5 + rnd(-20, 20); const pts = [];
          for (let k = 0; k <= 12; k++) { pts.push([x, y]); x += R * 1.7 / 12; y += Math.sin(k * .9 + i) * 18 + rnd(-6, 6); }
          const ok = pts.filter(([px, py]) => inside(B[0], B[1], px, py, 18));
          if (ok.length > 3) T.push(mk(along(ok, 40), 5, starch, { prof: 'even', nb: 0, a: .85, rough: .4 }));
        }
        return T;
      });
      const TB = WC.withSeed(seed * 13 + 11, () => {
        const T = [], st = 26;
        for (let gy = -R; gy <= R; gy += st * .86) for (let gx = -R; gx <= R; gx += st) {
          const x = B[0] + gx + ((Math.round(gy / (st * .86)) & 1) ? st / 2 : 0) + rnd(-4, 4), y = B[1] + gy + rnd(-4, 4);
          if (!inside(B[0], B[1], x, y, 16)) continue;
          rhomb(T, x, y, rnd(10, 13), rnd(0, PI), mixc(crystal, C.stone, rnd(0, .4)), .9, 1);
        }
        // sort by distance from the middle: they fill in from the centre outwards
        return T;
      });
      const sprA = WC.sprite(TA), sprS = WC.sprite(TS), sprB = WC.sprite(TB);
      // the brass rings drawn over the fields
      const RING = WC.withSeed(seed * 13 + 15, () => { const T = []; for (const [x, y] of [A, B]) { T.push(mk(along(ell(x, y, R + 9, R + 9, 0, TAU, 80), 120), 22, mixc(C.ink, C.inkSoft, .3), { prof: 'even', nb: 4, a: .92, rough: .08 })); T.push(mk(along(ell(x, y, R - 4, R - 4, PI * 1.1, PI * 1.5, 20), 30), 5, C.paperLight, { prof: 'even', nb: 0, a: .4 })); } return T; });
      const sprR = WC.sprite(RING);
      const top = P.top || {}, bot = P.bottom || {};
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          const tA = WC.timeOf(top.at, cues, .1), tS = WC.timeOf(bot.at, cues, 1.0), tB = WC.timeOf(bot.fill, cues, tS + .6);
          const turn = (lt / Math.max(1, dur) - .5) * .05;
          const rot = (O, f) => { X.translate(O[0], O[1]); X.rotate(f); X.translate(-O[0], -O[1]); };
          const clip = O => { X.beginPath(); X.arc(O[0], O[1], R, 0, TAU); X.clip(); };
          X.save(); clip(A); rot(A, turn); drawL(X, TA, sprA, seg(lt, tA, tA + 1.2)); X.restore();
          X.save(); clip(B); rot(B, -turn);
          drawL(X, TS, sprS, seg(lt, tS, tS + .7));
          const pb = seg(lt, tB, tB + 1.3);
          if (pb > 0) { if (pb >= 1) X.drawImage(sprB.cv, sprB.x0, sprB.y0); else { X.save(); X.beginPath(); X.arc(B[0], B[1], R * eio(pb) * 1.05, 0, TAU); X.clip(); X.drawImage(sprB.cv, sprB.x0, sprB.y0); X.restore(); } }
          // starch threads stay visible between the crystals
          if (pb > 0) { X.globalAlpha = .55; X.drawImage(sprS.cv, sprS.x0, sprS.y0); X.globalAlpha = 1; }
          X.restore();
          X.drawImage(sprR.cv, sprR.x0, sprR.y0);
          const lsz = portrait ? 58 : 48;
          const lx = portrait ? W * .05 : null;
          if (top.label) WC.hand(X, top.label, portrait ? lx : A[0], portrait ? A[1] - R * .15 : A[1] - R - 50, seg(lt, tA + .3, tA + 1.1), { size: lsz, align: portrait ? 'left' : 'center' });
          if (bot.label) WC.hand(X, bot.label, portrait ? lx : B[0], portrait ? B[1] - R * .15 : B[1] - R - 50, seg(lt, tS + .2, tS + 1), { size: lsz, align: portrait ? 'left' : 'center', col: C.red });
          notes(X, lt, cues, P, W, H, portrait);
        },
      };
    },
  };
})();
