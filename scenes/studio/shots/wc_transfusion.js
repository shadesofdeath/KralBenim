// wc_transfusion — the first blood transfusions, 1665–1937 (Stickstory ag-03, 2026-11-25): a 17th-century sick bed
// with its patient, a calf and a lamb lying tied on the floor, the silver tube, a bleeding bowl, an anatomical heart
// (Harvey's circle), Landsteiner's rack of test tubes (smooth vs clumped), a brass microscope, a modern blood bag;
// and one shot (a wc_scene with a tube running blood from one thing to another).
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic, colours only from WC.C tokens.
//
// Objects (WC.G; origin = base centre on the ground, y up negative, sc 1 = natural size):
//   sickbed     a 17th-c. wooden bedstead ≈ 420 × 240 px: tall headboard (left), footboard, mattress, pillow, a
//               patient asleep under a blanket, one arm lying out on top of it. o: {who: 'man'|'boy'|'woman',
//               blanket: token (default cloth), empty: true (no one in it)}  parts: arm (the inner forearm), head, hand, pillow
//   calf        a calf lying on the floor, legs folded, head up, facing left ≈ 280 × 170 px. o: {col: coat token,
//               rope: true (a rope from its foreleg to a peg)}  parts: neck, head, body, rope
//   lamb        the same pose as a lamb: woolly body, dark face, ears out. o: {rope}  parts: neck, head, body
//   silver_tube the transfusion tube: a curved thin silver pipe ≈ 380 px, a quill joint at one end, a sharp tip at
//               the other with a red drop. o: {drop: false}  parts: tip, drop, quill, middle
//   bleeding_bowl a shallow pewter bowl with blood in it and a small lancet beside it ≈ 220 px. parts: bowl, blood, lancet
//   heart       an anatomical heart ≈ 220 px with its great vessels; o.loop: true paints a red circle of arrows around
//               it (Harvey's closed circle).  parts: heart, aorta, loop, apex
//   test_tubes  a wooden rack with four glass tubes ≈ 320 px; o.clump: [true|false × 4] (red cells clumped into knots in
//               pale serum vs a smooth red mix).  parts: t0..t3 (tube middles), rack
//   microscope  a brass microscope of c. 1900 ≈ 300 px: horseshoe foot, pillar, curved arm, tube, eyepiece, stage,
//               mirror.  parts: eyepiece, stage, tube, mirror, foot
//   forearm     a bare forearm with an open hand and a rolled cuff (close-up plate). parts: vein, hand, cuff
//   candle_out  a burnt-down candle, blown out. parts: wick, holder
//   (bleeding_bowl o.broth: a plain earthenware bowl of broth, no lancet)
//   nobel_medal a gold medal on a ribbon with a profile head. parts: disc, face, ribbon
//   blood_bag   a modern blood bag ≈ 300 px: a red pouch with a white label and a tube hanging down.
//               parts: bag, label, tube, top
//
// Shot:
//   wc_transfusion_room  a wc_scene (sky, land, items, notes as in wc_scene) + a tube carrying blood between two
//       points: tube: {from: [item index, "part"] | [x, y] (0..1), to: same, at (s | cue, when the blood starts),
//       dur (s, 1.6), bend (px, -60), drip: true}; burn: {at (s | cue), item, part, r (px)} a slow red heat glow
//       swelling at that point.
'use strict';

