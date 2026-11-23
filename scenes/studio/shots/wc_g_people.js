// wc_g_people — painted people and animals for the watercolor kit (WC.G; see wc__lib.js).
// Figures as in a watercolour history illustration: faceless (a skin dab and its shadow), realistic proportions,
// cloth = translucent washes with darker brush folds, limbs = tapered strokes, ink only on the shadow edges.
// Never stick figures, never cartoons. Local coords: origin on the ground (between the feet / hooves; eagle: its
// centre), y negative upward, sc 1 = natural size on a 1080p stage (adult ≈ 170 px, horse ≈ 155 px at the withers).
// Variation only from WC.rnd / WC.pick (seeded by WC.make), colours only from WC.C tokens.
//
// person   o: pose  'stand'|'walk'|'run'|'point'|'kneel'|'sit'|'fall'|'lie'|'raise' (arms up)|'carry'|'row'|'pray'|'look' (hand shading the eyes)
//             dress 'peasant'|'robe'|'ottoman' (kaftan, sash, turban)|'janissary' (tall white börk, kaftan)|'soldier' (helmet, tunic)|
//                   'roman' (legionary, scutum)|'knight' (mail + surcoat, kite shield)|'sailor'|'noble' (cape, plumed hat)|
//                   'modern' (19th–20th c. suit or coat, hat)|'worker'|'woman' (long dress, headscarf)|'child'
//             hold  'spear'|'sword'|'flag'|'staff'|'torch'|'lantern'|'book'|'oar'|'rifle'|'none'
//             face  'right' (default)|'left'|'front' (front only for stand/point/kneel/sit/raise/pray/look) · h: height ×
//             cols  {cloth, clothB (legs), clothC (sash, trim), skin, hair, hat, boots, flag, shield, cape} token names
//             shield true|false|'scutum'|'kite'|'round' · cape true|false|token · scarf false (woman: hair in a bun)
//             load 'sack'|'basket'|'jar' (pose carry) · seat 'ground'|'stool' (pose sit) · beard true|false
//             headgear (override) 'bare'|'turban'|'bork'|'helmet'|'galea'|'greathelm'|'coif'|'cap'|'straw'|'knit'|'fedora'|
//                      'bowler'|'feather'|'fur'|'scarf'|'hood'|'fez'
// crowd    a dense painted mass (back rows heads and shoulders, front row whole figures, raised arms, waving flags)
//          o: n (36), w (width px at sc 1, 520), rows, dress (name or array; default a mixed town crowd), arms (share of
//          raised arms, .18), flags (2), flag (token), face ('front'|'right'|'left', default mixed)
// army     ranks of soldiers with a forest of spears and banners, readable from afar
//          o: rows (4), n per row (12), w, dress 'soldier'|'ottoman'|'janissary'|'roman'|'knight', banner true|false|count,
//          weapon 'spear'|'pike'|'rifle', march true (stepping), face 'right'|'left'
// rider    horse + rider. o: pose 'stand'|'walk'|'gallop', dress, hold, coat (horse), barding (caparison; knights), cols, face
// horse    o: pose 'stand'|'walk'|'gallop', coat 'bay'|'chestnut'|'grey'|'black'|'dun'|'white', saddle, face
// camel    dromedary. o: pose 'stand'|'walk'|'sit' (couched), load (packs), face
// ox       o: pose 'stand'|'walk', col (coat token), face
// cart     o: style 'ox' (two solid wheels, kağnı)|'horse' (four-wheel wagon)|'covered' (canvas hood), animal 'ox'|'horse',
//          load 'hay'|'sacks'|'barrels'|'none', driver (a seated driver), face
// dog      o: pose 'stand'|'run'|'sit', col
// elephant o: pose 'stand'|'walk', howdah (war / royal elephant), tusks false, face
// eagle    big bird in flight seen from below, origin = centre. o: pose 'soar'|'flap', col
// cattle   herd. o: n (6), w (spread px at sc 1, 520)
// sheep    flock. o: n (12), w (420)
'use strict';

