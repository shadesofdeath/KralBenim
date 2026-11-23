// wc_g_places — watercolour architecture and places for the WC.G registry (wc__lib.js): houses, towers, walls,
// castles, domes, mosques, minarets, churches, temples, columns, ruins, pyramids, ziggurats, arches, bridges,
// lighthouses, windmills, tents, huts, palaces, factories, whole-city skylines and interior pieces (window, door,
// table, chair, throne, shelf). In a wc_scene: {"g": "mosque", "x": .5, "o": {"minarets": 4}}.
//
// Conventions: origin = base centre on the ground (bridge: its centre on the riverbank / water line), y negative
// upward, sc 1 = natural size on a 1080p stage (house ≈ 220 px tall, mosque ≈ 430 px with its minarets). Every
// generator paints at sc 1 in natural pixels and the finished list is scaled, so a far skyline and a close door
// are the same painting. Light comes from the left (right-hand faces in shade, as in the nature generators).
// Buildings are seen front-on with a narrow receding right side (the slight bird's-eye oblique of an illustrated
// history book). Painting order: back parts first; inside a part washes -> shade -> structure -> openings -> ink.
// Colour options (o.col, o.roof, ...) take palette token names ("stone", "roof", "clothB" ...), never hex.
'use strict';

(() => {
  const C = WC.C;
  const { G, rnd, pick, mk, qcurve, qctrl, along, washShape, mixc } = WC;
  const PI = Math.PI;
  const T = (v, fb) => (v ? WC.col(v) : fb);                      // an option colour: palette token name
  const LEAD = () => mixc(mixc(C.stoneDark, C.waterDeep, .42), C.paper, .12);   // lead roofs and domes
  const STONE = () => mixc(C.stone, C.paper, .18);
  const SHADE = () => mixc(C.stoneDark, C.stone, .3);
  const DARK = () => mixc(C.ink, C.waterDeep, .3);                // an opening in shadow

  // ------------------------------------------------------------ scale + finish
  function scaleL(S, k) {
    if (k === 1) return S;
    const f = ([x, y]) => [x * k, y * k];
    for (const s of S) {
      s.pts = s.pts.map(f);
      if (s.poly) { s.poly = s.poly.map(r => r.map(f)); continue; }
      s.ws = s.ws.map(w => Math.max(.55, w * k));
      if (s.br) for (const b of s.br) { b.bw = Math.max(.45, b.bw * k); b.dash = b.dash.map(d => Math.max(.5, d * k)); }
    }
    return S;
  }
  const fin = (S, sc, x = {}) => Object.assign({}, x, { S: scaleL(S, sc) }, x.top ? { top: [x.top[0] * sc, x.top[1] * sc] } : {});
  const liveAt = (sc, fn) => (c, lt, it) => { c.save(); c.scale(sc, sc); fn(c, lt, it); c.restore(); };

  // ------------------------------------------------------------ geometry
  const box = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  function sub(pts, n = 3) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  function dims(pts) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return [x0, y0, x1, y1];
  }
  // a translucent wash polygon (3 jittered passes: pooled edges), laid a little loosely (off-register with the ink)
  function wash(S, pts, colour, a = .8, o = {}) {
    const [x0, y0, x1, y1] = dims(pts), m = Math.min(x1 - x0, y1 - y0);
    const mis = o.mis ?? Math.min(3.5, m * .05), dx = rnd(-mis, mis), dy = rnd(-mis, mis);
    const P = (o.n === 0 ? pts : sub(pts, o.n ?? 3)).map(([x, y]) => [x + dx, y + dy]);
    S.push(washShape(P, colour, a, o.passes ?? 3, o.jit ?? Math.min(2.8, .6 + m * .04)));
  }
  // a painted surface: a wash, then dry-brush strokes across it in the same pigment, heavier toward the bottom
  // (or the right, dir 'v'): visible brushwork and a graded value instead of a flat fill
  function face(S, pts, colour, o = {}) {
    wash(S, pts, colour, o.a ?? .66, o);
    const [x0, y0, x1, y1] = dims(pts), W = x1 - x0, H = y1 - y0, v = o.dir === 'v', span = v ? W : H;
    if (o.tex === false || Math.min(W, H) < 14) return;
    // variegation: a soft warm or cool glaze dropped into the wet wash
    let ar = 0; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; ar += ax * by - bx * ay; }
    if (W > 36 && H > 30 && o.vary !== false && Math.abs(ar) / 2 > W * H * .8) for (let i = 0; i < (W * H > 20000 ? 2 : 1); i++) {
      const rx = W * rnd(.14, .28), ry = H * rnd(.16, .3);
      S.push(washShape(WC.blobPts(rnd(x0 + rx * 1.15, x1 - rx * 1.15), rnd(y0 + ry * 1.15, y1 - ry * 1.15), rx, ry, 14, .35),
        pick([C.skyWarm, C.clothC, C.far, C.stoneDark, C.roof]), .1, 2, 3));
    }
    const gap = o.gap ?? Math.max(7, Math.min(16, span / 6));
    rows(S, pts, o.tcol || mixc(colour, C.stoneDark, .2), { dir: o.dir, gap, w: gap * 1.3, a: o.ta ?? .17, ga: o.ga ?? .24, nb: Math.round(Math.max(3, Math.min(7, gap / 2.5))), broken: .1, inset: 1, rough: .4 });
  }
  const shear = (pts, x0, k) => (k ? pts.map(([x, y]) => [x, y + (x - x0) * k]) : pts);
  // the receding side face of a block: from the front edge (x, yT..yB) back along D
  const sideF = (x, yT, yB, D) => [[x, yT], [x + D[0], yT + D[1]], [x + D[0], yB + D[1]], [x, yB]];
  // a semi-ellipse profile from the left base over the top to the right base
  function arcPts(cx, by, r, h, n = 12, a0 = PI, a1 = 2 * PI) {
    const out = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * r, by + Math.sin(a) * h]); }
    return out;
  }

  // ------------------------------------------------------------ brush lines
  function line(S, x0, y0, x1, y1, w, colour = C.ink, a = .8, o = {}) {
    const L = Math.hypot(x1 - x0, y1 - y0); if (L < .5) return;
    S.push(mk(qcurve(x0, y0, x1, y1, o.bend ?? rnd(-1, 1) * Math.min(2, L * .015), Math.max(3, Math.min(14, Math.round(L / 9)))), w, colour,
      { prof: o.prof || 'even', nb: o.nb ?? 0, a, rough: o.rough ?? .3 }));
  }
  // a loose ink line along a polyline: each segment its own stroke, ends overshoot or stop short a little
  function pen(S, pts, w = 2, a = .8, colour = C.ink, closed = false, skip = 0) {
    const n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      if (skip && rnd() < skip) continue;
      const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % n], L = Math.hypot(x1 - x0, y1 - y0); if (L < 1) continue;
      const ux = (x1 - x0) / L, uy = (y1 - y0) / L, e0 = rnd(-1.5, 2.5), e1 = rnd(-1.5, 2.5);
      line(S, x0 - ux * e0, y0 - uy * e0, x1 + ux * e1, y1 + uy * e1, w * rnd(.85, 1.15), colour, a);
    }
  }
  // ink along a dense curve (domes, arches), in chunks of k points
  function curve(S, pts, w = 2, a = .8, colour = C.ink, k = 5) {
    for (let i = 0; i < pts.length - 1; i += k) {
      const part = pts.slice(i, Math.min(pts.length, i + k + 1)); if (part.length < 2) continue;
      S.push(mk(along(part, Math.max(4, part.length * 2)), w * rnd(.85, 1.15), colour, { prof: 'even', nb: 0, a, rough: .3 }));
    }
  }
  // dry-brush texture: parallel strokes across a polygon (dir 'h' rows, 'v' columns); o: gap, w, a, broken, bend, p, nb
  function spans(P, y) {
    const xs = [];
    for (let i = 0; i < P.length; i++) {
      const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length];
      if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0));
    }
    xs.sort((a, b) => a - b);
    const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
    return out;
  }
  function rows(S, pts, colour, o = {}) {
    const v = o.dir === 'v', P = v ? pts.map(([x, y]) => [y, x]) : pts;
    let y0 = 1e9, y1 = -1e9; for (const p of P) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const gap = o.gap ?? 12, w = o.w ?? gap * 1.2, ins = o.inset ?? Math.min(w * .3, 3);
    for (let y = y0 + gap * (o.off ?? .5); y < y1 - gap * .15; y += gap * rnd(.85, 1.15)) {
      for (const [a, b] of spans(P, y)) {
        if (o.p != null && rnd() > o.p) continue;
        let xa = a + ins, xb = b - ins;
        if (o.broken) { const L = xb - xa; xa += rnd(0, L * o.broken); xb -= rnd(0, L * o.broken); }
        if (xb - xa < Math.max(2, w * .5)) continue;
        const pp = qcurve(xa, y, xb, y + rnd(-.15, .15) * w, (o.bend ?? 0) + rnd(-.2, .2) * w, Math.max(4, Math.min(16, Math.round((xb - xa) / 14))));
        const al = (o.a ?? .3) + (o.ga ?? 0) * (y - y0) / Math.max(1, y1 - y0);
        S.push(mk(v ? pp.map(([x, yy]) => [yy, x]) : pp, w, colour, { prof: o.prof || 'even', nb: o.nb, a: al * rnd(.75, 1.15), rough: o.rough ?? .3 }));
      }
    }
  }
  // soft darker blooms (weathering, backruns) inside a box
  function stains(S, x0, y0, x1, y1, colour, n = 3, a = .1) {
    for (let i = 0; i < n; i++) {
      const rx = rnd(.1, .26) * (x1 - x0), ry = rnd(.1, .26) * (y1 - y0);
      S.push(washShape(WC.blobPts(rnd(x0 + rx, x1 - rx), rnd(y0 + ry, y1 - ry), rx, ry, 14, .3), colour, a, 2, 2));
    }
  }
  // the soft shadow where a building meets the ground
  function contact(S, x0, x1, a = .2) {
    wash(S, [[x0 - 12, 3], [x0, -2], [x1, -2], [x1 + 18, 3], [x1 + 4, 8], [x0 - 4, 7]], mixc(C.stoneDark, C.ink, .3), a, { n: 2, jit: 2 });
  }

  // ------------------------------------------------------------ openings
  // outline of an opening (from the bottom-left): 'rect' | 'round' | 'pointed' | 'ogee'
  function opening(cx, yb, w, h, kind = 'round', n = 8) {
    const r = w / 2, pts = [[cx - r, yb], [cx + r, yb]];
    if (kind === 'rect') { pts.push([cx + r, yb - h], [cx - r, yb - h]); return pts; }
    if (kind === 'pointed') {
      const ys = Math.min(yb - 2, yb - h + w * .8); pts.push([cx + r, ys]);
      qctrl(cx + r, ys, cx + r * .98, ys - (ys - (yb - h)) * .62, cx, yb - h, n).slice(1).forEach(p => pts.push(p));
      qctrl(cx, yb - h, cx - r * .98, ys - (ys - (yb - h)) * .62, cx - r, ys, n).slice(1).forEach(p => pts.push(p));
      return pts;
    }
    const ys = Math.min(yb - 2, yb - h + r); pts.push([cx + r, ys]);
    for (let i = 1; i < n; i++) { const a = i / n * PI; pts.push([cx + Math.cos(a) * r, ys - Math.sin(a) * Math.min(r, yb - h < ys ? ys - (yb - h) : r)]); }
    pts.push([cx - r, ys]);
    return pts;
  }
  // a window / door opening: dark wash, optional glazing bars, sill and ink. o: k (shear), lit, col, a, grid [nv, nh], sill
  function win(S, cx, yb, w, h, kind = 'rect', o = {}) {
    const k = o.k || 0, tf = p => shear(p, cx, k);
    const pts = tf(opening(cx, yb, w, h, kind, Math.max(4, Math.min(10, Math.round(w / 3)))));
    const dark = o.col || (o.lit ? mixc(C.gold, C.fire, .22) : DARK());
    // a pale wash of the opening, the shadow under the lintel, and the reveal's shadow down the left side
    const A = o.a ?? (o.lit ? .85 : .62);
    S.push(washShape(pts, dark, A * .62, 2, Math.min(1.4, w * .07)));
    if (w >= 7 && h > 10) {
      S.push(washShape(tf(opening(cx, yb - h * .68, w, h * .32, kind, Math.max(4, Math.min(10, Math.round(w / 3))))), dark, A * .45, 2, Math.min(1, w * .05)));
    }
    if (w >= 12 && h > 16) {
      const sx = cx - w * .5 + w * .16, side = tf([[sx, yb - 1], [sx, yb - h * .8]]);
      S.push(mk(qcurve(side[0][0], side[0][1], side[1][0], side[1][1], 0, 5), w * .3, dark, { prof: 'even', nb: 0, a: A * .4, rough: .2 }));
    }
    if (o.lit) S.push(washShape(tf(opening(cx, yb, w * .55, h * .6, kind === 'pointed' ? 'pointed' : 'rect')), mixc(C.gold, C.paperLight, .4), .5, 1, .5));
    const spring = kind === 'rect' ? yb - h : kind === 'pointed' ? yb - h + w * .8 : yb - h + w / 2;
    if (o.grid) {
      const gc = o.gridCol || mixc(C.wood, C.ink, .25), [nv, nh] = o.grid, gw = o.gw ?? Math.max(1, w * .07);
      for (let i = 1; i <= nv; i++) { const x = cx - w / 2 + w * i / (nv + 1), [[a, b], [c2, d]] = tf([[x, yb - 1], [x, yb - h + (kind === 'rect' ? 1 : w * .12)]]); line(S, a, b, c2, d, gw, gc, .75); }
      for (let i = 1; i <= nh; i++) { const y = yb - (yb - spring) * i / (nh + 1), [[a, b], [c2, d]] = tf([[cx - w / 2 + 1, y], [cx + w / 2 - 1, y]]); line(S, a, b, c2, d, gw, gc, .75); }
    }
    if (o.sill !== false) { const [[a, b], [c2, d]] = tf([[cx - w / 2 - w * .18, yb + 1.5], [cx + w / 2 + w * .18, yb + 1.5]]); line(S, a, b, c2, d, o.sw ?? Math.max(1.6, w * .14), o.sillCol || mixc(C.stoneDark, C.ink, .2), .5); }
    if (o.ink !== false && w >= 6) curve(S, kind === 'rect' ? [pts[3], pts[2], pts[1]] : pts.slice(1), Math.max(.9, Math.min(1.8, w * .08)), .5, C.ink, kind === 'rect' ? 6 : 12);
    return pts;
  }

  // ------------------------------------------------------------ building parts
  // merlons along a top edge (o.k: slope), square or pointed (Ottoman)
  function crenels(S, x0, x1, y, o = {}) {
    const mw = o.mw ?? 13, mh = o.mh ?? 13, gap = o.gap ?? mw * .8, k = o.k || 0;
    const n = Math.max(2, Math.round((x1 - x0 + gap) / (mw + gap))), step = (x1 - x0 - mw) / (n - 1);
    const colour = o.col || STONE(), dk = mixc(colour, C.ink, .4);
    for (let i = 0; i < n; i++) {
      const a = x0 + i * step, b = a + mw;
      const pts = shear(o.pointed ? [[a, y + 1], [b, y + 1], [b, y - mh * .55], [(a + b) / 2, y - mh], [a, y - mh * .55]] : box(a, y - mh, b, y + 1), x0, k);
      wash(S, pts, colour, o.a ?? .88, { n: 1, jit: .7 });
      if (o.ink !== false && i % 2 === 0) line(S, pts[2][0], pts[2][1], pts[1][0], pts[1][1], 1.5, dk, .65);
    }
  }
  // a finial: 'crescent' (alem) | 'cross' | 'ball' | false
  function finial(S, x, y, len, kind = 'crescent') {
    if (!kind || len < 3) return;
    const g = mixc(C.gold, C.stoneDark, .35);
    line(S, x, y + 1, x, y - len, Math.max(1, len * .07), g, .9, { bend: 0 });
    if (kind === 'crescent') {
      const R = len * .2, yc = y - len - R * .4, arc = [];
      for (let i = 0; i <= 8; i++) { const a = -.35 + (PI + .7) * i / 8; arc.push([x + Math.cos(a) * R, yc + Math.sin(a) * R]); }
      S.push(mk(arc, Math.max(1.2, R * .5), g, { prof: 'leaf', nb: 0, a: .9 }));
      S.push(mk(qcurve(x, y - len * .45, x, y - len * .6, 0, 3), Math.max(1.6, len * .14), g, { prof: 'leaf', nb: 0, a: .85 }));
    } else if (kind === 'cross') line(S, x - len * .2, y - len * .75, x + len * .2, y - len * .75, Math.max(1, len * .07), g, .9, { bend: 0 });
    else if (kind === 'ball') S.push(mk(qcurve(x, y - len * .85, x, y - len, 0, 3), Math.max(2, len * .2), g, { prof: 'leaf', nb: 0, a: .9 }));
  }
  // a dome (semi-ellipse r × h on a base line), lead by default, shaded on the right, with meridian ribs
  function dome(S, cx, by, r, h, o = {}) {
    const col = o.col || LEAD(), n = Math.max(8, Math.min(16, Math.round(r / 5)));
    const prof = arcPts(cx, by, r, h, n);
    const body = prof.concat([[cx + r, by + 2], [cx - r, by + 2]]);
    wash(S, body, mixc(col, C.paper, .15), o.a ?? .78, { n: 0, jit: Math.min(1.6, r * .05) });
    if (r > 22) rows(S, body, col, { gap: Math.max(5, h / 6), w: Math.max(5, h / 6) * 1.35, a: .2, ga: .14, bend: -h * .06, nb: 3, broken: .08, inset: 1, rough: .38 });
    const half = prof.slice(Math.floor(n / 2)), inner = half.map(([x, y]) => [cx + (x - cx) * .42 + r * .1 * (1 - (by - y) / h), y]);
    wash(S, half.concat(inner.reverse()), mixc(col, C.ink, .3), .42, { n: 0, jit: Math.min(1, r * .03) });
    if (o.ribs !== false && r > 18) for (const ph of [-.8, -.4, 0, .4, .8]) {
      const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6 * PI / 2; pts.push([cx + r * Math.cos(t) * Math.sin(ph), by - h * Math.sin(t)]); }
      S.push(mk(along(pts, 8), Math.max(.8, r * .018), mixc(col, C.ink, .45), { prof: 'tip', nb: 0, a: .35 }));
    }
    if (o.ink !== false) {
      curve(S, prof.slice(Math.floor(n * .45)), o.iw ?? Math.max(1, Math.min(2.2, r * .03)), .72, C.ink, 4);
      if (r > 22) curve(S, prof.slice(0, Math.ceil(n * .3) + 1), (o.iw ?? Math.max(1, Math.min(2.2, r * .03))) * .7, .35, C.ink, 4);
    }
    finial(S, cx, by - h, o.fin ?? Math.max(7, r * .38), o.alem ?? 'crescent');
  }
  // a drum (cylinder under a dome) with a ring of small arched windows
  function drum(S, cx, yb, r, dh, o = {}) {
    const st = o.col || STONE();
    face(S, box(cx - r, yb - dh, cx + r, yb), st, { a: .8, n: 2 });
    wash(S, box(cx + r * .35, yb - dh, cx + r, yb), SHADE(), .4, { n: 2 });
    const nw = o.windows ?? Math.max(3, Math.round(r / 11));
    for (let i = 0; i < nw; i++) {
      const u = (i + .5) / nw * 2 - 1, x = cx + Math.sin(u * PI / 2.2) * r * .9, ww = Math.max(2, dh * .28 * Math.cos(u * 1.2));
      win(S, x, yb - dh * .2, ww, dh * .58, 'round', { sill: false, ink: false, a: .55, lit: o.lit });
    }
    line(S, cx - r - 2, yb - dh, cx + r + 2, yb - dh, Math.max(1.2, r * .03), mixc(C.ink, st, .3), .6);
    line(S, cx + r, yb - dh, cx + r, yb, 1.4, C.ink, .55);
  }
  // a cone roof (towers, minaret caps): lead by default
  function cone(S, cx, by, r, h, o = {}) {
    const col = o.col || LEAD();
    face(S, [[cx - r, by], [cx + r, by], [cx, by - h]], col, { a: .8, n: 3, jit: Math.min(1.5, r * .06), dir: 'v', ga: .12 });
    wash(S, [[cx + r * .05, by], [cx + r, by], [cx, by - h]], mixc(col, C.ink, .32), .5, { n: 2, jit: 1 });
    if (r > 14) for (const f of [-.55, .3]) line(S, cx + r * f, by, cx, by - h, 1, mixc(col, C.ink, .45), .3);
    line(S, cx + r, by, cx, by - h, Math.max(1, r * .045), C.ink, .7);
    line(S, cx - r - 2, by + 1, cx + r + 2, by + 1, Math.max(1.2, r * .06), mixc(C.ink, col, .3), .6);
    finial(S, cx, by - h, o.fin ?? Math.max(5, h * .16), o.alem ?? 'ball');
  }
  // a round (o.poly: faceted) tower part: body, cylinder shading, courses, corbelled parapet + merlons or a cone
  function rtower(S, cx, R, H, o = {}) {
    const y0 = o.y ?? 0, top = y0 - H, stone = o.col || STONE(), sh = SHADE();
    face(S, box(cx - R, top, cx + R, y0), stone, { a: .78, dir: 'v', ga: .26 });
    wash(S, box(cx + R * .2, top, cx + R, y0), sh, .22, { n: 2 });
    wash(S, box(cx + R * .6, top, cx + R, y0), sh, .34, { n: 2 });
    if (o.poly) for (const f of [-.55, 0, .55]) line(S, cx + R * f, top + 4, cx + R * f, y0 - 2, 1.2, mixc(sh, C.ink, .3), .35);
    rows(S, box(cx - R, top + 6, cx + R, y0 - 4), mixc(sh, C.ink, .15), { gap: o.course ?? 18, w: 2.2, a: .26, broken: .45, bend: R * .07, nb: 0 });
    stains(S, cx - R, top, cx + R, y0, sh, 2, .1);
    let pt = top;
    if (o.parapet !== false) {
      const pR = R + (o.corbel ?? 6), ph = o.ph ?? 20; pt = top - ph;
      wash(S, box(cx - pR, pt, cx + pR, top + 2), stone, .92, { n: 2 });
      wash(S, box(cx + pR * .4, pt, cx + pR, top + 2), sh, .4, { n: 1 });
      for (let x = cx - pR + 4; x < cx + pR - 2; x += 11) line(S, x, top + 2, x, top + 9, 3, mixc(C.ink, sh, .3), .5);
      line(S, cx - pR, top + 2, cx + pR, top + 2, 1.8, C.ink, .55);
      if (!o.cone) crenels(S, cx - pR, cx + pR, pt, { mw: o.mw ?? 11, mh: 12, col: stone, pointed: o.pointed });
    }
    for (let i = 0; i < (o.slits ?? 3); i++) win(S, cx + rnd(-R * .45, R * .15), y0 - H * (.22 + i * .26) + rnd(-6, 6), Math.max(3, R * .09), Math.max(10, R * .4), 'rect', { sill: false, a: .72 });
    line(S, cx + R, top + 2, cx + R, y0, 2, C.ink, .7);
    line(S, cx - R, top + 2, cx - R, y0, 1.2, C.ink, .3);
    if (o.cone) cone(S, cx, pt + 2, R + (o.parapet === false ? 8 : 12), o.coneH ?? R * 2.4, { col: o.coneCol, alem: o.alem });
    return pt;
  }
  // a square tower part: front face + receding side face, merlons along both tops, or a pyramid roof (o.roof)
  function stower(S, cx, Wf, H, o = {}) {
    const y0 = o.y ?? 0, x0 = cx - Wf / 2, x1 = cx + Wf / 2, top = y0 - H, D = o.D || [Wf * .28, -Wf * .11];
    const stone = o.col || STONE(), sh = mixc(stone, C.stoneDark, .55);
    face(S, box(x0, top, x1, y0), stone, { a: .78 });
    face(S, sideF(x1, top, y0, D), sh, { a: .78, dir: 'v' });
    rows(S, box(x0, top + 6, x1, y0 - 4), mixc(SHADE(), C.ink, .15), { gap: 15, w: 2.2, a: .26, broken: .45, nb: 0 });
    stains(S, x0, top, x1, y0, SHADE(), 2, .1);
    if (o.roof) {
      const ap = [cx + D[0] * .5, top + D[1] * .5 - Wf * (o.roofH ?? 1.1)], rc = o.roofCol || C.roof;
      wash(S, [[x0 - 6, top + 2], [x1 + 6, top + 2], ap], rc, .9);
      wash(S, [[x1 + 6, top + 2], [x1 + D[0] + 4, top + D[1] + 2], ap], mixc(rc, C.ink, .35), .8);
      rows(S, [[x0 - 6, top + 2], [x1 + 6, top + 2], ap], mixc(rc, C.ink, .25), { gap: 7, w: 2.5, a: .3, broken: .3, nb: 0 });
      pen(S, [[x0 - 6, top + 2], ap, [x1 + D[0] + 4, top + D[1] + 2]], 1.8, .65);
      line(S, x1 + 6, top + 2, ap[0], ap[1], 1.4, C.ink, .5);
      finial(S, ap[0], ap[1], Wf * .3, o.alem ?? 'ball');
    } else if (o.crenel !== false) {
      crenels(S, x0, x1, top, { mw: o.mw ?? 12, mh: 13, col: stone, pointed: o.pointed });
      crenels(S, x1 + 2, x1 + D[0], top + D[1] * 2 / D[0], { mw: 9, mh: 12, col: sh, k: D[1] / D[0], pointed: o.pointed, ink: false });
    }
    if (o.windows !== false) {
      win(S, cx, top + H * .28, Math.max(6, Wf * .16), Math.max(14, Wf * .3), 'round', { a: .7 });
      for (let i = 0; i < (o.slits ?? 2); i++) win(S, cx + rnd(-Wf * .25, Wf * .25), y0 - H * (.25 + i * .25), 4, 18, 'rect', { sill: false, a: .72 });
    }
    pen(S, [[x1, top], [x1, y0], [x1 + D[0], y0 + D[1]]], 1.9, .7);
    line(S, x0, top, x0, y0, 1.1, C.ink, .3);
  }
  // a stretch of wall from x0 to x1 (height H at x0, o.H1 at x1: walls that climb), merlons along the top
  function wallseg(S, x0, x1, H, o = {}) {
    const y0 = o.y ?? 0, tL = y0 - H, tR = y0 - (o.H1 ?? H), stone = o.col || STONE(), sh = SHADE();
    const pts = [[x0, tL], [x1, tR], [x1, y0], [x0, y0]];
    face(S, pts, stone, { a: .78 });
    rows(S, [[x0, tL + 6], [x1, tR + 6], [x1, y0 - 3], [x0, y0 - 3]], mixc(sh, C.ink, .15), { gap: o.course ?? 13, w: 2.2, a: .25, broken: .5, nb: 0 });
    stains(S, x0, Math.min(tL, tR), x1, y0, sh, Math.max(1, Math.round((x1 - x0) / 120)), .1);
    if (o.broken) {
      const tp = []; for (let i = 0; i <= 10; i++) { const x = x0 + (x1 - x0) * i / 10; tp.push([x, tL + (tR - tL) * i / 10 + rnd(0, 18)]); }
      pen(S, tp, 1.6, .55);
    } else if (o.crenel !== false) {
      line(S, x0, tL + 1, x1, tR + 1, 2, mixc(C.ink, stone, .3), .6);
      crenels(S, x0 + 2, x1 - 2, tL + (tR - tL) * 2 / (x1 - x0), { mw: o.mw ?? 12, mh: o.mh ?? 12, col: stone, k: (tR - tL) / (x1 - x0), pointed: o.pointed });
    }
    for (let i = 0; i < (o.slits ?? Math.round((x1 - x0) / 110)); i++) {
      const x = x0 + (x1 - x0) * (i + .5) / Math.max(1, o.slits ?? Math.round((x1 - x0) / 110)) + rnd(-10, 10);
      win(S, x, y0 - (y0 - (tL + (tR - tL) * (x - x0) / (x1 - x0))) * .45, 4, 16, 'rect', { sill: false, a: .7 });
    }
    line(S, x0, y0, x1, y0, 2, C.ink, .5);
  }
  // a flag waving (live): rectangular cloth from the pole top (x, y) to the right
  function flag(c, x, y, len, lt, colour, ph = 0, o = {}) {
    const h = len * (o.h ?? .6), n = 8, top = [], bot = [];
    for (let k = 0; k <= n; k++) {
      const s = k / n, wv = Math.sin(s * 4.2 - lt * 4 + ph) * len * .08 * s + Math.sin(lt * 1.7 + ph) * len * .03 * s;
      top.push([x + s * len * (.96 + .04 * Math.sin(lt * 2.3 + ph)), y + wv]);
      bot.push([x + s * len * .94, y + h * (1 - s * (o.taper ?? .3)) + wv * 1.1]);
    }
    const ring = top.concat(bot.reverse());
    for (const [dx, al] of [[0, .72], [1.4, .3]]) {
      c.beginPath(); ring.forEach(([px, py], i) => (i ? c.lineTo(px + dx, py + dx * .4) : c.moveTo(px + dx, py))); c.closePath();
      c.fillStyle = WC.rgba(colour, al); c.fill();
    }
  }
  function pole(S, x, y, len) { line(S, x, y, x, y - len, 1.6, mixc(C.ink, C.wood, .3), .85, { bend: 0 }); }

  // ================================================================ houses
  // house — a dwelling, about 220 px tall. o: {style: 'ottoman' (default: stone ground floor, jutting timber upper
  //   floor with a bay (cumba), latticed windows, tiled hip roof) | 'anatolian' (flat-roofed mudbrick, beam ends, a
  //   ladder) | 'european' (gabled, half-timbered; o.half false = stone) | 'ancient' (Greco-Roman, whitewashed, low tiled
  //   roof, columned porch) | 'modern' (19th–20th c. brick, o.floors 2–4), w: width factor, col: wall token,
  //   roof: roof token, lit: true (warm windows at dusk/night), ladder: true|false (anatolian)}
  const HOUSE = {};
  G.house = (sc, o = {}) => { const [S, x] = (HOUSE[o.style] || HOUSE.ottoman)(o); return fin(S, sc, x); };

  HOUSE.ottoman = o => {
    const S = [], w = o.w ?? 1, W = 170 * w, gH = 84, uH = 86, jut = 15, eave = 26, rH = 44, D = [20, -8];
    const x0 = -W / 2, x1 = W / 2, u0 = x0 - jut, u1 = x1 + jut, yG = -gH, yU = -gH - uH, lit = o.lit;
    const stone = T(o.col2, STONE());
    const up = T(o.col, pick([mixc(C.roof, C.paper, .35), mixc(C.clothC, C.paper, .32), mixc(C.wood, C.paper, .5), mixc(C.stone, C.paperLight, .3), mixc(C.cloth, C.paper, .42)]));
    const roof = T(o.roof, C.roof), wood = mixc(C.wood, C.ink, .2), sh = mixc(C.stoneDark, C.ink, .2);
    contact(S, x0, x1 + D[0]);
    // big washes: ground floor, upper floor, side faces, roof
    face(S, box(x0, yG, x1, 0), stone, { a: .72 });
    face(S, sideF(x1, yG, 0, D), mixc(stone, C.stoneDark, .5), { a: .75, dir: 'v' });
    face(S, box(u0, yU, u1, yG + 2), up, { a: .74 });
    face(S, sideF(u1, yU, yG + 2, D), mixc(up, C.ink, .3), { a: .75, dir: 'v' });
    const r0 = u0 - eave, r1 = u1 + eave, rk = W * .2, ey = yU + 5;
    const rf = [[r0, ey], [r1, ey], [x1 - rk, yU - rH], [x0 + rk, yU - rH]];
    face(S, rf, roof, { a: .78, ga: .1 });
    wash(S, [[r1, ey], [r1 + D[0], ey + D[1]], [x1 - rk + D[0] * .5, yU - rH + D[1] * .5], [x1 - rk, yU - rH]], mixc(roof, C.ink, .35), .85);
    // shade: under the eaves, under the jutting floor; textures
    wash(S, box(u0, yU + 4, u1, yU + 14), sh, .4, { n: 2 });
    wash(S, box(x0, yG, x1, yG + 10), sh, .35, { n: 2 });
    rows(S, rf, mixc(roof, C.ink, .3), { gap: 7, w: 3, a: .3, broken: .25, nb: 0 });
    rows(S, box(x0, yG + 10, x1, -3), mixc(stone, C.stoneDark, .6), { gap: 11, w: 2.2, a: .3, broken: .5, nb: 0 });
    rows(S, box(u0, yU + 14, u1, yG), mixc(up, C.ink, .22), { gap: 8, w: 2, a: .28, broken: .35, nb: 0 });
    stains(S, x0, yG, x1, 0, C.stoneDark, 2, .08);
    // timber: floor beam, corner posts, brackets under the jetty
    line(S, u0, yG + 1, u1, yG + 1, 5, wood, .85);
    line(S, u0 + 3, yU + 12, u0 + 3, yG, 4, wood, .7); line(S, u1 - 3, yU + 12, u1 - 3, yG, 4, wood, .7);
    line(S, x0 + 1, yG + 26, u0 + 5, yG + 3, 4, wood, .8); line(S, x1 - 1, yG + 26, u1 - 5, yG + 3, 4, wood, .8);
    // the bay window (cumba)
    const cw = W * .4, cy0 = yU + 12, cy1 = yG + 16;
    face(S, box(-cw / 2, cy0, cw / 2, cy1), mixc(up, C.paper, .1), { a: .7, n: 2 });
    wash(S, sideF(cw / 2, cy0, cy1, [8, -3]), mixc(up, C.ink, .35), .75, { n: 1 });
    wash(S, box(-cw / 2, cy1 - 4, cw / 2, cy1), wood, .6, { n: 1 });
    line(S, -cw / 2 + 4, cy1, -cw / 2 + 16, cy1 + 16, 3.5, wood, .75); line(S, cw / 2 - 4, cy1, cw / 2 - 16, cy1 + 16, 3.5, wood, .75);
    for (const x of [-cw * .3, 0, cw * .3]) win(S, x, cy1 - 12, cw * .2, 44, 'rect', { grid: [1, 3], gridCol: mixc(C.wood, C.paper, .2), lit, sill: false });
    const sx = (cw / 2 + u1) / 2;
    for (const x of [-sx, sx]) win(S, x, yG - 14, 17, 44, 'rect', { grid: [1, 1], lit });
    // ground floor: arched door, two small barred windows
    const dx = -W * .24;
    wash(S, opening(dx, 0, 30, 54, 'round'), wood, .9, { n: 0, jit: .8 });
    line(S, dx, -2, dx, -46, 1.2, mixc(C.ink, wood, .3), .6);
    curve(S, opening(dx, 0, 34, 58, 'round').slice(1), 2, .7);
    for (const x of [W * .08, W * .3]) win(S, x, -30, 15, 22, 'rect', { grid: [2, 0], gridCol: C.ink, lit });
    // chimney
    const chx = x1 - W * .32;
    wash(S, box(chx - 6, yU - rH - 14, chx + 6, yU - rH * .45), stone, .9, { n: 2 });
    line(S, chx - 8, yU - rH - 14, chx + 8, yU - rH - 14, 3, mixc(C.ink, stone, .3), .7);
    // ink
    pen(S, [[r0, ey], [r1, ey], [r1 + D[0], ey + D[1]]], 2.2, .8);
    pen(S, [[x0 + rk, yU - rH], [x1 - rk, yU - rH], [x1 - rk + D[0] * .5, yU - rH + D[1] * .5]], 1.8, .7);
    line(S, x1 - rk, yU - rH, r1, ey, 1.6, C.ink, .6); line(S, x0 + rk, yU - rH, r0, ey, 1.2, C.ink, .35);
    pen(S, [[u1, yU + 12], [u1, yG + 2]], 1.8, .7); pen(S, [[x1, yG + 2], [x1, 0], [x1 + D[0], D[1]]], 1.8, .7);
    line(S, x0 - 2, 0, x1, 0, 2.2, C.ink, .6);
    return [S, { top: [0, yU - rH] }];
  };

  HOUSE.anatolian = o => {
    const S = [], w = o.w ?? 1, W = 190 * w, H = 116, D = [22, -9], x0 = -W / 2, x1 = W / 2, lit = o.lit;
    const mud = T(o.col, mixc(C.ground, C.stoneDark, .3)), dk = mixc(mud, C.ink, .3), wood = mixc(C.wood, C.ink, .2);
    contact(S, x0, x1 + D[0]);
    face(S, box(x0, -H, x1, 0), mud, { a: .72, ga: .25 });
    face(S, sideF(x1, -H, 0, D), mixc(mud, C.stoneDark, .55), { a: .75, dir: 'v' });
    // the flat earthen roof seen a little from above, its rounded edge
    const rt = -H - 9;
    wash(S, [[x0 - 3, rt], [x1 + 3, rt], [x1 + 3 + D[0], rt + D[1]], [x0 - 3 + D[0], rt + D[1]]], mixc(mud, C.paper, .25), .8, { n: 2 });
    wash(S, [[x0 - 4, -H + 3], [x1 + 4, -H + 3], [x1 + 3, rt], [x0 - 3, rt + 1]], dk, .75, { n: 2 });
    wash(S, [[x1 + 4, -H + 3], [x1 + 3 + D[0], -H + 3 + D[1]], [x1 + 3 + D[0], rt + D[1]], [x1 + 3, rt]], mixc(dk, C.ink, .2), .7, { n: 1 });
    // a small room on the roof, set back
    const ra = x0 + 18, rb = ra + 74 * w, rh = 54, ry = rt + D[1] * .55, rx = D[0] * .45;
    face(S, box(ra + rx, ry - rh, rb + rx, ry), mud, { a: .75, n: 2 });
    wash(S, sideF(rb + rx, ry - rh, ry, [14, -6]), mixc(mud, C.stoneDark, .55), .82, { n: 2 });
    wash(S, [[ra + rx - 3, ry - rh + 3], [rb + rx + 3, ry - rh + 3], [rb + rx + 3, ry - rh - 6], [ra + rx - 3, ry - rh - 5]], dk, .75, { n: 1 });
    // textures: mudbrick courses, weathering, a timber band (hatıl)
    rows(S, box(x0, -H + 8, x1, -4), mixc(mud, C.ink, .2), { gap: 9, w: 2, a: .22, broken: .6, nb: 0 });
    stains(S, x0, -H, x1, 0, mixc(mud, C.stoneDark, .5), 3, .12);
    line(S, x0, -H * .52, x1, -H * .52, 4, wood, .55); line(S, x1, -H * .52, x1 + D[0], -H * .52 + D[1], 3.5, wood, .45);
    for (let x = x0 + 8; x < x1 - 4; x += 15 + rnd(-2, 2)) line(S, x, -H + 5, x + 1, -H + 10, 5, mixc(C.wood, C.ink, .45), .8, { prof: 'leaf' });
    // door, small windows
    const dxp = W * .16;
    wash(S, box(dxp - 16, -58, dxp + 16, 0), wood, .9, { n: 2 });
    line(S, dxp - 22, -60, dxp + 22, -60, 5, mixc(C.wood, C.ink, .35), .85);
    line(S, dxp, -2, dxp, -56, 1.2, mixc(C.ink, wood, .3), .55);
    for (const x of [-W * .3, -W * .05]) { win(S, x, -62, 17, 17, 'rect', { grid: [1, 0], gridCol: wood, lit }); line(S, x - 12, -81, x + 12, -81, 3.5, wood, .7); }
    win(S, (ra + rb) / 2 + rx, ry - 18, 13, 15, 'rect', { lit });
    // a ladder to the roof
    if (o.ladder ?? rnd() < .65) {
      const lx = x1 - 34;
      line(S, lx, 0, lx + 16, rt - 12, 2.6, wood, .85); line(S, lx + 16, 0, lx + 32, rt - 12, 2.6, wood, .85);
      for (let i = 1; i < 7; i++) { const f = i / 7, y = (rt - 12) * f; line(S, lx + 16 * f, y, lx + 16 + 16 * f, y, 2, wood, .75); }
    }
    // ink
    pen(S, [[x0 - 4, -H + 3], [x1 + 4, -H + 3], [x1 + 3 + D[0], -H + 3 + D[1]]], 2, .75);
    pen(S, [[x1, -H + 3], [x1, 0], [x1 + D[0], D[1]]], 1.9, .7);
    pen(S, [[rb + rx, ry - rh + 3], [rb + rx, ry]], 1.6, .6);
    line(S, x0 - 2, 0, x1, 0, 2.2, C.ink, .6);
    return [S, { top: [ra + rx, ry - rh] }];
  };

  // an oblique gabled building: gable end facing us, the long side receding to the right (european house,
  // chapel, log cabin). Returns the corner points so callers can add details.
  function gable(S, o) {
    const gw = o.gw, wh = o.wh, rise = o.rise, D = o.D, X0 = -(gw + D[0]) / 2, X1 = X0 + gw, gc = X0 + gw / 2;
    const wall = o.wall, side = mixc(wall, C.stoneDark, .5), roof = o.roof, ov = o.ov ?? 7;
    const A = [X0, 0], B = [X1, 0], B2 = [X1, -wh], P = [gc, -wh - rise], A2 = [X0, -wh];
    contact(S, X0, X1 + D[0]);
    face(S, [A, B, B2, P, A2], wall, { a: .72 });
    face(S, [B, [B[0] + D[0], B[1] + D[1]], [B2[0] + D[0], B2[1] + D[1]], B2], side, { a: .74, ga: .15 });
    // roof plane (the right slope seen from the side), with a little overhang
    const e = [X1 + ov * .6, -wh + ov * .5], rp = [[P[0], P[1] - 3], [P[0] + D[0] + 4, P[1] + D[1] - 3], [e[0] + D[0] + 6, e[1] + D[1]], e];
    wash(S, rp, roof, .82);
    if (o.tex) o.tex(rp);
    else rows(S, rp, mixc(roof, C.ink, .3), { gap: 8, w: 3, a: .3, broken: .2, nb: 0 });
    // bargeboards along the gable
    line(S, X0 - ov * .6, -wh + ov * .5, P[0], P[1] - 2, 4.5, mixc(roof, C.ink, .45), .85);
    line(S, P[0], P[1] - 2, e[0], e[1], 4.5, mixc(roof, C.ink, .45), .85);
    return { X0, X1, gc, A, B, B2, P, A2, D, e, rp, side };
  }
  function gableInk(S, g, wh) {
    const { X0, X1, B, D, P, e } = g;
    pen(S, [[X1, -wh], [X1, 0], [X1 + D[0], D[1]]], 1.9, .72);
    pen(S, [[P[0], P[1] - 4], [P[0] + D[0] + 4, P[1] + D[1] - 4]], 1.8, .7);
    pen(S, [e, [e[0] + D[0] + 6, e[1] + D[1]]], 1.6, .6);
    line(S, X0 - 2, 0, X1, 0, 2.2, C.ink, .6);
    line(S, B[0] + D[0], B[1] + D[1], B[0] + D[0], -wh + D[1] + 2, 1.2, C.ink, .35);
  }

  HOUSE.european = o => {
    const S = [], w = o.w ?? 1, half = o.half ?? true, lit = o.lit;
    const wall = T(o.col, half ? mixc(C.stone, C.paperLight, .5) : STONE());
    const roof = T(o.roof, pick([C.roof, mixc(C.stoneDark, C.night, .25), mixc(C.roof, C.stoneDark, .4)]));
    const timber = mixc(C.wood, C.ink, .35), wh = 112, rise = 92 * w;
    const g = gable(S, { gw: 118 * w, wh, rise, D: [128 * w, -11 * w], wall, roof });
    const { X0, X1, gc, D } = g, k = D[1] / D[0], fl = -wh * .5;
    const sk = (x, y) => [x, y + (x - X1) * k];                     // a point on the side wall
    if (!half) {
      rows(S, [[X0, 0], [X1, 0], [X1, -wh], [X0, -wh]], mixc(SHADE(), C.ink, .15), { gap: 12, w: 2.2, a: .25, broken: .5, nb: 0 });
    } else {
      // half-timbering: sill, floor beam, plates, posts, braces (front), and along the side
      for (const y of [-3, fl, -wh + 2]) line(S, X0, y, X1, y, 4.5, timber, .85);
      for (const x of [X0 + 2, gc, X1 - 2]) line(S, x, -2, x, -wh, 4.5, timber, .85);
      line(S, X0 + 2, fl, gc - 2, -3, 3.5, timber, .75); line(S, X1 - 2, fl, gc + 2, -3, 3.5, timber, .75);
      line(S, X0 + 2, -wh, gc, fl, 3.5, timber, .75);
      line(S, gc - rise * .55, -wh - rise * .45, gc + rise * .55, -wh - rise * .45, 4, timber, .8);
      line(S, gc, -wh, gc, -wh - rise + 4, 4, timber, .8);
      const sl = D[0];
      for (const y of [-3, fl, -wh + 2]) { const [a, b] = sk(X1, y), [c2, d] = sk(X1 + sl, y); line(S, a, b, c2, d, 4, mixc(timber, C.ink, .2), .75); }
      for (let i = 1; i <= 3; i++) { const [a, b] = sk(X1 + sl * i / 4, -2), [c2, d] = sk(X1 + sl * i / 4, -wh); line(S, a, b, c2, d, 4, mixc(timber, C.ink, .2), .75); }
      { const [a, b] = sk(X1 + sl * .25, fl), [c2, d] = sk(X1 + sl * .5, -wh); line(S, a, b, c2, d, 3.2, mixc(timber, C.ink, .2), .65); }
    }
    // windows (front: two upstairs + door below; side: shuttered windows) and a chimney
    for (const x of [X0 + (gc - X0) * .5, gc + (X1 - gc) * .5]) win(S, x, fl - 10, 18, 26, 'rect', { grid: [1, 1], gridCol: mixc(C.paperLight, C.wood, .3), lit });
    win(S, gc, -wh - rise * .2, 12, 17, 'round', { grid: [1, 0], lit });
    wash(S, opening(X0 + (gc - X0) * .55, 0, 24, 46, 'round'), mixc(C.wood, C.ink, .15), .9, { n: 0, jit: .6 });
    for (const f of [.35, .72]) {
      const [cx, cy] = sk(X1 + D[0] * f, fl - 10);
      win(S, cx, cy, 15, 24, 'rect', { k, grid: [1, 0], lit });
      const [cx2, cy2] = sk(X1 + D[0] * f, -12);
      win(S, cx2, cy2, 15, 22, 'rect', { k, lit });
    }
    const ch = [g.P[0] + D[0] * .62, g.P[1] + D[1] * .62 + rise * .22];
    wash(S, box(ch[0] - 8, ch[1] - 40, ch[0] + 8, ch[1]), mixc(C.roof, C.stoneDark, .3), .9, { n: 2 });
    line(S, ch[0] - 10, ch[1] - 40, ch[0] + 10, ch[1] - 40, 3, C.ink, .6);
    gableInk(S, g, wh);
    return [S, { top: [g.P[0], g.P[1]] }];
  };

  HOUSE.ancient = o => {
    const S = [], w = o.w ?? 1, W = 200 * w, H = 104, D = [20, -8], x0 = -W / 2, x1 = W / 2, lit = o.lit;
    const wall = T(o.col, mixc(C.stone, C.paperLight, .55)), sh = mixc(wall, C.stoneDark, .5), roof = T(o.roof, C.roof);
    // a lower annex on the left (behind)
    const ax0 = x0 - 62 * w, aH = 70;
    contact(S, ax0, x1 + D[0]);
    wash(S, box(ax0, -aH, x0 + 10, 0), mixc(wall, C.stone, .3), .85, { n: 2 });
    wash(S, box(ax0 - 4, -aH - 7, x0 + 10, -aH + 2), mixc(roof, C.paper, .1), .85, { n: 2 });
    rows(S, box(ax0 - 4, -aH - 7, x0 + 10, -aH + 2), mixc(roof, C.ink, .3), { gap: 5, w: 2, a: .3, nb: 0, dir: 'v' });
    win(S, ax0 + 30, -40, 12, 14, 'rect', { lit });
    // main block + low tiled roof
    face(S, box(x0, -H, x1, 0), wall, { a: .7 });
    face(S, sideF(x1, -H, 0, D), sh, { a: .75, dir: 'v' });
    const rf = [[x0 - 12, -H + 4], [x1 + 12, -H + 4], [x1 - 30, -H - 30], [x0 + 30, -H - 30]];
    wash(S, rf, roof, .84);
    wash(S, [[x1 + 12, -H + 4], [x1 + 12 + D[0], -H + 4 + D[1]], [x1 - 30 + D[0] * .5, -H - 30 + D[1] * .5], [x1 - 30, -H - 30]], mixc(roof, C.ink, .35), .85);
    rows(S, rf, mixc(roof, C.ink, .3), { gap: 6, w: 3, a: .32, nb: 0, dir: 'v', broken: .1 });
    wash(S, box(x0, -H + 4, x1, -H + 12), mixc(C.stoneDark, C.ink, .2), .35, { n: 2 });
    stains(S, x0, -H, x1, 0, C.stone, 3, .12);
    // a columned porch (prothyron) around the door
    const dc = W * .08;
    wash(S, box(dc - 17, -58, dc + 17, 0), DARK(), .7, { n: 2 });
    for (const x of [dc - 27, dc + 27]) { wash(S, box(x - 4, -64, x + 4, 0), mixc(wall, C.paperLight, .3), .95, { n: 1, jit: .5 }); line(S, x + 4, -64, x + 4, 0, 1.4, C.ink, .55); line(S, x - 6, -64, x + 6, -64, 3, mixc(C.stoneDark, C.ink, .2), .7); }
    wash(S, [[dc - 34, -66], [dc + 34, -66], [dc, -84]], mixc(wall, C.stone, .4), .9, { n: 2 });
    pen(S, [[dc - 34, -66], [dc, -84], [dc + 34, -66], [dc - 34, -66]], 1.6, .7);
    // small high windows
    for (const x of [x0 + W * .15, x0 + W * .32, x1 - W * .15]) win(S, x, -70, 13, 13, 'rect', { lit, grid: [1, 0], gridCol: C.ink });
    pen(S, [[x0 - 12, -H + 4], [x1 + 12, -H + 4], [x1 + 12 + D[0], -H + 4 + D[1]]], 2, .75);
    pen(S, [[x0 + 30, -H - 30], [x1 - 30, -H - 30]], 1.6, .6);
    pen(S, [[x1, -H + 10], [x1, 0], [x1 + D[0], D[1]]], 1.9, .7);
    line(S, ax0 - 2, 0, x1, 0, 2.2, C.ink, .6);
    return [S, { top: [0, -H - 30] }];
  };

  HOUSE.modern = o => {
    const S = [], w = o.w ?? 1, nf = o.floors ?? 3, W = 180 * w, gH = 76, fH = 66, H = gH + fH * (nf - 1), D = [22, -9];
    const x0 = -W / 2, x1 = W / 2, lit = o.lit;
    const brick = T(o.col, mixc(C.roof, C.cloth, .35)), stone = mixc(C.stone, C.paper, .2), sh = mixc(brick, C.ink, .35);
    contact(S, x0, x1 + D[0]);
    face(S, box(x0, -H, x1, -gH + 4), brick, { a: .74 });
    face(S, box(x0, -gH + 4, x1, 0), stone, { a: .74, n: 2 });
    face(S, sideF(x1, -H, 0, D), sh, { a: .76, dir: 'v' });
    rows(S, box(x0, -H + 4, x1, -gH + 4), mixc(brick, C.ink, .25), { gap: 6, w: 1.8, a: .22, broken: .5, nb: 0 });
    rows(S, box(x0, -gH + 8, x1, -3), mixc(stone, C.stoneDark, .6), { gap: 13, w: 2.4, a: .3, nb: 0 });
    // cornice, string courses, parapet and chimneys
    wash(S, box(x0 - 6, -H - 14, x1 + 6, -H + 2), stone, .9, { n: 2 });
    wash(S, box(x0 - 6, -H - 4, x1 + 6, -H + 2), mixc(C.stoneDark, C.ink, .2), .45, { n: 1 });
    for (let f = 1; f < nf; f++) line(S, x0, -gH - fH * (f - 1) + 2, x1, -gH - fH * (f - 1) + 2, 4, stone, .85);
    for (const cx of [x0 + 26, x1 - 30]) {
      wash(S, box(cx - 10, -H - 40, cx + 10, -H - 12), brick, .92, { n: 2 });
      line(S, cx - 12, -H - 40, cx + 12, -H - 40, 3.5, stone, .9);
      for (const p of [-5, 4]) line(S, cx + p, -H - 40, cx + p, -H - 48, 4, mixc(C.roof, C.ink, .2), .8);
    }
    // windows: a grid with stone lintels
    const nw = Math.max(2, Math.round(W / 46));
    for (let f = 1; f < nf; f++) for (let i = 0; i < nw; i++) {
      const cx = x0 + W * (i + .5) / nw, yb = -gH - fH * (f - 1) - 12;
      line(S, cx - 13, yb - 44, cx + 13, yb - 44, 5, stone, .9);
      win(S, cx, yb, 19, 40, 'rect', { grid: [1, 2], gridCol: mixc(C.paperLight, C.stone, .3), lit, sillCol: stone, sw: 3.5 });
    }
    for (let i = 0; i < nw; i++) {
      const cx = x0 + W * (i + .5) / nw;
      if (i === Math.floor(nw / 2)) {
        wash(S, opening(cx, 0, 26, 54, 'round'), mixc(C.wood, C.ink, .3), .9, { n: 0, jit: .6 });
        line(S, cx - 20, 2, cx + 20, 2, 4, stone, .85);
      } else win(S, cx, -16, 20, 38, 'round', { grid: [1, 1], gridCol: mixc(C.paperLight, C.stone, .3), lit });
    }
    pen(S, [[x0 - 6, -H - 14], [x1 + 6, -H - 14], [x1 + 6 + D[0], -H - 14 + D[1]]], 2, .75);
    pen(S, [[x1, -H + 2], [x1, 0], [x1 + D[0], D[1]]], 1.9, .7);
    line(S, x0 - 2, 0, x1, 0, 2.2, C.ink, .6);
    return [S, { top: [0, -H - 40] }];
  };

  // ================================================================ fortifications
  // tower — a fortified tower, about 300 px. o: {style: 'round' (default) | 'square', h: height factor, roof: true
  //   (cone / pyramid roof instead of merlons), pointed: true (Ottoman pointed merlons), col: stone token, flag: token}
  G.tower = (sc, o = {}) => {
    const S = [], H = 250 * (o.h ?? 1), round = o.style !== 'square';
    contact(S, -55, 70);
    let top;
    if (round) top = rtower(S, 0, 44, H, { cone: o.roof, pointed: o.pointed, col: T(o.col, null) || undefined, coneCol: o.roof === true ? undefined : T(o.roof, null) || undefined });
    else { stower(S, 0, 92, H, { roof: o.roof, pointed: o.pointed, col: T(o.col, null) || undefined }); top = -H; }
    win(S, round ? -6 : 0, 0, 26, 44, 'round', { sill: false, a: .75 });
    const ft = o.roof ? top - (round ? 44 * 2.4 + 20 : 92 * 1.1 + 25) : top - 14;
    const res = { top: [0, ft] };
    if (o.flag) { pole(S, 0, ft, 50); res.live = liveAt(sc, (c, lt) => flag(c, 0, ft - 50, 40, lt, T(o.flag, C.red), 1)); }
    return fin(S, sc, res);
  };

  // wall — a city or castle wall segment. o: {len: length px (400), h: height (125), crenel: true, pointed: true
  //   (Ottoman merlons), broken: true (ruined top, no merlons), gate: true (an arched gate in the middle),
  //   buttress: true, col}
  G.wall = (sc, o = {}) => {
    const S = [], L = o.len ?? 400, H = o.h ?? 125, x0 = -L / 2, x1 = L / 2, D = [16, -6], stone = T(o.col, STONE());
    contact(S, x0, x1 + D[0]);
    wash(S, [[x0, -H], [x1, -H], [x1 + D[0], -H + D[1]], [x0 + D[0], -H + D[1]]], mixc(stone, C.paper, .3), .7, { n: 2 });
    wallseg(S, x0, x1, H, { crenel: o.crenel, pointed: o.pointed, broken: o.broken, col: stone });
    wash(S, sideF(x1, -H, 0, D), mixc(stone, C.stoneDark, .55), .82, { n: 2 });
    if (o.buttress ?? true) for (let x = x0 + 70; x < x1 - 40; x += 150) {
      wash(S, [[x - 10, -H * .75], [x + 10, -H * .75], [x + 14, 0], [x - 14, 0]], stone, .9, { n: 2 });
      wash(S, [[x + 2, -H * .75], [x + 10, -H * .75], [x + 14, 0], [x + 4, 0]], SHADE(), .45, { n: 1 });
      line(S, x + 10, -H * .75, x + 14, 0, 1.6, C.ink, .6);
    }
    if (o.gate) {
      win(S, 0, 0, 56, 96, 'round', { sill: false, a: .8 });
      curve(S, opening(0, 0, 70, 104, 'round').slice(1), 3, .7, mixc(C.ink, C.stoneDark, .2), 3);
    }
    pen(S, [[x1, -H], [x1, 0], [x1 + D[0], D[1]]], 1.9, .7);
    return fin(S, sc, { top: [0, -H - 13] });
  };

  // castle — curtain wall, towers and a gate, about 520 × 330 px. o: {style: 'medieval' (default: keep, round corner
  //   towers with conical roofs, gatehouse) | 'ottoman' (Rumeli Hisarı-like: three great towers with lead cones,
  //   pointed merlons, walls that climb, a minaret), w: width factor, flag: token (default red) | false}
  G.castle = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, fl = o.flag === false ? null : T(o.flag, C.red), flags = [];
    if (o.style === 'ottoman') {
      const st = T(o.col, mixc(C.stone, C.stoneDark, .12));
      contact(S, -300 * w, 300 * w);
      // a minaret stump inside, behind the walls
      minaret(S, 30 * w, 210, { y: -60, balconies: 1, w: 12 });
      rtower(S, -40 * w, 40, 230, { y: -30, cone: true, pointed: true, col: st, coneH: 104 });
      wallseg(S, -250 * w, -40 * w, 110, { H1: 170, pointed: true, col: st });
      wallseg(S, -40 * w, 200 * w, 170, { H1: 150, pointed: true, col: st });
      wallseg(S, 200 * w, 290 * w, 140, { H1: 120, pointed: true, col: st });
      for (const x of [-150 * w, 95 * w]) rtower(S, x, 17, x < 0 ? 175 : 190, { cone: true, pointed: true, col: st, corbel: 4, ph: 12, slits: 1, coneH: 52 });
      const t1 = rtower(S, -262 * w, 54, 215, { cone: true, pointed: true, col: st, coneH: 128, poly: false });
      const t2 = rtower(S, 205 * w, 60, 262, { cone: true, pointed: true, col: st, coneH: 140, poly: true });
      win(S, 20 * w, 0, 34, 62, 'pointed', { sill: false, a: .8 });
      curve(S, opening(20 * w, 0, 46, 72, 'pointed').slice(1), 3, .7);
      flags.push([-262 * w, t1 - 128 - 40], [205 * w, t2 - 140 - 44]);
      for (const [x, y] of flags) pole(S, x, y + 22, 40);
      return fin(S, sc, { top: [205 * w, t2 - 160], live: fl && liveAt(sc, (c, lt) => flags.forEach(([x, y], i) => flag(c, x, y - 18, 46, lt, fl, i * 2))) });
    }
    const st = T(o.col, STONE());
    contact(S, -270 * w, 280 * w);
    // the keep (behind), with a turret
    stower(S, -60 * w, 110, 300, { col: st, slits: 3 });
    rtower(S, -10 * w, 18, 340, { cone: true, col: st, coneCol: C.roof, corbel: 3, ph: 10, slits: 1, coneH: 60, alem: 'ball' });
    // curtain walls
    wallseg(S, -235 * w, -55 * w, 135, { col: st });
    wallseg(S, 55 * w, 235 * w, 135, { col: st });
    // corner towers
    const tl = rtower(S, -238 * w, 46, 205, { cone: true, col: st, coneCol: C.roof, coneH: 112, alem: 'ball' });
    const tr = rtower(S, 238 * w, 46, 215, { cone: true, col: st, coneCol: C.roof, coneH: 116, alem: 'ball' });
    // gatehouse
    wallseg(S, -40 * w, 40 * w, 160, { col: st, slits: 0 });
    for (const x of [-52 * w, 52 * w]) rtower(S, x, 28, 180, { col: st, slits: 2, corbel: 4 });
    win(S, 0, 0, 46, 80, 'round', { sill: false, a: .82 });
    for (let x = -16; x <= 16; x += 8) line(S, x, -78, x, -6, 1.6, mixc(C.ink, C.wood, .3), .7);
    for (let y = -64; y < -6; y += 14) line(S, -20, y, 20, y, 1.4, mixc(C.ink, C.wood, .3), .6);
    curve(S, opening(0, 0, 60, 90, 'round').slice(1), 3, .7);
    flags.push([-238 * w, tl - 112 - 30], [-10 * w, -340 - 10 - 60 - 22]);
    for (const [x, y] of flags) pole(S, x, y + 22, 40);
    return fin(S, sc, { top: [-10 * w, -440], live: fl && liveAt(sc, (c, lt) => flags.forEach(([x, y], i) => flag(c, x, y - 18, 44, lt, fl, i * 2.3, { taper: .7 }))) });
  };

  // ================================================================ domes, minarets, mosques
  // a minaret part at x (base on y = o.y ?? 0): square pedestal, slender shaft, şerefe balconies with muqarnas
  // undersides, a tall lead pencil cap and an alem
  function minaret(S, x, h, o = {}) {
    const y0 = o.y ?? 0, w = o.w ?? Math.max(10, h * .042), nb = o.balconies ?? (h > 330 ? 3 : h > 220 ? 2 : 1);
    const stone = o.col || mixc(C.stone, C.paperLight, .3), sh = SHADE(), lead = LEAD();
    const ped = h * .14, capB = y0 - h * .8, tip = y0 - h, sb = y0 - ped;
    wash(S, box(x - w * .78, sb, x + w * .78, y0), stone, .92, { n: 2, jit: 1 });
    wash(S, box(x + w * .15, sb, x + w * .78, y0), sh, .45, { n: 1, jit: .6 });
    wash(S, [[x - w * .78, sb], [x + w * .78, sb], [x + w * .5, sb - w * .9], [x - w * .5, sb - w * .9]], stone, .9, { n: 1, jit: .6 });
    const shaft = [[x - w / 2, sb], [x + w / 2, sb], [x + w * .43, capB], [x - w * .43, capB]];
    wash(S, shaft, stone, .92, { n: 2, jit: .7 });
    wash(S, [[x + w * .08, sb], [x + w / 2, sb], [x + w * .43, capB], [x + w * .06, capB]], sh, .5, { n: 2, jit: .5 });
    const fr = nb === 1 ? [.86] : nb === 2 ? [.6, .9] : [.46, .68, .9];
    for (const f of fr) {
      const yb = sb + (capB - sb) * f, bw = w * 1.85;
      wash(S, [[x - w * .48, yb + w * .7], [x + w * .48, yb + w * .7], [x + bw / 2, yb], [x - bw / 2, yb]], mixc(stone, C.ink, .35), .75, { n: 1, jit: .4 });
      wash(S, box(x - bw / 2, yb - w * .42, x + bw / 2, yb), stone, .92, { n: 1, jit: .4 });
      line(S, x - bw / 2, yb - w * .42, x + bw / 2, yb - w * .42, Math.max(.9, w * .09), mixc(C.ink, stone, .3), .7);
      line(S, x - bw / 2 - 1, yb, x + bw / 2 + 1, yb, Math.max(1, w * .1), C.ink, .55);
    }
    const capW = w * .56;
    wash(S, [[x - capW, capB + 2], [x + capW, capB + 2], [x, tip]], lead, .92, { n: 2, jit: .4 });
    wash(S, [[x + capW * .1, capB + 2], [x + capW, capB + 2], [x, tip]], mixc(lead, C.ink, .3), .5, { n: 1, jit: .3 });
    line(S, x - capW - 1, capB + 2, x + capW + 1, capB + 2, Math.max(1, w * .12), mixc(C.ink, stone, .2), .7);
    line(S, x + w / 2, sb, x + w * .43, capB, Math.max(1, w * .1), C.ink, .55);
    line(S, x + capW, capB + 2, x, tip, Math.max(.9, w * .08), C.ink, .6);
    finial(S, x, tip, h * .055, o.alem ?? 'crescent');
  }
  // minaret — a single Ottoman minaret, about 420 px. o: {h: height factor, balconies: 1–3, w: shaft width px}
  G.minaret = (sc, o = {}) => {
    const S = [], h = 420 * (o.h ?? 1);
    contact(S, -18, 18, .15);
    minaret(S, 0, h, { balconies: o.balconies, w: o.w });
    return fin(S, sc, { top: [0, -h * 1.06] });
  };

  // dome — a domed building, about 220 px: a türbe (octagonal body, drum, dome, alem). o: {base: false (only the drum
  //   and dome, for placing on something), r: dome radius (64), col: dome token (lead), wall: wall token,
  //   alem: 'crescent' | 'cross' | 'ball' | false, onion: true (bulbous Russian / Mughal dome)}
  G.dome = (sc, o = {}) => {
    const S = [], r = o.r ?? 64, base = o.base !== false, wall = T(o.wall, mixc(C.stone, C.paperLight, .3));
    let yb = 0;
    if (base) {
      const bw = r * 1.05, bH = r * 1.75, f = bw * .42;
      contact(S, -bw - f, bw + f);
      wash(S, box(-bw, -bH, bw, 0), wall, .9);
      wash(S, box(-bw - f, -bH + 3, -bw, 0), mixc(wall, C.paperLight, .2), .85, { n: 2 });
      wash(S, box(bw, -bH + 3, bw + f, 0), mixc(wall, C.stoneDark, .5), .85, { n: 2 });
      rows(S, box(-bw - f, -bH + 8, bw + f, -4), mixc(SHADE(), C.ink, .1), { gap: 14, w: 2.2, a: .22, broken: .5, nb: 0 });
      for (const [x, ww] of [[-bw - f / 2, f * .45], [0, bw * .4], [bw + f / 2, f * .45]]) {
        win(S, x, -bH * .18, ww, bH * .3, 'rect', { grid: [1, 1], gridCol: C.ink });
        win(S, x, -bH * .6, ww * .8, bH * .25, 'pointed', {});
      }
      wash(S, box(-bw - f - 4, -bH - 8, bw + f + 4, -bH + 3), mixc(wall, C.stoneDark, .3), .85, { n: 2 });
      pen(S, [[-bw - f - 4, -bH + 3], [bw + f + 4, -bH + 3]], 1.8, .7);
      pen(S, [[bw, -bH + 3], [bw, 0]], 1.2, .4); pen(S, [[bw + f, -bH + 3], [bw + f, 0]], 1.9, .7);
      line(S, -bw - f, 0, bw + f, 0, 2, C.ink, .6);
      yb = -bH - 8;
    }
    drum(S, 0, yb, r * 1.02, r * .38, { col: wall });
    if (o.onion) {
      const col = T(o.col, LEAD()), pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16, a = PI * t; pts.push([-Math.sin(a) * r * (1.05 - .25 * t) * (t < .7 ? 1 : (1 - t) / .3), yb - r * .38 - t * r * 1.5]); }
      const R = pts.slice().reverse().map(([x, y]) => [-x, y]);
      wash(S, pts.concat(R), col, .9, { n: 0, jit: 1 });
      wash(S, R.concat([[0, yb - r * .38]]), mixc(col, C.ink, .3), .4, { n: 0, jit: .8 });
      curve(S, R, 1.8, .7); finial(S, 0, yb - r * .38 - r * 1.5, r * .4, o.alem ?? 'cross');
    } else dome(S, 0, yb - r * .38, r, r * .86, { col: T(o.col, null) || undefined, alem: o.alem });
    return fin(S, sc, { top: [0, yb - r * 1.7] });
  };

  // mosque — an Ottoman classical mosque, about 560 × 440 px: a great central dome on a windowed drum, cascading half
  //   domes, corner turrets, a two-tier arcaded prayer hall, courtyard wings with rows of small domes, and slender
  //   pencil minarets. o: {minarets: 0 | 1 | 2 | 4 (default) | 6, w: width factor, lit: true (lamp-lit windows),
  //   col: wall token}
  G.mosque = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, lit = o.lit, wall = T(o.col, mixc(C.stone, C.paperLight, .32)), sh = SHADE();
    const R = 98, yD = -238, hw = 152 * w, ww = 280 * w;
    contact(S, -ww, ww);
    // 1 the great dome on its drum, its turrets
    drum(S, 0, -210, R * .95, 28, { col: wall, lit, windows: 11 });
    dome(S, 0, yD, R, 84, { fin: 42 });
    for (const x of [-R * .98, R * .98]) {
      wash(S, box(x - 8, -262, x + 8, -205), wall, .92, { n: 2, jit: .8 });
      wash(S, box(x + 1, -262, x + 8, -205), sh, .45, { n: 1, jit: .5 });
      dome(S, x, -262, 9, 9, { fin: 8, ribs: false, iw: 1 });
    }
    // 2 the half domes cascading to both sides, on the upper wall
    face(S, box(-122 * w, -208, 122 * w, -150), wall, { a: .78 });
    wash(S, box(60 * w, -208, 122 * w, -150), sh, .3, { n: 2 });
    for (const s of [-1, 1]) {
      const xs = s * R * .82, rh = 64 * w, hh = 60, q = [];
      for (let i = 0; i <= 8; i++) { const a = i / 8 * PI / 2; q.push([xs + s * Math.sin(a) * rh, -208 - Math.cos(a) * hh]); }
      const col = LEAD();
      wash(S, q.concat([[xs, -206]]), mixc(col, C.paper, .15), .8, { n: 0, jit: 1.2 });
      rows(S, q.concat([[xs, -206]]), col, { gap: 9, w: 12, a: .2, ga: .14, nb: 3, inset: 1, rough: .38, bend: -4 });
      if (s > 0) wash(S, q.slice(3).concat([[xs + rh * .35, -206]]), mixc(col, C.ink, .3), .4, { n: 0, jit: .8 });
      curve(S, s > 0 ? q : q.slice(4), s > 0 ? 1.9 : 1.3, s > 0 ? .7 : .4, C.ink, 4);
      for (let i = 0; i < 4; i++) win(S, xs + s * rh * (.22 + i * .2), -212, 6, 14, 'round', { sill: false, ink: false, a: .5, lit });
      // small corner domes over the lower hall
      dome(S, s * 128 * w, -150, 20, 18, { fin: 12 });
    }
    // 3 the prayer hall: two tiers of arched windows, buttresses
    face(S, box(-hw, -152, hw, 0), wall, { a: .76, gap: 16 });
    wash(S, box(hw - 26, -152, hw, 0), sh, .4, { n: 2 });
    rows(S, box(-hw, -146, hw, -4), mixc(sh, C.ink, .1), { gap: 14, w: 2, a: .2, broken: .55, nb: 0 });
    line(S, -hw - 4, -152, hw + 4, -152, 3, mixc(C.ink, wall, .3), .7);
    line(S, -hw, -82, hw, -82, 2, mixc(sh, C.ink, .2), .45);
    const nw = Math.round(9 * w);
    for (let i = 0; i < nw; i++) {
      const x = -hw + 2 * hw * (i + .5) / nw;
      win(S, x, -100, 11, 34, 'round', { lit, sill: false });
      win(S, x, -14, 16, 46, i === Math.floor(nw / 2) ? 'pointed' : 'round', { lit, grid: i === Math.floor(nw / 2) ? null : [1, 0], gridCol: C.ink });
    }
    for (const x of [-hw * .5, hw * .5]) { line(S, x, -150, x, -4, 6, mixc(sh, wall, .4), .35); }
    pen(S, [[hw, -152], [hw, 0]], 2, .72);
    // 4 courtyard wings with arcades and rows of small domes
    for (const s of [-1, 1]) {
      const a = s < 0 ? -ww : hw, b = s < 0 ? -hw : ww;
      face(S, box(a, -64, b, 0), wall, { a: .76 });
      if (s > 0) wash(S, box(b - 16, -64, b, 0), sh, .4, { n: 1 });
      const nd = Math.max(2, Math.round((b - a) / 30));
      for (let i = 0; i < nd; i++) {
        const x = a + (b - a) * (i + .5) / nd;
        dome(S, x, -64, (b - a) / nd * .42, 13, { fin: 6, ribs: false, iw: 1 });
        win(S, x, -6, (b - a) / nd * .5, 40, 'pointed', { sill: false, ink: false, a: .55, lit });
      }
      line(S, a - 3, -64, b + 3, -64, 2.4, mixc(C.ink, wall, .3), .7);
    }
    pen(S, [[ww, -64], [ww, 0]], 1.9, .7);
    line(S, -ww - 2, 0, ww + 2, 0, 2.4, C.ink, .6);
    // 5 minarets
    const n = o.minarets ?? 4;
    const MS = { 1: [[hw + 14, 400, 3]], 2: [[-hw - 14, 400, 3], [hw + 14, 400, 3]],
      4: [[-ww + 4, 330, 2], [-hw - 14, 400, 3], [hw + 14, 400, 3], [ww - 4, 330, 2]],
      6: [[-ww + 4, 330, 2], [-hw - 40 * w, 380, 3], [-hw + 6, 400, 3], [hw - 6, 400, 3], [hw + 40 * w, 380, 3], [ww - 4, 330, 2]] }[n] || [];
    for (const [x, h, b] of MS) minaret(S, x, h, { balconies: b, w: 15 });
    return fin(S, sc, { top: [0, -360] });
  };

  // ================================================================ churches
  function ocul(S, cx, cy, r, o = {}) {
    S.push(washShape(arcPts(cx, cy, r, r, 14, 0, 2 * PI).slice(0, 14), o.col || DARK(), o.a ?? .5, 2, .8));
    if (o.spokes) for (let i = 0; i < 4; i++) { const a = i / 4 * PI; line(S, cx - Math.cos(a) * r, cy - Math.sin(a) * r, cx + Math.cos(a) * r, cy + Math.sin(a) * r, Math.max(.8, r * .08), mixc(C.stone, C.ink, .15), .6); }
    curve(S, arcPts(cx, cy, r + 1.5, r + 1.5, 14, 0, 2 * PI), Math.max(1, r * .1), .6, C.ink, 5);
  }
  // a quarter dome leaning on a bigger one (s = -1 left, 1 right): Ottoman and Byzantine cascades
  function halfDome(S, xs, by, rh, hh, s, o = {}) {
    const q = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * PI / 2; q.push([xs + s * Math.sin(a) * rh, by - Math.cos(a) * hh]); }
    const body = q.concat([[xs, by + 2]]), col = o.col || LEAD();
    wash(S, body, mixc(col, C.paper, .15), .8, { n: 0, jit: 1.2 });
    rows(S, body, col, { gap: Math.max(6, hh / 6), w: Math.max(6, hh / 6) * 1.3, a: .2, ga: .14, nb: 3, inset: 1, rough: .38, bend: -hh * .06 });
    if (s > 0) wash(S, q.slice(3).concat([[xs + rh * .35, by]]), mixc(col, C.ink, .3), .4, { n: 0, jit: .8 });
    curve(S, s > 0 ? q : q.slice(4), s > 0 ? 1.9 : 1.3, s > 0 ? .7 : .4, C.ink, 4);
    for (let i = 0; i < (o.windows ?? 4); i++) win(S, xs + s * rh * (.22 + i * .2), by - 4, Math.max(3, rh * .09), Math.max(8, hh * .22), 'round', { sill: false, ink: false, a: .5, lit: o.lit });
  }
  // church — o: {style: 'byzantine' (default: Hagia Sophia-like: shallow dome on a ring of windows, half domes,
  //   massive buttresses, ochre-pink walls; minarets: 0 | 2 | 4 turns it into the Ayasofya mosque) | 'gothic'
  //   (west tower with a tall spire, nave with pointed windows between pinnacled buttresses, apse) | 'chapel'
  //   (small stone chapel, bell-cote, cross), w: width factor, col: wall token, roof: token (chapel), lit: true}
  const CHURCH = {};
  G.church = (sc, o = {}) => { const [S, x] = (CHURCH[o.style] || CHURCH.byzantine)(o); return fin(S, sc, x); };
  CHURCH.byzantine = o => {
    const S = [], w = o.w ?? 1, lit = o.lit, wall = T(o.col, mixc(mixc(C.roof, C.stone, .58), C.paper, .12)), sh = mixc(wall, C.stoneDark, .5);
    const R = 106, yD = -252, W2 = 214 * w, cb = 112 * w;
    contact(S, -W2, W2);
    // the half domes east and west, sloping away from the central block
    for (const s2 of [-1, 1]) halfDome(S, s2 * cb, -178, 82 * w, 54, s2, { lit, windows: 5 });
    // the great dome on its ring of forty windows
    face(S, box(-R * .95, yD, R * .95, yD + 18), wall, { a: .85, tex: false });
    for (let i = 0; i < 17; i++) { const u = (i + .5) / 17 * 2 - 1, x = Math.sin(u * PI / 2.1) * R * .9; win(S, x, yD + 14, Math.max(2, 6 * Math.cos(u)), 11, 'round', { sill: false, ink: false, a: .55, lit }); }
    dome(S, 0, yD, R, 50, { fin: 32 });
    // the central block with the great tympanum arch full of windows
    face(S, box(-cb, yD + 18, cb, -118), wall, { a: .8 });
    curve(S, arcPts(0, -122, 90 * w, 104, 12, PI, 2 * PI), 2.4, .6, mixc(sh, C.ink, .3), 4);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7 - r * 2; i++) win(S, (-60 + r * 20 + i * 20) * w, -132 - r * 28, 8, 17, 'round', { sill: false, a: .55, lit });
    // the massive buttresses in front of the half domes, sloped tops
    for (const s2 of [-1, 1]) {
      const xi = s2 * (cb - 4), xo = s2 * (cb + 40 * w), xl = Math.min(xi, xo), xr = Math.max(xi, xo);
      const pts = [[xl, s2 < 0 ? -200 : -226], [xr, s2 < 0 ? -226 : -200], [xr, -110], [xl, -110]];
      face(S, pts, s2 > 0 ? sh : mixc(wall, C.stoneDark, .15), { a: .88, dir: 'v' });
      for (const f of [.4, .7]) line(S, xl, -110 - 90 * f, xr, -110 - 90 * f, 2, mixc(sh, C.ink, .25), .45);
      pen(S, [pts[0], pts[1], pts[2]], 1.8, .65);
    }
    // the lower mass: aisles and galleries, small domes at the corners
    face(S, box(-W2, -118, W2, 0), wall, { a: .78 });
    wash(S, box(W2 - 30, -118, W2, 0), sh, .4, { n: 2 });
    for (const s2 of [-1, 1]) dome(S, s2 * (W2 - 34), -118, 24, 19, { fin: 12, alem: o.minarets ? 'crescent' : 'cross' });
    for (let row = 0; row < 2; row++) for (let i = 0; i < 10; i++) {
      const x = -W2 + 2 * W2 * (i + .5) / 10; if (Math.abs(x) < 50 && row === 0) continue;
      win(S, x, row ? -76 : -16, 11, row ? 22 : 34, 'round', { sill: false, a: .58, lit });
    }
    wash(S, opening(0, 0, 40, 66, 'round'), mixc(C.wood, C.ink, .2), .85, { n: 0, jit: .8 });
    line(S, -W2 - 3, -118, W2 + 3, -118, 3, mixc(C.ink, wall, .3), .7);
    pen(S, [[W2, -118], [W2, 0]], 1.9, .7);
    line(S, -W2 - 2, 0, W2 + 2, 0, 2.4, C.ink, .6);
    const n = o.minarets ?? 0;
    const MS = { 1: [[W2 + 12, 360, 2]], 2: [[-W2 - 12, 360, 2], [W2 + 12, 360, 2]], 4: [[-W2 - 24, 330, 2], [-W2 + 20, 380, 2], [W2 - 20, 380, 2], [W2 + 24, 330, 2]] }[n] || [];
    for (const [x, h, b] of MS) minaret(S, x, h, { balconies: b, w: 15 });
    return [S, { top: [0, yD - 50] }];
  };
  CHURCH.gothic = o => {
    const S = [], w = o.w ?? 1, lit = o.lit, stone = T(o.col, mixc(C.stone, C.stoneDark, .1)), sh = mixc(stone, C.stoneDark, .5);
    const slate = mixc(C.stoneDark, C.night, .35), ox = -40 * w, nx0 = ox - 50 * w, nx1 = ox + 210 * w, nH = 150;
    contact(S, ox - 110 * w, nx1 + 40);
    // nave roof and wall
    const rf = [[nx0, -nH + 2], [nx1 + 6, -nH + 2], [nx1 - 18, -nH - 84], [nx0, -nH - 84]];
    face(S, rf, slate, { a: .82, gap: 9 });
    face(S, box(nx0, -nH, nx1, 0), stone, { a: .76 });
    // apse
    face(S, box(nx1, -118, nx1 + 44, 0), sh, { a: .8, dir: 'v' });
    wash(S, [[nx1 - 2, -116], [nx1 + 48, -116], [nx1 + 8, -170]], slate, .85, { n: 2 });
    // buttresses with pinnacles, pointed windows between them
    const nb = Math.round(5 * w);
    for (let i = 0; i <= nb; i++) {
      const x = nx0 + 14 + (nx1 - nx0 - 20) * i / nb;
      face(S, [[x - 6, -nH - 10], [x + 6, -nH - 10], [x + 9, -60], [x + 11, 0], [x - 11, 0], [x - 9, -60]], stone, { a: .88, tex: false });
      wash(S, [[x + 1, -nH - 10], [x + 6, -nH - 10], [x + 9, -60], [x + 11, 0], [x + 2, 0]], sh, .45, { n: 1, jit: .5 });
      wash(S, [[x - 6, -nH - 10], [x + 6, -nH - 10], [x, -nH - 40]], stone, .9, { n: 1, jit: .5 });
      line(S, x + 6, -nH - 10, x, -nH - 40, 1.3, C.ink, .6); line(S, x + 11, 0, x + 6, -nH - 10, 1.5, C.ink, .55);
      if (i < nb) win(S, x + (nx1 - nx0 - 20) / nb / 2, -36, 18, 90, 'pointed', { grid: [1, 2], gridCol: mixc(C.stone, C.ink, .2), lit });
    }
    // west tower and spire
    const tx = ox - 75 * w, tw = 72;
    stower(S, tx, tw, 250, { col: stone, crenel: false, windows: false, D: [16, -6] });
    for (const x of [tx - 14, tx + 14]) { win(S, x, -196, 14, 46, 'pointed', { sill: false, a: .75 }); for (let y = -200; y > -232; y -= 7) line(S, x - 6, y, x + 6, y + 2, 1.4, mixc(C.wood, C.ink, .3), .6); }
    ocul(S, tx, -140, 13, { spokes: true });
    win(S, tx, 0, 32, 74, 'pointed', { sill: false, col: mixc(C.wood, C.ink, .3), a: .8 });
    pen(S, [[tx - 24, -76], [tx, -100], [tx + 24, -76]], 1.8, .7);
    for (const x of [tx - tw / 2 + 3, tx + tw / 2 - 3]) { wash(S, [[x - 6, -250], [x + 6, -250], [x, -282]], stone, .9, { n: 1, jit: .5 }); line(S, x + 6, -250, x, -282, 1.2, C.ink, .6); }
    const sp = [[tx - tw / 2 + 8, -248], [tx + tw / 2 - 8, -248], [tx + 4, -440]];
    face(S, sp, slate, { a: .86, dir: 'v', gap: 7 });
    wash(S, [[tx + 2, -248], [tx + tw / 2 - 8, -248], [tx + 4, -440]], mixc(slate, C.ink, .3), .45, { n: 2 });
    for (const [y, f] of [[-300, .55], [-360, .35]]) { const hw2 = tw * f / 2; wash(S, [[tx - hw2 * .5, y], [tx + hw2 * .5, y], [tx, y - 18]], mixc(stone, C.paper, .2), .9, { n: 1, jit: .4 }); win(S, tx, y, hw2 * .45, 12, 'pointed', { sill: false, ink: false, a: .6 }); }
    line(S, sp[1][0], sp[1][1], sp[2][0], sp[2][1], 1.8, C.ink, .7); line(S, sp[0][0], sp[0][1], sp[2][0], sp[2][1], 1.1, C.ink, .35);
    finial(S, tx + 4, -440, 26, 'cross');
    pen(S, [[nx0, -nH - 84], [nx1 - 18, -nH - 84], [nx1 + 6, -nH + 2]], 1.8, .7);
    line(S, ox - 115 * w, 0, nx1 + 46, 0, 2.4, C.ink, .6);
    return [S, { top: [tx + 4, -470] }];
  };
  CHURCH.chapel = o => {
    const S = [], w = o.w ?? 1, lit = o.lit, wall = T(o.col, STONE()), wh = 92, rise = 72;
    const g = gable(S, { gw: 112 * w, wh, rise, D: [118 * w, -10 * w], wall, roof: T(o.roof, mixc(C.roof, C.stoneDark, .35)) });
    const { X0, X1, gc, D, P } = g, k = D[1] / D[0], sk = (x, y) => [x, y + (x - X1) * k];
    rows(S, [[X0, 0], [X1, 0], [X1, -wh], [X0, -wh]], mixc(SHADE(), C.ink, .15), { gap: 12, w: 2.2, a: .25, broken: .5, nb: 0 });
    wash(S, opening(gc, 0, 30, 56, 'round'), mixc(C.wood, C.ink, .2), .88, { n: 0, jit: .6 });
    curve(S, opening(gc, 0, 38, 62, 'round').slice(1), 2.4, .7);
    ocul(S, gc, -wh - rise * .28, 9, { spokes: true });
    for (const f of [.3, .7]) { const [cx, cy] = sk(X1 + D[0] * f, -26); win(S, cx, cy, 14, 34, 'round', { k, lit }); }
    // bell-cote on the apex
    const by = P[1] + 6;
    face(S, box(gc - 13, by - 40, gc + 13, by), wall, { a: .9, tex: false });
    win(S, gc, by - 10, 13, 24, 'round', { sill: false, a: .7 });
    S.push(mk(qcurve(gc, by - 26, gc, by - 15, 0, 3), 8, mixc(C.gold, C.stoneDark, .45), { prof: 'leaf', nb: 0, a: .9 }));
    pen(S, [[gc - 15, by - 40], [gc, by - 52], [gc + 15, by - 40]], 1.8, .7);
    finial(S, gc, by - 52, 22, 'cross');
    gableInk(S, g, wh);
    return [S, { top: [gc, by - 74] }];
  };

  // ================================================================ antiquity
  // one column (part): base, shaft with entasis and flutes, capital ('doric' | 'ionic' | 'corinthian'); o.broken
  // 0.1..0.9 = a broken shaft of that fraction. Returns the top y.
  function column(S, x, yb, h, cw, o = {}) {
    const marble = o.col || mixc(C.stone, C.paperLight, .5), sh = mixc(marble, C.stoneDark, .55), style = o.style || 'doric';
    const brk = o.broken ? Math.min(.95, Math.max(.08, o.broken)) : 1, base = style === 'doric' ? 0 : cw * .32;
    if (base) {
      wash(S, box(x - cw * .7, yb - base, x + cw * .7, yb), marble, .9, { n: 1, jit: .6 });
      wash(S, box(x + cw * .1, yb - base, x + cw * .7, yb), sh, .4, { n: 1, jit: .4 });
      line(S, x - cw * .72, yb - base * .5, x + cw * .72, yb - base * .5, Math.max(.8, cw * .05), mixc(sh, C.ink, .3), .5);
    }
    const capH = style === 'doric' ? cw * .5 : style === 'ionic' ? cw * .45 : cw * .9;
    const sb = yb - base, shH = h - base - capH, top = sb - shH * brk, bw = cw / 2, tw = cw * (1 - .16 * brk) / 2;
    const shaft = brk < 1 ? [[x - bw, sb], [x + bw, sb], [x + tw, top + rnd(0, 8)], [x + tw * .2, top - rnd(2, 9)], [x - tw * .5, top + rnd(0, 6)], [x - tw, top - rnd(0, 7)]]
      : [[x - bw, sb], [x + bw, sb], [x + tw, top], [x - tw, top]];
    wash(S, shaft, marble, .86, { n: 2, jit: Math.min(1, cw * .04) });
    wash(S, [[x + bw * .15, sb], [x + bw, sb], [x + tw, top + 4], [x + tw * .1, top + 4]], sh, .42, { n: 2, jit: .5 });
    if (cw > 10) for (const f of [-.55, -.18, .2, .58]) line(S, x + bw * f, sb - 2, x + tw * f, top + 5, Math.max(.6, cw * .035), sh, .38, { bend: 0 });
    if (brk < 1 || o.drums) for (let y = sb - shH / 5; y > top + 6; y -= shH / 5) line(S, x - bw, y, x + bw, y + 1, Math.max(.7, cw * .04), mixc(sh, C.ink, .3), .45);
    line(S, x + bw, sb, x + tw, top + 2, Math.max(.9, cw * .06), C.ink, .6, { bend: 0 });
    line(S, x - bw, sb, x - tw, top + 2, Math.max(.6, cw * .04), C.ink, .25, { bend: 0 });
    if (brk < 1) { pen(S, shaft.slice(2), Math.max(.8, cw * .05), .55); return top - 4; }
    let ct = top;
    if (style === 'doric') {
      wash(S, [[x - tw, top], [x + tw, top], [x + cw * .68, top - cw * .26], [x - cw * .68, top - cw * .26]], marble, .9, { n: 1, jit: .5 });
      ct = top - cw * .26;
    } else if (style === 'ionic') {
      for (const s of [-1, 1]) {
        const vx = x + s * cw * .52, vy = top - cw * .16, sp = [];
        for (let i = 0; i <= 12; i++) { const a = s * i * .62, r = cw * .2 * (1 - i / 15); sp.push([vx + Math.cos(a + (s > 0 ? 0 : PI)) * r, vy + Math.sin(a + (s > 0 ? 0 : PI)) * r]); }
        S.push(mk(sp, Math.max(.8, cw * .06), mixc(sh, C.ink, .3), { prof: 'tip', nb: 0, a: .75 }));
      }
      ct = top - cw * .2;
    } else {
      wash(S, [[x - tw, top], [x + tw, top], [x + cw * .7, top - cw * .7], [x - cw * .7, top - cw * .7]], marble, .9, { n: 1, jit: .5 });
      WC.clump(S, x, top - cw * .32, cw * .4, cw > 14 ? 11 : 6, [marble, mixc(marble, C.stoneDark, .3), sh], { dir: -PI / 2, spread: 1, l0: cw * .14, l1: cw * .3, w0: cw * .1, w1: cw * .18, sx: 1.2, sy: .7, a0: .7, a1: .9 });
      ct = top - cw * .7;
    }
    wash(S, box(x - cw * .74, ct - cw * .2, x + cw * .74, ct), marble, .92, { n: 1, jit: .5 });
    wash(S, box(x + cw * .1, ct - cw * .2, x + cw * .74, ct), sh, .35, { n: 1, jit: .4 });
    line(S, x - cw * .76, ct, x + cw * .76, ct, Math.max(.8, cw * .06), C.ink, .55);
    return ct - cw * .2;
  }
  function rubble(S, x0, x1, n, colour) {
    for (let i = 0; i < n; i++) {
      const x = rnd(x0, x1), w = rnd(10, 30), h = w * rnd(.45, .75), y = rnd(-1, 7);
      const pts = [[x - w / 2, y], [x - w * .42, y - h * rnd(.7, 1)], [x + w * .1, y - h], [x + w * .5, y - h * rnd(.6, .9)], [x + w / 2, y]];
      wash(S, pts, colour, .85, { n: 1, jit: .8 });
      wash(S, [[x + w * .05, y], [x + w * .1, y - h], [x + w * .5, y - h * .75], [x + w / 2, y]], mixc(colour, C.stoneDark, .5), .45, { n: 1, jit: .5 });
      pen(S, [[x + w * .1, y - h], [x + w * .5, y - h * .75], [x + w / 2, y]], 1.1, .5);
    }
  }
  // a column drum lying on the ground (a fallen piece), length L, diameter d
  function drumLying(S, x, L, d, colour) {
    const sh = mixc(colour, C.stoneDark, .5), y = -d / 2;
    wash(S, box(x - L / 2, -d, x + L / 2, 0), colour, .86, { n: 2, jit: .8 });
    wash(S, box(x - L / 2, -d * .4, x + L / 2, 0), sh, .4, { n: 1, jit: .6 });
    for (const f of [-.25, .1, .4]) line(S, x - L / 2 + 3, y + d * f, x + L / 2 - 3, y + d * f, Math.max(.6, d * .04), sh, .35);
    S.push(washShape(arcPts(x + L / 2, y, d * .22, d / 2, 12, 0, 2 * PI).slice(0, 12), mixc(colour, C.paperLight, .2), .9, 1, .5));
    curve(S, arcPts(x + L / 2, y, d * .22, d / 2, 12, 0, 2 * PI), 1.2, .6, C.ink, 6);
    line(S, x - L / 2, 0, x + L / 2, 0, 1.4, C.ink, .55);
  }
  // temple — a Greek temple front, about 390 × 270 px: three steps, a colonnade in front of the dark cella,
  //   architrave with triglyphs, a pediment. o: {cols: 2–12 (6), style: 'greek' (default) | 'roman' (podium, front
  //   stair, corinthian), order: 'doric' | 'ionic' | 'corinthian' (greek), ruined: true, col: marble token}
  G.temple = (sc, o = {}) => {
    const S = [], roman = o.style === 'roman', n = Math.max(2, Math.min(12, Math.round(o.cols ?? (roman ? 4 : 6)))), ruined = o.ruined;
    const marble = T(o.col, mixc(C.stone, C.paperLight, .5)), sh = mixc(marble, C.stoneDark, .5), dk = mixc(C.stoneDark, C.ink, .35);
    const cw = roman ? 23 : 26, pitch = roman ? 58 : 62, cH = roman ? 196 : 165, cs = (n - 1) * pitch + cw, W = cs + (roman ? 40 : 56);
    const x0 = -W / 2, x1 = W / 2, order = roman ? 'corinthian' : (o.order || 'doric');
    let yb;
    contact(S, x0, x1);
    if (roman) {
      const pH = 48;
      face(S, box(x0, -pH, x1, 0), marble, { a: .74 });
      wash(S, box(-cs * .36, -pH, cs * .36, 0), mixc(marble, C.paperLight, .3), .7, { n: 2 });
      for (let y = -5; y > -pH; y -= 6) line(S, -cs * .36, y, cs * .36, y, 1.4, sh, .55, { bend: 0 });
      line(S, x0 - 4, -pH, x1 + 4, -pH, 3, mixc(C.ink, marble, .3), .7);
      yb = -pH;
    } else {
      for (let i = 0; i < 3; i++) {
        const ins = i * 9, y = -i * 10;
        face(S, box(x0 + ins, y - 10, x1 - ins, y), marble, { a: .78, tex: false });
        wash(S, box(x0 + ins, y - 4, x1 - ins, y), sh, .32, { n: 1, jit: .6 });
        line(S, x0 + ins, y - 10, x1 - ins, y - 10, 1.4, mixc(sh, C.ink, .2), .55);
      }
      yb = -30;
    }
    const sx0 = -cs / 2 + cw / 2;
    // the cella in shadow behind the colonnade
    if (!ruined) {
      const cel = box(sx0, yb - cH + 6, -sx0, yb), cc = mixc(dk, marble, .3);
      wash(S, cel, cc, .4, { n: 2 });
      rows(S, cel, cc, { gap: 14, w: 18, a: .1, ga: .16, nb: 4 });
      win(S, 0, yb, cw * 1.4, cH * .6, 'rect', { col: mixc(C.ink, C.night, .3), a: .45, sill: false, ink: false });
    } else {
      const wl2 = [[sx0, yb], [-sx0, yb], [-sx0, yb - 34], [-sx0 - 50, yb - 52], [sx0 + cs * .45, yb - 40], [sx0 + cs * .25, yb - 78], [sx0, yb - 66]];
      face(S, wl2, mixc(marble, C.stoneDark, .3), { a: .5 });
      pen(S, wl2.slice(2).concat([wl2[0]]), 1.2, .45);
    }
    const tops = [];
    for (let i = 0; i < n; i++) {
      const x = sx0 + i * pitch;
      if (ruined && i > 1 && i < n - 1 && rnd() < .2) { tops.push(null); rubble(S, x - 20, x + 20, 2, marble); continue; }
      const br = ruined && i > 1 && rnd() < .55 ? rnd(.2, .75) : 0;
      tops.push({ x, t: column(S, x, yb, cH, cw, { style: order, broken: br, col: marble }), full: !br });
    }
    const eb = yb - cH, rise = W * .13;
    const frieze = (a, b) => {
      face(S, box(a, eb - 18, b, eb), marble, { a: .82, tex: false });
      face(S, box(a, eb - 38, b, eb - 18), marble, { a: .78, tex: false });
      wash(S, box(a, eb - 6, b, eb), sh, .3, { n: 1 });
      if (!roman) for (let x = a + 8; x < b - 6; x += pitch / 2) for (const d of [0, 4]) line(S, x + d, eb - 35, x + d, eb - 21, 2, mixc(sh, C.ink, .3), .55, { bend: 0 });
      wash(S, box(a - 6, eb - 46, b + 6, eb - 38), marble, .9, { n: 1 });
      line(S, a - 6, eb - 38, b + 6, eb - 38, 1.8, C.ink, .6); line(S, a, eb - 18, b, eb - 18, 1.1, mixc(sh, C.ink, .3), .5);
      line(S, a, eb, b, eb, 1.6, C.ink, .55);
    };
    if (!ruined) {
      frieze(x0 + 14, x1 - 14);
      const ped = [[x0 + 8, eb - 46], [x1 - 8, eb - 46], [0, eb - 46 - rise]];
      face(S, ped, marble, { a: .8, tex: false });
      wash(S, [[x0 + 30, eb - 50], [x1 - 30, eb - 50], [0, eb - 46 - rise + 10]], sh, .35, { n: 2 });
      pen(S, [[x0 + 4, eb - 45], [0, eb - 46 - rise - 2], [x1 - 4, eb - 45]], 2, .75);
      if (roman) finial(S, 0, eb - 46 - rise, 14, 'ball');
    } else {
      for (let i = 0; i + 1 < tops.length; i++) {
        const a = tops[i], b = tops[i + 1];
        if (a && b && a.full && b.full) frieze(a.x - cw * .7, b.x + cw * .7);
      }
      if (tops[0] && tops[0].full && tops[1] && tops[1].full) {
        const ped = [[x0 + 8, eb - 46], [x0 + 8 + W * .26, eb - 46], [x0 + 8 + W * .22, eb - 46 - rise * .52]];
        face(S, ped, marble, { a: .82, tex: false });
        pen(S, [ped[0], ped[2], ped[1]], 1.8, .7);
      }
      rubble(S, x0 - 10, x1 + 10, 6, marble);
      drumLying(S, x1 - 40, 54, 24, marble);
    }
    line(S, x0 - 2, 0, x1 + 2, 0, 2.2, C.ink, .6);
    return fin(S, sc, { top: [0, eb - 46 - rise] });
  };
  // column — one classical column, about 290 px. o: {style: 'doric' | 'ionic' (default) | 'corinthian', h: height
  //   factor, broken: 0.1–0.9 (a broken shaft), col: marble token}
  G.column = (sc, o = {}) => {
    const S = [], h = 270 * (o.h ?? 1), marble = T(o.col, mixc(C.stone, C.paperLight, .5));
    contact(S, -30, 30, .18);
    face(S, box(-30, -18, 30, 0), marble, { a: .85, tex: false });
    wash(S, box(6, -18, 30, 0), mixc(marble, C.stoneDark, .5), .4, { n: 1 });
    pen(S, [[-30, -18], [30, -18], [30, 0]], 1.6, .65);
    const t = column(S, 0, -18, h, 34, { style: o.style || 'ionic', broken: o.broken, col: marble, drums: true });
    return fin(S, sc, { top: [0, t] });
  };
  // ruin — what is left of a temple: broken columns of different heights, an architrave on two of them,
  //   fallen drums and rubble. About 380 px wide. o: {w: width factor, n: standing columns (4), order, col: marble token}
  G.ruin = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, W = 380 * w, marble = T(o.col, mixc(mixc(C.stone, C.paperLight, .4), C.ground, .2)), sh = mixc(marble, C.stoneDark, .5);
    const n = Math.max(2, Math.min(7, o.n ?? 4)), cw = 26, cH = 190;
    contact(S, -W / 2, W / 2, .16);
    // the broken platform
    const pl = [[-W / 2, 0], [W * .42, 0], [W * .4, -8], [W * .3, -12], [W * .26, -20], [-W / 2 + 6, -20]];
    face(S, pl, marble, { a: .8, tex: false });
    wash(S, [[-W / 2, -6], [W * .42, -6], [W * .42, 0], [-W / 2, 0]], sh, .35, { n: 1 });
    pen(S, [pl[5], pl[4], pl[3], pl[2], pl[1]], 1.4, .55);
    const xs = []; for (let i = 0; i < n; i++) xs.push(-W * .38 + (W * .62) * i / Math.max(1, n - 1));
    const brk = xs.map((_, i) => (i === 1 || i === 2 ? 0 : rnd(.2, .7)));
    xs.forEach((x, i) => column(S, x, -20, cH, cw, { style: o.order || 'doric', broken: brk[i], col: marble, drums: true }));
    // the architrave left on the two whole columns
    const a = xs[1] - cw * .7, b = xs[2] + cw * .7, eb = -20 - cH;
    face(S, [[a, eb - 22], [b - 8, eb - 24], [b, eb - 14], [b - 4, eb], [a, eb]], marble, { a: .85, tex: false });
    wash(S, box(a, eb - 6, b - 4, eb), sh, .35, { n: 1 });
    pen(S, [[a, eb - 22], [b - 8, eb - 24], [b, eb - 14], [b - 4, eb], [a, eb]], 1.5, .65);
    drumLying(S, W * .2, 58, 26, marble);
    drumLying(S, -W * .05, 40, 24, marble);
    rubble(S, -W * .5, W * .5, 8, marble);
    for (let i = 0; i < 5; i++) { const gx = rnd(-W / 2, W / 2); for (let k = 0; k < 5; k++) S.push(mk(WC.polar(gx + k * 3, 2, -PI / 2 + rnd(-.6, .6), rnd(8, 18), 2, 4), 1.8, pick(WC.shades(C.leaf, .2)), { prof: 'tip', nb: 0, a: .75 })); }
    return fin(S, sc, { top: [xs[1], eb - 24] });
  };

  // stepped mass: tiers from the bottom, each a front face, a sliver of its right side and its top ledge
  function stepped(S, tiers, W0, W1, H, colour, o = {}) {
    const D = o.D || [20, -8], th = (H + (tiers - 1) * D[1] * .5) / tiers, bat = o.batter ?? 5, tops = [];
    let y = 0;
    for (let i = 0; i < tiers; i++) {
      const w = W0 + (W1 - W0) * i / Math.max(1, tiers - 1), x0 = -w / 2, x1 = w / 2, yt = y - th;
      const fr = [[x0, y], [x1, y], [x1 - bat, yt], [x0 + bat, yt]];
      face(S, fr, colour, { a: .78, gap: Math.max(7, th / 4) });
      if (o.grooves) for (let x = x0 + 14; x < x1 - 8; x += 18) line(S, x, y - 3, x + (x < 0 ? 1 : -1) * bat * .5, yt + 3, 3, mixc(colour, C.stoneDark, .4), .35, { bend: 0 });
      face(S, [[x1, y], [x1 + D[0] * .7, y + D[1] * .7], [x1 - bat + D[0] * .7, yt + D[1] * .7], [x1 - bat, yt]], mixc(colour, C.stoneDark, .55), { a: .8, tex: false });
      const led = [[x0 + bat, yt], [x1 - bat, yt], [x1 - bat + D[0] * .5, yt + D[1] * .5], [x0 + bat + D[0] * .5, yt + D[1] * .5]];
      wash(S, led, mixc(colour, C.paperLight, .25), .8, { n: 2 });
      pen(S, [[x0 + bat, yt], [x1 - bat, yt], [x1, y]], 1.6, .62);
      tops.push([yt + D[1] * .5, w]);
      y = yt + D[1] * .5;
    }
    line(S, -W0 / 2 - 2, 0, W0 / 2 + 2, 0, 2.2, C.ink, .6);
    return tops;
  }
  // pyramid — o: {style: 'giza' (default: smooth faces, one lit, one in shade, ~500 × 300 px) | 'step' (Djoser, six
  //   tiers) | 'meso' (Mesoamerican: tiers, a central stair, a temple on top), w: width factor, col: stone token}
  G.pyramid = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, style = o.style || 'giza';
    if (style === 'step' || style === 'meso') {
      const meso = style === 'meso', colour = T(o.col, meso ? mixc(C.stone, C.stoneDark, .22) : mixc(C.ground, C.stone, .5));
      contact(S, -230 * w, 240 * w, .16);
      const tops = stepped(S, meso ? 5 : 6, (meso ? 400 : 480) * w, (meso ? 140 : 170) * w, meso ? 220 : 230, colour, { batter: meso ? 8 : 10 });
      const [ty] = tops[tops.length - 1];
      if (meso) {
        const st = [[-36, 0], [36, 0], [24, ty], [-24, ty]];
        wash(S, st, mixc(colour, C.paperLight, .25), .85, { n: 2 });
        for (let y = -5; y > ty; y -= 6) { const f = y / ty; line(S, -36 + 12 * f, y, 36 - 12 * f, y, 1.3, mixc(colour, C.ink, .35), .5, { bend: 0 }); }
        for (const s of [-1, 1]) line(S, s * 38, 0, s * 26, ty, 5, mixc(colour, C.stoneDark, .5), .75, { bend: 0 });
        face(S, box(-52, ty - 54, 52, ty), mixc(colour, C.paper, .1), { a: .85 });
        wash(S, sideF(52, ty - 54, ty, [14, -6]), mixc(colour, C.stoneDark, .5), .8, { n: 1 });
        for (const x of [-26, 0, 26]) win(S, x, ty, 14, 30, 'rect', { sill: false, a: .75 });
        face(S, box(-34, ty - 82, 34, ty - 54), colour, { a: .85, tex: false });
        for (const x of [-18, 0, 18]) win(S, x, ty - 60, 7, 14, 'rect', { sill: false, ink: false, a: .6 });
        pen(S, [[-52, ty - 54], [52, ty - 54], [52, ty]], 1.8, .7); pen(S, [[-34, ty - 82], [34, ty - 82], [34, ty - 54]], 1.6, .65);
        return fin(S, sc, { top: [0, ty - 82] });
      }
      win(S, 0, 0, 22, 34, 'rect', { sill: false, a: .7 });
      return fin(S, sc, { top: [0, ty] });
    }
    const W = 500 * w, H = 300, fx = W * .12, sand = T(o.col, mixc(C.ground, C.stone, .45)), sh = mixc(sand, C.stoneDark, .55);
    const L = [[-W / 2, -2], [fx, 7], [0, -H]], R = [[fx, 7], [W / 2, -7], [0, -H]];
    face(S, L, sand, { a: .76, gap: 12, ga: .14 });
    face(S, R, sh, { a: .8, gap: 12 });
    rows(S, L, mixc(sand, C.stoneDark, .35), { gap: 8, w: 1.8, a: .26, broken: .35, nb: 0 });
    rows(S, R, mixc(sh, C.ink, .3), { gap: 8, w: 1.8, a: .26, broken: .35, nb: 0 });
    wash(S, [[-W * .07, -H * .86], [fx * .14, -H * .84], [0, -H]], C.skyWarm, .25, { n: 1 });
    for (let i = 0; i < 14; i++) { const f = rnd(.08, .95), ex = -W / 2 + (W / 2) * f, ey = -2 + (-H + 2) * f; line(S, ex, ey, ex + rnd(4, 9), ey + rnd(-1, 1), 2, mixc(sh, C.ink, .3), .45); }
    wash(S, [[-W / 2 - 40, 6], [-W * .2, -10], [W * .25, -14], [W / 2 + 40, 4], [W / 2 + 10, 12], [-W / 2, 12]], mixc(C.ground, C.paper, .2), .45, { n: 3 });
    pen(S, [[0, -H], [W / 2, -7]], 2, .72);
    line(S, fx, 7, 0, -H, 1.4, mixc(C.ink, sh, .3), .45, { bend: 0 });
    line(S, -W / 2, -2, 0, -H, 1.2, C.ink, .35, { bend: 0 });
    return fin(S, sc, { top: [0, -H] });
  };
  // ziggurat — a Mesopotamian temple tower, about 460 × 270 px: three mudbrick terraces with buttress grooves,
  //   a central stair and two side stairs, a glazed shrine on top. o: {w: width factor, col: brick token, shrine: token}
  G.ziggurat = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, mud = T(o.col, mixc(C.ground, C.roof, .3)), lt = mixc(mud, C.paperLight, .25), dk = mixc(mud, C.ink, .35);
    contact(S, -240 * w, 250 * w, .16);
    const tops = stepped(S, 3, 460 * w, 180 * w, 200, mud, { batter: 10, grooves: true });
    const [t1] = tops[0], [t2] = tops[1], [t3] = tops[2];
    for (const s of [-1, 1]) {
      const st = [[s * 210 * w, 0], [s * 178 * w, 0], [s * 26, t1], [s * 50, t1]];
      wash(S, st, lt, .85, { n: 2 });
      for (let i = 1; i < 12; i++) { const f = i / 12, xa = s * (210 * w + (50 - 210 * w) * f), xb = s * (178 * w + (26 - 178 * w) * f), y = t1 * f; line(S, xa, y, xb, y, 1.3, dk, .45, { bend: 0 }); }
      line(S, s * 210 * w, 0, s * 50, t1, 2.4, dk, .65, { bend: 0 });
    }
    const cs = [[-24, 0], [24, 0], [18, t2], [-18, t2]];
    wash(S, cs, lt, .9, { n: 2 });
    for (let y = -6; y > t2; y -= 6) line(S, -22 + 5 * y / t2, y, 22 - 5 * y / t2, y, 1.3, dk, .5, { bend: 0 });
    for (const s of [-1, 1]) line(S, s * 26, 0, s * 20, t2, 4, dk, .7, { bend: 0 });
    const shrine = T(o.shrine, mixc(C.blue, C.paper, .25));
    face(S, box(-44, t3 - 44, 44, t3), shrine, { a: .82 });
    wash(S, sideF(44, t3 - 44, t3, [14, -6]), mixc(shrine, C.ink, .3), .8, { n: 1 });
    win(S, 0, t3, 16, 26, 'round', { sill: false, a: .75 });
    line(S, -48, t3 - 44, 48, t3 - 44, 3, mixc(C.gold, C.stoneDark, .3), .8);
    pen(S, [[-44, t3 - 44], [44, t3 - 44], [44, t3]], 1.6, .65);
    return fin(S, sc, { top: [0, t3 - 44] });
  };

  // ================================================================ gates and bridges
  // arch — a monumental gateway, about 330 × 300 px. o: {style: 'triumphal' (default: Roman, three arches, columns,
  //   an attic with an inscription) | 'gate' (medieval city gate between two towers, portcullis) | 'ottoman'
  //   (Bab-üs Selam-like: two octagonal towers with pointed lead caps, wide eaves over a pointed portal), col}
  G.arch = (sc, o = {}) => {
    const S = [], style = o.style || 'triumphal';
    if (style === 'gate') {
      const st = T(o.col, STONE());
      contact(S, -130, 140);
      wallseg(S, -50, 50, 150, { col: st, slits: 0 });
      for (const x of [-84, 84]) stower(S, x, 74, 215, { col: st, slits: 2 });
      win(S, 0, 0, 56, 96, 'round', { sill: false, a: .82 });
      for (let x = -20; x <= 20; x += 10) line(S, x, -92, x, -8, 1.8, mixc(C.ink, C.wood, .3), .7);
      for (let y = -78; y < -8; y += 16) line(S, -25, y, 25, y, 1.6, mixc(C.ink, C.wood, .3), .6);
      curve(S, opening(0, 0, 70, 106, 'round').slice(1), 3, .7);
      return fin(S, sc, { top: [0, -230] });
    }
    if (style === 'ottoman') {
      const wall = T(o.col, mixc(C.stone, C.paperLight, .35)), lead = LEAD();
      contact(S, -110, 110);
      face(S, box(-44, -132, 44, 0), wall, { a: .8 });
      for (const x of [-72, 72]) rtower(S, x, 30, 150, { col: wall, parapet: false, cone: true, coneH: 120, slits: 2, alem: 'crescent', poly: true });
      const ev = [[-70, -124], [70, -124], [48, -152], [-48, -152]];
      face(S, ev, lead, { a: .85, gap: 7 });
      wash(S, box(-44, -124, 44, -112), mixc(C.stoneDark, C.ink, .3), .5, { n: 1 });
      pen(S, [[-72, -124], [72, -124]], 2.2, .75); pen(S, [[-48, -152], [48, -152]], 1.6, .6);
      win(S, 0, 0, 40, 86, 'pointed', { sill: false, a: .82 });
      curve(S, opening(0, 0, 52, 96, 'pointed').slice(1), 2.4, .7);
      wash(S, box(-20, -108, 20, -98), mixc(C.night, C.ink, .2), .7, { n: 1 });
      S.push(mk(qcurve(-12, -103, 12, -103, -2, 6), 4, C.gold, { prof: 'leaf', nb: 0, a: .9 }));
      return fin(S, sc, { top: [0, -310] });
    }
    const marble = T(o.col, mixc(C.stone, C.paperLight, .38)), sh = mixc(marble, C.stoneDark, .5), D = [26, -10];
    contact(S, -160, 186);
    face(S, box(-160, -230, 160, 0), marble, { a: .76 });
    face(S, sideF(160, -292, 0, D), sh, { a: .8, dir: 'v' });
    face(S, box(-160, -292, 160, -230), mixc(marble, C.stone, .3), { a: .8, tex: false });
    for (const [x, ww, hh] of [[0, 78, 150], [-100, 40, 88], [100, 40, 88]]) {
      wash(S, opening(x, 0, ww, hh, 'round'), mixc(C.stoneDark, C.ink, .2), .32, { n: 0, jit: 1 });
      wash(S, opening(x, -hh + ww * .55, ww, ww * .5, 'round'), mixc(C.stoneDark, C.ink, .3), .35, { n: 0, jit: .8 });
      curve(S, opening(x, 0, ww + 12, hh + 8, 'round').slice(1), 2, .65);
    }
    for (const x of [-100, 100]) { ocul(S, x, -132, 15, { col: sh, a: .35 }); wash(S, box(x - 30, -196, x + 30, -168), sh, .3, { n: 2 }); }
    for (const x of [-148, -52, 52, 148]) {
      face(S, box(x - 15, -42, x + 15, 0), marble, { a: .9, tex: false });
      line(S, x + 15, -42, x + 15, 0, 1.4, C.ink, .55);
      column(S, x, -42, 158, 20, { style: 'corinthian', col: marble });
    }
    wash(S, box(-160, -232, 160, -200), marble, .85, { n: 2 });
    line(S, -164, -232, 164, -232, 3, mixc(C.ink, marble, .3), .7); line(S, -162, -200, 162, -200, 1.6, mixc(sh, C.ink, .2), .6);
    for (let r = 0; r < 3; r++) { const y = -278 + r * 13; for (let x = -100; x < 100; x += rnd(9, 22)) line(S, x, y, x + rnd(5, 14), y + rnd(-.5, .5), 2.4, mixc(C.ink, sh, .25), .55); }
    pen(S, [[-160, -292], [160, -292], [160 + D[0], -292 + D[1]]], 2, .72);
    pen(S, [[160, -292], [160, 0], [160 + D[0], D[1]]], 1.9, .7);
    line(S, -162, 0, 162, 0, 2.2, C.ink, .6);
    return fin(S, sc, { top: [0, -292] });
  };

  // bridge — a bridge seen from the side, its origin at its centre on the bank / water line (y 0): the piers stand in
  //   the water and their reflection hangs below. o: {style: 'roman' (default: round arches, level deck) | 'ottoman'
  //   (pointed arches, a humped deck, relief openings over the piers; spans 1 = a Mostar-like single high arch) |
  //   'wood' (timber trestle), spans: 1–9 (3), reflect: true, col: stone token}
  G.bridge = (sc, o = {}) => {
    const S = [], n = Math.max(1, Math.min(9, Math.round(o.spans ?? 3))), style = o.style || 'roman', ott = style === 'ottoman';
    const stone = T(o.col, STONE()), sh = mixc(stone, C.stoneDark, .5), refl = o.reflect !== false, rc = mixc(stone, C.waterDeep, .28);
    if (style === 'wood') {
      const sp = 90, L = n * sp, dk = -64, wood = mixc(C.wood, C.paper, .15), wd = mixc(C.wood, C.ink, .3);
      if (refl) rows(S, box(-L / 2 - 40, 6, L / 2 + 40, 70), rc, { gap: 6, w: 4, a: .18, broken: .3, nb: 0 });
      for (let i = 0; i <= n; i++) {
        const x = -L / 2 + i * sp;
        for (const dx of [-6, 6]) line(S, x + dx, 18, x + dx * .6, dk, 5, wd, .85, { bend: 0 });
        line(S, x - 6, 10, x + 6, dk + 10, 2.4, wd, .7); line(S, x + 6, 10, x - 6, dk + 10, 2.4, wd, .7);
        if (refl) line(S, x, 8, x, 60, 6, rc, .25, { bend: 0 });
      }
      face(S, [[-L / 2 - 50, -4], [-L / 2, dk], [L / 2, dk], [L / 2 + 50, -4], [L / 2 + 50, 2], [L / 2, dk + 12], [-L / 2, dk + 12], [-L / 2 - 50, 2]], wood, { a: .85, tex: false });
      rows(S, box(-L / 2, dk, L / 2, dk + 12), wd, { gap: 6, w: 2, a: .4, dir: 'v', nb: 0 });
      for (let x = -L / 2; x <= L / 2 + .1; x += 30) line(S, x, dk, x, dk - 26, 2.4, wd, .8, { bend: 0 });
      line(S, -L / 2 - 50, -24, -L / 2, dk - 24, 2.6, wd, .8); line(S, -L / 2, dk - 24, L / 2, dk - 24, 2.8, wd, .8); line(S, L / 2, dk - 24, L / 2 + 50, -24, 2.6, wd, .8);
      line(S, -L / 2 - 60, 0, L / 2 + 60, 0, 2.6, C.waterDeep, .45);
      return fin(S, sc, { top: [0, dk - 26] });
    }
    const sp = ott ? (n === 1 ? 200 : 122) : 118, pw = 28, L = n * sp + (n + 1) * pw, ramp = 66, yW = 16, ys = -30;
    const Hd = ott ? (n === 1 ? 176 : 138) : 122, hump = ott ? (n === 1 ? 60 : 30) : 4;
    const deckY = x => { const ax = Math.abs(x); if (ax > L / 2) return -4 + (-Hd + 4) * Math.max(0, 1 - (ax - L / 2) / ramp); return -Hd - hump * (1 - Math.pow(ax / (L / 2), 2)); };
    const archOf = (a, b) => {
      const c = (a + b) / 2, r = (b - a) / 2, pts = [];
      if (ott) {
        const crown = ys - (b - a) * .78;
        qctrl(b, ys, b, ys - (ys - crown) * .62, c, crown, 8).forEach(p => pts.push(p));
        qctrl(c, crown, a, ys - (ys - crown) * .62, a, ys, 8).slice(1).forEach(p => pts.push(p));
      } else for (let i = 0; i <= 14; i++) { const t = i / 14 * PI; pts.push([c + Math.cos(t) * r, ys - Math.sin(t) * r]); }
      return pts;                                                    // from b over the crown to a
    };
    const top = []; for (let x = -L / 2 - ramp; x <= L / 2 + ramp + .1; x += 8) top.push([x, deckY(x)]);
    const bot = [[L / 2 + ramp, 2], [L / 2, yW]], arches = [];
    for (let i = n - 1; i >= 0; i--) {
      const a = -L / 2 + pw + i * (sp + pw), b = a + sp, ap = archOf(a, b);
      arches.push([a, b, ap]);
      bot.push([b, yW], [b, ys]); ap.forEach(p => bot.push(p)); bot.push([a, ys], [a, yW]);
    }
    bot.push([-L / 2, yW], [-L / 2 - ramp, 2]);
    const mass = top.concat(bot);
    // the reflection first (it lies under everything), then the bridge
    if (refl) rows(S, mass.map(([x, y]) => [x, Math.max(2, -y * .9)]), rc, { gap: 6, w: 4.5, a: .4, ga: -.28, broken: .22, nb: 0, inset: 0 });
    face(S, mass, stone, { a: .76, gap: 12 });
    rows(S, mass, mixc(sh, C.ink, .15), { gap: 11, w: 2, a: .24, broken: .5, nb: 0 });
    for (const [a, b, ap] of arches) {
      wash(S, ap.concat([[a, yW], [b, yW]]), mixc(C.stoneDark, C.ink, .3), .2, { n: 0, jit: 1 });
      const c = (a + b) / 2, out = ([x, y], d) => { const L2 = Math.hypot(x - c, y - ys) || 1; return [x + (x - c) / L2 * d, y + (y - ys) / L2 * d]; };
      for (let k = 1; k < ap.length - 1; k += n > 4 ? 3 : 2) { const [x, y] = ap[k], [ex, ey] = out(ap[k], 15); line(S, x, y, ex, ey, 1.2, mixc(sh, C.ink, .3), .5, { bend: 0 }); }
      curve(S, ap, 2, .72, C.ink, 4);
      curve(S, ap.map(p => out(p, 16)), 1.2, .4, C.ink, 4);
    }
    // piers: cutwaters and shade; Ottoman relief openings
    for (let i = 0; i <= n; i++) {
      const x0 = -L / 2 + i * (sp + pw), x1 = x0 + pw, c = (x0 + x1) / 2;
      wash(S, [[x0, ys], [x1, ys], [x1, yW], [x0, yW]], sh, .3, { n: 1, jit: .6 });
      wash(S, [[x0 - 2, ys + 2], [x1 + 2, ys + 2], [c, ys - 28]], mixc(stone, C.stoneDark, .35), .7, { n: 1, jit: .6 });
      line(S, x1 + 2, ys + 2, c, ys - 28, 1.2, C.ink, .55);
      if (ott && i > 0 && i < n) win(S, c, ys - 46, 14, 28, 'pointed', { sill: false, a: .6 });
    }
    // parapet with coping
    const par = top.map(([x, y]) => [x, y - 12]).concat(top.slice().reverse());
    face(S, par, mixc(stone, C.paperLight, .15), { a: .85, tex: false });
    for (let i = 0; i < top.length - 1; i += 4) line(S, top[i][0], top[i][1] - 12, top[i][0], top[i][1], 1, mixc(sh, C.ink, .2), .35, { bend: 0 });
    curve(S, top.map(([x, y]) => [x, y - 12]), 2, .72, C.ink, 4);
    curve(S, top, 1.2, .45, C.ink, 4);
    // the water line and a few ripples
    line(S, -L / 2 - ramp - 30, 0, L / 2 + ramp + 30, 0, 2.6, C.waterDeep, .4);
    for (let i = 0; i < 10; i++) { const x = rnd(-L / 2, L / 2), y = rnd(4, 40); line(S, x, y, x + rnd(20, 50), y, 2, C.waterDeep, .3); }
    return fin(S, sc, { top: [0, deckY(0) - 12] });
  };

  // ================================================================ coast and country
  // lighthouse — o: {style: 'stone' (default: tapered round tower, gallery, glazed lantern, keeper's house, ~360 px)
  //   | 'pharos' (Alexandria: square, octagonal and round tiers, a fire on top, ~380 px), bands: true (red bands),
  //   lit: true (default: the lamp glows and a beam sweeps, live) | false, col: stone token}
  G.lighthouse = (sc, o = {}) => {
    const S = [], lit = o.lit !== false, glowC = mixc(C.gold, C.paperLight, .3);
    if (o.style === 'pharos') {
      const st = T(o.col, mixc(C.stone, C.paperLight, .35)), sh = mixc(st, C.stoneDark, .5);
      contact(S, -100, 110);
      face(S, [[-84, 0], [84, 0], [70, -180], [-70, -180]], st, { a: .76 });
      face(S, [[84, 0], [100, -7], [86, -186], [70, -180]], sh, { a: .8, dir: 'v' });
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) win(S, -45 + i * 30, -30 - r * 50, 8, 16, 'rect', { sill: false, a: .6, lit: lit && r === 2 });
      wash(S, box(-76, -190, 92, -178), mixc(st, C.stoneDark, .3), .85, { n: 1 });
      pen(S, [[-76, -190], [92, -190]], 1.8, .7);
      face(S, box(-46, -282, 46, -190), st, { a: .8, dir: 'v' });
      wash(S, box(14, -282, 46, -190), sh, .45, { n: 2 });
      for (const f of [-.5, .3]) line(S, 46 * f, -280, 46 * f, -192, 1.2, mixc(sh, C.ink, .3), .4, { bend: 0 });
      wash(S, box(-52, -290, 52, -280), mixc(st, C.stoneDark, .3), .85, { n: 1 });
      face(S, box(-28, -340, 28, -290), st, { a: .85, tex: false });
      for (const x of [-14, 0, 14]) wash(S, box(x - 4, -334, x + 4, -296), lit ? mixc(C.fire, C.gold, .5) : DARK(), .55, { n: 1, jit: .5 });
      dome(S, 0, -340, 26, 20, { alem: 'ball', fin: 18, col: mixc(st, C.stoneDark, .3) });
      pen(S, [[84, 0], [70, -180]], 1.9, .7); pen(S, [[46, -282], [46, -190]], 1.7, .65); line(S, -86, 0, 100, -4, 2.2, C.ink, .6);
      return fin(S, sc, { top: [0, -380], live: lit && liveAt(sc, (c, lt) => { glow(c, 0, -316, 70, lt, mixc(C.fire, C.gold, .4)); WC.flame(c, 0, -300, 30 + 4 * Math.sin(lt * 7), lt, 3); }) });
    }
    const st = T(o.col, mixc(C.stone, C.paperLight, .5)), sh = mixc(st, C.stoneDark, .5);
    contact(S, -45, 110);
    // keeper's house
    face(S, box(28, -58, 104, 0), mixc(C.stone, C.paper, .2), { a: .8 });
    wash(S, [[22, -56], [110, -56], [92, -82], [40, -82]], C.roof, .85, { n: 2 });
    win(S, 66, -18, 14, 22, 'rect', { grid: [1, 1], lit });
    pen(S, [[22, -56], [110, -56]], 1.8, .7);
    // the tower
    const body = [[-38, 0], [38, 0], [25, -270], [-25, -270]];
    face(S, body, st, { a: .78, dir: 'v', ga: .22 });
    if (o.bands) for (const [ya, yb] of [[-70, -110], [-170, -210]]) {
      const hw = y => 38 - 13 * (-y / 270);
      wash(S, [[-hw(ya), ya], [hw(ya), ya], [hw(yb), yb], [-hw(yb), yb]], mixc(C.red, C.paper, .15), .8, { n: 2, jit: .6 });
    }
    wash(S, [[8, 0], [38, 0], [25, -270], [5, -270]], sh, .38, { n: 2 });
    for (const [x, y] of [[-6, -70], [5, -140], [-5, -210]]) win(S, x, y, 7, 14, 'round', { sill: false, a: .7 });
    win(S, -4, 0, 18, 34, 'round', { sill: false, col: mixc(C.wood, C.ink, .3), a: .85 });
    // gallery, lantern, cap
    wash(S, box(-36, -284, 36, -270), mixc(st, C.stoneDark, .35), .9, { n: 1 });
    for (let x = -34; x <= 34; x += 7) line(S, x, -284, x, -300, 1, C.ink, .55, { bend: 0 });
    line(S, -38, -300, 38, -300, 1.6, C.ink, .7);
    wash(S, box(-17, -334, 17, -286), lit ? mixc(C.gold, C.paperLight, .35) : DARK(), lit ? .75 : .6, { n: 1, jit: .5 });
    for (const x of [-9, 0, 9]) line(S, x, -334, x, -286, 1.2, C.ink, .65, { bend: 0 });
    dome(S, 0, -334, 21, 18, { col: o.bands ? mixc(C.red, C.ink, .15) : LEAD(), alem: 'ball', fin: 16, ribs: false });
    pen(S, [[38, 0], [25, -270]], 2, .72); line(S, -38, 0, -25, -270, 1.1, C.ink, .3); line(S, -40, 0, 30, 0, 2.2, C.ink, .6);
    return fin(S, sc, { top: [0, -370], live: lit && liveAt(sc, (c, lt) => { glow(c, 0, -310, 60, lt, glowC); beam(c, 0, -310, lt, glowC); }) });
  };
  // a soft pulsing glow (live)
  function glow(c, x, y, r, lt, colour) {
    const k = .8 + .2 * Math.sin(lt * 2.2), g = c.createRadialGradient(x, y, r * .1, x, y, r * k);
    g.addColorStop(0, WC.rgba(colour, .55)); g.addColorStop(1, WC.rgba(colour, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // a lighthouse beam swinging round: seen from the side it grows to one side, shrinks, then grows to the other
  function beam(c, x, y, lt, colour) {
    const q = Math.cos(lt * .9), L = 460 * Math.abs(q), d = Math.sign(q) || 1;
    if (L < 40) return;
    const g = c.createLinearGradient(x, 0, x + d * L, 0);
    g.addColorStop(0, WC.rgba(colour, .4 * Math.abs(q))); g.addColorStop(1, WC.rgba(colour, 0));
    c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + d * L, y - 34); c.lineTo(x + d * L, y + 30); c.lineTo(x, y + 6); c.closePath();
    c.fillStyle = g; c.fill();
  }

  // windmill — o: {style: 'dutch' (default: tapered smock tower on a brick base, a stage, a boat-shaped cap, four
  //   lattice sails, ~400 px) | 'aegean' (whitewashed round tower, thatched cone, eight triangular cloth sails,
  //   ~300 px), turn: sail speed in rad/s (0.6; 0 = still, sails painted with the mill)}
  G.windmill = (sc, o = {}) => {
    const S = [], SL = [], aeg = o.style === 'aegean', speed = o.turn ?? .6, wood = mixc(C.wood, C.ink, .25);
    let hub;
    if (aeg) {
      const wh = mixc(C.stone, C.paperLight, .55), th = mixc(C.clothC, C.wood, .35);
      contact(S, -50, 56);
      face(S, box(-44, -132, 44, 0), wh, { a: .72, dir: 'v', ga: .26 });
      wash(S, box(10, -132, 44, 0), mixc(wh, C.stoneDark, .45), .35, { n: 2 });
      win(S, -6, 0, 22, 44, 'rect', { sill: false, col: mixc(C.clothB, C.ink, .2), a: .8 });
      win(S, 10, -84, 10, 14, 'rect', { col: mixc(C.clothB, C.ink, .2) });
      const cn = [[-52, -128], [52, -128], [0, -196]];
      face(S, cn, th, { a: .85, dir: 'v', gap: 6 });
      wash(S, [[4, -128], [52, -128], [0, -196]], mixc(th, C.ink, .3), .4, { n: 2 });
      for (let x = -48; x < 48; x += 5) line(S, x, -130, x + rnd(-1, 1), -122 + rnd(0, 4), 1.4, mixc(th, C.ink, .3), .6);
      pen(S, [[44, -128], [44, 0]], 1.8, .7); line(S, 52, -128, 0, -196, 1.6, C.ink, .65); line(S, -46, 0, 48, 0, 2.2, C.ink, .6);
      hub = [0, -150];
      const cloth = mixc(C.stone, C.paperLight, .6);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * 2 * PI, P = (r, da = 0) => [Math.cos(a + da) * r, Math.sin(a + da) * r];
        const t = [P(18), P(116), P(84, .3)];
        SL.push(washShape(t, cloth, .75, 2, 1));
        SL.push(mk(qcurve(0, 0, ...P(124), 0, 6), 3.2, wood, { prof: 'even', nb: 0, a: .9 }));
        SL.push(mk(qcurve(...P(116), ...P(84, .3), 2, 5), 1.2, C.ink, { prof: 'even', nb: 0, a: .5 }));
      }
      for (let i = 0; i < 8; i++) { const a = i / 8 * 2 * PI, b = (i + 1) / 8 * 2 * PI; SL.push(mk(qcurve(Math.cos(a) * 124, Math.sin(a) * 124, Math.cos(b) * 124, Math.sin(b) * 124, 4, 5), 1, C.ink, { prof: 'even', nb: 0, a: .45 })); }
    } else {
      const brick = mixc(C.roof, C.cloth, .35), body = mixc(C.wood, C.paper, .3), cap = mixc(C.stoneDark, C.ink, .25);
      contact(S, -66, 70);
      face(S, box(-62, -40, 62, 0), brick, { a: .8 });
      const sm = [[-56, -40], [56, -40], [34, -200], [-34, -200]];
      face(S, sm, body, { a: .8, dir: 'v', gap: 6, ga: .2 });
      wash(S, [[10, -40], [56, -40], [34, -200], [6, -200]], mixc(body, C.ink, .3), .4, { n: 2 });
      for (const f of [-.5, .15]) line(S, 56 * f, -42, 34 * f, -198, 1.2, mixc(body, C.ink, .4), .45, { bend: 0 });
      // the stage
      line(S, -84, -96, 84, -96, 4, wood, .85);
      for (let x = -80; x <= 80; x += 10) line(S, x, -96, x, -112, 1.1, wood, .65, { bend: 0 });
      line(S, -84, -112, 84, -112, 1.6, wood, .75);
      for (const s of [-1, 1]) line(S, s * 82, -96, s * 50, -66, 2.4, wood, .7);
      win(S, 0, -40, 22, 40, 'rect', { sill: false, col: mixc(C.wood, C.ink, .4), a: .85 });
      win(S, -6, -136, 12, 16, 'rect', {});
      const cp = [[-42, -198], [42, -198], [34, -220], [0, -232], [-34, -220]];
      face(S, cp, cap, { a: .88, tex: false });
      pen(S, [[42, -198], [34, -220], [0, -232]], 1.6, .7);
      pen(S, [[56, -40], [34, -200]], 1.8, .7); line(S, -64, 0, 64, 0, 2.2, C.ink, .6);
      hub = [4, -212];
      const cloth = mixc(C.stone, C.paperLight, .45);
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * 2 * PI + .3, ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
        const p = (r, s) => [ux * r + vx * s, uy * r + vy * s];
        SL.push(washShape([p(34, 2), p(170, 2), p(170, 34), p(34, 34)], cloth, .5, 2, 1));
        SL.push(mk(qcurve(...p(-14, 0), ...p(176, 0), 0, 8), 6, wood, { prof: 'even', nb: 0, a: .92 }));
        SL.push(mk(qcurve(...p(34, 34), ...p(170, 34), 0, 6), 2, wood, { prof: 'even', nb: 0, a: .8 }));
        for (let r = 34; r <= 170; r += 17) SL.push(mk(qcurve(...p(r, 2), ...p(r, 34), 0, 3), 1.6, wood, { prof: 'even', nb: 0, a: .75 }));
        SL.push(mk(qcurve(...p(34, 18), ...p(170, 18), 0, 6), 1.1, wood, { prof: 'even', nb: 0, a: .6 }));
      }
    }
    SL.push(mk(qcurve(-3, 0, 3, 0, 0, 3), 12, C.ink, { prof: 'leaf', nb: 0, a: .85 }));
    if (!speed) { for (const s of SL) { s.pts = s.pts.map(([x, y]) => [x + hub[0], y + hub[1]]); if (s.poly) s.poly = s.poly.map(r => r.map(([x, y]) => [x + hub[0], y + hub[1]])); S.push(s); } return fin(S, sc, { top: [0, hub[1] - 180] }); }
    return fin(S, sc, { top: [0, hub[1] - 180], live: liveAt(sc, (c, lt) => { c.translate(hub[0], hub[1]); c.rotate(lt * speed); WC.drawList(c, SL, 1); }) });
  };

  // tent — o: {style: 'military' (default: a bell tent with a scalloped valance and a pennant, an Ottoman or medieval
  //   camp, ~180 px) | 'yurt' (round felt yurt, domed roof, painted door; o.smoke: true) | 'bedouin' (long, low black
  //   goat-hair tent, open front, a rug inside), col: canvas token, stripes: true (military), flag: token | false}
  G.tent = (sc, o = {}) => {
    const S = [], style = o.style || 'military';
    if (style === 'yurt') {
      const felt = T(o.col, mixc(C.stone, C.paperLight, .45)), fd = mixc(felt, C.stoneDark, .45);
      contact(S, -104, 104);
      face(S, box(-100, -62, 100, 0), felt, { a: .78, dir: 'v', gap: 14 });
      wash(S, box(40, -62, 100, 0), fd, .35, { n: 2 });
      const rf = arcPts(0, -60, 106, 58, 14);
      face(S, rf.concat([[106, -58], [-106, -58]]), mixc(felt, C.stoneDark, .15), { a: .8, gap: 9 });
      for (const x of [-80, -46, -14, 18, 50, 82]) line(S, x * .12, -114, x, -60, 1.3, mixc(C.wood, C.ink, .3), .5);
      wash(S, box(-104, -62, 104, -52), T(o.band, mixc(C.cloth, C.paper, .1)), .8, { n: 2 });
      for (const y of [-20, -38]) line(S, -100, y, 100, y, 1.6, mixc(C.wood, C.ink, .3), .6);
      wash(S, box(-18, -50, 18, 0), mixc(C.red, C.fire, .3), .85, { n: 1, jit: .6 });
      pen(S, [[-18, 0], [-18, -50], [18, -50], [18, 0]], 2, .75, mixc(C.gold, C.wood, .4));
      wash(S, arcPts(0, -114, 16, 5, 8, 0, 2 * PI), DARK(), .6, { n: 0, jit: .5 });
      curve(S, rf.slice(6), 1.8, .65); pen(S, [[100, -58], [100, 0]], 1.6, .6); line(S, -102, 0, 102, 0, 2, C.ink, .6);
      return fin(S, sc, { top: [0, -120], live: o.smoke && liveAt(sc, (c, lt) => WC.smoke(c, 0, -120, 160, lt, 2, .35, .8)) });
    }
    if (style === 'bedouin') {
      const hair = T(o.col, mixc(C.ink, C.wood, .5)), lt2 = mixc(C.wood, C.paper, .45), poles = [-140, -48, 48, 140], ph = [-92, -102, -102, -92];
      contact(S, -180, 180, .15);
      wash(S, box(-140, -64, 140, 0), mixc(C.ink, C.night, .35), .55, { n: 2 });
      wash(S, [[-110, 0], [110, 0], [96, -14], [-96, -14]], C.cloth, .8, { n: 2 });
      for (let x = -96; x < 96; x += 16) line(S, x, -7, x + 8, -7, 2, C.gold, .6);
      for (const [x, cc] of [[-70, C.clothB], [10, C.clothC], [70, C.cloth]]) S.push(mk(qcurve(x - 16, -16, x + 16, -16, 3, 5), 12, cc, { prof: 'leaf', nb: 0, a: .85 }));
      poles.forEach((x, i) => line(S, x, 0, x, ph[i], 3, mixc(C.wood, C.ink, .3), .85, { bend: 0 }));
      const roof = [[-170, -40]]; poles.forEach((x, i) => { roof.push([x, ph[i]]); if (i < 3) roof.push([(x + poles[i + 1]) / 2, ph[i] + 20]); }); roof.push([170, -40]);
      const panel = roof.concat([[170, -32], [140, -60], [-140, -60], [-170, -32]]);
      face(S, panel, hair, { a: .85, gap: 8 });
      rows(S, panel, lt2, { gap: 9, w: 2.5, a: .35, nb: 0 });
      for (const s of [-1, 1]) { wash(S, [[s * 140, -60], [s * 170, -36], [s * 176, 0], [s * 140, 0]], mixc(hair, C.paper, .15), .8, { n: 1 }); line(S, s * 170, -40, s * 222, 2, 1.2, C.ink, .5); line(S, s * 140, ph[0], s * 210, 2, 1.2, C.ink, .45); }
      curve(S, roof, 1.8, .7, C.ink, 3);
      return fin(S, sc, { top: [0, -104] });
    }
    const canvas = T(o.col, mixc(C.stone, C.paperLight, .5)), red = mixc(C.red, C.cloth, .3), cd = mixc(canvas, C.stoneDark, .45);
    contact(S, -96, 96, .2);
    for (const s of [-1, 1]) { line(S, s * 86, -62, s * 134, 3, 1.2, C.ink, .5); line(S, s * 134, 3, s * 134, -6, 2.2, mixc(C.wood, C.ink, .3), .8); }
    face(S, box(-80, -60, 80, 0), canvas, { a: .75, dir: 'v', gap: 12 });
    wash(S, box(28, -60, 80, 0), cd, .35, { n: 2 });
    wash(S, [[-24, 0], [24, 0], [0, -58]], mixc(C.ink, C.night, .3), .7, { n: 1, jit: .8 });
    pen(S, [[-26, 0], [0, -60], [26, 0]], 1.6, .7);
    const L = qctrl(-4, -170, -24, -98, -88, -66, 10), R = L.map(([x, y]) => [-x, y]).reverse();
    const roof = L.concat(R);
    face(S, roof, canvas, { a: .8, dir: 'v', gap: 10 });
    if (o.stripes ?? true) for (let i = 0; i < 7; i++) { const f = (i + .5) / 7, x = -88 + 176 * f; S.push(mk(qcurve(x, -66, x * .04, -168, x * .12, 8), 12, red, { prof: 'tip', nb: 2, a: .32 })); }
    wash(S, R.concat([[24, -66]]), cd, .35, { n: 0, jit: .8 });
    wash(S, box(-90, -70, 90, -56), red, .85, { n: 2 });
    for (let x = -82; x <= 82; x += 18) S.push(washShape(arcPts(x, -56, 9, 8, 6, 0, PI), red, .8, 1, .4));
    curve(S, R, 1.8, .7, C.ink, 4); curve(S, L, 1.1, .35, C.ink, 4);
    pen(S, [[80, -56], [80, 0]], 1.6, .6); line(S, -82, 0, 82, 0, 2, C.ink, .6);
    pole(S, 0, -168, 34);
    finial(S, 0, -200, 10, 'ball');
    const fl = o.flag === false ? null : T(o.flag, C.red);
    return fin(S, sc, { top: [0, -204], live: fl && liveAt(sc, (c, lt) => flag(c, 0, -202, 40, lt, fl, 1.3, { taper: .8 })) });
  };

  // hut — o: {style: 'thatch' (default: round mud-walled hut with a conical thatched roof, ~170 px) | 'log' (a gabled
  //   log cabin with a stone chimney) | 'reed' (a marsh reed house: bundled reed arches, lattice front), col}
  G.hut = (sc, o = {}) => {
    const S = [], style = o.style || 'thatch';
    if (style === 'log') {
      const wd = T(o.col, mixc(C.wood, C.paper, .3)), log = mixc(C.wood, C.ink, .25), wh = 86;
      const g = gable(S, { gw: 108, wh, rise: 66, D: [116, -10], wall: wd, roof: mixc(C.wood, C.ink, .45),
        tex: rp => rows(S, rp, mixc(C.wood, C.ink, .2), { gap: 7, w: 5, a: .4, broken: .2, nb: 3 }) });
      const { X0, X1, D } = g, k = D[1] / D[0];
      rows(S, [[X0, 0], [X1, 0], [X1, -wh], [X0, -wh]], log, { gap: 11, w: 9, a: .45, nb: 4, inset: 0 });
      rows(S, [[X1, 0], [X1 + D[0], D[1]], [X1 + D[0], -wh + D[1]], [X1, -wh]], log, { gap: 11, w: 9, a: .5, nb: 4, inset: 0, bend: 0 });
      for (let y = -6; y > -wh; y -= 11) S.push(washShape(arcPts(X1 + 2, y, 5, 5, 8, 0, 2 * PI).slice(0, 8), mixc(C.wood, C.paperLight, .35), .9, 1, .4));
      win(S, (X0 + X1) / 2 + 6, 0, 24, 50, 'rect', { sill: false, col: mixc(C.wood, C.ink, .45), a: .85 });
      win(S, X1 + D[0] * .5, -30 + D[1] * .5, 20, 22, 'rect', { k, grid: [1, 1] });
      const cx = X1 + D[0] - 16, cs = mixc(C.stone, C.stoneDark, .2);
      face(S, box(cx - 12, -wh - 40 + D[1], cx + 12, D[1] + 2), cs, { a: .88, tex: false });
      rows(S, box(cx - 12, -wh - 40 + D[1], cx + 12, D[1]), mixc(cs, C.ink, .3), { gap: 8, w: 2, a: .4, broken: .3, nb: 0 });
      gableInk(S, g, wh);
      return fin(S, sc, { top: [cx, -wh - 40 + D[1]] });
    }
    if (style === 'reed') {
      const reed = T(o.col, mixc(C.clothC, C.ground, .4)), rd = mixc(reed, C.wood, .5);
      contact(S, -100, 100);
      const ar = arcPts(0, 0, 96, 150, 16);
      face(S, ar, reed, { a: .8, dir: 'v', gap: 8 });
      wash(S, ar.slice(8).concat([[30, 0]]), mixc(reed, C.ink, .25), .35, { n: 0, jit: 1 });
      for (const f of [.62, .82]) curve(S, arcPts(0, 0, 96 * f, 150 * f, 12), 2.5, .55, rd, 3);
      for (let x = -70; x <= 70; x += 14) line(S, x, -2, x, -Math.sqrt(Math.max(0, 1 - (x / 96) ** 2)) * 150 * .6, 1.2, rd, .5, { bend: 0 });
      for (let y = -20; y > -90; y -= 14) line(S, -Math.sqrt(1 - (y / 92) ** 2) * 50, y, Math.sqrt(1 - (y / 92) ** 2) * 50, y, 1.2, rd, .45, { bend: 0 });
      for (const s of [-1, 1]) { line(S, s * 96, 4, s * 92, -168, 12, rd, .85, { prof: 'tip', bend: 0 }); S.push(mk(qcurve(s * 92, -168, s * 92, -184, 0, 3), 10, rd, { prof: 'leaf', nb: 2, a: .85 })); }
      win(S, 0, 0, 30, 60, 'round', { sill: false, a: .8 });
      curve(S, ar, 2, .65, C.ink, 4);
      return fin(S, sc, { top: [0, -184] });
    }
    const mud = T(o.col, mixc(C.ground, C.stoneDark, .3)), th = mixc(C.clothC, C.wood, .3);
    contact(S, -70, 70);
    face(S, box(-62, -66, 62, 0), mud, { a: .78, dir: 'v', ga: .25 });
    wash(S, box(20, -66, 62, 0), mixc(mud, C.stoneDark, .5), .4, { n: 2 });
    win(S, -8, 0, 26, 48, 'round', { sill: false, a: .82 });
    const rf = [[-88, -56], [88, -56], [0, -158]];
    face(S, rf, th, { a: .85, dir: 'v', gap: 6 });
    wash(S, [[6, -56], [88, -56], [0, -158]], mixc(th, C.ink, .3), .4, { n: 2 });
    for (let x = -86; x < 86; x += 4) S.push(mk(WC.polar(x, -60, PI / 2 + rnd(-.2, .2), rnd(6, 14), 1, 3), 2, mixc(th, C.ink, rnd(.1, .4)), { prof: 'tip', nb: 0, a: .75 }));
    S.push(mk(qcurve(0, -150, 0, -170, 0, 3), 10, mixc(th, C.ink, .3), { prof: 'tip', nb: 2, a: .85 }));
    line(S, 88, -56, 0, -158, 1.8, C.ink, .65); pen(S, [[62, -54], [62, 0]], 1.6, .6); line(S, -64, 0, 64, 0, 2, C.ink, .6);
    return fin(S, sc, { top: [0, -170] });
  };

  // ================================================================ palaces and industry
  // palace — o: {style: 'ottoman' (default: Topkapı-like: broad-eaved pavilions, the Tower of Justice with its pointed
  //   lead spire, the Divan with domes and a portico, the kitchens' row of domes and chimneys, ~660 × 470 px) |
  //   'european' (a baroque façade: wings, end pavilions, a pedimented centre with a dome, mansard roofs, rows of
  //   tall windows, ~660 × 330 px), w: width factor, col: wall token, lit: true}
  const PALACE = {};
  G.palace = (sc, o = {}) => { const [S, x] = (PALACE[o.style] || PALACE.ottoman)(o); return fin(S, sc, x); };
  PALACE.ottoman = o => {
    const S = [], w = o.w ?? 1, lit = o.lit, wall = T(o.col, mixc(C.stone, C.paperLight, .4)), lead = LEAD(), sh = mixc(wall, C.stoneDark, .45), wood = mixc(C.wood, C.ink, .2);
    contact(S, -330 * w, 330 * w);
    // a pavilion with a broad-eaved lead roof (returns the roof top y)
    const pav = (x0, x1, h, y0 = 0, rh = 26) => {
      face(S, box(x0, y0 - h, x1, y0), wall, { a: .76 });
      wash(S, sideF(x1, y0 - h, y0, [16, -6]), sh, .8, { n: 2 });
      const ev = 22, ry = y0 - h + 4, k = (x1 - x0) * .22;
      wash(S, box(x0, ry, x1, ry + 14), mixc(C.stoneDark, C.ink, .3), .45, { n: 2 });
      line(S, x0 - ev + 4, ry + 3, x1 + ev - 4, ry + 3, 3, wood, .6);
      const rf = [[x0 - ev, ry], [x1 + ev, ry], [x1 - k, ry - rh], [x0 + k, ry - rh]];
      face(S, rf, lead, { a: .82, gap: 7 });
      wash(S, [[x1 + ev, ry], [x1 + ev + 14, ry - 6], [x1 - k + 8, ry - rh - 3], [x1 - k, ry - rh]], mixc(lead, C.ink, .3), .8, { n: 1 });
      pen(S, [[x0 - ev, ry], [x1 + ev, ry], [x1 + ev + 14, ry - 6]], 2, .75);
      pen(S, [[x0 + k, ry - rh], [x1 - k, ry - rh]], 1.5, .6);
      pen(S, [[x1, ry + 12], [x1, y0]], 1.8, .7);
      return ry - rh;
    };
    // 1 the Tower of Justice, behind
    const tx = -40 * w;
    face(S, box(tx - 28, -300, tx + 28, -60), wall, { a: .78, dir: 'v' });
    wash(S, sideF(tx + 28, -300, -60, [12, -5]), sh, .8, { n: 1 });
    for (const y of [-200, -250]) win(S, tx - 4, y, 9, 18, 'round', { sill: false, a: .6, lit });
    face(S, box(tx - 36, -350, tx + 36, -298), wall, { a: .82, tex: false });
    wash(S, sideF(tx + 36, -350, -298, [12, -5]), sh, .8, { n: 1 });
    for (const x of [-20, 0, 20]) win(S, tx + x, -306, 12, 34, 'round', { sill: false, a: .7, lit });
    wash(S, [[tx - 50, -346], [tx + 50, -346], [tx + 36, -362], [tx - 36, -362]], lead, .85, { n: 1 });
    pen(S, [[tx - 50, -346], [tx + 50, -346]], 2, .72); pen(S, [[tx + 28, -298], [tx + 28, -60]], 1.6, .6);
    cone(S, tx, -360, 36, 112, { alem: 'crescent' });
    // 2 the kitchens on the right: a long block, a row of domes with tall chimneys
    face(S, box(80 * w, -92, 322 * w, 0), wall, { a: .76 });
    wash(S, sideF(322 * w, -92, 0, [16, -6]), sh, .8, { n: 2 });
    for (let i = 0; i < 6; i++) {
      const x = 102 * w + i * 42 * w;
      face(S, box(x - 6, -150, x + 6, -100), wall, { a: .88, tex: false });
      line(S, x - 8, -150, x + 8, -150, 3, mixc(C.ink, wall, .3), .7);
      dome(S, x, -92, 19, 17, { fin: 0, alem: false, ribs: false });
      win(S, x, -24, 10, 30, 'round', { sill: false, a: .6, lit });
    }
    pen(S, [[322 * w, -92], [322 * w, 0]], 1.8, .7); line(S, 78 * w, -92, 324 * w, -92, 2, mixc(C.ink, wall, .3), .6);
    // 3 the kiosk on its terrace, left
    const tw0 = -330 * w, tw1 = -200 * w;
    wallseg(S, tw0, tw1, 44, { crenel: false, slits: 0, col: mixc(C.stone, C.paper, .15) });
    const kt = pav(-312 * w, -218 * w, 70, -44, 22);
    dome(S, -265 * w, kt + 2, 26, 22, { fin: 14 });
    for (const x of [-290, -265, -240]) win(S, x * w, -52, 12, 30, 'rect', { grid: [1, 1], gridCol: C.ink, lit });
    // 4 the Divan with its portico and domes
    const dx0 = -180 * w, dx1 = 40 * w, dt = pav(dx0, dx1, 112, 0, 30);
    for (const x of [-130, -70]) dome(S, x * w, dt + 4, 24, 22, { fin: 14 });
    const nc = Math.round(8 * w);
    for (let i = 0; i < nc; i++) {
      const a = dx0 + 6 + (dx1 - dx0 - 12) * i / nc, b = a + (dx1 - dx0 - 12) / nc;
      wash(S, opening((a + b) / 2, -2, (b - a) - 7, 84, 'pointed'), mixc(C.stoneDark, C.ink, .35), .5, { n: 0, jit: .6 });
      win(S, (a + b) / 2, -14, (b - a) * .4, 40, 'rect', { grid: [1, 2], gridCol: mixc(C.gold, C.stoneDark, .3), lit, sill: false, ink: false });
    }
    for (let i = 0; i <= nc; i++) { const x = dx0 + 6 + (dx1 - dx0 - 12) * i / nc; line(S, x + 2, -2, x + 2, -92, 1.4, C.ink, .4, { bend: 0 }); }
    line(S, dx0 - 2, 0, 324 * w, 0, 2.2, C.ink, .6);
    return [S, { top: [tx, -490] }];
  };
  PALACE.european = o => {
    const S = [], w = o.w ?? 1, lit = o.lit;
    const wall = T(o.col, pick([mixc(C.gold, C.paper, .55), mixc(C.clothC, C.paper, .45), mixc(C.stone, C.paperLight, .3)]));
    const sh = mixc(wall, C.stoneDark, .45), roof = mixc(C.stoneDark, C.night, .3), cop = mixc(C.green, C.far, .35), stone = mixc(C.stone, C.paperLight, .3);
    const X = 320 * w, D = [18, -7];
    contact(S, -X, X + D[0]);
    // the dome behind the centre
    drum(S, 0, -250, 56, 34, { col: wall, windows: 6, lit });
    dome(S, 0, -284, 60, 58, { col: cop, alem: 'ball', fin: 34 });
    // mansard roofs over the wings
    for (const s of [-1, 1]) { const a = s < 0 ? -X + 70 : 95, b = s < 0 ? -95 : X - 70; face(S, [[a, -168], [b, -168], [b - 12, -196], [a + 12, -196]], roof, { a: .85, gap: 7, tex: true }); for (let x = a + 24; x < b - 12; x += 36) win(S, x, -172, 10, 16, 'round', { sill: false, a: .6, lit }); }
    // wings, end pavilions, centre
    const block = (x0, x1, h) => { face(S, box(x0, -h, x1, 0), wall, { a: .74 }); line(S, x0 - 4, -h, x1 + 4, -h, 3, stone, .9); line(S, x0, -62, x1, -62, 3, stone, .8); };
    block(-X + 70, -95, 168); block(95, X - 70, 168);
    for (const s of [-1, 1]) {
      const a = s < 0 ? -X : X - 70, b = a + 70;
      block(a, b, 186);
      wash(S, [[a - 4, -186], [b + 4, -186], [(a + b) / 2, -212]], wall, .88, { n: 1 });
      pen(S, [[a - 4, -186], [(a + b) / 2, -212], [b + 4, -186]], 1.6, .65);
    }
    wash(S, sideF(X, -186, 0, D), sh, .8, { n: 2 });
    block(-95, 95, 222);
    wash(S, [[-100, -222], [100, -222], [0, -262]], wall, .9, { n: 2 });
    wash(S, [[-70, -226], [70, -226], [0, -254]], sh, .3, { n: 1 });
    pen(S, [[-102, -222], [0, -263], [102, -222]], 2, .72);
    for (const x of [-95, -32, 32, 95]) line(S, x, -218, x, -6, 3, sh, .35, { bend: 0 });
    // windows: arched ground floor, tall pedimented piano nobile, small attic
    const bays = [];
    for (const [a, b, n] of [[-X, -X + 70, 2], [-X + 70, -95, 5], [-95, 95, 3], [95, X - 70, 5], [X - 70, X, 2]]) for (let i = 0; i < n; i++) bays.push([a + (b - a) * (i + .5) / n, Math.abs(a + b) < 1]);
    for (const [x, centre] of bays) {
      if (centre && Math.abs(x) < 5) { win(S, x, 0, 26, 50, 'round', { sill: false, col: mixc(C.wood, C.ink, .3), a: .85 }); }
      else win(S, x, -10, 17, 40, 'round', { lit });
      win(S, x, -76, 18, 52, 'rect', { grid: [1, 0], gridCol: stone, lit });
      pen(S, [[x - 13, -132], [x, -140], [x + 13, -132]], 1.4, .6);
      win(S, x, centre ? -156 : -146, 15, 18, 'rect', { lit });
    }
    // balustrade with urns
    for (const [a, b, h] of [[-X + 70, -95, 168], [95, X - 70, 168]]) for (let x = a + 6; x < b; x += 30) { S.push(mk(qcurve(x, -h - 2, x, -h - 13, 0, 3), 7, stone, { prof: 'leaf', nb: 0, a: .9 })); line(S, x + 3, -h - 13, x + 3, -h - 2, 1, C.ink, .4, { bend: 0 }); }
    for (let x = -60; x <= 60; x += 30) win(S, x, -2, 12, 8, 'rect', { sill: false, ink: false, col: stone, a: .4 });
    pen(S, [[X, -186], [X, 0], [X + D[0], D[1]]], 1.9, .7); line(S, -X - 2, 0, X + 2, 0, 2.2, C.ink, .6);
    return [S, { top: [0, -380] }];
  };

  // factory — a 19th-century works, about 470 × 440 px: a brick hall with a saw-tooth roof and tall arched windows,
  //   an engine house with a pediment, a tall chimney whose smoke drifts (live). o: {w: width factor, smoke: true,
  //   lit: true (lit windows), col: brick token}
  G.factory = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, lit = o.lit, brick = T(o.col, mixc(C.roof, C.cloth, .35)), dk = mixc(brick, C.ink, .35);
    const stone = mixc(C.stone, C.paper, .2), slate = mixc(C.stoneDark, C.night, .3);
    const hx0 = -230 * w, hx1 = 30 * w, hH = 118, nt = Math.max(2, Math.round(4 * w)), cx = 175 * w;
    contact(S, hx0, cx + 30);
    // a small stack on the hall (behind)
    face(S, box(hx0 + 50, -hH - 74, hx0 + 64, -hH), brick, { a: .88, tex: false });
    line(S, hx0 + 48, -hH - 74, hx0 + 66, -hH - 74, 3, dk, .7);
    // the saw-tooth hall
    for (let i = 0; i < nt; i++) {
      const a = hx0 + (hx1 - hx0) * i / nt, b = a + (hx1 - hx0) / nt;
      face(S, [[a, -hH], [b, -hH - 40], [b, -hH]], slate, { a: .85, gap: 6 });
      wash(S, [[b - 7, -hH - 37], [b, -hH - 40], [b, -hH], [b - 7, -hH]], lit ? mixc(C.gold, C.fire, .2) : DARK(), .7, { n: 1, jit: .5 });
      line(S, a, -hH, b, -hH - 40, 1.8, C.ink, .7);
    }
    face(S, box(hx0, -hH, hx1, 0), brick, { a: .76 });
    rows(S, box(hx0, -hH + 4, hx1, -4), dk, { gap: 6, w: 1.6, a: .2, broken: .5, nb: 0 });
    line(S, hx0, -hH + 2, hx1, -hH + 2, 4, stone, .8); line(S, hx0, -16, hx1, -16, 3, stone, .7);
    const nw = Math.round(6 * w);
    for (let i = 0; i < nw; i++) win(S, hx0 + (hx1 - hx0) * (i + .5) / nw, -22, 22, 70, 'round', { grid: [1, 3], gridCol: mixc(C.ink, C.stone, .3), lit });
    // the engine house with a pediment
    face(S, box(hx1, -176, 140 * w, 0), brick, { a: .78 });
    wash(S, sideF(140 * w, -176, 0, [16, -6]), mixc(brick, C.ink, .3), .8, { n: 2 });
    const pc = (hx1 + 140 * w) / 2;
    wash(S, [[hx1 - 6, -176], [140 * w + 6, -176], [pc, -212]], brick, .88, { n: 2 });
    pen(S, [[hx1 - 6, -176], [pc, -213], [140 * w + 6, -176]], 1.9, .72);
    ocul(S, pc, -192, 9, { spokes: true, lit });
    for (const x of [pc - 26, pc + 26]) win(S, x, -26, 26, 110, 'round', { grid: [1, 4], gridCol: mixc(C.ink, C.stone, .3), lit });
    win(S, pc, 0, 22, 46, 'round', { sill: false, col: mixc(C.wood, C.ink, .4), a: .85 });
    pen(S, [[140 * w, -176], [140 * w, 0]], 1.8, .7);
    // the chimney
    face(S, box(cx - 26, -38, cx + 26, 0), stone, { a: .85, tex: false });
    const ch = [[cx - 18, -38], [cx + 18, -38], [cx + 11, -410], [cx - 11, -410]];
    face(S, ch, brick, { a: .8, dir: 'v', gap: 6 });
    wash(S, [[cx + 3, -38], [cx + 18, -38], [cx + 11, -410], [cx + 2, -410]], dk, .4, { n: 2 });
    for (let y = -100; y > -400; y -= 70) line(S, cx - 18 + 7 * (-y / 410), y, cx + 18 - 7 * (-y / 410), y, 1.4, C.ink, .55);
    wash(S, box(cx - 15, -424, cx + 15, -408), dk, .9, { n: 1 });
    pen(S, [[cx + 18, -38], [cx + 11, -410]], 1.8, .7); pen(S, [[cx - 15, -424], [cx + 15, -424]], 2, .7);
    line(S, hx0 - 2, 0, cx + 28, 0, 2.2, C.ink, .6);
    const sm = o.smoke !== false;
    return fin(S, sc, { top: [cx, -424], live: sm && liveAt(sc, (c, lt) => { WC.smoke(c, cx, -424, 320, lt, 1, .5, 1.3); WC.smoke(c, hx0 + 57, -hH - 76, 150, lt, 4, .32, 1.1); }) });
  };

  // ================================================================ a whole city
  // skyline — a whole city as one far-away row, for the far / mid layers (a little haze-coloured, few details).
  //   o: {style: 'ottoman' (default: hills crowned with domed mosques and pencil minarets, a Galata-like tower,
  //   cypresses) | 'medieval' (gables, a cathedral spire, towers, a castle on a hill, a wall) | 'ancient' (an
  //   acropolis with a temple, flat roofs, an obelisk, umbrella pines) | 'modern' (19th–20th c.: blocks, factory
  //   chimneys with smoke, a domed hall, a clock tower), w: total width px at sc 1 (900), col: tone token (default a
  //   blue-grey haze), lit: true (lamp-lit windows at dusk / night), smoke: true (modern)}
  G.skyline = (sc, o = {}) => {
    const S = [], W = o.w ?? 900, style = o.style || 'ottoman', x0 = -W / 2, x1 = W / 2, lit = o.lit;
    const base = T(o.col, mixc(mixc(C.far, C.stoneDark, .3), C.night, .08));
    const back = mixc(base, C.paper, .42), mid = mixc(base, C.paper, .22), front = base, dark = mixc(base, C.ink, .25);
    const ph = rnd(0, 6), smokes = [];
    const acro = W * .12;
    const env = x => WC.ss(Math.min((x - x0) / (W * .14), (x1 - x) / (W * .14), 1));   // the city thins out at both ends
    const hill0 = x => style === 'ottoman' ? 34 + 24 * Math.sin(x / W * 8.5 + ph) + 12 * Math.sin(x / W * 21 + ph * 2) + 10
      : style === 'ancient' ? 8 + 96 * Math.exp(-Math.pow((x - acro) / (W * .15), 2))
      : style === 'medieval' ? 12 + 60 * Math.exp(-Math.pow((x + W * .3) / (W * .13), 2)) + 10 * Math.sin(x / W * 7 + ph) + 10 : 6;
    const hill = x => hill0(x) * (.15 + .85 * env(x));
    // the land under the city
    const land = []; for (let x = x0; x <= x1 + .1; x += W / 60) land.push([x, -hill(x)]);
    land.push([x1, 4], [x0, 4]);
    wash(S, land, mixc(base, C.paper, .3), .4, { n: 0, jit: 1.5 });
    const feather = (y0, y1, a) => { const P = []; for (let x = x0; x <= x1 + .1; x += W / 30) P.push([x, y0]); for (let x = x1; x >= x0 - .1; x -= W / 30) P.push([x, y1 + rnd(-4, 4)]); wash(S, P, mixc(base, C.paper, .3), a, { n: 0, jit: 2, mis: 0 }); };
    feather(4, 12, .26); feather(4, 22, .16); feather(4, 34, .08);
    // a row of roofs (one wash): kind 'gable' | 'hip' | 'flat'
    const roofs = (hmin, hmax, bmin, bmax, kind, lift = 0) => {
      const pts = [];
      for (let x = x0; x < x1;) {
        const bw = Math.min(rnd(bmin, bmax), x1 - x), h = rnd(hmin, hmax) * (.2 + .8 * env(x + bw / 2)), gy = -hill(x + bw / 2) + lift * env(x + bw / 2);
        if (kind === 'gable') pts.push([x, gy - h * .66], [x + bw / 2, gy - h], [x + bw, gy - h * .66]);
        else if (kind === 'hip') pts.push([x, gy - h * .8], [x + bw * .22, gy - h], [x + bw * .78, gy - h], [x + bw, gy - h * .8]);
        else pts.push([x, gy - h], [x + bw, gy - h]);
        x += bw;
      }
      const nTop = pts.length;
      for (let x = x1; x >= x0 - .1; x -= W / 24) pts.push([x, 8 + rnd(-4, 5)]);
      pts.nTop = nTop;
      return pts;
    };
    const kind = style === 'medieval' ? 'gable' : style === 'ottoman' ? 'hip' : 'flat';
    wash(S, roofs(style === 'modern' ? 40 : 26, style === 'modern' ? 120 : 52, 22, 46, kind, -14), back, .6, { n: 0, jit: 1.2 });
    // landmarks
    const mosque = (cx, s) => {
      // the classical silhouette: lower wings with little domes, half domes, a drum, a broad flattish dome
      const gy = -hill(cx) - 10, P = [[cx - 96 * s, gy], [cx - 96 * s, gy - 16 * s]];
      for (const ox of [-86, -74]) for (let i = 0; i <= 4; i++) { const a = PI + i / 4 * PI; P.push([cx + ox * s + Math.cos(a) * 6 * s, gy - 16 * s + Math.sin(a) * 6 * s]); }
      P.push([cx - 64 * s, gy - 16 * s], [cx - 64 * s, gy - 30 * s]);
      for (let i = 0; i <= 6; i++) { const a = PI + i / 6 * PI / 2; P.push([cx - 34 * s + Math.cos(a) * 30 * s, gy - 30 * s + Math.sin(a) * 22 * s]); }
      P.push([cx - 34 * s, gy - 58 * s]);
      for (let i = 0; i <= 10; i++) { const a = PI + i / 10 * PI; P.push([cx + Math.cos(a) * 34 * s, gy - 58 * s + Math.sin(a) * 27 * s]); }
      P.push([cx + 34 * s, gy - 52 * s]);
      for (let i = 0; i <= 6; i++) { const a = 1.5 * PI + i / 6 * PI / 2; P.push([cx + 34 * s + Math.cos(a) * 30 * s, gy - 30 * s + Math.sin(a) * 22 * s]); }
      P.push([cx + 64 * s, gy - 16 * s]);
      for (const ox of [74, 86]) for (let i = 0; i <= 4; i++) { const a = PI + i / 4 * PI; P.push([cx + ox * s + Math.cos(a) * 6 * s, gy - 16 * s + Math.sin(a) * 6 * s]); }
      P.push([cx + 96 * s, gy - 16 * s], [cx + 96 * s, gy]);
      wash(S, P, mid, .85, { n: 0, jit: .8, mis: .6 });
      const cr = []; for (let i = 5; i <= 10; i++) { const a = PI + i / 10 * PI; cr.push([cx + Math.cos(a) * 34 * s, gy - 58 * s + Math.sin(a) * 27 * s]); }
      wash(S, cr.concat([[cx + 16 * s, gy - 58 * s], [cx + 4 * s, gy - 82 * s]]), dark, .22, { n: 0, jit: .5, mis: 0 });
      wash(S, [[cx + 40 * s, gy - 50 * s], [cx + 64 * s, gy - 30 * s], [cx + 64 * s, gy], [cx + 50 * s, gy]], dark, .14, { n: 0, jit: .5, mis: 0 });
      line(S, cx - 38 * s, gy - 57 * s, cx + 38 * s, gy - 57 * s, Math.max(.8, 1.4 * s), dark, .45);
      line(S, cx, gy - 85 * s, cx, gy - 98 * s, Math.max(.8, 1.6 * s), dark, .7, { bend: 0 });
      for (const [mx, mh] of [[-70, 150], [70, 150], [-100, 120], [100, 120]].slice(0, s > .8 ? 4 : 2)) {
        const x = cx + mx * s, y = gy;
        line(S, x, y, x, y - mh * s * .82, Math.max(1.4, 4 * s), mid, .9, { bend: 0 });
        line(S, x, y - mh * s * .8, x, y - mh * s, Math.max(1.2, 3.6 * s), mid, .9, { bend: 0, prof: 'tip' });
        for (const f of [.5, .7]) line(S, x - 3.4 * s, y - mh * s * f, x + 3.4 * s, y - mh * s * f, Math.max(.8, 1.6 * s), dark, .5, { bend: 0 });
      }
      for (let i = 0; i < 5; i++) win(S, cx - 44 * s + i * 22 * s, gy - 6 * s, 4 * s, 11 * s, 'round', { sill: false, ink: false, a: .4, lit, col: lit ? null : dark });
    };
    const cypress = (cx, h) => { const gy = -hill(cx) - 4; for (let i = 0; i < 3; i++) S.push(mk(qcurve(cx + rnd(-2, 2), gy, cx + rnd(-1.5, 1.5), gy - h * rnd(.85, 1), rnd(-1, 1), 6), h * .16, mixc(C.leafDark, base, .45), { prof: 'leaf', nb: 2, a: .8 })); };
    const spire = (cx, h, wdt, colour) => {
      const gy = -hill(cx) - 8;
      wash(S, box(cx - wdt / 2, gy - h * .55, cx + wdt / 2, gy), colour, .85, { n: 1, jit: .6 });
      wash(S, [[cx - wdt / 2 - 1, gy - h * .55], [cx + wdt / 2 + 1, gy - h * .55], [cx, gy - h]], colour, .9, { n: 1, jit: .5 });
      line(S, cx, gy - h, cx, gy - h - 8, 1, dark, .6, { bend: 0 });
    };
    if (style === 'ottoman') {
      const ms = [[-.33, .95], [.02, 1.15], [.3, .8]];
      for (const [f, s] of ms) mosque(W * f, s);
      const gx = W * .43, gy = -hill(gx) - 8;
      wash(S, box(gx - 11, gy - 86, gx + 11, gy), mid, .85, { n: 1, jit: .6 });
      wash(S, [[gx - 14, gy - 86], [gx + 14, gy - 86], [gx, gy - 118]], mid, .9, { n: 1, jit: .5 });
      line(S, gx - 13, gy - 70, gx + 13, gy - 70, 2, dark, .5);
      for (let i = 0; i < 9; i++) cypress(rnd(x0 + 20, x1 - 20), rnd(28, 50));
    } else if (style === 'medieval') {
      const cx = -W * .3, gy = -hill(cx) - 6;
      for (const [dx, h] of [[-46, 70], [0, 96], [40, 62]]) { wash(S, box(cx + dx - 14, gy - h, cx + dx + 14, gy), mid, .88, { n: 1, jit: .6 }); for (let k = -1; k <= 1; k += 2) wash(S, box(cx + dx + k * 8 - 3, gy - h - 7, cx + dx + k * 8 + 3, gy - h), mid, .9, { n: 0, jit: .3 }); }
      wash(S, box(cx - 60, gy - 44, cx + 54, gy), mid, .85, { n: 1 });
      const kx = W * .1, ky = -hill(kx) - 8;
      wash(S, box(kx - 50, ky - 60, kx + 70, ky), mid, .85, { n: 1 });
      wash(S, [[kx - 50, ky - 60], [kx + 70, ky - 60], [kx + 60, ky - 80], [kx - 40, ky - 80]], mid, .85, { n: 1 });
      spire(kx - 58, 190, 26, mid);
      spire(W * .32, 120, 16, mid); spire(-W * .05, 96, 14, mid);
      for (let i = 0; i < 5; i++) cypress(rnd(x0 + 20, x1 - 20), rnd(24, 40));
    } else if (style === 'ancient') {
      const gy = -hill(acro) - 6, tw = 150;
      wash(S, box(acro - tw / 2, gy - 8, acro + tw / 2, gy), mid, .9, { n: 1 });
      for (let i = 0; i < 8; i++) line(S, acro - tw / 2 + 8 + i * (tw - 16) / 7, gy - 8, acro - tw / 2 + 8 + i * (tw - 16) / 7, gy - 52, 5, mid, .9, { bend: 0 });
      wash(S, box(acro - tw / 2, gy - 64, acro + tw / 2, gy - 52), mid, .9, { n: 1 });
      wash(S, [[acro - tw / 2 - 2, gy - 64], [acro + tw / 2 + 2, gy - 64], [acro, gy - 82]], mid, .9, { n: 1 });
      const ox = -W * .28, oy = -hill(ox) - 6;
      wash(S, [[ox - 7, oy], [ox + 7, oy], [ox + 4, oy - 110], [ox, oy - 118], [ox - 4, oy - 110]], mid, .9, { n: 0, jit: .4 });
      const rx = W * .36, ry = -hill(rx) - 6;
      wash(S, box(rx - 60, ry - 56, rx + 60, ry), mid, .88, { n: 1 });
      for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) win(S, rx - 51 + i * 17, ry - 6 - r * 26, 8, 18, 'round', { sill: false, ink: false, a: .4, col: dark });
      for (let i = 0; i < 5; i++) { const px = rnd(x0 + 30, x1 - 30), py = -hill(px) - 6; line(S, px, py, px + rnd(-3, 3), py - 34, 2, dark, .6); WC.clump(S, px, py - 38, 16, 9, [mixc(C.leafDark, base, .4), mixc(C.leaf, base, .5)], { sx: 1.8, sy: .35, l0: 6, l1: 12, w0: 5, w1: 8 }); }
    } else {
      const hx = W * .05, hy = -hill(hx) - 6;
      wash(S, box(hx - 70, hy - 70, hx + 70, hy), mid, .85, { n: 1 });
      wash(S, box(hx - 30, hy - 96, hx + 30, hy - 70), mid, .88, { n: 1 });
      wash(S, arcPts(hx, hy - 96, 32, 30, 10).concat([[hx + 32, hy - 96]]), mid, .9, { n: 0, jit: .6 });
      const tx = -W * .25, ty = -hill(tx) - 6;
      wash(S, box(tx - 13, ty - 140, tx + 13, ty), mid, .9, { n: 1 });
      wash(S, [[tx - 16, ty - 140], [tx + 16, ty - 140], [tx, ty - 172]], mid, .9, { n: 1 });
      S.push(washShape(arcPts(tx, ty - 116, 7, 7, 10, 0, 2 * PI).slice(0, 10), mixc(C.paperLight, base, .2), .8, 1, .3));
      for (const f of [.28, .38, -.42]) { const cx = W * f, cy = -hill(cx) - 6; wash(S, [[cx - 9, cy], [cx + 9, cy], [cx + 6, cy - 150], [cx - 6, cy - 150]], mid, .9, { n: 0, jit: .5 }); smokes.push([cx, cy - 152]); }
    }
    // the front row (darker), windows
    const fr = roofs(style === 'modern' ? 22 : 14, style === 'modern' ? 70 : 34, 18, 40, kind, 0);
    wash(S, fr, front, .55, { n: 0, jit: 1 });
    rows(S, fr, front, { gap: 7, w: 9, a: .14, nb: 3, inset: 0 });
    for (let i = 0; i < W / 16; i++) { const x = rnd(x0 + 6, x1 - 6), y = -hill(x) + rnd(-26, -6); win(S, x, y, rnd(2, 3.2), rnd(3, 5), 'rect', { sill: false, ink: false, lit, col: lit ? null : dark, a: lit ? .85 : .5 }); }
    pen(S, fr.slice(0, fr.nTop), 1, .22, C.ink, false, .45);
    const doSmoke = style === 'modern' && o.smoke !== false && smokes.length;
    return fin(S, sc, { top: [0, -200], live: doSmoke && liveAt(sc, (c, lt) => smokes.forEach(([x, y], i) => WC.smoke(c, x, y, 120, lt, i + 5, .3, 1.2))) });
  };

  // ================================================================ interiors (for land "interior")
  // window — a window in the room's wall (sill 150 px above the floor), the stone reveal, glazing bars, and the light
  //   falling in onto the floor in front, with dust drifting in the beam (live). o: {style: 'arched' (default) | 'rect'
  //   | 'pointed' | 'ottoman' (a grilled rectangular window with a small arched light above), w: width factor,
  //   night: true (dark panes, a cool moonlight), light: false (no beam), side: 1 (light falls to the right) | -1}
  G.window = (sc, o = {}) => {
    const S = [], ww = 118 * (o.w ?? 1), style = o.style || 'arched', night = o.night, side = o.side ?? 1, yS = -150;
    const H = style === 'ottoman' ? 150 : 250, yT = yS - H, kind = { arched: 'round', rect: 'rect', pointed: 'pointed', ottoman: 'rect' }[style] || 'round';
    const reveal = mixc(C.stoneDark, C.stone, .45), frame = mixc(C.wood, C.ink, .25);
    const glass = night ? mixc(C.night, C.ink, .1) : mixc(C.sky, C.paperLight, .3);
    const lightC = night ? mixc(C.sky, C.paperLight, .5) : mixc(C.gold, C.paperLight, .5);
    // the deep reveal, the view through the panes
    face(S, opening(0, yS + 10, ww + 40, H + 34, kind), reveal, { a: .5, dir: 'v', ga: .3, ta: .1, vary: false });
    const gl = opening(0, yS, ww, H, kind);
    wash(S, gl, glass, night ? .8 : .55, { n: 0, jit: .8 });
    if (!night) wash(S, [[-ww / 2, yS], [ww / 2, yS], [ww / 2, yS - H * .22], [ww * .1, yS - H * .3], [-ww / 2, yS - H * .2]], C.far, .4, { n: 2 });
    else S.push(washShape(arcPts(-ww * .18, yT + H * .3, 10, 10, 10, 0, 2 * PI).slice(0, 10), C.paperLight, .8, 1, .4));
    // glazing bars and frame
    const nv = Math.max(1, Math.round(ww / 46)), nh = Math.max(2, Math.round(H / 46));
    for (let i = 1; i <= nv; i++) line(S, -ww / 2 + ww * i / (nv + 1), yS - 1, -ww / 2 + ww * i / (nv + 1), yT + (kind === 'rect' ? 2 : ww * .06), 3, frame, .8, { bend: 0 });
    const spring = kind === 'rect' ? yT : kind === 'pointed' ? yT + ww * .8 : yT + ww / 2;
    for (let i = 1; i <= nh; i++) { const y = yS - (yS - spring) * i / (nh + 1); line(S, -ww / 2 + 2, y, ww / 2 - 2, y, 2.4, frame, .75, { bend: 0 }); }
    curve(S, gl.slice(1).concat([gl[0]]), 4, .8, frame, 4);
    if (style === 'ottoman') {
      for (let x = -ww / 2 + 12; x < ww / 2; x += 12) line(S, x, yS - 2, x, yT + 2, 1.6, C.ink, .7, { bend: 0 });
      const up = opening(0, yT - 26, ww * .45, ww * .5, 'pointed');
      face(S, opening(0, yT - 20, ww * .45 + 22, ww * .5 + 14, 'pointed'), reveal, { a: .5, tex: false });
      wash(S, up, night ? glass : mixc(C.clothB, C.gold, .3), .55, { n: 0, jit: .6 });
      curve(S, up.slice(1), 2, .7, frame, 4);
    }
    // the sill
    face(S, box(-ww / 2 - 26, yS, ww / 2 + 26, yS + 14), mixc(C.stone, C.paperLight, .3), { a: .85, tex: false });
    wash(S, box(-ww / 2 - 22, yS + 14, ww / 2 + 22, yS + 24), mixc(C.stoneDark, C.ink, .25), .35, { n: 1 });
    pen(S, [[-ww / 2 - 26, yS], [ww / 2 + 26, yS], [ww / 2 + 26, yS + 14]], 1.8, .7);
    // light falling into the room and onto the floor
    let mote = null;
    if (o.light !== false) {
      const xn0 = side * 120 - ww * .55, xf0 = side * 250 - ww * .72, pn = [[xn0, 30], [xn0 + ww * 1.1, 30], [xf0 + ww * 1.44, 170], [xf0, 170]];
      const tl = [-ww / 2, yT + H * .1], tr = [ww / 2, yT + H * .1], bl = [-ww / 2, yS], br = [ww / 2, yS];
      const bm = side > 0 ? [tl, tr, pn[2], pn[3], bl] : [tl, tr, br, pn[2], pn[3]];
      const cen = P => { const c = P.reduce((a, q) => [a[0] + q[0] / P.length, a[1] + q[1] / P.length], [0, 0]); return k => P.map(([x, y]) => [x + (c[0] - x) * k, y + (c[1] - y) * k]); };
      const bmS = cen(bm), pnS = cen(pn);
      for (const k of [0, .14, .3]) wash(S, bmS(k), lightC, night ? .045 : .06, { n: 2, jit: 6, mis: 0 });
      for (const k of [0, .1]) wash(S, pnS(k), lightC, night ? .14 : .2, { n: 2, jit: 3, mis: 0 });
      for (let i = 1; i <= nv; i++) { const f = i / (nv + 1); line(S, pn[0][0] + (pn[1][0] - pn[0][0]) * f, 32, pn[3][0] + (pn[2][0] - pn[3][0]) * f, 168, 4, mixc(C.stoneDark, C.ink, .2), .2); }
      for (let i = 1; i <= 2; i++) { const f = i / 3, ya = 30 + 140 * f; line(S, pn[0][0] + (pn[3][0] - pn[0][0]) * f, ya, pn[1][0] + (pn[2][0] - pn[1][0]) * f, ya, 3, mixc(C.stoneDark, C.ink, .2), .18); }
      if (!night) mote = { a: [-ww / 2, (yT + yS) / 2], b: [ww / 2, (yT + yS) / 2], c: [(pn[0][0] + pn[3][0]) / 2, 100], d: [(pn[1][0] + pn[2][0]) / 2, 100] };
    }
    const dust = mixc(C.gold, C.paperLight, .25);
    return fin(S, sc, { top: [0, yT - (style === 'ottoman' ? 90 : 20)], live: mote && liveAt(sc, (c, lt) => {
      c.fillStyle = WC.rgba(dust, .55);
      for (let i = 0; i < 18; i++) {
        const u = (WC.hash(i * 3.7) + lt * .025 * (.5 + WC.hash(i + 9))) % 1, v = WC.hash(i * 1.3 + 2) + Math.sin(lt * .4 + i) * .04;
        const xa = mote.a[0] + (mote.b[0] - mote.a[0]) * v, ya = mote.a[1], xb = mote.c[0] + (mote.d[0] - mote.c[0]) * v, yb = mote.c[1];
        const x = xa + (xb - xa) * u + Math.sin(lt * .7 + i) * 6, y = ya + (yb - ya) * u, al = Math.sin(PI * u);
        c.globalAlpha = al; c.beginPath(); c.arc(x, y, 1.4 + WC.hash(i + 4) * 1.6, 0, 7); c.fill();
      }
      c.globalAlpha = 1;
    }) });
  };

  // door — a wooden door in a stone frame, about 250 px. o: {style: 'arched' (default) | 'rect' | 'pointed' (Ottoman
  //   / gothic), w: width factor, open: true (the right leaf open on bright light), col: wood token, studs: true}
  G.door = (sc, o = {}) => {
    const S = [], W = 104 * (o.w ?? 1), H = 214, kind = { arched: 'round', rect: 'rect', pointed: 'pointed' }[o.style || 'arched'] || 'round';
    const stone = mixc(C.stone, C.paper, .15), wood = T(o.col, mixc(C.wood, C.paper, .12)), wd = mixc(wood, C.ink, .4), iron = mixc(C.ink, C.stoneDark, .2);
    contact(S, -W / 2 - 30, W / 2 + 30, .16);
    const fr = opening(0, 0, W + 44, H + 26, kind);
    face(S, fr, stone, { a: .78, tex: false });
    rows(S, fr, mixc(C.stoneDark, C.stone, .4), { gap: 14, w: 2, a: .3, broken: .5, nb: 0 });
    if (kind !== 'rect') { const c = opening(0, 0, W + 4, H + 4, kind), cc = [0, -H + W / 2]; for (let k = 2; k < c.length - 1; k += 1) { const [x, y] = c[k], d = Math.hypot(x - cc[0], y - cc[1]) || 1; line(S, x, y, x + x / d * 20, y + (y - cc[1]) / d * 20, 1.4, mixc(C.stoneDark, C.ink, .2), .5, { bend: 0 }); } }
    else wash(S, box(-W / 2 - 22, -H - 26, W / 2 + 22, -H - 6), mixc(C.stone, C.stoneDark, .3), .7, { n: 1 });
    const lv = opening(0, 0, W, H, kind);
    if (o.open) {
      wash(S, lv, mixc(C.gold, C.paperLight, .55), .45, { n: 0, jit: 1 });
      const half = [[0, 0], [-W / 2, 0]].concat(lv.slice(2).filter(([x]) => x <= 1).reverse(), [[0, Math.min(...lv.map(p => p[1]))]]);
      face(S, half, wood, { a: .85, dir: 'v', gap: 10 });
      wash(S, [[W / 2, 0], [W / 2 + 26, 14], [W / 2 + 26, -H + 20], [W / 2, -H + (kind === 'rect' ? 0 : W * .4)]], wd, .75, { n: 1 });
      wash(S, [[0, 0], [W * .9, 60], [W * 1.2, 60], [W / 2, 0]], mixc(C.gold, C.paperLight, .5), .3, { n: 1, jit: 3 });
    } else {
      face(S, lv, wood, { a: .85, dir: 'v', gap: 10 });
      for (const f of [-.25, .25]) line(S, W * f, -2, W * f, -H + W * .25, 1.2, wd, .5, { bend: 0 });
      line(S, 0, -2, 0, -H + 4, 2.2, wd, .75, { bend: 0 });
    }
    const right = o.open ? 0 : W / 2;
    for (const y of [-40, -110, -170]) {
      if (-y > H - 8) continue;
      line(S, -W / 2 + 4, y, right - 4, y, 5, iron, .7);
      if (o.studs !== false) for (let x = -W / 2 + 10; x < right - 6; x += 14) S.push(mk(qcurve(x, y - 1, x, y + 1, 0, 3), 4, iron, { prof: 'leaf', nb: 0, a: .85 }));
    }
    for (const s of o.open ? [-1] : [-1, 1]) { const rx = s * 12, ry = -104; S.push(mk(arcPts(rx, ry + 8, 7, 9, 10, 0, 2 * PI), 2, iron, { prof: 'even', nb: 0, a: .8 })); }
    face(S, box(-W / 2 - 30, -8, W / 2 + 30, 2), mixc(C.stone, C.stoneDark, .2), { a: .85, tex: false });
    curve(S, fr.slice(1).concat([fr[0]]), 2, .65, C.ink, 4);
    curve(S, lv.slice(1), 1.6, .6, C.ink, 4);
    return fin(S, sc, { top: [0, -H - 26] });
  };

  // table — o: {style: 'western' (default: a rectangular table, turned legs, ~230 × 100 px) | 'low' (an Ottoman
  //   sofra: a round copper tray on a low stand) | 'desk' (a writing desk with drawers), cloth: true, col: wood token}
  G.table = (sc, o = {}) => {
    const S = [], style = o.style || 'western', wood = T(o.col, mixc(C.wood, C.paper, .2)), wl = mixc(wood, C.paperLight, .2), wd = mixc(wood, C.ink, .35);
    if (style === 'low') {
      const cu = mixc(C.fire, C.wood, .45);
      contact(S, -90, 90, .2);
      face(S, [[-44, 0], [44, 0], [36, -32], [-36, -32]], wood, { a: .85, tex: false });
      for (const x of [-22, 22]) wash(S, opening(x, 0, 18, 20, 'round'), wd, .55, { n: 0, jit: .5 });
      const tr = arcPts(0, -34, 92, 20, 18, 0, 2 * PI).slice(0, 18);
      wash(S, arcPts(0, -30, 94, 22, 18, 0, PI).concat([[-94, -30]]), mixc(cu, C.ink, .3), .85, { n: 0, jit: .5 });
      face(S, tr, cu, { a: .85, gap: 6 });
      wash(S, arcPts(0, -34, 70, 14, 16, 0, 2 * PI).slice(0, 16), mixc(cu, C.gold, .4), .4, { n: 0, jit: .5 });
      curve(S, arcPts(0, -34, 92, 20, 18, -.2, PI + .2), 1.8, .7);
      return fin(S, sc, { top: [0, -56] });
    }
    const T0 = [[-108, -92], [108, -92], [126, -106], [-90, -106]];
    contact(S, -110, 130, .2);
    // back legs, then the top, apron and front legs
    for (const x of [-80, 118]) face(S, box(x - 4, -100, x + 4, -16), wd, { a: .8, tex: false });
    if (style === 'desk') {
      face(S, box(30, -90, 104, -4), wood, { a: .85 });
      wash(S, sideF(104, -90, -4, [18, -14]), wd, .7, { n: 1 });
      for (const y of [-64, -36, -8]) { line(S, 34, y, 100, y, 1.4, wd, .6); S.push(mk(qcurve(64, y - 13, 70, y - 13, 0, 3), 5, C.gold, { prof: 'leaf', nb: 0, a: .9 })); }
    }
    face(S, T0, wl, { a: .85, gap: 5 });
    rows(S, T0, mixc(wood, C.ink, .2), { gap: 4, w: 1.2, a: .3, broken: .4, nb: 0 });
    face(S, box(-108, -92, 108, -76), wood, { a: .88, tex: false });
    wash(S, [[108, -92], [126, -106], [126, -90], [108, -76]], wd, .8, { n: 1 });
    for (const x of [-100, 100]) {
      if (style === 'desk' && x > 0) continue;
      face(S, box(x - 6, -76, x + 6, 0), wood, { a: .88, tex: false });
      for (const y of [-60, -24]) S.push(mk(qcurve(x - 7, y, x + 7, y, 0, 3), 4, wd, { prof: 'leaf', nb: 0, a: .6 }));
      line(S, x + 6, -76, x + 6, 0, 1.4, C.ink, .55, { bend: 0 });
    }
    if (o.cloth) {
      const cl = T(o.clothCol, C.cloth), hem = [];
      for (let i = 0; i <= 10; i++) { const x = -112 + i * 22.4; hem.push([x, -50 + Math.sin(i * 1.7) * 6]); }
      face(S, [[-90, -108], [126, -108], [130, -88]].concat(hem.slice().reverse().map(([x, y]) => [x, y])).concat([[-112, -90]]), cl, { a: .8, dir: 'v', gap: 12 });
      curve(S, hem, 1.4, .55, C.ink, 4);
    }
    pen(S, [[-108, -92], [108, -92], [126, -106]], 1.6, .7); pen(S, [[-108, -76], [108, -76]], 1.4, .55);
    return fin(S, sc, { top: [0, -106] });
  };

  // chair — a wooden chair in three-quarter view, about 135 px. o: {style: 'western' (default: turned legs, slatted
  //   back) | 'stool', col: wood token, cushion: token}
  G.chair = (sc, o = {}) => {
    const S = [], wood = T(o.col, mixc(C.wood, C.paper, .15)), wd = mixc(wood, C.ink, .35);
    contact(S, -36, 48, .18);
    if (o.style === 'stool') {
      for (const [x0, x1] of [[-26, -30], [26, 30], [4, 6]]) line(S, x0 * .7, -54, x1, 0, 5, x1 === 6 ? wd : wood, .88, { bend: 0 });
      face(S, arcPts(0, -56, 32, 10, 14, 0, 2 * PI).slice(0, 14), wood, { a: .9, tex: false });
      wash(S, arcPts(0, -54, 32, 10, 10, 0, PI).concat([[-32, -54]]), wd, .55, { n: 0, jit: .5 });
      curve(S, arcPts(0, -56, 32, 10, 14, -.2, PI + .2), 1.4, .65);
      return fin(S, sc, { top: [0, -66] });
    }
    for (const [x, yt] of [[-14, -128], [42, -134]]) line(S, x, -14 + (x > 0 ? -6 : 0), x - 2, yt, 5, wd, .88, { bend: 0 });
    line(S, -16, -128, 40, -134, 6, wood, .9); line(S, -15, -100, 41, -106, 3.5, wood, .85);
    for (const f of [.25, .5, .75]) line(S, -15 + 56 * f, -66 - 6 * f, -16 + 56 * f, -101 - 6 * f, 4, wood, .8, { bend: 0 });
    const seat = [[-32, -52], [30, -52], [46, -64], [-16, -64]];
    face(S, seat, wood, { a: .9, tex: false });
    if (o.cushion) wash(S, [[-28, -55], [27, -55], [42, -64], [-13, -64]], T(o.cushion, C.cloth), .85, { n: 1 });
    wash(S, box(-32, -52, 30, -46), wd, .8, { n: 1 });
    for (const x of [-28, 26]) { line(S, x, -46, x, 0, 6, wood, .9, { bend: 0 }); S.push(mk(qcurve(x - 5, -30, x + 5, -30, 0, 3), 4, wd, { prof: 'leaf', nb: 0, a: .7 })); }
    line(S, -28, -16, 26, -16, 2.4, wd, .7);
    pen(S, [[-32, -52], [30, -52], [46, -64]], 1.4, .7);
    return fin(S, sc, { top: [14, -134] });
  };

  // throne — o: {style: 'european' (default: a high gilded back with a velvet panel, cushion and arms, on a stepped dais
  //   with a runner, ~250 px) | 'ottoman' (a broad gilded seat with a low cresting, cushions and bolsters, on a carpet,
  //   ~170 × 230 px), cloth: velvet token (default the red accent)}
  G.throne = (sc, o = {}) => {
    const S = [], gold = mixc(C.gold, C.wood, .3), gd = mixc(gold, C.ink, .35), vel = T(o.cloth, mixc(C.red, C.cloth, .4)), vd = mixc(vel, C.ink, .3);
    const stone = mixc(C.stone, C.paper, .15);
    if (o.style === 'ottoman') {
      // a broad gilded seat on short legs, a low jewelled back with a cresting, arms, cushions and bolsters, on a carpet
      contact(S, -136, 136, .2);
      face(S, box(-136, -10, 136, 0), mixc(C.cloth, C.paper, .1), { a: .85, tex: false });
      for (let x = -126; x < 126; x += 18) S.push(mk(qcurve(x, -5, x + 9, -5, 0, 3), 4, pick([C.gold, C.clothB, C.paperLight]), { prof: 'leaf', nb: 0, a: .65 }));
      const bk = [[-100, -96]]; for (let i = 0; i <= 10; i++) bk.push([-100 + i * 20, -150 - (i % 2 ? 10 : 0) + (i === 5 ? -10 : 0)]); bk.push([100, -96]);
      face(S, bk, gold, { a: .86, gap: 8 });
      for (let x = -88; x <= 88; x += 22) for (let y = -136; y <= -104; y += 16) S.push(mk(qcurve(x + (y % 32 ? 11 : 0) - 2, y, x + (y % 32 ? 11 : 0) + 2, y, 0, 3), 5, pick([vel, C.leafDark, C.clothB, mixc(C.gold, C.paperLight, .4)]), { prof: 'leaf', nb: 0, a: .85 }));
      for (let x = -90; x <= 90; x += 22) { line(S, x, -98, x + 22, -146, .9, gd, .35); line(S, x + 22, -98, x, -146, .9, gd, .35); }
      for (const x of [-100, -60, -20, 20, 60, 100]) finial(S, x, -150 - (x === -20 || x === 20 ? 4 : 0), 10, 'ball');
      face(S, box(-104, -74, 104, -40), gold, { a: .88, tex: false });
      for (let x = -92; x <= 92; x += 23) S.push(washShape(arcPts(x, -40, 11, 9, 6, PI, 2 * PI), gd, .55, 1, .3));
      for (const x of [-94, -40, 40, 94]) S.push(mk(qcurve(x, -40, x + Math.sign(x) * 4, -2, Math.sign(x) * 3, 5), 9, gd, { prof: 'trunk', nb: 0, a: .9 }));
      face(S, box(-100, -88, 100, -74), vel, { a: .9, tex: false });
      for (const [x, cc] of [[-48, mixc(C.clothB, C.paper, .1)], [0, vel], [48, mixc(C.clothC, C.paper, .1)]]) { S.push(mk(qcurve(x, -90, x, -126, 0, 5), 40, cc, { prof: 'leaf', nb: 3, a: .9 })); line(S, x + 18, -96, x + 14, -122, 1, C.ink, .35); }
      for (const s2 of [-1, 1]) {
        face(S, box(s2 > 0 ? 96 : -114, -126, s2 > 0 ? 114 : -96, -74), gold, { a: .9, tex: false });
        finial(S, s2 * 105, -126, 12, 'ball');
        S.push(mk(qcurve(s2 * 82, -100, s2 * 82, -78, 0, 4), 24, mixc(vel, C.ink, .15), { prof: 'even', nb: 2, a: .9 }));
      }
      pen(S, [[-104, -74], [104, -74], [104, -40]], 1.5, .65); pen(S, [[-114, -126], [-96, -126]], 1.2, .5); curve(S, bk.slice(1, -1), 1.3, .55, C.ink, 4);
      return fin(S, sc, { top: [0, -172] });
    }
    contact(S, -120, 120, .2);
    face(S, box(-118, -20, 118, 0), stone, { a: .8, tex: false });
    face(S, box(-94, -40, 94, -20), stone, { a: .82, tex: false });
    wash(S, [[-30, 0], [30, 0], [26, -40], [-26, -40]], vel, .75, { n: 1 });
    pen(S, [[-118, -20], [118, -20], [118, 0]], 1.4, .6); pen(S, [[-94, -40], [94, -40], [94, -20]], 1.4, .6);
    const back = [[-50, -96], [50, -96], [50, -208], [30, -222], [0, -240], [-30, -222], [-50, -208]];
    face(S, back, gold, { a: .88, gap: 9 });
    face(S, [[-36, -100], [36, -100], [36, -200], [0, -222], [-36, -200]], vel, { a: .8, dir: 'v', gap: 10 });
    for (const x of [-50, 50]) S.push(mk(qcurve(x, -212, x, -228, 0, 3), 12, gold, { prof: 'leaf', nb: 2, a: .9 }));
    S.push(mk(qcurve(0, -240, 0, -256, 0, 3), 12, gold, { prof: 'leaf', nb: 2, a: .9 }));
    for (const s of [-1, 1]) {
      face(S, [[s * 52, -98], [s * 72, -98], [s * 72, -132], [s * 56, -140]], gold, { a: .9, tex: false });
      line(S, s * 66, -98, s * 66, -44, 7, gd, .85, { bend: 0 });
    }
    face(S, box(-60, -100, 60, -78), vel, { a: .9, tex: false });
    face(S, box(-62, -78, 62, -62), gold, { a: .9, tex: false });
    for (const x of [-56, 56]) line(S, x, -62, x, -40, 8, gd, .9, { bend: 0 });
    pen(S, back.slice(1).concat([back[0]]), 1.6, .65);
    pen(S, [[-60, -100], [60, -100], [62, -62]], 1.4, .6);
    return fin(S, sc, { top: [0, -256] });
  };

  // shelf — a bookcase, about 230 × 170 px. o: {style: 'books' (default: leather spines, some leaning, a stack lying
  //   flat) | 'scrolls' (pigeonholes with rolled scrolls, an Ottoman / ancient library), rows: 3–6 (4), w, col: wood}
  G.shelf = (sc, o = {}) => {
    const S = [], w = o.w ?? 1, W = 170 * w, H = 230, nr = Math.max(2, Math.min(6, o.rows ?? 4));
    const wood = T(o.col, mixc(C.wood, C.paper, .15)), wd = mixc(wood, C.ink, .35), back = mixc(C.wood, C.ink, .55), x0 = -W / 2, x1 = W / 2;
    contact(S, x0, x1 + 10, .2);
    face(S, box(x0, -H, x1, 0), wood, { a: .85, dir: 'v' });
    wash(S, box(x0 + 9, -H + 10, x1 - 9, -10), back, .72, { n: 2 });
    const sh = (H - 26) / nr, cols = [C.cloth, C.clothB, C.clothC, mixc(C.wood, C.ink, .2), C.leafDark, mixc(C.roof, C.ink, .2)];
    for (let r = 0; r < nr; r++) {
      const yb = -12 - r * sh, top = yb - sh + 6;
      if (o.style === 'scrolls') {
        const nc = Math.max(2, Math.round(W / 42));
        for (let i = 1; i < nc; i++) line(S, x0 + 9 + (W - 18) * i / nc, yb, x0 + 9 + (W - 18) * i / nc, top - 4, 4, wood, .9, { bend: 0 });
        for (let i = 0; i < nc; i++) {
          const cx = x0 + 9 + (W - 18) * (i + .5) / nc, cw2 = (W - 18) / nc;
          const rr = Math.min(7, (sh - 10) / 7), len = cw2 * .8, nk = Math.max(2, Math.floor((sh - 12) / (rr * 2.05)));
          for (let k = 0; k < nk; k++) {
            const sx = cx - len / 2 + rnd(-3, 3), y2 = yb - rr - 1 - k * rr * 2.05, tie = sx + len * rnd(.3, .6);
            const roll = mixc(C.paperLight, pick([C.clothC, C.stone, C.skyWarm]), rnd(.15, .45));
            S.push(washShape(box(sx, y2 - rr, sx + len, y2 + rr), roll, .9, 1, .3));
            line(S, tie, y2 - rr, tie + 1, y2 + rr, 1.8, pick([C.red, C.clothB, C.wood]), .75, { bend: 0 });
            S.push(washShape(arcPts(sx + len, y2, rr * .45, rr, 8, 0, 2 * PI).slice(0, 8), mixc(roll, C.paperLight, .3), .95, 1, .2));
            curve(S, arcPts(sx + len, y2, rr * .45, rr, 8, 0, 2 * PI), .9, .55, C.inkSoft, 8);
          }
        }
      } else {
        let x = x0 + 11;
        const lean = rnd() < .7, flat = rnd() < .45 ? rnd(x0 + 20, x1 - 50) : null;
        while (x < x1 - 14) {
          if (flat != null && x > flat && x < flat + 12) {
            for (let k = 0; k < 3; k++) { const bh = rnd(7, 9), bw = rnd(34, 42), y = yb - k * bh; wash(S, box(x, y - bh, x + bw, y), pick(cols), .85, { n: 1, jit: .4 }); line(S, x, y - 1, x + bw, y - 1, 1, C.gold, .6); }
            x += 46; continue;
          }
          const bw = rnd(6, 11), bh = sh * rnd(.66, .9), c2 = pick(cols);
          if (lean && x > x1 - 40) {
            const a = .25, pts = [[x, yb], [x + bw, yb], [x + bw + Math.sin(a) * bh, yb - Math.cos(a) * bh], [x + Math.sin(a) * bh, yb - Math.cos(a) * bh]];
            wash(S, pts, c2, .88, { n: 1, jit: .4 }); x += bw + bh * Math.sin(a) + 4; break;
          }
          wash(S, box(x, yb - bh, x + bw, yb), c2, .88, { n: 1, jit: .4 });
          if (bw > 7) for (const f of [.15, .85]) line(S, x + 1, yb - bh * f, x + bw - 1, yb - bh * f, 1, C.gold, .65, { bend: 0 });
          line(S, x + bw, yb - bh, x + bw, yb, .9, C.ink, .45, { bend: 0 });
          x += bw + rnd(0, 1.5);
        }
      }
      face(S, box(x0 + 6, yb, x1 - 6, yb + 6), wl(wood), { a: .9, tex: false });
      line(S, x0 + 8, yb + 6, x1 - 8, yb + 6, 1.2, wd, .6);
    }
    face(S, box(x0 - 8, -H - 12, x1 + 8, -H), wood, { a: .9, tex: false });
    face(S, box(x0 - 4, -10, x1 + 4, 0), wd, { a: .85, tex: false });
    pen(S, [[x0 - 8, -H - 12], [x1 + 8, -H - 12], [x1 + 8, -H]], 1.6, .7); pen(S, [[x1, -H], [x1, 0]], 1.8, .7);
    return fin(S, sc, { top: [0, -H - 12] });
  };
  const wl = c => mixc(c, C.paperLight, .2);
})();
