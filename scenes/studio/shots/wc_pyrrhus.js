// wc_pyrrhus — topic objects for "Pyrrhic victory" (videos/2026-11-28/ag-01-pyrrhic-victory.json).
// Same contract as the other WC.G generators: local coordinates, origin on the ground under the middle, y negative up,
// painted in order (structure first, ink last), colours only from WC.C tokens, randomness only from WC.rnd.
// pyr_elephant  an Indian war elephant in profile facing right (domed head, small ear, arched back, tusks), sc 1 ≈ 250 px
//               at the shoulder, ≈ 380 px long. A paper underlay keeps the sky from showing through the washes.
//               o: {pose: "stand" | "walk" (legs apart) | "charge" (trunk raised, ears out), tower: true (a wooden fighting
//                   tower on the caparison; rug: true = the red caparison even without a tower, spear points and two round shields), mahout: true (a driver on the neck),
//                   col: coat token, still: true (ear and trunk baked in, no live parts: for wc_title / wc_number)}   live: the ear fans and the trunk swings very slowly.   parts: top trunk tower head
// pyr_hoplite   a Greek hoplite of Pyrrhus' age, sc 1 ≈ 180 px with the crest. o: {view: "back" (seen from behind: a red
//               cloak to the knees, a tall crest, the round shield on the left arm, the spear upright in the right hand) |
//               "side" (profile facing right: crested helmet, bronze cuirass, pleated skirt, greaves, cloak behind),
//               pose: "stand" | "raise" (side: right arm up in greeting), shield: true, spear: true, king: true (deeper red
//               cloak, a gold band on the helmet)}   live (back view): the crest stirs in the wind.
// pyr_aspis     a round bronze hoplite shield lying flat in the grass, seen at a low angle (an ellipse), a dent and a
//               painted rim. sc 1 ≈ 200 px wide. o: {col: rim token}
'use strict';
(() => {
  const C = WC.C, { mk, washShape, inkLine, mixc, along, qcurve, rnd } = WC;
  const dk = (c, k = .3) => mixc(c, C.ink, k), lite = (c, k = .3) => mixc(c, C.paperLight, k);
  // Chaikin smoothing of a closed polygon
  function smooth(P, it = 2) {
    let p = P;
    for (let k = 0; k < it; k++) {
      const out = [];
      for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; out.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
      p = out;
    }
    return p;
  }
  // Chaikin smoothing of an open polyline (keeps both ends)
  function smoothO(P, it = 2) {
    let p = P;
    for (let k = 0; k < it; k++) {
      const out = [p[0]];
      for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1]; out.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
      out.push(p[p.length - 1]); p = out;
    }
    return p;
  }
  const circ = (cx, cy, rx, ry = rx, n = 26, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  const st = (S, pts, w, c, o = {}) => { const s = mk(pts, Math.max(.6, w), c, Object.assign({ prof: 'even', nb: 0 }, o)); S.push(s); return s; };
  const ln = (S, p, q, w, c, o = {}) => st(S, qcurve(p[0], p[1], q[0], q[1], o.bend || 0, o.n || 8), w, c, o);
  const wsh = (S, pts, c, a = .9, passes = 3, jit = 1) => { const s = washShape(pts, c, a, passes, jit); S.push(s); return s; };
  const ink = (S, pts, w, a = .55, step = 3) => { if (pts.length > 1) S.push(...inkLine(pts, Math.max(.6, w), C.ink, { step, a })); };
  const under = (S, pts) => wsh(S, pts, C.paper, 2.2, 2, 0);          // opaque paper underlay
  const rotAbout = (pts, c, a) => pts.map(([x, y]) => { const dx = x - c[0], dy = y - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; });
  const spr = L => WC.sprite(L);
  const drawSpr = (c, sp, px, py, ang) => { c.save(); c.translate(px, py); c.rotate(ang); c.drawImage(sp.cv, sp.x0 - px, sp.y0 - py); c.restore(); };

  // ------------------------------------------------------------------ pyr_elephant
  WC.G.pyr_elephant = (sc, o = {}) => {
    const S = [], K = p => [p[0] * sc, p[1] * sc], KK = L => L.map(K);
    const pose = ['walk', 'charge'].includes(o.pose) ? o.pose : 'stand';
    const coat = o.col ? WC.col(o.col) : mixc(mixc(C.smoke, C.stone, .3), C.far, .25), shade = dk(coat, .32), far = dk(coat, .22);
    // legs: [hip/shoulder, knee, ankle, foot] — columns that taper a little, soft knees
    const LEG = {
      stand: { fn: [[96, -176], [100, -78], [98, -22], [100, 0]], ff: [[66, -170], [64, -80], [62, -22], [62, 0]], hn: [[-118, -176], [-110, -74], [-114, -22], [-112, 0]], hf: [[-86, -170], [-84, -76], [-86, -22], [-84, 0]] },
      walk: { fn: [[96, -176], [114, -80], [122, -24], [126, 0]], ff: [[66, -170], [58, -80], [50, -22], [50, 0]], hn: [[-118, -176], [-124, -74], [-136, -22], [-136, 0]], hf: [[-86, -170], [-76, -76], [-66, -22], [-64, 0]] },
      charge: { fn: [[96, -176], [120, -96], [138, -50], [146, -26]], ff: [[66, -170], [60, -80], [54, -22], [54, 0]], hn: [[-118, -176], [-128, -76], [-142, -22], [-144, 0]], hf: [[-86, -170], [-80, -76], [-74, -22], [-72, 0]] },
    }[pose];
    // the body: an arched back (highest in the middle), the rump falling away, a deep belly
    const body = smooth(KK([[-150, -118], [-166, -160], [-158, -206], [-124, -240], [-64, -262], [-4, -266], [52, -252], [92, -236], [120, -214], [126, -170], [112, -132], [70, -110], [10, -100], [-60, -102], [-120, -108]]), 2);
    const headP = smooth(KK([[86, -244], [102, -278], [128, -292], [150, -286], [164, -266], [172, -238], [176, -206], [170, -176], [150, -158], [124, -156], [104, -170], [92, -200]]), 2);
    const shw = 200 * sc;
    S.push(mk(along([[-shw * .8, 2 * sc], [0, 7 * sc], [shw * .9, 2 * sc]], 12), 26 * sc, mixc(C.ground, C.ink, .45), { prof: 'leaf', nb: 0, a: .22 }));
    // paper underlay (so a sun or smoke never shows through the beast)
    under(S, body); under(S, headP);
    // a leg: a tapered column (wide thigh / upper arm, a soft joint, a narrower ankle, a flared round foot),
    // painted as layered washes with a darker wet edge on the shadow side and dry-brush grain down its length
    const legPoly = (P, w) => {
      const ws = [1.18, .9, .76, .98], L = [], R = [];
      const pts = along(P, 16);
      for (let i = 0; i < pts.length; i++) {
        const t = i / (pts.length - 1), seg = Math.min(2, Math.floor(t * 3)), f = t * 3 - seg, wi = w * .5 * (ws[seg] + (ws[seg + 1] - ws[seg]) * f);
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
        L.push([pts[i][0] - dy / l * wi, pts[i][1] + dx / l * wi]); R.push([pts[i][0] + dy / l * wi, pts[i][1] - dx / l * wi]);
      }
      const ft = P[3], fw = w * .56;
      return { poly: L.concat([[ft[0] - fw, ft[1] - 2 * sc], [ft[0] + fw, ft[1] - 2 * sc]], R.slice().reverse()), L, R, pts };
    };
    const leg = (Lg, c, w, near) => {
      const P = KK(Lg), g = legPoly(P, w);
      under(S, g.poly);
      wsh(S, g.poly, c, .95, 3, .6 * sc);
      // wet edge pooled on the back (shadow) side, a soft light down the front
      st(S, along(g.L, 14), w * .22, dk(c, .3), { prof: 'leaf', nb: 3, a: near ? .45 : .3, rough: .3 });
      st(S, along(g.R.slice(2, -3), 10), w * .14, lite(c, .35), { prof: 'leaf', nb: 3, a: near ? .35 : .2 });
      // dry-brush grain
      for (let k = 0; k < 3; k++) { const q = rnd(-.25, .25) * w; st(S, along(g.pts.slice(2, -2).map(([x, y]) => [x + q, y]), 10), rnd(4, 7) * sc, dk(c, .2), { prof: 'leaf', nb: 5, a: rnd(.1, .2), rough: .5 }); }
      if (near) {
        ink(S, g.L, 1.5 * sc, .45, 4); ink(S, g.R.slice(3), 1 * sc, .3, 4);
        // creases at the knee and ankle, toenails
        for (const [j, n] of [[1, 2], [2, 3]]) for (let k = 0; k < n; k++) { const a = [P[j][0], P[j][1] + (k - 1) * 7 * sc]; ln(S, [a[0] - w * .36, a[1]], [a[0] + w * .34, a[1] + 2 * sc], 1.3 * sc, dk(c, .35), { a: .45, bend: 4 * sc }); }
        for (let k = 0; k < 3; k++) ln(S, [P[3][0] - w * .34 + k * w * .3, P[3][1] - 5 * sc], [P[3][0] - w * .22 + k * w * .3, P[3][1] - 4 * sc], 6 * sc, lite(c, .6), { prof: 'leaf' });
      } else ink(S, g.L, 1.1 * sc, .25, 4);
    };
    const lw = 46 * sc;
    leg(LEG.ff, far, lw * .92, false); leg(LEG.hf, far, lw * .95, false);
    // tail with a dark tuft
    const tail = pose === 'charge' ? [[-160, -196], [-188, -186], [-204, -160]] : [[-162, -196], [-176, -160], [-174, -112]];
    st(S, along(KK(tail), 10), 6 * sc, shade, { prof: 'tip', nb: 2 });
    ln(S, K(tail[2]), K([tail[2][0] + (pose === 'charge' ? -12 : -3), tail[2][1] + 16]), 7 * sc, C.ink, { prof: 'leaf', a: .7 });
    // body and head washes: a base, a darker lower half, a pale light along the back
    wsh(S, body, coat, .95, 3, 1.2 * sc);
    wsh(S, smooth(KK([[-150, -130], [-160, -170], [-120, -168], [-40, -150], [40, -150], [110, -160], [118, -140], [70, -112], [10, -102], [-60, -104], [-120, -110]]), 2), shade, .34, 2, sc);
    st(S, along(KK([[-140, -214], [-90, -246], [-20, -258], [50, -244], [90, -230]]), 16), 22 * sc, lite(coat, .4), { prof: 'leaf', nb: 6, a: .4 });
    wsh(S, headP, coat, .95, 3, .8 * sc);
    st(S, along(KK([[110, -266], [130, -284], [152, -280]]), 8), 12 * sc, lite(coat, .45), { prof: 'leaf', nb: 4, a: .45 });
    // dry-brush wrinkles across the flank and a skin-fold line behind the shoulder
    for (let k = 0; k < 7; k++) { const x = rnd(-120, 60), y = rnd(-226, -130); ln(S, K([x, y]), K([x + rnd(30, 60), y + rnd(-6, 8)]), rnd(5, 9) * sc, shade, { prof: 'leaf', nb: 4, a: rnd(.14, .24), bend: rnd(-6, 6) * sc }); }
    ln(S, K([60, -238]), K([70, -128]), 8 * sc, shade, { prof: 'leaf', a: .32, bend: -14 * sc, nb: 3 });
    ln(S, K([-96, -230]), K([-128, -118]), 9 * sc, shade, { prof: 'leaf', a: .28, bend: 16 * sc, nb: 3 });
    // wet, darker pooled edge along the belly and rump, granulation dabs on the flank
    st(S, along(smoothO(KK([[-150, -130], [-120, -108], [-60, -102], [10, -100], [70, -110], [112, -132]]), 1), 20), 16 * sc, dk(coat, .35), { prof: 'leaf', nb: 6, a: .35, rough: .35 });
    st(S, along(smoothO(KK([[-160, -150], [-164, -190], [-140, -226]]), 1), 12), 12 * sc, dk(coat, .3), { prof: 'leaf', nb: 5, a: .3, rough: .35 });
    for (let k = 0; k < 22; k++) { const x = rnd(-140, 100), y = rnd(-240, -120); wsh(S, circ(x * sc, y * sc, rnd(2, 5) * sc, rnd(1.5, 3.5) * sc, 8), dk(coat, rnd(.15, .35)), rnd(.15, .3), 1, .5 * sc); }
    // near legs over the body
    leg(LEG.hn, coat, lw, true); leg(LEG.fn, coat, lw, true);
    // shoulder and haunch masses over the leg tops, so each leg grows out of the body instead of being cut flat
    for (const [Lg, rx, ry] of [[LEG.hn, 50, 58], [LEG.fn, 44, 54]]) {
      const c0 = [Lg[0][0], Lg[0][1] + 18], m = smooth(KK(circ(c0[0], c0[1], rx, ry, 14)), 1);
      wsh(S, m, coat, .9, 3, 2 * sc);
      st(S, along(KK([[c0[0] - rx * .8, c0[1] + ry * .1], [c0[0] - rx * .5, c0[1] + ry * .75], [c0[0], c0[1] + ry * .95]]), 10), 9 * sc, dk(coat, .25), { prof: 'leaf', nb: 4, a: .3 });
      st(S, along(KK([[c0[0] + rx * .2, c0[1] - ry * .6], [c0[0] + rx * .7, c0[1] - ry * .1], [c0[0] + rx * .75, c0[1] + ry * .5]]), 10), 6 * sc, lite(coat, .35), { prof: 'leaf', nb: 3, a: .3 });
    }
    // caparison, tower, spears, shields, a driver
    const parts = { top: K([0, -270]), head: K([150, -260]), trunk: K([170, -60]), tower: K([-40, -330]) };
    if (o.rug !== false || o.tower !== false) {
      const rug = smooth(KK([[-112, -232], [-60, -256], [0, -262], [56, -246], [70, -200], [62, -164], [20, -158], [-40, -160], [-100, -168], [-118, -196]]), 1);
      wsh(S, rug, C.cloth, .94, 3, sc);
      wsh(S, smooth(KK([[-100, -176], [-40, -170], [20, -168], [62, -174], [60, -164], [20, -158], [-40, -160], [-100, -168]]), 1), dk(C.cloth, .3), .5, 2, sc);
      st(S, along(KK([[-118, -196], [-100, -168], [-40, -160], [20, -158], [62, -164], [70, -200]]), 18), 6 * sc, C.clothC, { a: .9 });
      for (let k = 0; k < 11; k++) { const t = k / 10, p = K([WC.mix(-112, 64, t), -165 + Math.sin(t * Math.PI) * 6 - (t < .1 ? 8 : 0)]); ln(S, p, [p[0], p[1] + 10 * sc], 2.4 * sc, C.clothC, { a: .85 }); }
      ink(S, rug.slice(0, Math.floor(rug.length * .55)), 1.2 * sc, .35);
    }
    if (o.tower !== false) {
      // the tower: a planked box with a crenellated rim, lashed on with ropes
      const box = KK([[-86, -258], [22, -262], [24, -330], [-88, -326]]);
      under(S, box);
      wsh(S, box, mixc(C.wood, C.clothC, .3), .95, 3, sc);
      for (let k = 1; k < 5; k++) { const y = WC.mix(-262, -326, k / 5); ln(S, K([-86, y + 2]), K([22, y]), 1.6 * sc, dk(C.wood, .2), { a: .55 }); }
      for (let k = 0; k < 6; k++) { const x = WC.mix(-84, 14, k / 5); wsh(S, KK([[x, -326], [x + 11, -327], [x + 11, -342], [x, -341]]), mixc(C.wood, C.clothC, .2), .95, 2, .5 * sc); }
      ln(S, K([-88, -326]), K([24, -330]), 4 * sc, dk(C.wood, .35));
      ink(S, box.concat([box[0]]), 1.3 * sc, .5, 1);
      for (const x of [-60, -6]) { ln(S, K([x, -262]), K([x - 14, -170]), 2.6 * sc, mixc(C.clothC, C.wood, .5), { a: .8, bend: 4 * sc }); }
      // two round shields hung on the side, spear points over the rim
      for (const [x, y] of [[-58, -294], [-8, -294]]) {
        const sh = circ(x * sc, y * sc, 19 * sc, 19 * sc, 22);
        wsh(S, sh, mixc(C.gold, C.wood, .45), .95, 3, .5 * sc);
        wsh(S, circ(x * sc, y * sc, 13 * sc, 13 * sc, 18), mixc(C.gold, C.clothC, .3), .5, 2, .4 * sc);
        ink(S, sh.concat([sh[0]]), 1.1 * sc, .5, 2);
        wsh(S, circ((x + 2) * sc, (y - 2) * sc, 4 * sc), dk(C.gold, .4), .8, 2, .2 * sc);
      }
      for (const [x, lean] of [[-74, -10], [-30, 6], [10, 16]]) {
        ln(S, K([x, -322]), K([x + lean, -396]), 2.4 * sc, mixc(C.wood, C.ink, .2));
        wsh(S, KK([[x + lean - 4, -394], [x + lean + 4, -394], [x + lean + lean * .1, -414]]), mixc(C.stone, C.ink, .35), .9, 2, .3 * sc);
      }
      // two helmeted heads over the rim
      for (const x of [-52, -14]) { wsh(S, circ(x * sc, -350 * sc, 9 * sc, 10 * sc, 14), mixc(C.gold, C.wood, .4), .95, 2, .3 * sc); ln(S, K([x - 9, -356]), K([x + 6, -370]), 5 * sc, C.cloth, { prof: 'leaf', a: .85 }); }
      parts.tower = K([-32, -300]);
    }
    if (o.mahout !== false) {
      // the driver astride the neck, facing forward: a pale tunic, a red sash, a wrapped head cloth, a bare arm reaching
      // forward with the goad, the near leg hanging down behind the ear
      const skin = mixc(C.skin, C.wood, .3), tunic = mixc(C.paperLight, C.clothC, .35);
      ln(S, K([112, -258]), K([124, -228]), 9 * sc, skin, { prof: 'leaf' });                         // thigh + shin
      ln(S, K([124, -228]), K([122, -204]), 7 * sc, skin, { prof: 'leaf' });
      const torso = smooth(KK([[100, -258], [120, -258], [124, -276], [120, -300], [106, -302], [100, -282]]), 1);
      under(S, torso); wsh(S, torso, tunic, .95, 3, .4 * sc);
      st(S, along(KK([[104, -300], [100, -280], [102, -262]]), 8), 4 * sc, dk(tunic, .25), { prof: 'leaf', a: .5 });
      ln(S, K([100, -266]), K([121, -266]), 5 * sc, C.cloth, { a: .9 });
      ink(S, torso, 1 * sc, .4, 2);
      ln(S, K([118, -296]), K([134, -284]), 6 * sc, skin, { prof: 'leaf' });                         // upper arm
      ln(S, K([134, -284]), K([148, -290]), 5 * sc, skin, { prof: 'leaf' });                         // forearm
      ln(S, K([146, -300]), K([156, -266]), 2.4 * sc, dk(C.wood, .2));                                 // goad
      ln(S, K([156, -266]), K([162, -270]), 2.4 * sc, mixc(C.stone, C.ink, .4));
      ln(S, K([108, -298]), K([112, -306]), 6 * sc, skin);                                             // neck
      wsh(S, circ(112 * sc, -315 * sc, 9 * sc, 10 * sc, 14), skin, .95, 2, .3 * sc);
      wsh(S, smooth(KK([[102, -318], [122, -320], [122, -328], [112, -334], [102, -328]]), 1), mixc(C.paperLight, C.stone, .3), .95, 2, .3 * sc);
      ln(S, K([118, -314]), K([121, -313]), 2.4 * sc, C.ink, { a: .7 });
    }
    // ear (live: fans slowly) and trunk (live: swings slowly) — built into separate sprites
    const earL = [], trL = [];
    const earP = pose === 'charge'
      ? smooth(KK([[104, -258], [124, -272], [136, -252], [140, -212], [128, -176], [108, -172], [96, -198]]), 2)
      : smooth(KK([[106, -256], [126, -262], [138, -240], [138, -204], [128, -176], [112, -172], [100, -196]]), 2);
    under(earL, earP);
    wsh(earL, earP, dk(coat, .08), .95, 3, .6 * sc);
    st(earL, along(earP.slice(earP.length * .25 | 0, earP.length * .7 | 0), 12), 5 * sc, shade, { prof: 'leaf', a: .5 });
    ink(earL, earP.slice(earP.length * .15 | 0, earP.length * .75 | 0), 1.3 * sc, .5);
    const trunkPts = pose === 'charge'
      ? [[166, -214], [184, -234], [198, -262], [204, -294], [198, -320], [184, -328]]
      : pose === 'walk'
        ? [[166, -206], [178, -168], [184, -126], [186, -86], [194, -54], [208, -44]]
        : [[166, -206], [176, -166], [180, -122], [180, -80], [186, -46], [200, -34]];
    const tr = mk(along(KK(trunkPts), 30), 34 * sc, coat, { prof: 'trunk', nb: 5, a: .97, rib: .95, rough: .1 });
    under(trL, tr.pts.map((p, i) => [p[0] + tr.nx[i] * tr.ws[i] * .45, p[1] + tr.ny[i] * tr.ws[i] * .45]).concat(tr.pts.map((p, i) => [p[0] - tr.nx[i] * tr.ws[i] * .45, p[1] - tr.ny[i] * tr.ws[i] * .45]).reverse()));
    trL.push(tr, WC.edgeOf(tr, 1, 1.5 * sc, C.ink, .45), WC.edgeOf(tr, -1, 1 * sc, C.inkSoft, .3));
    for (let k = 0; k < 9; k++) { const i = Math.round(3 + k * 2.6), p = tr.pts[Math.min(i, tr.pts.length - 2)], w = tr.ws[Math.min(i, tr.ws.length - 1)] * .42; ln(trL, [p[0] - tr.nx[i] * w, p[1] - tr.ny[i] * w], [p[0] + tr.nx[i] * w, p[1] + tr.ny[i] * w], 1.3 * sc, shade, { a: .45, bend: 2 * sc }); }
    // tusk + eye + mouth stay on the body sprite (the trunk swings in front of them)
    const tusk = pose === 'charge' ? [[156, -176], [188, -160], [214, -168], [226, -184]] : [[154, -174], [182, -154], [208, -156], [222, -170]];
    const tkL = [];
    const tk = st(tkL, along(KK(tusk), 12), 14 * sc, mixc(C.paperLight, C.clothC, .15), { prof: 'tip', a: 1, nb: 0 });
    st(tkL, along(KK(tusk).slice(0, 2), 6), 5 * sc, mixc(C.clothC, C.wood, .3), { prof: 'leaf', a: .35 });
    tkL.push(WC.edgeOf(tk, 1, 1.2 * sc, C.ink, .6), WC.edgeOf(tk, -1, .9 * sc, C.inkSoft, .4));
    ln(S, K([146, -170]), K([160, -164]), 3 * sc, dk(coat, .5), { a: .6 });
    ln(S, K([150, -228]), K([154, -227]), 3.4 * sc, C.ink, { a: .85 });
    ln(S, K([142, -236]), K([156, -238]), 1.4 * sc, shade, { a: .5, bend: -3 * sc });
    // ink along the back and the brow, last
    ink(S, smoothO(KK([[-160, -190], [-124, -240], [-64, -262], [-4, -266], [52, -252], [92, -240], [104, -278], [128, -292], [150, -286], [166, -262]]), 1), 1.5 * sc, .5);
    ink(S, smoothO(KK([[-120, -110], [-60, -102], [10, -100], [70, -110]]), 1), 1.2 * sc, .35);
    const earS = spr(earL), trS = spr(trL), tkS = spr(tkL);
    const earPiv = K([108, -238]), trPiv = K([166, -206]);
    // o.still: ear and trunk baked into the body (cards that draw no live parts); otherwise they are live sprites
    if (o.still) { S.push(...earL, ...trL, ...tkL); return { S, top: K([0, -410]), parts }; }
    const ph = rnd(0, 6.28);
    return {
      S, top: K([0, -410]), parts,
      live(c, lt) {
        // repaint ear and trunk over themselves with a slow swing (ear fans ±4°, trunk ±2.5°)
        const ea = Math.sin(lt * 1.3 + ph) * .07, ta = Math.sin(lt * .9 + ph * 1.7) * (pose === 'charge' ? .03 : .045);
        drawSpr(c, trS, trPiv[0], trPiv[1], ta);
        c.drawImage(tkS.cv, tkS.x0, tkS.y0);
        drawSpr(c, earS, earPiv[0], earPiv[1], ea);
      },
    };
  };

  // ------------------------------------------------------------------ pyr_hoplite
  WC.G.pyr_hoplite = (sc, o = {}) => {
    const S = [], K = p => [p[0] * sc, p[1] * sc], KK = L => L.map(K);
    const view = o.view === 'side' ? 'side' : 'back', king = !!o.king;
    const bronze = mixc(C.gold, C.wood, .45), bronzeD = dk(bronze, .35), cloak = king ? mixc(C.cloth, C.red, .35) : C.cloth;
    const skin = C.skin, crestC = king ? mixc(C.red, C.cloth, .3) : mixc(C.clothC, C.paper, .2);
    S.push(mk(along([[-50 * sc, 2 * sc], [0, 5 * sc], [55 * sc, 2 * sc]], 10), 14 * sc, mixc(C.ground, C.ink, .45), { prof: 'leaf', nb: 0, a: .25 }));
    if (view === 'back') {
      // legs (bronze greaves to the knee), sandals
      for (const x of [-11, 11]) {
        const leg = st(S, along(KK([[x, -84], [x * 1.05, -48], [x * 1.1, -4]]), 8), 13 * sc, skin, { prof: 'even', a: .96, rib: 1 });
        st(S, along(KK([[x * 1.05, -46], [x * 1.1, -8]]), 6), 14 * sc, bronze, { prof: 'even', a: .95, rib: 1 });
        S.push(WC.edgeOf(leg, 1, 1 * sc, C.ink, .4));
        ln(S, K([x * 1.1 - 6, -2]), K([x * 1.1 + 6, -2]), 5 * sc, dk(C.wood, .3));
      }
      // the spear, upright in the right hand
      if (o.spear !== false) {
        ln(S, K([34, 0]), K([36, -236]), 3.4 * sc, mixc(C.wood, C.ink, .15));
        wsh(S, KK([[31, -234], [41, -234], [37, -262]]), mixc(C.stone, C.ink, .3), .95, 2, .3 * sc);
      }
      // cloak from the shoulders to below the knee, hanging in folds
      const cl = smooth(KK([[-22, -146], [22, -146], [30, -120], [36, -60], [40, -40], [14, -36], [-12, -38], [-38, -42], [-34, -100], [-28, -130]]), 2);
      under(S, cl);
      wsh(S, cl, cloak, .96, 3, .6 * sc);
      for (const x of [-20, -4, 14, 28]) ln(S, K([x * .6, -138]), K([x, -44]), 5 * sc, dk(cloak, .3), { prof: 'leaf', a: .35, bend: 3 * sc });
      st(S, along(KK([[-18, -142], [0, -146], [20, -142]]), 6), 10 * sc, lite(cloak, .3), { prof: 'leaf', a: .4 });
      ink(S, cl.slice(4), 1.2 * sc, .4);
      // right arm to the spear
      ln(S, K([22, -138]), K([34, -110]), 9 * sc, skin, { prof: 'leaf' });
      // the round shield on the left arm, seen almost edge-on
      if (o.shield !== false) {
        const sh = circ(-40 * sc, -104 * sc, 13 * sc, 40 * sc, 24);
        under(S, sh); wsh(S, sh, bronze, .96, 3, .4 * sc);
        st(S, along(circ(-38 * sc, -104 * sc, 9 * sc, 34 * sc, 18).slice(4, 14), 10), 4 * sc, lite(bronze, .4), { a: .5 });
        ink(S, sh.concat([sh[0]]), 1.2 * sc, .5, 2);
      }
      // the head: neck, the bronze helmet, a tall crest running front to back
      ln(S, K([0, -146]), K([0, -156]), 10 * sc, skin);
      const hm = smooth(KK([[-12, -154], [12, -154], [14, -170], [8, -180], [-8, -180], [-14, -170]]), 2);
      under(S, hm); wsh(S, hm, bronze, .96, 3, .3 * sc);
      if (king) st(S, along(KK([[-13, -160], [13, -160]]), 4), 3 * sc, C.gold, { a: .9 });
      ink(S, hm, 1.1 * sc, .5);
      st(S, along(KK([[0, -180], [-1, -204], [2, -216]]), 8), 7 * sc, crestC, { prof: 'leaf', nb: 3 });
    } else {
      // side view facing right
      const back = ['raise'].includes(o.pose) ? 'raise' : 'stand';
      for (const [x0, x1, c] of [[-4, -10, dk(skin, .15)], [8, 12, skin]]) {
        const leg = st(S, along(KK([[x0, -84], [x0 + (x1 - x0) * .5, -46], [x1, -4]]), 8), 12 * sc, c, { prof: 'even', a: .96, rib: 1 });
        st(S, along(KK([[x0 + (x1 - x0) * .5, -44], [x1, -8]]), 6), 13 * sc, bronze, { prof: 'even', a: .95, rib: 1 });
        S.push(WC.edgeOf(leg, 1, 1 * sc, C.ink, .35));
        ln(S, K([x1 - 3, -2]), K([x1 + 9, -2]), 5 * sc, dk(C.wood, .3));
      }
      const cl = smooth(KK([[-8, -144], [-26, -120], [-34, -64], [-30, -48], [-12, -60], [-6, -110]]), 2);
      under(S, cl); wsh(S, cl, cloak, .95, 3, .5 * sc); ink(S, cl.slice(1, 6), 1 * sc, .4);
      const skirt = KK([[-12, -96], [16, -96], [20, -72], [-14, -72]]);
      under(S, skirt); wsh(S, skirt, mixc(C.paperLight, C.clothC, .3), .95, 3, .3 * sc);
      for (let k = 0; k < 5; k++) ln(S, K([-10 + k * 7, -94]), K([-11 + k * 7.6, -73]), 1.3 * sc, dk(C.clothC, .3), { a: .6 });
      const cu = smooth(KK([[-12, -144], [10, -146], [22, -130], [20, -110], [16, -94], [-12, -94], [-14, -120]]), 2);
      under(S, cu); wsh(S, cu, bronze, .96, 3, .4 * sc);
      st(S, along(KK([[14, -138], [20, -124], [18, -108]]), 6), 5 * sc, lite(bronze, .45), { a: .5 });
      ink(S, cu, 1.1 * sc, .5);
      if (back === 'raise') {
        ln(S, K([12, -138]), K([32, -164]), 9 * sc, skin, { prof: 'leaf' }); ln(S, K([32, -164]), K([38, -190]), 8 * sc, skin, { prof: 'leaf' });
      } else {
        ln(S, K([10, -136]), K([22, -112]), 9 * sc, skin, { prof: 'leaf' }); ln(S, K([22, -112]), K([34, -104]), 8 * sc, skin, { prof: 'leaf' });
      }
      if (o.spear !== false) { const x = back === 'raise' ? -24 : 36; ln(S, K([x, 0]), K([x + 2, -230]), 3.2 * sc, mixc(C.wood, C.ink, .15)); wsh(S, KK([[x - 3, -228], [x + 7, -228], [x + 3, -256]]), mixc(C.stone, C.ink, .3), .95, 2, .3 * sc); }
      ln(S, K([2, -146]), K([4, -154]), 9 * sc, skin);
      const hm = smooth(KK([[-12, -152], [10, -152], [16, -164], [12, -176], [-4, -182], [-14, -172]]), 2);
      under(S, hm); wsh(S, hm, bronze, .96, 3, .3 * sc);
      ln(S, K([8, -168]), K([15, -164]), 3 * sc, C.ink, { a: .7 });
      ink(S, hm, 1.1 * sc, .5);
      st(S, along(KK([[12, -180], [0, -196], [-16, -194], [-26, -178]]), 10), 8 * sc, crestC, { prof: 'leaf', nb: 3 });
      if (o.shield !== false && back !== 'raise') {
        const sh = circ(-6 * sc, -110 * sc, 36 * sc, 38 * sc, 26);
        under(S, sh); wsh(S, sh, bronze, .96, 3, .5 * sc);
        wsh(S, circ(-6 * sc, -110 * sc, 26 * sc, 28 * sc, 22), mixc(C.cloth, bronze, .3), .55, 2, .3 * sc);
        ink(S, sh.concat([sh[0]]), 1.3 * sc, .5, 2);
      }
    }
    const ph = rnd(0, 6.28);
    return {
      S, top: K([0, -240]),
      live(c, lt) {
        if (view !== 'back') return;
        // the crest and the cloak's hem stir in the wind (thin strokes over the sprite)
        const w = Math.sin(lt * 1.6 + ph);
        c.save(); c.lineCap = 'round';
        c.strokeStyle = WC.rgba(crestC, .85); c.lineWidth = 6 * sc;
        c.beginPath(); c.moveTo(0, -182 * sc); c.quadraticCurveTo((-3 + w * 3) * sc, -204 * sc, (3 + w * 6) * sc, -220 * sc); c.stroke();
        c.restore();
      },
    };
  };

  // ------------------------------------------------------------------ pyr_aspis
  WC.G.pyr_aspis = (sc, o = {}) => {
    const S = [], bronze = mixc(C.gold, C.wood, .45), rim = o.col ? WC.col(o.col) : C.cloth;
    S.push(mk(along([[-110 * sc, 6 * sc], [0, 12 * sc], [110 * sc, 6 * sc]], 10), 24 * sc, mixc(C.ground, C.ink, .45), { prof: 'leaf', nb: 0, a: .25 }));
    const outer = circ(0, -18 * sc, 100 * sc, 30 * sc, 30, -.06);
    under(S, outer); wsh(S, outer, bronze, .95, 3, .6 * sc);
    wsh(S, circ(0, -19 * sc, 84 * sc, 24 * sc, 28, -.06), mixc(rim, bronze, .25), .55, 2, .4 * sc);
    wsh(S, circ(-8 * sc, -20 * sc, 44 * sc, 12 * sc, 20, -.06), lite(bronze, .3), .5, 2, .4 * sc);
    st(S, along(circ(0, -18 * sc, 92 * sc, 27 * sc, 30, -.06).slice(16, 28), 14), 4 * sc, lite(bronze, .5), { a: .55 });
    ln(S, [30 * sc, -14 * sc], [52 * sc, -8 * sc], 4 * sc, bronzeD(bronze), { a: .5, bend: 3 * sc });
    ink(S, outer.concat([outer[0]]), 1.3 * sc, .5, 2);
    return { S, top: [0, -50 * sc] };
  };
  function bronzeD(c) { return mixc(c, C.ink, .4); }
})();