(() => {
  const C = WC.C;
  const { rnd, pick, mk, qcurve, along, washShape, edgeOf, mixc, clamp } = WC;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k], lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const len = a => Math.hypot(a[0], a[1]), unit = a => { const L = Math.hypot(a[0], a[1]) || 1; return [a[0] / L, a[1] / L]; };
  const perp = a => [-a[1], a[0]], dot = (a, b) => a[0] * b[0] + a[1] * b[1];
  const dk = (c, k = .3) => mixc(c, C.ink, k), lite = (c, k = .3) => mixc(c, C.paperLight, k);

  // ---------------------------------------------------------------- stroke helpers
  const st = (S, pts, w, c, o) => { const s = mk(pts, Math.max(.6, w), c, Object.assign({ prof: 'even', nb: 0 }, o)); S.push(s); return s; };
  const ln = (S, p, q, w, c, o = {}) => st(S, qcurve(p[0], p[1], q[0], q[1], o.bend || 0, o.n || 6), w, c, o);
  const chn = (S, pts, w, c, o = {}) => st(S, along(pts, o.n || 12), w, c, o);
  const wsh = (S, pts, c, a = .9, passes = 3, jit = 1) => { const s = washShape(pts, c, a, passes, jit); S.push(s); return s; };
  const ink = (S, pts, w, a = .55, step = 3) => { if (pts.length > 1) S.push(...WC.inkLine(pts, Math.max(.6, w), C.ink, { step, a })); };
  function oval(c, rx, ry, n = 14, j = .06, rot = 0) {
    const out = [], ph = rnd(0, 9), cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const t = i / n * Math.PI * 2, k = 1 + (WC.vnoise(ph + i * .8) - .5) * 2 * j, x = Math.cos(t) * rx * k, y = Math.sin(t) * ry * k;
      out.push([c[0] + x * cr - y * sr, c[1] + x * sr + y * cr]);
    }
    return out;
  }
  const circ = (c, r, n = 20, a0 = 0, a1 = Math.PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return [c[0] + Math.cos(t) * r, c[1] + Math.sin(t) * r]; });
  // point at fraction t of a polyline's length, with the parts before and after it
  function chainAt(pts, t) {
    const d = [0]; for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + len(sub(pts[i], pts[i - 1])));
    const L = d[d.length - 1] * clamp(t, 0, 1); let i = 1; while (i < pts.length - 1 && d[i] < L) i++;
    const p = lerp(pts[i - 1], pts[i], clamp((L - d[i - 1]) / ((d[i] - d[i - 1]) || 1)));
    return { p, before: pts.slice(0, i).concat([p]), after: [p].concat(pts.slice(i)) };
  }
  // translate / mirror a finished stroke list (mirroring keeps ribbons correct: normals flip with x)
  function xform(L, dx, dy, flip) {
    const f = flip ? -1 : 1, T = ([x, y]) => [x * f + dx, y + dy];
    for (const s of L) {
      if (s.poly) { s.poly = s.poly.map(r => r.map(T)); s.pts = s.pts.map(T); continue; }
      s.pts = s.pts.map(T); if (flip) s.nx = s.nx.map(v => -v);
    }
    return L;
  }
  // the object's live() from a list of draw functions (in facing-right coordinates)
  const liveOf = (L, dir = 1) => L.length ? (c, lt, it) => { c.save(); if (dir < 0) c.scale(-1, 1); for (const f of L) f(c, lt, it); c.restore(); } : undefined;
  // Chaikin corner cutting: a closed polygon becomes a rounded painted outline
  function smooth(pts, it = 2) { let P = pts; for (let k = 0; k < it; k++) { const out = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; out.push(lerp(a, b, .25), lerp(a, b, .75)); } P = out; } return P; }
  // convex hull (monotone chain): the outline of a robe hanging over the legs
  function hull(P) {
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  // the contiguous run of polygon points on one side (dot(p - c, dir) < 0), starting nearest to `from`
  function sideRun(poly, c, dir, from) {
    const N = poly.length, inS = poly.map(q => dot(sub(q, c), dir) < 0), s0 = inS.findIndex((v, i) => v && !inS[(i - 1 + N) % N]);
    if (s0 < 0) return [];
    const out = []; for (let k = 0; k < N; k++) { const i = (s0 + k) % N; if (!inS[i]) break; out.push(poly[i]); }
    return out.length > 1 && from && len(sub(out[0], from)) > len(sub(out[out.length - 1], from)) ? out.reverse() : out;
  }
  const interp = (tb, t, k) => { for (let i = 1; i < tb.length; i++) if (t <= tb[i][0]) { const f = (t - tb[i - 1][0]) / (tb[i][0] - tb[i - 1][0]); return tb[i - 1][k] + (tb[i][k] - tb[i - 1][k]) * f; } return tb[tb.length - 1][k]; };
  const shadow = (S, x, w, h, a = .22) => wsh(S, oval([x, -h * .2], w, h, 14, .1), mixc(C.ground, C.ink, .45), a, 2, .5);

  // ---------------------------------------------------------------- live bits: flags, torch, lantern
  // f: {x, y (top of the cloth at the pole), w, h, col, dark, ph, dir (-1: flies to the left), mark, taper (pennant), droop}
  function flagDraw(c, lt, f) {
    const N = 9, top = [], bot = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, amp = f.h * .12 * Math.min(1, u * 2);
      const wv = Math.sin(u * 4.4 - lt * 4.2 + f.ph) * amp, x = f.x + f.dir * f.w * u * (1 - .035 * (1 + Math.sin(lt * 1.7 + f.ph)));
      const hh = f.h * (1 - (f.taper || 0) * u * .9), y = f.y + wv + u * f.h * (f.droop ?? .08);
      top.push([x, y]); bot.push([x, y + hh]);
    }
    const poly = top.concat(bot.slice().reverse());
    for (let p = 0; p < 2; p++) {
      c.beginPath();
      poly.forEach(([x, y], i) => { const j = p ? (WC.hash(i * 3.1 + f.ph) - .5) * f.h * .05 : 0; i ? c.lineTo(x + j, y + j) : c.moveTo(x + j, y + j); });
      c.closePath(); c.fillStyle = WC.rgba(f.col, .52); c.fill();
    }
    c.lineCap = 'round';
    for (let i = 1; i < N; i++) {
      const s = Math.cos(i / N * 4.4 - lt * 4.2 + f.ph); if (s > -.25) continue;
      c.strokeStyle = WC.rgba(f.dark, .32 * -s); c.lineWidth = f.w / N * 1.1;
      c.beginPath(); c.moveTo(top[i][0], top[i][1] + 1); c.lineTo(bot[i][0], bot[i][1] - 1); c.stroke();
    }
    c.strokeStyle = WC.rgba(f.dark, .45); c.lineWidth = Math.max(1, f.h * .03);
    c.beginPath(); top.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    if (f.mark === 'crescent' || f.mark === 'cross') {
      const i = Math.round(N * .4), m = lerp(top[i], bot[i], .5), r = f.h * .2 * (1 - (f.taper || 0) * .4);
      c.fillStyle = WC.rgba(C.paperLight, .85); c.strokeStyle = WC.rgba(C.paperLight, .85);
      if (f.mark === 'crescent') { c.beginPath(); c.arc(m[0], m[1], r, 0, Math.PI * 2); c.arc(m[0] - f.dir * r * .38, m[1] - r * .08, r * .82, Math.PI * 2, 0, true); c.fill(); }
      else { c.lineWidth = r * .45; c.beginPath(); c.moveTo(m[0], m[1] - r * 1.3); c.lineTo(m[0], m[1] + r * 1.3); c.moveTo(m[0] - r * 1.1, m[1] - r * .2); c.lineTo(m[0] + r * 1.1, m[1] - r * .2); c.stroke(); }
    }
  }
  function glow(c, x, y, r, a) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, WC.rgba(C.gold, a)); g.addColorStop(.4, WC.rgba(C.fire, a * .35)); g.addColorStop(1, WC.rgba(C.gold, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // ---------------------------------------------------------------- person: skeletons (H units, facing right)
  const STAND = { hp: [0, -.5], kn: [.028, -.272], an: [.03, -.032], kn2: [-.002, -.276], an2: [-.022, -.032] };
  const POSE = {
    stand: Object.assign({}, STAND, { nk: [.012, -.835], hd: [.024, -.925], el: [.032, -.63], ha: [.05, -.47], el2: [-.035, -.63], ha2: [-.045, -.475] }),
    walk: { hp: [0, -.49], nk: [.035, -.825], hd: [.056, -.913], kn: [.1, -.29], an: [.165, -.033], kn2: [-.03, -.27], an2: [-.15, -.062], ft2: [.055, .045],
      el: [-.035, -.635], ha: [-.08, -.49], el2: [.085, -.635], ha2: [.145, -.5] },
    run: { hp: [0, -.53], nk: [.11, -.84], hd: [.15, -.925], kn: [.18, -.4], an: [.13, -.17], ft: [.06, .035], kn2: [-.06, -.31], an2: [-.23, -.16], ft2: [.035, .06],
      el: [-.03, -.67], ha: [-.13, -.6], el2: [.2, -.7], ha2: [.25, -.8] },
    point: Object.assign({}, STAND, { nk: [.02, -.835], hd: [.036, -.925], el: [.19, -.795], ha: [.34, -.81], el2: [-.035, -.63], ha2: [-.045, -.475] }),
    kneel: { hp: [-.03, -.3], nk: [0, -.635], hd: [.014, -.725], kn: [.19, -.255], an: [.2, -.032], kn2: [.02, -.04], an2: [-.2, -.035], ft2: [-.06, .02],
      el: [.1, -.45], ha: [.18, -.31], el2: [-.01, -.45], ha2: [.06, -.33] },
    sit: { hp: [-.04, -.07], nk: [-.03, -.405], hd: [-.018, -.495], kn: [.15, -.2], an: [.22, -.035], ft: [.06, .0], kn2: [.15, -.07], an2: [.03, -.04], ft2: [.06, .01],
      el: [.04, -.22], ha: [.14, -.2], el2: [-.08, -.22], ha2: [-.12, -.06] },
    fall: { hp: [-.05, -.4], nk: [-.29, -.64], hd: [-.355, -.705], kn: [.13, -.52], an: [.35, -.58], ft: [.045, -.04], kn2: [.1, -.22], an2: [.16, -.032],
      el: [-.2, -.79], ha: [-.1, -.9], el2: [-.42, -.75], ha2: [-.5, -.88] },
    lie: { hp: [.02, -.075], nk: [-.31, -.08], hd: [-.4, -.082], kn: [.24, -.095], an: [.47, -.055], ft: [.012, -.06], kn2: [.24, -.065], an2: [.48, -.04], ft2: [.018, -.055],
      el: [-.14, -.055], ha: [.03, -.055], el2: [-.18, -.035], ha2: [-.01, -.03] },
    raise: Object.assign({}, STAND, { nk: [.01, -.835], hd: [.02, -.925], el: [.07, -.985], ha: [.09, -1.135], el2: [-.055, -.985], ha2: [-.065, -1.135] }),
    carry: { hp: [0, -.49], nk: [.05, -.82], hd: [.085, -.895], kn: [.075, -.285], an: [.12, -.033], kn2: [-.025, -.275], an2: [-.1, -.05], ft2: [.055, .04],
      el: [.1, -.67], ha: [.03, -.86], el2: [.06, -.63], ha2: [.1, -.49] },
    row: { hp: [-.16, -.21], nk: [-.27, -.52], hd: [-.29, -.61], kn: [.04, -.27], an: [.1, -.035], ft: [.06, .0], kn2: [.02, -.255], an2: [.08, -.04], ft2: [.06, .0],
      el: [-.12, -.43], ha: [.03, -.41], el2: [-.15, -.41], ha2: [.01, -.39] },
    pray: { hp: [-.07, -.14], nk: [-.03, -.47], hd: [-.004, -.552], kn: [.15, -.035], an: [-.11, -.03], ft: [-.06, .015], kn2: [.13, -.035], an2: [-.13, -.03], ft2: [-.06, .015],
      el: [.06, -.36], ha: [.13, -.48], el2: [.03, -.35], ha2: [.1, -.47] },
    look: Object.assign({}, STAND, { nk: [.025, -.835], hd: [.044, -.92], el: [.13, -.79], ha: [.08, -.935], el2: [-.075, -.64], ha2: [-.02, -.555] }),
  };
  const STOOL = { hp: [-.03, -.27], nk: [-.01, -.605], hd: [0, -.695], kn: [.17, -.28], an: [.17, -.035], ft: [.06, .01], kn2: [.15, -.27], an2: [.13, -.035], ft2: [.06, .01],
    el: [.03, -.42], ha: [.15, -.3], el2: [-.02, -.42], ha2: [.12, -.3] };
  const FRONT_OK = ['stand', 'point', 'kneel', 'sit', 'raise', 'pray', 'look'];

  function joints(pose, o, front) {
    const J = {}, base = pose === 'sit' && o.seat === 'stool' ? STOOL : POSE[pose];
    for (const k in base) J[k] = base[k].slice();
    J.ft = J.ft || [.065, .028]; J.ft2 = J.ft2 || [.06, .028];
    const h = o.hold, upright = ['stand', 'walk', 'look'].includes(pose), mid = t => lerp(J.hp, J.nk, t);
    if (h === 'torch' && upright) { J.el = [.1, -.68]; J.ha = [.16, -.79]; }
    if (h === 'lantern' && upright) { J.el = [.07, -.62]; J.ha = [.14, -.56]; }
    if (h === 'book' && pose !== 'lie' && pose !== 'fall' && pose !== 'row') { J.el = add(mid(.32), [.05, 0]); J.ha = add(mid(.6), [.12, 0]); J.el2 = add(mid(.34), [-.01, 0]); J.ha2 = add(mid(.58), [.09, .01]); }
    if (h === 'rifle' && (pose === 'walk' || pose === 'run')) { J.el = add(mid(.42), [.05, 0]); J.ha = add(mid(.55), [.1, 0]); }
    if (h === 'rifle' && pose === 'point') { J.el2 = add(J.nk, [.12, .12]); J.ha2 = add(J.nk, [.28, .05]); J.ha = add(J.nk, [.07, .06]); J.el = add(J.nk, [-.05, .16]); }
    if (pose === 'carry' && o.load === 'basket') { J.nk = [.015, -.835]; J.hd = [.022, -.925]; J.el = [.1, -.96]; J.ha = [.06, -1.05]; }
    if (front) {
      J.hp[0] = J.nk[0] = J.hd[0] = 0;
      const lat = (k, s, b, f) => { J[k] = [s * (b + Math.abs(J[k][0]) * f), J[k][1]]; };
      lat('kn', 1, .05, .3); lat('an', 1, .058, .3); lat('kn2', -1, .05, .3); lat('an2', -1, .058, .3);
      lat('el', 1, .118, .6); lat('ha', 1, .12, .6); lat('el2', -1, .118, .6); lat('ha2', -1, .12, .6);
      if (pose === 'pray' || h === 'book') { J.ha = [.035, J.ha[1]]; J.ha2 = [-.035, J.ha2[1]]; J.el = [.11, J.el[1]]; J.el2 = [-.11, J.el2[1]]; }
      if (pose === 'look') J.ha = [.045, J.ha[1]];
      if (pose === 'sit' || pose === 'kneel') { J.kn = [.1, J.kn[1]]; J.kn2 = [-.1, J.kn2[1]]; if (h !== 'book') { J.el = [.15, J.el[1]]; J.ha = [.1, J.ha[1]]; J.el2 = [-.15, J.el2[1]]; J.ha2 = [-.1, J.ha2[1]]; } }
      J.ft = [.018, .026]; J.ft2 = [-.018, .026];
    }
    return J;
  }

  // ---------------------------------------------------------------- person: dress
  function dressSpec(d, o) {
    const steel = mixc(C.stone, C.far, .5);
    const sp = {
      dress: d, h: 1, hs: 1, L: .45, fl: 1, tw: 1, armW: .058, legW: 1, beltW: .026, head: 'bare', beard: 0,
      skin: pick([C.skin, mixc(C.skin, C.wood, .22), mixc(C.skin, C.paperLight, .12), mixc(C.skin, C.wood, .4)]),
      hair: pick([mixc(C.ink, C.wood, .35), mixc(C.wood, C.ink, .45), mixc(C.ink, C.inkSoft, .3), mixc(C.inkSoft, C.paperDark, .2)]),
      boots: mixc(C.wood, C.ink, .45), belt: mixc(C.wood, C.ink, .3), steel, steelD: mixc(steel, C.ink, .35),
    };
    const rustic = () => pick([mixc(C.clothC, C.paper, .15), mixc(C.ground, C.wood, .3), mixc(C.cloth, C.clothC, .45), mixc(C.stone, C.wood, .25), mixc(C.leaf, C.ground, .35), mixc(C.clothB, C.paper, .3)]);
    switch (d) {
      case 'robe': Object.assign(sp, { top: pick([mixc(C.wood, C.paper, .2), mixc(C.clothB, C.stone, .2), mixc(C.stone, C.wood, .3), mixc(C.cloth, C.wood, .45)]), L: 1, fl: 1.25, armW: .07,
        belt: mixc(C.clothC, C.wood, .3), beltW: .016, head: pick(['bare', 'bare', 'hood']), hat: mixc(C.wood, C.paper, .1), beard: rnd() < .7 ? 1 : 0, legs: mixc(C.wood, C.ink, .2), boots: mixc(C.wood, C.ink, .35) }); break;
      case 'ottoman': Object.assign(sp, { top: pick([C.cloth, C.clothB, C.leafDark, mixc(C.cloth, C.clothC, .35)]), L: .98, fl: 1.35, armW: .072, belt: C.clothC, beltW: .046, sash: true,
        head: 'turban', hatTop: pick([C.cloth, C.red, C.clothB]), opening: lite(C.clothC, .15), beard: rnd() < .85 ? 2 : 1, legs: C.clothB, boots: mixc(C.clothC, C.wood, .3), curved: true, flagMark: 'crescent' }); break;
      case 'janissary': Object.assign(sp, { top: pick([C.clothB, mixc(C.clothB, C.cloth, .2), C.cloth]), L: .8, fl: 1.15, armW: .066, belt: C.clothC, beltW: .042, sash: true,
        head: 'bork', moustache: true, legs: mixc(C.cloth, C.ink, .12), boots: mixc(C.cloth, C.ink, .3), highBoots: true, curved: true, flagMark: 'crescent' });
        sp.opening = sp.top === C.cloth ? C.clothB : C.cloth; break;
      case 'soldier': Object.assign(sp, { top: pick([C.clothB, mixc(C.cloth, C.wood, .3), mixc(C.leafDark, C.ground, .25)]), L: .38, head: pick(['helmet', 'kettle']), strap: true,
        highBoots: true, boots: mixc(C.wood, C.ink, .5) }); break;
      case 'roman': Object.assign(sp, { top: C.cloth, L: .34, head: 'galea', crest: o.crest ?? rnd() < .5, armor: 'segmentata', shield: 'scutum', shieldC: C.cloth,
        boots: mixc(C.wood, C.ink, .25), steel: mixc(steel, C.clothC, .15) });
        sp.legs = sp.skin; break;
      case 'knight': Object.assign(sp, { top: pick([C.cloth, C.clothB, mixc(C.clothC, C.paper, .1), C.leafDark]), L: .58, fl: 1.1, armW: .062, head: pick(['greathelm', 'greathelm', 'kettle']),
        sleeve: steel, legs: steel, keepSleeve: true, mail: true, shield: 'kite', boots: mixc(steel, C.ink, .4), gauntlet: true, flagMark: 'cross' });
        sp.shieldC = pick([C.clothB, C.cloth, C.clothC].filter(c => c !== sp.top)); sp.device = sp.shieldC === C.clothC ? C.cloth : C.clothC; break;
      case 'sailor': Object.assign(sp, { top: C.clothB, L: .1, legs: mixc(C.stone, C.paperLight, .35), legW: 1.15, boots: pick([mixc(C.ink, C.wood, .3), mixc(C.skin, C.wood, .2)]),
        head: pick(['knit', 'knit', 'bare', 'cap']), hat: pick([C.cloth, mixc(C.clothB, C.ink, .3)]), kerchief: C.red, belt: null }); break;
      case 'noble': Object.assign(sp, { top: pick([C.clothB, C.cloth, mixc(C.leafDark, C.clothB, .4)]), L: .62, fl: 1.2, armW: .066, legs: mixc(C.ink, C.clothB, .3), boots: mixc(C.wood, C.ink, .5),
        highBoots: true, fur: true, head: pick(['feather', 'feather', 'fur']), hat: mixc(C.ink, C.clothB, .3), beard: rnd() < .6 ? 1 : 0, belt: C.clothC });
        sp.cape = pick([C.cloth, C.clothB, mixc(C.cloth, C.ink, .2)].filter(c => c !== sp.top)); break;
      case 'modern': { const coat = rnd() < .4;
        Object.assign(sp, { top: pick([mixc(mixc(C.ink, C.night, .3), C.paper, .22), mixc(C.wood, C.ink, .4), mixc(C.clothB, C.ink, .4), mixc(C.stone, C.ink, .45)]), L: coat ? .55 : .2, fl: .9,
          boots: mixc(C.ink, C.wood, .2), head: pick(['fedora', 'bowler', 'bare', 'fedora']), hat: mixc(C.ink, C.wood, .25), collar: true, belt: null });
        sp.legs = coat ? mixc(C.stone, C.ink, .5) : dk(sp.top, .12); break; }
      case 'worker': Object.assign(sp, { top: pick([mixc(C.clothB, C.paper, .35), mixc(C.stone, C.paperLight, .15), mixc(C.clothC, C.paper, .3)]), L: 0, sleeveRoll: true,
        legs: pick([mixc(C.clothB, C.ink, .2), mixc(C.wood, C.ink, .2)]), apron: rnd() < .5, apronC: mixc(C.wood, C.ground, .3), head: pick(['cap', 'cap', 'bare']), hat: mixc(C.wood, C.ink, .3) }); break;
      case 'woman': Object.assign(sp, { top: pick([C.cloth, C.clothB, mixc(C.clothC, C.wood, .15), mixc(C.leaf, C.ground, .3), mixc(C.cloth, C.wood, .35)]), L: 1.04, fl: 1.45, tw: .88, h: .94, armW: .054,
        belt: rnd() < .5 ? null : mixc(C.clothC, C.wood, .2), beltW: .02, head: o.scarf === false ? 'bun' : 'scarf',
        hat: pick([mixc(C.paperLight, C.stone, .3), mixc(C.clothC, C.paper, .35), mixc(C.cloth, C.paper, .45), mixc(C.clothB, C.paper, .5)]), apron: rnd() < .3, apronC: mixc(C.paperLight, C.stone, .3) }); break;
      case 'child': Object.assign(sp, { top: rustic(), L: .5, h: .62, hs: 1.28, head: 'bare', armW: .065, legs: mixc(C.wood, C.paper, .4) }); break;
      default: Object.assign(sp, { dress: 'peasant', top: rustic(), L: .45, legs: mixc(C.wood, C.paper, .4), head: pick(['bare', 'bare', 'cap', 'straw']),
        hat: pick([mixc(C.wood, C.ink, .2), mixc(C.clothB, C.ink, .2)]), beard: rnd() < .4 ? 1 : 0 });
    }
    sp.skirt = sp.skirt || sp.top; sp.sleeve = sp.sleeve || sp.top; sp.legs = sp.legs || mixc(sp.top, C.ink, .25);
    const c = o.cols || {}, col = WC.col;
    if (c.cloth) { sp.top = sp.skirt = col(c.cloth); if (!sp.keepSleeve) sp.sleeve = sp.top; }
    if (c.clothB) sp.legs = col(c.clothB);
    if (c.clothC) { sp.belt = col(c.clothC); if (sp.opening) sp.opening = col(c.clothC); }
    for (const k of ['skin', 'hair', 'hat', 'boots']) if (c[k]) sp[k] = col(c[k]);
    if (c.shield) sp.shieldC = col(c.shield);
    if (c.flag) sp.flag = col(c.flag);
    if (o.shield === false) sp.shield = null; else if (typeof o.shield === 'string') sp.shield = o.shield; else if (o.shield === true && !sp.shield) sp.shield = 'round';
    if (o.cape === false) sp.cape = null; else if (typeof o.cape === 'string') sp.cape = col(o.cape); else if (o.cape === true && !sp.cape) sp.cape = C.cloth;
    if (c.cape) sp.cape = col(c.cape);
    if (o.beard === false) sp.beard = 0; else if (o.beard === true && !sp.beard) sp.beard = 1;
    if (o.headgear) sp.head = o.headgear;
    if (o.hold === 'flag' && sp.shield === 'kite') sp.shield = null;
    sp.shieldC = sp.shieldC || mixc(C.wood, C.paper, .15);
    return sp;
  }

  // ---------------------------------------------------------------- person: painter
  // P: joints in px; E: ink accents (appended last); live: draw functions
  function paintPerson(S, P, H, sp, o, live) {
    const front = !!o.front, pose = o.pose, E = [];
    const a = unit(sub(P.nk, P.hp)), n = front ? [1, 0] : perp(a), tl = len(sub(P.nk, P.hp));
    const T = (t, w) => add(add(P.hp, mul(a, tl * t)), mul(n, w * H));
    const PR = front ? [[0, .085, .085], [.3, .074, .074], [.7, .096, .096], [.92, .108, .108], [1, .04, .04]]
      : [[0, .07, .062], [.3, .054, .056], [.7, .066, .072], [.92, .062, .05], [1, .032, .03]];
    const bw = t => interp(PR, t, 1) * sp.tw, fw = t => interp(PR, t, 2) * sp.tw;
    const sh = front ? T(.93, .095 * sp.tw) : T(.94, 0), sh2 = front ? T(.93, -.095 * sp.tw) : T(.92, -.035);
    const hipN = front ? T(0, .045) : T(0, .012), hipF = front ? T(0, -.045) : T(0, -.02);
    const legN = [hipN, P.kn, P.an], legF = [hipF, P.kn2, P.an2];
    const lw = H * .082 * sp.legW, aw = H * sp.armW, skin = sp.skin, ew = Math.max(.6, H * .011);
    const L = pose === 'fall' ? Math.min(sp.L || 0, .4) : (sp.L || 0), hemN = L > 0 ? chainAt(legN, L) : null, hemF = L > 0 ? chainAt(legF, L) : null;

    // 1. shadow on the ground
    if (!o.noShadow) {
      const cx = pose === 'lie' ? (P.hd[0] + P.an[0]) / 2 : (P.an[0] + P.an2[0] + P.hp[0]) / 3;
      shadow(S, cx, H * (pose === 'lie' ? .5 : pose === 'sit' || pose === 'row' || pose === 'kneel' || pose === 'pray' ? .26 : .17), H * .024);
    }
    // 2. cape (behind everything)
    if (sp.cape && pose !== 'lie') {
      const fly = pose === 'run' ? .22 : pose === 'walk' ? .09 : .03, low = y => Math.min(y, -H * .015);
      const hb = add(P.hp, [-(.1 + fly) * H, .3 * H]), hf = add(P.hp, [.0, .3 * H]);
      const poly = [T(.99, -.01), T(.93, -bw(.93) - .016), T(.5, -bw(.5) - .05 - fly * .3), [hb[0], low(hb[1])], [hf[0], low(hf[1])], T(.4, -.01)];
      wsh(S, poly, sp.cape, .9, 3, H * .004);
      for (const u of [.3, .6]) ln(S, lerp(poly[1], poly[5], u * .5), lerp(poly[3], poly[4], u), H * .013, dk(sp.cape, .35), { a: .45 });
      ink(E, [poly[1], poly[2], poly[3]], ew, .45);
    }
    const armPaint = (s0, e0, h0, c0, sk) => {
      wsh(S, oval(add(s0, mul(unit(sub(e0, s0)), aw * .2)), aw * (front ? .45 : .55), aw * .52, 10, .06), c0, .9, 2, H * .002);
      const up = ln(S, s0, e0, aw, c0, { nb: aw > 9 ? 2 : 0 });
      S.push(edgeOf(up, front ? -1 : 1, aw * .2, dk(c0, .35), .35));
      ln(S, e0, h0, aw * (sp.sleeveRoll ? .6 : .84), sp.sleeveRoll ? sk : c0);
      if (sp.mail) for (let k = 0; k < 3; k++) ln(S, lerp(s0, h0, .2 + k * .25), add(lerp(s0, h0, .2 + k * .25), [H * .012, H * .004]), H * .008, sp.steelD, { a: .5 });
      const d = unit(sub(h0, e0));
      ln(S, add(h0, mul(d, -H * .005)), add(h0, mul(d, H * .042)), H * .033, sp.gauntlet ? sp.steelD : sk, { prof: 'leaf' });
      return up;
    };
    // 3. far arm (behind the body)
    armPaint(sh2, P.el2, P.ha2, front ? sp.sleeve : dk(sp.sleeve, .22), front ? skin : dk(skin, .15));
    // 4–5. legs (only the shins below a knee-length or longer robe), feet
    for (const [leg, hem, ft, near] of [[legF, hemF, P.ft2, false], [legN, hemN, P.ft, true]]) {
      if (o.noFarLeg && !near) continue;
      const lc = near || front ? sp.legs : dk(sp.legs, .2), bc = near || front ? sp.boots : dk(sp.boots, .2);
      if (!hem || L < .5) {
        const th = ln(S, leg[0], leg[1], lw * 1.05, lc, { nb: lw > 9 ? 2 : 0, bend: (near ? -1 : 1) * H * .006 });
        const sn = ln(S, add(leg[1], mul(unit(sub(leg[2], leg[1])), -H * .02)), leg[2], lw * 1.02, lc, { prof: 'brush', bend: H * .006 });
        if (near) E.push(edgeOf(sn, 1, ew, C.ink, .4), edgeOf(th, 1, ew, C.ink, .3));
        else wsh(S, oval(leg[1], lw * .4, lw * .45, 8, .05), lc, .5, 1, H * .002);
      } else if (len(sub(leg[2], hem.p)) > H * .02) chn(S, hem.after, lw * .7, lc, { n: 6 });
      if (sp.highBoots) { const b = chainAt(leg, Math.max(.66, L < .5 ? 0 : L)); if (len(sub(leg[2], b.p)) > H * .02) chn(S, b.after, lw * .8, bc, { n: 6 }); }
      if (sp.mail && near && (!hem || L < .5)) for (let k = 0; k < 3; k++) { const p = chainAt(leg, .3 + k * .22).p; ln(S, p, add(p, [H * .014, 0]), H * .008, sp.steelD, { a: .5 }); }
      const an = leg[2];
      ln(S, add(an, mul(unit(ft), -H * .014)), add(an, ft), H * .037, bc);
    }
    // 6. robe / tunic skirt
    if (L > 0) {
      const sk = sp.skirt, skD = dk(sk, .28), r0 = lw * .6;
      let dN = sub(hemN.p, hemF.p); if (len(dN) < H * .03) dN = front ? [1, 0] : n.slice(); dN = unit(dN);
      const flare = H * (L > .8 ? .046 : .034) * sp.fl * Math.min(1, L * 1.3);
      const hN = add(hemN.p, add(mul(dN, flare), [0, H * .006 * L])), hF = add(hemF.p, add(mul(dN, -flare), [0, H * .006 * L]));
      const wB = T(.24, -bw(.24) - .004), wF = T(.24, fw(.24) + .004);
      const nf = dot(sub(hN, hF), n) >= 0, hFr = nf ? hN : hF, hBk = nf ? hF : hN;
      const hMid = add(lerp(hBk, hFr, .5), [0, H * .014 * L]);
      const cloud = [wB, wF, hFr, hBk, hMid, T(.36, -bw(.36)), T(.36, fw(.36))];
      for (const ch of [hemN.before, hemF.before]) for (const p of along(ch, 5)) for (let k = 0; k < 8; k++) cloud.push(add(p, [Math.cos(k * .785) * r0, Math.sin(k * .785) * r0]));
      const hl = hull(cloud), mid0 = lerp(lerp(wB, wF, .5), lerp(hBk, hFr, .5), .5);
      wsh(S, hl, sk, .9, 3, H * .004);
      const backRun = sideRun(hl, add(mid0, mul(n, -H * .01)), n, wB);
      if (backRun.length > 1) wsh(S, backRun.concat([lerp(hBk, hFr, .34), lerp(wB, wF, .3)]), skD, .3, 2, H * .003);
      const nfo = L > .6 ? 3 : 2;
      for (let k = 1; k <= nfo; k++) { const u = k / (nfo + 1); ln(S, lerp(wB, wF, u + rnd(-.05, .05)), lerp(hBk, hFr, u + rnd(-.1, .1)), H * .013, skD, { a: .5, bend: rnd(-1, 1) * H * .012 }); }
      E.push(ln([], hBk, hFr, H * .011, dk(sk, .45), { a: .5, bend: -H * .008 }));
      ink(E, backRun.length > 1 ? backRun : [wB, hBk], ew, .45);
      if (sp.opening) ln(S, T(.24, front ? 0 : fw(.24) * .95), front ? lerp(hBk, hFr, .5) : lerp(hBk, hFr, .86), H * .018, sp.opening, { a: .85 });
      if (sp.apron) wsh(S, [T(.3, front ? -.05 : fw(.3) * .1), T(.3, front ? .05 : fw(.3) + .004), lerp(hBk, hFr, front ? .7 : .98), lerp(hBk, hFr, front ? .3 : .55)], sp.apronC, .8, 2, H * .003);
    }
    // 7. torso
    const top = sp.top, topD = dk(top, .3), ts = [0, .3, .7, .92, 1];
    const tb = ts.map(t => T(t, -bw(t))), tf = ts.slice().reverse().map(t => T(t, fw(t)));
    wsh(S, tb.concat(tf), top, .92, 3, H * .004);
    wsh(S, tb.concat(ts.slice().reverse().map(t => T(t, front ? -bw(t) * .1 : fw(t) * -.05))), topD, .3, 2, H * .003);
    ln(S, T(.9, front ? -bw(.9) * .1 : -.01), T(.08, front ? -bw(.08) * .1 : -.005), H * .012, topD, { a: .28 });
    ln(S, T(.86, .012), T(.42, fw(.42) * .55), H * .012, topD, { a: .42, bend: H * .01 });
    ln(S, T(.8, -bw(.8) * .55), T(.34, -bw(.34) * .15), H * .011, topD, { a: .34, bend: -H * .008 });
    ink(E, tb, ew, .5);
    if (sp.armor === 'segmentata') {
      for (const t of [.42, .52, .62, .72, .82]) ln(S, T(t, -bw(t) - .004), T(t, fw(t) + .004), H * .03, sp.steel, { a: .88, bend: H * .004 });
      for (const t of [.47, .57, .67, .77]) ln(S, T(t, -bw(t)), T(t, fw(t)), H * .006, sp.steelD, { a: .7 });
      ln(S, T(1, -bw(.95) * .9), T(.8, fw(.8) * .95), H * .042, sp.steel, { bend: -H * .02, a: .9 });
      for (const u of [-.05, -.018, .014, .046]) ln(S, T(.24, front ? u * 1.4 : u), add(T(.24, front ? u * 1.4 : u), mul(a, -H * .11)), H * .012, mixc(C.wood, C.ink, .35), { a: .85 });
    }
    if (sp.device) { ln(S, T(.88, front ? 0 : fw(.88) * .25), T(.3, front ? 0 : fw(.3) * .35), H * .026, sp.device, { a: .85 }); ln(S, T(.68, -bw(.68) * .7), T(.68, fw(.68) * .95), H * .026, sp.device, { a: .85 }); }
    if (sp.strap) ln(S, T(.95, -bw(.95) * .6), T(.28, fw(.28) * .9), H * .016, mixc(C.wood, C.ink, .3));
    if (sp.collar) { ln(S, T(1, front ? -.03 : fw(1) * .2), T(.86, front ? 0 : fw(.86) * .85), H * .02, mixc(C.paperLight, C.stone, .25)); if (front) ln(S, T(1, .03), T(.86, 0), H * .02, mixc(C.paperLight, C.stone, .25)); ln(S, T(.9, front ? 0 : fw(.9) * .75), T(.62, front ? 0 : fw(.62) * .9), H * .013, dk(C.cloth, .2)); }
    if (sp.kerchief) ln(S, T(1, -bw(1)), T(.86, front ? 0 : fw(.86)), H * .026, sp.kerchief, { prof: 'leaf' });
    if (sp.fur) ln(S, T(1.01, -bw(.96) * 1.1), T(.88, fw(.88) * 1.05), H * .042, mixc(C.wood, C.ink, .25), { nb: 3, bend: -H * .01 });
    if (sp.opening) chn(S, [T(.98, front ? 0 : fw(.98) * .2), T(.6, front ? 0 : fw(.6) * .75), T(.24, front ? 0 : fw(.24) * .95)], H * .016, sp.opening, { a: .85 });
    if (sp.belt) ln(S, T(.25, -bw(.25) - .006), T(.25, fw(.25) + .006), H * sp.beltW, sp.belt, { bend: H * .006, nb: sp.beltW > .035 ? 2 : 0 });
    if (sp.sash && !front) ln(S, T(.23, fw(.23) * .3), add(T(.02, fw(.02) * .8), mul(a, -H * .05)), H * .026, dk(sp.belt, .12), { prof: 'tip' });
    // 8. a load on the shoulders
    if (pose === 'carry' && o.load !== 'basket') {
      const c0 = add(sh2, [-H * .04, -H * .075]);
      if (o.load === 'jar') {
        const jc = C.roof, ax = unit([-.55, -1]);
        wsh(S, oval(c0, H * .11, H * .062, 16, .04, Math.atan2(ax[1], ax[0])), jc, .92, 3, H * .003);
        ln(S, add(c0, mul(ax, H * .1)), add(c0, mul(ax, H * .16)), H * .04, jc);
        wsh(S, oval(add(c0, mul(perp(ax), -H * .02)), H * .1, H * .03, 12, .05, Math.atan2(ax[1], ax[0])), dk(jc, .3), .3, 2, H * .002);
      } else {
        const sc0 = mixc(C.ground, C.paperDark, .35);
        wsh(S, oval(c0, H * .115, H * .07, 16, .08, -.35), sc0, .92, 3, H * .003);
        wsh(S, oval(add(c0, [-H * .01, H * .03]), H * .1, H * .035, 12, .08, -.35), dk(sc0, .3), .32, 2, H * .002);
        ln(S, add(c0, [-H * .1, H * .02]), add(c0, [-H * .14, H * .05]), H * .04, sc0, { prof: 'leaf' });
        ln(S, add(c0, [-H * .05, -H * .02]), add(c0, [H * .04, H * .03]), H * .01, dk(sc0, .4), { a: .5, bend: H * .01 });
        ink(E, oval(c0, H * .115, H * .07, 14, .05, -.35).slice(4, 11), ew, .4);
      }
    }
    // 9. shield
    if (sp.shield) {
      const k = sp.shield, sc0 = sp.shieldC, side = front ? (P.ha2[0] < 0 ? -1 : 1) : 1;
      const c0 = front ? add(P.ha2, [0, -H * .05]) : T(k === 'scutum' ? .42 : .55, fw(.5) + .045);
      const hw = H * (k === 'scutum' ? (front ? .13 : .085) : k === 'kite' ? (front ? .1 : .075) : (front ? .11 : .07)), hh = H * (k === 'scutum' ? .26 : k === 'kite' ? .2 : .12);
      let poly;
      if (k === 'scutum') poly = [[-1, -1], [0, -1.04], [1, -.98], [1.06, 0], [1, .98], [0, 1.03], [-1, 1], [-.94, 0]];
      else if (k === 'kite') poly = [[-1, -.75], [-.6, -1], [.6, -1], [1, -.75], [.8, .05], [0, 1], [-.8, .05]];
      else poly = Array.from({ length: 14 }, (_, i) => [Math.cos(i / 14 * 6.283), Math.sin(i / 14 * 6.283)]);
      poly = poly.map(([x, y]) => [c0[0] + x * hw * side, c0[1] + y * hh]);
      wsh(S, poly, sc0, .93, 3, H * .003);
      wsh(S, poly.slice(0, Math.ceil(poly.length / 2) + 1).map(p => lerp(p, c0, .15)).concat([c0]), dk(sc0, .25), .25, 2, H * .002);
      if (k === 'scutum') {
        chn(S, poly.concat([poly[0]]), H * .016, C.clothC, { a: .8, n: 24 });
        ln(S, add(c0, [0, -hh * .8]), add(c0, [0, -hh * .2]), H * .014, C.clothC, { a: .85 }); ln(S, add(c0, [0, hh * .2]), add(c0, [0, hh * .8]), H * .014, C.clothC, { a: .85 });
        wsh(S, oval(c0, hw * .32, hh * .14, 10, .05), sp.steel, .95, 2, H * .002);
      } else if (k === 'kite') {
        ln(S, add(c0, [0, -hh * .85]), add(c0, [0, hh * .85]), H * .024, sp.device || C.clothC, { a: .85 });
        ln(S, add(c0, [-hw * .85, -hh * .4]), add(c0, [hw * .85, -hh * .4]), H * .024, sp.device || C.clothC, { a: .85 });
      } else {
        chn(S, poly.concat([poly[0]]), H * .016, sp.steelD, { a: .7, n: 20 });
        wsh(S, oval(c0, hw * .28, hh * .28, 10, .05), sp.steel, .95, 2, H * .002);
      }
      ink(E, poly.slice(Math.floor(poly.length / 2)).concat([poly[0]]), ew, .5);
    }
    // 10. what the near hand holds
    itemPaint(S, E, o.hold, P, H, sp, o, live, pose);
    // 11. near arm
    const na = armPaint(sh, P.el, P.ha, sp.sleeve, skin);
    E.push(edgeOf(na, front ? -1 : 1, ew * .9, C.ink, .3));
    // 12. head and headgear
    headPaint(S, E, P, a, H, sp, o, T, front);
    S.push(...E);
  }

  // ---------------------------------------------------------------- person: held items
  function itemPaint(S, E, kind, P, H, sp, o, live, pose) {
    if (!kind || kind === 'none') return;
    const ha = P.ha, arm = unit(sub(P.ha, P.el)), ew = Math.max(.6, H * .01);
    const wood = mixc(C.wood, C.paper, .1), steelL = mixc(C.paperLight, C.far, .4);
    const LONG = { spear: 1.32, flag: 1.5, staff: 1.12, oar: 1.25, rifle: .86 };
    if (LONG[kind]) {
      let u, below;
      if (pose === 'run' && kind === 'spear') { u = unit([1, -.32]); below = .42 * H; }
      else if (pose === 'raise') { u = unit([.06, -1]); below = .3 * H; }
      else if (pose === 'point' && kind === 'rifle') { u = unit([1, -.03]); below = .14 * H; }
      else if (pose === 'point' && kind !== 'flag') { u = arm; below = .35 * H; }
      else if (pose === 'fall') { u = unit([-1, -1.1]); below = .45 * H; }
      else if (pose === 'lie') { u = unit([1, .03]); below = .25 * H; }
      else if (pose === 'row' || (kind === 'oar' && pose === 'sit')) { u = unit([1, .52]); below = .1 * H; }
      else if (kind === 'rifle' && (pose === 'walk' || pose === 'run')) { u = unit([-.3, -1]); below = .3 * H; }
      else if (kind === 'flag' && (pose === 'run' || pose === 'walk')) { u = unit([-.2, -1]); below = .28 * H; }
      else if (o.rider) { u = unit([.05, -1]); below = .3 * H; }
      else { u = unit([kind === 'flag' ? .03 : .06, -1]); below = Math.max(.1 * H, -ha[1] / Math.abs(u[1]) - .01 * H); }
      if (o.rider && pose === 'gallop' && kind === 'spear') { u = unit([1, -.14]); below = .38 * H; }
      const Lh = LONG[kind] * H * (kind === 'spear' && o.rider ? 1.25 : 1), butt = add(ha, mul(u, -below)), tip = add(ha, mul(u, Lh - below));
      const at = d => add(butt, mul(u, d * H));
      if (kind === 'spear') {
        ln(S, butt, tip, H * .017, wood);
        const hd = ln(S, add(tip, mul(u, -H * .015)), add(tip, mul(u, H * .085)), H * .034, steelL, { prof: 'leaf' });
        E.push(edgeOf(hd, 1, ew * .8, C.ink, .55));
      } else if (kind === 'staff') {
        ln(S, butt, tip, H * .022, wood, { bend: H * .012 }); ln(S, tip, add(tip, mul(u, H * .03)), H * .032, dk(C.wood, .2), { prof: 'leaf' });
      } else if (kind === 'oar') {
        ln(S, butt, add(tip, mul(u, -H * .2)), H * .02, wood);
        const bl = ln(S, add(tip, mul(u, -H * .24)), tip, H * .06, wood, { prof: 'leaf' }); E.push(edgeOf(bl, 1, ew, C.ink, .5));
      } else if (kind === 'rifle') {
        ln(S, at(.2), tip, H * .016, mixc(sp.steelD, C.ink, .35));
        ln(S, butt, at(.3), H * .046, dk(C.wood, .1), { prof: 'tip' });
        ln(S, at(.28), at(.68), H * .022, dk(C.wood, .15));
        ln(S, at(.3), at(.36), H * .03, sp.steelD, { prof: 'leaf' });
        for (const d of [.45, .6]) ln(S, add(at(d), mul(perp(u), -H * .014)), add(at(d), mul(perp(u), H * .014)), H * .008, mixc(C.clothC, C.ink, .2));
      } else if (kind === 'flag') {
        ln(S, butt, tip, H * .018, wood);
        ln(S, tip, add(tip, mul(u, H * .035)), H * .026, mixc(C.gold, C.clothC, .5), { prof: 'leaf' });
        const fc = sp.flag || C.red, f = { x: tip[0] - H * .006, y: tip[1] + H * .02, w: H * .42, h: H * .26, col: fc, dark: dk(fc, .35), ph: rnd(0, 6), dir: -1, mark: sp.flagMark };
        if (o.dress === 'knight') f.taper = .55;
        live.push((c, lt) => flagDraw(c, lt, f));
      }
      return;
    }
    if (kind === 'sword') {
      let u;
      if (pose === 'raise' || pose === 'run' || pose === 'fall' || (o.rider && pose === 'gallop')) u = unit([pose === 'run' || o.rider ? .5 : .15, -1]);
      else if (pose === 'point') u = arm;
      else u = unit([.4, 1]);
      const g0 = add(ha, mul(u, -H * .035)), g1 = add(ha, mul(u, H * .045)), px = perp(u);
      ln(S, g0, g1, H * .022, dk(C.wood, .4));
      ln(S, add(g1, mul(px, -H * .035)), add(g1, mul(px, H * .035)), H * .016, mixc(C.clothC, C.wood, .3));
      const tip = add(g1, mul(u, H * .42));
      const bl = ln(S, g1, tip, H * .028, steelL, { prof: 'tip', bend: sp.curved ? -H * .05 : 0 });
      E.push(edgeOf(bl, 1, ew, C.ink, .6));
      return;
    }
    if (kind === 'torch') {
      const u = unit([.25, -1]), tip = add(ha, mul(u, H * .2));
      ln(S, add(ha, mul(u, -H * .05)), tip, H * .022, dk(C.wood, .1));
      ln(S, add(tip, mul(u, -H * .035)), add(tip, mul(u, H * .015)), H * .036, dk(C.wood, .5));
      const i = Math.round(rnd(0, 50));
      live.push((c, lt) => { glow(c, tip[0], tip[1] - H * .05, H * .32, .22 + .04 * Math.sin(lt * 7 + i)); WC.flame(c, tip[0], tip[1] + H * .005, H * .17 * (.9 + .1 * Math.sin(lt * 9 + i)), lt, i); });
      return;
    }
    if (kind === 'lantern') {
      const top = add(ha, [0, H * .01]), b0 = add(top, [0, H * .045]), gl = mixc(C.gold, C.fire, .25);
      ln(S, top, b0, H * .008, C.ink, { a: .8 });
      const box = [add(b0, [-H * .028, 0]), add(b0, [H * .028, 0]), add(b0, [H * .032, H * .09]), add(b0, [-H * .032, H * .09])];
      wsh(S, box, gl, .8, 2, H * .002);
      ln(S, add(b0, [-H * .036, -H * .004]), add(b0, [H * .036, -H * .004]), H * .018, dk(C.wood, .5));
      ln(S, add(b0, [-H * .038, H * .094]), add(b0, [H * .038, H * .094]), H * .016, dk(C.wood, .5));
      for (const x of [-.03, 0, .03]) ln(S, add(b0, [x * H, 0]), add(b0, [x * 1.08 * H, H * .09]), H * .006, C.ink, { a: .7 });
      const cx = b0[0], cy = b0[1] + H * .045, i = Math.round(rnd(0, 50));
      live.push((c, lt) => { glow(c, cx, cy, H * .28, .25 + .05 * Math.sin(lt * 5 + i)); c.fillStyle = WC.rgba(C.gold, .9); c.beginPath(); c.ellipse(cx, cy + H * .01, H * .008, H * .016 * (1 + .15 * Math.sin(lt * 11 + i)), 0, 0, 7); c.fill(); });
      return;
    }
    if (kind === 'book') {
      const c0 = add(ha, [-H * .012, -H * .01]), cv = dk(C.cloth, .15);
      const poly = [add(c0, [-H * .055, -H * .03]), add(c0, [H * .045, -H * .045]), add(c0, [H * .052, H * .02]), add(c0, [-H * .05, H * .035])];
      wsh(S, poly, cv, .92, 2, H * .002);
      ln(S, lerp(poly[0], poly[1], .08), lerp(poly[3], poly[2], .08), H * .012, mixc(C.paperLight, C.stone, .2));
      ink(E, [poly[0], poly[3], poly[2]], ew * .8, .5);
    }
  }

  // ---------------------------------------------------------------- person: head, hair, headgear
  function headPaint(S, E, P, a, H, sp, o, T, front) {
    const hs = sp.hs, hc = P.hd, pose = o.pose;
    const hu = front ? [0, -1] : (pose === 'lie' || pose === 'fall') ? a : unit(add(mul(a, .55), [0, -.45]));
    const hf = front ? [1, 0] : perp(hu);
    const rx = H * .047 * hs, ry = H * .06 * hs, ew = Math.max(.6, H * .01);
    const F = (x, y) => add(hc, add(mul(hf, x * rx), mul(hu, y * ry)));
    const R = Math.PI / 180, HP = (d, r = 1) => F(Math.cos(d * R) * r, Math.sin(d * R) * r);
    const ring = (d0, d1, r = 1, n = 10) => Array.from({ length: n + 1 }, (_, i) => HP(d0 + (d1 - d0) * i / n, r));
    const type = sp.head, hat = sp.hat || C.wood, hair = sp.hair, skin = sp.skin, steel = sp.steel, steelD = sp.steelD;
    const felt = mixc(C.paperLight, C.stone, .4), pale = mixc(C.paperLight, C.stone, .28);
    if (front && (type === 'scarf' || type === 'hood' || type === 'coif')) wsh(S, [F(-1.2, .9), F(0, 1.28), F(1.2, .9), F(1.38, -.3), F(1.75, -1.95), F(-1.75, -1.95), F(-1.38, -.3)], type === 'coif' ? steel : hat, .92, 3, H * .003);
    // neck, head, nose, shadow side
    ln(S, T(.95, 0), F(front ? 0 : -.15, -.8), H * .042 * Math.sqrt(hs), dk(skin, .1));
    wsh(S, ring(0, 337.5, 1, 15), skin, .94, 3, H * .0015);
    if (!front) { ln(S, HP(10, .88), HP(-14, 1.17), H * .022, skin, { prof: 'tip' }); wsh(S, ring(150, 290, 1, 6).concat([F(-.1, -.2)]), dk(skin, .25), .32, 2, H * .0015); }
    else wsh(S, ring(200, 340, .98, 6).concat([F(0, -.5)]), dk(skin, .2), .2, 2, H * .0015);
    // hair, beard
    if (['bare', 'cap', 'straw', 'fedora', 'bowler', 'feather', 'fur', 'knit', 'bun', 'fez', 'helmet', 'galea', 'kettle'].includes(type)) {
      chn(S, front ? ring(12, 168, 1, 10) : ring(55, 215, 1, 10), H * (front ? .036 : .044) * hs, hair, { a: .92 });
      if (type === 'bun') wsh(S, oval(front ? F(0, 1.08) : F(-1.12, .5), rx * .58, ry * .44, 10, .08), hair, .92, 2, H * .0015);
    }
    if (sp.beard) {
      chn(S, front ? ring(-25, -155, .92, 8) : ring(-8, -140, .93, 8), H * .036, hair, { a: .9 });
      if (sp.beard > 1) ln(S, front ? F(0, -.75) : HP(-75, .9), front ? F(0, -1.75) : HP(-86, 1.8), H * .052, hair, { prof: 'tip', nb: 2 });
    }
    if (sp.moustache) { if (front) { ln(S, F(0, -.42), F(-.6, -.6), H * .016, hair); ln(S, F(0, -.42), F(.6, -.6), H * .016, hair); } else ln(S, HP(-22, .9), HP(-48, 1.02), H * .013, hair, { prof: 'tip', a: .85 }); }
    // headgear
    const domePts = (r = 1.1, d0 = -8, d1 = 188) => ring(d0, d1, r, 12);
    switch (type) {
      case 'turban': {
        const tc = sp.hat && o.cols && o.cols.hat ? sp.hat : pale, cen = F(-.12, .75), pts = [];
        for (let i = 0; i < 18; i++) { const t = i / 18 * Math.PI * 2; pts.push(F(-.12 + Math.cos(t) * (front ? 1.5 : 1.68), .7 + Math.sin(t) * .92)); }
        wsh(S, pts, tc, .93, 3, H * .002);
        for (let k = 0; k < 4; k++) ln(S, F(-1.55, .3 + k * .28), F(1.4, .66 + k * .24), H * .011, dk(tc, .28), { a: .5, bend: -ry * .25 });
        wsh(S, oval(F(-.1, 1.5), rx * .6, ry * .45, 10, .05), sp.hatTop || C.cloth, .92, 2, H * .002);
        void cen; break;
      }
      case 'bork': {
        wsh(S, front ? [F(-.9, .55), F(.9, .55), F(.78, 3), F(-.78, 3)] : [F(-1, .6), F(.9, .65), F(.55, 3.05), F(-.95, 3)], felt, .93, 3, H * .002);
        if (!front) { const flap = [F(-.95, 3), F(-1.4, 2.7), F(-1.85, .6), F(-1.75, -.95), F(-1.25, -.7), F(-1.05, .4)]; wsh(S, flap, dk(felt, .14), .92, 3, H * .002); ln(S, F(-1.2, 2.6), F(-1.5, .2), H * .012, dk(felt, .35), { a: .45 }); ink(E, flap.slice(0, 4), ew, .5); }
        wsh(S, domePts(1.06, 5, 175), felt, .9, 2, H * .002);
        ln(S, front ? F(-.6, .75) : F(-.6, .7), front ? F(-.62, 2.9) : F(-.75, 2.9), H * .012, dk(felt, .22), { a: .45 });
        ln(S, front ? F(-.98, .6) : F(-1.05, .62), front ? F(.98, .6) : F(.95, .68), H * .032, C.clothC, { nb: 2 });
        ln(S, front ? F(0, .7) : F(.72, .72), front ? F(0, 1.7) : F(.7, 1.65), H * .014, mixc(C.clothC, C.ink, .3));
        break;
      }
      case 'helmet': case 'kettle': case 'galea': {
        const mc = type === 'galea' ? steel : steel;
        wsh(S, domePts(1.12), mc, .93, 3, H * .002);
        if (type === 'kettle') ln(S, F(-1.65, -.06), F(1.65, -.1), H * .022, steelD, { bend: ry * .2 });
        else if (type === 'helmet') ln(S, F(-1.2, -.02), F(1.25, .0), H * .016, steelD);
        if (type === 'galea') {
          if (!front) { ln(S, F(-1.05, 0), F(-1.5, -.55), H * .03, steelD, { prof: 'tip' }); wsh(S, [F(.35, .1), F(.92, .05), F(.75, -.68), F(.4, -.58)], steel, .92, 2, H * .002); }
          if (sp.crest) { ln(S, F(0, 1.1), F(0, 1.42), H * .014, steelD); chn(S, front ? [F(-.3, 1.4), F(0, 1.9), F(.3, 1.4)] : [F(-1, 1.25), F(-.5, 1.85), F(.4, 1.9), F(1, 1.35)], H * .05, C.red, { nb: 3, prof: 'leaf' }); }
        }
        chn(S, ring(70, 120, .82, 4), H * .012, lite(steel, .5), { a: .7 });
        ink(E, ring(100, 188, 1.13, 6), ew, .55);
        break;
      }
      case 'greathelm': {
        const hp = front ? [[-1.12, 1.02], [0, 1.15], [1.12, 1.02], [1.12, -.98], [-1.12, -.98]] : [[-1.1, 1.05], [-.2, 1.18], [1.15, 1], [1.22, -.95], [-1.08, -1]];
        const pts = hp.map(([x, y]) => F(x, y));
        wsh(S, pts, steel, .94, 3, H * .002);
        ln(S, front ? F(-.95, .22) : F(.15, .22), F(front ? .95 : 1.22, .2), H * .014, C.ink, { a: .85 });
        ln(S, F(front ? 0 : 1.2, .95), F(front ? 0 : 1.22, -.9), H * .012, steelD, { a: .7 });
        ln(S, F(front ? -.6 : .45, .9), F(front ? -.6 : .5, -.8), H * .016, lite(steel, .45), { a: .6 });
        ink(E, [pts[0], pts[4]], ew, .55);
        break;
      }
      case 'coif': {
        if (!front) wsh(S, [F(.55, .95), F(0, 1.2), F(-.9, 1), F(-1.3, .2), F(-1.35, -.8), F(-1.9, -1.9), F(.15, -2), F(.55, -1.05), F(.3, -.4), F(.35, .5)], steel, .93, 3, H * .002);
        else wsh(S, ring(5, 175, 1.15, 8).concat(ring(175, 5, .95, 8).map(p => add(p, mul(hu, ry * .3)))), steel, .93, 3, H * .002);
        for (let k = 0; k < 5; k++) { const p = front ? F(rnd(-1, 1), rnd(.5, 1)) : F(rnd(-1.2, .2), rnd(-1.5, .9)); ln(S, p, add(p, [rx * .3, 0]), H * .007, steelD, { a: .45 }); }
        break;
      }
      case 'cap': wsh(S, domePts(1.08, -5, 185), hat, .93, 3, H * .002); if (!front) ln(S, F(.7, .05), F(1.6, -.08), H * .022, dk(hat, .2)); else ln(S, F(-.9, .05), F(.9, .05), H * .02, dk(hat, .2)); break;
      case 'knit': wsh(S, domePts(1.12, -10, 190).concat([F(0, 1.35)]), hat, .93, 3, H * .002); ln(S, F(-1.15, .05), F(1.15, .05), H * .03, dk(hat, .15)); break;
      case 'straw': {
        const sc = mixc(C.clothC, C.paperLight, .25);
        wsh(S, [F(-1, .25), F(-.85, 1.05), F(0, 1.4), F(.85, 1.05), F(1, .25)], sc, .92, 3, H * .002);
        ln(S, F(-2.1, .2), F(2.1, .15), H * .03, sc, { prof: 'leaf', nb: 2, bend: ry * .2 });
        ln(S, F(-1, .42), F(1, .42), H * .012, dk(sc, .3), { a: .6 });
        break;
      }
      case 'fedora': case 'bowler': {
        if (type === 'fedora') wsh(S, [F(-1, .45), F(1, .45), F(.92, 1.45), F(.1, 1.28), F(-.95, 1.5)], hat, .93, 3, H * .002);
        else wsh(S, oval(F(0, .9), rx * 1.05, ry * .62, 12, .03), hat, .93, 3, H * .002);
        ln(S, F(-1, .62), F(1, .62), H * .016, dk(hat, .45));
        ln(S, F(type === 'fedora' ? -1.8 : -1.4, .4), F(type === 'fedora' ? 1.85 : 1.45, .36), H * .022, hat, { bend: type === 'fedora' ? -ry * .2 : ry * .15 });
        break;
      }
      case 'feather': {
        wsh(S, [F(-1, .45), F(1, .5), F(.85, 1.3), F(-.9, 1.3)], hat, .93, 3, H * .002);
        ln(S, F(-2.1, .35), F(1.9, .72), H * .026, hat, { bend: -ry * .35 });
        chn(S, [F(-.2, 1.2), F(-1.3, 1.9), F(-2.5, 1.3)], H * .04, C.red, { prof: 'leaf', nb: 3 });
        break;
      }
      case 'fur': {
        const fc = mixc(C.wood, C.ink, .25);
        wsh(S, [F(-1.05, .4), F(1.05, .45), F(.95, 1.9), F(0, 2.05), F(-1, 1.95)], fc, .93, 3, H * .002);
        for (let k = 0; k < 6; k++) { const p = F(rnd(-.9, .9), rnd(.6, 1.8)); ln(S, p, add(p, mul(hu, ry * .25)), H * .01, dk(fc, .35), { a: .5 }); }
        break;
      }
      case 'fez': wsh(S, [F(-.85, .55), F(.85, .55), F(.7, 1.75), F(-.7, 1.75)], C.red, .93, 3, H * .002); ln(S, F(0, 1.75), F(-.7, 1.1), H * .01, C.ink, { a: .8 }); break;
      case 'scarf': case 'hood': {
        if (!front) {
          const pts = type === 'hood'
            ? [F(.6, .9), F(0, 1.3), F(-1, 1.25), F(-1.7, .9), F(-1.4, 0), F(-1.4, -.8), F(-2, -1.9), F(.2, -2), F(.6, -1), F(.35, -.4), F(.4, .5)]
            : [F(.55, .95), F(0, 1.2), F(-.9, 1), F(-1.3, .2), F(-1.35, -.8), F(-1.9, -1.9), F(.15, -2), F(.55, -1.05), F(.3, -.4), F(.35, .5)];
          wsh(S, pts, hat, .93, 3, H * .002);
          ln(S, F(-.3, 1), F(-1.2, -1.5), H * .012, dk(hat, .3), { a: .45, bend: -rx * .3 });
          ln(S, F(.2, .6), F(-.2, -1.6), H * .011, dk(hat, .3), { a: .35, bend: rx * .2 });
          ink(E, pts.slice(1, 6), ew, .45);
        } else wsh(S, ring(5, 175, 1.15, 8).concat(ring(175, 5, .95, 8).map(p => add(p, mul(hu, ry * .3)))), hat, .93, 3, H * .002);
        break;
      }
    }
    if (pose === 'carry' && o.load === 'basket') {
      const bc = mixc(C.clothC, C.wood, .35), b = [F(-1.7, 1), F(1.7, 1), F(2, 2.5), F(-2, 2.5)];
      wsh(S, b, bc, .92, 3, H * .002);
      for (let k = 1; k < 4; k++) ln(S, lerp(b[0], b[3], k / 4), lerp(b[1], b[2], k / 4), H * .008, dk(bc, .35), { a: .5 });
      for (let k = 0; k < 4; k++) { const p = lerp(b[3], b[2], .2 + k * .2); ln(S, add(p, mul(hu, ry * .2)), add(p, mul(hu, ry * .7)), H * .03, pick([C.leaf, C.fire, C.clothC, C.cloth]), { prof: 'leaf' }); }
      ink(E, [b[0], b[3], b[2], b[1]], ew, .45);
    }
  }

  // ---------------------------------------------------------------- person (the generator)
  WC.G.person = (sc, o = {}) => {
    const S = [], live = [];
    const pose = POSE[o.pose] ? o.pose : 'stand';
    const front = o.face === 'front' && FRONT_OK.includes(pose);
    const sp = dressSpec(o.dress || 'peasant', o);
    const H = 170 * sc * (o.h ?? 1) * sp.h * rnd(.96, 1.04);
    const J = joints(pose, o, front), P = {};
    for (const k in J) P[k] = mul(J[k], H);
    paintPerson(S, P, H, sp, Object.assign({}, o, { pose, front, dress: sp.dress }), live);
    const dir = o.face === 'left' ? -1 : 1;
    if (dir < 0) xform(S, 0, 0, true);
    return { S, live: liveOf(live, dir), top: [P.hd[0] * dir, P.hd[1] - H * .08] };
  };

  // ---------------------------------------------------------------- small figures for crowds and armies
  const HATS = {
    mixed: () => pick(['bare', 'bare', 'cap', 'scarf', 'scarf', 'straw']), peasant: () => pick(['bare', 'cap', 'scarf', 'straw']), woman: () => 'scarf',
    ottoman: () => pick(['turban', 'turban', 'turban', 'scarf']), janissary: () => 'bork', modern: () => pick(['hat', 'hat', 'bowler', 'cap', 'bare']),
    soldier: () => 'helmet', roman: () => 'galea', knight: () => pick(['greathelm', 'helmet']), robe: () => pick(['bare', 'hood']),
    sailor: () => pick(['knit', 'cap', 'bare']), worker: () => pick(['cap', 'cap', 'bare']), noble: () => pick(['feather', 'fur']), child: () => 'bare',
  };
  function clothFor(d) {
    switch (d) {
      case 'janissary': return pick([C.clothB, C.clothB, C.cloth, mixc(C.clothB, C.cloth, .3)]);
      case 'roman': return pick([C.cloth, mixc(C.cloth, C.wood, .15)]);
      case 'soldier': return pick([C.clothB, mixc(C.clothB, C.ink, .1)]);
      case 'modern': return pick([mixc(C.ink, C.paper, .35), mixc(C.wood, C.ink, .35), mixc(C.clothB, C.ink, .35), mixc(C.stone, C.ink, .35), mixc(C.ink, C.night, .3)]);
      case 'knight': return pick([C.cloth, C.clothB, C.clothC, C.leafDark, mixc(C.stone, C.far, .5)]);
      case 'ottoman': return pick([C.cloth, C.clothB, C.leafDark, mixc(C.cloth, C.clothC, .4), C.clothC]);
      case 'woman': return pick([C.cloth, C.clothB, C.clothC, mixc(C.leaf, C.ground, .3), mixc(C.cloth, C.wood, .35)]);
      default: return pick([C.cloth, C.clothB, C.clothC, mixc(C.wood, C.paper, .3), mixc(C.stone, C.wood, .2), C.leafDark, mixc(C.cloth, C.wood, .4), mixc(C.clothB, C.paper, .3), mixc(C.ground, C.wood, .3)]);
    }
  }
  const SKINS = () => pick([C.skin, mixc(C.skin, C.wood, .22), mixc(C.skin, C.paperLight, .12), mixc(C.skin, C.wood, .4)]);
  const HAIRS = () => pick([mixc(C.ink, C.wood, .35), mixc(C.wood, C.ink, .45), mixc(C.ink, C.inkSoft, .3)]);
  // f: {top, skin, hair, hat (type), hatC, side (+1 faces right, 0 front), legs, legC, step, robe, arm: -1|0|1, fade (0..1 toward paper)}
  function mini(S, x, y, h, f) {
    const fa = f.fade || 0, P = c => fa ? mixc(c, C.paper, fa) : c, s = f.side || 0, w = h * .21, ew = Math.max(.5, h * .011);
    const top = P(f.top), topD = P(dk(f.top, .3)), skin = P(f.skin);
    if (f.legs) {
      const stp = f.step || 0, lc = P(f.legC || dk(f.top, .35));
      ln(S, [x - w * .22, y - h * .46], [x - w * .3 - stp * h * .07 * (s || 1), y - h * .02], h * .075, lc);
      ln(S, [x + w * .22, y - h * .46], [x + w * .3 + stp * h * .07 * (s || 1), y - h * .02], h * .075, P(dk(lc, .15)));
      ln(S, [x - w * .3 - stp * h * .07 * (s || 1), y - h * .02], [x - w * .3 - stp * h * .07 * (s || 1) + (s || .4) * h * .06, y - h * .01], h * .04, P(mixc(C.wood, C.ink, .5)));
      ln(S, [x + w * .3 + stp * h * .07 * (s || 1), y - h * .02], [x + w * .3 + stp * h * .07 * (s || 1) + (s || .4) * h * .06, y - h * .01], h * .04, P(mixc(C.wood, C.ink, .5)));
    }
    const hem = f.legs ? y - h * (f.robe ? .08 : .36) : y + h * .05, lean = s * h * .015;
    const body = [[x - w * .5 + lean, y - h * .77], [x - w * .2 + lean, y - h * .845], [x + w * .2 + lean, y - h * .845], [x + w * .5 + lean, y - h * .77],
      [x + w * .4, y - h * .55], [x + w * (f.robe ? .62 : .5), hem], [x - w * (f.robe ? .62 : .5), hem], [x - w * .4, y - h * .55]];
    wsh(S, smooth(body, 1), top, .92, 2, h * .006);
    if (!f.lite) {
      const arms = s ? [s * .15] : [-1, 1];
      for (const k of arms) {
        if (!s && f.arm === k) continue;
        const a0 = [x + k * w * (s ? 1 : .46) + lean, y - h * .78], a1 = [x + k * w * (s ? 1.6 : .54) + (s ? s * w * .1 : 0), y - h * .5];
        ln(S, a0, a1, h * .062, P(dk(f.top, .14)), { bend: s ? -s * h * .02 : 0 });
        ln(S, a1, add(a1, [s * h * .01, h * .045]), h * .036, skin, { prof: 'leaf' });
      }
    }
    if (!f.lite) ln(S, [x - w * .3 * (s || 1), y - h * .78], [x - w * .36 * (s || 1), hem], w * .34, topD, { a: .32 });
    if (f.belt && !f.lite) ln(S, [x - w * .45, y - h * .56], [x + w * .45, y - h * .56], h * .035, P(f.belt));
    if (f.arm) {
      const sx = x + f.arm * w * .42, hx = x + f.arm * w * .7, hy = y - h * (1.12 + rnd(0, .08));
      ln(S, [sx, y - h * .79], [hx, hy], h * .062, top, {});
      ln(S, [hx, hy], [hx + f.arm * h * .01, hy - h * .05], h * .04, skin, { prof: 'leaf' });
    }
    if (!f.lite) ink(S, [body[0], body[7], body[6]], ew, .35, 2);
    const hc = [x + lean + s * h * .01, y - h * .915];
    wsh(S, oval(hc, h * .05, h * .064, 10, .05), skin, .93, 2, h * .003);
    miniHat(S, hc, h, f.hat, Object.assign({}, f, { P }));
  }
  function miniHat(S, hc, h, type, f) {
    const r = h * .05, s = f.side || 0, sd = s || 1, F = (x, y) => [hc[0] + x * r * sd, hc[1] - y * r * 1.25], P = f.P;
    const felt = P(mixc(C.paperLight, C.stone, .3)), steel = P(mixc(C.stone, C.far, .5)), steelD = P(mixc(mixc(C.stone, C.far, .5), C.ink, .35));
    const hatC = P(f.hatC || C.wood), hair = P(f.hair || C.ink);
    const dome = (c, rr = 1.12) => wsh(S, Array.from({ length: 9 }, (_, i) => { const t = Math.PI * (1 + i / 8); return F(Math.cos(t) * rr * (s ? 1 : 1), -Math.sin(t) * rr * .95 + .05); }), c, .93, 2, h * .003);
    switch (type) {
      case 'turban': wsh(S, oval(F(-.1 * sd * sd, .8), r * 1.55, r * 1.05, 12, .06), f.hatC ? hatC : felt, .93, 2, h * .003); ln(S, F(-1.3, .55), F(1.2, .95), h * .012, P(mixc(C.stone, C.ink, .3)), { a: .4 }); wsh(S, oval(F(0, 1.5), r * .5, r * .4, 8, .05), P(f.hatTop || C.cloth), .9, 2, h * .002); break;
      case 'bork':
        if (s) wsh(S, [F(-1, .55), F(.95, .6), F(.55, 2.9), F(-.95, 2.85)], felt, .93, 2, h * .003); else wsh(S, [F(-.95, .55), F(.95, .55), F(.75, 2.9), F(-.75, 2.9)], felt, .93, 2, h * .003);
        if (s) ln(S, F(-.95, 2.8), F(-1.75, -1.1), h * .055, P(dk(mixc(C.paperLight, C.stone, .3), .1)), { prof: 'tip' });
        ln(S, F(-1, .62), F(1, .66), h * .03, P(C.clothC)); break;
      case 'helmet': case 'galea': dome(steel); if (!f.lite) ln(S, F(-1.3, .05), F(1.35, .05), h * .016, steelD); if (type === 'galea' && f.crest !== false) chn(S, s ? [F(-1, 1.1), F(-.3, 1.7), F(.7, 1.6)] : [F(-.3, 1.2), F(0, 1.75), F(.3, 1.2)], h * .045, P(C.red), { prof: 'leaf' }); break;
      case 'greathelm': wsh(S, [F(-1.1, 1.05), F(1.15, 1.05), F(1.2, -.95), F(-1.1, -1)], steel, .94, 2, h * .003); ln(S, F(s ? .1 : -.9, .25), F(1.2, .22), h * .012, P(C.ink), { a: .8 }); break;
      case 'scarf': case 'hood': wsh(S, s ? [F(.5, .95), F(-.1, 1.25), F(-1.2, .85), F(-1.4, -.4), F(-1.8, -1.7), F(.3, -1.7), F(.4, -.6), F(.25, .4)] : [F(-1.15, .9), F(0, 1.3), F(1.15, .9), F(1.3, -.3), F(1.7, -1.7), F(-1.7, -1.7), F(-1.3, -.3)], f.hatC ? hatC : P(f.top2 || mixc(C.paperLight, C.stone, .3)), .93, 2, h * .003);
        if (!s) wsh(S, oval(F(0, -.1), r * .86, r * .98, 10, .04), P(f.skin), .93, 2, h * .002); break;
      case 'hat': wsh(S, [F(-.95, .45), F(.95, .45), F(.85, 1.5), F(-.9, 1.55)], hatC, .93, 2, h * .003); ln(S, F(-1.75, .42), F(1.8, .4), h * .022, hatC); break;
      case 'bowler': wsh(S, oval(F(0, .9), r * 1.05, r * .75, 10, .03), hatC, .93, 2, h * .003); ln(S, F(-1.4, .4), F(1.45, .38), h * .02, hatC); break;
      case 'cap': dome(hatC, 1.08); ln(S, F(.6, .1), F(1.5, .02), h * .02, hatC); break;
      case 'knit': dome(P(f.hatC || C.cloth), 1.15); break;
      case 'straw': { const sc = P(mixc(C.clothC, C.paperLight, .25)); dome(sc, 1.0); ln(S, F(-2, .2), F(2, .18), h * .028, sc, { prof: 'leaf' }); break; }
      case 'feather': wsh(S, [F(-1, .45), F(1, .5), F(.85, 1.3), F(-.9, 1.3)], hatC, .93, 2, h * .003); ln(S, F(-1.9, .4), F(1.8, .7), h * .024, hatC); ln(S, F(-.2, 1.2), F(-2.2, 1.5), h * .035, P(C.red), { prof: 'leaf' }); break;
      case 'fur': wsh(S, [F(-1.05, .4), F(1.05, .45), F(.95, 1.9), F(-1, 1.95)], P(mixc(C.wood, C.ink, .25)), .93, 2, h * .003); break;
      default: chn(S, s ? [F(.7, .75), F(0, 1.05), F(-.9, .65), F(-1.02, -.2)] : [F(-1, .2), F(-.6, .95), F(.6, .95), F(1, .2)], h * .04, hair, { a: .92 });
    }
  }

  // ---------------------------------------------------------------- crowd
  WC.G.crowd = (sc, o = {}) => {
    const S = [], live = [], H = 170 * sc, n = Math.max(3, o.n ?? 36), Wd = (o.w ?? 520) * sc;
    const rows = o.rows ?? Math.max(2, Math.min(6, Math.round(Math.sqrt(n / 3.2)))), per = Math.ceil(n / rows), gap = H * .13;
    const dresses = Array.isArray(o.dress) ? o.dress : [o.dress || 'mixed'];
    const sideOf = () => o.face === 'front' ? 0 : o.face === 'right' ? 1 : o.face === 'left' ? -1 : pick([0, 0, 1, -1]);
    // a dark under-wash so the mass reads as one, even through gaps
    const backY = -(rows - 1) * gap, mass = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12; mass.push([-Wd * .44 + Wd * .88 * u, backY - H * .5 + Math.sin(u * 9 + rnd(0, 2)) * H * .05]); }
    mass.push([Wd * .44, -H * .1], [-Wd * .44, -H * .1]);
    wsh(S, smooth(mass, 2), mixc(mixc(C.clothB, C.wood, .5), C.paper, .3), .32, 2, H * .01);
    shadow(S, 0, Wd * .55, H * .035, .25);
    const flagRows = new Set(); let flags = o.flags ?? 2;
    for (let r = 0; r < rows; r++) {
      const depth = rows > 1 ? (rows - 1 - r) / (rows - 1) : 0, y = -(rows - 1 - r) * gap, hh = H * (1 - depth * .16), fade = depth * .32;
      const m = r === rows - 1 ? Math.max(2, n - per * (rows - 1)) : per, span = Wd * (1 - depth * .08);
      for (let i = 0; i < m; i++) {
        const d = pick(dresses), dd = d === 'mixed' ? pick(['peasant', 'peasant', 'woman', 'woman', 'robe']) : d;
        const x = -span / 2 + span * (i + .5) / m + rnd(-.3, .3) * span / m + (r % 2 ? span / m * .35 : 0);
        const f = { top: clothFor(dd), skin: SKINS(), hair: HAIRS(), hat: (HATS[dd] || HATS.mixed)(), side: sideOf(), fade, legs: r === rows - 1, robe: dd === 'woman' || dd === 'robe' || dd === 'ottoman', step: rnd(-.5, .5), lite: depth > .55 };
        if (f.hat === 'scarf') f.hatC = pick([mixc(C.clothC, C.paper, .2), mixc(C.cloth, C.paper, .3), mixc(C.clothB, C.paper, .35), mixc(C.paperLight, C.stone, .4), mixc(C.leaf, C.paper, .3)]);
        else if (['cap', 'hat', 'bowler'].includes(f.hat)) f.hatC = pick([mixc(C.ink, C.wood, .3), mixc(C.wood, C.ink, .25), mixc(C.clothB, C.ink, .3)]);
        const raise = rnd() < (o.arms ?? .18) ? pick([-1, 1]) : 0;
        f.arm = raise;
        const yy = y + rnd(-.02, .02) * H, hj = hh * rnd(.92, 1.06) * (dd === 'woman' ? .95 : 1);
        mini(S, x, yy, hj, f);
        if (raise && flags > 0 && r < rows - 1 && !flagRows.has(r) && rnd() < .5) {
          flags--; flagRows.add(r);
          const px = x + raise * hj * .147, top = [px + raise * hj * .02, yy - hj * 1.85], fc = o.flag ? WC.col(o.flag) : pick([C.red, C.red, C.clothB, C.clothC]);
          ln(S, [px, yy - hj * 1.05], top, Math.max(.8, hj * .016), mixc(C.wood, C.ink, .2));
          const fl = { x: top[0], y: top[1] + hj * .02, w: hj * .45, h: hj * .28, col: fc, dark: dk(fc, .35), ph: rnd(0, 6), dir: pick([-1, 1]), mark: o.mark || (dresses.includes('ottoman') || dresses.includes('janissary') ? 'crescent' : null) };
          live.push((c, lt) => flagDraw(c, lt, fl));
        }
      }
    }
    return { S, live: liveOf(live), top: [0, backY - H] };
  };

  // ---------------------------------------------------------------- army
  WC.G.army = (sc, o = {}) => {
    const S = [], live = [], H = 170 * sc, rows = Math.max(1, o.rows ?? 4), n = Math.max(2, o.n ?? 12), d = o.dress || 'soldier';
    const sp = (o.w ? o.w * sc : n * H * .21) / n, gap = H * .11, dir = o.face === 'left' ? -1 : 1;
    const weapon = o.weapon || (d === 'janissary' ? 'rifle' : d === 'knight' ? 'spear' : d === 'roman' ? 'spear' : d === 'soldier' ? 'pike' : 'spear');
    const tilt = (o.tilt ?? .06) * (o.face === 'left' ? -1 : 1);
    const hat = d === 'ottoman' ? 'turban' : d === 'janissary' ? 'bork' : d === 'roman' ? 'galea' : d === 'knight' ? null : 'helmet';
    const uni = d === 'soldier' ? pick([C.clothB, mixc(C.cloth, C.wood, .3), mixc(C.leafDark, C.ground, .25)]) : null;
    const W = n * sp, backY = -(rows - 1) * gap;
    shadow(S, 0, W * .55, H * .04, .28);
    wsh(S, smooth([[-W * .44, backY - H * .5], [W * .44, backY - H * .5], [W * .46, -H * .1], [-W * .46, -H * .1]], 2), mixc(mixc(uni || C.clothB, C.ink, .3), C.paper, .3), .32, 2, H * .01);
    let nb = o.banner === false ? 0 : typeof o.banner === 'number' ? o.banner : Math.max(1, Math.round(n / 5));
    const bannerAt = new Set(); for (let k = 0; k < nb; k++) bannerAt.add(Math.round((k + .5) / nb * (n - 1)));
    const bannerRow = Math.max(0, rows - 2);
    for (let r = 0; r < rows; r++) {
      const depth = rows > 1 ? (rows - 1 - r) / (rows - 1) : 0, y = -(rows - 1 - r) * gap, fade = depth * .3, hh = H * (1 - depth * .12);
      const P = c => fade ? mixc(c, C.paper, fade) : c;
      for (let i = 0; i < n; i++) {
        const x = (-W / 2 + (i + .5) * sp + (r % 2 ? sp * .5 : 0) + rnd(-.12, .12) * sp) * dir, yy = y + rnd(-.015, .015) * H, h = hh * rnd(.95, 1.04);
        const top = uni ? uni : clothFor(d);
        const f = { top, skin: SKINS(), hair: HAIRS(), hat: hat || pick(['greathelm', 'helmet', 'helmet']), side: dir, fade, legs: r === rows - 1, robe: d === 'ottoman',
          step: o.march ? (i % 2 ? .6 : -.6) : rnd(-.15, .15), belt: d === 'janissary' || d === 'ottoman' ? C.clothC : mixc(C.wood, C.ink, .3), crest: rnd() < .3, lite: r < rows - 1 };
        if (d === 'ottoman') f.hatTop = pick([C.cloth, C.red]);
        mini(S, x, yy, h, f);
        // weapon
        const hx = x + dir * h * .1, hy = yy - h * .5, wl = weapon === 'pike' ? 2.2 : weapon === 'rifle' ? .95 : 1.55, tt = tilt + rnd(-.02, .02);
        const u = unit([Math.sin(tt), -1]), butt = weapon === 'rifle' ? add([hx, hy], mul(u, -h * .38)) : [hx - u[0] * h * .45, yy - h * .02];
        const tip = add(butt, mul(u, wl * h));
        if (weapon === 'rifle') { ln(S, add(butt, mul(u, h * .25)), tip, Math.max(.6, h * .014), P(mixc(C.stone, C.ink, .45))); ln(S, butt, add(butt, mul(u, h * .32)), Math.max(.8, h * .03), P(dk(C.wood, .1)), { prof: 'tip' }); }
        else { ln(S, butt, tip, Math.max(.6, h * .015), P(mixc(C.wood, C.ink, .25))); ln(S, tip, add(tip, mul(u, h * .08)), Math.max(1, h * .03), P(mixc(C.paperLight, C.far, .45)), { prof: 'leaf' });
          if (d === 'knight' && rnd() < .35) { const pc = pick([C.red, C.clothB, C.clothC]); wsh(S, [add(tip, [0, h * .02]), add(tip, [-dir * h * .2, h * .05]), add(tip, [0, h * .1])], P(pc), .85, 2, h * .003); } }
        // shields: a wall of scuta, kite shields
        if (d === 'roman' || d === 'knight') {
          const c0 = [x + dir * h * .09, yy - h * (d === 'roman' ? .45 : .5)], hw = h * (d === 'roman' ? .14 : .1), hh2 = h * (d === 'roman' ? .27 : .19);
          const pts = d === 'roman' ? [[-1, -1], [1, -1], [1.06, 0], [1, 1], [-1, 1], [-.94, 0]] : [[-1, -.75], [-.6, -1], [.6, -1], [1, -.75], [.8, .05], [0, 1], [-.8, .05]];
          const poly = pts.map(([a, b]) => [c0[0] + a * hw, c0[1] + b * hh2]), scC = d === 'roman' ? C.cloth : pick([C.clothB, C.cloth, C.clothC]);
          wsh(S, poly, P(scC), .93, 2, h * .003);
          if (r < rows - 1) { if (d === 'roman') ln(S, poly[0], poly[1], Math.max(.6, h * .02), P(C.clothC), { a: .8 }); }
          else if (d === 'roman') { chn(S, poly.concat([poly[0]]), Math.max(.6, h * .016), P(C.clothC), { a: .8, n: 14 }); wsh(S, oval(c0, hw * .3, hh2 * .14, 8, .05), P(mixc(C.stone, C.far, .5)), .95, 2, h * .002); }
          else ln(S, add(c0, [0, -hh2 * .8]), add(c0, [0, hh2 * .8]), Math.max(.6, h * .022), P(scC === C.clothC ? C.cloth : C.clothC), { a: .85 });
          if (r === rows - 1) ink(S, poly.slice(3).concat([poly[0]]), Math.max(.5, h * .01), .45);
        }
        // banners above the ranks
        if (r === bannerRow && bannerAt.has(i)) {
          const bx = x - dir * h * .12, by = yy - h * .4, ph = rnd(0, 6), bt = [bx, by - h * 2.15];
          ln(S, [bx, by], bt, Math.max(.8, h * .02), P(mixc(C.wood, C.ink, .3)));
          if (d === 'roman') {
            if (i === [...bannerAt][0]) {                       // the eagle (aquila)
              const g = mixc(C.gold, C.clothC, .5);
              ln(S, add(bt, [0, -h * .02]), add(bt, [-h * .13, -h * .17]), h * .045, g, { prof: 'leaf' }); ln(S, add(bt, [0, -h * .02]), add(bt, [h * .13, -h * .17]), h * .045, g, { prof: 'leaf' });
              wsh(S, oval(add(bt, [0, -h * .06]), h * .03, h * .055, 8, .05), g, .95, 2, h * .002); ink(S, [add(bt, [-h * .13, -h * .17]), add(bt, [0, -h * .1]), add(bt, [h * .13, -h * .17])], h * .012, .5, 1);
            } else {                                            // vexillum: a square cloth on a crossbar, with a fringe
              const cb = add(bt, [0, h * .1]);
              ln(S, add(cb, [-h * .2, 0]), add(cb, [h * .2, 0]), h * .02, mixc(C.wood, C.ink, .3));
              const q = [add(cb, [-h * .18, h * .01]), add(cb, [h * .18, h * .01]), add(cb, [h * .17, h * .4]), add(cb, [-h * .17, h * .41])];
              wsh(S, q, C.red, .92, 3, h * .003); ln(S, q[3], q[2], h * .03, mixc(C.gold, C.clothC, .5), { a: .8 });
              ln(S, add(cb, [-h * .08, h * .15]), add(cb, [h * .08, h * .15]), h * .02, mixc(C.gold, C.clothC, .5), { a: .7 }); ink(S, [q[0], q[3], q[2]], h * .01, .45);
            }
          } else if ((d === 'ottoman' || d === 'janissary') && i === [...bannerAt][0]) {    // a tuğ: horse-tail standard
            const g = mixc(C.gold, C.clothC, .5);
            wsh(S, oval(add(bt, [0, -h * .03]), h * .035, h * .035, 8, .05), g, .95, 2, h * .002);
            for (let k = 0; k < 7; k++) ln(S, add(bt, [rnd(-.02, .02) * h, h * .02]), add(bt, [rnd(-.12, .12) * h, h * rnd(.45, .6)]), h * .03, mixc(C.ink, C.wood, .3), { prof: 'tip', a: .8, bend: rnd(-.03, .03) * h });
            wsh(S, oval(add(bt, [0, h * .04]), h * .04, h * .025, 8, .05), C.red, .9, 2, h * .002);
          } else {
            const fc = d === 'ottoman' || d === 'janissary' ? C.red : d === 'knight' ? pick([C.clothB, C.cloth, C.clothC]) : pick([C.red, C.clothB, C.cloth]);
            const fl = { x: bt[0], y: bt[1] + h * .03, w: h * .62, h: h * .4, col: fc, dark: dk(fc, .35), ph, dir: -dir, mark: d === 'ottoman' || d === 'janissary' ? 'crescent' : d === 'knight' ? 'cross' : null, taper: d === 'knight' ? .3 : 0 };
            live.push((c, lt) => flagDraw(c, lt, fl));
          }
        }
      }
    }
    return { S, live: liveOf(live), top: [0, backY - H * 2.4] };
  };

  // ---------------------------------------------------------------- quadrupeds (sc 1 coordinates, facing right)
  // g: {body, neck?, head?, legs: [FN, FF, HN, HF] (top, knee/hock, fetlock, foot), legW, lowW, legProf, foot: {w, l, col},
  //     tail: {pts, w, n, col}, back (ink), belly: [pts, w], marks: [[p, q, bend, w]], ears: [[p, q, w]], eye, shw (shadow width), cx}
  function quad(S, sc, g, coat, o = {}) {
    const K = p => [p[0] * sc, p[1] * sc], KK = L => L.map(K), far = dk(coat, .25), shade = dk(coat, .38), ew = Math.max(.6, 1.15 * sc);
    if (!o.noShadow) shadow(S, (g.cx || 0) * sc, (g.shw || 80) * sc, 7 * sc);
    const leg = (L, c) => {
      const P = KK(L), w = g.legW * sc;
      let s;
      if (g.legProf === 'even') s = st(S, along(P.slice(0, 3), 10), w, c, { prof: 'even', rough: .14 });
      else s = st(S, along(P.slice(0, 3), 10), w, c, { prof: 'trunk', rough: .14, nb: w > 14 ? 2 : 0 });
      st(S, along([P[2], P[3]], 4), w * (g.lowW || .42), c, {});
      if (g.foot) ln(S, add(P[3], [-g.foot.l * .45 * sc, -g.foot.w * .35 * sc]), add(P[3], [g.foot.l * .55 * sc, g.foot.w * .05 * sc]), g.foot.w * sc, g.foot.col || dk(coat, .55));
      return s;
    };
    leg(g.legs[1], far); leg(g.legs[3], far);
    if (g.tail) for (let k = 0; k < (g.tail.n || 1); k++) {
      const p = KK(g.tail.pts).map((q, i) => i ? add(q, [rnd(-1, 1) * (g.tail.j || 4) * sc * i, rnd(-1, 1) * (g.tail.j || 4) * sc * i * .5]) : q);
      st(S, along(p, 10), g.tail.w * sc * rnd(.7, 1), g.tail.col || dk(coat, .45), { prof: 'tip', a: .85, nb: g.tail.w > 6 ? 2 : 0 });
    }
    wsh(S, smooth(KK(g.body)), coat, .93, 3, 1.1 * sc);
    if (g.neck) wsh(S, smooth(KK(g.neck), 1), coat, .93, 3, sc);
    if (g.head) wsh(S, smooth(KK(g.head), 1), coat, .93, 3, .7 * sc);
    if (g.shadeBody) wsh(S, smooth(KK(g.shadeBody), 1), dk(coat, .3), .3, 2, sc);
    if (g.belly) st(S, along(KK(g.belly[0]), 10), g.belly[1] * sc, shade, { prof: 'leaf', nb: 3, a: .42 });
    for (const m of g.marks || []) ln(S, K(m[0]), K(m[1]), m[3] * sc, shade, { prof: 'leaf', bend: m[2] * sc, a: .3, nb: 2 });
    const legs = [leg(g.legs[0], coat), leg(g.legs[2], coat)];
    for (const s of legs) S.push(edgeOf(s, 1, ew, C.ink, .42));
    for (const e of g.ears || []) ln(S, K(e[0]), K(e[1]), e[2] * sc, e[3] || dk(coat, .2), { prof: 'leaf' });
    if (g.back) ink(S, KK(g.back), 1.3 * sc, .5, 3);
    if (g.eye) ln(S, K(g.eye), add(K(g.eye), [1.8 * sc, .5 * sc]), 2.6 * sc, C.ink, { a: .75 });
    return K;
  }
  const rotP = (pts, c, ang) => pts.map(([x, y]) => { const dx = x - c[0], dy = y - c[1]; return [c[0] + dx * Math.cos(ang) - dy * Math.sin(ang), c[1] + dx * Math.sin(ang) + dy * Math.cos(ang)]; });
  const COATS = () => ({ bay: mixc(C.wood, C.fire, .12), chestnut: mixc(C.wood, C.roof, .45), grey: mixc(C.stone, C.far, .45), black: mixc(mixc(C.ink, C.wood, .3), C.paper, .12), dun: mixc(C.ground, C.wood, .4), white: mixc(C.paperDark, C.stone, .35) });

  // ---------------------------------------------------------------- horse
  function horseGeo(pose) {
    let neck = [[36, -150], [52, -172], [70, -193], [88, -208], [100, -184], [90, -158], [74, -124], [58, -138]];
    let head = [[86, -211], [102, -205], [120, -184], [132, -170], [131, -158], [121, -153], [109, -161], [99, -171], [94, -186]];
    let crest = [[88, -206], [70, -191], [52, -170], [40, -153]], ears = [[[88, -208], [83, -224], 6], [[93, -207], [93, -222], 5]], eye = [103, -193], mouth = [126, -157];
    let tail = [[-76, -136], [-96, -118], [-92, -66]], maneD = [-9, 13];
    const legs = {
      stand: [[[46, -102], [48, -54], [48, -16], [52, -3]], [[33, -102], [31, -54], [31, -16], [35, -3]], [[-50, -114], [-61, -56], [-56, -16], [-52, -3]], [[-62, -114], [-72, -56], [-67, -16], [-63, -3]]],
      walk: [[[46, -102], [58, -58], [52, -30], [50, -22]], [[33, -102], [29, -54], [27, -16], [31, -3]], [[-50, -114], [-58, -56], [-46, -16], [-42, -3]], [[-62, -114], [-78, -58], [-80, -16], [-76, -3]]],
      gallop: [[[46, -102], [70, -74], [92, -54], [100, -46]], [[33, -102], [42, -62], [24, -50], [17, -44]], [[-50, -114], [-80, -76], [-106, -52], [-114, -46]], [[-62, -114], [-46, -66], [-26, -42], [-18, -36]]],
    }[pose] || null;
    if (pose === 'gallop') {
      const c0 = [58, -140], ang = .3;
      neck = rotP(neck, c0, ang); head = rotP(head, c0, ang); crest = rotP(crest, c0, ang); ears = ears.map(([p, q, w]) => [...rotP([p, q], c0, ang), w]);
      eye = rotP([eye], c0, ang)[0]; mouth = rotP([mouth], c0, ang)[0]; tail = [[-76, -136], [-104, -140], [-132, -118]]; maneD = [-15, 2];
    }
    if (pose === 'walk') tail = [[-76, -136], [-94, -116], [-88, -66]];
    return {
      body: [[66, -118], [61, -101], [46, -91], [14, -86], [-18, -87], [-44, -93], [-64, -101], [-77, -118], [-76, -136], [-60, -148], [-26, -144], [8, -143], [38, -152], [58, -142]],
      neck, head, legs: legs || horseGeo('stand').legs, legW: 19, lowW: .45, foot: { w: 7, l: 11 }, ears, eye,
      tail: { pts: tail, w: 9, n: 4, j: 5 }, belly: [[[60, -102], [14, -89], [-44, -95]], 12],
      shadeBody: [[62, -106], [46, -91], [14, -86], [-18, -87], [-44, -93], [-64, -101], [-74, -114], [-40, -108], [0, -102], [40, -108]],
      marks: [[[54, -146], [46, -100], 6, 9], [[-46, -142], [-64, -106], -6, 10], [[58, -150], [80, -126], 4, 7]],
      back: [[-76, -134], [-60, -148], [-26, -144], [8, -143], [38, -152]].concat(crest.slice().reverse()), crest, maneD, mouth, saddle: [4, -150], shw: 95,
    };
  }
  function paintHorse(S, sc, o = {}) {
    const pose = ['stand', 'walk', 'gallop'].includes(o.pose) ? o.pose : 'stand', g = horseGeo(pose);
    const coats = COATS(), coat = o.coat && coats[o.coat] ? coats[o.coat] : o.coat ? WC.col(o.coat) : pick([coats.bay, coats.bay, coats.chestnut, coats.grey, coats.black, coats.dun, coats.white]);
    const mane = coat === coats.grey || coat === coats.white ? mixc(C.stone, C.ink, .3) : mixc(C.ink, C.wood, .3);
    g.tail.col = mane;
    const K = quad(S, sc, g, coat, o);
    // mane and forelock
    for (let k = 0; k < 10; k++) { const p = K(lerp(g.crest[0], g.crest[3], k / 9)); ln(S, p, add(p, [g.maneD[0] * sc * rnd(.8, 1.2), g.maneD[1] * sc * rnd(.8, 1.2)]), 6 * sc, mane, { prof: 'tip', a: .85 }); }
    ln(S, K(g.crest[0]), add(K(g.crest[0]), [9 * sc, 6 * sc]), 5 * sc, mane, { prof: 'tip' });
    ln(S, add(K(g.mouth), [2 * sc, -5 * sc]), add(K(g.mouth), [3.5 * sc, -5.5 * sc]), 2.4 * sc, C.ink, { a: .6 });
    const tack = o.saddle || o.rider;
    if (tack) {
      const cl = o.cloth || C.cloth, sx = g.saddle[0];
      if (o.barding) {
        const bc = o.barding === true ? cl : WC.col(o.barding), pts = [[-77, -134], [-60, -150], [sx, -147], [40, -154], [60, -142], [70, -116], [66, -80], [20, -76], [-30, -78], [-80, -86]].map(K);
        wsh(S, pts, bc, .92, 3, sc);
        for (let k = 0; k < 7; k++) { const p = lerp(pts[9], pts[6], k / 6); ln(S, add(p, [-4 * sc, 0]), add(p, [4 * sc, 6 * sc]), 5 * sc, dk(bc, .2), { prof: 'leaf', a: .7 }); }
        ln(S, K([-50, -146]), K([-52, -84]), 5 * sc, o.trim || C.clothC, { a: .8 }); ln(S, K([40, -150]), K([44, -82]), 5 * sc, o.trim || C.clothC, { a: .8 });
        wsh(S, [[sx - 22, -147], [sx + 26, -150], [sx + 22, -138], [sx - 18, -136]].map(K), dk(bc, .2), .5, 2, sc);
      } else {
        const q = [[sx - 26, -146], [sx + 28, -150], [sx + 26, -112], [sx - 22, -110]].map(K);
        wsh(S, q, cl, .92, 3, sc); ln(S, q[3], q[2], 4 * sc, o.trim || C.clothC, { a: .85 }); ink(S, [q[0], q[3], q[2]], 1.1 * sc, .45);
        ln(S, K([sx + 8, -146]), K([sx + 10, -88]), 3 * sc, mixc(C.wood, C.ink, .35), { a: .8 });
      }
      chn(S, [[sx - 20, -150], [sx - 12, -155], [sx + 16, -153], [sx + 26, -160]].map(K), 8 * sc, mixc(C.wood, C.ink, .3));
      chn(S, [g.crest[0], g.mouth].map(K), 1.7 * sc, C.ink, { a: .7 });
      ln(S, add(K(g.mouth), [-12 * sc, -12 * sc]), add(K(g.mouth), [2 * sc, -16 * sc]), 1.6 * sc, C.ink, { a: .65 });
      chn(S, [[sx + 22, -148], [56, -132], [66, -116]].map(K), 3 * sc, mixc(C.wood, C.ink, .3), { a: .85 });
    }
    return { K, g };
  }
  WC.G.horse = (sc, o = {}) => {
    const S = []; paintHorse(S, sc, o);
    if (o.face === 'left') xform(S, 0, 0, true);
    return { S, top: [0, -210 * sc] };
  };
  WC.G.rider = (sc, o = {}) => {
    const S = [], live = [], pose = ['stand', 'walk', 'gallop'].includes(o.pose) ? o.pose : 'walk';
    const d = o.dress || 'soldier', sp = dressSpec(d, o);
    const { K, g } = paintHorse(S, sc, { pose, coat: o.coat, rider: true, barding: o.barding ?? (d === 'knight'), cloth: d === 'ottoman' || d === 'janissary' ? pick([C.cloth, C.clothB]) : d === 'knight' ? sp.top : pick([C.cloth, C.clothB, mixc(C.wood, C.ink, .2)]), trim: C.clothC });
    const H = 170 * sc * rnd(.97, 1.03), sd = K(g.saddle), hp = add(sd, [0, -5 * sc]);
    const lean = pose === 'gallop' ? unit([.4, -1]) : unit([.05, -1]), nk = add(hp, mul(lean, .335 * H));
    const hd = add(nk, mul(unit(add(lean, [.15, -.4])), .09 * H)), sh = add(nk, mul(lean, -.03 * H));
    const P = { hp, nk, hd, kn: add(hp, [.16 * H, .1 * H]), an: add(hp, [.12 * H, .32 * H]), ft: [.065 * H, .01 * H], kn2: add(hp, [-.1 * H, .05 * H]), an2: add(hp, [-.14 * H, .2 * H]), ft2: [.05 * H, 0] };
    const reinH = add(sh, [.2 * H, .16 * H]);
    P.el = add(sh, [.06 * H, .15 * H]); P.ha = reinH; P.el2 = add(sh, [.03 * H, .15 * H]); P.ha2 = add(reinH, [-.02 * H, .01 * H]);
    if (o.hold === 'sword' && pose === 'gallop') { P.el = add(sh, [.08 * H, -.13 * H]); P.ha = add(P.el, [.05 * H, -.13 * H]); }
    else if (o.hold === 'sword') { P.el = add(sh, [.04 * H, .16 * H]); P.ha = add(sh, [.12 * H, .25 * H]); }
    else if (['spear', 'flag', 'torch', 'staff'].includes(o.hold)) { P.el = add(sh, [.1 * H, .1 * H]); P.ha = add(sh, [.17 * H, .02 * H]); }
    sp.L = Math.min(sp.L, .85); sp.highBoots = sp.highBoots || d !== 'roman';
    if (sp.shield === 'scutum') sp.shield = 'round';
    paintPerson(S, P, H, sp, Object.assign({}, o, { pose: pose === 'gallop' ? 'gallop' : 'ride', front: false, noShadow: true, noFarLeg: true, rider: true, dress: sp.dress }), live);
    chn(S, [P.ha2, add(lerp(P.ha2, K(g.mouth), .5), [0, 8 * sc]), K(g.mouth)], 1.5 * sc, C.ink, { a: .7 });   // reins
    const dir = o.face === 'left' ? -1 : 1;
    if (dir < 0) xform(S, 0, 0, true);
    return { S, live: liveOf(live, dir), top: [hd[0] * dir, hd[1] - H * .1] };
  };

  // ---------------------------------------------------------------- camel (dromedary)
  WC.G.camel = (sc, o = {}) => {
    const S = [], pose = ['stand', 'walk', 'sit'].includes(o.pose) ? o.pose : 'stand', dy = pose === 'sit' ? 62 : 0;
    const coat = o.col ? WC.col(o.col) : pick([mixc(C.ground, C.wood, .3), mixc(C.ground, C.wood, .45), mixc(C.clothC, C.wood, .35), mixc(C.ground, C.paperDark, .2)]);
    const sh = p => [p[0], p[1] + dy], SH = L => L.map(sh);
    const legs = pose === 'sit'
      ? [[[48, -48], [66, -12], [40, -6], [30, -5]], [[36, -48], [54, -12], [28, -6], [20, -5]], [[-44, -50], [-66, -12], [-36, -6], [-26, -5]], [[-56, -50], [-76, -12], [-46, -6], [-36, -5]]]
      : pose === 'walk'
        ? [[[48, -108], [60, -62], [52, -32], [56, -24]], [[36, -108], [34, -58], [33, -12], [38, -3]], [[-44, -112], [-50, -60], [-40, -12], [-36, -3]], [[-56, -112], [-66, -60], [-72, -14], [-67, -3]]]
        : [[[48, -108], [50, -58], [50, -12], [55, -3]], [[36, -108], [36, -58], [35, -12], [40, -3]], [[-44, -112], [-52, -60], [-48, -12], [-43, -3]], [[-56, -112], [-62, -60], [-59, -12], [-54, -3]]];
    const g = {
      body: SH([[62, -122], [56, -104], [28, -96], [-12, -97], [-40, -103], [-58, -116], [-66, -136], [-58, -152], [-40, -160], [-26, -180], [-6, -204], [14, -198], [32, -172], [46, -156], [58, -144]]),
      neck: SH([[48, -152], [66, -144], [84, -140], [98, -150], [108, -168], [112, -186], [124, -182], [118, -160], [106, -134], [88, -118], [70, -112], [60, -120]]),
      head: SH([[110, -190], [122, -196], [140, -188], [152, -180], [154, -172], [146, -166], [130, -166], [116, -172]]),
      legs, legW: 15, lowW: .55, foot: { w: 7, l: 14 }, ears: [[sh([114, -192]), sh([109, -201]), 5]], eye: sh([127, -186]),
      tail: { pts: SH([[-64, -140], [-72, -118], [-70, -96]]), w: 4, n: 2, j: 2 }, belly: [SH([[56, -104], [0, -98], [-50, -108]]), 12],
      marks: [[sh([-12, -196]), sh([22, -168]), 6, 10], [sh([-44, -150]), sh([-58, -118]), -5, 9]],
      back: SH([[-66, -136], [-58, -152], [-40, -160], [-26, -180], [-6, -204], [14, -198], [32, -172], [46, -156], [66, -144], [84, -140], [98, -150], [108, -168], [112, -186], [122, -196]]), shw: 90,
    };
    const K = quad(S, sc, g, coat, o);
    if (pose !== 'sit') for (const L of [legs[0], legs[2]]) wsh(S, oval(K(L[1]), 5 * sc, 4 * sc, 8, .1), dk(coat, .35), .6, 2, sc * .5);
    ln(S, K(sh([152, -172])), K(sh([146, -170])), 2.4 * sc, C.ink, { a: .6 });
    if (o.load) {
      const bl = SH([[-36, -170], [-8, -208], [22, -198], [38, -166], [32, -126], [-32, -124]]).map(K), cl = pick([C.cloth, C.clothB]);
      wsh(S, bl, cl, .92, 3, sc); for (let k = 1; k < 4; k++) ln(S, lerp(bl[0], bl[5], k / 4), lerp(bl[3], bl[4], k / 4), 3 * sc, C.clothC, { a: .7 });
      for (const [bx, by, c] of [[-28, -128, mixc(C.ground, C.wood, .35)], [24, -130, mixc(C.clothC, C.wood, .3)]]) {
        const p = K(sh([bx, by])), bag = smooth([[-15, -22], [15, -22], [18, 8], [10, 20], [-10, 20], [-18, 8]].map(q => add(p, mul(q, sc))), 1);
        ln(S, add(p, [-8 * sc, -22 * sc]), add(p, [-2 * sc, -48 * sc]), 2 * sc, mixc(C.wood, C.ink, .35)); ln(S, add(p, [8 * sc, -22 * sc]), add(p, [4 * sc, -48 * sc]), 2 * sc, mixc(C.wood, C.ink, .35));
        wsh(S, bag, c, .93, 3, sc); wsh(S, bag.slice(4, 12).concat([p]), dk(c, .25), .3, 2, sc); ink(S, bag.slice(6, 14), 1.1 * sc, .45);
      }
      const rl = K(sh([-6, -202])), rc = pick([C.cloth, C.clothB, mixc(C.clothC, C.wood, .2)]);
      wsh(S, oval(rl, 28 * sc, 9 * sc, 12, .06), rc, .93, 3, sc); for (const dx of [-12, 0, 12]) ln(S, add(rl, [dx * sc, -8 * sc]), add(rl, [dx * sc, 8 * sc]), 2 * sc, C.clothC, { a: .7 });
    }
    if (o.face === 'left') xform(S, 0, 0, true);
    return { S, top: [-6 * sc * (o.face === 'left' ? -1 : 1), (-204 + dy) * sc] };
  };

  // ---------------------------------------------------------------- ox / cow
  function oxGeo(pose, cow) {
    const legs = pose === 'walk'
      ? [[[54, -66], [64, -36], [60, -16], [62, -9]], [[42, -66], [40, -34], [39, -8], [42, -2]], [[-58, -72], [-58, -36], [-50, -8], [-48, -2]], [[-70, -72], [-86, -38], [-88, -8], [-85, -2]]]
      : [[[54, -66], [56, -32], [56, -8], [58, -2]], [[42, -66], [42, -32], [41, -8], [44, -2]], [[-58, -72], [-68, -36], [-64, -8], [-62, -2]], [[-70, -72], [-80, -36], [-76, -8], [-73, -2]]];
    return {
      body: [[72, -104], [70, -86], [64, -70], [56, -58], [30, -52], [-10, -50], [-40, -54], [-62, -62], [-80, -80], [-86, -106], [-80, -124], [-50, -130], [-10, -131], [28, -134], [48, -142], [64, -132]],
      neck: [[48, -142], [66, -134], [84, -126], [90, -112], [80, -96], [72, -88], [64, -110]],
      head: [[82, -130], [96, -128], [104, -112], [112, -88], [110, -78], [100, -76], [92, -88], [84, -104], [78, -112]],
      legs, legW: cow ? 15 : 19, lowW: .5, foot: { w: 6, l: 9 }, ears: [[[94, -120], [108, -116], 6]], eye: [98, -114],
      tail: { pts: [[-84, -120], [-90, -80], [-88, -44]], w: 4, n: 1, j: 1 }, belly: [[[60, -58], [0, -52], [-56, -62]], 12],
      marks: [[[58, -126], [50, -80], 5, 10], [[-58, -122], [-74, -82], -6, 10]],
      back: [[-86, -106], [-80, -124], [-50, -130], [-10, -131], [28, -134], [48, -142], [66, -134], [84, -127], [96, -128]], shw: 95,
    };
  }
  function paintOx(S, sc, o = {}) {
    const cow = !!o.cow, g = oxGeo(o.pose === 'walk' ? 'walk' : 'stand', cow);
    const pied = cow && rnd() < .35;
    const coat = o.col ? WC.col(o.col) : pied ? mixc(C.paperDark, C.stone, .3) : pick([mixc(C.wood, C.ground, .3), mixc(C.wood, C.ink, .2), mixc(C.stone, C.paperDark, .3), mixc(C.roof, C.wood, .5), mixc(C.ground, C.wood, .2)]);
    const K = quad(S, sc, g, coat, o);
    if (pied) for (let k = 0; k < 3; k++) wsh(S, oval(K([rnd(-60, 40), rnd(-115, -75)]), rnd(14, 24) * sc, rnd(10, 16) * sc, 10, .25), mixc(C.ink, C.wood, .25), .8, 2, sc);
    const horn = mixc(C.paperDark, C.stone, .35), hl = cow ? .55 : 1;
    ln(S, K([88, -128]), K([88 - 10 * hl, -128 - 16 * hl]), 4.5 * sc, dk(horn, .2), { prof: 'tip', bend: -4 * sc });
    const hn = chn(S, [[93, -127], [93 + 13 * hl, -127 - 9 * hl], [93 + 19 * hl, -127 - 23 * hl]].map(K), 6 * sc, horn, { prof: 'tip' });
    S.push(edgeOf(hn, 1, .9 * sc, C.ink, .5));
    ln(S, K([109, -82]), K([106, -80]), 2.6 * sc, C.ink, { a: .6 });
    ln(S, K([-88, -48]), K([-87, -38]), 7 * sc, dk(coat, .5), { prof: 'leaf' });
    if (cow) wsh(S, oval(K([-36, -52]), 10 * sc, 6 * sc, 8, .1), mixc(C.skin, C.paperDark, .3), .85, 2, sc * .5);
    return K;
  }
  WC.G.ox = (sc, o = {}) => { const S = []; paintOx(S, sc, o); if (o.face === 'left') xform(S, 0, 0, true); return { S, top: [0, -142 * sc] }; };

  // ---------------------------------------------------------------- cart
  function wheel(S, c, r, solid, sc) {
    const wood = mixc(C.wood, C.paper, .12), woodD = dk(C.wood, .35);
    if (solid) {
      wsh(S, oval(c, r, r, 20, .02), wood, .93, 3, sc * .6);
      chn(S, circ(c, r * .86, 24), r * .1, woodD, { a: .45, n: 30 });
      ln(S, add(c, [-r * .3, -r * .92]), add(c, [-r * .3, r * .92]), 1.6 * sc, woodD, { a: .5 }); ln(S, add(c, [r * .32, -r * .92]), add(c, [r * .32, r * .92]), 1.6 * sc, woodD, { a: .5 });
    } else {
      chn(S, circ(c, r * .92, 24), r * .14, wood, { n: 30 });
      for (let k = 0; k < 10; k++) { const t = k / 10 * Math.PI * 2 + .15; ln(S, add(c, [Math.cos(t) * r * .15, Math.sin(t) * r * .15]), add(c, [Math.cos(t) * r * .86, Math.sin(t) * r * .86]), r * .05, woodD, { a: .85 }); }
    }
    wsh(S, oval(c, r * .2, r * .2, 10, .05), woodD, .9, 2, sc * .4);
    ink(S, circ(c, r * 1.0, 20, Math.PI * .1, Math.PI * 1.1), 1.2 * sc, .5, 4);
  }
  WC.G.cart = (sc, o = {}) => {
    const S = [], style = ['ox', 'horse', 'covered'].includes(o.style) ? o.style : 'ox', animal = o.animal || (style === 'ox' ? 'ox' : 'horse');
    const K = (x, y) => [x * sc, y * sc], wood = mixc(C.wood, C.paper, .12), woodD = dk(C.wood, .3), off = -30;
    const ox0 = animal === 'ox' ? 120 : 112;
    const place = (fn, dx, dy, extra) => { const L = []; fn(L, extra); xform(L, dx * sc, dy * sc, false); S.push(...L); };
    // far animal (a yoked pair of oxen; horses: one between shafts)
    if (animal === 'ox') place(L => paintOx(L, sc * .98, { pose: o.pose, col: o.col2, noShadow: true }), ox0 + 14 + off, -7);
    shadow(S, (ox0 / 2 - 40 + off) * sc, 190 * sc, 8 * sc, .24);
    const solid = style === 'ox';
    // far wheel(s)
    const wR = solid ? 36 : 30, w1 = solid ? [-92 + off, -36] : [-140 + off, -30], w2 = solid ? null : [-30 + off, -26];
    wheel(S, K(w1[0] + 10, w1[1] - 6), wR * sc * .97, solid, sc); if (w2) wheel(S, K(w2[0] + 10, w2[1] - 6), 26 * sc * .97, solid, sc);
    // the bed
    const bx0 = solid ? -172 + off : -182 + off, bx1 = solid ? -8 + off : 0 + off, by = solid ? -62 : -58;
    if (solid) {
      wsh(S, [K(bx0, by - 6), K(bx1, by - 6), K(bx1, by + 4), K(bx0, by + 4)], woodD, .9, 2, sc);
      for (let x = bx0 + 6; x < bx1; x += 18) ln(S, K(x, by - 4), K(x - 3, by - 44), 3 * sc, wood);
      ln(S, K(bx0, by - 42), K(bx1, by - 44), 4.5 * sc, wood); ln(S, K(bx0, by - 24), K(bx1, by - 25), 3 * sc, wood, { a: .8 });
    } else {
      const box = [K(bx0, by - 38), K(bx1, by - 38), K(bx1 - 4, by + 4), K(bx0 + 4, by + 4)];
      wsh(S, box, wood, .92, 3, sc);
      for (let k = 1; k < 3; k++) ln(S, lerp(box[0], box[3], k / 3), lerp(box[1], box[2], k / 3), 1.6 * sc, woodD, { a: .5 });
      ink(S, [box[0], box[3], box[2]], 1.2 * sc, .5);
    }
    // load / canvas hood
    const L0 = o.load || (style === 'covered' ? 'none' : 'hay');
    if (style === 'covered') {
      const cv = mixc(C.paperDark, C.stone, .25), hood = [K(bx0 - 6, by - 36), K(bx0 + 2, by - 92), K((bx0 + bx1) / 2, by - 112), K(bx1 - 2, by - 92), K(bx1 + 6, by - 36)];
      wsh(S, hood, cv, .92, 3, sc);
      for (let k = 1; k < 5; k++) { const x = bx0 + (bx1 - bx0) * k / 5; ln(S, K(x, by - 36), K(x, by - 108 + Math.abs(k - 2.5) * 6), 2.4 * sc, dk(cv, .25), { a: .6 }); }
      wsh(S, oval(K(bx1 - 4, by - 66), 10 * sc, 26 * sc, 10, .05), dk(cv, .5), .6, 2, sc);
      ink(S, hood, 1.3 * sc, .5);
    } else if (L0 === 'hay') {
      const hc = mixc(C.clothC, C.ground, .4), hp = [K(bx0 - 6, by - 40), K(bx0 + 8, by - 90), K((bx0 + bx1) / 2, by - 104), K(bx1 - 8, by - 88), K(bx1 + 4, by - 40)];
      wsh(S, hp, hc, .92, 3, sc);
      for (let k = 0; k < 26; k++) { const x = rnd(bx0, bx1), y = rnd(by - 96, by - 44); ln(S, K(x, y), K(x + rnd(-14, 14), y + rnd(-10, 6)), 2 * sc, pick([dk(hc, .25), lite(hc, .3), C.clothC]), { a: .7, prof: 'tip' }); }
    } else if (L0 === 'sacks') {
      for (const [x, y, t] of [[.18, -24, -.15], [.42, -26, .1], [.68, -24, -.05], [.3, -50, .2], [.56, -52, -.2]]) {
        const sx = bx0 + (bx1 - bx0) * x, c = pick([mixc(C.ground, C.wood, .3), mixc(C.clothC, C.wood, .35), mixc(C.stone, C.wood, .3)]), cc = K(sx, by + y);
        const sk = smooth([[-17, 12], [-19, -4], [-12, -16], [-5, -19], [5, -19], [12, -16], [19, -4], [17, 12], [0, 15]].map(([a, b]) => add(cc, [(a + b * t * .3) * sc, b * sc])), 1);
        wsh(S, sk, c, .93, 3, sc);
        wsh(S, oval(add(cc, [4 * sc, 5 * sc]), 11 * sc, 9 * sc, 10, .1), dk(c, .25), .3, 2, sc);
        ln(S, add(cc, [-6 * sc, -18 * sc]), add(cc, [6 * sc, -18 * sc]), 2.2 * sc, dk(c, .45));
        ln(S, add(cc, [0, -18 * sc]), add(cc, [t * 6 * sc - 3 * sc, -26 * sc]), 6 * sc, c, { prof: 'leaf' });
        ink(S, sk.slice(10, 18), 1 * sc, .4);
      }
    } else if (L0 === 'barrels') {
      for (const x of [.22, .5, .78]) { const cx = bx0 + (bx1 - bx0) * x, b = [K(cx - 14, by - 4), K(cx - 19, by - 20), K(cx - 19, by - 36), K(cx - 14, by - 52), K(cx + 14, by - 52), K(cx + 19, by - 36), K(cx + 19, by - 20), K(cx + 14, by - 4)]; wsh(S, smooth(b, 1), mixc(C.wood, C.paper, .25), .93, 3, sc); wsh(S, oval(K(cx, by - 52), 14 * sc, 4 * sc, 10, .05), dk(C.wood, .15), .8, 2, sc * .5); for (const y of [-12, -40]) ln(S, K(cx - 17, by + y), K(cx + 17, by + y), 2.6 * sc, woodD); ink(S, b.slice(0, 3), 1.1 * sc, .5); }
    }
    // near wheel(s), pole / shafts
    wheel(S, K(...w1), wR * sc, solid, sc); if (w2) wheel(S, K(...w2), 26 * sc, solid, sc);
    const hitch = animal === 'ox' ? [ox0 + 64 + off, -136] : [ox0 + 50 + off, -112];
    ln(S, K(bx1 - 4, by - 2), K(...hitch), (animal === 'ox' ? 5 : 3.5) * sc, woodD, { bend: animal === 'ox' ? -6 * sc : 0 });
    // near animal
    if (animal === 'ox') place(L => paintOx(L, sc, { pose: o.pose, col: o.col, noShadow: true }), ox0 + off, 0);
    else place(L => { paintHorse(L, sc, { pose: o.pose === 'walk' ? 'walk' : 'stand', coat: o.coat, noShadow: true }); }, ox0 + off, 0);
    if (animal === 'ox') { ln(S, K(ox0 + 54 + off, -146), K(ox0 + 76 + off, -128), 7 * sc, woodD); ln(S, K(ox0 + 62 + off, -140), K(ox0 + 70 + off, -112), 2 * sc, C.ink, { a: .6 }); }
    else { ln(S, K(bx1 - 4, by - 6), K(ox0 + 52 + off, -112), 3.5 * sc, woodD); chn(S, [K(ox0 + 40 + off, -150), K(ox0 + 66 + off, -128), K(ox0 + 62 + off, -100)], 7 * sc, mixc(C.wood, C.ink, .45)); }
    // driver
    if (o.driver) {
      const sp = dressSpec(o.driverDress || 'peasant', o), H = 170 * sc, J = joints('sit', { seat: 'stool' }, false), P = {};
      const at = K(solid ? bx1 - 22 : bx1 - 18, by - (solid ? 8 : 38));
      for (const k in J) P[k] = k === 'ft' || k === 'ft2' ? mul(J[k], H) : add(mul(sub(J[k], J.hp), H), at);
      paintPerson(S, P, H, sp, { pose: 'sit', noShadow: true, hold: 'none' }, []);
    }
    if (o.face === 'left') xform(S, 0, 0, true);
    return { S, top: [0, -160 * sc] };
  };

  // ---------------------------------------------------------------- dog
  WC.G.dog = (sc, o = {}) => {
    const S = [], pose = ['stand', 'run', 'sit'].includes(o.pose) ? o.pose : 'stand';
    const coat = o.col ? WC.col(o.col) : pick([mixc(C.wood, C.ground, .35), mixc(C.ink, C.wood, .35), mixc(C.ground, C.paperDark, .3), mixc(C.wood, C.roof, .3), mixc(C.stone, C.ink, .25)]);
    const g = {
      body: [[30, -46], [26, -36], [12, -33], [-8, -34], [-22, -38], [-34, -44], [-38, -52], [-30, -58], [-6, -56], [16, -58], [28, -56]],
      neck: [[14, -58], [26, -70], [34, -76], [40, -66], [32, -50], [26, -46]],
      head: [[29, -79], [40, -83], [46, -77], [56, -73], [57, -67], [48, -64], [38, -64], [31, -70]],
      legs: [[[24, -40], [25, -20], [25, -5], [28, -2]], [[16, -40], [15, -20], [14, -5], [17, -2]], [[-28, -46], [-22, -26], [-32, -12], [-29, -2]], [[-34, -46], [-28, -26], [-38, -12], [-35, -2]]],
      legW: 8, lowW: .6, foot: { w: 4, l: 6 }, eye: [44, -76],
      tail: { pts: [[-36, -54], [-48, -62], [-52, -74]], w: 5, n: 1 }, belly: [[[24, -36], [-20, -38]], 6], shw: 45,
      ears: [[[34, -80], [28, -67], 7, dk(coat, .35)]], back: [[-38, -52], [-30, -58], [-6, -56], [16, -58], [26, -70], [34, -77]],
    };
    if (pose === 'run') {
      g.legs = [[[24, -42], [36, -30], [44, -18], [49, -14]], [[16, -42], [20, -28], [10, -20], [5, -17]], [[-28, -46], [-40, -30], [-54, -20], [-59, -17]], [[-34, -46], [-22, -32], [-12, -24], [-7, -21]]];
      g.body = g.body.map(([x, y]) => [x * 1.05, y + (x > 0 ? -2 : 0)]);
      g.tail.pts = [[-36, -54], [-52, -58], [-64, -60]]; g.ears = [[[34, -80], [24, -78], 7, dk(coat, .35)]];
    }
    if (pose === 'sit') {
      g.body = [[30, -50], [26, -40], [14, -30], [-2, -14], [-14, -4], [-24, -8], [-24, -24], [-14, -44], [6, -60], [24, -62]];
      g.neck = g.neck.map(([x, y]) => [x, y - 8]); g.head = g.head.map(([x, y]) => [x, y - 8]); g.eye = [44, -84]; g.ears = [[[34, -88], [28, -75], 7, dk(coat, .35)]];
      g.legs = [[[24, -40], [25, -20], [25, -5], [28, -2]], [[16, -40], [15, -20], [14, -5], [17, -2]], [[-14, -22], [0, -14], [-6, -4], [2, -2]], [[-20, -22], [-6, -14], [-12, -4], [-4, -2]]];
      g.tail.pts = [[-22, -6], [-36, -4], [-46, -8]]; g.back = [[-24, -10], [-14, -44], [6, -60], [24, -70], [34, -85]];
    }
    const K = quad(S, sc, g, coat, o);
    const hy = pose === 'sit' ? -8 : 0;
    ln(S, K([55, -70 + hy]), K([58, -69 + hy]), 3 * sc, C.ink, { a: .7 });
    if (o.face === 'left') xform(S, 0, 0, true);
    return { S, sway: 0, top: [40 * sc, -84 * sc] };
  };

  // ---------------------------------------------------------------- elephant
  WC.G.elephant = (sc, o = {}) => {
    const S = [], walk = o.pose === 'walk', coat = o.col ? WC.col(o.col) : mixc(mixc(C.smoke, C.stone, .35), C.far, .2);
    const g = {
      body: [[78, -178], [84, -140], [70, -106], [40, -94], [0, -88], [-50, -92], [-90, -108], [-110, -140], [-108, -180], [-90, -214], [-50, -236], [0, -244], [40, -240], [66, -222]],
      head: [[60, -232], [78, -258], [104, -262], [124, -250], [134, -226], [136, -200], [128, -186], [106, -180], [84, -184], [68, -200]],
      legs: walk
        ? [[[66, -140], [80, -76], [78, -30], [82, -4]], [[46, -140], [44, -72], [42, -24], [46, -4]], [[-76, -140], [-74, -72], [-68, -24], [-64, -4]], [[-96, -140], [-106, -72], [-110, -24], [-106, -4]]]
        : [[[66, -140], [70, -72], [70, -24], [74, -4]], [[46, -140], [46, -72], [46, -24], [50, -4]], [[-76, -140], [-80, -72], [-80, -24], [-76, -4]], [[-96, -140], [-98, -72], [-98, -24], [-94, -4]]],
      legW: 40, lowW: .95, legProf: 'even', tail: { pts: [[-108, -180], [-118, -140], [-116, -112]], w: 5, n: 1 }, belly: [[[64, -104], [0, -92], [-80, -108]], 22],
      marks: [[[-40, -228], [-90, -150], -10, 18], [[30, -236], [60, -120], 8, 16]], back: [[-108, -180], [-90, -214], [-50, -236], [0, -244], [40, -240], [78, -258], [104, -262], [124, -250]], shw: 150,
    };
    const K = quad(S, sc, g, coat, o);
    // trunk, ear, tusk, eye, toenails, wrinkles
    const tr = chn(S, [[130, -205], [140, -170], [144, -130], [142, -90], [146, -58], [158, -46]].map(K), 26 * sc, coat, { prof: 'trunk', nb: 3 });
    S.push(edgeOf(tr, -1, 1.2 * sc, C.ink, .45));
    for (let k = 0; k < 6; k++) { const p = K(lerp([140, -170], [144, -80], k / 5)); ln(S, add(p, [-8 * sc, 0]), add(p, [7 * sc, 1 * sc]), 1.6 * sc, dk(coat, .35), { a: .5, bend: 2 * sc }); }
    const ear = [[72, -246], [100, -250], [112, -232], [110, -196], [98, -168], [80, -162], [66, -180], [62, -212]].map(K);
    wsh(S, ear, dk(coat, .12), .9, 3, sc); ink(S, ear.slice(2, 7), 1.3 * sc, .5);
    ln(S, K([96, -236]), K([88, -186]), 6 * sc, dk(coat, .3), { a: .35, bend: 4 * sc });
    if (o.tusks !== false) { const tk = chn(S, [[124, -190], [146, -178], [166, -184]].map(K), 9 * sc, mixc(C.paperLight, C.clothC, .18), { prof: 'tip' }); S.push(edgeOf(tk, 1, 1 * sc, C.ink, .55)); }
    ln(S, K([116, -222]), K([119, -221]), 3 * sc, C.ink, { a: .7 });
    for (const L of [g.legs[0], g.legs[2]]) { const p = K(L[3]); for (let k = 0; k < 3; k++) ln(S, add(p, [(-6 + k * 7) * sc, -5 * sc]), add(p, [(-3 + k * 7) * sc, -4 * sc]), 4 * sc, lite(coat, .45), { prof: 'leaf' }); for (let k = 0; k < 2; k++) { const q = K(lerp(L[1], L[2], .2 + k * .3)); ln(S, add(q, [-10 * sc, 0]), add(q, [9 * sc, 2 * sc]), 1.2 * sc, dk(coat, .3), { a: .3, bend: 3 * sc }); } }
    if (o.howdah) {
      const rug = [[-74, -232], [44, -246], [56, -170], [0, -150], [-80, -164]].map(K), rc = C.cloth;
      wsh(S, rug, rc, .92, 3, sc); chn(S, [rug[2], rug[3], rug[4]], 5 * sc, C.clothC, { a: .85 });
      for (let k = 0; k < 9; k++) { const p = lerp(rug[4], rug[2], k / 8); p[1] += Math.sin(k / 8 * Math.PI) * 14 * sc; ln(S, p, add(p, [0, 8 * sc]), 2.2 * sc, C.clothC, { a: .8 }); }
      const box = [[-50, -244], [30, -250], [30, -290], [-50, -284]].map(K);
      wsh(S, box, mixc(C.wood, C.clothC, .2), .93, 3, sc); ln(S, box[3], box[2], 4 * sc, C.clothC); ln(S, box[0], box[1], 4 * sc, dk(C.wood, .3));
      for (const x of [-46, -10, 26]) ln(S, K([x, -290]), K([x, -326]), 3 * sc, dk(C.wood, .3));
      const roof = [[-60, -322], [36, -330], [12, -360], [-10, -366], [-34, -358]].map(K);
      wsh(S, roof, C.clothB, .92, 3, sc); ink(S, roof, 1.2 * sc, .45); ink(S, box, 1.2 * sc, .45);
    }
    if (o.face === 'left') xform(S, 0, 0, true);
    return { S, top: [0, (o.howdah ? -366 : -262) * sc] };
  };

  // ---------------------------------------------------------------- eagle (seen from below, in flight; origin = centre)
  WC.G.eagle = (sc, o = {}) => {
    const S = [], K = p => [p[0] * sc, p[1] * sc], flap = o.pose === 'flap';
    const body = o.col ? WC.col(o.col) : mixc(C.wood, C.ink, .3), cov = mixc(C.wood, C.clothC, .35), prim = mixc(C.wood, C.ink, .55);
    for (const s of [-1, 1]) {
      let wing = [[10, -14], [40, -24], [72, -27], [96, -21], [108, -12], [104, -2], [86, 8], [60, 14], [32, 16], [12, 14]];
      if (flap) wing = rotP(wing, [8, -6], -.55);
      const W = wing.map(([x, y]) => K([x * s, y]));
      wsh(S, W, body, .9, 3, sc);
      wsh(S, W.slice(0, 5).concat([lerp(W[4], W[6], .5), lerp(W[3], W[7], .5), lerp(W[1], W[8], .45)]), cov, .5, 2, sc);
      for (let k = 0; k < 9; k++) { const p = lerp(W[5], W[9], k / 8), q = add(p, K([s * rnd(-3, 3), rnd(8, 14)])); ln(S, p, q, 7 * sc, prim, { prof: 'leaf', a: .8 }); }
      const tipC = lerp(W[3], W[5], .5), tipDir = unit(sub(W[4], W[1]));
      for (let k = 0; k < 5; k++) { const p = lerp(W[3], W[5], k / 4), ang = Math.atan2(tipDir[1], tipDir[0]) + (k - 2) * .16; ln(S, p, add(p, [Math.cos(ang) * 26 * sc, Math.sin(ang) * 26 * sc]), 7 * sc, prim, { prof: 'leaf', a: .9 }); }
      ink(S, W.slice(0, 5), 1.3 * sc, .55);
      void tipC;
    }
    wsh(S, [[-20, 24], [20, 24], [26, 56], [0, 62], [-26, 56]].map(K), body, .92, 3, sc);
    for (let k = 0; k < 5; k++) ln(S, K([(-14 + k * 7) * .9, 28]), K([-20 + k * 10, 58]), 3 * sc, prim, { a: .5 });
    wsh(S, oval([0, 0], 14 * sc, 32 * sc, 14, .05), dk(body, .1), .94, 3, sc);
    wsh(S, oval(K([0, -34]), 10 * sc, 11 * sc, 12, .05), mixc(C.clothC, C.wood, .35), .94, 3, sc);
    ln(S, K([0, -43]), K([2, -51]), 5 * sc, C.gold, { prof: 'tip' });
    ln(S, K([-6, 26]), K([-6, 34]), 4 * sc, C.gold, { a: .8 }); ln(S, K([6, 26]), K([6, 34]), 4 * sc, C.gold, { a: .8 });
    return { S, top: [0, -50 * sc] };
  };

  // ---------------------------------------------------------------- herds
  function sheepPaint(S, sc, o = {}) {
    const wool = mixc(C.paperDark, C.stone, rnd(.15, .4)), face = pick([mixc(C.ink, C.wood, .3), mixc(C.ink, C.wood, .3), mixc(C.skin, C.wood, .3)]), graze = o.graze ?? rnd() < .4;
    const K = p => [p[0] * sc, p[1] * sc];
    if (!o.noShadow) shadow(S, 0, 40 * sc, 5 * sc);
    for (const x of [16, -20]) ln(S, K([x - 3, -24]), K([x - 4, -2]), 3.5 * sc, dk(face, .1));
    wsh(S, oval(K([-4, -36]), 33 * sc, 17 * sc, 16, .1), wool, .92, 3, sc);
    for (let k = 0; k < 9; k++) { const p = K([rnd(-30, 22), rnd(-48, -26)]); ln(S, add(p, [-6 * sc, 0]), add(p, [6 * sc, -2 * sc]), 9 * sc, pick([wool, lite(wool, .3), dk(wool, .15)]), { prof: 'leaf', a: .6 }); }
    st(S, along([K([-30, -26]), K([0, -21]), K([24, -27])], 8), 7 * sc, dk(wool, .3), { prof: 'leaf', a: .45 });
    for (const x of [10, -26]) ln(S, K([x, -24]), K([x + 1, -2]), 3.5 * sc, face);
    const hd = graze ? [[22, -34], [32, -10]] : [[22, -42], [36, -36]];
    ln(S, K(hd[0]), K(hd[1]), 11 * sc, face, { prof: 'leaf' });
    ln(S, K([22, graze ? -32 : -44]), K([14, graze ? -30 : -44]), 5 * sc, face, { prof: 'leaf' });
    ink(S, oval(K([-4, -36]), 33 * sc, 17 * sc, 12, .08).slice(6, 12), 1 * sc, .35);
  }
  WC.G.sheep = (sc, o = {}) => {
    const S = [], n = o.n ?? 12, Wd = (o.w ?? 420) * sc, pts = [];
    for (let i = 0; i < n; i++) pts.push([rnd(-Wd / 2, Wd / 2), -rnd(0, 1) * Wd * .16, rnd(.85, 1.1), rnd() < .5]);
    pts.sort((a, b) => a[1] - b[1]);
    shadow(S, 0, Wd * .55, 12 * sc, .18);
    for (const [x, y, s, flip] of pts) { const L = []; sheepPaint(L, sc * s * (1 + y / Wd * .6), { noShadow: true }); xform(L, x, y, flip); S.push(...L); }
    return { S, top: [0, -60 * sc] };
  };
  WC.G.cattle = (sc, o = {}) => {
    const S = [], n = o.n ?? 6, Wd = (o.w ?? 520) * sc, pts = [];
    for (let i = 0; i < n; i++) pts.push([(-Wd / 2 + Wd * (i + .5) / n) + rnd(-.3, .3) * Wd / n, -rnd(0, 1) * Wd * .14, rnd(.88, 1.05), rnd() < .5]);
    pts.sort((a, b) => a[1] - b[1]);
    shadow(S, 0, Wd * .6, 14 * sc, .18);
    for (const [x, y, s, flip] of pts) { const L = []; paintOx(L, sc * s * .82 * (1 + y / Wd * .6), { cow: true, noShadow: true, pose: rnd() < .4 ? 'walk' : 'stand' }); xform(L, x, y, flip); S.push(...L); }
    return { S, top: [0, -140 * sc] };
  };
})();