(() => {
  const C = WC.C, { rnd, mk, along, washShape, mixc, clamp, seg, ss, eio } = WC;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ painting kit (same recipes as wc_bucket.js)
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
  const tok = (v, fb) => (v ? WC.col(v) : fb);
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  function spline(P, closed = false, per = 6) {
    const n = P.length, out = [], g = i => closed ? P[((i % n) + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0, m = closed ? n : n - 1; i < m; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(closed ? out[0].slice() : P[n - 1].slice());
    return out;
  }
  const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
  const add = (S, s) => (S.push(s), s);
  const wsh = (S, pts, c, a = .5, passes = 3, jit = 1.2) => add(S, washShape(pts, c, a, passes, jit));
  const brush = (S, pts, w, c, o = {}) => add(S, mk(pts, w, c, o));
  function ink(S, pts, w = 2.2, o = {}) {
    const L = polyLen(pts); if (L < 2) return;
    const n = Math.max(3, Math.min(70, Math.round(L / 6))), P = along(pts, n);
    const gaps = o.gaps ?? (L > 170 ? (rnd() < .5 ? 1 : 2) : L > 80 && rnd() < .45 ? 1 : 0);
    const cuts = []; for (let g = 0; g < gaps; g++) cuts.push(Math.floor(rnd(.2, .8) * n));
    cuts.sort((a, b) => a - b); cuts.push(n);
    let st = 0;
    for (const e of cuts) {
      if (e - st >= 2) { const s = mk(P.slice(st, e + 1), w * rnd(.85, 1.15), o.col || C.ink, { prof: 'even', nb: 0, a: o.a ?? .85, rough: .32 }); s.fine = true; S.push(s); }
      st = e + 1;
    }
  }
  const inkC = (S, pts, w, o) => ink(S, pts.concat([pts[0]]), w, o);
  const dot = (S, x, y, r, c = C.ink, a = .85) => { const s = mk([[x - r * .5, y], [x, y - r * .1], [x + r * .5, y]], r * 1.8, c, { prof: 'leaf', nb: 0, a, rough: .2 }); s.fine = true; S.push(s); return s; };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const rrect = (x0, y0, x1, y1, r) => spline([[x0 + r, y0], [x1 - r, y0], [x1, y0 + r], [x1, y1 - r], [x1 - r, y1], [x0 + r, y1], [x0, y1 - r], [x0, y0 + r]], true, 4);
  function xform(S, dx, dy, parts) {
    const R = ([x, y]) => [x + dx, y + dy];
    for (const q of S) { if (q.poly) q.poly = q.poly.map(r => r.map(R)); q.pts = q.pts.map(R); }
    if (parts) for (const k in parts) parts[k] = R(parts[k]);
  }
  function scaleList(S, sc) {
    if (sc === 1) return;
    const kf = Math.pow(sc, .62), M = ([x, y]) => [x * sc, y * sc];
    for (const s of S) {
      if (s.poly) { s.poly = s.poly.map(r => r.map(M)); s.pts = s.pts.map(M); continue; }
      const k = s.fine ? kf : sc;
      s.pts = s.pts.map(M); s.ws = s.ws.map(w => Math.max(.5, w * k));
      if (s.br) for (const b of s.br) { b.bw = Math.max(.6, b.bw * k); b.dash = b.dash.map(d => d * sc); }
    }
  }
  function def(name, fn) {
    WC.G[name] = (sc = 1, o = {}) => {
      const r = fn(o) || {}, S = r.S || [];
      let yb = -1e9;
      for (const q of S) { if (q.poly) { for (const p of q.pts) yb = Math.max(yb, p[1]); } else for (let i = 0; i < q.pts.length; i++) yb = Math.max(yb, q.pts[i][1] + q.ws[i] * .4); }
      const lift = yb > -1e8 && Math.abs(yb) > .5 ? -yb : 0;
      if (lift) xform(S, 0, lift, r.parts);
      let pre = [];
      if (o.shadow !== false && r.sh !== false && S.length) {
        const b = WC.bbox(S, 0), w = b[2] - b[0], sc_ = mixc(C.stoneDark, C.night, .3);
        const [cx, rx, ry] = r.sh || [(b[0] + b[2]) / 2 + w * .05, w * .5, Math.max(5, Math.min(16, w * .055))];
        pre = [washShape(WC.blobPts(cx, -1, rx * 1.1, ry * 1.5, 30, .1), sc_, .12, 3, 3), washShape(WC.blobPts(cx + rx * .05, -1, rx * .8, ry * .7, 26, .08), sc_, .2, 3, 2)];
      }
      const all = pre.concat(S);
      scaleList(all, sc);
      const out = { S: all, parts: {} };
      if (r.parts) for (const k in r.parts) out.parts[k] = [r.parts[k][0] * sc, r.parts[k][1] * sc];
      return out;
    };
  }
  const blood = () => mixc(C.red, C.ink, .18);
  const silver = () => mixc(C.stone, C.clothB, .35);
  const glass = () => mixc(C.water, C.paperLight, .45);

  // ================================================================ sickbed
  def('sickbed', o => {
    const S = [], wood = mixc(C.wood, C.ink, .12), linen = mixc(C.paperLight, C.stone, .25), bl = tok(o.blanket, mixc(C.cloth, C.stoneDark, .25));
    // bedstead: head posts + panel (left), foot posts + panel (right), side rail
    const head = spline([[-214, -6], [-214, -200], [-200, -232], [-186, -200], [-186, -6]], false, 5);
    wsh(S, rect(-212, -205, -188, -6), wood, .75, 3, .8);
    wsh(S, spline([[-212, -205], [-200, -236], [-188, -205]], false, 5).concat([[-188, -205]]), dark(wood, .2), .7, 2, .5);
    ink(S, head, 2.2, { gaps: 0 });
    wsh(S, rect(186, -132, 208, -6), wood, .75, 3, .8);
    inkC(S, rect(186, -132, 208, -6), 2, { a: .8 });
    dot(S, 197, -138, 9, dark(wood, .3), .9);
    wsh(S, rect(-188, -62, 186, -30), dark(wood, .1), .7, 3, .8);
    ink(S, [[-188, -30], [186, -30]], 2, { gaps: 0 }); ink(S, [[-188, -62], [186, -62]], 1.4, { a: .6 });
    for (const x of [-170, 170]) { wsh(S, rect(x - 7, -32, x + 7, 0), dark(wood, .25), .8, 2, .4); }
    // mattress + sheet hanging over the front
    wsh(S, rrect(-188, -98, 186, -58, 14), linen, .7, 3, 1);
    ink(S, [[-180, -58], [180, -58]], 1.4, { a: .55 });
    // pillow
    wsh(S, WC.blobPts(-150, -108, 44, 19, 26, .12), lite(linen, .3), .8, 3, .8);
    ink(S, ell(-150, -108, 44, 19, PI * .05, PI * .95, 18), 1.3, { a: .5, gaps: 0 });
    const parts = { pillow: [-150, -118] };
    if (!o.empty) {
      const who = o.who || 'man', hr = who === 'boy' ? 19 : 22;
      // blanket over the body: shoulders → hip → knees → feet, draping over the front edge
      const top = [[-128, -116], [-96, -140], [-40, -138], [20, -128], [80, -136], [128, -132], [170, -124], [184, -100]];
      const B = spline(top.concat([[184, -58], [120, -50], [0, -48], [-120, -52], [-132, -90]]), true, 5);
      wsh(S, B, bl, .72, 3, 1.4);
      wsh(S, spline([[-90, -128], [0, -120], [90, -126], [160, -110], [170, -70], [0, -64], [-100, -70]], true, 4), dark(bl, .18), .32, 2, 1);
      for (let k = 0; k < 4; k++) brush(S, spline([[-60 + k * 60, -126], [-50 + k * 60, -96], [-62 + k * 60, -58]], false, 4), 6, dark(bl, .3), { prof: 'leaf', nb: 3, a: .3 });
      ink(S, spline(top, false, 5), 2, { a: .8 });
      // head on the pillow (seen from the side, face up), hair
      const hx = -152, hy = -122;
      wsh(S, WC.blobPts(hx, hy, hr, hr * .92, 24, .06), C.skin, .78, 3, .6);
      wsh(S, WC.blobPts(hx - hr * .35, hy - hr * .25, hr * .85, hr * .7, 20, .1), who === 'woman' ? lite(linen, .2) : dark(C.wood, .3), .82, 2, .5);
      ink(S, ell(hx, hy, hr, hr * .92, -PI * .35, PI * .6, 16), 1.5, { a: .7, gaps: 0 });
      dot(S, hx + hr * .45, hy - hr * .2, 2.2, C.ink, .8);             // closed eye
      brush(S, [[hx + hr * .85, hy - hr * .05], [hx + hr * 1.1, hy + hr * .05], [hx + hr * .9, hy + hr * .18]], 4, dark(C.skin, .2), { prof: 'even', nb: 0, a: .7 });  // nose
      // the arm lying on the blanket: white shirt sleeve, then the bare forearm and hand
      const sh = [-104, -128], el = [-40, -118], hd = [24, -112];
      brush(S, [sh, [-72, -124], el], 22, lite(linen, .1), { prof: 'even', nb: 3, a: .85 });
      ink(S, [[sh[0], sh[1] + 11], [el[0], el[1] + 11]], 1.2, { a: .5, gaps: 0 });
      brush(S, [el, [-8, -114], hd], 15, C.skin, { prof: 'even', nb: 2, a: .9 });
      wsh(S, WC.blobPts(hd[0] + 6, hd[1], 11, 8, 14, .1), C.skin, .9, 2, .3);
      ink(S, [[el[0], el[1] + 7], [-8, -107], [hd[0], hd[1] + 7]], 1.3, { a: .7, gaps: 0 });
      Object.assign(parts, { arm: [-12, -119], hand: [hd[0] + 8, hd[1]], head: [hx, hy] });
    }
    return { S, parts };
  });

  // ================================================================ calf / lamb (lying, facing left)
  function beast(o, lamb) {
    const S = [], coat = lamb ? mixc(C.paperLight, C.stone, .35) : tok(o.col, mixc(C.wood, C.clothC, .45));
    const face = lamb ? mixc(C.stoneDark, C.ink, .35) : coat, shade = dark(coat, lamb ? .22 : .25);
    // hind leg tucked along the ground (back), body, haunch
    brush(S, [[70, -14], [112, -8], [138, -6]], 16, shade, { prof: 'even', nb: 2, a: .8 });
    const body = lamb ? WC.blobPts(30, -56, 100, 52, 40, .06) : spline([[-70, -40], [-60, -92], [0, -112], [70, -108], [120, -80], [128, -30], [100, -8], [0, -6], [-60, -12]], true, 5);
    if (lamb) {
      wsh(S, body, coat, .6, 3, 2);
      for (let k = 0; k < 26; k++) { const a = k / 26 * TAU, rx = 92 + rnd(-6, 6), ry = 50; const x = 30 + Math.cos(a) * rx * rnd(.55, 1), y = -58 + Math.sin(a) * ry * rnd(.5, 1); wsh(S, WC.blobPts(x, y, rnd(12, 18), rnd(10, 14), 12, .2), k % 3 ? coat : shade, .35, 2, .6); }
      ink(S, along(body, 60).filter((p, i) => i % 9 < 6), 1.4, { a: .6 });
    } else {
      wsh(S, body, coat, .72, 3, 1.5);
      wsh(S, WC.blobPts(10, -70, 34, 22, 18, .25), lite(C.paperLight, .2), .75, 2, .8);   // white patch
      wsh(S, spline([[-50, -20], [20, -14], [100, -16], [118, -40], [60, -36], [-20, -34]], true, 4), shade, .35, 2, 1);
      ink(S, spline([[-60, -92], [0, -112], [70, -108], [120, -80], [128, -30]], false, 5), 2, { a: .8 });
    }
    wsh(S, WC.blobPts(92, -52, 34, 30, 18, .1), shade, .3, 2, .8);                       // haunch
    // foreleg folded under the chest, hoof forward
    brush(S, [[-52, -16], [-80, -10], [-108, -8]], 14, lamb ? face : shade, { prof: 'even', nb: 2, a: .85 });
    wsh(S, WC.blobPts(-112, -9, 8, 6, 10, .1), C.ink, .7, 2, .2);
    let hx, hy, parts;
    if (lamb) {
      hx = -70; hy = -100;
      const neck = spline([[-40, -40], [-56, -86], [hx + 22, hy - 6], [hx + 4, hy + 6], [-92, -70], [-70, -36]], true, 4);
      wsh(S, neck, mixc(C.stone, C.paperLight, .25), .8, 3, 1);
      ink(S, spline([[-56, -86], [hx + 22, hy - 6]], false, 4), 1.4, { a: .6 }); ink(S, spline([[hx + 4, hy + 6], [-92, -70], [-70, -36]], false, 4), 1.4, { a: .6 });
      const headP = spline([[hx + 18, hy - 18], [hx - 16, hy - 12], [hx - 34, hy + 10], [hx - 22, hy + 22], [hx + 10, hy + 14], [hx + 22, hy - 2]], true, 4);
      wsh(S, headP, face, .8, 3, .8); inkC(S, headP, 1.6, { a: .7 });
      for (const [ex, ey, d] of [[hx + 16, hy - 16, 1], [hx + 4, hy - 20, -1]]) {
        const E = spline([[ex, ey], [ex + 22 * d * .3 + 14, ey - 10 + d * 4], [ex + 30, ey + 2], [ex + 6, ey + 4]], true, 3);
        wsh(S, E, face, .8, 2, .4);
      }
      dot(S, hx - 10, hy - 4, 3.4, C.ink, .9);
      wsh(S, WC.blobPts(hx + 6, hy - 22, 16, 10, 12, .2), coat, .6, 2, .5);
      parts = { neck: [-80, -80], head: [hx - 10, hy], body: [30, -60] };
    } else {
      // calf: short thick neck, broad boxy head held low, wide pink muzzle, horn buds, ears out sideways
      hx = -96; hy = -78;
      const far = spline([[hx - 4, hy - 30], [hx - 30, hy - 44], [hx - 40, hy - 36], [hx - 14, hy - 24]], true, 3);
      wsh(S, far, dark(coat, .2), .85, 2, .4);                                                  // far ear (behind)
      const neck = spline([[-30, -30], [-46, -100], [hx + 30, hy - 36], [hx + 14, hy + 26], [-64, -16]], true, 4);
      wsh(S, neck, coat, .85, 3, 1);
      wsh(S, spline([[-44, -60], [hx + 24, hy - 4], [hx + 14, hy + 24], [-60, -18]], true, 3), shade, .3, 2, .6);
      ink(S, spline([[-46, -100], [hx + 30, hy - 36]], false, 4), 1.8, { a: .7 });
      const headP = spline([[hx + 28, hy - 34], [hx - 14, hy - 38], [hx - 42, hy - 18], [hx - 52, hy + 10], [hx - 46, hy + 32], [hx - 14, hy + 38], [hx + 18, hy + 22], [hx + 32, hy - 4]], true, 4);
      wsh(S, headP, coat, .85, 3, .8);
      wsh(S, WC.blobPts(hx - 14, hy - 20, 14, 10, 12, .2), lite(C.paperLight, .2), .7, 2, .3);   // white blaze
      const mz = WC.blobPts(hx - 40, hy + 22, 20, 15, 16, .08);
      wsh(S, mz, mixc(C.skin, C.cloth, .3), .85, 3, .3);
      dot(S, hx - 50, hy + 22, 3, dark(C.cloth, .4), .8); dot(S, hx - 36, hy + 26, 3, dark(C.cloth, .4), .8);  // nostrils
      inkC(S, headP, 1.8, { a: .75 });
      for (const [bx, by] of [[hx - 6, hy - 38], [hx + 12, hy - 36]]) { wsh(S, WC.blobPts(bx, by - 4, 6, 7, 10, .1), mixc(C.stone, C.paperLight, .2), .9, 2, .2); ink(S, ell(bx, by - 4, 6, 7, PI, TAU, 8), 1, { a: .6, gaps: 0 }); }
      const ear = spline([[hx + 22, hy - 26], [hx + 46, hy - 36], [hx + 64, hy - 28], [hx + 44, hy - 16]], true, 3);
      wsh(S, ear, dark(coat, .12), .85, 2, .4); inkC(S, ear, 1.2, { a: .6 });
      wsh(S, WC.blobPts(hx + 46, hy - 26, 10, 4, 10, .1), mixc(C.skin, C.cloth, .2), .6, 1, .2);
      dot(S, hx - 6, hy - 10, 4, C.ink, .9);                                                      // eye
      // a dark binding at the side of the neck, where the tube is tied into the artery
      brush(S, [[-50, -104], [-30, -96]], 7, mixc(C.ink, C.wood, .3), { prof: 'even', nb: 1, a: .9 });
      brush(S, [[-48, -94], [-32, -86]], 6, mixc(C.ink, C.wood, .3), { prof: 'even', nb: 1, a: .85 });
      parts = { neck: [-40, -96], head: [hx - 10, hy], body: [30, -60] };
    }
    if (o.rope) {
      brush(S, spline([[-104, -10], [-140, -4], [-176, -3]], false, 4), 4, mixc(C.clothC, C.wood, .4), { prof: 'even', nb: 1, a: .85 });
      wsh(S, rect(-182, -26, -172, -0), dark(C.wood, .2), .85, 2, .3);
      parts.rope = [-176, -10];
    }
    return { S, parts };
  }
  def('calf', o => beast(o, false));
  def('lamb', o => beast(o, true));

  // ================================================================ silver tube
  def('silver_tube', o => {
    const S = [], sv = silver();
    const P = spline([[-180, -70], [-90, -118], [30, -122], [130, -90], [176, -46]], false, 8);
    brush(S, P, 14, sv, { prof: 'even', nb: 3, a: .85 });
    brush(S, P.map(([x, y]) => [x, y - 3]), 4, C.paperLight, { prof: 'even', nb: 0, a: .55 });
    ink(S, P.map(([x, y]) => [x, y + 7]), 1.5, { a: .75, gaps: 1 });
    ink(S, P.map(([x, y]) => [x, y - 7]), 1, { a: .45, gaps: 1 });
    // a thin red line of blood inside the pipe
    brush(S, P.slice(Math.floor(P.length * .35)).map(([x, y]) => [x, y + 1]), 3, blood(), { prof: 'even', nb: 0, a: .6 });
    // quill joint (left end): a short feather barrel with a few barbs
    brush(S, [[-180, -70], [-214, -52]], 18, lite(C.clothC, .3), { prof: 'even', nb: 2, a: .85 });
    for (let k = 0; k < 6; k++) brush(S, [[-200 - k * 4, -60 + k * 2], [-226 - k * 6, -82 + k * 8]], 5, lite(C.stone, .2), { prof: 'leaf', nb: 2, a: .5 });
    ink(S, [[-180, -62], [-214, -44]], 1.2, { a: .6, gaps: 0 });
    // sharp tip + drop
    brush(S, [[170, -54], [184, -34]], 8, dark(sv, .2), { prof: 'tip', nb: 0, a: .9 });
    const parts = { tip: [184, -34], quill: [-210, -56], middle: [30, -122] };
    if (o.drop !== false) {
      const D = spline([[188, -24], [196, -6], [190, 4], [180, 2], [178, -8]], true, 4);
      wsh(S, D, blood(), .9, 3, .4);
      dot(S, 186, -4, 3, C.paperLight, .5);
      parts.drop = [188, -6];
    }
    return { S, parts };
  });

  // ================================================================ bleeding bowl
  def('bleeding_bowl', o => {
    const S = [], pw = o.broth ? mixc(C.ground, C.wood, .35) : mixc(C.stone, C.smoke, .45);
    const rim = ell(0, -62, 110, 22, 0, TAU, 40);
    const body = ell(0, -62, 110, 22, 0, PI, 20).concat(spline([[-110, -62], [-84, -18], [-40, -4], [40, -4], [84, -18], [110, -62]], false, 4).reverse().slice(0, 1));
    wsh(S, spline([[-110, -62], [-84, -18], [-40, -4], [40, -4], [84, -18], [110, -62], [0, -40]], true, 4), pw, .7, 3, 1);
    wsh(S, rim, lite(pw, .2), .7, 3, .5);
    wsh(S, ell(0, -60, 92, 15, 0, TAU, 32), o.broth ? mixc(C.clothC, C.wood, .45) : blood(), .82, 3, .4);
    dot(S, -30, -64, 4, C.paperLight, .45);
    inkC(S, rim, 1.6, { a: .7 });
    ink(S, spline([[-110, -62], [-84, -18], [-40, -4], [40, -4], [84, -18], [110, -62]], false, 4), 2, { a: .75 });
    if (o.broth) return { S, parts: { bowl: [-90, -40], blood: [20, -60] } };
    // ear handle
    wsh(S, spline([[100, -58], [150, -66], [156, -54], [104, -48]], true, 3), pw, .75, 2, .4);
    // lancet on the right
    brush(S, [[140, -8], [230, -24]], 10, mixc(C.wood, C.stone, .3), { prof: 'even', nb: 1, a: .85 });
    brush(S, [[230, -24], [266, -30]], 6, silver(), { prof: 'tip', nb: 0, a: .9 });
    void body;
    return { S, parts: { bowl: [-90, -40], blood: [20, -60], lancet: [250, -27] } };
  });

  // ================================================================ heart (+ the circle)
  def('heart', o => {
    const S = [], m = mixc(C.red, C.cloth, .45), d = dark(m, .25), v = mixc(C.clothB, C.paperLight, .15);
    const H = spline([[-20, -250], [40, -246], [92, -214], [104, -150], [70, -80], [10, -20], [-10, -8], [-40, -40], [-92, -110], [-102, -180], [-70, -232]], true, 5);
    // great vessels behind
    brush(S, spline([[-30, -236], [-26, -300], [10, -326], [50, -310], [58, -270]], false, 5), 30, m, { prof: 'even', nb: 3, a: .85 });  // aorta arch
    brush(S, [[-62, -226], [-82, -296]], 24, v, { prof: 'even', nb: 3, a: .85 });                 // vena cava
    brush(S, [[20, -240], [44, -290], [80, -300]], 22, v, { prof: 'even', nb: 3, a: .8 });       // pulmonary
    wsh(S, H, m, .75, 3, 1.4);
    wsh(S, spline([[30, -230], [90, -200], [96, -140], [60, -80], [10, -30], [40, -120], [50, -190]], true, 4), d, .4, 2, 1);
    brush(S, spline([[-10, -238], [10, -170], [-4, -100], [-12, -30]], false, 4), 6, dark(m, .45), { prof: 'leaf', nb: 2, a: .55 });   // the groove
    brush(S, spline([[-70, -200], [-60, -150]], false, 3), 12, C.paperLight, { prof: 'leaf', nb: 1, a: .35 });
    inkC(S, H, 2, { a: .8 });
    const parts = { heart: [0, -140], aorta: [10, -320], apex: [-10, -12] };
    if (o.loop) {
      const R = 210, cy = -160, red = C.red;
      for (let k = 0; k < 3; k++) {
        const a0 = -PI / 2 + k * TAU / 3 + .2, a1 = a0 + TAU / 3 - .4;
        const A = ell(0, cy, R, R * .92, a0, a1, 24);
        brush(S, A, 9, red, { prof: 'even', nb: 2, a: .85 });
        const [ex, ey] = A[A.length - 1], ang = a1 + PI / 2;
        brush(S, [[ex - Math.cos(ang - .5) * 26, ey - Math.sin(ang - .5) * 26], [ex, ey], [ex - Math.cos(ang + .5) * 26, ey - Math.sin(ang + .5) * 26]], 8, red, { prof: 'even', nb: 1, a: .9 });
      }
      parts.loop = [R * .7, cy - R * .65];
    }
    return { S, parts };
  });

  // ================================================================ test tubes in a rack
  def('test_tubes', o => {
    const S = [], wood = mixc(C.wood, C.clothC, .25), gl = glass(), cl = o.clump || [false, true, false, true];
    const serum = mixc(C.clothC, C.paperLight, .55), bd = blood();
    wsh(S, rect(-160, -20, 160, 0), wood, .8, 3, .6); inkC(S, rect(-160, -20, 160, 0), 1.6, { a: .7 });
    for (const x of [-150, 150]) { wsh(S, rect(x - 8, -130, x + 8, -20), dark(wood, .15), .8, 2, .4); ink(S, [[x + 8, -130], [x + 8, -20]], 1.2, { a: .6 }); }
    const parts = { rack: [0, -10] };
    const xs = [-105, -35, 35, 105];
    xs.forEach((x, i) => {
      const T = spline([[x - 17, -190], [x - 17, -40], [x - 10, -26], [x, -23], [x + 10, -26], [x + 17, -40], [x + 17, -190]], false, 4);
      const top = -126;
      const liq = spline([[x - 16, top], [x - 16, -40], [x - 9, -28], [x, -25], [x + 9, -28], [x + 16, -40], [x + 16, top]], true, 4);
      if (cl[i % 4]) {
        wsh(S, liq, serum, .55, 2, .6);
        for (let k = 0; k < 4; k++) { const cx = x + rnd(-8, 8), cy = -112 + k * 20 + rnd(-4, 4); for (let j = 0; j < 5; j++) dot(S, cx + rnd(-6, 6), cy + rnd(-5, 5), rnd(3, 5.5), bd, .9); }
        wsh(S, WC.blobPts(x, -36, 11, 7, 12, .2), bd, .85, 2, .3);
      } else {
        wsh(S, liq, bd, .78, 3, .5);
        wsh(S, spline([[x - 14, top], [x - 14, -50], [x - 6, -50], [x - 6, top]], true, 2), lite(bd, .25), .3, 2, .3);
      }
      wsh(S, spline([[x - 17, -190], [x + 17, -190], [x + 17, top], [x - 17, top]], true, 2), gl, .25, 2, .3);
      brush(S, [[x - 11, -182], [x - 11, -50]], 4, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
      ink(S, T, 1.6, { a: .75, gaps: 0 });
      ink(S, ell(x, -190, 17, 4, 0, TAU, 16), 1.2, { a: .6, gaps: 0 });
      parts['t' + i] = [x, -80];
    });
    wsh(S, rect(-160, -132, 160, -112), wood, .85, 3, .6); inkC(S, rect(-160, -132, 160, -112), 1.6, { a: .75 });
    for (const x of xs) wsh(S, ell(x, -126, 15, 3.5, 0, TAU, 14), dark(wood, .4), .5, 1, .2);
    return { S, parts };
  });

  // ================================================================ microscope (c. 1900, brass)
  def('microscope', o => {
    const S = [], br = mixc(C.gold, C.wood, .45), bd = dark(br, .25), fe = mixc(C.ink, C.night, .25);
    // horseshoe foot
    const F = spline([[-90, -4], [-96, -26], [-60, -40], [60, -40], [96, -26], [90, -4], [40, -10], [-40, -10]], true, 4);
    wsh(S, F, fe, .82, 3, .6); inkC(S, F, 1.4, { a: .6 });
    // pillar + hinge
    wsh(S, rect(-14, -120, 14, -36), fe, .85, 2, .4);
    wsh(S, ell(0, -128, 18, 18, 0, TAU, 18), br, .85, 2, .3); ink(S, ell(0, -128, 18, 18, 0, TAU, 18), 1.3, { a: .7, gaps: 0 });
    // stage
    wsh(S, rect(-70, -152, 76, -138), fe, .85, 2, .4); ink(S, [[-70, -138], [76, -138]], 1.2, { a: .6 });
    // mirror under the stage
    wsh(S, ell(4, -98, 22, 9, 0, TAU, 18), lite(C.water, .2), .8, 2, .3); ink(S, ell(4, -98, 22, 9, 0, TAU, 18), 1.2, { a: .7, gaps: 0 });
    // curved arm
    brush(S, spline([[-2, -128], [-34, -170], [-40, -220], [-14, -264]], false, 6), 22, br, { prof: 'even', nb: 3, a: .9 });
    ink(S, spline([[-13, -128], [-45, -170], [-51, -220], [-25, -264]], false, 6), 1.4, { a: .6 });
    // tube (slightly slanted), objective, eyepiece
    const tube = [[4, -160], [-10, -330]];
    brush(S, tube, 40, br, { prof: 'even', nb: 3, a: .92 });
    brush(S, tube.map(([x, y]) => [x - 8, y]), 6, C.paperLight, { prof: 'leaf', nb: 0, a: .45 });
    ink(S, tube.map(([x, y]) => [x + 20, y]), 1.6, { a: .7, gaps: 0 });
    brush(S, [[6, -176], [7, -150]], 16, bd, { prof: 'even', nb: 1, a: .9 });
    brush(S, [[-10, -326], [-12, -356]], 24, bd, { prof: 'even', nb: 1, a: .9 });
    brush(S, [[-26, -244], [8, -244]], 6, fe, { prof: 'even', nb: 0, a: .8 });
    wsh(S, ell(28, -224, 12, 12, 0, TAU, 14), bd, .9, 2, .3);                 // focus knob
    // a glass slide with a red smear
    wsh(S, rect(-40, -160, 40, -152), glass(), .6, 2, .2); dot(S, 4, -156, 5, blood(), .85);
    return { S, parts: { eyepiece: [-12, -356], stage: [40, -150], tube: [-2, -250], mirror: [4, -98], foot: [70, -20] } };
  });

  // ================================================================ blood bag
  def('blood_bag', o => {
    const S = [], bd = blood(), pl = mixc(C.paperLight, C.water, .12);
    const B = rrect(-82, -300, 82, -90, 26);
    wsh(S, B, pl, .5, 2, .6);
    wsh(S, rrect(-74, -262, 74, -98, 22), bd, .82, 3, .8);
    wsh(S, spline([[-60, -250], [-60, -120], [-40, -120], [-40, -250]], true, 2), lite(bd, .3), .3, 2, .3);
    inkC(S, B, 1.8, { a: .8 });
    // top tab with a hole
    wsh(S, rrect(-26, -330, 26, -296, 8), pl, .7, 2, .3); inkC(S, rrect(-26, -330, 26, -296, 8), 1.4, { a: .7 });
    wsh(S, ell(0, -318, 8, 6, 0, TAU, 12), C.paper, .9, 2, .2);
    // label
    wsh(S, rect(-50, -224, 50, -150), C.paperLight, .92, 3, .3); inkC(S, rect(-50, -224, 50, -150), 1.2, { a: .6 });
    for (let k = 0; k < 4; k++) ink(S, [[-38, -206 + k * 14], [k === 0 ? 10 : 38 - k * 8, -206 + k * 14]], k === 0 ? 3 : 1.2, { a: .7, gaps: 0 });
    // tube from the bottom
    const T = spline([[20, -90], [24, -60], [10, -30], [-10, -10], [-4, 0]], false, 5);
    brush(S, T, 7, bd, { prof: 'even', nb: 1, a: .8 }); ink(S, T.map(([x, y]) => [x + 4, y]), 1, { a: .55, gaps: 0 });
    return { S, parts: { bag: [60, -200], label: [0, -186], tube: [14, -40], top: [0, -330] } };
  });

  // ================================================================ forearm (close-up plate)
  // forearm  a bare forearm lying across the paper ≈ 520 px, the white shirt cuff rolled back at the left, the hand at
  //          the right, a blue vein along the inner side. parts: vein (where the tube goes in), hand, cuff
  def('forearm', o => {
    const S = [], sk = C.skin, shirt = mixc(C.paperLight, C.stone, .25);
    const top = [[-200, -124], [-60, -126], [80, -110], [180, -98]], bot = [[180, -48], [80, -42], [-60, -34], [-200, -28]];
    const A = spline(top.concat(bot), true, 5);
    wsh(S, A, sk, .82, 3, 1);
    wsh(S, spline([[-190, -60], [0, -48], [170, -56], [170, -44], [0, -38], [-190, -34]], true, 4), dark(sk, .2), .35, 2, .6);
    brush(S, spline([[-150, -88], [-40, -86], [80, -80], [150, -74]], false, 5), 5, mixc(C.clothB, sk, .35), { prof: 'leaf', nb: 1, a: .55 });
    ink(S, spline(top, false, 5), 1.8, { a: .75 }); ink(S, spline(bot, false, 5).reverse(), 1.6, { a: .6 });
    // open hand, palm up, fingers spread (clearly a hand, not a stump)
    const Pm = spline([[168, -102], [214, -112], [244, -100], [250, -58], [226, -38], [176, -44]], true, 4);
    wsh(S, Pm, sk, .88, 3, .5);
    const fingers = [[[244, -98], [292, -118], [318, -124]], [[250, -84], [306, -92], [336, -92]], [[250, -68], [304, -66], [332, -62]], [[244, -52], [290, -42], [312, -34]]];
    for (const F of fingers) { const P = spline(F, false, 4); brush(S, P, 15, sk, { prof: 'even', nb: 2, a: .9 }); ink(S, P.map(([x, y]) => [x, y + 7]), 1.1, { a: .55, gaps: 0 }); ink(S, P.map(([x, y]) => [x, y - 7]), 1, { a: .4, gaps: 0 }); }
    const Th = spline([[206, -106], [222, -140], [236, -160]], false, 4);
    brush(S, Th, 16, sk, { prof: 'even', nb: 2, a: .9 }); ink(S, Th.map(([x, y]) => [x + 8, y + 2]), 1.1, { a: .55, gaps: 0 });
    inkC(S, Pm, 1.4, { a: .55 });
    // rolled shirt cuff
    const Cf = spline([[-270, -140], [-190, -136], [-180, -80], [-196, -20], [-276, -16], [-290, -80]], true, 4);
    wsh(S, Cf, shirt, .85, 3, .8); inkC(S, Cf, 1.6, { a: .7 });
    for (let k = 0; k < 3; k++) brush(S, [[-260 + k * 22, -132], [-252 + k * 22, -24]], 4, dark(shirt, .2), { prof: 'leaf', nb: 1, a: .4 });
    return { S, parts: { vein: [20, -86], hand: [260, -80], cuff: [-230, -80] } };
  });

  // ================================================================ snuffed candle
  // candle_out  a candle in a brass holder, burnt low and blown out: no flame, a curl of smoke is added by the scene.
  //             parts: wick, holder
  def('candle_out', o => {
    const S = [], wax = mixc(C.paperLight, C.clothC, .2), br = mixc(C.gold, C.wood, .4);
    const D = ell(0, -16, 70, 14, 0, TAU, 30);
    wsh(S, spline([[-70, -14], [-60, 0], [60, 0], [70, -14], [0, -24]], true, 3), br, .85, 3, .5); inkC(S, D, 1.4, { a: .6 });
    wsh(S, rect(-22, -110, 22, -20), wax, .85, 3, .5);
    wsh(S, spline([[-22, -110], [-10, -116], [10, -112], [22, -106], [24, -88], [16, -96], [10, -84], [4, -100], [-22, -100]], true, 3), lite(wax, .2), .8, 2, .3);
    ink(S, [[-22, -108], [-22, -20]], 1.4, { a: .6 }); ink(S, [[22, -104], [22, -20]], 1.6, { a: .7 });
    brush(S, [[0, -112], [2, -128]], 3, C.ink, { prof: 'even', nb: 0, a: .9 });
    return { S, parts: { wick: [2, -130], holder: [60, -10] } };
  });

  // ================================================================ Nobel-style medal
  // nobel_medal  a gold medal ≈ 300 px hanging from a short ribbon, a profile head in relief on its face.
  //              parts: disc, face, ribbon
  def('nobel_medal', o => {
    const S = [], gd = mixc(C.gold, C.clothC, .25), gdD = dark(gd, .3), rb = tok(o.ribbon, mixc(C.clothB, C.ink, .1));
    // ribbon: two crossed bands
    wsh(S, spline([[-46, -320], [46, -320], [30, -196], [-30, -196]], true, 2), rb, .85, 3, .5);
    for (const x of [-26, 0, 26]) brush(S, [[x * 1.4, -316], [x, -200]], 3, lite(rb, .35), { prof: 'even', nb: 0, a: .5 });
    inkC(S, spline([[-46, -320], [46, -320], [30, -196], [-30, -196]], true, 2), 1.3, { a: .6 });
    wsh(S, ell(0, -190, 14, 10, 0, TAU, 14), gdD, .9, 2, .2);
    // disc
    const D = ell(0, -96, 96, 96, 0, TAU, 60);
    wsh(S, D, gd, .85, 3, .6);
    wsh(S, ell(6, -90, 82, 82, -PI * .2, PI * .9, 30).concat([[6, -90]]), gdD, .25, 2, .4);
    inkC(S, D, 2, { a: .75 }); ink(S, ell(0, -96, 84, 84, 0, TAU, 56), 1, { a: .45, gaps: 2 });
    // profile head facing left, in relief
    const Hd = spline([[-18, -150], [-40, -140], [-46, -120], [-54, -104], [-44, -98], [-46, -86], [-40, -76], [-34, -64], [-10, -54], [6, -40], [34, -42], [36, -70], [40, -104], [30, -140], [6, -156]], true, 4);
    wsh(S, Hd, dark(gd, .12), .7, 3, .4);
    wsh(S, spline([[6, -156], [30, -140], [40, -104], [36, -70], [22, -80], [20, -120]], true, 3), gdD, .4, 2, .3);
    inkC(S, Hd, 1.4, { a: .65 });
    dot(S, -30, -118, 2.4, C.ink, .7);
    return { S, parts: { disc: [70, -60], face: [-20, -110], ribbon: [30, -280] } };
  });

  // ================================================================ shot: a wc_scene + a tube carrying blood
  const notesOf = P => P.notes || [];
  SHOTS.wc_transfusion_room = {
    kind: '2d',
    build(ctx) {
      const { W, H, P } = ctx, portrait = H > W;
      const s = WC.scene(ctx), X = s.X;
      const at = (ref) => {
        if (!ref) return null;
        if (typeof ref[0] === 'number' && typeof ref[1] === 'number' && ref.length === 2 && ref[0] <= 1.5 && !Number.isInteger(ref[0])) return [ref[0] * W, ref[1] * H];
        const it = s.items.find(q => q.k === ref[0]); if (!it) return null;
        const p = (it.obj.parts || {})[ref[1]] || [0, -40];
        return [it.x + (it.flip ? -p[0] : p[0]), it.y + p[1]];
      };
      const T = P.tube, a = T && at(T.from), b = T && at(T.to);
      const path = a && b ? WC.qcurve(a[0], a[1], b[0], b[1], T.bend ?? -60, 40) : null;
      const sv = silver(), bd = blood();
      void notesOf;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          s.update(lt, dur, cues);
          const fade = P.mist != null ? 1 - seg(lt, WC.timeOf(P.mist, cues, dur), WC.timeOf(P.mist, cues, dur) + 1.2) : 1;
          if (path) {
            const t0 = WC.timeOf(T.at, cues, 1), td = T.show ?? Math.max(0, t0 - 1.2);
            const shown = ss(seg(lt, td, td + .8)) * fade;
            if (shown > 0) {
              X.save(); X.globalAlpha = shown; X.lineCap = 'round'; X.lineJoin = 'round';
              const k = Math.max(2, Math.round(path.length * eio(seg(lt, td, td + .8))));
              const stroke = (w, col, al, n0, n1, dy = 0) => { X.strokeStyle = WC.rgba(col, al); X.lineWidth = w; X.beginPath(); for (let i = n0; i < n1; i++) { const [x, y] = path[i]; i === n0 ? X.moveTo(x, y + dy) : X.lineTo(x, y + dy); } X.stroke(); };
              stroke(9, sv, .85, 0, k); stroke(1.6, C.ink, .6, 0, k, 4.5); stroke(2.5, C.paperLight, .5, 0, k, -2.5);
              const f = eio(seg(lt, t0, t0 + (T.dur ?? 1.6)));
              if (f > 0) {
                const n = Math.max(2, Math.round(path.length * f));
                stroke(4.5, bd, .9, 0, n);
                // a slow pulse travelling along the filled tube
                const ph = ((lt - t0) * .6) % 1, pi = Math.floor(ph * (n - 1));
                if (f >= 1) { const [x, y] = path[pi]; X.fillStyle = WC.rgba(C.red, .55); X.beginPath(); X.ellipse(x, y, 7, 5, 0, 0, TAU); X.fill(); }
              }
              X.restore();
            }
          }
          for (const m of P.late_notes || []) {          // notes drawn over everything (after a mist)
            const ta = WC.timeOf(m.at, cues, 1.2), size = m.size || (portrait ? 52 : 46), col = m.color === 'red' ? C.red : C.ink;
            WC.hand(X, m.text, m.x * W, m.y * H, seg(lt, ta, ta + 1), { size, align: m.align || 'center', col });
          }
          const Bn = P.burn;
          if (Bn) {
            const p = at([Bn.item, Bn.part || 'arm']), t0 = WC.timeOf(Bn.at, cues, 2);
            const k = ss(seg(lt, t0, t0 + 1.4));
            if (p && k > 0 && fade > 0) {
              const r = (Bn.r ?? 70) * (1 + .12 * Math.sin((lt - t0) * 2.2));
              X.save();
              const g = X.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
              g.addColorStop(0, WC.rgba(C.red, .5 * k)); g.addColorStop(.5, WC.rgba(C.fire, .22 * k)); g.addColorStop(1, WC.rgba(C.fire, 0));
              X.fillStyle = g; X.beginPath(); X.arc(p[0], p[1], r, 0, TAU); X.fill();
              X.restore();
            }
          }
        },
      };
    },
  };
  // ================================================================ red blood cell (for the lens shot)
  // rbc  one red cell seen from above ≈ 44 px: a soft disc with a pale dimple. o: {foreign: true (a paler, browner cell)}
  def('rbc', o => {
    const S = [], c = o.foreign ? mixc(C.clothC, C.stoneDark, .3) : mixc(C.red, C.cloth, .2);
    wsh(S, WC.blobPts(0, -22, 22, 21, 22, .05), c, .78, 3, .4);
    wsh(S, WC.blobPts(1, -22, 10, 9, 16, .08), lite(c, .45), .55, 2, .3);
    ink(S, ell(0, -22, 22, 21, PI * .1, PI * .9, 14), 1.1, { a: .45, gaps: 0, col: dark(c, .4) });
    return { S, sh: false, parts: {} };
  });

  // ------------------------------------------------------------ wc_transfusion_cells
  // wc_transfusion_cells  a round magnifying lens on the paper: red cells drifting slowly in the clear liquid.
  //   params: {mode: "smooth" | "clump" (on at, the cells pull together into tiny red knots) | "attack" (own red cells +
  //   paler foreign ones; on at, the foreign cells break up into dark specks that sink away), at (s | cue), n (cells, 46),
  //   x, y (lens centre 0..1), r (lens radius × of the height, .36), notes: [{text, x, y, ax?, ay?, at, color, size}]}
  SHOTS.wc_transfusion_cells = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const cx = (P.x ?? .5) * W, cy = (P.y ?? (portrait ? .36 : .42)) * H, R = (P.r ?? (portrait ? .22 : .36)) * H;
      const mode = P.mode || 'smooth', n = P.n ?? 46;
      const lens = document.createElement('canvas'); lens.width = W; lens.height = H;
      WC.withSeed(seed * 37 + 3, () => {
        const c = lens.getContext('2d');
        WC.wash(c, WC.blobPts(cx + R * .06, cy + R * .08, R * 1.08, R * 1.04, 60, .03), mixc(C.stoneDark, C.night, .3), .12, 3, 3);
        WC.wash(c, ell(cx, cy, R, R, 0, TAU, 80), mixc(C.clothC, C.paperLight, .62), .55, 3, 2);
        WC.wash(c, WC.blobPts(cx - R * .3, cy - R * .35, R * .4, R * .26, 30, .2), C.paperLight, .14, 2, 2);
        const ring = [], k = 90; for (let i = 0; i <= k; i++) ring.push([cx + Math.cos(i / k * TAU) * R, cy + Math.sin(i / k * TAU) * R]);
        WC.drawS(c, mk(ring, Math.max(10, R * .05), mixc(C.gold, C.wood, .45), { prof: 'even', nb: 4, a: .9, rough: .1 }), 1);
        WC.drawS(c, mk(ring.map(([x, y]) => [cx + (x - cx) * 1.035, cy + (y - cy) * 1.035]), 2, C.ink, { prof: 'even', nb: 0, a: .7, rough: .2 }), 1);
      });
      const sc = Math.round(R / 300 * 100) / 100 * 1.1;
      const own = WC.make('rbc', sc, {}, seed + 1), alien = WC.make('rbc', sc, { foreign: true }, seed + 2);
      const knots = WC.withSeed(seed + 9, () => Array.from({ length: 5 }, (_, i) => { const a = i / 5 * TAU + rnd(-.3, .3), d = R * rnd(.3, .55); return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]; }));
      const cells = WC.withSeed(seed + 5, () => Array.from({ length: n }, (_, i) => {
        let x, y; do { x = rnd(-1, 1); y = rnd(-1, 1); } while (x * x + y * y > .72);
        const kn = knots[i % knots.length];
        return { x: cx + x * R, y: cy + y * R, ph: rnd(0, TAU), sp: rnd(.25, .5), foreign: mode === 'attack' && i % 3 === 0,
          kx: kn[0] + rnd(-1, 1) * R * .09, ky: kn[1] + rnd(-1, 1) * R * .09, rot: rnd(-.3, .3), sink: rnd(.6, 1.2) };
      }));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(lens, 0, 0);
          const t0 = WC.timeOf(P.at, cues, dur * .45), f = eio(seg(lt, t0, t0 + 2.2));
          X.save(); X.beginPath(); X.arc(cx, cy, R * .97, 0, TAU); X.clip();
          const appear = ss(seg(lt, .1, 1.2));
          for (const c of cells) {
            let x = c.x + Math.sin(lt * c.sp + c.ph) * R * .03, y = c.y + Math.cos(lt * c.sp * .8 + c.ph) * R * .025;
            if (mode === 'clump') { x = WC.mix(x, c.kx, f); y = WC.mix(y, c.ky, f); }
            if (c.foreign && f > 0) {
              // the foreign cell breaks up: it fades, and dark specks sink and drift away from where it was
              WC.drawObj(X, alien, x, y + 22 * sc, appear, { a: 1 - f, rot: c.rot });
              X.fillStyle = WC.rgba(mixc(C.ink, C.red, .35), .7 * f * (1 - .5 * seg(lt, t0 + 2.2, dur)));
              for (let j = 0; j < 5; j++) { const a = c.ph + j * 1.3, d = 6 + 30 * f * sc + j * 3; X.beginPath(); X.ellipse(x + Math.cos(a) * d, y + Math.sin(a) * d * .6 + (lt - t0) * 14 * c.sink, 3, 2.4, 0, 0, TAU); X.fill(); }
              continue;
            }
            WC.drawObj(X, c.foreign ? alien : own, x, y + 22 * sc, appear, { rot: c.rot });
          }
          X.restore();
          for (const m of P.notes || []) {
            const ta = WC.timeOf(m.at, cues, 1.2), size = m.size || (portrait ? 52 : 46), col = m.color === 'red' ? C.red : C.ink;
            if (m.ax != null) WC.note(X, lt, ta, m.ax * W, m.ay * H, m.x * W, m.y * H, m.text, { size, col, align: m.align });
            else WC.hand(X, m.text, m.x * W, m.y * H, seg(lt, ta, ta + 1), { size, align: m.align || 'center', col });
          }
        },
      };
    },
  };
})();
